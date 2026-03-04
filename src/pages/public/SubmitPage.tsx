import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function SubmitPage() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast({ title: 'Manuscris trimis!', description: 'Veți primi confirmarea pe email.' });
  };

  if (submitted) {
    return (
      <div className="container py-16 max-w-lg text-center">
        <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="font-serif text-2xl font-bold mb-3">Manuscris trimis cu succes!</h1>
        <p className="text-muted-foreground">
          Veți primi o confirmare pe adresa de email indicată. Echipa editorială va revizui manuscrisul în 2-4 săptămâni.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-14 max-w-2xl">
      <h1 className="font-serif text-3xl font-bold mb-2">Trimite manuscris</h1>
      <p className="text-muted-foreground mb-8">
        Completați formularul de mai jos pentru a trimite un manuscris spre evaluare.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold">Informații manuscris</h2>
          
          <div className="space-y-2">
            <Label htmlFor="title">Titlu *</Label>
            <Input id="title" required placeholder="Titlul manuscrisului" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="authors">Autori *</Label>
              <Input id="authors" required placeholder="Nume autori (separați prin virgulă)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email contact *</Label>
              <Input id="email" type="email" required placeholder="email@exemplu.ro" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="affiliation">Afiliere instituțională</Label>
            <Input id="affiliation" placeholder="Universitatea / Institutul" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="abstract">Rezumat *</Label>
            <Textarea id="abstract" required placeholder="Rezumatul manuscrisului (max. 300 cuvinte)" rows={5} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keywords_ro">Cuvinte cheie (RO)</Label>
              <Input id="keywords_ro" placeholder="Separate prin virgulă" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords_en">Keywords (EN)</Label>
              <Input id="keywords_en" placeholder="Comma separated" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold mb-3">Fișier manuscris</h2>
          <div className="border-2 border-dashed rounded-lg p-8 text-center bg-background">
            <Send className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">Încarcă manuscrisul (PDF)</p>
            <p className="text-sm text-muted-foreground">Max. 20 MB · Format: PDF, DOC, DOCX</p>
            <input type="file" className="mt-3" accept=".pdf,.doc,.docx" />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full font-semibold">
          <Send className="mr-2 h-4 w-4" /> Trimite manuscrisul
        </Button>
      </form>
    </div>
  );
}
