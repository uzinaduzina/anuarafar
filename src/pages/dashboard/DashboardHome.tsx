import { Link } from 'react-router-dom';
import { BookOpen, FileText, Upload, Users, ArrowRight, Loader2, Download } from 'lucide-react';
import { useJournalData } from '@/data/JournalDataProvider';
import { SUBMISSIONS } from '@/data/articles';
import { SeriesBadge } from '@/components/SeriesBadge';
import { Button } from '@/components/ui/button';

export default function DashboardHome() {
  const { issues, articles, loading, hasEdits, exportAsJson } = useJournalData();

  const publishedIssues = issues.filter(i => i.status === 'published');
  const totalArticles = articles.length || issues.reduce((s, i) => s + i.article_count, 0);
  const pendingSubmissions = SUBMISSIONS.filter(s => s.status === 'submitted').length;
  const underReview = SUBMISSIONS.filter(s => s.status === 'under_review').length;

  const latestIssues = [...publishedIssues]
    .sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0))
    .slice(0, 5);

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Privire de ansamblu asupra activității editoriale</p>
        </div>
        {hasEdits && (
          <Button variant="outline" onClick={() => {
            const json = exportAsJson();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'manifest_edited.json';
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Download className="mr-2 h-4 w-4" /> Exportă JSON
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: BookOpen, value: publishedIssues.length, label: 'Numere publicate' },
          { icon: FileText, value: totalArticles, label: 'Articole totale' },
          { icon: Upload, value: pendingSubmissions, label: 'Submisii noi' },
          { icon: Users, value: underReview, label: 'În evaluare' },
        ].map((stat, i) => (
          <div key={i} className="rounded-lg border bg-card p-5 shadow-sm">
            <stat.icon className="h-5 w-5 text-primary mb-3" />
            <div className="font-serif text-2xl font-bold">{stat.value}</div>
            <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold">Ultimele numere</h2>
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link to="/dashboard/issues">Vezi toate <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary">
                {['Titlu', 'An', 'Seria', 'Articole', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {latestIssues.map(issue => (
                <tr key={issue.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-sm">{issue.title}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{issue.year}</td>
                  <td className="px-4 py-3"><SeriesBadge series={issue.series} /></td>
                  <td className="px-4 py-3 text-sm">{issue.article_count}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] uppercase tracking-[0.05em] font-semibold bg-primary/10 text-primary">Publicat</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold">Submisii recente</h2>
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link to="/dashboard/submissions">Vezi toate <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </div>
        <div className="divide-y">
          {SUBMISSIONS.slice(0, 3).map(sub => {
            const statusLabels: Record<string, { label: string; cls: string }> = {
              submitted: { label: 'Trimis', cls: 'bg-primary/10 text-primary' },
              under_review: { label: 'În evaluare', cls: 'bg-series-2-bg text-series-2-foreground' },
              decision_pending: { label: 'Decizie', cls: 'bg-series-3-bg text-series-3-foreground' },
            };
            const s = statusLabels[sub.status] || statusLabels.submitted;
            return (
              <div key={sub.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{sub.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{sub.authors} · {sub.date_submitted}</div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] uppercase tracking-[0.05em] font-semibold whitespace-nowrap ${s.cls}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
