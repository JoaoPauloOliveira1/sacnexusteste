# NFR Requirements: Unit 3 Tenant Domain And Alias Resolution

## Overview

Unit 3 resolves tenant context from request host information using IDP-owned tenant and domain registry data. NFR requirements focus on deterministic host normalization, safe public diagnostics, explicit schema and migration ownership, PBT coverage for pure normalization logic, and minimal operational complexity.

## Performance Requirements

- Tenant resolver logic should remain synchronous and fast under normal service conditions.
- Runtime resolution should perform one normalized-host lookup and avoid extra lookups where possible.
- Unit 3 does not define a strict P95 latency SLO beyond existing IDP service quality gates.
- Unit 3 must not add custom in-memory, Redis, or secondary-storage caching for tenant/domain lookup.
- Host normalization must be pure and inexpensive enough to run per request where needed.
- Public tenant status endpoint should return a small response with no tenant enrichment.

## Scalability Requirements

- `normalized_host` must be globally unique and indexed.
- Tenant-domain foreign keys must be indexed for expected joins and lookup paths.
- Tenant-to-organization linkage must be indexed where joins are expected.
- Domain aliases use one row per normalized host, not JSON/array storage.
- Caching is deferred until measured need appears.
- Duplicate normalized host records must be rejected at schema/configuration level.

## Availability And Reliability Requirements

- Unknown, malformed, ambiguous, pending, disabled, or inconsistent tenant context resolves as unavailable.
- Normal resolution cases return generic `available` or `unavailable` public results.
- Internal failures continue through existing generic error handling and safe canonical logs.
- Existing citizen auth flows must remain available and unchanged in Unit 3.
- Unit 3 must not require real PostgreSQL integration tests or external service dependencies.
- Migration execution remains explicit and is not performed at app startup.

## Security Requirements

- Public tenant status endpoint must be explicitly public and must expose only generic availability.
- Public responses must not include tenant IDs, organization IDs, domain names, aliases, raw host headers, reason codes, request headers, SQL details, or internal errors.
- Host input validation must reject schemes, paths, query strings, fragments, credentials, control characters, invalid ports, empty labels, overlong labels, and overlong hostnames.
- `X-Forwarded-Host` trust is an ingress/proxy sanitization assumption documented for deployment; Unit 3 does not add IDP-managed proxy IP allowlisting.
- Raw host values and normalized hosts must not be logged by default.
- Tenant/domain event payloads must remain no-PII/no-secret and must not include raw hosts, headers, raw database records, tenant profile data, tokens, cookies, or session IDs.
- Public endpoint abuse/rate limiting is documented as a gap for later infrastructure/edge design; Unit 3 does not add custom in-memory or distributed rate limiting.

## Observability Requirements

- Preserve existing canonical request-completion logging.
- Do not add runtime logs for every public tenant status lookup.
- Reserve safe event names for tenant/domain operations, but emit only for concrete operations introduced by Unit 3.
- Do not add durable audit persistence, queue, outbox, or event bus in Unit 3.
- Safe internal logs may classify generic resolver/database failures without exposing raw host values or tenant identifiers by default.

## Schema And Migration Requirements

- Unit 3 owns IDP tenant metadata schema and tenant domain/alias lookup schema.
- Tenant metadata must link to `idp_organization.id` from Unit 2.
- Domain records must store one normalized host per row with a unique index.
- Tenant and domain statuses must support `active`, `pending`, and `disabled`.
- Domain type must support `primary` and `alias`.
- Generated Drizzle migrations must be committed and reviewable under `apps/idp/drizzle`.
- Unit 3 must not modify Better Auth organization/member plugin internals.
- Unit 3 must not add business profile data such as CPF, CNPJ, address, phone, process, company, or technical-responsible data.

## Testing Requirements

- Use existing Vitest for example-based unit and route tests.
- Add `fast-check` as an IDP dev dependency during Code Generation to satisfy PBT-09.
- Use PBT only for pure host normalization and lookup-key functions.
- Use example-based tests for resolver behavior, repository/database boundary behavior, route response behavior, and status combinations.
- Use mocked repository/database boundaries for resolver tests.
- Add schema/migration tests for tenant and domain table presence, indexes, and Unit 2 linkage.
- Do not introduce real PostgreSQL lifecycle integration tests in Unit 3.
- Test `X-Forwarded-Host` preference over `Host` and `Host` fallback.
- Test safe public responses for active, unknown, malformed, pending, disabled, and inconsistent linkage scenarios.

## PBT Requirements

- `fast-check` must be selected as the TypeScript/Vitest-compatible PBT framework.
- PBT must cover host normalization idempotence.
- PBT must cover supported valid-case stability, including case variants and single trailing-dot variants.
- PBT must cover invalid-host rejection for generated invalid hosts.
- PBT must cover normalized lookup-key uniqueness assumptions for equivalent host variants.
- PBT generators must produce domain-shaped host inputs, not only unconstrained primitive strings.
- PBT must preserve shrinking and seed-based reproducibility.
- PBT must complement example-based tests and must not replace concrete resolver and route regression tests.

## Maintainability Requirements

- Keep host normalization as a small pure function to support PBT and reuse.
- Keep tenant resolution separate from Fastify route transport concerns.
- Keep repository/database access behind a small boundary that unit tests can mock.
- Keep public endpoint schemas explicit and `snake_case`.
- Keep Unit 3 backend-only; no frontend changes are introduced.
- Defer durable README, roadmap, and `docs/idp` updates to Unit 5, while requiring Unit 3 code-generation summary to document resolver behavior, PBT, trust-boundary assumptions, and rate-limit gaps.

## Rate Limiting Requirement

Unit 3 relies on existing platform, Better Auth, and service-level controls. The public tenant status endpoint's remaining custom rate-limit gap must be documented for later infrastructure or edge design rather than solved with local in-memory rate limiting.

## Out Of Scope

- Custom caching.
- Redis or secondary storage.
- IDP-managed trusted proxy IP allowlisting.
- Real PostgreSQL integration test lifecycle.
- Detailed public reason codes.
- Tenant binding for existing citizen auth flows.
- Durable audit persistence.
- Logs for every public status lookup.
- Custom in-memory or distributed rate limiting.
- Frontend integration.

## Security Compliance

- **SECURITY-03**: Compliant. Logging remains structured and avoids raw hosts, request headers, tenant IDs, organization IDs, and business-sensitive data by default.
- **SECURITY-05**: Compliant. Host validation and endpoint response constraints are explicit.
- **SECURITY-08**: Compliant. Tenant-bound behavior fails closed and public endpoint exposure is explicit.
- **SECURITY-09**: Compliant. Public responses remain generic and internal failures use existing safe error handling.
- **SECURITY-10**: Compliant with planned `fast-check` addition through pnpm and lockfile during Code Generation.
- **SECURITY-11**: Compliant. Misuse cases include header spoofing, duplicate aliases, disabled tenants/domains, and endpoint abuse.
- **SECURITY-13**: Compliant. Unique normalized hosts and reviewable migrations preserve integrity.
- **SECURITY-15**: Compliant. Malformed inputs and internal failures fail safely.

## PBT Compliance

- **PBT-01**: Already satisfied in Functional Design through host normalization and lookup-key property identification.
- **PBT-02**: N/A. No round-trip transformation is planned.
- **PBT-03**: Applicable. Host normalization invariants must be tested.
- **PBT-04**: Applicable. Host normalization idempotence must be tested.
- **PBT-05**: N/A. No oracle/reference model is required.
- **PBT-06**: N/A. No custom stateful model is introduced in Unit 3.
- **PBT-07**: Applicable. Domain-shaped host generators are required.
- **PBT-08**: Applicable in Build and Test. Seed/shrinking reproducibility must be preserved.
- **PBT-09**: Compliant. `fast-check` is selected for TypeScript/Vitest PBT.
- **PBT-10**: Compliant. PBT complements example-based resolver and route tests.
