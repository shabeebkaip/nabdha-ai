import type { DictKey } from "@/lib/i18n";
import { LayoutDashboard, Database, Sparkles, Wallet, Settings, ShieldCheck, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  labelKey: DictKey;
  icon: LucideIcon;
}

// Primary nav — pruned to the 5-item IA: a per-source detail page
// (/app/data/[id], tabbed: Overview/Insights/Recommendations/Action
// Plan/Reports/Presentations/Ask AI) now carries what Insights,
// Recommendations, Reports, and Presentations used to be as separate nav
// items, and the topbar's ActiveSourceSwitcher is how you get there from
// anywhere — so those top-level items (plus the never-primary AI
// Solutions/Consultation/Training/Integrations/Billing items) are removed
// from primary nav. Their route files are untouched (no 404s), just not
// linked from here.
export const primaryNavItems: NavItem[] = [
  { href: "/app", labelKey: "appNav.dashboard", icon: LayoutDashboard },
  { href: "/app/data", labelKey: "appNav.myData", icon: Database },
  { href: "/app/analyst", labelKey: "appNav.analyst", icon: Sparkles },
  { href: "/app/credits", labelKey: "appNav.credits", icon: Wallet },
];

export const settingsNavItem: NavItem = {
  href: "/app/settings",
  labelKey: "appNav.settings",
  icon: Settings,
};

export const adminNavItem: NavItem = {
  href: "/admin",
  labelKey: "appNav.admin",
  icon: ShieldCheck,
};
