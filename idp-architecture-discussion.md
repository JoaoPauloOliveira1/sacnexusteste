# IDP Architecture Discussion

Temporary notes for deciding whether SAC Nexus should use a dedicated Node.js Identity Provider with Better Auth while keeping the main system APIs in Python and Go.

## Context

- Current project only has the frontend available.
- Proposed direction: add a dedicated Node.js IDP using Better Auth.
- Main business APIs would be implemented in Python and Go.
- Node.js would be limited to the identity/authentication module.

## Decision Criteria To Explore

- Ownership boundaries between IDP, frontend, and backend APIs.
- Authentication and authorization model.
- Operational complexity of adding a Node.js service.
- Security implications and token/session strategy.
- Developer velocity and long-term maintainability.
- Integration with future Python and Go APIs.

## Implementation Roadmap - Baby Steps

This is a macro implementation suggestion for building the IDP gradually, validating each layer before adding more complexity.

- [x] Create the `apps/idp` application with Fastify, TypeScript strict, Biome, Vitest, and monorepo scripts.
- [x] Add basic health/readiness endpoints, structured JSON logs, request/correlation ID, and minimal OpenAPI/Swagger setup.
- [x] Add CI/pipeline coverage for the new IDP app: install, lint/check, typecheck, tests, and build.
- [x] Configure Drizzle and PostgreSQL access for the IDP, keeping table ownership boundaries explicit even while sharing the same database. Planned together with the minimal Better Auth slice in [`docs/initiatives/prds/10-apps-idp-persistence-and-auth-foundation.md`](docs/initiatives/prds/10-apps-idp-persistence-and-auth-foundation.md).
- [x] Integrate Better Auth with the minimal email/password flow, session cookies, and no cookie cache. Planned together with the Drizzle/PostgreSQL slice in [`docs/initiatives/prds/10-apps-idp-persistence-and-auth-foundation.md`](docs/initiatives/prds/10-apps-idp-persistence-and-auth-foundation.md).
- [x] Implement email verification for signup before granting effective access. Planned together with the password security slice in [`docs/initiatives/prds/11-apps-idp-email-verification-and-password-security.md`](docs/initiatives/prds/11-apps-idp-email-verification-and-password-security.md).
- [x] Add password policy, password change, password reset, and session revocation behavior after password changes/resets. Planned together with the email verification slice in [`docs/initiatives/prds/11-apps-idp-email-verification-and-password-security.md`](docs/initiatives/prds/11-apps-idp-email-verification-and-password-security.md).
- [x] Add the internal event publication abstraction and emit events from the initial auth flows, even if the implementation is still no-op/simple logging.
- [x] Add the Better Auth `organization` plugin and model tenant/membership ownership in the IDP.
- [x] Add tenant domain/alias resolution from the original request host, including unknown-host handling and tenant/domain status.
- [x] Add bootstrap scripts inside `apps/idp` for creating tenants, domains, and initial owner users.
- [ ] Add institutional invitation flow with 24h expiration, verified-email acceptance, and one pending invitation per email/tenant.
- [ ] Add the Better Auth `admin` plugin with safe administrative operations and impersonation disabled/inaccessible.
- [ ] Add logical user deactivation/ban flow and inactive membership behavior instead of hard deletes.
- [ ] Add the Better Auth `twoFactor` plugin configuration, keeping the user-facing 2FA rollout disabled until the email/password flow is stable.
- [ ] Enable and test 2FA for privileged/internal users after the base auth, email verification, organization, and admin flows are stable.
- [ ] Expose OpenAPI for custom IDP endpoints and evaluate Orval generation for those endpoints.
- [ ] Define the FastAPI integration contract for session validation and tenant/membership lookup, without implementing FastAPI details in this IDP task.
- [ ] Revisit stronger custom rate limits, HIBP/password breach checks, JWT/JWKS, OAuth Provider, passkeys, audit persistence, and full observability in later iterations.

## RBAC And Authorization Model

SAC Nexus should use a split authorization model: the IDP owns broad RBAC concepts, while FastAPI owns contextual business authorization.

IDP responsibilities:

- Own institutional tenant membership through Better Auth `organization`.
- Own broad roles and permissions attached to organization membership.
- Start with the smallest role model, initially `owner`, while keeping the permission model ready for future roles.
- Future role examples: `admin`, `manager`, `analyst`, `operator`, `reader`.
- Expose membership/role/permission context to business APIs through explicit IDP contracts.
- Keep citizen users outside `organization.member`; membership represents internal/institutional users only.

FastAPI responsibilities:

- Enforce tenant scoping on all business data queries.
- Enforce resource-level authorization and ownership checks.
- Decide whether a user can perform an action on a specific resource in its current business state.
- Own domain-specific permissions that depend on process/document status, ownership, participants, legal representation, or workflow state.
- Store and enforce citizen/PF/PJ/technical-responsible profile relationships and process participation.

Examples:

- IDP can say: user `Ana` is `owner` or future `analyst` in tenant `CBMPE`.
- IDP can say: user has broad permission `documents:delete_own`.
- FastAPI decides whether document `X` belongs to tenant `CBMPE`, whether `Ana` owns it, and whether its current status allows deletion.

Rules:

- Do not put resource-specific business rules in the IDP.
- Do not make FastAPI the source of truth for institutional membership.
- Avoid hardcoding role string checks everywhere; prefer permission checks that can evolve as roles are added.
- All authorization decisions must include the resolved tenant context.
- Citizen access is based on process/profile participation, not tenant membership.

## Discussion Log

### 2026-05-10 - Theme 1: IDP Responsibility Boundary

Question: What do we expect the IDP to own: only login/session/user identity, or also authorization concepts like roles, permissions, organizations, and access policies?

Notes:

- An IDP primarily answers "who is this user?".
- Authentication and authorization should be evaluated separately.
- A conservative split would keep login/session/user identity in the IDP and domain-specific permissions in the business APIs.

### 2026-05-10 - Theme 2: Generic Permission Management In The IDP

Question explored: Could the IDP provide generic permission infrastructure reusable by multiple applications, while each application keeps business-specific meaning in its own domain?

Initial framing:

- This can make sense if permissions are modeled as generic grants, roles, groups, scopes, or claims.
- The risk is that the IDP gradually becomes a business authorization service instead of an identity service.
- Market IDPs commonly support coarse-grained authorization primitives, but fine-grained domain authorization is often handled by the application or a dedicated authorization engine.

Updated premise:

- The IDP is expected to be dedicated only to SAC Nexus, not a shared platform for multiple systems.
- The system should keep clear responsibility boundaries between components.
- Expected permissions are mostly basic roles and simple ownership/admin checks.
- Examples: an analyst can perform a set of system actions; a document can only be deleted by its owner or an admin.

Current assessment:

- It is reasonable for the Better Auth Node service to own identity and coarse-grained roles/permissions.
- Resource-level and ownership-based decisions should stay in the business API because they depend on business data.
- The IDP should not need to know documents, workflows, tickets, protocol states, or domain entities.

Tentative decision:

- Keep basic roles and generic permissions inside the Better Auth Node IDP.
- Keep resource ownership and business-specific authorization checks inside the main business API.

### 2026-05-10 - Theme 3: API Topology

Question explored: Will SAC Nexus have one main API or multiple independent services?

Premise:

- Initially there will be one main FastAPI project with the core APIs.
- There may also be specific workers in Python and Go.

Initial implication:

- A single main API reduces early distributed-system complexity.
- Workers should probably consume identity/authorization context indirectly through jobs/events created by the main API, not by becoming auth decision-makers unless necessary.

Tentative direction:

- Use FastAPI as the main application gateway / entry point for business APIs.
- Prefer secure HttpOnly cookie-based session/token handling.
- Better Auth documentation confirms it uses traditional cookie-based sessions, with a `session_token` cookie and optional short-lived signed/encrypted cookie cache.
- Better Auth production cookies are HttpOnly and secure by default, and it supports explicit secure cookies and cross-subdomain cookie configuration.
- For browser compatibility, especially Safari ITP, avoid third-party cookie setups. Prefer same-site routing/reverse proxy or shared parent domain.

Open design point:

- Decide whether FastAPI validates sessions by calling the IDP, verifying a signed/encrypted token, or delegating auth routes through a reverse proxy while keeping business routes in FastAPI.

Performance preference:

- Prefer a more performant implementation from the start.
- Avoid requiring FastAPI to call the IDP on every authenticated request if a safe local validation strategy is available.
- This improves latency and reduces runtime coupling between business API availability and IDP availability.

Security reassessment:

- SAC Nexus is expected to serve at state level for the Fire Department of Pernambuco.
- Because the system may handle sensitive public-sector data, security should outweigh small performance optimizations.
- A short-lived token strategy may still be useful, but revocation behavior, fresh-session checks, auditability, and least privilege should be prioritized.

Audit requirement:

- SAC Nexus should be born with auditability for logins, actions, creations, and edits.
- Audit should be treated as a cross-cutting module that includes both the IDP and business APIs.
- Detailed audit architecture is intentionally deferred to a separate discussion, but IDP design must preserve enough context to support it.
- The IDP must emit audit/domain events from the beginning, even if the full audit module is designed separately.

Tooling/product direction:

- Better Auth remains the preferred IDP foundation.
- The team expects AI-assisted development to accelerate implementation.
- Despite acceleration, identity, session handling, and personal data must be treated as security-critical areas with careful design and review.

Database direction:

- Start with the same PostgreSQL infrastructure for IDP and business API data.
- Keep logical ownership separated through schemas, databases, migrations, or clear table boundaries.
- Avoid business services writing directly into IDP-owned tables except through supported IDP APIs/contracts.
- This can be split physically later if operational or security needs require it.
- Initial implementation can keep everything together in the same database/schema for simplicity.
- Even with a shared database/schema, table ownership must remain explicit: IDP-owned tables are changed only by the IDP, and business-domain tables are changed only by the business API.
- Use Drizzle as the preferred database layer/adapter for the Node.js IDP with Better Auth.

Node framework direction:

- Use Fastify as the preferred Node.js framework for the IDP.
- Reasons: strong Node compatibility, mature production ecosystem, easy Swagger/OpenAPI support through Fastify plugins, native structured logging with Pino, good request lifecycle hooks, and a practical path for OpenTelemetry/tracing/observability.
- Observability must be treated as a first-class concern for the IDP: structured logs, request/correlation IDs, health/readiness endpoints, tracing, metrics, and careful redaction of credentials, tokens, cookies, OTPs, backup codes, and other sensitive values.
- The IDP should start with structured JSON logs and request/correlation IDs even before the full tracing/observability stack is defined.
- Detailed observability architecture will be handled in a separate task/discussion.

Better Auth integration style:

- Use Better Auth as the authentication engine/SDK.
- Prefer exposing controlled Fastify routes for the IDP public/internal API, calling Better Auth official APIs/SDK underneath.
- This gives control over Swagger/OpenAPI, route naming, logs, events, tenant/host validation, rate limits, error shape, and internal contracts.
- Do not reimplement Better Auth cryptographic, password, session, cookie, token, or security internals.
- Native Better Auth endpoints can still be used where appropriate, but the default architectural preference is to encapsulate Better Auth behind IDP-owned route handlers.
- Endpoint paths and behavior should stay close to Better Auth conventions where possible, reusing the library's expertise and reducing friction with its client/plugins/documentation.

Implementation structure stance:

- Do not over-structure the IDP folder layout in the first implementation.
- Start simple and evolve folders/modules only as concrete code and responsibilities appear.
- Keep the code organized enough to preserve ownership boundaries, but avoid premature architecture scaffolding.
- Create the Node.js IDP service under `apps/idp` in the monorepo.
- IDP Docker/deployment packaging will be decided later, not in the first architecture pass.
- `apps/idp` should follow monorepo script conventions with package-level scripts such as `dev`, `build`, `typecheck`, `lint`, and `check`, even if some start simple.
- Use TypeScript with strict type-checking for the IDP from the beginning.
- Use Biome for IDP formatting/linting, aligned with the current monorepo tooling.
- The IDP should have tests from the beginning, respecting the test pyramid.
- Prioritize unit tests for pure policies/helpers, integration tests for Better Auth/Fastify/DB flows, and keep end-to-end tests limited to critical auth journeys when the stack is ready.
- Use Vitest as the default test runner for the IDP/backend as well. Fastify routes can be tested with `fastify.inject()` without binding a real network port.
- Database strategy for integration tests will be decided later.

Frontend client strategy:

- Orval is a good candidate for generating clients from OpenAPI contracts, especially for FastAPI and custom IDP endpoints.
- For Better Auth-native flows, prefer the official Better Auth client when it reduces risk and preserves plugin/session/cookie behavior.
- A hybrid approach is likely best: Better Auth client for Better Auth-native auth/session/organization flows; Orval-generated clients for custom SAC Nexus IDP endpoints and FastAPI business APIs.
- Custom IDP endpoints should expose Swagger/OpenAPI from the beginning so Orval can generate typed clients when useful.

### 2026-05-10 - Theme 5: Better Auth Plugin Capabilities

Research source:

- Better Auth `llms.txt` index and plugin documentation.
- Reviewed Organization, 2FA, Admin, JWT, OAuth Provider, OIDC Provider, Bearer, Passkey, Have I Been Pwned, Rate Limit, and Audit Logs docs.

Organization / tenant findings:

- The tenant plugin is the `organization` plugin.
- It supports organizations, members, invitations, active organization, teams, roles, permissions, custom access control, dynamic access control, and hooks.
- Default organization roles are `owner`, `admin`, and `member`.
- Custom permissions can be defined via `createAccessControl`.
- Dynamic roles per organization are possible but add complexity.
- The plugin stores `activeOrganizationId` in the session when set, but the active organization should not be blindly trusted for authorization-critical business actions.
- For SAC Nexus, `organizationId` must still be required in business data and validated server-side in FastAPI.
- Free organization creation and deletion should likely be disabled or limited for institutional use.
- Invitation acceptance should require verified email.

2FA findings:

- The `twoFactor` plugin supports TOTP, OTP, backup codes, and trusted devices.
- TOTP is preferable as the primary second factor because it is offline and avoids SMS/email delivery weaknesses.
- Backup code storage defaults must be reviewed because docs mention configurable plain/encrypted storage.
- Trusted devices default to a 30-day trust window when used; for SAC Nexus this should be considered carefully.
- Admins and privileged users should require 2FA once the initial email/password and email verification flow is working.

API token / service integration findings:

- The `jwt` plugin provides `/token` and `/jwks`, with locally verifiable JWTs and key rotation support.
- Better Auth docs explicitly say the JWT plugin is not a session replacement; it is for services that need JWT tokens.
- The OAuth 2.1 Provider plugin is more complete and security-oriented than the older OIDC Provider plugin, including PKCE, introspection, revocation, JWKS verification, client credentials, resource/audience support, and OIDC-compatible userinfo/id tokens.
- The older OIDC Provider plugin is documented as active-development and soon deprecated in favor of OAuth Provider.
- For FastAPI, a future option is to verify JWT access tokens locally against JWKS, while keeping Better Auth cookie sessions as the primary browser auth mechanism.

Security/support findings:

- The Admin plugin supports user creation, listing, role management, banning, session revocation, impersonation, and custom admin permissions.
- Impersonation is powerful and should be disabled or heavily audited unless there is a concrete support requirement.
- The Bearer plugin documentation suggests localStorage examples, but SAC Nexus should avoid storing auth tokens in localStorage.
- Passkey support exists and may be valuable later for phishing-resistant authentication.
- Have I Been Pwned plugin can block known compromised passwords.
- Rate limiting is built in, enabled in production by default, and has stricter defaults for sensitive endpoints such as email sign-in and 2FA verification.
- Better Auth Infrastructure has an audit logs feature through `dash()`, but SAC Nexus may still need its own audit/event module.

Current assessment:

- Better Auth appears capable enough to support SAC Nexus IDP needs.
- Recommended initial plugins: organization, twoFactor, and admin.
- Have I Been Pwned password checks should be revisited later; do not include it in the first implementation until cost/dependency implications are confirmed.
- Strong custom rate-limit policy is important, but can be refined in a second moment after the first IDP flow is working. Keep Better Auth production defaults enabled.
- Recommended later/conditional plugins: jwt, OAuth Provider, passkey, Better Auth Infra audit/dash, sentinel/security if adopted.
- Avoid dynamic organization roles, teams, bearer/localStorage flows, and impersonation until there is a concrete requirement.
- Passkey is a future possibility for phishing-resistant authentication, especially for internal/admin users, but it is outside the MVP.

Customization stance:

- Better Auth should be customized through official extension points: plugins, hooks, database hooks, additional fields, custom session response, access control definitions, rate-limit rules, JWT payload customization, and storage adapters where supported.
- Avoid modifying Better Auth internals, depending on private cookie formats, writing directly into internal tables outside supported APIs/hooks, or spreading security logic across handlers.
- SAC Nexus custom behavior should be centralized in IDP-owned plugins/hooks following Better Auth best practices.

Tenant decision:

- The IDP will own tenant and membership using Better Auth's `organization` plugin.
- FastAPI will consume and validate the tenant context, but tenant membership source of truth will be in the IDP.
- FastAPI remains responsible for business authorization, resource ownership, and tenant scoping in all domain queries.
- Removing an institutional user from a tenant should mark membership as inactive instead of physically deleting the relationship, preserving history and auditability.
- Membership status can start simple, for example `active` and `inactive`, and evolve only when real workflow needs appear.

Role strategy:

- Start with the smallest useful role model, initially only `owner`.
- Keep the permission/access-control structure ready for future roles such as admin, manager, analyst, operator, or reader.
- Avoid modeling roles before there is a concrete business need, but do not block future expansion.

Bootstrap strategy:

- Initial tenant/organization creation should be done through project-level scripts, not by public self-service flows.
- Initial operational scripts should live inside `apps/idp`, because they operate IDP-owned concepts such as tenants, domains, owners, invitations, and memberships.
- If scripts grow into a stable operational surface, they can later become a dedicated CLI application.
- Public/free organization creation should remain disabled in the IDP for the initial SAC Nexus deployment.

User onboarding clarification:

- Institutional tenants should be created through controlled administrative operations/scripts.
- Citizens should be able to create their own user accounts through a public self-service flow.
- Initially, any citizen can self-register with email/password through a tenant domain.
- The system is initially for CBMPE, but should leave room for other Brazilian states in the future.
- Tenant may be associated with a domain or jurisdiction context.
- Future GOV.BR integration is expected, but will be discussed separately.
- Citizen self-signup must not imply permission to create or administer a tenant.
- Institutional users can be onboarded through two paths: invitation from an authorized internal user, or conversion/promotion of an existing registered user into an organization member.
- Both paths must require explicit authorization and emit identity events.
- Institutional-looking email domains must not automatically grant tenant membership, roles, or permissions.
- Institutional invitations should initially expire after 24 hours.
- If a pending invitation already exists for the same email and tenant, do not automatically create a new one. Inform that there is already a pending invitation. A new invitation requires the previous one to be cancelled/deleted or expired.
- Accepting an institutional invitation should guide the user through account creation or login plus email verification as one cohesive flow before activating membership.
- Invitations must be bound to the invited email address and can only be accepted by an account with that same verified email.

Citizen vs institutional access model:

- `organization.member` should represent internal/institutional users, not every citizen using the public portal.
- Citizens should be regular IDP users that participate in domain resources such as AVCB processes, requests, companies, representations, or technical responsibility records.
- A citizen's visible processes should be filtered by both `userId` and the current tenant resolved from the request host.
- Internal users should access a tenant only if they are members of that organization.

Tenant resolution:

- Tenant should be resolved flexibly from the request host.
- Support both dedicated domains such as `sacnexuspe.test` and subdomains such as `pe.sacnexus.test`.
- Use a tenant domain/alias registry rather than hardcoding tenant-to-host mapping.
- Support multiple domains/aliases per tenant from the initial model.
- All business queries must be scoped by the resolved tenant.
- The frontend must not be the authority for tenant selection in host-based public/institutional access.
- Unknown/unregistered hosts should show a generic user-facing message without technical details or business-sensitive information.
- Tenants and tenant domains should support status fields such as `active`, `pending`, and `disabled`, allowing access control without deleting configuration.
- Tenant/organization deletion should be disabled in the first version. Use status changes such as `disabled` instead of deleting tenants.
- The IDP should also receive and validate the original request host during signup/auth flows so account creation, invitations, active organization, and emitted events can include the correct tenant/domain context.

Current frontend stack fit:

- The current web app is a Vite React SPA served by Nginx in production.
- Runtime config already defaults to relative URLs: `apiUrl = /api` and `authUrl = /api/auth`.
- This supports the preferred browser model where tenant domains call same-origin `/api` and `/api/auth` instead of direct cross-domain `api.sacnexus.test` or `auth.sacnexus.test`.
- Development already proxies `/api` through Vite.
- Production Nginx currently serves only static files and `/config.json`; reverse proxy rules for `/api` and `/api/auth` would need to be added either at edge/load-balancer level or inside the Nginx config.
- The stack can support host-based tenant resolution, provided the proxy forwards the original host through headers such as `Host` or `X-Forwarded-Host`.

Infrastructure contract:

- Do not couple the architecture to a specific infrastructure tool yet.
- Browser requests should use same-origin relative paths:
  - `/api/auth/*` for the IDP / Better Auth service.
  - `/api/*` for the FastAPI business API.
  - `/*` for the frontend SPA.
- The chosen infrastructure must route these paths to the correct backend service, whether using Nginx, Traefik, Kubernetes Ingress, Cloudflare, AWS, Vercel rewrites, Caddy, HAProxy, or another equivalent layer.
- Tenant domains must serve the frontend and route `/api` and `/api/auth` without requiring the browser to call `api.sacnexus.test` or `auth.sacnexus.test` directly.
- The original request host must be forwarded to backend services, for example via `Host` and/or `X-Forwarded-Host`, so FastAPI and/or the IDP can resolve the tenant.
- Local development can simulate this with Vite proxy rules until the real infrastructure exists.

### 2026-05-10 - Theme 6: Initial Authentication Methods

Decision:

- MVP authentication starts with traditional email and password.
- GOV.BR integration remains expected for the future, but should be discussed separately.
- Email/password must be implemented with public-sector security expectations: verified email, strong password policy, compromised-password checks, rate limiting, reset-password flow, and audit events.
- Users must verify their email before receiving effective access to the system.
- 2FA is planned but will not be part of the very first implementation. Implement email/password and email verification first, test that flow, then add 2FA.
- The `twoFactor` plugin can still be included in the initial IDP plugin set, while the user-facing 2FA flow is enabled after the email/password flow is validated.
- Initial session duration target is 1 month, but it must be configurable by environment/policy.
- Start without Better Auth cookie cache to prioritize revocation correctness and security. Revisit short-lived cookie cache only after measuring performance.
- For the first integration model, business APIs should validate authentication/session context by calling the IDP rather than locally validating JWTs.
- This discussion is scoped to the Node.js IDP architecture/code. FastAPI details should be treated only as integration contracts here, not as part of this IDP design effort.
- The Better Auth `jwt` plugin should remain a future option, not part of the first implementation, because the initial integration favors IDP session validation over local JWT verification.

Event implementation strategy:

- The IDP must be designed with event emission points from the beginning.
- First implementation should use a small local abstraction/function representing event publication.
- Do not introduce a real queue, event bus, or audit persistence in the first IDP step.
- Build incrementally: emit events through a stable internal interface now, replace the implementation later.

Admin plugin decision:

- Include Better Auth's `admin` plugin in the initial IDP implementation.
- Use it for controlled user administration such as listing users, creating users when needed, banning/unbanning, role changes, and session revocation.
- Treat dangerous capabilities such as impersonation as disabled or inaccessible unless a concrete support requirement is approved later.
- Admin actions should call the event publication abstraction from the beginning.
- User deletion should be logical/soft delete or deactivation only. Avoid hard deletion so identity history, memberships, sessions, and audit trails remain coherent.
- Impersonation is prohibited/disabled in the first version.

Personal data boundary:

- Keep the IDP user profile minimal: identity/account fields such as name, email, email verification state, password/auth accounts, sessions, and 2FA state.
- Keep business/person data in FastAPI domain modules: CPF, CNPJ, CREA/CAU, phone, PF/PJ profiles, technical-responsible profile, legal representation, process participants, and related domain records.
- This reduces the amount of sensitive business data handled directly by the IDP.
- Email change is not supported in the first version.
- Users can change their own password in the first version. Password changes must require appropriate verification/fresh session behavior and emit identity events.
- Password change should revoke all other user sessions automatically.
- Password reset should revoke all existing user sessions automatically.
- Initial password policy should use classic complexity requirements: minimum length plus uppercase, lowercase, number, and symbol requirements.

Current signup UI mapping:

- Current frontend has signup flows for individual, company, and technical responsible users.
- These flows collect account credentials and email verification data together with domain profile data.
- IDP-owned fields from these forms: email, password, password confirmation validation, email verification OTP/state, first name, last name or display name when applicable, terms/privacy acceptance evidence if treated as account-level consent.
- FastAPI/profile-owned fields from these forms: CPF, birth date, CEP, street, number, neighborhood, city, state, CNPJ, legal name, trade name, representative CPF, phone, identification document, wants process communication, PF/PJ/technical-responsible profiles, company representation, and addresses.
- Tenant context should come from the resolved host/domain, not from the signup form itself.
- The UI may remain a single wizard, but backend writes should be split by ownership: create/verify IDP account first, then create domain profile records in FastAPI for the resolved tenant.
- The current individual signup flow appears not to include email in its schema. For the MVP email/password flow, individual signup should include email as an IDP-owned field unless replaced by a future social/GOV.BR identity flow.
- LGPD-related acceptance should not be stored as a simple boolean only. Store who accepted, which version, when, and contextual metadata such as IP/user agent where appropriate.
- General account/platform Terms of Use and Privacy Policy acceptance should be owned by the IDP.
- Process-specific consents, declarations, communication preferences, and service-specific terms should be owned by FastAPI/domain modules.
- Open question for product/design: how to derive IDP `name`/`displayName` for company signup, for example representative name versus company name. Do not lock this decision yet.
- Email should identify a global IDP account. The same email/user can participate in different tenants, but should not create separate duplicated IDP identities per tenant.
- A global IDP account can sign in through different tenant domains. Domain/business profiles and process visibility remain tenant-scoped, so the user may need to complete tenant-specific profile onboarding before acting in a new tenant.
- CPF and CNPJ should be treated as global domain identities in FastAPI, not IDP fields.
- Visibility, onboarding state, process access, and user actions remain tenant-scoped even when CPF/CNPJ are globally unique.

### 2026-05-10 - Theme 4: Tenant And User Identity Ownership

Question introduced: How should tenancy work, and is it correct to think that the final user owns identity data like email/name while the application uses that identity inside SAC Nexus?

Notes:

- Treat the final user as owner of personal identity data such as email, name, password, and login methods.
- Treat the application user/member as a relationship between an identity user and a tenant.
- Prefer modeling membership explicitly even if most users initially belong to only one tenant.

Suggested model:

- `user` lives in the IDP and represents the person.
- `tenant` represents an organization/account inside SAC Nexus.
- `membership` links `userId`, `tenantId`, role, status, and application-specific profile information.

Multi-tenant premise:

- It is unlikely but possible that a user may need to belong to more than one tenant.
- The architecture should be prepared for this without making the first implementation unnecessarily complex.

Tentative decision:

- If a user belongs to multiple tenants, default to the last active tenant after login.
- Allow tenant switching only when the user has more than one membership.
- Persisting the last active tenant should be explicit and safe, because it affects authorization context.

### 2026-05-13 - Theme 7: IDP CI/CD And Pipeline Standardization

Planning source:

- Third IDP baby step: add CI/pipeline coverage for the new IDP app.
- The scope was expanded to complete CI/CD for the IDP so the service can be packaged, deployed, smoke checked, and rolled back before auth/database behavior is introduced.

Decisions:

- Use GitHub Actions, pnpm, and Turborepo for IDP CI/CD.
- Use `turbo run <task> --filter=<app>` in CI instead of direct `pnpm --filter <app> <task>` commands.
- Use generic composite actions for shared setup and workspace change detection instead of web-specific actions.
- Keep the initial pipeline taxonomy compact: `quality`, `security`, `package`, `deploy_<env>`, and `rollback_<env>`.
- Name checks/jobs with `snake_case` in the `app_stage` format, such as `idp_quality`, `idp_security`, `idp_package`, and `idp_deploy_develop`.
- Migrate the existing web pipeline to the same naming and reusable setup conventions in the same implementation step.
- Use workspace-specific path detection plus shared root files so app pipelines do not run for unrelated app-only changes.
- Include IDP quality gates for Biome check, TypeScript typecheck, Vitest coverage, and production build.
- Include IDP security gates for dependency audit and image vulnerability scanning.
- Package the IDP as a multi-stage Node Docker image with a non-root runtime user.
- Deploy the IDP as a separate Dokploy service for now, not as part of a unified web + IDP stack.
- Mirror the web deployment flow: develop deploy for PRs to `staging`, staging deploy on `staging`, production deploy on `main`, and manual production rollback by digest.
- Add IDP post-deploy smoke checks for `/health` and `/ready`.
- Add an IDP develop sticky PR comment with URL, status, image tag, digest, smoke status, and workflow run.
- Use app-scoped variables and secrets such as `IDP_DEVELOP_URL`, `DOKPLOY_IDP_DEVELOP_WEBHOOK_URL`, and `DOKPLOY_WEB_DEVELOP_WEBHOOK_URL`.
- Update PRD, task plan, durable deployment docs, app READMEs, app AGENTS files, and backlog entries as needed.
- Register CI/CD-related skills in the app context, especially `ci-cd-and-automation`, `github-actions-docs`, and `turborepo`.

Deferred decisions and future enhancements:

- Do not integrate Better Auth, database access, Drizzle, or full-stack `/api/auth` proxy routing in this CI/CD step.
- Do not merge web and IDP into one Dokploy stack yet.
- Do not introduce SBOM, provenance, image signing, remote Turborepo cache, isolated full-stack previews, or E2E gates in this step.
- Add web post-deploy smoke checks later, such as `/config.json` and the SPA entry route.
- Split `security` into `source_security` and `artifact_security` later if checks grow enough to justify it.

Roadmap status rule:

- Keep the third baby step unchecked until the CI/CD implementation and verification are complete.

### 2026-05-27 - Theme 8: IDP Persistence And Minimal Auth Foundation

Planning source:

- Fourth IDP baby step: configure Drizzle/PostgreSQL access and integrate minimal Better Auth email/password.
- Decision discussion for [`docs/initiatives/prds/10-apps-idp-persistence-and-auth-foundation.md`](docs/initiatives/prds/10-apps-idp-persistence-and-auth-foundation.md).

Decisions:

- Combine Drizzle/PostgreSQL and minimal Better Auth email/password into one implementation step because the first useful auth flow depends on persisted Better Auth tables.
- Use the shared PostgreSQL infrastructure but keep IDP-owned table boundaries explicit with `idp_` prefixed `snake_case` physical table names.
- Use table names close to Better Auth model names with the IDP prefix, initially `idp_user`, `idp_session`, `idp_account`, and `idp_verification`.
- Use `DATABASE_URL`, not an IDP-scoped variable, because each service runtime owns its own environment and table/migration ownership defines the boundary.
- Use the standard `pg` driver with Drizzle's node-postgres integration so the IDP remains portable across Neon and future PostgreSQL providers.
- Use Neon for local, development, staging, and production database environments for now. Do not add local PostgreSQL Compose in this step.
- Keep migrations versioned under `apps/idp` and apply them through explicit operational/deploy steps, not automatically during application startup.
- Update deploy workflows so migrations run before the new IDP runtime is deployed. Rollbacks do not automatically roll back database migrations.
- Keep tests unit and route-level only in this step, with mocked database/auth boundaries and no real PostgreSQL or Neon access in CI.
- Expose IDP-owned auth wrappers under `/api/auth/*` instead of making native Better Auth catch-all endpoints the public default.
- Keep wrappers thin: they own route shape, OpenAPI, request context, future spans/log enrichment, and future events, while Better Auth remains responsible for users, credentials, sessions, cookies, and security internals.
- Initial wrapper operations are sign-up with email, sign-in with email, sign-out, session lookup, and auth ok/status.
- Use Better Auth email/password with cookie-based sessions, a default 30-day configurable session duration, secure HttpOnly cookies, and cookie cache explicitly disabled.
- Add `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `AUTH_SESSION_EXPIRES_IN_SECONDS` to IDP runtime configuration.
- Keep email verification, OTP delivery, reset password, password change, organization, admin, 2FA, event publication, tenant resolution, FastAPI integration, and frontend wizard integration outside this step.
- Minimal sign-up payload is `name`, `email`, and `password`.
- Existing frontend signup wizards require later adaptation before calling the IDP sign-up endpoint directly. Individual signup does not currently collect email, while company and technical-responsible flows collect email in company data rather than clearly as the global IDP account email.
- Email/password signup can create an account in this step, but effective access remains limited until the dedicated email verification step is implemented.

Roadmap status rule:

- Keep both the Drizzle/PostgreSQL and minimal Better Auth roadmap items unchecked until implementation and verification are complete.

Implementation status:

- Code implementation is in progress on `feat/idp-persistence-auth-foundation`.
- Implemented Drizzle schema, IDP-owned `idp_` table migration with UUID v7 IDs, PostgreSQL client, database readiness check, Better Auth email/password configuration, and IDP-owned `/api/auth/*` wrappers through identity use cases.
- Local unit/route verification uses mocked database/auth boundaries and does not connect to Neon.
- `pnpm --filter idp db:migrate` was executed against an approved development database after the UUID v7 migration reset.
- Roadmap items remain unchecked until the minimal Better Auth flow receives complete PostgreSQL-backed smoke coverage for readiness, auth ok, sign-up, sign-in, session, and sign-out.
