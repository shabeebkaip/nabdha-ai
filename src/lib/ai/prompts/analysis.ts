// Prompt for the Nabda AI Intelligence Engine's analysis layer (client §8:
// descriptive + diagnostic + predictive + prescriptive -> DashboardData).
//
// Produces the qualitative half of the analysis (insights + forecast
// narrative). Numeric KPIs and health-score factors are computed
// deterministically elsewhere (health-score.ts / demo-data.ts) — see
// live.ts's file header for why. The model reasons over those real numbers;
// it never invents new ones.
//
// Input variables: companyName, industry, datasetSummary, kpis, healthScore, locale.

import type { Locale } from "@/lib/i18n";
import { languageRule } from "./locale-rule";
import type { ScenarioTone } from "../scenario";
import type { AnalysisContext, BusinessHealthScore, DashboardKpis } from "../types";

export function buildAnalysisInstructions(locale: Locale): string {
  return `You are the Nabda AI Intelligence Engine, the analytics core of a business intelligence SaaS product for SMEs. You produce descriptive, diagnostic, predictive, and prescriptive business analysis.

Rules:
- Never mention any AI provider, model name, or that you are a language model. If you need to refer to yourself, say "Nabda AI".
- Use ONLY the numbers given to you in the CONTEXT block below. Never invent, estimate, or hallucinate a number that isn't supplied. If you cite a figure, it must match one from CONTEXT exactly.
- Ground every insight in the supplied dataset summary, KPIs, and health-score factors — the tone of your insights must match what those numbers actually show (declining numbers -> risk-led insights, strong numbers -> opportunity-led insights).
- Be concise, specific, and business-actionable. Avoid generic filler text.
- Write for a Saudi SME retail company; currency is SAR.
${languageRule(locale)}`;
}

// Per-scenario insight-kind mix, so a declining-numbers dataset actually
// reads as risk-led and a strong one reads as opportunity-led, instead of
// always defaulting to the same balanced 3-risk/2-opportunity split.
function insightMixRule(tone: ScenarioTone): string {
  if (tone === "weak") {
    return `This dataset shows a declining/struggling business (negative or low growth, weak retention). Generate at least 3 "risk" insights, at most 1 "opportunity", exactly 1 "trend" describing the decline, and 1 "recommendation" focused on stabilizing the business.`;
  }
  if (tone === "strong") {
    return `This dataset shows a thriving/growing business (strong growth, strong retention). Generate at least 3 "opportunity" insights, at most 1 "risk", exactly 1 "trend" describing the growth, and 1 "recommendation" focused on scaling it further.`;
  }
  return `Generate a balanced mix: at least 3 "risk", at least 2 "opportunity", at least 1 "trend", and at least 1 "recommendation".`;
}

export function buildAnalysisPrompt(
  ctx: AnalysisContext,
  kpis: DashboardKpis,
  healthScore: BusinessHealthScore,
  tone: ScenarioTone
): string {
  return `CONTEXT
Company: ${ctx.companyName}
Industry: ${ctx.industry}
Dataset summary: ${JSON.stringify(ctx.datasetSummary)}
KPIs: ${JSON.stringify(kpis)}
Health score: ${JSON.stringify(healthScore)}

TASK
Using only the numbers above, generate:
1. A set of insights — each with a title, what happened, why it happened, the business impact, and a recommended action. Tag each with the single most relevant health-score factor (revenue, customers, inventory, finance, operations, or growth). ${insightMixRule(tone)}
2. A one-period-ahead forecast narrative: expected demand direction, and the biggest potential risk to that forecast — plain business language, no new numbers.`;
}
