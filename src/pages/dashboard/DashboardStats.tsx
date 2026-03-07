import { useEffect, useMemo, useState, type ElementType } from 'react';
import { AlertCircle, BarChart3, Eye, FileText, Globe2, Loader2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { type AnalyticsCounts, type AnalyticsDashboardData, type AnalyticsSummary } from '@/lib/analytics';
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
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
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
      <p className="mt-1 text-sm text-muted-foreground">Statisticile apar după primele vizualizări în producție.</p>
    </div>
  );
}

function AnalyticsTab({
  title,
  description,
  items,
  timeline,
}: {
  title: string;
  description: string;
  items: AnalyticsSummary[];
  timeline: AnalyticsDashboardData['articleTimeline'];
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
            <CardDescription>Ordinea este calculată pe ultimele 30 de zile.</CardDescription>
          </CardHeader>
          <CardContent>
            {topItems.length === 0 ? (
              <EmptyAnalyticsState label="Nu există încă elemente urmărite." />
            ) : (
              <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
                <BarChart data={topItems} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                  <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={160} />
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Element</TableHead>
                  <TableHead className="text-right">Ultima zi</TableHead>
                  <TableHead className="text-right">Ultima săptămână</TableHead>
                  <TableHead className="text-right">Ultima lună</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Ultima vizualizare</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={`${item.entityType}:${item.entityId}`}>
                    <TableCell>
                      <div className="font-medium">{item.label}</div>
                      {item.path && (
                        <div className="mt-0.5 text-xs text-muted-foreground">{item.path}</div>
                      )}
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
          )}
        </CardContent>
      </Card>
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-2xl font-bold">Statistici de vizualizare</h1>
        <p className="text-sm text-muted-foreground">
          Vizualizări agregate pentru articole și paginile publice ale revistei.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SummaryPanel
          title="Articole"
          description="Traficul cumulat pe fiecare articol publicat."
          icon={FileText}
          counts={analytics.articleTotals}
        />
        <SummaryPanel
          title="Pagini publice"
          description="Trafic pe homepage, arhivă, pagini editoriale și rute individuale."
          icon={Globe2}
          counts={analytics.pageTotals}
        />
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="articles" className="gap-2">
            <FileText className="h-4 w-4" />
            Articole
          </TabsTrigger>
          <TabsTrigger value="pages" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Pagini
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <AnalyticsTab
            title="Articole"
            description="Evoluția zilnică a vizualizărilor pe articole."
            items={analytics.articles}
            timeline={analytics.articleTimeline}
          />
        </TabsContent>

        <TabsContent value="pages">
          <AnalyticsTab
            title="Pagini publice"
            description="Evoluția zilnică a vizualizărilor pe paginile site-ului."
            items={analytics.pages}
            timeline={analytics.pageTimeline}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
