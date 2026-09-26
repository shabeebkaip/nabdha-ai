"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { localeCookieName, type Locale } from "@/lib/i18n";

// ponytail: sets a cookie + hard-refreshes the server components that read
// it in layout.tsx. No client-side translation state, no context provider —
// the whole app re-renders from the server with the new locale/dir.
export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const next: Locale = locale === "en" ? "ar" : "en";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        document.cookie = `${localeCookieName}=${next}; path=/; max-age=31536000`;
        router.refresh();
      }}
    >
      {next === "ar" ? "العربية" : "English"}
    </Button>
  );
}
