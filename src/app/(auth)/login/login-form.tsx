"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { t, type Locale } from "@/lib/i18n";
import { AuthGlassCard } from "../_components/auth-glass-card";

export function LoginForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await signIn("credentials", { email, password, redirect: false });
    setSubmitting(false);
    if (result?.error) {
      setError(t(locale, "auth.login.error"));
      return;
    }
    // QA bug #4 fix: admins land on /admin, not /app, when there's no
    // specific callbackUrl to honor (e.g. a non-admin bounced from a
    // protected page still lands back on that exact page).
    const session = await getSession();
    const fallback = session?.user?.role === "admin" ? "/admin" : "/app";
    const callbackUrl = searchParams.get("callbackUrl");
    router.push(callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : fallback);
    router.refresh();
  }

  return (
    <AuthGlassCard>
      <p className="inline-flex items-center gap-2.5 font-mono text-xs font-semibold tracking-[0.14em] text-primary uppercase">
        <span aria-hidden className="h-px w-5 bg-primary" />
        {t(locale, "auth.login.eyebrow")}
      </p>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{t(locale, "auth.login.title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t(locale, "auth.login.subtitle")}</p>

      <div className="mt-8">
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4" aria-describedby={error ? "login-error" : undefined}>
          {error && (
            <Alert variant="destructive" id="login-error" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t(locale, "auth.login.email")}</Label>
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
            <Label htmlFor="password">{t(locale, "auth.login.password")}</Label>
            <Input
              id="password"
              type="password"
              dir="ltr"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" disabled={submitting} className="mt-2 w-full">
            {submitting ? t(locale, "auth.login.submitting") : t(locale, "auth.login.submit")}
          </Button>
          <p className="text-center text-xs text-muted-foreground">{t(locale, "auth.login.demoHint")}</p>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t(locale, "auth.login.noAccount")}{" "}
          <Link
            href="/signup"
            className="rounded-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t(locale, "auth.login.signupLink")}
          </Link>
        </p>
      </div>
    </AuthGlassCard>
  );
}
