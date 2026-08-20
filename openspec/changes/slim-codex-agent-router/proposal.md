# Change: Slim the root Codex instruction router

## Why

The completed `modernize-agent-dev-environment` change reduced root
`AGENTS.md` from 78,840 bytes to 24,833 bytes, but the always-on file still
contains a 7.5 KiB compressed Next.js index, cross-client setup, an eager skill
catalog, detailed framework/tool instructions, and cloud-specific routing.

Codex reads root project instructions before work and applies a 32 KiB default
combined project-instruction budget. OpenAI's current GPT-5.6 guidance favors
lean prompts, single-stated instructions, and progressive disclosure. Core
already has nested `AGENTS.md` files, canonical rulebooks, discoverable skills,
runtime configuration, hooks, and CI for the details currently repeated in
root.

## What Changes

- Keep root `AGENTS.md` as Core's always-on Codex constitution and router.
- Preserve the small Next.js-managed opening block, but remove the compressed
  docs index; `.next-docs/` remains the fallback documentation tree.
- Keep only repository identity, OpenSpec routing, scoped-instruction
  discovery, critical Core invariants, progressive skill/tool policy, Bun
  commands, verification, and concise review rules in root.
- Enforce a 16 KiB hard budget, a 12 KiB target, and a 200-line ceiling.
- Move no product behavior. Existing rulebooks, skills, runbooks, hooks, MCP
  configuration, and nested instructions remain the detailed sources.
- Replace tests that reward eager root catalogs with tests for budget,
  progressive disclosure, marker integrity, and valid local references.

## Capabilities

- `agent-instruction-system`: always-on instruction scope, progressive
  disclosure, framework-doc routing, and instruction verification.

## Impact

- Root and scoped instruction documentation, the agent-instruction-system
  specification, and focused instruction-system tests.
- No application code, database schema, auth, payments, deployments, runtime
  MCP registration, or cloud-agent workflow changes.

## Non-goals

- Redesigning Claude, Cursor, Copilot, or cloud-agent configuration
- Removing `.next-docs/`
- Pruning or refreshing the repository skill catalog
- Changing product dependencies or runtime behavior
