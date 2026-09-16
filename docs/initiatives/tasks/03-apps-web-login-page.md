# Apps Web Login Page Tasks

Execution checklist for [`docs/initiatives/prds/03-apps-web-login-page.md`](../prds/03-apps-web-login-page.md).

## Phase 1: Design Intake And Assets

- [ ] Inspect the Figma node and capture exact desktop measurements for page frame, brand area, card, fields, buttons, divider, typography, radii, and shadow.
- [x] Capture available Figma metadata for node `2053:202` through the Figma Desktop MCP endpoint.
- [x] Apply Figma dimensions for logo row, wrapper, inner container, inputs, buttons, divider, forgot-password area, and create-account footer.
- [ ] Export CBMPE, SAC Nexus, and gov.br assets from Figma as SVG when vector-based.
- [ ] Export any raster-only logo asset as PNG with transparency.
- [ ] Add assets to the chosen `apps/web` asset location.
- [ ] Verify asset dimensions and accessible names in the rendered UI.

## Phase 2: shadcn And Shared UI Setup

- [ ] Run `pnpm dlx shadcn@latest info` inside `apps/web` to confirm installed components and project aliases.
- [ ] Run `pnpm dlx shadcn@latest docs input field separator` before adding or using missing shadcn components.
- [ ] Add missing shadcn components with `pnpm dlx shadcn@latest add`, not by manually copying registry files.
- [ ] Review every added shadcn file for project alias correctness and local style conventions.
- [ ] Before creating any shared component, confirm it passes the reusable component checklist from the PRD.
- [x] Add a generic `PasswordInput` under `src/modules/shared/components/forms` because it is free of auth-specific copy.
- [ ] Keep `PasswordInput` composable with an accessible visibility toggle instead of adding boolean-heavy variants.
- [ ] Add or reuse input composition patterns that support field labels, descriptions, errors, and addons.
- [x] Keep product-specific branding, route paths, and auth copy out of `src/modules/shared/components/ui` and `src/modules/shared/components/forms`.

## Phase 3: Component Ownership And Folder Structure

- [ ] Classify every new component as `route-local`, `modules/auth`, or `modules/shared` before implementing it.
- [ ] Keep route files thin; they should mostly compose public module exports.
- [ ] Use `modules/auth` for authentication UX, validation, brand composition, sign-in form wiring, and gov.br copy.
- [x] Use `modules/shared/components/ui` only for shadcn/Base UI primitives that do not import auth code.
- [x] Use `modules/shared/components/forms` for reusable form controls such as `PasswordInput` and future-use `CpfEmailInput`.
- [ ] Use `modules/shared/lib` only for pure utilities that are not auth-owned.
- [x] Promote CPF helpers to categorized shared lib folders because CPF formatting and validation can be reused by other modules.
- [ ] Create the proposed auth structure when implementation begins:

```txt
apps/web/src/modules/auth/
  index.ts
  pages/
    sign-in-page.tsx
  forms/
    sign-in-form.tsx
  components/
    sign-in-composer.tsx
  schemas/
    sign-in-schema.ts
```

- [ ] Create or reuse the proposed shared UI structure only for components that pass the shared checklist:

```txt
apps/web/src/modules/shared/components/
  forms/
    cpf-email-input.tsx
    password-input.tsx
  ui/
    button.tsx
    field.tsx
    input.tsx
    input-group.tsx
    separator.tsx
apps/web/src/modules/shared/lib/
  formatters/
    format-cpf.ts
  validators/
    validate-cpf.ts
```

- [ ] Keep route imports pointed at `@/modules/auth`, not at `@/modules/auth/components/*`.
- [ ] Export only route-needed public APIs from `src/modules/auth/index.ts`.
- [ ] If a component starts auth-specific and later gets a second non-auth consumer, move it to `shared` in a dedicated refactor instead of mixing concerns immediately.

## Phase 4: Tokens And Global Styling

- [ ] Update `apps/web/src/index.css` so `--primary` is `oklch(0.4194 0.1365 277.73)`.
- [ ] Verify `--primary-foreground` has sufficient contrast against the new primary color.
- [ ] Avoid adding auth-only color tokens unless Figma exposes reusable colors that do not fit existing semantics.
- [ ] Keep component usage on semantic Tailwind classes such as `bg-primary`, `text-primary`, `border-border`, and `text-muted-foreground`.

## Phase 5: Auth Module Structure

- [ ] Create auth module internals under `apps/web/src/modules/auth` while keeping the public API in `index.ts`.
- [x] Add `SignInComposer` to group auth-specific shell, branding, card, footer, intro, and gov.br action parts behind one composer object.
- [ ] Add `SignInForm` for React Hook Form, Zod validation, and local submit handling.
- [x] Keep `CpfEmailInput` as a shared reusable form control for future CPF/email detection and CPF masking screens.
- [ ] Export only route-needed public components from `src/modules/auth/index.ts`.
- [x] Keep `SignInComposer` and `SignInForm` auth-owned during this first implementation.
- [x] Keep `CpfEmailInput` in shared because the CPF/email credential control is generic and reusable, but do not use it in the current sign-in form.
- [ ] Document any exception where a component is promoted to `shared` and why it is not auth-specific.

## Phase 6: Routing

- [ ] Add a TanStack Router file route for `/signin`.
- [ ] Compose the route from the auth module public API instead of deep-importing auth internals.
- [ ] Update the index route so `/` redirects to `/signin`.
- [ ] Add a `/forgot-password` route as a blank or minimal placeholder route.
- [ ] Add a `/signup` route as a blank or minimal placeholder route.
- [ ] Regenerate route types with `pnpm --filter web routes:generate`.
- [ ] Confirm generated route tree changes are committed only as generated output.

## Phase 7: Form UX And Validation

- [ ] Define a Zod schema for `E-mail` and `Senha`.
- [ ] Validate required email input with Brazilian Portuguese messages.
- [ ] Validate email input as email.
- [ ] Keep submit local-only and prevent API calls.
- [ ] Keep gov.br enabled but without external redirect/API behavior.
- [ ] Make the password visibility button keyboard-accessible and screen-reader-friendly.

## Phase 8: Responsive UI Implementation

- [ ] Implement the desktop centered layout from the Figma reference.
- [ ] Implement the mobile layout with a nearly full-width card and reduced outer padding.
- [ ] Confirm the page works without horizontal overflow at `320px` width.
- [ ] Preserve touch-friendly field and button sizes.
- [ ] Use `gap-*` utilities for spacing and `size-*` for equal dimensions.
- [ ] Avoid raw color utilities where semantic tokens can express the design.

## Phase 9: Documentation And Agent Guidance

- [ ] Update `docs/web/conventions.md` if the implementation creates durable form, auth, token, or component conventions.
- [ ] Update `docs/web/architecture.md` if the auth module structure becomes more specific than the current placeholder.
- [ ] Update `docs/web/testing.md` if new test placement or auth-specific testing conventions are introduced.
- [ ] Evaluate whether `src/modules/shared/components/AGENTS.md` is justified for concise reusable-component rules.
- [ ] If added, keep the local `AGENTS.md` short and limited to rules not already covered by root or `apps/web/AGENTS.md`.
- [ ] If added, make `src/modules/shared/components/AGENTS.md` explicitly say shared components must not contain business copy, route paths, auth imports, or product-specific assets.
- [ ] Avoid adding `AGENTS.md` under `modules/auth` unless auth develops local rules that differ from the app-level architecture rules.

## Phase 10: Unit And Component Tests

- [ ] Add component tests for `/signin` visible copy and form controls.
- [ ] Test password visibility toggling.
- [ ] Test email input behavior.
- [ ] Test validation messages for empty and invalid credential input.
- [ ] Test that local submit does not require or call an API mock.
- [x] Place auth tests under `tests/unit/modules/auth`, shared component tests under `tests/unit/modules/shared/components`, and shared utility tests under `tests/unit/modules/shared/lib`.
- [ ] Run `pnpm --filter web test`.

## Phase 11: E2E Tests

- [ ] Replace the current initialization e2e expectation because `/` will redirect to `/signin`.
- [ ] Add a Playwright test that opening `/` redirects to `/signin`.
- [ ] Add a Playwright test that `/signin` renders the login page.
- [ ] Add a Playwright test that `Esqueci minha senha` navigates to `/forgot-password`.
- [ ] Add a Playwright test that `Cadastre-se` navigates to `/signup`.
- [ ] Add a basic mobile viewport assertion for the `/signin` page.
- [ ] Run `pnpm --filter web test:e2e`.

## Phase 12: Verification

- [ ] Run `pnpm --filter web routes:generate`.
- [ ] Run `pnpm --filter web check`.
- [ ] Run `pnpm --filter web typecheck`.
- [ ] Run `pnpm --filter web test`.
- [ ] Run `pnpm --filter web test:e2e`.
- [ ] Run `pnpm --filter web build`.
- [ ] Manually inspect `/signin` on desktop and mobile widths.
- [ ] Confirm `opencode.json` remains untouched unless the user explicitly requests changes to it.
