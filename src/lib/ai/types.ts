// Nabda AI — shared JSON contract types + the AiEngine interface.
//
// This file is the stable contract between backend-developer, ai-engineer,
// and frontend-developer. Do not rename exported members without updating
// docs/API_CONTRACT.md and every consumer.
//
// ai-engineer implements `AiEngine` against a live provider (Claude) in a
// new file (e.g. src/lib/ai/live.ts) and wires it into `getAiEngine()` in
// src/lib/ai/index.ts. `src/lib/ai/fallback.ts` is the deterministic
// pre-baked implementation backend-developer ships so every endpoint works
// today without an API key.

import type { Locale } from "@/lib/i18n";

export type InsightKind = "risk" | "opportunity" | "trend" | "recommendation";
export type Severity = "low" | "medium" | "high";
export type HealthFactorKey =
  | "revenue"
  | "customers"
  | "inventory"
  | "finance"
  | "operations"
  | "growth";
export type HealthBand = "poor" | "fair" | "good" | "strong";

export interface Insight {
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

export interface BusinessHealthScore {
  overall: number; // 0-100
  factors: Record<HealthFactorKey, number>; // each 0-100
  band: HealthBand;
}

export interface DashboardKpis {
  revenue: number;
  revenueGrowthPct: number;
  customers: number;
  avgOrderValue: number;
  retentionPct: number;
}

export interface Forecast {
  expectedRevenue: number;
  expectedDemand: string;
  potentialRisk: string;
}

export interface DashboardData {
  kpis: DashboardKpis;
  healthScore: BusinessHealthScore;
  insights: Insight[];
  forecast: Forecast;
}

export interface AnalystAnswer {
  answer: string;
  reasons: string[];
  actions: string[];
}

export interface ReportSection {
  heading: string;
  body: string;
  chartRef?: string;
}

export interface Report {
  id: string;
  title: string;
  sections: ReportSection[];
  createdAt: string;
  /** The data source this report was generated from — lets the UI link back
   * to that source's detail page and pre-scope "Generate Presentation". */
  datasetId: string;
}

// --- AiEngine: the interface ai-engineer implements against a live provider ---

export interface AnalysisContext {
  companyName: string;
  industry: string;
  /** Free-form summary of the dataset being analyzed (row counts, date range, etc). */
  datasetSummary: Record<string, unknown>;
  /** UI locale the caller is viewing in (see src/lib/i18n.ts) — live engine
   * responds in this language; numbers/currency stay LTR either way. */
  locale: Locale;
}

export interface AnalysisResult {
  healthScore: BusinessHealthScore;
  kpis: DashboardKpis;
  forecast: Forecast;
  insights: Omit<Insight, "id">[];
  /** Descriptive label only — never shown to end users (client §18). */
  modelUsed: string;
}

export interface AiEngine {
  runAnalysis(ctx: AnalysisContext): Promise<AnalysisResult>;
  askAnalyst(
    question: string,
    ctx: AnalysisContext & { dashboard: DashboardData }
  ): Promise<AnalystAnswer>;
  draftReportSections(dashboard: DashboardData, companyName: string, locale: Locale): Promise<ReportSection[]>;
}

// --- Credit engine action keys — mirrors admin_config['credits.costTable'] ---

export type CreditAction =
  | "standardAnalysis"
  | "advancedAnalysis"
  | "comprehensiveReport"
  | "advancedReport"
  | "presentationPerSlide"
  | "customModeling";
