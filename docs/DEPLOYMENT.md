# Deployment & Operations

## App host (EC2)

- User data installs Docker and starts `ui` (3000) and `api` (4000) from ECR on every boot. Rebooting refreshes the containers automatically.
- CloudFront aliases: `stackgenerate.com` / `www.stackgenerate.com` (ACM in `us-east-1`).
- Canonical host: `www.stackgenerate.com` (middleware redirects apex -> www). Set `NEXTAUTH_URL` and `NEXT_PUBLIC_API_BASE` to the www host.

## GitHub Actions workflows

- `.github/workflows/deploy.yml` (infra): builds/pushes images, runs Terraform, SSM restart. Use for infra changes.
- `.github/workflows/deploy-app.yml` (fast app deploy): builds/pushes images, reboots app host, waits for EC2/SSM, runs `docker ps`.
- `.github/workflows/restart-app-host.yml` (manual): reboots app host, waits for EC2/SSM, runs `docker ps`.

## Required secrets

- `AWS_ROLE_ARN`, `AWS_REGION=us-east-1`
- TF state: `TF_STATE_BUCKET`, `TF_STATE_KEY`, `TF_STATE_LOCK_TABLE`
- TLS/aliases: `TF_VAR_acm_certificate_arn`, `CLOUDFRONT_DOMAIN_NAMES`
- App env: `NEXTAUTH_URL`, `NEXT_PUBLIC_API_BASE`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`
- Optional (custom Cognito email sender via SES):
  - `TF_VAR_cognito_ses_source_arn` (SES identity ARN for `stackgenerate.com` or `support@stackgenerate.com`)
  - `TF_VAR_cognito_from_email` (for example `support@stackgenerate.com`)
  - `TF_VAR_cognito_reply_to_email` (for example `support@stackgenerate.com`)
  - `TF_VAR_cognito_ses_configuration_set` (optional)

## If deploy stalls

- Check SSM: cancel stuck command, `sudo systemctl restart amazon-ssm-agent` on the box, or just reboot (user data will restart containers).
- Check cloud-init: `/var/log/cloud-init-output.log`
- Verify containers: `docker ps` (via SSM or SSH/Session Manager)
