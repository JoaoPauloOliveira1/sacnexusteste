# Unit 4 NFR Requirements Plan: IDP Bootstrap Scripts

## Purpose

This plan prepares NFR Requirements for Unit 4. Unit 4 introduces an operational bootstrap command for provisioning tenants, domains, owner users, owner membership, and safe setup events. The NFR assessment focuses on security, reliability, maintainability, operational safety, testability, and technology decisions for command-line implementation.

## Unit Context

- **Unit**: Unit 4: IDP Bootstrap Scripts.
- **Functional Design Location**: `aidlc-docs/construction/unit-4-idp-bootstrap-scripts/functional-design/`.
- **Primary Story**: US-04.
- **Execution Mode**: Operational package-level command inside `apps/idp`.
- **Public Surface**: None. Unit 4 does not add public HTTP endpoints or UI flows.
- **Primary NFR Risk**: Privileged setup operation that handles a temporary password and can mutate tenant, organization, domain, user, and membership state.

## Planned NFR Requirements Steps

- [x] Read Unit 4 Functional Design artifacts.
- [x] Assess scalability and throughput needs for operational bootstrap usage.
- [x] Assess performance expectations for command execution.
- [x] Assess availability and failure recovery requirements.
- [x] Assess security requirements for CLI input, output, events, credentials, and Better Auth boundaries.
- [x] Assess reliability requirements for idempotency, partial failure, transactions, and retries.
- [x] Assess maintainability requirements for package script ownership and testability.
- [x] Assess technology decisions for CLI argument parsing, Better Auth integration, database access, and test approach.
- [x] Collect and validate answers below.
- [x] Generate `nfr-requirements.md`.
- [x] Generate `tech-stack-decisions.md`.
- [x] Include Security Baseline compliance summary.
- [x] Include PBT compliance summary.
- [x] Create NFR Requirements approval gate.
- [x] Update `aidlc-state.md` and `audit.md`.

## Question 1
What throughput/load expectation should the bootstrap command target?

A) Low-frequency operator use only; optimize for correctness and safety over throughput
B) Moderate batch provisioning; support multiple tenants per command invocation
C) High-volume automated provisioning; optimize for concurrency and horizontal scaling
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
What is the acceptable command execution performance target?

A) Complete one tenant bootstrap in a few seconds under normal local/database conditions; no strict SLA
B) Complete within 1 second end-to-end
C) Performance target is not relevant; any duration is acceptable
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
How should partial failures be recovered operationally?

A) Prefer transaction-backed rollback for IDP-owned data where feasible, safe operation ordering for Better Auth steps, and idempotent rerun for matching state
B) Require manual database cleanup after any partial failure
C) Add a separate rollback/delete command in Unit 4
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
How strict should command output redaction be?

A) Strict allowlist only: print operation categories and created/reused/failed flags, no owner email, domains, normalized hosts, internal IDs, secrets, raw errors, or connection details
B) Allow owner email and domains in output, but never temporary password or tokens
C) Allow full JSON output for operational convenience
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
How should bootstrap events balance auditability and privacy?

A) Emit safe no-PII/no-secret event categories only; no owner email, domain names, normalized hosts, internal IDs, raw errors, or SQL
B) Include domain names and owner email in events for audit usefulness
C) Do not emit setup events in Unit 4
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
What CLI argument parsing technology should Unit 4 prefer?

A) Minimal built-in `node:util`/manual parser to avoid new dependencies, if sufficient and testable
B) Add a CLI dependency such as `commander` or `yargs`
C) Avoid CLI parsing by reading JSON from stdin only
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
What database/Better Auth integration posture should Unit 4 use?

A) Reuse existing IDP database client/schema and Better Auth server-side APIs; avoid new schema unless implementation proves unavoidable
B) Add a dedicated bootstrap-only database client and schema layer
C) Use raw SQL for all bootstrap mutations
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8
What test strategy should Unit 4 require?

A) Automated unit/integration-style tests with controlled dependencies for parsing, validation, safe output, idempotent rerun, domain conflict, and invalid input failure
B) Manual testing only because bootstrap is operational tooling
C) Only typecheck/build without behavioral tests
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 9
Should Unit 4 introduce PBT beyond existing Unit 3 host normalization tests?

A) No new PBT unless Unit 4 introduces custom pure parsing, sanitization, or idempotency helpers with meaningful properties
B) Yes, add PBT for all bootstrap orchestration paths, including database and Better Auth calls
C) Disable PBT requirements for bootstrap tooling
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 10
What documentation/update expectation should NFR Requirements set for Unit 4 implementation?

A) Require updates later to `apps/idp/README.md` and durable IDP docs for the operational command, safe output policy, rerun behavior, and manual smoke testing; defer exact edits to Code Generation/Unit 5
B) No documentation updates are needed for internal scripts
C) Only update AI-DLC docs, not durable project docs
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Security Compliance For This Plan

- **SECURITY-03**: Applicable. Output, logs, and events must be strict no-secret/no-PII/no-raw-error surfaces.
- **SECURITY-05**: Applicable. CLI inputs require validation before mutation where practical.
- **SECURITY-08**: Applicable. Bootstrap is privileged operational tooling.
- **SECURITY-09**: Applicable. Failures must not expose internals and must not leave default credentials exposed.
- **SECURITY-10**: Applicable if dependencies are added; use `pnpm` and preserve lockfile hygiene.
- **SECURITY-11**: Applicable. Abuse cases include duplicate domains, conflicting owners, unsafe reruns, and partial owner assignment.
- **SECURITY-12**: Applicable. Better Auth credential, user, organization, and membership internals must not be reimplemented.
- **SECURITY-13**: Applicable. Tenant/domain integrity and safe event traceability are required.
- **SECURITY-15**: Applicable. Invalid input and conflicts must fail safely.

## PBT Compliance For This Plan

- **PBT-01**: Applicable. NFR Requirements must identify property-bearing areas.
- **PBT-03/PBT-04**: Applicable if Unit 4 introduces pure parsing, normalization, output sanitization, or idempotency helpers.
- **PBT-10**: Applicable. Example-based tests are required for critical bootstrap behavior.
