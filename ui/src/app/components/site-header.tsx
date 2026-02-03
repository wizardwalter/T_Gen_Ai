"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/faq", label: "FAQ" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/contact", label: "Contact" },
  { href: "/subscribe", label: "Subscribe" },
];

export function SiteHeader() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-slate-100">
        <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
          <Image
            src="/tgenai_logo.png"
            alt="StackGenerate logo"
            width={60}
            height={60}
            className="drop-shadow-[0_0_35px_rgba(125,211,252,0.35)]"
            priority
          />
          <div className="leading-tight">
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
              Terraform Diagrammer
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              StackGenerate
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-3 text-sm text-slate-100 sm:flex">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-100 shadow-sm transition hover:border-sky-500/70 hover:text-sky-200 hover:shadow-[0_10px_20px_rgba(14,165,233,0.15)]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {session?.user ? (
              <>
                <Link
                  href="/upload"
                  className="rounded-full border border-slate-800 bg-slate-900/90 px-4 py-2 text-sm font-semibold text-slate-100 shadow-sm transition hover:border-sky-500/70 hover:text-sky-200 hover:shadow-[0_10px_20px_rgba(14,165,233,0.15)]"
                >
                  Upload
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  className="rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm text-slate-800 shadow-sm hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-sm font-semibold text-slate-50 shadow-[0_10px_30px_rgba(56,189,248,0.25)] transition hover:from-sky-400 hover:to-violet-400"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
