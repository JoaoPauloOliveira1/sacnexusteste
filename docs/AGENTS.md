# Documentation Agent Instructions

## Scope

- These instructions apply to files under `docs/**`.
- Root `AGENTS.md` still applies for monorepo-wide rules.
- App-specific docs should also follow the relevant app `AGENTS.md` when applicable.

## Language

- Write technical documentation in English.
- Keep filenames, headings, links, routes, and technical examples in English.
- Use Brazilian Portuguese only when documenting user-facing UI copy examples.

## Documentation Structure

- Initiative PRDs live in `docs/initiatives/prds`.
- Initiative execution plans live in `docs/initiatives/tasks`.
- Initiative source handoffs live in `docs/initiatives/sources`.
- Initiative templates live in `docs/initiatives/templates`.
- Durable frontend documentation lives in `docs/web`.
- Durable IDP documentation lives in `docs/idp`.
- Cross-project backlog items live in `docs/TODO.md`.
- Assets used by docs live in `docs/assets`.
- Candidate skills live in `docs/skills-candidates.md` until adopted or
  rejected.
- Cross-project agentic workflow architecture lives in
  `docs/agentic-workflows.md`.

## Initiative PRDs

- Use PRDs for decisions, scope, tradeoffs, requirements, risks, and acceptance criteria.
- Prefer sections such as Overview, Product Context, Goals, Non-Goals, Decisions, Requirements, Risks, Acceptance Criteria, Future Enhancements, Execution And Backlog, and Open Questions.
- Keep decisions explicit and traceable.
- Record non-goals to prevent scope creep.
- Link each PRD to its execution plan under `docs/initiatives/tasks`.
- Include explicit problem framing, gaps, assumptions, counterpoints,
  alternatives, boundaries, performance/scalability, accessibility,
  security/privacy/LGPD, observability, and verification when relevant.

## Task Plans

- Use task plans for executable work breakdowns.
- Start each task plan with a link to its PRD.
- Organize work by phases.
- Use checkboxes for every executable task.
- Keep tasks specific enough that another agent or developer can execute them without rediscovering the plan.
- Mark completed tasks when work is done.

## Durable Docs

- Use `docs/web` for frontend documentation that should outlive a single PRD.
- Use `docs/idp` for IDP documentation that should outlive a single PRD.
- Keep operational app setup in `apps/web/README.md`.
- Keep IDP operational app setup in `apps/idp/README.md`.
- Keep long-form architecture, deployment, testing, security, and conventions docs in `docs/web`.
- Keep long-form IDP architecture, testing, security, and conventions docs in `docs/idp`.
- Do not duplicate large sections between PRDs, plans, and durable docs; link
  instead.

## Agent Instructions

- Use `AGENTS.md` for concise local rules that affect agent behavior.
- Do not put long-form documentation inside `AGENTS.md`.
- Add nested `AGENTS.md` files only when a folder has meaningful local rules not covered by parent instructions.
- Prefer root, app-level, and docs-level agent files before adding deeper instructions.

## Maintenance

- Update links when files move.
- Keep backlog items in `docs/TODO.md` only when they are not already covered by an active task plan.
- Prefer updating an existing PRD or task plan over creating duplicate documents for the same initiative.
