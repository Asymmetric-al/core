# Inngest Skills Upstream

This directory documents the official upstream sources for the Inngest skills
vendored into `docs/ai/skills/inngest-*`.

## Sources

| Skill                       | Repository                     | Source path                                                | Commit SHA                                 | License    |
| --------------------------- | ------------------------------ | ---------------------------------------------------------- | ------------------------------------------ | ---------- |
| `inngest-setup`             | `inngest/inngest-skills`       | `skills/inngest-setup/SKILL.md`                            | `c1996f94a1c39a10a56bb848a2ce7701bfe7346d` | Apache-2.0 |
| `inngest-events`            | `inngest/inngest-skills`       | `skills/inngest-events/SKILL.md`                           | `c1996f94a1c39a10a56bb848a2ce7701bfe7346d` | Apache-2.0 |
| `inngest-durable-functions` | `inngest/inngest-skills`       | `skills/inngest-durable-functions/SKILL.md`                | `c1996f94a1c39a10a56bb848a2ce7701bfe7346d` | Apache-2.0 |
| `inngest-steps`             | `inngest/inngest-skills`       | `skills/inngest-steps/SKILL.md`                            | `c1996f94a1c39a10a56bb848a2ce7701bfe7346d` | Apache-2.0 |
| `inngest-flow-control`      | `inngest/inngest-skills`       | `skills/inngest-flow-control/SKILL.md`                     | `c1996f94a1c39a10a56bb848a2ce7701bfe7346d` | Apache-2.0 |
| `inngest-middleware`        | `inngest/inngest-skills`       | `skills/inngest-middleware/SKILL.md`                       | `c1996f94a1c39a10a56bb848a2ce7701bfe7346d` | Apache-2.0 |
| `inngest-realtime`          | `inngest/inngest-skills`       | `skills/inngest-realtime/SKILL.md`                         | `c1996f94a1c39a10a56bb848a2ce7701bfe7346d` | Apache-2.0 |
| `inngest-brownfield-audit`  | `inngest/inngest-codex-plugin` | `plugins/inngest/skills/inngest-brownfield-audit/SKILL.md` | `6e550e39970dcc989d7b0c0b6c4aa44dc0f56c3e` | MIT        |
| `inngest-agents`            | `inngest/inngest-codex-plugin` | `plugins/inngest/skills/inngest-agents/SKILL.md`           | `6e550e39970dcc989d7b0c0b6c4aa44dc0f56c3e` | MIT        |
| `inngest-v3-v4-migration`   | `inngest/inngest-codex-plugin` | `plugins/inngest/skills/inngest-v3-v4-migration/SKILL.md`  | `6e550e39970dcc989d7b0c0b6c4aa44dc0f56c3e` | MIT        |
| `inngest-api`               | `inngest/inngest-codex-plugin` | `plugins/inngest/skills/inngest-api/SKILL.md`              | `6e550e39970dcc989d7b0c0b6c4aa44dc0f56c3e` | MIT        |

The `inngest` skill in this repository is a repo-local router that replaces an
older mirror-only unofficial skill. It is not copied from upstream.

The official Claude Code plugin was reviewed for install instructions and MCP
behavior:

| Repository                           | Commit SHA                                 | License |
| ------------------------------------ | ------------------------------------------ | ------- |
| `inngest/inngest-claude-code-plugin` | `bf1b06ea9de8790c679ed54f3ef04e1334d3fb96` | MIT     |

## License Text

The license text copied from the exact upstream refs is preserved in:

- `LICENSE-inngest-skills-Apache-2.0.txt`
- `LICENSE-inngest-codex-plugin-MIT.txt`

## Refresh Workflow

Run the targeted refresh, then refresh mirrors and verify drift:

```bash
bun run skills:refresh-inngest
bun run skills:sync
bun run skills:verify
```

The refresh script downloads only the official `SKILL.md` files listed above.
It also downloads the referenced markdown files needed by those skills so local
links stay readable and `bun run skills:verify` can catch reference drift. It
does not vendor Codex plugin evals, examples, assets, or product runtime code.
It applies one repo overlay to `inngest-agents` so the upstream companion
example path points at `inngest/inngest-codex-plugin` instead of implying a
local example directory exists.

## Manual Source Commands

```bash
git clone https://github.com/inngest/inngest-skills.git /tmp/inngest-skills
git -C /tmp/inngest-skills checkout c1996f94a1c39a10a56bb848a2ce7701bfe7346d

git clone https://github.com/inngest/inngest-codex-plugin.git /tmp/inngest-codex-plugin
git -C /tmp/inngest-codex-plugin checkout 6e550e39970dcc989d7b0c0b6c4aa44dc0f56c3e
```

Copy the files listed in the source table into their matching
`docs/ai/skills/<skill-name>/SKILL.md` paths, then run the sync and verify
commands above.
