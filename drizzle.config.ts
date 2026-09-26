import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// ponytail: drizzle-kit is a standalone CLI — Next.js's .env.local
// autoload doesn't apply here, so load it explicitly.
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
