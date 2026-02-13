import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

export const metadata = {
  title: "Terms of Service | StackGenerate",
  description: "The terms that govern use of StackGenerate.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen text-slate-100">
      <SiteHeader />
      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 pb-16 pt-12">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">
            Terms of Service
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">StackGenerate Terms</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Effective date: February 12, 2026
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">1. Agreement</h2>
            <p>
              These Terms of Service (“Terms”) govern your access to and use of StackGenerate (“we,” “us,” or
              “our”). By using the service, you agree to these Terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">2. The Service</h2>
            <p>
              StackGenerate provides infrastructure diagramming based on Terraform input. We may update or change
              features at any time to improve the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">3. Accounts</h2>
            <p>
              You are responsible for maintaining the security of your account and any activity that occurs under it.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">4. Acceptable Use</h2>
            <p>
              Do not misuse the service, interfere with its normal operation, or attempt to access data you are not
              authorized to access. We may suspend or terminate accounts for abuse or misuse.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">5. Your Content</h2>
            <p>
              You retain all rights to your Terraform files and any content you submit. You grant us a limited license
              to process your content solely to provide the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">6. Intellectual Property</h2>
            <p>
              StackGenerate and its branding, code, and design are owned by us and protected by applicable laws. You may
              not copy or redistribute the service without permission.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">7. Disclaimer</h2>
            <p>
              The service is provided “as is” without warranties of any kind. We do not guarantee that diagrams are
              error‑free or that the service will be uninterrupted.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, we are not liable for any indirect, incidental, special, or
              consequential damages arising out of or related to your use of the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">9. Termination</h2>
            <p>
              You may stop using the service at any time. We may suspend or terminate access if you violate these Terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">10. Changes</h2>
            <p>
              We may update these Terms from time to time. If changes are material, we will update the effective date.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">11. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of Connecticut, without regard to conflict of law
              principles.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">12. Contact</h2>
            <p>
              Questions about these Terms? Contact us at{" "}
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
