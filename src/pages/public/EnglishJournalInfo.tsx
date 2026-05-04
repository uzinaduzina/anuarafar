import {
  Award,
  BadgeInfo,
  BookOpen,
  FileCheck2,
  Mail,
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { JOURNAL } from '@/data/journal';
import { MemberCard, type BoardMember } from '@/components/MemberCard';

type EnglishSection =
  | 'about'
  | 'journal-information'
  | 'editorial-policy'
  | 'peer-review'
  | 'open-access'
  | 'editorial-board'
  | 'scientific-board'
  | 'contact';

const SECTION_CLASS = 'rounded-lg border bg-card p-6 shadow-sm';

const editorialBoard: BoardMember[] = [
  { name: 'Mihai Barbulescu', title: 'Acad.', affiliation: 'Editor-in-Chief · Institute "Folklore Archive of the Romanian Academy", Cluj-Napoca' },
  { name: 'Ileana Benga', title: 'Dr.', affiliation: 'Deputy Editor-in-Chief · Institute "Folklore Archive of the Romanian Academy", Cluj-Napoca' },
  { name: 'Liviu-Ovidiu Pop', title: 'Dr.', affiliation: 'Managing Editor · Institute "Folklore Archive of the Romanian Academy", Cluj-Napoca' },
  { name: 'Theodor Constantiniu', title: 'Dr.', affiliation: 'Editorial Board Member · Institute "Folklore Archive of the Romanian Academy", Cluj-Napoca' },
  { name: 'Anamaria Lisovschi', title: 'Dr.', affiliation: 'Editorial Board Member · Institute "Folklore Archive of the Romanian Academy", Cluj-Napoca' },
  { name: 'Elena Barbulescu', title: 'Dr.', affiliation: 'Editorial Board Member · Institute "Folklore Archive of the Romanian Academy", Cluj-Napoca' },
];

const scientificBoard: BoardMember[] = [
  { name: 'Varvara Buzila', title: 'Dr.', affiliation: 'National Museum of Ethnography and Natural History, Chisinau' },
  { name: 'Ioan Augustin Goia', title: 'Dr.', affiliation: 'Ethnographic Museum of Transylvania, Cluj-Napoca' },
  { name: 'Sanda Golopentia', title: 'Professor Emerita, Honorary Member of the Romanian Academy', affiliation: 'Brown University, Providence' },
  { name: 'Sabina Ispas', title: 'Acad.', affiliation: 'Institute of Ethnography and Folklore "Constantin Brailoiu" of the Romanian Academy, Bucharest' },
  { name: 'Marianne Mesnil', title: 'Professor Honoraire', affiliation: 'Universite Libre de Bruxelles' },
  { name: 'Ilie Moise', title: 'Professor Emeritus', affiliation: '"Lucian Blaga" University of Sibiu' },
  { name: 'Pavai Istvan', title: 'Prof. Dr.', affiliation: 'HUN-REN BTK Institute for Musicology, Budapest' },
  { name: 'Lorenzo Renzi', title: 'Professor Emeritus', affiliation: 'University of Padua' },
  { name: 'Biljana Sikimic', title: 'Dr.', affiliation: 'Institute for Balkan Studies SASA, Belgrade' },
  { name: 'Ion Talos', title: 'Professor Emeritus', affiliation: 'University of Cologne' },
];

const englishNav = [
  { label: 'Journal information', path: '/en/about' },
  { label: 'Editorial policy', path: '/en/editorial-policy' },
  { label: 'Peer review', path: '/en/peer-review' },
  { label: 'Open access & copyright', path: '/en/open-access' },
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
        <p><strong>Journal title:</strong> {JOURNAL.name}</p>
        <p><strong>Acronym:</strong> {JOURNAL.abbr}</p>
        <p><strong>ISSN:</strong> {JOURNAL.issn}</p>
        <p><strong>eISSN:</strong> {JOURNAL.eissn || 'Not assigned separately'}</p>
        <p><strong>Publisher:</strong> {JOURNAL.publisher}</p>
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
          <strong>Anuarul Arhivei de Folclor (AAF)</strong> is a scholarly journal published by the Institute
          "Folklore Archive of the Romanian Academy", Cluj-Napoca Branch of the Romanian Academy.
        </p>
        <p>
          The journal publishes research articles, studies, archival materials, notes and reviews in folklore
          studies, ethnology, cultural anthropology, ethnomusicology, oral culture, ritual studies and related
          fields in the humanities and social sciences.
        </p>
        <p>
          The journal addresses researchers, university staff, doctoral students and professionals working with
          folklore archives, traditional culture, intangible heritage and cultural memory.
        </p>
      </div>
    </section>
  );
}

function EditorialPolicySection() {
  return (
    <section className={SECTION_CLASS}>
      <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
        <FileCheck2 className="h-5 w-5 text-primary" />
        Editorial policy
      </h2>
      <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
        <p><strong>Selection criteria:</strong> manuscripts are evaluated for scholarly relevance, originality, methodological clarity, source use and fit with the journal scope.</p>
        <p><strong>Editorial decision:</strong> final publication decisions are made by the editorial team after peer review and editorial assessment.</p>
        <p><strong>Ethics:</strong> the journal follows internationally recognized standards of publication ethics, including transparency, responsible authorship, conflict of interest disclosure and correction of errors.</p>
        <p><strong>Author charges:</strong> the journal does not charge submission fees, editorial processing charges or article processing charges.</p>
        <p><strong>Advertising:</strong> the journal website does not host commercial advertising and editorial decisions are independent from sponsorship or promotion.</p>
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
        <p><strong>Review model:</strong> double-blind peer review.</p>
        <p><strong>Reviewers:</strong> each research manuscript is normally evaluated by at least two independent reviewers with relevant expertise.</p>
        <p><strong>Confidentiality:</strong> reviewer identities and author identities are protected during the review process.</p>
        <p><strong>Possible outcomes:</strong> accept, accept after revision, request major revision, or reject.</p>
        <p><strong>Editorial oversight:</strong> editors monitor the process, assess reviewer reports and communicate decisions to authors through the editorial platform.</p>
      </div>
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
      <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
        <p><strong>Access model:</strong> immediate open access, with no embargo and no registration required for reading.</p>
        <p><strong>License:</strong> eligible scholarly articles in the current series are published under <a href={JOURNAL.oa_license_url} className="text-primary hover:underline" target="_blank" rel="noreferrer"><strong>{JOURNAL.oa_license_name}</strong></a>.</p>
        <p><strong>Copyright:</strong> authors retain copyright over their published articles.</p>
        <p><strong>Reuse:</strong> reuse, distribution and adaptation are permitted with proper attribution to the author, journal and source, in accordance with the license.</p>
        <p><strong>Historical archive:</strong> earlier series are available as a public digital archive; reuse terms for historical scanned materials are clarified separately when needed.</p>
      </div>
    </section>
  );
}

function IntegritySection() {
  return (
    <section className={SECTION_CLASS}>
      <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        Integrity, AI and data
      </h2>
      <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
        <p><strong>Conflicts of interest:</strong> authors, reviewers and editors must disclose relevant conflicts of interest.</p>
        <p><strong>Plagiarism:</strong> manuscripts may be checked with plagiarism detection tools before publication.</p>
        <p><strong>Generative AI:</strong> authors must disclose meaningful use of generative AI tools; AI systems cannot be credited as authors.</p>
        <p><strong>Research ethics:</strong> research involving persons, communities or sensitive materials must follow applicable law, informed consent and relevant institutional ethics standards.</p>
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
        <p><strong>Editorial support:</strong> <a href="mailto:confafar@gmail.com" className="text-primary hover:underline">confafar@gmail.com</a></p>
        <p><strong>Address:</strong> Institute "Folklore Archive of the Romanian Academy", Romanian Academy, Cluj-Napoca Branch, 59 Republicii Street, 400015 Cluj-Napoca, Romania</p>
        <p><strong>Phone/Fax:</strong> +40-264-591864</p>
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

function OverviewPage() {
  return (
    <>
      <PageHeader
        title="Journal information"
        subtitle="General information about the journal, its publisher, scope, access model and editorial contact."
      />
      <div className="space-y-6">
        <JournalFacts />
        <ScopeSection />
        <PeerReviewSection />
        <OpenAccessSection />
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
    'peer-review': 'Peer review',
    'open-access': 'Open access & copyright',
    'editorial-board': 'Editorial board',
    'scientific-board': 'Scientific board',
    contact: 'Editorial contact',
  };

  return (
    <div className="container py-10 md:py-14 max-w-4xl">
      {section === 'about' || section === 'journal-information' ? (
        <OverviewPage />
      ) : (
        <>
          <PageHeader
            title={titleBySection[section]}
            subtitle="English-language information for international indexing, evaluation and accreditation."
          />
          <div className="space-y-6">
            {section === 'editorial-policy' && (
              <>
                <JournalFacts />
                <EditorialPolicySection />
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
        </>
      )}
    </div>
  );
}
