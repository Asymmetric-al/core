# End-to-end tests

<!-- CORE-OVERLAY-START -->

## Core compatibility and ownership

Installed Next.js docs, docs/ai/rules/frontend.md, docs/ai/rules/testing.md, and docs/guides/architecture/data-access-boundary.md govern every recipe below. Core already enables Cache Components and partial prefetching. Use only APIs and test harnesses supported by the installed Next.js and Playwright versions. Keep server reads, tags, invalidators and business commands in packages/api; app feature folders own UI and browser query keys only. Do not add dependencies or alternate browser harnesses as a skill refresh side effect.
<!-- CORE-OVERLAY-END -->

What this architecture makes testable, and how to assert it. Test-runner mechanics come from the Playwright guide (installed: `node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md`) and the `instant()` reference (installed: `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md`); this page only decides what a test should claim.

## Assert the loading sequence, not the data

The invariants put static chrome outside boundaries and data-dependent bodies inside them, so the thing worth locking in is which content is available before uncached work resolves. `instant()` from `@next/playwright` pauses that work while its callback runs:

- Inside the callback, assert that the chrome and the cached or prefetched content are visible, and that deferred content is absent (`toHaveCount(0)`).
- After the callback, assert that the deferred content arrives.

For an initial load, the callback wraps `page.goto()`. For a client navigation, it wraps the click and `waitForURL`; hover the link first when the app prefetches on intent, so the per-link prefetch has a chance to resolve. Content behind `unstable_navigation()` must be absent inside the callback and present after it.

Do not assert on skeletons. A fallback can be replaced before the assertion runs, and its text or shape is an implementation detail. Assert on the content that replaces it.

## Locate content by what the user sees

Prefer roles and names (`getByRole('heading', { name })`, `getByRole('button', { name })`) over test ids. When a test id is needed for a data-dependent body, put it on the feature component's root element, not in the page, so pages can be recomposed without touching tests.

Next.js keeps recently visited segments mounted in a hidden `<Activity>` (installed: `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`), so after a client navigation the previous route's rows, headings and buttons are still in the DOM. Use visibility-aware selectors (installed: `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`) (`filter({ visible: true })`) for anything that exists on more than one route, or a strict-mode locator resolves to both copies. A button that appears in a list row and in a detail toolbar needs to be scoped to its container for the same reason.

## Mutations

A test that stars, archives, replies or creates data changes what later tests see. Run such suites with one worker against a seeded database, and re-seed before a run rather than trying to undo each change. Cached reads outlive the rows they came from, so a re-seed under a running dev server produces mixed data; start the server fresh, which is what a Playwright `webServer` does.

Assert a mutation through the UI it changes: the row loses its unread marker, the count in the sidebar drops, the reply becomes the newest message. Optimistic state settles into server state, so wait for the server-confirmed result (`toHaveCount`, `toHaveAttribute`) rather than the intermediate one.
