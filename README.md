# StackGenerate

Terraform-to-architecture visualizer: drop in a Terraform folder, get back a clean AWS diagram with icons, lanes, and a legend. Cognito-backed auth supports Google and email/password, and a lightweight Express API does the parsing.

## What it does
- Upload Terraform modules; backend parses HCL and emits nodes/edges.
- ReactFlow-powered diagram with service-aware layout, VPC grouping, and AWS icon set (served via `NEXT_PUBLIC_ICON_BASE` S3 path).
- Toggle infra overlays (Route53/CloudFront/observability) and inspect node metadata/relations.
- Deployed on AWS: CloudFront in front of an EC2 host running Dockerized `ui` and `api` pulled from ECR.

## Stack
- Frontend: Next.js 16, React 19, ReactFlow, Tailwind (v4 tooling).
- Auth: NextAuth + Cognito (Google + email/password).
- Backend: Express + TypeScript, HCL parsing via `@cdktf/hcl2json`.
- Infra/CI: Terraform + GitHub Actions + ECR/EC2/SSM/CloudFront.

## Develop locally
```bash
npm install          # installs workspace deps
npm run build        # builds api and ui
# or in dev:
npm --prefix api run dev    # http://localhost:4000
npm --prefix ui run dev     # http://localhost:3000
```
Local DB + Prisma setup: see `docs/LOCAL_DB.md`.

Env to set for the UI (e.g. `.env.local`):
```
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE=http://localhost:4000
NEXT_PUBLIC_ICON_BASE=https://your-bucket.s3.amazonaws.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
```

## Deploying
See `docs/DEPLOYMENT.md` for workflows, secrets, and troubleshooting.
