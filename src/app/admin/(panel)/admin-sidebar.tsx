"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { ShieldCheck, LayoutDashboard, Users, Inbox, SlidersHorizontal, ArrowUpRight, LogOut, type LucideIcon } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { t, type DictKey, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type AdminTab = "overview" | "users" | "leads" | "config";

const NAV: { tab: AdminTab; label: DictKey; icon: LucideIcon }[] = [
  { tab: "overview", label: "admin.tab.overview", icon: LayoutDashboard },
  { tab: "users", label: "admin.tab.users", icon: Users },
  { tab: "leads", label: "admin.tab.leads", icon: Inbox },
  { tab: "config", label: "admin.tab.config", icon: SlidersHorizontal },
];

function useActive(): AdminTab {
  const tab = useSearchParams().get("tab");
  return (["users", "leads", "config"] as const).includes(tab as never) ? (tab as AdminTab) : "overview";
}

// Desktop dark rail. Content canvas stays light — the "dark rail + light
// canvas" pattern gives the panel clear structure instead of one flat surface.
export function AdminSidebar({ locale, counts }: { locale: Locale; counts: Partial<Record<AdminTab, number>> }) {
  const active = useActive();
  return (
    <aside className="dark sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-[hsl(var(--nabda-brand-ink))] text-foreground lg:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25 ring-inset">
          <ShieldCheck aria-hidden className="size-5" />
        </span>
        <div>
          <p className="font-heading text-sm font-extrabold tracking-tight">{t(locale, "admin.title")}</p>
          <p className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">{t(locale, "adminNav.tagline")}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2">
        <ul className="flex flex-col gap-1">
          {NAV.map((item) => {
            const on = active === item.tab;
            const Icon = item.icon;
            return (
              <li key={item.tab}>
                <Link
                  href={`/admin?tab=${item.tab}`}
                  scroll={false}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    on ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                  )}
                >
                  <span aria-hidden className={cn("absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-primary transition-opacity", on ? "opacity-100" : "opacity-0")} />
                  <Icon aria-hidden className={cn("size-4.5", on ? "text-primary" : "")} />
                  <span className="flex-1">{t(locale, item.label)}</span>
                  {counts[item.tab] != null && (
                    <span className={cn("rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold", on ? "bg-primary/20 text-primary" : "bg-white/[0.06] text-muted-foreground")}>
                      {counts[item.tab]}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto border-t border-white/[0.08] px-3 py-4">
        <Link
          href="/app"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
        >
          <ArrowUpRight aria-hidden className="size-4.5 icon-directional" />
          {t(locale, "adminNav.backToApp")}
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
        >
          <LogOut aria-hidden className="size-4.5 icon-directional" />
          {t(locale, "common.signOut")}
        </button>
        <div className="mt-2 px-1">
          <LanguageSwitcher locale={locale} />
        </div>
      </div>
    </aside>
  );
}

// Mobile: the same nav as a horizontal scroll strip below the header.
export function AdminMobileNav({ locale }: { locale: Locale }) {
  const active = useActive();
  return (
    <nav className="scrollbar-none flex gap-2 overflow-x-auto border-b border-border bg-background px-4 py-2.5 lg:hidden">
      {NAV.map((item) => {
        const on = active === item.tab;
        const Icon = item.icon;
        return (
          <Link
            key={item.tab}
            href={`/admin?tab=${item.tab}`}
            scroll={false}
            aria-current={on ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            <Icon aria-hidden className="size-4" />
            {t(locale, item.label)}
          </Link>
        );
      })}
    </nav>
  );
}
