import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, Download } from 'lucide-react';
import { useSubmissionData } from '@/data/SubmissionDataProvider';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Submission } from '@/data/types';

const recommendationLabels: Record<string, string> = {
  accept: 'Acceptat',
  minor_revisions: 'Revizuiri minore',
  major_revisions: 'Revizuiri majore',
  reject: 'Respins',
};

function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DashboardReviewer() {
  const { user } = useAuth();
  const { getSubmissionsForReviewer, updateSubmission, downloadSubmissionFile } = useSubmissionData();
  const { toast } = useToast();

  const [formState, setFormState] = useState<Record<string, { recommendation: string; notes: string }>>({});

  const assignedSubmissions = useMemo(
    () => getSubmissionsForReviewer(user?.email || ''),
    [getSubmissionsForReviewer, user?.email],
  );

  const getReviewerSlot = (submission: Submission): 1 | 2 => {
    const reviewerEmail = (user?.email || '').trim().toLowerCase();
    if (submission.assigned_reviewer_email_2?.toLowerCase() === reviewerEmail) return 2;
    return 1;
  };

  const getFormKey = (submissionId: string, slot: 1 | 2) => `${submissionId}-${slot}`;

  const reviewedCount = assignedSubmissions.filter((submission) => {
    const slot = getReviewerSlot(submission);
    return slot === 2 ? Boolean(submission.reviewed_at_2) : Boolean(submission.reviewed_at);
  }).length;

  const updateForm = (id: string, slot: 1 | 2, key: 'recommendation' | 'notes', value: string) => {
    const formKey = getFormKey(id, slot);
    setFormState((prev) => ({
      ...prev,
      [formKey]: {
        recommendation: prev[formKey]?.recommendation || '',
        notes: prev[formKey]?.notes || '',
        [key]: value,
      },
    }));
  };

  const submitReview = async (submission: Submission, slot: 1 | 2) => {
    const formKey = getFormKey(submission.id, slot);
    const entry = formState[formKey];
    if (!entry?.recommendation) {
      toast({
        title: 'Selecteaza recomandarea',
        description: 'Trebuie sa alegi o recomandare editoriala.',
        variant: 'destructive',
      });
      return;
    }

    const reviewerChanges: Partial<Submission> = slot === 2
      ? {
          recommendation_2: entry.recommendation,
          review_notes_2: entry.notes,
          reviewed_at_2: todayIsoDate(),
        }
      : {
          recommendation: entry.recommendation,
          review_notes: entry.notes,
          reviewed_at: todayIsoDate(),
        };

    const result = await updateSubmission(submission.id, reviewerChanges);

    if (!result.ok) {
      toast({
        title: 'Nu am putut trimite recenzia',
        description: result.error || 'Incearca din nou.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Recenzie trimisa',
      description: 'Recomandarea a fost inregistrata pentru editor.',
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
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold">Panou reviewer</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestioneaza manuscrisele atribuite pentru recenzie.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <ClipboardCheck className="h-5 w-5 text-primary mb-3" />
          <div className="font-serif text-2xl font-bold">{assignedSubmissions.length}</div>
          <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold mt-1">Atribuite</div>
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-primary mb-3" />
          <div className="font-serif text-2xl font-bold">{reviewedCount}</div>
          <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold mt-1">Recenzate</div>
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <ClipboardCheck className="h-5 w-5 text-primary mb-3" />
          <div className="font-serif text-2xl font-bold">{assignedSubmissions.length - reviewedCount}</div>
          <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold mt-1">In lucru</div>
        </div>
      </div>

      <section className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-serif text-lg font-bold">Manuscrise atribuite</h2>
        </div>

        {assignedSubmissions.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">Nu ai manuscrise atribuite momentan.</div>
        ) : (
          <div className="divide-y">
            {assignedSubmissions.map((submission) => {
              const reviewerSlot = getReviewerSlot(submission);
              const formKey = getFormKey(submission.id, reviewerSlot);
              const recommendation = formState[formKey]?.recommendation
                || (reviewerSlot === 2 ? submission.recommendation_2 : submission.recommendation)
                || '';
              const notes = formState[formKey]?.notes
                ?? (reviewerSlot === 2 ? submission.review_notes_2 : submission.review_notes)
                ?? '';

              return (
                <div key={submission.id} className="p-4 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="font-medium text-sm">{submission.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Manuscris in evaluare double-blind · {submission.date_submitted}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Status: <span className="font-medium">{submission.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3">
                    <div>
                      <label className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold">Recomandare</label>
                      <select
                        className="mt-1 w-full h-9 rounded-md border bg-background px-3 text-sm"
                        value={recommendation}
                        onChange={(event) => updateForm(submission.id, reviewerSlot, 'recommendation', event.target.value)}
                      >
                        <option value="">Selecteaza...</option>
                        {Object.entries(recommendationLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold">Observatii reviewer</label>
                      <Textarea
                        className="mt-1"
                        rows={3}
                        value={notes}
                        onChange={(event) => updateForm(submission.id, reviewerSlot, 'notes', event.target.value)}
                      />
                    </div>
                  </div>

                  {submission.files && submission.files.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {submission.files.map((file) => (
                        <Button
                          key={file.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(submission.id, file.id, file.filename)}
                        >
                          <Download className="mr-2 h-3 w-3" /> {file.filename}
                        </Button>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button size="sm" onClick={() => void submitReview(submission, reviewerSlot)}>Trimite recomandare</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
