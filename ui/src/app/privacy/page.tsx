import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

export const metadata = {
  title: "Privacy Policy | StackGenerate",
  description: "How StackGenerate handles your data and privacy.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen text-slate-100">
      <SiteHeader />
      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 pb-16 pt-12">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">
            Privacy Policy
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">StackGenerate Privacy</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Effective date: February 12, 2026
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">1. Overview</h2>
            <p>
              This Privacy Policy explains what information we collect, how we use it, and the choices you have. We
              aim to keep data collection minimal and focused on providing the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Account info: name and email address from your OAuth provider.</li>
              <li>Usage data: basic metrics to understand active usage and improve the service.</li>
            </ul>
            <p className="mt-2">
              Terraform files are processed in memory for diagram generation and are not stored after processing.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">3. How We Use Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide and improve the diagramming service.</li>
              <li>Maintain account access and basic support.</li>
              <li>Understand overall usage trends.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">4. Data Sharing</h2>
            <p>
              We do not sell your personal data. We may share data only as required to operate the service or comply
              with legal obligations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">5. Data Retention</h2>
            <p>
              We retain account data (name and email) while your account is active. You can request deletion at any time.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">6. Security</h2>
            <p>
              We take reasonable measures to protect your data. No method of transmission or storage is 100% secure.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">7. Your Choices</h2>
            <p>
              You can request access or deletion of your account data by emailing{" "}
              <a href="mailto:support@stackgenerate.com" className="underline hover:text-sky-300">
                support@stackgenerate.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">8. Changes</h2>
            <p>
              We may update this Privacy Policy over time. We will update the effective date when changes are made.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">9. Contact</h2>
            <p>
              Questions about privacy? Contact us at{" "}
              <a href="mailto:support@stackgenerate.com" className="underline hover:text-sky-300">
                support@stackgenerate.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
