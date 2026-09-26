// Nabda AI — seed script. Idempotent: safe to re-run (`npm run db:seed`).
// Creates: 1 admin user, 1 demo user owning "Nabda Retail Demo" company
// (trial subscription + wallets + a pre-baked demo dataset/analysis/insights
// matching client §33), and admin_config rows for FINAL pricing +
// credit-cost table from docs/DECISIONS.md.

import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { db } from "./index";
import {
  users,
  companies,
  subscriptions,
  creditWallets,
  datasets,
  analyses,
  insights,
  adminConfig,
} from "./schema";
import { computeHealthScore } from "@/lib/health-score";
import {
  DEMO_FORECAST,
  DEMO_HEALTH_FACTORS,
  DEMO_INSIGHTS,
  DEMO_KPIS,
  DEMO_ROW_SUMMARY,
} from "@/lib/demo-data";

const DEMO_PASSWORD = "NabdaDemo123!";

const ADMIN_CONFIG_SEED: { key: string; category: string; value: unknown }[] = [
  // annualPrice is stored explicitly (not derived as monthlyPrice*12*0.8) —
  // DECISIONS.md's locked annual figures don't reconcile exactly with that
  // formula for every plan (Basic: 49*12*0.8=470.4, but the locked figure is
  // 471), so deriving it would silently drift from the signed-off numbers.
  { key: "pricing.basic", category: "pricing", value: { monthlyPrice: 49, annualPrice: 471, credits: 1000, slides: 80 } },
  { key: "pricing.growth", category: "pricing", value: { monthlyPrice: 149, annualPrice: 1430, credits: 4000, slides: 300 } },
  { key: "pricing.pro", category: "pricing", value: { monthlyPrice: 399, annualPrice: 3830, credits: 12000, slides: 900 } },
  { key: "pricing.annualDiscountPct", category: "pricing", value: 20 },
  {
    key: "pricing.consultation",
    category: "pricing",
    value: { ratePerHourSar: 375, nabdaSharePct: 30, nabdaShareSar: 112.5 },
  },
  {
    key: "credits.costTable",
    category: "credits",
    value: {
      standardAnalysis: 2,
      advancedAnalysis: 5,
      comprehensiveReport: 6,
      advancedReport: 10,
      presentationPerSlide: 1,
      customModeling: null,
    },
  },
  { key: "features.liveAiEnabled", category: "features", value: false },
  { key: "ai_model.provider", category: "ai_model", value: "anthropic" },
];

async function upsertAdminConfig() {
  for (const row of ADMIN_CONFIG_SEED) {
    await db
      .insert(adminConfig)
      .values(row)
      .onConflictDoUpdate({ target: adminConfig.key, set: { value: row.value, category: row.category } });
  }
  console.log(`admin_config: ${ADMIN_CONFIG_SEED.length} rows upserted`);
}

async function findOrCreateUser(input: { name: string; email: string; role: "user" | "admin" }) {
  const [existing] = await db.select().from(users).where(eq(users.email, input.email));
  if (existing) return existing;
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const [created] = await db
    .insert(users)
    .values({ name: input.name, email: input.email, passwordHash, role: input.role })
    .returning();
  return created!;
}

async function findOrCreateDemoCompany(ownerUserId: string) {
  const [existing] = await db.select().from(companies).where(eq(companies.ownerUserId, ownerUserId));
  if (existing) return existing;
  const [created] = await db
    .insert(companies)
    .values({
      ownerUserId,
      name: "Nabda Retail Demo",
      industry: "Retail",
      size: "SME",
      employees: 42,
      branches: 3,
      country: "Saudi Arabia",
      businessModel: "B2C Retail",
      objective: "Grow revenue while controlling inventory risk",
      dataSources: ["excel", "csv", "manual"],
      onboardingCompleted: true,
    })
    .returning();
  return created!;
}

async function ensureTrialSubscription(companyId: string) {
  const [existing] = await db.select().from(subscriptions).where(eq(subscriptions.companyId, companyId));
  if (existing) return existing;
  const [created] = await db
    .insert(subscriptions)
    .values({ companyId, plan: "trial", billingCycle: "monthly", status: "trial" })
    .returning();
  return created!;
}

async function ensureWallet(companyId: string, walletType: "ai_credits" | "slides", amount: number) {
  const [existing] = await db
    .select()
    .from(creditWallets)
    .where(and(eq(creditWallets.companyId, companyId), eq(creditWallets.walletType, walletType)));
  if (existing) return existing;
  const resetDate = new Date();
  resetDate.setDate(resetDate.getDate() + 30);
  const [created] = await db
    .insert(creditWallets)
    .values({ companyId, walletType, balance: amount, allowance: amount, resetDate })
    .returning();
  return created!;
}

async function ensureDemoDataset(companyId: string) {
  const [existing] = await db
    .select()
    .from(datasets)
    .where(and(eq(datasets.companyId, companyId), eq(datasets.sourceType, "demo")));
  if (existing) return existing;
  const [created] = await db
    .insert(datasets)
    .values({
      companyId,
      sourceType: "demo",
      status: "analyzed",
      rowSummary: DEMO_ROW_SUMMARY,
    })
    .returning();
  return created!;
}

async function ensureDemoAnalysis(companyId: string, datasetId: string) {
  const [existing] = await db.select().from(analyses).where(eq(analyses.datasetId, datasetId));
  if (existing) return existing;
  const healthScore = computeHealthScore(DEMO_HEALTH_FACTORS);
  const [created] = await db
    .insert(analyses)
    .values({
      companyId,
      datasetId,
      healthScore: healthScore.overall,
      factors: DEMO_HEALTH_FACTORS,
      kpis: DEMO_KPIS,
      forecast: DEMO_FORECAST,
      modelUsed: "nabda-fallback-v1",
      creditsCharged: 0,
    })
    .returning();
  return created!;
}

async function ensureDemoInsights(companyId: string, analysisId: string) {
  const existing = await db.select().from(insights).where(eq(insights.analysisId, analysisId));
  if (existing.length > 0) return existing;
  return db
    .insert(insights)
    .values(DEMO_INSIGHTS.map((i) => ({ ...i, companyId, analysisId })))
    .returning();
}

async function main() {
  await upsertAdminConfig();

  const admin = await findOrCreateUser({ name: "Nabda Admin", email: "admin@nabda.ai", role: "admin" });
  console.log(`admin user: ${admin.email}`);

  const demoUser = await findOrCreateUser({ name: "Demo Owner", email: "demo@nabda.ai", role: "user" });
  const company = await findOrCreateDemoCompany(demoUser.id);
  console.log(`demo company: ${company.name} (${company.id})`);

  await ensureTrialSubscription(company.id);
  await ensureWallet(company.id, "ai_credits", 250);
  await ensureWallet(company.id, "slides", 80);

  const dataset = await ensureDemoDataset(company.id);
  const analysis = await ensureDemoAnalysis(company.id, dataset.id);
  const insightRows = await ensureDemoInsights(company.id, analysis.id);

  console.log(`analysis: health score ${analysis.healthScore}, ${insightRows.length} insights`);
  console.log(`\nDemo login: demo@nabda.ai / ${DEMO_PASSWORD}`);
  console.log(`Admin login: admin@nabda.ai / ${DEMO_PASSWORD}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
