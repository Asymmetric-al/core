# Phase 26 D1 supporting evidence

**Subsequent source clarification from Q2, 10 September 2026:** Intercom's
email-threading page has conflicting statements about automatically admitting an
unfamiliar sender: its External senders section says no, while its comparison
table says yes. Earlier notes below accurately identify the no-auto-admission
passage but must not be treated as conclusive account behavior. D1's no-silent-
recipient-widening requirement remains ratified independently of this vendor
ambiguity. See `phase26-q2-reply-audience.md` for both source links and context.

This is the source and experiment appendix to the completed Phase 26 D1
adversarial review, checked on 10 September 2026. The review's corrected decision,
R1-R15 safeguards and final monitoring table reconcile these independent inputs.
Candidate language within an input is not a separate ratification. Source/code
facts, documented vendor behavior, inference and unavailable runtime evidence
are distinguished throughout.

The four sections cover database and authorization; Core contracts and delivery;
external support/CRM/UX practice; and local UI findings and executed probes.
No formal specification, implementation, external message, or provider operation
is authorized by these notes.

# Phase 26 D1 — independent database and authorization review

Date: 2026-09-10. Decision examined: ordinary email continuation, without requester-facing My messages in Phase 26. This is an adversarial grooming evidence note, not a formal specification or implementation authority.

Read-only repository inspection at `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`; execution directory verified. Reviewed root/API/auth/Supabase instructions, backend rules, canonical Supabase skill, applicable platform and workflow OpenSpec, current source and tests, all numbered migration references to Support Hub and email tables, and later global grants/RLS migrations. No database connection, migrations, provider operation, secret access, code edits, or runtime test was performed. Examples below are source-proven counterexamples or explicitly conditional reasoning, not observed production incidents. Repository remained clean.

## Disposition

**Accept with required amendments.** Email continuation is compatible with Core and reduces routine requester friction. It does not confer identity proof or authorization, and it makes durable intake, safe replies, and recoverable delivery central requirements. A portal would not repair the findings below and would add another disclosure surface. None of these findings justifies reversing the founder's channel decision.

Candidate corrected decision: **Phase 26 provides an ordinary email conversation with the tenant's support team, with no account creation or portal login required for routine support. Email correspondence is not proof of identity, represented-party authority, or permission to disclose or change CRM, giving, financial, or confidential care records. Staff operate one tenant-scoped support conversation and use the owning Core domain's authorization and command for consequential actions. The complete email path preserves authenticated staff attribution, structurally private notes, explicit safe recipients, collision protection, durable deduplication, visible delivery outcomes, and recoverable intake without exposing ambiguous or confidential mail to an unauthorized audience.**

## What already holds, and what was not falsely flagged

- The 19-table Support Hub foundation uses `(tenant_id, id)` primary keys and tenant-composite foreign keys for conversation→inbox/assignee/team/SLA, message→conversation, attachment→message, labels, and major support-owned relationships. See `supabase/migrations/20260515025814_support_hub_core_modules.sql:228-243,267-280,303-306,325-339`. Do not call this schema globally missing tenant-aware FKs.
- Support Hub staff UPDATE policies explicitly include **both USING and WITH CHECK**, requiring current-tenant staff membership (or established super-admin privilege), at `...core_modules.sql:563-566`. Ordinary users cannot simply update a row into an arbitrary other tenant through that policy. Both predicates remain too broad for immutable fields and sensitive compartments; that is a different issue.
- Authz current tenant comes from `app_metadata`, not editable user metadata; staff checks consult active membership rows. `20260226113000_authz_memberships_foundation.sql:130-140,181-202`. No new JWT-user-metadata escalation was found in this slice.
- Email tables had RLS disabled in the earlier backfill, but `20260426100000_resend_email_rls_grants.sql:10-24` subsequently enables RLS, revokes anon/authenticated access, and grants service-role access. Do not report the earlier disabled state as effective intent.
- The 20260611 inbound-route/review/bulk-move tables revoke anon and authenticated grants. They are server-command-owned. Active-route and pending-review partial unique indexes already exist; review creation handles duplicate insertion at `inbound-routing.ts:205-230`.
- Main inbound workflow loads an ID and then rejects mismatched tenant before using its contents: `workflows/adapters/inbound-email.ts:55-81`. Main adapter reads are explicitly tenant-bound; missing tenant throws: `support-hub/adapter/supabase.ts:73-86,143-168`.
- A tempting actor-ID finding was rejected after further evidence: routes pass `ctx.userId` to an `actorProfileId` field, while auth context exposes both names. However `20250101000000_init_schema.sql:27-29` makes profiles.id reference auth.users.id, and current signup trigger `20260227060000_auth_role_hardening.sql:69-72` writes both id and user_id from new.id. Normal-path failure must not be claimed. Prefer using the correctly named context field to eliminate implicit coupling, but this is not a demonstrated blocker.
- No money amount is introduced by D1. There is no justification to add support-owned monetary balances or payment calculations. Giving commands remain in their existing domains.

## Material findings

### DB1 — client-selected reply/note authorship

**High severity; high confidence; likely with crafted requests, accidental UI identity mistakes, or stale state.** `schemas.ts:58-63,80-85` requires caller-supplied `authorAgentId`. `apps/admin/app/api/admin/support/conversations/[id]/replies/route.ts:12-24` and notes route `:12-24` discard the authenticated callback context and forward the supplied author unchanged. `mutations/conversations.ts:73-80` only parses. Adapter `supabase.ts:904-918,941-954` resolves any same-tenant supplied agent; invalid ID becomes system participant via `:499-509`. Active status and authenticated-user ownership are not checked. This can persist a reply or note attributed to another staff member, or to the system. The send path currently queues only; this is already an audit/representation defect, not proof an email has been sent.

**D1 consequence:** preserve choice, amend truthful attribution and branded-reply requirements. Assignment, authenticated actor, display name, and selected permitted signature are separate concepts.

**Permanent prevention / exact candidate language:** “The server derives the acting user and active tenant staff identity from authenticated context. Caller input cannot choose or overwrite author, actor, tenant, or audit identities. A configured team From name or approved signature affects presentation only and does not replace the immutable acting-user attribution. An unresolved staff identity fails with a clear recoverable staff error rather than silently becoming system-authored.”

**Proof:** authenticated A sending B's agent ID is rejected or normalized to A with deliberate signature policy; inactive/missing agent rejected; cross-tenant author rejected; assignments never change author; normal A request succeeds. Test the real route→command seam, not only a mocked adapter accepting its own input.

### DB2 — blanket staff table CRUD bypasses command invariants and audit integrity

**High severity; high confidence in committed grants; likelihood conditional on authenticated Data API table exposure, which was not queried.** `...core_modules.sql:524-574` grants every listed table SELECT/INSERT/UPDATE/DELETE to authenticated and applies the same staff predicate. This includes `support_messages`, `support_assignments`, `support_audit_log`, routing-related inbox configuration, and agent identity rows. RLS tenant checks do not prohibit changing a message's author, body, type, privacy flag, delivery state, or provider reference; deleting audit rows; or changing sensitive settings without the server command. Direct removal of an inbox cascades through conversations (`:228-231`), messages (`:303-306`), and conversation audit (`:487-490`). Broad tenant staff access is not a confidential-care compartment model. This is not a demonstrated anonymous or cross-tenant data leak.

**D1 consequence:** makes “ordinary email” safe only when history, privacy, and delivery transitions cannot be bypassed by alternative clients.

**Permanent prevention / exact language:** “Support mutations involving messages, delivery, routing, assignment audit, record linking, privacy, or retention are owned by authorized server commands. Database grants and policies deny equivalent direct browser mutations. Audit history is append-only; approved redaction creates traceable redaction evidence. Inbox deactivation preserves conversations and history. Support membership grants no access to restricted CRM, missionary, financial, or care data. Both existing-row and resulting-row permissions are enforced wherever direct writes remain.”

**Proof:** real PostgreSQL 17 grants/RLS tests with anon, donor, missionary, ordinary staff, permitted support staff, admin, disabled membership, multi-tenant user, and service-role command. Negative UPDATE tests mutate tenant, author, privacy/type, provider refs and audit values. DELETE/parent-cascade tests preserve historical evidence. Verify deployed Data API grants separately before release.

### DB3 — some cross-domain relationships remain tenant-unchecked

**High integrity severity; high static confidence; medium likelihood under future integrations or direct writes; no observed disclosure.** Core support-owned composite FKs are sound. In contrast message `outbound_send_log_id` and `inbound_email_id` reference only global UUIDs (`...core_modules.sql:297-298`); inbound routing review `inbound_email_id` and `resolved_route_id` are single-ID references (`20260611183000_support_inbound_routes.sql:38,45`). `support_agents.profile_id`/`user_id` are single-ID references (`...core_modules.sql:45-46`) without membership constraints, and user mapping is nonunique (`:61-63`). Inbound bridge conversation/message IDs are plain nullable text (`:501-506`). Legacy support tickets accept contactId in service insert without a tenant-scoped lookup (`support/service.ts:214-230`), and schema `20260501001500_support_hub_foundation.sql:20` has only contact-id FK. Therefore existence is constrained but same-tenant coherence is not uniformly constrained.

**D1 consequence:** require relationship integrity; do not introduce shadow CRM contacts or assume global UUID unguessability is authorization.

**Permanent prevention / exact language:** “Every support relationship to another tenant-owned record must preserve tenant equality through a tenant-composite foreign key or an equally enforced canonical command constraint where a simple FK does not model the domain. A sender observation may exist without a CRM link. CRM links identify authoritative Core records and never grant record access. One inbound delivery may have at most one canonical support effect under the chosen provider/recipient identity contract. Actor mappings are explicit and unambiguous.”

**Proof:** foreign-tenant IDs fail even when globally valid; inbound null-tenant record cannot become a tenant conversation without authorized resolution; moving/linking does not rewrite provider tenant; unlink/CRM merge preserves original correspondence and re-authorizes current linked context. Do not freeze a one-global-email→one-person rule: shared addresses and represented organizations make it invalid.

### DB4 — fresh reads are not durable concurrency control

**High severity; high static confidence; medium likelihood during replay, retry overlap, or parallel messages.** Inbound `routeReadyInboundEmail` fresh-reads bridge and existing support message (`inbound-email.ts:314-334`) before later creating a random support message (`adapter/supabase.ts:1331-1333`). Two runs can both observe no existing effect. `support_messages_tenant_inbound_email_idx` is nonunique (`...core_modules.sql:317-319`); there is no claim around the actual route effect. Function concurrency limit3 is per tenant (`functions/inbound-email-processing.ts:48-54`), not a per-email lock. Manual retry claims dispatch, not the later business insert. Provider inbound-row deduplication does exist (`20260402090000_resend_email_foundation_backfill.sql:149-154`), but it does not deduplicate resulting support rows.

Also `bumpConversationAfterMessage` writes `snapshot.messageCount+1` and `snapshot.unreadCount+1` (`adapter/supabase.ts:632-666`), so two different concurrent arrivals lose counts. Writing last-message timestamps from late processing can move the latest marker backwards. Two replies lack a shared version or idempotency gate (`schemas.ts:80-85`).

**D1 consequence:** amend reliable intake and no-double-answer guarantees; portal choice is unaffected.

**Permanent prevention / exact language:** “A durable business-effect identity, not only a webhook or workflow request ID, prevents duplicate intake and duplicate reply submission. Conversation mutation and message append use one authoritative transactional boundary with version/conflict checks, atomic counters or authoritative projections, monotonic latest-event timestamps, and recoverable dispatch intent. Replaying the same effect returns the original result. A stale compose attempt preserves its draft, refreshes the relevant changes, and requires staff review before a new deliberate send.”

**Proof:** simultaneous identical inbound jobs yield one message and one history event; two distinct arrivals both survive and produce correct counts; late event cannot regress latest marker; lost-response retry returns original reply; simultaneous sends produce the chosen conflict outcome; claim expiry/recovery and process death are tested. Product work claims must follow existing `openspec/specs/workflow-orchestration/spec.md:76-93` rather than creating another workflow authority.

### DB5 — multi-write partial success loses important secondary evidence

**High severity; high static confidence; medium likelihood with database or process faults.** Message insert, attachment insert, conversation bump, and inbound bridge happen separately (`adapter/supabase.ts:588-623,632-666`; `inbound-email.ts:434-445`). Bridge recovery is good, but does not repair all earlier partial writes. A support message inserted before conversation-bump failure is discovered by recovery and returned as already routed (`inbound-email.ts:344-370`), skipping the bump. An existing source dedupe alone will not repair the missing update.

Move does UPDATE first and audit insert second (`move-service.ts:177-232`). Audit failure returns failed after the move already occurred; bulk retry treats same_inbox as moved (`:359-365`) without recreating missing markers. Single-move POST invokes move service directly (`move.ts:55-62`) and does not use the per-item work claim present only in bulk (`move-service.ts:327-333`), despite comment claiming single/bulk/retry serialization.

**D1 consequence:** capture safe recovery as required, not optional future monitoring.

**Permanent prevention / exact language:** “The conversation state change, immutable business audit, required relationship updates, and any dispatch intent commit atomically, or a durable repair record guarantees recovery of each missing secondary effect. ‘Already at destination’ does not alone prove an audited move completed. All single, bulk, and retry entry points use the same mutation concurrency boundary. Retry must not report completion until required historical evidence exists.”

**Proof:** injected failure between each pair of writes; process termination immediately after commit; move races through single and bulk paths; failed audit followed by retry produces exactly one canonical movement with both intended markers; receive recovery repairs counters/history without duplicating the message.

### DB6 — private note is a mutable flag combination, not a structural non-delivery invariant

**High potential confidentiality severity; high static confidence; no current observed send leak.** Dedicated note path writes type note/is_private true but direction outbound and state delivered (`adapter/supabase.ts:947-960`). SQL checks type, direction, and delivery states independently; author/body merely must be JSON objects (`...core_modules.sql:307-311`). It permits note rows with public flag, delivery reference or headers. Blanket direct writes amplify this (DB2). Current sender is not wired, so report this as a pre-activation requirement rather than an existing provider disclosure.

**Permanent prevention / exact language:** “Internal notes and system-only events are structurally non-deliverable. They cannot acquire recipient lists, provider-send identity, or external delivery transitions. Delivery preparation accepts only a public staff-reply command with explicitly authorized recipients and content; it never serializes a whole mixed conversation timeline.”

**Proof:** database rejects invalid type/privacy/provider combinations; UI, API, worker, macro and export tests show internal content remains internal; a note-to-reply conversion, if supported, is an explicit new reviewed reply rather than a privacy-flag toggle. This narrows implementation freedom, not email continuation.

### DB7 — threading is correlation, not identity, and conflicts can be silently selected

**High confidentiality/integrity severity; high static confidence; medium likelihood for forwards, shared addresses or malformed references.** `findThreadedConversation` searches all same-tenant message header candidates, accepts first match with limit1 and no ordering or participant validation (`adapter/supabase.ts:1377-1395`). Fallback exact sender+normalized subject+unresolved status (`:1398-1410`) can combine separate requests. Resolved inbox parameter is not checked against the matched conversation (`:1312-1329`); route resolver's earlier thread check uses only inbound message In-Reply-To (`inbound-routing.ts:67-96`), a different correlation algorithm. Conflicting References across existing conversations can be arbitrarily selected. No cross-tenant header search was found.

**Permanent prevention / exact language:** “Automatic thread correlation uses tenant-owned routing evidence with deterministic precedence and ambiguity handling. A thread header or reply token correlates correspondence but never proves CRM identity, represented-party authority, or permission to disclose prior history. Conflicting threads, participant changes, or destination conflicts do not silently choose a first match; keep incoming content recoverable and present an explicit staff resolution with safe default recipients. Same subject and sender alone do not automatically merge independent requests.”

**Proof:** same headers across tenants remain isolated; conflicting references; new sender with known message ID; forwards; shared mailboxes; changed sender address; same subject independent request; recipient reroute after conversation move. Exact token design and lifetime can be resolved in subsequent provider/threading decisions without weakening this invariant.

### DB8 — known/unknown tenant intake and attachment status can overstate recoverability

**High service-integrity severity; high source confidence; operational likelihood unmeasured.** Unresolved or ambiguous tenant inbound returns503 before durable event/placeholder insert (`email/webhooks/resend.ts:673-685` before`:688-705,799-821`). This is appropriate fail-closed disclosure behavior, but does not prove no loss after provider retries expire. Known-route review is tenant-owned and cannot safely be reused for mail whose tenant is unknown.

Attachment processing lists provider metadata but persists only count/status, not returned attachment identities or bytes (`inbound-email.ts:227-280`); both success and failure status writes ignore returned database errors. Inbound adapter receives no attachments parameter (`support-hub/adapter/supabase.ts:1293-1310,1331-1355`). A provider list reporting available is not proof staff can retrieve an authorized durable attachment later. No support-specific storage policy/download command was found in the scoped search; this is an unimplemented proof gap, not a claim an existing bucket is public.

**Permanent prevention / exact language:** “Accepted support intake has a durable recoverable disposition. Unresolved tenant ownership never exposes content to a guessed tenant; platform recovery is authorized separately from tenant routing review. Attachment state distinguishes pending, available under current authorization, rejected with safe reason, and failed/retryable. ‘Available’ requires the actual permitted retrieval path, with bounded size/type policy and retention behavior. Database failures while recording recovery state are checked and retried.”

**Proof:** provider retry exhaustion and replay; ambiguous tenant; ownership resolution; attachment-only mail; attachment retrieval after signed URL expiry; cross-tenant download; membership revocation; partial attachment failure preserving message body; rejected oversized/malicious attachment; persistence fault does not announce success. Operational recovery design must be completed before inbox activation.

### DB9 — lifecycle state and history can contradict actual work

**Medium-to-high service-integrity severity; high static confidence.** Schema does not require snoozed_until for snoozed or resolved_at consistency; `setStatus` can set snoozed with null timer (`supabase.ts:837-845`). Inbound reopens resolved only (`:643-650`), leaving snoozed work snoozed; scheduled wakeup was not found in inspected paths. First responded timestamp is set at queued message append (`:651-654`), although provider delivery has not occurred. Exact chosen SLA start/stop semantics are not decided, but queued cannot be silently treated as confirmed recipient delivery.

**Permanent prevention / exact language:** “Conversation work state, expected next action, timer state, message submission state, and provider delivery evidence are separate facts. Allowed state combinations and transitions are enforced by the canonical command and database constraints where appropriate. Incoming accepted replies make owed work visible under the agreed lifecycle. SLA timestamps identify the actual chosen event and are not inferred from an optimistic UI label.”

**Proof:** invalid snooze/resolution combinations; time-zone and DST wakeup; new reply during snooze; resolve racing receive; failed/ambiguous submission; late provider events; replay does not reset original timestamps. Do not select Front/Zendesk's full lifecycle merely to fix these invariants; lifecycle choice remains its own researched founder decision.

### DB10 — parallel legacy identity and support state must not survive as dual authority

**High long-term integrity severity; high source confidence; migration volume unknown.** `support_contacts` stores name/email/relationship/organization/giving_summary (`20260501001500_support_hub_foundation.sql:3-13`) independently of authoritative CRM; old support_tickets uses it. Current legacy service still reads/writes tickets (`support/service.ts:146-239`) and mixes live contacts with fixture queues/macros (`:130-143`). New conversations store unconstrained JSON contact_ref (`...core_modules.sql:210`), with current inbound setting it null (`adapter/supabase.ts:1431`). Email continuation should not perpetuate a second CRM or create new duplicate contacts.

**Permanent prevention / exact language:** “One Support Hub conversation model owns support work. CRM identity and relationships remain authoritative Core records; support retains historical sender observations and explicit authorized links. Legacy support records are migrated with a verified mapping or retained read-only with clear provenance; no simultaneous independent intake creates parallel active support truth. Existing contact snapshots are evidence, not identity authority.”

**Proof:** inventory actual legacy rows before migration; preservation of IDs, timestamps, participants and history; unresolved identity remains unlinked; dedupe does not merge shared-mailbox people; old routes redirect/read-only after cutover; rollback never re-enables competing writers. No production inventory was made during grooming, so record required evidence rather than inventing volume.

## Database subcategory coverage

| Requested subcategory                      | Result                                                                                                                                                                                                                                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tenant scoping and tenant-aware PK/FK      | Material concern DB3; foundational support-owned composite keys verified sound.                                                                                                                                                                                                        |
| Nullability/defaults/checks                | Material concern DB6/DB9; nonnegative counters and constrained scalar status/type already exist.                                                                                                                                                                                       |
| Unique keys and idempotency                | Material concern DB4; provider inbound rows, active routes, and pending reviews have useful uniqueness already.                                                                                                                                                                        |
| Deletes/history/append-only                | Material concern DB2/DB5; cascades and staff direct CRUD can erase operational history.                                                                                                                                                                                                |
| Data types and money precision             | No new money-storage concern from D1; do not introduce support-owned money. Body/contact JSON flexibility needs bounded schema and authority rules under DB3/DB6.                                                                                                                      |
| Indexes/query performance                  | Existing tenant/status/inbox/message indexes useful; authoritative search must not silently truncate. Prior code audit's cap-before-search remains a material concern outside this DB finding slice.                                                                                   |
| RLS USING/WITH CHECK                       | Both clauses exist. Material concern is breadth and direct mutation authority, DB2, not absent WITH CHECK.                                                                                                                                                                             |
| Grants/views/functions/service role        | Material concern DB2/DB3. Email/routing tables are service-role-only. No support-specific exposed view bypass was found. Seed helper is private, PUBLIC revoked, service_role execute only (`core_modules.sql:785-786`).                                                               |
| Storage policies                           | No existing public-bucket leak demonstrated. Material delivery/retrieval proof gap DB8.                                                                                                                                                                                                |
| Trusted actor and owner fields             | Material DB1; preserve identity distinctions. The preliminary user/profile mismatch concern was rejected after checking creation invariants.                                                                                                                                           |
| Transform allowed row into forbidden state | Tenant change generally rejected for current ordinary staff; privacy/type/provider/actor/history transformations remain allowed under broad CRUD, DB2/DB6. Legacy UPDATE can also change created_by because its WITH CHECK does not repeat INSERT equality (`foundation.sql:156-179`). |
| Atomicity/concurrency/temporal correctness | Material DB4/DB5/DB9. Existing claims on retry dispatch/bulk moves do not prove universal effect serialization.                                                                                                                                                                        |
| Migrations/backfills/mixed versions        | Material DB10 and DB2-6 repair activation. No schema changes made. Expand/backfill/validate/enforce, preserve mappings, disable old writers before new real inbox activation; destructive rollback after real mail is not safe.                                                        |
| Production proof                           | Material gap: tests inspected are query mocks and a SQL-string foundation test, not deployed grants/RLS, transactional races, or complete attachment/reply proof.                                                                                                                      |

## Minimal permanent implementation order implied by D1

1. Record the channel decision and authorization distinction. Do not freeze provider, lifecycle vocabulary, queue permissions, or CRM match heuristics just because current source picked them.
2. Establish server-owned actor, tenant, conversation and CRM-link boundaries; close direct mutation escape paths and define structurally non-deliverable notes.
3. Make intake/reply/move business effects atomic or durably repairable, with source uniqueness, conflict checks, stable history and correct state projections. Reuse shared work claims and dispatch ledger.
4. Complete deterministic routing, quarantined/ambiguous intake recovery, attachments and provider-state reconciliation through existing email ownership boundaries.
5. Validate migrations and legacy cutover with production-shaped fixtures; run RLS, concurrency, fault-injection and user-journey proof before opening real inboxes. No activation authorization is implied by this review.

No known material safety finding in this slice is proposed as monitor-only. Before rollout, observability still needs a named owner and actionable thresholds for unhandled durable intake, duplicate effects (target zero), forbidden authorization attempts, missing audit evidence (target zero), and stale pending provider state. Numeric time thresholds must follow measured provider retry/latency and staff service policy rather than an invented benchmark.

## Primary technical references

Repository local config specifies Postgres17 (`supabase/config.toml:34`). Official PostgreSQL17 RLS documentation confirms row predicates and table grants are distinct, privileged roles bypass RLS, permissive policies combine, and integrity checks do not enforce application authorization: [Row security policies](https://www.postgresql.org/docs/17/ddl-rowsecurity.html). This explains why an RLS-enabled table still needs narrow mutation grants and tenant-composite relationships.

Foreign keys, unique keys, checks and delete actions provide different guarantees; use the strongest constraint that expresses a real invariant, without inventing a support-specific CRM: [PostgreSQL17 constraints](https://www.postgresql.org/docs/17/ddl-constraints.html). Concurrent commands need a transactional serialization strategy where they change the same business fact; freshness checks by themselves are insufficient: [PostgreSQL17 explicit locking](https://www.postgresql.org/docs/17/explicit-locking.html). These are verified platform behaviors, not proof of deployed Core configuration.

Current Supabase documentation separately explains policy enforcement and service-key bypass: [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security). Core's own `openspec/specs/workflow-orchestration/spec.md:13-32,59-101` remains the authority for product-owned records, identifier-only workflow envelopes, claims, ledger, and additive rollback-safe adoption.

---

# D1 email continuation — independent contract and delivery review

Reviewed 10 September 2026. This is a bounded independent contribution to the Phase 26 grill, not an implementation specification or a claim of production readiness. No production/provider calls, messages, DNS changes, credentials, repository mutations, or GitHub mutations were used. Local repository commands executed in the nominated WSL worktree and verified its directory. Source at `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd` is unchanged and clean. Current official documentation was searched and read. Synthetic scenarios below test boundaries; they are not asserted ministry research findings.

## Disposition and exact corrected decision

**Accept with required amendments.** Email continuation serves the explicitly stated goal: ordinary support should work through a familiar mailbox, with no mandatory Asym account, portal visit, ticket number, or identity challenge merely to ask a question or continue an ordinary conversation. It does not establish that email is sufficient for every disclosure or business action. The strongest alternative, optional My messages, adds centralized history but is not necessary to achieve this decision and has separate historical-disclosure obligations.

> **D1 — Email continuation with purpose-owned protected handoffs.** Phase 26 completes the shared staff Support Hub and permits requesters to start and continue ordinary support by email, including people with no Asym account or CRM Party. Qualified existing public, donor, and missionary Help entry points preserve their context and use the same Support-owned conversation where their purpose calls for Support; they do not create another inbox or require re-entering an accepted request. Phase 26 does not include a new My messages history/reply surface. Routine conversation requires no account creation, login, ticket-number entry, or blanket verification challenge. Matching an email, receiving a reply, possessing a thread identifier, being assigned a conversation, or being related to a Party does not establish civil identity, representation, financial instruction, CRM access, or permission to disclose prior content. When the exact requested disclosure or action needs assurance, Support hands off to the existing owning domain's qualified, minimally sufficient protected flow, preserving the request and intended destination; it does not introduce a Support authentication or financial-action authority. Ordinary messages continue through the tenant's governed reply identity and Phase 17/6 preparation, dispatch, and body-free evidence. Every durably accepted intake has one recoverable disposition, including unresolved routing, content/attachment failure, or quarantine; staff see truthful pending, failed, or uncertain delivery without an automatic resend of an uncertain outcome. Confidential care and restricted subjects remain within their owning authorization boundaries. Email continuation does not authorize marketing enrollment, automatic CRM-person creation, an enterprise help-desk clone, or a second workflow engine.

The exact state labels, participant/CC admission, automatic acknowledgment policy, and mail/attachment policy require their own subsequent single-decision grooming. This D1 decision records their mandatory safety boundaries; it does not silently decide every downstream product policy.

## Current authority and live provenance

Live `develop` remains `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. PR metadata refreshed during this review:

| PR                                                      | Live state                           | Exact head                                 |
| ------------------------------------------------------- | ------------------------------------ | ------------------------------------------ |
| [465](https://github.com/Asymmetric-al/core/pull/465)   | Merged 15 July; approved             | `9a44396d6c6b57f12ebb7144ed9c99f0fa73d85a` |
| [872](https://github.com/Asymmetric-al/core/pull/872)   | Merged 27 July; approved             | `b886c2eb2fe4c98cc8723a232d860138c86b10c2` |
| [1323](https://github.com/Asymmetric-al/core/pull/1323) | Open, review required, blocked       | `70c50e8c97556c43be5543332fb0993b468b90ab` |
| [1340](https://github.com/Asymmetric-al/core/pull/1340) | Open, review required, blocked       | `9069dcad67f9630323474ca5ee8bcc85ca7bf0f6` |
| [1558](https://github.com/Asymmetric-al/core/pull/1558) | Draft open, review required, blocked | `ab1a1703a725be454376990a7fe68aef2e048026` |
| [1564](https://github.com/Asymmetric-al/core/pull/1564) | Open, review required, blocked       | `0624ca3841ea98e618fed0e2c490d24c0ef1d9c1` |

Issues [294](https://github.com/Asymmetric-al/core/issues/294), [296](https://github.com/Asymmetric-al/core/issues/296), [297](https://github.com/Asymmetric-al/core/issues/297) remain closed; [554](https://github.com/Asymmetric-al/core/issues/554), [559](https://github.com/Asymmetric-al/core/issues/559), [1385](https://github.com/Asymmetric-al/core/issues/1385), [1563](https://github.com/Asymmetric-al/core/issues/1563) remain open. Phase 6 emit integration is not proved by the earlier closed inbound-workflow issues. Open predecessor documents are founder-ratified intent at the pinned revision, not merged runtime. Existing active OpenSpec content records intended work and does not prove implementation.

The following links use exact current-source revisions. `P6`, `P17`, and `P12` mean the phase PRDs, not implemented service names.

## Material findings

### C1 — Account-free support needs the already-permitted no-Party authority path

**High severity; likely if the stale table summary is implemented literally. Amend, do not reject, D1.** P6 explicitly admits a tenant non-constituent recipient authority alongside the Party/contact path, keeps address material out of durable execution/history, and prohibits fake Parties. The active outbound OpenSpec agrees. However, P17's table restatement still says tenant rows require Party/contact. Treating that restatement as decisive would either force account/contact creation or encourage arbitrary-address sends. Neither is acceptable.

Permanent language: **“An ordinary Support reply to an unlinked requester uses an exact tenant-owned, revisioned, purpose-bounded no-Party recipient authority admitted by Phase 6/17. It does not create or claim a Party. Its authoritative Support participation/address custody is separate from the body-free communication reference; CRM matching cannot select a different recipient or widen disclosure. Align every Party-only restatement with the explicit exclusive-arc contract before implementation.”** This defines a narrow business authority, not a general send-to-any-address escape. The P6 restriction on execution/history addresses must not be misread as forbidding Support from retaining its authorized conversation participants under its separate purpose-retention policy.

Evidence: [P6:469–476](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md#L469), [OpenSpec:878–894 and 979–988](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md#L878), contradictory [P17:1969](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md#L1969).

### C2 — A protected task is not a reason to gate the entire conversation

**High severity; plausible common confusion in donor-care actions. Narrows “effortless” to sufficient assurance, not no assurance.** A person can ask about a receipt without proving identity. Sending an official artifact, altering a destination, changing a recurring gift, or issuing a refund has independent owner requirements. An agent's capability proves operator authority, not the Party's instruction. CRM matching, a shared church mailbox, or a forwarded email does not resolve these facts.

Permanent language: **“Accept and preserve the request first where intake is allowed. Request only the existing owner-required assurance at the protected step, reuse sufficient current assurance, and restore the exact intended task after any handoff. Support does not demand account creation when a qualified guest capability exists. Support resolution never records completion of a refund, contact change, document issuance, or other owner action.”** Do not claim the guest capability proves the named donor: ADR0037 and Phase25 explicitly reject that inference.

Evidence: [P12:15–19](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md#L15), [ADR0037:15–19,36–60,101–107](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0037-scanner-safe-exact-artifact-access.md#L15), [P25 financial:73–79](https://github.com/Asymmetric-al/core/blob/0624ca3841ea98e618fed0e2c490d24c0ef1d9c1/docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/financial.md#L73). [OWASP transaction authorization](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html) supports server-owned transaction facts and action-specific authorization; it does not prescribe another login for ordinary help.

### C3 — Mail receiving ownership cannot be inferred from a sending address

**Critical potential impact; conditional likelihood, not a proved exploitable production incident. Requires implementation correction.** Current webhook routing accepts extracted payload tenant metadata first, otherwise matches incoming recipient domains to connected `tenant_email_settings.default_from_email`. The processing worker uses a global `RESEND_API_KEY`. Those mechanisms do not prove the exact receiving connection, mailbox custody, environment, or tenant owner. P17's target explicitly requires proved connection revision before scope lookup and rejects metadata as ownership authority.

Permanent language: **“Resolve authenticated provider ingress to the exact registered receiving connection/environment, then validate the bound recipient route and tenant. Untrusted message headers, From, CC, payload tenant ids, website domain ownership, and outbound sender identity cannot select a tenant or credential. Receive credentials/custody use the existing integration ownership/security model with exact receiving qualification; they do not create an independent Support secret store.”** A signature proves the provider sent the webhook, not that every mail header was written by a trusted principal.

Evidence: [webhook:453–476,549–562](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/email/webhooks/resend.ts#L453), [worker:27–37](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/workflows/functions/inbound-email-processing.ts#L27), [OpenSpec:919–922](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md#L919), [Resend verification](https://resend.com/docs/webhooks/verify-webhooks-requests), [RFC8601 trust boundary](https://www.rfc-editor.org/rfc/rfc8601.html#section-1.2).

### C4 — “Never disappears” needs an accurate acceptance boundary and accountable exceptions

**High severity; likely during real outages/misconfiguration. Requires amendment.** Current known-tenant webhook stores a replay-safe placeholder, then records durable dispatch; it responds 503 if the dispatch record cannot be created, otherwise 200. This is a useful foundation. An unknown/ambiguous tenant returns 503 before storing tenant intake, so indefinite reliance on provider retry is incomplete. Resend retries are finite, and repeated failures can cause automatic endpoint disablement. SMTP acceptance by a provider and Asym webhook acceptance are distinct responsibilities; an Asym application cannot promise observation of every message a sender attempted.

Permanent language: **“Every authenticated ingress observed by Asym reaches a durable, recoverable disposition before success is acknowledged. Exact tenant routing is required for tenant work. Unresolved ownership creates/reuses a minimal service-only operations evidence/recovery item under the existing platform operations model, never a guessed tenant or candidate-tenant broadcast. Reconciliation detects receiving-provider records absent from local intake. Accepted content that cannot be completed remains actionable; pre-acceptance rejection and upstream provider rejection are described honestly.”** Do not build a second unrestricted mail inbox for operators. Content visibility and retention in unresolved scope must be expressly limited.

Evidence: [webhook:673–684 and 799–885](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/email/webhooks/resend.ts#L673), [glossary:392–412](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/CONTEXT.md#L392), [Resend retries/replay](https://resend.com/docs/webhooks/retries-and-replays), [RFC5321 §6.1](https://www.rfc-editor.org/rfc/rfc5321.html#section-6.1).

### C5 — Current thread heuristics can put a new request into the wrong conversation

**High severity; plausible whenever subjects repeat, mail is forwarded, or references conflict. Requires correction.** Current message-reference lookup selects one arbitrary matching conversation (`limit(1)`), then falls back to same sender plus normalized subject and non-resolved status. References are not checked as participant/disclosure authority. Current outgoing rows generate a local Message-ID, set no In-Reply-To/References, and do not actually dispatch. Subject similarity is insufficient to merge support work. A known reference also does not entitle a newly added person to quoted private history.

Permanent language: **“Thread only through exact tenant-scoped, provider-confirmed message relationships or a qualified opaque routing token. Conflicting relationships, unknown participants, and subject-only similarity never silently merge, disclose prior content, or expand recipient authority. Preserve the intake and present a staff-resolvable outcome. Mail adapters own bounded syntactically safe In-Reply-To/References and provider Message-ID mappings; subjects remain human recognition, not identity.”** Ordinary valid replies should route without forcing donor copy/paste. The exact new-participant/CC policy is the next product decision, not implied by D1.

Evidence: [adapter:1371–1409](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L1371), [send row:924–932](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L924). [RFC5322 §3.6.4](https://www.rfc-editor.org/rfc/rfc5322.html#section-3.6.4) defines threading references, not permissions. [Resend replying](https://resend.com/docs/dashboard/receiving/reply-to-emails) documents In-Reply-To and References. Its [8 July 2026 Message-ID change](https://resend.com/changelog/message-id-for-sent-emails) now exposes the provider Message-ID in webhooks and GET/list endpoints. Do not preserve an obsolete assumption that the provider's actual ID is unavailable.

### C6 — Tokenized Reply-To must compose with the governed mailbox, not bypass it

**High severity if unconstrained; moderate likelihood of contradictory implementation. Requires explicit contract alignment.** P17 allows exactly one confirmed human Reply-To destination, independently resolved from From, with no dynamic alias engine. P26 roadmap proposes opaque plus-address fallback. These can compose only by a narrow receiving-owner-certified derivative of the verified destination, prepared by the shared adapter. A browser-supplied Reply-To or arbitrary header “to support threading” defeats the sender contract. A token is a routing handle, not authorization or an invitation to email old conversation history to its possessor.

Permanent language: **“Any opaque reply-routing address is issued server-side for the exact tenant/inbox/conversation routing purpose under a current verified receive identity. Phase 17 freezes the admitted derived Reply-To and its parent proof/revision; only its adapter constructs headers. Token exposure, forwarding, rotation, mailbox replacement, retirement, and later replies preserve safe routing or actionable intake without disclosure. No token is a CRM grant, protected-action grant, or alternate sender identity.”** Qualification must prove actual forwarding and plus-address preservation for supported configurations; do not assume it.

Evidence: [P17:1519–1536](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md#L1519), [P26 roadmap:2938–2959](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/roadmap.md#L2938).

### C7 — Attachment-only and genuinely empty mail are not retrieval failures

**Medium severity; realistic inputs, occurrence rate unmeasured. Narrows a current readiness rule deliberately.** Current body fetch throws if both text and HTML are empty; routing repeats the nonempty requirement. A donor sending only an attachment or using the subject as their question can therefore enter persistent failure despite successful provider retrieval. The inherited glossary requires body readiness and forbids empty placeholders, so a change must distinguish a fetched-empty body from a body that was never fetched. It should not invent an empty conversation as proof of successful retrieval.

Permanent language: **“Successful content retrieval is distinct from nonempty body text. A provider-confirmed attachment-only or subject-only message remains an ordinary visible intake with accurate empty-body/attachment state; a genuinely contentless message has a visible bounded disposition. Missing content, parser failure, or unresolved tenant cannot masquerade as a fetched-empty message. Quote removal is a derived display operation and must never discard the only new answer or modify authoritative source content.”** Untrusted originals remain governed, not indefinitely retained “for safety.”

Evidence: [retrieval:166–180](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/workflows/adapters/inbound-email.ts#L166), [routing:374–390](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/workflows/adapters/inbound-email.ts#L374), [glossary:421–432](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/CONTEXT.md#L421).

### C8 — “Attachments available” currently overstates byte custody

**High severity for loss or unsafe access; likely after provider expiry unless corrected. Requires implementation safeguard.** The worker currently lists attachment metadata, records count and `available`, and discards the returned list. It does not persist bytes or durable attachment identities in that step. A real attachment cannot be called usable just because a provider list succeeded. Resend returns download URLs valid for one hour, renewable through its API; its documented ordinary email-data retention is 30 days, with enterprise exceptions. Neither provides permanent Asym records custody.

Permanent language: **“Attachment presence, provider availability, local retrieval, scanning/quarantine, authorized availability, and irreversible unavailability are separate facts. ‘Available’ means the qualified file owner can currently authorize and serve the exact admitted bytes. Copy into the shared Phase 29 byte/access model before the proved provider retrieval deadline, under Support's purpose/classification/retention policy; metadata-only rows and expiring provider URLs cannot satisfy custody. Body-ready conversation handling continues while attachments recover. Public-form uploads remain gated by P23/P29's qualified upload owner.”** Do not create a Support bucket/retention engine. Require safe file decoding/type limits, malware handling, tenant-bound metadata and storage, and no automatic redistribution on reply.

Evidence: [attachment listing:227–280](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/workflows/adapters/inbound-email.ts#L227), [P29 ownership:3151–3173](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/roadmap.md#L3151), [Resend attachments](https://resend.com/docs/dashboard/receiving/attachments), [Resend retention/limits](https://resend.com/docs/knowledge-base/account-quotas-and-limits), [OWASP file handling](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

### C9 — Delivery truth, durable idempotency, and case status remain separate

**High severity; likely confusion with the present adapter. Requires implementation safeguards, not another delivery engine.** `sendReply` currently creates an outbound queued row and returns it; no provider call occurs there. A retry creates a new generated message identity. Inbound routing already has useful bridge-repair lookup but reads then writes, and the foundation inbound-message index is non-unique; application lookup is not durable uniqueness. A duplicate/late webhook or timeout can otherwise duplicate replies, lose counter updates, or claim a successful answer before transport.

Permanent language: **“One accepted reply command atomically freezes its conversation/content/recipient revision and durable business idempotency identity. The shared communication owner records independent preparation/submission/attempt and normalized outcome. Retries reuse the immutable effect identity; a changed reply is a deliberate new effect. An ambiguous provider result remains indeterminate and is reconciled before resend. Support status cannot change provider evidence, and delivery success cannot prove requester read or completion of another domain action. One accepted inbound provider occurrence creates at most one canonical Support message; uniqueness and transaction/recovery behavior must prove this under concurrency.”** Wire current Support `outbound_send_log_id` consumers through the existing P6 migration gate. Do not retain two send authorities.

Evidence: [adapter:904–939](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L904), [bridge recovery:325–370](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/workflows/adapters/inbound-email.ts#L325), [nonunique index:317](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql#L317), [P6:150,175](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md#L150). [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys) is only a 24-hour provider dedupe window and cannot replace Asym's permanent semantic identity.

### C10 — Loop safety must preserve legitimate forwarded mail

**High severity under abuse; ordinary false-positive likelihood unmeasured. Requires policy qualification.** Bulk/automatic message markers, own-address loops, DMARC failure and per-sender limits are useful inputs, but none alone proves malicious intent or requester identity. Forwarding can break SPF alignment and modifications can invalidate DKIM. An attacker can place a false Authentication-Results header in a message; consume only documented trusted receiver evidence. RFC3834's automatic-response guidance must not be applied as a blanket refusal to converse with legitimate people or as an instruction to answer every spoofed From.

Permanent language: **“Layer provider-authenticated transport evidence, trusted receiver authentication outcomes, automatic-response markers, tenant/sender/conversation budgets, and bounded quarantine. Unknown or failed email authentication never proves identity and does not by itself justify silent deletion. Automated acknowledgment is an independently admitted, idempotent, loop-safe reply policy and never echoes arbitrary received content. Do not automatically answer auto-responses, bounce/null-path traffic, or own-system loops. Rate thresholds and counter keys must be experimentally qualified and versioned rather than copied from a competitor.”** Once accepted, quarantine/release/rejection remains a recorded disposition. Safe release must not recursively re-trigger the same automation.

Evidence: [RFC3834](https://www.rfc-editor.org/rfc/rfc3834.html), [RFC7960 forwarding interoperability](https://www.rfc-editor.org/rfc/rfc7960.html#section-2.2), [RFC8601 trust](https://www.rfc-editor.org/rfc/rfc8601.html#section-1.2). Provider documentation reviewed did not prove Resend's exact trusted authentication-results provenance, SMTP rejection semantics, or plus-token preservation for every forwarding configuration. Those are explicit activation qualifications, not facts to invent.

### C11 — Shared quota, outages and disconnect are product continuity concerns

**High severity for blocked communication; likely if traffic/retry rises. Requires bounded operational design.** The worker admits eight jobs/second globally and each ordinary job may perform at least a body and an attachment API call. Resend's current default is five API requests/second per team, shared across keys/domains; inbound and outbound both count toward account email quota. The worker limit therefore does not prove provider-capacity safety. Retrying every job without shared connection backpressure can degrade replies and other tenant communications.

Permanent language: **“Use the existing connection-scoped limiter/retry policy for receiving retrieval and outgoing mail; schedule fairly with explicit bounds and preserve higher-priority protected communication rules. Pause new delivery independently from receiving custody/recovery. Disconnect, domain change, webhook disablement, key rotation, quota exhaustion and inbox retirement expose one responsible owner and an explicit continuity action. No operation may abandon already accepted work or change an in-flight preparation's identity. Never repoint the root-domain MX as a routine setup convenience.”** Resend recommends receiving subdomains or forwarding to preserve an existing mailbox; equal-priority MX entries are not a safe fan-out strategy. Do not add a backup provider framework solely for D1.

Evidence: [worker:52–54](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/workflows/functions/inbound-email-processing.ts#L52), [Resend quotas](https://resend.com/docs/knowledge-base/account-quotas-and-limits), [receiving domains](https://resend.com/docs/dashboard/receiving/custom-domains), [retry/disable](https://resend.com/docs/webhooks/retries-and-replays). No tenant account's current limit was queried.

### C12 — Existing forms and source help must not become second Support truths

**High severity for partial intake/double work; moderate implementation likelihood. Requires dependency ordering.** P23's unmerged D26 contract creates one purpose-bound occurrence and one Primary Outcome, with all required intents/dispatch work atomically accepted. Support is one certified outcome, not an excuse to build a parallel public form or CRM request ledger. P25's document Help stays source-owned and its finite newsletter requests explicitly do not become Support conversations. Phase24 website Domain ownership does not own mail DNS or messaging identity.

Permanent language: **“Certify the Phase26 Support intake command before enabling P23 Support outcomes. Preserve the shared occurrence identity and route-plan snapshot; a retry returns the same Support result. Independent notification failure never undoes an accepted Primary Outcome. Existing source-owned Help and finite newsletter outcomes retain their owner, semantics and history; only an explicitly support-qualified purpose creates a conversation.”** This creates coherent navigation and fewer repeat steps without declaring all ministry work to be tickets.

Evidence: [P23 ADR0170:49–60,91–110,119–131](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0170-purpose-bounded-public-form-definitions-and-domain-owned-routing.md#L49), [P25 financial:79](https://github.com/Asymmetric-al/core/blob/0624ca3841ea98e618fed0e2c490d24c0ef1d9c1/docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/financial.md#L79), [P24:102–103](https://github.com/Asymmetric-al/core/blob/ab1a1703a725be454376990a7fe68aef2e048026/docs/prds/sitestacker-parity/phase-24-multi-site-management.md#L102).

### C13 — Private classification is not solved by a generic shared inbox

**Critical potential harm; likelihood depends on actual requests and configuration, not measured. Narrows delivery/disclosure only.** Phase10 care/security fields, restricted-person identity and Phase12 authorization are separate axes. Support assignment must not grant underlying restricted data, and receiving sensitive text from a requester does not make it safe to redistribute. The roadmap's care routing cannot be implemented as an infallible keyword classifier: Phase10 explicitly rejected a trigger-word system. Discovery of sensitive material after initial admission needs containment, changed future exposure, and honest treatment of already sent copies.

Permanent language: **“Apply the existing strictest-applicable classification and purpose boundaries to received content, attachments, context, search, exports and replies. Care-classified work is handed to its authorized owner; Support may retain only an admitted coordination reference and safe outcome. Unknown sensitive content requires a bounded review/containment path before broader exposure. Revocation/reclassification stops future access and unsent egress; never claim to retract mail already received outside Asym.”** Do not gate all ordinary donor questions behind care workflows or wait for the complete Phase38 product where an independently qualified narrow protected handoff exists.

Evidence: [P10:95–101](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-10-sensitive-data-safety.md#L95), [P12:177–185](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md#L177), [P26/34 boundary:2956–2963](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/roadmap.md#L2956).

## Order and proof gates

1. **Before recording D1 as settled:** use corrected wording; reconcile the explicit no-Party authority with the stale Party-only restatement; record ordinary conversation versus protected owner action and no My messages. No runtime evidence is needed to accept the product direction, but none may be claimed.
2. **Before design freeze:** define exact conversation participant/recipient policy and routing/identity distinction; owner-specific reference/retention and classification; qualify narrow P17 human-reply preparation without turning a human-authored reply into a system-message catalog item; align derived Reply-To token semantics; define successfully fetched-empty content. These are bounded decisions, not an enterprise feature inventory.
3. **Before enabling receiving:** exact receiving connection/account/environment proof, signature/replay controls, atomic accepted custody/work plan, non-tenant operations recovery, provider-list reconciliation, layered abuse, durable duplicate protection, Phase29 byte/access seam, retention deadlines, and accessible truthful pending/error states. Keep existing mail/DNS unchanged until an explicitly authorized proof and cutover.
4. **Before enabling replies:** Phase6/17 one-send authority, exact body/recipient revision, current author/capability, collision conflict preserving draft, immutable semantic replay, actual provider Message-ID, trusted threading, controlled recipient change, note non-deliverability, protected-action handoff, and monotonic adverse evidence. Prove frozen in-flight behavior when credentials/identity change.
5. **Before exposing public/portal Help:** qualify the source-owned intake/handoff; reproduce one accepted occurrence and one canonical support result under retry, timeout and crash; preserve typed context and intended return navigation. Do not block independent P25 source help or manufacture a new portal inbox.
6. **Before rollout:** inventory real legacy Support and send-log consumers/records; one-writer cutover; deterministic mapping and duplicate repair; tenant canary; old/new code coexistence and fenced rollback; prove already accepted work survives pause, deployment crash, restore, lost webhook and provider retirement. No claim of empty legacy data is justified by this review.

Mandatory tests at stable domain boundaries: accountless unknown requester can ask and receive an ordinary reply without Party/account creation; same-email/shared-address and represented-organization cases do not disclose protected history; extra CC/forged References cannot widen access; rejected action leaves the support request intact; current assurance avoids duplicate login; subject-only and attachment-only inputs remain visible; invalid signatures create no tenant work; duplicate accepted provider events produce one message; database failure before durable custody is not success; crash after message before bridge is recovered once; a remote send timeout never causes blind duplicate send after the provider's 24-hour key expiry; delayed delivered cannot erase bounce/complaint; disappearing permission stops future reads/send; scan failure blocks attachment download but not visible request; expired provider URL refresh never replaces byte identity; retired address and webhook disablement retain accepted work; form acceptance+dispatch is atomic; Support reply causes one Phase6 event per admitted recipient copy (never duplicate capture at both the Support hook and send seam) and no second CRM activity body; the purpose-owned refund/document result appears accurately without changing authority. Add actual Gmail/Outlook/Apple Mail mobile and forwarding/quoted-reply fixtures, Unicode names, supported non-Latin body text, and attachment-size/parser bounds with independently observed limits.

## Monitoring that does not excuse a launch gap

These are proposed operational requirements, not measured production thresholds or vendor defaults. A numeric SLO must be qualified against expected volume and retrieval budgets. Invariant violations should not wait for a statistical baseline.

| Signal                                                                        | Threshold                                                           | Owner                                                            | Response                                                                                                        |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Accepted local ingress lacks durable disposition/recovery work                | Any occurrence                                                      | Platform messaging on-call                                       | Halt affected acceptance if custody cannot be guaranteed, reconcile and restore work; incident review           |
| Verified receiving record missing from local intake                           | Any item beyond the qualified reconciliation lag                    | Platform messaging on-call                                       | Replay/reconcile under original identity; investigate endpoint and route health                                 |
| Webhook disabled, receive credential invalid, or exact route no longer proved | Any current active inbox                                            | Messaging integration owner + tenant inbox owner                 | Mark not Ready, contain new activation, preserve accepted work and enact proved continuity route                |
| Duplicate canonical message/semantic outbound effect or cross-tenant relation | Any occurrence                                                      | Platform messaging on-call/security owner                        | Fence affected writer, preserve evidence, contain disclosure, repair by explicit lineage; never routine cleanup |
| Pending attachment approaches provider retrieval deadline                     | Remaining time at or below the qualified worst-case recovery window | Records/storage operations owner                                 | Prioritize retrieval/recovery, alert responsible staff, prevent false Available                                 |
| Terminal/indeterminate external reply                                         | Any occurrence                                                      | Assigned support worker/team; messaging owner for reconciliation | Keep visible actionable work, reconcile uncertain transport, never automatic fresh resend                       |
| API429/quota-pressure signals exceed qualified connection budget              | Any sustained over-budget interval defined by provider contract     | Messaging integration owner                                      | Shared backpressure, fair scheduling, quota/config repair; preserve durable work                                |

## Evidence limits

No end-to-end provider experiment, live database/RLS introspection, production inbox, donor interviews, traffic distribution, file-retention policy, email-client matrix, or current-account limit was inspected. Source/test definitions and official documents establish the identified gaps and architecture obligations, but not production exploitability or shipped behavior. Full related CRM, database, and UI review is delegated separately for synthesis. No privacy-law conclusion is asserted here. Provider edition/retention/limits must be rechecked for the actual tenant contract at qualification. Claims in vendor marketing do not prove deployment architecture or superior UX.

---

# D1 external adversarial review: natural email continuation with shared CRM context

Research accessed 2026-09-10. Scope: the founder's choice of email continuation for Phase 26, plus the UX, identity, disclosure, and CRM consequences of that choice. This is a research input to the Core-grounded review, not an implementation specification or evidence that vendor behavior was exercised. All comparisons below refer to public official documentation, except the explicitly labeled historical user feedback and independent usability research. No vendor account, messages, DNS, or external state was changed. Current Core governing decisions take precedence over every external pattern.

## Disposition and corrected decision

**Accept with required amendments.** Choosing email continuation is sound. The strongest alternative is optional authenticated My messages plus email: it provides cross-device history and a controlled disclosure surface, but it creates a separate participation/authorization projection and is unnecessary for the stated outcome of ordinary conversation. Email continuation must not become “email proves identity,” “email can safely carry everything,” “every incoming email becomes a CRM person,” or “a visible Send button means a reply reached someone.”

Candidate corrected decision, subject to the parent's exact Core-contract reconciliation:

> Phase 26 lets a requester contact the tenant's support team and continue ordinary support by replying to email, without creating an Asym or Support Hub account, signing in, choosing a support password, opening a portal, or proving a CRM relationship merely to ask for help. Existing authorized Help entry points remain available and retain their context; Phase 26 does not add a requester conversation archive. Replies identify the tenant, use an activated and monitored return path, and contain the useful reply itself rather than a mandatory “view message” link. Unknown or ambiguous senders can receive ordinary help without creating or guessing a CRM Party. Intake identity, reply destination, CRM association, and authority to access or change business data remain separate. Protected disclosures and consequential actions use the owning Asym domain's existing authorization and secure completion flow only when needed, with context preserved and a clear explanation. Staff see one recoverable support conversation, authorized CRM context, explicit recipients, private notes that cannot be delivered, accountable follow-up, and honest delivery/failure states. Support Hub remains one Asym surface and does not own CRM identities, financial actions, confidential care, or provider mail truth.

This confirms the founder's product choice; it does not ratify a provider, status enum, universal attachment allowance, numeric SLA, auto-ack policy, support-side financial command, or enterprise help-desk feature catalog. Those details must follow the owning Core contracts and separately researched decisions.

## Consequential patterns and evidence

### 1. Contacting support and granting protected access are different operations

**Zendesk Support** documents an open configuration without mandatory registration; its anonymous web/API request verification rules explicitly exclude requests sent by email to the support address. Registration, when enabled, instead suspends unregistered requests and adds a verify/create-password workflow. The page was edited July 14, 2026; it does not expose a concrete plan limit in the accessible plan widget. [Enabling anyone to submit tickets](https://support.zendesk.com/hc/en-us/articles/4408881989018-Enabling-anyone-to-submit-tickets).

**Adopt:** no account creation to converse by email. **Do not adopt:** automatic Support end-user accounts as authoritative Core Parties, or apply a web-form verification policy to all email conversations. Anonymous web intake is an anti-abuse question distinct from ordinary email continuation. A knowledge-base visit must not be compulsory before asking a human.

**Help Scout's portal** has its own single-use-code access, own/company conversation visibility, and reply settings. That supports the conclusion that a portal adds authorization scope rather than merely adding a UI. Article updated September 8, 2026. [Set up and manage Customer Portal](https://docs.helpscout.com/article/1777-set-up-and-manage-customer-portal). This is the strongest alternative to D1, not evidence it is required.

### 2. The normal Reply action must work without teaching mail routing

**Freshdesk**, article modified January 21, 2026, documents replies using the support address on which the request arrived, and combines a thread-marker check with a requester check to append a reply. Multiple support addresses require Growth or above; the page distinguishes current Freshdesk/Freshdesk Omni from pre-December-2025 accounts. It also documents two limitations not to copy blindly: Message-ID lookup usually expires seven days after the last reply, and addressing two configured support addresses can create two tickets. [Email channel overview](https://support.freshdesk.com/support/solutions/articles/50000009268-overview-of-email-channel).

**Intercom**, July 30, 2026, documents verified custom sending identities and forwarding dependencies, warns that send-only addresses cannot receive replies, and describes failures when someone writes directly to an unforwarded From address. Some FAQ language still refers to unique Reply-To routing, while its dedicated threading article describes the replacement of old `n+u` Reply-To behavior after July 2023. Treat the dedicated threading documentation as the clearer account of current threading, and do not copy either routing mechanism without a provider-contract test. [Reply from the inbound address](https://www.intercom.com/help/en/articles/6288581-send-replies-from-the-address-inbound-emails-are-sent-to), [Email threading](https://www.intercom.com/help/en/articles/7996715-email-threading).

**Adopt:** recognizable tenant identity, ordinary Reply, tested direct-to-visible-address fallback, a real intake route before activation. **Simplify:** internal route tokens may be invisible plumbing; recipients should never have to maintain a ticket number or keep a subject unchanged. **Reject:** solving missing replies by educating donors to use a special address, or directing them to a Messenger solely because threading failed. Preserve unmatched mail for staff correction instead of demanding the donor resend.

### 3. Thread matching does not grant recipient membership or CRM authority

**Intercom** uses In-Reply-To/References to find conversation context. A previously unseen sender may be threaded with a warning, but is not automatically enrolled as a participant receiving future replies. Its February 27, 2026 article also distinguishes an individual message's actual recipients from all conversation participants. This is a particularly useful distinction for forwarded or Bcc-disclosed messages. [Email threading](https://www.intercom.com/help/en/articles/7996715-email-threading).

**Zendesk** documents third-party email replies becoming private comments and not automatically becoming CCs. Other privacy outcomes depend on Reply versus Reply All and role/settings; these are product-specific and subtle. [When email replies become public or private comments](https://support.zendesk.com/hc/en-us/articles/4408842992538-Understanding-when-email-replies-become-public-or-private-comments).

**Adopt:** separate message author, actual message recipients, approved future recipient set, CRM association, and authenticated actor. **Reject:** a guessed/forwarded thread reference granting a history read or a send-to-all capability. Do not label an untrusted external message as a trusted staff internal note merely because a competitor does so; retain its actual authorship/type and gate its use. No automatic redistribution of a donor's incoming email to everyone ever associated with the conversation.

### 4. CRM context is valuable; copying a vendor's separate databases is not

**HubSpot Service Hub Professional/Enterprise**, July 6, 2026, presents related contact/company/deal context and ticket history beside the conversation. It autosaves private drafts and separates notes from replies. Advanced features need a Service Seat. [Create and respond to help-desk tickets](https://knowledge.hubspot.com/help-desk/create-respond-to-tickets-in-help-desk).

**Zoho Desk↔CRM** paid-plan integration can show CRM context in the ticket and offers one-way or two-way synchronization, defaulting to two-way. Matching a CRM secondary email can replace Desk's primary email. Its permission settings can differentiate CRM visibility/actions. These documents are undated in their accessible bodies. [Desk-side CRM integration](https://help.zoho.com/portal/en/kb/desk/integrations-and-marketplace/sales-and-marketing/articles/integrating-zoho-desk-with-zoho-crm), [CRM-side Desk integration](https://help.zoho.com/portal/en/kb/crm/integrations/zoho/zoho-desk/articles/zoho-desk-crm-integration).

**Adopt:** a small, relevant context panel, recognizable existing entity names, direct authorized navigation, a saved draft and restored queue position when returning. **Reject:** sync jobs between Core Support and Core CRM, a separate Support customer master, or importing Zoho's primary-email overwrite. These solve integration between separate products; Asym already has an authoritative record. The panel must read through the owning domain's permitted read model, not a privileged support-side copy.

### 5. Automatic CRM creation is a real competing pattern and should be rejected

**HubSpot** explicitly creates a Contact when inbound help-desk email comes from an address not already associated with a Contact. Forwarded email defaults to the original sender's Contact, with an administrator setting changing that behavior. Current canonical article accessed September 10, 2026. [Connect channels to help desk](https://knowledge.hubspot.com/help-desk/connect-channels-to-help-desk).

**CiviCRM** records sent email as recipient activities; its inbound processor files mail against participants and can create missing contacts. The `/latest/` manuals do not pin an installed release. [Email basics](https://docs.civicrm.org/user/en/latest/email/what-you-need-to-know/), [Inbound mail](https://docs.civicrm.org/sysadmin/en/latest/setup/civimail/inbound/).

**Adopt:** relevant interaction history through Core's one shared event/projection path. **Reject:** an unknown inbound sender creating a Party or changing the Party's preferred email. Preserve the address/name as observed intake facts. Ambiguous matching must be a supported state, not an error blocking normal help. Linking can improve staff context without becoming a prerequisite to replying.

### 6. Shared identity is not universal visibility

**Kustomer**, November 2024 documentation, offers object/action permission sets and examples that allow order visibility while preventing email-attribute editing. Its default top-level Customer permission can inherit access to conversations/custom objects unless overridden. Plan availability is delegated to pricing and was not independently established. [User access within Kustomer](https://help.kustomer.com/user-access-within-kustomer-rJ6oS_Bpr).

**HubSpot**, June 16, 2026, distinguishes CRM View/Edit/Delete/Communicate rights. It explicitly notes that a restricted pipeline is not a secrecy boundary: records may remain accessible through links, reports, associations, and search. [Limit access to HubSpot assets](https://knowledge.hubspot.com/account-security/limit-access-to-your-hubspot-assets).

**Adopt:** independently authorized context and actions. **Reject:** treating inbox membership, ticket assignment, a hidden sidebar, a disabled button, or a pipeline filter as data authorization. A support worker who can answer a receipt question does not thereby gain donation amount/history, banking information, a missionary's location, confidential care, or power to refund. The owning domain must authorize every action at execution time; stale context cannot authorize a command.

### 7. Recipient mistakes are more consequential than typing inefficiency

**Zoho Desk** distinguishes Reply from Reply All and includes secondary contacts in Reply All. Removing a secondary contact from CC does not remove their portal access to the whole ticket; the Secondary Contact association must change separately. [Actions in ticket conversations](https://help.zoho.com/portal/en/kb/desk/ticket-management/actions-in-tickets/articles/actions-in-ticket-conversation).

**HubSpot's New Help Desk Composer beta**, updated August 21, 2026 for Service Hub Professional/Enterprise, adds an @mentioned Contact as an email recipient. This is a documented beta behavior, not a claim about all HubSpot editors. [Updated reply editor](https://knowledge.hubspot.com/help-desk/use-the-updated-reply-editor-in-help-desk).

**Adopt:** clearly visible sender, To/CC, note/reply mode, attachment count, and effects before send. **Reject:** @mention, record link, assignment, macro expansion, or background CRM changes silently widening external recipients. Internal staff mentions belong in private collaboration and must not become email recipients. A changed address and new recipient need an intentional action, intelligible disclosure warning when context warrants it, and auditable attribution; ordinary unchanged replies should not incur a confirmation ritual.

### 8. Prevent contradictory replies and preserve the staff member's work

**Help Scout** stops a reply when a new customer reply or another staff reply/note was not seen by the composing user, preserving the paused reply in Needs Attention for review/edit/send/discard. Article updated April 23, 2025. The documentation proves the intended UI behavior, not server/database race freedom. [Collision detection](https://docs.helpscout.com/article/99-prevent-duplicate-replies-with-collision-detection).

**Adopt:** save drafts and a server-enforced freshness condition when creating a send intent; show the new information while retaining the draft. **Simplify:** presence indicators help but are not locks; changed typing/presence alone should not block send. **Reject:** automatic force-send after refresh or a lost draft. If an Undo affordance is adopted later, define it as cancellation before provider submission; neither a vendor keyboard shortcut nor an email label proves recall after delivery.

### 9. Failure visibility belongs in the staff workflow

**Help Scout**, April 15, 2026, distinguishes immediate failures in Needs Attention from later delivery-failure reports arriving by email; recipient-server error details vary. [Needs Attention and bounces](https://docs.helpscout.com/article/1442-troubleshooting-conversations-in-needs-attention-and-bounces).

**Kustomer's published August 7, 2026 fixes** acknowledge two concrete historic failure modes: a missing stored attachment left outbound email indefinitely Sending; an AI automation could reply after a conversation was spam-flagged if assignment happened first. August 5 notes also describe silently dropped spam-flagged internal replies and incomplete long-history display. These are vendor-reported repaired defects, not assertions of current vulnerabilities or incidence. [2026 release notes](https://help.kustomer.com/en_us/categories/2026-release-notes-BygKsnW9g), [Release notes](https://help.kustomer.com/en_us/categories/release-notes-S1gc_YS8yg).

**Adopt:** bounded pending/retrying, visible failed/uncertain/blocked outcomes, staff recovery, and send-time revalidation after classification or access changes. **Reject:** equating queued with sent, accepted by provider with read, closure with successful business action, or deleting the only recovery evidence to clean up a queue.

### 10. Attachments need an intentional channel policy, not a silent public-link fallback

**Kustomer**, August 2026, documents different per-file/total attachment limits by channel and warns that unsupported-channel inline-image shortcuts become public URLs. This is a documented product tradeoff; no exact provider limit is proposed for Asym. [Respond to conversations](https://help.kustomer.com/respond-to-a-conversation-HJ7isEHUZ).

**Adopt:** explicit file-size/count/type limits before sending or upload; file state visible beside the message; an accessible error that preserves the written request when the file cannot be accepted. **Reject:** automatically converting confidential attachments into public links to make email easier. Standard non-sensitive attachments can remain normal email attachments under the existing document/delivery rules; protected content uses the existing authorized domain surface. Neither a downloaded file nor an email already delivered can be remotely revoked by hiding it in Support Hub.

### 11. Nonprofit data is not just a generic “customer account”

**Neon CRM's March–April 2025 duplicate-management documentation** distinguishes merging duplicates from keeping distinct records, recording a relationship, or adding a household member. This is useful evidence that “same household/shared address” and “same person” are different decisions in donor software. Its email-link-authentication documentation warns that forwarding such links can disclose access. These source bodies were available through current indexed official content; direct access to the email-link page redirected to a login, so this is limited evidence, not a live feature/edition verification. [Duplicate account review](https://support.neonone.com/hc/en-us/articles/31957853946253-Check-for-Duplicate-Accounts-from-an-Account-Page), [Email-link authentication](https://support.neonone.com/hc/en-us/articles/4407399719437-Email-Link-Authentication).

**Adopt:** distinguish person, represented organization, household/relationship, requester endpoint, authenticated user, and assigned staff. **Reject:** merging people merely to deduplicate a support address, automatically granting church/household-wide conversation access, or introducing a new magic-link identity system in Support. Sensitive completion links must inherit the existing owner policy, scope, expiry, revocation, and reauthorization behavior.

## Independent usability evidence and its limits

The strongest directly relevant primary usability study found here is Kim Flaherty's September 11, 2016 NN/g report of **two diary studies covering 45 medium-complex customer journeys**. Participants reported interactions during tasks such as insurance shopping and opening accounts; this was not a randomized channel-comparison experiment. It attributes avoidable service contact to missing information, failed tasks, and perceived complexity, and identifies interruptions/channel switches as friction. It also reports frustration when human contact was difficult to find. It is **not** current nonprofit-specific channel-preference research, and cannot establish that every missionary or donor prefers email. [Minimize the need for customer service](https://www.nngroup.com/articles/customer-service-omnichannel-ux/). Use the principle of reducing re-entry and avoidable switching, not its old numerical channel distribution as a forecast.

A more recent Gartner release, August 19, 2024, summarizes a **December 2023 survey of 5,728 customers**. It reports that 43% of self-service failures involved difficulty finding relevant content. The release discloses sample size and collection period but not full questionnaire, sampling, weighting, or a nonprofit subgroup. Its relevance is narrow: do not force a knowledge-base/chatbot hurdle before ordinary support contact. It does **not** prove email is better than an optional portal, or justify rejecting useful existing self-service. The original full research is gated; the public newsroom content was available through search indexing while direct browsing was robots-restricted. [Gartner self-service resolution survey](https://www.gartner.com/en/newsroom/press-releases/2024-08-19-gartner-survey-finds-only-14-percent-of-customer-service-issues-are-fully-resolved-in-self-service).

Qualtrics XM Institute's **2026 channel-preference report** identifies a 2025 study of more than 20,000 consumers across 14 countries and eight interactions. Its accessible summary supplies neither the detailed outcomes nor an email-versus-portal comparison. Its 2025 report summary lists six compared channels without email. It is therefore an example of evidence **not sufficient** to claim that modern research proves D1 or that all donors prefer email. The founder's stated desired experience is the positive product reason. [2026 study summary](https://www.qualtrics.com/research/consumer-channel-preferences-2026/), [2025 study summary](https://www.qualtrics.com/research/consumer-channel-preferences-priorities-2025/).

A historic Zendesk community discussion reports confusing welcome/password emails when an organization wanted ordinary email support. It provides a plausible failure pattern and language users found alarming, not present-day verified behavior, incidence, or proof that Zendesk cannot be configured correctly. Current Zendesk configuration docs above are the factual authority. [End users receiving welcome emails](https://community.zendesk.com/support-7/end-users-receiving-welcome-emails-15731).

No representative modern study of Asym's actual donors, missionaries, field connectivity, language mix, or support volume was available. These cannot be fabricated. The founder supplies the product intent; source evidence supports its feasibility and identifies measurable risks. Before release, task observation with intended users should demonstrate the exact journeys below. This is required release proof, not an open product choice preventing D1 from being recorded.

WCAG 2.2 gives precise checks that support low friction: repeated Help is consistently located (3.2.6); information need not be re-entered in the same process absent an exception such as security (3.3.7); non-focus status updates are programmatically conveyed (4.1.3); touch targets satisfy 2.5.8's 24 CSS-pixel minimum or documented exceptions. These are source requirements, not claims that the current Core UI conforms. The W3C Understanding pages are informative explanations. [Consistent Help](https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html), [Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html), [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

## Material concerns and exact amendments

Severity reflects the consequence if the unsafe design ships. Likelihood is a reasoned conditional estimate, not measured Asym prevalence. “Common” means ordinary operation regularly exercises the path; it does not quantify failures.

| Concern                                                                   | What goes wrong and why it matters                                                                                                      | Severity / likelihood / evidence                                                                                                          | Effect on D1 and permanent requirement                                                                                                                                                                  |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account hoop reappears through welcome, verification, or portal templates | Donor thinks an account is required or receives a link instead of the answer; abandons an otherwise simple request.                     | Medium; likely if shared templates default to account onboarding; Zendesk configuration/feedback.                                         | Amend: “Ordinary email intake and replies shall not trigger support registration, an account invitation, or a mandatory portal transition.”                                                             |
| Tenant identity is send-only or misrouted                                 | Reply disappears in a personal mailbox or bounces; trusted branding hides a broken return path.                                         | High; plausible/common configuration path; Intercom/Freshdesk docs.                                                                       | Amend: “An activated support identity shall have a verified receiving route. Both ordinary Reply and a new email to the visible support address shall reach recoverable tenant intake.”                 |
| CRM match is treated as authorization                                     | Shared/spoofed/changed email gains another person's history or initiates a refund.                                                      | Critical; plausible on every email-driven identity shortcut; vendor distinctions plus direct reasoning.                                   | Amend: “Email match supplies a link candidate/context only; identity proof, representation, disclosure, and command permission remain separately established by the owner.”                             |
| Unknown sender must become a Party                                        | Spam and shared mailboxes pollute CRM; staff invent identities to answer.                                                               | High integrity / medium operational; likely if copying HubSpot/Civi intake.                                                               | Amend: “A conversation can proceed with an observed reply endpoint and no Party; Party creation requires an explicit authorized CRM command.”                                                           |
| Support replicates or edits CRM truth                                     | A sender correction overwrites a donor's preferred address or a support sync resurrects stale fields.                                   | High; plausible with copied integration model; Zoho documented overwrite.                                                                 | Amend: “Support owns associations and observed message endpoints, not authoritative Party fields; updates execute through the CRM domain and propagate through its existing projections.”               |
| Context panel bypasses domain permissions                                 | Assignment reveals giving/member-care data through sidebar, search, exports, caches, or error text.                                     | Critical; plausible without shared owner checks; HubSpot access limitations/Kustomer inheritance show why UI association is insufficient. | Amend: “Support access grants no additional rights to associated records; the same owner policy governs reads, searches, links, derived history, and commands.”                                         |
| Recipient set widens silently                                             | Internal mention/CC change leaks a reply or past quoted content.                                                                        | Critical; realistic staff action; HubSpot beta and Zoho membership distinction.                                                           | Amend: “External recipients change only through an explicit, visible, authorized recipient action; mentions, linking, assignment, and macros shall not silently add recipients.”                        |
| Header/thread token becomes a history capability                          | Forwarded or forged identifiers splice strangers into a conversation and future replies disclose protected context.                     | Critical; plausible hostile/forwarding path; Intercom external-sender model.                                                              | Amend: “Thread references locate context within the trusted tenant boundary; they do not add recipients, prove identity, or authorize disclosure. Unmatched or unauthorized input remains recoverable.” |
| Two staff send contradictory answers                                      | Presence indicators race; new donor message is ignored; staff lose a blocked draft.                                                     | High; common concurrency path; Help Scout behavior.                                                                                       | Amend: “The send intent requires a current reviewed conversation version and current recipients/access; conflict preserves draft and exposes the intervening change.”                                   |
| Delivery/status lies                                                      | Queue success shown as sent; bounce arrives after resolution; sensitive action merely requested shown completed.                        | High; ordinary provider failure path; Help Scout/Kustomer documented cases.                                                               | Amend: “Support resolution, owner-domain completion, send intent, provider acceptance, delivery failure, and recipient reading are distinct facts; unsupported success claims are forbidden.”           |
| Attachment fallback leaks or stalls                                       | Missing file holds send forever; confidential content becomes a public link.                                                            | High/Critical; realistic storage/channel edge; Kustomer docs/fixes.                                                                       | Amend: “Attachment failure shall produce an actionable recoverable state without discarding message text; confidentiality shall not be weakened to satisfy a channel limit.”                            |
| Automation runs after safety state changes                                | Intake marked quarantine/spam nevertheless sends acknowledgment/AI reply, creating loops or disclosure.                                 | High; plausible event race; Kustomer reported fix.                                                                                        | Amend: “Every external send re-evaluates current classification, recipient, tenant, and authorization gates; automated drafts confer no send authority.”                                                |
| Email-only misread as protected-email-only                                | Staff email documents/financial details because portal messaging was excluded.                                                          | Critical; plausible scope misreading; secure-link forwarding evidence and owner-boundary reasoning.                                       | Narrow: “D1 removes conversation login hoops; it does not relax secure document or consequential-action requirements.”                                                                                  |
| Every request becomes a platform ticket                                   | Unrelated CRM, finance, care, CMS and missionary work is forced into Support.                                                           | Medium/High maintainability; likely if taking Kustomer's platform organizing model wholesale.                                             | Narrow: “Support Hub handles support work and references authorized domain outcomes; other domains remain independently usable and authoritative.”                                                      |
| UX remains vague                                                          | Dense staff UI, transient error toasts, lost drafts, mandatory donor fields, and unexplained auth steps undermine the founder's intent. | Medium/High; likely unless falsifiable criteria are required; WCAG/NNg/vendor draft practices.                                            | Amend: use the acceptance journeys below as release evidence, not “best UX” as a subjective completion claim.                                                                                           |

## Minimal coherent UX and acceptance evidence

1. **Ordinary donor reply:** A person with no Asym account emails the activated tenant address. Staff respond; the person reads the useful answer and taps the mail client's Reply. No registration, password, CRM-link completion, ticket number, or portal visit is required. One coherent conversation records the accepted messages and one Phase 6 event per admitted recipient copy, without duplicate Support-hook/send-seam capture or a second CRM activity body.
2. **Existing Help entry point:** A signed-in donor opens Help from a receipt. Already-authorized record context accompanies intake without retyping donation identifiers. A confirmation says where the reply will arrive. The receipt owner still controls receipt access. No new My messages list appears by implication.
3. **Unknown sender:** Staff can read and answer a normal request while the sender remains unlinked. The panel says “Not linked” rather than suggesting a fabricated verified person. Staff can select a permitted existing Party or deliberately invoke authorized CRM creation.
4. **Ambiguous/shared address:** Two legitimate Parties share an email. The system neither arbitrarily picks one nor exposes both histories to the requester. Staff see only authorized candidates and matching basis. A general answer is still possible without forcing identity resolution.
5. **Protected action:** A refund/contact-change/document request opens the owning Asym action with permitted context and a return path. Required verification is explained in plain language, occurs only for that action, and preserves the support request/draft. Denial reveals no restricted record details. Resolving the conversation does not claim the action completed.
6. **Sender/recipient clarity:** The staff composer exposes tenant sender and current To/CC, clearly labels Reply versus Internal note, and presents attachment names/count. It remains understandable without color and using a screen reader. A keyboard shortcut follows the selected mode; changing mode cannot silently deliver a previously private note.
7. **No surprise recipients:** @mentioning staff in a note, adding a CRM association, reassigning, or applying a canned response does not create an external recipient. Adding a new external address shows the intended disclosure, including any quoted text/attachments. Incoming third-party email does not enroll future recipients.
8. **Corrected email:** Correcting a reply endpoint does not silently update CRM preferred email or retarget historical messages. Historical author/destination stays inspectable. An explicit authorized CRM action is separate if requested.
9. **Return to work:** Staff open permitted CRM context, complete or inspect an owner action, and return to the same conversation, draft, and queue position. Restricted context never appears in the DOM, network response, search result, preview, or export.
10. **Concurrent reply:** Two staff or a staff member and donor update the conversation during composition. A stale send is blocked before creating an unauthorized second send intent; the full draft remains, changes are visible, and reviewing permits a fresh decision. Lost WebSocket presence does not bypass the command guard.
11. **Honest failure:** Inject queue failure, provider rejection, ambiguous timeout, delayed bounce, missing attachment, and retrieval outage. Staff see a stable recoverable state in the conversation and work queue, not only a transient toast or indefinite spinner. A retry cannot duplicate the same logical effect.
12. **Reply continuity after resolution:** An ordinary later reply is accepted and visible for action even if the thread was resolved; terminal retention/deletion policy must determine whether this reopens or becomes a linked new conversation. No blanket “closed means reject” is implicit in D1.
13. **Client realism:** Test Gmail and Outlook web/mobile plus Apple Mail with plain text/HTML, changed subjects, multilingual quoted text, forwards, CC removal, shared addresses, display names that differ from email, and missing thread headers. Header parsing failure creates visible correction work, not an instruction to the donor to start over.
14. **Low bandwidth and mobile:** Useful email content remains readable with images disabled; it does not require a large branded template or tracking resources. On supported mobile widths, Help and the safe completion flow reflow without obstructing controls, retain input on recoverable failures, and show explicit saved/sending/failed states. Do not invent an offline synchronization subsystem absent a demonstrated requirement.
15. **Localization:** Preserve Unicode names and original message text. Do not force a first/last-name split or US-only address collection for basic help. Canned text follows Phase 17 approved language variants; staff can inspect before sending. Time-related promises show the tenant's actual supported calendar/time-zone meaning, not an inferred 24/7 service commitment.
16. **Accessibility:** Validate keyboard-only send/note/recipient/context navigation, visible focus, screen-reader labels and state announcements, zoom/reflow, and target-size exceptions. Tests must inspect actual rendered flows; automated accessibility scans alone do not demonstrate usable collaboration.
17. **Classification race:** Quarantine/spam/care/permission state changes between drafting and attempted send. Current policy blocks prohibited disclosure without losing permitted evidence. No auto-ack, macro, or AI route bypasses the same safety boundary.
18. **Human usability proof:** Intended donor/missionary and staff participants complete ordinary contact/reply, identify who they are talking to, recognize failed sending, distinguish note from reply, and complete a permitted CRM handoff without moderator rescue or avoidable repeated data. Treat any safety-critical recipient/mode misunderstanding as release-blocking; do not claim a numeric satisfaction uplift without a measured baseline.

## Synthesis: order and dependencies

Record D1 with the corrected scope/authority language now after Core conflict review. The parent should record which requirements are inherited and which are new D1 consequences; external recommendations must not silently amend a governing ADR.

Before design is considered complete, settle the authoritative intake/link/recipient/send contracts and use them to specify the simple donor and staff journeys. Prioritize a tenant-owned reliable return path, supported unlinked/ambiguous requester state, explicit recipients, private notes, reviewed send intent, one Phase 6 event per admitted recipient copy without duplicate Support-hook/send-seam capture or a second CRM activity body, and owner-domain action continuity. These are prerequisites for effortless email; they are not optional enterprise features.

Before activating a real domain, require the parent's database/service-role isolation proof, provider custody/replay tests, collision/idempotency proof, and the UX journeys above. A visually polished inbox cannot compensate for an unsafe sender/tenant join. No provider or auth configuration is authorized by this research stage.

Avoid a new portal, CRM synchronization, support identity database, generic automation platform, omnichannel suite, autonomous reply requirement, or a dashboard catalog solely because vendors have them. Existing Phase 17 macros and the communication/document/identity owners should supply sound shared capabilities. D1 does not require recreating Zendesk's status taxonomy or Kustomer's whole-product timeline.

The only monitoring proposed here concerns residual operation after required safeguards pass. Support operations owns **any unresolved delivery-failure or ambiguous-send item** and must assign a recovery action before deliberately resolving its conversation. Tenant inbox administration owns **any failed activated-route health check** and must pause affected outbound use/activation and restore routing; the check cadence and provider deadline belong to the provider acceptance contract, not an invented universal number. Product/UX owns **any observed safety-critical recipient/note misunderstanding in release usability tests**; threshold is one, response is fix/retest before release. These are explicit triggers, not permission to ship missing safety controls.

## Limits and no-claim boundaries

This review establishes public documented workflows, documented limitations, a few vendor-reported repaired failure patterns, and testable judgments. It does not establish actual Asym source behavior, database isolation, deployed RLS, production traffic scale, preferred languages, provider account retention, or tested vendor performance. Core review must supply those facts. In particular, no vendor documentation proves exactly-once delivery, end-recipient reading, safe global email normalization, automatic authority to represent a church, or a universal donor preference for email.

The current decision remains acceptable even with those unmeasured operating characteristics because it chooses the requester experience and preserves existing owner controls. Claims that implementation is complete or production-ready would be unsupported until the mapped tests and Core-specific safeguards pass.

---

# Local UX evidence and executed probes

Reviewed current source at `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd` in the
prepared WSL worktree. This supplements the three independent evidence reviews.
No browser, rendered-email, real-mail, real-database or screen-reader session was
run. In particular, static class names do not prove an actual contrast ratio or
touch-target conformance failure.

- `apps/admin/features/support-hub/components/detail/composer/use-conversation-composer.ts:107-112`
  clears local drafts and attachment metadata on conversation change. No unsaved
  navigation guard was found in the inspected SupportInbox/inbox-state path.
  Permanent requirement: scoped recoverable drafts and preserved work across
  permitted CRM navigation; test return to the exact conversation and queue.
- The same hook `:199-208` announces Reply sent and resets after the queued-row
  mutation. `hooks/use-support-failure-recovery.tsx:44-60` keeps only the last
  failure in React memory. Persistent delivery/recovery state must live behind
  the owning command, not solely in a toast or last-error banner.
- `ConversationDetail.tsx:116-125` maps missing data to Not found and supplies
  the assignee as the composer agent. The hook uses the current-agent fallback
  as author but the supplied agent for signatures. Actor, assignee and approved
  display signature must be independently correct; API author spoofing is
  separately confirmed in the database review.
- `AttachmentChips.tsx:31-41` stages filename/type/size and `local:<filename>`;
  it does not upload bytes. `:80-86` has a named remove control, which is a good
  accessibility foundation, but layout needs rendered target-size proof.
- `ConversationCrmLinks.tsx:67-127` builds CRM/contribution query links and
  email-search fallback. That is navigation precedent, not proof of authorized
  context panels, current owner commands, supported query parameters, draft
  recovery or return-position continuity.
- `packages/database/query-keys.ts:47-75` does not include tenant or actor in
  Support keys. `providers/query-client.ts:97-106` reuses a browser singleton.
  No clearing was found in the scoped admin/auth/database search. This is a
  scope-transition risk, not a demonstrated cross-session leak; the complete
  shell must be exercised before making that claim.
- `ConversationComposer.tsx:107,221`, `ConversationCrmLinks.tsx:55`, and
  `ComposerActions.tsx:93` use local white/zinc/amber styling, despite the current
  shared semantic-token policy. The permanent fix is composition of existing
  base-maia/Base UI and tokens, not a new design system. Existing tabs, explicit
  reply/note labels, busy-state attribute, mobile Sheet and focus-return helper
  are useful precedents, not full accessibility proof.
- `lib/macro-runner.ts:71,109-129` defaults to continuing after failure.
  `send_canned_response` inserts content instead of sending. Preserve human
  review, expose actual effects, and never mark a dependent outcome complete
  when its prerequisite failed. Current docs' macro examples are not authority
  to change money or send a replacement official document.

## Executed evidence

The isolated probe transpiled the actual current serializer and its merge helper
with the installed TypeScript compiler, changing only the module import path.
Inputs were synthetic. It did not call a provider, read credentials, connect to
a database, or render/execute HTML. Results:

| Observation                                                        | Result |
| ------------------------------------------------------------------ | ------ |
| Ordinary Unicode text preserved                                    | Yes    |
| A merge-variable value containing an inert HTML tag becomes markup | Yes    |
| A `javascript:void(0)` link scheme remains in serializer output    | Yes    |
| An unuploaded `local:` attachment reference passes through         | Yes    |

These demonstrate that this helper is not a qualified security/delivery boundary.
They do not demonstrate exploitable XSS in a final renderer or an actual unsafe
email send. The permanent prevention is the Phase 17 preparation boundary's
context-aware rendering/URL validation plus the qualified attachment owner.

Four existing suites were run with Vitest 4.1.4 through Node, a temporary config
with `envDir:false`, and a setup that rejects `fetch`:
`composer-payload`, `merge-variables`, `timeline-merge`, `business-hours`.
**4 files, 21 tests passed.** This is a pure-helper baseline, not the normal full
repository gate. The result coexists with the counterexamples because the
existing cases do not prove those security or full workflow guarantees.

WCAG 2.2 and Core's accessibility rulebook supply testable UI requirements.
The W3C Understanding pages are informative explanations: redundant entry,
status messages, target size and reflow need actual rendered journey proof.
NN/g's 2016 diary research supports avoiding unnecessary channel switches and
hard-to-find help, but does not establish present-day nonprofit email preference.
No actual donor or staff usability participants were observed in this review.
