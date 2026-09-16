# Logical Components: Unit 1 Event Publication Foundation

## Overview

Unit 1 NFR Design uses small logical components to keep event publication safe, testable, and replaceable. The design does not introduce runtime infrastructure components such as queues, outbox tables, workers, event buses, durable audit stores, caches, or circuit breakers.

## Component Summary

| Component | Responsibility | Runtime Side Effects | Unit 1 Status |
|---|---|---:|---|
| Identity Event Registry | Defines event names, operation labels, outcomes, and allowed payload fields | No | Required |
| Identity Event Factory/Helper | Builds event objects from safe allowlisted values | No | Required |
| Identity Event Publisher Interface | Defines the publication seam | No | Required |
| No-op Identity Event Publisher | Accepts events and resolves without side effects | No | Required |
| Use-Case Publisher Injection | Makes auth use cases publish through the interface and enables test doubles | No | Required |
| Sensitive Data Assertion Helper | Test-only helper for forbidden keys and representative forbidden values | No runtime use | Required |

## Identity Event Registry

### Purpose

Provide the durable code-level event contract for Unit 1.

### Responsibilities

- Define valid event names for existing auth wrapper flows.
- Define valid operation labels.
- Define valid outcomes: `succeeded`, `failed`, and `skipped`.
- Define allowed payload field names.
- Prevent arbitrary inline event names and fields.

### NFR Contribution

- **Security**: Enforces allowlisted payload shape.
- **Maintainability**: Centralizes event taxonomy and avoids contract drift.
- **Scalability**: Prepares a stable contract for future durable publishers and audit storage.

## Identity Event Factory/Helper

### Purpose

Create `IdentityEvent` objects from safe values already known to the use case.

### Responsibilities

- Select the event name from the registry.
- Select the operation label from the registry.
- Assign outcome and timestamp.
- Include only approved optional fields when already known and safe.
- Avoid request/response body inspection and arbitrary metadata bags.

### NFR Contribution

- **Performance**: Uses constant-size construction with no expensive serialization or I/O.
- **Security**: Prevents arbitrary payload inclusion.
- **PBT**: Avoids complex transformations, keeping Unit 1 example-test-only.

## Identity Event Publisher Interface

### Purpose

Define the replaceable publisher contract.

### Responsibilities

- Accept an `IdentityEvent`.
- Return `Promise<void>`.
- Hide concrete publisher implementation details from auth use cases.

### NFR Contribution

- **Availability**: Allows Unit 1 to use a no-op publisher that cannot reduce auth availability.
- **Scalability**: Supports future durable publisher replacement without changing every use case.
- **Testing**: Enables publisher test doubles in Vitest.

## No-op Identity Event Publisher

### Purpose

Provide the initial publisher implementation for Unit 1.

### Responsibilities

- Accept events through the publisher interface.
- Resolve without database writes, network calls, file I/O, queue writes, event bus writes, or logs.
- Avoid throwing under normal implementation behavior.

### NFR Contribution

- **Performance**: Adds effectively no measurable overhead.
- **Availability**: Cannot reduce auth flow availability.
- **Observability**: Does not increase log volume or leakage risk.

## Use-Case Publisher Injection

### Purpose

Wire event publication into existing auth wrapper use cases without coupling them to infrastructure.

### Responsibilities

- Provide the publisher dependency to auth wrapper use cases.
- Publish events after controlled Better Auth results or controlled failures.
- Preserve existing auth responses, headers, cookies, and sanitized payloads.
- Support test doubles for invocation assertions.

### NFR Contribution

- **Resilience**: Keeps auth behavior independent from event infrastructure.
- **Maintainability**: Keeps event publication consistent across use cases.
- **Testing**: Allows event assertions without external services.

## Sensitive Data Assertion Helper

### Purpose

Provide a reusable test helper for event payload safety checks.

### Responsibilities

- Assert emitted event objects do not include forbidden key names.
- Assert serialized event payloads do not include representative forbidden values supplied by tests.
- Stay test-only and avoid becoming runtime sanitization logic.

### NFR Contribution

- **Security**: Guards against representative PII/secret leakage cases.
- **Maintainability**: Prevents duplicated sensitive-data assertions across event tests.
- **PBT**: Keeps Unit 1 example-based while preserving a clear trigger to revisit PBT if runtime transformations are added.

## Explicitly Excluded Logical Components

The following components are not part of Unit 1 NFR Design:

- Durable audit/event persistence.
- Queue, outbox, worker, or event bus.
- External publisher or webhook integration.
- Runtime per-event logger.
- Circuit breaker, retry policy, dead-letter queue, or replay mechanism.
- In-memory event buffer.
- Monitoring dashboard or alerting rule.
- Runtime sanitizer for arbitrary event payloads.
- PBT framework setup.

## Component Interaction

1. Auth route calls the auth wrapper use case.
2. Use case calls supported Better Auth APIs.
3. Use case receives a controlled result or controlled error/result.
4. Use case selects registry values and passes safe fields to the event factory/helper.
5. Event factory/helper creates an `IdentityEvent` using allowlisted fields.
6. Use case sends the event to the publisher interface.
7. No-op publisher resolves without side effects.
8. Use case returns the existing auth response semantics.

## Security Compliance

- **SECURITY-03**: Compliant. No runtime per-event logging is added and payload tests protect against representative sensitive data leakage.
- **SECURITY-05**: Compliant. Registry and event factory/helper enforce allowed payload fields.
- **SECURITY-08**: N/A. No new protected endpoint is introduced.
- **SECURITY-09**: Compliant. No new user-facing error detail exposure is introduced.
- **SECURITY-10**: Compliant. No new dependencies are required.
- **SECURITY-11**: Compliant. Event concerns are isolated into dedicated components with explicit misuse constraints.
- **SECURITY-12**: Compliant. Auth implementation remains inside Better Auth supported APIs.
- **SECURITY-13**: Compliant. Registry and publisher interface create a future audit/integrity seam.
- **SECURITY-15**: Compliant. No-op publisher has no external failure source and cannot reduce auth availability.

## PBT Compliance

- Unit 1 logical components avoid non-trivial property-bearing transformations.
- Example-based Vitest coverage remains the selected test approach.
- If code generation introduces complex sanitization, normalization, parsing, formatting, or idempotent transformations, the code generation plan must add PBT before implementation completes.
