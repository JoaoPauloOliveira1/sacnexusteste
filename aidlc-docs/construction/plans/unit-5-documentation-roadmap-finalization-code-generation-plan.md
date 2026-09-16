# Unit 5 Code Generation Plan: Documentation And Roadmap Finalization

## Purpose

This plan is the single source of truth for Unit 5 Code Generation. It updates durable IDP documentation and roadmap/backlog state after Units 1 through 4 have been implemented and verified. This unit is documentation-only and must not add runtime behavior, dependencies, schema, migrations, deployment tooling, or production pipeline execution.

## Unit Context

- **Unit**: Unit 5: Documentation And Roadmap Finalization.
- **Primary Story Coverage**: Cross-story documentation coverage for US-01, US-02, US-03, and US-04.
- **Workspace Type**: Brownfield pnpm/Turborepo monorepo.
- **Application Code Location**: No application code changes planned.
- **Durable Documentation Locations**: `apps/idp/README.md`, `docs/idp/*`, `idp-architecture-discussion.md`, and `docs/TODO.md` if needed.
- **AI-DLC Documentation Location**: `aidlc-docs/construction/unit-5-documentation-roadmap-finalization/code/`.
- **No Runtime Code In**: `aidlc-docs/`.

## Approved Documentation Shape

- Update `apps/idp/README.md` for operational quick-start content, command usage, and smoke checks.
- Update `docs/idp/*` for long-form architecture, security, testing, and deployment assumptions.
- Update `idp-architecture-discussion.md` roadmap checklist only where Units 1 through 4 provide implementation and verification evidence.
- Update `docs/TODO.md` only for actionable deferred work not already captured elsewhere.
- Use synthetic-only examples with `.test` domains, `example.test` emails, and `REPLACE_*` placeholders.
- Preserve known gaps, especially invitation flow, admin UI/API/plugin, persistent audit worker/outbox/queue/event bus, FastAPI integration, frontend integration, and production rate limiting.
- Do not claim current Unit 1 events are durable audit records.
- Do not claim Unit 4 bootstrap orchestration is property-tested.
- Do not add markdown tooling, dependencies, schema changes, migrations, code behavior, or deployment artifacts.

## Dependencies And Inputs

- Unit 1 Event Publication Foundation is complete and verified.
- Unit 2 Better Auth Organization And Membership Model is complete and verified.
- Unit 3 Tenant Domain And Alias Resolution is complete and verified.
- Unit 4 IDP Bootstrap Scripts is complete and verified.
- Unit 5 Functional Design, NFR Requirements, and NFR Design are complete and approved.
- Security Baseline is enabled in full/blocking mode.
- Property-Based Testing is enabled in full/blocking mode.

## Target Paths

### Durable Documentation

- Modify: `apps/idp/README.md`.
- Modify: `docs/idp/architecture.md`.
- Modify: `docs/idp/security.md`.
- Modify: `docs/idp/testing.md`.
- Modify: `docs/idp/deployment.md` if deployment/ingress assumptions or tenant smoke checks need durable placement.
- Modify: `idp-architecture-discussion.md`.
- Modify: `docs/TODO.md` only if uncovered actionable backlog items are found.

### AI-DLC Documentation

- Create: `aidlc-docs/construction/unit-5-documentation-roadmap-finalization/code/code-generation-summary.md`.

## Story Traceability

| Story | Planned Coverage |
|---|---|
| US-01 | Document safe internal identity event abstraction, no-op current publisher, no-PII/no-secret payload boundary, and future durable audit gap. |
| US-02 | Document Better Auth organization plugin, tenant/membership ownership, public organization creation disabled, organization deletion disabled, and citizen/member separation. |
| US-03 | Document tenant/domain schema, host source selection, host normalization, `GET /tenant/status`, fail-safe response behavior, and Unit 3 PBT scope. |
| US-04 | Document `bootstrap:tenant` command, flags, safe output, rerun behavior, Better Auth API boundary, and bootstrap tests. |

## Step 1: Load Evidence And Reconfirm Documentation Targets

- [x] Read Unit 1 through Unit 4 code-generation summaries.
- [x] Read current target durable documentation files.
- [x] Confirm target files exist and should be modified in place.
- [x] Confirm no duplicate documentation files are needed.
- [x] Confirm no real `.env` files are read, printed, modified, or summarized.

## Step 2: Update `apps/idp/README.md` Operational Quick Start

- [x] Modify `apps/idp/README.md` in place.
- [x] Add or update `bootstrap:tenant` command documentation using a one-line synthetic command.
- [x] Document required flags: `--name`, `--slug`, `--domain`, `--owner-email`, `--owner-name`, and `--temporary-password`.
- [x] Document repeatable `--alias` support.
- [x] Document safe output categories without raw domains, emails, passwords, IDs, SQL, tokens, cookies, or session IDs.
- [x] Document idempotent rerun expectations for matching state and generic conflict categories for conflicting state.
- [x] Add `GET /tenant/status` to operational endpoints with synthetic `curl` smoke examples.
- [x] Add `bootstrap:tenant` to the commands list.
- [x] Keep README focused on operational quick-start rather than duplicating long-form docs.

## Step 3: Update `docs/idp/architecture.md`

- [x] Modify `docs/idp/architecture.md` in place.
- [x] Update current source structure to include `src/events`, tenant routes/use cases, tenant-domain repository, and bootstrap modules.
- [x] Document the Unit 1 event abstraction as safe and currently non-durable/no-op by default.
- [x] Document Better Auth organization plugin ownership for organization/member/invitation tables.
- [x] Document IDP-owned tenant/domain tables and linkage to Better Auth organization IDs.
- [x] Document tenant resolution from `X-Forwarded-Host` before `Host`, including the ingress/proxy sanitization assumption.
- [x] Document `GET /tenant/status` as a safe public diagnostic endpoint.
- [x] Document bootstrap tooling boundaries and Better Auth official API boundary.
- [x] Preserve business API/FastAPI integration as future contract work, not current implementation.

## Step 4: Update `docs/idp/security.md`

- [x] Modify `docs/idp/security.md` in place.
- [x] Document no-PII/no-secret identity event payload boundaries.
- [x] Document generic public error behavior and no raw SQL/error exposure.
- [x] Document Better Auth organization/member/credential/session/cookie/token internals remain Better Auth-owned.
- [x] Document tenant/domain fail-safe behavior for malformed, unknown, pending, disabled, and conflicting states.
- [x] Document bootstrap safe output/event policy and shell-history caution for temporary passwords.
- [x] Document `X-Forwarded-Host` trust depends on sanitized ingress/proxy configuration.
- [x] Preserve production rate limiting as a known gap/future work where appropriate.

## Step 5: Update `docs/idp/testing.md`

- [x] Modify `docs/idp/testing.md` in place.
- [x] Document Unit 3 `fast-check` property-based tests for host normalization invariants and idempotence.
- [x] State that PBT complements example-based route/use-case tests.
- [x] Do not claim Unit 4 bootstrap orchestration is property-tested.
- [x] Document Unit 4 example-based tests for parser, validation, safe output redaction, idempotent rerun, conflict handling, and membership failure.
- [x] Document manual smoke-test guidance for tenant status and bootstrap using synthetic values.
- [x] Document that unit tests avoid real PostgreSQL, Better Auth storage, Resend, external services, and real `.env` reads.
- [x] Add documentation verification checklist expectations for forbidden sensitive values.

## Step 6: Update `docs/idp/deployment.md` If Needed

- [x] Modify `docs/idp/deployment.md` in place only for durable deployment/ingress assumptions and smoke-check guidance.
- [x] Document that deploy workflows apply migrations explicitly and startup does not run migrations.
- [x] Document host-forwarding requirements for tenant resolution.
- [x] Document optional tenant status smoke checks using synthetic hosts and non-sensitive response shape.
- [x] Do not invent deployment infrastructure, edge controls, or production rate limits as implemented behavior.

## Step 7: Update Roadmap And Backlog

- [x] Modify `idp-architecture-discussion.md` in place.
- [x] Mark the roadmap item for internal event publication abstraction complete only because Unit 1 verification supports it.
- [x] Mark the roadmap item for Better Auth organization plugin and tenant/membership ownership complete only because Unit 2 verification supports it.
- [x] Mark the roadmap item for tenant domain/alias resolution complete only because Unit 3 verification supports it.
- [x] Mark the roadmap item for bootstrap scripts complete only because Unit 4 verification supports it.
- [x] Keep invitation flow, admin plugin, user deactivation/ban, 2FA, Orval/client evaluation, FastAPI contract, and stronger rate limits as future work unless separately verified.
- [x] Modify `docs/TODO.md` only for uncovered actionable deferred work after comparing existing TODOs and roadmap gaps.

## Step 8: Create Code Generation Summary

- [x] Create `aidlc-docs/construction/unit-5-documentation-roadmap-finalization/code/code-generation-summary.md`.
- [x] Summarize modified durable documentation files.
- [x] Summarize roadmap and backlog updates.
- [x] Record evidence mapping from Units 1 through 4.
- [x] Record verification results.
- [x] Include documentation safety review results.
- [x] Include Security Compliance and PBT Compliance summaries.

## Step 9: Documentation-Only Verification

- [x] Confirm no runtime application code was modified.
- [x] Confirm no dependencies were added.
- [x] Confirm no schema changes or migrations were generated.
- [x] Confirm no real `.env` files were read, printed, modified, or summarized.
- [x] Run `pnpm --filter idp check` because `apps/idp/README.md` is touched.
- [x] Manually inspect changed docs for forbidden sensitive examples: real emails, CPF, CNPJ, passwords, tokens, cookies, session IDs, SQL parameters, production URLs, and production connection strings.
- [x] Confirm roadmap completion marks are backed by Units 1 through Unit 4 summaries.
- [x] Confirm known gaps remain visible.
- [x] Confirm PBT documentation is accurate and bounded.

## Security Compliance For This Plan

- **SECURITY-03**: Compliant. Safe example and forbidden-value review are planned.
- **SECURITY-09**: Compliant. Docs will reinforce generic error handling and avoid unsafe credential/raw-error guidance.
- **SECURITY-10**: Compliant. No dependency or tooling changes are planned.
- **SECURITY-11**: Compliant. Known gaps and misuse-sensitive behavior remain documented.
- **SECURITY-12**: Compliant. Better Auth boundaries remain explicit.
- **SECURITY-13**: Compliant. Events are documented as safe signals, not durable audit records.
- **SECURITY-15**: Compliant. Fail-safe tenant and bootstrap behavior will be documented accurately.

## PBT Compliance For This Plan

- **PBT-01**: Compliant. Unit 5 carries forward approved documentation-only PBT scope.
- **PBT-02 through PBT-07**: N/A. Unit 5 adds no new property-bearing code or tests.
- **PBT-08**: Conditional only if docs mention seed/shrinking behavior.
- **PBT-09**: Compliant. Docs will identify existing `fast-check` coverage from Unit 3.
- **PBT-10**: Compliant. Docs will state PBT complements example-based tests.

## Approval Question

How should AI-DLC proceed with Unit 5 Code Generation?

A) Approve this Code Generation plan and proceed with documentation updates
B) Request changes to this Code Generation plan
C) Other (please describe after [Answer]: tag below)

[Answer]: A
