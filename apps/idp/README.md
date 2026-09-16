# SAC Nexus IDP

Dedicated Identity Provider service for SAC Nexus.

This app is the Node.js/Fastify foundation that will later host Better Auth, tenant membership, broad roles/permissions, and identity-related event emission. Business APIs remain responsible for domain data and resource-level authorization.

## Stack

- **Fastify** for the HTTP server.
- **TypeScript** with strict compiler settings.
- **tsx** for local development.
- **tsc** for production builds.
- **Zod** for environment validation.
- **Drizzle ORM** with PostgreSQL through `pg` for IDP-owned persistence.
- **Better Auth** for email/password authentication, session cookies, and auth-owned tables.
- **Resend** for transactional auth email delivery.
- **React Email** for local reusable email templates.
- **Fastify Swagger** for non-production OpenAPI and Swagger UI exposure.
- **Vitest** for unit tests.
- **Biome** for formatting, linting, and import organization.
- **Turborepo** for monorepo task orchestration.

## Requirements

Run commands from the repository root unless explicitly stated otherwise.

- Node.js version defined by the repository root.
- pnpm managed by Corepack.

Install dependencies from the repository root:

```bash
pnpm install
```

## Environment

Copy the example environment file when local overrides are needed:

```bash
cp apps/idp/.env.example apps/idp/.env
```

Current local variables:

```env
NODE_ENV=development
IDP_APP_ENV=local
IDP_HOST=127.0.0.1
IDP_PORT=3001
DATABASE_URL=postgresql://REPLACE_USER:REPLACE_PASSWORD@REPLACE_HOST/REPLACE_DATABASE?sslmode=verify-full
BETTER_AUTH_SECRET=REPLACE_WITH_AT_LEAST_32_CHARACTERS
BETTER_AUTH_URL=http://127.0.0.1:3001
AUTH_TRUSTED_ORIGINS=http://localhost:3001,http://127.0.0.1:3001
AUTH_SESSION_EXPIRES_IN_SECONDS=2592000
RESEND_API_KEY=REPLACE_RESEND_API_KEY
AUTH_EMAIL_FROM=SAC Nexus <REPLACE_VERIFIED_SENDER@example.test>
AUTH_EMAIL_REPLY_TO=support@example.test
AUTH_EMAIL_VERIFICATION_CALLBACK_URL=http://127.0.0.1:3000/auth/email-verified
AUTH_PASSWORD_RESET_REDIRECT_URL=http://127.0.0.1:3000/auth/reset-password
```

Environment variables are loaded automatically from `apps/idp/.env` when the file exists and then validated in `src/config/env.ts`. Existing shell variables take precedence. Tests skip automatic `.env` loading to keep unit runs deterministic.

`NODE_ENV` controls Node/runtime behavior. `IDP_APP_ENV` identifies the deployment environment using the same semantic values as the frontend app environment: `local`, `development`, `staging`, and `production`.

Do not access `process.env` directly outside this file.

`DATABASE_URL` and `BETTER_AUTH_SECRET` are required to start the IDP auth service in every runtime environment. Use separate Neon/PostgreSQL databases for local, development, staging, and production environments. Never expose these variables through frontend runtime config.

`AUTH_TRUSTED_ORIGINS` is a comma-separated allowlist for browser origins that may call Better Auth wrapper routes. Local development automatically trusts both `http://127.0.0.1:<port>` and `http://localhost:<port>` derived from `BETTER_AUTH_URL`.

`AUTH_SESSION_EXPIRES_IN_SECONDS` defaults to 30 days. Better Auth cookie cache is disabled so session reads stay database-backed for revocation correctness. Secure cookies are required outside local development.

`RESEND_API_KEY` and `AUTH_EMAIL_FROM` are required in every runtime environment. `AUTH_EMAIL_REPLY_TO` is optional. Staging and production must use a verified Resend sender/domain before real email delivery is enabled.

`AUTH_EMAIL_VERIFICATION_CALLBACK_URL` and `AUTH_PASSWORD_RESET_REDIRECT_URL` point users back to web-owned UX pages after Better Auth token handling. Auth wrapper routes use these configured URLs instead of client-provided redirect targets. Do not expose `RESEND_API_KEY` through frontend runtime config.

When logging is enabled, `IDP_APP_ENV=local` uses human-readable `pino-pretty` output for developer ergonomics. Other app environments keep structured JSON logs for machines and observability tooling.

Auth wrapper routes enrich the existing per-request canonical event with a safe `auth_operation` label such as `sign_in_email`. They must not emit separate routine auth logs or log email, passwords, cookies, tokens, session IDs, request bodies, or response bodies.

Transactional email delivery logs use safe operation labels only. They must not log email addresses, first names, tokens, verification/reset URLs, rendered email bodies, or raw Resend responses.

Data emitted by the IDP should use `snake_case`, including API payload fields and log event fields.

## Development

Start the IDP dev server:

```bash
pnpm --filter idp dev
```

The default local address is `http://127.0.0.1:3001`.

## Operational Endpoints

- Liveness: `GET /health`
- Readiness: `GET /ready`
- Swagger UI outside production: `GET /docs`
- OpenAPI JSON outside production: `GET /openapi.json`
- Tenant availability status: `GET /tenant/status`

`/health` and `/ready` return minimal non-sensitive payloads. They do not expose version, commit SHA, host, PID, IP, memory, uptime, or environment values.

`/ready` includes a database dependency check. It returns `503` when PostgreSQL is unavailable and never exposes connection strings, hosts, usernames, database names, query text, pool internals, or raw dependency errors.

`/docs` and `/openapi.json` are disabled when `IDP_APP_ENV=production`.

`/tenant/status` returns only `{"tenant_status":"available"}` or `{"tenant_status":"unavailable"}`. It does not expose tenant IDs, organization IDs, domains, aliases, raw host values, request headers, reason codes, SQL details, or internal errors.

Every request receives a canonical `x-request-id`. The IDP accepts a safe inbound `x-request-id`, falls back to `x-correlation-id`, generates a request ID when needed, and echoes the final value in the `x-request-id` response header.

Tenant status smoke checks can be run with synthetic hosts after the database has been migrated and tenant/domain records have been configured:

```bash
curl -H "Host: tenant.example.test" http://127.0.0.1:3001/tenant/status
```

To test proxy-forwarded host handling locally, prefer `X-Forwarded-Host` only when your local proxy or test setup intentionally controls that header:

```bash
curl -H "X-Forwarded-Host: tenant.example.test" http://127.0.0.1:3001/tenant/status
```

## Tenant Bootstrap

Use the package-level bootstrap command for controlled low-frequency tenant setup:

```bash
pnpm --filter idp bootstrap:tenant -- --name "SAC Nexus Example" --slug sac-nexus-example --domain tenant.example.test --alias www.tenant.example.test --owner-email owner@example.test --owner-name "Owner Example" --temporary-password "REPLACE_TEMPORARY_PASSWORD"
```

Required flags are `--name`, `--slug`, `--domain`, `--owner-email`, `--owner-name`, and `--temporary-password`. `--alias` is optional and repeatable.

The command creates or connects the Better Auth organization, IDP tenant record, primary domain, aliases, owner user, and owner membership through controlled server-side boundaries. Matching existing state is treated as reusable or already satisfied. Conflicting state fails with generic categories such as `conflict_detected` or `operation_failed`.

Command output is strict allowlist only. It may include operation categories and outcomes such as `bootstrap: completed`, `organization: created`, `tenant: reused`, `domains: created`, or `owner_membership: already_satisfied`. It must not print owner email, owner name, temporary password, raw domains, normalized hosts, internal IDs, SQL, tokens, cookies, session IDs, connection strings, stack traces, or raw Better Auth responses.

Temporary passwords can remain in shell history when pasted directly. Prefer an approved secret-handling workflow for real environments.

## OpenAPI Conventions

Custom IDP endpoints should keep Swagger/OpenAPI complete from the beginning:

- Add stable `operationId`, `tags`, `summary`, and `description` for every route.
- Add explicit schemas for documented responses.
- Prefer named reusable schemas with `$id`, `title`, `description`, field descriptions, and examples.
- Use `snake_case` for emitted payload fields.
- Keep examples synthetic and non-sensitive.
- Do not expose Swagger UI or OpenAPI JSON in `IDP_APP_ENV=production`.

Route files should follow this tag-scoped structure:

```txt
src/entrypoint/routes/
  openapi-tags.ts
  <tag>/
    openapi.ts
    <operation>/
      openapi.ts
      route.ts
    index.ts
```

Use `<operation>/route.ts` for Fastify registration and use case calls. Use `<tag>/openapi.ts` for tag metadata and `<operation>/openapi.ts` for schemas and route OpenAPI objects. Export route options as `{ schema: ... }` so handlers stay focused on behavior.

Reusable OpenAPI examples and shared property schemas live under `src/entrypoint/openapi`. Prefer reusing those shared pieces for repeated fields such as `service` and `timestamp` before creating route-local copies.

## Commands

- Start dev server: `pnpm --filter idp dev`
- Build: `pnpm --filter idp build`
- Run production build: `pnpm --filter idp start`
- Bootstrap a tenant: `pnpm --filter idp bootstrap:tenant -- --name "SAC Nexus Example" --slug sac-nexus-example --domain tenant.example.test --owner-email owner@example.test --owner-name "Owner Example" --temporary-password "REPLACE_TEMPORARY_PASSWORD"`
- Generate database migrations: `pnpm --filter idp db:generate`
- Apply database migrations: `pnpm --filter idp db:migrate`
- Open Drizzle Studio: `pnpm --filter idp db:studio`
- Check formatting and lint rules: `pnpm --filter idp check`
- Format and apply Biome fixes: `pnpm --filter idp format`
- Typecheck: `pnpm --filter idp typecheck`
- Unit tests: `pnpm --filter idp test`
- Unit tests with coverage: `pnpm --filter idp test:coverage`
- Unit tests in watch mode: `pnpm --filter idp test:watch`

## Docker And CI/CD

The IDP has a multi-stage Dockerfile at `apps/idp/Dockerfile` and a Dokploy-oriented Compose service at `apps/idp/compose.yml`.

The runtime image:

- Runs compiled JavaScript with `node apps/idp/dist/server.js`.
- Uses `NODE_ENV=production` and `IDP_APP_ENV=production` by default.
- Binds to `0.0.0.0:3001` by default.
- Runs as the non-root `node` user from the official Node image.
- Must not contain secrets or deploy-specific configuration baked into the image.

GitHub Actions use the shared gate taxonomy:

- `idp_quality`: Biome check, typecheck, Vitest coverage, and build.
- `idp_security`: dependency audit.
- `idp_package`: Docker build, image scan, GHCR publish, and digest resolution.
- `idp_deploy_develop`, `idp_deploy_staging`, `idp_deploy_production`: Dokploy deployments.
- `idp_rollback_production`: manual rollback by image digest.

Post-deploy smoke checks call `/health` and `/ready` for IDP deploys.

IDP deploy workflows run `pnpm --filter idp db:migrate` before triggering Dokploy deployment. Application startup never applies migrations automatically.

Durable deployment guidance lives in `../../docs/idp/deployment.md`.

## Source Structure

```txt
apps/idp/
  .dockerignore
  Dockerfile
  compose.yml
  package.json
  src/
    server.ts
    config/
      env.ts
      service.ts
    database/
      client.ts
      migrate.ts
      schema.ts
    entrypoint/
      app.ts
      openapi/
        examples.ts
        properties.ts
      plugins/
        openapi.ts
        request-context.ts
      routes/
        openapi-tags.ts
        auth/
          handler.ts
          index.ts
          openapi.ts
          openapi-schemas.ts
        operational/
          index.ts
          openapi.ts
          health/
            openapi.ts
            route.ts
          ready/
            openapi.ts
            route.ts
    infra/
      http/
        request-id.ts
      logging/
        canonical-event.ts
        logger.ts
      request-context/
        request-context.ts
    identity/
      auth.ts
      email-delivery.ts
      password-policy.ts
      emails/
        auth-email-templates.tsx
    usecases/
      dependencies/
        clock.ts
      operational/
        get-health.ts
        get-readiness.ts
  tests/
    unit/
      config/
      entrypoint/
      infra/
      usecases/
    integration/
  drizzle/
```

## Architecture Rules

- `src/server.ts` is the executable entrypoint.
- `src/config` owns runtime configuration and stable service identity constants.
- `src/database` owns Drizzle schema, PostgreSQL client setup, migrations, and database readiness checks for IDP-owned tables.
- `src/entrypoint` owns Fastify app composition, plugins, routes, and transport concerns.
- `src/infra/http` owns HTTP infrastructure helpers such as request ID resolution.
- `src/infra/logging` owns logger configuration, redaction, and canonical event helpers.
- `src/infra/request-context` owns the explicit request context passed into use cases.
- `src/usecases/<context>/<operation>.ts` owns application behavior by route context and operation, such as `src/usecases/operational/get-health.ts` and `src/usecases/identity/sign-in-with-email.ts`.
- `src/usecases/dependencies` owns small default dependencies such as `clock`.
- `src/identity` owns Better Auth configuration and auth engine integration boundaries.
- `src/identity/email-delivery.ts` owns the temporary inline Resend integration for auth emails.
- `src/identity/emails` owns local React Email templates. Keep templates reusable locally until another service becomes a real consumer.
- Use cases import only the default dependencies they need and may accept explicit overrides for tests or future composition.
- Route handlers should keep dependency wiring out of Fastify unless a concrete Fastify-managed resource needs lifecycle handling.
- Route handlers should call named use case functions, such as `getHealth`, `getReadiness`, or `signInWithEmail`, rather than a generic handler wrapper.
- Use `@/*` imports for source-root imports.
- Avoid empty folders and premature abstractions.
- Keep domain-specific business authorization in business APIs, not in the IDP.
- IDP-owned database tables use `idp_` prefixed `snake_case` names, such as `idp_user`, `idp_session`, `idp_account`, and `idp_verification`.
- Persisted IDP entity IDs use the SAC Nexus UUID v7 standard and PostgreSQL `uuid` columns.
- Business services must not write directly to IDP-owned tables.

## Auth Endpoints

Initial auth wrappers live under `/api/auth/*`:

- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-in/email`
- `POST /api/auth/send-verification-email`
- `GET /api/auth/verify-email`
- `POST /api/auth/request-password-reset`
- `GET /api/auth/reset-password/:token`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`
- `POST /api/auth/sign-out`
- `GET /api/auth/session`
- `GET /api/auth/ok`

Wrappers call explicit Better Auth server SDK methods, preserve Better Auth cookie/header behavior, and return sanitized `snake_case` payloads without session tokens. User, credential, cookie, and session internals remain Better Auth responsibilities.

Email/password access requires verified email. Signup sends a verification email through Resend. Verification links expire after 24 hours, and password reset links expire after 30 minutes.

Password policy requires 12 to 128 characters, allows passphrases, and blocks a small local denylist of obvious/common passwords. Password reset revokes all sessions. Authenticated password change requests revocation of other sessions.

## Testing

Unit tests live under `tests/unit` and mirror source layers.

Future integration tests should live under `tests/integration`.

Fastify routes are tested with `fastify.inject()` through `createApp()` so tests do not bind real network ports.

Run tests with:

```bash
pnpm --filter idp test
```

## Security

- Do not commit secrets.
- Keep `.env.example` limited to placeholders, never real secrets or realistic credentials.
- Do not log credentials, cookies, tokens, OTPs, backup codes, or sensitive personal data.
- Do not log CPF, CNPJ, email, raw query strings, request bodies, or response bodies by default.
- Canonical request events must stay operational and no-PII by default.
- Do not use localStorage-based authentication patterns.
- Do not reimplement Better Auth security internals in application code.
- Do not log `DATABASE_URL`, `BETTER_AUTH_SECRET`, passwords, cookies, session tokens, or session IDs.
- Do not log `RESEND_API_KEY`, email bodies, rendered email HTML, verification/reset URLs, or raw provider responses.

## Imports

Use `@/*` for imports rooted at `src`, for example `@/config/env.js`.

TypeScript resolves this through `paths`, Vitest resolves it through its alias config, and production builds run `tsc-alias` after `tsc` so emitted JavaScript can run with Node.

## Documentation

- Architecture: `../../docs/idp/architecture.md`
- Deployment: `../../docs/idp/deployment.md`
- Testing: `../../docs/idp/testing.md`
- Security: `../../docs/idp/security.md`
