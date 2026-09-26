// Shared "require an authed session, scoped to a company" helper used by
// every protected route handler — the single place tenant-scoping and the
// 401/403 rule (client §26/§43) is enforced, instead of re-derived per route.
import { auth } from "@/auth";

export class UnauthenticatedError extends Error {}
export class ForbiddenError extends Error {}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new UnauthenticatedError();
  return session;
}

export async function requireCompanySession() {
  const session = await requireSession();
  if (!session.user.companyId) throw new ForbiddenError();
  return { ...session, companyId: session.user.companyId as string };
}

export async function requireAdminSession() {
  const session = await requireSession();
  if (session.user.role !== "admin") throw new ForbiddenError();
  return session;
}
