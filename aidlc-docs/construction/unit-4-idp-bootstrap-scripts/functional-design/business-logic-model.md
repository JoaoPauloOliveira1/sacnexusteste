# Business Logic Model: Unit 4 IDP Bootstrap Scripts

## Purpose

Unit 4 adds a controlled operational bootstrap capability for tenant setup inside `apps/idp`. The bootstrap command creates or connects the institutional organization, tenant metadata, tenant domains and aliases, initial owner user, owner membership, and safe setup events without enabling public self-service tenant creation.

## Business Capability

The IDP must let a platform operator provision a tenant repeatably through one app-level command while preserving Better Auth ownership boundaries, tenant/domain integrity, safe output, and fail-safe behavior for invalid input or conflicts.

## Command Model

### Command Shape

The initial bootstrap interface is a single package-level command owned by `apps/idp`.

Example command shape:

```bash
pnpm --filter idp bootstrap:tenant -- --name ... --slug ... --domain ... --alias ... --owner-email ... --owner-name ... --temporary-password ...
```

The exact flag names may be finalized during code generation, but the command must support these business inputs:

- Tenant or organization display name.
- Stable organization slug when required by Better Auth organization creation.
- One primary tenant domain.
- Zero or more tenant domain aliases.
- Initial owner name.
- Initial owner email.
- Temporary password for new owner user creation.

### Operational Scope

The command is operational/server-side tooling only. Unit 4 does not add public HTTP endpoints, UI flows, invitation flows, or self-service organization creation.

## Core Workflow

1. Operator runs the app-level bootstrap command with required flags.
2. Command loads existing IDP configuration and centralized environment validation.
3. Command parses and validates all required inputs before mutation where practical.
4. Primary domain and aliases are normalized using the Unit 3 host normalization model.
5. Bootstrap emits or simulates a safe `started` setup event.
6. Bootstrap creates or connects the Better Auth organization.
7. Bootstrap creates or connects the IDP tenant record linked to the organization.
8. Bootstrap creates or connects the primary tenant domain and alias records.
9. Bootstrap creates the Better Auth owner user when absent, using the provided temporary password through Better Auth password handling.
10. Bootstrap reuses an existing owner user when the owner email already exists and assignment is safe.
11. Bootstrap assigns owner membership using supported Better Auth organization/member APIs.
12. Bootstrap emits safe setup events for concrete operations performed.
13. Bootstrap prints safe high-level output only.
14. Bootstrap emits or simulates a safe `completed` setup event on success or a safe `failed` event on failure.

## Connect-Or-Create Model

### Idempotent Rerun Intent

Rerunning the command with the same intended state must be safe. Exact matching existing records are reused, missing records are created, and conflicting records fail safely.

### Reuse Conditions

Existing records may be reused when the record matches the requested intended state:

- Existing organization can be reused when it is the same intended organization and does not conflict with the requested tenant identity.
- Existing tenant can be reused when it links to the intended organization and has a compatible status.
- Existing domain can be reused when the normalized host is already linked to the intended tenant with compatible domain type and status.
- Existing owner user can be reused when the owner email maps to an existing Better Auth user and owner membership assignment is safe.
- Existing owner membership can be treated as already satisfied when the user already has owner membership for the intended organization.

### Conflict Conditions

Bootstrap must fail safely when a record exists but conflicts with the intended state:

- Requested normalized domain belongs to a different tenant.
- Existing tenant links to a different organization than requested.
- Existing organization identity conflicts with the requested tenant identity.
- Existing owner user cannot be safely assigned to the target organization.
- Required organization/member operation cannot be completed through supported Better Auth APIs.

## Owner User Model

### New Owner User

When the owner email is absent, bootstrap creates a Better Auth user using the provided owner name, owner email, and temporary password. Password hashing, credential storage, and account internals remain Better Auth responsibilities.

### Existing Owner User

When the owner email already exists, bootstrap reuses the Better Auth user and assigns owner membership when safe. Unit 4 does not create duplicate users for the same owner email.

### Temporary Password Handling

Temporary password is required for new owner user creation. The command must never print, log, store, echo, emit, or include the temporary password outside Better Auth-supported credential handling.

## Tenant Domain Model

Primary domain and aliases use the Unit 3 host normalization rules. Only normalized hosts are persisted as tenant-domain lookup keys. Raw CLI domain inputs are not printed or emitted in events.

## Failure Model

### Validation Failure

Invalid input fails before mutation where practical. Failures produce safe output and do not grant owner access.

### Partial Failure

Bootstrap should execute related database mutations in a transaction where feasible. If a transaction boundary cannot cover a Better Auth operation, the command must order operations to minimize unsafe partial state and must fail without partially granting owner access.

### Safe Error Projection

Failures printed to the operator use safe operation-level labels and generic failure categories. They must not include SQL, stack traces, connection strings, internal IDs, raw emails, passwords, tokens, request bodies, response bodies, or raw host inputs.

## Output Model

The command prints high-level operational results only. Allowed output categories include:

- Bootstrap started/completed/failed labels.
- Created/reused/skipped flags by operation category.
- Safe validation failure category.
- Safe instruction to check server logs without exposing sensitive details.

The command must not print:

- Owner email.
- Temporary password.
- Database URL or connection string.
- Tokens, cookies, session IDs, reset URLs, verification URLs, or auth responses.
- Raw domain input or raw host input.
- Internal user IDs, organization IDs, tenant IDs, member IDs, or domain record IDs.
- SQL statements, SQL parameters, stack traces, or raw database errors.

## Event Flow

Unit 4 uses the Unit 1 event abstraction for safe setup events where concrete operations occur. Events are no-PII/no-secret and include operation labels, outcome, and safe non-sensitive classification only.

### Reserved Event Intent

- Bootstrap started.
- Bootstrap completed.
- Bootstrap failed.
- Organization created or connected.
- Tenant configured.
- Tenant domain configured.
- Tenant alias configured.
- Owner user created or connected.
- Owner membership assigned or already satisfied.

Event names may be finalized during code generation through the existing Unit 1 taxonomy registry, but payload safety is mandatory.

## Existing Flow Interaction

Unit 4 does not change citizen signup, sign-in, session, password reset, password change, sign-out, email verification, or public tenant status endpoint behavior. It provides the operational setup path those flows can rely on in later approved work.

## Testable Properties

### Rerun Safety

- **Category**: Idempotency.
- **Property**: Running bootstrap against the same intended existing state does not create duplicate organizations, tenants, domains, users, or owner memberships.

### Conflict Safety

- **Category**: Invariant.
- **Property**: A normalized domain already owned by another tenant never becomes reassigned implicitly by bootstrap.

### Output Safety

- **Category**: Invariant.
- **Property**: Bootstrap output never includes forbidden secret, credential, PII, raw host, internal identifier, SQL, or token fields.

### Validation Before Mutation

- **Category**: Safety invariant.
- **Property**: Invalid required inputs fail before owner membership is granted.

### Host Normalization Reuse

- **Category**: Reuse constraint.
- **Property**: Domain inputs use Unit 3 host normalization; Unit 4 should avoid new property-bearing host parsing behavior unless PBT ownership is revisited.

## Security Compliance

- **SECURITY-03**: Compliant. Output and events exclude secrets, raw credentials, raw emails, raw hosts, tokens, session IDs, and connection strings.
- **SECURITY-05**: Compliant. Required CLI inputs are validated before mutation where practical.
- **SECURITY-08**: Compliant. Tenant setup and owner assignment are operational/server-side only and do not enable public self-service creation.
- **SECURITY-09**: Compliant. Error projection is generic and does not expose internals.
- **SECURITY-11**: Compliant. Misuse cases include unsafe reruns, duplicate domains, conflicting organizations, and partial owner assignment.
- **SECURITY-12**: Compliant. Better Auth owns password, user, organization, and membership internals.
- **SECURITY-13**: Compliant. Tenant/domain linkage and owner assignment preserve integrity and emit safe setup events.
- **SECURITY-15**: Compliant. Invalid input and conflicts fail safely without granting partial owner access.

## PBT Compliance

- **PBT-01**: Compliant. Functional Design identifies property-bearing areas and constraints.
- **PBT-03**: Applicable only if Unit 4 adds custom pure parsing, normalization, or sanitization helpers beyond existing Unit 3 and Unit 1 helpers.
- **PBT-04**: Applicable to pure idempotency or normalization helpers if introduced during code generation.
- **PBT-10**: Compliant. Example-based tests remain required for bootstrap success, rerun, conflict, invalid input, and safe output scenarios.
