import Link from "next/link";
import {
  ArrowRight,
  Gauge,
  ShieldAlert,
  Shield,
  Sparkles,
  FileText,
  Brain,
  GraduationCap,
  Building2,
  TrendingUp,
  TrendingDown,
  Layers,
  Wallet,
  Users,
  Truck,
  Star,
  MessageSquare,
  Clock,
  CheckCircle,
  Database,
  Cpu,
  Lightbulb,
  ListChecks,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PricingPreviewPlans } from "@/components/marketing/pricing-preview-plans";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { getLivePricingPlans } from "@/lib/pricing-live";
import type { PricingPlan } from "@/lib/pricing";
import { getLocale } from "@/lib/get-locale";
import { t, type DictKey, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Rotating 4-color accent system used across capability/step cards — the
// bafarlabs "top accent + large faded corner icon" device (DESIGN_SPEC §7
// "01 — Landing"). Bright variants only touch icons/badges/borders, never
// small text, per the §1.2 contrast rule.
const ACCENTS = [
  { border: "border-t-primary", iconBg: "bg-primary/10", icon: "text-primary", dot: "bg-primary" },
  { border: "border-t-success-bright", iconBg: "bg-success-bright/10", icon: "text-success-bright", dot: "bg-success-bright" },
  { border: "border-t-insight-bright", iconBg: "bg-insight-bright/10", icon: "text-insight-bright", dot: "bg-insight-bright" },
  { border: "border-t-warning-bright", iconBg: "bg-warning-bright/10", icon: "text-warning-bright", dot: "bg-warning-bright" },
  // 5th entry only used by the 7-card capabilities grid below (existing
  // 4-item sections all index 0–3, so this doesn't change their colors).
  { border: "border-t-danger-bright", iconBg: "bg-danger-bright/10", icon: "text-danger-bright", dot: "bg-danger-bright" },
] as const;

const pipelineSteps = [
  { key: "data", icon: Database, title: "pipeline.step.data.title", body: "pipeline.step.data.body" },
  { key: "analysis", icon: Cpu, title: "pipeline.step.analysis.title", body: "pipeline.step.analysis.body" },
  { key: "insights", icon: Lightbulb, title: "pipeline.step.insights.title", body: "pipeline.step.insights.body" },
  { key: "prediction", icon: TrendingUp, title: "pipeline.step.prediction.title", body: "pipeline.step.prediction.body" },
  { key: "recommendations", icon: ListChecks, title: "pipeline.step.recommendations.title", body: "pipeline.step.recommendations.body" },
  { key: "action", icon: Rocket, title: "pipeline.step.action.title", body: "pipeline.step.action.body" },
] as const satisfies { key: string; icon: typeof Database; title: DictKey; body: DictKey }[];

const mvpSteps = [
  { key: "enter", title: "mvp.step.enter.title", body: "mvp.step.enter.body" },
  { key: "analyze", title: "mvp.step.analyze.title", body: "mvp.step.analyze.body" },
  { key: "report", title: "mvp.step.report.title", body: "mvp.step.report.body" },
] as const satisfies { key: string; title: DictKey; body: DictKey }[];

const capabilities = [
  { icon: TrendingUp, title: "capabilities.sales.title", body: "capabilities.sales.body" },
  { icon: Layers, title: "capabilities.inventory.title", body: "capabilities.inventory.body" },
  { icon: Wallet, title: "capabilities.cashFlow.title", body: "capabilities.cashFlow.body" },
  { icon: Users, title: "capabilities.customer.title", body: "capabilities.customer.body" },
  { icon: Truck, title: "capabilities.delivery.title", body: "capabilities.delivery.body" },
  { icon: Star, title: "capabilities.growth.title", body: "capabilities.growth.body" },
  { icon: MessageSquare, title: "capabilities.advisor.title", body: "capabilities.advisor.body" },
] as const satisfies { icon: typeof TrendingUp; title: DictKey; body: DictKey }[];

const mvpOutputs = [
  { icon: Shield, title: "mvp.output.risks.title", body: "mvp.output.risks.body" },
  { icon: TrendingUp, title: "mvp.output.opportunities.title", body: "mvp.output.opportunities.body" },
  { icon: Clock, title: "mvp.output.forecast.title", body: "mvp.output.forecast.body" },
  { icon: CheckCircle, title: "mvp.output.actionPlan.title", body: "mvp.output.actionPlan.body" },
] as const satisfies { icon: typeof TrendingUp; title: DictKey; body: DictKey }[];

const howSteps = [
  { key: "connect", title: "how.connect.title", body: "how.connect.body" },
  { key: "analyze", title: "how.analyze.title", body: "how.analyze.body" },
  { key: "understand", title: "how.understand.title", body: "how.understand.body" },
  { key: "act", title: "how.act.title", body: "how.act.body" },
] as const satisfies { key: string; title: DictKey; body: DictKey }[];

const features = [
  { icon: Gauge, title: "features.healthScore.title", body: "features.healthScore.body" },
  { icon: ShieldAlert, title: "features.riskOpportunity.title", body: "features.riskOpportunity.body" },
  { icon: Sparkles, title: "features.recommendations.title", body: "features.recommendations.body" },
  { icon: FileText, title: "features.reports.title", body: "features.reports.body" },
] as const satisfies { icon: typeof Gauge; title: DictKey; body: DictKey }[];

const solutions = [
  { icon: Brain, title: "solutions.aiSolutions.title", body: "solutions.aiSolutions.body", cta: "solutions.aiSolutions.cta", href: "/ai-solutions" },
  { icon: Sparkles, title: "solutions.consultation.title", body: "solutions.consultation.body", cta: "solutions.consultation.cta", href: "/consultation" },
  { icon: GraduationCap, title: "solutions.training.title", body: "solutions.training.body", cta: "solutions.training.cta", href: "/training" },
  { icon: Building2, title: "solutions.enterprise.title", body: "solutions.enterprise.body", cta: "solutions.enterprise.cta", href: "/enterprise" },
] as const satisfies { icon: typeof Brain; title: DictKey; body: DictKey; cta: DictKey; href: string }[];

const tickerKeys: DictKey[] = ["ticker.1", "ticker.2", "ticker.3", "ticker.4", "ticker.5", "ticker.6", "ticker.7", "ticker.8"];

export default async function LandingPage() {
  const [locale, plans] = await Promise.all([getLocale(), getLivePricingPlans()]);

  return (
    <>
      <HeroSection locale={locale} />
      <LogoTicker locale={locale} />
      <SolutionPipelineSection locale={locale} />
      <CapabilitiesSection locale={locale} />
      <MvpReportSection locale={locale} />
      <HowItWorksSection locale={locale} />
      <FeaturesSection locale={locale} />
      <SolutionsSection locale={locale} />
      <PricingPreviewSection locale={locale} plans={plans} />
      <ClosingCta locale={locale} />
    </>
  );
}

function Eyebrow({ locale, k }: { locale: Locale; k: DictKey }) {
  return (
    <p className="inline-flex items-center gap-2.5 font-mono text-xs font-semibold tracking-[0.14em] text-primary uppercase">
      <span aria-hidden className="h-px w-5 bg-primary" />
      {t(locale, k)}
    </p>
  );
}

function HeroSection({ locale }: { locale: Locale }) {
  return (
    <section className="relative overflow-hidden pt-20 pb-20 lg:pb-28">
      {/* Radial glow blobs + faint grid mask — DESIGN_SPEC §7 "01" hero background */}
      <div aria-hidden className="pointer-events-none absolute -top-40 -end-40 -z-10 size-[640px] rounded-full bg-primary/25 blur-[100px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -start-40 -z-10 size-[480px] rounded-full bg-success-bright/15 blur-[100px]" />
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
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <Eyebrow locale={locale} k="hero.eyebrow" />
            <h1 className="mt-5 text-4xl leading-tight font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {t(locale, "hero.titleBefore")}{" "}
              {locale === "en" ? (
                <em className="font-serif font-normal text-muted-foreground italic">{t(locale, "hero.titleEmphasis")}</em>
              ) : (
                t(locale, "hero.titleEmphasis")
              )}{" "}
              {t(locale, "hero.titleAfter")}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{t(locale, "hero.subtitle")}</p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
              <Button render={<Link href="/signup" />} size="lg" className="shadow-glow-primary">
                {t(locale, "hero.ctaPrimary")}
                <ArrowRight aria-hidden className="size-4 icon-directional" />
              </Button>
              <Button render={<Link href="#how-it-works" />} size="lg" variant="outline">
                {t(locale, "hero.ctaSecondary")}
              </Button>
            </div>
            <p className="mt-8 font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">{t(locale, "trust.line")}</p>
          </div>

          <HeroProductPreview locale={locale} />
        </div>
      </div>
    </section>
  );
}

// The bafarlabs "console mockup" device — a tabbed preview (Risks /
// Opportunities / Action Plan / Advisor) of the real product, built from
// the app's actual seeded demo copy (health score 78, the real demo
// risk/opportunity/recommendation narrative and the real AI Analyst
// suggested question), not a decorative illustration. `Tabs` is already a
// client-boundary component internally (see components/ui/tabs.tsx), so
// this stays a plain server-rendered function — no client wrapper needed.
function HeroProductPreview({ locale }: { locale: Locale }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card/60 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2">
          <span aria-hidden className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
          <span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
            {t(locale, "heroMock.eyebrow")}
          </span>
        </div>
        <Badge variant="outline" className="font-mono text-[10px] text-primary">
          {t(locale, "heroMock.badge")}
        </Badge>
      </div>

      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full border-4 border-success-bright/30">
          <span className="nabda-numeral font-heading text-xl font-extrabold">78</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-success-bright">{t(locale, "dashboard.healthScore.band.strong")}</p>
          <p className="text-xs text-muted-foreground">{t(locale, "dashboard.healthScore.title")}</p>
        </div>
        <div className="ms-auto text-end">
          <p className="nabda-numeral font-mono text-base font-bold">1,240,000</p>
          <p className="font-mono text-[10px] text-muted-foreground uppercase">SAR · +12.4%</p>
        </div>
      </div>

      <Tabs defaultValue="action">
        <TabsList className="mx-5 grid grid-cols-4">
          <TabsTrigger value="risks" className="text-xs">
            {t(locale, "insights.tab.risks")}
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="text-xs">
            {t(locale, "insights.tab.opportunities")}
          </TabsTrigger>
          <TabsTrigger value="action" className="text-xs">
            {t(locale, "heroMock.tab.action")}
          </TabsTrigger>
          <TabsTrigger value="advisor" className="text-xs">
            {t(locale, "heroMock.tab.advisor")}
          </TabsTrigger>
        </TabsList>

        <div className="px-5 pt-4 pb-5">
          <TabsContent value="risks">
            <MockRow icon={TrendingDown} tone="danger" name={t(locale, "heroMock.risk1.name")} confidence={t(locale, "insights.severity.high")} action={t(locale, "heroMock.risk1.action")} />
            <MockRow icon={TrendingDown} tone="danger" name={t(locale, "heroMock.risk2.name")} confidence={t(locale, "insights.severity.medium")} action={t(locale, "heroMock.risk2.action")} />
            <MockFooter locale={locale} />
          </TabsContent>

          <TabsContent value="opportunities">
            <MockRow icon={TrendingUp} tone="success" name={t(locale, "heroMock.opp1.name")} confidence={t(locale, "insights.severity.high")} action={t(locale, "heroMock.opp1.action")} />
            <MockRow icon={TrendingUp} tone="success" name={t(locale, "heroMock.opp2.name")} confidence={t(locale, "insights.severity.medium")} action={t(locale, "heroMock.opp2.action")} />
            <MockFooter locale={locale} />
          </TabsContent>

          <TabsContent value="action">
            <ol className="flex flex-col gap-2">
              {(["heroMock.action.step1", "heroMock.action.step2", "heroMock.action.step3", "heroMock.action.step4"] as const).map(
                (key, i) => (
                  <li key={key} className="flex items-start gap-2.5 rounded-lg bg-accent/40 p-2.5 text-xs">
                    <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-foreground/90">{t(locale, key)}</span>
                  </li>
                )
              )}
            </ol>
            <MockFooter locale={locale} />
          </TabsContent>

          <TabsContent value="advisor">
            <div className="flex flex-col gap-2">
              <p className="ms-auto max-w-[85%] rounded-xl rounded-ee-sm bg-primary/15 px-3 py-2 text-xs font-medium">
                {t(locale, "heroMock.advisor.question")}
              </p>
              <p className="max-w-[90%] rounded-xl rounded-ss-sm bg-accent/50 px-3 py-2 text-xs leading-relaxed text-foreground/90">
                {t(locale, "heroMock.advisor.answer")}
              </p>
            </div>
            <MockFooter locale={locale} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function MockRow({
  icon: Icon,
  tone,
  name,
  confidence,
  action,
}: {
  icon: typeof TrendingUp;
  tone: "danger" | "success";
  name: string;
  confidence: string;
  action: string;
}) {
  return (
    <div className={cn("mb-2 flex items-start gap-2.5 rounded-lg p-2.5", tone === "danger" ? "bg-danger-bright/10" : "bg-success-bright/10")}>
      <Icon aria-hidden className={cn("mt-0.5 size-4 shrink-0", tone === "danger" ? "text-danger-bright" : "text-success-bright")} />
      <div className="min-w-0 flex-1">
        <p className="text-xs leading-snug font-medium text-foreground/90">{name}</p>
        <p className={cn("mt-0.5 text-[11px]", tone === "danger" ? "text-danger" : "text-success")}>
          {confidence} · {action}
        </p>
      </div>
    </div>
  );
}

function MockFooter({ locale }: { locale: Locale }) {
  return <p className="mt-3 border-t border-white/[0.06] pt-3 text-[11px] text-muted-foreground">{t(locale, "heroMock.footer")}</p>;
}

function LogoTicker({ locale }: { locale: Locale }) {
  return (
    <div className="border-y border-border/60 bg-card/30 py-4 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max animate-[ticker_32s_linear_infinite] motion-reduce:animate-none ticker-track">
        {[0, 1].map((dup) => (
          <div key={dup} aria-hidden={dup === 1} className="flex shrink-0 items-center">
            {tickerKeys.map((k) => (
              <span
                key={`${dup}-${k}`}
                className="border-e border-border/60 px-6 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase whitespace-nowrap"
              >
                {t(locale, k)}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Shared "card → arrow → card → …" ordered flow used by both the 6-step
// solution pipeline and the 3-step MVP flow below — same visual device,
// just a different step count. Horizontal row on desktop (`ArrowRight` +
// `icon-directional` so it mirrors under `dir="rtl"`), stacked column with
// a plain down-chevron on mobile (direction-agnostic, no RTL variant
// needed). Semantic `<ol>` — arrows are `aria-hidden` decoration.
// The Data → Action pipeline is a genuine ordered sequence, so it earns
// numbered stages + a connecting rail (frontend-design: numbering only when
// content really is a sequence). Each stage carries its own accent + icon so
// the six read as distinct stations on a line, not six identical cards. The
// rail is a single hairline the icon tiles sit on; RTL mirrors via the grid
// and the icon-directional connectors.
function PipelineFlow({ locale }: { locale: Locale }) {
  return (
    <ol className="relative grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-6">
      {/* Desktop rail: one hairline the icon tiles sit on, fading at both ends. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
      />
      {pipelineSteps.map((step, index) => {
        const accent = ACCENTS[index % ACCENTS.length];
        const Icon = step.icon;
        return (
          <li key={step.key} className="relative flex flex-col items-center text-center lg:items-start lg:text-start">
            {/* Icon tile sits on the rail; ring in the section bg masks the line behind it. */}
            <span
              className={cn(
                "relative z-10 flex size-14 items-center justify-center rounded-2xl ring-8 ring-background transition-transform duration-300 ease-nabda",
                accent.iconBg,
                accent.icon
              )}
            >
              <Icon aria-hidden className="size-6" />
              <span className="absolute -end-1 -top-1 flex size-5 items-center justify-center rounded-full border border-border bg-card font-mono text-[10px] font-bold text-muted-foreground">
                {index + 1}
              </span>
            </span>
            <h3 className="mt-4 font-heading text-sm font-bold tracking-tight">{t(locale, step.title)}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-balance text-muted-foreground lg:text-pretty">
              {t(locale, step.body)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

// "The Nabda AI Solution" — client deck §8. Dark section (ambient
// `.theme-marketing`, same as Features/Solutions below — no override
// needed here since dark is the default marketing tone).
function SolutionPipelineSection({ locale }: { locale: Locale }) {
  return (
    <section className="theme-cream bg-background py-16 text-foreground md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <Eyebrow locale={locale} k="pipeline.eyebrow" />
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {t(locale, "pipeline.headingBefore")}{" "}
            {locale === "en" ? (
              <em className="font-serif font-normal text-muted-foreground italic">{t(locale, "pipeline.headingEmphasis")}</em>
            ) : (
              t(locale, "pipeline.headingEmphasis")
            )}{" "}
            {t(locale, "pipeline.headingAfter")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t(locale, "pipeline.subtitle")}</p>
        </div>
        <PipelineFlow locale={locale} />
      </div>
    </section>
  );
}

// "Seven analytical capabilities" — client deck "Core Functions". Reuses
// the existing FeatureCard + ACCENTS rotation exactly like FeaturesSection
// below, just with 7 items in a 3/2/1-col grid.
function CapabilitiesSection({ locale }: { locale: Locale }) {
  return (
    <section id="capabilities" className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHead locale={locale} eyebrowKey="capabilities.eyebrow" headingKey="capabilities.heading" />
        {/* Asymmetric bento (design-taste variance 8): the natural-language
            Advisor — the product's signature — anchors the section as a tall
            feature tile on the inline-start side; the six analytical functions
            fill a 3×2 grid beside it. On a 6-col track the advisor spans 2×3
            and each function spans 2, so it resolves to a clean rectangle with
            no orphan cells. Collapses to single-column on mobile. */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 lg:auto-rows-fr">
          <AdvisorFeatureCard locale={locale} className="md:col-span-2 lg:col-span-2 lg:row-span-3" />
          {capabilities.slice(0, 6).map((capability, i) => (
            <FeatureCard
              key={capability.title}
              locale={locale}
              index={i}
              icon={capability.icon}
              title={capability.title}
              body={capability.body}
              className="lg:col-span-2"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// The 7th capability — the natural-language advisor — is the product's
// signature, so it gets a wider, richer treatment than the six analytical
// cards: real example questions shown as structured prompt rows (not a chat
// bubble UI — keeps the "BI platform, not a chatbot" positioning).
function AdvisorFeatureCard({ locale, className }: { locale: Locale; className?: string }) {
  const prompts = ["capabilities.advisor.prompt1", "capabilities.advisor.prompt2", "capabilities.advisor.prompt3"] as const;
  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-primary/25 bg-card p-6 shadow-sm transition-[transform,box-shadow] duration-300 ease-nabda hover:-translate-y-0.5 md:p-8 dark:shadow-[0_28px_60px_-28px_rgba(0,0,0,0.9)]",
        className
      )}
    >
      {/* Ambient primary glow + top-edge refraction highlight (glass material). */}
      <div aria-hidden className="pointer-events-none absolute -end-16 -top-24 size-72 rounded-full bg-primary/20 blur-[90px]" />
      <span aria-hidden className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <MessageSquare aria-hidden className="pointer-events-none absolute -end-8 -bottom-10 size-48 text-primary opacity-[0.06]" />

      <span className="relative flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 ring-inset">
        <MessageSquare aria-hidden className="size-6" />
      </span>
      <p className="relative mt-5 font-mono text-xs font-semibold tracking-[0.14em] text-primary uppercase">
        {t(locale, "capabilities.advisor.eyebrow")}
      </p>
      <h3 className="relative mt-2 font-heading text-2xl font-extrabold tracking-tight">{t(locale, "capabilities.advisor.title")}</h3>
      <p className="relative mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{t(locale, "capabilities.advisor.body")}</p>

      {/* Example questions as structured prompt rows, anchored to the bottom of
          the tall tile (mt-auto). Not chat bubbles — keeps the BI positioning. */}
      <ul className="relative mt-auto flex flex-col gap-2.5 pt-6">
        {prompts.map((p) => (
          <li
            key={p}
            className="flex items-center gap-3 rounded-xl border border-border bg-background/50 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors hover:border-primary/40"
          >
            <Sparkles aria-hidden className="size-4 shrink-0 text-primary" />
            <span className="text-sm text-foreground">{t(locale, p)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// "Enter data. Get a Business Intelligence Report." — the MVP/product-flow
// slide, owner point of view. Light `.theme-cream` section, same treatment
// as HowItWorksSection below.
// Asymmetric split (design-taste, anti-slop): rather than a centered header +
// a row of four identical output cards, the section tells its own story — the
// left column is the input→analyze→report narrative as a vertical stepper, and
// the right column shows WHAT YOU GET: a sample Business Intelligence Report
// artifact whose sections ARE the four outputs. Shows the product instead of
// listing it.
function MvpReportSection({ locale }: { locale: Locale }) {
  return (
    <section className="theme-cream bg-background py-16 text-foreground md:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 md:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16 lg:px-8">
        <div>
          <Eyebrow locale={locale} k="mvp.eyebrow" />
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
            {t(locale, "mvp.headingBefore")}{" "}
            {locale === "en" ? (
              <em className="font-serif font-normal text-muted-foreground italic">{t(locale, "mvp.headingEmphasis")}</em>
            ) : (
              t(locale, "mvp.headingEmphasis")
            )}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{t(locale, "mvp.subtitle")}</p>

          {/* Input → analyze → report, as a vertical stepper with a connecting rail. */}
          <ol className="relative mt-8">
            <div aria-hidden className="absolute inset-y-2 start-[15px] w-px bg-border" />
            {mvpSteps.map((step, index) => {
              const accent = ACCENTS[index % ACCENTS.length];
              return (
                <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
                  <span
                    className={cn(
                      "relative z-10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ring-4 ring-background",
                      accent.iconBg,
                      accent.icon
                    )}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-heading text-sm font-bold tracking-tight">{t(locale, step.title)}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(locale, step.body)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <ReportPreview locale={locale} />
      </div>
    </section>
  );
}

// The "what you receive" artifact — a stylized BI report document. Its four
// rows are the mvpOutputs, presented as sections of one report (divided by
// hairlines) rather than four detached cards.
function ReportPreview({ locale }: { locale: Locale }) {
  return (
    <div className="relative rounded-2xl border border-border bg-card shadow-[0_28px_60px_-30px_rgba(0,0,0,0.28)]">
      <span aria-hidden className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
      {/* Document title bar */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="size-2 rounded-full bg-primary" />
          <span className="font-mono text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            {t(locale, "mvp.step.report.title")}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-2.5 py-1">
          <span className="text-[10px] font-medium text-muted-foreground">{t(locale, "mvp.report.healthLabel")}</span>
          <span className="nabda-numeral font-heading text-xs font-extrabold text-success">78/100</span>
        </div>
      </div>
      {/* Report sections = the four outputs */}
      <ul className="divide-y divide-border">
        {mvpOutputs.map((output, i) => {
          const accent = ACCENTS[i % ACCENTS.length];
          const Icon = output.icon;
          return (
            <li key={output.title} className="flex items-start gap-4 px-5 py-4">
              <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", accent.iconBg, accent.icon)}>
                <Icon aria-hidden className="size-4.5" />
              </span>
              <div>
                <h3 className="font-heading text-sm font-bold tracking-tight">{t(locale, output.title)}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(locale, output.body)}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-border px-5 py-3">
        <p className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground">{t(locale, "mvp.report.footer")}</p>
      </div>
    </div>
  );
}

function HowItWorksSection({ locale }: { locale: Locale }) {
  return (
    <section id="how-it-works" className="theme-cream scroll-mt-20 bg-background py-16 text-foreground md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHead locale={locale} eyebrowKey="how.eyebrow" headingKey="how.heading" />
        <ol className="grid gap-4 lg:grid-cols-4">
          {howSteps.map((step, index) => {
            const accent = ACCENTS[index % ACCENTS.length];
            return (
              <li key={step.key} className="relative overflow-hidden rounded-xl border border-border bg-card p-6">
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full font-mono text-xs font-bold",
                    accent.iconBg,
                    accent.icon
                  )}
                >
                  0{index + 1}
                </span>
                <h3 className="mt-4 font-heading text-base font-bold">{t(locale, step.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(locale, step.body)}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function FeatureCard({
  locale,
  index,
  icon: Icon,
  title,
  body,
  className,
}: {
  locale: Locale;
  index: number;
  icon: typeof Gauge;
  title: DictKey;
  body: DictKey;
  className?: string;
}) {
  const accent = ACCENTS[index % ACCENTS.length];
  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border border-t-2 bg-card p-6 shadow-sm transition-[transform,box-shadow] duration-300 ease-nabda hover:-translate-y-0.5 dark:shadow-[0_24px_50px_-28px_rgba(0,0,0,0.85)]",
        accent.border,
        className
      )}
    >
      {/* Material lift (dark only): a faint top-down sheen + bright top edge so
          the card reads as a raised panel over the midnight wash instead of a
          flat black rectangle. Harmless on the light MVP cards (dark: gated). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{ backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.012) 34%, transparent 60%)" }}
      />
      <span aria-hidden className="pointer-events-none absolute inset-x-5 top-0 hidden h-px bg-gradient-to-r from-transparent via-white/25 to-transparent dark:block" />
      <Icon aria-hidden className={cn("pointer-events-none absolute -end-3 -bottom-3 size-28 opacity-[0.07]", accent.icon)} />
      <span className={cn("relative flex size-10 items-center justify-center rounded-lg", accent.iconBg, accent.icon)}>
        <Icon aria-hidden className="size-5" />
      </span>
      <h3 className="relative mt-3 font-heading text-base font-bold">{t(locale, title)}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{t(locale, body)}</p>
    </div>
  );
}

// Anti-slop: not four identical feature cards in a row. A large signature
// tile leads with the product's hallmark output — the Business Health Score —
// and the remaining three features are a grouped, hairline-divided list rather
// than detached boxes. Different bento shape than CapabilitiesSection so the
// two dark sections don't read as the same layout twice.
function FeaturesSection({ locale }: { locale: Locale }) {
  const [signature, ...rest] = features;
  const SignatureIcon = signature.icon;
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHead locale={locale} eyebrowKey="features.eyebrow" headingKey="features.heading" />
        <div className="grid gap-4 lg:grid-cols-5 lg:items-stretch">
          {/* Signature tile: the Business Health Score as a real metric. */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border border-t-2 border-t-primary bg-card p-8 shadow-sm transition-[transform,box-shadow] duration-300 ease-nabda hover:-translate-y-0.5 lg:col-span-3 dark:shadow-[0_28px_60px_-30px_rgba(0,0,0,0.9)]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 hidden dark:block"
              style={{ backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.012) 34%, transparent 60%)" }}
            />
            <span aria-hidden className="pointer-events-none absolute inset-x-6 top-0 hidden h-px bg-gradient-to-r from-transparent via-white/25 to-transparent dark:block" />
            <div aria-hidden className="pointer-events-none absolute -end-16 -top-24 size-72 rounded-full bg-primary/15 blur-[90px]" />

            <span className="relative flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SignatureIcon aria-hidden className="size-5" />
            </span>
            <h3 className="relative mt-4 font-heading text-lg font-bold tracking-tight">{t(locale, signature.title)}</h3>
            <p className="relative mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{t(locale, signature.body)}</p>

            <div className="relative mt-auto pt-8">
              <div className="flex items-end gap-2">
                <span className="nabda-numeral font-heading text-6xl leading-none font-extrabold">78</span>
                <span className="mb-1 font-heading text-xl font-bold text-muted-foreground">/100</span>
                <span className="mb-1.5 ms-1 text-xs text-muted-foreground">{t(locale, "mvp.report.healthLabel")}</span>
              </div>
              <div aria-hidden className="mt-3 h-2 w-full overflow-hidden rounded-full bg-foreground/10">
                <div className="h-full rounded-full bg-primary" style={{ width: "78%" }} />
              </div>
            </div>
          </div>

          {/* The other three features, grouped as one divided panel. */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:col-span-2 dark:shadow-[0_28px_60px_-30px_rgba(0,0,0,0.9)]">
            <span aria-hidden className="pointer-events-none absolute inset-x-6 top-0 hidden h-px bg-gradient-to-r from-transparent via-white/25 to-transparent dark:block" />
            <ul className="flex h-full flex-col divide-y divide-border">
              {rest.map((feature, idx) => {
                const accent = ACCENTS[(idx + 1) % ACCENTS.length];
                const Icon = feature.icon;
                return (
                  <li key={feature.title} className="flex flex-1 items-start gap-4 p-6">
                    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", accent.iconBg, accent.icon)}>
                      <Icon aria-hidden className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-heading text-sm font-bold tracking-tight">{t(locale, feature.title)}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(locale, feature.body)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function SolutionsSection({ locale }: { locale: Locale }) {
  return (
    <section id="solutions" className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHead locale={locale} eyebrowKey="solutions.eyebrow" headingKey="solutions.heading" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {solutions.map((solution, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <div
                key={solution.title}
                className={cn(
                  "relative flex h-full flex-col overflow-hidden rounded-xl border border-border border-t-2 bg-card p-6",
                  accent.border
                )}
              >
                <solution.icon aria-hidden className={cn("pointer-events-none absolute -end-3 -bottom-3 size-28 opacity-[0.07]", accent.icon)} />
                <span className={cn("relative flex size-10 items-center justify-center rounded-lg", accent.iconBg, accent.icon)}>
                  <solution.icon aria-hidden className="size-5" />
                </span>
                <h3 className="relative mt-3 font-heading text-base font-bold">{t(locale, solution.title)}</h3>
                <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{t(locale, solution.body)}</p>
                <Link
                  href={solution.href}
                  className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t(locale, solution.cta)}
                  <ArrowRight aria-hidden className="size-3.5 icon-directional" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PricingPreviewSection({ locale, plans }: { locale: Locale; plans: PricingPlan[] }) {
  return (
    <section className="theme-cream bg-background py-16 text-foreground md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHead locale={locale} eyebrowKey="pricingPreview.eyebrow" headingKey="pricingPreview.heading" />
        <PricingPreviewPlans locale={locale} plans={plans} />
        <div className="mt-8 text-center">
          <Button render={<Link href="/pricing" />} size="lg" variant="outline">
            {t(locale, "pricingPreview.viewPlans")}
          </Button>
        </div>
      </div>
    </section>
  );
}


function SectionHead({ locale, eyebrowKey, headingKey }: { locale: Locale; eyebrowKey: DictKey; headingKey: DictKey }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
      <p className="inline-flex items-center gap-2.5 font-mono text-xs font-semibold tracking-[0.14em] text-primary uppercase">
        <span aria-hidden className="h-px w-5 bg-primary" />
        {t(locale, eyebrowKey)}
      </p>
      <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{t(locale, headingKey)}</h2>
    </div>
  );
}
