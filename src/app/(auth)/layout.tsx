import type { ReactNode } from "react";
import Link from "next/link";
import { getLocale } from "@/lib/get-locale";
import { LanguageSwitcher } from "@/components/language-switcher";

// Auth screens (login/signup): single-column centered card, dark theme for
// continuity with the marketing landing page (DESIGN_SPEC §7 "02/03").
export default async function AuthLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();

  return (
    <div className="dark theme-marketing flex min-h-svh flex-col bg-background text-foreground">
      {/* Full-width hairline under the bar — without it, the split-screen
          pages (light form pane + dark showcase pane) leave a jarring hard
          corner where the dark header meets the light pane on one side
          only; the border turns it into a deliberate nav divider instead. */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/10 px-4 py-5 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span aria-hidden className="size-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
          <span className="font-heading text-base font-extrabold tracking-tight">Nabda AI</span>
        </Link>
        <LanguageSwitcher locale={locale} />
      </header>
      {/* Centering/padding now owned per-page: login stays a centered card,
          signup needs a full-bleed split-screen (see signup/page.tsx). */}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
