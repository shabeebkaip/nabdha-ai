// Live Nabda AI Intelligence Engine — implements AiEngine against Claude via
// @ai-sdk/anthropic. Every method validates its output against a Zod schema
// (AI SDK v7 `generateText` + `output: Output.object({ schema })`) and falls
// back to the deterministic engine (fallback.ts) on any model/timeout/parse
// failure, so the product never breaks with a bad/absent key or a flaky call
// (guardrail from docs/API_CONTRACT.md).
//
// M1 has no financial line-item ingestion pipeline yet (PROJECT_PLAN §3) —
// every dataset's rowSummary is just row counts (see demo-data.ts
// DEMO_ROW_SUMMARY), never actual sales/revenue figures. Numeric KPIs and
// health-score factors are therefore computed deterministically, the exact
// same single source of truth fallback.ts and the DB seed already use
// (demo-data.ts + health-score.ts) — there is nothing for a model to
// legitimately "derive" them from yet, and having it guess would be the
// hallucinated-numbers failure mode this task explicitly forbids. What's
// genuinely live-AI here, and what the model is asked to do, is the
// qualitative layer: insights, forecast narrative, analyst answers, and
// report prose — all reasoning over those real numbers.
//
// Approx cost per op (list prices, low temperature keeps output tight):
//   runAnalysis        (claude-sonnet-5):        ~500 in / ~700 out tok  ~= $0.012/call
//   draftReportSections(claude-sonnet-5):        ~600 in / ~900 out tok  ~= $0.015/call
//   askAnalyst         (claude-haiku-4-5):       ~500 in / ~200 out tok  ~= $0.001/call
// i.e. per 1,000 requests (mixed): roughly $10-15, dominated by report/analysis calls.

import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";
import { z } from "zod";
import { computeHealthScore } from "@/lib/health-score";
import { fallbackAiEngine } from "./fallback";
import { deriveScenario } from "./scenario";
import { buildAnalysisInstructions, buildAnalysisPrompt } from "./prompts/analysis";
import { buildAnalystInstructions, buildAnalystPrompt } from "./prompts/analyst";
import { buildReportInstructions, buildReportPrompt } from "./prompts/report";
import type { Locale } from "@/lib/i18n";
import type {
  AiEngine,
  AnalysisContext,
  AnalysisResult,
  AnalystAnswer,
  DashboardData,
  HealthFactorKey,
  ReportSection,
} from "./types";

const ANALYSIS_MODEL = "claude-sonnet-5";
const REPORT_MODEL = "claude-sonnet-5";
const ANALYST_MODEL = "claude-haiku-4-5-20251001"; // cheaper/faster for chat-turn latency

const TIMEOUT_MS = 45_000;
const TEMPERATURE = 0.3; // low — stable, demo-safe output across repeated runs

export function hasLiveAnthropicKey(): boolean {
  const key = process.env.ANTHROPIC_API_KEY;
  return !!key && key.startsWith("sk-ant-") && key !== "sk-ant-replace-me";
}

function logEngine(op: string, path: "live" | "fallback", extra?: Record<string, unknown>) {
  // ponytail: console logging matches the project's existing "structured
  // log" pattern at this scale (see src/lib/api-response.ts).
  if (path === "fallback") console.error(`[ai-engine] ${op} -> fallback`, extra ?? "");
  else console.log(`[ai-engine] ${op} -> live`, extra ?? "");
}

// Code-review check: callers only ever pass `String(err)` as the `error`
// field above. `String()` on an Error/AI-SDK error (AISDKError has no custom
// toString) uses the default `Error.prototype.toString` = "<Name>: <message>"
// — it does NOT serialize extra properties like APICallError's
// `requestBodyValues`/`responseHeaders`/`responseBody`. The Anthropic API
// key is sent as the outgoing `x-api-key` request header, which never
// appears in the response headers Anthropic sends back, so it cannot reach
// this log line either way. No secret/key can end up here.

const HEALTH_FACTOR_KEYS = [
  "revenue",
  "customers",
  "inventory",
  "finance",
  "operations",
  "growth",
] as const satisfies readonly HealthFactorKey[];

const insightSchema = z.object({
  kind: z.enum(["risk", "opportunity", "trend", "recommendation"]),
  severity: z.enum(["low", "medium", "high"]),
  title: z.string().min(3).max(120),
  whatHappened: z.string().min(10).max(400),
  why: z.string().min(10).max(400),
  businessImpact: z.string().min(10).max(400),
  recommendedAction: z.string().min(10).max(400),
  factorTag: z.enum(HEALTH_FACTOR_KEYS).optional(),
});

const analysisOutputSchema = z.object({
  insights: z.array(insightSchema).min(6).max(9),
  forecast: z.object({
    expectedDemand: z.string().min(10).max(400),
    potentialRisk: z.string().min(10).max(400),
  }),
});

const analystOutputSchema = z.object({
  answer: z.string().min(5).max(600),
  reasons: z.array(z.string().min(3).max(200)).min(1).max(4),
  actions: z.array(z.string().min(3).max(200)).min(1).max(4),
});

const reportOutputSchema = z.object({
  executiveSummary: z.string().min(20).max(800),
  businessPerformance: z.string().min(20).max(800),
  revenueAnalysis: z.string().min(20).max(800),
  customerAnalysis: z.string().min(20).max(800),
  productServiceAnalysis: z.string().min(20).max(800),
  riskAnalysis: z.string().min(20).max(800),
  opportunityAnalysis: z.string().min(20).max(800),
  trendAnalysis: z.string().min(20).max(800),
  forecast: z.string().min(20).max(800),
  aiRecommendations: z.string().min(20).max(800),
  priorityActions: z.string().min(20).max(800),
});

export const claudeAiEngine: AiEngine = {
  async runAnalysis(ctx: AnalysisContext): Promise<AnalysisResult> {
    // Numeric ground truth: deterministic, derived per-dataset from
    // fileName + a stable hash (see scenario.ts) — same source fallback.ts
    // uses, so weak/strong/steady datasets never collide on the same
    // 78/100. The seeded demo dataset (no fileName) stays pinned exactly.
    const scenario = deriveScenario(ctx.datasetSummary);
    const healthScore = computeHealthScore(scenario.factors);
    const kpis = scenario.kpis;

    try {
      const { output } = await generateText({
        model: anthropic(ANALYSIS_MODEL),
        instructions: buildAnalysisInstructions(ctx.locale),
        prompt: buildAnalysisPrompt(ctx, kpis, healthScore, scenario.tone),
        output: Output.object({ schema: analysisOutputSchema }),
        temperature: TEMPERATURE,
        // Measured live: 6-9 insights + forecast needs ~2000-2100 output
        // tokens in English; Arabic prose observed to run closer to the
        // ceiling (saw one real AI_NoObjectGeneratedError at 4096 -> silent
        // fallback, exactly the guardrail working, but avoidable). 6144
        // leaves real headroom in both languages.
        maxOutputTokens: 6144,
        maxRetries: 2,
        abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      });

      logEngine("runAnalysis", "live", { tone: scenario.tone, insights: output.insights.length });
      return {
        healthScore,
        kpis,
        forecast: {
          // Deterministic derivation from the real (scenario) KPIs, not
          // model output.
          expectedRevenue: Math.round(kpis.revenue * (1 + kpis.revenueGrowthPct / 100)),
          expectedDemand: output.forecast.expectedDemand,
          potentialRisk: output.forecast.potentialRisk,
        },
        insights: output.insights,
        modelUsed: ANALYSIS_MODEL,
      };
    } catch (err) {
      logEngine("runAnalysis", "fallback", { error: String(err) });
      return fallbackAiEngine.runAnalysis(ctx);
    }
  },

  async askAnalyst(
    question: string,
    ctx: AnalysisContext & { dashboard: DashboardData }
  ): Promise<AnalystAnswer> {
    try {
      const { output } = await generateText({
        model: anthropic(ANALYST_MODEL),
        instructions: buildAnalystInstructions(ctx.locale),
        prompt: buildAnalystPrompt(ctx, question),
        output: Output.object({ schema: analystOutputSchema }),
        temperature: TEMPERATURE,
        maxOutputTokens: 600,
        maxRetries: 2,
        abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      });
      logEngine("askAnalyst", "live");
      return output;
    } catch (err) {
      logEngine("askAnalyst", "fallback", { error: String(err) });
      return fallbackAiEngine.askAnalyst(question, ctx);
    }
  },

  async draftReportSections(
    dashboard: DashboardData,
    companyName: string,
    locale: Locale
  ): Promise<ReportSection[]> {
    try {
      const { output } = await generateText({
        model: anthropic(REPORT_MODEL),
        instructions: buildReportInstructions(locale),
        prompt: buildReportPrompt(dashboard, companyName),
        output: Output.object({ schema: reportOutputSchema }),
        temperature: TEMPERATURE,
        maxOutputTokens: 4000, // same Arabic-headroom reasoning as runAnalysis above
        maxRetries: 2,
        abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      });
      logEngine("draftReportSections", "live");
      // Headings/order/chartRef are fixed here (client §9's 11 sections),
      // never model-controlled — guarantees contract shape every time.
      return [
        { heading: "Executive Summary", body: output.executiveSummary },
        { heading: "Business Performance", body: output.businessPerformance },
        { heading: "Revenue Analysis", body: output.revenueAnalysis, chartRef: "revenue_trend" },
        { heading: "Customer Analysis", body: output.customerAnalysis, chartRef: "customer_trend" },
        { heading: "Product/Service Analysis", body: output.productServiceAnalysis },
        { heading: "Risk Analysis", body: output.riskAnalysis },
        { heading: "Opportunity Analysis", body: output.opportunityAnalysis },
        { heading: "Trend Analysis", body: output.trendAnalysis },
        { heading: "Forecast", body: output.forecast },
        { heading: "AI Recommendations", body: output.aiRecommendations },
        { heading: "Priority Actions", body: output.priorityActions },
      ];
    } catch (err) {
      logEngine("draftReportSections", "fallback", { error: String(err) });
      return fallbackAiEngine.draftReportSections(dashboard, companyName, locale);
    }
  },
};
