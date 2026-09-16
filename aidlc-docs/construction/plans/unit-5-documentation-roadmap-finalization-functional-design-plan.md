# Unit 5 Functional Design Plan: Documentation And Roadmap Finalization

## Purpose

This plan prepares Functional Design for Unit 5. Unit 5 finalizes durable documentation and roadmap state after Units 1-4 have been implemented and verified.

## Unit Context

- **Unit**: Unit 5: Documentation And Roadmap Finalization.
- **Primary Stories**: Supports US-01, US-02, US-03, and US-04.
- **Primary Locations**: `apps/idp/README.md`, `docs/idp/*`, `idp-architecture-discussion.md`, `docs/TODO.md` if needed.
- **Functional Design Artifacts Later**: `aidlc-docs/construction/unit-5-documentation-roadmap-finalization/functional-design/`.
- **Primary Goal**: Ensure durable docs reflect verified implementation without adding secrets, realistic credentials, or unsupported operational claims.

## Planned Functional Design Steps

- [x] Read Unit 1-4 code-generation summaries.
- [x] Read existing durable IDP docs and roadmap files.
- [x] Identify documentation surfaces that need updates.
- [x] Identify roadmap items that can be marked completed based on verification.
- [x] Identify deferred future work that belongs in durable docs or `docs/TODO.md`.
- [x] Collect and validate answers below.
- [x] Generate `business-logic-model.md` for documentation workflow.
- [x] Generate `business-rules.md` for safe documentation and roadmap updates.
- [x] Generate `domain-entities.md` for docs/roadmap/backlog concepts.
- [x] Include Security Baseline compliance summary.
- [x] Include PBT compliance summary.
- [x] Create Functional Design approval gate.
- [x] Update `aidlc-state.md` and `audit.md`.

## Question 1
Which durable documentation surfaces should Unit 5 update if relevant content exists?

A) Update `apps/idp/README.md`, `docs/idp/*`, and `idp-architecture-discussion.md`; update `docs/TODO.md` only for deferred work not already captured
B) Update only `apps/idp/README.md`
C) Update only AI-DLC docs and leave durable project docs unchanged
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
How should Unit 5 treat roadmap completion status?

A) Mark completed roadmap items only when implementation and verification are already recorded in Units 1-4 summaries
B) Mark all planned roadmap items completed regardless of verification
C) Do not update roadmap completion status
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
What should Unit 5 document about the bootstrap command?

A) Document command shape, required flags, safe output policy, rerun behavior, tenant status smoke tests, and warning not to use real secrets in examples
B) Document only the command name
C) Do not document bootstrap because it is internal tooling
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
What should Unit 5 document about tenant/domain resolution?

A) Document `GET /tenant/status`, host normalization behavior, `X-Forwarded-Host` trust assumption, active/pending/disabled behavior, and rate-limit gap
B) Document only the endpoint path
C) Do not document tenant/domain resolution
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
What should Unit 5 document about events and auditability?

A) Document the no-op event publisher, safe no-PII/no-secret event taxonomy, current non-durable behavior, and future audit/outbox/queue gap
B) Document events as durable audit records
C) Do not document event behavior
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
What should Unit 5 document about Better Auth organization and membership ownership?

A) Document organization plugin usage, disabled public org creation, organization-to-tenant linkage, owner role bootstrap, and citizen users not automatically becoming members
B) Document only that Better Auth is installed
C) Do not document organization/membership behavior
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
How should Unit 5 handle deferred future work?

A) Capture only gaps not already covered by active docs, such as invitation flow, admin UI/API, persistent audit worker, FastAPI integration, frontend integration, and production rate limiting
B) Add every possible future idea to `docs/TODO.md`
C) Avoid documenting any future gaps
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8
How should examples be written?

A) Use synthetic domains, emails, passwords, and IDs only; no real secrets, real credentials, CPF, CNPJ, personal data, tokens, cookies, or production connection strings
B) Use realistic examples copied from manual tests for clarity
C) Avoid all examples
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Security Compliance For This Plan

- **SECURITY-03**: Applicable. Documentation examples must not leak secrets, credentials, PII, tokens, cookies, raw SQL, or connection strings.
- **SECURITY-09**: Applicable. Docs must not recommend unsafe default credentials, unsafe errors, or destructive cleanup as normal flow.
- **SECURITY-11**: Applicable. Docs should preserve security-critical boundaries and known gaps.
- **SECURITY-12**: Applicable. Docs must not encourage reimplementing Better Auth internals.
- **SECURITY-13**: Applicable. Roadmap/docs must preserve audit/event integrity boundaries.
- **SECURITY-15**: Applicable. Docs must describe fail-safe behavior accurately.

## PBT Compliance For This Plan

- **PBT-01/PBT-10**: Applicable for documentation traceability. Unit 5 should document Unit 3 PBT coverage and clarify that PBT complements example tests.
- **PBT-08**: Applicable if docs mention test reproducibility or seed/shrinking behavior.
