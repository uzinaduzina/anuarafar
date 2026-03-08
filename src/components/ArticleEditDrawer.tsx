import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';
import { Article } from '@/data/types';
import { useJournalData } from '@/data/JournalDataProvider';
import { useToast } from '@/hooks/use-toast';

interface ArticleEditDrawerProps {
  article: Article | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ArticleEditDrawer({ article, open, onOpenChange }: ArticleEditDrawerProps) {
  const { updateArticle } = useJournalData();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Article>>({});

  useEffect(() => {
    if (article) {
      setForm({ ...article });
    }
  }, [article]);

  if (!article) return null;

  const set = (field: keyof Article, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const setAbstract = (value: string) => {
    setForm((prev) => ({
      ...prev,
      abstract: value,
      abstract_ro: value,
      abstract_en: '',
    }));
  };

  const setKeywords = (value: string) => {
    setForm((prev) => ({
      ...prev,
      keywords: value,
      keywords_ro: value,
      keywords_en: '',
    }));
  };

  const handleSave = () => {
    const normalizedAbstract = String(form.abstract || form.abstract_ro || form.abstract_en || '').trim();
    const normalizedKeywords = String(form.keywords || form.keywords_ro || form.keywords_en || '').trim();
    updateArticle(article.id, {
      ...form,
      abstract: normalizedAbstract,
      abstract_ro: normalizedAbstract,
      abstract_en: '',
      keywords: normalizedKeywords,
      keywords_ro: normalizedKeywords,
      keywords_en: '',
    });
    toast({ title: 'Articol actualizat', description: 'Modificările au fost salvate local.' });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle className="font-serif text-base">Editare articol</SheetTitle>
          <SheetDescription className="text-xs truncate">{article.title}</SheetDescription>
        </SheetHeader>

        <div className="py-3 space-y-3">
          {/* Title & Authors */}
          <div className="space-y-1">
            <Label className="text-xs">Titlu</Label>
            <Input className="h-8 text-sm" value={form.title || ''} onChange={e => set('title', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Autori</Label>
            <Input className="h-8 text-sm" value={form.authors || ''} onChange={e => set('authors', e.target.value)} />
          </div>

          {/* Abstract & Keywords — higher up */}
          <div className="space-y-1">
            <Label className="text-xs">Rezumat (o singură limbă)</Label>
            <Textarea className="text-sm" value={form.abstract || form.abstract_ro || form.abstract_en || ''} onChange={e => setAbstract(e.target.value)} rows={4} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Cuvinte cheie (separate prin virgulă)</Label>
            <Input className="h-8 text-sm" value={form.keywords || form.keywords_ro || form.keywords_en || ''} onChange={e => setKeywords(e.target.value)} />
          </div>

          {/* Rest of metadata */}
          <div className="space-y-1">
            <Label className="text-xs">Afilieri</Label>
            <Input className="h-8 text-sm" value={form.affiliations || ''} onChange={e => set('affiliations', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Email-uri</Label>
            <Input className="h-8 text-sm" value={form.emails || ''} onChange={e => set('emails', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Pag. start</Label>
              <Input className="h-8 text-sm" value={form.pages_start || ''} onChange={e => set('pages_start', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Pag. final</Label>
              <Input className="h-8 text-sm" value={form.pages_end || ''} onChange={e => set('pages_end', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Limbă</Label>
              <Input className="h-8 text-sm" value={form.language || ''} onChange={e => set('language', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">DOI</Label>
              <Input className="h-8 text-sm" value={form.doi || ''} onChange={e => set('doi', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Secțiune</Label>
              <Input className="h-8 text-sm" value={form.section || ''} onChange={e => set('section', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Cale PDF</Label>
            <Input className="h-8 text-sm" value={form.pdf_path || ''} onChange={e => set('pdf_path', e.target.value)} />
          </div>
        </div>

        <SheetFooter className="gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            <X className="mr-1 h-3 w-3" /> Anulează
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="mr-1 h-3 w-3" /> Salvează
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
