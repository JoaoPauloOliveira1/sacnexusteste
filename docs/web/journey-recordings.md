# Journey Recordings

SAC Nexus can produce guided browser recordings for stakeholder journey
validation. These recordings are presentation artifacts and remain separate
from Playwright regression tests.

## Purpose

Recordings communicate the user journey, decision points, and visible state
transitions. They do not replace automated assertions, accessibility review,
or production integration testing.

The recording layer adds:

- a visible synthetic pointer;
- a highlight around the active control or result;
- Portuguese step captions;
- deliberate pauses for reading and decision points;
- deterministic presentation fixture data;
- a generated report containing output metadata and browser errors.

## Available Recordings

Start the web development server:

```bash
pnpm --filter web dev --host 127.0.0.1
```

Run one guided recording:

```bash
pnpm --filter web record:risk-one
pnpm --filter web record:risk-two:no-inspection
pnpm --filter web record:risk-two:with-inspection
pnpm --filter web record:risk-two:requirement
```

Regenerate the complete accepted set:

```bash
pnpm --filter web record:journeys
```

Install `ffmpeg` when MP4 output is required. On macOS:

```bash
brew install ffmpeg
```

The recorder uses `http://127.0.0.1:5173` by default. Override the target with
the public `JOURNEY_BASE_URL` process variable when necessary:

```bash
JOURNEY_BASE_URL=http://127.0.0.1:4173 pnpm --filter web record:journeys
```

Outputs are generated under one directory per accepted scenario:

```text
apps/web/artifacts/journey-recordings/
├── risk-one-automatic-issuance/
├── risk-two-document-requirement/
├── risk-two-no-inspection/
└── risk-two-with-inspection/
```

Each scenario directory contains:

- the MP4 recording when `ffmpeg` is available;
- the original WebM recording as a fallback;
- the generated demonstration document PDFs;
- `recording-report.json` with viewport, artifact, and browser-error metadata;
- `contact-sheet.jpg` and `final-frame.jpg` when visual validation is run;
- a failure screenshot if the scripted journey cannot complete.

The accepted scenario set is:

| Scenario | Personas | Decision and outcome |
| --- | --- | --- |
| Risco 1 — automatic issuance | Contributor | Low-risk classification and automatic DDLCB issuance |
| Risco 2 — no inspection | Contributor, triager, technical analyst | Administrative and technical approval, prior inspection waived, AVCB and inspection attestation issued |
| Risco 2 — with inspection | Contributor, triager, technical analyst, inspector | Inspection required, scheduled, performed, and approved before both documents are issued |
| Risco 2 — document requirement | Contributor, triager, technical analyst | Administrative requirement, contributor correction with attachment, new triage, inspection waived, and both documents issued |

Recordings use the real canonical browser process aggregate. Profile changes
must preserve the same protocol instead of reseeding a persona-specific
fixture. A requirement emitted by an internal role must appear in the
contributor portal, and its response must return to the originating internal
queue.

Generated artifacts are intentionally ignored by Git. Keep the recorder source
under `apps/web/scripts/journey-recordings` so the same journey can be
re-recorded after product or design changes.

## Recorder Architecture

Each recording is a small scenario file that drives one accepted journey. The
shared infrastructure lives beside the scenarios:

```text
apps/web/scripts/journey-recordings/
├── lib/
│   ├── presentation-layer.mjs
│   ├── recording-runtime.mjs
│   └── risk-two-journey.mjs
├── record-risk-one.mjs
├── record-risk-two-no-inspection.mjs
├── record-risk-two-requirement.mjs
└── record-risk-two-with-inspection.mjs
```

- `recording-runtime.mjs` owns browser setup, artifacts, MP4 conversion,
  failure screenshots, downloaded documents, and browser-error reporting.
- `presentation-layer.mjs` owns the pointer, highlights, captions, title cards,
  guided interactions, and editorial timing.
- `risk-two-journey.mjs` owns the reusable cross-profile Risco 2 sequence and
  its inspection and requirement branches.
- scenario files own only the persona, story beats, accessible locators,
  presentation inputs, decision branch, and expected visible outcome.

Use the project `sac-nexus-journey-recording` skill when adding or updating a
stakeholder recording. Do not copy the shared runtime into scenario files.

## Editorial Defaults

- Resolution: 1600 × 900.
- Language: Brazilian Portuguese for visible captions.
- Audio: none.
- Pace: human-readable typing and explicit pauses at classification,
  declaration, processing, and issuance.
- Fixture: synthetic contributor and firefighter profiles sharing one
  versioned browser presentation process state.

## Acceptance Checks

Before sharing a recording:

1. Confirm `browserErrors` is empty in `recording-report.json`.
2. Decode the complete MP4 with `ffmpeg`.
3. Confirm the video is 1600 × 900.
4. Validate every downloaded PDF and its reported file size.
5. Inspect a contact sheet and the final frame.
6. Run the related Playwright journey coverage and frontend checks.

The browser recording must not contain real credentials, personal data,
documents, tokens, or production process records.
