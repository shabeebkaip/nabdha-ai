import { NextResponse } from "next/server";
import { requireCompanySession } from "@/lib/session";
import { apiError, errorToResponse } from "@/lib/api-response";
import { getDashboardData } from "@/lib/queries";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { companyId } = await requireCompanySession();
    const dashboard = await getDashboardData(companyId);
    if (!dashboard) return apiError(404, "NO_ANALYSIS", "No analysis yet — run an analysis first.");
    return NextResponse.json(dashboard);
  } catch (err) {
    return errorToResponse("dashboard:GET", err);
  }
}
