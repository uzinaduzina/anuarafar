import { Users } from 'lucide-react';
import { MemberCard, type BoardMember } from '@/components/MemberCard';

const editorialBoard: BoardMember[] = [
  {
    name: 'Mihai Bărbulescu',
    title: 'acad.',
    grade: 'Academician AR',
    affiliation: 'Redactor-șef · Institutul „Arhiva de Folclor a Academiei Române”, Cluj-Napoca',
    scholar: 'https://scholar.google.com/citations?user=WjMalKgAAAAJ&hl=en',
  },
  {
    name: 'Ileana Benga',
    title: 'dr.',
    grade: 'C.Ș. II',
    affiliation: 'Redactor-șef adjunct · Institutul „Arhiva de Folclor a Academiei Române”, Cluj-Napoca',
    scholar: 'https://scholar.google.com/citations?user=B62d_UoAAAAJ&hl=en',
  },
  {
    name: 'Liviu-Ovidiu Pop',
    title: 'dr.',
    grade: 'C.Ș.',
    affiliation: 'Secretar de redacție · Institutul „Arhiva de Folclor a Academiei Române”, Cluj-Napoca',
    scholar: 'https://scholar.google.com/citations?user=nq-BVycAAAAJ&hl=en',
  },
  {
    name: 'Theodor Constantiniu',
    title: 'dr.',
    grade: 'C.Ș. III',
    affiliation: 'Membru · Institutul „Arhiva de Folclor a Academiei Române”, Cluj-Napoca',
    scholar: 'https://scholar.google.com/citations?user=XS-_Mh8AAAAJ&hl=en',
  },
  {
    name: 'Anamaria Lisovschi',
    title: 'dr.',
    grade: 'C.Ș. II',
    affiliation: 'Membru · Institutul „Arhiva de Folclor a Academiei Române”, Cluj-Napoca',
    scholar: 'https://scholar.google.com/citations?user=khlTb_cAAAAJ&hl=en',
  },
  {
    name: 'Elena Bărbulescu',
    title: 'dr.',
    grade: 'C.Ș. III',
    affiliation: 'Membru · Institutul „Arhiva de Folclor a Academiei Române”, Cluj-Napoca',
    academia: 'https://apubb.academia.edu/ElenaBarbulescu',
  },
];

export default function EditorialBoard() {
  return (
    <div className="container py-10 md:py-14 max-w-3xl">
      <h1 className="font-serif text-3xl font-bold mb-2 flex items-center gap-3">
        <Users className="h-7 w-7 text-primary" />
        Colegiul de Redacție
      </h1>
      <p className="text-muted-foreground mb-8">Editorial Board</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {editorialBoard.map(m => (
          <MemberCard key={m.name} member={m} />
        ))}
      </div>
    </div>
  );
}
