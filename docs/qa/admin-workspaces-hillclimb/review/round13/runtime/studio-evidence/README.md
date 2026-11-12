# Round 13 Studio runtime evidence

## Final status

Capture completed: **47 states, 82/82 declared state/viewport pairs, 96/96 exact PNGs**, including 14 full-page variants. The committed capture runner exited **0**. Offline revalidation found no missing/extra pairs or PNGs, changed PNG hashes, or native dimension mismatches.

**The live check phase did not run.** Its prerequisite immutable guard exited **1**, detecting the extra source/test file `tests/unit/scripts/dashboard-http-fixture.test.ts`. All 1,032 manifest entries remain byte-identical to the pre-run hashes, but the extra file means the freeze is not clean. The file is preserved. No source, test or harness repair, additional live probe, service restart, or freeze rewrite was attempted.

The check-runner exit code is **null / not run**, not zero: **0/74 expected check pairs** have fresh axe/keyboard/dialog-focus results. Counts and PNGs are capture evidence, not an accepted visual score or a completed accessibility run.

## Scope and authority

- Candidate: `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`, `http://localhost:3031` only; port 3030 was not used. The parent checkout remains read-only.
- Frozen source: `snapshots/round13-manifest.json` and `snapshots/round13.diff`. Root-supplied runtime boundaries are the explicit admin E2E surface, placeholder Supabase URL without a privileged key, and existing isolated scratch CMS on localhost:54322 with schema push disabled. Those boundaries are not real provider/authentication integration evidence.
- Delegate writes are confined to this evidence directory and `candidate-13-studio/`. No product/test/harness/environment changes, Git mutations, service lifecycle actions, hosted-data operations or extra document mutations were performed by this delegate. No subagents or new worktrees were used.
- The committed capture runner owned fixture interception, native PNG capture and catalogue interactions. Cleanup used only its existing `resetStudioState` path (`studio-fixtures.mjs:42`), not arbitrary document deletion or a custom database operation.
- Commands used the committed operation bounds and short tool yields. The final immutable subprocess had a 45-second timeout. No Next or Postgres service was started, restarted or stopped, and no Turbo command ran.

## Commands and actual outcomes

Times below are UTC; the capture occurred on November 12, 2026 in the supplied Asia/Bangkok timezone.

| Phase                         | Command / proof                                                                                                                                                               | Actual outcome                                                               |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Initial immutable guard       | `node docs/qa/admin-workspaces-hillclimb/freeze-checkpoint.mjs --verify round13`                                                                                              | Exit 0; 1,032 entries; no mismatches/extras at 17:39:24 UTC                  |
| Fresh fixture preparation     | Committed `prepareFixtureBundle`, plus fresh `createStates` / `createModuleStates` inventory                                                                                  | Exit 0; type proof passed; all 1,645 fixture checks passed at 17:39:26 UTC   |
| Capture                       | `CAPTURE_BASE_URL=http://localhost:3031 node docs/qa/admin-workspaces-hillclimb/capture-workspaces.mjs docs/qa/admin-workspaces-hillclimb/candidate-13-studio/capture studio` | Exit 0; 17:42:18-17:58:01 UTC                                                |
| Between-phase immutable guard | Same committed `--verify round13` command                                                                                                                                     | Exit 1; no manifest mismatches; one extra test file; check phase stopped     |
| Live check runner             | `check-workspaces.mjs`                                                                                                                                                        | NOT STARTED; exit null; no check-phase fixture proof                         |
| Final immutable guard         | Same committed `--verify round13` command                                                                                                                                     | Exit 1; no manifest mismatches; the same extra test remained at 18:13:57 UTC |
| Offline artifact cross-check  | Raw metrics, catalogue, PNG headers/bytes/SHA-256 and recorded capture inventory                                                                                              | Exit 0; no inventory errors at 18:16:57 UTC; not a live accessibility test   |

The capture invocation ran its own mandatory preflight **before browser work** and saved `candidate-13-studio/capture/fixture-proof.json` at 17:42:21 UTC. Its bundle hash matches the separately prepared catalogue proof: `afed848ea1dc100a2818ff77f3530987d5f8784fa324bfb3d72acda7443ad48b`. Preflight was not bypassed. The check phase never reached its preflight.

Command records and output are retained in `immutable-pre-command.json`, `immutable-pre-verify.log`, `fixture-preflight-command.json`, `fixture-preflight.log`, `capture-command.json`, `capture.log`, `immutable-between-phases.log`, `checks-blocked.json`, `immutable-post-command.json`, `immutable-post-verify.log`, and `offline-validation-command.json` / `offline-validation.log`.

## Immutable product evidence

`immutable-pre.json` and `immutable-post.json` retain all 1,032 expected/actual per-file SHA-256 values. The post record has **zero manifest mismatches and zero changed-since-pre paths**. The following hashes are unchanged:

| Item                    | Pre-run and post-run SHA-256                                       |
| ----------------------- | ------------------------------------------------------------------ |
| Frozen source aggregate | `7627607d2e9bf470d19cf4fcca6484a8622fb01655e18341bff6ba9d6516bc12` |
| Manifest bytes          | `c26908234e2630b4491c5956357277e0effdf2f9c592e1259915687873756d8a` |
| Supplied diff bytes     | `8e4c354259160e26be0fed1a3308ae87452b5fe6c58ea1c5448c1ffcbd143547` |

The aggregate is SHA-256 of `JSON.stringify(files.map(({path, sha256}) => ({path, sha256})))` in manifest order. The extra test file was outside the manifest: its final observed SHA-256 is `17331caf48c4189f1157d7c5a38223b43a62f8e7d686490d3700f55cb6b2e716` (14,128 bytes). Filesystem metadata reports creation at 17:46:09 UTC, during capture, and last write at 18:02:05 UTC. This does not identify its author. The immutable set was not continuously monitored during capture; initial and final file equality does not establish an uninterrupted clean freeze.

## Fresh coverage and measurements

`expected-studio-catalogue.json` derives from the freshly prepared bundle and current committed catalogues, not a historical merged result. `capture-inventory.json` records every expected/measured pair, actual route, raw headings, overflow, visible-focusable count, dialog geometry, and viewport/full PNG metadata. `png-index.json` records all 96 native dimensions, byte counts, SHA-256 values and modification times. `offline-validation.json` re-reads the fresh raw metrics and PNG bytes and verifies those records.

- Declared capture sizes: desktop 1440 x 1000, intermediate 1024 x 900, small-tablet 640 x 900, mobile 390 x 844; DPR 1, light appearance, reduced motion. Full PNG heights match `max(viewport height, measured scrollHeight)`.
- All 47 state names and 82 state/viewport pairs are present, with no extras. All 96 expected PNGs are present with matching native dimensions. Sixteen states declare setup functions; the capture log has **no missing-setup-trigger or cleanup-failure warning**. Absence of such a warning is not comprehensive interaction acceptance.
- Measured page horizontal overflow: **0/82**. Recognized unexpected route-error headings: **0/82**. This is not a claim that all network responses, console messages or possible route failures were inspected.
- Four readiness-text warnings are retained: `studio-new-template` (`New template`), `studio-page-edit-details` and `studio-page-edit-preview-menu` (`/document state|workspace/i`), and `studio-new-giving-errors` (`New giving page`). Their actual PNGs show the intended form, expanded details, open preview menu and validation error, respectively; the warnings are not silently converted into product failures or successes.
- Raw H1 inventories: **64 pairs contain one H1 and 18 contain two**. Account has raw `Account` plus the fixture-email heading; seeded editor states also have repeated raw title strings. The runner queries every H1 without visibility filtering (`capture-workspaces.mjs:65`). These are **not visible-heading counts** and do not prove duplicate visible headings.
- Fresh delegate DOM visibility/main counts, axe scans, keyboard movement, focus trapping/return, Escape behavior and 200% zoom were **not measured** after the freeze guard stopped execution. `focusableInMain` is an element count, not keyboard success. Root's earlier report of one visible H1/main is context, not a new delegate measurement.

## Exact check gaps

All **74 declared desktop/mobile check pairs are unrun**, listed individually in `checks-blocked.json`. No stale checks, zero-violation placeholder, successful-exit placeholder or unit-double output was merged into this evidence.

In addition, the unchanged committed check runner only offers desktop/mobile (`check-workspaces.mjs:69`). These eight declared capture pairs would still lack checks at their own width even if that runner completed:

- `studio-dashboard@intermediate`, `studio-dashboard@small-tablet`
- `studio-pages@intermediate`, `studio-pages@small-tablet`
- `studio-page-edit@intermediate`, `studio-page-edit@small-tablet`
- `studio-account@intermediate`, `studio-account@small-tablet`

Account correctly declares all four capture widths (`workspace-states.mjs:676`); the stale desktop-only row in older `coverage.md` was not used as inventory authority. No harness change was made to expand the check runner.

## Screenshot observations and installed-form gap

`screenshot-review.md` records the 13 actual PNGs inspected, their native dimensions, visible content and limitations. Account renders its fields/preferences, the template picker is open and loaded, and the representative 1024px screens show no evident toolbar/header clipping. No defensible **new product regression** is established by this representative review; that is not comprehensive visual acceptance or a 9.5 score. A developer badge overlays part of the last visible mobile details row and is noted as an observation, not an attributed product regression.

The existing catalogue opens the seeded editor, its preview menu, version list (`workspace-states.mjs:618`) and a bulk-publish confirmation that explicitly is **never confirmed** (`workspace-states.mjs:1016`). It does **not** execute published page -> newer draft/changed slug -> successor publication. Therefore the separate published-link journey has **no installed-form proof** from this run and is **not supported by the current catalogue**. No extra publication, slug edit, document mutation or unit-double substitute was introduced.

## Handoff and claim limits

Root must reconcile the out-of-manifest drift before a new capture/check qualification can continue. Any later check invocation must run its mandatory fixture preflight and keep new evidence distinct from these blocked results; the eight width gaps and separate installed-form journey require an explicit supported approach, not a hidden harness edit.

Exit zero, fixture shape checks and PNG presence do not establish visual 9.5, provider success, real auth/tenant integration, public delivery, deployment readiness or WCAG conformance. Automated axe output, had it existed here, would still not establish WCAG conformance. This report preserves the completed capture and exact unfinished work rather than assigning a final score.
