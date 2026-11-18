# Upgrade OpenSpec to 2.1.0

## Why

Core pins `@fission-ai/openspec` at 2.0.0. Release 2.1.0 (AL-2693) moves
skill delivery to Vercel's Skills installer, defaults new installs to global
skills and rewrites the workflow hand-offs in all seven skills Core imports.
Staying on 2.0.0 leaves Core's copies naming optional workflows it does not
install and leaves three refresh adaptations that upstream has made redundant.

## What Changes

- One reviewed cohort moves to 2.1.0: the exact pin and lockfile, the refresh
  tag, the seven imported skills with their mirrors and source-audit records,
  the pin test and the manifest proof hash in the Shadscan findings.
- The refresh adapter drops three replacements that match nothing in 2.1 and
  gains one that removes the new Apply sentence about a selected Store.
- `openspec/config.yaml` records `skillsScope: project`, the 2.1 statement
  that Core keeps its OpenSpec skills in the repository.
- `docs/ai/rules/openspec.md` states what the 2.1 updater does here.
- The refresh script and skill sync produce the same bytes on Windows and
  Linux.

## Non-goals

- No durable requirement changes. The accepted `agent-instruction-system`
  spec already requires an exact pin, the seven selected skills, the local
  wrapper and no native updater against this checkout.
- Global skills, the Skills installer, Stores, custom schemas and the five
  optional workflows are not adopted. `openspec update` and `openspec init`
  are not run.
- Core's overlay, wrapper permission and project check in the seven skills
  are unchanged.
- No accepted spec, contract companion, PRD, archive or product code changes.
- `--strict` is not relaxed.

## Impact

Affected capability: `agent-instruction-system`, with no requirement change.
The change touches the root manifest and lockfile, the refresh script and its
test, seven canonical skills and their mirrors, the skills lock, the skill
source audit and maintenance log, the Shadscan findings ledger, the pin test,
`openspec/config.yaml` and one rulebook. The lockfile gains the release's new
`skills` dependency and its `tar` tree; no existing package changes version
for its current consumers. There is no product runtime change. Rollback
reverts the cohort commit as a whole.
