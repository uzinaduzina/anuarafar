export type SeriesId = 'seria-1' | 'seria-2' | 'seria-3';

export interface JournalInfo {
  name: string;
  abbr: string;
  issn: string;
  eissn: string;
  publisher: string;
  country: string;
  language: string;
  url: string;
  description: string;
}

export interface Issue {
  id: string;
  slug: string;
  year: string;
  volume: string;
  number: string;
  date_published: string;
  title: string;
  status: 'published' | 'draft';
  article_count: number;
  pages: number | string;
  doi_prefix: string;
  series: SeriesId;
  series_label: string;
  issue_pdf_path: string;
  cover_hint_path: string;
}

export interface Article {
  id: string;
  issue_id: string;
  title: string;
  authors: string;
  affiliations: string;
  emails: string;
  abstract_ro: string;
  abstract_en: string;
  keywords_ro: string;
  keywords_en: string;
  pages_start: string;
  pages_end: string;
  doi: string;
  language: string;
  status: 'published' | 'draft';
  section: string;
  series: SeriesId;
  pdf_path: string;
}

export interface Submission {
  id: string;
  title: string;
  authors: string;
  email: string;
  affiliation: string;
  abstract: string;
  keywords_ro: string;
  keywords_en: string;
  date_submitted: string;
  status: 'submitted' | 'under_review' | 'decision_pending' | 'accepted' | 'rejected' | 'revision_requested';
  assigned_reviewer: string;
  assigned_reviewer_email?: string;
  reviewer_deadline: string;
  recommendation: string;
  review_notes?: string;
  reviewed_at?: string;
  decision: string;
}

export type UserRole = 'admin' | 'editor' | 'reviewer' | 'author' | 'public';

export interface AppUser {
  username: string;
  name: string;
  roles: UserRole[];
}

export const SERIES_CONFIG: Record<SeriesId, { label: string; years: string; colorClass: string }> = {
  'seria-1': { label: 'Seria I', years: '1932–1945', colorClass: 'series-1' },
  'seria-2': { label: 'Seria a II-a', years: '1980–1998', colorClass: 'series-2' },
  'seria-3': { label: 'Seria a III-a', years: '2002–prezent', colorClass: 'series-3' },
};
