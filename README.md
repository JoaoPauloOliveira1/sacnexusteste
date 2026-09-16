<p align="center">
  <a href="https://github.com/corvi/sac-nexus"><img src="docs/assets/logo.webp" alt="SAC Nexus" width="400"></a>
</p>
<p align="center">
  <em>Corvi's way to build scalable, maintainable, testable, and production-ready customer service applications</em>
</p>
<p align="center">
  <a href="https://nodejs.org/" target="_blank">
    <img src="https://img.shields.io/badge/Node.js-26.0.0+-green.svg" alt="Supported Node.js versions">
  </a>
  <a href="https://pnpm.io/" target="_blank">
    <img src="https://img.shields.io/badge/pnpm-10.33.3-orange.svg" alt="pnpm version">
  </a>
  <a href="https://react.dev/" target="_blank">
    <img src="https://img.shields.io/badge/React-19-blue.svg" alt="React version">
  </a>
  <a href="https://turbo.build/repo" target="_blank">
    <img src="https://img.shields.io/badge/Turborepo-2.9-black.svg" alt="Turborepo version">
  </a>
</p>

---

## Requirements

This project stands on the shoulders of giants:

- **[pnpm](https://pnpm.io/)** for JavaScript package management.
- **[Turborepo](https://turbo.build/repo)** for monorepo task orchestration and caching.
- **[Vite](https://vite.dev/)** for the frontend build tool.
- **[React](https://react.dev/)** for the UI layer.
- **[TanStack Router](https://tanstack.com/router)** for type-safe client-side routing.
- **[TanStack Query](https://tanstack.com/query)** for server state management.
- **[Tailwind CSS](https://tailwindcss.com/)** and **[shadcn/ui](https://ui.shadcn.com/)** for styling and UI primitives.
- **[Biome](https://biomejs.dev/)** for formatting, linting, import organization, and code quality checks.

## Quick Start

### Prerequisites

Before running the project, you'll need to set up a few things.

#### 1. Install Node.js 26+

We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions:

```bash
nvm install node
nvm use node
```

This repository currently records Node.js `26.0.0` in `.node-version`.

#### 2. Enable Corepack and pnpm

pnpm is managed through Corepack:

```bash
corepack enable
corepack use pnpm@latest
```

Always use pnpm for package operations:

- `pnpm install` to install dependencies.
- `pnpm add` to add runtime dependencies.
- `pnpm add -D` to add development dependencies.
- `pnpm dlx` for one-off CLIs.

Do not manually edit `package.json` to add dependencies or pin versions when pnpm or the relevant CLI can do it.

#### 3. Environment Variables

The frontend has an example environment file at `apps/web/.env.example`.

Copy it when local overrides are needed:

```bash
cp apps/web/.env.example apps/web/.env
```

Current public frontend variables:

```env
VITE_API_URL=/api
VITE_AUTH_URL=/api/auth
VITE_APP_NAME="SAC Nexus"
VITE_APP_ENV=local
VITE_ENABLE_MSW=false
VITE_GOOGLE_MAPS_API_KEY=
```

Frontend environment variables are validated with Zod in `apps/web/src/modules/shared/config/env.ts`.

`VITE_GOOGLE_MAPS_API_KEY` is optional and only used for Google Street View imagery in the operational map.

#### 4. Git Hooks

This repository uses **Lefthook** for Git hooks and **Commitlint** for Conventional Commits validation.

Husky is not used.

After the project is inside a Git repository, install the hooks with:

```bash
pnpm lefthook install
```

Configured hooks:

- `pre-commit`: runs Biome on staged files.
- `commit-msg`: validates Conventional Commit messages with Commitlint.
- `pre-push`: runs `pnpm check`.

### Running the Project

#### 1. Install dependencies

```bash
pnpm install
```

#### 2. Start the frontend development server

```bash
pnpm --filter web dev
```

The web app will be available at `http://localhost:5173`.

#### 3. Run quality checks

```bash
pnpm check
pnpm typecheck
pnpm test
pnpm build
```

#### 4. Run end-to-end tests

```bash
pnpm --filter web test:e2e
```

## Monorepo Commands

- Start development tasks: `pnpm dev`
- Build all packages: `pnpm build`
- Check formatting and lint rules: `pnpm check`
- Run typecheck: `pnpm typecheck`
- Run unit/component tests: `pnpm test`

## Project Structure

```txt
apps/
  web/                  React SPA frontend
  idp/                  Fastify identity provider
docs/
  web/                  Durable frontend documentation
  idp/                  Durable identity-provider documentation
  initiatives/
    prds/                Initiative requirements and decisions
    tasks/               Initiative execution plans
    sources/             Optional source handoffs
    templates/           PRD and plan templates
```

The current frontend source is organized under `apps/web/src/modules`.

## Documentation

- Web architecture: `docs/web/architecture.md`
- Web conventions: `docs/web/conventions.md`
- Web testing: `docs/web/testing.md`
- Web security: `docs/web/security.md`
- IDP architecture: `docs/idp/architecture.md`
- Initiative workflow: `docs/initiatives/README.md`
- Agentic workflow architecture: `docs/agentic-workflows.md`

## Next Steps

- Read the [web architecture guide](docs/web/architecture.md) to understand the current frontend structure.
- Read the [web conventions guide](docs/web/conventions.md) before adding new modules or components.
- Read the [web testing guide](docs/web/testing.md) before adding tests.
- Read the [web security guide](docs/web/security.md) before integrating authentication or APIs.

---

## About Corvi

This project is maintained by **Corvi** to standardize internal application development. We use this foundation to ensure consistency, quality, maintainability, and scalability across our products.

---

**Built with ❤️ by the Corvi team**
