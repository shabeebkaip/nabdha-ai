// Nabda AI — credit engine. Deduction is the one place concurrency
// correctness is non-negotiable (client §17: model cost decoupled from
// customer price, but the *balance guard* must never allow double-spend).
//
// ponytail: drizzle-orm/neon-http has no interactive transactions (see
// src/db/index.ts comment). Instead of BEGIN/COMMIT, the deduct/refund
// below use a single data-modifying-CTE SQL statement — one HTTP
// round-trip, atomic at the Postgres level via the `WHERE balance >= cost`
// guard. If neon-serverless Pool transactions are ever needed elsewhere,
// swap only this file's execute path, not the schema.

import { sql, eq, desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { adminConfig, creditWallets, creditTransactions } from "@/db/schema";
import type { CreditAction } from "@/lib/ai/types";

export class InsufficientCreditsError extends Error {
  constructor() {
    super("Insufficient credits");
    this.name = "InsufficientCreditsError";
  }
}

export class WalletNotFoundError extends Error {
  constructor() {
    super("Wallet not found");
    this.name = "WalletNotFoundError";
  }
}

type WalletType = "ai_credits" | "slides";

export async function getCreditCost(action: CreditAction): Promise<number | null> {
  const [row] = await db
    .select()
    .from(adminConfig)
    .where(eq(adminConfig.key, "credits.costTable"));
  const table = (row?.value ?? {}) as Record<string, number | null>;
  return table[action] ?? null;
}

export async function getWallets(companyId: string) {
  return db.select().from(creditWallets).where(eq(creditWallets.companyId, companyId));
}

async function getWalletId(companyId: string, walletType: WalletType) {
  const [row] = await db
    .select({ id: creditWallets.id })
    .from(creditWallets)
    .where(sql`${creditWallets.companyId} = ${companyId} and ${creditWallets.walletType} = ${walletType}`);
  return row?.id ?? null;
}

/**
 * Atomically deducts `cost` credits from a company's wallet and writes the
 * ledger row in the same round-trip. Throws InsufficientCreditsError if the
 * balance is too low (including under concurrent double-spend — the
 * `balance >= cost` guard in the UPDATE's WHERE clause makes only one of
 * two racing deducts win).
 */
export async function deductCredits(params: {
  companyId: string;
  walletType: WalletType;
  cost: number;
  reason: string;
  refId?: string;
}): Promise<{ balance: number }> {
  const { companyId, walletType, cost, reason, refId } = params;
  if (cost <= 0) {
    const walletId = await getWalletId(companyId, walletType);
    if (!walletId) throw new WalletNotFoundError();
    const [wallet] = await db
      .select({ balance: creditWallets.balance })
      .from(creditWallets)
      .where(eq(creditWallets.id, walletId));
    return { balance: wallet!.balance };
  }

  const walletId = await getWalletId(companyId, walletType);
  if (!walletId) throw new WalletNotFoundError();

  const result = await db.execute<{ balance: number }>(sql`
    WITH updated AS (
      UPDATE credit_wallets
      SET balance = balance - ${cost}
      WHERE id = ${walletId} AND balance >= ${cost}
      RETURNING id, balance
    ), inserted AS (
      INSERT INTO credit_transactions (wallet_id, delta, reason, ref_id)
      SELECT id, ${-cost}, ${reason}, ${refId ?? null} FROM updated
      RETURNING wallet_id
    )
    SELECT balance FROM updated
  `);

  const row = result.rows[0];
  if (!row) throw new InsufficientCreditsError();
  return { balance: row.balance };
}

/**
 * Deducts credits, runs `fn`, and auto-refunds if `fn` throws — so a user is
 * never charged for an action that didn't actually produce anything (e.g.
 * the DB write after a successful deduction fails). The deduction itself
 * still happens first (see deductCredits' atomic guard); this only adds the
 * "undo on downstream failure" half.
 */
export async function chargeAction<T>(
  params: { companyId: string; walletType: WalletType; cost: number; reason: string; refId?: string },
  fn: () => Promise<T>
): Promise<{ result: T; balance: number }> {
  const { balance } = await deductCredits(params);
  try {
    return { result: await fn(), balance };
  } catch (err) {
    if (params.cost > 0) {
      try {
        await refundCredits({
          companyId: params.companyId,
          walletType: params.walletType,
          amount: params.cost,
          reason: `refund:${params.reason}`,
          refId: params.refId,
        });
      } catch (refundErr) {
        // ponytail: best-effort refund — if this itself fails (e.g. DB down),
        // log and let the original error surface; a stuck wallet balance is
        // a rare double-failure, not silently swallowed.
        console.error("[credits:refund-on-failure]", refundErr);
      }
    }
    throw err;
  }
}

export async function refundCredits(params: {
  companyId: string;
  walletType: WalletType;
  amount: number;
  reason: string;
  refId?: string;
}): Promise<{ balance: number }> {
  const { companyId, walletType, amount, reason, refId } = params;
  const walletId = await getWalletId(companyId, walletType);
  if (!walletId) throw new WalletNotFoundError();

  const result = await db.execute<{ balance: number }>(sql`
    WITH updated AS (
      UPDATE credit_wallets
      SET balance = balance + ${amount}
      WHERE id = ${walletId}
      RETURNING id, balance
    ), inserted AS (
      INSERT INTO credit_transactions (wallet_id, delta, reason, ref_id)
      SELECT id, ${amount}, ${reason}, ${refId ?? null} FROM updated
      RETURNING wallet_id
    )
    SELECT balance FROM updated
  `);
  return { balance: result.rows[0]!.balance };
}

/**
 * Sets a wallet's balance AND monthly allowance to `credits` (a plan
 * activation top-up, not a relative deduct/refund), resets the 30-day window,
 * and writes one ledger row whose `delta` is the net change from the previous
 * balance — all in a single atomic round-trip. `prev` reads the pre-UPDATE
 * balance from the same statement snapshot, so the ledger delta is correct
 * even though the UPDATE runs in the same CTE. Used by the checkout flow when
 * a company subscribes to a paid plan.
 */
export async function activatePlanCredits(params: {
  companyId: string;
  walletType?: WalletType;
  credits: number;
  reason: string;
  refId?: string;
}): Promise<{ balance: number }> {
  const { companyId, credits, reason, refId } = params;
  const walletType = params.walletType ?? "ai_credits";
  const walletId = await getWalletId(companyId, walletType);
  if (!walletId) throw new WalletNotFoundError();

  const result = await db.execute<{ balance: number }>(sql`
    WITH prev AS (
      SELECT balance AS old FROM credit_wallets WHERE id = ${walletId}
    ), updated AS (
      UPDATE credit_wallets
      SET balance = ${credits}, allowance = ${credits}, reset_date = now() + interval '30 days'
      WHERE id = ${walletId}
      RETURNING id, balance
    ), inserted AS (
      INSERT INTO credit_transactions (wallet_id, delta, reason, ref_id)
      SELECT updated.id, ${credits} - prev.old, ${reason}, ${refId ?? null}
      FROM updated, prev
      RETURNING wallet_id
    )
    SELECT balance FROM updated
  `);
  const row = result.rows[0];
  if (!row) throw new WalletNotFoundError();
  return { balance: row.balance };
}

export async function getUsageLedger(companyId: string, limit = 20) {
  const wallets = await getWallets(companyId);
  const walletIds = wallets.map((w) => w.id);
  if (walletIds.length === 0) return [];
  // ponytail: query builder's inArray, not raw SQL — a raw `ANY(${array})`
  // template interpolates a JS array as a parenthesized tuple `(a, b)`, not
  // a Postgres array literal, which is invalid syntax for `ANY()`.
  const rows = await db
    .select()
    .from(creditTransactions)
    .where(inArray(creditTransactions.walletId, walletIds))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(limit);
  return rows.map((r) => ({
    id: r.id,
    delta: r.delta,
    reason: r.reason,
    createdAt: r.createdAt.toISOString(),
  }));
}
