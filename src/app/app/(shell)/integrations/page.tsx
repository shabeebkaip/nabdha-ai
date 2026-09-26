import type { Metadata } from "next";
import { getLocale } from "@/lib/get-locale";
import { LeadForm } from "@/components/marketing/lead-form";

export const metadata: Metadata = { title: "Integrations — Nabda AI" };

// In-app version — keeps the sidebar link inside the /app shell.
export default async function AppIntegrationsPage() {
  const locale = await getLocale();
  return (
    <div className="mx-auto max-w-2xl">
      <LeadForm kind="integration" locale={locale} />
    </div>
  );
}
