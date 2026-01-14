# Testing Rules — Rules
**Name:** `testing-rules`
**Purpose:** Define how to run and write tests (Playwright E2E, a11y, and perf gates).
Use this when adding tests, modifying critical flows, or verifying changes.

**Applies when:** Adding/updating tests, touching critical user flows, or asked to run tests.
**Do not use when:** Changes are purely documentation or non-functional and do not require tests.

## Rules
- **E2E framework:** Playwright (configured in `playwright.config.ts`).
- **Unit tests:** Not configured; do not add unless requested.
- **Accessibility:** `@axe-core/playwright`.
- **Performance:** Playwright-based Web Vitals assertions.

## Workflow
1. Decide the test scope (a11y, perf, or user flow).
2. Add coverage to the appropriate Playwright specs.
3. Run the relevant Playwright command(s).
4. Fix failures before proceeding.

## Checklists

### Implementation checklist
- [ ] New pages added to `tests/e2e/accessibility.spec.ts`
- [ ] Performance thresholds are preserved
- [ ] Critical user flows have Playwright coverage

### Review checklist
- [ ] Tests are isolated and deterministic
- [ ] Locators use `getByRole` or `getByText`
- [ ] No XPath or brittle CSS selectors

## Minimal examples

### Run all E2E tests
```bash
bun run test:e2e
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
