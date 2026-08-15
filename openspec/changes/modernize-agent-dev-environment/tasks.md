# Tasks: Modernize the repository coding-agent development environment

## 1. OpenSpec and baseline

- [x] 1.1 Record baseline branch, SHAs, UI contract, and mutating `skills:verify` evidence
- [x] 1.2 Create this focused change against `agent-instruction-system` only

## 2. Non-mutating skill verification (TDD)

- [x] 2.1 Add failing tests for verify-without-write, drift-without-repair, `--help`, unknown args, and relative gitdir without requiring sync stdout
- [x] 2.2 Parameterize skill sync overlay logic for a destination root
- [x] 2.3 Implement non-mutating `skills:verify` using a temp expected tree
- [x] 2.4 Confirm a successful verify leaves `git status` unchanged

## 3. Instruction architecture

- [x] 3.1 Rewrite root `AGENTS.md` as router + invariants; remove the duplicate compressed Next.js index
- [x] 3.2 Relocate skill catalog, cloud runbook, review-bot policy, and Nia tutorial with a preservation map
- [x] 3.3 Add `packages/ui/AGENTS.md` with the detailed `base-maia` contract
- [x] 3.4 Add or improve app and `scripts` nested instructions without copying the root
- [x] 3.5 Keep `CLAUDE.md` as `@AGENTS.md` and thin Copilot/Cursor adapters

## 4. Skills and routing

- [x] 4.1 Update TDD overlay for automatic substantive-work routing
- [x] 4.2 Add Core overlay for official shadcn / `moai-library-shadcn` without forking the vendor skill
- [x] 4.3 Add deterministic routing fixtures including UI, TDD, Next.js, TanStack, Supabase, and docs-only cases
- [x] 4.4 Add instruction-budget and nested-scope structural tests
- [x] 4.5 Run `skills:sync` then non-mutating `skills:verify`

## 5. Validation

- [x] 5.1 Strict-validate this OpenSpec change and all specs/changes
- [x] 5.2 Run focused unit tests, `git diff --check`, and relevant existing guardrails
- [x] 5.3 Confirm `packages/ui/components.json` is still `base-maia` / `zinc` / `cssVariables: true`
- [x] 5.4 Report omitted repo-wide gates honestly

## Omitted gates

- `bun run check`, `bun run lint`, `bun run typecheck`, and full `bun run test:unit` were not run for this instruction-system change. Focused suites that did run: routing fixtures, skill quality-gate, grill-for-unknowns, Emil Kowalski, babysit, script verifiers, EXDEV sync, and shadcn config guardrails.
- `bunx @fission-ai/openspec@latest validate modernize-agent-dev-environment --strict` passed. `validate --all --strict` failed on unrelated active change `add-guest-giving-and-gift-anonymity`; that change was not edited here.
- Live Codex / Claude / Copilot truncation and Next.js MCP against a running donor/admin server were not claimed.
- Nia index for `Asymmetric-al/core` still reflects `develop`; local files and Vitest are the evidence for this branch.
