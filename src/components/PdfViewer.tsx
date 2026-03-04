import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GITHUB_BASE = 'https://raw.githubusercontent.com/liviupop/ojs_alternative_iafar/main/';

interface PdfViewerProps {
  pdfPath: string;
  title?: string;
}

export default function PdfViewer({ pdfPath, title }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0); // 1.0 = fit to width
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const renderTaskRef = useRef<any>(null);

  const pdfUrl = pdfPath.startsWith('http') ? pdfPath : `${GITHUB_BASE}${pdfPath}`;

  // Load PDF document
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

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
          setPageNum(1);
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

  // Render current page — fit to container width, preserve aspect ratio
  const renderPage = useCallback(async (num: number) => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch {}
    }

    try {
      const page = await pdfDoc.getPage(num);
      const containerWidth = containerRef.current.clientWidth - 32; // minus padding

      // Get the page's natural viewport to compute aspect ratio
      const naturalViewport = page.getViewport({ scale: 1 });
      const fitScale = containerWidth / naturalViewport.width;
      const effectiveScale = fitScale * scale;

      const viewport = page.getViewport({ scale: effectiveScale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Use devicePixelRatio for crisp rendering
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      ctx.scale(dpr, dpr);

      const renderTask = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = renderTask;
      await renderTask.promise;
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Render error:', err);
      }
    }
  }, [pdfDoc, scale]);

  useEffect(() => {
    renderPage(pageNum);
  }, [pageNum, renderPage]);

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
          <a href={pdfUrl} target="_blank" rel="noreferrer">
            <Download className="mr-2 h-4 w-4" /> Deschide direct
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-secondary/50 gap-2 flex-wrap">
        <span className="font-serif text-sm font-bold truncate max-w-[200px] md:max-w-none">
          {title || 'PDF'}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="icon" className="h-8 w-8"
            disabled={pageNum <= 1}
            onClick={() => setPageNum(p => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[70px] text-center font-mono">
            {pageNum} / {numPages}
          </span>
          <Button
            variant="ghost" size="icon" className="h-8 w-8"
            disabled={pageNum >= numPages}
            onClick={() => setPageNum(p => Math.min(numPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

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
            <a href={pdfUrl} target="_blank" rel="noreferrer">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Descarcă
            </a>
          </Button>
        </div>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="overflow-auto bg-muted/30 flex justify-center p-4"
        style={{ maxHeight: '85vh' }}
      >
        <canvas ref={canvasRef} className="shadow-lg max-w-full" />
      </div>
    </div>
  );
}
