import { Suspense } from "react";
import type { Metadata } from "next";
import { requireCompanySession } from "@/lib/session";
import { getReportById } from "@/lib/queries";
import { getLocale } from "@/lib/get-locale";
import { PresentationsClient } from "./presentations-client";

export const metadata: Metadata = { title: "Presentations — Nabda AI" };

export default async function PresentationsPage({
  searchParams,
}: {
  searchParams: Promise<{ reportId?: string }>;
}) {
  const { companyId } = await requireCompanySession();
  const [locale, params] = await Promise.all([getLocale(), searchParams]);
  const report = params.reportId ? await getReportById(companyId, params.reportId) : null;

  return (
    <Suspense>
      <PresentationsClient locale={locale} defaultTopic={report?.title ?? ""} />
    </Suspense>
  );
}
