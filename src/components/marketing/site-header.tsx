import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { t, type Locale } from "@/lib/i18n";

// Top-level nav. Hash links route through "/" so they work from any page
// (Next.js scrolls to the hash on arrival).
function topLinks(locale: Locale): { href: string; label: string }[] {
  return [
    { href: "/#capabilities", label: t(locale, "nav.platform") },
    { href: "/#how-it-works", label: t(locale, "nav.howItWorks") },
    { href: "/pricing", label: t(locale, "nav.pricing") },
  ];
}

// Solutions = the professional-services pages, grouped under one menu.
function solutionLinks(locale: Locale): { href: string; label: string }[] {
  return [
    { href: "/ai-solutions", label: t(locale, "solutions.aiSolutions.title") },
    { href: "/consultation", label: t(locale, "solutions.consultation.title") },
    { href: "/training", label: t(locale, "solutions.training.title") },
    { href: "/integration", label: t(locale, "nav.integrations") },
    { href: "/enterprise", label: t(locale, "solutions.enterprise.title") },
  ];
}

const linkClass =
  "rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function SiteHeader({ locale }: { locale: Locale }) {
  const top = topLinks(locale);
  const solutions = solutionLinks(locale);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/95 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/85">
      {/* Scroll-edge highlight (material): a faint bright line along the top. */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span aria-hidden className="size-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
          <span className="font-heading text-base font-extrabold tracking-tight">Nabda AI</span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8 whitespace-nowrap">
            <li>
              <Link href="/#capabilities" className={linkClass}>
                {t(locale, "nav.platform")}
              </Link>
            </li>
            <li>
              <Link href="/#how-it-works" className={linkClass}>
                {t(locale, "nav.howItWorks")}
              </Link>
            </li>

            {/* Solutions dropdown — CSS only. focus-within on the <li> opens it
                when the trigger is focused, so keyboard users can Tab into the
                items; hover opens it for pointer users. No JS/deps. */}
            <li className="group/sol relative">
              <Link href="/#solutions" className={`flex items-center gap-1 ${linkClass}`} aria-haspopup="menu">
                {t(locale, "nav.solutions")}
                <ChevronDown aria-hidden className="size-4 opacity-70 transition-transform duration-200 group-hover/sol:rotate-180" />
              </Link>
              <div className="invisible absolute start-0 top-full pt-3 opacity-0 transition-[opacity,transform] duration-200 group-hover/sol:visible group-hover/sol:opacity-100 group-focus-within/sol:visible group-focus-within/sol:opacity-100">
                <div className="w-64 rounded-xl border border-white/10 bg-popover/95 p-2 shadow-[0_24px_50px_-20px_rgba(2,6,23,0.7)] backdrop-blur-xl">
                  <p className="px-3 pt-1.5 pb-2 font-mono text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    {t(locale, "nav.solutionsMenuDesc")}
                  </p>
                  <ul>
                    {solutions.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground focus-visible:outline-none"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>

            <li>
              <Link href="/pricing" className={linkClass}>
                {t(locale, "nav.pricing")}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher locale={locale} />
          <Link href="/login" className={linkClass}>
            {t(locale, "nav.signIn")}
          </Link>
          <Button render={<Link href="/signup" />} size="lg">
            {t(locale, "nav.startTrial")}
          </Button>
        </div>

        {/* Mobile: native <details> disclosure — keyboard/AT accessible for free. */}
        <details className="group lg:hidden">
          <summary
            aria-label={t(locale, "nav.menu")}
            className="flex size-11 cursor-pointer list-none items-center justify-center rounded-lg border border-border text-foreground [&::-webkit-details-marker]:hidden"
          >
            <span aria-hidden className="text-lg leading-none">☰</span>
          </summary>
          <div className="absolute inset-x-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-white/10 bg-background/95 px-4 py-4 shadow-lg backdrop-blur-xl md:px-6">
            <ul className="flex flex-col gap-1">
              {top.map((item) => (
                <MobileLink key={item.href} href={item.href} label={item.label} />
              ))}
            </ul>
            <p className="mt-4 px-3 font-mono text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              {t(locale, "nav.solutions")}
            </p>
            <ul className="mt-1 flex flex-col gap-1">
              {solutions.map((item) => (
                <MobileLink key={item.href} href={item.href} label={item.label} />
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-2">
              <Button render={<Link href="/login" />} size="lg" variant="outline">
                {t(locale, "nav.signIn")}
              </Button>
              <Button render={<Link href="/signup" />} size="lg">
                {t(locale, "nav.startTrial")}
              </Button>
              <div className="mt-1">
                <LanguageSwitcher locale={locale} />
              </div>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}

function MobileLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        {label}
      </Link>
    </li>
  );
}
