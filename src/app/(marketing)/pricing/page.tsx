import Link from "next/link";
import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { PptPricing } from "@/components/marketing/ppt-pricing";
import { comparison, featureKeys, type ComparisonPlanId } from "@/lib/pricing";
import { getLivePricingPlans } from "@/lib/pricing-live";
import { getLocale } from "@/lib/get-locale";
import { t, type DictKey, type Locale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Pricing — Nabda AI",
  description:
    "Simple, credit-based pricing for Nabda AI's Business Intelligence platform. Basic, Growth, Pro, and Custom Enterprise plans.",
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

const planNameCopy: Record<ComparisonPlanId, DictKey> = {
  basic: "pricing.plan.basic.name",
  growth: "pricing.plan.growth.name",
  pro: "pricing.plan.pro.name",
  custom: "pricing.plan.custom.name",
};

const columnOrder: ComparisonPlanId[] = ["basic", "growth", "pro", "custom"];

export default async function PricingPage() {
  const [locale, plans] = await Promise.all([getLocale(), getLivePricingPlans()]);

  return (
    <>
      <section className="pt-16 pb-8 text-center md:pt-24">
        <div className="mx-auto max-w-2xl px-4 md:px-6 lg:px-8">
          <p className="font-mono text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            {t(locale, "pricing.eyebrow")}
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t(locale, "pricing.heading")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{t(locale, "pricing.subtitle")}</p>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
          <PricingPlans locale={locale} plans={plans} />
        </div>
      </section>

      {/* AI Presentations (PPT Slides) — separate wallet from AI credits. */}
      <section className="theme-cream bg-background py-16 text-foreground md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="inline-flex items-center gap-2.5 font-mono text-xs font-semibold tracking-[0.14em] text-primary uppercase">
              <span aria-hidden className="h-px w-5 bg-primary" />
              {t(locale, "pricing.ppt.eyebrow")}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
              {t(locale, "pricing.ppt.heading")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t(locale, "pricing.ppt.subtitle")}</p>
          </div>
          <PptPricing locale={locale} />
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-2xl font-extrabold tracking-tight">
            {t(locale, "pricing.table.heading")}
          </h2>
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky start-0 z-10 bg-card">
                    {t(locale, "pricing.table.feature")}
                  </TableHead>
                  {columnOrder.map((planId) => (
                    <TableHead key={planId} className="text-center">
                      {planId === "custom"
                        ? t(locale, "pricing.table.enterprise")
                        : t(locale, planNameCopy[planId])}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="sticky start-0 z-10 bg-card font-medium">
                    {t(locale, "pricing.table.monthlyPrice")}
                  </TableCell>
                  {columnOrder.map((planId) => (
                    <TableCell key={planId} className="text-center">
                      {planId === "custom" ? (
                        <span className="text-sm">{t(locale, "pricing.custom")}</span>
                      ) : (
                        <span className="nabda-numeral font-semibold">
                          {plans.find((p) => p.id === planId)!.monthlyPrice} SAR
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="sticky start-0 z-10 bg-card font-medium">
                    {t(locale, "pricing.table.monthlyUsage")}
                  </TableCell>
                  {columnOrder.map((planId) => (
                    <TableCell key={planId} className="text-center">
                      {planId === "custom" ? (
                        <span className="text-sm">{t(locale, "pricing.custom")}</span>
                      ) : (
                        <span className="nabda-numeral font-semibold">
                          {plans
                            .find((p) => p.id === planId)!
                            .creditsPerMonth.toLocaleString("en-US")}
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {featureKeys.map((key) => (
                  <TableRow key={key}>
                    <TableCell className="sticky start-0 z-10 bg-card font-medium">
                      {t(locale, featureCopy[key])}
                    </TableCell>
                    {columnOrder.map((planId) => (
                      <TableCell key={planId} className="text-center">
                        <FeatureCell value={comparison[key][planId]} locale={locale} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 py-20 text-center md:py-28">
        <div className="mx-auto max-w-2xl px-4 md:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t(locale, "pricing.ctaBand.heading")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t(locale, "pricing.ctaBand.body")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button render={<Link href="/enterprise" />} size="lg" className="shadow-glow-primary">
              {t(locale, "pricing.plan.custom.cta")}
            </Button>
            <Button render={<Link href="/consultation" />} size="lg" variant="outline">
              {t(locale, "ctaBand.bookConsultation")}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCell({
  value,
  locale,
}: {
  value: boolean | "optional";
  locale: Locale;
}) {
  if (value === "optional") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <span aria-hidden>±</span>
        <span>{t(locale, "pricing.value.optional")}</span>
      </span>
    );
  }
  if (value) {
    return (
      <span className="inline-flex items-center justify-center text-success">
        <Check aria-hidden className="size-4" />
        <span className="sr-only">{t(locale, "pricing.value.included")}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center text-muted-foreground/50">
      <Minus aria-hidden className="size-4" />
      <span className="sr-only">{t(locale, "pricing.value.notIncluded")}</span>
    </span>
  );
}
