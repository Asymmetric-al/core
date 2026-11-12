# Offline helper verification

Status: helper-only verification, local date 2026-11-12 (Asia/Bangkok). **No live collector validation, real aggregation, browser/fixture/runtime qualification or readiness verdict.**

## Ownership and inputs

Only new `aggregate.mjs`, `verify-offline.mjs`, `README.md` and this report are owned in `runtime/round13r2-aggregation/`. Existing collector outputs were not inspected, watched, inventoried, rewritten or copied. No child agent, listener, server, browser, fixture preflight, provider operation, Git command, source/test/harness/ledger/freeze edit or actual candidate assembly was used.

Applicable r12 `AGENTS.md`, testing/general/protected-path rules, OpenSpec project/surface intent, TDD/verification guidance, `runtime/refreeze/fresh-evidence-plan.md`, catalogue/plan and actual capture/check/preflight/result/freeze schemas were read. Catalogue constructors were evaluated without running setup functions. The helper reads saved freeze results and frozen-source bytes; it never executes the Git-using freeze verifier.

Static production `--catalogue` inspection confirms **131 states, 234 state-width pairs, 319 PNGs (234 viewport + 85 full), 36 batches** and all seven areas' exact sets against the unchanged plan. All 1,038 listed frozen-source hashes/absences matched during this inspection. The 17 current harness/catalogue/fixture-input hashes are emitted in the CLI's `identity.inputHashes`; this check is not evidence that a particular build/runtime served them.

| Static input              | SHA-256                                                            |
| ------------------------- | ------------------------------------------------------------------ |
| Frozen round13r2 manifest | `27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0` |
| Frozen diff               | `8061b8fde771136891d4baf152062c613d1c7a7352040d4b66f14feea5239b6b` |
| Unchanged bounded plan    | `feca3e2985c7aff03b7267a6d503cab437538fbe87903752c9c608992378166b` |

The manifest SHA was independently re-read with `Get-FileHash`; it was not rewritten or refrozen.

## Executable synthetic verification

Command from the r12 checkout, Node 24.22.1:

```powershell
node docs/qa/admin-workspaces-hillclimb/review/round13/runtime/round13r2-aggregation/verify-offline.mjs
```

Latest behavioral run completed successfully at `2026-11-12T04:57:05+07:00`, with **40 PASS checkpoints** and exit 0. It builds only tiny synthetic evidence under a newly created `.offline-selfcheck-*` directory inside the owned aggregation directory. Its own root-confined cleanup removes only that run's synthetic directory. The synthetic catalogue has two states, three pairs, five PNGs and two batches; it deliberately does not resemble real completed collector evidence. Synthetic assembly writes only into that synthetic repository's absent candidate, never the real candidate.

Covered rejection/safety cases:

- Missing input contract or invocation; duplicate output directory/state ownership; incorrect collector ownership; missing width; duplicate checker pair or JSON property.
- Wrong frozen identity, current frozen-product byte drift, independently changed harness input, stale or wrong-checkout/failed preflight, wrong argv, unterminated or timed-out process, stale collection cutoff and inconsistent fixture bundle.
- Missing/extra/tampered/truncated PNGs and incorrect dimensions; unsafe relative inventory paths and symlink/junction directory refusal.
- Unexpected route boundary, absent required dialog, setup warnings, missing completion log and log/measurement mismatch.
- Wrong source identity or failed freeze seal, missing/tampered original source records and proof reuse across invocations. Root-normalized source adapters are accepted only with retained original references and visible normalization warnings.
- Axe findings/incomplete IDs remain attributable warnings; an automated finding is not silently dropped or called an accessibility pass.
- Validation and invalid authorization create no candidate. Wrong root working directory rejects. Explicit digest-gated synthetic assembly preserves original PNG bytes, refuses an existing destination and rejects changed evidence before destination creation.

TDD evidence includes a failing missing-helper/contract tracer before initial implementation. An additional frozen-product-drift case failed as expected (`VALIDATED` instead of required `REJECTED`) before direct listed-source byte verification was added, then passed after the fix. A transient missing-brace syntax regression in the source-seal adapter loop was repaired before the successful run. No failure was hidden by modifying real collector evidence or a harness.

`node --check` passed for both new `.mjs` files. Scoped `bunx --no-install prettier --check` passed for all four new helper/report files after formatting only those files. No repository-wide fix/format/build/test command is needed or claimed. App/harness/browser suites were not run under this offline-only authorization.

## Handoff and unresolved root decisions

The exact deferred root validation/assembly commands and all JSON contracts are in [README.md](README.md#5-exact-later-root-commands). No real descriptor, runtime attestation or source seal was authored; no real collector directory was validated.

Root still needs to establish completion and canonical attempts, immutable per-invocation phase snapshots, original time/source/freeze/preflight/log provenance, runtime/cache/CMS/effect identity and any explicitly justified scheduling exception. Raw original source records are retained/hash-checked but their unknown collector-specific contents are not automatically interpreted or authenticated. Current source hashes cannot prove historical runtime source, build freshness or absence of unmanifested additions. Semantic pixel/fixture/control correctness and the broader accessibility/live-journey limits remain manual qualifications. A structural `VALIDATED` result can carry product warnings and is never readiness.

If collectors retained only cumulative/shared results, missing proof snapshots, insufficient source observations or semantically failed setups, the helper intentionally rejects rather than constructing a plausible merged candidate. Root decides any new collection/freeze or destination-naming authorization; this task does not.
