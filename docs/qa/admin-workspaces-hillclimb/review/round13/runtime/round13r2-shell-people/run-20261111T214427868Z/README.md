# Round13r2 Shell/People fresh retry: blocked before collection

Status: **INCOMPLETE / INCONCLUSIVE**, November 12, 2026 (Asia/Bangkok). Chrome discovery is verified, but no Shell/People capture or check collector was launched. No UI finding, image inspection, visual score, or acceptance claim is established.

## Scope and frozen identity

- New attempt only: `run-20261111T214427868Z` in the authorized r12 checkout. Prior `run-20261111T205903126Z` is unchanged.
- `round13r2`: 1,038 entries; manifest SHA-256 `27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0`.
- Diff SHA-256 `8061b8fde771136891d4baf152062c613d1c7a7352040d4b66f14feea5239b6b`; batch-plan SHA-256 `feca3e2985c7aff03b7267a6d503cab437538fbe87903752c9c608992378166b`.
- Expected: Shell 13 states / 19 pairs / 30 PNGs; People 21 states / 34 pairs / 55 PNGs. Total: 10 batches of at most four states, 20 collector invocations, 53 state/width pairs, 85 PNGs.
- All declared widths remain unchanged: desktop 1440x1000, intermediate 1024x900, small-tablet 640x900, mobile 390x844. See `batch-expectations.json`.

## What passed

The direct repository `playwright-core` smoke launched `chromium.launch({ channel: "chrome", headless: true })`, reported Chrome `157.0.8103.50`, closed its browser, and exited 0 in 903 ms under a 60-second bound. Exact command, PID, times and logs are in `chrome-launch-smoke.*`.

Every launched child received process-only `PROGRAMFILES=C:/Program Files`, `PROGRAMFILES(X86)=C:/Program Files (x86)`, `LOCALAPPDATA=C:/Users/Conrad/AppData/Local`, and `CAPTURE_BASE_URL=http://localhost:3031`. The remaining environment used a system-variable allowlist. No environment file, install, relink, fallback executable, or lockfile was changed.

Six recorded read-only freeze gates passed: initialization, both scheduling attempts before/after, and handoff. Each reports 1,038 files with empty mismatches and extra. All 102 first-party/control input hashes stayed unchanged; input-set SHA-256 is `77d080aa4bd13fbc74358ae042f98cfdea63b461655368dfada439921593150e`.

The import traversal initially classified the verifier relative import of the installed Zod directory as unresolved. `input-import-resolution.json` resolves this existing installed dependency, records version/package/entry hashes, and identifies zero unresolved first-party imports. Original records remain intact; no helper changed. Supplemental installed-dependency checks passed before/after the later scheduling attempt and at handoff.

A bounded HEAD probe on localhost:3031 returned 307 to `/login?next=%2F`. This establishes reachability only, not server build/start/cache identity. The existing runtime was untouched.

## Collection stop boundary

`runtime/refreeze/fresh-evidence-plan.md` section 4 requires one collector process at a time, with no parallel collectors. Other owners were collecting CRM, Studio and Support/Tools. Their processes were observed read-only and never interrupted.

The first empty process-list observation was followed by another collector before launch. `shell-01.summary.json` preserves that scheduling rejection. No collector or candidate output directory was created.

A second bounded availability wait required 30 continuous quiet seconds. It ran from `2026-11-11T21:56:12.401Z` to `2026-11-11T22:00:22.071Z`, inside the original availability deadline `2026-11-11T22:04:34.821Z`. Another collector then resumed between availability and launch; `shell-01.collection-summary.json` preserves the second rejection. Again, no collector launched.

At the stop observation, PID 34444 was running the other owner committed `check-workspaces.mjs` for CRM `crm-gift-row-menu`, writing to `round13r2-core/invocations/crm-5.crm-gift-row-menu-check/artifacts`. See `collection-stop-concurrency.json` for its exact observed command. This is a scheduling conflict, not a Shell/People behavior or Chrome failure.

The global deadline remains `2026-11-12T05:44:27.868Z`, initialized once. No clock was reset, no automatic collector retry ran, and no existing process was killed. A coordinated exclusive runtime window is required before further collection; the serial-collection requirement was not silently relaxed.

## Missing evidence and limits

- Committed capture/check invocations: **0 / 20**; metric pairs: **0 / 53**; check pairs: **0 / 53**; PNGs: **0 / 85**.
- Fresh invocation-specific fixture proofs: **0**. There was no collector invocation to execute its mandatory preflight; no historical proof was copied into this attempt.
- `pair-inventory.json` retains every expected metric/check key and image name, empty observed sets, and explicit missing sets.
- Image inspection was **not performed**, because this attempt produced no images. Axe, overflow, row rendering, dialog containment, keyboard reach, Escape, intended flyout/tab setup and loaded-data financial transport remain unverified.
- Reachability and the source freeze do not independently attest the already-running runtime/cache identity, production readiness, financial correctness, or tenant/provider integration.

## Preservation and handoff

Before/after SHA-256 inventories prove the prior failed attempt file set and bytes are unchanged. New writes are confined to this attempt. No source, test, harness, ledger, environment-file, Git, server, provider or delegated-child changes were made. Concurrent owners outputs were not modified or copied into this attempt.

`result.json` records the incomplete outcome. `invocation-inventory.json` distinguishes the two rejected scheduling checks from actual collector invocations. `artifact-hashes.json` inventories this attempt, excluding only itself.
