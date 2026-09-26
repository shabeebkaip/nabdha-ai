"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Presentation as PresentationIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { t, type DictKey, type Locale } from "@/lib/i18n";

const styleOptions: { value: string; labelKey: DictKey }[] = [
  { value: "executive", labelKey: "presentations.style.executive" },
  { value: "management", labelKey: "presentations.style.management" },
  { value: "investor", labelKey: "presentations.style.investor" },
  { value: "monthly", labelKey: "presentations.style.monthly" },
];
const audienceOptions: { value: string; labelKey: DictKey }[] = [
  { value: "board", labelKey: "presentations.audience.board" },
  { value: "management", labelKey: "presentations.audience.management" },
  { value: "investors", labelKey: "presentations.audience.investors" },
  { value: "team", labelKey: "presentations.audience.team" },
];

interface Result {
  topic: string;
  slideCount: number;
  style: string;
  audience: string;
  creditsCharged: number;
}

export function PresentationsClient({
  locale,
  defaultTopic,
  showHeader = true,
}: {
  locale: Locale;
  defaultTopic: string;
  /** The per-source Presentations tab already sits under that source's own
   * page header — suppress this component's own title there. */
  showHeader?: boolean;
}) {
  const [topic, setTopic] = useState(defaultTopic);
  const [slideCount, setSlideCount] = useState(10);
  const [style, setStyle] = useState("executive");
  const [audience, setAudience] = useState("management");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function generate() {
    if (!topic.trim()) return;
    setGenerating(true);
    setResult(null);
    const res = await fetch("/api/presentations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, slideCount, style, audience, language: locale }),
    }).catch(() => null);
    setGenerating(false);

    if (!res || !res.ok) {
      toast.error(res?.status === 409 ? t(locale, "presentations.insufficientCredits") : t(locale, "common.errorGeneric"));
      return;
    }
    const body = (await res.json()) as Result & { creditsRemaining: number };
    toast.success(`-${body.creditsCharged} ${t(locale, "credits.wallet.slides")}`);
    setResult(body);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      {showHeader && (
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t(locale, "presentations.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t(locale, "presentations.subtitle")}</p>
        </div>
      )}

      <Card className="mx-auto w-full max-w-xl">
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pres-topic">{t(locale, "presentations.form.topic")}</Label>
            <Input id="pres-topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pres-slides">{t(locale, "presentations.form.slideCount")}</Label>
              <Input
                id="pres-slides"
                type="number"
                dir="ltr"
                min={1}
                max={40}
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value) || 1)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pres-style">{t(locale, "presentations.form.style")}</Label>
              <Select value={style} onValueChange={(v) => setStyle(v ?? "executive")}>
                <SelectTrigger id="pres-style" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styleOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {t(locale, o.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pres-audience">{t(locale, "presentations.form.audience")}</Label>
            <Select value={audience} onValueChange={(v) => setAudience(v ?? "management")}>
              <SelectTrigger id="pres-audience" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {audienceOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {t(locale, o.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generate} disabled={generating || !topic.trim()} className="mt-2">
            <PresentationIcon aria-hidden className="size-4" />
            {generating ? t(locale, "presentations.generating") : t(locale, "presentations.generate")}
          </Button>
        </CardContent>
      </Card>

      {generating && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full" />
          ))}
        </div>
      )}

      {result && !generating && (
        <div>
          <p className="mb-3 text-sm font-semibold">{t(locale, "presentations.result.title")}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: result.slideCount }).map((_, i) => (
              <Card key={i} className="aspect-video">
                <CardHeader>
                  <CardTitle className="text-xs text-muted-foreground">
                    {i + 1} / {result.slideCount}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex h-full items-center justify-center text-center">
                  <p className="text-sm font-medium">{i === 0 ? result.topic : `${result.topic} — ${i + 1}`}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{t(locale, "presentations.result.stubNote")}</p>
        </div>
      )}

      {!result && !generating && <p className="text-center text-sm text-muted-foreground">{t(locale, "presentations.empty")}</p>}
    </div>
  );
}
