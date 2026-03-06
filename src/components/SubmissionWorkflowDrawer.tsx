import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Download, FileUp, MessageSquare, RotateCcw, Save, Send, Shield, WandSparkles, XCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubmissionData } from '@/data/SubmissionDataProvider';
import type { Submission } from '@/data/types';
import { useToast } from '@/hooks/use-toast';

const recommendationConfig: Record<string, { label: string; cls: string }> = {
  accept: { label: 'Acceptat', cls: 'bg-series-1-bg text-series-1-foreground' },
  acceptat: { label: 'Acceptat', cls: 'bg-series-1-bg text-series-1-foreground' },
  minor_revisions: { label: 'Revizuiri minore', cls: 'bg-amber-100 text-amber-900' },
  'acceptat cu revizuiri minore': { label: 'Revizuiri minore', cls: 'bg-amber-100 text-amber-900' },
  major_revisions: { label: 'Revizuiri majore', cls: 'bg-series-3-bg text-series-3-foreground' },
  'revizuire solicitată': { label: 'Revizuiri majore', cls: 'bg-series-3-bg text-series-3-foreground' },
  reject: { label: 'Respins', cls: 'bg-destructive/10 text-destructive' },
  respins: { label: 'Respins', cls: 'bg-destructive/10 text-destructive' },
};

interface SubmissionWorkflowDrawerProps {
  submission: Submission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ReviewCard({ label, reviewer, recommendation, notes, reviewedAt }: {
  label: string;
  reviewer: string;
  recommendation?: string;
  notes?: string;
  reviewedAt?: string;
}) {
  const hasReview = !!recommendation;
  const recConfig = recommendation
    ? recommendationConfig[recommendation.toLowerCase()] || { label: recommendation, cls: 'bg-secondary text-secondary-foreground' }
    : null;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{label}</div>
        {hasReview ? (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${recConfig!.cls}`}>
            {recConfig!.label}
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary text-muted-foreground">
            În așteptare
          </span>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        Reviewer: <span className="font-medium text-foreground">{reviewer || 'Nealocat'}</span>
      </div>

      {hasReview ? (
        <>
          {notes && (
            <div className="space-y-1">
              <div className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Note de recenzie
              </div>
              <div className="rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap leading-relaxed">
                {notes}
              </div>
            </div>
          )}
          {reviewedAt && (
            <div className="text-xs text-muted-foreground">Evaluat la: {reviewedAt}</div>
          )}
        </>
      ) : (
        <div className="rounded-md border border-dashed p-4 text-xs text-muted-foreground text-center">
          Recenzia nu a fost încă trimisă.
        </div>
      )}
    </div>
  );
}

export default function SubmissionWorkflowDrawer({
  submission,
  open,
  onOpenChange,
}: SubmissionWorkflowDrawerProps) {
  const { updateSubmission, uploadAnonymizedFiles, downloadSubmissionFile } = useSubmissionData();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Submission>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editorMessage, setEditorMessage] = useState('');

  useEffect(() => {
    if (!submission) return;
    setForm({ ...submission });
    setSelectedFiles([]);
    setEditorMessage('');
  }, [submission]);

  const anonymizedFiles = useMemo(() => submission?.anonymized_files || [], [submission]);

  if (!submission) return null;

  const setField = (field: keyof Submission, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveMetadata = async () => {
    setSaving(true);
    const result = await updateSubmission(submission.id, {
      title: String(form.title || '').trim(),
      authors: String(form.authors || '').trim(),
      email: String(form.email || '').trim(),
      affiliation: String(form.affiliation || '').trim(),
      abstract: String(form.abstract || '').trim(),
      keywords_ro: String(form.keywords_ro || '').trim(),
      keywords_en: String(form.keywords_en || '').trim(),
    });
    setSaving(false);
    if (!result.ok) {
      toast({ title: 'Nu am putut salva metadatele', description: result.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Metadate salvate' });
  };

  const handleMarkAnonymization = async () => {
    const result = await updateSubmission(submission.id, { status: 'anonymization' });
    if (!result.ok) {
      toast({ title: 'Eroare', description: result.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Pas de anonimizare activ' });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({ title: 'Selectează fișierele', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const result = await uploadAnonymizedFiles(submission.id, selectedFiles);
    setUploading(false);
    if (!result.ok) {
      toast({ title: 'Upload eșuat', description: result.error, variant: 'destructive' });
      return;
    }
    setSelectedFiles([]);
    toast({ title: 'Fișier anonim încărcat' });
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    const result = await downloadSubmissionFile(submission.id, fileId, fileName);
    if (!result.ok) toast({ title: 'Descărcare eșuată', description: result.error, variant: 'destructive' });
  };

  const handleDecision = async (status: Submission['status'], decision: string, successTitle: string) => {
    const result = await updateSubmission(submission.id, { status, decision });
    if (!result.ok) {
      toast({ title: 'Eroare', description: result.error, variant: 'destructive' });
      return;
    }
    toast({ title: successTitle, description: 'Autorul va primi notificarea.' });
  };

  const handleSendToAuthor = async () => {
    if (!editorMessage.trim()) {
      toast({ title: 'Adaugă un mesaj', description: 'Scrie feedback-ul pentru autor.', variant: 'destructive' });
      return;
    }
    const result = await updateSubmission(submission.id, {
      status: 'revision_requested',
      decision: `Revizuire solicitată – ${editorMessage.trim()}`,
    });
    if (!result.ok) {
      toast({ title: 'Eroare', description: result.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Feedback trimis autorului' });
    setEditorMessage('');
  };

  const hasAnyReview = !!submission.recommendation || !!submission.recommendation_2;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle className="font-serif text-base">{submission.title}</SheetTitle>
          <SheetDescription className="text-xs">
            {submission.authors} · Trimis: {submission.date_submitted}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue={hasAnyReview ? 'reviews' : 'metadata'} className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="metadata" className="flex-1 text-xs">Metadate & Anonimizare</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1 text-xs relative">
              Recenzii & Decizie
              {hasAnyReview && (
                <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[0.55rem] text-primary-foreground font-bold">
                  {(submission.recommendation ? 1 : 0) + (submission.recommendation_2 ? 1 : 0)}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Metadata & Anonymization ── */}
          <TabsContent value="metadata" className="space-y-5 mt-4">
            <section className="rounded-lg border bg-secondary/30 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <WandSparkles className="h-4 w-4 text-primary" />
                Flux recomandat
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Editorul deschide fișierul, elimină autorii și afilierea, apoi exportă versiunea anonimizată.
              </p>
            </section>

            <section className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Titlu</Label>
                  <Input value={String(form.title || '')} onChange={(e) => setField('title', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Autor(i)</Label>
                  <Input value={String(form.authors || '')} onChange={(e) => setField('authors', e.target.value)} />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Email</Label>
                  <Input value={String(form.email || '')} onChange={(e) => setField('email', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Afiliere</Label>
                  <Input value={String(form.affiliation || '')} onChange={(e) => setField('affiliation', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Rezumat</Label>
                <Textarea rows={4} value={String(form.abstract || '')} onChange={(e) => setField('abstract', e.target.value)} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Cuvinte cheie (RO)</Label>
                  <Input value={String(form.keywords_ro || '')} onChange={(e) => setField('keywords_ro', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Keywords (EN)</Label>
                  <Input value={String(form.keywords_en || '')} onChange={(e) => setField('keywords_en', e.target.value)} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => void handleSaveMetadata()} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" /> {saving ? 'Salvez...' : 'Salvează metadate'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => void handleMarkAnonymization()}>
                  <Shield className="mr-2 h-4 w-4" /> Marchează în anonimizare
                </Button>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium">Fișiere originale</div>
                <div className="mt-3 space-y-2">
                  {(submission.files || []).map((file) => (
                    <Button key={file.id} variant="outline" size="sm" className="w-full justify-start" onClick={() => void handleDownload(file.id, file.filename)}>
                      <Download className="mr-2 h-3 w-3" /> {file.filename}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium">Versiune anonimizată</div>
                {submission.anonymized_at && (
                  <p className="mt-1 text-xs text-muted-foreground">Ultimul upload: {submission.anonymized_at}</p>
                )}
                <div className="mt-3 space-y-2">
                  {anonymizedFiles.length === 0 ? (
                    <div className="rounded-md border border-dashed px-3 py-4 text-xs text-muted-foreground">Nu există încă fișiere blind.</div>
                  ) : (
                    anonymizedFiles.map((file) => (
                      <Button key={file.id} variant="outline" size="sm" className="w-full justify-start" onClick={() => void handleDownload(file.id, file.filename)}>
                        <Download className="mr-2 h-3 w-3" /> {file.filename}
                      </Button>
                    ))
                  )}
                </div>
                <div className="mt-4 space-y-3">
                  <Input type="file" multiple accept=".doc,.docx,.pdf" onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} />
                  {selectedFiles.length > 0 && (
                    <p className="text-xs text-muted-foreground">Selectate: {selectedFiles.map((f) => f.name).join(', ')}</p>
                  )}
                  <Button size="sm" onClick={() => void handleUpload()} disabled={uploading}>
                    <FileUp className="mr-2 h-4 w-4" /> {uploading ? 'Încarc...' : 'Încarcă versiunea anonimă'}
                  </Button>
                </div>
              </div>
            </section>
          </TabsContent>

          {/* ── Tab 2: Reviews & Decision ── */}
          <TabsContent value="reviews" className="space-y-5 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <ReviewCard
                label="Reviewer 1"
                reviewer={submission.assigned_reviewer || ''}
                recommendation={submission.recommendation}
                notes={submission.review_notes}
                reviewedAt={submission.reviewed_at}
              />
              <ReviewCard
                label="Reviewer 2"
                reviewer={submission.assigned_reviewer_2 || ''}
                recommendation={submission.recommendation_2}
                notes={submission.review_notes_2}
                reviewedAt={submission.reviewed_at_2}
              />
            </div>

            <section className="rounded-lg border p-4 space-y-3">
              <div className="text-sm font-semibold">Mesaj pentru autor</div>
              <p className="text-xs text-muted-foreground">
                Sintetizează feedback-ul din recenzii și trimite decizia autorului.
              </p>
              <Textarea
                rows={4}
                placeholder="Ex: Vă rugăm să revizuiți secțiunea de metodologie conform observațiilor Reviewer 1..."
                value={editorMessage}
                onChange={(e) => setEditorMessage(e.target.value)}
              />
              <Button size="sm" variant="outline" onClick={() => void handleSendToAuthor()}>
                <Send className="mr-1.5 h-3.5 w-3.5" /> Trimite feedback autorului
              </Button>
            </section>

            <section className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="text-sm font-semibold">Decizie editorială finală</div>
              <p className="text-xs text-muted-foreground">
                Pe baza recenziilor, alege decizia finală pentru acest manuscris.
              </p>
              {submission.decision && (
                <div className="text-xs">
                  Decizie curentă: <span className="font-semibold text-primary">{submission.decision}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => void handleDecision('accepted', 'acceptat', 'Articol acceptat')}>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Acceptă
                </Button>
                <Button size="sm" variant="outline" onClick={() => void handleDecision('revision_requested', 'revizuire solicitată', 'Revizuire solicitată')}>
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Solicită revizuire
                </Button>
                <Button size="sm" variant="destructive" onClick={() => void handleDecision('rejected', 'respins', 'Articol respins')}>
                  <XCircle className="mr-1.5 h-3.5 w-3.5" /> Respinge
                </Button>
              </div>
            </section>
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Închide</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
