import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireCompanySession } from "@/lib/session";
import { getWallets, getUsageLedger } from "@/lib/credits";
import { getLocale } from "@/lib/get-locale";
import { t, type DictKey, type Locale } from "@/lib/i18n";
import { CreditMeter } from "@/components/app/credit-meter";
import { DemoActionDialog } from "./buy-credits-dialog";

export const metadata: Metadata = { title: "Credits — Nabda AI" };

// Map internal ledger reason codes → human labels. Raw enum stays in code/DB
// only; the UI never shows "comprehensiveReport". Refunds carry a "refund:"
// prefix (see credits.ts) — surface as "Refund — <label>".
const REASON_LABEL: Record<string, DictKey> = {
  standardAnalysis: "credits.reason.standardAnalysis",
  advancedAnalysis: "credits.reason.advancedAnalysis",
  comprehensiveReport: "credits.reason.comprehensiveReport",
  presentationPerSlide: "credits.reason.presentationPerSlide",
  extraCredits: "credits.reason.extraCredits",
};

function reasonLabel(reason: string, locale: Locale): string {
  const isRefund = reason.startsWith("refund:");
  const base = isRefund ? reason.slice("refund:".length) : reason;
  const key = REASON_LABEL[base];
  const label = key ? t(locale, key) : base;
  return isRefund ? `${t(locale, "credits.reason.refund")} — ${label}` : label;
}

export default async function CreditsPage() {
  const { companyId } = await requireCompanySession();
  const [wallets, usage, locale] = await Promise.all([getWallets(companyId), getUsageLedger(companyId, 20), getLocale()]);
  const aiWallet = wallets.find((w) => w.walletType === "ai_credits");
  const slidesWallet = wallets.find((w) => w.walletType === "slides");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{t(locale, "credits.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t(locale, "credits.subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <CreditMeter
              label={t(locale, "credits.wallet.aiCredits")}
              balance={aiWallet?.balance ?? 0}
              allowance={aiWallet?.allowance ?? 0}
              resetDate={aiWallet?.resetDate?.toISOString() ?? null}
              locale={locale}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <CreditMeter
              label={t(locale, "credits.wallet.slides")}
              balance={slidesWallet?.balance ?? 0}
              allowance={slidesWallet?.allowance ?? 0}
              resetDate={slidesWallet?.resetDate?.toISOString() ?? null}
              locale={locale}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button render={<Link href="/app/reports" />}>{t(locale, "credits.generateReport")}</Button>
        <DemoActionDialog
          locale={locale}
          triggerLabel={t(locale, "credits.buy")}
          titleKey="credits.buyDialog.title"
          bodyKey="credits.buyDialog.body"
          variant="outline"
        />
        <DemoActionDialog
          locale={locale}
          triggerLabel={t(locale, "credits.upgrade")}
          titleKey="credits.buyDialog.title"
          bodyKey="credits.buyDialog.body"
          variant="outline"
        />
      </div>

      <div>
        <h2 className="mb-3 font-heading text-base font-bold">{t(locale, "credits.ledger.title")}</h2>
        {usage.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t(locale, "credits.ledger.empty")}</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t(locale, "credits.ledger.date")}</TableHead>
                  <TableHead>{t(locale, "credits.ledger.reason")}</TableHead>
                  <TableHead className="text-end">{t(locale, "credits.ledger.amount")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usage.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-muted-foreground">
                      {new Date(row.createdAt).toLocaleDateString(locale === "ar" ? "ar" : "en-US")}
                    </TableCell>
                    <TableCell>{reasonLabel(row.reason, locale)}</TableCell>
                    <TableCell className={`nabda-numeral text-end font-medium ${row.delta < 0 ? "text-danger" : "text-success"}`}>
                      {row.delta > 0 ? "+" : ""}
                      {row.delta}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
