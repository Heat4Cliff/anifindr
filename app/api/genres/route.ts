import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ success: true, data: genres, meta: null, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, meta: null, error: { code: "DB_ERROR", message: String(err) } }, { status: 500 });
  }
}
