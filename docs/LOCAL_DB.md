# Local database setup

Spin up Postgres locally so NextAuth + the API can persist users.

## Start Postgres
- `docker compose -f docker-compose.db.yml up -d`
- Defaults: user/password/db are `aidevops`, port `5432`.

## Configure env vars
- UI: `ui/.env.local` already includes `DATABASE_URL=postgresql://aidevops:aidevops@localhost:5432/aidevops?schema=public`
- API: `api/.env` includes the same `DATABASE_URL`.

## Create tables
Run this from the repo root after the container is up:
- `npx prisma migrate dev --name init --schema prisma/schema.prisma`
- If you just want to push the schema without creating a migration file (e.g., in CI), use `npx prisma db push --schema prisma/schema.prisma`.

## What changed
- NextAuth now uses Prisma + Postgres; sign-in will redirect to `/auth/sign-up` if no user exists. The sign-up page sets a short-lived cookie to allow first-time account creation via SSO, linking Google/GitHub by email.
- Express API uses the same Prisma client; `/health/db` checks connectivity.

## Switching to Aurora later
- Update `DATABASE_URL` to the Aurora writer endpoint and re-run `prisma migrate deploy` (or `db push`) against that cluster. Keep secrets out of git.
