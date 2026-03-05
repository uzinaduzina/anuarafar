export type UserRole = 'admin' | 'editor' | 'reviewer' | 'author';

export interface AuthAccount {
  username: string;
  name: string;
  role: UserRole;
  email: string;
}

export const AUTH_ACCOUNTS: AuthAccount[] = [
  { username: 'admin', name: 'Liviu Pop', role: 'admin', email: 'liviu.o.pop@gmail.com' },
  { username: 'editor', name: 'Editor Principal', role: 'editor', email: 'editor@iafar.ro' },
  { username: 'reviewer', name: 'Reviewer Demo', role: 'reviewer', email: 'reviewer@iafar.ro' },
  { username: 'author', name: 'Autor Demo', role: 'author', email: 'author@iafar.ro' },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  editor: 'Editor',
  reviewer: 'Reviewer',
  author: 'Author',
};

export function getAccountByEmail(email: string): AuthAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return AUTH_ACCOUNTS.find((account) => account.email.toLowerCase() === normalized);
}

export function getAccountsByRole(role: UserRole): AuthAccount[] {
  return AUTH_ACCOUNTS.filter((account) => account.role === role);
}
