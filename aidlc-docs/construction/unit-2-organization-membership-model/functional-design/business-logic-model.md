# Business Logic Model: Unit 2 Organization And Membership Model

## Purpose

Unit 2 adds Better Auth organization and membership support to the IDP while preserving the boundary between public citizen users and institutional members. The unit configures the official Better Auth organization plugin, owns the plugin schema/migration implications, and defines membership ownership rules used by later tenant and bootstrap units.

## Business Capability

The IDP must represent institutional tenant ownership through Better Auth organizations and members, without allowing public users to self-create organizations or self-assign institutional roles.

## Core Workflow

1. Existing citizen users continue to sign up, sign in, and manage sessions through Better Auth email/password flows.
2. Unit 2 configures Better Auth organization support through official plugin APIs.
3. Public organization creation is disabled.
4. Controlled server-side flows remain the only approved path for creating organizations and assigning owner membership.
5. Unit 4 bootstrap will create or connect the initial organization owner using the Unit 2 model.
6. Unit 3 tenant metadata will reference the Better Auth organization ID as the stable internal linkage key.

## Organization Creation Model

- Public/self-service organization creation is disabled in Unit 2.
- Organization creation is reserved for controlled server-side flows, initially Unit 4 bootstrap.
- The design does not expose a custom public organization creation endpoint.
- The design does not allow environment-specific public creation in local or development because that creates behavior drift and test-only security exceptions.

## Membership Ownership Model

- Better Auth organizations represent institutional tenants at the auth/membership boundary.
- Better Auth members represent users assigned to institutional organizations.
- Owner assignment is controlled server-side only.
- Citizen users may exist without any organization membership.
- Membership is required only for institutional/admin capabilities defined by later units.

## Feature Scope

Unit 2 includes:

- Better Auth organization plugin configuration.
- Better Auth organization schema/migration ownership.
- Better Auth member schema/migration ownership.
- Default Better Auth role semantics needed for owner membership.
- Tests for plugin configuration, schema presence, public creation disabled, and Better Auth boundary preservation.

Unit 2 defers:

- Invitations UX and invitation workflows.
- Teams.
- Custom roles.
- Dynamic access control.
- Tenant domain/alias resolution.
- Bootstrap CLI implementation.
- Frontend organization UI.
- Durable audit storage.

If the official Better Auth organization plugin requires invitation schema objects as part of plugin schema support, those objects may exist as plugin-owned schema support, but Unit 2 does not introduce invitation business workflows.

## Organization Deletion Model

- Organization deletion is disabled in Unit 2.
- The design avoids hard deletion because organization records will become tenant linkage anchors.
- Any future deletion or archival behavior must define tenant data ownership, membership history, auditability, and rollback implications before implementation.

## Stable Identifier Model

- Better Auth organization ID is the stable internal linkage key.
- Organization slug and name are display or lookup attributes, not authoritative linkage keys.
- Unit 3 tenant metadata will link to Better Auth organization IDs rather than slugs or names.

## Membership Status Model

- Unit 2 does not implement active/inactive membership status.
- Better Auth membership existence and role are the only Unit 2 membership state used for institutional boundaries.
- Active/inactive membership is documented as a future extension path only.
- If status is later required, the extension must choose between an IDP-owned extension table and Better Auth schema customization after evaluating migration and plugin support risks.

## Event Flow

- Unit 2 may reserve safe event names for organization configured, member added, and owner assigned.
- Unit 2 emits events only where it introduces concrete controlled operations.
- Routine Better Auth plugin internals are not reimplemented or instrumented directly.
- Runtime per-operation logs are not added for Better Auth organization plugin internals.
- Unit 4 bootstrap is expected to emit owner assignment and setup events through Unit 1 event abstraction.

## Frontend Components

N/A. Unit 2 is backend-only and has no frontend/UI components.

## Security Compliance

- **SECURITY-08**: Compliant by design. Public self-service organization creation is disabled and no protected organization endpoint is added in Functional Design.
- **SECURITY-11**: Compliant. Security-critical organization and membership behavior remains isolated in the IDP auth integration boundary and official Better Auth plugin APIs.
- **SECURITY-12**: Compliant. Better Auth internals for organization, member, role, session, and credential behavior are not reimplemented.
- **SECURITY-13**: Compliant. Organization ID provides a stable integrity linkage key for future tenant metadata and audit events.
- **SECURITY-15**: Compliant. Public users cannot fail into organization ownership; organization creation and owner assignment fail closed to controlled server-side flows only.

## Testable Properties

- **No PBT properties identified** for Unit 2 Functional Design. The unit uses direct Better Auth plugin configuration and example-based verification rather than custom transformations or algorithms.
- Role and membership invariants are delegated to Better Auth plugin behavior and covered by example-based configuration/schema tests in this unit.
- If code generation introduces custom role-combination algorithms, status normalization, or other property-bearing transformations, the code generation plan must revisit PBT before implementation completes.

## PBT Compliance

- **PBT-01**: Compliant. Functional Design explicitly evaluates testable properties and marks Unit 2 as no-property under the approved direct-plugin configuration approach.
- **PBT-02 through PBT-08**: N/A. No round-trip, invariant transformation, idempotent transformation, oracle, stateful PBT model, generator, or PBT run is introduced.
- **PBT-09**: Deferred to Unit 3 or a later applicable NFR stage.
- **PBT-10**: Compliant. Unit 2 requires example-based tests for critical configuration and safety rules.
