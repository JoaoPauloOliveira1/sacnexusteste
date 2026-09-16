# Units Of Work

## Overview

This document decomposes the approved `apps/idp` roadmap increment into four units of work. Units are logical implementation groupings within the existing `idp` service, not independently deployable services.

## Decomposition Decisions

- Keep four units exactly as proposed in the execution plan.
- Execute Unit 1 first.
- Unit 2 and Unit 3 may be designed in parallel after Unit 1, but implementation must respect database/migration ownership.
- Split schema/migration work so Unit 2 owns Better Auth organization/membership schema integration and Unit 3 owns tenant/domain lookup schema.
- Unit 4 depends on Unit 1, Unit 2, and Unit 3.
- Create a separate documentation-only unit after the four implementation units.
- Tenant resolution is the primary PBT owner. Other units should avoid adding property-bearing pure helpers where possible; if unavoidable, PBT requirements must be revisited before code generation.
- Assume a single developer/agent executes units sequentially by default.

## Unit 1: IDP Event Publication Foundation

- **Purpose**: Add a stable internal event publication abstraction and emit safe events from existing auth flows.
- **Primary Story**: US-01.
- **Primary Components**: Event Contracts, Event Publisher, Identity Event Service.
- **Primary Locations**: `apps/idp/src/events`, `apps/idp/src/usecases/identity`, `apps/idp/tests`.
- **Responsibilities**:
  - Define safe identity/tenant event names and payload shapes.
  - Define `IdentityEventPublisher` interface.
  - Provide initial no-op publisher implementation.
  - Add event emission seams to existing auth flows where practical.
  - Keep event payloads no-PII and no-secret.
- **Security Considerations**:
  - No passwords, tokens, cookies, raw emails, request bodies, response bodies, verification/reset URLs, CPF, CNPJ, or domain profile data in events.
  - Event failure must not grant access or fail open.
- **PBT Considerations**:
  - No primary PBT ownership in this unit under the approved plan.
  - Avoid complex property-bearing sanitization helpers; if introduced, revisit PBT ownership before code generation.
- **Exit Criteria**:
  - Event interface exists.
  - No-op publisher exists.
  - Existing auth use cases can call the event abstraction.
  - Unit tests verify event publication is invoked without external infrastructure.

## Unit 2: Better Auth Organization And Membership Model

- **Purpose**: Add Better Auth organization plugin support and model institutional tenant/membership ownership boundaries.
- **Primary Story**: US-02.
- **Primary Components**: Organization Auth Integration, Tenant Registry baseline linkage.
- **Primary Locations**: `apps/idp/src/identity/auth.ts`, `apps/idp/src/database/schema.ts`, `apps/idp/drizzle`, `apps/idp/tests`.
- **Responsibilities**:
  - Configure Better Auth organization plugin through official APIs.
  - Disable or prevent public self-service organization creation.
  - Establish organization-to-tenant linkage needed by later units.
  - Keep citizen users outside institutional membership.
  - Document active/inactive membership as an extension path only.
  - Own Better Auth organization/membership schema and migration implications.
- **Security Considerations**:
  - Do not reimplement Better Auth organization, role, session, or credential internals.
  - Avoid hard-deletion behaviors that harm auditability.
  - Keep public organization creation inaccessible.
- **PBT Considerations**:
  - No primary PBT ownership in this unit under the approved plan.
  - Prefer direct Better Auth/plugin configuration and example-based tests.
- **Exit Criteria**:
  - Organization plugin is configured.
  - Schema/migration changes for organization/membership integration are generated or documented.
  - Tests cover configuration and key safety constraints.

## Unit 3: Tenant Domain And Alias Resolution

- **Purpose**: Resolve tenant context from trusted original host using dedicated tenant/domain lookup schema.
- **Primary Story**: US-03.
- **Primary Components**: Tenant Registry, Tenant Domain Registry, Tenant Resolver, Tenant Status Endpoint.
- **Primary Locations**: `apps/idp/src/database/schema.ts`, `apps/idp/drizzle`, `apps/idp/src/identity` or `apps/idp/src/usecases/identity`, `apps/idp/src/entrypoint/routes`, `apps/idp/tests`.
- **Responsibilities**:
  - Add dedicated IDP-owned tenant metadata and tenant domain/alias lookup tables.
  - Prefer trusted `X-Forwarded-Host` when present, falling back to `Host`.
  - Normalize host lookup keys.
  - Resolve tenant/domain status safely.
  - Add public tenant-resolution/status endpoint for diagnostics.
  - Own tenant-domain schema/migration work.
- **Security Considerations**:
  - Unknown, malformed, pending, or disabled hosts fail closed for tenant-bound operations.
  - Public status endpoint returns safe generic information only.
  - Forwarded-host trust boundaries must be explicit and tested.
- **PBT Considerations**:
  - This unit owns primary PBT work for host normalization and host/domain lookup invariants.
  - PBT should cover idempotent normalization, valid/invalid host rejection, case handling, and stable lookup keys where valid.
- **Exit Criteria**:
  - Tenant/domain schema and indexes are defined.
  - Tenant resolver exists.
  - Tenant status endpoint exists with OpenAPI metadata.
  - Example-based and PBT tests cover resolver behavior.

## Unit 4: IDP Bootstrap Scripts

- **Purpose**: Add controlled CLI scripts for creating tenants, registering domains/aliases, and creating initial owner users.
- **Primary Story**: US-04.
- **Primary Components**: Bootstrap Commands, Bootstrap Service, Organization Integration Service, Tenant Registry Service, Tenant Domain Service.
- **Primary Locations**: `apps/idp/src/bootstrap` or `apps/idp/src/scripts`, `apps/idp/package.json`, `apps/idp/tests`.
- **Responsibilities**:
  - Add CLI flag-based bootstrap command.
  - Create a new Better Auth user with a provided temporary password for initial owner setup.
  - Create or connect tenant organization records.
  - Register tenant domains/aliases.
  - Assign owner role.
  - Emit safe setup events through Unit 1 event abstraction.
  - Print safe output only.
- **Security Considerations**:
  - Do not print secrets, temporary password, database URL, tokens, raw email, CPF, CNPJ, or sensitive PII.
  - Validate all CLI inputs before mutation where practical.
  - Avoid unsafe duplication on reruns.
- **PBT Considerations**:
  - No primary PBT ownership in this unit under the approved plan.
  - Avoid complex property-bearing CLI normalization helpers; if introduced, revisit PBT ownership before code generation.
- **Exit Criteria**:
  - Bootstrap command is available as an app-level script.
  - Bootstrap service orchestrates user, organization, tenant, domain, owner, and event operations.
  - Tests cover safe output, invalid input handling, and rerun behavior where practical.

## Unit 5: Documentation And Roadmap Finalization

- **Purpose**: Update durable docs and roadmap after implementation units are complete.
- **Primary Stories**: Supports all stories.
- **Primary Locations**: `apps/idp/README.md`, `docs/idp/*`, `idp-architecture-discussion.md`, `docs/TODO.md` if needed.
- **Responsibilities**:
  - Document event publication boundary.
  - Document organization/tenant/membership ownership.
  - Document tenant domain resolution and public status endpoint.
  - Document bootstrap command usage and safety constraints.
  - Mark completed roadmap items after verified implementation.
- **Security Considerations**:
  - Do not document real secrets, real credentials, realistic personal data, or sensitive operational values.
- **PBT Considerations**:
  - Document PBT setup and seed/reproducibility instructions if introduced.
- **Exit Criteria**:
  - Durable docs reflect implemented behavior.
  - Roadmap status is updated only after verification.
  - Backlog contains only deferred items not covered by active implementation.

## Security Compliance

- Security Baseline remains enabled for all units.
- Unit 1 addresses event safety and future audit seams.
- Unit 2 addresses Better Auth boundaries, organization ownership, and membership separation.
- Unit 3 addresses host validation, fail-closed tenant resolution, and safe diagnostics.
- Unit 4 addresses safe operational scripts and no-secret/no-PII output.
- Unit 5 addresses documentation safety and roadmap traceability.

## PBT Compliance

- Unit 3 is the primary PBT owner for this decomposition.
- Other units must avoid adding property-bearing pure helpers where possible under the approved plan.
- If another unit necessarily introduces property-bearing pure helpers, the unit plan or code generation plan must be updated to include PBT for that unit before implementation proceeds.
