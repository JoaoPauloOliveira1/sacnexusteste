# Apps Web Signup Hub Tasks

Execution checklist for [`docs/initiatives/prds/04-apps-web-signup-hub.md`](../prds/04-apps-web-signup-hub.md).

## Phase 1: Design Intake And Assets

- [x] Capture Figma screenshots for default node `1:413` through the Figma Desktop MCP endpoint.
- [x] Capture Figma screenshots for hover node `1:457` through the Figma Desktop MCP endpoint.
- [x] Capture Figma metadata for default node `1:413` through the Figma Desktop MCP endpoint.
- [x] Capture Figma metadata for hover node `1:457` through the Figma Desktop MCP endpoint.
- [ ] Retry `get_design_context` for the main frame or smaller child nodes before implementation if exact generated style metadata is needed.
- [x] Export the individual signup image as WebP from Figma.
- [x] Export the company signup image as WebP from Figma.
- [x] Export the technical responsible signup image as WebP from Figma.
- [x] Add exported files to `apps/web/src/modules/auth/assets`.
- [x] Confirm image crops match the Figma card image areas.
- [x] Confirm WebP file sizes are reasonable for a public auth entry page.
- [x] Use controlled visual placeholders until final WebP exports are available.
- [x] Define final Portuguese `alt` text for each image.

## Phase 2: Routing

- [x] Keep `apps/web/src/routes/signup.tsx` thin and render signup child routes through an `Outlet`.
- [x] Create `apps/web/src/routes/signup/index.tsx` to render the auth module public `SignupHubPage` export for `/signup`.
- [x] Create `apps/web/src/routes/signup/individual.tsx` as a placeholder route for `/signup/individual`.
- [x] Create `apps/web/src/routes/signup/company.tsx` as a placeholder route for `/signup/company`.
- [x] Create `apps/web/src/routes/signup/technical-responsible.tsx` as a placeholder route for `/signup/technical-responsible`.
- [x] Make placeholder routes clearly non-final without implementing wizard UI.
- [x] Regenerate route types with `pnpm --filter web routes:generate`.
- [x] Do not manually edit `apps/web/src/routeTree.gen.ts`.

## Phase 3: Auth Module Component Structure

- [x] Create `apps/web/src/modules/auth/pages/signup-hub-page.tsx`.
- [x] Create `apps/web/src/modules/auth/components/signup-layout-composer.tsx` for shared signup layout regions.
- [x] Create `apps/web/src/modules/auth/components/signup-type-card.tsx`.
- [x] Export `SignupHubPage` from `apps/web/src/modules/auth/index.ts`.
- [x] Keep card data close to `SignupHubPage` unless a second consumer appears.
- [x] Keep all signup hub components auth-owned because they contain auth copy, auth route targets, and auth assets.
- [x] Do not add signup hub components to `modules/shared` in this feature.

## Phase 4: Signup Journey Layout

- [x] Implement a full-viewport desktop shell with `min-h-svh`, `bg-background`, and `text-foreground`.
- [x] Add a top-left `Voltar` link that navigates to `/signin`.
- [x] Add a central content region for the hub title and cards.
- [x] Add a bottom footer with `Já tem uma conta? Entrar`, where `Entrar` links to `/signin`.
- [x] Keep the journey shell flexible enough for the future wizard to reuse top, main, and footer regions.
- [x] Avoid hardcoding wizard-specific back behavior into the hub layout.
- [x] Use composition or explicit parts instead of boolean-heavy layout props.

## Phase 5: Signup Type Cards

- [x] Implement each card as a full-card TanStack Router `Link`.
- [x] Avoid nested interactive controls inside cards.
- [x] Render the image, title, and description inside each card.
- [x] Apply grayscale to all image surfaces by default.
- [x] Remove grayscale on `hover` and `focus-visible` for the active card.
- [x] Add a visible `focus-visible` treatment to the full card.
- [x] Add `cursor-pointer` to clickable cards.
- [x] Preserve card dimensions and image/text proportions close to Figma on desktop.
- [x] Use responsive sizing so cards remain usable on mobile.
- [x] Avoid raw color utilities where semantic tokens are sufficient.

## Phase 6: Responsive Behavior

- [x] Implement desktop layout with three cards in one row.
- [x] Implement mobile layout with one card per row and natural vertical scroll.
- [x] Preserve vertical card structure on mobile instead of converting to thumbnail list items.
- [x] Confirm no horizontal overflow at `320px` width.
- [x] Confirm footer appears after cards on short mobile screens rather than overlapping content.
- [x] Confirm desktop footer remains visually near the bottom of the viewport.
- [x] Add at least one mobile viewport e2e assertion.

## Phase 7: Accessibility

- [x] Ensure `Voltar` is a semantic link with accessible text.
- [x] Ensure each signup card is discoverable by role `link` and an accessible name from visible copy.
- [x] Ensure `Entrar` is a semantic link with accessible text.
- [x] Ensure keyboard tab order is logical.
- [x] Ensure keyboard focus triggers an equivalent visual image-color affordance to hover.
- [x] Ensure image `alt` text is descriptive and not redundant.
- [x] Respect reduced-motion preferences if transitions become non-trivial.

## Phase 8: Unit And Component Tests

- [x] Add a component test for `SignupHubPage` visible title and footer copy.
- [x] Assert the `Pessoa Física` card is a link to `/signup/individual`.
- [x] Assert the `Empresa / CNPJ` card is a link to `/signup/company`.
- [x] Assert the `Responsável Técnico` card is a link to `/signup/technical-responsible`.
- [x] Assert `Voltar` links to `/signin`.
- [x] Assert `Entrar` links to `/signin`.
- [x] Prefer semantic queries such as `getByRole('link', { name: /pessoa física/i })`.
- [x] Run `pnpm --filter web test`.

## Phase 9: E2E Tests

- [x] Add or extend an auth Playwright spec for `/signup`.
- [x] Assert `/signup` renders the hub title and three signup options.
- [x] Assert clicking `Pessoa Física` navigates to `/signup/individual`.
- [x] Assert clicking `Empresa / CNPJ` navigates to `/signup/company`.
- [x] Assert clicking `Responsável Técnico` navigates to `/signup/technical-responsible`.
- [x] Assert clicking `Voltar` navigates to `/signin`.
- [x] Assert clicking footer `Entrar` navigates to `/signin`.
- [x] Add a mobile viewport smoke test for the stacked-card layout.
- [x] Run `pnpm --filter web test:e2e`.

## Phase 10: Documentation And Agent Guidance

- [x] Create this task plan under `docs/initiatives/tasks`.
- [x] Create the linked PRD under `docs/initiatives/prds`.
- [x] Update durable web conventions if the feature introduces reusable Figma, asset, auth journey, or card-link guidance.
- [x] Update web architecture docs if the current route/module documentation is outdated.
- [x] Update app agent guidance if Figma-backed implementation rules should be durable for future agents.
- [x] Update `apps/web/README.md` only if the implementation changes setup, commands, or high-level source structure.
- [x] Avoid adding a deeper `AGENTS.md` unless a folder needs local rules not already covered by root, docs, or app guidance.

## Phase 11: Verification

- [x] Run `pnpm --filter web routes:generate`.
- [x] Run `pnpm --filter web check`.
- [x] Run `pnpm --filter web typecheck`.
- [x] Run `pnpm --filter web test`.
- [x] Run `pnpm --filter web test:e2e`.
- [x] Run `pnpm --filter web build`.
- [ ] Manually inspect `/signup` on desktop and mobile widths.
- [x] Confirm docs and route links remain accurate after implementation.
