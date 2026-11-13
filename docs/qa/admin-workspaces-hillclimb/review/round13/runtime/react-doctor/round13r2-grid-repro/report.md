# Round13r2 G2: bounded executable cached-child reproduction

## Decision

**Reproduced on unchanged frozen grid source:** the actual exported `DataGridScrollArea`, with a real `DataGrid` provider and table engine, retains detached cached children after keyed table/header replacement in enabled custom mode. The new connected header measures 60px, but the overlay remains at its old 24px. A later real viewport scroll/controlled subscribed resize updates it to 0px by measuring the detached old header, not the new 60px header.

This converts the completed qualification's predicted replacement RED into executable evidence. It demonstrates stale geometry and detached-target retention **during the mounted effect's lifetime**, not an after-unmount leak. Ordinary and StrictMode cleanup pass separately. It does not adjudicate the scanner warning, authorize an exception, establish a current first-party incident, or authorize a product fix.

All work uses only `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`. New files are confined to this `round13r2-grid-repro/` runtime directory. Neither shared grid source owner, any dependent product source/test, any pre-existing test/config/harness/ledger, nor Git state was edited. No child agent, browser, application server, provider/environment configuration, scanner, or deployment was used.

## Authoritative execution

The authoritative label is **`final`**, not an earlier development attempt. Its wrapper preserves the genuine nonzero test exit.

| Invocation     | Selected cases | Other cases           | Exit | UTC interval, November 12, 2026 |
| -------------- | -------------- | --------------------- | ---- | ------------------------------- |
| `CHARACTERIZE` | 6 passed       | 5 name-filtered skips | 0    | 00:24:44.465 to 00:24:48.651    |
| `REBIND`       | 5 failed       | 6 name-filtered skips | 1    | 00:24:48.654 to 00:24:52.086    |

There are 11 distinct cases, not 22 executions. The skips are the opposite group excluded by the name filter. Characterization stderr is empty. Rebinding stderr contains actual assertion failures, without unhandled runtime/setup exceptions. The wrapper's expected frozen-source exit is **1**; exit 0 is not the reproduction's success criterion.

The five RED cases are:

- Keyed table replacement with `orientation="both"` and `headerSticky: true`.
- The same replacement with `orientation="vertical"` and sticky header.
- Keyed header-only replacement, retaining the table and viewport.
- Successful initially late table/header discovery followed by keyed table replacement.
- Table to empty state to a new table, without remounting the scroll area.

The six separately passing characterization cases cover initial enabled geometry/stable rerender/resize/scroll in both orientations, initially late discovery using native mutation records, ordinary unmount, StrictMode replay/unmount, and unmount before late discovery. See [characterization output][characterization-output], [rebinding output][rebinding-output], and [raw failing assertions][rebinding-errors].

## Actual seam and assertion

[The executable test][test] imports the real exported scroll-area and provider from their workspace source. Its engine import is the actual `packages/ui/components/data-grid-panel/data-grid-engine.ts` source; that internal engine is not an exported package subpath. The fixture uses a minimal ordinary HTML table/header with the actual queried data slots, inside the real provider/scroll-area/Base UI composition. It does not claim to exercise the entire `DataGridTable` renderer. There is no owner, provider, React, or table-engine mock and no `vi.mock`.

[The local Vitest config][config] includes only this owned test, uses the existing workspace source resolver read-only, deduplicates React, and runs one jsdom worker without file parallelism or root test setup. `envDir: false` prevents dotenv loading. Filesystem module/results caches are disabled by the recorded CLI; any configured Vite cache path is inside this owned directory. No dependencies were installed or changed.

[The infrastructure seam][infrastructure] controls only DOM/runtime infrastructure:

- Connected scroll viewport geometry is 200px high, scroll height 600px, width/scroll width 320px. Header geometry is 24px initially and 60px after replacement. Disconnected nodes retain native jsdom zero geometry; the mock does not fabricate stale 24px geometry on detached nodes.
- A stateful ResizeObserver fake records subscription targets, `observe`, `unobserve`, `disconnect`, and deliveries. It delivers only to currently subscribed targets, never after disconnect or to unsubscribed replacement headers.
- MutationObserver wraps and delegates to the real jsdom implementation. Both late discovery and an independent replacement witness see actual child-list records; the harness does not synthesize mutation callbacks into the owner.
- RAF is controllable, cancellable, and bounded to 12 settle batches. Real React `act` drains mutation/microtask work. The ordinary burst case requires one live coalesced frame.
- Listener spies record actual target/handler/options pairing. An empty `Element.getAnimations()` shim supplies a missing jsdom platform API for Base UI and is restored afterward.

The concrete geometry assertion is [test line 164][red-assertion]:

```tsx
expect
  .soft(
    next.overlay.style.getPropertyValue(headerProperty),
    "Replacement header geometry must publish after native child-list delivery, without rescue scroll/resize.",
  )
  .toBe("60px");
```

Raw output:

```text
AssertionError: Replacement header geometry must publish after native child-list delivery, without rescue scroll/resize.: expected '24px' to be '60px' // Object.is equality
Expected: "60px"
Received: "24px"
```

Before that assertion, the test proves the enabled overlay initially publishes 24px; root/viewport identity remains stable; the replacement header is a new, connected 60px node; the old header is disconnected and measures 0px; native child-list removals occurred; and the effect's resize observer was neither recreated nor disconnected. Header-only replacement also proves table identity is retained.

Four replacement observations each record two native child-list records, old header still observed, new header not observed, and overlay at 24px. For the three table-replacement observations, the old table also remains observed and the new table is not observed. In the header-only case the same table correctly remains observed, while the header stays stale. Each subsequent viewport resize/scroll probe yields overlay height 0px, not 60px; delivery to the new header is correctly refused because it was never subscribed. The separate empty/return case also retains the old header and publishes 24px rather than 60px. [final-observations.json][observations] extracts these JSON lines without replacing the raw logs.

## Why this is the cached-child gap

The frozen source [reads cached child refs at line 221][owner-cache] when syncing geometry. [The effect at line 296][owner-effect] queries and stores those identities in `resolveObservedElements`, observes them, and installs a passive captured-viewport scroll listener. Its resize-target Set only adds targets during that effect's life.

The subtree discovery observer at source line 361 exists only when the initial resolution fails, then disconnects on first successful resolution. There is no persistent replacement discovery after success, and a scroll/resize sync does not re-query children. Child identity is not an effect dependency. The RED cases hold the actual wrapper/mode/viewport stable, so they expose exactly that cache lifetime rather than triggering a new effect to conceal it. The passing initial-late-node case distinguishes working one-shot discovery from broken subsequent rebinding.

These are evidence for the public enabled composition's replacement behavior, not a claim that any given first-party workflow currently activates it. The normal disabled `DataGridPanel` path is deliberately **not** used to prove correctness of enabled public mode. Acceptance of the intended public child-replacement contract remains a product decision before a future candidate changes the owner.

## Cleanup passes and limits

Ordinary and StrictMode tests separately require exact removal of each passive viewport scroll handler, cancellation of an already pending RAF, zero owner targets after unmount, no resize delivery after disconnect, and no subsequent metrics-style writes. StrictMode proves an earlier header-owning observer was disconnected before the live observer. Unmount before initial discovery requires its still-active discovery observer to disconnect and its pending frame to cancel.

Every selected test, including all five RED cases, runs post-unmount assertions **before** force-restoring infrastructure: zero resize targets, mutation targets, and queued frames, with every tracked observer disconnected. Test-owned mutation witnesses are explicitly disconnected as test resources, not credited to product cleanup. Both cleanup characterizations report zero targets/frames; StrictMode records two passive registrations versus one ordinarily. See test lines 80 and 260 and the extracted cleanup records.

This is bounded jsdom/infrastructure evidence, not real-browser layout/scheduling certification. Horizontal overflow is intentionally absent even in `both` mode. Horizontal-bar/footer identity replacement, sticky/mode toggles, absent observer APIs, drag/pointer-capture/body-style ownership, post-disconnect callback races outside valid platform delivery semantics, and exhaustive lifecycle coverage remain untested. No full unit suite, typecheck, build, formatter, scanner audit, browser journey, or deployment was run for this reproduction. The broader qualification's full proposed lifecycle matrix is not claimed complete.

## Frozen inputs and lifecycle steering

[final-before-freeze.json][before-freeze] and [final-after-freeze.json][after-freeze] contain full source and existing harness inventories, 158 control hashes, qualification-report hash, installed dependency entry/manifest hashes, and four executable-input hashes. [final-summary.json][summary] has all nine before/after comparisons true: frozen binding, source, existing tests/harness, HEAD, branch, Git index, qualification report, own inputs, and dependency inputs. It counts 2,379 source files and 1,719 existing test/script/root-harness files. The existing read-only binding helper validates the round13r2 manifest's 1,038 entries and frozen diff; this is not a fresh scanner collection.

| Frozen identity                | SHA256 / value                                                     |
| ------------------------------ | ------------------------------------------------------------------ |
| HEAD / manifest base           | `8368004b339384eb98129a086ca71b7db88534ed`                         |
| Branch                         | `t3/admin-ux-round12`                                              |
| Round13r2 manifest             | `27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0` |
| Frozen diff                    | `8061b8fde771136891d4baf152062c613d1c7a7352040d4b66f14feea5239b6b` |
| Full source inventory          | `a4b92ea2ba382845a752f0b64094632b40c6f8a4f35c370dabd7a8bb522e6cc3` |
| Scroll-area source             | `4c9693dd9fbc7a1d90ff31efbc8d9c6af59e0a9300efffca9a01436fc561d235` |
| Provider source                | `4c56b19e412c915b8be154520a0d820f1fbd71b9a34426983a56b2275d12d528` |
| Actual internal engine source  | `c5adf33835dfc197b34698fda87c628e532dddf088eb5c59a2e45fb30290a87f` |
| Completed qualification report | `cd3ad8f528691afad4e1bd900e0499bc19af5f4ee5100e22e64318e711be56d1` |
| Git index                      | `6bbc6569730f496e067bb56e7dc3ca0d341ce33190ed8a1dcb74c9689fca8a17` |

| Preserved executable input | SHA256                                                             |
| -------------------------- | ------------------------------------------------------------------ |
| `grid-rebinding.test.tsx`  | `3c45d4162a9ed463603b9de206d8bbc08d204a6b658c000faf54680e484bbc10` |
| `dom-infrastructure.ts`    | `d405812388419ece38d6c3399b4715a8432b07694af782d26ccb085a7af2c3ae` |
| `vitest.repro.config.mts`  | `a4df002989fb12ba7e78839497a64f91eb635391e79e61335c51cce04da4fca2` |
| `run-evidence.mjs`         | `09a411e8146e797b6eff673e7f6b3a69fd5fc0f2fed7a504bc3746ae1a72591c` |

Installed execution inputs: Node 24.22.1; Bun 1.4.3; React/React DOM 19.3.1; Vitest 5.0.5; Vite 8.3.5; jsdom 30.1.3; Testing Library 16.3.3; React Vite plugin 6.1.2; TanStack table 9.3.1; Base UI 1.9.0. Bun is an inventoried checkout tool, not the process executing these Vitest invocations.

After the user's root-lifecycle steering that collectors/installed Studio journeys had ended, current inputs were preserved again at **2026-11-12T00:31:39.346Z** in `lifecycle-preservation.json`. `lifecycle-summary.json` records zero source, existing harness/test, control, executable-input, or dependency changes from the authoritative final snapshot; qualification and index are unchanged. Its focused inventories include nine shared-grid source files and ten grid-named existing test/harness files; these name-filtered lists are a convenience, not a complete dependency-closure claim. The contemporaneous read-only global binding check also exited 0, with exact command/stdout/stderr in `lifecycle-global-binding.*`.

The separate `final-session-comparison.json` shows source/existing harness/Git/qualification unchanged from the first attempt through the final test run. Owned test/infrastructure/runner inputs did change during development; they are **not** described as immutable across all attempts.

This report makes no timeless full-candidate binding claim. The user has announced subsequent intentional Email/PDF/Support and harness work by other workers. If a later global gate differs, retain the historical final-run binding and record the later exact path/hash delta separately; do not relabel a drifted candidate as unchanged, and do not attribute unrelated changes to this reproduction. The runner fails closed against a changed full binding rather than silently rebinding this evidence. Both shared grid owners and dependent grid source/tests stayed untouched through the preserved snapshots. A later global mismatch is neither a new G2 test failure nor grounds to overwrite this evidence.

The final structural handoff snapshot at **2026-11-12T00:38:43.015Z** is `handoff-preservation.json`; `handoff-summary.json` again lists zero source/harness/grid/executable/dependency changes, global binding exit 0 with the same final binding, and unchanged HEAD/branch/index. It independently rehashes eight saved command stream pairs, verifies the final 0/1 exits and nine comparisons, and checks all 11 zero-target post-unmount audits plus the four replacement/rescue observations. No tests were rerun after the executable inputs were preserved. `artifact-hashes.json` indexes the owned evidence files, excluding itself.

## Exact commands, output, and development history

Working directory for every execution is the r12 checkout above. The exact authoritative wrapper invocation was:

```powershell
node docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-repro/run-evidence.mjs final
```

It writes artifacts exclusively with create-new semantics. Do not reuse `final` or any existing label. For a separate authorized replay, use a fresh label; expect exit 1 on these same frozen inputs. The wrapper runs two actual Vitest subprocesses; [final-characterization.command.json][characterization-command] and [final-rebinding.command.json][rebinding-command] preserve the exact resolved executable, full argv, cwd, UTC start/end, exit/signal/error, and stdout/stderr hashes. Their argument vectors include `--configLoader runner`, `--no-cache`, `--no-fsModuleCache`, owned `--fsModuleCachePath`, one worker, no file parallelism, verbose/no-color output, and the separate name patterns. Raw streams remain byte-hash-bound UTF-8 logs; no redacted or summarized replacement stands in for those logs.

Characterization stdout SHA256: `80c56ad795ce7c098f0482f811b4b5236af760146d0eced1374621fc0a1d89f3`; stderr is empty (`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`). Rebinding stdout: `177ef868a2603e396a8bb83cd1ae749e376b6bcdb38fc967c3482acf42a58ca2`; stderr: `ed4e1bcc94f004497ef2fb093016e37b8dc458a408bf8c79a8d434d884e312a1`. These hashes were independently recomputed from the saved final logs.

Earlier attempts are preserved, not deleted or retroactively presented as valid runs:

- `attempt1` / `attempt2`: import/export-resolution suite errors; no cases executed. A failed Windows patch-wrapper attempt left the second run with unchanged inputs. These are infrastructure failures, not product RED.
- `attempt3`: replacement assertions failed, but missing jsdom `getAnimations` produced unhandled errors. It is not clean passing cleanup evidence.
- `attempt4`: clean split execution, before detached geometry was made more faithful to native zero geometry.
- `attempt5`: dependency metadata lookup hit package.json export restrictions before Vitest; no test run. `attempt5-runner-failure.txt` explicitly disclaims byte-exact stderr capture.
- `attempt6`: faithful test/infrastructure results, but its wrapper normalized the intentional RED to process exit 0. Its per-Vitest exits are recorded; it is superseded by `final` for exit-propagation evidence.
- `final`: unchanged faithful test/infrastructure, corrected wrapper exit propagation; authoritative 6-pass / 5-fail split, all nine binding comparisons true. No forced `it.fails`, expected-failure annotation, owner replacement, or unconditional failing assertion is used.

No GREEN product fix exists in this artifact. The preparatory reproduction is complete; future owner work must use a separately identified candidate, supported child-replacement intent, and its own verification. The completed qualification and scanner status remain unmodified.

[test]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-repro/grid-rebinding.test.tsx:1
[red-assertion]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-repro/grid-rebinding.test.tsx:164
[config]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-repro/vitest.repro.config.mts:1
[infrastructure]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-repro/dom-infrastructure.ts:1
[owner-cache]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx:221
[owner-effect]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx:296
[characterization-command]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-repro/final-characterization.command.json:1
[rebinding-command]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-repro/final-rebinding.command.json:1
[characterization-output]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-repro/final-characterization.stdout.log:1
[rebinding-output]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-repro/final-rebinding.stdout.log:1
[rebinding-errors]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-repro/final-rebinding.stderr.log:1
[observations]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-repro/final-observations.json:1
[before-freeze]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-repro/final-before-freeze.json:1
[after-freeze]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-repro/final-after-freeze.json:1
[summary]: C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-repro/final-summary.json:1
