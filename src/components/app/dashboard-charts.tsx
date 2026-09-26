"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { t, type Locale } from "@/lib/i18n";
import { buildTrend, lastNMonthLabels } from "@/lib/trend";

// DESIGN_SPEC §2: chart container stays dir="ltr" even on an RTL page —
// time series always reads left-to-right chronologically regardless of
// locale. Both charts are interpolated from real KPI anchors (see
// src/lib/trend.ts) since the API contract has no history endpoint.

function fmtSar(v: number) {
  return `${Math.round(v).toLocaleString("en-US")}`;
}

// QA bug #2 fix: compact tick labels ("1.4M"/"12k") that actually fit the
// axis width, instead of a fixed /1000 + "k" that truncates 7-figure
// revenue into something unreadable like "00k".
function formatCompact(v: number) {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(v % 1_000 === 0 ? 0 : 1)}k`;
  return `${v}`;
}

export function RevenueTrendChart({
  revenue,
  growthPct,
  forecastRevenue,
  locale,
}: {
  revenue: number;
  growthPct: number;
  forecastRevenue: number;
  locale: Locale;
}) {
  const monthly = buildTrend(revenue, growthPct, 12);
  const labels = lastNMonthLabels(12, locale);
  const data: { label: string; actual: number | null; forecast: number | null }[] = labels.map((label, i) => ({
    label,
    actual: monthly[i]!,
    forecast: i === labels.length - 1 ? monthly[i]! : null,
  }));
  data.push({ label: t(locale, "dashboard.forecast.title"), actual: null, forecast: Math.round(forecastRevenue) });

  return (
    <div dir="ltr" className="h-64 w-full" aria-label={`Revenue trend, rising, ends at ${fmtSar(revenue)} SAR`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={formatCompact}
            width={56}
          />
          <Tooltip
            formatter={(value) => [`${fmtSar(Number(value))} SAR`, ""]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Line type="monotone" dataKey="actual" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CustomerTrendChart({
  customers,
  growthPct,
  locale,
}: {
  customers: number;
  growthPct: number;
  locale: Locale;
}) {
  const monthly = buildTrend(customers, growthPct, 12);
  const labels = lastNMonthLabels(12, locale);
  const data = labels.map((label, i) => ({ label, customers: monthly[i] }));

  return (
    <div dir="ltr" className="h-64 w-full" aria-label={`Customer trend, rising, ends at ${customers} customers`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={formatCompact} width={48} />
          <Tooltip formatter={(value) => [Number(value).toLocaleString("en-US"), ""]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Line type="monotone" dataKey="customers" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
