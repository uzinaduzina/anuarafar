import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck } from 'lucide-react';
import { useSubmissionData } from '@/data/SubmissionDataProvider';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

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
  const { getSubmissionsForReviewer, updateSubmission } = useSubmissionData();
  const { toast } = useToast();

  const [formState, setFormState] = useState<Record<string, { recommendation: string; notes: string }>>({});

  const assignedSubmissions = useMemo(
    () => getSubmissionsForReviewer(user?.email || ''),
    [getSubmissionsForReviewer, user?.email],
  );

  const reviewedCount = assignedSubmissions.filter((submission) => Boolean(submission.reviewed_at)).length;

  const updateForm = (id: string, key: 'recommendation' | 'notes', value: string) => {
    setFormState((prev) => ({
      ...prev,
      [id]: {
        recommendation: prev[id]?.recommendation || '',
        notes: prev[id]?.notes || '',
        [key]: value,
      },
    }));
  };

  const submitReview = (id: string) => {
    const entry = formState[id];
    if (!entry?.recommendation) {
      toast({
        title: 'Selecteaza recomandarea',
        description: 'Trebuie sa alegi o recomandare editoriala.',
        variant: 'destructive',
      });
      return;
    }

    updateSubmission(id, {
      recommendation: entry.recommendation,
      review_notes: entry.notes,
      reviewed_at: todayIsoDate(),
      status: 'decision_pending',
    });

    toast({
      title: 'Recenzie trimisa',
      description: 'Recomandarea a fost inregistrata pentru editor.',
    });
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
              const recommendation = formState[submission.id]?.recommendation || submission.recommendation || '';
              const notes = formState[submission.id]?.notes ?? submission.review_notes ?? '';

              return (
                <div key={submission.id} className="p-4 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="font-medium text-sm">{submission.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {submission.authors} · {submission.date_submitted}
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
                        onChange={(event) => updateForm(submission.id, 'recommendation', event.target.value)}
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
                        onChange={(event) => updateForm(submission.id, 'notes', event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button size="sm" onClick={() => submitReview(submission.id)}>Trimite recomandare</Button>
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
