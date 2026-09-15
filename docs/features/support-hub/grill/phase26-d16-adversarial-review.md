# Selective permanent redaction in Support Hub

**Historical disposition: Accept with required amendments. D16 and every adopted amendment are fully founder-ratified, 11 September 2026.** The founder selected A and fully ratified the complete package; D1–D15 remain fully ratified and unchanged. This is a completed grooming decision/review, not a formal specification, implemented feature, legal certification or release approval.

The [UX blueprint](phase26-d16-redaction-ux.md), [Core and vendor evidence](phase26-d16-evidence.md), [US legal/provider analysis](phase26-d16-us-legal-and-provider-evidence.md), and [documentation validation](phase26-d16-validation.json) complete the record.

## Exact corrected decision

> Support Hub provides **Remove sensitive content…** for explicitly authorized staff to remove selected text and whole selected attachments from an original message. Staff review the exact resulting message and commit once. Useful unselected content and permitted communication facts remain. Whole-body removal is available when appropriate; it never silently selects every attachment. Completed permanent removal has no ordinary reveal or Undo.
>
> Support owns the correction of its original content. Every governed active representation must obey the source restriction before it may be read, exported, regenerated, replayed or sent. Old email/intake copies, prepared material, file previews, CRM representations, search results and merge Undo cannot restore the removed content. Independent authored messages and authoritative CRM, giving or records-domain facts are not silently changed.
>
> Removal has truthful evidence-based outcomes. A source restriction prevents further authorized use while cleanup proceeds. Actual preservation requirements use restricted owner custody and are never labelled erased. Provider and backup disposal follow qualified owner contracts and applicable legal deadlines; external email and independent downloads cannot be recalled. A lost response or failed cleanup cannot restore content or imply completion.
>
> Keep the ordinary interaction small: a message action, precise selection, an after-state preview, one explicit confirmation, and a calm persistent marker. No automatic detector, binary/PDF editor, revealable Support archive, bulk eraser, universal retention schedule, new CRM, or generic compliance/workflow platform is introduced. Formal privacy requests, security incidents and consequential business actions retain their own authority and completion criteria.

The following clauses are exact required language for downstream design. They define observable contracts without freezing unnecessary physical table names or libraries.

## Required decision clauses

### D16-R01 — Need, scope and strongest alternative

Allow correction of accidentally included private material while keeping the legitimate request usable. The illustrative receipt question with an unrelated private paragraph and wrong attachment tests this need; it is not measured ministry demand. B, whole affected body/file removal, is the strongest simpler alternative and remains a deliberate fallback. C, retaining a revealable masked original, adds custody and reveal risk without an established ordinary Support need. A is accepted with the safeguards below, not because competitors establish universal best practice.

The feature applies to retained original incoming messages, published internal notes and sent-reply representations that Support owns, including eligible closed/archived conversation sources. It is not a general edit-history feature or authority to rewrite another author's statement. Draft editing remains its own operation. Do not require reopening a conversation, changing assignment, or creating a ticket in another domain merely to correct content.

### D16-R02 — Qualified staff authority and containment

Permanent correction requires current authenticated staff identity, active tenant membership, permission to read the exact source and the explicit Support content-redaction capability. Default grants belong only to designated tenant Support administrators through Core's existing authorization mechanism; an authorized tenant administrator may deliberately delegate the capability. Viewing, being assigned, following, replying, CRM ownership and email matching never confer it. Platform support access is not an implicit bypass.

Qualified safety responders may restrict an affected source through the existing safety/records boundary when immediate disposal is unavailable. A reader without either capability can route a source reference to a qualified handler through established attention, without copying the secret. Do not give every reporter destructive or tenant-wide hiding power. Default routine removal has one authorized actor and one meaningful confirmation; actual owner policy may impose additional review for a real exceptional duty, but D16 does not mandate universal dual approval.

### D16-R03 — Exact original scope and source representations

Each operation targets one original message identity, its reviewed current content revision, explicit text ranges/whole fields and selected attachment occurrences. Multiple disjoint ranges in that one message are permitted. It does not target a changing merged root or a search query that can acquire new results. A source-owned representation inventory identifies canonical body, alternate text/HTML, parsed intake copy, raw MIME, attachments and managed derivatives. It must cover the current inbound duplication observed in Core.

Apply selected redaction to every equivalent representation of the selected original. If raw MIME or an alternate body cannot be safely transformed with proven correspondence, remove/restrict that whole representation through its owner; do not keep a secret-bearing “View original email” escape hatch. Explicitly disclose loss of original-format viewing in the review. Independent quoted messages or newly forwarded messages are distinct evidence; they require reviewed additional operations or the broader applicable privacy process, not a claim that every occurrence everywhere was erased.

### D16-R04 — Text, HTML, links and international correctness

The server derives the after-state from the canonical current source and validated selection, never caller-supplied replacement HTML, arbitrary SQL offsets, CSS masks or browser DOM position alone. Mapping must preserve Unicode grapheme boundaries, combining marks, emoji, Thai/RTL text, normalized entities, paragraph boundaries and nested quotes. Do not apply stale substring matching or silently choose the first identical occurrence. Reject empty, malformed, out-of-range or overlapping-invalid selections; coalescing explicitly equivalent overlapping selections must preserve the reviewed result.

Selection mode exposes collapsed text and inspectable link targets without fetching them. Selecting an affected link removes its complete link object, including target and auxiliary text, with that expansion shown before commit. Strip selected values from all corresponding attributes/alternate text. Rebuild safe sanitized HTML and text so removed data cannot survive in hidden attributes, comments, remote resource URLs or accessibility labels. Preserve safe unselected formatting where possible. If exact selective mapping cannot be proved, explain the limitation and offer deliberate whole-body removal; never silently broaden it or claim selective success.

### D16-R05 — Subject, metadata and whole files

Provide an explicit whole-subject-field removal within source correction, producing a neutral display value. Correct derived conversation titles/search snippets that actually copy that source subject; independently authored titles are reviewed separately. Treat free-text filenames, inline-image metadata and other unsafe display fields as content, not automatically harmless audit facts.

Whole selected attachments include their source-owned downloadable bytes, inline occurrences, thumbnails, extracted text and previews. Do not implement painted rectangles or byte-region editing for PDFs, images, audio or archives. A file may be removed without its message body; the body may be removed without unselected files. Shared physical storage must retain correct per-owner references; removing a Support occurrence cannot delete a separately authoritative receipt or a legitimate other-owner file. Secret-bearing sender/recipient identity fields or verified envelope evidence need the identity/P6 privacy owner path; qualified suppression must keep the unsafe presentation unavailable while that owner resolves it. Preserving factual routing and attribution is not permission to display unsafe values. This tool must not rewrite routing, authorship or CRM identity to make a display look clean, and provides no arbitrary header editor.

### D16-R06 — Clean review and irreversible commitment

Use the existing message menu, a focused selection surface, the exact **After removal** preview, **Change selection**, **Cancel**, and **Permanently remove selected content**. The review lists counts/scope, affected original-format access, and unavoidable externally sent/downloaded-copy limits. If an actual preserved/deferred copy applies, show the relevant qualification before the user commits; never promise complete erasure while knowingly retaining an original.

A bounded content-free reason category may be recorded, defaulting to accidental sensitive content. No mandatory narrative, typed secret, repeated generic confirmation, countdown or ordinary second approver. Cancel/unmark works before acceptance. After acceptance, closing the surface does not cancel the durable operation. No optimistic success, post-commit Undo toast, or ordinary Reveal original. An erroneous removal is addressed with a new truthfully attributed clarification or newly supplied content, never reconstruction from an erased original.

### D16-R07 — Accessible selection and continuity

Precise selective removal itself must work with keyboard and supported assistive technology and touch. Whole-body deletion is not an equivalent accessible substitute for selecting one paragraph. Prefer qualified native text-selection controls and Core Base UI primitives over a custom selection canvas. Any authored dragging behavior needs an equivalent single-pointer non-drag path as well as keyboard support. The after-state preview must be the same semantic content the server will commit.

Retain conversation/CRM navigation context, scroll anchor and unaffected drafts. Ensure focus, labels, non-color selection cues, programmatic quiet progress, readable errors, zoom/reflow, target sizing, localization and mobile keyboard behavior. Display times in the user's locale with an exact time available where needed. Use existing base-maia and semantic tokens; no alternate design system, auto-playing motion or new noisy dashboard. The [UX blueprint](phase26-d16-redaction-ux.md) is the complete behavior contract, not a rendered usability test.

### D16-R08 — One atomic authoritative restriction boundary

Within the qualified source mutation boundary, validate actor/tenant/current source revision, acquire the applicable preservation/authority guard, compute the reviewed sanitized result, and commit the source revision/restriction, content-free operation receipt, durable audit and identifier-only cleanup obligations atomically. No external provider call runs inside this database transaction. If that transaction fails, report that removal was not accepted; do not claim containment.

Every subsequent content-serving, materializing, export or send authorization must observe this source restriction/revision. For a derivative that cannot yet demonstrate freshness, deny its affected content rather than serve stale data while a worker catches up. Keep unaffected safe source content available where the boundary can enforce that distinction. Durable cleanup may be asynchronous; correctness may not depend only on a realtime invalidation event or worker timing.

### D16-R09 — Minimal truthful lifecycle

Use an operation receipt with authoritative source outcome and bounded per-owner cleanup evidence, not a second conversation-status machine. The meaningful states are:

| State                       | Meaning and valid continuation                                                                                                                                                                                                                              |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Review only                 | No accepted mutation. Cancel is possible. Stale source requires review again.                                                                                                                                                                               |
| Restricted; review required | Qualified containment committed, but a real preservation requirement or unavailable policy/authority check prevents disposal. Only the qualified owner may resolve custody/release. Unknown is not allowed or permanently denied.                           |
| Removal in progress         | Reviewed disposal accepted; current reads/egress obey the restriction, while mandatory owner cleanup is pending. Retry/reconcile the same operation.                                                                                                        |
| Removal needs attention     | Restriction remains effective; a required cleanup or evidence step failed or exceeded its escalation threshold. No automatic reveal/rollback.                                                                                                               |
| Removed from active use     | Selected source and governed active representations have completion evidence. Any permitted deferred provider/backup custody is separately shown to qualified staff with owner and deadline. This is not an all-copy-erased claim.                          |
| Disposal complete           | All scoped required disposal obligations, including any deferred ones, have evidence, or an accurately recorded policy-permitted exclusion. Never label held retained originals fully erased. External independent copies remain explicitly outside recall. |

An accepted source correction is never undone or repeated merely to repair cleanup evidence. An owner may append a correction to mistaken completion evidence or register a newly discovered governed copy under the same source restriction, reopening cleanup/attention without restoring content. Further removal from a genuinely new/current source selection is a new operation. Hold release does not silently resurrect ordinary content or treat an old preview as fresh disposal authority. A still-valid already accepted disposal obligation may resume after qualified release; if its authorization/scope was never accepted or changed, require fresh review. No automatic cancellation timer or status-driven resurrection exists.

### D16-R10 — Preservation and retention without a vault

The source records/privacy owner supplies an affirmative current disposition for the exact content class and preservation scope. An absent applicable hold in a qualified authoritative check is different from a failed check. The ordinary command cannot override a real hold, required record or contradictory legal instruction. Restrict ordinary access and route the exception to that owner, retaining only necessary evidence in qualified restricted custody, not in Support's normal read model or general Reveal button.

A preservation scope must identify its owner, basis/reference, protected source scope, effective state and review/release responsibility. Hold and destructive operations serialize against the same authoritative guard; a cached boolean check followed by unguarded deletion is insufficient. A hold arriving after irreversible destruction cannot restore lost bytes; preserve ordering and evidence honestly. Audit/operational convenience is not an indefinite retention exception. Support body/attachment baseline retention still needs its separately governed policy; P6 Recent copy's 7/30/Off controls are not that policy. The ordinary affirmative disposition can be the trusted source classification and current tenant policy/hold revision evaluated locally; it does not require a new external legal service or human legal review for every click.

### D16-R11 — Owner-specific cleanup and completion evidence

Maintain an explicit finite inventory for each actually deployed representation: Support source and intake/MIME store, attachment derivatives, search/cache/projection, P6 raw evidence/Recent copy, P17 prepared artifacts, exports and any authorized AI material. Each owner gets a stable operation/source revision/representation identity and cleanup reason without the removed payload. Deduplicate by durable business effect, not one webhook or HTTP attempt. Missing owners block completion and the affected representation's release.

An acknowledgment distinguishes deletion, safe sanitized replacement, revocation pending disposal, permitted retention, not-found-with-qualified-evidence, and unknown/failure. Merely enqueueing or receiving HTTP202 is not deletion. Not-found for one object does not prove all versions/caches are gone. No infinite exact-copy graph or content-wide scanner is required: source references/provenance and a bounded typed inventory suffice. A new representation must join the correction contract before it may retain source content.

### D16-R12 — CRM and cross-surface truth

Support correction changes the source-aware D9 representation shown from each authorized CRM record. Preserve the one actual communication occurrence and original links; remove unsafe excerpts/title/files without manufacturing a second contact activity. The requester, message participant, authenticated staff actor, CRM Party, represented organization, assignee and CRM record owner remain distinct. No email match, conversation membership or redaction capability grants CRM or financial access.

CRM read authorization and source authorization both apply before revealing content, counts, existence, audit details or destinations. A background owner may invalidate a derived CRM projection through its narrow service authority without exposing restricted CRM details to the acting Support worker. Independently authored CRM notes, contact changes, gifts, receipts, refunds, recurring gifts and official records stay with their owning mutation/retention/approval boundary. Known copied sensitive content in those records is routed for owner correction; it is not silently ignored or overwritten. A Support correction cannot satisfy the underlying business action or a complete privacy-rights request.

### D16-R13 — Merge, Undo, related conversations and follow-up

D10 merge/Undo changes topology, not original message identity or correction revision. Redaction applies to that original wherever the current permitted component displays it. Undo must resolve the current sanitized original; no snapshot restoration, payload copy or revoked attachment recovery. A concurrent merge that does not change the selected original content/authority need not force pointless reselection; changed scope/access does.

D12 source citations and derived excerpts observe correction. Independently authored referral summaries or separately forwarded quotes require explicit owner correction when affected; do not indiscriminately destroy separate evidence. Links, unlinking, Party merges, archival, hard deletion and permission changes must not recreate old bodies. D14 timing, reply obligations and D11 delegated work remain factual. Redaction does not count as a response, improve metrics, end follow-up, change Open/Waiting/Resolved, stop D15 following, or complete a refund.

### D16-R14 — Drafts, prepared bytes and irreversible send boundary

Track source-derived quote/file dependencies of drafts and prepared material. On correction, invalidate the affected dependency and block its send; retain safe unrelated authored work. If an edited/pasted quote cannot be safely separated, restrict the affected draft/preparation until its author reviews a clean result. Never silently submit a new cleaned message on their behalf. A manually retyped independent secret is not discoverable through lineage alone; ordinary reports and the broader owner incident/privacy process handle it.

P6's actual `dispatching` transition remains the send linearization boundary. A correction that wins first prevents affected unstarted provider submission and later replay. A dispatch already authorized first may be in flight or ambiguously accepted; preserve that evidence and stop future content-bearing attempts rather than promise recall. Reconcile using permitted body-free provider evidence. A privacy stop takes precedence over otherwise allowed same-key HTTP retries carrying removed bytes.

Never alter sealed P17/P6 payload bytes or member sets under an existing provider identity. Under ADR0032, a sealed batch containing an affected member cannot be partially rewritten/replayed. Preserve every other member's actual/unknown result. Fresh review alone cannot replace an accepted or indeterminate send: a successor needs an existing contract-permitted definitely-unsubmitted/definitely-rejected recovery or a genuinely distinct new business occurrence, with fresh owner-authorized preparation and safe deduplication. No automatic regrouping or new idempotency key evades the stop. Scope restrictions precisely, while respecting the actual shared-envelope boundary. Preserve ADR0032's existing prepared execution-material purge deadline of 24 hours after authority removal; it is not a universal Support or backup retention period.

### D16-R15 — Attachments, caches and current clients

Redaction-eligible attachments and previews require source-authorized private delivery, checked at access time, with no-store treatment and no reusable storage/CDN URL that bypasses source restriction. Reuse a qualified shared delivery capability where it exists; do not claim an existing Core gateway without evidence. Signed URL expiry or auth-key rotation alone is not revocation. Supabase documents cache behavior that can outlive token expiry and delayed invalidation; a row flag cannot make a previously issued URL instantly safe.

Before activation, inventory and revoke/expire/purge legacy paths and prove that no retained reusable URL can serve affected content outside the qualified boundary. Otherwise that delivery path remains disabled. Incomplete legacy containment is an incident/migration fact to record and resolve, never an alternative activation condition or evidence of removal from active use. Stop new grants at restriction; treat a byte stream authorized before restriction honestly as in flight and terminate where feasible. The platform cannot erase a user's already received local copy.

Current clients invalidate affected in-memory bodies/previews/drafts on correction; delayed fetches cannot overwrite a newer source revision. Revalidate on reconnect, visibility return and before protected actions. Avoid durable offline body caches for this content. Previously loaded browser DOM, clipboard, screenshot or download cannot be guaranteed erased remotely. Do not describe UI refresh as retroactive recall.

### D16-R16 — Search, exports, logs, knowledge and AI

Search, filters, snippets, CRM cards, print/export and notification destinations must query the current source gate before returning affected content. A stale index entry cannot contribute a hit, facet, count, sort or match reason for removed text: qualify its indexed source revision before result membership and aggregation, then rebuild it. Purge stale indexes asynchronously only behind that read barrier. A stale replica or cache miss is not authorization; unsafe unknown versions fail closed. Scope caches by tenant, principal/role permission and content revision as applicable; no cache key based only on message ID.

Invalidate pending or hosted generated exports containing affected copies; regenerate a newly authorized sanitized export, preserving truthful identity/version. Independent downloaded exports cannot be recalled. Logs, traces, error reports, audit payloads and job arguments must not capture removed text, URLs or filenames. Correct known accidental log copies through the actual log owner. Existing/future AI retrieval, summaries, embeddings and public knowledge derivatives require source lineage/revocation and permission-aware reads before use; D16 introduces no new AI capability or third-party scanning. Untrusted message instructions never authorize correction, publication or owner actions.

### D16-R17 — Database, RLS and trusted mutation safety

Use tenant-aware keys and enforce same-tenant source/message/attachment/operation relationships with real constraints, not an unconstrained polymorphic UUID. A logical operation is unique by tenant and durable operation identity; each cleanup effect by operation and owned representation. Content revision and original/source attribution are immutable outside the qualified owner command. Actor, tenant, timestamps, approval/hold evidence and effect identities derive from trusted context, not caller fields. Current source and artifact references must have validated cardinality and delete behavior.

Normal application roles cannot directly replace bodies, move a permitted row into another tenant/source, delete correction evidence or bypass the capability through generic table UPDATE/DELETE. Apply least database grants and both USING and WITH CHECK for supported mutations; RLS alone does not constrain every column or privileged bypass. Explicitly constrain post-update ownership/state, function execution grants, search_path and definer privileges where used. Service-role jobs perform equivalent scoped authorization/owner validation. Body-free audit is append-only through its controlled writer; correction never leaves an old secret in an audit diff or content version.

Deleting/retiring a conversation must not cascade away a still-needed restriction/cleanup/restore barrier. Use owner-qualified lifecycle constraints and retain minimal tombstone identity for its justified horizon. Money precision is unchanged: D16 performs no financial mutation and adds no money field. Validate actual deployed grants/policies/storage/functions and negative mutations before release; current generic staff policies are not proof of this contract.

### D16-R18 — Idempotency, concurrency and temporal truth

The same durable operation with identical scope/revision returns its recorded result without another destructive effect or audit occurrence. Reuse with different scope is rejected; timeout queries reconcile the original operation. A stale different removal must re-review current content, even if a second range appears non-overlapping; avoiding accidental over-deletion is worth this uncommon extra step. Do not serialize unrelated messages for the entire tenant.

Redaction, hold changes, relevant permission changes, message edits, content materialization, duplicate intake/replay and send authorization must share the appropriate source revision/guard semantics. Jobs may never repopulate from an older raw copy after the barrier. Duplicate incoming delivery of the same original remains duplicate; a genuinely new message with repeated content remains new evidence and does not inherit a blanket text blacklist. Persist server acceptance/effect/cleanup times as timezone-aware instants; policy changes apply by recorded effective rule and cannot falsify past results.

### D16-R19 — Audit without retaining the secret

Retain only permitted body-free operation ID, tenant/source/message identity, trusted actor, reason category, source revisions, scope kind/count, accepted/effect times, owner outcomes and references needed to prove the correction. Do not keep before/after content diffs, removed strings, raw request bodies, sensitive filenames, URL tokens, reversible payloads or plain hashes of small secrets as audit evidence. Store opaque coordinates/version identity only as needed; do not expose raw deletion geometry unnecessarily to ordinary readers.

Keep original communication facts separate from correction business history and technical worker logs. An internal correction detail is not a new public reply or donor interaction. Audits themselves retain current access and applicable retention/anonymization rules; “body-free” is not synonymous with anonymous or forever-retainable. Identity-owner changes may alter permitted display attribution without fabricating a new actor.

### D16-R20 — Notifications and external communication

Routine correction produces a quiet persistent source marker, not a requester/follower email, unread conversation event, new reply target or assignment notification. D15 optional following remains active while unsafe previews/destinations/unsent content are invalidated. Required security/records/cleanup attention uses its actual owner meaning and shared P17 channel policy, with no copied secret and no duplicate duty queue.

If staff must explain a correction or ask for a safe replacement, they deliberately compose an authorized new reply through the existing P17 Email Studio/P6 Resend path. Any formal privacy/incident notice follows its owner's verified requirements. D16 adds no automatic redaction email template because no such automatic email is selected. Existing templates and prepared artifacts that contain selected content obey R11/R14/R16. No alternate sender, provider synchronization or recall promise.

### D16-R21 — Legal applicability and provider/backup custody

Apply the [US legal/provider evidence](phase26-d16-us-legal-and-provider-evidence.md): actual nonprofit/entity/role/jurisdiction/data facts control obligations. Do not certify all-US compliance, treat all ministries as CCPA-covered/exempt, apply HIPAA merely to any private health sentence, or impose seven-year retention on every email. Formal authenticated rights requests keep full scope, response deadlines, exceptions and provider instructions with the privacy owner; selective correction alone cannot close them. Suspected unauthorized disclosure keeps incident assessment separate.

Provider and backup retention are explicit scoped obligations with permitted basis, owner, deadline and completion evidence. A provider request or retention marketing page is not scoped purge proof. Restore/replay must apply current restriction records before any restored source becomes readable or sendable; preserve the barrier outside the rollback horizon of the restored data. No indefinite backup exception or account deletion workaround. Exact backup requirements vary: California's conditional restore/access exception cannot override another applicable rule, such as Washington's bounded health-data backup deletion provision. Credential/card cases use qualified security/payment response without retaining a general secret vault.

### D16-R22 — Proportionate capacity and operational recovery

Handle one reviewed original message per ordinary correction; no multi-conversation bulk eraser. Reuse existing intake content/file limits and qualify them for correction, including maximum-sized supported HTML and every accepted attachment. Do not import competitor limits or invent performance claims. Before Live activation, publish measured supported sizes/counts, operation latency, queue capacity and worker concurrency in release evidence with concrete units and boundary tests; unsupported selective mapping has an honest whole-body path, not silent truncation.

Use indexed tenant/source/operation and pending-owner lookups, bounded batches, idempotent workers, per-tenant fairness and backpressure. Never rescan all messages or recursively traverse all CRM relationships for one removal. No critical cleanup step depends on manual SQL; qualified operators can inspect body-free status, retry safely, reconcile provider ambiguity or route a retention exception. Failures retain restriction and useful unaffected work.

### D16-R23 — Migration, activation and safe rollback

Introduce source revisions/restrictions and operation evidence additively. Qualify all readers, materializers, dispatchers, export jobs, old API writers and restore tooling before enabling destructive actions. Backfill only proven source relationships; ambiguous legacy MIME/message/file associations remain unavailable to selective correction until resolved or deliberately handled as a larger owned unit. Do not invent matches from email, subject or identical text.

Activate by tenant/capability only after actual grants/RLS, custody policy, cleanup inventory, provider/download path and proofs pass. Unknown-capability old workers cannot process protected sources. A kill switch may stop new permanent operations, but must preserve read restrictions, cleanup/reconciliation and restore barriers. Rolling back code must never restore removed payload or route traffic to old unguarded readers. After irreversible data is written, use a compatible roll-forward/read-only safe mode, not database restore as Undo.

### D16-R24 — Scope boundaries and traceability

D16 is exploratory grooming authority. Carry these clauses, the UX contract, category fixes and proof matrix into later authorized OpenSpec/design/tasks/tickets/test/release artifacts with explicit IDs; none are created now. Reconcile relevant shared P6/P17/records interfaces through their owners, without editing their authoritative facts from Support. D1–D15 keep their ratified meanings, including immutable whole-envelope recovery, no blind replay and source-aware merge/Undo.

This proposal settles ordinary selective redaction. It does not settle all transcript retention durations, create a platform DSAR engine, authorize public deletion controls, build a second CRM, add automated classification, rewrite unrelated owner domains or prove current code safe. These scope limits do not excuse leaving an affected active copy exposed or claiming an unknown obligation complete.

## Individual adversarial category review

Severity and likelihood below are design/source risk assessments, not observed production incident rates. **Critical** means potential serious confidentiality/irreversible-record loss; **High** means consequential security/data/work integrity; **Medium** means material usability, maintenance or operational harm. “Plausible” means a realistic path exists; “conditional” means an identified deployment/legal condition is necessary. Each entry names the permanent correction and exact required clause rather than leaving an unowned warning.

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes. Severity Medium; likelihood plausible.** A small disclosure could lead to deleting useful request history or building an enterprise erasure suite. Vendor workflows demonstrate the correction problem, not ministry frequency; Q16's scenario and D9/D10 continuity show why useful remainder matters. This **narrows A**, preserving the strongest B fallback and rejecting routine C custody. **Permanent fix/exact language:** R01, R05 and R24 require selected original content/whole files, whole-body fallback and no unrelated workflow platform. Proof P01/P02/P39 checks the real outcome and exclusions.

### 2. Brittleness

**Material concern: Yes. Severity High; likelihood plausible.** DOM offsets, repeated strings, alternate HTML/text and stale source versions can remove the wrong content or leave the secret in another representation. Current Core copies intake text/HTML into message bodies; vendor redaction limitations confirm representation mismatch is realistic. This **changes implementation conditions for A**. **Permanent fix/exact language:** R03–R04/R18 require canonical revision mapping, explicit link expansion and safe rejection/fallback; no first-match substitution. P03–P07/P21 prove correctness at boundaries.

### 3. Technical debt

**Material concern: Yes. Severity High; likelihood plausible.** A UI-only patch plus bespoke cleanup scripts would leave divergent message/intake/audit/cache paths. Current generic mutation/storage seams do not establish a permanent correction contract. This **changes A's required foundation**. **Permanent fix/exact language:** R08/R11/R17 require one source mutation boundary, finite typed owner inventory and protected audit; R22 forbids routine direct SQL repair. P09/P16/P30/P37 verify outcome across owners.

### 4. Edge cases

**Material concern: Yes. Severity High; likelihood plausible.** Shared mailboxes, forwarded quotes, duplicate intake, closed messages, merged originals and independently retained files can misdirect deletion or falsely imply full erasure. Identity assumptions cannot authorize mutation. This **narrows removal scope**, not requester eligibility. **Permanent fix/exact language:** R01/R03/R05/R12–R13/R18 preserve exact original IDs, selected occurrences, independent identities/files and owner handling of separate copies. P02/P08/P20–P24/P34 cover these cases without inventing ministry workflows.

### 5. Footguns

**Material concern: Yes. Severity High; likelihood plausible.** A general message editor, auto-selected files, leaked reason text, accidental Enter submission or reassuring Undo can cause irreversible loss/disclosure. Repeated confirmation is not proof of accuracy. This **changes the interaction for A**. **Permanent fix/exact language:** R05–R07/R19 require immutable-author semantics, explicit file scope, exact after-state review, one named commitment and content-free audit. P01/P05/P08/P28/P35 check mistakes before acceptance and truthful behavior afterward.

### 6. Tenant safety

**Material concern: Yes. Severity Critical; likelihood conditional on a defective boundary.** A guessed source/object/operation ID, generic staff policy, unscoped job or cache may expose or destroy another tenant's content. The inspected migration grants broad staff operations, so UI capability checks alone are insufficient. This **changes A's release gates**. **Permanent fix/exact language:** R02/R12/R15–R18 require tenant-aware relationships, scoped read/egress and service parity. P10–P14/P30 require two-tenant positive/negative testing, including post-update forbidden-state attempts.

### 7. Database, RLS, and authorization safety

**Material concern: Yes. Severity Critical; likelihood plausible if current generic grants are reused.** Ordinary UPDATE/DELETE may bypass redaction authority, move ownership or erase audit. Nullable/orphan references and service roles can evade application conventions. This **requires structural amendments**. **Permanent fix/exact language:** R17 specifies trusted attribution, constrained same-tenant references, immutable scope, controlled writer/grants, USING/WITH CHECK and service/function/storage parity; R10 serializes holds. P10–P16/P31 exercise database roles directly. Money types are checked as unaffected because no financial mutation is authorized.

### 8. Overengineering

**Material concern: Yes. Severity Medium; likelihood plausible.** A generic redaction graph, AI detector, legal-rule engine, reveal vault or PDF editor would inflate dependencies and UX for a narrow need. Competitor features do not demonstrate Asym demand. This **narrows A**. **Permanent fix/exact language:** R01/R05/R11/R22/R24 require a finite deployed representation inventory and existing owner boundaries, excluding speculative platform features. P39 verifies exclusions and the simple message-level journey.

### 9. UX/UI and user friction

**Material concern: Yes. Severity High; likelihood plausible.** Selection may be inaccessible, scope unclear, stale success reassuring, or CRM navigation lose context. A mouse-only partial tool with whole-body accessibility fallback is unequal and dangerous. W3C allows review/confirmation rather than mandatory Undo. This **changes A's required UX**. **Permanent fix/exact language:** R06–R09/R12 and the full blueprint specify exact preview, keyboard/touch/AT precision, quiet states and preserved context. P01/P03/P28/P35–P36 require actual rendered interaction testing; no visual-quality claim is made from prose alone.

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes. Severity High; likelihood plausible.** A CRM projection, merge root, provider body or cached previous revision could become write authority; an audit could preserve the removed secret. P6/ADR0031 separate communication facts from retained bodies. This **changes the source contract**. **Permanent fix/exact language:** R03/R08/R11–R13/R19 give Support original correction authority, owner-controlled derivatives and immutable permitted facts. P09/P16/P20/P24/P29 prove no resurrection or duplicate truth.

### 11. Support Hub–CRM integration and cross-surface continuity

**Material concern: Yes. Severity Critical for disclosure; likelihood plausible.** A corrected Support view could coexist with an unsafe CRM snippet; linking could grant access or removal could destroy a receipt/person. D9 already mandates permission-aware source projection. This **narrows A to its true ownership**. **Permanent fix/exact language:** R12 preserves both authorizations, one communication identity and independently owned CRM/giving facts; known separate copies get owner correction. P24/P25/P34 prove shared context without authority propagation or data duplication.

### 12. Hidden coupling

**Material concern: Yes. Severity High; likelihood plausible.** Cleanup might depend on current merge topology, one notification implementation, provider plan details or a generic party graph. A new derivative may silently bypass correction. This **changes integration requirements**. **Permanent fix/exact language:** R11/R13–R16/R24 require stable original identities and typed owner obligations; any new content-retaining representation must qualify first. P20/P26/P30/P39 verify bounded source coupling and independence of ordinary CRM work.

### 13. Failure modes

**Material concern: Yes. Severity High; likelihood plausible.** A transaction can succeed before a response is lost, blob deletion can fail, provider success can be ambiguous, or an index may lag. Restoring visibility on failure compounds exposure. This **changes completion semantics**. **Permanent fix/exact language:** R08–R11/R14/R22 require durable receipts, deny-before-cleanup, truthful partial outcomes and owner reconciliation. P09/P17–P19/P26/P30 prove failure before/after acceptance separately.

### 14. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes. Severity Critical; likelihood plausible.** Concurrent send/hold/redaction or retry after merge can invalidate a individually valid check; old materialization can repopulate the secret. P6 dispatching and ADR0032 envelope rules are governing, not optional vendor patterns. This **changes A's command/worker contract**. **Permanent fix/exact language:** R08–R10/R14/R18 require ordered guards, exact business-effect idempotency and no sealed-envelope rewrite. P17–P23/P26/P31–P33 exercise races and late events.

### 15. Data integrity risks

**Material concern: Yes. Severity High; likelihood plausible.** Physical-file deduplication can remove another owner's evidence; stale source imports can resurrect content; deleting audit/tombstones can break restore protection. These are realistic shared-data failure paths, not a need for a new CRM. This **narrows deletion and strengthens invariants**. **Permanent fix/exact language:** R05/R12/R17–R19/R21 preserve per-owner references, source revisions and minimal restriction evidence. P08/P15/P21/P24/P32–P34 verify conservation and currentness.

### 16. Security and privacy risks

**Material concern: Yes. Severity Critical; likelihood conditional/plausible.** Removed content may remain in raw MIME, signed URLs, summaries, downloads or logs; retention/hold mistakes may violate actual obligations. A broad “US compliant” label would be unsupported. This **requires amendments, not rejection of A**. **Permanent fix/exact language:** R02–R05/R10/R14–R21 plus the legal evidence require least privilege, complete managed scope, truthful external limits and applicable owner decisions. P10–P16/P25–P34/P40 prove protections; actual legal applicability remains deployment evidence.

### 17. Scalability and performance risks

**Material concern: Yes. Severity Medium–High; likelihood conditional on volume/large content.** Global searches, unbounded cleanup fan-out, long transaction locks or a noisy tenant can delay privacy work for others. No Asym throughput benchmark has been measured. This **narrows implementation strategy**. **Permanent fix/exact language:** R03/R11/R18/R22 require one original, indexed obligations, bounded fair workers and measured limits for accepted intake content. P37/P38 require concrete capacity and boundary evidence; no unverified “scalable” claim is accepted.

### 18. Operational burden

**Material concern: Yes. Severity Medium; likelihood plausible.** Staff could need SQL repair, repeated manual provider chasing, or legal review for every click. A permanent pending queue without an owner is not a solution. This **changes recovery/admin experience**. **Permanent fix/exact language:** R09–R11/R21–R22 provide one qualified owner per obligation, safe retry/reconcile and policy-level default decisions. O02–O05 set signals and responses; P19/P30/P40 prove recovery without routine developer intervention.

### 19. Observability and auditability gaps

**Material concern: Yes. Severity High; likelihood plausible.** A success toast or worker log may hide incomplete removal; a detailed audit can reproduce the secret. Current generic audit mutability is a source concern. This **changes required evidence**. **Permanent fix/exact language:** R09/R11/R19 distinguish source outcome, owner disposal evidence, business history and logs, with no payload. P16/P19/P29/P30 verify attributable correction and secret-free diagnosis. O01–O06 define concrete monitored failures.

### 20. Dependency and integration risks

**Material concern: Yes. Severity High; likelihood plausible.** Resend retention/cleanup semantics, Supabase CDN behavior or a downstream artifact contract can invalidate immediate-erasure assumptions. Account deletion and guessed purge APIs would be dangerous. This **changes activation conditions**. **Permanent fix/exact language:** R11/R14–R16/R21 require provider-qualified scoped mechanisms, no replay of stopped payload and explicit residual custody. P26/P27/P30/P40 require actual integration evidence; competitor architecture is not inferred.

### 21. Migration, rollout, and upgrade risks

**Material concern: Yes. Severity Critical; likelihood plausible in mixed versions.** An old reader/writer, ambiguous backfill or rollback can revive content after irreversible removal; a kill switch can accidentally disable cleanup. This **changes release sequencing**. **Permanent fix/exact language:** R23 requires expand/qualify/activate, guarded old workers, source-safe backfills and roll-forward after erasure. P31–P34/P38 verify both schema/code compatibility directions, legacy URLs and restore barriers.

### 22. Testability, traceability, and proof

**Material concern: Yes. Severity High; likelihood plausible.** Vague “redacts everywhere” or “beautiful/compliant” claims cannot be tested, and grooming could be mistaken for running code. Prior source probes are not release evidence. This **changes required acceptance language**. **Permanent fix/exact language:** R01–R24 and P01–P40 define falsifiable outcomes with shared-owner traceability; R24 preserves the stage boundary. The documentation validator proves recording/preservation only; implementation, RLS, provider, concurrency and browser proofs remain required, not passed.

### 23. Other development hazards

**Material concern: Yes. Severity High; likelihood plausible.** Irreversible correction could conceal staff wrongdoing, a credential leak could be mistaken for repaired security, or a broad legal request could be closed after removing one paragraph. Hiding evidence and incomplete privacy fulfillment have distinct consequences. This **narrows A's claimed outcome**. **Permanent fix/exact language:** R02/R10/R19/R21 preserve qualified authority and body-free accountability, route security/rights duties separately, and never label redaction a complete incident remedy or business resolution. P16/P29/P40 verify those outcomes. No additional unrelated module or money/AI feature is justified.

## Independently testable acceptance and release proof

Every row is **required and not yet executed against a D16 implementation**. IDs are downstream traceability, not invented passing tests. Use actual production seams and outcomes rather than tests that mirror these paragraphs.

| Proof | Falsifiable outcome                                                                                                                                                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01   | Select one private paragraph and one file, review exact remainder, cancel/unmark safely, then commit once; ordinary work remains.                                                                                                        |
| P02   | Closed/internal/incoming/sent-source correction without reopening or altering assignment; deliberate whole-body fallback does not select other files.                                                                                    |
| P03   | Keyboard and supported AT/touch can remove exactly the same range as mouse; no forced overbroad fallback.                                                                                                                                |
| P04   | Thai, RTL, emoji, combining marks, entities, zero-width characters and mixed HTML/text preserve reviewed graphemes.                                                                                                                      |
| P05   | Sensitive href/alt/title/comment/remote URL cannot survive selected object removal; preview discloses whole-link expansion.                                                                                                              |
| P06   | Duplicate strings, nested/hidden quotes and disjoint/overlapping selections affect only reviewed occurrences.                                                                                                                            |
| P07   | Stale, forged, empty, malformed and unsupported selection fails safely; arbitrary replacement HTML cannot rewrite history.                                                                                                               |
| P08   | Selected attachment, inline bytes, extracted preview and filename removed; unrelated file and independent official owner artifact remain.                                                                                                |
| P09   | Transaction fault before acceptance has no false success; fault after acceptance leaves effective restriction and durable cleanup.                                                                                                       |
| P10   | Two tenants cannot read, redact, change scope, probe receipts or obtain storage content using each other's IDs.                                                                                                                          |
| P11   | Reader/assignee/follower/requester/CRM owner without redaction capability denied; authorized actor succeeds only in source scope.                                                                                                        |
| P12   | Direct database roles cannot bypass capability, move rows to forbidden tenant/source, mutate actor, or delete audit/guard.                                                                                                               |
| P13   | USING and WITH CHECK, function grants/search_path, storage policies and privileged worker paths enforce equivalent boundaries.                                                                                                           |
| P14   | Permission revocation or identity uncertainty between review/commit/read/send produces safe denial, without secret-bearing errors.                                                                                                       |
| P15   | FK/nullability/delete/cardinality tests prevent orphan or cross-tenant source/attachment/operation relationships.                                                                                                                        |
| P16   | Audit/trace/error/job inspection contains no original payload, secret filename/URL, content diff or low-entropy secret hash.                                                                                                             |
| P17   | Lost response and duplicate request recover one operation/effect; changed input under the same key rejects.                                                                                                                              |
| P18   | Two simultaneous removals cannot apply stale offsets; replay cannot resurrect an older sanitized revision.                                                                                                                               |
| P19   | Failed/unknown cleanup remains unavailable, shows correct owner/state and can reconcile without new destructive intent; corrected false completion/newly discovered managed copy reopens cleanup without restoring content.              |
| P20   | Merge during review and Undo after removal preserve exact original correction while unaffected originals remain.                                                                                                                         |
| P21   | Duplicate intake/provider replay/materialization after restriction cannot repopulate parsed or message content.                                                                                                                          |
| P22   | Genuine new forwarded/repeated message is new evidence, not silently erased by a hidden global blacklist.                                                                                                                                |
| P23   | Concurrent hold and disposal have one authoritative order; unavailable check blocks disposal; released custody does not reveal old content.                                                                                              |
| P24   | All authorized CRM appearances show the same safe source without new communication rows or Party/giving mutation.                                                                                                                        |
| P25   | Restricted CRM user gets no extra snippet/count/hold details via Support correction; known independent copied note uses its owner.                                                                                                       |
| P26   | Draft, P17 preparation and P6 dispatch races respect source stop and actual in-flight evidence, including sealed mixed-member batches.                                                                                                   |
| P27   | Legacy signed URLs/CDN/browser cache and new gateway paths demonstrate the claimed restriction; prior downloads are honestly excluded.                                                                                                   |
| P28   | Timeout, progress, completion, held and needs-attention states are keyboard-readable and persistent, without an Undo promise.                                                                                                            |
| P29   | Redaction creates no requester/follower email, successful reply, changed target metrics, Resolve or completed delegated action.                                                                                                          |
| P30   | Search/CRM/Recent copy/prepared/export/AI/log owners each provide scoped cleanup evidence; missing owner prevents completion. An exact removed synthetic search value produces no hit/facet/count through the obsolete indexed revision. |
| P31   | Old-code/new-schema and new-code/old-schema compatibility cannot expose corrected payload; unsupported workers fail safely.                                                                                                              |
| P32   | Restore from before removal applies current independently preserved barrier before reads, exports, regeneration or sends.                                                                                                                |
| P33   | Kill switch stops new disposal without disabling restrictions/recovery; rollback cannot act as Undo.                                                                                                                                     |
| P34   | Source archival/deletion, Party merge/unlink and shared blob lifecycle preserve required correction evidence and unrelated records.                                                                                                      |
| P35   | Focus, no-hover actions, 200%/400% zoom, target sizing, reflow, mobile keyboard and quiet status announcements meet the shared UI contract.                                                                                              |
| P36   | On reconnect/stale fetch/route return, current source version wins; unaffected draft/navigation preserved; unsupported offline body storage absent.                                                                                      |
| P37   | Maximum accepted source/file sizes and actual multi-tenant workload meet published numeric capacity/latency limits with no truncation/starvation.                                                                                        |
| P38   | Mixed-version rollout/backfill and legacy representation inventory prove every enabled path conforms before tenant activation.                                                                                                           |
| P39   | No unrelated CRM/task mutation, automatic scanner, PDF editor, reveal archive, bulk eraser or replacement notification platform is introduced.                                                                                           |
| P40   | Applicable rights/hold/records/provider/backup evidence and deadlines are signed off by actual owners; routine redaction cannot close broader duties.                                                                                    |

## Synthesis and order of work

**Before recording the answer:** resolve the ordinary behavior, ownership, UX, exact source scope, irreversible-versus-restricted outcomes, no-recall limits and legal applicability distinctions. This review has resolved those choices and records them as proposed amendments to selected A. It does not need a speculative platform build or a repeat choice between A/B/C.

**Capture in later authorized spec/design:** carry R01–R24, the full UX blueprint, owner inventory, state table, category amendments and P01–P40. First define source representation/provenance and the common restriction guard; then specify the source command and hold boundary, qualified download/read path, and P6/P17/CRM correction conformance. These dependencies determine whether selection can mean what the UI promises.

**Require in implementation:** qualify source-safe readers/writers and owner cleanup before enabling the command; protect grants/audit; build exact selection/preview; prove source/send/hold races; qualify actual provider and backup custody; then run migration/restore/capacity/accessibility journeys. Activate only the demonstrated tenant paths. Runtime defects found in current code are release prerequisites within their owner scope, not authorization to repair them during grooming.

**Monitor after proven activation:** only the signals below. Monitoring never substitutes for an authorization, no-resurrection, retention or source-read invariant. Thresholds are proposed operating controls, not legal grace periods or measured performance claims. Earlier applicable owner/legal deadlines always govern.

| Control | Signal and threshold                                                                                                                            | Accountable owner                                 | Response                                                                                                                                                   |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| O01     | Any verified post-restriction unauthorized content read/egress or resurrected payload: threshold 1                                              | Security incident owner + affected platform owner | Contain the affected path immediately, preserve body-free evidence, disable unsafe release and investigate/repair before re-enable.                        |
| O02     | Active-copy cleanup unresolved for 15 elapsed minutes or 3 consecutive failed attempts, whichever comes first                                   | Support engineering on-call                       | Keep restriction; inspect scoped owner result, retry/reconcile safely, escalate to the failing representation owner. No customer/follower blast.           |
| O03     | Deferred provider/backup obligation reaches its recorded disposal deadline without evidence: threshold 1                                        | Provider/records owner                            | Escalate the contractual/legal exception immediately, retain restriction, obtain evidence or approved corrective response; never silently extend deadline. |
| O04     | Restricted preservation/unknown-policy item lacks an accountable owner: threshold 1; assigned item misses its recorded review date: threshold 1 | Tenant records/privacy administrator              | Assign qualified custody promptly or resolve the check; review scope/release through owner authority. Do not auto-reveal or auto-erase.                    |
| O05     | Missing source-revision barrier in restore/rollout qualification: threshold 1 failed check                                                      | Database/platform release owner                   | Block restore activation or rollout; correct barrier/compatibility and rerun the failed proof.                                                             |
| O06     | Cleanup backlog exceeds measured supported capacity, or p95 command latency exceeds the published release budget for 15 minutes                 | Support/platform operations owner                 | Apply per-tenant backpressure, investigate capacity regression, preserve intake and restriction; adjust capacity only after measured proof.                |

## Final disposition and record limits

**Accept with required amendments.** A remains the strongest recommendation: precise removal preserves useful service context with less retained-sensitive-data burden than routine masking. The permanent fix is source-owned irreversible correction with a small human workflow and explicit owner cleanup, not a cosmetic UI mask or a second compliance system.

D16's selection is recorded; these complete amendments are **proposed pending founder ratification**. D1–D15 and their evidence are preserved. No Q17 is presented, and no formal spec, schema/runtime changes, tickets, GitHub/provider/DNS changes, credentials or real messages are created. Current-source investigation and document checks do not establish implemented RLS, provider purge, browser accessibility, legal applicability or production capacity; the proof matrix states exactly what later release must demonstrate.

## Founder ratification — 11 September 2026

> Yes, I ratify this, including all the amendments, additions, adjustments, changes, and updates you’ve made. Record the ratified decision and all changes in full for this grill-with-docs session.

The founder fully ratifies A—Selective permanent redaction and every adopted amendment, addition, adjustment, change and update in the complete D16 package: the exact corrected decision; D16-R01–R24; D16-P01–P40; all23 individual adversarial category findings with impact, severity, likelihood, evidence, decision effect and permanent fixes; the complete staff/CRM/selection/confirmation/accessibility blueprint; US legal and provider qualifications; all adopted independent corrections and final synthesis; the four glossary concepts; and all six operational signal/threshold/owner/response controls.

Acceptance includes exact original-source selection and whole-file scope; safe Unicode/HTML/link mapping and deliberate whole-body fallback; current explicit correction capability; one reviewed permanent confirmation; no ordinary Reveal/Undo; source-owned current restriction and protected body-free receipt/audit; alternate intake/MIME/file/derived-copy cleanup; qualified preservation and unknown-policy handling; truthful active-use, pending, held and completed-disposal outcomes; appended correction of mistaken completion evidence; owner-specific provider/backup deadlines; source-aware CRM/merge/Undo/citation continuity; unchanged work, reply metrics and following meaning; safe drafts, actual P6 dispatching and ADR0032 immutable whole-envelope recovery; no blind replacement of accepted/indeterminate sends; existing prepared-material purge deadline; private gated downloads and legacy URL activation barriers; stale search membership suppression; safe identity-display containment; grants/RLS/service-role parity; replay/restore/mixed-version protection; and all forty downstream proof groups and measured-capacity/activation requirements.

The legal assessment is ratified with its limits: no blanket US-compliance certification, universal nonprofit exemption or obligation, universal retention duration, privacy-request completion, incident-resolution claim or external recall promise. Applicable owner duties, actual preservation, payment/security responses and provider/backup evidence remain necessary. No automatic scanner, binary editor, reveal vault, generic legal/workflow platform, second CRM or routine correction email is introduced.

**Accept with required amendments** remains the historical review disposition; every adopted amendment is now fully accepted. The substantive decision, category/proof tables, UX, evidence, legal qualifications and prior source/proof records remain preserved. Historical proposed/pending/no-Q17 language in those preserved blocks describes the prior stage and is superseded only as to acceptance and advancement by this ratification. D1–D15 remain fully ratified and unchanged. Continue to the next single researched question; do not request repeat D16 approval.

The [ratification and Q17 validation](d16-ratification-q17-validation.json) verifies current acceptance separately from the unchanged historical D16 validation. No implementation, formal specification, tickets, GitHub/provider/DNS/credential changes or real messages are authorized by recording this acceptance.
