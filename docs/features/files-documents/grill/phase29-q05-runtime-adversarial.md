# Phase29 Q05A — durable recipient history with current-file actions

Read-only runtime/schema review, 20 October 2026. Repository: `/home/conrad/code/core`, HEAD `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. Conrad selected A: concise source-approved submission/correction history, with ordinary View/Download on current permitted files only. Q01–Q04 remain ratified. This is research for the amendment package, not product implementation or release qualification.

Only source, installed test tooling and three existing bounded unit files were used. No credentials, private rows, stored file bytes, provider operations, dependency changes or product edits. Parent owns canonical decisions. Source absence claims are limited to the searched native request, API/UI, schema/migration and nearby history paths; no claim of exhaustive live-system coverage is made.

## Outcome

A is feasible as a small participant-safe read model over durable source-owned receipt/correction facts. It must not be implemented by returning a staff audit log, filtering a full timeline in the browser, treating every retry as a new submission, or deciding currentness from chronological order.

The new history is metadata disclosure even without file actions. Current source permission must constrain rows and fields before counts, pagination, cursors, serialization, caching and signals. A still grants no ordinary read of superseded bytes. Q04's private delivery boundary must deny stale current-file URLs once their exact member is superseded, while preserving the inherited handling of an already admitted stream.

The current repository supplies useful identity, read-model, error-handling and UI pieces, alongside concrete patterns that would be unsuitable if copied. It does not supply a qualified generic native recipient history implementation.

## Exact lineage and scope

“Earlier” means a **superseded predecessor in the exact correction lineage**, not every file with an earlier timestamp. A Document Request Item can have several supporting members. Correcting one member changes only its source-admitted candidacy/relation; unrelated siblings and independent uses remain intact. A new correction that fails checks does not silently revive its predecessor.

Source intent is explicit in:

- `docs/features/files-documents/docs/adr/0003-recipient-corrections-and-exact-review-lineage.md:18–33`: durable correction admission atomically records receipt, successor relation, review-set change and required history/effect intent; admission fences predecessor candidacy; no silent revival.
- `docs/features/files-documents/docs/adr/0004-submitted-original-download-and-current-source-authority.md:19–46`: exact admitted byte identity, current-source read authorization, correction/read race handling, no historical or post-closure grant.
- `docs/features/files-documents/CONTEXT.md:14–31,39–68`: recipient authority, confirmation, preview, item, correction and original are distinct.
- `docs/features/files-documents/grill/phase29-q05-question.md:103–116,136–155`: concise source-approved received/corrected facts, protected metadata/counts, source outcomes rather than incomplete transfer/retries, no automatic history transfer through reassignment/mailbox/Party merge/hash equality.

These are source contracts. They do not mean that generic receipt, event or history tables already exist.

## Actual nearby runtime and unsuitable shortcuts

### 1. Support timeline is a staff timeline, not a recipient projection

`apps/admin/app/api/admin/support/conversations/[id]/messages/route.ts:9–18` runs behind `withSupportHubAccess`, returns the message list and uses an error response on failure. This is the current admin source, not a private-request recipient endpoint.

`apps/admin/features/support-hub/hooks/use-support-messages.ts:36–68`:

- Fetches/caches the messages before applying optional `excludePrivate`.
- Filters `isPrivate` in browser memory (`50–55`), then sorts by postedAt and ID.
- Returns `isError` and `isReady` separately.

That browser filter is a display feature for an authorized staff response. It cannot secure a recipient history projection: private rows have already crossed the response/cache boundary. Hiding a row or collapsing a section cannot protect its body, filename, actor or count.

`ConversationTimeline.tsx:27–35` consumes only `data` and `isLoading`. When the hook has no successful rows after an error, its `query.data ?? []` becomes an empty array and the component can render `EmptyTimeline`. With cached rows it can continue showing them without an error indicator. This is an exact unsuitable precedent for confusing missing history with “nothing was received” or silently presenting stale currentness.

`components/detail/timeline/merge-timeline.ts:28–65` is a pure visual merger: chronological postedAt sorting, ID tie-break, and classification into email, note, draft and activity. It has no duplicate elimination, source sequence, receipt admission or correction relation. The ID tie-break provides deterministic display order for equal timestamps; it does not prove causal order. Technical retry events cannot become distinct received submissions simply because this renderer can display them.

### 2. Support fetching drains all pages and does not establish stable history pagination

`packages/api/src/admin/support-hub/adapter/supabase.ts:741–759` reads offset pages of 1,000 messages until exhausted, ordered by posted_at descending, then reverses the accumulated list. `763–784` loads attachments for those messages in batches and groups them by message ID.

Useful: tenant/conversation bounds and per-message attachment identity. Unsuitable for Q05: unbounded total drain, timestamp-only database order, and an offset loop that is not a coherent immutable snapshot under concurrent insertions. A client tie-break after fetch cannot recover rows skipped or duplicated at page boundaries. The existing code is not evidence that this race occurred in production; it is not a qualified finite recipient-history query.

`supabase/migrations/20260515025814_support_hub_core_modules.sql:325–343` supplies same-tenant message/attachment association. It does not supply a generic request/item/recipient/predecessor relationship. Filename/hash sorting would not create that relationship.

### 3. Staff audit content is broader than the selected recipient history

`packages/api/src/admin/support-hub/audit.ts:7–25,28–46` writes actor, verb, body and arbitrary metadata, checks the insert error, and can insert paired entries together. Paired markers in one insert are useful; this alone does not make a separately performed source mutation atomic with that audit insert. Its free-form body/metadata must not become the ordinary history serializer.

`supabase/migrations/20260515025814_support_hub_core_modules.sql:476–499` stores those staff audit rows. The same migration's `523–573` applies staff-oriented SELECT/INSERT/UPDATE/DELETE policies and grants to the listed Support tables. This is not an append-only generic participant receipt schema or a recipient read grant. Its audit name alone establishes neither immutability nor allowed external disclosure.

`packages/api/src/admin/contribution-operations/store.ts:460–492` separately inserts a financial operation audit row containing reason, before/after snapshots, provider outcome and downstream effects, then checks the result. Useful explicit error handling, different semantic payload.

`operations.ts:376–398,429–438,578–584` fetches bounded financial audit/correction lists and maps audit reason into staff detail. `viewer-projection.ts:220–297` removes selected provider identifiers for restricted staff but spreads the remaining detail, including existing audit/correction fields. It is a specialized staff projection, not a general external-recipient allowlist. Its current behavior must not be mislabeled a vulnerability merely because Q05 needs fewer fields.

`apps/admin/app/(app)/contributions/correction-approval-panel.tsx:123–135` preserves decided outcomes only in session-local React state. That supports a useful “result does not disappear immediately” experience; it is not durable receipt history across reloads.

### 4. A workflow dispatch ledger is not the source receipt

`supabase/migrations/20260611134500_workflow_dispatch_ledger.sql:7–34` stores handoff state and a unique `(tenant_id,idempotency_key)`; its table comment explicitly keeps product records authoritative. `70–73` enables RLS, revokes anon/authenticated privileges and grants service access.

`packages/api/src/workflows/ledger.ts:112–175` creates or reuses a dispatch row by the tenant/key. It does not compare every supplied workflow/subject/context semantic on reuse. Its callers own the product key contract. This mechanism cannot replace the submission command's exact principal/source/input-digest binding or prove that a received file was durably admitted.

`ledger.ts:184–245` updates only pending/failed outcomes and re-reads a concurrently advanced row instead of downgrading it. Useful monotonic transport-outcome pattern; dispatched, retrying or failed handoff is still not source receipt, acceptance or current-file selection.

`workflows/events.ts:24–91` constrains a routing envelope and rejects sensitive-looking context keys. It is useful signal hygiene, not a recipient-content policy. String length/key checks do not authorize the semantic value under an innocuous key. Q05 signals should carry only the approved opaque invalidation identity/version; the authorized history read supplies the display.

### 5. Donor history demonstrates filtered page/count queries, with important limits

`packages/api/src/reads/donor-history.ts:56–129` applies both donor and tenant filters to the row query and exact count query before range/aggregation. It throws query/count errors instead of returning empty (`93–107`). Those are useful scoping/error patterns.

Limits for Q05:

- It is a donor-donation read, not recipient/request/item/history authorization.
- The two queries run concurrently (`76–91`), not in one guaranteed source revision/snapshot. A count and page can reflect different instants.
- Page order is timestamp-only (`84`) and the helper enforces a minimum but no maximum limit itself (`73–74`). Caller bounds are separate; do not claim none exist elsewhere.
- It has `"use cache"` and minute-level caching (`37–66`). Function arguments include donor/tenant in that framework cache key; absence of those words from the tags is not evidence that the cache pools tenants. But it has no native-request recipient/authority epoch semantics and cannot simply be copied for current metadata permissions.
- `resolveDonorId` binds tenant/profile and rejects a mismatched requested donor (`157–172`), while missing client or lookup failure returns null (`152–165`). That unavailable-versus-no-binding conflation must not make a Q05 outage appear as never-received history.

`packages/database/collections/donor-history.ts:163–176` uses a route-backed collection and returns seed data when `NODE_ENV === "test"`. Tests through that collection are not evidence of live donor or recipient authorization. Do not inherit a fixture path as feature truth.

### 6. Current cache cleanup exists, but is not source-recipient isolation

`packages/auth/client-session.ts:56–82` clears the QueryClient on sign-out or authenticated user switching. `131–188` uses a load version and active flag so a late auth-profile response does not overwrite newer auth state. These are real reusable precedents; there is not a universal absence of client cleanup.

They do not establish request-recipient reassignment handling, same-user tenant/context changes, source restriction invalidation, cancellation of pending history responses, browser back navigation or clearing every TanStack DB collection. Those need explicit path qualification.

Nearby keys are purpose-specific but not a Q05 scope model:

- `packages/database/query-keys.ts:48–55`: Support messages key is admin/support/messages/conversationId.
- `packages/database/collections/donor-history.ts:163–176`: donor history key is donor/history/transactions.
- `apps/admin/features/support-hub/lib/api-client.ts:7–12`: 15-second stale time, five-minute GC, no focus refetch, no automatic retry.
- `packages/database/providers/query-client.ts:73–106`: default 60-second stale time/five-minute GC, no focus refetch, user-shared browser QueryClient; auth/permission status-aware retry.

These are defaults, not authority periods. The future participant projection must scope cache identity to its current principal/tenant/request/item/purpose/authorization context and applicable source revision; authorization remains server-owned. Browser cache invalidation must not be the only guard against opening a stale current file.

### 7. Identity helper does not already implement the new participant grant

`packages/auth/context.ts:249–301` verifies the user, loads their profile under caller authority, resolves tenant/memberships and returns trusted context. Useful server identity provenance. It is not the new Q01 request-recipient authority model: missing-profile behavior and membership semantics cannot be “fixed” by adding donor/staff membership merely to render history.

Historical actor and current viewer are distinct. An immutable receipt records the actor/request-recipient binding admitted at the time. Today's recipient assignment, same email, a Party merge or display-name change cannot automatically rewrite that actor or transfer their history. A UI saying “You sent…” needs a source-authorized actor comparison, not “the current recipient is viewing this row.”

## Database and source-event boundary

The native generic receipt/correction/history schema has not been found or qualified. Q05 should project the durable source facts already required by Q03, not introduce a competing history authority.

The minimum invariants to preserve are:

1. Source admission commits the received fact, exact request/item/member/recipient binding, byte identity, correction predecessor/successor relation, relevant review-set change and required durable history/effect intent together. An optional history read model must be reconstructable from those authoritative facts.
2. One semantic admission has one durable identity across transport retries and expired retry keys. Repeated delivery of its signal does not create another File received event. A genuinely new correction remains a distinct admitted act even when bytes or filename match.
3. Exact same-source references and transition rules protect tenant, request, item, member, predecessor and admission actor. A tenant-only FK is not enough to protect the wrong item or wrong recipient within that tenant. Browser authority fields cannot select a different admitted actor.
4. The source's prior receipt and decision facts are immutable. Correction of a recorded mistake uses a source-owned appended correction, not silently rewriting a received time/actor or removing old evidence so the UI looks tidy.
5. Current file membership is a source projection over the exact evidence set. It is not recomputed from display ordering, last event arrival, filenames or a global maximum version. History records past facts without deciding present acceptance.
6. New source writes cannot depend on successfully repainting an optional history projection. A committed correction followed by projection/notification failure remains committed, with safe recovery and no instruction to submit a duplicate.

Existing migrations are useful structural precedents, not ready Q05 protection. Financial audit references are checked by triggers (`20260526132000_contribution_operations_core.sql:260–271`); later replacements extend checks (`20260611150000_contribution_approval_notifications.sql:335–389`). Do not judge scope from an initial FK in isolation. Conversely, a later same-tenant reference check does not by itself enforce immutable prior values or the proposed recipient correction lineage.

Production policies were not queried. Implementation proof must cover effective grants, composed permissive/restrictive policies, views/RPCs, trigger functions, service/worker paths, tenant/reference changes and both old/new rows. Omitted WITH CHECK can inherit USING; SECURITY DEFINER behavior depends on function/table owner and RLS configuration. This review reports no issue solely from either keyword.

## Minimal permanent read path

Use the existing source command/identity/PDP/custody owners. Add one source-qualified participant history projection, with no new global event store, workflow engine, personal archive or permission system.

Resolve the authenticated current participant and exact request/item scope first. Apply current source/classification/purpose/recipient rules to the source facts and permitted fields **before** row existence, count, pagination or serialization. The response should contain only approved event kinds and minimal typed display data, with exact safe linkage to the current member where allowed. Do not return raw file URLs, old-byte links, staff notes, provider IDs, complete actor profiles or arbitrary audit JSON.

Use source-backed admission identity and causal correction relationships. Display ordering may use source occurrence time with a stable tie-break, but technical delivery time cannot assert causality. The system can display a late-arriving admitted fact in its correct source position without announcing another receipt or changing current membership.

Return coherent current-file state and historical facts for a compatible source revision, or explicitly mark/read-recover a stale projection. Independent queries are not automatically coherent because they use the same request ID. If a historical page's permission scope/revision no longer applies, invalidate/restart under current authority without leaking old counts or silently merging it into a different request.

Keep the current rows/actions outside the optional history disclosure. Under A, superseded entries have no ordinary View/Download, direct URL, thumbnail/body, keyboard-hidden link or lazy-load route. Existing source-specific older-evidence access remains separately governed; a help route is not authorization to email/raw-link the old file.

## Material risks and required remedies

Likelihood is prospective exposure when implementing the chosen feature; it is not a measured incident rate. High denotes material privacy/integrity/authority impact; Medium denotes substantial usability/reliability cost.

| Risk / nearest evidence                                                                         | Impact / likelihood                         | Required remedy                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Raw staff timeline with browser private filter (`use-support-messages:50–55`)                   | High / likely if reused blindly             | Explicit server allowlist projection; current row/field authority before response/cache; no hidden recipient staff data.                                                                |
| Count/hasMore/cursor reveals suppressed facts                                                   | High / plausible                            | Count and pagination over the authorized projection only; opaque scope-bound cursor, no hidden-row totals or sequence gaps presented as receipt counts.                                 |
| Empty history after query/auth failure (`ConversationTimeline:27–35`; `resolveDonorId:152–165`) | Medium–high / demonstrated adjacent pattern | Distinct loading, successful authorized empty, unavailable and revoked states. Never claim nothing was received because a query failed.                                                 |
| Retry or late callback appears as another receipt                                               | High / plausible                            | Durable semantic event identity and source-revision dedupe; transport attempts remain technical evidence; recover committed results under current permission.                           |
| Chronological order replaces evidence-set lineage                                               | High / plausible                            | Exact corrected-member relation; preserve unrelated supporting files/current membership; no latest-file or last-callback-wins selection.                                                |
| Stale page revives superseded current-file actions                                              | High / plausible                            | Coherent current state, stale-response fencing and server reauthorization of Q02/Q04 actions; no ordinary historical content via old URL/cache.                                         |
| A failed successor restores the predecessor                                                     | High / plausible                            | Preserve Q03 admission fence/no-silent-revival; history describes the earlier act without making it actionable/current again.                                                           |
| Recipient reassignment labels previous actor as “You”                                           | High / plausible                            | Separate immutable admission attribution from current viewer; source-qualified identity/authority lineage; no mailbox/Party/name equality shortcut.                                     |
| Separate audit insert/read-model update is mistaken for source atomicity                        | High / plausible                            | Durable source fact and required intent in the admitted transaction; derive/rebuild optional projection without inventing receipt. Audit helper success alone is insufficient.          |
| Offset drain/timestamp-only order loses/duplicates history under writes (`adapter:741–759`)     | Medium–high / plausible                     | Bounded deterministic pagination with declared concurrent-update semantics; exact event IDs and consistent source cursor/revision; no full-drain requirement for a small disclosure.    |
| Permission/recipient changes leave cached metadata visible                                      | High / plausible                            | Correct scope keys, auth/source invalidation, cancellation/version fences, safe back-navigation and no offline persistence; existing user-switch cleanup is necessary but insufficient. |
| Current-source renamed fields rewrite historical meaning                                        | Medium–high / plausible                     | Preserve exact admitted request/item/receipt meaning; display current safe labels only with truthful context, never reinterpret the prior receipt under today's definition.             |
| User-supplied filename/reason becomes history HTML or sensitive telemetry                       | High / plausible                            | Safe source-approved minimal display values; plain text/escaping and controlled event labels; no raw audit/provider diagnostics/URLs/bodies in ordinary logs.                           |
| “No older-file actions” is mistaken for purging older files                                     | High / plausible                            | Custody/hold/disposal stays source-owned; A restricts ordinary display/action, not evidence preservation or other source uses.                                                          |

## Currentness and asynchronous behavior cases

- **Correction committed; history reload fails:** keep truthful committed receipt, show that history/status could not refresh, and recover the same result. Do not invite another correction as if nothing arrived. Do not label cached predecessor actions current.
- **Current files load at revision N; history loads at N+1:** do not produce a combined state that claims the predecessor is current while showing its replacement. Reconcile a compatible view or display safe updating state. No speculative optimistic acceptance.
- **Two corrections race:** the owning source decides allowed successor/admission under Q03. History records admitted outcomes once; the UI cannot pick the last HTTP response or repair an ambiguous branch by choosing newest time.
- **Identical filenames and multiple supporting files:** event identity and exact corrected member determine relations. An untouched earlier file remains current where the source says so. A history fold cannot hide every older upload.
- **Late inspection/render/notification result:** it updates only its exact technical subject as allowed. It cannot emit a new received act, rename a different file, change current review candidacy or undo restriction.
- **Recipient/context changes during read:** the new scope must not consume the old response/cache page. Deny/clear the old projection and re-resolve; “same user logged in” is insufficient proof of the same request authority.
- **Permission changes between pages:** cursor carries scope/revision identity as an integrity selector, never authority. Reauthorize every page/count. Do not let an old cursor reach a hidden actor or private event.
- **No permitted historical rows:** a successful empty authorized projection may say “No submission history to show.” It cannot assert the organization never received anything if source policy suppresses historical facts.
- **Retained but restricted/deleted bytes:** a safe receipt fact may remain when policy permits; its label must not promise byte availability. Conversely, a retained original does not require showing its receipt metadata to this viewer.
- **Browser closes after receipt:** submission/worker semantics remain Q01–Q03. Closing a tab is not rollback, while re-opening still requires current source authority. The timeline is not the authority clock.

## UI scope and semantics

Current files, checks, review status and required next action remain primary. A compact Submission history disclosure can show typed facts such as File received and Correction received with permitted localizable time/context. It should not force scrolling through a transaction feed or open a file manager. Preserve focus when new facts arrive; announce a concise relevant state change rather than replaying the entire list.

Source occurrence time, durable receipt time, technical callback/record time and presentation timezone must not be conflated. Do not infer timeliness, acceptance or deadline extension from a formatted timestamp. Stable ordering and a useful absolute date/time must survive equal timestamps, delayed processing and timezone changes.

The earlier filename, actor or count can be withheld while still showing a permitted generic correction receipt. Source-approved redaction must not imply that immutable evidence was erased. There must be no hidden older-file action in a row's title, menu, hover preview or stale deep link. Do not imply current-file read is proof of review/acceptance.

An explicit help path may be useful when older content is genuinely needed, but staff still use the source's independently authorized delivery/review path. It is not a mandate for per-file staff unlock of Q04's ordinary current downloads.

No new timeline package, infinite live feed, export ZIP, comparison viewer, Restore, batch download or configurable permission-builder is needed. Reuse shared Base UI disclosure/list/status primitives and source projection patterns. Component reuse does not qualify the end-to-end recipient experience.

## Bounded testing actually performed

Executed three **existing** unit files, **23 tests passed**, Vitest **5.0.3**, reported duration **1.97 seconds**:

1. `tests/unit/packages/api/reads/donor-history.test.ts` — seven tests with mocked Supabase queries and Next cache functions: page result shape, error propagation, and donor/profile-selector behavior.
2. `tests/unit/apps/admin/features/support-hub/timeline-merge.test.ts` — six pure fixture tests: classification, chronological sorting and day grouping. They deliberately include staff notes/drafts/activity; no authorization, duplicate replay, tie pagination or browser test.
3. `tests/unit/packages/api/admin/contribution-viewer-projection.test.ts` — ten pure specialized staff-view projection tests: provider identifier redaction, operation capabilities and unchanged revision fingerprint. Not a generic recipient history serializer or actual RLS execution.

Command isolation reused the established credential-free pattern: `env -i`, synthetic test URL/anon key, Node24.21.0, read-only `bwrap --ro-bind / /`, network namespace disabled, memory-backed `/tmp`/Vite temp, `.env.local` masked by `/dev/null`, Vitest `--no-cache --no-file-parallelism --reporter=dot`. The existing Vite future-native-loader advisory remained informational.

The donor test builder records `.eq` calls but returns fixture results rather than enforcing SQL; tests are not proof of row isolation. Neither the client-history seed path nor visual merge test establishes receipt persistence, current source authority, safe pagination, deployed cache behavior or browser accessibility. No prior Q01–Q04 suite was rerun or added to this count.

## Future proof needed before enabling the selected profile

| Proof area                    | Falsifiable cases                                                                                                                                                                                                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source receipt durability     | Fail before admission; fail after commit/lost response; source-history projection unavailable; outbox retry; same key/different input; key expiry. Exactly one durable received fact per admitted act, no receipt for incomplete transfer, no duplicate instruction after commit. |
| Scope and metadata            | Wrong tenant/principal/request/item/member; reassigned recipient; same mailbox; Party merge; same filename/hash; restricted actor or historical name. No unauthorized row, field, count, cursor or timing/diagnostic disclosure.                                                  |
| Lineage/current members       | Correct one of several supporting files; repeated same-name corrections; failed successor; duplicate/late results; concurrent correction/acceptance. Untouched siblings remain current; no silent revival or newest-time replacement.                                             |
| Projection coherence          | Different current/history fetch revisions, stale background response, auth/context switch, reconnect, browser back, source restriction between pages. No stale view/action becomes authority or silently joins a different scope.                                                 |
| Pagination and limits         | Equal timestamps, insertions during page traversal, hidden rows, repeated cursor, invalid scope cursor, maximum history and one-unit over page/work budget. No skipped/duplicate semantic receipt, leakage or unbounded scan under the declared model.                            |
| Failure versus empty          | DB/count/permission resolver failure, missing source row, genuinely empty authorized history, revoked access, incomplete projection. Correct safe state; no fabricated “nothing received,” false currentness or misleading full-history claim.                                    |
| Current-file-only enforcement | Old title/menu/hover/deep link, previous preview/blob URL, stale conditional/range request, speculative prefetch. Q02/Q04 gates reject superseded new reads; no ordinary historical content route under A.                                                                        |
| SQL and privileged paths      | Effective role grants/policies, service role, allowed worker, views/RPCs, old/new authority/reference fields and mixed-version readers. Same source contract on every path; no client actor forgery or raw audit table fallback.                                                  |
| Protected history semantics   | Source definition/name changes, corrected mistaken receipt, withheld old metadata, source retention/hold/disposal. Immutable facts remain truthful; projection limits do not delete custody or expose staff data.                                                                 |
| UI and delivery signals       | Actual keyboard/AT/touch/mobile history discovery, long/RTL names, timezone/equal times, loading/stale/error, new event while focused. Current status remains prominent, no whole-list announcement/focus theft, no hidden past-file action.                                      |
| Bounded operation             | Measured finite page/metadata/cursor/work/cache/rate limits and recovery load under supported source workloads; permission projection before aggregation; targeted indexes and no per-row policy/network explosion.                                                               |

No new numeric limit is chosen here. Existing qualified budgets apply where available; missing bounds must be supplied and measured for the activated source profile. The Support 1,000-row fetch size, financial 50-row staff list and cache TTLs are implementation observations, not proposed native history policy.

## Evidence limits and handoff

This review found concrete reusable mechanics and unsuitable adjacent patterns, plus 23 passing bounded seam tests. It did not exercise a native recipient history API/UI, real database roles, deployed cache/current-recipient transitions, browser/assistive technology, actual source concurrency or private metadata. No generic feature is reported working.

The smallest permanent path is the existing Q03 source-owned durable receipt/correction facts, one current-authorized participant projection, shared current-file read controls and a compact truthful history UI. Counts and caches belong to that governed projection; audit/logs and workflow delivery do not become business truth. Implementation and activation remain future, separately authorized work.
