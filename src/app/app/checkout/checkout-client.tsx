"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { t, tf, type Locale } from "@/lib/i18n";
import type { PlanId } from "@/lib/pricing";

type State = "idle" | "processing" | "success" | "error";

export function CheckoutClient({
  locale,
  plan,
  cycle,
  amount,
  planName,
  credits,
}: {
  locale: Locale;
  plan: PlanId;
  cycle: "monthly" | "annual";
  amount: number;
  planName: string;
  credits: number;
}) {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  // Demo card — placeholder test values, never sent to the server (the API
  // takes only { plan, cycle } and derives price/credits itself).
  const [number, setNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12 / 28");
  const [cvc, setCvc] = useState("123");
  const [name, setName] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState("processing");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, cycle }),
    }).catch(() => null);

    if (!res || !res.ok) {
      setState("error");
      return;
    }
    setState("success");
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <span className="flex size-14 items-center justify-center rounded-full bg-success-bright/10 text-success-bright">
          <CheckCircle2 aria-hidden className="size-8" />
        </span>
        <h2 className="font-heading text-xl font-extrabold tracking-tight">{t(locale, "checkout.success.title")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {tf(locale, "checkout.success.body", { plan: planName, credits: credits.toLocaleString("en-US") })}
        </p>
        <Button size="lg" className="mt-2 w-full" onClick={() => { router.push("/app"); router.refresh(); }}>
          {t(locale, "checkout.success.cta")}
        </Button>
        <p className="text-[11px] text-muted-foreground">{t(locale, "checkout.success.receipt")}</p>
      </div>
    );
  }

  const processing = state === "processing";

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CreditCard aria-hidden className="size-4.5" />
        </span>
        <h2 className="font-heading text-base font-bold tracking-tight">{t(locale, "checkout.card.title")}</h2>
      </div>

      <form noValidate onSubmit={onSubmit} className="mt-5 flex flex-col gap-4" aria-describedby={state === "error" ? "checkout-error" : undefined}>
        {state === "error" && (
          <Alert variant="destructive" id="checkout-error" role="alert">
            <AlertDescription>{t(locale, "checkout.error")}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="card-number">{t(locale, "checkout.card.number")}</Label>
          <div className="relative">
            <Input id="card-number" dir="ltr" inputMode="numeric" required value={number} onChange={(e) => setNumber(e.target.value)} className="pe-10" />
            <CreditCard aria-hidden className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">{t(locale, "checkout.card.numberHint")}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="card-expiry">{t(locale, "checkout.card.expiry")}</Label>
            <Input id="card-expiry" dir="ltr" required value={expiry} onChange={(e) => setExpiry(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="card-cvc">{t(locale, "checkout.card.cvc")}</Label>
            <Input id="card-cvc" dir="ltr" inputMode="numeric" required value={cvc} onChange={(e) => setCvc(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="card-name">{t(locale, "checkout.card.name")}</Label>
          <Input id="card-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <Button type="submit" size="lg" disabled={processing} className="mt-2 w-full">
          {processing ? (
            <>
              <Loader2 aria-hidden className="size-4 animate-spin" />
              {t(locale, "checkout.processing")}
            </>
          ) : (
            tf(locale, "checkout.pay", { amount: amount.toLocaleString("en-US") })
          )}
        </Button>

        <p className="inline-flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <Lock aria-hidden className="size-3" />
          {t(locale, "checkout.secured")}
        </p>
      </form>
    </div>
  );
}
