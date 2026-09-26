import type { Metadata } from "next";
import { getLocale } from "@/lib/get-locale";
import { requireCompanySession } from "@/lib/session";
import { listDatasets } from "@/lib/queries";
import { DataUploadClient } from "./data-upload-client";
import { DataSourcesList } from "./data-sources-list";

export const metadata: Metadata = { title: "My Data — Nabda AI" };

export default async function DataPage() {
  const { companyId } = await requireCompanySession();
  const [locale, datasets] = await Promise.all([getLocale(), listDatasets(companyId)]);

  // Once a company has connected any data, show the saved sources first (so
  // uploads are visibly persisted with their results), then the connect UI
  // below to add more. First-time users just see the connect UI.
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10">
      {datasets.length > 0 && <DataSourcesList locale={locale} datasets={datasets} />}
      <DataUploadClient locale={locale} compact={datasets.length > 0} />
    </div>
  );
}
