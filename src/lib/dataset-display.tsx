// Shared "how do we show a dataset to a human" helpers — used by My Data's
// source cards, the topbar active-source switcher, and the Ask AI source
// picker, so the fileName-fallback logic and icon choice can't drift between
// the three places a dataset shows up in the UI.
import type { ReactNode } from "react";
import { Database, FileSpreadsheet, FileText, PencilLine, type LucideIcon } from "lucide-react";
import { t, type DictKey, type Locale } from "@/lib/i18n";

const sourceLabelKey: Record<string, DictKey> = {
  demo: "data.source.demo",
  excel: "data.source.excel",
  csv: "data.source.csv",
  pdf: "data.source.pdf",
  manual: "data.source.manual",
};

export function datasetLabel(dataset: { fileName: string | null; sourceType: string }, locale: Locale): string {
  return dataset.fileName ?? t(locale, sourceLabelKey[dataset.sourceType] ?? "data.source.demo");
}

export function datasetIcon(sourceType: string): LucideIcon {
  if (sourceType === "demo") return Database;
  if (sourceType === "pdf") return FileText;
  if (sourceType === "manual") return PencilLine;
  return FileSpreadsheet;
}

/** Same icon choice as `datasetIcon`, but returns an already-built element
 * instead of a component reference — for the (non-list) call sites that
 * render a single icon directly in a component body, where storing the
 * result of `datasetIcon()` in a variable and using it as a JSX tag trips
 * `react-hooks/static-components` (a differently-identitied "component"
 * on every render). Inside a `.map()` over a list `datasetIcon` itself is
 * fine (see data-sources-list.tsx) — only single, per-render usages need
 * this form. */
export function datasetIconElement(sourceType: string, className = "size-5"): ReactNode {
  const Icon = datasetIcon(sourceType);
  return <Icon aria-hidden className={className} />;
}
