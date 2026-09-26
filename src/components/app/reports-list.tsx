// Shared report-summary list — the global Reports page and the per-source
// Reports tab both render the exact same "generated reports" list, just fed
// a differently-scoped `reports` array, so the row markup can't drift.
import Link from "next/link";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { t, type Locale } from "@/lib/i18n";
import type { Report } from "@/lib/ai/types";

export function ReportsList({ reports, locale }: { reports: Report[]; locale: Locale }) {
  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
          <FileText aria-hidden className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t(locale, "reports.empty")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {reports.map((report) => (
        <li key={report.id}>
          <Link
            href={`/app/reports/${report.id}`}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center gap-3">
              <FileText aria-hidden className="size-5 text-primary" />
              <div>
                <p className="font-medium">{report.title}</p>
                <p className="text-xs text-muted-foreground">
                  {t(locale, "reports.list.createdAt")}: {new Date(report.createdAt).toLocaleDateString(locale === "ar" ? "ar" : "en-US")}
                </p>
              </div>
            </div>
            <span className="text-sm font-medium text-primary">{t(locale, "reports.list.view")}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
