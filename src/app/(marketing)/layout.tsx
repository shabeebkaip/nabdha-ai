import type { ReactNode } from "react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { getLocale } from "@/lib/get-locale";

// Marketing surface is always dark ("Precision Intelligence") regardless of
// the app's light theme — see docs/DESIGN_SPEC.md §1.5 `.theme-marketing`.
// `.dark` supplies every shadcn token; `.theme-marketing` just deepens
// bg/fg to the true void-black.
export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();

  return (
    <div className="dark theme-marketing relative flex min-h-full flex-col bg-background text-foreground">
      {/* Midnight-blue ambient wash so the dark sections read as deep navy
          depth rather than flat pitch-black. Viewport-anchored (fixed) for an
          even glow while scrolling; light `.theme-cream` sections paint an
          opaque background over it, so only the dark sections pick it up. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 12% 6%, rgba(37,71,168,0.38), transparent 68%), radial-gradient(55% 48% at 90% 26%, rgba(26,44,102,0.42), transparent 70%), radial-gradient(75% 55% at 50% 106%, rgba(37,71,168,0.30), transparent 70%)",
        }}
      />
      <div className="relative z-10 flex min-h-full flex-col">
        <SiteHeader locale={locale} />
        <main className="flex-1">{children}</main>
        <SiteFooter locale={locale} />
      </div>
    </div>
  );
}
