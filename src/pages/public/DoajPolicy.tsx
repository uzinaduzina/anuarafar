import { FileCheck2, ShieldCheck, Scale, Users, BadgeInfo, Mail } from 'lucide-react';
import { JOURNAL } from '@/data/journal';

const SECTION_CLASS = 'rounded-lg border bg-card p-6 shadow-sm';

export default function DoajPolicy() {
  return (
    <div className="container py-10 md:py-14 max-w-4xl">
      <h1 className="font-serif text-3xl font-bold mb-2">Politici DOAJ & transparență</h1>
      <p className="text-muted-foreground mb-8">
        Pagina centralizează criteriile cheie de transparență, open access și bune practici editoriale pentru indexare DOAJ.
      </p>

      <div className="space-y-6">
        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-primary" /> Open access, licență, copyright
          </h2>
          <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
            <p><strong>Model OA:</strong> acces deschis imediat, fără embargo, fără autentificare pentru citire.</p>
            <p><strong>Licență:</strong> articolele științifice eligibile pentru DOAJ din seria a III-a sunt publicate sub <a href={JOURNAL.oa_license_url} className="text-primary hover:underline" target="_blank" rel="noreferrer"><strong>{JOURNAL.oa_license_name}</strong></a>.</p>
            <p><strong>Copyright:</strong> {JOURNAL.oa_copyright_notice}</p>
            <p><strong>Drepturi acordate revistei:</strong> {JOURNAL.oa_publishing_rights_notice}</p>
            <p><strong>Reutilizare:</strong> {JOURNAL.oa_reuse_notice}</p>
            <p><strong>Taxe autori:</strong> nu se percep taxe de procesare/publicare (APC = 0).</p>
            <p><strong>Domeniu de aplicare:</strong> arhiva istorică a seriilor I și II rămâne publică, dar nu este inclusă încă în exportul DOAJ la nivel de articol până la completarea metadatelor și a clarificărilor juridice pentru fiecare fascicul.</p>
          </div>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Controlul calității editoriale
          </h2>
          <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
            <p><strong>Peer review:</strong> minimum doi referenți independenți pentru fiecare manuscris.</p>
            <p><strong>Tip evaluare:</strong> double-blind peer review.</p>
            <p><strong>Transparență:</strong> politica de evaluare, colegiile, afilierea editorilor și instrucțiunile pentru autori sunt publice pe site.</p>
            <p><strong>Etică:</strong> revista urmează recomandările COPE și principiile de bune practici editoriale.</p>
            <p><strong>Autorat / contributori:</strong> autorii trebuie să răspundă substanțial de conținutul științific; contribuțiile tehnice, editoriale sau AI nu justifică statut de autor.</p>
            <p><strong>Target readership:</strong> revista se adresează cercetătorilor, cadrelor universitare, doctoranzilor și profesioniștilor din folcloristică, etnologie, antropologie culturală și domenii conexe.</p>
          </div>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Politici integritate, AI și date
          </h2>
          <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
            <p><strong>Conflicte de interese:</strong> autorii, recenzenții și editorii trebuie să declare orice conflict relevant.</p>
            <p><strong>Plagiat:</strong> manuscrisele pot fi verificate cu instrumente antiplagiat înainte de decizia editorială.</p>
            <p><strong>Utilizarea AI:</strong> utilizarea instrumentelor generative de către autori trebuie declarată; AI nu poate fi autor.</p>
            <p><strong>Ethical oversight:</strong> cercetările care implică persoane, comunități sau materiale sensibile trebuie să respecte legislația aplicabilă, consimțământul informat și normele etice instituționale relevante.</p>
            <p><strong>Corecții/retrageri:</strong> erorile materiale se corectează transparent; retragerile urmează proceduri editoriale explicite și lasă urme publice în arhivă.</p>
            <p><strong>Plângeri și apeluri:</strong> contestațiile privind deciziile editoriale, conduita în peer review sau problemele etice se transmit la <a href="mailto:anuar@iafar.ro" className="text-primary hover:underline">anuar@iafar.ro</a> și sunt analizate de echipa editorială și, când este nevoie, de publisher.</p>
          </div>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" /> Arhivare și metadata
          </h2>
          <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
            <p><strong>Articole individuale:</strong> fiecare articol are URL unic și pagină dedicată.</p>
            <p><strong>Full text:</strong> disponibil gratuit prin pagina publică a articolului și prin fișier PDF asociat.</p>
            <p><strong>Metadata:</strong> în panoul admin există export DOAJ Native XML și CSV pentru articolele științifice eligibile din seria a III-a.</p>
            <p><strong>Identificatori persistenți:</strong> DOI este suportat și exportat când este disponibil.</p>
            <p><strong>Preservation policy:</strong> conținutul este păstrat în arhiva digitală a revistei, în infrastructura editorială a publisherului și în depozitele statice folosite pentru distribuția publică a fișierelor.</p>
            <p><strong>Repository policy:</strong> autorii pot distribui liber URL-ul versiunii publicate pe site-ul revistei și pot arhiva referința la versiunea publicată, cu menționarea licenței și a sursei.</p>
            <p><strong>Data sharing:</strong> atunci când natura cercetării permite, autorii sunt încurajați să indice sursele de date, arhivele și colecțiile folosite; restricțiile etice sau juridice trebuie explicate în manuscris.</p>
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
            <p><strong>Ownership:</strong> revista este deținută și administrată de publisherul academic menționat mai sus; nu există acționariat privat și nici control comercial extern.</p>
            <p><strong>Revenue sources:</strong> revista nu percepe APC și nu publică publicitate comercială; funcționarea editorială se bazează pe resurse instituționale ale publisherului.</p>
            <p><strong>Advertising:</strong> site-ul revistei nu găzduiește advertoriale și nu condiționează deciziile editoriale de finanțare, sponsorizare sau promovare.</p>
          </div>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" /> Contact editorial
          </h2>
          <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
            <p>Email oficial jurnal: <a href="mailto:anuar@iafar.ro" className="text-primary hover:underline">anuar@iafar.ro</a></p>
            <p>Email suport editorial: <a href="mailto:confafar@gmail.com" className="text-primary hover:underline">confafar@gmail.com</a></p>
            <p>Adresă: str. Republicii nr. 59, 400015, Cluj-Napoca, România</p>
          </div>
        </section>
      </div>
    </div>
  );
}
