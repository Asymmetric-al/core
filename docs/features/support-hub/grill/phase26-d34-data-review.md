# D34 — Independent realtime, source and authorization review

**13 September 2026. A — Composing-only awareness — is selected. Detailed amendments remain proposed; D1–D33 are ratified.**

**Disposition: Accept with required amendments.** The smallest safe architecture is a bounded server-owned ephemeral reader/composer lease, private server-originated **refresh hints**, and an authenticated HTTP snapshot that resolves current source permissions and colleague identity. Supabase can carry the hints; neither Presence payloads nor cached channel authorization should carry authority to display identities or source activity. A hint is expendable, so missed delivery is recovered by bounded visible-reader refresh and expiry rather than a new durable workflow.

The user asks for accuracy and minimal lag. Specify and measure latency/staleness bounds; do not promise literal live typing, zero lag, exactly-once delivery or perfect awareness of disconnected clients. The cue remains an authenticated, expiring report of recent composition activity, never permission to send or a reservation.

Verified WSL cwd `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10` and HEAD `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Read the applicable Core/API/database/Supabase/backend/data-boundary and Next/Supabase guidance, current primary documentation through Supabase MCP and web, and actual installed/current source. Root owns fresh remote/PR checks. No database, realtime channel, provider, production session, environment file, secret, migration, install or product mutation was used. This reviewer ran source inspections only; another independent review's bounded SDK probes are not represented as production proof.

## Chosen architecture and strongest alternatives

| Architecture                                                              | Useful properties                                                                                             | Material weakness                                                                                                                                                                                                                   | Decision                                                                                                                     |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Direct browser Presence on conversation topic                             | Small API; built-in state reconciliation.                                                                     | Payload/name/key are client supplied; cached join permissions do not reauthorize every message. Topic membership alone cannot handle current source/merged-context privacy.                                                         | **Reject as authority.** Do not publish raw browser Presence as named teammate evidence.                                     |
| Server-validated identity/state broadcast to a shared conversation room   | Server can authenticate publisher and reduce payload.                                                         | A previously authorized subscriber can retain cached receive permission after source access changes; even activity/count timing is information. Requires stronger recipient gating and still duplicates snapshot/currentness logic. | **Reject the shared-room shortcut.** Private alone is insufficient.                                                          |
| Server leases with direct Postgres Changes                                | Current database row policies can participate in change delivery; single data store.                          | Docs identify per-change authorization cost, single-thread ordering limits and special DELETE/RLS limitations. Publishing raw technical rows risks exposing observer metadata and creates unnecessary client-table authority.       | **Do not choose for this feature's client transport.** Keep technical rows off client publications.                          |
| Server leases + private per-observer refresh hint + current HTTP snapshot | Trusted actor, current source/identity projection, finite state, explicit reconciliation; uses current stack. | Costs a snapshot round trip and bounded recipient selection. Hint dispatch still needs current recipient authorization; it is not free or O(1).                                                                                     | **Recommend.** Simple enough for one advisory feature, without a new socket host, generic presence platform or event ledger. |
| New Vercel WebSocket coordinator with external shared state               | Current Vercel docs support it; possible to gate messages in a custom server.                                 | Adds connection ownership/reconnect/state-distribution infrastructure alongside the existing Supabase stack.                                                                                                                        | **Not justified here.** Reject on scope/cost grounds, not the outdated claim that Vercel cannot host WebSockets.             |

## Permanent data and transport shape

Use **one regular Core application-schema technical session record** for each server-issued active reader instance/epoch, with distinct observer and composing deadlines. This is a logical model, not an instruction to create a named table during grooming. It is not a public “who is viewing” record, Support Activity, notification recipient, Follow or permanent history.

| Field/fact                                               | Meaning and authority                                                                                                                                                                        |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tenant, authenticated profile, real auth-session binding | Derived by the existing identity owner from verified current context; never accepted as caller attribution or inferred from email/agent display data.                                        |
| Reader instance/epoch                                    | Server-issued opaque identity for the exact tab/current qualified source context. Unknown/expired/closed identities are not upsert-created by state updates.                                 |
| Source/context reference and version                     | Exact Support original-source/target affinity and applicable current topology/CRM source basis; a continuing root ID alone is insufficient.                                                  |
| Private observer topic/handle                            | Server-issued opaque per-instance namespace, bound to the real auth identity/session and active epoch; never a user-selected shared room or source-bearing public topic.                     |
| Last accepted sequence/control window                    | Orders all Activity/Renew/Idle/Stop/Close messages for this instance; carries a fixed server-issued freshness window so delayed reports cannot be renewed retroactively.                     |
| Observer expiry                                          | Short-lived technical interest needed only to route refresh hints. It is not user-visible viewing state or permission to keep receiving after revocation.                                    |
| Last qualified activity frontier                         | Last accepted fresh composition-input report; distinct from reading/heartbeat, focus, text selection, draft restoration and keepalive. It remains a self-report, not keystroke verification. |
| Composing expiry/state                                   | Finite result of current activity/liveness/context checks; no draft text, subject, recipients, attachment metadata or Reply-versus-Note content is broadcast.                                |
| Cleanup deadline                                         | Finite technical cleanup under the shared owner, not a conversation-content retention period. Closed/expired identifiers never revive after cleanup.                                         |

**Regular logged rows are the least surprising default.** Unlogged rows can be lost on crash and do not provide the same standby behavior; that is an optional measured optimization, not needed for a short-lived metadata table. Ordinary rows still require indexed TTL cleanup and no history export. The design must not retain a sequence of staff visits or typing activity. WAL/backups follow the platform's actual protected retention/restore contract; a short row TTL is not a promise that every backup copy disappears at that instant.

The snapshot service, not the hint, returns the currently authorized deduplicated colleagues and display metadata. Identity comes from the qualified internal staff presentation owner, not a current email signature, CRM contact, requester or arbitrary browser payload. Only currently eligible source/activity contributions count; the same profile's multiple tabs yield one visible colleague. Stopping one tab cannot clear another still-valid composing instance.

### End-to-end flow

1. A genuinely mounted, visible, eligible reader registers a technical instance through `packages/api`. SSR, route prefetch, background pages and opening a file preview do not publish composing. Verify current tenant/profile/session, exact source basis and narrow reader authority.
2. The browser subscribes to its exact private observer topic using the qualified shared Supabase client lifecycle. Client publish/Presence authority is denied for these topics. The topic carries only a fixed opaque refresh event; no actor, count, source ID, name, content or change reason.
3. Real user composition produces a leading Activity update. Keepalive is a distinct report; neither focus alone nor a nonempty restored draft counts. All reports share ordered instance sequence and the fixed server-issued freshness window. The server derives actor/scope/time, validates current source authority, updates the row atomically and rejects stale/expired/terminal reports.
4. A change that can affect displayed composition selects only bounded, live, currently eligible observers in the same qualified context. **Reauthorize each recipient/source basis before hint dispatch.** Do not broadcast first and expect the browser to filter. An opaque event still reveals activity timing, so stale shared subscriptions cannot be ignored as harmless.
5. Send a bounded awaited REST Broadcast using the installed qualified API; no server-side subscription is required. A send acknowledgement is not proof any reader received or displayed a cue. Catch timeout/rejection; do not roll back an already accepted lease or start a durable retry backlog for the hint.
6. A hint coalesces one authenticated snapshot refresh. The snapshot rechecks observer/session/source/identity and publisher eligibility, computes current composing state from trusted time and returns only permitted data with server as-of and absolute expiries. Duplicates/reordering are harmless; only current matching instance/context responses may update the UI.
7. Periodic visible-reader refresh repairs lost hints and requalifies observer/source state. Local cue expiry and unknown/degraded state prevent stale names appearing indefinitely. Stop/send/cancel/leave/hide initiates prompt best-effort state removal; authoritative expiry remains the fallback.

No durable outbox, P6 event, workflow invocation, business audit entry or email is needed for a refresh hint. Lease mutation must be atomic, but the lossy hint is not a required durable secondary business effect. Reconciliation through the snapshot makes that deliberate tradeoff complete rather than silently dropping consequential work.

## Timing and precision

The root/UX proposal is a reasonable **initial product contract subject to real measurement**:

| Dimension                                  | Proposed initial behavior                                                                                                                                                                |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Leading composition input / explicit stop  | Send promptly on the qualifying transition; no per-keystroke broadcast or trailing debounce that hides the entire start.                                                                 |
| Active composing renewal                   | At most one ordinary renewal each5seconds, with coalescing of intervening input.                                                                                                         |
| Composing liveness lease                   | At most15seconds from accepted renewal, shortened by idle/session/source fences.                                                                                                         |
| Composition idle                           | 30seconds without a qualifying activity frontier ends composition. Keepalive does not restart this clock.                                                                                |
| Reader-only heartbeat + snapshot           | 10seconds while visible/eligible; finite observer lease around30seconds.                                                                                                                 |
| Active reader/composer traffic             | Prefer one combined control/snapshot request: a5second composing renewal also renews observer interest, suppressing the redundant10second request.                                       |
| Healthy active-connected start/stop target | p95≤1second from qualifying browser transition to another authorized reader displaying/removing the cue, measured end to end. It is not a current result or universal network guarantee. |

Use `composing_expires_at = min(accepted_server_now +15s, last_qualified_input +30s, observer/session deadline, current source fences)` or an equivalent exact bound. A renew request can extend liveness only while the instance/episode remains eligible; it does not update last-input time. An observer heartbeat alone never starts composing.

**Delayed-command freshness needs more than a counter.** Example: an old keepalive arrives just before expiry and extends the observer row; a newer-sequence but also old Start then arrives and appears fresh if its timestamp is simply server receipt time. Bind every report to a server-issued control window with a fixed not-after that later renewal cannot extend for that already-issued report, or an equivalent guarded generation. This is one bounded ephemeral control contract, not a durable operation ledger. Expired reports are discarded; offline input is not replayed into a new composing claim. A fresh registration/report follows only current visible context and qualifying recent user activity, not an old queued body.

All Activity/Renew/Idle/Stop/Close operations share monotonic sequence for the instance. Replayed/lower sequence cannot alter state or extend expiry. Stop for a closed episode wins against older Start/Renew; terminal reader epochs do not reopen. A new valid episode/reader has a fresh server identity. After physical cleanup, an old unknown ID is still rejected rather than recreated.

**Snapshot age is not reset on receipt.** Return trusted server as-of and absolute composing expiry. Use a monotonic request/response age bound when presenting the response; a delayed snapshot or changed browser clock cannot grant another15seconds. If clock/transport age cannot be bounded, show awareness unavailable. End-to-end staleness includes report transit, server processing, hint delivery, snapshot round trip and rendering; document measured distributions instead of only timing the websocket hop.

## Current-source and primary technical evidence

| ID  | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                      | Verified fact / consequence                                                                                                                                                                                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S01 | [Lockfile realtime/SSR/client pins, lines1577–1583](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/bun.lock#L1577), [database manifest](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/database/package.json#L81)                                                                                                                          | Current lock has supabase-js/realtime-js2.103.0 and SSR0.8.0; manifest ranges are not exact installed versions. Next is16.3.0-preview.9.                                                                                                       |
| S02 | Installed `RealtimeChannel.ts`, lines393–404                                                                                                                                                                                                                                                                                                                                                                                  | `track(payload)` forwards the supplied dictionary as Presence payload. It does not turn a claimed user/name/key into verified actor identity. This is SDK source inspection, not a live service exploit test.                                  |
| S03 | Installed same file, lines733–782                                                                                                                                                                                                                                                                                                                                                                                             | `httpSend` explicitly sends REST Broadcast; only HTTP202 resolves success in this installed build, while non202 rejects. Catching only a returned success flag would miss rejection. The acknowledgement is not recipient display proof.       |
| S04 | [Browser Supabase wrapper, lines1–13](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/database/supabase/client.ts#L1), [client auth lifecycle, lines149–183](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/auth/client-session.ts#L149)                                                                                           | Existing shared client/auth-state versioning is reusable; it is not a complete per-feature subscription ownership, source revalidation or composing protocol.                                                                                  |
| S05 | [Auth context shape, lines42–61](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/auth/context.ts#L42), [actual resolution, lines250–305](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/auth/context.ts#L250)                                                                                                                      | Actual user/profile/tenant/membership are resolved, but this returned shape does not expose a real auth-session ID. Qualify the narrow identity-owner session binding; do not accept caller session IDs or manufacture one from profile/email. |
| S06 | [Support access helper, lines31–86](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/route-helpers.ts#L31)                                                                                                                                                                                                                                              | Current broad staff gating and agent ID/email fallback do not establish exact activity publisher, source access, current reader basis or private fanout audience.                                                                              |
| S07 | [Shared collection realtime, lines51–89](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/database/collections/supabase-collection.ts#L51)                                                                                                                                                                                                                                        | Database-change configuration exists; it is not a presence or server-authoritative activity implementation. No raw session-row publication is required.                                                                                        |
| S08 | [Current composer, lines66–105](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/composer/use-conversation-composer.ts#L66), [send call, lines192–205](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/composer/use-conversation-composer.ts#L192) | Local private mode state and existing send code are not actual composing-lifecycle or reviewed-version collision proof. D1/D4 safeguards remain separately required.                                                                           |
| S09 | [Runtime map, lines5–13](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/guides/architecture/runtime-map.md#L5), [admin Next config](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/next.config.ts#L23)                                                                                                                              | Core uses Cache Components and disallows route-segment runtime/dynamic/region/duration/cache exports. Use its actual handler/deployment boundaries; do not copy obsolete Next route snippets.                                                  |
| S10 | [Local Supabase config, lines7–18 and27–34](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/config.toml#L7)                                                                                                                                                                                                                                                                      | Local API exposes public/graphql_public, max_rows1000 and PG17. This is local source, not live provider settings, region, realtime capacity or current deployed grants.                                                                        |
| S11 | [D1/D4 collision](phase26-d4-adversarial-review.md), [D2 private drafts](phase26-d2-adversarial-review.md), [D6](phase26-d6-adversarial-review.md), [D7](phase26-d7-adversarial-review.md), [D15](phase26-d15-adversarial-review.md)                                                                                                                                                                                          | Cue is advisory; no assignment, coverage, Follow, read-surveillance roster, draft sharing or notification meaning. D9/D10/D26 current source/CRM topology still governs disclosure.                                                            |

Installed SDK source path is `node_modules/.bun/@supabase+realtime-js@2.103.0/node_modules/@supabase/realtime-js/src/RealtimeChannel.ts`; SHA256 `54b436f8fdacfce2469c78756c2b66345913f3d4ac442e7abcaa38d6e66d5858`. The file is installed dependency evidence, not a separately committed Core source file. No module was connected to a provider.

The current [Supabase Presence documentation](https://supabase.com/docs/guides/realtime/presence) confirms client-provided small state, warns against high-frequency updates and distinguishes reconciliation events from actual movement. [Realtime Authorization](https://supabase.com/docs/guides/realtime/authorization) explicitly says access policies are cached for the connection and refreshed on join/new JWT, not queried for every message. That is the reason for current application-recipient gates and snapshots; merely setting `private:true` does not solve source revocation.

[Supabase Broadcast](https://supabase.com/docs/guides/realtime/broadcast) supports client, REST and database delivery. [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes) documents per-change authorization work, single-thread ordering and DELETE/RLS limitations. Do not publish ephemeral technical rows or remove RLS to improve throughput. The feature needs safe current projections, not blanket database subscriptions.

[Current Vercel WebSocket guidance](https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections) says Functions natively support WebSockets, with connections pinned for their maximum duration and later connections not guaranteed to hit the same Function. [Function limits](https://vercel.com/docs/functions/limitations) remain runtime/plan dependent. A new coordinator is possible but unnecessary here; choose ordinary authenticated Next handlers plus Supabase hints for reuse and smaller operational scope. No current Vercel plan/region/limits were inspected in production.

Current Supabase `search_docs` was used for Authorization/Broadcast/Presence/Postgres Changes. The changelog/source guidance also prevents adding custom tables/functions into the managed `realtime` schema; application lease rows belong to Core's own schema, while qualified policies on `realtime.messages` are supported. Existing RLS/grants must be examined together; PostgreSQL can reuse USING as WITH CHECK, so missing explicit syntax is not automatically a vulnerability. [PostgreSQL17 policy reference](https://www.postgresql.org/docs/17/sql-createpolicy.html).

## Material concerns, exact amendments and proof

### DC01 — Authenticate the publisher, not its payload

**Severity High; likelihood plausible with direct client Presence.** A caller can claim another name/profile/session and mislead colleagues. Current legacy agent matching and SDK payload forwarding do not prove identity.

**Required clause:** “Server controls derive publisher tenant/profile/auth-session and current allowed source context. Clients report only a closed activity intent for their issued instance; claimed names, actor IDs, timestamps, role, source ownership and private fields are rejected. Internal staff display identity is resolved through its authorized owner. No client Presence/Broadcast publish grant exists for the awareness topics.”

**Proof:** forged actor/key/session/topic/name, different tenant, same-email person and stale membership cannot produce a named cue. Inspect browser traffic to verify no draft material is sent.

### DC02 — Private cached channels are not current source authorization

**Severity High; likelihood plausible after ordinary permission/topology changes.** A stale room subscriber can receive identities/counts or even activity timing after losing access.

**Required clause:** “Use opaque per-instance private receive topics with no identity/source/count payload. Reauthorize current recipient and publisher source/context at fanout and at every snapshot; cached join policy never substitutes for these checks. Stop revoked observer interest. A valid pre-revocation in-flight hint is not a grant to read a later snapshot. No room-wide hint leaks current activity to an obsolete audience.”

**Proof:** revoke while WebSocket remains connected, role removal without token refresh, source move/merge/Undo and stale JWT; verify no newly authorized-after-revocation fanout, and snapshots deny. Test active existing subscriptions, not only failed new joins.

### DC03 — Bind composing to the actual source affinity

**Severity High; likelihood plausible in merged and CRM-anchored contexts.** A reader who sees originalA could otherwise learn that a colleague is writing against inaccessible originalB in the same continuing work component.

**Required clause:** “The server-issued context binds the actual permitted original source/target affinity and relevant topology/restriction generation. A root ID, shared inbox or CRM link is not sufficient. Emit a cue only through current qualified intersecting source contexts; context change invalidates the old epoch and must not transfer private activity to a wider audience.”

**Proof:** two original sources with different rights, selected reply target change, new internal-note source, CRM-only source basis, move/merge/Undo and access loss. No actor/count or branch-existence leak.

### DC04 — Technical observer state must not become a viewing roster

**Severity Medium; likelihood high if raw rows reach clients.** The fanout registry necessarily knows current technical interest; publishing/exporting it would silently add the rejected passive-viewing feature.

**Required clause:** “Observer registration exists only for bounded current delivery and is never user-visible viewing state, history, read receipt, last-seen record or staff report. Do not publish lease rows, list observers, emit join/leave Activities or retain visit histories. Only authorized composing snapshots expose the selected minimum.”

**Proof:** UI/API/Realtime/raw-table/export/log inspection finds no passive viewer list or per-visit history. Pure reading changes no Follow/work/notification state.

### DC05 — Idle, liveness and source expiry are independent

**Severity Medium; likelihood common with pauses/background tabs.** A focused page can renew forever if keepalive resets activity, or a lost Stop can leave a permanent cue.

**Required clause:** “Keep observer interest, latest qualified composition input and composing liveness separate. Renew never manufactures fresh input; enforce the minimum of liveness, idle, session and source deadlines. Stop/send/cancel/leave/hide clears composition promptly where transport succeeds; hard expiry handles lost signals. Reconnect/restored draft/focus/selection alone does not publish composing.”

**Proof:** typing then thinking, idle beyond30seconds, hidden/suspended/mobile tab, network loss, Stop lost, one profile with several tabs, and one-tab Stop while another remains active.

### DC06 — Sequence plus fixed report freshness prevents resurrection

**Severity Medium; likelihood plausible under delayed/reordered requests.** A late Start or Renew can arrive after Stop/idle, and a delayed keepalive can make another old report appear fresh.

**Required clause:** “One monotonic sequence orders the instance's controls. Bind reports to a fixed server-issued control-window expiry that cannot be extended for already-issued reports. Lower/replayed sequence cannot mutate or renew; terminal/expired/unknown epochs cannot upsert. New valid reader/activity uses a fresh qualified epoch/report. Never replay offline activity into a later session.”

**Proof:** Stop-before-Start network order; latest Idle before old Renew; duplicate update; expired row and later callback; cleanup then stale update; delayed keepalive followed by old Start after original freshness window; new current activity still works without recalling a stale epoch.

### DC07 — A response must not extend cue freshness on arrival

**Severity Medium; likelihood plausible on slow/mobile networks.** Starting a15second browser timer when an old snapshot arrives overstates reality.

**Required clause:** “Snapshots include trusted as-of and absolute expiries, exact instance/context and current state version. Account conservatively for monotonic request/response age; reject late context responses. Expiry locally clears or makes awareness unavailable without requiring another successful request. Browser wall-clock changes cannot extend a cue.”

**Proof:** response delayed longer than lease, clock moved forwards/backwards, response from old tenant/context, overlapping refreshes, websocket hint preceding/following an old HTTP result and return from bfcache.

### DC08 — Lossy hints need explicit reconciliation, not fake durability

**Severity Medium; likelihood routine.** A committed lease can be followed by a failed broadcast; UI may roll back good state, spam retries or assume202 means displayed.

**Required clause:** “Lease transition and its own sequence/deadline commit atomically. Await bounded hint dispatch, classify rejection/timeout and reconcile via snapshot/expiry without rolling back the lease. Hint loss creates no durable backlog, email or workflow. Coalesce duplicate hints and permit safe current HTTP refresh independently of realtime availability.”

**Proof:** after-write dispatch failure, HTTP202 with no subscriber, dropped/duplicate/out-of-order hint, function termination, snapshot failure, reconnect and overload. Ordinary reading/composing/send safety remains available.

### DC09 — SQL, grants and service paths must preserve the closed model

**Severity High; likelihood possible through a privileged/direct path.** Raw DML can forge identities, extend leases or expose observers; ordinary RLS does not protect service-role writes.

**Required clause:** “Use a regular app-schema technical record with non-null immutable trusted scope/epoch, same-tenant source/member integrity, finite valid deadlines, bounded sequence/revision and unique live instance identity. Direct client table writes/reads and raw-row Realtime publication are revoked. Closed commands alone mutate; check actual grants, effective USING/WITH CHECK, function execution/search_path and all privileged paths. Do not create custom managed-realtime objects or treat a public topic as safe.”

**Proof:** actual authenticated/anon/service tests reject scope retarget, spoofed epoch/sequence/deadline and arbitrary state. Source IDs follow actual Core types, not a UUID assumption for current text Support IDs. Cleanup cannot delete business history; unknown expired IDs cannot recreate state.

### DC10 — Shared client and Next lifecycle need narrow ownership

**Severity Medium; likelihood plausible with shared clients/remounts.** One component can disconnect all application channels or duplicate listeners; prefetch can create passive activity; a stale route can repopulate another tenant.

**Required clause:** “Reuse the qualified browser client but own/refcount exact feature subscriptions and listener cleanup. Do not remove all channels or globally disconnect on one reader's exit. Use new opaque topic generations when private context changes. Register only current visible client readers, not server render/prefetch, and partition caches/responses by tenant/profile/auth-session/instance/context. Private snapshots use no-store current request handling, not shared cache state.”

**Proof:** React remount/Strict Mode, two readers, unrelated realtime feature, same-topic reuse, account switch, token refresh, route prefetch, hidden tab and partial cleanup failure. Existing Core Cache Components/route-export policy remains intact.

### DC11 — Performance must include authentication, fanout and snapshots

**Severity Medium; likelihood high if capacity is guessed.** Every hint may require several source checks and a snapshot. Per-observer channels do not make work constant-cost, and cross-region round trips can dominate latency.

**Required clause:** “Bound and measure active instances, per-instance/tenant control rates, current eligible observer fanout, snapshot rows/bytes and coalesced requests. Renew unchanged liveness without unnecessary fanout. Locate deployed request/data paths intentionally and measure the full producer→server→hint→snapshot→paint chain. Exceeding a budget gives honest unavailable/degraded awareness, not partial hidden-person counts or a no-one claim; source work continues.”

**Proof:** healthy and regional/mobile latency; reconnect storm; one high-fanout conversation; one tenant skew; same-profile tabs; malformed flood; total snapshot completeness; memory/session cleanup. Do not assert zero lag or production p95 before measurement.

### DC12 — Finite custody, restore and observation must not create surveillance

**Severity Medium; likelihood plausible if technical state is retained.** Expired rows, logs or restored epochs can become a staff activity archive or resume stale cues.

**Required clause:** “Purge expired/closed technical records under a declared short owner deadline; no per-visit/draft-content history is retained. Keep only content-free operation/status/latency/error telemetry under existing policy, without names, email, source subjects or activity payloads. Restore/restart honors absolute expiry/current source and issues fresh epochs, never revives presence. Security diagnosis does not authorize uploading private state to a vendor.”

**Proof:** cleanup stopped/crash/restart/backup restore, expired auth session, stale callback after physical purge, logs/traces/exports and current source revocation. A regular row or backup is never ordinary readable history.

## Scalability and quantitative honesty

With R active reader instances and C of them actively composing, a coalesced10second reader /5second composer schedule produces approximately `(R-C)/10 + C/5` ordinary control/snapshot requests per second, plus bounded state transitions and wake-triggered reads. For500 readers including100 composers, that is60 requests/second before transitions. This is arithmetic, not measured capacity. Counts are browser instances, not deduplicated staff names.

Fanout is proportional to currently eligible live observers for a changed source context; source/identity authorization and snapshot queries add cost. Private per-observer topics avoid waking unrelated readers but require bounded registration/fanout and current authorization. Do not replace these with unrestricted account/inbox broadcasts to claim scalability. Closed numerical capacity limits and actual deployment sizing must be set in the qualified release profile before activation; no generic realtime benchmark proves Core's predicate, tenant skew or region behavior.

Measure healthy connected p95 start/stop target separately from interrupted networks, reconnect recovery and maximum stale expiry. A lagging/missing cue can be safely unavailable; it must never disable mandatory D1/D4 collision checks or imply another person will handle the work.

## Final synthesis

Keep A. Establish the qualified real actor/session/source context, one finite technical lease, ordered fresh activity reports and current snapshot first. Use Supabase private server-only refresh hints with current recipient fanout gates and bounded periodic reconciliation. Preserve shared UI/client ownership, ordinary Next request boundaries and existing source/collision/CRM/P17/P6 rules. Add no room-wide identity payload, shared draft, read roster, generic workflow, alternate transport host or unbounded activity archive.

Required release proof must exercise actual cached subscriptions after revocation, forged client payloads, source-topology changes, stale report windows, clock/network delays, database grants/privileged paths, SDK teardown, real browser/mobile/AT and complete latency/load traces. Current documentation and source checks select a coherent permanent design; they do not certify deployed authorization, realtime delivery or production performance.
