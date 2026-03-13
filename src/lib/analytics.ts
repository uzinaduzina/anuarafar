import { resolveAuthApiBase } from '@/lib/authApi';

const ANALYTICS_API_BASE = resolveAuthApiBase();
const ANALYTICS_THROTTLE_STORAGE_KEY = 'aaf_analytics_throttle_v2';
const ANALYTICS_THROTTLE_MAX_ENTRIES = 2000;
const ANALYTICS_THROTTLE_TTL_MS = 1000 * 60 * 60 * 24 * 45;
const ANALYTICS_THROTTLE_BY_ENTITY: Record<AnalyticsEntityType, number> = {
  article: 1000 * 60 * 30,
  page: 1000 * 60 * 20,
  download: 1000 * 60 * 2,
  search: 1000 * 60 * 10,
};

let analyticsThrottleLoaded = false;
let analyticsThrottleMap = new Map<string, number>();

export type AnalyticsEntityType = 'article' | 'page' | 'download' | 'search';

export interface AnalyticsCounts {
  lastDay: number;
  lastWeek: number;
  lastMonth: number;
  total: number;
}

export interface AnalyticsSummary extends AnalyticsCounts {
  entityType: AnalyticsEntityType;
  entityId: string;
  label: string;
  path: string;
  lastViewedAt: string;
}

export interface AnalyticsTimelinePoint {
  date: string;
  views: number;
}

export interface AnalyticsBreakdownCounts {
  [key: string]: number;
}

export interface AnalyticsBreakdownGroup {
  devices: AnalyticsBreakdownCounts;
  operatingSystems: AnalyticsBreakdownCounts;
  countries: AnalyticsBreakdownCounts;
  referrers: AnalyticsBreakdownCounts;
  screenResolutions: AnalyticsBreakdownCounts;
}

export interface AnalyticsDashboardData {
  articles: AnalyticsSummary[];
  pages: AnalyticsSummary[];
  downloads: AnalyticsSummary[];
  searches: AnalyticsSummary[];
  articleTotals: AnalyticsCounts;
  pageTotals: AnalyticsCounts;
  downloadTotals: AnalyticsCounts;
  searchTotals: AnalyticsCounts;
  articleTimeline: AnalyticsTimelinePoint[];
  pageTimeline: AnalyticsTimelinePoint[];
  downloadTimeline: AnalyticsTimelinePoint[];
  searchTimeline: AnalyticsTimelinePoint[];
  articleBreakdown: AnalyticsBreakdownGroup;
  pageBreakdown: AnalyticsBreakdownGroup;
  downloadBreakdown: AnalyticsBreakdownGroup;
  searchBreakdown: AnalyticsBreakdownGroup;
}

interface AnalyticsApiResponse {
  ok?: boolean;
  error?: string;
  summary?: unknown;
  articles?: unknown;
  pages?: unknown;
  downloads?: unknown;
  searches?: unknown;
  articleTotals?: unknown;
  pageTotals?: unknown;
  downloadTotals?: unknown;
  searchTotals?: unknown;
  articleTimeline?: unknown;
  pageTimeline?: unknown;
  downloadTimeline?: unknown;
  searchTimeline?: unknown;
  articleBreakdown?: unknown;
  pageBreakdown?: unknown;
  downloadBreakdown?: unknown;
  searchBreakdown?: unknown;
}

interface TrackAnalyticsViewInput {
  entityType: AnalyticsEntityType;
  entityId: string;
  label: string;
  path: string;
}

function normalizeThrottleEntityId(entityId: string): string {
  return entityId.trim().toLowerCase();
}

function analyticsThrottleKey(entityType: AnalyticsEntityType, entityId: string): string {
  return `${entityType}:${normalizeThrottleEntityId(entityId)}`;
}

function loadAnalyticsThrottleMap() {
  if (analyticsThrottleLoaded) return;
  analyticsThrottleLoaded = true;

  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(ANALYTICS_THROTTLE_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return;

    const now = Date.now();
    for (const [key, value] of Object.entries(parsed)) {
      if (!key) continue;
      const timestamp = typeof value === 'number' ? value : Number(value);
      if (!Number.isFinite(timestamp) || timestamp <= 0) continue;
      if (now - timestamp > ANALYTICS_THROTTLE_TTL_MS) continue;
      analyticsThrottleMap.set(key, timestamp);
    }
  } catch {
    analyticsThrottleMap = new Map<string, number>();
  }
}

function persistAnalyticsThrottleMap() {
  if (typeof window === 'undefined') return;

  const entries = [...analyticsThrottleMap.entries()].sort((a, b) => b[1] - a[1]);
  if (entries.length > ANALYTICS_THROTTLE_MAX_ENTRIES) {
    entries.splice(ANALYTICS_THROTTLE_MAX_ENTRIES);
    analyticsThrottleMap = new Map(entries);
  }

  const payload: Record<string, number> = {};
  for (const [key, value] of analyticsThrottleMap.entries()) {
    payload[key] = value;
  }

  try {
    window.localStorage.setItem(ANALYTICS_THROTTLE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage quota and privacy mode errors
  }
}

function shouldSendAnalyticsEvent(entityType: AnalyticsEntityType, entityId: string): boolean {
  const normalizedId = normalizeThrottleEntityId(entityId);
  if (!normalizedId) return false;

  const throttleMs = ANALYTICS_THROTTLE_BY_ENTITY[entityType];
  if (!Number.isFinite(throttleMs) || throttleMs <= 0) return true;

  loadAnalyticsThrottleMap();
  const now = Date.now();
  const key = analyticsThrottleKey(entityType, normalizedId);
  const lastSentAt = analyticsThrottleMap.get(key) || 0;

  if (lastSentAt > 0 && now - lastSentAt < throttleMs) {
    return false;
  }

  const cutoff = now - ANALYTICS_THROTTLE_TTL_MS;
  for (const [entryKey, timestamp] of analyticsThrottleMap.entries()) {
    if (timestamp < cutoff) analyticsThrottleMap.delete(entryKey);
  }

  analyticsThrottleMap.set(key, now);
  persistAnalyticsThrottleMap();
  return true;
}

function emptyCounts(): AnalyticsCounts {
  return {
    lastDay: 0,
    lastWeek: 0,
    lastMonth: 0,
    total: 0,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function parseCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function parseSummary(value: unknown): AnalyticsSummary | null {
  if (!isRecord(value)) return null;
  const entityType = typeof value.entityType === 'string' ? value.entityType : '';
  const entityId = typeof value.entityId === 'string' ? value.entityId : '';
  if ((entityType !== 'article' && entityType !== 'page' && entityType !== 'download' && entityType !== 'search') || !entityId) return null;
  return {
    entityType,
    entityId,
    label: typeof value.label === 'string' ? value.label : entityId,
    path: typeof value.path === 'string' ? value.path : '',
    lastViewedAt: typeof value.lastViewedAt === 'string' ? value.lastViewedAt : '',
    lastDay: parseCount(value.lastDay),
    lastWeek: parseCount(value.lastWeek),
    lastMonth: parseCount(value.lastMonth),
    total: parseCount(value.total),
  };
}

function parseCounts(value: unknown): AnalyticsCounts {
  if (!isRecord(value)) return emptyCounts();
  return {
    lastDay: parseCount(value.lastDay),
    lastWeek: parseCount(value.lastWeek),
    lastMonth: parseCount(value.lastMonth),
    total: parseCount(value.total),
  };
}

function parseTimeline(value: unknown): AnalyticsTimelinePoint[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => isRecord(entry))
    .map((entry) => ({
      date: typeof entry.date === 'string' ? entry.date : '',
      views: parseCount(entry.views),
    }))
    .filter((entry) => entry.date.length > 0);
}

function emptyBreakdownGroup(): AnalyticsBreakdownGroup {
  return {
    devices: {},
    operatingSystems: {},
    countries: {},
    referrers: {},
    screenResolutions: {},
  };
}

function parseBreakdownCounts(value: unknown): AnalyticsBreakdownCounts {
  if (!isRecord(value)) return {};

  const next: AnalyticsBreakdownCounts = {};
  for (const [key, rawValue] of Object.entries(value)) {
    const trimmedKey = key.trim();
    const count = parseCount(rawValue);
    if (!trimmedKey || count <= 0) continue;
    next[trimmedKey] = count;
  }
  return next;
}

function parseBreakdownGroup(value: unknown): AnalyticsBreakdownGroup {
  if (!isRecord(value)) return emptyBreakdownGroup();
  return {
    devices: parseBreakdownCounts(value.devices),
    operatingSystems: parseBreakdownCounts(value.operatingSystems),
    countries: parseBreakdownCounts(value.countries),
    referrers: parseBreakdownCounts(value.referrers),
    screenResolutions: parseBreakdownCounts(value.screenResolutions),
  };
}

function parseSummaryList(value: unknown): AnalyticsSummary[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => parseSummary(entry))
    .filter((entry): entry is AnalyticsSummary => Boolean(entry));
}

async function parseApiResponse(response: Response): Promise<AnalyticsApiResponse> {
  const raw = await response.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as AnalyticsApiResponse;
  } catch {
    return {};
  }
}

export function labelForPublicPath(pathname: string): string {
  if (pathname === '/') return 'Acasă';
  if (pathname === '/archive') return 'Arhivă';
  if (pathname === '/search') return 'Căutare';
  if (pathname === '/submit') return 'Trimite manuscris';
  if (pathname === '/about') return 'Despre revistă';
  if (pathname === '/politici' || pathname === '/doaj') return 'Politici editoriale';
  if (pathname === '/scientific-board') return 'Comitet științific';
  if (pathname === '/editorial-board') return 'Colegiu de redacție';
  if (pathname === '/tehnoredactare') return 'Tehnoredactare';
  if (pathname.startsWith('/archive/')) return `Număr ${decodeURIComponent(pathname.split('/').filter(Boolean).slice(1).join(' / ')).replace(/[-_]+/g, ' ')}`;
  if (pathname.startsWith('/article/')) return `Pagină articol ${decodeURIComponent(pathname.split('/').filter(Boolean).slice(1).join(' / '))}`;

  const cleaned = pathname.replace(/^\/+|\/+$/g, '');
  if (!cleaned) return 'Acasă';
  return decodeURIComponent(cleaned)
    .split('/')
    .map((segment) => segment.replace(/[-_]+/g, ' '))
    .join(' / ');
}

function buildClientAnalyticsMetadata() {
  if (typeof window === 'undefined') {
    return {
      referrer: '',
      siteHost: '',
      screenResolution: '',
    };
  }

  const width = Number(window.screen?.width) || 0;
  const height = Number(window.screen?.height) || 0;

  return {
    referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
    siteHost: window.location.host || '',
    screenResolution: width > 0 && height > 0 ? `${width}x${height}` : '',
  };
}

export async function trackAnalyticsView(input: TrackAnalyticsViewInput): Promise<AnalyticsSummary | null> {
  if (!ANALYTICS_API_BASE || !input.entityId.trim()) return null;
  if (!shouldSendAnalyticsEvent(input.entityType, input.entityId)) return null;

  try {
    const metadata = buildClientAnalyticsMetadata();
    const response = await fetch(`${ANALYTICS_API_BASE}/analytics/view`, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...input,
        ...metadata,
      }),
    });
    const payload = await parseApiResponse(response);
    if (!response.ok || payload.ok === false) return null;
    return parseSummary(payload.summary);
  } catch {
    return null;
  }
}

export async function fetchAnalyticsSummary(
  entityType: AnalyticsEntityType,
  entityId: string,
): Promise<AnalyticsSummary | null> {
  if (!ANALYTICS_API_BASE || !entityId.trim()) return null;

  try {
    const url = new URL(`${ANALYTICS_API_BASE}/analytics/summary`);
    url.searchParams.set('entityType', entityType);
    url.searchParams.set('entityId', entityId);
    const response = await fetch(url.toString(), { method: 'GET' });
    const payload = await parseApiResponse(response);
    if (!response.ok || payload.ok === false) return null;
    return parseSummary(payload.summary);
  } catch {
    return null;
  }
}

export async function fetchAdminAnalyticsDashboard(token: string): Promise<AnalyticsDashboardData> {
  if (!ANALYTICS_API_BASE) {
    throw new Error('Serviciul analytics nu este configurat.');
  }

  const url = new URL(`${ANALYTICS_API_BASE}/admin/analytics`);
  url.searchParams.set('_ts', String(Date.now()));

  const response = await fetch(url.toString(), {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await parseApiResponse(response);

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || 'Nu am putut încărca statisticile.');
  }

  return {
    articles: parseSummaryList(payload.articles),
    pages: parseSummaryList(payload.pages),
    downloads: parseSummaryList(payload.downloads),
    searches: parseSummaryList(payload.searches),
    articleTotals: parseCounts(payload.articleTotals),
    pageTotals: parseCounts(payload.pageTotals),
    downloadTotals: parseCounts(payload.downloadTotals),
    searchTotals: parseCounts(payload.searchTotals),
    articleTimeline: parseTimeline(payload.articleTimeline),
    pageTimeline: parseTimeline(payload.pageTimeline),
    downloadTimeline: parseTimeline(payload.downloadTimeline),
    searchTimeline: parseTimeline(payload.searchTimeline),
    articleBreakdown: parseBreakdownGroup(payload.articleBreakdown),
    pageBreakdown: parseBreakdownGroup(payload.pageBreakdown),
    downloadBreakdown: parseBreakdownGroup(payload.downloadBreakdown),
    searchBreakdown: parseBreakdownGroup(payload.searchBreakdown),
  };
}
