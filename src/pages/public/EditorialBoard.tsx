import { Users, Award, Pen, BookOpen } from 'lucide-react';

interface BoardMember {
  name: string;
  title?: string;
  affiliation: string;
}

const scientificBoard: BoardMember[] = [
  { name: 'Varvara Buzilă', title: 'dr.', affiliation: 'Muzeul Național de Etnografie și Istorie Naturală, Chișinău' },
  { name: 'Ioan Augustin Goia', title: 'dr.', affiliation: 'Muzeul Etnografic al Transilvaniei, Cluj-Napoca' },
  { name: 'Sanda Golopenția', title: 'prof. emerita, membru de onoare al Academiei Române', affiliation: 'Brown University, Providence' },
  { name: 'Sabina Ispas', title: 'acad.', affiliation: 'Institutul de Etnografie și Folclor „Constantin Brăiloiu" al Academiei Române, București' },
  { name: 'Marianne Mesnil', title: 'prof. honoraire', affiliation: 'Université Libre de Bruxelles' },
  { name: 'Ilie Moise', title: 'prof. emerit', affiliation: 'Universitatea „Lucian Blaga", Sibiu' },
  { name: 'Pávai István', title: 'prof. dr.', affiliation: 'HUN-REN BTK Zenetudományi Intézet, Budapest' },
  { name: 'Lorenzo Renzi', title: 'prof. emerit', affiliation: 'Università di Padova' },
  { name: 'Biljana Sikimić', title: 'dr.', affiliation: 'Balkanološki Institut SANU, Beograd' },
  { name: 'Ion Taloș', title: 'prof. emerit', affiliation: 'Universität zu Köln' },
];

const editorialBoard: BoardMember[] = [
  { name: 'Mihai Bărbulescu', title: 'acad.', affiliation: 'Redactor-șef / Editor-in-chief' },
  { name: 'Ileana Benga', title: 'dr.', affiliation: 'Redactor-șef adjunct / Assistant chief editor' },
  { name: 'Liviu-Ovidiu Pop', title: 'dr.', affiliation: 'Secretar de redacție / Editorial secretary' },
  { name: 'Theodor Constantiniu', title: 'dr.', affiliation: 'Membru' },
  { name: 'Anamaria Lisovschi', title: 'dr.', affiliation: 'Membru' },
  { name: 'Elena Bărbulescu', title: 'dr.', affiliation: 'Membru' },
];

function getInitials(name: string) {
  return name.split(/\s+/).map(w => w.charAt(0).toUpperCase()).filter(c => c.match(/[A-ZÀ-Ž]/i)).join('');
}

function MemberCard({ member }: { member: BoardMember }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
      <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
        {getInitials(member.name)}
      </span>
      <div className="min-w-0">
        <div className="font-medium text-sm">
          {member.title && <span className="text-muted-foreground">{member.title} </span>}
          {member.name}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{member.affiliation}</div>
      </div>
    </div>
  );
}

export default function EditorialBoard() {
  return (
    <div className="container py-10 md:py-14 max-w-3xl">
      <h1 className="font-serif text-3xl font-bold mb-2">Colegii</h1>
      <p className="text-muted-foreground mb-8">Comitetul științific și colegiul de redacție</p>

      <div className="space-y-8">
        {/* Scientific Board */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold mb-1 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Comitetul Științific
          </h2>
          <p className="text-xs text-muted-foreground mb-5">Scientific Board</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scientificBoard.map(m => (
              <MemberCard key={m.name} member={m} />
            ))}
          </div>
        </div>

        {/* Editorial Board */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold mb-1 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Colegiul de Redacție
          </h2>
          <p className="text-xs text-muted-foreground mb-5">Editorial Board</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {editorialBoard.map(m => (
              <MemberCard key={m.name} member={m} />
            ))}
          </div>
        </div>

        {/* Tehnoredactare */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold mb-1 flex items-center gap-2">
            <Pen className="h-5 w-5 text-primary" />
            Tehnoredactare
          </h2>
          <p className="text-xs text-muted-foreground mb-5">Manuscript Editing</p>
          <MemberCard member={{ name: 'Ioan Dorel Radu', affiliation: 'Tehnoredactor' }} />
        </div>

        {/* Editura */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold mb-1 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Editura
          </h2>
          <p className="text-xs text-muted-foreground mb-5">Publishing House</p>
          <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
            <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
              EM
            </span>
            <div className="min-w-0">
              <div className="font-medium text-sm">Editura Mega</div>
              <div className="text-xs text-muted-foreground mt-0.5">Cluj-Napoca</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
