"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/examples", label: "Examples" },
  { href: "/faq", label: "FAQ" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="relative z-[120] border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-slate-100">
        <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
          <Image
            src="/logo-v2.png"
            alt="StackGenerate logo"
            width={84}
            height={84}
            className="drop-shadow-[0_0_35px_rgba(125,211,252,0.35)]"
            priority
          />
          <div className="leading-tight">
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
              Terraform Diagrammer
            </p>
            <p className="text-xl font-semibold text-slate-900 dark:text-slate-50">
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
                className="rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:border-sky-500/70 hover:text-white hover:shadow-[0_10px_20px_rgba(14,165,233,0.15)]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/create"
              className="rounded-full border border-slate-800 bg-slate-900/90 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:border-sky-500/70 hover:text-white hover:shadow-[0_10px_20px_rgba(14,165,233,0.15)]"
            >
              Create
            </Link>
            {!session?.user && (
              <>
                <Link
                  href="/auth/sign-in"
                  className="rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm text-white shadow-sm hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-500"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(56,189,248,0.25)] transition hover:from-sky-400 hover:to-violet-400"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          <div className="relative sm:hidden">
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-site-menu"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-slate-900/90 text-white shadow-sm transition hover:border-sky-500/70 hover:shadow-[0_10px_20px_rgba(14,165,233,0.15)]"
            >
              <span className="sr-only">{mobileMenuOpen ? "Close menu" : "Open menu"}</span>
              <span className="flex flex-col gap-1.5">
                <span className="block h-0.5 w-5 rounded-full bg-white" />
                <span className="block h-0.5 w-5 rounded-full bg-white" />
                <span className="block h-0.5 w-5 rounded-full bg-white" />
              </span>
            </button>

            {mobileMenuOpen && (
              <div
                id="mobile-site-menu"
                className="absolute right-0 top-[calc(100%+0.75rem)] z-[130] w-64 rounded-3xl border border-slate-800 bg-slate-950/98 p-3 shadow-[0_18px_40px_rgba(2,6,23,0.65)]"
              >
                <div className="flex flex-col gap-2">
                  {navLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-white transition hover:border-sky-500/70 hover:shadow-[0_10px_20px_rgba(14,165,233,0.15)]"
                    >
                      {item.label}
                    </Link>
                  ))}

                  <div className="my-1 h-px bg-slate-800" />

                  <Link
                    href="/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:border-sky-500/70 hover:shadow-[0_10px_20px_rgba(14,165,233,0.15)]"
                  >
                    Create
                  </Link>

                  {!session?.user && (
                    <>
                      <Link
                        href="/auth/sign-in"
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:border-slate-500"
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/auth/sign-up"
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(56,189,248,0.25)] transition hover:from-sky-400 hover:to-violet-400"
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
