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
            <p><strong>Licență:</strong> articolele sunt publicate sub <strong>Creative Commons CC BY 4.0</strong>.</p>
            <p><strong>Copyright:</strong> autorii își păstrează drepturile de autor; revista primește dreptul de publicare în regim OA.</p>
            <p><strong>Taxe autori:</strong> nu se percep taxe de procesare/publicare (APC = 0).</p>
          </div>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Controlul calității editoriale
          </h2>
          <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
            <p><strong>Peer review:</strong> minimum doi referenți independenți pentru fiecare manuscris.</p>
            <p><strong>Tip evaluare:</strong> double-blind peer review.</p>
            <p><strong>Transparență:</strong> politica de evaluare, colegiile și instrucțiunile pentru autori sunt publice pe site.</p>
            <p><strong>Etică:</strong> revista urmează recomandările COPE și principiile de bune practici editoriale.</p>
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
            <p><strong>Corecții/retrageri:</strong> erorile materiale se corectează transparent; retragerile urmează proceduri editoriale explicite.</p>
          </div>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" /> Arhivare și metadata
          </h2>
          <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
            <p><strong>Articole individuale:</strong> fiecare articol are URL unic și pagină dedicată.</p>
            <p><strong>Full text:</strong> disponibil în PDF și/sau HTML, gratuit.</p>
            <p><strong>Metadata:</strong> în panoul admin există export CSV DOAJ pe serie și pe număr pentru depunere metadata.</p>
            <p><strong>Identificatori persistenți:</strong> DOI este suportat și exportat când este disponibil.</p>
          </div>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
            <BadgeInfo className="h-5 w-5 text-primary" /> Informații editoriale și publisher
          </h2>
          <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
            <p><strong>Revistă:</strong> {JOURNAL.name}</p>
            <p><strong>ISSN:</strong> {JOURNAL.issn} · <strong>eISSN:</strong> {JOURNAL.eissn}</p>
            <p><strong>Publisher:</strong> {JOURNAL.publisher}</p>
            <p><strong>Țară publisher:</strong> {JOURNAL.country}</p>
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
