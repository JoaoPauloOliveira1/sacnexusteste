# Unit 4 Code Generation Plan: IDP Bootstrap Scripts

## Purpose

This plan is the single source of truth for Unit 4 Code Generation. It implements a controlled package-level tenant bootstrap command inside `apps/idp` for creating or connecting tenant organizations, tenant records, tenant domains/aliases, initial owner users, owner membership, and safe setup events.

## Unit Context

- **Unit**: Unit 4: IDP Bootstrap Scripts.
- **Primary Story**: US-04: Bootstrap Tenants, Domains, And Initial Owner Users Safely.
- **Supporting Stories**: US-01 events, US-02 Better Auth organization/membership model, US-03 tenant/domain resolution.
- **Workspace Type**: Brownfield pnpm/Turborepo monorepo.
- **Application Code Location**: `apps/idp` only.
- **Documentation Location**: `aidlc-docs/construction/unit-4-idp-bootstrap-scripts/code/`.
- **No Application Code In**: `aidlc-docs/`.

## Approved Implementation Shape

- Add one package-level script, expected shape: `pnpm --filter idp bootstrap:tenant -- --name ... --slug ... --domain ... --alias ... --owner-email ... --owner-name ... --temporary-password ...`.
- Use low-frequency single-tenant operator execution, not batch provisioning.
- Prefer built-in/minimal CLI parsing; do not add a CLI dependency by default.
- Reuse Unit 3 host normalization for primary domain and aliases.
- Reuse existing Unit 2/Unit 3 schema; do not add schema/migrations unless implementation proves unavoidable and receives separate approval.
- Use Better Auth-supported APIs for user, organization, and membership behavior where available.
- Do not reimplement Better Auth password, account, token, session, cookie, or membership internals.
- Use Drizzle only for IDP-owned tenant/domain persistence and safe read/connect checks where needed.
- Emit safe setup events through Unit 1 event abstraction where practical.
- Print strict allowlisted safe output only.
- Add automated tests with controlled dependencies; do not use real Resend, real external services, real production databases, or real `.env` files.

## Dependencies And Inputs

- Unit 1 event publication foundation is complete.
- Unit 2 Better Auth organization plugin and organization/member schema are complete.
- Unit 3 tenant/domain schema, repository, host normalization, and PBT are complete.
- Unit 4 Functional Design, NFR Requirements, and NFR Design are complete and approved.
- Better Auth v1.6.11 docs confirm server-side `auth.api.signUpEmail`, organization `createOrganization`, and server-side `addMember` payload shapes; implementation must verify exact local package types.
- Drizzle owns IDP schema and migrations; no migration is planned for this unit.

## Target Paths

### Application And Test Code

- Modify: `apps/idp/package.json`.
- Create: `apps/idp/src/scripts/bootstrap-tenant.ts`.
- Create: `apps/idp/src/bootstrap/tenant-bootstrap.ts`.
- Create: `apps/idp/src/bootstrap/tenant-bootstrap-identity.ts`.
- Create: `apps/idp/src/bootstrap/tenant-bootstrap-repository.ts`.
- Modify: `apps/idp/src/events/identity-event-registry.ts`.
- Create: `apps/idp/tests/unit/bootstrap/tenant-bootstrap.test.ts`.
- Create: `apps/idp/tests/unit/bootstrap/tenant-bootstrap-identity.test.ts` if Better Auth integration can be covered with controlled fakes without real services.
- Create: `apps/idp/tests/unit/bootstrap/tenant-bootstrap-repository.test.ts` if repository behavior can be tested with controlled Drizzle-like doubles without real PostgreSQL.
- Modify: `apps/idp/tests/unit/events/identity-event.test.ts`.

### AI-DLC Documentation

- Create: `aidlc-docs/construction/unit-4-idp-bootstrap-scripts/code/code-generation-summary.md`.

## Story Traceability

| Story | Planned Coverage |
|---|---|
| US-04 | Package-level bootstrap command, CLI parsing, validation, create/connect orchestration, tenant/domain registration, owner user handling, owner membership, safe output, rerun/conflict behavior, and tests. |
| US-01 | Safe bootstrap/setup event taxonomy and publication through Unit 1 abstraction. |
| US-02 | Better Auth organization/member API integration and public self-service organization creation remains disabled. |
| US-03 | Unit 3 host normalization reused for primary domains and aliases. |

## Step 1: Add Package Script

- [x] Modify `apps/idp/package.json` in place.
- [x] Add `bootstrap:tenant` script using `tsx src/scripts/bootstrap-tenant.ts`.
- [x] Do not add runtime or dev dependencies.
- [x] Do not modify root scripts.

## Step 2: Add Bootstrap Core Types, Parser, Validator, Orchestrator, And Safe Output Projection

- [x] Create `apps/idp/src/bootstrap/tenant-bootstrap.ts`.
- [x] Define typed CLI parse result, bootstrap request, operation result, safe failure category, and bootstrap dependency interfaces.
- [x] Implement a small testable parser for `--name`, `--slug`, `--domain`, repeatable `--alias`, `--owner-email`, `--owner-name`, and `--temporary-password`.
- [x] Keep parser pure: no env reads, DB calls, Better Auth calls, event publication, logging, printing, or mutation.
- [x] Validate required inputs before mutation where practical.
- [x] Reuse `normalizeTenantHost` from Unit 3 for primary domain and aliases.
- [x] Reject invalid domain inputs and duplicate normalized domain inputs.
- [x] Implement orchestration over injected identity, tenant/domain persistence, event publisher, and clock dependencies.
- [x] Implement idempotent created/reused/already-satisfied result classification.
- [x] Implement conflict-safe failures with generic categories.
- [x] Implement safe output projector that never includes owner email, owner name, temporary password, raw domains, normalized hosts, internal IDs, database URLs, tokens, cookies, session IDs, SQL, stack traces, raw errors, full records, or Better Auth responses.

## Step 3: Add Better Auth Identity Integration Boundary

- [x] Create `apps/idp/src/bootstrap/tenant-bootstrap-identity.ts`.
- [x] Define a small identity integration interface for create/connect owner user, create/connect organization, and assign/confirm owner membership.
- [x] Use local Better Auth API types and compile-time checks to confirm supported methods for `signUpEmail`, `createOrganization`, and `addMember` or their actual v1.6.11 exported names.
- [x] Use `auth.api.signUpEmail` for new owner user creation with provided temporary password when absent.
- [x] Use Better Auth organization/member APIs for organization creation and owner membership where available.
- [x] If Better Auth's supported API shape requires owner user creation before organization creation, adjust only the internal operation order while preserving the approved safety properties.
- [x] Do not write directly to Better Auth password/account/session/token/cookie internals.
- [x] Do not log, print, emit, or return raw Better Auth responses.
- [x] If the local Better Auth package lacks a supported API required for owner membership assignment, stop before direct table writes and ask for approval.

## Step 4: Add Tenant/Domain Persistence Boundary

- [x] Create `apps/idp/src/bootstrap/tenant-bootstrap-repository.ts`.
- [x] Reuse existing `Database` and Drizzle schema exports.
- [x] Implement create/connect tenant linked to Better Auth organization ID.
- [x] Implement create/connect primary domain and aliases using normalized host values and existing Unit 3 domain status/type constants.
- [x] Use UUID v7 for new IDP-owned tenant/domain IDs.
- [x] Use transaction-backed rollback for related IDP-owned mutations where feasible.
- [x] Detect conflicts when an existing normalized host belongs to another tenant.
- [x] Do not add new schema or generate a migration.
- [x] Do not store business profile data.
- [x] Do not use raw SQL by default.

## Step 5: Add CLI Entrypoint Wiring

- [x] Create `apps/idp/src/scripts/bootstrap-tenant.ts`.
- [x] Parse process args through the pure parser.
- [x] Load existing environment configuration through `env`/existing config behavior.
- [x] Create the existing database client with `createDatabaseClient`.
- [x] Create Better Auth instance through existing `createAuth` configuration.
- [x] Wire real identity integration, tenant/domain persistence, no-op identity event publisher, and stdout/stderr output sink.
- [x] Close database client in success and failure paths.
- [x] Set process exit code based on safe projected result.
- [x] Do not print raw env, database URL, password, owner email, domain values, internal IDs, SQL, raw errors, or stack traces.

## Step 6: Extend Safe Event Taxonomy

- [x] Modify `apps/idp/src/events/identity-event-registry.ts` in place.
- [x] Add bootstrap event names and operation labels for started/completed/failed and concrete setup operations where needed.
- [x] Reuse existing allowed payload fields; do not add owner email, domains, normalized hosts, password, SQL, raw errors, or internal record fields.
- [x] Add safe reason code values only if needed for generic bootstrap categories.

## Step 7: Add Bootstrap Core Tests

- [x] Create `apps/idp/tests/unit/bootstrap/tenant-bootstrap.test.ts`.
- [x] Test parser success for required flags and repeatable aliases.
- [x] Test parser/validator failures for missing inputs, invalid domains, and duplicate normalized domain inputs.
- [x] Test orchestration success for new tenant setup using controlled fakes.
- [x] Test idempotent rerun for matching existing state.
- [x] Test conflict failure for a normalized host linked to another tenant.
- [x] Test existing owner user reuse and already-satisfied owner membership.
- [x] Test owner membership failure does not produce success output.
- [x] Test safe output redaction against forbidden values including owner email, temporary password, raw domain, normalized host, internal IDs, SQL-like strings, connection strings, tokens, cookies, and stack-like strings.

## Step 8: Add Identity And Persistence Boundary Tests Where Practical

- [x] Create `apps/idp/tests/unit/bootstrap/tenant-bootstrap-identity.test.ts` if the identity boundary can be tested with a fake auth object and no real Better Auth/Resend/database side effects.
- [x] Create `apps/idp/tests/unit/bootstrap/tenant-bootstrap-repository.test.ts` if repository behavior can be tested with controlled Drizzle-like doubles without a real PostgreSQL lifecycle.
- [x] Otherwise cover boundary contracts through orchestrator tests and document why additional boundary tests are not practical without over-mocking.
- [x] Do not add real PostgreSQL, real Resend, or real external service tests.
- [x] Do not read real `.env` files in tests.

## Step 9: Update Event Registry Tests

- [x] Modify `apps/idp/tests/unit/events/identity-event.test.ts`.
- [x] Assert bootstrap event names and operation labels are present.
- [x] Assert allowed payload fields remain safe and do not include forbidden bootstrap fields.

## Step 10: Check Documentation Needs And Create Code Generation Summary

- [x] Create `aidlc-docs/construction/unit-4-idp-bootstrap-scripts/code/code-generation-summary.md`.
- [x] Summarize modified files, created files, and verification results.
- [x] State whether `apps/idp/README.md`, `docs/idp`, `idp-architecture-discussion.md`, or `docs/TODO.md` require updates now or are deferred to Unit 5.
- [x] Document command shape, safe output policy, rerun behavior, event behavior, Better Auth API usage, and any implementation constraints discovered.
- [x] Include Security Compliance and PBT Compliance summaries.

## Step 11: Code Generation Verification

- [x] Confirm no duplicate brownfield files were created.
- [x] Confirm no `.env` files were read, printed, modified, or summarized.
- [x] Confirm no new dependencies were added.
- [x] Confirm no new schema or migration was generated unless separately approved.
- [x] Run `pnpm --filter idp test`.
- [x] Run `pnpm --filter idp typecheck`.
- [x] Run `pnpm --filter idp check`.
- [x] Record verification results in the code generation summary.

## Security Compliance For This Plan

- **SECURITY-03**: Compliant. Safe output/event projection and redaction tests are planned.
- **SECURITY-05**: Compliant. CLI validation before mutation is planned.
- **SECURITY-08**: Compliant. Bootstrap remains privileged package-level tooling only.
- **SECURITY-09**: Compliant. Generic failure projection and no raw error output are planned.
- **SECURITY-10**: Compliant. No new dependency is planned.
- **SECURITY-11**: Compliant. Rerun, conflict, duplicate domain, invalid input, and output misuse tests are planned.
- **SECURITY-12**: Compliant. Better Auth credential/session/token/cookie internals are not reimplemented.
- **SECURITY-13**: Compliant. Tenant/domain integrity and safe setup events are planned.
- **SECURITY-15**: Compliant. Invalid input, conflicts, and partial failures fail safely.

## PBT Compliance For This Plan

- **PBT-01**: Compliant. Property-bearing areas were evaluated in Functional/NFR design and carried into code planning.
- **PBT-02**: N/A unless implementation introduces round-trip CLI formatting.
- **PBT-03/PBT-04**: Conditional. Code generation should avoid new custom pure sanitization/idempotency helpers beyond example-tested logic; if meaningful pure helpers emerge, revisit PBT before completing implementation.
- **PBT-05**: N/A. No oracle/reference model is planned.
- **PBT-06**: N/A. Bootstrap orchestration will use example tests rather than state-machine PBT.
- **PBT-07/PBT-08**: Conditional only if new PBT is introduced.
- **PBT-09**: Compliant. Existing `fast-check` remains available from Unit 3.
- **PBT-10**: Compliant. Example-based tests are mandatory for critical bootstrap behavior.

## Approval Question

How should AI-DLC proceed with Unit 4 Code Generation?

A) Approve this Code Generation plan and proceed with implementation
B) Request changes to this Code Generation plan
C) Other (please describe after [Answer]: tag below)

[Answer]: A
