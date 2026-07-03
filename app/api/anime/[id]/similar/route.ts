import { NextRequest, NextResponse } from "next/server";
import { getSimilarAnime } from "@/lib/search/tfidf";
import { applyHybridRanking } from "@/lib/ranking/hybrid";

function apiResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data, meta: null, error: null }, { status });
}
function apiError(code: string, message: string, status = 400) {
  return NextResponse.json({ success: false, data: null, meta: null, error: { code, message } }, { status });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const limit = Math.min(12, parseInt(req.nextUrl.searchParams.get("limit") ?? "12"));
    const similar = await getSimilarAnime(id, limit + 2);
    const ranked = applyHybridRanking(similar).slice(0, limit);
    return apiResponse(ranked);
  } catch (err) {
    console.error("[GET /api/anime/:id/similar]", err);
    return apiError("INTERNAL_ERROR", "Gagal mengambil rekomendasi", 500);
  }
}
