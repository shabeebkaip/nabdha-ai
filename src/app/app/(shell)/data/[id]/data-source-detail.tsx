"use client";

// The per-source detail page: a persistent header (which source, uploaded
// when, current status, health score) that never changes while the user
// flips between tabs, so "which data source am I looking at" is always
// unambiguous — plus the 7 tabs themselves. Each tab reuses the exact
// components the old standalone Insights/Recommendations/Reports/
// Presentations/Ask AI pages used, just scoped to this one dataset's data
// (already fetched server-side in page.tsx) — Action Plan is the only
// genuinely new view.
import { usePathname, useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsightsTabs } from "@/app/app/(shell)/insights/insights-tabs";
import { RecommendationsList } from "@/app/app/(shell)/recommendations/recommendations-list";
import { PresentationsClient } from "@/app/app/(shell)/presentations/presentations-client";
import { AnalystClient } from "@/app/app/(shell)/analyst/analyst-client";
import { DashboardOverview } from "@/components/app/dashboard-overview";
import { ActionPlan } from "@/components/app/action-plan";
import { ReportsList } from "@/components/app/reports-list";
import { datasetIconElement, datasetLabel } from "@/lib/dataset-display";
import { t, type DictKey, type Locale } from "@/lib/i18n";
import type { DashboardData, Report } from "@/lib/ai/types";
import type { DatasetListItem } from "@/lib/queries";
import { GenerateReportProgress } from "./generate-report-progress";

const TAB_VALUES = ["overview", "insights", "recommendations", "actionPlan", "reports", "presentations", "askAi"] as const;
type TabValue = (typeof TAB_VALUES)[number];

const tabLabelKey: Record<TabValue, DictKey> = {
  overview: "data.detail.tab.overview",
  insights: "data.detail.tab.insights",
  recommendations: "data.detail.tab.recommendations",
  actionPlan: "data.detail.tab.actionPlan",
  reports: "data.detail.tab.reports",
  presentations: "data.detail.tab.presentations",
  askAi: "data.detail.tab.askAi",
};

const statusLabelKey: Record<string, DictKey> = {
  uploaded: "data.status.uploaded",
  processing: "data.status.processing",
  analyzed: "data.status.analyzed",
  failed: "data.status.failed",
};

function isTabValue(v: unknown): v is TabValue {
  return typeof v === "string" && (TAB_VALUES as readonly string[]).includes(v);
}

export function DataSourceDetail({
  locale,
  dataset,
  dashboard,
  reports,
  analysisId,
  reportCost,
  aiCreditsBalance,
  initialTab,
  presentationDefaultTopic,
}: {
  locale: Locale;
  dataset: DatasetListItem;
  dashboard: DashboardData | null;
  reports: Report[];
  analysisId: string | null;
  reportCost: number;
  aiCreditsBalance: number;
  initialTab?: string;
  presentationDefaultTopic?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab: TabValue = isTabValue(initialTab) ? initialTab : "overview";
  const df = new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", { dateStyle: "medium" });
  const label = datasetLabel(dataset, locale);
  const recommendationInsights = dashboard?.insights.filter((i) => i.kind === "recommendation") ?? [];
  const nonRecommendationInsights = dashboard?.insights.filter((i) => i.kind !== "recommendation") ?? [];

  function onTabChange(value: unknown) {
    if (!isTabValue(value)) return;
    router.replace(`${pathname}?tab=${value}`, { scroll: false });
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      {/* Persistent header — always visible regardless of active tab. */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {datasetIconElement(dataset.sourceType)}
          </span>
          <div>
            <h1 className="font-heading text-lg font-bold tracking-tight">{label}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t(locale, "data.detail.uploadedOn")} {df.format(dataset.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={dataset.healthScore != null ? "border-success/40 text-success" : ""}>
            {t(locale, statusLabelKey[dataset.status] ?? "data.status.uploaded")}
          </Badge>
          {dataset.healthScore != null && (
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground">{t(locale, "data.sources.healthLabel")}</span>
              <span className="nabda-numeral font-heading font-extrabold">{dataset.healthScore}/100</span>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="flex-wrap">
          {TAB_VALUES.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {t(locale, tabLabelKey[tab])}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {dashboard ? (
            <DashboardOverview
              dashboard={dashboard}
              locale={locale}
              insightsHref={`${pathname}?tab=insights`}
              recommendationsHref={`${pathname}?tab=recommendations`}
            />
          ) : (
            <NotAnalyzedEmptyState locale={locale} />
          )}
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          {dashboard ? <InsightsTabs insights={nonRecommendationInsights} locale={locale} /> : <NotAnalyzedEmptyState locale={locale} />}
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          {dashboard ? (
            <RecommendationsList insights={recommendationInsights} locale={locale} />
          ) : (
            <NotAnalyzedEmptyState locale={locale} />
          )}
        </TabsContent>

        <TabsContent value="actionPlan" className="mt-6">
          {dashboard ? <ActionPlan insights={recommendationInsights} locale={locale} /> : <NotAnalyzedEmptyState locale={locale} />}
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{t(locale, "reports.subtitle")}</p>
              <GenerateReportProgress locale={locale} analysisId={analysisId} cost={reportCost} balance={aiCreditsBalance} />
            </div>
            <ReportsList reports={reports} locale={locale} />
          </div>
        </TabsContent>

        <TabsContent value="presentations" className="mt-6">
          <PresentationsClient locale={locale} defaultTopic={presentationDefaultTopic ?? label} showHeader={false} />
        </TabsContent>

        <TabsContent value="askAi" className="mt-6">
          {!dashboard && (
            <Alert className="mb-4">
              <AlertTitle>{t(locale, "data.detail.notAnalyzed.title")}</AlertTitle>
              <AlertDescription>{t(locale, "data.detail.notAnalyzed.body")}</AlertDescription>
            </Alert>
          )}
          <AnalystClient locale={locale} datasetId={dataset.id} datasetLabel={label} showHeader={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotAnalyzedEmptyState({ locale }: { locale: Locale }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
        <Sparkles aria-hidden className="size-8 text-primary" />
        <h2 className="font-heading text-base font-bold">{t(locale, "data.detail.notAnalyzed.title")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{t(locale, "data.detail.notAnalyzed.body")}</p>
      </CardContent>
    </Card>
  );
}
