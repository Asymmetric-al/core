## Context

`modernize-openspec-current-contracts` (AL-2170) set how Core upgrades
OpenSpec: one reviewed cohort, the established refresh and sync paths, strict
validation kept on, and no `openspec update`. `upgrade-openspec-2` (AL-2661)
applied it for 2.0.0. This change applies it for 2.1.0.

Release 2.1.0 is tag `v2.1.0` at
`8bd4b3557b5bf1d231cd2f165b28f24e2d90a2a0`, published 2026-11-17. There is no
2.1 patch release. A comparison of the published 2.0.0 and 2.1.0 packages
found the validator, parsers, schemas, spec merger and every command module
byte-identical. The changes are in `init`, `update`, the configuration schema
(`skillsScope`) and skill delivery. Core runs none of the changed commands.

## Decisions

### Keep Core's ownership path

2.1 can install skills per machine, and its documentation says the updater
replaces each built-in skill folder whole. Core's seven skills carry an
overlay, a wrapper permission and a project check that such a replacement
would drop. So the skills stay in the repository and are refreshed only by
`scripts/refresh-upstream-skills.mjs --only=Fission-AI/OpenSpec`, then
`bun run skills:sync`.

Alternatives considered:

- **Global skills.** A clean or hosted checkout would have no OpenSpec skills,
  and Core's overlay would have no home.
- **The Skills installer with `--scope project`.** It would be a second writer
  to the mirrors that `skills:sync` owns, with no overlay step.
- **Move the overlay into `openspec/config.yaml`.** 2.1 adds only
  `skillsScope` to that file. `context`, `rules` and `operations` reach an
  agent through `openspec instructions`, after the skill has already told it
  which CLI to call and whether to look for a Store. Explore, Verify and Sync
  never fetch artifact rules.

### Record `skillsScope: project`

It is the upstream record of what Core already does. Only `openspec update`
reads it, where it suppresses the offer to move a project's skills to the
machine. It does not stop the updater replacing skill folders, so the ban on
running the updater stays.

### Remove adaptations that 2.1 makes redundant

Three replacements rewrote upstream references to the Continue and New
workflows. 2.1 removed those references and gives the CLI recovery commands
itself, so the replacements match nothing and are deleted. The bare
`openspec …` commands upstream now prints are left as they are: the skills
already contain many, and the overlay's first rule sends every one through
`bun run openspec --`.

Two replacements are added. 2.1's Update workflow suggests the raw
`openspec archive` command once work is "done and implemented"; 2.0 pointed at
the archive workflow. Core archives only merged, accepted work, so the adapter
restores that condition and the workflow hand-off. And 2.1's Apply workflow says to "keep the selected
store on any follow-up command". Core does not use Stores, and the sentence
has no `--store` token for the existing guard to catch, so the adapter removes
it and the refresh test asserts that. Descriptive Store prose that upstream
already carried in 2.0, such as "store-aware `planningHome.root`" in Sync and
Archive, stays: it says what a field means and does not route an agent to a
Store.

### Make the refresh host-independent

Running the refresh on Windows showed two faults. The script looked for
`node_modules/.bin/prettier.cmd`, which Bun does not create, so it skipped
repository formatting and wrote different bytes. And it cloned upstream with
the user's `core.autocrlf`, so the refresh test's fixture arrived with CRLF
and failed before reaching its assertions. The script now accepts
either Windows launcher name and checks upstream out with
`core.autocrlf=false` and `core.eol=lf`. The launcher lookup was exercised by the
real refresh on Windows; the unit fixture links the POSIX launcher only. With
both, six of the seven lock hashes equal an independent prediction made from
the 2.0.0 adapter and the 2.1.0 source; the seventh differs only by the
removed Store sentence.

A third fault showed in `skills:sync`. `.gitattributes` gave the mirrors an LF
rule but not `docs/ai/skills`, so 83 extensionless files such as `LICENSE`
were checked out with CRLF on Windows and copied into the mirrors that way.
Two payload-hash tests then failed on an unchanged tree. Canonical skill
sources now carry the same LF rule. Every committed blob was already LF, so no
file content changes.

### Leave the React Doctor ledger alone

`docs/qa/react-doctor/exceptions.json` binds `bun.lock`. Its hashes were
already out of date on `develop` before this change, no gate runs
`react-doctor:check`, and an open pull request requalifies that ledger claim
by claim. Rebinding one hash here would not make it valid.

## Risks

- **Lockfile growth.** 2.1 depends on `skills@1.8.1`, which brings `tar`,
  `nostics` and three small packages, and it moves to `chalk@6`. Bun hoists
  the new versions and nests the old ones under their existing dependents, so
  no current consumer changes version. Core's documented Skills CLI commands
  name `skills@1.5.7` explicitly and are unaffected.
- **Internal imports.** Core's contract and delta scripts import OpenSpec's
  parser and merger modules. They are byte-identical in 2.1.0, and the unit
  tests that exercise them run on the new pin.

## Rollback

Revert the cohort commit. The skills, mirrors, lock entries, audit records,
pin test and ledger hash return together.
