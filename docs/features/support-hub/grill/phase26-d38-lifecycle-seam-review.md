# D38 — Independent lifecycle, source and Email Studio seam review

**Current ratification — 15 September 2026:** The founder fully ratifies D38 A and all amendments, additions, adjustments, changes, updates and incorporated corrections. D1–D38 and all amendments are fully ratified. The [full ratification](phase26-d38-full-ratification.md) incorporates this entire record and supporting prose. Earlier proposed/pending/intent-only and no-Q39 wording below is historical, not a repeat approval gate. Original evidence and unexecuted-runtime limits remain unchanged.

**14 September 2026. Disposition: Accept with required amendments.** The founder selected **A — Automatically save new Internal note drafts in My drafts**. D1–D37 remain fully ratified. D38 A is selected; these detailed amendments are proposed, and no Q39 is opened. Grooming only: no implementation or external mutation.

The permanent path is a narrow new-note purpose in the qualified private Support draft capability: **write privately → save quietly → resume → Add note deliberately**. It is not a new notebook, shared document service, external email draft, or persistent editor for correcting a posted note.

## Authority and proof limits

Verified WSL directory `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10` and local HEAD `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Read current API/data-access instructions, OpenSpec index, CRM ownership ADR0001, canonical document ADR0030, immutable prepared-message ADR0032, actual composer/note paths, and accepted D2/D4/D10/D15/D16/D17/D18/D23/D24/D35/D37 records. Parent records fresh remote/PR state separately.

These are source facts and conditional protocol counterexamples, not a deployed exploit, running D38 implementation, real RLS/browser proof or measured staff loss rate. Lifecycle traces below are worked reasoning examples, not executed tests. No secrets, production inbox, provider or live database were accessed.

## Fresh source observations

| Exact source                                                                                                                                                                                                                                                                                                                                                                                                | Observed fact and consequence                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Composer state86–112](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/composer/use-conversation-composer.ts#L86)                                                                                                                                                                                                     | Distinct Reply/Note local bodies and files reset on conversation change. Separate state is not durable persistence. Late completions must bind the original slot rather than current mode/conversation.                                        |
| [Note posting158–188](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/composer/use-conversation-composer.ts#L158)                                                                                                                                                                                                     | Note uses the Reply serializer with empty attachments, posts text/HTML and resets. Failure stores a closure that retries the same non-idempotent mutation. Canonical source/file semantics and exact unknown-result recovery are missing here. |
| [Draft save224–253](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/composer/use-conversation-composer.ts#L224)                                                                                                                                                                                                       | Rejects Note; Reply save uses an outbound draft path. Removing the guard alone would use the wrong published-message/transport model.                                                                                                          |
| [Mention callback67–78](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/composer/ConversationComposer.tsx#L67), [insertion45–62](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/composer/extensions/mention-suggestion.ts#L45) | Inserting a mention immediately calls logSupportActivity.                                                                                                                                                                                      |
| [Activity sink39–59](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/lib/activity-log.ts#L39)                                                                                                                                                                                                                                           | With an agent actor, it POSTs a synthetic body to `/notes`; verb is ignored. Thus mention insertion is a real publication path, not just local analytics. Draft saving/hydration cannot invoke it.                                             |
| [Note schema58–63](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/schemas.ts#L58), [mutation78–80](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/mutations/conversations.ts#L78)                                                                           | Caller author, required text and optional HTML; no canonical draft/revision/files/intent contract. Trusted author and closed note-purpose commands must replace this assumption.                                                               |
| [Note writer941–963](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L941)                                                                                                                                                                                                                                       | Inserts a new random message with json:null, then separately bumps conversation. Failure between writes can duplicate a posted note on retry.                                                                                                  |
| [Message helper566–629](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L566), [bump632–667](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L632)                                                                    | Message, attachment and bump writes are separate; count uses a previously read value. A loop of these calls is not atomic publication.                                                                                                         |
| [Dirty helper8–29](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/lib/rich-text-dirty.ts#L8)                                                                                                                                                                                                                                           | Image/mention/rule count as meaningful, invalid JSON falls back to nonblank text. This is not canonical structural validation or a complete draft predicate.                                                                                   |

## Exact proposed clauses

### L01 — Scope and shared owner

“Qualify new unpublished Internal note drafts in Support's existing private owner/controller with a closed Note purpose. Preserve Reply separately and do not persist D35 posted-note correction editors. One canonical structured draft and qualified dependencies remain authoritative; My drafts is a metadata projection.”

D38 explicitly extends D37's excluded new-note scope without rewriting the accepted definition of Private Support reply draft. No generic document/workflow platform is needed.

### L02 — Identity and cardinality

“Enforce at most one active Note draft per tenant, trusted real staff owner and immutable draft origin, independently of that origin's active Reply draft. Purpose, owner, tenant, origin and generation are immutable. New general Note composition in a combined workspace begins at its current qualified continuing original; My drafts opens the explicitly selected retained slot.”

Allocate one stable intent/generation before first save. Concurrent first saves cannot silently overwrite different candidates. New writing after post/discard uses a new generation. Merge never collapses private slots by root, title, email or Party. Multiple old origins can retain drafts that now propose posting to the same component; each is distinct legitimate work. No body-based deduplication or cross-person/root drafting lock.

### L03 — Private origin versus published affinity

“Preserve the private origin independently from posting destination. D10-R14 assigns a general note posted from combined work to the then-current continuing ORIGINAL conversation, unless an already-qualified explicit source-specific action establishes otherwise. Do not add an arbitrary retarget selector. Bind the reviewed destination and topology/control generation; material destination/disclosure changes require visible refreshed review before Add note.”

Current authority must cover private origin, actual destination, the complete component/action scope D10 requires, and material dependencies. Readable B cannot grant broader A publication. A qualified narrow read may remain possible without leaking hidden root members or permitting broad mutation.

Example: B's draft survives B→A as a B private slot. Normal posting proposes A visibly. Post-before-Undo leaves the note at A; Undo-before-post rejects stale admission and requires current destination review. Undo never relocates an already-published note to its old private draft origin.

### L04 — Meaningful incomplete work

“Opening Note, unchanged restoration, focus/selection or mode switching creates no empty saved row. Save meaningful author changes: actual content/structure, deliberately selected typed mention/fill-in, qualified asset selection, or meaningful changes to an existing draft. Clearing an existing body is a saved edit, not implicit discard.”

Valid incomplete writing, unresolved typed fill-ins and pending approved uploads may be preserved without being post-ready. Unknown nodes, forged provenance, forbidden sources, arbitrary HTML/email metadata are not harmless incompleteness. A partial typed @ is not a recipient; a selected mention is inert until publication. Blank content or unavailable files may block Add note under the actual profile without blocking safe draft custody. No note title/reason requirement is introduced.

### L05 — Whole note bundle, no email state

“Atomically save canonical Note JSON/profile, private origin/purpose/owner/generation, destination-review context, typed mentions/fill-ins, qualified wording/source dependencies and attachment/inline-asset occurrences. Saved acknowledges that exact whole bundle. Local caret/viewport are presentation aids.”

Do not inherit From/To/Cc/Bcc, Reply-all preference, signature, external reply target, prepared email, delivery state or D24 patch. D18/D27 note-purpose insertion/provenance remains. D36 quotation UX is external scope and does not independently authorize every quote action in Notes. Restored content remains inert; hydration cannot execute variables, mentions, shortcuts or business actions.

### L06 — Autosave and cross-purpose isolation

“Reuse D37's qualified bounded autosave/acknowledgment protocol for Note: one unresolved save per controller, latest coherent candidate queued, expected revision, immutable operation binding and current authority/source/lifecycle. Bind loads, ACKs, errors, upload completions and actions to tenant, real owner, original, purpose, generation and editor generation.”

A Note result cannot replace, mark Saved, clear, post or discard Reply/another source. Normal switching preserves both bundles and pending state. Reply shortcuts remain solely in Reply under D24-R10. Returning restores its still-qualified plan; Add note never executes it. Avoid indefinitely mounted editors. Canceling HTTP is not rollback. An old accepted ACK advances only its known base and cannot replace newer text or mark it Saved.

### L07 — Conflicts and unknown saves

“Conditional saves reject stale revisions, terminal states and current source restrictions. Competing tabs preserve lawful local work and use deliberate current-version review; no silent overwrite, auto-merge or takeover. Unknown save reconciles its original immutable operation and late-admission fence before advancing an assumed base.”

Minimal body-free handles survive supported navigation. Empty lookup is not proof of noncommit while a request can still complete. Original result and current snapshot differ and require current access. Retain D37's honest leave-with-uncertainty and unfinished-file guard; no indefinite trap or offline body/file archive.

### L08 — One atomic Add note admission

“Add note submits the latest settled, exact reviewed canonical candidate with current private draft base/generation and posting intent. Validate origin/destination topology, real author/publish authority, profile, dependencies, ready files and typed mention targets. In one Support transaction publish one canonical original note and initial qualified revision/asset custody, consume the exact Note generation, record operation/result and first-qualified source activity identity/frontier, and commit required identifier-only attention/invalidation obligations. Pre-admission rejection commits none.”

Successful local admission means the note is internally posted; no email queue or provider round trip is needed. Appropriate shared Note-profile content validation/compilation may precede admission without an outgoing prepared artifact. Fast typing followed immediately by Add note can admit the stable local draft generation/latest candidate against the absent/current slot atomically: no forced Save click, 750ms wait or preliminary save round trip. An earlier in-flight/unknown save must settle/reconcile before dependent posting assumes a base. Preserve the user's exact post candidate and intent while doing so; do not silently substitute a different body or rekey an uncertain post.

### L09 — Post recovery and duplicate boundaries

“Post intent binds tenant, real author, draft generation, expected revision, exact candidate and reviewed destination/dependencies. Same intent/same meaning reconciles its original result; changed meaning conflicts. Possibly committed Add note displays Checking whether the note was added, not an ordinary fresh editable duplicate. A confirmed post retains the real note identity and consumed draft even if notification fanout, refresh or response delivery fails.”

Two post keys for one generation still produce at most one note. Save/discard racing accepted post conflicts with terminal consumption; late create cannot resurrect it. Separate deliberate generations, retained origins or authors may post identical text legitimately. Do not deduplicate by body hash/time/root or use presence as a lock. No database transaction wraps P6/external I/O. A result lookup that remains unavailable must support the existing minimal recovery route without silently treating the item as a new draft or claiming post cancellation.

### L10 — Mention and following effects only after publication

“Remove activity/attention producers from mention insertion, hydration, editor callbacks, autosave and restore. Actual note publication alone supplies its source event and exact eligible typed-mention contributions under current source/recipient authority. Plain @name text, stale raw IDs or pasted chips cannot independently authorize attention.”

D15 E3 source activity/frontier plus identifier-only outbox commits with the note; follower scanning/notification compilation occurs later. Direct mentions retain their separately qualified producer and deduplication meaning. Optional Follow preferences neither suppress required direct attention nor enroll a follower. Use exact original source/frontier and current authority at notification admission; late workers cannot admit later followers or reset utility. Overlapping reasons use existing shared coalescing; do not assume one email per mention or manually dispatch two copies.

A stale/ineligible mention gets targeted review: remove the notifying target or deliberately retain lawful non-notifying text as supported by the owner. Never secretly retarget, obtain a CRM email fallback or imply successful attention. Publishing without the failed mention requires that explicit reviewed candidate, not silent partial success. Source admission does not wait for downstream attention success. Its failure leaves the note published; recover the original source obligation/notification intent without publishing another note.

### L11 — Discard and lifecycle

“Use D37's conditional Discard draft with one clear confirmation for Note. Bind exact reviewed generation/revision and current authority. Atomically end ordinary grants, record terminal anti-replay evidence and commit reference-aware cleanup. Newer save/post cannot be silently discarded. No hidden trash, restore timer or bulk delete is added.”

Durable states distinguish active, consumed-by-note and discarded/retired; source restriction/expiry is separately authoritative. Saving/unknown/conflict/loading are presentation/protocol states, not necessarily SQL enums. Missing row is not post/discard proof. Current restriction cannot be bypassed with a generic update/new key/restore. Cleanup affects only actual draft custody, never original/shared files, independent posted-note/Reply material, conversation or CRM history.

### L12 — Privacy, retention and capability loss

“Apply D16/D17 and each qualified material class's own custody/expiry to Note bodies, metadata, mentions, files, caches/editor Undo, operation results and temporary material. Save/open is not native Support admission or source-lifetime renewal. Introduce no arbitrary 24-hour, 30-day or indefinite draft deadline.”

Origin, destination and dependencies can have different restrictions. A valid draft does not authorize restricted wording/guide/file copies. Independently safe authored content survives only with proven separation and lawful draft custody. Source/owner authority loss suppresses denied rows and clears forbidden client material. Loss of publish capability blocks Add note but does not falsely revoke still-permitted reading; save needs actual compose/write authority. Assignment, departure, administrator role or reused email does not transfer private drafts. Offboarding/privacy custody is separate from any manager inbox.

### L13 — CRM continuity

“CRM's Support entry and My drafts resume the same private Note/source with preserved return record/list/scroll. Requester, participant, authenticated author, assignee, Party, represented organization and record owner remain distinct. No relationship, email match or conversation membership grants draft, source or CRM-field authority.”

Draft save/open/discard creates no Activity, last-contact fact, Party or business action. Actual posted notes appear through the qualified existing Support source projection, not a copied CRM-owned note. Human wording asserting a receipt/refund/contact change is not owner evidence of completion. Related giving/care/missionary reads/actions retain their own permissions, and CRM remains usable independently.

### L14 — Email Studio and delivery seam

“Support owns private Note custody, source/actor/dependency qualification, publication and source activity/outbox. P17-governed canonical schema/editor/reusable wording may support authoring/validation, without owning a second draft, publishing a system template, adding an email signature or preparing the note as mail. Save/open/post requires no external prepared material.”

An actual authorized note-attention producer selects its own recipients/purpose; P17 supplies that notification's appropriate presentation, including external material only for an eligible external channel, and P6 owns its complete occurrence/dispatch/reconciliation. In-product attention stays local without provider artifacts. Note/draft bodies are not notification-email bodies by default; D15 pointers and current source/recipient fences remain. No email-to-note reply channel, provider draft sync, second mailer, mutable raw template or new product-wide dependency is added.

### L15 — Compatibility and migration

“Qualify Note readers/validators, private access, save/post/discard and terminal/source fences before automatic Note writes or finder rows. Old unsupported code fails closed on purpose/schema rather than treating a Note as Reply, stripping metadata or publishing via legacy Add note. Disable new Note saving without disabling safe reading or original post/attention reconciliation.”

Existing posted notes, including generated mention-log notes, are not private drafts and cannot be moved/hidden/reassigned to populate My drafts. isPrivate:true means admitted internal content, not author-private unfinished work. Legacy classification/attribution correction follows trusted owner evidence, D35/D16 and existing custody; never infer from text/email/current assignee. Backfills/roll-forward preserve source/history/terminal facts. Rollback cannot reenable the premature mention publication callback.

### L16 — Proof and operational discipline

“Prove actual UI/editor/API/database/storage/notification/CRM outcomes. Publish actual admitted content/file/operation limits and measured workloads in the release profile; D37 scheduling targets are not persistence guarantees. Log body-free purpose/draft/operation/source IDs and typed outcomes, not private writing, recipients, filenames or staff keystroke/activity histories.”

Confirmed unposted disclosure, wrong-purpose restoration/clear, double note, lost acknowledged writing or restricted post are release blockers/containment events, not monitor-only risks. Residual save/post latency, conflicts and deferred attention may use existing accountable owner metrics with named thresholds/responses in the final operational plan. No perfect uptime, crash recovery or scalability claim is made in grooming.

## Finite worked lifecycle traces

These are reasoning traces, not executed tests or a simulation.

| Interleaving                                                 | Required result                                                                            |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Note save starts; author switches to Reply; Note ACK arrives | Only Note's confirmed base changes. Reply text/plan/recipients/status/focus remain.        |
| Note rev2 saves; another tab posts rev1                      | Post conflicts, no stale note or consumed newer draft.                                     |
| Post commits; old save/create/discard arrives                | One note/source event/outbox; terminal draft; no resurrection or canceled note.            |
| Add note commits; response lost; exact retry                 | Original note ID/outcome; no second random insertion or source occurrence.                 |
| Two post keys for one draft generation                       | At most one publication; changed intent conflicts.                                         |
| Independent old Note slots beneath one root post same text   | Each deliberate qualified note is legitimate; no body dedupe/root lock.                    |
| B-origin draft; B→A; post wins before Undo                   | Reviewed general note stays at A after Undo.                                               |
| B-origin draft; B→A; Undo wins before stale post             | Reject stale scope, retain qualified text, review current destination.                     |
| Mention inserted, repeatedly saved, then discarded           | Zero posted note, direct/follow attention or CRM activity.                                 |
| Note commits; attention worker fails                         | Note remains admitted/consumed; exact downstream obligation recovers.                      |
| Source restricted after save before Post                     | Deny unsafe post despite lagging cleanup; preserve only qualified separable safe material. |
| Unknown save; author chooses Leave                           | Keep minimal handle, disclose uncertainty; no cancellation or fresh-post assumption.       |
| File pending, text acknowledged, navigation unmounts         | One truthful guard/preserved real transfer; manifest is not recoverable browser bytes.     |
| Reply shortcut staged; user posts Note                       | No Reply plan execution or consumption. Return restores qualified Reply.                   |

## Material concerns and permanent changes

Severity describes consequence; likelihood is qualitative source/exposure reasoning, not a measured incident rate. All concerns strengthen/narrow A rather than reject automatic private note saving.

| Concern                             | Severity / likelihood; evidence                       | Failure and why it matters                                                                                                   | Exact fix                                                                                                      |
| ----------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Premature mention publication       | High / direct current path with an agent actor        | Unfinished private work creates an actual synthetic posted note and false human activity.                                    | L08–L10/L15: only actual note publication creates source/attention.                                            |
| Wrong source through merge          | High / plausible ordinary topology change; D10-R14    | Private B origin is mistaken for published affinity or silently grants broader A posting. Undo/privacy/history become wrong. | L02–L03: distinct slot, reviewed current continuing original, current origin/destination/dependency authority. |
| Note/Reply contamination            | High / plausible naive extension of current-mode hook | Late ACK clears wrong text, internal content enters Reply, or Note executes a staged Reply plan.                             | L05–L07: exact purpose/generation binding and plan isolation.                                                  |
| Partial publication/duplicate retry | High / direct current separate writes/random IDs      | Note commits, bump fails, retry inserts another; draft cleanup and source activity disagree.                                 | L08–L09: canonical note/revision/files, consumption, receipt and source/outbox atomic.                         |
| Incomplete work lost                | Medium / direct body-only schema/file omission        | Mention/fill-in/file work is rejected or lost; clearing content silently deletes.                                            | L04–L05: meaningful draft-safe bundle distinct from post readiness.                                            |
| Old or competing writes             | High / plausible network/tab races                    | Acknowledged writing disappears or terminal draft returns and posts again.                                                   | L02/L06–L09/L11: CAS, stable intent, terminal fences, no blind upsert/dedupe.                                  |
| Privacy/offboarding leakage         | High / plausible stale caches/multiple owners         | Restricted copies persist through private custody or replacement assignee inherits drafts.                                   | L03/L12–L13: current intersection, actual custody clocks, no transfer.                                         |
| Email Studio coupling               | High / plausible reuse of Reply serializer/controller | Saving prepares mail; posting waits for provider; notification retry republishes a note.                                     | L05/L08/L10/L14: local note owner, shared profile, independent attention/P17/P6.                               |
| False CRM/business evidence         | High / plausible duplicated embedded editor/history   | Draft creates copied CRM note or suggests giving action completed.                                                           | L13: same authorized Support projection, no inferred domain effect.                                            |
| Unsafe migration/rollback           | High / plausible mixed versions                       | Posted records become private drafts; old code strips kind or recreates terminal/restricted data.                            | L11–L12/L15: correct classification, readers first, restrictive recovery/roll-forward.                         |
| Overengineering                     | Medium / likely under parity pressure                 | Co-editing, manager drafts, version SaaS, offline store and notebooks increase complexity/custody.                           | L01/L02/L06/L14–L16: qualified existing owner, controller, finder and editor only.                             |

## Required falsifiable acceptance cases

These are future implementation proofs, **not executed tests**:

1. New meaningful Note saves and returns through My drafts; opening empty does not create a row, clearing existing content persists until explicit discard.
2. Same owner/origin keeps Reply and Note independently; at most one active Note per slot; conflicting first saves preserve distinct local candidates.
3. Other owner/tenant cannot read existence/type/title/body/files/operations through UI, raw data, API/RPC, cache, realtime or CRM; late scope responses rejected.
4. Origin and destination authority independently qualify; execute Post-before-Undo and Undo-before-Post with exact D10 note affinity.
5. Old slots under one root remain distinct; legitimate independent same-text notes survive, one generation never publishes twice.
6. Mention insert/Undo/Redo/hydration/save/discard produces zero published note, direct/follow attention or CRM activity before Add note.
7. Actual Add note atomically commits canonical original/initial revision/assets, draft consumption, receipt and source/frontier/outbox; fault injection at former helper boundaries gives no partial success.
8. Lost Add-note response and two identities for one generation produce one note; current result access and no-rekey behavior remain correct.
9. Save/Post/Discard and old-create replay cannot resurrect drafts, erase newer content or reopen editable duplicate after attention failure.
10. Fast Add note submits the latest settled candidate without waiting 750ms or requiring Save; earlier unresolved save is reconciled without substituting a new body/intent.
11. Canonical Note JSON/typed mentions/fill-ins/dependencies/files survive save/resume/post; current json:null and attachment omission receive real regressions.
12. Ineligible mentions cause targeted review, no fabricated recipient or partial-success claim; follow/direct reasons preserve frontier/current applicability and qualified coalescing.
13. Posting Note leaves Reply shortcut, recipients, signature and status plan untouched; purpose mutation/stale callback cannot externally disclose Note material.
14. Harmless metadata does not cause pointless conflict; topology/privacy/publish changes do. Lost publish permission does not erase still-authorized reading.
15. D16/D17 restrictions/expiry/restore cover bodies/files/dependencies/caches/Undo/results; independently safe text survives only with qualified separation/custody.
16. Exercise IME/rapid navigation, CRM visits, two tabs, reconnect, pending uploads and explicit Leave during unknown save with original recovery handle.
17. D35 correction remains local explicit Save changes/Cancel and never enters My drafts or Note autosave.
18. Note save/post creates no outgoing P17 preparation. Actual authorized attention separately proves correct in-product/external posture, presentation and P6 exact recovery.
19. Existing generated/admitted notes do not become private drafts; mixed versions/rollback cannot restore premature mention callback or strip terminal/purpose/source facts.
20. Record real versions, limits, workloads and latency for query/save/restore/post; logs contain no private text/identities/filenames. Widget mocks are not owner/database/browser proof.

## Synthesis and sequence

**Before recording the corrected answer:** distinguish new Note from D35 corrections; settle distinct purpose/cardinality, immutable private origin versus D10 post affinity, save/post separation and actual attention owner. L01–L14 resolve these choices without another notebook or platform.

**Capture in design:** canonical bundle, current authorization, meaningful/incomplete work, autosave/ACK, operation recovery, terminal/source fences, file custody, original note history, metadata finder and CRM/P17/P6 continuity.

**Implementation order:** close premature mention and alternate unqualified note producers; qualify trusted private Note commands/readers/schema; implement atomic publication/consumption/source-outbox; connect the existing private controller and finder; execute the real acceptance matrix before activation. The entire permanent path reuses accepted capabilities without writing notes through outbound draft rows.

**Monitoring:** no monitor-only exception for private disclosure, wrong source/purpose, duplicate note, lost acknowledged bundle or hidden external effect. Residual latency/conflict/deferred-attention signals reuse D37/Support/P17/P6 controls with named owner, numeric release threshold and response in the parent's operational plan; this review adds no employee metrics product.

**Final disposition: Accept with required amendments.** A is a coherent small extension once private Note lifecycle and local publication are qualified. D1–D37 remain ratified; D38 A is selected and these clauses are proposed. No Q39, formal spec, ticket, source/schema/provider mutation or real message is created here.

## Full founder ratification — 15 September 2026

This entire record is accepted through [D38 full ratification](phase26-d38-full-ratification.md), reconciled by final R01–R26 and F01–F03. All 23 category outcomes, C01–C15, L01–L16, full UX and 16 UX acceptance additions, worked traces, P01–P30 and O01–O05 are incorporated with every supporting qualification. Support owns private Note drafts and actual admission; P17-governed shared authoring does not prepare email for Note save/post; separately authorized post-derived communication retains its P17/P6 owners. CRM uses the same authorized source. All 30 actual runtime groups remain required and unexecuted. Q39 is a separate question and is not answered by this acceptance.
