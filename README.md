# Nabda AI

AI-powered business intelligence for Saudi SMEs. Next.js (App Router) + TypeScript, deployed on Vercel.

Stack: Next.js 16 / React 19, TypeScript, Tailwind CSS + shadcn/ui, Recharts, Auth.js (NextAuth v5), Drizzle ORM + Neon Postgres, Vercel AI SDK + Anthropic (Claude), Vercel Blob.

See `docs/PROJECT_PLAN.md` and `docs/DECISIONS.md` for product scope and locked decisions.

## Status (M0 — scaffolding)

What exists: repo scaffold, folder structure, placeholder bilingual (AR/EN, RTL) landing page, `/api/health`, Drizzle wired to Neon (no tables yet), Auth.js/AI SDK/Blob packages installed but **not yet wired to real behavior** — that's M1 (backend-developer / ai-engineer / frontend-developer). Nothing is deployed yet; no cloud resources have been provisioned.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Health check: http://localhost:3000/api/health.

The app builds and runs out of the box against the placeholder values in `.env.local` (gitignored). No real database/API keys are required until you start wiring real features (M1).

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values when ready:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string (Drizzle client + `drizzle-kit`) |
| `AUTH_SECRET` | Auth.js session/JWT signing secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Canonical app URL Auth.js uses for callbacks |
| `ANTHROPIC_API_KEY` | Claude API key (Vercel AI SDK) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token (file uploads) |
| `NEXT_PUBLIC_APP_URL` | Public app URL, browser-exposed |

## Database (Drizzle + Neon)

Schema lives in `src/db/schema.ts` (empty on purpose — backend-developer defines tables next). Client in `src/db/index.ts`. Config in `drizzle.config.ts`.

```bash
npm run db:generate   # generate SQL migration from schema.ts
npm run db:push       # push schema directly to the DB (fast iteration)
npm run db:studio     # browse the DB in Drizzle Studio
```

These need a real `DATABASE_URL` in `.env.local` to actually connect (the placeholder value lets the app build/run but is not a live database).

## Folder structure

```
src/
  app/
    page.tsx           marketing landing (public)
    app/                authed SaaS surface -> /app/...
    admin/              admin surface -> /admin/...
    api/health/         health check route
  components/
    ui/                 shadcn/ui primitives
    language-switcher.tsx
  db/
    schema.ts            Drizzle schema (tables TBD)
    index.ts              Drizzle client (Neon HTTP driver)
  lib/
    i18n.ts               AR/EN dictionary + RTL helper (see below)
    utils.ts               shadcn cn() helper
```

## i18n / RTL approach

No i18n library. `src/lib/i18n.ts` is a plain dictionary keyed by `Locale` ("en" | "ar"), plus a `dirFor(locale)` helper. The locale is read from a `nabda_locale` cookie in `layout.tsx` (server component) and sets `<html lang dir>` accordingly — so RTL is a real CSS layout mode, not a stripe of translated strings. `LanguageSwitcher` (client component) flips the cookie and calls `router.refresh()`.

This is intentionally lightweight for the investor demo. If the dictionary grows past a couple hundred keys or needs plurals/date formatting, swap in `next-intl` — the `Locale`/`dirFor` shape maps directly.

## Deploy (Vercel) — not done yet, needs you

This repo has not been deployed and no paid resources have been provisioned. When you're ready:

```
! Install the Vercel CLI: npm i -g vercel
! Log in: vercel login
! Link the project: vercel link
! Create a Neon Postgres database via the Vercel Marketplace (Vercel dashboard -> Storage -> Create Database -> Neon), which auto-populates DATABASE_URL
! Pull the real env vars: vercel env pull .env.local
! Add the remaining secrets Vercel didn't provision: vercel env add AUTH_SECRET / ANTHROPIC_API_KEY / BLOB_READ_WRITE_TOKEN (production + preview)
! Deploy a preview: vercel
! Promote to production when ready: vercel --prod
```

Framework preset (Next.js) is auto-detected by Vercel; no `vercel.json` is needed for this app.

## Roll back

Vercel keeps every deployment; roll back from the dashboard ("Promote to Production" on an older deployment) or:

```
! vercel rollback
```

## Logs

```
! vercel logs <deployment-url>
```

## Linting / type-check / build

```bash
npm run lint
npx tsc --noEmit
npm run build
```
