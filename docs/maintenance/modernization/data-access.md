# Data access checkpoint

Tracking: [AL-1965](https://github.com/Asymmetric-al/core/issues/1965).
Status: implementation and qualification in progress; not merged or production-authorized.

The [selected versions and evidence](data-access-qualification.json) cover Supabase JS, Zod, TanStack DB/Query/Table/Virtual and their bindings. Supabase SSR and several TanStack bindings were already current; retained releases are qualified with the new cohort.

The refreshed cohort resolves one physical DB 0.15.2 runtime across database/UI, React, Query and Supabase consumers, with React DB 0.5.12 and Query Collection 1.4.8. The former DB override and install-time symlink rewrite are removed. Query Core 5.104.5 also has one physical runtime across its consumers. Real adapter tests cover compound joins, aggregate-join rejection before transport, confirmed writes, rollback and bounded realtime snapshot recovery. Transactions use `when("settled")`; server confirmation still requires the adapter to await its write and sync-acceptance work.

The current Supabase adapter 0.1.0 requires Core's registered patch. A new delayed-acceptance regression fails against pristine upstream and passes with that patch. Core database maintainers own it; every adapter, DB, Query or Supabase cohort change invalidates the compatibility evidence. PDF aliases and installation repairs remain owned by the source-recovery checkpoint.

The initial database baseline passed 185 tests. The first upgraded selection passed 187 database/adapter/runtime tests and 327 auth/table/grid/virtualization tests. After refreshing the coordinated DB patches, 917 tests in 143 selected files pass, and the adapter patch's delayed-settlement regression still fails against pristine upstream and passes when patched. These overlapping runs are separate evidence, not additive totals.

The actual Supabase JS 2.118.0 and SSR 0.12.7 clients passed 20 checks against the owned isolated local stack: independently verified gateway ownership, password/session flows, tenant and anonymous denial, denied role escalation, authenticated realtime with exact money/currency values, SSR request cookies, and restored fixture census. Before constructing SDK clients, the fixture inspects a validated local Docker socket and matches the running Kong container's project label, name, API port and address family. It refuses HTTP redirects. Credentials enter through stdin and are omitted from output.

Fixture users receive reserved UUIDs and trusted run markers before creation begins. Cleanup verifies each user's marker, tenant and email before deletion, and successful cleanup confirms absence before removing tenants. A live probe deliberately lost a successful Auth creation response; verification failed as expected and cleanup recovered the user/profile and restored the census. An absent UUID after an ambiguous timeout does not prove that the request cannot commit later: it fails qualification. Separate lookup, delete and confirmation operations retain bounded best-effort cleanup, and no complete cleanup claim is made when any operation fails.

Tenant and fund creations also record each attempted identity before sending the insert. Cleanup checks the run-specific name plus tenant or slug before deletion and confirms each exact ID absent afterward. Unattempted reservations stay untouched. A missing row after an unacknowledged insert stays unresolved, so an insert that can still commit later cannot be certified clean from counts alone. Real tenant- and fund-response-loss probes each fail verification as intended while restoring the census.

The original 13 fixture tests remain, with 19 ownership/Auth cases and 13 additional table-creation cases. Together with 19 build-policy cases, all 64 focused tests pass. The file-package repair script now selects all three app builds when changed. These checks do not prove hosted or browser UI behavior.

A separate clean checkout installed 1,946 packages with the frozen lockfile and no drift. Its initial 44 contract tests passed across runtime identity, adapter confirmation, the earlier fixture checks and instruction consistency. The opaque vendored database never materialized in that checkout. At published b350, the same clean installation passed 66 selected contract tests in six files with unchanged installation inputs and no environment file. The current table follow-up tests above are separate evidence.

Published b350 passed full preflight, current-head CI/full integration/E2E and all three deployed preview smoke checks; Vercel confirmed all three READY at that exact commit. The table follow-up still requires repeated full repository gates, browser checks, current-head review/CI/deployed previews and merge readback. Security graph reconciliation remains open. No production operation was executed.

Sources: [current Table v9 migration guide](https://tanstack.com/table/latest/docs/framework/react/guide/migrating), [row-model guide](https://tanstack.com/table/latest/docs/guide/row-models), [DB transaction guide](https://tanstack.com/db/latest/docs/guides/mutations), and the exact npm release metadata in the qualification record.
