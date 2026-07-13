# Proposal: Modernize the agent instruction system without weakening it

## Why

The repo already has a strong instruction system, but it is missing a real
OpenSpec foundation and still contains a few stale or misaligned workflow files.
The biggest gaps are:

- no committed `openspec/` tree even though repo docs already treat OpenSpec as
  top-priority project context
- root `AGENTS.md` does not yet model `cursor.md`, conditional plugin and Codex
  layers, or Nia-first third-party-doc routing cleanly
- GitHub Copilot path-specific instructions are not stored in the
  `*.instructions.md` format GitHub expects
- `.cursor/commands/1-4` still depend on missing `docs/projects/**`,
  missing `.cursor/nia/index-registry.md`, and repo-unverified Traycer / Nia
  flows

## What Changes

- bootstrap a minimal OpenSpec tree and document the repo's durable
  instruction-system contract there
- strengthen OpenSpec-first routing and conditional capability-layer wording in
  `AGENTS.md`
- add an OpenSpec-specific rulebook under `docs/ai/rules/`
- rewrite stale Cursor command docs onto real repo paths under
  `openspec/changes/<change-id>/`
- add a GitHub-compatible path-specific instruction file while keeping the
  existing shadcn shim for compatibility
- refresh instruction-only docs that still mention outdated Next.js versions

## What Does Not Change

- the Next.js-managed block and compressed docs index in `AGENTS.md`
- `CLAUDE.md`
- nested `AGENTS.md` files under `supabase/` and `scripts/`
- canonical skills under `docs/ai/skills/*`
- repo-owned MCP config in `.mcp.json` and `.cursor/mcp.json`
- `.next-docs/`
- product code, tests, database files, and unrelated infrastructure

## Expected Outcome

Agents should have a stronger, more explicit path for:

- consulting OpenSpec before non-trivial project work
- using local Next.js docs and runtime facts before guessing
- using Nia first when available, with honest fallback wording when it is not
- using provider plugins and Codex surfaces as helpers rather than as sources of
  truth
- following Cursor and Copilot workflows that point only to real repo paths
