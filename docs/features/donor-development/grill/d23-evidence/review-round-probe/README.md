# D23 — review round and action-boundary mechanics

2026-10-11 Asia/Bangkok; run 2026-10-10 UTC. **10/10 passed on the first runtime
attempt.** New synthetic PostgreSQL evidence. No Core migration/product source,
live database, P12 authorization or P6 dispatch is exercised.

## Why this experiment is new

D23 adds one decision over reviewed business terms, rather than just another row
edit. The probe tests whether a terms revision can race review; whether concurrent
duplicate or contradictory decisions can produce more than one accepted decision;
and whether a relevant material policy change has an ordered boundary against a
separately invoked action start. It also distinguishes incidental metadata from
business terms and a departed reviewer from invalid historical approval.

Earlier D18/D19/D22 probes were not rerun or counted. Only the pinned runner and
psql/barrier helpers were reused; the review schema/functions/cases are new.

## Artifacts and exact execution

- [setup.sql](setup.sql): proposal head, retained business versions, review round,
  terminal decision, receipt, internal decision event and explicit action marker.
- [mechanics.py](mechanics.py): ten cases, six controlled exact-backend lock waits.
- [run-lab.py](run-lab.py): isolated local Docker execution and exact-ID cleanup.
- [results.json](results.json): assertions, observed blocking PIDs and outcomes.
- [run-metadata.json](run-metadata.json): three input SHA256 hashes, source HEAD,
  image/container/isolation provenance, captured stdout/stderr and removal evidence.

Both Python scripts passed AST parsing without generating bytecode. Executed from
`/workspace/core`:

```text
python docs/features/donor-development/grill/d23-evidence/review-round-probe/run-lab.py
```

One runtime attempt, **18:01:38.880797–18:01:45.513999 UTC**. Exit 0, empty stderr,
`completed: true`, `passed: 10`, `total: 10`, `all_pass: true`. No failed attempt
or rerun was hidden. Source HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`.

## Cases

| Case | Observation                                                                                                                                                                                          | Bounded conclusion                                                                                          |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1    | Metadata revision changes while business version remains 1; review accepts version 1.                                                                                                                | Audit/view/task-like metadata need not invalidate reviewed terms. Actual classification remains owner work. |
| 2    | A business revision holds the proposal; old-round decision waits on that exact backend, then fails stale terms with no decision/receipt/event.                                                       | An old review cannot accidentally authorize changed terms.                                                  |
| 3    | Review accepts version 1 first; revision waits, then creates version/round 2. Original decision remains, but action start over version 2 rejects.                                                    | History retention and present usability are different.                                                      |
| 4    | Concurrent identical decision intent waits, then returns the same receipt. One decision, receipt and internal event exist; changed outcome under that identity conflicts.                            | Stable business intent can recover once across simultaneous retry without duplicating decision effects.     |
| 5    | Distinct approve and reject intents compete; one accepts, the waiting other rejects as already decided.                                                                                              | One terminal result per exact round can be enforced.                                                        |
| 6    | A deliberately failing late internal-event constraint rolls back the inserted decision and receipt.                                                                                                  | Required internal intent belongs in the same local authoritative transaction.                               |
| 7    | Material policy change holds the policy fence; an explicit action start waits and then rejects incompatible old approval.                                                                            | A prior preflight is not current policy permission.                                                         |
| 8    | Explicit local action start holds its policy fence; material policy change waits, then preserves the already accepted start marker.                                                                  | The local boundary has a truthful accepted order; later policy change does not erase history.               |
| 9    | Reviewer eligibility is removed after acceptance. Exact historical replay and an independently allowed presenter's compatible action still work; a new decision by the unavailable reviewer rejects. | Departure alone does not retroactively invalidate approval or make it reusable for new terms.               |
| 10   | Unknown applicability blocks; required review with no reviewer does not downgrade. Known not-required permits ordinary action without a fake decision or review event.                               | Three applicability outcomes and reviewer availability are distinct.                                        |

Six schedules use `pg_stat_activity` plus `pg_blocking_pids(waiter)` to verify the
exact expected blocker, not a sleep-based assumption. The successful SQL runs were
at **read committed**. `40001` is explicitly raised by the fixture's source-version
guard, not a claim that Serializable isolation found an anomaly.

## Isolation and cleanup

Executed PostgreSQL **17.11**, x86_64-pc-linux-musl, GCC Alpine 15.2.0;
Docker 28.4.0. Existing pinned image:
`postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24`.
Image ID:
`sha256:79bd7c99e923138f136f8009d6bffa66e21e9d4fda5c0c561b00fc9c90cfe537`.

Network none, no published ports, bind mounts or attached volumes; 128 MiB tmpfs
data, 256 MiB memory and one CPU. Explicit local Docker socket; remote-context
overrides removed. No credentials, live project, Core seed/migration, provider or
remote application was used.

Exact container
`3cdf124e72c0b42bca9934a32c4d8e030ccb2381e6109edc86e253908903ae35`
was removed with exit 0. Exact-ID inspection then returned exit 1 and `No such
container`. Metadata preserves both complete outputs.

## Limits that must accompany these results

The fixture is owner-executed. PUBLIC table/function access is revoked, but synthetic
`reviewer_allowed` and `presenter_allowed` flags are not P12, RLS, grants, policy
epochs, field floors, actor identity or revocation qualification. Historical receipt
disclosure is not implemented. Actor 7 is a fixture constant, not trusted attribution.
Scope numbers do not choose a production scope taxonomy.

`material_epoch` denotes a specifically relevant policy-compatibility change in the
fixture. It is not every settings `updated_at`, a global policy version, an automatic
invalidation rule for all old approvals or a configurable policy engine. The actual
source must qualify compatibility and action-specific current authority. Reviewer
departure is deliberately independent from this material epoch.

The fixture has only approve/reject outcomes; it does not fix the product's complete
review vocabulary, returned-for-change flow, replacement routing, submission,
withdrawal, escalation or task lifecycle. The `revise` function conveniently opens
another round to exercise races; it does not require that every edit auto-submits
review in the product. The current head and retained tables are not a final schema.
Owner-writable retained rows are not proof of enforced immutable audit/history.

`internal_event` is only `review_decided`. Approval creates **no** donor send,
charge, publication or action-start marker. `start_action` is an explicit separate
test invocation that records a local linearization point. It has no provider,
communication intent, recipient, consent, content, queue worker or uncertain
external effect. Thus cases 7–8 do not prove real P6 dispatch fencing or define
where that owner's irreversible boundary lies. A committed local marker does not
mean a human presented the request or a donor received it.

These bounded schedules are not exhaustive concurrency, deadlock, throughput,
performance or browser/API proof. The fixture omits monetary thresholds, financial
terms validation, policy administration, history retention and actual source effects.
No production Supabase version or deployment readiness is inferred.
