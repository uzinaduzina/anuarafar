type UserRole = 'admin' | 'editor' | 'reviewer' | 'author';

interface AuthAccount {
  username: string;
  name: string;
  role: UserRole;
  email: string;
}

interface StoredUser extends AuthAccount {
  passwordHash?: string;
  createdAt: number;
}

interface OtpEntry {
  email: string;
  codeHash: string;
  expiresAt: number;
}

interface SessionPayload {
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

interface EmailAttachment {
  filename: string;
  content: string;
  content_type?: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailTemplateDetail {
  label: string;
  value: string;
}

interface BuildEmailTemplateInput {
  subject: string;
  heading: string;
  greeting?: string;
  intro: string;
  details?: EmailTemplateDetail[];
  note?: string;
  action?: string;
  footer?: string;
}

type SubmissionStatus = 'submitted' | 'anonymization' | 'under_review' | 'decision_pending' | 'accepted' | 'rejected' | 'revision_requested';

interface StoredSubmissionFile {
  id: string;
  filename: string;
  size: number;
  contentType?: string;
  storageKey: string;
}

interface StoredSubmission {
  id: string;
  title: string;
  authors: string;
  email: string;
  affiliation: string;
  abstract: string;
  keywords_ro: string;
  keywords_en: string;
  date_submitted: string;
  status: SubmissionStatus;
  assigned_reviewer: string;
  assigned_reviewer_email: string;
  assigned_reviewer_2: string;
  assigned_reviewer_email_2: string;
  reviewer_deadline: string;
  reviewer_deadline_2: string;
  recommendation: string;
  recommendation_2: string;
  review_notes: string;
  review_notes_2: string;
  reviewed_at: string;
  reviewed_at_2: string;
  decision: string;
  files: StoredSubmissionFile[];
  anonymized_files: StoredSubmissionFile[];
  anonymized_at: string;
  createdAt: number;
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
  SESSION_TTL_SECONDS?: string;
  SUBMISSION_RECIPIENTS?: string;
  AUTH_ACCOUNTS_JSON?: string;
  ADMIN_PASSWORD_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  NOTIFY_API_KEY?: string;
}

const USERS_KEY = 'auth_users_v1';
const SUBMISSIONS_KEY = 'submissions_v1';
const SUBMISSION_FILE_KEY_PREFIX = 'submission_file_v1:';
const DEFAULT_OTP_TTL_SECONDS = 30 * 24 * 60 * 60;
const DEFAULT_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const DEFAULT_SUBMISSION_RECIPIENTS = ['anuar@iafar.ro', 'confafar@gmail.com'];
const MAX_SUBMISSION_FILES = 5;
const MAX_SUBMISSION_FILE_BYTES = 20 * 1024 * 1024;
const MAX_SUBMISSION_TOTAL_BYTES = 25 * 1024 * 1024;

const DEFAULT_ACCOUNTS: AuthAccount[] = [
  { username: 'admin', name: 'Liviu Pop', role: 'admin', email: 'liviu.o.pop@gmail.com' },
  { username: 'editor', name: 'Editor Principal', role: 'editor', email: 'editor@iafar.ro' },
  { username: 'reviewer1', name: 'Reviewer 1', role: 'reviewer', email: 'reviewer1@iafar.ro' },
  { username: 'reviewer2', name: 'Reviewer 2', role: 'reviewer', email: 'reviewer2@iafar.ro' },
];

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const parsed = Number(asString(raw));
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function isUserRole(value: string): value is UserRole {
  return value === 'admin' || value === 'editor' || value === 'reviewer' || value === 'author';
}

function sanitizeUsername(raw: string, fallbackEmail: string): string {
  const source = raw || fallbackEmail.split('@')[0] || 'user';
  const normalized = source
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/^[._-]+/, '')
    .replace(/[._-]+$/, '');
  return normalized || `user-${Date.now()}`;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseSubmissionRecipients(env: Env): string[] {
  const configured = asString(env.SUBMISSION_RECIPIENTS)
    .split(',')
    .map((entry) => normalizeEmail(entry))
    .filter((entry) => isValidEmail(entry));

  if (configured.length > 0) return configured;
  return DEFAULT_SUBMISSION_RECIPIENTS;
}

function hasAllowedSubmissionFileExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return lower.endsWith('.doc') || lower.endsWith('.docx') || lower.endsWith('.pdf');
}

function isSubmissionStatus(value: string): value is SubmissionStatus {
  return value === 'submitted'
    || value === 'anonymization'
    || value === 'under_review'
    || value === 'decision_pending'
    || value === 'accepted'
    || value === 'rejected'
    || value === 'revision_requested';
}

function sanitizeFileName(fileName: string): string {
  const trimmed = fileName.trim();
  if (!trimmed) return 'attachment.bin';
  const sanitized = trimmed.replace(/[^\w.\-() ]/g, '_').replace(/\s+/g, ' ');
  return sanitized || 'attachment.bin';
}

function guessContentType(fileName: string, fallback?: string): string | undefined {
  if (fallback && fallback.length > 0) return fallback;
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.doc')) return 'application/msword';
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  return undefined;
}

function arrayBufferToBase64(value: ArrayBuffer): string {
  const bytes = new Uint8Array(value);
  let binary = '';
  const chunkSize = 0x2000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function base64ToUint8Array(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function parseAccounts(env: Env): AuthAccount[] {
  const mergeWithDefaults = (accounts: AuthAccount[]): AuthAccount[] => {
    const byEmail = new Map<string, AuthAccount>();
    for (const account of DEFAULT_ACCOUNTS) {
      byEmail.set(normalizeEmail(account.email), account);
    }
    for (const account of accounts) {
      byEmail.set(normalizeEmail(account.email), account);
    }
    return [...byEmail.values()];
  };

  if (typeof env.AUTH_ACCOUNTS_JSON !== 'string' || env.AUTH_ACCOUNTS_JSON.length === 0) {
    return mergeWithDefaults([]);
  }
  try {
    const parsed = JSON.parse(env.AUTH_ACCOUNTS_JSON) as Array<Partial<AuthAccount>>;
    if (!Array.isArray(parsed) || parsed.length === 0) return mergeWithDefaults([]);
    const cleaned = parsed
      .filter((entry) => {
        if (!entry.email || !entry.role || !entry.username || !entry.name) return false;
        return isUserRole(entry.role);
      })
      .map((entry) => ({
        username: sanitizeUsername(asString(entry.username), asString(entry.email)),
        name: asString(entry.name).trim(),
        role: asString(entry.role) as UserRole,
        email: normalizeEmail(asString(entry.email)),
      }));
    return mergeWithDefaults(cleaned);
  } catch {
    return mergeWithDefaults([]);
  }
}

function toAccount(user: StoredUser): AuthAccount {
  return {
    username: user.username,
    name: user.name,
    role: user.role,
    email: normalizeEmail(user.email),
  };
}

function buildAuthorAccountFromEmail(email: string): AuthAccount {
  const normalizedEmail = normalizeEmail(email);
  return {
    username: sanitizeUsername(normalizedEmail.split('@')[0] || 'author', normalizedEmail),
    name: normalizedEmail,
    role: 'author',
    email: normalizedEmail,
  };
}

function parseStoredUsers(raw: string | null): StoredUser[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<Partial<StoredUser>>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry) => {
        if (!entry?.email || !entry?.username || !entry?.name || !entry?.role) return false;
        return isUserRole(asString(entry.role));
      })
      .map((entry) => ({
        username: sanitizeUsername(asString(entry.username), asString(entry.email)),
        name: asString(entry.name).trim(),
        role: asString(entry.role) as UserRole,
        email: normalizeEmail(asString(entry.email)),
        passwordHash: asString(entry.passwordHash) || undefined,
        createdAt: Number(entry.createdAt) || Date.now(),
      }));
  } catch {
    return [];
  }
}

async function writeUsers(env: Env, users: StoredUser[]) {
  await env.AUTH_KV.put(USERS_KEY, JSON.stringify(users));
}

async function readUsers(env: Env): Promise<StoredUser[]> {
  const rawUsers = await env.AUTH_KV.get(USERS_KEY);
  const parsedUsers = parseStoredUsers(rawUsers);
  const expectedAccounts = parseAccounts(env);

  if (parsedUsers.length > 0) {
    const usersByEmail = new Map(parsedUsers.map((entry) => [normalizeEmail(entry.email), entry]));
    let changed = false;
    for (const account of expectedAccounts) {
      const accountEmail = normalizeEmail(account.email);
      if (usersByEmail.has(accountEmail)) continue;
      usersByEmail.set(accountEmail, {
        ...account,
        email: accountEmail,
        createdAt: Date.now(),
      });
      changed = true;
    }
    const mergedUsers = [...usersByEmail.values()];
    if (changed) {
      await writeUsers(env, mergedUsers);
    }
    return mergedUsers;
  }

  const seededUsers: StoredUser[] = expectedAccounts.map((account) => ({
    ...account,
    email: normalizeEmail(account.email),
    createdAt: Date.now(),
  }));

  await writeUsers(env, seededUsers);
  return seededUsers;
}

function parseStoredSubmissions(raw: string | null): StoredSubmission[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<Partial<StoredSubmission>>;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((entry) => Boolean(entry && entry.id && entry.title && entry.email && entry.date_submitted))
      .map((entry) => {
        const statusRaw = asString(entry.status);
        const filesRaw = Array.isArray(entry.files) ? entry.files : [];
        const anonymizedFilesRaw = Array.isArray(entry.anonymized_files) ? entry.anonymized_files : [];
        const files: StoredSubmissionFile[] = filesRaw
          .filter((item) => {
            if (!item || typeof item !== 'object') return false;
            const candidate = item as Partial<StoredSubmissionFile>;
            return Boolean(candidate.id && candidate.filename && candidate.storageKey);
          })
          .map((item) => {
            const candidate = item as Partial<StoredSubmissionFile>;
            return {
              id: asString(candidate.id),
              filename: sanitizeFileName(asString(candidate.filename)),
              size: Number(candidate.size) || 0,
              contentType: asString(candidate.contentType) || undefined,
              storageKey: asString(candidate.storageKey),
            };
          });
        const anonymizedFiles: StoredSubmissionFile[] = anonymizedFilesRaw
          .filter((item) => {
            if (!item || typeof item !== 'object') return false;
            const candidate = item as Partial<StoredSubmissionFile>;
            return Boolean(candidate.id && candidate.filename && candidate.storageKey);
          })
          .map((item) => {
            const candidate = item as Partial<StoredSubmissionFile>;
            return {
              id: asString(candidate.id),
              filename: sanitizeFileName(asString(candidate.filename)),
              size: Number(candidate.size) || 0,
              contentType: asString(candidate.contentType) || undefined,
              storageKey: asString(candidate.storageKey),
            };
          });

        return {
          id: asString(entry.id),
          title: asString(entry.title).trim(),
          authors: asString(entry.authors).trim(),
          email: normalizeEmail(asString(entry.email)),
          affiliation: asString(entry.affiliation).trim(),
          abstract: asString(entry.abstract).trim(),
          keywords_ro: asString(entry.keywords_ro).trim(),
          keywords_en: asString(entry.keywords_en).trim(),
          date_submitted: asString(entry.date_submitted),
          status: isSubmissionStatus(statusRaw) ? statusRaw : 'submitted',
          assigned_reviewer: asString(entry.assigned_reviewer).trim(),
          assigned_reviewer_email: normalizeEmail(asString(entry.assigned_reviewer_email)),
          assigned_reviewer_2: asString(entry.assigned_reviewer_2).trim(),
          assigned_reviewer_email_2: normalizeEmail(asString(entry.assigned_reviewer_email_2)),
          reviewer_deadline: asString(entry.reviewer_deadline),
          reviewer_deadline_2: asString(entry.reviewer_deadline_2),
          recommendation: asString(entry.recommendation).trim(),
          recommendation_2: asString(entry.recommendation_2).trim(),
          review_notes: asString(entry.review_notes).trim(),
          review_notes_2: asString(entry.review_notes_2).trim(),
          reviewed_at: asString(entry.reviewed_at),
          reviewed_at_2: asString(entry.reviewed_at_2),
          decision: asString(entry.decision).trim(),
          files,
          anonymized_files: anonymizedFiles,
          anonymized_at: asString(entry.anonymized_at),
          createdAt: Number(entry.createdAt) || Date.now(),
        };
      });
  } catch {
    return [];
  }
}

async function readSubmissions(env: Env): Promise<StoredSubmission[]> {
  const raw = await env.AUTH_KV.get(SUBMISSIONS_KEY);
  return parseStoredSubmissions(raw);
}

async function writeSubmissions(env: Env, submissions: StoredSubmission[]) {
  await env.AUTH_KV.put(SUBMISSIONS_KEY, JSON.stringify(submissions));
}

async function storeSubmissionFiles(
  env: Env,
  submissionId: string,
  uploadedFiles: File[],
  keyPrefix: string,
): Promise<StoredSubmissionFile[]> {
  let totalSize = 0;
  const storedFiles: StoredSubmissionFile[] = [];

  for (const file of uploadedFiles) {
    const safeFileName = sanitizeFileName(file.name || 'attachment.bin');
    if (!hasAllowedSubmissionFileExtension(safeFileName)) {
      throw new Error(`Fisierul ${safeFileName} nu este acceptat. Formate permise: DOC, DOCX, PDF.`);
    }

    if (file.size > MAX_SUBMISSION_FILE_BYTES) {
      throw new Error(`Fisierul ${safeFileName} depaseste limita de 20 MB.`);
    }

    totalSize += file.size;
    if (totalSize > MAX_SUBMISSION_TOTAL_BYTES) {
      throw new Error('Dimensiunea totala a atasamentelor depaseste limita de 25 MB.');
    }

    const buffer = await file.arrayBuffer();
    const fileId = crypto.randomUUID();
    const storageKey = `${SUBMISSION_FILE_KEY_PREFIX}${submissionId}:${keyPrefix}:${fileId}`;
    const contentBase64 = arrayBufferToBase64(buffer);
    await env.AUTH_KV.put(storageKey, JSON.stringify({ contentBase64 }));

    storedFiles.push({
      id: fileId,
      filename: safeFileName,
      size: file.size,
      contentType: guessContentType(safeFileName, file.type),
      storageKey,
    });
  }

  return storedFiles;
}

function toPublicSubmission(submission: StoredSubmission) {
  return {
    id: submission.id,
    title: submission.title,
    authors: submission.authors,
    email: submission.email,
    affiliation: submission.affiliation,
    abstract: submission.abstract,
    keywords_ro: submission.keywords_ro,
    keywords_en: submission.keywords_en,
    date_submitted: submission.date_submitted,
    status: submission.status,
    assigned_reviewer: submission.assigned_reviewer,
    assigned_reviewer_email: submission.assigned_reviewer_email,
    assigned_reviewer_2: submission.assigned_reviewer_2,
    assigned_reviewer_email_2: submission.assigned_reviewer_email_2,
    reviewer_deadline: submission.reviewer_deadline,
    reviewer_deadline_2: submission.reviewer_deadline_2,
    recommendation: submission.recommendation,
    recommendation_2: submission.recommendation_2,
    review_notes: submission.review_notes,
    review_notes_2: submission.review_notes_2,
    reviewed_at: submission.reviewed_at,
    reviewed_at_2: submission.reviewed_at_2,
    decision: submission.decision,
    files: submission.files.map((file) => ({
      id: file.id,
      filename: file.filename,
      size: file.size,
      content_type: file.contentType || '',
    })),
    anonymized_files: submission.anonymized_files.map((file) => ({
      id: file.id,
      filename: file.filename,
      size: file.size,
      content_type: file.contentType || '',
    })),
    anonymized_at: submission.anonymized_at,
  };
}

function toPublicSubmissionForSession(submission: StoredSubmission, session: SessionPayload) {
  const base = toPublicSubmission(submission);
  if (session.role !== 'reviewer') return base;
  return {
    ...base,
    // Double-blind: reviewerul nu vede identitatea autorului in platforma.
    authors: 'Autor anonim',
    email: '',
    affiliation: '',
    files: base.anonymized_files,
    anonymized_files: [],
  };
}

function getAllowedOrigins(env: Env): string[] {
  const raw = asString(env.ALLOWED_ORIGINS);
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
  headers.set('Access-Control-Allow-Headers', 'Content-Type,X-Admin-Token,Authorization');
  headers.set('Access-Control-Expose-Headers', 'Content-Disposition');
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

async function hashPassword(password: string, env: Env): Promise<string> {
  return sha256Hex(`pwd:${password}:${env.OTP_SECRET}`);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function ttlLabel(seconds: number): string {
  if (seconds % (24 * 60 * 60) === 0) {
    const days = seconds / (24 * 60 * 60);
    return `${days} zile`;
  }
  if (seconds % (60 * 60) === 0) {
    const hours = seconds / (60 * 60);
    return `${hours} ore`;
  }
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} minute`;
}

function toIsoDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

async function createSessionToken(account: AuthAccount, env: Env): Promise<string> {
  const ttlSeconds = parsePositiveInt(env.SESSION_TTL_SECONDS, DEFAULT_SESSION_TTL_SECONDS);
  const now = Date.now();
  const payload: SessionPayload = {
    email: normalizeEmail(account.email),
    role: account.role,
    iat: now,
    exp: now + ttlSeconds * 1000,
  };
  const payloadPart = toBase64Url(JSON.stringify(payload));
  const signature = await sha256Hex(`${payloadPart}.${env.OTP_SECRET}`);
  return `${payloadPart}.${signature}`;
}

async function readSessionFromRequest(request: Request, env: Env): Promise<SessionPayload | null> {
  const authorization = request.headers.get('Authorization') || '';
  if (!authorization.startsWith('Bearer ')) return null;

  const token = authorization.slice('Bearer '.length).trim();
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const payloadPart = parts[0];
  const signaturePart = parts[1];
  if (!payloadPart || !signaturePart) return null;

  const expectedSignature = await sha256Hex(`${payloadPart}.${env.OTP_SECRET}`);
  if (expectedSignature !== signaturePart) return null;

  try {
    const payload = JSON.parse(fromBase64Url(payloadPart)) as SessionPayload;
    if (!payload?.email || !payload?.role || !payload?.exp) return null;
    if (!isUserRole(payload.role)) return null;
    if (Number(payload.exp) <= Date.now()) return null;
    return {
      email: normalizeEmail(payload.email),
      role: payload.role,
      iat: Number(payload.iat) || Date.now(),
      exp: Number(payload.exp),
    };
  } catch {
    return null;
  }
}

async function isAdminAuthorized(request: Request, env: Env): Promise<boolean> {
  const session = await readSessionFromRequest(request, env);
  if (session?.role === 'admin') return true;

  const providedToken = request.headers.get('X-Admin-Token') || request.headers.get('x-admin-token');
  if (env.NOTIFY_API_KEY && providedToken === env.NOTIFY_API_KEY) return true;

  return false;
}

async function sendEmail(
  env: Env,
  to: string[],
  subject: string,
  html: string,
  text?: string,
  attachments: EmailAttachment[] = [],
): Promise<Response> {
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
      attachments: attachments.length > 0 ? attachments : undefined,
    }),
  });
}

function getAppName(env: Env): string {
  return env.APP_NAME || 'IAFAR Journal';
}

function uniqueEmailList(entries: string[]): string[] {
  const values = new Set<string>();
  for (const entry of entries) {
    const normalized = normalizeEmail(entry);
    if (isValidEmail(normalized)) values.add(normalized);
  }
  return [...values];
}

function submissionStatusLabel(status: SubmissionStatus): string {
  if (status === 'submitted') return 'Trimis';
  if (status === 'anonymization') return 'In anonimizare';
  if (status === 'under_review') return 'In evaluare';
  if (status === 'decision_pending') return 'Decizie pendinte';
  if (status === 'accepted') return 'Acceptat';
  if (status === 'rejected') return 'Respins';
  return 'Revizuire solicitata';
}

function recommendationLabel(value: string): string {
  if (value === 'accept') return 'Acceptat';
  if (value === 'minor_revisions') return 'Revizuiri minore';
  if (value === 'major_revisions') return 'Revizuiri majore';
  if (value === 'reject') return 'Respins';
  return value || '-';
}

function buildWorkflowEmailTemplate(input: BuildEmailTemplateInput): EmailTemplate {
  const details = Array.isArray(input.details) ? input.details : [];
  const detailsHtml = details.length > 0
    ? `
      <table style="width:100%;border-collapse:collapse;margin:10px 0 14px 0">
        <tbody>
          ${details.map((detail) => `
            <tr>
              <td style="padding:4px 8px 4px 0;vertical-align:top;color:#374151;font-weight:600;white-space:nowrap">${escapeHtml(detail.label)}</td>
              <td style="padding:4px 0;color:#111827">${escapeHtml(detail.value || '-')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
    : '';

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
      <h2 style="margin:0 0 12px 0">${escapeHtml(input.heading)}</h2>
      <p>Salut${input.greeting ? `, ${escapeHtml(input.greeting)}` : ''}.</p>
      <p>${escapeHtml(input.intro)}</p>
      ${detailsHtml}
      ${input.note ? `<p><strong>Nota:</strong> ${escapeHtml(input.note)}</p>` : ''}
      ${input.action ? `<p>${escapeHtml(input.action)}</p>` : ''}
      ${input.footer ? `<p style="color:#6b7280;font-size:12px">${escapeHtml(input.footer)}</p>` : ''}
    </div>
  `.trim();

  const textLines = [
    `Salut${input.greeting ? `, ${input.greeting}` : ''}.`,
    input.intro,
    ...details.map((detail) => `${detail.label}: ${detail.value || '-'}`),
    input.note ? `Nota: ${input.note}` : '',
    input.action || '',
    input.footer || '',
  ].filter((line) => Boolean(line));

  return {
    subject: input.subject,
    html,
    text: textLines.join('\n'),
  };
}

function buildSubmissionDetails(submission: StoredSubmission): EmailTemplateDetail[] {
  return [
    { label: 'ID', value: submission.id },
    { label: 'Titlu', value: submission.title },
    { label: 'Autori', value: submission.authors },
    { label: 'Email contact', value: submission.email },
  ];
}

function getEditorialNotificationRecipients(env: Env, users: StoredUser[]): string[] {
  const accountRecipients = users
    .filter((entry) => entry.role === 'admin' || entry.role === 'editor')
    .map((entry) => entry.email);
  return uniqueEmailList([...parseSubmissionRecipients(env), ...accountRecipients]);
}

function buildNewSubmissionEditorialEmail(env: Env, submission: StoredSubmission, receivedAtIso: string): EmailTemplate {
  const details = [
    ...buildSubmissionDetails(submission),
    { label: 'Fisiere primite', value: String(submission.files.length) },
  ];
  return buildWorkflowEmailTemplate({
    subject: `[Manuscris nou] ${submission.title}`,
    heading: 'Notificare submisie noua',
    intro: `A fost inregistrata o submisie noua in ${getAppName(env)}.`,
    details,
    note: 'Acesta este doar un email de notificare. Manuscrisul complet si fisierele sunt disponibile doar in panoul admin.',
    action: 'Redistribuie submisia catre un reviewer din dashboard-ul de administrare.',
    footer: `Primita la: ${receivedAtIso}`,
  });
}

function buildAuthorSubmissionConfirmationEmail(env: Env, submission: StoredSubmission): EmailTemplate {
  return buildWorkflowEmailTemplate({
    subject: `${getAppName(env)} - confirmare primire manuscris`,
    heading: 'Manuscris primit',
    intro: `Am primit manuscrisul tau pentru ${getAppName(env)}.`,
    details: [
      { label: 'ID submisie', value: submission.id },
      { label: 'Titlu', value: submission.title },
      { label: 'Status', value: submissionStatusLabel(submission.status) },
    ],
    action: 'Vei primi o notificare cand manuscrisul este trimis catre review si la decizia editoriala.',
  });
}

function buildReviewerAssignedEmail(
  env: Env,
  submission: StoredSubmission,
  reviewerName: string,
  reviewerDeadline: string,
): EmailTemplate {
  return buildWorkflowEmailTemplate({
    subject: `${getAppName(env)} - submisie asignata pentru review`,
    heading: 'Submisie asignata',
    greeting: reviewerName || 'reviewer',
    intro: `Ti-a fost alocata o submisie pentru evaluare in ${getAppName(env)}.`,
    details: [
      { label: 'ID', value: submission.id },
      { label: 'Titlu', value: submission.title },
      { label: 'Termen recomandat', value: reviewerDeadline || '-' },
    ],
    action: 'Conecteaza-te in platforma pentru a analiza manuscrisul si a trimite recomandarea.',
  });
}

function buildReviewerUnassignedEmail(env: Env, submission: StoredSubmission, reviewerName: string): EmailTemplate {
  return buildWorkflowEmailTemplate({
    subject: `${getAppName(env)} - submisie retrasa din alocare`,
    heading: 'Submisie realocata',
    greeting: reviewerName || 'reviewer',
    intro: `Submisia de mai jos a fost retrasa din alocarea ta in ${getAppName(env)}.`,
    details: [
      { label: 'ID', value: submission.id },
      { label: 'Titlu', value: submission.title },
    ],
    action: 'Nu mai este necesara evaluarea pentru acest manuscris.',
  });
}

function buildAuthorSentToReviewEmail(env: Env, submission: StoredSubmission): EmailTemplate {
  const reviewers = [submission.assigned_reviewer, submission.assigned_reviewer_2]
    .map((value) => value.trim())
    .filter(Boolean);
  return buildWorkflowEmailTemplate({
    subject: `${getAppName(env)} - manuscris trimis spre review`,
    heading: 'Manuscris in evaluare',
    intro: `Manuscrisul tau a fost trimis catre evaluare in ${getAppName(env)}.`,
    details: [
      { label: 'ID submisie', value: submission.id },
      { label: 'Titlu', value: submission.title },
      { label: 'Status', value: submissionStatusLabel(submission.status) },
      { label: 'Revieweri', value: reviewers.length > 0 ? reviewers.join(', ') : 'alocati de editor' },
    ],
    action: 'Vei primi o notificare dupa finalizarea evaluarii editoriale.',
  });
}

function buildReviewCompletedEditorialEmail(
  env: Env,
  submission: StoredSubmission,
  reviewerName: string,
  reviewerRecommendation: string,
): EmailTemplate {
  return buildWorkflowEmailTemplate({
    subject: `${getAppName(env)} - recenzie noua primita`,
    heading: 'Recenzie noua',
    intro: `Un reviewer a trimis recomandarea pentru o submisie din ${getAppName(env)}.`,
    details: [
      { label: 'ID', value: submission.id },
      { label: 'Titlu', value: submission.title },
      { label: 'Reviewer', value: reviewerName || '-' },
      { label: 'Recomandare', value: recommendationLabel(reviewerRecommendation) },
      { label: 'Status curent', value: submissionStatusLabel(submission.status) },
    ],
    action: 'Verifica observatiile in dashboard si finalizeaza decizia editoriala.',
  });
}

function buildAuthorDecisionEmail(env: Env, submission: StoredSubmission): EmailTemplate {
  return buildWorkflowEmailTemplate({
    subject: `${getAppName(env)} - decizie editoriala`,
    heading: 'Decizie editoriala',
    intro: `A fost inregistrata o decizie pentru manuscrisul tau in ${getAppName(env)}.`,
    details: [
      { label: 'ID submisie', value: submission.id },
      { label: 'Titlu', value: submission.title },
      { label: 'Decizie', value: submissionStatusLabel(submission.status) },
      { label: 'Mesaj editor', value: submission.decision || '-' },
    ],
  });
}

async function issueLoginCode(env: Env, email: string, ttlSeconds: number): Promise<{ code: string; expiresAt: number }> {
  const code = generateCode();
  const expiresAt = Date.now() + ttlSeconds * 1000;
  const codeHash = await sha256Hex(`${email}:${code}:${env.OTP_SECRET}`);
  const otpEntry: OtpEntry = { email, codeHash, expiresAt };
  await env.AUTH_KV.put(`otp:${email}`, JSON.stringify(otpEntry), { expirationTtl: ttlSeconds });
  return { code, expiresAt };
}

async function sendLoginCodeEmail(
  env: Env,
  email: string,
  name: string,
  code: string,
  ttlSeconds: number,
): Promise<Response> {
  const appName = env.APP_NAME || 'IAFAR Journal';
  const validity = ttlLabel(ttlSeconds);
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
      <p>Salut, ${escapeHtml(name)}.</p>
      <p>Codul tau de autentificare pentru <strong>${escapeHtml(appName)}</strong> este:</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:4px;margin:8px 0">${escapeHtml(code)}</p>
      <p>Codul este valabil ${escapeHtml(validity)}.</p>
      <p style="color:#6b7280;font-size:12px">Daca nu ai cerut acest cod, ignora mesajul.</p>
    </div>
  `.trim();

  return sendEmail(
    env,
    [email],
    `${appName} - cod de autentificare`,
    html,
    `Codul tau de autentificare este ${code}. Codul este valabil ${validity}.`,
  );
}

type PasswordCheckResult = 'ok' | 'missing' | 'wrong' | 'not_configured';

async function checkAccountPassword(account: StoredUser, password: string, env: Env): Promise<PasswordCheckResult> {
  const adminPasswordEmail = normalizeEmail(asString(env.ADMIN_PASSWORD_EMAIL) || 'liviu.o.pop@gmail.com');
  const adminPassword = asString(env.ADMIN_PASSWORD);
  const hasAdminSecretPassword = adminPassword.length > 0
    && normalizeEmail(account.email) === adminPasswordEmail
    && !account.passwordHash;
  const hasSharedEditorialPassword = adminPassword.length > 0
    && !account.passwordHash
    && account.role !== 'author';

  if (hasAdminSecretPassword) {
    if (!password) return 'missing';
    return password === adminPassword ? 'ok' : 'wrong';
  }

  if (hasSharedEditorialPassword) {
    if (!password) return 'missing';
    return password === adminPassword ? 'ok' : 'wrong';
  }

  if (account.passwordHash) {
    if (!password) return 'missing';
    const passwordHash = await hashPassword(password, env);
    return passwordHash === account.passwordHash ? 'ok' : 'wrong';
  }

  return 'not_configured';
}

async function handleRequestCode(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Email invalid.' });
  }

  const users = await readUsers(env);
  const storedAccount = users.find((entry) => normalizeEmail(entry.email) === email);
  if (storedAccount) {
    const passwordCheck = await checkAccountPassword(storedAccount, password, env);
    if (passwordCheck === 'missing') {
      return jsonResponse(request, env, 401, {
        ok: false,
        error: 'Parola este obligatorie pentru acest cont.',
      });
    }
    if (passwordCheck === 'wrong') {
      return jsonResponse(request, env, 401, {
        ok: false,
        error: 'Parola este incorecta.',
      });
    }
  }

  if (!storedAccount) {
    const submissions = await readSubmissions(env);
    const hasAuthorSubmission = submissions.some((entry) => normalizeEmail(entry.email) === email);
    if (!hasAuthorSubmission) {
      return jsonResponse(request, env, 404, { ok: false, error: 'Nu exista un cont sau o submisie asociata acestui email.' });
    }
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

  const ttlSeconds = parsePositiveInt(env.OTP_TTL_SECONDS, DEFAULT_OTP_TTL_SECONDS);
  const loginCode = await issueLoginCode(env, email, ttlSeconds);
  await env.AUTH_KV.put(rateKey, '1', { expirationTtl: rateLimitSeconds });

  const recipientName = storedAccount?.name || 'Autor';
  const sendResult = await sendLoginCodeEmail(env, email, recipientName, loginCode.code, ttlSeconds);
  if (!sendResult.ok) {
    const errorBody = await sendResult.text();
    console.error('Resend send failed', sendResult.status, errorBody);
    return jsonResponse(request, env, 502, { ok: false, error: 'Nu am putut trimite emailul de autentificare.' });
  }

  return jsonResponse(request, env, 200, {
    ok: true,
    message: `Codul de autentificare a fost trimis catre ${email} si este valabil ${ttlLabel(ttlSeconds)}.`,
  });
}

async function handleLoginWithPassword(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const identifierRaw = typeof body.identifier === 'string'
    ? body.identifier
    : (typeof body.email === 'string' ? body.email : '');
  const identifier = identifierRaw.trim();
  const password = typeof body.password === 'string' ? body.password : '';

  if (!identifier) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Utilizator sau email invalid.' });
  }
  if (!password) {
    return jsonResponse(request, env, 401, { ok: false, error: 'Parola este obligatorie.' });
  }

  const identifierEmail = normalizeEmail(identifier);
  const identifierUsername = sanitizeUsername(identifier, identifier);
  const users = await readUsers(env);
  const account = users.find((entry) => (
    normalizeEmail(entry.email) === identifierEmail
      || sanitizeUsername(entry.username, entry.email) === identifierUsername
  ));
  if (!account) {
    return jsonResponse(request, env, 404, { ok: false, error: 'Contul nu exista.' });
  }
  if (account.role === 'author') {
    return jsonResponse(request, env, 403, {
      ok: false,
      error: 'Conturile de autor se autentifica prin codul trimis pe emailul folosit la submisie.',
    });
  }

  const passwordCheck = await checkAccountPassword(account, password, env);
  if (passwordCheck === 'not_configured') {
    return jsonResponse(request, env, 400, {
      ok: false,
      error: 'Acest cont nu are parola setata pentru login direct. Foloseste codul pe email.',
    });
  }
  if (passwordCheck === 'wrong') {
    return jsonResponse(request, env, 401, { ok: false, error: 'Parola este incorecta.' });
  }
  if (passwordCheck === 'missing') {
    return jsonResponse(request, env, 401, { ok: false, error: 'Parola este obligatorie.' });
  }

  const publicAccount = toAccount(account);
  const token = await createSessionToken(publicAccount, env);
  return jsonResponse(request, env, 200, {
    ok: true,
    message: 'Autentificare reusita.',
    user: publicAccount,
    token,
  });
}

async function handleVerifyCode(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';
  const code = typeof body.code === 'string' ? body.code.trim() : '';

  if (!email || !/^\d{6}$/.test(code)) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Date de autentificare invalide.' });
  }

  const users = await readUsers(env);
  const account = users.find((entry) => normalizeEmail(entry.email) === email);
  let authAccount: AuthAccount | null = account ? toAccount(account) : null;

  if (!authAccount) {
    const submissions = await readSubmissions(env);
    const hasAuthorSubmission = submissions.some((entry) => normalizeEmail(entry.email) === email);
    if (!hasAuthorSubmission) {
      return jsonResponse(request, env, 404, { ok: false, error: 'Contul nu exista.' });
    }
    authAccount = buildAuthorAccountFromEmail(email);
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
  const token = await createSessionToken(authAccount, env);

  return jsonResponse(request, env, 200, {
    ok: true,
    message: 'Autentificare reusita.',
    user: authAccount,
    token,
  });
}

async function handleListUsers(request: Request, env: Env): Promise<Response> {
  const isAllowed = await isAdminAuthorized(request, env);
  if (!isAllowed) {
    return jsonResponse(request, env, 401, { ok: false, error: 'Neautorizat.' });
  }

  const users = await readUsers(env);
  const accounts = users
    .map((entry) => toAccount(entry))
    .sort((a, b) => a.role.localeCompare(b.role) || a.email.localeCompare(b.email));

  return jsonResponse(request, env, 200, {
    ok: true,
    accounts,
  });
}

async function handleCreateUser(request: Request, env: Env): Promise<Response> {
  const isAllowed = await isAdminAuthorized(request, env);
  if (!isAllowed) {
    return jsonResponse(request, env, 401, { ok: false, error: 'Neautorizat.' });
  }

  const body = await readJson(request);
  const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const roleRaw = typeof body.role === 'string' ? body.role.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const usernameRaw = typeof body.username === 'string' ? body.username.trim() : '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Email invalid.' });
  }
  if (!name) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Numele este obligatoriu.' });
  }
  if (!isUserRole(roleRaw)) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Rol invalid.' });
  }
  if (password.length < 8) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Parola trebuie sa aiba minimum 8 caractere.' });
  }

  const users = await readUsers(env);
  if (users.some((entry) => normalizeEmail(entry.email) === email)) {
    return jsonResponse(request, env, 409, { ok: false, error: 'Exista deja un utilizator cu acest email.' });
  }

  const baseUsername = sanitizeUsername(usernameRaw, email);
  let candidateUsername = baseUsername;
  let counter = 1;
  const usedUsernames = new Set(users.map((entry) => sanitizeUsername(entry.username, entry.email)));
  while (usedUsernames.has(candidateUsername)) {
    candidateUsername = `${baseUsername}${counter}`;
    counter += 1;
  }

  const passwordHash = await hashPassword(password, env);
  const newUser: StoredUser = {
    username: candidateUsername,
    name,
    role: roleRaw,
    email,
    passwordHash,
    createdAt: Date.now(),
  };

  const nextUsers = [...users, newUser];
  await writeUsers(env, nextUsers);

  const ttlSeconds = parsePositiveInt(env.OTP_TTL_SECONDS, DEFAULT_OTP_TTL_SECONDS);
  const loginCode = await issueLoginCode(env, email, ttlSeconds);
  const sendResult = await sendLoginCodeEmail(env, email, name, loginCode.code, ttlSeconds);
  if (!sendResult.ok) {
    const errorBody = await sendResult.text();
    console.error('Resend create-user send failed', sendResult.status, errorBody);
    await writeUsers(env, users);
    await env.AUTH_KV.delete(`otp:${email}`);
    return jsonResponse(request, env, 502, {
      ok: false,
      error: 'Nu am putut trimite emailul cu codul de logare. Utilizatorul nu a fost salvat.',
    });
  }

  return jsonResponse(request, env, 201, {
    ok: true,
    message: `Utilizator creat. Codul de logare a fost trimis si este valabil ${ttlLabel(ttlSeconds)}.`,
    account: toAccount(newUser),
  });
}

async function handleNotifyRole(request: Request, env: Env): Promise<Response> {
  const isAllowed = await isAdminAuthorized(request, env);
  if (!isAllowed) {
    return jsonResponse(request, env, 401, { ok: false, error: 'Neautorizat.' });
  }

  const body = await readJson(request);
  const role = typeof body.role === 'string' ? body.role.trim().toLowerCase() : 'all';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!subject || !message) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Subject si mesaj sunt obligatorii.' });
  }

  const users = await readUsers(env);
  const recipients = role === 'all'
    ? users
    : users.filter((entry) => entry.role === role);

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

function canReadSubmission(session: SessionPayload, submission: StoredSubmission): boolean {
  if (session.role === 'admin' || session.role === 'editor') return true;
  if (session.role === 'reviewer') {
    const reviewerEmail = normalizeEmail(session.email);
    return normalizeEmail(submission.assigned_reviewer_email) === reviewerEmail
      || normalizeEmail(submission.assigned_reviewer_email_2) === reviewerEmail;
  }
  return normalizeEmail(submission.email) === normalizeEmail(session.email);
}

async function handleSubmitManuscript(request: Request, env: Env): Promise<Response> {
  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.toLowerCase().includes('multipart/form-data')) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Request invalid. Foloseste multipart/form-data.' });
  }

  const form = await request.formData();
  const title = asString(form.get('title')).trim();
  const authors = asString(form.get('authors')).trim();
  const email = normalizeEmail(asString(form.get('email')));
  const affiliation = asString(form.get('affiliation')).trim();
  const abstractValue = asString(form.get('abstract')).trim();
  const keywordsRo = asString(form.get('keywords_ro')).trim();
  const keywordsEn = asString(form.get('keywords_en')).trim();

  if (!title || !authors || !email || !abstractValue) {
    return jsonResponse(request, env, 400, {
      ok: false,
      error: 'Completeaza campurile obligatorii: titlu, autori, email, rezumat.',
    });
  }

  if (!isValidEmail(email)) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Email de contact invalid.' });
  }

  const uploadedFiles = form
    .getAll('files')
    .filter((entry): entry is File => entry instanceof File)
    .filter((entry) => entry.size > 0);

  if (uploadedFiles.length === 0) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Ataseaza cel putin un fisier (DOC, DOCX sau PDF).' });
  }

  if (uploadedFiles.length > MAX_SUBMISSION_FILES) {
    return jsonResponse(request, env, 400, {
      ok: false,
      error: `Poti trimite maximum ${MAX_SUBMISSION_FILES} fisiere la o submisie.`,
    });
  }

  const submissionId = crypto.randomUUID();
  const receivedAt = new Date();
  let storedFiles: StoredSubmissionFile[] = [];
  try {
    storedFiles = await storeSubmissionFiles(env, submissionId, uploadedFiles, 'original');
  } catch (error) {
    return jsonResponse(request, env, 400, {
      ok: false,
      error: error instanceof Error ? error.message : 'Nu am putut procesa fisierele trimise.',
    });
  }

  const submission: StoredSubmission = {
    id: submissionId,
    title,
    authors,
    email,
    affiliation,
    abstract: abstractValue,
    keywords_ro: keywordsRo,
    keywords_en: keywordsEn,
    date_submitted: toIsoDate(receivedAt),
    status: 'submitted',
    assigned_reviewer: '',
    assigned_reviewer_email: '',
    assigned_reviewer_2: '',
    assigned_reviewer_email_2: '',
    reviewer_deadline: '',
    reviewer_deadline_2: '',
    recommendation: '',
    recommendation_2: '',
    review_notes: '',
    review_notes_2: '',
    reviewed_at: '',
    reviewed_at_2: '',
    decision: '',
    files: storedFiles,
    anonymized_files: [],
    anonymized_at: '',
    createdAt: receivedAt.getTime(),
  };

  const existingSubmissions = await readSubmissions(env);
  await writeSubmissions(env, [submission, ...existingSubmissions]);

  const recipients = parseSubmissionRecipients(env);
  const editorialTemplate = buildNewSubmissionEditorialEmail(env, submission, receivedAt.toISOString());
  const sendResult = await sendEmail(
    env,
    recipients,
    editorialTemplate.subject,
    editorialTemplate.html,
    editorialTemplate.text,
  );
  if (!sendResult.ok) {
    const errorBody = await sendResult.text();
    console.error('Resend manuscript send failed', sendResult.status, errorBody);
    return jsonResponse(request, env, 502, {
      ok: false,
      error: 'Nu am putut trimite manuscrisul pe email. Incearca din nou in cateva minute.',
    });
  }

  const confirmationTemplate = buildAuthorSubmissionConfirmationEmail(env, submission);
  const confirmationResult = await sendEmail(
    env,
    [email],
    confirmationTemplate.subject,
    confirmationTemplate.html,
    confirmationTemplate.text,
  );

  if (!confirmationResult.ok) {
    const errorBody = await confirmationResult.text();
    console.error('Resend manuscript confirmation failed', confirmationResult.status, errorBody);
  }

  return jsonResponse(request, env, 200, {
    ok: true,
    message: 'Manuscrisul a fost trimis cu succes catre redactia revistei.',
    submissionId,
  });
}

async function handleUploadAnonymizedFiles(request: Request, env: Env): Promise<Response> {
  const session = await readSessionFromRequest(request, env);
  if (!session || (session.role !== 'admin' && session.role !== 'editor')) {
    return jsonResponse(request, env, 401, { ok: false, error: 'Neautorizat.' });
  }

  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.toLowerCase().includes('multipart/form-data')) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Request invalid. Foloseste multipart/form-data.' });
  }

  const form = await request.formData();
  const submissionId = asString(form.get('submissionId')).trim();
  if (!submissionId) {
    return jsonResponse(request, env, 400, { ok: false, error: 'ID submisie lipsa.' });
  }

  const uploadedFiles = form
    .getAll('files')
    .filter((entry): entry is File => entry instanceof File)
    .filter((entry) => entry.size > 0);

  if (uploadedFiles.length === 0) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Ataseaza cel putin un fisier anonimizat.' });
  }

  if (uploadedFiles.length > MAX_SUBMISSION_FILES) {
    return jsonResponse(request, env, 400, {
      ok: false,
      error: `Poti trimite maximum ${MAX_SUBMISSION_FILES} fisiere la o submisie.`,
    });
  }

  const submissions = await readSubmissions(env);
  const index = submissions.findIndex((entry) => entry.id === submissionId);
  if (index < 0) {
    return jsonResponse(request, env, 404, { ok: false, error: 'Submisia nu exista.' });
  }

  const current = submissions[index];
  let storedFiles: StoredSubmissionFile[] = [];
  try {
    storedFiles = await storeSubmissionFiles(env, submissionId, uploadedFiles, 'anonymized');
  } catch (error) {
    return jsonResponse(request, env, 400, {
      ok: false,
      error: error instanceof Error ? error.message : 'Nu am putut procesa fisierele anonimizate.',
    });
  }

  for (const file of current.anonymized_files) {
    try {
      await env.AUTH_KV.delete(file.storageKey);
    } catch (error) {
      console.error('Failed to delete previous anonymized file', file.storageKey, error);
    }
  }

  const nowIso = new Date().toISOString();
  const next: StoredSubmission = {
    ...current,
    status: current.status === 'submitted' ? 'anonymization' : current.status,
    anonymized_files: storedFiles,
    anonymized_at: nowIso,
  };
  submissions[index] = next;
  await writeSubmissions(env, submissions);

  return jsonResponse(request, env, 200, {
    ok: true,
    message: 'Fisierele anonimizate au fost incarcate.',
    submission: toPublicSubmissionForSession(next, session),
  });
}

async function handleListSubmissions(request: Request, env: Env): Promise<Response> {
  const session = await readSessionFromRequest(request, env);
  if (!session) {
    return jsonResponse(request, env, 401, { ok: false, error: 'Neautorizat.' });
  }

  const submissions = await readSubmissions(env);
  const visibleSubmissions = submissions.filter((entry) => canReadSubmission(session, entry));
  visibleSubmissions.sort((a, b) => b.createdAt - a.createdAt);

  return jsonResponse(request, env, 200, {
    ok: true,
    submissions: visibleSubmissions.map((entry) => toPublicSubmissionForSession(entry, session)),
  });
}

async function handleUpdateSubmission(request: Request, env: Env): Promise<Response> {
  const session = await readSessionFromRequest(request, env);
  if (!session) {
    return jsonResponse(request, env, 401, { ok: false, error: 'Neautorizat.' });
  }

  const body = await readJson(request);
  const submissionId = asString(body.id).trim();
  const changes = (body.changes && typeof body.changes === 'object') ? body.changes as Record<string, unknown> : {};

  if (!submissionId) {
    return jsonResponse(request, env, 400, { ok: false, error: 'ID submisie lipsa.' });
  }

  const submissions = await readSubmissions(env);
  const index = submissions.findIndex((entry) => entry.id === submissionId);
  if (index < 0) {
    return jsonResponse(request, env, 404, { ok: false, error: 'Submisia nu exista.' });
  }

  const current = submissions[index];
  const canAdminEdit = session.role === 'admin' || session.role === 'editor';
  const reviewerEmail = normalizeEmail(session.email);
  const reviewerSlot = session.role === 'reviewer'
    ? (normalizeEmail(current.assigned_reviewer_email) === reviewerEmail ? 1
      : (normalizeEmail(current.assigned_reviewer_email_2) === reviewerEmail ? 2 : 0))
    : 0;
  const canReviewerEdit = reviewerSlot !== 0;

  if (!canAdminEdit && !canReviewerEdit) {
    return jsonResponse(request, env, 403, { ok: false, error: 'Nu ai drepturi pentru actualizarea acestei submisii.' });
  }

  const next: StoredSubmission = { ...current };
  let changed = false;

  if (canAdminEdit) {
    if (typeof changes.title === 'string') {
      next.title = changes.title.trim();
      changed = true;
    }
    if (typeof changes.authors === 'string') {
      next.authors = changes.authors.trim();
      changed = true;
    }
    if (typeof changes.email === 'string') {
      next.email = normalizeEmail(changes.email);
      changed = true;
    }
    if (typeof changes.affiliation === 'string') {
      next.affiliation = changes.affiliation.trim();
      changed = true;
    }
    if (typeof changes.abstract === 'string') {
      next.abstract = changes.abstract.trim();
      changed = true;
    }
    if (typeof changes.keywords_ro === 'string') {
      next.keywords_ro = changes.keywords_ro.trim();
      changed = true;
    }
    if (typeof changes.keywords_en === 'string') {
      next.keywords_en = changes.keywords_en.trim();
      changed = true;
    }
    if (typeof changes.status === 'string' && isSubmissionStatus(changes.status)) {
      next.status = changes.status;
      changed = true;
    }
    if (typeof changes.assigned_reviewer === 'string') {
      next.assigned_reviewer = changes.assigned_reviewer.trim();
      changed = true;
    }
    if (typeof changes.assigned_reviewer_email === 'string') {
      next.assigned_reviewer_email = normalizeEmail(changes.assigned_reviewer_email);
      changed = true;
    }
    if (typeof changes.assigned_reviewer_2 === 'string') {
      next.assigned_reviewer_2 = changes.assigned_reviewer_2.trim();
      changed = true;
    }
    if (typeof changes.assigned_reviewer_email_2 === 'string') {
      next.assigned_reviewer_email_2 = normalizeEmail(changes.assigned_reviewer_email_2);
      changed = true;
    }
    if (typeof changes.reviewer_deadline === 'string') {
      next.reviewer_deadline = changes.reviewer_deadline.trim();
      changed = true;
    }
    if (typeof changes.reviewer_deadline_2 === 'string') {
      next.reviewer_deadline_2 = changes.reviewer_deadline_2.trim();
      changed = true;
    }
    if (typeof changes.decision === 'string') {
      next.decision = changes.decision.trim();
      changed = true;
    }
    if (typeof changes.recommendation === 'string') {
      next.recommendation = changes.recommendation.trim();
      changed = true;
    }
    if (typeof changes.recommendation_2 === 'string') {
      next.recommendation_2 = changes.recommendation_2.trim();
      changed = true;
    }
    if (typeof changes.review_notes === 'string') {
      next.review_notes = changes.review_notes.trim();
      changed = true;
    }
    if (typeof changes.review_notes_2 === 'string') {
      next.review_notes_2 = changes.review_notes_2.trim();
      changed = true;
    }
    if (typeof changes.reviewed_at === 'string') {
      next.reviewed_at = changes.reviewed_at.trim();
      changed = true;
    }
    if (typeof changes.reviewed_at_2 === 'string') {
      next.reviewed_at_2 = changes.reviewed_at_2.trim();
      changed = true;
    }
  }

  if (canReviewerEdit) {
    if (typeof changes.recommendation === 'string') {
      if (reviewerSlot === 2) {
        next.recommendation_2 = changes.recommendation.trim();
      } else {
        next.recommendation = changes.recommendation.trim();
      }
      changed = true;
    }
    if (typeof changes.review_notes === 'string') {
      if (reviewerSlot === 2) {
        next.review_notes_2 = changes.review_notes.trim();
      } else {
        next.review_notes = changes.review_notes.trim();
      }
      changed = true;
    }
    if (typeof changes.reviewed_at === 'string') {
      if (reviewerSlot === 2) {
        next.reviewed_at_2 = changes.reviewed_at.trim();
      } else {
        next.reviewed_at = changes.reviewed_at.trim();
      }
      changed = true;
    }
    if (typeof changes.recommendation_2 === 'string' && reviewerSlot === 2) {
      next.recommendation_2 = changes.recommendation_2.trim();
      changed = true;
    }
    if (typeof changes.review_notes_2 === 'string' && reviewerSlot === 2) {
      next.review_notes_2 = changes.review_notes_2.trim();
      changed = true;
    }
    if (typeof changes.reviewed_at_2 === 'string' && reviewerSlot === 2) {
      next.reviewed_at_2 = changes.reviewed_at_2.trim();
      changed = true;
    }
  }

  if (canAdminEdit) {
    if (!next.title || !next.abstract) {
      return jsonResponse(request, env, 400, {
        ok: false,
        error: 'Titlul si rezumatul sunt obligatorii pentru submisie.',
      });
    }
    if (!isValidEmail(next.email)) {
      return jsonResponse(request, env, 400, {
        ok: false,
        error: 'Emailul de contact trebuie sa fie valid.',
      });
    }
    if (next.assigned_reviewer_email && next.assigned_reviewer_email === next.assigned_reviewer_email_2) {
      return jsonResponse(request, env, 400, { ok: false, error: 'Acelasi reviewer nu poate fi asignat in ambele sloturi.' });
    }
    if (next.status === 'under_review') {
      const reviewerOneEmail = normalizeEmail(next.assigned_reviewer_email);
      const reviewerTwoEmail = normalizeEmail(next.assigned_reviewer_email_2);
      const validDoubleBlindAssignment = isValidEmail(reviewerOneEmail)
        && isValidEmail(reviewerTwoEmail)
        && reviewerOneEmail !== reviewerTwoEmail;
      if (!validDoubleBlindAssignment) {
        return jsonResponse(request, env, 400, {
          ok: false,
          error: 'Pentru trimiterea la review trebuie asignati doi revieweri diferiti.',
        });
      }
      if (next.anonymized_files.length === 0) {
        return jsonResponse(request, env, 400, {
          ok: false,
          error: 'Incarca mai intai versiunea anonimizata a manuscrisului.',
        });
      }
    }
  }

  if (!changed) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Nu exista modificari valide pentru aceasta submisie.' });
  }

  if (canReviewerEdit) {
    const firstCompleted = Boolean(next.recommendation && next.reviewed_at);
    const secondCompleted = Boolean(next.recommendation_2 && next.reviewed_at_2);
    const hasAnyReview = firstCompleted || secondCompleted;
    const isFinalDecision = next.status === 'accepted' || next.status === 'rejected' || next.status === 'revision_requested';
    if (!isFinalDecision) {
      next.status = firstCompleted && secondCompleted ? 'decision_pending' : (hasAnyReview ? 'under_review' : next.status);
    }
  }

  submissions[index] = next;
  await writeSubmissions(env, submissions);

  const currentReviewerEmail = normalizeEmail(current.assigned_reviewer_email);
  const currentReviewerEmail2 = normalizeEmail(current.assigned_reviewer_email_2);
  const nextReviewerEmail = normalizeEmail(next.assigned_reviewer_email);
  const nextReviewerEmail2 = normalizeEmail(next.assigned_reviewer_email_2);

  const reviewerAssignmentChanged = canAdminEdit && currentReviewerEmail !== nextReviewerEmail;
  const reviewerAssignmentChanged2 = canAdminEdit && currentReviewerEmail2 !== nextReviewerEmail2;

  const reviewerAssigned = reviewerAssignmentChanged && nextReviewerEmail !== '' && isValidEmail(nextReviewerEmail);
  const reviewerAssigned2 = reviewerAssignmentChanged2 && nextReviewerEmail2 !== '' && isValidEmail(nextReviewerEmail2);
  const reviewerUnassigned = reviewerAssignmentChanged && currentReviewerEmail !== '' && isValidEmail(currentReviewerEmail);
  const reviewerUnassigned2 = reviewerAssignmentChanged2 && currentReviewerEmail2 !== '' && isValidEmail(currentReviewerEmail2);

  const sentToReview = canAdminEdit && current.status !== 'under_review' && next.status === 'under_review';
  const reviewerSubmittedReview = canReviewerEdit
    && (reviewerSlot === 2
      ? (
          current.recommendation_2 !== next.recommendation_2
          || current.review_notes_2 !== next.review_notes_2
          || current.reviewed_at_2 !== next.reviewed_at_2
        )
      : (
          current.recommendation !== next.recommendation
          || current.review_notes !== next.review_notes
          || current.reviewed_at !== next.reviewed_at
        ));
  const finalDecisionSet = canAdminEdit
    && current.status !== next.status
    && (next.status === 'accepted' || next.status === 'rejected' || next.status === 'revision_requested');

  let cachedUsers: StoredUser[] | null = null;
  const getUsers = async (): Promise<StoredUser[]> => {
    if (cachedUsers) return cachedUsers;
    cachedUsers = await readUsers(env);
    return cachedUsers;
  };

  const resolveReviewerName = async (candidateName: string, candidateEmail: string): Promise<string> => {
    const trimmedName = candidateName.trim();
    if (trimmedName) return trimmedName;
    if (!isValidEmail(candidateEmail)) return 'reviewer';
    const users = await getUsers();
    const found = users.find((entry) => normalizeEmail(entry.email) === normalizeEmail(candidateEmail));
    return found?.name || candidateEmail;
  };

  if (reviewerAssigned) {
    const reviewerName = await resolveReviewerName(next.assigned_reviewer, nextReviewerEmail);
    const template = buildReviewerAssignedEmail(env, next, reviewerName, next.reviewer_deadline);
    const notifyResult = await sendEmail(
      env,
      [nextReviewerEmail],
      template.subject,
      template.html,
      template.text,
    );
    if (!notifyResult.ok) {
      const errorBody = await notifyResult.text();
      console.error('Resend reviewer assignment failed', notifyResult.status, errorBody);
    }
  }

  if (reviewerUnassigned) {
    const reviewerName = await resolveReviewerName(current.assigned_reviewer, currentReviewerEmail);
    const template = buildReviewerUnassignedEmail(env, next, reviewerName);
    const notifyResult = await sendEmail(
      env,
      [currentReviewerEmail],
      template.subject,
      template.html,
      template.text,
    );
    if (!notifyResult.ok) {
      const errorBody = await notifyResult.text();
      console.error('Resend reviewer unassignment failed', notifyResult.status, errorBody);
    }
  }

  if (reviewerAssigned2) {
    const reviewerName = await resolveReviewerName(next.assigned_reviewer_2, nextReviewerEmail2);
    const template = buildReviewerAssignedEmail(env, next, reviewerName, next.reviewer_deadline_2);
    const notifyResult = await sendEmail(
      env,
      [nextReviewerEmail2],
      template.subject,
      template.html,
      template.text,
    );
    if (!notifyResult.ok) {
      const errorBody = await notifyResult.text();
      console.error('Resend reviewer assignment slot2 failed', notifyResult.status, errorBody);
    }
  }

  if (reviewerUnassigned2) {
    const reviewerName = await resolveReviewerName(current.assigned_reviewer_2, currentReviewerEmail2);
    const template = buildReviewerUnassignedEmail(env, next, reviewerName);
    const notifyResult = await sendEmail(
      env,
      [currentReviewerEmail2],
      template.subject,
      template.html,
      template.text,
    );
    if (!notifyResult.ok) {
      const errorBody = await notifyResult.text();
      console.error('Resend reviewer unassignment slot2 failed', notifyResult.status, errorBody);
    }
  }

  if (sentToReview && isValidEmail(next.email)) {
    const template = buildAuthorSentToReviewEmail(env, next);
    const notifyResult = await sendEmail(
      env,
      [next.email],
      template.subject,
      template.html,
      template.text,
    );
    if (!notifyResult.ok) {
      const errorBody = await notifyResult.text();
      console.error('Resend author under-review notify failed', notifyResult.status, errorBody);
    }
  }

  if (reviewerSubmittedReview) {
    const users = await getUsers();
    const recipients = getEditorialNotificationRecipients(env, users);
    if (recipients.length > 0) {
      const reviewerName = reviewerSlot === 2
        ? await resolveReviewerName(next.assigned_reviewer_2, nextReviewerEmail2)
        : await resolveReviewerName(next.assigned_reviewer, nextReviewerEmail);
      const reviewerRecommendation = reviewerSlot === 2 ? next.recommendation_2 : next.recommendation;
      const template = buildReviewCompletedEditorialEmail(env, next, reviewerName, reviewerRecommendation);
      const notifyResult = await sendEmail(
        env,
        recipients,
        template.subject,
        template.html,
        template.text,
      );
      if (!notifyResult.ok) {
        const errorBody = await notifyResult.text();
        console.error('Resend editorial review-complete notify failed', notifyResult.status, errorBody);
      }
    }
  }

  if (finalDecisionSet && isValidEmail(next.email)) {
    const template = buildAuthorDecisionEmail(env, next);
    const notifyResult = await sendEmail(
      env,
      [next.email],
      template.subject,
      template.html,
      template.text,
    );
    if (!notifyResult.ok) {
      const errorBody = await notifyResult.text();
      console.error('Resend author decision notify failed', notifyResult.status, errorBody);
    }
  }

  return jsonResponse(request, env, 200, {
    ok: true,
    message: 'Submisia a fost actualizata.',
    submission: toPublicSubmissionForSession(next, session),
  });
}

async function handleDownloadSubmissionFile(
  request: Request,
  env: Env,
  submissionId: string,
  fileId: string,
): Promise<Response> {
  const session = await readSessionFromRequest(request, env);
  if (!session) {
    return jsonResponse(request, env, 401, { ok: false, error: 'Neautorizat.' });
  }

  const submissions = await readSubmissions(env);
  const submission = submissions.find((entry) => entry.id === submissionId);
  if (!submission) {
    return jsonResponse(request, env, 404, { ok: false, error: 'Submisia nu exista.' });
  }

  if (!canReadSubmission(session, submission)) {
    return jsonResponse(request, env, 403, { ok: false, error: 'Nu ai acces la acest fisier.' });
  }

  const availableFiles = session.role === 'reviewer'
    ? submission.anonymized_files
    : [...submission.files, ...submission.anonymized_files];
  const targetFile = availableFiles.find((entry) => entry.id === fileId);
  if (!targetFile) {
    return jsonResponse(request, env, 404, {
      ok: false,
      error: session.role === 'reviewer'
        ? 'Versiunea anonimizata nu este disponibila pentru aceasta submisie.'
        : 'Fisierul nu exista pentru aceasta submisie.',
    });
  }

  const rawFile = await env.AUTH_KV.get(targetFile.storageKey);
  if (!rawFile) {
    return jsonResponse(request, env, 404, { ok: false, error: 'Fisierul nu mai este disponibil.' });
  }

  let contentBase64 = '';
  try {
    const parsed = JSON.parse(rawFile) as { contentBase64?: string };
    contentBase64 = asString(parsed.contentBase64);
  } catch {
    contentBase64 = '';
  }

  if (!contentBase64) {
    return jsonResponse(request, env, 500, { ok: false, error: 'Continut fisier invalid.' });
  }

  const bytes = base64ToUint8Array(contentBase64);
  const headers = buildCorsHeaders(request, env);
  headers.set('Content-Type', targetFile.contentType || 'application/octet-stream');
  headers.set('Content-Disposition', `attachment; filename="${targetFile.filename.replace(/"/g, '')}"`);
  headers.set('Cache-Control', 'no-store');

  return new Response(bytes, { status: 200, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
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

      if (request.method === 'POST' && url.pathname === '/auth/login-password') {
        return handleLoginWithPassword(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/auth/verify-code') {
        return handleVerifyCode(request, env);
      }

      if (request.method === 'GET' && url.pathname === '/admin/users') {
        return handleListUsers(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/admin/users') {
        return handleCreateUser(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/notify/role') {
        return handleNotifyRole(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/submissions/send') {
        return handleSubmitManuscript(request, env);
      }

      if (request.method === 'GET' && url.pathname === '/submissions') {
        return handleListSubmissions(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/submissions/update') {
        return handleUpdateSubmission(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/submissions/anonymized-upload') {
        return handleUploadAnonymizedFiles(request, env);
      }

      const filePathMatch = url.pathname.match(/^\/submissions\/([^/]+)\/files\/([^/]+)$/);
      if (request.method === 'GET' && filePathMatch) {
        const submissionId = decodeURIComponent(filePathMatch[1]);
        const fileId = decodeURIComponent(filePathMatch[2]);
        return handleDownloadSubmissionFile(request, env, submissionId, fileId);
      }

      return textResponse(request, env, 404, 'Not found');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Unhandled worker error', message);
      return jsonResponse(request, env, 500, { ok: false, error: 'Worker runtime error', detail: message });
    }
  },
};
