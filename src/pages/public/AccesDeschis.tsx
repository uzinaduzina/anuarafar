import { Scale, BadgeInfo } from 'lucide-react';
import { JOURNAL } from '@/data/journal';

const SECTION_CLASS = 'rounded-lg border bg-card p-6 shadow-sm';

export default function AccesDeschis() {
  return (
    <div className="container py-10 md:py-14 max-w-4xl">
      <h1 className="font-serif text-3xl font-bold mb-2 flex items-center gap-3">
        <Scale className="h-7 w-7 text-primary" />
        Acces deschis și copyright
      </h1>
      <p className="text-muted-foreground mb-8">
        Politica de acces deschis, licențiere și drepturi de autor a revistei <em>Anuarul Arhivei de Folclor</em>.
      </p>

      <div className="space-y-6">
        <section className={SECTION_CLASS}>
          <p className="text-sm leading-relaxed text-foreground/90">
            <em>Anuarul Arhivei de Folclor</em> este o revistă în acces deschis integral. Începând cu relansarea
            revistei în 2022 (Seria a III-a), toate articolele științifice publicate în revistă sunt puse la
            dispoziție sub licență Creative Commons Attribution 4.0 International (
            <a href={JOURNAL.oa_license_url} className="text-primary hover:underline" target="_blank" rel="noreferrer">
              <strong>CC BY 4.0</strong>
            </a>
            ). Autorii își păstrează drepturile de autor asupra articolelor.
          </p>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3">Model de acces</h2>
          <p className="text-sm leading-relaxed text-foreground/90">
            Acces deschis imediat. Nu există embargo, nu se cere autentificare pentru citirea sau descărcarea
            articolelor și nu se percep taxe de niciun fel cititorilor pentru accesul la conținutul revistei.
          </p>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3">Taxe autori</h2>
          <p className="text-sm leading-relaxed text-foreground/90">
            Revista nu percepe taxe de procesare a articolelor (APC), taxe de submisie sau orice alte taxe de
            publicare către autori. Publicarea este complet gratuită pentru autori.
          </p>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3">Licență și permisiuni de reutilizare</h2>
          <p className="text-sm leading-relaxed text-foreground/90">
            Sub licența CC BY 4.0, orice utilizator are permisiunea să citească, descarce, copieze, distribuie,
            tipărească, caute, listeze și să facă legături către textul integral al articolelor, să le proceseze
            pentru indexare, să le folosească ca date pentru software sau să le utilizeze pentru orice alt scop
            legal, cu condiția atribuirii corecte a autorului, revistei și sursei originale.
          </p>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3">Copyright</h2>
          <p className="text-sm leading-relaxed text-foreground/90">
            Autorii își păstrează drepturile de autor asupra articolelor publicate. Publicarea în revistă nu
            transferă copyright-ul către publisher. Prin publicare, autorii acordă revistei dreptul de primă
            publicare a versiunii de referință (Version of Record) și drepturi neexclusive de distribuție,
            indexare și comunicare publică.
          </p>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3">Auto-arhivare</h2>
          <p className="text-sm leading-relaxed text-foreground/90">
            Autorii pot arhiva și redistribui versiunea publicată (Version of Record) în repository-uri
            instituționale, repository-uri tematice sau pe pagini personale, cu menționarea licenței CC BY 4.0 și
            a sursei originale. Distribuirea preprint-ului și a postprint-ului este permisă fără restricții
            suplimentare.
          </p>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3">Arhiva istorică</h2>
          <p className="text-sm leading-relaxed text-foreground/90">
            Fasciculele istorice ale revistei publicate în seriile anterioare (Seria I, 1932–1945, și Seria a II-a,
            1980–1996) sunt prezentate separat, ca arhivă digitală publică a unei publicații științifice de
            patrimoniu. Termenii de reutilizare pentru materialele scanate din aceste serii istorice sunt stabiliți
            individual, pentru fiecare fascicul, și nu sunt acoperiți de politica de acces deschis descrisă mai sus.
          </p>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
            <BadgeInfo className="h-5 w-5 text-primary" />
            Date despre revistă
          </h2>
          <ul className="space-y-1.5 text-sm leading-relaxed text-foreground/90">
            <li><strong>Titlu:</strong> {JOURNAL.name}</li>
            <li><strong>Acronim:</strong> {JOURNAL.abbr}</li>
            <li><strong>ISSN:</strong> {JOURNAL.issn}</li>
            <li><strong>Publisher:</strong> {JOURNAL.publisher}</li>
            <li><strong>Țară:</strong> {JOURNAL.country}</li>
            <li><strong>Frecvență de publicare:</strong> anuală</li>
            <li><strong>Limbă de publicare:</strong> română (cu titluri, rezumate și cuvinte-cheie în engleză)</li>
            <li><strong>Site oficial:</strong> <a href={JOURNAL.url} className="text-primary hover:underline">{JOURNAL.url}</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
