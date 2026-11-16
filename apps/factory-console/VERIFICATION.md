# Verification · 11 November 2026

Scope: `apps/factory-console/**` only (the parent owns `tests/live/**`). No
commits, pushes, deployments, root manifest/lock or `packages/ui` changes. The
Console reads the real backend contract (Archon HTTP + Archon state documents
through the Archon CLI) and performs every operator effect through
`control.mjs`.

## Results (local, Windows 11, Bun 1.4.3, Node 24.22.1)

Working directory `apps/factory-console`, run after the last source change.

| Command                                 | Result                                                                                                                            |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `bun run test`                          | PASS: 12 files, 115 tests                                                                                                         |
| `bun run typecheck`                     | PASS, but with TypeScript 6.0.3: `bun.lock` lacks the Console's pinned 7.0.2, so the workspace link resolves 6.0.3 (parent-owned) |
| `bun run lint`                          | PASS: 0 errors, 0 warnings (shared Next/TypeScript/design-system rules)                                                           |
| `prettier --check apps/factory-console` | PASS for every source file (only the gitignored `test-results/` Playwright artifacts are reported)                                |
| `bun run build`                         | PASS: `/` partial prerender, `/api/console/[...path]` dynamic, Proxy; standalone `server.js` emitted                              |
| `bun run test:e2e`                      | PASS: 50 tests (25 journeys × desktop Chromium and iPhone 13 Chromium) in 6.4 min                                                 |

The previous run's only failure, `[mobile] records.spec.ts › performance counts
verified deliveries…` (axe `scrollable-region-focusable` on the overflowing
owners table), is fixed by the owners list that replaced that table; it passes
on both projects. The disconnection journey still matches after the snapshot
error switched to `failureText`.

## What changed in this pass

- **Lifecycle contract.** Issue action `reconcile` (exact argv
  `issue <n> reconcile --request <id> --by <owner>`, not destructive) with an
  explanation for every refusal it or a claim can record (`not-active`,
  `lease-live`, `run-not-terminal`, `run-changed`, `run-unconfirmed`,
  `unreconciled-run`, `lease-held`, `terminal`, `no-route`, `policy-changed`,
  `assignment-mismatch`). The issue sheet disables it while the round's lease is
  live. Work items now show `blocker.route` (what retry resumes),
  `workRounds`/`feedbackRounds`, `lastRefusal`, `parked` areas and holders,
  history outcomes `parked`/`reconciled` and `external`, and request notes
  `{policy:{from,to}}` (profile digests stay on the server; only "owner profile
  re-bound" is shown).
- **cancel-run result.** ok only when the run ended and no labelled executor
  container remains. The receipt reports removed and remaining containers, the
  issue control.mjs held first, and re-reads that issue. New outcome
  _incomplete_ (containers remain) and _unknown_ (containers could not be
  listed) both offer a same-id retry; the docker error text is never forwarded.
- **Readiness facts.** `pr.mergedBy`, `mergeRequest`, `pending` base
  integration, `onTarget`, `issueClosed`; feedback dispositions with `kind`,
  `status` (fix pending / fixed), `fixedIn`, `resolvedAt`. Deliberately
  stripped and tested: `lastComment`, the disposition's GitHub `updatedAt`, the
  PR `nodeId`, `run.head`. An unknown fix status reads as not recorded.
- **Protected paths (I11).** `core/scope.allowProtected` is shown read-only in
  the issue sheet; a malformed grant reads as none, never wider.
- **Read models.** History & decisions and Checks & reviews carry the re-binding
  note, fix state and "merged outside the factory"; `mergedOutside` also trusts
  a round's `external` record.
- **Stale Performance.** Performance now says when its own read is stale (two
  missed one-minute reads) and offers a refresh, like the ledger views.
- **Display.** The feedback dispositions table became a list (no scrollable
  region on phones); cancel copy says the issue is held and containers removed.

## What the tests establish

- **Adapters** (`tests/adapters.test.ts`): exact argv, minimal child
  environment, bounded failures without stderr, at most three concurrent CLI
  processes, configuration, every documented control.mjs result shape including
  cancel-run's terminal/accepted/refused runs, removed/remaining/unlisted
  containers and the held issue, signed request ids, a process that never
  started vs one that ran.
- **Contract** (`tests/contract.test.ts`): review route, two-list and legacy
  repairs, parked rounds, external merges (PR record and round record),
  per-issue end states, lifecycle facts (blocker route, budgets, last refusal,
  request notes with profile digests withheld, malformed notes dropped instead
  of the item), parked/reconciled/external history, readiness facts, fix state
  with comment identities stripped, the reconcile control end to end, and
  protected-path grants.
- **Factory service** (`tests/factory.test.ts`): snapshot composition,
  independent availability, malformed documents listed, nothing private
  forwarded, each control's argv and receipt, idempotent retries, refusals,
  confirmation and owner gates, cancel through the server API with the held
  issue read back, leftover containers retried with the same id, analysis,
  chat, proposals.
- **Read models** (`tests/read-models.test.ts`), **routes**, **round
  derivation**, **timing**, **performance** and **scale** as before.
- **Browser** (`tests/e2e/*.spec.ts`): every journey on desktop and phone width
  with axe serious/critical checks, no horizontal overflow, destructive
  confirmations, lost responses retried once, disconnection, unavailable state,
  staleness (snapshot and Performance), identity change, keyboard focus, tab
  navigation, dark mode on every tab and the issue sheet, and
  `tests/e2e/lifecycle.spec.ts`: the lifecycle and readiness facts in the issue
  sheet (light, then dark with reduced motion), reconcile disabled under a live
  lease and recorded on an idle issue, cancel naming the held issue and removed
  container.

## Not established here

- Behaviour against VM 100's real Archon CLI output, real `control.mjs`,
  webhook starts and `core-answer`/`core-analyze` runs. The fixtures mirror the
  documented contract only; live qualification is parent-owned.
- A Console control for `control.mjs allow-protected` (shown read-only).
- Live screen-reader use, 200% zoom and long-running memory.

## Parent recheck after lockfile repair

On 11 November 2026 the parent reran the integrated Console unit suite: 12
files, 115 tests passed. `bun run typecheck` also passes after adopting Bun
1.4.3's generated lockfile, with the Console resolving its declared TypeScript
7.0.2. This supersedes the compiler-resolution caveat in the earlier results
table; the build and browser counts above remain evidence from that earlier
run. No new live-backend qualification is implied.
