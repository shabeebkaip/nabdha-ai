// Nabda AI — single source of truth for the "Nabda Retail Demo" numbers
// (client requirements §33). src/db/seed.ts uses this to create the demo
// company's baked analysis; src/lib/ai/fallback.ts uses the same constants
// so `POST /api/analysis/run` returns identical numbers for any dataset
// until real AI/ingestion exists (per PROJECT_PLAN §3 M1 simplification).

import type { DashboardKpis, Forecast, HealthFactorKey, Insight } from "@/lib/ai/types";

// Simple average of the 6 factors — documented, deterministic formula
// (client §34: "analytical indicator ... not an independent financial or
// audit judgment"). Kept in health-score.ts as the reusable function; the
// factor values below are chosen to average to exactly 78.
export const DEMO_HEALTH_FACTORS: Record<HealthFactorKey, number> = {
  revenue: 84,
  customers: 76,
  inventory: 58, // deliberately the weak factor — matches the seeded inventory-concentration risk
  finance: 79,
  operations: 80,
  growth: 91,
};

export const DEMO_KPIS: DashboardKpis = {
  revenue: 1_240_000,
  revenueGrowthPct: 12.4,
  customers: 1180,
  avgOrderValue: 1050,
  retentionPct: 64,
};

export const DEMO_FORECAST: Forecast = {
  expectedRevenue: 1_393_760, // +12.4% projected forward one more period
  expectedDemand:
    "Demand is expected to keep rising in the top product categories while low-performing SKUs continue to drag on inventory turnover.",
  potentialRisk:
    "If inventory concentration in low-performing products isn't corrected, working capital gets tied up and margin erodes next quarter.",
};

export const DEMO_ROW_SUMMARY = {
  months: 12,
  orders: 340,
  products: 58,
  customers: 1200,
};

// 3 risks + 3 opportunities + 1 recommendation + 1 trend (AC2: >=3 each).
export const DEMO_INSIGHTS: Omit<Insight, "id">[] = [
  {
    kind: "risk",
    severity: "high",
    title: "Inventory concentration in low-performing products",
    whatHappened: "A small set of SKUs holds a disproportionate share of on-hand inventory value.",
    why: "Reorder quantities weren't adjusted after demand shifted toward newer product lines.",
    businessImpact: "Capital is tied up in slow-moving stock, reducing cash available for high-demand categories.",
    recommendedAction: "Reallocate inventory budget toward higher-performing product categories and discount aging stock.",
    factorTag: "inventory",
  },
  {
    kind: "risk",
    severity: "medium",
    title: "Declining sales in Product Category A",
    whatHappened: "Category A revenue trended down over the last 3 months relative to the prior quarter.",
    why: "Increased competitor discounting in the same category coincided with the decline.",
    businessImpact: "Continued decline could erase 4-6% of monthly revenue if unaddressed.",
    recommendedAction: "Run a targeted promotion on Category A and review pricing against competitors.",
    factorTag: "revenue",
  },
  {
    kind: "risk",
    severity: "medium",
    title: "Customer concentration risk",
    whatHappened: "A meaningful share of revenue comes from a small number of repeat customers.",
    why: "Growth has leaned on retention of existing high-value customers rather than new acquisition.",
    businessImpact: "Losing even a few top customers would materially affect monthly revenue.",
    recommendedAction: "Diversify acquisition channels and introduce a loyalty program to broaden the customer base.",
    factorTag: "customers",
  },
  {
    kind: "opportunity",
    severity: "high",
    title: "High-value customers increased purchasing frequency",
    whatHappened: "The top customer segment increased order frequency over the last 2 months.",
    why: "A recent product bundle resonated strongly with this segment.",
    businessImpact: "Targeted offers to this segment could lift monthly revenue meaningfully with low acquisition cost.",
    recommendedAction: "Create targeted offers and early access for the high-value customer segment.",
    factorTag: "customers",
  },
  {
    kind: "opportunity",
    severity: "medium",
    title: "Expandable product category (Category B)",
    whatHappened: "Category B is outperforming forecast with room to scale.",
    why: "Word-of-mouth and repeat purchases are driving organic demand ahead of marketing spend.",
    businessImpact: "Increasing allocation to Category B could compound existing organic growth.",
    recommendedAction: "Increase inventory allocation and marketing spend for Category B.",
    factorTag: "growth",
  },
  {
    kind: "opportunity",
    severity: "medium",
    title: "Untapped regional demand",
    whatHappened: "Order density is uneven across branches/regions, with some regions under-served.",
    why: "Marketing and stock allocation have concentrated on the highest-volume branch historically.",
    businessImpact: "Expanding presence in under-served regions is a low-risk path to incremental revenue.",
    recommendedAction: "Pilot a regional promotion in the under-served branch with the strongest demand signal.",
    factorTag: "operations",
  },
  {
    kind: "recommendation",
    severity: "high",
    title: "Reallocate inventory and target high-value customers",
    whatHappened: "Combining the inventory and customer-frequency findings points to one priority action.",
    why: "Freeing capital from slow-moving stock and reinvesting in the segment already buying more compounds the effect.",
    businessImpact: "Estimated to improve both margin and revenue growth simultaneously within one quarter.",
    recommendedAction:
      "Reallocate inventory toward higher-performing product categories while reducing stock exposure in low performers, and create targeted offers for the high-value customer segment.",
    factorTag: "operations",
  },
  {
    kind: "trend",
    severity: "low",
    title: "Revenue trend is upward",
    whatHappened: "Monthly revenue has grown for 4 consecutive months.",
    why: "Sustained demand in top categories combined with stable order volume from repeat customers.",
    businessImpact: "Confirms the current growth trajectory is durable, not a single-month spike.",
    recommendedAction: "Maintain current marketing spend levels and monitor category mix monthly.",
    factorTag: "revenue",
  },
];
