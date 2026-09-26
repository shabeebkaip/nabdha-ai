import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { requireCompanySession } from "@/lib/session";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getLocale } from "@/lib/get-locale";
import { t } from "@/lib/i18n";
import { DemoActionDialog } from "@/app/app/(shell)/credits/buy-credits-dialog";

export const metadata: Metadata = { title: "Billing — Nabda AI" };

export default async function BillingPage() {
  const { companyId } = await requireCompanySession();
  const [locale, [subscription]] = await Promise.all([
    getLocale(),
    db.select().from(subscriptions).where(eq(subscriptions.companyId, companyId)),
  ]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{t(locale, "appNav.billing")}</h1>
      </div>
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">{t(locale, "credits.upgrade")}</p>
              <p className="mt-1 text-lg font-bold capitalize">{subscription?.plan ?? "trial"}</p>
              <p className="text-xs text-muted-foreground capitalize">{subscription?.billingCycle ?? "monthly"}</p>
            </div>
            <DemoActionDialog
              locale={locale}
              triggerLabel={t(locale, "credits.upgrade")}
              titleKey="credits.buyDialog.title"
              bodyKey="credits.buyDialog.body"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
