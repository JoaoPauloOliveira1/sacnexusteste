# Personas

## Platform Operator

- **Role**: Trusted operational user responsible for initializing tenants and maintaining IDP setup.
- **Goals**: Create tenants, register domains, assign initial owner users, and run safe repeatable bootstrap commands.
- **Motivations**: Keep rollout controlled, auditable, and safe for institutional environments.
- **Pain Points**: Manual setup mistakes, unclear rerun behavior, leaked secrets in logs, and ambiguous tenant ownership.
- **Relevant Stories**: US-04.

## Institutional Owner

- **Role**: Initial responsible user for an institutional tenant, such as CBMPE ownership/admin leadership.
- **Goals**: Receive ownership of the tenant, manage initial institutional access later, and rely on correct tenant context.
- **Motivations**: Ensure institutional users access the correct tenant and future roles/permissions evolve safely.
- **Pain Points**: Accidental public organization creation, wrong tenant assignment, hard-deleted memberships, and unclear active/inactive states.
- **Relevant Stories**: US-02, US-03, US-04.

## Institutional Member

- **Role**: Internal user who will eventually belong to an institutional tenant.
- **Goals**: Authenticate through the correct tenant context and receive only authorized institutional access.
- **Motivations**: Work inside SAC Nexus with clear membership and role boundaries.
- **Pain Points**: Being treated like a citizen user, receiving access from email domain alone, or being routed to the wrong tenant.
- **Relevant Stories**: US-02, US-03.

## Citizen/Public User

- **Role**: Public user who may create an account and participate in domain resources, but is not an institutional member.
- **Goals**: Keep personal identity separate from institutional membership and avoid receiving tenant permissions accidentally.
- **Motivations**: Use SAC Nexus public services without internal/institutional privileges.
- **Pain Points**: Confusing tenant membership with public profile participation and leaking business/person data into the IDP.
- **Relevant Stories**: US-02, US-03.

## Future Business API Consumer

- **Role**: Future FastAPI or service integration consuming IDP identity, tenant, membership, and event contracts.
- **Goals**: Validate session/tenant context and apply business authorization using clear IDP-owned contracts.
- **Motivations**: Keep resource-level authorization in business APIs while trusting IDP for broad membership context.
- **Pain Points**: Ambiguous tenant context, IDP leaking business rules, unstable event shapes, and missing membership status semantics.
- **Relevant Stories**: US-01, US-02, US-03.

## Security Reviewer

- **Role**: Reviewer focused on authentication, tenant isolation, logging, data minimization, and auditability.
- **Goals**: Ensure the IDP fails closed, does not leak sensitive data, keeps Better Auth internals intact, and preserves audit/event seams.
- **Motivations**: Protect public-sector identity and access workflows from misuse and misconfiguration.
- **Pain Points**: PII in logs/events, trusted-forwarded-host ambiguity, hard deletion, public self-service organization creation, weak tests, and unvalidated inputs.
- **Relevant Stories**: US-01, US-02, US-03, US-04.

## Persona To Story Map

| Persona | US-01 Events | US-02 Organization/Membership | US-03 Tenant Resolution | US-04 Bootstrap |
|---|---:|---:|---:|---:|
| Platform Operator |  |  |  | x |
| Institutional Owner |  | x | x | x |
| Institutional Member |  | x | x |  |
| Citizen/Public User |  | x | x |  |
| Future Business API Consumer | x | x | x |  |
| Security Reviewer | x | x | x | x |
