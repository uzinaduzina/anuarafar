import { createContext, useContext, useMemo, useState, type ReactNode, useCallback, useEffect } from 'react';
import { SUBMISSIONS as INITIAL_SUBMISSIONS } from './articles';
import type { Submission } from './types';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEY = 'workflow_submissions_v1';
const SUBMISSION_API_BASE = (import.meta.env.VITE_AUTH_API_BASE || '').trim().replace(/\/+$/, '');
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
  updateSubmission: (id: string, changes: Partial<Submission>) => void;
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
    reviewer_deadline: '',
    recommendation: '',
    review_notes: '',
    reviewed_at: '',
    decision: '',
    files: [],
  }),
  updateSubmission: () => {},
  getSubmissionsForAuthor: () => [],
  getSubmissionsForReviewer: () => [],
  refreshSubmissions: async () => ({ ok: false }),
  downloadSubmissionFile: async () => ({ ok: false }),
});

function normalizeSubmission(submission: Submission): Submission {
  return {
    ...submission,
    assigned_reviewer_email: submission.assigned_reviewer_email || '',
    review_notes: submission.review_notes || '',
    reviewed_at: submission.reviewed_at || '',
    files: Array.isArray(submission.files) ? submission.files : [],
  };
}

function readInitialSubmissions(): Submission[] {
  const fromStorage = localStorage.getItem(STORAGE_KEY);
  if (!fromStorage) {
    return INITIAL_SUBMISSIONS.map(normalizeSubmission);
  }

  try {
    const parsed = JSON.parse(fromStorage) as Submission[];
    if (!Array.isArray(parsed)) {
      return INITIAL_SUBMISSIONS.map(normalizeSubmission);
    }
    return parsed.map(normalizeSubmission);
  } catch {
    return INITIAL_SUBMISSIONS.map(normalizeSubmission);
  }
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

  const updateSubmission = useCallback((id: string, changes: Partial<Submission>) => {
    if (REMOTE_SUBMISSIONS_ENABLED && authTransport === 'remote' && authToken) {
      void (async () => {
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
            console.error('Submission update failed', payload.error || response.statusText);
            return;
          }

          if (payload.submission && typeof payload.submission === 'object') {
            const normalized = normalizeSubmission(payload.submission as Submission);
            setSubmissions((prev) => prev.map((submission) => (
              submission.id === normalized.id ? normalized : submission
            )));
            return;
          }

          await refreshSubmissions();
        } catch (error) {
          console.error('Submission update failed', error);
        }
      })();
      return;
    }

    setSubmissions((prev) => prev.map((submission) => (
      submission.id === id
        ? normalizeSubmission({ ...submission, ...changes })
        : submission
    )));
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
      reviewer_deadline: '',
      recommendation: '',
      review_notes: '',
      reviewed_at: '',
      decision: '',
      files: [],
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
    return submissions.filter((submission) => submission.assigned_reviewer_email?.toLowerCase() === normalizedEmail);
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
    getSubmissionsForAuthor,
    getSubmissionsForReviewer,
    refreshSubmissions,
    downloadSubmissionFile,
  }), [
    submissions,
    loading,
    createSubmission,
    updateSubmission,
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
