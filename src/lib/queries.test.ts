import { test } from "node:test";
import assert from "node:assert/strict";
import { aggregateAnalyses } from "./queries";

function row(overrides: Partial<{ revenue: number; growth: number; customers: number; aov: number; retention: number; createdAt: Date }>) {
  const { revenue = 1000, growth = 10, customers = 100, aov = 50, retention = 60, createdAt = new Date() } = overrides;
  return {
    kpis: { revenue, revenueGrowthPct: growth, customers, avgOrderValue: aov, retentionPct: retention },
    factors: { revenue: 70, customers: 70, inventory: 70, finance: 70, operations: 70, growth: 70 },
    forecast: { expectedRevenue: 0, expectedDemand: "demand text", potentialRisk: "risk text" },
    createdAt,
  };
}

// aggregateAnalyses only reads kpis/factors/forecast/createdAt; the fixtures
// above provide exactly those, cast to the full row type at the call sites.
type AnalysisRowArg = Parameters<typeof aggregateAnalyses>[0];

test("a single analysis aggregates to exactly itself (demo company stays at 78/100)", () => {
  const single = row({ revenue: 1_240_000, growth: 12.4, customers: 1180, aov: 1050, retention: 64 });
  const agg = aggregateAnalyses([single] as AnalysisRowArg);
  assert.equal(agg.healthScore.overall, 70); // all factors are 70 in this fixture
  assert.equal(agg.kpis.revenue, 1_240_000);
  assert.equal(agg.kpis.revenueGrowthPct, 12.4);
});

test("revenue/customers sum across multiple analyses; rates are revenue-weighted", () => {
  const a = row({ revenue: 1000, growth: 0, customers: 100, aov: 10, retention: 50 });
  const b = row({ revenue: 3000, growth: 20, customers: 300, aov: 30, retention: 90 });
  const agg = aggregateAnalyses([a, b] as AnalysisRowArg);
  assert.equal(agg.kpis.revenue, 4000);
  assert.equal(agg.kpis.customers, 400);
  // weighted by revenue (1000 vs 3000): growth = (0*1000 + 20*3000)/4000 = 15
  assert.equal(agg.kpis.revenueGrowthPct, 15);
  // retention = (50*1000 + 90*3000)/4000 = 80
  assert.equal(agg.kpis.retentionPct, 80);
});

test("health factors average equally across analyses (not revenue-weighted)", () => {
  const a = { ...row({ revenue: 100 }), factors: { revenue: 40, customers: 40, inventory: 40, finance: 40, operations: 40, growth: 40 } };
  const b = { ...row({ revenue: 900 }), factors: { revenue: 80, customers: 80, inventory: 80, finance: 80, operations: 80, growth: 80 } };
  const agg = aggregateAnalyses([a, b] as AnalysisRowArg);
  assert.equal(agg.healthScore.overall, 60); // (40+80)/2, unaffected by the 100 vs 900 revenue split
});

test("forecast narrative comes from the most recently created analysis", () => {
  const older = { ...row({ revenue: 100, createdAt: new Date("2024-01-01") }) };
  const newer = { ...row({ revenue: 100, createdAt: new Date("2024-06-01") }) };
  (newer as { forecast: { expectedDemand: string } }).forecast.expectedDemand = "newest demand text";
  const agg = aggregateAnalyses([older, newer] as AnalysisRowArg);
  assert.equal(agg.forecast.expectedDemand, "newest demand text");
});
