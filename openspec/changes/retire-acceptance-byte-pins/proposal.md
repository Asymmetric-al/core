# Proposal

## Why

Acceptance tests under `tests/unit/acceptance` fail when a file's bytes change,
not when behavior breaks. Several hash `.github/workflows/ci.yml`,
`.github/workflows/ci-integration.yml` or `docs/ci.md`, keep lists of
"reviewed" fingerprints, pin step positions, or re-check that an
already-merged change touched nothing else. Every later CI or docs edit must
re-pin them, so their main failure mode is their own bookkeeping. They also
block the follow-on CI work (issues #2707, #2710, #2711, #2708).

## Authority

The owner ruled on 2026-11-18. Step 2 as offered: "One ruling that retires
the Shadscan gate and hashes, the React Doctor ledger (PR #2705) and the
fingerprint comparisons. Adopt only the retirement part of the Shadscan
change; its jsx-a11y baseline is a new ledger." Owner: "Do #2".

This change carries out the "fingerprint comparisons" part of that ruling for
the acceptance suites (issue #2706). The Shadscan and React Doctor parts
belong to other changes. The owner also said: "work carefully to not break
anything or cause any regression in quality."

The ruling as offered names fingerprint comparisons only. This change also
removes assertions that are not fingerprints: opt-in and merge-base
diff-scope checks of merged changes, pinned step positions and exact `run:`
strings in the `migrate` job, and git-blob "unedited" pins, including pins on
product files in issue-2258 and issue-2364. The plan shown to the owner the
same day, and issue #2706, described the scope as hash, fingerprint,
byte-identity and diff-scope assertions. The owner has not ruled on that
wider reading; confirmation is requested on the pull request. Until then,
the removals beyond fingerprint comparisons rest on that reading, not on a
ruling.

For the fingerprint comparisons, the ruling authorizes editing acceptance
files whose headers say they are owned by Acceptance and must not be edited
by implementers; that authority is recorded here once, not in each file. For
the wider removals, editing those files rests on the same pending
confirmation.

## What Changes

- Delete acceptance assertions that are bookkeeping only: whole-file hashes or
  fingerprints, byte-for-byte comparisons with a stored copy, "nothing else
  changed" or diff-scope checks of merged changes, and pinned line numbers or
  step positions.
- Where such a pin stood in for a real invariant, replace it with the semantic
  assertion (for example: a verification step exists in the required job, is
  not `continue-on-error`, and runs the named files with nothing else on its
  run line).
- Keep every behavioral assertion, every real-database test and every
  structural security invariant unchanged. Keep a hash where the hash is the
  behavior under test.
- Name every real-database acceptance file and assert that one blocking
  `migrate` step runs it with the database URL it reads, since each one skips
  without that URL.
- Add one structural test that fails when a required CI check, or a job it
  needs, can no longer fail: `continue-on-error`, a run line that swallows
  failure, a step that never runs, a reusable-workflow call, a required job
  whose own condition can skip it, a gate that stops needing or reading a job
  it gates, a gate that can be skipped, or a required job id that disappears.
- Tell acceptance authors to assert behavior and structure, never bytes, and
  that a diff-scope check belongs in review, not in a permanent test.

## Non-goals

- Changing any workflow file, `docs/ci.md`, branch protection or review
  automation.
- Retiring hashed ledgers outside the acceptance suites (Shadscan, React
  Doctor, the factory role manifest).
- Removing exact job inventories or other semantic assertions that later
  workstreams may need to update.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-instruction-system`: adds a requirement that acceptance tests assert
  behavior and structure rather than bytes, and that required CI checks stay
  blocking under a structural test.

## Impact

- `tests/unit/acceptance/**` (assertion deletions and semantic replacements),
  including the shared step check `tests/unit/acceptance/shared/realstack-step.ts`
  and its test `realstack-step.test.ts`.
- New `tests/unit/workflows/required-ci-checks.test.ts` and its helper
  `tests/unit/helpers/required-ci-checks.ts`.
- Acceptance-authoring guidance: `docs/ai/rules/testing.md` and the factory
  Ezra role (`.codex/agents/ezra.toml`,
  `scripts/archon-factory/pack/.shared/roles/ezra.md` and its manifest).
- Rollback: revert the change's commits; the deleted assertions return as
  they were.
