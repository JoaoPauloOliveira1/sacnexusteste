# Web App Agent Instructions

## Stack

- Vite React SPA with TypeScript.
- TanStack Router uses file-based routing under `src/routes`.
- TanStack Query is the server-state layer.
- `ky` is the HTTP client.
- `zod` validates env and future contracts.
- React Hook Form with Zod is the form standard for business forms.
- shadcn/ui uses Base UI primitives and lucide icons.
- Tailwind CSS v4 is the styling system.
- Biome is the only formatter/linter/import organizer.

## Architecture

- Main code lives under `src/modules/*`.
- `src/modules/shared/*` can be imported directly.
- Business modules must expose public APIs through `index.ts`.
- Do not deep-import from other business modules.
- Use relative imports inside the same module when accessing internals.
- shadcn components live in `src/modules/shared/components/ui`.
- Reusable shared form controls live in `src/modules/shared/components/forms`.
- Generic shared utilities live in `src/modules/shared/lib`.
- Shared validators live in `src/modules/shared/lib/validators` and use `validate-*` filenames.
- Shared formatters and masks live in `src/modules/shared/lib/formatters` and use `format-*` filenames.
- Business modules use `pages`, `forms`, `components`, `schemas`, `assets`, and `lib` folders when those categories exist.
- Route files should stay thin and import business screens from the module public API.
- Define business modules by owned entities and lifecycles, not by dashboard
  sections, risk outcomes, or a single user journey. Risk classifications such
  as Risco 1 remain domain values and documented flows, not source folders,
  provider names, or component namespaces.
- `companies` owns company entities and registration; `processes` owns request,
  classification, transition, and completed-process behavior.
- `documents` owns contributor document collection views, and `notifications`
  owns contributor notification collection views. Route-level adapters may
  project presentation records from `processes` until business APIs own these
  collections.

## Routing

- Route files, URL path segments, route parameters, and search-parameter keys
  are named in English.
- User-facing route content is Brazilian Portuguese.
- Validate meaningful search params with Zod.
- Use route context for shared dependencies such as Query Client.

## Figma And Design Intake

- Use Figma Desktop MCP context before implementing Figma-backed screens when links or node IDs are available.
- If full design context times out, use screenshots and metadata for planning, then retry smaller nodes during implementation when exact styles are needed.
- Record durable design decisions in `docs/initiatives/prds`,
  `docs/initiatives/tasks`, or `docs/web` instead of burying them in component
  comments.
- Export photographic screen assets as WebP when practical and keep module-owned assets under the owning module's `assets` folder.

## UI

- Prefer shadcn components before custom markup.
- Use semantic tokens such as `bg-background` and `text-muted-foreground`.
- Use `bg-input-background` for input surfaces that should match Figma input fills.
- Use `gap-*`, not `space-x-*` or `space-y-*`.
- Use `size-*` when width and height are equal.
- Use `cn()` for conditional classes.
- Prefer composition over boolean prop proliferation.
- Use the local `.agents/skills/vercel-composition-patterns` guidance when building or refactoring multi-part React UI.
- Group tightly coupled private layout pieces behind a small composer or compound component instead of leaving many one-off sibling files in `components/`.
- Prefer Tailwind scale utilities over arbitrary values whenever the value can be represented, including decimal scale utilities such as `h-129.5` for `518px`, `max-w-112` for `448px`, and `size-17.5` for `70px`.
- Use arbitrary values only when the Tailwind scale cannot express the design token or when preserving generated shadcn internals; add a short reason if the choice is not obvious.
- Clickable controls must visually communicate clickability with `cursor-pointer`; disabled controls should use a disabled cursor style and must not be clickable.
- Button loading states must use the shared `Button` `isLoading` prop so the button is disabled, shows a spinner, keeps the original label text, and reserves spinner space to avoid layout shift.
- Do not change labels for loading states, such as `Salvar` to `Salvando...`; keep the label and add the spinner beside it.
- Start components in the narrowest owner. Move to shared only when the API is generic and free of business copy, route paths, and product-specific assets.

## Runtime Config And Deployment

- Containerized production builds should serve the SPA through Nginx non-root.
- Deploy-specific public config should be loaded at runtime from `/config.json`.
- Validate runtime config with Zod before using values that affect API/auth clients.
- Keep `/config.json` limited to public browser-safe values.
- Do not place secrets, tokens, private keys, or privileged URLs in frontend env vars or runtime config.
- Prefer environment-agnostic Docker images that can be promoted by digest between develop, staging, and production.

## CI/CD

- Use GitHub Actions, pnpm, and Turborepo for web CI/CD automation.
- Target `apps/web/**` plus root build/config files when filtering web workflows.
- Use shared gate names in `snake_case`: `web_quality`, `web_security`, `web_package`, `web_deploy_<env>`, and `web_rollback_production`.
- Use `pnpm turbo run <task> --filter=web` in CI instead of direct package-manager task calls.
- Required gates include Biome check, typecheck, Vitest unit/component coverage, build, dependency audit, and Docker image scan.
- Keep E2E tests out of the required gate until the CI/CD plan explicitly promotes them.
- PRs targeting `staging` should deploy to the shared `develop` environment.
- Production deployments run automatically after `main` gates pass.
- Keep Dokploy variables and secrets app-scoped, such as `WEB_DEVELOP_URL` and `DOKPLOY_WEB_DEVELOP_WEBHOOK_URL`.
- Web post-deploy smoke checks are deferred; add them in a future task for `/config.json` and the SPA entry route.

## Useful Local Skills

- `sac-nexus-architecture`
- `sac-nexus-initiative-workflow`
- `sac-nexus-web-development`
- `sac-nexus-preflight-review`
- `sac-nexus-pr-review-triage`
- `shadcn`
- `tailwind-css-patterns`
- `tanstack-query-best-practices`
- `tanstack-router-best-practices`
- `turborepo`
- `vercel-composition-patterns`
- `github-actions-docs`
- `ci-cd-and-automation`
