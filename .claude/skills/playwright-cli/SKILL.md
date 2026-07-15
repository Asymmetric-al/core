---
name: playwright-cli
description: "Use Playwright CLI for ad hoc browser automation and interactive verification of Core UI: opening local routes, navigating, inspecting snapshots, using element refs, checking console/network activity, capturing evidence, tracing, and reproducing flows. Do not use it as a substitute for committed `@playwright/test` coverage or for non-browser unit tests."
---

# Playwright CLI in Core

Use Playwright CLI as a token-efficient interactive browser driver. Keep Core's
committed Playwright Test suites as the regression and CI source of truth.

## Boundary

- Use this skill to inspect a running app, reproduce a UI problem, exercise a
  flow, or gather browser evidence.
- Use `docs/ai/skills/playwright-best-practices/SKILL.md` when authoring or
  repairing `@playwright/test` specs.
- Use `docs/ai/skills/accessibility-review/SKILL.md` for accessibility review;
  a CLI snapshot is useful evidence but is not an axe or WCAG audit.
- Do not add `@playwright/cli` to `package.json` for one-off agent work. Prefer
  an available `playwright-cli` binary; otherwise use a Bun one-off invocation.
- The CLI compares `.agents/skills/playwright-cli` and
  `.claude/skills/playwright-cli` byte-for-byte with its bundled generic skill.
  Core's repository-adapted skill intentionally differs, so the CLI may print a
  version-mismatch notice. Do **not** run its suggested `install --skills`
  command; that would overwrite generated mirrors. Refresh the canonical skill
  and run Core's sync workflow instead.

Start by checking the live command surface:

```bash
playwright-cli --help
# If the binary is unavailable:
bunx --bun @playwright/cli@latest --help
```

Use the same available command prefix for the rest of the session. Help output
is authoritative because the CLI evolves independently of Core's pinned
`@playwright/test` package.

## Workflow

1. **Find the target.** Check whether the relevant Core dev server is already
   running before starting one. Confirm the exact local URL and expected app
   state; use Next.js devtools when it can answer route/runtime questions.
2. **Open and snapshot.** Open the route, take a shallow snapshot first, and use
   `find` or a focused element snapshot rather than loading an unnecessarily
   large page tree.
3. **Act through user-facing controls.** Prefer snapshot refs or role locators.
   Refresh the snapshot after navigation or material DOM changes because refs
   are session state, not durable test selectors.
4. **Observe the result.** Confirm visible state and URL, then inspect console
   messages and network requests when the claim depends on runtime behavior.
   Use tracing only for failures that need a timeline.
5. **Capture bounded evidence.** Store screenshots, traces, videos, PDFs, and
   saved auth state only under ignored `test-results/` or `.auth/` paths. Never
   print, persist, or commit credentials, cookies, service tokens, or Vercel
   bypass secrets.
6. **Close the session.** Close browsers and clean up disposable routes/mocks.
   If the behavior can regress, convert the proof into a committed Playwright
   Test spec and run the applicable Core package script.

## Compact command set

```bash
playwright-cli open http://localhost:3000
playwright-cli snapshot --depth=4
playwright-cli find "Sign in"
playwright-cli click e15
playwright-cli fill e21 "demo value"
playwright-cli press Enter
playwright-cli console error
playwright-cli requests
playwright-cli screenshot --filename=test-results/playwright-cli/result.png
playwright-cli close
```

For multiple roles or apps, use named sessions (`-s=<name>`) rather than
sharing cookies or page state. Prefer demo/test accounts and Core's existing
auth helpers. Do not use `eval` or storage mutation to bypass the behavior being
verified; reserve them for narrow inspection or explicitly tested setup.

## Checklist

- [ ] The task needs live browser interaction rather than a unit test or static read.
- [ ] An existing dev server and the exact route were checked first.
- [ ] The CLI help for the available version was consulted.
- [ ] Interactions use current refs or user-facing locators and verify outcomes.
- [ ] Console/network/trace evidence is collected only when relevant.
- [ ] Artifacts and auth state stay in ignored paths with no secrets in output.
- [ ] The session is closed, and regression-worthy behavior becomes a test.

## Provenance

See [references/upstream.md](references/upstream.md) for the reviewed official
source, Apache-2.0 license, Core adaptations, and refresh workflow.
