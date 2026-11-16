# Round13r2 Shell/People fresh evidence: blocked, incomplete

Verdict: **INCONCLUSIVE**. On November 12, 2026 (Asia/Bangkok), the first committed capture invocation passed its mandatory fresh fixture preflight, then failed before opening a browser. No UI behavior or visual quality is established.

## Blocker and stop boundary

The committed capture runner at capture-workspaces.mjs:217 requests Playwright Chromium with channel chrome. Its exact failure was:

    browserType.launch: Chromium distribution 'chrome' is not found at C:\Users\Conrad\AppData\Local\Google\Chrome\Application\chrome.exe

See shell-01-capture.stderr.log and shell-01-capture.result.json. This proves the runner could not find its resolved executable, not that every possible browser installation is absent. Its suggested installation command was NOT executed. No alternate executable, fallback driver, retry, source/harness edit, or subsequent collector was attempted. Root must provision the required channel and authorize a fresh attempt; preserve this incomplete run.

## Exact invocation and timing

- Executable: C:\Program Files\nodejs\node.exe; PID: 34888.
- CWD: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12.
- Script: docs/qa/admin-workspaces-hillclimb/capture-workspaces.mjs.
- Output: this run's shell-01/candidate/; area: shell; states: home,home-search,home-profile-menu,home-mobile-nav.
- Process-only override: CAPTURE_BASE_URL=http://localhost:3031; no environment file changed.
- UTC start: 2026-11-11T21:05:45.881Z; finish: 2026-11-11T21:05:49.161Z.
- Duration: 3280 ms; exit: 1; no signal or timeout; configured process ceiling: 1200000 ms.
- Exact argv: shell-01-capture.launch.json; complete stdout/stderr retained separately.

A HEAD reachability probe on the authorized candidate port returned 307 to /login?next=%2F; see runtime-reachability.json. Reachability alone does not attest the server's build/start/cache identity. Port 3030 was not used.

## Fresh invocation-specific proof

Immediately after termination, fixture-proof.json was copied to the unique shell-01-capture.fixture-proof.json at 2026-11-11T21:05:49.166Z, before any later collector could overwrite it.

- verifiedAt: 2026-11-11T21:05:49.117Z, inside the invocation's UTC start/end interval.
- repoRoot realpath: this r12 checkout. API/database package realpaths also resolved here.
- typecheck: passed.
- Verification: verify-fixtures: all 1645 checks passed (hooks: no zod; ids: zod uuid + client UUID_PATTERN).
- bundleSha256: afed848ea1dc100a2818ff77f3530987d5f8784fa324bfb3d72acda7443ad48b.
- Preserved proof SHA-256: d883990e31e4bdad28a4ffc4e5cad9f02aac73544a0e6eaf21c31e75baee8201.

This proof belongs ONLY to that single failed capture invocation. It does not prove browser loading, other invocations, or real-client Home finance transport. One invocation cannot establish cross-invocation bundle consistency.

## Frozen source and helper provenance

- Checkpoint: round13r2; 1038 entries.
- Manifest SHA-256: 27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0.
- Diff SHA-256: 8061b8fde771136891d4baf152062c613d1c7a7352040d4b66f14feea5239b6b.
- Batch-plan SHA-256: feca3e2985c7aff03b7267a6d503cab437538fbe87903752c9c608992378166b.
- Recorded inputs: 102 files, including catalogues, runners, preflight, result writer, route/fixture/measurement helpers and local import closure, fixture builder/types/export/verifier, composer, brief generator, manifest and package/lock inputs. No unresolved relative imports were recorded by the traversal.
- Input-set SHA-256: 77d080aa4bd13fbc74358ae042f98cfdea63b461655368dfada439921593150e; unchanged before/after the attempted batch and at handoff.

freeze-checkpoint.mjs --verify round13r2 passed at initialization, before Shell batch 1, after its failure, and at handoff: exit 0, 1038 files, empty mismatches and extra. Every gate has separate launch/result/stdout/stderr records. See identity.json, input-hashes.baseline.json, shell-01-before.input-hashes.json, shell-01-after.input-hashes.json, and input-hashes.handoff.json.

## Complete/missing inventory

The unchanged plan agrees with the actual catalogue: Shell 13 states/19 pairs; People 21 states/34 pairs. Ten batches retain at most four states each and every declared width: 1440x1000, 1024x900, 640x900, 390x844.

- Expected pairs: 53; complete: 0. All 53 lack capture metrics and check rows.
- Expected PNGs: 53 viewport plus 32 catalogue-full images = 85; produced: 0, missing: 85.
- Expected collector invocations: 20; executed: 1, failed: 1, not run: 19. No check-workspaces.mjs invocation followed the capture failure.
- Shell batch 1 has seven expected keys, zero observed metric/check keys, and zero captured-state completion lines.
- No unexpected/duplicate observed rows exist because no rows were produced; this is not a passing check.

pair-inventory.json lists each expected/observed key and complete/missing pair for every batch. invocation-inventory.json attributes execution/proof status individually. shell-01-capture.audit.json records the failed invocation's evidence and artifact hashes. batch-expectations.json preserves exact states, widths, and full flags. These are run-local inventories, NOT root aggregates or edits to canonical ledgers.

## PNG inspection and measurement limits

No fresh PNG exists, so none was inspected. Home equal module cards/shortcuts at all four widths, failure alert, sidebar brand, Staff directory, and People/Tasks widths remain unverified. No fresh axe violations/incomplete IDs, overflow, rendered row counts, dialog containment/Escape, or keyboard measurements exist. Absence of results is not a pass.

Loaded real-client Home finance transport is explicitly later root-owned work. The catalogue and successful fixture contracts do not prove it. No visual scores, historical screenshots, old merged metrics, or runtime-readiness claim are used.

## Ownership

Every newly written artifact is under review/round13/runtime/round13r2-shell-people/. Concurrent work and prior evidence were preserved. No source, tests, harness, canonical ledger, environment file, or Git state was edited. No servers/restarts, provider actions, or subagents were used. The collector exited before launching a browser; no task-owned browser remained to clean up.

See scope-and-limits.json and artifact-hashes.json. The artifact hash inventory deliberately excludes itself to avoid a self-referential hash.
