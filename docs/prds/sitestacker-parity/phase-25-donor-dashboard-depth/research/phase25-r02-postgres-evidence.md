> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Phase 25 R02 — PostgreSQL assumption checks

Run during the 6–7 September 2026 grooming review. **11 assertions passed on PostgreSQL 17.10.** These are synthetic counterexamples and privilege-semantics checks, not tests against Core's schema or live data.

The runner created a uniquely named, labeled container from an already cached `postgres:17-alpine` image with `--pull never`, network disabled, no published ports, a 128 MB temporary data filesystem and a 256 MB memory limit. It used only invented tenant/source/content rows and test roles. No Core migrations, credentials, environment files, hosted database or provider account were used. Internal trust authentication applied only inside that disposable network-disabled container. The runner verified the exact container identity/label before removing it; existing containers were not removed.

<!-- prettier-ignore -->
| Assertion | Actual result | Interpretation |
| --- | --- | --- |
| Offset paging with insertion between pages | 1 repeated ID | Offset can shift the next-page boundary. |
| Stable key boundary in the same fixture | 0 repeated IDs | This avoids that specific counterexample; it does not prove the complete owner cursor contract. |
| Filter target ministry only in loaded page | 0 results | Local filtering can falsely imply no matching history. |
| Filter target at source before limiting | 1 result | The matching fixture was present beyond the original page. |
| Fresh authorized query after visibility narrowing | IDs 2,1 | The now-hidden fixture is excluded. This is sequential, not actual concurrent Core revocation proof. |
| Cross-tenant direct read as restricted role | 0 rows | The fixture's RLS constrained that invoker. |
| Cross-tenant read through owner view | 1 row | A view may execute with owner privileges. |
| Cross-tenant read through invoker view | 0 rows | Invoker semantics retained the fixture's RLS boundary. |
| Direct owner/bypass read | 1 row | A bypass/owner path is not protected merely by having RLS policies. |
| Attempt to update an existing forbidden row | 0 changed rows | USING constrained the old-row selection. |
| Attempt to move an allowed row to forbidden tenant | WITH CHECK rejection | An allowed old row cannot be allowed to become a forbidden new row. |

The exact SQL is attached below. It intentionally demonstrates unsafe view/bypass semantics with artificial rows. It is not an application migration and should not be applied to a Core or hosted database.

Primary references: [PostgreSQL 17 LIMIT/OFFSET](https://www.postgresql.org/docs/17/queries-limit.html), [row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html), [view security](https://www.postgresql.org/docs/17/sql-createview.html).

What remains unproved: Core grants/RLS/functions/storage, actual audience history, real owner commands, concurrent source admission, cache and browser behavior, protected media, performance, usability and production state. Those require the real implementation and its owning test harness. The other actual-helper check in the review was separate from these 11 SQL assertions.

## Recorded machine result

```json
{
  "scope": "synthetic isolated PostgreSQL assumptions only; not Core schema proof",
  "results": {
    "offset_duplicate": "1",
    "keyset_duplicate": "0",
    "loaded_slice_target_count": "0",
    "source_filtered_target_count": "1",
    "fresh_authorized_page": "2,1",
    "rls_cross_tenant_rows": "0",
    "owner_view_cross_tenant_rows": "1",
    "invoker_view_cross_tenant_rows": "0",
    "owner_bypass_cross_tenant_rows": "1",
    "forbidden_update_changed_rows": "0",
    "postgres_version": "17.10",
    "with_check_rejected": "true"
  },
  "expected_assertions": 11
}
```

[Exact synthetic SQL](phase25-r02-postgres-assumptions.sql)

[Full R02 review](phase25-r02-adversarial-review.md)
