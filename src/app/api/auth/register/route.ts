import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, companies, subscriptions, creditWallets } from "@/db/schema";
import { apiError, logServerError } from "@/lib/api-response";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.email(),
  password: z.string().min(8).max(200),
  companyName: z.string().min(1).max(200),
  industry: z.string().min(1).max(100),
  companySize: z.string().min(1).max(100),
});

// Trial allowances — mirrors admin_config's philosophy (not the same table
// since a not-yet-onboarded trial isn't tied to a plan yet); Basic-ish
// amounts so the credit meter reads realistically during the demo.
const TRIAL_AI_CREDITS = 250;
const TRIAL_SLIDES = 80;

// ponytail: rate limiting deferred to Phase 2 (explicit human call — out of
// scope for tomorrow's investor demo). Auth checks, zod validation, and
// tenant isolation below are unaffected.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as never);
  }
  const { name, email, password, companyName, industry, companySize } = parsed.data;

  try {
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    if (existing) {
      return apiError(409, "EMAIL_TAKEN", "An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db
      .insert(users)
      .values({ name, email, passwordHash, role: "user" })
      .returning();

    const [company] = await db
      .insert(companies)
      .values({ ownerUserId: user!.id, name: companyName, industry, size: companySize })
      .returning();

    await db.insert(subscriptions).values({ companyId: company!.id, plan: "trial", status: "trial" });

    const resetDate = new Date();
    resetDate.setDate(resetDate.getDate() + 30);
    await db.insert(creditWallets).values([
      { companyId: company!.id, walletType: "ai_credits", balance: TRIAL_AI_CREDITS, allowance: TRIAL_AI_CREDITS, resetDate },
      { companyId: company!.id, walletType: "slides", balance: TRIAL_SLIDES, allowance: TRIAL_SLIDES, resetDate },
    ]);

    return NextResponse.json(
      { user: { id: user!.id, name: user!.name, email: user!.email, role: user!.role } },
      { status: 201 }
    );
  } catch (err) {
    logServerError("auth/register", err);
    return apiError(500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
  }
}
