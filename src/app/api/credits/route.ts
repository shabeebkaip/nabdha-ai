import { NextResponse } from "next/server";
import { requireCompanySession } from "@/lib/session";
import { errorToResponse } from "@/lib/api-response";
import { getWallets, getUsageLedger } from "@/lib/credits";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { companyId } = await requireCompanySession();
    const [wallets, usage] = await Promise.all([getWallets(companyId), getUsageLedger(companyId, 20)]);
    return NextResponse.json({
      wallets: wallets.map((w) => ({
        walletType: w.walletType,
        balance: w.balance,
        allowance: w.allowance,
        resetDate: w.resetDate?.toISOString() ?? null,
      })),
      usage,
    });
  } catch (err) {
    return errorToResponse("credits:GET", err);
  }
}
