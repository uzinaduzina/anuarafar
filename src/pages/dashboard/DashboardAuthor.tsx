import { useMemo, useState } from 'react';
import { FileUp, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubmissionData } from '@/data/SubmissionDataProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const statusLabels: Record<string, string> = {
  submitted: 'Trimis',
  under_review: 'In evaluare',
  decision_pending: 'Decizie pendinte',
  accepted: 'Acceptat',
  rejected: 'Respins',
  revision_requested: 'Revizuire solicitata',
};

interface FormState {
  title: string;
  authors: string;
  affiliation: string;
  abstract: string;
  keywords_ro: string;
  keywords_en: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  authors: '',
  affiliation: '',
  abstract: '',
  keywords_ro: '',
  keywords_en: '',
};

export default function DashboardAuthor() {
  const { user } = useAuth();
  const { createSubmission, getSubmissionsForAuthor } = useSubmissionData();
  const { toast } = useToast();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const authorSubmissions = useMemo(
    () => getSubmissionsForAuthor(user?.email || ''),
    [getSubmissionsForAuthor, user?.email],
  );

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!user?.email) {
      toast({
        title: 'Eroare autentificare',
        description: 'Contul nu are email asociat.',
        variant: 'destructive',
      });
      return;
    }

    if (!form.title.trim() || !form.abstract.trim()) {
      toast({
        title: 'Date incomplete',
        description: 'Completeaza cel putin titlul si rezumatul.',
        variant: 'destructive',
      });
      return;
    }

    createSubmission({
      title: form.title,
      authors: form.authors || user.name,
      email: user.email,
      affiliation: form.affiliation,
      abstract: form.abstract,
      keywords_ro: form.keywords_ro,
      keywords_en: form.keywords_en,
    });

    setForm({ ...EMPTY_FORM, authors: user.name });

    toast({
      title: 'Manuscris trimis',
      description: 'Submisia a fost inregistrata in fluxul editorial.',
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold">Panou autor</h1>
        <p className="text-sm text-muted-foreground mt-1">Trimite manuscrise noi si urmareste statusul submisiilor tale.</p>
      </div>

      <section className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2">
          <FileUp className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-lg font-bold">Submisie noua</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="author-title">Titlu manuscris *</Label>
            <Input id="author-title" value={form.title} onChange={(event) => updateField('title', event.target.value)} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author-authors">Autori</Label>
              <Input
                id="author-authors"
                value={form.authors}
                onChange={(event) => updateField('authors', event.target.value)}
                placeholder={user?.name || 'Nume autori'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author-affiliation">Afiliere</Label>
              <Input id="author-affiliation" value={form.affiliation} onChange={(event) => updateField('affiliation', event.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="author-abstract">Rezumat *</Label>
            <Textarea id="author-abstract" rows={5} value={form.abstract} onChange={(event) => updateField('abstract', event.target.value)} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author-keywords-ro">Cuvinte cheie (RO)</Label>
              <Input id="author-keywords-ro" value={form.keywords_ro} onChange={(event) => updateField('keywords_ro', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author-keywords-en">Keywords (EN)</Label>
              <Input id="author-keywords-en" value={form.keywords_en} onChange={(event) => updateField('keywords_en', event.target.value)} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              <Send className="mr-2 h-4 w-4" /> Trimite manuscris
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-serif text-lg font-bold">Submisiile mele</h2>
        </div>

        {authorSubmissions.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">Nu exista submisii pentru contul curent.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary">
                  <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">ID</th>
                  <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Titlu</th>
                  <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Data</th>
                  <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Status</th>
                  <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Decizie</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {authorSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{submission.id}</td>
                    <td className="px-4 py-3 text-sm font-medium max-w-[320px] truncate">{submission.title}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{submission.date_submitted}</td>
                    <td className="px-4 py-3 text-sm">{statusLabels[submission.status] || submission.status}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{submission.decision || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
