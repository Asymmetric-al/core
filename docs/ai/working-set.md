# Working Set

Agents MUST keep this file updated during a task. Use it to build the Nia query preamble.

## Current objective
- Integrate Supabase-origin AI skills for Cursor-ready usage.
- Add canonical skills for Postgres best practices and Next.js + Supabase Auth.
- Sync canonical skill docs to runtime locations (`.agents/skills` and `.cursor/skills`).

## Repo scope
- repository: Asymmetric-al/core
- in-scope paths:
  - AGENTS.md
  - README.md
  - docs/ai/rules/backend.md
  - docs/ai/skills/supabase-postgres-best-practices/**
  - docs/ai/skills/nextjs-supabase-auth/**
  - scripts/sync-agent-skills.mjs
  - docs/ai/working-set.md

## Stack tags
- Markdown
- Next.js
- Supabase Auth
- Supabase Postgres
- Agent skills
- Cursor

## Known identifiers
- files:
  - AGENTS.md
  - docs/ai/rules/backend.md
  - scripts/sync-agent-skills.mjs
- strings:
  - supabase-postgres-best-practices
  - nextjs-supabase-auth
  - bun run skills:sync
  - .agents/skills
  - .cursor/skills

## Expected behavior
- Supabase skills are canonical under `docs/ai/skills/*`.
- `AGENTS.md` skill registry/index routes auth/db tasks to the new skills.
- Runtime mirrors are generated in `.agents/skills/*` and `.cursor/skills/*` through one sync command.

## Constraints
- Keep application/runtime behavior unchanged.
- Keep skill integration deterministic and documented.
- Do not include secrets or credentials.

## Verification
`rg "supabase-postgres-best-practices|nextjs-supabase-auth|skills:sync" -n AGENTS.md README.md docs/ai/rules/backend.md package.json`
`node scripts/sync-agent-skills.mjs`
`rg "supabase-postgres-best-practices|nextjs-supabase-auth" -n .agents/skills .cursor/skills`

## Verification status
- Pending execution after edits.
