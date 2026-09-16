# Domain Entities: Unit 4 IDP Bootstrap Scripts

## Bootstrap Command

### Purpose

Represents the operational entry point used by a platform operator to provision tenant setup in the IDP.

### Ownership

The command is owned by `apps/idp` and exposed as a package-level script.

### Inputs

| Input | Purpose | Notes |
|---|---|---|
| `name` | Tenant/organization display name | Required. Must not be printed in unsafe contexts. |
| `slug` | Organization slug where required by Better Auth | Required when organization creation needs it. |
| `domain` | Primary tenant domain | Required. Normalized through Unit 3 host normalization. |
| `alias` | Additional tenant domains | Optional, repeatable or list-based. Normalized through Unit 3 host normalization. |
| `owner_email` | Owner user lookup and creation email | Required. Sensitive output value. |
| `owner_name` | Owner user display name | Required for new owner creation. Sensitive output value unless later policy explicitly allows it. |
| `temporary_password` | Credential for new owner user creation | Required for new user creation. Secret. |

### Excluded Inputs

The command does not accept CPF, CNPJ, address, phone, professional registration, process data, company profile data, technical-responsible data, bearer tokens, session tokens, cookies, or raw SQL.

## Bootstrap Request

### Purpose

Represents validated intent after CLI parsing but before mutation.

### Fields

| Field | Purpose | Notes |
|---|---|---|
| `organization_intent` | Desired organization identity | Includes safe creation/connect intent. |
| `tenant_intent` | Desired tenant metadata intent | Links tenant to organization. |
| `primary_domain` | Normalized primary host | Derived from `domain`. |
| `aliases` | Normalized alias hosts | Derived from optional alias inputs. |
| `owner_intent` | Desired owner user and membership | Contains sensitive owner email/password internally only. |

### Rules

- Raw CLI values are validated before mutation where practical.
- Sensitive owner values remain internal and are not projected to output or events.
- Domain values are persisted only as normalized hosts.

## Bootstrap Result

### Purpose

Represents safe operation-level outcome for command output and tests.

### Fields

| Field | Purpose | Notes |
|---|---|---|
| `status` | Overall result | `completed` or `failed`. |
| `organization` | Operation category result | `created`, `reused`, `skipped`, or `failed`. |
| `tenant` | Operation category result | `created`, `reused`, `skipped`, or `failed`. |
| `domains` | Operation category result | Aggregate created/reused/skipped/failed status without host values. |
| `owner_user` | Operation category result | `created`, `reused`, `skipped`, or `failed`. |
| `owner_membership` | Operation category result | `assigned`, `already_satisfied`, `skipped`, or `failed`. |
| `failure_category` | Safe failure classification | Optional, generic and non-sensitive. |

### Excluded Fields

Bootstrap result must not include internal IDs, owner email, password, raw domains, normalized domain values, connection strings, SQL, stack traces, tokens, cookies, session IDs, request bodies, response bodies, or full records.

## Organization

### Purpose

Represents Better Auth organization identity for an institutional tenant.

### Ownership

Better Auth owns organization internals. Unit 4 uses supported server-side organization APIs to create or connect organizations.

### Rules

- Public organization self-service remains disabled.
- Organization ID is the stable linkage key used by the IDP tenant record.
- Organization creation or reuse must not depend on mutable display-only fields alone.

## Tenant

### Purpose

Represents IDP-owned tenant metadata linked to a Better Auth organization.

### Ownership

The IDP owns tenant metadata. Better Auth owns the organization referenced by the tenant.

### Fields Used By Unit 4

| Field | Purpose | Notes |
|---|---|---|
| `id` | Tenant metadata identifier | Internal only; not printed. |
| `organization_id` | Link to Better Auth organization | Stable linkage key. |
| `status` | Tenant availability | Compatible status required for bootstrap reuse. |
| `created_at` | Creation timestamp | Operational metadata. |
| `updated_at` | Update timestamp | Operational metadata. |

### Excluded Fields

Tenant does not store business/person profile data, CPF, CNPJ, address, phone, process participation, company profile, or technical-responsible data.

## Tenant Domain

### Purpose

Represents one concrete normalized primary domain or alias for tenant resolution.

### Ownership

The IDP owns tenant domain and alias registry records.

### Fields Used By Unit 4

| Field | Purpose | Notes |
|---|---|---|
| `id` | Domain record identifier | Internal only; not printed. |
| `tenant_id` | Link to tenant metadata | Must match intended tenant for reuse. |
| `normalized_host` | Lookup key | Derived from Unit 3 normalization; not printed. |
| `domain_type` | Primary or alias classification | `primary` or `alias`. |
| `status` | Domain availability | Compatible status required for active setup. |
| `created_at` | Creation timestamp | Operational metadata. |
| `updated_at` | Update timestamp | Operational metadata. |

### Rules

- A tenant has one required primary domain for bootstrap setup.
- A tenant may have zero or more aliases.
- A normalized host can belong to only one tenant domain record.
- Existing normalized hosts linked to another tenant are conflicts.

## Owner User

### Purpose

Represents the initial institutional owner account.

### Ownership

Better Auth owns user and credential internals.

### Fields Used By Unit 4

| Field | Purpose | Notes |
|---|---|---|
| `email` | Lookup and creation identity | Sensitive. Not printed or emitted. |
| `name` | User display name for creation | Sensitive output value. |
| `temporary_password` | Credential for new user creation | Secret. Never printed or logged. |

### Rules

- Existing owner email maps to existing user reuse when safe.
- Absent owner email leads to user creation through Better Auth-supported flows.
- Unit 4 does not implement credential internals directly.

## Owner Membership

### Purpose

Represents the owner's institutional membership in the target organization.

### Ownership

Better Auth organization/member APIs own membership internals. IDP bootstrap orchestrates assignment.

### Fields Used By Unit 4

| Field | Purpose | Notes |
|---|---|---|
| `organization_id` | Target organization | Internal only; not printed. |
| `user_id` | Owner user | Internal only; not printed. |
| `role` | Membership role | Initial role is `owner`. |

### Rules

- Existing owner membership is already satisfied.
- Missing owner membership is assigned through supported APIs.
- Conflicting membership state fails safely.

## Bootstrap Event

### Purpose

Represents safe setup events emitted or simulated through the Unit 1 event abstraction.

### Fields

| Field | Purpose | Notes |
|---|---|---|
| `event_name` | Safe operation taxonomy | Final names resolved in code generation. |
| `operation` | Operation category | Examples: organization, tenant, domain, owner, membership. |
| `outcome` | Result classification | Examples: started, created, reused, assigned, completed, failed. |
| `reason_category` | Safe failure category | Optional, generic and non-sensitive. |

### Excluded Fields

Events must not include owner email, owner name, password, raw domain input, normalized host, internal IDs, SQL, stack traces, tokens, cookies, session IDs, request bodies, response bodies, or full records.

## Entity Relationships

| Entity | Relationship | Notes |
|---|---|---|
| Bootstrap Command | Produces one Bootstrap Request | CLI values become validated intent. |
| Bootstrap Request | Creates or connects Organization | Uses Better Auth-supported APIs. |
| Organization | Has one Tenant metadata record for this setup | Tenant links by organization ID. |
| Tenant | Has one primary Tenant Domain | Required by bootstrap. |
| Tenant | Has zero or more alias Tenant Domains | Optional aliases. |
| Owner User | Has Owner Membership in Organization | Role is `owner`. |
| Bootstrap Result | Projects safe operation outcomes | No sensitive values or internal IDs. |
| Bootstrap Event | Records safe operation outcomes | No PII, secrets, raw inputs, or internals. |

## Testable Properties

- **Idempotence**: Same intended bootstrap request over existing matching state is already satisfied or reuses records.
- **Invariant**: A normalized host belongs to at most one tenant and is never reassigned implicitly.
- **Invariant**: Bootstrap output and events omit forbidden sensitive values and internal fields.
- **Safety**: Invalid domain, missing required input, or duplicate alias input fails before owner membership is granted.
- **Reuse**: Domain validation uses Unit 3 normalized host behavior rather than new host parsing semantics.

## Security Compliance

- Operational command inputs and outputs separate sensitive internal values from safe projections.
- Better Auth owns user, password, organization, and membership internals.
- IDP tenant/domain records preserve stable organization linkage and normalized host uniqueness.
- Bootstrap events and results remain no-PII/no-secret.

## PBT Compliance

- Unit 4 primarily relies on example-based tests for orchestration scenarios.
- PBT is not primary ownership if code generation reuses Unit 3 normalization and avoids custom pure parsing/normalization helpers.
- If custom pure validation, sanitization, or idempotency helpers are introduced, code generation must evaluate them for PBT coverage.
