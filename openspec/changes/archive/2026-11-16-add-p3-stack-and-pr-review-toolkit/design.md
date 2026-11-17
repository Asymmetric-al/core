## Approach

Import p3-stack byte for byte from a pinned LF checkout and apply only
counted, documented rewrites: collision renames, paths that pointed at the
upstream repository root, `main` branch instructions (Core uses `develop`),
and one upstream link fix. Append a marked Core overlay to every entrypoint.
Prettier formats the canonical copies, except `unslop`, whose non-contiguous
rule numbers are citable and stay exact.

p3-stack names T3 Code tools. One Core-authored adapter maps each tool to
Claude Code, Codex, and Cursor, or tells the agent to skip the step and say
so. The adapter and each overlay restate Core's authorization boundaries,
because the pack treats PR creation, pushes, merges, review replies, and
scheduled jobs as autonomous steps.

pr-review-toolkit is a Claude Code plugin, not a skills repository, so it has
no lock entry. Its command becomes a skill and its agent prompts stay
unchanged as references. Thin launchers in `.cursor/agents/` give Cursor and
Claude Code native subagents without a second copy of each prompt. Their
descriptions route only from `review-pr` or an explicit request, because the
upstream descriptions ask for proactive use and one reviewer edits code.
Codex and T3 Code reach the same prompts through the skill. Codex factory
roles stay unchanged because the Samson installer owns them.

## Verification

Check the pins, licenses, lock entries, explicit-only metadata, overlays,
renames, resolved links, executable mode, mirrors, and routing with a
structural test. Run the skill sync verification, the docs test suite,
OpenSpec validation, and the CI preflight.
