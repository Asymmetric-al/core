## 1. OpenSpec

- [x] 1.1 Create an OpenSpec change for official Inngest agent skills,
      routing, and MCP support.
- [x] 1.2 Keep the proposal explicit that product runtime Inngest integration is
      out of scope.
- [x] 1.3 Document the bundled non-Inngest repo hygiene changes separately from
      the Inngest agent-tooling scope.

## 2. Official Skills

- [x] 2.1 Vendor the seven official core skills from
      `inngest/inngest-skills`.
- [x] 2.2 Vendor the four Codex-oriented skills from
      `inngest/inngest-codex-plugin`.
- [x] 2.3 Add a canonical `inngest` router skill that replaces the stale
      mirror-only unofficial skill.
- [x] 2.4 Document upstream source paths, commit SHAs, licenses, and refresh
      steps.

## 3. Routing and MCP

- [x] 3.1 Update `AGENTS.md` with Inngest skill routing, plugin install notes,
      precedence, and dev-server MCP behavior.
- [x] 3.2 Update the agent playbook and skill discovery docs.
- [x] 3.3 Add `inngest-dev` to root `.mcp.json` and `.cursor/mcp.json`.
- [x] 3.4 Keep `CLAUDE.md` unchanged as `@AGENTS.md`.

## 4. Validation

- [x] 4.1 Run `bun run skills:sync`.
- [x] 4.2 Run `bun run skills:verify`.
- [x] 4.3 Run `bun run format:check` (full check traverses pre-existing nested
      `.claude/worktrees/...` files with unrelated warnings; changed-file
      Prettier check passes).
- [x] 4.4 Run
      `bunx @fission-ai/openspec@latest validate add-inngest-agent-tools --strict`.
- [x] 4.5 Confirm the mirror-only vibeship `inngest` skill no longer remains as
      the active `inngest` mirror content.
- [x] 4.6 Verify vendored Inngest skill markdown references remain local and
      readable.
