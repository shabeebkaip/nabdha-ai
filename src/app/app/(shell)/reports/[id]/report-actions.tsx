"use client";

import Link from "next/link";
import { Download, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { t, type Locale } from "@/lib/i18n";

// QA bug #1 fix: real PDF output via the browser's print-to-PDF, not a
// toast. Zero-dep, works offline, and `globals.css`'s `@media print` block
// + `print:hidden`/`print-section` classes on the viewer page produce a
// clean black-on-white 11-section document — "Save as PDF" in any
// browser's print dialog gives an actual downloadable PDF.
export function ReportActions({
  locale,
  reportId,
  datasetId,
}: {
  locale: Locale;
  reportId: string;
  datasetId: string;
}) {
  return (
    <div className="flex gap-2 print:hidden">
      <Tooltip>
        <TooltipTrigger render={<span className="inline-block" />}>
          <Button variant="outline" onClick={() => window.print()}>
            <Download aria-hidden className="size-4" />
            {t(locale, "reports.viewer.downloadPdf")}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t(locale, "reports.viewer.downloadStub")}</TooltipContent>
      </Tooltip>
      {/* Single canonical presentation flow lives on the source's own
          Presentations tab — this just opens it pre-scoped to this report's
          source instead of the (now-orphaned) standalone /app/presentations
          page. */}
      <Button render={<Link href={`/app/data/${datasetId}?tab=presentations&reportId=${reportId}`} />}>
        <Presentation aria-hidden className="size-4" />
        {t(locale, "reports.viewer.generatePresentation")}
      </Button>
    </div>
  );
}
