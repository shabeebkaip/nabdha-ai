import Link from "next/link";
import type { Metadata } from "next";
import { FileText, Presentation, TrendingUp, Cpu, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocale } from "@/lib/get-locale";
import { t, type DictKey, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "AI Solutions — Nabda AI" };

const ACCENTS = [
  { border: "border-t-primary", iconBg: "bg-primary/10", icon: "text-primary" },
  { border: "border-t-success-bright", iconBg: "bg-success-bright/10", icon: "text-success-bright" },
  { border: "border-t-insight-bright", iconBg: "bg-insight-bright/10", icon: "text-insight-bright" },
  { border: "border-t-warning-bright", iconBg: "bg-warning-bright/10", icon: "text-warning-bright" },
  { border: "border-t-primary", iconBg: "bg-primary/10", icon: "text-primary" },
] as const;

const items = [
  { icon: FileText, title: "aiSolutions.reports.title", body: "aiSolutions.reports.body" },
  { icon: Presentation, title: "aiSolutions.presentations.title", body: "aiSolutions.presentations.body" },
  { icon: TrendingUp, title: "aiSolutions.forecasting.title", body: "aiSolutions.forecasting.body" },
  { icon: Cpu, title: "aiSolutions.modeling.title", body: "aiSolutions.modeling.body" },
  { icon: Puzzle, title: "aiSolutions.customAi.title", body: "aiSolutions.customAi.body" },
] as const satisfies { icon: typeof FileText; title: DictKey; body: DictKey }[];

export default async function AiSolutionsPage() {
  const locale = await getLocale();
  return (
    <>
      <section className="pt-16 pb-8 text-center md:pt-24">
        <div className="mx-auto max-w-2xl px-4 md:px-6 lg:px-8">
          <Eyebrow locale={locale} />
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{t(locale, "aiSolutions.heading")}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{t(locale, "aiSolutions.subtitle")}</p>
        </div>
      </section>
      <section className="pb-20 md:pb-28">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 md:px-6 lg:grid-cols-3 lg:px-8">
          {items.map((item, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <div key={item.title} className={cn("flex flex-col rounded-xl border border-border border-t-2 bg-card p-6", accent.border)}>
                <span className={cn("flex size-10 items-center justify-center rounded-lg", accent.iconBg, accent.icon)}>
                  <item.icon aria-hidden className="size-5" />
                </span>
                <h2 className="mt-3 font-heading text-base font-bold">{t(locale, item.title)}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(locale, item.body)}</p>
              </div>
            );
          })}
          <div className="flex flex-col items-start justify-center rounded-xl border border-dashed border-border p-6">
            <p className="text-sm text-muted-foreground">
              {t(locale, "aiSolutions.subtitle")}
            </p>
            <Button render={<Link href="/signup" />} size="lg" className="mt-4 shadow-glow-primary">
              {t(locale, "aiSolutions.cta")}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function Eyebrow({ locale }: { locale: Locale }) {
  return (
    <p className="inline-flex items-center gap-2.5 font-mono text-xs font-semibold tracking-[0.14em] text-primary uppercase">
      <span aria-hidden className="h-px w-5 bg-primary" />
      {t(locale, "aiSolutions.eyebrow")}
    </p>
  );
}
