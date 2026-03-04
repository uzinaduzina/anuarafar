import { Pen, BookOpen } from 'lucide-react';
import { MemberCard } from '@/components/MemberCard';

export default function TehnoredactarePage() {
  return (
    <div className="container py-10 md:py-14 max-w-3xl">
      <h1 className="font-serif text-3xl font-bold mb-2 flex items-center gap-3">
        <Pen className="h-7 w-7 text-primary" />
        Tehnoredactare
      </h1>
      <p className="text-muted-foreground mb-8">Manuscript Editing</p>

      <div className="space-y-6">
        <MemberCard member={{ name: 'Ioan Dorel Radu', affiliation: 'Tehnoredactor' }} />

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
