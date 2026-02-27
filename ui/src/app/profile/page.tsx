import type { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

export const metadata = {
  title: "Profile | StackGenerate",
  description: "Manage your StackGenerate account and connected providers.",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/sign-in?callbackUrl=/profile");
  }

  return (
    <div className="min-h-screen text-slate-100">
      <SiteHeader />
      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 pb-16 pt-12">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">Profile</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Your StackGenerate account</h1>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Manage your authentication providers.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Account</h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{session.user?.name || "Name not set"}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{session.user?.email || "Email missing"}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Connected providers</h2>
            <LinkButton href="/contact">Manage account</LinkButton>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Authentication is managed through Cognito. Use your account settings in the hosted login page to manage providers.
          </p>
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
      ? "bg-gradient-to-r from-sky-500 to-violet-500 text-white shadow-[0_10px_30px_rgba(56,189,248,0.25)] hover:from-sky-400 hover:to-violet-400"
      : "border border-slate-300 bg-white/80 text-white shadow-sm hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-500";

  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}
