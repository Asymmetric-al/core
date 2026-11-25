# Doing a step without its skill

Use this when the skill for a step is not installed. Each section is the CLI path for one skill. Run the commands from the project root and read their `--json` output. Core intentionally curates the `openspec` router and seven workflow skills and does not enable `openspec-new-change`, `openspec-continue-change`, `openspec-ff-change`, `openspec-bulk-archive-change`, or `openspec-onboard`. Never suggest installing them with `openspec config profile` or `openspec update`.

## openspec-explore

Exploring is a conversation, not a command. Read `bun run openspec -- list --json`, the specs that matter, and the code, then think the problem through with the user. Write no code and no change files until they decide what to build.

## openspec-propose, openspec-new-change, openspec-continue-change, openspec-ff-change

1. Check `bun run openspec -- list --json` first; if a matching active change already exists, resume or update it rather than recreating it. Otherwise start the change: `bun run openspec -- new change "<name>"`, using a short kebab-case name.
2. Run `bun run openspec -- status --change "<name>" --json` to see which artifacts are ready.
3. For each artifact you write, run `bun run openspec -- instructions <artifact-id> --change "<name>" --json` and follow its `instruction` and `template`. Write the file at its `outputPath`.
4. Repeat steps 2 and 3. Stop after one artifact for a step-by-step change; keep going until planning is complete when the user wants the whole plan.

## openspec-update-change

Read the change's files, revise the ones the user asked about, then run `bun run openspec -- validate "<name>" --strict` and fix what it reports. Change planning files only, never code.

## openspec-apply-change

Run `bun run openspec -- instructions apply --change "<name>" --json`, read the files it lists under `contextFiles`, then do the unchecked tasks in order. Tick each task in `tasks.md` (`- [ ]` to `- [x]`) as soon as it is done.

## openspec-verify-change

Read the change's tasks and specs, then check the code against each: every task done, every requirement and scenario implemented. Report what is missing. Change no files.

## openspec-sync-specs

No command updates the main specs and keeps the change open. Either merge each file under `openspec/changes/<name>/specs/` into the matching `openspec/specs/<capability>/spec.md` by hand and run `bun run openspec -- validate --specs`, or archive the change, which merges them for you.

## openspec-archive-change, openspec-bulk-archive-change

Core archives a change only after implementation has merged and become accepted repository reality; never archive unmerged or incomplete work on a feature branch. Confirm merge acceptance and completion with `bun run openspec -- status --change "<name>" --json` and `bun run openspec -- list --json`. If anything is unmerged or unfinished, leave the change active and stop. Once merged and accepted, run `bun run openspec -- archive "<name>" --yes` one change at a time; do not bulk-archive.

## openspec-onboard

Walk the user through one small change in their own project: explore it, propose it, apply it, archive it, using the sections above.
