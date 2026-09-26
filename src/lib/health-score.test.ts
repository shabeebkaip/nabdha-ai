import { test } from "node:test";
import assert from "node:assert/strict";
import { computeHealthScore, healthBandFor } from "./health-score";
import { DEMO_HEALTH_FACTORS } from "./demo-data";

test("demo factors average to exactly 78 (good band)", () => {
  const score = computeHealthScore(DEMO_HEALTH_FACTORS);
  assert.equal(score.overall, 78);
  assert.equal(score.band, "good");
});

test("band thresholds", () => {
  assert.equal(healthBandFor(0), "poor");
  assert.equal(healthBandFor(49), "poor");
  assert.equal(healthBandFor(50), "fair");
  assert.equal(healthBandFor(69), "fair");
  assert.equal(healthBandFor(70), "good");
  assert.equal(healthBandFor(84), "good");
  assert.equal(healthBandFor(85), "strong");
  assert.equal(healthBandFor(100), "strong");
});

test("computeHealthScore averages arbitrary factors and rounds", () => {
  const score = computeHealthScore({
    revenue: 100,
    customers: 0,
    inventory: 0,
    finance: 0,
    operations: 0,
    growth: 0,
  });
  assert.equal(score.overall, 17); // 100/6 = 16.67 -> rounds to 17
  assert.equal(score.band, "poor");
});
