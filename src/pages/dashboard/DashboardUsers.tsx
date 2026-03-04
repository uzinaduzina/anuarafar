import { ShieldCheck, Mail, KeyRound } from 'lucide-react';
import { AUTH_ACCOUNTS, ROLE_LABELS } from '@/data/authUsers';
import { useAuth } from '@/contexts/AuthContext';

function formatDateTime(value: number) {
  return new Date(value).toLocaleString('ro-RO');
}

export default function DashboardUsers() {
  const { devInbox } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold">Utilizatori & autentificare</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configurare conturi pe roluri si monitorizare coduri de autentificare trimise pe email.
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
              {AUTH_ACCOUNTS.map((account) => (
                <tr key={account.email} className="hover:bg-accent/40 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{ROLE_LABELS[account.role]}</td>
                  <td className="px-4 py-3 text-sm">{account.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{account.email}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{account.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-lg font-bold">Inbox coduri email (local dev)</h2>
        </div>

        {devInbox.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">Nu exista coduri trimise inca.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary">
                  <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Email</th>
                  <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Rol</th>
                  <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Cod</th>
                  <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Trimis la</th>
                  <th className="text-left px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Expira la</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {devInbox.map((entry) => (
                  <tr key={`${entry.email}-${entry.sentAt}`} className="hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground">{entry.email}</td>
                    <td className="px-4 py-3 text-sm">{ROLE_LABELS[entry.role]}</td>
                    <td className="px-4 py-3 text-sm font-mono inline-flex items-center gap-2">
                      <KeyRound className="h-3 w-3 text-primary" /> {entry.code}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDateTime(entry.sentAt)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDateTime(entry.expiresAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
