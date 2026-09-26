// One-off: ensure a single admin user exists, without touching demo data.
// Run: npm run admin:ensure   (optionally ADMIN_EMAIL / ADMIN_PASSWORD env vars)
// Idempotent — if the email already exists it's promoted to admin (and its
// password reset only when ADMIN_PASSWORD is provided).
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { users } from "../src/db/schema";

const email = process.env.ADMIN_EMAIL ?? "admin@nabda.ai";
const password = process.env.ADMIN_PASSWORD ?? "NabdaDemo123!";
const name = process.env.ADMIN_NAME ?? "Nabda Admin";

async function main() {
  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) {
    const set: { role: "admin"; passwordHash?: string } = { role: "admin" };
    if (process.env.ADMIN_PASSWORD) set.passwordHash = await bcrypt.hash(password, 10);
    await db.update(users).set(set).where(eq(users.id, existing.id));
    console.log(`Updated existing user to admin: ${email}`);
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(users).values({ name, email, passwordHash, role: "admin" });
    console.log(`Created admin user: ${email} / ${password}`);
  }
  console.log("Admin login: /admin/login");
}

main().then(() => process.exit(0));
