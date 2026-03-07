import type { ReviewAnswer, ReviewCriterionId } from './types';

export interface ReviewCriterion {
  id: ReviewCriterionId;
  en: string;
  ro: string;
}

export const REVIEW_CRITERIA: ReviewCriterion[] = [
  {
    id: 'q1',
    en: 'Are the issues presented in the article consistent with the journal’s profile?',
    ro: 'Aspectele dezbatute in lucrare sunt in concordanta cu profilul revistei?',
  },
  {
    id: 'q2',
    en: 'Is the linguistic level of the text proper?',
    ro: 'Este adecvat nivelul lingvistic atins in articol?',
  },
  {
    id: 'q3',
    en: 'Is the vocabulary academic, without incoherencies or grammar mistakes?',
    ro: 'Vocabularul utilizat este de nivel academic, fara incoerente si greseli gramaticale?',
  },
  {
    id: 'q4',
    en: 'Is the article title suitable for its contents?',
    ro: 'Titlul articolului este clar si reflecta continutul lucrarii?',
  },
  {
    id: 'q5',
    en: 'Does the summary include the main ideas of the article?',
    ro: 'In cadrul rezumatului se regaseste o sinteza clara a continutului?',
  },
  {
    id: 'q6',
    en: 'Does the article respect the sections mentioned by the organisers?',
    ro: 'Sunt respectate recomandarile privind structura articolului?',
  },
  {
    id: 'q7',
    en: 'Considering the academic literature, is the article original and innovative?',
    ro: 'Avand in vedere literatura de specialitate, articolul este original si inovativ?',
  },
  {
    id: 'q8',
    en: 'Are previous sources on the researched area mentioned in the article?',
    ro: 'Se regasesc surse anterioare despre domeniul cercetat mentionate in articol?',
  },
  {
    id: 'q9',
    en: 'Is the methodology presented coherently and well applied?',
    ro: 'Metodologia utilizata este prezentata coerent si aplicata corespunzator?',
  },
  {
    id: 'q10',
    en: 'Do the conclusions clearly summarize the results and consequences?',
    ro: 'Concluziile rezuma in mod clar rezultatele si consecintele?',
  },
  {
    id: 'q11',
    en: 'Is the choice of references appropriate?',
    ro: 'Referintele bibliografice sunt adecvate?',
  },
];

export const REVIEW_ANSWER_LABELS: Record<ReviewAnswer, string> = {
  yes: 'Da',
  partial: 'Partial',
  no: 'Nu',
};

export const REVIEW_ANSWER_ORDER: ReviewAnswer[] = ['yes', 'partial', 'no'];

export const REVIEW_RECOMMENDATIONS = [
  { value: 'accept_as_is', label: 'Acceptat fara modificari' },
  { value: 'accepted_after_corrections', label: 'Acceptat dupa revizuire' },
  { value: 'reject', label: 'Nu poate fi acceptat' },
] as const;

export type ReviewRecommendationValue = (typeof REVIEW_RECOMMENDATIONS)[number]['value'];

export function emptyReviewForm(): Partial<Record<ReviewCriterionId, ReviewAnswer>> {
  return {};
}

export function isCompleteReviewForm(form: Partial<Record<ReviewCriterionId, ReviewAnswer>> | undefined | null): boolean {
  if (!form) return false;
  return REVIEW_CRITERIA.every((criterion) => (
    form[criterion.id] === 'yes'
      || form[criterion.id] === 'partial'
      || form[criterion.id] === 'no'
  ));
}

export function countReviewAnswers(form: Partial<Record<ReviewCriterionId, ReviewAnswer>> | undefined | null) {
  const counts: Record<ReviewAnswer, number> = { yes: 0, partial: 0, no: 0 };
  if (!form) return counts;

  for (const criterion of REVIEW_CRITERIA) {
    const answer = form[criterion.id];
    if (answer === 'yes' || answer === 'partial' || answer === 'no') {
      counts[answer] += 1;
    }
  }
  return counts;
}

export function reviewRecommendationLabel(value: string): string {
  const normalized = (value || '').trim().toLowerCase();
  if (normalized === 'accept_as_is' || normalized === 'accept' || normalized === 'acceptat') {
    return 'Acceptat fara modificari';
  }
  if (
    normalized === 'accepted_after_corrections'
    || normalized === 'minor_revisions'
    || normalized === 'major_revisions'
    || normalized === 'acceptat cu revizuiri minore'
    || normalized === 'revizuire solicitata'
    || normalized === 'revizuire solicitată'
  ) {
    return 'Acceptat dupa revizuire';
  }
  if (normalized === 'reject' || normalized === 'respins') {
    return 'Nu poate fi acceptat';
  }
  return value || '-';
}
