import { z } from "zod";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions, transactions } from "@/db/schema";
import { requireCompanySession } from "@/lib/session";
import { apiError, errorToResponse } from "@/lib/api-response";
import { activatePlanCredits } from "@/lib/credits";
import { getLivePricingPlans } from "@/lib/pricing-live";

export const runtime = "nodejs";

// Mock checkout — hackathon demo, no payment gateway. The client sends ONLY
// { plan, cycle } (never card data); price and credits are resolved
// server-side from the live pricing config, so a tampered client can't buy a
// plan for the wrong amount or grant itself extra credits. "Payment" always
// succeeds after a short simulated delay.
const checkoutSchema = z.object({
  plan: z.enum(["basic", "growth", "pro"]),
  cycle: z.enum(["monthly", "annual"]),
});

export async function POST(req: Request) {
  try {
    const { companyId } = await requireCompanySession();
    const body = await req.json().catch(() => null);
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(400, "VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as never);
    }
    const { plan, cycle } = parsed.data;

    const plans = await getLivePricingPlans();
    const selected = plans.find((p) => p.id === plan);
    if (!selected) return apiError(400, "UNKNOWN_PLAN", "That plan can't be purchased.");

    const amountSar = cycle === "annual" ? selected.annualPrice : selected.monthlyPrice;
    const credits = selected.creditsPerMonth;

    // Simulate the payment processor round-trip so the UI's processing state
    // is real, not cosmetic.
    await new Promise((r) => setTimeout(r, 900));

    // One subscription row per company (seeded/registered as trial). Flip it to
    // the paid plan; admin MRR/paid-users read status="active".
    const updated = await db
      .update(subscriptions)
      .set({ plan, billingCycle: cycle, status: "active" })
      .where(eq(subscriptions.companyId, companyId))
      .returning({ id: subscriptions.id });
    if (updated.length === 0) {
      await db.insert(subscriptions).values({ companyId, plan, billingCycle: cycle, status: "active" });
    }

    const [txn] = await db
      .insert(transactions)
      .values({ companyId, kind: "subscription", amountSar: amountSar.toFixed(2), status: "paid" })
      .returning({ id: transactions.id });

    await activatePlanCredits({ companyId, credits, reason: "subscriptionActivate", refId: txn?.id });

    return NextResponse.json({ plan, cycle, amountSar, credits, subscriptionStatus: "active" });
  } catch (err) {
    return errorToResponse("checkout:POST", err);
  }
}
