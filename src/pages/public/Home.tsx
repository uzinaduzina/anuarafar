import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Archive, Users, Loader2 } from 'lucide-react';
import { JOURNAL } from '@/data/journal';
import { useJournalData } from '@/data/JournalDataProvider';
import { IssueCard } from '@/components/IssueCard';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { issues, articles, loading } = useJournalData();

  const latestIssues = [...issues]
    .filter(i => i.status === 'published')
    .sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0))
    .slice(0, 3);

  const totalArticles = articles.length || issues.reduce((s, i) => s + i.article_count, 0);
  const totalIssues = issues.length;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sidebar to-sidebar/90 text-sidebar-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-[-100px] top-[-100px] w-[400px] h-[400px] rounded-full bg-primary/30" />
          <div className="absolute left-[-60px] bottom-[-60px] w-[300px] h-[300px] rounded-full bg-primary/20" />
        </div>
        <div className="container relative py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="text-[0.7rem] uppercase tracking-[0.14em] font-semibold text-primary mb-4">
              ISSN {JOURNAL.issn} · 1932–{new Date().getFullYear()}
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight mb-5">
              Anuarul Arhivei de Folclor
            </h1>
            <p className="text-base md:text-lg opacity-80 leading-relaxed mb-8 max-w-lg">
              Publicație științifică a Academiei Române dedicată cercetării și valorificării patrimoniului folcloric românesc.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="font-semibold">
                <Link to="/archive">
                  <Archive className="mr-2 h-4 w-4" />
                  Explorează arhiva
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="!bg-black/35 border-sidebar-foreground/35 text-sidebar-foreground hover:!bg-black/55 hover:text-sidebar-foreground font-semibold"
              >
                <Link to="/submit">Trimite manuscris</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-card">
        <div className="container py-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="font-serif text-2xl md:text-3xl font-bold text-primary">
                {loading ? '…' : totalIssues}
              </div>
              <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold mt-1">Numere publicate</div>
            </div>
            <div>
              <div className="font-serif text-2xl md:text-3xl font-bold text-primary">
                {loading ? '…' : `${totalArticles}+`}
              </div>
              <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold mt-1">Articole</div>
            </div>
            <div>
              <div className="font-serif text-2xl md:text-3xl font-bold text-primary">3</div>
              <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold mt-1">Serii editoriale</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest issues */}
      <section className="container py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-2xl font-bold">Ultimele numere</h2>
            <p className="text-sm text-muted-foreground mt-1">Cele mai recente apariții editoriale</p>
          </div>
          <Button asChild variant="ghost" className="text-primary">
            <Link to="/archive">
              Vezi toată arhiva <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {latestIssues.map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="container pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <BookOpen className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-serif text-lg font-bold mb-2">Acces deschis</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Toate articolele sunt disponibile gratuit în format PDF, cu acces liber pentru cercetători și publicul larg.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <Users className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-serif text-lg font-bold mb-2">Peer review</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fiecare manuscris trece prin proces de evaluare colegială de către specialiști în domeniu.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <Archive className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-serif text-lg font-bold mb-2">Arhivă completă</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Acces la toate cele trei serii ale Anuarului, din 1932 până în prezent.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
