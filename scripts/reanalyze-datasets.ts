// One-off maintenance: re-analyze every existing dataset with the new
// per-dataset scenario engine (src/lib/ai/scenario.ts), so stale rows created
// before the fix (all 78/100) get their correct distinct numbers. Inserts a
// fresh analysis per dataset — getLatestAnalysis picks the newest, so old rows
// are harmless. No credit charge (maintenance). Run:
//   npx tsx scripts/reanalyze-datasets.ts
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { db } = await import("@/db");
  const { datasets, companies, analyses, insights } = await import("@/db/schema");
  const { getAiEngine } = await import("@/lib/ai");
  const { eq } = await import("drizzle-orm");

  const rows = await db.select().from(datasets);
  if (rows.length === 0) {
    console.log("No datasets to re-analyze.");
    process.exit(0);
  }
  const engine = getAiEngine();

  for (const d of rows) {
    const [company] = await db.select().from(companies).where(eq(companies.id, d.companyId));
    if (!company) continue;

    const result = await engine.runAnalysis({
      companyName: company.name,
      industry: company.industry ?? "unknown",
      datasetSummary: d.rowSummary ?? {},
      locale: "en",
    });

    const [analysis] = await db
      .insert(analyses)
      .values({
        companyId: d.companyId,
        datasetId: d.id,
        healthScore: result.healthScore.overall,
        factors: result.healthScore.factors,
        kpis: result.kpis,
        forecast: result.forecast,
        modelUsed: result.modelUsed,
        creditsCharged: 0,
      })
      .returning();

    await db.insert(insights).values(
      result.insights.map((i) => ({ ...i, companyId: d.companyId, analysisId: analysis!.id }))
    );
    await db.update(datasets).set({ status: "analyzed" }).where(eq(datasets.id, d.id));

    const label = (d.rowSummary as { fileName?: string } | null)?.fileName ?? d.sourceType;
    console.log(
      `re-analyzed ${label.padEnd(34)} health=${result.healthScore.overall} growth=${result.kpis.revenueGrowthPct}% revenue=${result.kpis.revenue} via=${result.modelUsed}`
    );
  }

  console.log(`\nDone. Re-analyzed ${rows.length} dataset(s).`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
