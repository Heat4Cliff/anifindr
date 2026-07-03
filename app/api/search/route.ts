import { NextRequest, NextResponse } from "next/server";
import { searchAnime } from "@/lib/search/tfidf";
import { applyHybridRanking } from "@/lib/ranking/hybrid";
import prisma from "@/lib/db/prisma";

function apiResponse<T>(data: T, meta?: object, status = 200) {
  return NextResponse.json({ success: true, data, meta: meta ?? null, error: null }, { status });
}
function apiError(code: string, message: string, status = 400) {
  return NextResponse.json({ success: false, data: null, meta: null, error: { code, message } }, { status });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") ?? "";
  const mode = (searchParams.get("mode") ?? "hybrid") as "tfidf" | "hybrid";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

  if (!q.trim()) {
    return apiError("INVALID_QUERY", "Query tidak boleh kosong");
  }

  try {
    const result = await searchAnime({ q, page, limit, mode });

    // Log query
    await prisma.searchQuery.create({
      data: { queryText: q, searchMode: mode === "hybrid" ? "HYBRID" : "TFIDF", resultsCount: result.total },
    }).catch(() => {}); // non-blocking

    let results = result.results;
    if (mode === "hybrid") {
      results = applyHybridRanking(results);
    }

    return apiResponse(results, {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      mode,
    });
  } catch (err) {
    console.error("[GET /api/search]", err);
    return apiError("INTERNAL_ERROR", "Pencarian gagal", 500);
  }
}
