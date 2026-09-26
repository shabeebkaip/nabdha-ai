import type { Metadata } from "next";
import { GraduationCap, Gauge, TrendingUp, Brain, ShieldCheck, Monitor, MapPin, Building2, Check } from "lucide-react";
import { getLocale } from "@/lib/get-locale";
import { t, type Locale } from "@/lib/i18n";
import { LeadForm } from "@/components/marketing/lead-form";
import { ServiceHero, SectionHead, BenefitGrid, FormSection, ACCENT } from "@/components/marketing/service-page";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Explore Training — Nabda AI" };

const ACCENT_KEY = "insight" as const;

export default async function TrainingPage() {
  const locale = await getLocale();

  const tracks = [
    { icon: Gauge, title: t(locale, "svc.train.tracks.found.title"), body: t(locale, "svc.train.tracks.found.body") },
    { icon: TrendingUp, title: t(locale, "svc.train.tracks.practice.title"), body: t(locale, "svc.train.tracks.practice.body") },
    { icon: Brain, title: t(locale, "svc.train.tracks.ai.title"), body: t(locale, "svc.train.tracks.ai.body") },
    { icon: ShieldCheck, title: t(locale, "svc.train.tracks.admin.title"), body: t(locale, "svc.train.tracks.admin.body") },
  ];
  const formats = [
    { icon: Monitor, title: t(locale, "svc.train.fmt.online.title"), body: t(locale, "svc.train.fmt.online.body") },
    { icon: MapPin, title: t(locale, "svc.train.fmt.onsite.title"), body: t(locale, "svc.train.fmt.onsite.body") },
    { icon: Building2, title: t(locale, "svc.train.fmt.corp.title"), body: t(locale, "svc.train.fmt.corp.body") },
  ];

  return (
    <>
      <ServiceHero
        locale={locale}
        accent={ACCENT_KEY}
        eyebrow={t(locale, "svc.train.hero.eyebrow")}
        before={t(locale, "svc.train.hero.titleBefore")}
        emphasis={t(locale, "svc.train.hero.titleEmphasis")}
        after={t(locale, "svc.train.hero.titleAfter")}
        subtitle={t(locale, "svc.train.hero.subtitle")}
        bullets={[t(locale, "svc.train.hero.b1"), t(locale, "svc.train.hero.b2"), t(locale, "svc.train.hero.b3")]}
        ctaLabel={t(locale, "svc.train.hero.cta")}
        note={t(locale, "svc.train.hero.note")}
        aside={<CurriculumCard locale={locale} />}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHead accent={ACCENT_KEY} eyebrow={t(locale, "svc.train.tracks.eyebrow")} heading={t(locale, "svc.train.tracks.heading")} />
          <BenefitGrid accent={ACCENT_KEY} items={tracks} cols={2} />
        </div>
      </section>

      <section className="theme-cream bg-background py-16 text-foreground md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHead accent={ACCENT_KEY} eyebrow={t(locale, "svc.train.fmt.eyebrow")} heading={t(locale, "svc.train.fmt.heading")} />
          <BenefitGrid accent={ACCENT_KEY} items={formats} cols={3} />
        </div>
      </section>

      <FormSection
        accent={ACCENT_KEY}
        eyebrow={t(locale, "svc.train.form.eyebrow")}
        heading={t(locale, "svc.train.form.heading")}
        subtitle={t(locale, "svc.train.form.subtitle")}
        included={t(locale, "svc.common.included")}
        checklist={[t(locale, "svc.train.form.c1"), t(locale, "svc.train.form.c2"), t(locale, "svc.train.form.c3"), t(locale, "svc.train.form.c4")]}
        note={t(locale, "svc.train.form.note")}
      >
        <LeadForm kind="training" locale={locale} />
      </FormSection>
    </>
  );
}

// Hero aside: a curriculum card showing modules with a cohort-progress bar — the
// "academy" identity, distinct from the other three pages' asides.
function CurriculumCard({ locale }: { locale: Locale }) {
  const a = ACCENT[ACCENT_KEY];
  const modules = [
    { label: t(locale, "svc.train.aside.m1"), done: true },
    { label: t(locale, "svc.train.aside.m2"), done: true },
    { label: t(locale, "svc.train.aside.m3"), done: false },
    { label: t(locale, "svc.train.aside.m4"), done: false },
  ];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card/60 shadow-2xl backdrop-blur-sm">
      <span aria-hidden className={cn("pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent to-transparent", a.grad)} />
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className={cn("flex size-8 items-center justify-center rounded-lg", a.bg, a.text)}>
            <GraduationCap aria-hidden className="size-4" />
          </span>
          <span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">{t(locale, "svc.train.aside.label")}</span>
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", a.bg, a.text)}>{t(locale, "svc.train.aside.modules")}</span>
      </div>
      <ul className="flex flex-col gap-2 px-5 py-5">
        {modules.map((m) => (
          <li key={m.label} className="flex items-center gap-3 text-sm">
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full",
                m.done ? cn(a.bg, a.text) : "border border-white/15 text-transparent"
              )}
            >
              <Check aria-hidden className="size-3" strokeWidth={3} />
            </span>
            <span className={m.done ? "text-foreground/90" : "text-muted-foreground"}>{m.label}</span>
          </li>
        ))}
      </ul>
      <div className="border-t border-white/[0.06] px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">{t(locale, "svc.train.aside.progress")}</span>
          <span className={cn("nabda-numeral text-xs font-bold", a.text)}>50%</span>
        </div>
        <div aria-hidden className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className={cn("h-full rounded-full", a.bg.replace("/10", ""))} style={{ width: "50%" }} />
        </div>
      </div>
    </div>
  );
}
