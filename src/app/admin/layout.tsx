import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getLocale } from "@/lib/get-locale";
import { t } from "@/lib/i18n";
import { SignOutButton } from "./sign-out-button";

// Separate shell from the app (/app/*) per DESIGN_SPEC §3.1 — same token
// system, its own minimal topbar (no sidebar needed for 3 tabs).
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const [session, locale] = await Promise.all([auth(), getLocale()]);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/app");

  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <ShieldCheck aria-hidden className="size-5 text-primary" />
          <span className="font-heading text-base font-extrabold tracking-tight">{t(locale, "admin.title")}</span>
        </Link>
        <div className="flex-1" />
        <Button render={<Link href="/app" />} variant="ghost" size="sm">
          Nabda AI App
        </Button>
        <LanguageSwitcher locale={locale} />
        <SignOutButton label={t(locale, "common.signOut")} />
      </header>
      <main className="px-4 py-6 md:px-6 lg:px-8">{children}</main>
    </div>
  );
}
