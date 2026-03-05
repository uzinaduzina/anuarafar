import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { AUTH_ACCOUNTS, getAccountByEmail, type AuthAccount, type UserRole } from '@/data/authUsers';

type AuthUser = AuthAccount;
type AuthTransport = 'local' | 'remote';
type NotificationRole = UserRole | 'all';

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

interface CreateAccountInput {
  name: string;
  email: string;
  role: UserRole;
  password: string;
  username?: string;
}

interface SendRoleNotificationInput {
  role: NotificationRole;
  subject: string;
  message: string;
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
  token?: string;
  user?: AuthUser;
  account?: AuthAccount;
  accounts?: AuthAccount[];
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser, token?: string | null) => void;
  requestLoginCode: (email: string, password?: string) => Promise<ActionResult>;
  verifyLoginCode: (email: string, code: string) => Promise<ActionResult>;
  refreshAccounts: () => Promise<ActionResult>;
  createAccount: (input: CreateAccountInput) => Promise<ActionResult>;
  sendRoleNotification: (input: SendRoleNotificationInput) => Promise<ActionResult>;
  logout: () => void;
  isAdmin: boolean;
  isEditor: boolean;
  isReviewer: boolean;
  isAuthor: boolean;
  canAccess: (roles: UserRole[]) => boolean;
  devInbox: EmailCodeInboxItem[];
  authTransport: AuthTransport;
  authToken: string | null;
  accounts: AuthAccount[];
}

const SESSION_USER_KEY = 'auth_user';
const SESSION_TOKEN_KEY = 'auth_session_token';
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

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AuthUser>;
  return typeof candidate.username === 'string'
    && typeof candidate.name === 'string'
    && typeof candidate.email === 'string'
    && typeof candidate.role === 'string';
}

function parseRemoteAccounts(accounts: unknown): AuthAccount[] {
  if (!Array.isArray(accounts)) return [];
  return accounts
    .filter((entry) => isAuthUser(entry))
    .map((entry) => {
      const account = entry as AuthUser;
      return {
        username: account.username,
        name: account.name,
        role: account.role,
        email: normalizeEmail(account.email),
      };
    });
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
  refreshAccounts: async () => buildAction(false),
  createAccount: async () => buildAction(false),
  sendRoleNotification: async () => buildAction(false),
  logout: () => {},
  isAdmin: false,
  isEditor: false,
  isReviewer: false,
  isAuthor: false,
  canAccess: () => false,
  devInbox: [],
  authTransport: 'local',
  authToken: null,
  accounts: AUTH_ACCOUNTS,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = sessionStorage.getItem(SESSION_USER_KEY);
    return safeJsonParse<AuthUser | null>(stored, null);
  });
  const [authToken, setAuthToken] = useState<string | null>(() => sessionStorage.getItem(SESSION_TOKEN_KEY));
  const [accounts, setAccounts] = useState<AuthAccount[]>(() => (REMOTE_AUTH_ENABLED ? [] : AUTH_ACCOUNTS));
  const [devInbox, setDevInbox] = useState<EmailCodeInboxItem[]>(() => (REMOTE_AUTH_ENABLED ? [] : readDevInbox()));

  const login = useCallback((nextUser: AuthUser, token?: string | null) => {
    setUser(nextUser);
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(nextUser));

    const normalizedToken = token || null;
    setAuthToken(normalizedToken);
    if (normalizedToken) {
      sessionStorage.setItem(SESSION_TOKEN_KEY, normalizedToken);
    } else {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
    }
  }, []);

  const requestLoginCode = useCallback(async (email: string, password = ''): Promise<ActionResult> => {
    const normalizedEmail = normalizeEmail(email);

    if (REMOTE_AUTH_ENABLED) {
      try {
        const response = await fetch(`${AUTH_API_BASE}/auth/request-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, password }),
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

        if (!response.ok || payload.ok === false || !isAuthUser(payload.user)) {
          return buildAction(false, undefined, payload.error || 'Cod invalid sau expirat.');
        }

        login(payload.user, typeof payload.token === 'string' ? payload.token : null);
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

    login(nextUser, null);
    writeStoredCodes(activeCodes.filter((item) => item.email !== normalizedEmail));

    return buildAction(true, 'Autentificare reusita.');
  }, [login]);

  const refreshAccounts = useCallback(async (): Promise<ActionResult> => {
    if (!REMOTE_AUTH_ENABLED) {
      setAccounts(AUTH_ACCOUNTS);
      return buildAction(true);
    }

    if (!authToken) {
      return buildAction(false, undefined, 'Sesiunea nu este valida. Reautentifica-te.');
    }

    try {
      const response = await fetch(`${AUTH_API_BASE}/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
      const payload = await parseApiResponse(response);

      if (!response.ok || payload.ok === false) {
        return buildAction(false, undefined, payload.error || 'Nu am putut incarca lista de utilizatori.');
      }

      setAccounts(parseRemoteAccounts(payload.accounts));
      return buildAction(true);
    } catch {
      return buildAction(false, undefined, 'Serviciul de utilizatori nu raspunde momentan.');
    }
  }, [authToken]);

  const createAccount = useCallback(async (input: CreateAccountInput): Promise<ActionResult> => {
    if (!REMOTE_AUTH_ENABLED) {
      return buildAction(false, undefined, 'Crearea de utilizatori este disponibila doar in modul remote.');
    }

    if (!authToken) {
      return buildAction(false, undefined, 'Sesiunea nu este valida. Reautentifica-te.');
    }

    try {
      const response = await fetch(`${AUTH_API_BASE}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(input),
      });
      const payload = await parseApiResponse(response);

      if (!response.ok || payload.ok === false) {
        return buildAction(false, undefined, payload.error || 'Nu am putut crea utilizatorul.');
      }

      await refreshAccounts();
      return buildAction(true, payload.message || 'Utilizator creat cu succes.');
    } catch {
      return buildAction(false, undefined, 'Serviciul de utilizatori nu raspunde momentan.');
    }
  }, [authToken, refreshAccounts]);

  const sendRoleNotification = useCallback(async (input: SendRoleNotificationInput): Promise<ActionResult> => {
    if (!REMOTE_AUTH_ENABLED) {
      return buildAction(false, undefined, 'Notificarile sunt disponibile doar in modul remote.');
    }

    if (!authToken) {
      return buildAction(false, undefined, 'Sesiunea nu este valida. Reautentifica-te.');
    }

    try {
      const response = await fetch(`${AUTH_API_BASE}/notify/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(input),
      });
      const payload = await parseApiResponse(response);

      if (!response.ok || payload.ok === false) {
        return buildAction(false, undefined, payload.error || 'Nu am putut trimite notificarea.');
      }

      return buildAction(true, payload.message || 'Notificare trimisa.');
    } catch {
      return buildAction(false, undefined, 'Serviciul de notificari nu raspunde momentan.');
    }
  }, [authToken]);

  const logout = useCallback(() => {
    setUser(null);
    setAuthToken(null);
    if (REMOTE_AUTH_ENABLED) {
      setAccounts([]);
    } else {
      setAccounts(AUTH_ACCOUNTS);
    }
    sessionStorage.removeItem(SESSION_USER_KEY);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
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
    refreshAccounts,
    createAccount,
    sendRoleNotification,
    logout,
    isAdmin,
    isEditor,
    isReviewer,
    isAuthor,
    canAccess,
    devInbox,
    authTransport: REMOTE_AUTH_ENABLED ? 'remote' as const : 'local' as const,
    authToken,
    accounts,
  }), [
    user,
    login,
    requestLoginCode,
    verifyLoginCode,
    refreshAccounts,
    createAccount,
    sendRoleNotification,
    logout,
    isAdmin,
    isEditor,
    isReviewer,
    isAuthor,
    canAccess,
    devInbox,
    authToken,
    accounts,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export type { AuthUser, UserRole, CreateAccountInput, SendRoleNotificationInput };
