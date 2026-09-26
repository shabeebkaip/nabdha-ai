import { t, type Locale } from "@/lib/i18n";

// Shared gradient/data showcase pane for the signup + login split-screen
// (DESIGN_SPEC §7 "02/03"). Reused by both auth pages so they stay visually
// identical — see AuthGlassCard for the matching form-pane treatment.
//
// The middle section renders a small "live" product-data panel (module
// cards + stat tiles) using the seeded Nabda Retail Demo numbers
// (src/lib/demo-data.ts) so it feels real, not decorative — explicitly
// labeled "illustrative demo data" so it never reads as a live claim.
export function AuthShowcase({ locale }: { locale: Locale }) {
  const modules: Array<{ title: string; desc: string; progress: number }> = [
    { title: t(locale, "auth.showcase.moduleHealth.title"), desc: t(locale, "auth.showcase.moduleHealth.desc"), progress: 78 },
    { title: t(locale, "auth.showcase.moduleRisk.title"), desc: t(locale, "auth.showcase.moduleRisk.desc"), progress: 91 },
    {
      title: t(locale, "auth.showcase.moduleOpportunity.title"),
      desc: t(locale, "auth.showcase.moduleOpportunity.desc"),
      progress: 85,
    },
    { title: t(locale, "auth.showcase.moduleForecast.title"), desc: t(locale, "auth.showcase.moduleForecast.desc"), progress: 68 },
  ];

  const stats: Array<{ value: string; label: string }> = [
    { value: "1.24M", label: t(locale, "auth.showcase.statRevenueLabel") },
    { value: "+12.4%", label: t(locale, "auth.showcase.statGrowthLabel") },
    { value: "78/100", label: t(locale, "auth.showcase.statHealthLabel") },
  ];

  return (
    <div
      className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-8 xl:p-10"
      style={{
        backgroundImage:
          "radial-gradient(120% 140% at 15% 0%, hsl(var(--primary) / 0.55), transparent 60%), radial-gradient(100% 100% at 100% 100%, hsl(var(--primary) / 0.22), transparent 55%), linear-gradient(180deg, hsl(var(--nabda-brand-void)), hsl(var(--nabda-brand-ink)))",
      }}
    >
      {/* Faint grid-line mask — same device as the marketing hero background. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(to bottom, black, transparent 85%)",
        }}
      />
      {/* Subtle grain overlay so the gradient doesn't band or look flat/plastic. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <p className="relative z-10 inline-flex items-center gap-2.5 font-mono text-xs font-semibold tracking-[0.14em] text-primary uppercase">
        <span aria-hidden className="h-px w-5 bg-primary" />
        {t(locale, "hero.eyebrow")}
      </p>

      <div className="relative z-10 flex flex-1 flex-col justify-center gap-4">
        <div className="max-w-lg">
          <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-balance text-foreground">
            {t(locale, "hero.titleBefore")}{" "}
            {locale === "en" ? (
              <em className="font-serif font-normal text-muted-foreground italic">{t(locale, "hero.titleEmphasis")}</em>
            ) : (
              t(locale, "hero.titleEmphasis")
            )}{" "}
            {t(locale, "hero.titleAfter")}
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-snug text-muted-foreground">{t(locale, "hero.subtitle")}</p>
        </div>

        {/* Live product-data panel — the "what Nabda AI is doing right now"
            device the client asked to lead with on this pane. */}
        <div className="max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.03] p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">{t(locale, "auth.showcase.engineTitle")}</p>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.1em] text-primary uppercase">
              <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-primary" />
              {t(locale, "auth.showcase.live")}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t(locale, "auth.showcase.analyzing")}</p>

          <div className="mt-2.5 flex flex-col gap-1">
            {modules.map((mod) => (
              <div key={mod.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-foreground">{mod.title}</p>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-success-bright/30 bg-success-bright/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-[0.08em] text-success-bright uppercase">
                    <span aria-hidden className="size-1 rounded-full bg-success-bright" />
                    {t(locale, "auth.showcase.active")}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{mod.desc}</p>
                <div aria-hidden className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/[0.08]">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${mod.progress}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2 text-center">
                <p className="nabda-numeral font-heading text-base font-extrabold text-foreground">{stat.value}</p>
                <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-center font-mono text-[9px] tracking-[0.1em] text-muted-foreground/70 uppercase">
            {t(locale, "auth.showcase.illustrative")}
          </p>
        </div>
      </div>

      <p className="relative z-10 font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">{t(locale, "trust.line")}</p>
    </div>
  );
}
