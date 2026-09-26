# NABDA AI — PROJECT PLAN (Authoritative Delivery Plan)

> Single source of truth. Owner: project-manager. Last updated: 2026-09-26.
> Status legend: NOT STARTED / IN PROGRESS / DEV-DONE (self-tested) / QA-PASS / APPROVED (code-review) / BLOCKED.
> No task is DONE until: developer self-test → qa-engineer PASS → code-reviewer APPROVE. No gate is ever waived.

---

## 0. READ THIS FIRST (Blockers & hard truths — bad news first)

1. **"Deployed to Vercel tomorrow" cannot mean the full spec.** The client spec is a 24-module, 22-screen, 10-revenue-stream platform with an admin panel, multi-provider AI routing, and real multi-format file ingestion. That is a multi-week build. In one day we can ship **one thing well**: a polished, deployed, clickable **investor demo of the core flow, on the seeded "Nabda Retail Demo" dataset, with LIVE AI on the 3 steps that matter (analysis, chat, report)** and everything else present as convincing, navigable UI. That is what an investor needs to answer the 5 success questions. Anything more is a coin flip on the deadline.
2. **Pricing is contradictory across the client's own docs.** We have a recommended default (see §9) so we are not blocked, but the human must confirm 4 pricing decisions before the pricing page is "true." Until then the demo shows our recommended defaults, seeded and admin-editable.
3. **We need AI provider API key(s) from the human today.** No key = no live AI = the demo falls back to pre-baked results (still demoable, but weaker). This is the #1 external dependency.
4. **This plan assumes we DO NOT build real payment processing tomorrow.** Upgrade/Buy-Credits/checkout are demo flows (no real money moves). Real billing is Phase 2. Flagged so no one expects a live Stripe on day one. **Update: the human has a Moyasar TEST sandbox — an optional realism upgrade over the mock, still no real money (§16.7).**

---

## 1. EXECUTIVE SUMMARY

Nabda AI is an AI-powered Business Intelligence and decision-support SaaS for Saudi SMEs: it turns raw business data into a Business Health Score, KPIs, risks, opportunities, forecasts, AI recommendations, downloadable reports and presentations — monetized via subscriptions, AI credits, premium outputs, and professional services. The product must read as a **premium bilingual (AR/EN, RTL) B2B intelligence platform — not a chatbot**.

**What we commit to ship tomorrow (the "Tomorrow Cutline"):** a deployed, investor-ready demo on Vercel that walks the full core flow end-to-end — Landing → Sign up/Free Trial → Company Onboarding → Upload sample data → AI Analysis (live, with processing state) → Executive Dashboard (Health Score + KPIs) → Risks/Opportunities → AI Recommendations → AI Analyst Chat (live) → Generate Report PDF (live) → Generate Presentation (separate paid, demo) → Credits deducted → Pricing/Upgrade → Service request forms (Consultation/Training/Integration/Enterprise) → Admin Dashboard — all on the seeded **Nabda Retail Demo** data, with commercial values admin-configurable per client §52.

### The 5 MVP success questions (client §55) — every one must be answerable from the demo alone
1. **What problem does Nabda AI solve?** — Landing + onboarding narrative: data exists, decisions don't. (M1)
2. **How does the platform work?** — The visible pipeline: Upload → AI Analysis → Dashboard → Insights → Report. (M1)
3. **What does the customer receive?** — Health Score, KPIs, risks/opportunities, recommendations, PDF report, presentation. (M1)
4. **How does Nabda AI make money?** — Pricing page + credits meter + service request forms (10 revenue streams visible). (M1)
5. **How can the product scale?** — Admin config (prices/credits/model not hard-coded), model routing surfaced as "Nabda AI Intelligence Engine", enterprise/integration CTAs. (M1 shows it; M2/M3 build depth.)

---

## 2. USERS & SUCCESS CRITERIA

**Primary users:** (a) SME owner/manager (the customer) who uploads data and consumes intelligence; (b) the platform admin (Nabda operator) who configures commercial logic and watches revenue; (c) **the investor** watching a 3–5 minute demo — the real audience tomorrow.

**Measurable acceptance criteria for the MVP (tomorrow):**
- AC1: A first-time visitor can go Landing → Free Trial → Onboarding → Dashboard in under 2 minutes with zero dead ends.
- AC2: Uploading the sample dataset (or clicking "Use Nabda Retail Demo") triggers a visible AI processing state and produces a dashboard with Health Score 78/100, revenue SAR 1,240,000, +12.4% growth, and at least 3 risks + 3 opportunities (client §33).
- AC3: The AI Analyst chat answers at least the 5 suggested questions with a structured Answer / Reasons / Recommended-actions response (live AI where key is available; graceful fallback otherwise).
- AC4: "Generate Report" produces a downloadable PDF with the client's report sections (§9) and deducts credits; the credit meter updates visibly (e.g., 250 → 244).
- AC5: Pricing page shows Basic/Growth/Pro/Enterprise with a Monthly/Annual toggle (−20%), and all 4 service request forms submit and persist a lead. Admin dashboard shows users, revenue-by-stream, usage, and lets the admin edit at least price + credit allowance live.
- AC6: Full AR/EN toggle with correct RTL layout on the landing page and dashboard shell.
- AC7: Deployed and reachable on a Vercel URL, no console errors on the core flow.

---

## 3. SCOPE

### In scope for TOMORROW (M0 + M1)
Landing, Auth/Free-Trial, Company Onboarding, Data Upload (+ "use demo data"), AI Processing state, Executive Dashboard (Health Score + KPIs + trends), Insights, Risk & Opportunity Center, AI Recommendations, AI Analyst Chat, Report Generator + PDF, Presentation Generator (demo output), Credit Wallet + deduction, Pricing (monthly/annual), Upgrade (demo, no real payment), AI Solutions page, Consultation/Training/Integration/Enterprise request forms (persist leads), Billing (view only), Admin Dashboard (metrics + live config edit), AR/EN + RTL, seeded Nabda Retail Demo dataset, admin-config table.

### Explicitly OUT of scope tomorrow (deferred to M2/M3 — will creep if not named)
Real payment processing / invoices (Moyasar TEST sandbox is allowed as a demo, but real production billing, payouts, refunds, and reconciliation are M2); real multi-format ingestion & cleaning (PDF/xlsx parsing pipeline — tomorrow accepts upload but analyzes the seeded dataset); genuine multi-tenant data isolation hardening & audit logs (basic auth + row-scoping only); true multi-provider live routing logic (surface the concept; route to one configured provider); team accounts / RBAC beyond user-vs-admin; notifications system; digital products storefront & checkout; real consultant/training scheduling & payments; API access; mobile app; real forecasting models (LLM-generated forecast narrative only); comparison/share of reports; annual billing cycles logic beyond price display.

---

## 4. ARCHITECTURE SUMMARY

Single Next.js (App Router) + TypeScript app on Vercel serving all three surfaces (marketing site, SaaS app under `/app`, admin under `/admin`) from one codebase and one Postgres database, with commercial logic read from an `admin_config` table so nothing commercial is hard-coded (client §52). AI calls go through a thin server-side "Nabda AI Intelligence Engine" module that returns **structured JSON** (Zod-validated) for the four analytics layers and the chat, routed to whichever provider key is configured — the model choice is an internal config value, invisible to the user (client §18).

**Proposed stack (NEEDS HUMAN SIGN-OFF — locks tech and costs money):**
- Framework/host: **Next.js App Router + TypeScript on Vercel**.
- DB: **Postgres via Neon (Vercel Marketplace)** + Drizzle ORM (lightweight, fast to seed).
- Auth: **recommend Auth.js (NextAuth) credentials + email** — zero extra vendor, fastest for a demo. (Alternative: Clerk — faster UI but a paid vendor + another key. Recommend Auth.js for tomorrow.)
- AI: **Vercel AI SDK + AI Gateway** for multi-provider routing (OpenAI / Anthropic / Google), surfaced as "Nabda AI Intelligence Engine". Needs at least one provider key.
- Uploads: **Vercel Blob** (store the file; tomorrow we analyze the seeded dataset regardless).
- UI: **Tailwind + shadcn/ui**, **Recharts** for charts, **next-intl** for AR/EN + RTL.
- PDF: server-side render to PDF (React-PDF or Puppeteer-on-Vercel — devops to confirm which runs cleanly on Vercel functions; React-PDF is the safer/lazy pick).
- Payments (demo): **mock always-succeeds checkout** by default; **Moyasar TEST sandbox** as an optional realism upgrade (§16.7). No real money in either case.

---

## 5. DATA MODEL SKETCH (entities from client §25/§30/§36)

- **users** — id, name, email, password_hash, role (user|admin), locale, created_at.
- **companies** — id, owner_user_id, name, industry, size, employees, branches, country, business_model, objective. (tenant boundary; all data rows scoped by company_id)
- **datasets** — id, company_id, source_type (excel|csv|pdf|manual|demo), file_blob_url, status (uploaded|processing|analyzed), row_summary_json, created_at.
- **insights** — id, company_id, dataset_id, type (risk|opportunity|trend|recommendation|forecast), severity, title, detail_json (what/why/impact/action), created_at.
- **analyses** — id, company_id, dataset_id, health_score, kpis_json (revenue/growth/customers/AOV/inventory/cashflow), descriptive/diagnostic/predictive/prescriptive_json, model_used, credits_charged.
- **reports** — id, company_id, analysis_id, title, sections_json, pdf_blob_url, credits_charged, created_at.
- **presentations** — id, company_id, report_id, type, slides_count, style, audience, blob_url, credits_charged.
- **credit_wallets** — id, company_id, wallet_type (ai_credits|slides), balance, allowance, reset_date.
- **credit_transactions** — id, wallet_id, delta, reason (analysis|report|presentation|purchase|reset), ref_id, created_at.
- **subscriptions** — id, company_id, plan (basic|growth|pro|enterprise), billing_cycle (monthly|annual), status, started_at.
- **transactions** — id, company_id, kind (subscription|credit_pack|report|presentation|service), amount_sar, status (demo). 
- **usage_events** — id, company_id, event_type, model_used, tokens/units, created_at (feeds admin usage + KPI tracking §24).
- **leads** — id, company_id?, kind (consultation|training|integration|enterprise), payload_json (form fields), status (new), created_at.
- **admin_config** — key, value_json, category (pricing|credits|features|ai_model|addons). Seeded; editable in admin. THE de-hard-coding table (client §52).

---

## 6. CREDIT ENGINE DESIGN NOTES

- **Two decoupled concepts:** (a) **customer-facing price/allowance** (in `admin_config`, editable), (b) **internal cost per action** (a config-driven `credit_cost` table). Client §17/§233 requires that the underlying LLM/model cost can change without changing customer pricing — so a report always "costs" N *customer* credits regardless of which model ran it; the model's real token cost is logged separately in `usage_events` for margin analysis.
- **Default customer credit-cost table (seeded, admin-editable — client gave only relative values §17, so we set numbers):**
  - Standard Analysis: **2 credits**
  - Advanced Analysis: **5 credits**
  - Standard/Comprehensive Report: **6 credits**
  - Advanced Report: **10 credits**
  - AI Presentation: **separate wallet — 1 credit per slide** (Slides wallet), OR paid transaction if wallet empty.
  - Custom AI Modeling: not credit-based — quote/lead.
- **Wallets:** per §9 decision, default = **two wallets** (AI Credits + Slides) to match Doc B, both admin-editable. If human picks one unified pool, collapse Slides into AI Credits (config flag).
- **Deduction is transactional:** every AI action writes a `credit_transactions` row and updates `credit_wallets.balance`; the meter (e.g., "184/250") reads live balance. Reset date drives the monthly renewal display.

---

## 7. AI ENGINE PLAN (DATA → Descriptive → Diagnostic → Predictive → Prescriptive)

One server module = "Nabda AI Intelligence Engine". Each layer is a concrete structured LLM call (Zod-validated JSON out), fed the seeded dataset summary:

| Layer | Question | Concrete call | Output (structured) | Tomorrow: real or faked |
|---|---|---|---|---|
| Descriptive | What happened? | LLM summarizes KPI table | KPIs, trends JSON | **Real** (LLM over seeded data) — falls back to pre-baked JSON if no key |
| Diagnostic | Why? | LLM explains anomalies | causes[] per risk | **Real** / fallback |
| Predictive | What next? | LLM forecast narrative | forecast{revenue,demand,risk} | **Real narrative** (no statistical model — that's M2/M3) |
| Prescriptive | What to do? | LLM recommendations | recommendations[] w/ priority | **Real** / fallback |
| AI Analyst Chat | ad-hoc Q&A | streamed chat w/ dataset context | Answer/Reasons/Actions | **Real** (live) / fallback canned answers |
| Report | assemble | template + analysis JSON → PDF | PDF sections §9 | **Real** assembly, live AI prose |
| Presentation | assemble | analysis JSON → slides | demo deck | **Demo output** (templated), live text where time allows |

- **Model routing:** route to the one provider whose key the human supplies; the router interface supports 3 providers so the "multi-provider" story is architecturally true and demoable, even if only one is wired live tomorrow.
- **Health Score (§34):** computed as a weighted blend of KPI sub-scores (Revenue/Customer/Inventory/Profitability/Growth/Risk) — deterministic formula in code so it's stable at 78/100 for the demo, documented as "analytical indicator, not an audit."
- **Sample demo dataset "Nabda Retail Demo" (§33):** seeded JSON — monthly sales, products, inventory, customers, orders, expenses, payments; tuned so KPIs/insights match §33 numbers (SAR 1,240,000, +12.4%, inventory-concentration risk, high-value-customer opportunity). This is [ai-engineer] + [backend-developer] deliverable in M0/M1.

---

## 8. MILESTONES (with the realistic Tomorrow Cutline)

### M0 — Scaffolding & Deploy Skeleton  ⏱ first, tonight/early  → DEMOABLE: blank-but-deployed app on Vercel
Repo, Next.js+TS, Tailwind+shadcn, DB provisioned + schema migrated + seed, auth skeleton, i18n/RTL shell, CI, first Vercel deploy. **Cutline: everything below M0 must land or M1 is at risk.**

### M1 — Demo-Critical MVP (THE tomorrow deliverable)  → DEMOABLE: full core flow §32 end-to-end
The exact core flow on seeded data + live AI on analysis/chat/report. This is what the investor sees. Maps to client screens 01–22 (see §10 map). **Cutline: if time runs short, degrade live AI to pre-baked JSON before dropping any screen from the click-through — the flow must be unbroken.**

### M1.5 — Plan Purchase & Subscription Activation (MOCK payment; Moyasar-test optional) → DEMOABLE: Pricing → Checkout → active plan + credits, reflected in app + admin
The missing conversion flow (see §16). A demo-only, always-succeeds checkout that turns a trial company into a paying subscriber and tops up its credits. Default = fully mocked card form; optional = Moyasar TEST sandbox behind the same activation logic. No real money either way.

### M2 — Phase 2 (client Doc B §32)  → after demo
Real file ingestion (Excel/CSV/PDF parse + clean), real payments/billing (Moyasar LIVE + webhooks + invoices/refunds), notifications, advanced dashboards, team accounts + RBAC, advanced/comparison reports, tenant-isolation hardening + audit logs, digital products storefront, real service scheduling.

### M3 — Phase 3 Enterprise (client Doc B §33)  → later
Enterprise AI, custom workflows, real statistical forecasting, industry models, enterprise integrations (ERP/CRM/POS), dedicated environments, advanced security, enterprise API, white-label, live multi-provider cost-based routing.

---

## 9. PRICING DEFAULTS FOR THE DEMO (from PRICING_CONFLICTS.md — seeded & admin-editable)

Until the human decides, the demo ships these defaults (deliberate merge; all editable in admin):
- **Subscription prices: Doc A/C** — Basic **99**, Growth **199**, Pro **399** SAR/mo, Enterprise Custom (matches the pitch deck the client will present).
- **AI credit allowances: Doc B/D** — Basic **1,000** / Growth **4,000** / Pro **12,000** monthly (gives a realistic usage meter).
- **Slides: separate wallet** — Basic **80** / Growth **300** / Pro **900** slides/mo.
- **Annual: flat monthly×12 −20%**, computed at runtime (ignore the broken printed annual numbers).
- **Consultation: 375 SAR/hr, Nabda share 112.50 (30%)** — no conflict.
> These map to the 4 open pricing decisions in §12. If the human overrides, we change config values, not code.
> Note: `src/lib/pricing.ts` now ships Basic **49** / Growth **149** / Pro **399** SAR/mo with annual pre-discounted (471 / 1,430 / 3,830) and credits 1,000 / 4,000 / 12,000 — this file is the current source of truth the checkout in §16 charges against.

---

## 10. SCREEN & MODULE → MILESTONE MAP (all 22 screens / 24 modules)

| # | Screen (client §57) | Milestone | Notes |
|---|---|---|---|
| 01 | Landing Page | M1 | AR/EN, RTL, Saudi identity, all CTAs |
| 02 | Sign Up / Login | M1 | Auth.js |
| 03 | Free Trial | M1 | limited allowance seeded |
| 04 | Company Onboarding | M1 | §6 fields |
| 05 | Data Upload | M1 | upload to Blob + "Use Nabda Retail Demo" |
| 06 | AI Processing | M1 | visible processing state §6 |
| 07 | Executive Dashboard | M1 | Health Score + KPIs + trends |
| 08 | AI Insights | M1 | what/why/impact/action |
| 09 | Risk & Opportunity Center | M1 | ≥3 each |
| 10 | AI Recommendations | M1 | prescriptive layer |
| 11 | Report Generator | M1 | sections §9, deduct credits |
| 12 | Report Viewer + PDF | M1 | online view + PDF download |
| 13 | Presentation Generator | M1 | separate paid; demo output |
| 14 | Pricing Plans | M1 | monthly/annual toggle |
| 15 | Credit Wallet | M1 | used/remaining/reset §50 |
| 16 | AI Solutions | M1 | 3 packages §19 (marketing depth) |
| 17 | Consultation | M1 | Book form → lead |
| 18 | Training | M1 | Explore/Request form → lead |
| 19 | Integration Request | M1 | form §20 → lead |
| 20 | Enterprise/Custom Request | M1 | form §47 → lead |
| 21 | Billing | M1 | view plan/credits (no real pay) |
| 22 | Admin Dashboard | M1 | metrics + live config edit |
| — | AI Analyst Chat (§21/§4) | M1 | live AI, inside dashboard |
| — | Checkout / Subscribe (§16) | M1.5 | MOCK payment (or Moyasar test) → activates plan + credits |
| — | Notifications (§31) | M2 | |
| — | Digital Products storefront (§24) | M2 | link/placeholder in M1 |
| — | Real payments/invoices (§42) | M2 | Moyasar LIVE + webhooks |
| — | Real integrations engine (§20) | M3 | request form only in M1 |

---

## 11. TASK BREAKDOWN (every agent assigned; gates shown)

> Each task closes only via: [owner] self-test → [qa-engineer] PASS → [code-reviewer] APPROVE.

### M0 — Scaffolding & Deploy Skeleton
- **M0-T1 [devops-engineer]** Create Vercel project, provision Neon Postgres, wire env vars, set up preview + prod deploy, confirm one deploy is live. **AC:** a Vercel URL returns the Next.js starter; DB reachable from a serverless function; env vars documented.
- **M0-T2 [devops-engineer]** Scaffold Next.js App Router + TS + Tailwind + shadcn + next-intl (AR/EN, RTL) + Drizzle. **AC:** `pnpm build` passes; lint passes; `/` renders in both locales with correct dir=rtl for AR.
- **M0-T3 [backend-developer]** Define Drizzle schema (all §5 entities) + migration + seed script (Nabda Retail Demo dataset, admin_config defaults from §9/§6, one demo user, one admin). **AC:** `migrate` + `seed` run clean; querying admin_config returns seeded prices/credits; demo dataset present.
- **M0-T4 [ui-ux-engineer]** Produce `docs/DESIGN_SPEC.md`: brand (premium AR/EN Saudi BI, not chatbot), color/type, component inventory, dashboard & landing layouts, RTL rules. **AC:** spec covers every M1 screen + states (empty/processing/error); approved before frontend build.
- **Gate M0:** devops self-test → qa smoke (deploy reachable, both locales, seed present) → code-review of scaffold/schema.

### M1 — Demo-Critical MVP
- **M1-T1 [backend-developer]** Auth (Auth.js): signup, login, free-trial provisioning (creates company + trial subscription + seeded wallets). **AC:** new user lands in onboarding with a trial plan + limited credits.
- **M1-T2 [backend-developer]** API contracts (route handlers/server actions) for: onboarding save, dataset upload/use-demo, run-analysis, get-dashboard, chat, generate-report, generate-presentation, credit deduct/read, leads submit, admin metrics + config CRUD. **AC:** contracts documented (input/output Zod types) and callable; credit deduction is transactional.
- **M1-T3 [ai-engineer]** Nabda AI Intelligence Engine: 4-layer structured analysis + chat + report/presentation text, provider-routed, Zod-validated, with pre-baked fallback matching §33. **AC:** running analysis on demo data returns Health Score 78, revenue 1.24M, +12.4%, ≥3 risks + ≥3 opportunities; chat answers the 5 suggested questions; degrades gracefully with no key.
- **M1-T4 [ai-engineer]** Health Score formula + credit-cost integration (each AI action charges per §6 table). **AC:** deterministic 78/100 on demo data; each action writes a credit_transaction and lowers the meter.
- **M1-T5 [frontend-developer]** Marketing: Landing (hero, How-It-Works, pricing preview, all CTAs), AI Solutions, service marketing sections — AR/EN + RTL. **AC:** matches DESIGN_SPEC; AC1/AC6 met.
- **M1-T6 [frontend-developer]** App shell + Onboarding + Upload + AI Processing state. **AC:** flow steps 02–06 unbroken; processing state visible; "Use Nabda Retail Demo" works.
- **M1-T7 [frontend-developer]** Executive Dashboard + Insights + Risk/Opportunity + Recommendations (Recharts). **AC:** AC2 met; charts render in RTL; matches spec.
- **M1-T8 [frontend-developer]** AI Analyst Chat UI (non-chatbot framing: "Ask Nabda AI" panel with suggested questions, structured answer cards). **AC:** AC3 met; streamed responses; does not look like a generic chatbot.
- **M1-T9 [frontend-developer]** Report Generator + Viewer + PDF download; Presentation Generator (demo output). **AC:** AC4 met; PDF downloads with §9 sections; credits deducted visibly.
- **M1-T10 [frontend-developer]** Pricing (monthly/annual toggle −20%), Credit Wallet, Billing (view), Upgrade/Buy-Credits (demo). **AC:** AC5 pricing/credits parts met; values read from admin_config.
- **M1-T11 [frontend-developer]** Consultation / Training / Integration / Enterprise request forms → persist leads. **AC:** each submits, validates, persists a lead visible in admin.
- **M1-T12 [frontend-developer + backend-developer]** Admin Dashboard: users/revenue-by-stream/usage/conversion metrics (seeded/derived) + live edit of price + credit allowance. **AC:** AC5 admin parts met; editing a price in admin changes the pricing page value.
- **Gate M1 (mandatory, per screen group):** developer self-test (build/lint/runtime) → **[qa-engineer]** full flow verification against AC1–AC7 → **[code-reviewer]** APPROVE diff. Critical/Major bug ⇒ back to owning dev, then QA re-verifies.
- **M1-QA [qa-engineer]** End-to-end run of the §32 flow on a deployed preview; verify all AC; produce PASS/FAIL with severities. **AC:** documented verdict; the 15-step flow completes with no dead ends.
- **M1-REV [code-reviewer]** Review full M1 diff: security basics (auth, company_id scoping, no leaked keys, input validation on forms/upload), config-not-hard-coded, no obvious perf traps. **AC:** APPROVE or REQUEST CHANGES with specifics.
- **M1-DEPLOY [devops-engineer]** Promote to the demo URL (private preview by default — see §12 decision), verify no console errors, env keys set. **AC:** AC7 met; shareable URL.
- **M1-PM [project-manager]** Verify milestone vs plan, update statuses honestly, write the plain-language demo-day summary + investor demo script (§54). **AC:** this file current; human briefed.

### M1.5 — Plan Purchase & Subscription Activation — see §16 for the full spec, contract, and tasks.

### M2 / M3 — deferred (tasks expanded when M1 ships; owners pre-tagged)
- Real ingestion pipeline [backend + ai], payments/billing [backend], notifications [frontend + backend], tenant-isolation + audit logs + security review [backend + code-reviewer + devops], advanced dashboards/reports [frontend + ai], team/RBAC [backend], statistical forecasting + industry models [ai], enterprise integrations + API [backend + devops], white-label [frontend]. Each still passes the 3 gates.

---

## 12. QUALITY GATES (mandatory every milestone)
1. **Developer self-test** — build passes, lint passes, tests where they exist, manual runtime verification of the exact user story (browser + server + data).
2. **[qa-engineer] verification** — independently runs the deployed/preview product against the milestone's acceptance criteria. PASS or PASS-WITH-ISSUES (Minor only). Critical/Major ⇒ returns to owning developer, then QA re-verifies. Any developer "NOT TESTED" item is QA's to cover.
3. **[code-reviewer] approval** — reviews the diff; APPROVE / APPROVE-WITH-NITS / REQUEST-CHANGES. Only APPROVE (or APPROVE-WITH-NITS) closes a task.
None of the three is ever waived, including under the tomorrow deadline.

---

## 13. RISK REGISTER

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **1-day deadline** — full scope impossible | Certain | High | Enforce the Tomorrow Cutline (§8): ship M1 core flow on seeded data only; degrade live AI→pre-baked before dropping any screen; M0 must land first. |
| R2 | **No/late AI API key** | Medium | High | Build the pre-baked fallback (§7) first so the demo works keyless; wire live AI when key arrives. Ask human for key TODAY (§12 decision). |
| R3 | **Pricing ambiguity** | High | Medium | Ship §9 recommended defaults, all admin-editable; get 4 decisions confirmed before pricing page is called "final." |
| R4 | **AI latency/cost blows the demo** | Medium | Medium | Cap tokens, cache the demo analysis result, show processing state; log real cost to usage_events for margin story, not live spend. |
| R5 | **Data security / tenant isolation** (client §26/§43) | Medium | High (trust) | M1: auth + strict company_id row-scoping + input validation + no keys client-side + HTTPS. Full isolation hardening + audit logs = M2, flagged to human (do not oversell "enterprise-grade" tomorrow). |
| R6 | **PDF/Puppeteer fails on Vercel serverless** | Medium | Medium | devops validates PDF path in M0; prefer React-PDF (no headless browser) to avoid function-size/timeout issues. |
| R7 | **RTL/bilingual polish slips** | Medium | Medium | next-intl + logical CSS props from M0; QA checks AR RTL on landing + dashboard (AC6) as a gate, not an afterthought. |
| R8 | **Scope creep from 10 revenue streams** | High | Medium | Streams beyond subscriptions/credits/reports/presentations are shown as forms/marketing only in M1 (§3 out-of-scope explicit). |
| R9 | **Mock/test checkout mistaken for real billing** | Medium | Medium | Label checkout "Test mode — no real payment"; never accept/store/log real card data; price/credits derived server-side from config, never from the client (§16). Real gateway is M2. |
| R10 | **Moyasar test integration eats demo time / breaks live** (if chosen over mock) | Medium | Medium | Ship the mock first (guaranteed); wire Moyasar test only as a stretch behind the SAME `/api/checkout` activation. Network/callback failure ⇒ fall back to mock. Keep secret key in `.env.local`, never client-side or committed. |

---

## 14. YOUR DECISION NEEDED (human — needed now to proceed)

**Pricing (from PRICING_CONFLICTS.md):**
1. **Subscription price set:** 99/199/399 (Doc A/C — recommended, matches your pitch deck) or 49/149/3,399 (Doc B/D)?
2. **Pro monthly:** 399 or 3,399 SAR? (Likely a 399↔3,399 typo — confirm.)
3. **Credit wallets:** one unified pool, or two (AI Credits + Slides — recommended, matches Doc B)?
4. **Annual pricing:** confirm annual = monthly×12 −20% computed at runtime, ignoring the broken printed annual figures?

**Build/stack:**
5. **Stack sign-off** (costs money / locks tech): Next.js on Vercel + Neon Postgres + Auth.js + Vercel AI Gateway + Vercel Blob + Tailwind/shadcn/Recharts/next-intl. Approve, or change auth (Clerk?) / DB?
6. **AI provider key(s):** Which will you supply TODAY — OpenAI, Anthropic (Claude), and/or Google (Gemini)? At least one is required for live AI; without it the demo runs on pre-baked results.
7. **Scope cutline approval:** Do you accept tomorrow = polished deployed clickable demo of the core flow on seeded "Nabda Retail Demo" data + live AI on analysis/chat/report, with the rest present as navigable UI (NOT the full 10-stream production platform, NO real payments)?
8. **Deploy visibility:** Is tomorrow's Vercel deploy a **private preview** (recommended — password/preview-protected for the investor) or **public**?

**Checkout / M1.5 (see §16.5 for the recommended answers):**
9–14. Six decisions on the checkout — Enterprise stays "Contact Sales", no downgrade/cancel/proration, dedicated `/app/checkout` route, logged-out routing, transaction status label, and **mock vs Moyasar-test payment**. Defaults are chosen; confirm or override.

> Per team rules, I will not choose the stack, spend money, or deploy without your go on 5–8. Building of keyless/fallback pieces (M0 scaffolding, schema, design spec) can start immediately in parallel.

---

## 15. PLAIN-LANGUAGE SUMMARY (for the non-technical owner)

We cannot honestly build the entire Nabda AI platform in one day — it is genuinely a multi-week product. What we CAN deliver tomorrow, and what an investor actually needs, is a **real, deployed, clickable demo of the whole story**: a visitor signs up, sets up their company, loads the sample "Nabda Retail Demo" business, watches the AI analyze it, sees a professional dashboard with a Business Health Score, risks, opportunities and recommendations, chats with the AI analyst, downloads a PDF report, generates a presentation, watches their credits go down, sees the pricing plans, **subscribes to a plan through a checkout (test payment — no real charge)**, and requests consultation/training/integration/enterprise services — plus an admin screen where you can change prices and credits live and watch revenue move. It will be bilingual Arabic/English and look like a premium business-intelligence platform, not a chatbot.

To hit tomorrow, three things stay simple on purpose: it runs on the sample dataset (not your real files yet), it does not take real payments yet (a test/mock checkout stands in), and the "enterprise-grade security" story is real in direction but basic in depth for now. All of that is Phase 2. The AI is genuinely live on the parts that matter (analysis, chat, report) as long as you give us one AI key today; if not, it still runs on convincing pre-prepared results.

I need decisions from you now (above) — mostly the pricing you want the investor to see, an OK on the tools, an AI key, whether the demo link is private or public, and whether the checkout is a simple mock or your Moyasar test sandbox. Once I have those, the team builds tonight and we deploy tomorrow.

---

## 16. M1.5 — PLAN PURCHASE & SUBSCRIPTION ACTIVATION (MOCK / MOYASAR-TEST PAYMENT)

> Owner sequencing: [ui-ux-engineer] (light) → [backend-developer] → [frontend-developer] → [qa-engineer] → [code-reviewer]. Demo-scoped and lean. **No real gateway charge, no real money — payment always succeeds (mock) or uses Moyasar TEST cards (sandbox).** Safe on localhost/preview.

### 16.1 Why this exists
The pricing page's plan buttons currently all say "Start Free Trial" and route to `/signup`. There is no way for a company to become a paying subscriber, so the "How does Nabda AI make money?" story (success question #4) has a dead end, and the admin MRR/paid-users numbers never move during a demo. M1.5 closes that loop.

### 16.2 End-to-end user flow
1. **Pricing page (`/pricing`, public, dark).** Basic / Growth / Pro cards get a **"Subscribe" / "Buy now"** CTA (localized) carrying the chosen `plan` + the current Monthly/Annual toggle value. **Custom stays "Contact Sales"** → `/enterprise` (unchanged).
2. **Auth gate (logged-out only).** Clicking Subscribe while logged out routes to auth **preserving intent** via `callbackUrl`, e.g. `/login?callbackUrl=%2Fapp%2Fcheckout%3Fplan%3Dgrowth%26cycle%3Dannual`. Login already honors `callbackUrl` (verified in `login-form.tsx`). New users follow the signup link; `signup-form.tsx` is extended to honor the same `callbackUrl` after auto-sign-in (small change — see FE-2). Logged-in users go straight to checkout.
3. **Checkout surface (`/app/checkout`, authed app shell, light).** A **dedicated route** (recommended over a modal — see 16.5-C). Server-reads `?plan=&cycle=`, validates them, and renders an **order summary** (plan name, cycle, price for that cycle, included monthly AI credits — from live pricing) plus the **payment step**, with a clear **"Test mode — no real payment is processed"** banner:
   - **Mock variant (default):** a card form (cardholder name, card number, expiry, CVC) with a **published test-card placeholder** (`4242 4242 4242 4242`), client-side format validation only, **card data never leaves the browser.**
   - **Moyasar-test variant (optional, §16.7):** the Moyasar hosted/JS form initialized with the **publishable** key; the customer enters a Moyasar TEST card; Moyasar returns a `payment.id`.
4. **Submit → processing.** Mock: ~0.8–1.2s simulated delay, **always succeeds.** Moyasar-test: create/confirm the payment, then the server **verifies** the payment id via Moyasar's API before activating.
5. **Activation (server, atomic-ish per neon-http pattern) — identical for both variants.** Upsert the company's `subscriptions` row to `(plan, billingCycle=cycle, status="active")`, insert a `transactions` row (`kind="subscription"`, `amountSar`=charged price, `status="paid"`), and **set** the `ai_credits` wallet `balance` + `allowance` to the plan's `creditsPerMonth` with a `creditTransactions` ledger entry.
6. **Success state → land in app.** Success screen with the new plan + credit figures and a **"Go to dashboard"** CTA → `/app` (and/or `/app/credits`). `router.refresh()` so server components re-read. The credits page shows the new balance/allowance; **`/admin` shows paid-users +1 and MRR up by the plan's monthly price** (admin MRR is driven by `subscriptions.status="active"` — verified in `src/app/admin/(panel)/page.tsx`).
7. **States:** loading (processing), error (declined/API 4xx/5xx → inline alert, form re-enabled, no mutation), success. Full **EN/AR + RTL**, premium look consistent with the app shell.

### 16.3 API contract
**`POST /api/checkout`** (`runtime = "nodejs"`; pattern mirrors `src/app/api/analysis/run/route.ts`)

- **Auth:** `requireCompanySession()` → `{ companyId }`. Unauth → 401 `UNAUTHENTICATED`; no company → 403 `FORBIDDEN` (via `errorToResponse`).
- **Request body (Zod):**
  ```
  { plan: "basic" | "growth" | "pro",
    cycle: "monthly" | "annual",
    paymentId?: string }   // present only in the Moyasar-test variant
  ```
  No card fields are ever sent. Unknown/`enterprise`/`custom` plan or bad cycle → 400 `VALIDATION_ERROR`, **no mutation**.
- **Server logic (price & credits derived server-side — NEVER from the client):**
  1. Resolve plan via `getLivePricingPlans()` (matches the price the user saw on `/pricing`); fall back to `getPlan(plan)` in `src/lib/pricing.ts`. `amountSar = cycle === "annual" ? annualPrice : monthlyPrice`; `credits = creditsPerMonth`.
  2. **Confirm payment:**
     - *Mock variant:* simulated processing delay (~1s), always OK.
     - *Moyasar-test variant:* `GET {MOYASAR_API_BASE}/payments/{paymentId}` with HTTP Basic auth (`MOYASAR_SECRET_KEY` as username, blank password); require `status === "paid"` **and** `amount === amountSar * 100` (Moyasar amounts are in halalas) **and** currency SAR. Mismatch/unpaid → 402/400, no mutation.
  3. Upsert `subscriptions` for `companyId`: `UPDATE ... SET plan, billing_cycle=cycle, status='active', started_at=now WHERE company_id=$1`; if 0 rows, INSERT (normally one seeded row per company).
  4. INSERT `transactions`: `{ companyId, kind:"subscription", amountSar, status:"paid" }` → capture id as `refId`.
  5. Top up `ai_credits` wallet to `credits`: **set** `balance = credits`, `allowance = credits`, `reset_date = now + 30 days`, write a `creditTransactions` row `delta = credits - previousBalance`, `reason = "subscription:activate"`, `refId = <transaction id>`. Same single data-modifying-CTE style as `src/lib/credits.ts` (new helper — see BE-2).
- **Success response (200):**
  ```
  { plan, cycle, amountSar, credits: <newBalance>, subscriptionStatus: "active" }
  ```
- **Idempotency:** none for the demo — re-submitting re-activates the same plan. `// ponytail: no idempotency key; add one if demo re-clicks distort MRR.`

### 16.4 Task breakdown by owner
> Each task closes only via: [owner] self-test → [qa-engineer] PASS → [code-reviewer] APPROVE.

**[ui-ux-engineer] (light — addendum only)**
- **PC-D1** Add a "Checkout / Subscribe" section to `docs/DESIGN_SPEC.md`: `/app/checkout` layout (order summary + payment step), the "Test mode — no real payment" disclosure treatment, processing/success/error states, and the pricing-card CTA label change — EN + AR with RTL notes. Cover both the mock card form and (if chosen) the Moyasar hosted form slot. **AC:** spec covers all three states + RTL + the disclaimer; no new components beyond the existing system, or any new ones are named. *(Skip only if a designer confirms existing form/card patterns fully cover it.)*

**[backend-developer]**
- **PC-BE1** `POST /api/checkout` route per §16.3: Zod validation, `requireCompanySession`, server-derived price/credits, reject `enterprise`/`custom`, confirm payment (mock delay OR Moyasar verify), upsert subscription→active, insert transaction, top-up credits + ledger; errors via `errorToResponse`. **AC:** valid input returns 200 with correct `amountSar`+`credits` and (a) `subscriptions` row = active/selected plan/cycle, (b) a `transactions` subscription row with the charged amount, (c) `ai_credits` wallet balance+allowance = plan credits + one ledger row; invalid/enterprise → 400 no DB change; unauth → 401. No card data anywhere.
- **PC-BE2** Add `activatePlanCredits({ companyId, credits, refId })` to `src/lib/credits.ts` — single-CTE set-to-target with a `creditTransactions` delta row, mirroring the atomic `deductCredits`/`refundCredits` pattern. **AC:** setting credits from any prior balance yields the correct new balance/allowance and matching ledger delta in one round-trip; includes a one-line runnable self-check (assert new balance == target, delta == target - prev).
- **PC-BE3 (Moyasar-test variant ONLY)** Add a thin `verifyMoyasarPayment(paymentId)` server helper: `GET {MOYASAR_API_BASE}/payments/{id}` with Basic auth (`MOYASAR_SECRET_KEY`), assert `status==="paid"`, `amount===amountSar*100`, currency SAR. Keys from `process.env` only (`MOYASAR_SECRET_KEY`, `MOYASAR_API_BASE`); publishable key exposed to client via `NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY`. Add all four to `.env.example` (names only, no values). **AC:** valid test payment verifies to true; tampered amount/unpaid → false → route returns 402/400 with no mutation; no secret in client bundle or logs. *(Not needed if the mock variant is chosen — decision 14.)*

**[frontend-developer]**
- **PC-FE1** Pricing cards (`pricing-card.tsx`): Basic/Growth/Pro CTA → localized **"Subscribe"**, linking to `/app/checkout?plan=<id>&cycle=<billing>` when authed, else `/login?callbackUrl=<encoded checkout url>`. Pass the current billing toggle from `pricing-plans.tsx` to the card. Custom unchanged ("Contact Sales" → `/enterprise`). **AC:** correct href per plan and billing; logged-out click lands on auth then returns to checkout with plan+cycle intact; Custom unchanged.
- **PC-FE2** `signup-form.tsx`: honor a `callbackUrl` (safe, `/`-prefixed) param — after successful auto-sign-in, redirect there instead of `/app/onboarding` when present. **AC:** signing up from a Subscribe deep-link lands on `/app/checkout` with plan+cycle preserved; normal signup still goes to onboarding.
- **PC-FE3** `/app/checkout` page + client form: server-read+validate `plan`/`cycle` (invalid → redirect to `/pricing` or graceful error), render order summary from live pricing, the payment step (mock card form with test-card placeholder + disclaimer + client-side validation, OR the Moyasar hosted form), submit → `POST /api/checkout` → processing → success ("Go to dashboard" + `router.refresh()`) / error states. Bilingual EN/AR + RTL, app-shell premium styling. **AC:** all three plans × both cycles render correct price/credits; submit succeeds (mock always; Moyasar test card) and lands on success; error path re-enables the form without mutating data; AR/RTL correct; no console errors.
- **PC-FE4** i18n: add every new user-facing string (Subscribe CTA, checkout labels, card fields, test-mode disclaimer, processing/success/error copy) to `src/lib/i18n.ts` in **EN + AR**. **AC:** no hard-coded strings in FE1/FE3; both locales complete. *(May fold into FE1/FE3 commits.)*

**[qa-engineer]**
- **PC-QA** End-to-end verification against §16.6 on a running preview: logged-in and logged-out entry, all 3 plans, both cycles; confirm credits page + admin MRR/paid-users move by the expected amounts; tamper test (`plan=enterprise`, bad cycle → 400, no mutation); unauth POST → 401; (Moyasar variant) a declined/unpaid test card → error, no activation; AR/RTL; no console errors. **AC:** documented PASS/FAIL with severities; Critical/Major ⇒ back to owning dev then re-verify.

**[code-reviewer]**
- **PC-REV** Review the M1.5 diff: price/credits derived server-side (never trust client amount); (Moyasar) server verifies `paymentId` status+amount before activating — client "success" is never trusted; `companyId` scoping on every write; **no card/secret data persisted or logged**; secret key server-only (not in client bundle); credit mutation uses the atomic ledger helper; Zod validation; `callbackUrl` open-redirect guard (`/`-prefixed). **AC:** APPROVE / APPROVE-WITH-NITS / REQUEST-CHANGES with specifics.

### 16.5 YOUR DECISION NEEDED — M1.5 (defaults chosen; confirm or override)
- **9. Enterprise/Custom stays "Contact Sales"** (lead form), NOT purchasable. **Recommend: yes.**
- **10. Downgrade / cancel / proration OUT of scope** — checkout simply activates the selected plan and overwrites the current subscription; no credit proration. **Recommend: yes (out of scope for the demo).**
- **11. Checkout = dedicated route `/app/checkout`** (deep-linkable for the auth callback, survives refresh, easier RTL/state) vs a modal. **Recommend: dedicated route.**
- **12. Logged-out "Subscribe" → `/login?callbackUrl=<checkout>`** (login already handles it) with `signup-form` extended to honor `callbackUrl` too. **Recommend: yes.**
- **13. `transactions.status` = `"paid"`** for demo purchases (distinguishes them from seeded `"demo"` rows; does not affect MRR, which is subscription-based). **Recommend: "paid".**
- **14. Payment variant: MOCK (default) vs MOYASAR TEST sandbox.** **Recommend: build the MOCK first (guaranteed, zero external dependency, always succeeds — the demo is safe), then wire Moyasar test ONLY as a stretch if M1 finishes with time to spare.** Both share the exact same server activation (§16.3 step 3–5); Moyasar only changes the "confirm payment" source (§16.3 step 2) + adds PC-BE3. Moyasar test makes the demo more credible (a real Saudi gateway, SADAD/mada test cards) but adds live-network + verification failure modes that can break a stage demo, so it must never be the only path.

### 16.6 Acceptance criteria (explicit, verifiable)
- **PC-AC1:** On `/pricing`, Basic/Growth/Pro show localized "Subscribe"; Custom shows "Contact Sales". Logged-out Subscribe lands on auth and returns to `/app/checkout` with the same plan+cycle; logged-in goes straight to checkout.
- **PC-AC2:** Checkout shows the selected plan name, cycle, correct price (matches the `/pricing` figure for that cycle), and included monthly AI credits — in EN and AR with correct RTL.
- **PC-AC3:** Completing payment (mock always-succeeds, or a Moyasar TEST card) shows a brief processing state and reaches a success state. No real charge; card data never reaches our server/DB/logs.
- **PC-AC4:** After purchase: `subscriptions` row = (selected plan, selected cycle, `status="active"`); a `transactions` row exists (`kind="subscription"`, `amountSar`=charged price, `status="paid"`); `ai_credits` wallet `balance` & `allowance` = plan `creditsPerMonth`, with one `creditTransactions` ledger entry.
- **PC-AC5:** `/app/credits` shows the new balance/allowance; `/admin` shows paid-users +1 and MRR increased by the plan's monthly price.
- **PC-AC6:** Invalid/tampered input (`plan=enterprise` or unknown, bad cycle) → 400 with no row mutated; unauthenticated POST → 401. (Moyasar variant) an unpaid/amount-mismatched `paymentId` → 402/400 with no activation.
- **PC-AC7:** Price and credits are computed server-side from pricing config — never taken from the request body; (Moyasar) activation happens only after server-side verification, never on client-reported success.

### 16.7 Moyasar TEST sandbox — notes (only if decision 14 = Moyasar)
- **Test mode only.** Keys supplied are `pk_test_…` / `sk_test_…` — sandbox, no real money. No production keys, no `LIVE` mode, no real payouts in this demo.
- **Env vars (into `.env.local`, already gitignored; add names to `.env.example`):** `NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY` (client-safe, `pk_test_…`), `MOYASAR_SECRET_KEY` (server-only, `sk_test_…`), `MOYASAR_API_BASE=https://api.moyasar.com/v1`, `MOYASAR_WEBHOOK_SECRET` (empty — webhooks not used; we verify by GET-polling the payment id, which is enough for a demo).
- **Flow:** client Moyasar form (publishable key) → `payment.id` → `POST /api/checkout` with `paymentId` → server `verifyMoyasarPayment` (secret key, Basic auth) asserts `status="paid"` + amount/currency → activate. **No webhook** for the demo. `// ponytail: poll-verify on submit; add webhook + idempotency for production (M2).`
- **SECURITY — action for the human:** the `sk_test_…` secret was pasted into chat. Test secrets are low-risk, but treat it as compromised-in-history: keep it out of the repo (env only) and **rotate it in the Moyasar dashboard** before any real use. Never expose the secret key client-side; only the `pk_test_` publishable key goes to the browser.

---

NEXT ACTION: Implement `POST /api/checkout` + `activatePlanCredits` helper (PC-BE1, PC-BE2) with the MOCK payment path → backend-developer. Defaults 9–13 are safe to start now; wire Moyasar test (PC-BE3) only if decision 14 = Moyasar and M1 lands with time to spare.

YOUR DECISION NEEDED: Confirm §16.5 items 9–14 — the five checkout defaults, plus item 14: MOCK-only (recommended baseline) or MOCK-first-then-Moyasar-test-if-time. Silence = we proceed on the MOCK baseline. Also: put the Moyasar keys in `.env.local` (not chat/repo) and rotate the `sk_test_` secret since it was pasted here.
