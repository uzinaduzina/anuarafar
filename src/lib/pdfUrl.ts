const DEFAULT_PDF_BASE_URL = 'https://raw.githubusercontent.com/uzinaduzina/anuarafar/main/';

function getPdfBaseUrl(): string {
  const configured = String(import.meta.env.VITE_PDF_BASE_URL || '')
    .trim()
    .replace(/\/+$/, '');

  return configured || DEFAULT_PDF_BASE_URL.replace(/\/+$/, '');
}

export function resolvePdfUrl(pdfPath: string): string {
  if (!pdfPath) return '';
  if (/^https?:\/\//i.test(pdfPath)) return pdfPath;

  const normalized = pdfPath.replace(/^\/+/, '');
  return `${getPdfBaseUrl()}/${normalized}`;
}
