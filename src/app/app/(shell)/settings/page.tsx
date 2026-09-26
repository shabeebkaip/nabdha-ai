import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { requireCompanySession } from "@/lib/session";
import { getCompanyById } from "@/lib/queries";
import { auth } from "@/auth";
import { getLocale } from "@/lib/get-locale";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: "Settings — Nabda AI" };

export default async function SettingsPage() {
  const { companyId } = await requireCompanySession();
  const [session, company, locale] = await Promise.all([auth(), getCompanyById(companyId), getLocale()]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight">{t(locale, "settings.title")}</h1>

      <Card>
        <CardContent className="flex flex-col gap-3 p-6">
          <p className="font-mono text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            {t(locale, "settings.account")}
          </p>
          <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{session?.user?.name}</span>
            <span className="text-muted-foreground">Email</span>
            <span dir="ltr" className="font-medium">
              {session?.user?.email}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 p-6">
          <p className="font-mono text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            {t(locale, "settings.company")}
          </p>
          <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{company?.name}</span>
            <span className="text-muted-foreground">Industry</span>
            <span className="font-medium">{company?.industry}</span>
            <span className="text-muted-foreground">Size</span>
            <span className="font-medium">{company?.size}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
