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
- Full `bun run ci:preflight` passed, including all three production app builds and 4,338 unit tests across 590 passing files (4 tests / 2 files skipped by the existing harness). Final source includes the review fixes that preserve search focus before conditional Clear buttons unmount in all three multifilters. Focused regressions also verify continued keyboard selection after clearing.

## Expanded documentation compliance qualification (2026-09-23)

The initial evidence above describes the earlier upgrade. The follow-up reviews the current documentation index and is recorded in `docs/guides/base-ui-compliance.md` plus the handbook, controls, and overlay matrices. It includes all 37 component families, conditional utility/specialist boundaries, 153 state-callback wrapper contracts, 58 selector call sites (25 now searchable), and the complete 151-node disabled Button-family inventory.

- Local `bun run ci:preflight` passes, including all three application builds and 4,592 passing unit tests (four existing skips across two files).
- The committed `bun run test:e2e:base-ui` gate passes 76 tests across four projects, with 28 axe scans, no runtime errors, and no external or API requests. It includes actual consumer forms, mobile filter Drawer, responsive toolbar, native links, and the real rich-text editor. The fixture builds before preview to avoid development dependency-optimizer races.
- Independent reviews closed the Slider controlled-scalar/default-array precedence bug and preserved informative action names, upload labels, and responsive action names. Async payment and tenant-default regressions verify that keeping focus does not permit repeated writes.
- React Doctor completes all eight configured first-party targets through Node in offline/no-score advisory mode. Its Bun runner still fails with `child.channel?.unref`; remaining maintainability, informational-tooltip focus, and controlled numeric synchronization advisories are described in the compliance ledger.
- The latest npm registry has only `latest: 1.8.0` and no prerelease at or above 1.8.0. A semantic lockfile comparison confirms the follow-up only removes input-otp and its workspace declaration; formatting moved existing entries without upgrading unrelated packages.
- Physical iOS software-keyboard/browser-chrome behavior and provider-governed previews retain the explicit limits described above. No platform governance or credentials were changed.

The current repository attribution policy rejects the earlier PR's unsigned Blake commits for a Conrad-authenticated publication. The original history is preserved; the complete reviewed tree is published from develop under Conrad's registered identity. Final published-head CI/review evidence belongs to the successor pull request and must be checked live.
