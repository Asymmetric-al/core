# Test Design: From Requirements to Test Cases

> **When to use**: A QA engineer hands you a ticket, PRD or acceptance criteria and asks what to test, which cases to automate first, or for a test plan Playwright's generator can turn into specs.
> **Prerequisites**: [core/test-architecture.md](../core/test-architecture.md), [core/test-agents.md](../core/test-agents.md)

## Quick Reference

1. **Extract behaviors**: one line per rule in the requirement ("codes are 4-12 characters", "expire at midnight UTC"), plus the implicit ones (permissions, empty states, errors).
2. **Apply a technique per rule**: boundaries for ranges, partitions for input classes, decision tables for rule combinations, state transitions for lifecycles.
3. **Add negative and abuse paths**: invalid input, wrong role, repeated submit, expired or used-up resources.
4. **Rank by risk**: impact × likelihood. Automate the top of the list first.
5. **Pick the lowest layer that proves it**: logic at unit/API, wiring and user-visible flows at E2E.
6. **Write the plan** in the Test Agents spec format so it can be generated, and keep a requirement → case map.

## Patterns

### Pattern 1: Pick the Technique From the Rule

**Use when**: Turning each requirement line into cases.

| Rule shape | Technique | Cases it produces |
|---|---|---|
| A range ("4-12 characters", "1-99 items") | Boundary value analysis | min-1, min, max, max+1 (and one mid value) |
| Input classes ("alphanumeric", "valid email") | Equivalence partitioning | one valid and one invalid case per class, not every value |
| Combined conditions ("member AND cart > $50 → free shipping") | Decision table | one case per meaningful row; collapse rows with the same outcome |
| A lifecycle (order: pending → paid → shipped → delivered / cancelled) | State transition | every allowed transition once, plus the forbidden ones (cancel after delivered) |
| Time ("expires at midnight UTC") | Boundaries on the clock | just before, at, and after the boundary; a non-UTC browser timezone |
| Limits ("each code has a usage limit") | Boundaries on counters | last allowed use, first rejected use, two users racing for the last use |

**Example**: "Users can apply one discount code at checkout. Codes are 4-12 alphanumeric characters, expire at midnight UTC on their end date, and each code has a usage limit."

| ID | Case | Technique | Expected | Layer |
|---|---|---|---|---|
| DC-01 | Valid 4-char and 12-char codes | Boundary | Discount applied | API |
| DC-02 | 3-char and 13-char codes | Boundary | Validation error, no discount | API |
| DC-03 | Code with `-` or a space | Partition (invalid class) | Validation error | API |
| DC-04 | Code whose end date is today (UTC) | Time boundary | Applied | API (code seeded with end date = today) |
| DC-05 | Code whose end date was yesterday (UTC) | Time boundary | "Code expired" | API (code seeded with end date = yesterday) |
| DC-06 | Expiry shown to a user in UTC-8 | Time boundary (display) | Shows the UTC-midnight end in local time, not the local date | E2E with `timezoneId` |
| DC-07 | Last remaining use, then one more | Counter boundary | First applied, second "limit reached" | API |
| DC-08 | Apply a second code when one is applied | Rule ("one code") | Second rejected or replaces the first, per spec | E2E |
| DC-09 | Happy path: apply code, total updates, order shows discount | Flow | Correct total on review and confirmation | E2E |

DC-08 exposes an ambiguity ("rejected or replaces?"). Raise it with the product owner instead of guessing; an unanswered question is a finding.

Server-side time can't be faked from Playwright: `page.clock` only changes the browser's `Date`. For the exact-second boundary (23:59:59 vs 00:00:00 UTC) the app needs a test hook, such as an injectable clock or a test-only time endpoint; otherwise seed codes with end dates relative to now, as DC-04 and DC-05 do. Use `page.clock` only where the browser computes the time, such as an "expires in 3 hours" countdown ([clock-and-time-mocking.md](../core/clock-and-time-mocking.md)). For the browser timezone, `use: { timezoneId: 'America/Los_Angeles' }`.

### Pattern 2: Rank by Risk Before Automating

**Use when**: There are more cases than time, which is always.

Score each case 1-3 on **impact** (money, data loss, security, blocked users) and **likelihood** (new or complex code, frequent change, past bugs). Automate in descending order of impact × likelihood.

| Score | Action |
|---|---|
| 6-9 | Automate now; tag `@smoke` if it guards a core flow |
| 3-4 | Automate in the regression suite |
| 1-2 | Manual or exploratory check, or skip with a written reason |

Tag with the `tag` option so CI can run tiers separately (`npx playwright test --grep @smoke`). See [test-organization.md](../core/test-organization.md).

### Pattern 3: Push Each Case to the Lowest Layer That Proves It

**Use when**: Deciding which cases become Playwright E2E tests.

- **Unit / API**: validation rules, calculations, permissions, state transitions. Fast, and they fail with a precise message. Playwright's `request` fixture covers the API layer ([api-testing.md](../core/api-testing.md)).
- **E2E**: that the UI is wired to those rules (error shown, total updates), the critical happy path, and cross-page flows.

A password-reset feature, for example: token expiry, reuse and weak-password rules are API tests; "user requests a reset, opens the email link, sets a password, and can log in" is one E2E test. <!-- pragma: allowlist secret -->

### Pattern 4: Write the Plan in the Generator's Format

**Use when**: The plan will be turned into Playwright tests by an agent (yours or Playwright's generator).

Save to `specs/<feature>.md` in the same shape Playwright's planner writes (1.64), so hand-written and generated plans look alike. Each `###` group becomes a `test.describe`, each `####` scenario a test in its `**File:**`, and each `- expect:` line an assertion after that step:

```markdown
# Cart - Test Plan

## Application Overview

Shop cart: add products, see the badge count, check out.

## Test Scenarios

### 1. Cart

**Seed:** `tests/seed.spec.ts`

#### 1.1. Add item to cart

**File:** `tests/cart/add-item.spec.ts`

**Steps:**
  1. Open the product page for "Blue Mug"
  2. Click "Add to cart"
    - expect: Cart badge shows "1"
  3. Open the cart
    - expect: Cart lists "Blue Mug" with quantity 1

#### 1.2. Empty cart message

**File:** `tests/cart/empty-cart.spec.ts`

**Steps:**
  1. Open the cart with no items
    - expect: "Your cart is empty" is visible
    - expect: The Checkout button is disabled
```

Write expected results as observable facts ("badge shows 1"), not intentions ("cart works"). See [test-agents.md](../core/test-agents.md) for running the generator.

### Pattern 5: Keep a Requirement → Case Map

**Use when**: Reporting coverage, or when a requirement changes.

| Requirement | Cases | Automated |
|---|---|---|
| AC-1 length 4-12 | DC-01, DC-02 | DC-01, DC-02 |
| AC-2 expiry | DC-04, DC-05, DC-06 | DC-04, DC-05 |
| AC-3 usage limit | DC-07 | DC-07 |

Put the case ID in the test title or an annotation so the report links back ([manual-to-automated.md](manual-to-automated.md#pattern-4-keep-traceability-to-case-ids)).

## Anti-Patterns

| Don't | Why | Do instead |
|---|---|---|
| One happy-path test per acceptance criterion | Bugs live at boundaries and in error paths | Pattern 1 per rule |
| Every validation rule as an E2E test | Slow, and failures are vague | Pattern 3: API for rules, E2E for wiring |
| Expected result "works correctly" | Not checkable, so not testable | An observable fact per expectation |
| Guessing when the spec is ambiguous | You encode one interpretation as truth | List the question as a finding |
| Testing every value in a class | Same partition, same bug, more runtime | One representative per class plus boundaries |

## Related

- [core/test-agents.md](../core/test-agents.md): generate specs from the plan
- [core/test-architecture.md](../core/test-architecture.md): E2E vs component vs API
- [core/test-data-management.md](../core/test-data-management.md): data for each case
- [qa/manual-to-automated.md](manual-to-automated.md): when cases already exist as manual tests
