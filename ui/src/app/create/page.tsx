import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

export const metadata = {
  title: "Create | StackGenerate",
  description: "Choose how you want to build: generate Terraform from scratch or diagram existing Terraform.",
};

export default function CreatePage() {
  return (
    <div className="min-h-screen text-slate-100">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-16 pt-12">
        <section className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Create Mode</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Choose Your Workflow</h1>
          <p className="mx-auto max-w-3xl text-base text-slate-300">
            Start from a blank canvas to generate Terraform, or diagram an existing Terraform folder.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <Link
            href="/generate-terraform"
            className="create-card create-card-blue group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-6 transition"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.2),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(96,165,250,0.2),transparent_45%)] opacity-80" />
            <div className="create-card-inner relative z-10">
              <p className="text-xs uppercase tracking-[0.22em] text-sky-300">Build New</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-50">Generate Terraform</h2>
              <p className="mt-2 text-sm text-slate-300">
                Drag and drop AWS resources, configure each one, and generate Terraform files.
              </p>
              <span className="mt-5 inline-flex rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-100">
                Open Composer
              </span>
            </div>
          </Link>

          <Link
            href="/upload"
            className="create-card create-card-green group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-6 transition"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(74,222,128,0.2),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(16,185,129,0.2),transparent_45%)] opacity-80" />
            <div className="create-card-inner relative z-10">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">Analyze Existing</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-50">Diagram Your Terraform</h2>
              <p className="mt-2 text-sm text-slate-300">
                Upload your Terraform folder and get a clean architecture diagram instantly.
              </p>
              <span className="mt-5 inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                Upload Folder
              </span>
            </div>
          </Link>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Need a starting point?</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-100">Browse Architecture Examples</h2>
          <p className="mt-2 text-sm text-slate-300">
            Explore cost-focused, highly available, and security-first patterns, then export them to the generator.
          </p>
          <Link
            href="/examples"
            className="mt-4 inline-flex rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:border-sky-500/70"
          >
            Open Examples
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
