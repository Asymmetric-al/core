# Where things stand

Use this when the user asks where things stand or what to do next. Look before you answer:

- `bun run openspec -- list --json` lists the changes in progress.
- `bun run openspec -- status --change "<name>" --json` shows which parts of a change's plan exist and what comes next. `bun run openspec -- status --all --json` does this for every change.
- `bun run openspec -- show "<name>"` prints a change or a spec.
- Core uses only the repository-local `openspec/` tree; external Stores are not enabled.

Say where things stand in a sentence or two, name the next step and the skill that does it, and offer to do it. Do not start it until they say so.
