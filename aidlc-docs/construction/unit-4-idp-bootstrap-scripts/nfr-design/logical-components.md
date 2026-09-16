# Logical Components: Unit 4 IDP Bootstrap Scripts

## Overview

Unit 4 logical components separate CLI parsing, request validation, bootstrap orchestration, identity integration, tenant/domain persistence, event publication, safe output projection, and test doubles. The design avoids batch infrastructure, cache, queue, rollback commands, durable audit storage, and new CLI dependencies by default.

## Component Summary

| Component | Responsibility | Runtime I/O | Unit 4 Status |
|---|---|---:|---|
| Bootstrap CLI Entrypoint | Wire process arguments, dependencies, output, and exit behavior | Process | Required |
| CLI Argument Parser | Convert argv into typed parse result | No | Required |
| Bootstrap Request Validator | Validate required fields, normalize domains, and reject duplicates/conflicts before mutation where practical | No or repository checks | Required |
| Bootstrap Orchestrator | Coordinate create/connect workflow and safe events | Integration boundaries | Required |
| Identity Integration Boundary | Wrap Better Auth-supported user, organization, and membership operations | Better Auth | Required |
| Tenant/Domain Persistence Boundary | Create/connect tenant and domain state using existing schema | Database | Required |
| Safe Event Publisher Boundary | Emit safe setup events through Unit 1 abstraction | Event publisher | Required |
| Safe Output Projector | Map internal results/errors to allowlisted operator output | No | Required |
| Output Sink | Write safe projected output | Process or test sink | Required |
| Test Doubles | Provide deterministic identity, persistence, events, and output behavior | No | Required |

## Bootstrap CLI Entrypoint

### Responsibility

Provide the package-level command entrypoint for operators.

### Behavior

- Receive `process.argv`.
- Invoke CLI Argument Parser.
- Load approved runtime configuration through existing IDP environment validation.
- Construct real dependencies for database, identity integration, event publisher, and output sink.
- Call Bootstrap Orchestrator.
- Project safe result through Safe Output Projector.
- Set success/failure exit code without printing sensitive details.

### NFR Contribution

- **Maintainability**: Keeps process-specific wiring outside business orchestration.
- **Security**: Only writes safe projected output.
- **Testability**: Most behavior can be tested without spawning a real process.

## CLI Argument Parser

### Responsibility

Turn raw command arguments into a typed parse result.

### Behavior

- Parse required flags for name, slug, primary domain, owner email, owner name, and temporary password.
- Parse optional alias flags.
- Return structured parse errors for missing or malformed flag shape.
- Do not read environment variables.
- Do not open database connections.
- Do not call Better Auth.
- Do not print or log.

### NFR Contribution

- **Maintainability**: Keeps CLI syntax isolated.
- **Security**: Avoids accidental output of raw argv.
- **Testing**: Parser can be unit-tested with plain arrays.

## Bootstrap Request Validator

### Responsibility

Validate parsed inputs and build bootstrap intent before mutation.

### Behavior

- Check required values are present and non-empty.
- Reuse Unit 3 host normalization for primary domain and aliases.
- Reject invalid domain/alias inputs.
- Reject duplicate normalized hosts within the same request.
- Keep owner email, owner name, and temporary password internal.
- Return safe validation categories for output projection.

### NFR Contribution

- **Resilience**: Prevents mutation on invalid input where practical.
- **Security**: Avoids raw input leakage.
- **PBT**: Conditional target only if custom pure validation helpers are introduced beyond Unit 3 reuse.

## Bootstrap Orchestrator

### Responsibility

Coordinate the create/connect workflow for organization, tenant, domains, owner user, owner membership, and events.

### Behavior

1. Emit safe bootstrap started event.
2. Create or connect organization through Identity Integration Boundary.
3. Create or connect tenant through Tenant/Domain Persistence Boundary.
4. Create or connect primary domain and aliases.
5. Create or connect owner user through Identity Integration Boundary.
6. Assign or confirm owner membership through Identity Integration Boundary.
7. Emit safe setup events for concrete operations.
8. Return internal operation result for safe output projection.

### NFR Contribution

- **Reliability**: Centralizes idempotent rerun and conflict behavior.
- **Security**: Prevents public self-service creation and controls owner assignment order.
- **Testability**: Can be tested with injected boundaries and test doubles.

## Identity Integration Boundary

### Responsibility

Wrap Better Auth-supported operations used by bootstrap.

### Operations

- Create or connect organization.
- Create or connect owner user.
- Assign or confirm owner membership.

### Behavior

- Use supported Better Auth server-side APIs where available.
- Do not implement password hashing, account internals, member internals, tokens, sessions, or cookies.
- Classify failures safely for the orchestrator.
- Never expose owner email, password, internal IDs, or raw Better Auth responses through output/events.

### NFR Contribution

- **Security**: Preserves Better Auth boundaries.
- **Reliability**: Makes non-atomic Better Auth failures explicit and testable.
- **Maintainability**: Keeps Better Auth coupling localized.

## Tenant/Domain Persistence Boundary

### Responsibility

Create or connect IDP-owned tenant and tenant domain records using existing schema.

### Operations

- Create/connect tenant linked to organization ID.
- Create/connect primary domain.
- Create/connect aliases.
- Detect conflicts for normalized hosts linked to other tenants.

### Behavior

- Use existing IDP database client and Drizzle schema.
- Use transaction-backed rollback for related IDP-owned mutations where feasible.
- Use normalized host values from Unit 3 normalization.
- Do not add business profile data.
- Do not use raw SQL by default.

### NFR Contribution

- **Integrity**: Preserves tenant/domain uniqueness and organization linkage.
- **Reliability**: Supports idempotent rerun and conflict detection.
- **Testing**: Can be replaced by test doubles for orchestration tests.

## Safe Event Publisher Boundary

### Responsibility

Emit setup events through the Unit 1 event abstraction.

### Event Categories

- Bootstrap started.
- Bootstrap completed.
- Bootstrap failed.
- Organization created or connected.
- Tenant configured.
- Domain configured.
- Owner user created or connected.
- Owner membership assigned or already satisfied.

### Behavior

- Include safe operation labels, outcomes, and generic failure categories only.
- Exclude owner email, owner name, temporary password, domains, normalized hosts, internal IDs, SQL, stack traces, raw errors, tokens, cookies, session IDs, request bodies, response bodies, and full records.

### NFR Contribution

- **Observability**: Provides future-audit-ready safe signals.
- **Security**: Maintains no-PII/no-secret event policy.

## Safe Output Projector

### Responsibility

Convert internal bootstrap results or errors into safe operator-facing output.

### Output Shape

Allowed output includes only operation categories and outcome flags such as:

- `bootstrap: completed` or `bootstrap: failed`.
- `organization: created` or `organization: reused`.
- `tenant: created` or `tenant: reused`.
- `domains: created`, `domains: reused`, or `domains: failed`.
- `owner_user: created` or `owner_user: reused`.
- `owner_membership: assigned` or `owner_membership: already_satisfied`.
- Safe failure category such as `validation_failed`, `conflict_detected`, or `operation_failed`.

### Forbidden Output

- Owner email.
- Owner name.
- Temporary password.
- Raw domains.
- Normalized hosts.
- Internal IDs.
- Database URLs.
- SQL, stack traces, raw errors, or SQL parameters.
- Tokens, cookies, session IDs, reset URLs, verification URLs.
- Full records or Better Auth responses.

### NFR Contribution

- **Security**: Prevents output leakage by construction.
- **Usability**: Gives operators enough safe status to understand outcome categories.
- **Testing**: Enables direct redaction tests without running a real command.

## Output Sink

### Responsibility

Write safe projected output to the operator or a test sink.

### Behavior

- Runtime sink writes only projected output.
- Test sink captures output for assertions.
- Sink does not receive internal raw results or sensitive values.

## Test Doubles

### Responsibility

Support deterministic automated tests for bootstrap behavior.

### Doubles

- Fake identity integration for Better Auth outcomes.
- Fake tenant/domain persistence for existing/missing/conflicting state.
- Fake event publisher for safe event assertions.
- Fake output sink for redaction assertions.

### Coverage

- Valid same-state rerun.
- New tenant setup.
- Invalid domain input.
- Duplicate alias input.
- Domain conflict with another tenant.
- Existing owner user reuse.
- Owner membership already satisfied.
- Owner membership failure without success output.
- Safe output/event redaction.

## Explicitly Excluded Components

- Batch provisioner.
- Queue worker.
- Cache.
- Distributed lock by default.
- Rollback/delete command.
- Durable audit database or audit worker.
- CLI framework dependency by default.
- Raw SQL mutation layer.
- Direct Better Auth table writer.
- Real production database test harness.
- Public HTTP route or frontend component.

## Component Interaction

1. Bootstrap CLI Entrypoint receives process arguments.
2. CLI Argument Parser returns typed parse result or parse failure.
3. Bootstrap Request Validator validates required values and normalizes domains through Unit 3 behavior.
4. Bootstrap Orchestrator emits safe started event.
5. Orchestrator uses Identity Integration Boundary to create/connect organization.
6. Orchestrator uses Tenant/Domain Persistence Boundary to create/connect tenant and domains.
7. Orchestrator uses Identity Integration Boundary to create/connect owner user and assign/confirm owner membership.
8. Orchestrator emits safe completed or failed events.
9. Safe Output Projector maps internal result to allowlisted output.
10. Output Sink writes projected output and the entrypoint exits with success or failure code.

## Security Compliance

- **SECURITY-03**: Compliant. Output/event components are allowlisted and exclude sensitive values.
- **SECURITY-05**: Compliant. Parser and validator components separate input validation from mutation.
- **SECURITY-08**: Compliant. Command remains operational/server-side and owner assignment is controlled.
- **SECURITY-09**: Compliant. Safe output projector prevents raw error exposure.
- **SECURITY-10**: Compliant. No new dependency is selected by default.
- **SECURITY-11**: Compliant. Misuse cases map to validator, orchestrator, persistence, identity, and test double components.
- **SECURITY-12**: Compliant. Identity Integration Boundary preserves Better Auth internals.
- **SECURITY-13**: Compliant. Persistence and event boundaries preserve integrity and traceability.
- **SECURITY-15**: Compliant. Invalid inputs, conflicts, and partial failures fail safely.

## PBT Compliance

- **PBT-01**: Compliant. Property-bearing areas remain identified.
- **PBT-03/PBT-04**: Conditional for custom pure parsing, sanitization, or idempotency helpers.
- **PBT-08**: Conditional if PBT is added.
- **PBT-10**: Compliant. Example Test Fixtures remain required for business-critical bootstrap scenarios.
