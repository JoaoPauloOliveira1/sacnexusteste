# Apps Web Individual Signup Wizard Tasks

Execution checklist for [`docs/initiatives/prds/05-apps-web-individual-signup-wizard.md`](../prds/05-apps-web-individual-signup-wizard.md).

## Phase 1: Design Intake And Component Research

- [x] Capture Figma screenshots for node `1:835`.
- [x] Capture Figma screenshots for node `1:1082`.
- [x] Capture Figma screenshots for node `1:1287`.
- [x] Capture Figma screenshots for node `1:1370`.
- [x] Capture Figma metadata for node `1:835`.
- [x] Capture Figma metadata for node `1:1082`.
- [x] Capture Figma metadata for node `1:1287`.
- [x] Capture Figma metadata for node `1:1370`.
- [x] Capture full design context for nodes where Figma MCP allowed it.
- [x] Review shadcn `Input OTP` documentation and examples.
- [x] Use available Figma context, screenshots, and metadata for spacing and typography decisions.
- [x] During implementation, inspect existing auth and shared component styles before writing wizard components.

## Phase 2: shadcn Components

- [x] Run shadcn CLI from `apps/web` to add all required components.
- [x] Add the initial expected components: `calendar`, `popover`, `input-otp`, `checkbox`, and `select`.
- [x] Let the CLI add required dependencies instead of manually editing `package.json`.
- [x] Verify generated shadcn files land under `src/modules/shared/components/ui`.
- [x] Preserve generated accessibility behavior and only customize styling where needed.
- [x] Confirm `input-otp` exports `REGEXP_ONLY_DIGITS` through the installed package.
- [x] Update the lockfile through pnpm-managed package operations.

## Phase 3: Routing

- [x] Replace the `/signup/individual` placeholder with the real individual wizard page.
- [x] Keep `apps/web/src/routes/signup/individual.tsx` thin and import from `@/modules/auth`.
- [x] Define and validate the `step` search param with Zod or TanStack Router validation.
- [x] Support `personal-data`, `address`, `security`, and `email-verification` step values.
- [x] Normalize missing or invalid `step` values to `personal-data` with replace navigation.
- [x] Add `/signup/individual-success` as the local post-OTP success route.
- [x] Regenerate route types with `pnpm --filter web routes:generate`.
- [x] Do not manually edit `apps/web/src/routeTree.gen.ts`.

## Phase 4: Auth Module Structure

- [x] Create `apps/web/src/modules/auth/pages/individual-signup-wizard-page.tsx`.
- [x] Create `apps/web/src/modules/auth/pages/individual-signup-success-page.tsx`.
- [x] Use `apps/web/src/modules/auth/components/signup-layout-composer.tsx` for shared signup layout regions.
- [x] Create `apps/web/src/modules/auth/components/signup-stepper.tsx`.
- [x] Create `apps/web/src/modules/auth/components/signup-wizard-intro.tsx`.
- [x] Create `apps/web/src/modules/auth/components/individual-signup-success.tsx`.
- [x] Create `apps/web/src/modules/auth/forms/individual-signup-form.tsx`.
- [x] Create `apps/web/src/modules/auth/forms/individual-signup-personal-data-step.tsx`.
- [x] Create `apps/web/src/modules/auth/forms/individual-signup-address-step.tsx`.
- [x] Create `apps/web/src/modules/auth/forms/individual-signup-security-step.tsx`.
- [x] Create `apps/web/src/modules/auth/forms/individual-signup-email-verification-step.tsx`.
- [x] Create `apps/web/src/modules/auth/schemas/individual-signup-schema.ts`.
- [x] Create `apps/web/src/modules/auth/lib/individual-signup-draft.ts`.
- [x] Export individual signup pages from `apps/web/src/modules/auth/index.ts`.
- [x] Keep wizard components auth-owned unless a generic shared API is proven necessary.

## Phase 5: Schema And Validation

- [x] Define the full individual signup form value type from the Zod schema.
- [x] Define step-specific field groups for current-step validation.
- [x] Add first name validation with required and minimum length rules.
- [x] Add last name validation with required and minimum length rules.
- [x] Add CPF validation for 11 digits after formatting is removed.
- [x] Add or reuse CPF formatting for `000.000.000-00`.
- [x] Add birth date validation for required value, date range, and minimum age 18.
- [x] Add CEP validation for 8 digits after formatting is removed.
- [x] Add or reuse CEP formatting for `00000-000`.
- [x] Add address validation for street, neighborhood, city, and UF.
- [x] Add conditional number validation based on the no-number checkbox.
- [x] Add password minimum length validation.
- [x] Add password confirmation matching validation.
- [x] Add required legal acknowledgement validation.
- [x] Add optional communication consent without making it required.
- [x] Add OTP validation for exactly six digits.

## Phase 6: Draft Persistence

- [x] Define the `sessionStorage` key for the individual signup draft.
- [x] Centralize draft read, write, parse, and clear logic in `individual-signup-draft.ts`.
- [x] Persist only allowed non-PII consent/preference fields.
- [x] Exclude names, CPF, birth date, and address data from persisted draft values.
- [x] Exclude password from persisted draft values.
- [x] Exclude password confirmation from persisted draft values.
- [x] Exclude OTP from persisted draft values.
- [x] Exclude OTP countdown state from persisted values.
- [x] Hydrate React Hook Form default values only from safe non-PII draft data.
- [x] Update the draft when allowed fields change.
- [x] Clear the draft after local success.
- [x] Handle malformed stored draft values without crashing the page.

## Phase 7: Wizard Shell And Stepper

- [x] Implement the desktop shell close to the Figma `448px` wrapper and `432px` card composition.
- [x] Implement a fluid mobile shell that fits at `320px` width.
- [x] Add a top `Voltar` action.
- [x] Make `Voltar` navigate to `/signup` on the first step.
- [x] Make `Voltar` navigate to the previous step on later steps.
- [x] Implement an indicative-only stepper.
- [x] Keep the top stepper compact below `lg` with progress markers and `Passo N` text only.
- [x] Keep the lateral Figma stepper for `lg` and wider viewports.
- [x] Ensure the stepper communicates current step and total progress accessibly.
- [x] Keep the stepper non-clickable in this phase.
- [x] Add step titles and descriptions with Brazilian Portuguese copy.

## Phase 8: Personal Data Step

- [x] Render first name and last name fields.
- [x] Render CPF field with local formatting.
- [x] Render birth date Date Picker using shadcn `Calendar` and `Popover`.
- [x] Configure birth date month/year selection.
- [x] Store birth date as `yyyy-MM-dd`.
- [x] Display birth date as `dd/MM/yyyy`.
- [x] Associate errors with fields through `aria-describedby` and `aria-invalid`.
- [x] Advance only after the personal data step validates.

## Phase 9: Address Step

- [x] Render CEP field with local formatting.
- [x] Render street field.
- [x] Render number field.
- [x] Render no-number checkbox.
- [x] Disable or clear number appropriately when no-number is checked.
- [x] Render neighborhood field.
- [x] Render city field.
- [x] Render UF field with shadcn `Select` and Brazilian federation units.
- [x] Do not call ViaCEP or any external address service.
- [x] Advance only after the address step validates.

## Phase 10: Security Step

- [x] Render password field with shared `PasswordInput`.
- [x] Render password confirmation field with shared `PasswordInput`.
- [x] Render required terms acknowledgement checkbox.
- [x] Render required privacy acknowledgement checkbox.
- [x] Render optional process communication consent checkbox.
- [x] Keep checkbox labels and helper copy in Brazilian Portuguese.
- [x] Advance only after the security step validates.
- [x] Confirm password fields are not written to `sessionStorage`.

## Phase 11: Email Verification And Success

- [x] Render shadcn `Input OTP` with six slots.
- [x] Configure OTP to accept only digits with `REGEXP_ONLY_DIGITS`.
- [x] Style OTP slots so they fit mobile and approximate Figma on desktop.
- [x] Support paste behavior through the underlying `Input OTP` component.
- [x] Disable `Validar` until exactly six digits are present.
- [x] Simulate local validation when `Validar` is pressed.
- [x] Show a resend countdown starting at `0:29`.
- [x] Let resend reset only local OTP-related UI state.
- [x] Avoid persisting OTP and countdown state.
- [x] Render a local success screen after simulated validation succeeds.
- [x] Ensure success copy does not imply a real account was created or authenticated.

## Phase 12: Accessibility

- [x] Ensure each field has a programmatic label.
- [x] Ensure all validation messages are reachable by assistive technology.
- [x] Ensure keyboard navigation follows the visual form order.
- [x] Ensure focus-visible treatment is clear for links, buttons, inputs, checkboxes, select, calendar, and OTP slots.
- [x] Ensure disabled buttons use native disabled behavior where possible.
- [x] Ensure `Validar` cannot be triggered while disabled.
- [x] Ensure the Date Picker can be opened, navigated, and closed by keyboard through shadcn/Base UI behavior.
- [x] Ensure the success screen uses a meaningful heading.

## Phase 13: Unit And Component Tests

- [x] Add schema tests for valid happy-path data.
- [x] Add schema tests for personal data errors.
- [x] Add schema tests for CPF, birth date, and minimum age validation.
- [x] Add schema tests for conditional address number validation.
- [x] Add schema tests for password confirmation matching.
- [x] Add schema tests for required legal acknowledgements.
- [x] Add schema tests for OTP length validation.
- [x] Add draft persistence tests proving sensitive fields are excluded.
- [x] Add component tests for first-step rendering.
- [x] Add component tests for requested-step rendering.
- [x] Cover `Voltar` behavior by step through e2e tests.
- [x] Cover OTP `Validar` disabled, enabled, and loading states through e2e tests.
- [x] Run `pnpm --filter web test`.

## Phase 14: E2E Tests

- [x] Extend `apps/web/tests/e2e/auth.spec.ts` with individual signup wizard coverage.
- [x] Test the full happy path from `/signup/individual` to the local success screen.
- [x] Test direct navigation to supported step URLs through route and component coverage.
- [x] Test invalid step normalization to `personal-data`.
- [x] Test back navigation from a later step.
- [x] Test draft persistence after refresh for allowed non-PII fields.
- [x] Test that password and OTP do not rehydrate after refresh.
- [x] Test full-code OTP entry behavior.
- [x] Add a mobile viewport test at or near `320px` width.
- [x] Assert mobile flow has no horizontal overflow.
- [x] Run `pnpm --filter web test:e2e`.

## Phase 15: Verification

- [x] Run `pnpm --filter web routes:generate`.
- [x] Run `pnpm --filter web check`.
- [x] Run `pnpm --filter web typecheck`.
- [x] Run `pnpm --filter web test`.
- [x] Run `pnpm --filter web test:e2e`.
- [x] Run `pnpm --filter web build`.
- [ ] Manually inspect `/signup/individual` on desktop.
- [ ] Manually inspect `/signup/individual` at mobile widths, including `320px`.
- [x] Confirm no unrelated files were modified.
- [x] Confirm docs links remain valid.

## Phase 16: Documentation Follow-Up

- [x] Update this task plan as phases are completed.
- [x] Update the PRD for product decisions that changed during implementation.
- [x] Leave durable docs under `docs/web` unchanged because no reusable wizard, form, Figma, or shadcn convention emerged.
- [x] Keep unrelated backlog items out of `docs/TODO.md` because they are covered by this active task plan or out of scope.
