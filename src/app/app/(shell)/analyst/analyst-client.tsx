"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { Send, Lightbulb, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { t, tf, type DictKey, type Locale } from "@/lib/i18n";
import type { AnalystAnswer } from "@/lib/ai/types";

export interface AnalystSourceOption {
  id: string;
  label: string;
}

const suggestedKeys: DictKey[] = [
  "analyst.suggested.1",
  "analyst.suggested.2",
  "analyst.suggested.3",
  "analyst.suggested.4",
  "analyst.suggested.5",
];

interface Exchange {
  id: string;
  question: string;
  status: "loading" | "done" | "error";
  answer?: AnalystAnswer;
  reveal: "answer" | "reasons" | "actions" | "done";
}

async function askAnalyst(question: string, datasetId?: string): Promise<AnalystAnswer | null> {
  const res = await fetch("/api/analyst/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datasetId ? { question, datasetId } : { question }),
  }).catch(() => null);
  if (!res || !res.ok) return null;
  return res.json();
}

export function AnalystClient({
  locale,
  datasetId,
  datasetLabel,
  sourceOptions,
  defaultSourceId,
  showHeader = true,
}: {
  locale: Locale;
  /** Fixed scope — used by the per-source Ask AI tab. When set, no source
   * picker is rendered; every question is scoped to this one dataset. */
  datasetId?: string;
  /** Display label for the fixed `datasetId` scope (e.g. the source's file
   * name) — shown in the "Based on" caption. Ignored when `sourceOptions` is
   * used instead (the picker's own label is used there). */
  datasetLabel?: string;
  /** Rendered as a picker at the top — used by the global /app/analyst page
   * so the user can choose which source (or "All Sources") to ask about. */
  sourceOptions?: AnalystSourceOption[];
  defaultSourceId?: string;
  /** The per-source Ask AI tab already sits under that source's own page
   * header — suppress this component's own title there so it isn't shown
   * twice. */
  showHeader?: boolean;
}) {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [input, setInput] = useState("");
  const [selectedSourceId, setSelectedSourceId] = useState(defaultSourceId ?? "all");
  const idRef = useRef(0);
  const scopedId = datasetId ?? (sourceOptions ? (selectedSourceId === "all" ? undefined : selectedSourceId) : undefined);
  // Always a real, current label — the "Based on" caption must reflect
  // whatever source the question was actually scoped to (bug: it used to be
  // a hardcoded "Nabda Retail Demo dataset" string regardless of which
  // source was active).
  const scopedLabel =
    (datasetId ? datasetLabel : sourceOptions && selectedSourceId !== "all" ? sourceOptions.find((o) => o.id === selectedSourceId)?.label : undefined) ??
    t(locale, "analyst.allSources");

  async function send(question: string) {
    const q = question.trim();
    if (!q) return;
    const id = String(idRef.current++);
    setExchanges((prev) => [...prev, { id, question: q, status: "loading", reveal: "answer" }]);
    setInput("");

    const answer = await askAnalyst(q, scopedId);
    if (!answer) {
      setExchanges((prev) => prev.map((e) => (e.id === id ? { ...e, status: "error" } : e)));
      return;
    }
    setExchanges((prev) => prev.map((e) => (e.id === id ? { ...e, status: "done", answer, reveal: "answer" } : e)));
    // Staged reveal — Answer, then Reasons, then Actions (DESIGN_SPEC Flow C).
    window.setTimeout(() => {
      setExchanges((prev) => prev.map((e) => (e.id === id ? { ...e, reveal: "reasons" } : e)));
    }, 450);
    window.setTimeout(() => {
      setExchanges((prev) => prev.map((e) => (e.id === id ? { ...e, reveal: "actions" } : e)));
    }, 900);
  }

  function retry(id: string) {
    const exchange = exchanges.find((e) => e.id === id);
    if (!exchange) return;
    setExchanges((prev) => prev.filter((e) => e.id !== id));
    send(exchange.question);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      {showHeader && (
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t(locale, "analyst.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t(locale, "analyst.subtitle")}</p>
        </div>
      )}

      {sourceOptions && (
        <div className="flex flex-col gap-1.5 sm:max-w-xs">
          <Label htmlFor="analyst-source">{t(locale, "analyst.sourceLabel")}</Label>
          <Select value={selectedSourceId} onValueChange={(v) => setSelectedSourceId(v ?? "all")}>
            <SelectTrigger id="analyst-source" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t(locale, "analyst.allSources")}</SelectItem>
              {sourceOptions.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {suggestedKeys.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => send(t(locale, k))}
            className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t(locale, k)}
          </button>
        ))}
      </div>

      <div className="flex min-h-[40vh] flex-col gap-4" aria-live="polite">
        {exchanges.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">{t(locale, "analyst.empty")}</p>}
        {exchanges.map((exchange) => (
          <div key={exchange.id} className="flex flex-col gap-2">
            <p className="self-end rounded-2xl bg-accent px-4 py-2 text-sm font-medium">{exchange.question}</p>

            {exchange.status === "loading" && (
              <Card>
                <CardContent className="flex flex-col gap-2 p-5">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            )}

            {exchange.status === "error" && (
              <Card>
                <CardContent className="flex items-center justify-between gap-3 p-5">
                  <p className="text-sm text-destructive">{t(locale, "analyst.error")}</p>
                  <Button size="sm" variant="outline" onClick={() => retry(exchange.id)}>
                    <RotateCcw aria-hidden className="size-3.5" />
                    {t(locale, "common.retry")}
                  </Button>
                </CardContent>
              </Card>
            )}

            {exchange.status === "done" && exchange.answer && (
              <Card>
                <CardContent className="flex flex-col gap-4 p-5">
                  <div>
                    <p className="font-mono text-[11px] font-semibold tracking-[0.1em] text-primary uppercase">
                      {t(locale, "analyst.answer")}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground">{exchange.answer.answer}</p>
                  </div>

                  {(exchange.reveal === "reasons" || exchange.reveal === "actions") && exchange.answer.reasons.length > 0 && (
                    <div className="animate-in fade-in duration-300">
                      <p className="flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-[0.1em] text-insight uppercase">
                        <Lightbulb aria-hidden className="size-3.5" />
                        {t(locale, "analyst.reasons")}
                      </p>
                      <ul className="mt-1.5 flex flex-col gap-1 text-sm text-muted-foreground">
                        {exchange.answer.reasons.map((r, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span aria-hidden>·</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {exchange.reveal === "actions" && exchange.answer.actions.length > 0 && (
                    <div className="animate-in fade-in duration-300">
                      <p className="flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-[0.1em] text-success uppercase">
                        <CheckCircle2 aria-hidden className="size-3.5" />
                        {t(locale, "analyst.actions")}
                      </p>
                      <ul className="mt-1.5 flex flex-col gap-1 text-sm text-foreground/90">
                        {exchange.answer.actions.map((a, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span aria-hidden>·</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                    {tf(locale, "analyst.basedOn", { source: scopedLabel })}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 flex items-end gap-2 border-t border-border bg-background py-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t(locale, "analyst.placeholder")}
          className="min-h-11 flex-1 resize-none"
          rows={1}
        />
        <Button size="icon-lg" aria-label={t(locale, "analyst.send")} onClick={() => send(input)} disabled={!input.trim()}>
          <Send aria-hidden className="size-4 icon-directional" />
        </Button>
      </div>
    </div>
  );
}
