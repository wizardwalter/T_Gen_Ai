import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Redirect apex domain to www so NextAuth/session cookies and OAuth callbacks
// use a single canonical host.
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const forwardedProto = (req.headers.get("x-forwarded-proto") || "").toLowerCase();
  const proto = forwardedProto || req.nextUrl.protocol.replace(":", "");
  const isApex =
    host === "stackgenerate.com" || host.startsWith("stackgenerate.com:");

  if (proto && proto !== "https") {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

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
