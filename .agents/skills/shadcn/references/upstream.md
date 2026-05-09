---
source_name: shadcn/ui (shadcn)
source_url: https://github.com/shadcn/ui
license: MIT
last_reviewed: 2026-05-08
---

# Upstream: shadcn official skill

Canonical copy in this repo: `docs/ai/skills/shadcn/SKILL.md` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Skills page:** https://skills.sh/shadcn/ui/shadcn
- **Official docs:** https://ui.shadcn.com/docs/skills
- **MCP docs:** https://ui.shadcn.com/docs/mcp
- **CLI v4 changelog:** https://ui.shadcn.com/docs/changelog/2026-03-cli-v4
- **GitHub:** https://github.com/shadcn/ui
- **Upstream path:** `skills/shadcn/SKILL.md`

## Refresh from ecosystem

1. `npx skills add shadcn/ui --skill shadcn -y` — updates `.agents/skills/shadcn` and `skills-lock.json`
2. `bun run skills:refresh-upstream` — copies into `docs/ai/skills/shadcn`
3. Re-apply the repo-specific **This repository** section in `SKILL.md` if the vendor refresh overwrote it
4. `bun run skills:sync` && `bun run skills:verify`

## Notes for maintainers

- Use the official shadcn CLI and MCP docs as source of truth.
- Keep repo-specific Maia/Zinc, Base UI-first, and `@asym/ui` guidance in `docs/ai/skills/moai-library-shadcn/SKILL.md`.
- Do not copy private registry credentials, tokens, project refs, or environment-specific identifiers into skill content.
