# Apps Web Company And Technical Responsible Signup Wizards Tasks

Execution checklist for [`docs/initiatives/prds/06-apps-web-company-and-technical-responsible-signup-wizards.md`](../prds/06-apps-web-company-and-technical-responsible-signup-wizards.md).

## Implementation Status

- Implemented the shared signup wizard foundation, shared CPF/CNPJ/CEP/phone utilities, company wizard, technical responsible wizard, route updates, unit/component tests, and e2e coverage.
- Verified with `pnpm --filter web check`, `pnpm --filter web typecheck`, `pnpm --filter web test`, `pnpm --filter web test:e2e`, and `pnpm --filter web build`.
- Manual desktop/mobile visual inspection remains a follow-up outside automated verification.

## Phase 1: Planning And Design Baseline

- [ ] Use the provided screenshots as the design baseline for company and technical responsible signup.
- [ ] Record that no Figma link is available for this phase.
- [ ] Confirm the company flow has three visible data steps plus OTP.
- [ ] Confirm the technical responsible flow has four visible data steps plus OTP.
- [ ] Record that technical responsible numbering must be sequential from `Passo 1` through `Passo 4` despite screenshot inconsistencies.
- [ ] Keep the implementation local-only with no backend API calls.
- [ ] Keep user-facing copy in Brazilian Portuguese.
- [ ] Keep code, routes, filenames, and docs in English.

## Phase 2: Shared Formatters And Validators

- [ ] Move generic digit extraction to an appropriate shared utility or validator helper.
- [ ] Keep or update `format-cpf.ts` for `000.000.000-00` formatting.
- [ ] Create `format-cnpj.ts` for `00.000.000/0000-00` formatting.
- [ ] Create `format-cep.ts` for `00000-000` formatting.
- [ ] Create `format-phone.ts` for Brazilian phone formatting.
- [ ] Update `validate-cpf.ts` to validate CPF check digits, not only shape.
- [ ] Create `validate-cnpj.ts` to validate CNPJ check digits.
- [ ] Add formatter tests for CPF, CNPJ, CEP, and phone.
- [ ] Add validator tests for valid CPF, invalid CPF, repeated-digit CPF, valid CNPJ, invalid CNPJ, and repeated-digit CNPJ.
- [ ] Update existing individual signup tests to use valid CPF fixtures.

## Phase 3: Wizard Foundation Refactor

- [ ] Refactor `SignupStepper` to accept configured visible steps instead of importing `IndividualSignupStep`.
- [ ] Ensure stepper numbering is derived from array order.
- [ ] Ensure the compact mobile stepper supports more than three steps.
- [ ] Refactor `SignupWizardIntro` to accept account type label and optional description.
- [ ] Extract a reusable auth-owned `SignupEmailVerificationStep` from the individual OTP step.
- [ ] Keep OTP copy and behavior consistent with the individual wizard.
- [ ] Preserve `InputOTP` paste support and digits-only behavior.
- [ ] Preserve loading behavior through the shared `Button` `isLoading` prop.
- [ ] Add or refactor a reusable auth-owned success component only if it avoids route-specific duplication without adding boolean-heavy props.
- [ ] Keep `SignupLayout` as the shared auth-owned layout composer.
- [ ] Avoid creating a broad generic wizard engine unless duplication remains after smaller extraction.

## Phase 4: Individual Wizard Regression Refactor

- [ ] Update individual signup to use the parameterized `SignupStepper`.
- [ ] Update individual signup to use the parameterized `SignupWizardIntro`.
- [ ] Update individual signup to use the reusable `SignupEmailVerificationStep`.
- [ ] Move individual CEP formatting usage to the shared `format-cep.ts` utility.
- [ ] Update individual CPF validation to use real shared CPF validation.
- [ ] Verify individual safe draft persistence still stores only non-PII consent/preference fields.
- [ ] Verify `/signup/individual` search param behavior remains unchanged.
- [ ] Verify `/signup/individual-success` behavior remains unchanged.
- [ ] Run individual signup unit/component tests and fix regressions.

## Phase 5: Company Signup Schema And Draft

- [ ] Create company signup step values: `company-data`, `address`, `security`, `email-verification`.
- [ ] Create company signup full Zod schema.
- [ ] Create company signup step-specific schemas.
- [ ] Add company default form values.
- [ ] Add company step field name groups for current-step validation.
- [ ] Validate `Razão social` as required.
- [ ] Validate `Nome fantasia` as required.
- [ ] Validate `CNPJ` with shared CNPJ validator.
- [ ] Validate `CPF representante` with shared CPF validator.
- [ ] Validate `E-mail` as required e-mail shape.
- [ ] Validate `Telefone` with shared Brazilian phone shape rules.
- [ ] Reuse address validation behavior from individual signup where practical.
- [ ] Reuse security validation behavior from individual signup where practical.
- [ ] Create company safe draft helpers with a company-specific `sessionStorage` key.
- [ ] Persist only allowed non-PII consent/preference fields.
- [ ] Add company schema and safe draft unit tests.

## Phase 6: Company Signup UI And Routing

- [ ] Replace `/signup/company` placeholder with the company wizard route.
- [ ] Validate the company `step` search param.
- [ ] Normalize missing or invalid company step values to `company-data`.
- [ ] Add `/signup/company-success` route.
- [ ] Export company signup pages through `@/modules/auth`.
- [ ] Create company signup page composition using `SignupLayout`.
- [ ] Create company signup form wiring with React Hook Form.
- [ ] Render the `Dados da Empresa` step.
- [ ] Apply CNPJ, CPF, e-mail, and phone input behavior.
- [ ] Render the reusable address step or auth-owned equivalent.
- [ ] Render the reusable security step or auth-owned equivalent.
- [ ] Render the reusable OTP step without the stepper.
- [ ] Implement company back navigation by step.
- [ ] Navigate to `/signup/company-success` after local OTP success.
- [ ] Regenerate route types with `pnpm --filter web routes:generate`.

## Phase 7: Technical Responsible Schema And Draft

- [ ] Create technical responsible step values: `responsible-data`, `company-data`, `address`, `security`, `email-verification`.
- [ ] Create technical responsible full Zod schema.
- [ ] Create technical responsible step-specific schemas.
- [ ] Add technical responsible default form values.
- [ ] Add technical responsible step field name groups for current-step validation.
- [ ] Validate responsible `Nome` as required.
- [ ] Validate responsible `Sobrenome` as required.
- [ ] Validate responsible `CPF` with shared CPF validator.
- [ ] Validate responsible `Data de nascimento` with the same age rule used by individual signup.
- [ ] Validate `Documento de identificação` as required.
- [ ] Reuse company data validation for the company data step where practical.
- [ ] Reuse address validation behavior where practical.
- [ ] Reuse security validation behavior where practical.
- [ ] Create technical responsible safe draft helpers with a flow-specific `sessionStorage` key.
- [ ] Persist only allowed non-PII consent/preference fields.
- [ ] Add technical responsible schema and safe draft unit tests.

## Phase 8: Technical Responsible UI And Routing

- [ ] Replace `/signup/technical-responsible` placeholder with the technical responsible wizard route.
- [ ] Validate the technical responsible `step` search param.
- [ ] Normalize missing or invalid technical responsible step values to `responsible-data`.
- [ ] Add `/signup/technical-responsible-success` route.
- [ ] Export technical responsible signup pages through `@/modules/auth`.
- [ ] Create technical responsible signup page composition using `SignupLayout`.
- [ ] Create technical responsible signup form wiring with React Hook Form.
- [ ] Render the `Dados do Responsável` step.
- [ ] Render the `Dados da Empresa` step.
- [ ] Render the reusable address step or auth-owned equivalent.
- [ ] Render the reusable security step or auth-owned equivalent.
- [ ] Render the reusable OTP step without the stepper.
- [ ] Ensure stepper shows four visible steps with `Passo 1` through `Passo 4`.
- [ ] Implement technical responsible back navigation by step.
- [ ] Navigate to `/signup/technical-responsible-success` after local OTP success.
- [ ] Regenerate route types with `pnpm --filter web routes:generate`.

## Phase 9: Responsive And Accessibility Review

- [ ] Verify desktop company layout matches the current signup wizard visual language.
- [ ] Verify desktop technical responsible layout matches the screenshot visual language.
- [ ] Verify company wizard has no horizontal overflow at `320px` width.
- [ ] Verify technical responsible wizard has no horizontal overflow at `320px` width.
- [ ] Verify the compact stepper works for three visible steps.
- [ ] Verify the compact stepper works for four visible steps.
- [ ] Verify all inputs have accessible labels.
- [ ] Verify validation errors are associated with fields through `aria-describedby` and `aria-invalid`.
- [ ] Verify all clickable controls have clear focus-visible treatment.
- [ ] Verify disabled buttons cannot be triggered.
- [ ] Verify OTP slots remain visible and keyboard usable on mobile.
- [ ] Verify success screens use meaningful visible headings.

## Phase 10: Component And E2E Tests

- [ ] Add component tests for company first-step rendering.
- [ ] Add component tests for company requested-step rendering.
- [ ] Add component tests for technical responsible first-step rendering.
- [ ] Add component tests for technical responsible requested-step rendering.
- [ ] Add component or e2e coverage for three-step company stepper rendering.
- [ ] Add component or e2e coverage for four-step technical responsible stepper rendering.
- [ ] Add e2e happy path for company signup through local success.
- [ ] Add e2e happy path for technical responsible signup through local success.
- [ ] Add e2e invalid step normalization for company.
- [ ] Add e2e invalid step normalization for technical responsible.
- [ ] Add e2e back navigation coverage for company.
- [ ] Add e2e back navigation coverage for technical responsible.
- [ ] Add e2e safe draft persistence coverage for company.
- [ ] Add e2e safe draft persistence coverage for technical responsible.
- [ ] Add e2e mobile overflow coverage for company.
- [ ] Add e2e mobile overflow coverage for technical responsible.
- [ ] Add regression e2e coverage that individual signup still completes locally.

## Phase 11: Documentation Follow-Up

- [ ] Update this task plan as phases are completed.
- [ ] Update the PRD if product decisions change during implementation.
- [ ] Update `docs/web/conventions.md` if reusable signup wizard, mask, or validator conventions should become durable frontend guidance.
- [ ] Update `apps/web/src/modules/auth/AGENTS.md` if auth signup wizard structure rules should guide future agents.
- [ ] Update `apps/web/README.md` only if commands or high-level source structure change.
- [ ] Keep `docs/TODO.md` unchanged unless a cross-project backlog item is discovered outside this active task plan.

## Phase 12: Verification

- [ ] Run `pnpm --filter web routes:generate`.
- [ ] Run `pnpm --filter web check`.
- [ ] Run `pnpm --filter web typecheck`.
- [ ] Run `pnpm --filter web test`.
- [ ] Run `pnpm --filter web test:e2e`.
- [ ] Run `pnpm --filter web build`.
- [ ] Manually inspect `/signup/company` on desktop.
- [ ] Manually inspect `/signup/company` at mobile widths, including `320px`.
- [ ] Manually inspect `/signup/technical-responsible` on desktop.
- [ ] Manually inspect `/signup/technical-responsible` at mobile widths, including `320px`.
- [ ] Confirm no unrelated files were modified.
- [ ] Confirm docs links remain valid.
