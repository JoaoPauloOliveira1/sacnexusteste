# Unit 1 Code Generation Plan: IDP Event Publication Foundation

## Purpose

This plan is the single source of truth for Unit 1 Code Generation. It defines the exact application-code and documentation changes required to add safe identity event publication to existing IDP auth wrapper flows.

## Unit Context

- **Unit**: Unit 1: IDP Event Publication Foundation.
- **Workspace Root**: `<workspace-root>`.
- **Application Code Location**: `apps/idp` only.
- **Documentation Location**: `aidlc-docs/construction/unit-1-event-publication-foundation/code/` for AI-DLC code summaries only.
- **Primary Story**: US-01: Publish Safe Identity Events From Existing Auth Flows.
- **Dependencies**: None. Unit 1 must complete before Units 2, 3, and 4 use event publication.
- **Database Entities**: None. Unit 1 does not add schema, migrations, durable audit storage, queues, outbox tables, or workers.
- **Infrastructure**: None. Unit 1 does not add deployment artifacts, monitoring dashboards, runtime per-event logging, queues, or external publishers.

## Existing Structure Reviewed

- `apps/idp/src/entrypoint/dependencies.ts` creates runtime dependencies.
- `apps/idp/src/entrypoint/routes/auth/**/route.ts` routes call identity use cases.
- `apps/idp/src/usecases/identity/*.ts` owns auth wrapper use-case behavior.
- `apps/idp/src/infra/request-context/request-context.ts` exposes `requestId` and canonical request logging context.
- `apps/idp/tests/unit/entrypoint/app.test.ts` covers route-level auth wrappers using `fastify.inject()` and dependency test doubles.
- Existing unit tests do not have identity use-case tests yet.

## Design Constraints From Approved Artifacts

- Event payloads use allowlisted fields only.
- No passwords, tokens, cookies, raw emails, request bodies, response bodies, verification/reset URLs, rendered email content, CPF, CNPJ, phone numbers, addresses, domain profile data, session tokens, raw provider responses, or unapproved session IDs in events.
- No-op publisher must not perform I/O, external calls, queue writes, database writes, file writes, or runtime logs.
- Event publication must not change auth responses, headers, cookies, or sanitized payloads.
- Future durable publishers must define explicit failure behavior before replacing the no-op publisher.
- Use existing Vitest only; no PBT framework in Unit 1.
- If code generation introduces complex runtime sanitization or property-bearing transformations, stop and update this plan with PBT before implementation completes.

## Story Traceability

| Story | Coverage In This Plan |
|---|---|
| US-01 | Define event contracts, registry, no-op publisher, event helper, auth use-case event wiring, and tests for invocation and payload safety. |

## Expected Application-Code Files

### New Files

- `apps/idp/src/events/identity-event.ts`
- `apps/idp/src/events/identity-event-registry.ts`
- `apps/idp/src/events/identity-event-publisher.ts`
- `apps/idp/src/events/index.ts`
- `apps/idp/tests/unit/events/identity-event.test.ts`
- `apps/idp/tests/unit/usecases/identity/identity-events.test.ts`
- `apps/idp/tests/unit/test-support/assert-identity-event-safety.ts`

### Modified Files

- `apps/idp/src/entrypoint/dependencies.ts`
- `apps/idp/src/usecases/identity/sign-up-with-email.ts`
- `apps/idp/src/usecases/identity/sign-in-with-email.ts`
- `apps/idp/src/usecases/identity/sign-out.ts`
- `apps/idp/src/usecases/identity/get-auth-session.ts`
- `apps/idp/src/usecases/identity/get-auth-ok.ts`
- `apps/idp/src/usecases/identity/verify-email.ts`
- `apps/idp/src/usecases/identity/send-verification-email.ts`
- `apps/idp/src/usecases/identity/request-password-reset.ts`
- `apps/idp/src/usecases/identity/reset-password.ts`
- `apps/idp/src/usecases/identity/change-password.ts`
- `apps/idp/tests/unit/entrypoint/app.test.ts`

## Code Generation Steps

### Step 1: Event Contract Generation

- [x] Create `apps/idp/src/events/identity-event-registry.ts` with event names, operation labels, outcomes, reason codes, and allowed payload fields.
- [x] Create `apps/idp/src/events/identity-event.ts` with the `IdentityEvent` type and a small event factory/helper that only accepts allowlisted safe fields.
- [x] Create `apps/idp/src/events/identity-event-publisher.ts` with `IdentityEventPublisher`, `noopIdentityEventPublisher`, and future-publisher failure-behavior documentation in code comments only where useful.
- [x] Create `apps/idp/src/events/index.ts` to expose the event module public API.

### Step 2: Event Contract Unit Tests

- [x] Create `apps/idp/tests/unit/test-support/assert-identity-event-safety.ts` with reusable forbidden-key and forbidden-value assertions.
- [x] Create `apps/idp/tests/unit/events/identity-event.test.ts` to verify registry values, allowed fields, no-op publisher behavior, event creation, and forbidden representative values.

### Step 3: Runtime Dependency Wiring

- [x] Modify `apps/idp/src/entrypoint/dependencies.ts` so `AppDependencies` includes an `identityEvents` or equivalent event publisher dependency.
- [x] Configure production dependency creation to use the no-op publisher.
- [x] Preserve existing `auth`, `database`, and `close` behavior.
- [x] Avoid logging or external side effects from the event publisher.

### Step 4: Auth Use-Case Event Wiring

- [x] Modify each auth wrapper use case to accept the publisher dependency and publish safe events after controlled Better Auth responses or controlled local failures.
- [x] Cover these operation labels: `sign_up_email`, `sign_in_email`, `sign_out`, `get_session`, `auth_ok`, `verify_email`, `send_verification_email`, `request_password_reset`, `reset_password`, and `change_password`.
- [x] Emit controlled failure events for local password-policy failures and controlled Better Auth response statuses where available.
- [x] Preserve response status, headers, cookies, and sanitized payload behavior.
- [x] Do not parse Better Auth private internals or include raw user input in event payloads.

### Step 5: Route-Level Dependency Updates

- [x] Update route calls as needed so each auth use case receives the event publisher dependency from `AppDependencies`.
- [x] Update `apps/idp/tests/unit/entrypoint/app.test.ts` test dependency factory to include the no-op or test-compatible publisher dependency.
- [x] Preserve existing route tests and Fastify injection behavior.

### Step 6: Identity Use-Case Event Tests

- [x] Create `apps/idp/tests/unit/usecases/identity/identity-events.test.ts` with publisher test doubles.
- [x] Verify event publication is invoked for all Unit 1 auth wrapper flows.
- [x] Verify selected success and controlled failure outcomes.
- [x] Verify request ID is included and raw emails, passwords, tokens, cookies, reset URLs, verification URLs, request bodies, and response bodies are absent from emitted events.
- [x] Verify event publication does not alter returned `Response` objects.

### Step 7: AI-DLC Code Summary

- [x] Create `aidlc-docs/construction/unit-1-event-publication-foundation/code/unit-1-code-summary.md` summarizing created/modified files, story coverage, security checks, PBT status, and verification commands.
- [x] Do not update durable docs in `docs/` or README files in this unit; Unit 5 owns final documentation and roadmap updates after verified implementation.

### Step 8: Local Verification

- [x] Run `pnpm --filter idp test`.
- [x] Run `pnpm --filter idp typecheck`.
- [x] Run `pnpm --filter idp check`.
- [x] If verification fails, fix Unit 1 issues and rerun the relevant command.

### Step 9: Progress And Completion Gate

- [x] Mark each completed plan step `[x]` immediately after completion.
- [x] Update `aidlc-docs/aidlc-state.md` and `aidlc-docs/audit.md` after code generation completes.
- [ ] Present the standardized Code Generation completion message and wait for approval before moving to Unit 2 or Build and Test.

## Security Compliance Plan

- **SECURITY-03**: Ensure no per-event runtime logging and no sensitive data in emitted events.
- **SECURITY-05**: Use registry allowlisting and tests for event fields.
- **SECURITY-08**: N/A; no protected endpoint is added.
- **SECURITY-09**: Preserve existing safe production response behavior.
- **SECURITY-10**: No new dependencies.
- **SECURITY-11**: Isolate event publication in `apps/idp/src/events`.
- **SECURITY-12**: Keep Better Auth internals untouched.
- **SECURITY-13**: Provide a stable future audit seam without storage.
- **SECURITY-15**: Keep no-op publisher side-effect-free and auth-availability-neutral.

## PBT Compliance Plan

- **PBT-01 through PBT-08**: N/A unless implementation introduces non-trivial transformations.
- **PBT-09**: Deferred to Unit 3 or a later applicable NFR stage.
- **PBT-10**: Example-based Vitest tests remain required for Unit 1 critical paths.

## Approval Gate

Code generation will not start until this entire plan is approved.

### Question 1
How should AI-DLC proceed with Unit 1 Code Generation?

A) Request changes to this code generation plan
B) Approve this plan and start code generation
C) Other (please describe after [Answer]: tag below)

[Answer]: B
