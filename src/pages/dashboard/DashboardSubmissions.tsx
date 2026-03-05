import { useMemo } from 'react';
import { Download } from 'lucide-react';
import { getAccountsByRole } from '@/data/authUsers';
import { useSubmissionData } from '@/data/SubmissionDataProvider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const statusConfig: Record<string, { label: string; cls: string }> = {
  submitted: { label: 'Trimis', cls: 'bg-primary/10 text-primary' },
  under_review: { label: 'In evaluare', cls: 'bg-series-2-bg text-series-2-foreground' },
  decision_pending: { label: 'Decizie pendinte', cls: 'bg-series-3-bg text-series-3-foreground' },
  accepted: { label: 'Acceptat', cls: 'bg-series-1-bg text-series-1-foreground' },
  rejected: { label: 'Respins', cls: 'bg-destructive/10 text-destructive' },
  revision_requested: { label: 'Revizuire', cls: 'bg-series-3-bg text-series-3-foreground' },
};

const statusOptions = Object.keys(statusConfig);

export default function DashboardSubmissions() {
  const { submissions, updateSubmission, downloadSubmissionFile } = useSubmissionData();
  const { toast } = useToast();
  const reviewers = useMemo(() => getAccountsByRole('reviewer'), []);

  const sortedSubmissions = useMemo(
    () => [...submissions].sort((a, b) => b.date_submitted.localeCompare(a.date_submitted)),
    [submissions],
  );

  const handleAssignReviewer = (
    submissionId: string,
    reviewerEmail: string,
    currentStatus: string,
  ) => {
    const reviewer = reviewers.find((account) => account.email === reviewerEmail);
    const nextStatus = reviewer
      ? (currentStatus === 'submitted' ? 'under_review' : currentStatus)
      : (currentStatus === 'under_review' ? 'submitted' : currentStatus);

    updateSubmission(submissionId, {
      assigned_reviewer: reviewer?.name || '',
      assigned_reviewer_email: reviewer?.email || '',
      status: nextStatus as typeof statusOptions[number],
    });
  };

  const handleDownload = async (submissionId: string, fileId: string, fileName: string) => {
    const result = await downloadSubmissionFile(submissionId, fileId, fileName);
    if (!result.ok) {
      toast({
        title: 'Nu am putut descarca fisierul',
        description: result.error || 'Incearca din nou.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold">Submisii</h1>
        <p className="text-sm text-muted-foreground mt-1">{submissions.length} manuscrise trimise</p>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">ID</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Titlu</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Autor</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Status</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Reviewer</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Termen</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Recomandare</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Decizie</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedSubmissions.map((submission) => {
                const status = statusConfig[submission.status] || statusConfig.submitted;

                return (
                  <tr key={submission.id} className="hover:bg-accent/30 transition-colors align-top">
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{submission.id}</td>
                    <td className="px-4 py-3 text-sm max-w-[260px]">
                      <div className="font-medium truncate">{submission.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{submission.date_submitted}</div>
                      {submission.files && submission.files.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {submission.files.map((file) => (
                            <Button
                              key={file.id}
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => handleDownload(submission.id, file.id, file.filename)}
                            >
                              <Download className="mr-1 h-3 w-3" /> {file.filename}
                            </Button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      <div>{submission.authors}</div>
                      <div className="text-xs mt-1">{submission.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] uppercase tracking-[0.05em] font-semibold mb-2 ${status.cls}`}>
                        {status.label}
                      </div>
                      <select
                        className="w-full h-8 rounded-md border bg-background px-2 text-xs"
                        value={submission.status}
                        onChange={(event) => updateSubmission(submission.id, { status: event.target.value as typeof submission.status })}
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>{statusConfig[option].label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="w-[170px] h-8 rounded-md border bg-background px-2 text-xs"
                        value={submission.assigned_reviewer_email || ''}
                        onChange={(event) => handleAssignReviewer(submission.id, event.target.value, submission.status)}
                      >
                        <option value="">Nealocat</option>
                        {reviewers.map((reviewer) => (
                          <option key={reviewer.email} value={reviewer.email}>{reviewer.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        value={submission.reviewer_deadline || ''}
                        onChange={(event) => updateSubmission(submission.id, { reviewer_deadline: event.target.value })}
                      />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[170px]">
                      <div className="font-medium text-foreground">{submission.recommendation || '-'}</div>
                      {submission.reviewed_at && <div className="mt-1">Evaluat: {submission.reviewed_at}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        className="h-8 w-[170px] rounded-md border bg-background px-2 text-xs"
                        value={submission.decision || ''}
                        onChange={(event) => updateSubmission(submission.id, { decision: event.target.value })}
                        placeholder="acceptat / respins"
                      />
                    </td>
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
