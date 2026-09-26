import type { Metadata } from "next";
import { getLocale } from "@/lib/get-locale";
import { LeadForm } from "@/components/marketing/lead-form";

export const metadata: Metadata = { title: "Talk to Our Team — Nabda AI" };

export default async function EnterprisePage() {
  const locale = await getLocale();
  return (
    <div className="px-4 py-16 md:px-6 md:py-24 lg:px-8">
      <LeadForm kind="enterprise" locale={locale} />
    </div>
  );
}
