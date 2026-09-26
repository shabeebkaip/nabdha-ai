"use client";

import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { parseDatasetFile } from "@/lib/dataset-parse";

const ACCEPTED = [".xlsx", ".xls", ".csv", ".pdf"];

function extOf(fileName: string) {
  const idx = fileName.lastIndexOf(".");
  return idx === -1 ? "" : fileName.slice(idx).toLowerCase();
}

function sourceTypeFor(fileName: string): "excel" | "csv" | "pdf" | null {
  const ext = extOf(fileName);
  if (ext === ".csv") return "csv";
  if (ext === ".pdf") return "pdf";
  if (ext === ".xlsx" || ext === ".xls") return "excel";
  return null;
}

async function createDataset(body: Record<string, unknown>) {
  const res = await fetch("/api/datasets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("POST /api/datasets failed");
  return res.json() as Promise<{ id: string }>;
}

export function DataUploadClient({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"demo" | "upload" | "manual" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manual, setManual] = useState({ revenue: "", customers: "", orders: "", products: "" });

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFileError(null);
    const next: File[] = [];
    for (const file of Array.from(list)) {
      if (!sourceTypeFor(file.name)) {
        setFileError(t(locale, "data.upload.invalidType"));
        continue;
      }
      next.push(file);
    }
    if (next.length > 0) setFiles((prev) => [...prev, ...next]);
  }

  async function useDemoData() {
    setError(null);
    setPendingAction("demo");
    try {
      const dataset = await createDataset({ sourceType: "demo" });
      router.push(`/app/processing?datasetId=${dataset.id}`);
    } catch {
      setError(t(locale, "data.error"));
      setPendingAction(null);
    }
  }

  async function continueWithFiles() {
    if (files.length === 0) return;
    setError(null);
    setPendingAction("upload");
    try {
      const file = files[0]!;
      const sourceType = sourceTypeFor(file.name) ?? "excel";
      // Real content parsing (CSV/Excel) happens here in the browser — the
      // file's bytes never reach the server otherwise (no Blob wiring in
      // M1). `metrics.rows === 0` (parse failed or unsupported/PDF) just
      // omits `metrics`; the engine falls back to a filename-based
      // scenario rather than blocking the upload.
      // `metrics` schema server-side only picks the numeric fields it
      // knows about, so passing the whole parsed object (fileName included)
      // through is harmless.
      const metrics = await parseDatasetFile(file);
      const dataset = await createDataset({
        sourceType,
        fileName: file.name,
        metrics: metrics.rows > 0 ? metrics : undefined,
      });
      router.push(`/app/processing?datasetId=${dataset.id}`);
    } catch {
      setError(t(locale, "data.error"));
      setPendingAction(null);
    }
  }

  async function saveManual() {
    setError(null);
    setPendingAction("manual");
    try {
      const dataset = await createDataset({ sourceType: "manual", fileName: "Manual entry" });
      setManualOpen(false);
      router.push(`/app/processing?datasetId=${dataset.id}`);
    } catch {
      setError(t(locale, "data.error"));
      setPendingAction(null);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  return (
    <div className={compact ? "" : "mx-auto max-w-4xl"}>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">
          {t(locale, compact ? "data.sources.addMore" : "data.title")}
        </h1>
        {!compact && <p className="mt-1 text-muted-foreground">{t(locale, "data.subtitle")}</p>}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t(locale, "data.upload.title")}</CardTitle>
            <CardDescription>{t(locale, "data.upload.body")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
              }}
              className={cn(
                "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                dragOver && "border-primary bg-accent"
              )}
            >
              <UploadCloud aria-hidden className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t(locale, "data.upload.dropzoneHint")}</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED.join(",")}
                className="sr-only"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>
            {fileError && <p className="text-sm text-destructive">{fileError}</p>}

            {files.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {files.map((file, i) => (
                  <li
                    key={`${file.name}-${i}`}
                    className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm"
                  >
                    <FileText aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{file.name}</span>
                    <button
                      type="button"
                      aria-label={t(locale, "data.upload.remove")}
                      onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="rounded p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X aria-hidden className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <Button
              variant={files.length > 0 ? "default" : "outline"}
              disabled={files.length === 0 || pendingAction !== null}
              onClick={continueWithFiles}
              className="mt-auto w-full"
            >
              {pendingAction === "upload" ? t(locale, "common.loading") : t(locale, "data.upload.cta")}
            </Button>
          </CardContent>
        </Card>

        <Card className="ring-1 ring-primary/30">
          <CardHeader>
            <Badge className="w-fit">{t(locale, "data.demo.badge")}</Badge>
            <CardTitle className="mt-2 text-lg">{t(locale, "data.demo.title")}</CardTitle>
            <CardDescription>{t(locale, "data.demo.body")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between gap-4">
            <p className="nabda-numeral font-mono text-xs text-muted-foreground">{t(locale, "data.demo.stats")}</p>
            <Button onClick={useDemoData} disabled={pendingAction !== null} className="w-full">
              <Sparkles aria-hidden className="size-4" />
              {pendingAction === "demo" ? t(locale, "common.loading") : t(locale, "data.demo.cta")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setManualOpen(true)}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t(locale, "data.manualLink")}
        </button>
      </div>

      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(locale, "data.manualDialog.title")}</DialogTitle>
            <DialogDescription>{t(locale, "data.manualDialog.subtitle")}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="manual-revenue">{t(locale, "data.manualDialog.revenue")}</Label>
              <Input
                id="manual-revenue"
                type="number"
                dir="ltr"
                value={manual.revenue}
                onChange={(e) => setManual((m) => ({ ...m, revenue: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="manual-customers">{t(locale, "data.manualDialog.customers")}</Label>
              <Input
                id="manual-customers"
                type="number"
                dir="ltr"
                value={manual.customers}
                onChange={(e) => setManual((m) => ({ ...m, customers: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="manual-orders">{t(locale, "data.manualDialog.orders")}</Label>
              <Input
                id="manual-orders"
                type="number"
                dir="ltr"
                value={manual.orders}
                onChange={(e) => setManual((m) => ({ ...m, orders: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="manual-products">{t(locale, "data.manualDialog.products")}</Label>
              <Input
                id="manual-products"
                type="number"
                dir="ltr"
                value={manual.products}
                onChange={(e) => setManual((m) => ({ ...m, products: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveManual} disabled={pendingAction !== null}>
              {pendingAction === "manual" ? t(locale, "common.saving") : t(locale, "data.manualDialog.cta")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
