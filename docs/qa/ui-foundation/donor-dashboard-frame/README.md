# AL-1977 Donor dashboard frame

This evidence qualifies only the local content-growth/footer relationship. It
does not complete Core UI cohesion task 4.1 or validate unfinished dashboard
features.

## Source and environment

- Starting `develop`: `c4bc0553546f8b26599bc6dbe08f7aadbef52cc1`, fetched on
  October 8, 2026. The supplied checkout was left untouched; work used the
  isolated `fix/AL-1977-donor-dashboard-frame` worktree.
- Frozen `bun.lock` install; Next.js 16.4.0, Playwright 1.64.0, Chromium
  156.0.8078.4, Node 24.19.0. Initial browser/build checks used supplied Bun
  1.4.0; final readiness uses separately installed, repository-pinned Bun 1.4.2.
- Actual Donor Next.js app at `http://localhost:3106`, compiled application/Core
  styles and fonts, with Cache Components and partial prefetching preserved.
- Existing `scripts/run-with-ci-env.mjs` placeholder datasource and authorized
  `/api/auth/demo-account` fixture. Only GET `/api/posts` data is intercepted.
  No auth/navigation/layout/primitive mocks or guard edits.
- Runtime captures preceded the final commit. Their `sourceSHA` identifies the
  base; `layoutHash` identifies the exact edited source. Corrected layout
  SHA-256: `ace31510dde1aaf92688f6cc0f9b8af01c25c46996a79b90b0c9392e708b20b6`.

## Reproduction and correction

The ordinary direct content wrapper computed to `display:block` and
`flex:0 1 auto`; its nested `main` had `flex:1 1 0%` without a flex parent.
The browser regression failed on a 77.5px strip below the static footer.

The only application edit adds `flex flex-1 flex-col` to that wrapper. It gives
the wrapper outer-column growth and makes the existing main growth effective.
Default intrinsic minimum sizes remain intact, so long content expands the
document. Footer spacing, header clearance, gutters, semantic background,
`main-content`, transition/provider identities and sibling Suspense role gate
remain unchanged. No height measurement, fixed height, clipping or scroll pane
was introduced.

Matching actual-app empty-feed captures at 1440×1800:

| Geometry (CSS pixels)     |    Before |     After |
| ------------------------- | --------: | --------: |
| Frame/document height     |      1800 |      1800 |
| Main bottom / footer top  |    1040.5 |      1118 |
| Footer height             |       682 |       682 |
| Footer bottom             |    1722.5 |      1800 |
| Footer top/bottom padding |   96 / 96 |   96 / 96 |
| Route content bounds      | 145–960.5 | 145–960.5 |

[Before screenshot](./before-1440x1800.png), [after screenshot](./after-1440x1800.png),
[before geometry](./before-geometry.json), [after geometry](./after-geometry.json).
The assertions use a deliberate 2px rounding tolerance rather than font/text
pixel matching or chosen class strings.

## Verification

The dedicated real-app regression is
`tests/e2e/donor-dashboard-frame.spec.ts`. Geometry covers 1440×1800 short
content plus empty, error and controlled loading-to-eight-long-post states at
1440×2200, 1440×900, 320×568 and 640×450. It checks main/content containment,
footer/frame/document contiguity, document growth, no horizontal overflow or
clipping/scrolling ancestor, and reachable footer focus. Keyboard coverage uses
the existing skip link and workspace Wallet navigation. Desktop/mobile axe
scans retain all rules.

Actual 200% browser zoom is separate from viewport emulation. A temporary
Chromium extension called `chrome.tabs.setZoom(2)` and `getZoom()` confirmed 2.
The 1280×900 window has a 640×406 CSS content viewport after browser chrome.
Empty, loading and loading-to-long states scroll normally with static,
contiguous footers and document width 640. Tab reaches a visible footer link;
the final zoom run recorded no console/page errors.
[Zoom geometry](./zoom-geometry.json) and [footer keyboard focus](./zoom-200-percent-footer-focus.png).
Incomplete early zoom captures are excluded from comparison claims.

Commands actually run (Bun binaries were added to this task's command PATH):

| Command / check                                                                                    | Result                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun install --frozen-lockfile`                                                                    | Passed; no manifest/lock changes                                                                                                                                                         |
| `bunx --bun shadcn@latest info --json` from `packages/ui`                                          | Exact base-maia, Base UI, Tailwind 4; Zinc/CSS variables confirmed in committed config                                                                                                   |
| `bunx turbo run lint typecheck --filter=@asym/donor`                                               | Baseline and corrected runs passed, 12 tasks each                                                                                                                                        |
| `bunx vitest run tests/unit/apps/donor/static-shell-contract.test.ts`                              | 13 passed                                                                                                                                                                                |
| Donor Playwright command below                                                                     | Meaningful short-content red, then green; full run 15/17 passed, followed by 2/2 affected interaction cases after correcting fixture expectations. All 17 final cases verified; no skips |
| Full-page axe in dedicated Donor spec                                                              | Zero violations at desktop and 320px; no disabled rules                                                                                                                                  |
| `node /tmp/core-donor-zoom-evidence.cjs corrected`                                                 | Actual 200% browser zoom, scrolling and keyboard checks passed; collector/raw output retained under ignored task artifacts                                                               |
| Scoped ESLint and Prettier on dedicated test                                                       | Passed                                                                                                                                                                                   |
| `node scripts/run-with-ci-env.mjs -- bun run build:donor`                                          | Passed; 11 tasks, Cache Components / partial prefetching enabled                                                                                                                         |
| `bun run typecheck`                                                                                | Passed; 15 tasks                                                                                                                                                                         |
| `bunx vitest run tests/unit/scripts/bun-pin-sync.test.ts` and `bun-version.test.ts` with Bun 1.4.2 | 33 and 3 passed; initial full-unit run with supplied Bun 1.4.0 hit five version-guard failures                                                                                           |
| `bun run verify:shadcn-config`                                                                     | Passed                                                                                                                                                                                   |
| `bun run verify:shadcn-token-drift`                                                                | Report-only: 275 existing reportable hits; not a clean token audit or blocking gate                                                                                                      |
| `bun run ci:preflight`                                                                             | Passed with pinned Bun 1.4.2 after the approved proof refresh; all blocking stages passed, including 871 unit files / 6,958 tests. Two existing files / four tests skipped               |

```sh
PLAYWRIGHT_DONOR_BASE_URL=http://localhost:3106 ASYM_E2E_AUTH_SURFACE=donor \
  node scripts/run-with-ci-env.mjs -- node node_modules/@playwright/test/cli.js \
  test --config=playwright.donor.config.ts tests/e2e/donor-dashboard-frame.spec.ts \
  --workers=1 --output=test-results/donor-dashboard-frame-green
```

The two initial interaction expectations incorrectly required the non-tabbable
main itself to receive focus and treated a foreign-surface demo cookie as a
provider-authenticated wrong-role user. The corrected assertions verify the
native fragment/Tab behavior and the fixture's existing fail-closed redirect.
No application behavior or acceptance threshold was changed to make them pass.

The Shadscan repair refreshes only three existing source-proof SHA-256 fields
for this layout, after reviewing the unchanged command-menu and sibling-gate
contracts. This narrow shared-ledger exception was explicitly approved. No
classification, evidence fingerprint, score floor, rationale or accepted debt
changed. Reassessment of the original raw scan against fresh hashes passed;
Donor score 61 exceeds its unchanged floor 59.

## Scope, remaining evidence and concurrency

The feed fixture tests client-request loading, not route-level `loading.tsx`
timing. Existing static-shell tests and the unchanged gate composition check
the streaming contract. Geometry tests use reduced motion; opt-in animated
View Transitions and the production `instant()` rig are not qualified here.
Provider-backed login, live feed data and provider-authenticated wrong-role
redirects are unverified. The local wrong-role demo cookie is rejected as an
invalid surface session; it does not prove the provider role-redirect branch.

One independent pre-existing observation remains: at desktop the fixed navbar
ends at 69px while workspace navigation starts at 64px in both captures.
Primary content starts at 113px. Header sizing is outside this correction.

Initial GitHub inspection found no open PR or matching narrow issue. PR #1972
had already changed the semantic background; #1973 changed evidence/OpenSpec
tasks only. Both are preserved. Concurrent Missionary account-frame work
(AL-1976) has separate ownership. A final fetch still resolved to the starting
SHA and found no open PRs; there was no target integration or file overlap.
Apart from the three approved proof hashes, shared inventories and historical
evidence were not edited.

Rollback: revert this task's commit, including its three matching proof hashes,
or remove only the three wrapper utilities and dedicated regression/evidence
while restoring the original proof hashes. Shared defaults and business state
require no rollback.
