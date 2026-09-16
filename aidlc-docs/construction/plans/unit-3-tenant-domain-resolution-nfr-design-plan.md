# Unit 3 NFR Design Plan: Tenant Domain And Alias Resolution

## Purpose

This plan prepares NFR Design for Unit 3 by translating approved NFR Requirements into concrete design patterns and logical components for tenant host resolution, safe diagnostics, schema/indexing, PBT implementation, and security boundaries.

## NFR Requirements Inputs

- No custom cache in Unit 3.
- One indexed `normalized_host` lookup is the primary resolver path.
- `fast-check` is the selected TypeScript/Vitest PBT framework.
- PBT scope is pure host normalization and lookup-key behavior only.
- Resolver, repository, route, schema, and status behavior use example-based tests.
- Public status endpoint returns only `available` or `unavailable`.
- `X-Forwarded-Host` trust is documented as an ingress/proxy sanitization assumption.
- Raw hosts and normalized hosts are not logged by default.
- Remaining public endpoint rate-limit gap is documented for later infrastructure/edge design.

## Planned NFR Design Steps

- [x] Read Unit 3 NFR Requirements and Functional Design artifacts.
- [x] Collect answers to the questions below.
- [x] Validate answers for missing responses, contradictions, or ambiguity.
- [x] Generate `nfr-design-patterns.md`.
- [x] Generate `logical-components.md`.
- [x] Include Security Baseline compliance summary.
- [x] Include PBT compliance summary for generator quality and reproducibility.
- [x] Create NFR Design approval gate.
- [x] Update `aidlc-state.md` and `audit.md`.

## Question 1
Which resilience pattern should Unit 3 use for tenant resolution failures?

A) Fail-closed resolver result for normal unavailable cases, with existing generic global error handling for internal failures
B) Throw custom public errors with detailed reason codes for all unavailable cases
C) Retry database lookups on unavailable or malformed hosts
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
Which scalability pattern should Unit 3 apply for host lookup?

A) Unique `normalized_host` index plus indexed foreign keys, no cache component, and document cache as future measured optimization
B) Add process-local LRU cache around the resolver
C) Add Redis/secondary-storage cache abstraction now but leave it disabled
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
Which logical component layout should NFR Design use?

A) Host source selector, host normalizer, tenant domain repository boundary, tenant resolver use case, public tenant status route, schema/migration mapping, PBT host generators
B) Single tenant resolver module containing header selection, normalization, database access, route response, and tests
C) Route-level implementation only, with no separate pure normalizer or repository boundary
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
How should the public endpoint response design protect against tenant enumeration?

A) Always project resolver output to `tenant_status: available|unavailable` only, with no reason code or identifiers in any environment
B) Return detailed reason codes in local/development, generic responses in staging/production
C) Return tenant slug/name when active and generic only when unavailable
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
How should PBT generators be designed for host normalization?

A) Use reusable domain-specific generators for valid DNS hosts, supported variants, and invalid host shapes with bounded label/hostname lengths
B) Use raw arbitrary strings only and filter invalid cases in assertions
C) Use only hand-picked example cases because PBT framework is enough without custom generators
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
How should PBT reproducibility be designed?

A) Keep fast-check shrinking enabled and configure tests to log/report seed on failure; do not disable shrinking or skip PBT in CI
B) Disable shrinking to keep test output small
C) Run PBT only locally and skip it in CI
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
Which observability pattern should Unit 3 use?

A) Existing canonical request logging plus safe failure classification only; no raw host/normalized host logging and no per-lookup log event
B) Add a log event for every lookup with normalized host and internal reason code
C) Add durable audit records for every public status call
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8
How should forwarded-host trust be represented in NFR Design?

A) As a documented deployment trust boundary with tests for selection precedence and no proxy-IP allowlist component in Unit 3
B) As an IDP runtime allowlist component that validates proxy IPs before accepting `X-Forwarded-Host`
C) As a disabled feature until Infrastructure Design adds proxy resources
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 9
Which rate-limit pattern should Unit 3 NFR Design document?

A) No Unit 3 custom rate limiter; document public endpoint abuse/rate-limit gap for later infrastructure/edge design
B) Add in-memory per-process rate limiter component for the tenant status route
C) Add distributed rate limiter component backed by Redis/secondary storage
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 10
How should schema/index design handle status fields and duplicate hosts?

A) Global unique index on `normalized_host`, indexes on foreign keys, status columns constrained by app-level constants/tests, and no duplicate active/inactive host rows
B) Partial unique index on active `normalized_host` only, allowing duplicates for pending/disabled rows
C) No unique index; resolver chooses active row at runtime
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Security Compliance For This Plan

- **SECURITY-03**: NFR Design must avoid raw host and identifier logging by default.
- **SECURITY-05**: NFR Design must preserve explicit host validation and endpoint schemas.
- **SECURITY-08**: NFR Design must preserve fail-closed tenant-bound behavior.
- **SECURITY-09**: NFR Design must preserve generic public responses.
- **SECURITY-10**: NFR Design must account for adding `fast-check` through pnpm/lockfile later.
- **SECURITY-11**: NFR Design must cover spoofed headers, duplicate aliases, endpoint abuse, and disabled tenants/domains.
- **SECURITY-13**: NFR Design must preserve unique lookup keys and migration review.
- **SECURITY-15**: NFR Design must keep malformed input and internal failure behavior safe.

## PBT Compliance For This Plan

- **PBT-07**: Applicable and blocking for NFR Design. Generator quality must use domain-specific host generators.
- **PBT-08**: Applicable and blocking for NFR Design/Build and Test. Reproducibility and shrinking must be designed.
- **PBT-10**: Applicable. Example tests must remain part of the test strategy.
