import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { ComposerClient } from "./composer-client";

export const metadata = {
  title: "Generate Terraform | StackGenerate",
  description:
    "Design AWS architecture from a blank canvas and generate Terraform files from your resource configuration.",
};

export default function GenerateTerraformPage() {
  return (
    <div className="min-h-screen text-slate-100">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-6 pb-16 pt-12">
        <ComposerClient />
      </main>
      <SiteFooter />
    </div>
  );
}
