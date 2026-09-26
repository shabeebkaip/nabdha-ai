"use client";

import { useId, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PricingCard } from "@/components/marketing/pricing-card";
import { t, type Locale } from "@/lib/i18n";
import type { PricingPlan } from "@/lib/pricing";

// Landing preview: the three main tiers with a monthly/annual toggle (annual =
// 20% off, values from admin_config via the parent). The full four-tier grid +
// comparison table lives on /pricing (PricingPlans).
export function PricingPreviewPlans({ locale, plans }: { locale: Locale; plans: PricingPlan[] }) {
  const planFor = (id: "basic" | "growth" | "pro") => plans.find((p) => p.id === id);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const switchId = useId();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Label htmlFor={switchId} className="text-sm font-medium">
          {t(locale, "pricing.toggle.monthly")}
        </Label>
        <Switch
          id={switchId}
          checked={billing === "annual"}
          onCheckedChange={(checked) => setBilling(checked ? "annual" : "monthly")}
          aria-label={t(locale, "pricing.toggle.annual")}
        />
        <Label htmlFor={switchId} className="text-sm font-medium">
          {t(locale, "pricing.toggle.annual")}
        </Label>
        <Badge variant="outline" className="ms-1 border-success/40 text-success">
          {t(locale, "pricing.toggle.save")}
        </Badge>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <PricingCard locale={locale} planId="basic" billing={billing} plan={planFor("basic")} />
        <PricingCard locale={locale} planId="growth" billing={billing} plan={planFor("growth")} />
        <PricingCard locale={locale} planId="pro" billing={billing} plan={planFor("pro")} />
      </div>
    </div>
  );
}
