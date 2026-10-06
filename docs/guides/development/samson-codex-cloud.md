# Samson native Codex Cloud workflow

Samson coordinates native assignments and waiting. Each specialist receives only
its own role/task and returns a normal response. The coordinator-only
[skill](../../ai/skills/samson-factory/SKILL.md) describes delivery through
`develop`; its [protocol](../../ai/skills/samson-factory/references/protocol.md)
covers fresh prompts and short results.

## Hosted startup: read-only validation

Each hosted coordinating chat validates retained/personal coordinator guidance,
the handoff protocol, workspace coordination policy, six role sources/copies and
available native tools read-only. Compare reviewed retained bytes, parse all six
TOMLs, retain each role's own instructions and requested model/effort, and verify
shell/Git/GitHub, Python 3.11+ and reviewed Node/Bun pins. Confirm native spawn,
task-starting follow-up, waiting and `update_plan` are registered and available.
Missing, malformed, mismatched or unavailable required assets/tools are BLOCKED;
do not install, synthesize fallbacks or repair homes/permissions.

Hosted startup does not require installation into active `CODEX_HOME` and does
not require local CLI verification or launching local app-server state. An absent
or read-only active home is supported. After validation, use fresh native
own-role handoffs. The read-only exported `validateHostedStartup` helper in
`scripts/factory/validate-hosted-startup.mjs` accepts retained `sourceRoot`,
personal `home`, `workspaceRoot`, explicit `expectedNodeVersion` and
`expectedBunVersion`, and the coordinator's observed `nativeTools` inventory:
`collaboration.spawn_agent`, `collaboration.followup_task`,
`collaboration.wait_agent`, `update_plan`. The inventory is an observed
capability input, not evidence of enforcement or actual role execution. Pins
come from reviewed environment tooling/current repository requirements, not from
the retained package, which need not contain full repository manifests.

The bounded #1955 startup-repair exception permits read-only diagnosis and
retained asset/tool validation, independent acceptance and the repository repair
without first running the failing active-home installer. It does not skip other
gates or authorize product work; #1954 remains paused in its existing assignment
until actual fresh hosted qualification passes.

## Explicit local installation and verification

For an explicitly authorized local CLI installation, ensure Node.js, Python
3.11+ as `python3`, and the exact Bun pin from `package.json` are available:

```sh
node scripts/factory/setup-cloud.mjs
```

Default setup uses frozen dependency installation, installs native configuration
and personal coordinator guidance, and runs Bun version, lockfile drift, skill
and workspace checks. `--install-only` installs instructions without dependencies;
`--verify-only` checks the existing local installation and repository readiness
without repairing drift. `install-native.mjs` retains its explicit installation,
`--verify-only` and `--plan-only` behavior. These local commands are not hosted
startup prerequisites. They preserve unrelated settings and report conflicts.
No model API key or production credentials are installed. Optional Mission
Control sandbox setup remains separate and proves no live database or money
correctness.

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

Samson maintains the native Steps plan with role/stage labels, current handoffs,
review results, repairs, blockers and approval waits. Concurrent reviewers share
one active step. Progress updates identify the branch, candidate SHA and PR.

The assigned worker pushes normally through `ci:preflight`, opens a PR to
`develop`, resolves feedback and returns DELIVERY_READY with the exact candidate,
acceptance revision, independent reviews, final PASS and current-head required
checks. It stops before merge. David, the root coordinator, refreshes protections,
required human approval and checks, performs only the authorized protected
expected-head merge, verifies actual merge evidence and returns it to the same
worker for bounded closeout. Configuration grants no merge/deployment authority;
verified merge plus successful same-worker closeout precedes delivery completion.

## Startup persistence

Current workspace installation is not proof of rebuild persistence. Save the
reviewed bootstrap in the cloud environment's startup/install setting, ensure it
runs in a fresh workspace, then verify installed bytes, native configuration,
rendered role prompts and tool execution in a later shell. A startup-script
export alone does not make PATH persistent; initialize login shells and Husky
or give each command the verified tools directory on PATH.

The repository installer provides the reproducible instruction source. Configured home aliases are resolved to their canonical roots; linked directories inside role and personal-skill destinations are rejected before files are read or changed. A
self-contained cloud bootstrap may stage those same reviewed files outside the
product checkout until the setup branch merges. It must not require a surviving
old `/workspace/samson-factory` directory or leave product sources modified.

Build-time active `CODEX_HOME` files may be absent in a fresh runtime while
personal guidance and retained sources survive. Hosted startup validates those
readable assets and native tools without active-home installation. Explicit
installation/configuration is a separate authorized path, not a per-chat repair.

For #1955, repository R1–R5 acceptance may support the root's protected merge;
H1–H2 remain separate postmerge gates before full repair or #1954 resumption.
Root creates an authorized fresh named Samson Core Factory setup-only session,
records actual configuration/admission version, source revision and consumed
coordinator/role hashes, and verifies actual fresh native own-role handoffs and
normal returns for all six configured roles with no active-home writes. Keep
watched assets unchanged and the product checkout clean. Fixtures and parsed
configuration alone do not satisfy this execution requirement.

Compare consumed instructions with repaired source and saved configuration.
A merge, catalog revision or unpublished Start artifact does not prove startup
publication or consumption. Report stale saved/personal/embedded copies and the
precise supported reconciliation/publication needed to root; do not edit or
publish environment settings implicitly. Root obtains actual publication evidence
and repeats fresh-session verification when a saved configuration change is
needed. Requested model/effort remain distinct from verified effective settings.
Do not use PR closing keywords to close #1955 before H1–H2 verification.

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

Reviewers and final acceptance inspect contributor-supplied reproduction commands
and their scripts before execution. They run them only in a disposable,
credential-free sandbox with network denied by default and writes limited to
the candidate checkout. Without that isolation, they report missing evidence;
the shared workspace and role configuration do not establish the boundary.

The first product trial remains paused until the user requests it. A cloud
template restores files/tools; it does not create a persistent queue controller.
