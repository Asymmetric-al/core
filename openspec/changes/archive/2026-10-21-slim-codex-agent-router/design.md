# Design: A bounded Codex constitution with progressive disclosure

## Context

Root `AGENTS.md` is injected before Codex begins work. The preceding
modernization made the file fit under the current Codex default, but it still
spends nearly one third of its bytes on a generated documentation index and
duplicates information available in nested instructions, skills, rulebooks,
configuration, hooks, and manifests.

## Decisions

### Root owns stable, high-frequency decisions only

Root keeps:

- the Next.js-managed opening block
- repository identity and package boundaries
- OpenSpec and instruction precedence
- nearest-`AGENTS.md` discovery
- compact domain routing
- exact `base-maia`, TDD, data-safety, and Next.js docs-first invariants
- progressive skill and runtime-evidence policy
- canonical Bun validation commands
- concise evidence-based review rules

Everything that is task-specific, volatile, procedural, tool-registration
specific, or client-specific remains outside root.

### Remove the compressed Next.js index

The compressed index is not a second managed invariant. It is a generated file
inventory for the committed `.next-docs/` tree. Codex can search that tree
directly, and the opening Next.js-managed block already requires installed
version docs before coding. Structural tests prevent the index from being
reintroduced accidentally.

### Skills route themselves

Codex discovers `.agents/skills` progressively from skill names and
descriptions. Root points to `docs/ai/rules/agent-skill-routing.md` only when a
route is ambiguous or skill maintenance is requested; it does not enumerate
individual skills. Canonical skill authoring remains under `docs/ai/skills/`,
with `skills:sync` and non-mutating `skills:verify` unchanged.

### Config, hooks, and CI remain authoritative

Root does not duplicate MCP inventories, Shadscan commands, branch guards,
formatting rules, or full CI pipelines. `.codex/config.toml`, hooks, scripts,
and CI already express those facts. Root tells Codex how to discover and use
them when relevant.

## Budget

- Hard maximum: 16,384 UTF-8 bytes
- Target: at most 12,288 UTF-8 bytes
- Authored line ceiling: 200
- Maximum line length: 500 characters
- Exactly one `BEGIN:nextjs-agent-rules` and matching end marker
- No `NEXT-AGENTS-MD` compressed-index markers

## Compatibility boundary

This change authors root for OpenAI Codex. Existing thin adapters may continue
to reference it, but this change does not add client-specific instructions or
cloud runbooks to the root file.

## Verification

Focused structural tests verify the budget, marker integrity, progressive
disclosure, required Core invariants, nested instruction inventory, and direct
local references. Existing tests continue to verify `base-maia`, TDD, skill
mirror parity, and non-mutating verification.
