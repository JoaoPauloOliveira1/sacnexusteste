# SAC Nexus Skill Governance

- Project-authored skills use the `sac-nexus-` prefix under `.agents/skills`.
- Downloaded skills keep their upstream names and remain vendor content.
- Encode project policy in a local wrapper instead of editing vendor skills.
- Create a project skill when a workflow repeats, local conventions are
  non-obvious, mistakes are costly, or review feedback recurs.
- Prefer a concise `AGENTS.md` rule for a simple invariant and initiative docs
  for short-lived scope.
- Keep `SKILL.md` procedural and concise; put focused detail in `references/`.
- When a durable workflow changes, update its normative documentation or
  `AGENTS.md` rule and the relevant project skill together.
- Record useful but unproven skills in `docs/skills-candidates.md`; do not
  install guidance before the corresponding technology or workflow exists.
