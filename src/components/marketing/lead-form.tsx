"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { t, type DictKey, type Locale } from "@/lib/i18n";
import { industryOptions, companySizeOptions } from "@/lib/options";

export type LeadKind = "consultation" | "training" | "integration" | "enterprise";

const titleKey: Record<LeadKind, DictKey> = {
  consultation: "leads.consultation.title",
  training: "leads.training.title",
  integration: "leads.integration.title",
  enterprise: "leads.enterprise.title",
};
const subtitleKey: Record<LeadKind, DictKey> = {
  consultation: "leads.consultation.subtitle",
  training: "leads.training.subtitle",
  integration: "leads.integration.subtitle",
  enterprise: "leads.enterprise.subtitle",
};
const eyebrowKey: Record<LeadKind, DictKey> = {
  consultation: "leads.consultation.eyebrow",
  training: "leads.training.eyebrow",
  integration: "leads.integration.eyebrow",
  enterprise: "leads.enterprise.eyebrow",
};
const submitKey: Record<LeadKind, DictKey> = {
  consultation: "leads.consultation.submit",
  training: "leads.training.submit",
  integration: "leads.integration.submit",
  enterprise: "leads.enterprise.submit",
};

export function LeadForm({ kind, locale }: { kind: LeadKind; locale: Locale }) {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function set(name: string, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = buildPayload(kind, fields, contactName, contactEmail);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);
    setSubmitting(false);

    if (!res || !res.ok) {
      const fieldErrors = res ? await extractFieldErrors(res) : null;
      setError(fieldErrors ?? t(locale, "leads.error"));
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <Card className="mx-auto w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <CheckCircle2 aria-hidden className="size-10 text-success-bright" />
          <h2 className="text-xl font-bold">{t(locale, "leads.success.title")}</h2>
          <p className="text-sm text-muted-foreground">{t(locale, "leads.success.body")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <p className="inline-flex items-center gap-2.5 font-mono text-xs font-semibold tracking-[0.14em] text-primary uppercase">
          <span aria-hidden className="h-px w-5 bg-primary" />
          {t(locale, eyebrowKey[kind])}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">{t(locale, titleKey[kind])}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t(locale, subtitleKey[kind])}</p>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4" aria-describedby={error ? "lead-error" : undefined}>
          {error && (
            <Alert variant="destructive" id="lead-error" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <KindFields kind={kind} locale={locale} fields={fields} set={set} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lead-name">{t(locale, "leads.contact.name")}</Label>
            <Input id="lead-name" required value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lead-email">{t(locale, "leads.contact.email")}</Label>
            <Input
              id="lead-email"
              type="email"
              dir="ltr"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>

          <Button type="submit" size="lg" disabled={submitting} className="mt-2">
            {submitting ? t(locale, "common.submitting") : t(locale, submitKey[kind])}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function KindFields({
  kind,
  locale,
  fields,
  set,
}: {
  kind: LeadKind;
  locale: Locale;
  fields: Record<string, string>;
  set: (name: string, value: string) => void;
}) {
  if (kind === "consultation") {
    return (
      <>
        <Field id="topic" label={t(locale, "leads.consultation.topic")} value={fields.topic ?? ""} onChange={(v) => set("topic", v)} required />
        <Field
          id="durationMinutes"
          type="number"
          label={t(locale, "leads.consultation.duration")}
          value={fields.durationMinutes ?? "60"}
          onChange={(v) => set("durationMinutes", v)}
          required
        />
        <Field
          id="preferredTime"
          label={t(locale, "leads.consultation.preferredTime")}
          value={fields.preferredTime ?? ""}
          onChange={(v) => set("preferredTime", v)}
        />
      </>
    );
  }
  if (kind === "training") {
    return (
      <>
        <Field id="category" label={t(locale, "leads.training.category")} value={fields.category ?? ""} onChange={(v) => set("category", v)} required />
        <Field id="format" label={t(locale, "leads.training.format")} value={fields.format ?? ""} onChange={(v) => set("format", v)} required />
        <Field
          id="participants"
          type="number"
          label={t(locale, "leads.training.participants")}
          value={fields.participants ?? ""}
          onChange={(v) => set("participants", v)}
        />
      </>
    );
  }
  if (kind === "integration") {
    return (
      <>
        <Field id="systemName" label={t(locale, "leads.integration.systemName")} value={fields.systemName ?? ""} onChange={(v) => set("systemName", v)} required />
        <Field
          id="currentSoftware"
          label={t(locale, "leads.integration.currentSoftware")}
          value={fields.currentSoftware ?? ""}
          onChange={(v) => set("currentSoftware", v)}
        />
        <Field id="dataSource" label={t(locale, "leads.integration.dataSource")} value={fields.dataSource ?? ""} onChange={(v) => set("dataSource", v)} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="businessObjective">{t(locale, "leads.integration.businessObjective")}</Label>
          <Textarea
            id="businessObjective"
            required
            value={fields.businessObjective ?? ""}
            onChange={(e) => set("businessObjective", e.target.value)}
          />
        </div>
      </>
    );
  }
  // enterprise
  return (
    <>
      <Field id="companyName" label={t(locale, "leads.enterprise.companyName")} value={fields.companyName ?? ""} onChange={(v) => set("companyName", v)} required />
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="industry">{t(locale, "leads.enterprise.industry")}</Label>
          <Select value={fields.industry ?? ""} onValueChange={(v) => set("industry", v ?? "")}>
            <SelectTrigger id="industry" className="w-full">
              <SelectValue placeholder={t(locale, "leads.enterprise.industry")} />
            </SelectTrigger>
            <SelectContent>
              {industryOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {t(locale, o.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="companySize">{t(locale, "leads.enterprise.companySize")}</Label>
          <Select value={fields.companySize ?? ""} onValueChange={(v) => set("companySize", v ?? "")}>
            <SelectTrigger id="companySize" className="w-full">
              <SelectValue placeholder={t(locale, "leads.enterprise.companySize")} />
            </SelectTrigger>
            <SelectContent>
              {companySizeOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {t(locale, o.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="requirement">{t(locale, "leads.enterprise.requirement")}</Label>
        <Textarea id="requirement" required value={fields.requirement ?? ""} onChange={(e) => set("requirement", e.target.value)} />
      </div>
      <Field
        id="expectedUsers"
        type="number"
        label={t(locale, "leads.enterprise.expectedUsers")}
        value={fields.expectedUsers ?? ""}
        onChange={(v) => set("expectedUsers", v)}
      />
    </>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} dir={type === "number" ? "ltr" : undefined} required={required} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

// QA bug #3 fix: surface the API's per-field validation messages instead of
// always showing the generic error. `error.fields` is Zod's
// `flatten().fieldErrors` shape at runtime (`Record<string, string[]>`)
// even though ApiError's TS type says `Record<string,string>` — handle
// both defensively.
async function extractFieldErrors(res: Response): Promise<string | null> {
  const body = (await res.json().catch(() => null)) as { error?: { fields?: Record<string, string | string[]> } } | null;
  const fields = body?.error?.fields;
  if (!fields || Object.keys(fields).length === 0) return null;
  return Object.entries(fields)
    .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(", ") : msg}`)
    .join(" · ");
}

function buildPayload(kind: LeadKind, fields: Record<string, string>, contactName: string, contactEmail: string) {
  const contact = { contactName, contactEmail };
  if (kind === "consultation") {
    return {
      kind,
      topic: fields.topic ?? "",
      durationMinutes: Number(fields.durationMinutes) || 60,
      preferredTime: fields.preferredTime || undefined,
      ...contact,
    };
  }
  if (kind === "training") {
    return {
      kind,
      category: fields.category ?? "",
      format: fields.format ?? "",
      participants: fields.participants ? Number(fields.participants) : undefined,
      ...contact,
    };
  }
  if (kind === "integration") {
    return {
      kind,
      systemName: fields.systemName ?? "",
      currentSoftware: fields.currentSoftware || undefined,
      dataSource: fields.dataSource || undefined,
      businessObjective: fields.businessObjective ?? "",
      ...contact,
    };
  }
  return {
    kind,
    companyName: fields.companyName ?? "",
    industry: fields.industry ?? "",
    companySize: fields.companySize ?? "",
    requirement: fields.requirement ?? "",
    expectedUsers: fields.expectedUsers ? Number(fields.expectedUsers) : undefined,
    ...contact,
  };
}
