"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type SignUpStep = "details" | "confirm" | "done";

export function SignUpClient() {
  const search = useSearchParams();
  const [step, setStep] = useState<SignUpStep>("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");

  const prefillEmail = useMemo(() => search.get("email") ?? "", [search]);
  const redirectedError = search.get("error");

  const statusMessage =
    redirectedError === "no_account"
      ? `No account found for ${prefillEmail || "that email"}. Use sign up to create one.`
      : redirectedError === "no_email"
        ? "We could not read an email from the provider. Please try a different account."
        : null;

  const handleEmailSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/cognito/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || prefillEmail,
          name: name.trim(),
          password,
          confirmPassword,
        }),
      });

      const payload = (await res.json()) as { error?: string; email?: string };
      if (!res.ok) {
        setError(payload.error ?? "Could not create your account.");
        return;
      }

      setEmail(payload.email ?? email.trim());
      setStep("confirm");
      setMessage("Account created. Enter the verification code sent to your email.");
    } catch {
      setError("Could not create your account.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/cognito/confirm-sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: confirmationCode.trim(),
        }),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(payload.error ?? "Could not verify your account.");
        return;
      }

      setStep("done");
      setMessage("Email verified. Continue to sign in.");
    } catch {
      setError("Could not verify your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-16 pt-12">
        <div className="space-y-2 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Sign up</p>
          <h1 className="text-2xl font-semibold text-slate-50">Create your workspace</h1>
          <p className="text-sm text-slate-400">Use Google or create an email/password account.</p>
          {statusMessage && <p className="text-xs text-amber-200/90">{statusMessage}</p>}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
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

          <div className="my-5 border-t border-slate-800 pt-5">
            {step === "details" && (
              <form className="space-y-3" onSubmit={handleEmailSignUp}>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Full name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-400/40 transition focus:ring-2"
                />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={email || prefillEmail}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-400/40 transition focus:ring-2"
                  required
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-400/40 transition focus:ring-2"
                  required
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-400/40 transition focus:ring-sky-400/40 focus:ring-2"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Creating account..." : "Create account with email"}
                </button>
              </form>
            )}
            {step === "confirm" && (
              <form className="space-y-3" onSubmit={handleConfirm}>
                <p className="text-xs text-slate-400">
                  We sent a verification code to <span className="font-medium text-slate-200">{email}</span>.
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Verification code"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-400/40 transition focus:ring-2"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Verifying..." : "Verify email"}
                </button>
              </form>
            )}
            {step === "done" && (
              <button
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                onClick={() => signIn("cognito", { callbackUrl: "/" })}
              >
                Continue to sign in
              </button>
            )}
          </div>
          {message && <p className="mt-3 text-sm text-emerald-200/90">{message}</p>}
          {error && <p className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">{error}</p>}
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
