# Domain Entities: Unit 2 Organization And Membership Model

## Better Auth Organization

### Purpose

Represents an institutional tenant at the IDP authentication and membership boundary.

### Ownership

Better Auth owns organization internals through the official organization plugin. Unit 2 owns configuration and schema/migration integration, not custom organization behavior.

### Business Fields

| Field | Purpose | Notes |
|---|---|---|
| `id` | Stable internal linkage key | Used by Unit 3 tenant metadata. |
| `name` | Organization display name | Not a stable linkage key. |
| `slug` | Optional lookup/display identifier | Not authoritative for tenant linkage. |
| `metadata` | Plugin-supported metadata if used | Must not contain secrets or sensitive tenant profile data in Unit 2. |

## Better Auth Member

### Purpose

Represents a Better Auth user assigned to an institutional organization.

### Ownership

Better Auth owns member internals and role semantics through the organization plugin.

### Business Fields

| Field | Purpose | Notes |
|---|---|---|
| `id` | Membership record identifier | Plugin-owned. |
| `organization_id` | Organization membership link | References Better Auth organization ID. |
| `user_id` | Member user link | References Better Auth user ID. |
| `role` | Membership role | Default Better Auth roles only in Unit 2. |

## Citizen User

### Purpose

Represents a Better Auth user who may authenticate without institutional membership.

### Rules

- Citizen users can exist without organization membership.
- Citizen authentication flows are not blocked by lack of organization membership.
- Citizen users must not gain institutional/admin capabilities without membership.

## Organization Owner

### Purpose

Represents the controlled owner role assignment for an institutional organization.

### Rules

- Owner assignment is controlled server-side only.
- Unit 4 bootstrap will create or connect the initial owner.
- Owner status is not inferred from domain, signup order, or client-provided input.

## Future Tenant Metadata Link

### Purpose

Represents the planned Unit 3 relationship from IDP-owned tenant metadata to Better Auth organization ID.

### Rules

- Unit 2 does not create tenant metadata tables.
- Unit 3 will own tenant metadata and tenant domain/alias lookup schema.
- Better Auth organization ID is the stable foreign/reference key for future linkage.

## Membership Status Extension Path

### Purpose

Documents the future active/inactive membership concept without implementing it in Unit 2.

### Rules

- No active/inactive status field is added in Unit 2.
- Future implementation must choose a supported extension mechanism and define migration, authorization, and audit implications.

## Organization Event Names

### Purpose

Provide future-safe event taxonomy for organization and membership operations.

### Reserved Values

- `identity.organization.configured`
- `identity.organization.member_added`
- `identity.organization.owner_assigned`

### Rules

- Event payloads must follow Unit 1 allowlisting.
- Events are emitted only for concrete controlled operations.
- Better Auth raw responses, request bodies, emails, tokens, cookies, session IDs, domain profile data, and secrets are forbidden.

## Entity Relationships

| Entity | Relationship | Notes |
|---|---|---|
| Better Auth Organization | Has many Better Auth Members | Plugin-owned. |
| Better Auth Member | References one Better Auth User | Plugin-owned. |
| Citizen User | May have zero Better Auth Members | Citizen auth remains membership-optional. |
| Organization Owner | Is a Better Auth Member with owner role | Assigned only by controlled server-side flows. |
| Future Tenant Metadata | References Better Auth Organization ID | Owned by Unit 3. |

## Testable Properties

- **No PBT properties identified** for Unit 2 domain entities. Entity behavior is delegated to Better Auth plugin contracts and verified through example-based tests.
- No custom parser, normalizer, serializer, role algorithm, or state machine is introduced in Functional Design.
- If implementation introduces custom status or role transformations, PBT must be revisited before code generation completes.

## Security Compliance

- Organization and member internals are plugin-owned and isolated from custom reimplementation.
- Public ownership escalation is prevented by server-side-only owner assignment.
- Citizen users remain separate from institutional membership without separate user tables.
- Organization ID is the stable linkage key, reducing slug/name mutation risk.

## PBT Compliance

- PBT is N/A for Unit 2 domain entities under the approved scope.
- Example-based tests cover schema/configuration and key safety constraints.
