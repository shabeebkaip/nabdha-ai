import { Progress } from "@/components/ui/progress";
import { t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function CreditMeter({
  label,
  balance,
  allowance,
  resetDate,
  locale,
}: {
  label: string;
  balance: number;
  allowance: number;
  resetDate: string | null;
  locale: Locale;
}) {
  const used = Math.max(0, allowance - balance);
  const pct = allowance > 0 ? Math.min(100, Math.round((balance / allowance) * 100)) : 0;
  const low = allowance > 0 && balance / allowance < 0.1;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">{label}</p>
        <p className="nabda-numeral text-sm font-semibold">
          {balance.toLocaleString("en-US")} / {allowance.toLocaleString("en-US")}
        </p>
      </div>
      <Progress value={pct} className={cn(low && "[&_[data-slot=progress-indicator]]:bg-warning-bright")} />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {t(locale, "credits.used")}: <span className="nabda-numeral">{used.toLocaleString("en-US")}</span>
        </span>
        {resetDate && (
          <span>
            {t(locale, "credits.renewal")}: {new Date(resetDate).toLocaleDateString(locale === "ar" ? "ar" : "en-US")}
          </span>
        )}
      </div>
      {low && <p className="text-xs font-medium text-warning">{t(locale, "credits.lowBalance")}</p>}
    </div>
  );
}
