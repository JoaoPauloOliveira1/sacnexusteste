# User Stories

## Story Structure

- **Grouping**: Four selected IDP domains.
- **Granularity**: Compact, one story per selected roadmap item.
- **Acceptance Criteria**: Given/When/Then only, with security and misuse scenarios embedded where relevant.
- **Future Dependency Notes**: Included only as notes after each story to preserve out-of-scope constraints.

## Epic 1: Internal Event Publication

### US-01: Publish Safe Identity Events From Existing Auth Flows

As a future business API consumer and security reviewer, I want the IDP to emit safe identity events through a stable internal abstraction so that future audit, monitoring, and integration work can consume consistent security-relevant signals without leaking sensitive data.

#### Acceptance Criteria

- Given an existing auth flow such as signup, sign-in, sign-out, email verification, password reset, password change, or session revocation, when the flow completes or fails in a relevant way, then the IDP emits an event through the internal event publication abstraction.
- Given an event is emitted, when its payload is built, then it includes safe operation labels, outcome, request correlation context where available, and stable non-sensitive identifiers only.
- Given an event payload is built, when sensitive values are present in the surrounding request or auth response, then passwords, tokens, cookies, raw email addresses, request bodies, response bodies, verification/reset URLs, rendered emails, CPF, CNPJ, and domain profile data are excluded.
- Given event publication uses the initial implementation, when no durable audit worker exists, then the publisher remains replaceable by a future outbox, queue, event bus, or audit worker without changing every auth use case.
- Given event publication fails, when the current operation is security-sensitive, then the IDP does not fail open or grant access because of the failure.
- Given tests exercise event construction, when generated event payloads are checked, then property-based tests cover applicable invariants such as forbidden fields never appearing in sanitized event payloads.

#### Future Dependency Notes

- Persistent audit storage, audit worker, outbox, queue, monitoring dashboards, and alerting remain future work.

## Epic 2: Organization And Membership Ownership

### US-02: Model Institutional Tenants And Memberships In The IDP

As an institutional owner and future business API consumer, I want the IDP to own institutional tenant membership through Better Auth organizations so that broad role and membership context is centralized while business APIs keep resource-level authorization.

#### Acceptance Criteria

- Given Better Auth organization support is configured, when the IDP starts, then organization and membership behavior uses supported Better Auth plugin APIs and does not reimplement Better Auth internals.
- Given institutional tenant setup is required, when a tenant/organization is created in this cycle, then public self-service organization creation is disabled or inaccessible.
- Given a citizen/public user has an IDP account, when the user authenticates, then the user is not automatically added to `organization.member` and does not receive institutional membership from email domain alone.
- Given an institutional user is attached to a tenant, when membership is represented, then the model can identify user, organization/tenant, role, and active/inactive status or a documented extension path for that status.
- Given ownership is assigned, when roles are created or configured, then the initial useful role model starts with `owner` and remains ready for future roles without prematurely implementing dynamic roles or teams.
- Given membership or organization mutations occur, when the operation succeeds or fails in a relevant way, then the IDP emits safe identity/tenant events through the event abstraction.
- Given a destructive organization or membership operation is requested, when deletion would remove tenant history or auditability, then the operation is disabled, inaccessible, or replaced by a status-based behavior where supported.

#### Future Dependency Notes

- Institutional invitations, admin plugin, 2FA rollout, FastAPI business authorization, and frontend integration remain out of scope for this cycle.

## Epic 3: Tenant Domain And Alias Resolution

### US-03: Resolve Tenant Context From The Original Request Host

As an institutional member and future business API consumer, I want the IDP to resolve tenant context from the original request host so that signup, authentication, membership, and emitted events are scoped to the correct tenant domain.

#### Acceptance Criteria

- Given a request arrives with a supported tenant domain or alias, when the IDP resolves tenant context, then it uses a tenant domain/alias registry instead of hardcoded host mappings.
- Given a tenant has multiple registered domains or aliases, when any active alias is used, then the IDP resolves the same tenant context consistently.
- Given a host is unknown, malformed, ambiguous, pending, or disabled, when a tenant-bound operation depends on tenant context, then the IDP fails closed with a safe generic response and no technical or business-sensitive detail.
- Given forwarded host headers are present, when the IDP chooses the source host, then it follows documented trust boundaries for `Host` and/or trusted forwarded host headers.
- Given host normalization is implemented, when hosts differ only by supported case or trailing-dot variants, then normalization produces stable lookup keys where valid and rejects invalid inputs safely.
- Given tenant or domain status changes are introduced, when status is active, pending, or disabled, then access behavior is deterministic and testable.
- Given property-based tests run for host normalization, when generated valid and invalid host inputs are checked, then idempotence, rejection, and stable lookup-key invariants hold.

#### Future Dependency Notes

- FastAPI must later consume tenant context and still enforce business tenant scoping and resource-level authorization.
- Frontend/proxy routing must later forward original host context consistently.

## Epic 4: Bootstrap Scripts

### US-04: Bootstrap Tenants, Domains, And Initial Owner Users Safely

As a platform operator, I want controlled bootstrap scripts inside `apps/idp` so that tenants, domains, aliases, and initial owner users can be created repeatably without public self-service organization creation.

#### Acceptance Criteria

- Given an approved operational environment is configured, when the operator runs the bootstrap command, then the command can create or connect a tenant/organization, register domains/aliases, and create or assign an initial owner user.
- Given the bootstrap command is run more than once with the same intended state, when rerun behavior is supported, then it is idempotent or clearly reports existing resources without unsafe duplication.
- Given the bootstrap command logs progress, when output is produced, then it does not print secrets, database connection strings, raw credentials, tokens, session IDs, raw emails, CPF, CNPJ, request bodies, or sensitive PII.
- Given bootstrap input is invalid, when required tenant, domain, alias, or owner data cannot be validated, then the command fails safely without partially granting owner access.
- Given bootstrap changes tenant, domain, or owner state, when the operation succeeds or fails in a relevant way, then it emits or simulates safe identity/tenant events through the same event abstraction.
- Given package commands are added, when developers or CI inspect scripts, then local behavior remains app-owned under `apps/idp` and root scripts continue delegating through Turbo.
- Given tests cover bootstrap parsing or normalization helpers, when generated inputs are used, then property-based tests cover applicable idempotency, normalization, or validation invariants.

#### Future Dependency Notes

- Invitation flows, admin UI/API, production support runbooks, and persistent audit worker behavior remain future work.

## INVEST Summary

- **Independent**: Each story maps to one selected roadmap domain and can be planned as a separate unit or sequence step.
- **Negotiable**: Stories define outcomes and constraints without prescribing every implementation detail.
- **Valuable**: Each story supports IDP completion, tenant safety, audit readiness, or operator control.
- **Estimable**: Each story has bounded scope and explicit acceptance criteria.
- **Small**: Stories are compact by user preference, one per selected roadmap item.
- **Testable**: Given/When/Then criteria include functional, security, and PBT-relevant checks.

## Security And PBT Coverage Summary

- Security misuse scenarios are embedded in acceptance criteria for event payload safety, no public organization self-service, citizen/member separation, unknown-host fail-closed behavior, safe forwarded-host trust, no hard deletion, and safe bootstrap logging.
- PBT-relevant areas are explicitly called out for event sanitization, host normalization, tenant/domain status behavior, and bootstrap parsing/normalization.
- PBT must complement example-based tests and must not replace concrete regression tests for critical auth, tenant, and bootstrap scenarios.
