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
   - Open `openspec/config.yaml` for injected planning context.
   - Open `openspec/project.md` for the detailed index.
   - Read the relevant specs under `openspec/specs/**`.
   - Read any active change under `openspec/changes/**` that already covers the
     task.
   - Distinguish intended behavior (active change, specs, ADRs) from current
     reality (code, tests, runtime).

2. **Create or update a change before major behavior work.**
   - Use an explicit change ID.
   - Prefer Explore when requirements are unclear and Propose when intent is
     clear (`docs/ai/skills/openspec-explore/SKILL.md`).
   - Keep proposal, spec delta, design, and tasks aligned with the intended
     change.
   - Do not invent a custom schema or enable Stores.

3. **Use the locally pinned OpenSpec CLI.**
   - Always: `bun run openspec -- <command>`
   - `bun run openspec -- list`
   - `bun run openspec -- show <item>`
   - `bun run openspec -- validate <item> --strict`
   - `bun run openspec:validate` for all current specs and active changes
   - `bun run openspec:audit-archive` for archived changes
   - Archive only after implementation has merged and become accepted
     repository reality: `bun run openspec -- archive <change> --yes`

4. **Keep repo-owned instruction files hand-maintained.**
   - Do not run `openspec update` against this live customized repository.
   - This repository owns `AGENTS.md`, Cursor rule and command files, and
     Copilot instruction files.
   - Canonical OpenSpec skills are imported under `docs/ai/skills/openspec-*`
     and mirrored by `bun run skills:sync`.

5. **Reflect durable workflow changes in both layers.**
   - Update OpenSpec when project behavior or workflow meaning changes.
   - Update the checked-in instruction files that agents read every day.
   - Run OpenSpec Verify before claiming the change is complete.
   - Product-runtime Eve may review OpenSpec read-only. It has no write, sync,
     or archive authority.

---

## Checklist

- [ ] Read `openspec/config.yaml` and `openspec/project.md`
- [ ] Read the relevant spec files in `openspec/specs/**`
- [ ] Read or created the matching change under `openspec/changes/**`
- [ ] Used `bun run openspec --` with an explicit change ID for mutations
- [ ] Validated with `bun run openspec -- validate <change-id> --strict`
- [ ] Avoided `openspec update` and any moving latest npm dist-tag for OpenSpec
- [ ] Left the change active until implementation is accepted repository reality
