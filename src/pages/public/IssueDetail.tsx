import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { useJournalData } from '@/data/JournalDataProvider';
import { SeriesBadge } from '@/components/SeriesBadge';
import { JOURNAL } from '@/data/journal';
import { SeriesId } from '@/data/types';
import PdfViewer from '@/components/PdfViewer';

const coverGradients: Record<SeriesId, string> = {
  'seria-1': 'from-[hsl(145,30%,35%)] via-[hsl(145,30%,50%)] to-[hsl(145,30%,80%)]',
  'seria-2': 'from-[hsl(215,35%,30%)] via-[hsl(215,35%,50%)] to-[hsl(215,35%,80%)]',
  'seria-3': 'from-[hsl(36,55%,16%)] via-[hsl(40,76%,55%)] to-[hsl(33,50%,88%)]',
};

export default function IssueDetail() {
  const { slug } = useParams();
  const { issues, articles, loading } = useJournalData();

  if (loading) {
    return (
      <div className="container py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const issue = issues.find(i => i.slug === slug);
  if (!issue) {
    return (
      <div className="container py-16 text-center">
        <h1 className="font-serif text-2xl font-bold mb-4">Număr negăsit</h1>
        <Link to="/archive" className="text-primary hover:underline">← Înapoi la arhivă</Link>
      </div>
    );
  }

  const issueArticles = articles
    .filter(a => a.issue_id === issue.id)
    .sort((a, b) => (parseInt(a.pages_start) || 0) - (parseInt(b.pages_start) || 0));

  // Group articles by section
  const sections: { name: string; articles: typeof issueArticles }[] = [];
  let currentSection = '';
  for (const art of issueArticles) {
    const sec = art.section || '';
    if (sec !== currentSection) {
      currentSection = sec;
      sections.push({ name: sec, articles: [] });
    }
    if (sections.length === 0) sections.push({ name: '', articles: [] });
    sections[sections.length - 1].articles.push(art);
  }

  return (
    <div className="container py-8 md:py-12">
      <Link to="/archive" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Înapoi la arhivă
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        {/* Cover sidebar */}
        <div>
          <div className={`rounded-lg bg-gradient-to-br ${coverGradients[issue.series]} text-white p-5 aspect-[3/4] flex flex-col justify-between shadow-lg`}>
            <div>
              <div className="text-[0.6rem] uppercase tracking-[0.1em] opacity-80 mb-2">ISSN {JOURNAL.issn}</div>
              <SeriesBadge series={issue.series} className="mb-3" />
            </div>
            <div>
              <div className="font-serif text-xl font-bold leading-tight">{issue.title}</div>
              <div className="text-sm opacity-80 mt-2">Vol. {issue.volume} · {issue.year}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {[
              { label: 'An', value: issue.year },
              { label: 'Volum', value: issue.volume },
              { label: 'Articole', value: issueArticles.length || issue.article_count },
              { label: 'Pagini', value: issue.pages || '—' },
            ].map((m, i) => (
              <div key={i} className="rounded-md border p-2.5 bg-card">
                <div className="text-[0.6rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">{m.label}</div>
                <div className="font-semibold">{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TOC */}
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="p-5 border-b">
            <h1 className="font-serif text-xl font-bold">Cuprins</h1>
            <p className="text-sm text-muted-foreground mt-1">{issueArticles.length} articole</p>
          </div>

          {issueArticles.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Acest număr conține doar PDF-ul integral.</p>
              <p className="text-sm mt-1">Articolele individuale nu au fost încă indexate.</p>
            </div>
          ) : (
            <div>
              {sections.map((section, si) => (
                <div key={si}>
                  {section.name && (
                    <div className="px-5 py-3 bg-secondary/50 border-b border-t text-xs uppercase tracking-[0.08em] font-semibold text-muted-foreground">
                      {section.name}
                    </div>
                  )}
                  <div className="divide-y">
                    {section.articles.map(article => (
                      <Link
                        key={article.id}
                        to={`/article/${article.id}`}
                        className="flex gap-5 p-4 hover:bg-accent/50 transition-colors group"
                      >
                        <div className="text-[0.78rem] text-muted-foreground font-mono min-w-[60px] pt-0.5">
                          {article.pages_start && article.pages_end
                            ? `pp. ${article.pages_start}–${article.pages_end}`
                            : ''}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-serif font-bold text-primary group-hover:text-primary/80 transition-colors leading-snug">
                            {article.title}
                          </div>
                          {article.authors && article.authors !== 'N/A' && (
                            <div className="text-sm text-muted-foreground mt-1">{article.authors}</div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Issue PDF Viewer */}
      {issue.issue_pdf_path && (
        <div className="mt-8">
          <PdfViewer pdfPath={issue.issue_pdf_path} title={`${issue.title} — PDF integral`} />
        </div>
      )}
    </div>
  );
}
