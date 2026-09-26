// Nabda AI — pricing config.
//
// Single source of truth for plan numbers (price/credits), read by both the
// landing pricing preview and the /pricing page. Locale-agnostic on purpose:
// copy (names/taglines/feature labels) lives in `i18n.ts` instead, because
// this module's shape is exactly what an admin-config-backed API would
// return — numbers and flags, never display strings.
//
// TODO: source from admin_config API (M1 backend, see docs/PROJECT_PLAN.md
// M1-T12 / docs/DESIGN_SPEC.md §4 Flow D). Values below are the FINAL demo
// numbers from docs/DECISIONS.md — do not re-derive from the older,
// superseded figures in docs/CLIENT_REQUIREMENTS.md §12/§51.

export const ANNUAL_DISCOUNT = 0.2;

export type PlanId = "basic" | "growth" | "pro";

export interface PricingPlan {
  id: PlanId;
  monthlyPrice: number;
  /** Per year, already discounted — matches docs/DECISIONS.md exactly
   * (monthly * 12 * 0.8, pre-rounded to the client's own figures). */
  annualPrice: number;
  creditsPerMonth: number;
  recommended: boolean;
}

export const plans: PricingPlan[] = [
  {
    id: "basic",
    monthlyPrice: 49,
    annualPrice: 471,
    creditsPerMonth: 1_000,
    recommended: false,
  },
  {
    id: "growth",
    monthlyPrice: 149,
    annualPrice: 1_430,
    creditsPerMonth: 4_000,
    recommended: true,
  },
  {
    id: "pro",
    monthlyPrice: 399,
    annualPrice: 3_830,
    creditsPerMonth: 12_000,
    recommended: false,
  },
];

export function getPlan(id: PlanId): PricingPlan {
  const plan = plans.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan id: ${id}`);
  return plan;
}

// AI Presentations (PPT Slides) — a SEPARATE product/wallet from AI Credits,
// priced by slides. Monthly prices match the credit tiers by design; annual is
// monthly * 12 * (1 - ANNUAL_DISCOUNT), with `annualRegular` = monthly * 12
// shown struck-through. Numbers per docs/DECISIONS.md + client confirmation.
export interface PptPlan {
  id: PlanId;
  monthlyPrice: number;
  /** Per year, already discounted (monthly * 12 * 0.8). */
  annualPrice: number;
  /** Per year before the 20% discount (monthly * 12), shown struck-through. */
  annualRegular: number;
  slidesPerMonth: number;
  slidesPerYear: number;
  recommended: boolean;
}

export const pptPlans: PptPlan[] = [
  { id: "basic", monthlyPrice: 49, annualPrice: 470, annualRegular: 588, slidesPerMonth: 80, slidesPerYear: 960, recommended: false },
  { id: "growth", monthlyPrice: 149, annualPrice: 1_430, annualRegular: 1_788, slidesPerMonth: 300, slidesPerYear: 3_600, recommended: true },
  { id: "pro", monthlyPrice: 399, annualPrice: 3_830, annualRegular: 4_788, slidesPerMonth: 900, slidesPerYear: 10_800, recommended: false },
];

/** CLIENT_REQUIREMENTS.md §51 plan comparison table, structure reused
 * verbatim; price/usage rows are represented by `PricingPlan` above, this
 * covers the feature rows only. */
export type FeatureKey =
  | "dashboard"
  | "insights"
  | "riskDetection"
  | "opportunityDetection"
  | "standardReports"
  | "advancedAnalytics"
  | "forecasting"
  | "advancedAI"
  | "customIntegration"
  | "customAI"
  | "enterpriseSupport";

export const featureKeys: FeatureKey[] = [
  "dashboard",
  "insights",
  "riskDetection",
  "opportunityDetection",
  "standardReports",
  "advancedAnalytics",
  "forecasting",
  "advancedAI",
  "customIntegration",
  "customAI",
  "enterpriseSupport",
];

export type FeatureValue = true | false | "optional";
export type ComparisonPlanId = PlanId | "custom";

export const comparison: Record<FeatureKey, Record<ComparisonPlanId, FeatureValue>> = {
  dashboard: { basic: true, growth: true, pro: true, custom: true },
  insights: { basic: true, growth: true, pro: true, custom: true },
  riskDetection: { basic: true, growth: true, pro: true, custom: true },
  opportunityDetection: { basic: true, growth: true, pro: true, custom: true },
  standardReports: { basic: true, growth: true, pro: true, custom: true },
  advancedAnalytics: { basic: false, growth: true, pro: true, custom: true },
  forecasting: { basic: false, growth: true, pro: true, custom: true },
  advancedAI: { basic: false, growth: false, pro: true, custom: true },
  customIntegration: { basic: false, growth: false, pro: "optional", custom: true },
  customAI: { basic: false, growth: false, pro: "optional", custom: true },
  enterpriseSupport: { basic: false, growth: false, pro: false, custom: true },
};
