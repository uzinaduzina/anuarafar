import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, KeyRound, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH_ACCOUNTS, ROLE_LABELS } from '@/data/authUsers';

export default function Login() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeRequested, setCodeRequested] = useState(false);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, requestLoginCode, verifyLoginCode, devInbox, authTransport } = useAuth();

  const redirectTarget = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from || '/dashboard';
  }, [location.state]);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleRequestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsRequestingCode(true);
    const result = await requestLoginCode(email);
    setIsRequestingCode(false);

    if (!result.ok) {
      toast({ title: 'Nu s-a putut trimite codul', description: result.error, variant: 'destructive' });
      return;
    }

    setCodeRequested(true);
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

  const quickFill = (targetEmail: string) => {
    setEmail(targetEmail);
    setCode('');
    setCodeRequested(false);
  };

  const latestCodeForEmail = authTransport === 'local'
    ? devInbox.find((entry) => entry.email === email.trim().toLowerCase())
    : undefined;

  return (
    <div className="min-h-screen grid place-items-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Inapoi la site
        </Link>

        <div className="rounded-lg border bg-card shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-sidebar via-primary to-secondary p-6 text-white">
            <h1 className="font-serif text-2xl font-bold mb-1">Autentificare cu cod email</h1>
            <p className="text-sm opacity-80">Admin, Editor, Reviewer, Author</p>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
            <div className="space-y-4">
              <form onSubmit={handleRequestCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nume@iafar.ro"
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
                  disabled={
                    isVerifyingCode
                    || (authTransport === 'remote' ? code.trim().length !== 6 : (!codeRequested && !latestCodeForEmail))
                  }
                >
                  <LogIn className="mr-2 h-4 w-4" /> Conectare cu cod
                </Button>
              </form>

              <div className="rounded-md border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
                {authTransport === 'remote'
                  ? 'Autentificare reala prin serviciul email configurat (Cloudflare + Resend).'
                  : 'In mediu local, codurile trimise pe email sunt afisate si in lista "Inbox local".'}
              </div>

              {latestCodeForEmail && (
                <div className="rounded-md border px-3 py-2 text-xs">
                  <div className="font-semibold text-muted-foreground mb-1">Ultimul cod pentru acest email</div>
                  <div className="font-mono text-sm inline-flex items-center gap-2">
                    <KeyRound className="h-3 w-3 text-primary" /> {latestCodeForEmail.code}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold mb-3">Conturi pe rol</div>
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary text-secondary-foreground">
                        <th className="text-left px-3 py-2 text-[0.65rem] uppercase tracking-[0.08em] font-semibold">Rol</th>
                        <th className="text-left px-3 py-2 text-[0.65rem] uppercase tracking-[0.08em] font-semibold">Email</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {AUTH_ACCOUNTS.map((account) => (
                        <tr key={account.email} className="hover:bg-accent/50">
                          <td className="px-3 py-2 font-medium">{ROLE_LABELS[account.role]}</td>
                          <td className="px-3 py-2 text-muted-foreground">{account.email}</td>
                          <td className="px-3 py-2 text-right">
                            <button onClick={() => quickFill(account.email)} className="text-primary text-xs hover:underline">
                              Foloseste
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {authTransport === 'local' && (
                <div>
                  <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold mb-3">Inbox local (ultimele coduri)</div>
                  <div className="rounded-md border max-h-56 overflow-auto">
                    {devInbox.length === 0 ? (
                      <div className="p-3 text-xs text-muted-foreground">Nu exista coduri trimise inca.</div>
                    ) : (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-secondary text-secondary-foreground">
                            <th className="text-left px-3 py-2">Email</th>
                            <th className="text-left px-3 py-2">Cod</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {devInbox.slice(0, 8).map((entry) => (
                            <tr key={`${entry.email}-${entry.sentAt}`}>
                              <td className="px-3 py-2 text-muted-foreground">{entry.email}</td>
                              <td className="px-3 py-2 font-mono">{entry.code}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
