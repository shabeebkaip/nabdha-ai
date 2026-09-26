"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { t, type Locale } from "@/lib/i18n";

export function AdminLoginForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await signIn("credentials", { email, password, scope: "admin", redirect: false });
    if (result?.error) {
      setSubmitting(false);
      setError(t(locale, "adminLogin.error"));
      return;
    }

    // Credentials were valid — but this login is admin-only. Confirm the role
    // before entering the panel; a regular user gets signed back out with a
    // clear message rather than a silent bounce to /app.
    const res = await fetch("/api/admin/check").catch(() => null);
    if (!res || !res.ok) {
      await signOut({ redirect: false });
      setSubmitting(false);
      setError(t(locale, "adminLogin.notAdmin"));
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4" aria-describedby={error ? "admin-login-error" : undefined}>
          {error && (
            <Alert variant="destructive" id="admin-login-error" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t(locale, "auth.login.email")}</Label>
            <Input id="email" type="email" dir="ltr" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
            {submitting ? t(locale, "auth.login.submitting") : t(locale, "adminLogin.submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
