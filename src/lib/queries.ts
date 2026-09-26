// Nabda AI — shared server-side read queries. Server Components fetch data
// directly through these (idiomatic App Router pattern, no HTTP round-trip
// to our own API), and the route handlers that already existed re-use the
// same functions instead of duplicating the drizzle queries — one place to
// fix if the shape ever changes.
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { analyses, companies, datasets, insights, reports } from "@/db/schema";
import { computeHealthScore, healthBandFor } from "@/lib/health-score";
import { toInsightDto } from "@/lib/mappers";
import type { DashboardData, DashboardKpis, HealthFactorKey, Report } from "@/lib/ai/types";

const HEALTH_FACTOR_KEYS: readonly HealthFactorKey[] = [
  "revenue",
  "customers",
  "inventory",
  "finance",
  "operations",
  "growth",
];

type AnalysisRow = typeof analyses.$inferSelect;

/** Combines every analysis a company has into one "where the business
 * stands overall" view, instead of just its single most recent upload.
 * - revenue/customers: summed across all analyzed sources (total business
 *   volume analyzed so far).
 * - growth/AOV/retention: revenue-weighted average (a source with more
 *   revenue behind it says more about "where you stand" than a small one).
 * - health factors: simple average across sources — these are already
 *   normalized 0-100 scores, not dollar amounts, so revenue-weighting them
 *   would just bias toward whichever upload had the biggest sales figure.
 * - forecast narrative: taken from the most recent analysis (no new AI call
 *   for an aggregate view — that would add real latency/cost to a plain
 *   dashboard load for text that's already directionally accurate).
 * A single analysis aggregates to exactly itself, so this is a no-op for
 * the seeded demo company (still exactly 78/100 — AC2 unaffected). */
export function aggregateAnalyses(rows: AnalysisRow[]): Pick<DashboardData, "kpis" | "healthScore" | "forecast"> {
  const totalRevenue = rows.reduce((s, r) => s + r.kpis.revenue, 0);
  const weighted = (pick: (k: DashboardKpis) => number) =>
    totalRevenue > 0
      ? rows.reduce((s, r) => s + pick(r.kpis) * r.kpis.revenue, 0) / totalRevenue
      : rows.reduce((s, r) => s + pick(r.kpis), 0) / rows.length; // all-zero revenue: fall back to a plain average

  const kpis: DashboardKpis = {
    revenue: totalRevenue,
    customers: rows.reduce((s, r) => s + r.kpis.customers, 0),
    revenueGrowthPct: Math.round(weighted((k) => k.revenueGrowthPct) * 10) / 10,
    avgOrderValue: Math.round(weighted((k) => k.avgOrderValue)),
    retentionPct: Math.round(weighted((k) => k.retentionPct)),
  };

  const factors = {} as Record<HealthFactorKey, number>;
  for (const key of HEALTH_FACTOR_KEYS) {
    factors[key] = Math.round(rows.reduce((s, r) => s + r.factors[key], 0) / rows.length);
  }

  const mostRecent = rows.reduce((a, b) => (b.createdAt > a.createdAt ? b : a));
  return {
    kpis,
    healthScore: computeHealthScore(factors),
    forecast: {
      expectedRevenue: Math.round(kpis.revenue * (1 + kpis.revenueGrowthPct / 100)),
      expectedDemand: mostRecent.forecast.expectedDemand,
      potentialRisk: mostRecent.forecast.potentialRisk,
    },
  };
}

export async function getCompanyById(companyId: string) {
  const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
  return company ?? null;
}

export async function getLatestAnalysis(companyId: string, datasetId?: string) {
  const [analysis] = await db
    .select()
    .from(analyses)
    .where(
      datasetId
        ? and(eq(analyses.companyId, companyId), eq(analyses.datasetId, datasetId))
        : eq(analyses.companyId, companyId)
    )
    .orderBy(desc(analyses.createdAt))
    .limit(1);
  return analysis ?? null;
}

export interface DatasetListItem {
  id: string;
  sourceType: string;
  fileName: string | null;
  status: string;
  rowSummary: Record<string, unknown> | null;
  createdAt: Date;
  healthScore: number | null;
}

/** All data sources a company has connected/uploaded, newest first, each with
 * the health score of its analysis (if analyzed) — so My Data can show that
 * uploads are saved and link straight to their results. Tenant-scoped. */
export async function listDatasets(companyId: string): Promise<DatasetListItem[]> {
  const rows = await db
    .select()
    .from(datasets)
    .where(eq(datasets.companyId, companyId))
    .orderBy(desc(datasets.createdAt));

  const analysisRows = await db
    .select({ datasetId: analyses.datasetId, healthScore: analyses.healthScore, createdAt: analyses.createdAt })
    .from(analyses)
    .where(eq(analyses.companyId, companyId))
    .orderBy(desc(analyses.createdAt));

  const scoreByDataset = new Map<string, number>();
  for (const a of analysisRows) {
    if (!scoreByDataset.has(a.datasetId)) scoreByDataset.set(a.datasetId, a.healthScore);
  }

  return rows.map((d) => ({
    id: d.id,
    sourceType: d.sourceType,
    fileName: (d.rowSummary?.fileName as string | undefined) ?? null,
    status: d.status,
    rowSummary: d.rowSummary ?? null,
    createdAt: d.createdAt,
    healthScore: scoreByDataset.get(d.id) ?? null,
  }));
}

/** Single data source's own metadata (fileName/sourceType/status/createdAt +
 * its health score if analyzed) — the persistent header on
 * /app/data/[id]. Tenant-scoped: returns null if the id doesn't belong to
 * this company (404s the page, never leaks another tenant's dataset). */
export async function getDatasetById(companyId: string, id: string): Promise<DatasetListItem | null> {
  const [d] = await db
    .select()
    .from(datasets)
    .where(and(eq(datasets.id, id), eq(datasets.companyId, companyId)));
  if (!d) return null;

  const [analysis] = await db
    .select({ healthScore: analyses.healthScore })
    .from(analyses)
    .where(eq(analyses.datasetId, id))
    .orderBy(desc(analyses.createdAt))
    .limit(1);

  return {
    id: d.id,
    sourceType: d.sourceType,
    fileName: (d.rowSummary?.fileName as string | undefined) ?? null,
    status: d.status,
    rowSummary: d.rowSummary ?? null,
    createdAt: d.createdAt,
    healthScore: analysis?.healthScore ?? null,
  };
}

export async function getDashboardData(companyId: string, datasetId?: string): Promise<DashboardData | null> {
  // datasetId → that one source's own analysis (opened from My Data "View
  // results" — a per-dataset drill-in, deliberately NOT aggregated).
  if (datasetId) {
    const analysis = await getLatestAnalysis(companyId, datasetId);
    if (!analysis) return null;
    const insightRows = await db.select().from(insights).where(eq(insights.analysisId, analysis.id));
    return {
      kpis: analysis.kpis,
      healthScore: {
        overall: analysis.healthScore,
        factors: analysis.factors,
        band: healthBandFor(analysis.healthScore),
      },
      forecast: analysis.forecast,
      insights: insightRows.map(toInsightDto),
    };
  }

  // No dataset requested (the main Dashboard) — "where you stand overall":
  // combine every analyzed data source, not just the latest upload.
  const allAnalyses = await db.select().from(analyses).where(eq(analyses.companyId, companyId));
  if (allAnalyses.length === 0) return null;

  const { kpis, healthScore, forecast } = aggregateAnalyses(allAnalyses);
  const insightRows = await db
    .select()
    .from(insights)
    .where(inArray(insights.analysisId, allAnalyses.map((a) => a.id)));

  return { kpis, healthScore, forecast, insights: insightRows.map(toInsightDto) };
}

export async function getReportById(companyId: string, id: string): Promise<Report | null> {
  const [row] = await db
    .select({
      id: reports.id,
      title: reports.title,
      sections: reports.sections,
      createdAt: reports.createdAt,
      datasetId: analyses.datasetId,
    })
    .from(reports)
    .innerJoin(analyses, eq(analyses.id, reports.analysisId))
    .where(and(eq(reports.id, id), eq(reports.companyId, companyId)));
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    sections: row.sections,
    createdAt: row.createdAt.toISOString(),
    datasetId: row.datasetId,
  };
}

/** `datasetId` scopes to reports generated from that one source's analyses
 * (joins through `analyses.datasetId` — `reports` itself only stores
 * `analysisId`) — used by the per-source Reports tab so a source only ever
 * shows its own reports, never another source's. */
export async function getReportsSummaries(companyId: string, datasetId?: string): Promise<Report[]> {
  const rows = await db
    .select({
      id: reports.id,
      title: reports.title,
      sections: reports.sections,
      createdAt: reports.createdAt,
      datasetId: analyses.datasetId,
    })
    .from(reports)
    .innerJoin(analyses, eq(analyses.id, reports.analysisId))
    .where(
      datasetId
        ? and(eq(reports.companyId, companyId), eq(analyses.datasetId, datasetId))
        : eq(reports.companyId, companyId)
    )
    .orderBy(desc(reports.createdAt));
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    sections: r.sections,
    createdAt: r.createdAt.toISOString(),
    datasetId: r.datasetId,
  }));
}
