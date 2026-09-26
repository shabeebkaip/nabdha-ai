// Shared "how do we show a dataset to a human" helpers — used by My Data's
// source cards, the topbar active-source switcher, and the Ask AI source
// picker, so the fileName-fallback logic and icon choice can't drift between
// the three places a dataset shows up in the UI.
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
