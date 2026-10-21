# D17 disposable PostgreSQL contact-intake probe

Final result: **30/30 outcomes passed**, including eight actual two-session races with observed transaction lock waits and one intentionally unsafe identity-key control. See [database-lifecycle.md](../database-lifecycle.md) for owner interpretation, proposed clauses and exact limitations. This is synthetic PostgreSQL mechanism proof, not Core/P30/P29/P9/P12, hosted Supabase, matching, privacy or provider qualification.

Run from repository root using existing Python, Docker and the cached image:

```sh
python3 docs/features/missionary-workspace-depth/grill/d17-evidence/postgres-probe/run.py
```

The runner imports the [D1 harness](../../d1-evidence/postgres-probe/run.py), clears inherited Docker selectors and explicitly selects `unix:///var/run/docker.sock`. Container `phase28-d17-pg` uses `--network none`, no ports, no host mounts and synthetic rows only. Trust authentication is confined to this local disposable fixture. Pinned image: `postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3`; observed server: PostgreSQL 17.11. No dependencies, live/Core data, migration, upload or sending is involved.

Artifacts:

- [setup.sql](setup.sql): exact synthetic schema, immutable plans/rows/lineage/outcomes, scoped FKs/unique keys, coarse forced RLS, bounded approval/claim/accept/cancel functions and role ACLs.
- [run.py](run.py): input rows, expected results/SQLSTATEs, actual executing roles, controlled transactions, target/gate/claim fixture steps and cleanup.
- [results.json](results.json): all 30 outcomes, commands/output, eight actual `Lock:transactionid` waits, session evidence, source-count assertions, lease-expiry rollback and artifact/helper hashes.
- [roles.json](roles.json), [privileges.json](privileges.json): seven actual nonsuperuser/non-BYPASSRLS roles, table rights/RLS, function ownership/search paths/ACLs. Ordinary missionary/staff/worker logins have no raw tables; the isolated policy-manager role has gate rights, and the executor has no dark-effect rights.
- [sources.json](sources.json): three freshly fetched primary documents, ten verified same-day mechanism sources and six local owner-source hashes. External bodies remain in the stated temporary cache.
- [environment.json](environment.json): observed version, image ID, container/network/ports/volume.
- [cleanup.json](cleanup.json): successful stop and verified absence of container and anonymous volume at `2026-10-16T13:53:49.651651+00:00`.

Final integrity verification matched the executed SQL/runner/source-manifest/helper hashes, all 13 cached primary source bodies and five stable local owner files. The sixth local source, Q17 research, changed during the parent review: its recorded pre-answer hash is `ed4b1bc106787ed0ec9f1dd6682b3721face619e8c8c6bccaf1119f3e324b886`; the subsequent working-tree hash was `2cf17a66adf7e8d27516ec54c796c105dc83abc8251a8a44bb446061ab1dc456`. That manifest entry identifies the inspected historical version, not the current Q17 text. The evidence manifest was preserved; this documentation change did not require rerunning unchanged SQL.

The identity control deliberately shows that file/row keys duplicate two records and that ordinal matching rebinds them after reorder. It is not proposed logic or a current Core finding. Expected denials, constraint failures and the expiry-race `40001` rollback are passing assertions.

Only already-qualified stable source IDs are tested. Namespace, bytes, normalized fields, target admission and candidate decisions are seeded assumptions. New-source review is not automatic matching. Already imported means accepted lineage, not current target equality. No-ID file recovery, same-byte run reuse, actual parser/storage, hidden-match safety and consent-source admission remain unproved.

The selected initial profile adds or reuses admitted preparation only. The separate synthetic target-edit command increments a revision to test interference; it neither imports replacement fields nor qualifies an intake update capability.

The effective gate and worker-to-originator mapping stand in for current source/P12 context, not a new permission model. Leases use illustrative five-minute and two-second values; no product duration or queue design is selected. Cancellation stops new acceptance and keeps prior accepted rows. Per-row failure does not imply whole-batch rollback. A final expiry check accounts for a genuine target-lock wait before an outcome can commit.

The dark-effect table is only a sentinel: no real automation, send, enrollment, grant or financial path is connected. A row containing adverse contact evidence needs its actual qualified consent-owner/gate receipt; this probe does not certify that adapter. Complete result-reader, scheduler/cursor, crash/failover and production workload behavior are outside the proof.

Cleanup runs in `finally` after success or scenario failure. Docker `--rm` removes the container and anonymous volume and the runner verifies both absent. The cached image remains. All artifacts stay outside application and migration paths.
