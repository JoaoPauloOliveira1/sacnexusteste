# Web Conventions

This document describes the current frontend conventions for `apps/web`.

## Language

Technical artifacts are written in English:

- Code.
- File and folder names.
- Routes.
- Documentation.
- Commit and PR text.
- Agent instructions.

User-facing content is written in Brazilian Portuguese:

- Labels.
- Buttons.
- Form messages.
- Empty states.
- Validation messages shown to users.
- Page copy.

## Package Management

Use pnpm for all JavaScript package operations.

- Install dependencies with `pnpm install`.
- Add runtime dependencies with `pnpm add`.
- Add development dependencies with `pnpm add -D`.
- Run one-off CLIs with `pnpm dlx`.
- Run shadcn commands with `pnpm dlx shadcn@latest`.

Do not manually edit `package.json` to add dependencies or pin versions when pnpm or the relevant CLI can do it.

## Naming

- Folders and files use `kebab-case`.
- React components use `PascalCase`.
- Hooks start with `use`.
- Route files follow TanStack Router file-based routing conventions.
- Public module APIs are exported from `index.ts`.

## Imports

Use `@/*` for imports from `src/*`.

Allowed examples:

```ts
import { Button } from '@/modules/shared/components/ui/button'
import { env } from '@/modules/shared/config/env'
```

Business modules should not deep-import from other business modules.

Allowed between business modules:

```ts
import { somethingPublic } from '@/modules/auth'
```

Avoid between business modules:

```ts
import { internalThing } from '@/modules/auth/internal/file'
```

Biome enforces restricted imports for deep business-module imports.

## Formatting And Linting

Biome is the only formatter and linter.

Use:

- `pnpm --filter web check` to check formatting, lint rules, import organization, and Tailwind class sorting.
- `pnpm --filter web format` to apply Biome formatting and fixes.

ESLint and Prettier are not part of the current setup.

## Git Hooks And Commits

The project uses Lefthook for Git hooks.

Husky is not part of the current setup.

After the project is inside a Git repository, install hooks with:

```bash
pnpm lefthook install
```

Configured hooks:

- `pre-commit`: runs Biome on staged files and stages fixed files.
- `commit-msg`: validates Conventional Commit messages with Commitlint.
- `pre-push`: runs `pnpm check`.

Commit messages should follow Conventional Commits, for example:

```txt
feat(web): add login route shell
fix(web): handle empty session response
chore: update workspace tooling
```

## Styling

Use Tailwind CSS v4 and semantic design tokens.

Prefer:

- `bg-background`
- `text-foreground`
- `text-muted-foreground`
- `border-border`
- `bg-input-background` for input fill surfaces.
- `gap-*` for spacing between children.
- `size-*` when width and height are equal.
- `cn()` for conditional class names.
- `cursor-pointer` on clickable controls and disabled cursor styling for disabled controls.

Avoid:

- Raw color utilities for design-system components.
- `space-x-*` and `space-y-*` for layout spacing.
- Manual icon sizing inside components that already handle icon size.
- Custom styled markup when a shadcn component exists.
- Loading text changes such as `Salvar` to `Salvando...`.

## Figma-Backed Screens

Use the Figma Desktop MCP endpoints as the design source of truth when a task provides Figma links or node IDs.

- Start with `get_design_context` for implementation context when it succeeds.
- Fall back to metadata and screenshots when the full design context is too large or times out.
- Record relevant Figma node IDs in the PRD or task plan for traceability.
- Treat Figma's outer presentation canvas as non-product chrome unless product explicitly requires it.
- Implement responsive behavior even when Figma only provides desktop frames.

## Assets

Module-owned assets live in the owning module's `assets` folder when imported by React components.

Examples:

```txt
src/modules/auth/assets/sac-nexus-logo.svg
src/modules/auth/assets/signup-individual.webp
```

Use `public` only when an asset must be addressed by a stable URL without Vite import processing.

Asset format guidance:

- Use SVG for vector logos and icons.
- Use WebP for photographic card or hero images when quality and browser support are acceptable.
- Use PNG only when transparency or source constraints make it the practical raster choice.
- Avoid duplicating raster assets for visual states when CSS filters can reproduce the intended state acceptably.

## Components

shadcn/Base UI components live in `src/modules/shared/components/ui`.

Reusable shared form controls live in `src/modules/shared/components/forms`.

Business modules should use the following folders when the category exists:

- `pages`: route-level screen composition imported by route files through the module public API.
- `forms`: business form wiring, validation, and submit behavior.
- `components`: domain-specific presentational components.
- `schemas`: Zod schemas owned by the module.
- `assets`: module-owned images or static imports.
- `lib`: module-owned utilities that should not be shared yet.

Use categorized shared utility folders when the utility type is clear:

- `src/modules/shared/lib/validators`: validation and detection helpers, using `validate-*` filenames such as `validate-cpf.ts`.
- `src/modules/shared/lib/formatters`: formatting and masking helpers, using `format-*` filenames such as `format-cpf.ts`.

Use `src/modules/shared/lib` root only for generic utilities that do not fit a clearer category.

Use the narrowest owner first. Promote to shared only when a component or utility is generic, has no route paths, has no business copy, has no product-specific assets, and has a plausible second consumer.

Prefer composition over boolean prop proliferation. If a reusable component starts gaining many mode flags, split it into explicit variants or compose it with child components.

Use shadcn components as source code and review generated components after adding them.

## Auth Journeys

Authentication and signup journey shells should start inside `src/modules/auth/components`.

- Use auth-owned composer components for repeated auth journey regions such as back navigation, central content, and sign-in footer.
- Keep route files thin and import route-level auth pages from `@/modules/auth`.
- Keep signup and auth assets in `src/modules/auth/assets` unless they become genuinely shared product assets.
- Do not move auth journey components to `shared` while they contain auth copy, route targets, product-specific assets, or flow decisions.
- Prefer explicit route targets for auth navigation over browser history when the destination must be predictable.

## Loading Buttons

Use the shared `Button` `isLoading` prop for button loading states.

- Loading buttons keep the same user-facing label.
- Loading buttons render a spinner beside the label.
- Loading buttons are disabled while loading.
- Buttons that can enter loading should reserve spinner space before loading starts to avoid layout shift.
- Do not create separate loading copy such as `Entrando...`, `Salvando...`, or `Enviando...` unless a product requirement explicitly overrides this convention.
