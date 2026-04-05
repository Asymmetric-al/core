# OpenSpec Workflow Rule

**Name:** `openspec-workflow`
**Purpose:** Route non-trivial project work, behavior changes, and multi-step planning through OpenSpec before implementation.
This keeps durable project context, intended behavior, and active change scope visible to every agent.

**Applies when:** Planning or implementing non-trivial feature work, behavior changes, repo workflow changes, or any task that should leave durable context behind.
**Do not use when:** The task is a small local edit with no durable behavior change and no project-level planning value.

---

## Triggers

- new feature work
- behavior changes
- multi-step project work
- repo workflow or instruction-system changes
- work that spans multiple files, systems, or review cycles

---

## Workflow

1. **Read durable context first.**
   - Open `openspec/project.md`.
   - Read the relevant specs under `openspec/specs/**`.
   - Read any active change under `openspec/changes/**` that already covers the
     task.

2. **Create or update a change before major behavior work.**
   - If the task changes durable behavior and no suitable change exists, create
     or update a change folder under `openspec/changes/<change-id>/`.
   - Keep proposal, spec delta, design, and tasks aligned with the intended
     change.

3. **Use OpenSpec CLI for inspection and validation when relevant.**
   - Use `bunx @fission-ai/openspec@latest <command>` as the repo-safe default.
   - If `openspec` is already installed on `PATH`, that is equivalent.
   - If Bun is unavailable, use `npx -y @fission-ai/openspec@latest <command>`.
   - `bunx @fission-ai/openspec@latest list`
   - `bunx @fission-ai/openspec@latest show <item>`
   - `bunx @fission-ai/openspec@latest view`
   - `bunx @fission-ai/openspec@latest validate <item>` or `bunx @fission-ai/openspec@latest validate --all`
   - `bunx @fission-ai/openspec@latest archive <change> --yes` after implementation is complete and the specs are ready to merge forward

4. **Keep repo-owned instruction files hand-maintained.**
   - Do not run `openspec update` casually in this repo.
   - This repository intentionally owns `AGENTS.md`, Cursor rule and command
     files, and Copilot instruction files by hand.
   - If regeneration is ever needed, review every generated diff manually before
     accepting it.

5. **Reflect durable workflow changes in both layers.**
   - Update OpenSpec when project behavior or workflow meaning changes.
   - Update the checked-in instruction files that agents read every day.

---

## Checklist

- [ ] Read `openspec/project.md`
- [ ] Read the relevant spec files in `openspec/specs/**`
- [ ] Read or created the matching change under `openspec/changes/**`
- [ ] Validated the change with the OpenSpec CLI when appropriate
- [ ] Avoided casual `openspec update`
- [ ] Left durable context behind for the next agent or reviewer
