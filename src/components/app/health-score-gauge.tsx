"use client";

import { useEffect, useState } from "react";
import { t, type DictKey, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Custom SVG semicircle gauge — DESIGN_SPEC §5. Score fill is drawn with the
// classic stroke-dasharray/dashoffset "reveal" trick on a FIXED path (not by
// re-computing the `d` attribute per frame), which is what makes the 900ms
// sweep a plain, universally-supported CSS transition on `stroke-dashoffset`
// instead of an unreliable animated path `d`.
const R = 86;
const CX = 100;
const CY = 100;
const STROKE = 16;
const ARC_LENGTH = Math.PI * R;
const PATH_D = `M ${CX - R} ${CY} A ${R} ${R} 0 1 1 ${CX + R} ${CY}`;

type Band = "danger" | "warning" | "success";

function bandFor(score: number): Band {
  if (score <= 40) return "danger";
  if (score <= 70) return "warning";
  return "success";
}

const bandLabelKey: Record<Band, DictKey> = {
  danger: "dashboard.healthScore.band.poor",
  warning: "dashboard.healthScore.band.fair",
  success: "dashboard.healthScore.band.strong",
};

const bandStrokeVar: Record<Band, string> = {
  danger: "var(--color-danger-bright)",
  warning: "var(--color-warning-bright)",
  success: "var(--color-success-bright)",
};

const bandTextClass: Record<Band, string> = {
  danger: "text-danger",
  warning: "text-warning",
  success: "text-success",
};

export function HealthScoreGauge({
  score,
  locale,
  previousScore,
}: {
  score: number;
  locale: Locale;
  previousScore?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const band = bandFor(clamped);
  const visibleScore = mounted ? clamped : 0;
  const dashOffset = ARC_LENGTH * (1 - visibleScore / 100);
  const delta = typeof previousScore === "number" ? clamped - previousScore : null;

  return (
    <div className="flex flex-col items-center" dir="ltr">
      <div className="relative w-full max-w-[260px]">
        <svg viewBox="0 0 200 112" className="w-full" role="img" aria-label={`${clamped} out of 100`}>
          <path
            d={PATH_D}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          <path
            d={PATH_D}
            fill="none"
            stroke={bandStrokeVar[band]}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${ARC_LENGTH} ${ARC_LENGTH}`}
            style={{
              strokeDashoffset: dashOffset,
              transition: "stroke-dashoffset 900ms var(--ease-nabda)",
            }}
          />
        </svg>
        <div className="absolute inset-x-0 top-[55%] flex -translate-y-1/2 flex-col items-center">
          <p className="nabda-numeral font-heading text-5xl leading-none font-extrabold text-foreground">
            {clamped}
            <span className="text-lg font-medium text-muted-foreground">/100</span>
          </p>
        </div>
      </div>
      <p className={cn("mt-1 text-sm font-semibold", bandTextClass[band])}>{t(locale, bandLabelKey[band])}</p>
      {delta !== null && delta !== 0 && (
        <p className={cn("nabda-numeral mt-0.5 text-xs font-medium", delta > 0 ? "text-success" : "text-danger")}>
          {delta > 0 ? "+" : ""}
          {delta} vs last month
        </p>
      )}
    </div>
  );
}
