# To PRD (upstream)

Installed from **mattpocock/skills** at `skills/engineering/to-prd/SKILL.md`.

- Index: https://skills.sh/mattpocock/skills/to-prd  
- CLI: `npx skills add mattpocock/skills@to-prd -y`

## This repository

Durable product and workflow intent lives in **OpenSpec** (`openspec/specs/**`, `openspec/changes/**`, `openspec/project.md`). Use **`to-prd`** to synthesize a PRD from conversation context; align terminology with existing specs and ADRs. An issue-tracker publish step from the skill does not replace OpenSpec — fold durable decisions into specs/changes per `openspec/specs/agent-instruction-system/spec.md`.

Refresh: re-run the Skills CLI pin, update `skills-lock.json` `computedHash` for `to-prd`, then `bun run skills:sync` and `bun run skills:verify`.
