import { test, expect } from "@playwright/test";
import crypto from "node:crypto";

// Lightweight smoke test for the client §32 investor demo flow. Run against
// a running dev/preview server: `npx playwright test e2e/investor-flow.spec.ts`
// (needs a live ANTHROPIC_API_KEY in .env.local for the live-AI assertions
// to be meaningful; falls back gracefully otherwise since the fallback
// engine also satisfies the same assertions per docs/API_CONTRACT.md).

test.setTimeout(120_000);

test("signup -> onboarding -> demo data -> dashboard shows client §33 numbers", async ({ page }) => {
  const rand = crypto.randomUUID().slice(0, 8);
  await page.goto("/");
  await page.locator('a[href="/signup"]').first().click();
  await page.waitForURL("**/signup");

  await page.fill("#name", "QA Tester");
  await page.fill("#email", `qa-${rand}@nabda.ai`);
  await page.fill("#password", "QaTest1234!");
  await page.fill("#companyName", "QA Test Co");
  await page.click("#industry");
  await page.getByRole("option").first().click();
  await page.click("#companySize");
  await page.getByRole("option").first().click();
  await page.click('button[type="submit"]');
  await page.waitForURL("**/app/onboarding**");

  await page.fill("#ob-country", "Saudi Arabia");
  await page.click('button[type="submit"]');
  await page.waitForURL("**step=2**");
  await page.click('button[type="submit"]');
  await page.waitForURL("**step=3**");
  await page.getByRole("button", { name: /continue to data upload/i }).click();
  await page.waitForURL("**/app/data**");

  await page.getByRole("button", { name: /use.*demo/i }).click();
  await page.waitForURL("**/app/processing**", { timeout: 15_000 });
  // Processing lands back on My Data (not the dashboard) by design — see
  // processing-client.tsx: the just-analyzed source shows there as saved.
  await page.waitForURL("**/app/data", { timeout: 60_000 }); // live AI ~20-26s + min 3s hold

  await page.waitForLoadState("networkidle");
  const body = await page.locator("body").innerText();
  expect(body).toContain("78"); // health score, client §33
  expect(body).toContain("Nabda Retail Demo");
  expect(body).toContain("Analyzed");

  // Drill into the just-analyzed source's own dashboard and confirm the
  // pinned client §33 numbers (health 78, revenue 1,240,000, +12.4% growth).
  await page.getByRole("button", { name: /view results/i }).click();
  await page.waitForURL("**/app/data/*");
  await page.waitForLoadState("networkidle");
  const dashboardBody = await page.locator("body").innerText();
  expect(dashboardBody).toContain("78");
  expect(dashboardBody).toContain("1,240,000");
  expect(dashboardBody).toContain("12.4");
});

test("auth gating: unauthenticated /app and /admin redirect to /login", async ({ request }) => {
  const appRes = await request.get("/app", { maxRedirects: 0 }).catch((e) => e);
  const adminRes = await request.get("/admin", { maxRedirects: 0 }).catch((e) => e);
  expect([301, 302, 307, 308]).toContain(appRes.status?.() ?? appRes.status);
  expect([301, 302, 307, 308]).toContain(adminRes.status?.() ?? adminRes.status);
});

test("tenant isolation: company B cannot read company A's report by id", async ({ browser }) => {
  const ctxA = await browser.newContext();
  const pageA = await ctxA.newPage();
  await pageA.goto("/login");
  await pageA.fill("#email", "demo@nabda.ai");
  await pageA.fill("#password", "NabdaDemo123!");
  await pageA.click('button[type="submit"]');
  await pageA.waitForURL("**/app**");
  const reports = await (await pageA.request.get("/api/reports")).json();

  const rand = crypto.randomUUID().slice(0, 8);
  const ctxB = await browser.newContext();
  const pageB = await ctxB.newPage();
  await pageB.goto("/signup");
  await pageB.fill("#name", "QA B");
  await pageB.fill("#email", `qa-tenant-${rand}@nabda.ai`);
  await pageB.fill("#password", "QaTest1234!");
  await pageB.fill("#companyName", "QA Co B");
  await pageB.click("#industry");
  await pageB.getByRole("option").first().click();
  await pageB.click("#companySize");
  await pageB.getByRole("option").first().click();
  await pageB.click('button[type="submit"]');
  await pageB.waitForURL("**/app/onboarding**");

  if (reports[0]?.id) {
    const cross = await pageB.request.get(`/api/reports/${reports[0].id}`);
    expect(cross.status()).toBe(404); // never 403 — API_CONTRACT.md: don't confirm existence
  }

  const foreignRun = await pageB.request.post("/api/analysis/run", {
    data: { datasetId: crypto.randomUUID() },
  });
  expect(foreignRun.status()).toBe(404);

  await ctxA.close();
  await ctxB.close();
});

test("credit engine: two concurrent analysis requests for the same dataset must not double-charge", async ({ browser }) => {
  // QA finding: /api/analysis/run has no idempotency/dedup guard — a
  // double-click (or a page refresh while the request is in flight, or
  // React StrictMode's dev double-effect-invoke on /app/processing) fires
  // two real POSTs and charges credits twice for one upload. This asserts
  // the fix once applied: exactly one charge, one analysis, regardless of
  // how many concurrent requests arrive for the same datasetId.
  const rand = crypto.randomUUID().slice(0, 8);
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto("/signup");
  await page.fill("#name", "QA Credit");
  await page.fill("#email", `qa-credit-${rand}@nabda.ai`);
  await page.fill("#password", "QaTest1234!");
  await page.fill("#companyName", "QA Credit Co");
  await page.click("#industry");
  await page.getByRole("option").first().click();
  await page.click("#companySize");
  await page.getByRole("option").first().click();
  await page.click('button[type="submit"]');
  await page.waitForURL("**/app/onboarding**");

  const before = await (await page.request.get("/api/credits")).json();
  const beforeBalance = before.wallets.find((w: { walletType: string }) => w.walletType === "ai_credits").balance;

  const dataset = await (
    await page.request.post("/api/datasets", { data: { sourceType: "demo" } })
  ).json();

  const [r1, r2] = await Promise.all([
    page.request.post("/api/analysis/run", { data: { datasetId: dataset.id } }),
    page.request.post("/api/analysis/run", { data: { datasetId: dataset.id } }),
  ]);
  expect(r1.status()).toBe(200);
  expect(r2.status()).toBe(200);

  const after = await (await page.request.get("/api/credits")).json();
  const afterBalance = after.wallets.find((w: { walletType: string }) => w.walletType === "ai_credits").balance;
  const cost = beforeBalance - afterBalance;

  // Today this fails with cost === 4 (charged twice) — asserting the
  // correct single-charge outcome so this locks in once fixed.
  expect(cost).toBe(2);

  await ctx.close();
});

test("admin config edit reflects live on the public pricing page (client §52)", async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto("/login");
  await page.fill("#email", "admin@nabda.ai");
  await page.fill("#password", "NabdaDemo123!");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(app|admin)/);

  const rows = await (await page.request.get("/api/admin/config")).json();
  const basic = rows.find((r: { key: string }) => r.key === "pricing.basic");
  const original = basic.value;

  await page.request.patch("/api/admin/config", {
    data: { key: "pricing.basic", value: { ...original, monthlyPrice: 77 } },
  });
  const pricingText = await (await page.request.get("/pricing")).text();
  expect(pricingText).toContain("77");

  // revert
  await page.request.patch("/api/admin/config", { data: { key: "pricing.basic", value: original } });
});
