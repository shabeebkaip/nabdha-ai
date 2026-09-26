import type { Metadata } from "next";
import { sql, desc, eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { users, companies, subscriptions, creditTransactions, reports, datasets, leads, adminConfig } from "@/db/schema";
import { getLivePricingPlans } from "@/lib/pricing-live";
import { getLocale } from "@/lib/get-locale";
import {
  OverviewView,
  UsersView,
  LeadsView,
  ConfigView,
  type AdminLeadRow,
  type AdminUserRow,
} from "./admin-views";

export const metadata: Metadata = { title: "Admin — Nabda AI" };

// One-line summary of a lead, picked from its kind-specific payload field, so
// the admin can scan enquiries without opening each one.
function leadSummary(kind: string, payload: Record<string, unknown>): string {
  const pick = (k: string) => (typeof payload[k] === "string" ? (payload[k] as string) : "");
  switch (kind) {
    case "consultation":
      return pick("topic");
    case "training":
      return [pick("category"), pick("format")].filter(Boolean).join(" · ");
    case "integration":
      return pick("systemName") || pick("businessObjective");
    case "enterprise":
      return pick("companyName") || pick("requirement");
    default:
      return "";
  }
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [locale, { tab }] = await Promise.all([getLocale(), searchParams]);

  // eslint-disable-next-line react-hooks/purity -- async Server Component, runs once per request
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsersRow,
    newUsersRow,
    reportsCountRow,
    datasetsCountRow,
    trialSubs,
    activeSubs,
    creditRows,
    leadRows,
    userRows,
    configRows,
    plans,
  ] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(users),
    db.select({ n: sql<number>`count(*)::int` }).from(users).where(sql`${users.createdAt} >= ${thirtyDaysAgo}`),
    db.select({ n: sql<number>`count(*)::int` }).from(reports),
    db.select({ n: sql<number>`count(*)::int` }).from(datasets),
    db.select().from(subscriptions).where(eq(subscriptions.status, "trial")),
    db.select().from(subscriptions).where(eq(subscriptions.status, "active")),
    db.select({ delta: creditTransactions.delta }).from(creditTransactions).where(lt(creditTransactions.delta, 0)),
    db.select().from(leads).orderBy(desc(leads.createdAt)).limit(200),
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        company: companies.name,
      })
      .from(users)
      .leftJoin(companies, eq(companies.ownerUserId, users.id))
      .orderBy(desc(users.createdAt))
      .limit(200),
    db.select().from(adminConfig).orderBy(adminConfig.category, adminConfig.key),
    getLivePricingPlans(),
  ]);

  const trialUsers = trialSubs.length;
  const paidUsers = activeSubs.length;
  const mrr = activeSubs.reduce((sum, sub) => {
    const plan = plans.find((p) => p.id === sub.plan);
    return sum + (plan?.monthlyPrice ?? 0);
  }, 0);
  const aiCreditsConsumed = creditRows.reduce((sum, r) => sum + Math.abs(r.delta), 0);
  const conversionPct = trialUsers + paidUsers > 0 ? Math.round((paidUsers / (trialUsers + paidUsers)) * 100) : 0;

  const stats = {
    totalUsers: totalUsersRow[0]?.n ?? 0,
    newUsers: newUsersRow[0]?.n ?? 0,
    trialUsers,
    paidUsers,
    mrr,
    arr: mrr * 12,
    conversionPct,
    aiCreditsConsumed,
    reportsGenerated: reportsCountRow[0]?.n ?? 0,
    datasetsProcessed: datasetsCountRow[0]?.n ?? 0,
  };

  const leadDtos: AdminLeadRow[] = leadRows.map((l) => {
    const payload = (l.payload ?? {}) as Record<string, unknown>;
    return {
      id: l.id,
      kind: l.kind,
      contactName: (payload.contactName as string) ?? "—",
      contactEmail: (payload.contactEmail as string) ?? "—",
      summary: leadSummary(l.kind, payload),
      status: l.status,
      createdAt: l.createdAt.toISOString(),
    };
  });

  const userDtos: AdminUserRow[] = userRows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    company: u.company ?? "—",
    createdAt: u.createdAt.toISOString(),
  }));

  const configDtos = configRows.map((r) => ({ key: r.key, category: r.category, value: r.value, updatedAt: r.updatedAt.toISOString() }));

  if (tab === "users") return <UsersView locale={locale} users={userDtos} />;
  if (tab === "leads") return <LeadsView locale={locale} leads={leadDtos} />;
  if (tab === "config") return <ConfigView locale={locale} config={configDtos} />;
  return <OverviewView locale={locale} stats={stats} />;
}
