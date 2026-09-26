"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { t, tf, type Locale } from "@/lib/i18n";

export function GenerateReportButton({
  locale,
  analysisId,
  cost,
  balance,
}: {
  locale: Locale;
  analysisId: string | null;
  cost: number;
  balance: number;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const insufficient = balance < cost;

  async function generate() {
    if (!analysisId) return;
    setPending(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId }),
    }).catch(() => null);
    setPending(false);

    if (!res || !res.ok) {
      if (res?.status === 409) {
        toast.error(t(locale, "reports.insufficientCredits"));
      } else {
        toast.error(t(locale, "common.errorGeneric"));
      }
      return;
    }
    const report = (await res.json()) as { id: string; creditsRemaining: number };
    toast.success(tf(locale, "reports.generateCost", { n: cost }));
    router.push(`/app/reports/${report.id}`);
    router.refresh();
  }

  const button = (
    <Button onClick={generate} disabled={!analysisId || insufficient || pending} aria-disabled={insufficient}>
      <FileText aria-hidden className="size-4" />
      {pending ? t(locale, "common.loading") : t(locale, "reports.generate")}
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-block" />}>{button}</TooltipTrigger>
      <TooltipContent>{insufficient ? t(locale, "reports.insufficientCredits") : tf(locale, "reports.generateCost", { n: cost })}</TooltipContent>
    </Tooltip>
  );
}
