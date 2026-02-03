import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

export const metadata = {
  title: "FAQ | StackGenerate",
  description: "Answers to common questions about Terraform uploads, security, auth, and roadmap for StackGenerate.",
};

const faqs = [
  {
    q: "What does StackGenerate do?",
    a: "We parse your Terraform to map resources, relationships, and networks, then render a clean architecture diagram you can explore.",
  },
  {
    q: "How do you handle authentication?",
    a: "We use NextAuth with Google and GitHub SSO. Sign-ups are gated to avoid surprise account creation, and you can link additional providers from your profile soon.",
  },
  {
    q: "Where does my data live?",
    a: "Locally we use Postgres via Docker; in the cloud we target Aurora Postgres with Prisma migrations. Terraform files are only held in memory during parsing.",
  },
  {
    q: "Is there a token or credit system?",
    a: "Yes. Non-subscribers draw from a token balance; subscribers get unlimited parsing. You can see your balance on the profile page.",
  },
  {
    q: "Do you support other IaC formats?",
    a: "Terraform is first-class. CloudFormation/CDK are on the roadmap; reach out if you want early access.",
  },
  {
    q: "Can I self-host?",
    a: "Self-hosting isn't supported. StackGenerate is delivered as a hosted service with managed auth, billing, and roadmap features.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen text-slate-100">
      <SiteHeader />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 pb-16 pt-12">
        <div className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">FAQ</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">StackGenerate questions, answered</h1>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Everything about Terraform uploads, auth, data handling, and how to get help.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {faqs.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none"
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{item.q}</h2>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{item.a}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
