# D8 disposable PostgreSQL probe

Final result: **35/35 outcomes passed**, including seven real two-session races with observed transaction lock waits and two intentionally unsafe counterexamples. See [database-lifecycle.md](../database-lifecycle.md) for source interpretation, exact limits and proposed clauses. This is synthetic mechanism evidence, not Core, P12, hosted Supabase, Auth, PostgREST or production-policy qualification.

Run from repository root with existing Python, Docker and the cached image:

```sh
python3 docs/features/missionary-workspace-depth/grill/d8-evidence/postgres-probe/run.py
```

The runner imports the existing [D1 harness](../../d1-evidence/postgres-probe/run.py), clears inherited Docker connection selectors, and explicitly selects `unix:///var/run/docker.sock`. It starts a disposable container with `--network none`, no published ports, no host mounts and only synthetic data. Local trust authentication is confined to this isolated fixture; it is not a deployment configuration. The pinned image is `postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3`. The observed server is PostgreSQL 17.11. No package installation, Core migration, hosted connection or provider call is used.

Artifacts:

- [setup.sql](setup.sql): exact synthetic schema, policies, constraints, function ownership/grants, seeded input and intentionally unsafe comparison functions. Setup and permission changes commit together. All tables use forced coarse tenant RLS; coaches have no base-table access.
- [run.py](run.py): cases, role execution, expected results/SQLSTATEs, concurrent session orchestration and cleanup.
- [results.json](results.json): final 35 outcomes, exact input/output, fixture steps, observed lock waits, session transcripts and SHA-256 hashes of the exact runner/setup/source manifest/helper.
- [roles.json](roles.json), [privileges.json](privileges.json): actual role attributes, table grants/RLS, function ownership, execution ACLs and search paths. Normal actors and command executor are nonsuperuser/non-BYPASSRLS; the executor does not own tables.
- [environment.json](environment.json): actual server/image/container/network/port/volume evidence.
- [sources.json](sources.json): fresh primary URL/date/hash records and local owner-source hashes. HTTP bodies remain in the stated temporary research cache; this artifact does not embed third-party documentation wholesale.
- [cleanup.json](cleanup.json): successful stop, verified absent container and absent anonymous volume, with timestamp.
- [development-attempts.json](development-attempts.json): two corrected harness/assertion issues and cleanup evidence, distinguished from the final passing run and from Core findings.

The two unsafe controls deliberately return a tenant-wide total before exact-target filtering, or trust an old synthetic entitlement flag. They are not proposed implementation. The marker standing in for an old JWT is not a real signed token; the trusted login-to-tenant mapping is not an Auth context design. Test dates mark clearly past/future invitation expiry without specifying a product TTL. The organization boolean represents an effective authority result, not the production P12 model.

The final run verifies cleanup even when a scenario fails. `--rm` removes the container and its anonymous volume; the runner then checks both are absent. Existing cached images are retained. No claim is made about browser accessibility, identity assurance, public error envelopes, accepted-access expiry, full projection completeness, arbitrary isolation levels, high-contention workload, or real production permissions.
