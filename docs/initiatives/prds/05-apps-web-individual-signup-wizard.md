# Apps Web Individual Signup Wizard PRD

## Overview

This document defines the visual and local-only `Pessoa Física` signup wizard for `apps/web` at `/signup/individual`.

The feature replaces the current individual signup placeholder with a multi-step wizard backed by React Hook Form and Zod. It collects personal data, address data, security data, and a simulated email verification code. It does not create an account, call APIs, authenticate the user, or integrate with a backend in this phase.

Execution plan: [`docs/initiatives/tasks/05-apps-web-individual-signup-wizard.md`](../tasks/05-apps-web-individual-signup-wizard.md).

## Product Context

SAC Nexus needs the first real registration journey after the `/signup` type-selection hub. This phase focuses on a complete, testable, accessible frontend flow for `Pessoa Física` users while keeping all submission and verification behavior local.

The provided Figma references contain desktop frames for the individual signup wizard, including:

- Personal data fields.
- Address fields.
- Security fields.
- Email verification / OTP states.
- Wizard card composition and stepper treatment.

No mobile Figma frame exists for this flow, so mobile behavior is defined by responsive UX requirements in this PRD.

## Figma Source

Primary Figma nodes captured during planning:

- `1:347`: individual signup personal data step.
- `1:835`: individual signup address step.
- `1:1082`: individual signup security step.
- `1:1287`: individual signup email verification / OTP state.
- `1:1370`: individual signup email verification / OTP state.

Figma MCP intake status:

- Screenshots and metadata were captured for `1:347`, `1:835`, `1:1082`, `1:1287`, and `1:1370`.
- Full `get_design_context` worked for `1:1287` and `1:1370`.
- Full `get_design_context` for `1:835` and `1:1082` requested Code Connect, so implementation should use the screenshots and metadata unless a smaller child node can be queried successfully.

Important measurements from metadata and screenshot review:

- Frame: `1440px` by `842px`.
- Wizard wrapper width: approximately `448px`.
- Inner card width: approximately `432px`.
- Form content width: approximately `368px`.
- Address step wrapper height: approximately `520px`.
- Security step wrapper height: approximately `442px`.

## Goals

- Implement `/signup/individual` as the complete individual signup wizard shell.
- Keep step state in the URL search param `step`.
- Support direct URLs for each step.
- Validate meaningful search params with Zod.
- Provide a responsive mobile layout without horizontal overflow at `320px` width.
- Use React Hook Form with Zod for all wizard form state and validation.
- Persist only non-PII consent/preference draft values in `sessionStorage`.
- Avoid persisting names, CPF, birth date, address data, passwords, password confirmation, OTP, or countdown state.
- Use shadcn components where they fit, especially for Date Picker, Select, Checkbox, and Input OTP.
- Keep user-facing copy in Brazilian Portuguese.
- Keep code, filenames, routes, docs, and technical identifiers in English.
- Add unit and e2e coverage for validation, rendering, navigation, draft persistence, and OTP behavior.

## Non-Goals

- No backend API integration.
- No account creation.
- No real email delivery.
- No real OTP validation.
- No authenticated session after signup.
- No Zustand store in this phase.
- No persistence of sensitive fields.
- No company or technical responsible wizard implementation.
- No design-system extraction unless a component is generic and immediately reusable.
- No ViaCEP lookup or address autofill.

## Decisions

### Routing

- The wizard lives at `/signup/individual`.
- Step state is stored in the `step` search param.
- Valid step values are:
- `personal-data`.
- `address`.
- `security`.
- `email-verification`.
- If `step` is absent or invalid, the route normalizes to `personal-data` with replace navigation.
- Route files stay thin and import the page from `@/modules/auth`.
- `src/routeTree.gen.ts` is generated and must not be manually edited.

### Form State

- React Hook Form is the source of truth for wizard form values.
- Zod owns form validation and step-specific validation rules.
- Use `FormProvider` for cross-step composition.
- Do not add Zustand for this feature.
- Persist only allowed consent/preference draft fields in `sessionStorage` so refreshes do not clear non-PII progress.
- Do not persist names, CPF, birth date, address data, `password`, `passwordConfirmation`, `otp`, or OTP countdown state.
- Clear the draft after the local success screen is reached.

### Wizard Steps

- `personal-data` collects first name, last name, CPF, and birth date.
- `address` collects CEP, street, number, no-number flag, neighborhood, city, and UF.
- `security` collects password, password confirmation, required legal acknowledgements, and optional communication consent.
- `email-verification` collects a six-digit local OTP and controls resend countdown UI.
- After local OTP validation succeeds, wait for a simulated local delay and navigate to `/signup/individual-success` instead of redirecting to login or an authenticated area.

### Navigation Behavior

- `Voltar` on the first step navigates to `/signup`.
- `Voltar` on later steps navigates to the previous wizard step and preserves only the non-PII consent/preference draft.
- Continue buttons validate only the current step before advancing.
- The stepper is indicative only and is not clickable in this phase.
- Browser refresh preserves allowed non-PII consent/preference draft values and the current step URL; personal and address field values are intentionally not restored.

### Date Of Birth

- Birth date uses a shadcn Date Picker built from `Calendar` and `Popover`.
- The Date Picker should support month and year selection, using `captionLayout="dropdown"` or the closest supported shadcn/react-day-picker API.
- Store the form value as an ISO date string in `yyyy-MM-dd` format.
- Display the value as `dd/MM/yyyy`.
- Minimum allowed date is `1900-01-01`.
- Maximum allowed date is today minus 18 years.
- Users must be at least 18 years old.

### Address

- CEP uses a local mask and validation only.
- CEP format is `00000-000`.
- No ViaCEP lookup or autofill is included in this phase.
- UF is implemented with a select containing Brazilian federation units.
- Street, neighborhood, city, and UF are required.
- Number is required unless the user checks the no-number field.

### Security

- Reuse the shared `PasswordInput` for password and confirmation fields.
- Password must have at least 8 characters.
- Password confirmation must match password.
- Terms and privacy acknowledgements are required.
- Optional communication consent is not required.
- Submission and loading behavior must keep button labels stable and use the shared `Button` loading state if a simulated delay is used.

### Email Verification

- Use shadcn `Input OTP` as the base component.
- Configure OTP with `maxLength={6}`.
- Use `REGEXP_ONLY_DIGITS` from `input-otp`.
- Enable the `Validar` button only when six digits are entered.
- OTP validation is local and simulated with a three-second delay.
- The resend control shows a local countdown, starting at `0:29`.
- The resend countdown resets only local OTP UI state.
- Do not persist OTP or countdown state.

### shadcn Components

- Add all shadcn components required by implementation through the CLI.
- The initial expected set is `calendar`, `popover`, `input-otp`, `checkbox`, and `select`.
- Do not manually add shadcn dependencies to `package.json` when the CLI can do it.
- Keep shadcn UI primitives in `apps/web/src/modules/shared/components/ui`.
- Create shared form wrappers only when the component is generic and free of business copy or route decisions.

### Responsive Behavior

- Desktop keeps the Figma-centered card composition around the `448px` wizard width.
- Desktop at `lg` and wider uses the lateral stepper treatment from Figma.
- Mobile uses natural vertical scrolling.
- Mobile and tablet below `lg` render the compact stepper above the card.
- The compact top stepper shows the progress markers and `Passo 1`, `Passo 2`, and `Passo 3` text only; the long step labels are reserved for the lateral desktop stepper.
- Mobile card width is fluid and must not overflow at `320px`.
- OTP slots shrink on mobile so all six slots remain visible without horizontal scrolling.
- Do not use a lateral stepper below `lg`.

### Component Architecture

Use auth-owned composition for the wizard.

Planned source structure:

```txt
apps/web/src/modules/auth/
  pages/
    individual-signup-wizard-page.tsx
    individual-signup-success-page.tsx
  components/
    signup-layout-composer.tsx
    signup-stepper.tsx
    signup-wizard-intro.tsx
    individual-signup-success.tsx
  forms/
    individual-signup-form.tsx
    individual-signup-personal-data-step.tsx
    individual-signup-address-step.tsx
    individual-signup-security-step.tsx
    individual-signup-email-verification-step.tsx
  schemas/
    individual-signup-schema.ts
  lib/
    individual-signup-draft.ts
```

Component responsibilities:

- `IndividualSignupWizardPage`: route-level page composition exported through `@/modules/auth`.
- `IndividualSignupSuccessPage`: route-level local completion page exported through `@/modules/auth`.
- `SignupLayout`: auth-specific signup composer for root layout, back header, main content, card surface, footer, and sign-in prompt treatment shared by signup hub and wizard flows.
- `SignupStepper`: indicative progress UI for the current step.
- `SignupWizardIntro`: step title and description region.
- `IndividualSignupForm`: owns React Hook Form setup, draft hydration, step routing coordination, and submit behavior.
- Step components: render fields for their step only.
- `individualSignupSchema`: owns full and step-specific validation.
- `individual-signup-draft`: owns safe draft serialization, parsing, and clearing.

Keep these components auth-owned unless a later implementation proves generic reuse.

## Requirements

### Functional Requirements

- Opening `/signup/individual` renders the first individual signup step.
- Opening `/signup/individual?step=personal-data` renders the personal data step.
- Opening `/signup/individual?step=address` renders the address step.
- Opening `/signup/individual?step=security` renders the security step.
- Opening `/signup/individual?step=email-verification` renders the email verification step.
- Opening `/signup/individual?step=invalid` normalizes to the personal data step.
- Current-step validation blocks advancing when required fields are invalid.
- Valid current-step data advances to the next step.
- Back navigation follows the wizard step order and preserves allowed non-PII draft values.
- The final OTP step shows a local success screen after a six-digit OTP is validated.
- The success screen does not imply an authenticated session.

### Validation Requirements

- First name is required and must contain at least 2 characters.
- Last name is required and must contain at least 2 characters.
- CPF is required and must contain 11 digits after formatting is removed.
- CPF formatting follows `000.000.000-00`.
- Birth date is required and must satisfy the minimum age rule.
- CEP is required and must contain 8 digits after formatting is removed.
- Address number is required unless the no-number checkbox is selected.
- UF is required and must be one of the supported Brazilian federation units.
- Password is required and must contain at least 8 characters.
- Password confirmation is required and must match password.
- Required legal acknowledgements must be checked.
- OTP must contain exactly 6 digits before validation is allowed.

### Accessibility Requirements

- Every input has an accessible label.
- Validation errors are associated with their fields through `aria-describedby` and `aria-invalid`.
- The stepper communicates the current step and progress without requiring click interaction.
- Disabled buttons must be disabled semantically and visually.
- OTP input must remain keyboard accessible and paste-friendly.
- Date Picker, Select, Checkbox, and OTP components must preserve shadcn/Base UI accessibility behavior.
- Focus-visible states must be clear for all interactive controls.
- The success screen must announce the successful local completion through visible heading text.

### Testing Requirements

- Add unit tests for schema validation and safe draft serialization.
- Add component tests for step rendering, required errors, navigation buttons, and OTP button disabled/enabled behavior.
- Add e2e tests for the full happy path from `/signup/individual` through local success.
- Add e2e tests for invalid step normalization.
- Add e2e tests for back navigation.
- Add e2e tests for draft persistence after refresh, proving PII and sensitive fields are excluded.
- Add e2e mobile coverage at a narrow viewport to assert no horizontal overflow and usable OTP slots.

## Risks

- The shadcn `Input OTP` visual differs from Figma and will need local slot styling to get close enough for visual QA.
- Figma mobile layouts do not exist, so responsive behavior depends on product-approved UX decisions rather than exact frames.
- Full Figma design context was not available for every node, so some visual values may need refinement during implementation.
- Local-only OTP can be mistaken for real verification if copy is not clear enough during review.
- Draft persistence can accidentally include sensitive fields if serialization is not centralized and tested.
- Date Picker dropdown behavior may differ depending on the shadcn/react-day-picker version installed by the CLI.

## Acceptance Criteria

- `/signup/individual` renders a complete four-step individual signup wizard.
- Search param step routing works for all supported steps.
- Invalid or missing step values normalize to `personal-data`.
- The wizard preserves only allowed non-PII consent/preference draft fields in `sessionStorage`.
- Names, CPF, birth date, address data, password, password confirmation, OTP, and countdown state are never persisted.
- UF uses a select of Brazilian federation units.
- Birth date uses a Date Picker with month/year navigation and enforces minimum age 18.
- OTP uses shadcn `Input OTP`, accepts only six digits, supports paste, and validates locally.
- The post-OTP state is `/signup/individual-success`, a local success screen, not login or dashboard redirection.
- Desktop layout matches the Figma wizard composition closely enough for review.
- Mobile and tablet layouts use the compact top stepper and work without horizontal overflow at `320px`.
- Unit tests pass with `pnpm --filter web test`.
- E2E tests pass with `pnpm --filter web test:e2e`.
- Static checks pass with `pnpm --filter web check`, `pnpm --filter web typecheck`, and `pnpm --filter web build`.

## Future Enhancements

- Replace local submit and OTP behavior with real API integration.
- Add real email sending and resend throttling.
- Add server-backed draft persistence if business requirements require resume-later behavior across devices.
- Add ViaCEP lookup and address autofill if product approves external service behavior.
- Implement company and technical responsible signup wizards.
- Promote generic date, OTP, address, or legal acknowledgement controls to shared components after reuse appears.

## Open Questions

- None for this planning phase.
