# Disposable Phase 27 D3 PostgreSQL mechanics evidence

Research only, 2026-10-09. This is deliberately synthetic SQL, not a proposed Asym migration, lifecycle, authorization implementation or performance test.

## Reproduce

Requirements: Python 3, Docker CLI and a local Docker daemon at `/var/run/docker.sock`. No application environment or database credentials are needed. The runner removes Docker remote-context variables, uses the explicit local socket, refuses an existing container of the same name, creates a fresh network-disabled container with no published port/host mount, and removes it in a `finally` block. It does not remove the image. The trust setting applies only inside this isolated disposable container.

Fetch the immutable image if not already present:

```sh
env -u DOCKER_HOST -u DOCKER_CONTEXT -u DOCKER_TLS -u DOCKER_TLS_VERIFY -u DOCKER_CERT_PATH docker --host=unix:///var/run/docker.sock pull postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24
```

Run from any directory with these files kept together:

```sh
python3 /workspace/scratch/phase27-d3-db/run-lab.py
```

`run-lab.py` invokes `mechanics.py`, which creates `setup.sql` and `results.json` next to itself. The runner records the exact create command, immutable image digest, timestamps, cleanup result, exit code, stderr and isolation limits in `run-metadata.json`. For a copied evidence directory, replace the absolute invocation path with that copy's path. No repository database helper, Supabase CLI reset, remote URL, application migration or seed is invoked.

## Observed run

PostgreSQL 17.11; 21/21 mechanics checks passed. Container removed and absence verified. Exact image: `postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24`. Resource limits: 256 MiB container memory, one CPU, 128 MiB ephemeral database tmpfs. These are isolation settings, not capacity recommendations.

The CTE and two-statement races use an explicit scheduling barrier: A opens a transaction and inserts a row, B attempts the competing insert, an observer queries `pg_stat_activity` and `pg_blocking_pids` until B is proven blocked by A, and only then is A permitted to commit. Polling is bounded to ten seconds. Both observed waits were `Lock` / `transactionid`. This supersedes the earlier sleep-based scheduling sample; there is no `pg_sleep` in the final fixture. The separate contention sample submits 16 operations to a pool with at most eight concurrent client workers. It does not claim 16 simultaneous connections or measured throughput.

The fixture demonstrates required-scope FK checks, NOT NULL, nullable CHECK/UNIQUE/FK pitfalls, NULLS NOT DISTINCT, a deliberately bad lifecycle partial index, transactional rollback versus separately committed calls, an RLS-hidden uniqueness conflict, CTE snapshot behavior and a fresh READ COMMITTED lookup. Synthetic `toy_state` values are counterexamples, not product enums; the hypothetical ordinary-lane key is not a frozen source schema.

## Qualification limits

The actor is a synthetic SQL role. Neither source admission nor P12 capability/epoch verification is implemented here. No Supabase Auth/Data API/PostgREST deployment, actual schema/migration, production version, command receipt, current lifecycle, merge/backfill/recovery path or native/workflow effect integration was tested. Separate authorized reload is a candidate mechanism only after source-owner authorization and lifetime semantics are settled. The test does not justify returning a hidden row, using service-role bypass, or exposing different success/conflict responses to a caller without admission observability authority.
