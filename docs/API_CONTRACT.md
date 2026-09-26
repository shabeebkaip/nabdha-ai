# Nabda AI — API Contract (M1)

> Owner: backend-developer. Frozen for M1 — ai-engineer and frontend-developer build against this. Changing a shape here requires updating every consumer.
> Shared TS types live at `src/lib/ai/types.ts` (import path `@/lib/ai/types`) — this doc mirrors them; the code is the source of truth if they ever drift.

## Conventions

- All routes are Next.js App Router route handlers, Node runtime.
- All request bodies are JSON, validated with Zod at the boundary. Invalid input → `400`.
- Auth: session-cookie based (Auth.js v5, JWT strategy). Protected routes require a valid session → `401` if missing/invalid.
- Every business-data route scopes by the caller's `companyId` (from the session) — a resource belonging to another company → `404` (not `403`, to avoid confirming existence of other tenants' resources) unless noted.
- Admin routes additionally require `session.user.role === "admin"` → `403` otherwise.
- Error shape (never leaks stack traces or internals):
  ```ts
  type ApiError = { error: { code: string; message: string; fields?: Record<string, string> } };
  ```
- Status codes: `200`/`201` success, `400` validation, `401` unauthenticated, `403` unauthorized, `404` not found, `409` conflict (duplicate email, insufficient credits), `500` generic server error.

## Shared JSON types (`src/lib/ai/types.ts`)

```ts
type InsightKind = "risk" | "opportunity" | "trend" | "recommendation";
type Severity = "low" | "medium" | "high";
type HealthFactorKey = "revenue" | "customers" | "inventory" | "finance" | "operations" | "growth";
type HealthBand = "poor" | "fair" | "good" | "strong";

interface Insight {
  id: string;
  kind: InsightKind;
  severity: Severity;
  title: string;
  whatHappened: string;
  why: string;
  businessImpact: string;
  recommendedAction: string;
  factorTag?: HealthFactorKey;
}

interface BusinessHealthScore {
  overall: number; // 0-100
  factors: Record<HealthFactorKey, number>; // each 0-100
  band: HealthBand;
}

interface DashboardKpis {
  revenue: number;
  revenueGrowthPct: number;
  customers: number;
  avgOrderValue: number;
  retentionPct: number;
}

interface Forecast {
  expectedRevenue: number;
  expectedDemand: string;   // narrative, LLM-generated (or fallback canned text)
  potentialRisk: string;    // narrative
}

interface DashboardData {
  kpis: DashboardKpis;
  healthScore: BusinessHealthScore;
  insights: Insight[];
  forecast: Forecast;
}

interface AnalystAnswer {
  answer: string;
  reasons: string[];
  actions: string[];
}

interface ReportSection { heading: string; body: string; chartRef?: string }
interface Report { id: string; title: string; sections: ReportSection[]; createdAt: string }
```

### `AiEngine` interface (ai-engineer implements against live Claude)

```ts
interface AnalysisContext {
  companyName: string;
  industry: string;
  datasetSummary: Record<string, unknown>;
}
interface AnalysisResult {
  healthScore: BusinessHealthScore;
  kpis: DashboardKpis;
  forecast: Forecast;
  insights: Omit<Insight, "id">[];
  modelUsed: string; // internal/descriptive only, never shown to end users
}
interface AiEngine {
  runAnalysis(ctx: AnalysisContext): Promise<AnalysisResult>;
  askAnalyst(question: string, ctx: AnalysisContext & { dashboard: DashboardData }): Promise<AnalystAnswer>;
  draftReportSections(dashboard: DashboardData, companyName: string): Promise<ReportSection[]>;
}
```

`src/lib/ai/index.ts` exports `getAiEngine(): AiEngine`. Today it always returns `src/lib/ai/fallback.ts` (deterministic, matches client §33 numbers on the seeded demo company). ai-engineer adds a live implementation and switches `getAiEngine()` to prefer it when `ANTHROPIC_API_KEY` is set, falling back automatically on error — the route handlers below never change.

`CreditAction = "standardAnalysis" | "advancedAnalysis" | "comprehensiveReport" | "advancedReport" | "presentationPerSlide" | "customModeling"` — mirrors `admin_config['credits.costTable']`.

---

## Endpoints

### `POST /api/auth/register`
Auth: none. (Rate limiting deferred to Phase 2 per explicit human scope call — out of scope for the investor demo.)
Request:
```ts
{ name: string; email: string; password: string /* min 8 */; companyName: string; industry: string; companySize: string }
```
Response `201`:
```ts
{ user: { id: string; name: string; email: string; role: "user" } }
```
`409` if email already registered. Creates user + company + trial subscription + two credit wallets (`ai_credits`, `slides`) seeded with trial allowances. Client then calls Auth.js `signIn("credentials", { email, password })`.

### `POST /api/auth/[...nextauth]` / `GET /api/auth/[...nextauth]`
Auth.js v5 handlers (signin/signout/session/csrf). Standard Auth.js contract, credentials provider only for M1.

### `GET /api/companies/me`
Auth: session. Response `200`: the caller's company row (onboarding fields). `404` if user has no company (shouldn't happen post-register).

### `PATCH /api/companies/me`
Auth: session. Request: partial onboarding fields —
```ts
{ name?, industry?, size?, employees?, branches?, country?, businessModel?, objective?, dataSources?: string[], onboardingCompleted?: boolean }
```
Response `200`: updated company row.

### `POST /api/datasets`
Auth: session. Request:
```ts
{ sourceType: "demo" | "excel" | "csv" | "pdf" | "manual"; fileName?: string; fileBlobUrl?: string }
```
Response `201`: `{ id, sourceType, status: "uploaded", createdAt }`.
Blob upload is structurally stubbed: if `fileBlobUrl` is provided it's stored as-is (frontend uploads to Vercel Blob client-side and passes the URL); if `BLOB_READ_WRITE_TOKEN` is absent this route still works (it only records metadata, never calls Blob itself).

### `POST /api/analysis/run`
Auth: session. Request: `{ datasetId: string }`.
Response `200`: `DashboardData` (see above) plus `{ analysisId: string, creditsCharged: number, creditsRemaining: number }`.
`404` if dataset not found/not owned. `409` (`INSUFFICIENT_CREDITS`) if the `ai_credits` wallet balance is below the `standardAnalysis` cost. Runs `getAiEngine().runAnalysis(...)`, persists `analyses` + `insights` rows, deducts credits atomically.

### `GET /api/dashboard`
Auth: session. Response `200`: `DashboardData` from the company's latest analysis. `404` (`NO_ANALYSIS`) if none exists yet.

### `POST /api/analyst/ask`
Auth: session. Request: `{ question: string }` (1-500 chars). Response `200`: `AnalystAnswer`. No credit charge. `404` (`NO_ANALYSIS`) if the company has no dashboard data yet (chat needs context).

### `POST /api/reports`
Auth: session. Request: `{ analysisId: string }`. Response `201`: `Report` plus `{ creditsCharged, creditsRemaining }`. `409` (`INSUFFICIENT_CREDITS`) if `ai_credits` balance < `comprehensiveReport` cost. `404` if analysis not found/not owned.

### `GET /api/reports`
Auth: session. Response `200`: `Report[]` (summaries) for the caller's company, newest first.

### `GET /api/reports/[id]`
Auth: session. Response `200`: `Report`. `404` if not found or not owned by the caller's company.

### `GET /api/credits`
Auth: session. Response `200`:
```ts
{
  wallets: { walletType: "ai_credits" | "slides"; balance: number; allowance: number; resetDate: string }[];
  usage: { id: string; delta: number; reason: string; createdAt: string }[]; // most recent 20
}
```

### `GET /api/admin/config`
Auth: session + role=admin. Response `200`: `{ key: string; category: string; value: unknown; updatedAt: string }[]`.

### `PATCH /api/admin/config`
Auth: session + role=admin. Request: `{ key: string; value: unknown }`. Response `200`: the updated row. Upserts by key. This is the literal mechanism behind "prices/credits are admin-editable, never hard-coded" (client §52).

### `POST /api/leads`
Auth: none. (Rate limiting deferred to Phase 2 — see note above.) Request (Zod discriminated union on `kind`):
```ts
{ kind: "consultation"; topic: string; durationMinutes: number; preferredTime?: string; contactName: string; contactEmail: string }
| { kind: "training"; category: string; format: string; participants?: number; contactName: string; contactEmail: string }
| { kind: "integration"; systemName: string; currentSoftware?: string; dataSource?: string; apiAvailable?: boolean; businessObjective: string; contactName: string; contactEmail: string }
| { kind: "enterprise"; companyName: string; industry: string; companySize: string; requirement: string; expectedUsers?: number; contactName: string; contactEmail: string }
```
Response `201`: `{ id: string; status: "new" }`. If the request carries a valid session, `companyId` is attached automatically; anonymous leads (e.g. from the public marketing site) are allowed with `companyId: null`.

---

## What's live vs stubbed today (M1, this task)

- **Live**: all endpoints above, backed by real Postgres (Neon) reads/writes, real credit deduction, real auth.
- **Fallback, not live AI**: `runAnalysis` / `askAnalyst` / `draftReportSections` use the deterministic pre-baked engine (`src/lib/ai/fallback.ts`). Swapping in live Claude is ai-engineer's task behind the same `AiEngine` interface — no route handler changes required.
- **Structurally stubbed**: Vercel Blob upload — `/api/datasets` accepts a `fileBlobUrl` if the frontend already uploaded one, but this backend does not itself call the Blob API (no `BLOB_READ_WRITE_TOKEN` handling beyond passthrough).
- **Not built in this task** (per PROJECT_PLAN M1 scope but outside this task's explicit endpoint list): presentations, report PDF rendering, notifications.
