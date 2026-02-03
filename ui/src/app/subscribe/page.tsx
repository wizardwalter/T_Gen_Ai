"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

export default function SubscribePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSubscriber = session?.user && (session.user as { isSubscriber?: boolean }).isSubscriber === true;
  const plan = (session?.user as { plan?: string | null } | undefined)?.plan ?? "free";

  const startCheckout = async () => {
    try {
      setError(null);
      setLoading(true);
      const resp = await fetch("/api/billing/checkout", { method: "POST" });
      if (!resp.ok) throw new Error("Checkout failed. Please try again.");
      const data = (await resp.json()) as { url?: string };
      if (!data.url) throw new Error("Checkout link missing.");
      window.location.href = data.url;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Great for quick experiments.",
      features: ["Upload Terraform modules", "Basic diagrams", "Google/GitHub SSO"],
      isCurrent: !isSubscriber && plan === "free",
      action: null,
    },
    {
      name: "Pro",
      price: "$4.99/mo",
      description: "Unlimited diagrams and priority parsing.",
      features: ["Unlimited diagrams", "Priority parsing queue", "Profile-based provider linking", "Support"],
      isCurrent: isSubscriber,
      action: startCheckout,
    },
  ];

  return (
    <div className="min-h-screen text-slate-100">
      <SiteHeader />
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 pb-16 pt-12">
        <div className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Subscribe</p>
          <h1 className="text-3xl font-semibold sm:text-4xl text-slate-50">Pick the plan that fits</h1>
          <p className="text-base text-slate-300">
            Default accounts stay on Free. Upgrade to Pro for unlimited diagrams and a smoother queue.
          </p>
          {!session?.user && (
            <p className="text-sm text-amber-200">
              Sign in first to subscribe.{" "}
              <Link href="/auth/sign-in" className="underline hover:text-amber-100">
                Go to sign in
              </Link>
            </p>
          )}
          {error && <p className="text-sm text-rose-300">{error}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((planCard) => (
            <div
              key={planCard.name}
              className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.18)] backdrop-blur"
            >
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold text-slate-50">{planCard.name}</h2>
                <span className="text-xl font-bold text-slate-50">{planCard.price}</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">{planCard.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {planCard.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-[4px] h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {planCard.isCurrent ? (
                <button
                  disabled
                  className="mt-6 inline-flex items-center justify-center rounded-full border border-emerald-400/70 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-200"
                >
                  Current
                </button>
              ) : planCard.action ? (
                <button
                  onClick={planCard.action}
                  disabled={!session?.user || loading}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-sm font-semibold text-slate-50 shadow-[0_10px_30px_rgba(56,189,248,0.25)] transition hover:from-sky-400 hover:to-violet-400 disabled:opacity-60"
                >
                  {loading ? "Redirecting..." : "Subscribe"}
                </button>
              ) : (
                <button
                  disabled
                  className="mt-6 inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-200"
                >
                  Included
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
