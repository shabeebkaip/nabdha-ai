// Shared DB-row -> API-shape mappers, used by both /api/analysis/run and
// /api/dashboard so the two don't drift.
import type { insights } from "@/db/schema";
import type { Insight } from "@/lib/ai/types";

type InsightRow = typeof insights.$inferSelect;

export function toInsightDto(row: InsightRow): Insight {
  return {
    id: row.id,
    kind: row.kind,
    severity: row.severity,
    title: row.title,
    whatHappened: row.whatHappened,
    why: row.why,
    businessImpact: row.businessImpact,
    recommendedAction: row.recommendedAction,
    factorTag: (row.factorTag ?? undefined) as Insight["factorTag"],
  };
}
