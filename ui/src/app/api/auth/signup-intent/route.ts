import { NextResponse } from "next/server";

const SIGNUP_COOKIE = "signup_intent";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: SIGNUP_COOKIE,
    value: "true",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 10 * 60, // 10 minutes
    path: "/",
  });
  return res;
}
