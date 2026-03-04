import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { useJournalData } from '@/data/JournalDataProvider';
import { SeriesBadge } from '@/components/SeriesBadge';
import PdfViewer from '@/components/PdfViewer';

export default function ArticleView() {
  const { id } = useParams();
  const { issues, articles, loading } = useJournalData();

  if (loading) {
    return (
      <div className="container py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const article = articles.find(a => a.id === id);
  if (!article) {
    return (
      <div className="container py-16 text-center">
        <h1 className="font-serif text-2xl font-bold mb-4">Articol negăsit</h1>
        <Link to="/archive" className="text-primary hover:underline">← Înapoi la arhivă</Link>
      </div>
    );
  }

  const issue = issues.find(i => i.id === article.issue_id);
  const keywords = (article.keywords_ro || '').split(',').map(k => k.trim()).filter(Boolean);
  const authors = article.authors.split(',').map(a => a.trim()).filter(a => a && a !== 'N/A');

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
      <div className="rounded-lg border bg-card p-6 md:p-8 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          {issue && <SeriesBadge series={issue.series} />}
          <span className="text-xs text-muted-foreground">
            {issue && `Vol. ${issue.volume} · ${issue.year}`}
          </span>
          {article.section && (
            <span className="text-xs text-muted-foreground">· {article.section}</span>
          )}
        </div>

        <h1 className="font-serif text-2xl md:text-3xl font-bold leading-tight mb-5">
          {article.title}
        </h1>

        {authors.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-5">
            {authors.map((author, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-sm font-medium">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  {author.charAt(0)}
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
      {(article.abstract_ro || article.abstract_en) && (
        <div className="rounded-lg border bg-card p-6 md:p-8 mb-6 shadow-sm">
          {article.abstract_ro && (
            <>
              <h2 className="font-serif text-lg font-bold mb-3">Rezumat</h2>
              <p className="text-sm leading-relaxed text-foreground/90 mb-4">{article.abstract_ro}</p>
            </>
          )}
          {article.abstract_en && (
            <>
              <h3 className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold mb-2 mt-4">Abstract (EN)</h3>
              <p className="text-sm leading-relaxed text-foreground/90">{article.abstract_en}</p>
            </>
          )}
        </div>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <div className="rounded-lg border bg-card p-6 mb-6 shadow-sm">
          <h2 className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold mb-3">Cuvinte cheie</h2>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, i) => (
              <span key={i} className="px-3 py-1 rounded-sm text-sm bg-secondary border text-secondary-foreground">{kw}</span>
            ))}
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      {article.pdf_path ? (
        <PdfViewer pdfPath={article.pdf_path} title={article.title} />
      ) : (
        <div className="rounded-lg border bg-card p-8 shadow-sm text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">PDF indisponibil pentru acest articol</p>
        </div>
      )}
    </div>
  );
}
