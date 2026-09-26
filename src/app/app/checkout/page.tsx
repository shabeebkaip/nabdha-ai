import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, ShieldCheck, Sparkles, Info } from "lucide-react";
import { getLocale } from "@/lib/get-locale";
import { t, tf, dirFor, type DictKey, type Locale } from "@/lib/i18n";
import { getLivePricingPlans } from "@/lib/pricing-live";
import type { PlanId } from "@/lib/pricing";
import { CheckoutClient } from "./checkout-client";

export const metadata: Metadata = { title: "Checkout — Nabda AI" };

const PLAN_NAME: Record<PlanId, DictKey> = {
  basic: "pricing.plan.basic.name",
  growth: "pricing.plan.growth.name",
  pro: "pricing.plan.pro.name",
};

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ plan?: string; cycle?: string }> }) {
  const [locale, params] = await Promise.all([getLocale(), searchParams]);
  const dir = dirFor(locale);

  const plan = params.plan as PlanId;
  const cycle = params.cycle === "annual" ? "annual" : "monthly";
  const valid = plan === "basic" || plan === "growth" || plan === "pro";

  if (!valid) return <InvalidState locale={locale} />;

  const plans = await getLivePricingPlans();
  const selected = plans.find((p) => p.id === plan);
  if (!selected) return <InvalidState locale={locale} />;

  const amount = cycle === "annual" ? selected.annualPrice : selected.monthlyPrice;
  const planName = t(locale, PLAN_NAME[plan]);

  return (
    <div dir={dir} className="min-h-dvh bg-muted/40 text-foreground">
      <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span aria-hidden className="size-2 rounded-full bg-primary" />
          <span className="font-heading text-base font-extrabold tracking-tight">Nabda AI</span>
        </Link>
        <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ChevronLeft aria-hidden className="size-4 icon-directional" />
          {t(locale, "checkout.back")}
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-6">
          <p className="inline-flex items-center gap-2.5 font-mono text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            <span aria-hidden className="h-px w-5 bg-primary" />
            {t(locale, "checkout.eyebrow")}
          </p>
          <h1 className="mt-3 font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">{t(locale, "checkout.title")}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{t(locale, "checkout.subtitle")}</p>
        </div>

        {/* Demo disclosure — unmissable, so no one mistakes this for real billing. */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-warning-bright/30 bg-warning-bright/10 px-4 py-3">
          <Info aria-hidden className="mt-0.5 size-4.5 shrink-0 text-warning-bright" />
          <p className="text-sm text-foreground/90">{t(locale, "checkout.demoBanner")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <OrderSummary locale={locale} planName={planName} cycle={cycle} amount={amount} credits={selected.creditsPerMonth} />
          <CheckoutClient locale={locale} plan={plan} cycle={cycle} amount={amount} planName={planName} credits={selected.creditsPerMonth} />
        </div>
      </main>
    </div>
  );
}

function OrderSummary({
  locale,
  planName,
  cycle,
  amount,
  credits,
}: {
  locale: Locale;
  planName: string;
  cycle: "monthly" | "annual";
  amount: number;
  credits: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <h2 className="font-mono text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{t(locale, "checkout.order.title")}</h2>

      <div className="mt-4 flex items-center gap-3 rounded-xl bg-primary/5 p-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles aria-hidden className="size-5" />
        </span>
        <div>
          <p className="font-heading text-lg font-bold tracking-tight">{planName}</p>
          <p className="text-xs text-muted-foreground">
            {credits.toLocaleString("en-US")} {t(locale, "checkout.order.credits")}
          </p>
        </div>
      </div>

      <dl className="mt-5 flex flex-col divide-y divide-border text-sm">
        <div className="flex items-center justify-between py-2.5">
          <dt className="text-muted-foreground">{t(locale, "checkout.order.plan")}</dt>
          <dd className="font-medium">{planName}</dd>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <dt className="text-muted-foreground">{t(locale, "checkout.order.billing")}</dt>
          <dd className="font-medium">{t(locale, cycle === "annual" ? "checkout.order.annual" : "checkout.order.monthly")}</dd>
        </div>
      </dl>

      <div className="mt-3 flex items-baseline justify-between border-t border-border pt-4">
        <span className="text-sm font-medium">{t(locale, "checkout.order.dueToday")}</span>
        <span className="font-heading text-2xl font-extrabold tracking-tight">
          <span className="nabda-numeral">{amount.toLocaleString("en-US")}</span>
          <span className="ms-1 text-sm font-medium text-muted-foreground">
            SAR{cycle === "annual" ? t(locale, "pricing.unit.perYear") : t(locale, "pricing.unit.perMonth")}
          </span>
        </span>
      </div>

      <p className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldCheck aria-hidden className="size-3.5" />
        {t(locale, "checkout.secured")}
      </p>
    </div>
  );
}

function InvalidState({ locale }: { locale: Locale }) {
  return (
    <div dir={dirFor(locale)} className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-muted/40 px-4 text-center text-foreground">
      <p className="text-sm text-muted-foreground">{t(locale, "checkout.invalid")}</p>
      <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
        <ChevronLeft aria-hidden className="size-4 icon-directional" />
        {tf(locale, "checkout.back", {})}
      </Link>
    </div>
  );
}
