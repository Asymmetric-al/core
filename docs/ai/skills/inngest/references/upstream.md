# Inngest Skills Upstream

This directory documents the official upstream sources for the Inngest skills
vendored into `docs/ai/skills/inngest-*`.

## Sources

| Skill                       | Repository                     | Source path                                                | Commit SHA                                 | License    |
| --------------------------- | ------------------------------ | ---------------------------------------------------------- | ------------------------------------------ | ---------- |
| `inngest-setup`             | `inngest/inngest-skills`       | `skills/inngest-setup/SKILL.md`                            | `082798a627bbe9c3ed3a6638a9f56116a035f122` | Apache-2.0 |
| `inngest-events`            | `inngest/inngest-skills`       | `skills/inngest-events/SKILL.md`                           | `082798a627bbe9c3ed3a6638a9f56116a035f122` | Apache-2.0 |
| `inngest-durable-functions` | `inngest/inngest-skills`       | `skills/inngest-durable-functions/SKILL.md`                | `082798a627bbe9c3ed3a6638a9f56116a035f122` | Apache-2.0 |
| `inngest-steps`             | `inngest/inngest-skills`       | `skills/inngest-steps/SKILL.md`                            | `082798a627bbe9c3ed3a6638a9f56116a035f122` | Apache-2.0 |
| `inngest-flow-control`      | `inngest/inngest-skills`       | `skills/inngest-flow-control/SKILL.md`                     | `082798a627bbe9c3ed3a6638a9f56116a035f122` | Apache-2.0 |
| `inngest-middleware`        | `inngest/inngest-skills`       | `skills/inngest-middleware/SKILL.md`                       | `082798a627bbe9c3ed3a6638a9f56116a035f122` | Apache-2.0 |
| `inngest-realtime`          | `inngest/inngest-skills`       | `skills/inngest-realtime/SKILL.md`                         | `082798a627bbe9c3ed3a6638a9f56116a035f122` | Apache-2.0 |
| `inngest-brownfield-audit`  | `inngest/inngest-codex-plugin` | `plugins/inngest/skills/inngest-brownfield-audit/SKILL.md` | `351e14c55a01f3924ab47f9feb69bae615b8bb52` | MIT        |
| `inngest-agents`            | `inngest/inngest-codex-plugin` | `plugins/inngest/skills/inngest-agents/SKILL.md`           | `351e14c55a01f3924ab47f9feb69bae615b8bb52` | MIT        |
| `inngest-v3-v4-migration`   | `inngest/inngest-codex-plugin` | `plugins/inngest/skills/inngest-v3-v4-migration/SKILL.md`  | `351e14c55a01f3924ab47f9feb69bae615b8bb52` | MIT        |
| `inngest-api`               | `inngest/inngest-codex-plugin` | `plugins/inngest/skills/inngest-api/SKILL.md`              | `351e14c55a01f3924ab47f9feb69bae615b8bb52` | MIT        |
| `inngest-api-cli`           | `inngest/inngest-codex-plugin` | `plugins/inngest/skills/inngest-api-cli/SKILL.md`          | `351e14c55a01f3924ab47f9feb69bae615b8bb52` | MIT        |

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
It applies repository workflow and ownership guidance to all twelve installed skills.
The adapters repair shared expressions links and point the durable-agent example
at `inngest/inngest-codex-plugin` instead of implying a local example directory
exists. API and API-CLI routing uses available connected Cloud MCP tools rather
than requiring an uninstalled `inngest-cloud` skill; explicit terminal and HTTP
fallback remain available. Local dev-server MCP requirements are separate from
Cloud OAuth. The API REST reference points Insights queries at the separate
installed CLI companion.

## Manual Source Commands

```bash
git clone https://github.com/inngest/inngest-skills.git /tmp/inngest-skills
git -C /tmp/inngest-skills checkout 082798a627bbe9c3ed3a6638a9f56116a035f122

git clone https://github.com/inngest/inngest-codex-plugin.git /tmp/inngest-codex-plugin
git -C /tmp/inngest-codex-plugin checkout 351e14c55a01f3924ab47f9feb69bae615b8bb52
```

Copy the files listed in the source table into their matching
`docs/ai/skills/<skill-name>/SKILL.md` paths, then run the sync and verify
commands above.

## Reviewed refresh 2026-10-22

Advanced immutable source pins after reviewing the complete upstream comparisons. The seven imported core skills and three non-API Codex skills are content-current; only API and API-CLI add Cloud MCP-first routing. Core maps the uninstalled inngest-cloud skill to available connected Cloud MCP tools, keeps explicit terminal/HTTP fallback, and distinguishes local dev-server MCP from Cloud OAuth. No new pack members or runtime packages were installed.

The API REST reference remaps its Insights cross-link to `../../inngest-api-cli/references/cli-commands.md`; the pinned source keeps a bare sibling filename that is not valid in the separate installed skill directories. The refresh adapter requires and rewrites that link before publication.
