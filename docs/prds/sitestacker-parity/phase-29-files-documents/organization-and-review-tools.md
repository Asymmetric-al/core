# Phase 29 — Organization, review tools and governed resources

This canonical volume specifies intended behavior adopted by Q38–Q60, except the private-share and different-recipient replacement contracts owned by the ordinary-request volume. It preserves the distinct ordinary-request, P28 resource, P6/P17 communication and shared-custody owners. The shared requirements in [proof.md](proof.md) apply to every requirement below. They are not a replacement for the source-specific consequences, exceptions and tests in this volume.

The interface shall use Core's shared Base UI/base-maia components and semantic tokens. Source authority, durable result, current projection, technical readiness, business acceptance and physical outcome are separate. No requirement declares a native command, source adapter, provider profile, participant study or release gate complete. Exact source decision and proof locators are recorded in the companion mapping; dated research and ratification prose do not become a second runtime authority.

## REQ29-C01 — Find ordinary files by approved names and details

**Story US29-C01:** As authorized staff, I want to find documents using permitted names and file details, so that I can return to relevant work without extracting or exposing private document bodies.

**Decision basis:** Q38, ratified decision paragraphs 1–3 and 6; source metadata/search owners.

General ordinary-file discovery shall match only the current source-approved field set for eligible uses and its declared version/currentness semantics. Names, typed metadata and admitted authored catalog descriptions may be searchable; request instructions, messages, notes, extracted text and generated summaries shall not become general metadata merely by being relabeled. Efficient native indexes over admitted metadata remain permitted.

- **AC29-C01-01:** The finder identifies its scope as names and file details. A phrase present only inside a document does not produce a general hit, ranking contribution, suggestion or snippet through indexing, on-demand scans, cached preview text or client extraction.
- **AC29-C01-02:** Existing independently qualified source search and Find inside an opened authorized representation retain their exact audience, corpus and coverage; the finder cannot aggregate them into a broader corpus.
- **AC29-C01-03:** The documented plain-text matching contract qualifies Unicode, accents, case, punctuation, long names and identifiers. Exact approved searchable names/identifiers are findable under that contract without silently discarding significant characters or importing another domain's query grammar.
- **AC29-C01-04:** Query input is data, not executable SQL, regex or an undeclared advanced language. Display permission alone does not make a field searchable.
- **AC29-C01-05:** General body search remains outside this scope. Native SQL, a free library, spare quota or an existing allowance cannot auto-enable it or establish zero added Vercel/Supabase billing; later expansion requires its own explicit evidence-backed decision.

## REQ29-C02 — Authorize every search contribution and current result

**Story US29-C02:** As a person using file discovery, I want results and counts to reflect my current permitted work, so that search does not disclose another source's records or offer stale authority.

**Decision basis:** Q38 paragraphs 4–7 and 10; REQ29-P02–P06.

The source shall apply current field/use eligibility before a hit, rank, count, facet, suggestion, duplicate cue, grouping, pagination or serialization. A shared byte object or one visible association does not disclose other uses or union their permissions. Search projections are rebuildable derived data, never authority for source currentness or byte access.

- **AC29-C02-01:** Results bind the actual permitted source/use and qualified current or historical version. Latest-uploaded bytes cannot silently replace the source-selected basis.
- **AC29-C02-02:** Preview, original read, download and every later source action reauthorize independently. Permitted metadata may remain visible when preview is unavailable; a hit does not promise safe, readable or accepted evidence.
- **AC29-C02-03:** Current restrictive facts fence serving before asynchronous cleanup. Replay, reindex, stale cache and restore cannot revive withdrawn fields, disposed content or older permission.
- **AC29-C02-04:** Definite policy exclusions remain undisclosed and do not themselves make a valid search fail. Failure to establish required authorization or complete coverage cannot produce a definitive successful zero or exact count.
- **AC29-C02-05:** Bounded server-side filtering, ordering and stable pagination precede output. The application does not fetch the whole tenant corpus for browser filtering or use forbidden fields for rank. Pagination declares its concurrent-change behavior without retaining old authority or requiring a global locked snapshot.

## REQ29-C03 — Recover a useful accessible search without widening scope

**Story US29-C03:** As a staff reader, I want clear search states and a usable return path, so that sparse metadata or a failed preview does not force downloads, retagging or repeated work.

**Decision basis:** Q38 paragraphs 8–9; REQ29-P04/P10/P11.

The finder shall expose useful permitted source/type/date context and visible removable filters. Loading, complete no matches, incomplete or unavailable search, and unavailable preview are distinct. Source navigation and a qualified reader are offered where allowed without broadening tenant, source, history or body scope.

- **AC29-C03-01:** A user can refine or continue a capped/broad query and retry unavailable coverage. No hidden-file identity or hidden-match count is disclosed to explain absence.
- **AC29-C03-02:** Recoverable errors preserve lawful query/filter/scroll/focus return state. Search does not require renaming, manual tagging, body-text copying, bulk download, repeated upload or an external office viewer.
- **AC29-C03-03:** Keyboard, touch, AT, reflow, IME/RTL and localized display remain usable; status updates neither steal focus nor announce the whole result list on every keystroke.
- **AC29-C03-04:** Query/context/permission changes fence obsolete responses and private caches. Private queries, filters, recent-history values and result fragments do not enter general logs, analytics, public URLs, shared caches or durable offline stores by default.
- **AC29-C03-05:** Saved views and recent work organize only current authorized discovery; sharing a definition never freezes access to its results.

## REQ29-C04 — Keep discovery bounded and repairable

**Story US29-C04:** As the discovery operator, I want failures and rebuilds to preserve source truth, so that restoring a search projection cannot roll back legitimate work or leak old data.

**Decision basis:** Q38 paragraphs 5 and 10–11; REQ29-P03/P06/P13–P18.

Use the smallest compatible source/API/metadata/view/query mechanisms and persist only justified data. Source writes and independently lawful discovery survive recoverable secondary projection failure through durable bounded reconciliation. Search creates no financial facts or approval/workflow states.

- **AC29-C04-01:** Activation declares finite source/field/query/page/selection/corpus/concurrency and recovery budgets, actual query plans/indexes and measured baseline/incremental resource use with units and responsible owners; no fixed-invoice or unmeasured speed claim substitutes.
- **AC29-C04-02:** Typed tenant/source/use relations and immutable attribution cannot be retargeted through allowed writes, jobs, alternate readers or privileged functions; effective all-door proof follows the shared contract.
- **AC29-C04-03:** Backfill, mixed-version operation and restore preserve the exact metadata scope and later restrictions. Stopping an affected finder/projection does not undo source facts or disable independent qualified source capabilities.
- **AC29-C04-04:** Failed search retries cause no source business effects. Supported source/operator repair is available without routine production SQL or an unsafe cached/public fallback.

## REQ29-C05 — Author reusable request definitions without copying a case

**Story US29-C05:** As authorized request staff, I want an optional reusable template, so that I can prepare consistent ordinary work without copying another person's evidence or authority.

**Decision basis:** Q39 paragraphs 1–2; Document Request Template; REQ29-P01/P02/P04.

The ordinary source shall own optional reusable sets of item definitions and instructions for independent never-issued drafts. Start from scratch remains equally available. Template use, maintenance, draft preparation and issuance are distinct current powers; adjacent email/CMS/workflow templates confer none of them.

- **AC29-C05-01:** Save from a permitted never-issued draft or direct authoring identifies a nonempty compatible reusable set and actual sharing scope; only source-admitted definition fields are copied.
- **AC29-C05-02:** Subject/recipient/record identities, answers, evidence, review/conversation history, acceptance, assertions, proofs/grants, reviewer assignments, actual clock ends and communication plans are excluded. New-instance facts resolve through current context and valid defaults without needless re-entry.
- **AC29-C05-03:** Staff review actual names/instruction prose for embedded case-specific material. A field allowlist is not an automatic sanitization guarantee; no AI classifier is required or implied.
- **AC29-C05-04:** There is no general form builder, executable recipe, marketplace, automatic issuance, bulk amendment or whole-Workflow prerequisite.

## REQ29-C06 — Save and maintain one coherent template revision

**Story US29-C06:** As a template maintainer, I want deliberate saves and recoverable retirement, so that other staff never use a half-edited or silently overwritten definition set.

**Decision basis:** Q39 paragraphs 3, 8–9 and 12; REQ29-P05/P06/P08/P15.

One deliberate Save shall create a coherent validated usable revision. Working input/autosave is distinct from the shared basis. Material save, retirement and make-available correction use current expected basis and trusted attribution; concurrent maintainers cannot reuse one revision for different meaning.

- **AC29-C06-01:** Retirement stops new application, not existing requests. A qualified successor or deliberate make-available action over still-lawful content repairs a mistake while preserving history.
- **AC29-C06-02:** Making content available establishes a new current availability basis; it does not revive an old uncommitted application against the retired basis. Matching committed effects still reconcile first.
- **AC29-C06-03:** Required copied meaning and minimal provenance are retained under actual source policy without cascading template deletion into requests or retaining unlimited private text.
- **AC29-C06-04:** For accidentally reusable private facts, the capable maintainer/privacy route stops future use, corrects the template and assesses/remediates affected copies under each source's current authority. It does not silently rewrite issued work, reveal every derived use or claim delivered information recalled.
- **AC29-C06-05:** No routine Publish ceremony, second approver or recurring review bureaucracy is added to Save. Source/history visibility is current; curation never grants access to derived requests.

## REQ29-C07 — Apply an exact template to an independent draft

**Story US29-C07:** As request staff, I want to apply the template I reviewed without losing my draft, so that preparation is predictable and later template edits cannot change my request.

**Decision basis:** Q39 paragraphs 4–6; REQ29-P05/P06.

Application shall consume the exact reviewed saved revision/availability and expected never-issued target basis under current template and target authority. Choosing a starter before typing is the simple default. Existing input is not silently appended to or overwritten; any supported replacement is deliberate, impact-visible and coherent, without requiring a generic merge system.

- **AC29-C07-01:** Edit/retire/restriction-first returns conflict, refresh or unavailable; copy-first creates the complete independent draft. The system neither substitutes latest content nor silently drops incompatible members and claims success.
- **AC29-C07-02:** All intended definitions, fresh draft/item identities, exact member/origin attribution, mandatory history and original outcome commit coherently. Equal names alone do not identify duplicate items.
- **AC29-C07-03:** Later template editing/renaming/retirement or author departure does not rewrite/delete copied content. Current source/privacy restrictions still govern; mutable untracked URLs cannot change instruction meaning or become grants.
- **AC29-C07-04:** A lost-response replay recovers the original permitted application after retirement, role change, draft editing or issuance without recreating members or overwriting newer work. Changed intent conflicts; a genuinely new independent draft is not deduplicated merely by equal content.

## REQ29-C08 — Keep template preparation inert and the ordinary request complete

**Story US29-C08:** As a request author, I want prepared definitions to lead into normal issuance, so that using a template adds no new recipient step or hidden side effect.

**Decision basis:** Q39 paragraphs 7–12; REQ29-P07–P11/P13–P18.

Lawful preparation does not require an online recipient or already-satisfied first-issue readiness. Actual issuance validates the current adopted draft, source/purpose/recipient, restrictions, responsibility, clocks and communication rules. Issuance-first fences stale application; application/edit-first requires issuance to validate the changed basis.

- **AC29-C08-01:** Template save/application/edit never issues, sends, changes existing requiredness, evidence, acceptance, fulfillment, cancellation or access. Issued changes use their own source commands.
- **AC29-C08-02:** Choose template/Start from scratch, actual readable item preview and normal adaptation distinguish Saved template, Draft prepared and Request issued. Participants/reviewers receive the ordinary journey without another account, template step or inherited approval.
- **AC29-C08-03:** Current safe text rendering, keyboard/non-drag ordering where offered, AT/focus/mobile/IME/RTL and preserved lawful input are qualified; no executable template markup or default private offline archive.
- **AC29-C08-04:** Finite catalog/item/text/query/page/history/concurrency/recovery/retention budgets and actual workloads are qualified. Adjacent catalogs/person-specific old requests are not automatically migrated by name; any authorized conversion preserves real provenance.
- **AC29-C08-05:** Rollout fences incompatible old writers/readers and preserves copied content, operation lineage and restrictions. Stop new unsafe applications without erasing admitted drafts; use supported repair/roll-forward where downgrade would lose history or safety.

## REQ29-C09 — Offer the exact optional recipient update notice

**Story US29-C09:** As staff publishing an ordinary request update, I want a clear optional email choice, so that the recipient can be informed without confusing communication with the source change.

**Decision basis:** Q40 paragraphs 1–3; REQ29-P09.

A genuine durable Q36 item addition or Q37 material-instruction publication may produce one minimal notice to its exact qualified intended recipient. Drafts, template work, unchanged publication, task/scan/provider events are not triggers. Current on-return guidance remains complete without email; source publication is not contact or access authority.

- **AC29-C09-01:** The qualified purpose starts Enabled with initial staff choice On only when actual source/actor/recipient/Live plan/channel eligibility permits. Authorized tenant control may disable it or choose its initial On/Off default; staff may decline optional mail.
- **AC29-C09-02:** Defaults seed only genuinely new uninitialized review, preserving choice and provenance. Missing, legacy, conflicting or ambiguous input is never On; malformed combined intent is rejected/reviewed, not silently converted to deliberate Off.
- **AC29-C09-03:** The existing final review shows safe actual destination, source act and notice consequence together, with explicit submitted choice. No compulsory toggle, reason, extra approver or second confirmation is added.
- **AC29-C09-04:** A material precommit recipient/destination/scope/eligibility change requires inline revalidation with lawful input and a source-only path where permitted. It cannot silently retarget or downgrade reviewed source-plus-mail intent.

## REQ29-C10 — Coordinate fresh-access and update choices without substitution

**Story US29-C10:** As staff making a combined fresh-access and request-update change, I want to see both notice purposes and their count, so that I can deliberately choose neither, either or both.

**Decision basis:** Q40 paragraph 4; Q20 original rules preserved.

Only one actual co-admitting Q13 plus Q36/Q37 review for the same exact request, recipient and qualified destination may initialize a still-uninitialized Q40 choice Off when independently eligible Q20 is already visibly On. Explain why the additional update email begins Off. This changes Q40 initialization only.

- **AC29-C10-01:** Unknown Q20 eligibility does not qualify. Actual joint source basis is checked at admission, and material precommit change receives inline review.
- **AC29-C10-02:** An already initialized Q40 choice never flips, including when fresh access is added later. Later Q20 toggling/failure/block/uncertainty cannot silently change or substitute Q40.
- **AC29-C10-03:** The review truthfully shows zero, one or two requested notices. There is no combined message/event, cross-purpose text deduplication, fallback send or claim that Q20 delivered the Q40 update.

## REQ29-C11 — Stop only the old update notice whose usefulness or authority ended

**Story US29-C11:** As a recipient, I want update notices to reflect still-relevant source work, so that old publications do not become misleading instructions after the work changed.

**Decision basis:** Q40 paragraphs 5–9; REQ29-P05/P06/P09/P10.

The exact complete bounded occurrence releases only under top-level Live authority, with a proved zero only when both authority and zero are known. Reserved/unknown binding creates no parent and later activation does not catch up history. Source publication, explicit choice, original handoff/history and permanent occurrence/plan/recipient/material identity remain coherent.

- **AC29-C11-01:** As the Q40-specific exception, Tenant Disabled stops affected historical Q40 admissions at sealing and every later provider-call admission, preserving an intervening Disabled interval even if no worker ran. On cannot revive Off/zero/stopped occurrences; default-only edits remain future-review-only.
- **AC29-C11-02:** Every call requires the notified item to remain an outstanding, unaccepted need on the same unfinished request; Q37 additionally requires the exact notified instruction revision. Relevant acceptance/removal/supersession/restriction/F/cancel ends the old occurrence permanently; later reversal does not revive it.
- **AC29-C11-03:** A later same-item Q37 does not itself end Q36 addition awareness when that need and frozen variant/action remain applicable. Unrelated changes alone do not stop it. Unknown evaluation blocks safely without inventing a proved terminal stop.
- **AC29-C11-04:** Notice work never holds fulfillment, adds requiredness, renews access or forces new upload/account/acknowledgment. Staff-only Q28/reassessment remains real work with the actual next actor; later portal expiry alone is neither blanket factual-notice authority nor prohibition.
- **AC29-C11-05:** A frozen cue cannot be rewritten as successor/cancellation/fresh-access material. Genuine later publication is a distinct qualified occurrence; matching original effects reconcile before new-work checks, under current disclosure. Possible in-flight effects are not recalled.

## REQ29-C12 — Keep update content, recovery and readable copies narrowly qualified

**Story US29-C12:** As a recipient or authorized support reader, I want only useful safe update context, so that an awareness email does not disclose evidence or expose retry material through history.

**Decision basis:** Q40 paragraphs 10–13; REQ29-P02–P05/P08/P09/P14/P16.

Content shall safely distinguish the actual updated request. Sensitive titles, instructions, names, reasons, evidence, conversation and capability-bearing URLs are not automatically safe. If adequate safe identity/content is unavailable, do not send a confusing generic cue. The exact current recipient/contact branch, including any qualified no-Party path, must work through preparation, authenticated material, dispatch and reveal; never fabricate a Party for convenience.

- **AC29-C12-01:** On cannot override suppression/privacy/consent. Protected return uses the source's scanner-safe current doorway, not direct storage or broader history. Plain-text/images-off views preserve safe identity, factual meaning and descriptive qualified action.
- **AC29-C12-02:** Prepared material and provider/account/environment/connection/attempt identity remain immutable. Seal possible-send evidence before I/O; timeout/lease expiry/missing callback cannot justify new key or occurrence.
- **AC29-C12-03:** Only the existing three qualified indeterminate same-envelope retry classes apply, with at most two follow-up HTTP calls after the initial call and the earliest material/member/provider deadline. Recheck Disabled/usefulness/safety on each call; callbacks cannot rewind source truth or prove reading.
- **AC29-C12-04:** The exact optional external-participant material class and finite nonextendable utility/purge profile qualify before Live. Durable history is body-free. Readable Recent is optional and separately reveal-qualified; otherwise use no readable copy without blocking independent lawful source work/email.
- **AC29-C12-05:** A qualified Recent copy uses the shorter of tenant Off/7/30-day choice and exact contract 0/7/30-day ceiling; unknown class is zero. Shortening follows its owner, lengthening affects future copies only, and view/retry never renews existing expiry. The copy is inert, not retry material.
- **AC29-C12-06:** Only expressly qualified transport/protected-action carriers contain their permitted material. That exception grants no general telemetry, history, export, cache or default offline disclosure. Trusted source/recipient attribution cannot be retargeted by an allowed row mutation.

## REQ29-C13 — Show publication and notice recovery as separate outcomes

**Story US29-C13:** As staff who changed a request, I want the committed update and its optional email status reported separately, so that mail failure does not make me publish again.

**Decision basis:** Q40 paragraphs 5, 11 and 14; REQ29-P10/P11/P13–P18.

Known valid source publication stays valid when mail is unavailable, declined, stopped, failed or unknown. Recovery uses trustworthy original facts; current settings cannot invent original On, authority or historical zero. If original mail authority is unproved, retain the update and block historical sending without falsely calling it declined.

- **AC29-C13-01:** Before publication, staff may lawfully edit/discard/correct choice; afterward actual Q33/Q34/Q36/Q37/privacy remedies apply. No universal Undo, repeated publication, resend or recall is the repair. A genuine corrective publication gets its own qualified choice.
- **AC29-C13-02:** Source and mail outcomes persist with current result authority and accessible shared UI; typing or toggling neither publishes nor sends/navigates. Preserve lawful input/focus and reject late private results after context change.
- **AC29-C13-03:** Exact finite workload/material/recovery qualification and actual-role/source/release/stop/retry races are required, including the compound Q20 case. Prospective rollout fences old writers; no guessed On backfill/historical catch-up or exactly-once physical-delivery claim.

## REQ29-C14 — File an exact ordinary evidence use in one optional home

**Story US29-C14:** As filing staff, I want one clear location for each evidence entry, so that I can organize work without changing its source meaning or permissions.

**Decision basis:** Q42 paragraphs 1–5; REQ29-P01–P04/P08.

An exact admitted ordinary contribution/use has one optional home or Unfiled in the Tenant × environment × ordinary-request namespace. The unit is not a whole multi-file item, digest, provider object, person or universal Logical Document. Different uses of equal bytes retain independent organization and authority. Page/Article and Media contracts remain distinct.

- **AC29-C14-01:** Receipt, inspection, review and lawful use work without a folder/label and through recoverable filing outage. Checking/rejected/historical/fulfilled/canceled/retained status neither grants nor universally prohibits current source-authorized filing; participant expiry does not decide staff rights.
- **AC29-C14-02:** Move/label/view changes no version, candidate, acceptance, fulfillment, publication, permission, share term, retention, provider bytes, chronology, review work or notice. Organization history is separately restricted and attributable.
- **AC29-C14-03:** New independent participant and staff uses begin Unfiled with no copied labels. An actual Q03 correction or expressly qualified Q28 replacement may carry only the predecessor home once at admission, with same Tenant/environment/request/item, ordered predecessor/destination basis and current maintenance authority.
- **AC29-C14-04:** Unknown/incompatible optional filing leaves an independently valid new receipt Unfiled, preserving its original carry-or-Unfiled outcome. It never excuses unknown source admission/custody/evidence authority. Retry cannot copy a later home; non-byte updates to the same use keep existing home/labels.
- **AC29-C14-05:** No folder ACL, inherited permission, participant tree, public folder or cross-source relocation is added. Hidden location is not falsely Unfiled; names/paths/counts/order/errors and byte actions require their own current disclosure.

## REQ29-C15 — Move and remove folders without touching evidence

**Story US29-C15:** As authorized filing staff, I want safe folder maintenance and finite moves, so that organizing evidence cannot delete it or hide a failed operation.

**Decision basis:** Q42 paragraphs 6 and 8–9; REQ29-P03/P05/P06/P10.

Provide authorized folder create/rename/move and entry Move to folder/Remove from folder. Remove from folder changes only the entry's home to Unfiled. Stable folder IDs survive rename/reparent; same-namespace parentage is acyclic, with qualified normalized sibling uniqueness including null-parent roots.

- **AC29-C15-01:** Remove folder is empty-only. Current authoritative state must prove no direct entries or child folders, including undisplayed members; incomplete/denied coverage is not empty.
- **AC29-C15-02:** Offer the ordinary finite Move flow for entries/children, then separate deliberate removal. Never recursively delete evidence, silently rehome hidden contents or call provider folder deletion.
- **AC29-C15-03:** A current source/organization operator uses permitted exact membership facts and the same Move/Unfile commands to repair inaccessible memberships. Reconciliation may clear only proved-stale organization references; broad body access, hidden counts and routine SQL are not the remedy.
- **AC29-C15-04:** One finite bulk Move is all-or-none for exact selected identities/expected state, not a refreshed all-matching query. Competing moves, hierarchy/removal and correction initialization share a lawful ordering boundary.
- **AC29-C15-05:** Committed original recovery cannot move entries back after newer work. Changed intent conflicts; expiry/restore retains minimum result/dedup evidence or safely rejects unverifiable stale operations. Any offered Undo is a fresh current-authorized forward move.

## REQ29-C16 — Use labels and live views without disguising source decisions

**Story US29-C16:** As staff browsing organized evidence, I want labels and saved criteria to keep their meaning, so that they never imitate acceptance or silently widen a view.

**Decision basis:** Q42 paragraph 7; Q43 scoped shared-view amendment; REQ29-P04/P08.

Labels are optional nonauthorizing metadata. A label such as Reviewed is visibly and behaviorally distinct from actual source acceptance. Preserve display values and stable IDs; normalization cannot silently merge different folders, labels or evidence.

- **AC29-C16-01:** Saved definitions are validated live queries/display choices, not result snapshots, memberships or permissions. Current private/system definitions remain usable; shared publication follows only REQ29-C18–C22.
- **AC29-C16-02:** Rename preserves criterion identity. Removed, inaccessible or invalid criteria never disappear silently to broaden results; show safely unavailable and offer deliberate qualified repair.
- **AC29-C16-03:** Viewing a folder or definition does not reveal hidden entries, paths, other uses or body contents. Metadata discovery may remain useful independently of preview readiness.

## REQ29-C17 — Make ordinary filing small, accessible and recoverable

**Story US29-C17:** As a staff member organizing files, I want a simple current-scope view and Move picker, so that filing is optional help rather than another workflow.

**Decision basis:** Q42 paragraphs 10–14; REQ29-P11/P13–P18.

Show All request files within an always-visible ordinary scope, Unfiled, filters and permitted source context/current location. This folder means direct entries; a separately supported descendants mode is explicit and bounded. There is no implied cross-product catalog or silent recursive selection.

- **AC29-C17-01:** The searchable Move picker commits deliberately, preserves lawful selection/query/return state and reports persistent success/conflict/failure/unknown beyond a toast. Routine filing needs no label, reason, second approver or notice.
- **AC29-C17-02:** Keyboard/non-drag pointer, focus restoration, restrained AT status, mobile/zoom/touch, international names/IME/RTL and weak-network recovery work without exposing the staff tree to participants or external readers.
- **AC29-C17-03:** Private names/paths/labels/predicates/associations are excluded from ordinary telemetry and default durable offline storage; context changes fence late results and unapproved mutation replay.
- **AC29-C17-04:** Qualify finite list/picker/hierarchy/label/view/bulk/concurrency workloads through existing source/query/UI boundaries; no general hierarchy engine, shortcut layer, automatic classification, sync provider or speculative closure-table mandate.
- **AC29-C17-05:** Additive migration uses real retained-data/source-use mapping, not provider keys/names/uploaders/digests or mass source rewrites. Mixed writers and restored records preserve identity/history and current restrictions; stopping filing does not undo source receipts.

## REQ29-C18 — Share a reviewed view with named eligible staff

**Story US29-C18:** As an eligible view author, I want to share a useful ordinary-file view directly, so that colleagues can reuse its definition without receiving extra file access.

**Decision basis:** Q43 paragraphs 1–3; scoped P9/Q42 amendment; REQ29-P02/P06.

One stable view is private by default. Deliberate Share promotes its exact reviewed definition/audience basis; combined Save and share may commit reviewed edits in one action. No mandatory duplicate private/shared pair, result copy or extra view-manager designation is required. Actual source/P12 protected-grant, delegated ceiling, self-benefit and separation-of-duties rules still apply.

- **AC29-C18-01:** The initial audience is a finite explicit set of current eligible staff Active Tenant Assignments in the same Tenant/environment/ordinary-source envelope. No bare profile/email/Party, demo team, dynamic group, Everyone, external recipient or automatic future-staff audience substitutes.
- **AC29-C18-02:** Exact duplicate assignments normalize once; stale or partly invalid audience rejects without partial publication. Empty initial selection neither publishes nor silently saves unsaved input; preserve the private draft unless a separate private Save was deliberate.
- **AC29-C18-03:** Named audience use does not grant maintenance, resharing, export or additional record access. Adding eligible named assignments remains normal Manage sharing; a new audience form requires explicit owner adoption.
- **AC29-C18-04:** Removing the last stored reader uses Stop sharing with a lawful maintainer, or Remove/retire without one. Temporary zero currently eligible readers does not automatically privatize retained bindings.

## REQ29-C19 — Execute a shared definition under each viewer's authority

**Story US29-C19:** As a shared-view reader, I want its criteria and results to be both permitted and truthful, so that a useful shared query does not disclose another person's records or silently change scope.

**Decision basis:** Q43 paragraphs 4–5 and 12; REQ29-P04/P07/P13.

Authorize existence, title, description, criteria/field values, maintainer, audience and history separately from matching records. Then authorize current source fields/rows before rank/count/facet/page/action. The publisher need not see all rows another qualified viewer sees; equal result sets and nonempty results are not prerequisites.

- **AC29-C19-01:** Undisclosable/unexecutable definition meaning yields safe unavailable, not stripped predicates, substituted defaults, concealed criteria executed anyway or automatic redirection to a broader list. Mandatory source restrictions still apply without exposing protected policy details.
- **AC29-C19-02:** P9's typed versioned query contract binds predicate/sort/group/source and schema/default resolution over Q38-approved metadata. Unrelated default/schema/configuration changes cannot broaden or retarget it.
- **AC29-C19-03:** Qualified viewer-relative values, dates/zones and source current/historical selection use the actual viewer, never the creator or newest upload. Unsupported/retired references need safe repair or deliberate validated save; no SQL/code/body-search grammar.
- **AC29-C19-04:** Ad-hoc context links require current source/query disclosure; saved-definition links also require current definition permission. A URL grants no authority and cannot expose private predicates/tokens. Return to request files is explicit and labels its broader scope.

## REQ29-C20 — Maintain shared views without publishing personal experiments

**Story US29-C20:** As a view maintainer, I want explicit shared saves and supported continuity, so that browsing or my departure cannot unexpectedly change colleagues' work.

**Decision basis:** Q43 paragraphs 6–7 and 9–10; REQ29-P03/P05/P06.

A shared view has one current accountable maintainer, initially its publisher, plus actual source-scoped administrative continuity. Creator attribution stays historical. Viewing confers no maintenance; current save/audience/transfer commands compare exact expected lifecycle/definition/audience basis.

- **AC29-C20-01:** Browsing/sorting/filter experiments are personal working state with a visible unsaved difference. Only deliberate Save shared view changes the reusable definition; stale old private-save routes cannot mutate newly shared state.
- **AC29-C20-02:** Authorized Save a personal copy creates a new private identity from permitted reviewed meaning without audience or maintenance grants. It is independent, subject to its own current source restrictions, not synchronized or automatically recalled by original unsharing.
- **AC29-C20-03:** Publication cannot force personal defaults, tabs or pins. Hide for me and shared-definition mutation remain distinct actual capabilities.
- **AC29-C20-04:** Transfer validates an exact current eligible assignment, preserves creator/actual actor and unchanged audience/source unless separately reviewed. Departure/loss of author power ends their writes, not independently valid shared work; applicable named-grantor restrictions still win.
- **AC29-C20-05:** Scoped admin can transfer/retire an orphan through supported commands, without blanket inspection/takeover of never-shared or later-private views. Definition/audience/history/outcome commit coherently; stale edits preserve lawful working input instead of auto-merge/last-wins.

## REQ29-C21 — Withdraw shared availability and recover privately

**Story US29-C21:** As an authorized view maintainer or operator, I want to remove sharing safely, so that ending access does not delete files or strand an orphaned private definition.

**Decision basis:** Q43 paragraphs 8–10; REQ29-P05/P08/P10.

Audience removal blocks that binding's future access; matching email/new assignment cannot revive it. Stop sharing clears readers and leaves the definition private to the current lawful maintainer, not automatically its historical creator. With no lawful maintainer, transfer first or immediately Remove/retire; urgent withdrawal cannot wait for replacement ownership.

- **AC29-C21-01:** Remove view withdraws definition/audience from normal use without deleting files, source records or independent copies. Retain only justified restricted history and minimum replay evidence.
- **AC29-C21-02:** Any lawful retained recovery is private under current authority with no restored old audience; sharing again is a new reviewed act. No old link, retry, backup/default/name reuse revives withdrawn publication.
- **AC29-C21-03:** Temporary technical/policy unavailability differs from explicit removal; only still-valid unchanged bindings can resume under current rules. No implicit privatization of temporarily ineligible bindings.
- **AC29-C21-04:** Initial Share failure preserves private state; shared-update failure preserves prior committed meaning subject to current denials. Exact committed replay precedes new eligibility and cannot reopen after Stop; changed intent conflicts, unverifiable stale operations reject safely.

## REQ29-C22 — Present and operate shared views without a new collaboration platform

**Story US29-C22:** As staff using shared views, I want clear controls and honest result states, so that shared organization adds little overhead and no notification or permission machinery.

**Decision basis:** Q43 paragraphs 11–14; REQ29-P03/P04/P11/P13–P18.

Use private Save, Share view with bounded eligible-staff selection, Shared marker/permitted maintainer, Save shared view, Save personal copy, Manage sharing and actual removal/hide controls. Show source scope and audience at the normal deliberate commit. Unavailable definition and valid no matches are distinct; persistent outcomes and lawful drafts survive recoverable errors.

- **AC29-C22-01:** Keyboard/non-drag/touch/AT/focus/reflow/zoom/IME/RTL/international names and slow-network return remain usable. No email, notification feed, approval queue or presence system follows.
- **AC29-C22-02:** Context/assignment/definition/audience/restriction changes fence late responses/caches; no viewing another person's results or private predicate/audience telemetry. No silent offline share replay.
- **AC29-C22-03:** Exact same-scope IDs, unique audience references, valid private/shared/withdrawn states and protected creator attribution apply across every door. Profile deletion cannot cascade shared meaning/history; names only disambiguate permitted context, not prove identity or global uniqueness.
- **AC29-C22-04:** Qualify finite definition/audience/catalog/query/write/recovery budgets and actual set-based plans, preserving inherited P12 limits. Avoid full directory/result loading, per-row policy loops, eager global counts and new vendor/expiry engines.
- **AC29-C22-05:** Migrate current private views without mass publication, fence old personal writers/cascades, preserve retained facts and qualify stop/roll-forward/restore against current restrictions before activation.

## REQ29-C23 — Request a bounded originals ZIP with honest completeness

**Story US29-C23:** As staff with original-export authority, I want one ZIP for an exact selected set, so that I can download it conveniently without hidden omissions or broader access.

**Decision basis:** Q44 paragraphs 1–3; REQ29-P01/P02/P04–P06.

This is an expressly qualified ordinary staff original-download/export purpose, not authority inferred from Read, preview, acceptance, folder/view or participant access. One Tenant/environment/source envelope preserves every applicable Legal Entity, classification, origin, purpose, residency and egress restriction, including Q28 origin constraints. No universal accepted/preview-ready/unfinished condition or compulsory new scan is invented. Official artifacts, D26 records packages and external shares remain separate.

- **AC29-C23-01:** Freeze finite explicit exact use/original-version bindings at authoritative admission. Exact duplicate selections normalize once; equal names/bytes or different uses do not merge provenance. Folder/query/multi-file item/all future matches is not an implicit selection.
- **AC29-C23-02:** A denied or unknown whole-command/source/P12 gate blocks preparation; shrinking the set cannot evade it. Intended selection, member outcomes, admitted members, result generation and egress attempts remain separate.
- **AC29-C23-03:** Only positively qualified partial-output authority permits excluded/unresolved individual members. Complete means every normalized intended binding is represented; Partial requires at least one included original and an intelligible permitted account of incompleteness.
- **AC29-C23-04:** Exact reviewed partial output requires deliberate Download available files. Zero eligible yields no success ZIP; unknown is neither complete nor zero. If necessary partial-state disclosure would expose hidden names/counts/associations/hashes, withhold rather than mislead.
- **AC29-C23-05:** Never substitute latest/corrected bytes or a changed query on retry. Download neither accepts evidence, fulfills work, changes retention nor proves destination custody.

## REQ29-C24 — Seal exact originals with a readable integrity manifest

**Story US29-C24:** As a ZIP recipient, I want reliable original members and a readable contents list, so that I can identify what was included without mistaking the archive for an official or complete business record.

**Decision basis:** Q44 paragraphs 4–6; REQ29-P06/P08/P12/P16.

Prepare privately and admit one immutable complete generation only after every included original, archive member and manifest fact passes current admission/integrity checks. Each normalized intended binding has one included/not-included outcome; each included binding has one distinct original member plus one contents manifest. Internal counts reconcile even when disclosure hides detail.

- **AC29-C24-01:** Bind exact use/version, verified byte length/digest, safe delivery-name mapping, completeness/outcomes, producer/profile and finite end. Protect preparation references against disposal/locator reuse without extending rights or source retention.
- **AC29-C24-02:** Verify copied bytes and usable complete archive before Ready; uploaded object, ZIP signature or CRC alone is insufficient. Whole-ZIP length/digest belongs to the protected external result, not a self-referential manifest hash. Candidates never overwrite the sealed winner.
- **AC29-C24-03:** Use qualified interoperable bounded Store/Deflate ZIP, ZIP64 only when required/compatible, preferably flat names with a reserved manifest name and deterministic collisions. No multipart, self-extracting/password workflow or custom archive browser is selected.
- **AC29-C24-04:** Qualify Unicode/normalization/case/long-name/device/separator/traversal/bidi/header hazards; never overwrite a member or rename source identity. No symlink/special-file metadata, executable flags, arbitrary extras, credentials or unapproved comments. Original archives stay opaque; no unpack/execute/convert/OCR/merge.
- **AC29-C24-05:** One accessible UTF-8 contents file states intended-set complete/partial, preparation time/zone, safe member names, permitted opaque use/version references, lengths/digests and only disclosable exclusions. Escape untrusted structure; omit internal paths/credentials/provider URLs. UI uses the same sealed facts, not a separately authored PDF/HTML/CSV report.
- **AC29-C24-06:** Manifest and archive timestamps are not source-event chronology, malware clearance, signature validity, evidence acceptance, verified device save or official-record completeness.

## REQ29-C25 — Serve the immutable ZIP only as a wholly authorized representation

**Story US29-C25:** As an initiating staff member, I want current safe retrieval of my exact result, so that a later access change cannot leak one protected member through the whole archive.

**Decision basis:** Q44 paragraphs 7–8; REQ29-P02/P04/P13.

Bind preparation/result to the initiating principal, exact validated Active Tenant Assignment and source purpose; workers re-resolve original governed context and their own current authority. No shared archive audience is created. Every status/manifest response reauthorizes its exposed facts, and every ZIP/header response authorizes all included originals and embedded manifest facts as one indivisible representation.

- **AC29-C25-01:** A forbidden/unknown member or manifest fact blocks the old ZIP, not merely a filtered range. Changed permitted set/manifest needs a new deliberate reviewed result; never in-place reseal or automatic residual package.
- **AC29-C25-02:** Temporary unavailability may clear before the unchanged result's original end where source rules permit; canceled/expired/terminally withdrawn availability never automatically revives.
- **AC29-C25-03:** Deliver through current private application attachment semantics with safe international filenames/no-store as required, no reusable provider bearer or public fallback. Full GET, HEAD, conditional/validator/range/error, length and hash disclosure all share actual admission.
- **AC29-C25-04:** Govern streams set-wise under actual P12 audit/metering/current-context/revocation/expiry rules, without per-member remote policy loops. Each egress/redownload/range attempt needs its own current admission; replay of preparation is not unlimited transfer.
- **AC29-C25-05:** Qualified range resume binds one immutable generation/validator/length; never concatenate rebuilt/new archives. Unsupported range behavior is truthful/standards-compatible. Observed transport start/completion does not prove human reading, local save or destination custody, and emitted bytes cannot be recalled.

## REQ29-C26 — Cancel, expire and clean ZIP preparation without disposing originals

**Story US29-C26:** As a staff member or operator, I want ended preparation to stay ended and clean up safely, so that retries or late workers cannot reopen availability or delete source evidence.

**Decision basis:** Q44 paragraphs 9–10; REQ29-P05–P08/P10/P16.

Preparation progress, sealed completeness, current availability, transfer evidence and cleanup are independent facts. Leaving a page does not cancel accepted work. Explicit cancellation or fixed source-qualified deadline fences new promotion/delivery; equality is expired, and actual earlier material caps still apply. Current session/step-up gates do not silently rewrite the material end.

- **AC29-C26-01:** Reads/retries/interruption never extend the original end. Late workers/provider acknowledgments cannot make ended/deletion-claimed material Ready. In-flight stop follows actual feasible bounds without recall promises.
- **AC29-C26-02:** Prepare again after cancellation/expiry/changed scope is a new reviewed current command with a newly qualified finite end, not reactivation.
- **AC29-C26-03:** Cleanup orders against builders/readers/holds through reciprocal bounded fences and removes only intended transient copies under their actual class. It cannot dispose originals, erase required outcomes or release holds.
- **AC29-C26-04:** A source hold does not automatically retain every optional ZIP; actual copy-class scope controls. Unresolved cleanup authority restricts the copy rather than deleting it. Required holds/failed cleanup may retain restricted copies after delivery ends, with actual records/budget resolution.
- **AC29-C26-05:** Exact original preparation/result reconciles before fresh eligibility under current disclosure. Changed intent conflicts; before seal bounded retries finish original work, after seal redownload uses unchanged bytes. No storage I/O remains inside a database transaction or receipt expiry permits duplicate old effect.

## REQ29-C27 — Preserve ZIP provenance and safe operator recovery

**Story US29-C27:** As an authorized operator, I want exact protected preparation and delivery evidence, so that I can repair unknown outcomes without reading another person's archive or guessing what happened.

**Decision basis:** Q44 paragraphs 10–11 and 13; REQ29-P03/P05/P06/P14/P16.

The source shall own one guarded command/result boundary, exact operation/candidate/generation identities, immutable principal/scope/version attribution and same-scope member/outcome relations. Maintain minimum semantic replay evidence or reject unverifiable stale work; required history cannot vanish through actor/parent cascade.

- **AC29-C27-01:** Expressible native uniqueness, allowed states/types, bounded nonnegative counts/bytes and required digests/deadlines enforce one normalized binding, one result head and safe unique member names. Current cross-row eligibility remains at the source boundary.
- **AC29-C27-02:** Caller fields cannot alter completeness, digest, lifecycle, source version or identity; every alternate door preserves the shared P12/grant/RLS contract. Global name/digest uniqueness creates no cross-tenant oracle.
- **AC29-C27-03:** Protected business result/access evidence records actual intent, generation, integrity, lifecycle and observed stream facts. General telemetry omits manifests, names, selected payloads, bodies, associations, keys and credentials.
- **AC29-C27-04:** Supported cancel/reconcile/retry-cleanup exposes permitted operational facts only. Repair power does not grant original or another requester's result access. Status/count/error/cache paths and late responses retain current privacy.

## REQ29-C28 — Keep bulk download usable and finitely qualified

**Story US29-C28:** As staff downloading documents, I want a simple fast path and usable slow/error paths, so that one archive does not become a new archive-management product.

**Decision basis:** Q44 paragraphs 12 and 14–16; REQ29-P11/P13/P15–P18.

Show exact finite source selection and useful known count/byte estimate. One deliberate Download may prepare/deliver the unchanged complete set while actual active user intent/current context remains qualified. Slow/returning/partial cases show Ready and a deliberate current Download rather than starting unexpectedly later.

- **AC29-C28-01:** Reduced-set acknowledgment is explicit; browser activation limitations fall back to the usable Download button, not false failure/repeated preparation. Preserve lawful selection; offer smaller selection and independent individual download where allowed.
- **AC29-C28-02:** No mandatory essay/repeated confirmation, archive center, email purpose, sync client, forced extractor or second automatic per-file batch mode is introduced. Keyboard/non-drag/AT/focus/320-CSS-pixel controls/zoom/names/IME/RTL/zone and interrupted-network tasks qualify.
- **AC29-C28-03:** Finite member/name/manifest/input/output/CPU/memory/buffer/time/concurrency/retry/staging/audit/egress budgets include actual candidates/orphans/held copies and central-directory overhead. Capacity exhaustion stops/bounds new admission with repair, not wrongful deletion or silent exemption.
- **AC29-C28-04:** Use a maintained qualified ZIP writer and existing seams, not a whole-library browser-memory archive or unbounded/per-row-policy loop. Over-limit work is not silently truncated or split into an invented multipart system. ZIP is not promised smaller, faster, free or bill-neutral.
- **AC29-C28-05:** Actual extraction devices/workloads, private serving, races/restore and old-reader/writer fences qualify before activation. Census/migration preserves IDs/digests and independent individual retrieval; no inferred export grants, specialist reclassification or historical public URL fallback.

## REQ29-C29 — Comment on exact ordinary evidence without requiring a preview

**Story US29-C29:** As a staff reviewer, I want useful exact-version comments in the evidence context, so that I can explain feedback without creating a separate task, inbox or document copy.

**Decision basis:** Q45 paragraphs 1–3; Document Review Comment; REQ29-P01/P02/P04/P12.

The ordinary source shall own a flat collection of comments on an immutable exact use/file-version/purpose/Tenant/environment and trusted original author context. Surface the same collection in compatible request/evidence/task/reader context, without a task per note, Party-note/post-comment reuse, cross-use thread, reply tree or Resolve/read-receipt obligation. Q28 origin/target restrictions remain.

- **AC29-C29-01:** Each saved comment has bounded nonblank useful plain text and at most one optional qualified location. Concise feedback can suffice; no title/reason essay or semantic-quality classifier. General comments need no location or successful preview.
- **AC29-C29-02:** Supported typed page/slide/sheet/cell/line references and optional point/rectangle are distinct from unverified explanatory text. New visual authoring is a narrow D32 extension only for qualified static PDF/images, not every rendered Office page.
- **AC29-C29-03:** Preserve original bytes/signatures and separate embedded original annotations. No empty pin, screenshot/attachment/crop copy, arbitrary selector/HTML/SVG, ink/redaction/OCR/AI/body index/annotated export or automatic URL fetch is added.
- **AC29-C29-04:** Safe text rendering treats @names/URLs as text, not invitations, permissions or notification triggers. Participant-facing communication remains a separate Q23/Q30 act; external share readers do not automatically receive staff comments.

## REQ29-C30 — Preserve precise location meaning across view changes

**Story US29-C30:** As a reviewer using a location, I want it to point to the intended exact page or region, so that zoom, a new rendition or a newer file cannot move my feedback to different evidence.

**Decision basis:** Q45 paragraphs 4–6; REQ29-P08/P12.

Machine locations bind exact source use/version and trusted qualified representation geometry/profile/options/coverage. Source page identity differs from printed labels, preview pagination, slide/sheet/cell/literal-line meanings and browser wrapping. A compact location reference is not copied document text/image bytes, and its identity/retention cannot depend solely on an expiring rendition.

- **AC29-C30-01:** New/moved visual locations use one closed bounded finite point/rectangle in declared coordinates with qualified precision. Validate shape/range/page membership and nondegenerate geometry before and after rounding; reject NaN/infinity/malformed/collapsed/out-of-bounds values without relocation.
- **AC29-C30-02:** Qualified mapping accounts for zoom, rotation, crop/view box, pixel ratio, orientation and resize. Screen pixels, caller geometry, file extension, equal page count/dimensions/text/digest alone are not mapping proof.
- **AC29-C30-03:** New file versions never inherit comments/locations/approval. Regenerated representations navigate only with proved exact compatible correspondence; otherwise retain independently lawful text/context and show Location unavailable.
- **AC29-C30-04:** Text-only correction may retain an unchanged stored anchor without fresh preview under current disclosure. Moving/adding geometry requires current qualification. Remove location deliberately changes only this revision to general same-version feedback; expiry cannot silently drop anchors or retain previews forever.

## REQ29-C31 — Post and correct a comment as one coherent deliberate action

**Story US29-C31:** As a comment author, I want text and location to save together and recover honestly, so that a lost response or concurrent edit cannot create an orphan marker or overwrite another revision.

**Decision basis:** Q45 paragraphs 7–9; REQ29-P02–P06/P10.

Authorize creation/read/edit/withdraw/restore/administration/attribution/count/history/location/navigation independently through source/P12. Comment and byte/representation rights differ. The command binds trusted acting context/time, immutable target, expected current source/comment basis and durable semantic intent; current text/location/lifecycle, required history, affected review basis and result commit coherently.

- **AC29-C31-01:** Draft keystrokes/cursor/pointer/zoom/pan/hover and unsaved marker adjustments cause no database writes. Only deliberate Post/Save changes/Withdraw/Restore mutates.
- **AC29-C31-02:** Exact committed original recovery precedes new eligibility under current result permission. Changed intent conflicts; equal text does not collapse genuinely new follow-ups. After current authority/basis checks, identical canonical content/location is honest unchanged, not an Edited revision; stale ABA still conflicts.
- **AC29-C31-03:** Current-authorized own editing records actual editor/time and appropriate Edited presentation, preserving source-required prior meaning. No silent merge, author impersonation or target/version reparenting.
- **AC29-C31-04:** Wrong-version post can be withdrawn and separately posted to the correct qualified target. A scoped operator may restrict/withdraw/restore where authorized or add separately attributed correction, not rewrite another author's prose as theirs.
- **AC29-C31-05:** Unknown/denied authority is not empty/cached success. Preserve lawful working input on conflict, fence late protected results and retain minimum replay evidence or reject unverifiable stale commands. No arbitrary edit timer or extra approver is introduced.

## REQ29-C32 — Withdraw and restore only the lawful current comment

**Story US29-C32:** As a comment author or scoped operator, I want accidental withdrawal to be recoverable, so that ordinary mistakes do not require history erasure or privileged database edits.

**Decision basis:** Q45 paragraphs 9–10 and 12; REQ29-P08/P10/P14/P16.

Withdrawal removes active text/marker from normal presentation, retaining only currently lawful indicator/history. It is not physical deletion, evidence disposal or recall of past reading. Deliberate Restore of the exact current withdrawn revision uses the latest lawfully retained text/location as a new attributed revision; an Undo affordance may invoke this same durable command.

- **AC29-C32-01:** An unchanged retained location may return as unavailable rather than being discarded or forcing preview. Restore cannot select arbitrary old history, change author/target, bypass restriction/redaction, reconstruct disposed text, restart retention or revive access.
- **AC29-C32-02:** Author departure preserves required attribution and actual scoped administrative continuity. No new Trash platform, universal recovery window or irreversible-delete shortcut is added.
- **AC29-C32-03:** Current text, source-required history, security evidence, diagnostics and disposable reader state have independent policies. D32 expiry neither deletes a comment nor grants historic bytes; comment retention does not automatically hold a preview.
- **AC29-C32-04:** Governed restriction/disposal applies to current/historical projections, caches, exports/backups and restore suppression. Technical telemetry omits text, quotes, private descriptions/geometry/names/URLs; operators get scoped diagnostics, not blanket content.

## REQ29-C33 — Revalidate affected review context without making comments an approval workflow

**Story US29-C33:** As an evidence reviewer, I want relevant changed comments reflected before committing my decision, so that I do not unknowingly decide against stale review context.

**Decision basis:** Q45 paragraph 11; Q21/Q22/Q52; REQ29-P06.

The ordinary source shall declare the structural dependency of exact prepared review context on comments. Comment admission/correction/location change/withdrawal/Restore advances only an affected review basis; do not use AI/semantic classification or globally invalidate unrelated historical work.

- **AC29-C33-01:** An uncommitted review revalidates when its actual structural context changes; it cannot silently ignore the new relevant revision.
- **AC29-C33-02:** A later comment never undoes committed acceptance or adds a new Q22 fulfillment predicate. A reply/Resolve flag, comment-reading ceremony or automatic repeat review is not required.
- **AC29-C33-03:** Commenting does not Accept, Request changes, waive need, revise instructions or fulfill the request. Participant content is a new deliberate source-qualified act, never an internal-comment visibility toggle.

## REQ29-C34 — Use equivalent location controls on desktop and mobile

**Story US29-C34:** As a keyboard, touch or assistive-technology user, I want the same precise comment-location ability, so that visual review does not require dragging or a perfectly working preview.

**Decision basis:** Q45 paragraphs 16–17; REQ29-P11.

Compose one semantic list/composer with optional location in existing source/reader work. Show exact file/version/internal context before Post; offer general feedback, typed location or explicit Comment here. A provisional marker remains unsaved until meaningful text and location commit together. Use explicit placement mode so touch pan/zoom or selection does not post.

- **AC29-C34-01:** Point/region create/adjust/remove/navigation has keyboard, AT and equivalent single-pointer non-drag control, such as two-corner placement. A less precise whole-page note is not equivalent; coordinate-number entry is not mandatory ordinary work.
- **AC29-C34-02:** List and reader selection synchronize only through explicit action, with meaningful text/location labels, overlapping-marker handling and honest loaded-page coverage.
- **AC29-C34-03:** 320-CSS-pixel controls, zoom/touch/hit areas, visible focus/return, non-color meaning, restrained status and reduced motion work. Localization/IME/RTL does not change source coordinates or accidentally Post.
- **AC29-C34-04:** Scrolling/tool changes/preview close are inert. Preserve permitted draft/location through recoverable failure; unknown save reconciles before clearing/repeating. Refresh cannot steal focus, move the reader, overwrite drafts or select a newer version.
- **AC29-C34-05:** Lawful comments remain useful when optional location/reader fails, with no automatic original download, external office viewer or screenshot-upload fallback and no default restricted offline persistence.

## REQ29-C35 — Qualify bounded private comments and markers through the existing reader

**Story US29-C35:** As the source operator, I want private comment storage and reader limits to be qualified together, so that the feature remains recoverable without a new collaboration infrastructure.

**Decision basis:** Q45 paragraphs 13–15 and 18–20; REQ29-P03/P04/P12–P18.

Use small typed source-owned comment/revision/location records, not whole-file comment JSON, duplicate page bytes, competing annotation truth or an event-sourced collaboration platform. Enforce exact same-scope use/version, immutable target/author, unique operation/revision, one current revision/location and active/withdrawn/type/coordinate constraints. Parent/user/rendition deletion cannot cascade required history.

- **AC29-C35-01:** Stable keyset pages use a unique tie-breaker and scope/query-bound continuation; edits do not reorder creation history or lose equal-time rows. Batch needed markers/authors/context rather than per-pin queries/policy/ledger calls; partial/unavailable coverage is not all/none.
- **AC29-C35-02:** Actual P12 fine-grained decisions and coarse Tenant RLS apply through every read/write/reader/job door. Do not reuse public post-comment policies, raw DELETE payloads or default Realtime subscriptions. Any qualified invalidation is a minimal current hint followed by protected refetch, not a body broadcast or new CRDT/presence prerequisite.
- **AC29-C35-03:** Finite text/location/request/list/history/marker/query/concurrency/client/retry/refresh/storage/egress budgets preserve D32's exact format, coverage and numeric requirements. No doubled limits, invented comment TTL, blanket reader reduction or unproved cost/capacity claim.
- **AC29-C35-04:** Both baseline comments and the chosen PDF/image marker cohort must qualify on actual intended devices and boundary/rounding/maximum/sensitive fixtures. Text-only fallback is honest containment, not completion of A+B.
- **AC29-C35-05:** Census/migration never verifies old Party/post comments or arbitrary UI coordinates by backfill. Legacy text saves cannot drop markers; current restore honors independent reader expiry/restrictions. Disable unsafe marker serving while preserving lawful text/history; use supported source correction/location diagnosis instead of SQL/public fallback.

## REQ29-C36 — Change a requested-by target only for eligible recipient work

**Story US29-C36:** As authorized request staff, I want to change the coordination target when recipient work remains, so that planning can adapt without changing the request's evidence or access rules.

**Decision basis:** Q46 paragraphs 1–3; REQ29-P01/P02.

The ordinary source shall own one current target and attributable revisions for its actual supported scope on an issued unfinished request with outstanding recipient work. Staff title, reviewer assignment, file access, task editor or unfinished badge is insufficient. Material awaiting staff checking/review alone is not recipient work. No per-item inheritance, bulk calendar, new recipient/purpose or specialist hard-deadline authority is added.

- **AC29-C36-01:** Permitted earlier/later/past targets are supported under actual source rules, without backdating the change. Date editing need not open evidence or require recipient login.
- **AC29-C36-02:** Explicit Set/Clear exists only for proved source-optional targets and the relevant actor power. Required targets cannot Clear; known absence, unknown interpretation and malformed data remain distinct.
- **AC29-C36-03:** A known current source identity/revision/authority/interpretation may admit a new prospective value replacing an explicitly unresolved old target while preserving unknown history. Unknown command authority, ordering or meaning blocks; never guess defaults or optionality.
- **AC29-C36-04:** Target change cannot edit instructions, requirements, reviewer, acceptance/removal/cancel/F. Tasks/calendars/notices and cached labels are projections, not additional writable target owners.

## REQ29-C37 — Preserve civil-date meaning and historical receipt timing

**Story US29-C37:** As a participant or reviewer, I want the current requested date and receipt timing to be understandable, so that a later planning edit does not rewrite whether earlier work was timely.

**Decision basis:** Q46 paragraphs 4–6; Q09/Q12; REQ29-P07/P08.

For a qualified date-only target, bind the civil date to the source-declared IANA zone and compare the trusted receipt's local civil date: same day is not late, later date is late. A qualified instant retains declared precision and Q09 strictly-later/equality semantics. The editor does not convert kind/calendar/zone/precision, infer browser midnight or use an elapsed-day substitute.

- **AC29-C37-01:** Browser/organization display changes and time-zone-rule updates cannot rewrite saved meaning. Preserve admission interpretation evidence and qualify compatible server/database/client semantics and finite supported dates without a new zone service.
- **AC29-C37-02:** Requested by is distinct from intake cutoff, original/fresh unfinished/completed access, proof/session validity, revocation, closure and retention. A permitted target beyond access end is an honest mismatch, not automatic rejection or a new grant.
- **AC29-C37-03:** Every receipt retains trusted source admission time, exact lineage and applicable target terms or explicit unresolved timing. Transfer start, browser time, callback, scan/review or response time is not receipt time; today's target cannot relabel old late/timely facts.
- **AC29-C37-04:** Added requirements, revised instructions and corrections keep their real applicability, with no unrelated retroactive lateness/new interval. Actual historical-fact correction is separately governed and attributable, not disguised prospective editing.

## REQ29-C38 — Save and repair requested dates without replaying old state

**Story US29-C38:** As staff adjusting a target, I want conflict-safe save and durable recovery, so that another receipt or closure cannot be undone by my old tab or retry.

**Decision basis:** Q46 paragraphs 7–10 and 13–14; REQ29-P03/P05/P06/P10.

One authoritative source command binds trusted context/time, exact scope/proposed canonical meaning, relevant source/target basis and semantic intent. Commit successor/current pointer/history/outcome and required existing follow-through coherently, without provider I/O under source locks.

- **AC29-C38-01:** Recover committed original before new eligibility/no-op checks, under current result disclosure, without reapplying over later target/receipt/terminal state. Current UI distinguishes recovered historical outcome from today's target.
- **AC29-C38-02:** New commands require current authority and expected basis even when the displayed date matches. Complete canonical equality is unchanged without new business revision/effect; required audit remains. Intervening change-and-back is stale, not a no-op loophole.
- **AC29-C38-03:** Relevant recipient/work, receipt/correction, acceptance/removal, material instructions, F/cancel and authority races have one source order. Last recipient work disappearing first blocks the edit; edit-first stays a real act. Unrelated prepared work/session/review is not blanket-invalidated.
- **AC29-C38-04:** Q09-compatible target-only changes may resolve at first submission admission without a new upload/intent/reconfirmation; committed replay preserves original receipt terms.
- **AC29-C38-05:** Mistakes use a new current qualified edit, possibly to the former value, preserving intervening history. Ended/no-recipient-work cases requiring genuine correction have an actual qualified source route and capable actor before activation; no powerless admin link, SQL, generic reopen or cancellation/reissue workaround.

## REQ29-C39 — Show date changes clearly without inventing notices

**Story US29-C39:** As request staff or a permitted participant, I want clear dates, errors and current status, so that planning changes are usable on mobile and never imply awareness or renewed access.

**Decision basis:** Q46 paragraphs 11–17; REQ29-P04/P09/P11/P13–P18.

Use contextual Change requested date with current/absent/unresolved value, proposed value, affected work and separate access availability. Save changes/Cancel are explicit; calendar selection, blur/navigation/opening are inert. Set/Clear is named rather than an ambiguous blank side effect.

- **AC29-C39-01:** A keyboard/text alternative to calendar, useful format/month/zone guidance, accessible errors/focus, reflow/RTL/IME and slow-network preservation work. Earlier/past/mismatched values get useful context without an extra ritual.
- **AC29-C39-02:** Pending/saved/unchanged/failed/unknown remain distinct. Reconcile unknown before clearing/repeating, and never overwrite an open draft with refresh or a newer projection with an older result.
- **AC29-C39-03:** Participant change context contains only source-approved timing/applicability, not internal actors/rationale/other work/audit. Current target/history/errors/receipts and late caches retain independent field authority and minimal schedules.
- **AC29-C39-04:** Q46 creates no notice default, reminder cadence, escalation, acknowledgment or blanket Off rule. Existing qualified effects retain pins/current utility and durable recovery; refresh/mail failure cannot undo the target or justify duplicate sends.
- **AC29-C39-05:** Actual source profile and retained-data census precede activation. No legacy backfill from today's task date or guessed zone; mixed clients/restore preserve meaning/adverse history and safe independent intake/review. Qualify finite workload and real date/AT/mobile/race/role tests rather than claims from synthetic models.

## REQ29-C40 — Withdraw exact pending participant evidence with precise controls

**Story US29-C40:** As a participant, I want to withdraw my mistakenly supplied pending contribution without replacement, so that staff stop considering it while the original receipt remains truthful.

**Decision basis:** Q47 paragraphs 1–4; Submission Withdrawal; REQ29-P01/P02.

The source shall admit deliberate withdrawal of the exact current participant-origin contribution unit, preserving independent siblings/items/uses. An item may contain independent files or a genuine indivisible multi-file contribution. Uploader/name/digest/folder/preview/task/unfinished status alone is not action authority.

- **AC29-C40-01:** Recipient self-service withdrawal starts Enabled only in the qualified profile; tenant control may require staff help by setting this action Off. A qualified source default may resolve without a redundant tenant row; unresolved policy is not Enabled.
- **AC29-C40-02:** Current effective policy/generation applies at admission after waits. Off-first blocks new recipient withdrawal; committed acts remain. Off does not block independent correction/read/original-result recovery or re-offer; On does not execute an old uncommitted intent across intervening change.
- **AC29-C40-03:** Accepted/frozen/F/canceled/No-longer-required or otherwise ineligible targets cannot withdraw ordinarily. Staff viewing/preparing is not an acceptance lock; Checking/quarantine/no preview does not itself bar a safely identified lawful withdrawal or establish incident exemption.
- **AC29-C40-04:** All-received evidence waiting for staff may still qualify; Q46's outstanding-recipient-work predicate is not borrowed. Unknown receipt/current target/authority is resolved or blocked, not inferred from an empty list.

## REQ29-C41 — Assist withdrawal without impersonation or changing other work

**Story US29-C41:** As authorized assistance staff, I want to withdraw the same eligible participant contribution truthfully, so that help remains possible without borrowing the participant's credentials or fabricating their act.

**Decision basis:** Q47 paragraphs 3, 5–8; REQ29-P05/P06.

Staff-assisted withdrawal is an explicit separate source power with the same target/basis/acceptance/custody constraints. Record actual staff actor/time and legitimate assistance basis from trusted context or concise necessary input under its real audience/retention. Neither rank, assignment, policy administration, read access nor Q28 implies this power; no original-author monopoly.

- **AC29-C41-01:** Participant Off does not grant/remove independent staff power. Staff may act after participant access ends only under their own current source authority; no manufactured grant, request or affirmation.
- **AC29-C41-02:** Durable withdrawal removes only current consideration and advances affected evidence/review basis; retain receipt, immutable version, participant attribution, original timing/instructions, decisions and history. Late processing cannot restore candidacy.
- **AC29-C41-03:** Requirement, sufficient siblings and independent uses keep actual meaning. Withdrawal is not rejection/waiver/removal/cancel/F/deadline change/refusal; withdrawing a correction never revives its predecessor.
- **AC29-C41-04:** Exact semantic withdrawal/re-offer commits membership/lineage/history/result/required follow-through coherently. Matching committed recovery precedes new-state/no-op logic; stale ABA/changed intent conflicts and a recovered older act cannot overwrite current display.
- **AC29-C41-05:** Relevant acceptance/correction/requirement/closure/policy/recipient/custody races are ordered both ways. A pending correction after withdrawal cannot silently become a new re-offer; preserve lawful input and require reviewed fresh admission. Unrelated accepted work/review/proof/readiness is not reset.

## REQ29-C42 — Offer the same retained contribution again as new supply

**Story US29-C42:** As a participant who withdrew by mistake, I want to offer the same permitted retained file again, so that recovery does not require downloading and uploading it unnecessarily.

**Decision basis:** Q47 paragraphs 9–13; Q56 whole-unit extensions; REQ29-P05–P08/P12/P16.

Offer this file again is a new deliberate current resupply admission for the exact withdrawn contribution and lawful retained version in the same source/request/item/purpose/recipient lineage. It is not Restore, reversal of withdrawal or revival of an older predecessor. Current resupply/proof/access/target rights are independently required; withdrawal-only Off does not itself remove them.

- **AC29-C42-01:** Preserve original receipt/withdrawal and link/attribute the new candidate use/time. No fabricated upload, backdating, copied approval or old timely receipt concealing current resupply timing.
- **AC29-C42-02:** Current instructions/statements/freshness/safety/cardinality and target terms apply. Only profile-qualified post-admission work may remain Checking. Existing technical evidence can be reused where current rules permit; no known-malicious material becomes eligible by re-offer.
- **AC29-C42-03:** Required new reference/protection is established against disposal claims with current exact custody/integrity. Missing/disposed/deletion-claimed/prohibited bytes are not restored/fetched by fallback. No new copy/scan/clock reset is required solely for otherwise eligible retained bytes.
- **AC29-C42-04:** No later correction/current sibling is silently displaced and no one-file limit is invented. One re-offer effect per actual withdrawal lineage survives concurrent keys/retries; a later withdrawal has its own current identity and old cycles cannot resurrect it.
- **AC29-C42-05:** Incompatible statements/instructions/restrictions/bytes require the real current new-supply or source-remediation path, not silent omission/powerless Help. Current same-lineage assembly changes remain separately reviewed whole-unit admission, not unchanged Q47 revival.

## REQ29-C43 — Preserve staff resupply and actual review effects

**Story US29-C43:** As staff helping recover withdrawn evidence, I want assistance to retain truthful provenance and review work, so that the system does not pretend the participant re-submitted or send duplicate notices.

**Decision basis:** Q47 paragraphs 13–14; Q28/Q53/Q27/Q40; REQ29-P09.

Staff resupply uses the qualified new Staff-supplied Document Evidence route, with actual origin/reuse authority and required participant assertions; there is no staff-performed participant re-offer or broad Restore power. Accepted/closed/restricted mistakes use their actual owner remedy, not ordinary unaccept/reopen.

- **AC29-C43-01:** Current Q24 work/My Work projections reflect the new actual basis independently of optional communication.
- **AC29-C43-02:** Q27's existing opt-in cohort includes a genuine recipient re-offer that first makes a new current evidence/review basis actionable. Use its new available-again facts, not replay of original receipt or a fictitious upload; preserve all original policy/cohort/material/utility/Off/retry/dedup rules.
- **AC29-C43-03:** Technical readiness restoration, duplicate recovery and no-op create no new notice occurrence. Q28 staff additions retain their own binding.
- **AC29-C43-04:** Withdrawal fences only affected work/effects under each existing purpose's utility; it does not automatically stop Q40 awareness of a still-required item or select a new notice, bell, reminder, acknowledgment or blanket Off default.

## REQ29-C44 — Show withdrawal history and durable recovery without an archive grant

**Story US29-C44:** As a participant or reviewer, I want clear withdrawn/current states and a persistent recovery action, so that I understand remaining work without being promised deletion or access to every old file.

**Decision basis:** Q47 paragraphs 9–10 and 15–16; REQ29-P04/P08/P10/P11/P14.

Q05 history may show authorized Withdrawn, actor-kind/time and remaining-work context. Staff assistance is truthful without exposing internal rationale/private staff details. Withdrawn evidence leaves current selectors; retained history is no preview/download/search/ZIP/archive grant. A narrow action may use safe identifying metadata without byte browsing.

- **AC29-C44-01:** Before final Withdraw, name the exact contribution/consequence and provide Cancel. Explain remaining need and retained received record; no erasure/recall promise, forced replacement/preview/full account, routine essay, second approver or confirmation ritual.
- **AC29-C44-02:** Qualified Offer again is persistently discoverable, not only a disappearing toast. Checking/Withdrawn/no current contribution/still-required/blocked/unavailable remain distinct; reviewers retain reading position rather than silent file switching.
- **AC29-C44-03:** Safe metadata distinguishes same-name units. If insufficient, actual capable source help replaces blind confirmation or extra disclosure. Current permission applies to all status/history/result/byte/header/range/stream doors.
- **AC29-C44-04:** Keyboard/speech/AT/touch/zoom/narrow reflow/long names/RTL/IME, focus/errors/restrained status and weak-network recovery qualify. Unknown reconciles before retry; a committed success is not failure because refresh failed. No offline queue or late-context overwrite.
- **AC29-C44-05:** Withdrawal does not delete copies/indexes, release holds, cancel independently necessary safety processing or prove nobody read the file. Minimal private business history is distinct from safe telemetry; no indefinite retention is created.

## REQ29-C45 — Qualify withdrawal and repeated recovery cycles at the source boundary

**Story US29-C45:** As the ordinary source operator, I want exact lineage and current-state enforcement, so that new clients, old retries or restored data cannot duplicate resupply or revive withdrawn evidence.

**Decision basis:** Q47 paragraphs 6–8 and 17–20; REQ29-P03/P05/P06/P13–P18.

Use the smallest relational receipt/contribution/candidacy/withdrawal/re-offer/basis/result facts with same-scope references, unique lineage/effects, immutable attribution and source multi-file cardinality. Name/digest/provider key or one nullable/soft-delete field is insufficient. Mutable predicates remain in the authoritative command; parent cleanup cannot erase required evidence.

- **AC29-C45-01:** All effective native-role/DML/function/worker/restore doors use the actual source/P12 boundary or are closed. The tenant guard alone does not prove source wiring or a multi-RPC transaction.
- **AC29-C45-02:** Bound indexed current/operation/history and set-wise actor/projection reads under actual P12 exceptions, without per-click full history, keystroke writes, mandatory polling/Realtime or invented zero-cost claims.
- **AC29-C45-03:** Census old source data/writers, preserving unknown provenance; absent rows/cancel/hidden UI/deletion are not historical withdrawal. Mixed clients preserve or reject unknown lineage, and restore applies adverse facts before serving/selecting.
- **AC29-C45-04:** Native both-order source/custody/policy races, repeated cycles/original replay, finite budgets, capable privacy help and actual user/mobile/AT recovery qualify before activation. Safe disable/roll-forward preserves independent work and immutable outcomes.

## REQ29-C46 — Remind only actual recipient work through the qualified email purpose

**Story US29-C46:** As staff responsible for a request, I want optional reminders for actual remaining recipient actions, so that we do not chase evidence already awaiting our own review.

**Decision basis:** Q48 paragraphs 1–3; Document Request Reminder Plan; REQ29-P01/P02/P09.

The ordinary source shall own one optional external-email reminder purpose through exact qualified P17/P6 binding. Automatic and deliberate staff reminders do not introduce bell/SMS/campaign/deadline keys or borrow permission-request/financial contracts. Unfinished/overdue/unaccepted/scan/review-backlog states alone are insufficient; genuine Request changes may require recipient action despite existing files.

- **AC29-C46-01:** Actual recipient work, exact recipient/purpose and current usefulness control admission. Optional items do not become demand or hold fulfillment; lawful native work remains usable when optional mail/setup is unavailable.
- **AC29-C46-02:** Tenant automatic reminders initially Off. Qualified deliberate enablement seeds new eligible issued requests unless authorized staff chooses no plan; drafts send nothing and existing requests are not automatically enrolled.
- **AC29-C46-03:** Suggested captured defaults are 7 calendar days, 3 lifetime automatic occurrences and local 09:00 in an explicitly reviewed qualified IANA zone. Tenant values permit integer interval 1–30 days, total 1–10 and local minute; absolute ceiling is 10 automatic occurrences per issued request across revisions, never unlimited.
- **AC29-C46-04:** Defaults are copied plan settings, not live hard ceilings on old plans. Broader current source/contact/operational gates still narrow. No holiday engine, per-item/per-request numeric cadence editor or automatic escalation.
- **AC29-C46-05:** Tenant management requires actual source-policy and applicable automation:manage/declarative/synthetic-preview/activity-log gates. Preview/test creates no real event/history/intent/provider call. The source service acts under current authority, not impersonated creator session; creator departure alone is not policy revocation.

## REQ29-C47 — Manage separate tenant, staff and recipient automatic-reminder controls

**Story US29-C47:** As staff or the intended recipient, I want reminder controls to state their exact scope, so that stopping automatic reminders does not accidentally cancel the request or silence unrelated contact.

**Decision basis:** Q48 paragraphs 4–6; REQ29-P02/P05/P06/P09.

Eligible staff have actual Start, Pause, Resume, Use current tenant settings and Send reminder capabilities. Read/reviewer/task/rank is not that authority. Capture qualified defaults/revision in a plan. Use current settings creates a future revision preserving lifetime usage and every stop; active adoption starts a full waiting interval, paused/stopped adoption waits for permitted Resume. Superseded automatic occurrences stop without rewriting possible effects or unrelated manual work.

- **AC29-C47-01:** Tenant Off fences affected automatic admissions and every later call/retry, preserving intervening generations even without a worker. Re-enable seeds new requests but does not resume old stopped plans; explicit authorized Resume is required.
- **AC29-C47-02:** Request Pause preserves settings/history/count. Resume is fresh current authority and full interval, never old occurrence revival or count reset, and cannot override tenant Off, recipient Stop or broader contact restrictions.
- **AC29-C47-03:** Manual reminders remain independently available under automatic Off/pause/cap exhaustion, subject to current purpose/contact, active lane and shared spacing. A future scheduled date cannot reserve the lane all week or require an extra essay/approver.
- **AC29-C47-04:** Current source-proved recipient may Stop automatic reminders and deliberately allow them again. This is not withdrawal, waiver, cancel, reading revocation, broad unsubscribe or suppression of independently lawful staff contact. Staff/tenant/profile/new work cannot clear that recipient stop.
- **AC29-C47-05:** Recipient allow-again clears only their own stop and never enrolls an unconfigured request or clears other stops. If an already configured plan becomes eligible, begin a fresh full interval, not an overdue immediate slot. GET/scanners cannot mutate; missing proof uses real permitted assistance, not a fabricated recipient act or contact-policy bypass.

## REQ29-C48 — Schedule finite calendar opportunities independently of requested-by

**Story US29-C48:** As staff inspecting a reminder plan, I want a clear next opportunity and time zone, so that date changes, daylight-saving transitions and missed jobs do not produce surprise bursts.

**Decision basis:** Q48 paragraphs 7–8; REQ29-P07.

Store captured IANA zone/local minute/interval/revision and resolved opportunity instants. First enrollment, permitted Resume, active profile adoption and actual no-recipient-work → recipient-work transition anchor at trusted transition time. Ongoing additions/edits/partial receipts/reads/target changes or event names alone do not reset; actual source predicate governs. No anchor/change resets lifetime usage.

- **AC29-C48-01:** Nominal opportunity is anchor local date plus interval at captured local minute, no earlier than 24 elapsed hours after both anchor and latest possible Q48 provider-call admission. Advance an early nominal time to the next normal daily slot satisfying both floors.
- **AC29-C48-02:** Resolve folds to the later instant and gaps to the first valid instant at/after the local time, recording it without duplicate skipped-date slots. Do not infer recipient geography/quiet hours or promise exact 24-hour days.
- **AC29-C48-03:** Automatic calls are admitted only during `[resolved opportunity, opportunity + 60 elapsed minutes)`. Normal delay inside the window is allowed; endpoint is too late. Preparation/queue/retry cannot extend it.
- **AC29-C48-04:** Expired or multiple missed slots coalesce to one next future normal daily opportunity, never immediate overdue delivery or one message per missed slot. Show actual next opportunity/zone rather than an invented catch-up schedule.

## REQ29-C49 — Coordinate counts and manual overlap at possible-send admission

**Story US29-C49:** As a recipient or records operator, I want attempts counted honestly and duplicate reminders prevented, so that retries or manual help cannot reset the automatic limit.

**Decision basis:** Q48 paragraphs 9–10; REQ29-P05/P06/P09.

One durable source lane coordinates active manual/automatic occurrences for the issued request/recipient purpose; future dates do not occupy it. Occurrence admission atomically reserves automatic capacity, exact intent and current source/plan/stop basis. First possible provider-call fence converts reservation to lifetime usage once.

- **AC29-C49-01:** Rejected/failed/unknown possible sends remain used; timeout/callback absence cannot refund. Release reservation only after original is durably uncallable and no possible-call fence ever crossed. Same-occurrence retries count once; this is attempted-automatic usage, not delivered mail.
- **AC29-C49-02:** New distinct Q48 manual/automatic occurrences share a 24-elapsed-hour floor from latest possible call. Manual does not consume automatic total. Every possible call, including permitted follow-up, advances latest-call and the automatic waiting anchor with captured cadence, without clearing stops or creating another occurrence.
- **AC29-C49-03:** Same-envelope follow-ups remain the original occurrence under actual P6 allowance; the distinct-occurrence floor itself neither authorizes nor prohibits them.
- **AC29-C49-04:** While original is callable/pending, concurrent attempts return its permitted state or safe conflict, not another reservation. Once its original finite window closes, retain unknown outcome/used count but free the lane for a genuinely later qualifying act; never rekey the old uncertainty.
- **AC29-C49-05:** No count reset, budget recycling, request recreation or split identity evades the bound. These are Q48 controls, not a promise of one total email per day across independent purposes; Q60 corrective-request exclusions remain explicit.

## REQ29-C50 — Keep reminder usefulness and action routes current

**Story US29-C50:** As a recipient, I want a reminder that leads to work I can actually do, so that an old publication or expired grant does not become a misleading upload instruction.

**Decision basis:** Q48 paragraphs 11–13; REQ29-P04/P09/P10.

Bind the occurrence to finite exact original recipient-work basis and qualified action/material. Initial request-level wording is minimal, without private filenames/bodies/attachments/staff notes/mutable item counts, reading claims or unnecessary deadlines. Current narrowing can preserve usefulness only while an original member remains actionable and sealed material/action remains compatible; unrelated new work cannot revive ended utility.

- **AC29-C50-01:** Persist real no-work transitions and proved stops even without scheduler observation. Partial receipt does not automatically end a still-useful cue or reset all work. Reminders never change source acceptance/removal/F/withdrawal facts.
- **AC29-C50-02:** The first cohort requires an actual currently available submit/correct/resupply route. Recipient need not be online or already proved when mail is considered; qualified proof may occur on landing.
- **AC29-C50-03:** Expired access/unknown capability/no valid action cannot mint access, force signup, show upload-looking CTA or substitute improvised information/help content. Block/suppress appropriately and expose actual staff/source access repair; future help-only variants require separate qualification.
- **AC29-C50-04:** Recheck current work, actor/service, tenant/plan/recipient stop generation, contact/privacy and action/material at admission and every call after waits. Automatic-only controls do not stop independent manual purposes. Proved stops cannot disappear after On/new work/restore; unknown blocks without inventing a terminal fact.
- **AC29-C50-05:** Preserve possible in-flight send truth without recall. Q20/Q26/Q31/Q35/Q40 and lawful staff handling keep their own current purposes; Q48 incapability is no blanket communication stop.

## REQ29-C51 — Release and recover the exact bounded reminder material

**Story US29-C51:** As an operator diagnosing reminder delivery, I want one original source and communication result, so that uncertainty does not generate another recipient, body or send.

**Decision basis:** Q48 paragraphs 14–16; REQ29-P05/P06/P09/P10/P14.

Trusted source commands bind context, target/action and relevant expected basis for profile/control/manual/automatic opportunity work. Plan/stops/history/lane/reservation/effect/result and required follow-through are coherent. Recover matching committed original under current disclosure before new eligibility/no-op; changed intent conflicts. New exact canonical profile/control no-op preserves revision/stop/anchor/count/business history, with required audit; stale basis still conflicts.

- **AC29-C51-01:** One exact Live P17/P6 contract compiles/releases the complete bounded plan atomically, including proved zero only where permitted. Unknown/partial is not zero; feature code cannot loop committed child sends, pick generic templates or call provider directly.
- **AC29-C51-02:** Immutable recipient/material/account/environment/connection/provider pins and permanent occurrence identity govern recovery. Signed/correlated duplicate/out-of-order evidence cannot reopen/refund/reroute or prove human completion. Work lease/provider windows are not business deduplication.
- **AC29-C51-03:** Only P6's already-qualified indeterminate same-envelope retry classes and at most two follow-up HTTP calls after initial apply, within every earlier deadline; no new entitlement.
- **AC29-C51-04:** Prepared material maximum is 24 elapsed hours from first immutable preparation, clipped by earlier source/action/privacy/provider limits. Manual source occurrence independently ends no later than 24 hours from original admission; later preparation cannot extend it. Automatic original 60-minute window dominates all later calls.
- **AC29-C51-05:** Initial readable Recent ceiling is zero. Body-free history and protected minimal correlation/stop evidence follow actual policies; no financial/staff duration borrowing, fabricated Party, logged body or support-copy prerequisite. Any future reveal/material expansion is separately qualified.

## REQ29-C52 — Keep plans and repair source-owned rather than another scheduler platform

**Story US29-C52:** As the responsible tenant/source operator, I want blocked plans and uncertain attempts to be repairable, so that optional reminders do not require SQL or produce a fresh failure every day.

**Decision basis:** Q48 paragraphs 17–18 and 21–23; REQ29-P03/P13–P18.

Persist only scoped defaults, captured plan/stops, work/anchor, lifetime use, admitted lane/reservation/occurrence and semantic result/communication references. P9 tasks and next-time/status/count displays are projections. Typed same-scope relations, exact uniqueness/state/bounds and immutable history prevent reparenting, count reset or old callability; plan deletion cannot erase possible-send evidence.

- **AC29-C52-01:** Actual source/P12 roles and every native/worker/import/restore door qualify; a client setting, service token or workflow tenant guard is not authority. One source mutation protocol, not a collection of separately guarded RPCs, proves coherence.
- **AC29-C52-02:** Keep one next candidate per plan, bounded indexed current/history/set-wise reads and fair tenant work. No polling every file, missed-slot enumeration, full-history-per-tick scan, mandatory Realtime or new scheduler/vendor.
- **AC29-C52-03:** Setup/material/action/contact/delivery faults reach actual source/P17/P6 owners. Temporary enrolled plans may remain visibly quiet/blocked; real stops remain stopped. Repair original while callable or close truthfully and permit only future qualified acts, preserving counts/deadlines.
- **AC29-C52-04:** No infinite retry, daily zero-failure occurrence, silent lost diagnosis or generic inbox. Cap exhaustion only stops new automatic admissions; request/native work and independently lawful manual reminder after its floor remain usable.
- **AC29-C52-05:** Prevention gates cover authority/privacy/utility/identity/cap/spacing/irreversible stops. Monitor confirmed violations or actual qualified threshold breaches with accountable containment/repair; no unmeasured cost/latency claims or monitor-only safety compromise.

## REQ29-C53 — Present reminders as one understandable request area

**Story US29-C53:** As staff or the recipient, I want reminder settings and results to explain what will happen, so that I can control courtesy email without mistaking it for source progress.

**Decision basis:** Q48 paragraphs 19–24; REQ29-P11/P15/P17/P18.

Show mode/control causes, captured schedule/zone, actual next opportunity, used automatic count versus captured total and last result. Not enrolled, tenant Off, staff Pause, recipient Stop, no recipient work, cap reached, blocked route/setup, pending and unknown delivery are distinct and may coexist; no misleading green On.

- **AC29-C53-01:** Eligible Start/Pause/Resume/Use current settings/Send reminder have clear target/consequence and one deliberate final act, not a new rich composer, essay or duplicate confirmation. Default edits identify future-plan scope; applying settings shows new timing and retained count.
- **AC29-C53-02:** Field/menu/preview changes do not send. Recipient Stop explains that work may remain and authorized staff contact may occur; it is not unsubscribe/waiver/deletion and requires neither unnecessary full account nor file preview.
- **AC29-C53-03:** Minimal identity, descriptive protected action and plain-text/images-off/localized rendering work with international names, zone labels, RTL/IME/keyboard/speech/AT/reflow/focus/status. Slow networks preserve lawful input and original-result recovery, never queued offline sends or late-context disclosure.
- **AC29-C53-04:** Prospective census/rollout never infers enrollment/consent/counts/work transitions/stops from emails/task times/missing rows. Qualify actual source/contact/race/DST/skipped-date/late-wake/cap/lane/material-window/provider/restore behavior, native users and production-shaped workloads; safe disable preserves independent manual/native work.

## REQ29-C54 — Give an exact evidence use one optional staff display name

**Story US29-C54:** As authorized staff, I want a useful shared staff display name, so that I can recognize an evidence entry without renaming its original or changing what the participant sees.

**Decision basis:** Q50 paragraphs 1–4 and 6–7; REQ29-P01/P02/P04.

The ordinary source owns one optional name per exact admitted contribution/use, visible to currently authorized staff for that field. It is not a personal alias, label, item/request title, global asset name or new identity. Naming is never required for receipt/discovery/review or another lawful source act; all specialist/public/resource names retain their owners.

- **AC29-C54-01:** Participant/public/donor/missionary/Q41 purposes exclude the staff field even for a human who also holds a staff role. Enforce before matching/rank/count/order/suggestion/serialization/AT/browser title/cache/error/print/export/delivery, not CSS hiding.
- **AC29-C54-02:** Staff exports/history include it only through their exact current purpose. Existing source-approved participant identification remains; no new editable recipient-name field or audience toggle.
- **AC29-C54-03:** Naming does not change exact bytes/version/digest, receipt actor/time, instructions/lineage/acceptance/currentness/work/access/retention, embedded metadata, storage or sealed output. Staff name, permitted received provenance and qualified delivery name are distinct; never recover discarded names from keys/headers/other uses.
- **AC29-C54-04:** A safer name is not original redaction. Q44 member/manifest and sealed packages remain unchanged; no automatic delivery substitution. Duplicate names are valid and disambiguated by permitted source context, not uniqueness or a forged type/status suffix.
- **AC29-C54-05:** Source rules may permit admitted Checking/rejected/accepted/historical/withdrawn/terminal retained uses, but status grants nothing and actual freeze/privacy/disposal restrictions win. Edit needs current inspect-basis and change power, not uploader/rank/folder/reviewer status.

## REQ29-C55 — Set, clear and correct the name without blind overwrite

**Story US29-C55:** As a naming editor, I want optional Set/Edit/Clear and safe conflict recovery, so that clearing a field is understandable and a hidden value is not accidentally overwritten.

**Decision basis:** Q50 paragraphs 4–9; REQ29-P05/P06/P08.

Proved absence, present value and unavailable/denied projection are distinct. A source-approved fallback may be shown independently but not prefilled as authored staff text. An unavailable field is neither absent nor permission to clear it; restricted-content repair uses the separately qualified source/privacy power.

- **AC29-C55-01:** Empty/whitespace-only canonical input deliberately means Clear under the documented normalization; Cancel is inert. Current authority and expected naming basis precede complete-value no-op, with no new business revision/event/notice while required security evidence remains.
- **AC29-C55-02:** Same-use status changes preserve name. Every new Q03/Q28/replacement/Q47/Q49 evidence use starts unnamed; equal bytes/name/item or carried home cannot inherit it.
- **AC29-C55-03:** Use one bounded single-line plain-text contract with declared UTF-8/text units and source-qualified limits. Preserve meaningful Unicode/case/RTL/IME, handle prohibited controls/spoofing intelligibly and isolate direction; no silent truncate/transliterate/translate/markup execution or arbitrary filesystem limit.
- **AC29-C55-04:** Coherently commit value/absence, naming basis, restricted history/result and required projection follow-through. Relevant expected revision defeats stale A→B→A while unrelated source edits need not conflict; current source restriction still fences.
- **AC29-C55-05:** Recover original admitted effect before new work under current disclosure; changed intent conflicts, old retry cannot overwrite newer name. Correction/any Undo is a fresh current edit, not history rollback. Equal true no-ops leave revision valid for later genuine edits; required minimal replay evidence survives readable-history expiry or stale work rejects.

## REQ29-C56 — Project staff names consistently without copying them into history or search authority

**Story US29-C56:** As a staff reader or privacy operator, I want current safe naming in lists and review, so that a renamed row remains recognizable without leaking prior private text.

**Decision basis:** Q50 paragraphs 10–12 and 15–16; REQ29-P03/P04/P08/P13–P16.

Use the current permitted staff name consistently in qualified ordinary list/detail/review surfaces with independently permitted received-reference/item context. Search includes it only if separately admitted to Q38's field set. Projections are rebuildable; naming does not create a mutable search/view/cache authority or default historical-name corpus.

- **AC29-C56-01:** Restrictive changes fence serving before cleanup. Preserve lawful focus/selection/return by exact use when sort/filter membership changes; no stale private text retained to keep a row visible or completeness claimed from failed coverage.
- **AC29-C56-02:** Native same-scope optional-name/current-basis/history relationships, bounded values and immutable attribution apply through every door. Generic assets JSON/public serializers or CMS filenames are not qualified private storage; no name/digest uniqueness or evidence cascade.
- **AC29-C56-03:** Old/new history values have their own current rights/schedules. Naming never rewrites old receipt/message meaning; logs/analytics/crash reports omit authored/received names and associations. Source minimization/holds/disposal and adverse-first restore apply to values/history/indexes/exports.
- **AC29-C56-04:** Census/rollout initializes no authored value without a proved existing source fact; permitted fallback does not duplicate provenance into a new authority. Fence mixed generic serializers, preserve admitted facts and independent work, and repair forward rather than grant broad admin fallback.

## REQ29-C57 — Edit staff naming in one accessible small flow

**Story US29-C57:** As staff editing a display name, I want clear optional-field copy and persistent recovery, so that a normal naming mistake does not require a new screen, preview or approval process.

**Decision basis:** Q50 paragraphs 13–18; REQ29-P10/P11/P13/P17/P18.

Use Edit staff display name, an optional Staff display name input, Save name and Cancel. Explain shared authorized-staff scope and the unchanged participant identification. Clearing returns to the permitted fallback, with received reference separately visible where useful; no original-name disclosure/preview prerequisite.

- **AC29-C57-01:** No mandatory reason, repeated confirmation, naming convention, dedicated naming screen, audience switch or new naming notice. Independently qualified effects keep their contracts and cannot carry an unauthorized staff name.
- **AC29-C57-02:** Saving/saved/failed/conflict/unknown differ. Preserve lawful proposals and current permitted context on conflict for a new deliberate save; network cancellation is not proof no save. Essential status and recovery persist beyond a toast.
- **AC29-C57-03:** Focus returns to the invoking control or stable meaningful fallback after reordering/removal. Full identification/actions do not require hover; keyboard/pointer/speech/AT/320-CSS-pixel reflow/zoom/international names/RTL/IME and weak-network tasks qualify. Blur/typing/IME confirmation does not save, while focused button activation remains usable.
- **AC29-C57-04:** Use existing small source/UI seams without AI naming/translation/parser/Realtime/per-user aliases or byte copies. Qualify finite input/history/query/retry/storage budgets, staff-to-participant identification and native/privacy/race/restore tests; no free-operation or measured-benefit claim without evidence.

## REQ29-C58 — Choose one qualified colleague for a saved comment

**Story US29-C58:** As a qualified staff colleague, I want to request attention to a saved comment, so that I can direct useful review context without assigning work or granting access.

**Decision basis:** Q51 paragraphs 1–3; Document Review Attention Request; REQ29-P01/P02/P04.

Notify a colleague applies to an exact saved currently active Q45 ordinary comment revision, including qualified Q28 uses. It is available after known Post success or later; failed/unknown Post must reconcile first, never notify an optimistic ID. Posting remains independent with no recipient. No @text parsing, combined Post-and-notify, rich mention editor, groups/bulk targets/subscriptions/new inbox or full Workflow requirement.

- **AC29-C58-01:** Requester needs current comment-create permission plus exact current comment/context read, but need not be author/reviewer. Target needs independently qualified same-Tenant staff read of that comment/context, not comment-create or original-file access. Preview readiness is not a prerequisite.
- **AC29-C58-02:** Native stable identity and exact qualified assignment/role/access, including supported no-Party staff, govern. Names/emails/profile/team/forged Party grant nothing; no invitation, assignment or participant/Q41 disclosure follows.
- **AC29-C58-03:** Bounded picker reveals only discoverable identity/disambiguation. Each human resolves to one qualified concrete delivery context; permitted context selection may resolve ambiguity, never role union/fallback/multiple projections. No self-target, arbitrary address/group/hidden target or automatic first selection.
- **AC29-C58-04:** Empty results, lookup failure and denial have privacy-safe distinct recovery without revealing memberships/preferences. Requester departure alone does not cancel a committed act; actual source/grantor dependencies remain.

## REQ29-C59 — Atomically add one attention result for the semantic slot

**Story US29-C59:** As staff using Notify, I want one durable local result and safe retry, so that duplicate clicks or a lost response cannot create repeated alerts or a falsely successful queue entry.

**Decision basis:** Q51 paragraphs 4–6; REQ29-P03/P05/P06/P09.

At most one admitted request exists for exact Tenant/environment/source use/comment/current Q45 revision plus actual stable intended staff principal, across requesters/tabs/roles/keys. Freeze the admitted exact assignment/role/access basis separately; deduplication never transfers the old projection to later authority.

- **AC29-C59-01:** Read/archive/expiry/preference/regrant/deployment/restore cannot reset the slot. A genuine later active revision, including lawful Restore, may be explicitly notified; edits/follow-ups never auto-notify and no-op creates no revision. Same-content renewed attention uses meaningful new follow-up or qualified coordination, not fake editing/cooldown.
- **AC29-C59-02:** Admission validates trusted context, current exact revision, reviewed target/access/control basis after waits. Off→On or replaced authority makes old unadmitted intent stale despite current On; require fresh deliberate basis without silent rekey.
- **AC29-C59-03:** One enclosing local transaction commits unique attention/history/result plus actual transaction-scoped P6 complete one-member/one-in-product-step compilation/release and local available event/P17 projection. Parent release precedes materialization; no private child bypass or independently committed partial plan.
- **AC29-C59-04:** Success requires exactly one eligible local result, not zero/rejected/unresolved compilation. Failure rolls back the entire attention act while preserving the separately saved comment. No durable accepted-but-unavailable worker queue, provider/email gate or new delivery timer is introduced.
- **AC29-C59-05:** Matching committed command recovers under current disclosure before new eligibility; changed immutable intent conflicts. Another current command for the same slot returns minimal Already requested without rewriting requester or exposing their private receipt. Stale revision conflicts; unknown/browser cancellation is not rollback. Never rehash old slots during migration.

## REQ29-C60 — Present informational attention with fixed original bounds

**Story US29-C60:** As a colleague receiving attention, I want a useful informational cue and accurate aging, so that it never masquerades as an assignment, read receipt or permanent access grant.

**Decision basis:** Q51 paragraphs 7 and 10; P17 `presentation.information_30d_then_recent_90d@1`; REQ29-P04/P07/P09.

The initial channel is in-product Information in the existing All center, never Needs attention work. Define available_at once at local materialization inside the transaction that commits it; visibility begins on commit. Do not invent a future commit timestamp or use click/comment/transaction-start/retry time.

- **AC29-C60-01:** Unread ends at earliest read, archive, actual correction/supersession, qualified optional-control stop or available_at+30 days. Authorized recent ends at original available_at+90 days, enforced on reads even if purge is late. Activity/settings/Restore cannot extend either.
- **AC29-C60-02:** Safe cue identifies attention and independently permitted requester/source context with View comment. Comment author and requester are distinct; no copied body/file/geometry/staff-name/private detail enters a generic broader payload.
- **AC29-C60-03:** Current field/source authority covers lists/counts/search/hover/AT/cache/export/diagnostics/destination. Staff/participant contexts never union rights; presentation cannot mutate comment/evidence/responsibility/access.
- **AC29-C60-04:** Availability, engagement and source facts remain independent. A click/available/read/archive response proves no human awareness, reply, acceptance/F/review completion. No deadline/reminder/approval/Resolve/read-receipt duty is added.

## REQ29-C61 — Apply precise controls and source-current attention endings

**Story US29-C61:** As a recipient or tenant administrator, I want the optional attention preference to stop only its intended presentation, so that reenabling it cannot replay old alerts or erase access restrictions.

**Decision basis:** Q51 paragraphs 8–9; scoped P17 informational-ending amendment; REQ29-P04/P08/P09.

The qualified native purpose is available by default after activation but only deliberate Notify creates an act. Existing tenant/personal optional-purpose controls apply in P17 requiredness/configuration/preference/access order; no new settings page, audience matrix or permission engine. A qualified default can resolve On without an override row; required unknown state fails closed, not known On or proved permanent Off.

- **AC29-C61-01:** Known Off before admission creates no slot/cue. Off after availability ends unread without fake Read/Archive, preserving only authorized recent within original 90-day bound. On never backfills/re-alerts/resets slots; intervening Off history persists even between reads. Private preference reasons are not disclosed to requester.
- **AC29-C61-02:** Any actual later visible Q45 text/location revision, withdrawal or source-purpose end ends old unread/action applicability; no semantic importance classifier. Canonical no-op changes no revision. Restore/new revision cannot revive old occurrence.
- **AC29-C61-03:** Loss of the bound access revision removes active and recent immediately; later authority does not transfer/revive it. Temporary evaluation failure blocks serving but does not prove permanent loss.
- **AC29-C61-04:** F/cancel/requester departure/preview expiry alone is not a blanket stop; actual continuing comment purpose governs. Navigation stays on same immutable use/version/comment, explains changed-since-notification current text or lawful unavailable/withdrawn state, and grants no historic text/new bytes/fabricated location.

## REQ29-C62 — Make Notify simple and mistakes proportionately recoverable

**Story US29-C62:** As staff directing attention, I want clear selection and result language, so that I can recover uncertainty or a wrong eligible target without reposting a valid comment.

**Decision basis:** Q51 paragraphs 11–13; REQ29-P10/P11.

Notify a colleague opens a bounded selector with saved-comment context; selected colleague and final Notify remain clear. No extra message, reason essay, mandatory preview, second approver or routine confirmation. Typing/focus/selection/blur/IME and pre-submit Cancel are inert; focused Notify button keyboard activation remains supported.

- **AC29-C62-01:** Show Notifying in flight, Notification added only after proved atomic availability, and Already requested for this version of the comment without seen/read claims. Unknown offers Check status or identical safe retry; current rejection has a permitted next step, never silent redirect or false success.
- **AC29-C62-02:** Essential status/recovery persists near the action beyond a toast. Disabled/no match/lookup failure/stale comment/changed target/technical failure stay intelligible without hidden preference or membership disclosure.
- **AC29-C62-03:** No sender Recall or post-admission Undo platform. Wrong but eligible colleague creates no business debt/access; notify the correct different eligible colleague separately without repost, while original recipient uses normal read/archive.
- **AC29-C62-04:** Actual privacy abuse uses scoped source correction/serving-stop with evidence, not forced valid-comment withdrawal, engagement erasure or a fresh occurrence disguising failed projection repair.
- **AC29-C62-05:** Shared Base UI keyboard/speech/AT/touch/non-drag/focus/long-name/localized-time/RTL/IME/320-CSS-pixel tasks work; no hover-only/color-only/autoplay/forced-navigation/download behavior. Preserve lawful input, fence context changes and avoid private offline write queues. Attention outage does not disable commenting/review.

## REQ29-C63 — Qualify the small native attention producer without a new platform

**Story US29-C63:** As the source and communication operator, I want the local attention contract to be verifiable and bounded, so that a demo bell or generic mention helper cannot be mistaken for secure delivery.

**Decision basis:** Q51 paragraphs 14–20; REQ29-P03/P04/P08/P13–P18.

Qualify same-scope immutable comment/revision/requester/recipient bindings, one semantic slot and one-to-one admitted local result through actual P12/grants/DML/function/worker/restore doors. Preview/source deletion cannot cascade required result/audit/dedup history. No fake cross-row policy CHECK or alternative browser/CMS/Support/finance storage authority.

- **AC29-C63-01:** Source history, body-free P6 facts, bounded P17 preview/engagement and telemetry remain distinct; sender sees no recipient read/archive receipt. Retain only lawful minimal replay mappings/tombstones or reject unverifiable old work, not permanent readable private text or a new person-matching engine.
- **AC29-C63-02:** One new act has one target, one plan member and at most one available result, independent of file size; this does not bound aggregate traffic. Qualify finite picker/query/page/history/input/transaction/lock/retry/retention/abuse budgets and sparse/dense workloads, including repeated revisions and independent targets.
- **AC29-C63-03:** Use indexed set-wise filtering and stable keyset ties, no N+1 permission/network loops, global counts/full-center reload or document-body corpus. No new mention graph/notification center/Realtime/provider/parser/rich editor/digest scheduler is required.
- **AC29-C63-04:** Census/fence old writers and use one projection authority. Never backfill @text/Support notes/finance tasks/old queues as new attention or fabricate unread history. Restores/rollbacks retain original slots/later stops; scoped stop preserves saved comments and lawful history.
- **AC29-C63-05:** Native real-role atomic rollback/current-control order/replay/revision/access-race/numeric-presentation/private-navigation and actual staff/AT tests are required. Demo bell, model or source inspection is not passed qualification; material failures block activation and residual monitoring has actual signals/owners/responses.

## REQ29-C64 — Select finite ordinary items for one deliberate acceptance action

**Story US29-C64:** As an authorized reviewer, I want to accept selected reviewed items within one request, so that I can group a few decisions without changing what each acceptance means.

**Decision basis:** Q52-C01–C02; Q21/Q24.

Accept selected is optional within one eligible unfinished ordinary request; individual Accept remains direct. Each item retains its own exact source decision, even if supported by several files or qualified staff evidence. No cross-request approval, batch Request changes/waiver/cancel, new staff supply power, assignment or automatic acceptance is introduced.

- **AC29-C64-01:** Begin with no selection. Submit a nonempty finite set of unique item IDs and reviewed bases in one Tenant/environment/request/purpose; empty/duplicate/conflicting/malformed/over-limit sets reject without business effects. Cosmetic order does not change intent.
- **AC29-C64-02:** Preserve explicit same-request selection across filter/sort/pages with visible total and reachable View selected. Select all, if offered, means eligible displayed rows at that instant; Deselect shown affects that finite scope, Clear affects the whole local set.
- **AC29-C64-03:** Never include unseen pages/future uploads/newly eligible rows or all matches implicitly. Newly restricted/changed members cannot silently disappear or be replaced to produce a smaller submission; keep only disclosable context and require deliberate repair.
- **AC29-C64-04:** Existing source/tenant roles apply; no admin-only setting, personal reviewer claim, new settings matrix or compulsory second reviewer.

## REQ29-C65 — Preserve actual per-item inspection, concerns and current authority

**Story US29-C65:** As a reviewer, I want every selected decision to retain its exact review basis, so that selection cannot stand in for inspection or silently clear a different concern.

**Decision basis:** Q52-C03–C05; REQ29-P02/P04/P06/P12.

Every new decision retains Q21 sufficient human inspection of the complete relevant evidence, current requirement/instructions, admissibility/safety and structural review context. Selection/receipt/scan/filename/thumbnail/OCR/AI/preview/dwell/download telemetry is not review. Same-evidence Q23 reassessment remains available with actual per-item concern resolution; one blanket comment cannot clear distinct concerns.

- **AC29-C65-01:** No per-file approval, compulsory preview/download click, essay or routine extra modal is required. Unsupported preview needs an actually sufficient authorized accessible inspection alternative; controls alone do not make inaccessible content reviewable. Required unknown/failed safety proof blocks.
- **AC29-C65-02:** One actual staff actor holds acceptance power for every new decision and context, including qualified no-Party staff. Do not union several people's rights or infer from responsibility/team/read/folder/task/grant. Actual separation rules remain; Q25 issuance readiness is not repeated each review.
- **AC29-C65-03:** Bind source/requirement/instruction/complete evidence/relevant clarification/comment/concern/authority dependencies, including Q45 text/location/withdraw/Restore. Exact structural relevance, not an importance classifier or global request revision, determines conflict.
- **AC29-C65-04:** Expected basis detects away-and-back changes despite equal bytes/status. Correction/withdrawal-first fences predecessor; acceptance-first preserves its actual consequences. Unrelated naming/filing/comments/items do not universally conflict, but aggregate dependencies remain.

## REQ29-C66 — Commit all new selected decisions together and recover the original

**Story US29-C66:** As staff submitting selected acceptances, I want a coherent outcome even when another reviewer acts, so that partial new approval or duplicate attribution cannot be hidden by retry.

**Decision basis:** Q52-C06–C08; REQ29-P03/P05/P06.

Partition the frozen selection at the source boundary into exact independently accepted still-applicable items and those requiring new decisions. Existing recognition requires the full selected meaning and authoritative Q21 fact; exempt only the review-head advance caused solely by that matching acceptance, not changed evidence/instructions/concerns or other dependencies. Preserve original reviewer/time/basis.

- **AC29-C66-01:** All-existing exact current recognition returns no-new-work Already accepted under current source/result authority even after F, without acceptance/F/notice/reopen. Cancellation/adverse/lost applicability permits only lawful closed/history/unavailable output, not historical acceptance promoted to present satisfaction.
- **AC29-C66-02:** If terminal state wins while any new decision remains, none are admitted. Independent previous acceptances stay true. Bytes-only/item-digest permanence cannot prevent a later qualified same-evidence reassessment; no new Undo/invalidation authority.
- **AC29-C66-03:** One real enclosing database transaction commits all new acceptances, required state/history/result and durable follow-through, or none. No per-item best-effort loop, hidden chunks, independent SDK commits, compensation unaccept or async approval job; actual stable ordering/revalidation/retry is bounded, not whole-Tenant locked.
- **AC29-C66-04:** Matching original committed effect recovers under current disclosure before fresh eligibility; changed selected meaning conflicts. Overlapping reviewers/new keys cannot duplicate Q21 effects. Unknown original reconciles before smaller selection, successor basis or new key; browser abort/navigation is not rollback.
- **AC29-C66-05:** Infrastructure retry keeps exact intent and re-proves current dependencies, never rebases a business conflict. Late/expired/restored work cannot become fresh effect; known success with failed refresh stays known. Expensive inspection/processing/providers remain outside locks.

## REQ29-C67 — Show item outcomes and source fulfillment honestly

**Story US29-C67:** As a reviewer or permitted participant, I want clear per-item and whole-request results, so that a grouped action never exaggerates what was accepted or completed.

**Decision basis:** Q52-C09–C11; REQ29-P09–P11.

Q22 alone owns the complete F predicate, including hidden/non-file/optional/remaining work. Evaluate or durably arrange it through the qualified ordering with required intent committed alongside decisions. Item acceptance may be known while F follow-through is unresolved; recovery needs no new business approval.

- **AC29-C67-01:** Do not infer F from filtered count/empty list, add Complete, backdate F or erase acceptance on projection failure. Explain possible source end/access consequence inline without stale guarantees; post-participant-expiry staff review does not renew access.
- **AC29-C67-02:** Existing Q27/Q40/Q48/Q51 and other purposes retain exact utility/stops/dedup. No new email/reminder/attention/task-per-item or blanket suppression follows.
- **AC29-C67-03:** Labeled selection, current evidence context, View selected, Clear and Accept selected (N) are sufficient; no required page/modal. Distinguish local selected/submitting/newly accepted/existing exact/no-new-effect failure/unknown. Say no new acceptances by this action, not none accepted when independent decisions exist.
- **AC29-C67-04:** Unknown result offers original checking/recovery, not a new Submit. Preserve lawful notes/reading/focus/selection; confirmed success may clear accepted selection while persistent results remain, never clear unknown work or guess the next item. Independent work need not freeze.
- **AC29-C67-05:** Newly hidden members/counts/reasons cannot leak through failure/readback. Participants see only their source-approved status, not staff selection/concerns. Keyboard checkbox Space/IME Enter do not submit; focused action does. Controls/summary reflow at 320 CSS pixels, sticky actions do not hide focus, and meaningful AT status avoids flooding.

## REQ29-C68 — Qualify selected review and its real remediation

**Story US29-C68:** As the source operator, I want review grouping to preserve native integrity and recoverable mistakes, so that bulk convenience cannot bypass existing source decisions or leave staff without a lawful remedy.

**Decision basis:** Q52-C12–C16; REQ29-P03/P08/P13–P18.

Native same-scope relationships, exact Q21/current-applicability identity, original grouping/result and immutable actor/basis/time protect all decisions. Prefer bounded references, not copied bytes/private bodies. Source time is trusted after relevant waits; parent cleanup cannot erase other owners' history. Current applicability is distinct from historical truth.

- **AC29-C68-01:** Every effective role/schema/table/column/sequence/EXECUTE/DML/RETURNING/view/function/trigger/worker/Storage/restore door is qualified or closed under the one P12 authority; code/call-site checks alone are insufficient.
- **AC29-C68-02:** Positive finite numeric selection/command/result/query/transaction/lock/retry/follow-through-age/history budgets and stable unique keyset paging are bound before activation. No unset cap, silent split/truncate, full tenant-history scan or N-per-file byte fetch; over-limit offers deliberate smaller/individual action.
- **AC29-C68-03:** Exact independently accepted attribution survives grouping/departure. Restricted history, security audit, safe traces and provider evidence remain distinct. Local selection can Clear; committed mistakes use Q60/actual source privacy remediation with capable independently authorized actors, never fake upload/SQL/universal Undo.
- **AC29-C68-04:** Additive schema/readback precedes UI; old unsafe paths fence. Never backfill human review from scan/task/legacy accepted flags or old partial loops. Stop new grouped admission preserves original recovery/decisions/follow-through and safe individual route; roll-forward/restore cannot re-emit effects.

## REQ29-C69 — Upload new staff evidence with truthful source provenance

**Story US29-C69:** As authorized staff holding a newly received local file, I want to add it directly to the eligible item, so that assistance does not force a recipient reupload or falsely attribute the upload to them.

**Decision basis:** Q53-C01–C03; Staff-supplied Document Evidence; REQ29-P01/P02.

Extend the ordinary Q28 admission meaning to new-to-custody local files on eligible issued unfinished items, while keeping existing reuse and recipient intake. New bytes mean neither freshness nor authenticity. Personal statements/signatures/consent/specialist duties stay independent. Current source authority, not possession/read/reviewer/task/rank, governs without a universal admin/second-reviewer/settings gate.

- **AC29-C69-01:** Trusted native staff/context, including qualified no-Party paths, supplies exact item/requirement/subject/purpose/version and actual occurrence. Record true staff contribution/durable receipt, never participant-attributed Submission Confirmation, affirmation or approval.
- **AC29-C69-02:** Receipt time comes from trusted admission after waits, not browser start/email/file metadata or a future unknowable commit timestamp. Verified private staging before admission is not request receipt; staff departure alone does not erase valid history.
- **AC29-C69-03:** Offer Upload file beside Add existing in context, with permitted target/instructions/file identity and one Upload and add authorizing exact preparation/transfer/finalization. No routine second completion click/modal/essay/account; local removal is inert.
- **AC29-C69-04:** Preserve lawful input only under its own purpose. Insufficient permitted target identification needs capable safe selection, not blind add/broader disclosure. Changed target/bytes/relevant terms require deliberate repair, never retargeting.

## REQ29-C70 — Verify private staff intake and close every late-write path

**Story US29-C70:** As the evidence source owner, I want received staff bytes sealed before admission, so that a live grant or delayed upload cannot overwrite accepted identity or evade cleanup safeguards.

**Decision basis:** Q53-C04–C05; REQ29-P04/P06/P12/P16.

Use a qualified private session bound to actor/Tenant/environment/source/item/purpose/immutable target/relevant basis/finite profile/expiry/semantic identity, with bounded technical attempt identity before provider effect. Unknown grant issuance reconciles and counts, not unlimited reissue. Client classification/readiness/visibility/overwrite flags are not authority.

- **AC29-C70-01:** Prove actual ingress/resource bounds and independent completion, rather than assuming a generic signed token enforces custom size/type/digest claims. Verify object identity/completeness/size/content/integrity plus current source eligibility; browser MIME/ETag/callback/URL is insufficient.
- **AC29-C70-02:** Seal exact immutable bytes against all grants/endpoints/retries/writers and settled in-flight work. Never reuse retired keys or treat a successful upload as consuming every still-usable capability. Late data stays tracked private preparation, not new receipt or overwrite.
- **AC29-C70-03:** Abort/source revoke/token expiry are distinct from closed write authority. Cleanup needs current source/custody disposition, retention and complete use/hold/processor coverage, fenced against finalization/references, with all writes closed and settled before safe disposal.
- **AC29-C70-04:** No delete-on-catch, token-expiry-only purge or empty-visible-use inference. Expired cleanup lease cannot reopen promotion while deletion may finish; preserve exact delete-generation fence until original outcome reconciles. Provider bytes are not disposed by metadata SQL.
- **AC29-C70-05:** No public bucket/URL, metadata-only insert or specialized avatar/official-artifact route substitutes for ordinary intake. A single qualified adapter may suffice; no forced second copy/store.

## REQ29-C71 — Admit staff supply coherently and recover exact original work

**Story US29-C71:** As staff adding evidence, I want an exact durable result despite interrupted transfer or concurrent review, so that retry does not duplicate contributions or erase a successful admission.

**Decision basis:** Q53-C06–C08; REQ29-P03/P05/P06/P10.

After required verified receipt, one real authoritative local transaction commits exact staff use/membership/evidence revision, custody reference/retention protection, truthful history/receipt, original result and required durable follow-through. Physical provider effects are not claimed transactionally atomic; no whole-Tenant lock or provider/scan I/O under source locks.

- **AC29-C71-01:** Failed source admission reports actual staged/denied state with owned safe cleanup, never another target/reopened request/dropped predecessor. A private object arriving is not commit.
- **AC29-C71-02:** Matching original reconciles before repeat transfer/add or fresh lifecycle checks, under current disclosure. Terminal state cannot turn known original success into a failed new attempt; callbacks/keys/jobs do not duplicate intake effects, while deliberate distinct source acts are not collapsed by equal bytes.
- **AC29-C71-03:** Transfer-grant expiry, source-intent expiry and current eligibility are separate. Exact valid incomplete transfer may resume without needless retransfer; no exactly-once physical-storage promise. Unknown is neither success nor rollback/deletion authority.
- **AC29-C71-04:** Recheck relevant instruction/evidence/comment/clarification/authority/current source after waits/retries without rebase. Q03/Q23/Q28/Q33/Q34/Q36/Q37/Q45/Q47/Q49/Q21/Q52/Q22 changes use actual structural dependencies, preserving independent evidence.
- **AC29-C71-05:** Picker/transfer/Checking is no hidden fulfillment hold. Closed/frozen/removed target rejects new admission while earlier receipts remain true. Source admission/cancel/removal order, not last response, determines outcome; ABA is not equal current basis.

## REQ29-C72 — Distinguish staff processing, removal and review

**Story US29-C72:** As a supplying staff member or reviewer, I want clear technical and source states, so that unsafe material cannot be accepted and a mistaken addition has a lawful remedy.

**Decision basis:** Q53-C09–C11; REQ29-P08/P10/P12.

Local selection, transfer, verified private receipt, pre-admission checking, source admission, expressly permitted post-admission Checking, inspection, review and F are distinct. Unknown/failed required pre-admission proof blocks; only actual profile-permitted post-admission work may remain. Technical failure is not substantive Request changes/rejection.

- **AC29-C72-01:** Quarantined/unsafe/unknown required-check bytes do not become readable/acceptable through rank. Preserve originals/derivatives and actual format coverage; no OCR/conversion/every-format expansion.
- **AC29-C72-02:** After admission, qualified workers/reviewers may continue independently of uploader session/read rights, subject to current restrictions. Later adverse findings preserve receipt/review history while actual source/safety repair applies, not silent deletion/unaccept/predecessor revival/reopen.
- **AC29-C72-03:** Addition preserves actual cardinality and never silently overwrites other contributions/uses. Qualified Remove from this item applies to the exact unaccepted staff upload, preserving receipt/removal history/shared bytes. Pre-admission Stop upload that loses to admission returns the known result and actual source remedy.
- **AC29-C72-04:** Safe removal plus new Upload/Add existing is complete recovery; any offered replacement must use Q28 atomic withdrawal/admission and exact lineage with no predecessor revival after later failure. Accepted/terminal/sensitive cases require capable source/privacy/records remedy before activation.
- **AC29-C72-05:** Q21/Q23/Q52 inspection/acceptance and actual separation rules remain. New bytes neither transfer approval nor automatically clear/inherit all concerns. Participant guidance points to a real permitted action, never blind affirmation or amending protected staff evidence. Q22 owns F and Q25 original readiness.

## REQ29-C73 — Preserve staff evidence disclosure, filing and existing review notices

**Story US29-C73:** As a participant or source reviewer, I want staff-added evidence to retain its exact disclosure and work meaning, so that assistance does not expand my archive or trigger unrelated messages.

**Decision basis:** Q53-C12–C13; Q42/Q50/Q27; REQ29-P04/P09.

Supply grants no participant own-submission/read/preview/history/completed access, nor staff all-evidence reading. Each status/name/origin/count/result follows current source projection; independent staff work after recipient expiry does not renew that recipient. Sharing/export/comments/attention remain independently qualified.

- **AC29-C73-01:** New independent uses start Unfiled, without labels or staff name. Actual qualified Q28 replacement may carry only exact predecessor home under current same-scope destination/maintenance authority; optional failure becomes Unfiled after valid admission, never missing-authority bypass.
- **AC29-C73-02:** Exact staff-upload admission that makes review newly actionable joins Q28's existing Q24/Q27 staff-origin cohort, with original policy/recipient generation, Off default, complete release, current utility and permanent dedup.
- **AC29-C73-03:** Storage/scan callbacks cause source reevaluation only, not mail/work per file. Valid source receipt/work survives unavailable optional mail through owned original-boundary recovery; Remove alone creates no new mail.
- **AC29-C73-04:** Q26 requires actual Request changes; Q32/Q35/Q40/Q48/Q51 retain their purposes. No upload notice, bell, attention, reminder/access reset, extraction corpus, public visibility or blanket suppression follows.

## REQ29-C74 — Deliver accessible staff upload with finite safe operation

**Story US29-C74:** As staff on a slow connection, I want persistent truthful progress and recovery, so that assistance works without an extra console or unsafe fallback.

**Decision basis:** Q53-C14–C18; REQ29-P03/P11/P13–P18.

Reuse qualified shared selection/status composition with real finite limits and source results. Distinguish Uploading, Checking file—not yet added, Adding, Added—checks in progress and Added—awaiting review where those states exist. Uncertain finalization shows Checking result; known Added plus failed refresh stays Added.

- **AC29-C74-01:** Multiple files within one item retain each true intended outcome and only unresolved recovery; no atomic remote-transfer promise or cross-item batch intake. Explain limits before transfer and safe specific errors, not public-email/external-viewer privacy fallback.
- **AC29-C74-02:** Keyboard/non-drag/touch/AT/focus/reading preservation/reflow/zoom/Unicode/RTL filenames and restrained progress work. No mandatory preview/full-page console/offline queue/private persistence; context changes fence late output. Actual inspectable content remains separately qualified.
- **AC29-C74-03:** Native same-scope version/intake/result/history constraints and every effective DML/Storage/job/restore path qualify. No body/base64/unbounded history in business rows, permission shadow or principal/source cascade destroying independent evidence.
- **AC29-C74-04:** Publish and prove source-specific positive finite budgets for bytes/counts/transfers/processing/grants/in-flight settlement/retries/queries/cleanup/retention/cost, including boundary-plus-one. No Infinity, avatar/vendor cap borrowing or zero-bill claim; direct qualified private transfer is allowed.
- **AC29-C74-05:** Census actual old files/readers/writers; unknown origin/receipt/timeliness cannot be inferred. Deploy compatible source/schema before UI; safe stop retains committed truth/recovery/cleanup. Restore actual bytes plus source/reference/negative history before serving; SQL backup alone is insufficient.

## REQ29-C75 — Suggest only independently eligible exact held candidates

**Story US29-C75:** As staff selecting a local file, I want optional possible-existing assistance, so that I may reuse a suitable held version without exposing another source or trusting my browser's hash as proof.

**Decision basis:** Q54-C01–C03/C09; REQ29-P01/P02/P04/P12.

Preserve Q28 Add existing and Q53 Upload and add; suggestions are a separately qualified Q38 source purpose only for eligible staff preparing a file for an outstanding ordinary item. No participant matcher, visual/semantic similarity, body search, OCR/AI, physical deduplication or generic duplicate console.

- **AC29-C75-01:** Current trusted source/item/subject/purpose and matching/discovery authority filters exact held use/version candidates before presence/rank/count/page/thumbnail/timing cue/serialization. Upload/read/assignment/possession/query fingerprint is no reuse or discovery grant.
- **AC29-C75-02:** Full-original collision-resistant fingerprint algorithm/version/coverage must be compatible with trusted immutable held verification lineage. Filename/MIME/size/unqualified ETag/thumbnail/rendition/sampled resume hash is not a substitute.
- **AC29-C75-03:** Browser fingerprint is untrusted bounded query input, not certified incoming equality, custody, authorship/freshness/rights or catalog fact. A candidate may be disclosed before incoming transfer when independently authorized; no artificial upload just to search.
- **AC29-C75-04:** Equal bytes never merge provenance/subject/use/consent/retention/approval/currentness. Preview/history/final reuse independently reauthorize, and existing source review/cardinality/personal participation remain unchanged.

## REQ29-C76 — Offer quiet timely assistance without delaying upload

**Story US29-C76:** As staff preparing evidence, I want a useful hint only when it can help, so that optional matching never becomes a waiting step or a misleading duplicate warning.

**Decision basis:** Q54-C04–C05/C14; REQ29-P10/P11.

Bounded helper work runs only in the current selected-file context before source intent. Keep Upload and add usable during checking. Show An existing file may match only for a currently permitted useful candidate; no routine zero banner, scary duplicate badge, repeated announcement, check modal or additional completion step.

- **AC29-C76-01:** One safely distinguishable candidate may expose direct Use existing file beside sufficient permitted identity/target; Review is optional. Multiple/ambiguous candidates use the qualified picker without arbitrary first/default selection or permission/provenance merge.
- **AC29-C76-02:** Review is inert and preview independently optional. One deliberate Use existing performs actual Q28 addition, not fresh original receipt or inherited acceptance; lawful return to local upload remains. If context cannot distinguish the candidate safely, no blind add.
- **AC29-C76-03:** Exact already-current membership returns Q28's honest existing/no-op and original attribution, not a new contribution or automatic upload cancellation.
- **AC29-C76-04:** No hint/incomplete/error is not global absence or weakened Q53 safety. Primary actions, reading order, context/focus/scroll survive return; no forced preview/hover/motion/whole-screen console. Keyboard/non-drag/AT/touch/reflow/IME/RTL/weak-network tasks qualify.

## REQ29-C77 — Choose one source route and reconcile it before switching

**Story US29-C77:** As staff using a candidate or uploading instead, I want one clear intended addition, so that a late hint or lost response cannot add the same intent twice.

**Decision basis:** Q54-C06–C09; REQ29-P05/P06/P08/P10/P16.

The existing authoritative operation boundary binds immutable chosen route/payload to one intended addition with a server-enforced winner. Once Q28 or Q53 may begin, fence alternative commands and late hints. Recover matching original under current disclosure before changing route or interpreting new eligibility.

- **AC29-C77-01:** Changed material conflicts; no automatic reuse→upload or upload→reuse fallback. Only definitively unstarted/failed/canceled work may be deliberately repaired as source allows; uncertain admission is not absent. Later genuine eligible contributions remain possible despite equal bytes.
- **AC29-C77-02:** Lookup itself creates no receipt/effect slot/evidence revision/reference/hold/acceptance/reservation/F hold; required protected-read audit remains. Retry is a fresh bounded current read, never replay of old disclosure authority.
- **AC29-C77-03:** Bind responses to actor/context/target/relevant basis/selected-file and query generation, not digest only. Replacement/removal/dismissal/disable/expiry/source-start/context change fences pending output; no locked global search snapshot is promised.
- **AC29-C77-04:** Lookup requires no incoming storage session. If qualified staging exists, reuse retires it through Q53 cancellation/recovery, with actual grants/in-flight writes/unknown effects/retention/holds/reference checks before cleanup. No delete-on-match/switch/catch; helper cancel never cancels committed source work.
- **AC29-C77-05:** Only actual new Q28/Q53 admission creates its qualified Q24/Q27 effects; hints/dismissal neither notify nor reset clocks. New use copies no filing/labels/staff names/comments; exact already-qualified replacement exception alone remains.

## REQ29-C78 — Control the helper without changing baseline evidence powers

**Story US29-C78:** As tenant staff, I want limited helper controls and private query handling, so that disabling or dismissing suggestions does not remove my normal upload/reuse path.

**Decision basis:** Q54-C10–C11/C15; REQ29-P04/P08/P14.

One tenant helper control uses existing configuration ownership. It defaults Enabled only on explicit qualification/activation of the declared cohort, never silent existing-tenant backfill. Staff dismissal lasts for the current selected-file generation, including review return and Off→On; no permanent personal-preference matrix is required.

- **AC29-C78-01:** Off stops new helper work and fences hints, not independent Q28/Q53 selection/read/admission or a started source operation. On allows fresh current lookup only for a still-applicable nondismissed selection, not old result/dismissal revival.
- **AC29-C78-02:** Unknown policy produces no hint, not proved Off or no file. Enabling creates no fingerprint-retention or general search entitlement; changes are attributable.
- **AC29-C78-03:** Fingerprint/query/filename/candidate data is protected even on zero results; no URLs, shared caches, general logs/analytics/error capture/session replay or unapproved durable browser storage. Digest is not anonymization.
- **AC29-C78-04:** Distinguish unstarted/disabled/unqualified/no eligible suggestion/candidate/incomplete/error/original unknown internally with safe user presentation. Source acts keep their normal history; hint queries need no permanent business log. Only minimum governed diagnostics/configuration audit persists.

## REQ29-C79 — Qualify small responsive matching and safe migration

**Story US29-C79:** As the source operator, I want matching to be bounded and optional, so that large files or incomplete legacy fingerprints cannot slow or weaken ordinary intake.

**Decision basis:** Q54-C12–C17; REQ29-P03/P13–P18.

Use bounded indexed compatible-held-fact lookup with set-wise current eligibility, stable unique continuation and per-page permission, through the source/API boundary. A rebuildable fingerprint projection is not authority. No browser whole-corpus download, candidate-byte fan-out, cross-use digest uniqueness, permission store or new matcher/provider/Realtime platform.

- **AC29-C79-01:** Actual same-scope immutable use/version/fingerprint algorithm/coverage constraints and every native alternate read/write/Storage door prevent trusted-fact forgery/retargeting; no raw bodies/base64/unbounded history in business data.
- **AC29-C79-02:** Finite device memory/CPU/responsiveness/file/corpus/query/rate/candidate/page/concurrency/retry/cache/backfill budgets are measured and enforced. Unsupported/slow/oversized hash work skips helper without reducing independently qualified upload limits; obsolete work/buffers/URLs settle finitely, not instant-abort fiction.
- **AC29-C79-03:** Browser reload may need reselection, not persistent private bytes. Known source success survives refresh failure; unknown recovers original. No instant detection, physical storage saving, free-bill or all-input guarantee without evidence.
- **AC29-C79-04:** Deploy trusted-fact/current-authority/route fences before UI. Census legacy facts, preserve independent equal-byte documents, expose partial digest coverage honestly and backfill only when justified; no all-library scan prerequisite or blessing arbitrary assets metadata.
- **AC29-C79-05:** Disable helper safely while baseline routes/original recovery/cleanup remain. Mixed-version/restore applies later restrictions and delete fences before rebuilt candidates; actual role/storage/route-race/device/accessibility/workload evidence qualifies activation, not a prototype/API description alone.

## REQ29-C80 — Read resources with honest advisory review status

**Story US29-C80:** As an authorized resource reader, I want to understand review status while continuing to use eligible guidance, so that a planning date neither hides useful content nor falsely certifies it.

**Decision basis:** Q55-C01–C04/C12, with Q58 staff-reader adoption; REQ29-P01/P04/P07/P08.

P28 owns publication and review meaning. An elapsed review target alone does not withdraw an independently safe, published, authorized resource. Every actual safety, rights, validity, withdrawal and source restriction still applies. Publication, Updated, actual review and future planning remain separate facts.

- **AC29-C80-01:** Show Review due after the full target day, otherwise Review planned for [date] or known No review scheduled. Future/absent targets never mean Fresh, Verified, Safe or guaranteed current; Open/Download requires no due acknowledgment or forced preview.
- **AC29-C80-02:** Last reviewed comes only from the latest still-applicable noninvalidated actual review of the exact content/audience/purpose basis. Complete proved absence and unknown/incomplete history have distinct neutral states; neither means nobody ever reviewed it. REQ29-C107 refines current shared-publication applicability.
- **AC29-C80-03:** External-resource review describes the approved reference and declared scope at that time, not continuing verification of remote bytes. No new crawler or download tracking is introduced. Independent safe guide advice remains; unsafe dependent advice follows C44, without blanket guide shutdown or a new reader task.
- **AC29-C80-04:** Permission precedes status, counts, dates, names, links and accessible labels. Unknown review metadata alone does not withdraw an independently authorized resource; unknown access fails closed. Current day/refocus/reconnect refresh is bounded, not polling each card or writing a due event.

## REQ29-C81 — Plan or change a resource review date

**Story US29-C81:** As a curator, I want an explicit optional next-review plan, so that scheduling is flexible without fabricating a completed review.

**Decision basis:** Q55-C03/C06/C10/C14; REQ29-P05/P07/P11.

Use a finite civil date and captured source-declared IANA zone, initially the qualified organization setting. Unknown zone requires a valid source choice, not browser inference. Ordinary targets are optional; an independent source-required target cannot be cleared.

- **AC29-C81-01:** Due means trusted source-local current date is later than target; equality is not overdue. Locale and later tenant-zone changes do not reinterpret stored meaning. Explicit attributed zone changes preserve prior evidence; ambiguous legacy dates remain unknown.
- **AC29-C81-02:** Set/Change/Clear uses deliberate Save and explains Changing this date does not record a review. New plans use today/future; factual correction/import preserves proved dates. Clear means No review scheduled, not Never expires.
- **AC29-C81-03:** Rescheduling a missed target changes current due status while preserving prior target/zone/actor/time and actual Last reviewed. No sticky cycle, second planning date, recurrence or automatic interval is created.
- **AC29-C81-04:** Current-authorized identical target is a no-op, including an unchanged now-past target; no business revision/history/event or timer reset. Original replay precedes new-plan validation; relevant stale A→B→A basis conflicts. Date picker, typing, blur and IME do not save implicitly.

## REQ29-C82 — Record an actual resource review

**Story US29-C82:** As a qualified curator, I want to record review of unchanged or updated guidance, so that review evidence does not require a fake edit or re-upload.

**Decision basis:** Q55-C02/C05/C10/C12; REQ29-P02/P05/P06/P08.

Record review binds actual actor and authoritative occurrence time to the exact reviewed publication/version/audience/purpose/conditions. Read-click counts, elapsed preview time, scans and generic Publish/Save/Restore do not prove review.

- **AC29-C82-01:** One deliberate act atomically records review and explicit next target (today/future or permitted none). Show and confirm a retained valid future target; explain completion of an old past target and require an explicit next state, without hidden rollover.
- **AC29-C82-02:** Publish/correct/replace may compose Record review only with explicit actual-review intent and exact basis. No routine second moderator, essay or re-upload is required. Record review does not republish a withdrawn resource.
- **AC29-C82-03:** Relevant content/audience/purpose changes require refreshed review; unrelated technical/display changes do not automatically invalidate it. No broad transaction spans remote inspection. A later deliberate review may create another fact for the unchanged basis; value equality is not a review no-op.
- **AC29-C82-04:** Lost replies recover the original under current disclosure, without stamping another review or overwriting a newer target. Failed replacement preserves old content only while independently eligible, with its own review state.

## REQ29-C83 — Correct mistaken review or planning facts

**Story US29-C83:** As a source-authorized curator or operator, I want to correct a demonstrably mistaken record, so that current guidance is truthful without rewriting history.

**Decision basis:** Q55-C07/C10/C12; REQ29-P08/P10/P14.

Provide a capable scoped factual-correction route with concise factual reason, exact current basis and real attribution. Distinguish a misrecorded target/review from ordinary deferral or a new actual review.

- **AC29-C83-01:** Preserve and link original actor/time/fact. Invalidating an erroneous review removes only its current applicability, recomputes remaining applicable Last reviewed, and atomically confirms the current target; it never blindly restores an earlier target or publication/access state.
- **AC29-C83-02:** A proved target correction may yield a past due date; it is not a hidden future-plan validation bypass. Newer facts, source restrictions and lawful erasure rules remain binding.
- **AC29-C83-03:** A departed curator has actual source stewardship recovery without impersonation or universal staff power. Direct database repair or powerless Contact admin is not the permanent user path.
- **AC29-C83-04:** Corrections neither alter ordinary acceptance/F, reminder clocks, financial/consent/coaching facts nor other uses/holds/retention. Withdrawal does not recall downloads or control an external website.

## REQ29-C84 — Use a small accessible resource management surface

**Story US29-C84:** As a curator or reader on any supported device, I want clear focused resource actions, so that review maintenance does not become another inbox or CMS.

**Decision basis:** Q55-C13–C15; REQ29-P11/P13/P14.

Existing resource management exposes permitted due/unscheduled/unknown filters, current ownership, exact content/basis, target and history. Readers receive only lawful status and Open/Download/Back/Retry/successor actions; internal reasons and identities remain protected.

- **AC29-C84-01:** Distinguish no resources, no matches, unknown metadata, load failure and unavailable link. Preserve safe filters/list position/input across return and conflicts while reauthorizing; Saving/Checking result does not announce success prematurely.
- **AC29-C84-02:** Text and programmatic status, associated persistent errors, keyboard date input plus accessible picker, meaningful announcements and logical unobscured focus are required. Qualify 320 CSS-pixel reflow, 200% text, 400% zoom, long names, RTL/IME, touch and weak networks; chrome cannot repair unreadable source content.
- **AC29-C84-03:** No ordinary second confirmation, required essay, mandatory file fetch, new AI verification, reminder job, index/provider or per-resource polling. Actual independently qualified C44 effects remain.

## REQ29-C85 — Preserve review integrity across every read and write door

**Story US29-C85:** As the source operator, I want review facts and projections to share one current authority boundary, so that alternate paths cannot fabricate trust.

**Decision basis:** Q55-C08–C12; REQ29-P02–P06/P08/P16.

Source commands atomically admit effect, history and result through validated current context. Same-scope publication/version/organization relationships, valid date-zone pairs, known-none versus unknown, immutable authorship and allowed transitions must hold through every effective database/Storage/service door.

- **AC29-C85-01:** Qualified staff without a Party remain usable; role labels, editable ownership, old JWT membership or a service bypass do not grant curation. History/status/bytes have separately qualified disclosure, with current scope before serialization and cache/prefetch serving.
- **AC29-C85-02:** Enforce actual native keys/constraints/grants/RLS old/new-row behavior, function/view privileges and alternate writers; use P12's shared fine-grained decision with coarse Tenant RLS and exact R6. No permanent one-review-per-version uniqueness suppresses genuine later review.
- **AC29-C85-03:** Retained readable history and opaque original-result/reject evidence have distinct lawful retention. Erased result detail cannot turn an old operation into a new one. Restore/rebuild reapplies later restrictions and invalidations before serving.

## REQ29-C86 — Activate resource review only with bounded complete proof

**Story US29-C86:** As the release operator, I want qualified review behavior and repair, so that legacy metadata and runtime limits cannot create false freshness.

**Decision basis:** Q55-C15–C17; REQ29-P13–P18.

- **AC29-C86-01:** Backfill only established facts; missing review metadata does not itself hide a proved published/authorized legacy resource. Unknown publication/access/classification remains unadmitted. No automatic deadline, cadence or fabricated badge is activated for existing tenants.
- **AC29-C86-02:** Compatible readers and fenced old writers precede bounded enablement; disabling new commands preserves safe history and withdrawal/access controls. Rollback cannot drop committed evidence or revive invalidated reviews.
- **AC29-C86-03:** Paginated source-scoped queries use deterministic unique continuation and measured indexes; no now()-dependent immutable index or byte downloads for metadata. Finite input/history/page/time budgets and production-shaped plans are enforced.
- **AC29-C86-04:** Preserve existing C49 controls, including resource target-read server p95 greater than one second for fifteen minutes at approved tested workload; this is an alert threshold, not a measured baseline or scheduler SLA. Actual role/clock/race/correction/restore/AT/performance evidence is required before activation.

## REQ29-C87 — Optionally compose photos in one ordinary item

**Story US29-C87:** As a recipient or authorized staff supplier, I want an optional in-context photo composer, so that I can submit an ordered PDF without losing the direct file route.

**Decision basis:** Q56-C01–C04/C15; REQ29-P01/P11/P12.

Retain Upload files (including separate images and prepared PDFs) and offer Combine photos into a PDF only for one eligible ordinary item and qualified profile. Source formats/statements/cardinality/access still govern. Recipient and staff origins remain distinct; no OCR, crop/enhancement, signing, redaction, PDF merge, cross-item merge or historical-library editor is implied.

- **AC29-C87-01:** Choose photos and supported Take photo show exact permitted target, ordered pages, Not submitted yet and notice of original-photo retention under source policy. One deliberate Create PDF and submit/add may authorize preparation through admission; no routine second confirmation or mandatory page/output preview.
- **AC29-C87-02:** Selection/capture/blur/reorder/rotate/callback cannot submit. Device-prepared PDF intake claims no custody of unseen photos. Camera denial/unsupported format preserves independently permitted direct intake and actual authorized accommodation, without forced account/cloud/device/scanner.
- **AC29-C87-03:** Show actual limits and per-page repair. Source-required unchanged images do not become acceptable merely by conversion; unsupported animation/multiframe variants are rejected, never silently reduced to one frame. MIME/extension/browser preview are insufficient format proof.

## REQ29-C88 — Arrange complete page occurrences without changing originals

**Story US29-C88:** As a composer user, I want reliable accessible page controls, so that the submitted order and rotation match my intent.

**Decision basis:** Q56-C03–C06/C15; REQ29-P11/P12.

- **AC29-C88-01:** Permit one or more valid occurrences within qualified limits; zero or unresolved selected pages block the intended composition. Add/Remove/Replace/Retake, non-drag Move up/down and clockwise quarter-turn controls use stable occurrence IDs and explicit order.
- **AC29-C88-02:** Identical input bytes may appear in distinct deliberate occurrences. Reject duplicate occurrence IDs/ambiguous positions; never deduplicate by bytes/name or order by transfer completion. Failed/canceled retake retains the prior local page until replacement succeeds.
- **AC29-C88-03:** Normalize intrinsic orientation once then explicit rotation; four quarter turns normalize. Preserve full coverage/aspect ratio with no silent clipping, paper-size crop or color enhancement. No skipped failed pages, empty PDF or reduced substitute set.
- **AC29-C88-04:** Keep stable focus after move/remove/retake, visible unobscured focus, associated errors and meaningful non-stealing announcements. Keyboard/speech/touch/non-drag, RTL/IME, long names, reflow/zoom and weak-network paths qualify; last-page removal returns a usable empty state.

## REQ29-C89 — Bind one assembly to exact originals, recipe and output

**Story US29-C89:** As a reviewer, I want the complete assembly lineage, so that generated output is never mistaken for an original or disposable preview.

**Decision basis:** Q56-C05–C09; REQ29-P01/P03/P08/P12/P16.

One Document Assembly is one source contribution: selected immutable originals, ordered page occurrences/rotations/profile and separately identified immutable Assembled PDF. Participant inputs remain Submitted Originals; staff inputs/output retain staff origin. Internal pages are not separate request items or receipts.

- **AC29-C89-01:** Trusted processing uses verified immutable private inputs after all write capabilities close/fence; bind source/operation, exact verified IDs/digests/sizes, ordered recipe/profile/builder/options and output ID/digest/size/page count. Client manifest/PDF/digest claims are not correspondence proof.
- **AC29-C89-02:** Each occurrence yields one output page in order. Qualified inert static output has no active scripts/remote references. Actual correspondence, legibility, color, decoder/orientation/frame and finite process-tree limits are proved; no compulsory redundant second decode is imposed if trusted qualification suffices.
- **AC29-C89-03:** One immutable generation winner is recovered; technical retries cannot overwrite it. Cross-version byte-identical regeneration is not required or assumed. Recipe alone does not back up admitted bytes; D32 preview expiry does not dispose of the evidence PDF.
- **AC29-C89-04:** Required originals/output/lineage have actual source retention and separately qualified disposal; not every abandoned retake is kept. Decoding is isolated, least-privilege and without unqualified egress/ambient credentials; caller URLs/paths/executables cannot select processor input. No transaction spans remote processing.
- **AC29-C89-05:** Native constraints enforce scoped ownership, immutable references, unique occurrence slots, positive finite counts/bytes and legal rotations/profile; repeated inputs remain allowed. Every alternate database/service/Storage writer and read door preserves these invariants.

## REQ29-C90 — Admit the whole verified assembly once

**Story US29-C90:** As a submitter, I want a truthful whole-unit receipt, so that uploaded pages or unfinished generation do not falsely replace my earlier evidence.

**Decision basis:** Q56-C07–C10; REQ29-P02/P05–P07/P09/P10/P16.

All required input/output integrity, safety, source and processing proof precedes whole-unit source admission. Preparation/upload/generation are technical facts, not receipt. There is no pending-required-output admission lane.

- **AC29-C90-01:** At one current-authorized source commit after waits, atomically bind every required input/output custody reference against deletion, exact assembly/recipe, actor/receipt time/instructions/statements, candidacy/correction relation, history/result and mandatory follow-through intent.
- **AC29-C90-02:** Only that commit applies Q03 predecessor fencing and review-basis change. Failed/canceled preparation leaves prior contribution's independent eligibility intact. Dispensable preview failure after receipt does not undo receipt; required output safety cannot be skipped by saying Received.
- **AC29-C90-03:** Preparation access never extends access/deadlines or reserves acceptance/F. Freeze exact semantic intent and expected basis; same-intent original recovery precedes current eligibility, changed intent conflicts and relevant ABA is detected. Unknown outcome cannot automatically switch to separate photos/new operation/recipe.
- **AC29-C90-04:** Actual recipient/no-Party or staff context and source authority are checked before durable allocation/expensive work and at all admissions/reads. Camera permission, Party, profile or key knowledge grants nothing. Current input restrictions apply to derived content; output permission need not grant original downloads.

## REQ29-C91 — Cancel preparation and recover custody truthfully

**Story US29-C91:** As a user or operator, I want cancellation and retry to reflect the actual winner, so that stale workers cannot resurrect an abandoned submission.

**Decision basis:** Q56-C10–C11/C16–C17; REQ29-P05/P10/P13/P16.

- **AC29-C91-01:** Distinguish local Remove/Cancel, stop requested, source admission, withdrawal and physical disposal. Cancel that wins before admission fences later admission; committed admission returns its real result and source remedy, never false deletion.
- **AC29-C91-02:** Register grants/attempts/copies/outputs/intended references before I/O. Reconcile unknown grant creation; exact qualified resume does not choose a browser fingerprint match. Immutable generation keys/no upsert, settled writers and current deletion/reference fences prevent stale completion resurrection.
- **AC29-C91-03:** Token/lease expiry or client abort proves neither write nor delete settlement. Cleanup needs current disposition authority, complete reference/hold/retention/processor coverage and verified provider removal. Unknown coverage blocks deletion; local dismissal cannot delete shared/admitted bytes.
- **AC29-C91-04:** Stop unused camera streams/release local previews safely; no promise of device/backup erasure. Unsent local work may be lost on reload/backgrounding; only genuinely durable preparation recovers under current rights, without invented offline sync.
- **AC29-C91-05:** Finite format/page/input/pixel/live-memory/output/CPU/time/concurrency/queue/retry/custody/cleanup budgets cover full work, measured before activation. Generate on deliberate intent/bounded preview, not each edit. No promised compression, free processing or copied vendor/avatar limits.

## REQ29-C92 — Read and review the exact assembly safely

**Story US29-C92:** As a qualified recipient or reviewer, I want one understandable assembly with separately permitted originals, so that review and readback preserve source provenance.

**Decision basis:** Q56-C08/C12/C14–C15; REQ29-P04/P09/P11.

- **AC29-C92-01:** Show one candidate, Assembled PDF, truthful page count/original relationship and actual origin/status. Current recipient readback covers that recipient's admitted output and expressly permitted inputs, not staff/other people's evidence or general historical bytes.
- **AC29-C92-02:** Staff acceptance binds complete assembly identity/recipe/output/input lineage. No per-page Accept ritual or forced ZIP; generation is not review. Q30 and all five Q45 mutations affect only structurally relevant prepared review under existing rules.
- **AC29-C92-03:** Every thumbnail/name/count/lineage/HEAD/range/conditional/long-transfer/cache path uses current permission. A prohibited required constituent denies the indivisible PDF, never silently filters it. Original-only sensitive metadata may remain hidden; downloaded copies cannot be recalled.
- **AC29-C92-04:** Q44 still exports selected eligible originals; Download assembled PDF is separately authorized. Q45 anchors target exact output/original and never migrate. Q41 output sharing does not share inputs/recipe. Q28 reuse copies no assembly consent/acceptance; Q42/Q50 attach to actual use; Q54 cannot collapse composition.
- **AC29-C92-05:** General discovery remains metadata-only; no OCR/body ranking added through previews. Source-required accessible content or actual accommodation remains necessary; image-only output is not claimed to have accessible text or reliable reading order.

## REQ29-C93 — Correct or resupply an assembly without recapturing lawful pages

**Story US29-C93:** As an authorized supplier, I want to reuse lawful unchanged pages in a new contribution, so that correction does not require needless re-upload or mutate earlier evidence.

**Decision basis:** Q56-C13–C14/C17; REQ29-P05/P08/P10/P16.

- **AC29-C93-01:** Current recipient correction creates a new complete assembly/output with current statements/time, reusing exact lawful inputs only from the own current same-request/item/purpose assembly. Preserve byte receipt provenance without inventing new upload/copy or redundant safety work.
- **AC29-C93-02:** Whole-unit Q47 Withdraw and unchanged Re-offer remain distinct. Create revised submission may use an eligible own withdrawn assembly's exact permitted inputs under fresh same-lineage resupply authority; it creates a new act without reviving old withdrawal or exposing other history.
- **AC29-C93-03:** Qualified staff same-lineage correction/revised supply may reuse lawful inputs without author-only restriction, under Q28/Q53 staff origin. Pending Remove is whole-unit; optional Replace is coherent exact old removal/new admission, never accepted-byte overwrite or recipient impersonation.
- **AC29-C93-04:** Missing/prohibited inputs receive actual fresh-supply/source repair, never substitution. Accepted/terminal/privacy mistakes have capable source remedies before activation, no universal Undo/predecessor revival. Disabled processing profile blocks corrections needing it while preserving independently qualified direct repair.

## REQ29-C94 — Preserve assembly effects, privacy and upgrade safety

**Story US29-C94:** As the operator, I want one source occurrence and compatible recovery, so that composition adds no duplicate work or unsafe legacy inference.

**Decision basis:** Q56-C14–C18; REQ29-P09/P13–P18.

- **AC29-C94-01:** Q24/Q27 effects arise once from genuinely actionable whole-unit admission in their actual recipient/correction/staff/re-offer cohorts. Preparation adds no receipt email/task/reminder/attention/completion event; all other source effect boundaries remain.
- **AC29-C94-02:** Original EXIF/location and recipe/context remain protected; thumbnails/output avoid unnecessary sensitive metadata while originals retain truthful bytes. No private content in generic logs/analytics/session replay/shared caches or unqualified durable browser storage; qualified protected carriers retain exact scope/lifetime.
- **AC29-C94-03:** Compatible source/lineage/profile support and fenced old writers precede bounded enablement. Unknown legacy lineage is not inferred from names/time; restore reconciles restrictions/withdrawal/retention and exact bytes before serving. Kill switch stops new profile work, preserving lawful existing reading/recovery/withdrawal/cleanup.
- **AC29-C94-04:** Real identity/DB/Storage, parser/provider upgrades, whole-unit races, fidelity/backup, mobile/camera/AT and workload evidence qualify activation; logical models and public avatar upload tests do not. Supported operator repair replaces recurring SQL cleanup.

## REQ29-C95 — Report a resource problem in context

**Story US29-C95:** As an authorized resource reader, I want to report a problem with known resource context, so that responsible curators can address it without a support conversation.

**Decision basis:** Q57-C01–C03/C14–C15, Q58 staff-cohort adoption; REQ29-P01/P02/P11.

P28 owns Resource Problem Reports. Offer Report a problem beside ordinary resource actions when safe metadata and reporting authority identify the exact publication, even when its body/download fails. Preserve capable Help for personal/out-of-purpose assistance.

- **AC29-C95-01:** One bounded plain-text What is wrong with this resource? field identifies handling audience and nonanonymous identity, with useful purpose/privacy help. Do not ask known contact data again. Blank/invalid/over-limit input has associated errors, not truncation; one useful sentence can suffice.
- **AC29-C95-02:** Send report is deliberate; selection/typing/blur/IME/opening cannot submit. No compulsory preview, attachment, screenshot, taxonomy, rating, rich editor, mention delivery, AI judgment, second confirmation or staff picker.
- **AC29-C95-03:** New admission binds current exact publication/version/language/purpose and real actor/time. Changed target basis preserves lawful draft and requires refreshed intent, never silently attaches to successor. External references capture the approved reference/observation, not remote-byte verification or a fetched snapshot.

## REQ29-C96 — Receive reports with a capable handling route

**Story US29-C96:** As a reporter, I want a durable truthful receipt and responsible handling, so that a successful send does not disappear into an unowned queue.

**Decision basis:** Q57-C04/C10–C12; REQ29-P03/P05/P06/P14.

Only Open, Handled and Withdrawn are report business states. Admission atomically records exact content/revision, immutable actor/receipt/target, Open state, capable source handling route, history and original result. Privacy/loading/retention/unknown remain independent.

- **AC29-C96-01:** After known receipt, reader Open may display Awaiting review, distinct from Sending and Q55 review status. The route need not name an online individual but must support current handling/stewardship takeover; no false receipt for unqualified ownership.
- **AC29-C96-02:** Existing resource management projects permitted pending work; no duplicate mutable task, outbox/inbox/assignment engine or mandatory In progress. Reading neither claims nor handles work; curator departure grants no blanket staff body access.
- **AC29-C96-03:** Same semantic operation recovers original before new eligibility/no-op/rate admission; changed intent conflicts. Equal-text distinct deliberate reports remain valid. Revision/ABA fences protect edit/handling/withdraw/reopen races; no tenant-wide locks or network locks.
- **AC29-C96-04:** Source/API and native constraints preserve exact scoped target/reporter/receipt, valid state/outcome/handler basis and history. Static field-policy classification with subtract-only projection and stable code-owned capability meaning governs every alternate read/write door; no raw-table exposure through broad Support policies.

## REQ29-C97 — Return to one's own permitted report history

**Story US29-C97:** As a reporter, I want to return to my receipt and handling status, so that I can understand the outcome without an inbox or resource-history grant.

**Decision basis:** Q57-C05/C10/C13–C14; REQ29-P04/P08/P10.

- **AC29-C97-01:** Your reports inside Resources and contextual return provide bounded current-authorized own receipts/status. Independently admitted report-purpose rights may survive resource replacement/withdrawal; identity equality or retention alone cannot authorize them.
- **AC29-C97-02:** Text/title/outcome/history are separately permitted. Use neutral Resource unavailable when appropriate; no internal notes, other readers' reports, hidden title/reason or historical byte access. Actual submission/edit/handled/restored times are distinct; Handled does not mean Fixed or read-confirmed.
- **AC29-C97-03:** Known receipt survives secondary refresh failure. Empty, filtered-empty, unavailable, denied and failed/unknown loads differ safely; preserve lawful list/focus/filter context and fence late responses after identity/context changes.

## REQ29-C98 — Edit, withdraw and restore one's open report

**Story US29-C98:** As a reporter, I want to repair my report without erasing its history, so that mistakes have a usable permanent recovery path.

**Decision basis:** Q57-C06–C07/C12–C13; REQ29-P05/P08/P10.

- **AC29-C98-01:** Current reporter edit authority permits exact-current Open text correction, preserving target/author/receipt and attributed history. Genuine canonical no-op creates no business revision; stale Open→Handled→Open or content ABA conflicts. Staff cannot impersonate/rewrite the allegation.
- **AC29-C98-02:** Wrong target requires deliberate withdrawal then a new eligible report; post-Handled new information is a new report, no automatic protected-text copy or chat. Maintenance of existing reports can remain lawful after resource withdrawal under separate report-purpose rights.
- **AC29-C98-03:** Deliberate own Open→Withdrawn removes pending handling with concise consequence copy, no essay or toast-only remedy. It is not body deletion, copy recall or suppression of independent incident/privacy duties; Handled is not ordinary reader-withdrawable.
- **AC29-C98-04:** Restore requires current restoration authority, lawful latest body the reporter can review/authorize, permitted audience and capable route. It creates a new attributed Open revision preserving receipt/target/withdrawal; no historical rollback, resource revival or redacted/disposed-text restoration. Blocked restoration has actual source/privacy repair or eligible fresh-report route.

## REQ29-C99 — Handle a report with an audience-safe outcome

**Story US29-C99:** As a current curator, I want to record a clear disposition, so that the reporter knows what was done without confusing handling with publication or verified correctness.

**Decision basis:** Q57-C08/C12/C15; REQ29-P02/P06/P09.

- **AC29-C99-01:** Mark handled applies only to exact-current Open content/state with current report authority, not last-publisher authorship. Require one concise Outcome for the reporter, labeled for that audience, without routine essay/taxonomy/extra approver.
- **AC29-C99-02:** Atomically retain actual handler/time, assessed revision, outcome, state/history/result. A concurrent real reader edit stales the handling form. Reading alone has no effect.
- **AC29-C99-03:** Resource correction/publication/withdrawal/review/date changes remain separate commands. If work fails, handling text cannot truthfully claim it succeeded; multi-command UX does not promise atomicity. No automatic report email/conversation or text-classifier verification.

## REQ29-C100 — Repair handling and sensitive reports

**Story US29-C100:** As a qualified curator or privacy operator, I want precise repair actions, so that a typo, premature handling or sensitive allegation can be corrected without a workflow maze.

**Decision basis:** Q57-C09/C13; REQ29-P08/P10/P14.

- **AC29-C100-01:** Correct outcome on current Handled appends attributed correction and preserves original handling/receipt. Trusted action/context supplies routine cause; an extra concise reason is required only by actual source policy, not for every typo.
- **AC29-C100-02:** Reopen Handled requires concise reason, current authority, retained lawful body/audience and capable route. It creates new Open revision; prior outcome is historical. Withdrawn is not curator-reopenable/handleable around reporter withdrawal.
- **AC29-C100-03:** Immediate scoped restriction and actual privacy/records correction/redaction cover Open/Handled/Withdrawn content, retained versions/outcomes/projections/caches/exports/backups as policy requires. Append-only history cannot preserve exposed sensitive text indefinitely; Restore/Reopen cannot recreate erased content.
- **AC29-C100-04:** Independent incident work remains possible; retention/holds grant no reading. No powerless support instruction, recurring SQL fix or generic admin bypass substitutes for capable scoped repair.

## REQ29-C101 — Keep reporting accessible, private and separate

**Story US29-C101:** As a reader using a supported device or assistive technology, I want a short recoverable reporting flow, so that accessibility or network failure cannot cause duplicate reports or unwanted disclosures.

**Decision basis:** Q57-C13–C16; REQ29-P04/P09/P11/P13.

- **AC29-C101-01:** Reuse base-maia/shared UI with labeled fields, permanent receipt, meaningful status/errors and unobscured logical focus. Qualify keyboard/speech/touch/AT, Enter/Space deliberate controls versus IME, reflow/zoom/RTL/long text and weak networks. No unqualified offline draft or reconnect auto-submit.
- **AC29-C101-02:** Report/body/identity/outcome/history visibility does not inherit resource readership. URLs/@names remain data; no fetch/mention grant. Generic logs/URLs/analytics/session replay/cache/local stores exclude protected values.
- **AC29-C101-03:** No Q55 review stamp, guide completion, ordinary comment, resource auto-withdrawal, email/SMS/subscription/unread obligation or task per report. Independently qualified effects and urgent duties retain owners; deliberate Help/new-report handoff copies only permitted context.

## REQ29-C102 — Qualify report operation, migration and recovery

**Story US29-C102:** As the operator, I want bounded handling and safe restore, so that a useful report cannot be orphaned or made public by rollout.

**Decision basis:** Q57-C16–C18; REQ29-P03/P13–P18.

- **AC29-C102-01:** Finite plain-text payload/Unicode/rate/page/history/concurrency/retry/query/latency/retention budgets and deterministic unique paging are measured/enforced. Lists do not load all bodies/history; no attachments/vector index/per-keystroke writes/per-resource polling or required Realtime.
- **AC29-C102-02:** Current capability/handling route/read models/grants precede exposed reporting. No backfill from comments/reactions/Support without proved semantics. Missing reporting setup does not withdraw lawful resources.
- **AC29-C102-03:** Stop unsafe paths while preserving independently lawful receipts/handling/privacy repair/cleanup. Mixed writers and restore retain redactions, states, current restrictions and original-operation fences; no rollback to raw-body exposure.
- **AC29-C102-04:** Preserve applicable Phase28 C49 source target-read monitoring, including server p95 greater than one second for fifteen minutes at approved tested workload; this is not a universal report SLA or measured result. Actual role/alternate-door/race/fault/retention/restore/browser/AT/user/workload proof qualifies activation; no measured demand/cost/latency is presumed.

## REQ29-C103 — Read suitable organization resources as staff or missionary

**Story US29-C103:** As a qualified reader, I want Resources in my current workspace context, so that I can use applicable guidance without curator or unrelated Support privileges.

**Decision basis:** Q58-C01–C04/C12; REQ29-P01/P02/P04.

P28's Organization-managed resource library admits independently qualified Staff and Missionaries within one source organization/Tenant/environment. Preserve Support D27-C authored Staff guides and ticket-free Support-read consultation as a separate owner; do not copy/migrate its text or infer a universal knowledgebase.

- **AC29-C103-01:** Staff Resources uses existing Mission Control; missionary reading remains. Neither management access, Support-read, missionary profile nor fabricated Party/account is required for actual qualified staff reading.
- **AC29-C103-02:** Family labels are closed product choices, not roles, directory, custom segments or all-hats authority. Each read applies current source/P12/classification/rights restrictions; dual-context users receive only current context and one occurrence per result.
- **AC29-C103-03:** Show permitted description/language/format/known size, Open/Download, review information and actual successor guidance. Distinguish empty/filter-empty/failure/unknown-context/unavailable links, preserving safe navigation without full-file prefetch, read receipt/completion/subscription/task.

## REQ29-C104 — Publish one coherent edition to an explicit audience set

**Story US29-C104:** As a curator, I want to select suitable reader families deliberately, so that common guidance needs only one coherent publication.

**Decision basis:** Q58-C02–C06; REQ29-P02/P03/P06/P11.

One publication has one exact admitted content/reference, language/meaning, lifecycle/review plan and qualified successor meaning. Qualified accessibility renditions may express that same meaning; hidden audience-specific body/file/release variants are not selected.

- **AC29-C104-01:** Draft may have no audience; Publish requires at least one admissible declared family. Use a concise Staff/Missionaries group with explicit source-intent selection, never silent Both or rollout widening. Zero eligible members of a declared family does not mean empty declared set or require enumerating/counting members.
- **AC29-C104-02:** Current/proposed audiences and additions/removals are reviewable before deliberate Publish/Save audience changes. Selection/draft save is inert; no routine second modal, essay, moderator or directory. Actual safety/rights/static projection-policy approval remains distinct.
- **AC29-C104-03:** Ordinary mutation requires authority/visibility over complete affected scope, including retained/added/removed families. A partial client set cannot erase hidden scope. Current maintainer/scoped administrator takeover is capable, not original-author-only.
- **AC29-C104-04:** Source commit rechecks exact content/purpose/rights/audience/revision, atomically persists history/result and required continuation, and orders actual custody references against disposal. A retained row/FK alone does not prove a copy safely referenceable.

## REQ29-C105 — Change audiences, replace or withdraw with truthful recovery

**Story US29-C105:** As a curator, I want clear shared consequences and independent urgent withdrawal, so that audience mistakes can be repaired without saving unrelated draft work.

**Decision basis:** Q58-C06–C08/C14–C15; REQ29-P04/P05/P08/P10/P16.

- **AC29-C105-01:** Clearing the last declared family leaves publication unchanged and offers explicit whole-publication Withdraw. Withdraw validates its own current basis independently of unrelated invalid/unsaved fields, preserving draft safely. Cancel does not publish.
- **AC29-C105-02:** Shared replacement changes current edition for all still-authorized audiences. Failed/unknown replacement exposes no unreviewed alternate; old publication remains only while independently eligible. New family admission is prospective, with no historical-byte/readership grant.
- **AC29-C105-03:** Remove family fences its discovery/retrieval; whole Withdraw fences every audience through actual current serving contracts, without recalling delivered copies or deleting independent uses. Urgent qualified source protection need not wait for full-scope editor/successor readiness; narrowing alone grants no power.
- **AC29-C105-04:** Fresh audience correction/re-add/reoffer preserves history and current restrictions, never replay/restore/checkbox grant revival. Reuse lawful retained content without forced upload while preserving newer saved/unsaved work; unknown originals are reconciled before new action.
- **AC29-C105-05:** Same current canonical audience/content metadata is a no-op, not revision/history/review reset; relevant ABA conflicts. All ordinary and privileged doors enforce the complete scoped set and source lifecycle, including nonempty published audience.

## REQ29-C106 — Prepare a separate publication when needs diverge

**Story US29-C106:** As a curator, I want independent editions when audience needs differ, so that language, rights or review timing need not be forced into one publication.

**Decision basis:** Q58-C03/C09; REQ29-P01/P05/P08/P10/P16.

- **AC29-C106-01:** Existing preparation and qualified exact-file/reference reuse create an independent identity, audience and metadata when wording/language/rights/review/release meaning diverges. Read/download permission alone is not reuse; qualified reuse need not download/reupload bytes.
- **AC29-C106-02:** Copy only permitted proposed fields/content, not approval/reviews/reports/grants/delivery/history/private context. The new publication has its own explicit valid review plan/known-none, not unnoticed copied overdue date.
- **AC29-C106-03:** Incomplete/canceled preparation leaves old publication unchanged. Publish new then deliberately narrow/withdraw old with separate outcome recovery; no atomic/gapless claim, timeout auto-narrow, synchronization or audience redirect/history move. Urgent old restriction remains independent.
- **AC29-C106-04:** Same bytes/title does not grant new publication access through old links/guides/successor hints. Original operation replay cannot overwrite newer draft/publication work.

## REQ29-C107 — Apply review information and report purposes to staff readers

**Story US29-C107:** As a staff resource reader or curator, I want the same qualified maintenance journeys, so that shared availability does not imply shared private reports or obsolete review coverage.

**Decision basis:** Q58-C10–C11; REQ29-C80–C102; REQ29-P04/P08/P09.

- **AC29-C107-01:** Explicitly adopt compatible Q55 and Q57 staff-reader actions under actual purpose rights. Resource read/rank/family membership does not grant reporting, other reports, handling or historical bytes. Staff/missionary reports retain distinct actors/context and never move to a new edition.
- **AC29-C107-02:** Reevaluate review applicability against content/audience/purpose changes, preserving history. Complete no-applicable-proof says No applicable review recorded; unknown is distinct, never a claim nobody reviewed it. Old review cannot cover newly added scope merely because bytes match.
- **AC29-C107-03:** Existing valid plan, including now-due target, may remain if source basis is valid. Audience Save/Publish creates no review/time reset/Review due event or forced declaration. Real Record review requires deliberate exact-basis intent; new plans use today/future/permitted none and existing original recovery remains.
- **AC29-C107-04:** Q57 own report-purpose return/maintenance can survive library restriction where independently lawful; audience removal does not automatically erase/handle reports or restore old resource access. No public feedback, new notification or workflow is added.

## REQ29-C108 — Preserve shared-publication authority and privacy everywhere

**Story US29-C108:** As the source operator, I want shared readership to use one current authority boundary, so that neither audience editing nor alternate data routes expose hidden content.

**Decision basis:** Q58-C12–C15; REQ29-P02–P08/P16.

- **AC29-C108-01:** Verified source-appropriate context and actual assignment where applicable, static field classification/subtract-only projection and one P12 PDP govern every action. Audience choice cannot lower internal/care/security floors or authorize another hat; no per-value/local policy engine.
- **AC29-C108-02:** Non-null scoped identities/content, family set validity, immutable attribution/history, relevant revision and semantic-operation uniqueness hold through real keys/constraints/commands and all effective grants/RLS/functions/views/triggers/service/import/restore doors. Raw tables cannot bypass fine-grained scope.
- **AC29-C108-03:** Current permission precedes drafts/results/history/counts/search/cursors/successors/bytes. Hidden editions/membership do not leak via disabled cards or cache; no Support/body-index widening, private telemetry or unqualified device persistence.
- **AC29-C108-04:** Physical disposition requires actual authority/retention and complete references/holds/unsettled writers/processors; unknown/delete-claimed copies cannot admit new reference. Independent use does not evade byte-wide safety; restored data gets latest restrictions before serving.

## REQ29-C109 — Qualify shared publication without a second knowledge platform

**Story US29-C109:** As the operator, I want compatible bounded rollout and capable stewardship, so that staff reading adds no hidden migration or broken recovery.

**Decision basis:** Q58-C16–C18; REQ29-P11/P13–P18.

- **AC29-C109-01:** Existing base-maia shells provide explicit controls, safe drafts/results/focus, keyboard/AT/touch/reflow/zoom/RTL/IME/weak-network completion; no autosubmit/offline queue/forced preview/new editor/settings matrix.
- **AC29-C109-02:** Finite indexed set-wise source queries with stable unique pagination return each publication once without member enumeration/file fetch. Preserve exact R6/C49; actual payload/rate/query/lock/retry/history/workload budgets are measured, not invented O(1)/zero-bill promises.
- **AC29-C109-03:** Census identities/classification/writers first; missionary-only stays so until deliberate change, unknown legacy never becomes Staff/Both. Compatible old writers cannot drop audiences; stopped shared/staff admission preserves independently safe reads/committed recovery/report handling/privacy cleanup.
- **AC29-C109-04:** Actual serving/role/constraint/concurrency/unknown/restore/retention/browser/AT/intended-user/workload proof and capable operators precede activation. No whole permission-builder/provider or Support ownership replacement is a prerequisite.

## REQ29-C110 — Save a private resource reference for later

**Story US29-C110:** As a qualified staff or missionary reader, I want a personal saved reference, so that I can return across visits without copying a resource or creating a reading obligation.

**Decision basis:** Q59-C01–C05; REQ29-P01/P02/P04.

One active relationship belongs to a stable qualified human/principal × exact Tenant/environment/source organization × publication identity. P28 owns this narrow personal-maintenance purpose; current resource reading remains independently authorized. The complete ordinary browse/search/Open/Download journey never requires saving.

- **AC29-C110-01:** Current staff/missionary contexts can reflect the same private preference, but each call uses exactly its current qualified context, not a union. No Party/account creation or email/account-merge transfer is inferred.
- **AC29-C110-02:** Save may use an eligible summary without preview/download. Store a source reference, not content/title/path/digest/URL. Return resolves that publication's currently admitted head only; separate edition/successor remains another identity and cannot silently inherit the save.
- **AC29-C110-03:** Ordinary named Save for later changes to Remove from saved after confirmation, with consistent ordinary button semantics and distinct Open/Download. No dialog/reason/folder/tag/approval/new settings, subscription, task/read receipt, offline copy or custody hold.
- **AC29-C110-04:** Saved for later sorts newest actual unsaved→saved transition first with stable opaque tie-breaker. Same-state Save/content update preserves saved date/order. Empty state offers Browse resources; Save does not navigate/steal focus, and Remove restores sensible list/empty focus.

## REQ29-C111 — Maintain saved references without leaking unavailable resources

**Story US29-C111:** As a reader, I want to remove my own unavailable reference safely, so that resource access loss neither exposes old details nor traps my preference.

**Decision basis:** Q59-C03/C06–C07/C13; REQ29-P04/P08/P10.

- **AC29-C111-01:** Independent current own-entry purpose may reveal only opaque handle, own saved timestamp/state and maintenance actions. No denied publication ID/title/filename/thumbnail/URL/audience/reason. Counts, if offered, count permitted personal relationships, not hidden publications.
- **AC29-C111-02:** Known current resource denial/withdrawal yields Unavailable resource with own Remove. Incomplete evaluation yields Could not check this saved resource and Retry; Remove remains if its independent authority is known. Neither case deletes the preference or treats uniform not-found as disposal.
- **AC29-C111-03:** Unknown/denied own-purpose or list failure yields no rows/counts/placeholders and actual safe recovery. Forged opaque handles cannot authorize another owner's entry. Remove requires no forbidden resource disclosure.
- **AC29-C111-04:** Withdrawal/logout/context change alone preserves preference; same publication may reappear only with retained Save and newly qualified current access. Remove remains removed through republish/access restoration/retry/backup. Accidental Remove uses fresh current Save, not historical restore.

## REQ29-C112 — Order explicit Save and Remove intentions

**Story US29-C112:** As a reader with overlapping or uncertain requests, I want my latest admitted choice preserved, so that a delayed response cannot reverse it.

**Decision basis:** Q59-C08–C10; REQ29-P05/P06/P10.

- **AC29-C112-01:** Commands express desired Save/Remove and exact control basis, not blind toggle. One authoritative boundary orders the owner/scope/publication relationship; stale conflicting fresh commands refresh and require deliberate current intent.
- **AC29-C112-02:** A new authorized same-state command fences earlier opposite intent when needed: absent→Remove→late Save cannot recreate, saved→Save→late Remove cannot clear. This control ordering does not change saved time/recency or fabricate a content event; matching original replay does not advance it.
- **AC29-C112-03:** No-record Remove fence requires genuine server-bound own control/pending intent or exact currently eligible personal target and complete scoped absence proof. Unknown/denied lookup cannot allocate arbitrary hidden-target control rows.
- **AC29-C112-04:** Coherently commit effect/control/result/required audit. Original recovery under current receipt disclosure precedes new eligibility/rate/no-op; changed immutable intent conflicts. Lost reply remains unknown, not duplicate Save/offline queue; late session/revision results cannot overwrite current UI.
- **AC29-C112-05:** Current new Save loses eligibility when source revokes; independent own Remove need not read the resource. Unrelated metadata alone is not conflict. ABA/cleanup retain minimal lawful control/result-or-reject evidence so forgotten old intent never becomes fresh.

## REQ29-C113 — Protect personal preferences through native boundaries and cleanup

**Story US29-C113:** As the source operator, I want preferences to remain private without retaining resource bytes, so that personal convenience does not create another access or retention system.

**Decision basis:** Q59-C10–C13/C16; REQ29-P02–P04/P08/P16.

- **AC29-C113-01:** Trusted scoped owner/target, unique active relationship, valid control/times and immutable binding hold through actual database constraints/commands and all grants/RLS/functions/views/trigger/service/collection/restore doors. Raw coarse-Tenant tables cannot expose other people's preferences.
- **AC29-C113-02:** Native current context and shared cookie-command origin/CSRF integrity apply. GET/render/prefetch/hover/search/open never Save/Remove; JWT/auth.uid/email/role alone is not current purpose. Pooled context resets and no second per-user SQL policy engine is added.
- **AC29-C113-03:** Preferences are not ordinary curator/coach/manager analytics. Store minimum reference/control/audit, no copied protected titles/body/URLs or unqualified persistent lists. Separately scoped privacy/security/records access remains attributed.
- **AC29-C113-04:** Save retains no bytes/hold. Actual finite classification-owned preference/control/audit/backup schedules and disposition-ordered reference cleanup qualify before activation; no automatic deletion on denial, arbitrary reminder expiry or physically-deleted-parent prerequisite. Restore fences old ownership/removed intent/disposed data.

## REQ29-C114 — Complete accessible Saved journeys under weak networks

**Story US29-C114:** As a reader using assistive technology or a narrow connection, I want responsive but truthful saved-state feedback, so that local UI never masquerades as a durable result.

**Decision basis:** Q59-C05/C09/C14–C15; REQ29-P10/P11/P13.

- **AC29-C114-01:** Pending feedback distinguishes checking/known success/failure, offers Retry and preserves useful page/choice. No durable Saved/Removed from local state alone, hidden offline mutation, forced modal/toast focus or body fetch for preference work.
- **AC29-C114-02:** Actual shared components qualify names/non-color state/errors/announcements, keyboard/touch/AT, visible focus, reflow/text/zoom, RTL/Unicode and localized dates; no new input or zone editor. Safe query/list position returns with current reauthorization.
- **AC29-C114-03:** Bounded indexed personal reads and batched decoration use stable unique continuation/set-wise current projection. No whole-library filtering, per-card body/auth fanout, unbounded profile JSON, permanent polling or P23 favorite cap. Partial/error never appears complete-empty.

## REQ29-C115 — Qualify saved-reference rollout and accountable recovery

**Story US29-C115:** As the operator, I want finite safe preference operation, so that legacy guesses and rollback cannot recreate removed choices.

**Decision basis:** Q59-C15–C18; REQ29-P13–P18.

- **AC29-C115-01:** Declare/measurably enforce workload/query/page/record/control-retention/rate/recovery/memory limits, preserving exact R6/C49. No invented save cap or cost claim; safe over-limit outcomes and original recovery remain.
- **AC29-C115-02:** Qualified own-purpose/identity/projection and durable Save/list/Remove/return precede enablement. Start without inferred saves from visits/local state/subscriptions/curator guesses. Fence old blind-toggle/reparent/replay writers; stopped new saves preserve safe removal/recovery and Resources.
- **AC29-C115-03:** Native all-door tests, opposite/no-op/ABA/lost-response races, cleanup/disposal/restore/mixed-version tests and actual mobile/AT/intended-reader/workload evidence qualify activation. Routine removal/repair needs no developer/database intervention.
- **AC29-C115-04:** Separate minimum authoritative preference/control evidence from technical/security/publication history. Named source/security/database/privacy operators monitor safe signals, not content/preference lists; monitoring never substitutes for privacy/correctness proof.

## REQ29-C116 — Correct a substantively mistaken acceptance

**Story US29-C116:** As a currently authorized reviewer, I want to correct one mistaken applicable acceptance while a request remains eligible, so that staff can review retained evidence again without falsifying its receipt.

**Decision basis:** Q60-C01–C03; REQ29-P01/P02/P06/P08.

Target one exact Q21 acceptance occurrence and complete item/requirement/purpose/evidence/review basis, not an arbitrary file/digest or whole Q52 batch. Correction authority is distinct from read, assignment, original reviewer, Accept and rank. Harmless factual edits, changed requirements/new evidence/safety/viewer failure retain their own meanings.

- **AC29-C116-01:** Prove current applicable acceptance, unfinished eligible source and relevant complete facts at admission. Failed query/filtered badge/pending preview is not proof; sufficient metadata can permit action without forced preview/download, but required unknown facts block it.
- **AC29-C116-02:** Coherently append actual actor/time/basis correction, end only that acceptance's applicability, preserve original acceptance/receipt/members and unrelated items, establish correction-based Needs staff review, history/result and Q22 progression/follow-through.
- **AC29-C116-03:** No new submission, automatic Request changes, waiver/deletion/recipient obligation or F occurs. Required item without applicable acceptance cannot satisfy demand; source-certified optional/nonblocking work does not hold F open solely for review.

## REQ29-C117 — Resume actual staff review and truthful recipient guidance

**Story US29-C117:** As staff or recipient, I want clear current work after correction, so that staff mistakes do not demand needless upload or revive obsolete instructions.

**Decision basis:** Q60-C04–C06; REQ29-P04/P09–P11.

- **AC29-C117-01:** Reconcile actual P9/source review work and current Q24 responsibility/capable fallback for the new basis, without fake receipt, generic task revival or duplicate obligations. Technical prerequisites may block actionable work with a real owner repair path.
- **AC29-C117-02:** Reevaluate Q23 guidance/resolutions against correction: no automatic old recipient instructions or resolution surviving solely on invalidated acceptance; independent valid resolutions/history remain. New fresh review may accept retained sufficient evidence without new bytes.
- **AC29-C117-03:** Contextual Correct acceptance shows exact decision/basis/permitted original actor/time/consequence before one deliberate command. Trusted reviewed context or brief necessary note supplies intelligible cause; no duplicate essay, reverse-toggle, routine second approver/modal or forced dwell.
- **AC29-C117-04:** Show Acceptance corrected. This item needs staff review only when true, with Continue review. Eligible recipient wording may say staff are reviewing again/no action needed; later genuine Request changes supplies its own guidance. No internal rationale/directory leak, blame or false overdue/new-upload CTA.
- **AC29-C117-05:** Staff authority after recipient expiry does not renew access. Completed views retain original end/scope plus permitted truthful reliance; canceled stays canceled with qualified help, not new history/error access. Business insufficiency alone does not revoke lawful bytes; independent safety does.

## REQ29-C118 — Repair mistakes in correction without resurrecting old facts

**Story US29-C118:** As a qualified reviewer or operator, I want a precise repair for a mistaken correction, so that error recovery cannot erase history or restore an obsolete approval.

**Decision basis:** Q60-C05/C07/C09; REQ29-P05/P08/P10/P14.

- **AC29-C118-01:** Mistaken unfinished correction is repaired by fresh Q21 assessment/acceptance of current retained evidence, preserving old acceptance/correction. Equal bytes do not prohibit a genuine later decision; replay/delete/rollback cannot reactivate the old one.
- **AC29-C118-02:** An erroneous terminal error/reliance finding has explicit attributed finding-correction against exact current facts. Remove only its own blocker when actually supported, preserving independent safety/requirements/downstream restrictions, F/access/history and closed intake.
- **AC29-C118-03:** Unknown validity keeps unresolved/restricted reliance with actual corrective work. Harmless factual/privacy note repair requires no new collection or substantive invalidation. Permitted finding correction is independent of unrelated invalid drafts.
- **AC29-C118-04:** Correcting away a need re-proves draft issuance need and fences further collection/communication dependent solely on it while capable child owner reconciles; no silent draft deletion, child cancel/waiver or new cancellation power. Independently justified child work remains.

## REQ29-C119 — Record terminal acceptance error and affected reliance

**Story US29-C119:** As a source-authorized operator, I want to stop wrong reliance after closure, so that immutable fulfillment is preserved without leaving an error operationally valid.

**Decision basis:** Q60-C08/C14; REQ29-P01/P04/P08/P10/P14.

- **AC29-C119-01:** Record acceptance error/current-reliance disposition links exact acceptance/error, preserving F/terminal occurrence and access clocks. Do not manufacture Needs review inside closed work or reverse an enclosing application/payment/posted fact.
- **AC29-C119-02:** Frozen unfinished cases use adverse-only finding only when owning policy expressly permits; preserve freeze, never infer override/terminal status. Otherwise actual qualified containment must be capable before cohort activation.
- **AC29-C119-03:** Bounded registered affected reliance/consumer responsibility has durable handoff and truthful pending/resolved outcomes; current applicability prevents inappropriate new reliance. Other owners decide their corrections, with no global rollback/byte recall or universal downstream disclosure.
- **AC29-C119-04:** Known-error recording and urgent safety/privacy restriction do not wait for replacement draft/external callback. Unresolved downstream effects remain visible to permitted owners; comment/Help alone does not complete remedy.

## REQ29-C120 — Prepare and issue only needed fresh corrective work

**Story US29-C120:** As authorized staff, I want guided same-recipient corrective work after closure, so that remaining needs can be collected without reopening the old request or copying its authority.

**Decision basis:** Q60-C09; REQ29-P02/P05/P06/P08/P10.

- **AC29-C120-01:** One resumable draft and at most one ever-issued result belong to exact admitted error-remedy intent, linked to original acceptance/error. Use Q25 current draft/issuance/recipient/access rules; this is distinct from Q49 different-person replacement.
- **AC29-C120-02:** Prepare only legitimate remaining needs from lawful editable definitions. No copied acceptance/statements/grants/private history or needless bytes. Retained evidence reuse requires actual current Q28/Q54 new source-use authority, preserving original provenance.
- **AC29-C120-03:** Preparation/error recording cannot issue automatically. Deliberate current review/issuance resolves real recipient context, not email/Party assumption. Concurrent/retried intent recovers existing draft/result, not another transport-key request.
- **AC29-C120-04:** Later genuinely different need requires new justification; unresolved remedy cannot be rekeyed. Corrected-away finding re-proves need before issuance; already-issued results retain history and actual Q33/Q34 reconciliation, with dependent-collection fence and no automatic cancellation.

## REQ29-C121 — Serialize correction with acceptance and fulfillment

**Story US29-C121:** As a reviewer recovering a race or lost response, I want one authoritative outcome, so that neither stale acceptance nor stale correction overwrites newer source truth.

**Decision basis:** Q60-C10/C12–C13; REQ29-P03/P05–P07/P10.

- **AC29-C121-01:** Source aggregate/fences order correction, reacceptance, requirements/evidence/guidance, authority, cancel and F. Include relevant Q30 and all five Q45 structural changes; no classifier or unrelated global invalidation.
- **AC29-C121-02:** Correction-first blocks stale Accept/F; terminal-first blocks unfinished correction. Losing command preserves safe intent and requires deliberate qualified terminal action, never silently converts to error/new request. Actual time is sampled after waits.
- **AC29-C121-03:** Commit applicability/history/original result/required continuation coherently. Exact semantic replay under current disclosure precedes fresh eligibility/no-op; different cause is not falsely attributed to the later caller. Genuine later finding on a new basis remains possible.
- **AC29-C121-04:** Q21/Q52 original replay remains historical success only; it cannot reinstate applicability/work/mail. Unknown commits reconcile, known success survives refresh failure, expired unverifiable intents reject. Native scoped keys/grants/RLS/triggers/functions/alternate doors preserve heads/history/one-issued remedy and forbid retarget/reparent/F overwrite.

## REQ29-C122 — Preserve exact communication and reminder boundaries

**Story US29-C122:** As staff or recipient, I want correction to create only justified work, so that reopening staff review cannot restart stopped messages or evade reminder limits.

**Decision basis:** Q60-C11; REQ29-C09–C13/C46–C53; REQ29-P09.

- **AC29-C122-01:** Correction/error/finding correction produces no new email/bell/subscription/Q27 correction cohort. Actual P9 review work remains. Later real Q23 Request changes may qualify Q26; genuinely new Q03 actionable evidence may qualify Q27, under exact contracts.
- **AC29-C122-02:** Q40 remains actual Q36 addition/Q37 material instruction only. Ended occurrences never revive from changed applicability; Q20/Q35 remain their own purposes. No fake receipt or broad re-review event.
- **AC29-C122-03:** Same-request correction preserves all Q48 settings/counts/stops/possible-send facts. Staff-review return is not recipient-work or timer reset; genuinely later recipient work follows existing anchors/spacing/caps without clearing Stop.
- **AC29-C122-04:** The new same-person Q60 corrective-request cohort has automatic reminders unavailable/Off: no default inheritance, Start/Resume, clone/unlink/rekey escape. Show Automatic reminders are not available for this corrective request. Independently qualified staff reminders and issuance notices remain, with existing contact/privacy/spacing/utility rules.

## REQ29-C123 — Protect current history and accessible corrective journeys

**Story US29-C123:** As a permitted user, I want clear correction status and safe next actions, so that privacy or access constraints do not produce misleading repair promises.

**Decision basis:** Q60-C14–C16; REQ29-P04/P08/P10/P11/P16.

- **AC29-C123-01:** Internal rationale, participant guidance, acceptance history/current work and byte access remain separately protected before labels/counts/errors/tasks/messages/exports/caches. Former visibility or audit identity grants no current access; lawful note/byte restriction does not falsify acceptance/F.
- **AC29-C123-02:** Preserve known success versus pending/unknown/conflict, safe input/reading/focus and current next action. Inert selection/blur/IME cannot Correct; focused deliberate Enter/Space/click remains usable. Qualify keyboard/speech/touch/AT, reflow/text/zoom, RTL/Unicode/date meaning and weak networks without forced downloads/offline acceptance.
- **AC29-C123-03:** Actual source finite retention covers decisions/drafts/results/audit/copies/backups, with stale-intent rejection, complete use/hold/processor disposition and late-write fences. Restore later corrections/restrictions/ended messages/access ends before serving; no blanket new hold or universal Undo.
- **AC29-C123-04:** Actual content inspection/alternative route still qualifies under Q21; accessible chrome alone is insufficient. Blocked cohorts need real source/privacy operator recovery, not recurring SQL/provider console or unqualified Help disclosure.

## REQ29-C124 — Qualify acceptance correction and its consumers

**Story US29-C124:** As the release operator, I want complete bounded correction proof, so that a polished repair action cannot leave stale reliance or hidden source effects.

**Decision basis:** Q60-C16–C18; REQ29-P13–P18.

- **AC29-C124-01:** Bounded indexed applicability/dependency/operation reads and uniquely ordered history paging with per-page permission replace full-history scans/per-file fanout/tenant-wide locks. Measure cardinality/processing, transaction/concurrency, replay, reads/cache, retention/restore and device profiles; preserve R6 without misapplying resource C49 as ordinary SLA.
- **AC29-C124-02:** Register exact source producers/consumers/repair/private projection before exposure; no acceptance/correction/F backfill from tasks/mail/missing rows. Fence mixed old writers/callbacks and preserve source truth through projection failure.
- **AC29-C124-03:** Actual all-door roles, both race orders, unknown/changed-intent/ABA, terminal/finding correction/repeated false-error repair, child handoff/reminder exclusion, disposition/restore, workload and intended-user/browser/AT tests qualify activation. Scoped stops preserve committed truth and independently safe recovery without reviving old acceptance.
- **AC29-C124-04:** Document Request Item Acceptance Correction remains distinct from Submission Correction/Request changes and any generic Undo platform. Named source/security/privacy/database/product operators own measurable signals and capable responses; proof, not monitoring alone, gates activation.
