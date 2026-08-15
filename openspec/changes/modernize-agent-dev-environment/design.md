# Design: Modernize the repository coding-agent development environment

## Technical approach

Keep Core’s existing canonical skill system (`docs/ai/skills/` + `skills-lock.json` + `scripts/sync-agent-skills.mjs`) and the existing `agent-instruction-system` capability. Do not add a second registry.

Root `AGENTS.md` stays the portable always-on contract. It keeps the Next.js-managed marker region exactly as generated and retains **one** compressed `.next-docs` index (the current 16.3 index at the file end). The older duplicate index currently nested under Agent compatibility is removed as a genuine duplicate, not edited in place.

Detailed skill routing, Cursor Cloud runbooks, review-bot policy, and Nia tutorials move to existing or new files under `docs/ai/` and `docs/guides/`. Nested `AGENTS.md` files add unique local rules only.

## Architecture

```
AGENTS.md (router + invariants + compact maps)
  ├─ apps/*/AGENTS.md (app identity, Instant Nav pointer, UI pointer)
  ├─ packages/ui/AGENTS.md (detailed base-maia contract)
  ├─ packages/eve-runtime/AGENTS.md (runtime isolation; unchanged role)
  ├─ supabase/AGENTS.md, scripts/AGENTS.md
  ├─ docs/ai/rules/* (frontend, backend, testing, OpenSpec, skill routing)
  └─ docs/ai/skills/* (canonical workflows; generated mirrors)
```

Client adapters remain thin: `CLAUDE.md` stays `@AGENTS.md`, Copilot keeps a pointer plus path-scoped `.github/instructions`, Cursor keeps focused `.cursor/rules`.

## skills:verify

`scripts/verify-skills-sync.mjs` renders expected mirrors into an OS temp directory (`os.tmpdir()`, `path.join`, no hardcoded `/tmp`) and compares them to tracked mirrors. It MUST NOT write the working tree. `bun run skills:sync` remains the mutating write path.

Verify behavior:

1. Render expected mirrors into a temp tree using the same overlay logic as sync (`repoRoot` / `destRoot`).
2. Compare expected trees to tracked mirrors with CRLF-aware equality.
3. Fail on missing, changed, stale, or orphaned generated files without writing the working tree.
4. Keep the unsupported `.agent/skills` rejection.
5. Keep the Inngest reference check as a read-only step.

`scripts/sync-agent-skills.mjs` falls back from `rename` to copy-then-remove when overlayfs returns `EXDEV` on same-directory skill-dir moves. Tests set `CORE_SKILLS_SIMULATE_RENAME_EXDEV=1`.

## TDD overlay

Update `docs/ai/skills/tdd/SKILL.md` Core overlay so it auto-routes for substantive feature, bug-fix, and behavior-changing work. Do not ask the user to approve an already-established public seam. Keep `/tdd` and `/TDD` as one workflow. Do not add a second case-sensitive skill.

## UI overlay

Do not fork the official shadcn skill. Add a small Core overlay plus `packages/ui/AGENTS.md` stating exact `base-maia`, Base UI, Zinc semantic tokens, `packages/ui` ownership, and no `shadcn init` / preset switch / alternate style.

## Alternatives considered

- Shrink root to a few dozen lines: rejected; high-frequency invariants (Bun/Turbo, TDD, `base-maia`, OpenSpec, Next.js docs-first) must remain always-on.
- Make TanStack Intent mandatory: rejected; use only a reviewed allowlist if adopted, never a wildcard, never install absent packages.
- Archive this change in the implementation branch: rejected; Core keeps active changes until later accepted integration.

## Testing strategy

- RED tests first for non-mutating verify, instruction-budget, nested-scope, `base-maia` portable invariant, and routing fixtures.
- Existing shadcn config guardrails remain the source of truth for `components.json`.
- Structural client-adapter tests; do not claim live Codex/Claude/Copilot behavioral verification.
- `bun run skills:sync` then non-mutating `skills:verify`; `git status` must be unchanged after verify.
