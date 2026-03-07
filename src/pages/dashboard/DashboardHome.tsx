import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, FileText, Loader2, Upload, ClipboardCheck } from 'lucide-react';
import { useJournalData } from '@/data/JournalDataProvider';
import { useSubmissionData } from '@/data/SubmissionDataProvider';
import { useAuth } from '@/contexts/AuthContext';
import { SeriesBadge } from '@/components/SeriesBadge';
import { Button } from '@/components/ui/button';

export default function DashboardHome() {
  const { issues, articles, loading } = useJournalData();
  const { submissions, getSubmissionsForAuthor, getSubmissionsForReviewer } = useSubmissionData();
  const { user, isReviewer, isAuthor } = useAuth();

  const publishedIssues = issues.filter((issue) => issue.status === 'published');
  const totalArticles = articles.length || issues.reduce((sum, issue) => sum + issue.article_count, 0);

  const latestIssues = [...publishedIssues]
    .sort((a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0))
    .slice(0, 5);

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (isReviewer) {
    const assigned = getSubmissionsForReviewer(user?.email || '');
    const reviewed = assigned.filter((submission) => Boolean(submission.reviewed_at));

    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-serif text-2xl font-bold">Dashboard reviewer</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitorizare lucrari atribuite pentru evaluare.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={ClipboardCheck} value={assigned.length} label="Lucrari atribuite" />
          <StatCard icon={FileText} value={reviewed.length} label="Recenzii trimise" />
          <StatCard icon={Upload} value={assigned.length - reviewed.length} label="In asteptare" />
        </div>

        <Button asChild>
          <Link to="/dashboard/reviewer">Deschide panoul reviewer <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    );
  }

  if (isAuthor) {
    const ownSubmissions = getSubmissionsForAuthor(user?.email || '');
    const accepted = ownSubmissions.filter((submission) => submission.status === 'accepted');

    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-serif text-2xl font-bold">Dashboard autor</h1>
          <p className="text-sm text-muted-foreground mt-1">Stare articole trimise si trimitere manuscrise noi.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={FileText} value={ownSubmissions.length} label="Articole trimise" />
          <StatCard icon={BookOpen} value={accepted.length} label="Articole acceptate" />
          <StatCard icon={Upload} value={ownSubmissions.filter((submission) => submission.status === 'under_review').length} label="In evaluare" />
        </div>

        <Button asChild>
          <Link to="/dashboard/author">Deschide panoul autor <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter((submission) => submission.status === 'submitted').length;
  const underReview = submissions.filter((submission) => submission.status === 'under_review').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Dashboard editorial</h1>
          <p className="text-sm text-muted-foreground mt-1">Privire de ansamblu asupra activitatii editoriale</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BookOpen} value={publishedIssues.length} label="Numere publicate" />
        <StatCard icon={FileText} value={totalArticles} label="Articole totale" />
        <StatCard icon={Upload} value={pendingSubmissions} label="Articole noi" />
        <StatCard icon={ClipboardCheck} value={underReview} label="In evaluare" />
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-serif text-lg font-bold">Ultimele numere</h2>
          <Button asChild variant="ghost" size="sm" className="w-full text-primary sm:w-auto">
            <Link to="/dashboard/issues">Vezi toate <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </div>
        <div className="divide-y md:hidden">
          {latestIssues.map((issue) => (
            <div key={issue.id} className="space-y-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <SeriesBadge series={issue.series} />
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.05em] text-primary">
                  Publicat
                </span>
              </div>
              <div className="font-medium text-sm break-words">{issue.title}</div>
              <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                <div>
                  <div className="text-[0.65rem] uppercase tracking-[0.08em]">An</div>
                  <div className="mt-1 font-medium text-foreground">{issue.year}</div>
                </div>
                <div>
                  <div className="text-[0.65rem] uppercase tracking-[0.08em]">Seria</div>
                  <div className="mt-1 font-medium text-foreground">{issue.series_label}</div>
                </div>
                <div>
                  <div className="text-[0.65rem] uppercase tracking-[0.08em]">Articole</div>
                  <div className="mt-1 font-medium text-foreground">{issue.article_count}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary">
                {['Titlu', 'An', 'Seria', 'Articole', 'Status'].map((header) => (
                  <th key={header} className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {latestIssues.map((issue) => (
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
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-serif text-lg font-bold">Articole trimise recent</h2>
          <Button asChild variant="ghost" size="sm" className="w-full text-primary sm:w-auto">
            <Link to="/dashboard/submissions">Vezi toate <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </div>
        <div className="divide-y">
          {submissions.slice(0, 4).map((submission) => (
            <div key={submission.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="font-medium text-sm break-words">{submission.title}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{submission.authors}</span>
                  <span>{submission.date_submitted}</span>
                </div>
              </div>
              <span className="inline-flex items-center self-start rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.05em] text-secondary-foreground sm:self-center">
                {submission.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label }: { icon: React.ElementType; value: number; label: string }) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <Icon className="h-5 w-5 text-primary mb-3" />
      <div className="font-serif text-2xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold mt-1">{label}</div>
    </div>
  );
}
