"use client";

// Reports tab's "Generate Report" — same POST /api/reports + credit
// deduction as the global GenerateReportButton, but with an on-page staged
// progress view instead of just a button spinner (a live-demo generation can
// run several seconds; a tiny "Loading…" label reads as frozen). Pattern
// mirrors src/app/app/processing/processing-client.tsx: stages advance on a
// timer up to the last one, then HOLD there until the real fetch resolves.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { t, tf, type DictKey, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const STAGES: DictKey[] = [
  "reports.generating.stage.analyzing",
  "reports.generating.stage.drafting",
  "reports.generating.stage.finalizing",
];
const HOLD_INDEX = STAGES.length - 1;
const STAGE_INTERVAL_MS = 1400;
const MIN_TOTAL_MS = 1800; // never flash through the whole stepper in one frame

export function GenerateReportProgress({
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
  const [status, setStatus] = useState<"idle" | "running">("idle");
  const [stageIndex, setStageIndex] = useState(0);
  const insufficient = balance < cost;

  useEffect(() => {
    if (status !== "running") return;
    const id = window.setInterval(() => setStageIndex((i) => Math.min(i + 1, HOLD_INDEX)), STAGE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [status]);

  async function generate() {
    if (!analysisId) return;
    setStatus("running");
    setStageIndex(0);
    const startedAt = Date.now();

    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId }),
    }).catch(() => null);
    const remaining = Math.max(0, MIN_TOTAL_MS - (Date.now() - startedAt));

    if (!res || !res.ok) {
      window.setTimeout(() => {
        setStatus("idle");
        toast.error(res?.status === 409 ? t(locale, "reports.insufficientCredits") : t(locale, "common.errorGeneric"));
      }, remaining);
      return;
    }
    const report = (await res.json()) as { id: string };
    window.setTimeout(() => {
      toast.success(tf(locale, "reports.generateCost", { n: cost }));
      router.push(`/app/reports/${report.id}`);
      router.refresh();
    }, remaining);
  }

  if (status === "running") {
    return (
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <Loader2 aria-hidden className="size-5 shrink-0 animate-spin text-primary motion-reduce:animate-none" />
          <ol className="flex flex-1 flex-col gap-1" aria-live="polite">
            {STAGES.map((key, i) => {
              const complete = i < stageIndex;
              const active = i === stageIndex;
              return (
                <li
                  key={key}
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    complete ? "text-muted-foreground" : active ? "font-medium text-foreground" : "text-muted-foreground/40"
                  )}
                >
                  {complete ? (
                    <Check aria-hidden className="size-3.5 shrink-0 text-success" />
                  ) : (
                    <span aria-hidden className="size-3.5 shrink-0" />
                  )}
                  {t(locale, key)}
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>
    );
  }

  const button = (
    <Button onClick={generate} disabled={!analysisId || insufficient}>
      <FileText aria-hidden className="size-4" />
      {t(locale, "reports.generate")}
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-block" />}>{button}</TooltipTrigger>
      <TooltipContent>{insufficient ? t(locale, "reports.insufficientCredits") : tf(locale, "reports.generateCost", { n: cost })}</TooltipContent>
    </Tooltip>
  );
}
