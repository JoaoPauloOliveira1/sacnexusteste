# Logical Components: Unit 3 Tenant Domain And Alias Resolution

## Overview

Unit 3 logical components separate pure host processing, tenant resolution, database access, route projection, schema/migration mapping, and PBT support. The design keeps the resolver testable without real PostgreSQL and avoids cache, queue, durable audit, and proxy allowlist components.

## Component Summary

| Component | Responsibility | Runtime I/O | Unit 3 Status |
|---|---|---:|---|
| Host Source Selector | Select `X-Forwarded-Host` or `Host` | No | Required |
| Host Normalizer | Convert selected host to normalized lookup key or reject | No | Required |
| Tenant Domain Repository Boundary | Look up tenant/domain data by normalized host | Database | Required |
| Tenant Resolver Use Case | Coordinate source, normalization, lookup, and status projection | Repository only | Required |
| Public Tenant Status Route | Expose safe `tenant_status` response | HTTP | Required |
| Tenant Schema Mapping | Define tenant and tenant-domain tables/indexes | No runtime I/O | Required |
| Drizzle Migration Artifacts | Reviewable SQL schema changes | Operational only | Required |
| PBT Host Generators | Generate valid variants and invalid host shapes | No | Required |
| Example Test Fixtures | Pin concrete resolver/route/status scenarios | No | Required |

## Host Source Selector

### Responsibility

Select the candidate original host from request headers.

### Behavior

- Prefer `X-Forwarded-Host` when present.
- Fall back to `Host` only when `X-Forwarded-Host` is absent.
- Treat empty or ambiguous selected values as unavailable input.

### NFR Contribution

- **Security**: Makes forwarded-host trust explicit.
- **Maintainability**: Keeps header-source policy outside route and resolver internals.
- **Testing**: Enables example tests for source precedence and fallback.

## Host Normalizer

### Responsibility

Normalize a selected host into a lookup key or reject it.

### Behavior

- Trim surrounding whitespace.
- Reject schemes, paths, query strings, fragments, credentials, and control characters.
- Lowercase hostname.
- Remove one trailing dot.
- Remove valid port.
- Reject invalid ports, empty labels, overlong labels, and overlong hostnames.

### NFR Contribution

- **Performance**: Pure and inexpensive per-request logic.
- **Security**: Rejects malformed and ambiguous input safely.
- **PBT**: Primary target for idempotence and invariant properties.

## Tenant Domain Repository Boundary

### Responsibility

Look up tenant/domain state by normalized host.

### Behavior

- Query by unique `normalized_host`.
- Return only data needed by the resolver.
- Hide database/Drizzle details from route handlers.

### NFR Contribution

- **Scalability**: Uses indexed lookup path.
- **Reliability**: Mockable boundary avoids real DB lifecycle in unit tests.
- **Maintainability**: Keeps database access outside transport logic.

## Tenant Resolver Use Case

### Responsibility

Coordinate host source selection, normalization, repository lookup, tenant/domain status evaluation, and internal resolution result.

### Internal Results

- `available` when normalized host maps to an active domain and active tenant.
- `unavailable` for missing, malformed, unknown, pending, disabled, ambiguous, or inconsistent context.

### NFR Contribution

- **Resilience**: Fail-closed unavailable result for normal unavailable cases.
- **Security**: Does not leak internal reasons to public projection.
- **Testing**: Example tests cover status combinations and repository failures.

## Public Tenant Status Route

### Responsibility

Expose safe tenant availability diagnostics over HTTP.

### Public Response

```json
{ "tenant_status": "available" }
```

or:

```json
{ "tenant_status": "unavailable" }
```

### NFR Contribution

- **Security**: No public reason codes or identifiers.
- **Performance**: Minimal response payload.
- **Maintainability**: Explicit route schema and OpenAPI metadata.

## Tenant Schema Mapping

### Responsibility

Define Unit 3-owned tenant and tenant-domain tables.

### Required Schema Characteristics

- IDP-prefixed table names.
- Tenant row linked to `idp_organization.id`.
- One tenant-domain row per normalized host.
- Global unique index on `normalized_host`.
- Indexed foreign keys.
- Status constants covered by app-level tests.

### NFR Contribution

- **Integrity**: Prevents duplicate host ambiguity.
- **Scalability**: Supports efficient lookup and joins.
- **Security**: Avoids mutable slug/name linkage.

## Drizzle Migration Artifacts

### Responsibility

Persist schema changes as reviewable SQL under `apps/idp/drizzle`.

### Behavior

- Generated during Code Generation after schema edits.
- Applied only through explicit migration execution, not app startup.

### NFR Contribution

- **Reliability**: Controlled schema rollout.
- **Security**: Reviewable data-integrity changes.

## PBT Host Generators

### Responsibility

Provide reusable `fast-check` generators for host normalization properties.

### Generator Types

- Valid DNS host generator.
- Supported variant generator for case, trailing dot, and valid port variants.
- Invalid host generator for schemes, paths, empty labels, invalid ports, control characters, overlong labels, and overlong hostnames.

### NFR Contribution

- **PBT-07**: Domain-specific structured inputs.
- **PBT-08**: Supports shrinking/reproducibility through `fast-check`.
- **PBT-10**: Complements concrete example tests.

## Example Test Fixtures

### Responsibility

Pin concrete business-critical behavior.

### Coverage

- `X-Forwarded-Host` precedence over `Host`.
- `Host` fallback.
- Active tenant/domain available result.
- Pending, disabled, unknown, malformed, and inconsistent unavailable results.
- Public response generic shape.
- Schema mapping and index expectations.

## Explicitly Excluded Components

- Process-local LRU cache.
- Redis or secondary-storage cache.
- Proxy IP allowlist component.
- Durable audit table or worker.
- Queue, outbox, or event bus.
- Per-lookup logging component.
- Custom in-memory or distributed rate limiter.
- Real PostgreSQL integration test lifecycle.
- Frontend tenant resolver client.

## Component Interaction

1. Public route receives a request.
2. Host Source Selector chooses `X-Forwarded-Host` or `Host`.
3. Host Normalizer returns a normalized host key or rejection.
4. Tenant Resolver returns unavailable immediately for invalid host input.
5. Tenant Resolver queries Tenant Domain Repository for valid normalized hosts.
6. Repository returns tenant/domain state or not found.
7. Tenant Resolver evaluates tenant/domain status and linkage.
8. Public route projects result to `tenant_status: available|unavailable`.
9. Existing global error handling covers unexpected failures.

## Security Compliance

- **SECURITY-03**: Compliant. Component design avoids raw host logging and per-lookup logs.
- **SECURITY-05**: Compliant. Host validation and response schemas are explicit components.
- **SECURITY-08**: Compliant. Resolver fails closed before tenant-bound behavior can proceed.
- **SECURITY-09**: Compliant. Public route projects only generic status.
- **SECURITY-10**: Compliant by dependency workflow. `fast-check` addition is deferred to approved Code Generation.
- **SECURITY-11**: Compliant. Misuse cases are mapped to selector, normalizer, resolver, and schema components.
- **SECURITY-13**: Compliant. Schema component enforces unique lookup keys.
- **SECURITY-15**: Compliant. Invalid inputs return unavailable and unexpected failures use global handling.

## PBT Compliance

- **PBT-07**: Compliant. PBT Host Generators are domain-specific and reusable.
- **PBT-08**: Compliant. `fast-check` shrinking and seed reproducibility remain enabled and CI-included.
- **PBT-10**: Compliant. Example Test Fixtures remain required for business-critical scenarios.
