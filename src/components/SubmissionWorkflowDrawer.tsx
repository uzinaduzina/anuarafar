import { useEffect, useMemo, useState } from 'react';
import { Download, FileUp, Save, Shield, WandSparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSubmissionData } from '@/data/SubmissionDataProvider';
import type { Submission } from '@/data/types';
import { useToast } from '@/hooks/use-toast';

interface SubmissionWorkflowDrawerProps {
  submission: Submission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

  useEffect(() => {
    if (!submission) return;
    setForm({ ...submission });
    setSelectedFiles([]);
  }, [submission]);

  const anonymizedFiles = useMemo(
    () => submission?.anonymized_files || [],
    [submission],
  );

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
      toast({
        title: 'Nu am putut salva metadatele',
        description: result.error || 'Incearca din nou.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Metadate salvate',
      description: 'Editorul a actualizat rezumatul, cuvintele cheie si datele de contact.',
    });
  };

  const handleMarkAnonymization = async () => {
    const result = await updateSubmission(submission.id, { status: 'anonymization' });
    if (!result.ok) {
      toast({
        title: 'Nu am putut actualiza statusul',
        description: result.error || 'Incearca din nou.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Pas de anonimizare activ',
      description: 'Submisia este marcata pentru pregatirea versiunii blind.',
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: 'Selecteaza fisierele',
        description: 'Incarca varianta anonimizata in DOC, DOCX sau PDF.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    const result = await uploadAnonymizedFiles(submission.id, selectedFiles);
    setUploading(false);

    if (!result.ok) {
      toast({
        title: 'Upload esuat',
        description: result.error || 'Nu am putut incarca varianta anonimizata.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFiles([]);
    toast({
      title: 'Fisier anonim incarcat',
      description: 'Reviewerii vor primi doar aceasta versiune.',
    });
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    const result = await downloadSubmissionFile(submission.id, fileId, fileName);
    if (!result.ok) {
      toast({
        title: 'Nu am putut descarca fisierul',
        description: result.error || 'Incearca din nou.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle className="font-serif text-base">Metadate și anonimizare</SheetTitle>
          <SheetDescription className="text-xs">
            Editorul poate corecta metadatele și poate încărca versiunea blind pentru review.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 py-4">
          <section className="rounded-lg border bg-secondary/30 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <WandSparkles className="h-4 w-4 text-primary" />
              Flux recomandat
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Varianta robustă este: editorul deschide fișierul în Word sau Google Docs, elimină autorii,
              afilierea și emailurile, apoi exportă din nou în DOCX/PDF și încarcă aici versiunea anonimizată.
            </p>
          </section>

          <section className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Titlu</Label>
                <Input value={String(form.title || '')} onChange={(event) => setField('title', event.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Autor(i)</Label>
                <Input value={String(form.authors || '')} onChange={(event) => setField('authors', event.target.value)} />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Email contact</Label>
                <Input value={String(form.email || '')} onChange={(event) => setField('email', event.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Afiliere</Label>
                <Input value={String(form.affiliation || '')} onChange={(event) => setField('affiliation', event.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Rezumat</Label>
              <Textarea rows={5} value={String(form.abstract || '')} onChange={(event) => setField('abstract', event.target.value)} />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Cuvinte cheie (RO)</Label>
                <Input value={String(form.keywords_ro || '')} onChange={(event) => setField('keywords_ro', event.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Keywords (EN)</Label>
                <Input value={String(form.keywords_en || '')} onChange={(event) => setField('keywords_en', event.target.value)} />
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
                  <Button
                    key={file.id}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => void handleDownload(file.id, file.filename)}
                  >
                    <Download className="mr-2 h-3 w-3" /> {file.filename}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium">Versiune anonimizată</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Dacă lucrezi în Google Docs, exportă în Word și încarcă aici fișierul final pentru review.
              </p>
              {submission.anonymized_at && (
                <p className="mt-2 text-xs text-muted-foreground">Ultimul upload: {submission.anonymized_at}</p>
              )}

              <div className="mt-3 space-y-2">
                {anonymizedFiles.length === 0 ? (
                  <div className="rounded-md border border-dashed px-3 py-4 text-xs text-muted-foreground">
                    Nu există încă fișiere blind.
                  </div>
                ) : (
                  anonymizedFiles.map((file) => (
                    <Button
                      key={file.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => void handleDownload(file.id, file.filename)}
                    >
                      <Download className="mr-2 h-3 w-3" /> {file.filename}
                    </Button>
                  ))
                )}
              </div>

              <div className="mt-4 space-y-3">
                <Input
                  type="file"
                  multiple
                  accept=".doc,.docx,.pdf"
                  onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))}
                />
                {selectedFiles.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Selectate: {selectedFiles.map((file) => file.name).join(', ')}
                  </p>
                )}
                <Button size="sm" onClick={() => void handleUpload()} disabled={uploading}>
                  <FileUp className="mr-2 h-4 w-4" /> {uploading ? 'Încarc...' : 'Încarcă versiunea anonimă'}
                </Button>
              </div>
            </div>
          </section>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Închide</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
