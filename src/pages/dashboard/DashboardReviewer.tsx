import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, ChevronDown, ChevronUp, FileText, Download } from 'lucide-react';
import { useSubmissionData } from '@/data/SubmissionDataProvider';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Submission } from '@/data/types';

const recommendationLabels: Record<string, { label: string; cls: string }> = {
  accept: { label: 'Acceptat', cls: 'bg-series-1-bg text-series-1-foreground' },
  minor_revisions: { label: 'Revizuiri minore', cls: 'bg-amber-100 text-amber-900' },
  major_revisions: { label: 'Revizuiri majore', cls: 'bg-series-3-bg text-series-3-foreground' },
  reject: { label: 'Respins', cls: 'bg-destructive/10 text-destructive' },
};

function todayIsoDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

const DEMO_SUBMISSIONS: Submission[] = [
  {
    id: 'demo-rev-1',
    title: 'Practici rituale în zona Munților Apuseni: o analiză comparativă',
    authors: '[Anonim]',
    email: '',
    affiliation: '',
    abstract: 'Studiul propune o analiză comparativă a practicilor rituale din zona Munților Apuseni, bazată pe cercetări de teren efectuate între 2019 și 2024. Sunt examinate ritualurile de trecere, obiceiurile calendaristice și formele de religiozitate populară, cu accent pe transformările suferite în ultimele decenii. Metodologia combină observația participativă cu interviurile semi-structurate aplicate în 12 comunități rurale.',
    keywords_ro: 'ritualuri, Munții Apuseni, etnografie, obiceiuri calendaristice, religiozitate populară',
    keywords_en: 'rituals, Apuseni Mountains, ethnography, calendar customs, popular religiosity',
    date_submitted: '2026-02-15',
    status: 'under_review',
    assigned_reviewer: '', assigned_reviewer_email: '',
    reviewer_deadline: '2026-04-15',
    recommendation: '', decision: '',
    anonymized_files: [
      { id: 'demo-file-1', filename: 'manuscris_blind_001.docx', size: 245000 },
    ],
  },
  {
    id: 'demo-rev-2',
    title: 'Narative orale și identitate comunitară în satele din Maramureș',
    authors: '[Anonim]',
    email: '',
    affiliation: '',
    abstract: 'Articolul investighează rolul narativelor orale în construcția identității comunitare din cinci sate maramureșene. Prin analiza tematică a 47 de interviuri colectate, se evidențiază modul în care memoriile colective și legendele locale contribuie la menținerea coeziunii sociale și la diferențierea față de comunitățile învecinate. Se propune un model interpretativ bazat pe teoria memoriei culturale.',
    keywords_ro: 'narative orale, identitate comunitară, Maramureș, memorie culturală, coeziune socială',
    keywords_en: 'oral narratives, community identity, Maramureș, cultural memory, social cohesion',
    date_submitted: '2026-02-20',
    status: 'under_review',
    assigned_reviewer: '', assigned_reviewer_email: '',
    reviewer_deadline: '2026-04-20',
    recommendation: '', decision: '',
  },
  {
    id: 'demo-rev-3',
    title: 'Tipologia basmului fantastic românesc: noi perspective metodologice',
    authors: '[Anonim]',
    email: '',
    affiliation: '',
    abstract: 'Lucrarea reconsideră tipologia basmului fantastic românesc prin prisma metodelor computaționale aplicate unui corpus de 320 de texte din arhivele Academiei Române. Se demonstrează că clasificarea clasică Aarne-Thompson-Uther necesită adaptări pentru specificul narativ sud-est european și se propun trei subtipuri noi, validate statistic.',
    keywords_ro: 'basm fantastic, tipologie, Aarne-Thompson-Uther, analiză computațională, folclor românesc',
    keywords_en: 'fairy tale, typology, Aarne-Thompson-Uther, computational analysis, Romanian folklore',
    date_submitted: '2026-03-01',
    status: 'under_review',
    assigned_reviewer: '', assigned_reviewer_email: '',
    reviewer_deadline: '2026-04-30',
    recommendation: '', decision: '',
  },
];

export default function DashboardReviewer() {
  const { user } = useAuth();
  const { getSubmissionsForReviewer, updateSubmission, downloadSubmissionFile } = useSubmissionData();
  const { toast } = useToast();

  const [formState, setFormState] = useState<Record<string, { recommendation: string; notes: string }>>({});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [demoRecommendations, setDemoRecommendations] = useState<Record<string, string>>({});

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
    if (isDemo) return Boolean(demoRecommendations[submission.id]);
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
      toast({ title: 'Selectează recomandarea', description: 'Trebuie să alegi o recomandare editorială.', variant: 'destructive' });
      return;
    }

    if (isDemo) {
      setDemoRecommendations((prev) => ({ ...prev, [submission.id]: entry.recommendation }));
      toast({ title: 'Recenzie trimisă', description: 'Recomandarea a fost înregistrată (demo).' });
      return;
    }

    const reviewerChanges: Partial<Submission> = slot === 2
      ? { recommendation_2: entry.recommendation, review_notes_2: entry.notes, reviewed_at_2: todayIsoDate() }
      : { recommendation: entry.recommendation, review_notes: entry.notes, reviewed_at: todayIsoDate() };

    const result = await updateSubmission(submission.id, reviewerChanges);
    if (!result.ok) {
      toast({ title: 'Nu am putut trimite recenzia', description: result.error || 'Încearcă din nou.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Recenzie trimisă', description: 'Recomandarea a fost înregistrată pentru editor.' });
  };

  const handleDownload = async (submissionId: string, fileId: string, fileName: string) => {
    const result = await downloadSubmissionFile(submissionId, fileId, fileName);
    if (!result.ok) {
      toast({ title: 'Nu am putut descărca fișierul', description: result.error || 'Încearcă din nou.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold">Panou reviewer</h1>
        <p className="text-sm text-muted-foreground mt-1">Evaluează manuscrisele anonimizate atribuite pentru recenzie.</p>
      </div>

      {/* Stats */}
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
          <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold mt-1">În lucru</div>
        </div>
      </div>

      {/* Submissions as expandable cards */}
      <section className="space-y-3">
        <h2 className="font-serif text-lg font-bold">Manuscrise pentru evaluare</h2>

        {assignedSubmissions.map((submission) => {
          const reviewerSlot = isDemo ? 1 : getReviewerSlot(submission);
          const formKey = getFormKey(submission.id, reviewerSlot);
          const recommendation = formState[formKey]?.recommendation
            || (isDemo ? (demoRecommendations[submission.id] || '') : (reviewerSlot === 2 ? submission.recommendation_2 : submission.recommendation))
            || '';
          const notes = formState[formKey]?.notes ?? '';
          const expanded = expandedIds.has(submission.id);
          const isReviewed = isDemo ? Boolean(demoRecommendations[submission.id]) : (reviewerSlot === 2 ? Boolean(submission.reviewed_at_2) : Boolean(submission.reviewed_at));
          const recConfig = recommendation ? recommendationLabels[recommendation] : null;

          return (
            <div key={submission.id} className="rounded-lg border bg-card shadow-sm overflow-hidden">
              {/* Card header */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/30 transition-colors"
                onClick={() => toggleExpanded(submission.id)}
              >
                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.6rem] uppercase tracking-[0.05em] font-semibold bg-series-2-bg text-series-2-foreground">
                      În evaluare
                    </span>
                    {isReviewed && recConfig && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.6rem] uppercase tracking-[0.05em] font-semibold ${recConfig.cls}`}>
                        {recConfig.label}
                      </span>
                    )}
                    {isReviewed && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.6rem] uppercase tracking-[0.05em] font-semibold bg-primary/10 text-primary">
                        ✓ Recenzat
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-sm mt-1 truncate">{submission.title}</h3>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Manuscris anonimizat · Termen: {submission.reviewer_deadline || '—'}
                  </div>
                </div>
                {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>

              {/* Expanded content */}
              {expanded && (
                <div className="border-t px-4 py-5 space-y-5 bg-muted/30">
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
                      <div className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Keywords (EN)</div>
                      <p className="text-sm text-foreground/80">{submission.keywords_en || '—'}</p>
                    </div>
                  </div>

                  {/* Anonymized files for review */}
                  {(submission.anonymized_files?.length || 0) > 0 && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
                      <div className="text-[0.65rem] uppercase tracking-[0.08em] text-emerald-800 font-semibold flex items-center gap-1.5">
                        <Download className="h-3.5 w-3.5" />
                        Manuscris anonimizat — descarcă pentru evaluare
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {submission.anonymized_files!.map((file) => {
                          const sizeKB = Math.round(file.size / 1024);
                          return (
                            <Button
                              key={file.id}
                              variant="outline"
                              size="sm"
                              className="border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                              onClick={() => {
                                if (isDemo) {
                                  toast({ title: 'Demo', description: `Fișierul „${file.filename}" nu este disponibil în modul demo.` });
                                } else {
                                  void handleDownload(submission.id, file.id, file.filename);
                                }
                              }}
                            >
                              <FileText className="mr-1.5 h-3.5 w-3.5" />
                              {file.filename}
                              <span className="ml-1.5 text-emerald-600/70 text-[0.65rem]">({sizeKB} KB)</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Original files (only for real submissions, non-anonymized) */}
                  {!isDemo && submission.files && submission.files.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Fișiere originale</div>
                      <div className="flex flex-wrap gap-2">
                        {submission.files.map((file) => (
                          <Button key={file.id} variant="outline" size="sm" onClick={() => handleDownload(submission.id, file.id, file.filename)}>
                            <Download className="mr-2 h-3 w-3" /> {file.filename}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review form */}
                  <div className="rounded-lg border bg-card p-4 space-y-4">
                    <h3 className="font-serif text-sm font-bold">Formularul de evaluare</h3>
                    <div className="space-y-2">
                      <label className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Recomandare editorială *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {Object.entries(recommendationLabels).map(([value, { label, cls }]) => (
                          <button
                            key={value}
                            type="button"
                            className={`rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${
                              recommendation === value
                                ? `${cls} border-transparent ring-2 ring-primary/30`
                                : 'bg-background hover:bg-accent/50'
                            }`}
                            onClick={() => updateForm(submission.id, reviewerSlot, 'recommendation', value)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Observații și comentarii</label>
                      <Textarea
                        rows={4}
                        placeholder="Comentarii detaliate despre calitatea, metodologia și relevanța manuscrisului..."
                        value={notes}
                        onChange={(e) => updateForm(submission.id, reviewerSlot, 'notes', e.target.value)}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => void submitReview(submission, reviewerSlot)} disabled={isReviewed}>
                        {isReviewed ? '✓ Recenzie trimisă' : 'Trimite recomandarea'}
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
