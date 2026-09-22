# Verification — AL-1894

## Source and dependency audit

- Based on `develop` at `c236455724a819ec800104be3e81f563da3de86b`, in an isolated worktree. The existing canonical worktree's unrelated changes were not modified.
- Official Base UI releases and npm registry verified 2026-09-22: stable 1.8.0; no newer beta/RC.
- Exact shared dependency is 1.8.0; unused app-level Base UI and Radix dependencies removed. Frozen install and workspace lock drift verification pass. Lockfile update retains unrelated vendored-package metadata rather than accepting Bun's incidental re-resolution of that graph.
- Shadcn CLI confirms Base UI, base-maia, Zinc, CSS variables, and existing shared aliases.
- Independent source review covered root dimensions/stacking, care export consumers, donor render composition, stable selection IDs, callback behavior, and dependency closure.

## Behavior evidence

- TDD reproduced and fixed the care profile missing TabsList context crash, missing care dialog semantics/Escape handling, donation radio/tab keyboard gaps, incorrect NavigationMenu state selectors, persistent multifilter semantics, and task partner duplicate-name keyboard selection/clear behavior.
- Existing donation payment/idempotency/fee tests remain unchanged in intent and pass alongside the added keyboard tests. No payment or task persistence logic was changed.
- Browser verification uses real shared production components and CSS in an isolated local fixture. Chromium at 1280×844 and 390×844 passes nested/scrolled Dialog, AlertDialog, Sheet, Drawer, care shortcuts, single/multiple filters, and duplicate-name partner selection. It checks stacking over high-z application content, viewport bounds, Tab containment, Escape, selection, clearing, and focus restoration.
- All 16 shared browser axe state scans report zero WCAG2A/AA/2.1AA violations; no page errors. Browser inspection found and repaired the Base UI 1.8 Empty live region's unwanted 64px blank space without hiding the live region.
- Real Next donor checkout route verified at desktop/mobile widths. Payment-tab checks use explicit local configuration/Stripe client stubs; they prove UI behavior, not provider integration. No payment POST or charge occurred.
- Physical iOS 26 Safari browser chrome is not emulated by the Chromium mobile viewport checks; device QA remains a release check.

## Repository checks

- All 15 workspace typechecks pass; scoped changed-workspace lint passes. Full lint passed with existing unrelated warnings.
- OpenSpec strict/full validation, shared shadcn configuration, frozen install, and Bun workspace-lock verification pass.
- Shadscan task baseline/floor: 29 using repository-pinned CLI 0.1.1. Current shared UI audit: 29; no regression.
- The repository React Doctor runner failed in Bun with `child.channel?.unref is not a function`. The same cached CLI and configured first-party target/flag set completed under Node with advisory findings. No numeric score is produced by the configured offline/no-score mode; this is not a claim that all findings are fixed. Existing compiler/complexity findings remain outside this primitive adoption scope; the shared collection-factory export follows the established wrapper API pattern.
- Full unit suite and final preflight results are recorded when complete below.
