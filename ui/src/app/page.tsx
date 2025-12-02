"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Tier = {
  title: string;
  accent: string;
  items: string[];
};

const tiers: Tier[] = [
  {
    title: "Presentation",
    accent: "from-sky-400/60 to-cyan-500/70",
    items: ["Next.js UI", "Edge CDN", "Identity (SAML/Google)"],
  },
  {
    title: "Application",
    accent: "from-indigo-400/60 to-violet-500/70",
    items: ["API Gateway", "Parser Workers", "Observability"],
  },
  {
    title: "Data",
    accent: "from-emerald-400/60 to-teal-500/70",
    items: ["DynamoDB (state)", "Artifact Cache", "Diagrams"],
  },
];

const diagramNodes = [
  { id: "ui", label: "Next.js UI", tier: "presentation" },
  { id: "cdn", label: "Edge CDN", tier: "presentation" },
  { id: "api", label: "API Gateway", tier: "application" },
  { id: "parser", label: "Terraform Parser", tier: "application" },
  { id: "state", label: "DynamoDB State Store", tier: "data" },
  { id: "graph", label: "Diagram Cache", tier: "data" },
];

const diagramEdges = [
  { from: "ui", to: "cdn" },
  { from: "cdn", to: "api" },
  { from: "api", to: "parser" },
  { from: "parser", to: "state" },
  { from: "parser", to: "graph" },
];

const pipeline = [
  { title: "Upload", detail: "Terraform HCL, modules, and state" },
  { title: "Parse", detail: "Normalize modules + providers" },
  { title: "Diagram", detail: "Render a clean three-tier map" },
];

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const idx = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / 1024 ** idx;
  return `${value.toFixed(value >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
};

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
          </div>
        </div>
      </nav>

      <div className="mx-auto flex max-w-6xl gap-5 px-6 pb-16 pt-8">
        <aside
          className={`hidden min-w-[250px] flex-col gap-4 rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.5)] transition-all lg:flex ${
            sidebarOpen ? "opacity-100" : "w-16 min-w-[64px] opacity-90"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              Workspace
            </p>
            <button
              type="button"
              aria-label="Toggle sidebar"
              onClick={() => setSidebarOpen((open) => !open)}
              className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-200 hover:border-slate-500"
            >
              {sidebarOpen ? "Collapse" : "Open"}
            </button>
          </div>

          {sidebarOpen && (
            <>
              <div className="space-y-2 text-sm text-slate-200">
                <p className="font-semibold text-slate-100">Quick links</p>
                <Link className="block rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 hover:border-slate-600" href="#upload">
                  Upload & Parse
                </Link>
                <Link className="block rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 hover:border-slate-600" href="#diagram">
                  Diagram preview
                </Link>
                <Link className="block rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 hover:border-slate-600" href="#saml">
                  Identity & SAML
                </Link>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-sm text-slate-200">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Stack
                </p>
                <p className="mt-1">Next.js + TypeScript</p>
                <p>DynamoDB for state + diagrams</p>
                <p>SAML (Google) for enterprise sign-on</p>
              </div>
            </>
          )}
        </aside>

        <main className="flex-1 space-y-8">
          <header className="space-y-4 rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-slate-700 bg-white/5 px-4 py-2 text-sm text-slate-100 shadow-[0_0_35px_rgba(168,85,247,0.25)]">
                Built for DevOps teams
              </span>
              <span className="rounded-full border border-slate-800 bg-[rgba(125,211,252,0.08)] px-4 py-2 text-sm text-slate-100 shadow-[0_0_30px_rgba(125,211,252,0.35)]">
                Three-tier ready
              </span>
              <span className="rounded-full border border-slate-800 bg-[rgba(16,185,129,0.12)] px-4 py-2 text-sm text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
                DynamoDB state store
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Upload · Parse · Diagram
              </p>
              <h1 className="text-3xl font-semibold leading-tight text-slate-50 sm:text-4xl">
                Land a clean Terraform architecture map without leaving your flow.
              </h1>
              <p className="max-w-3xl text-base text-slate-300">
                Point this UI at your Terraform modules, preview the parsed graph, and share visuals with product, security, and SRE. Identity is wired for SAML (Google) and data lands in DynamoDB for scalable, NoSQL-first storage.
              </p>
            </div>
          </header>

          <section
            id="upload"
            className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]"
          >
            <div className="space-y-6 rounded-3xl border border-slate-800/70 bg-slate-950/70 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.7)]" />
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
                    Upload Terraform
                  </p>
                </div>
                <p className="text-lg font-semibold text-slate-50">
                  Bring your HCL, modules, or a bundle. We parse, enrich, and store the graph in DynamoDB.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {pipeline.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm shadow-inner shadow-slate-900/60"
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        {item.title}
                      </p>
                      <p className="text-slate-100">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      Upload and stage
                    </p>
                    <p className="text-sm text-slate-300">
                      Drag-and-drop or browse to begin the parser pipeline.
                    </p>
                  </div>
                  <label
                    htmlFor="file-input"
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-sm font-semibold text-slate-50 shadow-[0_20px_50px_rgba(56,189,248,0.25)] transition hover:from-sky-400 hover:to-violet-400"
                  >
                    <span className="relative">Select file</span>
                    <input
                      id="file-input"
                      type="file"
                      accept=".tf,.tfvars,.zip"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      onChange={(event) =>
                        setSelectedFile(event.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200">
                    <p className="font-semibold">Drop area</p>
                    <p className="text-slate-400">
                      Drag and drop your Terraform package to kick off parsing, graph hydration, and DynamoDB persistence.
                    </p>
                    {selectedFile ? (
                      <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/5 px-3 py-2 text-emerald-200">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">
                            {selectedFile.name}
                          </span>
                          <span className="text-xs text-emerald-100/70">
                            {formatBytes(selectedFile.size)} · ready to parse
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-400">
                        <span className="text-xs uppercase tracking-[0.2em]">
                          No file selected yet
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-sm font-semibold text-slate-100">
                      Upcoming pipeline steps
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.7)]" />
                      <p className="text-sm text-slate-300">
                        Validate providers, resolve modules, hydrate graph model
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.7)]" />
                      <p className="text-sm text-slate-300">
                        Run AI summarization for architecture notes
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.7)]" />
                      <p className="text-sm text-slate-300">
                        Render an interactive three-tier diagram
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              id="diagram"
              className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/70 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(125,211,252,0.15),transparent_45%)]" />
              <div className="relative space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                      Three-tier preview
                    </p>
                    <h3 className="text-xl font-semibold text-slate-50">
                      AI-generated diagram data
                    </h3>
                  </div>
                  <div className="rounded-full border border-slate-800 bg-slate-950/80 px-3 py-1 text-xs text-slate-200">
                    {diagramNodes.length} nodes · {diagramEdges.length} edges
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {tiers.map((tier) => (
                    <div
                      key={tier.title}
                      className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        {tier.title}
                      </p>
                      <div
                        className={`mt-2 rounded-xl bg-gradient-to-r ${tier.accent} px-3 py-2 text-sm font-semibold text-slate-50`}
                      >
                        Core services
                      </div>
                      <ul className="mt-3 space-y-1.5 text-sm text-slate-200">
                        {tier.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2 text-slate-200"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                    <span>Diagram nodes</span>
                    <span className="rounded-full border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] text-slate-200">
                      Placeholder data until parser is wired
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {diagramNodes.map((node) => (
                      <span
                        key={node.id}
                        className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-sm text-slate-100"
                      >
                        {node.label}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-200 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Flow
                      </p>
                      <p>UI → CDN → API → Parser</p>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Storage
                      </p>
                      <p>DynamoDB for state + Diagram cache</p>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Status
                      </p>
                      <p>Ready for parser hook-up</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            id="saml"
            className="grid gap-4 md:grid-cols-3"
          >
            {[
              {
                title: "Identity",
                body: "SAML with Google as the IdP. Use ACS + EntityID from the API, upload metadata, and enforce domain-bound sign-ins.",
              },
              {
                title: "Data",
                body: "DynamoDB tables: diagram-state, uploads, and sessions for durable, low-latency storage.",
              },
              {
                title: "Delivery",
                body: "Next.js + TypeScript + Tailwind for a crisp design system and fast iteration.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
              >
                <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
                  {card.title}
                </p>
                <p className="mt-2 text-sm text-slate-200">{card.body}</p>
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
