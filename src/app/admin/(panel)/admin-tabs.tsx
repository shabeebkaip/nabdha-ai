"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { t, type DictKey, type Locale } from "@/lib/i18n";
import { ConfigRow } from "./config-row";

// Lead `kind` → its human label key (reuses the marketing form eyebrow labels).
function kindKey(kind: string): DictKey {
  const map: Record<string, DictKey> = {
    consultation: "leads.consultation.eyebrow",
    training: "leads.training.eyebrow",
    integration: "leads.integration.eyebrow",
    enterprise: "leads.enterprise.eyebrow",
  };
  return map[kind] ?? "admin.leads.kind";
}

export interface AdminOverviewStats {
  totalUsers: number;
  newUsers: number;
  trialUsers: number;
  paidUsers: number;
  mrr: number;
  arr: number;
  conversionPct: number;
  aiCreditsConsumed: number;
  reportsGenerated: number;
  datasetsProcessed: number;
}

export interface AdminLeadRow {
  id: string;
  kind: string;
  contactName: string;
  contactEmail: string;
  summary: string;
  status: string;
  createdAt: string;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  createdAt: string;
}

export interface AdminConfigRowData {
  key: string;
  category: string;
  value: unknown;
  updatedAt: string;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="font-mono text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">{label}</p>
        <p className="nabda-numeral mt-1 text-2xl font-extrabold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

export function AdminTabs({
  locale,
  stats,
  users,
  leads,
  config,
}: {
  locale: Locale;
  stats: AdminOverviewStats;
  users: AdminUserRow[];
  leads: AdminLeadRow[];
  config: AdminConfigRowData[];
}) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">{t(locale, "admin.tab.overview")}</TabsTrigger>
        <TabsTrigger value="users">{t(locale, "admin.tab.users")}</TabsTrigger>
        <TabsTrigger value="leads">{t(locale, "admin.tab.leads")}</TabsTrigger>
        <TabsTrigger value="config">{t(locale, "admin.tab.config")}</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label={t(locale, "admin.overview.totalUsers")} value={stats.totalUsers.toLocaleString("en-US")} />
          <StatCard label={t(locale, "admin.overview.trialUsers")} value={stats.trialUsers.toLocaleString("en-US")} />
          <StatCard label={t(locale, "admin.overview.paidUsers")} value={stats.paidUsers.toLocaleString("en-US")} />
          <StatCard label={t(locale, "admin.overview.conversion")} value={`${stats.conversionPct}%`} />
          <StatCard label={t(locale, "admin.overview.mrr")} value={`${stats.mrr.toLocaleString("en-US")} SAR`} />
          <StatCard label={t(locale, "admin.overview.arr")} value={`${stats.arr.toLocaleString("en-US")} SAR`} />
          <StatCard label={t(locale, "admin.overview.aiCreditsConsumed")} value={stats.aiCreditsConsumed.toLocaleString("en-US")} />
          <StatCard label={t(locale, "admin.overview.reportsGenerated")} value={stats.reportsGenerated.toLocaleString("en-US")} />
        </div>
        {stats.totalUsers === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">{t(locale, "admin.overview.waiting")}</p>
        )}
      </TabsContent>

      <TabsContent value="users" className="mt-6">
        {users.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t(locale, "admin.users.empty")}</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {users.length.toLocaleString("en-US")} {t(locale, "admin.users.count")}
            </p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t(locale, "admin.users.name")}</TableHead>
                    <TableHead>{t(locale, "admin.users.company")}</TableHead>
                    <TableHead>{t(locale, "admin.users.role")}</TableHead>
                    <TableHead>{t(locale, "admin.users.joined")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <p className="font-medium">{u.name}</p>
                        <p dir="ltr" className="text-xs text-muted-foreground">
                          {u.email}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.company}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "admin" ? "default" : "outline"} className="capitalize">
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString(locale === "ar" ? "ar" : "en-US")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </TabsContent>

      <TabsContent value="leads" className="mt-6">
        {leads.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t(locale, "admin.leads.empty")}</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {leads.length.toLocaleString("en-US")} {t(locale, "admin.leads.count")}
            </p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t(locale, "admin.leads.kind")}</TableHead>
                    <TableHead>{t(locale, "admin.leads.contact")}</TableHead>
                    <TableHead>{t(locale, "admin.leads.detail")}</TableHead>
                    <TableHead>{t(locale, "admin.leads.status")}</TableHead>
                    <TableHead>{t(locale, "admin.leads.received")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {t(locale, kindKey(lead.kind))}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{lead.contactName}</p>
                        <p dir="ltr" className="text-xs text-muted-foreground">
                          {lead.contactEmail}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-xs text-sm text-muted-foreground">{lead.summary || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString(locale === "ar" ? "ar" : "en-US")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </TabsContent>

      <TabsContent value="config" className="mt-6">
        <p className="mb-4 text-sm text-muted-foreground">{t(locale, "admin.config.subtitle")}</p>
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t(locale, "admin.config.category")}</TableHead>
                <TableHead>{t(locale, "admin.config.key")}</TableHead>
                <TableHead>{t(locale, "admin.config.value")}</TableHead>
                <TableHead>{t(locale, "admin.config.updated")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {config.map((row) => (
                <ConfigRow
                  key={row.key}
                  configKey={row.key}
                  category={row.category}
                  value={row.value}
                  updatedAt={row.updatedAt}
                  locale={locale}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
}
