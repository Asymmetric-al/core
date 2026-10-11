# D13 initial-assessment mechanics experiment

**2026-10-10, 13:17:42–13:17:48 UTC: 15/15 checks passed.** This is a disposable
PostgreSQL experiment with explicit failing-design counterexamples and one bounded
sufficient mechanism. It is not P27 implementation, a migration, a public RPC,
production authorization, or evidence that this schema is the best Core design.
The positive mechanism is authored for the experiment; its passing assertions
establish only the observed mechanics, not independent product correctness.

## Reproducibility and isolation

- [setup.sql](setup.sql) contains synthetic scope, stage, journey, receipt and
  history tables, deliberately inadequate alternatives, and a fixed-tenant role.
- [mechanics.py](mechanics.py) records raw outcomes, SQLSTATEs and one controlled
  concurrent schedule. [results.json](results.json) retains all 15 observations.
- [run-lab.py](run-lab.py) uses the already-present pinned image, no pull, network,
  published port, bind mount, credential, DSN, Core migration or real data.
- [run-metadata.json](run-metadata.json) records input SHA-256 hashes, UTC times,
  image digest, inspected isolation, exact created container ID and verified removal.
- PostgreSQL **17.11**, x86_64-pc-linux-musl, GCC Alpine 15.2.0, 64-bit; Docker
  28.4.0. Image digest:
  `postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24`.
- Container: `--network none`, 256 MiB, one CPU, tmpfs data; no ports or mounts.
  The runner refuses an existing name and removes only its own created ID.
  `container_removed: true`; no application or hosted database was contacted.

To repeat intentionally from the repository root when Docker and the same image
are available:

```sh
python docs/features/donor-development/grill/d13-evidence/initial-assessment-probe/run-lab.py
```

This overwrites this probe's result/metadata files. No repeat of D12's already
passed stage-movement suite was needed; these cases concern initial absence.

## Observations

| #   | Question and observed result                                                                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | A composite stage FK using default `MATCH SIMPLE` accepted a nonexistent preset when the stage was null. This deliberately inadequate table demonstrates the scope gap.                                                                                       |
| 2   | Changing that FK to `MATCH FULL` rejected the legitimate `(tenant 1, preset p, null stage)` tuple, SQLSTATE 23503. It is not a blanket remedy.                                                                                                                |
| 3   | Independent required scope and parent references accepted an unassessed row while rejecting omitted/null tenant/entity/preset (23502) and foreign/missing parents (23503). None of the invalid rows remained.                                                 |
| 4   | A deliberately wrong `tenant_id=1 OR stage_code IS NULL` policy exposed tenant 2's null-stage row. The scoped policy did not.                                                                                                                                 |
| 5   | Actual nonowner `lab_member` was neither superuser nor BYPASSRLS. Updating another tenant's null-stage row affected zero rows. Rebinding an allowed null-stage row to valid tenant-2 parents failed 42501 and left the source unchanged.                      |
| 6   | JSON `->>` returned SQL null for both an omitted field and explicit JSON null; a presence check distinguished them. No application decoder was tested.                                                                                                        |
| 7   | A left join retained four source journeys. A selectable-stage inner join under the test role returned only one. Source absence, a retired reference and a role-hidden reference remained distinct in the diagnostic classification.                           |
| 8   | The same four journeys produced total 4, assigned 3, unassessed 1. A synthetic unknown duration had zero known samples and null average; a measured zero had one known sample and average zero. Coalescing the unknown average to zero lost that distinction. |
| 9   | The seeded unassessed admission had a historical start receipt, null assessment time and no stage transition. This inspects fixture state, not an implemented admission command.                                                                              |
| 10  | First assignment recorded exactly one null→A event, current revision 1, and matching source/event assessment time.                                                                                                                                            |
| 11  | Replaying the historical unassessed start receipt returned its original null result alongside current A and made no writes.                                                                                                                                   |
| 12  | Retrying the same first-assessment intent returned the original receipt without another event.                                                                                                                                                                |
| 13  | Null target, null expected revision and retired initial target were rejected (22023), with no changed source or history. The fixture's rejection is not a complete Core input contract.                                                                       |
| 14  | A transaction error after first assignment but before commit rolled back the source, event and receipt together.                                                                                                                                              |
| 15  | Two first assessments expected revision 0. A acquired the journey lock; B was observed waiting on A's exact PID using `pg_blocking_pids`. After A committed, B rejected the stale revision. Only A's event, receipt and revision remained.                    |

## Limits that must accompany any citation

The fixture has no supporter/ministry/purpose lifetime key, task/ask/owner,
notification, consent, funds, P12 capability, Supabase Auth, PostgREST, grants from
Core, HTTP client, cache, UI, import, historical migration or performance workload.
Required tenant/entity/preset fields illustrate scope integrity; they do not settle
the final schema, preset applicability or lifetime uniqueness. Stage absence must
not be added to the ordinary journey's business deduplication identity.

The fixture's stage/time paired-null CHECK models its new, fully known test data.
It is not a legacy-data constraint: a retained known stage can have an unknown
historical assessment date under D9, which must not be fabricated to satisfy this
illustrative check.

The fixed policy is `FOR ALL TO lab_member USING (tenant_id=1)`, with no explicit
`WITH CHECK`. PostgreSQL correctly inherits `USING` for resulting-row checks; the
experiment does not demonstrate an omitted-check bypass. The role receives direct
SELECT/UPDATE grants solely to exercise that engine behavior. This is not Core's
permitted write surface. First-assignment and receipt functions run as the isolated
owner, separately from those direct nonowner checks; the functions are not an
authorization example. Their public execution privileges are revoked.

The diagnostic join prints synthetic source stage codes to show why a missing
joined record is ambiguous. It is not a proposed user response; actual restricted
labels, IDs, existence, counts and errors require the owning disclosure policy.
Retired-stage display must retain the permitted historical reference rather than
depend on the current selectable catalog. No actual stage-duration formula or
report was implemented. One controlled race is not every transaction schedule,
revocation race, deadlock analysis or a load test. No browser test, application unit
suite or D12 regression suite was rerun for these evidence-only changes.

Fresh PostgreSQL 17 primary sources, retrieved 2026-10-10 (living documentation,
no article publication date): [constraints](https://www.postgresql.org/docs/17/ddl-constraints.html),
[JSON operators](https://www.postgresql.org/docs/17/functions-json.html),
[table expressions](https://www.postgresql.org/docs/17/queries-table-expressions.html),
[aggregates](https://www.postgresql.org/docs/17/functions-aggregate.html),
and [CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html).
These support engine semantics; Core's accepted decisions supply product meaning.
