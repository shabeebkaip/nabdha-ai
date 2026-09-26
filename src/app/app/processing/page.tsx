import { Suspense } from "react";
import type { Metadata } from "next";
import { getLocale } from "@/lib/get-locale";
import { ProcessingClient } from "./processing-client";

export const metadata: Metadata = { title: "Analyzing… — Nabda AI" };

// Sibling to src/app/app/(shell) on purpose — full-viewport "focus mode"
// screen per DESIGN_SPEC §7 "06", no sidebar/topbar chrome.
export default async function ProcessingPage({
  searchParams,
}: {
  searchParams: Promise<{ datasetId?: string }>;
}) {
  const [locale, params] = await Promise.all([getLocale(), searchParams]);
  return (
    <Suspense>
      <ProcessingClient locale={locale} datasetId={params.datasetId ?? null} />
    </Suspense>
  );
}
