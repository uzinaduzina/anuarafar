import { ISSUES } from '@/data/issues';
import { SeriesBadge } from '@/components/SeriesBadge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardIssues() {
  const sorted = [...ISSUES].sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold">Numere</h1>
          <p className="text-sm text-muted-foreground mt-1">{ISSUES.length} numere în total</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Număr nou
        </Button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Titlu</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">An</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Vol.</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Seria</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Art.</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Pag.</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sorted.map(issue => (
                <tr key={issue.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-sm max-w-[300px] truncate">{issue.title}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{issue.year}</td>
                  <td className="px-4 py-3 text-sm">{issue.volume}</td>
                  <td className="px-4 py-3"><SeriesBadge series={issue.series} /></td>
                  <td className="px-4 py-3 text-sm">{issue.article_count}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{issue.pages || '—'}</td>
                  <td className="px-4 py-3">
                    <Button asChild variant="ghost" size="sm" className="text-primary">
                      <Link to={`/archive/${issue.slug}`}>Vezi</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
