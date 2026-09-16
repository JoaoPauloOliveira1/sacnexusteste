# Business Logic Model: Unit 3 Tenant Domain And Alias Resolution

## Purpose

Unit 3 adds tenant context resolution from the original request host. The IDP resolves a request host into an active tenant using IDP-owned tenant metadata and tenant domain/alias records. Resolution is deterministic, safe for public diagnostics, and fail-closed for tenant-bound operations.

## Business Capability

The IDP must determine whether an incoming request host maps to an active institutional tenant without relying on hardcoded host maps, mutable organization slugs, or frontend-only routing assumptions.

## Core Workflow

1. A request reaches the IDP with `X-Forwarded-Host` and/or `Host` headers.
2. The IDP selects the source host by preferring `X-Forwarded-Host` when present, otherwise falling back to `Host`.
3. Trusted infrastructure is expected to sanitize forwarded headers before the request reaches the IDP.
4. The selected host is normalized into a lookup key.
5. Malformed, ambiguous, unsupported, unknown, pending, or disabled hosts resolve to an unavailable tenant result.
6. Active domain records linked to active tenant records resolve to an active tenant context.
7. The public status endpoint exposes only safe generic availability information.
8. Existing citizen auth flows remain unchanged in Unit 3 and are not forced to require active tenant context until later units explicitly bind operations to tenant context.

## Host Source Strategy

### Selected Source Order

- Use `X-Forwarded-Host` when present.
- Use `Host` only when `X-Forwarded-Host` is absent.

### Trust Boundary

The IDP assumes deployed ingress/proxy infrastructure strips untrusted forwarded-host headers and forwards only a sanitized original host. If an environment cannot guarantee this boundary, it must not enable trusted forwarded-host behavior without a later NFR/infrastructure design.

### Ambiguity Handling

If the selected host source is empty, has multiple ambiguous values, or cannot be normalized, resolution returns unavailable and tenant-bound operations fail closed.

## Host Normalization Model

### Normalization Steps

1. Trim surrounding whitespace.
2. Reject values containing schemes, paths, query strings, fragments, credentials, or control characters.
3. Lowercase the hostname.
4. Remove one trailing dot when present.
5. Remove a valid port when present.
6. Reject invalid ports, malformed hostnames, empty labels, labels exceeding DNS limits, or hosts exceeding DNS length limits.
7. Return a normalized host lookup key.

### Supported Host Shape

- DNS-style hostnames are supported.
- Dedicated domains such as `sacnexuspe.com` are supported.
- Subdomain patterns such as `pe.sacnexus.com.br` are supported by registering the concrete normalized host.
- IP literals, localhost-only names, wildcard hosts, URL strings, and path-bearing inputs are not tenant lookup keys in Unit 3.

## Tenant Resolution Model

### Active Resolution

Resolution succeeds only when all conditions are true:

- Host source is present and unambiguous.
- Host normalizes successfully.
- Exactly one tenant domain record exists for the normalized host.
- Tenant domain status is `active`.
- Tenant status is `active`.
- Tenant record links to a Better Auth organization ID.

### Unavailable Resolution

Resolution returns unavailable when:

- Host is absent, malformed, ambiguous, unknown, pending, or disabled.
- Tenant domain is pending or disabled.
- Tenant is pending or disabled.
- Required tenant/domain linkage is missing or inconsistent.

Unavailable resolution must not expose the internal reason to public endpoint consumers.

## Tenant Status Endpoint Model

Unit 3 adds a public tenant status/resolution capability for safe diagnostics.

### Public Response Shape

The public endpoint returns safe generic availability information only.

For active tenant context:

```json
{ "tenant_status": "available" }
```

For unknown, malformed, pending, disabled, or otherwise unavailable context:

```json
{ "tenant_status": "unavailable" }
```

### Excluded Public Fields

The endpoint must not return:

- Tenant IDs.
- Organization IDs.
- Domain or alias names.
- Internal reason codes.
- SQL/database details.
- Raw host header values.
- Request headers.
- Business-sensitive tenant profile data.

## Existing Auth Flow Interaction

Unit 3 designs tenant resolution and the public status endpoint only. Existing citizen sign-up, sign-in, session, password reset, password change, sign-out, and email verification flows remain unchanged until a later approved unit explicitly binds them to tenant context.

## Event Flow

Unit 3 reserves safe event taxonomy for tenant/domain operations:

- `identity.tenant.resolved`
- `identity.tenant.resolution_failed`
- `identity.tenant.domain_configured`

Events are emitted only for concrete operations introduced in Unit 3. The design does not emit an event for every public status endpoint call by default.

Event payloads must follow Unit 1 allowlisting and must not include raw host headers, emails, request bodies, response bodies, cookies, tokens, session IDs, tenant profile data, or raw database records.

## Testable Properties

### Host Normalization Idempotence

- **Category**: Idempotence.
- **Property**: Normalizing an already normalized valid host yields the same normalized host.
- **Shape**: `normalize(normalize(host)) = normalize(host)` for valid host inputs.

### Valid-Case Stability

- **Category**: Invariant.
- **Property**: Supported case variants and a single trailing-dot variant of the same valid hostname resolve to the same lookup key.
- **Shape**: `Example.COM` and `example.com.` normalize to `example.com`.

### Invalid-Host Rejection

- **Category**: Invariant.
- **Property**: Invalid generated hosts never produce a lookup key.
- **Examples**: Empty labels, schemes, paths, invalid ports, control characters, overlong labels, and overlong hostnames.

### Lookup-Key Uniqueness Assumption

- **Category**: Invariant.
- **Property**: Domain registry lookups rely on a unique normalized host key. Duplicate normalized host configuration is invalid regardless of tenant or status.

## Security Compliance

- **SECURITY-05**: Compliant. Host inputs require explicit validation and malformed values are rejected.
- **SECURITY-08**: Compliant. Tenant-bound operations fail closed when tenant context is unavailable; Unit 3 does not add privileged tenant mutation endpoints.
- **SECURITY-09**: Compliant. Public status responses expose only generic availability.
- **SECURITY-11**: Compliant. Misuse cases include spoofed forwarded hosts, malformed hosts, duplicate aliases, and disabled tenants/domains.
- **SECURITY-13**: Compliant. Unique normalized host keys and stable organization linkage preserve data integrity.
- **SECURITY-15**: Compliant. Ambiguous or invalid tenant context fails safely.

## PBT Compliance

- **PBT-01**: Compliant. Testable properties are identified for host normalization and lookup keys.
- **PBT-03**: Applicable. Host invariants and status behavior must be tested.
- **PBT-04**: Applicable. Host normalization idempotence must be tested.
- **PBT-07**: Applicable. Domain-specific host generators are required in code generation.
- **PBT-08**: Applicable later. Seed/shrinking reproducibility must be included in build/test instructions.
- **PBT-10**: Compliant. PBT complements, not replaces, example-based tenant resolver tests.
