# Answers to common questions

Use this when the user asks how OpenSpec works or how to set it up. Check an answer against the CLI's own help (`bun run openspec -- <command> --help`) before you rely on a flag.

## Where things live

- `openspec/specs/<capability>/spec.md`: how the system behaves today, as requirements with scenarios.
- `openspec/changes/<name>/`: one planned change. Usually `proposal.md`, `specs/` (the spec updates), `design.md` (optional), and `tasks.md`.
- `openspec/changes/archive/`: finished changes.
- `openspec/config.yaml`: the project's schema, `context` lines every agent reads, and per-artifact `rules`.
- `openspec/project.md`: Core's human-oriented OpenSpec index.

## Checking things

- What is in progress: `bun run openspec -- list`. The specs: `bun run openspec -- list --specs`.
- Where one change stands: `bun run openspec -- status --change "<name>"`.
- Read a change or a spec: `bun run openspec -- show "<name>"`.
- Check the files are well formed: `bun run openspec -- validate "<name>" --strict`, or `bun run openspec:validate`.
- Check active deltas and contracts: `bun run verify:openspec-deltas`.
- A dashboard of everything: `bun run openspec -- view`.

## Setting things up

- Core keeps OpenSpec pinned locally (`skillsScope: project` in `openspec/config.yaml`) and hand-maintains repo instructions. Do not run `openspec init`, `openspec config profile`, or `openspec update` against this live customized repository.
- Refresh the curated canonical skills under `docs/ai/skills/` with `node scripts/refresh-upstream-skills.mjs --only=Fission-AI/OpenSpec`, then run `bun run skills:sync` and `bun run skills:verify`.
- Teach agents something about this project: add a short line under `context` in `openspec/config.yaml`. Edit the file only after the user approves the wording.
- Core uses the built-in `spec-driven` schema and keeps `openspec/project.md` as its index. Do not enable custom schemas.

## Stores

Core does not enable OpenSpec Stores. Keep all specs and changes in this repository's local `openspec/` tree.

## Something is wrong

- Run `bun run openspec -- doctor`, `bun run openspec:validate`, and `bun run verify:openspec-deltas` and read what they report.
- To tell the maintainers, use `bun run openspec -- feedback "<message>"`, after the user approves the message.
