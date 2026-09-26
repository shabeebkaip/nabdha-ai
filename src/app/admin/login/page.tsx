import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { getLocale } from "@/lib/get-locale";
import { t } from "@/lib/i18n";
import { AdminLoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin Sign In — Nabda AI", robots: { index: false, follow: false } };

// Standalone admin sign-in, deliberately outside the (panel) auth gate so it's
// reachable while signed out. Dark, minimal, and clearly "restricted" so it
// doesn't read like the marketing/user login.
export default async function AdminLoginPage() {
  const [session, locale] = await Promise.all([auth(), getLocale()]);
  if (session?.user?.role === "admin") redirect("/admin");

  return (
    <div className="dark relative flex min-h-dvh items-center justify-center bg-background px-4 text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 50% 0%, rgba(37,71,168,0.30), transparent 65%), radial-gradient(50% 40% at 50% 100%, rgba(26,44,102,0.35), transparent 70%)",
        }}
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 ring-inset">
            <ShieldCheck aria-hidden className="size-6" />
          </span>
          <p className="mt-4 font-mono text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            {t(locale, "adminLogin.eyebrow")}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">{t(locale, "adminLogin.title")}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{t(locale, "adminLogin.subtitle")}</p>
        </div>
        <AdminLoginForm locale={locale} />
      </div>
    </div>
  );
}
