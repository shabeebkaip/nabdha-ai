import type { Metadata } from "next";
import { requireCompanySession } from "@/lib/session";
import { getLatestAnalysis, getReportsSummaries } from "@/lib/queries";
import { getCreditCost, getWallets } from "@/lib/credits";
import { getLocale } from "@/lib/get-locale";
import { t } from "@/lib/i18n";
import { ReportsList } from "@/components/app/reports-list";
import { GenerateReportButton } from "./generate-report-button";

export const metadata: Metadata = { title: "Reports — Nabda AI" };

export default async function ReportsPage() {
  const { companyId } = await requireCompanySession();
  const [reports, analysis, wallets, cost, locale] = await Promise.all([
    getReportsSummaries(companyId),
    getLatestAnalysis(companyId),
    getWallets(companyId),
    getCreditCost("comprehensiveReport"),
    getLocale(),
  ]);
  const aiWallet = wallets.find((w) => w.walletType === "ai_credits");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t(locale, "reports.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t(locale, "reports.subtitle")}</p>
        </div>
        <GenerateReportButton
          locale={locale}
          analysisId={analysis?.id ?? null}
          cost={cost ?? 0}
          balance={aiWallet?.balance ?? 0}
        />
      </div>

      <ReportsList reports={reports} locale={locale} />
    </div>
  );
}
