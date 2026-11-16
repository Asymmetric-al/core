# Fresh round13r2 evidence execution plan

Status: planning only, 2026-11-12 (Asia/Bangkok). No runtime evidence or readiness verdict is established by this document.

## 1. Boundary and owning evidence

The planning task owns only this new file in `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`. No servers, browsers, collectors, fixture preflights, reviewers, children, or Git mutations are authorized here. All execution commands below are deferred instructions for the root/evidence owner. Do not edit product code, harness code, the existing batch plan, frozen manifests, or existing evidence as part of executing this document without separate ownership/authorization.

Current repaired product code intentionally differs from historical `round13`. Root must finish the repairs and freeze a NEW `round13r2` before collection. Do not restore `round13`, reuse its identity, or present its historical captures as repaired-code evidence. Preserve concurrent work. A source change during collection invalidates that run's common-source claim; stop and return the decision to root rather than silently refreezing or mixing generations.

Repository-root inputs are `AGENTS.md`, `docs/ai/rules/general.md`, `docs/ai/rules/testing.md`, `openspec/project.md`, relevant platform-surface intent and the active UI-cohesion design. The following paths are relative to `docs/qa/admin-workspaces-hillclimb/`:

- `review/round13/runtime/refreeze/bounded-batch-plan.json`: unchanged state/width/batch inventory. Its embedded fixture proof is historical, not proof of the repaired source.
- `workspace-states.mjs`, `module-states.mjs`, `capture-workspaces.mjs`, `check-workspaces.mjs`, `fixture-preflight.mjs`, `harness-results.mjs`, `studio-fixtures.mjs`: actual collector behavior and provenance.
- `compose-sheets.mjs`, `write-briefs.mjs`, and historical `snapshots/round12-*-brief.md`: sheet/brief interfaces and counterbalanced review format, not a new verdict.
- `review/round13/max/corrected-council-readiness.md`: historical stale merged checks, pre-correction sheets/briefs, and missing-flyout warnings. Its observation on November 11, 2026 does not establish today's completion state.
- `round13-verification.md`, `review/round13/runtime-start.json`, `review/round13/runtime/loaded-giving-fixture/README.md`: historical operating context whose source, environment, and lifetime assumptions must be requalified.

### Fresh names and future artifacts

Use this namespace only if no other owner has already claimed or populated it. A pre-existing path is a stop/collision, not permission to clear or merge it. The planning task creates none of these execution artifacts.

```powershell
$Root = 'C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12'
$Q = "$Root/docs/qa/admin-workspaces-hillclimb"
$Refreeze = "$Q/review/round13/runtime/refreeze"
$PlanPath = "$Refreeze/bounded-batch-plan.json"
$Round = 'round13r2'
$A = 'C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d/docs/qa/admin-workspaces-hillclimb/candidate-12'
$B = "$Q/candidate-13r2"
$AB = "$Q/comparisons/round13r2-ab"
$BA = "$Q/comparisons/round13r2-ba"
$Verification = "$Refreeze/round13r2-verification.md"
$Areas = 'crm,contributions,studio,shell,people,support,tools'
$Run = "$Refreeze/round13r2-run-$([DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfffZ'))"
```

Also reserve exactly 14 NEW `snapshots/round13r2-{area}-{claude|gpt}-brief.md` files and root's NEW `snapshots/round13r2-manifest.json`, `round13r2.diff`, and `round13r2-checkpoint/`. Do not write `candidate-13`, `candidate-13-core`, round12/round13 briefs, or existing comparison directories. Record the run-directory name in the verification note and every reviewer addendum.

## 2. Complete catalogue envelope

Offline name/width inspection found the existing bounded plan matches the current pure `createStates(...)` and `createModuleStates()` catalogue: 131 states, 234 declared state/width pairs. Saved historical anchors were used only to inspect catalogue shape, not to prove current fixture eligibility or runtime behavior. Recheck the shape after root freezes; fail on drift rather than adjusting widths, batches, or expectations implicitly.

| Area          | States | Desktop | Intermediate | Small tablet | Mobile | Pairs | Extra full-page PNGs | Batches |
| ------------- | -----: | ------: | -----------: | -----------: | -----: | ----: | -------------------: | ------: |
| CRM           |     20 |      20 |            3 |            3 |     15 |    41 |                   12 |       5 |
| Contributions |     13 |      13 |            2 |            1 |      8 |    24 |                    6 |       4 |
| Web Studio    |     47 |      42 |            4 |            4 |     32 |    82 |                   14 |      12 |
| Shell         |     13 |      12 |            1 |            1 |      5 |    19 |                   11 |       4 |
| People        |     21 |      21 |            2 |            2 |      9 |    34 |                   21 |       6 |
| Support       |     10 |      10 |            1 |            1 |      4 |    16 |                   13 |       3 |
| Tools         |      7 |       7 |            3 |            3 |      5 |    18 |                    8 |       2 |
| Total         |    131 |     125 |           16 |           15 |     78 |   234 |                   85 |      36 |

The viewport contract in `workspace-states.mjs:11` is desktop 1440x1000, intermediate 1024x900, small-tablet 640x900, mobile 390x844; DPR 1, light scheme, reduced motion. Only the Next.js dev portal is hidden. A state's `widths` controls eligibility: this is NOT 131 multiplied by four. Neither collector exposes a width override.

Expected B artifacts: 234 viewport PNGs named `{state}--{viewport}.png`, 85 additional `{state}--{viewport}-full.png`, 131 keys/234 width entries in `page-metrics.json`, and 234 distinct `(state, viewport)` rows in `workspace-checks.json`. The checker now visits every declared width (`check-workspaces.mjs:304`), not just desktop/mobile. All 36 existing batches contain at most four states. Read their arrays directly; do not hand-maintain a second list.

## 3. Prerequisites and root handoff

1. Root finishes the product repairs, coordinates the concurrent owners, and establishes a quiescent candidate source identity. Only root may perform the NEW freeze with `node "$Q/freeze-checkpoint.mjs" round13r2`. This write-mode command is not an instruction to the planning task. If that name already exists, stop rather than overwrite it. Root supplies the manifest/diff hashes and actual entry count; never hardcode round13's 1,032 entries or old diff hash.
2. After root's freeze, the evidence owner runs the read-only gate `node "$Q/freeze-checkpoint.mjs" --verify round13r2`, requiring exit 0, empty `mismatches` and `extra`. Record the SHA-256 of the manifest, diff and batch plan; hash the harness/fixture inputs separately because the freezer deliberately excludes nested QA evidence and fixture trees. Repeat the gate/hash comparison before each batch, before derivatives, and at handoff. Freeze verification does not attest the running server or an already-built cache.
3. Confirm the root-owned disposable admin runtime is actually serving the new freeze, with its build/start/cache identity attested. Historical candidate port is 3031; occupied 3030 is not evidence. Root's explicit-port command, if separately authorized, is `bun --cwd apps/admin run dev:playwright --port 3031`. `bun run dev:admin` does not explicitly select that port. Do not start, stop, reconfigure, or clean an existing server from this planning task or collection loop.
4. Root's local runtime must already have `E2E_AUTH_BYPASS=true`, `ASYM_E2E_AUTH_SURFACE=admin`, and `PAYLOAD_DISABLE_SCHEMA_PUSH=1`; explicit admin surface matters on the nonstandard port. Use only the sanctioned disposable scratch Postgres (historically localhost:54322, schema `cms`) and placeholder/example Supabase configuration for the main unavailable-data run. No real privileged service key, provider sends, payment actions, schema push, seed/bootstrap, migration, or reset is authorized. Changing collector environment does not reconfigure a running Next.js process.
5. Root must authorize exclusive use of that disposable CMS during the run: `studio-fixtures.mjs:40` resets list preference and removes untitled autosaved pages between Studio states. Collection is therefore NOT read-only against that scratch CMS. Stop if the database or a browser session is shared with another owner; do not broaden cleanup.
6. Candidate-local `node_modules/@asym/api` and `@asym/database` must realpath to this checkout's packages, not the parent frozen tree. Installed Node, Bun, native TypeScript, Playwright Core, axe and Chrome `channel: chrome` must be available. Do not install, relink, or rewrite lockfiles as an evidence shortcut. Root must confirm the repaired setup targets/fixtures (especially receipt, fund correction, Account and Studio) are actually eligible before release.
7. Inventory historical A read-only and record its file hashes before/after. Decide whether its coverage gaps in section 6 are explicitly accepted as gaps or require separately authorized frozen-A supplementation. Do not recreate historical A using repaired B code, or restore A over B.

The internal mandatory preflight (`fixture-preflight.mjs:11`) runs on EVERY capture/check invocation: candidate-local realpaths; native `tsc.js --noEmit --incremental false -p <Q>/fixtures/tsconfig.json`; `bun --no-env-file <Q>/fixtures/export-fixtures.ts --stdout`; then `bun --no-env-file <Q>/fixtures/verify-fixtures.ts --stdin` receiving that generated JSON. Each child has a 120-second ceiling and a sanitized fixture environment. It generates/verifies in memory and returns `repoRoot`, `verifiedAt`, `bundleSha256`, `typecheck`, and verification text. Do not export without `--stdout`, reuse a saved `fixtures.json`, skip type proof, or treat the plan's old proof/hash/check count as fresh. A failure is a stop, not permission to patch the harness.

## 4. Exact collector commands and bounded scheduling

The interfaces at `capture-workspaces.mjs:33` and `check-workspaces.mjs:45` are positional: output directory, comma-separated area(s), optional comma-separated state names. Their default area list is only `crm,contributions,studio`; always pass the area. There is no `--round`, run-id, fixture-file, width, or `--skip-preflight` switch. Unknown state/area filters can silently select nothing, so validate the batch union first.

Set only the actual runtime URL override in the dedicated evidence-owner shell, after root attests the server. Save and restore that shell's previous `CAPTURE_BASE_URL` and `BRIEF_*` values; do not print environment files or credentials.

```powershell
$env:CAPTURE_BASE_URL = 'http://localhost:3031'
node "$Q/capture-workspaces.mjs" $B 'crm' 'crm-records,crm-kanban,crm-drawer,crm-drawer-properties'
node "$Q/check-workspaces.mjs" $B 'crm' 'crm-records,crm-kanban,crm-drawer,crm-drawer-properties'
```

These show the exact first-batch arguments, NOT permission to run an unsupervised/unbounded process. Both runners authenticate role `admin` through `/api/auth/demo-account`, use installed Chrome, and refresh authentication after 15 minutes between states. Every state/width gets the declared fixture scenario and viewport, including mobile-only or intermediate/tablet states.

Expand the existing JSON into the 72 ordered commands without executing them. This avoids omitting Shell/People/Support/Tools or accidentally narrowing to desktop/mobile:

```powershell
$Plan = Get-Content -LiteralPath $PlanPath -Raw | ConvertFrom-Json
$Jobs = @(
    foreach ($Area in $Areas.Split(',')) {
        $Definition = $Plan.areas.$Area
        if ($null -eq $Definition) { throw "Missing area: $Area" }
        $Declared = @($Definition.states.name)
        $Batched = @($Definition.batches | ForEach-Object { $_ })
        if (Compare-Object $Declared $Batched) { throw "Batch coverage differs: $Area" }
        if ($Batched.Count -ne @($Batched | Sort-Object -Unique).Count) { throw "Duplicate batch state: $Area" }
        for ($Index = 0; $Index -lt $Definition.batches.Count; $Index++) {
            $Batch = @($Definition.batches[$Index])
            if ($Batch.Count -lt 1 -or $Batch.Count -gt 4) { throw "Invalid batch size: $Area" }
            foreach ($Phase in @('capture', 'check')) {
                [pscustomobject]@{
                    Tag = '{0}-{1:D2}-{2}' -f $Area, ($Index + 1), $Phase
                    Argv = @("$Q/$Phase-workspaces.mjs", $B, $Area, ($Batch -join ','))
                }
            }
        }
    }
)
if ($Jobs.Count -ne 72) { throw "Expected 72 collector invocations, found $($Jobs.Count)" }
foreach ($Job in $Jobs) {
    '{0}: node {1}' -f $Job.Tag, (($Job.Argv | ForEach-Object { '"' + $_ + '"' }) -join ' ')
}
```

Execution order is CRM, Contributions, Studio, Shell, People, Support, Tools; within each area's existing batch order, finish capture then check before advancing. Exactly one process at a time: no parallel collectors/composers, no simultaneous reviewer browsing, and no duplicate run. Allocate an eight-hour hard wall-clock envelope for the catalogue and derivatives, 20 minutes per collector, 15 minutes per composer, and five minutes for brief generation; these are ceilings, not duration estimates. Stop at the earlier process/global deadline. At most ONE root-authorized retry of ONE transiently failed batch (capture plus check, at most two extra collector invocations) is permitted under the same unchanged source. Retain both attempts' logs and attribute final rows/files to the completing attempt. A code/harness/fixture change, unexpected warning, semantic failure, or exhausted budget is not an automatic retry case.

The future supervisor should use a fresh `$Run` directory and record UTC start/end, PID, exact arguments, timeout and exit status for each unique `$Job.Tag`. A minimal per-job launch recipe is below; it must be wrapped by the provenance and content gates in section 5 before advancing to the next `$Job`. It is not a replacement evidence auditor or permission to add another harness file.

```powershell
$DeadlineUtc = [DateTime]::UtcNow.AddHours(8)
New-Item -ItemType Directory -Path $Run -ErrorAction Stop | Out-Null
$Job = $Jobs[0]
$StartedUtc = [DateTime]::UtcNow
$RemainingMs = [Math]::Floor(($DeadlineUtc - $StartedUtc).TotalMilliseconds)
if ($RemainingMs -le 0) { throw 'Run deadline reached' }
$BudgetMs = [int][Math]::Min(1200000, $RemainingMs)
$QuotedArguments = @($Job.Argv | ForEach-Object { '"' + $_ + '"' })
$Process = Start-Process -FilePath (Get-Command node).Source -ArgumentList $QuotedArguments -WorkingDirectory $Root -WindowStyle Hidden -PassThru -RedirectStandardOutput "$Run/$($Job.Tag).stdout.log" -RedirectStandardError "$Run/$($Job.Tag).stderr.log"
$Process.Handle | Out-Null
$Finished = $Process.WaitForExit($BudgetMs)
if (-not $Finished) {
    & taskkill.exe /PID $Process.Id /T /F
}
$FinishedUtc = [DateTime]::UtcNow
$ExitCode = if ($Finished) { $Process.ExitCode } else { $null }
[pscustomobject]@{
    tag = $Job.Tag
    argv = $Job.Argv
    pid = $Process.Id
    startedAtUtc = $StartedUtc.ToString('o')
    finishedAtUtc = $FinishedUtc.ToString('o')
    timedOut = -not $Finished
    exitCode = $ExitCode
} | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath "$Run/$($Job.Tag).result.json" -Encoding utf8
if (-not $Finished -or $null -eq $ExitCode -or $ExitCode -ne 0) { throw "Stopped: $($Job.Tag)" }
```

Initialize the deadline/directory ONCE; repeat only the per-job portion for the next item after auditing the prior result. Reserve tags before launch and refuse any log-path collision. On timeout terminate only that exact launched PID tree and record cleanup outcome; never kill Chrome, Node, Next or Postgres by process name, and never stop another owner's server. Preserve partial evidence and mark the run incomplete. Any later continuation requires root's explicit scope/deadline decision, not an implicit restarted clock.

Do NOT reuse `review/round13/runtime/core-evidence/run-core.mjs` unchanged: it pins `candidate-13-core`, historical round13 diff/entry count, a six-area selection, and an old deadline. Its existence does not supply the required new all-seven-area orchestration.

## 5. Freshness and content gates

1. Start `$B`, `$AB`, `$BA` and all 14 brief paths absent. Create only root-authorized new output/log locations. Do not copy old metrics/check rows/PNGs into B. Both JSON writers merge earlier entries without per-row generation stamps (`harness-results.mjs:23`; `check-workspaces.mjs:264`); a final file's existence, timestamp, row count or exit 0 alone cannot establish freshness.
2. Before each batch, compare the new freeze identity, batch-plan hash, and the recorded harness/fixture input hashes. Include both state catalogues, runners, preflight, result writer, route-error/fixture helpers, metrics/probes and their imported local dependencies, fixture builder/export/verifier/types, composer and brief generator. Keep a concrete input hash list with the run. Stop on unexplained drift; a successful product freeze check does not cover excluded evidence/helper code.
3. After EVERY collector process, immediately copy `$B/fixture-proof.json` to a unique `$Run/{tag}.fixture-proof.json`, never overwriting another attempt. Require its realpath `repoRoot` to be this r12 checkout, `typecheck` passed, successful verification, and `verifiedAt` inside that invocation's recorded UTC start/end interval. A failed preflight can leave the preceding process's proof behind. Record every `bundleSha256`; require a common bundle or stop for the fixture owner's explanation of unexpected variation. The final single proof in B is only the last invocation, not proof of all 72.
4. Require one `captured {state}` completion line per selected state in capture logs, new expected viewport/full PNGs and metric keys in that invocation's time window. Capture logs are state-level, NOT per-width proof (`capture-workspaces.mjs:287`). Require each check's explicit `{state} @{viewport}` measurement in THIS run's logs (`check-workspaces.mjs:354`) as well as the matching final JSON row. Persist a per-batch observed/expected key ledger and SHA-256 file inventory; mtimes are corroboration, not a substitute for the logs and source identity.
5. Audit BOTH stdout/stderr for missing setup triggers, captured-as-is states, disabled controls, loading labels, unresolved labels, not-settled warnings and unexpected route-error headings. A named PNG can still be the wrong underlying page: visually qualify the intended drawer/dialog/menu/tab and fixture ID. Expected empty/error scenarios must be distinguished from route-boundary failures. Do not call a missing trigger exercised. Hold semantic/setup failures for root; any required product/setup change needs an authorized new freeze/run, not an unrecorded repair mid-batch.
6. Inspect axe violations and incomplete IDs, overflow, rendered row counts, dialog containment, keyboard reach and Escape results; the runners do not exit nonzero for every such finding. Keep attributable failures in the record. Current automated probes are axe WCAG 2A/AA/2.1AA tags, limited row Tab/ArrowDown on seven grids, and 12-Tab dialog containment/Escape: not full keyboard, screen-reader, zoom, provider or tenant-integration coverage. Raw hidden `h1` counts do not prove the visible title hierarchy.
7. Final exact-set audit must compare the unchanged plan/catalogue to B: 234 distinct metric/check pairs with no duplicate check rows, missing keys, or unexpected keys; 234 viewport PNG names and 85 catalogue-`full` PNG names, with no old/extra images. Derive full-page eligibility from the frozen catalogue; the batch JSON supplies widths, not `full`. Compare per-area/per-width sets, not just totals. Confirm all 36 capture and 36 check terminations (plus explicitly attributed retry if any), the full source identity, and unchanged A hashes before composing.

Optional later offline harness gate, before runtime collection, if the owner has not already qualified the same helper bytes: `node --experimental-vm-modules --test "$Q/harness.test.mjs" "$Q/harness-runners.test.mjs"`. This checks harness collaborators, not live journeys or runtime readiness. It is not run by this planning task; do not repeat a previously passed gate without changed inputs or unresolved risk.

## 6. Both sheet orders and historical baseline gaps

After final B capture/check auditing, create both comparison orders in fresh directories, under the same supervisor and global deadline (15 minutes each):

```powershell
node "$Q/compose-sheets.mjs" $A 'frozen round12' $B 'repaired round13r2' $AB
node "$Q/compose-sheets.mjs" $B 'repaired round13r2' $A 'frozen round12' $BA
```

Omit the optional sixth `statePrefix` argument so all seven areas are covered. A single `shell`/`people` prefix would miss states with other names; singular/plural Contribution names also matter. This script reads saved PNGs but launches headless Chrome (`compose-sheets.mjs:28`), so it is NOT permitted during this read-only planning task. It has no source-freshness, pair-completeness or automatic failure gate for missing counterparts.

The composer takes only the intersection of matching NON-full PNG filenames (`compose-sheets.mjs:20`). Require identical exact filename sets in AB and BA, correct side labels and fresh output hashes. Inspect representative sheets from each area/width against the underlying PNGs. Full-page captures remain linked separately, not composited. A missing sheet must be explained as missing paired evidence, never a pass.

At this plan's offline inventory, historical A lacks these 20 currently declared viewport PNGs:

| A state(s)                                                                                                                | Missing viewport(s)                | PNG pairs |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | --------: |
| `admin-team-manage`, `admin-team-create`                                                                                  | desktop                            |         2 |
| `mobilize-candidate`, `mobilize-add`, `events-venues`, `events-speakers`, `events-attendees`, `tasks-drawer`, `tasks-new` | desktop                            |         7 |
| `studio-account`                                                                                                          | intermediate, small-tablet, mobile |         3 |
| `reports`                                                                                                                 | intermediate, small-tablet         |         2 |
| `email-studio`, `pdf-studio`                                                                                              | intermediate, small-tablet, mobile |         6 |

Therefore, with unchanged A and complete new B, expect **214 sheets per order / 428 total**, NOT 234 per order. The 20 new B-only images must still be supplied to both reviewers with explicit A-missing labels. Nine of A's desktop gaps correspond to historical sample-only/skipped controls; do not infer those controls were exercised from their names. Root must either accept and disclose these historical comparison gaps or separately authorize supplementation from a safely served frozen A, using a new labeled A evidence location and new provenance. Do not quietly edit the original candidate-12 evidence.

A also lacks 44 declared check pairs: all 20 image-gap pairs above, plus these 24 pairs where A has an image but no matching check row:

| A state(s)                                             | Missing checks             | Pairs |
| ------------------------------------------------------ | -------------------------- | ----: |
| `crm-records`, `crm-notes`, `crm-relationships`        | intermediate, small-tablet |     6 |
| `crm-note-long`                                        | mobile                     |     1 |
| `contributions`                                        | intermediate, small-tablet |     2 |
| `contributions-cards`                                  | intermediate               |     1 |
| `studio-dashboard`, `studio-pages`, `studio-page-edit` | intermediate, small-tablet |     6 |
| `home`                                                 | intermediate, small-tablet |     2 |
| `care`, `tasks`                                        | intermediate, small-tablet |     4 |
| `support-inbox`                                        | intermediate, small-tablet |     2 |

Keep all absent A checks labeled historical/not run. Never copy B measurements into A or let a new checker width policy imply that old A was checked at those widths. The corrected-council-readiness report's earlier 56-pair CRM/Contributions target used the old desktop/mobile checker policy; the current new-run target is all 234 declared pairs. Its earlier incomplete-run observation must not be repeated as a present-tense completion claim.

## 7. Fresh independent reviewer packets

First finalize `$Verification` with the NEW freeze identity, server attestation, scope/matrix, exact run location, per-process proof ledger, final PNG/JSON hashes, all warnings/findings, A gap decision, both sheet manifests, and any separately executed journeys. Leave unrun work explicitly unverified. Do not paste the old round13 verification as if it describes the repaired run.

The exact generator configuration is:

```powershell
$env:BRIEF_AREAS = $Areas
$env:BRIEF_REVIEWERS = 'claude,gpt'
$env:BRIEF_SERVING = 'A is historical candidate-12 evidence from the parent frozen round12 checkout, not a fresh all-width rerun. B is newly collected in the r12 checkout from the root-attested round13r2 runtime. See the verification note for exact source/runtime identities, fixture modes, historical A gaps and separately authorized journeys.'
node "$Q/write-briefs.mjs" $Round $A 'frozen round12' $B 'repaired round13r2' $Verification swap
if ($LASTEXITCODE -ne 0) { throw 'Brief generation failed' }
```

Require exactly 14 new files, seven areas times two seats. `swap` makes Claude see B first/BA sheets and GPT see A first/AB sheets (`write-briefs.mjs:369`), counterbalancing the historical round12 Claude A-first order. Record this assignment. `BRIEF_AREAS`/`BRIEF_REVIEWERS` prevent inherited narrow settings from silently producing only a subset. Override `BRIEF_SERVING`: its default falsely describes a detached-base runtime for A. This generator is local file generation, but must still wait for the FINAL captures/checks/sheets and verification note.

### Known generator gaps: explicit addenda, not hidden harness edits

The root/brief owner must attach or append a clearly labeled, seat-order-aware addendum to every applicable NEW packet before hashing/release. This planning task does not edit the generator or briefs. There is no CLI switch that fixes the following omissions:

- `PARTS` at `write-briefs.mjs:25` omits `contribution-fund-correction` entirely from Contributions and `care-profile-plan` entirely from People. Add both states to their respective area packets with all declared widths, actual A/B images/full-page references and hashes, metrics/checks and setup-outcome caveats. Respect each seat's first/second version order; do not imply the fund-correction form opened if the control was absent.
- Image evidence loops all four widths (`write-briefs.mjs:275`), but textual check summaries loop only desktop/mobile (`write-briefs.mjs:357`). Supply intermediate/small-tablet check rows explicitly for every applicable state/area, including absent historical A rows. Link final JSON and its hash; do not relabel missing summaries as tests not required.
- Generic prose says identical steps/conditions and unavailable server data in both versions. Qualify that historical A has different coverage/collector provenance, that some missing triggers were captured as-is, and that any loaded-data supplement is a separately identified run rather than the main unavailable-data comparison. A `BRIEF_SERVING` override alone does not remove every static assumption.
- The fixed quality-reference path is `references/reui-c-data-grid-22-light.png` under this r12 checkout, currently absent. The parent reference exists with SHA-256 `e70064037b3d393558136a3cb52f9917fc676184230067aefde8bb740883bf40`. Root must separately supply a verified copy or give the actual parent absolute path in every packet/addendum; do not ship a dead reference or silently substitute another design. It is a visual benchmark, not proof of behavior or a new Core feature requirement.

The shared verification note can embed common neutral facts, but cannot by itself supply both order-sensitive addenda. Prefer explicitly ordered per-seat evidence lists. Keep historical scores, preferences and other reviewers' answers OUT of new independent packets; historical reports are provenance/gap context only, not a verdict prompt. The existing rubric may be retained without asserting any scores here.

Before release, verify every referenced path resolves from the packet's stated checkout, every inline PNG SHA-256 prefix (the generator uses 16 hex characters) matches current bytes, every full-page reference exists, every sheet reference has the correct AB/BA order, and every metrics/check summary comes from final JSON. Hash the full final briefs/addenda, verification note and sheets in an external run inventory. The generator does not perform this audit. If ANY evidence changes, invalidate derivative packets and regenerate under the same disclosed evidence identity, or a new namespace if already released; never edit evidence behind an issued hash.

Fresh independent reviewer instructions should say: inspect the actual named images and final source/verification, name what was opened, preserve A/B identity, distinguish catalogue checks from separate live journeys, and mark missing essential evidence incomplete. No product/harness changes, automatic repair, source restore, old verdict reuse, or unsupported integration/conformance inference. Starting reviewers/children is a later root action and is NOT authorized by this planning task.

## 8. Journeys the catalogue does not establish

The 234-pair catalogue is necessary visual/probe evidence, not a complete repair acceptance suite. The queue below identifies absent or inadequately exercised journeys; it does not claim these journeys failed or passed on the repaired source. There are no existing CLI switches that turn these journeys into catalogue states. Do not pass invented state names to `onlyStates` and mistake a silent no-op for a test.

Root must separately authorize the driver/manual protocol and exact disposable fixtures before any live follow-up. Bound that follow-up to the ten groups below, at most 30 minutes per group and five hours total, one group at a time, no automatic retries. Use desktop/mobile unless a row specifies all four widths. Store each result under a NEW `round13r2-journey-{id}-{runId}` namespace with steps, source/environment identity, timestamps, screenshots/trace and the observed outcome. Leave incomplete groups unverified when time, fixtures or authorization are exhausted. Do not edit the catalogue/harness or expand business side effects under this document's ownership.

| ID / area                            | Missing or limited catalogue evidence                                                                                                                                                             | Concrete bounded journey and required distinction                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| J1 Contributions / CRM receipts      | Opening a receipt dialog is not delivery, usable initial focus or full-form proof; a historical fixture also returned 404.                                                                        | Open the single and CRM receipt entry points at desktop/mobile; inspect initial focus, scrolling, all fields/actions, validation and safe error/retry recovery. Confirm the fixture ID is valid. Cancel or use an explicitly authorized local mocked outcome; do not send real email or claim provider delivery.                                                                                                                          |
| J2 Contributions fund correction     | `workspace-states.mjs:579` selects `meta.contributionSheetId`, then searches for the correction trigger. The historical readiness report found captured-as-is detail content, not an opened form. | Qualify an actually eligible local contribution with its current status/permission/fund options. Demonstrate the trigger and full correction form, validation and safe cancel/outcome at desktop/mobile. If the current anchor is ineligible, stop for the owning setup/fixture decision and new source qualification; do not treat the named capture as exercised, change fixture selection ad hoc, or apply real financial corrections. |
| J3 Tools / Reports URL state         | `module-states.mjs:342` only opens `/reports`.                                                                                                                                                    | At all four widths, select groups `funds`, `missionaries`, `donors` and periods `all`, `year`, `12m`, `90d`, `30d`; verify UI/URL agreement, direct nondefault URL such as `/reports?group=donors&period=90d`, reload, history back/forward, invalid-value fallback, and a clean default URL. The owning current parser is `apps/admin/app/(app)/reports/page-client.tsx:79`; do not assume history insertion semantics or omit `year`.   |
| J4 Shell / Tools giving data         | Placeholder configuration leaves server-loaded Home/Reports unavailable; browser route interception cannot establish loaded server reads.                                                         | Under the separate loaded-fixture authorization below, show the loaded giving trend and named scope, refunds/applied corrections and completeness indicators, plus separately identified unavailable/error/recovery cases if the server fixture can represent them. Record actual capture-triggered server requests. Do not infer loaded totals, correction correctness or tenant integration from the main unavailable-data screenshots. |
| J5 Web Studio publication and revert | Static page editor, publish menu or version dialog captures do not prove persisted published identity or failed-version guards.                                                                   | On an authorized disposable page: publish once, create a new draft with a different slug, verify the published link retains the persisted published identity, then publish the successor and recheck. Exercise version-list GET 403 and 500 separately; an uncertain version lookup must not issue a revert PATCH. Preserve request/outcome evidence; no production publication or destructive revert.                                    |
| J6 Web Studio missionary status      | `studio-missionaries-status-error` at `workspace-states.mjs:821` fails the PRIMARY `missionary-giving-pages?limit=500` request only.                                                              | Fail the SECONDARY versions/status lookup while primary rows succeed, then retry successfully. Inspect retained names/Edit links and known Published state, explicit Unavailable for uncertain Draft/Changed status, and recovery without inventing publication truth. This is a different fault from the existing state.                                                                                                                 |
| J7 Shell / Eve                       | `admin-eve` at `module-states.mjs:88` is a static state.                                                                                                                                          | Re-select the active section/tab repeatedly, switch away/back, and inspect focus, panel content and scroll stability at desktop/mobile. Record actual repeated interactions, not just the initial panel screenshot.                                                                                                                                                                                                                       |
| J8 Tools / PDF Studio                | `pdf-export-menu` at `module-states.mjs:385` opens a menu only.                                                                                                                                   | Use controlled clipboard cases: pending then fulfilled, rejected promise, synchronous throw, unavailable API; test duplicate click, failure retry and feedback-timer reset. Separately cover native JSON and legacy HTML export/copy contents and truthful labels. Do not claim success before the clipboard outcome. The current handler is `apps/admin/app/(app)/pdf/page-client.tsx:1621`; no provider write is required.              |
| J9 Support / People                  | Editor/dialog and `care-profile-plan` screenshots do not establish saving, persistence or error recovery.                                                                                         | For an authorized local Support/SLA editor and care plan, check mobile scroll/focus, save success or error, retry and reload persistence against the correct scenario. Verify feed/read-only/moderation actions only to the extent the declared fixture and contract allow; static disabled/sample controls are not a live moderation workflow.                                                                                           |
| J10 CRM / cross-area usability       | Long-note/gift states and limited row/dialog probes do not establish complete keyboard or zoom behavior.                                                                                          | Traverse CRM long note, gift/history and return navigation, then inspect visible title/landmark hierarchy, initial/return focus, Escape, tab order and long content in the seven areas at desktop/mobile and 200% desktop zoom. Keep a finite checklist per area; distinguish CSS hidden duplicate headings from actual visible-title defects. Screen-reader and full conformance remain separate unless explicitly performed.            |

Auth/tenant/RLS enforcement, real payment/refund/correction writes, provider delivery, production publishing and backend integration are separate, unverified gates. The catalogue's mocks, local demo authentication and synthetic server fixture cannot establish them. Do not widen credentials, permissions or effect boundaries to fill an evidence gap.

### Loaded Home/Reports: prepared helper, not an activated runtime

`review/round13/runtime/loaded-giving-fixture/README.md` describes a prepared loopback read-only HTTP fixture. It is not a saved loaded capture, and its old round13 manifest/source pins must be requalified for NEW round13r2 before use. Its tests/probe/helper also create listeners; none are run by this planning task. Root must obtain separate authorization for the local helper and any child Next process/env/lifecycle. The current admin service factory can cache a missing service key: a browser interception or changing the collector shell cannot turn the already-running unavailable-data server into the loaded-data runtime.

After that authorization, the documented helper command is:

```powershell
$FixtureDir = "$Q/review/round13/runtime/loaded-giving-fixture"
$AsOf = [DateTime]::UtcNow.ToString('yyyy-MM') + '-01T00:00:00.000Z'
node "$FixtureDir/run.mjs" --as-of $AsOf --lifetime-ms 900000 --max-requests 256
```

Use one explicit canonical UTC `asOf` and retain it; it defines the synthetic data window, not a claim that the application clock was frozen. The helper binds an ephemeral `127.0.0.1` port, expires within 15 minutes and is capped here at 256 requests. Do not raise limits automatically. Capture its startup/shutdown records, actual `baseUrl`, `runId`, `dataSha256`, scenario and full bounded request log. It accepts only the documented local reads and rejects writes/other tenants; no outbound calls, production hosting, proxy exposure or real credentials are allowed.

Only the later ROOT-OWNED local Next child receives the fixture `baseUrl` as `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY=round13-local-placeholder-anon`, `SUPABASE_SERVICE_ROLE_KEY=round13-local-synthetic-service-key-not-a-secret`, `SKIP_ENV_VALIDATION=1`, `NODE_ENV=development`, `E2E_AUTH_BYPASS=true`, `ASYM_E2E_AUTH_SURFACE=admin` and `PAYLOAD_DISABLE_SCHEMA_PUSH=1`, with unchanged sanctioned scratch CMS wiring. Those two published placeholder/marker values are not real credentials. Use process-only sanitized configuration, no env-file edits and no inherited real privileged/provider keys or protected deployment flags. Root supplies a separately identified free port and matching runtime/cache proof; do not take over or restart the existing 3031 process here.

Then set the collector's `CAPTURE_BASE_URL` to that root-attested loaded Next URL and use the committed runners, each with mandatory preflight, into TWO DIFFERENT NEW output directories:

```powershell
node "$Q/capture-workspaces.mjs" $LoadedCaptureDir 'shell,tools' 'home,reports'
node "$Q/check-workspaces.mjs" $LoadedChecksDir 'shell,tools' 'home,reports'
```

Root must first assign absent, uniquely named `$LoadedCaptureDir` and `$LoadedChecksDir` paths containing `round13r2` and the loaded run ID; they are NOT `$B` or each other. These cover eight state/width pairs each, not the other 226 catalogue pairs or URL/fault journeys. Keep each directory's own proof, request attribution and logs. Require matching `x-core-qa-fixture`, `x-core-qa-fixture-run`, `x-core-qa-fixture-sha256`, `x-core-qa-fixture-as-of` and scenario headers, and actual capture-triggered Home/Reports requests in the fixture log; a standalone probe or cache hit with no fresh request is insufficient transport evidence. Stop if the helper expires/budget is exhausted. If the owner cannot complete within its bounds, leave loaded UI evidence unverified rather than reuse stale bytes, disable preflight or pretend the main B directory was loaded.

## 9. Final handoff gates, without a score claim

- Root's NEW round13r2 manifest/diff and attested runtime still match; all separately hashed harness/fixture sources are unchanged. No return to round13, no concurrent changes overwritten, no evidence path collision.
- Catalogue evidence has all seven areas, 234 exact fresh state/width pairs, 319 expected PNGs, 72 terminating collector processes and attributable per-process fixture proofs/logs; any authorized retry is disclosed. Warnings, axe/probe findings, cleanup failures and captured-as-is states are classified, not hidden by exit 0.
- Both sheet orders are fresh and exact-set audited. With unchanged historical A, 214 sheets per order, 20 A image gaps and 44 A check gaps are explicit. If A was separately supplemented, substitute its actual separately attested inventory and rerun downstream artifacts; do not retain these counts blindly.
- Fourteen fresh briefs have correct seat order, final PNG/JSON/sheet hashes, both omitted states added, intermediate/tablet checks, working quality reference and honest historical/runtime provenance. No copied old scores or cross-seat verdict contamination.
- The live-journey ledger separates performed, blocked and unrun work with concrete evidence and effect boundaries. Loaded-data proof, if separately authorized, stays separate from main B and is tied to the new freeze/helper/runtime identity.
- Issue only an evidence-completeness handoff with remaining limitations. This plan establishes no scores, winner, acceptance, accessibility conformance, financial correctness, tenant integration or production readiness.
