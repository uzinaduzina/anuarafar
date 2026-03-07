import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { AUTH_ACCOUNTS, type AuthAccount, type UserRole } from '@/data/authUsers';
import { fetchAdminAnalyticsDashboard, type AnalyticsDashboardData } from '@/lib/analytics';

type AuthUser = AuthAccount;
type AuthTransport = 'local' | 'remote';
type NotificationRole = UserRole | 'all';

interface CreateAccountInput {
  name: string;
  email: string;
  role: UserRole;
  username?: string;
}

interface GeneratedCredentials {
  username: string;
  password: string;
  email: string;
}

interface SendRoleNotificationInput {
  role: NotificationRole;
  subject: string;
  message: string;
}

interface EmailTemplateFields {
  subject: string;
  heading: string;
  greeting: string;
  intro: string;
  note: string;
  action: string;
  footer: string;
}

interface ManagedEmailTemplate {
  id: string;
  label: string;
  description: string;
  placeholders: string[];
  defaults: EmailTemplateFields;
  custom: Partial<EmailTemplateFields>;
  effective: EmailTemplateFields;
}

interface PersistedSession {
  user: AuthUser;
  token: string | null;
  expiresAt: number;
}

interface ActionResult {
  ok: boolean;
  message?: string;
  error?: string;
}

interface CreateAccountActionResult extends ActionResult {
  account?: AuthAccount;
  credentials?: GeneratedCredentials;
}

interface TemplateActionResult extends ActionResult {
  templates?: ManagedEmailTemplate[];
  template?: ManagedEmailTemplate;
}

interface AnalyticsActionResult extends ActionResult {
  analytics?: AnalyticsDashboardData;
}

interface ApiAuthResponse {
  ok?: boolean;
  message?: string;
  error?: string;
  token?: string;
  user?: AuthUser;
  account?: AuthAccount;
  accounts?: AuthAccount[];
  templates?: ManagedEmailTemplate[];
  template?: ManagedEmailTemplate;
  credentials?: GeneratedCredentials;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser, token?: string | null) => void;
  requestLoginCode: (email: string, password?: string) => Promise<ActionResult>;
  loginWithPassword: (identifier: string, password: string) => Promise<ActionResult>;
  verifyLoginCode: (email: string, code: string) => Promise<ActionResult>;
  refreshAccounts: () => Promise<ActionResult>;
  createAccount: (input: CreateAccountInput) => Promise<CreateAccountActionResult>;
  sendRoleNotification: (input: SendRoleNotificationInput) => Promise<ActionResult>;
  fetchEmailTemplates: () => Promise<TemplateActionResult>;
  updateEmailTemplate: (id: string, template: Partial<EmailTemplateFields>) => Promise<TemplateActionResult>;
  resetEmailTemplate: (id: string) => Promise<TemplateActionResult>;
  fetchAnalyticsDashboard: () => Promise<AnalyticsActionResult>;
  logout: () => void;
  isAdmin: boolean;
  isEditor: boolean;
  isReviewer: boolean;
  isAuthor: boolean;
  canAccess: (roles: UserRole[]) => boolean;
  authTransport: AuthTransport;
  authToken: string | null;
  accounts: AuthAccount[];
}

const SESSION_USER_KEY = 'auth_user';
const SESSION_TOKEN_KEY = 'auth_session_token';
const AUTH_SESSION_KEY = 'auth_session_v2';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function buildAction(ok: boolean, message?: string, error?: string): ActionResult {
  return { ok, message, error };
}

function buildTemplateAction(ok: boolean, message?: string, error?: string): TemplateActionResult {
  return { ok, message, error };
}

function buildCreateAccountAction(
  ok: boolean,
  message?: string,
  error?: string,
  account?: AuthAccount,
  credentials?: GeneratedCredentials,
): CreateAccountActionResult {
  return { ok, message, error, account, credentials };
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

function isGeneratedCredentials(value: unknown): value is GeneratedCredentials {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<GeneratedCredentials>;
  return typeof candidate.username === 'string'
    && typeof candidate.password === 'string'
    && typeof candidate.email === 'string';
}

function isEmailTemplateFields(value: unknown): value is EmailTemplateFields {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<EmailTemplateFields>;
  return typeof candidate.subject === 'string'
    && typeof candidate.heading === 'string'
    && typeof candidate.greeting === 'string'
    && typeof candidate.intro === 'string'
    && typeof candidate.note === 'string'
    && typeof candidate.action === 'string'
    && typeof candidate.footer === 'string';
}

function parseRemoteEmailTemplates(templates: unknown): ManagedEmailTemplate[] {
  if (!Array.isArray(templates)) return [];
  return templates
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => {
      const candidate = entry as Partial<ManagedEmailTemplate>;
      const defaults = isEmailTemplateFields(candidate.defaults)
        ? candidate.defaults
        : {
            subject: '',
            heading: '',
            greeting: '',
            intro: '',
            note: '',
            action: '',
            footer: '',
          };
      const effective = isEmailTemplateFields(candidate.effective)
        ? candidate.effective
        : defaults;
      const customRaw = candidate.custom && typeof candidate.custom === 'object'
        ? candidate.custom as Partial<EmailTemplateFields>
        : {};
      const custom: Partial<EmailTemplateFields> = {};
      for (const key of ['subject', 'heading', 'greeting', 'intro', 'note', 'action', 'footer'] as const) {
        if (typeof customRaw[key] === 'string') custom[key] = customRaw[key];
      }
      return {
        id: typeof candidate.id === 'string' ? candidate.id : '',
        label: typeof candidate.label === 'string' ? candidate.label : '',
        description: typeof candidate.description === 'string' ? candidate.description : '',
        placeholders: Array.isArray(candidate.placeholders)
          ? candidate.placeholders.filter((item): item is string => typeof item === 'string')
          : [],
        defaults,
        custom,
        effective,
      };
    })
    .filter((entry) => entry.id.length > 0);
}

function parseTokenExpiry(token: string): number | null {
  const payloadPart = token.split('.')[0];
  if (!payloadPart) return null;
  try {
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    if (typeof payload.exp === 'number' && Number.isFinite(payload.exp)) {
      return payload.exp;
    }
    return null;
  } catch {
    return null;
  }
}

function clearPersistedSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

function persistSession(session: PersistedSession) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

function readPersistedSession(): PersistedSession | null {
  const now = Date.now();
  const stored = safeJsonParse<PersistedSession | null>(localStorage.getItem(AUTH_SESSION_KEY), null);
  if (stored && isAuthUser(stored.user) && typeof stored.expiresAt === 'number') {
    if (stored.expiresAt > now) {
      return {
        user: stored.user,
        token: typeof stored.token === 'string' ? stored.token : null,
        expiresAt: stored.expiresAt,
      };
    }
    clearPersistedSession();
  }

  const legacyUser = safeJsonParse<AuthUser | null>(sessionStorage.getItem(SESSION_USER_KEY), null);
  const legacyToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
  if (legacyUser && isAuthUser(legacyUser)) {
    const fallbackExpiry = legacyToken ? parseTokenExpiry(legacyToken) : null;
    const next: PersistedSession = {
      user: legacyUser,
      token: legacyToken || null,
      expiresAt: fallbackExpiry && fallbackExpiry > now ? fallbackExpiry : now + SESSION_TTL_MS,
    };
    persistSession(next);
    sessionStorage.removeItem(SESSION_USER_KEY);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    return next;
  }

  return null;
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
  loginWithPassword: async () => buildAction(false),
  verifyLoginCode: async () => buildAction(false),
  refreshAccounts: async () => buildAction(false),
  createAccount: async () => buildCreateAccountAction(false),
  sendRoleNotification: async () => buildAction(false),
  fetchEmailTemplates: async () => buildTemplateAction(false),
  updateEmailTemplate: async () => buildTemplateAction(false),
  resetEmailTemplate: async () => buildTemplateAction(false),
  fetchAnalyticsDashboard: async () => buildAction(false),
  logout: () => {},
  isAdmin: false,
  isEditor: false,
  isReviewer: false,
  isAuthor: false,
  canAccess: () => false,
  authTransport: 'local',
  authToken: null,
  accounts: AUTH_ACCOUNTS,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialSession = readPersistedSession();
  const [user, setUser] = useState<AuthUser | null>(() => initialSession?.user || null);
  const [authToken, setAuthToken] = useState<string | null>(() => initialSession?.token || null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(() => initialSession?.expiresAt || null);
  const [accounts, setAccounts] = useState<AuthAccount[]>(() => (REMOTE_AUTH_ENABLED ? [] : AUTH_ACCOUNTS));

  const login = useCallback((nextUser: AuthUser, token?: string | null) => {
    const now = Date.now();
    const normalizedToken = token || null;
    const tokenExpiry = normalizedToken ? parseTokenExpiry(normalizedToken) : null;
    const expiresAt = tokenExpiry && tokenExpiry > now ? tokenExpiry : now + SESSION_TTL_MS;

    setUser(nextUser);
    setAuthToken(normalizedToken);
    setSessionExpiresAt(expiresAt);
    persistSession({ user: nextUser, token: normalizedToken, expiresAt });
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

    return buildAction(
      false,
      undefined,
      'Autentificarea cu cod necesita serviciul email-auth (VITE_AUTH_API_BASE configurat).',
    );
  }, []);

  const loginWithPassword = useCallback(async (identifier: string, password: string): Promise<ActionResult> => {
    const normalizedIdentifier = identifier.trim();
    if (!normalizedIdentifier) {
      return buildAction(false, undefined, 'Utilizatorul sau emailul este obligatoriu.');
    }
    if (!password) {
      return buildAction(false, undefined, 'Parola este obligatorie.');
    }

    if (REMOTE_AUTH_ENABLED) {
      try {
        const response = await fetch(`${AUTH_API_BASE}/auth/login-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: normalizedIdentifier, password }),
        });
        const payload = await parseApiResponse(response);

        if (!response.ok || payload.ok === false || !isAuthUser(payload.user)) {
          return buildAction(false, undefined, payload.error || 'Autentificare esuata.');
        }

        login(payload.user, typeof payload.token === 'string' ? payload.token : null);
        return buildAction(true, payload.message || 'Autentificare reusita.');
      } catch {
        return buildAction(false, undefined, 'Serviciul de autentificare nu raspunde momentan.');
      }
    }

    const lookupEmail = normalizedIdentifier.includes('@') ? normalizeEmail(normalizedIdentifier) : '';
    const account = AUTH_ACCOUNTS.find((entry) => (
      entry.username.toLowerCase() === normalizedIdentifier.toLowerCase()
      || entry.email.toLowerCase() === lookupEmail
    ));
    if (!account) {
      return buildAction(false, undefined, 'Contul nu exista.');
    }

    const nextUser: AuthUser = {
      username: account.username,
      name: account.name,
      role: account.role,
      email: account.email,
    };
    login(nextUser, null);
    return buildAction(true, 'Autentificare reusita.');
  }, [login]);

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

    return buildAction(
      false,
      undefined,
      'Verificarea codului necesita serviciul email-auth (VITE_AUTH_API_BASE configurat).',
    );
  }, [login]);

  const refreshAccounts = useCallback(async (): Promise<ActionResult> => {
    if (!REMOTE_AUTH_ENABLED) {
      setAccounts(AUTH_ACCOUNTS);
      return buildAction(true);
    }

    if (!authToken || !sessionExpiresAt || sessionExpiresAt <= Date.now()) {
      setUser(null);
      setAuthToken(null);
      setSessionExpiresAt(null);
      setAccounts([]);
      clearPersistedSession();
      return buildAction(false, undefined, 'Sesiunea a expirat. Reautentifica-te.');
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
  }, [authToken, sessionExpiresAt]);

  const createAccount = useCallback(async (input: CreateAccountInput): Promise<CreateAccountActionResult> => {
    if (!REMOTE_AUTH_ENABLED) {
      return buildCreateAccountAction(false, undefined, 'Crearea de utilizatori este disponibila doar in modul remote.');
    }

    if (!authToken || !sessionExpiresAt || sessionExpiresAt <= Date.now()) {
      setUser(null);
      setAuthToken(null);
      setSessionExpiresAt(null);
      setAccounts([]);
      clearPersistedSession();
      return buildCreateAccountAction(false, undefined, 'Sesiunea a expirat. Reautentifica-te.');
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
        return buildCreateAccountAction(false, undefined, payload.error || 'Nu am putut crea utilizatorul.');
      }

      await refreshAccounts();
      const account = isAuthUser(payload.account)
        ? {
            username: payload.account.username,
            name: payload.account.name,
            role: payload.account.role,
            email: normalizeEmail(payload.account.email),
          }
        : undefined;
      const credentials = isGeneratedCredentials(payload.credentials)
        ? {
            username: payload.credentials.username,
            password: payload.credentials.password,
            email: normalizeEmail(payload.credentials.email),
          }
        : undefined;
      return buildCreateAccountAction(
        true,
        payload.message || 'Utilizator creat cu succes.',
        undefined,
        account,
        credentials,
      );
    } catch {
      return buildCreateAccountAction(false, undefined, 'Serviciul de utilizatori nu raspunde momentan.');
    }
  }, [authToken, refreshAccounts, sessionExpiresAt]);

  const sendRoleNotification = useCallback(async (input: SendRoleNotificationInput): Promise<ActionResult> => {
    if (!REMOTE_AUTH_ENABLED) {
      return buildAction(false, undefined, 'Notificarile sunt disponibile doar in modul remote.');
    }

    if (!authToken || !sessionExpiresAt || sessionExpiresAt <= Date.now()) {
      setUser(null);
      setAuthToken(null);
      setSessionExpiresAt(null);
      setAccounts([]);
      clearPersistedSession();
      return buildAction(false, undefined, 'Sesiunea a expirat. Reautentifica-te.');
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
  }, [authToken, sessionExpiresAt]);

  const fetchEmailTemplates = useCallback(async (): Promise<TemplateActionResult> => {
    if (!REMOTE_AUTH_ENABLED) {
      return buildTemplateAction(false, undefined, 'Template-urile sunt disponibile doar in modul remote.');
    }

    if (!authToken || !sessionExpiresAt || sessionExpiresAt <= Date.now()) {
      setUser(null);
      setAuthToken(null);
      setSessionExpiresAt(null);
      setAccounts([]);
      clearPersistedSession();
      return buildTemplateAction(false, undefined, 'Sesiunea a expirat. Reautentifica-te.');
    }

    try {
      const response = await fetch(`${AUTH_API_BASE}/admin/email-templates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
      const payload = await parseApiResponse(response);
      const templates = parseRemoteEmailTemplates(payload.templates);
      if (!response.ok || payload.ok === false) {
        return buildTemplateAction(false, undefined, payload.error || 'Nu am putut incarca template-urile.');
      }
      return {
        ok: true,
        message: payload.message,
        templates,
      };
    } catch {
      return buildTemplateAction(false, undefined, 'Serviciul de template-uri nu raspunde momentan.');
    }
  }, [authToken, sessionExpiresAt]);

  const updateEmailTemplate = useCallback(async (
    id: string,
    template: Partial<EmailTemplateFields>,
  ): Promise<TemplateActionResult> => {
    if (!REMOTE_AUTH_ENABLED) {
      return buildTemplateAction(false, undefined, 'Template-urile sunt disponibile doar in modul remote.');
    }

    if (!authToken || !sessionExpiresAt || sessionExpiresAt <= Date.now()) {
      setUser(null);
      setAuthToken(null);
      setSessionExpiresAt(null);
      setAccounts([]);
      clearPersistedSession();
      return buildTemplateAction(false, undefined, 'Sesiunea a expirat. Reautentifica-te.');
    }

    try {
      const response = await fetch(`${AUTH_API_BASE}/admin/email-templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ id, template }),
      });
      const payload = await parseApiResponse(response);
      const parsedTemplate = payload.template && typeof payload.template === 'object'
        ? parseRemoteEmailTemplates([payload.template])[0]
        : undefined;

      if (!response.ok || payload.ok === false) {
        return buildTemplateAction(false, undefined, payload.error || 'Nu am putut salva template-ul.');
      }

      return {
        ok: true,
        message: payload.message || 'Template salvat.',
        template: parsedTemplate,
      };
    } catch {
      return buildTemplateAction(false, undefined, 'Serviciul de template-uri nu raspunde momentan.');
    }
  }, [authToken, sessionExpiresAt]);

  const resetEmailTemplate = useCallback(async (id: string): Promise<TemplateActionResult> => {
    if (!REMOTE_AUTH_ENABLED) {
      return buildTemplateAction(false, undefined, 'Template-urile sunt disponibile doar in modul remote.');
    }

    if (!authToken || !sessionExpiresAt || sessionExpiresAt <= Date.now()) {
      setUser(null);
      setAuthToken(null);
      setSessionExpiresAt(null);
      setAccounts([]);
      clearPersistedSession();
      return buildTemplateAction(false, undefined, 'Sesiunea a expirat. Reautentifica-te.');
    }

    try {
      const response = await fetch(`${AUTH_API_BASE}/admin/email-templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ id, reset: true }),
      });
      const payload = await parseApiResponse(response);
      const parsedTemplate = payload.template && typeof payload.template === 'object'
        ? parseRemoteEmailTemplates([payload.template])[0]
        : undefined;

      if (!response.ok || payload.ok === false) {
        return buildTemplateAction(false, undefined, payload.error || 'Nu am putut reseta template-ul.');
      }

      return {
        ok: true,
        message: payload.message || 'Template resetat.',
        template: parsedTemplate,
      };
    } catch {
      return buildTemplateAction(false, undefined, 'Serviciul de template-uri nu raspunde momentan.');
    }
  }, [authToken, sessionExpiresAt]);

  const fetchAnalyticsDashboard = useCallback(async (): Promise<AnalyticsActionResult> => {
    if (!REMOTE_AUTH_ENABLED) {
      return buildAction(false, undefined, 'Statisticile sunt disponibile doar in modul remote.');
    }

    if (!authToken || !sessionExpiresAt || sessionExpiresAt <= Date.now()) {
      setUser(null);
      setAuthToken(null);
      setSessionExpiresAt(null);
      setAccounts([]);
      clearPersistedSession();
      return buildAction(false, undefined, 'Sesiunea a expirat. Reautentifica-te.');
    }

    try {
      const analytics = await fetchAdminAnalyticsDashboard(authToken);
      return {
        ok: true,
        analytics,
      };
    } catch (error) {
      return buildAction(false, undefined, error instanceof Error ? error.message : 'Nu am putut incarca statisticile.');
    }
  }, [authToken, sessionExpiresAt]);

  const logout = useCallback(() => {
    setUser(null);
    setAuthToken(null);
    setSessionExpiresAt(null);
    if (REMOTE_AUTH_ENABLED) {
      setAccounts([]);
    } else {
      setAccounts(AUTH_ACCOUNTS);
    }
    clearPersistedSession();
    sessionStorage.removeItem(SESSION_USER_KEY);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
  }, []);

  const isAdmin = user?.role === 'admin';
  const isEditor = user?.role === 'admin' || user?.role === 'editor';
  const isReviewer = user?.role === 'reviewer';
  const isAuthor = user?.role === 'author';

  const canAccess = useCallback((roles: UserRole[]) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return roles.includes(user.role);
  }, [user]);

  const value = useMemo(() => ({
    user,
    login,
    requestLoginCode,
    loginWithPassword,
    verifyLoginCode,
    refreshAccounts,
    createAccount,
    sendRoleNotification,
    fetchEmailTemplates,
    updateEmailTemplate,
    resetEmailTemplate,
    fetchAnalyticsDashboard,
    logout,
    isAdmin,
    isEditor,
    isReviewer,
    isAuthor,
    canAccess,
    authTransport: REMOTE_AUTH_ENABLED ? 'remote' as const : 'local' as const,
    authToken,
    accounts,
  }), [
    user,
    login,
    requestLoginCode,
    loginWithPassword,
    verifyLoginCode,
    refreshAccounts,
    createAccount,
    sendRoleNotification,
    fetchEmailTemplates,
    updateEmailTemplate,
    resetEmailTemplate,
    fetchAnalyticsDashboard,
    logout,
    isAdmin,
    isEditor,
    isReviewer,
    isAuthor,
    canAccess,
    authToken,
    accounts,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export type {
  AuthUser,
  UserRole,
  CreateAccountInput,
  SendRoleNotificationInput,
  EmailTemplateFields,
  ManagedEmailTemplate,
};
