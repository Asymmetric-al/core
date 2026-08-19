# Change: Modernize the repository coding-agent development environment

## Why

Coding agents in this repository currently receive a large always-on root `AGENTS.md` that mixes a router, a full skill catalog, cloud runbooks, review-bot policy, duplicated Next.js compressed indexes, and Nia tutorials. Several high-frequency contracts are missing or easy to miss: a portable exact `base-maia` UI invariant, Test-Driven Development as the default for substantive work, nested app/package instruction scopes, and a `skills:verify` command that must check generated mirrors without rewriting them.

This change updates the durable agent-instruction-system contract so future agents get better context, version-aware docs, skill selection, testing discipline, and UI alignment without changing product runtime behavior.

## What Changes

- Root `AGENTS.md` becomes a concise always-on router and working contract, with detailed catalogs and runbooks moved to scoped files.
- Nested `AGENTS.md` files exist where a package or app has unique rules, including a detailed `packages/ui` `base-maia` contract.
- Substantive behavior-changing work uses TDD by default; documentation and generated-mirror work use deterministic non-test verification.
- `skills:verify` checks generated mirrors without mutating the working tree; `skills:sync` remains the mutating command.
- Agents explore repository context and installed docs before loading action-specific workflow skills.
- Live Next.js diagnostics use the installed Next.js MCP; browser/React inspection uses `agent-browser` when useful.
- The portable UI invariant requires exact shadcn style `base-maia`, Zinc-oriented semantic CSS-variable tokens, Base UI primitives, and shared ownership in `packages/ui`.

## Capabilities

- `agent-instruction-system`: instruction hierarchy, skill ownership, verification, framework-docs routing, and UI instruction contract.

## Impact

- Instruction files, canonical skills/overlays, generated skill mirrors (via sync), agent-system tests, and OpenSpec docs.
- No application features, auth, database, payments, email, Eve runtime, or `packages/ui/components.json` style/base/token values.

## Non-goals

- Product dependency upgrades
- Switching shadcn style, primitive base, or theme family
- A second skill registry or agent framework
- Permission manifests, prompt-injection frameworks, or security-eval platforms
- Archiving unrelated active OpenSpec changes
