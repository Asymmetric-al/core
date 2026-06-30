---
source_name: supabase/agent-skills (supabase-postgres-best-practices)
source_url: https://github.com/supabase/agent-skills
license: MIT
last_reviewed: 2026-04-09
---

# Upstream: Supabase Postgres best practices

Canonical copy in this repo: `docs/ai/skills/supabase-postgres-best-practices/SKILL.md` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Skills page:** https://skills.sh/supabase/agent-skills/supabase-postgres-best-practices
- **GitHub:** https://github.com/supabase/agent-skills
- **Upstream path:** `skills/supabase-postgres-best-practices/SKILL.md`

## Refresh from ecosystem

1. `npx skills add supabase/agent-skills -y` — updates `.agents/skills/supabase-postgres-best-practices` and `skills-lock.json`
2. `bun run skills:refresh-upstream` — copies into `docs/ai/skills/supabase-postgres-best-practices`
3. Re-apply repo-specific frontmatter, **This repository**, **Workflow**, **Do not use**, and **Checklist** in `SKILL.md` if the vendor refresh overwrote them
4. `bun run skills:sync` && `bun run skills:verify`

## Notes for maintainers

- Keep this skill aligned with upstream conceptual guidance while preserving repo-specific routing.
- Do not copy secrets, tokens, or environment-specific identifiers into skill content.
