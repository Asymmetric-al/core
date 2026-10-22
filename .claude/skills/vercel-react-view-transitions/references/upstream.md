---
source_name: vercel-labs/agent-skills (vercel-react-view-transitions)
license: MIT
ref: 73140fc5b3a214ad3222bcf557b397b3c02d11c1
---

# Upstream Source (Attribution)

This repo-local skill `docs/ai/skills/vercel-react-view-transitions/` is adapted from Vercel Labs' Agent Skills repository:

- Skills.sh page: https://skills.sh/vercel-labs/agent-skills/vercel-react-view-transitions
- GitHub repo: https://github.com/vercel-labs/agent-skills
- Install command (upstream): `npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-view-transitions`

Notes:

- Upstream repo `README.md` states license: MIT.
- The upstream path for this ref is `skills/react-view-transitions/SKILL.md` (the public skill name remains `vercel-react-view-transitions`).
- The upstream skill ships reference files (`references/*.md`) for CSS recipes, Next.js patterns, and implementation workflow; this repo folds the **monorepo-specific** guidance into `SKILL.md` and keeps this file for provenance only.

## Reviewed compiled-guide refresh 2026-10-22

Reviewed `vercel-labs/agent-skills` at `063bee94c3f4df8453406c830b0a7df0f2860278`. The installed entrypoint and all five topic references already match this source after repository formatting. Replaced only the stale compiled `AGENTS.md` so it no longer contradicts those source references on browser requirements, untyped back/forward transitions, deliberate `default="none"`, shared-element readiness, focused CSS recipes and persistent portal snapshots. Core's root instructions, exact Base UI/base-maia system, installed Next.js and React documentation, and reduced-motion policy remain authoritative.

The optional `metadata.json` is source-authoring catalog metadata and is not read by the installed workflow or references. It is not needed to execute the installed skill and does not replace the version-matched source references. The immutable source is documented separately from this Core adapter's original provenance pin.

The upstream compiled guide concatenates topic files without rebasing their relative links. Core rebases those links in `AGENTS.md` to `references/<topic>.md` and `SKILL.md`; topic source files remain unchanged. Preserve this repair whenever the compiled guide is refreshed.
