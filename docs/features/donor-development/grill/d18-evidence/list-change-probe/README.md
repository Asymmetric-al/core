# D18 — changing an existing list binding: isolated mechanics

2026-10-10. **8/8 passed, first attempt.** Research evidence only. No Core
implementation, formal schema, migration, live database, provider or P12 proof.

The new question is whether the same saved journey may deliberately attach to a
different approved list. Prior D14/D15/D17 fixtures did not exercise that mutation
against competing stage edits, its accepted history, or an old successful switch
receipt after a later return. This probe tests those distinct seams. It reuses the
D17 Docker/psql transport helpers; its D18 schema, commands and cases are new.

The fixture supplies an explicit valid target-stage ID solely to make the proposed
target pair concrete while testing atomicity. **This does not choose a product
stage-handling policy**, require reassessment, authorize clearing, infer stage
equivalence, or treat list change as stage progress. Q18 explicitly reserves that
decision. Its `switch` operation is a synthetic test command, not an API proposal.

## Artifacts and execution

- [setup.sql](setup.sql): scoped relational fixture, one journey mutation function,
  accepted history and permanent result receipt. No default-selection resolver.
- [mechanics.py](mechanics.py): eight cases, including four controlled lock waits
  verified by exact backend PID and `pg_blocking_pids`, rather than elapsed sleeps.
- [run-lab.py](run-lab.py): isolated container runner and exact-ID cleanup.
- [results.json](results.json): all assertions and observed wait/result evidence.
- [run-metadata.json](run-metadata.json): source HEAD, three input SHA256 hashes,
  pinned image, isolation inspection, captured test stdout/stderr, exact container
  removal output and post-removal inspection error.

Command executed from `/workspace/core`:

```text
python -m py_compile docs/features/donor-development/grill/d18-evidence/list-change-probe/mechanics.py docs/features/donor-development/grill/d18-evidence/list-change-probe/run-lab.py
python docs/features/donor-development/grill/d18-evidence/list-change-probe/run-lab.py
```

The compile check passed; its generated local bytecode was removed. There was one
runtime attempt, from **16:01:53.326790 to 16:01:59.341966 UTC**, with exit code 0,
empty stderr, `completed: true`, `passed: 8`, `total: 8`, `all_pass: true`. No failed
harness attempt or rerun was hidden. Source HEAD:
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`.

Executed server: **PostgreSQL 17.11**, x86_64-pc-linux-musl, GCC Alpine 15.2.0;
**read committed** isolation. Docker server 28.4.0. Image:
`postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24`.
Image ID:
`sha256:79bd7c99e923138f136f8009d6bffa66e21e9d4fda5c0c561b00fc9c90cfe537`.

The container had network `none`, no published ports, no bind mounts or attached
volumes, a 128 MiB temporary data filesystem, 256 MiB memory and one CPU. Only the
three local fixture inputs were used; no credentials, production DSN or Core
migration/seed was read or applied. The local Docker socket was selected explicitly
with remote-context environment overrides removed.

Created and removed exact container:
`86b295d1b27b3b9d9e8dd823f6a2d4ca60273b4d82703ee14bf9984afa7d8c86`.
Cleanup returned 0 and that exact ID; subsequent inspection returned 1 with
`No such container` for the same ID. Metadata retains both outputs.

## Cases and bounded conclusions

| Case | Observation                                                                                                                                                                                                                                                          | Supports                                                                                                                                      |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | A deterministic late receipt constraint failure rolls back the changed binding and inserted history. Another connection sees the complete old state until an accepted transaction commits; afterwards it sees the matching new binding, one history and one receipt. | One local authoritative transaction can preserve current/history/result agreement. The fault is a fixture-only CHECK, not product validation. |
| 2    | A stage edit holds the journey lock; the switch waits on that exact backend, then fails its stale revision without losing the new assessment.                                                                                                                        | Stage edits and list switches must share a source concurrency boundary.                                                                       |
| 3    | A switch holds the journey lock; an old-list stage edit waits, then rejects stale revision without reinstating the old pair.                                                                                                                                         | A stage-only writer cannot safely ignore current list binding/revision.                                                                       |
| 4    | Target withdrawal holds the target row; the switch waits and then rejects unavailable new attachment, preserving all journey rows.                                                                                                                                   | A prior picker read or retained FK is insufficient current attachment eligibility.                                                            |
| 5    | The switch holds a target SHARE lock; withdrawal waits, then commits without moving the already accepted journey or changing its history.                                                                                                                            | Ordered acceptance can preserve D15's distinction between new attachment and continued use.                                                   |
| 6    | A→B→A restores the original IDs but advances revision. An old-view new intent rejects; exact replay of the first successful switch returns B at revision 2 while current truth remains A at revision 3; changed payload under that identity rejects.                 | Value equality is not freshness, and historical receipt recovery must not reapply a mutation or overwrite current projection.                 |
| 7    | Renaming the old list does not rewrite captured prior meaning. Deleting its old stage, which is now referenced only by history, fails the FK rather than cascading away history.                                                                                     | Durable old references and recorded meaning can survive a list switch and later catalog edits.                                                |
| 8    | All seven seeded journeys retain their IDs, Party, ministry, purpose and source scope. Every accepted before/after snapshot differs only in list, stage and revision.                                                                                                | The fixture models one continuing journey, with no extra journey row created by a switch.                                                     |

## Limits that remain material

The fixture is executed as PostgreSQL owner. PUBLIC execution/table access is
revoked, but there are no nonowner roles, RLS policies, P12 contexts, capability
rechecks, restricted projections, actor/recorded-time audit, policy epochs,
residency or authorization-revocation races. This is not a grants/RLS qualification.
Its generic scope IDs stand for an already qualified owner scope; no new scope
taxonomy or Legal Entity catalog rule is implied.

Required list identity has a separate composite FK; nullable stage membership uses
the default MATCH SIMPLE behavior. No new null/cross-scope adversarial case was
run: D14 already covers the corresponding relational pitfalls. A nullable schema
column does not authorize clearing a recorded stage, and this fixture command
deliberately accepts only concrete pairs to avoid choosing that product policy.
Selectable-stage lifecycle, minimum usable catalog, list restoration, defaults,
current-source corruption repair, actual correction semantics and paused/closed
mutation remain outside this run.

The four schedules are controlled examples, not exhaustive interleavings,
deadlock/performance/load tests or a proof that the same locks fit final owner
commands. `40001` is explicitly raised by the revision guard; it is not evidence
of Serializable isolation. All statements used the recorded read-committed server.
The actual implementation must order its real locks consistently and handle
abort/retry without revising submitted meaning.

Case 7 demonstrates one FK protection and the tested command's preservation of
existing history. It does not prove ordinary writers cannot UPDATE history; actual
grants, privileged paths and any immutability enforcement still require proof.
No identity column is generally immutable merely because this command leaves it
alone. There is no total-history replay, migration, bulk worker, browser/API,
cache, outbox, task, financial, communication or workflow implementation here.
Case 8 cannot establish absence of real enrollment or external effects: their
owner tables/receivers do not exist in the fixture. Production proof must check
those owners and real native effect identities.

Existing D14 composite-membership, D15 availability/KEY SHARE counterexample and
D17 default/established-intent probes were read and reused as dated evidence;
none was rerun or counted among these eight cases.
