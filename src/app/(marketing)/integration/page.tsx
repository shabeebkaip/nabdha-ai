import type { Metadata } from "next";
import { Plug, ShoppingCart, Calculator, Store, Boxes, FileSpreadsheet, Code2, Lock, Eye, RotateCcw } from "lucide-react";
import { getLocale } from "@/lib/get-locale";
import { t, type Locale } from "@/lib/i18n";
import { LeadForm } from "@/components/marketing/lead-form";
import { ServiceHero, SectionHead, BenefitGrid, ProcessSteps, FormSection, AsideKV, ACCENT } from "@/components/marketing/service-page";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Request an Integration — Nabda AI" };

const ACCENT_KEY = "success" as const;

export default async function IntegrationPage() {
  const locale = await getLocale();

  const connectors = [
    { icon: ShoppingCart, title: t(locale, "svc.integ.conn.pos.title"), body: t(locale, "svc.integ.conn.pos.body") },
    { icon: Calculator, title: t(locale, "svc.integ.conn.acct.title"), body: t(locale, "svc.integ.conn.acct.body") },
    { icon: Store, title: t(locale, "svc.integ.conn.ecom.title"), body: t(locale, "svc.integ.conn.ecom.body") },
    { icon: Boxes, title: t(locale, "svc.integ.conn.erp.title"), body: t(locale, "svc.integ.conn.erp.body") },
    { icon: FileSpreadsheet, title: t(locale, "svc.integ.conn.sheets.title"), body: t(locale, "svc.integ.conn.sheets.body") },
    { icon: Code2, title: t(locale, "svc.integ.conn.api.title"), body: t(locale, "svc.integ.conn.api.body") },
  ];
  const steps = [
    { title: t(locale, "svc.integ.proc.s1.title"), body: t(locale, "svc.integ.proc.s1.body") },
    { title: t(locale, "svc.integ.proc.s2.title"), body: t(locale, "svc.integ.proc.s2.body") },
    { title: t(locale, "svc.integ.proc.s3.title"), body: t(locale, "svc.integ.proc.s3.body") },
    { title: t(locale, "svc.integ.proc.s4.title"), body: t(locale, "svc.integ.proc.s4.body") },
  ];
  const security = [
    { icon: Lock, title: t(locale, "svc.integ.sec.s1.title"), body: t(locale, "svc.integ.sec.s1.body") },
    { icon: Eye, title: t(locale, "svc.integ.sec.s2.title"), body: t(locale, "svc.integ.sec.s2.body") },
    { icon: RotateCcw, title: t(locale, "svc.integ.sec.s3.title"), body: t(locale, "svc.integ.sec.s3.body") },
  ];

  return (
    <>
      <ServiceHero
        locale={locale}
        accent={ACCENT_KEY}
        eyebrow={t(locale, "svc.integ.hero.eyebrow")}
        before={t(locale, "svc.integ.hero.titleBefore")}
        emphasis={t(locale, "svc.integ.hero.titleEmphasis")}
        after={t(locale, "svc.integ.hero.titleAfter")}
        subtitle={t(locale, "svc.integ.hero.subtitle")}
        bullets={[t(locale, "svc.integ.hero.b1"), t(locale, "svc.integ.hero.b2"), t(locale, "svc.integ.hero.b3")]}
        ctaLabel={t(locale, "svc.integ.hero.cta")}
        note={t(locale, "svc.integ.hero.note")}
        aside={<ConnectionCard locale={locale} />}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHead accent={ACCENT_KEY} eyebrow={t(locale, "svc.integ.conn.eyebrow")} heading={t(locale, "svc.integ.conn.heading")} />
          <BenefitGrid accent={ACCENT_KEY} items={connectors} cols={3} />
        </div>
      </section>

      <section className="theme-cream bg-background py-16 text-foreground md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHead accent={ACCENT_KEY} eyebrow={t(locale, "svc.integ.proc.eyebrow")} heading={t(locale, "svc.integ.proc.heading")} />
          <ProcessSteps accent={ACCENT_KEY} steps={steps} />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHead accent={ACCENT_KEY} eyebrow={t(locale, "svc.integ.sec.eyebrow")} heading={t(locale, "svc.integ.sec.heading")} />
          <BenefitGrid accent={ACCENT_KEY} items={security} cols={3} />
        </div>
      </section>

      <FormSection
        accent={ACCENT_KEY}
        eyebrow={t(locale, "svc.integ.form.eyebrow")}
        heading={t(locale, "svc.integ.form.heading")}
        subtitle={t(locale, "svc.integ.form.subtitle")}
        included={t(locale, "svc.common.included")}
        checklist={[t(locale, "svc.integ.form.c1"), t(locale, "svc.integ.form.c2"), t(locale, "svc.integ.form.c3"), t(locale, "svc.integ.form.c4")]}
        note={t(locale, "svc.integ.form.note")}
      >
        <LeadForm kind="integration" locale={locale} />
      </FormSection>
    </>
  );
}

// Hero aside: a live-connection card with an animated sync pulse and a rising
// record counter feel — the "wired in and flowing" identity.
function ConnectionCard({ locale }: { locale: Locale }) {
  const a = ACCENT[ACCENT_KEY];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card/60 shadow-2xl backdrop-blur-sm">
      <span aria-hidden className={cn("pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent to-transparent", a.grad)} />
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className={cn("flex size-8 items-center justify-center rounded-lg", a.bg, a.text)}>
            <Plug aria-hidden className="size-4" />
          </span>
          <span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">{t(locale, "svc.integ.aside.label")}</span>
        </div>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold", a.bg, a.text)}>
          <span aria-hidden className={cn("size-1.5 animate-pulse rounded-full motion-reduce:animate-none", a.bg.replace("/10", ""))} />
          {t(locale, "svc.integ.aside.status")}
        </span>
      </div>
      <div className="divide-y divide-white/[0.06] px-5">
        <AsideKV label={t(locale, "svc.integ.aside.source")} value={t(locale, "svc.integ.aside.sourceVal")} />
        <AsideKV label={t(locale, "svc.integ.aside.freq")} value={t(locale, "svc.integ.aside.freqVal")} />
      </div>
      <div className="border-t border-white/[0.06] px-5 py-4">
        <p className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">{t(locale, "svc.integ.aside.records")}</p>
        <p className={cn("nabda-numeral mt-1 font-heading text-3xl font-extrabold tracking-tight", a.text)}>128,940</p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Lock aria-hidden className="size-3" />
          {t(locale, "svc.integ.aside.encrypted")}
        </p>
      </div>
    </div>
  );
}
