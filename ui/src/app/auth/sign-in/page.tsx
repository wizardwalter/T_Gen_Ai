"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-16 pt-12">
        <div className="space-y-2 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
            Sign in
          </p>
          <h1 className="text-2xl font-semibold text-slate-50">
            Welcome back
          </h1>
          <p className="text-sm text-slate-400">
            Sign in with Google SSO or use email for quick access.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <button
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-3 text-sm font-semibold text-slate-50 shadow-[0_15px_40px_rgba(56,189,248,0.25)] transition hover:from-sky-400 hover:to-violet-400"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            Continue with Google (SSO)
          </button>
          <div className="my-4 text-center text-xs uppercase tracking-[0.3em] text-slate-500">
            Or
          </div>
          <form className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Email
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-slate-600"
            >
              Sign in
            </button>
          </form>
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
