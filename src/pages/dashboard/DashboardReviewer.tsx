import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, ChevronDown, ChevronUp, Download, FileText } from 'lucide-react';
import { useSubmissionData } from '@/data/SubmissionDataProvider';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Submission } from '@/data/types';
import {
  REVIEW_ANSWER_LABELS,
  REVIEW_ANSWER_ORDER,
  REVIEW_CRITERIA,
  REVIEW_RECOMMENDATIONS,
  countReviewAnswers,
  isCompleteReviewForm,
  reviewRecommendationLabel,
} from '@/data/reviewForm';

function todayIsoDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

const DEMO_SUBMISSIONS: Submission[] = [
  {
    id: 'demo-rev-1',
    title: 'Practici rituale in zona Muntilor Apuseni: o analiza comparativa',
    authors: '[Anonim]',
    email: '',
    affiliation: '',
    abstract: 'Studiul propune o analiza comparativa a practicilor rituale din zona Muntilor Apuseni, bazata pe cercetari de teren efectuate intre 2019 si 2024.',
    keywords_ro: 'ritualuri, etnografie, Apuseni',
    keywords_en: 'rituals, ethnography, Apuseni',
    date_submitted: '2026-02-15',
    status: 'under_review',
    assigned_reviewer: '',
    assigned_reviewer_email: '',
    reviewer_deadline: '2026-04-15',
    recommendation: '',
    decision: '',
    files: [{ id: 'demo-file-1', filename: 'manuscris_blind_001.docx', size: 245000 }],
    anonymized_files: [],
  },
];

type ReviewerDraft = {
  recommendation: string;
  notes: string;
  answers: Submission['review_form'];
};

function ReviewAnswerButtons({
  currentValue,
  onSelect,
}: {
  currentValue: string;
  onSelect: (value: 'yes' | 'partial' | 'no') => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {REVIEW_ANSWER_ORDER.map((answer) => {
        const active = currentValue === answer;
        return (
          <button
            key={answer}
            type="button"
            className={`rounded-md border px-2 py-1.5 text-[0.7rem] font-semibold transition-colors ${
              active
                ? 'border-primary bg-primary text-primary-foreground'
                : 'bg-background hover:bg-accent/60'
            }`}
            onClick={() => onSelect(answer)}
          >
            {REVIEW_ANSWER_LABELS[answer]}
          </button>
        );
      })}
    </div>
  );
}

export default function DashboardReviewer() {
  const { user } = useAuth();
  const { getSubmissionsForReviewer, updateSubmission, downloadSubmissionFile } = useSubmissionData();
  const { toast } = useToast();

  const [formState, setFormState] = useState<Record<string, ReviewerDraft>>({});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [demoSubmitted, setDemoSubmitted] = useState<Record<string, string>>({});

  const realAssigned = useMemo(
    () => getSubmissionsForReviewer(user?.email || ''),
    [getSubmissionsForReviewer, user?.email],
  );

  const assignedSubmissions = realAssigned.length > 0 ? realAssigned : DEMO_SUBMISSIONS;
  const isDemo = realAssigned.length === 0;

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getReviewerSlot = (submission: Submission): 1 | 2 => {
    const reviewerEmail = (user?.email || '').trim().toLowerCase();
    if (submission.assigned_reviewer_email_2?.toLowerCase() === reviewerEmail) return 2;
    return 1;
  };

  const getFormKey = (submissionId: string, slot: 1 | 2) => `${submissionId}-${slot}`;

  const reviewedCount = assignedSubmissions.filter((submission) => {
    if (isDemo) return Boolean(demoSubmitted[submission.id]);
    const slot = getReviewerSlot(submission);
    return slot === 2 ? Boolean(submission.reviewed_at_2) : Boolean(submission.reviewed_at);
  }).length;

  const updateDraft = (
    submissionId: string,
    slot: 1 | 2,
    updater: (current: ReviewerDraft) => ReviewerDraft,
  ) => {
    const formKey = getFormKey(submissionId, slot);
    setFormState((prev) => {
      const current = prev[formKey] || { recommendation: '', notes: '', answers: {} };
      return {
        ...prev,
        [formKey]: updater(current),
      };
    });
  };

  const submitReview = async (submission: Submission, slot: 1 | 2) => {
    const formKey = getFormKey(submission.id, slot);
    const entry = formState[formKey] || { recommendation: '', notes: '', answers: {} };

    if (!isCompleteReviewForm(entry.answers)) {
      toast({
        title: 'Formular incomplet',
        description: 'Completeaza toate cele 11 intrebari din formularul de evaluare.',
        variant: 'destructive',
      });
      return;
    }

    if (!entry.recommendation) {
      toast({
        title: 'Lipseste recomandarea finala',
        description: 'Alege una dintre cele 3 concluzii ale formularului.',
        variant: 'destructive',
      });
      return;
    }

    if (isDemo) {
      setDemoSubmitted((prev) => ({ ...prev, [submission.id]: entry.recommendation }));
      toast({ title: 'Recenzie trimisa', description: 'Formularul a fost inregistrat (demo).' });
      return;
    }

    const reviewerChanges: Partial<Submission> = slot === 2
      ? {
          recommendation_2: entry.recommendation,
          review_form_2: entry.answers,
          review_notes_2: entry.notes,
          reviewed_at_2: todayIsoDate(),
        }
      : {
          recommendation: entry.recommendation,
          review_form: entry.answers,
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

    toast({ title: 'Recenzie trimisa', description: 'Editorul a fost notificat.' });
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
          <h1 className="font-serif text-2xl font-bold">Panou recenzor</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Completează formularul de evaluare pentru manuscrisele anonimizate atribuite.
        </p>
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
          <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold mt-1">Trimise</div>
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <ClipboardCheck className="h-5 w-5 text-primary mb-3" />
          <div className="font-serif text-2xl font-bold">{assignedSubmissions.length - reviewedCount}</div>
          <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold mt-1">În lucru</div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-bold">Manuscrise pentru evaluare</h2>

        {assignedSubmissions.map((submission) => {
          const reviewerSlot = isDemo ? 1 : getReviewerSlot(submission);
          const formKey = getFormKey(submission.id, reviewerSlot);
          const savedAnswers = reviewerSlot === 2 ? submission.review_form_2 : submission.review_form;
          const savedRecommendation = reviewerSlot === 2 ? submission.recommendation_2 : submission.recommendation;
          const savedReviewedAt = reviewerSlot === 2 ? submission.reviewed_at_2 : submission.reviewed_at;
          const savedNotes = reviewerSlot === 2 ? submission.review_notes_2 : submission.review_notes;
          const draft = formState[formKey] || { recommendation: '', notes: '', answers: {} };
          const recommendation = draft.recommendation || (isDemo ? (demoSubmitted[submission.id] || '') : (savedRecommendation || ''));
          const notes = draft.notes || savedNotes || '';
          const answers = Object.keys(draft.answers || {}).length > 0 ? draft.answers : (savedAnswers || {});
          const answeredCounts = countReviewAnswers(answers);
          const answeredTotal = answeredCounts.yes + answeredCounts.partial + answeredCounts.no;
          const isReviewed = isDemo ? Boolean(demoSubmitted[submission.id]) : Boolean(savedReviewedAt);
          const expanded = expandedIds.has(submission.id);
          const reviewFiles = (submission.anonymized_files && submission.anonymized_files.length > 0)
            ? submission.anonymized_files
            : (submission.files || []);

          return (
            <div key={submission.id} className="rounded-lg border bg-card shadow-sm overflow-hidden">
              <div
                className="flex cursor-pointer flex-col gap-3 p-4 hover:bg-accent/30 transition-colors sm:flex-row sm:items-start"
                onClick={() => toggleExpanded(submission.id)}
              >
                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.6rem] uppercase tracking-[0.05em] font-semibold bg-series-2-bg text-series-2-foreground">
                      În evaluare
                    </span>
                    {isReviewed && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.6rem] uppercase tracking-[0.05em] font-semibold bg-primary/10 text-primary">
                        {reviewRecommendationLabel(recommendation)}
                      </span>
                    )}
                    {isReviewed && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.6rem] uppercase tracking-[0.05em] font-semibold bg-emerald-100 text-emerald-800">
                        Formular trimis
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 text-sm font-medium break-words">{submission.title}</h3>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Manuscris blind · Termen: {reviewerSlot === 2 ? (submission.reviewer_deadline_2 || '—') : (submission.reviewer_deadline || '—')}
                  </div>
                </div>
                <div className="flex w-full justify-end sm:w-auto">
                  {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>

              {expanded && (
                <div className="border-t px-4 py-5 space-y-5 bg-muted/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-lg border bg-card p-3">
                      <div className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Răspunsuri completate</div>
                      <div className="font-serif text-2xl font-bold mt-1">{answeredTotal}/11</div>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                      <div className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Rezultat curent</div>
                      <div className="text-sm font-semibold mt-2">{reviewRecommendationLabel(recommendation)}</div>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                      <div className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Scor grilă</div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Da: {answeredCounts.yes} · Parțial: {answeredCounts.partial} · Nu: {answeredCounts.no}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Rezumat</div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{submission.abstract}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Cuvinte cheie (RO)</div>
                      <p className="text-sm text-foreground/80">{submission.keywords_ro || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Cuvinte cheie (EN)</div>
                      <p className="text-sm text-foreground/80">{submission.keywords_en || '—'}</p>
                    </div>
                  </div>

                  {reviewFiles.length > 0 && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
                      <div className="text-[0.65rem] uppercase tracking-[0.08em] text-emerald-800 font-semibold">
                        Fișiere blind pentru evaluare
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {reviewFiles.map((file) => (
                          <Button
                            key={file.id}
                            variant="outline"
                            size="sm"
                            className="border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                            onClick={() => {
                              if (isDemo) {
                                toast({ title: 'Demo', description: `Fișierul "${file.filename}" nu este disponibil în modul demo.` });
                              } else {
                                void handleDownload(submission.id, file.id, file.filename);
                              }
                            }}
                          >
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                            {file.filename}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg border bg-card p-4 space-y-4">
                    <div>
                      <h3 className="font-serif text-sm font-bold">Formular de evaluare</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Completează toate întrebările cu `Da`, `Parțial` sau `Nu`, apoi alege concluzia finală.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {REVIEW_CRITERIA.map((criterion, index) => (
                        <div key={criterion.id} className="rounded-md border p-3">
                          <div className="text-[0.68rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                            Întrebarea {index + 1}
                          </div>
                          <div className="text-sm font-medium mt-1">{criterion.ro}</div>
                          <div className="mt-3">
                            <ReviewAnswerButtons
                              currentValue={answers?.[criterion.id] || ''}
                              onSelect={(value) => updateDraft(submission.id, reviewerSlot, (current) => ({
                                ...current,
                                answers: {
                                  ...(current.answers || {}),
                                  [criterion.id]: value,
                                },
                              }))}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                        Concluzie finală
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {REVIEW_RECOMMENDATIONS.map((option) => {
                          const active = recommendation === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              className={`rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${
                                active
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'bg-background hover:bg-accent/50'
                              }`}
                              onClick={() => updateDraft(submission.id, reviewerSlot, (current) => ({
                                ...current,
                                recommendation: option.value,
                              }))}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                        Posibile sugestii pentru autor
                      </label>
                      <Textarea
                        rows={5}
                        placeholder="Observații pentru autor, corecturi recomandate, clarificări metodologice etc."
                        value={notes}
                        onChange={(event) => updateDraft(submission.id, reviewerSlot, (current) => ({
                          ...current,
                          notes: event.target.value,
                        }))}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button size="sm" className="w-full sm:w-auto" onClick={() => void submitReview(submission, reviewerSlot)} disabled={isReviewed}>
                        {isReviewed ? 'Formular trimis' : 'Trimite evaluarea'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
