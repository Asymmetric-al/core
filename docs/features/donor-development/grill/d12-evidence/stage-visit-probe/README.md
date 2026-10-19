# D12 direct stage changes: isolated PostgreSQL mechanics

**2026-10-10, PostgreSQL 17.11; 14/14 checks passed.**
[results.json](results.json) records every observation.
[run-metadata.json](run-metadata.json) records exact input hashes, version/image,
execution result and verified container removal.

This is a synthetic relational experiment, **not Core implementation or release
qualification**. The central negative example tests an attractive shortcut:
deduplicating history by journey plus destination. It demonstrably loses a later
real visit. The positive fixture demonstrates one sufficient bounded mechanism;
passing its tests does not independently validate its product assumptions.

## Actual observations

| Check                                 | Observed result                                                                                                                                                                                                                           |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Bad lifetime key                   | Three intended occurrences B, A, B inserted using journey+target uniqueness with conflict-ignore retain only two rows; the second B occurrence disappears.                                                                                |
| 2. Return                             | A→B→A produces two separate accepted transitions with correct from/to values, retaining both events.                                                                                                                                      |
| 3. Same visible value, stale revision | After A→B→A, a new command still expecting revision 0 fails although the visible stage is again A. Current revision is 2; state/history/receipts remain unchanged. A comparison of stage value alone would miss this intervening history. |
| 4. Delayed old receipt                | Replaying the first A→B intent after returning to A returns its original historical B receipt plus separate current A/revision 2. It changes no state, history or receipt count.                                                          |
| 5. Revisit                            | A new third intent returning to B creates another event with a different occurrence ID. History remains B, A, B.                                                                                                                          |
| 6. Same value                         | A fresh same-value B intent changes no current revision, recorded entry time or transition history. The fixture records a no-op command receipt separately.                                                                               |
| 7. Old no-op retry                    | After a subsequent real move to C, replaying the old no-op B intent returns that old receipt and current C without reselecting B.                                                                                                         |
| 8. Changed intent                     | Reusing an accepted key for a different target fails with fixture SQLSTATE `22023`, preserving all state.                                                                                                                                 |
| 9. Stale revision                     | A new intent using an obsolete expected revision fails with fixture SQLSTATE `P0001`; no history/receipt is added.                                                                                                                        |
| 10. Skip                              | A→D produces exactly one A→D event and no fabricated B/C visits.                                                                                                                                                                          |
| 11. Display order                     | Reversing the display order does not change the direct A→D operation or generate intermediate events.                                                                                                                                     |
| 12. Atomic rollback                   | A deliberate division-by-zero after constructing a changed result but before transaction commit rolls back current value, transition and receipt together.                                                                                |
| 13. Concurrent stale writer           | The losing writer is observed blocked by the winner's exact backend PID. After commit, it rechecks the new revision and rejects; one event/receipt remains.                                                                               |
| 14. Concurrent duplicate              | A second delivery of the same intent is likewise observed blocked. After commit it returns the original receipt, with one event/receipt rather than a duplicate.                                                                          |

## Reproduce safely

With Python 3, the managed local Docker daemon and the already-present pinned image:

```sh
python3 docs/features/donor-development/grill/d12-evidence/stage-visit-probe/run-lab.py
```

[run-lab.py](run-lab.py) derives its isolation harness from D10. It pins
`postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24`,
resolving to image ID
`sha256:79bd7c99e923138f136f8009d6bffa66e21e9d4fda5c0c561b00fc9c90cfe537`.
There is no image pull, host mount, published port or container network. Only a
new uniquely named container is used, with temporary database storage and bounded
CPU/memory. The runner pins the local socket and removes only its created container
in `finally`, then verifies absence. Trust authentication is confined to this
network-isolated synthetic container, not application guidance.

[setup.sql](setup.sql) creates toy records, transitions and receipts in `lab`.
[mechanics.py](mechanics.py) sends SQL through local `docker exec`/`psql`; it reads
no application DSN, credential, migration, Supabase project or constituent data.
The two concurrency cases use explicit output barriers and inspect
`pg_blocking_pids` for the expected holder. Bounded polling is not a guessed
sleep that assumes a race occurred. This is not load/deadlock-freedom proof.

The earlier [13-check results](baseline-13-results.json),
[run metadata](baseline-13-run-metadata.json) and
[original mechanics](baseline-13-mechanics.py) are retained. Root review requested
an explicit stale-editor check after A→B→A rather than only after a different
current value. The extended run adds check 3; setup and runner are unchanged.
Both retained runs passed and verified cleanup; no assertion failure occurred.
For the baseline metadata's `mechanics.py` hash, use the preserved
`baseline-13-mechanics.py`; its setup/runner hashes refer to the current files.

## Interpretation limits

- The fixture intentionally runs as its isolated database owner. It contains
  no P12, tenant/entity/preset authorization, RLS, session/revocation, consent,
  privacy, retention or Supabase/PostgREST implementation. Current authorization
  must govern production replay; receipt possession grants nothing.
- Integer identities, text keys, JSON result, revision/error conventions and
  lock strategy are experiment choices, not selected product schema/API policy.
  A no-op receipt distinguishes delivery from stage history; it does not create
  another assessment, require another UI action or freeze storage design.
- There is no task, ask, contact, lifecycle or notification source. Their absence
  is **not proof** of side-effect correctness. Actual source acceptance,
  downstream work, retries and eventual consistency still require qualification.
- Server-side old-receipt/current-value separation does not prove browser rendering
  or that stale async responses cannot regress a view.
- The rollback aborts an explicit transaction, not a real network failure. Native
  history identity sequences can have gaps after rollback; no contiguous-event
  numbering contract is asserted.
- D10 retirement/selection and composite-key checks remain prior evidence and
  were not repeated here. D11 selector tests were not rerun. No live Core command,
  historical correction, migration, browser, duration/reporting policy or
  performance test is claimed.

Primary PostgreSQL 17 grounding, re-read 2026-10-10:
[transactions](https://www.postgresql.org/docs/17/transaction-iso.html),
[constraints](https://www.postgresql.org/docs/17/ddl-constraints.html).
Read-committed row locking/rechecking and suitable occurrence uniqueness can
support this behavior; ordinary target existence alone cannot choose its meaning.
