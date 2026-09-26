import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "@/components/language-switcher";
import { t, type Locale } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]"
              />
              <span className="font-heading text-base font-extrabold tracking-tight">
                Nabda AI
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              {t(locale, "footer.tagline")}
            </p>
          </div>

          <div>
            <p className="font-mono text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {t(locale, "footer.product")}
            </p>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              <li>
                <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground">
                  {t(locale, "nav.howItWorks")}
                </Link>
              </li>
              <li>
                <Link href="/#solutions" className="text-muted-foreground hover:text-foreground">
                  {t(locale, "nav.solutions")}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
                  {t(locale, "nav.pricing")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {t(locale, "footer.language")}
            </p>
            <div className="mt-4">
              <LanguageSwitcher locale={locale} />
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            © <span className="nabda-numeral">{year}</span> {t(locale, "footer.copyright")}
          </p>
          <p className="max-w-xl text-xs text-muted-foreground">
            {t(locale, "footer.disclaimer")}
          </p>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none w-full overflow-hidden text-center leading-none font-heading font-extrabold text-foreground/[0.05]"
        style={{ fontSize: "18vw" }}
      >
        NABDA AI
      </div>
    </footer>
  );
}
