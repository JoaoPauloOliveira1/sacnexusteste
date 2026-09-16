# Apps Web Login Page PRD

## Overview

This document defines the first login page for `apps/web`.

The feature introduces a responsive `/signin` route that matches the provided desktop design, supports local form UX, and avoids real authentication or API integration in this phase. It also creates blank `/forgot-password` and `/signup` routes so secondary auth links can navigate through TanStack Router without pointing to missing routes.

Execution plan: [`docs/initiatives/tasks/03-apps-web-login-page.md`](../tasks/03-apps-web-login-page.md).

## Product Context

SAC Nexus needs an initial authentication entry point for users of Corpo de Bombeiros Militar de Pernambuco. The login UI must be credible enough to become the base for future authentication integration while remaining intentionally disconnected from API behavior for this first implementation.

The provided desktop reference contains:

- CBMPE and SAC Nexus branding.
- Instructional copy: `Entre com suas credenciais para acessar o sistema SAC Nexus`.
- Credential form with `E-mail` and `Senha` fields.
- Primary submit action: `Entrar`.
- Alternative gov.br action: `Entrar com gov.br`.
- Recovery link: `Esqueci minha senha`.

## Goals

- Add `/signin` as the canonical login route.
- Redirect `/` to `/signin`.
- Add `/forgot-password` as a blank or minimal route target for the recovery link.
- Add `/signup` as a blank or minimal route target for the create-account link.
- Implement the login page UI without real authentication or API calls.
- Preserve user-facing copy in Brazilian Portuguese.
- Use the product primary token as `oklch(0.4194 0.1365 277.73)`.
- Export Figma assets as SVG when they are vector assets, and PNG only when an asset is raster-only.
- Keep the mobile version usable with a full-width card layout because only the desktop design is available.
- Include local UX behavior for form inputs, validation, CPF masking, and password visibility.
- Use small, composable components that can scale into future auth flows.
- Cover the page with unit/component tests and basic Playwright e2e tests.

## Non-Goals

- No real sign-in request.
- No session creation.
- No Better Auth integration.
- No gov.br OAuth redirect or callback handling.
- No forgot-password business flow beyond route availability.
- No signup business flow beyond route availability.
- No dashboard redirect after successful sign-in.
- No backend contract definition.
- No broad design-system redesign beyond tokens and components required by this screen.

## Decisions

### Routing

- `/signin` is the canonical route for the login page.
- `/` redirects to `/signin`.
- `/forgot-password` must exist because the recovery link should navigate through TanStack Router.
- `/signup` must exist because the create-account link should navigate through TanStack Router.
- Route filenames and route paths remain in English.
- User-facing labels and validation messages remain in Brazilian Portuguese.

### Behavior Scope

- The page is not static-only. It includes local microinteractions that improve UX and are independent from backend integration.
- The password field can toggle between hidden and visible text.
- The sign-in credential field accepts email only in the current design.
- CPF/email shared helpers and `CpfEmailInput` remain available for future forms, but are not part of the current sign-in form.
- Submit validates fields locally but does not call an API.
- gov.br remains an enabled button with no external action in this phase.
- Recovery link navigates to `/forgot-password`.
- Create-account link navigates to `/signup`.

### Validation

- Use React Hook Form with Zod for the sign-in form.
- Validate required `E-mail` and `Senha` fields.
- Validate email shape for email input.
- Show user-facing validation messages in Brazilian Portuguese.
- Keep business validation reusable but do not over-abstract before there is a second consumer.

### Component Architecture

Use composition and explicit components instead of boolean-heavy components.

Recommended component split:

- `SignInPage`: route-level page composition that assembles branding, card, and form.
- `SignInComposer`: auth-specific compound/composer object that groups the private page shell, brand header, card, footer, intro, and gov.br action pieces.
- `SignInForm`: auth-specific form wiring, validation, and local submit handling.
- `CpfEmailInput`: shared reusable form control retained for future CPF/email credential capture screens, not used by current sign-in.
- `PasswordInput`: shared reusable form control because password visibility toggling is common across auth and account flows.

Shared component candidates:

- `Button`: already exists in `src/modules/shared/components/ui`.
- `Input`, `Field`, `InputGroup`, and `Separator`: add through `pnpm dlx shadcn@latest` if not installed.
- `PasswordInput`: place under `src/modules/shared/components/forms` if it is generic and does not know about sign-in copy.
- `CpfEmailInput` and CPF/email helpers: keep under shared because CPF formatting and CPF/email credential capture are reusable beyond sign-in.

Auth-specific component candidates:

- Sign-in composer parts that use SAC Nexus, CBMPE, or gov.br assets and compose the auth-only layout.
- Sign-in form composition.
- Sign-in-specific email validation remains auth-owned, while CPF/email input control and formatting helpers remain shared for future forms.

### Component Ownership Decision Model

Every component created for this feature must start in the narrowest reasonable owner and move outward only when there is evidence of reuse.

Use this decision order:

- `route-local`: use when the component only exists to make one route file readable and has no meaningful domain behavior.
- `modules/auth`: use when the component represents authentication UX, copy, validation, branding, or layout.
- `modules/shared/components/ui`: use for shadcn/Base UI primitives and generic low-level UI.
- `modules/shared/components/forms`: use for reusable form controls composed from shared UI primitives.
- `modules/shared/lib`: use for framework-agnostic pure utilities that are not tied to a specific UI or business module.
- `modules/shared/hooks`: use for generic hooks that are not tied to auth, routing, or a specific API contract.

Do not move a component to `shared` only because it is visually small. Shared ownership should mean the API is stable, generic, and not polluted by a single screen's needs.

Reusable component checklist:

- It has no user-facing copy hardcoded, or copy is provided by composition/children/props.
- It does not import from a business module such as `auth` or `dashboard`.
- It does not know about a route path such as `/signin` or `/forgot-password`.
- It does not know about product-specific assets such as CBMPE, SAC Nexus, or gov.br unless it is intentionally a shared brand component.
- It can be tested without rendering the whole page.
- Its props describe generic UI concerns, not a single business workflow.
- It avoids boolean mode proliferation; if variants are needed, they are explicit or composed.

Auth-specific component checklist:

- It contains authentication labels, validation semantics, or form flow decisions.
- It imports auth-owned utilities, schema, or assets.
- It composes shared UI primitives into auth-specific UX.
- It can change with auth product requirements without affecting other modules.

Route-local component checklist:

- It is only glue for one route.
- It does not need independent testing beyond route/page tests.
- It should not be imported by another module.

### Folder Structure

The implementation should preserve the existing module boundary rules and keep route files thin.

Proposed source structure:

```txt
apps/web/src/
  routes/
    index.tsx
    signin.tsx
    forgot-password.tsx
  modules/
    auth/
      index.ts
      pages/
        sign-in-page.tsx
      forms/
        sign-in-form.tsx
      components/
        sign-in-composer.tsx
      schemas/
        sign-in-schema.ts
    shared/
      components/
        forms/
          cpf-email-input.tsx
          password-input.tsx
        ui/
          button.tsx
          field.tsx
          input.tsx
          input-group.tsx
          separator.tsx
      lib/
        formatters/
          format-cpf.ts
        validators/
          validate-cpf.ts
```

Proposed test structure:

```txt
apps/web/tests/
  unit/
    modules/
      auth/
        forms/
          sign-in-form.test.tsx
      shared/
        lib/
          formatters/
            format-cpf.test.ts
          validators/
            validate-cpf.test.ts
        components/
          forms/
            password-input.test.tsx
          ui/
            button.test.tsx
  e2e/
    auth.spec.ts
```

Asset location should be selected during implementation based on how the assets are consumed:

- Use `src/modules/auth/assets` if imported by React components and bundled by Vite.
- Use `public` only if the asset must be referenced by URL without import processing.

Route files should import auth UI only from `@/modules/auth`, not from auth internals. Auth internals may use relative imports inside `modules/auth`.

### Design Tokens

- Set the global `--primary` token to `oklch(0.4194 0.1365 277.73)`.
- Keep `--primary-foreground` high contrast, expected to remain near white unless visual QA shows contrast issues.
- Prefer semantic classes such as `bg-primary`, `text-primary`, `border-border`, `text-muted-foreground`, and `bg-background`.
- Avoid raw color utilities in component usage when a semantic token exists.
- Add new tokens only when a color is reusable across multiple surfaces or cannot be represented by existing semantics.
- Do not create an auth-only color token for the primary button because the product primary color is already decided.

### Figma Measurements

Source node: `2053:202`.

- Auth frame: `1440px` by `842px`.
- The rounded outer Figma canvas/frame is treated as design presentation only. The real app uses a normal full-viewport `main` with `bg-background` and no outer black frame or viewport rounding.
- Main content group: `448px` wide.
- Logo row: `218.85px` by `80px`.
- CBMPE crest: `70.52px` square.
- SAC Nexus logo: `127.33px` by `80px`.
- Space between logo row and form wrapper: `32.5px`.
- Form wrapper: `448px` by `518px`.
- Inner container offset: `8px` from wrapper top/left/right.
- Inner container: `432px` by `450px`.
- Inner container horizontal padding: `32px`.
- Intro copy block: `368px` by `80px`.
- Form content block: `368px` by `278px`.
- Input group: `368px` by `142px` with two `368px` by `67px` fields and `8px` between fields.
- Text inputs: `368px` by `40px`.
- Primary button: `368px` by `40px`.
- Text input background: `#fafafa`.
- Text input border: `#e5e5e5`.
- Text input radius: `6px`.
- Divider row: `368px` by `24px`.
- gov.br button: `368px` by `40px`.
- Forgot-password area: `368px` by `60px`.
- Create-account footer: `432px` by `44px`.

Current Figma variables used by this screen:

- `Text-sm/Regular`: Geist Regular, `14px`, `20px` line-height.
- `Text-sm/Medium`: Geist Medium, `14px`, `20px` line-height.
- Input labels: Geist Medium, `14px`, `21px` line-height, `#171717`.
- Input placeholders: Geist Regular, `14px`, `20px` line-height, `#737373`.
- Secondary auth links: Geist Medium, `14px`, `20px` line-height.
- `background`: `#ffffff`.
- `Box Shadow/shadow-xs`: `0 1px 2px #0000001A`.

### Assets

- Source of truth is the Figma design: `https://www.figma.com/design/680XFBNM6CEhdFrMlxNZdd/SACNexus---Design?node-id=2020-690&m=dev`.
- Export logo assets as SVG when the Figma layer is vector-based.
- Use PNG only for raster-only assets or when SVG export is not faithful.
- Do not use WEBP as the first choice for logos or marks.
- Store frontend assets in an app-owned public or source asset location selected during implementation.
- Use accessible alternative text for brand imagery where it communicates identity.

### Mobile UX

- Use mobile-first styling.
- On small screens, keep the same hierarchy with a card that is nearly full-width.
- Reduce outer padding and avoid desktop-only fixed dimensions.
- Preserve touch-friendly field and button sizes.
- Ensure the login card does not overflow at `320px` viewport width.

### Documentation And Agent Guidance

- Update durable docs only for conventions that will outlive this page.
- Keep `AGENTS.md` concise and rule-oriented.
- Consider adding a local `AGENTS.md` under a future component area only if there are meaningful local rules that are not already covered by root or `apps/web/AGENTS.md`.
- Candidate local guidance: shared UI components must stay generic, avoid business copy, prefer shadcn/Base UI primitives, and use composition over boolean modes.

### CLI And Dependencies

- Use pnpm for all package operations.
- Use `pnpm dlx shadcn@latest` for shadcn operations.
- Do not manually add dependencies to `package.json` when a CLI/package manager command can do it.
- Before adding shadcn components, inspect what is already installed and review component docs/diffs.

## Requirements

### Functional Requirements

- The user can open `/signin` and see the login page.
- Opening `/` redirects the user to `/signin`.
- The user can type into `E-mail`.
- The user can type into `Senha`.
- The user can toggle password visibility.
- Pressing `Entrar` runs local validation and never calls an API.
- Pressing `Entrar com gov.br` does not call an external integration in this phase.
- Pressing `Esqueci minha senha` navigates to `/forgot-password`.
- Pressing `Cadastre-se` navigates to `/signup`.

### UI Requirements

- Match the desktop reference as closely as possible using available Figma measurements and assets.
- Use the global primary token for the main submit button.
- Use a white or card-background form card on a light background.
- Keep the layout centered on desktop.
- Keep the card full-width-friendly on mobile.
- Use shadcn/Base UI components where available.
- Keep labels, placeholders, and links in Brazilian Portuguese.

### Accessibility Requirements

- Use semantic form markup.
- Associate labels with inputs.
- Provide accessible names for the password visibility control.
- Announce validation errors through accessible field descriptions where supported by the chosen shadcn form components.
- Ensure focus-visible styles are preserved.
- Ensure color contrast for primary button, links, labels, and muted text.

### Testing Requirements

- Unit/component tests must cover field rendering, password visibility toggling, email validation, and validation messages.
- Shared unit tests must continue covering CPF formatters and validators for future reusable form controls.
- E2E tests must cover `/signin` rendering, `/` redirecting to `/signin`, recovery navigation to `/forgot-password`, and create-account navigation to `/signup`.
- Existing initialization e2e expectations must be replaced or updated because `/` will no longer render the initialization page.

## Risks

- Figma dimensions and exact asset exports are not yet captured in repository files.
- The gov.br button is enabled but intentionally does nothing, which may be confusing without future integration planning.
- CPF validation can become complex if official checksum validation is required immediately; this phase should start with the agreed validation scope and refine if needed.
- Updating the global primary token can affect every existing and future primary component.
- A blank `/forgot-password` page is technically correct for routing but not product-complete.
- A blank `/signup` page is technically correct for routing but not product-complete.

## Acceptance Criteria

- `/signin` renders the login page with CBMPE/SAC Nexus branding, credential fields, primary submit, gov.br action, and recovery link.
- `/` redirects to `/signin`.
- `/forgot-password` exists and can be reached from the recovery link.
- `/signup` exists and can be reached from the create-account link.
- The primary color token is set to `oklch(0.4194 0.1365 277.73)`.
- The page is usable at desktop and mobile widths down to `320px`.
- Email validation works locally.
- Password visibility toggling works locally.
- Local validation displays Brazilian Portuguese messages and does not call an API.
- Unit/component tests and basic e2e tests pass.
- Typecheck, Biome check, and build pass.

## Future Enhancements

- Integrate Better Auth sign-in with cookie/session-based auth.
- Integrate gov.br authentication.
- Implement the full forgot-password flow.
- Add authenticated route guards and post-login redirects.
- Add server-driven validation and error messages.
- Add visual regression testing once the design system stabilizes.
- Expand brand and design-token documentation after more screens confirm the visual language.

## Open Questions

- What are the exact Figma measurements for spacing, card width, radii, shadows, and typography?
- Are the CBMPE, SAC Nexus, and gov.br assets fully vector in Figma?
- Should CPF validation include checksum validation in this first implementation or only formatted shape validation?
- Should the blank `/forgot-password` route show no visible content or a minimal placeholder title for accessibility and testability?
