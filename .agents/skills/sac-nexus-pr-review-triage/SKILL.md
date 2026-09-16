---
name: sac-nexus-pr-review-triage
description: Triage SAC Nexus pull request feedback and optionally fix valid findings. Use when inspecting PR comments, addressing requested changes, resolving review threads, responding to reviewers, handling Codex or GitHub review feedback, or moving a feature PR forward.
---

# SAC Nexus PR Review Triage

Treat every review item as a hypothesis. Write summaries and GitHub replies in
Brazilian Portuguese while preserving technical identifiers in English.

## Applicability And Safety

- Use for feature PRs targeting `staging`. For `staging` to `main` promotion
  PRs, report that feature-review triage does not apply.
- If the PR cannot be inferred, request its URL or number.
- Do not commit, push, amend, force-push, merge, close, dismiss reviews, or
  delete branches without explicit authorization.
- Reply to or resolve a thread only after evidence-based classification.
- Never read real `.env` files or expose sensitive values.

## Inspection And Classification

Collect local status, branch/upstream, the base diff, PR metadata, reviews,
issue comments, inline comments, review-thread IDs, and check summaries. Read
the `AGENTS.md` files governing touched paths.

Classify every distinct actionable item as `Valid`, `False positive`, `Already
fixed`, `Needs clarification`, or `Non-actionable`. Record source, thread and
comment IDs, file/line, evidence, action, and exact proposed reply.

## Handling

1. Classify the complete current cycle before fixing, except for an urgent
   security or production issue.
2. For valid findings, make the smallest in-scope fix only in fix mode; add
   regression coverage and verify it.
3. For false positives, change no code and reply with concise evidence.
4. Resolve already-fixed, non-actionable, and false-positive threads only when
   unambiguous. Ask and leave open anything needing clarification.
5. Check performance, tenant isolation, auth, sensitive logging, docs, and
   architecture implications for every valid fix.
6. Batch fixes and automated review cycles. Do not request another review while
   one is pending; limit Codex review to the initial cycle plus one follow-up
   unless the user explicitly asks or scope materially changes.

## Verification And Output

Run targeted package checks first, using `sac-nexus-preflight-review` defaults.
Report PR context; classification counts; handled valid findings; false
positives; already-fixed/non-actionable items; clarifications; verification;
capacity/performance assumptions; documentation decision; remaining risk; and
next authorized action.
