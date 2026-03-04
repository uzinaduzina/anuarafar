import { Users } from 'lucide-react';
import { MemberCard, type BoardMember } from '@/components/MemberCard';

const editorialBoard: BoardMember[] = [
  { name: 'Mihai Bărbulescu', title: 'acad.', affiliation: 'Redactor-șef / Editor-in-chief' },
  { name: 'Ileana Benga', title: 'dr.', affiliation: 'Redactor-șef adjunct / Assistant chief editor' },
  { name: 'Liviu-Ovidiu Pop', title: 'dr.', affiliation: 'Secretar de redacție / Editorial secretary' },
  { name: 'Theodor Constantiniu', title: 'dr.', affiliation: 'Membru' },
  { name: 'Anamaria Lisovschi', title: 'dr.', affiliation: 'Membru' },
  { name: 'Elena Bărbulescu', title: 'dr.', affiliation: 'Membru' },
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
