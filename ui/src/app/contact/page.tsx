import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

export const metadata = {
  title: "Contact | StackGenerate",
  description: "Get in touch with the StackGenerate team for support, partnerships, or roadmap input.",
};

const contactOptions = [
  {
    title: "Support",
    detail: "Questions about uploads, auth, or billing? We respond quickly.",
    action: "hello@stackgenerate.com",
    href: "mailto:hello@stackgenerate.com",
  },
  {
    title: "Partnerships",
    detail: "Cloud providers, integrators, and platform teams—let's collaborate.",
    action: "partner@stackgenerate.com",
    href: "mailto:partner@stackgenerate.com",
  },
  {
    title: "Security",
    detail: "Report a vulnerability or ask about our security model.",
    action: "support@stackgenerate.com",
    href: "mailto:support@stackgenerate.com",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen text-slate-100">
      <SiteHeader />
      <main className="mx-auto flex max-w-4xl flex-col gap-10 px-6 pb-16 pt-12">
        <div className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">Contact</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Talk with StackGenerate</h1>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Reach us for support, security questions, or to help steer the roadmap.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {contactOptions.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="rounded-2xl border border-slate-200 bg-white/80 p-5 text-left shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(56,189,248,0.18)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{item.title}</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{item.detail}</p>
              <p className="mt-4 text-sm font-semibold text-sky-600 dark:text-sky-300">{item.action}</p>
            </a>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-center shadow-[0_10px_30px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-none">
          <p className="text-base font-semibold">Prefer a quick link?</p>
          <div className="mt-3 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/faq"
              className="rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm text-slate-800 shadow-sm transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500"
            >
              View FAQ
            </Link>
            <Link
              href="/roadmap"
              className="rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-sm font-semibold text-slate-50 shadow-[0_10px_30px_rgba(56,189,248,0.25)] transition hover:from-sky-400 hover:to-violet-400"
            >
              Roadmap
            </Link>
            <Link
              href="/subscribe"
              className="rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm text-slate-800 shadow-sm transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500"
            >
              Subscribe
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
