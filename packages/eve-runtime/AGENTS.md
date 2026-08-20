# Eve runtime package

This package uses Eve 0.25.1. Before changing Eve-authored files, read the
relevant installed guide under `node_modules/eve/docs/`; installed package docs
are the API source of truth.

Keep this package isolated from `apps/admin`, `apps/donor`, and
`apps/missionary` until issue #428 proves and owns the admin mount. Shared
server boundaries from `@asym/api` are allowed. The runtime must remain
disabled by default and may not introduce a live model, provider, tool,
sandbox, or production effect without the applicable accepted OpenSpec change
and governance gate. Route auth and session ownership must fail closed outside
the loopback-only deterministic verification path.

Distinguish repository coding-agent guidance (Codex, Cursor, Claude Code,
Copilot) from product-runtime Eve configuration. Do not expose the full
repository development skill library to runtime Eve. Do not describe unmerged
or research-only Eve behavior as current fact. Future Eve UI remains subject
to `packages/ui/AGENTS.md` and exact `base-maia`.

The OpenSpec Guardian is permanently read-only: no file writes, no shell
mutation, no OpenSpec sync or archive. Product-runtime Eve may understand
OpenSpec authority and review it; this upgrade grants no Eve mutation,
sync, or archive authority. Future Eve authoring requires a separate
accepted change.

## Triggers

- Editing files under `packages/eve-runtime/**`

## Workflow

1. Read this file and installed `node_modules/eve/docs/`.
2. Confirm the runtime remains disabled by default.
3. Follow TDD for substantive behavior. Do not change production Eve runtime
   from instruction-system work.

## Checklist

- [ ] Installed Eve docs remain the API source of truth
- [ ] Runtime stays isolated and disabled by default
- [ ] Coding-agent skills are not loaded as product-runtime skills
