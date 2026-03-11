import { useEffect, useMemo, useState, type ElementType } from 'react';
import { AlertCircle, Download, Eye, FileText, Globe2, Loader2, Search } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import {
  type AnalyticsBreakdownCounts,
  type AnalyticsBreakdownGroup,
  type AnalyticsCounts,
  type AnalyticsDashboardData,
  type AnalyticsSummary,
} from '@/lib/analytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const chartConfig = {
  views: {
    label: 'Vizualizări',
    color: 'hsl(var(--primary))',
  },
};

function formatNumber(value: number) {
  return value.toLocaleString('ro-RO');
}

function formatDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' });
}

function formatLastViewedAt(value: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ro-RO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function compactLabel(value: string, max = 42) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function sortBreakdownEntries(counts: AnalyticsBreakdownCounts) {
  return Object.entries(counts)
    .map(([key, count]) => ({ key, count }))
    .sort((left, right) => right.count - left.count || left.key.localeCompare(right.key));
}

function formatCountryLabel(countryCode: string) {
  if (countryCode === 'XX') return 'Țară necunoscută';
  try {
    const formatter = new Intl.DisplayNames(['ro'], { type: 'region' });
    return formatter.of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
}

function formatBreakdownLabel(kind: keyof AnalyticsBreakdownGroup, key: string) {
  if (kind === 'countries') return formatCountryLabel(key);
  return key;
}

function SummaryPanel({
  title,
  description,
  icon: Icon,
  counts,
}: {
  title: string;
  description: string;
  icon: ElementType;
  counts: AnalyticsCounts;
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="font-serif text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="rounded-full bg-primary/10 p-2.5 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { label: 'Ultima zi', value: counts.lastDay },
            { label: 'Ultima săptămână', value: counts.lastWeek },
            { label: 'Ultima lună', value: counts.lastMonth },
            { label: 'Total', value: counts.total },
          ].map((item) => (
            <div key={item.label} className="rounded-md border bg-muted/30 px-3 py-3">
              <div className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {item.label}
              </div>
              <div className="mt-1 text-xl font-semibold tabular-nums">{formatNumber(item.value)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyAnalyticsState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed text-center">
      <Eye className="mb-3 h-8 w-8 text-muted-foreground" />
      <p className="font-medium">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">Statisticile apar după primele evenimente în producție.</p>
    </div>
  );
}

function BreakdownCard({
  title,
  description,
  kind,
  counts,
}: {
  title: string;
  description: string;
  kind: keyof AnalyticsBreakdownGroup;
  counts: AnalyticsBreakdownCounts;
}) {
  const entries = useMemo(() => sortBreakdownEntries(counts).slice(0, 10), [counts]);
  const total = useMemo(() => entries.reduce((sum, entry) => sum + entry.count, 0), [entries]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground">
            Nu există încă suficiente date pentru această secțiune.
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const percentage = total > 0 ? Math.round((entry.count / total) * 100) : 0;
              return (
                <div key={`${kind}:${entry.key}`} className="flex items-center justify-between gap-4 border-b pb-2 last:border-b-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{formatBreakdownLabel(kind, entry.key)}</div>
                    <div className="text-xs text-muted-foreground">{percentage}% din topul afișat</div>
                  </div>
                  <div className="text-right font-mono text-sm font-semibold">{formatNumber(entry.count)}</div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AnalyticsTab({
  title,
  description,
  items,
  timeline,
  breakdown,
  activityLabel = 'vizualizări',
  lastSeenLabel = 'Ultima activitate',
}: {
  title: string;
  description: string;
  items: AnalyticsSummary[];
  timeline: AnalyticsDashboardData['articleTimeline'];
  breakdown: AnalyticsBreakdownGroup;
  activityLabel?: string;
  lastSeenLabel?: string;
}) {
  const topItems = useMemo(() => items.slice(0, 8).map((item) => ({
    label: compactLabel(item.label),
    views: item.lastMonth,
    total: item.total,
  })), [items]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">{title}: evoluție 30 zile</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 || timeline.every((point) => point.views === 0) ? (
              <EmptyAnalyticsState label="Nu există încă trafic în intervalul curent." />
            ) : (
              <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
                <BarChart data={timeline}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={18}
                    tickFormatter={formatDateLabel}
                  />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                  <ChartTooltip content={<ChartTooltipContent labelFormatter={(value) => formatDateLabel(String(value))} />} />
                  <Bar dataKey="views" fill="var(--color-views)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Top 8 după ultima lună</CardTitle>
            <CardDescription>Ordinea este calculată pe ultimele 30 de zile de {activityLabel}.</CardDescription>
          </CardHeader>
          <CardContent>
            {topItems.length === 0 ? (
              <EmptyAnalyticsState label="Nu există încă elemente urmărite." />
            ) : (
              <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
                <BarChart data={topItems} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                  <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={112} />
                  <ChartTooltip
                    content={(
                      <ChartTooltipContent
                        formatter={(value, _name, item) => (
                          <div className="flex min-w-[180px] items-center justify-between gap-3">
                            <span className="text-muted-foreground">{item.payload.label}</span>
                            <span className="font-mono font-semibold">{formatNumber(Number(value) || 0)}</span>
                          </div>
                        )}
                      />
                    )}
                  />
                  <Bar dataKey="views" fill="var(--color-views)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Detaliu pe element</CardTitle>
          <CardDescription>Ultima zi, 7 zile, 30 zile și total cumulat pentru fiecare element urmărit.</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <EmptyAnalyticsState label="Nu există încă statistici de afișat." />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {items.map((item) => (
                  <div key={`${item.entityType}:${item.entityId}`} className="rounded-lg border bg-muted/20 p-4">
                    <div className="font-medium break-words">{item.label}</div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <MetricField label="Ultima zi" value={formatNumber(item.lastDay)} />
                      <MetricField label="Ultima săptămână" value={formatNumber(item.lastWeek)} />
                      <MetricField label="Ultima lună" value={formatNumber(item.lastMonth)} />
                      <MetricField label="Total" value={formatNumber(item.total)} emphasized />
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      {lastSeenLabel}: {formatLastViewedAt(item.lastViewedAt)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Element</TableHead>
                      <TableHead className="text-right">Ultima zi</TableHead>
                      <TableHead className="text-right">Ultima săptămână</TableHead>
                      <TableHead className="text-right">Ultima lună</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">{lastSeenLabel}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={`${item.entityType}:${item.entityId}`}>
                        <TableCell>
                          <div className="font-medium">{item.label}</div>
                        </TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(item.lastDay)}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(item.lastWeek)}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(item.lastMonth)}</TableCell>
                        <TableCell className="text-right font-mono font-semibold">{formatNumber(item.total)}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{formatLastViewedAt(item.lastViewedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
        <BreakdownCard
          title="Dispozitive"
          description="Distribuție pe desktop, mobil și tabletă."
          kind="devices"
          counts={breakdown.devices}
        />
        <BreakdownCard
          title="Sisteme de operare"
          description="Sistemele de operare detectate din browser."
          kind="operatingSystems"
          counts={breakdown.operatingSystems}
        />
        <BreakdownCard
          title="Țări"
          description="Țările detectate prin Cloudflare."
          kind="countries"
          counts={breakdown.countries}
        />
        <BreakdownCard
          title="Referreri"
          description="Surse externe, trafic direct și navigare internă."
          kind="referrers"
          counts={breakdown.referrers}
        />
        <BreakdownCard
          title="Rezoluții ecran"
          description="Rezoluțiile declarate de browser la momentul evenimentului."
          kind="screenResolutions"
          counts={breakdown.screenResolutions}
        />
      </div>
    </div>
  );
}

function MetricField({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className="rounded-md border bg-background px-3 py-2">
      <div className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-sm ${emphasized ? 'font-semibold' : ''}`}>{value}</div>
    </div>
  );
}

export default function DashboardStats() {
  const { fetchAnalyticsDashboard } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsDashboardData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const result = await fetchAnalyticsDashboard();
      if (cancelled) return;

      if (!result.ok || !result.analytics) {
        setError(result.error || 'Nu am putut încărca statisticile.');
        setAnalytics(null);
        setLoading(false);
        return;
      }

      setAnalytics(result.analytics);
      setError(null);
      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [fetchAnalyticsDashboard]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="flex items-start gap-3 p-6">
          <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
          <div>
            <div className="font-semibold">Statisticile nu pot fi încărcate</div>
            <div className="mt-1 text-sm text-muted-foreground">{error || 'Serviciul analytics nu răspunde.'}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallViewTotals: AnalyticsCounts = {
    lastDay: analytics.articleTotals.lastDay + analytics.pageTotals.lastDay,
    lastWeek: analytics.articleTotals.lastWeek + analytics.pageTotals.lastWeek,
    lastMonth: analytics.articleTotals.lastMonth + analytics.pageTotals.lastMonth,
    total: analytics.articleTotals.total + analytics.pageTotals.total,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-2xl font-bold">Statistici de trafic</h1>
        <p className="text-sm text-muted-foreground">
          Vizualizări agregate pe articole, pe toate paginile publice fără login și descărcări PDF pentru articole.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SummaryPanel
          title="Total vizualizări"
          description="Articole + pagini publice (fără descărcări și fără căutări)."
          icon={Eye}
          counts={overallViewTotals}
        />
        <SummaryPanel
          title="Articole"
          description="Traficul cumulat pe fiecare articol publicat."
          icon={FileText}
          counts={analytics.articleTotals}
        />
        <SummaryPanel
          title="Pagini publice"
          description="Homepage, arhivă, cuprinsuri de număr și orice pagină publică disponibilă fără login."
          icon={Globe2}
          counts={analytics.pageTotals}
        />
        <SummaryPanel
          title="Descărcări articole"
          description="Descărcări PDF agregate pentru fiecare articol publicat."
          icon={Download}
          counts={analytics.downloadTotals}
        />
        <SummaryPanel
          title="Căutări"
          description="Termeni căutați în pagina de căutare a arhivei."
          icon={Search}
          counts={analytics.searchTotals}
        />
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:max-w-3xl sm:grid-cols-4">
          <TabsTrigger value="articles" className="gap-2">
            <FileText className="h-4 w-4" />
            Articole
          </TabsTrigger>
          <TabsTrigger value="public-pages" className="gap-2">
            <Globe2 className="h-4 w-4" />
            Pagini publice
          </TabsTrigger>
          <TabsTrigger value="downloads" className="gap-2">
            <Download className="h-4 w-4" />
            Descărcări
          </TabsTrigger>
          <TabsTrigger value="searches" className="gap-2">
            <Search className="h-4 w-4" />
            Căutări
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <AnalyticsTab
            title="Articole"
            description="Evoluția zilnică a vizualizărilor pe articole."
            items={analytics.articles}
            timeline={analytics.articleTimeline}
            breakdown={analytics.articleBreakdown}
            activityLabel="vizualizări"
            lastSeenLabel="Ultima vizualizare"
          />
        </TabsContent>

        <TabsContent value="public-pages">
          <AnalyticsTab
            title="Pagini publice"
            description="Evoluția zilnică a vizualizărilor pe homepage, arhivă, cuprinsurile numerelor și restul paginilor publice."
            items={analytics.pages}
            timeline={analytics.pageTimeline}
            breakdown={analytics.pageBreakdown}
            activityLabel="vizualizări"
            lastSeenLabel="Ultima vizualizare"
          />
        </TabsContent>

        <TabsContent value="downloads">
          <AnalyticsTab
            title="Descărcări articole"
            description="Evoluția zilnică a descărcărilor PDF pe articole."
            items={analytics.downloads}
            timeline={analytics.downloadTimeline}
            breakdown={analytics.downloadBreakdown}
            activityLabel="descărcări"
            lastSeenLabel="Ultima descărcare"
          />
        </TabsContent>

        <TabsContent value="searches">
          <AnalyticsTab
            title="Căutări în arhivă"
            description="Termenii introduși în pagina publică de căutare."
            items={analytics.searches}
            timeline={analytics.searchTimeline}
            breakdown={analytics.searchBreakdown}
            activityLabel="căutări"
            lastSeenLabel="Ultima căutare"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
