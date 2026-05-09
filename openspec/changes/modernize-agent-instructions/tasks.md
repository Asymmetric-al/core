## 1. Bootstrap OpenSpec

- [x] 1.1 Add `openspec/config.yaml` and `openspec/project.md`
- [x] 1.2 Add the durable `agent-instruction-system` spec under
      `openspec/specs/`
- [x] 1.3 Create the `modernize-agent-instructions` change folder with proposal,
      design, tasks, and spec delta

## 2. Tighten Root Routing

- [x] 2.1 Update `AGENTS.md` source-of-truth ordering and role separation
- [x] 2.2 Add explicit OpenSpec-first routing and conditional plugin / Codex
      guidance
- [x] 2.3 Add the `docs/ai/rules/openspec.md` rulebook and wire it into the
      routing list

## 3. Repair Cursor Workflow Docs

- [x] 3.1 Update `.cursor/rules/next-devtools-mcp.mdc` with lock/log guidance
- [x] 3.2 Rewrite `.cursor/commands/1-start-project.md` to use
      `openspec/changes/<change-id>/`
- [x] 3.3 Rewrite `.cursor/commands/2-implement-project.md`,
      `3-commit-project.md`, and `4-close-project.md` to use OpenSpec-native
      artifacts and conditional Nia language

## 4. Repair Copilot Routing

- [x] 4.1 Update `.github/copilot-instructions.md`
- [x] 4.2 Add `.github/instructions/shadcn-studio-mcp.instructions.md`
- [x] 4.3 Keep `.github/instructions/shadcn-studio-mcp.md` as a compatibility
      shim

## 5. Verify and Refresh Stale Docs

- [x] 5.1 Update `docs/AI_AGENT_PLAYBOOK.md` to `next@16.2.1` and add an
      OpenSpec note
- [x] 5.2 Run `bunx @fission-ai/openspec@latest validate --all`
- [x] 5.3 Confirm marker integrity, path accuracy, command accuracy, and the
      changed-files-only boundary

## 6. PR #223 Cleanup

- [x] 6.1 Remove accidental local/tool artifacts from version control and ignore
      them going forward
- [x] 6.2 Keep `vendor/payload-upstream/` scoped to its existing documented
      vendor policy, not this AI tooling change
- [x] 6.3 Pin committed MCP package versions and document the upgrade workflow
- [x] 6.4 Preserve `docs/ai/skills` as canonical and refresh generated mirrors
      via `bun run skills:sync`
