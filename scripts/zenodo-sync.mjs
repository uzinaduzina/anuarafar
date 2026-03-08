import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repoRoot = path.resolve(import.meta.dirname, '..');
const manifestPaths = [
  path.join(repoRoot, 'public', 'data', 'issues_manifest_user.js'),
  path.join(repoRoot, 'docs', 'data', 'issues_manifest_user.js'),
  path.join(repoRoot, 'docs', 'anuarafar', 'data', 'issues_manifest_user.js'),
];

const defaultSiteUrl = 'https://anuar.iafar.ro';
const zenodoApiBase = {
  production: 'https://zenodo.org/api',
  sandbox: 'https://sandbox.zenodo.org/api',
};

function parseArgs(argv) {
  const opts = {
    issue: '',
    issueId: '',
    env: 'production',
    token: process.env.ZENODO_TOKEN || '',
    siteUrl: process.env.VITE_PUBLIC_SITE_URL || process.env.ZENODO_SITE_URL || defaultSiteUrl,
    execute: false,
    publish: false,
    updateManifest: false,
    includeReviews: false,
    max: 0,
    community: [],
    syncExisting: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--issue') opts.issue = String(argv[i + 1] || '').trim(), i += 1;
    else if (arg === '--issue-id') opts.issueId = String(argv[i + 1] || '').trim(), i += 1;
    else if (arg === '--env') opts.env = String(argv[i + 1] || '').trim(), i += 1;
    else if (arg === '--token') opts.token = String(argv[i + 1] || '').trim(), i += 1;
    else if (arg === '--site-url') opts.siteUrl = String(argv[i + 1] || '').trim(), i += 1;
    else if (arg === '--community') opts.community.push(String(argv[i + 1] || '').trim()), i += 1;
    else if (arg === '--max') opts.max = Number.parseInt(String(argv[i + 1] || '0'), 10) || 0, i += 1;
    else if (arg === '--execute') opts.execute = true;
    else if (arg === '--publish') opts.publish = true;
    else if (arg === '--update-manifest') opts.updateManifest = true;
    else if (arg === '--include-reviews') opts.includeReviews = true;
    else if (arg === '--sync-existing') opts.syncExisting = true;
    else if (arg === '--help' || arg === '-h') opts.help = true;
  }

  return opts;
}

function printHelp() {
  const text = `
Zenodo DOI sync for AAF manifest

Usage:
  node scripts/zenodo-sync.mjs --issue <issue-slug> [options]
  node scripts/zenodo-sync.mjs --issue-id <id> [options]

Options:
  --env production|sandbox     Zenodo environment (default: production)
  --token <TOKEN>              Zenodo personal access token (or env: ZENODO_TOKEN)
  --site-url <URL>             Public article base URL (default: https://anuar.iafar.ro)
  --execute                    Actually call Zenodo API (default is dry-run)
  --publish                    Publish depositions (requires --execute)
  --update-manifest            Write DOI back to all manifest copies (requires --publish)
  --include-reviews            Include review items (is_review=true)
  --sync-existing              Pull existing DOI values from your Zenodo depositions and update manifest
  --community <identifier>     Zenodo community identifier (can be repeated)
  --max <N>                    Process first N matching articles
  --help                       Show this help

Examples:
  npm run zenodo:sync -- --issue aaf-xxix-2025
  ZENODO_TOKEN=*** npm run zenodo:sync -- --issue aaf-xxix-2025 --execute --publish --update-manifest
  ZENODO_TOKEN=*** npm run zenodo:sync -- --issue aaf-xxix-2025 --env sandbox --execute
  ZENODO_TOKEN=*** npm run zenodo:sync -- --issue aaf-seria1-1932-vol-i --execute --sync-existing
`;
  console.log(text.trim());
}

function parseManifest(text) {
  const jsonStr = text.replace(/^[^{]*/, '').replace(/;\s*$/, '');
  return JSON.parse(jsonStr);
}

function stringifyManifest(data) {
  return `window.__USER_MANIFEST_OVERRIDE = ${JSON.stringify(data)};\n`;
}

function splitNames(raw) {
  const src = String(raw || '').trim();
  if (!src) return [];
  let names = src
    .split(/\s*;\s*|\s*\n\s*|\s+\band\b\s+|\s+\bși\b\s+/gi)
    .map((s) => s.trim())
    .filter(Boolean);

  if (names.length === 1 && src.includes(',')) {
    const commaParts = src
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const likelyPeople = commaParts.length > 1 && commaParts.every((p) => /\s/.test(p));
    if (likelyPeople) names = commaParts;
  }
  return [...new Set(names)];
}

function splitKeywords(article) {
  const rawChunks = [
    article.keywords,
    article.keywords_ro,
    article.keywords_en,
    article.keywords_de,
    article.keywords_fr,
  ]
    .map((v) => String(v || '').trim())
    .filter(Boolean);

  const all = rawChunks
    .flatMap((chunk) => chunk.split(','))
    .map((k) => k.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const seen = new Set();
  const deduped = [];
  for (const item of all) {
    const key = item.toLocaleLowerCase('ro-RO');
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }
  return deduped;
}

function mapLanguage(code) {
  const value = String(code || '').trim().toLowerCase();
  if (!value) return undefined;
  if (value === 'ro') return 'ron';
  if (value === 'en') return 'eng';
  if (value === 'de') return 'deu';
  if (value === 'fr') return 'fra';
  return value;
}

function cleanHtml(text) {
  return String(text || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function buildDescription(article) {
  const abstract = String(
    article.abstract ||
      article.abstract_ro ||
      article.abstract_en ||
      article.abstract_de ||
      article.abstract_fr ||
      '',
  )
    .replace(/\s+/g, ' ')
    .trim();

  if (abstract) return `<p>${cleanHtml(abstract)}</p>`;
  return `<p>${cleanHtml(article.title || 'Article metadata record')}</p>`;
}

function buildMetadata(article, issue, journalName, siteUrl, communities) {
  const creators = splitNames(article.authors).map((name) => ({ name }));
  const keywords = splitKeywords(article);
  const lang = mapLanguage(article.language);
  const issueDate = String(issue.date_published || '').trim();
  const pagesStart = String(article.pages_start || '').trim();
  const pagesEnd = String(article.pages_end || '').trim();
  const journalPages = pagesStart && pagesEnd ? `${pagesStart}-${pagesEnd}` : pagesStart || pagesEnd || undefined;

  const metadata = {
    title: String(article.title || '').trim(),
    upload_type: 'publication',
    publication_type: 'article',
    publication_date: issueDate || undefined,
    description: buildDescription(article),
    creators,
    keywords: keywords.length ? keywords : undefined,
    language: lang,
    journal_title: journalName,
    journal_volume: String(issue.volume || '').trim() || undefined,
    journal_issue: String(issue.number || '').trim() || undefined,
    journal_pages: journalPages,
    notes: String(article.section || '').trim() || undefined,
    access_right: 'open',
    related_identifiers: [
      {
        identifier: `${siteUrl.replace(/\/+$/, '')}/article/${article.id}`,
        relation: 'isAlternateIdentifier',
        resource_type: 'publication-article',
        scheme: 'url',
      },
    ],
    prereserve_doi: true,
  };

  if (communities.length > 0) {
    metadata.communities = communities.map((identifier) => ({ identifier }));
  }

  // remove undefined keys
  for (const key of Object.keys(metadata)) {
    if (metadata[key] === undefined) delete metadata[key];
  }

  return metadata;
}

async function zenodoRequest(apiBase, token, endpoint, init = {}) {
  const url = `${apiBase}${endpoint}`;
  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...init, headers });
  const responseText = await response.text();
  let payload = null;

  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = responseText;
    }
  }

  if (!response.ok) {
    const errorBody = typeof payload === 'string' ? payload : JSON.stringify(payload);
    throw new Error(`Zenodo API ${response.status} ${response.statusText}: ${errorBody}`);
  }
  return payload;
}

async function uploadFileToBucket(bucketUrl, token, filename, absoluteFilePath) {
  const body = await fs.readFile(absoluteFilePath);
  const response = await fetch(`${bucketUrl}/${encodeURIComponent(filename)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
    },
    body,
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Zenodo bucket upload failed (${response.status}): ${txt}`);
  }
  return response.json();
}

function pickDoi(deposition) {
  if (!deposition || typeof deposition !== 'object') return '';
  const direct = String(deposition.doi || '').trim();
  if (direct) return direct;
  const metadataDoi = String(deposition.metadata?.doi || '').trim();
  if (metadataDoi) return metadataDoi;
  const pre = String(deposition.metadata?.prereserve_doi?.doi || '').trim();
  return pre;
}

async function writeReport(reportRows) {
  const outDir = path.join(repoRoot, 'tmp', 'zenodo');
  await fs.mkdir(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = path.join(outDir, `report-${stamp}.json`);
  await fs.writeFile(outPath, JSON.stringify(reportRows, null, 2), 'utf8');
  return outPath;
}

async function loadPrimaryManifest() {
  const text = await fs.readFile(manifestPaths[0], 'utf8');
  return parseManifest(text);
}

async function updateManifestDois(doiByArticleId) {
  if (!doiByArticleId.size) return [];
  const changed = [];
  for (const manifestPath of manifestPaths) {
    const text = await fs.readFile(manifestPath, 'utf8');
    const data = parseManifest(text);
    let touched = 0;

    data.articles = (data.articles || []).map((article) => {
      const id = String(article?.id || '');
      const doi = doiByArticleId.get(id);
      if (!doi) return article;
      if (String(article.doi || '').trim() === doi) return article;
      touched += 1;
      return { ...article, doi };
    });

    if (touched > 0) {
      await fs.writeFile(manifestPath, stringifyManifest(data), 'utf8');
      changed.push({ manifestPath, touched });
    }
  }
  return changed;
}

function extractArticleIdFromDeposition(deposition, siteUrl) {
  const related = Array.isArray(deposition?.metadata?.related_identifiers)
    ? deposition.metadata.related_identifiers
    : [];
  const base = siteUrl.replace(/\/+$/, '');
  for (const item of related) {
    const identifier = String(item?.identifier || '').trim();
    const m = identifier.match(/\/article\/(\d+)\/?$/);
    if (m) return m[1];
    if (identifier.startsWith(`${base}/article/`)) {
      const m2 = identifier.match(/\/article\/(\d+)/);
      if (m2) return m2[1];
    }
  }
  return '';
}

async function listAllDepositions(apiBase, token) {
  const perPage = 100;
  const all = [];
  for (let page = 1; page <= 50; page += 1) {
    const chunk = await zenodoRequest(apiBase, token, `/deposit/depositions?page=${page}&size=${perPage}`, {
      method: 'GET',
    });
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    all.push(...chunk);
    if (chunk.length < perPage) break;
  }
  return all;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || (!opts.issue && !opts.issueId)) {
    printHelp();
    process.exitCode = opts.help ? 0 : 1;
    return;
  }

  if (!zenodoApiBase[opts.env]) {
    throw new Error(`Unsupported --env value "${opts.env}". Use production or sandbox.`);
  }
  if (!opts.execute && (opts.publish || opts.updateManifest || opts.syncExisting)) {
    throw new Error('--publish/--update-manifest require --execute.');
  }
  if (opts.syncExisting && (opts.publish || opts.community.length > 0)) {
    throw new Error('--sync-existing cannot be combined with --publish or --community.');
  }
  if (opts.publish && !opts.updateManifest) {
    console.warn('Warning: publish is enabled, but --update-manifest is disabled. DOI will not be written locally.');
  }
  if (opts.execute && !opts.token) {
    throw new Error('Missing Zenodo token. Pass --token or set ZENODO_TOKEN env.');
  }

  const apiBase = zenodoApiBase[opts.env];
  const manifest = await loadPrimaryManifest();
  const issues = Array.isArray(manifest.issues) ? manifest.issues : [];
  const articles = Array.isArray(manifest.articles) ? manifest.articles : [];
  const issue = issues.find((item) => {
    if (!item) return false;
    if (opts.issue && String(item.slug || '').trim() === opts.issue) return true;
    if (opts.issueId && String(item.id || '').trim() === opts.issueId) return true;
    return false;
  });

  if (!issue) {
    throw new Error('Issue not found in manifest. Use --issue <slug> or --issue-id <id>.');
  }

  const issueId = String(issue.id || '').trim();
  const issueArticles = articles.filter((article) => {
    if (!article) return false;
    if (String(article.issue_id || '').trim() !== issueId) return false;
    if (String(article.status || '').trim().toLowerCase() === 'draft') return false;
    if (!opts.includeReviews && String(article.is_review || '').trim().toLowerCase() === 'true') return false;
    return true;
  });

  if (opts.syncExisting) {
    const issueArticleIdSet = new Set(issueArticles.map((a) => String(a.id || '').trim()).filter(Boolean));
    console.log(`Issue: ${issue.slug} (${issue.year})`);
    console.log(`Mode: sync-existing | env=${opts.env}`);
    console.log(`Issue articles in scope: ${issueArticleIdSet.size}`);

    const depositions = await listAllDepositions(apiBase, opts.token);
    const doiByArticleId = new Map();
    for (const deposition of depositions) {
      const articleId = extractArticleIdFromDeposition(deposition, opts.siteUrl);
      if (!articleId || !issueArticleIdSet.has(articleId)) continue;
      const doi = pickDoi(deposition);
      if (!doi) continue;
      doiByArticleId.set(articleId, doi);
    }

    const updated = await updateManifestDois(doiByArticleId);
    console.log(`Found DOI values from depositions: ${doiByArticleId.size}`);
    if (updated.length > 0) {
      for (const item of updated) {
        console.log(`Updated manifest: ${item.manifestPath} (${item.touched} DOI fields)`);
      }
    } else {
      console.log('No manifest DOI fields changed.');
    }

    const reportRows = Array.from(doiByArticleId.entries()).map(([articleId, doi]) => ({
      article_id: articleId,
      issue_slug: String(issue.slug || ''),
      status: 'synced',
      doi,
    }));
    const reportPath = await writeReport(reportRows);
    console.log(`Report: ${reportPath}`);
    return;
  }

  let candidates = issueArticles.filter((article) => {
    if (String(article.doi || '').trim()) return false;
    if (!String(article.pdf_path || '').trim()) return false;
    return true;
  });

  if (opts.max > 0) {
    candidates = candidates.slice(0, opts.max);
  }

  if (candidates.length === 0) {
    console.log('No matching articles without DOI for selected issue.');
    return;
  }

  const journalName = String(manifest.journal?.name || 'Anuarul Arhivei de Folclor').trim();
  const reportRows = [];
  const doiByArticleId = new Map();

  console.log(`Issue: ${issue.slug} (${issue.year})`);
  console.log(`Mode: ${opts.execute ? 'execute' : 'dry-run'} | env=${opts.env}`);
  console.log(`Candidates: ${candidates.length}`);

  for (const article of candidates) {
    const articleId = String(article.id || '').trim();
    const pdfPath = String(article.pdf_path || '').trim();
    const absolutePdfPath = path.join(repoRoot, pdfPath);

    const record = {
      article_id: articleId,
      issue_slug: String(issue.slug || ''),
      title: String(article.title || ''),
      pdf_path: pdfPath,
      status: 'prepared',
      doi: '',
      zenodo_deposition_id: '',
      zenodo_url: '',
      error: '',
    };

    try {
      await fs.access(absolutePdfPath);
      const metadata = buildMetadata(article, issue, journalName, opts.siteUrl, opts.community);

      if (!opts.execute) {
        record.status = 'dry-run';
        record.metadata_preview = metadata;
        reportRows.push(record);
        console.log(`DRY-RUN article ${articleId}: ${article.title}`);
        continue;
      }

      const deposition = await zenodoRequest(apiBase, opts.token, '/deposit/depositions', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const depositionId = String(deposition.id || '');
      record.zenodo_deposition_id = depositionId;
      const bucketUrl = deposition.links?.bucket;
      if (!bucketUrl) {
        throw new Error('Missing Zenodo bucket URL on deposition.');
      }

      await uploadFileToBucket(bucketUrl, opts.token, path.basename(absolutePdfPath), absolutePdfPath);
      await zenodoRequest(apiBase, opts.token, `/deposit/depositions/${depositionId}`, {
        method: 'PUT',
        body: JSON.stringify({ metadata }),
      });

      let finalDeposition = await zenodoRequest(apiBase, opts.token, `/deposit/depositions/${depositionId}`, {
        method: 'GET',
      });

      if (opts.publish) {
        finalDeposition = await zenodoRequest(
          apiBase,
          opts.token,
          `/deposit/depositions/${depositionId}/actions/publish`,
          { method: 'POST', body: JSON.stringify({}) },
        );
      }

      record.status = opts.publish ? 'published' : 'draft-created';
      record.zenodo_url = String(finalDeposition.links?.html || '');
      record.doi = pickDoi(finalDeposition);
      if (opts.publish && record.doi) {
        doiByArticleId.set(articleId, record.doi);
      }
      console.log(`${record.status.toUpperCase()} article ${articleId}: DOI=${record.doi || '(pending)'}`);
      reportRows.push(record);
    } catch (error) {
      record.status = 'failed';
      record.error = error instanceof Error ? error.message : String(error);
      console.error(`FAILED article ${articleId}: ${record.error}`);
      reportRows.push(record);
    }
  }

  let updated = [];
  if (opts.execute && opts.publish && opts.updateManifest) {
    updated = await updateManifestDois(doiByArticleId);
  }

  const reportPath = await writeReport(reportRows);
  console.log(`Report: ${reportPath}`);

  if (updated.length > 0) {
    for (const item of updated) {
      console.log(`Updated manifest: ${item.manifestPath} (${item.touched} DOI fields)`);
    }
  } else if (opts.execute && opts.publish && opts.updateManifest) {
    console.log('No manifest DOI fields changed.');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
