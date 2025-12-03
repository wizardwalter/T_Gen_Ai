"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const codeLines = [
  'module "network" {',
  '  source = "./modules/vpc"',
  '  cidr_block = "10.0.0.0/16"',
  "}",
  "",
  "resource \"aws_instance\" \"app\" {",
  '  ami           = var.app_ami',
  '  instance_type = "t3.micro"',
  "}",
];

const diagramNodes = [
  { label: "UI", accent: "from-sky-400/70 to-cyan-500/60" },
  { label: "API", accent: "from-indigo-400/70 to-violet-500/60" },
  { label: "Parser", accent: "from-amber-400/70 to-orange-500/60" },
  { label: "DynamoDB", accent: "from-emerald-400/70 to-teal-500/60" },
  { label: "Cache", accent: "from-pink-400/70 to-rose-500/60" },
];

export default function Home() {
  const { data: session } = useSession();
  const ctaHref = session ? "/upload" : "/auth/sign-in";

  return (
    <div className="min-h-screen text-slate-100">
      <nav className="border-b border-slate-800/70 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="DevOps AI logo"
              width={42}
              height={42}
              className="drop-shadow-[0_0_35px_rgba(125,211,252,0.35)]"
              priority
            />
            <div className="leading-tight">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                Terraform Diagrammer
              </p>
              <p className="text-lg font-semibold text-slate-50">
                AI Ops Design Studio
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {session?.user ? (
              <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-sm text-slate-100">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs text-slate-200">
                  👤
                </span>
                <span className="max-w-[140px] truncate">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="ml-2 rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-slate-500"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 hover:border-slate-500"
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
      </nav>

      <main className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 pb-20 pt-12 text-center">
        <div className="space-y-4">
          <span className="inline-flex rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">
            Read code · Render architecture
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-slate-50 sm:text-5xl">
            Upload Terraform. Get a living architecture diagram.
          </h1>
          <p className="max-w-3xl text-base text-slate-300 mx-auto">
            We parse your IaC, understand resources and relationships, and sketch a clean system view.
            No manual draw.io. Just code → diagram.
          </p>
        </div>

        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/70 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.5)] backdrop-blur">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(125,211,252,0.12),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.12),transparent_40%)]" />
            <div className="relative space-y-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Terraform input
              </p>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-left shadow-inner shadow-slate-900/60">
                <div className="flex gap-2 text-[11px] uppercase tracking-[0.25em] text-slate-500">
                  <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-emerald-100">
                    code
                  </span>
                  <span className="rounded-full bg-sky-400/15 px-2 py-1 text-sky-100">
                    hcl
                  </span>
                </div>
                <div className="mt-3 space-y-1 font-mono text-sm text-slate-200">
                  {codeLines.map((line, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 animate-code-flicker"
                      style={{ animationDelay: `${idx * 120}ms` }}
                    >
                      <span className="w-6 text-right text-xs text-slate-500">
                        {idx + 1}
                      </span>
                      <span className="flex-1 whitespace-pre">
                        {line || "\u00A0"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/70 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.5)] backdrop-blur">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(125,211,252,0.15),transparent_45%)]" />
            <div className="relative space-y-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Diagram output
              </p>
              <div className="grid grid-cols-2 gap-3">
                {diagramNodes.map((node, idx) => (
                  <div
                    key={node.label}
                    className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-inner shadow-slate-900/50"
                  >
                    <div
                      className={`absolute inset-0 opacity-60 blur-3xl bg-gradient-to-r ${node.accent}`}
                      style={{ animation: `floatY 6s ease-in-out infinite`, animationDelay: `${idx * 180}ms` }}
                    />
                    <div className="relative flex items-center justify-between text-slate-100">
                      <span className="text-sm font-semibold">{node.label}</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                    </div>
                    <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`absolute inset-y-0 left-0 w-2/3 rounded-full bg-gradient-to-r ${node.accent} animate-flow-line`}
                        style={{ animationDelay: `${idx * 150}ms` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-left text-sm text-slate-300">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  How it works
                </p>
                <ul className="mt-2 space-y-1.5">
                  <li>• Parse Terraform modules and resources</li>
                  <li>• Detect relationships, networks, and state</li>
                  <li>• Sketch a clean diagram with minimal noise</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-3 text-sm font-semibold text-slate-50 shadow-[0_20px_60px_rgba(56,189,248,0.25)] transition hover:from-sky-400 hover:to-violet-400"
          >
            Start now
          </Link>
          <p className="text-sm text-slate-400">
            {session ? "Authenticated with Google — ready to upload." : "Sign in with Google to start uploading your Terraform."}
          </p>
        </div>
      </main>
    </div>
  );
}
