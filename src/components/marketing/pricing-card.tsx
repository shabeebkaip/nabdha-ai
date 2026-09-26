import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { comparison, featureKeys, getPlan, type ComparisonPlanId, type PricingPlan } from "@/lib/pricing";
import { t, type DictKey, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const planCopy: Record<ComparisonPlanId, { name: DictKey; tagline: DictKey }> = {
  basic: { name: "pricing.plan.basic.name", tagline: "pricing.plan.basic.tagline" },
  growth: { name: "pricing.plan.growth.name", tagline: "pricing.plan.growth.tagline" },
  pro: { name: "pricing.plan.pro.name", tagline: "pricing.plan.pro.tagline" },
  custom: { name: "pricing.plan.custom.name", tagline: "pricing.plan.custom.tagline" },
};

const featureCopy: Record<(typeof featureKeys)[number], DictKey> = {
  dashboard: "pricing.feature.dashboard",
  insights: "pricing.feature.insights",
  riskDetection: "pricing.feature.riskDetection",
  opportunityDetection: "pricing.feature.opportunityDetection",
  standardReports: "pricing.feature.standardReports",
  advancedAnalytics: "pricing.feature.advancedAnalytics",
  forecasting: "pricing.feature.forecasting",
  advancedAI: "pricing.feature.advancedAI",
  customIntegration: "pricing.feature.customIntegration",
  customAI: "pricing.feature.customAI",
  enterpriseSupport: "pricing.feature.enterpriseSupport",
};

export function PricingCard({
  locale,
  planId,
  billing,
  plan: livePlan,
}: {
  locale: Locale;
  planId: ComparisonPlanId;
  billing: "monthly" | "annual";
  /** Live admin_config-backed plan data (client §52 / AC5) — falls back to
   * the static defaults in src/lib/pricing.ts if the caller doesn't have it
   * yet (e.g. not fetched), so this component never breaks either way. */
  plan?: PricingPlan;
}) {
  const isCustom = planId === "custom";
  const plan = isCustom ? null : livePlan ?? getPlan(planId);
  const copy = planCopy[planId];
  const recommended = Boolean(plan?.recommended);
  const highlights = featureKeys.filter((key) => comparison[key][planId] === true).slice(0, 5);

  return (
    <div
      className={cn(
        // Recommended plan gets real hierarchy — a 2px accent border and a
        // lift on desktop — so the three tiers aren't visually identical.
        "relative flex h-full flex-col rounded-2xl bg-card p-6 transition-[transform,box-shadow] duration-300 ease-nabda sm:p-7",
        recommended
          ? "border-2 border-primary shadow-[0_30px_60px_-28px_rgba(2,6,23,0.30)] lg:-translate-y-2.5"
          : "border border-border shadow-sm hover:-translate-y-0.5"
      )}
    >
      {recommended && (
        <span className="absolute -top-3 start-6 inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
          {t(locale, "pricing.recommended")}
        </span>
      )}

      <div>
        <h3 className="font-heading text-lg font-extrabold tracking-tight">{t(locale, copy.name)}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(locale, copy.tagline)}</p>
      </div>

      <div className="mt-6">
        {isCustom ? (
          <p className="font-heading text-4xl font-extrabold tracking-tight">{t(locale, "pricing.plan.custom.price")}</p>
        ) : (
          <>
            <p className="flex items-baseline gap-1.5">
              <span className="nabda-numeral font-heading text-5xl leading-none font-extrabold tracking-tight">
                {billing === "monthly" ? plan!.monthlyPrice : plan!.annualPrice}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                SAR{billing === "monthly" ? t(locale, "pricing.unit.perMonth") : t(locale, "pricing.unit.perYear")}
              </span>
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 font-mono text-xs text-muted-foreground">
              <span className="nabda-numeral font-semibold text-foreground">{plan!.creditsPerMonth.toLocaleString("en-US")}</span>
              {t(locale, "pricing.unit.credits")}
            </span>
          </>
        )}
      </div>

      <div aria-hidden className="my-6 h-px bg-border" />

      <ul className="flex flex-1 flex-col gap-3 text-sm">
        {highlights.map((key) => (
          <li key={key} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
              <Check aria-hidden className="size-3" strokeWidth={2.5} />
            </span>
            <span className="text-foreground/90">{t(locale, featureCopy[key])}</span>
          </li>
        ))}
      </ul>

      <Button
        render={<Link href={isCustom ? "/enterprise" : "/signup"} />}
        size="lg"
        variant={recommended ? "default" : "outline"}
        className="mt-8 w-full transition-transform active:translate-y-px"
      >
        {isCustom ? t(locale, "pricing.cta.contactSales") : t(locale, "pricing.cta.start")}
      </Button>
    </div>
  );
}
