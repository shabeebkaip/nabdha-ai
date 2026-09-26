"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { t, type Locale } from "@/lib/i18n";
import { primaryNavItems, settingsNavItem, adminNavItem, type NavItem } from "@/components/app/nav-items";

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, locale, active, onNavigate }: { item: NavItem; locale: Locale; active: boolean; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        active
          ? "bg-accent text-foreground before:absolute before:inset-block-start-1 before:inset-block-end-1 before:inset-inline-start-0 before:w-0.5 before:rounded-full before:bg-primary"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      }`}
    >
      <Icon aria-hidden className="size-4 shrink-0" />
      <span className="truncate">{t(locale, item.labelKey)}</span>
    </Link>
  );
}

export function NavList({
  locale,
  isAdmin,
  onNavigate,
}: {
  locale: Locale;
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex flex-1 flex-col gap-1">
      {primaryNavItems.map((item) => (
        <NavLink key={item.href} item={item} locale={locale} active={isActive(pathname, item.href)} onNavigate={onNavigate} />
      ))}
      <Separator className="my-2" />
      {isAdmin && (
        <NavLink item={adminNavItem} locale={locale} active={isActive(pathname, adminNavItem.href)} onNavigate={onNavigate} />
      )}
      <NavLink item={settingsNavItem} locale={locale} active={isActive(pathname, settingsNavItem.href)} onNavigate={onNavigate} />
    </nav>
  );
}
