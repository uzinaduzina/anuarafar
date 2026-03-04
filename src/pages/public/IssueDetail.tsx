import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import { getIssueBySlug } from '@/data/issues';
import { getArticlesByIssueId } from '@/data/articles';
import { SeriesBadge } from '@/components/SeriesBadge';
import { JOURNAL } from '@/data/journal';
import { SeriesId } from '@/data/types';
import { Button } from '@/components/ui/button';

const coverGradients: Record<SeriesId, string> = {
  'seria-1': 'from-[hsl(145,30%,35%)] via-[hsl(145,30%,50%)] to-[hsl(145,30%,80%)]',
  'seria-2': 'from-[hsl(215,35%,30%)] via-[hsl(215,35%,50%)] to-[hsl(215,35%,80%)]',
  'seria-3': 'from-[hsl(36,55%,16%)] via-[hsl(40,76%,55%)] to-[hsl(33,50%,88%)]',
};

export default function IssueDetail() {
  const { slug } = useParams();
  const issue = getIssueBySlug(slug || '');

  if (!issue) {
    return (
      <div className="container py-16 text-center">
        <h1 className="font-serif text-2xl font-bold mb-4">Număr negăsit</h1>
        <Link to="/archive" className="text-primary hover:underline">← Înapoi la arhivă</Link>
      </div>
    );
  }

  const articles = getArticlesByIssueId(issue.id);

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
              <div className="text-[0.6rem] uppercase tracking-[0.1em] opacity-80 mb-2">
                ISSN {JOURNAL.issn}
              </div>
              <SeriesBadge series={issue.series} className="mb-3" />
            </div>
            <div>
              <div className="font-serif text-xl font-bold leading-tight">{issue.title}</div>
              <div className="text-sm opacity-80 mt-2">
                Vol. {issue.volume} · {issue.year}
              </div>
            </div>
          </div>

          {/* Meta info */}
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md border p-2.5 bg-card">
                <div className="text-[0.6rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">An</div>
                <div className="font-semibold">{issue.year}</div>
              </div>
              <div className="rounded-md border p-2.5 bg-card">
                <div className="text-[0.6rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Volum</div>
                <div className="font-semibold">{issue.volume}</div>
              </div>
              <div className="rounded-md border p-2.5 bg-card">
                <div className="text-[0.6rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Articole</div>
                <div className="font-semibold">{issue.article_count}</div>
              </div>
              <div className="rounded-md border p-2.5 bg-card">
                <div className="text-[0.6rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Pagini</div>
                <div className="font-semibold">{issue.pages || '—'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* TOC */}
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <div>
              <h1 className="font-serif text-xl font-bold">Cuprins</h1>
              <p className="text-sm text-muted-foreground mt-1">{articles.length} articole</p>
            </div>
          </div>
          <div className="divide-y">
            {articles.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Acest număr conține doar PDF-ul integral.</p>
                <p className="text-sm mt-1">Articolele individuale nu au fost încă indexate.</p>
              </div>
            ) : (
              articles.map(article => (
                <Link
                  key={article.id}
                  to={`/article/${article.id}`}
                  className="flex gap-5 p-4 hover:bg-accent/50 transition-colors group"
                >
                  <div className="text-[0.78rem] text-muted-foreground font-mono min-w-[60px] pt-0.5">
                    pp. {article.pages_start}–{article.pages_end}
                  </div>
                  <div className="flex-1">
                    <div className="font-serif font-bold text-primary group-hover:text-primary/80 transition-colors leading-snug">
                      {article.title}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{article.authors}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
