export interface IssuePdfPart {
  path: string;
  label: string;
}

function labelFromPath(path: string, index: number, total: number): string {
  const normalized = path.toLowerCase();

  if (normalized.includes('partea-iv')) return 'Descarcă numărul integral, partea IV';
  if (normalized.includes('partea-iii')) return 'Descarcă numărul integral, partea III';
  if (normalized.includes('partea-ii')) return 'Descarcă numărul integral, partea II';
  if (normalized.includes('partea-i')) return 'Descarcă numărul integral, partea I';

  if (total <= 1) return 'Descarcă numărul integral (PDF)';
  return `Descarcă numărul integral, partea ${index + 1}`;
}

export function parseIssuePdfParts(rawValue: string): IssuePdfPart[] {
  const parts = String(rawValue || '')
    .split(/\r?\n|\|/)
    .map((value) => value.trim())
    .filter(Boolean);

  return parts.map((path, index) => ({
    path,
    label: labelFromPath(path, index, parts.length),
  }));
}
