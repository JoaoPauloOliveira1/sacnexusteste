# Technology Stack

## Programming Languages

- TypeScript - Primary language for web and IDP application code.
- JavaScript - Tooling/config ecosystem and compiled runtime output where applicable.
- SQL - Drizzle-generated PostgreSQL migrations.
- Shell - Web runtime config generation script.
- Markdown - Project, durable, and AI-DLC documentation.

## Frameworks

- React 19 - Web UI rendering.
- Vite 8 - Web development server and build tool.
- Fastify - IDP HTTP API framework.
- Better Auth - IDP authentication, sessions, verification, and password reset/change internals.
- Drizzle ORM - IDP database schema and PostgreSQL query layer.
- TanStack Router - Web file-based routing and route search validation.
- TanStack Query - Web server-state foundation.
- React Hook Form - Web form state and validation flow.
- Zod - Runtime validation for web schemas and IDP config.
- Tailwind CSS v4 - Web styling system.
- React Email - IDP transactional email templates.

## Infrastructure

- PostgreSQL - IDP identity persistence.
- Resend - Transactional auth email provider.
- Docker - Web and IDP container packaging.
- Nginx unprivileged image - Web static runtime.
- GHCR - Container image registry.
- Dokploy - Deployment target triggered through webhooks.
- GitHub Actions - CI/CD automation.

## Build Tools

- pnpm 10.33.3 - Package manager.
- Turborepo - Monorepo task orchestration and caching.
- TypeScript compiler - Typechecking and IDP build output.
- tsc-alias - IDP path alias rewrite after build.
- TanStack Router CLI - Route tree generation.
- Corepack - Package manager activation in CI and Docker builds.

## Testing Tools

- Vitest - Web and IDP unit/component tests.
- V8 coverage provider - Coverage reporting.
- React Testing Library - Web component tests.
- jsdom - Web test DOM environment.
- MSW - Web API mocking setup.
- Playwright - Web end-to-end tests.
- Trivy - Container vulnerability scanning in CI/CD.
- pnpm audit - Dependency security gate.

## Quality Tools

- Biome - Formatting, linting, import organization, and Tailwind class sorting.
- Lefthook - Local pre-commit, commit-msg, and pre-push hooks.
- Commitlint - Conventional commit validation.
