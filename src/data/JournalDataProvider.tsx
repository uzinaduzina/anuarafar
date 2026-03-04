import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Issue, Article, Submission, SeriesId } from './types';

const BASE = 'https://raw.githubusercontent.com/liviupop/ojs_alternative_iafar/main';
const MANIFEST_URL = `${BASE}/ingest/issues_manifest.json`;
const SERIES1_ISSUES_URL = `${BASE}/ingest/series1/series1_issues.json`;
const SERIES1_ARTICLES_URL = `${BASE}/ingest/series1/series1_articles.json`;
const SERIES2_MANIFEST_URL = `${BASE}/ingest/series2/series2_manifest.js`;

// ── Manifest types (Series 3) ──────────────────────────────

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
  journal: Record<string, string>;
  issues: ManifestIssue[];
  articles: ManifestArticle[];
}

// ── Series 1 types ─────────────────────────────────────────

interface S1Issue {
  slug: string;
  series: string;
  series_label: string;
  year: string;
  volume: string;
  number: string;
  title: string;
  source_pdf_name?: string;
}

interface S1Article {
  series: string;
  issue_slug: string;
  year: string;
  volume: string;
  issue_number: string;
  toc_index: number;
  section: string;
  author: string;
  title: string;
  pages_start_label: string;
  pages_start: number;
  pages_end: number;
  abstract_fr?: string;
  keywords_fr?: string;
  keywords_ro?: string;
  article_pdf_path?: string;
  summary_matched?: string;
}

// ── Series 2 types ─────────────────────────────────────────

interface S2Issue {
  slug: string;
  series: string;
  series_label: string;
  year: string;
  volume: string;
  number: string;
  title: string;
  issue_pdf_path: string;
  article_count: number;
}

interface S2Article {
  issue_slug: string;
  index: number;
  section: string;
  author: string;
  title: string;
  page_start: number;
  page_end: number;
  article_pdf_path?: string;
}

// ── Context ────────────────────────────────────────────────

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

// ── Mappers ────────────────────────────────────────────────

let nextId = 1000;
function nextIdStr() { return String(nextId++); }

function mapS3Issue(mi: ManifestIssue): Issue {
  const series = determineSeries(mi.slug, mi.series);
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

function mapS3Article(ma: ManifestArticle, issueSeries: Record<string, SeriesId>): Article {
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

function mapS1Issue(si: S1Issue): Issue {
  const id = nextIdStr();
  return {
    id,
    slug: si.slug,
    year: si.year,
    volume: si.volume,
    number: si.number,
    date_published: `${si.year}-12-31`,
    title: si.title || `Anuarul Arhivei de Folklor ${si.volume}`,
    status: 'published',
    article_count: 0, // will be counted after
    pages: '',
    doi_prefix: '',
    series: 'seria-1',
    series_label: 'Seria I (1932–1945)',
    issue_pdf_path: si.source_pdf_name ? `ingest/series1/${si.source_pdf_name}` : '',
    cover_hint_path: '',
  };
}

function mapS1Article(sa: S1Article, issueIdBySlug: Record<string, string>): Article {
  return {
    id: nextIdStr(),
    issue_id: issueIdBySlug[sa.issue_slug] || '',
    title: sa.title,
    authors: sa.author,
    affiliations: '',
    emails: '',
    abstract_ro: '',
    abstract_en: sa.abstract_fr || '',
    keywords_ro: sa.keywords_ro || sa.keywords_fr || '',
    keywords_en: sa.keywords_fr || '',
    pages_start: String(sa.pages_start || sa.pages_start_label || ''),
    pages_end: String(sa.pages_end || ''),
    doi: '',
    language: 'ro',
    status: 'published',
    section: sa.section || '',
    series: 'seria-1',
    pdf_path: sa.article_pdf_path || '',
  };
}

function mapS2Issue(si: S2Issue): Issue {
  const id = nextIdStr();
  return {
    id,
    slug: si.slug,
    year: si.year,
    volume: si.volume,
    number: si.number,
    date_published: `${si.year.match(/\d{4}/)?.[0] || si.year}-12-31`,
    title: si.title,
    status: 'published',
    article_count: si.article_count || 0,
    pages: '',
    doi_prefix: '',
    series: 'seria-2',
    series_label: 'Seria a II-a (1980–1998)',
    issue_pdf_path: si.issue_pdf_path || '',
    cover_hint_path: '',
  };
}

function mapS2Article(sa: S2Article, issueIdBySlug: Record<string, string>): Article {
  return {
    id: nextIdStr(),
    issue_id: issueIdBySlug[sa.issue_slug] || '',
    title: sa.title,
    authors: sa.author,
    affiliations: '',
    emails: '',
    abstract_ro: '',
    abstract_en: '',
    keywords_ro: '',
    keywords_en: '',
    pages_start: String(sa.page_start || ''),
    pages_end: String(sa.page_end || ''),
    doi: '',
    language: 'ro',
    status: 'published',
    section: sa.section || '',
    series: 'seria-2',
    pdf_path: sa.article_pdf_path || '',
  };
}

// ── Helpers ────────────────────────────────────────────────

function determineSeries(slug: string, seriesHint?: string): SeriesId {
  if (seriesHint === 'seria-1' || slug.includes('seria1') || slug.includes('seria-1')) return 'seria-1';
  if (seriesHint === 'seria-2' || slug.includes('seria2') || slug.includes('seria-2')) return 'seria-2';
  return 'seria-3';
}

function seriesLabelFor(series: SeriesId): string {
  switch (series) {
    case 'seria-1': return 'Seria I (1932–1945)';
    case 'seria-2': return 'Seria a II-a (1980–1998)';
    case 'seria-3': return '';
  }
}

function parseJsManifest(jsText: string): { issues: S2Issue[]; articles: S2Article[] } {
  // Strip "window.__INGEST_SERIES2 = " prefix to get pure JSON
  const jsonStr = jsText.replace(/^[^{]*/, '').replace(/;\s*$/, '');
  return JSON.parse(jsonStr);
}

// ── Provider ───────────────────────────────────────────────

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
        // Fetch all 3 sources in parallel
        const [s3Res, s1IssuesRes, s1ArticlesRes, s2Res] = await Promise.all([
          fetch(MANIFEST_URL),
          fetch(SERIES1_ISSUES_URL),
          fetch(SERIES1_ARTICLES_URL),
          fetch(SERIES2_MANIFEST_URL),
        ]);

        if (!s3Res.ok) throw new Error(`Failed to fetch main manifest: ${s3Res.status}`);

        const manifest: ManifestData = await s3Res.json();

        // ─ Series 3 ─
        const issues: Issue[] = (manifest.issues || []).map(mapS3Issue);
        const issueSeries: Record<string, SeriesId> = {};
        issues.forEach(i => { issueSeries[i.id] = i.series; });
        const articles: Article[] = (manifest.articles || []).map(a => mapS3Article(a, issueSeries));

        // ─ Series 1 ─
        if (s1IssuesRes.ok && s1ArticlesRes.ok) {
          const s1Issues: S1Issue[] = await s1IssuesRes.json();
          const s1Articles: S1Article[] = await s1ArticlesRes.json();

          const issueIdBySlug: Record<string, string> = {};
          const existingSlugs = new Set(issues.map(i => i.slug));

          for (const si of s1Issues) {
            if (!existingSlugs.has(si.slug)) {
              const mapped = mapS1Issue(si);
              issueIdBySlug[si.slug] = mapped.id;
              issues.push(mapped);
              existingSlugs.add(si.slug);
            }
          }

          for (const sa of s1Articles) {
            // Ensure issue exists in lookup
            if (!issueIdBySlug[sa.issue_slug]) {
              const existing = issues.find(i => i.slug === sa.issue_slug);
              if (existing) issueIdBySlug[sa.issue_slug] = existing.id;
            }
            articles.push(mapS1Article(sa, issueIdBySlug));
          }

          // Update article counts
          for (const issue of issues.filter(i => i.series === 'seria-1')) {
            issue.article_count = articles.filter(a => a.issue_id === issue.id).length;
          }
        }

        // ─ Series 2 ─
        if (s2Res.ok) {
          const s2Text = await s2Res.text();
          const s2Data = parseJsManifest(s2Text);

          const issueIdBySlug: Record<string, string> = {};
          const existingSlugs = new Set(issues.map(i => i.slug));

          for (const si of s2Data.issues) {
            if (!existingSlugs.has(si.slug)) {
              const mapped = mapS2Issue(si);
              issueIdBySlug[si.slug] = mapped.id;
              issues.push(mapped);
              existingSlugs.add(si.slug);
            } else {
              // Update existing fallback with real data
              const existing = issues.find(i => i.slug === si.slug);
              if (existing) {
                issueIdBySlug[si.slug] = existing.id;
                existing.article_count = si.article_count;
                existing.issue_pdf_path = si.issue_pdf_path || existing.issue_pdf_path;
              }
            }
          }

          for (const sa of s2Data.articles) {
            if (!issueIdBySlug[sa.issue_slug]) {
              const existing = issues.find(i => i.slug === sa.issue_slug);
              if (existing) issueIdBySlug[sa.issue_slug] = existing.id;
            }
            articles.push(mapS2Article(sa, issueIdBySlug));
          }

          // Update article counts for series 2
          for (const issue of issues.filter(i => i.series === 'seria-2')) {
            const count = articles.filter(a => a.issue_id === issue.id).length;
            if (count > 0) issue.article_count = count;
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
