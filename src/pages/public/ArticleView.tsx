import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Eye, Loader2, Pencil } from 'lucide-react';
import { useJournalData } from '@/data/JournalDataProvider';
import { useAuth } from '@/contexts/AuthContext';
import { SeriesBadge } from '@/components/SeriesBadge';
import { SeriesId, SERIES_CONFIG } from '@/data/types';
import { Button } from '@/components/ui/button';
import PdfViewer from '@/components/PdfViewer';
import ArticleEditDrawer from '@/components/ArticleEditDrawer';
import { fetchAnalyticsSummary, trackAnalyticsView, type AnalyticsSummary } from '@/lib/analytics';

const seriesBorderLeft: Record<SeriesId, string> = {
  'seria-1': 'border-l-[4px] border-l-series-1',
  'seria-2': 'border-l-[4px] border-l-series-2',
  'seria-3': 'border-l-[4px] border-l-series-3',
};

const seriesAccentBg: Record<SeriesId, string> = {
  'seria-1': 'bg-series-1-bg/40',
  'seria-2': 'bg-series-2-bg/40',
  'seria-3': 'bg-series-3-bg/40',
};

const seriesKwBg: Record<SeriesId, string> = {
  'seria-1': 'bg-series-1-bg border-series-1-border text-series-1-foreground',
  'seria-2': 'bg-series-2-bg border-series-2-border text-series-2-foreground',
  'seria-3': 'bg-series-3-bg border-series-3-border text-series-3-foreground',
};

export default function ArticleView() {
  const { id } = useParams();
  const { issues, articles, loading } = useJournalData();
  const { isEditor, isAdmin } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [articleAnalytics, setArticleAnalytics] = useState<AnalyticsSummary | null>(null);
  const article = articles.find(a => a.id === id);

  useEffect(() => {
    let cancelled = false;

    if (!article) {
      setArticleAnalytics(null);
      return () => {
        cancelled = true;
      };
    }

    const load = async () => {
      const tracked = await trackAnalyticsView({
        entityType: 'article',
        entityId: article.id,
        label: article.title,
        path: `/article/${article.id}`,
      });
      const summary = tracked ?? await fetchAnalyticsSummary('article', article.id);
      if (!cancelled) {
        setArticleAnalytics(summary);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [article?.id, article?.title]);

  if (loading) {
    return (
      <div className="container py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container py-16 text-center">
        <h1 className="font-serif text-2xl font-bold mb-4">Articol negăsit</h1>
        <Link to="/archive" className="text-primary hover:underline">← Înapoi la arhivă</Link>
      </div>
    );
  }

  const issue = issues.find(i => i.id === article.issue_id);
  const abstractText = (article.abstract_ro || article.abstract_en || '').trim();
  const keywords = (article.keywords_ro || '').split(',').map(k => k.trim()).filter(Boolean);
  const authors = article.authors.split(',').map(a => a.trim()).filter(a => a && a !== 'N/A');
  const issueArticles = articles
    .filter((entry) => entry.issue_id === article.issue_id)
    .sort((a, b) => (parseInt(a.pages_start, 10) || 0) - (parseInt(b.pages_start, 10) || 0));
  const currentIndex = issueArticles.findIndex((entry) => entry.id === article.id);
  const previousArticle = currentIndex > 0 ? issueArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex >= 0 && currentIndex < issueArticles.length - 1 ? issueArticles[currentIndex + 1] : null;

  const series = issue?.series || article.series;

  return (
    <div className="container py-8 md:py-12 max-w-4xl">
      {issue && (
        <Link
          to={`/archive/${issue.slug}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> {issue.title}
        </Link>
      )}

      {/* Article hero */}
      <div className={`rounded-lg border bg-card p-6 md:p-8 mb-6 shadow-sm ${seriesBorderLeft[series]}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {issue && <SeriesBadge series={issue.series} />}
            <span className="text-xs text-muted-foreground">
              {issue && `Vol. ${issue.volume} · ${issue.year}`}
            </span>
            {article.section && (
              <span className="text-xs text-muted-foreground">· {article.section}</span>
            )}
          </div>
          {(isEditor || isAdmin) && (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-3 w-3" /> Editează
            </Button>
          )}
        </div>

        <h1 className="font-serif text-2xl md:text-3xl font-bold leading-tight mb-5">
          {article.title}
        </h1>

        {authors.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-5">
            {authors.map((author, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-sm font-medium">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[0.6rem] font-bold">
                  {author.split(/\s+/).map(w => w.charAt(0).toUpperCase()).join('')}
                </span>
                {author}
              </span>
            ))}
          </div>
        )}

        {article.affiliations && (
          <p className="text-sm text-muted-foreground mb-4">{article.affiliations}</p>
        )}

        <div className="flex flex-wrap gap-6 py-4 border-y text-sm">
          {article.pages_start && (
            <div>
              <div className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Pagini</div>
              <div className="font-medium">{article.pages_start}–{article.pages_end}</div>
            </div>
          )}
          <div>
            <div className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Limba</div>
            <div className="font-medium">{article.language === 'ro' ? 'Română' : article.language}</div>
          </div>
          {article.doi && (
            <div>
              <div className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">DOI</div>
              <div className="font-medium text-primary">{article.doi}</div>
            </div>
          )}
        </div>
      </div>

      {/* Abstract */}
      {abstractText && (
        <div className={`rounded-lg border p-6 md:p-8 mb-6 shadow-sm ${seriesAccentBg[series]}`}>
          <h2 className="font-serif text-lg font-bold mb-3">Rezumat</h2>
          <p className="text-sm leading-relaxed text-foreground/90">{abstractText}</p>
        </div>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <div className="rounded-lg border bg-card p-6 mb-6 shadow-sm">
          <h2 className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold mb-3">Cuvinte cheie</h2>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, i) => (
              <span key={i} className={`px-3 py-1 rounded-sm text-sm border ${seriesKwBg[series]}`}>{kw}</span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {previousArticle && (
            <Button asChild size="sm" variant="outline">
              <Link to={`/article/${previousArticle.id}`}>Articol anterior</Link>
            </Button>
          )}
          {nextArticle && (
            <Button asChild size="sm" variant="outline">
              <Link to={`/article/${nextArticle.id}`}>Articol următor</Link>
            </Button>
          )}
        </div>

        <div className="ml-auto grid grid-cols-2 gap-2 text-right sm:grid-cols-4">
          {[
            { label: 'Ultima zi', value: articleAnalytics?.lastDay },
            { label: 'Ultima săptămână', value: articleAnalytics?.lastWeek },
            { label: 'Ultima lună', value: articleAnalytics?.lastMonth },
            { label: 'Total', value: articleAnalytics?.total },
          ].map((item) => (
            <div key={item.label} className="min-w-[112px] rounded-md border bg-card px-3 py-2 shadow-sm">
              <div className="flex items-center justify-end gap-1 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                <Eye className="h-3 w-3" />
                <span>{item.label}</span>
              </div>
              <div className="mt-1 text-sm font-semibold tabular-nums">
                {typeof item.value === 'number' ? item.value.toLocaleString('ro-RO') : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PDF Viewer */}
      {article.pdf_path ? (
        <PdfViewer
          pdfPath={article.pdf_path}
          title={article.title}
          analyticsEntityId={article.id}
          analyticsLabel={article.title}
          analyticsPath={`/article/${article.id}`}
        />
      ) : (
        <div className="rounded-lg border bg-card p-8 shadow-sm text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">PDF indisponibil pentru acest articol</p>
        </div>
      )}

      {/* Edit drawer */}
      <ArticleEditDrawer article={article} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
