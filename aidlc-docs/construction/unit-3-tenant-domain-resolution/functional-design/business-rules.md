# Business Rules: Unit 3 Tenant Domain And Alias Resolution

## Host Source Rules

### BR-01 Prefer Forwarded Host

When `X-Forwarded-Host` is present, tenant resolution uses it as the original host source. Otherwise, tenant resolution uses `Host`.

### BR-02 Trusted Infrastructure Boundary

Forwarded-host trust depends on ingress/proxy infrastructure sanitizing untrusted forwarded headers before the request reaches the IDP.

### BR-03 Ambiguous Host Fails Closed

Missing, empty, malformed, or ambiguous host input must not resolve tenant context.

## Host Normalization Rules

### BR-04 Deterministic Normalization

Host normalization must be deterministic and produce the same output for equivalent supported variants.

### BR-05 Lowercase Hostnames

Normalized lookup keys use lowercase hostnames.

### BR-06 Trailing Dot Handling

Normalization removes one trailing dot from a valid hostname.

### BR-07 Port Handling

Normalization removes a valid port from the selected host. Invalid ports cause rejection.

### BR-08 URL And Path Rejection

Values containing schemes, paths, query strings, fragments, credentials, or control characters are rejected.

### BR-09 DNS Hostname Constraints

Host labels must be non-empty, within DNS label length limits, and the full hostname must be within DNS hostname length limits.

### BR-10 No Wildcard Runtime Matching

Unit 3 resolves only concrete registered normalized hosts. Wildcard matching is not part of Unit 3.

## Tenant And Domain Status Rules

### BR-11 Tenant Status Values

Tenant records support `active`, `pending`, and `disabled`.

### BR-12 Domain Status Values

Tenant domain records support `active`, `pending`, and `disabled`.

### BR-13 Active Requires Active Domain And Tenant

Tenant context is available only when both domain and tenant statuses are `active`.

### BR-14 Pending Is Unavailable

Pending tenant or domain status resolves as unavailable for public diagnostics and fails closed for tenant-bound operations.

### BR-15 Disabled Is Unavailable

Disabled tenant or domain status resolves as unavailable for public diagnostics and fails closed for tenant-bound operations.

## Schema And Relationship Rules

### BR-16 Tenant Table Owns Tenant Metadata

Unit 3 adds an IDP-owned tenant table for tenant metadata and status.

### BR-17 Tenant Links To Better Auth Organization

Tenant metadata links to `idp_organization.id` as the stable organization linkage key.

### BR-18 Domain Table Owns Host Lookup

Unit 3 uses a single `idp_tenant_domain` table with one normalized host per row.

### BR-19 Domain Type Values

Tenant domain records distinguish `primary` and `alias` domain types.

### BR-20 Normalized Host Is Globally Unique

A normalized host may belong to only one tenant domain record. Duplicate normalized host configuration is invalid regardless of status.

### BR-21 Unit 3 Does Not Store Business Profiles

Tenant metadata must not store CPF, CNPJ, address, phone, professional registration, legal representation, process participation, company profile, or technical-responsible profile data.

## Resolution Rules

### BR-22 Unknown Host Is Unavailable

Unknown normalized hosts resolve as unavailable.

### BR-23 Inconsistent Linkage Is Unavailable

If a domain record lacks a valid tenant or the tenant lacks a valid organization linkage, resolution returns unavailable.

### BR-24 Existing Citizen Auth Flows Remain Unchanged

Unit 3 does not require active tenant context for existing citizen auth flows. Later units must explicitly design tenant-bound auth behavior before enforcing it.

## Public Endpoint Rules

### BR-25 Safe Public Status Response

The public tenant status endpoint returns only `tenant_status` with `available` or `unavailable`.

### BR-26 No Public Reason Codes

The public endpoint does not return reason codes for unknown, malformed, pending, disabled, or inconsistent tenant context.

### BR-27 No Public Internal Identifiers

The public endpoint does not return tenant IDs, organization IDs, domain names, aliases, raw hosts, request headers, SQL details, or internal errors.

## Event Rules

### BR-28 Safe Tenant Event Taxonomy

Unit 3 may reserve `identity.tenant.resolved`, `identity.tenant.resolution_failed`, and `identity.tenant.domain_configured`.

### BR-29 Concrete Operations Only

Tenant/domain events are emitted only for concrete operations introduced in Unit 3.

### BR-30 No Per-Status-Call Events By Default

The public status endpoint does not emit an event for every call by default.

### BR-31 No Sensitive Event Payloads

Tenant/domain events must not include raw hosts, headers, emails, request bodies, response bodies, cookies, tokens, session IDs, tenant profile data, or raw database records.

## Misuse And Edge Cases

- Spoofed forwarded host headers must not be trusted unless sanitized by ingress/proxy infrastructure.
- Unknown hosts must not reveal whether a tenant exists under a similar host.
- Disabled and pending tenants/domains must not leak internal reason codes through public responses.
- Duplicate normalized hosts must not create ambiguous tenant resolution.
- Slug/name changes in Better Auth organizations must not break tenant linkage because tenant records reference organization IDs.

## Testable Properties

- **Host normalization idempotence**: `normalize(normalize(host))` equals `normalize(host)` for valid host inputs.
- **Valid-case stability**: Supported case and trailing-dot variants normalize to the same key.
- **Invalid-host rejection**: Invalid generated hosts never produce a lookup key.
- **Lookup-key uniqueness**: Registry behavior assumes global uniqueness of normalized host keys.

## Security Compliance

- **SECURITY-05**: BR-03 through BR-10 define host validation behavior.
- **SECURITY-08**: BR-13 through BR-15 and BR-24 preserve fail-closed tenant-bound behavior without changing citizen auth flows prematurely.
- **SECURITY-09**: BR-25 through BR-27 preserve generic public responses.
- **SECURITY-11**: Misuse cases address spoofing, ambiguity, and disabled tenant/domain behavior.
- **SECURITY-13**: BR-17 and BR-20 preserve stable linkage and integrity.
- **SECURITY-15**: BR-03, BR-22, and BR-23 fail safely on exceptional or inconsistent input.

## PBT Compliance

- **PBT-01**: Compliant. Properties are identified during Functional Design.
- **PBT-03**: Applicable for normalization and lookup invariants.
- **PBT-04**: Applicable for normalization idempotence.
- **PBT-07**: Applicable for host generators.
- **PBT-08**: Applicable during Build and Test.
- **PBT-10**: Applicable because example tests must still cover business-critical cases.
