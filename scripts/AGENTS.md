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
- Overlayfs can reject skill-directory `rename` with `EXDEV`. Both skill scripts permit copy/remove fallback only for `EXDEV` into an unoccupied destination, preserve complete backups before removing live trees, and retain recovery data when restoration fails. Run `bun x vitest run tests/unit/scripts/sync-agent-skills-exdev.test.ts tests/unit/scripts/skill-refresh-transaction.test.ts tests/unit/scripts/skill-scanner-syntax.test.ts tests/unit/scripts/skill-scanner-context.test.ts tests/unit/scripts/skill-publication-entry-safety.test.ts tests/unit/script-verifiers.test.ts`; the EXDEV fixtures include occupied-destination and partial-removal failures.

- Canonical destinations must be real directories; reject symlinks before reading overlays or replacing entries. Preserve competing entries and propagate publication errors, including ecosystem mirrors, instead of reporting success.
- Scanner adaptations must preserve execution, rendered JSX and literal payloads. Leave uncertain comment contexts intact and subject to scanning; do not add scanner exclusions.

## Checklist

- [ ] Hosted mode requires explicit env vars and target URL validation
- [ ] Script output avoids secrets
- [ ] Commands fail fast (`set -euo pipefail`)
- [ ] Verification mode checks seeded table counts and profile singleton condition
- [ ] Skill verify is non-mutating; skill sync is the write path
