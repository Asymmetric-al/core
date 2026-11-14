# Corrected round 12 CRM and Contributions: council readiness

## Decision and scope

**Not ready to release to both independent seats at the last observation, 2026-11-11 15:46:24 Asia/Bangkok (UTC+7).** Capture completed; the corrected check run had logged 28 of 56 required state/viewport measurements. The comparison sheets and four reviewer briefs still precede the corrected captures. This is an evidence inventory, not a product review or score.

Only this report was written. Research used local source, JSON, log, timestamp and SHA-256 inspection. No captures, browsers, servers, localhost requests, tests, Git commands, reviewers or subagents were run. Neither the frozen tree nor the separate harness owner's files were edited.

Paths used below:

```text
F = C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d
W = C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12
Q = docs/qa/admin-workspaces-hillclimb
S = C:/Users/Conrad/AppData/Local/Temp/claude/86bea4c45b8d966c/30bf001f-1128-4804-99b3-d821abfc87f3/scratchpad
```

## 1. What completed, and exactly which checks remained

- [Recapture progress:1](C:/Users/Conrad/AppData/Local/Temp/claude/86bea4c45b8d966c/30bf001f-1128-4804-99b3-d821abfc87f3/scratchpad/recapture12-crm-progress.log:1) reads `start 14:43` and `capture exit 0 15:17`; it did not yet contain `check exit` or `compose done`. Neither `S/recapture12-compose.log` nor `S/recapture12-crm.done` existed at the last observation.
- [Capture log:1](C:/Users/Conrad/AppData/Local/Temp/claude/86bea4c45b8d966c/30bf001f-1128-4804-99b3-d821abfc87f3/scratchpad/recapture12-capture.log:1) records all 33 CRM/Contributions states and the final metrics write. Its only setup warning is the fund-correction trigger, discussed below. The 83 target PNG files have modification times between 14:44:44 and 15:17:58; [page metrics:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/candidate-12/page-metrics.json:1) was written at 15:17:59.
- The current [state catalogue:100](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/workspace-states.mjs:100), evaluated with the saved capture anchors, gives this inventory. All expected viewport PNGs and metric entries exist.

| Area          | States | Viewport PNGs / metric entries | Additional full-page PNGs expected | Desktop/mobile checks required | Fresh check lines logged at 15:46:24 |
| ------------- | -----: | -----------------------------: | ---------------------------------: | -----------------------------: | -----------------------------------: |
| CRM           |     20 |                             41 |                                 12 |                             35 |                                   17 |
| Contributions |     13 |                             24 |                                  6 |                             21 |                                   11 |
| Total         |     33 |                             65 |                                 18 |                             56 |                                   28 |

The following 28 measurements had **not yet appeared in this corrected run's log**. They are not necessarily absent from the merged JSON:

| Area          | Pending state                                                                                                                                   | Viewport(s)        |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| CRM           | `crm-row-menu`, `crm-view-options`, `crm-gift-views-menu`, `crm-gift-row-menu`                                                                  | desktop            |
| CRM           | `crm-search`, `crm-drawer-gifts`, `crm-note-detail`, `crm-relationships-more`, `crm-resend-receipt`, `crm-relationship-detail`, `crm-note-long` | desktop and mobile |
| Contributions | `contributions-error`                                                                                                                           | mobile             |
| Contributions | `contributions-row-menu`, `contributions-send-receipts`, `contributions-cards`, `contributions-filter`, `contribution-send-receipt`             | desktop            |
| Contributions | `contributions-selection`, `contribution-fund-correction`                                                                                       | desktop and mobile |

[Current check log:1](C:/Users/Conrad/AppData/Local/Temp/claude/86bea4c45b8d966c/30bf001f-1128-4804-99b3-d821abfc87f3/scratchpad/recapture12-check.log:1) ended at `contributions-error @desktop` at that observation. The existing driver already proceeds from capture to checks and then both sheet orders: [driver:13](C:/Users/Conrad/AppData/Local/Temp/claude/86bea4c45b8d966c/30bf001f-1128-4804-99b3-d821abfc87f3/scratchpad/recapture12-crm.sh:13). **Do not start a duplicate run.** Later progress is unknown to this time-bounded report.

Important freshness trap: [workspace-checks:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/candidate-12/workspace-checks.json:1) already contains 194 rows, including all 56 target pairs. [The check writer:283](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/check-workspaces.mjs:283) merges each measured pair over earlier results without recording a generation or timestamp on each row. File existence, 194 rows, or even all 56 pair keys therefore cannot prove the corrected check run finished. Require the current log's complete 56-pair coverage plus its termination result. The frozen script warns about missing setups rather than failing them, and does not fail its process for axe findings; inspect results, not only exit status. Its unbounded browser shutdown is also recorded as an earlier limitation in [verification:176](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/round12-verification.md:176).

## 2. Corrected fixtures: verified content versus unverified execution

The saved pre-correction bundle is [fixtures-r11-contract.json:1](C:/Users/Conrad/AppData/Local/Temp/claude/86bea4c45b8d966c/30bf001f-1128-4804-99b3-d821abfc87f3/scratchpad/fixtures-r11-contract.json:1). Compared directly with [the current frozen-tree bundle:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/fixtures/fixtures.json:1):

| Fact                                             | Saved pre-correction bundle                                                        | Current bundle                                                     |
| ------------------------------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| SHA-256                                          | `0e5937562a2bd71b70f225baa9d512fbf0ea7742c8d91eec179e497c5a325742`                 | `afed848ea1dc100a2818ff77f3530987d5f8784fa324bfb3d72acda7443ad48b` |
| Relationship report                              | Old `pledgeCommitmentCount` / `pledgeCommitmentTotalCents`; no `activeCommitments` | `activeCommitments` present                                        |
| Relationship rows missing the `donorId` property | 90                                                                                 | 0                                                                  |
| Detail timeline entries missing `paymentStatus`  | 351                                                                                | 0                                                                  |
| Capture anchors                                  | Same `captureMeta` as current                                                      | Same `captureMeta` as saved bundle                                 |

Current pending-gift timeline entries use `Gift pending`; the hand-mirrored timeline includes the status field and status-aware title at [fixture source:1455](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/fixtures/crm-contrib-fixtures.ts:1455). The frozen capture script reads the saved bundle at startup: [capture:36](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/capture-workspaces.mjs:36). The current bundle's 14:43:22 modification time precedes this run's PNGs.

**Recorded, not independently rerun:** [run record:1861](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/run.md:1861) says fixture regeneration, 1,645 checks and typed proof passed. No dedicated corrected-run proof output was found among the scratchpad fixture/typecheck files inspected. This research did not execute that proof or prove every runtime import resolved into F. Preserve/attach the owner's proof if available; do not describe this inventory as a new typecheck or contract-test pass.

The existing documented proof commands are [fixture README:24](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/fixtures/README.md:24):

```powershell
bun docs/qa/admin-workspaces-hillclimb/fixtures/export-fixtures.ts
bun docs/qa/admin-workspaces-hillclimb/fixtures/verify-fixtures.ts
bunx tsc --noEmit -p docs/qa/admin-workspaces-hillclimb/fixtures/tsconfig.json
```

These are reference commands for the owner, **not work performed here or an instruction to overwrite the just-captured bundle**. Changing fixture bytes after capture would require reconciling the evidence again. The verification note says A's saved captures retain their matching A-contract fixtures: [verification:79](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/round12-verification.md:79).

## 3. Sheets and all four briefs still need publication

Both CRM briefs were written at 14:39:31. Each still has **12 B-image SHA prefixes that differ from the current PNGs**, covering these 12 unique images:

```text
crm-drawer-gifts--desktop.png       crm-drawer-gifts--mobile.png
crm-gift-row-menu--desktop.png     crm-resend-receipt--desktop.png
crm-relationships--desktop.png     crm-relationships--intermediate.png
crm-relationships--small-tablet.png crm-relationships--mobile.png
crm-relationships-more--desktop.png crm-relationships-more--mobile.png
crm-relationship-detail--desktop.png crm-relationship-detail--mobile.png
```

For example, both briefs give `1974fbca1e6c423a` for B's [gift-history desktop image](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/candidate-12/crm-drawer-gifts--desktop.png); its current SHA prefix is `60e235806faead44`. Four CRM measured lines also differ on height/row-count/heading fields checked; relationship intermediate height is now 1182 rather than 1178, and mobile is 6823 rather than 6819.

Both Contributions briefs were written at 14:39:30. Their 24 B viewport-image SHA prefixes still match, and the height/row-count/heading fields checked match. **Do not call those image hashes stale.** Their briefs nevertheless predate the corrected run's checks, and their sheets predate recapture; regenerate both seats together after checks and the correction note are final.

All 43 CRM sheet references in each seat's brief and all 24 Contributions sheet references point to sheets older than their B PNGs. CRM repeats `crm-notes-empty` in two parts; that explains 43 references versus 41 distinct viewport images. Example [AB gift-history sheet](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/comparisons/round12-ab/crm-drawer-gifts--desktop.png) is from 10:26:38; [BA sheet](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/comparisons/round12-ba/crm-drawer-gifts--desktop.png) is from 10:34:22; the corrected B image is from 14:59:12. Timestamp comparisons establish pre-recapture generation; no claim is made that every Contributions sheet's pixels necessarily differ.

Required four outputs, using the same final evidence and opposite presentation orders:

- [CRM / Claude:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/snapshots/round12-crm-claude-brief.md:1)
- [CRM / GPT:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/snapshots/round12-crm-gpt-brief.md:1)
- [Contributions / Claude:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/snapshots/round12-contributions-claude-brief.md:1)
- [Contributions / GPT:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/snapshots/round12-contributions-gpt-brief.md:1)

The current order is Claude A-first, GPT B-first. Do not pass `swap`. [Brief generation:268](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/write-briefs.mjs:268) reads both metric/check JSONs and embeds the verification note; [generation filters:447](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/write-briefs.mjs:447) can limit writes to these four briefs. The driver does **not** regenerate briefs.

## 4. Manifest: preserve the code checkpoint; record evidence provenance separately

Direct offline SHA-256 inspection of [round12-manifest:1](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/snapshots/round12-manifest.json:1) found:

- 1,009 entries; every corresponding checkpoint copy/deletion matches the manifest.
- [round12.diff](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/snapshots/round12.diff) matches `590f64bcf64c53471d57b4937c4dbb5bfe374905eefeb53201e5f3013ddda4d9`.
- Only three listed current-F paths differ: `Q/round12-verification.md`, `Q/run.md`, and `Q/workspace-states.mjs`. No listed product/test path differs. Unlisted additions were not audited via Git.

These exceptions are already described in [verification:15](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/round12-verification.md:15). **There is no evidence-driven need to regenerate the frozen product manifest.** Running the freezer in write mode would replace the checkpoint directory and diff, not just bless corrected screenshots: [freezer:135](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/freeze-checkpoint.mjs:135). Do not do that for this recapture.

The product manifest deliberately excludes fixtures, captured JSON/PNGs, comparisons and snapshot outputs: [freezer exclusions:48](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/freeze-checkpoint.mjs:48). It therefore does **not** certify corrected fixture identity, checks, sheets or brief freshness. Candidate 12 currently has only `page-metrics.json` and `workspace-checks.json` as non-PNG files; no fixture proof/evidence manifest is present there.

**Remaining provenance publication:** the owner should retain the corrected fixture SHA above, final capture/check completion logs, the three allowed manifest exceptions, and final hashes for the four briefs and referenced PNGs/JSONs in the correction record. This is a proposed auditable handoff, not a claim that an existing evidence-manifest generator or enforced gate exists. The inspected frozen scripts contain no separate corrected-evidence-manifest generation command. Do not fabricate a retroactive fixture proof from W's different candidate builders.

## 5. Remaining evidence caveats and route errors

1. **Fund-correction state did not open its intended control.** [Capture log:27](C:/Users/Conrad/AppData/Local/Temp/claude/86bea4c45b8d966c/30bf001f-1128-4804-99b3-d821abfc87f3/scratchpad/recapture12-capture.log:27) reports the missing `correct fund designation` trigger. [State:533](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/workspace-states.mjs:533) targets the normal gift detail route and tries two button-name patterns. At both desktop and mobile, the fund-correction PNG is byte-identical to the corresponding `contribution-sheet` PNG, and its metric dialog remains `Contribution details`. **Unknown:** missing B control versus selector/anchor mismatch; this inventory does not settle it. Disclose captured-as-is evidence to both seats; do not claim a fund-correction form was exercised. The existing brief policy explicitly permits missing-trigger states captured as-is: [generator:390](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/write-briefs.mjs:390). A selector fix/targeted recapture, if warranted, belongs to the owner and would reopen downstream regeneration.
2. **Single-gift receipt success is not covered by the saved fixtures.** [Verification:120](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/round12-verification.md:120) documents the `fixture missing` toast in both versions. [Route fallback:562](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/fixtures/route-fixtures.mjs:562) returns 404 with that body for unhandled admin requests. Keep that limitation; a screenshot or axe result is not proof of successful receipt delivery.
3. **No target-area route-error H1 was found in the corrected saved metrics.** Scanning all 124 candidate-12 state metric objects found one matching route-boundary H1: `studio-account@desktop`, route `/web-studio/account`, `Something went wrong`. The lead records it as a real frozen-B defect at [run record:1874](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/run.md:1874); this research did not reproduce or independently prove its cause. It is outside these two reruns and must not be silently replaced with W's fixes. H1 metadata alone does not exclude errors elsewhere on a page.
4. **Reports' stale-fixture route error is separately corrected, not a new CRM/Contributions blocker.** Current Reports metrics have H1 `Reports` at both widths, and [the fixture:680](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/fixtures/module-fixtures.mjs:680) now supplies `completeness`. The history and recapture are documented at [verification:91](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/round12-verification.md:91). Deliberate `crm-error` and `contributions-error` API scenarios are not themselves unexpected route crashes.

The verification note already says every target state was captured **and checked** again, at [verification:85](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/round12-verification.md:85); at this report's observation the fresh check log did not yet support the latter claim. Finalize that wording and check counts only after the owner's run terminates. Retain the non-modal Contributions filter exception already explained at [verification:168](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/round12-verification.md:168), rather than reclassifying its stored Tab exits as a new modal failure.

## 6. Concrete operator commands after the existing run settles

**Not executed by this researcher.** These commands write evidence and are for its authorized owner only, from F, not W. The existing driver already owns the check and composition steps; use the corresponding commands only to recover an incomplete step, not concurrently with it.

```powershell
Set-Location 'C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d'
$base = 'docs/qa/admin-workspaces-hillclimb'
$scratch = 'C:/Users/Conrad/AppData/Local/Temp/claude/86bea4c45b8d966c/30bf001f-1128-4804-99b3-d821abfc87f3/scratchpad'
Get-Content -LiteralPath "$scratch/recapture12-crm-progress.log"
Get-Content -LiteralPath "$scratch/recapture12-check.log" -Tail 12
```

If the owner confirms the existing check process ended without complete corrected results, the verified frozen-script interface is:

```powershell
$env:CAPTURE_BASE_URL = 'http://localhost:3030'
node "$base/check-workspaces.mjs" "$base/candidate-12" crm,contributions
```

That command contacts the existing server and measures the UI; it is not an offline audit and was forbidden to this research seat. A fourth argument can restrict recovery to comma-separated state names; see [check interface:19](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/check-workspaces.mjs:19). Do not recapture all states merely because regeneration of briefs is pending.

After complete checks and any justified target-state recovery, ensure both sheet orders were regenerated. The driver's four invocations are equivalent to:

```powershell
foreach ($prefix in @('crm', 'contribution')) {
    node "$base/compose-sheets.mjs" "$base/candidate-11" 'earlier checkpoint round11' "$base/candidate-12" 'later checkpoint round12' "$base/comparisons/round12-ab" $prefix
    if ($LASTEXITCODE -ne 0) { throw 'AB sheet composition failed' }
    node "$base/compose-sheets.mjs" "$base/candidate-12" 'later checkpoint round12' "$base/candidate-11" 'earlier checkpoint round11' "$base/comparisons/round12-ba" $prefix
    if ($LASTEXITCODE -ne 0) { throw 'BA sheet composition failed' }
}
```

[Composer:19](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/compose-sheets.mjs:19) includes matching non-full PNGs in both directories. `contribution` intentionally covers singular and plural state prefixes. It uses local saved images, not a live page. The shell driver's final sentinel does not verify each compose exit status, so inspect its output/errors as well as `compose done`.

After the owner finalizes the verification/correction note, regenerate exactly the four briefs, preserving the current serving override and seat order:

```powershell
$env:BRIEF_AREAS = 'crm,contributions'
$env:BRIEF_REVIEWERS = 'claude,gpt'
$env:BRIEF_SERVING = 'Both versions are served from the working tree on port 3030, one after the other, each from a clean build of its frozen checkpoint.'
node "$base/write-briefs.mjs" round12 "$base/candidate-11" 'earlier checkpoint round11' "$base/candidate-12" 'later checkpoint round12' "$base/round12-verification.md"
if ($LASTEXITCODE -ne 0) { throw 'Brief generation failed' }
```

Use an owner shell and restore its previous environment values afterward. Omitting `BRIEF_SERVING` would reintroduce the generator's detached-worktree default, which is not this round's recorded serving setup. Preserve the other ten briefs. Before release, hash-check every B-image reference in the four new briefs against disk and confirm zero mismatches; ensure each references the freshly composed AB/BA order and final check data. Hashes can be collected without refreezing:

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath "$base/fixtures/fixtures.json", "$base/candidate-12/page-metrics.json", "$base/candidate-12/workspace-checks.json", "$base/snapshots/round12-manifest.json", "$base/snapshots/round12.diff"
foreach ($area in @('crm', 'contributions')) {
    foreach ($seat in @('claude', 'gpt')) {
        Get-FileHash -Algorithm SHA256 -LiteralPath "$base/snapshots/round12-$area-$seat-brief.md"
    }
}
```

## 7. Separate harness work: inspected, not adopted into round 12

W currently contains the other owner's [fixture-preflight:11](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/fixture-preflight.mjs:11) and [route-errors:3](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/route-errors.mjs:3). Source inspection shows candidate-local dependency checks, typed proof, in-memory regeneration/verification, bundle SHA provenance, and route-boundary heading detection. Its [capture:37](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/capture-workspaces.mjs:37) and [check:48](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/check-workspaces.mjs:48) write `fixture-proof.json`; shutdown calls are bounded. These files were changing during research. Their completed verification, final contents and adoption status are **unknown here**. No test or helper was executed, no patch proposed, and no ownership overlap taken.

These safeguards are absent from F's just-completed capture interface. They must not be treated as retroactive proof for candidate 12, nor used to rebuild frozen evidence from W's round-13 product code.

## Release checklist for both seats

- Finish/reconcile the existing 56-pair corrected check run and publish its actual completion result, not the merged JSON's old row count.
- Preserve the fund-correction captured-as-is and receipt-success limitations, or let the owner resolve evidence targeting and regenerate affected downstream artifacts.
- Finish and verify the four sheet compositions; finalize the correction/verification record with actual current-run facts.
- Preserve the frozen code manifest/diff; record corrected evidence provenance separately rather than refreezing product code.
- Regenerate all four targeted briefs together and verify image SHA prefixes, fresh checks, serving description and opposite seat order. Only then hand those briefs to both independent seats. Reviewer launch remains outside this research assignment.
