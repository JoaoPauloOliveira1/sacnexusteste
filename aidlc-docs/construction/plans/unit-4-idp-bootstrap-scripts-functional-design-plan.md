# Unit 4 Functional Design Plan: IDP Bootstrap Scripts

## Purpose

This plan prepares Functional Design for Unit 4. Unit 4 adds controlled IDP bootstrap scripts for tenant setup: creating or connecting Better Auth organizations, tenant records, tenant domains/aliases, initial owner users, owner membership, and safe setup events.

## Unit Context

- **Unit**: Unit 4: IDP Bootstrap Scripts.
- **Primary Story**: US-04: Bootstrap Tenants, Domains, And Initial Owner Users Safely.
- **Supporting Stories**: US-01 events, US-02 organization/membership model, US-03 tenant/domain schema and host normalization.
- **Primary Components**: Bootstrap Command, Bootstrap Service, Organization Integration Service, Tenant Registry Service, Tenant Domain Service.
- **Primary Code Locations Later**: `apps/idp/src/bootstrap` or `apps/idp/src/scripts`, `apps/idp/package.json`, `apps/idp/tests`.
- **Functional Design Artifacts Later**: `aidlc-docs/construction/unit-4-idp-bootstrap-scripts/functional-design/`.

## Design Inputs

- Unit 1 event abstraction exists and requires safe no-PII/no-secret event payloads.
- Unit 2 organization/member schema and Better Auth organization plugin are in place.
- Unit 3 tenant and tenant-domain schema, host normalization, and public status endpoint are in place.
- Unit 4 should avoid new schema if possible and use Unit 2/Unit 3 models.
- Bootstrap must be operational/server-side only, not public self-service.

## Planned Functional Design Steps

- [x] Read Unit 4 context from units, dependencies, stories, and requirements.
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
What should be the initial bootstrap command shape?

A) One app-level script command such as `pnpm --filter idp bootstrap:tenant -- --name ... --slug ... --domain ... --owner-email ... --owner-name ... --temporary-password ...`
B) Multiple focused scripts, one for organization, one for tenant, one for domain, and one for owner membership
C) No CLI script; document SQL/manual steps only
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
How should Unit 4 handle existing organization/tenant/domain records on rerun?

A) Idempotent connect-or-create behavior: reuse exact matching records, create missing records, and fail safely on conflicting records
B) Always create new records and let unique constraints fail on duplicates
C) Delete and recreate records to match desired state
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
How should owner user creation behave when the owner email already exists?

A) Reuse the existing Better Auth user and assign owner membership if safe; create user only when absent
B) Fail if the owner email already exists
C) Always create a new user even if the email exists
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
How should the temporary password be handled?

A) Required CLI input for new owner user creation, never printed, never logged, and never stored outside Better Auth password handling
B) Auto-generate and print it once in terminal output
C) Skip password creation and rely on reset-password flow only
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
How should owner membership be assigned?

A) Use official Better Auth server-side organization/member APIs to create or connect organization and add owner membership
B) Insert directly into `idp_member` tables with raw SQL/Drizzle for simplicity
C) Defer owner membership assignment to manual database steps
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
How should tenant domain input be validated?

A) Reuse Unit 3 host normalization; accept one primary domain plus optional alias values, storing only normalized hosts
B) Accept domains as-is and rely on the public status endpoint to normalize later
C) Accept only one domain and defer aliases
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
What output should the bootstrap command print?

A) Safe high-level result only, such as created/reused flags and non-sensitive operation labels; no email, password, DB URL, tokens, raw host input, or internal IDs
B) Print all created IDs and owner email for operator convenience, but never password
C) Print full created records as JSON
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8
Which events should Unit 4 emit or simulate?

A) Safe setup events for bootstrap started/completed/failed, organization connected/created, tenant configured, domain configured, and owner assigned where concrete operations occur
B) No events in Unit 4; leave events to future audit implementation
C) Emit detailed events with raw inputs for audit completeness
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 9
How should partial failure be handled?

A) Validate all inputs before mutation where practical, execute in a database transaction where feasible, and fail with safe output without granting partial owner access
B) Allow partial progress and tell operator to manually clean up
C) Continue best-effort even if owner assignment fails
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 10
What should be the PBT posture for Unit 4?

A) Avoid new property-bearing parsing/normalization helpers by reusing Unit 3 normalization; use example-based tests unless custom pure CLI parsing/normalization logic is introduced
B) Add PBT for all bootstrap orchestration paths including database/Better Auth calls
C) Skip all automated tests for bootstrap because it is operational tooling
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Security Compliance For This Plan

- **SECURITY-03**: Applicable. Bootstrap output/logs must not include secrets, raw credentials, raw emails, tokens, session IDs, raw host input, or connection strings.
- **SECURITY-05**: Applicable. CLI inputs must be validated before mutation.
- **SECURITY-08**: Applicable. Owner assignment is privileged and must be server-side only.
- **SECURITY-09**: Applicable. Failures must not expose internals.
- **SECURITY-11**: Applicable. Misuse cases include rerun conflicts, partial owner assignment, duplicate domains, and unsafe output.
- **SECURITY-12**: Applicable. Better Auth credential/member internals must not be reimplemented.
- **SECURITY-13**: Applicable. Tenant/domain/owner modifications must preserve integrity and audit/event traceability.
- **SECURITY-15**: Applicable. Partial failures must fail safely.

## PBT Compliance For This Plan

- **PBT-01**: Applicable. Functional Design must identify whether Unit 4 introduces property-bearing pure helpers.
- **PBT-03/PBT-04**: Applicable only if custom parsing, normalization, idempotency, or transformation logic is introduced beyond Unit 3 reuse.
- **PBT-10**: Applicable. Example-based tests remain required for critical bootstrap scenarios.
