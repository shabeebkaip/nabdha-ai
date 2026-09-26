import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

// After the admin login form signs a user in, it calls this to confirm the
// account is actually an admin — so a valid *user* credential can't slip into
// the admin panel and get silently bounced to /app with no explanation.
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ ok: false }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ ok: false }, { status: 403 });
  return NextResponse.json({ ok: true });
}
