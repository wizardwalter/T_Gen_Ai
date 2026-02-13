import Link from "next/link";

const footerLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/contact", label: "Contact" },
  { href: "/profile", label: "Profile" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/80 py-10 text-slate-700 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/80 dark:text-slate-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md space-y-2">
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            StackGenerate
          </p>
          <p className="text-base text-slate-700 dark:text-slate-200">
            Terraform-to-architecture diagrams that turn your infrastructure code into clean, actionable visuals you can share.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Need something custom? <Link href="/contact" className="underline hover:text-sky-500 dark:hover:text-sky-300">Reach out</Link> and we will chat.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-slate-700 transition hover:text-sky-500 dark:text-slate-300 dark:hover:text-sky-300"
            >
              {item.label}
            </Link>
          ))}
          <a
            href="mailto:support@stackgenerate.com"
            className="text-slate-700 transition hover:text-sky-500 dark:text-slate-300 dark:hover:text-sky-300"
          >
            support@stackgenerate.com
          </a>
        </div>
        <div className="sm:self-end">
          <a
            href="https://www.buymeacoffee.com/stackgenerate"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-amber-300/90 px-4 py-2 text-xs font-semibold text-slate-900 shadow-[0_10px_30px_rgba(251,191,36,0.2)] transition hover:brightness-110"
          >
            <span className="text-base">☕</span>
            Buy me a coffee
          </a>
        </div>
      </div>
      <div className="mx-auto mt-6 max-w-6xl px-6 text-xs text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} StackGenerate. All rights reserved.
      </div>
    </footer>
  );
}
