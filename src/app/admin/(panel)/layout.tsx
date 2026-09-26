import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, leads } from "@/db/schema";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getLocale } from "@/lib/get-locale";
import { t } from "@/lib/i18n";
import { AdminSidebar, AdminMobileNav } from "./admin-sidebar";
import { SignOutButton } from "./sign-out-button";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const [session, locale] = await Promise.all([auth(), getLocale()]);
  // Admin has its own sign-in surface (/admin/login), separate from the app's
  // user login — send anyone unauthenticated there, and bounce non-admins that
  // are signed in as a regular user back to the app.
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "admin") redirect("/app");

  const [userCountRow, leadCountRow] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(users),
    db.select({ n: sql<number>`count(*)::int` }).from(leads),
  ]);

  return (
    <div className="flex min-h-dvh bg-muted/40 text-foreground">
      <AdminSidebar locale={locale} counts={{ users: userCountRow[0]?.n ?? 0, leads: leadCountRow[0]?.n ?? 0 }} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Compact mobile header (desktop puts identity + actions in the rail). */}
        <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4 lg:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <ShieldCheck aria-hidden className="size-5 text-primary" />
            <span className="font-heading text-sm font-extrabold tracking-tight">{t(locale, "admin.title")}</span>
          </Link>
          <div className="flex-1" />
          <LanguageSwitcher locale={locale} />
          <SignOutButton label={t(locale, "common.signOut")} />
        </header>
        <AdminMobileNav locale={locale} />

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
