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

---

Test-driven development.

## When to Use

When the user wants to build a new feature or fix a bug.

## The Process

1. Write a failing test
2. Implement the code to make the test pass
3. Repeat

That's it.

## Rules

- **No production code** without a failing test first.
- **No extra features** beyond what the test requires.
- **Refactoring is not part of the loop.** That's a separate process.

## Test Design

- Test only at pre-agreed seams. Before writing any test, write down the seams under test and confirm them with the user.
- Tests should be independent of implementation details.
- Tests should be as nested as possible, following the [one-assertion-per-test](https://www.betterspecs.org/#single) pattern.
- Tests should cover as few files as possible, ideally one file per test, following the [one-behavior-per-test](https://www.betterspecs.org/#one-behavior) pattern.
- Tests should be as fast as possible, following the [fast-tests](https://www.betterspecs.org/#slow) pattern.
- Tests should be as isolated as possible, following the [isolated-tests](https://www.betterspecs.org/#isolation) pattern.
- Tests should be as repeatable as possible, following the [repeatable-tests](https://www.betterspecs.org/#repeatable) pattern.
- Tests should be as self-checking as possible, following the [self-checking-tests](https://www.betterspecs.org/#self-checking) pattern.
- Tests should be as timely as possible, following the [timely-tests](https://www.betterspecs.org/#timely) pattern.

## Examples

```ts
it("should return a list of users", () => {
  const users = getUsers();
  expect(users).toEqual(["user1", "user2", "user3"]);
});
```

```ts
it("should return a list of users", () => {
  const users = getUsers();
  expect(users).toEqual(["user1", "user2", "user3"]);
});
```
