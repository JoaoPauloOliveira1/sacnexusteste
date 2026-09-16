# Unit 1 NFR Requirements Clarification Questions

I detected one inconsistency that must be resolved before generating Unit 1 NFR requirements.

## Inconsistency 1: Event Payload Safety Tests

The approved Functional Design requires tests to include a reusable assertion helper for forbidden keys and representative forbidden values. In the NFR plan, Question 3 was answered with example-based tests only, without the reusable helper.

## Question 1
Which event payload safety test approach should Unit 1 use?

A) Keep the approved Functional Design: example-based tests plus a reusable forbidden-key/forbidden-value assertion helper
B) Change the Functional Design requirement: example-based tests only, no reusable assertion helper
C) Use example-based tests now, but create the helper only if duplicate assertions appear during code generation
X) Other (please describe after [Answer]: tag below)

[Answer]: A
