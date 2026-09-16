# Apps IDP Initialization PRD

## Overview

This document defines the initialization plan for `apps/idp`, the dedicated Node.js Identity Provider application for SAC Nexus.

The goal is to create a runnable and testable Fastify foundation using strict TypeScript, Biome, Vitest, Zod-based environment validation, and monorepo scripts. This first step must prepare the service for the next IDP roadmap items without implementing health/readiness endpoints, OpenAPI, Better Auth, database access, or authentication flows yet.

Execution plan: [`docs/initiatives/tasks/07-apps-idp-initialization.md`](../tasks/07-apps-idp-initialization.md).

## Product Context

SAC Nexus is evolving from a frontend-only monorepo into a polyglot system. The proposed identity architecture uses a dedicated Node.js IDP powered by Better Auth, while business APIs are expected to live primarily in Python and Go services.

The IDP will eventually own authentication, sessions, broad identity events, tenant membership through Better Auth organizations, and coarse-grained roles/permissions. Business APIs will remain responsible for tenant-scoped domain data, resource-level authorization, and business-specific rules.

This PRD covers only the first baby step from `idp-architecture-discussion.md`: creating the `apps/idp` project foundation.

## Goals

- Create `apps/idp` as a runnable Fastify service.
- Use strict TypeScript from the beginning.
- Use `tsx` for local development and `tsc` for production build output.
- Use Biome through the existing root tooling for formatting, linting, and import organization.
- Use Vitest for unit tests only in this initialization step.
- Use Zod for centralized environment validation.
- Integrate with the existing pnpm workspace and Turborepo scripts.
- Keep package dependency installation reproducible through pnpm CLI commands.
- Establish a clear but not overbuilt folder structure based on layers.
- Add app-level agent instructions for future IDP work.
- Add app README and durable IDP docs for architecture, testing, and security.
- Keep the implementation ready for the next baby step without implementing that next step now.

## Non-Goals

- No Better Auth integration in this step.
- No email/password authentication flow in this step.
- No database, Drizzle, PostgreSQL, migrations, or adapters in this step.
- No health/readiness endpoint implementation in this step.
- No structured request/correlation ID implementation in this step.
- No OpenAPI/Swagger endpoint exposure in this step.
- No GitHub Actions or CI workflow changes in this step.
- No Docker or deployment packaging in this step.
- No E2E tests in this step.
- No integration tests beyond reserving the test folder convention.
- No custom rate limiting, security headers, CORS, or auth plugins in this step.

## Decisions

### Initialization Scope

The first IDP implementation should be a runnable and testable setup, not a full feature slice.

It should include:

- A Fastify app factory.
- A server entrypoint.
- Strict TypeScript configuration.
- Environment validation.
- Unit test foundation.
- Package-level scripts.
- App README and app-specific agent guidance.

It should not include health/readiness routes, OpenAPI contracts, request correlation IDs, or structured observability behavior yet. Those belong to the next roadmap item, but this setup must avoid choices that make them harder.

### CLI And Dependency Policy

Dependency installation must use pnpm commands such as `pnpm add`, `pnpm add -D`, and `pnpm dlx` where relevant.

Manual edits are acceptable for source files, TypeScript config, test config, README files, and agent instructions. Generators should only be used when their output is small, deterministic, and aligned with this repository's structure. Avoid adopting a large scaffold that must be cleaned up immediately.

### Runtime And Build

Use `tsx` for local development and TypeScript execution during development.

Use `tsc` for production builds and emit JavaScript into `dist`. Production execution should run emitted JavaScript with Node.js, for example `node dist/server.js`.

Do not use Vite as the Fastify server build tool in this step. Vite remains appropriate for the frontend and Vitest can still be used for tests, but a backend Fastify service does not need a Vite server bundle for the initial foundation.

### Monorepo Integration

The package should live at `apps/idp` and use the package name `idp`, matching the simple naming convention already used by `apps/web`.

The package should expose package-level scripts, with root scripts continuing to delegate through Turborepo:

- `dev`
- `build`
- `start`
- `format`
- `lint`
- `check`
- `typecheck`
- `test`
- `test:coverage`
- `test:watch`

The existing root scripts should remain simple `turbo run <task>` delegations. The IDP package should be runnable with commands such as `pnpm --filter idp dev`, `pnpm --filter idp test`, and `pnpm --filter idp build`.

### Imports And Aliases

Use `@/*` imports for source-root imports in `apps/idp`, matching the frontend style.

Because this is a Node service, TypeScript `paths` are not enough for production runtime. The IDP build should run `tsc` and then `tsc-alias` so emitted JavaScript in `dist` uses Node-resolvable relative imports.

### Initial Dependencies

Keep the dependency baseline small.

Runtime dependencies:

- `fastify`
- `zod`

Development dependencies:

- `typescript`
- `tsx`
- `vitest`
- `@vitest/coverage-v8`
- `@types/node`
- `tsc-alias`

Do not install Swagger, CORS, security headers, Drizzle, Better Auth, OpenAPI clients, queue libraries, or observability libraries in this step.

### Folder Architecture

The IDP should be organized by clear layers, but avoid empty folders and premature abstractions.

Initial structure:

```txt
apps/idp/
  src/
    server.ts
    config/
      env.ts
    entrypoint/
      app.ts
  tests/
    unit/
      config/
      entrypoint/
    integration/
```

Layer intent:

- `server.ts` is the executable entrypoint that loads config, creates the app, and starts listening.
- `src/entrypoint/app.ts` owns Fastify app composition, plugins, routes, and transport-level concerns.
- `src/config` owns environment parsing and runtime configuration.
- `src/usecases` should be introduced when the first real application action exists.
- Future `identity`, `database`, `events`, and `shared` layers should be documented but not created as empty folders during initialization.
- `tests/unit` mirrors source layers for unit tests.
- `tests/integration` is reserved as the future location for integration tests, but this PRD does not require adding integration tests.

### Environment Configuration

Environment validation should start with only the variables required to run the initial server:

- `NODE_ENV`
- `IDP_APP_ENV`
- `IDP_HOST`
- `IDP_PORT`

Defaults should support local development and unit tests without requiring secrets.

`NODE_ENV` and `IDP_APP_ENV` must remain distinct. `NODE_ENV` controls Node/runtime behavior, while `IDP_APP_ENV` describes the deployment environment using the same semantic values as the frontend app environment: `local`, `development`, `staging`, and `production`.

Do not introduce `DATABASE_URL`, `BETTER_AUTH_SECRET`, email credentials, token keys, or other sensitive placeholders before the steps that actually use them.

`process.env` should be read only from the central config module. Other source files should consume typed config values instead of reading environment variables directly.

### Testing

Use Vitest with the Node environment.

The initialization step should include unit tests only. Acceptable tests include:

- Environment parsing behavior.
- Fastify app factory creation without binding a real network port.

Do not add database integration tests, Better Auth tests, HTTP contract tests, or E2E tests in this step.

The test folder should reserve separate scopes for `tests/unit` and `tests/integration`, even though only unit tests are required now.

### Documentation

The setup should create operational app documentation and durable IDP documentation:

- `apps/idp/README.md` for local setup, commands, environment variables, and source structure.
- `apps/idp/AGENTS.md` for app-specific agent instructions.
- `docs/idp/architecture.md` for durable architecture notes.
- `docs/idp/testing.md` for durable testing conventions.
- `docs/idp/security.md` for durable security rules.

Technical documentation, filenames, headings, code, routes, and scripts must be written in English.

### Agent Guidance And Skills

`apps/idp/AGENTS.md` should stay concise and operational. It should include stack, architecture, security, testing, package management, and useful local skills.

Useful skills for future IDP work include:

- `fastify-best-practices`
- `vitest`
- `turborepo`
- `better-auth-best-practices`
- `email-and-password-best-practices`
- `organization-best-practices`
- `two-factor-authentication-best-practices`
- `postgres-drizzle`
- `observability-guidelines`

### Security

The setup must avoid introducing secrets or insecure storage patterns.

Security rules for the initialization step:

- Do not commit real secrets.
- Do not add auth tokens or secrets to frontend-visible variables.
- Do not add localStorage-based auth patterns.
- Do not log credentials, cookies, tokens, OTPs, backup codes, or personal identifiers.
- Keep environment config minimal until auth and database steps require sensitive values.
- Prefer explicit, typed configuration over ad hoc environment reads.

Detailed log redaction, request IDs, correlation IDs, rate limits, security headers, and audit event emission are deferred to later roadmap items.

### Performance

Fastify is the chosen HTTP framework for its performance profile and production ecosystem.

The initialization should avoid adding a server bundler, unnecessary plugins, or cross-package coupling before there is a measurable need. The app should be structured so later routes can use Fastify schemas for validation and serialization, but schema-heavy route implementation is outside this step.

### CI/CD

Do not change GitHub Actions in this PRD.

The setup must prepare package-level scripts so the IDP participates in root monorepo commands through Turborepo. Dedicated IDP CI/pipeline coverage is the third baby step and should be handled in a separate PRD or implementation task.

## Functional Requirements

- Developers can install dependencies from the repository root with pnpm.
- Developers can start the IDP locally with `pnpm --filter idp dev`.
- Developers can build the IDP with `pnpm --filter idp build`.
- Developers can run unit tests with `pnpm --filter idp test`.
- Developers can run type-checking with `pnpm --filter idp typecheck`.
- The Fastify app can be created in tests without binding a real network port.
- Environment variables are parsed through a central typed config module.
- App-specific instructions and durable IDP docs exist for future agents and developers.

## Non-Functional Requirements

- TypeScript must be strict.
- The implementation must be small and understandable.
- The app must follow monorepo task conventions.
- The setup must not require external services.
- Unit tests must not depend on network ports, databases, Better Auth, or real credentials.
- The folder structure must make layers understandable without adding unused abstractions.
- The setup must preserve a clear path to health/readiness endpoints, structured logs, request IDs, and OpenAPI in the next roadmap item.

## Risks

- Over-structuring the app could create dead abstractions before real IDP responsibilities exist.
- Under-structuring the app could make the next steps harder to organize and review.
- Adding future dependencies too early could increase security and maintenance surface without immediate value.
- Using a server bundler too early could obscure runtime behavior and debugging for a simple Fastify service.
- Creating CI workflow changes in this step could blur the boundary with the dedicated CI roadmap item.

## Acceptance Criteria

- `apps/idp` exists and is included in the pnpm workspace through the existing `apps/*` pattern.
- The `idp` package exposes the agreed scripts.
- The service has a Fastify app factory and server entrypoint.
- TypeScript strict mode is configured for the IDP.
- Zod validates `NODE_ENV`, `IDP_APP_ENV`, `IDP_HOST`, and `IDP_PORT` in a central config module.
- Unit tests exist for initial config and/or app factory behavior.
- `pnpm --filter idp check` passes.
- `pnpm --filter idp typecheck` passes.
- `pnpm --filter idp test` passes.
- `pnpm --filter idp build` produces `dist` output.
- `apps/idp/README.md`, `apps/idp/AGENTS.md`, and `docs/idp/*` docs are created.
- No real secrets or future auth/database placeholders are committed.

## Future Enhancements

- Add health/readiness endpoints, structured JSON logs, request/correlation ID, and minimal OpenAPI/Swagger setup.
- Add CI/pipeline coverage for the IDP package.
- Add Drizzle and PostgreSQL access for Better Auth.
- Integrate Better Auth with email/password sessions.
- Add IDP event publication abstraction and later audit integration.
- Add organization, admin, and two-factor authentication plugins in later steps.
- Add Docker/deployment packaging when the runtime surface is stable.

## Open Questions

- Whether the future `src/usecases` layer should be organized by action name, feature area, or command/query split once real IDP behavior appears.
- Whether integration tests should use testcontainers, a shared local PostgreSQL service, or another strategy when database integration begins.
