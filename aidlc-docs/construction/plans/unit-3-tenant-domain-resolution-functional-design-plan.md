# Unit 3 Functional Design Plan: Tenant Domain And Alias Resolution

## Purpose

This plan prepares Functional Design for Unit 3. Unit 3 resolves tenant context from the original request host using IDP-owned tenant metadata and tenant domain/alias lookup schema, with fail-closed behavior and primary PBT coverage for host normalization.

## Unit Context

- **Unit**: Unit 3: Tenant Domain And Alias Resolution.
- **Primary Story**: US-03: Resolve Tenant Context From The Original Request Host.
- **Supporting Story**: US-01 tenant/domain event taxonomy where applicable.
- **Primary Components**: Tenant Registry, Tenant Domain Registry, Tenant Resolver, Tenant Status Endpoint.
- **Primary Code Locations Later**: `apps/idp/src/database/schema.ts`, `apps/idp/drizzle`, `apps/idp/src/usecases/identity` or `apps/idp/src/identity`, `apps/idp/src/entrypoint/routes`, `apps/idp/tests`.
- **Functional Design Artifacts Later**: `aidlc-docs/construction/unit-3-tenant-domain-resolution/functional-design/`.

## Design Inputs

- Unit 1 event abstraction is complete.
- Unit 2 Better Auth organization schema and migration are complete and approved.
- Unit 3 owns tenant metadata, tenant domain/alias lookup schema, tenant resolver, and tenant status endpoint design.
- Unit 3 is the primary PBT owner for host normalization and tenant/domain lookup invariants.

## Planned Functional Design Steps

- [x] Read Unit 3 context from units, dependencies, stories, and requirements.
- [x] Collect answers to the questions below.
- [x] Validate answers for missing responses, contradictions, or ambiguity.
- [x] Generate `business-logic-model.md`.
- [x] Generate `business-rules.md`.
- [x] Generate `domain-entities.md`.
- [x] Include testable properties required by PBT-01.
- [x] Include Security Baseline compliance summary.
- [x] Include PBT compliance summary.
- [x] Create Functional Design approval gate.
- [x] Update `aidlc-state.md` and `audit.md`.

## Question 1
Which host source strategy should Unit 3 design use for tenant resolution?

A) Prefer `X-Forwarded-Host` when present, otherwise use `Host`, documenting that trusted infrastructure must sanitize forwarded headers before the IDP
B) Use only `Host` in Unit 3 and defer forwarded-host support
C) Accept forwarded host only from a configured allowlist of trusted proxy IPs in the IDP
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
How should host normalization handle ports and trailing dots?

A) Lowercase host, remove one trailing dot, remove a valid port, and reject invalid ports or malformed hosts
B) Lowercase host only; keep ports and trailing dots as distinct lookup keys
C) Lowercase host and remove trailing dots, but reject any host containing a port
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
Which tenant/domain statuses should Functional Design include for Unit 3?

A) `active`, `pending`, and `disabled` for both tenant and domain records
B) `active` and `disabled` only for Unit 3, with `pending` deferred
C) `active`, `pending`, `disabled`, and `archived` for both tenant and domain records
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
What should the public tenant status endpoint return for unknown, malformed, pending, or disabled hosts?

A) A safe generic status such as `{ "tenant_status": "unavailable" }` without tenant IDs, organization IDs, domains, reasons, or internal details
B) A detailed diagnostic status with reason codes such as `unknown_host`, `pending_domain`, or `disabled_tenant`
C) HTTP 404 for all non-active cases with an empty body
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
How should Unit 3 model the relationship between tenant metadata and Better Auth organizations?

A) Add an IDP-owned tenant table with a foreign key to `idp_organization.id` as the stable linkage key
B) Use `idp_organization` directly and store tenant metadata in its `metadata` field
C) Do not add tenant metadata in Unit 3; only add domain aliases pointing directly to `idp_organization.id`
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
How should tenant domain and alias records be modeled?

A) Single `idp_tenant_domain` table with one normalized host per row, a type field such as `primary` or `alias`, and status
B) Separate `idp_tenant_domain` and `idp_tenant_alias` tables
C) Store aliases as an array or JSON field on the tenant metadata row
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
Which operations should require active tenant context in Unit 3 design?

A) Only the new tenant status/resolution capability is designed in Unit 3; existing citizen auth flows remain unchanged until later units explicitly bind them to tenant context
B) Sign-up and sign-in must immediately require active tenant context
C) All `/api/auth/*` wrapper routes must require active tenant context immediately
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8
What should Unit 3 do when duplicate normalized host records are attempted?

A) Enforce uniqueness at the database/schema rule level and treat duplicate host as invalid configuration
B) Allow duplicates if only one row is active, resolving active over pending/disabled
C) Allow duplicates across tenants and choose the most recently updated row
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 9
Which event taxonomy should Unit 3 reserve or use?

A) Reserve safe tenant/domain events such as `identity.tenant.resolved`, `identity.tenant.resolution_failed`, and `identity.tenant.domain_configured`; emit only for concrete operations added in Unit 3
B) Do not add tenant/domain event taxonomy in Unit 3
C) Emit an event for every status endpoint call
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 10
Which PBT scope should Functional Design require for Unit 3?

A) PBT for host normalization idempotence, valid-case stability, invalid-host rejection, and normalized lookup-key uniqueness assumptions, plus example-based tests for concrete scenarios
B) Example-based tests only; defer PBT despite Unit 3 ownership
C) PBT for the entire resolver including database I/O and Fastify route behavior
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Security Compliance For This Plan

- **SECURITY-05**: Applicable. Host input validation must be explicit.
- **SECURITY-08**: Applicable. Tenant-bound operations must fail closed and protected operations must not rely on client-side behavior.
- **SECURITY-09**: Applicable. Public responses must not expose internal, technical, or business-sensitive details.
- **SECURITY-11**: Applicable. Misuse cases include spoofed forwarded hosts, unknown hosts, duplicate aliases, and disabled tenants/domains.
- **SECURITY-13**: Applicable. Tenant/domain configuration integrity requires stable unique lookup keys and reviewable migrations.
- **SECURITY-15**: Applicable. Malformed or unavailable tenant context must fail safely.

## PBT Compliance For This Plan

- **PBT-01**: Applicable and blocking. Functional Design must identify host normalization and lookup-key properties.
- **PBT-03**: Applicable. Normalization invariants and status behavior must be covered where custom logic exists.
- **PBT-04**: Applicable. Host normalization must be idempotent.
- **PBT-07**: Applicable. Domain-specific host generators are expected for code generation.
- **PBT-08**: Applicable later. Build/test instructions must preserve seed/shrinking reproducibility.
- **PBT-10**: Applicable. PBT must complement example-based tenant resolver tests.
