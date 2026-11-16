# Core software factory (VM 100, Archon 0.14.0)

| Path                                                   | What it is                                                                                                                                                                                                                           |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pack/`                                                | The installed Core workflow pack: workflows, trusted scripts, role prompts. Start with `pack/README.md`.                                                                                                                             |
| `pack/.shared/roles/*.md`                              | Adapted Samson, Ezra, Bezalel, Micaiah, Luke and Agabus role prompts (sources: `.codex/agents/*.toml`, `docs/ai/skills/samson-factory/`).                                                                                            |
| `build-pack.mjs`                                       | Generates role command files and `roles/manifest.json`; `--check` fails on drift.                                                                                                                                                    |
| `installation/install.mjs`                             | Root installer/upgrader for VM 100 (pinned binary hashes, control folder, services). It verifies every piece before changing anything and refuses a policy switch while work is live; its pure decisions are in `install-logic.mjs`. |
| `qualification/`                                       | Live qualification scripts (executor cleanup, candidate views, hook-aware publication).                                                                                                                                              |
| `README.check-executor.md`, `README.candidate-view.md` | Contracts of the executor and exact candidate views.                                                                                                                                                                                 |

Operations: `docs/ops/archon-vm100-factory-runbook.md`. Commissioning evidence
and blockers: `docs/ops/archon-vm100-commissioning.md`. Governing change:
`openspec/changes/commission-core-archon-vm100/`.

Focused verification from the repository root:

```sh
node scripts/archon-factory/build-pack.mjs --check
bunx vitest run tests/unit/scripts/archon-*.test.ts
```

Workflow validation and route fixtures need the pinned engine (VM 100):
`archon validate workflows core-deliver` and `archon workflow test core-deliver`
from the control folder.
