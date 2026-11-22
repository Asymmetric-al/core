---
name: eve
description: Build durable backend AI agents with the eve framework. Use when creating, editing, or debugging an eve project — agent instructions, skills, tools, connections, channels, sandboxes, subagents, schedules, or evals.
---

# eve

eve is a filesystem-first framework for durable backend AI agents. An agent is
a directory on disk — instructions, skills, tools, connections, channels,
subagents, and schedules are all files — and eve compiles and runs it.

## Source of truth

The complete documentation ships inside the `eve` package. Do not rely on this
skill for guidance — always read the bundled docs, which match the installed
version exactly:

```
packages/eve-runtime/node_modules/eve/docs/
```

In Core, eve is installed in `packages/eve-runtime` (and in `apps/admin`,
which mounts it), not at the repository root. Start with
`packages/eve-runtime/node_modules/eve/docs/README.md`. It contains the full
index and recommended reading order. Before writing any eve code, read the
relevant guide there first, and read `packages/eve-runtime/AGENTS.md`:
product-runtime eve stays disabled by default and gains models, tools or
effects only through an accepted OpenSpec change.

eve is already installed at the version pinned in
`packages/eve-runtime/package.json`. Do not install it with another package
manager or at the repository root; changing that version is a dependency
decision made with `bun add --exact` in the owning workspace, together with
`bun.lock`. Run the installed CLI from `packages/eve-runtime` as
`bunx eve <command>`.
