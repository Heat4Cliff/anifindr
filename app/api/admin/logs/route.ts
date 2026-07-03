import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ success: true, data: logs, meta: { count: logs.length }, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, meta: null, error: { code: "DB_ERROR", message: String(err) } }, { status: 500 });
  }
}
