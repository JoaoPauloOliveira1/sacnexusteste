# Unit 3 NFR Requirements Plan: Tenant Domain And Alias Resolution

## Purpose

This plan prepares NFR Requirements for Unit 3. The stage will define scalability, performance, availability, security, reliability, maintainability, testing, and tech-stack requirements for tenant host resolution, tenant/domain schema, the public tenant status endpoint, and required PBT coverage.

## Functional Design Inputs

- Host source strategy prefers `X-Forwarded-Host`, otherwise `Host`.
- Trusted infrastructure must sanitize forwarded host headers before the IDP.
- Host normalization lowercases, removes one trailing dot, removes valid ports, and rejects malformed hosts.
- Tenant and domain statuses are `active`, `pending`, and `disabled`.
- Public endpoint response is generic: `available` or `unavailable` only.
- Tenant metadata links to `idp_organization.id`.
- A single `idp_tenant_domain` table stores primary and alias hosts.
- Existing citizen auth flows remain unchanged in Unit 3.
- Duplicate normalized hosts are invalid at schema/configuration level.
- PBT is required for host normalization properties.

## Planned NFR Requirements Steps

- [x] Read Unit 3 Functional Design artifacts.
- [x] Collect answers to the questions below.
- [x] Validate answers for missing responses, contradictions, or ambiguity.
- [x] Generate `nfr-requirements.md`.
- [x] Generate `tech-stack-decisions.md`.
- [x] Include Security Baseline compliance summary.
- [x] Include PBT compliance summary, including PBT-09 framework selection.
- [x] Create NFR Requirements approval gate.
- [x] Update `aidlc-state.md` and `audit.md`.

## Question 1
What is the expected performance target for the tenant status endpoint and resolver under normal local/unit-tested conditions?

A) Keep resolver logic synchronous/fast with one normalized-host lookup and no custom caching in Unit 3; no strict latency SLO beyond existing service quality gates
B) Define a strict P95 latency target and add in-memory caching in Unit 3
C) Define a strict P95 latency target and add Redis/secondary storage in Unit 3
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
How should Unit 3 handle tenant/domain lookup scalability?

A) Use a unique index on `normalized_host`, indexed tenant foreign keys, and no cache until measured need appears
B) Add a process-local cache for normalized host lookups immediately
C) Add external cache infrastructure immediately
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
What database testing strategy should Unit 3 use for tenant resolver behavior?

A) Unit-level tests with mocked repository/database boundaries plus schema/migration tests; no real PostgreSQL integration test lifecycle in Unit 3
B) Add real PostgreSQL integration tests for resolver queries in Unit 3
C) Skip repository/resolver tests and rely on route tests only
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
Which PBT framework should Unit 3 select for TypeScript/Vitest?

A) Add `fast-check` as an IDP dev dependency and document seed/shrinking/reproducibility expectations
B) Use Vitest only and implement manual randomized tests without a PBT framework
C) Defer PBT framework selection despite Unit 3 PBT ownership
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
How should PBT be scoped during Unit 3 Code Generation?

A) PBT only for pure host normalization/lookup-key functions; example-based tests for resolver, repository, route, and status behavior
B) PBT for pure normalization plus route and database I/O behavior
C) PBT for every Unit 3 test, replacing most example-based tests
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
How should public tenant status endpoint availability and error handling be specified?

A) Always return a safe generic `available`/`unavailable` result for normal resolution cases; internal failures use existing generic error handling and safe canonical logs
B) Return detailed reason codes to help debugging in local/development only
C) Return detailed reason codes in all environments because endpoint is diagnostic
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
How should forwarded-host trust be treated in NFR Requirements?

A) Document as an ingress/proxy trust assumption and test IDP header selection, but do not add proxy-IP allowlisting in Unit 3
B) Add IDP-managed trusted proxy IP allowlisting before accepting `X-Forwarded-Host`
C) Disable `X-Forwarded-Host` in all environments until infrastructure design is done
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8
What observability should Unit 3 add for tenant resolution?

A) Preserve canonical request logging and reserve safe event names; do not log every public status lookup or raw host values
B) Add structured logs for every lookup including normalized host and reason code
C) Add durable audit persistence for every tenant status lookup
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 9
What rate limiting posture should Unit 3 use for the public tenant status endpoint?

A) Rely on existing platform/Better Auth/service-level controls for this unit and document the remaining public endpoint rate-limit gap for later infrastructure/edge design
B) Add custom in-memory Fastify rate limiting in Unit 3
C) Add external distributed rate limiting in Unit 3
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 10
What documentation updates should Unit 3 require after implementation?

A) Defer durable README/docs roadmap updates to Unit 5, but require code-generation summary to note tenant resolver behavior, PBT, and any rate-limit/trust-boundary gaps
B) Update all durable README/docs immediately during Unit 3 code generation
C) No documentation updates are needed for Unit 3
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Security Compliance For This Plan

- **SECURITY-03**: Applicable. Logs must not include raw hosts, request headers, tenant IDs, organization IDs, or business-sensitive data by default.
- **SECURITY-05**: Applicable. Host validation and endpoint response schemas must be explicit.
- **SECURITY-08**: Applicable. Tenant-bound behavior must fail closed and public endpoint exposure must be explicitly public.
- **SECURITY-09**: Applicable. Public responses must stay generic.
- **SECURITY-10**: Applicable if `fast-check` is added; dependency must use pnpm and lockfile.
- **SECURITY-11**: Applicable. Misuse cases include header spoofing, duplicate aliases, disabled tenants/domains, and endpoint abuse.
- **SECURITY-13**: Applicable. Normalized host uniqueness and migration review protect data integrity.
- **SECURITY-15**: Applicable. Internal failures and malformed inputs must fail safely.

## PBT Compliance For This Plan

- **PBT-09**: Applicable and blocking in NFR Requirements. Unit 3 must select and document a PBT framework or produce an approved exception.
- **PBT-10**: Applicable. PBT must complement example-based tests.
- **PBT-07/PBT-08**: Must be prepared for NFR Design and Code Generation through generator quality and reproducibility requirements.
