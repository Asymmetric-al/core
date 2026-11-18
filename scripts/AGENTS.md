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

## Reset and reseed rule

Every script that resets or reseeds a database reads its environment marker first and refuses anything not marked `disposable` (plan 7.5): `scripts/lib/environment-marker.mjs` (`requireDisposableDatabase`), `node scripts/db/require-disposable-database.mjs --local | --url-env NAME` for shell scripts, and the reset guard inside `scripts/supabase-cli.mjs` for every `bun run supabase -- db reset`. A database with no marker, or whose marker cannot be read, is refused, and there is no override flag. A local stack without a marker is recovered once with `bun run supabase -- stop --no-backup` and `bun run supabase -- start` (see `supabase/AGENTS.md`, "Reset rule").

Scripts that run `psql` against a database URL use `scripts/lib/psql.mjs`, which passes the password in `PGPASSWORD`, never in the argument list, and holds the one list of loopback hosts.

## Seed script

- `scripts/seed-demo.sh`
  - `local`: runs `bun run supabase -- db reset --local` (migrations + seed).
  - `hosted`: retired (WP0, audit finding NA-03). It always refuses and touches no database: `supabase/seed.sql` deletes every organization's rows before it reseeds. A hosted database is seeded only by the release job's one-off first rebuild (`docs/ops/release-job.md`).
  - `verify`: runs table row-count checks and the fixture identity check (three profiles, two tenants, their live memberships) via SQL against a loopback `SUPABASE_DB_URL`.

## Agent skill maintenance

- Canonical skills: `docs/ai/skills/*/SKILL.md`.
- Runtime trees: `.agents/skills/` holds generated copies of the canonical skills plus ecosystem-origin skills, which are owned there. `.cursor/skills/` and `.claude/skills/` are generated mirrors of that full set. Do not hand-edit a generated copy.
- Successful `skills:verify` leaves `git status` unchanged. Drift message: run `bun run skills:sync` and commit mirror updates.
- Overlayfs can reject skill-directory `rename` with `EXDEV`. Both skill scripts fall back to copy then remove only into an unoccupied destination, keep a complete backup before removing a live tree, and retain that backup when restoration fails. Canonical destinations must be real directories. Scanner adaptations must preserve execution, rendered JSX, and literal payloads.

## Core factory pack

- `scripts/archon-factory/` is the software factory that runs on the private factory VM: the Archon workflow pack, its installer and qualification scripts. Read `scripts/archon-factory/README.md`, `scripts/archon-factory/pack/README.md` and `docs/ops/archon-vm100-factory-runbook.md` before changing it.
- The trusted scripts under `pack/.shared/` decide admission, leases, publication and merge authority. Change them test-first (`tests/unit/scripts/archon-*.test.ts`), and never weaken a gate, hook, identity check or cleanup hold to make a run pass.
- A changed pack is a new release: it reaches the VM only through `installation/install.mjs`, as the runbook's Updates section describes.

## Checklist

- [ ] No script seeds or resets a hosted database; reset and reseed scripts refuse a database not marked `disposable`
- [ ] Script output avoids secrets
- [ ] Shell scripts fail fast (`set -euo pipefail`)
- [ ] Verification mode checks seeded table counts and the fixture identity counts
- [ ] Skill verify is non-mutating; skill sync is the write path
