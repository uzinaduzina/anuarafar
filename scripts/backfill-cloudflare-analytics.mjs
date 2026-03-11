import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const workerDir = path.join(repoRoot, 'worker', 'email-auth');
const manifestPath = path.join(repoRoot, 'public', 'data', 'issues_manifest_user.js');
const namespaceId = process.env.AUTH_KV_NAMESPACE_ID || 'a23b7b1d45044297b05b1c1384dfd72b';
const accountId = process.env.CF_ACCOUNT_ID || '185d5b87c5be11fc7f6835fa5f3afe2c';
const apiToken = String(process.env.AAF_CF_API_TOKEN || process.env.CF_API_TOKEN || '').trim();
const siteTag = String(process.env.CF_SITE_TAG || process.env.CF_WEB_ANALYTICS_SITE_TAG || '').trim();
const startIso = String(process.env.ANALYTICS_BACKFILL_START_AT || '2026-03-09T12:00:00Z').trim();
const endIso = String(process.env.ANALYTICS_BACKFILL_END_AT || '2026-03-11T18:50:00Z').trim();

if (!apiToken) {
  console.error('Missing CF_API_TOKEN.');
  process.exit(1);
}

if (!siteTag) {
  console.error('Missing CF_SITE_TAG (Cloudflare site_tag, not snippet token).');
  process.exit(1);
}

function readManifest() {
  const raw = fs.readFileSync(manifestPath, 'utf8').trim();
  const prefix = 'window.__USER_MANIFEST_OVERRIDE = ';
  const suffix = ';';
  if (!raw.startsWith(prefix) || !raw.endsWith(suffix)) {
    throw new Error('Unexpected manifest format.');
  }
  return JSON.parse(raw.slice(prefix.length, -suffix.length));
}

function graphql(query) {
  const response = fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  return response.then(async (result) => {
    const payload = await result.json();
    if (!result.ok || payload.errors) {
      const message = Array.isArray(payload?.errors)
        ? payload.errors.map((entry) => entry.message).join(' | ')
        : `HTTP ${result.status}`;
      throw new Error(message);
    }
    return payload.data.viewer.accounts[0].rumPageloadEventsAdaptiveGroups || [];
  });
}

function buildQuery(dimensions) {
  return `query {
  viewer {
    accounts(filter: { accountTag: ${JSON.stringify(accountId)} }) {
      rumPageloadEventsAdaptiveGroups(
        limit: 5000
        filter: {
          datetime_geq: ${JSON.stringify(startIso)}
          datetime_leq: ${JSON.stringify(endIso)}
          siteTag: ${JSON.stringify(siteTag)}
        }
      ) {
        dimensions { ${dimensions} }
        sum { visits }
      }
    }
  }
}`;
}

function kvGet(key) {
  try {
    const value = execFileSync(
      'npx',
      ['wrangler', 'kv', 'key', 'get', '--namespace-id', namespaceId, key, '--remote'],
      {
        cwd: workerDir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, CF_API_TOKEN: '', CLOUDFLARE_API_TOKEN: '' },
      },
    );
    return value.trim() ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function kvPut(key, value) {
  const tmpPath = path.join(repoRoot, 'tmp', `${Buffer.from(key).toString('hex')}.json`);
  fs.mkdirSync(path.dirname(tmpPath), { recursive: true });
  fs.writeFileSync(tmpPath, JSON.stringify(value));
  execFileSync(
    'npx',
    ['wrangler', 'kv', 'key', 'put', '--namespace-id', namespaceId, key, '--path', tmpPath, '--remote'],
    {
      cwd: workerDir,
      stdio: 'pipe',
      env: { ...process.env, CF_API_TOKEN: '', CLOUDFLARE_API_TOKEN: '' },
    },
  );
  fs.unlinkSync(tmpPath);
}

function sumBuckets(buckets) {
  return Object.values(buckets || {}).reduce((sum, value) => sum + Math.max(0, Math.round(Number(value) || 0)), 0);
}

function analyticsStorageKey(entityType, entityId) {
  return `analytics_entity_v2:${entityType}:${encodeURIComponent(entityId)}`;
}

function sanitizeLabel(value, fallback) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 240) || fallback;
}

function sanitizePath(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return (trimmed.startsWith('/') ? trimmed : `/${trimmed}`).slice(0, 280);
}

function emptyDimensions() {
  return {
    devices: {},
    operatingSystems: {},
    countries: {},
    referrers: {},
    screenResolutions: {},
  };
}

function addDimension(bucket, key, amount) {
  const label = String(key || '').trim();
  if (!label || amount <= 0) return;
  bucket[label] = (bucket[label] || 0) + amount;
}

function normalizeReferrerHost(value) {
  const host = String(value || '').trim().toLowerCase().replace(/^www\./, '');
  if (!host) return 'Direct';
  if (host === 'anuar.iafar.ro') return 'Intern';
  return host;
}

function mapPath(pathname, manifest) {
  const articlesById = manifest._articlesById;
  const issuesBySlug = manifest._issuesBySlug;
  const cleanPath = sanitizePath(pathname);

  if (cleanPath.startsWith('/article/')) {
    const articleId = cleanPath.split('/article/')[1] || '';
    const article = articlesById.get(articleId);
    return [
      {
        entityType: 'article',
        entityId: articleId,
        path: cleanPath,
        label: sanitizeLabel(article?.title, `Articol ${articleId}`),
      },
      {
        entityType: 'page',
        entityId: cleanPath,
        path: cleanPath,
        label: sanitizeLabel(article?.title, cleanPath.replace(/^\//, '')),
      },
    ];
  }

  if (cleanPath.startsWith('/archive/')) {
    const slug = cleanPath.split('/archive/')[1] || '';
    const issue = issuesBySlug.get(slug);
    return [{
      entityType: 'page',
      entityId: cleanPath,
      path: cleanPath,
      label: sanitizeLabel(issue?.title, cleanPath.replace(/^\//, '')),
    }];
  }

  const labelMap = new Map([
    ['/', 'Acasă'],
    ['/archive', 'Arhivă'],
    ['/search', 'Căutare în arhivă'],
    ['/submit', 'Trimite manuscris'],
    ['/admin-login', 'Admin login'],
    ['/dashboard', 'Dashboard'],
    ['/dashboard/stats', 'Statistici'],
    ['/dashboard/submissions', 'Articole trimise'],
  ]);

  return [{
    entityType: 'page',
    entityId: cleanPath,
    path: cleanPath,
    label: sanitizeLabel(labelMap.get(cleanPath), cleanPath.replace(/^\//, '')),
  }];
}

function parseDay(value) {
  return String(value || '').slice(0, 10);
}

function parseIso(value) {
  const iso = String(value || '').trim();
  const timestamp = Date.parse(iso);
  return Number.isFinite(timestamp) ? { iso, timestamp } : null;
}

async function main() {
  const manifest = readManifest();
  manifest._articlesById = new Map(manifest.articles.map((article) => [String(article.id), article]));
  manifest._issuesBySlug = new Map(manifest.issues.map((issue) => [String(issue.slug), issue]));

  const [minuteGroups, deviceGroups, countryGroups, referrerGroups] = await Promise.all([
    graphql(buildQuery('requestPath datetimeMinute')),
    graphql(buildQuery('requestPath deviceType')),
    graphql(buildQuery('requestPath countryName')),
    graphql(buildQuery('requestPath refererHost')),
  ]);

  const records = new Map();

  function ensureRecord(key, seed) {
    if (!records.has(key)) {
      records.set(key, {
        entityType: seed.entityType,
        entityId: seed.entityId,
        label: seed.label,
        path: seed.path,
        total: 0,
        buckets: {},
        dimensions: emptyDimensions(),
        lastViewedAt: '',
      });
    }
    return records.get(key);
  }

  for (const row of minuteGroups) {
    const requestPath = sanitizePath(row?.dimensions?.requestPath || '');
    const visits = Math.max(0, Math.round(Number(row?.sum?.visits) || 0));
    const minuteIso = String(row?.dimensions?.datetimeMinute || '').trim();
    if (!requestPath || visits <= 0 || !minuteIso) continue;
    const mapped = mapPath(requestPath, manifest);
    const parsed = parseIso(minuteIso);
    if (!parsed) continue;
    const day = parseDay(parsed.iso);

    for (const seed of mapped) {
      const key = analyticsStorageKey(seed.entityType, seed.entityId);
      const record = ensureRecord(key, seed);
      record.total += visits;
      record.buckets[day] = (record.buckets[day] || 0) + visits;
      if (!record.lastViewedAt || parsed.timestamp > Date.parse(record.lastViewedAt || '1970-01-01T00:00:00Z')) {
        record.lastViewedAt = parsed.iso;
      }
    }
  }

  const dimensionMerges = [
    [deviceGroups, 'devices', (value) => String(value || '').trim() || 'Necunoscut'],
    [countryGroups, 'countries', (value) => String(value || '').trim() || 'Necunoscută'],
    [referrerGroups, 'referrers', normalizeReferrerHost],
  ];

  for (const [rows, dimensionKey, normalizer] of dimensionMerges) {
    for (const row of rows) {
      const requestPath = sanitizePath(row?.dimensions?.requestPath || '');
      const visits = Math.max(0, Math.round(Number(row?.sum?.visits) || 0));
      if (!requestPath || visits <= 0) continue;
      const mapped = mapPath(requestPath, manifest);
      for (const seed of mapped) {
        const key = analyticsStorageKey(seed.entityType, seed.entityId);
        const record = ensureRecord(key, seed);
        addDimension(record.dimensions[dimensionKey], normalizer(row?.dimensions?.[dimensionKey === 'devices' ? 'deviceType' : dimensionKey === 'countries' ? 'countryName' : 'refererHost']), visits);
      }
    }
  }

  let mergedCount = 0;
  let addedViews = 0;
  const now = Date.now();

  for (const [storageKey, backfill] of records.entries()) {
    const existing = kvGet(storageKey);
    const merged = existing && typeof existing === 'object'
      ? {
          ...existing,
          entityType: backfill.entityType,
          entityId: backfill.entityId,
          label: backfill.label || existing.label || backfill.entityId,
          path: backfill.path || existing.path || '',
          total: Math.max(
            Math.max(0, Math.round(Number(existing.total) || 0)),
            sumBuckets(existing.buckets || {}),
          ) + backfill.total,
          buckets: { ...(existing.buckets || {}) },
          dimensions: {
            devices: { ...((existing.dimensions && existing.dimensions.devices) || {}) },
            operatingSystems: { ...((existing.dimensions && existing.dimensions.operatingSystems) || {}) },
            countries: { ...((existing.dimensions && existing.dimensions.countries) || {}) },
            referrers: { ...((existing.dimensions && existing.dimensions.referrers) || {}) },
            screenResolutions: { ...((existing.dimensions && existing.dimensions.screenResolutions) || {}) },
          },
          createdAt: Number(existing.createdAt) || now,
          updatedAt: now,
          lastViewedAt: existing.lastViewedAt && Date.parse(existing.lastViewedAt) > Date.parse(backfill.lastViewedAt || '1970-01-01T00:00:00Z')
            ? existing.lastViewedAt
            : (backfill.lastViewedAt || existing.lastViewedAt || ''),
        }
      : {
          ...backfill,
          createdAt: now,
          updatedAt: now,
        };

    for (const [day, count] of Object.entries(backfill.buckets)) {
      merged.buckets[day] = (merged.buckets[day] || 0) + count;
    }

    for (const [bucketName, entries] of Object.entries(backfill.dimensions)) {
      for (const [name, count] of Object.entries(entries)) {
        merged.dimensions[bucketName][name] = (merged.dimensions[bucketName][name] || 0) + count;
      }
    }

    merged.total = Math.max(merged.total, sumBuckets(merged.buckets));

    kvPut(storageKey, merged);
    mergedCount += 1;
    addedViews += backfill.total;
  }

  console.log(JSON.stringify({
    ok: true,
    records: mergedCount,
    addedViews,
    startIso,
    endIso,
    siteTag,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
