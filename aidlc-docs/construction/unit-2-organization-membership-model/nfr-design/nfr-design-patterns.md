# NFR Design Patterns: Unit 2 Organization And Membership Model

## Overview

Unit 2 applies NFR requirements through a minimal Better Auth organization plugin integration. The design preserves citizen authentication behavior, keeps organization ownership fail-closed, uses explicit migrations, and avoids custom membership infrastructure until later tenant and bootstrap units require it.

## Resilience Patterns

### Explicit Migration Gate

- **Pattern**: Schema availability through explicit migration before deployment.
- **Decision**: Organization/member plugin schema changes are generated as reviewable Drizzle migrations and applied through operational/deployment commands.
- **Avoided Pattern**: Application startup migrations are not used.
- **Failure Behavior**: If schema is missing, clients receive generic errors through the global handler and canonical logs provide safe error classification.

### Citizen Auth Decoupling

- **Pattern**: Keep citizen auth flows independent from custom organization membership checks.
- **Decision**: Existing citizen sign-up, sign-in, session, sign-out, password, and email verification flows do not perform custom organization/member lookups.
- **Expected Behavior**: Users without organization membership can still authenticate as citizens.
- **Future Path**: Membership checks are introduced only for institutional/admin capabilities in later units.

## Scalability Patterns

### Plugin-Owned Schema And Indexing

- **Pattern**: Use Better Auth organization plugin schema and indexes as the initial scalability foundation.
- **Decision**: Unit 2 does not add caches, queues, outbox, custom repositories, or custom membership lookup infrastructure.
- **Rationale**: Organization/member traffic is not introduced as a public workflow in Unit 2, and plugin-owned schema should remain the source of truth.

### Stable Linkage Key

- **Pattern**: Internal ID linkage instead of mutable display identifiers.
- **Decision**: Better Auth organization ID is the future tenant linkage key.
- **Rationale**: Slugs and names can change and should not anchor tenant-domain relationships.

## Performance Patterns

### No Auth Response Enrichment

- **Pattern**: Avoid organization/member enrichment on existing citizen auth responses.
- **Decision**: Unit 2 does not add organization/member data to existing auth responses.
- **Rationale**: This preserves response shape, avoids extra lookups, and keeps organization behavior isolated until institutional endpoints are designed.

### Centralized Plugin Configuration

- **Pattern**: Configure Better Auth once at the auth boundary.
- **Decision**: Organization plugin configuration belongs in the existing Better Auth config module.
- **Rationale**: Centralized configuration avoids scattered feature toggles and repeated runtime checks.

## Security Patterns

### Deny Public Organization Creation

- **Pattern**: Disable self-service organization creation at the server/plugin configuration boundary.
- **Decision**: Public/client organization creation remains disabled or inaccessible.
- **Verification**: Tests or configuration assertions must verify no exposed IDP flow enables public creation.
- **Rejected Pattern**: Hiding frontend UI while leaving API creation enabled is not acceptable.

### Disable Organization Deletion

- **Pattern**: Prevent hard deletion of future tenant linkage anchors.
- **Decision**: Organization deletion is disabled when the plugin supports this configuration.
- **Verification**: Tests or configuration assertions verify deletion behavior/configuration.
- **Future Path**: Archival/deletion requires a later design covering tenant data, membership history, audit, and retention.

### Official Plugin Boundary

- **Pattern**: Better Auth owns organization, member, role, session, credential, cookie, and token internals.
- **Decision**: Unit 2 does not implement custom role evaluators, organization repositories, or member repositories.
- **Rationale**: Reduces auth/security drift and preserves Better Auth support boundaries.

## Observability Patterns

### Existing Canonical Request Logging

- **Pattern**: Preserve one request-completion event per request.
- **Decision**: Unit 2 does not log every Better Auth organization plugin operation.
- **Diagnostic Behavior**: Missing schema or runtime failures use existing global generic responses and safe canonical error classification.

### Event Taxonomy Extension Points

- **Pattern**: Extend event taxonomy only where future controlled operations need it.
- **Decision**: Organization configured, member added, and owner assigned events may be reserved, but routine plugin internals are not instrumented.
- **Rationale**: Keeps Unit 2 low-noise and avoids logging sensitive organization/member internals.

## Maintainability Patterns

### Deferred Workflow Boundaries

- **Pattern**: Keep unsupported business workflows explicitly deferred.
- **Decision**: Invitation UX, teams, custom roles, dynamic access control, bootstrap CLI, tenant metadata, and tenant-domain lookup remain out of Unit 2.
- **Schema Note**: Plugin schema support may include invitation objects if required by the official plugin, but Unit 2 does not enable invitation business workflows.

### Example-Based Test Coverage

- **Pattern**: Unit-level tests for configuration and schema safety.
- **Decision**: Use existing Vitest without real PostgreSQL integration tests or PBT in Unit 2.
- **Coverage**: Plugin configuration, public creation disabled, deletion disabled where supported, schema presence, and citizen auth compatibility.

## Security Compliance

- **SECURITY-03**: Compliant. No per-plugin-operation logging is introduced.
- **SECURITY-05**: Compliant. No new custom public input-processing endpoint is added in Unit 2 design.
- **SECURITY-08**: Compliant. Public organization creation and owner self-assignment are disabled/inaccessible.
- **SECURITY-09**: Compliant. Missing schema/internal errors remain generic to clients.
- **SECURITY-10**: Compliant. Unit 2 uses the existing Better Auth dependency and does not require new packages.
- **SECURITY-11**: Compliant. Plugin boundary and misuse cases are explicit.
- **SECURITY-12**: Compliant. Better Auth internals are not reimplemented.
- **SECURITY-13**: Compliant. Explicit migrations and stable organization IDs support future integrity/audit needs.
- **SECURITY-15**: Compliant. Organization ownership fails closed to controlled server-side flows only.

## PBT Compliance

- **PBT-01**: Compliant. Unit 2 is evaluated and marked as no-property under direct plugin configuration.
- **PBT-02 through PBT-08**: N/A. Unit 2 introduces no custom transformation, oracle, stateful model, or generated-input test target.
- **PBT-09**: Deferred to Unit 3 or a later applicable NFR stage.
- **PBT-10**: Compliant. Critical paths are covered through example-based tests.
