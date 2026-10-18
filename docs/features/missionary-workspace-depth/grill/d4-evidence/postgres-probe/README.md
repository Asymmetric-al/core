# D4 working-state mechanics probe

Executed **2026-10-16 UTC** on PostgreSQL **17.11**: **19/19 outcomes passed**, including **three controlled concurrent two-session cases with observed lock waits**. Container and anonymous data volume removal were verified. This is a **synthetic hypothesis fixture**, not Core code, a proposed final schema, a source producer or a Supabase/Auth/API qualification. Intentional unsafe counterexamples are expected outcomes, not discovered production vulnerabilities.

## Hypotheses tested

| Hypothesis                                                                                             | Observed evidence                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Active/archived is working state, independent of audience and identity.                                | Archive and restore retain row ID, actor and canonical key. Authorized matching finds the archived record; an outsider finds zero rows.                                                                                                                                                                           |
| An old accepted command must not apply its effect again.                                               | An archive retry after Undo returns a historical `replay` result while the row remains active at its later revision. A new retry key with the old revision conflicts without changing that row. Reusing a key with different command meaning also conflicts.                                                      |
| Undo targets an exact transition.                                                                      | Undo of the current archive restores the same row. Undo of an earlier archive cannot reverse a later rearchive, even when supplied the latest row revision.                                                                                                                                                       |
| Competing working-state mutations need an atomic revision decision.                                    | Archive and stale restore overlap in two actual transactions. Restore waits on a lock, then conflicts; the accepted archive remains at revision 2.                                                                                                                                                                |
| Mutations and revocation must use a common current-authority fence.                                    | Revocation first makes restore wait and then return unavailable without mutation. Restore first holds the authority lock, commits, then the waiting revocation commits. After either revocation, current source reads return zero; old acceptance recovery is also unavailable. A restore never grants authority. |
| Archived records must not disappear from identity integrity merely because they leave the active list. | A unique tenant/canonical-key constraint covering both states rejects a second same-key row while the original is archived. The original remains the sole row.                                                                                                                                                    |
| Active-only matching/uniqueness can create a duplicate problem.                                        | The deliberately unsafe partial unique index permits an archived original plus a new active row with the same canonical key; restoring the original then fails with `23505`. Filtering the authorized matching query to active rows returns zero where matching across both states returns one.                   |

[results.json](results.json) preserves exact SQL, role, expected output/SQLSTATE, actual output and pass/fail for ordinary outcomes. Its concurrency records contain both session transcripts, the observed lock wait and final-state readback. [setup.sql](setup.sql) contains the complete small fixture, with no application migrations or integrations.

## What the mechanism illustrates

The fixture keeps a working-state field and revision on one retained source, plus a retry receipt bound to actor, source, target state, expected revision and optional exact Undo transition. State and receipt commit together. It locks the actor's current authority row before the source row; cooperating revocation locks that same authority row. It checks authority before consulting a previous receipt, and a recovered receipt does not claim the historical state is still current. These are illustrative mechanics for the hypotheses, **not a selected Core storage or command design**.

All test commands use actual nonsuperuser login roles. The controlled function owner is NOLOGIN/NOSUPERUSER/NOBYPASSRLS and does not own the tables, so its ordinary RLS policies apply. Function PUBLIC execution is revoked. [roles.json](roles.json) records actual attributes. PostgreSQL `session_user` identifies these fixture logins; it is not an analogue that qualifies Supabase JWT handling. The fixture's SELECT policy includes current authority and has no active-only predicate. Separate administrative resets between races restore the test precondition; they are not a product restore flow or authority granted by working state.

`canonical_key` is an opaque, already resolved synthetic identity key, **not email, name, a household address, or a proposed Core matching rule**. The constraint example only proves that known identity integrity can span both states. It neither proves complete identity resolution nor authorizes disclosure of protected candidates. Raw unique errors can reveal hidden existence; the earlier D1 probe and PostgreSQL RLS documentation establish that separate risk. Matching must remain source-authorized, and any user-visible conflict needs its own safe disclosure contract.

## Primary sources and limits

[sources.json](sources.json) records freshly fetched PostgreSQL 17 primary URLs, raw/text hashes, inspected sections and the relevant mechanisms:

- [Row Security Policies §5.9](https://www.postgresql.org/docs/17/ddl-rowsecurity.html): policy scope, bypass roles, integrity-check disclosure and mutable authorization subquery races.
- [Transaction Isolation §13.2.1](https://www.postgresql.org/docs/17/transaction-iso.html): Read Committed lock waits and re-evaluation of an updated row.
- [Partial Indexes §11.8](https://www.postgresql.org/docs/17/indexes-partial.html): a partial unique index constrains only its predicate's subset.
- [Unique Indexes §11.6](https://www.postgresql.org/docs/17/indexes-unique.html): multicolumn uniqueness and NULL behavior; the fixture's identity columns are NOT NULL.

Not qualified: Core archive/restore producers, canonical Party/relationship resolution, operational grants, RPC exposure, Supabase Auth/PostgREST, external providers, required source audit contracts, retention/deletion, merge/split semantics, task/finance/notice side effects, bulk actions, cross-record same-key races, all malformed inputs, cache/UI/accessibility, long-lived snapshots, in-flight read revocation or production performance. The coarse actor gate serializes cooperating authority changes for this experiment; no production lock granularity or throughput claim follows. Noncooperating writers, a bypass role, or another revocation path can invalidate its guarantees. D1 already demonstrates why an unfenced stale permission precheck is insufficient; this probe does not repeat that counterexample.

## Reproduce

From `/workspace/core`, with the pinned Docker image cached:

```sh
PYTHONDONTWRITEBYTECODE=1 python docs/features/missionary-workspace-depth/grill/d4-evidence/postgres-probe/run.py
```

[run.py](run.py) reuses the D1 Docker/psql/session helpers. The result records hashes for the setup, runner, source manifest and helper. It uses the explicit local Docker socket, clears inherited endpoint selectors, starts `phase28-d4-pg` with network `none` and no published ports, and removes its container and anonymous volume in `finally`. Local trust authentication is confined to this synthetic server. [environment.json](environment.json) records the actual server/image/isolation; [cleanup.json](cleanup.json) records verified removal. Pinned image: `postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3`.
