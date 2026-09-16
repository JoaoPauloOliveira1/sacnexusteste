# Apps Web Signup Hub PRD

## Overview

This document defines the `/signup` routing hub for `apps/web`.

The feature introduces a responsive signup type selection page where users choose between individual, company, and technical responsible registration flows. It does not implement the registration wizard, forms, API integration, or persistence in this phase.

Execution plan: [`docs/initiatives/tasks/04-apps-web-signup-hub.md`](../tasks/04-apps-web-signup-hub.md).

## Product Context

SAC Nexus needs a clear account creation entry point before users enter a registration wizard. The hub answers one question: which type of signup does the user want to start?

The provided Figma references contain:

- User-facing title: `Como deseja se cadastrar?`.
- Top-left navigation action: `Voltar`.
- Footer copy and sign-in action: `Já tem uma conta? Entrar`.
- Three option cards with image, title, and description.
- Default image treatment in grayscale.
- Hover state where the active card image becomes colored and the card gains visual emphasis.

## Figma Source

Primary Figma nodes:

- Default state: `https://www.figma.com/design/ImYrTidtXxqYGw2RUyOOMm/SACNexus---Desenvolvimento?node-id=1-413&m=dev`.
- Hover state: `https://www.figma.com/design/ImYrTidtXxqYGw2RUyOOMm/SACNexus---Desenvolvimento?node-id=1-457&m=dev`.

Figma MCP intake status:

- Screenshots were captured for both nodes through the Figma Desktop MCP endpoint.
- Metadata was captured for both nodes through the Figma Desktop MCP endpoint.
- Full `get_design_context` calls timed out during planning, so implementation should retry that endpoint before visual implementation if exact style metadata is needed.

Important measurements from metadata and screenshot review:

- Frame: `1440px` by `842px`.
- Back action: positioned around `64px` from the left and `88px` from the top.
- Footer area: centered around `730px` from the top, with a `448px` wide text container.
- Main card group: `1093px` by `448px`, positioned around `174px` from the left and `228px` from the top.
- Card size: `343px` by `416px`.
- Image area height: `296px`.
- Text area height: `120px` with `24px` horizontal padding.
- Desktop card gap from metadata: approximately `16px` inside each card group and `16px` to the group edges, with cards laid out across the `1093px` container.

## Goals

- Implement `/signup` as the canonical signup routing hub.
- Let the user choose one of three signup types: individual, company, and technical responsible.
- Navigate to type-specific wizard placeholder routes.
- Preserve user-facing UI copy in Brazilian Portuguese.
- Keep route paths, filenames, components, and documentation in English.
- Match the desktop Figma reference closely enough for visual QA.
- Provide a mobile layout even though no mobile Figma frame exists.
- Keep the page free of API integration and signup wizard form behavior.
- Cover the page with unit/component tests and Playwright e2e tests.

## Non-Goals

- No real registration wizard implementation.
- No API calls.
- No form fields.
- No form validation.
- No account creation.
- No persistence of user input.
- No Zustand store for the hub.
- No saved draft or resume-later behavior.
- No backend contract definition.
- No design-system extraction beyond what this screen needs.

## Decisions

### Routing

- `/signup` is the routing hub.
- The hub navigates to placeholder wizard routes by signup type.
- Type routes are:
- `/signup/individual` for `Pessoa Física`.
- `/signup/company` for `Empresa / CNPJ`.
- `/signup/technical-responsible` for `Responsável Técnico`.
- Route paths and code use English naming.
- UI labels remain in Brazilian Portuguese.
- The future wizard routing strategy was later revisited in [`05-apps-web-individual-signup-wizard.md`](05-apps-web-individual-signup-wizard.md), which stores the individual wizard step in the `step` search param.

### Hub State

- The hub has no selected card state.
- Cards only have visual states: default, hover, focus-visible, and active/pressed.
- Refreshing `/signup` always renders the default neutral state.
- Zustand is not used in the hub.
- Zustand may be evaluated for the future wizard only if there is a real cross-step or persistence requirement.

### Navigation Behavior

- `Voltar` on `/signup` navigates explicitly to `/signin`.
- `Entrar` in the footer navigates explicitly to `/signin`.
- The hub should not use browser history for `Voltar`, because direct visits to `/signup` should still have predictable behavior.
- Future wizard back behavior should be contextual: first step returns to `/signup`, later steps return to the previous wizard step.

### Visual Behavior

- All card images render grayscale by default.
- The hovered or keyboard-focused card image becomes colored.
- Only the active card receives hover emphasis.
- The image color change should be implemented with CSS filter behavior using one color WebP asset per card unless visual QA requires separate grayscale assets.
- The card receives pointer and focus affordances because the whole card is clickable.

### Responsive Behavior

- Desktop and larger tablet layouts use a full-viewport composition with the main content visually centered and the footer near the bottom of the viewport.
- Mobile layouts use natural vertical scrolling.
- Mobile cards remain vertical with large images, stacked in one column.
- The mobile layout should not compress the three options into a dense horizontal or thumbnail list.
- The page must avoid horizontal overflow at `320px` width.

### Component Architecture

Use auth-owned composition instead of shared abstractions in this phase.

Planned source structure:

```txt
apps/web/src/modules/auth/
  pages/
    signup-hub-page.tsx
  components/
    signup-layout-composer.tsx
    signup-type-card.tsx
  assets/
    signup-individual.webp
    signup-company.webp
    signup-technical-responsible.webp
apps/web/src/routes/
  signup.tsx
  signup/
    index.tsx
    individual.tsx
    company.tsx
    technical-responsible.tsx
```

Component responsibilities:

- `SignupHubPage`: route-level page composition exported through `@/modules/auth`.
- `SignupLayout`: auth-specific signup shell that owns repeated layout regions such as back navigation, central content, card surfaces, footer, and sign-in prompt treatment across signup flows.
- `SignupTypeCard`: auth-specific clickable option card with image, title, description, and route target.

Do not move these components to `modules/shared` now. They contain auth-specific copy, route decisions, and product assets. Move to shared only through a later refactor with evidence of generic reuse.

### Assets

- Export card photos as WebP.
- Use one color WebP per card.
- Keep assets in `src/modules/auth/assets` because they are imported by auth-specific React components.
- Do not put these assets in `public` unless a future requirement needs stable URL access without Vite import processing.
- Suggested filenames:
- `signup-individual.webp`.
- `signup-company.webp`.
- `signup-technical-responsible.webp`.
- Export images large enough for the desktop card image area, and prefer retina-size exports when visual QA requires extra sharpness.
- Use Portuguese `alt` text that describes the card image without saying `imagem de`.

### Accessibility

- Each card is one accessible TanStack Router `Link`.
- Do not place a nested button inside the card.
- The accessible link name should include enough visible text to distinguish the destination.
- `focus-visible` must provide a clear ring or outline.
- The color transition cannot be the only keyboard feedback; focus treatment must also be visible.
- Pointer affordance must be explicit with `cursor-pointer`.
- Links should be reachable in a logical tab order: back action, signup options, footer sign-in action.

## Requirements

### Functional Requirements

- Opening `/signup` renders the signup hub page.
- The page shows the title `Como deseja se cadastrar?`.
- The page shows the three signup options:
- `Pessoa Física` with description `Para solicitar em nome próprio ou imóvel pessoal`.
- `Empresa / CNPJ` with description `Para representar empresa, comércio ou estabelecimento`.
- `Responsável Técnico` with description `Engenheiro, arquiteto ou procurador`.
- Clicking `Pessoa Física` navigates to `/signup/individual`.
- Clicking `Empresa / CNPJ` navigates to `/signup/company`.
- Clicking `Responsável Técnico` navigates to `/signup/technical-responsible`.
- The three target routes exist as placeholders in this phase.
- `Voltar` navigates to `/signin`.
- `Entrar` navigates to `/signin`.

### Technical Requirements

- Route files stay thin and import page components from `@/modules/auth`.
- `src/routeTree.gen.ts` is generated, not manually edited.
- Use Tailwind CSS v4 semantic tokens where possible.
- Use `gap-*` for spacing and `size-*` when dimensions are equal.
- Use `cn()` for conditional classes if class names become stateful.
- Avoid adding dependencies.
- Avoid Zustand for this feature.
- Use React 19-compatible component patterns.

### Testing Requirements

- Add unit/component tests for rendering visible copy and accessible links.
- Assert each card points to the correct route.
- Assert `Voltar` and `Entrar` point to `/signin`.
- Add Playwright e2e coverage for `/signup`.
- Add Playwright navigation checks for at least one card and the sign-in links.
- Add a mobile viewport e2e assertion that the page renders without horizontal overflow and keeps cards usable.

## Risks

- Full Figma `get_design_context` timed out during planning, so exact style extraction may require a retry during implementation.
- CSS grayscale may not match a hand-tuned Figma grayscale export exactly. If visual QA rejects the CSS output, separate grayscale assets may be needed.
- Placeholder wizard routes may look like unfinished product pages if reached outside tests. The placeholder copy should make the scope clear without introducing wizard UI.
- The individual wizard routing risk was resolved in [`05-apps-web-individual-signup-wizard.md`](05-apps-web-individual-signup-wizard.md) by using direct step URLs through the `step` search param.

## Acceptance Criteria

- `/signup` matches the Figma desktop composition within reasonable Tailwind implementation constraints.
- The page is usable at mobile widths down to `320px` without horizontal overflow.
- All cards are grayscale by default and become colored on hover and keyboard focus.
- All clickable controls are keyboard reachable and have visible focus states.
- Card links navigate to `/signup/individual`, `/signup/company`, and `/signup/technical-responsible`.
- Back and footer sign-in links navigate to `/signin`.
- The hub does not use Zustand or browser persistence.
- Unit/component tests pass.
- Playwright e2e tests pass.
- `pnpm --filter web check`, `pnpm --filter web typecheck`, and `pnpm --filter web build` pass.

## Future Enhancements

- Implement actual signup wizards for company and technical responsible flows.
- Reuse the individual wizard decision of React Hook Form plus non-PII `sessionStorage` draft persistence only when it fits future flows.
- Add a resume-later strategy only after product and security review.
- Add analytics events for signup type selection.
- Consider installing an accessibility skill such as `addyosmani/web-quality-skills@accessibility` before deeper auth flow implementation.
- Consider installing a React Testing Library skill if component test patterns become more complex.

## Open Questions

- Should placeholder wizard routes render a shared signup journey shell now, or remain minimal route placeholders until wizard implementation begins?
- Will final exported WebP assets match the Figma crop exactly, or should implementation include object-position tuning per card?
