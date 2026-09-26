import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveScenario } from "./scenario";
import { DEMO_KPIS } from "@/lib/demo-data";

test("filename keywords classify tone", () => {
  assert.equal(deriveScenario({ fileName: "02_declining_sales_trend.xlsx" }).tone, "weak");
  assert.equal(deriveScenario({ fileName: "01_healthy_growth_sme.xlsx" }).tone, "strong");
});

test("the seeded demo dataset (no fileName) stays pinned to the exact §33/AC2 numbers", () => {
  const demo = deriveScenario({ months: 12, orders: 340, products: 58, customers: 1200 });
  assert.equal(demo.tone, "steady");
  assert.equal(demo.kpis.revenue, DEMO_KPIS.revenue);
});

test("two plain-named (no keyword match) files differ from each other and from the pinned demo", () => {
  const plainName1 = deriveScenario({ fileName: "sales_export.xlsx" });
  const plainName2 = deriveScenario({ fileName: "Q3_data.csv" });
  assert.notEqual(plainName1.kpis.revenue, plainName2.kpis.revenue);
  assert.notEqual(plainName1.kpis.revenue, DEMO_KPIS.revenue);
});

test("real parsed metrics (same fileName) drive kpis/tone over the filename hash", () => {
  const realWeak = deriveScenario({ fileName: "customer_data.csv", revenue: 500_000, revenueGrowthPct: -12, customers: 300, orders: 900 });
  const realStrong = deriveScenario({ fileName: "customer_data.csv", revenue: 3_000_000, revenueGrowthPct: 40, customers: 2500, orders: 2600 });
  assert.equal(realWeak.kpis.revenue, 500_000);
  assert.equal(realStrong.kpis.revenue, 3_000_000);
  assert.equal(realWeak.tone, "weak");
  assert.equal(realStrong.tone, "strong");
  assert.ok(realWeak.factors.revenue < realStrong.factors.revenue);
});

test("deterministic for the same input", () => {
  const a = deriveScenario({ fileName: "sales_export.xlsx" });
  const b = deriveScenario({ fileName: "sales_export.xlsx" });
  assert.deepEqual(a, b);
});
