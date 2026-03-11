import { useEffect } from 'react';

const ANALYTICS_SCRIPT_SRC = 'https://static.cloudflareinsights.com/beacon.min.js';

function getAnalyticsToken(): string {
  return String(import.meta.env.VITE_CF_WEB_ANALYTICS_TOKEN || '').trim();
}

export default function CloudflareWebAnalytics() {
  const token = getAnalyticsToken();

  useEffect(() => {
    if (!token || typeof document === 'undefined') return;

    const existing = document.querySelector('script[data-aaf-cf-analytics="1"]');
    if (existing) return;

    const script = document.createElement('script');
    script.defer = true;
    script.src = ANALYTICS_SCRIPT_SRC;
    script.setAttribute('data-aaf-cf-analytics', '1');
    script.setAttribute('data-cf-beacon', JSON.stringify({ token }));
    document.head.appendChild(script);
  }, [token]);

  return null;
}
