import { z } from "zod";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminConfig } from "@/db/schema";
import { requireAdminSession } from "@/lib/session";
import { apiError, errorToResponse } from "@/lib/api-response";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdminSession();
    const rows = await db.select().from(adminConfig);
    return NextResponse.json(
      rows.map((r) => ({ key: r.key, category: r.category, value: r.value, updatedAt: r.updatedAt.toISOString() }))
    );
  } catch (err) {
    return errorToResponse("admin/config:GET", err);
  }
}

const patchSchema = z.object({
  key: z.string().min(1).max(200),
  value: z.unknown(),
});

export async function PATCH(req: Request) {
  try {
    await requireAdminSession();
    const body = await req.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(400, "VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as never);
    }

    const [existing] = await db.select().from(adminConfig).where(eq(adminConfig.key, parsed.data.key));
    if (!existing) return apiError(404, "NOT_FOUND", "Unknown config key.");

    const [updated] = await db
      .update(adminConfig)
      .set({ value: parsed.data.value, updatedAt: new Date() })
      .where(eq(adminConfig.key, parsed.data.key))
      .returning();

    return NextResponse.json({
      key: updated!.key,
      category: updated!.category,
      value: updated!.value,
      updatedAt: updated!.updatedAt.toISOString(),
    });
  } catch (err) {
    return errorToResponse("admin/config:PATCH", err);
  }
}
