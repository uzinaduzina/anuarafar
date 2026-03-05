import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { getAccountByEmail, type AuthAccount, type UserRole } from '@/data/authUsers';

type AuthUser = AuthAccount;
type AuthTransport = 'local' | 'remote';

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

interface ApiAuthResponse {
  ok?: boolean;
  message?: string;
  error?: string;
  user?: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  requestLoginCode: (email: string) => Promise<ActionResult>;
  verifyLoginCode: (email: string, code: string) => Promise<ActionResult>;
  logout: () => void;
  isAdmin: boolean;
  isEditor: boolean;
  isReviewer: boolean;
  isAuthor: boolean;
  canAccess: (roles: UserRole[]) => boolean;
  devInbox: EmailCodeInboxItem[];
  authTransport: AuthTransport;
}

const SESSION_USER_KEY = 'auth_user';
const LOGIN_CODES_KEY = 'auth_login_codes_v1';
const DEV_INBOX_KEY = 'auth_dev_inbox_v1';
const CODE_TTL_MS = 10 * 60 * 1000;
const DEV_INBOX_LIMIT = 20;
const AUTH_API_BASE = (import.meta.env.VITE_AUTH_API_BASE || '').trim().replace(/\/+$/, '');
const REMOTE_AUTH_ENABLED = AUTH_API_BASE.length > 0;

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

async function parseApiResponse(response: Response): Promise<ApiAuthResponse> {
  const raw = await response.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ApiAuthResponse;
  } catch {
    return {};
  }
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  requestLoginCode: async () => buildAction(false),
  verifyLoginCode: async () => buildAction(false),
  logout: () => {},
  isAdmin: false,
  isEditor: false,
  isReviewer: false,
  isAuthor: false,
  canAccess: () => false,
  devInbox: [],
  authTransport: 'local',
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = sessionStorage.getItem(SESSION_USER_KEY);
    return safeJsonParse<AuthUser | null>(stored, null);
  });

  const [devInbox, setDevInbox] = useState<EmailCodeInboxItem[]>(() => (REMOTE_AUTH_ENABLED ? [] : readDevInbox()));

  const login = useCallback((nextUser: AuthUser) => {
    setUser(nextUser);
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(nextUser));
  }, []);

  const requestLoginCode = useCallback(async (email: string): Promise<ActionResult> => {
    const normalizedEmail = normalizeEmail(email);

    if (REMOTE_AUTH_ENABLED) {
      try {
        const response = await fetch(`${AUTH_API_BASE}/auth/request-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail }),
        });
        const payload = await parseApiResponse(response);

        if (!response.ok || payload.ok === false) {
          return buildAction(false, undefined, payload.error || 'Nu s-a putut trimite codul de autentificare.');
        }

        return buildAction(true, payload.message || `Codul de autentificare a fost trimis catre ${normalizedEmail}.`);
      } catch {
        return buildAction(false, undefined, 'Serviciul de autentificare nu raspunde momentan.');
      }
    }

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

  const verifyLoginCode = useCallback(async (email: string, code: string): Promise<ActionResult> => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedCode = code.trim();

    if (REMOTE_AUTH_ENABLED) {
      try {
        const response = await fetch(`${AUTH_API_BASE}/auth/verify-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, code: normalizedCode }),
        });
        const payload = await parseApiResponse(response);

        if (!response.ok || payload.ok === false || !payload.user) {
          return buildAction(false, undefined, payload.error || 'Cod invalid sau expirat.');
        }

        login(payload.user);
        return buildAction(true, payload.message || 'Autentificare reusita.');
      } catch {
        return buildAction(false, undefined, 'Serviciul de autentificare nu raspunde momentan.');
      }
    }

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
    authTransport: REMOTE_AUTH_ENABLED ? 'remote' as const : 'local' as const,
  }), [user, login, requestLoginCode, verifyLoginCode, logout, isAdmin, isEditor, isReviewer, isAuthor, canAccess, devInbox]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export type { AuthUser, UserRole };
