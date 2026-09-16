# Apps Web CI/CD Tasks

Execution checklist for [`docs/initiatives/prds/02-apps-web-cicd.md`](../prds/02-apps-web-cicd.md).

## Phase 1: Documentation And Agent Governance

- [x] Create CI/CD PRD in `docs/initiatives/prds/02-apps-web-cicd.md`.
- [x] Create CI/CD execution plan in `docs/initiatives/tasks/02-apps-web-cicd.md`.
- [x] Create documentation-specific agent guidance in `docs/AGENTS.md`.
- [x] Update `apps/web/AGENTS.md` with runtime config and CI/CD rules.
- [x] Add durable deployment documentation in `docs/web/deployment.md` after the first workflow implementation.
- [x] Add durable runtime config documentation in `docs/web/runtime-config.md` after the app boot flow is implemented.
- [ ] Update `docs/TODO.md` as CI/CD backlog items move from planned to completed.

## Phase 2: GitHub Actions Foundation

- [x] Create `.github/workflows/web-ci.yml` for PR quality gates targeting `main`; develop/staging/production workflows run their own gates to avoid duplicate check names.
- [x] Configure workflow triggers for `apps/web/**` and root files that affect the web build.
- [x] Use `pull_request` triggers for PRs targeting `staging` and `main`.
- [x] Use `push` triggers for `staging` and `main`.
- [x] Add concurrency groups to cancel stale runs for the same branch or PR.
- [x] Configure `actions/checkout` with safe defaults.
- [x] Configure Node.js from `.node-version`.
- [x] Enable pnpm through Corepack.
- [x] Cache pnpm store.
- [ ] Cache local Turborepo artifacts where practical.
- [x] Keep workflow permissions minimal by default.

## Phase 3: Initial Quality Gates

- [x] Run `pnpm install --frozen-lockfile` in CI.
- [x] Run Biome check through the existing package/root scripts.
- [x] Run TypeScript typecheck through the existing package/root scripts.
- [x] Run Vitest unit/component tests through the existing package/root scripts.
- [x] Configure unit/component coverage reporting.
- [x] Enforce a 50% coverage threshold.
- [x] Run the web production build.
- [x] Ensure generated TanStack Router files are produced or validated consistently in CI.
- [x] Upload test or coverage artifacts only when useful for debugging.
- [x] Keep E2E tests out of the required gate for the first version.

## Phase 4: Dependency And Secret Safety

- [x] Add dependency audit blocking `high` and `critical` severities.
- [x] Decide whether dependency audit runs in the main CI workflow or a separate security workflow.
- [ ] Document how to triage dependency audit failures.
- [ ] Confirm GitHub secret scanning is enabled or document the required repository setting.
- [x] Ensure no frontend workflow exposes secrets to PRs from untrusted forks.
- [x] Review workflow permissions for `pull_request` versus deployment events.

## Phase 5: Docker Runtime

- [x] Add a multi-stage Dockerfile for `apps/web` or the web deployment context.
- [x] Use a Node/pnpm build stage.
- [x] Use an Nginx non-root runtime stage.
- [x] Serve static Vite output from the runtime image.
- [x] Configure SPA fallback for TanStack Router routes.
- [x] Add a runtime entrypoint or equivalent mechanism to generate `/config.json`.
- [x] Ensure `/config.json` contains only public browser-safe values.
- [x] Add `.dockerignore` entries that keep the build context small and safe.
- [x] Verify the container runs locally with the expected non-root user.
- [x] Verify the container serves the app and `/config.json` locally.

## Phase 6: Runtime Config In The App

- [x] Define the public runtime config schema with Zod.
- [x] Load `/config.json` before creating dependencies that need runtime config.
- [x] Fail fast with a clear error if runtime config is invalid.
- [x] Replace deploy-specific build-time env assumptions with runtime config reads.
- [x] Keep local development env behavior compatible with Vite dev server.
- [x] Add unit tests for runtime config parsing.
- [x] Document which values are allowed in runtime config.

## Phase 7: Image Publishing

- [x] Create `.github/workflows/web-image.yml` or equivalent image publishing job.
- [x] Authenticate to GHCR with least privilege.
- [x] Generate immutable commit SHA tags.
- [x] Generate environment aliases such as `develop`, `staging`, and `prod`.
- [x] Add OCI labels for source repository, commit SHA, and build metadata.
- [x] Build the image with Docker Buildx.
- [x] Scan the image before deployment.
- [x] Block `high` and `critical` image vulnerabilities.
- [x] Publish the image to GHCR after scan succeeds.
- [x] Expose image tag and digest as workflow outputs.

## Phase 8: Dokploy And Docker Compose

- [x] Define the initial Docker Compose service for `web`.
- [x] Configure the compose service to pull the GHCR image by tag or digest.
- [x] Configure Nginx container port routing for Dokploy/Traefik.
- [x] Define compose labels or Dokploy settings for develop, production, and staging domains.
- [x] Define the shared develop service in Dokploy.
- [x] Configure Dokploy GHCR pull credentials for develop.
- [x] Create the Dokploy webhook secret for develop.
- [x] Validate Dokploy deployment from a published GHCR image in develop.

## Phase 9: Develop Automation

- [x] Create develop deployment workflow for PRs targeting `staging`.
- [x] Build, scan, and publish a develop image after quality gates pass.
- [x] Call the develop Dokploy webhook with PR number, image reference, and runtime config context.
- [x] Use the fixed develop URL `https://dev.hermys.io`.
- [x] Create or update a sticky PR comment with develop URL, status, image tag, digest, and workflow link.
- [x] Ensure develop comments are updated instead of duplicated.
- [x] Remove preview cleanup from the first version because develop is reused.

## Phase 10: Staging And Production Deployment

- [x] Create staging deployment workflow for pushes to `staging`.
- [x] Deploy staging automatically after quality gates and image scan pass.
- [x] Create production deployment workflow for pushes to `main`.
- [x] Deploy production automatically after `main` gates pass.
- [x] Record commit SHA, image tag, and digest in GitHub deployment metadata where possible.
- [ ] Confirm production deployment history is visible in GitHub Environments.
- [ ] Keep staging and production runtime config separated by environment secrets or Dokploy config.

## Phase 11: Rollback

- [x] Create a manual rollback workflow.
- [x] Accept a previous image digest as rollback input.
- [x] Require manual workflow dispatch for production rollback.
- [x] Call the production Dokploy webhook with the selected digest.
- [x] Record rollback deployments in GitHub Environment history.
- [x] Document rollback steps in `docs/web/deployment.md`.

## Phase 12: Branch Protection

- [x] Configure `staging` branch protection.
- [x] Configure `main` branch protection.
- [x] Require PR reviews for both protected branches.
- [x] Require the selected CI checks for both protected branches.
- [x] Prevent direct pushes where repository policy allows it.
- [x] Keep required check names stable and documented.
- [x] Configure squash-only repository merge policy.
- [x] Configure automatic source branch deletion after merge.
- [x] Document any administrative bypass policy if one is needed.

## Phase 13: Verification

- [ ] Open a test PR targeting `staging` and confirm quality gates run.
- [ ] Confirm unrelated monorepo path changes do not run the web pipeline.
- [x] Confirm a develop deployment is created for a PR targeting `staging`.
- [ ] Confirm the PR comment contains URL, status, image tag, and digest.
- [x] Confirm `https://dev.hermys.io/config.json` returns runtime config.
- [ ] Merge a test change to `staging` and confirm staging deploys automatically.
- [x] Promote `staging` to `main` and confirm production deploys automatically after gates pass.
- [x] Confirm production deployment succeeds.
- [ ] Execute a rollback to a previous digest in a controlled test.
- [ ] Review logs to confirm no secrets are printed.

## Phase 14: Future Enhancements

- [ ] Add E2E tests as a non-blocking workflow.
- [ ] Promote E2E tests to a required gate after they are stable.
- [ ] Add SBOM generation and artifact retention.
- [ ] Add image signing or provenance if supply-chain requirements increase.
- [ ] Add remote Turborepo cache if CI duration becomes a bottleneck.
- [ ] Add full-stack previews when backend services exist.
- [ ] Add Renovate after CI/CD gates are stable.
- [ ] Add release notes or SemVer tags if release management requires them.
- [ ] Add external notifications if GitHub-only visibility becomes insufficient.
