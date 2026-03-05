import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { LANDING_PAGES, LANDING_PAGES_BY_SLUG } from "../landing-pages";

type LandingPageProps = {
  params: Promise<{ landingSlug: string }>;
};

export async function generateStaticParams() {
  return LANDING_PAGES.map((page) => ({ landingSlug: page.slug }));
}

export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> {
  const { landingSlug } = await params;
  const page = LANDING_PAGES_BY_SLUG.get(landingSlug);

  if (!page) {
    return {
      title: "Not Found | StackGenerate",
    };
  }

  return {
    title: `${page.title} | StackGenerate`,
    description: page.description,
    alternates: {
      canonical: `https://www.stackgenerate.com/${page.slug}`,
    },
    openGraph: {
      title: `${page.title} | StackGenerate`,
      description: page.description,
      url: `https://www.stackgenerate.com/${page.slug}`,
      siteName: "StackGenerate",
      type: "website",
      images: [
        {
          url: "https://www.stackgenerate.com/screenshots/terraform-source.svg",
          width: 1600,
          height: 900,
          alt: "Terraform source view",
        },
      ],
    },
  };
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { landingSlug } = await params;
  const page = LANDING_PAGES_BY_SLUG.get(landingSlug);
  const session = await getServerSession(authOptions);

  if (!page) {
    notFound();
  }

  const faqs = [
    {
      question: `What does ${page.title.toLowerCase()} mean in practice?`,
      answer:
        "It means moving from manual architecture drafting to a faster workflow where infrastructure intent is converted into clear visual outputs for review.",
    },
    {
      question: "Can I use this with existing Terraform projects?",
      answer:
        "Yes. You can upload an existing Terraform folder and generate diagrams without rewriting your repository.",
    },
    {
      question: "Who is this useful for?",
      answer:
        "Platform engineers, DevOps teams, cloud architects, and engineering managers who need better infrastructure visibility.",
    },
  ];

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "StackGenerate",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `https://www.stackgenerate.com/${page.slug}`,
    description: page.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-16 pt-12">
        <section className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">StackGenerate</p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{page.title}</h1>
          <p className="mx-auto max-w-3xl text-base text-slate-300">{page.intro}</p>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-200">{page.description}</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {page.bullets.map((bullet) => (
              <li key={bullet}>- {bullet}</li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/upload"
              className="rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(56,189,248,0.25)] transition hover:from-sky-400 hover:to-violet-400"
            >
              Try StackGenerate
            </Link>
            {!session?.user?.id && (
              <Link
                href="/auth/sign-in"
                className="rounded-full border border-slate-700 bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:border-slate-500"
              >
                Sign in
              </Link>
            )}
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">{page.cta}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-100">Product Screenshots</h2>
          <p className="text-sm text-slate-300">
            Real UI captures showing Terraform input, generated architecture output, and collaboration-ready exports.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">
              <Image
                src="/screenshots/terraform-source.svg"
                alt="Terraform source screenshot"
                width={1600}
                height={900}
                className="h-auto w-full"
              />
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">
              <Image
                src="/screenshots/diagram-generated.svg"
                alt="Generated architecture diagram screenshot"
                width={1600}
                height={900}
                className="h-auto w-full"
              />
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">
              <Image
                src="/screenshots/diagram-export.svg"
                alt="Diagram export screenshot"
                width={1600}
                height={900}
                className="h-auto w-full"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-100">FAQ</h2>
          <div className="grid gap-3">
            {faqs.map((item) => (
              <article
                key={item.question}
                className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"
              >
                <h3 className="text-sm font-semibold text-slate-100">{item.question}</h3>
                <p className="mt-1 text-sm text-slate-300">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
