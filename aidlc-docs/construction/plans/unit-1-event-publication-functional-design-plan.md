# Unit 1 Functional Design Plan: IDP Event Publication Foundation

## Purpose

Define detailed functional behavior for Unit 1 before implementation: event contracts, event payload rules, event publisher semantics, and event emission points for existing auth flows.

## Unit Context

- **Unit**: Unit 1: IDP Event Publication Foundation.
- **Primary Story**: US-01: Publish Safe Identity Events From Existing Auth Flows.
- **Primary Components**: Event Contracts, Event Publisher, Identity Event Service.
- **Primary Location**: `apps/idp/src/events` and existing identity use cases.
- **Initial Publisher**: No-op only.
- **PBT Stance**: Unit 3 is the primary PBT owner. Unit 1 should avoid complex property-bearing pure helpers where possible.

## Functional Design Questions

Please answer every `[Answer]:` tag before Unit 1 functional design artifacts are generated.

### Question 1
Which existing auth flows should Unit 1 wire for event emission in this first unit?

A) All existing auth wrapper use cases: signup, signin, signout, session lookup, auth ok, verification, resend verification, password reset request, password reset completion, password change
B) Only security-relevant state-changing flows: signup, signin, signout, email verification, resend verification, password reset request, password reset completion, password change
C) Minimal first slice: signup, signin, signout, password reset request, password change
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What identifiers should event payloads allow in Unit 1?

A) Request ID, event name, outcome, operation label, and safe reason code only; no user/tenant identifiers yet
B) Request ID, event name, outcome, operation label, safe reason code, and internal user ID when known
C) Request ID, event name, outcome, operation label, safe reason code, internal user ID, and tenant ID when known
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 3
How should Unit 1 handle publisher failures?

A) No-op publisher cannot fail; define the interface as best-effort and document future publisher failure behavior later
B) Publisher errors are swallowed after safe internal handling so auth behavior is not blocked in this unit
C) Publisher errors fail closed for state-changing auth operations even in this unit
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
How should failed auth operations be represented?

A) Emit failure events only when the use case receives a controlled Better Auth error/result
B) Emit failure events for all thrown errors, using sanitized error names only
C) Emit only success events in Unit 1 and defer failure events until error handling is standardized
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
Should Unit 1 introduce a durable event schema registry file for future documentation?

A) Yes, define event names and payload field allowlist in code and mirror it in functional design docs
B) No, keep event names close to use cases and document only in functional design docs
C) Yes, but only as TypeScript types; no runtime registry
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
How should event tests verify no sensitive data appears?

A) Example-based tests with representative sensitive inputs only
B) Example-based tests plus a reusable assertion helper for forbidden keys/values
C) Defer forbidden-field testing to Unit 3 PBT only
X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Functional Design Generation Checklist

- [x] Load answered Unit 1 functional design questions.
- [x] Validate answers for ambiguity or contradictions.
- [x] Generate `business-logic-model.md`.
- [x] Generate `business-rules.md`.
- [x] Generate `domain-entities.md`.
- [x] Confirm frontend components are N/A.
- [x] Include Security Baseline compliance summary.
- [x] Include PBT compliance summary.
- [x] Update `aidlc-state.md` and `audit.md`.

## Approval Gate

Unit 1 functional design artifacts will not be generated until all questions are answered and validated.
