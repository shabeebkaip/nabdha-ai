"use client";

import { useState } from "react";
import { Check, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { t, type Locale } from "@/lib/i18n";

export function ConfigRow({
  configKey,
  category,
  value,
  updatedAt,
  locale,
}: {
  configKey: string;
  category: string;
  value: unknown;
  updatedAt: string;
  locale: Locale;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(JSON.stringify(value));
  const [current, setCurrent] = useState(value);
  const [currentUpdatedAt, setCurrentUpdatedAt] = useState(updatedAt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(draft);
    } catch {
      setError("Invalid JSON");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: configKey, value: parsed }),
    }).catch(() => null);
    setSaving(false);

    if (!res || !res.ok) {
      setError(t(locale, "admin.config.saveError"));
      return;
    }
    const updated = (await res.json()) as { value: unknown; updatedAt: string };
    setCurrent(updated.value);
    setCurrentUpdatedAt(updated.updatedAt);
    setEditing(false);
  }

  return (
    <TableRow>
      <TableCell className="text-muted-foreground">{category}</TableCell>
      <TableCell className="font-mono text-xs">{configKey}</TableCell>
      <TableCell>
        {editing ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Input dir="ltr" value={draft} onChange={(e) => setDraft(e.target.value)} className="font-mono text-xs" />
              <Button size="icon-sm" onClick={save} disabled={saving} aria-label={t(locale, "common.save")}>
                <Check aria-hidden className="size-3.5" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setDraft(JSON.stringify(current));
                  setError(null);
                }}
                aria-label={t(locale, "common.cancel")}
              >
                <X aria-hidden className="size-3.5" />
              </Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(JSON.stringify(current));
              setEditing(true);
            }}
            className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 font-mono text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {JSON.stringify(current)}
            <Pencil aria-hidden className="size-3 text-muted-foreground" />
          </button>
        )}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {new Date(currentUpdatedAt).toLocaleString(locale === "ar" ? "ar" : "en-US")}
      </TableCell>
    </TableRow>
  );
}
