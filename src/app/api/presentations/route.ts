import { z } from "zod";
import { NextResponse } from "next/server";
import { requireCompanySession } from "@/lib/session";
import { apiError, errorToResponse } from "@/lib/api-response";
import { deductCredits, getCreditCost } from "@/lib/credits";

export const runtime = "nodejs";

// ponytail: not in docs/API_CONTRACT.md (presentations were explicitly out
// of scope for the backend task — "Not built in this task"). Added here
// because the frontend task requires *real* credit deduction reflected in
// the Slides wallet, and the credit engine (src/lib/credits.ts) already
// exists for exactly this. No `presentations` table exists yet, so the
// generated "presentation" is ephemeral (not persisted) — the credit
// deduction and ledger row are real; slide rendering itself is the
// documented demo stub (see DESIGN_SPEC §10 / task instructions).
const createPresentationSchema = z.object({
  topic: z.string().min(1).max(300),
  slideCount: z.number().int().min(1).max(40),
  style: z.string().min(1).max(100),
  audience: z.string().min(1).max(100),
  language: z.enum(["en", "ar"]),
});

export async function POST(req: Request) {
  try {
    const { companyId } = await requireCompanySession();
    const body = await req.json().catch(() => null);
    const parsed = createPresentationSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(400, "VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as never);
    }

    const perSlide = (await getCreditCost("presentationPerSlide")) ?? 1;
    const cost = perSlide * parsed.data.slideCount;
    const { balance } = await deductCredits({
      companyId,
      walletType: "slides",
      cost,
      reason: "presentationPerSlide",
    });

    return NextResponse.json({
      id: crypto.randomUUID(),
      ...parsed.data,
      creditsCharged: cost,
      creditsRemaining: balance,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    return errorToResponse("presentations:POST", err);
  }
}
