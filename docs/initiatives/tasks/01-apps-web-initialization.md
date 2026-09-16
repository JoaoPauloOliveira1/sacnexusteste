# Apps Web Initialization Tasks

Execution checklist for [`docs/initiatives/prds/01-apps-web-initialization.md`](../prds/01-apps-web-initialization.md).

## Phase 1: Monorepo Foundation

- [x] Create root `package.json` with pnpm package manager metadata.
- [x] Enable Corepack usage in documentation.
- [x] Add Node version file using the latest stable Node version.
- [x] Add `pnpm-workspace.yaml` including `apps/*` and future `packages/*`.
- [x] Add `turbo.json` with package-level tasks.
- [x] Add root scripts delegating to `turbo run`.
- [x] Add root `.gitignore`.

## Phase 2: Web App Initialization

- [x] Initialize `apps/web` with Vite React TypeScript using the pnpm CLI.
- [x] Configure package metadata for `apps/web`.
- [x] Install React latest stable and Vite latest stable compatible packages using pnpm commands.
- [x] Configure strict TypeScript in `apps/web`.
- [x] Configure `@/*` alias in TypeScript.
- [x] Configure TypeScript path alias resolution using Vite native `resolve.tsconfigPaths` or `vite-tsconfig-paths` if native support is unavailable.
- [x] Configure Vite dev proxy for `/api`.

## Phase 3: Router And Query Foundation

- [x] Install TanStack Router packages using `pnpm add`.
- [x] Configure TanStack Router file-based routing.
- [x] Create `src/routes/__root.tsx`.
- [x] Create minimal `src/routes/index.tsx` validation route.
- [x] Configure route tree generation.
- [x] Register router types for inference.
- [x] Install TanStack Query using `pnpm add`.
- [x] Create shared Query Client setup.
- [x] Wire Query Client provider into app bootstrap.

## Phase 4: Shared Infrastructure

- [x] Create `src/modules/shared/config/env.ts` with Zod validation.
- [x] Add initial env vars and `.env.example`.
- [x] Install `ky` using `pnpm add`.
- [x] Create initial shared HTTP client wrapper.
- [x] Create initial shared module folders: `api`, `config`, `hooks`, `lib`, `testing`, `ui`.
- [x] Add initial `cn()` utility.

## Phase 5: UI Foundation

- [x] Install Tailwind CSS v4 for Vite using pnpm commands.
- [x] Configure global CSS entrypoint.
- [x] Initialize shadcn/ui with `base` primitives using `pnpm dlx shadcn@latest`.
- [x] Configure shadcn aliases to use `src/modules/shared/components/ui`.
- [x] Configure lucide icons.
- [x] Add minimal shadcn components needed for validation only.
- [x] Verify Tailwind classes render in the minimal route.

## Phase 6: Code Quality

- [x] Install Biome using `pnpm add -D`.
- [x] Add `biome.json`.
- [x] Enable formatter and recommended lint rules.
- [x] Enable `assist.actions.source.organizeImports`.
- [x] Configure import groups if needed.
- [x] Enable `noRestrictedImports` for deep business-module imports.
- [x] Enable `useSortedClasses` for Tailwind class sorting.
- [x] Add package scripts for `format`, `lint`, `check`, and `typecheck`.

## Phase 7: Testing Foundation

- [x] Install Vitest using `pnpm add -D`.
- [x] Install React Testing Library using `pnpm add -D`.
- [x] Install Testing Library user-event and jest-dom equivalents using `pnpm add -D`.
- [x] Configure Vitest for React/jsdom.
- [x] Install MSW using `pnpm add -D`.
- [x] Add shared test setup under `src/modules/shared/testing`.
- [x] Add one minimal component/render test.
- [x] Install Playwright using pnpm commands.
- [x] Add one minimal e2e smoke test.

## Phase 8: Git Workflow Automation

- [x] Install Lefthook using `pnpm add -D`.
- [x] Configure `pre-commit` to run Biome on staged files.
- [x] Install Commitlint using `pnpm add -D`.
- [x] Configure Conventional Commits validation.
- [x] Configure `commit-msg` hook through Lefthook.
- [x] Decide whether `pre-push` should run `pnpm check` immediately or remain documented for later.

Note: hook files were configured, but `pnpm lefthook install` was not executed because this workspace is not currently inside a Git repository.

## Phase 9: Documentation And Agents

- [x] Create root `AGENTS.md`.
- [x] Create `apps/web/AGENTS.md`.
- [x] Create `apps/web/README.md` with setup and scripts.
- [x] Create `docs/web/architecture.md` placeholder or initial version.
- [x] Create `docs/web/conventions.md` placeholder or initial version.
- [x] Create `docs/web/testing.md` placeholder or initial version.
- [x] Create `docs/web/security.md` placeholder or initial version.

## Phase 10: Verification

- [x] Run install.
- [x] Run format/check.
- [x] Run typecheck.
- [x] Run unit/component tests.
- [x] Run Playwright smoke test.
- [x] Run Vite build.
- [x] Start dev server and validate the minimal route manually.
- [x] Review generated files and remove temporary boilerplate that does not fit the architecture.
