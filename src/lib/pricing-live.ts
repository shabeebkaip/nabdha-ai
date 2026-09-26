// Server-only: reads live plan prices from `admin_config` so the public
// pricing page reflects an admin edit without a deploy (client §52 / AC5).
// `src/lib/pricing.ts` stays the client-safe static fallback (imported by
// the client-side monthly/annual toggle) and is also what this file falls
// back to on any DB error — DESIGN_SPEC §4 Flow D: "Config fetch fails →
// falls back to last-known static defaults, no blank pricing page."
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { adminConfig } from "@/db/schema";
import { plans as staticPlans, type PricingPlan, type PlanId } from "@/lib/pricing";

const PLAN_IDS: PlanId[] = ["basic", "growth", "pro"];
const CONFIG_KEYS = PLAN_IDS.map((id) => `pricing.${id}`);

interface StoredPlanValue {
  monthlyPrice: number;
  /** Stored explicitly, not derived — see seed.ts comment: monthly*12*0.8
   * doesn't reconcile exactly with the locked DECISIONS.md figures for
   * every plan, so admin can edit it independently of monthlyPrice. */
  annualPrice: number;
  credits: number;
}

export async function getLivePricingPlans(): Promise<PricingPlan[]> {
  try {
    const rows = await db.select().from(adminConfig).where(inArray(adminConfig.key, CONFIG_KEYS));
    const byKey = new Map(rows.map((r) => [r.key, r.value]));

    return PLAN_IDS.map((id) => {
      const fallback = staticPlans.find((p) => p.id === id)!;
      const stored = byKey.get(`pricing.${id}`) as StoredPlanValue | undefined;
      if (!stored || typeof stored.monthlyPrice !== "number") return fallback;
      return {
        id,
        monthlyPrice: stored.monthlyPrice,
        annualPrice: typeof stored.annualPrice === "number" ? stored.annualPrice : fallback.annualPrice,
        creditsPerMonth: stored.credits ?? fallback.creditsPerMonth,
        recommended: fallback.recommended,
      };
    });
  } catch {
    return staticPlans;
  }
}
