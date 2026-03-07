import { useEffect, useMemo, useState } from 'react';
import { Mail, RotateCcw, Save } from 'lucide-react';
import { useAuth, type EmailTemplateFields, type ManagedEmailTemplate } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const EMPTY_FIELDS: EmailTemplateFields = {
  subject: '',
  heading: '',
  greeting: '',
  intro: '',
  note: '',
  action: '',
  footer: '',
};

export default function DashboardEmailTemplates() {
  const { toast } = useToast();
  const {
    authTransport,
    fetchEmailTemplates,
    updateEmailTemplate,
    resetEmailTemplate,
  } = useAuth();

  const [templates, setTemplates] = useState<ManagedEmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [form, setForm] = useState<EmailTemplateFields>(EMPTY_FIELDS);

  const selectedTemplate = useMemo(
    () => templates.find((entry) => entry.id === selectedTemplateId) || null,
    [templates, selectedTemplateId],
  );

  const loadTemplates = async () => {
    setIsLoading(true);
    const result = await fetchEmailTemplates();
    setIsLoading(false);

    if (!result.ok) {
      toast({
        title: 'Nu am putut incarca template-urile',
        description: result.error,
        variant: 'destructive',
      });
      return;
    }

    const nextTemplates = result.templates || [];
    setTemplates(nextTemplates);
    if (nextTemplates.length === 0) {
      setSelectedTemplateId('');
      setForm(EMPTY_FIELDS);
      return;
    }

    setSelectedTemplateId((previous) => {
      const hasPrevious = nextTemplates.some((entry) => entry.id === previous);
      return hasPrevious ? previous : nextTemplates[0].id;
    });
  };

  useEffect(() => {
    if (authTransport !== 'remote') return;
    void loadTemplates();
  }, [authTransport]);

  useEffect(() => {
    if (!selectedTemplate) {
      setForm(EMPTY_FIELDS);
      return;
    }
    setForm(selectedTemplate.effective);
  }, [selectedTemplate]);

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setIsSaving(true);
    const result = await updateEmailTemplate(selectedTemplate.id, form);
    setIsSaving(false);

    if (!result.ok) {
      toast({
        title: 'Nu am putut salva template-ul',
        description: result.error,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Template salvat',
      description: result.message || 'Modificarile au fost salvate.',
    });
    await loadTemplates();
  };

  const handleReset = async () => {
    if (!selectedTemplate) return;
    setIsResetting(true);
    const result = await resetEmailTemplate(selectedTemplate.id);
    setIsResetting(false);

    if (!result.ok) {
      toast({
        title: 'Nu am putut reseta template-ul',
        description: result.error,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Template resetat',
      description: result.message || 'Template-ul a revenit la varianta implicita.',
    });
    await loadTemplates();
  };

  if (authTransport !== 'remote') {
    return (
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Template-urile email pot fi editate doar in modul remote (cu worker-ul email-auth activ).
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Template-uri email</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Editezi mesajele trimise de platforma pentru login, submisii si workflow editorial.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-lg font-bold">Lista template-uri</h2>
          </div>
          <div className="p-2">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Se incarca template-urile...</div>
            ) : templates.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Nu exista template-uri disponibile.</div>
            ) : (
              <div className="space-y-1">
                {templates.map((template) => {
                  const isActive = template.id === selectedTemplateId;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
                        isActive
                          ? 'border-primary bg-primary/10'
                          : 'border-transparent hover:bg-accent'
                      }`}
                    >
                      <div className="text-sm font-semibold">{template.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{template.description}</div>
                      <div className="text-[0.68rem] mt-1 text-muted-foreground uppercase tracking-[0.08em]">
                        {Object.keys(template.custom || {}).length > 0 ? 'Custom' : 'Implicit'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold">{selectedTemplate?.label || 'Template email'}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{selectedTemplate?.description || 'Selecteaza un template din lista.'}</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => { void handleReset(); }}
                disabled={!selectedTemplate || isResetting}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                type="button"
                onClick={() => { void handleSave(); }}
                disabled={!selectedTemplate || isSaving}
                className="w-full sm:w-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                Salveaza
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="rounded-md border bg-secondary/40 p-3 text-xs text-muted-foreground">
              Placeholders disponibile:{' '}
              {selectedTemplate?.placeholders?.length
                ? selectedTemplate.placeholders.map((item) => `{{${item}}}`).join(', ')
                : 'fara placeholders'}
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-subject">Subiect</Label>
              <Input
                id="template-subject"
                value={form.subject}
                onChange={(event) => setForm((previous) => ({ ...previous, subject: event.target.value }))}
                disabled={!selectedTemplate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-heading">Titlu email</Label>
              <Input
                id="template-heading"
                value={form.heading}
                onChange={(event) => setForm((previous) => ({ ...previous, heading: event.target.value }))}
                disabled={!selectedTemplate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-greeting">Salutare (optional)</Label>
              <Input
                id="template-greeting"
                value={form.greeting}
                onChange={(event) => setForm((previous) => ({ ...previous, greeting: event.target.value }))}
                disabled={!selectedTemplate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-intro">Introducere</Label>
              <Textarea
                id="template-intro"
                rows={3}
                value={form.intro}
                onChange={(event) => setForm((previous) => ({ ...previous, intro: event.target.value }))}
                disabled={!selectedTemplate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-note">Nota (optional)</Label>
              <Textarea
                id="template-note"
                rows={2}
                value={form.note}
                onChange={(event) => setForm((previous) => ({ ...previous, note: event.target.value }))}
                disabled={!selectedTemplate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-action">Actiune recomandata (optional)</Label>
              <Textarea
                id="template-action"
                rows={2}
                value={form.action}
                onChange={(event) => setForm((previous) => ({ ...previous, action: event.target.value }))}
                disabled={!selectedTemplate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-footer">Footer (optional)</Label>
              <Textarea
                id="template-footer"
                rows={2}
                value={form.footer}
                onChange={(event) => setForm((previous) => ({ ...previous, footer: event.target.value }))}
                disabled={!selectedTemplate}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
