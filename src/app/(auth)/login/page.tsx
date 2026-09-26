import { Suspense } from "react";
import type { Metadata } from "next";
import { getLocale } from "@/lib/get-locale";
import { LoginForm } from "./login-form";
import { AuthShowcase } from "../_components/auth-showcase";

export const metadata: Metadata = { title: "Sign In — Nabda AI" };

// Same split-screen shell as /signup (DESIGN_SPEC §7 "02/03") — form pane +
// shared gradient showcase — so the two auth screens read as one system.
export default async function LoginPage() {
  const locale = await getLocale();
  return (
    <div className="grid flex-1 lg:grid-cols-2">
      {/* Same dark form pane as /signup so the glass card renders correctly
          and the two auth screens read as one system. */}
      <div className="theme-cream flex flex-col justify-center bg-background px-4 py-12 text-foreground sm:px-8 md:px-12 lg:px-16">
        <Suspense>
          <LoginForm locale={locale} />
        </Suspense>
      </div>
      <AuthShowcase locale={locale} />
    </div>
  );
}
