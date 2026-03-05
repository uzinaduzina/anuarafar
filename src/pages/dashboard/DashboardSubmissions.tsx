import { useMemo, useState } from 'react';
import { CheckCircle2, Download, RotateCcw, Send, XCircle } from 'lucide-react';
import { getAccountsByRole } from '@/data/authUsers';
import { useSubmissionData } from '@/data/SubmissionDataProvider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Submission } from '@/data/types';

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
  const [decisionDrafts, setDecisionDrafts] = useState<Record<string, string>>({});

  const sortedSubmissions = useMemo(
    () => [...submissions].sort((a, b) => b.date_submitted.localeCompare(a.date_submitted)),
    [submissions],
  );

  const applySubmissionUpdate = async (
    submissionId: string,
    changes: Partial<Submission>,
    successTitle: string,
    successDescription?: string,
  ) => {
    const result = await updateSubmission(submissionId, changes);
    if (!result.ok) {
      toast({
        title: 'Actualizarea a esuat',
        description: result.error || 'Incearca din nou.',
        variant: 'destructive',
      });
      return false;
    }

    if (successDescription) {
      toast({ title: successTitle, description: successDescription });
    } else {
      toast({ title: successTitle });
    }
    return true;
  };

  const handleAssignReviewer = async (
    submissionId: string,
    reviewerEmail: string,
    currentStatus: string,
  ) => {
    const reviewer = reviewers.find((account) => account.email === reviewerEmail);
    const nextStatus = reviewer
      ? currentStatus
      : (currentStatus === 'under_review' ? 'submitted' : currentStatus);

    await applySubmissionUpdate(submissionId, {
      assigned_reviewer: reviewer?.name || '',
      assigned_reviewer_email: reviewer?.email || '',
      status: nextStatus as Submission['status'],
    }, 'Reviewer actualizat', reviewer
      ? 'Submisia a fost redistribuita catre reviewer si au fost trimise notificarile.'
      : 'Reviewer eliminat din submisie.');
  };

  const handleSendToReview = async (submission: Submission) => {
    if (!submission.assigned_reviewer_email) {
      toast({
        title: 'Selecteaza reviewer',
        description: 'Alege mai intai un reviewer pentru aceasta submisie.',
        variant: 'destructive',
      });
      return;
    }

    await applySubmissionUpdate(
      submission.id,
      { status: 'under_review' },
      'Trimis la review',
      'Reviewerul si autorul au fost notificati prin email.',
    );
  };

  const handleSetDecisionPending = async (submissionId: string) => {
    await applySubmissionUpdate(
      submissionId,
      { status: 'decision_pending' },
      'Setat ca decizie pendinta',
      'Submisia asteapta decizia editoriala finala.',
    );
  };

  const handleDecisionAction = async (
    submissionId: string,
    status: Submission['status'],
    defaultDecision: string,
    successTitle: string,
  ) => {
    const draft = (decisionDrafts[submissionId] || '').trim();
    const finalDecision = draft || defaultDecision;
    const ok = await applySubmissionUpdate(
      submissionId,
      { status, decision: finalDecision },
      successTitle,
      'Autorul va primi notificarea de decizie.',
    );
    if (ok) {
      setDecisionDrafts((prev) => ({ ...prev, [submissionId]: finalDecision }));
    }
  };

  const handleSaveDecisionDraft = async (submissionId: string) => {
    const draft = (decisionDrafts[submissionId] || '').trim();
    if (!draft) {
      toast({
        title: 'Decizie lipsa',
        description: 'Introdu textul deciziei inainte de salvare.',
        variant: 'destructive',
      });
      return;
    }

    await applySubmissionUpdate(
      submissionId,
      { decision: draft },
      'Decizie salvata',
      'Textul deciziei a fost salvat.',
    );
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
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Flow evaluare</th>
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
                        onChange={(event) => void applySubmissionUpdate(
                          submission.id,
                          { status: event.target.value as typeof submission.status },
                          'Status actualizat',
                        )}
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
                        onChange={(event) => void handleAssignReviewer(submission.id, event.target.value, submission.status)}
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
                        onChange={(event) => void applySubmissionUpdate(
                          submission.id,
                          { reviewer_deadline: event.target.value },
                          'Termen actualizat',
                        )}
                      />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[170px]">
                      <div className="font-medium text-foreground">{submission.recommendation || '-'}</div>
                      {submission.reviewed_at && <div className="mt-1">Evaluat: {submission.reviewed_at}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                      <input
                        className="h-8 w-[170px] rounded-md border bg-background px-2 text-xs"
                        value={decisionDrafts[submission.id] ?? submission.decision ?? ''}
                        onChange={(event) => setDecisionDrafts((prev) => ({ ...prev, [submission.id]: event.target.value }))}
                        placeholder="acceptat / respins"
                      />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => void handleSaveDecisionDraft(submission.id)}
                        >
                          Salveaza
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" className="h-8 text-xs" onClick={() => void handleSendToReview(submission)}>
                          <Send className="mr-1 h-3 w-3" /> Trimite la review
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => void handleSetDecisionPending(submission.id)}>
                          Decizie pendinta
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => void handleDecisionAction(submission.id, 'accepted', 'acceptat', 'Articol acceptat')}>
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Accepta
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => void handleDecisionAction(submission.id, 'revision_requested', 'revizuire solicitata', 'Revizuire solicitata')}>
                          <RotateCcw className="mr-1 h-3 w-3" /> Revizuire
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => void handleDecisionAction(submission.id, 'rejected', 'respins', 'Articol respins')}>
                          <XCircle className="mr-1 h-3 w-3" /> Respinge
                        </Button>
                      </div>
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
