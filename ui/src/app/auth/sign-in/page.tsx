"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-16 pt-12">
        <div className="space-y-2 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Sign in</p>
          <h1 className="text-2xl font-semibold text-slate-50">Welcome back</h1>
          <p className="text-sm text-slate-400">Use Google or your email/password to continue.</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="space-y-3">
            <button
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-700 hover:bg-slate-800"
              onClick={() =>
                signIn("cognito", {
                  callbackUrl: "/",
                  identity_provider: "Google",
                })
              }
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-xs font-semibold">
                G
              </span>
              Continue with Google
            </button>
            <button
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-700 hover:bg-slate-800"
              onClick={() =>
                signIn("cognito", {
                  callbackUrl: "/",
                })
              }
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-xs font-semibold">
                @
              </span>
              Continue with Email & Password
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            Email/password sign-in happens on your Cognito-hosted auth page.
          </p>
          <p className="mt-4 text-center text-sm text-slate-400">
            Need an account?{" "}
            <Link href="/auth/sign-up" className="text-sky-300 underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
