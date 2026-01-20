# Testing Rules — Rules

**Name:** `testing-rules`
**Purpose:** Define how to run and write tests (Playwright E2E, a11y, and perf gates).
Use this when adding tests, modifying critical flows, or verifying changes.

**Applies when:** Adding/updating tests, touching critical user flows, preparing a PR for review, or asked to run tests.
**Do not use when:** Changes are purely documentation or non-functional and do not require tests.

## Rules

- **E2E framework:** Playwright (configured in `playwright.config.ts`).
- **Unit tests:** Vitest (configured for `tests/unit/**/*.test.ts(x)`).
- **Accessibility:** `@axe-core/playwright`.
- **Performance:** Playwright-based Web Vitals assertions.

## Branch protection (required)

- **Required PR checks:** `test-unit` (optionally `format`, `lint`, `typecheck`, `build`).
- **Non-blocking informational checks:** `test-e2e` (non-blocking).
- **Repo admins:** Configure GitHub Branch Protection to require only unit tests (and any other desired checks) and do **not** require the E2E check.

## Workflow

1. Decide the test scope (unit, e2e, a11y, perf, or specific user flow).
2. Add coverage to the appropriate Playwright specs if needed.
3. Run the relevant Playwright command(s) before marking a PR ready.
4. Fix failures before proceeding.

## Checklists

### Implementation checklist

- [ ] New pages added to `tests/e2e/accessibility.spec.ts`
- [ ] Performance thresholds are preserved
- [ ] Critical user flows have Playwright coverage
- [ ] Unit tests added for new logic/utils where applicable

### Review checklist

- [ ] Tests are isolated and deterministic
- [ ] Locators use `getByRole` or `getByText`
- [ ] No XPath or brittle CSS selectors
- [ ] Test commands captured in PR summary when closing issues
- [ ] Unit tests avoid network calls and shared state

## Minimal examples

### Run all E2E tests

```bash
bun run test:e2e
```

### Run unit tests

```bash
bun run test:unit
```

### Run a11y checks

```bash
bun run test:a11y
```

### Run perf checks

```bash
bun run test:perf
```

### Run in UI mode

```bash
bun run test:e2e:ui
```

### Debug mode

```bash
bun run test:e2e --debug
```

### View report

```bash
npx playwright show-report
```

## Common mistakes / pitfalls

- Adding Jest/Vitest without a request
- Ignoring a11y failures
- Writing brittle selectors or XPath
- Allowing tests to depend on each other
