import { z } from "zod";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { apiError, errorToResponse } from "@/lib/api-response";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await requireSession();
    if (!session.user.companyId) return apiError(404, "NOT_FOUND", "No company found for this user.");
    const [company] = await db.select().from(companies).where(eq(companies.id, session.user.companyId));
    if (!company) return apiError(404, "NOT_FOUND", "No company found for this user.");
    return NextResponse.json(company);
  } catch (err) {
    return errorToResponse("companies/me:GET", err);
  }
}

const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  industry: z.string().min(1).max(100).optional(),
  size: z.string().min(1).max(100).optional(),
  employees: z.number().int().min(0).optional(),
  branches: z.number().int().min(0).optional(),
  country: z.string().min(1).max(100).optional(),
  businessModel: z.string().min(1).max(200).optional(),
  objective: z.string().min(1).max(500).optional(),
  dataSources: z.array(z.string()).optional(),
  onboardingCompleted: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    if (!session.user.companyId) return apiError(404, "NOT_FOUND", "No company found for this user.");

    const body = await req.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(400, "VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as never);
    }
    if (Object.keys(parsed.data).length === 0) {
      return apiError(400, "VALIDATION_ERROR", "No fields to update.");
    }

    const [updated] = await db
      .update(companies)
      .set(parsed.data)
      .where(eq(companies.id, session.user.companyId))
      .returning();
    return NextResponse.json(updated);
  } catch (err) {
    return errorToResponse("companies/me:PATCH", err);
  }
}
