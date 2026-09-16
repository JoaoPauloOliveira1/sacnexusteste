# Unit Of Work Story Map

## Story Assignment Summary

| Story | Primary Unit | Supporting Units | Coverage Status |
|---|---|---|---|
| US-01: Publish Safe Identity Events From Existing Auth Flows | Unit 1 | Units 2, 3, 4 | Assigned |
| US-02: Model Institutional Tenants And Memberships In The IDP | Unit 2 | Units 1, 5 | Assigned |
| US-03: Resolve Tenant Context From The Original Request Host | Unit 3 | Units 1, 5 | Assigned |
| US-04: Bootstrap Tenants, Domains, And Initial Owner Users Safely | Unit 4 | Units 1, 2, 3, 5 | Assigned |

## Unit 1 Story Coverage

### US-01: Publish Safe Identity Events From Existing Auth Flows

- Defines event publication abstraction.
- Adds no-op event publisher.
- Adds safe event seams to existing auth flows.
- Supports later tenant, membership, and bootstrap events.

## Unit 2 Story Coverage

### US-02: Model Institutional Tenants And Memberships In The IDP

- Configures Better Auth organization plugin.
- Prevents public self-service organization creation.
- Establishes institutional tenant/membership ownership boundary.
- Owns Better Auth organization/membership schema implications.

### US-01 Supporting Coverage

- Emits safe organization/membership events through Unit 1 abstraction.

## Unit 3 Story Coverage

### US-03: Resolve Tenant Context From The Original Request Host

- Adds tenant and domain/alias lookup schema.
- Implements trusted host source strategy.
- Implements safe tenant/domain status resolution.
- Adds public diagnostic/status endpoint.
- Owns primary PBT coverage for host normalization.

### US-01 Supporting Coverage

- Emits safe tenant/domain resolution or configuration events where applicable.

## Unit 4 Story Coverage

### US-04: Bootstrap Tenants, Domains, And Initial Owner Users Safely

- Adds CLI flag-based bootstrap command.
- Creates new Better Auth owner user with provided temporary password.
- Creates or connects tenant/organization records.
- Registers domains/aliases.
- Assigns owner role.
- Produces safe output.

### US-01 Supporting Coverage

- Emits safe bootstrap/tenant/owner events through Unit 1 abstraction.

### US-02 Supporting Coverage

- Uses Better Auth organization/member APIs from Unit 2.

### US-03 Supporting Coverage

- Uses tenant/domain models and validation from Unit 3.

## Unit 5 Story Coverage

### Cross-Story Documentation Coverage

- Updates durable docs for all implemented units.
- Updates roadmap only after verification.
- Captures deferred future work for invitations, admin plugin, 2FA, FastAPI integration, audit worker, and frontend integration when not already tracked.

## Completeness Check

- [x] US-01 assigned to Unit 1.
- [x] US-02 assigned to Unit 2.
- [x] US-03 assigned to Unit 3.
- [x] US-04 assigned to Unit 4.
- [x] Cross-cutting documentation assigned to Unit 5.
- [x] Every story has a primary unit.
- [x] Supporting dependencies are documented.

## Security And PBT Mapping

| Concern | Primary Unit | Notes |
|---|---|---|
| No-PII/no-secret event payloads | Unit 1 | Supports all units. |
| Better Auth boundary | Unit 2 | No internals reimplementation. |
| Citizen/member separation | Unit 2 | Public users are not institutional members. |
| Host validation and fail-closed tenant resolution | Unit 3 | Primary PBT target. |
| Safe public diagnostics | Unit 3 | OpenAPI and response safety required. |
| Safe bootstrap output and reruns | Unit 4 | No secrets/PII in CLI output. |
| Roadmap/doc traceability | Unit 5 | Update after verification. |
