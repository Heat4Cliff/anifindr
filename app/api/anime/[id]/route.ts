import { NextRequest, NextResponse } from "next/server";
import { getAnimeById } from "@/lib/search/tfidf";

function apiResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data, meta: null, error: null }, { status });
}
function apiError(code: string, message: string, status = 400) {
  return NextResponse.json({ success: false, data: null, meta: null, error: { code, message } }, { status });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const anime = await getAnimeById(id);
    if (!anime) return apiError("NOT_FOUND", "Anime tidak ditemukan", 404);
    return apiResponse(anime);
  } catch (err) {
    console.error("[GET /api/anime/:id]", err);
    return apiError("INTERNAL_ERROR", "Gagal mengambil detail anime", 500);
  }
}
