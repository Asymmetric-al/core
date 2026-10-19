# D10 stage catalog PostgreSQL mechanics

Run **2026-10-10** using an isolated **PostgreSQL 17.11** container. All **15
checks passed**. [results.json](results.json) contains each observation;
[run-metadata.json](run-metadata.json) records input SHA-256 hashes, the exact
image, actual isolation settings, execution outcome and verified cleanup.

Image: `postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24`.
Resolved image ID:
`sha256:79bd7c99e923138f136f8009d6bffa66e21e9d4fda5c0c561b00fc9c90cfe537`.

## Scope and results

[setup.sql](setup.sql) creates deliberately generic synthetic `lab.preset`,
`lab.stage`, `lab.journey` and history records. They are **not** a proposed Core
schema, accepted P27 lifecycle vocabulary or application implementation. No
Core migrations, application database, Supabase project, credentials, real
people, communications or provider were used.

| Check                        | Observed result                                                                                                                                                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Composite identity        | A stage from another tenant or another preset fails with SQLSTATE `23503`; a null required tenant fails with `23502`. This checks referential integrity, not authorization.                                                                                                                |
| 2. Retained retired value    | Retiring an already-recorded stage and changing only the toy journey's closed flag leaves the stage ID and recorded actor/time unchanged. This illustrates D9-compatible retention without a compulsory stage transition.                                                                  |
| 3. Unsafe counterexample     | Transaction A reads selectable=true without a lock. B retires and commits. A inserts its previously checked value using only the ordinary FK and commits. The final stage is retired and the new assignment exists. Thus existence integrity alone does not enforce current selectability. |
| 4. Retirement first          | The assigning transaction is observed blocked on the retiring transaction's exact PID. Once retirement commits, assignment rechecks and returns false; no new row is inserted.                                                                                                             |
| 5. Assignment first          | The retiring transaction is observed blocked on the assigning transaction's exact PID. Assignment commits first; subsequent retirement succeeds while preserving that accepted assignment.                                                                                                 |
| 6. Complete reorder          | A full permutation swaps unique positions, increments the catalog revision and writes one catalog-history record. Recorded journey-stage history is unchanged.                                                                                                                             |
| 7. Stale revision            | A stale reorder fails; order, revision and catalog history remain unchanged.                                                                                                                                                                                                               |
| 8. Duplicate manifest        | Repeating a stage identifier fails with `22023`, with no catalog changes.                                                                                                                                                                                                                  |
| 9. Foreign-preset identifier | A same-tenant stage belonging to another preset fails manifest validation, with no catalog changes.                                                                                                                                                                                        |
| 10. Incomplete manifest      | Omitting a member fails, with no catalog changes.                                                                                                                                                                                                                                          |
| 11. Rollback after writes    | A deliberately injected error after order, revision and catalog-history writes rolls all three back.                                                                                                                                                                                       |
| 12. Concurrent stale reorder | A second reorder is observed waiting on the first transaction. After the winner commits, the loser rejects the stale revision instead of overwriting the accepted order. Two accepted revisions and two history records remain.                                                            |
| 13. RLS old-row scope        | A real nonowner `NOSUPERUSER NOBYPASSRLS` role can update its permitted row. Its foreign-tenant update affects zero rows and foreign-tenant SELECT returns zero rows.                                                                                                                      |
| 14. RLS new-row scope        | Moving the permitted row into an otherwise FK-valid foreign scope fails with `42501`; its original scope remains.                                                                                                                                                                          |
| 15. RLS insert scope         | A foreign-scope INSERT with an otherwise valid FK fails with `42501` and inserts nothing.                                                                                                                                                                                                  |

The positive race tests demonstrate **one sufficient mechanical strategy**:
all participating retire/assign writers lock the same stage definition and
recheck it. Reorder uses a preset lock, expected revision and complete manifest;
a deferrable unique-position constraint permits the transaction's position
swap. These SQL choices are fixture mechanisms, not frozen product DDL.

The three conflicting schedules use explicit output barriers and bounded
polling of `pg_stat_activity.wait_event_type = 'Lock'` **and**
`pg_blocking_pids(waiter)` containing the known holder PID. The holder commits
only after that relation is observed. Small polling delays are not guessed
race-order sleeps. The unsafe counterexample explicitly orders precheck,
retirement commit and stale insertion; it does not depend on thread timing.
These are controlled two-transaction experiments, not load or throughput tests.

## Reproduction and isolation

From the repository root, with Python 3, local Docker and the already-present
pinned image:

```sh
python3 docs/features/donor-development/grill/d10-evidence/stage-catalog-probe/run-lab.py
```

The runner uses an explicit local Docker socket and a unique D10 container
name; it refuses to reuse an existing named container and does not pull an
image. It uses `--network none`, no published ports, no host bind mounts, and
temporary database storage. It records the created ID, removes only that
container in `finally`, and verifies removal. The successful run and the first
startup attempt both have `container_removed: true`. Trust authentication is
limited to this isolated synthetic container; it is not application guidance.

The first attempt ran zero checks because `pg_isready` accepted the image's
temporary bootstrap server, which then restarted. Its failure and cleanup are
preserved in [attempt-1-run-metadata.json](attempt-1-run-metadata.json) and
[attempt-1-results.json](attempt-1-results.json). The final runner waits for the
entrypoint's bootstrap-complete marker plus database readiness. The corrected
run passed all 15 checks without test assertion failures. No source dependency
or product configuration was changed to obtain that result.

## Qualification limits

- The RLS fixture uses a fixed tenant-1 policy and `SET ROLE lab_writer`; it
  proves actual PostgreSQL `USING`/`WITH CHECK` enforcement for that nonowner.
  It does not implement P12 grants, JWT/session validation, configurator versus
  enrollment-editor authority, scoped missionary projections or revocation.
  Admin-only mechanics elsewhere run as the fixture owner. No claim of whole
  schema authorization follows from these three role checks.
- The fixture reopen directly changes an illustrative closed flag. It proves
  retaining an existing retired reference is mechanically possible; it does
  not exercise a Core reopen command, preserve a complete real closure ledger,
  or verify the app emits no side effects. There is no real provider here.
- Fixture reorder covers all stages in one preset. Which visible/retired
  members a production reorder presents remains a product contract. Membership
  edits would need the same accepted coordination protocol; those edits were
  not tested concurrently with reorder here.
- This does not test production writer coverage, Supabase/PostgREST requests,
  deployment grants, migrations, caches, browser behavior, history retention,
  lost-response idempotency, label semantics, provider delivery or performance.
  Fixed historical values in the fixture are assertions about this data only.

Primary grounding refreshed 2026-10-10:
[PostgreSQL 17 constraints](https://www.postgresql.org/docs/17/ddl-constraints.html),
[explicit locking](https://www.postgresql.org/docs/17/explicit-locking.html),
[transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html),
[CREATE TABLE](https://www.postgresql.org/docs/17/sql-createtable.html) and
[row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html).
The experiment supports feasibility and demonstrates failed assumptions; actual
D10 release still needs its source/database/authorization/surface proofs.
