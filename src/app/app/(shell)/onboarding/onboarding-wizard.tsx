"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { t, type Locale, type DictKey } from "@/lib/i18n";
import { industryOptions, companySizeOptions } from "@/lib/options";
import { cn } from "@/lib/utils";

interface CompanyData {
  name: string;
  industry: string | null;
  size: string | null;
  employees: number | null;
  branches: number | null;
  country: string;
  businessModel: string | null;
  objective: string | null;
  dataSources: string[];
}

const enabledSources = ["excel", "csv", "manual"] as const;
const disabledSources = [
  "api",
  "accounting",
  "crm",
  "erp",
  "pos",
  "inventory",
  "payment",
  "customer",
  "delivery",
] as const;
const allSources = [...enabledSources, ...disabledSources];

function sourceLabelKey(source: string): DictKey {
  return `onboarding.step2.sources.${source}` as DictKey;
}

async function patchCompany(body: Record<string, unknown>) {
  const res = await fetch("/api/companies/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("PATCH /api/companies/me failed");
  return res.json();
}

export function OnboardingWizard({ locale, company }: { locale: Locale; company: CompanyData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = Math.min(3, Math.max(1, Number(searchParams.get("step") ?? "1")));

  const [name, setName] = useState(company.name);
  const [industry, setIndustry] = useState(company.industry ?? "");
  const [size, setSize] = useState(company.size ?? "");
  const [employees, setEmployees] = useState(company.employees?.toString() ?? "");
  const [branches, setBranches] = useState(company.branches?.toString() ?? "");
  const [country, setCountry] = useState(company.country || "Saudi Arabia");
  const [businessModel, setBusinessModel] = useState(company.businessModel ?? "");
  const [objective, setObjective] = useState(company.objective ?? "");
  const [dataSources, setDataSources] = useState<string[]>(
    company.dataSources.length > 0 ? company.dataSources : ["excel"]
  );

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goToStep(n: number) {
    const params = new URLSearchParams(searchParams);
    params.set("step", String(n));
    router.push(`/app/onboarding?${params.toString()}`);
  }

  async function handleStep1(e: FormEvent) {
    e.preventDefault();
    if (!name || !industry || !size) {
      setError(t(locale, "onboarding.error.required"));
      return;
    }
    setError(null);
    setPending(true);
    try {
      await patchCompany({
        name,
        industry,
        size,
        employees: employees ? Number(employees) : undefined,
        branches: branches ? Number(branches) : undefined,
        country,
        businessModel: businessModel || undefined,
        objective: objective || undefined,
      });
      goToStep(2);
    } catch {
      setError(t(locale, "onboarding.error.network"));
    } finally {
      setPending(false);
    }
  }

  async function handleStep2(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await patchCompany({ dataSources });
      goToStep(3);
    } catch {
      setError(t(locale, "onboarding.error.network"));
    } finally {
      setPending(false);
    }
  }

  async function handleFinish() {
    setError(null);
    setPending(true);
    try {
      await patchCompany({ onboardingCompleted: true });
      router.push("/app/data");
    } catch {
      setError(t(locale, "onboarding.error.network"));
      setPending(false);
    }
  }

  function toggleSource(source: string) {
    setDataSources((prev) => (prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]));
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2" aria-hidden>
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                n <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
        <p className="mt-3 font-mono text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          {t(locale, `onboarding.step${step as 1 | 2 | 3}of3`)}
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <form noValidate onSubmit={handleStep1} className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">{t(locale, "onboarding.step1.title")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t(locale, "onboarding.step1.subtitle")}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ob-name">{t(locale, "onboarding.step1.fields.name")}</Label>
              <Input id="ob-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ob-industry">{t(locale, "onboarding.step1.fields.industry")}</Label>
                <Select value={industry} onValueChange={(v) => setIndustry(v ?? "")}>
                  <SelectTrigger id="ob-industry" className="w-full">
                    <SelectValue placeholder={t(locale, "onboarding.step1.fields.industry")} />
                  </SelectTrigger>
                  <SelectContent>
                    {industryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {t(locale, opt.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ob-size">{t(locale, "onboarding.step1.fields.size")}</Label>
                <Select value={size} onValueChange={(v) => setSize(v ?? "")}>
                  <SelectTrigger id="ob-size" className="w-full">
                    <SelectValue placeholder={t(locale, "onboarding.step1.fields.size")} />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {t(locale, opt.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ob-employees">{t(locale, "onboarding.step1.fields.employees")}</Label>
                <Input
                  id="ob-employees"
                  type="number"
                  dir="ltr"
                  min={0}
                  value={employees}
                  onChange={(e) => setEmployees(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ob-branches">{t(locale, "onboarding.step1.fields.branches")}</Label>
                <Input
                  id="ob-branches"
                  type="number"
                  dir="ltr"
                  min={0}
                  value={branches}
                  onChange={(e) => setBranches(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ob-country">{t(locale, "onboarding.step1.fields.country")}</Label>
              <Input id="ob-country" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ob-model">{t(locale, "onboarding.step1.fields.businessModel")}</Label>
              <Input id="ob-model" value={businessModel} onChange={(e) => setBusinessModel(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ob-objective">{t(locale, "onboarding.step1.fields.objective")}</Label>
              <Textarea id="ob-objective" value={objective} onChange={(e) => setObjective(e.target.value)} />
            </div>

            <div className="mt-2 flex justify-end">
              <Button type="submit" disabled={pending}>
                {pending ? t(locale, "common.saving") : t(locale, "common.next")}
              </Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form noValidate onSubmit={handleStep2} className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">{t(locale, "onboarding.step2.title")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t(locale, "onboarding.step2.subtitle")}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {allSources.map((source) => {
                const disabled = (disabledSources as readonly string[]).includes(source);
                const checked = dataSources.includes(source);
                return (
                  <label
                    key={source}
                    className={cn(
                      "flex cursor-pointer items-start gap-2 rounded-lg border border-border p-3 text-sm transition-colors",
                      checked && !disabled && "border-primary bg-accent",
                      disabled && "cursor-not-allowed opacity-60"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 accent-primary"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleSource(source)}
                    />
                    <span className="flex-1">
                      {t(locale, sourceLabelKey(source))}
                      {disabled && (
                        <Badge variant="outline" className="ms-1.5 align-middle text-[10px] text-muted-foreground">
                          {t(locale, "common.comingSoon")}
                        </Badge>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-2 flex justify-between">
              <Button type="button" variant="outline" onClick={() => goToStep(1)}>
                {t(locale, "common.back")}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? t(locale, "common.saving") : t(locale, "common.next")}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">{t(locale, "onboarding.step3.title")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t(locale, "onboarding.step3.subtitle")}</p>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-border p-4 text-sm">
              <dt className="text-muted-foreground">{t(locale, "onboarding.step1.fields.name")}</dt>
              <dd className="font-medium">{name}</dd>
              <dt className="text-muted-foreground">{t(locale, "onboarding.step1.fields.industry")}</dt>
              <dd className="font-medium">{industry}</dd>
              <dt className="text-muted-foreground">{t(locale, "onboarding.step1.fields.size")}</dt>
              <dd className="font-medium">{size}</dd>
              <dt className="text-muted-foreground">{t(locale, "onboarding.step2.title")}</dt>
              <dd className="font-medium">
                {dataSources.map((s) => t(locale, sourceLabelKey(s))).join(", ")}
              </dd>
            </dl>

            <div className="mt-2 flex justify-between">
              <Button type="button" variant="outline" onClick={() => goToStep(2)}>
                {t(locale, "common.back")}
              </Button>
              <Button type="button" onClick={handleFinish} disabled={pending}>
                {pending ? t(locale, "common.saving") : t(locale, "onboarding.step3.cta")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
