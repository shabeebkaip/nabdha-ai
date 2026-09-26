import type { Metadata } from "next";
import { Building2, Cpu, LayoutDashboard, Headset, ShieldCheck, GraduationCap, Activity, MapPin, KeyRound, ScrollText } from "lucide-react";
import { getLocale } from "@/lib/get-locale";
import { t, type Locale } from "@/lib/i18n";
import { LeadForm } from "@/components/marketing/lead-form";
import { ServiceHero, SectionHead, BenefitGrid, StatBand, FormSection, ACCENT } from "@/components/marketing/service-page";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Talk to Our Team — Nabda AI" };

const ACCENT_KEY = "warning" as const;

export default async function EnterprisePage() {
  const locale = await getLocale();

  const stats = [
    { value: t(locale, "svc.ent.stat1.value"), label: t(locale, "svc.ent.stat1.label") },
    { value: t(locale, "svc.ent.stat2.value"), label: t(locale, "svc.ent.stat2.label") },
    { value: t(locale, "svc.ent.stat3.value"), label: t(locale, "svc.ent.stat3.label") },
    { value: t(locale, "svc.ent.stat4.value"), label: t(locale, "svc.ent.stat4.label") },
  ];
  const caps = [
    { icon: Cpu, title: t(locale, "svc.ent.cap.models.title"), body: t(locale, "svc.ent.cap.models.body") },
    { icon: LayoutDashboard, title: t(locale, "svc.ent.cap.dash.title"), body: t(locale, "svc.ent.cap.dash.body") },
    { icon: Headset, title: t(locale, "svc.ent.cap.support.title"), body: t(locale, "svc.ent.cap.support.body") },
    { icon: ShieldCheck, title: t(locale, "svc.ent.cap.security.title"), body: t(locale, "svc.ent.cap.security.body") },
    { icon: GraduationCap, title: t(locale, "svc.ent.cap.onboarding.title"), body: t(locale, "svc.ent.cap.onboarding.body") },
    { icon: Activity, title: t(locale, "svc.ent.cap.sla.title"), body: t(locale, "svc.ent.cap.sla.body") },
  ];
  const security = [
    { icon: MapPin, title: t(locale, "svc.ent.sec.s1.title"), body: t(locale, "svc.ent.sec.s1.body") },
    { icon: KeyRound, title: t(locale, "svc.ent.sec.s2.title"), body: t(locale, "svc.ent.sec.s2.body") },
    { icon: ScrollText, title: t(locale, "svc.ent.sec.s3.title"), body: t(locale, "svc.ent.sec.s3.body") },
  ];

  return (
    <>
      <ServiceHero
        locale={locale}
        accent={ACCENT_KEY}
        eyebrow={t(locale, "svc.ent.hero.eyebrow")}
        before={t(locale, "svc.ent.hero.titleBefore")}
        emphasis={t(locale, "svc.ent.hero.titleEmphasis")}
        after={t(locale, "svc.ent.hero.titleAfter")}
        subtitle={t(locale, "svc.ent.hero.subtitle")}
        bullets={[t(locale, "svc.ent.hero.b1"), t(locale, "svc.ent.hero.b2"), t(locale, "svc.ent.hero.b3")]}
        ctaLabel={t(locale, "svc.ent.hero.cta")}
        note={t(locale, "svc.ent.hero.note")}
        aside={<ControlCard locale={locale} />}
      />

      <section className="pb-4">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <StatBand accent={ACCENT_KEY} stats={stats} />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHead accent={ACCENT_KEY} eyebrow={t(locale, "svc.ent.cap.eyebrow")} heading={t(locale, "svc.ent.cap.heading")} />
          <BenefitGrid accent={ACCENT_KEY} items={caps} cols={3} />
        </div>
      </section>

      <section className="theme-cream bg-background py-16 text-foreground md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHead accent={ACCENT_KEY} eyebrow={t(locale, "svc.ent.sec.eyebrow")} heading={t(locale, "svc.ent.sec.heading")} />
          <BenefitGrid accent={ACCENT_KEY} items={security} cols={3} />
        </div>
      </section>

      <FormSection
        accent={ACCENT_KEY}
        eyebrow={t(locale, "svc.ent.form.eyebrow")}
        heading={t(locale, "svc.ent.form.heading")}
        subtitle={t(locale, "svc.ent.form.subtitle")}
        included={t(locale, "svc.common.included")}
        checklist={[t(locale, "svc.ent.form.c1"), t(locale, "svc.ent.form.c2"), t(locale, "svc.ent.form.c3"), t(locale, "svc.ent.form.c4")]}
        note={t(locale, "svc.ent.form.note")}
      >
        <LeadForm kind="enterprise" locale={locale} />
      </FormSection>
    </>
  );
}

// Hero aside: an enterprise "control panel" — the controls large teams ask for,
// shown as live toggles. Distinct device from the other three pages.
function ControlCard({ locale }: { locale: Locale }) {
  const a = ACCENT[ACCENT_KEY];
  const toggles = [
    t(locale, "svc.ent.cap.security.title"),
    t(locale, "svc.ent.sec.s2.title"),
    t(locale, "svc.ent.sec.s3.title"),
  ];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card/60 shadow-2xl backdrop-blur-sm">
      <span aria-hidden className={cn("pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent to-transparent", a.grad)} />
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className={cn("flex size-8 items-center justify-center rounded-lg", a.bg, a.text)}>
            <Building2 aria-hidden className="size-4" />
          </span>
          <span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">{t(locale, "svc.ent.hero.eyebrow")}</span>
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", a.bg, a.text)}>{t(locale, "svc.ent.stat1.value")}</span>
      </div>

      <div className="grid grid-cols-2 gap-px bg-white/[0.06]">
        {[
          { v: t(locale, "svc.ent.stat3.value"), l: t(locale, "svc.ent.stat3.label") },
          { v: t(locale, "svc.ent.stat4.value"), l: t(locale, "svc.ent.stat4.label") },
        ].map((s) => (
          <div key={s.l} className="bg-card/60 px-5 py-4">
            <p className={cn("nabda-numeral font-heading text-2xl font-extrabold", a.text)}>{s.v}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>

      <ul className="flex flex-col gap-3 border-t border-white/[0.06] px-5 py-5">
        {toggles.map((label) => (
          <li key={label} className="flex items-center justify-between gap-3">
            <span className="text-sm text-foreground/90">{label}</span>
            <span aria-hidden className={cn("flex h-5 w-9 items-center justify-end rounded-full p-0.5", a.bg.replace("/10", ""))}>
              <span className="size-4 rounded-full bg-white shadow-sm" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
