import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { t, type DictKey, type Locale } from "@/lib/i18n";
import { datasetIcon, datasetLabel } from "@/lib/dataset-display";
import type { DatasetListItem } from "@/lib/queries";

const statusLabel: Record<string, DictKey> = {
  uploaded: "data.status.uploaded",
  processing: "data.status.processing",
  analyzed: "data.status.analyzed",
  failed: "data.status.failed",
};

export function DataSourcesList({ locale, datasets }: { locale: Locale; datasets: DatasetListItem[] }) {
  const df = new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", { dateStyle: "medium" });
  return (
    <section>
      <h1 className="text-2xl font-extrabold tracking-tight">{t(locale, "data.sources.title")}</h1>
      <p className="mt-1 text-muted-foreground">{t(locale, "data.sources.subtitle")}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {datasets.map((d) => {
          const Icon = datasetIcon(d.sourceType);
          const analyzed = d.status === "analyzed" || d.healthScore != null;
          return (
            <Card key={d.id} className="flex flex-col gap-3 p-5 transition-shadow duration-300 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon aria-hidden className="size-5" />
                </span>
                <Badge variant="outline" className={analyzed ? "border-success/40 text-success" : ""}>
                  {t(locale, statusLabel[d.status] ?? "data.status.uploaded")}
                </Badge>
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold tracking-tight">{datasetLabel(d, locale)}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t(locale, "data.sources.analyzedOn")} {df.format(d.createdAt)}
                </p>
              </div>
              {d.healthScore != null && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{t(locale, "data.sources.healthLabel")}</span>
                  <span className="nabda-numeral font-heading font-extrabold">{d.healthScore}/100</span>
                </div>
              )}
              <Button
                render={<Link href={`/app/data/${d.id}`} />}
                size="sm"
                variant={analyzed ? "default" : "outline"}
                className="mt-auto w-full"
              >
                {t(locale, "data.sources.viewResults")}
              </Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
