import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getWallets } from "@/lib/credits";
import { getLocale } from "@/lib/get-locale";
import { listDatasets } from "@/lib/queries";
import { t } from "@/lib/i18n";
import { NavList } from "@/components/app/nav-list";
import { Topbar } from "@/components/app/topbar";

// App shell: sidebar (lg+) + topbar, shared by every /app/* screen. Auth is
// gated by src/proxy.ts (redirects unauthenticated users before this ever
// renders); this layout re-checks defensively since a layout can't rely on
// proxy alone for authoritative tenant scoping (see docs/API_CONTRACT.md).
export default async function AppLayout({ children }: { children: ReactNode }) {
  const [session, locale] = await Promise.all([auth(), getLocale()]);
  if (!session?.user?.companyId) redirect("/login");

  const [wallets, datasets] = await Promise.all([
    getWallets(session.user.companyId).catch(() => []),
    listDatasets(session.user.companyId).catch(() => []),
  ]);
  const aiWallet = wallets.find((w) => w.walletType === "ai_credits");
  const analyzedDatasets = datasets.filter((d) => d.healthScore != null);

  return (
    <div className="flex min-h-full bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t(locale, "common.skipToContent")}
      </a>

      <aside className="hidden w-64 shrink-0 flex-col border-e border-border bg-card print:hidden lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <span aria-hidden className="size-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
          <span className="font-heading text-base font-extrabold tracking-tight">Nabda AI</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavList locale={locale} isAdmin={session.user.role === "admin"} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          locale={locale}
          userName={session.user.name ?? session.user.email ?? "User"}
          userEmail={session.user.email ?? ""}
          isAdmin={session.user.role === "admin"}
          aiCreditsBalance={aiWallet?.balance ?? null}
          datasets={analyzedDatasets}
        />
        <main id="main-content" className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
