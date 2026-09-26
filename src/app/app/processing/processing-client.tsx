"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Loader2,
  XCircle,
  UploadCloud,
  ShieldCheck,
  Sparkles,
  Layers,
  Cpu,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { t, type Locale, type DictKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Stage list mirrors DESIGN_SPEC §4 Flow A step 7. The live AI engine can
// take ~20-26s (see ai-engineer note) — stages advance on a timer up to the
// second-to-last stage, then HOLD there until the real fetch resolves, so
// the animation never lies about being finished before the network call
// actually completes.
const STAGES: { key: DictKey; icon: LucideIcon }[] = [
  { key: "processing.stage.upload", icon: UploadCloud },
  { key: "processing.stage.validating", icon: ShieldCheck },
  { key: "processing.stage.cleaning", icon: Sparkles },
  { key: "processing.stage.classifying", icon: Layers },
  { key: "processing.stage.analyzing", icon: Cpu },
  { key: "processing.stage.generating", icon: FileText },
];
const HOLD_STAGE_INDEX = STAGES.length - 1;
const STAGE_INTERVAL_MS = 1400;
const MIN_TOTAL_MS = 3000; // DESIGN_SPEC: min 3s even if the response is instant.

export function ProcessingClient({ locale, datasetId }: { locale: Locale; datasetId: string | null }) {
  const router = useRouter();
  const [stageIndex, setStageIndex] = useState(0);
  const [status, setStatus] = useState<"running" | "done" | "error">("running");
  const startedAt = useRef(0);

  async function run() {
    if (!datasetId) {
      setStatus("error");
      return;
    }
    setStatus("running");
    setStageIndex(0);
    startedAt.current = Date.now();

    const res = await fetch("/api/analysis/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ datasetId }),
    }).catch(() => null);

    const elapsed = Date.now() - startedAt.current;
    const remaining = Math.max(0, MIN_TOTAL_MS - elapsed);

    if (!res || !res.ok) {
      window.setTimeout(() => setStatus("error"), remaining);
      return;
    }

    window.setTimeout(() => {
      setStageIndex(STAGES.length); // "Ready"
      setStatus("done");
      // Land back on My Data — the just-analyzed source now shows there as
      // saved, with its health score and a "View results" link into the full
      // dashboard — instead of dropping the user onto the generic dashboard.
      window.setTimeout(() => {
        router.push("/app/data");
        router.refresh();
      }, 1100);
    }, remaining);
  }

  useEffect(() => {
    // ponytail: defer to a microtask so `run`'s synchronous setState calls
    // (before its first `await`) don't fire inside the effect's own
    // synchronous execution (react-hooks/set-state-in-effect) — behavior is
    // identical, just scheduled one microtask later.
    queueMicrotask(() => {
      run();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId]);

  useEffect(() => {
    if (status !== "running") return;
    const id = window.setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, HOLD_STAGE_INDEX));
    }, STAGE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [status]);

  async function useDemoInstead() {
    setStatus("running");
    const res = await fetch("/api/datasets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceType: "demo" }),
    }).catch(() => null);
    const body = res && res.ok ? ((await res.json()) as { id: string }) : null;
    if (!body) {
      setStatus("error");
      return;
    }
    router.replace(`/app/processing?datasetId=${body.id}`);
    router.refresh();
  }

  if (status === "error") {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-danger/10 text-danger">
            <XCircle aria-hidden className="size-8" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t(locale, "processing.error.title")}</h1>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{t(locale, "processing.error.body")}</p>
          </div>
          <div className="mt-2 flex gap-3">
            <Button variant="outline" onClick={run}>
              {t(locale, "processing.error.retry")}
            </Button>
            <Button onClick={useDemoInstead}>{t(locale, "processing.error.useDemo")}</Button>
          </div>
        </div>
      </Shell>
    );
  }

  const done = status === "done";
  const progressPct = done ? 100 : Math.round(((stageIndex + 1) / (STAGES.length + 1)) * 100);
  const R = 34;
  const C = 2 * Math.PI * R;

  return (
    <Shell>
      <div className="flex flex-col items-center text-center">
        {/* Progress ring around the engine mark. */}
        <div className="relative size-24">
          <svg viewBox="0 0 80 80" className="size-24 -rotate-90" aria-hidden>
            <circle cx="40" cy="40" r={R} fill="none" strokeWidth="6" className="stroke-border" />
            <circle
              cx="40"
              cy="40"
              r={R}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              className={done ? "stroke-success" : "stroke-primary"}
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progressPct / 100)}
              style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center">
            {done ? (
              <Check aria-hidden className="size-8 text-success" />
            ) : (
              <Loader2 aria-hidden className="size-7 animate-spin text-primary motion-reduce:animate-none" />
            )}
          </span>
        </div>

        <h1 className="mt-6 text-xl font-bold tracking-tight sm:text-2xl">
          {done ? t(locale, "processing.status.done") : t(locale, "processing.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t(locale, "processing.subtitle")}</p>

        {/* Vertical stepper with a connecting rail + per-stage icons. */}
        <ol className="relative mt-8 flex w-full flex-col gap-1 text-start" aria-live="polite">
          <div aria-hidden className="absolute inset-y-4 start-[19px] w-px bg-border" />
          {STAGES.map((stage, i) => {
            const complete = i < stageIndex || done;
            const active = i === stageIndex && status === "running";
            const Icon = stage.icon;
            return (
              <li
                key={stage.key}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-2 py-2 transition-colors",
                  active && "bg-primary/5"
                )}
              >
                <span
                  className={cn(
                    "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ring-4 ring-background transition-colors",
                    complete
                      ? "bg-success/15 text-success"
                      : active
                        ? "bg-primary/12 text-primary"
                        : "bg-muted text-muted-foreground/60"
                  )}
                >
                  {complete ? <Check aria-hidden className="size-4" /> : <Icon aria-hidden className="size-4" />}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-full ring-2 ring-primary/40 motion-safe:animate-ping"
                    />
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm transition-colors",
                    complete ? "font-medium text-foreground" : active ? "font-semibold text-primary" : "text-muted-foreground/60"
                  )}
                >
                  {t(locale, stage.key)}
                </span>
                {active && (
                  <Loader2 aria-hidden className="ms-auto size-4 animate-spin text-primary motion-reduce:animate-none" />
                )}
                {complete && <Check aria-hidden className="ms-auto size-4 text-success" />}
              </li>
            );
          })}
        </ol>
      </div>
    </Shell>
  );
}

// Centered glass card on a subtle radial-glow backdrop (apple-design material
// + one orchestrated focal moment).
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 start-1/2 size-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
      />
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card/80 p-8 shadow-[0_30px_70px_-30px_rgba(2,6,23,0.25)] backdrop-blur-xl sm:p-10">
        <span aria-hidden className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        {children}
      </div>
    </div>
  );
}
