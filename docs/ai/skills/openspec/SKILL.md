---
name: openspec
description: The starting point for anything OpenSpec. Use when the user asks for OpenSpec work without naming a skill, is unsure how to do something in OpenSpec, asks where a change stands or what to do next, or asks for several OpenSpec steps at once. Also use when the user says "openspec" and no more specific OpenSpec skill fits.
allowed-tools: Bash(openspec:*), Bash(bun:*)
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  references: "4dc55c469b49"
---

<!-- CORE-OVERLAY-START -->

## This repository (Asymmetric-al/core)

These repo-owned sections sit above the official OpenSpec router. Reconcile this
overlay after upstream refreshes before running `bun run skills:sync`.

Use the locally pinned CLI only: `bun run openspec -- <command>`. Do not invoke
`@latest`. Core does not use Stores or custom schemas. Core curates this
`openspec` router and seven workflow skills (`openspec-explore`,
`openspec-propose`, `openspec-update-change`, `openspec-apply-change`,
`openspec-verify-change`, `openspec-sync-specs`, and `openspec-archive-change`)
and deliberately does not enable `openspec-new-change`,
`openspec-continue-change`, `openspec-ff-change`,
`openspec-bulk-archive-change`, or `openspec-onboard`. Never recommend
`openspec init`, `openspec update`, or `openspec config profile` against this
live customized repository. Resume or update an existing change rather than
recreating it, pass an explicit change ID before mutating operations, and never
archive unmerged or incomplete work. Follow `AGENTS.md` and
`docs/ai/rules/openspec.md`. Do not bypass TDD, exact `base-maia`, data-access
boundaries, security, or repository checks. Do not treat product runtime Eve as
a coding agent.

Allowed-tools metadata includes `Bash(bun:*)` so the local wrapper can run.

### Triggers

- The user asks for OpenSpec work without naming a specific skill, asks how
  OpenSpec works in Core, asks where active changes stand or what to do next,
  or asks for multiple OpenSpec steps in sequence.
- Numbered commands `/1-start-project` through `/4-close-project` remain the
  wrappers around the seven curated workflows.

### Workflow

1. Read `openspec/config.yaml`, `openspec/project.md`, and run
   `bun run openspec -- list --json` from the Core checkout before proposing or
   mutating work.
2. Answer status or how-to questions read-only from `references/` without
   starting unrequested mutations.
3. Route work to the matching curated Core workflow skill, resuming any
   existing active change instead of recreating it.
4. Keep Core TDD, UI, data-boundary, and Guardian rules in force, and leave
   changes active until implementation has merged.

### Checklist

- [ ] Local pinned CLI used via `bun run openspec --`
- [ ] Existing active changes checked before creating a new change
- [ ] Explicit change ID used for mutating operations
- [ ] Stores, custom schemas, and uncurated workflows were not enabled
- [ ] `openspec init`, `openspec update`, and `openspec config profile` were not run or recommended
- [ ] Incomplete or unmerged work was not archived
- [ ] Product Eve was not treated as a coding agent

<!-- CORE-OVERLAY-END -->

OpenSpec helps people and coding agents agree on what software should do, and keeps that agreement true as the code changes. Each change is planned as an update to the specs, reviewed before code is written, and merged into them once it is built.

You are the starting point for anything OpenSpec in this project. Work out what the user needs, then do one of three things: answer their question, hand the request to the skill that does it, or run several skills in order.

**How OpenSpec fits together**

- `openspec/specs/` says how the system behaves today.
- `openspec/changes/<name>/` holds one planned change: its proposal, spec updates, design and tasks.
- A change usually goes: explore (optional), propose, apply, verify (optional), archive. Archiving updates the specs and moves the change to `openspec/changes/archive/`.

**When the user is unsure**

If they ask where things stand or what to do next, read `references/where-things-stand.md` and follow it.

If they ask how OpenSpec works or how to set something up, read `references/answers.md` and answer from it.

**Pick the skill**

When the user asks for work, find the row that matches, then use that skill and follow its steps.

| The user wants to                                                             | Use                            |
| ----------------------------------------------------------------------------- | ------------------------------ |
| think an idea or problem through before deciding what to build                | `openspec-explore`             |
| describe what to build and get the whole plan: proposal, specs, design, tasks | `openspec-propose`             |
| start a change and write its plan one artifact at a time                      | `openspec-new-change`          |
| write the next artifact of a change                                           | `openspec-continue-change`     |
| write every remaining artifact of a change at once                            | `openspec-ff-change`           |
| revise the plan of an existing change                                         | `openspec-update-change`       |
| implement the tasks of a change                                               | `openspec-apply-change`        |
| check the code against a change before archiving it                           | `openspec-verify-change`       |
| update the main specs from a change and keep the change open                  | `openspec-sync-specs`          |
| finish a change and archive it                                                | `openspec-archive-change`      |
| archive several finished changes at once                                      | `openspec-bulk-archive-change` |
| take a guided first run through OpenSpec                                      | `openspec-onboard`             |

- If the request could mean more than one row, ask which, naming the choices.
- If a matching active change already exists under `openspec/changes/`, resume or update it rather than recreating it.
- If the skill for the row is not installed, say so. Core intentionally curates the `openspec` router and seven workflow skills (`openspec-explore`, `openspec-propose`, `openspec-update-change`, `openspec-apply-change`, `openspec-verify-change`, `openspec-sync-specs`, and `openspec-archive-change`) and does not enable `openspec-new-change`, `openspec-continue-change`, `openspec-ff-change`, `openspec-bulk-archive-change`, or `openspec-onboard`. Route to the matching Core skill instead, or read `references/without-skills.md` for repository-safe `bun run openspec --` steps; never suggest installing skills with `openspec config profile` or `openspec update`.

**Several steps at once**

If the request asks for more than one row, such as "verify this change, then archive it", do them in order, one skill at a time. Finish each before you start the next. Each skill's own rules still apply: when one tells you to stop and wait for the user, stop there and say what comes next.

**If this project does not use OpenSpec**

Run `bun run openspec -- list --json` from the Core checkout and confirm `root.path` identifies this repository containing `openspec/`. If `"root": null` is reported, treat it as a checkout or configuration error and stop: never run `openspec init` against this customized repository.
