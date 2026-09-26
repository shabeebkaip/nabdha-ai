import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// ponytail: neon-http (not the ws Pool) — fine for request/response route
// handlers and server actions on Vercel Fluid Compute; switch to
// drizzle-orm/neon-serverless (Pool) only if we need interactive
// transactions across multiple queries.
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
