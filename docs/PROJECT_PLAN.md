# NABDA AI — PROJECT PLAN (Authoritative Delivery Plan)

> Single source of truth. Owner: project-manager. Last updated: 2026-09-26.
> Status legend: NOT STARTED / IN PROGRESS / DEV-DONE (self-tested) / QA-PASS / APPROVED (code-review) / BLOCKED.
> No task is DONE until: developer self-test → qa-engineer PASS → code-reviewer APPROVE. No gate is ever waived.

---

## 0. READ THIS FIRST (Blockers & hard truths — bad news first)

1. **"Deployed to Vercel tomorrow" cannot mean the full spec.** The client spec is a 24-module, 22-screen, 10-revenue-stream platform with an admin panel, multi-provider AI routing, and real multi-format file ingestion. That is a multi-week build. In one day we can ship **one thing well**: a polished, deployed, clickable **investor demo of the core flow, on the seeded "Nabda Retail Demo" dataset, with LIVE AI on the 3 steps that matter (analysis, chat, report)** and everything else present as convincing, navigable UI. That is what an investor needs to answer the 5 success questions. Anything more is a coin flip on the deadline.
2. **Pricing is contradictory across the client's own docs.** We have a recommended default (see §9) so we are not blocked, but the human must confirm 4 pricing decisions before the pricing page is "true." Until then the demo shows our recommended defaults, seeded and admin-editable.
3. **We need AI provider API key(s) from the human today.** No key = no live AI = the demo falls back to pre-baked results (still demoable, but weaker). This is the #1 external dependency.
4. **This plan assumes we DO NOT build real payment processing tomorrow.** Upgrade/Buy-Credits/checkout are demo flows (no real money moves). Real billing is Phase 2. Flagged so no one expects a live Stripe on day one.

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
Real payment processing / invoices; real multi-format ingestion & cleaning (PDF/xlsx parsing pipeline — tomorrow accepts upload but analyzes the seeded dataset); genuine multi-tenant data isolation hardening & audit logs (basic auth + row-scoping only); true multi-provider live routing logic (surface the concept; route to one configured provider); team accounts / RBAC beyond user-vs-admin; notifications system; digital products storefront & checkout; real consultant/training scheduling & payments; API access; mobile app; real forecasting models (LLM-generated forecast narrative only); comparison/share of reports; annual billing cycles logic beyond price display.

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

### M2 — Phase 2 (client Doc B §32)  → after demo
Real file ingestion (Excel/CSV/PDF parse + clean), real payments/billing, notifications, advanced dashboards, team accounts + RBAC, advanced/comparison reports, tenant-isolation hardening + audit logs, digital products storefront, real service scheduling.

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
| — | Notifications (§31) | M2 | |
| — | Digital Products storefront (§24) | M2 | link/placeholder in M1 |
| — | Real payments/invoices (§42) | M2 | |
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

> Per team rules, I will not choose the stack, spend money, or deploy without your go on 5–8. Building of keyless/fallback pieces (M0 scaffolding, schema, design spec) can start immediately in parallel.

---

## 15. PLAIN-LANGUAGE SUMMARY (for the non-technical owner)

We cannot honestly build the entire Nabda AI platform in one day — it is genuinely a multi-week product. What we CAN deliver tomorrow, and what an investor actually needs, is a **real, deployed, clickable demo of the whole story**: a visitor signs up, sets up their company, loads the sample "Nabda Retail Demo" business, watches the AI analyze it, sees a professional dashboard with a Business Health Score, risks, opportunities and recommendations, chats with the AI analyst, downloads a PDF report, generates a presentation, watches their credits go down, sees the pricing plans, and requests consultation/training/integration/enterprise services — plus an admin screen where you can change prices and credits live. It will be bilingual Arabic/English and look like a premium business-intelligence platform, not a chatbot.

To hit tomorrow, three things stay simple on purpose: it runs on the sample dataset (not your real files yet), it does not take real payments yet, and the "enterprise-grade security" story is real in direction but basic in depth for now. All of that is Phase 2. The AI is genuinely live on the parts that matter (analysis, chat, report) as long as you give us one AI key today; if not, it still runs on convincing pre-prepared results.

I need eight decisions from you now (above) — mostly the pricing you want the investor to see, an OK on the tools, an AI key, and whether the demo link is private or public. Once I have those, the team builds tonight and we deploy tomorrow.

---

NEXT ACTION: Answer the 8 items in §14 (esp. AI key + scope + stack) → project-manager, then kick off M0-T1 → devops-engineer and M0-T4 → ui-ux-engineer in parallel.

YOUR DECISION NEEDED: All 8 items in §14 — the 4 pricing decisions, stack sign-off, which AI provider key you can supply today, approval of the tomorrow scope cutline, and private-vs-public deploy.
