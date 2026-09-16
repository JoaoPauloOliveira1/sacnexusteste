# IDP Architecture

This document records durable architecture guidance for `apps/idp`.

The IDP is a dedicated Node.js service for identity-related concerns in SAC Nexus. It uses Fastify as the HTTP framework, Drizzle ORM with PostgreSQL for auth persistence, Better Auth for email/password and session-cookie flows, Resend for current transactional auth email delivery, and React Email for local auth email templates.

## Responsibility Boundary

The IDP owns identity and broad access primitives.

- User authentication and sessions.
- Account-level identity fields such as name, email, email verification state, password credentials, and future 2FA state.
- Institutional tenant membership through Better Auth organizations.
- Broad roles and permissions that can be passed to business APIs.
- Identity events that support future audit and observability work.

Business APIs own domain authorization.

- Tenant-scoped business queries.
- Resource ownership checks.
- Workflow-state permissions.
- Citizen, company, technical-responsible, and process-specific profile data.
- CPF, CNPJ, phone, address, professional registration, and legal representation records.

## Current Layers

The source structure should stay clear without creating unused abstractions.

```txt
apps/idp/
  .dockerignore
  Dockerfile
  compose.yml
  package.json
  src/
    server.ts
    config/
      env.ts
      service.ts
    database/
      client.ts
      migrate.ts
      schema.ts
      tenant-domain-repository.ts
    entrypoint/
      openapi/
        examples.ts
        properties.ts
      plugins/
      routes/
        openapi-tags.ts
        auth/
          handler.ts
          index.ts
          openapi.ts
          openapi-schemas.ts
        operational/
          openapi.ts
          health/
            openapi.ts
            route.ts
          ready/
            openapi.ts
            route.ts
        tenant/
          openapi.ts
          status/
            openapi.ts
            route.ts
    events/
      identity-event-registry.ts
      identity-event.ts
      identity-event-publisher.ts
    infra/
      http/
        request-id.ts
      logging/
        canonical-event.ts
        logger.ts
      request-context/
        request-context.ts
    identity/
      auth.ts
      email-delivery.ts
      password-policy.ts
      emails/
        auth-email-templates.tsx
    bootstrap/
      tenant-bootstrap.ts
      tenant-bootstrap-identity.ts
      tenant-bootstrap-repository.ts
    scripts/
      bootstrap-tenant.ts
    usecases/
      dependencies/
        clock.ts
      operational/
        get-health.ts
        get-readiness.ts
      tenant/
        get-tenant-status.ts
        host-normalizer.ts
        host-source.ts
```

Layer intent:

- `src/server.ts` is the executable entrypoint.
- `src/config` owns environment parsing, typed runtime configuration, and stable service identity constants.
- `src/database` owns IDP PostgreSQL access, Drizzle schema, migration execution, and database readiness checks.
- `src/database/tenant-domain-repository.ts` owns tenant/domain lookup reads for IDP-owned tenant resolution.
- `src/entrypoint` owns Fastify app composition, plugins, routes, and transport-level concerns.
- `src/entrypoint/openapi` owns reusable OpenAPI examples and shared property schemas used by route-level OpenAPI contracts.
- `src/infra/http` owns HTTP infrastructure helpers such as request ID resolution.
- `src/infra/logging` owns logger/redaction configuration and canonical request event construction.
- `src/infra/request-context` owns the explicit request context passed into use cases.
- `src/events` owns the internal identity event publication abstraction and event taxonomy.
- `src/usecases/<context>/<operation>.ts` owns application behavior by route context and operation. The context should match the entrypoint route context when practical, such as `src/entrypoint/routes/operational/*` calling `src/usecases/operational/*` and auth wrappers calling `src/usecases/identity/*`.
- `src/usecases/dependencies` owns small default dependencies such as `clock`.
- `src/usecases/tenant` owns host source selection, host normalization, and tenant availability status resolution.
- `src/identity` owns Better Auth configuration, password policy, transactional auth email delivery, React Email templates, and auth engine integration boundaries.
- `src/bootstrap` and `src/scripts` own controlled operator tooling for tenant bootstrap.

## Use Case Dependencies

Use cases should stay Fastify-agnostic. For small pure dependencies such as clocks or ID generators, keep the default implementation under `src/usecases/dependencies` and import only the defaults each use case needs.

Use cases should expose named functions that match the operation, such as `getHealth` or `getReadiness`. Those functions may accept an optional dependency object for tests or future composition. This keeps each use case free to cherry-pick only what it needs without depending on a global app dependency container.

Reserve Fastify plugins and decorators for concrete framework-managed resources that need lifecycle, encapsulation, or registration order, such as database connections, Better Auth integration, external clients, repositories, and event publishers. Keep request-scoped data in `RequestContext`, not in singleton app dependencies.

## Future Layers

Add new layers only when real code needs them.

- `src/shared` for small cross-cutting utilities that are truly reused by more than one layer.

## Database Ownership

The IDP may share the same PostgreSQL database with future business APIs, but ownership must stay explicit.

IDP-owned tables use `idp_` prefixed `snake_case` names:

- `idp_user`
- `idp_session`
- `idp_account`
- `idp_verification`
- `idp_organization`
- `idp_member`
- `idp_invitation`
- `idp_tenant`
- `idp_tenant_domain`

Business services must not write directly to these tables. They must use IDP APIs or explicitly approved integration contracts.

SAC Nexus uses UUID v7 as the standard identifier format for persisted entities. The IDP configures Better Auth to generate UUID v7 IDs and stores IDP primary keys and foreign keys in PostgreSQL `uuid` columns.

Drizzle migrations live under `apps/idp/drizzle` and are generated from `apps/idp/src/database/schema.ts`. Migrations are applied through explicit deploy or operational commands, not by application startup.

## Better Auth Boundary

Better Auth owns authentication internals: users, credentials, password hashing, sessions, cookies, CSRF protections, and auth persistence behavior.

The IDP exposes wrappers under `/api/auth/*` for route ownership, OpenAPI, request context, future spans, controlled logging, and sanitized response contracts. Auth route handlers should stay transport-focused and call identity use cases. Identity use cases call explicit Better Auth server SDK methods, such as `auth.api.signInEmail`, and must not reimplement Better Auth security internals.

Initial wrapper routes:

- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-in/email`
- `POST /api/auth/send-verification-email`
- `GET /api/auth/verify-email`
- `POST /api/auth/request-password-reset`
- `GET /api/auth/reset-password/:token`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`
- `POST /api/auth/sign-out`
- `GET /api/auth/session`
- `GET /api/auth/ok`

Wrapper responses use `snake_case` and must not expose Better Auth session tokens or session IDs.

Email verification and password reset are configured through Better Auth callbacks and sent with Resend. The current implementation intentionally calls Resend inline from the IDP. A future central email worker should replace this once queueing, retries, provider abstraction, delivery observability, and cross-service email ownership are designed.

## Identity Events

`src/events` provides a safe internal event publication seam for identity-related operations. Current events are published through a no-op implementation by default and are not durable audit records.

Event payloads are intentionally allowlisted. They include safe operation labels, outcomes, request IDs, timestamps, event names, and generic reason codes only. They must not include email addresses, passwords, raw domains, normalized hosts, internal IDs, tokens, cookies, session IDs, request bodies, response bodies, SQL, or raw errors.

The event seam exists so future audit, outbox, queue, event bus, tracing, or log-shipping work can attach without reworking every identity use case. Durable audit storage and workers remain future work.

## Organizations, Tenants, And Membership

The IDP uses Better Auth's official `organization` plugin for institutional organizations and memberships. Public/self-service organization creation is disabled, and organization deletion is disabled for the initial institutional model.

`idp_organization`, `idp_member`, and `idp_invitation` are Better Auth plugin tables mapped through the IDP Drizzle schema. Better Auth remains responsible for organization/member plugin behavior and auth-owned internals.

`idp_tenant` is IDP-owned tenant metadata linked to a Better Auth organization ID. `idp_tenant_domain` stores normalized hostnames for primary domains and aliases. This keeps institutional tenant membership in the IDP while preserving FastAPI/business APIs as the source of truth for domain-specific authorization and resource ownership.

Citizen users can exist and authenticate without being members of an organization. Institutional membership represents internal users for a tenant and must not be inferred from email domain alone.

## Tenant Resolution

The public tenant diagnostic endpoint is `GET /tenant/status`. It returns only:

```json
{ "tenant_status": "available" }
```

or:

```json
{ "tenant_status": "unavailable" }
```

Tenant resolution uses `X-Forwarded-Host` when present, otherwise `Host`. This assumes the deployment ingress or reverse proxy strips or controls untrusted forwarded-host headers before traffic reaches the IDP.

Host normalization trims input, lowercases it, removes one trailing dot, removes a valid port, and rejects malformed hosts. Unknown hosts, malformed hosts, pending tenants, disabled tenants, pending domains, and disabled domains all fail safely to `unavailable` without exposing technical details.

The endpoint is a diagnostic/status surface only. It does not expose tenant IDs, organization IDs, aliases, raw host values, request headers, reason codes, SQL details, or internal errors.

## Bootstrap Tooling

The `bootstrap:tenant` package script provides controlled low-frequency tenant setup. It parses CLI flags, validates domains through the Unit 3 host normalizer, creates or connects owner users and organizations through Better Auth-supported APIs, creates or connects IDP-owned tenant/domain records through Drizzle, assigns owner membership, emits safe setup events, and prints safe allowlisted output.

Bootstrap is not a public self-service flow, not a batch provisioning system, and not a replacement for future invitation or admin UI/API work. Matching existing state supports reruns through `reused` and `already_satisfied` outcomes. Conflicting state fails with generic safe categories.

The command does not write Better Auth credential, session, token, cookie, or password internals directly.

## Entrypoint Layer

Fastify app creation should happen through a factory that tests can instantiate without binding a real network port.

Routes, plugins, schemas, hooks, and error handling should be added as the service grows. Prefer Fastify schemas for request validation and response serialization when custom endpoints are introduced.

Route files should be grouped by OpenAPI tag:

```txt
src/entrypoint/routes/
  openapi-tags.ts
  <tag>/
    openapi.ts
    <operation>/
      openapi.ts
      route.ts
    index.ts
```

`<operation>/route.ts` files own Fastify route registration and call use cases. `<tag>/openapi.ts` files own tag metadata. `<operation>/openapi.ts` files own response schemas and route OpenAPI objects. Tag folders expose an `index.ts` Fastify plugin that registers the tag's schemas and routes.

Reusable OpenAPI examples and shared property schemas should live under `src/entrypoint/openapi`. Use this folder for repeated documentation primitives, such as the IDP service identifier, ISO timestamp examples, common pagination fields, and future common error response fields.

## OpenAPI Standards

OpenAPI is part of the IDP contract for custom endpoints. Keep the generated document useful for humans, `fastify.inject()` tests, and future Orval client generation.

Every custom route should define:

- Stable `operationId` in lower camel case, using a verb phrase such as `getHealth`, `createInvitation`, or `revokeSession`.
- Stable tag from a small domain-oriented set, such as `operational`, `auth`, `organizations`, `sessions`, or `invitations`.
- `summary` as a short action sentence.
- `description` explaining behavior, security limits, and important non-goals.
- Explicit response schemas for every documented status code.
- Named reusable schemas with `$id`, `title`, and `description` when the shape is reused or important for clients.
- `description` for every public field.
- `example` values for schemas and fields when they help clarify the contract.
- `snake_case` field names for all API payloads emitted by the IDP.

Prefer shared OpenAPI examples and property schemas when the same field appears across multiple operations. Keep route-local schemas for fields that are specific to a single operation or tag.

Tag definitions should live in their route tag folder, such as `routes/operational/openapi.ts`, and be aggregated into the root OpenAPI document by the entrypoint OpenAPI plugin.

Route OpenAPI objects should be exported in the same shape Fastify expects, for example `{ schema: { operationId, tags, summary, description, response } }`. This keeps route handlers small and avoids mixing contract details into `*.route.ts` files.

OpenAPI content must not expose secrets, credentials, cookies, tokens, OTPs, backup codes, CPF, CNPJ, realistic emails, session IDs, or sensitive personal data in examples.

Swagger UI is available only outside `IDP_APP_ENV=production` at `/docs`. The OpenAPI JSON document is available only outside production at `/openapi.json`.

## Request Context And Canonical Events

The entrypoint layer creates an explicit `RequestContext` for each request. Use cases that need request-scoped context should receive it as an explicit argument instead of reading global state.

`RequestContext` currently carries the canonical request ID, a contextual logger, and a `CanonicalEventBuilder`.

Routine request lifecycle logging should be emitted once at the end of each request by the entrypoint layer. Use cases may enrich canonical events only through intentional builder methods. They should not mutate free-form log objects or emit routine lifecycle logs themselves.

Canonical request events must stay limited to safe operational fields by default: event name, service, request ID, method, path without raw query string, status code, duration, outcome, app environment, safe auth operation labels, and sanitized error name when present.

OpenTelemetry tracing, metrics, Sentry, log shipping, sampling, tail sampling, and persisted audit/event streams are deferred until future PRDs define them.

## Monorepo Rules

`apps/idp` is a workspace package named `idp`.

Package-level scripts own local task logic. Root scripts should keep delegating through `turbo run <task>`.

Use pnpm commands to add dependencies and avoid manually pinning package versions unless there is a documented compatibility reason.

## Imports

Use `@/*` for imports rooted at `apps/idp/src`.

This keeps imports consistent with the frontend style while preserving Node production compatibility. TypeScript `paths` handles type-checking, Vitest config handles tests, and `tsc-alias` rewrites emitted `dist` imports after `tsc` so Node can execute the production build.
