import { z } from "zod";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { apiError, errorToResponse } from "@/lib/api-response";
import { auth } from "@/auth";

export const runtime = "nodejs";

const contact = { contactName: z.string().min(1).max(200), contactEmail: z.email() };

const leadSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("consultation"),
    topic: z.string().min(1).max(200),
    durationMinutes: z.number().int().min(15).max(480),
    preferredTime: z.string().max(200).optional(),
    ...contact,
  }),
  z.object({
    kind: z.literal("training"),
    category: z.string().min(1).max(200),
    format: z.string().min(1).max(100),
    participants: z.number().int().min(1).optional(),
    ...contact,
  }),
  z.object({
    kind: z.literal("integration"),
    systemName: z.string().min(1).max(200),
    currentSoftware: z.string().max(200).optional(),
    dataSource: z.string().max(200).optional(),
    apiAvailable: z.boolean().optional(),
    businessObjective: z.string().min(1).max(1000),
    ...contact,
  }),
  z.object({
    kind: z.literal("enterprise"),
    companyName: z.string().min(1).max(200),
    industry: z.string().min(1).max(100),
    companySize: z.string().min(1).max(100),
    requirement: z.string().min(1).max(1000),
    expectedUsers: z.number().int().min(1).optional(),
    ...contact,
  }),
]);

// ponytail: rate limiting deferred to Phase 2 (explicit human call — out of
// scope for tomorrow's investor demo). Auth checks, zod validation, and
// tenant isolation below are unaffected.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as never);
  }

  try {
    const session = await auth();
    const [lead] = await db
      .insert(leads)
      .values({
        companyId: session?.user?.companyId ?? null,
        kind: parsed.data.kind,
        payload: parsed.data,
      })
      .returning();

    return NextResponse.json({ id: lead!.id, status: lead!.status }, { status: 201 });
  } catch (err) {
    return errorToResponse("leads:POST", err);
  }
}
