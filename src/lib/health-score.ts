// Business Health Score — deterministic formula (client §34: "an
// analytical indicator based on available data ... not an independent
// financial or audit judgment"). Simple average of the 6 factors keeps it
// stable/explainable for the demo; a weighted model is a documented M2/M3
// upgrade, not needed to satisfy AC2 (health score 78 on the seeded data).

import type { BusinessHealthScore, HealthFactorKey } from "@/lib/ai/types";

export function healthBandFor(overall: number): BusinessHealthScore["band"] {
  if (overall < 50) return "poor";
  if (overall < 70) return "fair";
  if (overall < 85) return "good";
  return "strong";
}

export function computeHealthScore(
  factors: Record<HealthFactorKey, number>
): BusinessHealthScore {
  const values = Object.values(factors);
  const overall = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
  return { overall, factors, band: healthBandFor(overall) };
}
