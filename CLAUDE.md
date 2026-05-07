# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Web platform for **Anuarul Arhivei de Folclor** (anuar.iafar.ro): public journal archive + editorial dashboard (issues, submissions, double-blind peer review). Romanian-language UI with English (`/en/*`) journal-information pages. Custom build, not OJS.

## Commands

- `npm run dev` — Vite dev server on port 8080.
- `npm run build` — runs `scripts/generate-sitemap.mjs` (reads `public/data/issues_manifest_user.js`) then `vite build`. The sitemap step **must succeed** for the build to publish correctly.
- `npm run lint` — eslint over the repo.
- `npm test` / `npm run test:watch` — vitest (jsdom). Single file: `npx vitest run src/test/example.test.ts`. Tests are discovered via `src/**/*.{test,spec}.{ts,tsx}`.
- `npm run zenodo:sync -- --issue <slug>` — DOI generation for an issue (dry-run by default; add `--execute --publish --update-manifest` to actually publish DOIs and write them back to all manifest copies).

Package manager: npm (lockfile is `package-lock.json`; `bun.lock` is also present but npm is canonical — `package.json` declares `npm@10.9.2`).

Path alias: `@/` → `./src` (configured in both `vite.config.ts` and `vitest.config.ts`).

## Architecture

### Two-tier deployment

1. **Static frontend** (Vite/React SPA) — served from Cloudflare Pages or `dist/` via `wrangler.jsonc` (root config, separate from worker).
2. **Cloudflare Worker** (`worker/email-auth/`) — single ~4k-line `src/index.ts` with its own `wrangler.toml` and KV namespace `AUTH_KV`. Handles auth, submissions, email templates, analytics, article-override persistence. All endpoints are dispatched from one `fetch` handler (`/auth/*`, `/admin/*`, `/submissions/*`, `/article-overrides`, `/analytics/*`, `/notify/role`).

The frontend talks to the worker via `VITE_AUTH_API_BASE`. Critically, `src/lib/authApi.ts:resolveAuthApiBaseForHost` **auto-uses the default remote worker for known production hosts** (anuar.iafar.ro, *.anuarafar.pages.dev, anuarafar.mztjvntwqx.workers.dev) even without an env var — so production builds work without `.env`. Local dev with no env stays in "local" auth mode.

### Data model

- **Issues** are CSV-first: `public/data/issues.csv` is the canonical source for issue metadata. Article metadata lives in `public/data/issues_manifest_user.js` (a JS file wrapping a JSON object).
- **`docs/`** holds a published copy of the static site and is **not** gitignored. `scripts/zenodo-sync.mjs` writes DOIs to manifest copies in **three** places: `public/data/`, `docs/data/`, `docs/anuarafar/data/`. Keep these in sync when editing manifests by hand.
- **Editor edits** flow through `JournalDataProvider`:
  - Issues: edits persist as a regenerated CSV in `localStorage[journal_issues_csv_v1]` (overrides the bundled file). `resetIssuesToFile()` clears the override.
  - Articles: when the remote worker is available, edits POST to `/article-overrides` (Bearer auth). Otherwise they write to `localStorage[journal_article_overrides_v1]`. Sanitization is restricted to fields in `ARTICLE_OVERRIDE_FIELDS`.
- **Submissions** (`SubmissionDataProvider`) live in worker KV when remote is enabled; otherwise local storage. Files are stored alongside in KV.

### DOAJ exports

`JournalDataProvider` contains the DOAJ export logic (CSV + XML, by series or by issue). Eligibility rules — applied **before** export and validation — exclude:

- Anything not seria-3 + published.
- Reviews (`is_review=true`).
- Articles missing authors or marked `N/A`.
- Sections matching `RECENZII`, `NOTEDELECTURA`, `RESTITUIRI` (after diacritic-stripping in `normalizeSectionKey`).
- Title patterns in `DOAJ_TITLE_EXCLUSION_PATTERNS` (in memoriam, interviu, note de lectură, etc.).

When changing DOAJ output, update both the export functions and `validateDoajRecords` together — they share the `doajExportScope` filter.

### Routing & roles

`src/App.tsx` is the route table. `RequireAuth` + `RequireRole` (in `components/auth/ProtectedRoute.tsx`) gate `/dashboard/*`. Roles: `admin` | `editor` | `reviewer` | `author`. `admin` implicitly passes any `RequireRole` check (see `canAccess` in `AuthContext.tsx`).

### Sessions

`AuthContext.tsx` persists sessions for 30 days in `localStorage[auth_session_v2]` and migrates legacy `sessionStorage` keys on read. Token expiry is parsed from the JWT-like first segment via `parseTokenExpiry`. Session expiry is checked on every authed action — expired tokens silently log out and clear state.

## Conventions worth knowing

- UI text and error messages are in Romanian. Keep that for user-facing copy unless a string is explicitly under `pages/public/EnglishJournalInfo`.
- `SERIES3_MEMORY.md` documents the editorial metadata rule for seria-3: a single `abstract` and single `keywords` field per article (multilingual variants are kept inside the same field, separated by language blocks). The UI reads `article.abstract`/`article.keywords` first; split-by-language fields are fallbacks only.
- PWA caching for `/data/` must remain `network-first` (see `SERIES3_MEMORY.md`) — stale manifests will mask data fixes.
- Worker `wrangler.toml` lists `ALLOWED_ORIGINS`; new frontend hosts must be added there for CORS.

## Agent-discovery surface

The site publishes machine-readable discovery files for AI agents (RFC 8288 Link headers, RFC 9264/9727 linkset, RFC 8414/9728 OAuth metadata, MCP SEP-1649 server card, agentskills.io v0.2.0 index). All of this lives under `public/.well-known/` and is copied to `dist/.well-known/` by Vite.

- `public/.well-known/api-catalog` — `application/linkset+json`, advertises the public manifest, sitemap, license, and worker `/health`.
- `public/.well-known/oauth-authorization-server` and `openid-configuration` — RFC 8414/OIDC discovery. **Both contain an `x-iafar-notes.deviation` field documenting that this site is not a standards-conformant OAuth/OIDC server**; the auth flow is custom JSON-bodied password + email-OTP. If/when you switch to real OAuth, drop the deviation notes and update `token_endpoint_auth_methods_supported`.
- `public/.well-known/oauth-protected-resource` — RFC 9728. Same deviation note.
- `public/.well-known/mcp/server-card.json` — points `transport.endpoint` at `https://api.iafar.ro/mcp`, which is implemented as a JSON-RPC stub in `worker/email-auth/src/index.ts:handleMcp`. The stub answers `initialize` / `tools/list` / `ping` correctly but returns an error on `tools/call` — real tool execution lives in WebMCP (see below). Keep the tool list in `MCP_TOOL_DESCRIPTORS` (worker) in sync with `tools` in `server-card.json` and `src/lib/webmcp.ts`.
- `public/.well-known/agent-skills/index.json` — references skill `.md` files with **sha256 digests**. If you edit any `.md` skill file, recompute its hash with `shasum -a 256` and update `index.json`. Stale digests will fail agent-skill verification.

`public/_headers` sets `Link:` headers on `/` for all the above and forces correct `Content-Type` on the extensionless files (Cloudflare otherwise serves them as `application/octet-stream`).

`public/robots.txt` carries `Content-Signal: search=yes, ai-train=no, ai-input=no` (mirrored to `docs/robots.txt` and `docs/anuarafar/robots.txt`).

**WebMCP** (`navigator.modelContext.provideContext`) is registered from `src/components/WebMcpRegistrar.tsx`, which calls `registerWebMcpTools` in `src/lib/webmcp.ts`. The registrar runs inside `JournalDataProvider` and re-registers when articles/issues change. Tools (`listIssues`, `getIssue`, `getArticle`, `searchArticles`) operate against the in-memory journal data — no network calls.

**Markdown for Agents** is a Cloudflare per-zone toggle (Dashboard → `anuar.iafar.ro` → Rules → Compatibility / "Markdown for Agents"). It's not in this repo. If you need to implement it ourselves later (e.g. on GitHub Pages where Cloudflare's feature isn't available), it would require a worker that intercepts asset responses and converts HTML → Markdown when `Accept: text/markdown` is sent.

## What lives where

- `src/pages/public/` — public site (archive, article view, submit form, English info pages).
- `src/pages/dashboard/` — editorial dashboard (issues, submissions, users, email templates, stats, reviewer/author views).
- `src/components/ui/` — shadcn-style Radix primitives (don't restyle these casually; they're shared).
- `src/data/` — providers, types (`SeriesId`, `Issue`, `Article`, `Submission`, `UserRole`), `journal.ts` constants, review form schema.
- `src/lib/` — `authApi.ts` (host detection), `csv.ts` (parser/serializer used for issues + DOAJ + article CSVs), `analytics.ts`, `pdfUrl.ts`, `issuePdfParts.ts`.
- `worker/email-auth/src/index.ts` — entire worker. Endpoints map under one `fetch` handler near the bottom (~line 4150).
- `scripts/` — `generate-sitemap.mjs` (run during build), `zenodo-sync.mjs`, `rebuild_series3_*.py` (one-off Python scripts for past issue rebuilds; not part of the build).
- `ingest/`, `presentations/` — auxiliary, not part of the app build.
