# NFR Design Patterns: Unit 4 IDP Bootstrap Scripts

## Overview

Unit 4 NFR Design applies explicit, minimal patterns for a low-frequency operational bootstrap command. The design favors validation-before-mutation, safe operation ordering, idempotent reruns, strict output/event projection, dependency injection for testability, and reuse of existing IDP schema, Better Auth APIs, Unit 1 events, and Unit 3 host normalization.

## Resilience Patterns

### Validation Before Mutation

- **Pattern**: Parse and validate CLI inputs before any database or Better Auth mutation where practical.
- **Applies To**: Required flags, owner inputs, primary domain, aliases, duplicate normalized domains, and unsupported host shapes.
- **Rejected Pattern**: Begin mutation and validate later.
- **Rationale**: Invalid input must not grant owner access or create partial tenant state.

### Safe Operation Ordering

- **Pattern**: Order operations to avoid partial owner access and make reruns safe.
- **Expected Order**: Validate request, create/connect organization, create/connect tenant, create/connect domains, create/connect owner user, assign owner membership, emit completion event, project safe output.
- **Constraint**: If implementation discovers a safer order because of Better Auth API requirements, it must preserve no partial owner access on invalid input or conflicts.

### Transaction For IDP-Owned Mutations

- **Pattern**: Use a database transaction for related IDP-owned tenant/domain mutations where feasible.
- **Applies To**: Tenant record creation/connection and tenant domain/alias creation/connection.
- **Boundary**: Better Auth calls may not participate in the same transaction and must be isolated behind integration boundaries.

### Idempotent Rerun Classification

- **Pattern**: Classify existing matching state as reused or already satisfied.
- **Applies To**: Organization, tenant, primary domain, aliases, owner user, and owner membership.
- **Rejected Pattern**: Delete-and-recreate or create duplicates on rerun.
- **Rationale**: Operators must be able to rerun matching state safely after normal completion or recoverable partial failure.

### Conflict Fails Safely

- **Pattern**: Conflicting existing state returns a safe failure category and stops unsafe mutation.
- **Examples**: Domain linked to another tenant, tenant linked to another organization, incompatible domain status, unsupported member assignment state.
- **Output Constraint**: Conflict output must not include actual domain, email, IDs, SQL, or raw error details.

## Better Auth Boundary Patterns

### Identity Integration Boundary

- **Pattern**: Encapsulate Better Auth-supported user, organization, and membership operations behind a small integration interface.
- **Applies To**: Create/connect organization, create/connect owner user, assign/check owner membership.
- **Rejected Pattern**: Direct command access to Better Auth credential/member internals.
- **Rationale**: Preserves Better Auth ownership and keeps tests deterministic through test doubles.

### Non-Atomic Boundary Classification

- **Pattern**: Treat failures around Better Auth operations as safe classified outcomes that can support rerun when matching state exists.
- **Applies To**: User creation, organization creation, owner membership assignment.
- **Rejected Pattern**: Assume all Better Auth and IDP database changes are atomically committed together.

## Security Patterns

### Strict Output Projector

- **Pattern**: A dedicated safe output projector maps internal bootstrap results and errors to allowlisted operation categories and outcome flags.
- **Allowed Output**: Operation categories, `created`, `reused`, `already_satisfied`, `skipped`, `completed`, `failed`, and safe failure categories.
- **Forbidden Output**: Owner email, owner name, temporary password, raw domains, normalized hosts, internal IDs, DB URL, tokens, cookies, session IDs, reset/verification URLs, SQL, stack traces, raw errors, full records.
- **Rejected Pattern**: Printing internal service return values directly.

### No Verbose Sensitive Mode

- **Pattern**: Do not design a `--verbose` mode that exposes records, IDs, emails, domains, or raw errors.
- **Rationale**: Safety must not depend on operator choosing a safe verbosity level.

### Safe Setup Events

- **Pattern**: Emit setup events through the Unit 1 event abstraction from the orchestration boundary.
- **Allowed Event Data**: Safe operation label, outcome, and generic failure category.
- **Forbidden Event Data**: Owner email, owner name, password, raw domains, normalized hosts, internal IDs, SQL, stack traces, tokens, cookies, session IDs, request bodies, response bodies, full records.
- **Rejected Pattern**: Detailed audit-like event payloads in Unit 4.

### Secret Handling

- **Pattern**: Temporary password is consumed only for Better Auth-supported new owner user creation.
- **Constraints**: Never print, log, emit, persist outside Better Auth credential handling, or include in test fixture snapshots.

## Scalability And Performance Patterns

### Single-Tenant Command Invocation

- **Pattern**: One command invocation provisions one tenant intended state.
- **Rejected Pattern**: Multi-tenant batch processing.
- **Rationale**: Correctness and safety matter more than throughput for initial operational setup.

### No Queue, Cache, Or Distributed Lock By Default

- **Pattern**: Avoid queue workers, caches, and distributed locks in Unit 4.
- **Rationale**: Existing database constraints and safe conflict handling are sufficient for low-frequency operator usage.
- **Conditional**: If implementation discovers a real concurrent race that cannot fail safely with constraints, it requires explicit approval before adding complexity.

### Few-Seconds Execution Expectation

- **Pattern**: Keep command execution straightforward and synchronous.
- **Rationale**: Completing in a few seconds under normal local/database conditions is acceptable; no strict SLA is required.

## CLI Parsing Patterns

### Small Testable Parser

- **Pattern**: Use built-in Node APIs or minimal manual parsing to turn `argv` into a typed parse result.
- **Constraints**: Parser must not read environment variables, open database connections, call Better Auth, emit events, print output, or mutate state.
- **Rejected Pattern**: Parsing directly inside the bootstrap service.
- **Dependency Policy**: Do not add Commander/Yargs by default.

### Typed Validation Boundary

- **Pattern**: Separate syntactic parsing from bootstrap request validation.
- **Rationale**: Parser tests can stay small while request validation can reuse Unit 3 host normalization and domain duplicate checks.

## Testability Patterns

### Dependency Injection For Orchestration

- **Pattern**: Bootstrap orchestration accepts dependencies for database/tenant persistence, identity integration, event publisher, and output sink where practical.
- **Rejected Pattern**: Hard-coded process globals and real service singletons in all logic.
- **Rationale**: Tests must cover failure paths, safe output, and rerun behavior without real external services or production databases.

### Test Doubles For Integration Boundaries

- **Pattern**: Use test doubles for Better Auth integration, tenant/domain persistence, event publication, and output sinks.
- **Rationale**: Security-sensitive behavior must be deterministic and fast to test.

### Example Tests First

- **Pattern**: Use example-based tests for bootstrap orchestration, output redaction, conflict behavior, invalid input failure, and idempotent reruns.
- **PBT Boundary**: Add PBT only if new custom pure parsing, sanitization, or idempotency helpers are introduced.

## Documentation Pattern

### Deferred Durable Documentation With Explicit Obligation

- **Pattern**: Defer exact durable docs edits to Code Generation or Unit 5, while requiring implementation summaries to record command behavior, safe output policy, rerun behavior, and smoke test guidance.
- **Rationale**: Unit 5 owns documentation finalization, but Unit 4 introduces operational knowledge that must not be lost.

## Explicitly Excluded Patterns

- Batch provisioning.
- Queue-backed provisioning.
- Process-local or external cache.
- Distributed lock by default.
- Rollback/delete command.
- Durable audit database or worker.
- Verbose sensitive output.
- Raw SQL mutation strategy.
- Direct Better Auth table/member/credential internals.
- New CLI dependency by default.
- Real production database tests.

## Security Compliance

- **SECURITY-03**: Compliant. Strict output projector and safe setup events prevent sensitive logging/output/event leakage.
- **SECURITY-05**: Compliant. Validation-before-mutation and typed validation boundary are explicit patterns.
- **SECURITY-08**: Compliant. Bootstrap remains privileged operational tooling only.
- **SECURITY-09**: Compliant. Safe output projection prevents raw internal error exposure.
- **SECURITY-10**: Compliant. No new dependency is selected by default.
- **SECURITY-11**: Compliant. Misuse cases are handled by conflict failure, rerun classification, and testable boundaries.
- **SECURITY-12**: Compliant. Better Auth internals remain behind supported integration APIs.
- **SECURITY-13**: Compliant. Tenant/domain integrity and safe event traceability are preserved.
- **SECURITY-15**: Compliant. Invalid input, conflicts, and partial failures fail safely.

## PBT Compliance

- **PBT-01**: Compliant. Property-bearing areas remain identified.
- **PBT-03/PBT-04**: Conditional. Applies if custom pure parsing, sanitization, or idempotency helpers are introduced.
- **PBT-08**: Conditional. Applies if conditional PBT is added.
- **PBT-10**: Compliant. Example-based tests remain required for critical bootstrap behavior.
