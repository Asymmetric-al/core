# Inngest Skills Upstream

This directory documents the official upstream sources for the Inngest skills
vendored into `docs/ai/skills/inngest-*`.

## Sources

| Skill                       | Repository                     | Source path                                                | Commit SHA                                 | License    |
| --------------------------- | ------------------------------ | ---------------------------------------------------------- | ------------------------------------------ | ---------- |
| `inngest-setup`             | `inngest/inngest-skills`       | `skills/inngest-setup/SKILL.md`                            | `ff42436bcedfb262d6a377571ce64a0d78d386a5` | Apache-2.0 |
| `inngest-events`            | `inngest/inngest-skills`       | `skills/inngest-events/SKILL.md`                           | `ff42436bcedfb262d6a377571ce64a0d78d386a5` | Apache-2.0 |
| `inngest-durable-functions` | `inngest/inngest-skills`       | `skills/inngest-durable-functions/SKILL.md`                | `ff42436bcedfb262d6a377571ce64a0d78d386a5` | Apache-2.0 |
| `inngest-steps`             | `inngest/inngest-skills`       | `skills/inngest-steps/SKILL.md`                            | `ff42436bcedfb262d6a377571ce64a0d78d386a5` | Apache-2.0 |
| `inngest-flow-control`      | `inngest/inngest-skills`       | `skills/inngest-flow-control/SKILL.md`                     | `ff42436bcedfb262d6a377571ce64a0d78d386a5` | Apache-2.0 |
| `inngest-middleware`        | `inngest/inngest-skills`       | `skills/inngest-middleware/SKILL.md`                       | `ff42436bcedfb262d6a377571ce64a0d78d386a5` | Apache-2.0 |
| `inngest-realtime`          | `inngest/inngest-skills`       | `skills/inngest-realtime/SKILL.md`                         | `ff42436bcedfb262d6a377571ce64a0d78d386a5` | Apache-2.0 |
| `inngest-brownfield-audit`  | `inngest/inngest-codex-plugin` | `plugins/inngest/skills/inngest-brownfield-audit/SKILL.md` | `39a5c1833f7b36ecd3402e04306dd43b9c3f1fa2` | MIT        |
| `inngest-agents`            | `inngest/inngest-codex-plugin` | `plugins/inngest/skills/inngest-agents/SKILL.md`           | `39a5c1833f7b36ecd3402e04306dd43b9c3f1fa2` | MIT        |
| `inngest-v3-v4-migration`   | `inngest/inngest-codex-plugin` | `plugins/inngest/skills/inngest-v3-v4-migration/SKILL.md`  | `39a5c1833f7b36ecd3402e04306dd43b9c3f1fa2` | MIT        |
| `inngest-api`               | `inngest/inngest-codex-plugin` | `plugins/inngest/skills/inngest-api/SKILL.md`              | `39a5c1833f7b36ecd3402e04306dd43b9c3f1fa2` | MIT        |
| `inngest-api-cli`           | `inngest/inngest-codex-plugin` | `plugins/inngest/skills/inngest-api-cli/SKILL.md`          | `39a5c1833f7b36ecd3402e04306dd43b9c3f1fa2` | MIT        |

The `inngest` skill in this repository is a repo-local router that replaces an
older mirror-only unofficial skill. It is not copied from upstream.

The official Claude Code plugin was reviewed for install instructions and MCP
behavior:

| Repository                           | Commit SHA                                 | License |
| ------------------------------------ | ------------------------------------------ | ------- |
| `inngest/inngest-claude-code-plugin` | `10536d34e593c436a76df9d313a66f480ea318c6` | MIT     |

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
git -C /tmp/inngest-skills checkout ff42436bcedfb262d6a377571ce64a0d78d386a5

git clone https://github.com/inngest/inngest-codex-plugin.git /tmp/inngest-codex-plugin
git -C /tmp/inngest-codex-plugin checkout 39a5c1833f7b36ecd3402e04306dd43b9c3f1fa2
```

Copy the files listed in the source table into their matching
`docs/ai/skills/<skill-name>/SKILL.md` paths, then run the sync and verify
commands above.
