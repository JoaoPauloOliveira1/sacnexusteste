# NFR Design Patterns: Unit 3 Tenant Domain And Alias Resolution

## Overview

Unit 3 NFR Design applies simple, explicit patterns for safe tenant resolution. The design favors deterministic host normalization, a single indexed lookup, generic public projection, and PBT for pure normalization logic. It intentionally avoids caches, distributed infrastructure, durable audit storage, and detailed public diagnostics in this unit.

## Resilience Patterns

### Fail-Closed Resolver Result

- **Pattern**: Normal unavailable cases return an internal unavailable resolution result instead of throwing public errors.
- **Applies To**: Missing host, malformed host, ambiguous host, unknown host, pending domain, disabled domain, pending tenant, disabled tenant, or inconsistent linkage.
- **Public Projection**: Unavailable results become `{ "tenant_status": "unavailable" }`.
- **Rationale**: Tenant-bound behavior must not fail open or leak classification details.

### Existing Generic Error Handling

- **Pattern**: Internal failures continue through the existing global error handler and safe canonical logging.
- **Applies To**: Unexpected repository/database failures or unhandled runtime exceptions.
- **Rejected Pattern**: Custom public reason-code errors for every unavailable condition.
- **Rationale**: Avoids tenant enumeration and preserves the IDP-wide generic error policy.

### No Retry For Invalid Inputs

- **Pattern**: Malformed or unavailable host inputs are rejected/resolved once without retry.
- **Rejected Pattern**: Retrying lookups for malformed hosts, unknown hosts, pending domains, or disabled tenants.
- **Rationale**: Retries cannot fix deterministic invalid input and add unnecessary load.

## Scalability Patterns

### Indexed Host Lookup

- **Pattern**: Use a globally unique `normalized_host` index as the primary lookup path.
- **Applies To**: `idp_tenant_domain.normalized_host`.
- **Rationale**: One normalized host should identify at most one domain record and one tenant context.

### Indexed Relationship Joins

- **Pattern**: Index foreign keys used for expected joins.
- **Applies To**: Tenant-to-organization and tenant-domain-to-tenant relationships.
- **Rationale**: Keeps resolver queries predictable without adding cache complexity.

### No Cache Component

- **Pattern**: Defer process-local and external cache components.
- **Rejected Pattern**: LRU cache, Redis/secondary storage cache, or disabled cache abstraction.
- **Rationale**: Cache invalidation and stale tenant/domain status risks exceed the initial benefit. A unique indexed lookup is sufficient until measured need appears.

## Performance Patterns

### Pure Host Normalization

- **Pattern**: Keep host normalization pure, deterministic, and inexpensive.
- **Applies To**: Host source values before database lookup.
- **Rationale**: Supports per-request use, PBT, and reuse without I/O or framework coupling.

### Minimal Public Response

- **Pattern**: Return only the public availability projection.
- **Response Shape**: `{ "tenant_status": "available" }` or `{ "tenant_status": "unavailable" }`.
- **Rationale**: Prevents response bloat and avoids tenant enrichment or identifier leakage.

## Security Patterns

### Generic Public Projection

- **Pattern**: Project internal resolver results to `available` or `unavailable` only.
- **Applies To**: Public tenant status endpoint.
- **Rejected Pattern**: Environment-specific detailed reason codes, tenant slugs/names, organization IDs, tenant IDs, domain names, or aliases.
- **Rationale**: Avoids tenant enumeration and environment behavior drift.

### Forwarded-Host Trust Boundary

- **Pattern**: Treat `X-Forwarded-Host` as trusted only under the deployment assumption that ingress/proxy infrastructure sanitizes it.
- **Unit 3 Component Decision**: No IDP-managed proxy IP allowlist component.
- **Verification**: Tests cover source selection precedence, not infrastructure enforcement.
- **Rationale**: Preserves approved functional design while documenting the deployment trust requirement.

### No Raw Host Logging

- **Pattern**: Do not log raw host or normalized host values by default.
- **Allowed Diagnostics**: Safe classification such as unavailable/internal failure category without host values or tenant identifiers.
- **Rationale**: Hostnames can reveal tenant or business-sensitive context.

### Global Host Uniqueness

- **Pattern**: Enforce uniqueness on normalized host globally, regardless of status.
- **Rejected Pattern**: Partial active-only uniqueness or runtime active-row selection.
- **Rationale**: Duplicate pending/disabled/active rows would make future activation ambiguous and can create unsafe resolver behavior.

## Observability Patterns

### Existing Canonical Request Logging

- **Pattern**: Preserve existing request-completion logging.
- **Unit 3 Decision**: No per-lookup log event and no durable audit record for every public status call.
- **Rationale**: Avoids high-volume diagnostic logs and raw host leakage.

### Reserved Safe Event Taxonomy

- **Pattern**: Reserve tenant/domain event names for concrete operations.
- **Examples**: `identity.tenant.resolved`, `identity.tenant.resolution_failed`, `identity.tenant.domain_configured`.
- **Constraint**: Events must not include raw hosts, headers, tenant profile data, raw database records, tokens, cookies, or session IDs.

## Rate-Limit Pattern

### Documented Public Endpoint Gap

- **Pattern**: Do not add a Unit 3 custom rate limiter.
- **Rejected Pattern**: In-memory per-process limiter or Redis-backed distributed limiter.
- **Rationale**: Rate limiting should be solved at a later infrastructure/edge layer or through a broader IDP policy. Unit 3 documents the gap in the code-generation summary.

## PBT Patterns

### Domain-Specific Generators

- **Pattern**: Use reusable `fast-check` generators for valid DNS hosts, supported variants, and invalid host shapes.
- **Generator Constraints**: Bounded label lengths, bounded total hostname length, valid label characters, optional supported ports, case variants, and single trailing-dot variants.
- **Rejected Pattern**: Raw arbitrary strings only with broad filtering.
- **Rationale**: Domain-shaped generators exercise meaningful cases and satisfy PBT-07.

### Shrinking And Seed Reproducibility

- **Pattern**: Keep `fast-check` shrinking enabled and make failures reproducible through seed output.
- **Constraint**: Do not skip PBT in CI and do not disable shrinking.
- **Rationale**: Satisfies PBT-08 and makes failures actionable.

### PBT Plus Examples

- **Pattern**: PBT covers pure normalization properties; example tests cover concrete resolver, repository, route, status, and schema behavior.
- **Rationale**: PBT complements, not replaces, business-critical examples.

## Security Compliance

- **SECURITY-03**: Compliant. No raw host or identifier logging by default.
- **SECURITY-05**: Compliant. Explicit host validation and endpoint schemas are preserved.
- **SECURITY-08**: Compliant. Tenant-bound behavior fails closed.
- **SECURITY-09**: Compliant. Public responses remain generic.
- **SECURITY-10**: Compliant by design. `fast-check` must be added through pnpm and lockfile workflow during Code Generation.
- **SECURITY-11**: Compliant. Spoofed headers, duplicate aliases, endpoint abuse, and disabled statuses are covered.
- **SECURITY-13**: Compliant. Unique lookup keys and reviewable migrations preserve integrity.
- **SECURITY-15**: Compliant. Malformed input and internal failure behavior remain safe.

## PBT Compliance

- **PBT-07**: Compliant. Domain-specific host generators are required.
- **PBT-08**: Compliant. Shrinking and seed reproducibility are required.
- **PBT-10**: Compliant. Example tests remain required for critical behavior.
