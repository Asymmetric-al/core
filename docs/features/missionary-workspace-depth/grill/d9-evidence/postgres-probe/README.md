# D9 disposable PostgreSQL probe

Final result: **25/25 outcomes passed**, including four genuine two-session races with observed transaction lock waits and two intentionally unsafe comparison controls. See [database-lifecycle.md](../database-lifecycle.md) for source meaning, proposed clauses and precise limits. This is synthetic PostgreSQL evidence, not Core, P12, hosted Supabase, Auth, API, financial-source or privacy qualification.

Run from repository root using existing Python, Docker and the cached pinned image:

```sh
python3 docs/features/missionary-workspace-depth/grill/d9-evidence/postgres-probe/run.py
```

The runner imports the existing [D1 harness](../../d1-evidence/postgres-probe/run.py), clears inherited Docker connection selectors and explicitly selects `unix:///var/run/docker.sock`. It creates `phase28-d9-pg` with `--network none`, no ports, no host mounts and only synthetic data. Local trust authentication is confined to this disposable fixture, not a deployment recommendation. Image: `postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3`; observed server: PostgreSQL 17.11. No dependencies, Core migrations, hosted connections or provider effects are used.

Artifacts:

- [setup.sql](setup.sql): exact synthetic schema, source-profile keys, constraints, forced tenant RLS, function ownership/ACLs, seeded values and intentionally unsafe functions. All setup commits together.
- [run.py](run.py): exact hypotheses, executing roles, expected results/SQLSTATEs, actual concurrent sessions and cleanup orchestration.
- [results.json](results.json): all 25 outcomes, exact commands/output, fixture publications, four lock waits/session transcripts and SHA-256 hashes of setup, runner, source manifest and imported helper.
- [roles.json](roles.json), [privileges.json](privileges.json): actual nonsuperuser/non-BYPASSRLS actors/executor, table RLS and permissions, function owners, ACLs and search paths. Coaches have no raw facts/history SELECT or source UPDATE.
- [sources.json](sources.json): fresh official source URLs/time/hashes, verified same-day mechanism sources and local owner-source hashes. The first changelog entry's body is `/tmp/phase28-d9-primary/changelog.md`; other entries include their cache paths. Third-party bodies are not copied into the repository.
- [environment.json](environment.json): actual image/server/container/network/ports/volume evidence.
- [cleanup.json](cleanup.json): successful stop and verified absence of container and anonymous volume at `2026-10-16T09:31:10.596048+00:00`.

Two unsafe functions deliberately demonstrate allocation-join multiplication/equal-amount DISTINCT undercount and reconstruction of a hidden received value through a ratio. They are not implementation proposals or current Core vulnerabilities. The ratio is not a valid financial fulfillment measure. Expected SQL errors are asserted denials/constraint behavior, not failed outcomes.

The fixed login-to-tenant mapping is harness identity, not real Auth. The exact-profile boolean gate is an effective-authority stand-in, not P12's additive grants/floors. Input facts stand in for an already purpose-admitted source projection; this test does not implement its classification or privacy rules. Coverage is deliberately seeded test evidence, not certification of a real producer. The NUMERIC integral/finite check tests invalid-input rejection and exact aggregation; production P16 integer-minor-unit types and bounded adapters remain owner-controlled.

The runner verifies cleanup in `finally`, including after a scenario fails. Docker `--rm` removes the container and anonymous volume; both are then inspected for absence. The cached image remains. No actual financial rows, external identities, email addresses, credentials or live systems are involved.
