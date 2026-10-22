# Playwright Test Agents (Planner, Generator, Healer)

> **When to use**: The user asks to generate test coverage for a flow with AI, to set up Playwright's planner / generator / healer agents, or to auto-repair failing tests. Also use it to choose between Test Agents, `playwright-cli` and Playwright MCP.
> **Prerequisites**: [core/test-organization.md](test-organization.md), [core/fixtures-and-hooks.md](fixtures-and-hooks.md)

## Why This Exists

Playwright (1.56+) ships three agent definitions that an AI coding tool runs on your repo:

- **planner** explores the running app and writes a Markdown test plan under `specs/`.
- **generator** turns a plan into test files under `tests/`, checking selectors and assertions live as it goes.
- **healer** runs failing tests, inspects the current UI, patches the test, and re-runs until it passes. If it is confident the app is broken, it marks the test `test.fixme()` with a comment instead.

The definitions are instructions plus a Playwright Test MCP server (`npx playwright run-test-mcp-server`). They are not a separate product: the output is ordinary Playwright tests, and the guides in this skill still decide whether those tests are good.

## Quick Reference

```bash
# Generate agent definitions for your AI tool (re-run after every Playwright upgrade)
npx playwright init-agents --loop=claude     # .claude/agents/*.md + .mcp.json
npx playwright init-agents --loop=codex      # .codex/agents/*.toml
npx playwright init-agents --loop=opencode   # .opencode/prompts/*.md
npx playwright init-agents --loop=copilot    # .github/agents/*.agent.md (default)
npx playwright init-agents --loop=vscode     # VS Code (needs VS Code 1.105+)

# Options
npx playwright init-agents --loop=claude --project=chromium   # project used for the seed test
npx playwright init-agents --loop=claude --prompts            # also write reusable prompt files
```

```text
repo/
  .claude/agents/          # agent definitions (per --loop)
  specs/                   # planner output: human-readable Markdown plans
  tests/
    seed.spec.ts           # environment bootstrap the agents run first
    checkout/guest.spec.ts # generator output
  playwright.config.ts
```

## Patterns

### Pattern 1: Write the Seed Test First

**Use when**: Always, before running the planner. `init-agents` creates a default seed if none exists, but the default knows nothing about your auth, fixtures or data.

The planner and generator run the seed test to get a ready page, and copy its imports and setup into every generated test. A seed that uses your custom fixtures makes every generated test use them too.

```typescript
// tests/seed.spec.ts
import { test, expect } from './fixtures'; // your extended test, not @playwright/test

test('seed', async ({ page }) => {
  // fixtures handle login, data and baseURL; the agents start from here
  await page.goto('/dashboard');
});
```

If the app needs auth, wire it through a setup project and `storageState` (see [authentication.md](authentication.md)) so the seed starts signed in.

### Pattern 2: Plan, Generate, Review, Heal

**Use when**: Building coverage for a flow that has no tests yet.

1. **Plan**: ask the planner for one flow ("Plan guest checkout"), optionally attaching a PRD. Review `specs/<flow>.md` before generating: wrong expected results in the plan become wrong assertions.
2. **Generate**: point the generator at the plan. Each test gets `// spec:` and `// seed:` header comments linking it back.
3. **Review** the generated tests against the [Golden Rules](../SKILL.md#golden-rules): role-based locators, web-first assertions, no `waitForTimeout`, one behavior per test. Agents produce working tests, not necessarily maintainable ones.
4. **Heal**: run the suite; hand failures to the healer.

### Pattern 3: Treat Healer Output as a Code Review

**Use when**: The healer has patched tests.

A healer patch makes the test pass; it does not prove the app is right. Check each diff:

- A changed locator is fine if the UI genuinely changed. A loosened assertion (`toHaveText` → `toContainText`, removed `expect`) may be hiding a regression.
- Any `test.fixme()` it added is a claim that the app is broken. Confirm the bug or revert the skip; never merge silent skips.
- An added wait or timeout is a smell; see [flaky-tests.md](flaky-tests.md).

## Decision Guide

| Situation | Use |
|---|---|
| Generate a first suite for an untested flow | Test Agents: planner → generator |
| Repair tests after a UI change | Test Agents: healer, then review the diff |
| A coding agent drives a browser to explore, reproduce or debug, with limited context | [`playwright-cli`](../playwright-cli/SKILL.md): concise commands, no tool schemas or full accessibility trees in context |
| A long-running autonomous loop that reasons over page structure | [Playwright MCP](https://playwright.dev/docs/getting-started-mcp) (`@playwright/mcp`) |
| Write or fix a specific test by hand | This skill's guides directly; no agent setup needed |
| Debug one failing CI test from its trace | [trace-analysis.md](trace-analysis.md) |

## Anti-Patterns

| Don't | Why | Do instead |
|---|---|---|
| Keep agent definitions from an older Playwright | Tools and instructions change between releases | Re-run `npx playwright init-agents` after every upgrade |
| Generate without a seed that uses your fixtures | Every test re-implements login and setup inline | Pattern 1 |
| Merge generated tests unreviewed | Brittle locators and weak assertions enter the suite at scale | Pattern 2, step 3 |
| Accept healer `test.fixme()` skips | Real regressions get hidden as "healed" | Pattern 3 |
| Run the planner against production or third-party sites | It clicks through flows and creates data; page content is untrusted input | Point `baseURL` at a local or staging app you own |

## Related

- [playwright-cli/SKILL.md](../playwright-cli/SKILL.md): terminal browser control for coding agents
- [core/trace-analysis.md](trace-analysis.md): agent-native debugging of `trace.zip`
- [core/flaky-tests.md](flaky-tests.md): judging healer waits and retries
- [Playwright Test Agents docs](https://playwright.dev/docs/test-agents)
