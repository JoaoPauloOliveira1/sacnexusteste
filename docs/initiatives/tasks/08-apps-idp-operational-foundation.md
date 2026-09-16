# Apps IDP Operational Foundation Tasks

Execution checklist for [`docs/initiatives/prds/08-apps-idp-operational-foundation.md`](../prds/08-apps-idp-operational-foundation.md).

## Phase 1: Planning And Governance

- [x] Create IDP operational foundation PRD.
- [x] Create IDP operational foundation execution plan.
- [x] Review `idp-architecture-discussion.md` before implementation and keep this task scoped to the second roadmap item.
- [x] Confirm no Better Auth, database, OpenTelemetry, metrics, Sentry, Orval generation, or IDP CI work is added to this setup task.

## Phase 2: Dependencies

- [x] Add `@fastify/swagger` with pnpm CLI.
- [x] Add `@fastify/swagger-ui` with pnpm CLI.
- [x] Do not add request ID, OpenTelemetry, metrics, Sentry, log shipping, or Orval dependencies in this step.

## Phase 3: Folder Structure

- [x] Create `src/entrypoint/routes` for HTTP route registration.
- [x] Create `src/entrypoint/plugins` for Fastify plugin registration.
- [x] Create focused `src/infra` folders for HTTP request IDs, logging/canonical events, and request context.
- [x] Create `src/usecases/operational` for health/readiness use cases, matching the entrypoint route context.
- [x] Create `src/usecases/dependencies` for small default use case dependencies.
- [x] Mirror new layers under `tests/unit` as needed.

## Phase 4: Health And Readiness Use Cases

- [x] Implement health use case returning minimal non-sensitive liveness data.
- [x] Implement readiness use case returning minimal non-sensitive readiness data.
- [x] Return `checks: []` from readiness while no external dependencies exist.
- [x] Avoid exposing version, commit SHA, host, PID, IP, memory, uptime, or environment values in public probe payloads.

## Phase 5: Health And Readiness Routes

- [x] Register `GET /health`.
- [x] Register `GET /ready`.
- [x] Attach explicit JSON schemas for route responses.
- [x] Add stable OpenAPI tags and operation IDs for both routes.
- [x] Ensure route handlers call use cases rather than embedding response construction directly in the handler.

## Phase 6: Request ID

- [x] Resolve the canonical request ID from `x-request-id` when present.
- [x] Use `x-correlation-id` as fallback when `x-request-id` is absent.
- [x] Generate a safe request ID when neither header is present.
- [x] Echo the final request ID in the `x-request-id` response header.
- [x] Include the request ID in request logs and canonical events.
- [x] Keep frontend-generated request IDs non-authoritative in documentation.

## Phase 7: Structured Logging And Redaction

- [x] Configure Fastify/Pino JSON logging.
- [x] Configure redaction for `authorization`, `cookie`, `set-cookie`, and `x-api-key` headers.
- [x] Configure redaction for common sensitive fields such as `password`, `token`, `secret`, `otp`, and `backupCode`.
- [x] Ensure request bodies are not logged by default.
- [x] Ensure response bodies are not logged by default.
- [x] Document that credentials, cookies, tokens, OTPs, backup codes, CPF, CNPJ, email, and sensitive personal data must not be logged.

## Phase 8: RequestContext And Canonical Event

- [x] Implement explicit `RequestContext` creation in the entrypoint layer.
- [x] Implement `CanonicalEventBuilder` or equivalent recorder in `src/infra/logging`.
- [x] Initialize canonical events with safe request fields only.
- [x] Add intentional methods for canonical event enrichment.
- [x] Add sanitized error recording behavior.
- [x] Ensure use cases can receive `RequestContext` as an explicit argument.
- [x] Ensure routine request lifecycle logs are emitted once at the end of each request.
- [x] Avoid `AsyncLocalStorage` in this implementation.

## Phase 9: OpenAPI And Swagger

- [x] Register `@fastify/swagger`.
- [x] Register `@fastify/swagger-ui`.
- [x] Expose Swagger UI at `GET /docs` outside production.
- [x] Expose OpenAPI JSON at `GET /openapi.json` outside production.
- [x] Disable Swagger UI and OpenAPI JSON in `IDP_APP_ENV=production`.
- [x] Add stable `operationId` values for health/readiness operations.
- [x] Add tags for health/readiness operations.
- [x] Add explicit response schemas so the spec is Orval-ready.
- [x] Do not add Orval config or generated clients in this step.

## Phase 10: Unit Tests

- [x] Add unit tests for health use case payload.
- [x] Add unit tests for readiness use case payload and empty checks.
- [x] Add unit tests for request ID resolution.
- [x] Add unit tests for `CanonicalEventBuilder` initialization.
- [x] Add unit tests for canonical event enrichment.
- [x] Add unit tests for sanitized error output.

## Phase 11: Route Tests

- [x] Add `fastify.inject()` test for `GET /health`.
- [x] Add `fastify.inject()` test for `GET /ready`.
- [x] Add route test confirming generated `x-request-id` response header.
- [x] Add route test confirming inbound `x-request-id` propagation.
- [x] Add route test confirming `x-correlation-id` fallback.
- [x] Add route test confirming one canonical event is emitted per request.
- [x] Add route test confirming `/docs` and `/openapi.json` are available outside production.
- [x] Add route test confirming `/docs` and `/openapi.json` are disabled in production.

## Phase 12: Documentation

- [x] Update `apps/idp/README.md` with `/health`, `/ready`, `/docs`, and `/openapi.json` behavior.
- [x] Update `apps/idp/AGENTS.md` with request context and canonical event rules.
- [x] Update `docs/idp/architecture.md` with focused `src/infra` folders, `src/usecases/operational`, and request context guidance.
- [x] Update `docs/idp/testing.md` with Fastify route testing guidance.
- [x] Update `docs/idp/security.md` with log redaction and no-PII canonical event rules.
- [x] Document future sampling, tail sampling, OpenTelemetry, metrics, Sentry, log shipping, and Orval generation as deferred work.

## Phase 13: Verification

- [x] Run `pnpm install` after dependency changes.
- [x] Run `pnpm --filter idp check`.
- [x] Run `pnpm --filter idp typecheck`.
- [x] Run `pnpm --filter idp test`.
- [x] Run `pnpm --filter idp test:coverage`.
- [x] Run `pnpm --filter idp build`.
- [x] Start the IDP locally and manually confirm `/health`.
- [x] Start the IDP locally and manually confirm `/ready`.
- [x] Start the IDP locally and manually confirm `/openapi.json` outside production.
- [x] Confirm `/openapi.json` includes stable operation IDs and response schemas.

## Phase 14: Roadmap Update

- [x] Mark the second IDP baby step complete in `idp-architecture-discussion.md` after implementation and verification.

## Phase 15: Future Enhancements

- [ ] Implement sampling and tail sampling for canonical events.
- [ ] Add OpenTelemetry tracing and trace/log correlation.
- [ ] Add metrics and dashboards.
- [ ] Add Sentry for server-side IDP errors if approved for all apps/services.
- [ ] Add database and Better Auth readiness checks when those dependencies exist.
- [ ] Add Orval generation when custom IDP endpoints are consumed by `apps/web`.
