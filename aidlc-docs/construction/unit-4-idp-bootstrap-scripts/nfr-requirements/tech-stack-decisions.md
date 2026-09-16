# Tech Stack Decisions: Unit 4 IDP Bootstrap Scripts

## Existing Stack Reuse

Unit 4 reuses the existing `apps/idp` backend stack:

- TypeScript for command, validation, orchestration, output projection, and tests.
- Node.js runtime for package-level command execution.
- Existing `pnpm --filter idp` package command conventions.
- Existing Drizzle/PostgreSQL schema and database client for IDP-owned tenant/domain records.
- Existing Better Auth server configuration and supported APIs for user, organization, and membership behavior.
- Existing Unit 1 event abstraction for safe setup events.
- Existing Unit 3 host normalization for tenant domain and alias validation.
- Vitest for automated behavioral tests.
- Biome and TypeScript quality gates.

## Decision 1: Low-Frequency Operational Command

- **Decision**: Design for low-frequency single-tenant operator use.
- **Rationale**: Unit 4 is controlled tenant setup tooling, not high-volume provisioning infrastructure.
- **Rejected Alternatives**: Batch provisioning, queue-backed provisioning, worker pools, and horizontal scaling are rejected for Unit 4.

## Decision 2: Package-Level Script Ownership

- **Decision**: Expose the command through an `apps/idp` package-level script such as `bootstrap:tenant`.
- **Rationale**: This matches project package ownership and keeps IDP-specific behavior inside the IDP app.
- **Rejected Alternatives**: Root-level custom script logic and external SQL/manual-only procedures are rejected.

## Decision 3: CLI Parsing Technology

- **Decision**: Prefer a minimal built-in Node parser, such as `node:util` parsing or a small testable parser, if sufficient.
- **Rationale**: The command has a bounded flag set and does not need a new runtime dependency by default.
- **Rejected Alternatives**: Adding `commander`, `yargs`, or similar dependencies is deferred until implementation proves built-in parsing insufficient.

## Decision 4: Database Access

- **Decision**: Reuse the existing IDP database client, Drizzle schema, and Unit 2/Unit 3 models.
- **Rationale**: Existing schema already owns organization-linked tenants and normalized domain lookup records.
- **Rejected Alternatives**: Bootstrap-only database client/schema layers and raw SQL mutation strategies are rejected.

## Decision 5: Better Auth Integration

- **Decision**: Use Better Auth-supported server-side APIs for user, organization, and membership operations where available.
- **Rationale**: Better Auth owns password, account, organization, member, token, session, cookie, and credential internals.
- **Rejected Alternatives**: Directly reimplementing password hashing, account linking, member internals, session handling, or token behavior is rejected.

## Decision 6: Transaction And Recovery Strategy

- **Decision**: Use transaction-backed rollback for IDP-owned database mutations where feasible and safe operation ordering around Better Auth operations.
- **Rationale**: Better Auth operations may not share the same transaction boundary, so operation ordering and idempotent reruns are required.
- **Rejected Alternatives**: Delete-and-recreate reruns, rollback/delete commands, and routine manual cleanup are rejected for Unit 4.

## Decision 7: Output Projection

- **Decision**: Implement strict allowlisted command output with operation categories and outcome flags only.
- **Rationale**: Bootstrap handles a temporary password, owner email, domains, and internal identifiers. Output must be safe by construction.
- **Rejected Alternatives**: Full JSON record dumps, printing owner email/domains, or printing internal IDs are rejected.

## Decision 8: Event Privacy

- **Decision**: Emit or simulate setup events with safe operation labels, outcomes, and generic failure categories only.
- **Rationale**: Unit 1 event abstraction is intentionally no-PII/no-secret and future-audit ready without leaking sensitive data.
- **Rejected Alternatives**: Including owner email, domain names, normalized hosts, internal IDs, raw errors, or SQL in events is rejected.

## Decision 9: Test Strategy

- **Decision**: Use automated Vitest unit/integration-style tests with controlled dependencies.
- **Rationale**: Bootstrap is security-sensitive operational tooling and requires regression coverage for validation, redaction, idempotency, conflicts, and failure behavior.
- **Rejected Alternatives**: Manual-only testing and typecheck-only verification are rejected.

## Decision 10: PBT Scope

- **Decision**: Do not add new PBT by default in Unit 4.
- **Rationale**: Unit 4 reuses Unit 3 host normalization and should avoid custom property-bearing parsing/normalization helpers where practical.
- **Conditional Requirement**: If code generation adds custom pure parsing, output sanitization, or idempotency helpers, PBT applicability must be revisited.
- **Rejected Alternatives**: PBT for database/Better Auth orchestration and disabling PBT requirements entirely are rejected.

## Decision 11: Documentation Timing

- **Decision**: Require later documentation updates for the operational command, safe output policy, rerun behavior, and smoke testing, while deferring exact durable edits to Code Generation or Unit 5.
- **Rationale**: Unit 5 owns documentation and roadmap finalization, but Unit 4 implementation changes will create durable operational knowledge.
- **Rejected Alternatives**: No documentation updates and AI-DLC-only documentation are rejected.

## Dependency Impact

- No new runtime dependency is selected by default.
- No new dev dependency is selected by default.
- No new database schema or migration is expected by default.
- If a CLI dependency or schema change becomes necessary during implementation, it requires explicit approval before code changes.
- Existing `fast-check` remains available from Unit 3 for conditional PBT needs.

## Security Compliance

- **SECURITY-03**: Existing logging/event patterns are reused with strict output and event redaction.
- **SECURITY-05**: CLI parsing and validation are explicit and testable.
- **SECURITY-08**: Package-level command remains privileged operational tooling only.
- **SECURITY-09**: Generic failure output prevents internal detail exposure.
- **SECURITY-10**: Dependency additions are avoided by default; pnpm workflow applies if later approved.
- **SECURITY-11**: Bootstrap orchestration remains isolated and misuse-tested.
- **SECURITY-12**: Better Auth boundaries are preserved.
- **SECURITY-13**: Existing tenant/domain schema and safe events preserve integrity.
- **SECURITY-15**: Transaction/retry/idempotency strategy supports safe failure behavior.

## PBT Compliance

- **PBT-01**: Property-bearing areas were assessed.
- **PBT-03/PBT-04**: Conditional for custom pure helpers only.
- **PBT-08**: Applies if conditional PBT is added.
- **PBT-09**: Existing `fast-check` selection from Unit 3 remains valid.
- **PBT-10**: Example tests are mandatory for bootstrap behavior.
