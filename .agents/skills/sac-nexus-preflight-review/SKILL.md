---
name: sac-nexus-preflight-review
description: Perform a SAC Nexus preflight before changes move to review, QA, staging, production, commit, push, or PR creation. Use for final passes, readiness reviews, branch reviews, PR preparation, release readiness, or deciding whether local changes are safe to forward.
---

# SAC Nexus Preflight Review

Perform a factual, risk-focused senior-engineer review. Write the final report
in Brazilian Portuguese.

## Safety

- Do not modify, stage, commit, push, amend, force-push, open or merge a PR, or
  delete branches unless the user explicitly asks for that next action.
- Never revert user changes.
- Never read, grep, print, summarize, or modify real `.env` files.
- Treat untracked config, secrets, credentials, tokens, and generated private
  artifacts as suspicious without exposing their values.

## Required Inspection

1. Inspect status, branch, upstream, staged and unstaged diffs, commits ahead of
   the likely base, and recent commit style.
2. Compare feature work against `staging` unless evidence identifies another
   base. Read `AGENTS.md` files governing changed paths.
3. Review correctness, regressions, security, privacy/LGPD, auth and tenant
   isolation, logging, accessibility, UI states, SEO when relevant,
   performance/scalability, architecture, tests, CI/CD, and stale docs.
4. Determine expected usage assumptions without inventing capacity values.
5. Explicitly decide documentation impact across README, durable docs,
   initiative docs, backlog, AGENTS, and `sac-nexus-*` skills.
6. Run the smallest relevant checks first. Diagnose failures and distinguish
   branch-caused failures from unrelated failures without fixing in review-only
   mode.

## Verification Defaults

- Web: `pnpm --filter web check`, `typecheck`, `test`, and `build`; add E2E when
  routes, auth, forms, navigation, or responsive behavior changed.
- IDP: `pnpm --filter idp check`, `typecheck`, `test`, and `build`; inspect
  migrations and OpenAPI when affected.
- Cross-workspace: use root checks only when scope justifies the broader cost.
- Docs only: validate links, paths, consistency, and `git diff --check`.

## Output

Return: readiness; blocking findings; non-blocking risks; verification;
capacity/performance assumptions; documentation decision; Conventional Commit
recommendation; PR title, target, and body; next authorized action. Include
file and line references for concrete findings.

For feature PRs to `staging`, include the initial trigger exactly once:
`@codex review in Brazilian Portuguese`. For `staging` to `main` promotion PRs,
omit the trigger.
