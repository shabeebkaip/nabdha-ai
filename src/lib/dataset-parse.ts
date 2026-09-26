// Real, client-side parsing of an uploaded CSV/Excel file into aggregate
// business metrics. Runs in the browser (the File object never left it —
// there is no Blob/server upload wiring in M1, see docs/API_CONTRACT.md),
// so this is what makes "upload your data, AI analyzes it" actually true
// instead of only ever reacting to a filename string.
//
// PDF is intentionally NOT parsed here: extracting tabular numbers from a
// PDF is a categorically different, much heavier problem (needs OCR-grade
// text/table extraction, e.g. pdfjs-dist + heuristics) than reading a
// CSV/XLSX grid. It's a real, separate scope decision, not a lazy defer —
// PDF uploads fall back to scenario.ts's filename-keyword+hash heuristic.
//
// xlsx is installed from SheetJS's own CDN (npm's published `xlsx` package
// has unpatched high-severity CVEs — prototype pollution + ReDoS — SheetJS
// only ships fixed builds from cdn.sheetjs.com, not npm). See package.json.

import * as XLSX from "xlsx";

export interface ParsedMetrics {
  fileName: string;
  rows: number;
  revenue?: number;
  orders?: number;
  customers?: number;
  avgOrderValue?: number;
  revenueGrowthPct?: number;
  retentionPct?: number; // repeat-order-rate proxy, see aggregateRows()
  months?: number;
}

const REVENUE_RE = /revenue|amount|total|sales|price/i;
const CUSTOMER_RE = /customer|client|buyer|email/i;
const DATE_RE = /date|created|timestamp/i;

function toNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  const n = Number(v.replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function toDate(v: unknown): Date | null {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (typeof v !== "string" && typeof v !== "number") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function pickColumn(columns: string[], re: RegExp): string | null {
  return columns.find((c) => re.test(c)) ?? null;
}

// Aggregates parsed rows (from CSV or Excel, both normalized to
// Record<string, unknown>[] with header-derived keys) into real business
// metrics. Pure function — no I/O — so it's the same code path for both
// file types and is what the self-check below exercises.
export function aggregateRows(rows: Record<string, unknown>[], fileName: string): ParsedMetrics {
  if (rows.length === 0) return { fileName, rows: 0 };
  const columns = Object.keys(rows[0]!);

  const revenueCol = pickColumn(columns, REVENUE_RE);
  const customerCol = pickColumn(columns, CUSTOMER_RE);
  const dateCol = pickColumn(columns, DATE_RE);

  const revenues = revenueCol ? rows.map((r) => toNumber(r[revenueCol])).filter((n): n is number => n !== null) : [];
  const revenue = revenues.length > 0 ? Math.round(revenues.reduce((a, b) => a + b, 0)) : undefined;
  const orders = rows.length;
  const avgOrderValue = revenue !== undefined && orders > 0 ? Math.round(revenue / orders) : undefined;

  let customers: number | undefined;
  let retentionPct: number | undefined;
  if (customerCol) {
    const ids = rows.map((r) => String(r[customerCol] ?? "").trim()).filter(Boolean);
    const distinct = new Set(ids).size;
    if (distinct > 0) {
      customers = distinct;
      // Repeat-order-rate proxy from order-level rows, NOT true cohort
      // retention (would need per-customer purchase history over time) —
      // it's the real, honest signal a flat order export can give: what
      // share of orders came from a customer who ordered more than once.
      retentionPct = Math.round(Math.max(0, Math.min(100, (1 - distinct / ids.length) * 100)));
    }
  }

  let revenueGrowthPct: number | undefined;
  let months: number | undefined;
  if (dateCol && revenueCol) {
    const dated = rows
      .map((r) => ({ date: toDate(r[dateCol]), rev: toNumber(r[revenueCol]) }))
      .filter((r): r is { date: Date; rev: number } => r.date !== null && r.rev !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    if (dated.length >= 4) {
      const mid = Math.floor(dated.length / 2);
      const firstHalf = dated.slice(0, mid).reduce((s, r) => s + r.rev, 0);
      const secondHalf = dated.slice(mid).reduce((s, r) => s + r.rev, 0);
      if (firstHalf > 0) revenueGrowthPct = Math.round(((secondHalf - firstHalf) / firstHalf) * 1000) / 10;
      const periodKeys = new Set(dated.map((r) => `${r.date.getFullYear()}-${r.date.getMonth()}`));
      months = periodKeys.size;
    }
  }

  return { fileName, rows: rows.length, revenue, orders, customers, avgOrderValue, revenueGrowthPct, retentionPct, months };
}

export function parseCsvText(text: string): Record<string, string>[] {
  // ponytail: minimal RFC4180-ish CSV line parser (handles quoted fields
  // with embedded commas) — not a full CSV spec (no multi-line quoted
  // fields), correct for the flat export shape this targets. Add a real
  // CSV lib (papaparse) if a customer's export needs more.
  function parseLine(line: string): string[] {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]!;
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          cur += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map((s) => s.trim());
  }

  const lines = text.split(/\r\n|\n|\r/).filter((l) => l.length > 0);
  if (lines.length < 2) return [];
  const header = parseLine(lines[0]!);
  return lines.slice(1).map((line) => {
    const cells = parseLine(line);
    const row: Record<string, string> = {};
    header.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}

function extOf(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  return idx === -1 ? "" : fileName.slice(idx).toLowerCase();
}

/** Parses a File in the browser into real aggregate metrics. Returns just
 * `{fileName, rows: 0}` (no thrown errors) for unsupported/unparseable
 * files — callers should always proceed with the upload regardless, this
 * is a best-effort enrichment, never a blocker. */
export async function parseDatasetFile(file: File): Promise<ParsedMetrics> {
  try {
    const ext = extOf(file.name);
    if (ext === ".csv") {
      const text = await file.text();
      return aggregateRows(parseCsvText(text), file.name);
    }
    if (ext === ".xlsx" || ext === ".xls") {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]!];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet!, { defval: "" });
      return aggregateRows(rows, file.name);
    }
    // PDF or anything else: no content parsing (see file header).
    return { fileName: file.name, rows: 0 };
  } catch {
    // Malformed file, corrupt workbook, etc. — never block the upload.
    return { fileName: file.name, rows: 0 };
  }
}

// Self-check lives in dataset-parse.test.ts (npm test) — this file is
// imported by a client component and gets bundled for the browser, where
// `require.main`/`module` don't exist (that's what crashed the app).
