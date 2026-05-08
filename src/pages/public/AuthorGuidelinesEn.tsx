import { Link } from 'react-router-dom';
import {
  AlignLeft,
  AlertTriangle,
  BookOpen,
  FileText,
  Image,
  ListOrdered,
  Pen,
  Quote,
  Type,
} from 'lucide-react';

const SECTION_CLASS = 'rounded-lg border bg-card p-6 shadow-sm';

function GuidelineSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
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

export default function AuthorGuidelinesEn() {
  return (
    <div className="container py-10 md:py-14 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold mb-2 flex items-center gap-3">
          <Pen className="h-7 w-7 text-primary" />
          Author guidelines
        </h1>
        <p className="text-muted-foreground">
          Manuscript preparation and submission guidelines for <em>Anuarul Arhivei de Folclor</em> (Yearbook of the
          Folklore Archive of the Romanian Academy).
        </p>
      </div>

      <div className="space-y-6">
        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-2">Submission</h2>
          <p className="text-sm text-foreground/80 leading-relaxed mb-3">
            Manuscripts are submitted through the editorial platform at <Link to="/submit" className="text-primary hover:underline"><strong>/submit</strong></Link>.
            The submission form accepts the manuscript file (Word) along with figures and any supporting material.
            Confirmation and editorial correspondence are sent to the corresponding author by email.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            <strong>Languages of submission:</strong> Romanian, English, French, German or Italian. Each manuscript must
            include the title in Romanian and in one international language of circulation, an abstract (max. 200 words)
            in the international language of circulation, and keywords in both Romanian and the international language.
          </p>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-2">Format and structure</h2>
          <div className="divide-y">
            <GuidelineSection icon={FileText} title="Document format">
              <p>
                Microsoft Word (<strong>.doc</strong>, <strong>.docx</strong> or compatible formats). Manuscripts must
                not be submitted as PDF only; PDF may be attached alongside the Word file to indicate the desired page
                layout but does not replace the editable file.
              </p>
            </GuidelineSection>

            <GuidelineSection icon={AlignLeft} title="Page formatting">
              <p>
                A4 page size, top/bottom/left/right margins of <strong>2.5 cm</strong>, paragraph style{' '}
                <strong>"No spacing"</strong>, alignment <strong>"Justify"</strong>.
              </p>
            </GuidelineSection>

            <GuidelineSection icon={Type} title="Fonts">
              <p>
                <strong>Times New Roman 12 pt</strong>. Romanian diacritics are mandatory; diacritics and accents
                specific to other languages used in the manuscript are also required.
              </p>
            </GuidelineSection>

            <GuidelineSection icon={AlignLeft} title="Line spacing">
              <p><strong>1.5</strong></p>
            </GuidelineSection>

            <GuidelineSection icon={FileText} title="Recommended length">
              <p><strong>10–12 pages</strong> (including appendices)</p>
            </GuidelineSection>
          </div>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-2">Article structure</h2>
          <div className="divide-y">
            <GuidelineSection icon={Type} title="Article title (Romanian)">
              <p>In Romanian, centred, font size <strong>14 pt</strong>, <strong>bold</strong>.</p>
            </GuidelineSection>

            <GuidelineSection icon={Type} title="Author name and affiliation">
              <p>
                Preceded by the academic or university position. Form: <strong>Last name, First name</strong>; right
                aligned, font size 12 pt, no bold; placed two lines after the title. The institutional affiliation
                appears one line below the author's name.
              </p>
              <div className="bg-muted/50 rounded p-3 mt-2 text-xs font-mono">
                <p>Prof. univ. dr. First name Last name</p>
                <p>Faculty of …, University of … / Institute / Museum</p>
              </div>
            </GuidelineSection>

            <GuidelineSection icon={Type} title="Article title (international language)">
              <p>Also provided in an international language of circulation: English, French, German or Italian.</p>
            </GuidelineSection>

            <GuidelineSection icon={AlignLeft} title="Abstract">
              <p>
                Each article is preceded by an abstract in the same international language as the translated title.
                Font: <strong>Times New Roman 10 pt</strong>; maximum <strong>200 words</strong>.
              </p>
            </GuidelineSection>

            <GuidelineSection icon={ListOrdered} title="Keywords">
              <p>
                Immediately after the abstract: a list of <strong>five</strong> representative terms (each consisting
                of one or several words) reflecting the content of the article — provided in Romanian and in the
                international language of the title and abstract.
              </p>
            </GuidelineSection>

            <GuidelineSection icon={Type} title="Section headings">
              <p>Centred, <strong>bold</strong>, font size <strong>12 pt</strong>.</p>
            </GuidelineSection>
          </div>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-2">Notes, quotations and bibliography</h2>
          <div className="divide-y">
            <GuidelineSection icon={BookOpen} title="Footnotes">
              <p>
                Times New Roman, font size <strong>10 pt</strong>, line spacing <strong>1</strong>. Justified
                alignment. Each footnote ends with a full stop.
              </p>
            </GuidelineSection>

            <GuidelineSection icon={Image} title="Photographs and graphic elements">
              <p>
                Submitted <strong>separately</strong> in good resolution, with the desired position in the text
                indicated either inline or in an attached PDF showing the preferred page layout.
              </p>
            </GuidelineSection>

            <GuidelineSection icon={Quote} title="Quotation marks">
              <ul className="list-disc pl-4 space-y-1">
                <li>Quotations in Romanian: round quotation marks <strong>„ "</strong></li>
                <li>Quotations in English: <strong>" "</strong></li>
                <li>Quotations in French: <strong>« »</strong></li>
                <li>Quotations within quotations: French guillemets <strong>« »</strong></li>
                <li>Omissions within a quotation: <strong>[…]</strong></li>
              </ul>
            </GuidelineSection>

            <GuidelineSection icon={BookOpen} title="Bibliographic references">
              <p>References are placed in footnotes (no separate bibliography list at the end of the article).</p>
            </GuidelineSection>
          </div>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-2">Citation style</h2>
          <div className="space-y-3 text-sm text-foreground/80 leading-relaxed">
            <p>
              <strong>General format:</strong> First name Last name, <em>Title</em>, City, Publisher, year, p. 1–100.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Missing indicator: <strong>[n.d.]</strong> for no date or <strong>[n.publ.]</strong> for no publisher.</li>
              <li>Translated work: First name Last name, <em>Title</em>, translated from … by …, City, Publisher, year, p. 1–100.</li>
              <li>
                Work in a foreign language: the title is translated into Romanian in square brackets.<br />
                <span className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded">First name Last name, La Tradition Populaire [Tradiția populară], City, Publisher, year, p. 1–100.</span>
              </li>
              <li>
                Article in a journal: article title in <em>italics</em>, journal title between Romanian quotation marks „ ".<br />
                <span className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded">First name Last name, <em>Title</em>, in „Journal title", volume, year, p.</span>
              </li>
              <li>
                Edited volume: include the editor(s).<br />
                <span className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded">***, <em>Title</em>, edited and with introductory study by First name Last name, City, Publisher, year, p.</span>
              </li>
              <li>
                Online version: include the full URL and access date.<br />
                <span className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded">First name Last name, <em>Title</em>, in „Title", available online at: http://www.… (accessed: day, month, year).</span>
              </li>
            </ul>
          </div>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-2">Footnote abbreviations</h2>
          <div className="space-y-3 text-sm text-foreground/80 leading-relaxed">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong><em>op. cit.</em></strong> / <strong><em>art. cit.</em></strong> — used when a work by an author is cited several times but not consecutively. The first citation must be given in full.</li>
              <li><strong><em>Ibidem</em></strong> — consecutive citation of the same author and the same work. If the page is also identical, the note contains only <em>Ibidem</em>. If the page differs: <em>Ibidem</em>, p.</li>
              <li><strong><em>Eadem</em></strong> — same as <em>Ibidem</em>, used when the author is a woman.</li>
              <li><strong><em>Idem</em></strong> — avoids repeating the author's name in consecutive citations of different works.</li>
              <li><strong><em>apud</em></strong> — refers to a source cited indirectly, retrieved from another work.</li>
              <li><strong><em>cf.</em></strong> — comparison between different or similar viewpoints.</li>
            </ul>
          </div>
        </section>

        <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Important note
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Apart from the abbreviations accepted in scholarly usage (such as those listed above), <strong>no other
            abbreviations</strong> are used in the body of the manuscript.
          </p>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-3">Author obligations and declarations</h2>
          <div className="space-y-3 text-sm leading-relaxed text-foreground/80">
            <p>
              By submitting a manuscript to <em>Anuarul Arhivei de Folclor</em>, authors confirm that:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                The manuscript is original and has not been published elsewhere, nor is it currently under
                consideration by another journal.
              </li>
              <li>
                Any conflicts of interest (financial, professional, personal, or institutional) are explicitly
                declared in the manuscript.
              </li>
              <li>
                Any use of generative AI tools in the preparation of the manuscript is explicitly disclosed; AI
                tools cannot be listed as authors.
              </li>
              <li>All co-authors have approved the submission and the manuscript content.</li>
              <li>
                Permissions have been obtained for any third-party copyrighted material (images, quotations,
                archival recordings) reproduced in the manuscript.
              </li>
              <li>
                Research involving human subjects, communities, or sensitive cultural materials complies with
                applicable ethical standards and informed consent requirements.
              </li>
            </ul>
            <p>
              Manuscripts are subject to anti-plagiarism screening (
              <a href="https://textguard.ai/plagiarism" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                TextGuard.ai
              </a>
              ) as part of the editorial process.
            </p>
          </div>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="font-serif text-xl font-bold mb-2">Submit your manuscript</h2>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Use the editorial submission form at{' '}
            <Link to="/submit" className="text-primary hover:underline"><strong>/submit</strong></Link>{' '}
            to send your manuscript and supporting files. The form is bilingual (Romanian / English). After submission,
            you will receive an email confirmation with a tracking ID; the editorial team typically returns an initial
            review within 2–4 weeks.
          </p>
        </section>
      </div>
    </div>
  );
}
