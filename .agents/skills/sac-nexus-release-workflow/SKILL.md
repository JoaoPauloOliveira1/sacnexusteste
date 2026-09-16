---
name: sac-nexus-release-workflow
description: Validate, promote, deploy, or roll back SAC Nexus changes across staging and main using the repository GitHub Actions and Dokploy contracts. Use for production promotion PRs, deployment readiness, environment checks, image-digest promotion, rollback, or distinguishing a code release from application deployment.
---

# SAC Nexus Release Workflow

Write user-facing analysis in Brazilian Portuguese and technical artifacts in
English. The repository currently promotes deployable code; it does not define
a versioned tag or GitHub Release publication process.

## Sources Of Truth

Read root and app `AGENTS.md`, deployment workflows under `.github/workflows`,
shared actions under `.github/actions`, app deployment docs, Compose files,
Dockerfiles, and the PR template. Never retrieve or print secret values.

Use `sac-nexus-preflight-review` before a release or deployment mutation.

## Promotion Workflow

1. Confirm a clean tree, branch/upstream, the exact `main...staging` diff, and
   successful relevant staging workflows.
2. Classify the action: feature preview, staging deploy, production promotion,
   production deploy, or rollback.
3. Confirm affected-app detection, quality/security/package gates, immutable
   image digest, required GitHub Environment names, Dokploy inputs, smoke-check
   expectations, and migration impact.
4. Promote production only from `staging` to `main`. Use protected-branch merge
   policy and omit the feature Codex review trigger.
5. Treat merge, image publication, migration, Dokploy deployment, smoke check,
   and rollback as separate observable stages.
6. For IDP, require forward-compatible migration reasoning; application
   rollback does not reverse database migrations.
7. Roll back through the explicit workflow and approved image digest. Do not
   rewrite history or assume database rollback.

## Safety And Handoff

Do not change environment configuration, create credentials, merge, deploy, or
roll back without explicit authorization. Never bypass failed gates.

Report readiness, blockers, affected apps, action type, configuration names
present or missing, migration/rollback risk, workflow or PR links, deployed
digests when known, smoke-check results, and final branch synchronization.
