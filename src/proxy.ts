// Nabda AI — Next.js 16 Proxy (formerly "middleware"; same runtime contract,
// see node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md).
// Optimistic auth gate: /app/* requires a session, /admin/* requires
// role=admin. This only decodes the existing JWT cookie (no DB call) —
// route handlers and server components still do the authoritative
// requireCompanySession()/requireAdminSession() check (see src/lib/session.ts).
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/app", req.url));
    }
  }

  if (pathname.startsWith("/app")) {
    if (!session?.user) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
