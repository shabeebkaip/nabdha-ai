import type { Metadata } from "next";
import { getLocale } from "@/lib/get-locale";
import { LeadForm } from "@/components/marketing/lead-form";

export const metadata: Metadata = { title: "Training & Academy — Nabda AI" };

// In-app version — keeps the sidebar link inside the /app shell.
export default async function AppTrainingPage() {
  const locale = await getLocale();
  return (
    <div className="mx-auto max-w-2xl">
      <LeadForm kind="training" locale={locale} />
    </div>
  );
}
