# Tasks: Modernize OpenSpec 1.9

## 1. Pin and local CLI

- [x] 1.1 Verify latest stable OpenSpec is `1.9.0` and record tag `v1.9.0` / commit `2826b8889e5223a9a8095d4428b60b56597e1020`
- [x] 1.2 Install `@fission-ai/openspec@1.9.0` exactly and add `openspec`, `openspec:version`, `openspec:validate`, `openspec:audit-archive`
- [x] 1.3 Confirm `bunx --no-install` uses the local pin

## 2. Close out #1324

- [x] 2.1 Confirm PR #1324 merged at `0a569f0c`
- [x] 2.2 Apply the merged `agent-instruction-system` delta to the main spec
- [x] 2.3 Archive `modernize-agent-dev-environment` as `2026-08-18-modernize-agent-dev-environment` (copy-then-remove after OpenSpec CLI `EXDEV` on overlay FS)
- [x] 2.4 Run archive validation on the new archive

## 3. Authority and context

- [x] 3.1 Replace `openspec/config.yaml` context, rules, apply/archive operations, and `githubCopilot.cloudAgent: false`
- [x] 3.2 Refactor `openspec/project.md` into a concise index
- [x] 3.3 Repair `add-guest-giving-and-gift-anonymity` lost scenarios if still failing strict validation

## 4. Skills and instructions

- [x] 4.1 Extend `scripts/refresh-upstream-skills.mjs` with the seven OpenSpec skills only
- [x] 4.2 Overlay Core pin/Stores/TDD/`base-maia`/Eve rules and sync mirrors
- [x] 4.3 Update `AGENTS.md` intended vs current reality, Twenty invariant, OpenSpec pin, compact skill catalog
- [x] 4.4 Convert numbered commands into OpenSpec wrappers; keep names
- [x] 4.5 Update Guardian to remain permanently read-only
- [x] 4.6 Add `openspec-validate` to CI preflight immediately after `skills-verify`

## 5. Verification

- [x] 5.1 Focused tests for pin, `@latest` hygiene, skill provenance, AGENTS routing, and CI stage order pass
- [x] 5.2 `bun run skills:verify` is non-mutating
- [x] 5.3 `bun run openspec:validate` is strict and green
- [x] 5.4 `bun run openspec:audit-archive` is green
- [ ] 5.5 Leave this change active until the implementation is merged
