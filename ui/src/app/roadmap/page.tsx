import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

export const metadata = {
  title: "Roadmap | StackGenerate",
  description: "See what is shipping next for StackGenerate: multi-cloud diagrams, account linking, billing, and more.",
};

const roadmapItems = [
  {
    title: "Account linking & security",
    status: "Building now",
    detail: "Link Google + GitHub from a profile page with explicit link intents, provider email verification, and session history.",
  },
  {
    title: "Billing & subscriptions",
    status: "Building now",
    detail: "Stripe-backed plans, token grants for free tiers, and usage visibility for teams.",
  },
  {
    title: "Multi-cloud & Kubernetes",
    status: "Next up",
    detail: "Import AWS + GCP + Azure resources together, and visualize Kubernetes workloads alongside cloud services.",
  },
  {
    title: "Collaboration",
    status: "Next up",
    detail: "Shareable diagram links, comments, and change history for plan diffs.",
  },
  {
    title: "Deeper Terraform coverage",
    status: "In research",
    detail: "More providers, edge cases for networking, IAM graphing, and drift detection.",
  },
  {
    title: "Self-hosting hardening",
    status: "In research",
    detail: "Helm chart, S3 signed uploads, and optional object storage for diagram snapshots.",
  },
];

export default function RoadmapPage() {
  return (
    <div className="min-h-screen text-slate-100">
      <SiteHeader />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 pb-16 pt-12">
        <div className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">Roadmap</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Where StackGenerate is headed</h1>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Near-term builds, next-up ideas, and items we are researching based on user feedback.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {roadmapItems.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{item.title}</h2>
                <span className="rounded-full border border-slate-200 px-2 py-1 text-[11px] uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  {item.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{item.detail}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
