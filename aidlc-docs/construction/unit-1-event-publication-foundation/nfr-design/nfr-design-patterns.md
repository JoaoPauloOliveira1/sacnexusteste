# NFR Design Patterns: Unit 1 Event Publication Foundation

## Overview

Unit 1 incorporates NFR requirements through a minimal event publication design: a stable event registry, constant-size safe event construction, and a no-op publisher. The design preserves existing auth behavior while creating a replaceable seam for future audit, observability, and durable event delivery work.

## Resilience Patterns

### Best-Effort No-op Publisher

- **Pattern**: Best-effort publication with a no-op implementation.
- **Decision**: The Unit 1 publisher resolves without external calls, I/O, logs, persistence, queues, or event bus writes.
- **Expected Behavior**: Publishing an event must never change auth operation status, headers, cookies, or sanitized response payloads.
- **Failure Handling**: The no-op publisher is designed not to throw. Future durable publishers must define explicit failure behavior before replacing it.

### Auth Boundary Preservation

- **Pattern**: Better Auth remains the source of auth behavior.
- **Decision**: Event emission happens after supported Better Auth API calls return controlled results or controlled errors available to the use case.
- **Expected Behavior**: Unit 1 does not reimplement credential validation, cookie/session behavior, token handling, email verification, password reset internals, or Better Auth private internals.

## Scalability Patterns

### Replaceable Publisher Interface

- **Pattern**: Stable interface with deferred infrastructure.
- **Decision**: Use cases depend on an event publisher interface instead of a concrete durable delivery mechanism.
- **Deferred Components**: Queue, outbox, worker, event bus, durable audit store, and external publisher are explicitly deferred.
- **Future Path**: A durable publisher can be introduced later behind the same interface after failure semantics, storage model, retention, alerting, and replay behavior are designed.

### Central Event Registry

- **Pattern**: Registry-based contract governance.
- **Decision**: Event names, operation labels, outcomes, and allowed payload fields are defined centrally.
- **Expected Behavior**: Use cases reference registry values and do not invent inline event names or payload fields.
- **Future Path**: The registry becomes the contract source for later audit persistence, observability mappings, and integration events.

## Performance Patterns

### Constant-Size Event Construction

- **Pattern**: Allowlisted event creation with bounded work.
- **Decision**: Event construction uses only approved safe fields already available to the use case.
- **Avoided Work**: No deep inspection, whole-request serialization, whole-response serialization, body scanning, network calls, database writes, file I/O, or runtime per-event logging.
- **Expected Behavior**: Event emission adds effectively no measurable runtime overhead in Unit 1.

### No Runtime Sanitizer

- **Pattern**: Prevent unsafe inputs rather than sanitize arbitrary payloads.
- **Decision**: Unit 1 does not accept arbitrary event payloads that require complex runtime stripping.
- **Rationale**: A runtime sanitizer would add transformation complexity and could create false confidence. Payload safety is enforced by registry allowlisting and tests.

## Security Patterns

### Payload Allowlist

- **Pattern**: Explicit safe-field construction.
- **Allowed Fields**: `name`, `outcome`, `operation`, `reason_code`, `request_id`, `user_id`, `tenant_id`, and `occurred_at`.
- **Forbidden Data**: Passwords, tokens, cookies, raw email addresses, request bodies, response bodies, verification/reset URLs, rendered email content, CPF, CNPJ, phone numbers, addresses, domain profile data, session tokens, raw provider responses, and unapproved session IDs.
- **Reason Codes**: Reason codes are symbolic and non-sensitive; they do not contain raw error messages, stack traces, user input, provider details, or personal data.

### Test-Only Sensitive Data Assertion Helper

- **Pattern**: Reusable test guard for representative leakage cases.
- **Decision**: Tests use a reusable helper to assert forbidden keys and representative forbidden values are absent from emitted events.
- **Scope**: The helper is test-only and is not a runtime sanitizer.

## Observability Patterns

### Existing Structured Request Logging

- **Pattern**: Preserve current canonical request-completion logging.
- **Decision**: Unit 1 does not add runtime logs for every event from the no-op publisher.
- **Expected Behavior**: Existing structured request logs remain the operational signal in this unit, while event contracts prepare future observability and audit integration.

## Maintainability Patterns

### Use-Case Injection

- **Pattern**: Publisher dependency injection at the use-case boundary.
- **Decision**: Auth wrapper use cases receive or access the publisher through a single dependency seam suitable for test doubles.
- **Expected Behavior**: Unit tests can verify event publication without external infrastructure or log inspection.

### Minimal Contract Surface

- **Pattern**: Small event model with no arbitrary payload bag.
- **Decision**: The event object uses named fields only and avoids open-ended metadata objects in Unit 1.
- **Expected Behavior**: Future extensions must update the registry and tests before new payload fields are used.

## Testing Patterns

- Use existing Vitest only.
- Use publisher test doubles to verify event publication for all auth wrapper flows in scope.
- Verify controlled Better Auth error/results publish failure events where controlled failure information exists.
- Verify auth behavior and sanitized responses are preserved after event wiring.
- Verify forbidden representative keys and values do not appear in emitted event payloads.

## Security Compliance

- **SECURITY-03**: Compliant. Event payloads are no-PII/no-secret and the no-op publisher does not add per-event runtime logs.
- **SECURITY-05**: Compliant. Payload construction uses a central allowlist and avoids arbitrary payload fields.
- **SECURITY-08**: N/A. Unit 1 adds no protected resource endpoint.
- **SECURITY-09**: Compliant. No new production error detail exposure is introduced.
- **SECURITY-10**: Compliant. No new runtime or dev dependency is required for Unit 1 NFR Design.
- **SECURITY-11**: Compliant. Event publication is isolated behind dedicated event components and considers misuse through forbidden payload categories.
- **SECURITY-12**: Compliant. Better Auth internals remain the auth boundary and are not reimplemented.
- **SECURITY-13**: Compliant. The event registry and publisher seam prepare future audit/data integrity work without premature storage.
- **SECURITY-15**: Compliant. No-op publisher behavior cannot reduce auth availability or fail open.

## PBT Compliance

- **PBT-01**: N/A for this NFR Design because Unit 1 intentionally avoids property-bearing transformations.
- **PBT-02**: N/A. No round-trip transformation is introduced.
- **PBT-03**: N/A unless code generation introduces non-trivial runtime sanitization, normalization, or transformation.
- **PBT-04**: N/A. No idempotent transformation is introduced.
- **PBT-05**: N/A. No oracle or reference model is used.
- **PBT-06**: N/A. Unit 1 adds no stateful model requiring stateful PBT.
- **PBT-07**: N/A. No PBT generators are required in Unit 1.
- **PBT-08**: N/A. No PBT runs are introduced in Unit 1.
- **PBT-09**: Deferred. PBT framework selection remains deferred to Unit 3 or a later applicable NFR stage.
- **PBT-10**: Compliant. Unit 1 uses example-based tests, with PBT explicitly revisited if implementation adds property-bearing transformations.
