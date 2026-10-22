# Manual Test Cases to Playwright Specs

> **When to use**: The team has manual test cases (TestRail, Xray, Zephyr, a spreadsheet or CSV export) and wants them automated with Playwright, or asks which ones are worth automating and how to keep tests linked to case IDs.
> **Prerequisites**: [core/fixtures-and-hooks.md](../core/fixtures-and-hooks.md), [core/authentication.md](../core/authentication.md)

## Quick Reference

| Manual case part | Becomes |
|---|---|
| ID (`TC-42`) | Test title prefix and an annotation |
| Preconditions ("user exists, logged in as admin") | Fixtures, `storageState`, API seeding; not UI steps |
| Steps | Actions with role/label locators |
| Each expected result | A web-first assertion at the step where it applies |
| Test data in the case | Factory or fixture data, unique per test |
| Cases sharing preconditions | One file with a shared fixture or `beforeEach` |

## Patterns

### Pattern 1: Decide What to Automate

**Use when**: Starting from a large manual suite.

Automate a case when **all** hold:
- **Repeatable**: same steps, same result, every run.
- **Deterministic oracle**: the expected result is checkable by code ("shows Welcome back"), not judgment ("looks right").
- **Stable feature**: not redesigned every sprint.
- **Worth it**: run often (regression, smoke) or high risk.

Keep manual (or exploratory): visual or UX judgment, one-off checks, features about to change, hardware or physical-world steps, and cases whose setup costs more than the check. Usability and exploratory sessions stay manual by nature.

Order the automatable ones by risk ([test-design.md](test-design.md#pattern-2-rank-by-risk-before-automating)), not by their order in the tracker.

### Pattern 2: Map One Case to One Spec

**Use when**: Converting a single case.

Manual case:

> **TC-42 Login with valid credentials**. Preconditions: user exists. Steps: 1. Open /login 2. Enter email 3. Enter password 4. Click Sign in. Expected: dashboard shows "Welcome back". <!-- pragma: allowlist secret -->

```typescript
import { test, expect } from './fixtures'; // provides a seeded `user` (Pattern 3)

test('TC-42 login with valid credentials', {
  tag: '@smoke',
  annotation: { type: 'testcase', description: 'TC-42' },
}, async ({ page, user }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});
```

- The precondition "user exists" is a fixture that creates the user through the API, not steps in the test. See [test-data-management.md](../core/test-data-management.md).
- Locators come from what the manual step names ("Email", "Sign in") as the user sees it: `getByLabel`, `getByRole`. See [locators.md](../core/locators.md).
- Manual expected results often sit only at the end. Add assertions where the state changes, so a failure points at the step that broke.

### Pattern 3: Turn Shared Preconditions Into Fixtures

**Use when**: Many cases start with the same setup ("log in as admin and create a project").

Re-running those UI steps in every test makes the suite slow and makes every test fail when login breaks. Do the setup once, below the UI:

```typescript
// tests/fixtures.ts
import { randomUUID } from 'node:crypto';
import { test as base, expect } from '@playwright/test';

type User = { id: string; email: string; password: string }; // pragma: allowlist secret
type Project = { id: string; name: string };

export const test = base.extend<{ user: User; project: Project }>({
  user: async ({ request }, use) => {
    const data = { email: `qa+${randomUUID()}@example.com`, password: randomUUID() };
    const res = await request.post('/api/users', { data });
    expect(res.ok(), `seeding user failed: ${res.status()}`).toBeTruthy();
    const user = { ...(await res.json()), ...data }; // keep our plaintext password
    await use(user);
    await request.delete(`/api/users/${user.id}`);
  },
  project: async ({ request }, use) => {
    const res = await request.post('/api/projects', { data: { name: `qa-${randomUUID()}` } });
    expect(res.ok(), `seeding project failed: ${res.status()}`).toBeTruthy();
    const project = await res.json();
    await use(project);
    await request.delete(`/api/projects/${project.id}`);
  },
});
export { expect } from '@playwright/test';
```

Log in once per role with a setup project and `storageState` ([authentication.md](../core/authentication.md)), then each test starts signed in with its own project.

### Pattern 4: Keep Traceability to Case IDs

**Use when**: Reporting automated results against the manual suite.

Put the ID in two places:
- **Title prefix** (`TC-42 ...`): visible everywhere, and `npx playwright test --grep "TC-42 "` runs one case (the trailing space stops it matching TC-420 to TC-429; `--grep` is an unanchored regex).
- **Annotation** `{ type: 'testcase', description: 'TC-42' }`: structured, so the JSON reporter output and custom reporters can map results back without parsing titles.

```typescript
// playwright.config.ts: machine-readable results for syncing to the test management tool
reporter: [['html'], ['json', { outputFile: 'results.json' }]],
```

Each test in `results.json` carries its annotations and status; a small script or the tool's importer maps `testcase` annotations to case results. Mark the manual case "automated" in the tracker and link the spec path, so nobody runs it by hand twice.

### Pattern 5: Convert a Batch From an Export

**Use when**: An agent converts many cases from a CSV or spreadsheet export.

1. **Read the export and triage** with Pattern 1. Output a table: ID, automate yes/no, reason. Get it confirmed before writing code.
2. **Group** cases by feature and shared preconditions; one spec file per group, shared setup as fixtures (Pattern 3).
3. **Merge duplicates** (same steps, different data) into one data-driven test:

   ```typescript
   for (const { id, code, message } of [
     { id: 'TC-51', code: 'abc', message: 'Code is too short' },
     { id: 'TC-52', code: 'abcdefghijklm', message: 'Code is too long' },
   ]) {
     test(`${id} rejects invalid code ${code}`, async ({ page }) => {
       // ...
       await expect(page.getByText(message)).toBeVisible();
     });
   }
   ```

4. **Split** long manual cases (15+ steps covering several features) into focused tests; a manual tester tolerates a long script, a suite does not.
5. **Flag ambiguity**: a step like "verify the page is correct" has no oracle. List these back to the user instead of inventing an assertion.

Alternatively, write the triaged cases as a plan in `specs/` and run Playwright's generator ([test-agents.md](../core/test-agents.md)), then review the output against Pattern 2.

## Anti-Patterns

| Don't | Why | Do instead |
|---|---|---|
| Translate preconditions into UI steps | Slow; every test fails when setup UI breaks | Fixtures, API seeding, `storageState` |
| One giant test per long manual case | A failure in step 3 hides steps 4-15 | Split by behavior |
| Assert only at the end | The failure doesn't say which step broke | Assert where each expected result applies |
| Copy CSS selectors from recorded steps | Brittle | Role and label locators from the step wording |
| Automate everything in the tracker | Some cases need judgment or are one-offs | Pattern 1 triage |
| Drop the case ID | Results can't be reported against the manual suite | Pattern 4 |

## Related

- [qa/test-design.md](test-design.md): when cases need to be designed first
- [core/fixtures-and-hooks.md](../core/fixtures-and-hooks.md): fixtures for preconditions
- [core/test-organization.md](../core/test-organization.md): tags, annotations, grep
- [migration/from-selenium.md](../migration/from-selenium.md): when the existing suite is Selenium, not manual
