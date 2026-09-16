# Unit 2 Functional Design Plan: Better Auth Organization And Membership Model

## Purpose

Define the business logic, domain entities, and business rules for adding Better Auth organization and membership support to the IDP.

## Unit Context

- **Unit**: Unit 2: Better Auth Organization And Membership Model.
- **Primary Story**: US-02: Model Institutional Tenants And Memberships In The IDP.
- **Supporting Story**: US-01: Emit safe organization/membership events through the Unit 1 event abstraction.
- **Primary Locations**: `apps/idp/src/identity/auth.ts`, `apps/idp/src/database/schema.ts`, `apps/idp/drizzle`, `apps/idp/tests`.
- **Dependencies**: Unit 1 event publication foundation is complete.
- **Out Of Scope**: Tenant domain/alias resolution, bootstrap CLI, frontend organization UI, invitations UX, team management, and durable audit/event persistence.

## Current Context

- Better Auth is configured with `better-auth/minimal`, Drizzle adapter, email/password auth, DB-backed sessions, and UUID v7 IDs.
- Current Drizzle schema includes `idp_user`, `idp_session`, `idp_account`, and `idp_verification`.
- Unit 1 provides event contracts and no-op event publication for auth flows.
- Unit 2 owns Better Auth organization/membership schema implications, while Unit 3 owns dedicated tenant/domain lookup schema.

## Functional Design Questions

Please answer every `[Answer]:` tag before Unit 2 functional design artifacts are generated.

### Question 1
How should public/self-service organization creation be handled in Unit 2?

A) Disable public self-service organization creation completely; only future server-side bootstrap/admin flows may create organizations
B) Allow verified users to create one organization from public auth/client flows
C) Allow public organization creation only in local/development environments
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What should Unit 2 define as the owner assignment model?

A) Organization owner membership is assigned only by controlled server-side flows; Unit 4 bootstrap will create the initial owner
B) The first user who signs up for an organization domain automatically becomes owner
C) Every verified user can request owner assignment through the IDP auth API
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
How should citizen users relate to institutional memberships?

A) Citizen users may exist as Better Auth users without any organization membership; membership is required only for institutional/admin capabilities
B) Every Better Auth user must belong to exactly one organization after Unit 2
C) Citizen users and institutional users should use separate user tables
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
Which Better Auth organization features should Unit 2 include in the functional design?

A) Organization and member plugin support only; invitations and teams remain deferred
B) Organization, member, and invitations now; teams deferred
C) Organization, member, invitations, teams, and custom roles now
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
How should organization deletion be handled?

A) Disable organization deletion in Unit 2 to avoid auditability and tenant-data ownership risks
B) Allow deletion only for owners while relying on Better Auth default cascade behavior
C) Allow deletion in local/development only for test data cleanup
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
What organization identifier should business logic treat as stable for future tenant linkage?

A) Better Auth organization ID is the stable internal linkage key; tenant metadata in Unit 3 will reference it
B) Organization slug is the stable linkage key for all tenant/domain relationships
C) Organization name is stable enough for tenant linkage
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
How should Unit 2 model active/inactive membership status?

A) Do not implement active/inactive status in Unit 2; document it as a future extension path only
B) Add an IDP-owned membership status extension table in Unit 2
C) Add a custom Better Auth member additional field for status in Unit 2
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
What event coverage should Unit 2 design for organization/membership operations?

A) Reserve safe event names for organization configured, member added, and owner assigned, but emit only where Unit 2 has concrete controlled operations
B) Do not change event taxonomy until Unit 4 bootstrap needs events
C) Emit runtime logs for all Better Auth organization plugin operations
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 9
How should Unit 2 handle database/schema ownership?

A) Add Better Auth organization plugin schema objects in `apps/idp/src/database/schema.ts` and generate Drizzle migration in Unit 2
B) Configure the plugin but defer all organization schema/migrations to Unit 3
C) Rely on Better Auth CLI at runtime without committing schema changes
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 10
What testing approach should Unit 2 functional design require?

A) Example-based Vitest tests for plugin configuration, public organization creation disabled, schema presence, and Better Auth boundary preservation
B) Full integration tests against PostgreSQL and Better Auth organization APIs in Unit 2
C) PBT for organization/member role combinations in Unit 2
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Functional Design Generation Checklist

- [x] Load answered Unit 2 Functional Design questions.
- [x] Validate answers for ambiguity or contradictions.
- [x] Generate `business-logic-model.md`.
- [x] Generate `business-rules.md`.
- [x] Generate `domain-entities.md`.
- [x] Include Security Baseline compliance summary.
- [x] Include PBT compliance summary.
- [x] Update this plan's checkboxes after artifact generation.
- [x] Update `aidlc-state.md` and `audit.md`.

## Approval Gate

Unit 2 functional design artifacts will not be generated until all questions are answered and validated.
