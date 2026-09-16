# Apps IDP Initialization Tasks

Execution checklist for [`docs/initiatives/prds/07-apps-idp-initialization.md`](../prds/07-apps-idp-initialization.md).

## Phase 1: Planning And Governance

- [x] Create IDP initialization PRD.
- [x] Create IDP initialization execution plan.
- [x] Review `idp-architecture-discussion.md` before implementation and keep this task scoped to the first roadmap item.
- [x] Confirm no health/readiness, OpenAPI, Better Auth, database, or CI work is added to this setup task.

## Phase 2: Package Creation

- [x] Create `apps/idp`.
- [x] Create `apps/idp/package.json` with package name `idp`, private metadata, and `type: module`.
- [x] Add runtime dependencies with pnpm CLI: `fastify` and `zod`.
- [x] Add development dependencies with pnpm CLI: `typescript`, `tsx`, `vitest`, `@vitest/coverage-v8`, and `@types/node`.
- [x] Add `tsc-alias` to support `@/*` imports in emitted Node builds.
- [x] Ensure dependencies are not added manually to `package.json` when pnpm commands can do it.

## Phase 3: TypeScript And Build Foundation

- [x] Add strict TypeScript configuration for `apps/idp`.
- [x] Configure TypeScript to emit production JavaScript into `dist`.
- [x] Configure TypeScript for Node.js ESM usage.
- [x] Configure `@/*` source-root imports for TypeScript, Vitest, and emitted production builds.
- [x] Add a development flow based on `tsx`.
- [x] Add a production start flow based on `node dist/server.js`.
- [x] Ensure generated `dist` output is ignored by Git if needed.

## Phase 4: Source Structure

- [x] Create `src/server.ts` as the executable entrypoint.
- [x] Create `src/config/env.ts` for centralized Zod-based environment parsing.
- [x] Create `src/entrypoint/app.ts` for Fastify app creation.
- [x] Keep `src/usecases` out of the initial filesystem until the first real use case exists.
- [x] Keep future `identity`, `database`, `events`, and `shared` layers documented but not created as empty folders.

## Phase 5: Environment Configuration

- [x] Support `NODE_ENV` with safe local/test defaults.
- [x] Support `IDP_APP_ENV` with frontend-aligned environment semantics.
- [x] Support `IDP_HOST` with a local default.
- [x] Support `IDP_PORT` with a local default.
- [x] Add `apps/idp/.env.example` with only non-secret local values.
- [x] Ensure source files outside `src/config/env.ts` do not read `process.env` directly.
- [x] Do not add database, Better Auth, email, token, or secret placeholders in this setup step.

## Phase 6: Package Scripts And Monorepo Integration

- [x] Add `dev` script for local Fastify development through `tsx`.
- [x] Add `build` script for TypeScript production output.
- [x] Add `start` script for running emitted JavaScript.
- [x] Add `format` script using Biome.
- [x] Add `lint` script using Biome.
- [x] Add `check` script using Biome.
- [x] Add `typecheck` script using TypeScript without emitting when appropriate.
- [x] Add `test` script using Vitest run mode.
- [x] Add `test:coverage` script using Vitest coverage.
- [x] Add `test:watch` script using Vitest watch mode.
- [x] Verify root `turbo.json` task outputs still fit the IDP build output.
- [x] Avoid adding root script logic that bypasses `turbo run`.

## Phase 7: Unit Test Foundation

- [x] Configure Vitest for Node.js unit tests.
- [x] Create `tests/unit/config` for config-related unit tests.
- [x] Create `tests/unit/entrypoint` for Fastify app-factory unit tests.
- [x] Reserve `tests/integration` as the future integration-test scope.
- [x] Add unit tests for environment parsing behavior.
- [x] Add a unit-level test that creates the Fastify app without binding a network port.
- [x] Do not add database, Better Auth, or E2E tests in this setup step.

## Phase 8: Documentation And Agent Guidance

- [x] Create `apps/idp/README.md` with stack, requirements, environment, commands, source structure, tests, and security notes.
- [x] Create `apps/idp/AGENTS.md` with concise local rules for IDP agents.
- [x] Create `docs/idp/architecture.md` with durable IDP architecture and layer guidance.
- [x] Create `docs/idp/testing.md` with durable IDP testing conventions.
- [x] Create `docs/idp/security.md` with durable IDP security rules.
- [x] Include useful local skills in `apps/idp/AGENTS.md`.
- [x] Keep long-form documentation out of `AGENTS.md`.

## Phase 9: Security Review

- [x] Confirm no real secrets are committed.
- [x] Confirm `.env.example` contains only safe placeholders.
- [x] Confirm no auth tokens, cookies, credentials, OTPs, or personal identifiers are logged by initial code.
- [x] Confirm no frontend-visible environment variable is used for IDP secrets.
- [x] Confirm no localStorage-based auth guidance is introduced.
- [x] Confirm future auth/database variables are not added before they are needed.

## Phase 10: Verification

- [x] Run `pnpm install` after dependency changes.
- [x] Run `pnpm --filter idp check`.
- [x] Run `pnpm --filter idp typecheck`.
- [x] Run `pnpm --filter idp test`.
- [x] Run `pnpm --filter idp test:coverage`.
- [x] Run `pnpm --filter idp build`.
- [x] Run root `pnpm check` to confirm monorepo integration.
- [x] Run root `pnpm typecheck` to confirm monorepo integration.
- [x] Run root `pnpm test` to confirm monorepo integration.
- [x] Run root `pnpm build` to confirm monorepo integration.
- [x] Start the IDP locally with `pnpm --filter idp dev` and confirm it boots.

## Phase 11: Future Enhancements

- [ ] Add health/readiness endpoints, structured JSON logs, request/correlation ID, and minimal OpenAPI/Swagger setup.
- [ ] Add IDP CI/pipeline coverage after the service foundation exists.
- [ ] Add Drizzle and PostgreSQL access for Better Auth.
- [ ] Add Better Auth email/password authentication.
- [ ] Add email verification, password reset, password change, and session revocation behavior.
- [ ] Add IDP event publication abstraction.
- [ ] Add organization, admin, and two-factor authentication plugins in later steps.
