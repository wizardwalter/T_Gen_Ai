import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

export const metadata: Metadata = {
  title: "IaC Visualizer Vs Static Docs | StackGenerate",
  description:
    "See how IaC visualizers compare to static documentation for onboarding, change reviews, and architecture accuracy.",
  alternates: {
    canonical: "https://www.stackgenerate.com/iac-visualizer-vs-static-docs",
  },
};

export default function IacVisualizerVsStaticDocsPage() {
  return (
    <div className="min-h-screen text-slate-100">
      <SiteHeader />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 pb-16 pt-12">
        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Comparison</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">IaC Visualizer Vs Static Docs</h1>
          <p className="text-sm text-slate-300">
            Static docs are useful snapshots. IaC visualizers are better for continuous architecture awareness as systems evolve.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Where static docs win</h2>
          <ul className="mt-3 space-y-1 text-sm text-slate-300">
            <li>- Long-form architecture decisions and rationale</li>
            <li>- Compliance narratives and audit summaries</li>
            <li>- Team conventions and process standards</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Where IaC visualization wins</h2>
          <ul className="mt-3 space-y-1 text-sm text-slate-300">
            <li>- Faster onboarding to active cloud topology</li>
            <li>- Immediate visibility into changed resources</li>
            <li>- Better confidence during release and incident reviews</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Recommendation</h2>
          <p className="mt-2 text-sm text-slate-300">
            Keep both. Use static docs for policy and context, and use generated IaC visuals for current-state architecture truth.
          </p>
        </section>

        <div className="flex gap-3">
          <Link href="/upload" className="rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white">
            Visualize my IaC
          </Link>
          <Link href="/ai-devops-tools-vs-traditional-workflows" className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-white">
            Next comparison
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

