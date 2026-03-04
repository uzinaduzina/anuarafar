import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const DEMO_USERS = [
  { username: 'admin', password: 'admin2026!', name: 'Administrator', role: 'Admin' },
  { username: 'editor', password: 'editor2026!', name: 'Editor Principal', role: 'Editor' },
  { username: 'reviewer', password: 'reviewer2026!', name: 'Reviewer Demo', role: 'Reviewer' },
  { username: 'author', password: 'author2026!', name: 'Autor Demo', role: 'Author' },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = DEMO_USERS.find(u => u.username === username && u.password === password);
    if (user) {
      toast({ title: `Bun venit, ${user.name}!` });
      navigate('/dashboard');
    } else {
      toast({ title: 'Eroare', description: 'Credențiale invalide', variant: 'destructive' });
    }
  };

  const quickLogin = (u: typeof DEMO_USERS[0]) => {
    setUsername(u.username);
    setPassword(u.password);
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Înapoi la site
        </Link>

        <div className="rounded-lg border bg-card shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-sidebar via-primary to-secondary p-6 text-white">
            <h1 className="font-serif text-2xl font-bold mb-1">Autentificare</h1>
            <p className="text-sm opacity-80">Platformă editorială — Anuarul AAF</p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Utilizator</Label>
                <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Parolă</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full font-semibold" size="lg">
                <LogIn className="mr-2 h-4 w-4" /> Conectare
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 pt-4 border-t">
              <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold mb-3">Conturi demo</div>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary text-secondary-foreground">
                      <th className="text-left px-3 py-2 text-[0.65rem] uppercase tracking-[0.08em] font-semibold">Rol</th>
                      <th className="text-left px-3 py-2 text-[0.65rem] uppercase tracking-[0.08em] font-semibold">User</th>
                      <th className="text-left px-3 py-2 text-[0.65rem] uppercase tracking-[0.08em] font-semibold">Parolă</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {DEMO_USERS.map(u => (
                      <tr key={u.username} className="hover:bg-accent/50">
                        <td className="px-3 py-2 font-medium">{u.role}</td>
                        <td className="px-3 py-2 text-muted-foreground">{u.username}</td>
                        <td className="px-3 py-2 text-muted-foreground font-mono text-xs">{u.password}</td>
                        <td className="px-3 py-2">
                          <button onClick={() => quickLogin(u)} className="text-primary text-xs hover:underline">
                            Folosește
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
