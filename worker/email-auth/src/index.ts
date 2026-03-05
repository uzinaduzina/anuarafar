type UserRole = 'admin' | 'editor' | 'reviewer' | 'author';

interface AuthAccount {
  username: string;
  name: string;
  role: UserRole;
  email: string;
}

interface OtpEntry {
  email: string;
  codeHash: string;
  expiresAt: number;
}

interface Env {
  AUTH_KV: KVNamespace;
  RESEND_API_KEY: string;
  OTP_SECRET: string;
  RESEND_FROM: string;
  APP_NAME?: string;
  ALLOWED_ORIGINS?: string;
  OTP_TTL_SECONDS?: string;
  OTP_RATE_LIMIT_SECONDS?: string;
  AUTH_ACCOUNTS_JSON?: string;
  NOTIFY_API_KEY?: string;
}

const DEFAULT_ACCOUNTS: AuthAccount[] = [
  { username: 'admin', name: 'Administrator', role: 'admin', email: 'admin@iafar.ro' },
  { username: 'editor', name: 'Editor Principal', role: 'editor', email: 'editor@iafar.ro' },
  { username: 'reviewer', name: 'Reviewer Demo', role: 'reviewer', email: 'reviewer@iafar.ro' },
  { username: 'author', name: 'Autor Demo', role: 'author', email: 'author@iafar.ro' },
];

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function parseAccounts(env: Env): AuthAccount[] {
  if (!env.AUTH_ACCOUNTS_JSON) return DEFAULT_ACCOUNTS;
  try {
    const parsed = JSON.parse(env.AUTH_ACCOUNTS_JSON) as AuthAccount[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_ACCOUNTS;
    return parsed
      .filter((entry) => entry?.email && entry?.role && entry?.username && entry?.name)
      .map((entry) => ({
        ...entry,
        email: normalizeEmail(entry.email),
      }));
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

function findAccountByEmail(accounts: AuthAccount[], email: string) {
  const normalized = normalizeEmail(email);
  return accounts.find((entry) => normalizeEmail(entry.email) === normalized);
}

function getAllowedOrigins(env: Env): string[] {
  const raw = env.ALLOWED_ORIGINS || '';
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function pickCorsOrigin(request: Request, env: Env): string {
  const origin = request.headers.get('Origin');
  const allowedOrigins = getAllowedOrigins(env);

  if (!origin) return '*';
  if (allowedOrigins.length === 0) return origin;
  if (allowedOrigins.includes(origin)) return origin;

  return 'null';
}

function buildCorsHeaders(request: Request, env: Env): Headers {
  const origin = pickCorsOrigin(request, env);
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type,X-Admin-Token');
  headers.set('Access-Control-Max-Age', '86400');
  headers.set('Vary', 'Origin');
  return headers;
}

function jsonResponse(request: Request, env: Env, status: number, body: unknown) {
  const headers = buildCorsHeaders(request, env);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(body), { status, headers });
}

function textResponse(request: Request, env: Env, status: number, body: string) {
  const headers = buildCorsHeaders(request, env);
  headers.set('Content-Type', 'text/plain; charset=utf-8');
  return new Response(body, { status, headers });
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function sendEmail(env: Env, to: string[], subject: string, html: string, text?: string): Promise<Response> {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM,
      to,
      subject,
      html,
      text,
    }),
  });
}

async function handleRequestCode(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';

  if (!email) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Email invalid.' });
  }

  const accounts = parseAccounts(env);
  const account = findAccountByEmail(accounts, email);
  if (!account) {
    return jsonResponse(request, env, 404, { ok: false, error: 'Nu exista un cont asociat acestui email.' });
  }

  const rateLimitSeconds = parsePositiveInt(env.OTP_RATE_LIMIT_SECONDS, 60);
  const rateKey = `otp-rate:${email}`;
  const activeRate = await env.AUTH_KV.get(rateKey);
  if (activeRate) {
    return jsonResponse(request, env, 429, {
      ok: false,
      error: 'Ai solicitat deja un cod recent. Incearca din nou in cateva secunde.',
    });
  }

  const ttlSeconds = parsePositiveInt(env.OTP_TTL_SECONDS, 600);
  const code = generateCode();
  const expiresAt = Date.now() + ttlSeconds * 1000;
  const codeHash = await sha256Hex(`${email}:${code}:${env.OTP_SECRET}`);
  const otpEntry: OtpEntry = { email, codeHash, expiresAt };

  await env.AUTH_KV.put(`otp:${email}`, JSON.stringify(otpEntry), { expirationTtl: ttlSeconds });
  await env.AUTH_KV.put(rateKey, '1', { expirationTtl: rateLimitSeconds });

  const appName = env.APP_NAME || 'IAFAR Journal';
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
      <p>Salut, ${escapeHtml(account.name)}.</p>
      <p>Codul tau de autentificare pentru <strong>${escapeHtml(appName)}</strong> este:</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:4px;margin:8px 0">${escapeHtml(code)}</p>
      <p>Codul expira in ${Math.max(1, Math.round(ttlSeconds / 60))} minute.</p>
      <p style="color:#6b7280;font-size:12px">Daca nu ai cerut acest cod, ignora mesajul.</p>
    </div>
  `.trim();

  const sendResult = await sendEmail(
    env,
    [email],
    `${appName} - cod de autentificare`,
    html,
    `Codul tau de autentificare este ${code}. Expira in ${Math.max(1, Math.round(ttlSeconds / 60))} minute.`,
  );

  if (!sendResult.ok) {
    const errorBody = await sendResult.text();
    console.error('Resend send failed', sendResult.status, errorBody);
    return jsonResponse(request, env, 502, { ok: false, error: 'Nu am putut trimite emailul de autentificare.' });
  }

  return jsonResponse(request, env, 200, {
    ok: true,
    message: `Codul de autentificare a fost trimis catre ${email}.`,
  });
}

async function handleVerifyCode(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';
  const code = typeof body.code === 'string' ? body.code.trim() : '';

  if (!email || !/^\d{6}$/.test(code)) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Date de autentificare invalide.' });
  }

  const accounts = parseAccounts(env);
  const account = findAccountByEmail(accounts, email);
  if (!account) {
    return jsonResponse(request, env, 404, { ok: false, error: 'Contul nu exista.' });
  }

  const rawEntry = await env.AUTH_KV.get(`otp:${email}`);
  if (!rawEntry) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Codul a expirat. Solicita un cod nou.' });
  }

  let storedEntry: OtpEntry | null = null;
  try {
    storedEntry = JSON.parse(rawEntry) as OtpEntry;
  } catch {
    storedEntry = null;
  }

  if (!storedEntry || storedEntry.expiresAt <= Date.now()) {
    await env.AUTH_KV.delete(`otp:${email}`);
    return jsonResponse(request, env, 400, { ok: false, error: 'Codul a expirat. Solicita un cod nou.' });
  }

  const expectedHash = await sha256Hex(`${email}:${code}:${env.OTP_SECRET}`);
  if (expectedHash !== storedEntry.codeHash) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Cod invalid. Verifica emailul si incearca din nou.' });
  }

  await env.AUTH_KV.delete(`otp:${email}`);

  return jsonResponse(request, env, 200, {
    ok: true,
    message: 'Autentificare reusita.',
    user: account,
  });
}

async function handleNotifyRole(request: Request, env: Env): Promise<Response> {
  const providedToken = request.headers.get('X-Admin-Token') || request.headers.get('x-admin-token');
  if (!env.NOTIFY_API_KEY || providedToken !== env.NOTIFY_API_KEY) {
    return jsonResponse(request, env, 401, { ok: false, error: 'Neautorizat.' });
  }

  const body = await readJson(request);
  const role = typeof body.role === 'string' ? body.role.trim().toLowerCase() : 'all';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!subject || !message) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Subject si mesaj sunt obligatorii.' });
  }

  const accounts = parseAccounts(env);
  const recipients = role === 'all'
    ? accounts
    : accounts.filter((entry) => entry.role === role);

  if (recipients.length === 0) {
    return jsonResponse(request, env, 404, { ok: false, error: 'Nu exista destinatari pentru rolul selectat.' });
  }

  const html = `<div style="font-family:Arial,sans-serif;white-space:pre-wrap;line-height:1.5">${escapeHtml(message)}</div>`;
  const failures: string[] = [];
  for (const recipient of recipients) {
    const sendResult = await sendEmail(
      env,
      [normalizeEmail(recipient.email)],
      subject,
      html,
      message,
    );
    if (!sendResult.ok) {
      const errorBody = await sendResult.text();
      console.error('Resend notify failed', sendResult.status, recipient.email, errorBody);
      failures.push(recipient.email);
    }
  }

  if (failures.length > 0) {
    return jsonResponse(request, env, 502, { ok: false, error: 'Nu am putut trimite notificarile pe email.' });
  }

  return jsonResponse(request, env, 200, {
    ok: true,
    message: `Notificare trimisa catre ${recipients.length} utilizatori.`,
    recipients: recipients.map((entry) => entry.email),
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: buildCorsHeaders(request, env) });
    }

    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return jsonResponse(request, env, 200, { ok: true, status: 'healthy' });
    }

    if (request.method === 'POST' && url.pathname === '/auth/request-code') {
      return handleRequestCode(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/auth/verify-code') {
      return handleVerifyCode(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/notify/role') {
      return handleNotifyRole(request, env);
    }

    return textResponse(request, env, 404, 'Not found');
  },
};
