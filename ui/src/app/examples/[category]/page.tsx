import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import {
  COMPOSER_EXAMPLE_PRESETS,
  EXAMPLE_CATEGORY_META,
  pathForCategory,
  type ExampleCategory,
} from "../presets";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  return EXAMPLE_CATEGORY_META.map((category) => ({ category: category.slug }));
}

export default async function ExamplesCategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryMeta = EXAMPLE_CATEGORY_META.find((item) => item.slug === category);

  if (!categoryMeta) {
    notFound();
  }

  const items = COMPOSER_EXAMPLE_PRESETS.filter((preset) => preset.category === (category as ExampleCategory));

  return (
    <div className="min-h-screen text-slate-100">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-16 pt-12">
        <section className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Examples</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">{categoryMeta.label}</h1>
          <p className="mx-auto max-w-3xl text-base text-slate-300">{categoryMeta.description}</p>
          <div className="flex justify-center gap-2">
            {EXAMPLE_CATEGORY_META.map((item) => (
              <Link
                key={item.slug}
                href={pathForCategory(item.slug)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                  item.slug === category
                    ? "border-sky-500/60 bg-sky-500/10 text-sky-100"
                    : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {items.map((example) => (
            <article key={example.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-xl font-semibold text-slate-100">{example.title}</h2>
              <p className="mt-2 text-sm text-slate-300">{example.description}</p>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Example Diagram</p>
                <div className="mt-3 space-y-2">
                  {example.diagram.map((line) => (
                    <div
                      key={line}
                      className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-200"
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={`/generate-terraform?example=${example.id}`}
                className="mt-4 inline-flex rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
              >
                Export To Generator
              </Link>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
