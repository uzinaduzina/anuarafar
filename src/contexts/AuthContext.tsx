import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { getAccountByEmail, type AuthAccount, type UserRole } from '@/data/authUsers';

type AuthUser = AuthAccount;

interface EmailCodeInboxItem {
  email: string;
  code: string;
  role: UserRole;
  name: string;
  sentAt: number;
  expiresAt: number;
}

interface StoredLoginCode {
  email: string;
  code: string;
  expiresAt: number;
}

interface ActionResult {
  ok: boolean;
  message?: string;
  error?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  requestLoginCode: (email: string) => ActionResult;
  verifyLoginCode: (email: string, code: string) => ActionResult;
  logout: () => void;
  isAdmin: boolean;
  isEditor: boolean;
  isReviewer: boolean;
  isAuthor: boolean;
  canAccess: (roles: UserRole[]) => boolean;
  devInbox: EmailCodeInboxItem[];
}

const SESSION_USER_KEY = 'auth_user';
const LOGIN_CODES_KEY = 'auth_login_codes_v1';
const DEV_INBOX_KEY = 'auth_dev_inbox_v1';
const CODE_TTL_MS = 10 * 60 * 1000;
const DEV_INBOX_LIMIT = 20;

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function readStoredCodes(): StoredLoginCode[] {
  return safeJsonParse<StoredLoginCode[]>(localStorage.getItem(LOGIN_CODES_KEY), []);
}

function writeStoredCodes(codes: StoredLoginCode[]) {
  localStorage.setItem(LOGIN_CODES_KEY, JSON.stringify(codes));
}

function readDevInbox(): EmailCodeInboxItem[] {
  return safeJsonParse<EmailCodeInboxItem[]>(localStorage.getItem(DEV_INBOX_KEY), []);
}

function writeDevInbox(items: EmailCodeInboxItem[]) {
  localStorage.setItem(DEV_INBOX_KEY, JSON.stringify(items));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function buildAction(ok: boolean, message?: string, error?: string): ActionResult {
  return { ok, message, error };
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  requestLoginCode: () => buildAction(false),
  verifyLoginCode: () => buildAction(false),
  logout: () => {},
  isAdmin: false,
  isEditor: false,
  isReviewer: false,
  isAuthor: false,
  canAccess: () => false,
  devInbox: [],
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = sessionStorage.getItem(SESSION_USER_KEY);
    return safeJsonParse<AuthUser | null>(stored, null);
  });

  const [devInbox, setDevInbox] = useState<EmailCodeInboxItem[]>(() => readDevInbox());

  const login = useCallback((nextUser: AuthUser) => {
    setUser(nextUser);
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(nextUser));
  }, []);

  const requestLoginCode = useCallback((email: string): ActionResult => {
    const normalizedEmail = normalizeEmail(email);
    const account = getAccountByEmail(normalizedEmail);

    if (!account) {
      return buildAction(false, undefined, 'Nu exista un cont asociat acestui email.');
    }

    const now = Date.now();
    const code = generateCode();
    const expiresAt = now + CODE_TTL_MS;

    const activeCodes = readStoredCodes().filter((entry) => entry.expiresAt > now && entry.email !== normalizedEmail);
    activeCodes.push({ email: normalizedEmail, code, expiresAt });
    writeStoredCodes(activeCodes);

    const nextInboxEntry: EmailCodeInboxItem = {
      email: normalizedEmail,
      code,
      role: account.role,
      name: account.name,
      sentAt: now,
      expiresAt,
    };

    const nextInbox = [nextInboxEntry, ...readDevInbox()].slice(0, DEV_INBOX_LIMIT);
    writeDevInbox(nextInbox);
    setDevInbox(nextInbox);

    return buildAction(true, `Codul de autentificare a fost trimis catre ${normalizedEmail}.`);
  }, []);

  const verifyLoginCode = useCallback((email: string, code: string): ActionResult => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedCode = code.trim();
    const account = getAccountByEmail(normalizedEmail);

    if (!account) {
      return buildAction(false, undefined, 'Contul nu exista.');
    }

    const now = Date.now();
    const activeCodes = readStoredCodes().filter((entry) => entry.expiresAt > now);
    const entry = activeCodes.find((item) => item.email === normalizedEmail);

    if (!entry) {
      writeStoredCodes(activeCodes);
      return buildAction(false, undefined, 'Codul a expirat. Solicita un cod nou.');
    }

    if (entry.code !== normalizedCode) {
      return buildAction(false, undefined, 'Cod invalid. Verifica emailul si incearca din nou.');
    }

    const nextUser: AuthUser = {
      username: account.username,
      name: account.name,
      role: account.role,
      email: account.email,
    };

    login(nextUser);
    writeStoredCodes(activeCodes.filter((item) => item.email !== normalizedEmail));

    return buildAction(true, 'Autentificare reusita.');
  }, [login]);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(SESSION_USER_KEY);
  }, []);

  const isAdmin = user?.role === 'admin';
  const isEditor = user?.role === 'admin' || user?.role === 'editor';
  const isReviewer = user?.role === 'reviewer';
  const isAuthor = user?.role === 'author';

  const canAccess = useCallback((roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  const value = useMemo(() => ({
    user,
    login,
    requestLoginCode,
    verifyLoginCode,
    logout,
    isAdmin,
    isEditor,
    isReviewer,
    isAuthor,
    canAccess,
    devInbox,
  }), [user, login, requestLoginCode, verifyLoginCode, logout, isAdmin, isEditor, isReviewer, isAuthor, canAccess, devInbox]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export type { AuthUser, UserRole };
