# D35 — Independent data, lifecycle and authorization review

**14 September 2026 · Disposition: Accept with required amendments.** The founder selected **A — Authors can edit their own internal notes, with visible history**. D1–D34 and the D29 refresh remain ratified. This document proposes the data safeguards for D35; it does not mark them ratified, create a formal specification, implement a migration or qualify production behavior.

The smallest robust solution is **one Support-owned note identity, immutable original human-author/publication provenance, ordinary immutable content revisions, one current revision reference and one conditional server save with a durable result receipt**. Earlier content remains subject to current source authorization, D16 redaction and D17 expiry. Do not add an editor collaboration service, generic history platform, separate CRM note, ordinary delete/restore workflow or second notification engine.

## Evidence and current-source findings

Verified WSL cwd `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10` and HEAD **`7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`**. [Exact source evidence](phase26-d35-data-source-evidence.json) records **19 Git source files**, all matching the working files, and **14 accepted session sources**. Root owns the independent remote/PR refresh. No live SQL, provider operation, production row, secret, package installation or runtime experiment was used.

Read the scoped API/database/Supabase and backend rules, canonical PostgreSQL performance skill, Supabase skill and current official documentation. The skill's blanket missing-WITH-CHECK warning is too broad; the actual PostgreSQL/Supabase fallback semantics below control this review. Grooming authorization overrides implementation-oriented skill steps: no database was modified.

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Actual observation; consequence                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S01** [Support SQL:286–311](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql#L286)                                                                                                                                                                                                                                                                                                                                                                                                                 | Note/message and conversation IDs are **TEXT**, tenant is UUID. Author/body are JSONB objects, with no trusted author FK, content revision head or structural note/non-deliverable check. An arbitrary UUID migration or JSON-author comparison is not the permanent fix.  |
| **S01** [staff identity columns:42–63](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql#L42)                                                                                                                                                                                                                                                                                                                                                                                                         | Support agents have nullable profile/user references, mutable names/emails and a nonunique user index. Today’s agent/email association does not prove who originally authored a note.                                                                                      |
| **S01** [grants/policies:545–572](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql#L545)                                                                                                                                                                                                                                                                                                                                                                                                             | The migration grants authenticated CRUD/service-role all access to listed tables and applies broad tenant/staff policies. UPDATE has explicit old/new checks, but they do not establish original-author or protected-column rules. This is not a live final-schema audit.  |
| **S02/S03** [notes route:11–24](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/app/api/admin/support/conversations/%5Bid%5D/notes/route.ts#L11), [creation schema:58–63](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/schemas.ts#L58)                                                                                                                                                                                                                                         | The route checks broad Support access and URL/body conversation equality, then forwards the supplied authorAgentId. It does not derive the note author from current authenticated context. This is a concrete source-level attribution gap; no live exploit is claimed.    |
| **S04/S05** [adapter interface:231–234](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/types.ts#L231), [addPrivateNote:941–963](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L941)                                                                                                                                                                                                                                        | Current API offers creation, not qualified edit/history. The adapter picks that supplied agent, writes JSON author, stores JSON null for canonical editor content and labels the private note delivered/outbound. None certifies human origin or edit eligibility.         |
| **S05** [insertMessage:566–629](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L566), [bump helper:632–659](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L632)                                                                                                                                                                                                                                                | Separate message/attachment writes and conversation-count updates are not an edit transaction. Reusing note creation for edits would create another publication/message and move activity facts.                                                                           |
| **S06/S07** [Support identity helper:77–86](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/route-helpers.ts#L77), [AuthContext:42–61](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/auth/context.ts#L42)                                                                                                                                                                                                                                                                         | Current auth exposes actual user/profile and memberships; legacy Support resolves by ID or email. Preserve the qualified identity owner and historical actor evidence instead of using that fallback as original-author proof.                                             |
| **S08/S09** [message schema:175–229](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/database/collections/support-hub.ts#L175), [collection:2193–2207](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/database/collections/support-hub.ts#L2193)                                                                                                                                                                                                                                                             | Shared types preserve identity/body/file shapes but no revision contract. This inspected collection uses cloneValue(messageRows) and local writers; it is not proof of a tenant/source-qualified history query.                                                            |
| **S10** [PrivateNote:25–66](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/timeline/PrivateNote.tsx#L25)                                                                                                                                                                                                                                                                                                                                                                                                         | Current body/author/posted-time renderer has no edit/history state. Its current HTML fallback cannot be treated as the original canonical rich-text document.                                                                                                              |
| **S11–S14** [mention callback:67–75](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/composer/ConversationComposer.tsx#L67), [mention extension:45–62](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/composer/extensions/mention-suggestion.ts#L45), [activity writer:39–59](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/lib/activity-log.ts#L39) | Selecting a mention immediately writes a generated activity sentence through ordinary note creation; the verb is discarded. Thus type=note plus agent JSON does not prove a human-authored editable note. Opening/editing/cancelling must not reuse this side-effect path. |

Absence is claimed for these inspected interfaces, not every monorepo integration. Existing code can be useful scaffolding without being correct authority.

## Minimum permanent logical model

Physical names are illustrative, not another schema DSL or a required rename. Extend the qualified Support source owner.

| Logical record                            | Minimum authoritative facts and invariants                                                                                                                                                                                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stable note source                        | Existing tenant + original note/message ID + original conversation source; protected human-publication kind; immutable original principal reference and original publication provenance/time. Real original authorship is distinct from importer, last editor, current assignee or display name. |
| Current editorial head                    | Exactly one current revision for a writable native note, bound to that same tenant/note. Source availability/privacy/retention and topology controls remain source-owner facts. Unknown/expired source never becomes a new note through upsert.                                                  |
| Revision metadata                         | Stable revision identity/order, exact note/base revision, trusted editor and authoritative commit time, canonical schema/profile version and minimal operation provenance. Ordinary editing appends; it does not rewrite old author/time or reactivate an old revision identity.                 |
| Revision material                         | One canonical structured Internal-note document, with derived safe HTML/text and source-bound references. Ordinary revision material is immutable; qualified D16/D17 restriction, safe replacement or purge is the explicit exception. Historical material is not an undeletable audit payload.  |
| Save receipt                              | One tenant/actor/note/action occurrence with immutable semantic meaning, base/source controls, outcome and resulting revision reference. Store minimal protected comparison/evidence, not a second retained body. Same accepted operation reconciles; changed meaning conflicts.                 |
| Derived current/history/search projection | References the exact authoritative note/revision and source availability. It cannot be a write authority, independently retained transcript or hidden earlier-content search index.                                                                                                              |

Use actual TEXT note/conversation IDs and the identity owner's actual principal type; do not convert existing IDs to UUIDs. Enforce same-tenant/note composite relationships and one valid head; positive bounded revision order with checked serialization; unique revision order/identity and unique operation occurrence; non-null trusted actor for new native human publications/edits; explicit unknown legacy provenance rather than invented actors. Foreign keys alone are not resource authorization. Cascades must not erase required restriction/replay evidence or business facts outside the note owner.

If a legacy current-body column remains during rollout, it is a derived compatibility projection updated/qualified from the head, never a second independently editable truth. A generic save cannot modify type, public/private audience, original source, author, posted time, delivery fields, provider links, source restrictions, head control or attachment membership.

## Save and recovery sequence

1. **Open a qualified edit.** Current tenant/principal/source read + edit permission and verified original authorship are required. Load one currently available canonical revision and its expected head/privacy/source controls. Opening the editor changes nothing. Unknown or unsupported original material stays safely read-only, without parsing away nodes to manufacture editable content.
2. **Build the local desired state.** Keep a private source-bound edit buffer separate from the ordinary Reply/Note draft. Use strict D23 validation before potentially lossy Tiptap parsing. The bounded edit covers text, permitted formatting and ordinary links, with the reference rules below. No activity, notification or history entry occurs before Save.
3. **One deliberate operation.** Submit exact note identity, expected revision/source controls, canonical desired document and one opaque operation occurrence. Derive tenant/editor/original-author qualification on the server. Current labels or caller-declared author fields supply no authority.
4. **Reconcile a known occurrence first.** Under current permitted receipt visibility, an existing identical operation returns its original body-free result and separately current available head; changed operation meaning conflicts. This happens before treating its old base as a new stale write. Replayed success never re-applies body/notification effects or exposes content now expired/forbidden.
5. **For a new occurrence, serialize admission.** Recheck current original source, authorship, permissions, expected head and safety/topology controls at the authoritative mutation boundary. Source expiry/redaction/move/merge authorities must coordinate through the existing owner transaction/locks/revision fences. Use a consistent lock order and fresh eligibility time after required guards; a timestamp captured before waiting for a lock is not fresh eligibility. No database transaction remains open while a human edits or while provider I/O runs.
6. **Handle unchanged content explicitly.** With a current expected head and identical canonical meaning, return No changes with a receipt but create no revision, Edited event, notification or counter change. A stale base is not made valid merely because text happens to equal today's body. Different revision identity protects A→B→A races; comparing text alone does not.
7. **Commit one correction atomically.** Append the revision, advance the current head, record minimal trusted edit history/receipt and required source invalidation or safety-continuation intents together, or none. Any relevant send-review fence advances through its actual source owner. Do not call addPrivateNote or bump native publication/message counts. Technical source versions may advance without claiming a new human contribution, response or last-contact event.
8. **Present truthful results.** On definite rejection, retain only still-permitted local edits and explain the exact recoverable state. On unknown network outcome, pause conflicting saves and perform a read-only lookup of the same operation. Lookup creates/renews nothing. Never mint a new key and replay captured text automatically. The receipt and current head are separate: an old Saved result cannot overwrite a later edit, redaction or source change.
9. **After restriction or expiry.** A previously accepted edit remains a historical outcome, but no receipt/history/cache path may return its forbidden body. Unknown/deleted source cannot be recreated by an update. Restore barriers and never-reused identities must prevent old controls becoming authority after backup or cleanup.

Minimal receipt/control evidence must remain sufficient throughout the note's writable/reconciliation lifetime and the owning restore/replay horizon. Do not impose the provider's 24-hour idempotency window or keep raw note text indefinitely for comparison. Missing/expired receipt is not new write authority; expired/deleted sources and old heads remain fenced. If metadata can be purged after irreversible source retirement, prove that old operations cannot recreate/reapply the note.

## Rich content, attachments and mentions

The current best bounded product interpretation is **body/formatting/ordinary-link correction**, with existing attachment occurrence membership and original bytes unchanged. This narrows edit scope, not D23's rich authoring or D32's viewing capability. New facts, new files or new staff attention use the already-qualified ordinary new-note/action path; do not add B's linked-correction feature as an unselected fallback.

Existing supported typed references must roundtrip faithfully. Do not make every mention/inline node unremovable: that would make normal paragraph/select-all correction unnecessarily difficult. Allow deliberate removal/movement of an existing mention reference without creating a new notifying target or mutating its identity authority. Literal @text is ordinary text. The server validates allowed target/source references independently of a displayed label. Edit does not emit a mention notification; D15's current applicability/safety contracts still govern outstanding attention and retained history.

Distinguish an immutable attachment occurrence from its inline presentation. Removing an inline appearance may leave the existing attachment in the unchanged file list; that is not deletion, privacy removal or a new file version. Make that consequence clear where needed. Do not add arbitrary remote images, replace source IDs/bytes, fetch URLs, reacquire a removed attachment or expose a stale signed URL through an edit. Any permissible existing asset rendering still uses its current D16/D17/D32 source/byte authority. If a referenced object or original structure cannot currently be represented safely, fail/repair explicitly rather than silently flattening it.

There is a difference between deliberate removal of supported content and loss during parsing. D23 requires validating the original supported schema before writable initialization. A schema parser dropping a mark, attribute, mention or asset is never equivalent to the author deciding to remove it. Use the Internal note profile's actual valid-content and size/depth/link rules; do not invent a shorter D35 text limit or turn an empty replacement into routine deletion.

## Material findings and exact proposed clauses

Severity/likelihood describe the unamended design or reuse of current source, not measured incident rates. Every item retains A with a necessary boundary; none calls for a second platform.

### DC01 — Trusted human author and source kind

**High; plausible with directly evidenced legacy routes.** Caller-selected agent JSON or system-generated “notes” could let a person revise another author's words or rewrite an event. S01/S02/S05/S11–S14 demonstrate the source ambiguity.

> “Edit eligibility SHALL require independently qualified original human-note publication and immutable original principal evidence, plus the same current principal's current edit/source authority. Agent display JSON, role, email match, import actor, assignment, profile presentation and type=note alone SHALL NOT establish that evidence. Unknown/ambiguous legacy provenance remains non-editable, with ordinary authorized new-note clarification and D16 redaction separate.”

**Proof:** forged author ID/name, same-email replacement account, deleted/recreated profile, generated mention-log note, imported note, system event and known native own note. Only the qualified last case is ordinarily editable; no administrator override rewrites another author.

### DC02 — A revision is not another note publication

**High; likely if current creation helpers are reused.** addPrivateNote and bumpConversationAfterMessage would move message counts/activity/retention and can trigger follower work. S05 shows this behavior.

> “An ordinary edit SHALL preserve note/original-conversation identity, original author/publication time, internal audience and native publication counters. It appends one editorial revision and minimal edit evidence, not another note, correspondence event, last-contact fact, response credit, work transition, follow subscription or D17 activity anchor.”

**Proof:** edit an old note on Open/Waiting/Resolved and merged work; original chronological position, message count, D14/D28/D30 facts, reminder and Follow enrollment remain correct. New ordinary notes retain their own genuine publication effects.

### DC03 — Conditional save and durable outcome

**High; plausible under two tabs and lost responses.** Last-write-wins can lose the author's correction; retry can create duplicate revisions or reapply earlier text.

> “Save SHALL be an absolute desired-state command for one exact current source/head, with one durable semantic operation identity. Current head/source/safety controls and authority are checked atomically. Identical replay reconciles the original result without mutation; changed meaning conflicts. No-change saves create no revision. A stale expected head requires review, even where current text happens to match.”

**Proof:** two different saves from one base; identical concurrent retries; equal-content no-op; A→B→A; old successful receipt after another edit; same key with altered body/base; lookup after expiry. Exactly one appropriate outcome remains and no stale response restores old text.

### DC04 — Redaction, expiry and edit share one source boundary

**Critical; plausible adverse race.** An old draft or retained revision could resurrect removed material, or a save waiting behind expiry could renew life.

> “Note revisions and all derived representations SHALL remain within the original source's D16/D17 restriction and disposal frontier. Edit admission coordinates with current source/privacy/expiry/topology controls and never resets native admission or retention. Restriction wins over current/history/receipt reads and caches. Owner redaction may target currently permitted historical note material; uncertain correspondence requires safe restriction/removal of the affected representation, not a revealable old copy.”

**Proof:** Save races selective redaction, whole-body removal, expiry at equality, worker lag, source-class change, privacy revoke and backup restore; compare current and earlier JSON/HTML/text/search/notification/preview copies. No expired or redacted content reappears.

### DC05 — History is governed content, not an undeletable audit archive

**Critical; plausible if immutable is interpreted as never deletable.** A revision log can keep private content forever or leak removed phrases through diffs, hashes, snippets or actor labels.

> “Ordinary revision metadata SHALL preserve attribution and ordering; retained revision material SHALL be separately governed and purgeable. History/diff responses SHALL reauthorize the exact note and each available representation, hide forbidden payload/count/detail as required, and never recover erased text from audit, backup, derived HTML, prepared bytes or content hashes. Page/query bounds SHALL NOT discard otherwise retained revisions or change the source retention meaning.”

**Proof:** older revision removed while current remains; identity visibility narrowed; long retained history beyond one page; source expiry; no hidden-count or removed-text diff leak; safe pagination cannot bypass a withdrawal after the first page.

### DC06 — Exact original source through merge and CRM

**High; plausible normal topology changes.** An edit addressed to a current merged root could update a different original or expose A to a reader permitted only B.

> “Every edit and history read SHALL target the stable original note/source. Current root supplies only its qualified handling/navigation context. Merge, Undo, move, unlink and CRM access never reparent authorship or broaden source authority. On changed reviewed topology/permission, refresh the same source under current rights rather than retargeting the operation.”

**Proof:** edit A while A/B merge, Undo or inbox move commits; CRM-only access to B; duplicate browser view after linking. Note, receipt and history stay with A; no duplicate CRM record or Activity.

### DC07 — SQL/grants must make raw bypass unavailable

**Critical; plausible from S01/S02/S03.** Broad CRUD can change author, type, tenant, original source or head outside the new command even if Edit UI is perfect.

> “All note/revision/head/receipt/material writers SHALL use the closed authorized boundary. Qualify actual table/column grants, exposed-schema RLS, effective USING/WITH CHECK, SELECT/RETURNING, views/functions/RPC execution/search_path and privileged/NHI callers together. A permitted old row SHALL NOT become a forbidden new source/author/audience. Direct generic body/head/attribution writes and raw history publication are denied.”

**Proof:** actual authenticated/anon/service roles attempt cross-tenant and same-tenant other-author writes, source reparent, note→email/public conversion, arbitrary head FK and direct body update. Include same-user other membership and every legacy endpoint, not just the new route.

### DC08 — Mention handling cannot act before Save or generate edit spam

**High; current source directly demonstrates insertion-time writes.** S11–S14 create another ordinary note before the draft is saved, and could repeat during editing, Cancel or programmatic restore.

> “Opening, parsing, editing, previewing, moving/removing an existing mention and cancelling SHALL create no publication, activity or notification. D35 admits no new notifying mention target. After a successful edit, existing D15/source guards correct or invalidate unsafe outstanding presentation/dispatch; they do not recall already seen/sent content or emit another optional publication notice for the edit.”

**Proof:** select/cancel an edit; paste/type literal @; remove/move an existing mention; restore editor state; replay save; a notification already prepared versus already submitted. Effects stay under the exact existing owner contract.

### DC09 — Attachments and inline appearances have different authority

**High; plausible integrity/privacy mistake.** Removing an image from the body can be misrepresented as removing the file; editing an href can replace a source reference or cause remote acquisition.

> “Ordinary D35 edits SHALL NOT acquire, replace or delete attachment occurrences/bytes. Supported inline presentation may be deliberately changed without changing the underlying file list; removing it is not privacy disposal. Typed source references remain server-qualified; unsupported structure stays repairable read-only. D16 removes sensitive content and D32 supplies separately qualified viewing.”

**Proof:** delete a paragraph containing an image/mention, change an ordinary link, attempt foreign file ID/new remote asset, edit while scan/restriction changes and inspect older history. File count/identity/bytes remain truthful, and deliberate supported deletion is distinguished from parser data loss.

### DC10 — Current search is not an archive of earlier wording

**High; plausible after asynchronous indexing.** A corrected/removed phrase could still reveal the note through a stale snippet/count or a newly added history-search corpus.

> “D22 ordinary search/Find SHALL use the current eligible note source head under its existing scope/version. Earlier editorial revisions are available only through deliberate qualified history, not silently added to the general search population. Current source/head gates precede result membership, rank, snippets and counts; stale projections may not serve an old positive while rebuild is pending.”

**Proof:** change a unique old phrase, delete it via privacy correction and race index jobs/results. Current search must not leak old wording. Pagination/history still retrieves retained permitted earlier material only through its own path.

### DC11 — Private edit buffers and source-bound composing awareness

**High for leakage/loss; plausible browser lifecycle.** Reusing the reply editor instance can overwrite a reply draft, share edit contents or advertise A's editing through B's merged source.

> “The edit buffer SHALL remain private to its authenticated actor/current source and separate from Reply/Note draft state. Late saves/loads/context changes cannot overwrite newer local work. On known privacy or access loss, clear forbidden content; no persistent browser archive or offline replay is introduced. Any D34 cue binds the exact note original being edited and remains neutral advisory state, never an edit lock or draft disclosure.”

**Proof:** two tabs, same profile through CRM/Support, A-note edit with B-reply draft, account switch, hidden/resumed window, source loss, slow successful response after another edit and Cancel. No wrong-source cue or lost unrelated draft.

### DC12 — Native author qualification must be fixed before enabling legacy editing

**High; likely if migration infers current ownership.** Legacy mutable author JSON and generated notes cannot be repaired by current email matching or text-prefix classification.

> “Migration SHALL qualify original human author/source evidence from actual trusted provenance, not infer it from current address, display JSON, account ownership, body text or migration actor. An observed current legacy body is a labelled migration baseline, not invented original text/history. No previous revisions or original publication timestamps are fabricated. Unsupported or unproven sources remain non-editable without losing their permitted reading/correction paths.”

**Proof:** real evidence versus absent evidence, generated activity masquerading as note, imported/missing canonical JSON, preexisting redaction/expiry, duplicate support-agent mappings and identity deletion/recreation. No unsafe writer remains available during mixed-version rollout.

### DC13 — Complete bounded queries and operational recovery

**Medium; plausible at larger tenants or long-lived notes.** allRows or client hydration can truncate history, duplicate loading and make exact revision claims false; failed invalidation can leave a stale current view.

> “History and receipt queries SHALL be exact tenant/note/source-qualified indexed reads with stable keyset paging and explicit completion/currentness. Use the current Internal-note profile's tested material bounds; do not silently truncate a note or delete older revisions to meet a UI limit. Commit required identifier-only invalidation/safety-continuation with the source change and recover through existing shared machinery. Logs contain no note body, raw diff, sensitive reference or replay secret.”

**Proof:** history larger than one page and default Data API limit; concurrent edits between pages; late invalidation, overloaded query, same note in two surfaces and deliberate source deletion. All retained permitted versions remain reachable, failure is honest and current wrong content is not used as a fallback.

## SQL and concurrency interpretation

PostgreSQL row locks can serialize conflicting row mutation while ordinary reads continue under their isolation semantics; a lock is not an end-user editing reservation. Acquire source/note/receipt controls consistently, handle deadlock/serialization failures as rejected or safely retried transactions under the same operation, and never wait for user interaction with locks held. No new generic locking service or blanket serializable database mode is required. [PostgreSQL 17 locking](https://www.postgresql.org/docs/17/explicit-locking.html).

Evaluate effective policies rather than syntax alone. PostgreSQL UPDATE/ALL can reuse USING where WITH CHECK is omitted; relevant SELECT/RETURNING/upsert checks also apply. The current SQL's explicit UPDATE check is still too broad for the desired original-author command. Supabase service paths, JWT/user_metadata and views require their actual authority analysis; current source facts must not be replaced by stale app_metadata or user-editable metadata. [PostgreSQL CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

The current [Supabase changelog](https://supabase.com/changelog) confirms that Data API exposure settings and managed realtime-schema rules are separate from RLS. Inspect actual deployments rather than granting access to make a new table work. D35 needs no custom realtime-schema object, CDC publication of revision bodies or new realtime transport. No provider update invalidates the proposed ordinary Postgres source/command approach.

## Permanent sequence and proof limits

1. Qualify native-human source/author provenance and current permissions; fence broad legacy writers and generated-as-human activity paths.
2. Add the minimal revision/head/material/receipt model and source/retention integration, using owner-compatible identifiers and effective grants. Qualify initial native creation too; otherwise future author proof is not established.
3. Implement one conditional desired-state Save and private read-only receipt/history paths with current source gates, then the bounded editor/reference rules and canonical CRM reuse.
4. Apply exact D15/P17/P6 unsafe-projection/dispatch fences and D22 current-head indexing, while preserving independent drafts, source work and D34 privacy.
5. Execute the positive/negative/concurrency/privacy/legacy/migration/browser/source-query tests above before activation. Additive schema first, gated clients second; rollback must not revive generic writers over revision-aware data. Disable editing without blocking permitted note reading, ordinary new notes, source recovery or D16 redaction.

The evidence here is source inspection and current primary technical documentation. No new synthetic model was needed to establish the directly visible caller-author, insertion-side-effect and missing-revision contracts. No SQL/RLS, browser, notification, concurrency, performance or user-experience proof is claimed executed. All proposed clauses require actual implementation qualification. The selected A remains sound with these bounded amendments.
