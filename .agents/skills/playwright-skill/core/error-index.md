# Playwright Error Index

Quick-reference for specific Playwright error messages. Find your error, understand the cause, apply the fix.

> **How to use**: Search this file for the exact error text you see in your terminal or test report. Each entry gives you the cause and a working fix.

---

## Locator & Element Errors

---

### "locator.click: Target page, context or browser has been closed"

**Cause**: The page, context, or browser was closed while the action was still running. (Older Playwright versions printed `Target closed`.)

**Common triggers**:
- A popup or window closes itself as a result of the click, and the test keeps acting on it
- Calling `page.close()` or `context.close()` in a `finally` block that races with an in-flight action
- A missing `await` lets the test finish and its fixtures tear down the page while the action is pending
- The test timed out and Playwright closed the page; the error then reads `Test timeout of 30000ms exceeded.`

**Fix**: `await` every action, and do not close the page or context until all actions on it have resolved. If the page is closing intentionally (e.g., a popup), capture a reference before the action:

```typescript
// TypeScript — handle popup that closes itself
const popupPromise = page.waitForEvent('popup');
await page.getByRole('button', { name: 'Open popup' }).click();
const popup = await popupPromise;
await popup.waitForLoadState();
// interact with popup before it closes
await popup.getByRole('button', { name: 'Confirm' }).click();
```

```javascript
// JavaScript — handle popup that closes itself
const popupPromise = page.waitForEvent('popup');
await page.getByRole('button', { name: 'Open popup' }).click();
const popup = await popupPromise;
await popup.waitForLoadState();
await popup.getByRole('button', { name: 'Confirm' }).click();
```

**Related**: [core/assertions-and-waiting.md](assertions-and-waiting.md), [core/multi-context-and-popups.md](multi-context-and-popups.md)

---

### "waiting for locator('...') to be visible"

**Cause**: Playwright's auto-waiting timed out because the element never appeared in the DOM or remained hidden (e.g., `display: none`, `visibility: hidden`, zero size, or behind `aria-hidden`).

**Common triggers**:
- The element renders conditionally and the condition was not met (missing data, unauthenticated state)
- Content loads asynchronously and the locator was evaluated before the API response arrived
- The selector is wrong — typo in role, name, or test ID
- The element exists but is off-screen or inside a collapsed container
- CSS animation or transition keeps the element at `opacity: 0` without making it visible to Playwright

**Fix**: First confirm the locator matches what you expect using the Playwright Inspector. Then ensure the precondition for the element to appear is met.

```typescript
// TypeScript — debug: check what the locator resolves to
console.log(await page.getByRole('button', { name: 'Submit' }).count());
// If 0, the element is not in the DOM — check your selector or page state

// Correct approach: wait for the data to load first
await page.waitForResponse(resp =>
  resp.url().includes('/api/data') && resp.status() === 200
);
await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
```

```javascript
// JavaScript — same approach
console.log(await page.getByRole('button', { name: 'Submit' }).count());

await page.waitForResponse(resp =>
  resp.url().includes('/api/data') && resp.status() === 200
);
await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
```

**Related**: [core/locators.md](locators.md), [core/assertions-and-waiting.md](assertions-and-waiting.md)

---

### "locator.click: Error: strict mode violation"

**Cause**: The locator matched more than one element and Playwright's strict mode (enabled by default) refuses to act on ambiguous matches.

**Common triggers**:
- Using `getByRole('button')` when multiple buttons exist on the page
- Using `getByText('Save')` when both "Save" and "Save as draft" are present
- Partial text matching when `exact: true` is needed
- The same component is rendered multiple times (e.g., in a list)

**Fix**: Make the locator more specific so it resolves to exactly one element.

```typescript
// TypeScript

// BAD — matches multiple buttons
await page.getByRole('button', { name: 'Save' }).click();

// GOOD — use exact matching
await page.getByRole('button', { name: 'Save', exact: true }).click();

// GOOD — scope to a specific container
await page.getByRole('dialog')
  .getByRole('button', { name: 'Save' }).click();

// GOOD — use .first(), .last(), .nth() when order is meaningful
await page.getByRole('listitem').first().click();

// GOOD — chain with filter for list items
await page.getByRole('listitem')
  .filter({ hasText: 'Project Alpha' })
  .getByRole('button', { name: 'Delete' }).click();
```

```javascript
// JavaScript

// BAD — matches multiple buttons
await page.getByRole('button', { name: 'Save' }).click();

// GOOD — use exact matching
await page.getByRole('button', { name: 'Save', exact: true }).click();

// GOOD — scope to a specific container
await page.getByRole('dialog')
  .getByRole('button', { name: 'Save' }).click();

// GOOD — use .first(), .last(), .nth() when order is meaningful
await page.getByRole('listitem').first().click();

// GOOD — chain with filter for list items
await page.getByRole('listitem')
  .filter({ hasText: 'Project Alpha' })
  .getByRole('button', { name: 'Delete' }).click();
```

**Related**: [core/locators.md](locators.md), [core/locator-strategy.md](locator-strategy.md)

---

### "Error: expect(locator).toBeVisible() failed"

**Cause**: When the output continues with `Error: strict mode violation: ... resolved to N elements`, it is the same root cause as the strict mode violation above — the assertion's locator matched multiple elements, so Playwright cannot determine which one to assert on. If it shows `Expected: visible` with `element(s) not found` (or a non-visible `Received:` value) instead, the element is missing or hidden; see "waiting for locator('...') to be visible" above.

**Common triggers**:
- Same as strict mode violation triggers above
- Writing `expect(page.locator('.item')).toBeVisible()` when there are many `.item` elements

**Fix**: Narrow the locator to a single element (see strict mode violation fix above). Alternatively, if you intentionally want to check all matches:

```typescript
// TypeScript — assert count instead of visibility
await expect(page.getByRole('listitem')).toHaveCount(5);

// Or assert on a specific one
await expect(page.getByRole('listitem').first()).toBeVisible();

// Or assert all are visible with a loop
for (const item of await page.getByRole('listitem').all()) {
  await expect(item).toBeVisible();
}
```

```javascript
// JavaScript — assert count instead of visibility
await expect(page.getByRole('listitem')).toHaveCount(5);

// Or assert on a specific one
await expect(page.getByRole('listitem').first()).toBeVisible();

// Or assert all are visible with a loop
for (const item of await page.getByRole('listitem').all()) {
  await expect(item).toBeVisible();
}
```

**Related**: [core/locators.md](locators.md), [core/assertions-and-waiting.md](assertions-and-waiting.md)

---

### "locator.fill: Error: Element is not an <input>, <textarea> or [contenteditable] element"

**Cause**: `fill()` only works on `<input>`, `<textarea>`, or elements with `contenteditable`. The locator resolved to a different element type (e.g., a `<div>`, `<label>`, or the `<form>` itself).

**Common triggers**:
- Locating by label text but the label and input are not properly associated via `for`/`id`
- Using `getByText()` instead of `getByLabel()` or `getByRole('textbox')`
- Custom components that wrap the actual `<input>` in a styled `<div>`
- Rich text editors that use `contenteditable` on an inner element, not the outer wrapper

**Fix**: Target the actual input element.

```typescript
// TypeScript

// BAD — targets the label, not the input
await page.getByText('Email').fill('user@example.com');

// GOOD — getByLabel finds the associated input
await page.getByLabel('Email').fill('user@example.com');

// GOOD — target by role
await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');

// For contenteditable rich text editors
await page.locator('[contenteditable="true"]').fill('Hello world');

// If fill() still doesn't work (e.g., custom widget), use keyboard input
await page.getByRole('textbox', { name: 'Email' }).click();
await page.keyboard.type('user@example.com');
```

```javascript
// JavaScript

// BAD — targets the label, not the input
await page.getByText('Email').fill('user@example.com');

// GOOD — getByLabel finds the associated input
await page.getByLabel('Email').fill('user@example.com');

// GOOD — target by role
await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');

// For contenteditable rich text editors
await page.locator('[contenteditable="true"]').fill('Hello world');

// If fill() still doesn't work (e.g., custom widget), use keyboard input
await page.getByRole('textbox', { name: 'Email' }).click();
await page.keyboard.type('user@example.com');
```

**Related**: [core/locators.md](locators.md), [core/forms-and-validation.md](forms-and-validation.md)

---

### "Element is not attached to the DOM"

**Cause**: You are using the legacy ElementHandle API (or a scoped `waitForSelector`) and the handle has gone stale — the underlying DOM node was removed or replaced by a re-render. Locators do not throw here: the call log shows `element was detached from the DOM, retrying` and Playwright re-queries.

**Common triggers**:
- Storing an `elementHandle` in a variable and using it after a navigation or React/Vue re-render
- Using `page.$()` or `page.$$()` instead of Locator API
- Framework hydration replaces the server-rendered node with a client-rendered one

**Fix**: Switch from ElementHandle to Locator. Locators re-query the DOM on every action and never go stale.

```typescript
// TypeScript

// BAD — stale handle
const button = await page.$('button.submit');
// ... page re-renders ...
await button!.click(); // Element is not attached to the DOM

// GOOD — locator always re-queries
const button = page.getByRole('button', { name: 'Submit' });
// ... page re-renders ...
await button.click(); // works fine
```

```javascript
// JavaScript

// BAD — stale handle
const button = await page.$('button.submit');
// ... page re-renders ...
await button.click(); // Element is not attached to the DOM

// GOOD — locator always re-queries
const button = page.getByRole('button', { name: 'Submit' });
// ... page re-renders ...
await button.click(); // works fine
```

**Related**: [core/locators.md](locators.md)

---

### "Error: locator.click: Timeout 30000ms exceeded"

**Cause**: The element was found in the DOM but was not actionable within the timeout. "Actionable" means visible, stable (not animating), enabled, and not obscured by another element.

Under Playwright Test this message appears only when a timeout is set for the call or in config (`actionTimeout`, `navigationTimeout`, `timeout` option); with the defaults (0) the test instead fails with `Test timeout of 30000ms exceeded.`

**Common triggers**:
- An overlay, modal, or toast is covering the element
- The element is disabled (`disabled` attribute or `aria-disabled="true"`)
- CSS animation has not completed (element is still moving)
- A loading spinner overlays the button
- The element is outside the viewport and Playwright's auto-scroll failed

**Fix**: Identify what is blocking the action using traces, then address it.

```typescript
// TypeScript

// Step 1: Enable tracing to diagnose
// In playwright.config.ts:
// use: { trace: 'on-first-retry' }
// Then run: npx playwright show-trace trace.zip

// Common fix: wait for the overlay to disappear
await expect(page.locator('.loading-overlay')).toBeHidden();
await page.getByRole('button', { name: 'Submit' }).click();

// Common fix: force click when you know the overlay is benign
// (use sparingly — this skips actionability checks)
await page.getByRole('button', { name: 'Submit' }).click({ force: true });

// Common fix: wait for the element to be enabled
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
await page.getByRole('button', { name: 'Submit' }).click();
```

```javascript
// JavaScript

// Common fix: wait for the overlay to disappear
await expect(page.locator('.loading-overlay')).toBeHidden();
await page.getByRole('button', { name: 'Submit' }).click();

// Common fix: force click (use sparingly)
await page.getByRole('button', { name: 'Submit' }).click({ force: true });

// Common fix: wait for the element to be enabled
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
await page.getByRole('button', { name: 'Submit' }).click();
```

**Related**: [core/assertions-and-waiting.md](assertions-and-waiting.md), [core/debugging.md](debugging.md)

---

### "<element> intercepts pointer events"

**Cause**: A call-log line under an action timeout (`retrying click action` ... `<div class="overlay"> intercepts pointer events`). The element passed the visible/enabled/stable checks, but the hit-target check found a different element on top of the click point.

**Common triggers**:
- A modal backdrop, cookie banner, toast, or loading overlay covers the target
- A sticky header or footer overlaps the element after auto-scroll
- A transparent wrapper (e.g., a custom checkbox's styled `<span>`) sits over the real `<input>`

**Fix**: Dismiss or wait out the element named in the log, or act on the element that actually receives the click.

```typescript
// TypeScript
await page.getByRole('button', { name: 'Accept cookies' }).click();
await expect(page.locator('.overlay')).toBeHidden();
await page.getByRole('button', { name: 'Submit' }).click();

// Custom checkbox: click the visible label instead of the covered input
await page.getByText('I agree to the terms').click();
```

```javascript
// JavaScript
await page.getByRole('button', { name: 'Accept cookies' }).click();
await expect(page.locator('.overlay')).toBeHidden();
await page.getByRole('button', { name: 'Submit' }).click();

await page.getByText('I agree to the terms').click();
```

**Related**: [core/assertions-and-waiting.md](assertions-and-waiting.md)

---

### "element is not stable"

**Cause**: A call-log line under an action timeout (after `waiting for element to be visible, enabled and stable`). Playwright requires the element's bounding box to stay the same for two consecutive animation frames; it kept moving or resizing.

**Common triggers**:
- An infinite CSS animation or transition on the element or an ancestor (spinners, pulsing buttons)
- A carousel or marquee that never stops
- Layout shifts from content loading above the element

**Fix**: Disable animations or wait for the layout to settle.

```typescript
// TypeScript — playwright.config.ts: emulate reduced motion (works if the app honors prefers-reduced-motion)
export default defineConfig({
  use: { contextOptions: { reducedMotion: 'reduce' } },
});

// Or wait for the content that causes the shift
await expect(page.getByTestId('banner')).toBeVisible();
await page.getByRole('button', { name: 'Submit' }).click();
```

```javascript
// JavaScript — playwright.config.js
module.exports = defineConfig({
  use: { contextOptions: { reducedMotion: 'reduce' } },
});
```

**Related**: [core/assertions-and-waiting.md](assertions-and-waiting.md)

---

### "element is outside of the viewport"

**Cause**: A call-log line under an action timeout: after scrolling, the element's click point is still outside the viewport. With `force: true` it is thrown immediately as `Element is outside of the viewport`.

**Common triggers**:
- The element is positioned off-screen (negative offsets, `transform: translateX(-100%)` drawers)
- A container with `overflow: hidden` clips the element so it cannot be scrolled into view
- The viewport is too small for a fixed-size layout

**Fix**: Open the container that holds the element, or enlarge the viewport.

```typescript
// TypeScript
await page.getByRole('button', { name: 'Menu' }).click(); // slide the drawer in first
await page.getByRole('link', { name: 'Settings' }).click();

await page.setViewportSize({ width: 1440, height: 900 });
```

```javascript
// JavaScript
await page.getByRole('button', { name: 'Menu' }).click();
await page.getByRole('link', { name: 'Settings' }).click();

await page.setViewportSize({ width: 1440, height: 900 });
```

**Related**: [core/locators.md](locators.md)

---

## Navigation & Page Errors

---

### "page.goto: net::ERR_CONNECTION_REFUSED"

**Cause**: Playwright could not connect to the target URL. The server is not running or is not listening on the expected host/port.

**Common triggers**:
- Forgot to start the dev server before running tests
- Dev server is on a different port than `baseURL` in config
- Server is listening on `127.0.0.1` but test uses `localhost` (or vice versa) and the OS resolves them differently
- In CI, the application build/start step failed silently
- Docker container networking: the app runs inside a container but the test tries to reach `localhost`

**Fix**: Use the `webServer` config option to let Playwright start and manage the dev server automatically.

```typescript
// TypeScript — playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000, // 2 minutes for server start
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

```javascript
// JavaScript — playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

**Related**: [core/configuration.md](configuration.md), [ci/ci-github-actions.md](../ci/ci-github-actions.md)

---

### "page.goto: Timeout 30000ms exceeded"

**Cause**: The page did not reach the `load` state (by default) within the navigation timeout. The server responded but the page took too long to fully load.

Under Playwright Test this message appears only when a timeout is set for the call or in config (`actionTimeout`, `navigationTimeout`, `timeout` option); with the defaults (0) the test instead fails with `Test timeout of 30000ms exceeded.`

**Common triggers**:
- Large assets (images, fonts, scripts) slow the page load
- Third-party scripts (analytics, ads) blocking the load event
- The page makes many API calls before becoming interactive
- The server responded with a redirect chain that takes too long

**Fix**: Use a more appropriate `waitUntil` option or increase the navigation timeout.

```typescript
// TypeScript

// Use 'domcontentloaded' instead of 'load' if you don't need all assets
await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

// Or increase the navigation timeout for known slow pages
await page.goto('/dashboard', { timeout: 60_000 });

// Or set it globally in config
// playwright.config.ts
export default defineConfig({
  use: {
    navigationTimeout: 60_000,
  },
});
```

```javascript
// JavaScript

await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

await page.goto('/dashboard', { timeout: 60_000 });

// playwright.config.js
module.exports = defineConfig({
  use: {
    navigationTimeout: 60_000,
  },
});
```

**Related**: [core/configuration.md](configuration.md)

---

### "Error: page.goto: Target page, context or browser has been closed"

**Cause**: The page or browser context was closed while `goto()` was still in progress. This typically happens in teardown/cleanup race conditions. (Older Playwright versions printed `Navigation failed because page was closed!`.)

**Common triggers**:
- `afterEach` or a fixture closes the page/context before navigation completes
- Another test or hook called `browser.close()` prematurely
- A test failed and the cleanup ran while an async navigation was still pending
- Using `test.fixme()` or `test.skip()` after an async operation has started

**Fix**: Ensure cleanup only runs after all page operations complete. Use fixtures for lifecycle management instead of manual `afterEach`.

```typescript
// TypeScript

// BAD — race condition between test body and cleanup
test.afterEach(async ({ page }) => {
  await page.close(); // may race with in-flight navigation
});

// GOOD — let Playwright manage page lifecycle via fixtures
// Playwright automatically creates and destroys the page per test
// No manual cleanup needed

// If you need custom cleanup, make sure to await all navigation first
test('navigates to dashboard', async ({ page }) => {
  const responsePromise = page.waitForResponse('**/api/user');
  await page.goto('/dashboard');
  await responsePromise; // ensure all async ops are done
  // test assertions here
});
```

```javascript
// JavaScript — same pattern

test('navigates to dashboard', async ({ page }) => {
  const responsePromise = page.waitForResponse('**/api/user');
  await page.goto('/dashboard');
  await responsePromise;
  // test assertions here
});
```

**Related**: [core/fixtures-and-hooks.md](fixtures-and-hooks.md)

---

### "page.waitForNavigation: Timeout 30000ms exceeded"

**Cause**: `waitForNavigation()` waited for a full page navigation that never happened. In SPAs, client-side routing does not trigger a navigation event.

Under Playwright Test this message appears only when a timeout is set for the call or in config (`actionTimeout`, `navigationTimeout`, `timeout` option); with the defaults (0) the test instead fails with `Test timeout of 30000ms exceeded.`

**Common triggers**:
- Using `waitForNavigation()` with a SPA that uses React Router, Vue Router, or Next.js client-side navigation
- The navigation already happened before `waitForNavigation()` was called (race condition)
- Using the deprecated pattern when `waitForURL()` is the correct replacement

**Fix**: Replace `waitForNavigation()` with `waitForURL()` which works with both SPAs and traditional page loads.

```typescript
// TypeScript

// BAD — deprecated, race-prone, doesn't work with SPA routing
await page.waitForNavigation();

// GOOD — works with SPAs and full navigations
await page.getByRole('link', { name: 'Dashboard' }).click();
await page.waitForURL('**/dashboard');

// GOOD — combine with glob patterns
await page.waitForURL(/\/dashboard\/\d+/);

// GOOD — for SPA route changes, assert on visible content
await page.getByRole('link', { name: 'Settings' }).click();
await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
```

```javascript
// JavaScript

// BAD — deprecated, race-prone
await page.waitForNavigation();

// GOOD — works with SPAs and full navigations
await page.getByRole('link', { name: 'Dashboard' }).click();
await page.waitForURL('**/dashboard');

// GOOD — combine with glob patterns
await page.waitForURL(/\/dashboard\/\d+/);

// GOOD — for SPA route changes, assert on visible content
await page.getByRole('link', { name: 'Settings' }).click();
await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
```

**Related**: [core/assertions-and-waiting.md](assertions-and-waiting.md)

---

### "Error: frame.goto: Frame was detached"

**Cause**: The iframe was removed from the DOM (detached) while Playwright was navigating or interacting with it.

**Common triggers**:
- The parent page re-rendered and recreated the iframe element
- JavaScript on the parent page removed and re-added the iframe
- A SPA route change unmounted the component containing the iframe
- An ad iframe reloaded itself

**Fix**: Re-acquire the frame reference after the parent page updates.

```typescript
// TypeScript

// BAD — frame reference becomes stale
const frame = page.frameLocator('#my-iframe');
// ... parent page re-renders ...
await frame.getByRole('button').click(); // Frame was detached

// GOOD — use frameLocator (re-evaluates each time)
// frameLocator itself is lazy, but the frame it points to must exist
await expect(page.frameLocator('#my-iframe').getByRole('button')).toBeVisible();
await page.frameLocator('#my-iframe').getByRole('button').click();

// GOOD — wait for the iframe to be present after a re-render
await expect(page.locator('#my-iframe')).toBeAttached();
await page.frameLocator('#my-iframe').getByRole('button').click();
```

```javascript
// JavaScript

// GOOD — frameLocator re-evaluates lazily
await expect(page.frameLocator('#my-iframe').getByRole('button')).toBeVisible();
await page.frameLocator('#my-iframe').getByRole('button').click();

// GOOD — wait for the iframe to be present after a re-render
await expect(page.locator('#my-iframe')).toBeAttached();
await page.frameLocator('#my-iframe').getByRole('button').click();
```

**Related**: [core/iframes-and-shadow-dom.md](iframes-and-shadow-dom.md)

---

## Test Framework Errors

---

### "Error: Test timeout of 30000ms exceeded"

**Cause**: The entire test (including all hooks and assertions) did not complete within the configured test timeout.

**Common triggers**:
- Waiting for an element that never appears (wrong locator, missing data)
- Unresolved `page.waitForEvent()` — the expected event never fires
- Slow test environment (CI with limited resources)
- Too many sequential actions in a single test
- A `beforeEach` hook performs expensive setup (login, data seeding)

**Fix**: Identify the slow step using `test.step()` and traces, then either fix the root cause or adjust the timeout.

```typescript
// TypeScript

// Increase timeout for a specific slow test
test('generates large report', async ({ page }) => {
  test.setTimeout(120_000); // 2 minutes for this test only
  // ...
});

// Increase timeout globally in config
// playwright.config.ts
export default defineConfig({
  timeout: 60_000, // 60 seconds per test
});

// Better: diagnose with test.step() to find what's slow
test('checkout flow', async ({ page }) => {
  await test.step('add item to cart', async () => {
    await page.goto('/products');
    await page.getByRole('button', { name: 'Add to Cart' }).click();
  });

  await test.step('complete checkout', async () => {
    await page.getByRole('link', { name: 'Cart' }).click();
    await page.getByRole('button', { name: 'Checkout' }).click();
  });
});
```

```javascript
// JavaScript

test('generates large report', async ({ page }) => {
  test.setTimeout(120_000);
  // ...
});

// playwright.config.js
module.exports = defineConfig({
  timeout: 60_000,
});

test('checkout flow', async ({ page }) => {
  await test.step('add item to cart', async () => {
    await page.goto('/products');
    await page.getByRole('button', { name: 'Add to Cart' }).click();
  });

  await test.step('complete checkout', async () => {
    await page.getByRole('link', { name: 'Cart' }).click();
    await page.getByRole('button', { name: 'Checkout' }).click();
  });
});
```

**Related**: [core/configuration.md](configuration.md), [core/debugging.md](debugging.md)

---

### "Error: expect(page).toHaveScreenshot(expected) failed"

**Cause**: The current screenshot does not match the stored baseline; the output reports `N pixels (ratio 0.02 of all image pixels) are different.` Text and buffer snapshots fail the same way as `expect(string).toMatchSnapshot(expected) failed`.

**Common triggers**:
- Legitimate UI changes that require updating the snapshot
- Different rendering between local and CI (fonts, anti-aliasing, OS-level rendering)
- Dynamic content (timestamps, random IDs, ads) that changes between runs
- Different viewport sizes or device emulation settings between environments

**Fix**: Update the snapshot if the change is intentional, or mask/hide dynamic areas.

```typescript
// TypeScript

// Update snapshots after intentional changes
// Run: npx playwright test --update-snapshots

// Mask dynamic content before taking a screenshot
await expect(page).toHaveScreenshot('dashboard.png', {
  mask: [
    page.locator('.timestamp'),
    page.locator('.random-ad'),
  ],
  maxDiffPixelRatio: 0.01, // allow 1% pixel difference
});

// Use text snapshot with a sanitizer for dynamic values
const content = await page.getByRole('main').textContent();
const sanitized = content!.replace(/\d{4}-\d{2}-\d{2}/g, 'DATE');
expect(sanitized).toMatchSnapshot('dashboard-content.txt');
```

```javascript
// JavaScript

// Update snapshots: npx playwright test --update-snapshots

await expect(page).toHaveScreenshot('dashboard.png', {
  mask: [
    page.locator('.timestamp'),
    page.locator('.random-ad'),
  ],
  maxDiffPixelRatio: 0.01,
});

const content = await page.getByRole('main').textContent();
const sanitized = content.replace(/\d{4}-\d{2}-\d{2}/g, 'DATE');
expect(sanitized).toMatchSnapshot('dashboard-content.txt');
```

**Related**: [core/visual-regression.md](visual-regression.md)

---

### "A snapshot doesn't exist at ..., writing actual."

**Cause**: First run of `toHaveScreenshot()` or `toMatchSnapshot()` — there is no baseline file yet. Playwright writes the actual image as the new baseline and fails the test once. With `--update-snapshots=none` the message ends at `.` and nothing is written.

**Common triggers**:
- A new visual test, or a renamed screenshot
- Running on a new OS or browser: baselines are per platform (`-chromium-linux.png` vs `-chromium-darwin.png`)
- CI checks out the repo without the committed snapshot directory

**Fix**: Review the written baseline, commit it, and re-run. Generate CI baselines in the same environment CI uses.

```bash
npx playwright test --update-snapshots=missing
# Linux baselines from macOS/Windows: run inside the official image
docker run --rm --init --ipc=host -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.64.0-noble npx playwright test --update-snapshots
```

**Related**: [core/visual-regression.md](visual-regression.md)

---

### "Playwright Test did not expect test() to be called here."

**Cause**: `test()` (or `test.describe()`, `test.beforeEach()`, ...) ran outside a test file that the runner is loading.

**Common triggers**:
- Calling `test()` in `playwright.config.ts` or a file it imports
- Two different versions of `@playwright/test` installed (often a dependency pulls its own)
- Calling `test()` inside an `async` `test.describe()` callback — only sync callbacks are supported
- Running a spec file directly with `node` or `ts-node`

**Fix**:

```bash
npm ls @playwright/test   # must list exactly one version
npx playwright test       # never node tests/example.spec.ts
```

```typescript
// TypeScript — BAD: test() after an await inside an async describe. If the awaited promise is
// already resolved there's no error, but the test silently lands outside the describe.
test.describe('suite', async () => { await setup(); test('a', async () => {}); });
// GOOD
test.describe('suite', () => { test('a', async () => {}); });
```

**Related**: [core/configuration.md](configuration.md)

---

### "Error: duplicate test title"

**Cause**: Two tests in the same file have the same full title (describe titles + test title). Full message: `Error: duplicate test title "<titles joined by ›>", first declared in <file>:<line>`. The run fails before any test executes.

**Common triggers**:
- Copy-pasting a test without renaming it
- Generating tests in a loop with a title that does not include the loop variable

**Fix**: Make every title unique within the file.

```typescript
// TypeScript
for (const user of ['admin', 'viewer']) {
  test(`login works for ${user}`, async ({ page }) => { /* ... */ });
}
```

```javascript
// JavaScript
for (const user of ['admin', 'viewer']) {
  test(`login works for ${user}`, async ({ page }) => { /* ... */ });
}
```

**Related**: [core/test-organization.md](test-organization.md)

---

### "Error: browserType.launch: Executable doesn't exist"

**Cause**: The Playwright browser binaries are not installed on this machine or they were installed for a different Playwright version.

**Common triggers**:
- Fresh clone of a project without running the install step
- Upgrading `@playwright/test` without reinstalling browsers
- CI environment missing the install step
- Using `npm ci` which cleans `node_modules` but does not trigger the browser install postinstall script
- Multiple Playwright versions installed (global vs local)

**Fix**: Install the browsers.

```bash
# Install all browsers
npx playwright install

# Install only the browser you need (faster in CI)
npx playwright install chromium

# Install browsers with OS dependencies (needed in CI/Docker)
npx playwright install --with-deps

# If you're on a CI Dockerfile, add this to your Dockerfile
# RUN npx playwright install --with-deps chromium
```

For CI pipelines, always include the install step:

```yaml
# GitHub Actions example
- name: Install Playwright Browsers
  run: npx playwright install --with-deps
```

**Related**: [ci/ci-github-actions.md](../ci/ci-github-actions.md), [ci/docker-and-containers.md](../ci/docker-and-containers.md)

---

### "Error: Cannot use import statement outside a module"

**Cause**: Node.js is running the test file as CommonJS but the file uses ES module `import` syntax without the right configuration.

**Common triggers**:
- Missing or misconfigured `tsconfig.json`
- Using `.ts` files without `@playwright/test` properly resolving TypeScript
- `package.json` does not have `"type": "module"` but test files use `import`
- Running test files directly with `node` instead of through `npx playwright test`
- Conflicting Babel or ts-node configuration

**Fix**: Ensure TypeScript is configured correctly and always run tests through the Playwright CLI.

```bash
# Always run tests through the Playwright CLI — never with node directly
npx playwright test

# NOT this:
# node tests/example.spec.ts  <-- will fail
```

```typescript
// TypeScript — tsconfig.json (minimal working config)
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

If using JavaScript without TypeScript:

```javascript
// JavaScript — ensure package.json has "type": "module"
// Or rename files to .mjs

// In playwright.config.js — use require if package.json lacks "type": "module"
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({ /* ... */ });
```

**Related**: [core/configuration.md](configuration.md)

---

### "Fixture "xxx" has already been registered as a { scope: 'test' } fixture"

**Cause**: A later `test.extend()` (or a `mergeTests()` input) redefines an existing fixture with a different `scope`, `auto`, or `option` setting. Overriding a fixture with the same name and the same options is allowed; changing those options is not. The same error appears as `... registered as a { auto: ... }` or `... { option: ... }` fixture, and names the file where the first definition lives.

**Common triggers**:
- Overriding a built-in or shared test-scoped fixture with `{ scope: 'worker' }` (or the reverse)
- Two fixture files define the same name, one as an `option: true` fixture and one as a plain fixture
- Adding `{ auto: true }` in an override of a fixture that was not auto

**Fix**: Keep the original fixture's options when overriding it, or give the new fixture a different name.

```typescript
// TypeScript

// BAD — base defines `account` as test-scoped; this redefines it as worker-scoped
export const test = base.extend<{}, { account: Account }>({
  account: [async ({}, use) => { await use(await createAccount()); }, { scope: 'worker' }],
});

// GOOD — new name for the worker-scoped variant
export const test = base.extend<{}, { workerAccount: Account }>({
  workerAccount: [async ({}, use) => { await use(await createAccount()); }, { scope: 'worker' }],
});
```

```javascript
// JavaScript

// GOOD — new name for the worker-scoped variant
const test = base.extend({
  workerAccount: [async ({}, use) => { await use(await createAccount()); }, { scope: 'worker' }],
});
```

**Related**: [core/fixtures-and-hooks.md](fixtures-and-hooks.md)

---

## Network & API Errors

---

### "Error: apiRequestContext.get: connect ECONNREFUSED"

**Cause**: The API request made via `request.get()` (or `.post()`, `.put()`, etc.) could not connect to the target server. Same underlying issue as `page.goto: net::ERR_CONNECTION_REFUSED` but for API testing.

**Common triggers**:
- API server not running when using `request` fixture
- Wrong `baseURL` in the config or in the API request context
- Running API tests against a service that hasn't started yet
- In CI, the API service container is not ready

**Fix**: Ensure the API server is running. Use `webServer` config to auto-start it, or add a health check.

```typescript
// TypeScript — playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: [
    {
      command: 'npm run start:api',
      url: 'http://localhost:4000/health',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run start:web',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
  ],
  use: {
    baseURL: 'http://localhost:3000',
  },
});

// In tests, use the request fixture with explicit baseURL for API calls
test('fetch users', async ({ request }) => {
  const response = await request.get('http://localhost:4000/api/users');
  expect(response.ok()).toBeTruthy();
});
```

```javascript
// JavaScript — playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  webServer: [
    {
      command: 'npm run start:api',
      url: 'http://localhost:4000/health',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run start:web',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
  ],
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

**Related**: [core/api-testing.md](api-testing.md), [core/configuration.md](configuration.md)

---

## Authentication & State Errors

---

### "Error reading storage state from ... ENOENT: no such file or directory"

**Cause**: The `storageState` path referenced in the config or test does not point to an existing file, so `browser.newContext` fails with `Error reading storage state from playwright/.auth/user.json:` followed by `ENOENT: no such file or directory, open '...'`. The auth state file has not been generated yet.

**Common triggers**:
- Running tests before running the auth setup project
- The `globalSetup` or auth setup project did not complete successfully
- The file path in the config does not match the path used in the setup
- `.gitignore` excluded the storage state file and it was not regenerated after a fresh clone
- CI cache expired and the state file was not recreated

**Fix**: Ensure the auth setup runs first and the file path is consistent.

```typescript
// TypeScript — playwright.config.ts
import { defineConfig } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

export default defineConfig({
  projects: [
    // Setup project runs first and creates the auth state file
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        storageState: authFile,
      },
      dependencies: ['setup'], // ensures setup runs first
    },
  ],
});

// auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password123'); // pragma: allowlist secret
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');
  // Save the authenticated state
  await page.context().storageState({ path: authFile });
});
```

```javascript
// JavaScript — playwright.config.js
const { defineConfig } = require('@playwright/test');

const authFile = 'playwright/.auth/user.json';

module.exports = defineConfig({
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
    },
    {
      name: 'chromium',
      use: {
        storageState: authFile,
      },
      dependencies: ['setup'],
    },
  ],
});

// auth.setup.js
const { test: setup, expect } = require('@playwright/test');

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password123'); // pragma: allowlist secret
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: authFile });
});
```

Ensure the auth directory exists and is in `.gitignore`:

```bash
mkdir -p playwright/.auth
echo "playwright/.auth/" >> .gitignore
```

**Related**: [core/authentication.md](authentication.md), [core/auth-flows.md](auth-flows.md)

---

### "Error: Target page, context or browser has been closed"

**Cause**: Code attempted to use a `page`, `context`, or `browser` object that has already been closed or disposed.

**Common triggers**:
- Using a `page` reference after `page.close()` was called
- Storing a `page` or `context` in a module-level variable and reusing it across tests
- A fixture tore down the browser context while an async callback was still running
- A `beforeAll` created a context that was closed before all tests finished using it
- Using `browser.newContext()` manually and forgetting to manage its lifecycle

**Fix**: Never store page/context references in shared mutable state. Use Playwright fixtures for lifecycle management.

```typescript
// TypeScript

// BAD — shared module-level variable
let sharedPage: Page;
test.beforeAll(async ({ browser }) => {
  sharedPage = await browser.newPage();
});
test.afterAll(async () => {
  await sharedPage.close();
});
test('first', async () => {
  await sharedPage.goto('/'); // might fail if afterAll from another describe ran first
});

// GOOD — use the built-in page fixture (one per test, auto-managed)
test('first', async ({ page }) => {
  await page.goto('/'); // always a fresh, open page
});

// GOOD — for shared state across tests, use a worker-scoped fixture
import { test as base } from '@playwright/test';

export const test = base.extend<{}, { adminContext: BrowserContext }>({
  adminContext: [async ({ browser }, use) => {
    const context = await browser.newContext();
    await use(context);
    await context.close();
  }, { scope: 'worker' }],
});
```

```javascript
// JavaScript

// GOOD — use the built-in page fixture
test('first', async ({ page }) => {
  await page.goto('/');
});

// GOOD — for shared state, use a worker-scoped fixture
const { test: base } = require('@playwright/test');

const test = base.extend({
  adminContext: [async ({ browser }, use) => {
    const context = await browser.newContext();
    await use(context);
    await context.close();
  }, { scope: 'worker' }],
});
```

**Related**: [core/fixtures-and-hooks.md](fixtures-and-hooks.md)

---

## CI-Specific Errors

---

### "Error: browserType.launch: Failed to launch the browser process."

**Cause**: The browser process exited immediately after launch, usually because required OS-level dependencies are missing in the CI environment. The `Browser logs:` section that follows names the missing library or sandbox problem. (Older Playwright versions printed `Browser closed unexpectedly`.)

**Common triggers**:
- Running on a minimal Docker image (e.g., `node:alpine`) without browser dependencies
- Missing shared libraries (`libgbm`, `libnss3`, `libatk-bridge`, etc.) on Linux CI
- Insufficient shared memory (`/dev/shm` too small) — browsers use shared memory for rendering
- Running as root in Docker without `--no-sandbox` (Chromium refuses to run as root with sandbox)
- Out-of-memory kill on CI (browser process is OOM-killed by the OS)

**Fix**: Install OS-level dependencies and configure the environment.

```bash
# Install browsers with their OS dependencies (recommended)
npx playwright install --with-deps chromium

# If using Docker, use the official Playwright image
# Dockerfile
FROM mcr.microsoft.com/playwright:v1.64.0-noble
WORKDIR /app
COPY . .
RUN npm ci
RUN npx playwright install chromium
CMD ["npx", "playwright", "test"]
```

For shared memory issues:

```yaml
# GitHub Actions — increase /dev/shm
jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.64.0-noble
      options: --shm-size=2gb

# Docker run — increase shared memory
# docker run --shm-size=2gb my-test-image
```

For running as root in Docker:

```typescript
// TypeScript — playwright.config.ts (only for Docker/CI)
export default defineConfig({
  use: {
    launchOptions: {
      args: process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
    },
  },
});
```

```javascript
// JavaScript — playwright.config.js
module.exports = defineConfig({
  use: {
    launchOptions: {
      args: process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
    },
  },
});
```

**Related**: [ci/ci-github-actions.md](../ci/ci-github-actions.md), [ci/docker-and-containers.md](../ci/docker-and-containers.md)

---

### "Error: Playwright Test needs to be invoked via 'npx playwright test' and excluded from Jest test runs."

**Cause**: Jest loaded a Playwright test file. Playwright throws this when it detects it is running inside a Jest worker. (Running a spec directly with `node` produces "Playwright Test did not expect test() to be called here." instead — see Test Framework Errors.)

**Common triggers**:
- Jest's default `testMatch` picks up `*.spec.ts` files in the Playwright test directory
- Running `npm test` (Jest) at the repo root of a project that also holds Playwright tests
- An IDE Jest extension auto-running every spec file

**Fix**: Keep Playwright tests in their own directory, exclude it from Jest, and run it with the Playwright CLI.

```javascript
// jest.config.js
module.exports = {
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/e2e/'],
};
```

```bash
npx playwright test                           # run all tests
npx playwright test tests/login.spec.ts       # run specific file

# package.json
# "scripts": { "test": "jest", "test:e2e": "playwright test" }
npm run test:e2e
```

**Related**: [core/configuration.md](configuration.md)

---

## Additional Common Errors

---

### "Error: page.evaluate: Execution context was destroyed"

**Cause**: The page navigated or reloaded while `page.evaluate()` was executing JavaScript in the browser context.

**Common triggers**:
- Calling `evaluate()` while the page is in the middle of a navigation
- A timer or event on the page triggers a redirect during evaluation
- Running `evaluate()` in a `beforeEach` that races with `page.goto()`

**Fix**: Ensure the page is stable before evaluating.

```typescript
// TypeScript

// BAD — evaluate races with navigation
await page.goto('/dashboard');
const title = await page.evaluate(() => document.title); // context might be destroyed

// GOOD — wait for load state first
await page.goto('/dashboard');
await page.waitForLoadState('domcontentloaded');
const title = await page.evaluate(() => document.title);

// GOOD — prefer locator-based assertions (no evaluate needed)
await page.goto('/dashboard');
await expect(page).toHaveTitle('Dashboard');
```

```javascript
// JavaScript

// GOOD — wait for load state first
await page.goto('/dashboard');
await page.waitForLoadState('domcontentloaded');
const title = await page.evaluate(() => document.title);

// GOOD — prefer locator-based assertions
await page.goto('/dashboard');
await expect(page).toHaveTitle('Dashboard');
```

**Related**: [core/assertions-and-waiting.md](assertions-and-waiting.md)

---

### "Error: page.screenshot: Cannot take screenshot larger than 32767 pixels on any dimension"

**Cause**: WebKit cannot capture an image taller or wider than 32767 pixels. This happens with full-page screenshots of very long pages.

**Common triggers**:
- `page.screenshot({ fullPage: true })` on an infinitely-scrolling page
- Pages with extremely tall content (long data tables, chat logs)
- CSS bugs that create enormous element heights

**Fix**: Clip the screenshot to a specific region or limit the viewport.

```typescript
// TypeScript

// BAD — might exceed size limits on tall pages
await page.screenshot({ fullPage: true, path: 'full.png' });

// GOOD — clip to a specific region
await page.screenshot({
  path: 'clipped.png',
  clip: { x: 0, y: 0, width: 1280, height: 2000 },
});

// GOOD — screenshot a specific element instead
await page.getByRole('main').screenshot({ path: 'main-content.png' });

// GOOD — set a reasonable viewport before full-page screenshot
await page.setViewportSize({ width: 1280, height: 720 });
await page.screenshot({ fullPage: true, path: 'full.png' });
```

```javascript
// JavaScript

// GOOD — clip to a specific region
await page.screenshot({
  path: 'clipped.png',
  clip: { x: 0, y: 0, width: 1280, height: 2000 },
});

// GOOD — screenshot a specific element
await page.getByRole('main').screenshot({ path: 'main-content.png' });
```

**Related**: [core/visual-regression.md](visual-regression.md)

---

### "Error: expect(locator).toBeAttached() failed"

**Cause**: The element never entered the DOM within the assertion timeout (`Expected: attached`). Unlike `toBeVisible()`, `toBeAttached()` only checks DOM presence — but the element was never rendered at all.

**Common triggers**:
- The component is conditionally rendered and the condition is not met
- A network request that populates the data has not completed
- Wrong selector that does not match any element
- The element is rendered by a lazy-loaded chunk that has not downloaded yet

**Fix**: Verify the precondition for the element to render.

```typescript
// TypeScript

// Ensure the data loads before asserting
await page.goto('/users');
await page.waitForResponse(resp => resp.url().includes('/api/users'));
await expect(page.getByRole('table')).toBeAttached();

// For lazy-loaded content, wait longer or trigger the load
await page.getByRole('tab', { name: 'Advanced' }).click();
await expect(page.getByTestId('advanced-panel')).toBeAttached({ timeout: 10_000 });
```

```javascript
// JavaScript

await page.goto('/users');
await page.waitForResponse(resp => resp.url().includes('/api/users'));
await expect(page.getByRole('table')).toBeAttached();

await page.getByRole('tab', { name: 'Advanced' }).click();
await expect(page.getByTestId('advanced-panel')).toBeAttached({ timeout: 10_000 });
```

**Related**: [core/assertions-and-waiting.md](assertions-and-waiting.md), [core/locators.md](locators.md)

---

### "Protocol error (Target.createTarget): Failed to create web contents"

**Cause**: Chromium could not create a new page, usually due to resource exhaustion. Headless shell reports `Failed to create web contents`; headed Chrome reports `Failed to open a new tab`.

**Common triggers**:
- Opening too many pages or contexts without closing them
- Memory leak in tests — each test opens a context but never closes it
- Running many parallel workers on a resource-constrained CI machine
- Browser process is unstable after a previous crash

**Fix**: Reduce parallelism, close unused contexts, or use fewer workers.

```typescript
// TypeScript — playwright.config.ts

export default defineConfig({
  // Reduce parallelism if resources are limited
  workers: process.env.CI ? 2 : undefined,

  // Limit to one browser context per worker
  fullyParallel: false, // run test files serially within a worker
});
```

```javascript
// JavaScript — playwright.config.js

module.exports = defineConfig({
  workers: process.env.CI ? 2 : undefined,
  fullyParallel: false,
});
```

If you manually create contexts, always close them:

```typescript
// TypeScript
test('multi-user test', async ({ browser }) => {
  const userContext = await browser.newContext();
  const adminContext = await browser.newContext();
  try {
    const userPage = await userContext.newPage();
    const adminPage = await adminContext.newPage();
    // ... test logic
  } finally {
    await userContext.close();
    await adminContext.close();
  }
});
```

```javascript
// JavaScript
test('multi-user test', async ({ browser }) => {
  const userContext = await browser.newContext();
  const adminContext = await browser.newContext();
  try {
    const userPage = await userContext.newPage();
    const adminPage = await adminContext.newPage();
    // ... test logic
  } finally {
    await userContext.close();
    await adminContext.close();
  }
});
```

**Related**: [ci/parallel-and-sharding.md](../ci/parallel-and-sharding.md), [core/multi-user-and-collaboration.md](multi-user-and-collaboration.md)

---

### "Error: expect(locator).toHaveText(expected) failed"

**Cause**: When followed by `Error: strict mode violation: ... resolved to N elements`, the locator matched multiple elements. A string or regex expectation is strict and needs exactly one element; only the array form accepts multiple matches.

**Common triggers**:
- Using a broad locator like `page.locator('.item')` that matches a list
- Expecting a single heading but the selector matches multiple
- Not scoping the locator to a specific container

**Fix**: Either narrow the locator to one element or use the array form of `toHaveText()`.

```typescript
// TypeScript

// BAD — locator matches multiple elements
await expect(page.locator('.item')).toHaveText('First Item');

// GOOD — narrow to one element
await expect(page.locator('.item').first()).toHaveText('First Item');

// GOOD — assert against an array when multiple elements are expected
await expect(page.locator('.item')).toHaveText([
  'First Item',
  'Second Item',
  'Third Item',
]);

// GOOD — use a more specific locator
await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome');
```

```javascript
// JavaScript

// GOOD — narrow to one element
await expect(page.locator('.item').first()).toHaveText('First Item');

// GOOD — assert against an array
await expect(page.locator('.item')).toHaveText([
  'First Item',
  'Second Item',
  'Third Item',
]);

// GOOD — use a more specific locator
await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome');
```

**Related**: [core/assertions-and-waiting.md](assertions-and-waiting.md), [core/locators.md](locators.md)

---

### "Error: page.waitForSelector: Timeout 30000ms exceeded"

**Cause**: `page.waitForSelector()` timed out. This method is discouraged in favor of web-first assertions or `locator.waitFor()`.

Under Playwright Test this message appears only when a timeout is set for the call or in config (`actionTimeout`, `navigationTimeout`, `timeout` option); with the defaults (0) the test instead fails with `Test timeout of 30000ms exceeded.`

**Common triggers**:
- Using legacy `page.waitForSelector()` from older tutorials or migration from Puppeteer
- The selector does not match any element in the DOM
- The element exists but does not meet the state requirement (e.g., `{ state: 'visible' }` but element is hidden)

**Fix**: Replace `waitForSelector()` with locator-based assertions.

```typescript
// TypeScript

// BAD — deprecated, no auto-retry, not composable
await page.waitForSelector('.loading', { state: 'hidden' });
await page.waitForSelector('.content', { state: 'visible' });

// GOOD — locator-based assertions with auto-retry
await expect(page.locator('.loading')).toBeHidden();
await expect(page.locator('.content')).toBeVisible();

// GOOD — use role-based locators for even more resilience
await expect(page.getByRole('progressbar')).toBeHidden();
await expect(page.getByRole('main')).toBeVisible();
```

```javascript
// JavaScript

// BAD — deprecated
await page.waitForSelector('.loading', { state: 'hidden' });
await page.waitForSelector('.content', { state: 'visible' });

// GOOD — locator-based assertions
await expect(page.locator('.loading')).toBeHidden();
await expect(page.locator('.content')).toBeVisible();

// GOOD — role-based locators
await expect(page.getByRole('progressbar')).toBeHidden();
await expect(page.getByRole('main')).toBeVisible();
```

**Related**: [core/locators.md](locators.md), [core/assertions-and-waiting.md](assertions-and-waiting.md), [migration/from-selenium.md](../migration/from-selenium.md)

---

### "Error: expect(page).toHaveTitle(expected) failed"

**Cause**: The `expect(page).toHaveTitle()` assertion failed because the page title did not match the expected value or pattern within the timeout.

**Common triggers**:
- The page has not finished loading and the title is still the initial empty or default value
- The SPA updates the document title asynchronously after rendering
- The expected title has a typo or does not match case-sensitively
- The page redirected to an error page with a different title

**Fix**: Ensure the page is fully loaded and use the correct expected value.

```typescript
// TypeScript

// toHaveTitle auto-retries, but ensure the page has loaded
await page.goto('/dashboard');
await expect(page).toHaveTitle('Dashboard | MyApp');

// Use regex for flexible matching
await expect(page).toHaveTitle(/Dashboard/);

// Debug: check what the actual title is
console.log(await page.title());
```

```javascript
// JavaScript

await page.goto('/dashboard');
await expect(page).toHaveTitle('Dashboard | MyApp');

// Use regex for flexible matching
await expect(page).toHaveTitle(/Dashboard/);

// Debug: check what the actual title is
console.log(await page.title());
```

**Related**: [core/assertions-and-waiting.md](assertions-and-waiting.md)

---

### "Error: page.setInputFiles: Non-multiple file input can only accept single file"

**Cause**: Attempted to upload multiple files to an `<input type="file">` that does not have the `multiple` attribute.

**Common triggers**:
- Passing an array of files to a single-file upload input
- The app uses a custom upload component that only handles one file at a time

**Fix**: Upload one file at a time, or ensure the input supports multiple files.

```typescript
// TypeScript

// BAD — input does not have multiple attribute
await page.getByLabel('Upload file').setInputFiles([
  'file1.pdf',
  'file2.pdf', // error: non-multiple input
]);

// GOOD — single file
await page.getByLabel('Upload file').setInputFiles('file1.pdf');

// GOOD — for multiple file input (must have multiple attribute in HTML)
await page.getByLabel('Upload files').setInputFiles([
  'file1.pdf',
  'file2.pdf',
]);

// To clear the file input
await page.getByLabel('Upload file').setInputFiles([]);
```

```javascript
// JavaScript

// GOOD — single file
await page.getByLabel('Upload file').setInputFiles('file1.pdf');

// GOOD — multiple files (input must have multiple attribute)
await page.getByLabel('Upload files').setInputFiles([
  'file1.pdf',
  'file2.pdf',
]);

// To clear the file input
await page.getByLabel('Upload file').setInputFiles([]);
```

**Related**: [core/file-operations.md](file-operations.md), [core/file-upload-download.md](file-upload-download.md)

---

### "Error reading storage state from ... is not valid JSON"

**Cause**: The `storageState` option points to a file with invalid JSON, so `browser.newContext` fails with `Error reading storage state from <path>:` followed by the JSON parser error — `Unexpected end of JSON input` for an empty file, or `Unexpected token ..., "..." is not valid JSON` for a corrupted one.

**Common triggers**:
- The auth setup wrote an empty file or incomplete JSON
- The storage state file was corrupted or truncated
- Manually editing the storage state file and introducing a syntax error
- The auth setup failed silently (login did not complete) and saved an invalid state

**Fix**: Delete the storage state file and regenerate it.

```bash
# Delete the corrupted file
rm -f playwright/.auth/user.json

# Re-run the setup
npx playwright test --project=setup
```

To prevent this, add error checking in the auth setup:

```typescript
// TypeScript — auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password123'); // pragma: allowlist secret
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Verify login actually succeeded before saving state
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.context().storageState({ path: authFile });
});
```

```javascript
// JavaScript — auth.setup.js
const { test: setup, expect } = require('@playwright/test');

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password123'); // pragma: allowlist secret
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Verify login actually succeeded before saving state
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.context().storageState({ path: authFile });
});
```

**Related**: [core/authentication.md](authentication.md), [core/auth-flows.md](auth-flows.md)

---

## Quick Diagnostic Checklist

When you hit an error not listed above, run through this checklist:

1. **Read the full error** — Playwright errors include the locator, the action, and a `Call log:` of every retry. The last call-log lines (e.g., `intercepts pointer events`, `element is not stable`) usually name the blocker; search this file for them.
2. **Enable traces** — Add `trace: 'on'` temporarily or `trace: 'on-first-retry'` in config. Run `npx playwright show-trace trace.zip` to see screenshots, DOM, network, and console at the point of failure.
3. **Use the Playwright Inspector** — Run `npx playwright test --debug` to step through the test interactively.
4. **Check the locator** — Run `npx playwright codegen <url>` to verify locators against the live page.
5. **Check the Playwright version** — Run `npx playwright --version`. Ensure `@playwright/test` and browser binaries are the same version.
6. **Search the Playwright issue tracker** — Many errors have known solutions in [github.com/microsoft/playwright/issues](https://github.com/microsoft/playwright/issues).
