import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Check, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Shared building blocks for the four service pages (Consultation / Training /
// Integration / Enterprise). Each page picks ONE accent so it reads as its own
// surface, then composes these primitives with its own hero device and its own
// choice of sections — the kit keeps the craft (glow, rail, glass, RTL arrows)
// consistent without making the four pages look like the same template.
// Components take already-translated strings so callers keep the t(locale,key)
// pattern used everywhere else; `locale` is only needed where layout differs by
// direction (the serif-italic emphasis is Latin-only).

export type Accent = "primary" | "success" | "insight" | "warning";

// Bright accent tokens (globals.css): touch icons/borders/glows only, never
// small body text — matches the landing page's contrast rule.
export const ACCENT: Record<Accent, { text: string; bg: string; border: string; ring: string; glow: string; grad: string }> = {
  primary: { text: "text-primary", bg: "bg-primary/10", border: "border-t-primary", ring: "ring-primary/20", glow: "bg-primary/20", grad: "via-primary/40" },
  success: { text: "text-success-bright", bg: "bg-success-bright/10", border: "border-t-success-bright", ring: "ring-success-bright/20", glow: "bg-success-bright/20", grad: "via-success-bright/40" },
  insight: { text: "text-insight-bright", bg: "bg-insight-bright/10", border: "border-t-insight-bright", ring: "ring-insight-bright/20", glow: "bg-insight-bright/20", grad: "via-insight-bright/40" },
  warning: { text: "text-warning-bright", bg: "bg-warning-bright/10", border: "border-t-warning-bright", ring: "ring-warning-bright/20", glow: "bg-warning-bright/20", grad: "via-warning-bright/40" },
};

export function Eyebrow({ accent, children }: { accent: Accent; children: ReactNode }) {
  const a = ACCENT[accent];
  return (
    <p className={cn("inline-flex items-center gap-2.5 font-mono text-xs font-semibold tracking-[0.14em] uppercase", a.text)}>
      <span aria-hidden className={cn("h-px w-5", a.bg.replace("/10", ""))} />
      {children}
    </p>
  );
}

export function SectionHead({ accent, eyebrow, heading }: { accent: Accent; eyebrow: string; heading: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
      <Eyebrow accent={accent}>{eyebrow}</Eyebrow>
      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">{heading}</h2>
    </div>
  );
}

export function ServiceHero({
  locale,
  accent,
  eyebrow,
  before,
  emphasis,
  after,
  subtitle,
  bullets,
  ctaLabel,
  note,
  aside,
}: {
  locale: Locale;
  accent: Accent;
  eyebrow: string;
  before: string;
  emphasis: string;
  after: string;
  subtitle: string;
  bullets: string[];
  ctaLabel: string;
  note: string;
  aside: ReactNode;
}) {
  const a = ACCENT[accent];
  return (
    <section className="relative overflow-hidden pt-16 pb-16 lg:pt-20 lg:pb-24">
      {/* Accent glow blobs + faint grid mask — same hero background device as the landing page, tinted to this page's accent. */}
      <div aria-hidden className={cn("pointer-events-none absolute -top-40 -end-40 -z-10 size-[620px] rounded-full blur-[110px]", a.glow)} />
      <div aria-hidden className="pointer-events-none absolute -bottom-48 -start-40 -z-10 size-[460px] rounded-full bg-primary/10 blur-[110px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(to bottom, black, transparent 85%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <Eyebrow accent={accent}>{eyebrow}</Eyebrow>
            <h1 className="mt-5 text-4xl leading-tight font-extrabold tracking-tight text-balance sm:text-5xl">
              {before}{" "}
              {locale === "en" ? (
                <em className="font-serif font-normal text-muted-foreground italic">{emphasis}</em>
              ) : (
                emphasis
              )}
              {after}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{subtitle}</p>

            <ul className="mt-7 flex flex-col gap-2.5">
              {bullets.map((b) => (
                <li key={b} className="flex items-center gap-3 text-sm text-foreground/90">
                  <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full", a.bg, a.text)}>
                    <Check aria-hidden className="size-3" strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button render={<Link href="#lead" />} size="lg" className="shadow-glow-primary">
                {ctaLabel}
                <ArrowRight aria-hidden className="size-4 icon-directional" />
              </Button>
              <span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">{note}</span>
            </div>
          </div>

          {aside}
        </div>
      </div>
    </section>
  );
}

// Card grid used for benefit / capability sections. `cols` picks 2- or 3-up on
// desktop; each card rotates through nothing — it takes the page's single
// accent, since the whole page is that one colour.
export function BenefitGrid({
  accent,
  items,
  cols = 3,
}: {
  accent: Accent;
  items: { icon: LucideIcon; title: string; body: string }[];
  cols?: 2 | 3;
}) {
  const a = ACCENT[accent];
  return (
    <div className={cn("mx-auto grid max-w-6xl gap-4", cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2")}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-2xl border border-border border-t-2 bg-card p-6 shadow-sm transition-[transform,box-shadow] duration-300 ease-nabda hover:-translate-y-0.5 dark:shadow-[0_24px_50px_-28px_rgba(0,0,0,0.85)]",
              a.border
            )}
          >
            <span aria-hidden className="pointer-events-none absolute inset-x-5 top-0 hidden h-px bg-gradient-to-r from-transparent via-white/25 to-transparent dark:block" />
            <Icon aria-hidden className={cn("pointer-events-none absolute -end-3 -bottom-3 size-28 opacity-[0.07]", a.text)} />
            <span className={cn("relative flex size-10 items-center justify-center rounded-lg", a.bg, a.text)}>
              <Icon aria-hidden className="size-5" />
            </span>
            <h3 className="relative mt-3 font-heading text-base font-bold">{item.title}</h3>
            <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </div>
        );
      })}
    </div>
  );
}

// Numbered process rail — a genuine ordered sequence, so it earns the numbers
// and the connecting hairline (frontend-design: number only real sequences).
export function ProcessSteps({ accent, steps }: { accent: Accent; steps: { title: string; body: string }[] }) {
  const a = ACCENT[accent];
  return (
    <ol className="relative mx-auto grid max-w-6xl gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />
      {steps.map((step, i) => (
        <li key={step.title} className="relative flex flex-col items-center text-center lg:items-start lg:text-start">
          <span className={cn("relative z-10 flex size-14 items-center justify-center rounded-2xl font-heading text-lg font-extrabold ring-8 ring-background", a.bg, a.text)}>
            {i + 1}
          </span>
          <h3 className="mt-4 font-heading text-sm font-bold tracking-tight">{step.title}</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-balance text-muted-foreground lg:text-pretty">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function StatBand({ accent, stats }: { accent: Accent; stats: { value: string; label: string }[] }) {
  const a = ACCENT[accent];
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col items-center gap-1 bg-card px-4 py-8 text-center">
          <span className={cn("nabda-numeral font-heading text-3xl font-extrabold tracking-tight md:text-4xl", a.text)}>{s.value}</span>
          <span className="text-xs leading-snug text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// The conversion section: a persuasion panel (checklist + note) beside the
// LeadForm passed as children. `id="lead"` is the hero CTA's scroll target.
export function FormSection({
  accent,
  eyebrow,
  heading,
  subtitle,
  checklist,
  note,
  included,
  children,
}: {
  accent: Accent;
  eyebrow: string;
  heading: string;
  subtitle: string;
  checklist: string[];
  note: string;
  included: string;
  children: ReactNode;
}) {
  const a = ACCENT[accent];
  return (
    <section id="lead" className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:px-6 lg:grid-cols-2 lg:items-start lg:gap-16 lg:px-8">
        <div className="lg:pt-6">
          <Eyebrow accent={accent}>{eyebrow}</Eyebrow>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">{heading}</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{subtitle}</p>

          <div className="relative mt-8 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm dark:shadow-[0_24px_50px_-28px_rgba(0,0,0,0.85)]">
            <div aria-hidden className={cn("pointer-events-none absolute -end-16 -top-20 size-56 rounded-full blur-[80px]", a.glow)} />
            <span aria-hidden className={cn("pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent to-transparent", a.grad)} />
            <p className="relative font-mono text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">{included}</p>
            <ul className="relative mt-4 flex flex-col gap-3">
              {checklist.map((c) => (
                <li key={c} className="flex items-start gap-3 text-sm text-foreground/90">
                  <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full", a.bg, a.text)}>
                    <Check aria-hidden className="size-3" strokeWidth={3} />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
            <p className="relative mt-5 border-t border-border pt-4 text-xs text-muted-foreground">{note}</p>
          </div>
        </div>

        <div className="lg:sticky lg:top-24">{children}</div>
      </div>
    </section>
  );
}

// Small labelled bilingual helper for the hero aside "product device" cards.
export function AsideKV({ label, value, accent }: { label: string; value: string; accent?: Accent }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold", accent ? ACCENT[accent].text : "text-foreground")}>{value}</span>
    </div>
  );
}

export { t };
