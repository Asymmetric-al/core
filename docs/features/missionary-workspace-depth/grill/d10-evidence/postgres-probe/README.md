# D10 disposable PostgreSQL history probe

Final result: **23/23 outcomes passed**, including five real two-session races with observed transaction lock waits and two intentional unsafe controls. See [database-lifecycle.md](../database-lifecycle.md) for the source interpretation, proposed clauses and limits. This proves bounded synthetic PostgreSQL mechanics, not Core financial producers, P12 privacy, hosted Supabase or Auth/API behavior.

Run from repository root with existing Python, Docker and the cached image:

```sh
python3 docs/features/missionary-workspace-depth/grill/d10-evidence/postgres-probe/run.py
```

The runner reuses the [D1 harness](../../d1-evidence/postgres-probe/run.py), clears inherited Docker selectors and explicitly selects `unix:///var/run/docker.sock`. Container `phase28-d10-pg` uses `--network none`, no ports, no host mounts and only synthetic values. Trust authentication is confined to this disposable local fixture. Pinned image: `postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3`; observed server: PostgreSQL 17.11. No dependencies, Core migrations, real credentials, hosted services or sending are involved.

Artifacts:

- [setup.sql](setup.sql): exact test schema, fixed finite range, immutable actor-accessible preview inputs, source-date/creation-time facts, function ACLs/ownership, forced tenant RLS and unsafe creation-time control. Setup commits together.
- [run.py](run.py): all cases, roles, expected outputs/SQLSTATEs, controlled session races, source publication/reset steps and cleanup.
- [results.json](results.json): 23 outcomes, inputs/outputs, five `Lock:transactionid` waits/session transcripts, retained-source snapshot evidence, and exact setup/runner/source-manifest/helper hashes.
- [roles.json](roles.json), [privileges.json](privileges.json): actual role attributes, table permissions/RLS and function owners/search paths/execution ACLs.
- [sources.json](sources.json): fresh changelog/range/date URLs/times/hashes and verified same-day primary mechanism sources. Downloaded bodies remain in the stated temporary cache. Local owner hashes record the sources at probe preparation.
- [environment.json](environment.json): observed version, image ID, network/ports and anonymous volume.
- [cleanup.json](cleanup.json): successful stop and verified absent container/volume at `2026-10-16T10:09:11.179476+00:00`.

The two unsafe controls are a creation-time aggregate that misplaces source-dated gifts and a pure date expression that turns a saved relative lookback into different dates when reevaluated later. They are counterexamples, not implementation proposals or current Core findings. Expected denied SQL is asserted behavior, not a failed test.

Dates/months and the captured ceiling are illustrative, not selected lookback/expiry/current-period rights. Facts stand in for already-qualified current effective received inputs; no expected-support producer, correction chain or privacy engine is implemented. Completeness is test input. The exact gate/revision is a current-authority stand-in, not real P12 additive permission logic. Preview CAS is not a full durable retry/audit protocol. Source-manager and administrator reset/publication steps are fixture control, not permission to revive a terminal sharing episode.

Cleanup runs in `finally` even on scenario failure. Docker `--rm` removes the container and anonymous volume; both are inspected for absence. The cached image is retained. All files are research artifacts outside application and migration paths.
