import Link from "next/link";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { COMPOSER_EXAMPLE_PRESETS, EXAMPLE_CATEGORY_META, pathForCategory } from "./presets";

export const metadata = {
  title: "Examples | StackGenerate",
  description:
    "Browse best-practice AWS architecture examples, then export them into the Terraform generator to customize and ship.",
};

export default function ExamplesPage() {
  return (
    <div className="min-h-screen text-slate-100">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-16 pt-12">
        <section className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Examples</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Start From Proven Architectures</h1>
          <p className="mx-auto max-w-3xl text-base text-slate-300">
            Pick a best-practice diagram, inspect the pattern, then export it to the generator and customize it for your workload.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {EXAMPLE_CATEGORY_META.map((category) => (
            <Link
              key={category.slug}
              href={pathForCategory(category.slug)}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-sky-500/60"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Category</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-100">{category.label}</h2>
              <p className="mt-2 text-sm text-slate-300">{category.description}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.16em] text-sky-300">Open examples</p>
            </Link>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Featured</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {COMPOSER_EXAMPLE_PRESETS.slice(0, 4).map((example) => (
              <article key={example.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{example.category}</p>
                <h3 className="mt-1 text-base font-semibold text-slate-100">{example.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{example.description}</p>
                <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-300">
                  {example.diagram.map((line) => (
                    <p key={line}>- {line}</p>
                  ))}
                </div>
                <Link
                  href={`/generate-terraform?example=${example.id}`}
                  className="mt-4 inline-flex rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                >
                  Export To Generator
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
