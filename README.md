# IAFAR Journal Platform

Web platform for journal publishing workflows:
- Public journal website
- Role dashboards: `admin`, `editor`, `reviewer`, `author`
- CSV-first data management for issues and articles
- Email OTP login via Cloudflare Worker + Resend (production mode)
- Admin-managed users with role + password + login code email (valid 30 days)
- Persistent login session (30 days) after successful code verification

## Local development

```bash
npm install
npm run dev
```

By default, authentication runs in **local mode** (codes are shown in local inbox UI).

## Production authentication (Cloudflare + Resend)

This project supports real email OTP login when `VITE_AUTH_API_BASE` is configured.

1. Deploy worker from [`worker/email-auth/README.md`](./worker/email-auth/README.md)
2. Add frontend env:

```bash
VITE_AUTH_API_BASE=https://api.iafar.ro
```

3. Rebuild and redeploy frontend.

When `VITE_AUTH_API_BASE` is set:
- Login page calls remote endpoints (email + password -> code by email):
  - `POST /auth/request-code`
  - `POST /auth/verify-code`
- Admin can manage users from dashboard:
  - `GET /admin/users`
  - `POST /admin/users`
- Admin can send role correspondence emails:
  - `POST /notify/role`

## GitHub Pages

GitHub Pages deploy is configured via workflow:
- `.github/workflows/deploy-gh-pages.yml`

Live URL:
- `https://anuar.iafar.ro/`

## Security notes

- Never commit `RESEND_API_KEY`, `OTP_SECRET`, `NOTIFY_API_KEY`.
- Keep secrets only in Cloudflare Worker secrets.
- If a key is exposed publicly, revoke and rotate immediately.
