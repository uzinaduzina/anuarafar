import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useMemo } from 'react';
import { Issue, Article, SeriesId } from './types';
import { objectsToRows, parseCsv, rowsToObjects, toCsv } from '@/lib/csv';
import { JOURNAL } from './journal';
import { useAuth } from '@/contexts/AuthContext';
import { isRemoteAuthEnabled, resolveAuthApiBase } from '@/lib/authApi';

const MANIFEST_URL = `${import.meta.env.BASE_URL}data/issues_manifest_user.js`;
const ISSUES_CSV_URL = `${import.meta.env.BASE_URL}data/issues.csv`;
const ISSUES_CSV_STORAGE_KEY = 'journal_issues_csv_v1';
const ARTICLE_OVERRIDES_STORAGE_KEY = 'journal_article_overrides_v1';
const AUTH_API_BASE = resolveAuthApiBase();
const REMOTE_AUTH_ENABLED = isRemoteAuthEnabled();
const ARTICLE_OVERRIDE_FIELDS = [
  'title',
  'authors',
  'affiliations',
  'emails',
  'abstract',
  'abstract_ro',
  'abstract_en',
  'abstract_de',
  'abstract_fr',
  'keywords',
  'keywords_ro',
  'keywords_en',
  'keywords_de',
  'keywords_fr',
  'pages_start',
  'pages_end',
  'doi',
  'language',
  'section',
  'pdf_path',
] as const;

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

const ARTICLE_CSV_COLUMNS = [
  'id',
  'issue_id',
  'series',
  'section',
  'title',
  'authors',
  'affiliations',
  'emails',
  'abstract',
  'abstract_ro',
  'abstract_en',
  'abstract_de',
  'abstract_fr',
  'keywords',
  'keywords_ro',
  'keywords_en',
  'keywords_de',
  'keywords_fr',
  'pages_start',
  'pages_end',
  'doi',
  'language',
  'status',
  'pdf_path',
  'md_path',
  'is_review',
] as const;

const DOAJ_CSV_COLUMNS = [
  'journal_title',
  'journal_issn_print',
  'journal_issn_online',
  'publisher',
  'publisher_country',
  'article_title',
  'authors',
  'abstract',
  'keywords',
  'doi',
  'article_url',
  'full_text_url',
  'publication_date',
  'volume',
  'issue',
  'issue_title',
  'issue_year',
  'start_page',
  'end_page',
  'language',
  'license',
  'license_url',
  'copyright_statement',
  'open_access_statement',
  'peer_review',
  'author_fees',
  'series',
  'issue_id',
  'article_id',
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
  abstract?: string;
  abstract_ro: string;
  abstract_en: string;
  abstract_de?: string;
  abstract_fr?: string;
  keywords?: string;
  keywords_ro: string;
  keywords_en: string;
  keywords_de?: string;
  keywords_fr?: string;
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

export interface DoajValidationResult {
  ok: boolean;
  articleCount: number;
  errors: string[];
  warnings: string[];
}

interface DeleteIssueResult {
  ok: boolean;
  error?: string;
}

interface ArticleUpdateResult {
  ok: boolean;
  error?: string;
  source: 'remote' | 'local';
}

interface JournalData {
  issues: Issue[];
  articles: Article[];
  loading: boolean;
  error: string | null;
  updateArticle: (id: string, changes: Partial<Article>) => Promise<ArticleUpdateResult>;
  updateIssue: (id: string, changes: Partial<Issue>) => void;
  addIssue: (seed?: Partial<Issue>) => Issue;
  deleteIssue: (id: string) => DeleteIssueResult;
  importIssuesCsv: (csvText: string) => number;
  hasEdits: boolean;
  hasIssueCsvOverride: boolean;
  exportAsJson: () => string;
  exportIssuesCsv: () => string;
  exportArticlesCsvBySeries: (series: SeriesId) => string;
  exportDoajCsvBySeries: (series: SeriesId) => string;
  exportDoajCsvByIssue: (issueId: string) => string;
  exportDoajXmlBySeries: (series: SeriesId) => string;
  exportDoajXmlByIssue: (issueId: string) => string;
  validateDoajBySeries: (series: SeriesId) => DoajValidationResult;
  validateDoajByIssue: (issueId: string) => DoajValidationResult;
  resetIssuesToFile: () => Promise<void>;
}

const JournalDataContext = createContext<JournalData>({
  issues: [],
  articles: [],
  loading: true,
  error: null,
  updateArticle: async () => ({ ok: false, error: 'Update not implemented.', source: 'local' }),
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
  deleteIssue: () => ({ ok: false, error: 'Delete not implemented.' }),
  importIssuesCsv: () => 0,
  hasEdits: false,
  hasIssueCsvOverride: false,
  exportAsJson: () => '{}',
  exportIssuesCsv: () => '',
  exportArticlesCsvBySeries: () => '',
  exportDoajCsvBySeries: () => '',
  exportDoajCsvByIssue: () => '',
  exportDoajXmlBySeries: () => '',
  exportDoajXmlByIssue: () => '',
  validateDoajBySeries: () => ({ ok: true, articleCount: 0, errors: [], warnings: [] }),
  validateDoajByIssue: () => ({ ok: true, articleCount: 0, errors: [], warnings: [] }),
  resetIssuesToFile: async () => {},
});

export function useJournalData() {
  return useContext(JournalDataContext);
}

function mapSeries(s: string): SeriesId {
  const normalized = String(s || '').trim().toLowerCase();
  if (normalized === 'seria-1' || normalized.includes('seria-1') || normalized.includes('seria i')) return 'seria-1';
  if (normalized === 'seria-2' || normalized.includes('seria-2') || normalized.includes('seria ii')) return 'seria-2';
  return 'seria-3';
}

function normalizeIssueStatus(value: string): 'published' | 'draft' {
  return String(value || '').trim().toLowerCase() === 'published' ? 'published' : 'draft';
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
    status: normalizeIssueStatus(String(mi.status || '')),
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
  const reviewRaw = ma.is_review;
  const isReview = typeof reviewRaw === 'boolean'
    ? reviewRaw
    : ['1', 'true', 'yes', 'da'].includes(String(reviewRaw || '').trim().toLowerCase());

  return {
    id: ma.id,
    issue_id: ma.issue_id,
    title: ma.title,
    authors: ma.authors || ma.author || '',
    affiliations: ma.affiliations || '',
    emails: ma.emails || '',
    abstract: ma.abstract || ma.abstract_en || ma.abstract_de || ma.abstract_fr || ma.abstract_ro || '',
    abstract_ro: ma.abstract_ro || '',
    abstract_en: ma.abstract_en || '',
    abstract_de: ma.abstract_de || '',
    abstract_fr: ma.abstract_fr || '',
    keywords: ma.keywords || ma.keywords_ro || ma.keywords_en || ma.keywords_de || ma.keywords_fr || '',
    keywords_ro: ma.keywords_ro || '',
    keywords_en: ma.keywords_en || '',
    keywords_de: ma.keywords_de || '',
    keywords_fr: ma.keywords_fr || '',
    pages_start: String(ma.pages_start || ''),
    pages_end: String(ma.pages_end || ''),
    doi: ma.doi || '',
    language: ma.language || 'ro',
    status: ma.status === 'draft' ? 'draft' : 'published',
    section: ma.section || '',
    series: issueSeries[ma.issue_id] || mapSeries(ma.series || ''),
    pdf_path: ma.pdf_path || '',
    md_path: ma.md_path || '',
    is_review: isReview,
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
    status: normalizeIssueStatus(row.status || ''),
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

function parseIssuesCsvText(csvText: string): Issue[] {
  const rows = parseCsv(csvText);
  if (rows.length === 0) {
    throw new Error('Fisierul CSV este gol.');
  }

  const header = rows[0].map((cell) => cell.trim());
  const missingColumns = ISSUE_CSV_COLUMNS.filter((column) => !header.includes(column));
  if (missingColumns.length > 0) {
    throw new Error(`CSV invalid: lipsesc coloanele ${missingColumns.join(', ')}.`);
  }

  const parsed = issuesFromCsv(csvText).filter((issue) => Boolean(issue.id));
  if (parsed.length === 0) {
    throw new Error('CSV-ul nu contine randuri de numere.');
  }

  const seen = new Set<string>();
  const duplicateIds = new Set<string>();
  parsed.forEach((issue) => {
    if (seen.has(issue.id)) {
      duplicateIds.add(issue.id);
      return;
    }
    seen.add(issue.id);
  });

  if (duplicateIds.size > 0) {
    throw new Error(`CSV invalid: ID-uri duplicate (${Array.from(duplicateIds).join(', ')}).`);
  }

  return parsed;
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

function articleToCsvRow(article: Article): Record<(typeof ARTICLE_CSV_COLUMNS)[number], string> {
  return {
    id: article.id,
    issue_id: article.issue_id,
    series: article.series,
    section: article.section || '',
    title: article.title || '',
    authors: article.authors || '',
    affiliations: article.affiliations || '',
    emails: article.emails || '',
    abstract: article.abstract || '',
    abstract_ro: article.abstract_ro || '',
    abstract_en: article.abstract_en || '',
    abstract_de: article.abstract_de || '',
    abstract_fr: article.abstract_fr || '',
    keywords: article.keywords || '',
    keywords_ro: article.keywords_ro || '',
    keywords_en: article.keywords_en || '',
    keywords_de: article.keywords_de || '',
    keywords_fr: article.keywords_fr || '',
    pages_start: article.pages_start || '',
    pages_end: article.pages_end || '',
    doi: article.doi || '',
    language: article.language || '',
    status: article.status || '',
    pdf_path: article.pdf_path || '',
    md_path: article.md_path || '',
    is_review: article.is_review ? 'true' : 'false',
  };
}

function exportArticlesAsCsv(articles: Article[]): string {
  const rows = objectsToRows(
    [...ARTICLE_CSV_COLUMNS],
    articles.map((article) => articleToCsvRow(article)),
  );

  return `${toCsv(rows)}\n`;
}

function getPublicSiteUrl(): string {
  const configured = String(import.meta.env.VITE_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');
  return configured || String(JOURNAL.url || 'https://anuar.iafar.ro').replace(/\/+$/, '');
}

const ABSTRACT_TRAILER_PATTERN = /\b(?:keywords?|cuvinte(?:-| )?cheie|parole(?:-| )?chiave|mots(?:-| )?cl[eé]s|schl[üu]sselw[öo]rter)\b\s*:/i;
const DOAJ_TITLE_EXCLUSION_PATTERNS: Array<[RegExp, string]> = [
  [/^un nou început$/i, 'editorial de relansare'],
  [/^in memoriam\b/i, 'text memorial'],
  [/^in honorem\b/i, 'omagiu'],
  [/^gând pios\b/i, 'omagiu memorial'],
  [/^cuvânt înainte$/i, 'prefață'],
  [/^curriculum vitae$/i, 'curriculum vitae'],
  [/^memoriu de activitate$/i, 'memoriu de activitate'],
  [/\binterviu\b/i, 'interviu'],
  [/\bnote de lectură\b/i, 'notă de lectură'],
  [/istoricul apariției unei cărți/i, 'text de istorie editorială'],
];
const DOAJ_SECTION_EXCLUSION_KEYS = new Map<string, string>([
  ['RECENZII', 'recenzie'],
  ['NOTEDELECTURA', 'notă de lectură'],
  ['RESTITUIRI', 'secțiune de restituiri'],
]);

function normalizeInlineWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeSectionKey(value: string): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^A-Z]/gi, '')
    .toUpperCase();
}

function cleanAbstractText(value: string): string {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';

  const trailerMatch = ABSTRACT_TRAILER_PATTERN.exec(trimmed);
  if (!trailerMatch || trailerMatch.index < 120) {
    return normalizeInlineWhitespace(trimmed);
  }

  return normalizeInlineWhitespace(trimmed.slice(0, trailerMatch.index));
}

function getAbstractCandidate(article: Article): { value: string; language: string } {
  const candidates: Array<[string | undefined, string]> = [
    [article.abstract_en, 'eng'],
    [article.abstract_de, 'ger'],
    [article.abstract_fr, 'fre'],
    [article.abstract_ro, 'rum'],
    [article.abstract, toIso639_2b(article.language || JOURNAL.language || 'ro')],
  ];

  for (const [value, language] of candidates) {
    const cleaned = cleanAbstractText(value || '');
    if (cleaned) {
      return { value: cleaned, language };
    }
  }

  return { value: '', language: toIso639_2b(article.language || JOURNAL.language || 'ro') };
}

function singleAbstractValue(article: Article): string {
  return getAbstractCandidate(article).value;
}

function singleKeywordsValue(article: Article): string {
  return article.keywords || article.keywords_ro || article.keywords_en || article.keywords_de || article.keywords_fr || '';
}

function hasAnyAbstract(article: Article): boolean {
  return Boolean(singleAbstractValue(article));
}

function hasAnyKeywords(article: Article): boolean {
  return Boolean(singleKeywordsValue(article).trim());
}

function articleLandingUrl(article: Article): string {
  return `${getPublicSiteUrl()}/article/${article.id}`;
}

function splitAuthors(raw: string): string[] {
  return (raw || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitAffiliations(raw: string): string[] {
  return (raw || '')
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean);
}

function issueEligibleForDoaj(issue?: Issue): boolean {
  return Boolean(issue && issue.series === 'seria-3' && issue.status === 'published');
}

function doajExclusionReason(article: Article, issue?: Issue): string | null {
  if (!issueEligibleForDoaj(issue)) {
    return 'Numărul aparține unei serii arhivistice care nu are încă metadate complete pentru DOAJ.';
  }

  if (article.is_review) {
    return 'Recenziile nu sunt incluse în exportul DOAJ.';
  }

  const normalizedAuthors = String(article.authors || '').trim();
  if (!normalizedAuthors || normalizedAuthors.toUpperCase() === 'N/A') {
    return 'Înregistrările fără autor valid nu sunt incluse în exportul DOAJ.';
  }

  const sectionReason = DOAJ_SECTION_EXCLUSION_KEYS.get(normalizeSectionKey(article.section || ''));
  if (sectionReason) {
    return `${sectionReason.charAt(0).toUpperCase()}${sectionReason.slice(1)} nu este inclusă în exportul DOAJ.`;
  }

  if (normalizeSectionKey(article.section || '').startsWith('ARHIVADEFOLCLOR') && !hasAnyAbstract(article)) {
    return 'Textele omagiale sau instituționale fără abstract din secțiunea de arhivă nu sunt incluse în exportul DOAJ.';
  }

  const title = String(article.title || '').trim();
  for (const [pattern, label] of DOAJ_TITLE_EXCLUSION_PATTERNS) {
    if (pattern.test(title)) {
      return `${label.charAt(0).toUpperCase()}${label.slice(1)} nu este inclus(ă) în exportul DOAJ.`;
    }
  }

  return null;
}

function doajMetadataErrors(article: Article, issue?: Issue): string[] {
  const errors: string[] = [];
  const articleLabel = article.id || article.title || 'articol-neidentificat';
  const publicationDate = (issue?.date_published || '').trim();
  const fullTextUrl = articleLandingUrl(article);

  if (!article.title.trim()) {
    errors.push(`Articolul ${articleLabel} nu are titlu.`);
  }

  if (!article.authors.trim()) {
    errors.push(`Articolul ${articleLabel} nu are autori.`);
  }

  if (!article.affiliations.trim()) {
    errors.push(`Articolul ${articleLabel} nu are afiliere instituțională.`);
  }

  if (!hasAnyAbstract(article)) {
    errors.push(`Articolul ${articleLabel} nu are abstract DOAJ-eligibil.`);
  }

  if (!hasAnyKeywords(article)) {
    errors.push(`Articolul ${articleLabel} nu are keywords DOAJ-eligibile.`);
  }

  if (!article.pages_start.trim() || !article.pages_end.trim()) {
    errors.push(`Articolul ${articleLabel} nu are interval de paginare complet.`);
  }

  if (!publicationDate) {
    errors.push(`Articolul ${articleLabel} nu are publicationDate (date_published in issue).`);
  } else if (!isValidDoajPublicationDate(publicationDate)) {
    errors.push(`Articolul ${articleLabel} are publicationDate neconform (${publicationDate}).`);
  }

  if (!/^https?:\/\//i.test(fullTextUrl)) {
    errors.push(`Articolul ${articleLabel} are fullTextUrl invalid (${fullTextUrl}).`);
  }

  return errors;
}

function doajExportScope(
  sourceArticles: Article[],
  issuesById: Record<string, Issue>,
): {
  eligible: Article[];
  excluded: Array<{ article: Article; reason: string }>;
} {
  const eligible: Article[] = [];
  const excluded: Array<{ article: Article; reason: string }> = [];

  sourceArticles.forEach((article) => {
    const issue = issuesById[article.issue_id];
    const policyReason = doajExclusionReason(article, issue);
    if (policyReason) {
      excluded.push({ article, reason: policyReason });
      return;
    }

    const metadataErrors = doajMetadataErrors(article, issue);
    if (metadataErrors.length > 0) {
      excluded.push({ article, reason: metadataErrors[0] });
      return;
    }

    eligible.push(article);
  });

  return { eligible, excluded };
}

function doajRow(article: Article, issue?: Issue): Record<(typeof DOAJ_CSV_COLUMNS)[number], string> {
  const abstractValue = singleAbstractValue(article);
  const keywordsValue = singleKeywordsValue(article);
  const articleUrl = articleLandingUrl(article);

  return {
    journal_title: JOURNAL.name,
    journal_issn_print: JOURNAL.issn,
    journal_issn_online: JOURNAL.eissn,
    publisher: JOURNAL.publisher,
    publisher_country: JOURNAL.country,
    article_title: article.title || '',
    authors: article.authors || '',
    abstract: abstractValue,
    keywords: keywordsValue,
    doi: article.doi || '',
    article_url: articleUrl,
    full_text_url: articleUrl,
    publication_date: issue?.date_published || '',
    volume: issue?.volume || '',
    issue: issue?.number || '',
    issue_title: issue?.title || '',
    issue_year: issue?.year || '',
    start_page: article.pages_start || '',
    end_page: article.pages_end || '',
    language: article.language || JOURNAL.language || 'ro',
    license: JOURNAL.oa_license_name,
    license_url: JOURNAL.oa_license_url,
    copyright_statement: `${JOURNAL.oa_copyright_notice} ${JOURNAL.oa_publishing_rights_notice}`,
    open_access_statement: 'Acces deschis imediat, fara embargo si fara autentificare pentru citire/descarcare.',
    peer_review: 'Double-blind peer review, minimum doi referenti independenti.',
    author_fees: 'Fara taxe pentru autori (APC = 0).',
    series: article.series,
    issue_id: article.issue_id,
    article_id: article.id,
  };
}

function exportDoajCsv(articles: Article[], issuesById: Record<string, Issue>): string {
  const rows = objectsToRows(
    [...DOAJ_CSV_COLUMNS],
    articles.map((article) => doajRow(article, issuesById[article.issue_id])),
  );
  return `${toCsv(rows)}\n`;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toIso639_2b(code: string): string {
  const normalized = (code || '').trim().toLowerCase();
  if (normalized === 'ro' || normalized === 'ron' || normalized === 'rum') return 'rum';
  if (normalized === 'en' || normalized === 'eng') return 'eng';
  if (normalized.length === 3) return normalized;
  return 'eng';
}

function splitList(raw: string): string[] {
  return (raw || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizeIssn(raw: string): string {
  const normalized = (raw || '').trim();
  if (!normalized) return '';
  const compact = normalized.replace(/[^0-9Xx]/g, '');
  if (compact.length !== 8) return normalized;
  return `${compact.slice(0, 4)}-${compact.slice(4)}`;
}

function buildDoajRecordXml(article: Article, issue?: Issue): string {
  const articleLanguage = toIso639_2b(article.language || JOURNAL.language || 'ro');
  const titleLanguage = articleLanguage;
  const abstractCandidate = getAbstractCandidate(article);
  const abstractValue = abstractCandidate.value.trim();
  const abstractLanguage = abstractCandidate.language;
  const fullTextUrl = articleLandingUrl(article);
  const fullTextFormat = 'html';
  const authors = splitAuthors(article.authors);
  const affiliations = splitAffiliations(article.affiliations);
  const keywords = splitList(singleKeywordsValue(article));
  const issn = sanitizeIssn(JOURNAL.issn);
  const eissn = sanitizeIssn(JOURNAL.eissn);

  const authorsXml = authors.length > 0
    ? `
    <authors>
${authors.map((author, index) => {
  const affiliationId = affiliations[index] ? String(index + 1) : '';
  const affiliationTag = affiliationId ? `\n        <affiliationId>${xmlEscape(affiliationId)}</affiliationId>` : '';
  return `      <author>
        <name>${xmlEscape(author)}</name>${affiliationTag}
      </author>`;
}).join('\n')}
    </authors>`
    : '';

  const affiliationsXml = affiliations.length > 0
    ? `
    <affiliationsList>
${affiliations.map((name, index) => `      <affiliationName affiliationId="${xmlEscape(String(index + 1))}">${xmlEscape(name)}</affiliationName>`).join('\n')}
    </affiliationsList>`
    : '';

  const abstractXml = abstractValue
    ? `
    <abstract language="${xmlEscape(abstractLanguage)}">${xmlEscape(abstractValue)}</abstract>`
    : '';

  const keywordsXml = keywords.length > 0
    ? `
    <keywords language="${xmlEscape(articleLanguage)}">
${keywords.map((keyword) => `      <keyword>${xmlEscape(keyword)}</keyword>`).join('\n')}
    </keywords>`
    : '';

  const publicationDate = (issue?.date_published || '').trim() || `${new Date().getFullYear()}-01-01`;

  return `  <record>
    <language>${xmlEscape(articleLanguage)}</language>
    <publisher>${xmlEscape(JOURNAL.publisher)}</publisher>
    <journalTitle>${xmlEscape(JOURNAL.name)}</journalTitle>
${issn ? `    <issn>${xmlEscape(issn)}</issn>\n` : ''}${eissn ? `    <eissn>${xmlEscape(eissn)}</eissn>\n` : ''}    <publicationDate>${xmlEscape(publicationDate)}</publicationDate>
${issue?.volume ? `    <volume>${xmlEscape(issue.volume)}</volume>\n` : ''}${issue?.number ? `    <issue>${xmlEscape(issue.number)}</issue>\n` : ''}${article.pages_start ? `    <startPage>${xmlEscape(article.pages_start)}</startPage>\n` : ''}${article.pages_end ? `    <endPage>${xmlEscape(article.pages_end)}</endPage>\n` : ''}${article.doi ? `    <doi>${xmlEscape(article.doi)}</doi>\n` : ''}    <publisherRecordId>${xmlEscape(article.id)}</publisherRecordId>
    <documentType>article</documentType>
    <title language="${xmlEscape(titleLanguage)}">${xmlEscape(article.title || '')}</title>${authorsXml}${affiliationsXml}${abstractXml}
    <fullTextUrl format="${xmlEscape(fullTextFormat)}">${xmlEscape(fullTextUrl)}</fullTextUrl>${keywordsXml}
  </record>`;
}

function exportDoajXml(articles: Article[], issuesById: Record<string, Issue>): string {
  const recordsXml = articles
    .map((article) => buildDoajRecordXml(article, issuesById[article.issue_id]))
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<records>\n${recordsXml}\n</records>\n`;
}

function isValidDoajPublicationDate(value: string): boolean {
  return /^\d{4}(-\d{2}(-\d{2})?)?$/.test(value);
}

function validateDoajRecords(articles: Article[], issuesById: Record<string, Issue>): DoajValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const { eligible, excluded } = doajExportScope(articles, issuesById);

  const printIssn = sanitizeIssn(JOURNAL.issn);
  const onlineIssn = sanitizeIssn(JOURNAL.eissn);
  if (!printIssn && !onlineIssn) {
    errors.push('Jurnalul nu are ISSN/eISSN configurat pentru DOAJ metadata.');
  }

  if (articles.length > 0 && eligible.length === 0 && excluded.length > 0) {
    errors.push(`Niciun articol eligibil pentru export. Exemplu: ${excluded[0].reason}`);
  }

  if (excluded.length > 0) {
    warnings.push(`${excluded.length} înregistrări au fost excluse din exportul DOAJ; exemplu: ${excluded[0].article.title}.`);
  }

  const seenDoi = new Map<string, string>();
  const seenFullTextUrl = new Map<string, string>();

  for (const article of eligible) {
    const articleLabel = article.id || article.title || 'articol-neidentificat';
    const fullTextUrl = articleLandingUrl(article);
    const doi = (article.doi || '').trim().toLowerCase();

    if (!/^https?:\/\//i.test(fullTextUrl)) {
      errors.push(`Articolul ${articleLabel} are fullTextUrl invalid (${fullTextUrl}).`);
    }

    if (!article.pdf_path) {
      warnings.push(`Articolul ${articleLabel} nu are PDF asociat în viewer; fullTextUrl rămâne pagina articolului.`);
    }

    if (article.emails.trim()) {
      warnings.push(`Articolul ${articleLabel} are emailuri in metadata internă; ele nu sunt exportate in DOAJ XML.`);
    }

    if (doi) {
      const previous = seenDoi.get(doi);
      if (previous) {
        warnings.push(`DOI duplicat intre articolele ${previous} si ${articleLabel}.`);
      } else {
        seenDoi.set(doi, articleLabel);
      }
    }

    const normalizedUrl = fullTextUrl.trim().toLowerCase();
    const previousUrl = seenFullTextUrl.get(normalizedUrl);
    if (previousUrl) {
      warnings.push(`fullTextUrl duplicat intre articolele ${previousUrl} si ${articleLabel}.`);
    } else {
      seenFullTextUrl.set(normalizedUrl, articleLabel);
    }
  }

  return {
    ok: errors.length === 0,
    articleCount: eligible.length,
    errors: Array.from(new Set(errors)),
    warnings: Array.from(new Set(warnings)),
  };
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

function sanitizeArticleChanges(changes: Partial<Article>): Partial<Article> {
  const sanitized: Partial<Article> = {};
  for (const field of ARTICLE_OVERRIDE_FIELDS) {
    const value = changes[field];
    if (typeof value === 'string') {
      sanitized[field] = value;
    }
  }
  return sanitized;
}

function applyArticleOverrides(baseArticles: Article[], overrides: Record<string, Partial<Article>> = {}): Article[] {
  return baseArticles.map((article) => {
    const override = overrides[article.id];
    return override ? { ...article, ...override } : article;
  });
}

async function fetchRemoteArticleOverrides(): Promise<Record<string, Partial<Article>>> {
  if (!REMOTE_AUTH_ENABLED || !AUTH_API_BASE) return {};
  try {
    const response = await fetch(`${AUTH_API_BASE}/article-overrides`);
    if (!response.ok) return {};
    const payload = await response.json() as { overrides?: Record<string, Partial<Article>> };
    const next: Record<string, Partial<Article>> = {};
    for (const [id, value] of Object.entries(payload.overrides || {})) {
      if (!value || typeof value !== 'object') continue;
      next[id] = sanitizeArticleChanges(value as Partial<Article>);
    }
    return next;
  } catch {
    return {};
  }
}

function alignArticleSeriesWithIssues(baseArticles: Article[], nextIssues: Issue[]): Article[] {
  const issueSeriesById: Record<string, SeriesId> = {};
  nextIssues.forEach((issue) => {
    issueSeriesById[issue.id] = issue.series;
  });

  return baseArticles.map((article) => {
    const nextSeries = issueSeriesById[article.issue_id];
    if (!nextSeries) return article;
    return { ...article, series: nextSeries };
  });
}

function hasConflictingSlugIdMapping(localIssues: Issue[], canonicalIssues: Issue[]): boolean {
  const canonicalIdBySlug = new Map<string, string>();
  canonicalIssues.forEach((issue) => {
    if (issue.slug) canonicalIdBySlug.set(issue.slug, issue.id);
  });

  return localIssues.some((issue) => {
    if (!issue.slug) return false;
    const canonicalId = canonicalIdBySlug.get(issue.slug);
    return Boolean(canonicalId && canonicalId !== issue.id);
  });
}

export function JournalDataProvider({ children }: { children: ReactNode }) {
  const { authToken } = useAuth();
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

        const remoteArticleOverrides = await fetchRemoteArticleOverrides();
        const localArticleOverrides = REMOTE_AUTH_ENABLED ? {} : readArticleOverrides();
        const mappedArticles = applyArticleOverrides(
          (manifest.articles || []).map((article) => mapArticle(article, issueSeries)),
          { ...localArticleOverrides, ...remoteArticleOverrides },
        );

        const localCsv = localStorage.getItem(ISSUES_CSV_STORAGE_KEY);
        let resolvedIssues = mappedIssuesFromManifest;

        if (localCsv) {
          try {
            const parsedLocalIssues = parseIssuesCsvText(localCsv);
            if (parsedLocalIssues.length > 0) {
              if (hasConflictingSlugIdMapping(parsedLocalIssues, mappedIssuesFromManifest)) {
                localStorage.removeItem(ISSUES_CSV_STORAGE_KEY);
                setHasIssueCsvOverride(false);
              } else {
                resolvedIssues = parsedLocalIssues;
              }
            }
          } catch {
            localStorage.removeItem(ISSUES_CSV_STORAGE_KEY);
            setHasIssueCsvOverride(false);
          }
        } else if (csvResponse.ok) {
          const csvText = await csvResponse.text();
          const parsedCsvIssues = parseIssuesCsvText(csvText);
          if (parsedCsvIssues.length > 0) {
            resolvedIssues = parsedCsvIssues;
          }
        }

        if (!cancelled) {
          setIssues(resolvedIssues);
          setArticles(alignArticleSeriesWithIssues(mappedArticles, resolvedIssues));
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

  const updateArticle = useCallback(async (id: string, changes: Partial<Article>): Promise<ArticleUpdateResult> => {
    const sanitizedChanges = sanitizeArticleChanges(changes);

    if (REMOTE_AUTH_ENABLED && AUTH_API_BASE) {
      if (!authToken) {
        return { ok: false, error: 'Autentificarea editorială a expirat. Conectează-te din nou.', source: 'remote' };
      }

      try {
        const response = await fetch(`${AUTH_API_BASE}/article-overrides`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ id, changes: sanitizedChanges }),
        });

        const payload = await response.json().catch(() => ({})) as { ok?: boolean; error?: string };
        if (!response.ok || payload.ok === false) {
          return {
            ok: false,
            error: payload.error || 'Nu am putut salva modificările în sursa publică.',
            source: 'remote',
          };
        }

        setArticles((prev) => prev.map((article) => (article.id === id ? { ...article, ...sanitizedChanges } : article)));
        setEditCount((count) => count + 1);
        return { ok: true, source: 'remote' };
      } catch {
        return {
          ok: false,
          error: 'Nu am putut contacta serviciul de salvare publică.',
          source: 'remote',
        };
      }
    }

    setArticles((prev) => prev.map((article) => (article.id === id ? { ...article, ...sanitizedChanges } : article)));
    writeArticleOverride(id, sanitizedChanges);
    setEditCount((count) => count + 1);
    return { ok: true, source: 'local' };
  }, [authToken]);

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

    if (changes.series) {
      setArticles((prev) => prev.map((article) => (
        article.issue_id === id ? { ...article, series: changes.series as SeriesId } : article
      )));
    }

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

  const deleteIssue = useCallback((id: string): DeleteIssueResult => {
    const issueId = String(id || '').trim();
    if (!issueId) {
      return { ok: false, error: 'ID-ul numarului este invalid.' };
    }

    const targetIssue = issues.find((issue) => issue.id === issueId);
    if (!targetIssue) {
      return { ok: false, error: 'Numarul nu exista sau a fost deja sters.' };
    }

    const linkedArticlesCount = articles.filter((article) => article.issue_id === issueId).length;
    if (linkedArticlesCount > 0) {
      return {
        ok: false,
        error: `Nu poti sterge acest numar deoarece are ${linkedArticlesCount} articole asociate.`,
      };
    }

    const nextIssues = issues.filter((issue) => issue.id !== issueId);
    setIssues(nextIssues);
    persistIssuesCsv(nextIssues);
    setEditCount((count) => count + 1);
    return { ok: true };
  }, [articles, issues, persistIssuesCsv]);

  const importIssuesCsv = useCallback((csvText: string) => {
    const parsedIssues = parseIssuesCsvText(csvText);
    setIssues(parsedIssues);
    setArticles((prev) => alignArticleSeriesWithIssues(prev, parsedIssues));
    persistIssuesCsv(parsedIssues);
    setEditCount((count) => count + 1);
    return parsedIssues.length;
  }, [persistIssuesCsv]);

  const exportAsJson = useCallback(() => {
    const data = { issues, articles };
    return JSON.stringify(data, null, 2);
  }, [issues, articles]);

  const exportIssuesCsv = useCallback(() => exportIssuesAsCsv(issues), [issues]);

  const exportArticlesCsvBySeries = useCallback((series: SeriesId) => {
    const filtered = articles.filter((article) => article.series === series);
    return exportArticlesAsCsv(filtered);
  }, [articles]);

  const exportDoajCsvBySeries = useCallback((series: SeriesId) => {
    const issuesById = issues.reduce<Record<string, Issue>>((acc, issue) => {
      acc[issue.id] = issue;
      return acc;
    }, {});
    const filtered = articles.filter((article) => article.series === series);
    return exportDoajCsv(doajExportScope(filtered, issuesById).eligible, issuesById);
  }, [articles, issues]);

  const exportDoajCsvByIssue = useCallback((issueId: string) => {
    const issuesById = issues.reduce<Record<string, Issue>>((acc, issue) => {
      acc[issue.id] = issue;
      return acc;
    }, {});
    const filtered = articles.filter((article) => article.issue_id === issueId);
    return exportDoajCsv(doajExportScope(filtered, issuesById).eligible, issuesById);
  }, [articles, issues]);

  const exportDoajXmlBySeries = useCallback((series: SeriesId) => {
    const issuesById = issues.reduce<Record<string, Issue>>((acc, issue) => {
      acc[issue.id] = issue;
      return acc;
    }, {});
    const filtered = articles.filter((article) => article.series === series);
    return exportDoajXml(doajExportScope(filtered, issuesById).eligible, issuesById);
  }, [articles, issues]);

  const exportDoajXmlByIssue = useCallback((issueId: string) => {
    const issuesById = issues.reduce<Record<string, Issue>>((acc, issue) => {
      acc[issue.id] = issue;
      return acc;
    }, {});
    const filtered = articles.filter((article) => article.issue_id === issueId);
    return exportDoajXml(doajExportScope(filtered, issuesById).eligible, issuesById);
  }, [articles, issues]);

  const validateDoajBySeries = useCallback((series: SeriesId): DoajValidationResult => {
    const issuesById = issues.reduce<Record<string, Issue>>((acc, issue) => {
      acc[issue.id] = issue;
      return acc;
    }, {});
    const filtered = articles.filter((article) => article.series === series);
    if (series !== 'seria-3') {
      return {
        ok: false,
        articleCount: 0,
        errors: ['Seriile I și II rămân publice ca arhivă, dar nu au încă metadate complete pentru exportul DOAJ.'],
        warnings: [],
      };
    }
    return validateDoajRecords(filtered, issuesById);
  }, [articles, issues]);

  const validateDoajByIssue = useCallback((issueId: string): DoajValidationResult => {
    const issuesById = issues.reduce<Record<string, Issue>>((acc, issue) => {
      acc[issue.id] = issue;
      return acc;
    }, {});
    const filtered = articles.filter((article) => article.issue_id === issueId);
    const issue = issuesById[issueId];
    if (!issueEligibleForDoaj(issue)) {
      return {
        ok: false,
        articleCount: 0,
        errors: ['Numărul selectat aparține unei serii arhivistice sau nepublicate care nu este pregătită pentru export DOAJ.'],
        warnings: [],
      };
    }
    return validateDoajRecords(filtered, issuesById);
  }, [articles, issues]);

  const resetIssuesToFile = useCallback(async () => {
    const res = await fetch(ISSUES_CSV_URL);
    if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status}`);

    const csvText = await res.text();
    const parsed = parseIssuesCsvText(csvText);
    if (parsed.length === 0) throw new Error('CSV does not contain issue rows.');

    localStorage.removeItem(ISSUES_CSV_STORAGE_KEY);
    setHasIssueCsvOverride(false);
    setIssues(parsed);
    setArticles((prev) => alignArticleSeriesWithIssues(prev, parsed));
  }, []);

  const contextValue = useMemo(() => ({
    issues,
    articles,
    loading,
    error,
    updateArticle,
    updateIssue,
    addIssue,
    deleteIssue,
    importIssuesCsv,
    hasEdits: editCount > 0,
    hasIssueCsvOverride,
    exportAsJson,
    exportIssuesCsv,
    exportArticlesCsvBySeries,
    exportDoajCsvBySeries,
    exportDoajCsvByIssue,
    exportDoajXmlBySeries,
    exportDoajXmlByIssue,
    validateDoajBySeries,
    validateDoajByIssue,
    resetIssuesToFile,
  }), [
    issues,
    articles,
    loading,
    error,
    updateArticle,
    updateIssue,
    addIssue,
    deleteIssue,
    importIssuesCsv,
    editCount,
    hasIssueCsvOverride,
    exportAsJson,
    exportIssuesCsv,
    exportArticlesCsvBySeries,
    exportDoajCsvBySeries,
    exportDoajCsvByIssue,
    exportDoajXmlBySeries,
    exportDoajXmlByIssue,
    validateDoajBySeries,
    validateDoajByIssue,
    resetIssuesToFile,
  ]);

  return (
    <JournalDataContext.Provider value={contextValue}>
      {children}
    </JournalDataContext.Provider>
  );
}
