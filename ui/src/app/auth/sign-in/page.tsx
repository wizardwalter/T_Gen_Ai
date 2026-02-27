"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";

type Provider = "Google" | "Facebook" | "SignInWithApple";

const providers: { id: Provider; label: string }[] = [
  { id: "Google", label: "Continue with Google" },
  { id: "SignInWithApple", label: "Continue with Apple" },
  { id: "Facebook", label: "Continue with Facebook" },
];

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
          <div className="space-y-3">
            {providers.map((provider) => (
              <button
                key={provider.id}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-700 hover:bg-slate-800"
                onClick={() =>
                  signIn("cognito", {
                    callbackUrl: "/",
                    identity_provider: provider.id,
                  })
                }
              >
                <ProviderIcon id={provider.id} />
                {provider.label}
              </button>
            ))}
          </div>
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

function ProviderIcon({ id }: { id: Provider }) {
  if (id === "Google") {
    return (
      <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
        <path
          fill="#FFC107"
          d="M43.6 20.1H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.3 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.7 16.3 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.3 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.1 0 9.8-2 13.3-5.2l-6.1-5.2C29.2 35.7 26.7 36 24 36c-5.2 0-9.6-3.3-11.2-7.9l-6.6 5.1C9.5 39.7 16.2 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.1H42V20H24v8h11.3c-1 2.8-3 5.1-5.7 6.6l.1.1 6.1 5.2C34.5 41.2 44 36 44 24c0-1.3-.1-2.7-.4-3.9z"
        />
      </svg>
    );
  }

  if (id === "Facebook") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path
          fill="#1877F2"
          d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1c0 6.1 4.4 11.1 10.1 11.9v-8.4H7.1v-3.5h3V9.5c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.3h3.4l-.5 3.5h-2.9V24C19.6 23.2 24 18.2 24 12.1z"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#FFFFFF"
        d="M16.6 13.1c0-1.2.6-2.3 1.5-3.1-1-.1-2.2.6-2.8.6-.6 0-1.5-.6-2.4-.6-1.2 0-2.4.7-3.1 1.8-1.3 2.2-.3 5.5.9 7.3.6.9 1.3 1.9 2.3 1.9.9 0 1.2-.6 2.3-.6 1.1 0 1.3.6 2.3.6 1 0 1.7-1 2.3-1.9.7-1 1-2.1 1-2.1-.1 0-2.3-.9-2.3-3.9z"
      />
      <path
        fill="#FFFFFF"
        d="M15.6 4.6c.5-.6.9-1.5.8-2.3-.8.1-1.7.6-2.3 1.2-.5.6-.9 1.5-.8 2.3.9.1 1.8-.4 2.3-1.2z"
      />
    </svg>
  );
}
