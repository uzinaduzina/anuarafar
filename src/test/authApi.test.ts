import { describe, expect, it } from 'vitest';
import { resolveAuthApiBaseForHost, shouldUseDefaultRemoteBase } from '@/lib/authApi';

describe('auth api resolution', () => {
  it('uses configured base when provided', () => {
    expect(resolveAuthApiBaseForHost('anuar.iafar.ro', 'https://custom.example/api/')).toBe('https://custom.example/api');
  });

  it('falls back to the worker on known production hosts', () => {
    expect(resolveAuthApiBaseForHost('anuar.iafar.ro')).toBe('https://iafar-email-auth.mztjvntwqx.workers.dev');
    expect(resolveAuthApiBaseForHost('anuarafar.pages.dev')).toBe('https://iafar-email-auth.mztjvntwqx.workers.dev');
    expect(resolveAuthApiBaseForHost('11daefc4.anuarafar.pages.dev')).toBe('https://iafar-email-auth.mztjvntwqx.workers.dev');
  });

  it('does not enable fallback on localhost-style hosts', () => {
    expect(resolveAuthApiBaseForHost('127.0.0.1')).toBe('');
    expect(resolveAuthApiBaseForHost('localhost')).toBe('');
    expect(shouldUseDefaultRemoteBase('127.0.0.1')).toBe(false);
  });
});
