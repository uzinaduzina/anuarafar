import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  RotateCcw,
  Send,
  XCircle,
  Eye,
  Calendar,
  User,
  FileText,
} from 'lucide-react';
import { getAccountsByRole } from '@/data/authUsers';
import { useSubmissionData } from '@/data/SubmissionDataProvider';
import { Button } from '@/components/ui/button';
import SubmissionWorkflowDrawer from '@/components/SubmissionWorkflowDrawer';
import { useToast } from '@/hooks/use-toast';
import type { Submission } from '@/data/types';

const statusConfig: Record<string, { label: string; cls: string }> = {
  submitted: { label: 'Trimis', cls: 'bg-primary/10 text-primary' },
  anonymization: { label: 'În anonimizare', cls: 'bg-amber-100 text-amber-900' },
  under_review: { label: 'În evaluare', cls: 'bg-series-2-bg text-series-2-foreground' },
  decision_pending: { label: 'Decizie pendintă', cls: 'bg-series-3-bg text-series-3-foreground' },
  accepted: { label: 'Acceptat', cls: 'bg-series-1-bg text-series-1-foreground' },
  rejected: { label: 'Respins', cls: 'bg-destructive/10 text-destructive' },
  revision_requested: { label: 'Revizuire', cls: 'bg-series-3-bg text-series-3-foreground' },
};

const statusOptions = Object.keys(statusConfig);

type FilterStatus = 'all' | string;

export default function DashboardSubmissions() {
  const { submissions, updateSubmission, downloadSubmissionFile } = useSubmissionData();
  const { toast } = useToast();
  const reviewers = useMemo(() => getAccountsByRole('reviewer'), []);
  const [decisionDrafts, setDecisionDrafts] = useState<Record<string, string>>({});
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const sortedSubmissions = useMemo(
    () => [...submissions].sort((a, b) => b.date_submitted.localeCompare(a.date_submitted)),
    [submissions],
  );

  const filteredSubmissions = useMemo(
    () => filterStatus === 'all' ? sortedSubmissions : sortedSubmissions.filter((s) => s.status === filterStatus),
    [sortedSubmissions, filterStatus],
  );

  const activeSubmission = useMemo(
    () => sortedSubmissions.find((s) => s.id === activeSubmissionId) || null,
    [activeSubmissionId, sortedSubmissions],
  );

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const applySubmissionUpdate = async (
    submissionId: string,
    changes: Partial<Submission>,
    successTitle: string,
    successDescription?: string,
  ) => {
    const result = await updateSubmission(submissionId, changes);
    if (!result.ok) {
      toast({ title: 'Actualizarea a eșuat', description: result.error || 'Încearcă din nou.', variant: 'destructive' });
      return false;
    }
    toast({ title: successTitle, ...(successDescription ? { description: successDescription } : {}) });
    return true;
  };

  const handleAssignReviewer = async (
    submissionId: string,
    slot: 1 | 2,
    reviewerEmail: string,
    otherReviewerEmail: string,
    currentStatus: string,
    hasAnonymizedFiles: boolean,
  ) => {
    if (reviewerEmail && reviewerEmail === otherReviewerEmail) {
      toast({ title: 'Reviewer duplicat', description: 'Alege doi revieweri diferiți.', variant: 'destructive' });
      return;
    }
    const reviewer = reviewers.find((a) => a.email === reviewerEmail);
    const nextStatus = reviewer ? currentStatus : (currentStatus === 'under_review' ? (hasAnonymizedFiles ? 'anonymization' : 'submitted') : currentStatus);
    const patch: Partial<Submission> = slot === 2
      ? { assigned_reviewer_2: reviewer?.name || '', assigned_reviewer_email_2: reviewer?.email || '', status: nextStatus as Submission['status'] }
      : { assigned_reviewer: reviewer?.name || '', assigned_reviewer_email: reviewer?.email || '', status: nextStatus as Submission['status'] };
    await applySubmissionUpdate(submissionId, patch, `Reviewer ${slot} actualizat`);
  };

  const handleSendToReview = async (submission: Submission) => {
    if (!submission.anonymized_files?.length) {
      toast({ title: 'Lipsește versiunea blind', description: 'Încarcă mai întâi fișierul anonimizat.', variant: 'destructive' });
      return;
    }
    const r1 = (submission.assigned_reviewer_email || '').trim().toLowerCase();
    const r2 = (submission.assigned_reviewer_email_2 || '').trim().toLowerCase();
    if (!r1 || !r2) {
      toast({ title: 'Selectează doi revieweri', description: 'Evaluare double-blind necesită doi revieweri.', variant: 'destructive' });
      return;
    }
    if (r1 === r2) {
      toast({ title: 'Revieweri duplicați', variant: 'destructive' });
      return;
    }
    await applySubmissionUpdate(submission.id, { status: 'under_review' }, 'Trimis la review', 'Reviewerii și autorul au fost notificați.');
  };

  const handleDecisionAction = async (submissionId: string, status: Submission['status'], defaultDecision: string, successTitle: string) => {
    const draft = (decisionDrafts[submissionId] || '').trim();
    const finalDecision = draft || defaultDecision;
    const ok = await applySubmissionUpdate(submissionId, { status, decision: finalDecision }, successTitle, 'Autorul va primi notificarea.');
    if (ok) setDecisionDrafts((prev) => ({ ...prev, [submissionId]: finalDecision }));
  };

  const handleDownload = async (submissionId: string, fileId: string, fileName: string) => {
    const result = await downloadSubmissionFile(submissionId, fileId, fileName);
    if (!result.ok) toast({ title: 'Descărcare eșuată', description: result.error, variant: 'destructive' });
  };

  // Status counts for filter badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of submissions) counts[s.status] = (counts[s.status] || 0) + 1;
    return counts;
  }, [submissions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold">Articole trimise</h1>
        <p className="text-sm text-muted-foreground mt-1">{submissions.length} manuscrise în sistem</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterStatus === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}
        >
          Toate ({submissions.length})
        </button>
        {statusOptions.map((key) => {
          const count = statusCounts[key] || 0;
          if (count === 0) return null;
          const cfg = statusConfig[key];
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterStatus === key ? cfg.cls + ' ring-2 ring-primary/30' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}
            >
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Submissions list */}
      <div className="space-y-3">
        {filteredSubmissions.map((submission) => {
          const status = statusConfig[submission.status] || statusConfig.submitted;
          const expanded = expandedIds.has(submission.id);

          return (
            <div key={submission.id} className="rounded-lg border bg-card shadow-sm overflow-hidden">
              {/* Compact header row */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/30 transition-colors"
                onClick={() => toggleExpanded(submission.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.6rem] uppercase tracking-[0.05em] font-semibold ${status.cls}`}>
                      {status.label}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">#{submission.id}</span>
                  </div>
                  <h3 className="font-medium text-sm mt-1 truncate">{submission.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{submission.authors}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{submission.date_submitted}</span>
                    {submission.assigned_reviewer && (
                      <span className="hidden sm:flex items-center gap-1">R1: {submission.assigned_reviewer}</span>
                    )}
                    {submission.assigned_reviewer_2 && (
                      <span className="hidden sm:flex items-center gap-1">R2: {submission.assigned_reviewer_2}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={(e) => { e.stopPropagation(); setActiveSubmissionId(submission.id); }}>
                    <Eye className="mr-1 h-3 w-3" /> Detalii
                  </Button>
                  {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>

              {/* Expandable section */}
              {expanded && (
                <div className="border-t px-4 py-4 space-y-4 bg-muted/30">
                  {/* Row 1: Status + Reviewers */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status */}
                    <div className="space-y-1.5">
                      <label className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Status</label>
                      <select
                        className="w-full h-9 rounded-md border bg-background px-2 text-sm"
                        value={submission.status}
                        onChange={(e) => void applySubmissionUpdate(submission.id, { status: e.target.value as Submission['status'] }, 'Status actualizat')}
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>{statusConfig[opt].label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Reviewer 1 */}
                    <div className="space-y-1.5">
                      <label className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Reviewer 1</label>
                      <select
                        className="w-full h-9 rounded-md border bg-background px-2 text-sm"
                        value={submission.assigned_reviewer_email || ''}
                        onChange={(e) => void handleAssignReviewer(submission.id, 1, e.target.value, submission.assigned_reviewer_email_2 || '', submission.status, Boolean(submission.anonymized_files?.length))}
                      >
                        <option value="">Nealocat</option>
                        {reviewers.map((r) => <option key={r.email} value={r.email}>{r.name}</option>)}
                      </select>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          className="flex-1 h-8 rounded-md border bg-background px-2 text-xs"
                          value={submission.reviewer_deadline || ''}
                          onChange={(e) => void applySubmissionUpdate(submission.id, { reviewer_deadline: e.target.value }, 'Termen R1 actualizat')}
                        />
                        {submission.recommendation && (
                          <span className="text-xs font-medium text-foreground">{submission.recommendation}</span>
                        )}
                      </div>
                    </div>

                    {/* Reviewer 2 */}
                    <div className="space-y-1.5">
                      <label className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Reviewer 2</label>
                      <select
                        className="w-full h-9 rounded-md border bg-background px-2 text-sm"
                        value={submission.assigned_reviewer_email_2 || ''}
                        onChange={(e) => void handleAssignReviewer(submission.id, 2, e.target.value, submission.assigned_reviewer_email || '', submission.status, Boolean(submission.anonymized_files?.length))}
                      >
                        <option value="">Nealocat</option>
                        {reviewers.map((r) => <option key={r.email} value={r.email}>{r.name}</option>)}
                      </select>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          className="flex-1 h-8 rounded-md border bg-background px-2 text-xs"
                          value={submission.reviewer_deadline_2 || ''}
                          onChange={(e) => void applySubmissionUpdate(submission.id, { reviewer_deadline_2: e.target.value }, 'Termen R2 actualizat')}
                        />
                        {submission.recommendation_2 && (
                          <span className="text-xs font-medium text-foreground">{submission.recommendation_2}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Files */}
                  {((submission.files?.length || 0) > 0 || (submission.anonymized_files?.length || 0) > 0) && (
                    <div className="space-y-1.5">
                      <label className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Fișiere</label>
                      <div className="flex flex-wrap gap-2">
                        {submission.files?.map((file) => (
                          <Button key={file.id} size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleDownload(submission.id, file.id, file.filename)}>
                            <Download className="mr-1 h-3 w-3" /> {file.filename}
                          </Button>
                        ))}
                        {submission.anonymized_files?.map((file) => (
                          <Button key={file.id} size="sm" variant="outline" className="h-7 text-xs border-emerald-300 text-emerald-800" onClick={() => handleDownload(submission.id, file.id, file.filename)}>
                            <FileText className="mr-1 h-3 w-3" /> Blind: {file.filename}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Row 3: Decision + Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 pt-2 border-t border-border/50">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Decizie editorială</label>
                      <select
                        className="h-9 w-full max-w-md rounded-md border bg-background px-3 text-sm"
                        value={decisionDrafts[submission.id] ?? submission.decision ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDecisionDrafts((prev) => ({ ...prev, [submission.id]: val }));
                          void applySubmissionUpdate(submission.id, { decision: val }, 'Decizie salvată');
                        }}
                      >
                        <option value="">— Selectează —</option>
                        <option value="acceptat">Acceptat</option>
                        <option value="acceptat cu revizuiri minore">Acceptat cu revizuiri minore</option>
                        <option value="revizuire solicitată">Revizuire solicitată</option>
                        <option value="respins">Respins</option>
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => void handleSendToReview(submission)}
                        disabled={!submission.anonymized_files?.length}
                      >
                        <Send className="mr-1 h-3 w-3" /> La review
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => void handleDecisionAction(submission.id, 'accepted', 'acceptat', 'Articol acceptat')}>
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Acceptă
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => void handleDecisionAction(submission.id, 'revision_requested', 'revizuire solicitată', 'Revizuire solicitată')}>
                        <RotateCcw className="mr-1 h-3 w-3" /> Revizuire
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => void handleDecisionAction(submission.id, 'rejected', 'respins', 'Articol respins')}>
                        <XCircle className="mr-1 h-3 w-3" /> Respinge
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredSubmissions.length === 0 && (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            Nu există articole cu acest status.
          </div>
        )}
      </div>

      <SubmissionWorkflowDrawer
        submission={activeSubmission}
        open={!!activeSubmission}
        onOpenChange={(open) => { if (!open) setActiveSubmissionId(null); }}
      />
    </div>
  );
}
