# Agentic Workflow Architecture

SAC Nexus separates durable rules, project knowledge, execution workflows, and
tool entrypoints so future agents do not need to rediscover the repository or
follow duplicated instructions.

## Information Layers

| Layer | Responsibility | Source |
| --- | --- | --- |
| Agent instructions | Short normative invariants and safety boundaries | Root and nested `AGENTS.md` files |
| Durable documentation | Architecture, security, testing, deployment, and conventions | `docs/web`, `docs/idp`, and app README files |
| Initiative records | Decisions, alternatives, acceptance criteria, tasks, and evidence | `docs/initiatives` |
| Project skills | Repeatable SAC Nexus workflows and routing to sources of truth | `.agents/skills/sac-nexus-*` |
| Vendor skills | Upstream framework and tool guidance | Other `.agents/skills/*` entries and `skills-lock.json` |
| Commands | Thin user entrypoints that delegate to project skills | `.opencode/commands` |

Do not duplicate long-form rules across layers. `AGENTS.md` states the invariant,
durable docs explain it, a project skill tells an agent how to act on it, and a
command only invokes the workflow.

## Project Skills

| Skill | Responsibility |
| --- | --- |
| `sac-nexus-architecture` | Decide app, module, package, documentation, and skill ownership |
| `sac-nexus-initiative-workflow` | Plan and execute paired PRDs and task plans |
| `sac-nexus-web-development` | Route React SPA work through web conventions and checks |
| `sac-nexus-idp-development` | Route identity work through IDP security and architecture |
| `sac-nexus-preflight-review` | Review branch readiness without mutating it |
| `sac-nexus-pr-review-triage` | Classify PR feedback and handle evidence-backed fixes/threads |
| `sac-nexus-release-workflow` | Govern staging-to-production promotion, deployment, and rollback |

Project skills wrap local policy and may route to vendor skills for framework
details. Do not edit downloaded skills to add SAC Nexus rules.

## Reference Project Skill Assessment

The Triad skill catalog was assessed by responsibility, not copied as a bundle:

- Architecture, initiative, web/studio development, IDP development, preflight,
  PR review, and release responsibilities received SAC Nexus-native equivalents.
- Better Auth, GitHub Actions, shadcn, and React composition guidance already
  exist as upstream-owned Nexus skills and were not duplicated.
- Accessibility, React effect/performance, Tailwind design-system, and UX-copy
  guidance remain explicit candidates until recurring Nexus work justifies
  installing them.
- Astro, Astro SEO, Elysia, FastAPI, Triad site/API conventions, Release Please,
  and Linear workflow were not adopted because their frameworks or operational
  contracts do not exist in SAC Nexus today.

## Initiative Lifecycle

1. Use `initiative-discovery` for structured discovery when the goal is rough.
2. Create matching files in `docs/initiatives/prds` and
   `docs/initiatives/tasks`.
3. Implement with the architecture skill and the owning app skill.
4. Record verification evidence and update task checkboxes only after evidence
   exists.
5. Use `preflight` before handoff.
6. Open feature PRs against `staging`; triage feedback with `pr-review`.
7. Promote `staging` to `main` only through the production workflow.

## Adoption Rules

- Add a project skill only for repeated, non-obvious, or high-risk behavior.
- Add a nested `AGENTS.md` only when a directory has meaningful local rules.
- Add a vendor skill only when the corresponding technology or recurring need
  exists; track unproven ideas in `docs/skills-candidates.md`.
- Keep release publication separate from application deployment. The current
  repository has deployment workflows but no versioned GitHub Release process.
- Do not import architecture from another project when its runtime, package
  manager, framework, branch policy, or external workflow does not match SAC
  Nexus.
