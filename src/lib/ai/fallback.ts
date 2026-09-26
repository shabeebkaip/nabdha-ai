// Deterministic, keyless implementation of AiEngine. This is what powers
// every endpoint today (client §33 numbers on the demo company). ai-engineer
// adds a live Claude implementation behind the same interface; getAiEngine()
// in ./index.ts decides which one runs.

import { computeHealthScore } from "@/lib/health-score";
import type { Locale } from "@/lib/i18n";
import { deriveScenario } from "./scenario";
import type {
  AiEngine,
  AnalysisContext,
  AnalysisResult,
  AnalystAnswer,
  DashboardData,
  ReportSection,
} from "./types";

const SUGGESTED_ANSWERS: Record<string, AnalystAnswer> = {
  "analyze my sales": {
    answer:
      "Sales grew 12.4% over the period, driven mainly by repeat purchases from your high-value customer segment.",
    reasons: [
      "Order frequency increased among top-tier customers.",
      "Category B outperformed its forecast.",
      "Category A softened due to competitor discounting.",
    ],
    actions: [
      "Double down on the offers that drove Category B growth.",
      "Review pricing in Category A against competitors.",
    ],
  },
  "find my biggest risk": {
    answer:
      "Your biggest risk right now is inventory concentration in low-performing products — it's tying up capital that could fund your growth categories.",
    reasons: [
      "A small set of SKUs holds a disproportionate share of inventory value.",
      "Reorder quantities weren't adjusted after demand shifted.",
    ],
    actions: [
      "Reallocate inventory budget toward higher-performing categories.",
      "Run a clearance promotion on aging stock to free up cash.",
    ],
  },
  "what should i focus on": {
    answer:
      "Focus on reallocating inventory away from low-performing products and toward your highest-value customer segment — it addresses your top risk and top opportunity at once.",
    reasons: [
      "Inventory concentration risk and high-value-customer opportunity are your two strongest signals this period.",
      "Acting on both simultaneously compounds the effect on margin and revenue.",
    ],
    actions: [
      "Reallocate inventory toward higher-performing categories.",
      "Launch targeted offers for high-value customers.",
    ],
  },
  "predict next month's sales": {
    answer: "Expected revenue next period is approximately SAR 1,393,760, continuing the current growth trend.",
    reasons: [
      "Revenue has grown for 4 consecutive months.",
      "Demand in top categories is expected to keep rising.",
    ],
    actions: ["Maintain current marketing spend and monitor category mix monthly."],
  },
  "find growth opportunities": {
    answer:
      "Your clearest growth opportunities are your high-value customer segment's rising purchase frequency and the room to scale Category B.",
    reasons: [
      "High-value customers increased order frequency in the last 2 months.",
      "Category B is outperforming forecast with organic demand ahead of marketing spend.",
    ],
    actions: [
      "Create targeted offers for high-value customers.",
      "Increase inventory and marketing allocation for Category B.",
    ],
  },
};

function normalize(q: string): string {
  return q.trim().toLowerCase().replace(/[?.!]+$/g, "");
}

export const fallbackAiEngine: AiEngine = {
  async runAnalysis(ctx: AnalysisContext): Promise<AnalysisResult> {
    // No real file parsing yet (Phase 2) — deriveScenario reads fileName
    // keywords + a stable hash so different uploads produce different,
    // deterministic results instead of everything showing the same 78/100
    // (the seeded demo dataset, which has no fileName, stays pinned exactly
    // to the client §33 / AC2 numbers — see scenario.ts).
    const scenario = deriveScenario(ctx.datasetSummary);
    return {
      healthScore: computeHealthScore(scenario.factors),
      kpis: scenario.kpis,
      forecast: scenario.forecast,
      insights: scenario.insights,
      modelUsed: "nabda-fallback-v1",
    };
  },

  async askAnalyst(question: string): Promise<AnalystAnswer> {
    const key = normalize(question);
    if (SUGGESTED_ANSWERS[key]) return SUGGESTED_ANSWERS[key];
    // loose match for near-variants of the suggested questions
    const match = Object.keys(SUGGESTED_ANSWERS).find(
      (k) => key.includes(k) || k.includes(key)
    );
    if (match) return SUGGESTED_ANSWERS[match]!;
    return {
      answer:
        "Based on your current dashboard, the most notable signal is the inventory concentration risk paired with rising high-value-customer demand.",
      reasons: [
        "These are the two highest-severity signals in your latest analysis.",
        "Ask about sales, risks, growth opportunities, or next month's forecast for a more specific answer.",
      ],
      actions: ["Open the Insights tab to review all current risks and opportunities."],
    };
  },

  // ponytail: locale accepted for interface parity but unused — deterministic
  // fallback text isn't localized (acceptable per coordinator sign-off: live
  // engine is the path that must localize; fallback only serves as a
  // last-resort demo-safety net).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async draftReportSections(dashboard: DashboardData, companyName: string, _locale?: Locale): Promise<ReportSection[]> {
    const risks = dashboard.insights.filter((i) => i.kind === "risk");
    const opportunities = dashboard.insights.filter((i) => i.kind === "opportunity");
    const trends = dashboard.insights.filter((i) => i.kind === "trend");
    const recommendations = dashboard.insights.filter((i) => i.kind === "recommendation");
    const list = (items: typeof risks) =>
      items.map((i) => `• ${i.title} — ${i.businessImpact}`).join("\n") || "No items to report.";

    return [
      {
        heading: "Executive Summary",
        body: `${companyName}'s Business Health Score is ${dashboard.healthScore.overall}/100 (${dashboard.healthScore.band}). Revenue reached SAR ${dashboard.kpis.revenue.toLocaleString()} with ${dashboard.kpis.revenueGrowthPct}% growth.`,
      },
      {
        heading: "Business Performance",
        body: `Customers: ${dashboard.kpis.customers}. Average order value: SAR ${dashboard.kpis.avgOrderValue}. Retention: ${dashboard.kpis.retentionPct}%.`,
      },
      {
        heading: "Revenue Analysis",
        body: `Revenue grew ${dashboard.kpis.revenueGrowthPct}% to SAR ${dashboard.kpis.revenue.toLocaleString()}.`,
        chartRef: "revenue_trend",
      },
      {
        heading: "Customer Analysis",
        body: `${dashboard.kpis.customers} active customers with ${dashboard.kpis.retentionPct}% retention.`,
        chartRef: "customer_trend",
      },
      { heading: "Product/Service Analysis", body: list(opportunities) },
      { heading: "Risk Analysis", body: list(risks) },
      { heading: "Opportunity Analysis", body: list(opportunities) },
      { heading: "Trend Analysis", body: list(trends) },
      {
        heading: "Forecast",
        body: `Expected revenue next period: SAR ${dashboard.forecast.expectedRevenue.toLocaleString()}. ${dashboard.forecast.expectedDemand} ${dashboard.forecast.potentialRisk}`,
      },
      { heading: "AI Recommendations", body: list(recommendations) },
      {
        heading: "Priority Actions",
        body: recommendations.map((r) => `• ${r.recommendedAction}`).join("\n") || "No priority actions.",
      },
    ];
  },
};
