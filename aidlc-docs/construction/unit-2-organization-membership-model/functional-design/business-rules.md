# Business Rules: Unit 2 Organization And Membership Model

## Organization Rules

### BR-01 Public Organization Creation Disabled

Public users must not be able to create organizations through client-side or public auth flows in Unit 2.

### BR-02 Controlled Server-Side Creation Only

Organization creation is reserved for controlled server-side flows. Unit 4 bootstrap is the first approved flow for creating or connecting tenant organizations.

### BR-03 Organization Deletion Disabled

Organization deletion must be disabled in Unit 2. Future deletion or archival requires a separate design covering tenant linkage, membership history, auditability, and data retention.

### BR-04 Stable Organization Identifier

Business logic must treat Better Auth organization ID as the stable internal linkage key. Slugs and names must not be used as authoritative tenant linkage keys.

## Membership Rules

### BR-05 Citizen Users May Have No Membership

Better Auth users may exist without any organization membership. Lack of membership must not block citizen authentication flows.

### BR-06 Membership Required For Institutional Capabilities

Institutional/admin capabilities must require organization membership when those capabilities are introduced by later units.

### BR-07 Owner Assignment Is Controlled

Owner membership may be assigned only by controlled server-side flows. Users must not self-assign owner status through public auth or client flows.

### BR-08 No Active/Inactive Status In Unit 2

Unit 2 must not implement active/inactive membership status. Membership status remains a future extension path only.

## Better Auth Boundary Rules

### BR-09 Official Plugin APIs Only

Unit 2 must configure and use Better Auth organization support through official plugin APIs. It must not reimplement organization, member, role, session, credential, cookie, or token internals.

### BR-10 Default Role Semantics

Unit 2 uses Better Auth default organization role semantics needed for owner membership. Custom roles and dynamic access control are deferred.

### BR-11 Invitation And Team Workflows Deferred

Unit 2 must not introduce invitation UX, team management, or custom role workflows. If plugin schema includes invitation support, Unit 2 treats it as plugin-owned schema support rather than an enabled business workflow.

## Schema And Migration Rules

### BR-12 Unit 2 Owns Organization Plugin Schema

Unit 2 owns Better Auth organization and member schema/migration implications.

### BR-13 Unit 3 Owns Tenant Metadata Schema

Unit 2 must not create tenant metadata or tenant domain/alias lookup tables. Unit 3 owns those IDP-owned schema objects.

### BR-14 Schema Must Be Reviewable

Generated Drizzle migrations for organization plugin support must be committed and reviewable. Runtime schema creation is not allowed.

## Event Rules

### BR-15 Safe Event Taxonomy

Unit 2 may reserve safe event names for organization configured, member added, and owner assigned.

### BR-16 Concrete Operations Only

Unit 2 emits organization/membership events only for concrete controlled operations introduced in this unit. Better Auth plugin internals are not instrumented directly.

### BR-17 No Sensitive Event Payloads

Organization/membership events must follow Unit 1 payload safety rules. They must not include raw email addresses, request bodies, response bodies, cookies, tokens, session IDs, domain profile data, or raw Better Auth responses.

## Testing Rules

### BR-18 Example-Based Tests

Use existing Vitest example-based tests for Unit 2.

### BR-19 Configuration Tests

Tests must verify organization plugin configuration, public organization creation disabled, organization deletion disabled when supported by plugin config, and Better Auth boundary preservation.

### BR-20 Schema Tests

Tests must verify organization/member schema objects are present in `authSchema` when code generation adds them.

## Misuse And Edge Cases

- Public users attempting organization creation must be denied or impossible through exposed flows.
- Citizen auth flows must continue working without organization membership.
- Owner assignment must not be inferred from email domain, host, signup order, or client-provided role data.
- Organization deletion must not silently remove tenant linkage anchors.
- Slug changes must not break future tenant linkage because the stable key is organization ID.

## Security Compliance

- **SECURITY-08**: BR-01, BR-02, BR-06, and BR-07 preserve deny-by-default access-control behavior for organization ownership.
- **SECURITY-11**: BR-09 and BR-11 keep organization concerns isolated and consider public self-service abuse.
- **SECURITY-12**: BR-09 prevents reimplementation of Better Auth internals.
- **SECURITY-13**: BR-03, BR-04, and BR-14 protect future audit/data integrity needs.
- **SECURITY-15**: BR-01, BR-02, and BR-07 fail closed for organization ownership.

## PBT Compliance

- Unit 2 intentionally avoids custom property-bearing transformations.
- Example-based tests are sufficient under the approved direct Better Auth plugin configuration approach.
- PBT must be revisited if code generation adds custom role/status transformation logic.
