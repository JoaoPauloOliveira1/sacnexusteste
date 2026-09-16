# Apps IDP Operational Foundation PRD

## Overview

This document defines the second incremental implementation step for `apps/idp`.

The goal is to add a minimal operational foundation to the IDP: health/readiness endpoints, structured JSON logs, request/correlation ID handling, a request-scoped canonical event model, and minimal OpenAPI/Swagger exposure prepared for future Orval usage.

Execution plan: [`docs/initiatives/tasks/08-apps-idp-operational-foundation.md`](../tasks/08-apps-idp-operational-foundation.md).

## Product Context

The IDP is security-critical infrastructure for SAC Nexus. It will later own Better Auth integration, session handling, tenant membership, broad roles/permissions, and identity events.

Before adding database or authentication behavior, the service needs basic operational visibility and probe endpoints so future layers can be validated safely.

This PRD covers only the second baby step from `idp-architecture-discussion.md`: add basic health/readiness endpoints, structured JSON logs, request/correlation ID, and minimal OpenAPI/Swagger setup.

## Goals

- Add `/health` as the IDP liveness endpoint.
- Add `/ready` as the IDP readiness endpoint.
- Return small, non-sensitive health/readiness payloads.
- Generate or propagate a canonical `x-request-id` per request.
- Echo the final request ID in the `x-request-id` response header.
- Use structured JSON logs through Fastify/Pino.
- Apply strong redaction before auth-related flows exist.
- Avoid logging request or response bodies by default.
- Implement a request-scoped `RequestContext` with a `CanonicalEventBuilder`.
- Let use cases enrich canonical request events without emitting scattered logs.
- Emit one canonical request event at the end of each request.
- Add minimal OpenAPI/Swagger setup with Orval-ready operation metadata.
- Keep Swagger/OpenAPI available outside production only.
- Add unit and route-level tests using Vitest and `fastify.inject()`.

## Non-Goals

- No Better Auth integration in this step.
- No database, Drizzle, PostgreSQL, or external readiness checks in this step.
- No OpenTelemetry tracing in this step.
- No Prometheus or metrics endpoint in this step.
- No Sentry integration in this step.
- No log shipping, data warehouse, Kafka, queue, or collector integration in this step.
- No sampling implementation in this step.
- No Orval client generation in this step.
- No CI/pipeline coverage changes for the IDP in this step.
- No authentication, authorization, tenant resolution, rate limiting, or security headers in this step.

## Decisions

### Operational Scope

This step should implement a real but minimal operational slice.

It includes:

- Liveness and readiness routes.
- Request ID propagation.
- JSON structured logging.
- Redaction defaults.
- A request-scoped canonical event model.
- Minimal OpenAPI/Swagger registration.

It should not become the full observability architecture. OpenTelemetry, metrics, Sentry, sampling, log warehousing, and alerting are deferred.

### Health And Readiness Paths

Use simple probe paths:

- `GET /health` for liveness.
- `GET /ready` for readiness.

Do not place these under `/api`, `/api/auth`, or versioned API paths in this step. These endpoints are operational probes and should not depend on public API topology.

### Health Payloads

Keep payloads minimal and non-sensitive.

`/health` should return a small liveness payload such as:

```json
{
  "status": "ok",
  "service": "idp",
  "timestamp": "2026-05-12T00:00:00.000Z"
}
```

`/ready` should return a readiness payload such as:

```json
{
  "status": "ready",
  "service": "idp",
  "timestamp": "2026-05-12T00:00:00.000Z",
  "checks": []
}
```

While there is no database, Better Auth storage, queue, cache, or external dependency, `/ready` should return `200` with `checks: []`. Future dependencies can add checks and return `503` when the service is not ready.

Do not include version, commit SHA, host, PID, IP, memory, uptime, or environment values in public probe payloads in this step.

### Request ID And Correlation

Use `x-request-id` as the canonical request/correlation ID header.

Rules:

- Accept `x-request-id` from trusted upstream infrastructure when present.
- Accept `x-correlation-id` as a fallback input if `x-request-id` is absent.
- Generate a safe ID when neither header is present.
- Use one final request ID internally for the full request lifecycle.
- Echo that value in the `x-request-id` response header.
- Include the request ID in request logs and canonical events.

The frontend should not be the authority for request IDs. In production, the proxy/load balancer/ingress or the IDP should normalize the ID.

### Structured Logs And Redaction

Use Fastify's native Pino integration for structured JSON logs.

Initial redaction must cover sensitive headers and common auth fields, including:

- `authorization`
- `cookie`
- `set-cookie`
- `x-api-key`
- `password`
- `token`
- `secret`
- `otp`
- `backupCode`

Do not log request bodies or response bodies by default.

Do not log credentials, cookies, tokens, OTPs, backup codes, CPF, CNPJ, email, or other sensitive personal data.

### Canonical Events And Wide Logging

Adopt the canonical log line / wide event idea in a restrained way.

The IDP should emit one canonical event at the end of each HTTP request. This event should be context-rich enough for operational debugging, but poor in personal data.

Initial canonical event fields should be limited to safe operational data:

- `event`
- `service`
- `request_id`
- `method`
- `path`
- `status_code`
- `duration_ms`
- `outcome`
- `app_env`
- sanitized `error` details when there is a failure

Do not include raw query strings, request bodies, response bodies, full user-agent strings, IP addresses, user IDs, tenant IDs, emails, CPF, CNPJ, session IDs, cookies, or tokens in this step.

### RequestContext Design

Use an explicit `RequestContext` instead of implicit global context.

`RequestContext` should be created in the `entrypoint` layer for each HTTP request and passed into use cases that need request-scoped context.

It should carry:

- `request_id`
- a contextual logger when needed
- a `CanonicalEventBuilder` or equivalent recorder

Use cases may enrich the canonical event through methods on the builder/recorder. They should not mutate a free-form object directly and should not emit routine request lifecycle logs themselves.

The final canonical event must be emitted by the `entrypoint` layer once, after the request completes.

Avoid `AsyncLocalStorage` in this step. It can be revisited if explicit context passing becomes too noisy, but the initial architecture should favor visible dependencies and testability.

### CanonicalEventBuilder Design

The canonical event should be encapsulated behind a small builder/recorder API.

Expected behavior:

- Initialize with stable request fields.
- Provide intentional methods for enrichment.
- Prevent accidental leakage of sensitive or arbitrary fields where practical.
- Support error sanitization.
- Produce a serializable object through `toJSON()` or equivalent.

Future extensions can add intentional methods such as `setAuthContext`, `setTenantContext`, or `setDependencyCheck`, but those fields should not be introduced before the corresponding domains exist.

### Folder Architecture

Keep layer boundaries explicit.

Planned structure additions:

```txt
apps/idp/
  src/
    config/
      service.ts
    entrypoint/
      app.ts
      routes/
      plugins/
    infra/
      http/
        request-id.ts
      logging/
        canonical-event.ts
        logger.ts
      request-context/
        request-context.ts
    usecases/
      dependencies/
        clock.ts
      operational/
        get-health.ts
        get-readiness.ts
```

Layer intent:

- `src/entrypoint` owns Fastify composition, plugins, route registration, and HTTP transport concerns.
- `src/config/service.ts` owns the stable service identifier emitted by API payloads, OpenAPI examples, and logs.
- `src/infra/http` owns request ID helpers.
- `src/infra/logging` owns canonical event building and logger/redaction config.
- `src/infra/request-context` owns explicit request context creation.
- `src/usecases/operational` owns health/readiness application behavior and response construction, matching the `operational` entrypoint route context.
- `src/usecases/dependencies` owns small default dependencies such as `clock`, which use cases may import directly while still allowing explicit test overrides.

### OpenAPI And Swagger

Expose minimal OpenAPI/Swagger metadata for the custom IDP endpoints added in this step.

OpenAPI should be Orval-ready:

- Every operation has a stable `operationId`.
- Endpoints are grouped with tags.
- Responses have explicit schemas.
- Shared schemas are reused where practical.

Do not install or configure Orval in this step. Generating a client for only health/readiness endpoints is not useful enough to justify the extra tooling now.

Future Orval integration should target custom IDP endpoints consumed by `apps/web`, not Better Auth-native flows that are better handled by the official Better Auth client.

### OpenAPI Exposure

Expose Swagger UI and JSON only outside production.

Recommended paths:

- `GET /docs` for Swagger UI.
- `GET /openapi.json` for the OpenAPI document.

In `IDP_APP_ENV=production`, these routes should be disabled by default until an explicit production documentation policy is approved.

### Dependencies

Add only the minimum dependencies needed for this step.

Runtime dependencies:

- `@fastify/swagger`
- `@fastify/swagger-ui`

Use Fastify/Pino native behavior for logging and request ID behavior. Do not add OpenTelemetry, Sentry, metrics, log shipping, or request ID plugins in this step.

### Testing

Use unit tests and Fastify route tests.

Required coverage:

- Unit tests for health/readiness use cases.
- Unit tests for request ID resolution.
- Unit tests for `CanonicalEventBuilder` behavior and error sanitization.
- Route tests with `fastify.inject()` for `/health` and `/ready`.
- Route tests confirming `x-request-id` is generated or propagated.
- Route tests confirming canonical event emission happens once per request.
- Route tests confirming OpenAPI routes are available outside production.
- Route tests confirming OpenAPI routes are disabled in production mode.

Do not add E2E tests or tests requiring a real network port.

### Documentation

Update durable IDP docs after implementation:

- `docs/idp/architecture.md` for layer and request-context guidance.
- `docs/idp/testing.md` for route testing with `fastify.inject()`.
- `docs/idp/security.md` for log redaction and no-PII logging rules.

Update `apps/idp/README.md` with operational endpoints and local docs paths.

### Future Observability Enhancements

The following are intentionally deferred but must remain visible as future work:

- Sampling for canonical events.
- Tail sampling rules that always retain errors and slow requests.
- OpenTelemetry trace/span propagation.
- Metrics and dashboards.
- Sentry error monitoring across apps/services.
- Log shipping/collector integration.
- Data warehouse or long-term canonical event archival.
- Tenant/user/auth context enrichment after those domains exist.

## Functional Requirements

- `GET /health` returns `200` with a minimal liveness payload.
- `GET /ready` returns `200` with a minimal readiness payload and `checks: []` while no dependencies exist.
- Requests without `x-request-id` receive a generated `x-request-id` response header.
- Requests with `x-request-id` preserve that ID when safe.
- Requests with only `x-correlation-id` use it as fallback for the final request ID.
- Every completed request emits one canonical event log.
- Routine request logs and canonical events do not include request/response bodies.
- Sensitive headers and known sensitive fields are redacted.
- `/docs` and `/openapi.json` are available outside production.
- `/docs` and `/openapi.json` are disabled in production.
- OpenAPI operations have stable operation IDs and response schemas.

## Non-Functional Requirements

- The implementation must remain small and understandable.
- Request context must be explicit and testable.
- Logging must be safe for future auth flows.
- The canonical event contract must be stable enough to evolve incrementally.
- Health/readiness endpoints must not depend on external services in this step.
- OpenAPI setup must not introduce frontend client generation yet.

## Risks

- Logging too much too early can leak sensitive data once auth flows are introduced.
- Logging too little makes incident diagnosis difficult.
- A free-form canonical event object can become a dumping ground for PII and unstable fields.
- Exposing Swagger/OpenAPI in production can reveal sensitive service surface area.
- Adding OpenTelemetry, Sentry, metrics, or sampling too early can distract from the incremental roadmap.

## Acceptance Criteria

- `/health` and `/ready` exist and pass route tests.
- `x-request-id` generation, propagation, and response echoing are tested.
- Structured JSON logging is configured with redaction.
- `RequestContext` and `CanonicalEventBuilder` exist and are unit-tested.
- A canonical event is emitted once per request in route tests.
- No request/response body is logged by default.
- OpenAPI/Swagger is available outside production and disabled in production.
- OpenAPI operations are Orval-ready with stable `operationId`, tags, and schemas.
- `pnpm --filter idp check` passes.
- `pnpm --filter idp typecheck` passes.
- `pnpm --filter idp test` passes.
- `pnpm --filter idp test:coverage` passes.
- `pnpm --filter idp build` passes.

## Future Enhancements

- Implement sampling and tail-sampling for canonical events.
- Add OpenTelemetry tracing and trace/log correlation.
- Add metrics and operational dashboards.
- Add Sentry for server-side IDP errors if approved for all apps/services.
- Add external readiness checks when Drizzle/PostgreSQL and Better Auth storage are introduced.
- Add Orval generation when custom IDP endpoints are consumed by `apps/web`.
- Add production OpenAPI exposure policy if external/internal consumers require it.

## Open Questions

- Which exact canonical event fields should be added when auth, tenant, organization, and database layers arrive.
- Which telemetry backend will store logs, canonical events, traces, and metrics.
- Which sampling thresholds should apply for slow requests once production latency baselines exist.
