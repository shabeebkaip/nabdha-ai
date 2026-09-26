import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireCompanySession } from "@/lib/session";
import { getCompanyById } from "@/lib/queries";
import { getLocale } from "@/lib/get-locale";
import { OnboardingWizard } from "./onboarding-wizard";

export const metadata: Metadata = { title: "Company Onboarding — Nabda AI" };

export default async function OnboardingPage() {
  const { companyId } = await requireCompanySession();
  const [company, locale] = await Promise.all([getCompanyById(companyId), getLocale()]);
  if (!company) redirect("/login");

  return (
    <div className="flex justify-center py-4">
      <Suspense>
        <OnboardingWizard
          locale={locale}
          company={{
            name: company.name,
            industry: company.industry,
            size: company.size,
            employees: company.employees,
            branches: company.branches,
            country: company.country,
            businessModel: company.businessModel,
            objective: company.objective,
            dataSources: company.dataSources,
          }}
        />
      </Suspense>
    </div>
  );
}
