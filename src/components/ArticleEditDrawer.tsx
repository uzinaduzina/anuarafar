import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  const handleSave = () => {
    updateArticle(article.id, form);
    toast({ title: 'Articol actualizat', description: 'Modificările au fost salvate local.' });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif">Editare articol</SheetTitle>
          <SheetDescription className="text-xs truncate">{article.title}</SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-5">
          <Tabs defaultValue="meta">
            <TabsList className="w-full">
              <TabsTrigger value="meta" className="flex-1">Metadata</TabsTrigger>
              <TabsTrigger value="abstract" className="flex-1">Rezumate</TabsTrigger>
              <TabsTrigger value="keywords" className="flex-1">Cuvinte cheie</TabsTrigger>
            </TabsList>

            <TabsContent value="meta" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Titlu</Label>
                <Input value={form.title || ''} onChange={e => set('title', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Autori (separați prin virgulă)</Label>
                <Input value={form.authors || ''} onChange={e => set('authors', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Afilieri</Label>
                <Textarea value={form.affiliations || ''} onChange={e => set('affiliations', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Email-uri</Label>
                <Input value={form.emails || ''} onChange={e => set('emails', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Pagina start</Label>
                  <Input value={form.pages_start || ''} onChange={e => set('pages_start', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Pagina final</Label>
                  <Input value={form.pages_end || ''} onChange={e => set('pages_end', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>DOI</Label>
                <Input value={form.doi || ''} onChange={e => set('doi', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Secțiune</Label>
                <Input value={form.section || ''} onChange={e => set('section', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Limbă</Label>
                <Input value={form.language || ''} onChange={e => set('language', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Cale PDF</Label>
                <Input value={form.pdf_path || ''} onChange={e => set('pdf_path', e.target.value)} />
              </div>
            </TabsContent>

            <TabsContent value="abstract" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Rezumat (RO)</Label>
                <Textarea value={form.abstract_ro || ''} onChange={e => set('abstract_ro', e.target.value)} rows={8} />
              </div>
              <div className="space-y-2">
                <Label>Abstract (EN)</Label>
                <Textarea value={form.abstract_en || ''} onChange={e => set('abstract_en', e.target.value)} rows={8} />
              </div>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Cuvinte cheie (RO) — separate prin virgulă</Label>
                <Textarea value={form.keywords_ro || ''} onChange={e => set('keywords_ro', e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Keywords (EN) — separate prin virgulă</Label>
                <Textarea value={form.keywords_en || ''} onChange={e => set('keywords_en', e.target.value)} rows={3} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-2 h-4 w-4" /> Anulează
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Salvează
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
