import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCompanySession } from "@/lib/session";
import { apiError, errorToResponse } from "@/lib/api-response";
import { getReportById } from "@/lib/queries";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { companyId } = await requireCompanySession();
    const { id } = await ctx.params;
    if (!z.uuid().safeParse(id).success) return apiError(404, "NOT_FOUND", "Report not found.");

    const report = await getReportById(companyId, id);
    if (!report) return apiError(404, "NOT_FOUND", "Report not found.");
    return NextResponse.json(report);
  } catch (err) {
    return errorToResponse("reports/[id]:GET", err);
  }
}
