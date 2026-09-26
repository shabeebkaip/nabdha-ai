import Link from "next/link";
import type { Metadata } from "next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { requireCompanySession } from "@/lib/session";
import { getDashboardData } from "@/lib/queries";
import { getLocale } from "@/lib/get-locale";
import { t } from "@/lib/i18n";
import { RecommendationsList } from "./recommendations-list";

export const metadata: Metadata = { title: "Recommendations — Nabda AI" };

export default async function RecommendationsPage() {
  const { companyId } = await requireCompanySession();
  const [dashboard, locale] = await Promise.all([getDashboardData(companyId), getLocale()]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{t(locale, "recommendations.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t(locale, "recommendations.subtitle")}</p>
      </div>

      {!dashboard ? (
        <Alert>
          <AlertTitle>{t(locale, "recommendations.empty")}</AlertTitle>
          <AlertDescription>
            <Button render={<Link href="/app/data" />} size="sm" className="mt-2">
              {t(locale, "dashboard.empty.cta")}
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <RecommendationsList insights={dashboard.insights.filter((i) => i.kind === "recommendation")} locale={locale} />
      )}
    </div>
  );
}
