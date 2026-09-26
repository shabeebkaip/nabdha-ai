"use client";

// Persistent "which data source am I looking at" indicator + switcher in the
// topbar. Reads the active dataset id straight off the URL (usePathname)
// instead of prop-threading it down from every /app/data/[id] page — one
// spot to derive "am I on a source's detail page" from, matching how
// nav-list.tsx already derives active nav state from usePathname.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { datasetIcon, datasetIconElement, datasetLabel } from "@/lib/dataset-display";
import { t, type Locale } from "@/lib/i18n";
import type { DatasetListItem } from "@/lib/queries";

export function ActiveSourceSwitcher({ locale, datasets }: { locale: Locale; datasets: DatasetListItem[] }) {
  const pathname = usePathname();
  if (datasets.length === 0) return null;

  const activeId = pathname.match(/^\/app\/data\/([^/]+)/)?.[1];
  const active = activeId ? datasets.find((d) => d.id === activeId) : undefined;
  const activeIconEl = active ? (
    datasetIconElement(active.sourceType, "size-3.5 shrink-0 text-primary")
  ) : (
    <LayoutDashboard aria-hidden className="size-3.5 shrink-0 text-primary" />
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="hidden max-w-56 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
            aria-label={t(locale, "topbar.switchSource")}
          >
            {activeIconEl}
            <span className="truncate">
              {t(locale, "topbar.viewing")}: {active ? datasetLabel(active, locale) : t(locale, "topbar.allSources")}
            </span>
            <ChevronDown aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
          </button>
        }
      />
      <DropdownMenuContent align="start" className="max-h-80 w-64 overflow-y-auto">
        <DropdownMenuLabel>{t(locale, "topbar.switchSource")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/app" />}>
          <LayoutDashboard aria-hidden className="size-4" />
          {t(locale, "topbar.allSources")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {datasets.map((d) => {
          const Icon = datasetIcon(d.sourceType);
          return (
            <DropdownMenuItem key={d.id} render={<Link href={`/app/data/${d.id}`} />}>
              <Icon aria-hidden className="size-4" />
              <span className="truncate">{datasetLabel(d, locale)}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
