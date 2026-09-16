# NFR Requirements: Unit 2 Organization And Membership Model

## Overview

Unit 2 adds Better Auth organization and membership support to the IDP. The NFR focus is to preserve existing citizen authentication behavior, prevent public organization ownership escalation, keep schema changes explicit and reviewable, and avoid adding unnecessary runtime logging, integration tests, or PBT work in this unit.

## Performance Requirements

- Organization plugin configuration must not add external calls, runtime event logs, or expensive work to existing citizen auth flows beyond Better Auth's normal plugin, schema, and session behavior.
- Unit 2 must not introduce caching for organization or membership data.
- Unit 2 must not add custom organization/membership lookup logic to sign-up, sign-in, sign-out, session lookup, or password flows.
- Schema and plugin configuration tests should remain unit-level and fast.

## Availability And Reliability Requirements

- Citizen auth flows must continue working for users without organization memberships.
- Lack of organization membership must not block basic citizen sign-in, sign-up, session lookup, password reset, password change, or email verification flows.
- Organization plugin schema must be present before runtime deployment through explicit migration execution.
- Application startup must not run migrations automatically.
- If organization schema is missing in an environment, the error must remain generic to clients and safely diagnosable through internal canonical logs.

## Security Requirements

- Public/self-service organization creation must be disabled or inaccessible through exposed IDP flows.
- Environment-specific public organization creation exceptions are not allowed in local or development.
- Organization deletion must be disabled when supported by Better Auth plugin configuration.
- Owner assignment remains controlled server-side only and is not implemented through public/client flows in Unit 2.
- Unit 2 must use official Better Auth organization plugin APIs and must not reimplement organization, member, role, session, credential, cookie, or token internals.
- Organization/member events must follow Unit 1 no-PII/no-secret event payload rules.
- Organization metadata used in Unit 2 must not contain secrets, tenant profile data, domain profile data, raw emails, request bodies, response bodies, cookies, tokens, session IDs, or raw Better Auth responses.

## Schema And Migration Requirements

- Unit 2 owns Better Auth organization/member plugin schema implications.
- Drizzle schema changes must be committed and reviewable in `apps/idp/src/database/schema.ts`.
- Generated SQL migrations must be committed and reviewable under `apps/idp/drizzle`.
- Runtime schema creation through app startup is not allowed.
- Better Auth CLI/runtime schema changes must not replace committed Drizzle migrations for this project.
- Unit 2 must not add tenant metadata or tenant domain/alias lookup tables; those belong to Unit 3.

## Observability Requirements

- Unit 2 continues using current canonical request-completion logging.
- Unit 2 must not add runtime logs for every Better Auth organization plugin operation.
- Unit 2 may reserve event taxonomy for organization configured, member added, and owner assigned, but event emission occurs only for concrete controlled operations introduced by the unit.
- No durable audit/event persistence is added in Unit 2.

## Maintainability Requirements

- Organization plugin configuration must remain centralized in the IDP Better Auth configuration boundary.
- Organization/member schema objects must be named and mapped consistently with existing IDP-owned Better Auth table naming conventions.
- Unit 2 must avoid duplicating Better Auth role and membership behavior in custom code.
- Invitations, teams, custom roles, and dynamic access control remain deferred business workflows.
- If official Better Auth plugin schema support includes invitation tables, Unit 2 treats them as plugin-owned schema support, not enabled invitation UX.

## Testing Requirements

- Use existing Vitest example-based tests only.
- No new PBT framework is required for Unit 2.
- No real PostgreSQL integration tests are required in Unit 2.
- Tests must verify organization plugin configuration.
- Tests must verify public/self-service organization creation is disabled or inaccessible through exposed IDP flows.
- Tests or configuration assertions must verify organization deletion is disabled when supported by plugin configuration.
- Tests must verify organization/member schema presence after code generation adds schema objects.
- Tests must verify citizen auth configuration remains compatible with users that have no organization membership.
- Tests must verify Better Auth internals remain untouched by custom reimplementation.

## PBT Requirements

- PBT is N/A for Unit 2 unless implementation introduces custom role/status transformation logic, membership normalization, or other property-bearing pure helpers.
- If code generation introduces custom role-combination algorithms, status normalization, parsing/formatting, or idempotent transformations, the code generation plan must be updated to add PBT before implementation completes.
- Unit 3 remains the primary PBT owner for host normalization and tenant-domain lookup invariants.

## Out Of Scope

- Public/client organization creation flows.
- Organization deletion workflows.
- Invitations UX or delivery.
- Teams.
- Custom roles and dynamic access control.
- Tenant metadata schema.
- Tenant domain/alias lookup schema.
- Bootstrap CLI implementation.
- Frontend organization UI.
- Durable audit/event persistence.
- Runtime per-plugin-operation logging.
- Real database integration tests in Unit 2.

## Security Compliance

- **SECURITY-03**: Compliant. Unit 2 preserves canonical request logging and avoids per-plugin-operation logs or sensitive payload logging.
- **SECURITY-05**: Compliant. Unit 2 exposes no new custom public input-processing endpoint in Functional Design; future controlled flows must validate inputs.
- **SECURITY-08**: Compliant. Public organization creation and owner self-assignment are disabled/inaccessible, preserving deny-by-default access control for institutional capabilities.
- **SECURITY-09**: Compliant. Internal organization/schema errors must continue returning generic client-facing errors.
- **SECURITY-10**: Compliant. Unit 2 uses existing Better Auth package/plugin support and does not require new dependencies as currently designed.
- **SECURITY-11**: Compliant. Organization and membership behavior is isolated in the Better Auth plugin integration boundary, with misuse cases documented.
- **SECURITY-12**: Compliant. Better Auth organization, member, role, session, credential, cookie, and token internals are not reimplemented.
- **SECURITY-13**: Compliant. Reviewable migrations and stable organization IDs support future data integrity and auditability.
- **SECURITY-15**: Compliant. Organization creation and owner assignment fail closed to controlled server-side flows only.

## PBT Compliance

- **PBT-01**: Compliant. Functional Design explicitly identified no PBT properties for Unit 2 under the direct-plugin configuration approach.
- **PBT-02**: N/A. No round-trip transformation is introduced.
- **PBT-03**: N/A unless implementation introduces custom status or role invariants outside Better Auth plugin behavior.
- **PBT-04**: N/A. No idempotent transformation is introduced.
- **PBT-05**: N/A. No oracle/reference model is used.
- **PBT-06**: N/A. No custom stateful model is introduced.
- **PBT-07**: N/A. No PBT generators are required.
- **PBT-08**: N/A. No PBT runs are introduced in Unit 2.
- **PBT-09**: Deferred to Unit 3 or a later applicable NFR stage.
- **PBT-10**: Compliant. Unit 2 requires example-based tests for critical configuration, schema, and safety constraints.
