import { AlertTriangle, TrendingUp, LineChart, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { t, type DictKey, type Locale } from "@/lib/i18n";
import type { Insight, Severity } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

const kindIcon = { risk: AlertTriangle, opportunity: TrendingUp, trend: LineChart, recommendation: Sparkles } as const;
const kindLabelKey: Record<Insight["kind"], DictKey> = {
  risk: "insights.kind.risk",
  opportunity: "insights.kind.opportunity",
  trend: "insights.kind.trend",
  recommendation: "insights.kind.recommendation",
};
const kindColor: Record<Insight["kind"], string> = {
  risk: "text-danger",
  opportunity: "text-success",
  trend: "text-muted-foreground",
  recommendation: "text-insight",
};

export function SeverityBadge({ severity, locale }: { severity: Severity; locale: Locale }) {
  if (severity === "high") {
    return <Badge className="bg-destructive text-destructive-foreground">{t(locale, "insights.severity.high")}</Badge>;
  }
  if (severity === "medium") {
    return (
      <Badge variant="outline" className="border-warning/40 text-warning">
        {t(locale, "insights.severity.medium")}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
      {t(locale, "insights.severity.low")}
    </Badge>
  );
}

export function InsightCard({ insight, locale }: { insight: Insight; locale: Locale }) {
  const Icon = kindIcon[insight.kind];
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon aria-hidden className={cn("size-4 shrink-0", kindColor[insight.kind])} />
          <span className={cn("text-xs font-semibold uppercase tracking-wide", kindColor[insight.kind])}>
            {t(locale, kindLabelKey[insight.kind])}
          </span>
        </div>
        <SeverityBadge severity={insight.severity} locale={locale} />
      </div>
      <h3 className="mt-3 font-heading text-base font-bold">{insight.title}</h3>
      <Accordion className="mt-1">
        <AccordionItem value="details">
          <AccordionTrigger className="text-sm text-primary hover:no-underline">
            {t(locale, "insights.field.whatHappened")}
          </AccordionTrigger>
          <AccordionContent>
            <dl className="flex flex-col gap-3 text-sm">
              <div>
                <dt className="font-medium text-foreground">{t(locale, "insights.field.whatHappened")}</dt>
                <dd className="mt-0.5 text-muted-foreground">{insight.whatHappened}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">{t(locale, "insights.field.why")}</dt>
                <dd className="mt-0.5 text-muted-foreground">{insight.why}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">{t(locale, "insights.field.businessImpact")}</dt>
                <dd className="mt-0.5 text-muted-foreground">{insight.businessImpact}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">{t(locale, "insights.field.recommendedAction")}</dt>
                <dd className="mt-0.5 text-foreground">{insight.recommendedAction}</dd>
              </div>
            </dl>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

export function InsightPreviewRow({ insight }: { insight: Insight }) {
  const Icon = kindIcon[insight.kind];
  return (
    <li className="flex items-start gap-2 py-1.5 text-sm">
      <Icon aria-hidden className={cn("mt-0.5 size-3.5 shrink-0", kindColor[insight.kind])} />
      <span className="text-foreground/90">{insight.title}</span>
    </li>
  );
}
