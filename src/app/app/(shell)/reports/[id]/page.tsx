import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireCompanySession } from "@/lib/session";
import { getReportById } from "@/lib/queries";
import { getLocale } from "@/lib/get-locale";
import { t } from "@/lib/i18n";
import { ReportActions } from "./report-actions";

export const metadata: Metadata = { title: "Report — Nabda AI" };

function slug(heading: string) {
  return heading.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default async function ReportViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { companyId } = await requireCompanySession();
  const [report, locale] = await Promise.all([getReportById(companyId, id), getLocale()]);
  if (!report) notFound();

  return (
    <div className="mx-auto flex max-w-6xl gap-8">
      <aside className="sticky top-20 hidden h-fit w-56 shrink-0 print:hidden lg:block">
        <p className="mb-2 font-mono text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          {t(locale, "reports.viewer.toc")}
        </p>
        <nav className="flex flex-col gap-1">
          {report.sections.map((s, i) => (
            <a
              key={s.heading}
              href={`#${slug(s.heading)}`}
              className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {i + 1}. {s.heading}
            </a>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="sticky top-16 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur print:static print:border-none md:-mx-6 md:px-6">
          <div>
            <h1 className="text-lg font-bold">{report.title}</h1>
            <Link
              href={`/app/data/${report.datasetId}`}
              className="text-xs font-medium text-primary hover:underline print:hidden"
            >
              {t(locale, "reports.viewer.viewSource")}
            </Link>
          </div>
          <ReportActions locale={locale} reportId={report.id} datasetId={report.datasetId} />
        </div>

        <div className="mt-6 flex flex-col gap-10 pb-16 print:gap-6">
          {report.sections.map((section) => (
            <section key={section.heading} id={slug(section.heading)} className="print-section scroll-mt-32">
              <h2 className="font-heading text-xl font-bold">{section.heading}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
