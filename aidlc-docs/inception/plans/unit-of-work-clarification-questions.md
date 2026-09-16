# Unit Of Work Clarification Questions

I detected two ambiguities in `aidlc-docs/inception/plans/unit-of-work-plan.md` that must be resolved before unit artifacts are generated.

## Ambiguity 1: Parallel Work And Migration Dependency

You selected parallel execution after the event unit, but also selected keeping all schema/migration work inside the organization/membership unit. Tenant resolution depends on tenant/domain lookup tables, so it may be blocked until those migrations exist.

### Question 1
How should the unit dependency sequence handle schema/migration work?

A) Keep four units, but make tenant resolution depend on completion of organization/membership schema/migrations before implementation starts
B) Keep four units and split schema/migration work so tenant resolution owns tenant-domain schema/migrations
C) Keep four units and allow parallel design, but require sequential code generation for organization/membership before tenant resolution
X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Ambiguity 2: PBT Assignment And Enabled PBT Rules

You selected assigning PBT work to the tenant resolution unit because host normalization is the main PBT target. However, the PBT extension is enabled as a blocking constraint, so any other unit that introduces property-bearing pure helpers must still evaluate and cover those properties.

### Question 2
How should PBT ownership be represented in the unit plan?

A) Tenant resolution owns primary PBT setup and host generators, while other units still add PBT if their code introduces property-bearing pure helpers
B) Tenant resolution is the only unit allowed to contain PBT, and other units must avoid property-bearing pure helpers where possible
C) Every unit must explicitly include a PBT evaluation section, even if most PBT tests are expected in tenant resolution
X) Other (please describe after [Answer]: tag below)

[Answer]: B
