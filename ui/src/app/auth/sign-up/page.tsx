"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

async function startSignup(provider: "google" | "github", onError: (msg: string) => void) {
  try {
    const res = await fetch("/api/auth/signup-intent", { method: "POST" });
    if (!res.ok) {
      onError("Could not start signup. Please try again.");
      return;
    }
    await signIn(provider, { callbackUrl: "/" });
  } catch (err) {
    onError("Something went wrong. Please try again.");
  }
}

export default function SignUp() {
  const search = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);

  const prefillEmail = useMemo(() => search.get("email") ?? "", [search]);
  const redirectedError = search.get("error");

  const statusMessage =
    redirectedError === "no_account"
      ? `No account found for ${prefillEmail || "that email"}. Use sign up to create one.`
      : redirectedError === "no_email"
        ? "We could not read an email from the provider. Please try a different account."
        : null;

  const handleStart = async (provider: "google" | "github") => {
    setError(null);
    setLoadingProvider(provider);
    await startSignup(provider, setError);
    setLoadingProvider(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-16 pt-12">
        <div className="space-y-2 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Sign up</p>
          <h1 className="text-2xl font-semibold text-slate-50">Create your workspace</h1>
          <p className="text-sm text-slate-400">Start with SSO - no passwords needed.</p>
          {statusMessage && (
            <p className="text-xs text-amber-200/90">{statusMessage}</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <button
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-3 text-sm font-semibold text-slate-50 shadow-[0_15px_40px_rgba(56,189,248,0.25)] transition hover:from-sky-400 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-70"
            onClick={() => handleStart("google")}
            disabled={loadingProvider !== null}
          >
            {loadingProvider === "google" ? "Redirecting..." : "Continue with Google"}
          </button>
          <button
            className="mt-3 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-700 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            onClick={() => handleStart("github")}
            disabled={loadingProvider !== null}
          >
            {loadingProvider === "github" ? "Redirecting..." : "Continue with GitHub"}
          </button>
          {error && (
            <p className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
              {error}
            </p>
          )}
          <p className="mt-4 text-center text-sm text-slate-400">
            Already onboarded?{" "}
            <Link href="/auth/sign-in" className="text-sky-300 underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
