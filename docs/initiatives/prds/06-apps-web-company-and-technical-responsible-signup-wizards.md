# Apps Web Company And Technical Responsible Signup Wizards PRD

## Overview

This document defines the next signup initiative for `apps/web`: a reusable signup wizard foundation plus the `Empresa / CNPJ` and `Responsável Técnico` wizard flows.

The feature replaces the current placeholder routes at `/signup/company` and `/signup/technical-responsible` with local-only multi-step wizards that follow the current `Pessoa Física` implementation pattern. It also performs a small controlled refactor of the existing individual wizard to avoid duplicating stepper, intro, OTP, safe draft, masks, and validation logic.

Execution plan: [`docs/initiatives/tasks/06-apps-web-company-and-technical-responsible-signup-wizards.md`](../tasks/06-apps-web-company-and-technical-responsible-signup-wizards.md).

## Product Context

SAC Nexus already has a signup hub at `/signup` where users choose between:

- `Pessoa Física`.
- `Empresa / CNPJ`.
- `Responsável Técnico`.

The individual signup wizard is implemented at `/signup/individual` and the other two routes are placeholders. The next product step is to complete the company and technical responsible signup journeys while preserving the visual language and interaction model already used by the hub and individual wizard.

The provided screenshots show desktop flows for company and technical responsible signup. No Figma link is currently available for this phase, so the screenshots and current implemented individual wizard are the primary design references.

## Current State Analysis

The current implementation already provides useful foundation pieces:

- `SignupLayout` is reusable across the hub and wizard pages.
- `/signup` correctly routes to `/signup/individual`, `/signup/company`, and `/signup/technical-responsible`.
- `/signup/individual` uses a validated `step` search param with TanStack Router.
- The individual wizard uses React Hook Form and Zod for step-specific validation.
- The individual wizard persists only non-PII consent/preference draft fields in `sessionStorage`.
- Shared UI primitives already include `Input`, `Button`, `Checkbox`, `Select`, `Calendar`, `Popover`, and `InputOTP`.
- The current OTP step already has the desired local countdown, six-digit input, loading state, and disabled/enabled behavior.

The current implementation also has specific coupling that should be addressed before adding new wizards:

- `SignupStepper` is hardcoded to individual signup steps and `IndividualSignupStep`.
- `SignupWizardIntro` is hardcoded to `Pessoa Física`.
- `IndividualSignupEmailVerificationStep` is reusable in behavior but hardcoded to individual form values.
- `IndividualSignupForm` owns wizard progression logic that company and technical responsible would otherwise duplicate.
- `formatCep` and generic digit handling live inside individual signup files instead of shared formatter/validator utilities.
- CPF validation currently checks shape only; this initiative will add real CPF and CNPJ check-digit validation and update the individual wizard for consistency.

## Goals

- Implement the complete local-only company signup wizard at `/signup/company`.
- Implement the complete local-only technical responsible signup wizard at `/signup/technical-responsible`.
- Keep each wizard step in a validated `step` search param.
- Reuse a small auth-owned wizard foundation instead of copying the individual wizard implementation.
- Reuse a single auth-owned email OTP step across signup wizards.
- Support three visible data-collection steps for company signup, plus OTP.
- Support four visible data-collection steps for technical responsible signup, plus OTP.
- Use correct sequential numbering for technical responsible steps: `Passo 1` through `Passo 4`.
- Add shared masks/formatters for CPF, CNPJ, CEP, and Brazilian phone numbers.
- Add real check-digit validators for CPF and CNPJ.
- Update the existing individual wizard to use the improved CPF validator without changing its user journey.
- Keep user-facing copy in Brazilian Portuguese.
- Keep code, filenames, routes, docs, and technical identifiers in English.
- Preserve mobile usability down to `320px` width.
- Add unit/component/e2e coverage for the new flows and shared validation utilities.

## Non-Goals

- No backend API integration.
- No real account creation.
- No real email delivery.
- No real OTP validation.
- No authenticated session after signup.
- No server-backed draft persistence.
- No persistence of PII or sensitive form fields.
- No ViaCEP lookup or address autofill.
- No broad design-system extraction beyond utilities and components with immediate reuse.
- No route path redesign for the existing `/signup` hub or `/signup/individual` wizard.
- No implementation of “resume later” behavior.

## Decisions

### Scope

The company and technical responsible wizards are local-only in this phase, matching the current individual signup wizard. Submitting the final OTP navigates to a local success screen and does not create a real account.

Schemas and form values should be shaped with future API integration in mind, but no HTTP calls should be added in this phase.

### Documentation Shape

This initiative uses one PRD and one task plan because the base refactor, company wizard, and technical responsible wizard share most decisions and implementation primitives.

### Routing

The current route pattern is preserved:

- Company wizard: `/signup/company?step=...`.
- Technical responsible wizard: `/signup/technical-responsible?step=...`.
- Company success: `/signup/company-success`.
- Technical responsible success: `/signup/technical-responsible-success`.

Each wizard owns its own allowed step values and validates the `step` search param with Zod or TanStack Router validation. Invalid or missing step values normalize to the first step with replace navigation.

Route files stay thin and import route-level pages from `@/modules/auth`.

### Wizard Foundation

Create a small reusable auth-owned wizard foundation before implementing new wizards. The goal is controlled reuse, not a broad generic wizard engine.

Expected reusable pieces:

- A parameterized `SignupStepper` that receives step metadata and current step.
- A parameterized `SignupWizardIntro` that receives account type label and optional description.
- A reusable auth-owned `SignupEmailVerificationStep` for the OTP UI.
- Shared wizard layout composition using the existing `SignupLayout`.
- A small helper pattern for step progression and current-step validation where it reduces duplication without hiding business form details.

Keep these pieces inside `modules/auth` unless they are generic, free of auth copy, free of route decisions, and useful outside auth.

### Stepper And Mobile Behavior

The visible stepper represents data-collection steps only. The OTP screen does not show the stepper, matching the current individual wizard.

The technical responsible screenshots contain inconsistent numbering with repeated step numbers. Implementation must use generated sequential numbering from the configured step order:

- `Passo 1`: `Dados do Responsável`.
- `Passo 2`: `Dados da Empresa`.
- `Passo 3`: `Endereço`.
- `Passo 4`: `Segurança`.

Desktop keeps the lateral stepper. Mobile and tablet below `lg` render the compact top stepper. The compact stepper must not assume exactly three steps.

### OTP

All signup wizards end with the same email OTP behavior:

- Six digits.
- Digits-only input.
- Paste support through `InputOTP`.
- `Validar` disabled until all six digits are present.
- Stable button label with loading spinner through the shared `Button` `isLoading` prop.
- Local simulated validation delay.
- Local resend countdown starting at `0:29`.
- Resend clears only local OTP UI state.
- OTP and countdown state are never persisted.

The OTP component remains auth-owned because it contains signup-specific copy and flow behavior.

### Form State And Draft Persistence

React Hook Form remains the source of truth for wizard values. Zod owns full and step-specific validation.

Draft persistence follows the individual wizard security rule:

- Persist only non-PII consent/preference fields, such as `acceptedTerms`, `acceptedPrivacy`, and `wantsProcessCommunication`.
- Do not persist names, CPF, CNPJ, birth date, identification document, e-mail, phone, address data, password, password confirmation, OTP, or countdown state.
- Store each flow under its own `sessionStorage` key.
- Centralize safe draft serialization and parsing so sensitive fields cannot be accidentally added.
- Clear the related draft after local success.

### Masks And Validators

Add or update shared utilities under `apps/web/src/modules/shared/lib`:

- `format-cpf.ts` should keep formatting CPF as `000.000.000-00`.
- `format-cnpj.ts` should format CNPJ as `00.000.000/0000-00`.
- `format-cep.ts` should format CEP as `00000-000`.
- `format-phone.ts` should format Brazilian phones as `(00) 0000-0000` or `(00) 00000-0000`.
- Generic digit extraction should be shared instead of duplicated in auth schemas.
- `validate-cpf.ts` should validate CPF shape and real check digits.
- `validate-cnpj.ts` should validate CNPJ shape and real check digits.

Because CPF validation becomes stricter, update the existing individual signup schema and tests to use valid CPF fixtures.

### Company Wizard Fields

Company signup has three visible data-collection steps plus OTP.

Step `company-data` uses the title copy `Você está criando sua conta como Empresa` and contains:

- `Razão social`.
- `Nome fantasia`.
- `CNPJ`.
- `CPF representante`.
- `E-mail`.
- `Telefone`.

Step `address` contains:

- `CEP`.
- `Rua`.
- `Número`.
- `Sem número`.
- `Bairro`.
- `Cidade`.
- `Estado`.

Step `security` contains:

- `Senha`.
- `Confirmação de senha`.
- `Aceito Termos de Uso`.
- `Aceito Política de Privacidade`.
- `Autorizo comunicações do processo`.

All company fields are required except optional process communication consent and `Número` when `Sem número` is checked.

### Technical Responsible Wizard Fields

Technical responsible signup has four visible data-collection steps plus OTP.

Step `responsible-data` uses the title copy `Você está criando sua conta como Responsável Técnico` and description `(Engenheiro, arquiteto ou procurador)`. It contains:

- `Nome`.
- `Sobrenome`.
- `CPF`.
- `Data de nascimento`.
- `Documento de identificação`.

Step `company-data` reuses the company data fields:

- `Razão social`.
- `Nome fantasia`.
- `CNPJ`.
- `CPF representante`.
- `E-mail`.
- `Telefone`.

Step `address` reuses the address fields.

Step `security` reuses the security fields.

All technical responsible fields are required except optional process communication consent and `Número` when `Sem número` is checked.

`E-mail` and `Telefone` are treated as contact fields for the signup/process in the company data step. This PRD does not add separate contact fields to `Dados do Responsável`.

### Component Ownership

Auth-owned components remain in `apps/web/src/modules/auth/components` or `apps/web/src/modules/auth/forms` when they include signup copy, route behavior, or account-type decisions.

Reusable low-level form controls remain in `modules/shared/components/forms` only when they are generic and free of business copy.

Shared utilities go under:

- `modules/shared/lib/formatters` for masks/formatters.
- `modules/shared/lib/validators` for CPF/CNPJ validation helpers.

## Requirements

### Functional Requirements

- Opening `/signup/company` renders the first company signup step.
- Opening `/signup/company?step=company-data` renders company data.
- Opening `/signup/company?step=address` renders address.
- Opening `/signup/company?step=security` renders security.
- Opening `/signup/company?step=email-verification` renders OTP without the stepper.
- Opening `/signup/company?step=invalid` normalizes to `company-data`.
- Opening `/signup/technical-responsible` renders the first technical responsible step.
- Opening `/signup/technical-responsible?step=responsible-data` renders responsible data.
- Opening `/signup/technical-responsible?step=company-data` renders company data.
- Opening `/signup/technical-responsible?step=address` renders address.
- Opening `/signup/technical-responsible?step=security` renders security.
- Opening `/signup/technical-responsible?step=email-verification` renders OTP without the stepper.
- Opening `/signup/technical-responsible?step=invalid` normalizes to `responsible-data`.
- Current-step validation blocks advancing when required fields are invalid.
- Valid current-step data advances to the next step.
- `Voltar` on the first step returns to `/signup`.
- `Voltar` on later data steps returns to the previous step.
- `Voltar` on OTP returns to the final security step.
- Local OTP success navigates to the matching success route.
- Success screens do not imply a real account was created or an authenticated session exists.

### Validation Requirements

- CPF fields require a valid CPF shape and check digits.
- CNPJ fields require a valid CNPJ shape and check digits.
- CEP requires 8 digits after formatting is removed.
- Phone requires a Brazilian phone shape with 10 or 11 digits after formatting is removed.
- E-mail requires a valid e-mail shape.
- Names and text identifiers require non-empty trimmed values with sensible minimum lengths.
- Birth date is required for technical responsible and must use the same age rule as individual signup unless product changes the requirement.
- Address number is required unless `Sem número` is checked.
- State must be one of the supported Brazilian federation units.
- Password must have at least 8 characters.
- Password confirmation must match password.
- Terms and privacy acknowledgements are required.
- Process communication consent is optional.
- OTP must contain exactly 6 digits.

### Accessibility Requirements

- Every input has an accessible label.
- Validation errors are associated with fields through `aria-describedby` and `aria-invalid`.
- The stepper communicates current step and completion state without requiring click interaction.
- Stepper numbering is derived from step order and remains correct for both three-step and four-step flows.
- Disabled buttons are semantically disabled and visually non-interactive.
- OTP remains keyboard accessible and paste-friendly.
- Focus-visible states are clear for links, buttons, inputs, checkboxes, select, date picker, and OTP slots.

### Responsive Requirements

- Desktop keeps the card and lateral stepper composition used by the individual wizard.
- Mobile and tablet below `lg` use a compact top stepper.
- The compact stepper supports both three and four visible steps.
- Forms must not horizontally overflow at `320px` width.
- OTP slots must remain visible without horizontal scrolling at `320px` width.
- Long labels such as `Responsável Técnico` and `Documento de identificação` must not break layout.

### Testing Requirements

- Add unit tests for CPF and CNPJ check-digit validation.
- Add unit tests for CPF, CNPJ, CEP, and phone formatting.
- Update individual signup schema tests to use a valid CPF fixture.
- Add schema tests for company signup validation.
- Add schema tests for technical responsible signup validation.
- Add safe draft tests proving sensitive company and technical responsible fields are excluded.
- Add component tests for route rendering and step rendering.
- Add e2e tests for company happy path through local success.
- Add e2e tests for technical responsible happy path through local success.
- Add e2e tests for invalid step normalization.
- Add e2e tests for back navigation.
- Add mobile e2e coverage for the company and technical responsible flows.
- Add regression coverage that the individual wizard still works after refactor.

## Risks

- The screenshots have inconsistent technical responsible step numbering, so implementation intentionally differs by using correct sequential numbering.
- Adding real CPF validation can break existing individual signup tests and any hardcoded invalid CPF fixtures.
- The current individual wizard contains several PF-specific names, so refactoring must be small and covered by regression tests.
- Over-abstracting the wizard could make business-specific fields harder to maintain. Reuse should stay focused on layout, stepper, OTP, masks, validators, and repeated step components.
- Without Figma node access, exact spacing may need visual refinement during implementation.
- Local-only OTP can be mistaken for real verification if success copy is not explicit.

## Acceptance Criteria

- `/signup/company` renders a complete local-only company signup wizard.
- `/signup/technical-responsible` renders a complete local-only technical responsible signup wizard.
- Company uses three visible data steps plus OTP.
- Technical responsible uses four visible data steps plus OTP and correct `Passo 1` through `Passo 4` numbering.
- OTP is reused across signup wizards and remains outside the stepper.
- Shared CPF and CNPJ validators perform real check-digit validation.
- CPF validation in the existing individual signup wizard is updated and covered by tests.
- Shared formatters exist for CPF, CNPJ, CEP, and phone.
- Draft persistence excludes PII and sensitive fields across all signup wizards.
- Desktop layout follows the current signup wizard visual language.
- Mobile layouts work without horizontal overflow at `320px`.
- Unit/component tests pass.
- E2E tests pass.
- `pnpm --filter web check`, `pnpm --filter web typecheck`, and `pnpm --filter web build` pass.

## Future Enhancements

- Replace local submit and OTP behavior with real API integration.
- Add real e-mail delivery and resend throttling.
- Add API error handling and field-level server error mapping.
- Add ViaCEP lookup and address autofill if product approves external service behavior.
- Add server-backed resume-later behavior only after security review.
- Add analytics events for signup flow starts, step completions, abandons, and local successes.

## Open Questions

- None for this planning phase.
