import type { Metadata } from "next";
import { getLocale } from "@/lib/get-locale";
import { LeadForm } from "@/components/marketing/lead-form";

export const metadata: Metadata = { title: "Request an Integration — Nabda AI" };

export default async function IntegrationPage() {
  const locale = await getLocale();
  return (
    <div className="px-4 py-16 md:px-6 md:py-24 lg:px-8">
      <LeadForm kind="integration" locale={locale} />
    </div>
  );
}
