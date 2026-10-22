# Reviewing Playwright Tests

> **When to use**: The user asks you to review Playwright test code or a pull request with tests, wants a review checklist, or wants bad test patterns caught automatically.
> **Prerequisites**: [core/common-pitfalls.md](../core/common-pitfalls.md), [core/assertions-and-waiting.md](../core/assertions-and-waiting.md)

## Quick Reference

```bash
# Run only the changed tests, repeatedly and in parallel, before approving
npx playwright test --only-changed=origin/main --repeat-each=10 --fully-parallel

# Fail CI if a test.only slipped in
npx playwright test --forbid-only
```

Review order: **can it pass when the feature is broken?** → **can it fail when the feature works?** → **will it be maintainable?**

## Patterns

### Pattern 1: Checklist by Severity

**Use when**: Reviewing any test change.

**Blocking: the test can pass while the feature is broken**

| Look for | Why | Fix |
|---|---|---|
| No `expect`, or only `expect(page).toHaveURL()` after a form submit | Proves navigation, not the outcome | Assert the user-visible result |
| `expect(await locator.isVisible()).toBe(true)`, `expect(await locator.textContent())...` | Checks once, no retry: flaky, and a later state change goes unnoticed | `await expect(locator).toBeVisible()` / `toHaveText()` |
| Missing `await` on `expect(locator)...` or an action | The check never runs before the test ends | `await` every Playwright call |
| `if (await x.isVisible()) { ... }` in the test | One branch silently skips the check | Make state deterministic; assert it |
| `try { ... } catch {}` around steps or assertions | Swallows the failure | Remove; use `expect.soft` if you want to continue |
| `{ force: true }` | Clicks through overlays and disabled states a user would hit | Fix the cause; see [error-index.md](../core/error-index.md) |
| `test.only`, unexplained `test.skip` / `fixme` | Silently shrinks the suite | Remove, or add a reason and issue link |

**Major: the test will be flaky or brittle**

| Look for | Why | Fix |
|---|---|---|
| `page.waitForTimeout(...)` | Too short in CI, wasted time locally | Web-first assertion or `waitForResponse` ([assertions-and-waiting.md](../core/assertions-and-waiting.md)) |
| CSS/XPath (`.btn-primary`, `#pw`, `div > span:nth-child(2)`) | Breaks on markup change | `getByRole` / `getByLabel` / `getByTestId` ([locator-strategy.md](../core/locator-strategy.md)) |
| `.nth()` / `.first()` without a reason | Picks by position; breaks on reorder | Filter by text or scope to a container |
| Shared data between tests (same user, same record name) | Collides in parallel and in reruns | Unique data per test ([test-data-management.md](../core/test-data-management.md)) |
| Depends on another test's leftovers | Fails alone, with `--shuffle`, or on another shard | Own setup per test; fixtures |
| `waitForLoadState('networkidle')` | Discouraged; hangs on polling or analytics | Wait for the element or response you need |
| Hard-coded credentials or URLs | Leaks secrets; breaks across environments | Env vars, `baseURL` |

**Minor: maintainability**

| Look for | Fix |
|---|---|
| The same setup copied across files | Fixture or page object ([pom-vs-fixtures-vs-helpers.md](../pom/pom-vs-fixtures-vs-helpers.md)) |
| Title doesn't state the behavior ("test 3", "login works") | "rejects login with an expired password" <!-- pragma: allowlist secret --> |
| One test covering several behaviors | Split; one behavior per test |
| Missing negative path for a new validation rule | Ask for it ([test-design.md](test-design.md)) |

### Pattern 2: Prove It Can Fail

**Use when**: A test looks right but you're not sure it guards anything. This is the highest-value review step.

1. Break the behavior on purpose: comment out the line in the app that implements it, or route the API to return an error (`page.route('**/api/discount', r => r.fulfill({ status: 500 }))`).
2. Run the test. It must fail, with a message that points at the broken behavior.
3. If it still passes, the test guards nothing: ask for a real assertion.

A cheaper variant when you can't touch the app: invert the key assertion (`toBeVisible` → `toBeHidden`) and confirm the test fails.

### Pattern 3: Prove It Doesn't Flake

**Use when**: New or changed tests, before merge.

```bash
npx playwright test --only-changed=origin/main --repeat-each=10 --fully-parallel
```

Any failure in 10 runs is a flake; send it back with the trace. `--shuffle` additionally catches order dependence ([flaky-tests.md](../core/flaky-tests.md)).

### Pattern 4: Automate the Mechanical Checks

**Use when**: The same comments keep recurring in reviews.

[`eslint-plugin-playwright`](https://github.com/playwright-community/eslint-plugin-playwright) catches most Blocking and Major items before a human looks:

```javascript
// eslint.config.js
import playwright from 'eslint-plugin-playwright';

export default [
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-conditional-in-test': 'error',
      'playwright/expect-expect': 'error',
      'playwright/missing-playwright-await': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-networkidle': 'error',
      'playwright/no-raw-locators': 'warn',
    },
  },
];
```

Add `--forbid-only` to the CI test command. Keep human review for what lint can't see: whether the assertion proves the requirement (Pattern 2), missing cases, and test data design.

### Pattern 5: Write Review Comments That Get Fixed

**Use when**: Posting the review.

Per finding: severity, location, what breaks, the fix.

> **Blocking**, `login.spec.ts:8`: `expect(await page.locator('.welcome').isVisible()).toBe(true)` checks once without retrying, so it fails if the dashboard renders 100 ms late and passes if a stale element is still in the DOM. Use `await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()`.

Lead with Blocking items; batch Minor ones into one comment.

## Worked Example

```typescript
test('login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#email', 'a@b.com');
  await page.fill('#pw', 'x');
  await page.click('.btn-primary');
  await page.waitForTimeout(3000);
  expect(await page.locator('.welcome').isVisible()).toBe(true);
});
```

| Severity | Line | Finding |
|---|---|---|
| Blocking | 7 | Non-retrying `isVisible()` check; use `await expect(...).toBeVisible()` |
| Major | 6 | `waitForTimeout(3000)`; the web-first assertion replaces it |
| Major | 3-5 | CSS/ID selectors; use `getByLabel('Email')`, `getByLabel('Password')`, `getByRole('button', { name: 'Sign in' })` <!-- pragma: allowlist secret --> |
| Major | 3-4 | Hard-coded credentials; use a fixture user or env vars |
| Minor | 1 | Title "login"; say the behavior, e.g. "signs in with valid credentials" |

## Related

- [core/common-pitfalls.md](../core/common-pitfalls.md): the mistakes behind most findings
- [core/flaky-tests.md](../core/flaky-tests.md): diagnosing flakes found in review
- [qa/test-design.md](test-design.md): judging whether the right cases exist
