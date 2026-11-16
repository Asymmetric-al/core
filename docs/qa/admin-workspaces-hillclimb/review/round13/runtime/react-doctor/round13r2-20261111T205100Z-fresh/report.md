# Round13r2 fresh React Doctor audit

**Strict FAIL. Raw inventory completed. No candidate acceptance, ledger repair, new waiver approval, or product fixes.**

Date: November 12, 2026, Asia/Bangkok; receipts use November 11, 2026 UTC. Checkout: `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12` ONLY. This is fresh execution against frozen **round13r2**, not reuse of prior Round 13 scans. All authored files are inside this newly created evidence folder.

## 1. Live frozen binding

The inspected existing [binding helper][helper] was executed live before/after both commands, around independent validation, and again for final handback. The parent's saved proof was not substituted for hashing. [Scope declaration][scope] and [run receipt][receipt] retain roots, base, exact argv, controls, timestamps, outputs and exits.

| Input                                    | Observed SHA-256                                                   |
| ---------------------------------------- | ------------------------------------------------------------------ |
| round13r2 manifest, 1,038 unique entries | `27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0` |
| Frozen diff                              | `8061b8fde771136891d4baf152062c613d1c7a7352040d4b66f14feea5239b6b` |
| Full audit-source inventory, 2,379 files | `a4b92ea2ba382845a752f0b64094632b40c6f8a4f35c370dabd7a8bb522e6cc3` |
| Unchanged canonical exception ledger     | `16a0c7614cfc967c2c1a30a2133bfd17fc7b1dfe5588853136dd4d66a1914f62` |
| Unchanged doctor.config.json             | `9593037aa41b52d104aeea055158d7046dc23cfe6b202ce74fa22e0423b54f98` |

Base `8368004b339384eb98129a086ca71b7db88534ed`; Node `v24.22.1`, Bun `1.4.3`, scanner `0.9.18`. [Versions][versions] and each target's protocol confirm the scanner version. All 158 control/evidence files and separately captured operator instruction/skill/guide/plan/helper hashes match. The helper verifies every frozen entry, including deletions; independent verification checks complete inventory additions/deletions too.

No product/test/ledger/config/manifest/Git edits, servers, persistent environment changes, provider/browser operations, or children were performed. The exact authorized audit runner created its normal disposable physical snapshots outside the checkout. Its documented subprocess-only scanner settings were not manual environment/provider reconfiguration. No prior evidence was overwritten.

## 2. Exact commands, timing and failure

Executed from the r12 checkout, with distinct fresh outputs:

```text
bun run react-doctor:check -- --output=C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/strict
bun run react-doctor:raw -- --output=C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/raw
```

Native Windows argv is preserved verbatim in [strict command][strict-command] and [raw command][raw-command].

| Mode   | UTC start                | UTC finish               | Elapsed    | Exit  | Watchdog      |
| ------ | ------------------------ | ------------------------ | ---------- | ----- | ------------- |
| Strict | 2026-11-11T20:57:36.579Z | 2026-11-11T20:59:38.932Z | 122,352 ms | **1** | Not triggered |
| Raw    | 2026-11-11T20:59:45.697Z | 2026-11-11T21:01:49.692Z | 123,995 ms | **0** | Not triggered |

Each command had a 900-second process-tree-aware watchdog, scoped to its owned Bun PID and descendants with `taskkill.exe /PID <owned-pid> /T /F` only on timeout. Neither timed out, signaled, failed to spawn, or needed termination. No machine-wide process kill was used. stdout/stderr, exits, timing, watchdog receipts and all available outputs are retained.

Strict completes all eight inventories, then the [canonical validator][ledger-validator] throws:

```text
Exception evidence changed: tests/unit/apps/admin/app/eve-operations-workspace.test.tsx
```

[Strict stderr][strict-stderr] retains the stack. **Official strict `actionable.json` is absent: this is failure, not zero diagnostics.** Raw intentionally has no official actionable output; its exit 0 is inventory completion, not strict acceptance. Raw top-level stderr contains only Bun's echoed command; all **16 target stderr files are empty**. The raw success does not erase strict failure.

## 3. Independent integrity and coverage

[V2 validation][validation] reports `artifactsValid: true`, zero artifact-validation failures, strict failed and whole ledger invalid. All eight strict and eight raw reports were independently parsed using the canonical protocol parser, checking schema 3, version 0.9.18, full mode, `ok: true`, no error, exact project/root/package-root, complete scans, no skipped applicable projects/checks and null scores. Diagnostic arrays, warning/error/total counts, unique identities, analyzed files and `scans.json` agree.

Both stored `integrity.originalHashes` digests equal the declared source inventory. Rehashing the full live original and both full physical snapshots finds no missing, added or changed inventory entry. The only snapshot/original difference is the runner's exact reconstructed `doctor.config.json` normalization. No undeclared source rewrite or config/exclusion change is accepted.

| Retained physical snapshot                                                          | Rehashed digest, 2,379 files                                       |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Strict: `C:/Users/Conrad/AppData/Local/Temp/core-react-doctor-source-hmztSP/source` | `51d863be4fb4519cd6b366d177d03bcc6d2a33393d1b54c3fed5e687645555a6` |
| Raw: `C:/Users/Conrad/AppData/Local/Temp/core-react-doctor-source-bawQWX/source`    | `bff9542fd28afb953bb21126b71e68992b60d747b0fea89b3759bfcdb3b83780` |

Raw/strict applicable **full-identity parity** is exact after removing only `react-in-jsx-scope`; analyzed lists and source-filter hashes also match. Each of 283 ledger records was independently checked for exact identity, duplicates, current source/context/evidence hashes and canonical single-record validity; whole-ledger validation was separately attempted and rejected.

[Final handback verifier][handback-script] repeats the full artifact/source/snapshot/ledger review, fresh binding brackets, original scan-evidence preservation and proposed-record/source checks after this report is written; its status is in [handback validation][handback-validation]. [Final hash index][final-index] is generated only after reports/log streams close, excludes itself, and inventories every other evidence file by path, size and SHA-256. The seal re-verifies all entries and report references. Earlier initial indexes are intermediate captures, not final immutable indexes; their verifier stdout files were still open.

### Configured coverage omissions, not scanner certification

Reports discover **1,510** JS/TS candidates and analyze **1,501** after the existing unchanged filters. Nine exact omissions are reconciled:

- `apps/donor/scripts/openpolicy.ts` and `packages/database/scripts/seed-demo-users.ts`: existing `scripts/**` exclusion.
- `packages/database/supabase/{admin,client,config,index,post-interactions,proxy,server}.ts`: existing `supabase/**` exclusion also omits seven package-local **runtime adapters**. These files are bound by the source inventory, but are **not scanner-certified**. Complete target protocol is not complete runtime-code coverage; any configuration/scope change belongs to a separately authorized owner.

The retained first verifier exited 2 because it incorrectly equated pre-filter `project.sourceFileCount` and post-filter analyzed count for donor/database. This was a verifier assumption, not missing target output. V2 reconciles each omitted path, current unchanged filters and analyzed lists without weakening the report protocol. First-attempt script, logs and failures remain preserved.

## 4. Fresh census, not historical 178/635

| Target                | Discovered JS/TS | Analyzed  | Applicable findings | Errors | Raw findings | Unresolved after prior exact subset |
| --------------------- | ---------------- | --------- | ------------------- | ------ | ------------ | ----------------------------------- |
| `apps/admin`          | 758              | 758       | 411                 | 0      | 7404         | 401                                 |
| `apps/donor`          | 141              | 140       | 34                  | 0      | 917          | 25                                  |
| `apps/missionary`     | 123              | 123       | 11                  | 0      | 672          | 7                                   |
| `packages/auth`       | 27               | 27        | 0                   | 0      | 0            | 0                                   |
| `packages/database`   | 70               | 62        | 1                   | 0      | 4            | 0                                   |
| `packages/lib`        | 57               | 57        | 3                   | 0      | 32           | 1                                   |
| `packages/missionary` | 37               | 37        | 9                   | 0      | 86           | 8                                   |
| `packages/ui`         | 297              | 297       | 200                 | 4      | 2337         | 187                                 |
| **Total**             | **1,510**        | **1,501** | **669**             | **4**  | **11,452**   | **629**                             |

Applicable findings: **665 warnings + 4 errors**. Raw adds **10,783** obsolete classic-JSX-import warnings; do not add unnecessary imports for automatic JSX. Of **283** prior ledger records, **40** remain mechanically exact/hash-valid and **243** are stale/unused. Independent unresolved accounting is **629 = 627 warnings + 2 errors** after those 40 only. This is not official `actionable.json`, combined-ledger validation, or new semantic approval of the 40 records. No new proposal is subtracted from the 629.

The old **635 unresolved / 178 unapproved**, 675 applicable, 11,455 raw and 10,780 classic counts describe prior planning evidence only. They are not this fresh candidate; count differences alone do not prove product fixes. Fresh ledger triage finds **41** absent lookup groups and **37** mechanically ambiguous candidate groups. This 37 is not the historical eight semantically unqualified identities.

### Remaining diagnostic groups

Scanner categories: Maintainability **431**, Accessibility **80**, Performance **61**, Bugs **57**. These are category labels, not demonstrated behavior defects. By target: admin 401, UI 187, donor 25, packages/missionary 8, apps/missionary 7, lib 1, auth 0, database 0. [Unresolved review][unresolved] contains every exact identity/location/severity; [triage][triage] groups by file, target, category and rule. All **55** unresolved rule groups are enumerated below.

| Rule (`react-doctor/` prefix)                          | Fresh unresolved |
| ------------------------------------------------------ | ---------------- |
| `jsx-props-no-spreading`                               | 121              |
| `only-export-components`                               | 105              |
| `jsx-handler-names`                                    | 62               |
| `no-ungated-tailwind-animation`                        | 62               |
| `no-high-complexity-react-function`                    | 43               |
| `js-combine-iterations`                                | 33               |
| `unused-export`                                        | 26               |
| `jsx-no-useless-fragment`                              | 19               |
| `unused-type`                                          | 11               |
| `hook-use-state`                                       | 10               |
| `no-giant-component`                                   | 10               |
| `no-prevent-default`                                   | 9                |
| `exhaustive-deps`                                      | 7                |
| `no-array-index-as-key`                                | 7                |
| `prefer-module-scope-pure-function`                    | 7                |
| `js-hoist-intl`                                        | 6                |
| `no-unescaped-entities`                                | 6                |
| `prefer-dynamic-import`                                | 6                |
| `anchor-has-content`                                   | 5                |
| `js-set-map-lookups`                                   | 5                |
| `no-locale-format-in-render`                           | 5                |
| `no-pass-data-to-parent`                               | 4                |
| `no-pass-live-state-to-parent`                         | 4                |
| `no-prop-callback-in-effect`                           | 4                |
| `prefer-tag-over-role`                                 | 4                |
| `empty-table-header`                                   | 3                |
| `prefer-module-scope-static-value`                     | 3                |
| `rerender-memo-with-default-value`                     | 3                |
| `rerender-state-only-in-handlers`                      | 3                |
| `self-closing-comp`                                    | 3                |
| `unused-dependency`                                    | 3                |
| `design-no-redundant-size-axes`                        | 2                |
| `nextjs-no-client-side-redirect`                       | 2                |
| `no-cramped-container-padding`                         | 2                |
| `no-fetch-response-used-without-status-check`          | 2                |
| `no-pointer-disabled-enabled-control`                  | 2                |
| `prefer-useReducer`                                    | 2                |
| `click-events-have-key-events`                         | 1                |
| `context-provider-value-from-unmemoized-local-literal` | 1                |
| `design-no-redundant-padding-axes`                     | 1                |
| `duplicate-jsx-subtree`                                | 1                |
| `effect-needs-cleanup`                                 | 1                |
| `js-flatmap-filter`                                    | 1                |
| `jsx-fragments`                                        | 1                |
| `nextjs-no-img-element`                                | 1                |
| `no-effect-with-fresh-deps`                            | 1                |
| `no-flush-sync`                                        | 1                |
| `no-layout-shifting-interaction-state`                 | 1                |
| `no-noninteractive-element-interactions`               | 1                |
| `no-react-children`                                    | 1                |
| `no-reset-all-state-on-prop-change`                    | 1                |
| `no-side-tab-border`                                   | 1                |
| `no-tailwind-layout-transition`                        | 1                |
| `rerender-defer-reads-hook`                            | 1                |
| `server-sequential-independent-await`                  | 1                |

These are review groups, **not blanket waiver candidates**. Reduced-motion behavior, forwarding contracts, framework/primitive ownership, real external consumers, HTTP/lifecycle behavior, keyboard/focus and money/permission invariants need individual source/contract evidence. A scanner category or `test-noise` tag never grants a waiver.

## 5. Focused source triage and safe next actions

1. **Unresolved error: derived order dependency.** [data-grid-column-header.tsx:398][column-header] depends on `columnOrder`, newly allocated at lines 84-87 from state order and definition-order completion. Source supports the memo-rerun concern, not a proven data/permission defect. A bounded future fix should stabilize the complete derived inputs while preserving added/removed/reordered/hidden/pinned/grouped-column behavior and keyboard/focus. Do not memoize one input while leaving peer state stale; add regression coverage first. No fix or suppression here.
2. **Unresolved cleanup error, not proven leak.** [data-grid-scroll-area.tsx:296][scroll-effect] is flagged for `observe`. Its [cleanup at 373][scroll-cleanup] cancels the frame, disconnects ResizeObserver/MutationObserver, removes the scroll listener and clears drag state. Retain unresolved pending complete allocation/teardown/rebinding qualification; neither call it a demonstrated leak nor grant a cleanup waiver from this partial argument.
3. **Two more errors have only mechanically matching prior records:** [use-supabase-realtime.ts:156][realtime] and [UnlayerEmailEditor.tsx:227][unlayer], both cleanup findings. They remain in the four-error full census; no new lifecycle approval/test execution is inferred.
4. **Two HTTP warnings, not the old failed-GET defect.** [native-revert-status.tsx:111][revert-fetch] still flags PATCH, but preceding GET checks `.ok` at [106][revert-check] before body read/PATCH, and success/reset checks status 200 plus `json.doc` at [118][revert-success]. Do not double-count or repeat the old failed-GET-then-PATCH claim. [legacy-rich-text-editor.tsx:64][editor-fetch] parses an error-capable body then checks `.ok` and URL type at [73][editor-check] before success. Neither warning alone establishes unchecked successful writes. Both remain unresolved pending exact response/error-path and actual-consumer qualification; no exception proposed.
5. **Mocked-consumer rationale rejected.** [loadMockAdminContributions:35][contribution-owner] is not proven live export use by [contributions-page.test.tsx:87][contribution-mock]: that test replaces the owning module and supplies its own implementation at 95. Later assignment/assertions of the replacement do not qualify the actual export. No unused-export exception is proposed.
6. Four old `data-grid.tsx` render-ref errors are absent from both fresh applicable inventories. This is an identity observation, not concurrent-render/hydration/layout certification, nor four fixes performed by this audit.

Other findings remain triaged inventory, not independently proven behavior bugs. Future owners should prioritize demonstrated lifecycle/HTTP/accessibility/data risks before cosmetic/compiler/performance work. No test success or native/browser/provider gate is inferred from reading source.

## 6. Safe individual proposals only

[Individual proposals][proposals] retain exact previous/current identities, previous-record SHA, current source/context/evidence hashes, reconsideration conditions and canonical single-record validation for **seven** `unused-export` rebindings. Each has exactly one current lookup candidate; the actual export is runtime-imported from its owning module and rendered by an external test without mocking that owner. Complete owner/test files were freshly read/parsed/hashed; **tests were not run**. These proofs concern target-local dead-code reachability only, not the component's other behavior/findings.

| Old index (navigation only) | Actual exported symbol                                                | External runtime consumer                                      |
| --------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------- |
| 0                           | `EveModelPolicyReadiness` at [model-policy-panel.tsx:134][owner-0]    | [eve-operations-workspace.test.tsx:7][test-0]; JSX 158         |
| 1                           | `EveGovernanceView` at [page-client.tsx:681][owner-1]                 | [eve-governance-page.test.tsx:30][test-1]; JSX 37              |
| 4                           | `AutomationsPageView` at [page-client.tsx:158][owner-4]               | [automations-page.test.tsx:123][test-4]; JSX 139               |
| 24                          | `ReportsPageView` at [page-client.tsx:156][owner-24]                  | [reports-page.test.tsx:172][test-24]; JSX 191                  |
| 137                         | `PostComposerActions` at [worker-feed-page-client.tsx:692][owner-137] | [worker-feed-composer-actions.test.tsx:103][test-137]; JSX 143 |
| 273                         | `CrmViewToolbar` at [page-client.tsx:499][owner-273]                  | [crm-view-toolbar.test.tsx:10][test-273]; JSX 13               |
| 274                         | `CrmRelationshipsFilters` at [page-client.tsx:268][owner-274]         | [relationship-filter-selection.test.tsx:10][test-274]; JSX 15  |

The first pass qualified five and conservatively held two CRM destructured awaited imports. Its exit 1, script and artifacts remain preserved. The versioned second pass recognizes the two direct object-binding imports, re-reads all files and validates all seven records individually, exiting 0 with no consumer-proof holds. [V2 source inspections][inspections] retain actual import bindings, exports, renders, mocks and hashes. This does not execute or certify the tests.

**41 retirement proposals** are individually enumerated in the same JSON, each with full previous identity/hash, current source hash and same-file finding count. Both the exact historical identity and its same-target/file/plugin/rule/message/severity lookup group are absent from both complete fresh inventories. Removal would grant no current waiver, fix no source and reduce no diagnostic count. A reappearing finding requires separate fresh adjudication.

**195 stale records have no new qualified proposal:** 243 minus seven rebindings minus 41 retirements. Prior 17 Payload-forwarding proposals are deliberately not inherited without freshly qualified installed framework/primitive/consumer contracts. Rehashing a record does not justify it. [Handback proposal review][proposal-review] enumerates all 195 holds with mismatch/candidate details. Their grouping is:

| Stale-record rule (`react-doctor/` prefix) | No new proposal |
| ------------------------------------------ | --------------- |
| `jsx-props-no-spreading`                   | 90              |
| `no-ungated-tailwind-animation`            | 61              |
| `no-prevent-default`                       | 6               |
| `no-array-index-as-key`                    | 6               |
| `prefer-dynamic-import`                    | 5               |
| `jsx-handler-names`                        | 4               |
| `prefer-tag-over-role`                     | 3               |
| `no-pass-live-state-to-parent`             | 3               |
| `nextjs-no-client-side-redirect`           | 2               |
| `no-pass-data-to-parent`                   | 2               |
| `unused-dependency`                        | 2               |
| `no-prop-callback-in-effect`               | 2               |
| `server-sequential-independent-await`      | 1               |
| `no-tailwind-layout-transition`            | 1               |
| `hook-use-state`                           | 1               |
| `no-reset-all-state-on-prop-change`        | 1               |
| `no-cramped-container-padding`             | 1               |
| `nextjs-no-img-element`                    | 1               |
| `jsx-no-useless-fragment`                  | 1               |
| `no-side-tab-border`                       | 1               |
| `unused-export`                            | 1               |

No proposal is applied or approved. Old indices/lines are navigation only: later application must match full previous identity **and** previous-record hash, unchanged whole-ledger SHA, fresh source/evidence binding and the individual contract. No motion, prop-spread, compiler, cleanup, package, accessibility, financial or framework blanket waiver is proposed. All 629 independent unresolved findings remain unresolved; the whole canonical ledger is still invalid. Root assigns any ledger work later. Authorized changes require a new binding, combined canonical validation and a new eight-target strict command with official `actionable.json`; hypothetical approval is not a pass.

## 7. Handback limits

Requested strict/raw executions are complete: **strict FAIL / raw inventory complete**. Product fixes **0**; new approved exceptions **0**; ledger replacements/retirements applied **0**. Artifact/binding integrity is separate from acceptance.

No tests (including cleanup/coverage), lint/typecheck/build/formatting gates, browser/keyboard/axe/zoom/responsive checks, authenticated/provider flows, tenant/permission/payment integrations or deployment were performed. No score, dependency/security certification, WCAG/visual-quality certification or product acceptance is claimed. The full source inventory is the audit runner's defined inventory, not every filesystem file or linked installed-dependency contents. No newly proposed exception relies on an unqualified UI-framework contract.

Matching checkpoints cannot detect a file edited and restored between them. Keep writers frozen and recheck all bindings before later application. Final handback rehash covers changes after the runner's own source check, not future mutations. Do not alter the stale ledger simply to make the command pass.

## Evidence references

[receipt]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/run-receipt.json:1
[scope]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/scope-and-declaration.json:1
[versions]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/versions.json:1
[strict-command]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/strict.command.json:1
[raw-command]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/raw.command.json:1
[strict-stderr]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/strict.stderr.log:1
[validation]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/v2-validation.json:1
[triage]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/v2-triage.json:1
[unresolved]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/v2-unresolved-review.json:1
[proposals]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/v2-individual-proposals.json:1
[inspections]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/v2-source-inspections.json:1
[handback-script]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/verify-handback.mjs:1
[handback-validation]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/handback-validation.json:1
[proposal-review]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/handback-proposal-review.json:1
[final-index]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/evidence-index-final.json:1
[owner-0]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/admin/eve/model-policy-panel.tsx:134
[test-0]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/eve-operations-workspace.test.tsx:7
[owner-1]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/admin/eve/page-client.tsx:681
[test-1]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/eve-governance-page.test.tsx:30
[owner-4]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/automations/page-client.tsx:158
[test-4]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/automations-page.test.tsx:123
[owner-24]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/reports/page-client.tsx:156
[test-24]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/reports-page.test.tsx:172
[owner-137]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/missionary/app/feed/worker-feed-page-client.tsx:692
[test-137]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/missionary/worker-feed-composer-actions.test.tsx:103
[owner-273]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/crm/page-client.tsx:499
[test-273]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/crm-view-toolbar.test.tsx:10
[owner-274]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/crm/relationships/page-client.tsx:268
[test-274]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/relationship-filter-selection.test.tsx:10
[helper]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/refreeze/read-binding.mjs:1
[ledger-validator]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/scripts/react-doctor-ledger.mjs:187
[column-header]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid-column-header.tsx:398
[scroll-effect]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx:296
[scroll-cleanup]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx:373
[realtime]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/data-table/hooks/use-supabase-realtime.ts:156
[unlayer]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/studio/legacy/UnlayerEmailEditor.tsx:227
[revert-fetch]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/native-revert-status.tsx:111
[revert-check]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/native-revert-status.tsx:106
[revert-success]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/native-revert-status.tsx:118
[editor-fetch]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/rich-text-editor/legacy-rich-text-editor.tsx:64
[editor-check]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/shadcn/rich-text-editor/legacy-rich-text-editor.tsx:73
[contribution-owner]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/contributions/use-admin-contributions.ts:35
[contribution-mock]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/apps/admin/app/contributions-page.test.tsx:87
