import { cookies } from "next/headers";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n";

// ponytail: tiny server-only wrapper around the cookie read every
// server component/layout needs. Kept out of `i18n.ts` on purpose —
// that module is imported by the client "language-switcher.tsx", and
// `next/headers` cannot be bundled into a client component.
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;
  return isLocale(cookieLocale) ? cookieLocale : defaultLocale;
}
