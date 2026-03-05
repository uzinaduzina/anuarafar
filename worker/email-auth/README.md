# Email Auth Worker (Cloudflare + Resend)

This worker provides:
- `POST /auth/request-code` -> validates `email + password` and sends login code by email
- `POST /auth/verify-code` -> verifies code and returns user profile + session token
- `GET /admin/users` -> list users (admin session)
- `POST /admin/users` -> create user with password and auto-send login code (valid 30 days)
- `POST /notify/role` -> sends role-based announcements (`admin`, `editor`, `reviewer`, `author`, `all`) using admin session
- `GET /health` -> health check

## 1. Prerequisites

- Cloudflare account with domain `iafar.ro` active in Cloudflare DNS
- Resend account with sender domain verified (recommended `send.iafar.ro`)
- `wrangler` CLI

## 2. Configure KV

```bash
cd worker/email-auth
npx wrangler login
npx wrangler kv namespace create AUTH_KV
npx wrangler kv namespace create AUTH_KV --preview
```

Paste resulting IDs into `wrangler.toml`:
- `id`
- `preview_id`

## 3. Configure Secrets (never commit these)

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put OTP_SECRET
npx wrangler secret put NOTIFY_API_KEY
```

- `RESEND_API_KEY`: Resend server API key
- `OTP_SECRET`: random long string used for OTP hashing
- `NOTIFY_API_KEY`: token required for `/notify/role`

## 4. Deploy Worker

```bash
npx wrangler deploy
```

Optional custom domain route:
- Worker route/domain in Cloudflare: `api.iafar.ro/*`

## 5. Connect Frontend (journal)

In project root `.env`:

```bash
VITE_AUTH_API_BASE=https://api.iafar.ro
```

Then rebuild/redeploy frontend.

## 6. Quick API tests

```bash
curl -X POST https://api.iafar.ro/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"email":"liviu.o.pop@gmail.com","password":"YOUR_PASSWORD"}'
```

```bash
curl -X POST https://api.iafar.ro/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"email":"liviu.o.pop@gmail.com","code":"123456"}'
```

Use `token` from `/auth/verify-code` in `Authorization: Bearer <token>`:

```bash
curl -X GET https://api.iafar.ro/admin/users \
  -H "Authorization: Bearer REPLACE_WITH_TOKEN"
```

```bash
curl -X POST https://api.iafar.ro/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REPLACE_WITH_TOKEN" \
  -d '{"name":"Reviewer Nou","email":"reviewer2@iafar.ro","role":"reviewer","password":"ParolaForta123"}'
```

```bash
curl -X POST https://api.iafar.ro/notify/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REPLACE_WITH_TOKEN" \
  -d '{"role":"all","subject":"Anunt editorial","message":"Mesaj pentru toti utilizatorii."}'
```
