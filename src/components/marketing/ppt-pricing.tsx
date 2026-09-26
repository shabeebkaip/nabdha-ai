"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { pptPlans, type PptPlan } from "@/lib/pricing";
import { t, type DictKey, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const nameCopy: Record<"basic" | "growth" | "pro", DictKey> = {
  basic: "pricing.plan.basic.name",
  growth: "pricing.plan.growth.name",
  pro: "pricing.plan.pro.name",
};

// AI Presentations (PPT Slides) — separate wallet, priced by slides. Same
// monthly/annual toggle as the AI-credit plans; annual is 20% off with the
// pre-discount price struck through.
export function PptPricing({ locale }: { locale: Locale }) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const switchId = useId();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Label htmlFor={switchId} className="text-sm font-medium">
          {t(locale, "pricing.toggle.monthly")}
        </Label>
        <Switch
          id={switchId}
          checked={billing === "annual"}
          onCheckedChange={(checked) => setBilling(checked ? "annual" : "monthly")}
          aria-label={t(locale, "pricing.toggle.annual")}
        />
        <Label htmlFor={switchId} className="text-sm font-medium">
          {t(locale, "pricing.toggle.annual")}
        </Label>
        <Badge variant="outline" className="ms-1 border-success/40 text-success">
          {t(locale, "pricing.toggle.save")}
        </Badge>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pptPlans.map((plan) => (
          <PptCard key={plan.id} locale={locale} plan={plan} billing={billing} />
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">{t(locale, "pricing.ppt.freeTrialNote")}</p>
    </div>
  );
}

function PptCard({ locale, plan, billing }: { locale: Locale; plan: PptPlan; billing: "monthly" | "annual" }) {
  const recommended = plan.recommended;
  const price = billing === "monthly" ? plan.monthlyPrice : plan.annualPrice;
  const slides = billing === "monthly" ? plan.slidesPerMonth : plan.slidesPerYear;

  return (
    <div
      className={cn(
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

      <h3 className="font-heading text-lg font-extrabold tracking-tight">{t(locale, nameCopy[plan.id])}</h3>

      <div className="mt-6">
        <p className="flex items-baseline gap-1.5">
          <span className="nabda-numeral font-heading text-5xl leading-none font-extrabold tracking-tight">{price}</span>
          <span className="text-sm font-medium text-muted-foreground">
            SAR{billing === "monthly" ? t(locale, "pricing.unit.perMonth") : t(locale, "pricing.unit.perYear")}
          </span>
        </p>
        {billing === "annual" && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {t(locale, "pricing.ppt.was")}{" "}
            <span className="nabda-numeral line-through">{plan.annualRegular} SAR</span>
          </p>
        )}
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 font-mono text-xs text-muted-foreground">
          <span className="nabda-numeral font-semibold text-foreground">{slides.toLocaleString("en-US")}</span>
          {billing === "monthly" ? t(locale, "pricing.ppt.perMonthSlides") : t(locale, "pricing.ppt.perYearSlides")}
        </span>
      </div>

      <div aria-hidden className="my-6 h-px bg-border" />

      <div className="flex-1" />

      <Button
        render={<Link href="/signup" />}
        size="lg"
        variant={recommended ? "default" : "outline"}
        className="w-full transition-transform active:translate-y-px"
      >
        {t(locale, "pricing.cta.start")}
      </Button>
    </div>
  );
}
