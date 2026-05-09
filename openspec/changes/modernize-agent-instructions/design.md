# Design: Minimal OpenSpec rollout with repo-owned instruction files

## Approach

This change adds OpenSpec as a durable project-context layer without letting it
take over the repo's existing hand-maintained instruction system.

The implementation keeps two layers distinct:

1. OpenSpec for durable project context, durable specs, and active change
   artifacts.
2. Repo-owned instruction files (`AGENTS.md`, Cursor docs, Copilot docs, local
   rulebooks, and canonical skills) for day-to-day routing and tool-specific
   behavior.

## Key Decisions

### 1. Bootstrap OpenSpec with `--tools none`

The repo already maintains its own AGENTS, Cursor, and Copilot files. Using
`bunx @fission-ai/openspec@latest init --tools none` creates the OpenSpec
folder structure without installing generated tool integrations that could
conflict with the current setup.

### 2. Keep Next.js-managed content sacred

`AGENTS.md` already contains the managed Next.js block and compressed docs
index. Those sections remain untouched. All repo-specific modernization happens
outside the generated regions.

### 3. Prefer conditional plugin / Codex wording

The current workspace proves several plugins, MCP servers, and Codex surfaces
exist, but the repo should not assume every workspace has the same setup.
Repo docs should acknowledge these capability layers conditionally and keep
OpenSpec plus repo-local instructions above them in precedence.

### 4. Rewrite Cursor command docs to OpenSpec-native paths

The repo does not contain `docs/projects/**` or `.cursor/nia/index-registry.md`,
so the checked-in command docs should not direct agents there. The replacement
workflow stores durable work under `openspec/changes/<change-id>/` and uses
existing rulebooks plus optional Nia access when available.

## Out of Scope

- generating or adopting OpenSpec-managed Cursor, Copilot, or Codex slash
  commands
- changing product behavior
- removing canonical mirror skill trees (`.agents/skills` and `.cursor/skills`)
- changing repo-owned MCP configuration shape (package versions may be pinned)

The PR cleanup may remove accidental local/tool directories (for example,
`.agent/`, `.nia-sync/`, `.tmp*/`, and Traycer runtime output) because those are
not part of the canonical instruction system.
