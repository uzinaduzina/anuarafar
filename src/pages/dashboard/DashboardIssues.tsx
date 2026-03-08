import { useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { ChevronDown, Download, Loader2, Plus, RotateCcw, Trash2, Upload } from 'lucide-react';
import { useJournalData } from '@/data/JournalDataProvider';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { SeriesId } from '@/data/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    articles,
    loading,
    updateIssue,
    addIssue,
    deleteIssue,
    importIssuesCsv,
    exportIssuesCsv,
    exportArticlesCsvBySeries,
    exportDoajCsvBySeries,
    exportDoajCsvByIssue,
    exportDoajXmlBySeries,
    exportDoajXmlByIssue,
    validateDoajBySeries,
    validateDoajByIssue,
    resetIssuesToFile,
    hasIssueCsvOverride,
  } = useJournalData();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [resetting, setResetting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [doajSeries, setDoajSeries] = useState<SeriesId>('seria-3');
  const [doajIssueId, setDoajIssueId] = useState('');
  const csvInputRef = useRef<HTMLInputElement>(null);

  const sortedIssues = useMemo(
    () => [...issues].sort((a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0)),
    [issues],
  );
  const linkedArticlesByIssueId = useMemo(() => {
    return articles.reduce<Record<string, number>>((acc, article) => {
      acc[article.issue_id] = (acc[article.issue_id] || 0) + 1;
      return acc;
    }, {});
  }, [articles]);

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

  const onDeleteIssue = (issueId: string, issueLabel: string) => {
    const confirmed = window.confirm(
      `Sigur vrei sa stergi numarul "${issueLabel}" (ID ${issueId})?\n\nAceasta actiune nu poate fi anulata.`,
    );
    if (!confirmed) return;

    const result = deleteIssue(issueId);
    if (!result.ok) {
      toast({
        title: 'Stergerea a esuat',
        description: result.error || 'Nu am putut sterge numarul.',
        variant: 'destructive',
      });
      return;
    }

    setDoajIssueId((prev) => (prev === issueId ? '' : prev));
    toast({
      title: 'Numar sters',
      description: `Numarul "${issueLabel}" a fost eliminat din CSV.`,
    });
  };

  const onExportCsv = () => {
    const csv = exportIssuesCsv();
    downloadText('issues.csv', csv, 'text/csv;charset=utf-8');
  };

  const onExportArticlesSeriesCsv = (series: 'seria-1' | 'seria-2' | 'seria-3') => {
    const csv = exportArticlesCsvBySeries(series);
    const fileName = `articles-${series}.csv`;
    downloadText(fileName, csv, 'text/csv;charset=utf-8');
  };

  const onExportDoajSeriesCsv = () => {
    const validation = validateDoajBySeries(doajSeries);
    if (validation.articleCount === 0) {
      toast({
        title: 'Nu exista articole pentru selectie',
        description: `Seria ${doajSeries} nu are articole de exportat.`,
        variant: 'destructive',
      });
      return;
    }
    if (!validation.ok) {
      toast({
        title: 'Export blocat: erori DOAJ',
        description: `${validation.errors[0]} (${validation.errors.length} erori)`,
        variant: 'destructive',
      });
      return;
    }

    const csv = exportDoajCsvBySeries(doajSeries);
    downloadText(`doaj-${doajSeries}.csv`, csv, 'text/csv;charset=utf-8');
    if (validation.warnings.length > 0) {
      toast({
        title: 'Export DOAJ finalizat cu avertismente',
        description: `${validation.warnings.length} avertismente (ex: ${validation.warnings[0]}).`,
      });
      return;
    }
    toast({
      title: 'Export DOAJ serie finalizat',
      description: `${validation.articleCount} articole incluse.`,
    });
  };

  const onExportDoajIssueCsv = () => {
    const selectedIssueId = doajIssueId || sortedIssues[0]?.id || '';
    if (!selectedIssueId) {
      toast({
        title: 'Nu exista numere',
        description: 'Adauga sau importa numere inainte de export.',
        variant: 'destructive',
      });
      return;
    }

    const validation = validateDoajByIssue(selectedIssueId);
    if (validation.articleCount === 0) {
      toast({
        title: 'Nu exista articole pentru selectie',
        description: 'Numarul selectat nu are articole de exportat.',
        variant: 'destructive',
      });
      return;
    }
    if (!validation.ok) {
      toast({
        title: 'Export blocat: erori DOAJ',
        description: `${validation.errors[0]} (${validation.errors.length} erori)`,
        variant: 'destructive',
      });
      return;
    }

    const issue = issues.find((entry) => entry.id === selectedIssueId);
    const safeSlug = issue?.slug || selectedIssueId;
    const csv = exportDoajCsvByIssue(selectedIssueId);
    downloadText(`doaj-issue-${safeSlug}.csv`, csv, 'text/csv;charset=utf-8');
    if (validation.warnings.length > 0) {
      toast({
        title: 'Export DOAJ finalizat cu avertismente',
        description: `${validation.warnings.length} avertismente (ex: ${validation.warnings[0]}).`,
      });
      return;
    }
    toast({
      title: 'Export DOAJ numar finalizat',
      description: `${validation.articleCount} articole incluse.`,
    });
  };

  const onExportDoajSeriesXml = () => {
    const validation = validateDoajBySeries(doajSeries);
    if (validation.articleCount === 0) {
      toast({
        title: 'Nu exista articole pentru selectie',
        description: `Seria ${doajSeries} nu are articole de exportat.`,
        variant: 'destructive',
      });
      return;
    }
    if (!validation.ok) {
      toast({
        title: 'Export blocat: erori DOAJ',
        description: `${validation.errors[0]} (${validation.errors.length} erori)`,
        variant: 'destructive',
      });
      return;
    }

    const xml = exportDoajXmlBySeries(doajSeries);
    downloadText(`doaj-${doajSeries}.xml`, xml, 'application/xml;charset=utf-8');
    if (validation.warnings.length > 0) {
      toast({
        title: 'XML DOAJ finalizat cu avertismente',
        description: `${validation.warnings.length} avertismente (ex: ${validation.warnings[0]}).`,
      });
      return;
    }
    toast({
      title: 'DOAJ XML serie generat',
      description: `${validation.articleCount} articole incluse.`,
    });
  };

  const onExportDoajIssueXml = () => {
    const selectedIssueId = doajIssueId || sortedIssues[0]?.id || '';
    if (!selectedIssueId) {
      toast({
        title: 'Nu exista numere',
        description: 'Adauga sau importa numere inainte de export.',
        variant: 'destructive',
      });
      return;
    }

    const validation = validateDoajByIssue(selectedIssueId);
    if (validation.articleCount === 0) {
      toast({
        title: 'Nu exista articole pentru selectie',
        description: 'Numarul selectat nu are articole de exportat.',
        variant: 'destructive',
      });
      return;
    }
    if (!validation.ok) {
      toast({
        title: 'Export blocat: erori DOAJ',
        description: `${validation.errors[0]} (${validation.errors.length} erori)`,
        variant: 'destructive',
      });
      return;
    }

    const issue = issues.find((entry) => entry.id === selectedIssueId);
    const safeSlug = issue?.slug || selectedIssueId;
    const xml = exportDoajXmlByIssue(selectedIssueId);
    downloadText(`doaj-issue-${safeSlug}.xml`, xml, 'application/xml;charset=utf-8');
    if (validation.warnings.length > 0) {
      toast({
        title: 'XML DOAJ finalizat cu avertismente',
        description: `${validation.warnings.length} avertismente (ex: ${validation.warnings[0]}).`,
      });
      return;
    }
    toast({
      title: 'DOAJ XML numar generat',
      description: `${validation.articleCount} articole incluse.`,
    });
  };

  const onTriggerImport = () => {
    csvInputRef.current?.click();
  };

  const onImportCsvFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const csvText = await file.text();
      const importedCount = importIssuesCsv(csvText);
      toast({
        title: 'CSV importat',
        description: `${importedCount} numere au fost incarcate din ${file.name}.`,
      });
    } catch (error) {
      toast({
        title: 'Import esuat',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
      event.target.value = '';
    }
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
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Numere</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {issues.length} numere in total · sursa activa: <span className="font-medium">issues.csv</span>
            {hasIssueCsvOverride ? ' (editari locale active)' : ''}
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:flex-wrap">
          {/* Export CSV principal */}
          <Button variant="outline" size="sm" className="w-full lg:w-auto" onClick={onExportCsv}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>

          {/* Export Articole per serie */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full lg:w-auto">
                <Download className="mr-2 h-4 w-4" /> Articole per serie <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Export articole CSV</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExportArticlesSeriesCsv('seria-1')}>Seria I (1932–1945)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportArticlesSeriesCsv('seria-2')}>Seria II (1980–1998)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportArticlesSeriesCsv('seria-3')}>Seria III (2022–)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* DOAJ Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full lg:w-auto">
                <Download className="mr-2 h-4 w-4" /> DOAJ Export <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
              <DropdownMenuLabel>Export DOAJ per serie</DropdownMenuLabel>
              <div className="px-2 py-1.5">
                <select
                  className="h-8 w-full rounded-md border bg-background px-2 text-sm"
                  value={doajSeries}
                  onChange={(event) => setDoajSeries(event.target.value as SeriesId)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="seria-1">Seria I</option>
                  <option value="seria-2">Seria II</option>
                  <option value="seria-3">Seria III</option>
                </select>
              </div>
              <DropdownMenuItem onClick={onExportDoajSeriesCsv}>CSV serie</DropdownMenuItem>
              <DropdownMenuItem onClick={onExportDoajSeriesXml}>XML serie</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Export DOAJ per număr</DropdownMenuLabel>
              <div className="px-2 py-1.5">
                <select
                  className="h-8 w-full rounded-md border bg-background px-2 text-sm"
                  value={doajIssueId}
                  onChange={(event) => setDoajIssueId(event.target.value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">Selectează număr…</option>
                  {sortedIssues.map((issue) => (
                    <option key={issue.id} value={issue.id}>
                      {issue.year} · {issue.volume}
                    </option>
                  ))}
                </select>
              </div>
              <DropdownMenuItem onClick={onExportDoajIssueCsv}>CSV număr</DropdownMenuItem>
              <DropdownMenuItem onClick={onExportDoajIssueXml}>XML număr</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAdmin && (
            <>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={onImportCsvFile}
              />
              <Button variant="outline" size="sm" className="w-full lg:w-auto" onClick={onTriggerImport} disabled={importing}>
                <Upload className="mr-2 h-4 w-4" /> {importing ? 'Import...' : 'Import CSV'}
              </Button>
              <Button variant="outline" size="sm" className="w-full lg:w-auto" onClick={onResetToFile} disabled={resetting}>
                <RotateCcw className="mr-2 h-4 w-4" /> Reset
              </Button>
              <Button size="sm" className="w-full lg:w-auto" onClick={onAddIssue}><Plus className="mr-2 h-4 w-4" /> Număr nou</Button>
            </>
          )}
        </div>
      </div>

      {!isAdmin && (
        <div className="mb-4 rounded-md border bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
          Contul editor are acces de consultare. Editarea directa a campurilor CSV este disponibila pentru admin.
        </div>
      )}

      <div className="mb-4 rounded-md border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
        Exportul DOAJ XML exclude emailurile autorilor si foloseste structura DOAJ Native XML
        (record per articol), conform cerintelor de metadata DOAJ.
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="divide-y xl:hidden">
          {sortedIssues.map((issue) => (
            <div key={issue.id} className="space-y-4 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <IssueStatusBadge status={issue.status} />
                    <span className="text-xs font-mono text-muted-foreground">#{issue.id}</span>
                  </div>
                  <h3 className="mt-1 break-words text-sm font-medium">{issue.title || 'Număr fără titlu'}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{issue.year || '—'}</span>
                    <span>Vol. {issue.volume || '—'}</span>
                    <span>Nr. {issue.number || '—'}</span>
                  </div>
                </div>

                {isAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-full border-destructive/40 text-xs text-destructive hover:bg-destructive/10 sm:w-auto"
                    onClick={() => onDeleteIssue(issue.id, `${issue.year} · ${issue.volume}`)}
                    disabled={(linkedArticlesByIssueId[issue.id] || 0) > 0}
                    title={
                      (linkedArticlesByIssueId[issue.id] || 0) > 0
                        ? 'Nu poti sterge un numar care are articole asociate.'
                        : 'Sterge numarul'
                    }
                  >
                    <Trash2 className="mr-1 h-3 w-3" /> Sterge
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <MobileField label="Slug">
                  <MobileTextInput isAdmin={isAdmin} value={issue.slug} onChange={(value) => updateField(issue.id, 'slug', value)} />
                </MobileField>
                <MobileField label="Titlu">
                  <MobileTextInput isAdmin={isAdmin} value={issue.title} onChange={(value) => updateField(issue.id, 'title', value)} />
                </MobileField>
                <MobileField label="An">
                  <MobileTextInput isAdmin={isAdmin} value={issue.year} onChange={(value) => updateField(issue.id, 'year', value)} inputClassName="w-full" />
                </MobileField>
                <MobileField label="Volum">
                  <MobileTextInput isAdmin={isAdmin} value={issue.volume} onChange={(value) => updateField(issue.id, 'volume', value)} inputClassName="w-full" />
                </MobileField>
                <MobileField label="Număr">
                  <MobileTextInput isAdmin={isAdmin} value={issue.number} onChange={(value) => updateField(issue.id, 'number', value)} inputClassName="w-full" />
                </MobileField>
                <MobileField label="Data publicării">
                  {isAdmin ? (
                    <input
                      type="date"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={issue.date_published}
                      onChange={(event) => updateField(issue.id, 'date_published', event.target.value)}
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">{issue.date_published}</span>
                  )}
                </MobileField>
                <MobileField label="Status">
                  {isAdmin ? (
                    <select
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={issue.status}
                      onChange={(event) => updateField(issue.id, 'status', event.target.value)}
                    >
                      <option value="published">Publicat</option>
                      <option value="draft">Draft</option>
                    </select>
                  ) : (
                    <span className="text-sm text-muted-foreground">{issue.status}</span>
                  )}
                </MobileField>
                <MobileField label="Articole">
                  {isAdmin ? (
                    <input
                      type="number"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={issue.article_count}
                      onChange={(event) => updateField(issue.id, 'article_count', event.target.value)}
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">{issue.article_count}</span>
                  )}
                </MobileField>
                <MobileField label="Pagini">
                  <MobileTextInput isAdmin={isAdmin} value={String(issue.pages || '')} onChange={(value) => updateField(issue.id, 'pages', value)} inputClassName="w-full" />
                </MobileField>
                <MobileField label="DOI prefix">
                  <MobileTextInput isAdmin={isAdmin} value={issue.doi_prefix} onChange={(value) => updateField(issue.id, 'doi_prefix', value)} />
                </MobileField>
                <MobileField label="Seria">
                  {isAdmin ? (
                    <select
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={issue.series}
                      onChange={(event) => updateField(issue.id, 'series', event.target.value)}
                    >
                      <option value="seria-1">seria-1</option>
                      <option value="seria-2">seria-2</option>
                      <option value="seria-3">seria-3</option>
                    </select>
                  ) : (
                    <span className="text-sm text-muted-foreground">{issue.series}</span>
                  )}
                </MobileField>
                <MobileField label="Eticheta serie">
                  <MobileTextInput isAdmin={isAdmin} value={issue.series_label} onChange={(value) => updateField(issue.id, 'series_label', value)} />
                </MobileField>
                <MobileField label="Issue PDF path">
                  <MobileTextInput isAdmin={isAdmin} value={issue.issue_pdf_path} onChange={(value) => updateField(issue.id, 'issue_pdf_path', value)} />
                  <p className="mt-1 text-[11px] text-muted-foreground">Pentru mai multe PDF-uri integrale separă căile cu `|`.</p>
                </MobileField>
                <MobileField label="Cover path">
                  <MobileTextInput isAdmin={isAdmin} value={issue.cover_hint_path} onChange={(value) => updateField(issue.id, 'cover_hint_path', value)} />
                </MobileField>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto xl:block">
          <table className="w-full min-w-[1500px]">
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
                  'Actiuni',
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
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                        onClick={() => onDeleteIssue(issue.id, `${issue.year} · ${issue.volume}`)}
                        disabled={(linkedArticlesByIssueId[issue.id] || 0) > 0}
                        title={
                          (linkedArticlesByIssueId[issue.id] || 0) > 0
                            ? 'Nu poti sterge un numar care are articole asociate.'
                            : 'Sterge numarul'
                        }
                      >
                        <Trash2 className="mr-1 h-3 w-3" /> Sterge
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function IssueStatusBadge({ status }: { status: string }) {
  const active = status === 'published';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.05em] ${
        active ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
      }`}
    >
      {active ? 'Publicat' : 'Draft'}
    </span>
  );
}

function MobileField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function MobileTextInput({
  isAdmin,
  value,
  onChange,
  inputClassName,
}: {
  isAdmin: boolean;
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
}) {
  return isAdmin ? (
    <input
      className={`h-10 rounded-md border bg-background px-3 text-sm ${inputClassName || 'w-full'}`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ) : (
    <span className="block break-words text-sm text-muted-foreground">{value || '-'}</span>
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
