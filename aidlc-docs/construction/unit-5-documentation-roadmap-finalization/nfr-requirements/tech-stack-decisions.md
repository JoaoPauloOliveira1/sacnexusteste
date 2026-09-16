# Tech Stack Decisions: Unit 5 Documentation And Roadmap Finalization

## Existing Documentation Stack Reuse

Unit 5 uses existing project documentation surfaces and tooling:

- Markdown files for durable documentation.
- `apps/idp/README.md` for IDP operational quick-start and command usage.
- `docs/idp/*` for long-form IDP architecture, security, testing, and deployment guidance.
- `idp-architecture-discussion.md` for roadmap checklist state.
- `docs/TODO.md` for cross-project backlog items only when needed.
- Existing pnpm/Biome checks where applicable.

## Decision 1: No New Documentation Tooling

- **Decision**: Do not add markdown linting dependencies, docs site generators, or documentation build tooling.
- **Rationale**: Unit 5 only updates existing Markdown docs and should not expand toolchain scope.
- **Rejected Alternatives**: Add a markdown linter, documentation site generator, or docs CI pipeline in this unit.

## Decision 2: README For Operational Quick Start

- **Decision**: Put bootstrap command usage, required flags, safe output policy, rerun behavior, and smoke-test commands in `apps/idp/README.md`.
- **Rationale**: Operators and developers already use the package README for app-level commands.
- **Rejected Alternatives**: Put all operational command details only in architecture notes or AI-DLC artifacts.

## Decision 3: `docs/idp/*` For Long-Form Guidance

- **Decision**: Use durable IDP docs for architecture, security, testing, deployment assumptions, and future integration guidance.
- **Rationale**: These details should outlive a single implementation unit and remain discoverable outside the app README.
- **Rejected Alternatives**: Duplicate large sections in README or only update roadmap notes.

## Decision 4: Evidence-Based Roadmap Updates

- **Decision**: Mark roadmap items complete only when Units 1 through 4 summaries and verification results support the claim.
- **Rationale**: Prevents documentation from overstating maturity or hiding deferred work.
- **Rejected Alternatives**: Mark everything complete because the AI-DLC cycle is ending, or avoid roadmap updates entirely.

## Decision 5: Synthetic-Only Examples

- **Decision**: Use only synthetic domains, emails, placeholders, and safe IDs.
- **Rationale**: Documentation often gets copied into issues, PRs, logs, and chat. It must not contain realistic credentials or sensitive data.
- **Rejected Alternatives**: Use examples from manual tests or real environment values for clarity.

## Decision 6: Minimal Backlog Updates

- **Decision**: Update `docs/TODO.md` only for deferred work not already captured by durable docs or active plans.
- **Rationale**: Keeps backlog useful and avoids turning it into an unbounded idea dump.
- **Rejected Alternatives**: Add every future idea from architecture discussion or omit all future gaps.

## Decision 7: Existing Verification Only

- **Decision**: Use relevant existing project checks and manual sensitive-value review.
- **Rationale**: Docs-only changes do not justify production deploy pipeline execution or new tooling.
- **Required Verification**: `pnpm --filter idp check` if app docs or package files are touched, plus manual inspection for forbidden examples.

## Dependency Impact

- No runtime dependency changes.
- No dev dependency changes.
- No schema or migration changes.
- No new documentation toolchain.

## Security Compliance

- **SECURITY-03**: Existing Markdown surfaces are sufficient when synthetic-only example rules are followed.
- **SECURITY-09**: Documentation must not recommend unsafe operational behavior.
- **SECURITY-10**: No dependency changes.
- **SECURITY-11**: Known gaps remain traceable.
- **SECURITY-12**: Better Auth boundaries remain documented.
- **SECURITY-13**: Event/audit durability limits remain documented.
- **SECURITY-15**: Fail-safe behavior remains documented.

## PBT Compliance

- **PBT-01/PBT-10**: Document Unit 3 `fast-check` coverage and example-test complementarity.
- **PBT-08**: Mention seed/shrinking reproducibility only if wording stays accurate.
