import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    const jobs = await prisma.ingestionJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ success: true, data: jobs, meta: { count: jobs.length }, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, meta: null, error: { code: "DB_ERROR", message: String(err) } }, { status: 500 });
  }
}
