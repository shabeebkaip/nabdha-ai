// Auth.js v5 — Credentials provider, JWT sessions, no adapter (see
// src/db/schema.ts comment: adapter tables aren't needed without OAuth/DB
// sessions). Registration lives in src/app/api/auth/register/route.ts since
// Auth.js itself has no signup flow.
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/db";
import { users, companies } from "@/db/schema";
import { eq } from "drizzle-orm";

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Trust the deployment host (Vercel sets it) so Auth.js derives its own URL
  // from the request — no NEXTAUTH_URL/AUTH_URL env var required anywhere.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: "user" | "admin" }).role;
        const [company] = await db
          .select({ id: companies.id })
          .from(companies)
          .where(eq(companies.ownerUserId, user.id!));
        token.companyId = company?.id ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as "user" | "admin";
        session.user.companyId = token.companyId as string | null;
      }
      return session;
    },
  },
});
