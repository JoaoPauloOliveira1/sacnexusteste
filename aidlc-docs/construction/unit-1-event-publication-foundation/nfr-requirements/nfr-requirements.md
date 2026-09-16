# NFR Requirements: Unit 1 Event Publication Foundation

## Overview

Unit 1 adds event publication contracts and a no-op publisher for existing IDP auth wrapper flows. The NFR focus is to preserve authentication behavior, avoid sensitive data leakage, keep performance impact negligible, and prepare future audit/observability work without introducing durable infrastructure in this unit.

## Performance Requirements

- Event emission must add effectively no measurable runtime overhead because the publisher is no-op.
- Event creation must use simple allowlisted payload construction and avoid expensive serialization, deep inspection, network calls, database writes, or file I/O.
- Event emission must not alter auth wrapper response status, headers, cookies, or sanitized payloads.

## Availability And Reliability Requirements

- Event publication is best-effort in Unit 1.
- The no-op publisher must never reduce auth flow availability.
- The no-op publisher must not perform external calls or side effects that can fail at runtime.
- Future durable publishers must define explicit failure behavior before replacing the no-op implementation.

## Security Requirements

- Event payload fields must be allowlisted through a central event registry.
- Event payloads must not include passwords, tokens, cookies, raw email addresses, request bodies, response bodies, verification/reset URLs, rendered email content, CPF, CNPJ, phone numbers, addresses, domain profile data, session tokens, raw provider responses, or unapproved session IDs.
- Event reason codes must be symbolic and non-sensitive.
- Event names and payload fields must be defined centrally; arbitrary inline event names and payload fields are not allowed.
- Tests must include example-based checks for allowed fields and forbidden representative values.
- Tests must include a reusable forbidden-key/forbidden-value assertion helper, preserving the approved Functional Design.
- Event emission must not reimplement or bypass Better Auth internals.

## Observability Requirements

- Unit 1 must continue using the current pattern of structured request logging at the end of each request.
- The no-op publisher must not emit runtime logs for every event.
- Event contracts prepare future observability and audit integration without adding log volume or sensitive output in Unit 1.
- Existing canonical request events remain the operational logging mechanism for this unit.

## Maintainability Requirements

- Event names, operation labels, outcomes, and allowed payload fields must be defined in a central registry.
- Use cases must reference the registry rather than hardcoding arbitrary event names or payload fields.
- The event publisher interface must remain replaceable so future durable publishers can be introduced without changing every auth use case.
- Unit tests must use test doubles for the publisher interface.

## Testing Requirements

- Use existing Vitest only for Unit 1.
- Use test doubles for the event publisher.
- Verify event publication is invoked for all auth wrapper flows in scope.
- Verify controlled Better Auth error/results produce failure events where the use case has controlled failure information.
- Verify auth behavior and sanitized responses are preserved after event wiring.
- Verify forbidden representative keys and values do not appear in emitted event payloads.

## PBT Requirements

- PBT is N/A for Unit 1 unless implementation introduces non-trivial property-bearing transformations.
- If code generation introduces complex sanitization, normalization, or transformation logic, the code generation plan must be updated to add PBT before implementation completes.
- Unit 3 remains the primary PBT owner for host normalization and generated-input testing.

## Out Of Scope

- Durable audit/event persistence.
- Queue, outbox, event bus, worker, or external publisher.
- Runtime event logging from the no-op publisher.
- PBT framework installation for Unit 1.
- Monitoring dashboards and alerting.

## Security Compliance

- **SECURITY-03**: Compliant. Event payloads are no-PII/no-secret and no runtime per-event logging is added.
- **SECURITY-05**: Compliant. Event payload construction uses field allowlisting.
- **SECURITY-08**: N/A for Unit 1 because it does not add protected resource endpoints.
- **SECURITY-09**: Compliant. No new production error detail exposure is introduced.
- **SECURITY-10**: Compliant. No new dependency is required for Unit 1 NFRs.
- **SECURITY-11**: Compliant. Event publication is isolated behind a dedicated abstraction.
- **SECURITY-12**: Compliant. Better Auth internals remain untouched.
- **SECURITY-13**: Compliant. The event registry and publisher seam prepare future audit/data integrity work.
- **SECURITY-15**: Compliant. No-op publisher cannot fail open or reduce auth availability.

## PBT Compliance

- **PBT-01**: N/A for Unit 1 Functional Design because property-bearing transformations are intentionally avoided.
- **PBT-02**: N/A; no round-trip transformation is introduced.
- **PBT-03**: N/A unless implementation adds non-trivial runtime sanitization.
- **PBT-04**: N/A; no idempotent transformation is required.
- **PBT-05**: N/A; no oracle is used.
- **PBT-06**: N/A; no stateful PBT model is introduced.
- **PBT-07**: N/A; no PBT generators are required for Unit 1.
- **PBT-08**: N/A for Unit 1 because no PBT runs are introduced.
- **PBT-09**: Deferred to Unit 3 or a later NFR stage if PBT framework installation is required.
- **PBT-10**: Compliant. Unit 1 uses example-based tests only because PBT is N/A under the approved unit plan.
