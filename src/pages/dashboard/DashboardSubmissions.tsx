import { SUBMISSIONS } from '@/data/articles';

const statusConfig: Record<string, { label: string; cls: string }> = {
  submitted: { label: 'Trimis', cls: 'bg-primary/10 text-primary' },
  under_review: { label: 'În evaluare', cls: 'bg-series-2-bg text-series-2-foreground' },
  decision_pending: { label: 'Decizie pendinte', cls: 'bg-series-3-bg text-series-3-foreground' },
  accepted: { label: 'Acceptat', cls: 'bg-series-1-bg text-series-1-foreground' },
  rejected: { label: 'Respins', cls: 'bg-destructive/10 text-destructive' },
  revision_requested: { label: 'Revizuire', cls: 'bg-series-3-bg text-series-3-foreground' },
};

export default function DashboardSubmissions() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold">Submisii</h1>
        <p className="text-sm text-muted-foreground mt-1">{SUBMISSIONS.length} manuscrise trimise</p>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">ID</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Titlu</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Autori</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Data</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Status</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Recenzor</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {SUBMISSIONS.map(sub => {
                const s = statusConfig[sub.status] || statusConfig.submitted;
                return (
                  <tr key={sub.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{sub.id}</td>
                    <td className="px-4 py-3 font-medium text-sm max-w-[280px] truncate">{sub.title}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{sub.authors}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{sub.date_submitted}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] uppercase tracking-[0.05em] font-semibold ${s.cls}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{sub.assigned_reviewer || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
