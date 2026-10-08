# Supabase TanStack DB compatibility patch

`@supabase-labs/tanstack-db@0.1.0` declares support for TanStack DB `>=0.6 <1.0`
but needs this patch with DB `0.12.1` and Query DB Collection `1.4.0`. The root
`patchedDependencies` entry applies the patch during Bun installation, including
frozen lockfile installs. No application runtime monkeypatch is required.

## Scope

- Serialize the complete current `JoinClause.on` expression, including nested
  compound equality predicates. Nonaggregate `queryOnce` continues to delegate
  execution to TanStack DB.
- Reject server aggregate/groupBy/having queries containing joins, including a
  joined source subquery, before transport. PostgREST resource embedding chooses
  catalog relationships and returns nested rows; it cannot generally preserve
  the supplied `ON` predicate, outer-join semantics, or flat join cardinality.
  Single-table server aggregate queries retain the upstream path.
- Await insert/update/delete direct-write acceptance so schema or persistence
  rejection reaches `transaction.isPersisted.promise` and optimistic state rolls
  back. A successful HTTP mutation followed by local validation failure can
  already have changed the server; local rollback does not undo that server write.
- Await and catch Realtime direct writes. A failed event logs the table and error,
  attempts one `collection.utils.refetch({ throwOnError: true })`, and catches and
  reports recovery failure. Query collection error utilities retain the recovery
  error and the last valid snapshot remains available. The patch adds no retry
  loop; the existing QueryClient retry policy still applies to that refetch. It
  does not log event payloads or introduce a privileged transport.

The patch changes only published `dist/index.mjs`. Public signatures are
unchanged, so `dist/index.d.mts` needs no modification. This is a compatibility
repair, not a replacement server query planner or a Supabase schema/RLS change.

## Provenance

- Registry tarball:
  <https://registry.npmjs.org/@supabase-labs/tanstack-db/-/tanstack-db-0.1.0.tgz>
- Registry integrity:
  `sha512-4KccEP0NsmhwzTUw9g+1izvsLdIWXLIOKFP6ycoK1XI42vgiCAvGseXGllGp/ZPwddt5H15pKFJXoJ4uWskAFw==`
- Original `dist/index.mjs` SHA-256:
  `37b4d15c8d1dd3ea08bffcf9e6dbc0f6de82d8de1b81d9734fa383160172b2e2`
- Published upstream commit:
  [3503c451b2f2550ab4069067673881f39342b588](https://github.com/supabase/tanstack-db/tree/3503c451b2f2550ab4069067673881f39342b588)
- TanStack DB `0.12.1` provenance commit:
  [3825ac3cb1db1fb145cafcc202dc05424b74dc56](https://github.com/TanStack/db/tree/3825ac3cb1db1fb145cafcc202dc05424b74dc56)
- [PostgREST FK resource embedding](https://docs.postgrest.org/en/v14/references/api/resource_embedding.html)
  and [aggregate placement](https://docs.postgrest.org/en/v14/references/api/aggregate_functions.html#aggregates-and-resource-embedding)
- [Bun patch workflow](https://bun.sh/docs/pm/cli/patch)

## Validation and removal

The integration regression suite uses the real adapter, DB, Query DB Collection,
and transaction runtime with deterministic fake HTTP/Realtime transport. Delete
rejection tests additionally inject a failed promise at the public direct-write
acceptance utility to model a rejected durable step. It makes no network calls.

```bash
bunx vitest run tests/unit/packages/database/supabase-adapter-compatibility.test.ts
bunx vitest run tests/unit/packages/database
```

With the unpatched release, joins throw while serializing nonexistent
`left`/`right`, insert/update transactions report completion despite invalid
server rows, and Realtime schema failures become unhandled promise rejections.
The suite verifies complete compound join results, rejection before server
join pushdown, optimistic rollback, bounded recovery, and successful writes.

For an upstream refresh, inspect the exact release source and declarations,
prepare its private editable package with `bun patch`, rebase only still-needed
changes, then use `bun patch --commit --patches-dir packages/database/patches`.
Commit the resulting patch, root mapping, and lockfile together. Remove this
patch only after an unpatched replacement passes this suite and preserves every
join predicate and mutation/error contract. A planner that intentionally
supports server joins needs dedicated relationship/cardinality evidence before
the corresponding rejection tests are changed.
