# D17 independent Core data and CRM review

**Independent review input:** The [reconciled D17 decision](phase26-d17-adversarial-review.md) and [final UX](phase26-d17-retention-ux.md) govern adopted amendments. Calendar-unit, pause and other candidate alternatives below are preserved review history, not competing final requirements. D17 amendments remain proposed pending ratification.

11 September 2026. Reviewer: d17_data_crm. **Recommendation: Accept A with required amendments.** These are proposed D17 corrections for root synthesis; D1–D16 remain ratified. No product code, schema, credentials, provider, live database or external state was changed. Only this review was written.

## Evidence and scope

Verified execution in `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`; HEAD `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Read root/API/database/Supabase instructions, backend and data-access rules, OpenSpec project/platform/CRM context, canonical domain-modeling and Supabase/Postgres guidance, the current Q17 package, D9 and D16 full clauses and D10–D15 relevant ratified ADRs. The root performs the live source/PR refresh and other independent reviews.

Sources below are current source facts at that HEAD, accepted intention, or explicitly identified product judgments. Static inspection is not deployed database or runtime proof. No artificial model test was added: current code has no trustworthy retention model to test. Existing D16 helper probes remain bounded historical evidence, not expiry-engine tests.

### Current source facts that change the design

1. `supabase/migrations/20260515025814_support_hub_core_modules.sql:198–249` stores conversation subject, observed external email/name, unconstrained JSON `contact_ref`, status, response counters/times and mutable `resolved_at`/`updated_at` together. Ordinary content expiry cannot assume that all non-body columns are safe history.
2. The same migration `:286–339` stores message `author`, `body`, `email_headers` JSON, inbound/send-log pointers and attachment `filename`/`url`; `:476–495` stores free-form audit body/metadata. Audit is not inherently free of content.
3. In that migration `:228–231`, inbox deletion cascades conversation deletion; `:303–306`, `:458–461`, `:487–490` cascade messages, assignment history and audit from conversation deletion. Reusing parent deletion as expiry would destroy the very shell, route and correction/retention evidence needed afterward. Later searched Support migrations do not redefine these tables; live applied-state verification remains required.
4. `packages/api/src/admin/support-hub/adapter/supabase.ts:837–846` rewrites `resolved_at` on every Resolved command, including a repeat; `:643–650` clears it on inbound reopening. `:632–666` bumps general message/update state; `:870–899` updates the conversation even for label commands. These mutable fields are not retention clocks.
5. `.../supabase.ts:1371–1409` uses `support_messages.email_headers->messageId` for threaded lookup, then sender+normalized subject on non-Resolved conversations. Removing the raw header blob without a qualified correlation replacement changes routing; retaining that whole blob forever to keep threading is also unacceptable. Sender+subject is not a safe preservation or identity authority.
6. `.../supabase.ts:1338–1355` copies incoming text/HTML and From/To/Cc/Bcc/subject into the Support message. `supabase/migrations/20260402090000_resend_email_foundation_backfill.sql:97–112` separately persists inbound payload/parsed text/HTML/subject/addresses. D16 already requires a complete inventory; D17 must apply it to whole-content expiry, including stale intake replay.
7. `.../supabase.ts:433–470,525–548` exposes author/body/header/contact snapshots directly from mapped rows. There is no inspected projection contract distinguishing expired content from empty or failed content. The list `:669–724` loads at most 2,000 rows, then searches current subject/name/email in memory. Neither this list nor its count can be reused as a complete retention preview or discovery scan.
8. Initial Support table grants/policies `20260515025814_support_hub_core_modules.sql:546–573` grant ordinary authenticated staff broad SELECT/INSERT/UPDATE/DELETE under tenant/staff membership. A new settings screen/API permission would not close direct mutation routes or protect the resulting content state. D9/D14/D16 already require stricter owner contracts. Actual deployment tests remain mandatory.
9. `20260426100000_resend_email_rls_grants.sql:4–31` supersedes the older Resend foundation's disabled-RLS posture with RLS and revoked anon/authenticated access. Do **not** report the initial disabled RLS as the current source posture. Service-role paths still need equivalent owner checks.
10. `packages/api/src/admin/crm/detail/service.ts:144–179,510–516` has a field called `support` built from donations, funds, missionaries and pledges. It is financial support, not the Support Hub conversation summary. D9's different Overview/Communications integration is intended behavior; current naming cannot be used as proof of an already-working expiry-aware CRM surface.

### Governing facts and conflicts to resolve explicitly

- Platform ADR0001 and API instructions: Asym Postgres owns Party identity, relationships, CRM notes/tasks and finance truth. Twenty is retired; no Support–CRM sync service is appropriate.
- D9 R03/R07–R13: Support owns peer relevance, qualified P6 correspondence is independent, both domains authorize projections before paging/counting, one row per canonical conversation, no copied transcript/CRM note or link-generated Activity. It already anticipates owner retention and tombstones.
- D10: original source identity survives merge and current-state Undo; topology is not content authority, and persistent Undo does not authorize unlimited raw retention. Source content may expire without erasing necessary structural evidence.
- D11: independent owner work can outlive Support, but unresolved Support promises/review obligations cannot be treated as finished merely because an owner task exists or says Done. A content-specific continuing need must be qualified, not inferred from every link.
- D14: immutable source/coverage/timing evidence owns reply reports. Redaction/expiry must not remove misses, create success, change receipt times or reset denominator history. Event/report metadata itself remains classified and subject to its own permitted lifetime.
- D15/D16: future following and newer content can continue; old previews/destinations/unsent dispatch cannot ignore a restriction. Routine successful cleanup emits no ordinary follow/requester email.
- ADR0031 `:18–50`: P6 events retain no personalized body or ordinary personalized subject; the separate recent sent copy is encrypted and recipient-specific, subordinate to source restrictions, and never a retry payload, searchable archive or legal repository. Its 7/30/Off durations are not Support retention.
- P6 PRD `:223–226`: the original durable `recipient_email` parenthetical is explicitly superseded for new Phase17-governed events. New durable events retain safe authority references, not raw unresolved destination addresses. D17 must cite the supersession, not the earlier parenthetical.
- P6 `:172–173`: retained official facts and communication PII have different lifetimes/owners. Its older numeric official-retention assertion is repository policy direction, not independently verified law applicable to every Support request.
- P6 `:300`: generic retention/DSAR job remains reserved. D17 needs an explicit narrow Support eligibility producer using D16 cleanup owner contracts, not a silently introduced whole-platform retention engine.
- Phase9 PRD `:398–437,730–757`: existing CRM shell and separately owned note/audit structures. A Support expiry event must not reuse free-form CRM before/after audit snapshots to store expired content.

## Exact retained/expired/independent inventory

This is a logical owner/field-class contract. It deliberately does not freeze additional physical table names.

| Data class                                                                                                                              | Ordinary D17 outcome                                                                                                                                                                                                                        | Authority and continuing limitations                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Original incoming/outgoing Support body and published internal-note body                                                                | Expire under approved finished-work policy; deny active reads at the effective expiry even while physical cleanup remains pending.                                                                                                          | Support original source. Text, HTML, rich-text JSON and equivalent original representations share the source lifetime.                                                                                                                                                                                                                                                     |
| Subject, staff-written conversation title, excerpt/summary, search terms, source-specific free-form labels/comments and unsafe filename | Treat as content. Remove the expired-source text or replace display with a typed neutral marker. An independently authored current title cannot be silently erased by another original's expiry; its own generation/class must be governed. | No blanket metadata-forever exception. Ordinary whole-content expiry must name the title/content classes explicitly; source redaction remains selective under D16.                                                                                                                                                                                                         |
| Support-owned attachments, inline images and derived previews/extracted text                                                            | Expire source occurrences, remove active download grants and clean actual bytes under D16.                                                                                                                                                  | Removing one occurrence cannot destroy a valid separately owned shared object. A retained official artifact does not make the obsolete Support delivery copy permanent.                                                                                                                                                                                                    |
| Raw intake payload, parsed intake text/HTML, MIME, provider content and obsolete prepared/preview material                              | Restrict and dispose equivalent expired source representations through their actual owner.                                                                                                                                                  | Earlier independent ceilings still apply; current policy cannot extend ADR0032 prepared bytes or ADR0031 recent copy. Provider/backups require actual scoped contract evidence.                                                                                                                                                                                            |
| Original IDs, opaque source lineage, work/correction/expiry control revisions and a minimal original/message tombstone                  | Retain only for justified routing, current work, replay/restore prevention, audit and reporting horizons.                                                                                                                                   | Current permissions still apply. Do not display hidden-source existence merely because a tombstone exists. Tombstones are neither anonymous nor permanent by default.                                                                                                                                                                                                      |
| P6 communication facts, relevant reply-time/coverage facts, attributable Support work transitions                                       | Keep permitted body-free factual evidence under the owning class. Do not count expiry as a communication, human reply or successful resolution.                                                                                             | Preserve actual uncertainty/outcomes and original occurrence times. A persisted denormalized unsafe title/endpoint is not allowed because the event is called body-free.                                                                                                                                                                                                   |
| Message transport correlation and intake deduplication identifiers                                                                      | Retain the narrow qualified correlation/control needed for the allowed replay/routing horizon, separated from raw display headers.                                                                                                          | Protect tenant/source scope; exact ID equality does not authenticate sender or authorize access. Prefer existing qualified opaque route/correlation contract; no new global email identity store. If the required mapping is no longer lawfully retained, treat a genuinely new message as new unlinked input under normal intake, never recreate a Party from old scraps. |
| Observed sender/recipient addresses, names, author snapshots and contact-point revisions                                                | Never pretend these are harmless metadata. Retain/display only what the communication/identity owner's specific historical evidence policy allows; expire/suppress obsolete source copies accordingly.                                      | D9 preserves factual attribution independently of related context; D17 must not rewrite actor/recipient history or silently defeat an actual evidence obligation. Current CRM Party data is resolved from its owner. Expired endpoint data cannot remain as pseudo-anonymous `donor:email` identity.                                                                       |
| D9 explicit Party relevance, D10 merge structure and D11/D12 source/work references                                                     | Preserve their independently valid meanings and current owner-controlled lifecycle, using minimal references; they do not copy the body or grant a hold.                                                                                    | CRM correspondence discovery continues only while its qualified source/identity basis remains retained and authorized. Privacy-driven removal of that basis withdraws the row rather than fabricating a replacement.                                                                                                                                                       |
| CRM Party, actual donor/household/org relationships, CRM notes, giving/receipt/refund/recurring facts, official records                 | Unchanged by routine Support expiration. Owner-controlled retention/deletion still governs.                                                                                                                                                 | A known copied Support excerpt in an owner note remains a managed/independent-copy classification problem to resolve, not blanket permission to purge or ignore it. A task's factual result can remain while its obsolete Support quote expires.                                                                                                                           |
| Logs, traces, generated exports, notifications, AI embeddings/summaries, hosted downloads                                               | No content-bearing shadow archive. Current source restriction gates ongoing use and owner cleanup corrects known copies.                                                                                                                    | Independent already downloaded/sent copies are not recallable. No AI system or new feature is required by D17.                                                                                                                                                                                                                                                             |

**Key recommended clarification:** “Retain history” means retain the specific, classified, permitted facts and control identities above. It never means preserve every row, `SELECT *`, JSON blob, filename, address, subject or historical screenshot indefinitely.

## Required corrections and exact language

Each concern is material. Severity/likelihood are design judgments, not production incident rates.

### F01 — Shell deletion erases required evidence

**High; plausible if existing DELETE/cascade is reused.** Deleting the conversation to expire content also cascades messages, assignments and audit. This would break CRM history, route correlation, D10 Undo and D16 replay barriers. It **changes implementation**, not selection A.

**Exact clause:** “Routine expiry retires a bounded original-source content generation, not the conversation, CRM Party, actual communication event or owner business record. Retain only independently permitted shell/control facts. Referential delete behavior must prevent parent, inbox or tenant offboarding operations from accidentally discarding still-required cleanup, custody, restriction or restore evidence; use the qualified owner retirement path. Tenant deletion may eventually retire the shell only after its own complete obligations are satisfied.”

### F02 — Unsafe metadata survives the body purge

**High; likely without explicit inventory.** Current schema embeds private content in subjects, filenames, participant IDs/snapshots, headers and free-form audit. Cosmetic “body removed” leaves searchable sensitive text. It **widens required content inventory** proportionately.

**Exact clause:** “The expiry class includes source-owned bodies and equivalent content-bearing text, titles, subjects, filenames, previews, extracted text and derived summaries. A typed allow-list defines retained factual fields; unknown/free-form values are not promoted into durable history. Identity/envelope facts follow their separate qualified owner policy. No expired content is saved in a replacement CRM note, audit diff, display snapshot or support-safe recent copy.”

### F03 — False or fragmented CRM presentation

**High; plausible.** Whole-row deletion could erase a legitimate interaction; copying a retention marker into Activity could make a false new contact. A historical CRM note could become a second archive. It **changes CRM projection requirements**.

**Exact clause:** “CRM Overview/Communications and canonical Support detail read the same current source-expiry state. The All/Resolved conversation row remains only where D9's qualified relevance or correspondence basis and current joint authorization survive. Render a safe title/reference and Content expired under your retention policy, with existing occurrence/outcome facts and no body reconstruction. Expiry creates no ordinary Activity communication, last-contact update, unread event or fabricated recipient. If all discovery authority expires or is retracted, remove the normal row without hidden-count leakage. The financial support summary stays unchanged.”

### F04 — Preserved endpoints become a forbidden new P6 archive

**High; plausible given old source/API shapes.** D9 historical attribution could be misread as a raw-address-forever instruction, or older P6 parenthetical copied despite its dated supersession. It **clarifies existing preservation wording**, preserving historical truth while narrowing unsafe storage.

**Exact clause:** “D9's preservation of observed source evidence is subject to the identity/communication retention and erasure policy. It does not authorize new durable raw addresses in P6 or indefinite display snapshots. Preserve qualified authority/attribution and correction provenance under the current P6 contract; suppress or dispose obsolete personal fields under their owner. Never rematch expired messages against today's email to recreate historical correspondence.”

### F05 — Lost routes or resurrection on late inbound/replay

**High; plausible.** Current threading depends on raw message headers. Expiry either destroys routing or keeps too much data; retry intake can recreate disposed body. It **changes source contract/acceptance proof**.

**Exact clause:** “Separate the approved minimal tenant/source routing and dedupe control from readable email payload. A verified duplicate of an expired original remains duplicate and cannot rehydrate bytes. A genuinely new admitted message is retained as a new original contribution under current intake and future retention policy, routes through the current qualified original/root when still authorized, and never restores old content. Missing/revoked lawful correlation takes the normal new-input path without identity invention; matching email/subject alone grants no linkage or access.”

Avoid prematurely freezing cryptography: a raw RFC Message-ID may itself contain personal text. The qualified contract should choose a minimal opaque or appropriately protected equality representation with a key/retention lifecycle if needed, rather than a new exposed text index.

### F06 — Current status/update fields are brittle clocks

**High; likely if implementation uses available columns.** Repeated Resolve and metadata updates change current timestamps. Merge, Undo, new reply or old webhook can extend retention unexpectedly. It **changes expiry computation**.

**Exact clause:** “Expiry eligibility derives from durable admitted work-ending/content-generation evidence and the effective policy, not generic updated_at, viewing, labels, assignment, redaction, linking or repeated identical Resolve. Source occurrence, ingestion, work-end and policy-effective times remain separate. Where legacy evidence cannot establish the selected clock, do not invent a past work-end; use an explicitly disclosed qualified migration baseline or owner review with bounded resolution responsibility.”

The root's lifecycle review should settle exact epoch/reopening/held-work arithmetic. Do not claim current `resolved_at` proves it.

### F07 — Broad grants bypass administrator intent

**Critical; plausible using current broad policies.** An authenticated staff SQL/API caller could modify content/policy/scope/audit without the UI capability. A service worker can bypass RLS entirely. It **requires structural safeguards**.

**Exact clause:** “Policy revision/activation, eligibility control, expiry receipt and cleanup state are server-command owned. Deny ordinary direct raw DML/SELECT where it would bypass current owner projections or reveal protected scope. Derive tenant/actor/approval/effect time from trusted context. Composite same-tenant FKs and uniqueness bind source, policy version, content generation and operation; non-null required references and valid-state CHECKs reject impossible combinations. Expose only declared mutable fields. Qualified RPC/service-role paths enforce the same source/policy/hold checks; safe execution grants and function search_path are required. Both USING and WITH CHECK are tested for allowed updates and attempts to turn permitted rows into forbidden states.”

Current PostgreSQL docs explain table-owner/BYPASSRLS exceptions and separate row/column privileges; referential constraints have their own behavior. Do not equate RLS enabled with complete authorization. [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

### F08 — Preview scan is incomplete or authorizes hidden scope

**High; likely if current list reused.** Its 2,000-row cap before filtering makes count/impact incomplete. An administrator's inability to read restricted content must not be bypassed by previews. It **changes policy UX data contract**.

**Exact clause:** “Policy impact is computed through a bounded server-owned query over the actual policy scope, with units, calculation time, policy version and explicitly named approximate or complete status. Counts must not use the ordinary capped inbox list. Qualified aggregate access may differ from content-read access; never reveal restricted content through sample rows or drill-down. Activation requires clear authority over the declared complete scope, not access to every content byte. A changing count alone is not a scope change, but changed filters/policy/effective time or omitted legacy classes require review again.”

### F09 — Reporting quietly improves after destruction

**High; plausible.** Dropping message rows or recomputing reply durations from surviving body records hides old misses, changes cohorts and invents “no data.” It **changes report custody/verification**.

**Exact clause:** “Maintain D14's permitted source/timing/coverage/uncertainty facts independently of readable content. Expiry does not fulfill a target, erase a miss or change an earlier actual result. Report denominators retain precise authorized units; if an owning retention/erasure rule removes factual evidence, label resulting availability/coverage honestly rather than silently treating it as success. Do not keep otherwise forbidden personal data merely to preserve a metric.”

### F10 — A link becomes either accidental deletion permission or forever hold

**High; plausible.** A related conversation/task still needs source context, while another merely shares a Party. Deleting both is wrong; keeping all related history forever is also wrong. It **narrows eligibility interpretation**.

**Exact clause:** “Before source expiry, evaluate only explicit source-scoped ongoing-purpose interests admitted by the qualified work/records owner. A task link, Party link, merge edge, citation, follower or file reuse alone is neither a preservation mandate nor proof that the source has finished. A valid continuing need names owner, source scope, basis and review/release responsibility; it retains no broader CRM or financial context. Expiry does not complete or cancel independent work.”

### F11 — Cross-owner shared bytes and snapshots defeat clean disposal

**High; plausible.** The same underlying receipt bytes could be owned by Finance and attached to Support; blindly deleting storage damages official records, but pointing Support to a retained copy bypasses its own expiry. It **changes file/reference boundaries**.

**Exact clause:** “End the expired Support attachment occurrence and every source-authorized download/preview grant, then dispose physical bytes only when no separately valid owner reference requires them. Continued existence in an official owner store does not permit Support to re-expose those bytes through an expired occurrence; staff must navigate to that owner and reauthorize there. Managed derivative snapshots follow their source restriction.”

### F12 — Unbounded lifetime of tombstones and audit

**Medium to High; plausible.** A minimal shell can still identify a donor or sensitive relationship and grow forever. On the other hand, deleting a replay barrier too early resurrects data from an old backup. It **changes the kept-data qualification**.

**Exact clause:** “Every retained class, including body-free events, Party associations, actor references, routing/dedupe control and expiry tombstones, has an owner, permitted purpose, actual horizon and disposal/anonymization outcome. Retain replay/restore barriers outside the maximum qualified replay/restore horizon of the underlying data and enforce them before release. They are not a public history archive or an indefinite backup exception. A source may become inaccessible without destroying still-required service-only barrier evidence.”

### F13 — Expired reply context becomes an unauthorized address book

**High; plausible.** D2 R03 requires a specific admitted external message and its qualified response/To/Cc audience. After disposing that source audience, an implementation could silently substitute today's CRM email or old cached recipients so a reply button still works. This would misaddress mail or expose content. It **changes the expired-message UX and send prerequisites**.

**Exact clause:** “An expired message with no current qualified reply-audience evidence cannot initialize Reply or Reply all from a retained shell, CRM email, historic participant union or cached draft. Explain that its reply context is no longer available. A genuinely new admitted incoming message provides its own current audience under D2; deliberate new outbound conversation follows D12 and current reviewed recipient authority. Existing retained drafts remain subject to D16 source/egress invalidation and cannot reconstruct expired quotes or destinations.”

D1 R03 requires durable accepted-source identity and a recoverable disposition, not perpetual readable text. D1 R04 explicitly rejects arbitrary-first-match headers and sender-plus-subject merging; ambiguous or unmatched mail remains serviceable through safe staff resolution. The narrow retained correlation design must preserve these exact boundaries.

## Narrow data model requirements

- At most one effective default policy revision for a tenant/scope at an instant; a revision is immutable after activation. Policy labels are display text, not destructive authority.
- Current policy pointer, version/effective-time evidence and prior activation receipt have tenant-aware references. If the root chooses inbox exceptions, assignment/move cannot select a more lenient new lifetime accidentally; precedence and the source binding must be explicit. Do not add arbitrary per-message free-form rules.
- Source content generation and expiry-effect identity are stable; current root, Party merge and inbox routing are derived current context. Bind effects to `(tenant, original source, content generation, disposition kind)` or an equivalent business identity so changing a policy version cannot produce duplicate destructive effects.
- At one transaction boundary: current eligible content generation + policy/hold/ongoing-purpose revisions → active source restriction + expiry receipt/audit + identifier-only cleanup obligations. Physical worker calls remain outside the transaction.
- A current-source view can return no readable content for expired/unknown/unauthorized generations even when purge lags. Never depend on body-column nullability, cache TTL or eventual event delivery alone.
- Do not represent Expired as a fifth work status. It is content availability; work status and independent business action outcomes remain unchanged.
- Positive finite duration, no negative/NaN/overflow values; explicit units and timezone/effective-time arithmetic. Root should settle exact duration units and supported bounds using current product judgment, without importing a vendor legal period.
- Efficient queries use tenant/scope and due-time/current-generation indexes and keyset progress. A job cursor is not an authorization snapshot; recheck authoritative policy/hold/work scope at effect. No full body hydration or recursive CRM graph traversal for scheduling.
- No money columns, floating point conversions or giving mutations are introduced. Verify this exclusion rather than fabricate new money constraints.

## Independently falsifiable proof requirements

1. A qualifying body, subject, file filename/URL, inline preview and parsed intake copy all become unavailable through Support and CRM at expiry; permitted P6 event/timing/outcome and original shell facts remain accurate.
2. A financial receipt attached to Support remains available only from its independently authorized owner; the expired Support URL cannot fetch it. Gift, refund, pledge, donor/Party and relationship rows stay unchanged.
3. D9 relevance-only and actual-correspondence rows remain distinct; overlap yields one row; unlink/corrected attribution after expiry updates discovery without copying body or emitting contact.
4. Expiring a composed D10 original preserves current merge/Undo structural behavior; Undo never restores payload. D12 citations and D11 task results show source availability accurately and do not gain access.
5. Repeat Resolve, label toggle, assignment, view, redaction, merge/Undo and transport replay never reset the accepted clock. Genuine reopen/new work follows the exact epoch rule; late duplicate intake cannot recreate content.
6. Late real reply to a retained qualified route enters usable current handling with old content visibly unavailable and no new CRM Party; unavailable lawful correlation follows ordinary intake safely.
7. Policy shortening/extension, hold, current work transition, expiry worker and attachment claim race produce one ordered result; old jobs and stale updates cannot undo it.
8. Cross-tenant IDs, same-tenant restricted Party/source, direct raw SQL/Data API updates, security-definer RPC and service-role jobs cannot bypass policy/source/hold or disclose restricted preview counts.
9. A dataset larger than the current 2,000-row UI cap gets a truthful complete/specified-approximate policy preview and bounded expiry scheduling; metric cohorts do not depend on surviving bodies.
10. Backup/old code/current source read, replay and search/export regeneration keep expired bytes unavailable. Rollback does not recreate forbidden state or delete pending cleanup/barriers.
11. Logs and audits contain no removed bodies, filenames, headers or duplicated source text; actor/reference retention honors its qualified owner policy.
12. Expiry produces no requester/follower email, new unread/last-contact event or target success, while genuine newly admitted later messages still follow normal D13/D14/D15 behavior.
13. Old-message Reply/Reply all cannot recover expired audience from current CRM or cached source values; a real new message and deliberate D12 outgoing conversation still complete their authorized ordinary journeys.

These are release requirements, not passed tests. No DB, RLS, storage, provider, browser, load or backup restore test was performed in this review.

## Synthesis for the root

A is the strongest default when the product promises a coherent active work history and automatic predictable cleanup. The permanent fix is one narrow Support retention eligibility layer feeding the already-ratified D16 restriction/cleanup boundaries. The crucial prerequisites are: explicit kept-data inventory; source content generation/clock; governed policy/ongoing-purpose activation; safe body-independent route/history; current-source read/egress; complete owner cleanup; then a quiet policy UI and truthful CRM presentation.

Do not keep the whole row because “history is valuable,” hard-delete the whole row because “retention means delete,” or copy the conversation into a CRM note before disposal. Those three tempting paths all defeat the selected model.
