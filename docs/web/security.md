# Web Security

This document describes the current frontend security rules for `apps/web`.

## Browser Environment

Everything exposed through `VITE_*` variables is public browser-readable configuration.

Do not put secrets, private tokens, service credentials, or privileged URLs in frontend env vars.

## Environment Validation

Environment variables are validated in `src/modules/shared/config/env.ts` with Zod.

Application code should import the exported `env` object instead of reading `import.meta.env` directly.

Current public variables:

- `VITE_API_URL`
- `VITE_AUTH_URL`
- `VITE_APP_NAME`
- `VITE_APP_ENV`
- `VITE_ENABLE_MSW`

## Authentication Direction

The frontend is prepared for Better Auth integration.

The preferred auth model is cookie/session based auth managed by the auth service.

Do not store sensitive access tokens or refresh tokens in `localStorage`.

If token-based flows are introduced later, the storage and refresh strategy must be explicitly reviewed before implementation.

## Presentation-Only Browser State

The process presentation persists one versioned synthetic process aggregate
under `sac-nexus:process-engine:v1`. It allows the same request and protocol to
be observed across contributor, triage, analysis, and inspection profiles.
Role workspaces may persist separate versioned checklist and composer
projections, but they must reference the canonical process identity and write
lifecycle transitions back to that aggregate.

This is an explicit presentation-only exception using synthetic fixture data.
It is not an authorization boundary, database, or audit store. Do not extend
it to real personal data, uploaded file bytes, authentication credentials,
session tokens, secrets, payment records, or production process records.
Production persistence must move to approved backend APIs with server-side
tenant and role authorization, transactional state transitions, and durable
audit history.

The establishment-location presentation sends an explicitly confirmed address
to the public Nominatim endpoint and stores the selected coordinate in the
synthetic process snapshot. It does not perform autocomplete, background
lookups, or application logging. Treat this direct browser integration as a
demo-only exception and do not enter real personal or sensitive locations.
Production geocoding must move behind an approved backend boundary with
provider abstraction, caching, privacy review, rate enforcement, monitoring,
and documented retention.

The selected synthetic `User` and discriminated `Profile` are stored as a
versioned, non-sensitive `DemoSession` projection in `sessionStorage` only to
route the presentation scenarios. Fixture passwords are never stored. Restore
accepts only the canonical fixture IDs and discards invalid or tampered
projections. This remains client-controlled presentation state, not a session
credential or authorization boundary. Production identity, profile
relationships, capabilities, and role enforcement belong on approved backend
APIs and cookie-based sessions.

Generated DDLCB, AVCB, and Atestado de Vistoria files are explicitly marked as
demonstration documents. The frontend must not copy or imply an official seal,
digital signature, or legal validity. Authoritative issuance and validation
require a server-owned, audited, signed document pipeline.

## HTTP Client

The shared HTTP client is defined in `src/modules/shared/api/http-client.ts`.

It uses `credentials: 'include'` to support cookie/session based requests.

Advanced error normalization and auth refresh behavior are not implemented yet.

## Local Development

Vite proxies `/api` to a local backend target during development.

The proxy exists to reduce local CORS and cookie friction. Production routing and domains must be reviewed before deployment.

## Dependency And Generated Code Safety

Use package manager commands to add dependencies.

Do not manually edit dependency versions without a documented compatibility reason.

Generated files such as `src/routeTree.gen.ts` should not be manually edited.
