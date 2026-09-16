# Component Inventory

## Application Packages

- `apps/web` - Vite React SPA for sign-in, signup, runtime config, and auth/onboarding UI.
- `apps/idp` - Fastify identity provider service for auth, sessions, email verification, password reset/change, database persistence, and operational endpoints.

## Infrastructure Packages

- `.github/workflows` - CI/CD workflow definitions for web and IDP.
- `.github/actions` - Shared GitHub Actions for Node/pnpm setup, workspace-change detection, and Dokploy triggers.
- `apps/web/Dockerfile` - Web image build and Nginx runtime packaging.
- `apps/idp/Dockerfile` - IDP image build and Node runtime packaging.
- `apps/web/compose.yml` - Web Dokploy/Compose runtime definition.
- `apps/idp/compose.yml` - IDP Dokploy/Compose runtime definition.

## Shared Packages

- No active `packages/*` shared package was detected.
- Shared code currently exists inside each app, especially `apps/web/src/modules/shared`.

## Test Packages

- `apps/web/tests` - Vitest unit/component tests, MSW setup, and Playwright E2E tests.
- `apps/idp/tests` - Vitest unit tests and environment setup.

## Total Count

- **Total Active Workspaces**: 2
- **Application**: 2
- **Infrastructure/Automation Areas**: 4
- **Shared Packages**: 0 active workspace packages
- **Test Areas**: 2
