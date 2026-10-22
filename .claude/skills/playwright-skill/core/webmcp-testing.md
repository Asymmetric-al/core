# WebMCP Testing

> **When to use**: Your web app registers tools for AI agents through the experimental [WebMCP](https://webmachinelearning.github.io/webmcp/) browser API, and you need to verify those tools are listed, described, and behave correctly, the same way you test any other part of the app.
> **Prerequisites**: [core/api-testing.md](api-testing.md), [core/fixtures-and-hooks.md](fixtures-and-hooks.md)

## Why This Exists

WebMCP lets a page expose JavaScript functions as agent tools (`search_catalog`, `add_to_cart`, `book_slot`) directly from the browser, with a name, a description, and an input schema. Those tools are a public interface. An agent picks a tool by its description and calls it with arguments it infers from the schema, so a renamed tool, a vague description, or a schema that drifts from the implementation breaks agents silently: no UI changes, no console error, nothing a click-based E2E test would catch.

**Before 1.64** the only way to reach these tools was `page.evaluate()` against the in-page API, re-implementing tool discovery and invocation by hand in every test.

**Playwright 1.64** adds `page.webmcp` and `frame.webmcp`, a first-class handle on the tools a page registers. List them, inspect their metadata, and call them with arguments, with Playwright handling the plumbing.

## Quick Reference

```typescript
// WebMCP is experimental: enable it at launch (Chromium flag shown; Firefox uses prefs, see Pattern 1)
const browser = await chromium.launch({ args: ['--enable-features=WebMCP'] });
const page = await browser.newPage();
await page.goto('/');

// Discover tools the page registered
const tools = await page.webmcp.tools();          // [{ name, description, ... }]

// Call one, exactly as an agent would
const result = await page.webmcp.callTool('add', { a: 2, b: 40 });
result.content[0].text;                           // "42"

// Tools registered inside an iframe
const frame = page.frame({ name: 'checkout' });
await frame!.webmcp.tools();
```

```bash
# playwright-cli exposes the same surface
playwright-cli webmcp-list
playwright-cli webmcp-call search_catalog --params '{"query":"cats"}'
```

## Patterns

### Pattern 1: Enable WebMCP Once, in Config

**Use when**: More than one spec touches WebMCP tools.
**Avoid when**: You only have a single exploratory test; launching with `args` inline is fine there.

WebMCP sits behind a browser flag. Put the flag on a dedicated project so the rest of the suite runs on stock browsers and the WebMCP specs are clearly scoped.

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'webmcp',
      testMatch: /.*\.webmcp\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: ['--enable-features=WebMCP'] },
      },
    },
    {
      name: 'webmcp-firefox',
      testMatch: /.*\.webmcp\.spec\.ts/,
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            'dom.modelcontext.enabled': true,
            'dom.modelcontext.testing.enabled': true,
          },
        },
      },
    },
  ],
});
```

Chromium enables WebMCP with `--enable-features=WebMCP` and Firefox with the `dom.modelcontext.enabled` and `dom.modelcontext.testing.enabled` prefs. WebKit does not implement it, so do not add a WebKit variant of this project.

### Pattern 2: Lock Down the Tool Contract

**Use when**: Agents (yours or third-party) depend on the tools your page exposes.
**Avoid when**: Tools are still being prototyped and renamed daily; add the contract test once names settle.

Treat the tool list like a public API: assert names and descriptions explicitly so any change shows up in review.

```typescript
import { test, expect } from '@playwright/test';

test('catalog page exposes the expected agent tools', async ({ page }) => {
  await page.goto('/catalog');

  const tools = await page.webmcp.tools();
  const byName = Object.fromEntries(tools.map(t => [t.name, t]));

  expect(Object.keys(byName).sort()).toEqual(['add_to_cart', 'search_catalog']);

  // Agents choose tools by description; an empty or vague one is a bug
  for (const tool of tools)
    expect(tool.description?.length, `${tool.name} needs a description`).toBeGreaterThan(20);
});
```

**JavaScript**
```javascript
const { test, expect } = require('@playwright/test');

test('catalog page exposes the expected agent tools', async ({ page }) => {
  await page.goto('/catalog');
  const names = (await page.webmcp.tools()).map(t => t.name).sort();
  expect(names).toEqual(['add_to_cart', 'search_catalog']);
});
```

### Pattern 3: Call a Tool, Then Assert on the UI

**Use when**: A tool changes app state (adds to cart, books a slot) and the user must see the result.
**Avoid when**: The tool is read-only; asserting on its return value is enough.

The strongest WebMCP test exercises the tool exactly as an agent would and then checks that the page reflects it, which proves the tool is wired to real app state rather than a stub.

```typescript
test('add_to_cart tool updates the visible cart', async ({ page }) => {
  await page.goto('/catalog');

  const result = await page.webmcp.callTool('add_to_cart', { sku: 'CAT-001', quantity: 2 });
  expect(result.content[0].text).toContain('Added');

  // Web-first assertion on the UI the user sees
  await expect(page.getByRole('status', { name: 'Cart' })).toHaveText('2 items');
});
```

### Pattern 4: Negative Inputs

**Use when**: Always, for any tool that accepts arguments. Agents send malformed input far more often than humans do.

```typescript
test('search_catalog rejects an empty query with a useful message', async ({ page }) => {
  await page.goto('/catalog');

  const result = await page.webmcp.callTool('search_catalog', { query: '' });
  expect(result.isError).toBe(true);
  expect(result.content[0].text).toMatch(/query.*required/i);
});
```

An error message is part of the contract: an agent reads it to decide how to retry. Assert that it says what was wrong.

`callTool()` returns an `isError: true` result as is, but **throws** when the tool is not registered or its `execute` function throws. Assert on the rejection for tools that throw on bad input:

```typescript
await expect(page.webmcp.callTool('search_catalog', { query: 42 })).rejects.toThrow(/query/i);
```

### Pattern 5: Tools Registered by Authenticated Pages

**Use when**: Tools only appear after login (account actions, order history).

Combine with stored auth state so the tool list reflects a signed-in user. See [authentication.md](authentication.md).

```typescript
test.use({ storageState: 'playwright/.auth/user.json' });

test('signed-in users get order tools', async ({ page }) => {
  await page.goto('/account');
  const names = (await page.webmcp.tools()).map(t => t.name);
  expect(names).toContain('list_orders');
});

test.describe('anonymous', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('anonymous users do not get order tools', async ({ page }) => {
    await page.goto('/account');
    const names = (await page.webmcp.tools()).map(t => t.name);
    expect(names).not.toContain('list_orders');
  });
});
```

Exposing account tools to an anonymous session is an authorization bug, so the negative case matters as much as the positive one.

### Pattern 6: Explore From the CLI and From Playwright MCP

**Use when**: Writing the first test for a page you have not seen, or debugging a failing tool.

```bash
playwright-cli open https://localhost:3000/catalog
playwright-cli webmcp-list
playwright-cli webmcp-call search_catalog --params '{"query":"cats"}'
```

[Playwright MCP](https://playwright.dev/docs/getting-started-mcp) offers page-defined tools to the agent automatically as `webmcp_<tool>`. Pass `--no-webmcp` to opt out, for example when you want an agent to drive the UI the way a human would instead of taking the shortcut.

Tool names, descriptions, input schemas and results come from the page, so treat them as untrusted input, especially when an agent explores a page you do not control. See the Security Trust Boundary in [SKILL.md](SKILL.md).

## Decision Guide

| Situation | Approach |
|---|---|
| Verify which tools a page exposes | `page.webmcp.tools()` plus an explicit name list assertion |
| Verify a tool works end to end | `page.webmcp.callTool()` then a web-first UI assertion |
| Tools live in an iframe | `frame.webmcp` on the right `Frame` |
| Quick manual exploration | `playwright-cli webmcp-list` / `webmcp-call` |
| Agent should use the UI, not tools | Playwright MCP with `--no-webmcp` |
| Firefox coverage | `firefoxUserPrefs` with `dom.modelcontext.enabled` and `dom.modelcontext.testing.enabled` |
| WebKit coverage | Not available: WebKit does not implement WebMCP |

## Anti-Patterns

| Don't | Why | Do instead |
|---|---|---|
| `page.evaluate()` into the WebMCP API | Re-implements discovery and invocation; breaks as the spec evolves | `page.webmcp.tools()` / `callTool()` |
| Asserting only on `callTool()` return text | A tool can return "ok" without changing anything | Also assert on the UI or backend state |
| Snapshotting full tool JSON | Brittle on every schema tweak; reviewers stop reading the diff | Assert names, descriptions and the schema fields agents depend on |
| Enabling `--enable-features=WebMCP` for the whole suite | Hides which tests depend on an experimental flag | A dedicated `webmcp` project |

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `tools()` throws | Browser launched without WebMCP support | Chromium: `--enable-features=WebMCP`; Firefox: the `dom.modelcontext.*` prefs (Pattern 1) |
| `tools()` returns `[]` | Page registers tools after load, or in a child frame | Wait for the app's ready signal before listing; use `frame.webmcp` for iframes |
| `tools()` throws only in CI | CI project or browser channel launches without the flag | Use the bundled browser and pass the flag or prefs in the CI project |
| Tool found in page, not in frame | Tool registered inside an iframe | Use `frame.webmcp` on that frame |

## Related

- [core/api-testing.md](api-testing.md): contract testing patterns that apply equally to tool schemas
- [core/authentication.md](authentication.md): storage state for signed-in tool sets
- [playwright-cli/core-commands.md](../playwright-cli/core-commands.md): `webmcp-list` and `webmcp-call`
- [Playwright 1.64 release notes](https://playwright.dev/docs/release-notes#version-164)
