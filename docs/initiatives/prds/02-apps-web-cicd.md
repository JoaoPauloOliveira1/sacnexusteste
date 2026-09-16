# Apps Web CI/CD PRD

## Overview

This document defines the CI/CD plan for `apps/web`, the first frontend application in the SAC Nexus monorepo.

The goal is to create a GitHub Actions based delivery system that validates pull requests, builds an environment-agnostic Docker image, publishes it to GHCR, deploys it through Dokploy, and keeps the setup portable enough to move away from Dokploy later.

## Product Context

`apps/web` is a Vite React SPA using TanStack Router, TanStack Query, TypeScript, Tailwind CSS v4, shadcn/ui, Biome, Vitest, and Playwright.

The repository is expected to grow into a polyglot monorepo with future API services, workers, databases, and shared packages. The web CI/CD design must start simple but avoid decisions that make future full-stack previews or service orchestration difficult.

## Goals

- Use GitHub Actions as the initial CI/CD platform.
- Protect `staging` and `main` with required checks and PR reviews.
- Run the web pipeline only when `apps/web` or root build/config files change.
- Start with basic, high-signal quality gates.
- Build and publish Docker images to GitHub Container Registry.
- Use one environment-agnostic image promoted by digest/tag between environments.
- Load public frontend configuration at runtime from `/config.json`.
- Deploy through Dokploy using Docker Compose and environment-specific webhooks.
- Deploy the latest PR targeting `staging` to the shared `develop` environment.
- Comment on PRs with develop URL, deployment status, and image reference.
- Deploy production automatically after `main` gates pass.
- Keep secrets out of frontend bundles and runtime public config.
- Establish documentation and agent instruction governance for CI/CD maintenance.

## Non-Goals

- No implementation of the real GitHub Actions workflows in this planning document.
- No E2E gate in the first CI/CD version.
- No SBOM, provenance, or image signing in the first CI/CD version.
- No remote Turborepo cache in the first CI/CD version.
- No Slack, Discord, email, or external notification integration in the first CI/CD version.
- No SemVer or formal release notes in the first CI/CD version.
- No full-stack preview orchestration until backend services exist.
- No AI automation or AI PR comments as part of the CI/CD product scope.
- No Renovate setup until the CI/CD baseline is implemented.

## Decisions

### CI/CD Platform

- Use GitHub Actions for CI and CD.
- Use GitHub Environments for `develop`, `staging`, and `production` deployment tracking.
- Use GitHub required status checks and branch protection rules for `staging` and `main`.

### Branch Flow

- Feature branches open PRs into `staging`.
- `staging` is the homologation branch and deploys to the staging environment.
- `main` is the production branch and deploys to the production environment.
- Promotion to production happens through a PR from `staging` to `main`.
- Hotfixes may target `main` only when urgent, and must be followed by a PR or cherry-pick back to `staging`.

### Merge Policy

- Use squash merge only for protected branches.
- Disable merge commits.
- Disable rebase merges.
- Delete source branches after merge.
- Use the PR title as the squash commit title.
- Use the PR body as the squash commit message.
- Keep PRs small enough that one squash commit remains understandable and revertable.

### Environments

- PRs targeting `staging` deploy to the shared `develop` environment.
- Pushes to `staging` deploy automatically to homologation.
- Pushes to `main` deploy production automatically after gates pass.

### Develop Environment

- The shared `develop` environment is updated by every PR targeting `staging`.
- `develop` is always-on and contains the latest successfully deployed PR build.
- `develop` is not isolated per PR in the first version.
- The initial develop URL is `https://dev.hermys.io`.
- Cleanup automation is not required for `develop` because the environment is reused.

### Pipeline Triggers

The web CI/CD pipeline should run for changes in:

- `apps/web/**`
- `package.json`
- `pnpm-lock.yaml` when paired with web or root manifest/config changes that can affect the web workspace.
- `pnpm-workspace.yaml`
- `turbo.json`
- `biome.json`
- `.node-version`
- `.github/workflows/**`
- Docker and deployment files that affect `apps/web`

When backend services exist, full-stack preview orchestration should be introduced as a separate evolution. The web develop pipeline should not be coupled to future backend paths before those services exist.

Changes that only add or update another app, such as `apps/idp`, should not run or deploy the web pipeline just because the monorepo lockfile changed for that app.

### Initial Quality Gates

The first required gates are:

- Biome check for formatting, linting, and import organization.
- TypeScript typecheck.
- Unit/component tests with Vitest.
- Coverage threshold of 50% for unit/component tests.
- Production build.
- Dependency audit blocking `high` and `critical` vulnerabilities.
- Docker image scan blocking `high` and `critical` vulnerabilities before deploy.

E2E tests are intentionally excluded from the first version and should be added later when the deployment surface is stable.

### Package Manager And Cache

- Use pnpm in CI.
- Use the root package manager metadata as the source of truth for pnpm version.
- Cache pnpm store in GitHub Actions.
- Cache local Turborepo artifacts where practical.
- Do not use remote Turborepo cache initially.

### Docker Image Strategy

- Build one environment-agnostic Docker image for a given commit.
- Publish images to GHCR.
- Tag images with immutable commit SHA tags.
- Also publish moving aliases for convenience, such as `develop`, `staging`, and `prod`.
- Use digest references in deployment logs, PR comments, and rollback workflows.
- Use a multi-stage Dockerfile.
- Use a small Nginx non-root runtime image for the SPA.
- Serve TanStack Router routes through SPA fallback routing.

### Runtime Configuration

- Do not bake deploy-specific public config into the image.
- Generate or provide `/config.json` at container runtime.
- Validate `/config.json` in the app with Zod before bootstrapping dependencies that need config.
- Keep `/config.json` limited to public, browser-safe values.
- Do not place secrets, tokens, private keys, or privileged URLs in `/config.json`.
- Avoid relying on build-time `VITE_*` values for deploy-specific configuration in the promoted container image.

### Dokploy Deployment Model

- Use Dokploy initially as the deployment platform.
- Use Docker Compose from the beginning, even while the stack only contains the `web` service.
- Treat Docker Compose as the path to future API, worker, database, and full-stack preview services.
- Use environment-specific Dokploy webhooks from GitHub Actions after image publication.
- Keep GHCR image references as the portability contract so the deployment target can change later.

### Domains

- Develop, staging, and production use fixed domains.
- The initial develop domain is `dev.hermys.io`.
- Per-PR wildcard preview domains are a future enhancement, not part of the first CI/CD version.

### PR Comments

The develop automation should create or update a single sticky comment per PR containing:

- Develop URL.
- Deployment status.
- Image tag and digest.
- Link to the workflow run when available.

### Security

- Use least privilege for GitHub Actions permissions.
- Use `GITHUB_TOKEN` for GHCR whenever possible.
- Use separate GitHub Environment secrets for develop, staging, and production.
- Store Dokploy webhooks or tokens as GitHub secrets.
- Do not expose secrets as frontend env vars.
- Do not store auth tokens in `localStorage`.
- Enable or require secret scanning at the repository level when available.
- Block dependency and image vulnerabilities with `high` or `critical` severity.

### Branch Protection

- Require PRs for `staging` and `main`.
- Require configured CI checks to pass.
- Require at least one review before merge.
- Prevent direct pushes and bypasses except for explicitly approved administrators if needed.
- Keep the branch protection rules aligned with the names of GitHub Actions jobs.
- Require branches to be up to date before merging.
- Require linear history.
- Disable force pushes and branch deletion for protected branches.
- Apply protection rules to administrators.

Configured required checks after the shared CI/CD naming migration:

- `staging`: `web_quality`, `web_security`, `web_deploy_develop`.
- `main`: `web_quality`, `web_security`.

### Release And Rollback

- Track production by commit SHA, image digest, and GitHub Environment deployment history.
- Do not require SemVer tags initially.
- Rollback production by manually redeploying a previous known-good image digest through a workflow.
- Revert commits remain useful for code history, but rollback should not depend on waiting for a revert PR when production is degraded.

### Documentation And Agent Guidance

- PRDs live in `docs/initiatives/prds`.
- Execution plans live in `docs/initiatives/tasks`.
- Durable frontend documentation lives in `docs/web`.
- Documentation-specific agent instructions live in `docs/AGENTS.md`.
- Frontend-specific runtime and CI/CD agent instructions live in `apps/web/AGENTS.md`.
- Root `AGENTS.md` remains the monorepo-wide source for package manager, language, documentation, and safety rules.
- Add nested `AGENTS.md` files only when a folder has meaningful local rules that differ from parent instructions.

## Functional Requirements

- A PR targeting `staging` must run the web quality gates when relevant paths change.
- A PR targeting `staging` must build, scan, publish, and deploy a develop image when gates pass.
- A develop deployment must update a sticky PR comment with URL, status, and image reference.
- A push to `staging` must deploy the staging environment automatically after gates pass.
- A push to `main` must deploy production automatically after gates pass.
- Production deploys must be traceable to commit SHA and image digest.
- A manual rollback workflow must accept a previously published image digest.

## Non-Functional Requirements

- CI should fail fast on formatting, linting, type, test, build, dependency, and image scan failures.
- CI should avoid running for unrelated monorepo paths.
- The Docker image should be small, reproducible, and free of build-time tooling in the runtime stage.
- The deployment model should be portable beyond Dokploy.
- Secrets must remain outside the frontend bundle and public runtime config.
- The develop model intentionally allows the latest successful PR deployment to overwrite the shared environment.

## Risks

- The shared develop domain requires DNS ownership and Dokploy routing validation.
- Dokploy webhook/API behavior must be validated before implementation.
- Docker Compose domain labels may require redeploys for routing changes.
- Runtime config via `/config.json` changes the app boot flow and must be designed carefully.
- A 50% coverage threshold can create pressure for low-value tests if not reviewed pragmatically.
- Image vulnerability scanners can fail on base image CVEs that need triage rather than immediate code changes.

## Acceptance Criteria

- The CI/CD implementation has GitHub Actions workflows for PR checks, image publishing, develop deploys, staging deploys, production deploys, and rollback.
- `staging` and `main` are protected with required checks and reviews.
- The repository allows only squash merges into protected branches.
- The develop environment is updated by PRs targeting `staging`.
- The PR comment includes develop URL, status, image tag, and digest.
- The app image can be promoted across environments without rebuilding for deploy-specific public config.
- Production deploys run automatically after `main` gates pass.
- High and critical dependency or image vulnerabilities block deployment.
- Documentation and agent instructions explain how to maintain the CI/CD setup.

## Future Enhancements

- Add E2E tests as a non-blocking workflow, then promote them to a gate when stable.
- Add SBOM generation, provenance, and optional keyless signing.
- Add remote Turborepo cache if CI time becomes a bottleneck.
- Add isolated full-stack preview orchestration when backend services exist.
- Add Renovate after the CI baseline is stable.
- Add release notes or SemVer if product release management requires it.
- Add Slack or Discord notifications if GitHub-only visibility becomes insufficient.

## Execution And Backlog

- Execution plan: [`docs/initiatives/tasks/02-apps-web-cicd.md`](../tasks/02-apps-web-cicd.md)
- Related frontend initialization PRD: [`docs/initiatives/prds/01-apps-web-initialization.md`](./01-apps-web-initialization.md)
- Global backlog: [`docs/TODO.md`](../../TODO.md)

## Open Questions

- What are the final production and staging domains?
- Which Dokploy webhook/API contract will be used for deploy?
- How will Dokploy authenticate GHCR pulls in each environment?
- Which exact scanner will be used for Docker image vulnerabilities?
- Which public keys belong in `/config.json` for the first real deployment?
