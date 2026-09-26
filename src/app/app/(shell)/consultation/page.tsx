import type { Metadata } from "next";
import { getLocale } from "@/lib/get-locale";
import { LeadForm } from "@/components/marketing/lead-form";

export const metadata: Metadata = { title: "Book a Consultation — Nabda AI" };

// In-app version so the sidebar link stays inside the /app shell (the public
// /consultation route renders on the marketing layout, which drops the user
// out of the authenticated UI).
export default async function AppConsultationPage() {
  const locale = await getLocale();
  return (
    <div className="mx-auto max-w-2xl">
      <LeadForm kind="consultation" locale={locale} />
    </div>
  );
}
