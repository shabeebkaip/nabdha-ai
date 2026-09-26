import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { analyses, companies, insights, reports } from "@/db/schema";
import { requireCompanySession } from "@/lib/session";
import { apiError, errorToResponse } from "@/lib/api-response";
import { healthBandFor } from "@/lib/health-score";
import { toInsightDto } from "@/lib/mappers";
import { getAiEngine } from "@/lib/ai";
import { getLocale } from "@/lib/get-locale";
import { chargeAction, getCreditCost } from "@/lib/credits";
import { getDatasetById, getReportsSummaries } from "@/lib/queries";
import { datasetLabel } from "@/lib/dataset-display";
import type { DashboardData, Report } from "@/lib/ai/types";

export const runtime = "nodejs";

const createReportSchema = z.object({ analysisId: z.uuid() });

export async function POST(req: Request) {
  try {
    const { companyId } = await requireCompanySession();
    const body = await req.json().catch(() => null);
    const parsed = createReportSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(400, "VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as never);
    }

    const [analysis] = await db
      .select()
      .from(analyses)
      .where(and(eq(analyses.id, parsed.data.analysisId), eq(analyses.companyId, companyId)));
    if (!analysis) return apiError(404, "NOT_FOUND", "Analysis not found.");

    const [company, dataset, insightRows] = await Promise.all([
      db.select().from(companies).where(eq(companies.id, companyId)).then((r) => r[0]),
      getDatasetById(companyId, analysis.datasetId),
      db.select().from(insights).where(eq(insights.analysisId, analysis.id)),
    ]);

    const dashboard: DashboardData = {
      kpis: analysis.kpis,
      healthScore: {
        overall: analysis.healthScore,
        factors: analysis.factors,
        band: healthBandFor(analysis.healthScore),
      },
      forecast: analysis.forecast,
      insights: insightRows.map(toInsightDto),
    };

    const cost = (await getCreditCost("comprehensiveReport")) ?? 0;
    const locale = await getLocale();
    // Deduct, then draft + persist. Auto-refunded if either step throws —
    // never charge for a report that didn't get saved.
    const { result: dto, balance } = await chargeAction(
      { companyId, walletType: "ai_credits", cost, reason: "comprehensiveReport", refId: analysis.id },
      async () => {
        const engine = getAiEngine();
        const sections = await engine.draftReportSections(dashboard, company!.name, locale);
        // Title by SOURCE name, not company name — two reports from two
        // different uploads must read as different reports in the list, not
        // both "Nabda Retail Demo — Business Report".
        const sourceName = dataset ? datasetLabel(dataset, locale) : company!.name;
        const title = `${sourceName} — Business Report`;

        const [report] = await db
          .insert(reports)
          .values({ companyId, analysisId: analysis.id, title, sections, creditsCharged: cost })
          .returning();

        const created: Report = {
          id: report!.id,
          title: report!.title,
          sections: report!.sections,
          createdAt: report!.createdAt.toISOString(),
          datasetId: analysis.datasetId,
        };
        return created;
      }
    );

    return NextResponse.json({ ...dto, creditsCharged: cost, creditsRemaining: balance }, { status: 201 });
  } catch (err) {
    return errorToResponse("reports:POST", err);
  }
}

export async function GET(req: Request) {
  try {
    const { companyId } = await requireCompanySession();
    const datasetId = new URL(req.url).searchParams.get("datasetId") ?? undefined;
    const dtos = await getReportsSummaries(companyId, datasetId);
    return NextResponse.json(dtos);
  } catch (err) {
    return errorToResponse("reports:GET", err);
  }
}
