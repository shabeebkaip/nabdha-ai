import type { Metadata } from "next";
import { getLocale } from "@/lib/get-locale";
import { requireCompanySession } from "@/lib/session";
import { listDatasets } from "@/lib/queries";
import { datasetLabel } from "@/lib/dataset-display";
import { AnalystClient } from "./analyst-client";

export const metadata: Metadata = { title: "Ask AI — Nabda AI" };

// The global Ask AI page — a source picker on top of the same analyst chat
// the per-source detail page's Ask AI tab uses (see AnalystClient), so a
// question can be scoped to one source or left at "All Sources" (the
// aggregated dashboard). Only analyzed sources are offered — an
// unanalyzed one has no dashboard for the analyst to reason about.
export default async function AnalystPage() {
  const { companyId } = await requireCompanySession();
  const [locale, datasets] = await Promise.all([getLocale(), listDatasets(companyId)]);
  const analyzed = datasets.filter((d) => d.healthScore != null);
  const sourceOptions = analyzed.map((d) => ({ id: d.id, label: datasetLabel(d, locale) }));

  return <AnalystClient locale={locale} sourceOptions={sourceOptions} defaultSourceId="all" />;
}
