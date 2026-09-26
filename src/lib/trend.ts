// Nabda AI — trend interpolation helper.
//
// The API contract (docs/API_CONTRACT.md) intentionally does not include a
// month-by-month history array — only current-period KPIs + one forward
// forecast value. Rather than fabricate unrelated numbers, the dashboard
// charts interpolate a smooth line between a real starting point and the
// real current value (both anchored to actual KPI numbers), and are
// captioned "Illustrative trend" so nothing is misrepresented as literal
// historical data. ponytail: linear interpolation, not a compounding
// growth curve — good enough for a sparkline, upgrade to real time-series
// once /api/dashboard exposes history.
export function buildTrend(current: number, growthPct: number, points = 12): number[] {
  const start = current / (1 + growthPct / 100);
  const step = (current - start) / Math.max(1, points - 1);
  return Array.from({ length: points }, (_, i) => Math.round(start + step * i));
}

export function lastNMonthLabels(n: number, locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-US", { month: "short" });
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return fmt.format(d);
  });
}
