import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const adminSession = req.cookies.get("admin_session");

  // If user is accessing protected routes without session
  if (!adminSession?.value) {
    // If it's an API route, return 401 JSON
    if (req.nextUrl.pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // If it's a page route, redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
