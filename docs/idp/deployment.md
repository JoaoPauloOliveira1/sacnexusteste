# IDP Deployment

This document describes the deployment model for `apps/idp`.

## Overview

`apps/idp` is deployed as a Docker image published to GHCR and consumed by Dokploy as a separate service.

The image is environment-agnostic. Deploy-specific configuration is provided at runtime through environment variables in Dokploy or equivalent infrastructure.

The Docker build stage currently uses the latest available official LTS `node:24-alpine` image because the Docker Hub `node:26-alpine` tag is not available yet. Local and GitHub Actions non-Docker checks still use `.node-version`.

## Branch Flow

- PRs target `staging` and deploy the IDP to the shared develop environment when IDP-affecting files change.
- Merges to `staging` deploy the IDP staging environment automatically.
- Merges to `main` deploy the IDP production environment automatically after gates pass.
- Production promotion should happen through a PR from `staging` to `main`.

## Gate Taxonomy

CI/CD checks use `snake_case` in the `app_stage` format:

- `idp_quality`: Biome check, typecheck, Vitest coverage, and build.
- `idp_security`: dependency audit.
- `idp_package`: Docker build, image scan, GHCR publish, and digest resolution.
- `idp_deploy_develop`: database migration, Dokploy develop deployment, and smoke check.
- `idp_deploy_staging`: database migration, Dokploy staging deployment, and smoke check.
- `idp_deploy_production`: database migration, Dokploy production deployment, and smoke check.
- `idp_rollback_production`: manual production rollback and smoke check.

## GitHub Workflows

- `.github/workflows/idp-ci.yml`: PR quality/security gates for PRs targeting `main`.
- `.github/workflows/idp-develop.yml`: develop image build, scan, publish, deploy, smoke check, and PR comment.
- `.github/workflows/idp-staging.yml`: staging deployment from `staging`.
- `.github/workflows/idp-production.yml`: production deployment from `main`.
- `.github/workflows/idp-rollback.yml`: manual production rollback by image digest.

## Required Repository Variables

- `IDP_DEVELOP_URL`: public develop URL for the IDP.
- `IDP_STAGING_URL`: public staging URL for the IDP.
- `IDP_PRODUCTION_URL`: public production URL for the IDP.

## Required Secrets

- `DOKPLOY_IDP_DEVELOP_WEBHOOK_URL`
- `DOKPLOY_IDP_DEVELOP_WEBHOOK_TOKEN`
- `DOKPLOY_IDP_STAGING_WEBHOOK_URL`
- `DOKPLOY_IDP_STAGING_WEBHOOK_TOKEN`
- `DOKPLOY_IDP_PRODUCTION_WEBHOOK_URL`
- `DOKPLOY_IDP_PRODUCTION_WEBHOOK_TOKEN`
- `DATABASE_URL`: environment-scoped PostgreSQL connection string used by deploy workflows for `db:migrate`.
- `RESEND_API_KEY`: environment-scoped Resend API key for runtime email delivery.

Webhook token secrets may be empty only if the Dokploy endpoint is otherwise protected. Prefer authenticated webhooks.

## Runtime Environment Variables

The IDP container currently uses these runtime variables:

- `NODE_ENV`: defaults to `production` in the Dockerfile.
- `IDP_APP_ENV`: defaults to `production` in the Dockerfile and Compose file.
- `IDP_HOST`: defaults to `0.0.0.0` in the Dockerfile and Compose file.
- `IDP_PORT`: defaults to `3001` in the Dockerfile and Compose file.
- `DATABASE_URL`: required PostgreSQL connection string for IDP-owned tables.
- `BETTER_AUTH_SECRET`: required Better Auth secret with at least 32 characters.
- `BETTER_AUTH_URL`: required public Better Auth base URL for the environment.
- `AUTH_TRUSTED_ORIGINS`: optional comma-separated browser origin allowlist for Better Auth CSRF/origin checks.
- `AUTH_SESSION_EXPIRES_IN_SECONDS`: session lifetime in seconds, defaulting to 30 days.
- `RESEND_API_KEY`: required Resend API key.
- `AUTH_EMAIL_FROM`: required sender string, using a verified Resend sender/domain outside local/test execution.
- `AUTH_EMAIL_REPLY_TO`: optional reply-to address.
- `AUTH_EMAIL_VERIFICATION_CALLBACK_URL`: required web URL used after Better Auth email verification handling.
- `AUTH_PASSWORD_RESET_REDIRECT_URL`: required web URL used by password reset emails.

Future token, plugin, or provider variables must be added only in the implementation step that uses them.

## Database Migrations

Deploy workflows run `pnpm --filter idp db:migrate` before triggering Dokploy deployment.

Migration rules:

- Migrations are generated from `apps/idp/src/database/schema.ts` into `apps/idp/drizzle`.
- Migrations are reviewable SQL artifacts committed to the repository.
- Application startup never applies migrations automatically.
- Each GitHub Environment must provide its own `DATABASE_URL` secret for migration execution.
- Migration logs must not print connection strings or credentials.
- Rollbacks do not automatically roll back database migrations, so migration changes should be forward-compatible with the previously deployed runtime when practical.

## Docker Compose

The Compose file is `apps/idp/compose.yml` and contains the `idp` service.

The IDP is intentionally deployed as a separate Dokploy service in this step. Do not merge it into the web stack until a future PRD defines full-stack routing, `/api/auth` proxying, Better Auth cookies, and tenant host forwarding.

Dokploy owns public domain, TLS, and Traefik routing configuration. Configure the IDP service to route traffic to container port `3001` in the Dokploy UI instead of maintaining Traefik labels in Compose.

## Image Tags

Images are published to:

```txt
ghcr.io/<owner>/<repo>/idp
```

Tag policy:

- Immutable commit tag: `<commit-sha>`.
- Develop alias: `develop`.
- Staging alias: `staging`.
- Production alias: `prod`.

Deployments and PR comments should record the immutable digest.

## Smoke Checks

IDP deploy and rollback workflows call:

- `GET /health`
- `GET /ready`

Both checks must pass after Dokploy deployment or rollback. `/ready` now includes a safe database dependency check and returns `503` when PostgreSQL is unavailable.

Tenant status can be smoke checked manually after migrations and approved tenant bootstrap have configured an active tenant/domain pair:

```bash
curl -H "Host: tenant.example.test" https://idp.example.test/tenant/status
```

The response must contain only `tenant_status` with `available` or `unavailable`. Do not record real tenant domains, production URLs, emails, cookies, tokens, SQL, connection strings, or raw errors in smoke-test notes.

## Host Forwarding For Tenant Resolution

Tenant resolution uses `X-Forwarded-Host` when present, otherwise `Host`. Production ingress, proxy, or load balancer configuration must strip or control untrusted forwarded-host headers before traffic reaches the IDP.

Tenant domains should preserve the original request host when routing browser traffic to `/api/auth/*` and `/tenant/status`. If an environment cannot guarantee sanitized forwarded-host handling, do not rely on `X-Forwarded-Host` until the ingress contract is corrected.

Custom edge or distributed rate limits for public tenant status traffic are not implemented by this documentation update. Keep production rate-limit design as future work until an approved implementation adds it.

## Rollback

Use `.github/workflows/idp-rollback.yml` with a previously published image digest.

Production rollback uses the `production` GitHub Environment and runs manually through `workflow_dispatch` with an explicit image digest input.

Database migrations are not reversed by the rollback workflow. If a bad deployment included an incompatible migration, handle database remediation as a separate controlled operational procedure.

## External Setup Checklist

- Configure repository variables for IDP develop, staging, and production URLs.
- Configure Dokploy IDP webhook secrets.
- Configure environment-scoped `DATABASE_URL` secrets for IDP deploy workflow migrations.
- Configure Dokploy runtime variables for `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `AUTH_TRUSTED_ORIGINS`, and `AUTH_SESSION_EXPIRES_IN_SECONDS`.
- Configure Dokploy runtime variables for `RESEND_API_KEY`, `AUTH_EMAIL_FROM`, `AUTH_EMAIL_REPLY_TO`, `AUTH_EMAIL_VERIFICATION_CALLBACK_URL`, and `AUTH_PASSWORD_RESET_REDIRECT_URL`.
- Verify the Resend sender/domain for staging and production before enabling real email delivery.
- Keep Dokploy Autodeploy enabled for services triggered by GitHub Actions webhooks.
- Configure Dokploy branch matching so GitHub Actions-triggered webhooks are accepted for the target environment. Staging must match `staging`; production must match `main`.
- Keep the GitHub Actions Dokploy trigger payload compatible with GitHub `push` webhooks (`X-GitHub-Event: push` and `ref: refs/heads/<branch>`), because Dokploy validates the webhook branch for Git-based sources.
- Configure GHCR pull access in Dokploy for the IDP service.
- Configure Dokploy routing for the IDP service on container port `3001`.
- Configure DNS and routing for the IDP develop, staging, and production URLs.
- Validate Dokploy webhook payloads against the actual Dokploy setup.
- Update branch protection required checks to include the new `snake_case` check names.
