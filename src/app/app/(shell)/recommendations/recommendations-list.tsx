"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SeverityBadge } from "@/components/app/insight-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { t, type Locale } from "@/lib/i18n";
import type { Insight } from "@/lib/ai/types";

export function RecommendationsList({ insights, locale }: { insights: Insight[]; locale: Locale }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const visible = insights.filter((i) => !dismissed.has(i.id));

  if (visible.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t(locale, "recommendations.empty")}</p>;
  }

  return (
    <>
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {visible.map((insight) => (
          <Card key={insight.id}>
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles aria-hidden className="size-4 text-insight" />
                  <SeverityBadge severity={insight.severity} locale={locale} />
                </div>
              </div>
              <h3 className="font-heading text-base font-bold">{insight.title}</h3>
              <p className="text-sm font-medium text-foreground">{insight.recommendedAction}</p>
              <p className="text-sm text-muted-foreground">{insight.businessImpact}</p>
              <div className="mt-1 flex gap-2">
                <Button size="sm" onClick={() => setDialogOpen(true)}>
                  {t(locale, "recommendations.takeAction")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDismissed((prev) => new Set(prev).add(insight.id))}>
                  {t(locale, "recommendations.dismiss")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(locale, "recommendations.actionDialog.title")}</DialogTitle>
            <DialogDescription>{t(locale, "recommendations.actionDialog.body")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>{t(locale, "recommendations.actionDialog.confirm")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
