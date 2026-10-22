---
name: playwright-frontend
description: For frontend engineers authoring UI — how to make components reliably locatable by tests and AI agents. Covers the official Playwright locator priority, semantic/accessible markup first, and how to add valid, unique, stable `data-testid` attributes (naming convention, uniqueness in lists, stability rules) for React, Vue, Angular, and Svelte. Use when writing or reviewing components, or when an agent needs durable locators.
license: MIT
metadata:
  author: testdino.com
  version: "1.0.0"
---

# Playwright Frontend (Authoring Locatable Markup)

> Audience: **frontend engineers writing the app** — the counterpart to the test-author guides in `core/`. Your job here is to expose a small, stable, machine-readable contract on the DOM so tests *and* AI agents can locate elements deterministically, without flakiness.

A `data-testid` is a **public API for your UI's automation layer**: once a test or agent depends on it, renaming it is a breaking change. Build accessible markup first, then add deliberate, well-named, unique, stable test IDs where automation needs a durable handle.

## Guide Index

| Topic | Guide |
|---|---|
| `data-testid` conventions (when, naming, uniqueness, stability) | [data-testid-conventions.md](data-testid-conventions.md) |
| Framework patterns (React, Vue, Angular, Svelte) + centralizing IDs + production stripping | [examples.md](examples.md) |

## Golden Rules

1. **Semantic HTML first** — give elements a real role/label/accessible name so `getByRole`/`getByLabel` work; then add test IDs.
2. **Add `data-testid` only where role, label and text fall short** — no-role custom widgets, scope containers, list rows, and dynamic or localized regions. A control `getByRole` already finds uniquely needs none.
3. **Name for global uniqueness** — `feature-component-element[-variant]`, `kebab-case`.
4. **In lists, suffix with a stable domain key, never the array index** — `user-row-${user.id}` ✅ / `user-row-${index}` ❌.
5. **Decouple the value from text, locale, styling, and DOM position** — those change; the test ID must not.
6. **Standardize on one attribute** — `data-testid` is Playwright's default `testIdAttribute`; don't mix `data-test`/`data-qa`.

## Related

- [core/locators.md](../core/locators.md) / [core/locator-strategy.md](../core/locator-strategy.md) — the consumer side: choosing locators when *writing tests*.
- Playwright official docs: [Locators](https://playwright.dev/docs/locators), [Best Practices](https://playwright.dev/docs/best-practices).
