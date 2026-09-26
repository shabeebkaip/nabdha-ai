// Nabda AI — Drizzle schema. See docs/PROJECT_PLAN.md §5 and
// docs/API_CONTRACT.md for the shapes these tables back.
//
// ponytail: no Auth.js adapter tables (accounts/sessions/verification_token).
// We use Credentials + JWT sessions — adapter tables are only needed for
// OAuth providers or database-session strategy, neither of which M1 uses.
// Add @auth/drizzle-adapter + those tables if/when an OAuth provider ships.
//
// ponytail: drizzle-orm/neon-http has no interactive transactions (see
// src/db/index.ts). Multi-row writes here use sequential inserts with the
// parent row first; the one place atomicity is non-negotiable (credit
// wallet balance) is handled with a single data-modifying-CTE statement in
// src/lib/credits.ts instead of a driver transaction.

import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import type { DashboardKpis, Forecast, HealthFactorKey, ReportSection } from "@/lib/ai/types";

// --- enums ---

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const datasetSourceEnum = pgEnum("dataset_source", [
  "demo",
  "excel",
  "csv",
  "pdf",
  "manual",
]);
export const datasetStatusEnum = pgEnum("dataset_status", [
  "uploaded",
  "processing",
  "analyzed",
  "failed",
]);
export const insightKindEnum = pgEnum("insight_kind", [
  "risk",
  "opportunity",
  "trend",
  "recommendation",
]);
export const severityEnum = pgEnum("severity", ["low", "medium", "high"]);
export const walletTypeEnum = pgEnum("wallet_type", ["ai_credits", "slides"]);
export const planEnum = pgEnum("plan", ["trial", "basic", "growth", "pro", "enterprise"]);
export const billingCycleEnum = pgEnum("billing_cycle", ["monthly", "annual"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trial",
  "active",
  "canceled",
]);
export const transactionKindEnum = pgEnum("transaction_kind", [
  "subscription",
  "credit_pack",
  "report",
  "presentation",
  "service",
]);
export const leadKindEnum = pgEnum("lead_kind", [
  "consultation",
  "training",
  "integration",
  "enterprise",
]);

// --- tables ---

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  locale: text("locale").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("users_email_idx").on(t.email)]);

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  industry: text("industry"),
  size: text("size"),
  employees: integer("employees"),
  branches: integer("branches"),
  country: text("country").notNull().default("Saudi Arabia"),
  businessModel: text("business_model"),
  objective: text("objective"),
  dataSources: jsonb("data_sources").$type<string[]>().notNull().default([]),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("companies_owner_idx").on(t.ownerUserId)]);

export const datasets = pgTable("datasets", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  sourceType: datasetSourceEnum("source_type").notNull(),
  fileBlobUrl: text("file_blob_url"),
  status: datasetStatusEnum("status").notNull().default("uploaded"),
  rowSummary: jsonb("row_summary").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("datasets_company_idx").on(t.companyId)]);

export const analyses = pgTable("analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  datasetId: uuid("dataset_id").notNull().references(() => datasets.id),
  healthScore: integer("health_score").notNull(),
  factors: jsonb("factors").$type<Record<HealthFactorKey, number>>().notNull(),
  kpis: jsonb("kpis").$type<DashboardKpis>().notNull(),
  forecast: jsonb("forecast").$type<Forecast>().notNull(),
  modelUsed: text("model_used").notNull(),
  creditsCharged: integer("credits_charged").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("analyses_company_idx").on(t.companyId)]);

export const insights = pgTable("insights", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  analysisId: uuid("analysis_id").notNull().references(() => analyses.id),
  kind: insightKindEnum("kind").notNull(),
  severity: severityEnum("severity").notNull(),
  title: text("title").notNull(),
  whatHappened: text("what_happened").notNull(),
  why: text("why").notNull(),
  businessImpact: text("business_impact").notNull(),
  recommendedAction: text("recommended_action").notNull(),
  factorTag: text("factor_tag"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("insights_company_idx").on(t.companyId),
  index("insights_analysis_idx").on(t.analysisId),
]);

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  analysisId: uuid("analysis_id").notNull().references(() => analyses.id),
  title: text("title").notNull(),
  sections: jsonb("sections").$type<ReportSection[]>().notNull(),
  pdfBlobUrl: text("pdf_blob_url"),
  creditsCharged: integer("credits_charged").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("reports_company_idx").on(t.companyId)]);

export const creditWallets = pgTable("credit_wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  walletType: walletTypeEnum("wallet_type").notNull(),
  balance: integer("balance").notNull().default(0),
  allowance: integer("allowance").notNull().default(0),
  resetDate: timestamp("reset_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("credit_wallets_company_type_idx").on(t.companyId, t.walletType),
]);

export const creditTransactions = pgTable("credit_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id").notNull().references(() => creditWallets.id),
  delta: integer("delta").notNull(),
  reason: text("reason").notNull(),
  refId: uuid("ref_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("credit_transactions_wallet_idx").on(t.walletId)]);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  plan: planEnum("plan").notNull().default("trial"),
  billingCycle: billingCycleEnum("billing_cycle").notNull().default("monthly"),
  status: subscriptionStatusEnum("status").notNull().default("trial"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("subscriptions_company_idx").on(t.companyId)]);

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  kind: transactionKindEnum("kind").notNull(),
  amountSar: numeric("amount_sar", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("demo"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("transactions_company_idx").on(t.companyId)]);

export const usageEvents = pgTable("usage_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  eventType: text("event_type").notNull(),
  modelUsed: text("model_used"),
  units: integer("units").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("usage_events_company_idx").on(t.companyId)]);

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").references(() => companies.id),
  kind: leadKindEnum("kind").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("leads_company_idx").on(t.companyId)]);

// THE de-hard-coding table (client §52): prices, credit costs, feature
// flags, and AI model config all live here — nothing commercial is a
// literal in application code.
export const adminConfig = pgTable("admin_config", {
  key: text("key").primaryKey(),
  category: text("category").notNull(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
