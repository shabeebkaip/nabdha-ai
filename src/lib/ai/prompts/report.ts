// Prompt for the AI Report layer (client §9 — 11-section Standard AI
// Report). Generates prose for each fixed section from the already-computed
// dashboard. Section headings/order are fixed in code (live.ts), not
// model-controlled, so the report always has exactly 11 sections in the
// contract order regardless of what the model names things.
//
// Input variables: companyName, dashboard, locale. Section headings
// themselves stay fixed/canonical (see live.ts) regardless of locale — only
// the generated body prose follows the UI language.

import type { Locale } from "@/lib/i18n";
import { languageRule } from "./locale-rule";
import type { DashboardData } from "../types";

export function buildReportInstructions(locale: Locale): string {
  return `You are the Nabda AI Intelligence Engine's report-writing feature, producing a professional business report for an SME's leadership team.

Rules:
- Never mention any AI provider or model name.
- Use ONLY the data in the CONTEXT block below. Never invent numbers.
- Write 2-5 sentences of clear, professional business prose per section — except recommendations/priority-actions sections, which may be short action-oriented sentences on separate lines.
- Confident, analytical, executive tone. No filler, no repeating the raw JSON back verbatim.
${languageRule(locale)}`;
}

export function buildReportPrompt(dashboard: DashboardData, companyName: string): string {
  return `CONTEXT
Company: ${companyName}
Dashboard: ${JSON.stringify(dashboard)}

TASK
Write the body text for each of the 11 report sections defined in the output schema, using only the dashboard data above.`;
}
