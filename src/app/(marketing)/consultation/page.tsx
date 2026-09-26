import type { Metadata } from "next";
import { CalendarCheck, TrendingUp, Wallet, Rocket, Search, Check } from "lucide-react";
import { getLocale } from "@/lib/get-locale";
import { t, type Locale } from "@/lib/i18n";
import { LeadForm } from "@/components/marketing/lead-form";
import { ServiceHero, SectionHead, BenefitGrid, ProcessSteps, StatBand, FormSection, AsideKV, ACCENT } from "@/components/marketing/service-page";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Book a Consultation — Nabda AI" };

const ACCENT_KEY = "primary" as const;

export default async function ConsultationPage() {
  const locale = await getLocale();

  const focus = [
    { icon: TrendingUp, title: t(locale, "svc.consult.focus.revenue.title"), body: t(locale, "svc.consult.focus.revenue.body") },
    { icon: Wallet, title: t(locale, "svc.consult.focus.cash.title"), body: t(locale, "svc.consult.focus.cash.body") },
    { icon: Rocket, title: t(locale, "svc.consult.focus.growth.title"), body: t(locale, "svc.consult.focus.growth.body") },
    { icon: Search, title: t(locale, "svc.consult.focus.slow.title"), body: t(locale, "svc.consult.focus.slow.body") },
  ];
  const steps = [
    { title: t(locale, "svc.consult.proc.s1.title"), body: t(locale, "svc.consult.proc.s1.body") },
    { title: t(locale, "svc.consult.proc.s2.title"), body: t(locale, "svc.consult.proc.s2.body") },
    { title: t(locale, "svc.consult.proc.s3.title"), body: t(locale, "svc.consult.proc.s3.body") },
    { title: t(locale, "svc.consult.proc.s4.title"), body: t(locale, "svc.consult.proc.s4.body") },
  ];
  const stats = [
    { value: t(locale, "svc.consult.stat1.value"), label: t(locale, "svc.consult.stat1.label") },
    { value: t(locale, "svc.consult.stat2.value"), label: t(locale, "svc.consult.stat2.label") },
    { value: t(locale, "svc.consult.stat3.value"), label: t(locale, "svc.consult.stat3.label") },
  ];

  return (
    <>
      <ServiceHero
        locale={locale}
        accent={ACCENT_KEY}
        eyebrow={t(locale, "svc.consult.hero.eyebrow")}
        before={t(locale, "svc.consult.hero.titleBefore")}
        emphasis={t(locale, "svc.consult.hero.titleEmphasis")}
        after={t(locale, "svc.consult.hero.titleAfter")}
        subtitle={t(locale, "svc.consult.hero.subtitle")}
        bullets={[t(locale, "svc.consult.hero.b1"), t(locale, "svc.consult.hero.b2"), t(locale, "svc.consult.hero.b3")]}
        ctaLabel={t(locale, "svc.consult.hero.cta")}
        note={t(locale, "svc.consult.hero.note")}
        aside={<SessionCard locale={locale} />}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHead accent={ACCENT_KEY} eyebrow={t(locale, "svc.consult.focus.eyebrow")} heading={t(locale, "svc.consult.focus.heading")} />
          <BenefitGrid accent={ACCENT_KEY} items={focus} cols={2} />
        </div>
      </section>

      <section className="theme-cream bg-background py-16 text-foreground md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHead accent={ACCENT_KEY} eyebrow={t(locale, "svc.consult.proc.eyebrow")} heading={t(locale, "svc.consult.proc.heading")} />
          <ProcessSteps accent={ACCENT_KEY} steps={steps} />
          <div className="mt-14">
            <StatBand accent={ACCENT_KEY} stats={stats} />
          </div>
        </div>
      </section>

      <FormSection
        accent={ACCENT_KEY}
        eyebrow={t(locale, "svc.consult.form.eyebrow")}
        heading={t(locale, "svc.consult.form.heading")}
        subtitle={t(locale, "svc.consult.form.subtitle")}
        included={t(locale, "svc.common.included")}
        checklist={[t(locale, "svc.consult.form.c1"), t(locale, "svc.consult.form.c2"), t(locale, "svc.consult.form.c3"), t(locale, "svc.consult.form.c4")]}
        note={t(locale, "svc.consult.form.note")}
      >
        <LeadForm kind="consultation" locale={locale} />
      </FormSection>
    </>
  );
}

// Hero aside: a booking confirmation card — the outcome of the CTA, shown as a
// real product surface rather than a stock illustration.
function SessionCard({ locale }: { locale: Locale }) {
  const a = ACCENT[ACCENT_KEY];
  const agenda = [t(locale, "svc.consult.aside.agenda1"), t(locale, "svc.consult.aside.agenda2"), t(locale, "svc.consult.aside.agenda3")];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card/60 shadow-2xl backdrop-blur-sm">
      <span aria-hidden className={cn("pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent to-transparent", a.grad)} />
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className={cn("flex size-8 items-center justify-center rounded-lg", a.bg, a.text)}>
            <CalendarCheck aria-hidden className="size-4" />
          </span>
          <span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">{t(locale, "svc.consult.aside.label")}</span>
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", a.bg, a.text)}>{t(locale, "svc.consult.aside.status")}</span>
      </div>
      <div className="divide-y divide-white/[0.06] px-5">
        <AsideKV label={t(locale, "svc.consult.aside.durationLabel")} value={t(locale, "svc.consult.aside.duration")} />
        <AsideKV label={t(locale, "svc.consult.aside.langLabel")} value={t(locale, "svc.consult.aside.lang")} />
      </div>
      <div className="border-t border-white/[0.06] px-5 py-4">
        <p className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">{t(locale, "svc.consult.aside.agendaLabel")}</p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {agenda.map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm text-foreground/90">
              <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full", a.bg, a.text)}>
                <Check aria-hidden className="size-3" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
