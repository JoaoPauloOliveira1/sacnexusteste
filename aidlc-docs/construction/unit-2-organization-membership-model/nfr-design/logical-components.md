# Logical Components: Unit 2 Organization And Membership Model

## Overview

Unit 2 logical components focus on Better Auth organization plugin integration and explicit schema support. The design avoids custom organization infrastructure and keeps citizen auth flows decoupled from organization membership checks.

## Component Summary

| Component | Responsibility | Runtime Side Effects | Unit 2 Status |
|---|---|---:|---|
| Better Auth Organization Plugin Configuration | Enables organization/member support and safety options | No direct I/O beyond Better Auth runtime behavior | Required |
| Organization/Member Schema Mapping | Maps plugin schema into Drizzle schema and `authSchema` | No | Required |
| Explicit Migration Artifacts | Reviewable SQL migration for plugin schema | Operational only | Required |
| Organization Safety Configuration Tests | Verify public creation/deletion safety options | No | Required |
| Organization Schema Tests | Verify schema objects are present and mapped | No | Required |
| Citizen Auth Compatibility Tests | Verify existing auth config does not require membership | No | Required |
| Unit 1 Event Taxonomy Extension Points | Reserve safe organization/member event names if needed | No runtime logging | Optional |

## Better Auth Organization Plugin Configuration

### Purpose

Enable official Better Auth organization and member support without reimplementing organization, membership, role, credential, session, cookie, or token internals.

### Responsibilities

- Configure organization plugin through official Better Auth APIs.
- Disable public/self-service organization creation.
- Disable organization deletion when supported.
- Keep invitations, teams, custom roles, and dynamic access control deferred.
- Preserve citizen auth flows without custom membership requirements.

### NFR Contribution

- **Security**: Prevents public ownership escalation and auth internals reimplementation.
- **Maintainability**: Centralizes organization behavior at the auth boundary.
- **Performance**: Avoids per-auth-flow custom membership lookups.

## Organization/Member Schema Mapping

### Purpose

Add plugin-owned organization/member schema objects to the IDP Drizzle schema and Better Auth adapter schema map.

### Responsibilities

- Define organization schema objects consistently with Better Auth plugin requirements.
- Define member schema objects consistently with Better Auth plugin requirements.
- Include invitation schema objects only if required by official plugin schema support.
- Avoid tenant metadata and tenant domain/alias schema; Unit 3 owns those.

### NFR Contribution

- **Reliability**: Runtime schema aligns with plugin expectations.
- **Security**: Avoids runtime schema creation and supports reviewable migrations.
- **Maintainability**: Keeps plugin schema support visible in source.

## Explicit Migration Artifacts

### Purpose

Provide reviewable SQL migration files for Better Auth organization/member schema changes.

### Responsibilities

- Generate SQL under `apps/idp/drizzle`.
- Keep migration execution explicit via operational/deployment command.
- Avoid automatic migration on app startup.

### NFR Contribution

- **Availability**: Reduces startup migration races.
- **Reliability**: Makes schema rollout visible and controlled.
- **Security**: Supports auditability and review of schema changes.

## Organization Safety Configuration Tests

### Purpose

Verify Unit 2 safety decisions remain enforced.

### Responsibilities

- Assert public/self-service creation is disabled or inaccessible.
- Assert organization deletion is disabled where plugin configuration supports it.
- Assert Better Auth plugin APIs are configured without custom organization/member internals.

### NFR Contribution

- **Security**: Guards against accidental ownership escalation.
- **Maintainability**: Converts key design decisions into executable checks.

## Organization Schema Tests

### Purpose

Verify schema support exists and remains mapped to the Better Auth adapter.

### Responsibilities

- Assert organization/member schema exports exist.
- Assert `authSchema` includes plugin schema objects added by code generation.
- Assert tenant metadata tables are not introduced in Unit 2.

### NFR Contribution

- **Reliability**: Reduces missing-schema deployment risk.
- **Maintainability**: Keeps Unit 2/Unit 3 migration ownership separate.

## Citizen Auth Compatibility Tests

### Purpose

Protect existing citizen auth behavior after organization plugin setup.

### Responsibilities

- Verify existing auth configuration remains valid with organization plugin enabled.
- Verify Unit 2 does not add custom membership checks to citizen auth use cases.
- Preserve existing route/use-case test behavior for sign-in, sign-up, session, password, and email flows.

### NFR Contribution

- **Availability**: Citizen auth remains available without memberships.
- **Performance**: No added custom membership lookup overhead.

## Unit 1 Event Taxonomy Extension Points

### Purpose

Reserve safe organization/membership event names for future controlled operations.

### Responsibilities

- Keep events no-PII/no-secret.
- Avoid runtime per-plugin-operation logs.
- Emit only where Unit 2 introduces concrete controlled operations.

### NFR Contribution

- **Observability**: Prepares future audit/event integration without log volume.
- **Security**: Uses Unit 1 payload allowlisting.

## Explicitly Excluded Logical Components

The following components are not part of Unit 2 NFR Design:

- Custom organization service.
- Custom member repository.
- Custom role evaluator.
- Custom deletion guard outside supported plugin configuration.
- Membership cache.
- Queue, outbox, event bus, or worker.
- Tenant metadata registry.
- Tenant domain/alias registry.
- Bootstrap CLI service.
- Invitation UX or delivery service.
- Team management service.
- Frontend organization client/plugin setup.
- PBT framework or generators.
- Real PostgreSQL integration-test lifecycle.

## Component Interaction

1. IDP Better Auth configuration registers the official organization plugin.
2. Drizzle schema maps plugin-required organization/member objects into `authSchema`.
3. Drizzle migration artifacts create the plugin schema before deployment.
4. Existing citizen auth routes continue to call existing auth use cases without custom organization/member lookup.
5. Future Unit 3 tenant metadata references Better Auth organization ID.
6. Future Unit 4 bootstrap creates/connects organizations and owners through controlled server-side flows.

## Security Compliance

- **SECURITY-03**: Compliant. Existing canonical request logging is preserved without per-plugin-operation logs.
- **SECURITY-05**: Compliant. No new public input-processing route is introduced by this design.
- **SECURITY-08**: Compliant. Public creation and deletion paths are disabled or inaccessible.
- **SECURITY-09**: Compliant. Internal failures remain generic to HTTP clients.
- **SECURITY-10**: Compliant. No new dependency is expected beyond existing Better Auth package/plugin support.
- **SECURITY-11**: Compliant. Plugin integration remains isolated and abuse cases are tested.
- **SECURITY-12**: Compliant. Better Auth internals remain untouched.
- **SECURITY-13**: Compliant. Explicit migrations and stable IDs support integrity.
- **SECURITY-15**: Compliant. Organization ownership fails closed to controlled server-side flows.

## PBT Compliance

- Unit 2 logical components avoid custom property-bearing transformations.
- Example-based Vitest tests remain the selected test strategy.
- If code generation introduces custom role/status normalization or transformation logic, PBT must be added before implementation completes.
