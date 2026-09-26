# NABDA AI — Locked Decisions

> Human-approved decisions. Supersede conflicting notes elsewhere. Updated 2026-09-26.

## Pricing (FINAL for demo — admin-editable per client §52)

**Model:** AI Credits wallet. (Slides/PPT = second wallet, defaults from Doc B §11 — kept but secondary for demo.)

### Monthly
| Plan | Credits/mo | Price |
|---|---|---|
| Basic | 1,000 | 49 SAR |
| Growth | 4,000 | 149 SAR |
| Pro | 12,000 | 399 SAR |
| Custom/Enterprise | — | Custom |

- Extra Credits: available (admin-configured bundles).
- **Pro monthly = 399 SAR** — resolves the 3,399 typo in Doc B/D.

### Annual (−20%, computed monthly×12×0.8)
| Plan | Credits/yr | Before | After −20% |
|---|---|---|---|
| Basic | 12,000 | 588 | 471 |
| Growth | 48,000 | 1,788 | 1,430 |
| Pro | 144,000 | 4,788 | **3,830** |

- Basic 471 & Growth 1,430 match client figures exactly, confirming the formula.
- Client's Pro annual "4,078 → 383" is a typo; corrected to 4,788 → 3,830.

## Stack (APPROVED)
- Next.js (App Router) + TypeScript, hosted on Vercel
- Neon Postgres (Vercel Marketplace)
- Auth.js (NextAuth)
- Claude API (Anthropic) as primary AI — surfaced to users as "Nabda AI Intelligence Engine". Multi-provider routing deferred (Gateway later).
- Vercel Blob — file uploads
- Tailwind CSS + shadcn/ui
- Recharts — charts

## AI
- Provider: **Claude (Anthropic)**. Needs `ANTHROPIC_API_KEY` from human.
- Until key provided: demo runs on pre-baked/seeded AI outputs. Live AI wired on: Analysis, Analyst Chat, Report generation.

## Scope for tomorrow (default — confirm if wrong)
- Deployed, clickable **investor demo**: full core flow on seeded "Nabda Retail Demo" data, live AI on key steps, **no real payment charging**.
- Deploy visibility: **Private Vercel preview** (default). Change to public on request.

## Still needed from human
- `ANTHROPIC_API_KEY` value.
- Vercel account login (for provisioning/deploy) — CLI not installed; will guide via `! vercel login` when deploy-ready.
- Confirm deploy = private preview (assumed).
