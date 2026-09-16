# Unit 1 NFR Requirements Plan: IDP Event Publication Foundation

## Purpose

Define non-functional requirements and technology choices for Unit 1 before NFR design and code generation.

## Unit Context

- **Unit**: Unit 1: IDP Event Publication Foundation.
- **Functional Design**: `aidlc-docs/construction/unit-1-event-publication-foundation/functional-design/`.
- **Initial Publisher**: No-op publisher only.
- **Scope**: Event contract, event registry, no-op publisher, event emission from all existing auth wrapper use cases, example-based tests with forbidden-data assertion helper.
- **Out of Scope**: Persistent audit storage, durable publisher, queue, outbox, monitoring dashboards, frontend behavior.

## NFR Questions

Please answer every `[Answer]:` tag before NFR requirements artifacts are generated.

### Question 1
What performance expectation should Unit 1 enforce for event emission?

A) Event emission must add effectively no measurable runtime overhead because the publisher is no-op
B) Event emission may add small overhead, but auth wrapper response behavior must remain unchanged
C) No explicit performance expectation is needed until a durable publisher exists
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What availability/reliability stance should Unit 1 use for event publication?

A) Best-effort only; no-op publisher must never reduce auth flow availability
B) Auth flows should fail if event creation fails validation
C) Only state-changing auth flows should fail if event creation fails validation
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What security verification is required for event payload safety?

A) Example-based tests for allowed fields and forbidden representative values
B) Example-based tests plus reusable forbidden-key/forbidden-value assertion helper
C) Full runtime sanitizer plus tests for every forbidden field category
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
How should PBT be handled for Unit 1?

A) Mark PBT as N/A for Unit 1 unless implementation introduces non-trivial property-bearing transformations
B) Add PBT now for event payload allowlisting despite the previous unit plan
C) Defer all PBT discussion to Unit 3 only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
What tech stack choice should be made for event tests in Unit 1?

A) Existing Vitest only, with test doubles for the event publisher
B) Vitest plus a new PBT framework in this unit
C) No new tests until code generation proves the event interface shape
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
How should observability be represented in Unit 1?

A) No runtime logging from the no-op publisher; event contracts prepare future observability only
B) Emit structured operational logs for every event immediately
C) Emit logs only in test/development environments
X) Other (please describe after [Answer]: tag below)

[Answer]: X
Utilze o padrão atual de logs estruturados no final de cada reqisição

### Question 7
What maintainability requirement should apply to event names and payload fields?

A) Central registry required; arbitrary inline event names and fields are not allowed
B) Registry preferred, but use cases may define local event names if clear
C) Keep event names local to use cases for simplicity
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## NFR Requirements Generation Checklist

- [x] Load answered NFR questions.
- [x] Validate answers for ambiguity or contradictions.
- [x] Generate `nfr-requirements.md`.
- [x] Generate `tech-stack-decisions.md`.
- [x] Include Security Baseline compliance summary.
- [x] Include PBT compliance summary.
- [x] Update `aidlc-state.md` and `audit.md`.

## Approval Gate

Unit 1 NFR requirements artifacts will not be generated until all questions are answered and validated.
