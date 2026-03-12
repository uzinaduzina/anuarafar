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

type EmailTemplateId =
  | 'login_code'
  | 'account_credentials'
  | 'submission_new_editorial'
  | 'submission_confirmation_author'
  | 'reviewer_assigned'
  | 'reviewer_unassigned'
  | 'author_sent_to_review'
  | 'review_completed_editorial'
  | 'author_decision';

type EditableEmailTemplateFields = {
  subject: string;
  heading: string;
  greeting: string;
  intro: string;
  note: string;
  action: string;
  footer: string;
};

type PartialEditableEmailTemplateFields = Partial<EditableEmailTemplateFields>;

interface EmailTemplateDescriptor {
  id: EmailTemplateId;
  label: string;
  description: string;
  placeholders: string[];
  defaults: EditableEmailTemplateFields;
}

type StoredEmailTemplateMap = Partial<Record<EmailTemplateId, PartialEditableEmailTemplateFields>>;
type EditableArticleField =
  | 'title'
  | 'authors'
  | 'affiliations'
  | 'emails'
  | 'abstract'
  | 'abstract_ro'
  | 'abstract_en'
  | 'abstract_de'
  | 'abstract_fr'
  | 'keywords'
  | 'keywords_ro'
  | 'keywords_en'
  | 'keywords_de'
  | 'keywords_fr'
  | 'pages_start'
  | 'pages_end'
  | 'doi'
  | 'language'
  | 'section'
  | 'pdf_path';
type StoredArticleOverride = Partial<Record<EditableArticleField, string>>;
type StoredArticleOverrideMap = Record<string, StoredArticleOverride>;

type SubmissionStatus = 'submitted' | 'anonymization' | 'under_review' | 'decision_pending' | 'accepted' | 'rejected' | 'revision_requested';
type ReviewAnswer = 'yes' | 'partial' | 'no';
type AnalyticsEntityType = 'article' | 'page' | 'download' | 'search';
type ReviewCriterionId =
  | 'q1'
  | 'q2'
  | 'q3'
  | 'q4'
  | 'q5'
  | 'q6'
  | 'q7'
  | 'q8'
  | 'q9'
  | 'q10'
  | 'q11';
type ReviewForm = Partial<Record<ReviewCriterionId, ReviewAnswer>>;

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
  review_form: ReviewForm;
  review_form_2: ReviewForm;
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

interface AnalyticsSummaryCounts {
  lastDay: number;
  lastWeek: number;
  lastMonth: number;
  total: number;
}

interface AnalyticsDimensionMaps {
  devices: Record<string, number>;
  operatingSystems: Record<string, number>;
  countries: Record<string, number>;
  referrers: Record<string, number>;
  screenResolutions: Record<string, number>;
}

interface StoredAnalyticsRecord {
  entityType: AnalyticsEntityType;
  entityId: string;
  label: string;
  path: string;
  total: number;
  buckets: Record<string, number>;
  dimensions: AnalyticsDimensionMaps;
  createdAt: number;
  updatedAt: number;
  lastViewedAt: string;
}

interface AnalyticsSummaryPayload extends AnalyticsSummaryCounts {
  entityType: AnalyticsEntityType;
  entityId: string;
  label: string;
  path: string;
  lastViewedAt: string;
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
  ANALYTICS_START_AT?: string;
  ANALYTICS_PROVIDER?: string;
  CF_ACCOUNT_ID?: string;
  CF_API_TOKEN?: string;
  CF_WEB_ANALYTICS_SITE_TAG?: string;
  CF_WEB_ANALYTICS_HOST?: string;
}

const USERS_KEY = 'auth_users_v1';
const SUBMISSIONS_KEY = 'submissions_v1';
const EMAIL_TEMPLATES_KEY = 'email_templates_v1';
const ARTICLE_OVERRIDES_KEY = 'article_overrides_v1';
const ANALYTICS_KEY_PREFIX = 'analytics_entity_v2:';
const ANALYTICS_SNAPSHOT_PREFIX = 'analytics_snapshot_v1:';
const SUBMISSION_FILE_KEY_PREFIX = 'submission_file_v1:';
const DEFAULT_OTP_TTL_SECONDS = 30 * 24 * 60 * 60;
const DEFAULT_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const DEFAULT_SUBMISSION_RECIPIENTS = ['anuar@iafar.ro', 'confafar@gmail.com'];
const ANALYTICS_ARCHIVE_TIME_ZONE = 'Europe/Bucharest';
const ANALYTICS_ARCHIVE_HOUR = '22';
const ANALYTICS_ARCHIVE_MINUTE = '30';
const EDITABLE_ARTICLE_FIELDS: EditableArticleField[] = [
  'title',
  'authors',
  'affiliations',
  'emails',
  'abstract',
  'abstract_ro',
  'abstract_en',
  'abstract_de',
  'abstract_fr',
  'keywords',
  'keywords_ro',
  'keywords_en',
  'keywords_de',
  'keywords_fr',
  'pages_start',
  'pages_end',
  'doi',
  'language',
  'section',
  'pdf_path',
];
const MAX_SUBMISSION_FILES = 5;
const MAX_SUBMISSION_FILE_BYTES = 20 * 1024 * 1024;
const MAX_SUBMISSION_TOTAL_BYTES = 25 * 1024 * 1024;
const ANALYTICS_RETENTION_DAYS = 90;
const ANALYTICS_ENTITY_ID_LIMIT = 280;
const ANALYTICS_LABEL_LIMIT = 240;
const ANALYTICS_PATH_LIMIT = 320;
const ANALYTICS_DIMENSION_KEY_LIMIT = 120;
const DEFAULT_ANALYTICS_START_AT = '2026-03-09T14:00:00+02:00';
const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';
const REVIEW_CRITERIA_IDS: ReviewCriterionId[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11'];
const EDITABLE_EMAIL_TEMPLATE_FIELDS: (keyof EditableEmailTemplateFields)[] = [
  'subject',
  'heading',
  'greeting',
  'intro',
  'note',
  'action',
  'footer',
];
const TEMPLATE_SUBJECT_LIMIT = 240;
const TEMPLATE_FIELD_LIMIT = 4000;
const DEFAULT_PLACEHOLDERS = ['app_name', 'submission_id', 'title', 'status', 'decision'];
const EMAIL_TEMPLATE_DESCRIPTORS: EmailTemplateDescriptor[] = [
  {
    id: 'login_code',
    label: 'Cod de autentificare',
    description: 'Email trimis pentru autentificare prin cod.',
    placeholders: ['app_name', 'recipient_name', 'code', 'validity'],
    defaults: {
      subject: '{{app_name}} - cod de autentificare',
      heading: 'Cod de autentificare',
      greeting: '{{recipient_name}}',
      intro: 'Ai solicitat autentificarea in {{app_name}}. Codul tau este mai jos.',
      note: 'Codul este valabil {{validity}}.',
      action: 'Daca nu ai cerut acest cod, ignora mesajul.',
      footer: '',
    },
  },
  {
    id: 'account_credentials',
    label: 'Credențiale cont nou',
    description: 'Email trimis la crearea unui cont editorial nou.',
    placeholders: ['app_name', 'recipient_name', 'email', 'username', 'password', 'code', 'validity', 'role'],
    defaults: {
      subject: '{{app_name}} - cont nou editorial',
      heading: 'Cont creat în platformă',
      greeting: '{{recipient_name}}',
      intro: 'A fost creat un cont pentru tine în {{app_name}}. Mai jos ai datele inițiale de autentificare.',
      note: 'Poți folosi direct username + parola sau poți cere un cod nou pe email folosind emailul și parola contului.',
      action: 'Conectează-te în dashboard și schimbă fluxul de lucru după rolul primit.',
      footer: '',
    },
  },
  {
    id: 'submission_new_editorial',
    label: 'Submisie noua (editorial)',
    description: 'Notificare catre admin/editor cand intra un manuscris nou.',
    placeholders: [...DEFAULT_PLACEHOLDERS, 'authors', 'email', 'received_at'],
    defaults: {
      subject: '[Manuscris nou] {{title}}',
      heading: 'Notificare submisie noua',
      greeting: '',
      intro: 'A fost inregistrata o submisie noua in {{app_name}}.',
      note: 'Acesta este doar un email de notificare. Manuscrisul complet si fisierele sunt disponibile doar in panoul admin.',
      action: 'Redistribuie submisia catre un reviewer din dashboard-ul de administrare.',
      footer: 'Primita la: {{received_at}}',
    },
  },
  {
    id: 'submission_confirmation_author',
    label: 'Confirmare primire (autor)',
    description: 'Confirmare catre autor dupa trimiterea manuscrisului.',
    placeholders: [...DEFAULT_PLACEHOLDERS],
    defaults: {
      subject: '{{app_name}} - confirmare primire manuscris',
      heading: 'Manuscris primit',
      greeting: '',
      intro: 'Am primit manuscrisul tau pentru {{app_name}}.',
      note: '',
      action: 'Vei primi o notificare cand manuscrisul este trimis catre review si la decizia editoriala.',
      footer: '',
    },
  },
  {
    id: 'reviewer_assigned',
    label: 'Asignare reviewer',
    description: 'Notificare catre reviewer cand ii este asignata o submisie.',
    placeholders: [...DEFAULT_PLACEHOLDERS, 'reviewer_name', 'reviewer_deadline'],
    defaults: {
      subject: '{{app_name}} - submisie asignata pentru review',
      heading: 'Submisie asignata',
      greeting: '{{reviewer_name}}',
      intro: 'Ti-a fost alocata o submisie pentru evaluare in {{app_name}}.',
      note: '',
      action: 'Conecteaza-te in platforma pentru a analiza manuscrisul si a trimite recomandarea.',
      footer: '',
    },
  },
  {
    id: 'reviewer_unassigned',
    label: 'Retragere alocare reviewer',
    description: 'Notificare catre reviewer cand submisia este retrasa din alocare.',
    placeholders: [...DEFAULT_PLACEHOLDERS, 'reviewer_name'],
    defaults: {
      subject: '{{app_name}} - submisie retrasa din alocare',
      heading: 'Submisie realocata',
      greeting: '{{reviewer_name}}',
      intro: 'Submisia de mai jos a fost retrasa din alocarea ta in {{app_name}}.',
      note: '',
      action: 'Nu mai este necesara evaluarea pentru acest manuscris.',
      footer: '',
    },
  },
  {
    id: 'author_sent_to_review',
    label: 'Autor: trimis spre review',
    description: 'Notificare catre autor cand manuscrisul intra in evaluare.',
    placeholders: [...DEFAULT_PLACEHOLDERS, 'reviewers'],
    defaults: {
      subject: '{{app_name}} - manuscris trimis spre review',
      heading: 'Manuscris in evaluare',
      greeting: '',
      intro: 'Manuscrisul tau a fost trimis catre evaluare in {{app_name}}.',
      note: '',
      action: 'Vei primi o notificare dupa finalizarea evaluarii editoriale.',
      footer: '',
    },
  },
  {
    id: 'review_completed_editorial',
    label: 'Recenzie noua (editorial)',
    description: 'Notificare catre admin/editor cand reviewerul trimite evaluarea.',
    placeholders: [...DEFAULT_PLACEHOLDERS, 'reviewer_name', 'reviewer_recommendation'],
    defaults: {
      subject: '{{app_name}} - recenzie noua primita',
      heading: 'Recenzie noua',
      greeting: '',
      intro: 'Un reviewer a trimis recomandarea pentru o submisie din {{app_name}}.',
      note: '',
      action: 'Verifica observatiile in dashboard si finalizeaza decizia editoriala.',
      footer: '',
    },
  },
  {
    id: 'author_decision',
    label: 'Autor: decizie editoriala',
    description: 'Notificare catre autor dupa decizia finala.',
    placeholders: [...DEFAULT_PLACEHOLDERS],
    defaults: {
      subject: '{{app_name}} - decizie editoriala',
      heading: 'Decizie editoriala',
      greeting: '',
      intro: 'A fost inregistrata o decizie pentru manuscrisul tau in {{app_name}}.',
      note: '',
      action: '',
      footer: '',
    },
  },
];

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

function isEmailTemplateId(value: string): value is EmailTemplateId {
  return EMAIL_TEMPLATE_DESCRIPTORS.some((descriptor) => descriptor.id === value);
}

function templateDescriptorById(templateId: EmailTemplateId): EmailTemplateDescriptor {
  const descriptor = EMAIL_TEMPLATE_DESCRIPTORS.find((entry) => entry.id === templateId);
  if (!descriptor) {
    throw new Error(`Unsupported email template id: ${templateId}`);
  }
  return descriptor;
}

function clampTemplateField(field: keyof EditableEmailTemplateFields, rawValue: unknown): string {
  const value = asString(rawValue);
  if (field === 'subject') return value.slice(0, TEMPLATE_SUBJECT_LIMIT);
  return value.slice(0, TEMPLATE_FIELD_LIMIT);
}

function clampArticleField(field: EditableArticleField, rawValue: unknown): string {
  const value = asString(rawValue);
  if (field === 'abstract' || field === 'abstract_ro' || field === 'abstract_en' || field === 'abstract_de' || field === 'abstract_fr') {
    return value.slice(0, 12000);
  }
  if (field === 'keywords' || field === 'keywords_ro' || field === 'keywords_en' || field === 'keywords_de' || field === 'keywords_fr') {
    return value.slice(0, 4000);
  }
  if (field === 'title') return value.slice(0, 1000);
  if (field === 'authors' || field === 'affiliations') return value.slice(0, 2000);
  if (field === 'emails') return value.slice(0, 1000);
  if (field === 'pdf_path') return value.slice(0, 2000);
  return value.slice(0, 400);
}

function sanitizeArticleOverride(raw: unknown): StoredArticleOverride {
  if (!raw || typeof raw !== 'object') return {};
  const candidate = raw as Record<string, unknown>;
  const next: StoredArticleOverride = {};
  for (const field of EDITABLE_ARTICLE_FIELDS) {
    if (typeof candidate[field] === 'string') {
      next[field] = clampArticleField(field, candidate[field]);
    }
  }
  return next;
}

function parseStoredArticleOverrides(raw: string | null): StoredArticleOverrideMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return {};
    const next: StoredArticleOverrideMap = {};
    for (const [articleId, value] of Object.entries(parsed)) {
      const normalizedId = articleId.trim();
      if (!normalizedId) continue;
      next[normalizedId] = sanitizeArticleOverride(value);
    }
    return next;
  } catch {
    return {};
  }
}

function parseStoredEmailTemplates(raw: string | null): StoredEmailTemplateMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return {};
    const next: StoredEmailTemplateMap = {};

    for (const [templateId, value] of Object.entries(parsed)) {
      if (!isEmailTemplateId(templateId)) continue;
      if (!value || typeof value !== 'object') continue;
      const candidate = value as Record<string, unknown>;
      const cleaned: PartialEditableEmailTemplateFields = {};

      for (const field of EDITABLE_EMAIL_TEMPLATE_FIELDS) {
        if (field in candidate) {
          cleaned[field] = clampTemplateField(field, candidate[field]);
        }
      }

      if (Object.keys(cleaned).length > 0) {
        next[templateId] = cleaned;
      }
    }

    return next;
  } catch {
    return {};
  }
}

async function readEmailTemplates(env: Env): Promise<StoredEmailTemplateMap> {
  const raw = await env.AUTH_KV.get(EMAIL_TEMPLATES_KEY);
  return parseStoredEmailTemplates(raw);
}

async function writeEmailTemplates(env: Env, templates: StoredEmailTemplateMap) {
  await env.AUTH_KV.put(EMAIL_TEMPLATES_KEY, JSON.stringify(templates));
}

function mergeTemplateFields(
  templateId: EmailTemplateId,
  templates: StoredEmailTemplateMap,
): EditableEmailTemplateFields {
  const descriptor = templateDescriptorById(templateId);
  const custom = templates[templateId] || {};
  return {
    subject: custom.subject !== undefined ? custom.subject : descriptor.defaults.subject,
    heading: custom.heading !== undefined ? custom.heading : descriptor.defaults.heading,
    greeting: custom.greeting !== undefined ? custom.greeting : descriptor.defaults.greeting,
    intro: custom.intro !== undefined ? custom.intro : descriptor.defaults.intro,
    note: custom.note !== undefined ? custom.note : descriptor.defaults.note,
    action: custom.action !== undefined ? custom.action : descriptor.defaults.action,
    footer: custom.footer !== undefined ? custom.footer : descriptor.defaults.footer,
  };
}

function renderTemplateString(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => asString(vars[key]));
}

function resolveTemplateFields(
  templateId: EmailTemplateId,
  templates: StoredEmailTemplateMap,
  vars: Record<string, string>,
): EditableEmailTemplateFields {
  const merged = mergeTemplateFields(templateId, templates);
  return {
    subject: renderTemplateString(merged.subject, vars),
    heading: renderTemplateString(merged.heading, vars),
    greeting: renderTemplateString(merged.greeting, vars),
    intro: renderTemplateString(merged.intro, vars),
    note: renderTemplateString(merged.note, vars),
    action: renderTemplateString(merged.action, vars),
    footer: renderTemplateString(merged.footer, vars),
  };
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

function isReviewAnswer(value: string): value is ReviewAnswer {
  return value === 'yes' || value === 'partial' || value === 'no';
}

function parseReviewForm(value: unknown): ReviewForm {
  if (!value || typeof value !== 'object') return {};
  const candidate = value as Record<string, unknown>;
  const form: ReviewForm = {};

  for (const criterionId of REVIEW_CRITERIA_IDS) {
    const answer = asString(candidate[criterionId]).trim().toLowerCase();
    if (isReviewAnswer(answer)) {
      form[criterionId] = answer;
    }
  }

  return form;
}

function isCompleteReviewForm(form: ReviewForm): boolean {
  return REVIEW_CRITERIA_IDS.every((criterionId) => isReviewAnswer(asString(form[criterionId])));
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
          review_form: parseReviewForm(entry.review_form),
          review_form_2: parseReviewForm(entry.review_form_2),
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

async function readArticleOverrides(env: Env): Promise<StoredArticleOverrideMap> {
  const raw = await env.AUTH_KV.get(ARTICLE_OVERRIDES_KEY);
  return parseStoredArticleOverrides(raw);
}

async function writeArticleOverrides(env: Env, overrides: StoredArticleOverrideMap) {
  await env.AUTH_KV.put(ARTICLE_OVERRIDES_KEY, JSON.stringify(overrides));
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
    review_form: submission.review_form,
    review_form_2: submission.review_form_2,
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

function userRoleLabel(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'editor':
      return 'Editor';
    case 'reviewer':
      return 'Reviewer';
    case 'author':
      return 'Autor';
    default:
      return role;
  }
}

function generateSecurePassword(length = 14): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!#%*+-_';
  const chars = new Uint32Array(length);
  crypto.getRandomValues(chars);
  return Array.from(chars, (value) => alphabet[value % alphabet.length]).join('');
}

function isAnalyticsEntityType(value: string): value is AnalyticsEntityType {
  return value === 'article' || value === 'page' || value === 'download' || value === 'search';
}

function normalizeAnalyticsEntityId(entityType: AnalyticsEntityType, raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (entityType === 'page') {
    const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed.replace(/^\/+/, '')}`;
    return normalizedPath.slice(0, ANALYTICS_ENTITY_ID_LIMIT);
  }
  return trimmed.slice(0, ANALYTICS_ENTITY_ID_LIMIT);
}

function sanitizeAnalyticsLabel(raw: string, fallback: string): string {
  const normalized = raw.replace(/\s+/g, ' ').trim() || fallback;
  return normalized.slice(0, ANALYTICS_LABEL_LIMIT);
}

function sanitizeAnalyticsPath(raw: string, fallback = ''): string {
  const source = raw.trim() || fallback;
  if (!source) return '';
  const normalized = source.startsWith('/') ? source : `/${source.replace(/^\/+/, '')}`;
  return normalized.slice(0, ANALYTICS_PATH_LIMIT);
}

function emptyAnalyticsDimensions(): AnalyticsDimensionMaps {
  return {
    devices: {},
    operatingSystems: {},
    countries: {},
    referrers: {},
    screenResolutions: {},
  };
}

function sanitizeAnalyticsDimensionKey(raw: string, fallback: string): string {
  const normalized = raw.replace(/\s+/g, ' ').trim() || fallback;
  return normalized.slice(0, ANALYTICS_DIMENSION_KEY_LIMIT);
}

function normalizeAnalyticsDimensionCounts(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object') return {};
  const next: Record<string, number> = {};
  for (const [key, rawCount] of Object.entries(value as Record<string, unknown>)) {
    const count = Math.max(0, Math.round(Number(rawCount) || 0));
    const label = sanitizeAnalyticsDimensionKey(key, '');
    if (!label || count <= 0) continue;
    next[label] = count;
  }
  return next;
}

function normalizeAnalyticsDimensions(value: unknown): AnalyticsDimensionMaps {
  if (!value || typeof value !== 'object') return emptyAnalyticsDimensions();
  const record = value as Record<string, unknown>;
  return {
    devices: normalizeAnalyticsDimensionCounts(record.devices),
    operatingSystems: normalizeAnalyticsDimensionCounts(record.operatingSystems),
    countries: normalizeAnalyticsDimensionCounts(record.countries),
    referrers: normalizeAnalyticsDimensionCounts(record.referrers),
    screenResolutions: normalizeAnalyticsDimensionCounts(record.screenResolutions),
  };
}

function incrementAnalyticsDimension(bucket: Record<string, number>, key: string, amount = 1) {
  const label = sanitizeAnalyticsDimensionKey(key, '');
  if (!label) return;
  bucket[label] = (bucket[label] || 0) + amount;
}

function normalizeHostName(value: string): string {
  return value.trim().toLowerCase().replace(/^www\./, '');
}

function normalizeReferrerSource(rawReferrer: string, rawSiteHost: string): string {
  const referrer = rawReferrer.trim();
  if (!referrer) return 'Direct';

  try {
    const host = normalizeHostName(new URL(referrer).hostname);
    const siteHost = normalizeHostName(rawSiteHost);
    if (!host) return 'Direct';
    if (
      siteHost
      && (host === siteHost || host.endsWith(`.${siteHost}`) || siteHost.endsWith(`.${host}`))
    ) {
      return 'Intern';
    }
    return sanitizeAnalyticsDimensionKey(host, 'Extern');
  } catch {
    return 'Direct';
  }
}

function normalizeScreenResolution(raw: string): string {
  const trimmed = raw.trim();
  if (!/^\d{2,5}x\d{2,5}$/.test(trimmed)) return 'Necunoscută';
  return trimmed;
}

function detectAnalyticsDeviceType(userAgent: string): string {
  if (!userAgent) return 'Necunoscut';
  if (/(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(userAgent)) return 'Tabletă';
  if (/(mobi|iphone|ipod|android)/i.test(userAgent)) return 'Mobil';
  return 'Desktop';
}

function detectAnalyticsOperatingSystem(userAgent: string): string {
  if (!userAgent) return 'Necunoscut';
  if (/windows nt/i.test(userAgent)) return 'Windows';
  if (/ipad/i.test(userAgent)) return 'iPadOS';
  if (/(iphone|ipod|ios)/i.test(userAgent)) return 'iOS';
  if (/android/i.test(userAgent)) return 'Android';
  if (/(mac os x|macintosh)/i.test(userAgent)) return 'macOS';
  if (/cros/i.test(userAgent)) return 'ChromeOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  return 'Necunoscut';
}

function detectAnalyticsCountryCode(request: Request): string {
  const cf = (request as Request & { cf?: { country?: string } }).cf;
  const country = asString(cf?.country).trim().toUpperCase();
  return /^[A-Z]{2}$/.test(country) ? country : 'XX';
}

function buildAnalyticsDimensionsFromRequest(request: Request, body: Record<string, unknown>): AnalyticsDimensionMaps {
  const userAgent = request.headers.get('user-agent') || '';
  const siteHost = asString(body.siteHost);

  return {
    devices: { [detectAnalyticsDeviceType(userAgent)]: 1 },
    operatingSystems: { [detectAnalyticsOperatingSystem(userAgent)]: 1 },
    countries: { [detectAnalyticsCountryCode(request)]: 1 },
    referrers: { [normalizeReferrerSource(asString(body.referrer), siteHost)]: 1 },
    screenResolutions: { [normalizeScreenResolution(asString(body.screenResolution))]: 1 },
  };
}

function mergeAnalyticsDimensions(target: AnalyticsDimensionMaps, increment: AnalyticsDimensionMaps) {
  (Object.keys(target) as (keyof AnalyticsDimensionMaps)[]).forEach((key) => {
    for (const [entryKey, value] of Object.entries(increment[key])) {
      incrementAnalyticsDimension(target[key], entryKey, value);
    }
  });
}

function sumAnalyticsDimensionMaps(records: StoredAnalyticsRecord[]): AnalyticsDimensionMaps {
  const aggregate = emptyAnalyticsDimensions();
  for (const record of records) {
    mergeAnalyticsDimensions(aggregate, record.dimensions);
  }
  return aggregate;
}

function analyticsStorageKey(entityType: AnalyticsEntityType, entityId: string): string {
  return `${ANALYTICS_KEY_PREFIX}${entityType}:${encodeURIComponent(entityId)}`;
}

function analyticsToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function analyticsStartAtMs(env: Env): number {
  const raw = asString(env.ANALYTICS_START_AT).trim() || DEFAULT_ANALYTICS_START_AT;
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function shiftAnalyticsDay(day: string, offset: number): string {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function analyticsDateWindow(days: number, endDay = analyticsToday()): string[] {
  const window: string[] = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    window.push(shiftAnalyticsDay(endDay, -index));
  }
  return window;
}

function pruneAnalyticsBuckets(buckets: Record<string, number>, endDay = analyticsToday()): Record<string, number> {
  const cutoff = shiftAnalyticsDay(endDay, -(ANALYTICS_RETENTION_DAYS - 1));
  const next: Record<string, number> = {};
  for (const [day, count] of Object.entries(buckets)) {
    if (typeof count !== 'number' || !Number.isFinite(count) || count <= 0) continue;
    if (day < cutoff || day > endDay) continue;
    next[day] = Math.round(count);
  }
  return next;
}

function sumAnalyticsWindow(buckets: Record<string, number>, days: number, endDay = analyticsToday()): number {
  const allowed = new Set(analyticsDateWindow(days, endDay));
  let total = 0;
  for (const [day, count] of Object.entries(buckets)) {
    if (allowed.has(day)) total += Number(count) || 0;
  }
  return total;
}

function summarizeAnalyticsRecord(record: StoredAnalyticsRecord, endDay = analyticsToday()): AnalyticsSummaryPayload {
  const buckets = pruneAnalyticsBuckets(record.buckets, endDay);
  const retainedTotal = Object.values(buckets).reduce((sum, count) => sum + (Number(count) || 0), 0);
  return {
    entityType: record.entityType,
    entityId: record.entityId,
    label: record.label,
    path: record.path,
    lastViewedAt: record.lastViewedAt,
    lastDay: sumAnalyticsWindow(buckets, 1, endDay),
    lastWeek: sumAnalyticsWindow(buckets, 7, endDay),
    lastMonth: sumAnalyticsWindow(buckets, 30, endDay),
    total: Math.max(
      0,
      retainedTotal,
      Math.round(Number(record.total) || 0),
    ),
  };
}

function sumAnalyticsSummaries(summaries: AnalyticsSummaryPayload[]): AnalyticsSummaryCounts {
  return summaries.reduce<AnalyticsSummaryCounts>((accumulator, current) => ({
    lastDay: accumulator.lastDay + current.lastDay,
    lastWeek: accumulator.lastWeek + current.lastWeek,
    lastMonth: accumulator.lastMonth + current.lastMonth,
    total: accumulator.total + current.total,
  }), {
    lastDay: 0,
    lastWeek: 0,
    lastMonth: 0,
    total: 0,
  });
}

function analyticsTimeline(records: StoredAnalyticsRecord[], endDay = analyticsToday(), days = 30) {
  const dates = analyticsDateWindow(days, endDay);
  return dates.map((date) => ({
    date,
    views: records.reduce((sum, record) => sum + (record.buckets[date] || 0), 0),
  }));
}

function sortAnalyticsSummaries(summaries: AnalyticsSummaryPayload[]): AnalyticsSummaryPayload[] {
  return [...summaries].sort((left, right) => (
    right.lastMonth - left.lastMonth
      || right.total - left.total
      || right.lastWeek - left.lastWeek
      || left.label.localeCompare(right.label)
  ));
}

async function readAnalyticsRecord(
  env: Env,
  entityType: AnalyticsEntityType,
  entityId: string,
): Promise<StoredAnalyticsRecord | null> {
  const raw = await env.AUTH_KV.get(analyticsStorageKey(entityType, entityId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredAnalyticsRecord>;
    if (
      !parsed
      || !isAnalyticsEntityType(asString(parsed.entityType))
      || asString(parsed.entityId) !== entityId
    ) {
      return null;
    }
    return {
      entityType: parsed.entityType,
      entityId,
      label: sanitizeAnalyticsLabel(asString(parsed.label), entityId),
      path: sanitizeAnalyticsPath(asString(parsed.path)),
      total: Math.max(0, Math.round(Number(parsed.total) || 0)),
      buckets: pruneAnalyticsBuckets((parsed.buckets && typeof parsed.buckets === 'object' ? parsed.buckets : {}) as Record<string, number>),
      dimensions: normalizeAnalyticsDimensions(parsed.dimensions),
      createdAt: Number(parsed.createdAt) || Date.now(),
      updatedAt: Number(parsed.updatedAt) || Date.now(),
      lastViewedAt: asString(parsed.lastViewedAt),
    };
  } catch {
    return null;
  }
}

async function writeAnalyticsRecord(env: Env, record: StoredAnalyticsRecord): Promise<void> {
  await env.AUTH_KV.put(
    analyticsStorageKey(record.entityType, record.entityId),
    JSON.stringify({
      ...record,
      buckets: pruneAnalyticsBuckets(record.buckets),
    }),
  );
}

async function listAnalyticsRecords(env: Env): Promise<StoredAnalyticsRecord[]> {
  let cursor: string | undefined;
  const keys: string[] = [];

  do {
    const page = await env.AUTH_KV.list({ prefix: ANALYTICS_KEY_PREFIX, cursor, limit: 1000 });
    for (const key of page.keys) {
      keys.push(key.name);
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  const records = await Promise.all(keys.map(async (key) => {
    const raw = await env.AUTH_KV.get(key);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<StoredAnalyticsRecord>;
      const entityType = asString(parsed.entityType);
      const entityId = asString(parsed.entityId);
      if (!isAnalyticsEntityType(entityType) || !entityId) return null;
      return {
        entityType,
        entityId,
        label: sanitizeAnalyticsLabel(asString(parsed.label), entityId),
        path: sanitizeAnalyticsPath(asString(parsed.path)),
        total: Math.max(0, Math.round(Number(parsed.total) || 0)),
        buckets: pruneAnalyticsBuckets((parsed.buckets && typeof parsed.buckets === 'object' ? parsed.buckets : {}) as Record<string, number>),
        dimensions: normalizeAnalyticsDimensions(parsed.dimensions),
        createdAt: Number(parsed.createdAt) || Date.now(),
        updatedAt: Number(parsed.updatedAt) || Date.now(),
        lastViewedAt: asString(parsed.lastViewedAt),
      } satisfies StoredAnalyticsRecord;
    } catch {
      return null;
    }
  }));

  return records.filter((entry): entry is StoredAnalyticsRecord => Boolean(entry));
}

function buildStoredAnalyticsPayload(records: StoredAnalyticsRecord[]) {
  const articleRecords = records.filter((record) => record.entityType === 'article');
  const pageRecords = records.filter((record) => record.entityType === 'page');
  const downloadRecords = records.filter((record) => record.entityType === 'download');
  const searchRecords = records.filter((record) => record.entityType === 'search');
  const articles = sortAnalyticsSummaries(articleRecords.map((record) => summarizeAnalyticsRecord(record)));
  const pages = sortAnalyticsSummaries(pageRecords.map((record) => summarizeAnalyticsRecord(record)));
  const downloads = sortAnalyticsSummaries(downloadRecords.map((record) => summarizeAnalyticsRecord(record)));
  const searches = sortAnalyticsSummaries(searchRecords.map((record) => summarizeAnalyticsRecord(record)));

  return {
    ok: true,
    articles,
    pages,
    downloads,
    searches,
    articleTotals: sumAnalyticsSummaries(articles),
    pageTotals: sumAnalyticsSummaries(pages),
    downloadTotals: sumAnalyticsSummaries(downloads),
    searchTotals: sumAnalyticsSummaries(searches),
    articleTimeline: analyticsTimeline(articleRecords),
    pageTimeline: analyticsTimeline(pageRecords),
    downloadTimeline: analyticsTimeline(downloadRecords),
    searchTimeline: analyticsTimeline(searchRecords),
    articleBreakdown: sumAnalyticsDimensionMaps(articleRecords),
    pageBreakdown: sumAnalyticsDimensionMaps(pageRecords),
    downloadBreakdown: sumAnalyticsDimensionMaps(downloadRecords),
    searchBreakdown: sumAnalyticsDimensionMaps(searchRecords),
  };
}

function filterAnalyticsRecordsByTypes(
  records: StoredAnalyticsRecord[],
  entityTypes: AnalyticsEntityType[],
): StoredAnalyticsRecord[] {
  const allowed = new Set<AnalyticsEntityType>(entityTypes);
  return records.filter((record) => allowed.has(record.entityType));
}

function mergeAnalyticsPayloads(
  cloudflarePayload: CloudflareMappedAnalyticsPayload,
  localPayload: ReturnType<typeof buildStoredAnalyticsPayload>,
) {
  const articles = mergeAnalyticsSummaryCollections(cloudflarePayload.articles, localPayload.articles);
  const pages = mergeAnalyticsSummaryCollections(cloudflarePayload.pages, localPayload.pages);
  const downloads = mergeAnalyticsSummaryCollections(cloudflarePayload.downloads, localPayload.downloads);
  const searches = mergeAnalyticsSummaryCollections(cloudflarePayload.searches, localPayload.searches);

  return {
    ok: true,
    articles,
    pages,
    downloads,
    searches,
    articleTotals: sumAnalyticsSummaries(articles),
    pageTotals: sumAnalyticsSummaries(pages),
    downloadTotals: sumAnalyticsSummaries(downloads),
    searchTotals: sumAnalyticsSummaries(searches),
    articleTimeline: mergeAnalyticsTimelineSeries(cloudflarePayload.articleTimeline, localPayload.articleTimeline),
    pageTimeline: mergeAnalyticsTimelineSeries(cloudflarePayload.pageTimeline, localPayload.pageTimeline),
    downloadTimeline: mergeAnalyticsTimelineSeries(cloudflarePayload.downloadTimeline, localPayload.downloadTimeline),
    searchTimeline: mergeAnalyticsTimelineSeries(cloudflarePayload.searchTimeline, localPayload.searchTimeline),
    articleBreakdown: mergeAnalyticsDimensionMaps(cloudflarePayload.articleBreakdown, localPayload.articleBreakdown),
    pageBreakdown: mergeAnalyticsDimensionMaps(cloudflarePayload.pageBreakdown, localPayload.pageBreakdown),
    downloadBreakdown: mergeAnalyticsDimensionMaps(cloudflarePayload.downloadBreakdown, localPayload.downloadBreakdown),
    searchBreakdown: mergeAnalyticsDimensionMaps(cloudflarePayload.searchBreakdown, localPayload.searchBreakdown),
  };
}

function mergeAnalyticsCounts(
  left: AnalyticsSummaryCounts,
  right: AnalyticsSummaryCounts,
): AnalyticsSummaryCounts {
  return {
    lastDay: left.lastDay + right.lastDay,
    lastWeek: left.lastWeek + right.lastWeek,
    lastMonth: left.lastMonth + right.lastMonth,
    total: left.total + right.total,
  };
}

function mergeAnalyticsSummaryPayloads(
  left: AnalyticsSummaryPayload,
  right: AnalyticsSummaryPayload,
): AnalyticsSummaryPayload {
  const leftViewedAt = Date.parse(left.lastViewedAt || '');
  const rightViewedAt = Date.parse(right.lastViewedAt || '');
  const lastViewedAt = Number.isFinite(leftViewedAt) && Number.isFinite(rightViewedAt)
    ? (leftViewedAt >= rightViewedAt ? left.lastViewedAt : right.lastViewedAt)
    : (right.lastViewedAt || left.lastViewedAt);

  return {
    entityType: left.entityType,
    entityId: left.entityId,
    label: right.label || left.label,
    path: left.path || right.path,
    lastViewedAt,
    ...mergeAnalyticsCounts(left, right),
  };
}

function mergeAnalyticsSummaryCollections(
  left: AnalyticsSummaryPayload[],
  right: AnalyticsSummaryPayload[],
): AnalyticsSummaryPayload[] {
  const merged = new Map<string, AnalyticsSummaryPayload>();

  for (const item of left) {
    merged.set(`${item.entityType}:${item.entityId}`, item);
  }

  for (const item of right) {
    const key = `${item.entityType}:${item.entityId}`;
    const existing = merged.get(key);
    merged.set(key, existing ? mergeAnalyticsSummaryPayloads(existing, item) : item);
  }

  return sortAnalyticsSummaries(Array.from(merged.values()));
}

function mergeAnalyticsTimelineSeries(
  left: { date: string; views: number }[],
  right: { date: string; views: number }[],
) {
  const merged = new Map<string, number>();
  for (const point of left) {
    merged.set(point.date, (merged.get(point.date) || 0) + point.views);
  }
  for (const point of right) {
    merged.set(point.date, (merged.get(point.date) || 0) + point.views);
  }

  return Array.from(merged.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, views]) => ({ date, views }));
}

function mergeAnalyticsDimensionMaps(
  left: AnalyticsDimensionMaps,
  right: AnalyticsDimensionMaps,
): AnalyticsDimensionMaps {
  const merged = emptyAnalyticsDimensions();
  mergeAnalyticsDimensions(merged, left);
  mergeAnalyticsDimensions(merged, right);
  return merged;
}

type CloudflareRumGroup = {
  dimensions?: Record<string, unknown>;
  sum?: Record<string, unknown>;
};

type CloudflareMappedAnalyticsPayload = {
  ok: true;
  articles: AnalyticsSummaryPayload[];
  pages: AnalyticsSummaryPayload[];
  downloads: AnalyticsSummaryPayload[];
  searches: AnalyticsSummaryPayload[];
  articleTotals: AnalyticsSummaryCounts;
  pageTotals: AnalyticsSummaryCounts;
  downloadTotals: AnalyticsSummaryCounts;
  searchTotals: AnalyticsSummaryCounts;
  articleTimeline: { date: string; views: number }[];
  pageTimeline: { date: string; views: number }[];
  downloadTimeline: { date: string; views: number }[];
  searchTimeline: { date: string; views: number }[];
  articleBreakdown: AnalyticsDimensionMaps;
  pageBreakdown: AnalyticsDimensionMaps;
  downloadBreakdown: AnalyticsDimensionMaps;
  searchBreakdown: AnalyticsDimensionMaps;
};

type AnalyticsDashboardPayload = CloudflareMappedAnalyticsPayload;

type AnalyticsSnapshot = {
  day: string;
  archivedAt: string;
  payload: AnalyticsDashboardPayload;
};

function analyticsSnapshotKey(day: string): string {
  return `${ANALYTICS_SNAPSHOT_PREFIX}${day}`;
}

async function archiveAnalyticsSnapshotOncePerDay(
  env: Env,
  payload: AnalyticsDashboardPayload,
): Promise<void> {
  const day = analyticsToday();
  const key = analyticsSnapshotKey(day);
  const existing = await env.AUTH_KV.get(key);
  if (existing) return;

  const snapshot: AnalyticsSnapshot = {
    day,
    archivedAt: new Date().toISOString(),
    payload,
  };
  await env.AUTH_KV.put(key, JSON.stringify(snapshot));
}

function shouldRunAnalyticsArchiveAt(date: Date): boolean {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: ANALYTICS_ARCHIVE_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const hour = parts.find((part) => part.type === 'hour')?.value || '';
  const minute = parts.find((part) => part.type === 'minute')?.value || '';
  return hour === ANALYTICS_ARCHIVE_HOUR && minute === ANALYTICS_ARCHIVE_MINUTE;
}

async function buildAnalyticsDashboardPayload(env: Env): Promise<AnalyticsDashboardPayload> {
  const records = await listAnalyticsRecords(env);

  if (records.length > 0 && !isCloudflareAnalyticsProviderSelected(env)) {
    return buildStoredAnalyticsPayload(records);
  }

  if (isCloudflareAnalyticsProviderSelected(env)) {
    if (!hasCloudflareAnalyticsCredentials(env)) {
      throw new Error('Cloudflare Web Analytics este activat, dar lipsește configurația API (CF_API_TOKEN / site tag).');
    }

    try {
      const mapped = await buildCloudflareMappedAnalytics(env);
      const localPayload = buildStoredAnalyticsPayload(records);
      return mergeAnalyticsPayloads(mapped, localPayload);
    } catch (error) {
      console.error('Cloudflare analytics mapping failed', error);
      if (records.length > 0) {
        return buildStoredAnalyticsPayload(records);
      }
      throw new Error('Nu am putut încărca statisticile din Cloudflare Web Analytics.');
    }
  }

  return buildStoredAnalyticsPayload(records);
}

async function handleScheduledAnalyticsArchive(env: Env): Promise<void> {
  if (!shouldRunAnalyticsArchiveAt(new Date())) {
    return;
  }

  const payload = await buildAnalyticsDashboardPayload(env);
  await archiveAnalyticsSnapshotOncePerDay(env, payload);
}

function isCloudflareAnalyticsProviderSelected(env: Env): boolean {
  const provider = asString(env.ANALYTICS_PROVIDER).trim().toLowerCase();
  return provider === 'cloudflare';
}

function hasCloudflareAnalyticsCredentials(env: Env): boolean {
  const accountId = asString(env.CF_ACCOUNT_ID).trim();
  const apiToken = asString(env.CF_API_TOKEN).trim();
  const siteTag = asString(env.CF_WEB_ANALYTICS_SITE_TAG).trim();
  const host = asString(env.CF_WEB_ANALYTICS_HOST).trim();

  return Boolean(accountId && apiToken && (siteTag || host));
}

function isCloudflareAnalyticsEnabled(env: Env): boolean {
  return isCloudflareAnalyticsProviderSelected(env) && hasCloudflareAnalyticsCredentials(env);
}

function cloudflareAuthHeaders(env: Env): HeadersInit {
  return {
    Authorization: `Bearer ${asString(env.CF_API_TOKEN).trim()}`,
    'Content-Type': 'application/json',
  };
}

function parseGraphqlGroups(payload: unknown): CloudflareRumGroup[] | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = (payload as { data?: unknown }).data;
  if (!data || typeof data !== 'object') return null;
  const viewer = (data as { viewer?: unknown }).viewer;
  if (!viewer || typeof viewer !== 'object') return null;
  const accounts = (viewer as { accounts?: unknown }).accounts;
  if (!Array.isArray(accounts) || accounts.length === 0) return null;
  const first = accounts[0] as { rumPageloadEventsAdaptiveGroups?: unknown };
  if (!first || !Array.isArray(first.rumPageloadEventsAdaptiveGroups)) return null;
  return first.rumPageloadEventsAdaptiveGroups as CloudflareRumGroup[];
}

function getGraphqlErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const errors = (payload as { errors?: unknown }).errors;
  if (!Array.isArray(errors) || errors.length === 0) return '';
  const first = errors[0];
  if (!first || typeof first !== 'object') return 'GraphQL error';
  const message = asString((first as { message?: unknown }).message).trim();
  return message || 'GraphQL error';
}

async function resolveCloudflareSiteTag(env: Env): Promise<string | null> {
  const accountId = asString(env.CF_ACCOUNT_ID).trim();
  const preferredHost = normalizeHostName(asString(env.CF_WEB_ANALYTICS_HOST).trim());
  if (accountId && preferredHost) {
    const response = await fetch(`${CLOUDFLARE_API_BASE}/accounts/${accountId}/rum/site_info/list`, {
      method: 'GET',
      headers: cloudflareAuthHeaders(env),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Cloudflare site_info/list failed (${response.status}): ${errorBody.slice(0, 240)}`);
    }

    const payload = await response.json() as { result?: unknown };
    const result = Array.isArray(payload?.result) ? payload.result : [];
    const match = result.find((entry) => {
      const record = entry as { host?: unknown };
      const host = normalizeHostName(asString(record.host));
      return host === preferredHost;
    }) as { site_tag?: unknown } | undefined;

    if (match) {
      const siteTag = asString(match.site_tag).trim();
      if (siteTag) return siteTag;
    }

    if (result.length > 0) {
      const firstSiteTag = asString((result[0] as { site_tag?: unknown }).site_tag).trim();
      if (firstSiteTag) return firstSiteTag;
    }
  }

  const explicitSiteTag = asString(env.CF_WEB_ANALYTICS_SITE_TAG).trim();
  return explicitSiteTag || null;
}

async function queryCloudflareRumGroups(
  env: Env,
  siteTag: string,
  startIso: string,
  endIso: string,
  dimensionsList: string[],
): Promise<CloudflareRumGroup[]> {
  const accountId = asString(env.CF_ACCOUNT_ID).trim();
  const filters = [
    `filter: { datetime_geq: ${JSON.stringify(startIso)}, datetime_leq: ${JSON.stringify(endIso)}, siteTag: ${JSON.stringify(siteTag)} }`,
    `filter: { datetime_geq: ${JSON.stringify(startIso)}, datetime_leq: ${JSON.stringify(endIso)}, siteTag_in: [${JSON.stringify(siteTag)}] }`,
  ];

  const errors: string[] = [];

  for (const dimensions of dimensionsList) {
    for (const filterClause of filters) {
      const query = `query {
  viewer {
    accounts(filter: { accountTag: ${JSON.stringify(accountId)} }) {
      rumPageloadEventsAdaptiveGroups(
        limit: 5000
        ${filterClause}
      ) {
        dimensions { ${dimensions} }
        sum { visits }
      }
    }
  }
}`;

      const response = await fetch(`${CLOUDFLARE_API_BASE}/graphql`, {
        method: 'POST',
        headers: cloudflareAuthHeaders(env),
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const body = await response.text();
        errors.push(`HTTP ${response.status}: ${body.slice(0, 220)}`);
        continue;
      }

      const payload = await response.json();
      const groups = parseGraphqlGroups(payload);
      if (groups) return groups;

      const errorMessage = getGraphqlErrorMessage(payload);
      if (errorMessage) errors.push(errorMessage);
    }
  }

  throw new Error(`Cloudflare GraphQL query failed: ${errors.join(' | ') || 'unknown error'}`);
}

function cloudflareDimensionValue(
  row: CloudflareRumGroup,
  keys: string[],
  fallback = '',
): string {
  const dimensions = row.dimensions;
  if (!dimensions || typeof dimensions !== 'object') return fallback;

  for (const key of keys) {
    const value = asString((dimensions as Record<string, unknown>)[key]).trim();
    if (value) return value;
  }

  return fallback;
}

function cloudflareViews(row: CloudflareRumGroup): number {
  const sum = row.sum;
  if (!sum || typeof sum !== 'object') return 0;

  const asRecord = sum as Record<string, unknown>;
  const candidates = ['pageViews', 'pageviews', 'visits'];
  for (const key of candidates) {
    const value = Number(asRecord[key]);
    if (Number.isFinite(value) && value > 0) return Math.round(value);
  }
  return 0;
}

function normalizeCloudflarePath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '/';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed.replace(/^\/+/, '')}`;
}

function analyticsRangeStartIso(
  now: number,
  durationMs: number,
  analyticsStartMs: number,
): string {
  return new Date(Math.max(now - durationMs, analyticsStartMs)).toISOString();
}

function isPublicAnalyticsPath(path: string): boolean {
  const normalized = normalizeCloudflarePath(path).toLowerCase();
  if (normalized === '/') return true;
  if (
    normalized === '/archive'
    || normalized === '/search'
    || normalized === '/submit'
    || normalized === '/about'
    || normalized === '/politici'
    || normalized === '/doaj'
    || normalized === '/scientific-board'
    || normalized === '/editorial-board'
    || normalized === '/tehnoredactare'
  ) {
    return true;
  }
  return normalized.startsWith('/archive/') || normalized.startsWith('/article/');
}

function cloudflareCategoryForPath(path: string): AnalyticsEntityType {
  const normalized = normalizeCloudflarePath(path).toLowerCase();
  if (normalized.startsWith('/article/')) return 'article';
  return 'page';
}

function cloudflareEntityIdForPath(entityType: AnalyticsEntityType, path: string): string {
  const normalized = normalizeCloudflarePath(path);
  if (entityType === 'article') {
    const articleId = normalized.split('/')[2] || normalized;
    return decodeURIComponent(articleId).trim() || normalized;
  }
  if (entityType === 'search') return 'search';
  return normalized;
}

function cloudflareLabelForPath(entityType: AnalyticsEntityType, path: string): string {
  const normalized = normalizeCloudflarePath(path);
  if (entityType === 'article') {
    const entityId = cloudflareEntityIdForPath(entityType, normalized);
    return `Articol ${entityId}`;
  }
  if (entityType === 'download') {
    const file = normalized.split('/').filter(Boolean).pop() || normalized;
    return `Descărcare ${decodeURIComponent(file)}`;
  }
  if (entityType === 'search') return 'Căutare în arhivă';
  if (normalized === '/') return 'Acasă';
  if (normalized === '/archive') return 'Arhivă';
  if (normalized === '/search') return 'Căutare';
  if (normalized === '/submit') return 'Trimite manuscris';
  return decodeURIComponent(normalized.replace(/^\/+/, '').replace(/[-_]+/g, ' '));
}

function emptyCloudflareTimeline(): { date: string; views: number }[] {
  return analyticsDateWindow(30).map((date) => ({ date, views: 0 }));
}

function mergeCloudflareDimensions(
  aggregate: AnalyticsDimensionMaps,
  row: CloudflareRumGroup,
  siteHost: string,
  views: number,
) {
  const deviceType = cloudflareDimensionValue(row, ['deviceType', 'device_type'], 'Necunoscut');
  const operatingSystem = cloudflareDimensionValue(
    row,
    ['operatingSystem', 'os', 'operating_system'],
    'Necunoscut',
  );
  const country = cloudflareDimensionValue(
    row,
    ['countryName', 'country', 'countryCode', 'clientCountryName'],
    'Necunoscută',
  );
  const referrerHost = cloudflareDimensionValue(
    row,
    ['refererHost', 'referrerHost', 'referer_path', 'referrerPath'],
    '',
  );

  incrementAnalyticsDimension(aggregate.devices, deviceType, views);
  incrementAnalyticsDimension(aggregate.operatingSystems, operatingSystem, views);
  incrementAnalyticsDimension(aggregate.countries, country, views);
  incrementAnalyticsDimension(aggregate.referrers, normalizeReferrerSource(referrerHost, siteHost), views);
}

async function buildCloudflareMappedAnalytics(env: Env): Promise<CloudflareMappedAnalyticsPayload> {
  const siteTag = await resolveCloudflareSiteTag(env);
  if (!siteTag) {
    throw new Error('Nu am putut identifica site_tag pentru Cloudflare Web Analytics.');
  }

  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const analyticsStartMs = Math.max(0, analyticsStartAtMs(env));
  const totalStartIso = new Date(analyticsStartMs > 0 ? analyticsStartMs : now - (90 * 24 * 60 * 60 * 1000)).toISOString();
  const lastDayIso = analyticsRangeStartIso(now, 24 * 60 * 60 * 1000, analyticsStartMs);
  const lastWeekIso = analyticsRangeStartIso(now, 7 * 24 * 60 * 60 * 1000, analyticsStartMs);
  const lastMonthIso = analyticsRangeStartIso(now, 30 * 24 * 60 * 60 * 1000, analyticsStartMs);
  const dimensionQueries = [
    'requestPath deviceType operatingSystem countryName refererHost',
    'requestPath deviceType operatingSystem countryName referrerHost',
    'requestPath',
  ];

  const [dayRows, weekRows, monthRows, totalRows] = await Promise.all([
    queryCloudflareRumGroups(env, siteTag, lastDayIso, nowIso, dimensionQueries),
    queryCloudflareRumGroups(env, siteTag, lastWeekIso, nowIso, dimensionQueries),
    queryCloudflareRumGroups(env, siteTag, lastMonthIso, nowIso, dimensionQueries),
    queryCloudflareRumGroups(env, siteTag, totalStartIso, nowIso, dimensionQueries),
  ]);

  const rangeMaps = {
    day: new Map<string, number>(),
    week: new Map<string, number>(),
    month: new Map<string, number>(),
    total: new Map<string, number>(),
  };

  const fillRangeMap = (target: Map<string, number>, rows: CloudflareRumGroup[]) => {
    for (const row of rows) {
      const path = normalizeCloudflarePath(cloudflareDimensionValue(row, ['path', 'requestPath', 'clientRequestPath'], '/'));
      if (!isPublicAnalyticsPath(path)) continue;
      const views = cloudflareViews(row);
      if (views <= 0) continue;
      target.set(path, (target.get(path) || 0) + views);
    }
  };

  fillRangeMap(rangeMaps.day, dayRows);
  fillRangeMap(rangeMaps.week, weekRows);
  fillRangeMap(rangeMaps.month, monthRows);
  fillRangeMap(rangeMaps.total, totalRows);

  const keys = new Set<string>([
    ...rangeMaps.day.keys(),
    ...rangeMaps.week.keys(),
    ...rangeMaps.month.keys(),
    ...rangeMaps.total.keys(),
  ]);

  const byType: Record<AnalyticsEntityType, AnalyticsSummaryPayload[]> = {
    article: [],
    page: [],
    download: [],
    search: [],
  };

  const breakdownByType: Record<AnalyticsEntityType, AnalyticsDimensionMaps> = {
    article: emptyAnalyticsDimensions(),
    page: emptyAnalyticsDimensions(),
    download: emptyAnalyticsDimensions(),
    search: emptyAnalyticsDimensions(),
  };

  const siteHost = asString(env.CF_WEB_ANALYTICS_HOST).trim();

  for (const row of monthRows) {
    const path = normalizeCloudflarePath(cloudflareDimensionValue(row, ['path', 'requestPath', 'clientRequestPath'], '/'));
    if (!isPublicAnalyticsPath(path)) continue;
    const views = cloudflareViews(row);
    if (views <= 0) continue;
    const category = cloudflareCategoryForPath(path);
    mergeCloudflareDimensions(breakdownByType[category], row, siteHost, views);
  }

  for (const path of keys) {
    const entityType = cloudflareCategoryForPath(path);
    const entityId = cloudflareEntityIdForPath(entityType, path);
    const summary: AnalyticsSummaryPayload = {
      entityType,
      entityId,
      label: sanitizeAnalyticsLabel(cloudflareLabelForPath(entityType, path), entityId),
      path: sanitizeAnalyticsPath(path),
      lastViewedAt: '',
      lastDay: rangeMaps.day.get(path) || 0,
      lastWeek: rangeMaps.week.get(path) || 0,
      lastMonth: rangeMaps.month.get(path) || 0,
      total: rangeMaps.total.get(path) || 0,
    };
    byType[entityType].push(summary);
  }

  const articles = sortAnalyticsSummaries(byType.article);
  const pages = sortAnalyticsSummaries(byType.page);
  const downloads = sortAnalyticsSummaries(byType.download);
  const searches = sortAnalyticsSummaries(byType.search);

  return {
    ok: true,
    articles,
    pages,
    downloads,
    searches,
    articleTotals: sumAnalyticsSummaries(articles),
    pageTotals: sumAnalyticsSummaries(pages),
    downloadTotals: sumAnalyticsSummaries(downloads),
    searchTotals: sumAnalyticsSummaries(searches),
    articleTimeline: emptyCloudflareTimeline(),
    pageTimeline: emptyCloudflareTimeline(),
    downloadTimeline: emptyCloudflareTimeline(),
    searchTimeline: emptyCloudflareTimeline(),
    articleBreakdown: breakdownByType.article,
    pageBreakdown: breakdownByType.page,
    downloadBreakdown: breakdownByType.download,
    searchBreakdown: breakdownByType.search,
  };
}

function cloudflarePathForEntity(entityType: AnalyticsEntityType, entityId: string): string {
  if (entityType === 'article') return normalizeCloudflarePath(`/article/${entityId}`);
  if (entityType === 'search') return '/search';
  return normalizeCloudflarePath(entityId);
}

async function buildCloudflareEntitySummary(
  env: Env,
  entityType: AnalyticsEntityType,
  entityId: string,
): Promise<AnalyticsSummaryPayload> {
  const siteTag = await resolveCloudflareSiteTag(env);
  if (!siteTag) {
    throw new Error('Nu am putut identifica site_tag pentru Cloudflare Web Analytics.');
  }

  const targetPath = cloudflarePathForEntity(entityType, entityId);
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const analyticsStartMs = Math.max(0, analyticsStartAtMs(env));
  const totalStartIso = new Date(analyticsStartMs > 0 ? analyticsStartMs : now - (90 * 24 * 60 * 60 * 1000)).toISOString();
  const lastDayIso = analyticsRangeStartIso(now, 24 * 60 * 60 * 1000, analyticsStartMs);
  const lastWeekIso = analyticsRangeStartIso(now, 7 * 24 * 60 * 60 * 1000, analyticsStartMs);
  const lastMonthIso = analyticsRangeStartIso(now, 30 * 24 * 60 * 60 * 1000, analyticsStartMs);
  const dimensions = ['requestPath'];
  const [dayRows, weekRows, monthRows, totalRows] = await Promise.all([
    queryCloudflareRumGroups(env, siteTag, lastDayIso, nowIso, dimensions),
    queryCloudflareRumGroups(env, siteTag, lastWeekIso, nowIso, dimensions),
    queryCloudflareRumGroups(env, siteTag, lastMonthIso, nowIso, dimensions),
    queryCloudflareRumGroups(env, siteTag, totalStartIso, nowIso, dimensions),
  ]);

  const sumForTargetPath = (rows: CloudflareRumGroup[]) => rows.reduce((total, row) => {
    const path = normalizeCloudflarePath(cloudflareDimensionValue(row, ['path', 'requestPath', 'clientRequestPath'], '/'));
    if (path !== targetPath) return total;
    return total + cloudflareViews(row);
  }, 0);

  return {
    entityType,
    entityId,
    label: sanitizeAnalyticsLabel(cloudflareLabelForPath(entityType, targetPath), entityId),
    path: sanitizeAnalyticsPath(targetPath),
    lastViewedAt: '',
    lastDay: sumForTargetPath(dayRows),
    lastWeek: sumForTargetPath(weekRows),
    lastMonth: sumForTargetPath(monthRows),
    total: sumForTargetPath(totalRows),
  };
}

function isRequestOriginAllowed(request: Request, env: Env): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  return pickCorsOrigin(request, env) === origin;
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

async function readEditorialSession(request: Request, env: Env): Promise<SessionPayload | null> {
  const session = await readSessionFromRequest(request, env);
  if (!session) return null;
  if (session.role !== 'admin' && session.role !== 'editor') return null;
  return session;
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
  return asString(env.APP_NAME).trim() || 'Anuarul Arhivei de Folclor';
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
  if (value === 'accept' || value === 'accept_as_is') return 'Acceptat fara modificari';
  if (
    value === 'accepted_after_corrections'
    || value === 'minor_revisions'
    || value === 'major_revisions'
  ) {
    return 'Acceptat dupa revizuire';
  }
  if (value === 'reject') return 'Nu poate fi acceptat';
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

function buildNewSubmissionEditorialEmail(
  env: Env,
  submission: StoredSubmission,
  receivedAtIso: string,
  emailTemplates: StoredEmailTemplateMap,
): EmailTemplate {
  const appName = getAppName(env);
  const templateFields = resolveTemplateFields('submission_new_editorial', emailTemplates, {
    app_name: appName,
    submission_id: submission.id,
    title: submission.title,
    authors: submission.authors,
    email: submission.email,
    status: submissionStatusLabel(submission.status),
    decision: submission.decision || '-',
    received_at: receivedAtIso,
  });
  const details = [
    ...buildSubmissionDetails(submission),
    { label: 'Fisiere primite', value: String(submission.files.length) },
  ];
  return buildWorkflowEmailTemplate({
    subject: templateFields.subject,
    heading: templateFields.heading,
    greeting: templateFields.greeting || undefined,
    intro: templateFields.intro,
    details,
    note: templateFields.note || undefined,
    action: templateFields.action || undefined,
    footer: templateFields.footer || undefined,
  });
}

function buildAuthorSubmissionConfirmationEmail(
  env: Env,
  submission: StoredSubmission,
  emailTemplates: StoredEmailTemplateMap,
): EmailTemplate {
  const appName = getAppName(env);
  const templateFields = resolveTemplateFields('submission_confirmation_author', emailTemplates, {
    app_name: appName,
    submission_id: submission.id,
    title: submission.title,
    status: submissionStatusLabel(submission.status),
    decision: submission.decision || '-',
  });
  return buildWorkflowEmailTemplate({
    subject: templateFields.subject,
    heading: templateFields.heading,
    greeting: templateFields.greeting || undefined,
    intro: templateFields.intro,
    details: [
      { label: 'ID submisie', value: submission.id },
      { label: 'Titlu', value: submission.title },
      { label: 'Status', value: submissionStatusLabel(submission.status) },
    ],
    note: templateFields.note || undefined,
    action: templateFields.action || undefined,
    footer: templateFields.footer || undefined,
  });
}

function buildReviewerAssignedEmail(
  env: Env,
  submission: StoredSubmission,
  reviewerName: string,
  reviewerDeadline: string,
  emailTemplates: StoredEmailTemplateMap,
): EmailTemplate {
  const appName = getAppName(env);
  const templateFields = resolveTemplateFields('reviewer_assigned', emailTemplates, {
    app_name: appName,
    submission_id: submission.id,
    title: submission.title,
    status: submissionStatusLabel(submission.status),
    reviewer_name: reviewerName || 'reviewer',
    reviewer_deadline: reviewerDeadline || '-',
    decision: submission.decision || '-',
  });
  return buildWorkflowEmailTemplate({
    subject: templateFields.subject,
    heading: templateFields.heading,
    greeting: templateFields.greeting || undefined,
    intro: templateFields.intro,
    details: [
      { label: 'ID', value: submission.id },
      { label: 'Titlu', value: submission.title },
      { label: 'Termen recomandat', value: reviewerDeadline || '-' },
    ],
    note: templateFields.note || undefined,
    action: templateFields.action || undefined,
    footer: templateFields.footer || undefined,
  });
}

function buildReviewerUnassignedEmail(
  env: Env,
  submission: StoredSubmission,
  reviewerName: string,
  emailTemplates: StoredEmailTemplateMap,
): EmailTemplate {
  const appName = getAppName(env);
  const templateFields = resolveTemplateFields('reviewer_unassigned', emailTemplates, {
    app_name: appName,
    submission_id: submission.id,
    title: submission.title,
    status: submissionStatusLabel(submission.status),
    reviewer_name: reviewerName || 'reviewer',
    decision: submission.decision || '-',
  });
  return buildWorkflowEmailTemplate({
    subject: templateFields.subject,
    heading: templateFields.heading,
    greeting: templateFields.greeting || undefined,
    intro: templateFields.intro,
    details: [
      { label: 'ID', value: submission.id },
      { label: 'Titlu', value: submission.title },
    ],
    note: templateFields.note || undefined,
    action: templateFields.action || undefined,
    footer: templateFields.footer || undefined,
  });
}

function buildAuthorSentToReviewEmail(
  env: Env,
  submission: StoredSubmission,
  emailTemplates: StoredEmailTemplateMap,
): EmailTemplate {
  const reviewers = [submission.assigned_reviewer, submission.assigned_reviewer_2]
    .map((value) => value.trim())
    .filter(Boolean);
  const appName = getAppName(env);
  const templateFields = resolveTemplateFields('author_sent_to_review', emailTemplates, {
    app_name: appName,
    submission_id: submission.id,
    title: submission.title,
    status: submissionStatusLabel(submission.status),
    reviewers: reviewers.length > 0 ? reviewers.join(', ') : 'alocati de editor',
    decision: submission.decision || '-',
  });
  return buildWorkflowEmailTemplate({
    subject: templateFields.subject,
    heading: templateFields.heading,
    greeting: templateFields.greeting || undefined,
    intro: templateFields.intro,
    details: [
      { label: 'ID submisie', value: submission.id },
      { label: 'Titlu', value: submission.title },
      { label: 'Status', value: submissionStatusLabel(submission.status) },
      { label: 'Revieweri', value: reviewers.length > 0 ? reviewers.join(', ') : 'alocati de editor' },
    ],
    note: templateFields.note || undefined,
    action: templateFields.action || undefined,
    footer: templateFields.footer || undefined,
  });
}

function buildReviewCompletedEditorialEmail(
  env: Env,
  submission: StoredSubmission,
  reviewerName: string,
  reviewerRecommendation: string,
  emailTemplates: StoredEmailTemplateMap,
): EmailTemplate {
  const appName = getAppName(env);
  const templateFields = resolveTemplateFields('review_completed_editorial', emailTemplates, {
    app_name: appName,
    submission_id: submission.id,
    title: submission.title,
    status: submissionStatusLabel(submission.status),
    reviewer_name: reviewerName || '-',
    reviewer_recommendation: recommendationLabel(reviewerRecommendation),
    decision: submission.decision || '-',
  });
  return buildWorkflowEmailTemplate({
    subject: templateFields.subject,
    heading: templateFields.heading,
    greeting: templateFields.greeting || undefined,
    intro: templateFields.intro,
    details: [
      { label: 'ID', value: submission.id },
      { label: 'Titlu', value: submission.title },
      { label: 'Reviewer', value: reviewerName || '-' },
      { label: 'Recomandare', value: recommendationLabel(reviewerRecommendation) },
      { label: 'Status curent', value: submissionStatusLabel(submission.status) },
    ],
    note: templateFields.note || undefined,
    action: templateFields.action || undefined,
    footer: templateFields.footer || undefined,
  });
}

function buildAuthorDecisionEmail(
  env: Env,
  submission: StoredSubmission,
  emailTemplates: StoredEmailTemplateMap,
): EmailTemplate {
  const appName = getAppName(env);
  const templateFields = resolveTemplateFields('author_decision', emailTemplates, {
    app_name: appName,
    submission_id: submission.id,
    title: submission.title,
    status: submissionStatusLabel(submission.status),
    decision: submission.decision || '-',
  });
  return buildWorkflowEmailTemplate({
    subject: templateFields.subject,
    heading: templateFields.heading,
    greeting: templateFields.greeting || undefined,
    intro: templateFields.intro,
    details: [
      { label: 'ID submisie', value: submission.id },
      { label: 'Titlu', value: submission.title },
      { label: 'Decizie', value: submissionStatusLabel(submission.status) },
      { label: 'Mesaj editor', value: submission.decision || '-' },
    ],
    note: templateFields.note || undefined,
    action: templateFields.action || undefined,
    footer: templateFields.footer || undefined,
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
  emailTemplates: StoredEmailTemplateMap,
): Promise<Response> {
  const appName = getAppName(env);
  const validity = ttlLabel(ttlSeconds);
  const templateFields = resolveTemplateFields('login_code', emailTemplates, {
    app_name: appName,
    recipient_name: name,
    code,
    validity,
  });
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
      <h2 style="margin:0 0 12px 0">${escapeHtml(templateFields.heading)}</h2>
      <p>Salut${templateFields.greeting ? `, ${escapeHtml(templateFields.greeting)}` : ''}.</p>
      <p>${escapeHtml(templateFields.intro)}</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:4px;margin:8px 0">${escapeHtml(code)}</p>
      ${templateFields.note ? `<p>${escapeHtml(templateFields.note)}</p>` : ''}
      ${templateFields.action ? `<p>${escapeHtml(templateFields.action)}</p>` : ''}
      ${templateFields.footer ? `<p style="color:#6b7280;font-size:12px">${escapeHtml(templateFields.footer)}</p>` : ''}
    </div>
  `.trim();

  const textLines = [
    `Salut${templateFields.greeting ? `, ${templateFields.greeting}` : ''}.`,
    templateFields.intro,
    `Cod: ${code}`,
    templateFields.note,
    templateFields.action,
    templateFields.footer,
  ].filter((line) => Boolean(line));

  return sendEmail(
    env,
    [email],
    templateFields.subject,
    html,
    textLines.join('\n'),
  );
}

async function sendAccountCredentialsEmail(
  env: Env,
  user: StoredUser,
  password: string,
  loginCode: string,
  ttlSeconds: number,
  emailTemplates: StoredEmailTemplateMap,
): Promise<Response> {
  const appName = getAppName(env);
  const validity = ttlLabel(ttlSeconds);
  const templateFields = resolveTemplateFields('account_credentials', emailTemplates, {
    app_name: appName,
    recipient_name: user.name,
    email: user.email,
    username: user.username,
    password,
    code: loginCode,
    validity,
    role: userRoleLabel(user.role),
  });

  const template = buildWorkflowEmailTemplate({
    subject: templateFields.subject,
    heading: templateFields.heading,
    greeting: templateFields.greeting || undefined,
    intro: templateFields.intro,
    details: [
      { label: 'Rol', value: userRoleLabel(user.role) },
      { label: 'Email', value: user.email },
      { label: 'Username', value: user.username },
      { label: 'Parola', value: password },
      { label: 'Cod login', value: loginCode },
      { label: 'Valabilitate cod', value: validity },
    ],
    note: templateFields.note || undefined,
    action: templateFields.action || undefined,
    footer: templateFields.footer || undefined,
  });

  return sendEmail(
    env,
    [user.email],
    template.subject,
    template.html,
    template.text,
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
  const emailTemplates = await readEmailTemplates(env);
  const sendResult = await sendLoginCodeEmail(env, email, recipientName, loginCode.code, ttlSeconds, emailTemplates);
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

  const password = generateSecurePassword();
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
  const emailTemplates = await readEmailTemplates(env);
  const sendResult = await sendAccountCredentialsEmail(env, newUser, password, loginCode.code, ttlSeconds, emailTemplates);
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
    message: `Utilizator creat. Username-ul, parola generata si codul de logare au fost trimise pe email.`,
    account: toAccount(newUser),
    credentials: {
      username: newUser.username,
      password,
      email: newUser.email,
    },
  });
}

async function handleListEmailTemplates(request: Request, env: Env): Promise<Response> {
  const isAllowed = await isAdminAuthorized(request, env);
  if (!isAllowed) {
    return jsonResponse(request, env, 401, { ok: false, error: 'Neautorizat.' });
  }

  const templates = await readEmailTemplates(env);
  const payload = EMAIL_TEMPLATE_DESCRIPTORS.map((descriptor) => ({
    id: descriptor.id,
    label: descriptor.label,
    description: descriptor.description,
    placeholders: descriptor.placeholders,
    defaults: descriptor.defaults,
    custom: templates[descriptor.id] || {},
    effective: mergeTemplateFields(descriptor.id, templates),
  }));

  return jsonResponse(request, env, 200, { ok: true, templates: payload });
}

async function handleUpdateEmailTemplate(request: Request, env: Env): Promise<Response> {
  const isAllowed = await isAdminAuthorized(request, env);
  if (!isAllowed) {
    return jsonResponse(request, env, 401, { ok: false, error: 'Neautorizat.' });
  }

  const body = await readJson(request);
  const templateIdRaw = asString(body.id).trim();
  if (!isEmailTemplateId(templateIdRaw)) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Template email invalid.' });
  }

  const templateId = templateIdRaw;
  const descriptor = templateDescriptorById(templateId);
  const templates = await readEmailTemplates(env);

  if (body.reset === true) {
    if (templates[templateId]) {
      delete templates[templateId];
      await writeEmailTemplates(env, templates);
    }
    return jsonResponse(request, env, 200, {
      ok: true,
      message: 'Template resetat la varianta implicita.',
      template: {
        id: descriptor.id,
        label: descriptor.label,
        description: descriptor.description,
        placeholders: descriptor.placeholders,
        defaults: descriptor.defaults,
        custom: {},
        effective: mergeTemplateFields(templateId, templates),
      },
    });
  }

  const source = (body.template && typeof body.template === 'object')
    ? body.template as Record<string, unknown>
    : body;

  const nextCustom: PartialEditableEmailTemplateFields = { ...(templates[templateId] || {}) };
  let changed = false;
  for (const field of EDITABLE_EMAIL_TEMPLATE_FIELDS) {
    if (!(field in source)) continue;
    nextCustom[field] = clampTemplateField(field, source[field]);
    changed = true;
  }

  if (!changed) {
    return jsonResponse(request, env, 400, {
      ok: false,
      error: 'Nu exista campuri valide pentru actualizarea template-ului.',
    });
  }

  const normalizedCustom: PartialEditableEmailTemplateFields = {};
  for (const field of EDITABLE_EMAIL_TEMPLATE_FIELDS) {
    const customValue = nextCustom[field];
    if (customValue === undefined) continue;
    if (customValue !== descriptor.defaults[field]) {
      normalizedCustom[field] = customValue;
    }
  }

  if (Object.keys(normalizedCustom).length === 0) {
    delete templates[templateId];
  } else {
    templates[templateId] = normalizedCustom;
  }
  await writeEmailTemplates(env, templates);

  return jsonResponse(request, env, 200, {
    ok: true,
    message: 'Template email actualizat.',
    template: {
      id: descriptor.id,
      label: descriptor.label,
      description: descriptor.description,
      placeholders: descriptor.placeholders,
      defaults: descriptor.defaults,
      custom: templates[templateId] || {},
      effective: mergeTemplateFields(templateId, templates),
    },
  });
}

async function handleTrackAnalyticsView(request: Request, env: Env): Promise<Response> {
  if (!isRequestOriginAllowed(request, env)) {
    return jsonResponse(request, env, 403, { ok: false, error: 'Origine nepermisa.' });
  }

  const body = await readJson(request);
  const entityTypeRaw = asString(body.entityType).trim().toLowerCase();
  if (!isAnalyticsEntityType(entityTypeRaw)) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Tip analytics invalid.' });
  }

  const entityId = normalizeAnalyticsEntityId(entityTypeRaw, asString(body.entityId));
  if (!entityId) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Identificator analytics invalid.' });
  }

  const path = sanitizeAnalyticsPath(
    asString(body.path),
    entityTypeRaw === 'page' ? entityId : entityTypeRaw === 'search' ? '/search' : '',
  );
  const label = sanitizeAnalyticsLabel(
    asString(body.label),
    entityTypeRaw === 'article'
      ? `Articol ${entityId}`
      : entityTypeRaw === 'download'
        ? `Descărcare articol ${entityId}`
        : entityTypeRaw === 'search'
          ? `Căutare: ${entityId}`
        : entityId,
  );
  const now = Date.now();
  const startAt = analyticsStartAtMs(env);
  if (startAt > 0 && now < startAt) {
    return jsonResponse(request, env, 200, {
      ok: true,
      summary: {
        entityType: entityTypeRaw,
        entityId,
        label,
        path,
        lastViewedAt: '',
        lastDay: 0,
        lastWeek: 0,
        lastMonth: 0,
        total: 0,
      } satisfies AnalyticsSummaryPayload,
    });
  }
  const today = analyticsToday();
  if (isCloudflareAnalyticsProviderSelected(env) && (entityTypeRaw === 'page' || entityTypeRaw === 'article')) {
    const stored = await readAnalyticsRecord(env, entityTypeRaw, entityId);
    const storedSummary = stored ? summarizeAnalyticsRecord(stored, today) : null;

    if (hasCloudflareAnalyticsCredentials(env)) {
      try {
        const cloudflareSummary = await buildCloudflareEntitySummary(env, entityTypeRaw, entityId);
        return jsonResponse(request, env, 200, {
          ok: true,
          summary: storedSummary ? mergeAnalyticsSummaryPayloads(cloudflareSummary, storedSummary) : cloudflareSummary,
        });
      } catch (error) {
        console.error('Cloudflare analytics track bypass failed', error);
      }
    }

    return jsonResponse(request, env, 200, {
      ok: true,
      summary: storedSummary
        ? storedSummary
        : {
            entityType: entityTypeRaw,
            entityId,
            label,
            path,
            lastViewedAt: '',
            lastDay: 0,
            lastWeek: 0,
            lastMonth: 0,
            total: 0,
          } satisfies AnalyticsSummaryPayload,
    });
  }

  const existing = await readAnalyticsRecord(env, entityTypeRaw, entityId);
  const requestDimensions = buildAnalyticsDimensionsFromRequest(request, body);
  const next: StoredAnalyticsRecord = existing || {
    entityType: entityTypeRaw,
    entityId,
    label,
    path,
    total: 0,
    buckets: {},
    dimensions: emptyAnalyticsDimensions(),
    createdAt: now,
    updatedAt: now,
    lastViewedAt: '',
  };

  next.label = label || next.label || entityId;
  next.path = path || next.path;
  next.total += 1;
  next.updatedAt = now;
  next.lastViewedAt = new Date(now).toISOString();
  next.buckets = pruneAnalyticsBuckets(next.buckets, today);
  next.buckets[today] = (next.buckets[today] || 0) + 1;
  next.dimensions = normalizeAnalyticsDimensions(next.dimensions);
  mergeAnalyticsDimensions(next.dimensions, requestDimensions);

  await writeAnalyticsRecord(env, next);

  return jsonResponse(request, env, 200, {
    ok: true,
    summary: summarizeAnalyticsRecord(next, today),
  });
}

async function handleGetAnalyticsSummary(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const entityTypeRaw = asString(url.searchParams.get('entityType')).trim().toLowerCase();
  if (!isAnalyticsEntityType(entityTypeRaw)) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Tip analytics invalid.' });
  }

  const entityId = normalizeAnalyticsEntityId(entityTypeRaw, asString(url.searchParams.get('entityId')));
  if (!entityId) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Identificator analytics invalid.' });
  }

  const stored = await readAnalyticsRecord(env, entityTypeRaw, entityId);

  if (isCloudflareAnalyticsProviderSelected(env) && (entityTypeRaw === 'page' || entityTypeRaw === 'article')) {
    const storedSummary = stored ? summarizeAnalyticsRecord(stored) : null;
    if (hasCloudflareAnalyticsCredentials(env)) {
      try {
        const cloudflareSummary = await buildCloudflareEntitySummary(env, entityTypeRaw, entityId);
        return jsonResponse(request, env, 200, {
          ok: true,
          summary: storedSummary ? mergeAnalyticsSummaryPayloads(cloudflareSummary, storedSummary) : cloudflareSummary,
        });
      } catch (error) {
        console.error('Cloudflare analytics summary failed', error);
      }
    }

    if (storedSummary && storedSummary.total > 0) {
      return jsonResponse(request, env, 200, { ok: true, summary: storedSummary });
    }
  }

  const summary = stored
    ? summarizeAnalyticsRecord(stored)
    : {
        entityType: entityTypeRaw,
        entityId,
        label: entityId,
        path: entityTypeRaw === 'page' ? entityId : entityTypeRaw === 'search' ? '/search' : '',
        lastViewedAt: '',
        lastDay: 0,
        lastWeek: 0,
        lastMonth: 0,
        total: 0,
      } satisfies AnalyticsSummaryPayload;

  return jsonResponse(request, env, 200, { ok: true, summary });
}

async function handleListAnalytics(request: Request, env: Env): Promise<Response> {
  const isAllowed = await isAdminAuthorized(request, env);
  if (!isAllowed) {
    return jsonResponse(request, env, 401, { ok: false, error: 'Neautorizat.' });
  }

  try {
    const payload = await buildAnalyticsDashboardPayload(env);
    try {
      await archiveAnalyticsSnapshotOncePerDay(env, payload);
    } catch (error) {
      console.error('Analytics snapshot archive failed', error);
    }
    return jsonResponse(request, env, 200, payload);
  } catch (error) {
    return jsonResponse(request, env, 502, {
      ok: false,
      error: error instanceof Error ? error.message : 'Nu am putut încărca statisticile.',
    });
  }
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
    review_form: {},
    review_form_2: {},
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
  const emailTemplates = await readEmailTemplates(env);
  const editorialTemplate = buildNewSubmissionEditorialEmail(env, submission, receivedAt.toISOString(), emailTemplates);
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

  const confirmationTemplate = buildAuthorSubmissionConfirmationEmail(env, submission, emailTemplates);
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

async function handleGetArticleOverrides(request: Request, env: Env): Promise<Response> {
  const overrides = await readArticleOverrides(env);
  return jsonResponse(request, env, 200, { ok: true, overrides });
}

async function handleUpdateArticleOverride(request: Request, env: Env): Promise<Response> {
  const session = await readEditorialSession(request, env);
  if (!session) {
    return jsonResponse(request, env, 401, { ok: false, error: 'Neautorizat.' });
  }

  const payload = await readJson(request);
  const articleId = asString(payload.id).trim();
  if (!articleId) {
    return jsonResponse(request, env, 400, { ok: false, error: 'ID articol lipsa.' });
  }

  const sanitizedChanges = sanitizeArticleOverride(payload.changes);
  if (Object.keys(sanitizedChanges).length === 0) {
    return jsonResponse(request, env, 400, { ok: false, error: 'Nu exista campuri valide pentru actualizare.' });
  }

  const overrides = await readArticleOverrides(env);
  overrides[articleId] = {
    ...(overrides[articleId] || {}),
    ...sanitizedChanges,
  };
  await writeArticleOverrides(env, overrides);

  return jsonResponse(request, env, 200, {
    ok: true,
    message: 'Metadatele articolului au fost actualizate.',
    override: overrides[articleId],
    updatedBy: session.email,
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
    if (changes.review_form && typeof changes.review_form === 'object') {
      next.review_form = parseReviewForm(changes.review_form);
      changed = true;
    }
    if (changes.review_form_2 && typeof changes.review_form_2 === 'object') {
      next.review_form_2 = parseReviewForm(changes.review_form_2);
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
    if (changes.review_form && typeof changes.review_form === 'object') {
      if (reviewerSlot === 2) {
        next.review_form_2 = parseReviewForm(changes.review_form);
      } else {
        next.review_form = parseReviewForm(changes.review_form);
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
    if (changes.review_form_2 && typeof changes.review_form_2 === 'object' && reviewerSlot === 2) {
      next.review_form_2 = parseReviewForm(changes.review_form_2);
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
    const activeRecommendation = reviewerSlot === 2 ? next.recommendation_2 : next.recommendation;
    const activeReviewedAt = reviewerSlot === 2 ? next.reviewed_at_2 : next.reviewed_at;
    const activeForm = reviewerSlot === 2 ? next.review_form_2 : next.review_form;
    if (activeRecommendation || activeReviewedAt) {
      if (!isCompleteReviewForm(activeForm)) {
        return jsonResponse(request, env, 400, {
          ok: false,
          error: 'Completeaza toate cele 11 criterii din formularul de evaluare.',
        });
      }
      if (!activeRecommendation) {
        return jsonResponse(request, env, 400, {
          ok: false,
          error: 'Selecteaza recomandarea finala a recenzorului.',
        });
      }
    }
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
  const emailTemplates = await readEmailTemplates(env);

  if (reviewerAssigned) {
    const reviewerName = await resolveReviewerName(next.assigned_reviewer, nextReviewerEmail);
    const template = buildReviewerAssignedEmail(env, next, reviewerName, next.reviewer_deadline, emailTemplates);
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
    const template = buildReviewerUnassignedEmail(env, next, reviewerName, emailTemplates);
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
    const template = buildReviewerAssignedEmail(env, next, reviewerName, next.reviewer_deadline_2, emailTemplates);
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
    const template = buildReviewerUnassignedEmail(env, next, reviewerName, emailTemplates);
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
    const template = buildAuthorSentToReviewEmail(env, next, emailTemplates);
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
      const template = buildReviewCompletedEditorialEmail(env, next, reviewerName, reviewerRecommendation, emailTemplates);
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
    const template = buildAuthorDecisionEmail(env, next, emailTemplates);
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

      if (request.method === 'POST' && url.pathname === '/analytics/view') {
        return handleTrackAnalyticsView(request, env);
      }

      if (request.method === 'GET' && url.pathname === '/analytics/summary') {
        return handleGetAnalyticsSummary(request, env);
      }

      if (request.method === 'GET' && url.pathname === '/article-overrides') {
        return handleGetArticleOverrides(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/article-overrides') {
        return handleUpdateArticleOverride(request, env);
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

      if (request.method === 'GET' && url.pathname === '/admin/email-templates') {
        return handleListEmailTemplates(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/admin/email-templates') {
        return handleUpdateEmailTemplate(request, env);
      }

      if (request.method === 'GET' && url.pathname === '/admin/analytics') {
        return handleListAnalytics(request, env);
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
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    try {
      await handleScheduledAnalyticsArchive(env);
    } catch (error) {
      console.error('Scheduled analytics archive failed', error instanceof Error ? error.message : String(error));
    }
  },
};
