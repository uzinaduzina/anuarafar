import { Award } from 'lucide-react';
import { MemberCard, type BoardMember } from '@/components/MemberCard';

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

export default function ScientificBoard() {
  return (
    <div className="container py-10 md:py-14 max-w-3xl">
      <h1 className="font-serif text-3xl font-bold mb-2 flex items-center gap-3">
        <Award className="h-7 w-7 text-primary" />
        Comitetul Științific
      </h1>
      <p className="text-muted-foreground mb-8">Scientific Board</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {scientificBoard.map(m => (
          <MemberCard key={m.name} member={m} />
        ))}
      </div>
    </div>
  );
}
