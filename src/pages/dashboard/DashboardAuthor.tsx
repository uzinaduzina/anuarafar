import { useMemo, useState } from 'react';
import { FileUp, Send, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubmissionData } from '@/data/SubmissionDataProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const statusConfig: Record<string, { label: string; cls: string }> = {
  submitted: { label: 'Trimis', cls: 'bg-primary/10 text-primary' },
  anonymization: { label: 'În anonimizare', cls: 'bg-amber-100 text-amber-900' },
  under_review: { label: 'În evaluare', cls: 'bg-series-2-bg text-series-2-foreground' },
  decision_pending: { label: 'Decizie în așteptare', cls: 'bg-series-3-bg text-series-3-foreground' },
  accepted: { label: 'Acceptat', cls: 'bg-series-1-bg text-series-1-foreground' },
  rejected: { label: 'Respins', cls: 'bg-destructive/10 text-destructive' },
  revision_requested: { label: 'Revizuire', cls: 'bg-series-3-bg text-series-3-foreground' },
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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const authorSubmissions = useMemo(
    () => getSubmissionsForAuthor(user?.email || ''),
    [getSubmissionsForAuthor, user?.email],
  );

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!user?.email) {
      toast({ title: 'Eroare autentificare', description: 'Contul nu are email asociat.', variant: 'destructive' });
      return;
    }

    if (!form.title.trim() || !form.abstract.trim()) {
      toast({ title: 'Date incomplete', description: 'Completează cel puțin titlul și rezumatul.', variant: 'destructive' });
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
    toast({ title: 'Manuscris trimis', description: 'Articolul a fost înregistrat în fluxul editorial.' });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold">Panou autor</h1>
        <p className="text-sm text-muted-foreground mt-1">Trimite manuscrise noi și urmărește statusul articolelor tale.</p>
      </div>

      {/* Submission form – matches /submit page style */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold">Informații manuscris</h2>

          <div className="space-y-2">
            <Label htmlFor="author-title">Titlu *</Label>
            <Input id="author-title" required placeholder="Titlul manuscrisului" value={form.title} onChange={(e) => updateField('title', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author-authors">Autori *</Label>
              <Input id="author-authors" required placeholder="Nume autori (separați prin virgulă)" value={form.authors} onChange={(e) => updateField('authors', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author-affiliation">Afiliere instituțională</Label>
              <Input id="author-affiliation" placeholder="Universitatea / Institutul" value={form.affiliation} onChange={(e) => updateField('affiliation', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="author-abstract">Rezumat *</Label>
            <Textarea id="author-abstract" required placeholder="Rezumatul manuscrisului (max. 200 cuvinte)" rows={5} value={form.abstract} onChange={(e) => updateField('abstract', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author-keywords-ro">Cuvinte cheie (RO)</Label>
              <Input id="author-keywords-ro" placeholder="5 termeni, separați prin virgulă" value={form.keywords_ro} onChange={(e) => updateField('keywords_ro', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author-keywords-en">Keywords (EN)</Label>
              <Input id="author-keywords-en" placeholder="5 terms, comma separated" value={form.keywords_en} onChange={(e) => updateField('keywords_en', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold mb-3">Fișier manuscris</h2>
          <div className="border-2 border-dashed rounded-lg p-8 text-center bg-background">
            <Send className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">Încarcă manuscrisul</p>
            <p className="text-sm text-muted-foreground">Max. 20 MB · Format: DOC, DOCX (+ opțional PDF pentru layout)</p>
            <input type="file" className="mt-3" accept=".pdf,.doc,.docx" multiple />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full font-semibold">
          <Send className="mr-2 h-4 w-4" /> Trimite manuscrisul
        </Button>
      </form>

      {/* Submissions list - card layout */}
      <section className="space-y-3">
        <h2 className="font-serif text-lg font-bold">Articolele mele trimise</h2>

        {authorSubmissions.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            Nu există articole trimise pentru contul curent.
          </div>
        ) : (
          authorSubmissions.map((submission) => {
            const status = statusConfig[submission.status] || statusConfig.submitted;
            const expanded = expandedIds.has(submission.id);

            return (
              <div key={submission.id} className="rounded-lg border bg-card shadow-sm overflow-hidden">
                {/* Card header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/30 transition-colors"
                  onClick={() => toggleExpanded(submission.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.6rem] uppercase tracking-[0.05em] font-semibold ${status.cls}`}>
                        {status.label}
                      </span>
                      {submission.decision && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.6rem] uppercase tracking-[0.05em] font-semibold bg-secondary text-secondary-foreground">
                          {submission.decision}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground font-mono">#{submission.id}</span>
                    </div>
                    <h3 className="font-medium text-sm mt-1 truncate">{submission.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{submission.date_submitted}</span>
                      <span>{submission.authors}</span>
                    </div>
                  </div>
                  {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>

                {/* Expanded details */}
                {expanded && (
                  <div className="border-t px-4 py-4 space-y-3 bg-muted/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Status & Decizie</div>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.6rem] uppercase tracking-[0.05em] font-semibold ${status.cls}`}>
                          {status.label}
                        </div>
                        {submission.decision && (
                          <div className="text-sm font-medium mt-1">Decizie: {submission.decision}</div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Detalii</div>
                        <div className="text-sm text-muted-foreground">Afiliere: {submission.affiliation || '—'}</div>
                        <div className="text-sm text-muted-foreground">Email: {submission.email}</div>
                      </div>
                    </div>
                    {submission.abstract && (
                      <div className="space-y-1">
                        <div className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Rezumat</div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{submission.abstract}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
