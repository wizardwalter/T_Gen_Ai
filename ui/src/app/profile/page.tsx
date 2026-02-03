import type { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

export const metadata = {
  title: "Profile | StackGenerate",
  description: "Manage your StackGenerate account, connected providers, and subscription status.",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/sign-in?callbackUrl=/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      isSubscriber: true,
      plan: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
      accounts: { select: { provider: true, providerAccountId: true } },
    },
  });

  const nextCharge = user?.currentPeriodEnd
    ? new Date(user.currentPeriodEnd).toISOString().slice(0, 10)
    : "Not scheduled";
  const isSubscriber = user?.isSubscriber ?? false;

  return (
    <div className="min-h-screen text-slate-100">
      <SiteHeader />
      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 pb-16 pt-12">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">Profile</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Your StackGenerate account</h1>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Manage your authentication providers, subscription, and token balance.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Account</h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{user?.name || "Name not set"}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{user?.email || "Email missing"}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Subscription</h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              Status: {isSubscriber ? "Subscriber" : "Free tier"}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Plan: {user?.plan ?? "Not set"}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Next charge date: {isSubscriber ? nextCharge : "Not scheduled"}
            </p>
            <div className="mt-3 flex gap-2">
              {isSubscriber ? (
                <LinkButton href="/api/billing/portal">Manage / cancel</LinkButton>
              ) : (
                <LinkButton href="/subscribe">Upgrade</LinkButton>
              )}
              <LinkButton href="/contact" variant="secondary">
                Get support
              </LinkButton>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Connected providers</h2>
            <LinkButton href="/subscribe">Link another provider</LinkButton>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Google and GitHub SSO are supported. Linking requires starting from this page to keep it secure.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {(user?.accounts || []).length === 0 && <li>No providers linked yet.</li>}
            {user?.accounts.map((acct) => (
              <li key={`${acct.provider}-${acct.providerAccountId}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70">
                <span className="font-semibold capitalize">{acct.provider}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">ID: {acct.providerAccountId}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function LinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const base =
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition";
  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-sky-500 to-violet-500 text-slate-50 shadow-[0_10px_30px_rgba(56,189,248,0.25)] hover:from-sky-400 hover:to-violet-400"
      : "border border-slate-300 bg-white/80 text-slate-800 shadow-sm hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500";

  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}
