# D15 isolated list-retirement mechanics

2026-10-10: **9/9 checks passed** in one disposable PostgreSQL 17.11 container.
This is new evidence for whole-list admission versus continuing stage use. D10–D14
probes were not rerun. The D14 transport harness and transaction-barrier helpers
were reused; this fixture and its nine assertions are specific to D15.

The fixture is deliberately small: a list admission flag, independently available
stages, existing journeys with optional assessment, and illustrative stage history.
It is not a Core migration, proposed public API, source authorization model, full
retirement implementation or production-readiness test.

## Observed experiments

| #   | Observation                                                                                                                                                                                                                                                                                                                                         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Inadequate guard reproduced:** one transaction reads a true admission flag with `FOR KEY SHARE`. Another transaction completes a non-key flag update to false while that key lock remains held. The first transaction then inserts using its stale decision; the FK permits the late admission. Key stability is not mutable-eligibility fencing. |
| 2   | **Retirement wins:** retirement holds the list fence; admission is observed waiting on that exact backend PID. After retirement commits, admission rechecks through `FOR SHARE` and rejects with no new journey.                                                                                                                                    |
| 3   | **Admission wins:** admission holds `FOR SHARE` through its transaction; retirement waits on that exact PID. After admission commits, retirement succeeds and preserves the accepted unassessed journey.                                                                                                                                            |
| 4   | Existing assessed and unassessed journeys on a withdrawn list both select an available stage and append the corresponding distinct history. A separately retired stage rejects fresh choice without altering the accepted result.                                                                                                                   |
| 5   | Retirement commits before a waiting existing stage change. That stage change proceeds because the list's admission flag is not an eligibility condition for existing work.                                                                                                                                                                          |
| 6   | An existing stage change commits before waiting retirement. Retirement then preserves that accepted stage and its one history event.                                                                                                                                                                                                                |
| 7   | **Inadequate reader reproduced:** joining all six fixture journeys through `accepts_new=true` returns zero rows although the source rows still exist. A new-admission catalog is not the reference resolver or reader for assigned work.                                                                                                            |
| 8   | Two sessions retire different stages of the same two-stage withdrawn list. The second waits on the first's list fence, rechecks the committed remaining set and rejects. One available stage remains even though the list has zero journey rows. No usage count decides whether the guard applies.                                                  |
| 9   | A deliberately malformed zero-stage list rejects an attempted restoration to new admissions. This tests a conditional restoration guard, not adoption of restoration or a new restoration race. No legitimate fixture command creates the malformed state.                                                                                          |

Cases 2, 3, 5, 6 and 8 use `pg_blocking_pids` and exact backend PID barriers,
not timing guesses or a claim that a sleep proves concurrency. Case 1 instead
observes the flag-update transaction actually finish while the first transaction
still holds its key lock. Five controlled schedules are not every interleaving,
deadlock analysis, throughput or performance evidence.

Every list in the fixture is treated as retained usable for existing work. The
last-stage guard therefore applies to the list itself; it never enumerates donor
records or branches on visible/hidden usage. This is the proposed D15 availability
boundary, not a rule about every hypothetical draft/unused-list lifecycle.
Case 9 injects invalid legacy/corrupt state solely to check that a future restore
path cannot publish it. Since valid stage retirement already preserves a choice
under the same fence, a second restoration race was not repeated here.

## Files, execution and isolation

[setup.sql](setup.sql) contains only synthetic schema and owner-callable fixture
functions. [mechanics.py](mechanics.py) records [results.json](results.json).
[run-lab.py](run-lab.py) records UTC times, input SHA-256 hashes, exact image and
container identities, observed isolation and verified cleanup in
[run-metadata.json](run-metadata.json).

Used the already-present pinned image
`postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24`.
Actual server: PostgreSQL **17.11**, x86_64-pc-linux-musl, GCC Alpine 15.2.0,
64-bit. Docker 28.4.0. The inspected container had network `none`, no ports,
no bind mounts or attached Docker volumes, tmpfs database data, 256 MiB memory,
one CPU. It used only its internal Unix-socket connection. No image was pulled,
application DSN/credential or migration was read by the runner, live database
was contacted, or product/provider action was performed. The exact created
container ID was removed and absence verified.

An intentional reproduction, from the repository root with Docker and that
image already available, is:

```sh
python docs/features/donor-development/grill/d15-evidence/list-retirement-probe/run-lab.py
```

This overwrites this probe's result/metadata files. The runner refuses an existing
container name and cleans up only the exact container it creates.

## Limits

The functions execute as the isolated database owner. PUBLIC execute is revoked,
but there is no Core P12 capability, RLS, Supabase Auth/PostgREST, tenant session,
live revocation fence or protected API here. The supplied tenant IDs, numeric
identities, SQLSTATEs, booleans and table names are fixture choices, not proposed
product contracts. SQL correctness is not permission correctness.

There is no full configuration audit/revision command contract, permanent
idempotency receipt, human review, list switch, default/applicability policy,
paused/closed lifecycle, template copy, cache, UI, reporting export, migration,
retention/erasure operation, task, gift, consent or financial effect in this model.
Stage events illustrate only local stage/history atomicity; they do not qualify
Core history. No raw owner write should be inferred as an allowed product path.

The mechanism serializes all eligible writers through a list row. That is one
sufficient ordinary-Postgres approach, not a chosen lock API or a performance
claim. A real design must integrate stable lock order, current permissions,
expected revisions, permanent replay semantics and all source writer paths.

Primary reference checked 2026-10-10:
[PostgreSQL 17 explicit locking, row-level locks and conflict table](https://www.postgresql.org/docs/17/explicit-locking.html#LOCKING-ROWS).
It expressly distinguishes `FOR KEY SHARE`, which does not conflict with a
non-key update, from `FOR SHARE`, which blocks row updates. These engine facts
support the mechanism and counterexample, not Core's product-policy decision.
