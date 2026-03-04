import { useState } from 'react';
import { Send, CheckCircle, FileText, Type, AlignLeft, Image, BookOpen, Quote, ListOrdered, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function GuidelineSection({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-4 border-b last:border-b-0">
      <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
        <div className="text-sm text-foreground/80 leading-relaxed space-y-2">{children}</div>
      </div>
    </div>
  );
}

function Guidelines() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="font-serif text-xl font-bold mb-1">Indicații de redactare</h2>
        <p className="text-xs text-muted-foreground mb-2">Anuarul Arhivei de Folclor a Academiei Române</p>
        <Button variant="outline" size="sm" className="gap-2 mt-2" disabled>
          <Download className="h-4 w-4" /> Descarcă indicațiile (Word)
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="font-serif text-lg font-bold mb-2">Format & structură</h2>
        <div className="divide-y">
          <GuidelineSection icon={FileText} title="Format document">
            <p>Microsoft Word (format <strong>.doc</strong>, <strong>.docx</strong> sau alte formate compatibile). Nu se trimit doar în format PDF. Se poate folosi PDF pentru a indica așezarea în pagină dorită, dar nu va fi trimis doar în acest format.</p>
          </GuidelineSection>

          <GuidelineSection icon={AlignLeft} title="Formatarea paginii">
            <p>Format A4, margini sus, jos, stânga, dreapta <strong>2,5 cm</strong>, stilul <strong>„No spacing"</strong>, aliniere text <strong>„Justify"</strong>.</p>
          </GuidelineSection>

          <GuidelineSection icon={Type} title="Fonturi">
            <p><strong>Times New Roman 12</strong>; folosirea semnelor diacritice ale limbii române este obligatorie; de asemenea, se impune folosirea semnelor diacritice și accentelor specifice limbilor străine utilizate.</p>
          </GuidelineSection>

          <GuidelineSection icon={AlignLeft} title="Distanța între rânduri">
            <p><strong>1,5</strong></p>
          </GuidelineSection>

          <GuidelineSection icon={FileText} title="Număr de pagini recomandat">
            <p><strong>10–12</strong> (inclusiv anexele)</p>
          </GuidelineSection>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="font-serif text-lg font-bold mb-2">Structura articolului</h2>
        <div className="divide-y">
          <GuidelineSection icon={Type} title="Titlul articolului (RO)">
            <p>În limba română, centrat, corp <strong>14</strong>, <strong>bold</strong>.</p>
          </GuidelineSection>

          <GuidelineSection icon={Type} title="Numele autorului">
            <p>Va fi precedat de funcția academică sau universitară deținută, forma <strong>Nume, Prenume</strong>: aliniere dreapta, corp 12, fără bold, la două rânduri după titlu; un rând mai jos, afilierea instituțională.</p>
            <div className="bg-muted/50 rounded p-3 mt-2 text-xs font-mono">
              <p>Prof. univ. dr. Prenume Nume</p>
              <p>Facultatea…, Universitatea… / Institutul/Muzeul</p>
            </div>
          </GuidelineSection>

          <GuidelineSection icon={Type} title="Titlul articolului (limbă de circulație internațională)">
            <p>Într-o limbă de circulație internațională (engleză, franceză, germană, italiană).</p>
          </GuidelineSection>

          <GuidelineSection icon={AlignLeft} title="Rezumatul articolului">
            <p>Fiecare articol va fi precedat de un rezumat în aceeași limbă străină de circulație internațională a titlului tradus, font <strong>Times New Roman corp 10</strong>, maximum <strong>200 cuvinte</strong>.</p>
          </GuidelineSection>

          <GuidelineSection icon={ListOrdered} title="Cuvinte-cheie">
            <p>Imediat după rezumat; o serie de <strong>cinci termeni</strong> reprezentativi (alcătuiți din unul sau mai multe cuvinte fiecare) care să reflecte conținutul articolului — în limba română și în limba de circulație internațională a titlului și rezumatului.</p>
          </GuidelineSection>

          <GuidelineSection icon={Type} title="Subtitlurile">
            <p>Centrat, <strong>bold</strong>, corp <strong>12</strong>.</p>
          </GuidelineSection>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="font-serif text-lg font-bold mb-2">Note, citate & bibliografie</h2>
        <div className="divide-y">
          <GuidelineSection icon={BookOpen} title="Note de subsol">
            <p>Times New Roman, corp <strong>10</strong>, spațiat la <strong>1 rând</strong>. Aliniere stânga–dreapta (Justify). Fiecare notă de subsol se termină printr-un punct.</p>
          </GuidelineSection>

          <GuidelineSection icon={Image} title="Fotografii și elemente grafice">
            <p>Vor fi trimise <strong>separat</strong>, la o bună rezoluție, cu precizarea locului în care urmează să fie inserate în text sau prin indicarea într-un fișier PDF atașat a aranjării preferate pe pagină.</p>
          </GuidelineSection>

          <GuidelineSection icon={Quote} title="Citate">
            <ul className="list-disc pl-4 space-y-1">
              <li>Citate în limba română: ghilimele rotunde <strong>„ "</strong></li>
              <li>Citate în limba engleză: <strong>" "</strong></li>
              <li>Citate în limba franceză: <strong>« »</strong></li>
              <li>Citate în cadrul citatelor: ghilimele franțuzești <strong>« »</strong></li>
              <li>Omisiuni în cadrul unui citat: <strong>[…]</strong></li>
            </ul>
          </GuidelineSection>

          <GuidelineSection icon={BookOpen} title="Referințe bibliografice">
            <p>Vor fi cuprinse în notele de subsol.</p>
          </GuidelineSection>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="font-serif text-lg font-bold mb-2">Sistem de citare</h2>
        <div className="space-y-3 text-sm text-foreground/80 leading-relaxed">
          <p><strong>Format general:</strong> Prenume Nume, <em>Titlu</em>, Localitate, Editură, an, p. 1–100.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Dacă lipsește un indicator: <strong>[f.a.]</strong> respectiv <strong>[f.edit.]</strong></li>
            <li>Lucrare tradusă: Prenume Nume, <em>Titlu</em>, traducere din limba x de…, Localitate, Editură, an, p. 1–100.</li>
            <li>Lucrare în limbă străină: titlul va fi tradus în limba română între paranteze drepte<br />
              <span className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded">Prenume Nume, La Tradition Populaire [Tradiția populară], Localitate, Editură, an, p. 1–100.</span>
            </li>
            <li>Articol într-o revistă: titlul articolului cu <em>italice</em>, numele revistei între ghilimele „ "<br />
              <span className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded">Prenume Nume, <em>Titlu</em> în „Titlu revistă", tomul, an, p.</span>
            </li>
            <li>Volum colectiv: se menționează coordonatorul/coordonatorii<br />
              <span className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded">***, <em>Titlu</em>, ediție îngrijită, studiu introductiv și notă asupra ediției de Prenume Nume, Oraș, Editura, an, p.</span>
            </li>
            <li>Versiune electronică: se adaugă link-ul complet și data accesării<br />
              <span className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded">Prenume Nume, <em>Titlu</em>, în „Titlu", disponibil pe internet: http://www.… (accesat în: ziua, luna, anul)</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="font-serif text-lg font-bold mb-2">Prescurtări în notele de subsol</h2>
        <div className="space-y-3 text-sm text-foreground/80 leading-relaxed">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong><em>op. cit.</em></strong> / <strong><em>art. cit.</em></strong> — se folosește când o operă a unui autor este citată de mai multe ori, dar nu succesiv. Prima citare se face în întregime.</li>
            <li><strong><em>Ibidem</em></strong> — citare succesivă a aceluiași autor și a aceleiași lucrări. Dacă și pagina e aceeași, nota conține doar <em>Ibidem</em>. Dacă pagina diferă: <em>Ibidem</em>, p.</li>
            <li><strong><em>Eadem</em></strong> — la fel ca <em>Ibidem</em>, dar pentru autoare.</li>
            <li><strong><em>Idem</em></strong> — evită repetarea numelui autorului la citare succesivă, opere diferite.</li>
            <li><strong><em>apud</em></strong> — trimitere la o sursă citată indirect, preluată din altă lucrare.</li>
            <li><strong><em>cf.</em></strong> — comparație între puncte de vedere diferite sau asemănătoare.</li>
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 shadow-sm">
        <h2 className="font-serif text-lg font-bold mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Notă importantă
        </h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          În afara prescurtărilor acceptate în limbajul științific, precum cele menționate mai sus, <strong>nu se folosesc alte prescurtări</strong> în textul lucrării.
        </p>
      </div>
    </div>
  );
}

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
    <div className="container py-10 md:py-14 max-w-3xl">
      <h1 className="font-serif text-3xl font-bold mb-2">Trimite manuscris</h1>
      <p className="text-muted-foreground mb-8">
        Completați formularul de mai jos sau consultați indicațiile de redactare.
      </p>

      <Tabs defaultValue="guidelines" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="guidelines">Indicații de redactare</TabsTrigger>
          <TabsTrigger value="submit">Trimite manuscris</TabsTrigger>
        </TabsList>

        <TabsContent value="guidelines">
          <Guidelines />
        </TabsContent>

        <TabsContent value="submit">
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
                <Textarea id="abstract" required placeholder="Rezumatul manuscrisului (max. 200 cuvinte)" rows={5} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="keywords_ro">Cuvinte cheie (RO)</Label>
                  <Input id="keywords_ro" placeholder="5 termeni, separați prin virgulă" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords_en">Keywords (EN)</Label>
                  <Input id="keywords_en" placeholder="5 terms, comma separated" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold mb-3">Fișier manuscris</h2>
              <div className="border-2 border-dashed rounded-lg p-8 text-center bg-background">
                <Send className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium mb-1">Încarcă manuscrisul</p>
                <p className="text-sm text-muted-foreground">Max. 20 MB · Format: DOC, DOCX (+ opțional PDF pentru layout)</p>
                <input type="file" className="mt-3" accept=".pdf,.doc,.docx" />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full font-semibold">
              <Send className="mr-2 h-4 w-4" /> Trimite manuscrisul
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
