"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { t, type Locale } from "@/lib/i18n";
import { industryOptions, companySizeOptions } from "@/lib/options";
import { AuthGlassCard } from "../_components/auth-glass-card";

export function SignupForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // When arriving from "Subscribe" while logged out, return to checkout after
  // account creation instead of the default onboarding.
  const callbackUrl = searchParams.get("callbackUrl");
  const safeCallback = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : null;
  const loginHref = safeCallback ? `/login?callbackUrl=${encodeURIComponent(safeCallback)}` : "/login";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    // Client-side checks for what `noValidate` (used for the custom Alert
    // styling instead of native browser bubbles) otherwise silently skips —
    // without these, a too-short password or empty field reaches the server,
    // gets a 400, and the user only ever sees the generic
    // "couldn't create account" message with no idea what to fix.
    if (!name.trim() || !email.trim() || !companyName.trim() || !industry || !companySize) {
      setError(t(locale, "onboarding.error.required"));
      return;
    }
    if (password.length < 8) {
      setError(t(locale, "auth.signup.errorPasswordShort"));
      return;
    }
    setSubmitting(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, companyName, industry, companySize }),
    }).catch(() => null);

    if (!res) {
      setSubmitting(false);
      setError(t(locale, "auth.signup.errorGeneric"));
      return;
    }
    if (!res.ok) {
      setSubmitting(false);
      const body = (await res.json().catch(() => null)) as { error?: { code?: string } } | null;
      setError(
        body?.error?.code === "EMAIL_TAKEN" ? t(locale, "auth.signup.errorEmailTaken") : t(locale, "auth.signup.errorGeneric")
      );
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setSubmitting(false);
    if (result?.error) {
      // Account was created but auto-signin failed (rare) — send to login.
      router.push(loginHref);
      return;
    }
    router.push(safeCallback ?? "/app/onboarding");
    router.refresh();
  }

  return (
    <AuthGlassCard>
      <p className="inline-flex items-center gap-2.5 font-mono text-xs font-semibold tracking-[0.14em] text-primary uppercase">
        <span aria-hidden className="h-px w-5 bg-primary" />
        {t(locale, "auth.signup.eyebrow")}
      </p>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{t(locale, "auth.signup.title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t(locale, "auth.signup.subtitle")}</p>

      <div className="mt-8">
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4" aria-describedby={error ? "signup-error" : undefined}>
          {error && (
            <Alert variant="destructive" id="signup-error" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">{t(locale, "auth.signup.name")}</Label>
            <Input id="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t(locale, "auth.signup.email")}</Label>
            <Input
              id="email"
              type="email"
              dir="ltr"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t(locale, "auth.signup.password")}</Label>
            <Input
              id="password"
              type="password"
              dir="ltr"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t(locale, "auth.signup.passwordHint")}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="companyName">{t(locale, "auth.signup.companyName")}</Label>
            <Input id="companyName" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="industry">{t(locale, "auth.signup.industry")}</Label>
              <Select value={industry} onValueChange={(v) => setIndustry(v ?? "")} required>
                <SelectTrigger id="industry" className="w-full">
                  <SelectValue placeholder={t(locale, "auth.signup.industry")} />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {t(locale, opt.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="companySize">{t(locale, "auth.signup.companySize")}</Label>
              <Select value={companySize} onValueChange={(v) => setCompanySize(v ?? "")} required>
                <SelectTrigger id="companySize" className="w-full">
                  <SelectValue placeholder={t(locale, "auth.signup.companySize")} />
                </SelectTrigger>
                <SelectContent>
                  {companySizeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {t(locale, opt.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" size="lg" disabled={submitting} className="mt-2 w-full">
            {submitting ? t(locale, "auth.signup.submitting") : t(locale, "auth.signup.submit")}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t(locale, "auth.signup.haveAccount")}{" "}
          <Link
            href={loginHref}
            className="rounded-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t(locale, "auth.signup.loginLink")}
          </Link>
        </p>
      </div>
    </AuthGlassCard>
  );
}
