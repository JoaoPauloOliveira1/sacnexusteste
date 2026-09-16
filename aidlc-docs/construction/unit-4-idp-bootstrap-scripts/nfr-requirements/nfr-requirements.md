# NFR Requirements: Unit 4 IDP Bootstrap Scripts

## Overview

Unit 4 introduces a low-frequency operational bootstrap command for provisioning tenants, domains, owner users, owner membership, and safe setup events. NFR requirements prioritize correctness, security, fail-safe behavior, idempotent reruns, deterministic testing, and minimal new technology over throughput or automation scale.

## Performance Requirements

- Bootstrap targets low-frequency operator usage, not high-throughput provisioning.
- A single tenant bootstrap should complete in a few seconds under normal local/database conditions.
- Unit 4 has no strict latency SLA.
- Performance optimizations must not weaken validation, redaction, idempotency, or Better Auth API boundaries.
- The command must not support multi-tenant batch provisioning in this unit.
- The command must not introduce caching for bootstrap state.

## Scalability Requirements

- Unit 4 supports one tenant setup per command invocation.
- Horizontal scaling, concurrent bootstrap workers, queue-backed provisioning, and high-volume automation are out of scope.
- Existing unique constraints and indexes from Unit 2 and Unit 3 must remain the primary duplicate-prevention mechanism.
- Bootstrap logic must avoid unsafe concurrent assumptions, but Unit 4 does not need a distributed lock unless implementation discovers a concrete race that cannot be handled by database constraints and safe failure.
- Rerun behavior must be safe for the same intended state.

## Availability And Reliability Requirements

- Bootstrap must prefer transaction-backed rollback for IDP-owned database mutations where feasible.
- Better Auth operations that cannot share an IDP database transaction must be ordered to minimize unsafe partial state.
- Invalid input must fail before mutation where practical.
- Partial failure must not print sensitive details or report success.
- Matching existing state must support idempotent rerun.
- Conflicting existing state must fail safely rather than mutate unrelated organization, tenant, domain, user, or membership records.
- Unit 4 does not add a rollback/delete command.
- Manual cleanup after partial failure should be exceptional, not the normal recovery path.

## Security Requirements

- Bootstrap is privileged operational tooling only and must not create public HTTP endpoints or UI flows.
- Public/self-service organization creation remains disabled.
- Command output must use a strict allowlist of operation categories and created/reused/failed flags.
- Output must not include owner email, owner name, temporary password, raw domain input, normalized hosts, internal IDs, database URLs, tokens, cookies, session IDs, reset URLs, verification URLs, SQL, stack traces, or raw errors.
- Bootstrap events must remain no-PII/no-secret and must not include owner email, domain names, normalized hosts, internal IDs, raw errors, or SQL.
- Temporary password must be accepted only for Better Auth-supported new owner user creation and must never be printed, logged, emitted, or stored outside Better Auth credential handling.
- User, password, organization, membership, token, session, cookie, and credential internals must remain Better Auth-owned.
- Unit 4 must not use raw SQL for bootstrap mutations unless an implementation constraint is discovered and explicitly approved later.
- Command tests must not read real `.env` files.

## Observability Requirements

- Bootstrap must emit or simulate safe setup events through the Unit 1 event abstraction for concrete operations where practical.
- Events must use safe operation labels and outcomes.
- Failure events must use generic failure categories only.
- Runtime logs and command output must not include raw CLI input, raw emails, passwords, normalized hosts, SQL, internal IDs, or connection strings.
- Unit 4 does not add durable audit tables, queues, outbox, event bus, dashboards, or alerting.
- Existing structured logging and generic error handling patterns remain the baseline.

## Data Integrity Requirements

- Bootstrap must reuse existing IDP database client/schema and existing Unit 2/Unit 3 data models.
- No new schema is expected unless implementation proves unavoidable and receives later approval.
- Tenant records must link to Better Auth organization IDs.
- Tenant domains must use Unit 3 normalized host behavior and existing uniqueness guarantees.
- Domains already linked to another tenant must not be reassigned implicitly.
- Owner users must not be duplicated for the same email.
- Owner membership must be assigned through supported Better Auth organization/member APIs where available.
- Delete-and-recreate behavior is not allowed for reruns.

## Testing Requirements

- Use existing Vitest-based tests for Unit 4 behavior.
- Add automated unit or integration-style tests with controlled dependencies.
- Tests must cover CLI parsing and validation behavior.
- Tests must cover safe output redaction, including absence of owner email, password, raw domains, normalized hosts, internal IDs, SQL, and connection strings.
- Tests must cover invalid input failure before owner membership is granted.
- Tests must cover idempotent rerun for matching existing state where practical.
- Tests must cover domain conflict behavior where a normalized host belongs to another tenant.
- Tests must cover no duplicate owner user creation for an existing owner email where practical.
- Tests must avoid real Resend, external services, and real production databases.
- Tests must not read real `.env` files.
- Existing `pnpm --filter idp test`, `pnpm --filter idp typecheck`, and `pnpm --filter idp check` quality gates must remain passing after code generation.

## PBT Requirements

- Unit 4 does not introduce new PBT by default if code generation reuses Unit 3 host normalization and avoids custom pure parsing, sanitization, or idempotency helpers.
- If Unit 4 introduces custom pure parsing helpers with meaningful invariants, PBT applicability must be revisited before or during code generation.
- If Unit 4 introduces custom pure output sanitization helpers, PBT should evaluate forbidden-field/value exclusion where practical.
- If Unit 4 introduces custom pure idempotency classification helpers, PBT should evaluate same-state stability where practical.
- PBT must not replace example-based tests for bootstrap orchestration, failure paths, and security-sensitive behavior.

## Maintainability Requirements

- Keep bootstrap command implementation small and app-owned under `apps/idp`.
- Keep root scripts delegating to Turborepo and avoid root-level IDP bootstrap logic.
- Prefer a minimal built-in CLI parser using Node APIs if sufficient and testable.
- Avoid adding runtime dependencies unless implementation demonstrates a concrete need.
- Keep orchestration separated from CLI transport so validation, output projection, and service behavior can be tested without spawning a real process.
- Reuse existing database schema, repositories/helpers, Unit 3 host normalization, and Unit 1 event abstraction.
- Defer durable documentation edits to Code Generation or Unit 5, but require later updates for operational command usage, safe output policy, rerun behavior, and smoke testing.

## Usability Requirements

- Operator-facing command output must be concise and safe.
- Failure output must clearly indicate the operation category that failed without exposing sensitive details.
- The command should provide enough safe status information to distinguish created, reused, already satisfied, skipped, completed, and failed operation categories.
- The command must not print secrets even for convenience or one-time display.

## Documentation Requirements

- Later implementation must evaluate updates to `apps/idp/README.md` for the package-level command and smoke-test steps.
- Later implementation must evaluate durable IDP docs for operational setup, rerun behavior, safe output policy, and event behavior.
- Unit 5 remains responsible for roadmap and durable documentation finalization across units.
- If documentation is deferred during Code Generation, the deferral must be recorded in the code-generation summary.

## Out Of Scope

- Multi-tenant batch provisioning.
- High-volume automated provisioning.
- Public HTTP endpoints or UI flows.
- Invitation flow.
- Rollback/delete command.
- New database schema by default.
- Raw SQL mutation strategy.
- Durable audit persistence, queue, outbox, event bus, dashboards, or alerting.
- New CLI dependency by default.
- Real production database tests.

## Security Compliance

- **SECURITY-03**: Compliant. Output, events, and logs use strict no-secret/no-PII/no-raw-error constraints.
- **SECURITY-05**: Compliant. CLI inputs require validation before mutation where practical.
- **SECURITY-08**: Compliant. Bootstrap remains privileged operational tooling with no public endpoint or self-service creation.
- **SECURITY-09**: Compliant. Failure output is generic and temporary passwords are never exposed.
- **SECURITY-10**: Compliant. No new dependency is selected by default; if added later, pnpm and lockfile workflow apply.
- **SECURITY-11**: Compliant. Misuse cases include duplicate domains, unsafe reruns, conflicting owners, unsafe output, and partial owner assignment.
- **SECURITY-12**: Compliant. Better Auth owns credential, user, organization, member, token, session, and cookie internals.
- **SECURITY-13**: Compliant. Tenant/domain integrity and safe setup events are required.
- **SECURITY-15**: Compliant. Invalid input, conflicts, and partial failures fail safely without granting unsafe owner access.

## PBT Compliance

- **PBT-01**: Compliant. Property-bearing areas are identified.
- **PBT-02**: N/A unless custom round-trip CLI parsing or formatting is introduced.
- **PBT-03**: Conditional. Applies if custom pure parsing, sanitization, or validation helpers are introduced.
- **PBT-04**: Conditional. Applies if custom pure idempotency or normalization helpers are introduced.
- **PBT-05**: N/A. No oracle/reference model is planned.
- **PBT-06**: N/A by default. Bootstrap orchestration is not modeled as a custom state machine for PBT in Unit 4.
- **PBT-07**: Conditional. Applies if new custom generators are needed for pure helpers.
- **PBT-08**: Applicable later if PBT is added; seed/shrinking reproducibility must be preserved.
- **PBT-09**: Already satisfied by Unit 3 adding `fast-check`; no new framework selection is required.
- **PBT-10**: Compliant. Example-based tests remain required for critical bootstrap behavior.
