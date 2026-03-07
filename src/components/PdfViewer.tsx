import { useEffect, useRef, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, Download, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackAnalyticsView } from '@/lib/analytics';
import { resolvePdfUrl } from '@/lib/pdfUrl';

interface PdfViewerProps {
  pdfPath: string;
  title?: string;
  analyticsEntityId?: string;
  analyticsLabel?: string;
  analyticsPath?: string;
}

export default function PdfViewer({
  pdfPath,
  title,
  analyticsEntityId,
  analyticsLabel,
  analyticsPath,
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderedPages, setRenderedPages] = useState<Set<number>>(new Set());
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());

  const pdfUrl = resolvePdfUrl(pdfPath);

  const trackDownload = useCallback(() => {
    if (!analyticsEntityId) return;

    void trackAnalyticsView({
      entityType: 'download',
      entityId: analyticsEntityId,
      label: analyticsLabel || title || analyticsEntityId,
      path: analyticsPath || '',
    });
  }, [analyticsEntityId, analyticsLabel, analyticsPath, title]);

  // Load PDF document
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setRenderedPages(new Set());
    canvasRefs.current.clear();

    async function loadPdf() {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        if (!cancelled) {
          setPdfDoc(pdf);
          setNumPages(pdf.numPages);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Nu s-a putut încărca PDF-ul.');
          setLoading(false);
          console.error('PDF load error:', err);
        }
      }
    }

    loadPdf();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  // Render a single page onto its canvas
  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDoc || !containerRef.current) return;
    const canvas = canvasRefs.current.get(pageNum);
    if (!canvas) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const containerWidth = containerRef.current.clientWidth - 32;
      const naturalViewport = page.getViewport({ scale: 1 });
      const fitScale = containerWidth / naturalViewport.width;
      const effectiveScale = fitScale * scale;

      const viewport = page.getViewport({ scale: effectiveScale });
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      ctx.scale(dpr, dpr);

      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Render error page', pageNum, err);
      }
    }
  }, [pdfDoc, scale]);

  // Render all pages when doc loads or scale changes
  useEffect(() => {
    if (!pdfDoc || numPages === 0) return;

    setRenderedPages(new Set());

    // Small delay to let canvases mount
    const timer = setTimeout(() => {
      const promises: Promise<void>[] = [];
      for (let i = 1; i <= numPages; i++) {
        promises.push(renderPage(i));
      }
      Promise.all(promises).then(() => {
        const allPages = new Set<number>();
        for (let i = 1; i <= numPages; i++) allPages.add(i);
        setRenderedPages(allPages);
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [pdfDoc, numPages, scale, renderPage]);

  const setCanvasRef = useCallback((pageNum: number) => (el: HTMLCanvasElement | null) => {
    if (el) {
      canvasRefs.current.set(pageNum, el);
    } else {
      canvasRefs.current.delete(pageNum);
    }
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border bg-card shadow-sm p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Se încarcă PDF-ul...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card shadow-sm p-8 flex flex-col items-center justify-center gap-3 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button asChild variant="outline" size="sm">
          <a href={pdfUrl} target="_blank" rel="noreferrer" onClick={trackDownload}>
            <Download className="mr-2 h-4 w-4" /> Deschide direct
          </a>
        </Button>
      </div>
    );
  }

  const pages = Array.from({ length: numPages }, (_, i) => i + 1);

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden" ref={containerRef}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-secondary/50 gap-2 flex-wrap sticky top-0 z-10">
        <span className="font-serif text-sm font-bold truncate max-w-[200px] md:max-w-none">
          {title || 'PDF'}
        </span>

        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground font-mono mr-2">
            {numPages} {numPages === 1 ? 'pagină' : 'pagini'}
          </span>

          <Button
            variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[40px] text-center font-mono">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => setScale(s => Math.min(3, s + 0.25))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          <Button asChild variant="outline" size="sm" className="h-8 text-xs">
            <a href={pdfUrl} target="_blank" rel="noreferrer" onClick={trackDownload}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Descarcă
            </a>
          </Button>
        </div>
      </div>

      {/* Continuous scroll area */}
      <div
        ref={canvasContainerRef}
        className="overflow-auto bg-muted/30 flex flex-col items-center gap-2 p-4"
        style={{ maxHeight: '85vh' }}
      >
        {pages.map(pageNum => (
          <canvas
            key={`page-${pageNum}-${scale}`}
            ref={setCanvasRef(pageNum)}
            className="shadow-lg max-w-full"
          />
        ))}
      </div>
    </div>
  );
}
