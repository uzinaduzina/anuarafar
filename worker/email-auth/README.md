# Email Auth Worker (Cloudflare + Resend)

This worker provides:
- `POST /auth/request-code` -> sends OTP login code by email
- `POST /auth/verify-code` -> verifies OTP and returns user role profile
- `POST /notify/role` -> sends role-based announcements (`admin`, `editor`, `reviewer`, `author`, `all`)
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
  -d '{"email":"liviu.o.pop@gmail.com"}'
```

```bash
curl -X POST https://api.iafar.ro/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"email":"liviu.o.pop@gmail.com","code":"123456"}'
```

```bash
curl -X POST https://api.iafar.ro/notify/role \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: REPLACE_WITH_NOTIFY_API_KEY" \
  -d '{"role":"all","subject":"Anunt editorial","message":"Mesaj pentru toti utilizatorii."}'
```
