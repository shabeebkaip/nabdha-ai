import type { LucideIcon } from "lucide-react";
import { Users, Wallet, TrendingUp, CreditCard, Sparkles, FileText, Database, Inbox } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { t, type DictKey, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ConfigRow } from "./config-row";

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
export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  createdAt: string;
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
export interface AdminConfigRowData {
  key: string;
  category: string;
  value: unknown;
  updatedAt: string;
}

type Accent = "primary" | "success" | "insight" | "warning";
const ACCENT: Record<Accent, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success-bright/10 text-success-bright",
  insight: "bg-insight-bright/10 text-insight-bright",
  warning: "bg-warning-bright/10 text-warning-bright",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function kindKey(kind: string): DictKey {
  const map: Record<string, DictKey> = {
    consultation: "leads.consultation.eyebrow",
    training: "leads.training.eyebrow",
    integration: "leads.integration.eyebrow",
    enterprise: "leads.enterprise.eyebrow",
  };
  return map[kind] ?? "admin.leads.kind";
}

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

// ── shared chrome ────────────────────────────────────────────────────────────

export function ViewHeader({ title, subtitle, meta }: { title: string; subtitle: string; meta?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {meta && <span className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">{meta}</span>}
    </div>
  );
}

function StatTile({
  icon: Icon,
  accent,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  accent: Accent;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-[transform,box-shadow] duration-300 ease-nabda hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-16px_rgba(16,24,40,0.25)]">
      <span className={cn("flex size-9 items-center justify-center rounded-xl", ACCENT[accent])}>
        <Icon aria-hidden className="size-4.5" />
      </span>
      <p className="mt-4 font-mono text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">{label}</p>
      <p className="nabda-numeral mt-1 text-3xl font-extrabold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-mono text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{title}</h2>
      {children}
    </section>
  );
}

function TableShell({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]">{children}</div>;
}

function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon aria-hidden className="size-5" />
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// ── views ────────────────────────────────────────────────────────────────────

export function OverviewView({ locale, stats }: { locale: Locale; stats: AdminOverviewStats }) {
  const trialShare = stats.trialUsers + stats.paidUsers > 0 ? (stats.paidUsers / (stats.trialUsers + stats.paidUsers)) * 100 : 0;
  return (
    <>
      <ViewHeader title={t(locale, "admin.tab.overview")} subtitle={t(locale, "adminNav.overviewSub")} />

      <div className="flex flex-col gap-8">
        <Panel title={t(locale, "adminNav.group.growth")}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              icon={Users}
              accent="primary"
              label={t(locale, "admin.overview.totalUsers")}
              value={fmt(stats.totalUsers)}
              sub={`+${fmt(stats.newUsers)} ${t(locale, "adminNav.last30")}`}
            />
            <StatTile
              icon={Wallet}
              accent="success"
              label={t(locale, "admin.overview.mrr")}
              value={`${fmt(stats.mrr)} SAR`}
              sub={`${fmt(stats.arr)} SAR ${t(locale, "adminNav.annualized")}`}
            />
            <StatTile
              icon={CreditCard}
              accent="insight"
              label={t(locale, "admin.overview.paidUsers")}
              value={fmt(stats.paidUsers)}
              sub={`${fmt(stats.trialUsers)} ${t(locale, "admin.overview.trialUsers").toLowerCase()}`}
            />
            <StatTile
              icon={TrendingUp}
              accent="warning"
              label={t(locale, "admin.overview.conversion")}
              value={`${stats.conversionPct}%`}
              sub={t(locale, "adminNav.trialToPaid")}
            />
          </div>

          {/* Subscription split — a single bar reads faster than two boxes. */}
          <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{t(locale, "adminNav.subscriptions")}</span>
              <span className="text-muted-foreground">
                {fmt(stats.paidUsers)} {t(locale, "adminNav.paid")} · {fmt(stats.trialUsers)} {t(locale, "adminNav.trial")}
              </span>
            </div>
            <div aria-hidden className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-muted">
              <div className="bg-insight-bright" style={{ width: `${trialShare}%` }} />
              <div className="flex-1 bg-warning-bright/40" />
            </div>
          </div>
        </Panel>

        <Panel title={t(locale, "adminNav.group.usage")}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile icon={Sparkles} accent="primary" label={t(locale, "admin.overview.aiCreditsConsumed")} value={fmt(stats.aiCreditsConsumed)} />
            <StatTile icon={FileText} accent="success" label={t(locale, "admin.overview.reportsGenerated")} value={fmt(stats.reportsGenerated)} />
            <StatTile icon={Database} accent="insight" label={t(locale, "admin.overview.presentationsGenerated")} value={fmt(stats.datasetsProcessed)} />
          </div>
        </Panel>
      </div>
    </>
  );
}

export function UsersView({ locale, users }: { locale: Locale; users: AdminUserRow[] }) {
  return (
    <>
      <ViewHeader
        title={t(locale, "admin.tab.users")}
        subtitle={t(locale, "adminNav.usersSub")}
        meta={`${fmt(users.length)} ${t(locale, "admin.users.count")}`}
      />
      {users.length === 0 ? (
        <EmptyState icon={Users} message={t(locale, "admin.users.empty")} />
      ) : (
        <TableShell>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
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
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{initials(u.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{u.name}</p>
                        <p dir="ltr" className="truncate text-xs text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.company}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "default" : "outline"} className="capitalize">
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString(locale === "ar" ? "ar" : "en-US")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
      )}
    </>
  );
}

const STATUS_TONE: Record<string, string> = {
  new: "border-primary/30 bg-primary/10 text-primary",
  contacted: "border-warning-bright/30 bg-warning-bright/10 text-warning-bright",
  closed: "border-success-bright/30 bg-success-bright/10 text-success-bright",
};

export function LeadsView({ locale, leads }: { locale: Locale; leads: AdminLeadRow[] }) {
  return (
    <>
      <ViewHeader
        title={t(locale, "admin.tab.leads")}
        subtitle={t(locale, "adminNav.leadsSub")}
        meta={`${fmt(leads.length)} ${t(locale, "admin.leads.count")}`}
      />
      {leads.length === 0 ? (
        <EmptyState icon={Inbox} message={t(locale, "admin.leads.empty")} />
      ) : (
        <TableShell>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
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
                    <Badge variant="outline" className="capitalize whitespace-nowrap">
                      {t(locale, kindKey(lead.kind))}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">{initials(lead.contactName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{lead.contactName}</p>
                        <p dir="ltr" className="truncate text-xs text-muted-foreground">
                          {lead.contactEmail}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{lead.summary || "—"}</TableCell>
                  <TableCell>
                    <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize", STATUS_TONE[lead.status] ?? "border-border bg-muted text-muted-foreground")}>
                      {lead.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleDateString(locale === "ar" ? "ar" : "en-US")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
      )}
    </>
  );
}

export function ConfigView({ locale, config }: { locale: Locale; config: AdminConfigRowData[] }) {
  return (
    <>
      <ViewHeader title={t(locale, "admin.tab.config")} subtitle={t(locale, "admin.config.subtitle")} meta={`${fmt(config.length)} ${t(locale, "adminNav.settings")}`} />
      <TableShell>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t(locale, "admin.config.category")}</TableHead>
              <TableHead>{t(locale, "admin.config.key")}</TableHead>
              <TableHead>{t(locale, "admin.config.value")}</TableHead>
              <TableHead>{t(locale, "admin.config.updated")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {config.map((row) => (
              <ConfigRow key={row.key} configKey={row.key} category={row.category} value={row.value} updatedAt={row.updatedAt} locale={locale} />
            ))}
          </TableBody>
        </Table>
      </TableShell>
    </>
  );
}
