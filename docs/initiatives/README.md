# Initiatives

Initiatives describe meaningful product or engineering work before
implementation.

```txt
docs/initiatives/
  templates/
    prd-template.md
    task-template.md
  prds/
    01-example-initiative.md
  tasks/
    01-example-initiative.md
  sources/
    optional-design-or-domain-handoff.md
```

## Workflow

1. Create or update a PRD under `prds/`.
2. Brainstorm problem framing, gaps, assumptions, counterpoints, alternatives,
   boundaries, performance/scalability, accessibility, security/privacy/LGPD,
   abuse, logging/observability, and verification before locking the solution.
3. Create or update the matching execution plan under `tasks/`.
4. Use `sac-nexus-initiative-workflow` and the relevant architecture/app skills.
5. Keep acceptance criteria, task state, verification evidence, risks, and
   deferrals explicit.

Use a numeric prefix and short English slug. The PRD and task plan must have the
same filename and link to one another.
