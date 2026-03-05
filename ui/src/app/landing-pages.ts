export type LandingPage = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  bullets: string[];
  cta: string;
};

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: "generate-terraform-with-ai",
    title: "Generate Terraform With AI",
    description: "Design infrastructure faster with AI-assisted Terraform generation, review, and visualization workflows.",
    intro: "Draft Terraform modules from intent, then validate and visualize the architecture before shipping.",
    bullets: [
      "Generate starter modules for common AWS patterns",
      "Convert requirements into Terraform resource scaffolds",
      "Visualize relationships before apply",
      "Keep infrastructure documentation synchronized with code",
    ],
    cta: "Start generating and visualizing Terraform.",
  },
  {
    slug: "generate-api-with-ai",
    title: "Generate API With AI",
    description: "Plan and scaffold API infrastructure using AI prompts mapped to Terraform architecture outputs.",
    intro: "Turn API design ideas into infrastructure blueprints and deployment-ready topology views.",
    bullets: [
      "Map endpoints to infrastructure components",
      "Draft API gateway, compute, and data dependencies",
      "Review architecture diagrams before implementation",
      "Reduce handoff friction between backend and DevOps",
    ],
    cta: "Build API architecture with AI-assisted planning.",
  },
  {
    slug: "ai-devops-tools",
    title: "AI DevOps Tools",
    description: "Use AI DevOps tools to speed up cloud architecture planning, Terraform workflows, and infrastructure visibility.",
    intro: "Combine AI-assisted generation with infrastructure diagrams so teams can move faster with less risk.",
    bullets: [
      "Accelerate Terraform authoring and review cycles",
      "Spot architecture gaps early with visual feedback",
      "Share clean diagrams across engineering and leadership",
      "Standardize infrastructure decisions across teams",
    ],
    cta: "Explore AI-powered DevOps workflows.",
  },
  {
    slug: "ai-code-generator",
    title: "AI Code Generator For Infrastructure",
    description: "Generate infrastructure code and instantly inspect the resulting cloud architecture with visual outputs.",
    intro: "Code generation is useful, but architecture visibility is what prevents expensive mistakes.",
    bullets: [
      "Generate first-pass IaC from requirements",
      "Inspect graph structure before deployment",
      "Validate service connectivity and boundaries",
      "Shorten design-review feedback loops",
    ],
    cta: "Generate code and verify architecture in one flow.",
  },
  {
    slug: "ai-backend-builder",
    title: "AI Backend Builder",
    description: "Use AI to plan backend infrastructure patterns and convert them into clear Terraform architecture diagrams.",
    intro: "From auth and compute to storage and networking, visualize backend systems as they are designed.",
    bullets: [
      "Plan backend service topology from prompts",
      "Translate backend requirements into Terraform structure",
      "Visualize dependencies across services",
      "Document architecture for implementation teams",
    ],
    cta: "Build backend infrastructure plans faster.",
  },
  {
    slug: "terraform-diagram-generator",
    title: "Terraform Diagram Generator",
    description: "Generate architecture diagrams directly from Terraform code to understand cloud systems at a glance.",
    intro: "Upload Terraform and get a readable architecture diagram you can review and share.",
    bullets: [
      "Parse Terraform modules and resources automatically",
      "Render service-aware diagrams with less noise",
      "Export visual assets for docs and design reviews",
      "Reduce manual diagram maintenance",
    ],
    cta: "Generate a Terraform diagram now.",
  },
  {
    slug: "terraform-to-diagram",
    title: "Terraform To Diagram",
    description: "Convert Terraform to a cloud architecture diagram to improve clarity, onboarding, and change planning.",
    intro: "Automatically transform infrastructure code into visuals teams can reason about quickly.",
    bullets: [
      "Translate HCL into architecture context",
      "Improve onboarding with system-level visibility",
      "Review infra changes with less cognitive load",
      "Keep architecture docs aligned with actual code",
    ],
    cta: "Convert Terraform to diagrams in minutes.",
  },
  {
    slug: "iac-visualizer",
    title: "Infrastructure As Code Visualizer",
    description: "Visualize infrastructure-as-code repositories to understand cloud dependencies and design intent.",
    intro: "IaC visualizers help teams reason about complex stacks before they reach production.",
    bullets: [
      "Visualize modules, resources, and relationships",
      "Surface hidden complexity in IaC repos",
      "Communicate architecture to non-specialists",
      "Speed up infra design and review",
    ],
    cta: "Visualize your IaC repository.",
  },
  {
    slug: "aws-architecture-diagram-generator",
    title: "AWS Architecture Diagram Generator",
    description: "Create AWS architecture diagrams from Terraform to improve cloud design reviews and operational planning.",
    intro: "Generate AWS-focused diagrams directly from code so planning and execution stay aligned.",
    bullets: [
      "Render common AWS services and relationships",
      "Support system-level planning and audits",
      "Provide visuals for architecture reviews",
      "Reduce manual AWS diagram work",
    ],
    cta: "Generate an AWS architecture diagram.",
  },
  {
    slug: "cloud-architecture-from-code",
    title: "Cloud Architecture From Code",
    description: "Turn cloud infrastructure code into architecture visuals for faster understanding and better collaboration.",
    intro: "Code-first architecture visibility helps teams make better cloud decisions with less rework.",
    bullets: [
      "Read infrastructure definitions from source",
      "Output clear architecture overviews",
      "Bridge DevOps and product conversations",
      "Improve change communication quality",
    ],
    cta: "Generate architecture from infrastructure code.",
  },
  {
    slug: "infrastructure-documentation-automation",
    title: "Infrastructure Documentation Automation",
    description: "Automate infrastructure documentation by generating diagrams from Terraform and keeping them up to date.",
    intro: "Automated visuals reduce outdated docs and make architecture knowledge easier to maintain.",
    bullets: [
      "Create visual docs from existing Terraform",
      "Cut manual documentation maintenance",
      "Share current-state architecture snapshots",
      "Support onboarding and incident response",
    ],
    cta: "Automate your infrastructure documentation.",
  },
  {
    slug: "devops-automation-ai",
    title: "DevOps Automation AI",
    description: "Use AI in DevOps workflows to accelerate infrastructure authoring, review, and architecture communication.",
    intro: "AI-driven DevOps is strongest when generation is paired with reviewable architecture outputs.",
    bullets: [
      "Automate repetitive infrastructure setup steps",
      "Standardize design patterns across environments",
      "Improve infra decision visibility",
      "Increase delivery velocity without losing control",
    ],
    cta: "Adopt AI-assisted DevOps workflows.",
  },
  {
    slug: "cloud-design-assistant",
    title: "Cloud Design Assistant",
    description: "A cloud design assistant to help model infrastructure options and visualize target architectures quickly.",
    intro: "Design cloud systems with faster iteration loops and clearer infrastructure communication.",
    bullets: [
      "Explore multiple architecture approaches quickly",
      "Validate design intent with generated diagrams",
      "Align teams on deployment topology early",
      "Reduce design ambiguity before implementation",
    ],
    cta: "Use AI as your cloud design assistant.",
  },
  {
    slug: "terraform-parser",
    title: "Terraform Parser And Visualizer",
    description: "Parse Terraform files and visualize resource relationships for architecture planning and review.",
    intro: "A parser-backed visualization workflow helps teams inspect Terraform structure with less friction.",
    bullets: [
      "Parse modules, providers, and resources",
      "Render dependency-aware architecture views",
      "Inspect relationships before deployment",
      "Support architecture governance and review",
    ],
    cta: "Parse and visualize Terraform today.",
  },
];

export const LANDING_PAGES_BY_SLUG = new Map(
  LANDING_PAGES.map((page) => [page.slug, page] as const),
);

