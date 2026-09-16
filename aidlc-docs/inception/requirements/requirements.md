# Requirements

## Intent Analysis Summary

- **User Request**: Continue implementing the `apps/idp` roadmap from `idp-architecture-discussion.md`, focusing on the next selected IDP capabilities.
- **Request Type**: New feature and security-oriented platform enhancement.
- **Scope Estimate**: Single application package (`apps/idp`) with database schema, Better Auth plugin configuration, internal events, tenant resolution, bootstrap scripts, tests, and documentation.
- **Complexity Estimate**: Complex. The scope changes identity, tenant, membership, request-host resolution, operational scripts, security posture, database persistence, OpenAPI contracts, and future audit/event integration points.
- **Selected Roadmap Scope**: Internal event publication abstraction, Better Auth organization plugin with tenant/membership ownership model, tenant domain/alias resolution from original request host, and bootstrap scripts for tenants/domains/initial owner users.

## Source Context

- `idp-architecture-discussion.md` defines the IDP roadmap, responsibility boundaries, tenant model, Better Auth plugin direction, and event publication strategy.
- `docs/idp/architecture.md` defines the current IDP layers and future `src/events` layer.
- `docs/idp/security.md` defines IDP security constraints for secrets, logging, Better Auth internals, data boundaries, and auth behavior.
- `aidlc-docs/inception/reverse-engineering/*` documents the current brownfield architecture.

## Functional Requirements

### FR-01 Internal Event Publication Abstraction

- The IDP must introduce a small internal event publication abstraction for identity and tenant-related events.
- The initial publisher implementation may be no-op or structured-log based, but callers must depend on a stable internal interface rather than direct ad hoc logging.
- The event abstraction must support future replacement by a persistent audit worker, outbox, queue, or event bus without changing every use case.
- Initial auth flows must emit events through this abstraction where behavior already exists, including signup, sign-in, sign-out, email verification, password reset, password change, and session revocation where practical.
- Event payloads must use safe identifiers and operation labels and must not include passwords, tokens, cookies, raw email addresses, request bodies, response bodies, verification/reset URLs, rendered emails, CPF, CNPJ, or domain profile data.
- Event emission failures must not fail open for security decisions. If event publication is required for a security-sensitive operation in a future design, the failure mode must be explicit and fail-safe.

### FR-02 Better Auth Organization Plugin

- The IDP must add Better Auth's `organization` plugin using official Better Auth extension points.
- Organization creation must not be public self-service in the initial implementation.
- Institutional tenants must be represented through Better Auth organizations or an equivalent Better Auth-supported model.
- `organization.member` must represent internal/institutional users only, not citizen/public users.
- The initial role model must start with the smallest useful set, initially `owner`, while keeping the access-control structure ready for future roles such as `admin`, `manager`, `analyst`, `operator`, and `reader`.
- Tenant/organization deletion must be disabled or made inaccessible in the first version; status changes must be preferred over hard deletion.
- The IDP must avoid dynamic roles, teams, bearer/localStorage flows, passkeys, JWT/OAuth Provider, and user-facing 2FA rollout in this cycle unless implementation constraints prove they are required.

### FR-03 Tenant And Membership Ownership Model

- The IDP must own institutional tenant membership and broad role/permission context.
- FastAPI/business APIs must remain responsible for resource-level authorization, process/profile data, tenant-scoped business queries, and domain-specific permissions.
- Business/person data such as CPF, CNPJ, address, phone, professional registration, legal representation, process participation, and company/technical-responsible profile data must not be added to IDP-owned tables in this cycle.
- Membership must include enough information to determine user, organization/tenant, role, and status.
- Membership status must support at least active and inactive concepts, either directly in the model or through a clearly documented extension path.
- Removing an institutional user from a tenant must preserve history and auditability; hard deletion must be avoided where Better Auth allows a safer status-based approach.
- All membership mutations introduced in this cycle must emit identity/tenant events through the event abstraction.

### FR-04 Tenant Domain And Alias Resolution

- The IDP must resolve tenant context from the original request host for relevant signup/auth/organization flows.
- Resolution must support both dedicated domains, such as `sacnexuspe.com`, and subdomain patterns, such as `pe.sacnexus.com.br`.
- Resolution must use a tenant domain/alias registry rather than hardcoded host-to-tenant mapping.
- A tenant may have multiple domains or aliases.
- Tenant domains must support statuses such as active, pending, and disabled.
- Tenants must support statuses such as active, pending, and disabled.
- Unknown or unregistered hosts must be handled with safe generic behavior and must not expose technical details or business-sensitive information.
- Disabled tenant or domain status must prevent access where appropriate without deleting configuration.
- The IDP must receive and validate original host context from `Host` and/or trusted forwarded host headers, with trust boundaries documented.

### FR-05 Bootstrap Scripts

- The IDP must add operational bootstrap scripts inside `apps/idp` for controlled tenant setup.
- Scripts must support creating tenants/organizations, registering tenant domains/aliases, and creating or assigning initial owner users.
- Bootstrap scripts must be package-level commands or documented operational commands aligned with existing pnpm/Turborepo conventions.
- Scripts must use centralized environment validation and must not read real `.env` files in tests.
- Scripts must be idempotent or clearly document safe rerun behavior.
- Scripts must avoid printing secrets, connection strings, raw user credentials, tokens, session IDs, or sensitive PII.
- Scripts must emit or simulate appropriate identity/tenant events through the same event abstraction where practical.

### FR-06 Database And Migration Requirements

- Database schema changes must be modeled through Drizzle under `apps/idp/src/database/schema.ts` and generated as explicit migrations under `apps/idp/drizzle`.
- New IDP-owned physical tables must keep the existing `idp_` prefix and `snake_case` naming convention unless Better Auth adapter constraints require a documented exception.
- Foreign keys must be indexed when joins or lookups are expected.
- Tables involved in tenant/domain resolution must support efficient lookup by normalized host/domain alias.
- Schema and migration changes must preserve explicit IDP ownership boundaries.
- Migrations must not run automatically on app startup.

### FR-07 API And OpenAPI Requirements

- Any new IDP HTTP endpoints introduced in this cycle must expose OpenAPI metadata outside production.
- Endpoint payloads emitted by the IDP must use `snake_case`.
- OpenAPI examples must be synthetic and non-sensitive.
- Custom endpoints must define stable operation IDs, route tags, summaries, descriptions, and explicit response schemas.
- Response payloads must not expose Better Auth session tokens, session IDs, cookies, raw provider responses, internal stack traces, CPF, CNPJ, or realistic personal data.

### FR-08 Documentation Requirements

- The implementation plan must determine whether new or updated PRD/task documents are needed under `docs/initiatives/prds` and `docs/initiatives/tasks` before code generation.
- Durable docs under `docs/idp` must be updated for event publication, organization/tenant ownership, tenant domain resolution, bootstrap scripts, and any new operational commands.
- `apps/idp/README.md` must be updated if new runtime variables, scripts, setup steps, migrations, or smoke-test commands are introduced.
- `idp-architecture-discussion.md` must be updated after implementation and verification to mark completed roadmap items.
- `docs/TODO.md` must only receive items that are not already covered by the active implementation task plan.

## Non-Functional Requirements

### NFR-01 Security Baseline

- Security Baseline extension is enabled as a blocking constraint for this AI-DLC cycle.
- Public-facing IDP endpoints must validate all inputs and enforce explicit authorization for protected operations.
- Authentication, organization, membership, and tenant operations must use Better Auth supported APIs and plugins wherever possible.
- The implementation must not reimplement Better Auth cryptographic, password, session, cookie, token, or security internals.
- Session cookies must remain secure, HttpOnly, and SameSite as configured by Better Auth and current IDP policy.
- No auth tokens may be stored in `localStorage`.
- No secrets may be exposed through frontend runtime config, OpenAPI examples, logs, PR comments, or generated docs.
- Production error responses must be generic and must not expose stack traces, internal paths, database details, provider details, or framework internals.
- Public-facing auth and tenant endpoints must rely on Better Auth rate limiting where available and document any remaining custom rate-limit gap.

### NFR-02 Logging, Auditability, And Event Safety

- Structured logging must remain the default.
- Logs and events must include request ID or enough correlation context where available.
- Logs and events must not include passwords, cookies, tokens, OTPs, backup codes, email addresses, names, raw query strings, request bodies, response bodies, IP addresses, full user-agent strings, CPF, CNPJ, session IDs, rendered emails, or connection strings unless a future approved audit design defines a safe policy.
- The event abstraction must preserve enough context for future auditability while staying no-PII by default.
- Security-relevant events must be distinguishable by operation label and outcome.

### NFR-03 Tenant Resolution Robustness

- Host/domain normalization must be deterministic and testable.
- Host matching must reject malformed or ambiguous hosts safely.
- Unknown-host handling must fail closed for tenant-bound operations.
- Disabled tenant/domain handling must fail closed where access depends on active tenant context.
- Trust of forwarded host headers must be explicitly limited to trusted infrastructure assumptions and documented.

### NFR-04 Maintainability

- The implementation must keep the IDP structure simple and avoid speculative abstractions beyond the selected event, tenant, organization, and bootstrap needs.
- New code must follow the existing IDP layering: entrypoint routes, use cases, identity integration, database schema, infra helpers, and future events layer only when concrete code needs it.
- Package-level scripts must own local app behavior, with root scripts continuing to delegate to Turbo.

### NFR-05 Testing

- Changed behavior must include automated tests.
- Tests must not require real Resend, real external services, or real production databases.
- Route tests should use `fastify.inject()` where possible and must not bind real network ports.
- Schema, host normalization, tenant resolution, event construction, and bootstrap behavior must be covered with unit or integration-style tests using controlled dependencies.
- Property-Based Testing extension is enabled as a blocking constraint. Applicable pure functions and transformations must identify and implement PBT coverage during design/code stages.
- Typecheck, tests, coverage, build, and Biome checks must remain passing for `apps/idp`.

## Property-Based Testing Requirements

- Host/domain normalization is expected to require PBT for invariants such as idempotent normalization, rejection of invalid generated hosts, and stable lookup keys for equivalent casing/trailing-dot variants where supported.
- Tenant/domain status transition helpers, if implemented as pure functions, must be evaluated for invariants and idempotency properties.
- Event payload sanitization helpers, if implemented as pure functions, must be evaluated for invariant properties such as no forbidden fields after sanitization.
- Bootstrap input parsing or normalization, if implemented as pure functions, must be evaluated for round-trip, invariant, or idempotency properties where applicable.
- PBT must complement, not replace, example-based tests for critical business and security scenarios.

## Out Of Scope For This Cycle

- Institutional invitation flow with email delivery and 24-hour expiration.
- Better Auth admin plugin.
- Logical user deactivation/ban flow beyond membership or tenant status modeling required by this cycle.
- Better Auth twoFactor plugin rollout or user-facing 2FA enablement.
- FastAPI implementation details beyond IDP integration contracts.
- JWT/JWKS, OAuth Provider, passkeys, GOV.BR, bearer-token flows, or localStorage token patterns.
- Persistent audit-log table, durable audit worker, real event bus, queue, outbox, or central observability stack.
- Frontend integration in `apps/web`.
- Business-domain profile data storage in the IDP.

## Acceptance Criteria

- Requirements are approved for the selected four-item IDP roadmap scope.
- A later workflow plan decomposes the work into safe implementation units before code changes.
- Security Baseline and PBT extension decisions are recorded in `aidlc-docs/aidlc-state.md`.
- Event publication abstraction requirements are traceable to auth, tenant, membership, and bootstrap operations.
- Organization plugin requirements preserve the IDP/FastAPI responsibility boundary.
- Tenant domain resolution requirements cover original-host input, unknown-host behavior, domain/tenant statuses, and safe failure behavior.
- Bootstrap script requirements cover tenants, domains, initial owner users, safe logs, idempotency or rerun behavior, and package-level script conventions.
- Documentation requirements identify all durable docs likely to need updates after implementation.

## Security Compliance

- **SECURITY-01**: Applicable later for PostgreSQL and deployment configuration. Requirements preserve TLS/encryption expectations; no storage resource is created in this stage.
- **SECURITY-02**: Applicable later to deployed network intermediaries. No network infrastructure is created in this stage.
- **SECURITY-03**: Compliant at requirements level; structured logging and no-sensitive-data event/log requirements are explicit.
- **SECURITY-04**: N/A for this IDP-only requirements stage because no HTML-serving endpoint is introduced.
- **SECURITY-05**: Compliant at requirements level; API/input validation is required for new endpoints and host resolution.
- **SECURITY-06**: Applicable later if IAM/policies are introduced. No IAM policy is created in this stage.
- **SECURITY-07**: Applicable later if network configuration is introduced. No network configuration is created in this stage.
- **SECURITY-08**: Compliant at requirements level; protected operations require authorization and deny-by-default behavior.
- **SECURITY-09**: Compliant at requirements level; generic errors and no hard deletion/default credential exposure are required.
- **SECURITY-10**: Compliant at requirements level; existing lockfile/audit workflow remains and future dependency additions must use pnpm.
- **SECURITY-11**: Compliant at requirements level; security-critical logic remains isolated and abuse/rate-limit gaps must be documented.
- **SECURITY-12**: Compliant at requirements level; Better Auth remains source of auth internals and token storage restrictions remain explicit.
- **SECURITY-13**: Compliant at requirements level; audit/event integrity is preserved as a design goal without adding unsafe deserialization.
- **SECURITY-14**: Applicable later to monitoring infrastructure. Requirements preserve event labels for future alerting.
- **SECURITY-15**: Compliant at requirements level; fail-closed and safe error handling are explicit for tenant resolution and event behavior.

## PBT Compliance

- **PBT-01**: Applicable during Functional Design; requirements identify likely property-bearing areas.
- **PBT-02**: Applicable during Code Generation if parsing/formatting or round-trip operations are introduced.
- **PBT-03**: Applicable during Code Generation for host normalization, event sanitization, and status invariants.
- **PBT-04**: Applicable during Code Generation for idempotent normalization and bootstrap behavior where implemented as pure logic.
- **PBT-05**: N/A at requirements stage; no oracle/reference implementation is defined yet.
- **PBT-06**: Applicable later if stateful tenant/membership workflows are modeled beyond direct Better Auth operations.
- **PBT-07**: Applicable during Code Generation; domain-specific generators will be required for hosts, tenant domains, statuses, and event payloads.
- **PBT-08**: Applicable during Build and Test; seed/shrinking reproducibility must be covered in later test instructions.
- **PBT-09**: Applicable during NFR/Workflow Planning; TypeScript should use a Vitest-compatible PBT framework such as fast-check if not already present.
- **PBT-10**: Applicable during Code Generation; PBT must complement example-based tests.
