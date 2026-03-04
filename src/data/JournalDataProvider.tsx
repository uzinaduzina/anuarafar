import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useMemo } from 'react';
import { Issue, Article, SeriesId } from './types';
import { objectsToRows, parseCsv, rowsToObjects, toCsv } from '@/lib/csv';

const MANIFEST_URL = '/data/issues_manifest_user.js';
const ISSUES_CSV_URL = '/data/issues.csv';
const ISSUES_CSV_STORAGE_KEY = 'journal_issues_csv_v1';
const ARTICLE_OVERRIDES_STORAGE_KEY = 'journal_article_overrides_v1';

const ISSUE_CSV_COLUMNS = [
  'id',
  'slug',
  'year',
  'volume',
  'number',
  'date_published',
  'title',
  'status',
  'article_count',
  'pages',
  'doi_prefix',
  'series',
  'series_label',
  'issue_pdf_path',
  'cover_hint_path',
] as const;

interface ManifestIssue {
  id: string;
  slug: string;
  year: string;
  volume: string;
  number: string;
  date_published: string;
  title: string;
  status: string;
  article_count: string | number;
  pages: string | number;
  doi_prefix: string;
  series: string;
  series_label: string;
  issue_pdf_path: string;
  cover_hint_path: string;
  page_offset: string | number;
}

interface ManifestArticle {
  id: string;
  issue_id: string;
  title: string;
  authors?: string;
  author?: string;
  affiliations: string;
  emails: string;
  abstract_ro: string;
  abstract_en: string;
  keywords_ro: string;
  keywords_en: string;
  pages_start: string | number;
  pages_end: string | number;
  doi: string;
  language: string;
  status: string;
  section: string;
  pdf_path: string;
  md_path?: string;
  is_review?: boolean;
  series?: string;
}

interface ManifestData {
  journal: Record<string, string>;
  issues: ManifestIssue[];
  articles: ManifestArticle[];
}

interface JournalData {
  issues: Issue[];
  articles: Article[];
  loading: boolean;
  error: string | null;
  updateArticle: (id: string, changes: Partial<Article>) => void;
  updateIssue: (id: string, changes: Partial<Issue>) => void;
  addIssue: (seed?: Partial<Issue>) => Issue;
  hasEdits: boolean;
  hasIssueCsvOverride: boolean;
  exportAsJson: () => string;
  exportIssuesCsv: () => string;
  resetIssuesToFile: () => Promise<void>;
}

const JournalDataContext = createContext<JournalData>({
  issues: [],
  articles: [],
  loading: true,
  error: null,
  updateArticle: () => {},
  updateIssue: () => {},
  addIssue: () => ({
    id: '',
    slug: '',
    year: '',
    volume: '',
    number: '',
    date_published: '',
    title: '',
    status: 'draft',
    article_count: 0,
    pages: '',
    doi_prefix: '',
    series: 'seria-3',
    series_label: '',
    issue_pdf_path: '',
    cover_hint_path: '',
  }),
  hasEdits: false,
  hasIssueCsvOverride: false,
  exportAsJson: () => '{}',
  exportIssuesCsv: () => '',
  resetIssuesToFile: async () => {},
});

export function useJournalData() {
  return useContext(JournalDataContext);
}

function mapSeries(s: string): SeriesId {
  const normalized = String(s || '').toLowerCase();
  if (normalized === 'seria-1' || normalized.includes('seria-1') || normalized.includes('seria i')) return 'seria-1';
  if (normalized === 'seria-2' || normalized.includes('seria-2') || normalized.includes('seria ii')) return 'seria-2';
  return 'seria-3';
}

function seriesLabel(series: SeriesId, raw: string): string {
  if (raw) return raw;
  switch (series) {
    case 'seria-1':
      return 'Seria I (1932-1945)';
    case 'seria-2':
      return 'Seria a II-a (1980-1998)';
    default:
      return '';
  }
}

function mapIssue(mi: ManifestIssue): Issue {
  const series = mapSeries(mi.series);
  return {
    id: String(mi.id || ''),
    slug: String(mi.slug || ''),
    year: String(mi.year || ''),
    volume: String(mi.volume || ''),
    number: String(mi.number || ''),
    date_published: String(mi.date_published || ''),
    title: String(mi.title || ''),
    status: mi.status === 'published' ? 'published' : 'draft',
    article_count: Number(mi.article_count) || 0,
    pages: String(mi.pages || ''),
    doi_prefix: String(mi.doi_prefix || ''),
    series,
    series_label: seriesLabel(series, String(mi.series_label || '')),
    issue_pdf_path: String(mi.issue_pdf_path || ''),
    cover_hint_path: String(mi.cover_hint_path || ''),
  };
}

function mapArticle(ma: ManifestArticle, issueSeries: Record<string, SeriesId>): Article {
  return {
    id: ma.id,
    issue_id: ma.issue_id,
    title: ma.title,
    authors: ma.authors || ma.author || '',
    affiliations: ma.affiliations || '',
    emails: ma.emails || '',
    abstract_ro: ma.abstract_ro || '',
    abstract_en: ma.abstract_en || '',
    keywords_ro: ma.keywords_ro || '',
    keywords_en: ma.keywords_en || '',
    pages_start: String(ma.pages_start || ''),
    pages_end: String(ma.pages_end || ''),
    doi: ma.doi || '',
    language: ma.language || 'ro',
    status: ma.status === 'draft' ? 'draft' : 'published',
    section: ma.section || '',
    series: issueSeries[ma.issue_id] || mapSeries(ma.series || ''),
    pdf_path: ma.pdf_path || '',
  };
}

function parseJsManifest(text: string): ManifestData {
  const jsonStr = text.replace(/^[^{]*/, '').replace(/;\s*$/, '');
  return JSON.parse(jsonStr);
}

function issueFromCsvRow(row: Record<string, string>): Issue {
  const series = mapSeries(row.series || '');

  return {
    id: String(row.id || '').trim(),
    slug: String(row.slug || '').trim(),
    year: String(row.year || '').trim(),
    volume: String(row.volume || '').trim(),
    number: String(row.number || '').trim(),
    date_published: String(row.date_published || '').trim(),
    title: String(row.title || '').trim(),
    status: row.status === 'published' ? 'published' : 'draft',
    article_count: Number(row.article_count || 0) || 0,
    pages: String(row.pages || '').trim(),
    doi_prefix: String(row.doi_prefix || '').trim(),
    series,
    series_label: seriesLabel(series, String(row.series_label || '').trim()),
    issue_pdf_path: String(row.issue_pdf_path || '').trim(),
    cover_hint_path: String(row.cover_hint_path || '').trim(),
  };
}

function issuesFromCsv(csvText: string): Issue[] {
  const rows = parseCsv(csvText);
  const objects = rowsToObjects(rows);
  return objects.map(issueFromCsvRow);
}

function issueToCsvRow(issue: Issue): Record<(typeof ISSUE_CSV_COLUMNS)[number], string | number> {
  return {
    id: issue.id,
    slug: issue.slug,
    year: issue.year,
    volume: issue.volume,
    number: issue.number,
    date_published: issue.date_published,
    title: issue.title,
    status: issue.status,
    article_count: issue.article_count,
    pages: String(issue.pages ?? ''),
    doi_prefix: issue.doi_prefix,
    series: issue.series,
    series_label: issue.series_label,
    issue_pdf_path: issue.issue_pdf_path,
    cover_hint_path: issue.cover_hint_path,
  };
}

function exportIssuesAsCsv(issues: Issue[]): string {
  const rows = objectsToRows(
    [...ISSUE_CSV_COLUMNS],
    issues.map((issue) => issueToCsvRow(issue)),
  );

  return `${toCsv(rows)}\n`;
}

function readArticleOverrides(): Record<string, Partial<Article>> {
  try {
    const raw = localStorage.getItem(ARTICLE_OVERRIDES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Partial<Article>>) : {};
  } catch {
    return {};
  }
}

function writeArticleOverride(id: string, changes: Partial<Article>) {
  const current = readArticleOverrides();
  current[id] = { ...(current[id] || {}), ...changes };
  localStorage.setItem(ARTICLE_OVERRIDES_STORAGE_KEY, JSON.stringify(current));
}

function applyArticleOverrides(baseArticles: Article[]): Article[] {
  const overrides = readArticleOverrides();
  return baseArticles.map((article) => {
    const override = overrides[article.id];
    return override ? { ...article, ...override } : article;
  });
}

export function JournalDataProvider({ children }: { children: ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editCount, setEditCount] = useState(0);
  const [hasIssueCsvOverride, setHasIssueCsvOverride] = useState<boolean>(!!localStorage.getItem(ISSUES_CSV_STORAGE_KEY));

  const persistIssuesCsv = useCallback((nextIssues: Issue[]) => {
    localStorage.setItem(ISSUES_CSV_STORAGE_KEY, exportIssuesAsCsv(nextIssues));
    setHasIssueCsvOverride(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [manifestResponse, csvResponse] = await Promise.all([
          fetch(MANIFEST_URL),
          fetch(ISSUES_CSV_URL),
        ]);

        if (!manifestResponse.ok) {
          throw new Error(`Failed to fetch manifest: ${manifestResponse.status}`);
        }

        const manifestText = await manifestResponse.text();
        const manifest = parseJsManifest(manifestText);

        const mappedIssuesFromManifest = (manifest.issues || []).map(mapIssue);
        const issueSeries: Record<string, SeriesId> = {};
        mappedIssuesFromManifest.forEach((issue) => {
          issueSeries[issue.id] = issue.series;
        });

        const mappedArticles = applyArticleOverrides(
          (manifest.articles || []).map((article) => mapArticle(article, issueSeries)),
        );

        const localCsv = localStorage.getItem(ISSUES_CSV_STORAGE_KEY);
        let resolvedIssues = mappedIssuesFromManifest;

        if (localCsv) {
          const parsedLocalIssues = issuesFromCsv(localCsv);
          if (parsedLocalIssues.length > 0) {
            resolvedIssues = parsedLocalIssues;
          }
        } else if (csvResponse.ok) {
          const csvText = await csvResponse.text();
          const parsedCsvIssues = issuesFromCsv(csvText);
          if (parsedCsvIssues.length > 0) {
            resolvedIssues = parsedCsvIssues;
          }
        }

        if (!cancelled) {
          setIssues(resolvedIssues);
          setArticles(mappedArticles);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateArticle = useCallback((id: string, changes: Partial<Article>) => {
    setArticles((prev) => prev.map((article) => (article.id === id ? { ...article, ...changes } : article)));
    writeArticleOverride(id, changes);
    setEditCount((count) => count + 1);
  }, []);

  const updateIssue = useCallback((id: string, changes: Partial<Issue>) => {
    setIssues((prev) => {
      const nextIssues = prev.map((issue) => {
        if (issue.id !== id) return issue;
        return {
          ...issue,
          ...changes,
          article_count: Number(changes.article_count ?? issue.article_count) || 0,
        };
      });
      persistIssuesCsv(nextIssues);
      return nextIssues;
    });
    setEditCount((count) => count + 1);
  }, [persistIssuesCsv]);

  const addIssue = useCallback((seed?: Partial<Issue>) => {
    const nextId = String(
      issues.reduce((maxValue, issue) => Math.max(maxValue, Number(issue.id) || 0), 0) + 1,
    );

    const draftIssue: Issue = {
      id: nextId,
      slug: seed?.slug || `issue-${nextId}`,
      year: seed?.year || String(new Date().getFullYear()),
      volume: seed?.volume || '',
      number: seed?.number || '1',
      date_published: seed?.date_published || `${new Date().getFullYear()}-12-31`,
      title: seed?.title || 'Numar nou',
      status: seed?.status || 'draft',
      article_count: Number(seed?.article_count || 0),
      pages: String(seed?.pages || ''),
      doi_prefix: seed?.doi_prefix || '',
      series: seed?.series || 'seria-3',
      series_label: seed?.series_label || '',
      issue_pdf_path: seed?.issue_pdf_path || '',
      cover_hint_path: seed?.cover_hint_path || '',
    };

    const nextIssues = [draftIssue, ...issues];
    setIssues(nextIssues);
    persistIssuesCsv(nextIssues);
    setEditCount((count) => count + 1);

    return draftIssue;
  }, [issues, persistIssuesCsv]);

  const exportAsJson = useCallback(() => {
    const data = { issues, articles };
    return JSON.stringify(data, null, 2);
  }, [issues, articles]);

  const exportIssuesCsv = useCallback(() => exportIssuesAsCsv(issues), [issues]);

  const resetIssuesToFile = useCallback(async () => {
    const res = await fetch(ISSUES_CSV_URL);
    if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status}`);

    const csvText = await res.text();
    const parsed = issuesFromCsv(csvText);
    if (parsed.length === 0) throw new Error('CSV does not contain issue rows.');

    localStorage.removeItem(ISSUES_CSV_STORAGE_KEY);
    setHasIssueCsvOverride(false);
    setIssues(parsed);
  }, []);

  const contextValue = useMemo(() => ({
    issues,
    articles,
    loading,
    error,
    updateArticle,
    updateIssue,
    addIssue,
    hasEdits: editCount > 0,
    hasIssueCsvOverride,
    exportAsJson,
    exportIssuesCsv,
    resetIssuesToFile,
  }), [
    issues,
    articles,
    loading,
    error,
    updateArticle,
    updateIssue,
    addIssue,
    editCount,
    hasIssueCsvOverride,
    exportAsJson,
    exportIssuesCsv,
    resetIssuesToFile,
  ]);

  return (
    <JournalDataContext.Provider value={contextValue}>
      {children}
    </JournalDataContext.Provider>
  );
}
