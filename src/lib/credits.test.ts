// Integration test against the real (dev) Neon DB — credit engine has no
// pure-function seam worth mocking (it *is* the SQL). Creates a throwaway
// user/company/wallet, exercises deduct/refund/insufficient-balance/
// concurrency, then cleans up after itself.
import { test } from "node:test";
import assert from "node:assert/strict";
import { db } from "@/db";
import { users, companies, creditWallets, creditTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deductCredits, refundCredits, chargeAction, InsufficientCreditsError } from "./credits";

async function makeCompanyWithWallet(balance: number) {
  const [user] = await db
    .insert(users)
    .values({ name: "Test", email: `test-${crypto.randomUUID()}@example.com`, passwordHash: "x" })
    .returning();
  const [company] = await db
    .insert(companies)
    .values({ ownerUserId: user!.id, name: "Test Co" })
    .returning();
  const [wallet] = await db
    .insert(creditWallets)
    .values({ companyId: company!.id, walletType: "ai_credits", balance, allowance: balance })
    .returning();
  return { user: user!, company: company!, wallet: wallet! };
}

async function cleanup(companyId: string, userId: string) {
  const wallets = await db.select().from(creditWallets).where(eq(creditWallets.companyId, companyId));
  for (const w of wallets) {
    await db.delete(creditTransactions).where(eq(creditTransactions.walletId, w.id));
  }
  await db.delete(creditWallets).where(eq(creditWallets.companyId, companyId));
  await db.delete(companies).where(eq(companies.id, companyId));
  await db.delete(users).where(eq(users.id, userId));
}

test("deductCredits lowers balance and writes a ledger row", async () => {
  const { user, company } = await makeCompanyWithWallet(100);
  try {
    const { balance } = await deductCredits({
      companyId: company.id,
      walletType: "ai_credits",
      cost: 30,
      reason: "standardAnalysis",
    });
    assert.equal(balance, 70);

    const wallets = await db.select().from(creditWallets).where(eq(creditWallets.companyId, company.id));
    assert.equal(wallets[0]!.balance, 70);

    const txns = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.walletId, wallets[0]!.id));
    assert.equal(txns.length, 1);
    assert.equal(txns[0]!.delta, -30);
  } finally {
    await cleanup(company.id, user.id);
  }
});

test("deductCredits throws InsufficientCreditsError and leaves balance unchanged", async () => {
  const { user, company } = await makeCompanyWithWallet(10);
  try {
    await assert.rejects(
      () => deductCredits({ companyId: company.id, walletType: "ai_credits", cost: 50, reason: "x" }),
      InsufficientCreditsError
    );
    const wallets = await db.select().from(creditWallets).where(eq(creditWallets.companyId, company.id));
    assert.equal(wallets[0]!.balance, 10);
    const txns = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.walletId, wallets[0]!.id));
    assert.equal(txns.length, 0);
  } finally {
    await cleanup(company.id, user.id);
  }
});

test("concurrent deducts that together exceed balance: exactly one succeeds", async () => {
  const { user, company } = await makeCompanyWithWallet(50);
  try {
    const attempt = () =>
      deductCredits({ companyId: company.id, walletType: "ai_credits", cost: 40, reason: "race" }).then(
        () => "ok" as const,
        () => "fail" as const
      );
    const [a, b] = await Promise.all([attempt(), attempt()]);
    const outcomes = [a, b];
    assert.equal(outcomes.filter((o) => o === "ok").length, 1);
    assert.equal(outcomes.filter((o) => o === "fail").length, 1);

    const wallets = await db.select().from(creditWallets).where(eq(creditWallets.companyId, company.id));
    assert.equal(wallets[0]!.balance, 10); // only one deduction of 40 applied
  } finally {
    await cleanup(company.id, user.id);
  }
});

test("refundCredits raises balance and writes a positive ledger row", async () => {
  const { user, company } = await makeCompanyWithWallet(20);
  try {
    const { balance } = await refundCredits({
      companyId: company.id,
      walletType: "ai_credits",
      amount: 15,
      reason: "refund_test",
    });
    assert.equal(balance, 35);
  } finally {
    await cleanup(company.id, user.id);
  }
});

test("chargeAction refunds the deduction when the downstream action throws", async () => {
  const { user, company } = await makeCompanyWithWallet(100);
  try {
    await assert.rejects(
      () =>
        chargeAction(
          { companyId: company.id, walletType: "ai_credits", cost: 30, reason: "standardAnalysis" },
          async () => {
            throw new Error("downstream write failed");
          }
        ),
      /downstream write failed/
    );

    const wallets = await db.select().from(creditWallets).where(eq(creditWallets.companyId, company.id));
    assert.equal(wallets[0]!.balance, 100); // deduction was refunded, net zero

    const txns = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.walletId, wallets[0]!.id));
    assert.equal(txns.length, 2); // -30 deduct, +30 refund
    assert.deepEqual(
      txns.map((t) => t.delta).sort((a, b) => a - b),
      [-30, 30]
    );
  } finally {
    await cleanup(company.id, user.id);
  }
});

test("chargeAction does not refund on success", async () => {
  const { user, company } = await makeCompanyWithWallet(100);
  try {
    const { result, balance } = await chargeAction(
      { companyId: company.id, walletType: "ai_credits", cost: 30, reason: "standardAnalysis" },
      async () => "ok"
    );
    assert.equal(result, "ok");
    assert.equal(balance, 70);

    const wallets = await db.select().from(creditWallets).where(eq(creditWallets.companyId, company.id));
    assert.equal(wallets[0]!.balance, 70);
  } finally {
    await cleanup(company.id, user.id);
  }
});
