# D22 disposable policy/admission probe

**29/29 expected outcomes passed, with seven actual two-session races and one reproduced unsafe numeric-coercion counterexample.** [Interpretation and limits](../database-policy-lifecycle.md) are part of the evidence. This is synthetic PostgreSQL mechanics, not Core/P12/financial/hosted Supabase/provider/privacy/user qualification.

Run from `/workspace/core` using existing Python standard library and Docker:

```sh
python3 docs/features/missionary-workspace-depth/grill/d22-evidence/postgres-probe/run.py
```

The runner imports the unchanged [D1 local Docker/psql concurrency helper](../../d1-evidence/postgres-probe/run.py). Cached image: `postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3`; actual server PostgreSQL 17.11 Debian `17.11-1.pgdg13+2`. Container `phase28-d22-pg` uses network none, no published ports and no host mounts. Trust authentication applies only inside this disposable synthetic instance. The container and anonymous volume were removed and absence verified at `2026-10-17T04:21:12.848971+00:00`.

- [setup.sql](setup.sql): nine forced coarse-Tenant-RLS tables, exact numeric domain, immutable versions/occurrences/intents, scoped references, bounded commands and grants.
- [run.py](run.py): expected values/SQLSTATEs, actual roles, state assertions, seven controlled sessions/races and cleanup.
- [results.json](results.json): 29 outcomes, exact commands/output, seven `Lock:transactionid` waits, expected unsafe rounding counterexample, artifact/helper hashes.
- [roles.json](roles.json), [privileges.json](privileges.json): seven nonsuperuser/non-BYPASS roles; actual grants, function ownership, search paths and ACLs.
- [sources.json](sources.json): five fresh technical bodies, six hash-verified same-day reused bodies and five owner hashes; explicit temporary cache paths/timestamps.
- [environment.json](environment.json), [cleanup.json](cleanup.json): actual image/server/isolation and verified deletion evidence.

Original live occurrence policy is captured before worker admission; same uninterrupted-generation delayed work uses its captured rule. Threshold changes are prospective. Off fences new admissions and old unadmitted generations; accepted exact reason plus durable task intent remains existing work and can materialize once while Off. Current source changes and authority still matter. The inert `materialized` row is not an actual task or communication.

The amount/basis/subject and permission gates are prequalified fixture inputs. The fixture does not prove actual financial amount, source-live policy selection, P2 currency parser/range/ISO metadata, P12/Auth, task lifecycle or privacy. Illustrative USD/JPY/KWD and threshold values are not product defaults. The numeric counterexample proves declared scale can round a fractional minor-unit input; the safe domain is a test mechanism, not a replacement schema recommendation.

**Settings Save receipt recovery is unproved:** the fixture proves expected-head CAS, no-op and audit rollback, but has no durable settings command-key result ledger. **Qualified restoration while Off is also unproved:** the fixture preserves admitted evidence and blocks after a changed source version; the real owner must repair previously admitted unconsumed work through its qualified correction contract. It does not forbid that repair or revive never-admitted old-generation candidates. Human Done/Not needed and D20 grouping/Undo are inherited requirements, not implemented here.

There was one successful execution. Constraint/permission denials and the unsafe counterexample are expected results, not findings of a Core exploit. No Core application/schema, dependency, live project, hosted database, runtime configuration or provider was changed.
