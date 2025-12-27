import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Redirect apex domain to www so NextAuth/session cookies and OAuth callbacks
// use a single canonical host.
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const isApex =
    host === "stackgenerate.com" || host.startsWith("stackgenerate.com:");

  if (isApex) {
    const url = req.nextUrl.clone();
    url.host = "www.stackgenerate.com";
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
