# Unit 1 NFR Design Plan: IDP Event Publication Foundation

## Purpose

Incorporate the approved Unit 1 NFR requirements into design patterns and logical components before code generation.

## Unit Context

- **Unit**: Unit 1: IDP Event Publication Foundation.
- **Functional Design**: `aidlc-docs/construction/unit-1-event-publication-foundation/functional-design/`.
- **NFR Requirements**: `aidlc-docs/construction/unit-1-event-publication-foundation/nfr-requirements/`.
- **Publisher Scope**: No-op publisher only.
- **Testing Scope**: Existing Vitest, publisher test doubles, and reusable forbidden-key/forbidden-value assertion helper.
- **Out of Scope**: Durable audit persistence, queue, outbox, event bus, worker, monitoring dashboard, external publisher, runtime per-event logging, and new PBT framework installation.

## NFR Design Questions

Please answer every `[Answer]:` tag before NFR design artifacts are generated.

### Question 1
What resilience pattern should the Unit 1 event publisher use?

A) Best-effort no-op publisher that never throws and never changes auth outcomes
B) Explicit try/catch around every auth use case event publication call, even though the publisher is no-op
C) Event validation failure should fail the auth operation to protect event integrity
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What future publisher failure behavior should the NFR design reserve for later units or tasks?

A) Future durable publishers must define explicit failure behavior before replacing the no-op publisher
B) Future durable publishers may silently fail exactly like the Unit 1 no-op publisher
C) Future durable publishers should make auth operations fail whenever event delivery fails
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
What scalability pattern should Unit 1 establish without adding infrastructure?

A) Stable publisher interface and central registry only; defer queues, outbox, and workers
B) Add an in-memory event buffer for future batching but do not persist events
C) Add queue/outbox design now even though infrastructure is out of scope
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
What performance pattern should event construction use?

A) Constant-size allowlisted payload construction with no deep inspection, serialization, I/O, or external calls
B) Full defensive scan of request and response objects to remove sensitive fields before publishing
C) Runtime schema validation for every emitted event, even if it adds measurable overhead
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
What security pattern should protect event payload safety?

A) Central registry defines event names, operation labels, outcomes, and allowed payload fields; use cases reference registry values
B) Use cases define local event fields, and tests verify that representative sensitive values are absent
C) Runtime sanitizer strips sensitive fields from arbitrary event payloads before publishing
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
What logical components should be included in Unit 1 NFR Design?

A) Event registry, event factory/helper, publisher interface, no-op publisher, use-case publisher injection, and test assertion helper
B) Event registry, event factory/helper, publisher interface, no-op publisher, queue adapter, and worker placeholder
C) Event registry and no-op publisher only; avoid event factory/helper and test helper
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
How should observability be represented in Unit 1 NFR Design?

A) Keep current structured request-completion logs and do not log every no-op event
B) Add one structured log entry for every event published by the no-op publisher
C) Add development-only event logs and keep production silent
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
How should PBT be represented in the NFR design?

A) Mark PBT as N/A for Unit 1 because the design avoids property-bearing transformations; revisit if code generation adds complex transformations
B) Add PBT requirements now for event payload allowlisting despite Unit 1 using example-based tests
C) Remove all PBT references from Unit 1 artifacts and defer entirely to Unit 3
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## NFR Design Generation Checklist

- [x] Load answered NFR Design questions.
- [x] Validate answers for ambiguity or contradictions.
- [x] Generate `nfr-design-patterns.md`.
- [x] Generate `logical-components.md`.
- [x] Include Security Baseline compliance summary.
- [x] Include PBT compliance summary.
- [x] Update this plan's checkboxes after artifact generation.
- [x] Update `aidlc-state.md` and `audit.md`.

## Approval Gate

Unit 1 NFR design artifacts will not be generated until all questions are answered and validated.
