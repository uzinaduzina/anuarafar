import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const manifestPath = path.join(repoRoot, 'public', 'data', 'issues_manifest_user.js');
const outputPath = path.join(repoRoot, 'public', 'sitemap.xml');
const siteUrl = (process.env.VITE_PUBLIC_SITE_URL || 'https://anuar.iafar.ro').replace(/\/+$/, '');

const staticRoutes = [
  '/',
  '/archive',
  '/about',
  '/politici',
  '/editorial-board',
  '/scientific-board',
  '/tehnoredactare',
  '/submit',
];

function parseManifest(text) {
  const jsonStr = text.replace(/^[^{]*/, '').replace(/;\s*$/, '');
  return JSON.parse(jsonStr);
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || '').trim());
}

function makeUrlEntry(url, lastmod) {
  const lines = ['  <url>', `    <loc>${escapeXml(url)}</loc>`];
  if (lastmod && isValidDate(lastmod)) {
    lines.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
  }
  lines.push('  </url>');
  return lines.join('\n');
}

async function main() {
  const manifestText = await fs.readFile(manifestPath, 'utf8');
  const manifest = parseManifest(manifestText);
  const issues = Array.isArray(manifest.issues) ? manifest.issues : [];
  const articles = Array.isArray(manifest.articles) ? manifest.articles : [];

  const issueById = new Map(
    issues
      .filter((issue) => issue && issue.id && issue.status === 'published')
      .map((issue) => [String(issue.id), issue]),
  );

  const entries = [];

  for (const route of staticRoutes) {
    entries.push(makeUrlEntry(`${siteUrl}${route}`));
  }

  for (const issue of issueById.values()) {
    const slug = String(issue.slug || '').trim();
    if (!slug) continue;
    entries.push(makeUrlEntry(`${siteUrl}/archive/${slug}`, String(issue.date_published || '').trim()));
  }

  for (const article of articles) {
    if (!article || article.status === 'draft') continue;
    const articleId = String(article.id || '').trim();
    const issue = issueById.get(String(article.issue_id || '').trim());
    if (!articleId || !issue) continue;
    entries.push(makeUrlEntry(`${siteUrl}/article/${articleId}`, String(issue.date_published || '').trim()));
  }

  const uniqueEntries = [...new Set(entries)];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...uniqueEntries,
    '</urlset>',
    '',
  ].join('\n');

  await fs.writeFile(outputPath, xml, 'utf8');
  console.log(`Generated sitemap with ${uniqueEntries.length} URLs -> ${outputPath}`);
}

main().catch((error) => {
  console.error('Failed to generate sitemap:', error);
  process.exitCode = 1;
});
