# Upgrade OpenSpec to 2.0.0

## Why

Core pins `@fission-ai/openspec` at 1.14.3. The current release is 2.0.0.
Since 1.16.0, `validate --strict` fails a scenario that has no `WHEN` or
`GIVEN` step, and the rule has no configuration switch. Two generated
projections fail it: all 1,240 scenarios of `add-files-documents` and 485 of
the 777 scenarios of `add-missionary-workspace-depth`. Their renderers emit a
trigger only when the canonical criterion literally reads "Given…, when…,
then…".

Staying on 1.x keeps Core off the maintained release and off its fixes:
`instructions apply` cutting off multi-line tasks, a phantom code fence that
hid every later requirement from validation, and unrecognized delta sections
that passed with a warning and were dropped at archive.

## What Changes

- The Phase 28 and Phase 29 renderers give a criterion that states no trigger
  its owning story, verbatim, as the scenario's `GIVEN` step. The two
  projections are regenerated. Nothing else in them changes.
- One reviewed cohort moves to 2.0.0: the exact pin and lockfile, the refresh
  tag, the seven imported skills with their mirrors and audit hashes, and the
  pin test.
- `docs/ai/rules/openspec.md` states how an upgrade moves and what
  `openspec update` does here. `docs/ai/document-authority.md` states the
  trigger rule next to each renderer.

## Non-goals

- No durable requirement changes. The accepted `agent-instruction-system`
  spec already requires an exact pin, the seven selected skills and strict
  validation, and this change applies the maintenance requirements merged
  with `modernize-openspec-current-contracts`.
- No canonical PRD volume, contract companion, traceability file or dated
  publication record changes.
- No acceptance criterion is rewritten as Given/When/Then. That is a
  domain-owner authoring job.
- `openspec update` is not run. The 2.0 skill layout, its links and the
  optional workflows are not adopted.
- `--strict` is not relaxed.

## Impact

Affected capability: `agent-instruction-system`, with no requirement change.
The change touches two source-owned renderers and their two generated specs,
the root manifest and lockfile, the refresh script, seven canonical skills
and their mirrors, two hash-bound ledgers that record the manifest and
lockfile, one unit test and two instruction documents. There is no product
runtime change. Rollback reverts the cohort commit; the regenerated
projections also validate on 1.14.3 and can stay.
