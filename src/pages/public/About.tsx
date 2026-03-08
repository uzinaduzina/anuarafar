import { JOURNAL } from '@/data/journal';
import { BookOpen, Mail, MapPin, Phone, ExternalLink, History, Scale } from 'lucide-react';

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
            <strong>Anuarul Arhivei de Folclor / The Folklore Archive Yearbook</strong> (ISSN {JOURNAL.issn}) este o publicație științifică 
            a Institutului „Arhiva de Folclor a Academiei Române", Filiala Cluj-Napoca a Academiei Române.
          </p>
          <p className="text-sm leading-relaxed text-foreground/90 mb-4">
            Revista publică studii, articole și materiale de cercetare din domeniul 
            folcloristicii, etnologiei, antropologiei culturale și disciplinelor conexe.
            Toate articolele publicate sunt supuse procesului de evaluare colegială (peer review) 
            și sunt disponibile în acces deschis.
          </p>
        </div>

        {/* Series history */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> Istoricul seriilor
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-series-1/30 bg-series-1-bg/20">
              <span className="w-2 h-full min-h-[2.5rem] rounded-full bg-series-1 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm">Seria întâi: nr. I–VII, 1932–1945</div>
                <div className="text-xs text-muted-foreground">Fondator: Ion Mușlea</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border border-series-2/30 bg-series-2-bg/20">
              <span className="w-2 h-full min-h-[2.5rem] rounded-full bg-series-2 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm">Seria a doua: nr. I–XVII (VIII–XXIV), 1980–1996</div>
                <div className="text-xs text-muted-foreground">Redactori: Ion Taloș, Ion Cuceu</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border border-series-3/30 bg-series-3-bg/20">
              <span className="w-2 h-full min-h-[2.5rem] rounded-full bg-series-3 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm">Seria a treia: nr. XXV–XXIX, 2022–2025</div>
                <div className="text-xs text-muted-foreground">Redactor-șef: Mihai Bărbulescu</div>
              </div>
            </div>
          </div>
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
              eligibile din seria curentă fiind disponibile gratuit, fără embargo. Arhiva istorică rămâne
              publică, dar nu are încă metadate DOAJ complete la nivel de articol.
            </p>
            <p>
              <strong>Etică:</strong> Revista aderă la standardele COPE (Committee on Publication Ethics) 
              și respectă normele internaționale de etică a publicării.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" /> Drepturi de autor
          </h2>
          <p className="text-sm leading-relaxed text-foreground/90">
            Conținutul științific curent publicat în seria a III-a este pus la dispoziție în regim open access sub
            {' '}<strong>Creative Commons CC BY 4.0</strong>. Autorii își păstrează drepturile de autor, iar
            reutilizarea este permisă cu citarea sursei. Seriile istorice sunt publicate ca arhivă digitală și sunt
            tratate separat până la clarificarea completă a regimului de reutilizare pentru fiecare fascicul scanat.
          </p>
        </div>

        {/* Contact */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold mb-3">Contact</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Institutul „Arhiva de Folclor a Academiei Române", Filiala Cluj-Napoca a Academiei Române, str. Republicii nr. 59, 400015 Cluj-Napoca</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-primary flex-shrink-0" />
              <span>+40-264-591864 (tel. și fax)</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-primary flex-shrink-0" />
              <a href="mailto:anuar@iafar.ro" className="text-primary hover:underline">anuar@iafar.ro</a>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              <a href="https://www.iafar.ro" target="_blank" rel="noreferrer" className="text-primary hover:underline">www.iafar.ro</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
