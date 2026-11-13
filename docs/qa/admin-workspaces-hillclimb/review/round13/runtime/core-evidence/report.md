# Round 13 core runtime evidence — stopped, incomplete

## Outcome

**This is a partial evidence handoff, not a passing core-area run. No visual score is assigned.**

The CRM capture reached its caller's 20-minute process limit. The post-batch frozen-source gate then failed because `tests/unit/scripts/dashboard-http-fixture.test.ts` appeared outside the frozen manifest. Further captures, recovery, and all checks were stopped. No alternate server, changed fixture setup, or source version was substituted.

There are **18 log-complete CRM states, 37 viewport screenshot pairs, and 49 PNG files** (37 viewport PNGs plus 12 declared full-page PNGs). One log-complete state did not reach its requested setup: `crm-gift-row-menu@desktop`. There is **no saved `page-metrics.json` and no `workspace-checks.json`**. Thus automated capture metrics cover **0/152 pairs** and check results cover **0/129 pairs**. Screenshot presence and completion logs do not replace those missing measurements.

All timestamps below are UTC. The capture ran on **November 12, 2026, 00:41:50–01:01:52 Asia/Bangkok**, corresponding to November 11, 17:41:50–18:01:52 UTC.

## Scope and execution boundaries

- Workspace: `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12` only. The parent baseline was not modified.
- Candidate: `CAPTURE_BASE_URL=http://localhost:3031`. Port 3030 was not used. `runtime-context.json` retains the observed Next.js project metadata and its limited error snapshot.
- Owned output directories: `docs/qa/admin-workspaces-hillclimb/candidate-13-core/` and this `core-evidence/` directory. Product, test, fixture, and committed harness files were not edited by this agent.
- No Git mutation, new worktree, sub-agent, turbo, hosted/provider operation, environment/secret change, or Next/Postgres lifecycle action was performed. The timeout terminated only the child capture process tree owned by the evidence caller.
- The existing candidate used the explicit admin E2E surface with placeholder Supabase configuration, no privileged key, and the root-owned scratch CMS with schema push disabled. Browser API fixtures do not establish real authentication, tenancy, provider delivery, or financial integration.
- The committed `capture-workspaces.mjs` and `check-workspaces.mjs` remain unchanged. `run-core.mjs` is an evidence-only bounded caller; `partial-audit.mjs` only analyzes retained artifacts offline.

## Commands and exits

Commands used the workspace above as their working directory. Exact child arguments, environment override, start/end times, timeout flag, and exit code are in `batches.json`.

```powershell
node docs/qa/admin-workspaces-hillclimb/freeze-checkpoint.mjs --verify round13
node docs/qa/admin-workspaces-hillclimb/review/round13/runtime/core-evidence/run-core.mjs preflight
node docs/qa/admin-workspaces-hillclimb/review/round13/runtime/core-evidence/run-core.mjs run
```

The sole executed capture batch was equivalent to:

```powershell
$env:CAPTURE_BASE_URL = 'http://localhost:3031'
node docs/qa/admin-workspaces-hillclimb/capture-workspaces.mjs docs/qa/admin-workspaces-hillclimb/candidate-13-core crm
```

The evidence caller enforced a 20-minute limit on that child. It was intended to capture `crm, contributions, shell, people, support, tools` sequentially, then check those same areas sequentially. It never advanced beyond the first capture batch. **`check-workspaces.mjs` was not executed.**

| Operation                                 | Exit / result                                                                                        | Retained evidence                                                                                                |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Initial frozen checkpoint                 | 0; 1,032 entries; no mismatches or extras                                                            | `source-pre.json`, `source-after-preflight.json`, `source-before-capture-crm.json`                               |
| Mandatory candidate fixture preflight     | 0; candidate type proof and all 1,645 contract checks passed                                         | `preflight.stdout.log`, `preflight.stderr.log`, `preflight.exit.txt`, `fixture-proof-preflight.json`             |
| CRM capture child                         | 1; `timedOut: true`; 20m 2.286s elapsed including termination                                        | `capture-crm.stdout.log`, `capture-crm.stderr.log`, `batches.json`                                               |
| Overall sequential caller                 | 1; post-batch freeze gate failed; no next batch                                                      | `run.stdout.log`, `run.stderr.log`, `run.exit.txt`, `stopped.json`                                               |
| Offline artifact audits                   | 1 because the final read-only freeze gate still failed; artifact indexing completed                  | `audit.*`, `final-audit.*`, `coverage-and-findings.json`, `artifact-index.json`                                  |
| Offline partial-state reconciliation      | 0; not a runtime, accessibility, or product test                                                     | `partial-audit.stdout.log`, `partial-audit.stderr.log`, `partial-audit.exit.txt`, `partial-state-inventory.json` |
| Final offline artifact/report consistency | 0; inventory counts, PNG bytes/dimensions/hashes, proof hashes, and recorded source aggregates match | `final-validation.stdout.log`, `final-validation.stderr.log`, `final-validation.exit.txt`                        |

The offline audit commands were `node .../run-core.mjs audit` and `node .../partial-audit.mjs`; `node --check .../partial-audit.mjs` also passed. They did not reopen pages or retry capture/check batches. No successful batch was repeated.

## Exact expected inventory and retained coverage

`expected-inventory.json` was derived from **`createStates(preparedBundle.captureMeta) + createModuleStates()`** using the mandatory prepared bundle, filtered to the six assigned core areas. It contains every state, route, declared width, full-page flag, capture pair, check pair, and PNG filename. Checker viewports were read from the current committed checker, not inferred from merged row counts.

Capture dimensions are desktop **1440×1000**, intermediate **1024×900**, small-tablet **640×900**, and mobile **390×844**, DPR 1. The declared total is **84 states / 152 capture pairs / 223 PNGs**. The unchanged checker only declares desktop and mobile and intersects these with each state's widths: **129 check pairs**, not 152 all-width checks.

| Area          | Log-complete states / expected | Fresh-log pairs / expected | Viewport PNG pairs / expected | Saved capture metrics / expected | Saved check pairs / expected |
| ------------- | -----------------------------: | -------------------------: | ----------------------------: | -------------------------------: | ---------------------------: |
| crm           |                        18 / 20 |                    37 / 41 |                       37 / 41 |                           0 / 41 |                       0 / 35 |
| contributions |                         0 / 13 |                     0 / 24 |                        0 / 24 |                           0 / 24 |                       0 / 21 |
| shell         |                         0 / 13 |                     0 / 19 |                        0 / 19 |                           0 / 19 |                       0 / 17 |
| people        |                         0 / 21 |                     0 / 34 |                        0 / 34 |                           0 / 34 |                       0 / 30 |
| support       |                         0 / 10 |                     0 / 16 |                        0 / 16 |                           0 / 16 |                       0 / 14 |
| tools         |                          0 / 7 |                     0 / 18 |                        0 / 18 |                           0 / 18 |                       0 / 12 |
| **Total**     |                    **18 / 84** |               **37 / 152** |                  **37 / 152** |                      **0 / 152** |                  **0 / 129** |

The fresh capture log emits one completion line only after that state's declared viewport loop finishes (`capture-workspaces.mjs:244`, `capture-workspaces.mjs:285`). Each such line was expanded using the exact state catalogue and independently matched to saved viewport PNG filenames. This yields **37 unique log pairs and 37 unique viewport PNG pairs**, with no duplicates, extras, log-only pairs, or PNG-only pairs. All **49 existing PNGs** match their declared pixel dimensions; hashes, byte sizes, width, and height are retained in `artifact-index.json`. **174 expected PNG files and 115 expected capture pairs have no screenshot.**

No metrics file was synthesized from screenshots. The capture runner saves its merged metrics after the area loop and browser teardown (`capture-workspaces.mjs:291`); forced termination prevented that write. Consequently **all 152 expected metric pairs remain missing**, including the 37 pairs that have PNGs. Both fresh check logs and saved check JSON have **0/129 pairs**. The zero `captureProblems`, `checkProblems`, and `incompletePairs` in `coverage-and-findings.json` mean absent measurement inputs, **not clean results**.

`partial-state-inventory.json` enumerates all 84 states and every expected pair individually, including fresh-log, viewport-PNG, full-page-PNG, saved-metrics, and check-result availability. It is the precise remaining-work ledger, not just a row count.

### Log-complete CRM states

| State                    | Captured widths                                |
| ------------------------ | ---------------------------------------------- |
| `crm-records`            | desktop, intermediate, small-tablet, mobile    |
| `crm-kanban`             | desktop, mobile                                |
| `crm-drawer`             | desktop, mobile                                |
| `crm-drawer-properties`  | desktop                                        |
| `crm-notes`              | desktop, intermediate, small-tablet, mobile    |
| `crm-relationships`      | desktop, intermediate, small-tablet, mobile    |
| `crm-empty`              | desktop, mobile                                |
| `crm-error`              | desktop, mobile                                |
| `crm-notes-empty`        | desktop, mobile                                |
| `crm-row-menu`           | desktop                                        |
| `crm-view-options`       | desktop                                        |
| `crm-search`             | desktop, mobile                                |
| `crm-drawer-gifts`       | desktop, mobile                                |
| `crm-gift-views-menu`    | desktop                                        |
| `crm-note-detail`        | desktop, mobile                                |
| `crm-relationships-more` | desktop, mobile                                |
| `crm-gift-row-menu`      | desktop; setup trigger missing, captured as-is |
| `crm-resend-receipt`     | desktop, mobile                                |

No completion line or PNG exists for `crm-relationship-detail` or `crm-note-long`, each of which requires desktop and mobile. The former is next in catalogue order after the last completed state; its completion is not established. No state in the other five areas was run.

### Exact states without completed capture evidence

- **CRM (2):** `crm-relationship-detail`, `crm-note-long`.
- **Contributions (13):** `contributions`, `contribution-sheet`, `contribution-refund`, `contribution-correction`, `contributions-empty`, `contributions-error`, `contributions-row-menu`, `contributions-selection`, `contributions-send-receipts`, `contributions-cards`, `contributions-filter`, `contribution-fund-correction`, `contribution-send-receipt`.
- **Shell (13):** `home`, `home-search`, `home-profile-menu`, `home-mobile-nav`, `admin`, `admin-teams`, `admin-team-manage`, `admin-team-create`, `admin-eve`, `email-delivery`, `about`, `sign`, `no-access`.
- **People (21):** `care`, `care-directory`, `care-profile`, `care-profile-thread`, `care-profile-plan`, `care-settings`, `mobilize`, `mobilize-candidate`, `mobilize-add`, `locations`, `locations-list`, `locations-add`, `events`, `events-venues`, `events-speakers`, `events-attendees`, `feed`, `org-updates`, `tasks`, `tasks-drawer`, `tasks-new`.
- **Support (10):** `support-inbox`, `support-table`, `support-conversation`, `support-reports`, `support-reports-agents`, `support-settings-inbox`, `support-settings-sla`, `support-settings-labels`, `support-settings-automations`, `support-settings-notifications`.
- **Tools (7):** `reports`, `automations`, `automations-failing`, `workflows`, `email-studio`, `pdf-studio`, `pdf-export-menu`.

All four declared widths for **Reports, Email Studio, and PDF Studio**, including intermediate and small-tablet, are expected and **not captured**. No old narrower catalogue or Studio collector output was substituted. **All 84 states' applicable check pairs remain unrun.**

## Individual failures and unknowns

### 1. Execution limit — CRM capture incomplete

The caller's own 20-minute hard limit (`run-core.mjs:88`) terminated the CRM child at `2026-11-11T18:01:52.468Z`. `batches.json` records `timedOut: true`, exit 1, and the retained fixture proof. This is an incomplete evidence execution, not proof that the Next server or Postgres crashed or became unavailable. No server/database restart or recovery was attempted.

### 2. Frozen-source provenance failure — stop boundary

The initial verification and pre-capture verification had no mismatches/extras. After the interrupted batch, the verifier still found **zero mismatches among the 1,032 manifest-listed entries**, but found the extra file `tests/unit/scripts/dashboard-http-fixture.test.ts`. It failed exit 1. The source inventory increased from **4,117 to 4,118 paths**. This agent did not create or modify that file, and did not delete, revert, or otherwise disturb it.

The extra file was subsequently edited again while offline auditing proceeded. `source-drift.json` distinguishes the immediate post-batch delta from the final recorded snapshot. No manifest-listed file changed in those snapshots, but the full source gate is invalidated by the extra path regardless of its effect on the running app. The retained PNGs therefore cannot certify an uninterrupted, completely frozen full-source run. No recapture/check was performed after drift was observed.

### 3. Missing setup trigger — `crm-gift-row-menu@desktop`

`capture-crm.stderr.log:1` records:

```text
setup missing: getByRole('button', { name: /^More gift actions$/ })
```

The catalogue uses that exact matcher at `docs/qa/admin-workspaces-hillclimb/workspace-states.mjs:931`. Product source at `apps/admin/app/(app)/crm/gift-inline-action-controls.tsx:193` instead uses `More actions for ${giftLabel}` when a gift label is available, with `More gift actions` only as its fallback. The saved `crm-gift-row-menu--desktop.png` was inspected individually: it shows the CRM record sheet and ellipsis controls, **not an open gift-action menu**. This is a selector/setup coverage failure, not evidence that the product has no working menu. No selector, fixture, setup, or source was changed to force this state green.

No other setup/readiness warning or unexpected-route-error line was emitted in the retained capture stderr. The area-end aggregated setup summary was not reached because the runner was terminated.

### 4. Axe, keyboard, focus, overflow, and route headings — unknown

- **Axe violations:** none were measured; all 129 expected check pairs are unrun. There are no per-state violation IDs, severities, node counts, or targets to classify.
- **Contrast-incomplete:** unknown for every expected check pair, **not zero**. The offline summary's empty incomplete array comes from an absent check file, not a contrast pass.
- **Keyboard/focus:** row Tab reachability, ArrowDown row movement, dialog Tab escapes, Escape closure, focus restoration, and visible focus quality are untested. A screenshot focus ring does not establish these behaviors.
- **Overflow/containment:** no persisted page/dialog horizontal-overflow or dialog-containment measurements exist. Correct PNG dimensions do not establish no overflow.
- **Unexpected route headings:** no unexpected-route-error line appears in retained stderr, but per-pair heading arrays were not flushed to `page-metrics.json`; there is no structured all-state clean assertion. Intentional `crm-error` fixture coverage is not itself a route crash.
- **Offline image spot checks:** `crm-records--small-tablet.png` shows the populated 640px card layout; `crm-gift-row-menu--desktop.png` shows the missing-menu setup outcome; `crm-resend-receipt--mobile.png` shows the nested receipt-confirmation dialog. These are limited retained-image observations, not interaction, submission, delivery, reflow, or conformance tests.

No receipt confirmation was submitted by this evidence task. Supplementary money interactions and Studio collection are outside this report's ownership.

## Fixture proof and immutable source hashes

Both mandatory preparation runs used candidate-owned fixture builders, passed candidate type proof and **all 1,645 checks**, and produced the same exporter-byte bundle SHA256:

`afed848ea1dc100a2818ff77f3530987d5f8784fa324bfb3d72acda7443ad48b`

| Proof artifact                   | SHA256 of saved proof file                                         | Verified at (UTC)          |
| -------------------------------- | ------------------------------------------------------------------ | -------------------------- |
| `fixture-proof-preflight.json`   | `775f85aca46e4f81f6879671f2ae44f8847f267782c37cba6be6c1b77db3780f` | `2026-11-11T17:39:14.755Z` |
| `capture-crm.fixture-proof.json` | `9e0548324cb362c8d82797e3bb87862aad481f68bbe1fc66c7e37cd08c02823d` | `2026-11-11T17:41:53.089Z` |

`verified-bundle.json` is a re-indented archival copy. The bundle SHA above refers to the fixture exporter's original JSON bytes, not that re-indented file. The candidate directory's `fixture-proof.json` is also retained.

The product/source aggregate hashes cover the sorted, deduplicated tracked and nonignored untracked paths under `apps`, `packages`, `tests`, `scripts`, and `tooling`, including absent-path markers. Manifest-current-entry hashes cover all 1,032 frozen entries. The per-path hashes and raw verifier output remain in each source snapshot.

| Snapshot / input                                                                                 | SHA256                                                             |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Frozen `round13.diff`, unchanged                                                                 | `8e4c354259160e26be0fed1a3308ae87452b5fe6c58ea1c5448c1ffcbd143547` |
| Frozen manifest file, unchanged                                                                  | `c26908234e2630b4491c5956357277e0effdf2f9c592e1259915687873756d8a` |
| Manifest current-entry aggregate, unchanged pre/post                                             | `7627607d2e9bf470d19cf4fcca6484a8622fb01655e18341bff6ba9d6516bc12` |
| Product/source pre, `source-pre.json`, `2026-11-11T17:39:12.656Z`                                | `6715c3635e8715dcf882cb75d28b6b90e21c2aeedf29a3154998616c246d2cb1` |
| Product/source immediate post-batch, `source-after-capture-crm.json`, `2026-11-11T18:01:55.479Z` | `f738734e9833b60ae798ded96aaf09f8ebc884d7b02f4fc1f1561d46d0a40922` |
| Product/source final recorded audit, `source-post.json`, `2026-11-11T18:15:36.724Z`              | `078f719d5d21be435c38e8cfefe34f1d3782059b354dc22fecbbbf3dc1913142` |
| Extra test file at first post-batch snapshot                                                     | `9a3e1a7200e54b5ed77132907608d67b14f7e503f16f471673d528266f2de7fd` |
| Same extra test file at final recorded audit                                                     | `e1384d7a8b17e41834a5bfa14fb754c092783dbeae4027b714acfdeb734fc8aa` |

These are immutable recorded observations at the stated times, not a claim that another agent cannot make subsequent changes. No other modified/deleted path appears in the recorded pre-to-post source delta. QA outputs are intentionally outside that product/source aggregate.

## Artifact map and handoff

- **Exact planned inventory:** `expected-inventory.json`.
- **Exact partial-state matrix, missing/extra/duplicate sets, proof and source outcomes:** `partial-state-inventory.json`.
- **PNG filenames, dimensions, byte sizes, SHA256:** `artifact-index.json`; originals in `../../../../candidate-13-core/` relative to this directory.
- **Fresh logs, exits, timings, and stop cause:** `capture-crm.*`, `run.*`, `batches.json`, `stopped.json`.
- **Raw coverage audit with absent-input caveat:** `coverage-and-findings.json`, `audit.*`, `final-audit.*`.
- **Fixture provenance:** `fixture-proof-preflight.json`, `capture-crm.fixture-proof.json`, `verified-bundle.json`, `preflight.*`.
- **Source provenance:** `source-pre.json`, `source-before-capture-crm.json`, `source-after-capture-crm.json`, `source-post.json`, `source-drift.json`.
- **Reproducible offline reconciliation:** `partial-audit.mjs` and its retained stdout/stderr/exit.
- **Final offline consistency validation:** `final-validation.*`; this is not a browser, accessibility, or product pass.

The root owner must reconcile the unmanifested test with the intended frozen checkpoint before authorizing additional runtime evidence. A subsequent authorized run also needs a capture bound appropriate to the observed state durations and must preserve this interrupted attempt, rather than silently treating its screenshots as a complete metrics/check run. This agent made no such source, checkpoint, fixture, harness, or server changes.

This report establishes no provider success, real auth/tenant integration, financial correctness, visual-quality threshold, zoom/reflow result, screen-reader result, real-touch result, or WCAG conformance. The requested full core capture/check inventory remains incomplete for the exact pairs recorded here.
