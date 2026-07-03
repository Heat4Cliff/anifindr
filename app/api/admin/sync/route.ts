import { NextRequest, NextResponse } from "next/server";
import { runIngestionPipeline } from "@/lib/ingestion/pipeline";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const source = body.source ?? "top";
    const maxPages = Math.min(10, body.maxPages ?? 4);

    if (!["top", "seasonal", "current"].includes(source)) {
      return NextResponse.json({ success: false, data: null, meta: null, error: { code: "INVALID_SOURCE", message: "source harus top, seasonal, atau current" } }, { status: 400 });
    }

    // Run pipeline in background (non-blocking for response)
    const result = await runIngestionPipeline(source, maxPages);

    return NextResponse.json({ success: result.success, data: result, meta: null, error: result.success ? null : { code: "PIPELINE_FAILED", message: "Pipeline gagal" } });
  } catch (err) {
    console.error("[POST /api/admin/sync]", err);
    return NextResponse.json({ success: false, data: null, meta: null, error: { code: "INTERNAL_ERROR", message: String(err) } }, { status: 500 });
  }
}
