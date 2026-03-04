import { JOURNAL } from '@/data/journal';
import { BookOpen, Mail, MapPin, Phone, ExternalLink } from 'lucide-react';

export default function About() {
  return (
    <div className="container py-10 md:py-14 max-w-3xl">
      <h1 className="font-serif text-3xl font-bold mb-2">Despre revistă</h1>
      <p className="text-muted-foreground mb-8">Informații despre publicație, politici editoriale și contact</p>

      <div className="space-y-6">
        {/* About */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Prezentare
          </h2>
          <p className="text-sm leading-relaxed text-foreground/90 mb-4">
            <strong>Anuarul Arhivei de Folclor</strong> (ISSN {JOURNAL.issn}) este o publicație științifică 
            a {JOURNAL.publisher}. Revista publică studii, articole și materiale de cercetare din domeniul 
            folcloristicii, etnologiei, antropologiei culturale și disciplinelor conexe.
          </p>
          <p className="text-sm leading-relaxed text-foreground/90 mb-4">
            Publicația are o tradiție lungă, prima serie apărând în 1932, sub conducerea profesorului Ion Mușlea. 
            După o perioadă de întrerupere, revista a fost reînființată în 1980 (Seria a II-a) și continuă 
            publicarea din 2002 sub titlul actual (Seria a III-a).
          </p>
          <p className="text-sm leading-relaxed text-foreground/90">
            Toate articolele publicate sunt supuse procesului de evaluare colegială (peer review) 
            și sunt disponibile în acces deschis.
          </p>
        </div>

        {/* Editorial policy */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold mb-3">Politici editoriale</h2>
          <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
            <p>
              <strong>Peer review:</strong> Toate manuscrisele sunt evaluate de minimum doi recenzenți 
              independenți, specialiști în domeniu. Procesul de evaluare este dublu-anonim (double-blind).
            </p>
            <p>
              <strong>Acces deschis:</strong> Revista practică politica de acces deschis, toate articolele 
              publicate fiind disponibile gratuit, fără embargo.
            </p>
            <p>
              <strong>Etică:</strong> Revista aderă la standardele COPE (Committee on Publication Ethics) 
              și respectă normele internaționale de etică a publicării.
            </p>
            <p>
              <strong>Indexare:</strong> Publicația este indexată în baze de date bibliografice relevante 
              pentru domeniul științelor umaniste.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold mb-3">Contact</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>str. Republicii nr. 59, 400015 Cluj-Napoca, România</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-primary flex-shrink-0" />
              <span>+40-264-591864</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-primary flex-shrink-0" />
              <a href="mailto:anuar@iafar.ro" className="text-primary hover:underline">anuar@iafar.ro</a>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              <a href={JOURNAL.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{JOURNAL.url}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
