const DEFAULT_AUTH_API_BASE = 'https://iafar-email-auth.mztjvntwqx.workers.dev';

function normalizeBase(value: string) {
  return value.trim().replace(/\/+$/, '');
}

export function shouldUseDefaultRemoteBase(hostname: string) {
  const normalizedHost = hostname.trim().toLowerCase();
  if (!normalizedHost) return false;
  if (normalizedHost === 'anuar.iafar.ro') return true;
  if (normalizedHost === 'anuarafar.pages.dev') return true;
  if (normalizedHost.endsWith('.anuarafar.pages.dev')) return true;
  if (normalizedHost === 'anuarafar.mztjvntwqx.workers.dev') return true;
  return false;
}

export function resolveAuthApiBaseForHost(hostname: string, configuredBase?: string) {
  const configured = normalizeBase(configuredBase ?? String(import.meta.env.VITE_AUTH_API_BASE || ''));
  if (configured) return configured;

  if (shouldUseDefaultRemoteBase(hostname)) {
    return DEFAULT_AUTH_API_BASE;
  }

  return '';
}

export function resolveAuthApiBase() {
  const hostname = typeof window !== 'undefined' ? (window.location.hostname || '') : '';
  return resolveAuthApiBaseForHost(hostname);
}

export function isRemoteAuthEnabled() {
  return resolveAuthApiBase().length > 0;
}
