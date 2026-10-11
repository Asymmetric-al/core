# D7 closure/admission race mechanics

Run 2026-10-10 against a disposable PostgreSQL **17.11** container. All **six
checks passed**; `results.json` and `run-metadata.json` preserve observations.

The fixture uses deliberately generic `lab.scope` and `lab.obligation` tables.
They are **not** a proposed Core schema, D7 implementation or lifecycle enum.
No application database, migration, credential, donor or provider was used.

The tested assumption: “A transaction, a parent lock and an FK are enough to
ensure closure cannot strand concurrently admitted work.” The counterexample
disproves that unqualified claim:

1. A closing transaction holds `FOR NO KEY UPDATE` and sees no child obligation.
2. Another transaction, relying on an ordinary FK and unlocked parent-state read,
   admits and commits new work while that lock remains held.
3. Closing from the earlier precheck produces a closed toy scope with new work.

The positive cases show one sufficient **mechanical** strategy: both relevant
writers participate in the same conflicting parent lock, then recheck current
facts. If closure wins, later work is not admitted; if work wins, closure is not
accepted. Two explicit transaction barriers and observed `pg_stat_activity`
Lock waits establish ordering; no race result depends on guessing a sleep time.
This does not mandate those exact SQL statements over another proved strategy.

It proves neither complete application-writer coverage nor authorization,
Supabase RLS, migration safety, UI, throughput, provider delivery or end-to-end
D7 behavior. A DB lock cannot compensate for unqualified writers or incomplete
source-obligation scope.

Reproduce from the repository root with the already-available pinned image:

```sh
python docs/features/donor-development/grill/d7-evidence/closure-race-probe/run-lab.py
```

The runner refuses to reuse a preexisting named container; uses `--network none`,
no published ports, no host mounts and a temporary database filesystem; and
removes only the container it created. Cleanup was verified successful. The
fixture does not choose or connect to any configured Supabase project.

Primary technical grounding, retrieved 2026-10-10:
[PostgreSQL 17 explicit locking](https://www.postgresql.org/docs/17/explicit-locking.html)
and [transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html).
