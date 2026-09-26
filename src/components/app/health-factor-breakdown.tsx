import { Progress } from "@/components/ui/progress";
import { t, type DictKey, type Locale } from "@/lib/i18n";
import type { BusinessHealthScore, HealthFactorKey } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

const FACTOR_ORDER: HealthFactorKey[] = ["revenue", "customers", "inventory", "finance", "operations", "growth"];

const factorLabelKey: Record<HealthFactorKey, DictKey> = {
  revenue: "dashboard.healthScore.factor.revenue",
  customers: "dashboard.healthScore.factor.customers",
  inventory: "dashboard.healthScore.factor.inventory",
  finance: "dashboard.healthScore.factor.finance",
  operations: "dashboard.healthScore.factor.operations",
  growth: "dashboard.healthScore.factor.growth",
};

function bandClass(score: number) {
  if (score <= 40) return "[&_[data-slot=progress-indicator]]:bg-danger-bright";
  if (score <= 70) return "[&_[data-slot=progress-indicator]]:bg-warning-bright";
  return "[&_[data-slot=progress-indicator]]:bg-success-bright";
}

export function HealthFactorBreakdown({
  factors,
  locale,
}: {
  factors: BusinessHealthScore["factors"];
  locale: Locale;
}) {
  return (
    <div className="flex flex-col gap-3">
      {FACTOR_ORDER.map((key) => {
        const value = Math.max(0, Math.min(100, Math.round(factors[key] ?? 0)));
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="w-36 shrink-0 text-sm text-muted-foreground">{t(locale, factorLabelKey[key])}</span>
            <Progress value={value} className={cn("flex-1", bandClass(value))} aria-label={t(locale, factorLabelKey[key])} />
            <span className="nabda-numeral w-9 shrink-0 text-end text-sm font-semibold tabular-nums">{value}</span>
          </div>
        );
      })}
    </div>
  );
}
