# Deployment notes

- On boot, user data installs Docker, pulls the latest UI/API images from ECR, and starts the `ui` (port 3000) and `api` (port 4000) containers with the env vars passed via Terraform.
- The GitHub Actions `deploy.yml` still uses an SSM step to pull and restart containers. If that SSM step hangs, cancel the stuck command or reboot the EC2 host; user data will restart the containers.
- CloudFront aliases: `stackgenerate.com` and `www.stackgenerate.com` (ACM in us-east-1).
- Secrets used by the workflow: `NEXTAUTH_URL`, `NEXT_PUBLIC_API_BASE`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `TF_VAR_acm_certificate_arn`, `CLOUDFRONT_DOMAIN_NAMES`, TF state S3/Dynamo settings, `AWS_ROLE_ARN`, `UI_REPO/API_REPO` inferred.
