import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Issue, Article, SeriesId } from './types';

const MANIFEST_URL = '/data/issues_manifest_user.js';

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
  hasEdits: boolean;
  exportAsJson: () => string;
}

const JournalDataContext = createContext<JournalData>({
  issues: [],
  articles: [],
  loading: true,
  error: null,
  updateArticle: () => {},
  updateIssue: () => {},
  hasEdits: false,
  exportAsJson: () => '{}',
});

export function useJournalData() {
  return useContext(JournalDataContext);
}

function mapSeries(s: string): SeriesId {
  if (s === 'seria-1' || s?.includes('seria-1') || s?.includes('Seria I')) return 'seria-1';
  if (s === 'seria-2' || s?.includes('seria-2') || s?.includes('Seria II')) return 'seria-2';
  return 'seria-3';
}

function seriesLabel(series: SeriesId, raw: string): string {
  if (raw) return raw;
  switch (series) {
    case 'seria-1': return 'Seria I (1932–1945)';
    case 'seria-2': return 'Seria a II-a (1980–1998)';
    case 'seria-3': return '';
  }
}

function mapIssue(mi: ManifestIssue): Issue {
  const series = mapSeries(mi.series);
  return {
    id: mi.id,
    slug: mi.slug,
    year: mi.year,
    volume: mi.volume,
    number: mi.number,
    date_published: mi.date_published,
    title: mi.title,
    status: mi.status === 'published' ? 'published' : 'draft',
    article_count: Number(mi.article_count) || 0,
    pages: mi.pages,
    doi_prefix: mi.doi_prefix || '',
    series,
    series_label: seriesLabel(series, mi.series_label),
    issue_pdf_path: mi.issue_pdf_path || '',
    cover_hint_path: mi.cover_hint_path || '',
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
    status: 'published',
    section: ma.section || '',
    series: issueSeries[ma.issue_id] || mapSeries(ma.series || ''),
    pdf_path: ma.pdf_path || '',
  };
}

function parseJsManifest(text: string): ManifestData {
  const jsonStr = text.replace(/^[^{]*/, '').replace(/;\s*$/, '');
  return JSON.parse(jsonStr);
}

export function JournalDataProvider({ children }: { children: ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editCount, setEditCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(MANIFEST_URL);
        if (!res.ok) throw new Error(`Failed to fetch manifest: ${res.status}`);
        const text = await res.text();
        const manifest = parseJsManifest(text);

        const mappedIssues = (manifest.issues || []).map(mapIssue);

        const issueSeries: Record<string, SeriesId> = {};
        mappedIssues.forEach(i => { issueSeries[i.id] = i.series; });

        const mappedArticles = (manifest.articles || []).map(a => mapArticle(a, issueSeries));

        if (!cancelled) {
          setIssues(mappedIssues);
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
    return () => { cancelled = true; };
  }, []);

  const updateArticle = useCallback((id: string, changes: Partial<Article>) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, ...changes } : a));
    setEditCount(c => c + 1);
  }, []);

  const updateIssue = useCallback((id: string, changes: Partial<Issue>) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, ...changes } : i));
    setEditCount(c => c + 1);
  }, []);

  const exportAsJson = useCallback(() => {
    const data = { issues, articles };
    return JSON.stringify(data, null, 2);
  }, [issues, articles]);

  return (
    <JournalDataContext.Provider value={{
      issues,
      articles,
      loading,
      error,
      updateArticle,
      updateIssue,
      hasEdits: editCount > 0,
      exportAsJson,
    }}>
      {children}
    </JournalDataContext.Provider>
  );
}
