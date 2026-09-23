---
name: tdd
description: Test-driven development for substantive feature, bug-fix, and behavior-changing work. Use automatically when implementing features, fixing bugs, or changing behavior (red → green → refactor). Also use when the user mentions TDD, /tdd, /TDD, or red-green-refactor. Do not use for documentation-only, formatting-only, exact generated-mirror, or provenance-only changes.
---

## This repository (Asymmetric-al/core)

These repo-owned sections are intentionally kept on top of the vendored
Matt Pocock TDD skill. If upstream refreshes replace this file, reconcile this overlay
before running `bun run skills:sync`.

TDD is the default workflow for substantive Core implementation. Do not wait for the user to type `/tdd` or `/TDD`. `/tdd` and `/TDD` resolve to this same workflow.

### Triggers

- Implementing a feature, bug fix, or behavior-changing refactor.
- The user mentions TDD, `/tdd`, `/TDD`, or red-green-refactor.
- Changing executable behavior, types, migrations, RLS, or generated-file
  contracts.

Do **not** invent an artificial RED test for documentation-only edits,
formatting-only edits, exact generated-mirror updates, or provenance-only
metadata.

### Workflow

1. Understand the expected behavior from the request, existing tests, and
   nearest public or architectural seam.
2. Inspect current implementation and tests. Use an established public seam
   without waiting for the user to approve an obvious seam.
3. Add or update a test that expresses the desired behavior or reproduces the
   bug.
4. Run it and confirm it fails for the expected reason when that is meaningful.
5. Make the smallest correct implementation change.
6. Run the focused test until it is green.
7. Refactor where justified while tests remain green. Refactoring **is** part
   of Core's loop after green.
8. Run broader relevant validation. Verify runtime or browser behavior when the
   change is user-visible.

Prefer characterization tests before changing poorly understood legacy
behavior. Prefer tests that prove behavior at a stable seam over
implementation-coupled tests.

### Checklist

- [ ] Substantive behavior change used TDD (or a documented exception)
- [ ] `/tdd` and `/TDD` were treated as this same workflow
- [ ] Established seams were used without blocking on user approval
- [ ] Refactor happened only after green, if at all
- [ ] Docs/format/mirror/provenance work did not invent a fake RED test

The vendored Matt Pocock body below is kept for provenance. These lines are
**non-operative in Core** and must not override the overlay:

- "Refactoring is not part of the loop."
- "Test only at pre-agreed seams" / confirm seams with the user before writing
  a test.
- "No production code without a failing test first" for documentation-only,
  formatting-only, exact generated-mirror, or provenance-only work.

---

# Test-Driven Development

TDD is the red → green loop. This skill is the reference that makes that loop produce tests worth keeping: what a good test is, where tests go, the anti-patterns, and the rules of the loop. Every section applies on every cycle: consult them before and during the loop, not after.

When exploring the codebase, read `CONTEXT.md` (if it exists) so test names and interface vocabulary match the project's domain language, and respect ADRs in the area you're touching.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't. A good test reads like a specification: "user can checkout with valid cart" tells you exactly what capability exists, and it survives refactors because it doesn't care about internal structure.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Seams: where tests go

A **seam** is the public boundary you test at: the interface where you observe behavior without reaching inside. Tests live at seams, never against internals.

**Test only at pre-agreed seams.** Before writing any test, write down the seams under test and confirm them with the user. No test is written at an unconfirmed seam. You can't test everything, so agreeing the seams up front is how testing effort lands on the critical paths and complex logic instead of every edge case.

Ask: "What's the public interface, and which seams should we test?"

When the shape of that interface is itself in question (how deep the module is, where the seam belongs, what the interface should expose), call the Skill tool with "codebase-design" for the vocabulary. It is the shared source of the module, interface, depth, seam, adapter, leverage and locality terms, and it is a reference to consult, not a session to run.

## Anti-patterns

- **Implementation-coupled**: mocks internal collaborators, tests private methods, or verifies through a side channel (querying the database instead of using the interface). The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological**: the assertion recomputes the expected value the way the code does (`expect(add(a, b)).toBe(a + b)`, a snapshot derived by hand the same way, a constant asserted equal to itself), so it passes by construction and can never disagree with the code. Expected values must come from an independent source of truth: a known-good literal, a worked example, the spec.
- **Horizontal slicing**: writing all tests first, then all implementation. Bulk tests verify _imagined_ behavior: you test the _shape_ of things rather than user-facing behavior, the tests go insensitive to real changes, and you commit to test structure before understanding the implementation. Work in **vertical slices** instead: one test → one implementation → repeat, each test a **tracer bullet** that responds to what the last cycle taught you.

## Rules of the loop

- **Red before green.** Write the failing test first, then only enough code to pass it. Don't anticipate future tests or add speculative features.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **Refactoring is not part of the loop.** It belongs to the review stage (see the `code-review` skill), not the red → green implementation cycle.
