# Unit Of Work Plan

## Purpose

Decompose the approved `apps/idp` application design into manageable units of work for Construction phase design and code generation.

## Context

- Execution plan: `aidlc-docs/inception/plans/execution-plan.md`.
- Requirements: `aidlc-docs/inception/requirements/requirements.md`.
- User stories: `aidlc-docs/inception/user-stories/stories.md`.
- Application design: `aidlc-docs/inception/application-design/`.
- Primary application package: `apps/idp`.

## Proposed Decomposition

Use four sequential units aligned with the approved roadmap and application design:

1. IDP Event Publication Foundation.
2. Better Auth Organization And Membership Model.
3. Tenant Domain And Alias Resolution.
4. IDP Bootstrap Scripts.

## Decomposition Questions

Please answer every `[Answer]:` tag before unit artifacts are generated.

### Question 1
Should the four-unit decomposition proposed in the execution plan remain the final unit structure?

A) Yes, keep four units exactly as proposed
B) Combine event publication and organization/membership into one unit
C) Combine tenant resolution and bootstrap scripts into one unit
D) Split tenant resolution into separate database/model and HTTP endpoint units
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What dependency sequence should units follow?

A) Strict sequence: events, organization/membership, tenant resolution, bootstrap scripts
B) Events first, then organization/membership and tenant resolution in parallel, then bootstrap scripts
C) Organization/membership first, then events, then tenant resolution, then bootstrap scripts
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 3
How should documentation updates be assigned across units?

A) Each unit updates only its directly affected docs as part of that unit
B) Defer most documentation to the final bootstrap/scripts unit
C) Create a separate documentation-only unit after all implementation units
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 4
How should database migration work be grouped?

A) Keep all schema/migration work inside the organization/membership unit
B) Split schema/migration work between organization/membership and tenant resolution units
C) Create a dedicated database migration unit before application logic units
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
How should PBT responsibilities be assigned?

A) Assign PBT to every unit where pure helpers or transformations exist
B) Put all PBT work in the tenant resolution unit because host normalization is the main PBT target
C) Defer PBT assignment to Code Generation planning only
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 6
What should be the team/ownership assumption for unit planning?

A) Single developer/agent executes units sequentially
B) Multiple developers/agents may execute independent units after dependencies are defined
C) Keep units independent enough for parallel execution, but plan for sequential execution by default
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Mandatory Unit Artifacts To Generate After Approval

- [x] Generate `aidlc-docs/inception/application-design/unit-of-work.md` with unit definitions and responsibilities.
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-dependency.md` with dependency matrix.
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-story-map.md` mapping stories to units.
- [x] Validate unit boundaries and dependencies.
- [x] Ensure all stories are assigned to units.

## Generation Checklist

- [x] Load answered unit plan questions.
- [x] Validate answers for ambiguity or contradictions.
- [x] Generate unit definitions and responsibilities.
- [x] Generate unit dependency matrix and sequence.
- [x] Generate story-to-unit mapping.
- [x] Validate all stories are assigned.
- [x] Include Security Baseline considerations for each unit.
- [x] Include PBT considerations for each unit.
- [x] Update `aidlc-state.md` and `audit.md`.

## Approval Gate

Unit artifacts will not be generated until all decomposition questions are answered and validated.
