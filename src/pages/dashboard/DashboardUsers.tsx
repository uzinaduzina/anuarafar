import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Mail, UserPlus, Send, Copy, KeyRound } from 'lucide-react';
import { ROLE_LABELS, type UserRole } from '@/data/authUsers';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ROLE_OPTIONS: UserRole[] = ['admin', 'editor', 'reviewer'];

interface GeneratedCredentials {
  username: string;
  password: string;
  email: string;
}

export default function DashboardUsers() {
  const { toast } = useToast();
  const {
    authTransport,
    accounts,
    refreshAccounts,
    createAccount,
    sendRoleNotification,
  } = useAuth();

  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<GeneratedCredentials | null>(null);

  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    role: 'editor' as UserRole,
    username: '',
  });

  const [notifyForm, setNotifyForm] = useState({
    role: 'all' as UserRole | 'all',
    subject: '',
    message: '',
  });

  const credentialsText = useMemo(() => {
    if (!generatedCredentials) return '';
    return [
      `Email: ${generatedCredentials.email}`,
      `Username: ${generatedCredentials.username}`,
      `Parola: ${generatedCredentials.password}`,
      'Login direct: user + parola',
      'Login cu cod: email + parola -> cere cod pe email',
    ].join('\n');
  }, [generatedCredentials]);

  useEffect(() => {
    if (authTransport !== 'remote') return;

    let isMounted = true;
    const loadUsers = async () => {
      setIsLoadingAccounts(true);
      const result = await refreshAccounts();
      if (!result.ok && isMounted) {
        toast({
          title: 'Nu am putut incarca utilizatorii',
          description: result.error,
          variant: 'destructive',
        });
      }
      if (isMounted) setIsLoadingAccounts(false);
    };

    void loadUsers();
    return () => {
      isMounted = false;
    };
  }, [authTransport, refreshAccounts, toast]);

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreatingUser(true);
    const result = await createAccount(createForm);
    setIsCreatingUser(false);

    if (!result.ok) {
      toast({
        title: 'Crearea utilizatorului a esuat',
        description: result.error,
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Utilizator creat', description: result.message });
    setGeneratedCredentials(result.credentials || null);
    setCreateForm({
      name: '',
      email: '',
      role: 'editor',
      username: '',
    });
  };

  const handleCopyCredentials = async () => {
    if (!credentialsText) return;
    try {
      await navigator.clipboard.writeText(credentialsText);
      toast({
        title: 'Credențiale copiate',
        description: 'Le poți trimite și manual, dacă este nevoie.',
      });
    } catch {
      toast({
        title: 'Nu am putut copia',
        description: 'Copiază manual credențialele afișate.',
        variant: 'destructive',
      });
    }
  };

  const handleSendNotification = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSendingNotification(true);
    const result = await sendRoleNotification(notifyForm);
    setIsSendingNotification(false);

    if (!result.ok) {
      toast({
        title: 'Notificare esuata',
        description: result.error,
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Notificare trimisa', description: result.message });
    setNotifyForm((previous) => ({
      ...previous,
      subject: '',
      message: '',
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold">Utilizatori & autentificare</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Creezi conturi editoriale cu username si parola generate automat. Utilizatorul primit pe email se poate conecta fie cu user + parola, fie cu email + cod.
        </p>
      </div>

      <section className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-lg font-bold">Conturi active</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Rol</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Nume</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Email</th>
                <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Username</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(authTransport === 'remote' && isLoadingAccounts) ? (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-sm text-muted-foreground">Se incarca utilizatorii...</td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-sm text-muted-foreground">Nu exista utilizatori configurati.</td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.email} className="hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{ROLE_LABELS[account.role]}</td>
                    <td className="px-4 py-3 text-sm">{account.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{account.email}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{account.username}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {authTransport === 'remote' && (
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              <h2 className="font-serif text-lg font-bold">Adauga utilizator</h2>
            </div>
            <form onSubmit={handleCreateUser} className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-user-name">Nume</Label>
                <Input
                  id="new-user-name"
                  value={createForm.name}
                  onChange={(event) => setCreateForm((previous) => ({ ...previous, name: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-email">Email</Label>
                <Input
                  id="new-user-email"
                  type="email"
                  value={createForm.email}
                  onChange={(event) => setCreateForm((previous) => ({ ...previous, email: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-role">Rol</Label>
                <select
                  id="new-user-role"
                  value={createForm.role}
                  onChange={(event) => setCreateForm((previous) => ({ ...previous, role: event.target.value as UserRole }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-username">Username (optional)</Label>
                <Input
                  id="new-user-username"
                  value={createForm.username}
                  onChange={(event) => setCreateForm((previous) => ({ ...previous, username: event.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Dacă îl lași gol, sistemul generează automat username-ul pornind de la email.
                </p>
              </div>
              <Button type="submit" disabled={isCreatingUser} className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                Creează utilizator și trimite credențialele
              </Button>

              {generatedCredentials && (
                <div className="rounded-lg border bg-secondary/30 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">Ultimele credențiale generate</h3>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={handleCopyCredentials}>
                      <Copy className="mr-2 h-3.5 w-3.5" />
                      Copiază
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-md border bg-background px-3 py-2">
                      <div className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Email</div>
                      <div className="mt-1 font-medium break-all">{generatedCredentials.email}</div>
                    </div>
                    <div className="rounded-md border bg-background px-3 py-2">
                      <div className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Username</div>
                      <div className="mt-1 font-medium break-all">{generatedCredentials.username}</div>
                    </div>
                    <div className="rounded-md border bg-background px-3 py-2">
                      <div className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Parola</div>
                      <div className="mt-1 font-medium break-all">{generatedCredentials.password}</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Credențialele au fost trimise și pe email. Codul de login rămâne disponibil 30 de zile.
                  </p>
                </div>
              )}
            </form>
          </div>

          <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2">
              <Send className="h-4 w-4 text-primary" />
              <h2 className="font-serif text-lg font-bold">Corespondenta pe roluri</h2>
            </div>
            <form onSubmit={handleSendNotification} className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notify-role">Destinatari</Label>
                <select
                  id="notify-role"
                  value={notifyForm.role}
                  onChange={(event) => setNotifyForm((previous) => ({ ...previous, role: event.target.value as UserRole | 'all' }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="all">Toate rolurile</option>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notify-subject">Subiect</Label>
                <Input
                  id="notify-subject"
                  value={notifyForm.subject}
                  onChange={(event) => setNotifyForm((previous) => ({ ...previous, subject: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notify-message">Mesaj</Label>
                <Textarea
                  id="notify-message"
                  rows={6}
                  value={notifyForm.message}
                  onChange={(event) => setNotifyForm((previous) => ({ ...previous, message: event.target.value }))}
                  required
                />
              </div>
              <Button type="submit" disabled={isSendingNotification} className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Trimite notificare
              </Button>
            </form>
          </div>
        </section>
      )}

      <section className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-lg font-bold">Autentificare email</h2>
        </div>
        <div className="p-6 text-sm text-muted-foreground">
          Codurile de autentificare nu sunt afisate local. Fiecare utilizator primeste codul pe email, valabil 30 de zile.
        </div>
      </section>
    </div>
  );
}
