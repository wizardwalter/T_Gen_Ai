import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

export const metadata: Metadata = {
  title: "Terraform Vs Manual Diagrams | StackGenerate",
  description:
    "Compare Terraform-generated architecture diagrams with manual diagramming workflows for speed, accuracy, and maintenance.",
  alternates: {
    canonical: "https://www.stackgenerate.com/terraform-vs-manual-diagrams",
  },
};

export default function TerraformVsManualDiagramsPage() {
  return (
    <div className="min-h-screen text-slate-100">
      <SiteHeader />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 pb-16 pt-12">
        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Comparison</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Terraform Vs Manual Diagrams</h1>
          <p className="text-sm text-slate-300">
            Manual tools are great for brainstorming. Terraform-driven diagrams are better for staying current as infrastructure changes.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold text-slate-100">Terraform-driven</h2>
            <ul className="mt-3 space-y-1 text-sm text-slate-300">
              <li>- Reflects real infrastructure code</li>
              <li>- Faster updates after each change</li>
              <li>- Better for ongoing architecture documentation</li>
              <li>- Easier to review drift and dependency changes</li>
            </ul>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold text-slate-100">Manual diagramming</h2>
            <ul className="mt-3 space-y-1 text-sm text-slate-300">
              <li>- Flexible for workshops and early ideation</li>
              <li>- High effort to keep updated</li>
              <li>- Often drifts from deployed reality</li>
              <li>- Harder to scale across many environments</li>
            </ul>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Recommendation</h2>
          <p className="mt-2 text-sm text-slate-300">
            Use manual diagrams for discovery sessions, then shift to Terraform-based generated diagrams as the system stabilizes. This keeps architecture communication accurate without repetitive manual rework.
          </p>
        </section>

        <div className="flex gap-3">
          <Link href="/upload" className="rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white">
            Try with Terraform
          </Link>
          <Link href="/iac-visualizer-vs-static-docs" className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-white">
            Next comparison
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

