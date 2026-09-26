import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { datasets, companies, analyses, insights } from "@/db/schema";
import { requireCompanySession } from "@/lib/session";
import { apiError, errorToResponse } from "@/lib/api-response";
import { getAiEngine } from "@/lib/ai";
import { getLocale } from "@/lib/get-locale";
import { chargeAction, getCreditCost } from "@/lib/credits";
import { toInsightDto } from "@/lib/mappers";
import type { DashboardData } from "@/lib/ai/types";

export const runtime = "nodejs";

const runSchema = z.object({ datasetId: z.uuid() });

export async function POST(req: Request) {
  try {
    const { companyId } = await requireCompanySession();
    const body = await req.json().catch(() => null);
    const parsed = runSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(400, "VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as never);
    }

    const [dataset] = await db
      .select()
      .from(datasets)
      .where(and(eq(datasets.id, parsed.data.datasetId), eq(datasets.companyId, companyId)));
    if (!dataset) return apiError(404, "NOT_FOUND", "Dataset not found.");

    const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
    if (!company) return apiError(404, "NOT_FOUND", "Company not found.");

    const cost = (await getCreditCost("standardAnalysis")) ?? 0;
    const locale = await getLocale();
    // Deduct, then run the engine + persist. If anything after the
    // deduction throws, chargeAction refunds it — a user is never charged
    // for an analysis that didn't actually get saved.
    const { result, balance } = await chargeAction(
      { companyId, walletType: "ai_credits", cost, reason: "standardAnalysis", refId: dataset.id },
      async () => {
        const engine = getAiEngine();
        const analysisResult = await engine.runAnalysis({
          companyName: company.name,
          industry: company.industry ?? "unknown",
          datasetSummary: dataset.rowSummary ?? {},
          locale,
        });

        const [analysis] = await db
          .insert(analyses)
          .values({
            companyId,
            datasetId: dataset.id,
            healthScore: analysisResult.healthScore.overall,
            factors: analysisResult.healthScore.factors,
            kpis: analysisResult.kpis,
            forecast: analysisResult.forecast,
            modelUsed: analysisResult.modelUsed,
            creditsCharged: cost,
          })
          .returning();

        await db.update(datasets).set({ status: "analyzed" }).where(eq(datasets.id, dataset.id));

        const insertedInsights = await db
          .insert(insights)
          .values(analysisResult.insights.map((i) => ({ ...i, companyId, analysisId: analysis!.id })))
          .returning();

        const dashboard: DashboardData = {
          kpis: analysisResult.kpis,
          healthScore: analysisResult.healthScore,
          forecast: analysisResult.forecast,
          insights: insertedInsights.map(toInsightDto),
        };
        return { dashboard, analysisId: analysis!.id };
      }
    );

    return NextResponse.json({
      ...result.dashboard,
      analysisId: result.analysisId,
      creditsCharged: cost,
      creditsRemaining: balance,
    });
  } catch (err) {
    return errorToResponse("analysis/run:POST", err);
  }
}
