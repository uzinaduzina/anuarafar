import { FileCheck2, ShieldCheck, Scale, Users, BadgeInfo, Mail } from 'lucide-react';
import { JOURNAL } from '@/data/journal';

const SECTION_CLASS = 'rounded-lg border bg-card p-6 shadow-sm';

export default function DoajPolicy() {
  return (
    <div className="container py-10 md:py-14 max-w-4xl">
      <h1 className="font-serif text-3xl font-bold mb-2">Politici editoriale & transparență</h1>
      <p className="text-muted-foreground mb-8">
        Pagina centralizează criteriile cheie de transparență, open access și bune practici editoriale ale revistei
        <em> Anuarul Arhivei de Folclor</em>, pentru indexare internațională și pentru evaluare instituțională.
      </p>

      <div className="space-y-6">
        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-primary" /> Open access, licență, copyright
          </h2>
          <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
            <p><strong>Model OA:</strong> acces deschis imediat, fără embargo și fără autentificare pentru citire.</p>
            <p>
              <strong>Licență:</strong> toate articolele științifice publicate în seria a III-a (din 2022) sunt sub
              licență <a href={JOURNAL.oa_license_url} className="text-primary hover:underline" target="_blank" rel="noreferrer"><strong>Creative Commons Attribution 4.0 International (CC BY 4.0)</strong></a>.
              Materialele editoriale, recenziile de carte, in memoriam-urile și alte categorii non-articole sunt
              publicate în acces deschis, iar regimul lor de licențiere se stabilește individual și se indică pe
              pagina fiecărui material.
            </p>
            <p>
              <strong>Copyright:</strong> autorii își păstrează drepturile de autor asupra articolelor publicate.
              Publicarea în revistă nu transferă copyright-ul către publisher.
            </p>
            <p>
              <strong>Drepturi acordate revistei:</strong> prin publicare, autorii acordă revistei dreptul de primă
              publicare a versiunii de referință și drepturi neexclusive de distribuție, indexare și comunicare publică.
            </p>
            <p>
              <strong>Reutilizare:</strong> sub licența CC BY 4.0, orice utilizator are permisiunea să citească,
              descarce, copieze, distribuie, tipărească, caute, listeze, indexeze și să folosească articolele pentru
              orice scop legal, inclusiv pentru exploatare automată (crawling, text și data mining), cu condiția
              atribuirii corecte a autorului, revistei și sursei.
            </p>
            <p>
              <strong>Taxe autori:</strong> revista nu percepe taxe de procesare a articolelor (APC), taxe de submisie
              sau orice altă taxă către autori. Publicarea este complet gratuită pentru autori.
            </p>
            <p>
              <strong>Domeniu de aplicare:</strong> politica de open access și licențiere descrisă mai sus se aplică
              seriei a III-a a revistei (din 2022). Fasciculele istorice ale seriei I (1932–1945) și seriei a II-a
              (1980–1996) sunt prezentate separat, ca arhivă digitală publică a unei publicații științifice de
              patrimoniu; reutilizarea materialelor scanate din aceste serii este reglementată individual, în funcție
              de statutul juridic al fiecărui fascicul.
            </p>
          </div>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Controlul calității editoriale
          </h2>
          <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
            <p><strong>Peer review:</strong> minimum doi referenți independenți, externi colectivului de redacție, evaluează fiecare manuscris.</p>
            <p><strong>Tip evaluare:</strong> double-blind peer review. Identitatea autorilor și a recenzenților este protejată reciproc pe toată durata procesului.</p>
            <p><strong>Transparență:</strong> politica de evaluare, comitetul științific, colegiul de redacție, afilierea instituțională a editorilor și instrucțiunile pentru autori sunt publice pe site.</p>
            <p><strong>Etică:</strong> revista urmează recomandările Committee on Publication Ethics (COPE) și principiile internaționale de bune practici editoriale.</p>
            <p>
              <strong>Autorat:</strong> autorii trebuie să răspundă substanțial de conținutul științific al manuscrisului.
              Contribuțiile pur tehnice, editoriale sau provenite din instrumente AI nu justifică statut de autor;
              aceste contribuții pot fi recunoscute în secțiunea de mulțumiri.
            </p>
            <p><strong>Public țintă:</strong> revista se adresează cercetătorilor, cadrelor universitare, doctoranzilor și profesioniștilor din folcloristică, etnologie, antropologie culturală, etnomuzicologie și domenii conexe.</p>
          </div>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Politici de integritate, AI și date
          </h2>
          <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
            <p>
              <strong>Conflicte de interese:</strong> autorii, recenzenții și editorii trebuie să declare orice
              conflict de interese relevant (financiar, profesional, personal sau instituțional). Declarațiile sunt
              analizate înainte de începerea procesului de evaluare.
            </p>
            <p>
              <strong>Plagiat:</strong> manuscrisele sunt supuse verificării antiplagiat prin eșantionare sistematică
              aleatorie, ca parte a procesului editorial. Verificări suplimentare sunt efectuate ori de câte ori apar
              suspiciuni semnalate în timpul peer review-ului sau al evaluării editoriale. Cazurile suspectate de
              plagiat, autoplagiat, fabricare de date sau publicare duplicată sunt tratate conform recomandărilor COPE
              și pot duce la respingerea manuscrisului sau la retragerea articolului publicat.
            </p>
            <p>
              <strong>Utilizarea instrumentelor AI:</strong> utilizarea instrumentelor generative de către autori
              (pentru asistență la redactare, traducere, analiză etc.) trebuie declarată explicit în manuscris.
              Instrumentele AI nu pot figura ca autori și nu pot fi creditate pentru responsabilitate științifică.
              Generarea automată de conținut științific (date fictive, citate inexistente) este considerată misconduct.
            </p>
            <p>
              <strong>Supraveghere etică a cercetării:</strong> cercetările care implică persoane, comunități,
              materiale sensibile sau date personale trebuie să respecte legislația aplicabilă, consimțământul
              informat al subiecților și normele etice ale instituției de proveniență a autorilor. Pentru cercetarea
              folclorică și etnografică, se așteaptă respectarea drepturilor purtătorilor de tradiție și a comunităților
              de origine ale materialelor culturale.
            </p>
            <p>
              <strong>Corecții și retrageri:</strong> erorile materiale identificate după publicare sunt corectate
              transparent prin erratum sau corrigendum, vizibil legat de articolul original. Retragerile urmează
              proceduri editoriale explicite și lasă urme publice în arhivă, cu motivarea retragerii.
            </p>
            <p>
              <strong>Plângeri și apeluri:</strong> contestațiile privind deciziile editoriale, conduita în peer review
              sau problemele de etică a publicării se transmit la <a href="mailto:anuar@iafar.ro" className="text-primary hover:underline">anuar@iafar.ro</a>.
              Plângerile sunt analizate inițial de redactorul-șef și, dacă este nevoie, escaladate către publisher
              (Institutul „Arhiva de Folclor a Academiei Române"). Procesul de investigare urmează liniile directoare COPE.
            </p>
          </div>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" /> Arhivare și metadate
          </h2>
          <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
            <p><strong>Articole individuale:</strong> fiecare articol din seria a III-a are URL stabil și pagină dedicată pe site-ul revistei.</p>
            <p><strong>Full text:</strong> textul integral al articolelor este disponibil gratuit prin pagina publică a articolului și prin fișier PDF asociat.</p>
            <p><strong>Metadate:</strong> pentru articolele științifice din seria a III-a se generează metadate în formate standardizate (XML, CSV) disponibile prin panoul administrativ al revistei pentru indexare în baze de date externe.</p>
            <p><strong>Identificatori persistenți:</strong> fiecare articol publicat în seria a III-a primește un DOI prin CrossRef, alături de URL stabil pe pagina articolului de pe site-ul revistei.</p>
            <p>
              <strong>Politică de prezervare:</strong> fasciculele tipărite ale revistei sunt depuse conform legislației
              române privind depozitul legal al publicațiilor (Biblioteca Națională a României, Biblioteca Academiei
              Române și celelalte biblioteci legal îndreptățite). Versiunile digitale ale articolelor sunt arhivate în
              infrastructura editorială a publisherului, sub responsabilitatea Institutului „Arhiva de Folclor a
              Academiei Române" și a Filialei Cluj-Napoca a Academiei Române.
            </p>
            <p>
              <strong>Politică de auto-arhivare:</strong> autorii pot arhiva și redistribui versiunea publicată
              (Version of Record) în repository-uri instituționale, tematice sau pe pagini personale, cu menționarea
              licenței CC BY 4.0 și a sursei. Sub această licență, distribuirea preprint-ului și a postprint-ului este
              permisă fără restricții suplimentare.
            </p>
            <p>
              <strong>Partajare de date:</strong> atunci când natura cercetării permite, autorii sunt încurajați să
              indice sursele de date, arhivele și colecțiile folosite. Restricțiile etice sau juridice asupra
              partajării datelor (de exemplu, consimțământ limitat al subiecților, drepturi ale comunităților purtătoare
              de tradiție) trebuie explicate în manuscris.
            </p>
          </div>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
            <BadgeInfo className="h-5 w-5 text-primary" /> Informații editoriale și publisher
          </h2>
          <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
            <p><strong>Revistă:</strong> {JOURNAL.name}</p>
            <p><strong>ISSN:</strong> {JOURNAL.issn}{JOURNAL.eissn ? <> · <strong>eISSN:</strong> {JOURNAL.eissn}</> : null}</p>
            <p><strong>Publisher:</strong> {JOURNAL.publisher}</p>
            <p><strong>Țară publisher:</strong> {JOURNAL.country}</p>
            <p><strong>Ownership:</strong> revista este deținută și administrată de publisherul academic menționat mai sus. Nu există acționariat privat și nici control comercial extern asupra conținutului editorial.</p>
            <p><strong>Surse de venit:</strong> revista nu percepe APC și nu publică publicitate comercială. Funcționarea editorială se bazează pe resursele instituționale ale publisherului (Institutul „Arhiva de Folclor a Academiei Române" și Filiala Cluj-Napoca a Academiei Române).</p>
            <p><strong>Publicitate:</strong> site-ul revistei nu găzduiește advertoriale și nu condiționează deciziile editoriale de finanțare, sponsorizare sau promovare.</p>
          </div>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" /> Contact editorial
          </h2>
          <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
            <p><strong>Email oficial al revistei:</strong> <a href="mailto:anuar@iafar.ro" className="text-primary hover:underline">anuar@iafar.ro</a></p>
            <p><strong>Adresă:</strong> str. Republicii nr. 59, 400015 Cluj-Napoca, România</p>
            <p><strong>Telefon/Fax:</strong> +40-264-591864</p>
            <p><strong>Site oficial:</strong> <a href={JOURNAL.url} className="text-primary hover:underline">{JOURNAL.url}</a></p>
          </div>
        </section>
      </div>
    </div>
  );
}
