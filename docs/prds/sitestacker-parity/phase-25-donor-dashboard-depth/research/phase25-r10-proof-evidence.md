> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Question 10 — Executed evidence and limits

7 September 2026. Research only. No target implementation, browser/assistive, hosted/provider or production-capacity certification.

## Actual shared rendering and installed TanStack behavior

<!-- prettier-ignore -->
| ID | Observation |
| --- | --- |
| L01 | Actual shared DataTableResponsive with pagination chrome disabled still renders only 10 of 25 supplied rows unless its processing mode is changed. {"rows": 25, "rendered": 10} |
| L02 | Actual shared table with manualPagination/manualFiltering/manualSorting renders all 25 supplied rows in SSR; this tests row-model behavior, not server completeness or browser scrolling. {"rendered": 25} |
| L03 | Actual shared card mode renders all 25 supplied card records despite virtualization.enabled. Source confirms card view receives neither virtualization nor infiniteScroll; SSR alone does not test mobile media-query transition.  |
| L04 | Installed Virtualizer chooses 12 render items for a synthetic 10,000-row input and 500px viewport, but the full 10,000 input records remain allocated. {"inputRows": 10000, "renderItems": 12} |
| L05 | Stable record keys retain identity across prepend, whereas position is changed. This core observation does not prove visible scroll-anchor preservation.  |
| L06 | Disabling Virtualizer returns no virtual items. Consumers must render a real nonvirtual path, not an empty list, and preserve navigation separately.  |
| L07 | Installed Query maxPages=2 evicts the first page after the third fetch; a virtual list cannot rely on unchanged array positions or assume earlier records remain in cache. {"retainedPageParams": [1, 2]} |
| L08 | With a supported previous-page function, Query can retrieve the evicted earlier page. The application still must preserve visual anchors and source authorization.  |
| L09 | Query keys alone select cache entries; a reused static key returns prior cached synthetic actor data. An actor-specific key does not. This is library behavior, not proof of an application cross-user disclosure.  |
| L10 | Installed Query-backed collection treats a new one-row query result as its complete snapshot and removes earlier rows. Feeding consecutive cursor pages into this same unqualified snapshot would lose history.  |
| L11 | Observed collection record count immediately after clearing its QueryClient; collection cleanup must be qualified independently of Query cache cleanup. {"retainedAfterQueryClear": 1} |

One initial card-fixture assertion was corrected by explicitly naming its primary display field. The original failed attempt is retained in the bundle. This was not an application fix.

## Native current-schema PostgreSQL observations

The repository native verifier applied **76 forward migrations** on PostgreSQL **17.10** in a unique networkless container with no published ports. Only migration/tool directories were mounted read-only. Synthetic records only. Container removal was verified.

<!-- prettier-ignore -->
| ID / assertion | Observed | Result |
| --- | --- | --- |
| D01_own_current_policy_reads_320 | 320 | Passed |
| D02_unrelated_actor_gets_no_rows | 0 | Passed |
| D03_anon_gets_no_private_rows | 0 | Passed |
| D04_authenticated_direct_insert_denied | SQLSTATE 42501 | Passed |
| D05_authenticated_direct_update_denied | SQLSTATE 42501 | Passed |
| D06_authenticated_direct_delete_denied | SQLSTATE 42501 | Passed |
| D07_filter_after_loaded_cap_misses_exact_old_gift | 0 | Passed |
| D08_filter_before_bounded_limit_finds_exact_old_gift | 1 | Passed |
| D09_direct_scope_count_is_320_not_capped_250 | 320,250 | Passed |
| D10_negative_money_rejected | SQLSTATE 23514 | Passed |
| D11_poisoned_tenant_fk_is_accepted_by_privileged_writer | a2000000-0000-4000-8000-000000009999 | Passed |
| D12_policy_alone_reads_pre_poisoned_row | 1 | Passed |
| D13_explicit_tenant_scope_excludes_poisoned_row | 0 | Passed |
| D14_next_statement_rechecks_current_owner_relation | 0 | Passed |

**Interpretation:** current owner reads and ordinary donor-write denials are real protections. Independent legacy donor/Tenant foreign keys still admit privileged scope poisoning; an explicit Tenant query excludes that row. This is not an ordinary-donor write path or a reported deployed exploit. Before-limit filtering discovers an older source match that after-limit filtering misses.

## Scope and reproducibility

The bundle includes the exact scripts, result JSON, failed fixture attempt, native SQL transcript and migration hashes. L01–L03 are actual shared-component SSR; L04–L11 are installed-library synthetic observations. D01–D14 use actual migrated legacy donations, not a proposed P13 schema. No new target-concurrency or donor/browser test ran. Previous Q05 concurrency proof remains historical and was not counted again.

The required target PostgreSQL/authorization/concurrency, source/adapter, browser, accessibility, money and performance evidence is P01–P14 in the review. These results neither satisfy those target gates nor authorize implementation.

[Full review](phase25-r10-adversarial-review.md) · [Historical bundle inventory: phase25-r10-proof-bundle.zip](README.md#historical-verification-bundles)
