import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { datasets } from "@/db/schema";
import { requireCompanySession } from "@/lib/session";
import { apiError, errorToResponse } from "@/lib/api-response";

export const runtime = "nodejs";

// ponytail: Blob upload is structurally stubbed — this route only records
// dataset metadata. If the frontend already uploaded to Vercel Blob
// client-side it passes `fileBlobUrl`; this backend never calls the Blob
// API itself, so it works identically whether BLOB_READ_WRITE_TOKEN is set
// or not.
//
// `metrics` (optional) carries REAL aggregate numbers the browser computed
// from the file's actual content (src/lib/dataset-parse.ts — CSV/Excel are
// parsed client-side since the file's bytes never reach this server). When
// present, the AI engine grounds analysis on these real numbers instead of
// a filename-derived heuristic (src/lib/ai/scenario.ts).
const metricsSchema = z.object({
  rows: z.number().int().min(0),
  revenue: z.number().finite().optional(),
  orders: z.number().int().min(0).optional(),
  customers: z.number().int().min(0).optional(),
  avgOrderValue: z.number().finite().optional(),
  revenueGrowthPct: z.number().finite().optional(),
  retentionPct: z.number().min(0).max(100).optional(),
  months: z.number().int().min(0).optional(),
});

const createDatasetSchema = z.object({
  sourceType: z.enum(["demo", "excel", "csv", "pdf", "manual"]),
  fileName: z.string().max(300).optional(),
  fileBlobUrl: z.url().optional(),
  metrics: metricsSchema.optional(),
});

export async function POST(req: Request) {
  try {
    const { companyId } = await requireCompanySession();
    const body = await req.json().catch(() => null);
    const parsed = createDatasetSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(400, "VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as never);
    }

    // One demo dataset per company — "Use Demo Data" is a single, repeatable
    // shortcut, not a way to spam identical "Nabda Retail Demo" cards onto My
    // Data. Reuse the existing row (the caller then re-runs analysis on it
    // via /app/processing, same as any other dataset) instead of inserting
    // a duplicate.
    if (parsed.data.sourceType === "demo") {
      const [existing] = await db
        .select()
        .from(datasets)
        .where(and(eq(datasets.companyId, companyId), eq(datasets.sourceType, "demo")));
      if (existing) return NextResponse.json(existing, { status: 200 });
    }

    const rowSummary =
      parsed.data.fileName || parsed.data.metrics
        ? { fileName: parsed.data.fileName, ...parsed.data.metrics }
        : undefined;

    const [dataset] = await db
      .insert(datasets)
      .values({
        companyId,
        sourceType: parsed.data.sourceType,
        fileBlobUrl: parsed.data.fileBlobUrl,
        status: "uploaded",
        rowSummary,
      })
      .returning();

    return NextResponse.json(dataset, { status: 201 });
  } catch (err) {
    return errorToResponse("datasets:POST", err);
  }
}
