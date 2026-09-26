// Shared language directive, appended to every prompt's instructions.
// Keeps enum-valued fields (kind/severity/factorTag — validated against
// fixed Zod unions) in their canonical English strings while free-text prose
// follows the UI locale, and keeps numbers/currency LTR either way.
import type { Locale } from "@/lib/i18n";

export function languageRule(locale: Locale): string {
  return locale === "ar"
    ? `- Write every free-text/prose value (titles, narratives, explanations, report body text, answers, reasons, actions) in Modern Standard Arabic with a professional Saudi business tone.
- Do NOT translate fixed field values that are enums (e.g. "risk"/"opportunity"/"trend"/"recommendation", "low"/"medium"/"high", or a factor key like "revenue"/"inventory") — keep those exact English strings; only the human-readable prose fields are Arabic.
- Keep all numbers, currency amounts, and percentages in standard Latin/LTR digits and formatting (e.g. "1,240,000 SAR", "12.4%") even inside Arabic sentences.`
    : `- Write every free-text/prose value in English.`;
}
