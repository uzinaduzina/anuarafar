import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, requestLoginCode, verifyLoginCode } = useAuth();

  const redirectTarget = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from || '/dashboard/author';
  }, [location.state]);

  useEffect(() => {
    if (user) {
      navigate(redirectTarget, { replace: true });
    }
  }, [user, navigate, redirectTarget]);

  const handleRequestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsRequestingCode(true);
    const result = await requestLoginCode(email);
    setIsRequestingCode(false);

    if (!result.ok) {
      toast({ title: 'Nu s-a putut trimite codul', description: result.error, variant: 'destructive' });
      return;
    }

    toast({ title: 'Cod trimis', description: result.message });
  };

  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsVerifyingCode(true);
    const result = await verifyLoginCode(email, code);
    setIsVerifyingCode(false);

    if (!result.ok) {
      toast({ title: 'Autentificare esuata', description: result.error, variant: 'destructive' });
      return;
    }

    toast({ title: 'Autentificare reusita' });
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
            <h1 className="font-serif text-2xl font-bold mb-1">Login autori cu cod</h1>
            <p className="text-sm opacity-80">Foloseste emailul cu care ai trimis articolul</p>
          </div>

          <div className="p-6 space-y-4">
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email autor</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="autor@exemplu.ro"
                  required
                />
              </div>

              <Button type="submit" className="w-full" variant="outline" size="lg" disabled={isRequestingCode}>
                <Mail className="mr-2 h-4 w-4" /> Trimite cod pe email
              </Button>
            </form>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Cod de autentificare</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  inputMode="numeric"
                  maxLength={6}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full font-semibold"
                size="lg"
                disabled={isVerifyingCode || code.trim().length !== 6}
              >
                <LogIn className="mr-2 h-4 w-4" /> Conectare cu cod
              </Button>
            </form>

            <div className="rounded-md border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
              Codul este trimis pe emailul autorului si este valabil 30 de zile.
            </div>

            <div className="rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground">
              Pentru admin/editor/reviewer foloseste pagina separata:
              {' '}
              <Link to="/admin-login" className="text-primary hover:underline">Admin login (user + parolă sau email + cod)</Link>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
