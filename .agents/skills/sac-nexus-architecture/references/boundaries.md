# SAC Nexus Boundaries

## App Ownership

`apps/web` owns:

- The React SPA, TanStack Router routes, presentation state, and forms.
- Browser integration with IDP and future business APIs.
- Browser-safe runtime configuration from `/config.json`.
- Feature modules under `src/modules/*` and shared browser primitives under
  `src/modules/shared`.

`apps/idp` owns:

- Better Auth integration, authentication, sessions, credentials, and cookies.
- Tenant identity, memberships, invitations, and identity-owned roles.
- Auth email delivery and templates.
- IDP-owned PostgreSQL tables, migrations, operational endpoints, and OpenAPI
  contracts.

Future business APIs own process, licensing, triage, document, requirement, and
other product-domain lifecycles, including persistence and domain
authorization. They consume identity context through explicit contracts and
must not write directly to `idp_*` tables.

Create `packages/*` only when at least two apps already duplicate stable
behavior, ownership and versioning are clear, and extraction reduces coupling.

## Placement Rules

- Put authentication and identity state in `apps/idp`.
- Keep business workflow and authorization out of `apps/idp`.
- Put browser UX in `apps/web`, but never treat client guards as authorization.
- Do not turn presentation fixtures or browser storage into production
  contracts.
- Keep route files thin and business-module internals behind `index.ts`.
- Do not create a generic service or package to avoid naming the actual owner.
