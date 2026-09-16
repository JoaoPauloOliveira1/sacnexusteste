# Apps IDP CI/CD Tasks

Execution checklist for [`docs/initiatives/prds/09-apps-idp-cicd.md`](../prds/09-apps-idp-cicd.md).

## Phase 1: Planning And Governance

- [x] Create IDP CI/CD PRD.
- [x] Create IDP CI/CD execution plan.
- [x] Review `idp-architecture-discussion.md` before implementation and keep this task scoped to the third roadmap item.
- [x] Decide that the third baby step includes complete IDP CI/CD, not only basic CI.
- [x] Decide to migrate web pipeline names and reusable setup conventions in the same baby step.
- [x] Keep Better Auth, database, Drizzle, and full-stack same-origin proxy integration out of this step.

## Phase 2: Shared Pipeline Conventions

- [x] Adopt `snake_case` job/check names in the `app_stage` format.
- [x] Use the compact taxonomy: `quality`, `security`, `package`, `deploy_<env>`, and `rollback_<env>`.
- [x] Document that future security growth may split `security` into `source_security` and `artifact_security`.
- [x] Keep workflow filenames app-scoped, such as `web-ci.yml`, `idp-ci.yml`, `idp-develop.yml`, `idp-staging.yml`, `idp-production.yml`, and `idp-rollback.yml`.
- [x] Ensure branch protection documentation is updated for renamed checks.

## Phase 3: Generic Composite Actions

- [x] Replace `.github/actions/setup-web` with a generic `.github/actions/setup-node-pnpm` action.
- [x] Ensure the generic setup action configures Node from `.node-version`.
- [x] Ensure the generic setup action enables Corepack.
- [x] Ensure the generic setup action caches the pnpm store.
- [x] Ensure the generic setup action runs `pnpm install --frozen-lockfile`.
- [x] Replace `.github/actions/detect-web-changes` with a generic `.github/actions/detect-workspace-changes` action.
- [x] Add inputs for workspace name/path and app-specific workflow patterns where needed.
- [x] Detect changes in `apps/<app>/**`.
- [x] Detect shared root files that affect JavaScript app builds, including `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `biome.json`, and `.node-version`.
- [x] Detect changes in shared pipeline actions.
- [x] Detect changes in relevant app workflow files.
- [x] Avoid marking web changed only because `apps/idp/**` changed.
- [x] Avoid marking IDP changed only because `apps/web/**` changed.

## Phase 4: Web Pipeline Migration

- [x] Rename web quality check/job to `web_quality`.
- [x] Rename web security check/job to `web_security`.
- [x] Rename web package check/job to `web_package` where packaging is a separate job.
- [x] Rename web deploy jobs to `web_deploy_develop`, `web_deploy_staging`, and `web_deploy_production`.
- [x] Rename web rollback job to `web_rollback_production`.
- [x] Update web workflows to use `.github/actions/setup-node-pnpm`.
- [x] Update web workflows to use `.github/actions/detect-workspace-changes`.
- [x] Replace direct `pnpm --filter web` quality commands with `pnpm turbo run <task> --filter=web`.
- [x] Preserve current web quality behavior: Biome check, typecheck, coverage, build.
- [x] Preserve current web dependency audit behavior.
- [x] Preserve current web Docker image scan, GHCR publishing, Dokploy deploy, PR comment, and rollback behavior.
- [x] Migrate web Dokploy secrets to app-scoped names such as `DOKPLOY_WEB_DEVELOP_WEBHOOK_URL`.
- [x] Document required external secret migration before enabling the renamed web workflows.

## Phase 5: IDP Quality Workflow

- [x] Create `.github/workflows/idp-ci.yml`.
- [x] Trigger IDP CI on PRs targeting `main`.
- [x] Keep PRs targeting `staging` covered by the IDP develop workflow to avoid duplicate required check names.
- [x] Use minimal permissions with `contents: read`.
- [x] Add concurrency that cancels stale IDP CI runs for the same branch or PR.
- [x] Use the generic workspace change detector.
- [x] Skip IDP gates when there are no IDP-affecting changes.
- [x] Add `idp_quality` job.
- [x] Run `pnpm turbo run check --filter=idp`.
- [x] Run `pnpm turbo run typecheck --filter=idp`.
- [x] Run `pnpm turbo run test:coverage --filter=idp`.
- [x] Run `pnpm turbo run build --filter=idp`.
- [x] Upload IDP coverage artifacts when useful for debugging.

## Phase 6: IDP Security Workflow

- [x] Add `idp_security` job to IDP CI.
- [x] Make `idp_security` depend on `idp_quality` unless a faster parallel split is explicitly chosen during implementation.
- [x] Run `pnpm audit --audit-level high`.
- [x] Confirm existing `pnpm-workspace.yaml` audit ignores still apply intentionally.
- [x] Ensure security logs do not print secrets or tokens.

## Phase 7: IDP Docker Runtime

- [x] Add `apps/idp/Dockerfile`.
- [x] Use a multi-stage Node build.
- [x] Build from the repository root context when needed for pnpm workspace consistency.
- [x] Install dependencies reproducibly with pnpm.
- [x] Run `pnpm turbo run build --filter=idp` or equivalent package-level build inside the Docker build.
- [x] Copy only runtime-required files into the final image.
- [x] Run the service with `node dist/server.js`.
- [x] Use a non-root runtime user.
- [x] Expose the configured IDP port.
- [x] Keep the image environment-agnostic.
- [x] Do not bake secrets into the image.
- [x] Add `apps/idp/.dockerignore` entries if needed to keep context safe and small.
- [x] Verify the image runs locally.
- [x] Verify `/health` works in the local container.
- [x] Verify `/ready` works in the local container.

## Phase 8: IDP Dokploy Compose Contract

- [x] Add `apps/idp/compose.yml` or the approved Dokploy service definition file.
- [x] Configure the IDP service to pull the GHCR image by tag or digest.
- [x] Configure the IDP service port expected by Dokploy.
- [x] Configure only safe non-secret default environment values in committed files.
- [x] Document required runtime environment variables in Dokploy.
- [x] Keep the IDP as a separate Dokploy service in this step.
- [x] Do not merge IDP and web into one full-stack stack in this step.

## Phase 9: IDP Image Packaging And Publishing

- [x] Add `idp_package` job to the IDP develop workflow.
- [x] Authenticate to GHCR with least privilege.
- [x] Generate the image name `ghcr.io/<owner>/<repo>/idp`.
- [x] Generate immutable commit SHA tags.
- [x] Generate environment aliases such as `develop`, `staging`, and `prod`.
- [x] Add OCI labels for source repository and commit SHA.
- [x] Build the IDP image with Docker Buildx.
- [x] Scan the image with Trivy or the repository-approved scanner.
- [x] Block high and critical image vulnerabilities.
- [x] Publish the image only after the scan succeeds when practical.
- [x] Resolve and expose the image digest for deploy logs and PR comments.

## Phase 10: IDP Develop Deployment

- [x] Create `.github/workflows/idp-develop.yml`.
- [x] Trigger on PRs targeting `staging` with opened, synchronized, and reopened events.
- [x] Use GitHub Environment `develop`.
- [x] Use `IDP_DEVELOP_URL` for the environment URL.
- [x] Run `idp_quality`.
- [x] Run `idp_security`.
- [x] Run `idp_package`.
- [x] Trigger Dokploy using `DOKPLOY_IDP_DEVELOP_WEBHOOK_URL` and `DOKPLOY_IDP_DEVELOP_WEBHOOK_TOKEN`.
- [x] Include environment, source, PR number, commit SHA, image tag, digest, and URL in the webhook payload.
- [x] Run smoke checks against `${IDP_DEVELOP_URL}/health` and `${IDP_DEVELOP_URL}/ready` after deploy.
- [x] Create or update one sticky PR comment with deploy status, URL, image tag, digest, smoke status, and workflow run URL.

## Phase 11: IDP Staging Deployment

- [x] Create `.github/workflows/idp-staging.yml`.
- [x] Trigger on pushes to `staging` for IDP-affecting paths.
- [x] Use GitHub Environment `staging`.
- [x] Use `IDP_STAGING_URL` for the environment URL.
- [x] Run `idp_quality`.
- [x] Run `idp_security`.
- [x] Run `idp_package`.
- [x] Trigger Dokploy using `DOKPLOY_IDP_STAGING_WEBHOOK_URL` and `DOKPLOY_IDP_STAGING_WEBHOOK_TOKEN`.
- [x] Include environment, commit SHA, image tag, and digest in the webhook payload.
- [x] Run smoke checks against `${IDP_STAGING_URL}/health` and `${IDP_STAGING_URL}/ready` after deploy.

## Phase 12: IDP Production Deployment

- [x] Create `.github/workflows/idp-production.yml`.
- [x] Trigger on pushes to `main` for IDP-affecting paths.
- [x] Use GitHub Environment `production`.
- [x] Use `IDP_PRODUCTION_URL` for the environment URL.
- [x] Run `idp_quality`.
- [x] Run `idp_security`.
- [x] Run `idp_package`.
- [x] Trigger Dokploy using `DOKPLOY_IDP_PRODUCTION_WEBHOOK_URL` and `DOKPLOY_IDP_PRODUCTION_WEBHOOK_TOKEN`.
- [x] Include environment, commit SHA, image tag, and digest in the webhook payload.
- [x] Run smoke checks against `${IDP_PRODUCTION_URL}/health` and `${IDP_PRODUCTION_URL}/ready` after deploy.

## Phase 13: IDP Production Rollback

- [x] Create `.github/workflows/idp-rollback.yml`.
- [x] Use `workflow_dispatch` with required `image_digest` input.
- [x] Use job/check name `idp_rollback_production`.
- [x] Use GitHub Environment `production`.
- [x] Trigger Dokploy using `DOKPLOY_IDP_PRODUCTION_WEBHOOK_URL` and `DOKPLOY_IDP_PRODUCTION_WEBHOOK_TOKEN`.
- [x] Include `rollback: true` and the selected digest in the webhook payload.
- [x] Run smoke checks against `${IDP_PRODUCTION_URL}/health` and `${IDP_PRODUCTION_URL}/ready` after rollback.
- [x] Document rollback steps in IDP deployment docs.

## Phase 14: Documentation And Agent Guidance

- [x] Update `apps/idp/README.md` with Docker, CI/CD, Dokploy, smoke checks, and rollback references.
- [x] Update `apps/idp/AGENTS.md` with CI/CD skills and pipeline rules.
- [x] Create `docs/idp/deployment.md` with durable IDP deployment guidance.
- [x] Update `docs/web/deployment.md` with new gate names and app-scoped secrets.
- [x] Update `apps/web/AGENTS.md` if needed for the new gate naming and generic action convention.
- [x] Update `docs/TODO.md` with deferred follow-up items when needed.
- [x] Document external setup for IDP GitHub variables and secrets.
- [x] Document external setup for IDP Dokploy service and GHCR pull access.
- [x] Document branch protection changes required by renamed web checks and new IDP checks.

## Phase 15: Verification

- [ ] Run `pnpm install` if dependency or lockfile changes occur.
- [x] Run `pnpm turbo run check --filter=idp`.
- [x] Run `pnpm turbo run typecheck --filter=idp`.
- [x] Run `pnpm turbo run test:coverage --filter=idp`.
- [x] Run `pnpm turbo run build --filter=idp`.
- [x] Run `pnpm turbo run check --filter=web` after web workflow/script-related changes if needed.
- [x] Run `pnpm turbo run typecheck --filter=web` after web workflow/script-related changes if needed.
- [x] Run `pnpm turbo run test:coverage --filter=web` after web workflow/script-related changes if needed.
- [x] Run `pnpm turbo run build --filter=web` after web workflow/script-related changes if needed.
- [x] Build the IDP Docker image locally.
- [x] Run the IDP Docker image locally.
- [x] Confirm local container `/health`.
- [x] Confirm local container `/ready`.
- [x] Validate workflow YAML syntax enough to avoid obvious GitHub Actions failures.
- [x] Confirm no workflow logs expose secrets in local or CI-visible commands.

Verification note: local Docker smoke checks passed on host port `3011` because port `3001` was already in use locally.

## Phase 16: External Verification

- [x] Configure IDP repository variables: `IDP_DEVELOP_URL`, `IDP_STAGING_URL`, and `IDP_PRODUCTION_URL`.
- [x] Configure IDP Dokploy webhook secrets for develop, staging, and production.
- [x] Configure migrated web Dokploy webhook secrets with app-scoped names.
- [x] Configure Dokploy IDP service and GHCR pull access.
- [x] Open a test PR targeting `staging` and confirm `idp_quality` and `idp_security` run for IDP changes.
- [ ] Confirm unrelated web-only changes do not run IDP deploy workflows.
- [ ] Confirm unrelated IDP-only changes do not run web deploy workflows.
- [x] Confirm IDP develop deploy succeeds from a PR.
- [x] Confirm IDP develop smoke checks pass.
- [x] Confirm IDP sticky PR comment includes URL, status, image tag, digest, smoke status, and workflow run.
- [ ] Merge an IDP change to `staging` and confirm staging deploy succeeds.
- [ ] Promote to `main` and confirm production deploy succeeds if approved for this verification cycle.
- [ ] Execute a controlled IDP production rollback test when a previous digest is available.
- [x] Update branch protection required checks to the new snake_case names.

## Phase 17: Roadmap Update

- [x] Mark the third IDP baby step complete in `idp-architecture-discussion.md` after implementation and verification.

## Phase 18: Future Enhancements

- [x] Add web post-deploy smoke checks for `/config.json` and the SPA entry route.
- [ ] Split security into `source_security` and `artifact_security` if checks grow.
- [ ] Add SBOM generation, provenance, and image signing if supply-chain requirements increase.
- [ ] Add remote Turborepo cache if CI duration becomes a bottleneck.
- [ ] Add isolated full-stack PR previews when backend services and routing are stable.
- [ ] Revisit a unified full-stack Dokploy stack after IDP auth, database, and proxy needs are concrete.
- [ ] Add E2E tests as non-blocking workflows, then promote them to gates when stable.
