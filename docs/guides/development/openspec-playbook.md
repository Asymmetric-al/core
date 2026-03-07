# OpenSpec Playbook

This repository uses **OpenSpec** as the canonical spec-driven workflow for AI-assisted development in Cursor.

## Core rules

- **Canonical truth lives in OpenSpec**
  - Current-state behavior: `openspec/specs/*`
  - In-flight changes: `openspec/changes/*`
- **Traycer is supporting material only**
  - Use it for planning, research handoffs, or verification notes
  - Do not use it as the canonical spec store
- **Use the repo-managed CLI**
  - Do not rely on a personal global OpenSpec install for this repo's workflow behavior

## Repo commands

```bash
# Regenerate Cursor OPSX commands/skills and initialize openspec/ if needed
bun run openspec:init

# Refresh generated Cursor OPSX commands/skills after upgrading OpenSpec
bun run openspec:update

# Validate current OpenSpec specs and changes
bun run openspec:validate
```

## Cursor day-to-day workflow

### Quick path

Use this when the work is clear and you want the fastest end-to-end flow:

1. `/opsx:propose`
2. `/opsx:apply`
3. `/opsx:verify`
4. `/opsx:sync`
5. `/opsx:archive`

### Expanded path

Use this when you want more control over planning artifacts:

1. `/opsx:explore` if the problem is still fuzzy
2. `/opsx:new`
3. `/opsx:continue` or `/opsx:ff`
4. `/opsx:apply`
5. `/opsx:verify`
6. `/opsx:sync`
7. `/opsx:archive`

## When to use specs vs changes

### Put it in `openspec/specs/*` when:

- it describes **current durable behavior**
- future teammates should treat it as the authoritative answer
- it is not tied to one temporary implementation sprint

### Put it in `openspec/changes/*` when:

- it is **active work**
- requirements or design are changing
- implementation tasks still need to be executed or verified

## How Traycer fits

Use Traycer outputs as:

- planning inputs
- research notes
- verification evidence
- implementation run logs

Then fold them into the right place:

- durable behavior -> `openspec/specs/*`
- active change work -> `openspec/changes/*`
- supporting reference -> `docs/traycer/*`

If a Traycer artifact is worth keeping, preserve a curated copy in `docs/traycer/` and summarize the important outcome in OpenSpec.

## Updating the workflow itself

If you need to change which OPSX workflows are generated for Cursor:

1. update the managed workflow settings in `scripts/openspec-cli.mjs`
2. run `bun run openspec:update`
3. run `bun run openspec:validate`

This repo intentionally manages OpenSpec generation deterministically so teammates get the same Cursor command surface.

## Review checklist

- [ ] Durable behavior is captured in `openspec/specs/*`
- [ ] Active work is tracked in `openspec/changes/*`
- [ ] Traycer material is supporting, not canonical
- [ ] `bun run openspec:validate` passes
- [ ] Relevant repo checks pass for the code or docs you changed
