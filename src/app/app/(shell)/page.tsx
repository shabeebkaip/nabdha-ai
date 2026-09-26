import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireCompanySession } from "@/lib/session";
import { getCompanyById } from "@/lib/queries";
import { getLocale } from "@/lib/get-locale";
import { DashboardView } from "./dashboard-view";

export const metadata: Metadata = { title: "Dashboard — Nabda AI" };

// Main dashboard nav item — aggregated across every analyzed data source
// (see getDashboardData's no-datasetId path in @/lib/queries), i.e. "where
// the business stands overall", not just the latest upload. A single
// dataset's own results live at /app/data/[id].
export default async function DashboardPage() {
  const { companyId } = await requireCompanySession();
  const [company, locale] = await Promise.all([getCompanyById(companyId), getLocale()]);
  if (!company) redirect("/login");
  if (!company.onboardingCompleted) redirect("/app/onboarding");

  return <DashboardView companyId={companyId} locale={locale} />;
}
