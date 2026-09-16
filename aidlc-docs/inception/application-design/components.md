# Components

## Scope

This design covers `apps/idp` only. It defines high-level components for event publication, Better Auth organization support, tenant/domain resolution, tenant bootstrap, and supporting database/API surfaces.

## Component Summary

| Component | Proposed Location | Purpose |
|---|---|---|
| Event Contracts | `apps/idp/src/events` | Define safe identity/tenant event names and payload shapes. |
| Event Publisher | `apps/idp/src/events` | Publish events through an interface; initial runtime implementation is no-op. |
| Organization Auth Integration | `apps/idp/src/identity/auth.ts` | Configure Better Auth `organization` plugin and organization options. |
| Tenant Registry | `apps/idp/src/database/schema.ts` plus use cases | Store IDP-owned tenant metadata linked to Better Auth organization IDs. |
| Tenant Domain Registry | `apps/idp/src/database/schema.ts` plus use cases | Store normalized tenant domains/aliases and status for host lookup. |
| Tenant Resolver | `apps/idp/src/identity` or `apps/idp/src/usecases/identity` | Resolve tenant context from trusted request host. |
| Tenant Status Endpoint | `apps/idp/src/entrypoint/routes` | Public diagnostic endpoint for tenant/domain status with safe responses. |
| Bootstrap Commands | `apps/idp/src/bootstrap` or `apps/idp/src/scripts` | Create tenants, domains/aliases, and initial owner users using CLI flags. |
| Bootstrap Service | `apps/idp/src/usecases/identity` | Orchestrate bootstrap operations using DB, Better Auth APIs, and event publisher. |

## Event Contracts

- **Purpose**: Provide stable, no-PII event shapes for current auth flows and new tenant operations.
- **Responsibilities**: Define event names, safe payload fields, outcome labels, and payload construction helpers.
- **Interfaces**: Export event types and factory helpers consumed by use cases and bootstrap services.
- **Notes**: Payload sanitization is expected to be PBT-applicable during construction.

## Event Publisher

- **Purpose**: Decouple event emission call sites from the eventual audit/outbox/queue implementation.
- **Responsibilities**: Provide an async publishing interface and initial no-op implementation.
- **Interfaces**: Export publisher interface and no-op implementation.
- **Notes**: Structured-log publisher is not the first implementation per design answer; it can be added later without changing call sites.

## Organization Auth Integration

- **Purpose**: Add Better Auth organization plugin support without reimplementing organization internals.
- **Responsibilities**: Configure plugin options, disable/inhibit public self-service organization creation, preserve Better Auth boundaries, and expose safe organization APIs to internal services.
- **Interfaces**: Existing Better Auth instance and server SDK methods.
- **Notes**: Better Auth schema/plugin constraints may affect final table names and fields; any exception must be documented during Functional Design or Code Generation.

## Tenant Registry

- **Purpose**: Store IDP-owned tenant metadata linked to Better Auth organization IDs.
- **Responsibilities**: Track tenant status and stable relationship to organization records.
- **Interfaces**: Drizzle schema, tenant repository/query functions, bootstrap service.
- **Notes**: Membership active/inactive status is documented as an extension path only in this cycle.

## Tenant Domain Registry

- **Purpose**: Store normalized domains and aliases for host-based tenant lookup.
- **Responsibilities**: Normalize host values, enforce uniqueness, track domain status, and support efficient lookup.
- **Interfaces**: Drizzle schema, tenant-domain repository/query functions, tenant resolver.
- **Notes**: Foreign keys and lookup columns should be indexed during database design.

## Tenant Resolver

- **Purpose**: Resolve tenant context from request host for auth, organization, bootstrap-adjacent, and diagnostic flows.
- **Responsibilities**: Prefer trusted `X-Forwarded-Host` when present, fall back to `Host`, normalize host, lookup domain/alias, enforce tenant/domain status, return safe failure states.
- **Interfaces**: Request headers input, tenant/domain repositories, result type with resolved tenant context or safe error reason.
- **Notes**: Trust boundaries for forwarded headers must be documented and tested.

## Tenant Status Endpoint

- **Purpose**: Provide a safe public diagnostic/status endpoint for tenant/domain resolution.
- **Responsibilities**: Accept request host context, resolve tenant status, and return generic safe status without exposing sensitive internal details.
- **Interfaces**: Fastify route, OpenAPI schema, tenant resolver service.
- **Notes**: Response must use `snake_case` and safe synthetic examples in OpenAPI.

## Bootstrap Commands

- **Purpose**: Provide controlled operational entry points for initial tenant setup.
- **Responsibilities**: Parse CLI flags, validate required inputs, call bootstrap service, return safe output, avoid secrets/PII in logs.
- **Interfaces**: Package-level scripts and TS entrypoint under `apps/idp`.
- **Notes**: CLI flags only are selected for this cycle; config-file support is deferred.

## Bootstrap Service

- **Purpose**: Orchestrate tenant, domain, and initial owner setup.
- **Responsibilities**: Create Better Auth user with provided temporary password, create or link organization/tenant records, register domains/aliases, assign owner role, emit events, handle rerun behavior safely.
- **Interfaces**: Better Auth API, Drizzle repositories, event publisher, password policy/config helpers.
- **Notes**: Detailed temporary password handling and verification requirements belong in Functional Design.

## Security Compliance

- **SECURITY-03**: Components preserve structured logging and no-sensitive-data expectations.
- **SECURITY-05**: Components require input validation for endpoint, resolver, and bootstrap command inputs.
- **SECURITY-08**: Components separate public diagnostics from protected organization/bootstrap operations.
- **SECURITY-11**: Security-critical concerns stay isolated in identity, events, tenant resolver, and bootstrap services.
- **SECURITY-12**: Better Auth remains the owner of auth, credential, session, and organization internals.
- **SECURITY-15**: Tenant resolution and bootstrap components are designed for safe failures.

## PBT Compliance

- Host normalization and lookup key generation are PBT-applicable.
- Event payload construction/sanitization is PBT-applicable.
- Bootstrap CLI input normalization may be PBT-applicable if pure helpers are introduced.
