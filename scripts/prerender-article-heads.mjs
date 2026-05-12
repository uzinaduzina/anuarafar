import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const manifestPath = path.join(repoRoot, 'public', 'data', 'issues_manifest_user.js');
const distDir = path.join(repoRoot, 'dist');
const indexPath = path.join(distDir, 'index.html');
const siteUrl = (process.env.VITE_PUBLIC_SITE_URL || 'https://anuar.iafar.ro').replace(/\/+$/, '');
const pdfBaseUrl = (process.env.VITE_PDF_BASE_URL || 'https://raw.githubusercontent.com/uzinaduzina/anuarafar/main/').replace(/\/+$/, '');

function parseManifest(text) {
  const jsonStr = text.replace(/^[^{]*/, '').replace(/;\s*$/, '');
  return JSON.parse(jsonStr);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function stripHtml(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeUrlPath(value) {
  return String(value || '').replace(/^\/+/, '');
}

function articleUrl(article) {
  return `${siteUrl}/article/${encodeURIComponent(String(article.id))}`;
}

function pdfUrl(article) {
  const raw = String(article.pdf_path || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${pdfBaseUrl}/${normalizeUrlPath(raw)}`;
}

function publicationDate(issue) {
  const raw = String(issue?.date_published || issue?.year || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw.replaceAll('-', '/');
  const year = raw.match(/\d{4}/)?.[0];
  return year || '';
}

function splitAuthors(value) {
  return String(value || '')
    .split(/\s*(?:;|\bet\b|\band\b| și | si )\s*/i)
    .flatMap((part) => part.split(/\s*,\s*(?=[A-ZĂÂÎȘȚÁÉÍÓÖŐÚÜŰ])/u))
    .map((name) => name.trim())
    .filter(Boolean);
}

function formatAuthorName(name) {
  const cleaned = String(name || '')
    .replace(/^(Acad\.|Prof\.|Dr\.|Conf\.|Lect\.)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned || cleaned.includes(',')) return cleaned;

  const parts = cleaned.split(' ');
  if (parts.length < 2) return cleaned;
  const last = parts.pop();
  return `${last}, ${parts.join(' ')}`;
}

function splitAffiliations(value) {
  return String(value || '')
    .split(/\s*;\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function keywords(article) {
  const raw = article.keywords || article.keywords_ro || article.keywords_en || article.keywords_de || article.keywords_fr || '';
  return String(raw)
    .split(/[,;]\s*/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, all) => all.findIndex((candidate) => candidate.toLowerCase() === item.toLowerCase()) === index)
    .join('; ');
}

function abstractValue(article) {
  return stripHtml(article.abstract || article.abstract_en || article.abstract_ro || article.abstract_de || article.abstract_fr || '');
}

function meta(name, content) {
  const value = stripHtml(content);
  if (!value) return '';
  return `  <meta name="${escapeHtml(name)}" content="${escapeHtml(value)}">`;
}

function buildCitationHead(article, issue, journal) {
  const authors = splitAuthors(article.authors);
  const affiliations = splitAffiliations(article.affiliations);
  const articlePdfUrl = pdfUrl(article);
  const articleHtmlUrl = articleUrl(article);
  const tags = [
    meta('citation_journal_title', journal.name || 'Anuarul Arhivei de Folclor'),
    meta('citation_journal_abbrev', journal.abbr || 'AAF'),
    meta('citation_issn', journal.issn || issue?.issn || '1220-3661'),
    meta('citation_publisher', 'Romanian Academy - Cluj-Napoca Branch · Folklore Archive Institute'),
    meta('citation_title', article.title),
    ...authors.map((author) => meta('citation_author', formatAuthorName(author))),
    ...affiliations.map((affiliation) => meta('citation_author_institution', affiliation)),
    meta('citation_volume', issue?.volume),
    meta('citation_issue', issue?.number),
    meta('citation_firstpage', article.pages_start),
    meta('citation_lastpage', article.pages_end),
    meta('citation_publication_date', publicationDate(issue)),
    meta('citation_doi', article.doi),
    meta('citation_language', article.language || journal.language || 'ro'),
    meta('citation_pdf_url', articlePdfUrl),
    meta('citation_abstract_html_url', articleHtmlUrl),
    meta('citation_keywords', keywords(article)),
    meta('citation_abstract', abstractValue(article)),
    meta('DC.title', article.title),
    meta('DC.identifier', article.doi ? `doi:${article.doi}` : articleHtmlUrl),
    meta('DC.relation.ispartof', journal.name || 'Anuarul Arhivei de Folclor'),
  ].filter(Boolean);

  return [
    '  <!-- Google Scholar / Highwire Press metadata -->',
    ...tags,
    '  <!-- End Google Scholar metadata -->',
  ].join('\n');
}

function injectHead(indexHtml, headHtml) {
  const scriptIndex = indexHtml.search(/\n\s*<script\b/i);
  if (scriptIndex >= 0) {
    return `${indexHtml.slice(0, scriptIndex)}\n${headHtml}${indexHtml.slice(scriptIndex)}`;
  }
  if (!indexHtml.includes('</head>')) {
    throw new Error('dist/index.html does not contain </head>.');
  }
  return indexHtml.replace('</head>', `${headHtml}\n</head>`);
}

async function main() {
  const [manifestText, indexHtml] = await Promise.all([
    fs.readFile(manifestPath, 'utf8'),
    fs.readFile(indexPath, 'utf8'),
  ]);
  const manifest = parseManifest(manifestText);
  const journal = manifest.journal || {};
  const issues = Array.isArray(manifest.issues) ? manifest.issues : [];
  const articles = Array.isArray(manifest.articles) ? manifest.articles : [];
  const publishedIssues = new Map(
    issues
      .filter((issue) => issue && issue.id && issue.status === 'published')
      .map((issue) => [String(issue.id), issue]),
  );

  let count = 0;
  for (const article of articles) {
    if (!article || article.status === 'draft') continue;
    const id = String(article.id || '').trim();
    const issue = publishedIssues.get(String(article.issue_id || '').trim());
    if (!id || !issue) continue;

    const headHtml = buildCitationHead(article, issue, journal);
    const articleHtml = injectHead(indexHtml, headHtml);
    const outputDir = path.join(distDir, 'article', id);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(path.join(outputDir, 'index.html'), articleHtml, 'utf8');
    count += 1;
  }

  console.log(`Pre-rendered ${count} article HTML pages with Highwire citation metadata.`);
}

main().catch((error) => {
  console.error('Failed to pre-render article metadata:', error);
  process.exitCode = 1;
});
