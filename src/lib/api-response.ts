// Shared error-response shape (docs/API_CONTRACT.md `ApiError`). Never
// leaks stack traces or internals to the client — log server-side instead.
import { NextResponse } from "next/server";
import { UnauthenticatedError, ForbiddenError } from "@/lib/session";
import { InsufficientCreditsError, WalletNotFoundError } from "@/lib/credits";

export function apiError(status: number, code: string, message: string, fields?: Record<string, string>) {
  return NextResponse.json({ error: { code, message, ...(fields ? { fields } : {}) } }, { status });
}

export function logServerError(context: string, err: unknown) {
  // ponytail: console.error is the "structured log" for this demo scale —
  // upgrade to a real logger (pino) if/when volume or multi-service tracing
  // makes plain stdout insufficient.
  console.error(`[${context}]`, err);
}

/** Every protected route's catch block routes through this so the
 * 401/403/404/409/500 mapping lives in one place, not copy-pasted per route. */
export function errorToResponse(context: string, err: unknown) {
  if (err instanceof UnauthenticatedError) return apiError(401, "UNAUTHENTICATED", "Sign in required.");
  if (err instanceof ForbiddenError) return apiError(403, "FORBIDDEN", "Not allowed.");
  if (err instanceof InsufficientCreditsError) {
    return apiError(409, "INSUFFICIENT_CREDITS", "Not enough credits for this action.");
  }
  if (err instanceof WalletNotFoundError) return apiError(404, "WALLET_NOT_FOUND", "Credit wallet not found.");
  logServerError(context, err);
  return apiError(500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
}
