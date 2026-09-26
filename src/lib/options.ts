// Shared Select option lists for industry/company-size — used by both the
// signup form and the onboarding wizard so the two never drift. `value` is
// the canonical (English, storage-stable) string persisted to the DB;
// `labelKey` is the localized display string.
import type { DictKey } from "@/lib/i18n";

export const industryOptions: { value: string; labelKey: DictKey }[] = [
  { value: "Retail", labelKey: "options.industry.retail" },
  { value: "Food & Beverage", labelKey: "options.industry.fnb" },
  { value: "Professional Services", labelKey: "options.industry.services" },
  { value: "Manufacturing", labelKey: "options.industry.manufacturing" },
  { value: "Healthcare", labelKey: "options.industry.healthcare" },
  { value: "Technology", labelKey: "options.industry.technology" },
  { value: "Other", labelKey: "options.industry.other" },
];

export const companySizeOptions: { value: string; labelKey: DictKey }[] = [
  { value: "1-9", labelKey: "options.companySize.micro" },
  { value: "10-49", labelKey: "options.companySize.small" },
  { value: "50-249", labelKey: "options.companySize.medium" },
  { value: "250+", labelKey: "options.companySize.large" },
];
