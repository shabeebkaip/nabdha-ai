"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Menu, Bell, LogOut, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/language-switcher";
import { NavList } from "@/components/app/nav-list";
import { ActiveSourceSwitcher } from "@/components/app/active-source-switcher";
import { t, type Locale } from "@/lib/i18n";
import type { DatasetListItem } from "@/lib/queries";
import { useState } from "react";

export function Topbar({
  locale,
  userName,
  userEmail,
  isAdmin,
  aiCreditsBalance,
  datasets,
}: {
  locale: Locale;
  userName: string;
  userEmail: string;
  isAdmin: boolean;
  aiCreditsBalance: number | null;
  datasets: DatasetListItem[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 print:hidden md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label={t(locale, "nav.menu")}
        onClick={() => setMobileOpen(true)}
      >
        <Menu aria-hidden className="size-5" />
      </Button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side={locale === "ar" ? "right" : "left"} className="w-72 p-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle>Nabda AI</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-3">
            <NavList locale={locale} isAdmin={isAdmin} onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <Link href="/app" className="flex items-center gap-2 lg:hidden">
        <span aria-hidden className="size-2 rounded-full bg-primary" />
        <span className="font-heading text-sm font-extrabold tracking-tight">Nabda AI</span>
      </Link>

      <div className="flex-1" />

      <ActiveSourceSwitcher locale={locale} datasets={datasets} />

      {aiCreditsBalance !== null && (
        <Link
          href="/app/credits"
          className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent sm:flex"
        >
          <Zap aria-hidden className="size-3.5 text-primary" />
          <span className="font-mono text-muted-foreground">{t(locale, "topbar.creditsLabel")}</span>
          <span className="nabda-numeral font-mono font-semibold">{aiCreditsBalance.toLocaleString("en-US")}</span>
        </Link>
      )}

      <LanguageSwitcher locale={locale} />

      <Button variant="ghost" size="icon" aria-label={t(locale, "topbar.notifications")} className="relative">
        <Bell aria-hidden className="size-4.5" />
        <Badge className="absolute end-0.5 top-0.5 size-2 rounded-full p-0" aria-hidden />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" aria-label={t(locale, "topbar.account")}>
              <Avatar size="sm">
                <AvatarFallback>{initials || "U"}</AvatarFallback>
              </Avatar>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <p className="font-medium text-foreground">{userName}</p>
              <p className="truncate text-xs font-normal text-muted-foreground">{userEmail}</p>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/app/settings" />}>{t(locale, "settings.title")}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} variant="destructive">
            <LogOut aria-hidden className="size-4" />
            {t(locale, "common.signOut")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
