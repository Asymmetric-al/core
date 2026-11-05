# Phase 29 Q05 — current files with a truthful, concise submission history

Reviewed 20 October 2026, Asia/Bangkok. **Disposition: Accept with required amendments.**

Conrad selected **A — Current files plus concise submission history**, asking for deeply researched UX/UI and a full adversarial review. Conrad ratified the corrected decision and all required amendments on 20 October 2026. Q01–Q04 remain ratified and unchanged. This is adopted grooming intent, not a formal PRD, implementation or release certification.

## Evidence and its limits

Local and live GitHub develop were reverified at `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. The review reconciles the Phase 29 brief and roadmap, accepted request/preview/correction/download decisions, P4/P12 identity and permission ownership, P6/P17 communication ownership, source-specific P18/P21/P26 history, Workflow/Mobilize participant projections, current schema/API/UI patterns and primary external guidance.

- [Owner and authorization review](phase29-q05-owner-adversarial.md).
- [Runtime, schema and bounded test evidence](phase29-q05-runtime-adversarial.md).
- [UX and current primary-source review](phase29-q05-ux-adversarial.md).
- [Original question and alternatives](phase29-q05-question.md), with [owner](phase29-q05-owner-research.md), [runtime](phase29-q05-runtime-research.md) and [comparative](phase29-q05-comparative-research.md) research.

**Current behavior:** the bounded census did not find a qualified ordinary recipient submission-history service. Reached Support staff UI filters private messages after fetching and can show an empty timeline after a failed load. Its data adapter drains successive pages, while its timeline merge does not establish durable submission identity or causal deduplication. Donor history scopes page/count reads to its donor and tenant but does not thereby provide native request authority or a shared snapshot. Existing user-switch cache cleanup is present. These are concrete reuse limits, not a claim that every staff route leaks or that Core has no cache cleanup.

**Fresh bounded verification:** three existing test files, 23 tests passed, Vitest 5.0.3, reported duration 1.97 seconds, in an isolated credential-free/network-disabled run. They cover mocked donor history, pure Support timeline merging and contribution viewer projection. They do not prove real RLS, the new request/history service, deployed caching, browser accessibility, privacy revocation or representative recipient usability. Earlier Q03/Q04 tests are not counted again.

**Evidence discipline:** repository intent, source implementation, executed test evidence, documented external behavior, inference and product judgment are different. No private rows/files, live permission policies, real recipient workflow or authenticated comparator account was exercised. The frequency of old-file requests and the resulting staff workload are unknown. Severity describes a failure's impact; likelihood below is prospective design exposure, not an observed incident rate.

## Adversarial check

### What could go wrong with this answer?

A minimal-looking history can expose a sensitive filename, incorrectly claim that a correction never arrived, hide the next required action, or leave old bytes accessible through an API after their buttons disappear. A restrictive interface can also send legitimate questions into an unowned support queue. These failures would undermine the clarity and trust A is supposed to provide.

### What hidden assumptions are we making?

Concise does not mean always collapsed. Current does not mean newest timestamp across the whole request, accepted, or safe to read. Earlier does not mean superseded: an older supporting member may remain current. A successful empty authorized projection, unavailable history and incomplete legacy coverage are different. Retaining an earlier submission neither authorizes its disclosure nor requires its permanent retention. Current request access does not automatically transfer another recipient's history.

### How does this affect the whole product?

The native request gets a small participant history projection over its authoritative received acts and correction relationships. Shared custody does not become the history's business owner. P12 stays the sole permission authority; P6/P17 retain communication semantics. Staff and specialist history remain source-owned. The donor, missionary and request-only surfaces use the same underlying meanings with their permitted projections, not an account-wide file archive.

### How does this affect the end-user experience?

Show current files, their truthful status and next actions first. Put a short readable submission history underneath. Use one secondary disclosure only when actual length warrants it; never hide current failures or required work inside it. Distinguish durable receipt from checks and acceptance. Keep old entries informational, provide an owned help route, preserve context during retries, and never ask someone to upload again merely because history failed to load.

### Does this follow modern best practices?

Yes as a bounded, explicit product choice, not a universal rule. Foundant separates request statuses and submitted-form access; Odyssey documents resubmission history; Submittable's Original/Current export terminology refers to completed-form versions in the described workflow. None of those guides establishes a universal right to every superseded original attachment. [Foundant](https://support.foundant.com/hc/en-us/articles/4479853059991-GLM-Applicant-Tutorial), [Odyssey](https://support.withodyssey.com/hc/en-us/articles/46054678987035-How-to-Edit-Application-from-the-Application-History), [Submittable](https://submittable.help/en/articles/5345124-why-do-i-see-two-download-options-for-a-submission).

Official design guidance warns against hiding essential information and recommends testing simpler content before adding accordions. Confirmation should explain what happened and the next step. Apply these principles through Core's existing design system, without importing another component library or an attestation workflow. [GOV.UK Accordion](https://design-system.service.gov.uk/components/accordion/), [Confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/).

### Does this fit Asym’s existing repo and product direction?

Yes, with an explicit new participant-history projection at the authorized specification stage. Q03 preserves received acts and exact correction lineage; Q04 deliberately reserved superseded-file access. The Phase 29 brief's useful version-history outcome is preserved for staff and qualified sources. A narrows this ordinary recipient experience; it does not impose a platform-wide history ban, erase evidence or rewrite official-document history.

### Should we adjust the recommendation?

Keep A, but make its minimum usefulness, authority boundary and recovery concrete. A short history should normally be visible; it must be trustworthy, permission-filtered and operationally supported. Old-file access must be denied through ordinary recipient service paths, not merely omitted from the screen. Broader self-service historical content remains the strongest alternative, especially for repeated same-name corrections, but is not silently reintroduced through a help button.

## Corrected decision to record

> In the ordinary native private-document request, show the recipient's currently authorized current files and their source-owned status/actions, followed by a concise source-authorized **Submission history** of durably received submissions and correction relationships for that item.
>
> Keep current work prominent. Show short history directly; use secondary disclosure or bounded paging when density warrants it. Current errors, required actions and confirmation of a committed correction must remain visible without opening older history.
>
> Superseded submissions are exact predecessors in a correction lineage, not every chronologically older file. Their permitted history entries are informational: this ordinary profile grants no historical preview, thumbnail, extracted content or original download. Preserve unrelated current members and independently qualified staff/specialist rights.
>
> History is a minimized participant projection of authoritative source facts, not a raw audit feed, client-created receipt or second source of truth. Current permission applies before metadata, ordering, counts, pagination and serialization. Preserve truthful distinctions among received, checking, source outcome, unavailable history and incomplete coverage.
>
> Provide an owned, source-approved help route for questions about earlier submissions. Help creates no automatic historical-byte permission, restore or delivery promise. Preserve required evidence, privacy/disposition rules, Q03 correction fences and Q04 current-file read behavior. The decision adds no general drive, retention period, post-closure duration, bulk export or restore command.

## The smallest complete UX

This is reviewed interaction intent, not a built screen or a successful usability test. Examples of copy are illustrative and must be localized and source-approved.

| Moment                           | Experience                                                                                                                                | Required meaning                                                                                                                                                            |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Return to the request            | Show the requested item, all still-current supporting files, current status and permitted View/Download/Send corrected file actions.      | A recent correction does not hide an unrelated older supporting file. Current is not a promise that checks or review passed.                                                |
| Correction commits               | Confirm **Correction received** and the next source-approved step in the current area.                                                    | Only the authoritative admission result establishes receipt. A transfer spinner, selected file or scan callback cannot create it.                                           |
| Read a short history             | Under **Submission history**, show readable received/corrected facts and their permitted dates, with clear current/earlier relationships. | No mandatory extra click for a small list; no decorative version graph. Earlier entries need not expose old filenames or actor names.                                       |
| Read a long history              | Offer a clear **Show earlier submissions** or equivalent bounded continuation using shared controls.                                      | The first view must not pretend to be complete. Current work stays outside the disclosure. Do not expose hidden counts, global sequence gaps or forbidden older members.    |
| Same filename appears again      | Preserve distinct source occurrences and useful permitted receipt context.                                                                | A repeated filename or digest is not a duplicate event or proof of the same received act. Do not invent public version numbers from a private/global counter.               |
| History fails to load            | Say **Submission history is temporarily unavailable** with a safe retry, while independently authorized current work remains usable.      | Never show **No submissions**, mark the request incomplete or ask for a re-upload solely because optional history failed.                                                   |
| Current state cannot be verified | Explain that current status is unavailable and withhold unsafe mutations/reads until revalidated.                                         | History cannot certify current acceptance or permission. Independent failure isolation does not permit stale privileged actions.                                            |
| Recipient needs earlier contents | Offer **Get help with this request**, reaching the source's permitted responder/process with a safe reference.                            | No automatic attachment, new archive workflow or per-file unlock. The responder can clarify the record; any content disclosure needs its own qualified authority.           |
| Permission changes               | Remove or suppress newly unauthorized facts/actions through the existing invalidation contract and reauthorize subsequent reads.          | Do not expose the reason for a restriction, prior recipient identity or old file through a stale page, count or response. Already displayed information cannot be recalled. |

### Content and interaction rules

Use **File received** and **Correction received** for those actual events. A generic **Completed**, **Approved**, **Verified** or **Rejected** label must not collapse custody, safety and business decisions. Current status can contain an already authorized source outcome; Q05 does not invent a universal review-status vocabulary or publish private staff reasoning.

A history row is ordinarily text, not a disabled download control or a file-shaped link that opens nothing. Avoid a row of disabled View/Download buttons on superseded entries. Explain the ordinary limitation once where useful, without claiming that earlier bytes were deleted. Do not rely on a hover tooltip for that explanation.

Prefer a simple semantic list with meaningful headings and readable dates; use an existing shared disclosure when warranted. Keep focus stable when current data refreshes or more events load. Announce a material newly received result once, without making the whole history a repeating live region. Native semantics and Core Base UI/base-maia are the starting point, not proof of accessibility. [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

Persist the authoritative event instant and source causal relationship. Present localized unambiguous dates with a clear timezone when relevant; relative labels alone are insufficient for repeated events. Do not infer a missionary's location from display timezone. Use **You** only when trusted actor/context evidence justifies it; a shared mailbox or recipient reassignment does not establish who performed an earlier act.

Long/Unicode/RTL names must remain usable and safe where permitted. Keyboard/speech/screen-reader/touch/zoom/reflow behavior needs actual verification. Keep mobile pages light: no old thumbnails, preview prefetch, all-history drain or mandatory desktop table. Relevant current instructions and support must remain reachable on a slow connection.

### A must remain useful without quietly becoming B

Metadata cannot reveal what a prior scan contained. If that is a recipient's question, A has a real limitation. Before enabling this profile, identify the source-owned responder and a working route for clarification. The responder uses only their own current evidence access and the approved participant projection. A permitted explanation is not permission to copy old content into a reply.

If an independently authorized records/evidence process permits a particular disclosure, it retains its own identity, current qualification and governed delivery. It does not become a new ordinary historical-file toggle. If no such authority exists, provide a truthful outcome and permitted next step without promising release. Do not make the user resend sensitive material or move it through a personal inbox merely to diagnose history.

The strongest alternative remains explicit recipient historical-byte access. It may better serve repeated content-comparison needs and is compatible with a bounded task. We retain A because the confirmed ordinary goal is current-work clarity and receipt/correction confidence; the prevalence of historical-content needs has not been established. Monitor actual unmet needs and reconsider that product choice through a new owner decision if evidence warrants it, rather than silently widening access in support tooling.

## Authority, data and lifecycle implications

| Fact                                                               | Authoritative owner                                          | What the participant history may do                                                                                                     |
| ------------------------------------------------------------------ | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Recipient designation, proof and current action scope              | Request source with compatible P4/P12 admission and sole PDP | Consume the exact current principal/request/item scope; never infer it from a mailbox, file uploader, role name or query parameter.     |
| Durable receipt and correction relation                            | Native request/source command                                | Project admitted facts and their source relationship; do not create receipt from browser state, a webhook attempt or a failed transfer. |
| Which members are current or eligible                              | Exact source lineage/review state under Q03                  | Show coherent current facts; history order cannot select the current file or restore an old candidate.                                  |
| Bytes, copies, renditions and physical disposition                 | Shared custody under each source obligation                  | Supply only allowed current content; retained old bytes do not grant ordinary historical reads.                                         |
| Review outcome, accepted evidence and specialized document meaning | Owning business domain                                       | Include only already permitted participant status; no inferred acceptance, legal meaning or financial mutation.                         |
| Technical/security access evidence                                 | Existing governed audit and egress owners                    | Record required reads/denials safely; do not expose the audit feed as Submission history.                                               |
| Help and communication                                             | Source coordinator/process plus existing P6/P17 boundaries   | Resolve permitted questions without new recipient membership, automatic old-file delivery or duplicate tasks/messages.                  |

**Durability and ordering.** After exact private-byte finalization and current source authorization, Q03 atomically admits the correction receipt, successor relationship, relevant review-set change and required history/effect intent; hygiene/preview checks may still be pending. Q05 projects that admitted fact. Projection delivery may be retried, but one durable source effect must not become several apparent submissions. Use stable source identities and deterministic causal ordering for tied/backdated display times. Do not prescribe a new event-sourcing framework or a global sequencer.

**Currentness and concurrency.** A correction committed before a new read makes the predecessor stale under Q04. History itself does not lock review, delay correction or authorize old bytes. An already admitted stream remains exact and follows Q04/P12 expiry and feasible termination rules. Current details and the visible correction relationship must be coherent with the relevant source state or explicitly refreshing/unknown; independent asynchronous query results must not fabricate a contradictory snapshot. Revalidate actions at their existing command/read boundaries.

**Database and RLS.** Required source references must enforce same tenant/request/item/occurrence scope and trustworthy actor attribution, with appropriate nullability and no fallback from unknown to global/public scope. Protect immutable received facts and correction relations from ordinary edits; governed corrections/disposition retain their source semantics. Reject self/cyclic/cross-scope lineage and client-controlled currentness, owner, acceptance, actor, timestamps or clearance. Preserve multi-file cardinality; do not impose one file per request.

Evaluate actual PK/FK/unique/check constraints, delete behavior, admitted-event identity and indexes against the chosen source contract. History projection alone does not need a new editable history table. If a materialized read model is justified, it is rebuildable, cannot grant authority and must retain identity/coverage. Do not cascade away held facts or fabricate missing legacy lineage. This choice adds no money value or financial computation; existing exact money semantics remain with finance.

Test effective grants, roles, `USING` and new-row `WITH CHECK` behavior on supporting mutations, policy composition, views/functions, RPCs, service-role paths and direct storage/read endpoints. RLS controls rows; it does not by itself define the safe columns in a participant response. Omitted `WITH CHECK` can inherit `USING`; a function's effective role/ownership/FORCE/BYPASSRLS behavior matters. Do not infer safety or vulnerability merely from SQL keywords. [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), [CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html).

**Bounded retrieval.** Apply source permission and the safe projection before returned ordering, counts, continuation and serialization. Stable bounded pagination must handle new corrections and permission changes without duplicate or skipped authorized facts or leaking hidden totals. A client-side filter after fetching private rows is insufficient. Large histories need declared finite page/response/query budgets and representative indexed query plans; no universal page size, retention period or latency guarantee is selected here.

**Privacy and failure isolation.** Include principal/tenant/request/item and relevant authority in cache isolation; reject late responses from an old context, reuse existing sign-out/switch cleanup and qualify revocation behavior. No private local/offline archive, unrestricted search/OCR snippets, hidden file URLs or analytics payloads. A successful empty permitted projection is different from denial, failure and known incomplete coverage; safe wording must not disclose hidden facts. Failure of optional history cannot erase separately valid current state, but loss of current authority must fail closed.

## Exact required amendments

These identifiers are review traceability, not published specification or issue IDs.

| ID                                          | Exact reviewed rule                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q05-C01 Ordinary scope                      | Show currently authorized current members plus a concise participant Submission history for the exact request item. Superseded content gets no ordinary history read grant. Preserve independent current members and specialist/staff history rights.                                                                                                                                                       |
| Q05-C02 Exact lineage and currentness       | Derive earlier/current relationships from the source's admitted correction lineage, never filename, digest, timestamps or a universal latest pointer. Preserve Q03's predecessor fence and no silent revival; viewing history cannot mutate candidacy.                                                                                                                                                      |
| Q05-C03 Source truth and attribution        | Derive history from durable admitted source facts and trusted actor/context, preserving the meaning of the admitted request/item revision. A later label/instruction change cannot reinterpret the earlier act. No client-created receipt, raw audit feed or separate write authority. Distinguish source business history, participant projection, technical trace and security access evidence.           |
| Q05-C04 Durable effect and causal order     | Preserve Q03's atomic source admission/state/history invariant. Projection retry/replay yields one visible fact per admitted source effect. Deterministic causal identity/order survives tied times, delayed events and replay; do not fabricate chronology from arrival order.                                                                                                                             |
| Q05-C05 Minimal participant metadata        | Release only current source-approved event wording, dates, actor/context and file descriptors. Filenames, counts, IDs, reasons and event existence are protected. Do not expose staff assessments, hidden requirements, audit payloads, old thumbnails, extracted text or provider references.                                                                                                              |
| Q05-C06 Authorization before results        | Resolve trusted principal/tenant/request/item/purpose authority and filter safely before returned ordering, counts, facets, continuation and serialization. Do not union staff/audit privileges into the participant purpose. A mailbox match, uploader identity, current request membership or a browser-side filter cannot grant all historical metadata.                                                 |
| Q05-C07 Enforce A beyond the screen         | Deny ordinary recipient access to superseded content through APIs, preview/thumbnail/OCR/search/export paths, original/HEAD/range/conditional routes and stale URLs. Do not serialize old content references and merely hide controls. Preserve independently authorized source paths.                                                                                                                      |
| Q05-C08 Coherent current work               | Current files, status, actions and correction relationships reflect compatible relevant source state or explicit refreshing/unknown state. History never drives currentness. Revalidate privileged reads/mutations; preserve independent members, focus and the exact result of a committed correction.                                                                                                     |
| Q05-C09 Honest failure and coverage         | Distinguish successful permitted empty history from unavailable, unauthorized, refreshing and known incomplete coverage. History failure cannot become No submissions, erase receipt, trigger re-upload or disable independently valid current work. Unknown current authority still fails closed.                                                                                                          |
| Q05-C10 Data and privileged-path integrity  | Enforce required same-scope references, immutable admitted facts, trusted actor/time fields, valid lineage and semantic effect uniqueness. Prove actual grants/RLS/new-row checks/views/functions/RPC/storage/privileged paths; no client write or reassignment can turn a permitted row into forbidden history.                                                                                            |
| Q05-C11 Truthful time and actor             | Separate authoritative received/correction time from processing/display/import times; retain causal identity under ties. Localize readable dates/timezones without inferring location. Attribute You or a named actor only when current source projection and trusted evidence permit it.                                                                                                                   |
| Q05-C12 Small current-first UI              | Keep current status, confirmation, errors and next actions visible. Present short history as a readable list; use one clear secondary disclosure or bounded continuation only when useful. No full file explorer, mandatory extra modal, nested timeline system or disabled old-file button wall.                                                                                                           |
| Q05-C13 Accessibility and field usability   | Reuse Core Base UI/base-maia, semantic lists/headings and existing tokens. Prove keyboard/speech/AT/touch/zoom/reflow/RTL/long-name behavior and focus stability. Announce material changes without repeatedly reading the whole history; keep low-bandwidth current work usable.                                                                                                                           |
| Q05-C14 Read lifecycle and side effects     | Reauthorize history reads/retries/continuations and clear unauthorized stale state through inherited contracts. Reading creates no new submission, acceptance, reminder, message, task, read receipt, session extension or historical-byte grant. Existing required access audit/metering still applies.                                                                                                    |
| Q05-C15 Owned help without implicit B       | Before activation provide a working source-approved responder/route for earlier-submission questions. Clarification and any exceptional disclosure use independent current authority; no automatic old-file delivery, restore, new unlock toggle or guaranteed release. Give a truthful outcome when disclosure is not authorized.                                                                          |
| Q05-C16 Retention and specialized ownership | Participant omission neither deletes source history nor extends its retention. Preserve holds, lawful owner disposition, privacy suppression and official/source-specific historical rights. Restores apply current adverse history before serving. No access-duration or permanent archive promise.                                                                                                        |
| Q05-C17 Finite retrieval and capacity       | Use bounded permission-safe queries/continuation and appropriate source-scope/order indexes. Declare and test finite page, response, query and concurrency budgets before activation. No all-history drain, unbounded client filtering, hidden-total leakage or needless binary/preview work.                                                                                                               |
| Q05-C18 Cache, telemetry and audit          | Scope caches/late responses to current principal and source context; qualify switch/logout/revocation/restore paths. Private history must not enter public caches, offline stores or general logs; URLs may contain only approved opaque references, not sensitive descriptors or reusable authority. Apply inherited access-evidence rules without exposing the audit feed or fabricating business events. |
| Q05-C19 Migration and containment           | Reconcile source identities, coverage and old readers before cohort activation. Unknown legacy lineage stays explicit, not guessed from name/time/hash. Test mixed versions, alternate routes, safe disable/roll-forward and restore; rollback cannot re-enable old-byte access or erase required history.                                                                                                  |
| Q05-C20 Proof and completion                | Qualify real-role metadata/content denial, source admission/races/replay, failure/coverage, actual browser/AT/mobile and owned help outcomes for every declared cohort. A decorative list, mocked suite or permanent unavailable placeholder is not completion. Trace this decision through later authorized owner/OpenSpec work.                                                                           |

## Category-by-category adversarial review

Each category states materiality, severity/likelihood, evidence, consequence, effect on A and exact correction. **High** means substantial confidentiality, source integrity or authorization impact; **Medium** means material usability, reliability or maintenance impact. Prospective likelihood is conditional and unmeasured unless a concrete current pattern is identified.

### 1. Problem validity, necessity and alternatives

**Material concern: yes — Medium / plausible.** A history can become an unnecessary audit browser, while an overly terse version cannot answer whether a correction arrived. B would better answer what an earlier file contained. Comparator guides support understandable histories but do not prove that old-byte access is universally needed. **Why it matters:** user confidence and support workload depend on the real task. **Effect:** retain A as a bounded product choice, not an asserted universal optimum. **Permanent fix/exact change:** C01/C12/C15/C20; expose durable receipt/correction facts and current work, provide owned help, and validate real tasks without claiming metadata equals content.

### 2. Brittleness

**Material concern: yes — High / plausible.** Sorting by timestamp or grouping by filename can misidentify predecessors after tied times, import or repeated same-name uploads. Currentness can drift between separate asynchronous reads. **Why it matters:** the recipient may act on the wrong file or believe the correction disappeared. Q03 uses exact lineage, not filename order. **Effect:** narrow the data contract. **Permanent fix/exact change:** C02/C04/C08/C11; stable source identities, causal relationships and coherent relevant-state projection; never silently relabel the newest row as current.

### 3. Technical debt

**Material concern: yes — High / likely if reached staff patterns are copied wholesale.** Support's post-fetch filtering, empty-on-failure presentation and all-page drain are not a safe recipient-history foundation. Template restore and PDF Version History placeholders mean different things. **Why it matters:** copying them embeds wrong authority, recovery and scaling assumptions. **Effect:** reuse primitives, not those semantics. **Permanent fix/exact change:** C03/C06/C09/C12/C17; a source-owned minimized read seam using existing shared UI and data boundaries, with no duplicate file-history store or new provider.

### 4. Edge cases

**Material concern: yes — High / plausible; frequency unknown.** Repeated identical names, multiple current supporting members, missing old descriptors, recipient changes, failed successor checks and same-instant corrections can produce confusing rows. **Why it matters:** a visually older file may still be valid, while a failed correction must not revive a predecessor. These cases follow Q03's actual cardinality and failure rules. **Effect:** keep A with explicit semantics. **Permanent fix/exact change:** C02/C05/C08/C09/C11/C16; exact-member history, safe omissions, truthful pending/failed states and no age-based currentness.

### 5. Footguns

**Material concern: yes — High / plausible.** A disabled View button can invite clicking a stale URL; an old filename rendered as a link can expose content; a retry can be mistaken for a second submission. Hidden current errors encourage unnecessary re-upload. **Why it matters:** the interface can accidentally undermine A or create bad user actions. **Effect:** change controls and enforcement together. **Permanent fix/exact change:** C04/C07/C09/C12/C14; informational old rows, server-enforced scope, durable receipt recovery and no automatic resubmission/download.

### 6. Tenant safety

**Material concern: yes — High / plausible.** A global uploader query, shared mailbox, byte deduplication, unscoped cache or hidden total can reveal another tenant, recipient or source's submission history. **Why it matters:** metadata can expose sensitive missionary/member-care associations even without bytes. Q01 and P12 require exact current source scope. **Effect:** narrow every projection boundary. **Permanent fix/exact change:** C05/C06/C10/C18; server-derived same-scope references, recipient continuity checks, authorization before pagination and no permission pooling across shared bytes.

### 7. Database, RLS and authorization safety

**Material concern: yes — High / plausible; live enforcement unverified.** A broadly readable audit table or privileged handler can expose hidden columns; a mutable relation/actor field can reassign allowed history to a forbidden source. **Why it matters:** row visibility alone does not enforce the participant projection. **Effect:** C06/C10 are mandatory qualification gates. **Permanent fix/exact change:** required scoped FKs/nullability, immutable source facts and trusted attribution, semantic uniqueness, governed delete behavior, actual old/new-row and composed-policy tests across roles/views/RPC/storage. Do not assume omitted WITH CHECK is automatically unsafe. No new money fields or arithmetic are introduced.

### 8. Overengineering

**Material concern: yes — Medium / plausible.** An event-sourcing rewrite, version graph, configurable history policy builder, per-file staff unlock or comparison editor would solve broader problems than A. Always-collapsed UI can also add needless interaction. **Why it matters:** more state and ceremony increase cost and friction. **Effect:** preserve the small scope. **Permanent fix/exact change:** C03/C12/C15/C17; project existing source facts, use a plain list and existing disclosure only where warranted, and reuse the existing help path. Do not prescribe a framework or provider.

### 9. UX/UI and user friction

**Material concern: yes — Medium–High / plausible.** Hidden history can conceal a receipt; visible old-file controls can suggest unavailable actions; an empty error state can prompt repeat uploads. Relative dates and identical names can confuse the record. Official disclosure/status guidance and reached code substantiate these concerns. **Effect:** require the complete current-first journey. **Permanent fix/exact change:** C08/C09/C11–C13/C15; short visible history, clear event language, meaningful dates, accessible continuation and owned recovery. Qualify actual device/AT/participant tasks rather than claim a component choice proves good UX.

### 10. Source of truth, ownership and domain invariants

**Material concern: yes — High / plausible.** A display feed might manufacture receipt, choose a current file, infer acceptance or become the authoritative audit record. **Why it matters:** that creates dual truth and historical drift. Q03's source admission and the workflow participant contract distinguish these facts. **Effect:** sharpen the domain model. **Permanent fix/exact change:** C02–C04/C08/C14/C16; source commands own received acts/currentness, history is a limited projection, and technical/security records remain separate. Display changes cannot mutate evidence or financial truth.

### 11. Hidden coupling

**Material concern: yes — High / plausible.** Requiring a complete timeline load before current-file access couples optional history availability to essential work; relying on the audit schema couples recipient wording to staff diagnostics. **Why it matters:** a background outage can block a valid request or expose internal changes. **Effect:** require a narrow interface and failure isolation. **Permanent fix/exact change:** C03/C08/C09/C15/C20; independently authorized current state remains available, history failure is explicit, and the existing source help path is separately qualified. Independence never allows stale authority.

### 12. Failure modes

**Material concern: yes — High / known unsuitable precedent.** Current timeline UI can show an empty state after load failure. For Q05 that could falsely imply nothing was received; a lost correction response or lagging projection could lead to duplicate effort. **Why it matters:** false absence changes user behavior and erodes trust. **Effect:** amend the result/state contract. **Permanent fix/exact change:** C04/C08/C09/C15; recover exact durable outcomes, distinguish empty/failure/incomplete, preserve valid current work and offer safe retry/help without resubmission or unsupported success.

### 13. Lifecycle, temporal correctness, concurrency and idempotency

**Material concern: yes — High / plausible.** Out-of-order callbacks, duplicate delivery and pagination during correction can duplicate or reorder facts, while a permission change can leave an old response visible. **Why it matters:** two individually valid reads can jointly present a false record. **Effect:** preserve source causal identity and current access. **Permanent fix/exact change:** C02/C04/C08/C11/C14/C18; semantic deduplication, deterministic scope/order, relevant-state coherence, late-response fencing and current command revalidation. History reads neither reset clocks nor revive prior candidates.

### 14. Data integrity risks

**Material concern: yes — High / plausible.** Copying source facts into independently editable history or reconstructing legacy lineage from filenames can fabricate who submitted what. Overbroad delete cascades can destroy retained evidence; display redaction can be confused with source deletion. **Why it matters:** correction and accountability become unreliable. **Effect:** constrain writes and reconciliation. **Permanent fix/exact change:** C03/C04/C10/C16/C19; immutable admitted facts, governed rectification/disposition, exact references and explicit unknown coverage. A read model may be rebuilt but never repair business truth by guessing.

### 15. Security and privacy risks

**Material concern: yes — High / plausible.** An old sensitive title, thumbnail, count, actor or raw URL can disclose material A intended to withhold. A help reply can reintroduce the same bytes through a less governed channel. **Why it matters:** absence of a Download button is not an access boundary. **Effect:** extend A to all representations and recovery. **Permanent fix/exact change:** C05–C07/C15/C18; minimized current projection, endpoint/storage denial, privacy-safe cache/log handling and independently authorized assistance. No promise of recalling information already displayed.

### 16. Scalability and performance risks

**Material concern: yes — Medium–High / workload unknown; unbounded precedent observed.** Draining every page or filtering a large feed in the browser increases latency and resource use; client filters can also leak hidden data. Reached Support code demonstrates that reuse risk. **Why it matters:** large tenants or many corrections degrade essential work. **Effect:** bound retrieval independently of current-file display. **Permanent fix/exact change:** C06/C09/C17; source-scoped indexed queries, stable bounded continuation, finite payload/query budgets and production-shaped tests. No invented universal count/latency limit or preview work for history.

### 17. Operational burden

**Material concern: yes — Medium / plausible; demand unmeasured.** A deliberately lacks old-content self-service, so unanswered old-file questions may create staff exchanges or ad hoc database/provider access. **Why it matters:** A could merely shift complexity to staff. **Effect:** retain the tradeoff explicitly and require owned recovery. **Permanent fix/exact change:** C15/C20; qualified responder/route, safe clarification and no automatic release promise. Track unresolved content needs; review the product scope if evidence warrants it instead of adding unofficial unlocks.

### 18. Observability and auditability gaps

**Material concern: yes — High / plausible.** A participant feed can be mistaken for full audit, while logs omit projection failures or record private content. A successful GET can be mistaken for reading or acknowledgement. **Why it matters:** diagnosis and durable business evidence diverge. **Effect:** separate evidence types and their access. **Permanent fix/exact change:** C03/C04/C09/C14/C18; protected source/effect references, safe stage/coverage/error signals, inherited access audit and no inferred read receipt, message, task or acceptance. Monitor missing/duplicate facts without logging their private descriptors.

### 19. Dependency and integration risks

**Material concern: yes — Medium–High / plausible.** Background delivery, realtime reconnect, cache libraries or provider retries can reorder or duplicate projections; a UI primitive cannot supply source authorization. **Why it matters:** infrastructure behavior must not define received history. **Effect:** keep integration replaceable and subordinate. **Permanent fix/exact change:** C03/C04/C08/C14/C18; source IDs/reconciliation and current gates, no new vendor, no dependency upgrade assumed, and version-specific qualification of actual adapters. Existing workflows may deliver notifications, but do not create the source receipt.

### 20. Migration, rollout and upgrade risks

**Material concern: yes — High / plausible.** A new metadata-only view can coexist with old accessible file URLs; guessed backfills or restored caches may re-expose old content. Mixed writers may omit durable history. **Why it matters:** a correct new screen cannot contain those paths. **Effect:** require source-cohort activation. **Permanent fix/exact change:** C07/C16/C18/C19; inventory readers/writers, reconcile exact coverage, contain legacy grants, test mixed versions and restore adverse history before delivery. Safe disable cannot delete history or fall back to broader access.

### 21. Testability, traceability and proof

**Material concern: yes — High / known proof gap.** Existing mocked staff/donor tests do not prove ordinary recipient history, current metadata filtering or accessible recovery. A polished list might mask absent source records/help. **Why it matters:** implementation could be declared complete without fulfilling A. **Effect:** require independently falsifiable outcomes. **Permanent fix/exact change:** C20 and P01–P24 below; trace the reviewed selection through the glossary/ADR and later authorized owner/OpenSpec/tasks, then real-role, concurrency, browser, migration and participant evidence. Keep grooming and release claims separate.

### 22. Other development hazards

**Material concern: no additional independent concern found.** Checked accidental expansion into a drive, office/version editor, acknowledgement system, legal-record certificate, universal retention rule, new messaging platform and automatic restore. The explicit scope and concerns above address those hazards. No new deployment, provider purchase, permission broadening or runtime completion is needed to record this reviewed choice.

## Required proof

These are future acceptance obligations, not tests passed by writing this review.

| ID      | Outcome to prove                                                                                                                                                                                                                                                                                                                   |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q05-P01 | An ordinary recipient can identify the currently relevant files, whether a correction was received and the next permitted action without browsing a file manager or older history.                                                                                                                                                 |
| Q05-P02 | Untouched older supporting members remain current and usable; only exact correction predecessors become earlier. Same filename/digest/time cannot merge or relabel source acts.                                                                                                                                                    |
| Q05-P03 | Receipt appears after authoritative admission of finalized bytes under current source authority, even while hygiene/preview checks remain pending. Failed/abandoned transfer and lost responses do not create false receipt or require unnecessary duplicate submission.                                                           |
| Q05-P04 | Duplicate/replayed/out-of-order projection delivery yields one source-correct history fact per business effect, preserving exact lineage under tied/backdated display times.                                                                                                                                                       |
| Q05-P05 | Current status/actions and displayed correction relationships are coherent or explicitly uncertain; an older read result cannot overwrite a newer relevant state.                                                                                                                                                                  |
| Q05-P06 | Wrong tenant/principal/recipient/request/item/purpose, reassignment, shared mailbox, merge and shared bytes cannot reveal another scope's history or grant earlier content. A person who also has staff/audit rights does not receive their union in the participant view.                                                         |
| Q05-P07 | Current permissions filter metadata before serialization/order/count/pagination; hidden fields, totals, cursor contents, sequence gaps and response differences cannot reveal forbidden events.                                                                                                                                    |
| Q05-P08 | Ordinary historical preview/thumbnail/OCR/snippet/original/HEAD/range/conditional/export routes and stale URLs deny superseded content; hiding a button alone cannot pass.                                                                                                                                                         |
| Q05-P09 | Existing independent staff/specialist evidence rights remain intact; a shared file's other permitted use neither inherits nor loses authority through Q05.                                                                                                                                                                         |
| Q05-P10 | Actual grants/RLS/USING/new-row checks/views/functions/RPC/storage/service paths prevent forged actor/scope/currentness and forbidden reassignment; same-scope references and source facts remain valid.                                                                                                                           |
| Q05-P11 | History failure is not empty history; known incomplete coverage is not complete. Current independent work stays usable only when its own authority and relevant state are valid.                                                                                                                                                   |
| Q05-P12 | A failed correction or checker outage preserves truthful received history without reviving its predecessor or manufacturing acceptance.                                                                                                                                                                                            |
| Q05-P13 | Timezone/localization/clock ties/import provenance and actor wording remain accurate; You is never inferred from mailbox or present recipient alone. Later request/item label or instruction changes cannot reinterpret the admitted historical act.                                                                               |
| Q05-P14 | Short histories are readable without unnecessary disclosure; long histories have clear bounded continuation while current status, errors and next actions stay visible.                                                                                                                                                            |
| Q05-P15 | Keyboard, speech, screen reader, touch, zoom/reflow, long/RTL names and focus remain usable in the full history/retry/current-file journey.                                                                                                                                                                                        |
| Q05-P16 | Status updates announce only material change, preserve reading focus, do not repeat the entire history and never infer Saved/Read/Accepted from access.                                                                                                                                                                            |
| Q05-P17 | The source-approved help path reaches its responsible responder with safe context and yields a truthful permitted outcome; it cannot automatically deliver old content or bypass independent evidence authority.                                                                                                                   |
| Q05-P18 | Source restriction, logout/account/tenant switch, stale responses and restored caches remove/reject unauthorized history through existing contracts; no cross-context or persistent private offline cache.                                                                                                                         |
| Q05-P19 | Maximum admitted page/response/query/concurrency budgets and one-unit excess behave safely. Under new corrections and permission changes, continuation preserves its declared coverage/current authorization without duplicate or silently skipped in-scope facts, hidden totals or an unsupported claim of complete live history. |
| Q05-P20 | Required access audit/metering is durable under its tier and privacy-safe; history reads create no duplicate receipt, notification, task, acknowledgement, acceptance or retention/session extension.                                                                                                                              |
| Q05-P21 | Omitted history and missing descriptors do not trigger deletion; holds/disposition/privacy suppression preserve owner obligations. Restore cannot resurrect denied visibility or old currentness.                                                                                                                                  |
| Q05-P22 | Legacy partial data, mixed writers/readers, old links, kill switch/roll-forward and recovery are reconciled for each source cohort; no fabricated backfill or public/broader fallback.                                                                                                                                             |
| Q05-P23 | Existing Q01 confirmation, Q02 preview, Q03 correction and Q04 exact current download behavior survive, including independent members and in-flight stream limits.                                                                                                                                                                 |
| Q05-P24 | Representative participant/staff tasks show people understand current versus earlier, received versus accepted, recovery and help. Resolve critical misunderstanding/dead ends; document sample limits and unmet historical-content needs without invented prevalence.                                                             |

## Quantitative discipline and synthesis

No new universal number of history entries, access duration, retention period, polling interval or latency promise is selected. The source profile must declare finite page/response/query/concurrency and recovery bounds before activation; tests must exercise the maximum, one-unit excess, many unrelated tenant records, concurrent changes and slow/interrupted connections. A total historical count is optional and cannot be used if it leaks protected records or cannot be made coherent.

**Resolved for ratification:** retain A with a useful visible short history, exact source identity, minimized current metadata authority, service-level denial of ordinary superseded bytes, truthful failure/coverage and owned help. These are product/authority choices, not unspecified implementation polish. B's content-comparison benefit remains real; A does not pretend to supply it.

**Capture in the later authorized owner/specification package:** the native participant-history projection and its exact source scope, Q01-compatible identity/PDP admission, source receipt/correction facts, current-read denial and coverage/recovery contract. Preserve the single permission owner and specialized histories. Do not publish a new PRD/OpenSpec or ticket graph during this grilling stage.

**Implement in dependency order:** (1) authoritative receipt/currentness/lineage and safe participant projection; (2) all-path authorization, coherent bounded reads, cache/privacy and failure states; (3) the small shared UI and source help path; (4) real-role, replay/race, browser/AT/mobile and migration/restore proof; (5) qualified source-cohort activation. Current work must not depend on a future general File Manager or all of Workflow Studio.

**Prevent before release:** unauthorized metadata/content, fabricated receipt/currentness, failure presented as empty, unusable mandatory controls, absent help ownership and uncontained legacy readers are activation blockers. Monitoring does not justify shipping those known failures.

## Residual operational controls

The named functional owners require concrete assignees before activation. Thresholds below are proposed response triggers, not measured incidence or invented service-performance claims. Use approved opaque references, not private history content.

| Owner                                         | Signal and threshold                                                                                                     | Response                                                                                                                                                                                    |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform security + native request owner      | One confirmed forbidden history/metadata disclosure, cross-scope association or ordinary superseded-content read         | Fence the affected reader/profile, preserve restricted evidence, contain alternate paths and repeat actual-role/projection tests before re-enabling.                                        |
| Native request/source integrity owner         | One confirmed fabricated, duplicated, lost or incorrectly related durable receipt/correction fact                        | Stop the affected projection/writer path as appropriate, preserve source truth, reconcile exact effects and replay safely; never repair by inventing lineage.                               |
| Shared UI + request product owner             | One reproducible failure-as-empty result or history-induced wrong-current/re-upload action                               | Correct the state contract/copy, retain verified current work, and repeat the affected recovery journey before expanding that cohort.                                                       |
| Source coordinator + request product owner    | One supported earlier-submission help request has no responsible route or ends without a permitted explanation/next step | Repair ownership/routing and resolve the request under source rules; do not create an informal byte-release bypass. Review recurring content needs for an explicit future product decision. |
| Accessibility + shared UI owner               | One reproducible blocking keyboard/AT/touch/zoom path or inaccessible required current instruction                       | Treat as a release defect, repair shared semantics/interaction and repeat actual-device/assistive verification.                                                                             |
| Platform data/performance owner               | One admitted response/query lacks its required finite bound or exceeds an enforced page/payload/concurrency limit        | Apply bounded failure/backpressure, correct query/continuation/index behavior and repeat maximum/overload tests; do not use unbounded client filtering.                                     |
| Permission/cache + platform engineering owner | One confirmed unauthorized stale response after a context change or required invalidation failure                        | Fence affected cache/read paths, clear current restricted state under inherited rules and retest switch/revocation/late-response behavior without recall claims.                            |
| Records/privacy + custody/source operations   | One restore/disposal operation exposes denied history, destroys obligated facts or revives old currentness               | Stop affected restore/serving/disposal, reconcile adverse history and obligations, repair and repeat source/retention recovery proof.                                                       |

## Recorded outcome and remaining proof

Q05 A and its complete required amendment package are ratified by Conrad, 2026-10-20. The reviewed disposition was **Accept with required amendments**; the exact corrected decision, C01–C20, P01–P24, reviewed UX and all eight operational controls are now adopted grooming intent. The feature ADR and decision log record ratification; Q01–Q04 remain unchanged. No Q06 choice is inferred.

Actual native recipient history implementation, current-role authorization, safe provider/route/cache behavior, complete browser/AT/mobile journeys, source help operation and representative user feedback remain unproved. The three existing passing files are bounded evidence, not a release certificate. No product/provider/permission change, formal specification, GitHub publication or activation occurred.

## Founder ratification — 2026-10-20

Conrad instructed: “Yes, Ratify this with the required amendments. Record it
and move to the next question in this phase 29 grill-with-docs session, with
the research, practical options, and your recommendation.”

This adopts the exact corrected decision, all Q05-C01–C20 and Q05-P01–P24,
the complete UX/recovery and eight operational controls. Recording changed
status and trace only. Post-completion access, duration, formal specification,
implementation and activation are not inferred from this ratification.
