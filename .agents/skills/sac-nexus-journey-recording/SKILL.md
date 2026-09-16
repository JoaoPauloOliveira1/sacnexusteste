---
name: sac-nexus-journey-recording
description: Create, update, run, and validate guided SAC Nexus stakeholder journey recordings with Playwright-driven pointers, highlights, Brazilian Portuguese captions, deliberate pacing, MP4 conversion, privacy constraints, and artifact reports. Use when a user asks to record, re-record, demonstrate, walk through, or produce a shareable video of a SAC Nexus browser journey.
---

# SAC Nexus Journey Recording

Create repeatable stakeholder demonstrations without turning editorial recordings into
end-to-end tests. Preserve the accepted application journey and use the shared recording
runtime instead of duplicating browser, presentation, conversion, or reporting logic.

## Read the Local Contracts

Before changing a recording:

1. Read the root `AGENTS.md` and `apps/web/AGENTS.md`.
2. Read `docs/web/journey-recordings.md`.
3. Read the relevant journey in `docs/web/journeys/`.
4. Inspect existing files in `apps/web/scripts/journey-recordings/`.
5. Inspect the relevant presentation-mode fixtures and page behavior.

Never read real `.env` files. Use only fictional presentation data.

## Keep the Boundary Explicit

- Store scenario scripts in `apps/web/scripts/journey-recordings/`.
- Reuse `lib/recording-runtime.mjs` for browser setup, artifacts, conversion, failure
  screenshots, browser-error reporting, and optional downloaded documents.
- Reuse `lib/presentation-layer.mjs` for title cards, captions, highlights, pointers,
  guided clicks, guided typing, and standard timing.
- Store generated outputs under `apps/web/artifacts/journey-recordings/`; keep them
  ignored by Git.
- Keep regression assertions in Playwright E2E tests. A recording is an editorial
  stakeholder artifact and must not replace E2E coverage.
- Do not make recordings a required CI gate unless an approved initiative explicitly
  introduces that policy.

## Build the Scenario

1. Select one coherent, accepted journey and name the exact decision branch.
2. Map its story beats before scripting:
   - context and persona;
   - user intent;
   - meaningful inputs;
   - decision or state transition;
   - outcome and next action.
3. Write visible captions in Brazilian Portuguese. Keep code, filenames, routes, report
   fields, and artifact slugs in English.
4. Drive the real UI through accessible locators. Do not fake an application state solely
   for the video when the presentation-mode flow can reach it.
5. Use a 1600 by 900 light viewport unless the requested channel needs another format.
6. Give routine actions about one second, readable content about two seconds, and key
   decisions or outcomes about three seconds. Do not obscure the element being explained.
7. Start with a title card and finish with a concise outcome card.

When adding a scenario, expose a package-level command such as:

```json
"record:risk-one": "node scripts/journey-recordings/record-risk-one.mjs"
```

Do not add root orchestration unless multiple packages need the task.

## Protect Privacy and Credibility

- Use only fixtures, demonstration accounts, fictional companies, synthetic documents,
  and non-sensitive identifiers.
- Never display real credentials, tokens, personal data, production documents, or internal
  secrets.
- Keep the pointer cadence human-readable and show enough context to understand why each
  action occurs.
- Treat downloads as part of the recorded journey only when the output is generated from
  presentation data.
- If the scenario cannot reach the promised outcome through the product, stop and report
  the product gap instead of editing the video to imply success.

## Run and Validate

Start the local app:

```bash
pnpm --filter web dev --host 127.0.0.1
```

Run the scenario command from the repository root, for example:

```bash
pnpm --filter web record:risk-one
```

Then verify:

1. `recording-report.json` has an empty `browserErrors` array.
2. The MP4 decodes without errors:

   ```bash
   ffmpeg -v error -i path/to/recording.mp4 -f null -
   ```

3. The downloaded document opens when the journey generates one.
4. A contact sheet and key frames show correct captions, pointer placement, spacing, and
   final outcome.
5. The resulting duration feels deliberate rather than rushed or idle.
6. Relevant lint, type, build, and journey E2E checks still pass.

Use `node --check` for every changed `.mjs` file and run `git diff --check` before handoff.

## Keep Documentation Durable

Update `docs/web/journey-recordings.md` when the recording convention, shared runtime,
validation rules, or supported scenarios change. Update the relevant journey document when
the product journey changes. Update README or package commands only when developer
discovery changes.

At handoff, report:

- the recorded branch and persona;
- the artifact path, format, resolution, and duration;
- whether browser errors and video decoding were clean;
- any product or Figma divergence discovered while recording.
