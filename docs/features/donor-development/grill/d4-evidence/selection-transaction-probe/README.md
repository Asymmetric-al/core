# D4 selection and transaction counterexamples

Research only, 2026-10-09. Seven SQL mechanics checks passed on disposable
PostgreSQL 17.11. This fixture is neither Core implementation nor a proposed
schema, admission/authorization engine, batch framework or performance test.

## Findings

1. A committed review initially selected IDs `1,2`.
2. After review, ID `3` entered the filter and ID `2` left it. Executing the live
   filter selected `1,3`: both unreviewed inclusion and silent exclusion.
3. Stored membership still selected `1,2`. This preserves intended identities
   only; current eligibility, authority and source meaning still need rechecking.
4. Failure in the second item of one transaction rolled back the earlier valid
   item as well; parent and obligation counts were both zero.
5. Separate item transactions preserved the earlier complete parent/obligation
   pair and rolled back the failed pair; counts were both one.
6. A later independent item could succeed, leaving parent IDs `10,30`.
7. Releasing an item savepoint did not make it durable: an outer transaction
   failure still removed it. UI success cannot be based on savepoint release.

The input change and item failures occur at explicit sequential points. There
is no timing-based race, concurrent-client claim or throughput benchmark. The
results support reviewing a finite selection and defining atomicity explicitly;
they do not decide business lifecycle or qualify a live API.

## Reproduce and inspect

Keep the files together and run:

```sh
python3 /workspace/core/docs/features/donor-development/grill/d4-evidence/selection-transaction-probe/run-lab.py
```

Python 3, Docker CLI and the local Docker socket are required. The immutable
image must already be present; otherwise fetch it explicitly:

```sh
env -u DOCKER_HOST -u DOCKER_CONTEXT -u DOCKER_TLS -u DOCKER_TLS_VERIFY -u DOCKER_CERT_PATH docker --host=unix:///var/run/docker.sock pull postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24
```

The runner refuses to reuse/delete an existing same-name container. It uses the
explicit local socket, no network, no published port, no host mounts, ephemeral
database storage and no application credentials. Cleanup runs in `finally`;
the observed run removed its container and verified absence. The image remains.
Resource limits are isolation settings, not production sizing advice.

`mechanics.py` and `setup.sql` retain the exact synthetic fixture;
`results.json` contains assertions and observations; `run-metadata.json` records
the image digest, command, timestamps, exit status and cleanup evidence. These
five files are exact copies of the observed scratch run.

No Supabase Auth, PostgREST, Data API, Core source command, P12 permission,
revocation fence, current schema, command receipt, UI, cancellation, merge or
migration implementation was exercised. D3's separate 21-case mechanics probe
was not rerun. Neither experiment establishes production qualification.
