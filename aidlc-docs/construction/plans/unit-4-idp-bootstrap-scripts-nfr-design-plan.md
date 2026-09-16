# Unit 4 NFR Design Plan: IDP Bootstrap Scripts

## Purpose

This plan prepares NFR Design for Unit 4. It translates approved NFR requirements into concrete design patterns and logical components for the IDP bootstrap command, while preserving security, low operational complexity, Better Auth boundaries, and deterministic tests.

## Unit Context

- **Unit**: Unit 4: IDP Bootstrap Scripts.
- **Functional Design**: `aidlc-docs/construction/unit-4-idp-bootstrap-scripts/functional-design/`.
- **NFR Requirements**: `aidlc-docs/construction/unit-4-idp-bootstrap-scripts/nfr-requirements/`.
- **Execution Mode**: Low-frequency package-level command inside `apps/idp`.
- **Primary NFR Design Focus**: Fail-safe orchestration, safe output projection, safe setup event emission, minimal CLI parsing, dependency injection for tests, and reuse of existing schema/Better Auth/host normalization.

## Planned NFR Design Steps

- [x] Read Unit 4 NFR Requirements artifacts.
- [x] Read Unit 4 Functional Design artifacts.
- [x] Define resilience patterns for validation-before-mutation, transaction boundaries, safe operation ordering, idempotent reruns, and conflict failure.
- [x] Define security patterns for strict allowlisted output, no-secret/no-PII events, credential handling, and Better Auth boundary preservation.
- [x] Define performance/scalability patterns for single-tenant low-frequency execution without caching, queues, or batch processing.
- [x] Define logical components for CLI parser, bootstrap request validator, bootstrap orchestrator, repository/service integrations, output projector, and event publisher boundary.
- [x] Define testability patterns using controlled dependencies and no real `.env` reads.
- [x] Collect and validate answers below.
- [x] Generate `nfr-design-patterns.md`.
- [x] Generate `logical-components.md`.
- [x] Include Security Baseline compliance summary.
- [x] Include PBT compliance summary.
- [x] Create NFR Design approval gate.
- [x] Update `aidlc-state.md` and `audit.md`.

## Question 1
Which resilience pattern should the NFR Design use for the bootstrap orchestration sequence?

A) Validate all inputs first, then create/connect records in safe order, use a transaction for IDP-owned data where feasible, and rely on idempotent rerun for matching state
B) Execute each operation independently with best-effort continuation after failures
C) Add a compensating rollback/delete command and use it automatically on failure
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
How should the design handle Better Auth operations that cannot share the same transaction as IDP-owned Drizzle mutations?

A) Isolate Better Auth calls behind a small integration boundary, order operations to avoid partial owner access, and classify failures safely for rerun
B) Ignore transaction differences and assume all operations are atomic
C) Avoid Better Auth APIs and write directly to Better Auth tables for transaction consistency
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
Which output pattern should be designed?

A) A dedicated safe output projector that maps internal results/errors to allowlisted operation categories and outcome flags only
B) Directly print service return objects to stdout
C) Print full JSON records when a `--verbose` flag is used
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
Which event pattern should be designed?

A) Emit setup events through Unit 1 abstraction from the orchestration boundary, using safe operation labels, outcomes, and generic failure categories only
B) Emit detailed audit-like events with domains and owner email
C) Do not include event publication in the NFR Design
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
Which CLI parsing component pattern should be designed?

A) Small testable parser using built-in Node APIs or minimal manual parsing, returning a typed parse result without reading env or mutating state
B) Add a new CLI framework component such as Commander/Yargs
C) Parse arguments directly inside the bootstrap service
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
Which dependency pattern should support tests?

A) Keep orchestration independent of process globals by injecting database, identity integration, event publisher, and output sink dependencies where practical
B) Use global singletons everywhere because this is a CLI command
C) Test only by spawning a real command process with real dependencies
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
Which PBT design posture should be captured?

A) Reuse Unit 3 host normalization and avoid new PBT unless custom pure parsing/sanitization/idempotency helpers are introduced; example tests remain mandatory
B) Require PBT for all bootstrap orchestration and database flows
C) Exempt bootstrap from all PBT and example-based behavior tests
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8
Which logical components should be explicitly included?

A) CLI parser, request validator, bootstrap orchestrator, organization/identity integration, tenant/domain persistence integration, event publication adapter, safe output projector, and test doubles
B) Only one script file with all logic inline
C) A queue worker, cache, distributed lock, rollback command, and audit database
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Security Compliance For This Plan

- **SECURITY-03**: Applicable. NFR Design must include safe output and event projection components.
- **SECURITY-05**: Applicable. Input validation must be a first-class pattern.
- **SECURITY-08**: Applicable. Privileged owner/tenant mutation must stay operational/server-side.
- **SECURITY-09**: Applicable. Error projection must be generic and non-leaking.
- **SECURITY-10**: Applicable if any new dependency is considered; current NFR choice avoids new dependencies by default.
- **SECURITY-11**: Applicable. Misuse cases must be isolated and testable through component design.
- **SECURITY-12**: Applicable. Better Auth internals must remain behind supported APIs.
- **SECURITY-13**: Applicable. Tenant/domain integrity and safe event traceability must be preserved.
- **SECURITY-15**: Applicable. Design must fail safely on invalid input, conflicts, and partial failures.

## PBT Compliance For This Plan

- **PBT-01**: Applicable. NFR Design must preserve identified property-bearing areas.
- **PBT-03/PBT-04**: Conditional if custom pure parsing, sanitization, or idempotency helpers are introduced.
- **PBT-10**: Applicable. NFR Design must require example tests for critical bootstrap behavior.
