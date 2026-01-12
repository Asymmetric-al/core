# Testing Rules (Asymmetric.al)

## Frameworks
- **E2E**: Playwright (Configured in `playwright.config.ts`) (Primary)
- **Unit**: *None configured* (Do not add unless creating complex non-UI logic)
- **Accessibility**: `@axe-core/playwright`
- **Performance**: Playwright-based Web Vitals assertions

## Running Tests
Since no `npm run test` script exists, use `npx` directly:

```bash
# Run all tests (headless)
bun run test:e2e

# Run in UI mode (interactive)
bun run test:e2e:ui

# Debug mode
bun run test:e2e --debug

# View HTML report
npx playwright show-report
```

## Test Scope & Philosophy
1.  **Accessibility First**: 
    - `tests/e2e/accessibility.spec.ts` enforces WCAG compliance using `axe-core`.
    - **Rule**: All new pages must be added to the accessibility suite.
2.  **Performance Gates**:
    - `tests/e2e/performance.spec.ts` measures standard Web Vitals.
    - **Rule**: Do not regress LCP/CLS metrics below the defined thresholds.
3.  **User Flows**:
    - Write tests for critical paths (e.g., "User can donate", "User can login").
    - **Locators**: Use `page.getByRole(...)` or `page.getByText(...)`. **Never** use Xpath or brittle CSS classes.

## Best Practices
- **Mobile Emulation**: Tests are configured for Desktop Chrome and Pixel 5. Ensure responsive designs pass on both.
- **Isolation**: Tests must not depend on each other.
- **Mocking**: Use Playwright's network interception for stable API responses if backend is flaky, but prefer integration with the real dev server (`bun run dev`) as the `webServer` target.

## What Not To Do
- Do not add `jest` or `vitest` without a specific request.
- Do not write implementation-detail tests (e.g., testing private functions).
- Do not ignore a11y failures.
