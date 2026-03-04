import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, Archive, Info, LogIn, Send, Users } from 'lucide-react';
import { JOURNAL } from '@/data/journal';
import logo from '@/assets/logo_iafar.png';

const NAV_ITEMS = [
  { label: 'Acasă', path: '/', icon: BookOpen },
  { label: 'Arhivă', path: '/archive', icon: Archive },
  { label: 'Colegii', path: '/editorial-board', icon: Users },
  { label: 'Despre', path: '/about', icon: Info },
  { label: 'Trimite manuscris', path: '/submit', icon: Send },
];

export default function PublicLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="IAFAR" className="h-10 w-10 rounded-sm" />
            <div className="hidden sm:block">
              <div className="font-serif text-lg font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                Anuarul AAF
              </div>
              <div className="text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
                ISSN {JOURNAL.issn}
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const active = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
            <Link
              to="/login"
              className="ml-2 flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden md:inline">Login</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-10">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="font-serif text-lg font-bold mb-2">Anuarul Arhivei de Folclor</div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {JOURNAL.description}
              </p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-3">Navigare</div>
              <div className="flex flex-col gap-2">
                {NAV_ITEMS.map(item => (
                  <Link key={item.path} to={item.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-3">Contact</div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>str. Republicii nr. 59, 400015 Cluj-Napoca</p>
                <p>Tel/Fax: +40-264-591864</p>
                <p>Email: anuar@iafar.ro</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} {JOURNAL.publisher}. ISSN {JOURNAL.issn}
          </div>
        </div>
      </footer>
    </div>
  );
}
