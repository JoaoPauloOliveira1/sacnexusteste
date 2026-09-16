# Business Rules: Unit 4 IDP Bootstrap Scripts

## Command Rules

### BR-01 Single App-Level Command

Unit 4 uses one app-level bootstrap command owned by `apps/idp` for tenant setup.

### BR-02 Package-Level Ownership

The command must be exposed through `apps/idp` package scripts. Root scripts must continue to delegate through Turborepo and must not own IDP-specific bootstrap logic.

### BR-03 Operational Tooling Only

Bootstrap is not a public endpoint, public UI flow, self-service registration flow, or invitation flow.

## Input Rules

### BR-04 Required Inputs

Bootstrap requires tenant/organization name, organization slug when needed, primary domain, owner email, owner name, and temporary password for new owner user creation.

### BR-05 Optional Alias Inputs

Bootstrap may accept zero or more alias domains in addition to the primary domain.

### BR-06 Validate Before Mutation

All required inputs must be parsed and validated before mutation where practical.

### BR-07 Reuse Host Normalization

Domain and alias validation must reuse Unit 3 host normalization. Unit 4 must not store raw domain inputs as lookup keys.

### BR-08 Duplicate Domain Inputs Are Invalid

Duplicate normalized hosts in the same bootstrap command are invalid unless explicitly handled as a single intended domain without duplicate mutation.

### BR-09 Sensitive Inputs Are Never Printed

Temporary password, owner email, and raw domain inputs must not be printed, logged, or emitted in events.

## Organization Rules

### BR-10 Use Better Auth Supported APIs

Organization creation, connection, and member assignment must use official Better Auth server-side organization/member APIs where available.

### BR-11 No Public Organization Creation

Bootstrap must not change the existing policy that public/self-service organization creation is disabled.

### BR-12 Connect-Or-Create Organization

Bootstrap reuses an existing matching organization or creates a new one when absent.

### BR-13 Organization Conflict Fails Safely

If an existing organization conflicts with the requested tenant identity, bootstrap must fail safely rather than mutating unrelated organization state.

## Tenant Rules

### BR-14 Tenant Links To Organization

The IDP tenant record must link to the stable Better Auth organization ID.

### BR-15 Connect-Or-Create Tenant

Bootstrap reuses an existing matching tenant or creates a tenant linked to the intended organization when absent.

### BR-16 Tenant Conflict Fails Safely

A tenant linked to a different organization than requested must not be silently reused.

### BR-17 No New Business Profile Data

Bootstrap must not add CPF, CNPJ, address, phone, process participation, company profile, technical-responsible data, or other business-domain profile data to IDP-owned records.

## Domain Rules

### BR-18 One Primary Domain

Bootstrap requires one primary domain for the tenant.

### BR-19 Zero Or More Aliases

Bootstrap may register zero or more alias domains for the same tenant.

### BR-20 Normalized Host Is The Matching Key

Domain reuse and conflict checks use normalized host values.

### BR-21 Domain Reuse Requires Same Tenant

An existing domain record may be reused only when it belongs to the intended tenant and has compatible type/status.

### BR-22 Domain Conflict Fails Safely

A normalized host already linked to another tenant must not be reassigned implicitly.

### BR-23 Domain Status Must Be Compatible

Bootstrap should create or reuse domains with compatible status for the intended active setup. Incompatible pending/disabled state requires explicit safe failure or a later approved status-change rule.

## Owner User Rules

### BR-24 Create User When Absent

If the owner email has no existing Better Auth user, bootstrap creates the owner user through Better Auth-supported credential handling.

### BR-25 Reuse Existing User When Safe

If the owner email already maps to an existing Better Auth user, bootstrap reuses that user and assigns owner membership when safe.

### BR-26 Do Not Duplicate Owner Users

Bootstrap must not create duplicate owner users for the same owner email.

### BR-27 Temporary Password Required For New User

Temporary password is required when creating a new owner user.

### BR-28 Better Auth Owns Credential Internals

Bootstrap must not implement password hashing, account linking, token handling, cookies, sessions, or credential storage outside Better Auth-supported flows.

## Membership Rules

### BR-29 Owner Role Assignment

Bootstrap assigns the initial owner role to the owner user for the intended organization.

### BR-30 Existing Owner Membership Is Idempotent

If the owner user already has owner membership for the intended organization, bootstrap treats membership as already satisfied.

### BR-31 No Partial Owner Grant On Invalid Input

Invalid required input must fail without granting owner membership.

### BR-32 Membership Conflict Fails Safely

If existing membership state conflicts with owner assignment or cannot be safely updated through supported Better Auth APIs, bootstrap fails safely.

## Rerun Rules

### BR-33 Idempotent Same-State Rerun

Rerunning the command with the same intended state must reuse existing matching records and avoid unsafe duplication.

### BR-34 Conflicting Rerun Fails Safely

Rerunning with changed identifiers that conflict with existing records must fail safely and must not mutate unrelated tenant, domain, organization, user, or member state.

### BR-35 No Delete-And-Recreate

Bootstrap must not delete and recreate tenant, organization, domain, user, or membership records to satisfy a rerun.

## Failure Rules

### BR-36 Transaction Where Feasible

Related IDP-owned database mutations should execute in a transaction where feasible.

### BR-37 Safe Operation Ordering

When Better Auth operations cannot share the same transaction boundary as IDP-owned records, operation ordering must minimize unsafe partial state and must fail without partial owner access.

### BR-38 Generic Failure Output

Failure output must use safe operation-level labels and generic categories only.

### BR-39 No Raw Internal Errors

Bootstrap output must not include raw SQL errors, stack traces, database parameters, raw Better Auth responses, or internal exception details.

## Output Rules

### BR-40 Safe High-Level Output

Bootstrap output may include created/reused/skipped status by operation category.

### BR-41 No Sensitive Output

Bootstrap output must not include owner email, temporary password, database URL, tokens, cookies, session IDs, reset URLs, verification URLs, raw domain input, raw host input, or internal IDs.

### BR-42 No Full Record Dumps

Bootstrap must not print full database, Better Auth, user, organization, member, tenant, or domain records.

## Event Rules

### BR-43 Emit Safe Setup Events

Bootstrap emits or simulates safe setup events through the Unit 1 event abstraction where concrete operations occur.

### BR-44 Event Payloads Are Allowlisted

Bootstrap event payloads must contain only safe operation labels, outcome, and non-sensitive classification.

### BR-45 Failed Events Are Safe

Failure events must not include raw errors, SQL, credentials, owner email, raw domains, tokens, request bodies, response bodies, or internal IDs.

## Misuse And Edge Cases

- Operator reruns the same command and must not create duplicates.
- Operator supplies a domain already linked to a different tenant and bootstrap must fail safely.
- Operator supplies invalid domain or duplicate alias inputs and bootstrap must fail before owner access is granted.
- Operator supplies an existing owner email and bootstrap must reuse the user only when safe.
- Better Auth member assignment fails after earlier setup steps and bootstrap must not report success or expose internals.
- Command output must remain safe even on unexpected database or Better Auth failures.

## Testable Properties

- **Rerun safety**: Same intended state does not create duplicate records or memberships.
- **Conflict safety**: Existing domains linked to other tenants are not reassigned implicitly.
- **Output safety**: Forbidden sensitive values and fields never appear in command output.
- **Validation safety**: Invalid input fails before owner membership is granted.
- **Normalization reuse**: Domain keys are generated through Unit 3 normalization behavior.

## Security Compliance

- **SECURITY-03**: BR-09, BR-38 through BR-42, and BR-44 through BR-45 protect logs, output, and events.
- **SECURITY-05**: BR-04 through BR-08 define validation requirements.
- **SECURITY-08**: BR-03, BR-10 through BR-11, and BR-29 define privileged server-side behavior.
- **SECURITY-09**: BR-38 through BR-39 preserve generic error projection.
- **SECURITY-11**: Misuse cases cover rerun, conflict, unsafe output, and partial failure behavior.
- **SECURITY-12**: BR-10 and BR-28 preserve Better Auth boundaries.
- **SECURITY-13**: BR-14 through BR-23 and BR-43 preserve tenant/domain integrity and event traceability.
- **SECURITY-15**: BR-31, BR-34, BR-36, and BR-37 define fail-safe behavior.

## PBT Compliance

- **PBT-01**: Compliant. Properties are identified during Functional Design.
- **PBT-03**: Applicable if code generation introduces custom pure validation or output sanitization helpers.
- **PBT-04**: Applicable if code generation introduces pure idempotency or normalization helpers.
- **PBT-10**: Applicable because example tests must cover success, rerun, invalid input, conflicts, safe output, and failure paths.
