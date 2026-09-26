"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsightCard } from "@/components/app/insight-card";
import { t, type Locale } from "@/lib/i18n";
import type { Insight } from "@/lib/ai/types";

export function InsightsTabs({ insights, locale }: { insights: Insight[]; locale: Locale }) {
  const risks = insights.filter((i) => i.kind === "risk" || i.kind === "trend");
  const opportunities = insights.filter((i) => i.kind === "opportunity");

  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">{t(locale, "insights.tab.all")}</TabsTrigger>
        <TabsTrigger value="risks">{t(locale, "insights.tab.risks")}</TabsTrigger>
        <TabsTrigger value="opportunities">{t(locale, "insights.tab.opportunities")}</TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="mt-4">
        <Grid insights={insights} locale={locale} />
      </TabsContent>
      <TabsContent value="risks" className="mt-4">
        <Grid insights={risks} locale={locale} />
      </TabsContent>
      <TabsContent value="opportunities" className="mt-4">
        <Grid insights={opportunities} locale={locale} />
      </TabsContent>
    </Tabs>
  );
}

function Grid({ insights, locale }: { insights: Insight[]; locale: Locale }) {
  if (insights.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t(locale, "insights.empty")}</p>;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} locale={locale} />
      ))}
    </div>
  );
}
