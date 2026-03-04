import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Issue, Article, Submission, SeriesId } from './types';

const MANIFEST_URL = 'https://raw.githubusercontent.com/liviupop/ojs_alternative_iafar/main/ingest/issues_manifest.json';

interface ManifestArticle {
  id: string;
  issue_id: string;
  title: string;
  authors: string;
  affiliations: string;
  emails: string;
  abstract_ro: string;
  abstract_en: string;
  keywords_ro: string;
  keywords_en: string;
  pages_start: string;
  pages_end: string;
  doi: string;
  language: string;
  status: string;
  section: string;
  pdf_path: string;
  md_path?: string;
  is_review?: boolean;
}

interface ManifestIssue {
  id: string;
  slug: string;
  year: string;
  volume: string;
  number: string;
  date_published: string;
  title: string;
  status: string;
  article_count: number;
  pages: number | string;
  doi_prefix: string;
  publisher: string;
  issn: string;
  issue_pdf_path: string;
  cover_hint_path: string;
  page_offset: number;
  series?: string;
  series_label?: string;
}

interface ManifestData {
  journal: {
    name: string;
    abbr: string;
    issn: string;
    eissn: string;
    publisher: string;
    country: string;
    language: string;
    url: string;
    description: string;
  };
  issues: ManifestIssue[];
  articles: ManifestArticle[];
}

interface JournalData {
  issues: Issue[];
  articles: Article[];
  loading: boolean;
  error: string | null;
}

const JournalDataContext = createContext<JournalData>({
  issues: [],
  articles: [],
  loading: true,
  error: null,
});

export function useJournalData() {
  return useContext(JournalDataContext);
}

function determineSeries(issue: ManifestIssue): SeriesId {
  if (issue.series) return issue.series as SeriesId;
  const slug = issue.slug || '';
  if (slug.includes('seria1') || slug.includes('seria-1')) return 'seria-1';
  if (slug.includes('seria2') || slug.includes('seria-2')) return 'seria-2';
  return 'seria-3';
}

function seriesLabelFor(series: SeriesId): string {
  switch (series) {
    case 'seria-1': return 'Seria I (1932–1945)';
    case 'seria-2': return 'Seria a II-a (1980–1998)';
    case 'seria-3': return '';
  }
}

function mapIssue(mi: ManifestIssue): Issue {
  const series = determineSeries(mi);
  return {
    id: mi.id,
    slug: mi.slug,
    year: mi.year,
    volume: mi.volume,
    number: mi.number,
    date_published: mi.date_published,
    title: mi.title,
    status: mi.status === 'published' ? 'published' : 'draft',
    article_count: mi.article_count,
    pages: mi.pages,
    doi_prefix: mi.doi_prefix || '',
    series,
    series_label: mi.series_label || seriesLabelFor(series),
    issue_pdf_path: mi.issue_pdf_path || '',
    cover_hint_path: mi.cover_hint_path || '',
  };
}

function mapArticle(ma: ManifestArticle, issueSeries: Record<string, SeriesId>): Article {
  return {
    id: ma.id,
    issue_id: ma.issue_id,
    title: ma.title,
    authors: ma.authors,
    affiliations: ma.affiliations || '',
    emails: ma.emails || '',
    abstract_ro: ma.abstract_ro || '',
    abstract_en: ma.abstract_en || '',
    keywords_ro: ma.keywords_ro || '',
    keywords_en: ma.keywords_en || '',
    pages_start: ma.pages_start || '',
    pages_end: ma.pages_end || '',
    doi: ma.doi || '',
    language: ma.language || 'ro',
    status: 'published',
    section: ma.section || '',
    series: issueSeries[ma.issue_id] || 'seria-3',
    pdf_path: ma.pdf_path || '',
  };
}

// Fallback issues for Series 2 (no articles, only PDF)
const SERIES2_FALLBACK: Partial<ManifestIssue>[] = [
  { slug: 'aaf-seria2-1980-vol-i', year: '1980', volume: 'I', number: '1', title: 'Anuarul de folclor I', series: 'seria-2', series_label: 'Seria a II-a (1980–1998)' },
  { slug: 'aaf-seria2-1984-vol-ii', year: '1984', volume: 'II', number: '2', title: 'Anuarul de folclor II', series: 'seria-2', series_label: 'Seria a II-a (1980–1998)' },
  { slug: 'aaf-seria2-1985-1986-vol-iii-iv', year: '1985-1986', volume: 'III-IV', number: '3-4', title: 'Anuarul de folclor III-IV', series: 'seria-2', series_label: 'Seria a II-a (1980–1998)' },
  { slug: 'aaf-seria2-1987-1989-vol-v-vii', year: '1987-1989', volume: 'V-VII', number: '5-7', title: 'Anuarul de folclor V-VII', series: 'seria-2', series_label: 'Seria a II-a (1980–1998)' },
  { slug: 'aaf-seria2-1990-1993-vol-viii-xi', year: '1990-1993', volume: 'VIII-XI', number: '8-11', title: 'Anuarul Arhivei de folclor VIII-XI', series: 'seria-2', series_label: 'Seria a II-a (1980–1998)' },
  { slug: 'aaf-seria2-1994-1995-vol-xii-xiv', year: '1994-1995', volume: 'XII-XIV', number: '12-14', title: 'Anuarul Arhivei de folclor XII-XIV', series: 'seria-2', series_label: 'Seria a II-a (1980–1998)' },
  { slug: 'aaf-seria2-1996-1998-vol-xv-xvii', year: '1996-1998', volume: 'XV-XVII', number: '15-17', title: 'Anuarul Arhivei de folclor XV-XVII', series: 'seria-2', series_label: 'Seria a II-a (1980–1998)' },
];

export function JournalDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<JournalData>({
    issues: [],
    articles: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(MANIFEST_URL);
        if (!res.ok) throw new Error(`Failed to fetch manifest: ${res.status}`);
        const manifest: ManifestData = await res.json();

        const issues = (manifest.issues || []).map(mapIssue);
        
        // Build issue series lookup
        const issueSeries: Record<string, SeriesId> = {};
        issues.forEach(i => { issueSeries[i.id] = i.series; });

        const articles = (manifest.articles || []).map(a => mapArticle(a, issueSeries));

        // Add Series 2 fallback issues if not present
        const existingSlugs = new Set(issues.map(i => i.slug));
        let nextId = Math.max(0, ...issues.map(i => Number(i.id) || 0)) + 1;
        for (const fb of SERIES2_FALLBACK) {
          if (fb.slug && !existingSlugs.has(fb.slug)) {
            issues.push({
              id: String(nextId++),
              slug: fb.slug!,
              year: fb.year || '',
              volume: fb.volume || '',
              number: fb.number || '',
              date_published: (fb.year?.match(/\d{4}/)?.[0] || '') + '-12-31',
              title: fb.title || '',
              status: 'published',
              article_count: 0,
              pages: '',
              doi_prefix: '',
              series: 'seria-2',
              series_label: fb.series_label || 'Seria a II-a (1980–1998)',
              issue_pdf_path: '',
              cover_hint_path: '',
            });
          }
        }

        if (!cancelled) {
          setData({ issues, articles, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setData(prev => ({ ...prev, loading: false, error: (err as Error).message }));
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <JournalDataContext.Provider value={data}>
      {children}
    </JournalDataContext.Provider>
  );
}
