import {
  Archive,
  Award,
  BadgeInfo,
  BookOpen,
  FileCheck2,
  History,
  Mail,
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { JOURNAL } from '@/data/journal';
import { MemberCard, type BoardMember } from '@/components/MemberCard';
import { EDITORIAL_BOARD_PROFILES } from '@/data/boardProfiles';

type EnglishSection =
  | 'about'
  | 'journal-information'
  | 'editorial-policy'
  | 'editorial-policies'
  | 'peer-review'
  | 'open-access'
  | 'editorial-board'
  | 'scientific-board'
  | 'contact';

const SECTION_CLASS = 'rounded-lg border bg-card p-6 shadow-sm';

const editorialBoard: BoardMember[] = [
  {
    name: 'Mihai Bărbulescu',
    title: 'Acad.',
    grade: 'Member of the Romanian Academy',
    affiliation: 'Editor-in-Chief · Institute "Folklore Archive of the Romanian Academy", Cluj-Napoca',
    ...EDITORIAL_BOARD_PROFILES['mihai-barbulescu'],
  },
  {
    name: 'Ileana Benga',
    title: 'Dr.',
    grade: 'Senior Researcher (Grade II)',
    affiliation: 'Deputy Editor-in-Chief · Institute "Folklore Archive of the Romanian Academy", Cluj-Napoca',
    ...EDITORIAL_BOARD_PROFILES['ileana-benga'],
  },
  {
    name: 'Liviu-Ovidiu Pop',
    title: 'Dr.',
    grade: 'Researcher',
    affiliation: 'Managing Editor · Institute "Folklore Archive of the Romanian Academy", Cluj-Napoca',
    ...EDITORIAL_BOARD_PROFILES['liviu-ovidiu-pop'],
  },
  {
    name: 'Theodor Constantiniu',
    title: 'Dr.',
    grade: 'Researcher (Grade III)',
    affiliation: 'Editorial Board Member · Institute "Folklore Archive of the Romanian Academy", Cluj-Napoca',
    ...EDITORIAL_BOARD_PROFILES['theodor-constantiniu'],
  },
  {
    name: 'Anamaria Lisovschi',
    title: 'Dr.',
    grade: 'Senior Researcher (Grade II)',
    affiliation: 'Editorial Board Member · Institute "Folklore Archive of the Romanian Academy", Cluj-Napoca',
    ...EDITORIAL_BOARD_PROFILES['anamaria-lisovschi'],
  },
  {
    name: 'Elena Bărbulescu',
    title: 'Dr.',
    grade: 'Researcher (Grade III)',
    affiliation: 'Editorial Board Member · Institute "Folklore Archive of the Romanian Academy", Cluj-Napoca',
    ...EDITORIAL_BOARD_PROFILES['elena-barbulescu'],
  },
];

const scientificBoard: BoardMember[] = [
  { name: 'Varvara Buzilă', title: 'Dr.', affiliation: 'National Museum of Ethnography and Natural History, Chișinău' },
  { name: 'Ioan Augustin Goia', title: 'Dr.', affiliation: 'Ethnographic Museum of Transylvania, Cluj-Napoca' },
  { name: 'Sanda Golopenția', title: 'Professor Emerita, Honorary Member of the Romanian Academy', affiliation: 'Brown University, Providence' },
  { name: 'Sabina Ispas', title: 'Acad.', affiliation: 'Institute of Ethnography and Folklore "Constantin Brăiloiu" of the Romanian Academy, Bucharest' },
  { name: 'Marianne Mesnil', title: 'Professor Honoraire', affiliation: 'Université Libre de Bruxelles' },
  { name: 'Ilie Moise', title: 'Professor Emeritus', affiliation: '"Lucian Blaga" University of Sibiu' },
  { name: 'Pávai István', title: 'Prof. Dr.', affiliation: 'HUN-REN BTK Institute for Musicology, Budapest' },
  { name: 'Lorenzo Renzi', title: 'Professor Emeritus', affiliation: 'University of Padua' },
  { name: 'Biljana Sikimić', title: 'Dr.', affiliation: 'Institute for Balkan Studies SASA, Belgrade' },
  { name: 'Ion Taloș', title: 'Professor Emeritus', affiliation: 'University of Cologne' },
];

const englishNav = [
  { label: 'Journal information', path: '/en/about' },
  { label: 'Editorial policies', path: '/en/editorial-policies' },
  { label: 'Peer review', path: '/en/peer-review' },
  { label: 'Open access & copyright', path: '/en/open-access' },
  { label: 'Author guidelines', path: '/en/author-guidelines' },
  { label: 'Editorial board', path: '/en/editorial-board' },
  { label: 'Scientific board', path: '/en/scientific-board' },
  { label: 'Contact', path: '/en/contact' },
];

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex flex-wrap gap-2">
        {englishNav.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </div>
      <h1 className="font-serif text-3xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function JournalFacts() {
  return (
    <section className={SECTION_CLASS}>
      <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
        <BadgeInfo className="h-5 w-5 text-primary" />
        Journal facts
      </h2>
      <div className="grid gap-3 text-sm leading-relaxed text-foreground/90 sm:grid-cols-2">
        <p><strong>Journal title:</strong> {JOURNAL.name} (<em>Yearbook of the Folklore Archive</em>)</p>
        <p><strong>Acronym:</strong> {JOURNAL.abbr}</p>
        <p><strong>ISSN:</strong> {JOURNAL.issn}</p>
        <p><strong>eISSN:</strong> {JOURNAL.eissn || 'Not assigned separately'}</p>
        <p><strong>Publisher:</strong> Romanian Academy – Cluj-Napoca Branch · "Arhiva de Folclor a Academiei Române" Institute</p>
        <p><strong>Country:</strong> Romania</p>
        <p><strong>Publication frequency:</strong> Annual</p>
        <p><strong>Official website:</strong> <a href={JOURNAL.url} className="text-primary hover:underline">{JOURNAL.url}</a></p>
      </div>
    </section>
  );
}

function ScopeSection() {
  return (
    <section className={SECTION_CLASS}>
      <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        Aims and scope
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
        <p>
          <strong>Anuarul Arhivei de Folclor (AAF)</strong> is a scholarly journal published by the Romanian Academy
          – Cluj-Napoca Branch through its "Arhiva de Folclor a Academiei Române" Institute (Folklore Archive
          Institute of the Romanian Academy).
        </p>
        <p>
          The journal publishes research articles, studies, archival materials, notes and reviews in folklore
          studies, ethnology, cultural anthropology, ethnomusicology, oral culture, ritual studies and related
          fields in the humanities and social sciences.
        </p>
        <p>
          <strong>Target readership:</strong> the journal addresses researchers, faculty, doctoral candidates and
          professionals in folklore studies, ethnology, cultural anthropology, ethnomusicology and related disciplines,
          as well as practitioners working with folklore archives, traditional culture, intangible heritage and
          cultural memory.
        </p>
      </div>
    </section>
  );
}

function HistorySection() {
  return (
    <section className={SECTION_CLASS}>
      <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        History of the journal
      </h2>
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 rounded-lg border border-series-1/30 bg-series-1-bg/20">
          <span className="w-2 h-full min-h-[2.5rem] rounded-full bg-series-1 flex-shrink-0" />
          <div>
            <div className="font-medium text-sm">Series I: nos. I–VII, 1932–1945</div>
            <div className="text-xs text-muted-foreground">Founder: Ion Mușlea</div>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg border border-series-2/30 bg-series-2-bg/20">
          <span className="w-2 h-full min-h-[2.5rem] rounded-full bg-series-2 flex-shrink-0" />
          <div>
            <div className="font-medium text-sm">Series II: nos. I–XVII (VIII–XXIV), 1980–1996</div>
            <div className="text-xs text-muted-foreground">Editors: Ion Taloș, Ion Cuceu</div>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg border border-series-3/30 bg-series-3-bg/20">
          <span className="w-2 h-full min-h-[2.5rem] rounded-full bg-series-3 flex-shrink-0" />
          <div>
            <div className="font-medium text-sm">Series III: nos. XXV–XXIX, 2022–present</div>
            <div className="text-xs text-muted-foreground">Editor-in-Chief: Mihai Bărbulescu</div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Series I and II are publicly available as a digital heritage archive; Series III (from 2022) is the
        peer-reviewed open-access scholarly programme that follows the editorial policies described on this site.
      </p>
    </section>
  );
}

function OpenAccessSection() {
  return (
    <section className={SECTION_CLASS}>
      <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
        <Scale className="h-5 w-5 text-primary" />
        Open access and copyright
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
        <p>
          <em>Anuarul Arhivei de Folclor</em> is a fully open access journal. Beginning with the relaunch of the
          journal in 2022 (Series III), all scholarly articles published in the journal are made available under a
          Creative Commons Attribution 4.0 International licence (<a href={JOURNAL.oa_license_url} className="text-primary hover:underline" target="_blank" rel="noreferrer"><strong>CC BY 4.0</strong></a>).
          Authors retain copyright over their articles.
        </p>

        <h3 className="font-semibold pt-2">Access model</h3>
        <p>
          Immediate open access. There is no embargo, no registration is required to read or download articles, and
          there are no fees of any kind charged to readers for accessing the journal's content.
        </p>

        <h3 className="font-semibold pt-2">Author fees</h3>
        <p>
          The journal does not charge article processing charges (APCs), submission fees, or any other publication
          fees to authors. Publication is entirely free of charge for authors.
        </p>

        <h3 className="font-semibold pt-2">Licence and reuse permissions</h3>
        <p>
          Under the CC BY 4.0 licence, any user is permitted to read, download, copy, distribute, print, search, link
          to the full texts, crawl them for indexing, pass them as data to software, or use them for any other lawful
          purpose, provided that proper attribution is given to the author, the journal, and the original source.
        </p>

        <h3 className="font-semibold pt-2">Copyright</h3>
        <p>
          Authors retain copyright in their published articles. Publication in the journal does not transfer copyright
          to the publisher. By publishing in the journal, authors grant the journal the right of first publication of
          the Version of Record, and non-exclusive rights of distribution, indexing, and public communication.
        </p>

        <h3 className="font-semibold pt-2">Historical archive</h3>
        <p>
          The historical issues of the journal published under earlier editorial series (Series I, 1932–1945, and
          Series II, 1980–1996) are presented separately as a public digital archive of a heritage scholarly
          publication. Reuse terms for the historical scanned materials are determined on a per-issue basis and are
          not covered by the open access policy described above.
        </p>
      </div>
    </section>
  );
}

function PeerReviewSection() {
  return (
    <section className={SECTION_CLASS}>
      <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        Peer review process
      </h2>
      <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
        <p><strong>Peer review:</strong> each manuscript is evaluated by a minimum of two independent reviewers, external to the editorial team.</p>
        <p><strong>Type of review:</strong> double-blind peer review. The identities of authors and reviewers are mutually concealed throughout the evaluation process.</p>
        <p><strong>Possible outcomes:</strong> accept, accept after revision, request major revision, or reject.</p>
        <p><strong>Editorial oversight:</strong> editors monitor the review process, assess reviewer reports and communicate decisions to authors through the editorial platform.</p>
        <p><strong>Transparency:</strong> the review policy, the scientific board, the editorial board, the institutional affiliation of editors and the author guidelines are publicly available on the journal website.</p>
      </div>
    </section>
  );
}

function EditorialQualitySection() {
  return (
    <section className={SECTION_CLASS}>
      <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
        <FileCheck2 className="h-5 w-5 text-primary" />
        Editorial quality control
      </h2>
      <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
        <p><strong>Peer review:</strong> each manuscript is evaluated by a minimum of two independent reviewers, external to the editorial team.</p>
        <p><strong>Type of review:</strong> double-blind peer review. The identities of authors and reviewers are mutually concealed throughout the evaluation process.</p>
        <p><strong>Transparency:</strong> the review policy, scientific board, editorial board, institutional affiliation of editors and author guidelines are publicly available on the journal website.</p>
        <p><strong>Publication ethics:</strong> the journal follows the recommendations of the Committee on Publication Ethics (COPE) and international best-practice principles for scholarly publishing.</p>
        <p><strong>Authorship:</strong> authors must be substantively responsible for the scientific content of the manuscript. Purely technical contributions, editorial assistance or contributions originating from AI tools do not justify authorship; such contributions may be acknowledged in a dedicated acknowledgements section.</p>
        <p><strong>Target readership:</strong> the journal addresses researchers, faculty, doctoral candidates and professionals in folklore studies, ethnology, cultural anthropology, ethnomusicology and related disciplines.</p>
      </div>
    </section>
  );
}

function IntegritySection() {
  return (
    <section className={SECTION_CLASS}>
      <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        Integrity, AI and data policies
      </h2>
      <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
        <p>
          <strong>Conflicts of interest:</strong> authors, reviewers and editors are required to declare any relevant
          conflicts of interest (financial, professional, personal or institutional). Such declarations are reviewed
          before the evaluation process begins.
        </p>
        <p>
          <strong>Plagiarism:</strong> manuscripts are subject to screening with the anti-plagiarism tool{' '}
          <a href="https://textguard.ai/plagiarism" target="_blank" rel="noreferrer" className="text-primary hover:underline">
            TextGuard.ai (textguard.ai/plagiarism)
          </a>{' '}
          through systematic random sampling, as part of the editorial process. Additional screening is performed
          whenever concerns are raised during peer review or editorial assessment. Suspected cases of plagiarism,
          self-plagiarism, data fabrication or duplicate publication are handled according to COPE guidelines and may
          result in rejection of the manuscript or retraction of the published article.
        </p>
        <p>
          <strong>Use of AI tools:</strong> any use of generative AI tools by authors (for writing assistance,
          translation, analysis, etc.) must be explicitly declared in the manuscript. AI tools cannot be listed as
          authors and cannot be credited with scientific responsibility. Automated generation of scientific content
          (fabricated data, non-existent citations) is treated as research misconduct.
        </p>
        <p>
          <strong>Ethical oversight of research:</strong> research involving human subjects, communities, sensitive
          materials or personal data must comply with applicable legislation, the informed consent of subjects and
          the ethical norms of the authors' home institutions. For folklore and ethnographic research specifically,
          the rights of tradition bearers and the source communities of cultural materials are expected to be respected.
        </p>
        <p>
          <strong>Corrections and retractions:</strong> substantive errors identified after publication are corrected
          transparently through erratum or corrigendum notices, visibly linked to the original article. Retractions
          follow explicit editorial procedures and leave a public trace in the archive, including the reason for retraction.
        </p>
        <p>
          <strong>Complaints and appeals:</strong> appeals concerning editorial decisions, peer review conduct or
          publication ethics issues should be submitted to <a href="mailto:anuar@iafar.ro" className="text-primary hover:underline">anuar@iafar.ro</a>.
          Complaints are first reviewed by the editor-in-chief and, where necessary, escalated to the publisher
          (the "Arhiva de Folclor a Academiei Române" Institute). Investigation procedures follow COPE guidelines.
        </p>
      </div>
    </section>
  );
}

function SelfArchivingSection() {
  return (
    <section className={SECTION_CLASS}>
      <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
        <Archive className="h-5 w-5 text-primary" />
        Self-archiving and repository deposit
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
        <p>
          The journal permits authors to deposit and archive their work in institutional repositories, subject
          repositories, or personal websites, without embargo and without requesting prior permission from the
          journal.
        </p>
        <p>
          This policy applies to all articles published in Series III of the journal (from 2022 onwards), under the
          Creative Commons Attribution 4.0 International licence (CC BY 4.0).
        </p>
        <h3 className="font-semibold pt-2">Versions that may be archived</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Submitted version (preprint):</strong> authors may archive the manuscript at any time, including
            before peer review, without restriction.
          </li>
          <li>
            <strong>Accepted version (postprint / Author Accepted Manuscript):</strong> authors may archive the
            peer-reviewed manuscript without embargo, immediately upon acceptance.
          </li>
          <li>
            <strong>Published version (Version of Record):</strong> authors may archive the final published article,
            including its formatted PDF, without embargo, immediately upon publication.
          </li>
        </ul>
        <h3 className="font-semibold pt-2">Conditions</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>The CC BY 4.0 licence must be acknowledged.</li>
          <li>The published version must be cited as the official version of record.</li>
          <li>A link to the article on the journal website is encouraged.</li>
        </ul>
        <p className="font-medium pt-2">There is no embargo period for any version.</p>
      </div>
    </section>
  );
}

function ArchivingMetadataSection() {
  return (
    <section className={SECTION_CLASS}>
      <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
        <Archive className="h-5 w-5 text-primary" />
        Archiving and metadata
      </h2>
      <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
        <p><strong>Individual articles:</strong> each article in Series III has a stable URL and a dedicated page on the journal website.</p>
        <p><strong>Full text:</strong> the full text of articles is freely available through the public article page and through an associated PDF file.</p>
        <p><strong>Metadata:</strong> standardised metadata (XML, CSV) for the scholarly articles in Series III is generated through the journal's administrative panel and made available for indexing in external databases.</p>
        <p><strong>Persistent identifiers:</strong> each article published in Series III is assigned a DOI through Zenodo (registrar: DataCite), alongside a stable URL on the article's page on the journal website.</p>
        <p>
          <strong>Preservation policy:</strong> print copies of the journal are deposited under Romanian legal deposit
          legislation (with the National Library of Romania, the Library of the Romanian Academy and other legally
          entitled libraries). Digital versions of articles are archived in the publisher's editorial infrastructure,
          under the responsibility of the "Arhiva de Folclor a Academiei Române" Institute and the Cluj-Napoca Branch
          of the Romanian Academy.
        </p>
        <p>
          <strong>Data sharing:</strong> where the nature of the research permits, authors are encouraged to indicate
          the data sources, archives and collections used. Ethical or legal restrictions on data sharing (such as
          limited consent of subjects, or rights of tradition-bearing communities) must be explained in the manuscript.
        </p>
      </div>
    </section>
  );
}

function PublisherInfoSection() {
  return (
    <section className={SECTION_CLASS}>
      <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
        <BadgeInfo className="h-5 w-5 text-primary" />
        Editorial and publisher information
      </h2>
      <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
        <p><strong>Journal:</strong> {JOURNAL.name} (<em>Yearbook of the Folklore Archive</em>)</p>
        <p><strong>ISSN:</strong> {JOURNAL.issn}{JOURNAL.eissn ? <> · <strong>eISSN:</strong> {JOURNAL.eissn}</> : null}</p>
        <p><strong>Publisher:</strong> Romanian Academy – Cluj-Napoca Branch · "Arhiva de Folclor a Academiei Române" Institute (Folklore Archive Institute of the Romanian Academy)</p>
        <p><strong>Publisher country:</strong> Romania</p>
        <p>
          <strong>Ownership:</strong> the journal is owned and administered by the academic publisher named above.
          There is no private shareholding and no external commercial control over editorial content.
        </p>
        <p>
          <strong>Revenue sources:</strong> the journal does not charge APCs and does not host commercial advertising.
          Editorial operations are supported entirely through the institutional resources of the publisher (the "Arhiva
          de Folclor a Academiei Române" Institute and the Cluj-Napoca Branch of the Romanian Academy).
        </p>
        <p>
          <strong>Advertising:</strong> the journal website does not host advertorials, and editorial decisions are not
          conditioned on funding, sponsorship or promotional considerations.
        </p>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className={SECTION_CLASS}>
      <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
        <Mail className="h-5 w-5 text-primary" />
        Editorial contact
      </h2>
      <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
        <p><strong>Official journal email:</strong> <a href="mailto:anuar@iafar.ro" className="text-primary hover:underline">anuar@iafar.ro</a></p>
        <p><strong>Address:</strong> Str. Republicii nr. 59, 400015 Cluj-Napoca, Romania</p>
        <p><strong>Telephone/Fax:</strong> +40-264-591864</p>
        <p><strong>Official website:</strong> <a href={JOURNAL.url} className="text-primary hover:underline">{JOURNAL.url}</a></p>
      </div>
    </section>
  );
}

function BoardSection({ type }: { type: 'editorial' | 'scientific' }) {
  const members = type === 'editorial' ? editorialBoard : scientificBoard;
  const title = type === 'editorial' ? 'Editorial board' : 'Scientific board';
  const Icon = type === 'editorial' ? Users : Award;

  return (
    <section className={SECTION_CLASS}>
      <h2 className="font-serif text-xl font-bold mb-5 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {members.map((member) => (
          <MemberCard key={member.name} member={member} />
        ))}
      </div>
    </section>
  );
}

function AuthorGuidelinesSection() {
  return (
    <section className={SECTION_CLASS}>
      <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        Author guidelines
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
        <p>
          The full author guidelines, including the manuscript template, submission form and detailed
          formatting instructions, are available on the dedicated submission page:
        </p>
        <p>
          <Link to="/en/author-guidelines" className="text-primary hover:underline">
            <strong>→ Author guidelines (full text)</strong>
          </Link>
        </p>
        <p>
          To submit a manuscript directly: <Link to="/submit" className="text-primary hover:underline">/submit</Link>.
          Submissions are accepted in Romanian, English, French, German and Italian; abstracts are required in
          Romanian and in one international language of circulation.
        </p>
      </div>
    </section>
  );
}

function OverviewPage() {
  return (
    <>
      <PageHeader
        title="Journal information"
        subtitle="General information about the journal, its publisher, scope, history, access model and editorial contact."
      />
      <div className="space-y-6">
        <JournalFacts />
        <ScopeSection />
        <HistorySection />
        <PeerReviewSection />
        <OpenAccessSection />
        <SelfArchivingSection />
        <AuthorGuidelinesSection />
        <ContactSection />
      </div>
    </>
  );
}

function FullPoliciesPage() {
  return (
    <>
      <PageHeader
        title="Editorial policies & transparency"
        subtitle="Comprehensive editorial, open-access, ethics, archiving and publisher policies for international indexing and institutional evaluation."
      />
      <div className="space-y-6">
        <JournalFacts />
        <OpenAccessSection />
        <SelfArchivingSection />
        <EditorialQualitySection />
        <IntegritySection />
        <ArchivingMetadataSection />
        <PublisherInfoSection />
        <ContactSection />
      </div>
    </>
  );
}

export default function EnglishJournalInfo({ section = 'about' }: { section?: EnglishSection }) {
  const titleBySection: Record<EnglishSection, string> = {
    about: 'Journal information',
    'journal-information': 'Journal information',
    'editorial-policy': 'Editorial policy',
    'editorial-policies': 'Editorial policies & transparency',
    'peer-review': 'Peer review',
    'open-access': 'Open access & copyright',
    'editorial-board': 'Editorial board',
    'scientific-board': 'Scientific board',
    contact: 'Editorial contact',
  };

  if (section === 'about' || section === 'journal-information') {
    return (
      <div className="container py-10 md:py-14 max-w-4xl">
        <OverviewPage />
      </div>
    );
  }

  if (section === 'editorial-policies') {
    return (
      <div className="container py-10 md:py-14 max-w-4xl">
        <FullPoliciesPage />
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-14 max-w-4xl">
      <PageHeader
        title={titleBySection[section]}
        subtitle="English-language information for international indexing, evaluation and accreditation."
      />
      <div className="space-y-6">
        {section === 'editorial-policy' && (
          <>
            <JournalFacts />
            <EditorialQualitySection />
            <IntegritySection />
          </>
        )}
        {section === 'peer-review' && (
          <>
            <JournalFacts />
            <PeerReviewSection />
          </>
        )}
        {section === 'open-access' && (
          <>
            <JournalFacts />
            <OpenAccessSection />
            <SelfArchivingSection />
          </>
        )}
        {section === 'editorial-board' && <BoardSection type="editorial" />}
        {section === 'scientific-board' && <BoardSection type="scientific" />}
        {section === 'contact' && (
          <>
            <JournalFacts />
            <ContactSection />
          </>
        )}
      </div>
    </div>
  );
}
