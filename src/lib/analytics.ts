const ANALYTICS_API_BASE = (import.meta.env.VITE_AUTH_API_BASE || '').trim().replace(/\/+$/, '');

export type AnalyticsEntityType = 'article' | 'page' | 'download';

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
  articleTotals: AnalyticsCounts;
  pageTotals: AnalyticsCounts;
  downloadTotals: AnalyticsCounts;
  articleTimeline: AnalyticsTimelinePoint[];
  pageTimeline: AnalyticsTimelinePoint[];
  downloadTimeline: AnalyticsTimelinePoint[];
  articleBreakdown: AnalyticsBreakdownGroup;
  downloadBreakdown: AnalyticsBreakdownGroup;
}

interface AnalyticsApiResponse {
  ok?: boolean;
  error?: string;
  summary?: unknown;
  articles?: unknown;
  pages?: unknown;
  downloads?: unknown;
  articleTotals?: unknown;
  pageTotals?: unknown;
  downloadTotals?: unknown;
  articleTimeline?: unknown;
  pageTimeline?: unknown;
  downloadTimeline?: unknown;
  articleBreakdown?: unknown;
  downloadBreakdown?: unknown;
}

interface TrackAnalyticsViewInput {
  entityType: AnalyticsEntityType;
  entityId: string;
  label: string;
  path: string;
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
  if ((entityType !== 'article' && entityType !== 'page' && entityType !== 'download') || !entityId) return null;
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
  if (pathname === '/submit') return 'Trimite manuscris';
  if (pathname === '/about') return 'Despre revistă';
  if (pathname === '/doaj') return 'Politici DOAJ';
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

  const response = await fetch(`${ANALYTICS_API_BASE}/admin/analytics`, {
    method: 'GET',
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
    articleTotals: parseCounts(payload.articleTotals),
    pageTotals: parseCounts(payload.pageTotals),
    downloadTotals: parseCounts(payload.downloadTotals),
    articleTimeline: parseTimeline(payload.articleTimeline),
    pageTimeline: parseTimeline(payload.pageTimeline),
    downloadTimeline: parseTimeline(payload.downloadTimeline),
    articleBreakdown: parseBreakdownGroup(payload.articleBreakdown),
    downloadBreakdown: parseBreakdownGroup(payload.downloadBreakdown),
  };
}
