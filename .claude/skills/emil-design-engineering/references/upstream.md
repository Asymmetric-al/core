---
source_name: animations.dev (Emil's Design Engineering skill)
source_url: https://animations.dev
installer_command: curl -s "https://animations.dev/api/activate-design-engineering?email=<maintainer-email>" | bash
last_reviewed: 2026-04-16
---

# Upstream: animations.dev Design Engineering skill

Canonical copy in this repo: `docs/ai/skills/emil-design-engineering/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Source site:** https://animations.dev
- **Installer endpoint:** `https://animations.dev/api/activate-design-engineering?email=<maintainer-email>` (URL-encode the address when you substitute a real email)
- **Observed installer target on this machine:** `~/.cursor/skills/emil-design-engineering/`
- **Installed slug:** `emil-design-engineering`

## Refresh from upstream

1. Run the installer exactly as documented above. This currently installs the upstream skill into `~/.cursor/skills/emil-design-engineering/`.
2. Run `bun run skills:refresh-upstream` to copy the installed upstream tree into `docs/ai/skills/emil-design-engineering/`.
3. Re-check this file and the repo routing/docs in case the upstream installer changed the slug or file layout.
4. Run `bun run skills:sync` and `bun run skills:verify`.

## Repo-specific notes to preserve after refresh

- Keep this `references/upstream.md` file in place.
- Keep `AGENTS.md` routing aligned so animation work, transitions, micro-interactions, and motion polish load `docs/ai/skills/emil-design-engineering/SKILL.md` first.
- Keep `cursor.md` aligned with the same routing note because it is a real repo-managed Cursor helper layer.
- Keep `motion` as a secondary companion skill for `motion/react` implementation details rather than replacing this skill as the default animation entrypoint.
