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
          <p className="text-sm text-slate-400">Use SSO to continue.</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <button
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-3 text-sm font-semibold text-slate-50 shadow-[0_15px_40px_rgba(56,189,248,0.25)] transition hover:from-sky-400 hover:to-violet-400"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            Continue with Google
          </button>
          <button
            className="mt-3 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-700 hover:bg-slate-800"
            onClick={() => signIn("github", { callbackUrl: "/" })}
          >
            Continue with GitHub
          </button>
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
