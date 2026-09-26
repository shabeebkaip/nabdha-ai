import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KPICard({
  eyebrow,
  value,
  unit,
  delta,
  deltaPositive = true,
  sparkline,
}: {
  eyebrow: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaPositive?: boolean;
  /** Small illustrative trend series for the sparkline (derived from KPI
   * anchors in the page, since the contract has no history endpoint). */
  sparkline?: number[];
}) {
  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-md">
      <CardContent className="flex flex-col gap-2 p-4">
        <p className="font-mono text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">{eyebrow}</p>
        <p className="nabda-numeral text-2xl font-extrabold tracking-tight">
          {value}
          {unit && <span className="ms-1 text-sm font-medium text-muted-foreground">{unit}</span>}
        </p>
        <div className="flex items-end justify-between gap-3">
          {delta ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold",
                deltaPositive ? "bg-success/12 text-success" : "bg-danger/12 text-danger"
              )}
            >
              {deltaPositive ? (
                <ArrowUpRight aria-hidden className="size-3" />
              ) : (
                <ArrowDownRight aria-hidden className="size-3" />
              )}
              <span className="nabda-numeral">{delta}</span>
            </span>
          ) : (
            <span />
          )}
          {sparkline && sparkline.length > 1 && <Sparkline id={eyebrow} data={sparkline} positive={deltaPositive} />}
        </div>
      </CardContent>
    </Card>
  );
}

function Sparkline({ id, data, positive }: { id: string; data: number[]; positive: boolean }) {
  const w = 96;
  const h = 30;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const x = (i: number) => (i / (data.length - 1)) * w;
  const y = (v: number) => h - 3 - ((v - min) / range) * (h - 6);
  const line = data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const gid = `spark-${id.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
      className={cn("h-8 w-24 shrink-0", positive ? "text-success" : "text-danger")}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} stroke="none" />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
