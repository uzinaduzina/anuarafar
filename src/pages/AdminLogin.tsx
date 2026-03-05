import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, LogIn, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, loginWithPassword } = useAuth();

  const redirectTarget = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from || '/dashboard';
  }, [location.state]);

  useEffect(() => {
    if (user && user.role !== 'author') {
      navigate(redirectTarget, { replace: true });
    }
  }, [user, navigate, redirectTarget]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    const result = await loginWithPassword(identifier, password);
    setIsSubmitting(false);

    if (!result.ok) {
      toast({
        title: 'Autentificare esuata',
        description: result.error || 'Verifica utilizatorul si parola.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Autentificare reusita',
      description: 'Bine ai venit in panoul editorial.',
    });
    navigate(redirectTarget, { replace: true });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-4">
      <div className="w-full max-w-lg">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Inapoi la site
        </Link>

        <div className="rounded-lg border bg-card shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-sidebar via-primary to-secondary p-6 text-white">
            <h1 className="font-serif text-2xl font-bold mb-1">Admin login</h1>
            <p className="text-sm opacity-80">Pentru admin, editori si revieweri</p>
          </div>

          <div className="p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">User sau email</Label>
                <Input
                  id="identifier"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="admin sau nume@iafar.ro"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Parola</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Parola contului"
                  required
                />
              </div>

              <Button type="submit" className="w-full font-semibold" size="lg" disabled={isSubmitting}>
                <ShieldCheck className="mr-2 h-4 w-4" /> Conectare admin
              </Button>
            </form>

            <div className="rounded-md border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
              Daca esti autor, foloseste pagina de autentificare cu cod:
              {' '}
              <Link to="/login" className="text-primary hover:underline">Login autori</Link>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
