# SAC Nexus Documentation Decisions

Document durable changes that future contributors need to understand, operate,
extend, or review.

## Update Targets

- Root `README.md`: workspace overview, prerequisites, common commands, app
  capabilities, or contributor setup.
- App `README.md`: app commands, environment variables, routes, local setup,
  deployment, or operations.
- `docs/web` and `docs/idp`: architecture, conventions, testing, security,
  deployment, and runtime behavior expected to outlive one initiative.
- `docs/initiatives/prds` and `docs/initiatives/tasks`: scope, decisions,
  acceptance criteria, execution state, verification, or deferrals.
- `docs/TODO.md`: cross-project follow-up not owned by an active initiative.
- `AGENTS.md`: concise durable instructions every future agent needs.
- `sac-nexus-*` skills: repeated workflows or implementation behavior an agent
  should execute consistently.

Do not add documentation for an internal refactor or test-only cleanup when no
contract, workflow, convention, operation, or future-agent behavior changes.
During review, state why documentation is unnecessary only after checking every
target above.
