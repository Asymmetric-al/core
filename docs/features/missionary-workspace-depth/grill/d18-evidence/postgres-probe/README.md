# D18 disposable PostgreSQL suggestion and budget probe

Final result: **35/35 outcomes passed, eight actual two-session races** with observed `Lock:transactionid` waits. See [database-lifecycle.md](../database-lifecycle.md) for owner evidence, proposed safeguards and exact limits. This is synthetic PostgreSQL mechanism proof, not Core/P12, hosted Supabase, model/provider, billing, content-safety or privacy qualification.

Run from repository root with existing Python, Docker and the cached image:

```sh
python3 docs/features/missionary-workspace-depth/grill/d18-evidence/postgres-probe/run.py
```

The runner imports the unchanged [D1 harness](../../d1-evidence/postgres-probe/run.py), clears inherited Docker endpoint/context/TLS selectors and explicitly uses `unix:///var/run/docker.sock`. Container `phase28-d18-pg` has `--network none`, no ports, no host mounts and synthetic rows only. Trust authentication is confined to this disposable local fixture. Pinned image: `postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3`; observed PostgreSQL 17.11. No dependency install, real credentials, upload, provider call or sending occurs.

Artifacts:

- [setup.sql](setup.sql): exact synthetic schema, role grants, forced coarse tenant RLS, binding/source constraints, immutable evidence, budget/request and suggestion read/application commands.
- [run.py](run.py): seeded hypotheses, expected results/SQLSTATEs, executing roles, controlled races and cleanup.
- [results.json](results.json): 35 outcomes, exact commands/output, eight lock waits, rollback/source-count evidence and executed-artifact/helper hashes.
- [roles.json](roles.json), [privileges.json](privileges.json): seven nonsuperuser/non-BYPASSRLS roles and observed table/function rights. Ordinary actors and worker have no raw tables. Policy manager has gate/route rights. Executor has no send-sentinel rights.
- [sources.json](sources.json): one fresh changelog, twelve verified same-day primary sources, four owner-source hashes. Referenced external bodies are in the stated temporary cache.
- [environment.json](environment.json): image ID, actual version and network/port/volume observations.
- [cleanup.json](cleanup.json): successful stop and verified absence of container and anonymous volume at `2026-10-16T15:44:34.499051+00:00`.
- [development-attempts](development-attempts/01-before-null-input-review/reason.json): first 34/34 run preserved before static review found missing NULL-input refusal. The final added case rejects missing voice/output marker/revision before live suggestion application. Archived runners preserve historical source; use the root runner above to reproduce the final proof.

Request identity is tenant/actor/purpose/intent, pinned to a saved source and immutable binding. Same intent cannot reserve twice; changed meaning conflicts. Source Use is separately unique per suggestion, regardless of transport retry key. It creates one successor, required evidence and body-row deletion atomically. A prior receipt stays revision 2 even after a manual revision 3; current authority still gates the endpoint.

Budget numbers are **60 fixed integer reservation units per invocation**, not actual money, token prices or calendar windows. All holds remain held, including successful calls; settlement/release/reconciliation are not implemented. Unknown observations cannot be blindly redispatched and cannot free the held capacity. Actual provider charges, idempotency and inspection remain unproved. No SQL transaction spans network work; the result worker merely records synthetic observations and is not a qualified dispatch/egress adapter.

The source/authority/binding markers are seeded assumptions, not actual source manifests, P12 tokens, capability certification or cryptography. One effective gate stands in for separate current capabilities and classification. Voice choices and body TTLs are illustrative. There is no selected product catalog or universal retention duration.

Bodies are synthetic plaintext. SQL deletion on Use proves row disposition only, not encryption, cryptographic/physical erasure, WAL/backup/provider deletion or a cleanup sweep. Expired/source-stale/revoked reads are denied where tested; early erasure on Discard/revocation/supersession and restoration are unproved. Fixed evidence notes and output markers contain no real body, but this is not a production log-redaction proof. The empty send-sentinel is disconnected from actual producers and cannot prove end-to-end absence of autonomous sending.

Cleanup executes in `finally`; Docker `--rm` removes the container and anonymous volume, then the runner verifies both absent. The cached image remains. All artifacts are confined to research documentation, outside application and migration paths.
