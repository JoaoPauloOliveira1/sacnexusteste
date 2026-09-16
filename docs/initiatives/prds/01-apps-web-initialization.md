# Apps Web Initialization PRD

## Overview

This document defines the initialization plan for `apps/web`, the first frontend application in the SAC Nexus monorepo.

The goal is to create a scalable React SPA foundation using TanStack Router, TanStack Query, shadcn/ui, Tailwind CSS v4, strict TypeScript, Biome, and a modular architecture prepared for authentication, business modules, testing, documentation, and AI-assisted development.

## Product Context

`apps/web` will be a Brazilian-facing web application with authentication, modules, reusable components, and integration with external APIs.

The repository is expected to evolve into a polyglot monorepo containing:

- `apps/web`: React SPA frontend.
- Future main API service, likely Python or Go.
- Future workers, likely Python or Go.
- Future users/auth service in Node.js using Better Auth.
- Future shared packages only when there is a concrete need.

## Language Policy

- Technical documentation, code, routes, filenames, folders, commits, PRs, and `AGENTS.md` files must be written in English.
- User-facing labels, UI messages, validation messages, and product copy must be written in Brazilian Portuguese (`pt-BR`).

## Goals

- Initialize `apps/web` as a Vite React SPA.
- Use TanStack Router with file-based routing.
- Use TanStack Query as the official server-state/cache layer.
- Use `ky` as the official HTTP client.
- Use `zod` for env validation and future contracts/forms/search params validation.
- Use React Hook Form with Zod for business forms.
- Use shadcn/ui with Base UI primitives and lucide icons.
- Use Tailwind CSS v4.
- Use a scalable modular folder architecture under `src/modules/*`.
- Enforce module boundaries through Biome restricted imports.
- Use Biome as the single formatter/linter/import organizer.
- Set up unit/component/e2e test foundations.
- Add AI agent guidance with `AGENTS.md` files.
- Keep the setup focused on infrastructure, not real screens or backend integration.

## Non-Goals

- No real product screens in the initial setup.
- No full auth integration in the initial setup.
- No advanced API error handling in the initial setup.
- No toast/notification strategy in the initial setup.
- No dark/light theme toggle in the initial setup.
- No CI setup in the initial setup.
- No Renovate setup in the initial setup.
- No shared monorepo packages in the initial setup.
- No Storybook in the initial setup.

## Decisions

### Runtime And Package Management

- Use the latest stable Node.js version available at initialization time.
- Use the latest stable pnpm version available at initialization time.
- Use `packageManager` in the root `package.json`.
- Use Corepack to manage pnpm.
- Add a Node version file such as `.node-version` or `.nvmrc`.
- Always use pnpm for package operations.
- Use `pnpm install` for dependency installation.
- Use `pnpm add` and `pnpm add -D` for adding dependencies.
- Use `pnpm dlx` for one-off CLIs, including shadcn commands.
- Do not manually edit `package.json` to add dependencies or pin library versions when a CLI/package manager command can do it.
- Do not manually choose dependency versions unless there is a documented compatibility reason.

### Monorepo

- Use `pnpm workspaces`.
- Use Turborepo as the monorepo orchestrator and cache layer.
- Use Turborepo as a command orchestrator for future non-JS services without trying to replace native Python/Go tooling.
- Prefer package-level tasks over root task logic.
- Root scripts must delegate to `turbo run <task>`.
- Future Python/Go services must expose explicit wrapper scripts/tasks and declare appropriate Turbo `inputs` and `outputs`.

### Frontend Stack

- Use Vite.
- Use React latest stable version available at initialization time.
- Use TypeScript.
- Use TanStack Router.
- Use TanStack Query.
- Use Tailwind CSS v4.
- Use shadcn/ui.
- Use Base UI primitives through shadcn/ui.
- Use `lucide-react` as the official icon library.

### Application Runtime

- `apps/web` is a SPA.
- It will consume external APIs.
- API/auth URLs must be configured through environment variables.
- Development should use Vite proxy with relative paths such as `/api` to reduce local CORS/cookie friction.

### Authentication

- Authentication will be based on Better Auth.
- Prefer session/cookie-based auth supported by Better Auth.
- Avoid storing sensitive access/refresh tokens in `localStorage`.
- Production domain topology is not finalized.
- Prefer same-site or same base-domain deployment in production.
- Avoid designs that depend on third-party cookies.
- Full auth integration is deferred to a future integration phase.

### HTTP And Server State

- Use `ky` as the HTTP client.
- Create a small HTTP client wrapper in shared infrastructure.
- Use TanStack Query as the official cache/server-state layer.
- Query keys must be arrays, serializable, dependency-complete, and hierarchical.
- Complex modules should use query key factories.
- Use targeted invalidation after mutations.
- Advanced API error handling is deferred to the integration phase.

### Validation

- Use `zod` for environment variable validation.
- Use `zod` for future API contracts where runtime validation is valuable.
- Use `zod` for search params/route params validation when needed.
- Use `zod` with React Hook Form for business forms.

### Forms

- Use React Hook Form with Zod for business forms.
- Use simple local state or TanStack Router search params for small filters/search controls.
- Avoid introducing React Hook Form for trivial one-off controls.

### Routing

- Use TanStack Router with file-based routing.
- Organize routes by folders/domains.
- Use pathless layouts when shared route context/layout is needed.
- Create minimal temporary routes only to validate router setup.
- Register router types for global inference.
- Use route context for dependency injection when needed.
- Validate search params with Zod when they represent meaningful state.

### Styling And UI

- Use Tailwind CSS v4.
- Use shadcn/ui components as source code, not as a black-box dependency.
- Use `pnpm dlx shadcn@latest` for shadcn CLI operations.
- shadcn/ui components should live in `src/modules/shared/components/ui`.
- Use semantic tokens for colors and avoid hardcoded color overrides in component usage.
- Prefer component composition over custom styled markup.
- Use `cn()` for conditional class names.
- Use `gap-*` instead of `space-x-*`/`space-y-*`.
- Use `size-*` when width and height are equal.
- Use shadcn component primitives before writing custom UI.
- Use lucide icons as icon components, not string lookups.

### Component Architecture

- Prefer composition over boolean prop proliferation.
- For complex reusable components, prefer compound components and provider boundaries.
- Prefer explicit variants over a single component with many boolean modes.
- Prefer `children` composition over render props unless the parent must provide data to the child.
- Since React latest stable is expected, use modern React patterns where supported by the selected version and team conventions.

### Folder Architecture

Use a modular architecture centered around `src/modules/*`.

Planned structure:

```txt
apps/web/
  src/
    main.tsx
    route-tree.gen.ts
    routes/
      __root.tsx
      index.tsx
    modules/
      shared/
        api/
        config/
        hooks/
        lib/
        testing/
        ui/
      auth/
        index.ts
      dashboard/
        index.ts
```

Rules:

- `src/modules/shared/*` can be imported directly by any module.
- Business modules must expose a public API through `index.ts`.
- Business modules must not deep-import from other business modules.
- Internal imports inside the same module are allowed.
- If a concept is reused across multiple modules, move it to `modules/shared` or export it intentionally from the owning module public API.

### Naming Conventions

- Folders and files: `kebab-case`.
- React components: `PascalCase`.
- Hooks: `use-something.ts` and exported functions starting with `use`.
- Route names: English.
- User-visible text: `pt-BR`.

### Imports And Aliases

- Use `@/*` mapped to `src/*`.
- Prefer Vite native `resolve.tsconfigPaths` when available; otherwise use `vite-tsconfig-paths`.
- Use Biome `organizeImports` for import ordering.
- Use Biome `noRestrictedImports` to enforce module boundaries.

### TypeScript

- Use strict TypeScript from the start.
- Enable `strict`.
- Enable `noUncheckedIndexedAccess`.
- Enable `exactOptionalPropertyTypes`.
- Keep TypeScript configuration inside `apps/web` initially.
- Do not create a shared TypeScript config package in the first setup.

### Environment Variables

Create `src/modules/shared/config/env.ts`.

Rules:

- Validate `import.meta.env` with Zod.
- Export a single `env` object.
- Do not access `import.meta.env` outside `env.ts`.

Initial variables:

- `VITE_API_URL`
- `VITE_AUTH_URL`
- `VITE_APP_NAME`
- `VITE_APP_ENV`
- `VITE_ENABLE_MSW`

`VITE_APP_ENV` should support:

- `local`
- `development`
- `staging`
- `production`

### Code Quality

- Use Biome only for formatting, linting, organize imports, deep import restrictions, and Tailwind class sorting.
- Do not add ESLint initially.
- Do not add Prettier initially.
- Enable Biome `organizeImports`.
- Enable Biome `noRestrictedImports` for module boundaries.
- Enable Biome `useSortedClasses` for Tailwind class sorting with the known caveat that it is a nursery/experimental rule and unsafe fixes may not run automatically in all editor flows.
- Reevaluate Tailwind class sorting later if Biome's rule proves unstable for the project.

### Tests

- Use Vitest for unit tests.
- Use React Testing Library for component tests.
- Use Playwright for e2e tests.
- Use MSW for API mocks in tests and optional isolated development.
- Keep the first test setup pragmatic and focused on infrastructure validation.

### Git Hooks And Commits

- Use Lefthook for Git hooks.
- Use a lightweight `pre-commit` hook for Biome on staged files.
- Use `pre-push` for heavier checks when practical.
- Use Conventional Commits.
- Use Commitlint to validate commit messages through `commit-msg`.

### Documentation

Use root-level documentation for monorepo-wide docs.

Planned docs structure:

```txt
docs/
  prd/
    apps-web-initialization.md
  web/
    architecture.md
    conventions.md
    testing.md
    security.md

apps/
  web/
    README.md
```

Rules:

- Keep `apps/web/README.md` operational and concise.
- Keep durable architecture/convention docs under `docs/web`.
- Keep PRDs under `docs/initiatives/prds`.

### AI Agent Guidance

Use `AGENTS.md` as the standard agent instruction format.

Planned structure:

```txt
AGENTS.md
apps/
  web/
    AGENTS.md
```

Allow additional nested `AGENTS.md` files when a module or complex component has important local rules:

```txt
apps/web/src/modules/auth/AGENTS.md
apps/web/src/modules/shared/components/AGENTS.md
```

Rules:

- Start only with root and `apps/web` agent files.
- Add nested `AGENTS.md` files only when there is meaningful local context.
- Keep each `AGENTS.md` concise, practical, and preferably under 200 lines.
- Use docs for long-form explanations.
- Use `.agents/skills` for detailed on-demand workflows.
- Mention relevant local skills in `apps/web/AGENTS.md`.

Available local skills to consider during implementation:

- `shadcn`
- `tailwind-css-patterns`
- `tanstack-query-best-practices`
- `tanstack-router-best-practices`
- `turborepo`
- `vercel-composition-patterns`
- `git-commit`

## Security Considerations

- Prefer Better Auth cookie/session flows over browser token storage.
- Do not store sensitive tokens in `localStorage`.
- Validate environment variables at startup.
- Avoid hardcoded API/auth URLs.
- Keep secrets out of frontend env vars; only expose `VITE_*` values safe for browsers.
- Defer detailed CSP, security headers, auth error flows, and permission strategy to integration/deployment planning.

## Execution And Backlog

- Execution plan: [`docs/initiatives/tasks/01-apps-web-initialization.md`](../tasks/01-apps-web-initialization.md)
- Global backlog: [`docs/TODO.md`](../../TODO.md)

## Open Questions

- Which exact Better Auth client integration pattern will be used?
- What will be the production domain topology for app/API/auth?
- Which shadcn components should be installed in the first real UI iteration?
- Which user roles/permissions model will the frontend need?
- Which backend contract strategy will be used: OpenAPI, generated client, shared schemas, or manual contracts?
