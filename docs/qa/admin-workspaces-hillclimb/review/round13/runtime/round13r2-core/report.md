# Round13r2-core fresh browser evidence

November 12, 2026, Asia/Bangkok. **Collection ended; focused acceptance is complete, but the committed catalogue matrix is not complete.** No visual score or production/accessibility verdict is assigned.

## Scope and runtime

- Checkout: `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`. All new output is under `docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-core/`; root owns cross-area aggregation.
- Only CRM and Contributions were selected. The committed `capture-workspaces.mjs` and `check-workspaces.mjs` ran in 51 invocations, with at most four named states per invocation. Twelve separately guarded focused invocations add receipt, actual eligible correction, and long-note acceptance evidence.
- Base URL: `http://localhost:3031`; repository `playwright-core`, Chrome channel, headless, Chrome `157.0.8103.50`. Declared viewports: desktop **1440x1000**, intermediate **1024x900**, small-tablet **640x900**, mobile **390x844**. Every declared CRM/Contributions state-width pair was included in an attempted invocation; missing outputs remain missing.
- Owned runner interval: **2026-11-11T20:58:57.299Z–23:29:54.839Z**, or November 12 **03:58:57.299–06:29:54.839 +07:00**. Exact invocation commands, actual child exits, start/end times, timeout flags, incremental snapshots, and merged stdout/stderr are retained per invocation.
- Root-authorized cross-collector overlap applied on the shared server. Only this lane's invocations were serialized; focused cases close their context before the next starts. No global sequential execution or performance benchmark is claimed. Other collectors' processes were not controlled.
- Later child invocations explicitly retained `PROGRAMFILES=C:/Program Files`, `PROGRAMFILES(X86)=C:/Program Files (x86)`, and normal inherited `LOCALAPPDATA` process-only. Early CRM invocations succeeded with inherited discovery settings. No Chrome-discovery failure or retry occurred in this lane.
- No source, committed harness, fixture, ledger, manifest, server lifecycle/configuration, environment-file, or provider changes were made. No Git mutation was performed; no new agent or Studio journey/reset was started. Historical money-browser evidence remains separate and is not substituted here.

## Frozen identity and per-invocation freshness

Frozen checkpoint: **round13r2, 1038 entries**.

```text
manifest SHA256 27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0
diff SHA256     8061b8fde771136891d4baf152062c613d1c7a7352040d4b66f14feea5239b6b
bundle SHA256   afed848ea1dc100a2818ff77f3530987d5f8784fa324bfb3d72acda7443ad48b
```

- **63/63 invocations have a unique archived `fixture-proof.json`**, matching its recorded SHA256 and the runner-local proof bytes. Each `verifiedAt` is within that invocation's recorded start/end, `repoRoot` is exactly r12, fixture typecheck is `passed`, and fixture-contract verification says **all 1645 checks passed**. This is the fixture preflight, not a full-application typecheck claim.
- Both committed runners call `prepareFixtureBundle()` directly on every invocation (`capture-workspaces.mjs:38`, `check-workspaces.mjs:50`); the focused runner does likewise. There was no shared-proof substitution or preflight bypass. All 63 proofs independently record the same bundle hash.
- The wrapper independently ran `freeze-checkpoint.mjs --verify round13r2` before and after **each** invocation: **126 successful enclosing freezes**. The focused runner adds **24 successful internal freezes**. Every guard preserved timing/command/exit evidence and checked the expected manifest/diff hashes. Excluded harness/fixture inputs also match `input-baseline.json` before/after and at final offline audit.
- Proof copies were made immediately at runner close, before post-run freeze work. The first 25 invocations predate the explicit `fixtureProofCopiedAt` field and saved-wrapper hash; their distinct proof files/hashes remain, and file mtimes are 1.399–4.362ms after runner end. That filesystem timing is corroboration, not the freshness basis. The within-invocation `verifiedAt`, correct root, and passed gates are the freshness evidence; later 38 invocations also record the copy timestamp explicitly.
- `provenance-audit.json` independently rechecks **320 runner artifact hashes/sizes**, native PNG dimensions, **156 incremental snapshot hashes**, all proof bytes, enclosing freeze identities/intervals, exact expected/observed/missing key partitions, bounded state counts, and sequential owned invocation intervals: **no audit failures**. Shared writers' final JSON alone was not used to establish freshness.
- Final independent verification, after browser collection: **2026-11-11T23:45:27.3154767Z–23:45:29.0858661Z**, actual exit **0**, 1038 files, no mismatches or extras, expected manifest/diff hashes. See `final-freeze-verification.json` and its stdout/stderr logs.

## Catalogue pair inventory

“Complete pair” requires a fresh, frozen, hash-verified capture with the runner's state-completion line **and** a fresh completed checker observation. A raw retained PNG does not suffice. “Intended setup” further excludes wrong-state/as-is captures.

| Area          | Declared states | Expected pairs | Raw capture artifact pairs | Completed capture pairs | Checked pairs | Complete pairs | Intended-setup-qualified pairs |
| ------------- | --------------: | -------------: | -------------------------: | ----------------------: | ------------: | -------------: | -----------------------------: |
| CRM           |              20 |             41 |                         40 |                      39 |            37 |             35 |                             34 |
| Contributions |              13 |             24 |                         24 |                      24 |            24 |             24 |                             22 |
| **Total**     |          **33** |         **65** |                     **64** |                  **63** |        **61** |         **59** |                         **56** |

**82/83 catalogue PNGs** are retained, plus **88 separately identified focused PNGs**. The all-65-key table is `pair-inventory.md`; `pair-inventory.json` adds exact expected PNG names and capture/check invocation provenance. No historical artifacts fill a gap.

Missing completed capture pairs:

- `crm-relationships-more--desktop`: PNG and metrics retained provisionally, but the state-completion log line is absent after timeout. It is **not** a completed capture-qualified pair.
- `crm-relationships-more--mobile`: no PNG/metrics retained.

Missing check pairs:

- `crm-kanban--mobile`
- `crm-drawer--desktop`
- `crm-drawer--mobile`
- `crm-drawer-properties--desktop`

Retained semantic setup failures, despite otherwise complete capture/check files:

- `crm-gift-row-menu--desktop`: old catalogue trigger `/^More gift actions$/` was not found. The actual PNG is the underlying donor drawer, not an open menu. Both runner warnings remain.
- `contribution-fund-correction--desktop` and `contribution-fund-correction--mobile`: the catalogue's Nikhil Patel/$600 split-designation detail has no `Correct fund designation` button. Actual PNGs are underlying detail views, **not correction forms**. Both runner warnings remain.
- `contribution-correction` is the catalogue's existing amount-correction approval request in a detail sheet, not a newly opened eligible fund-correction form. The separate focused real-form evidence below does **not** relabel or close the failed catalogue correction pairs.

## Timeouts and cleanup limits

| Invocation       | UTC start                | UTC end                  | Limit | Actual child exit | Wrapper result | Retained result                                                |
| ---------------- | ------------------------ | ------------------------ | ----: | ----------------: | -------------: | -------------------------------------------------------------- |
| `crm-01-check`   | 2026-11-11T21:05:51.126Z | 2026-11-11T21:10:53.605Z |  300s |                 1 |            124 | 5/9 checks; four missing keys listed above                     |
| `crm-04-capture` | 2026-11-11T21:46:41.628Z | 2026-11-11T21:51:44.001Z |  300s |                 1 |            124 | 6/7 raw artifact pairs; desktop relationships-more provisional |

Both timed-out invocations retain fresh proofs, matching before/after freezes, partial metrics, runner logs, and owned PID-tree cleanup reports with cleanup status 0. They were not retried or extended into a giant run. Subsequent invocations continued only unrun work in smaller batches. `crm-2.crm-empty-check` also records “browser close did not finish in 20s; continuing”; its actual exit was 0, but the cleanup warning is not erased. Exact timings are observations under shared runtime contention, not performance claims. The original eight-hour budget anchor was never restarted (`run-budget.json`).

## Focused acceptance: all four widths

**20/20 focused cases observed**, no missing/partial cases: delayed receipt, cached receipt, delayed actual correction, cached actual correction, and one long note at each width. Every case has recorded context closure. Initial operation geometry was measured before manual scroll or keyboard traversal; cached observations are fresh reopenings in that case's context, not old artifacts.

The actual eligible menu is “More actions for $1,000.00 gift on Oct 25, 2026 to Clean Water Initiative” → **Correct fund designation**, for fixture gift `e0a15e46-a328-4b24-a921-681c12884ef6`, Margaret Okonkwo-Hale, with `fund_correction.available=true`. Form evidence requires its heading, Destination fund combobox, and Reason field; the focused runner fails rather than calling an underlying detail view a correction. Fund catalogue lookups use intercepted fixture responses only; importing the lookup helper does not select Studio or run CMS mutations.

| Viewport  | Receipt popup size; max scroll | Correction popup size; bottom scroll | Long-note popup size; bottom scroll | Operation initial summary clearance / overlap |
| --------- | ------------------------------ | ------------------------------------ | ----------------------------------- | --------------------------------------------- |
| 1440x1000 | 512x386; 0px                   | 512x968; 111px                       | 512x968; 290px                      | 16px / 0px                                    |
| 1024x900  | 512x386; 0px                   | 512x868; 211px                       | 512x868; 390px                      | 16px / 0px                                    |
| 640x900   | 512x386; 0px                   | 512x868; 211px                       | 512x868; 390px                      | 16px / 0px                                    |
| 390x844   | 358x462; 0px                   | 358x812; 439px                       | 358x812; 924px                      | 16px / 0px                                    |

- All **16 operation initial observations** have `scrollTop=0`, focus on the popup itself, the complete current-amount/designation/receipt summary below the sticky header and above the footer, and zero summary overlap. Cached detail request counts stay **1→1** for both operation kinds at every width.
- At initial/middle/bottom positions, header inner-top gap is **0px**, the footer stays within the popup, and no page or dialog horizontal overflow exceeds the 1px measurement tolerance. Three top-edge hit-test points per scroll sample do not detect note/summary body above the header. Receipt's middle/bottom samples remain at 0 because it has no scroll range; they are not claimed as successful scrolling.
- Each focused case records **16 Tab + 5 Shift+Tab observations**: **420 recorded traversal stops**, no escaped or sticky-edge-obscured stop. All eight actual correction cases reach Reason through keyboard traversal. Escape dismisses all 20 popups; receipt/correction restores the recorded trigger in all 16 operation cases. Note popup initial focus is not claimed to be on the popup root.
- Long-note body length is **2927 characters**, created only in the intercepted fixture state. Bottom PNGs were actually inspected at all four widths: opaque pinned heading/context, no visible body bleed above the header, and visible Close. This is not inferred solely from the short catalogue note.

Correction Reason after keyboard traversal and reduced viewport height:

| Width x reduced height | Header bottom | Reason top–bottom | Footer top | Clear of sticky edges   |
| ---------------------- | ------------: | ----------------- | ---------: | ----------------------- |
| 1440x600               |         148px | 407.25–471.25px   |      506px | yes, delayed and cached |
| 1024x600               |         148px | 407.25–471.25px   |      506px | yes, delayed and cached |
| 640x460                |         148px | 267.25–331.25px   |      366px | yes, delayed and cached |
| 390x460                |         148px | 187.25–251.25px   |      310px | yes, delayed and cached |

These are browser viewport reductions, **not real mobile IME/visual-viewport or physical-device evidence**. The checks establish measured field visibility, not complete pointer hit-target/occlusion coverage. Actual 390px PNGs show the floating launcher overlapping the lower-right footer/Cancel edge; centered action text and Reason remain visible. The launcher rectangle was not separately measured, and no newly introduced regression is asserted from this incidental overlap.

Focused traffic retains **0 money writes**, **0 unmocked blocked API requests**, **0 fixture-missing routes**, and **0 page errors**. The only intentional real auth write is the harness's demo-session request; unknown page API requests are denied, note creation is intercepted, and no receipt send/refund/correction submit is performed. No provider, backend mutation, permission, tenant, or delivery correctness is established.

## Keyboard and axe limits

- Across **61 saved catalogue check pairs**, no measured page-X overflow or dialog containment/internal-X failure is recorded. All **16** grid probes reach a row and move it with ArrowDown; this is a finite probe, not a full keyboard audit.
- There are **23** generic dialog/popover focus probes: 22 record zero Tab escapes, all 23 record Escape closure. `contributions-filter--desktop` records seven escapes and `escapedTo=["none","none","none"]`. The actual PNG is a Status **Popover**, not a modal operation dialog. Source `packages/ui/components/reui/data-grid/data-grid-column-filter.tsx:49` uses `<Popover>` without a modal option; `packages/ui/components/shadcn/popover.tsx:10` forwards Base UI Root; installed `packages/ui/node_modules/@base-ui/react/popover/root/PopoverRoot.js:27` defaults `modal=false`. The checker (`check-workspaces.mjs:117`) treats any role dialog as a trap candidate and later reports “none” when Tab closes it. Raw output is retained, but it is **not a proven modal focus-trap regression**.
- Catalogue axe: **0 reported violations**, but **33/61 pairs have unresolved incomplete rules**. Counts overlap: `aria-hidden-focus` in 26 pairs/189 nodes (max 14); `color-contrast` in 30 pairs/2146 nodes (max 405); `aria-valid-attr-value` in 5 pairs/5 nodes. Incomplete is not pass.
- Focused dialog-scoped axe: **0 reported violations in 20 scans**; eight scans have one `color-contrast` incomplete node each (four notes and delayed/cached receipts at 640/390). The other focused scans have no incomplete rules. These scans use the declared WCAG 2A/AA and 2.1AA tags, not every rule or every scroll/focus state.
- No screen-reader testing, OS keyboard, browser zoom, cross-browser matrix, complete contrast sign-off, or WCAG conformance is claimed. No concrete new regression in the three requested sticky/initial-position acceptance checks was established. Missing catalogue outputs and setup failures still prevent a complete catalogue pass.

## Evidence files

- `pair-inventory.md` / `pair-inventory.json`: all 65 exact keys, expected PNGs, capture/check completion, provisional/missing states, and semantic qualification.
- `invocation-inventory.json`: all 63 commands, actual runner exits, intervals, per-invocation proof/bundle hashes, exact expected/observed/missing keys, artifact hashes, and warnings.
- `provenance-audit.json`: independently recomputed proof/freeze/artifact/incremental verification, including initial focused geometry and context closure.
- `focused-summary.json`: all 20 focused observations; each invocation's `artifacts/results.json` retains complete geometry, focus, traffic, scoped axe, and screenshot references.
- `check-summary.json` / `findings.json`: saved catalogue geometry/keyboard/axe observations, with the nonmodal-popover qualification above.
- `visual-review.md`: actual native-size PNG inspection ledger, including initial receipt/correction and long-note-bottom samples at all four widths. It is a representative sample, not a claim to inspect all 170 PNGs.
- `final-freeze-verification.json`: independently retained final command/timing/actual exit and frozen identity.
- `evidence-hashes.json`: SHA256 and size inventory for every owned file except that self-referential hash inventory itself. Root may compose aggregates without changing these lane conclusions.
