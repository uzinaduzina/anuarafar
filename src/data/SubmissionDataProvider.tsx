import { createContext, useContext, useMemo, useState, type ReactNode, useCallback, useEffect } from 'react';
import type { Submission } from './types';
import { useAuth } from '@/contexts/AuthContext';
import { resolveAuthApiBase } from '@/lib/authApi';

const STORAGE_KEY = 'workflow_submissions_v2';
const LEGACY_STORAGE_KEY = 'workflow_submissions_v1';
const REJECTED_CLEANUP_FLAG = 'workflow_submissions_cleanup_rejected_v1';
const FORCE_RESET_FLAG = 'workflow_submissions_force_reset_v1';
const SUBMISSION_API_BASE = resolveAuthApiBase();
const REMOTE_SUBMISSIONS_ENABLED = SUBMISSION_API_BASE.length > 0;

export interface NewSubmissionInput {
  title: string;
  authors: string;
  email: string;
  affiliation: string;
  abstract: string;
  keywords_ro: string;
  keywords_en: string;
}

interface ActionResult {
  ok: boolean;
  error?: string;
}

interface SubmissionDataContextValue {
  submissions: Submission[];
  loading: boolean;
  createSubmission: (input: NewSubmissionInput) => Submission;
  updateSubmission: (id: string, changes: Partial<Submission>) => Promise<ActionResult>;
  uploadAnonymizedFiles: (submissionId: string, files: File[]) => Promise<ActionResult>;
  getSubmissionsForAuthor: (email: string) => Submission[];
  getSubmissionsForReviewer: (email: string) => Submission[];
  refreshSubmissions: () => Promise<ActionResult>;
  downloadSubmissionFile: (submissionId: string, fileId: string, fallbackFileName?: string) => Promise<ActionResult>;
}

const SubmissionDataContext = createContext<SubmissionDataContextValue>({
  submissions: [],
  loading: false,
  createSubmission: () => ({
    id: '',
    title: '',
    authors: '',
    email: '',
    affiliation: '',
    abstract: '',
    keywords_ro: '',
    keywords_en: '',
    date_submitted: '',
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
    files: [],
    anonymized_files: [],
    anonymized_at: '',
  }),
  updateSubmission: async () => ({ ok: false }),
  uploadAnonymizedFiles: async () => ({ ok: false }),
  getSubmissionsForAuthor: () => [],
  getSubmissionsForReviewer: () => [],
  refreshSubmissions: async () => ({ ok: false }),
  downloadSubmissionFile: async () => ({ ok: false }),
});

function normalizeSubmission(submission: Submission): Submission {
  return {
    ...submission,
    assigned_reviewer_email: submission.assigned_reviewer_email || '',
    assigned_reviewer_2: submission.assigned_reviewer_2 || '',
    assigned_reviewer_email_2: submission.assigned_reviewer_email_2 || '',
    reviewer_deadline_2: submission.reviewer_deadline_2 || '',
    recommendation_2: submission.recommendation_2 || '',
    review_form: submission.review_form && typeof submission.review_form === 'object' ? submission.review_form : {},
    review_form_2: submission.review_form_2 && typeof submission.review_form_2 === 'object' ? submission.review_form_2 : {},
    review_notes: submission.review_notes || '',
    review_notes_2: submission.review_notes_2 || '',
    reviewed_at: submission.reviewed_at || '',
    reviewed_at_2: submission.reviewed_at_2 || '',
    files: Array.isArray(submission.files) ? submission.files : [],
    anonymized_files: Array.isArray(submission.anonymized_files) ? submission.anonymized_files : [],
    anonymized_at: submission.anonymized_at || '',
  };
}

function readInitialSubmissions(): Submission[] {
  const forceResetDone = localStorage.getItem(FORCE_RESET_FLAG) === '1';
  if (!forceResetDone) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.removeItem(REJECTED_CLEANUP_FLAG);
    localStorage.setItem(FORCE_RESET_FLAG, '1');
    return [];
  }

  const currentRaw = localStorage.getItem(STORAGE_KEY);
  const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
  const raw = currentRaw ?? legacyRaw;
  if (!raw) {
    return [];
  }

  let parsed: Submission[] = [];
  try {
    const candidate = JSON.parse(raw) as Submission[];
    if (Array.isArray(candidate)) parsed = candidate;
  } catch {
    parsed = [];
  }

  const cleanupDone = localStorage.getItem(REJECTED_CLEANUP_FLAG) === '1';
  const cleaned = cleanupDone
    ? parsed
    : parsed.filter((submission) => submission?.status !== 'rejected');

  if (!cleanupDone) {
    localStorage.setItem(REJECTED_CLEANUP_FLAG, '1');
  }

  if (legacyRaw) {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }

  if (legacyRaw || !currentRaw || cleaned.length !== parsed.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  }

  return cleaned.map(normalizeSubmission);
}

function toIsoDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function nextSubmissionId(submissions: Submission[]): string {
  const maxId = submissions.reduce((maxValue, submission) => {
    const match = submission.id.match(/^S(\d+)$/i);
    if (!match) return maxValue;
    const numericPart = Number(match[1]);
    return Number.isFinite(numericPart) ? Math.max(maxValue, numericPart) : maxValue;
  }, 0);

  return `S${String(maxId + 1).padStart(3, '0')}`;
}

function parseApiResponse(raw: string): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function parseRemoteSubmissions(payload: unknown): Submission[] {
  if (!Array.isArray(payload)) return [];
  return payload
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => entry as Submission)
    .filter((entry) => typeof entry.id === 'string' && typeof entry.title === 'string' && typeof entry.email === 'string')
    .map(normalizeSubmission);
}

function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function useSubmissionData() {
  return useContext(SubmissionDataContext);
}

export function SubmissionDataProvider({ children }: { children: ReactNode }) {
  const { authTransport, authToken, user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>(() => readInitialSubmissions());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (REMOTE_SUBMISSIONS_ENABLED && authTransport === 'remote') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  }, [submissions, authTransport]);

  const refreshSubmissions = useCallback(async (): Promise<ActionResult> => {
    if (!REMOTE_SUBMISSIONS_ENABLED || authTransport !== 'remote') {
      return { ok: true };
    }

    if (!authToken) {
      setSubmissions([]);
      return { ok: false, error: 'Sesiunea a expirat. Reautentifica-te.' };
    }

    setLoading(true);
    try {
      const response = await fetch(`${SUBMISSION_API_BASE}/submissions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      const payload = parseApiResponse(await response.text());
      if (!response.ok || payload.ok === false) {
        return { ok: false, error: String(payload.error || 'Nu am putut incarca submisiile.') };
      }

      setSubmissions(parseRemoteSubmissions(payload.submissions));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Serviciul de submisii nu raspunde momentan.' };
    } finally {
      setLoading(false);
    }
  }, [authToken, authTransport]);

  useEffect(() => {
    if (!REMOTE_SUBMISSIONS_ENABLED || authTransport !== 'remote') return;
    if (!authToken || !user) {
      setSubmissions([]);
      return;
    }
    void refreshSubmissions();
  }, [authToken, authTransport, user?.email, refreshSubmissions]);

  const updateSubmission = useCallback(async (id: string, changes: Partial<Submission>): Promise<ActionResult> => {
    if (REMOTE_SUBMISSIONS_ENABLED && authTransport === 'remote' && authToken) {
      try {
        const response = await fetch(`${SUBMISSION_API_BASE}/submissions/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ id, changes }),
        });

        const payload = parseApiResponse(await response.text());
        if (!response.ok || payload.ok === false) {
          return { ok: false, error: String(payload.error || response.statusText || 'Actualizarea a esuat.') };
        }

        if (payload.submission && typeof payload.submission === 'object') {
          const normalized = normalizeSubmission(payload.submission as Submission);
          setSubmissions((prev) => prev.map((submission) => (
            submission.id === normalized.id ? normalized : submission
          )));
          return { ok: true };
        }

        const refresh = await refreshSubmissions();
        return refresh.ok ? { ok: true } : refresh;
      } catch (error) {
        console.error('Submission update failed', error);
        return { ok: false, error: 'Serviciul de submisii nu raspunde momentan.' };
      }
    }

    setSubmissions((prev) => prev.map((submission) => (
      submission.id === id
        ? normalizeSubmission({ ...submission, ...changes })
        : submission
    )));
    return { ok: true };
  }, [authToken, authTransport, refreshSubmissions]);

  const uploadAnonymizedFiles = useCallback(async (submissionId: string, files: File[]): Promise<ActionResult> => {
    if (!REMOTE_SUBMISSIONS_ENABLED || authTransport !== 'remote' || !authToken) {
      return { ok: false, error: 'Uploadul de fisiere anonimizate este disponibil doar in modul remote.' };
    }
    if (files.length === 0) {
      return { ok: false, error: 'Selecteaza cel putin un fisier anonimizat.' };
    }

    try {
      const formData = new FormData();
      formData.append('submissionId', submissionId);
      for (const file of files) {
        formData.append('files', file);
      }

      const response = await fetch(`${SUBMISSION_API_BASE}/submissions/anonymized-upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      const payload = parseApiResponse(await response.text());
      if (!response.ok || payload.ok === false) {
        return { ok: false, error: String(payload.error || 'Nu am putut incarca fisierele anonimizate.') };
      }

      if (payload.submission && typeof payload.submission === 'object') {
        const normalized = normalizeSubmission(payload.submission as Submission);
        setSubmissions((prev) => prev.map((submission) => (
          submission.id === normalized.id ? normalized : submission
        )));
        return { ok: true };
      }

      const refresh = await refreshSubmissions();
      return refresh.ok ? { ok: true } : refresh;
    } catch (error) {
      console.error('Submission anonymized upload failed', error);
      return { ok: false, error: 'Serviciul de submisii nu raspunde momentan.' };
    }
  }, [authToken, authTransport, refreshSubmissions]);

  const createSubmission = useCallback((input: NewSubmissionInput): Submission => {
    const nextId = nextSubmissionId(submissions);
    const newSubmission: Submission = {
      id: nextId,
      title: input.title.trim(),
      authors: input.authors.trim(),
      email: input.email.trim().toLowerCase(),
      affiliation: input.affiliation.trim(),
      abstract: input.abstract.trim(),
      keywords_ro: input.keywords_ro.trim(),
      keywords_en: input.keywords_en.trim(),
      date_submitted: toIsoDate(new Date()),
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
      files: [],
      anonymized_files: [],
      anonymized_at: '',
    };

    setSubmissions((prev) => [newSubmission, ...prev]);
    return newSubmission;
  }, [submissions]);

  const getSubmissionsForAuthor = useCallback((email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    return submissions.filter((submission) => submission.email.toLowerCase() === normalizedEmail);
  }, [submissions]);

  const getSubmissionsForReviewer = useCallback((email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    return submissions.filter((submission) => (
      submission.assigned_reviewer_email?.toLowerCase() === normalizedEmail
      || submission.assigned_reviewer_email_2?.toLowerCase() === normalizedEmail
    ));
  }, [submissions]);

  const downloadSubmissionFile = useCallback(async (
    submissionId: string,
    fileId: string,
    fallbackFileName = 'manuscris',
  ): Promise<ActionResult> => {
    if (!REMOTE_SUBMISSIONS_ENABLED || authTransport !== 'remote' || !authToken) {
      return { ok: false, error: 'Descarcarea fisierelor este disponibila doar in modul remote.' };
    }

    try {
      const response = await fetch(`${SUBMISSION_API_BASE}/submissions/${encodeURIComponent(submissionId)}/files/${encodeURIComponent(fileId)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const payload = parseApiResponse(await response.text());
        return { ok: false, error: String(payload.error || 'Nu am putut descarca fisierul.') };
      }

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition') || '';
      const fileNameMatch = disposition.match(/filename="([^"]+)"/);
      const fileName = fileNameMatch?.[1] || fallbackFileName;
      triggerBlobDownload(blob, fileName);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Descarcarea fisierului a esuat.' };
    }
  }, [authToken, authTransport]);

  const value = useMemo(() => ({
    submissions,
    loading,
    createSubmission,
    updateSubmission,
    uploadAnonymizedFiles,
    getSubmissionsForAuthor,
    getSubmissionsForReviewer,
    refreshSubmissions,
    downloadSubmissionFile,
  }), [
    submissions,
    loading,
    createSubmission,
    updateSubmission,
    uploadAnonymizedFiles,
    getSubmissionsForAuthor,
    getSubmissionsForReviewer,
    refreshSubmissions,
    downloadSubmissionFile,
  ]);

  return (
    <SubmissionDataContext.Provider value={value}>
      {children}
    </SubmissionDataContext.Provider>
  );
}
