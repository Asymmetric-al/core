# Samson native Codex Cloud workflow

Samson coordinates native assignments and waiting. Each specialist receives only
its own role/task and returns a normal response. The coordinator-only
[skill](../../ai/skills/samson-factory/SKILL.md) describes delivery through
`develop`; its [protocol](../../ai/skills/samson-factory/references/protocol.md)
covers fresh prompts and short results.

## Install and verify

Use the reviewed AL-1923 branch until it merges. Ensure Node.js, Python 3.11 or
later available as `python3` on PATH, and the exact Bun pin from `package.json`
are available, then run:

```sh
node scripts/factory/setup-cloud.mjs
```

Default setup uses frozen dependency installation, installs native configuration
and personal coordinator guidance, and runs Bun, skill and workspace checks.
`--install-only` installs instructions without dependencies; `--verify-only`
checks existing installation and repository readiness without repairing drift.
Unrelated global configuration/instructions are preserved. Conflicting unmanaged
agent settings require reconciliation instead of being overwritten.

No model API key or production credentials are installed. Optional Mission
Control sandbox setup uses documented development placeholders and is separate
from factory installation; it proves no live database or money correctness.

## Roles and delivery

| Role    | Model         | Reasoning | Assigned access                                              |
| ------- | ------------- | --------- | ------------------------------------------------------------ |
| Samson  | `gpt-6.1-sol` | high      | Git/PR coordination and run note; explicit setup maintenance |
| Ezra    | `gpt-6.1-sol` | high      | Assigned acceptance tests; acceptance verification           |
| Bezalel | `gpt-6.1-sol` | medium    | Assigned implementation and corrections                      |
| Micaiah | `gpt-6.1-sol` | high      | Read-only correctness/completeness review                    |
| Luke    | `gpt-6.1-sol` | high      | Read-only systems/failure review                             |
| Agabus  | `gpt-6.1-sol` | high      | Read-only assessment of supplied disputed findings           |

Use one writer, commit through normal hooks, pause edits and review that exact
commit. Hooks may format content, so review follows committing. Each new candidate
gets current review and acceptance decisions; repeat affected checks. Adjudication
is needed only for actual conflicting or uncertain evidence.

Samson pushes normally through `ci:preflight`, opens a PR to `develop`, handles
CI/review feedback, preserves required human approval and matches the accepted
head when merging. Read back the merge and issue closeout. Configuration grants
no merge/deployment authority. No production release is part of delivery.

## Startup persistence

Current workspace installation is not proof of rebuild persistence. Save the
reviewed bootstrap in the cloud environment's startup/install setting, ensure it
runs in a fresh workspace, then verify installed bytes, native configuration,
rendered role prompts and tool execution in a later shell. A startup-script
export alone does not make PATH persistent; initialize login shells and Husky
or give each command the verified tools directory on PATH.

The repository installer provides the reproducible instruction source. A
self-contained cloud bootstrap may stage those same reviewed files outside the
product checkout until the setup branch merges. It must not require a surviving
old `/workspace/samson-factory` directory or leave product sources modified.

Build-time files under the active `CODEX_HOME` in `/run` can be absent in a new
runtime even when the personal home and staged source survive. The coordinator
skill therefore makes Samson run the retained installer once per chat before
verification or delegation. Keep this instruction in the installed skill;
an environment's Start skill field alone is not proof that a custom task ran it.

The available cloud status connector cannot read/edit the saved startup script
or create a fresh rebuild. Those UI steps remain a separate verification. Do not
claim persistence from an environment revision, successful setup, or a local fixture.

## Runtime boundaries

Canonical roles live in `.codex/agents`; generated skill mirrors come from
`docs/ai/skills/samson-factory`. Installed personal copies are verified snapshots.
CLI profiles disable specialist multi-agent and native configuration limits depth
to one. If a runtime does not load role TOMLs, Samson explicitly passes the own-role
prompt and supported model/effort settings. Shared files are not isolated, and
prompt restrictions are not tool removal. Existing demo contexts are not reused.

The first product trial remains paused until the user requests it. A cloud
template restores files/tools; it does not create a persistent queue controller.
