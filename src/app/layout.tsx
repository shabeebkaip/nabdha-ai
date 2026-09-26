import type { Metadata } from "next";
import { Almarai, Bricolage_Grotesque, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/lib/get-locale";
import { dirFor } from "@/lib/i18n";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

// Fonts per client direction (2026-09-26 course correction): Bricolage
// Grotesque for EN display+body, Almarai for AR, JetBrains Mono for
// eyebrows/data labels. Replaces the earlier Inter/IBM Plex/Fraunces set.
const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const almarai = Almarai({
  variable: "--font-almarai",
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// User course-correction (2026-09-26): the headline emphasis word uses a
// real italic serif (Instrument Serif) instead of synthetic-italic
// Bricolage — supersedes the earlier DESIGN_SPEC §1.3 synthetic-italic
// resolution.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["italic", "normal"],
});

export const metadata: Metadata = {
  title: "Nabda AI",
  description:
    "Nabda AI — the AI Business Intelligence platform that turns your data into a Business Health Score, risks, opportunities, and recommendations.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      className={`${bricolageGrotesque.variable} ${almarai.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} h-full antialiased${
        locale === "ar" ? " font-arabic" : ""
      }`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position={locale === "ar" ? "top-center" : "bottom-right"} />
      </body>
    </html>
  );
}
