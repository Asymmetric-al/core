# Data access checkpoint

Tracking: [AL-1965](https://github.com/Asymmetric-al/core/issues/1965).
Status: implementation and qualification in progress; not merged or production-authorized.

The [selected versions and evidence](data-access-qualification.json) cover Supabase JS, Zod, TanStack DB/Query/Table/Virtual and their bindings. Supabase SSR and several TanStack bindings were already current; retained releases are qualified with the new cohort.

The refreshed cohort resolves one physical DB 0.15.2 runtime across database/UI, React, Query and Supabase consumers, with React DB 0.5.12 and Query Collection 1.4.8. The former DB override and install-time symlink rewrite are removed. Query Core 5.104.5 also has one physical runtime across its consumers. Real adapter tests cover compound joins, aggregate-join rejection before transport, confirmed writes, rollback and bounded realtime snapshot recovery. Transactions use `when("settled")`; server confirmation still requires the adapter to await its write and sync-acceptance work.

The current Supabase adapter 0.1.0 requires Core's registered patch. A new delayed-acceptance regression fails against pristine upstream and passes with that patch. Core database maintainers own it; every adapter, DB, Query or Supabase cohort change invalidates the compatibility evidence. PDF aliases and installation repairs remain owned by the source-recovery checkpoint.

The initial database baseline passed 185 tests. The first upgraded selection passed 187 database/adapter/runtime tests and 327 auth/table/grid/virtualization tests. After refreshing the coordinated DB patches, 917 tests in 143 selected files pass, and the adapter patch's delayed-settlement regression still fails against pristine upstream and passes when patched. These overlapping runs are separate evidence, not additive totals.

The actual Supabase JS 2.118.0 and SSR 0.12.7 clients passed 19 checks against the owned isolated local stack: password/session flows, tenant and anonymous denial, denied role escalation, authenticated realtime with exact money/currency values, SSR request cookies, and restored fixture census. The fixture accepts only an explicitly named local modernization target; credentials enter through stdin and are omitted from output. Thirteen focused tests cover invalid targets, expected denial responses, bounded cleanup and continued cleanup after failure. This does not prove hosted or browser UI behavior.

A separate clean checkout installed 1,946 packages with the frozen lockfile and no drift. Its 44 contract tests passed across runtime identity, adapter confirmation, fixture safety and instruction consistency. The opaque vendored database never materialized in that checkout. The infrastructure snapshot delta preserves every data implementation and installation input.

Full repository gates, merged-develop requalification, browser checks, security graph reconciliation, current-head review/CI/deployed previews and merge readback remain required. No production operation was executed.

Sources: [current Table v9 migration guide](https://tanstack.com/table/latest/docs/framework/react/guide/migrating), [row-model guide](https://tanstack.com/table/latest/docs/guide/row-models), [DB transaction guide](https://tanstack.com/db/latest/docs/guides/mutations), and the exact npm release metadata in the qualification record.
