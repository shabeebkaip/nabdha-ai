"use client";

// The Action Plan tab — a distinct, ordered checklist view of a source's
// recommendations (not just the raw Insight cards): grouped by severity
// High → Medium → Low, each line pairing the action to take with why it
// matters. ponytail: checked state is local/session-only (no `action_plan`
// table exists) — persisting completion is a real feature (needs a backend
// endpoint + schema), not a checkbox-render detail; upgrade path is a
// `PATCH /api/insights/[id]` toggling a `completedAt` column if this needs
// to survive a refresh.
import { useId, useState } from "react";
import { ListChecks } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SeverityBadge } from "@/components/app/insight-card";
import { t, type DictKey, type Locale } from "@/lib/i18n";
import type { Insight, Severity } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

const severityOrder: Severity[] = ["high", "medium", "low"];
const severityGroupLabel: Record<Severity, DictKey> = {
  high: "insights.severity.high",
  medium: "insights.severity.medium",
  low: "insights.severity.low",
};

export function ActionPlan({ insights, locale }: { insights: Insight[]; locale: Locale }) {
  const [done, setDone] = useState<Set<string>>(new Set());

  if (insights.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t(locale, "recommendations.empty")}</p>;
  }

  const grouped = severityOrder
    .map((severity) => ({ severity, items: insights.filter((i) => i.severity === severity) }))
    .filter((g) => g.items.length > 0);

  const totalDone = insights.filter((i) => done.has(i.id)).length;

  function toggle(id: string) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ListChecks aria-hidden className="size-4" />
        <span className="nabda-numeral">
          {totalDone} / {insights.length}
        </span>
        <span>{t(locale, "actionPlan.progress")}</span>
      </div>

      {grouped.map((group) => (
        <section key={group.severity} aria-labelledby={`action-plan-${group.severity}`}>
          <h3
            id={`action-plan-${group.severity}`}
            className="mb-3 flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase"
          >
            {t(locale, severityGroupLabel[group.severity])}
          </h3>
          <ol className="flex flex-col gap-2">
            {group.items.map((insight, i) => (
              <ActionPlanRow
                key={insight.id}
                index={i + 1}
                insight={insight}
                locale={locale}
                checked={done.has(insight.id)}
                onToggle={() => toggle(insight.id)}
              />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function ActionPlanRow({
  index,
  insight,
  locale,
  checked,
  onToggle,
}: {
  index: number;
  insight: Insight;
  locale: Locale;
  checked: boolean;
  onToggle: () => void;
}) {
  const id = useId();
  return (
    <li>
      <Card className={cn("transition-colors", checked && "bg-muted/40")}>
        <CardContent className="flex items-start gap-3 p-4">
          <Checkbox
            id={id}
            checked={checked}
            onCheckedChange={onToggle}
            aria-label={insight.recommendedAction}
            className="mt-0.5"
          />
          <span aria-hidden className="nabda-numeral mt-0.5 shrink-0 text-xs font-semibold text-muted-foreground">
            {index}.
          </span>
          <div className="min-w-0 flex-1">
            <label
              htmlFor={id}
              className={cn(
                "block cursor-pointer text-sm font-semibold text-foreground",
                checked && "text-muted-foreground line-through"
              )}
            >
              {insight.recommendedAction}
            </label>
            <p className="mt-1 text-xs text-muted-foreground">{insight.businessImpact}</p>
          </div>
          <SeverityBadge severity={insight.severity} locale={locale} />
        </CardContent>
      </Card>
    </li>
  );
}
