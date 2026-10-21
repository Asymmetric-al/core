# Restricted-start review: disposable PostgreSQL mechanics

On October 15, 2026 (America/Los_Angeles; October 16 UTC), the isolated probe
completed **34/34 assertions**, including expected unsafe outcomes and expected
SQL errors. [results.json](results.json) records every query, acting database role,
result/error and concurrency transcript. This is research evidence, not an
application implementation, migration, approved design or runtime qualification.

## Environment and boundary

- Real PostgreSQL **17.11**, image
  `postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3`.
- Container `phase28-d1-pg`, `--network none`, no published ports, no application
  mounts; disposable anonymous data volume. Docker used the explicit local Unix
  socket after clearing inherited endpoint/context/TLS selectors. Local trust
  authentication was confined to this isolated synthetic server.
- Separate actual SQL connections used ordinary `actor_a`, ordinary table-owner
  `fixture_owner`, explicit `BYPASSRLS` role, and ordinary `gate_manager`. The
  bounded fence helper was owned by a non-login, non-superuser, non-BYPASS role.
  [roles.json](roles.json) captures exact attributes. Superuser `postgres` created
  fixtures and observed final state; it was not substituted for ordinary actor
  assertions.
- [environment.json](environment.json) captures version/image/isolation;
  [cleanup.json](cleanup.json) records disposal. No Core database, Supabase
  project, Auth server, Data API, real person or provider was contacted.

## Findings supported by the run

| Mechanical question                                                 | Observed result and implication                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does omitting `WITH CHECK` automatically permit ownership transfer? | **No.** An UPDATE policy's omitted check inherited its `USING` predicate. Own-row edit succeeded; ownership and tenant changes failed with `42501`. The broad statement in the installed Supabase skill is incorrect for this case.                                                                                                                                                |
| Does an explicit check guarantee safety?                            | **No.** Deliberately overbroad `WITH CHECK(true)` permitted same-tenant ownership transfer where SELECT still allowed the resulting row. Policy meaning matters, not merely the presence of both clauses.                                                                                                                                                                          |
| Does owner-scoped RLS make every attribute immutable?               | **No.** The otherwise scoped policy allowed an unmentioned `classification` field to change from restricted to shared. RLS evaluates allowed row states; origin/classification/author immutability needs exact separate constraints, column grants or controlled commands as appropriate. This is not a proposal for Core's schema.                                                |
| How do multiple policies compose?                                   | A broad permissive SELECT policy ORed with the narrow policy and exposed all three rows, including another tenant. An added restrictive owner/tenant floor intersected the permissive union and restored one-row visibility.                                                                                                                                                       |
| Does enabling/FORCE RLS constrain everyone?                         | Ordinary table owner saw three rows with RLS merely enabled, then zero under FORCE with no applicable policy. Explicit BYPASSRLS still saw three. FORCE does not constrain superusers/BYPASSRLS, nor remove a table owner's ability to administer its table.                                                                                                                       |
| Do views inherently bypass RLS?                                     | The default view used its ordinary table owner's rights: three before FORCE, zero after FORCE. The security-invoker view used caller policy and returned one. A superuser-owned default view still returned three after FORCE. Audit owner, grants and underlying policy together.                                                                                                 |
| Do definer functions inherently bypass RLS?                         | A definer owned by the ordinary FORCE-constrained table owner returned zero; invoker returned caller-visible one; superuser-owned definer returned three. New function default PUBLIC EXECUTE exposed the latter to the ordinary actor. Revoking PUBLIC EXECUTE removed that call (`42501`). Schema visibility and grants also matter; these SQL tests do not prove HTTP exposure. |
| Can constraints reveal hidden existence?                            | SELECT returned zero hidden registry rows, but a colliding unique address returned `23505` with identifying constraint detail. A foreign key accepted an existing hidden parent but rejected a nonexistent one with `23503`. Raw error/success distinctions can expose existence despite correct SELECT RLS.                                                                       |
| Does a child tenant predicate prove parent tenancy?                 | **No.** The child row met its tenant policy while a single-column FK pointed to a hidden other-tenant parent. A composite `(tenant,parent_id)` FK rejected that reference and accepted a same-tenant parent. Composite FKs alone do not remove all existence channels.                                                                                                             |
| Does every UPDATE require SELECT policy?                            | A targeted `WHERE id=1 RETURNING id` update returned zero without a SELECT policy. A blind `UPDATE ... SET value='blind'`, which did not read columns or use RETURNING, succeeded under the UPDATE policy; superuser readback confirmed the change. “All UPDATEs silently do nothing without SELECT” is too broad.                                                                 |
| Can a unique semantic operation identity reconcile concurrency?     | Two real concurrent connections submitting the same scoped operation/payload waited on a transaction lock, returned the same accepted ID, and left one effect. Changed payload under the same identity failed `22023`. This only proves the toy function/table mechanism.                                                                                                          |
| Does an expected revision survive a concurrent write?               | With both updates targeting revision 1, the second waited; after the first committed revision 2, the second re-evaluated and changed zero rows. Final value remained the first writer's value.                                                                                                                                                                                     |
| Can write and revoke be ordered at one authority boundary?          | With a shared-row lock in the synthetic write command, revoke-first made the writer wait then deny with zero effects. Write-first held the lock until its acceptance committed; later revoke waited and then became effective without erasing the accepted effect. Both orders observed actual `Lock:transactionid` waits.                                                         |
| Is a preflight permission check sufficient?                         | **No.** A separate unlocked check returned allowed; a revocation committed; a subsequent write relying on the earlier result still succeeded. Final state held an effect while current permission was false.                                                                                                                                                                       |

The four concurrency cases were synchronized by open transactions and observed
`pg_stat_activity` lock waits before releasing the first transaction. They did
not infer ordering from a timer. Bounded polling waits at most ten seconds for
each expected database condition. The separate stale-check counterexample
deliberately commits revocation between a read and a subsequent write.

## Sources and corrections to simplified guidance

The primary PostgreSQL 17 documentation was fetched during this review:

- [Row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html): implicit
  checks, OR/AND composition, table owners, FORCE/BYPASS and integrity-check
  existence channels.
- [CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html):
  UPDATE/SELECT interaction and implicit check semantics.
- [CREATE VIEW](https://www.postgresql.org/docs/17/sql-createview.html): default
  owner rights versus `security_invoker`.
- [CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html):
  invoker/definer rights, default EXECUTE and secure search paths.
- [Transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html):
  READ COMMITTED conflict waits and predicate re-evaluation.
- [Current Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security.md)
  and [function guidance](https://supabase.com/docs/guides/database/functions.md).

[source-docs.json](source-docs.json) retains source URLs and fetched-byte hashes.
The parent review also fetched current Supabase changelog and relevant patch,
Realtime and TLS notices. No upgrade, cloud configuration or application
remediation follows from this probe. Primary documentation and actual behavior
take precedence over the installed skill's simplified statements about omitted
checks, UPDATE, views and definer functions.

## Reproduction and limits

[setup.sql](setup.sql) builds only `probe` fixtures and distinct synthetic roles
in a **new disposable empty** Postgres server. [run.py](run.py) runs the assertions
through `docker exec ... psql`, records JSON evidence, and exits nonzero on a
failed expectation. It requires Python standard library and local Docker; no
new Python package, application dependency, fixture service or framework is
installed. Start an isolated fresh container with the exact pinned digest and
name, wait for `pg_isready`, run `python run.py`, then stop that exact container.
The container must have `--rm --network none`, no ports and no application/data
mounts. The runner refuses a network-connected or port-published container and
does not drop existing roles/tables to force rerun. Reruns require a new empty
container. A failed run should also be followed by exact-container disposal.

These are deliberately tiny mechanics, not a restricted-prospect product. In
particular, the fixture uses fixed tenant 1 and database role/session identities;
it does not model Core's trusted request context, Supabase pooled roles/JWTs,
NHI, policy epoch, nested household relationships or permission engine. Some toy
effect tables deliberately have broad grants to isolate a counterexample; they
are not safe production patterns to copy. The definer fence function is only a
controlled experiment with explicit privileges, not a recommendation to bypass
application access controls.

Still unproved: deployed Core RLS and every service/direct/RPC path; PostgREST
exposure; real token/session revocation; pool/context reuse; views/functions in
the actual schema; privacy-safe deduplication responses and side channels;
classification-preserving merge/promotion; caches/search/count/export/AI;
Realtime teardown; backup/restore; immutable authored origin/history; retained
data migration; actual source tasks/financial/communication semantics; provider
contracts; accessibility and representative user journeys. No workload or
performance qualification was attempted. Passing 34 synthetic assertions must
not be reported as passing these unresolved acceptance obligations.
