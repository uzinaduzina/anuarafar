import { useMemo, useState } from 'react';
import { Download, Loader2, Plus, RotateCcw } from 'lucide-react';
import { useJournalData } from '@/data/JournalDataProvider';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function DashboardIssues() {
  const {
    issues,
    loading,
    updateIssue,
    addIssue,
    exportIssuesCsv,
    resetIssuesToFile,
    hasIssueCsvOverride,
  } = useJournalData();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [resetting, setResetting] = useState(false);

  const sortedIssues = useMemo(
    () => [...issues].sort((a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0)),
    [issues],
  );

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const onAddIssue = () => {
    const added = addIssue();
    toast({
      title: 'Numar adaugat',
      description: `A fost creat un rand nou (${added.id}) in tabelul CSV.`,
    });
  };

  const onExportCsv = () => {
    const csv = exportIssuesCsv();
    downloadText('issues.csv', csv, 'text/csv;charset=utf-8');
  };

  const onResetToFile = async () => {
    try {
      setResetting(true);
      await resetIssuesToFile();
      toast({
        title: 'Date resetate',
        description: 'Numerele au fost reincarcate din fisierul issues.csv.',
      });
    } catch (error) {
      toast({
        title: 'Reset esuat',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setResetting(false);
    }
  };

  const updateField = (id: string, field: string, value: string) => {
    const patch: Record<string, string | number> = { [field]: value };
    if (field === 'article_count') {
      patch[field] = Number(value) || 0;
    }
    updateIssue(id, patch);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">Numere</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {issues.length} numere in total · sursa activa: <span className="font-medium">issues.csv</span>
            {hasIssueCsvOverride ? ' (editari locale active)' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onExportCsv}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          {isAdmin && (
            <>
              <Button variant="outline" onClick={onResetToFile} disabled={resetting}>
                <RotateCcw className="mr-2 h-4 w-4" /> Reset din fisier
              </Button>
              <Button onClick={onAddIssue}><Plus className="mr-2 h-4 w-4" /> Numar nou</Button>
            </>
          )}
        </div>
      </div>

      {!isAdmin && (
        <div className="mb-4 rounded-md border bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
          Contul editor are acces de consultare. Editarea directa a campurilor CSV este disponibila pentru admin.
        </div>
      )}

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary">
                {[
                  'ID',
                  'Slug',
                  'Titlu',
                  'An',
                  'Vol.',
                  'Nr.',
                  'Data',
                  'Status',
                  'Art.',
                  'Pag.',
                  'DOI prefix',
                  'Seria',
                  'Eticheta serie',
                  'Issue PDF path',
                  'Cover path',
                ].map((header) => (
                  <th key={header} className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-accent/30 transition-colors align-top">
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{issue.id}</td>

                  <EditableCell
                    isAdmin={isAdmin}
                    value={issue.slug}
                    onChange={(value) => updateField(issue.id, 'slug', value)}
                    widthClass="w-[220px]"
                  />
                  <EditableCell
                    isAdmin={isAdmin}
                    value={issue.title}
                    onChange={(value) => updateField(issue.id, 'title', value)}
                    widthClass="w-[260px]"
                  />
                  <EditableCell
                    isAdmin={isAdmin}
                    value={issue.year}
                    onChange={(value) => updateField(issue.id, 'year', value)}
                    widthClass="w-24"
                  />
                  <EditableCell
                    isAdmin={isAdmin}
                    value={issue.volume}
                    onChange={(value) => updateField(issue.id, 'volume', value)}
                    widthClass="w-24"
                  />
                  <EditableCell
                    isAdmin={isAdmin}
                    value={issue.number}
                    onChange={(value) => updateField(issue.id, 'number', value)}
                    widthClass="w-20"
                  />
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <input
                        type="date"
                        className="h-8 rounded-md border bg-background px-2 text-sm"
                        value={issue.date_published}
                        onChange={(event) => updateField(issue.id, 'date_published', event.target.value)}
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">{issue.date_published}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <select
                        className="h-8 rounded-md border bg-background px-2 text-sm"
                        value={issue.status}
                        onChange={(event) => updateField(issue.id, 'status', event.target.value)}
                      >
                        <option value="published">Publicat</option>
                        <option value="draft">Draft</option>
                      </select>
                    ) : (
                      <span className="text-sm text-muted-foreground">{issue.status}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <input
                        type="number"
                        className="h-8 w-20 rounded-md border bg-background px-2 text-sm"
                        value={issue.article_count}
                        onChange={(event) => updateField(issue.id, 'article_count', event.target.value)}
                      />
                    ) : (
                      <span className="text-sm">{issue.article_count}</span>
                    )}
                  </td>
                  <EditableCell
                    isAdmin={isAdmin}
                    value={String(issue.pages || '')}
                    onChange={(value) => updateField(issue.id, 'pages', value)}
                    widthClass="w-24"
                  />
                  <EditableCell
                    isAdmin={isAdmin}
                    value={issue.doi_prefix}
                    onChange={(value) => updateField(issue.id, 'doi_prefix', value)}
                    widthClass="w-[150px]"
                  />
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <select
                        className="h-8 rounded-md border bg-background px-2 text-sm"
                        value={issue.series}
                        onChange={(event) => updateField(issue.id, 'series', event.target.value)}
                      >
                        <option value="seria-1">seria-1</option>
                        <option value="seria-2">seria-2</option>
                        <option value="seria-3">seria-3</option>
                      </select>
                    ) : (
                      <span className="text-sm">{issue.series}</span>
                    )}
                  </td>
                  <EditableCell
                    isAdmin={isAdmin}
                    value={issue.series_label}
                    onChange={(value) => updateField(issue.id, 'series_label', value)}
                    widthClass="w-[180px]"
                  />
                  <EditableCell
                    isAdmin={isAdmin}
                    value={issue.issue_pdf_path}
                    onChange={(value) => updateField(issue.id, 'issue_pdf_path', value)}
                    widthClass="w-[260px]"
                  />
                  <EditableCell
                    isAdmin={isAdmin}
                    value={issue.cover_hint_path}
                    onChange={(value) => updateField(issue.id, 'cover_hint_path', value)}
                    widthClass="w-[200px]"
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EditableCell({
  isAdmin,
  value,
  onChange,
  widthClass,
}: {
  isAdmin: boolean;
  value: string;
  onChange: (value: string) => void;
  widthClass: string;
}) {
  return (
    <td className="px-4 py-3">
      {isAdmin ? (
        <input
          className={`h-8 rounded-md border bg-background px-2 text-sm ${widthClass}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <span className="text-sm text-muted-foreground">{value || '-'}</span>
      )}
    </td>
  );
}
