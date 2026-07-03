import { NextRequest, NextResponse } from "next/server";
import { searchAnime } from "@/lib/search/tfidf";

function apiResponse<T>(data: T, meta?: object, status = 200) {
  return NextResponse.json({ success: true, data, meta: meta ?? null, error: null }, { status });
}

function apiError(code: string, message: string, status = 400) {
  return NextResponse.json(
    { success: false, data: null, meta: null, error: { code, message } },
    { status }
  );
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const q = searchParams.get("q") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
    const genre = searchParams.getAll("genre");
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
    const status = searchParams.get("status") ?? undefined;
    const season = searchParams.get("season") ?? undefined;
    const minScore = searchParams.get("minScore") ? parseFloat(searchParams.get("minScore")!) : undefined;
    const sort = (searchParams.get("sort") as "score" | "rank" | "popularity" | "year" | "title") ?? "score";
    const type = searchParams.get("type") ?? undefined;

    const result = await searchAnime({
      q,
      filters: { genre, year, status, season, minScore, type },
      page,
      limit,
      sort,
      mode: "tfidf",
    });

    return apiResponse(result.results, {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      limit,
    });
  } catch (err) {
    console.error("[GET /api/anime]", err);
    return apiError("INTERNAL_ERROR", "Gagal mengambil data anime", 500);
  }
}
