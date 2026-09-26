import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireCompanySession } from "@/lib/session";
import {
  getCompanyById,
  getDashboardData,
  getDatasetById,
  getLatestAnalysis,
  getReportsSummaries,
} from "@/lib/queries";
import { getCreditCost, getWallets } from "@/lib/credits";
import { getLocale } from "@/lib/get-locale";
import { DataSourceDetail } from "./data-source-detail";

export const metadata: Metadata = { title: "Data Source — Nabda AI" };

// A single uploaded data source's own detail page — was previously just a
// re-render of the generic Executive Dashboard; now a tabbed page (Overview /
// Insights / Recommendations / Action Plan / Reports / Presentations /
// Ask AI) so Insights/Recommendations/Reports/Presentations/Ask AI for a
// specific source live right where the user opened it, instead of only on
// unscoped global pages with no way back to which source they came from.
export default async function DatasetResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; reportId?: string }>;
}) {
  const { companyId } = await requireCompanySession();
  const [company, locale, { id }, sp] = await Promise.all([
    getCompanyById(companyId),
    getLocale(),
    params,
    searchParams,
  ]);
  if (!company) redirect("/login");
  if (!company.onboardingCompleted) redirect("/app/onboarding");

  // Tenant isolation: getDatasetById already filters by companyId — a
  // dataset id that doesn't belong to this company (or doesn't exist) 404s
  // here rather than ever rendering another tenant's data.
  const dataset = await getDatasetById(companyId, id);
  if (!dataset) notFound();

  const [dashboard, reports, analysis, wallets, reportCost] = await Promise.all([
    getDashboardData(companyId, id),
    getReportsSummaries(companyId, id),
    getLatestAnalysis(companyId, id),
    getWallets(companyId),
    getCreditCost("comprehensiveReport"),
  ]);
  const aiWallet = wallets.find((w) => w.walletType === "ai_credits");

  // Launched from a report's "Generate Presentation" button (?reportId=) —
  // pre-fill the Presentations tab's topic with that report's own title
  // instead of the generic source label.
  const linkedReport = sp.reportId ? reports.find((r) => r.id === sp.reportId) : undefined;

  return (
    <DataSourceDetail
      locale={locale}
      dataset={dataset}
      dashboard={dashboard}
      reports={reports}
      analysisId={analysis?.id ?? null}
      reportCost={reportCost ?? 0}
      aiCreditsBalance={aiWallet?.balance ?? 0}
      initialTab={sp.tab}
      presentationDefaultTopic={linkedReport?.title}
    />
  );
}
