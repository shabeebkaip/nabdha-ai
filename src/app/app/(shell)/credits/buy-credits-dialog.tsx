"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { t, type DictKey, type Locale } from "@/lib/i18n";

export function DemoActionDialog({
  locale,
  triggerLabel,
  titleKey,
  bodyKey,
  variant = "default",
}: {
  locale: Locale;
  triggerLabel: string;
  titleKey: DictKey;
  bodyKey: DictKey;
  variant?: "default" | "outline";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(locale, titleKey)}</DialogTitle>
            <DialogDescription>{t(locale, bodyKey)}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>{t(locale, "credits.buyDialog.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
