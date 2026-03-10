import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useJournalData } from '@/data/JournalDataProvider';
import { Article, Issue } from '@/data/types';

function normalizeForSearch(value: string) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function articleSearchHaystack(article: Article, issue?: Issue) {
  const fields = [
    article.id,
    article.title,
    article.authors,
    article.affiliations,
    article.emails,
    article.abstract,
    article.abstract_ro,
    article.abstract_en,
    article.abstract_de,
    article.abstract_fr,
    article.keywords,
    article.keywords_ro,
    article.keywords_en,
    article.keywords_de,
    article.keywords_fr,
    article.section,
    article.doi,
    article.language,
    article.pages_start,
    article.pages_end,
    article.series,
    issue?.title,
    issue?.year,
    issue?.volume,
    issue?.number,
    issue?.slug,
    issue?.series_label,
  ];
  return normalizeForSearch(fields.filter(Boolean).join(' '));
}

export default function SearchPage() {
  const { issues, articles } = useJournalData();
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const publishedIssues = useMemo(
    () => issues.filter((issue) => issue.status === 'published'),
    [issues],
  );
  const issueById = useMemo(
    () => publishedIssues.reduce<Record<string, Issue>>((acc, issue) => {
      acc[issue.id] = issue;
      return acc;
    }, {}),
    [publishedIssues],
  );
  const publishedIssueIds = useMemo(() => new Set(publishedIssues.map((issue) => issue.id)), [publishedIssues]);

  const normalizedSearch = normalizeForSearch(searchTerm);
  const searchResults = useMemo(() => {
    if (!normalizedSearch) return [];
    return articles
      .filter((article) => article.status === 'published' && publishedIssueIds.has(article.issue_id))
      .filter((article) => articleSearchHaystack(article, issueById[article.issue_id]).includes(normalizedSearch))
      .sort((left, right) => {
        const leftIssueYear = parseInt(issueById[left.issue_id]?.year || '0', 10);
        const rightIssueYear = parseInt(issueById[right.issue_id]?.year || '0', 10);
        if (rightIssueYear !== leftIssueYear) return rightIssueYear - leftIssueYear;
        return String(left.title).localeCompare(String(right.title), 'ro');
      });
  }, [articles, issueById, normalizedSearch, publishedIssueIds]);

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold mb-2">Căutare în arhivă</h1>
        <p className="text-muted-foreground">
          Caută în metadatele tuturor articolelor publicate din arhivă.
        </p>
      </div>

      <div className="mb-8 rounded-lg border bg-card p-4 md:p-5">
        <div className="mb-3 text-sm text-muted-foreground">
          Câmpuri incluse: titlu, autori, afiliere, email, rezumat, cuvinte cheie, DOI, secțiune, limbă, pagini și datele numărului.
        </div>
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            setSearchTerm(searchInput.trim());
          }}
        >
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Ex: Taloș, colinde, DOI, etnologie, Bartók..."
            className="h-10 flex-1 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Search className="h-4 w-4" />
            Caută
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setSearchTerm('');
              }}
              className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-accent"
            >
              Resetează
            </button>
          )}
        </form>
      </div>

      {searchTerm ? (
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-serif text-xl font-bold">Rezultate articole</h2>
            <p className="text-sm text-muted-foreground">
              Interogare: <span className="font-medium text-foreground">{searchTerm}</span> · {searchResults.length} rezultate
            </p>
          </div>
          {searchResults.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-card p-5 text-sm text-muted-foreground">
              Nu există articole care să corespundă căutării curente.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {searchResults.map((article) => {
                const issue = issueById[article.issue_id];
                return (
                  <article key={article.id} className="rounded-lg border bg-card p-4 shadow-sm">
                    <h3 className="font-serif text-lg font-bold leading-snug">{article.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{article.authors || 'Autor necunoscut'}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {issue ? `${issue.title} · ${issue.year}` : 'Număr neidentificat'} · pag. {article.pages_start}–{article.pages_end}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        to={`/article/${article.id}`}
                        className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90"
                      >
                        Deschide articolul
                      </Link>
                      {issue && (
                        <Link
                          to={`/archive/${issue.slug}`}
                          className="inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium hover:bg-accent"
                        >
                          Vezi numărul
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed bg-card p-5 text-sm text-muted-foreground">
          Introdu un termen și apasă <span className="font-medium text-foreground">Caută</span> pentru a vedea articolele potrivite.
        </div>
      )}
    </div>
  );
}
