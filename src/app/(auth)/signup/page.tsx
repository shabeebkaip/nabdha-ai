import type { Metadata } from "next";
import { getLocale } from "@/lib/get-locale";
import { SignupForm } from "./signup-form";
import { AuthShowcase } from "../_components/auth-showcase";

export const metadata: Metadata = { title: "Start Free Trial — Nabda AI" };

// Split-screen signup (DESIGN_SPEC §7 "02/03" concept, restyled to our
// system): form pane + a gradient showcase pane. Plain CSS Grid with the
// form first in DOM order mirrors automatically in RTL (grid column 1 is
// always the inline-start edge), so no `dir`-specific branching is needed —
// same trick the sidebar/logo-ticker already rely on (DESIGN_SPEC §2).
export default async function SignupPage() {
  const locale = await getLocale();
  return (
    <div className="grid flex-1 lg:grid-cols-2">
      {/* Form pane stays on the ambient dark `.theme-marketing` background so
          the dark liquid-glass AuthGlassCard reads as designed (its white/5
          surface + hairline border + top-edge highlight only work over dark).
          The showcase pane on the other side is the dark gradient. */}
      <div className="theme-cream flex flex-col justify-center bg-background px-4 py-12 text-foreground sm:px-8 md:px-12 lg:px-16">
        <SignupForm locale={locale} />
      </div>
      <AuthShowcase locale={locale} />
    </div>
  );
}
