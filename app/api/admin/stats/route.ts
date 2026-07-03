import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    const [anime, genres, studios, queries] = await Promise.all([
      prisma.anime.count(),
      prisma.genre.count(),
      prisma.studio.count(),
      prisma.searchQuery.count(),
    ]);
    return NextResponse.json({ success: true, data: { anime, genres, studios, queries }, meta: null, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, meta: null, error: { code: "DB_ERROR", message: String(err) } }, { status: 500 });
  }
}
