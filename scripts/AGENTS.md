# Scripts Workflow Rules

**Name:** `scripts-workflow-rules`
**Purpose:** Rules for operational scripts that apply migrations, seed demo data, verify seeded integrity, and maintain the agent-instruction system.

## Triggers

Use this doc when editing or running:

- `scripts/seed-demo.sh`
- package scripts related to database migration/seed/verification
- shell automation that touches Supabase data
- agent-skill sync or verify scripts (`scripts/sync-agent-skills.mjs`, `scripts/verify-skills-sync.mjs`)

## Workflow Steps

1. Keep scripts non-interactive and safe-by-default.
2. Require explicit env vars for hosted operations.
3. Never print secrets or embed credentials in script output.
4. Validate project targeting before hosted writes.
5. Provide a verification command with explicit row-count checks.
6. Prefer Bun/Node with `node:path`, `node:fs`, argument arrays, and `shell: false` for new or changed maintenance tooling. Avoid Bash-only canonical workflows, hardcoded `/tmp`, `sed -i`, and symlink-only designs.
7. `bun run skills:sync` **mutates** generated mirrors. `bun run skills:verify` **must not** change the working tree.

## Seed Script Added (2026-02-16)

- `scripts/seed-demo.sh`
  - `local`: runs `supabase db reset --local` (migrations + seed).
  - `hosted`: requires `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, and `NEXT_PUBLIC_SUPABASE_URL`; applies migrations then executes `supabase/seed.sql`.
  - `verify`: runs table row-count and single-profile checks via SQL.

## Agent skill maintenance

- Canonical skills: `docs/ai/skills/*/SKILL.md`.
- Generated mirrors: `.agents/skills/`, `.cursor/skills/`, `.claude/skills/`. Do not hand-edit mirrors.
- Successful `skills:verify` leaves `git status` unchanged. Drift message: run `bun run skills:sync` and commit mirror updates.
- Overlayfs can reject same-directory `rename` of lower-layer skill directories with `EXDEV`. `scripts/sync-agent-skills.mjs` falls back to copy then remove. Tests set `CORE_SKILLS_SIMULATE_RENAME_EXDEV=1` to exercise that path.

## Checklist

- [ ] Hosted mode requires explicit env vars and target URL validation
- [ ] Script output avoids secrets
- [ ] Commands fail fast (`set -euo pipefail`)
- [ ] Verification mode checks seeded table counts and profile singleton condition
- [ ] Skill verify is non-mutating; skill sync is the write path
