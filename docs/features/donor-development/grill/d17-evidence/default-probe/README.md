# D17 optional-default mechanics probe

2026-10-10. Final run: **9/9 checks passed** on isolated PostgreSQL 17.11.
This new probe examines an optional governed reference together with withdrawal,
configuration retry and captured list intent. It does not rerun the D14 stage
membership or D15 admission/retirement tests under renamed tables.

## Observed checks

| #   | Result                                                                                                                                                                                                                                                                                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | A same-scope FK permits a stored default whose list becomes unavailable. A resolver using the full eligible fixture set rejects that default; with two eligible alternatives it selects neither. This shows insufficient configuration/selection invariants, not that a real admission accepts the bad default. |
| 2   | A page containing one eligible row coexists with three eligible rows in the source. Page length is not sole-option proof. The fixture contains no real authorization filter; qualified authorized coverage remains a source responsibility.                                                                     |
| 3   | Setting the default commits first; a concurrent withdrawal waits on the exact scope-row blocker. It then rejects its stale expected revision, without partial withdrawal or default edits.                                                                                                                      |
| 4   | Withdrawing the current default without explicit matching-default disposition rejects. A deliberate disposition that executes but then fails before transaction commit rolls back list availability, default pointer, revision, configuration event and result receipt together.                                |
| 5   | Accepted withdrawal with deliberate matching-default removal clears that pointer atomically. An observer sees the previous complete state while the transaction is open and the new complete state after commit. Exactly one additional event and receipt persist.                                              |
| 6   | Withdrawal commits first; a concurrent default-set waits and rejects its stale revision. A separately refreshed request then rejects the unavailable target. No invalid default/event is accepted.                                                                                                              |
| 7   | Restoring list availability leaves the removed default unset. Replaying the old successful set-default intent returns its original historical receipt without reapplying it, increasing the revision or adding another event.                                                                                   |
| 8   | Replacing the default, withdrawing a different list and explicitly unsetting the default preserve one optional reference. Unrelated withdrawal does not clear the newer default; a stale replacement cannot overwrite the subsequent unset.                                                                     |
| 9   | A reviewed explicit list remains the accepted target after the organization's default changes to another eligible list. Admission uses the captured selected ID, never a late default lookup.                                                                                                                   |

Withdrawal-clears-matching-default is an explicit **proposed reconciliation of
D17's optional default with ratified D15 dependent-reference/no-revival rules**.
The fixture requires the caller's matching-default disposition in the command;
it does not simulate a UI confirmation or grant configuration power. One ordinary
withdrawal action can convey that impact without another mandatory confirmation.
This is not an already ratified physical schema or implemented Core operation.

The two concurrent schedules use exact backend PIDs and `pg_blocking_pids` barriers.
The fixture's `40001` is an intentionally raised stale-revision error, not a claim
that PostgreSQL Serializable isolation detected a serialization anomaly. The run
uses ordinary transactions and explicit locks. No sleep substitutes for observing
the actual blocking relationship.

## Execution, first failed attempt and isolation

[setup.sql](setup.sql), [mechanics.py](mechanics.py) and [run-lab.py](run-lab.py)
define the synthetic experiment. [results.json](results.json) records the final
checks; [run-metadata.json](run-metadata.json) captures time, exact image/container,
input hashes, isolation and cleanup.

The initial run stopped after four passing checks when a second output marker was
already buffered by Python's text reader: the selector waited for more OS-level
output even though a line remained in the wrapper's buffer. It was a harness
barrier failure, not a failed database assertion. Its exact mechanics, partial
results and cleanup/error metadata are preserved in
[attempt-1-mechanics.py](attempt-1-mechanics.py),
[attempt-1-results.json](attempt-1-results.json) and
[attempt-1-run-metadata.json](attempt-1-run-metadata.json).
The corrected harness uses the returned function-result line itself as the output
barrier, removing only the redundant markers. It retains the concurrency checks
and all assertions. Both exact created containers were removed and their absence
verified. This failure is not hidden or relabeled as a passing first run.

The already-present pinned image was
`postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24`.
Server: PostgreSQL **17.11**, x86_64-pc-linux-musl, GCC Alpine 15.2.0, 64-bit.
Docker **28.4.0**. Network `none`, no ports, no bind mounts or attached Docker
volumes, tmpfs database data, 256 MiB memory and one CPU. Only the container's
internal Unix socket was used. No image pull, Core migration, application DSN,
credential, hosted database or provider was used. The runner refuses a pre-existing
container name and removes only the exact container it creates.

To intentionally reproduce from the repository root with the same image present:

```sh
python docs/features/donor-development/grill/d17-evidence/default-probe/run-lab.py
```

This overwrites final results and metadata, not the retained attempt-1 files.

## Boundaries

All functions run as the isolated owner; PUBLIC execute is revoked. No P12,
Supabase Auth/PostgREST, real RLS, principal/tenant resolution, permission revocation,
disclosure, browser, cache, import or provider behavior is tested. Numeric `scope_id`
stands for a previously qualified source scope in the experiment; it does not
invent a Core scope taxonomy, hierarchy, new catalog entity or grant. A single
nullable reference is one possible physical implementation, not a chosen schema.

All fixture lists are assumed otherwise usable; stage catalogs and stage retirement
are deliberately absent because D14/D15 already investigate those mechanisms.
The configuration events and receipts model local atomicity, not complete product
audit, current-authorized result replay, immutable-event enforcement or operational
recovery. The explicit selected ID test has no real reviewed-group protocol and
does not prove source-qualified admission or reveal hidden records.

Normal root-row locking is sufficient for these bounded hypotheses. The fixture
does not establish all interleavings, performance, deadlock handling, API payload
integrity or successful deployment. Complete authorized cardinality, draft
initialization semantics, source capabilities and real command integration remain
qualification obligations.

Primary PostgreSQL 17 references: [constraints](https://www.postgresql.org/docs/17/ddl-constraints.html),
[explicit row locking](https://www.postgresql.org/docs/17/explicit-locking.html#LOCKING-ROWS)
and [transactions](https://www.postgresql.org/docs/17/tutorial-transactions.html).
These engine references were already checked during this 2026-10-10 session; no
new upstream behavior is assumed and the documentation does not ratify Core policy.
