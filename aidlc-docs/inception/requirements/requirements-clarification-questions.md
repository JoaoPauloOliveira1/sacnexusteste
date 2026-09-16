# Requirements Clarification Questions

I detected one ambiguity in the requirements responses that must be resolved before generating `requirements.md`.

## Ambiguity 1: IDP Roadmap Scope

The responses indicate that this workflow should continue implementing the IDP roadmap from `idp-architecture-discussion.md`, and that the next step could be the next bullet point or more than one bullet point. The next unchecked roadmap items are event publication, organization/membership modeling, tenant domain resolution, bootstrap scripts, institutional invitations, admin operations, deactivation/ban behavior, and 2FA setup.

## Question 1
Which IDP roadmap scope should this AI-DLC cycle cover?

A) Only the next roadmap item: add internal event publication abstraction and emit events from initial auth flows
B) Event publication plus Better Auth organization plugin and initial tenant/membership ownership model
C) Event publication, organization plugin, and tenant domain/alias resolution
D) A larger package covering event publication through institutional invitations
X) Other (please describe after [Answer]: tag below)

[Answer]: X
Todos esses abaixo:
- [ ] Add the internal event publication abstraction and emit events from the initial auth flows, even if the implementation is still no-op/simple logging.
- [ ] Add the Better Auth `organization` plugin and model tenant/membership ownership in the IDP.
- [ ] Add tenant domain/alias resolution from the original request host, including unknown-host handling and tenant/domain status.
- [ ] Add bootstrap scripts inside `apps/idp` for creating tenants, domains, and initial owner users.
