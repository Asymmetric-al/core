# E2E Tests

## Running E2E tests locally

`bun run test:e2e` — donor app E2E tests (port 3005)

`bun run test:e2e:admin` — admin app smoke + font-switcher E2E tests (port 3030)

## Running in UI mode

`bun run test:e2e:ui` — donor app interactive UI mode

`bun run test:e2e:admin:ui` — admin app interactive UI mode

## Viewing the HTML report

`npx playwright show-report` — donor app report

`npx playwright show-report playwright-report-admin` — admin app report

## CI behavior

The `test-e2e` job in `.github/workflows/ci-integration.yml` is configured with `continue-on-error: true`, so failures are informational and do not block merges. On failure, CI uploads `playwright-report/` as an artifact for debugging.

## Admin app tests (`tests/e2e-admin/`)

### `smoke.spec.ts`
- Health endpoint (`/api/health`) returns 200 with `status:ok`
- Login page loads with correct UI elements (card title, email/password inputs, submit button)
- All protected routes serve pages without JS error overlays
- FOUC prevention: `data-font` attribute is set on `<html>` immediately after `domcontentloaded` (before React hydration) via the inline `<head>` script

### `font-switcher.spec.ts`
- Font persistence cycle: each of the three pairings (product, modern-clean, minimal) is stored in `localStorage` and the corresponding `data-font` attribute is applied on reload
- Edge cases: missing/invalid `localStorage` values fall back to `"product"`
- CSS variable correctness: `data-font` is set on `<html>`, not `<body>`
- Settings route: `/settings` and `/settings/integrations/sendgrid` load without errors and render the Settings heading
- Root layout: font CSS variable classes are applied to `<body>`, no uncaught JS errors on login
- Navigation stability: `data-font` persists when navigating between pages; clearing `localStorage` resets to `"product"` on next reload

## Growth plan - future tests to add

- Login / auth flow
- Donor checkout (full Stripe test mode)
- Admin tenant switching
- Missionary post creation
- Receipt download
- Font switcher UI interaction (clicking cards updates preview + localStorage)
