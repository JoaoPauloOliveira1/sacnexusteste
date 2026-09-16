# Domain Entities: Unit 3 Tenant Domain And Alias Resolution

## Tenant

### Purpose

Represents IDP-owned tenant metadata linked to a Better Auth organization.

### Ownership

The IDP owns tenant metadata for host/domain resolution. Better Auth owns organization and membership internals.

### Fields

| Field | Purpose | Notes |
|---|---|---|
| `id` | Stable tenant metadata identifier | IDP-owned UUID. |
| `organization_id` | Link to Better Auth organization | References `idp_organization.id`. |
| `status` | Tenant availability | `active`, `pending`, or `disabled`. |
| `created_at` | Creation timestamp | Operational metadata. |
| `updated_at` | Update timestamp | Operational metadata. |

### Excluded Fields

Tenant records do not store business/person profile data such as CPF, CNPJ, address, phone, process participation, company profile, or technical-responsible data.

## Tenant Domain

### Purpose

Represents one concrete normalized host that can resolve to a tenant.

### Ownership

The IDP owns tenant domain and alias registry records.

### Fields

| Field | Purpose | Notes |
|---|---|---|
| `id` | Domain record identifier | IDP-owned UUID. |
| `tenant_id` | Link to tenant metadata | References tenant `id`. |
| `normalized_host` | Unique lookup key | Globally unique and indexed. |
| `domain_type` | Primary or alias classification | `primary` or `alias`. |
| `status` | Domain availability | `active`, `pending`, or `disabled`. |
| `created_at` | Creation timestamp | Operational metadata. |
| `updated_at` | Update timestamp | Operational metadata. |

### Rules

- One normalized host per row.
- A tenant may have multiple domain records.
- Duplicate normalized hosts are invalid.
- Domain records are status-controlled rather than hard-deleted in normal workflows.

## Host Source

### Purpose

Represents the raw host candidate selected from request headers.

### Values

- `X-Forwarded-Host` if present.
- `Host` if `X-Forwarded-Host` is absent.

### Rules

- Raw host values are not exposed through public responses.
- Raw host values are not included in tenant/domain events.
- Ambiguous or malformed raw host values resolve as unavailable.

## Normalized Host Lookup Key

### Purpose

Canonical host key used to query `idp_tenant_domain`.

### Construction

- Trim surrounding whitespace.
- Lowercase hostname.
- Remove one trailing dot.
- Remove valid port.
- Reject malformed host input.

### Examples

| Raw Host | Normalized Host |
|---|---|
| `PE.SACNEXUS.COM.BR` | `pe.sacnexus.com.br` |
| `pe.sacnexus.com.br.` | `pe.sacnexus.com.br` |
| `pe.sacnexus.com.br:443` | `pe.sacnexus.com.br` |

## Tenant Resolution Result

### Purpose

Represents the resolver output used internally and by the public status endpoint.

### Internal Variants

- `available`: active domain and active tenant found.
- `unavailable`: host missing, malformed, unknown, pending, disabled, ambiguous, or inconsistent.

### Public Projection

The public status endpoint projects the result to:

```json
{ "tenant_status": "available" }
```

or:

```json
{ "tenant_status": "unavailable" }
```

## Tenant Event Names

### Reserved Values

- `identity.tenant.resolved`
- `identity.tenant.resolution_failed`
- `identity.tenant.domain_configured`

### Rules

- Events are safe and no-PII/no-secret.
- Events are emitted only for concrete operations introduced in Unit 3.
- Public status endpoint calls are not event-emitted by default.

## Entity Relationships

| Entity | Relationship | Notes |
|---|---|---|
| Tenant | References one Better Auth Organization | Uses `idp_organization.id` from Unit 2. |
| Tenant | Has many Tenant Domains | Multiple domains and aliases per tenant. |
| Tenant Domain | Belongs to one Tenant | Each host maps to one tenant. |
| Normalized Host Lookup Key | Identifies one Tenant Domain | Globally unique. |
| Tenant Resolution Result | Derived from Host Source, Tenant Domain, and Tenant | Internal result projected safely to public response. |

## Testable Properties

- **Idempotence**: Normalizing a valid normalized host again returns the same value.
- **Invariant**: Case and single trailing-dot variants produce the same key for valid hosts.
- **Invariant**: Invalid hosts do not produce keys.
- **Invariant**: Each normalized host maps to at most one domain record.

## Security Compliance

- Tenant metadata links to Better Auth organization IDs, not mutable names or slugs.
- Tenant domain lookup keys are globally unique to avoid ambiguous resolution.
- Public projections hide internal identifiers and reasons.
- Business profile data remains outside IDP tenant tables.

## PBT Compliance

- Unit 3 entities include property-bearing host normalization and lookup-key behavior.
- PBT is required for normalization and lookup-key invariants during code generation.
- Example-based tests remain required for active, pending, disabled, unknown, malformed, and forwarded-host scenarios.
