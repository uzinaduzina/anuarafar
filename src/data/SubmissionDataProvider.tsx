import { createContext, useContext, useMemo, useState, type ReactNode, useCallback, useEffect } from 'react';
import { SUBMISSIONS as INITIAL_SUBMISSIONS } from './articles';
import type { Submission } from './types';

const STORAGE_KEY = 'workflow_submissions_v1';

export interface NewSubmissionInput {
  title: string;
  authors: string;
  email: string;
  affiliation: string;
  abstract: string;
  keywords_ro: string;
  keywords_en: string;
}

interface SubmissionDataContextValue {
  submissions: Submission[];
  createSubmission: (input: NewSubmissionInput) => Submission;
  updateSubmission: (id: string, changes: Partial<Submission>) => void;
  getSubmissionsForAuthor: (email: string) => Submission[];
  getSubmissionsForReviewer: (email: string) => Submission[];
}

const SubmissionDataContext = createContext<SubmissionDataContextValue>({
  submissions: [],
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
  }),
  updateSubmission: () => {},
  getSubmissionsForAuthor: () => [],
  getSubmissionsForReviewer: () => [],
});

function normalizeSubmission(submission: Submission): Submission {
  return {
    ...submission,
    assigned_reviewer_email: submission.assigned_reviewer_email || '',
    review_notes: submission.review_notes || '',
    reviewed_at: submission.reviewed_at || '',
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

export function useSubmissionData() {
  return useContext(SubmissionDataContext);
}

export function SubmissionDataProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<Submission[]>(() => readInitialSubmissions());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  }, [submissions]);

  const updateSubmission = useCallback((id: string, changes: Partial<Submission>) => {
    setSubmissions((prev) => prev.map((submission) => (
      submission.id === id
        ? normalizeSubmission({ ...submission, ...changes })
        : submission
    )));
  }, []);

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

  const value = useMemo(() => ({
    submissions,
    createSubmission,
    updateSubmission,
    getSubmissionsForAuthor,
    getSubmissionsForReviewer,
  }), [submissions, createSubmission, updateSubmission, getSubmissionsForAuthor, getSubmissionsForReviewer]);

  return (
    <SubmissionDataContext.Provider value={value}>
      {children}
    </SubmissionDataContext.Provider>
  );
}
