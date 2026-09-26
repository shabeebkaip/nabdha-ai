// Health Score + KPI + trend charts + top risks/opportunities/recommendation
// strip — the actual "business health" view. Extracted out of
// dashboard-view.tsx (the aggregated /app Dashboard) so the exact same
// rendering can be reused, unscaled, as the Overview tab of a single
// source's detail page (/app/data/[id]) — one place to fix if the layout
// ever changes, instead of two dashboards drifting apart.
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HealthScoreGauge } from "@/components/app/health-score-gauge";
import { HealthFactorBreakdown } from "@/components/app/health-factor-breakdown";
import { KPICard } from "@/components/app/kpi-card";
import { RevenueTrendChart, CustomerTrendChart } from "@/components/app/dashboard-charts";
import { InsightPreviewRow } from "@/components/app/insight-card";
import { t, type Locale } from "@/lib/i18n";
import type { DashboardData } from "@/lib/ai/types";

export function DashboardOverview({
  dashboard,
  locale,
  insightsHref = "/app/insights",
  recommendationsHref = "/app/recommendations",
}: {
  dashboard: DashboardData;
  locale: Locale;
  /** Where "View all" links go — the global Dashboard points at the
   * standalone Insights/Recommendations pages; the per-source Overview tab
   * points at this same page's other tabs (`?tab=insights` etc). */
  insightsHref?: string;
  recommendationsHref?: string;
}) {
  const { kpis, healthScore, insights, forecast } = dashboard;
  const risks = insights.filter((i) => i.kind === "risk").slice(0, 3);
  const opportunities = insights.filter((i) => i.kind === "opportunity").slice(0, 3);
  const recommendation = insights.find((i) => i.kind === "recommendation");

  return (
    <div className="flex flex-col gap-6">
      {/* Row 1 — Business Health Score, DESIGN_SPEC §5 */}
      <Card>
        <CardContent className="grid gap-8 p-6 lg:grid-cols-[280px_1fr] lg:items-center">
          <HealthScoreGauge score={healthScore.overall} locale={locale} />
          <div>
            <h2 className="mb-4 font-heading text-base font-bold">{t(locale, "dashboard.healthScore.title")}</h2>
            <HealthFactorBreakdown factors={healthScore.factors} locale={locale} />
          </div>
        </CardContent>
        <p className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
          {t(locale, "dashboard.healthScore.caption")}
        </p>
      </Card>

      {/* Row 2 — KPI grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <KPICard
          eyebrow={t(locale, "dashboard.kpi.revenue")}
          value={kpis.revenue.toLocaleString("en-US")}
          unit="SAR"
        />
        <KPICard
          eyebrow={t(locale, "dashboard.kpi.growth")}
          value={`${kpis.revenueGrowthPct > 0 ? "+" : ""}${kpis.revenueGrowthPct}%`}
        />
        <KPICard eyebrow={t(locale, "dashboard.kpi.customers")} value={kpis.customers.toLocaleString("en-US")} />
        <KPICard eyebrow={t(locale, "dashboard.kpi.aov")} value={kpis.avgOrderValue.toLocaleString("en-US")} unit="SAR" />
        <KPICard eyebrow={t(locale, "dashboard.kpi.retention")} value={`${kpis.retentionPct}%`} />
      </div>

      {/* Row 3 — charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t(locale, "dashboard.charts.revenueTrend")}</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueTrendChart
              revenue={kpis.revenue}
              growthPct={kpis.revenueGrowthPct}
              forecastRevenue={forecast.expectedRevenue}
              locale={locale}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t(locale, "dashboard.charts.customerTrend")}</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerTrendChart customers={kpis.customers} growthPct={kpis.revenueGrowthPct} locale={locale} />
          </CardContent>
        </Card>
      </div>

      {/* Row 4 — top risks / opportunities / recommendation strip */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">{t(locale, "dashboard.topRisks")}</CardTitle>
            <Link href={insightsHref} className="text-xs font-medium text-primary hover:underline">
              {t(locale, "common.viewAll")}
            </Link>
          </CardHeader>
          <CardContent>
            {risks.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t(locale, "insights.empty")}</p>
            ) : (
              <ul>
                {risks.map((r) => (
                  <InsightPreviewRow key={r.id} insight={r} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">{t(locale, "dashboard.topOpportunities")}</CardTitle>
            <Link href={insightsHref} className="text-xs font-medium text-primary hover:underline">
              {t(locale, "common.viewAll")}
            </Link>
          </CardHeader>
          <CardContent>
            {opportunities.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t(locale, "insights.empty")}</p>
            ) : (
              <ul>
                {opportunities.map((o) => (
                  <InsightPreviewRow key={o.id} insight={o} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">{t(locale, "dashboard.topRecommendation")}</CardTitle>
            <Link href={recommendationsHref} className="text-xs font-medium text-primary hover:underline">
              {t(locale, "common.viewAll")}
            </Link>
          </CardHeader>
          <CardContent>
            {recommendation ? (
              <p className="text-sm text-foreground/90">{recommendation.recommendedAction}</p>
            ) : (
              <p className="text-sm text-muted-foreground">{t(locale, "recommendations.empty")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
