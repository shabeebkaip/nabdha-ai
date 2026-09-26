// The main /app Dashboard nav item — "All Sources": aggregated across every
// analyzed data source (getDashboardData(companyId), no datasetId — see
// aggregateAnalyses in @/lib/queries). A single source's own numbers live at
// /app/data/[id] instead (see DashboardOverview, the shared body this and
// that page both render so they can't drift).
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { getDashboardData, listDatasets } from "@/lib/queries";
import { type Locale, t, tf } from "@/lib/i18n";
import { DashboardOverview } from "@/components/app/dashboard-overview";

export async function DashboardView({ companyId, locale }: { companyId: string; locale: Locale }) {
  const [dashboard, datasets] = await Promise.all([getDashboardData(companyId, undefined, locale), listDatasets(companyId)]);

  if (!dashboard) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="flex flex-col items-center gap-3 p-8">
            <Sparkles aria-hidden className="size-8 text-primary" />
            <h1 className="text-lg font-bold">{t(locale, "dashboard.empty.title")}</h1>
            <p className="text-sm text-muted-foreground">{t(locale, "dashboard.empty.body")}</p>
            <Button render={<Link href="/app/data" />} className="mt-2">
              {t(locale, "dashboard.empty.cta")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const analyzedSourceCount = datasets.filter((d) => d.healthScore != null).length;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{t(locale, "dashboard.title")}</h1>
        <p className="mt-1 text-muted-foreground">
          {analyzedSourceCount > 1
            ? tf(locale, "dashboard.subtitle.allSources", { n: analyzedSourceCount })
            : t(locale, "dashboard.subtitle")}
        </p>
      </div>

      <DashboardOverview dashboard={dashboard} locale={locale} />
    </div>
  );
}
