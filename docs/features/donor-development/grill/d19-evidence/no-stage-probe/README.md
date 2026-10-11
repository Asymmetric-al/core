# D19 — explicit absence on list change: PostgreSQL mechanics

2026-10-10. **8/8 passed on the first runtime attempt.** This is new synthetic
evidence for D19's optional destination-stage outcome. No D18 cases were rerun or
counted. The Docker/psql transport helpers were reused; the schema and cases are new.

## Scope and artifacts

The fixture models a switch to another list with either an explicit concrete stage
or an explicit JSON null. An omitted stage, invalid input, wrong-list stage and
unavailable target are distinct. This JSON envelope is a test seam, not a selected
production schema or wire protocol. Product may use an appropriately typed absence
disposition without requiring an additional user acknowledgment.

- [setup.sql](setup.sql): an intentionally insufficient composite-FK table beside
  a required-parent model; a narrowly scoped switch function; history and receipts.
- [mechanics.py](mechanics.py): eight cases and one controlled competing-writer
  schedule, proving the exact blocking backend with `pg_blocking_pids`.
- [run-lab.py](run-lab.py): pinned isolated Docker execution and exact-ID cleanup.
- [results.json](results.json): complete result statuses and observed values.
- [run-metadata.json](run-metadata.json): source HEAD, all three input SHA256 hashes,
  server-image/container provenance, isolation, captured test stdout/stderr and
  exact removal/absence outputs.

Python AST parsing of both scripts passed before execution; it generated no local
bytecode. Runtime command from `/workspace/core`:

```text
python docs/features/donor-development/grill/d19-evidence/no-stage-probe/run-lab.py
```

There was one runtime attempt, **16:24:55.984787–16:25:01.491395 UTC**. Exit code 0,
empty stderr, `completed: true`, `passed: 8`, `total: 8`, `all_pass: true`. No failed
harness run or rerun was omitted. Source HEAD:
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`.

## New cases

| Case | Observed result                                                                                                                                                                                                                                                 | Bounded conclusion                                                                                                                           |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | MATCH SIMPLE with a single list/stage composite FK accepts nonexistent list 999 when stage is null. The independent scoped list FK rejects nonexistent and foreign-scope parents; NOT NULL rejects a missing required list.                                     | Optional stage cannot make required source/list identity optional. The deliberate counterexample is expected evidence, not a failed harness. |
| 2    | Text extraction returns SQL null for both absent property and explicit JSON null, while key presence differs. Omitted input, empty string and an old-list stage all reject without changing the source.                                                         | Parse and bind the intended no-stage outcome explicitly; extracting/coalescing a field alone loses information.                              |
| 3    | A late receipt CHECK failure rolls back a no-stage switch and history. An independent reader sees the complete old assessment until the successful transaction commits, then sees new list, null current stage, prior assessment history and one exact receipt. | Explicit absence can participate in the same atomic current/history/result boundary.                                                         |
| 4    | Exact no-stage retry returns the original result; same identity with omitted stage or concrete stage conflicts and leaves all rows unchanged.                                                                                                                   | Absence, omission and assessment are different submitted meanings.                                                                           |
| 5    | A→B(null)→A(null) leaves A unassessed while preserving its earlier stage 101 in history. Replaying the old B(null) success does not move the current binding.                                                                                                   | Return is not automatic restoration; historical result is not current state.                                                                 |
| 6    | A→B(stage 201) holds the journey lock. Competing A→B(null) waits on that exact backend, then rejects stale revision. A fresh command to the now-current B with null rejects as an unsupported same-list clear.                                                  | A stale proposed switch cannot become a clearing operation after another writer already changed the list.                                    |
| 7    | A no-stage proposal to an unavailable target rejects without any journey/history/result change.                                                                                                                                                                 | Absence does not skip list eligibility.                                                                                                      |
| 8    | Five journey rows include one unassessed: `count(stage_id)` and inner stage join yield four; `stage_id <> 201` yields three, whereas `IS DISTINCT FROM 201` yields four. `NULL = NULL` is unknown; `IS NOT DISTINCT FROM` is true.                              | Reporting and equality must deliberately include or exclude known absence; ordinary joins/comparisons do not supply product meaning.         |

## Isolation and exact cleanup

Executed **PostgreSQL 17.11**, x86_64-pc-linux-musl, GCC Alpine 15.2.0,
**read committed**; Docker 28.4.0. Pinned image:
`postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24`.
Image ID:
`sha256:79bd7c99e923138f136f8009d6bffa66e21e9d4fda5c0c561b00fc9c90cfe537`.

Network `none`; no published ports, bind mounts or attached volumes. PostgreSQL
data used a 128 MiB tmpfs with 256 MiB container memory and one CPU. The runner uses
the explicit local Docker socket and removes remote-context environment overrides.
No live database, credentials, project configuration, Core migration/seed or provider
was accessed. Existing local image was used.

The exact created container
`7686b9a536632d3f1830f8d896468ac1e2d5bc1210374b60977cd5958cdec2d5`
was removed with exit code 0. Subsequent inspection returned exit code 1 and
`No such container` for that same ID. Metadata records both complete outputs.

## Proof limits

All commands execute as PostgreSQL owner. Revoking PUBLIC table/function privileges
does not prove production grants, RLS, P12, protected disclosure, actor/time audit,
residency or revocation ordering. The fixture has no user-facing errors or current
authorization checks. Synthetic scope numbers represent already qualified source
scope; they do not introduce a new tenant/Legal Entity catalog taxonomy.

The receipt's exact JSON comparison is sufficient for these inputs, not a complete
production canonicalization/versioning policy. A real API must preserve meaningful
presence/disposition after normalization and must not silently turn older omitted
payloads into explicit absence. The function is intentionally only a list-switch
command, not an exhaustive same-value no-op or standalone stage-edit API.

The fixture's history records source transition identity, not all required trusted
actor/time/meaning/retention fields. It does not qualify immutable-history grants,
historical corrections, stage retirement, minimum usable-stage catalog, paused or
closed behavior, real migration, optional-stage UI/serialization or old clients.
No stage default/carry/restore resolver exists. Their absence from toy SQL is not
proof that production callers will not introduce them.

The single controlled stale-absence schedule is not exhaustive concurrency or load
testing. `40001` is deliberately raised by a revision guard, not evidence of
Serializable isolation. Earlier D18 both-order switch/edit and withdrawal mechanics
remain dated complementary evidence. They were not rerun.

Case 8 is an ordinary SQL null/count counterexample over complete fixture rows,
not a selected reporting formula, authorization-safe aggregate, cohort design or
claim that real data is complete. The fixture has no tasks, asks, money, consent,
communications or workflow receiver; no absence of their real effects is proven.
