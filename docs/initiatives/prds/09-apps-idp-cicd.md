# Apps IDP CI/CD PRD

## Overview

This document defines the third incremental implementation step for `apps/idp`.

The goal is to add complete CI/CD coverage for the IDP while also standardizing the existing web pipeline around reusable pipeline conventions. The IDP should get quality gates, security gates, Docker image packaging, GHCR publishing, Dokploy deployment, smoke checks, PR deployment comments, and production rollback.

Execution plan: [`docs/initiatives/tasks/09-apps-idp-cicd.md`](../tasks/09-apps-idp-cicd.md).

## Product Context

The IDP is security-critical infrastructure for SAC Nexus. It will later own Better Auth integration, session handling, tenant membership, broad roles/permissions, and identity events.

The first two IDP baby steps created the Fastify/TypeScript foundation and operational endpoints. The third baby step should make the service continuously verifiable and deployable before database and authentication behavior are introduced.

The repository already has web CI/CD workflows. This step should avoid creating a second pipeline style for the IDP and should migrate the web workflows to the same gate naming and shared setup patterns where practical.

## Goals

- Add IDP quality gates for Biome check, TypeScript typecheck, Vitest coverage, and production build.
- Add IDP security gates for dependency audit and deployable image vulnerability scanning.
- Package the IDP as an environment-agnostic Docker image.
- Publish IDP images to GHCR with immutable commit tags and environment aliases.
- Deploy the IDP through Dokploy for develop, staging, and production.
- Add manual production rollback by image digest.
- Add IDP post-deploy smoke checks for `/health` and `/ready`.
- Add a sticky PR comment for IDP develop deployments.
- Standardize pipeline gate names using `snake_case` in the `app_stage` format.
- Migrate the web pipeline to the shared gate naming and reusable setup conventions.
- Replace web-specific composite actions with generic workspace-aware actions.
- Use Turborepo filtered task execution in CI for package-level scripts.
- Document required repository variables, secrets, branch protection changes, and operational follow-up items.

## Non-Goals

- No Better Auth integration in this step.
- No database, Drizzle, PostgreSQL, or database readiness checks in this step.
- No full-stack same-origin `/api/auth` proxy integration in this step.
- No migration of the web and IDP into one shared Dokploy stack in this step.
- No isolated per-PR preview environments in this step.
- No SBOM, provenance, image signing, or attestation in this step.
- No remote Turborepo cache in this step unless it becomes necessary to keep CI practical.
- No E2E test gate in this step.
- No split security taxonomy such as `source_security` and `artifact_security` yet.
- No production OpenAPI exposure change for the IDP.

## Decisions

### Scope

The IDP third baby step is expanded from basic CI coverage to complete CI/CD coverage.

It includes:

- CI quality gates.
- Dependency and image security checks.
- Docker packaging.
- GHCR publishing.
- Dokploy deployment.
- Develop, staging, production, and rollback flows.
- IDP smoke checks.
- Pipeline standardization shared with `apps/web`.

The roadmap item in `idp-architecture-discussion.md` should remain unchecked until implementation and verification are complete.

### Gate Naming

Use `snake_case` in the `app_stage` format for job/check names.

Examples:

- `web_quality`
- `web_security`
- `web_package`
- `web_deploy_develop`
- `web_deploy_staging`
- `web_deploy_production`
- `web_rollback_production`
- `idp_quality`
- `idp_security`
- `idp_package`
- `idp_deploy_develop`
- `idp_deploy_staging`
- `idp_deploy_production`
- `idp_rollback_production`

Avoid ambiguous names such as `Dependency Audit` or `Build And Deploy Develop` once multiple apps have pipelines.

### Gate Taxonomy

Use the compact initial taxonomy:

- `quality`: source quality and buildability.
- `security`: dependency/CVE/secret-oriented checks that can run before packaging.
- `package`: deployable artifact creation, image scan where implementation locality requires it, GHCR publishing, and digest resolution.
- `deploy_<env>`: environment deployment.
- `rollback_<env>`: manual environment rollback.

If security grows enough to justify more precision, revisit `source_security` and `artifact_security` later.

### Reusable Pipeline Actions

Prefer generic composite actions over reusable workflows for this step.

Composite actions should replace web-specific names such as:

- `.github/actions/setup-web`
- `.github/actions/detect-web-changes`

Target generic actions:

- `.github/actions/setup-node-pnpm`
- `.github/actions/detect-workspace-changes`

Reusable workflows may be revisited later if the monorepo grows enough to justify full job/workflow reuse.

### Change Detection

Use workspace-specific path detection plus shared root files.

An app pipeline should run when changes affect:

- `apps/<app>/**`
- root package/workspace/build config files that affect all JavaScript apps
- shared pipeline actions
- app-specific workflow files
- shared workflow files when they are introduced

The web pipeline must not run only because `apps/idp` changed. The IDP pipeline must not run only because `apps/web` changed.

### Turborepo Execution

Use Turborepo filtered task execution in CI.

Quality steps should run as separate commands for clear logs and fail-fast behavior, for example:

```bash
pnpm turbo run check --filter=idp
pnpm turbo run typecheck --filter=idp
pnpm turbo run test:coverage --filter=idp
pnpm turbo run build --filter=idp
```

Apply the same pattern to `web` during the migration.

### IDP Quality Gate

The IDP `quality` gate should include:

- Biome check.
- TypeScript typecheck.
- Vitest coverage.
- Production build.

Use `test:coverage` as the test gate because it executes Vitest and enforces the current coverage threshold.

### IDP Security Gate

The IDP `security` gate should include dependency audit blocking high and critical vulnerabilities:

```bash
pnpm audit --audit-level high
```

Image vulnerability scanning should also block high and critical findings before deployment. If sharing a locally built image across jobs is not worth the complexity yet, the image scan can live in the `package` job and be documented as artifact security inside the packaging gate.

### IDP Docker Image

Use a multi-stage Dockerfile for `apps/idp`.

Requirements:

- Build with pnpm and TypeScript.
- Emit production JavaScript to `dist`.
- Run `node dist/server.js` in the runtime stage.
- Use a non-root runtime user.
- Keep the runtime image environment-agnostic.
- Include only what is required to run the IDP.
- Expose the IDP port.
- Keep secrets out of the image.
- Document the selected Node base image and update it when security scanners report fixed vulnerabilities.

Distroless can be revisited later if runtime hardening needs outweigh debugging ergonomics.

### Dokploy Model

Deploy the IDP as a separate Dokploy service for now.

Do not merge IDP and web into a single full-stack Dokploy stack in this step. The future same-origin routing model for `/api/auth` should be handled after Better Auth, database, secrets, and proxy requirements are concrete.

### Deployment Flow

Mirror the web flow:

- PRs targeting `staging` build, scan, publish, deploy to `develop`, and comment on the PR.
- Pushes to `staging` deploy staging automatically after gates pass.
- Pushes to `main` deploy production automatically after gates pass.
- Production rollback is manual through `workflow_dispatch` with a previously published digest.

### Smoke Checks

The IDP deployment workflows should run post-deploy smoke checks against the public IDP URL:

- `GET /health`
- `GET /ready`

The web deployment workflows should run post-deploy smoke checks against the public web URL:

- `GET /config.json`
- `GET /`

Smoke checks should retry briefly because Dokploy webhooks may return before the replacement container is ready.

### PR Comments

The IDP develop workflow should create or update one sticky PR comment containing:

- Develop URL.
- Deployment status.
- Image tag.
- Image digest.
- Smoke check status.
- Workflow run URL.

Keep the web PR comment behavior, but migrate naming and reusable action usage according to this PRD.

### Repository Variables And Secrets

Use app-scoped variables and secrets.

Required URL variables:

- `WEB_DEVELOP_URL`
- `WEB_STAGING_URL`
- `WEB_PRODUCTION_URL`
- `IDP_DEVELOP_URL`
- `IDP_STAGING_URL`
- `IDP_PRODUCTION_URL`

Required Dokploy webhook secrets:

- `DOKPLOY_WEB_DEVELOP_WEBHOOK_URL`
- `DOKPLOY_WEB_DEVELOP_WEBHOOK_TOKEN`
- `DOKPLOY_WEB_STAGING_WEBHOOK_URL`
- `DOKPLOY_WEB_STAGING_WEBHOOK_TOKEN`
- `DOKPLOY_WEB_PRODUCTION_WEBHOOK_URL`
- `DOKPLOY_WEB_PRODUCTION_WEBHOOK_TOKEN`
- `DOKPLOY_IDP_DEVELOP_WEBHOOK_URL`
- `DOKPLOY_IDP_DEVELOP_WEBHOOK_TOKEN`
- `DOKPLOY_IDP_STAGING_WEBHOOK_URL`
- `DOKPLOY_IDP_STAGING_WEBHOOK_TOKEN`
- `DOKPLOY_IDP_PRODUCTION_WEBHOOK_URL`
- `DOKPLOY_IDP_PRODUCTION_WEBHOOK_TOKEN`

Webhook token secrets may be empty only if the Dokploy endpoint is otherwise protected. Prefer authenticated webhooks.

### Branch Protection

Renaming web jobs/checks requires branch protection updates.

Expected required checks after migration:

- `staging`: `web_quality`, `web_security`, `web_deploy_develop`, `idp_quality`, `idp_security`, `idp_deploy_develop` from develop workflows when relevant to changed paths.
- `main`: `web_quality`, `web_security`, `idp_quality`, `idp_security` when relevant to changed paths.

Exact branch protection configuration must be validated in GitHub after workflows are implemented because skipped path-filtered workflows and required checks can interact poorly if not configured carefully. Avoid duplicate job names across workflows triggered by the same event.

### Documentation And Agent Guidance

This step should update:

- `apps/idp/README.md` with CI/CD, Docker, Dokploy, smoke checks, and rollback commands or references.
- `apps/idp/AGENTS.md` with CI/CD skills and pipeline rules.
- `docs/idp/deployment.md` with durable IDP deployment guidance.
- `docs/web/deployment.md` with the new gate naming, app-scoped secrets, and web smoke check behavior.
- `apps/web/AGENTS.md` if the CI/CD conventions need to reflect the new generic names.
- `docs/TODO.md` for any remaining CI/CD follow-ups not covered by active tasks.

Useful skills for CI/CD work:

- `ci-cd-and-automation`
- `github-actions-docs`
- `turborepo`

## Functional Requirements

- IDP PR changes must run `idp_quality` and `idp_security` when IDP-affecting files change.
- IDP PRs targeting `staging` must build, scan, publish, deploy to develop, smoke check, and update a sticky PR comment.
- IDP pushes to `staging` must deploy staging after gates pass.
- IDP pushes to `main` must deploy production after gates pass.
- IDP production rollback must accept a previous image digest.
- Web workflows must migrate to the shared naming and setup conventions without changing the intended deployment behavior.
- App pipelines must avoid running for unrelated app-only changes.

## Non-Functional Requirements

- CI/CD must use least-privilege GitHub permissions.
- CI/CD must not print secrets, tokens, webhook credentials, cookies, or sensitive data.
- CI/CD should keep logs readable by separating gates into jobs.
- Docker images should be reproducible and environment-agnostic.
- Deployments must be traceable by commit SHA, image tag, image digest, environment, and workflow run.
- The implementation should prefer minimal reusable actions over a full central pipeline abstraction.

## Risks

- Renaming web checks can temporarily break branch protection if repository settings are not updated in sync.
- Dokploy webhooks and GHCR pull credentials for the new IDP service must be configured before deploy workflows can pass.
- Docker image scanning may fail on base image CVEs that need triage or base image updates.
- Production IDP deployment before authentication exists exposes only operational endpoints, but still creates an internet-facing service that needs safe defaults.
- Required checks with path-filtered workflows can be tricky; the final GitHub branch protection behavior must be validated.

## Acceptance Criteria

- IDP CI/CD workflows exist for CI, develop deploy, staging deploy, production deploy, and rollback.
- IDP quality and security gates pass for IDP-affecting changes.
- IDP Docker image builds with a non-root runtime and runs the compiled Fastify server.
- IDP image is scanned before deployment and blocks high/critical vulnerabilities.
- IDP image is published to GHCR with commit SHA and environment alias tags.
- IDP Dokploy deploy workflows use app-scoped variables and secrets.
- IDP develop, staging, and production deployments are traceable by commit SHA and digest.
- IDP post-deploy smoke checks validate `/health` and `/ready`.
- IDP develop PR comment is sticky and includes URL, status, image, digest, smoke result, and workflow run.
- Web workflows use the shared gate naming and generic composite actions.
- Web CI/CD behavior remains functionally equivalent after migration.
- Durable docs and app AGENTS files reflect the new CI/CD conventions.
- The third IDP baby step is marked complete in `idp-architecture-discussion.md` only after implementation and verification.

## Future Enhancements

- Split security into `source_security` and `artifact_security` if checks grow.
- Add SBOM generation, provenance, and image signing if supply-chain requirements increase.
- Add remote Turborepo cache if CI duration becomes a bottleneck.
- Add isolated full-stack PR previews when backend services and routing are stable.
- Revisit a unified full-stack Dokploy stack after IDP auth, database, and proxy needs are concrete.
- Add E2E tests as non-blocking workflows, then promote them to gates when stable.

## Execution And Backlog

- Execution plan: [`docs/initiatives/tasks/09-apps-idp-cicd.md`](../tasks/09-apps-idp-cicd.md)
- IDP architecture discussion: [`../../../idp-architecture-discussion.md`](../../../idp-architecture-discussion.md)
- Existing web deployment docs: [`docs/web/deployment.md`](../../web/deployment.md)
- Global backlog: [`docs/TODO.md`](../../TODO.md)
