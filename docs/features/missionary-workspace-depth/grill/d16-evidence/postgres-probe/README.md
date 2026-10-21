# D16 disposable PostgreSQL goal probe

Final result: **25/25 outcomes passed**, including four genuine two-session races with observed transaction lock waits and one intentional unsafe numeric-cast control. See [database-lifecycle.md](../database-lifecycle.md) for exact source interpretation, proposed clauses and limits. These are actual PostgreSQL observations on synthetic data, not Core/P12/hosted Supabase or financial/public integration qualification.

Run from repository root using existing Python, Docker and the cached image:

```sh
python3 docs/features/missionary-workspace-depth/grill/d16-evidence/postgres-probe/run.py
```

The runner imports the [D1 harness](../../d1-evidence/postgres-probe/run.py), clears inherited Docker selectors and explicitly selects `unix:///var/run/docker.sock`. Container `phase28-d16-pg` uses `--network none`, no ports, no host mounts and only synthetic values. Trust authentication is confined to the disposable local fixture. Pinned image: `postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3`; observed server: PostgreSQL 17.11. No dependencies, Core migrations, hosted calls, credentials or real money are involved.

Artifacts:

- [setup.sql](setup.sql): exact typed keys, immutable versions/intents/receipts/audit, coarse forced tenant RLS, current authority/head locks, bounded functions, ACLs and synthetic public/finance sentinels.
- [run.py](run.py): cases, execution roles, expected output/SQLSTATEs, controlled races, fixture-intent preparation and cleanup.
- [results.json](results.json): 25 outcomes, exact input/output, four `Lock:transactionid` waits/session transcripts, atomicity/source-effect checks and setup/runner/source-manifest/helper hashes.
- [roles.json](roles.json), [privileges.json](privileges.json): actual role attributes, table grants/RLS, function owners/search paths/EXECUTE ACLs. The executor is not table owner and has no public-pin or finance rights.
- [sources.json](sources.json): fresh changelog/numeric/INSERT/column-grant sources and verified same-day primary mechanisms; local owner hashes at preparation. External bodies remain in the indicated temporary cache.
- [environment.json](environment.json): observed version/image/container/network/ports/volume evidence.
- [cleanup.json](cleanup.json): successful stop and verified absent container and anonymous volume at `2026-10-16T13:12:38.486758+00:00`.

The unsafe control demonstrates that casting 1.5 to BIGINT rounds to 2; the bounded command rejects fractional input before casting. Expected permission, immutability, FK and audit errors are passing assertions, not current Core findings.

The gate represents exact effective **edit permission**, not a goal-use/visibility/requirement mode or real P12 policy model. Fixed login identity is harness context, not Auth. Immutable captured intent is a test mechanism for semantic retry identity, not a proposed new generic command framework. Positive new targets are a candidate input rule; zero/null rejection does not decide clearing/ending or prove that zero is an intentionally configured goal. The typed project fixture proves key mechanics only: a real project may belong to P13 and must not acquire a shadow P28 goal. One test slot per subject is not production goal cardinality. Currency-change test input is explicit new-version meaning, not authorization for casual currency reassignment or FX.

Public/finance tables are negative-effect sentinels. No real approved Plan adoption, payment, contribution, commitment, P22 release, ratio, goal-history rebase or outbound effect is implemented. Cleanup runs in `finally` even after a scenario failure; Docker `--rm` removes the container and anonymous volume and the runner verifies both absent. The cached image remains.
