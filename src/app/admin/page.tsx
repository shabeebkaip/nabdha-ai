import type { Metadata } from "next";
import { sql, desc, eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { users, subscriptions, creditTransactions, reports, datasets, leads, adminConfig } from "@/db/schema";
import { getLivePricingPlans } from "@/lib/pricing-live";
import { getLocale } from "@/lib/get-locale";
import { t } from "@/lib/i18n";
import { AdminTabs, type AdminLeadRow } from "./admin-tabs";

export const metadata: Metadata = { title: "Admin — Nabda AI" };

export default async function AdminPage() {
  const locale = await getLocale();
  // ponytail: react-hooks/purity flags Date.now() unconditionally, but this
  // is an async Server Component (runs once per request server-side, never
  // re-rendered client-side) — the "unstable render" concern the rule
  // guards against doesn't apply here.
  // eslint-disable-next-line react-hooks/purity
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
    db.select().from(leads).orderBy(desc(leads.createdAt)).limit(50),
    db.select().from(adminConfig).orderBy(adminConfig.category, adminConfig.key),
    getLivePricingPlans(),
  ]);

  const totalUsers = totalUsersRow[0]?.n ?? 0;
  const reportsCount = reportsCountRow[0]?.n ?? 0;
  const datasetsCount = datasetsCountRow[0]?.n ?? 0;
  const trialUsers = trialSubs.length;
  const paidUsers = activeSubs.length;
  const mrr = activeSubs.reduce((sum, sub) => {
    const plan = plans.find((p) => p.id === sub.plan);
    return sum + (plan?.monthlyPrice ?? 0);
  }, 0);
  const aiCreditsConsumed = creditRows.reduce((sum, r) => sum + Math.abs(r.delta), 0);
  const conversionPct = trialUsers + paidUsers > 0 ? Math.round((paidUsers / (trialUsers + paidUsers)) * 100) : 0;

  const leadDtos: AdminLeadRow[] = leadRows.map((l) => {
    const payload = l.payload as { contactName?: string; contactEmail?: string };
    return {
      id: l.id,
      kind: l.kind,
      contactName: payload.contactName ?? "—",
      contactEmail: payload.contactEmail ?? "—",
      status: l.status,
      createdAt: l.createdAt.toISOString(),
    };
  });

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">{t(locale, "admin.title")}</h1>
      <AdminTabs
        locale={locale}
        stats={{
          totalUsers,
          newUsers: newUsersRow[0]?.n ?? 0,
          trialUsers,
          paidUsers,
          mrr,
          arr: mrr * 12,
          conversionPct,
          aiCreditsConsumed,
          reportsGenerated: reportsCount,
          datasetsProcessed: datasetsCount,
        }}
        leads={leadDtos}
        config={configRows.map((r) => ({ key: r.key, category: r.category, value: r.value, updatedAt: r.updatedAt.toISOString() }))}
      />
    </div>
  );
}
