## Context

`modernize-openspec-current-contracts` (AL-2170) set how Core upgrades
OpenSpec: one reviewed cohort, the established refresh and sync paths, strict
validation kept on, and no `openspec update`. Its maintenance requirements
also say a presentation change must keep every binding clause, requirement
identity, scenario and acceptance identifier, and must not invent generic
scenarios. This change follows both.

A trial of 2.0.0 against `develop` at `14f8f215a` found one blocker. Strict
validation reported 1,725 warnings, all "scenario is missing a WHEN/GIVEN
step", in two generated projections. Everything else passed unchanged: the
archive audit, delta compatibility and the other scripts that import
OpenSpec's parser and merger, the phase checks, the CLI commands the imported
skills call, and a scoped refresh of the seven skills at tag `v2.0.0`.

## Decisions

### A criterion without a trigger takes its owning story, verbatim

The Phase 28 and Phase 29 renderers emit one added line for a criterion that
states no Given/When:

```
- **GIVEN** story US29-B01: <the story sentence from the canonical volume>
- **THEN** <the criterion, unchanged>
```

Every requirement in both phases has exactly one canonical story, so the
trigger is copied, not written. The criterion text, its identifier and the
requirement body are untouched. The body still incorporates its whole contract
without condition, so the story gives context and narrows nothing. The 292
Phase 28 criteria that already read "Given…, when…, then…" are projected as
before.

Alternatives considered:

- **Rewrite the criteria as Given/When/Then.** Best scenarios, but a
  domain-owner authoring job across 1,725 accepted criteria with a real risk
  of changing meaning.
- **A fixed generic sentence.** AL-2170 forbids inventing generic scenarios.
- **The story identifier alone.** Passes validation but tells a reader
  nothing; the story sentence is not otherwise in these specs.
- **Phase 27's form**, "the actor exercises this capability: <feature>".
  Phase 27 has a story registry with a verb-phrase `feature`. About two
  thirds of Phase 28 and 29 stories read "I want <thing> to …", so that form
  would need paraphrase.
- **Relax `--strict` or exempt the two changes.** The accepted spec requires
  strict validation.

The cost is repetition. A story sentence repeats on each of its scenarios,
and the two specs grow by about 60% (Phase 29) and 35% (Phase 28).

### The proof of no loss is byte identity

Each regenerated spec, with the inserted `GIVEN` lines removed, must equal its
previous version byte for byte, and each inserted line must equal its owning
story from `traceability.json`. The contract companions under
`openspec/contracts/`, both `traceability.json` files, both main PRD files and
the canonical volumes must be unchanged. Contract identifiers hash the
requirement body only, so scenario lines cannot move them.

`publication.json` (Phase 28) and `publication-review.md` (Phase 29) record
the bytes that were published or reviewed on their dates. They are dated
evidence, no gate reads them, and they stay as written.

### One cohort moves together

The pin in `package.json` and `bun.lock`, the tag in
`scripts/refresh-upstream-skills.mjs`, the seven imported skills and the pin
constants in `tests/unit/docs/openspec-modernization.test.ts` change in one
commit. `tests/unit/scripts/openspec-skill-refresh.test.ts` already fails
when the pin and the refresh tag disagree. The scoped refresh keeps Core's
overlays, wrapper permission and provenance, then `bun run skills:sync`
regenerates the mirrors.

### `openspec update` stays out

OpenSpec 2.0 keeps one copy of each skill in `.agents/skills/`, links it into
tool folders, and tells users to run `openspec update`. Core does not adopt
that layout. Linked skills need Developer Mode on Windows, and the accepted
spec requires each runtime mirror to hold the same canonical files. Core's
skills carry overlays and are refreshed and mirrored by its own scripts.

Run for real on 2.0.0 in a throwaway copy of this tree, with and without
`--force`, the updater changed one thing: it added
`.agents/skills/.openspec-target`, listing the seven skills as kept. It
modified no skill. It also asked to migrate `openspec/project.md` into
`config.yaml` and delete it; Core keeps that file as its index. The rulebook
records both, so an agent that follows upstream advice knows what the command
does here and that Core does not use it.

### Hash-bound ledgers follow the manifest and lockfile

`tooling/shadscan/findings.json` records the hash of `package.json`, and
`docs/qa/react-doctor/exceptions.json` records the hash of `bun.lock`. Both
are rebound after confirming the manifest change is the one pin line and the
lockfile change is confined to the OpenSpec record, as earlier dependency
changes did.

## Risks

- **A later upstream release tightens validation again.** The pin is exact,
  and the same trial (strict validation, archive audit, delta compatibility,
  scoped refresh) shows the cost before any change.
- **OpenSpec's private parser and merger modules move.** Three Core scripts
  and tests import them. They run in the gate, so a move fails loudly.
- **An agent follows upstream advice and runs `openspec update`.** Measured,
  it adds one marker file and changes no skill. The rulebook and the
  `openspec-update-change` overlay say not to run it.

## Verification

- Structural: byte identity as above; `render-spec.mjs --check` and the
  evidence verifier for both phases; `bun run openspec:validate` on 1.14.3
  after the projection commit and on 2.0.0 after the cohort commit;
  `bun run openspec:audit-archive`; `bun run verify:openspec-deltas`;
  `bun run skills:verify`; `bun run format:check`.
- Unit: the five OpenSpec test files, then the full suite in the pre-push
  gate.
- Before and after: strict validation on 2.0.0 fails with 1,725 warnings
  before the projection commit and passes with none after it.

## Rollback

Revert the cohort commit to return to 1.14.3. The regenerated projections
validate on both versions and can stay.
