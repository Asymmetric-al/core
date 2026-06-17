---
source_name: supabase/agent-skills (supabase)
source_url: https://github.com/supabase/agent-skills
license: MIT
last_reviewed: 2026-05-23
---

# Upstream: Supabase agent skill

Canonical copy in this repo: `docs/ai/skills/supabase/SKILL.md` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Skills index:** https://skills.sh/supabase/agent-skills
- **GitHub:** https://github.com/supabase/agent-skills
- **Upstream path:** `skills/supabase/SKILL.md`

## Refresh from ecosystem

1. `npx skills add supabase/agent-skills -y` — updates `.agents/skills/supabase` and `skills-lock.json`
2. `bun run skills:refresh-upstream` — copies into `docs/ai/skills/supabase`
3. Re-apply repo-specific frontmatter and the **This repository** section in `SKILL.md` if the vendor refresh overwrote them
4. `bun run skills:sync` && `bun run skills:verify`

## Notes for maintainers

- Do not copy secrets, tokens, or environment-specific identifiers into skill content.
