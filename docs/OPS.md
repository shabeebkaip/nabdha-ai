# Nabda AI — Ops Runbook

> Owner: devops-engineer. Update this file whenever the deploy/rollback/backup story changes — a stale runbook is a bug (see docs/PROJECT_PLAN.md hard rules).

## Status as of M0

Not yet deployed. No cloud resources provisioned. Vercel CLI not installed on this machine. Nothing in this file involving `vercel` has been run — it is the plan, not a verified log, until the human runs the `! ` commands and a devops-engineer confirms.

## One-time setup (human)

```
! npm i -g vercel
! vercel login
! vercel link
```

Provision Neon Postgres via Vercel Marketplace (Vercel dashboard -> Storage -> Create Database -> Neon). This auto-adds `DATABASE_URL` (and friends) to the Vercel project's env vars.

```
! vercel env pull .env.local
! vercel env add AUTH_SECRET production preview development
! vercel env add ANTHROPIC_API_KEY production preview development
! vercel env add BLOB_READ_WRITE_TOKEN production preview development
```

(`AUTH_SECRET`: generate with `openssl rand -base64 32`. `ANTHROPIC_API_KEY`: from console.anthropic.com. `BLOB_READ_WRITE_TOKEN`: add Vercel Blob storage from the same Storage tab first, or `vercel env pull` will pick it up once added.)

## Deploy

```
! vercel                 # preview deploy (private, per docs/DECISIONS.md default)
! vercel --prod          # production deploy, only when explicitly approved
```

CI is not set up yet (no GitHub Actions in this repo as of M0) — deploys are manual via CLI or Vercel's Git integration once the repo is pushed to GitHub and connected in the Vercel dashboard. Add a lint -> typecheck -> build gate before wiring auto-deploy-on-merge.

## Roll back

Vercel retains every deployment immutably.

```
! vercel rollback                         # interactive: pick a previous deployment
! vercel promote <deployment-url>         # or explicitly promote a specific one to production
```

## View logs

```
! vercel logs <deployment-url-or-project>
! vercel logs --follow                    # tail production
```

## Database migrations

```bash
npm run db:generate   # writes SQL to ./drizzle from src/db/schema.ts
npm run db:push        # apply schema directly (fast local iteration)
```

Run `db:generate` + commit the generated SQL once schema.ts has real tables (M1-T3); prefer generated migrations over `db:push` for anything touching production data.

## Database backups / restore

Neon takes automatic point-in-time backups (branching-based) on paid plans; the free tier retention is short. **Not yet configured or tested** — before real user data exists, a devops-engineer must:
1. Confirm the Neon plan's PITR retention window in the Neon console.
2. Test a restore: create a Neon branch from a past timestamp, verify data, document the exact steps here.
3. Only after a restore has been tested once does this count as a working backup.

## Health check

`GET /api/health` -> `{"status":"ok","service":"nabda-ai","time":"..."}`. Wire an uptime monitor (e.g. Vercel's own Monitoring, or a free UptimeRobot check) against this endpoint once deployed — not yet done.

## Incident log

(empty — first incident gets a dated entry here: what broke, root cause, fix, and how to catch it faster next time.)
