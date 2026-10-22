# Bug Reports From Failing Tests

> **When to use**: A Playwright test failed and the user wants to know whether it's a real bug, wants a bug report the dev team can act on, or asks what to do with the test while the bug is open.
> **Prerequisites**: [core/trace-analysis.md](../core/trace-analysis.md), [core/error-index.md](../core/error-index.md)

## Quick Reference

```bash
# Is it reproducible? Run only that test, many times, in one worker
npx playwright test tests/checkout.spec.ts:42 --repeat-each=20 --workers=1

# Does it fail under load (parallel), not alone?
npx playwright test tests/checkout.spec.ts:42 --repeat-each=20 --workers=4

# Watch it fail
npx playwright test tests/checkout.spec.ts:42 --headed

# Read the evidence of a CI failure
npx playwright show-report        # HTML report: error, steps, screenshots, trace
npx playwright show-trace trace.zip
```

## Patterns

### Pattern 1: Classify Before Filing

**Use when**: Always. Filing a test bug or a flake as an app bug costs the dev team time and costs QA trust.

| Evidence | Likely | Next step |
|---|---|---|
| Fails every run; the trace shows the app doing the wrong thing (wrong text, 500 response, missing element the user also cannot see) | **App bug** | File it (Pattern 2) |
| Fails every run; the app looks right in the trace screenshot but the locator or expected value is stale | **Test bug** | Fix the test; see [error-index.md](../core/error-index.md) |
| Passes alone, fails sometimes under `--repeat-each` or only in parallel | **Flaky test or race in the app** | [flaky-tests.md](../core/flaky-tests.md); a real race is an app bug, so file it with the frequency |
| Fails only in CI: browser launch, DNS, timeouts on every test | **Environment** | Fix CI, not the app; see [error-index.md](../core/error-index.md) CI section |

Check the trace's network tab and console first: a failed API call or an uncaught page error usually decides it in one look ([trace-analysis.md](../core/trace-analysis.md)).

### Pattern 2: Write the Report From the Test

**Use when**: The failure is an app bug.

Translate test code into user-level steps. A developer should reproduce it by hand without reading the spec.

```markdown
**Title**: Pay button does nothing when the saved card is expired (checkout)

**Severity**: High (blocks purchase for users with an expired saved card)
**Frequency**: 20/20 runs (`--repeat-each=20`)
**Environment**: staging (https://staging.example.com), commit a1b2c3d, Chromium 156 (Playwright 1.64), also Firefox 157

**Preconditions**: user `qa-expired-card@example.com` with a saved card expiring 01/2025

**Steps to reproduce**
1. Sign in as the user above
2. Add any product to the cart and open Checkout
3. Keep the saved card selected and click "Pay"

**Expected**: an inline error "Your card has expired" and the card form opens
**Actual**: nothing happens; the button stays enabled. `POST /api/payments` returns 422 `{"code":"card_expired"}` and the UI shows no message.

**Evidence**: trace (failing step "click Pay", network 422), screenshot, test `tests/checkout.spec.ts:42`
**Regression**: passed on commit 9f8e7d6 (yesterday's nightly)
```

Rules for each field:
- **Title**: symptom + where. "Checkout test fails" describes your test, not the bug.
- **Severity** is user impact (blocker, high, medium, low); priority is the team's call.
- **Frequency** from `--repeat-each`, never "sometimes".
- **Actual** names the observable failure and the evidence behind it (status code, console error), not the test's assertion message.
- **Regression**: the last passing commit or build, if CI history shows one. `git bisect run npx playwright test -g "pay with expired saved card"` finds the commit; filter by title, because a `file:line` filter breaks when the line moves between commits.

### Pattern 3: Keep the Test While the Bug Is Open

**Use when**: The bug is filed and the test fails because of it.

Mark the test as expected to fail and link the issue. Playwright still runs it and reports an error if it starts passing, which tells you the bug was fixed:

```typescript
test('pay with expired saved card shows an error', {
  annotation: { type: 'issue', description: 'https://github.com/acme/shop/issues/812' },
}, async ({ page }) => {
  test.fail();
  // ...unchanged test body
});
```

| Annotation | Runs the test? | Use for |
|---|---|---|
| `test.fail()` | Yes; must fail | Known app bug; you get told when it's fixed |
| `test.fixme()` | No | The test crashes, hangs, or is too slow while broken |
| `test.skip()` | No | Not applicable in this configuration; not for bugs |

Never delete the test or loosen the assertion to make CI green. See [test-organization.md](../core/test-organization.md) for annotations and tags.

### Pattern 4: Redact Before Attaching

**Use when**: Attaching a trace, HAR or video to a ticket, especially in a public tracker.

A `trace.zip` contains every network request and response body, cookies and headers (session tokens), storage, and DOM snapshots that may show personal data. Before attaching:
- Prefer a screenshot plus the relevant request/response excerpt for public trackers.
- Attach full traces only to private tickets, from test accounts with throwaway data.
- Never attach traces captured with real user credentials or production data.

## Anti-Patterns

| Don't | Why | Do instead |
|---|---|---|
| Paste the assertion error as the bug | Devs need the user-visible failure | Pattern 2 "Actual" |
| "Fails sometimes" | Nobody can prioritize it | `--repeat-each=20` and report N/20 |
| File before checking the trace | Many "bugs" are stale locators or CI issues | Pattern 1 |
| `test.skip()` for an open bug | The test never tells you it's fixed | `test.fail()` with an issue annotation |
| Attach traces to public issues | Leaks tokens and data | Pattern 4 |

## Related

- [core/trace-analysis.md](../core/trace-analysis.md): read a `trace.zip` from the terminal
- [core/flaky-tests.md](../core/flaky-tests.md): flake vs race
- [core/dynamic-test-selection.md](../core/dynamic-test-selection.md): quarantine many known failures at once
- [playwright-cli/SKILL.md](../playwright-cli/SKILL.md): reproduce a bug interactively
