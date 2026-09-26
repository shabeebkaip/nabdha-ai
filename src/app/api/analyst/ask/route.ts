import { z } from "zod";
import { NextResponse } from "next/server";
import { requireCompanySession } from "@/lib/session";
import { apiError, errorToResponse } from "@/lib/api-response";
import { getAiEngine } from "@/lib/ai";
import { getLocale } from "@/lib/get-locale";
import { getCompanyById, getDashboardData } from "@/lib/queries";

export const runtime = "nodejs";

// datasetId is optional — omitted (or "all") scopes the analyst to the
// company's aggregated dashboard, same as before; passed, it scopes to that
// one source's own analysis (per-source Ask AI tab + the global Ask AI
// picker both use this). getDashboardData already filters by companyId, so
// a datasetId from another tenant just yields NO_ANALYSIS below — no leak.
const askSchema = z.object({ question: z.string().min(1).max(500), datasetId: z.uuid().optional() });

export async function POST(req: Request) {
  try {
    const { companyId } = await requireCompanySession();
    const body = await req.json().catch(() => null);
    const parsed = askSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(400, "VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as never);
    }

    const company = await getCompanyById(companyId);
    const dashboard = await getDashboardData(companyId, parsed.data.datasetId);
    if (!company || !dashboard) {
      return apiError(404, "NO_ANALYSIS", "Run an analysis first so the AI Analyst has context.");
    }

    const engine = getAiEngine();
    const answer = await engine.askAnalyst(parsed.data.question, {
      companyName: company.name,
      industry: company.industry ?? "unknown",
      datasetSummary: {},
      locale: await getLocale(),
      dashboard,
    });

    return NextResponse.json(answer);
  } catch (err) {
    return errorToResponse("analyst/ask:POST", err);
  }
}
