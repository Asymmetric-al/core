# Phase 29 — Common safeguards, operations and proof

This canonical volume applies to every Phase 29 requirement and every applicable source profile. A domain volume may strengthen or specialize a safeguard; it may not silently weaken one. The implementation target is the complete contract and its acceptance criteria, not a screenshot, adapter stub, passing structural check or short story summary. No source, native, provider or intended-user test is represented as already passed.

The user explicitly invoked `/to-spec` on 2026-10-29 and confirmed the primary testing seam at source-owned commands, queries and file-serving interfaces, with necessary real-role database/private-byte/provider qualification and complete Playwright/accessibility journeys. Existing shared infrastructure is preferred. The requirements below do not introduce another policy, task, workflow, notification, identity or generic drive engine.

## REQ29-P01 — Preserve one coherent experience and exact source ownership

**Story US29-P01:** As a staff member working across Asym, I want document controls to behave coherently while respecting each record's meaning, so that convenient access does not change business truth.

**Decision basis:** Founder §§1/3/7/13/16/19; Q02; Q61-C01–C07; Q62-C01; Q65-C01–C03; Q66-C02; Q67-C01.

Phase 29 shall own shared immutable byte custody, intake, qualified processing/renditions, physical-copy inventory, authorized delivery, access evidence and owner-directed preservation/disposition. The ordinary request/share source owns its request, item, recipient-authority, review, fulfillment and permitted continuing-reference facts. The organization resource owner governs its publication and reader features. Existing official-document, finance, CMS, conversation, import, care and other source owners retain identity, accepted/current version, audience, legal/financial meaning and source policy. Mission Control and embedded controls consume those same source commands; a central explorer is not an alternative authority. All ordinary, existing specialist and individually named future consumers in the integration volume remain in scope with exact prerequisites. Native source work shall not depend on installing configurable Workflow Studio.

- **AC29-P01-01:** An embedded file control and File Manager action targeting the same permitted source use produce the same authoritative result and current access decision; neither creates a competing document/status record.
- **AC29-P01-02:** Uploading, renaming, linking, previewing, restoring or moving bytes does not issue a receipt, approve an expense, sign/end an agreement, fulfill a request, publish a page, import rows or start a build unless the independently authorized owning command explicitly performs that effect.
- **AC29-P01-03:** A generic action incompatible with a source is absent or honestly unavailable with permitted recovery; it never falls back to ordinary semantics or a public URL.
- **AC29-P01-04:** Each existing and future consumer has a separately identifiable producer/profile, safe unavailable outcome, owner and qualification evidence. A missing future consumer does not block independent qualified native requests or force a second custody store.
- **AC29-P01-05:** App routes stay thin and shared business mutations remain with the established server/API owner; public CMS content and CRM operational facts retain their separate authorities. Twenty CRM is not restored.

## REQ29-P02 — Resolve current native identity, tenant and exact capabilities

**Story US29-P02:** As a person using an authorized document task, I want access to follow my actual identity and current purpose, so that I receive exactly the capability intended for me.

**Decision basis:** Founder §§3/7/10/11/16/19; Q01; Q04; Q21; Q41; Q52-C04; Q60-C02; Q63-C05; Q66-C06–C07; Q67-C02/C12; Phase 12 authority.

Every admission and disclosure shall resolve verified native identity and the actual current source/P12 Tenant Authorization Context. Staff, limited request/share recipients, donors, missionaries, public readers, qualified non-human identities and audited operators retain their actual source-supported paths; no fake Party, donor, membership, staff role or demo Tenant may be fabricated to satisfy an interface. Tenant, actor, author, reviewer, approver and authoritative recording time are derived from trusted context; caller identifiers are selectors validated against it. Capability names/meaning remain with the registry and source, while tenants allocate eligible grants through qualified controls. Sign-in, email equality, a relationship, link possession, role title, ownership of a provider key and stale JWT claims are not current action authority. User-editable Auth metadata never authorizes. Current native session/revocation guarantees must qualify independently of application denial.

- **AC29-P02-01:** Wrong-tenant, revoked, expired, suspended, wrong-purpose and wrong-subject callers cannot discover or mutate protected material through any role or recipient branch.
- **AC29-P02-02:** A qualified limited recipient can complete their exact task without unrelated enrollment; an existing account retains its independently valid affiliations without gaining new ones.
- **AC29-P02-03:** Changing a submitted tenant/actor/approval field cannot move an operation into another scope or forge attribution; a supported selector resolves to the same current trusted context through application and database.
- **AC29-P02-04:** A non-human identity uses its own qualified single-Tenant grants and live owner ceiling; queued work cannot freeze a departed human's authority or use ambient service-role power.
- **AC29-P02-05:** Protected-action admission, final mutation/dispatch and result disclosure re-evaluate the current dependencies required by their owners after waits. Missing native identity/context fails safely without a profile-role or demo fallback.
- **AC29-P02-06:** A view-as or relationship display helper cannot mutate source state or widen file disclosure. Operators use the actual audited, purpose-bound, time-boxed source path.

## REQ29-P03 — Enforce database integrity and authorization through every door

**Story US29-P03:** As a tenant administrator, I want database and alternate access paths to enforce the same boundaries as the interface, so that a valid account cannot bypass document rules.

**Decision basis:** Founder §§11/14/16/19; Q21/Q41/Q52/Q60 database clauses; Q61-C14; Q63-C16; Q66 database and context clauses; Q67-C13.

Use typed same-scope source, use, object/version/copy, policy, authority, operation and outcome relationships. Required tenant/environment/source identity is non-null; nullable composite references are complete-or-absent. Enforce referenced uniqueness, tenant-aware relationships or an explicitly proved placement equivalent, valid state/time/revision combinations and deliberate delete behavior. Application/database tenant context must be unified and reset through pooled success, error, cancellation and retry. One P12/source decision layer governs fine-grained authority; prescribed coarse Tenant RLS supplies defense in depth. Inspect effective schema/table/column/sequence and named/PUBLIC/default/inherited function grants, actual owners, FORCE/BYPASS roles, invocation mode, overloads/search paths and triggers. Existing-row and resulting-row checks must prevent reparenting, forged attribution, source substitution and forbidden state changes. PostgreSQL inherited predicate semantics apply; a literal omitted WITH CHECK alone is not evidence of a bypass. Immutable source facts and control history cannot be erased by an incidental parent deletion.

- **AC29-P03-01:** Real database roles cannot insert or update a permitted row into another tenant/source/subject, spoof an acceptance or approval, clear independent restrictions or replace an immutable byte identity.
- **AC29-P03-02:** SELECT, INSERT, UPDATE, DELETE, RETURNING, UPSERT, MERGE and trigger-adjusted rows preserve actual authorization; a zero-row result is not reported as successful business acceptance.
- **AC29-P03-03:** Views/materializations, REST/GraphQL/RPC, Storage, import/worker/operator paths and legacy scripts cannot bypass the same restrictions. Unsafe doors are removed or narrowly denied before activation.
- **AC29-P03-04:** Tests exercise actual named/default/inherited/PUBLIC grants, function ownership/search paths and owner/FORCE/BYPASS/invoker/definer/service combinations, rather than asserting safety from keywords alone.
- **AC29-P03-05:** Reused connections after commit, rollback, cancellation and retry do not retain another principal's tenant or security context; missing or mismatched context fails closed.
- **AC29-P03-06:** Deleting or retiring a person, source record or policy cannot cascade away still-required history, controls, uses or copy evidence. Authorized lawful retention/redaction is a separate owning operation.

## REQ29-P04 — Protect every disclosure and invalidate stale access

**Story US29-P04:** As a person whose documents may contain sensitive information, I want every representation and discovery path to respect current access, so that hiding a screen does not leave another leak.

**Decision basis:** Founder §§8/11/12/16/19; Q04/Q05/Q38/Q41/Q44/Q54/Q58/Q59; Q63-C15; Q66-C18; Q67-C14; source field projection contracts.

Apply current source/P12 static classification and subtract-only projection before search, facets, counts, autocomplete, ordering, duplicate suggestions, pagination, metadata and result serialization. Titles, existence, thumbnails, use/hold associations, conflict reasons and counts can themselves be protected. Original, preview, derivative, manifest, OCR/text, range/conditional read, print/export and operation recovery each require their actual source-approved purpose. Current requester-authorized gateways remain required where bearer URLs are forbidden; private object-store authentication is not Asym authorization. Cache keys and invalidations preserve complete principal/Tenant/environment/source/purpose/version scope; tags are not isolation. Private responses and refreshed session cookies never enter shared/public caches. Reject late responses and clear protected client state after context change or revocation. Public caching belongs only to separately qualified released public outputs.

- **AC29-P04-01:** A forbidden object cannot be inferred from names, duplicate warnings, counts, sort order, error shape, stale cache, hidden fields or authorized use of a related record.
- **AC29-P04-02:** Full, range, conditional, original, thumbnail and derivative reads independently enforce the relevant current authority; a prior successful request does not open unlimited later access.
- **AC29-P04-03:** Source-safe unavailable errors and protected operator explanations disclose only what each actual viewer may receive. Broadening access to explain a denial is forbidden.
- **AC29-P04-04:** Account/Tenant/purpose switching or revocation prevents old requests, cached selections and asynchronous results from appearing in the new context or silently retargeting accepted work.
- **AC29-P04-05:** Short expiry, disabled Download, watermarks or hidden UI are not represented as immediate revocation or prevention of copying. Revocation blocks future authorized delivery without claiming recall of bytes already received.
- **AC29-P04-06:** Private evidence/body/token/URL data does not enter analytics, general traces, search indexes or external processing without its separately qualified purpose and egress rules.

## REQ29-P05 — Bind retries to complete business intent and recover original results

**Story US29-P05:** As a user recovering from a slow or lost response, I want Asym to recover the action I already submitted, so that retrying cannot create duplicate work or undo a later change.

**Decision basis:** Founder §§10/14/16/19; Q03/Q08/Q13/Q16/Q21/Q41/Q49/Q52/Q60/Q63/Q66/Q67 semantic-operation clauses.

Every consequential command shall have a durable source-owned operation identity bound to trusted scope/principal, exact semantic inputs, target and relevant expected basis. Recover a matching committed original under current disclosure before treating it as a new command. A changed-intent retry conflicts. Distinguish a source business occurrence, accepted command and delivery/execution attempt. Different keys/callers/workflows do not duplicate the same semantic effect, while genuinely new source-qualified occurrences remain representable. Expected relevant revisions detect change-away-and-back; equality of displayed values, file digests or status is not complete intent equality. Original acceptance and currently applicable state remain separate. Bound replay evidence lawfully; unverifiable expired/stale intent is denied rather than accepted as new. A true complete no-op creates no false actor, time, revision, notification or clock reset.

- **AC29-P05-01:** Duplicate same-intent submissions return the one attributable original result and do not create additional versions, acceptances, access issuances, reminders, publications or physical effects.
- **AC29-P05-02:** Changed scope, evidence, requested action or relevant expected basis under a reused key cannot be silently applied or described as the original action.
- **AC29-P05-03:** A replay of an old success after correction, withdrawal, retraction, expiry or Stop does not revive applicability or effects; current state is separately projected under present disclosure.
- **AC29-P05-04:** A lost response, navigation, browser abort or closed dialog is not proof of rollback. Recovery precedes new-key, reduced-selection or successor-basis work.
- **AC29-P05-05:** Legitimately repeated events or new review on unchanged bytes are not permanently blocked by an inadequate subject-plus-digest/date key; source-defined occurrence/basis determines equivalence.
- **AC29-P05-06:** Old commands after cleanup, restore or deployment cannot become fresh business intent because their prior bookkeeping is unavailable.

## REQ29-P06 — Commit authoritative effects coherently and preserve safety before background work

**Story US29-P06:** As a staff member acting on a document, I want accepted actions and their required history and controls to agree, so that partial infrastructure failure cannot leave misleading or unsafe state.

**Decision basis:** Founder §§9/10/14/16/19; Q21/Q22/Q49/Q52/Q60/Q62/Q63/Q65/Q66/Q67 transaction, fencing and follow-through clauses.

Use the actual source transaction or qualified equivalent ordering boundary to commit the authoritative result, required history, current controls and durable secondary intent coherently. Where a source explicitly requires an enclosing database transaction—especially Q52's all-or-none new selected acceptances—that requirement is not weakened into a compensating saga or independent SDK writes. Safety-critical restrictions must be effective at the controlling admission boundary before deferred projections or impact processing. Keep expensive scanning/conversion/provider IO outside short locks. A claim, callback, service credential, authenticated wrapper or handoff ledger is not transactionality. Follow-through is durable, bounded and retryable under the original effect, while current eligibility is rechecked wherever a fresh external submission would occur.

- **AC29-P06-01:** Fault injection before authoritative commitment yields no partial new source facts; after commitment, original outcomes/history and necessary fences remain recoverable even if refresh or follow-through fails.
- **AC29-P06-02:** New selected Q52 acceptances commit together or none do; independently existing exact acceptances keep their original attribution. No hidden partial batch is represented as an all-or-none command.
- **AC29-P06-03:** Both race orders are tested for acceptance/correction/withdrawal, fulfillment/replacement, access issuance/expiry and use/hold/promotion/disposition. The winning source boundary controls subsequent admissibility.
- **AC29-P06-04:** A pending protective policy/correction impact cannot leave a stale permissive disposer or serving path eligible while only a UI badge is updated.
- **AC29-P06-05:** External IO is not held inside a long database transaction to claim distributed atomicity. Partial/unknown physical outcomes remain exact and do not undo true source history.

## REQ29-P07 — Preserve source clocks, date precision and boundary conditions

**Story US29-P07:** As a user working across time zones, I want deadlines and event dates to mean what the source says, so that display settings or retries do not change my allowed work.

**Decision basis:** Founder §§10/14/19; Q06–Q20; Q46/Q48/Q55; Q62-C11; Q65; Q66-C03/C09/C13; Q67-C05.

Keep requested-by dates, source access deadlines, actual fulfillment, retention starts, resource review dates, processor expiry, provider permit validity and recorded timestamps distinct. Preserve every ratified elapsed-day duration and exact source anchor; other profiles may not borrow those numbers. Date-only values remain dates with source calendar semantics; instants use the actual qualified timezone/precision. Display locale/browser clock cannot supply authority or secretly change an interval. Actual occurrence, governing effective date, source acceptance time and later recording time are distinct. Do not backdate from upload/scan/client time or represent a stale transaction-start timestamp as a newly committed occurrence after waits. No read, copy, retry, name edit or policy inspection resets a clock unless the source explicitly defines that event.

- **AC29-P07-01:** Tests cover the exact inclusive/exclusive deadline boundary, late operation arrival, delayed responses and both orderings against fulfillment or expiry; the server's actual source rule decides.
- **AC29-P07-02:** Changing Requested by, review date, locale, timezone display or a storage provider does not extend access, restart retention or create a new business event.
- **AC29-P07-03:** Date-only, leap/calendar boundary, offset/day crossing, ambiguous/nonexistent local time and late occurrence cases retain the declared meaning or produce a specific safe correction path.
- **AC29-P07-04:** Missing/unknown/not-yet and legitimately continuing/review-based treatment remain distinct; no convenient today/midnight/zero/forever default fills missing authority.
- **AC29-P07-05:** Queued or resumed work rechecks actual admission/permit validity after waits; expiry never proves an already possible external effect stopped.

## REQ29-P08 — Preserve immutable history and separately govern current applicability

**Story US29-P08:** As an authorized reviewer or records operator, I want to see what actually happened and what is currently applicable, so that correction is possible without rewriting history.

**Decision basis:** Founder §§7–14/16/19; Q03/Q05/Q21/Q22/Q37/Q45/Q49/Q50/Q60/Q65/Q66/Q67.

Preserve original submitted/accepted byte versions, receipt and acceptance identities, original actor/time/basis, actual fulfillment and prior governing records. A new upload, correction, derivative, metadata label or provider relocation does not silently replace them. Current applicability, safe display metadata and source-qualified correction/supersession are separate records or projections under the actual source model. Do not introduce a universal event-sourcing platform. Append-only business history remains subject to lawful minimized retention/redaction; it does not justify indefinite private-body storage. Required controls/tombstones remain sufficient to reject obsolete intent and prevent restored permissions or effects. Changes to non-operative display metadata must be proved non-operative; uncertain semantic change uses the owning successor path.

- **AC29-P08-01:** Correcting an acceptance, policy assignment, external recording or resource publication preserves the original fact and shows the source-qualified current outcome without changing historical fulfillment/access.
- **AC29-P08-02:** Equal content bytes do not establish equal provenance, rights, consent, authority or business significance; source-specific evidence and uses remain independently represented.
- **AC29-P08-03:** Mutable presentation/current-head data cannot become approval or immutable history authority, and a new version cannot inherit an older version's acceptance automatically.
- **AC29-P08-04:** Lawful anonymization/erasure does not orphan required references, forge attribution or re-enable stale commands; retaining minimal control evidence does not retain unnecessary sensitive content.
- **AC29-P08-05:** Original-copy fidelity follows its source: stricter required discard/sanitization rules are preserved for specialized public media rather than overwritten by a universal retain-original policy.

## REQ29-P09 — Reuse exact communication, task and workflow effects

**Story US29-P09:** As a recipient or staff reviewer, I want notices and work cues to reflect real actionable changes, so that document work does not produce duplicate or misleading messages.

**Decision basis:** Founder §§3/10/16; Q20/Q24–Q27/Q30–Q32/Q35/Q40/Q48/Q51/Q52/Q60; Q64; Q67-C10; Phase 6/17 and Workflow owners.

Each notice, reminder, task and attention cue retains its exact owning purpose, occurrence, audience, current utility, preference, suppression and semantic dedupe contract. Native request/review work remains usable without configurable Workflow. Workflow coordinates source-accepted results and never turns task creation, receipt, a generic checkbox or transport success into fulfillment. No new automatic email/bell/notification cohort is inferred from correction, event recording, a hold, a read or a source error. Preserve ratified defaults and tenant controls, including the Q60 same-recipient corrective-request automatic-reminder exclusion; ordinary staff reminders/notices remain subject to their own rules. Historical/imported facts remain dark for unrelated outward effects without separately reviewed bounded backfill.

- **AC29-P09-01:** Duplicate callbacks, overlapping staff/workflow actions and repeated jobs cannot send or create the same business effect twice or broaden its audience.
- **AC29-P09-02:** Correction/review/attention does not manufacture a Q27/Q40 producer; each actual notice has the exact selected source cause and only permitted payload fields.
- **AC29-P09-03:** Q48 stops/counts/settings and already possible sends survive correction and recovery; the Q60 corrective lane cannot escape its automatic-reminder exclusion through clone, unlink, new key or default inheritance.
- **AC29-P09-04:** Late historical event recording can update explicitly qualified current records duties without replaying old communications, enrollment, access or collection.
- **AC29-P09-05:** Source acceptance, message preparation, provider acceptance/delivery and human reading remain distinguishable; a failed notification never silently reverses an accepted business fact.

## REQ29-P10 — Give truthful failure states and capable recovery

**Story US29-P10:** As a user whose document action encounters a problem, I want a clear status and a real next step, so that I can recover without guessing whether to repeat the action.

**Decision basis:** Founder §§9–11/14–16/19; Q23/Q34/Q49/Q52/Q60/Q61/Q63/Q66/Q67.

Show not attempted, rejected/not accepted, accepted with follow-through pending, known success, conflict, unavailable, partial physical result and outcome unknown according to actual source facts. These are independent facts/views rather than a mandatory giant enum. Preserve permitted input, selection and focus after recoverable errors; current authority loss clears restricted state. A source-specific capable action must exist for expected correction, clarification, containment, replacement, reconciliation and restore—not a powerless queue or routine SQL/provider-console repair. A partial operation is allowed only where the owning contract permits independent targets; never reinterpret Q52 as partial new acceptance. Error/recovery responses must not reveal hidden records or reasons.

- **AC29-P10-01:** Known committed success survives a failed refresh; unknown commitment is not reported as failure with an invitation to create another intent.
- **AC29-P10-02:** Closing or navigating away from a submitted form does not promise cancellation. The actor can recover the permitted original outcome through the actual source route.
- **AC29-P10-03:** Wrong-target containment or retraction remains usable under its own current authority even when unrelated replacement preparation is invalid or unavailable.
- **AC29-P10-04:** A failed independent module leaves other safe source work usable; missing material authority blocks the affected consequential action without a permissive fallback.
- **AC29-P10-05:** Operator reassignment after departure preserves actual attribution and required control state; it does not impersonate the former actor or require their account to remain active.

## REQ29-P11 — Deliver accessible, consistent and efficient task interfaces

**Story US29-P11:** As a staff member, recipient or resource reader, I want usable document controls across devices and assistive technologies, so that I can finish my task with clear feedback and few reasonable steps.

**Decision basis:** Founder §§1/6/8–12/16/19; Q61-C12; Q63-C14; Q66-C17; Q67-C06/C15; all source-specific UX decisions.

Use exact Base UI/base-maia, shared semantic tokens and shared component ownership. Reuse the qualified ReUI File Type, Table 13, Files/Drive Explorer and File Upload sources as directed, verifying actual source/license/compatibility and adapting to Mission Control's bounded layout. Never copy fixture permissions, simulated progress, fake storage meters or local-only completion. Embedded and narrow donor/missionary/recipient surfaces expose their task rather than a second staff drive. Keep known context, visible next actions and proportionate review; do not add universal uploads, reason essays, second approvals, preview clicks or confirmation dialogs. Preserve applicable source review requirements even when a document is not accessible through the default preview.

- **AC29-P11-01:** Complete tasks are usable by keyboard, non-drag pointer, touch and assistive technology, with visible unobscured focus, meaningful labels, predictable focus restoration and no hover/color-only essential information.
- **AC29-P11-02:** Ordinary vertical content reflows at 320 CSS pixels and supported zoom; long/international names, RTL/localized text and source dates remain understandable without changing identity or authority.
- **AC29-P11-03:** Upload and processing status persists where needed; meaningful changes are announced without focus theft or noisy announcements on every progress refresh. Errors identify the affected input and actual repair.
- **AC29-P11-04:** Drag reorder/move/upload has a fully functional non-drag alternative. Historical date entry is not calendar-only. Focused Enter/Space works while IME, selection/blur, GET and prefetch remain inert.
- **AC29-P11-05:** File icons/avatars/badges communicate presentation only; adjacent readable text and actual composed contrast are tested, including known component variants that need adaptation.
- **AC29-P11-06:** Weak connections, repeated submission and sign-in/context recovery preserve safe work without silent restricted offline queues or a fabricated success state.
- **AC29-P11-07:** Real staff/recipient/missionary pilot evidence includes task completion, understood state, correction and practical interaction/time measurements. Automated axe or a library's accessibility claim alone does not establish conformance.

## REQ29-P12 — Treat files and extracted material as hostile until qualified

**Story US29-P12:** As a reviewer opening submitted material, I want processing to respect the source's safety and fidelity rules, so that a useful preview does not execute hostile content or misrepresent evidence.

**Decision basis:** Founder §§5/9/11/13/19; Q02/Q04/Q29/Q53/Q56; Q61-C05/C11; Phase 26 D32 and public-media owners.

Admission, scanning, isolation, decoding/conversion and derivative promotion must follow exact bounded source profiles. File extension, declared MIME, thumbnail, checksum, clean scan and preview success are separate facts and do not establish authenticity, authority or completeness. Guard archives/decompression, malformed/encrypted/oversized inputs, parser resource use and arbitrary external fetch. Treat embedded instructions and extracted/OCR/AI text as untrusted data, never tool or policy authority. Original preservation/discard follows its source; transformations create identified outputs with exact input/profile/options/coverage provenance. A missing saved spreadsheet value is unavailable rather than zero; readers do not execute macros, refresh external data, recalculate or silently accept revisions.

- **AC29-P12-01:** Hostile, unsupported, encrypted, oversized, malformed and interrupted inputs get source-specific bounded outcomes without public promotion, unsafe parsing or false business acceptance.
- **AC29-P12-02:** Scanner/converter outage or unknown safety evidence cannot become safe-by-timeout; independent lawful reading paths remain only where the source explicitly permits them.
- **AC29-P12-03:** Preview failure does not auto-download, open an external office viewer or share a private URL. Source-required inspection has a sufficient authorized alternative or remains blocked.
- **AC29-P12-04:** Late processor output, source revocation and cleanup/promotion races have a single qualified winner; stale cleanup cannot remove accepted output and deletion-claimed bytes cannot become Ready.
- **AC29-P12-05:** Extraction/AI output has explicit egress, language/coverage, retention and correction qualification and cannot become financial/legal evidence truth or broaden a search corpus by default.

## REQ29-P13 — Bound workload and preserve tenant fairness

**Story US29-P13:** As a tenant staff member, I want large uploads and background jobs to remain predictable, so that another workload cannot starve my document task or weaken security.

**Decision basis:** Founder §§15/19; Q38/Q44/Q48/Q52/Q56/Q61; Q63/Q66/Q67 finite-profile clauses; exact Phase 12 R6, Phase 23 and D32 budgets.

Qualify finite per-profile input/bytes/pages/expansion, source lookups, parsing/processing, list/selection, impact/fanout, lock/retry/permit validity, queue, history/replay and operator recovery bounds with explicit units and representative skew. No unspecified infinite retries, unsafe global locks or synchronous all-file scans. Preserve exact inherited Phase 23 catalog/intake and Phase 26 preview limits only for their owning profiles; they are not ordinary-upload defaults. P12 R6 remains at most one governance-row SELECT plus one ledger UPDATE logically for governed reads, with its documented physical carve-out; restricted hard-deny budgets are unstriped, conditional and enforced before egress with zero allowance denied and uniformity/safety precedence. This is not a quota on every mutation SQL statement.

- **AC29-P13-01:** Published capability profiles have measured finite values and supported workload/environment evidence; undefined bounds make the affected profile unavailable rather than silently unlimited.
- **AC29-P13-02:** Current authorization/projection is stable, unique and setwise per page/chunk; restricted rows do not leak through pagination, counts, timing or changing visible selection.
- **AC29-P13-03:** Large files, assembly/export/scan jobs and a large individual tenant cannot starve independent requests or receipts beyond the qualified fairness/recovery bounds.
- **AC29-P13-04:** Saturation, quota pressure and dependency outage remain visible and bounded; no fallback makes a private file public or omits required checks.
- **AC29-P13-05:** Performance proof tests actual supported maximum/boundary inputs, concurrency and tenant skew, with rejection and recovery beyond the bound; numerical claims are tied to measured evidence.

## REQ29-P14 — Provide durable business evidence and accountable operations

**Story US29-P14:** As a records or service operator, I want failures and history to identify what happened and who can resolve it, so that normal recovery does not require developer access to production data.

**Decision basis:** Founder §§11/14/15/19; Q61-C13–C16; Q63-C13/C17; Q66-C19; Q67-C16/C18.

Separate durable business history, security/access audit and technical telemetry. Preserve permitted actor/source/operation/version/basis/outcome correlation and exact provider observations without copying private bodies, tokens, reasons or raw locators into general logs. A signed URL grant is not a completed download, transport completion is not human reading and a print dialog is not physical custody. Required incomplete/conflict/unknown/partial work has a currently capable source/operator owner, finite deadline, supported reconciliation and escalation. Use existing qualified work surfaces and alerts; do not create a new generic console or task per normal event. Holds and privacy conflicts require real source/records authority rather than a blanket longest/shortest rule.

- **AC29-P14-01:** Operators can diagnose stuck intake, processing failure, integrity mismatch, stale use coverage, unknown copies, pending disposition and restore/exit failure using safe correlation and actual outcomes.
- **AC29-P14-02:** Every required unresolved operation has a capable accountable owner and recorded finite response/recovery boundary; missing owner or exceeded deadline produces an actionable escalation.
- **AC29-P14-03:** At least one confirmed authorization, attribution, duplicate-effect, missing-control or unauthorized historical-effect violation triggers scoped containment and reconciliation, preserving true evidence before requalification.
- **AC29-P14-04:** Access audit reports actual authorization/transport observations and does not claim reading, signing, receipt acceptance or external-copy deletion without its owning evidence.
- **AC29-P14-05:** Logs/audits/history themselves obey their classification, current access and lawful retention; high-cardinality sensitive filenames or identities are not metric labels.

## REQ29-P15 — Migrate actual retained data and block incompatible old writers

**Story US29-P15:** As a tenant relying on existing documents, I want migration to preserve usable evidence and its restrictions, so that a new File Manager does not discard or expose my files.

**Decision basis:** Founder §§4/16/19; Q61-C08/C16 and R-LEGACY; Q63 migration/restore; Q66-C20; Q67-C17; current source cutover contracts.

Inventory actual retained records, bytes, provenance, classifications, copies, callers, readers/writers, processors, scripts and customer reliance before cutover. Distinguish disposable fixtures from retained data. Preserve stable opaque business/byte identities and source references through exact supported mappings; do not infer policy/approval/event facts from filenames, old public URLs, upload dates, task flags or absence. Install compatible guards/readers before writers; version semantic schemas and profiles, not only table shape. Old clients/jobs that cannot interpret current restrictions must not write or resume effects. Define one authoritative cutover and source-safe coexistence, rollback or roll-forward with independent byte integrity and restrictions proven. No destructive fresh-build assumption or Twenty fallback is allowed.

- **AC29-P15-01:** The actual environment census classifies every reached file family and states supported mapping, unqualified lane, retained obligations and repair owner; unknown data is not labeled zero or disposable.
- **AC29-P15-02:** Old-code/new-schema, new-code/old-schema, unknown semantic version, renamed identity and stale-worker cases deny unsupported effects while preserving lawful reads/original-result recovery.
- **AC29-P15-03:** A source or custody cutover preserves byte digests, references, lineage, current policy/holds and exact access behavior before obsolete paths are retired.
- **AC29-P15-04:** Feature disable stops new affected admissions while preserving accepted facts, current protective controls and capable correction/reconciliation; rollback cannot revive unsafe old writers or shares.
- **AC29-P15-05:** A failed mapping or control recovery blocks the affected cohort and is actionable; it does not require all unrelated future phases or silently remove a promised source outcome.

## REQ29-P16 — Qualify physical custody, recovery and provider exit

**Story US29-P16:** As a records owner, I want preservation, disposal and recovery claims to be proved against actual copies, so that database metadata cannot falsely stand in for the document.

**Decision basis:** Founder §§5/14/15/19; Q61 R-CUSTODY/R-RESTORE; Q63-C06–C12; Q65 continuing use; Q66-C15; Q67-C11.

Choose the smallest adapter set that satisfies actual source profiles; provider choice does not create another access authority. Qualify access/revocation, conditional/range serving, integrity, immutable version/copy behavior, residency/egress, processors, concurrency, rate limits, credentials/keys, copy inventory, backups, restore and exit with exact environment/protocol evidence. Provider names such as private, signed, versioned or deleted do not prove the product guarantee. Database backups do not prove stored-object recovery. Order uses/holds/writers/promotions/restore against final destructive admission; finite permits and worker generations restrict new dispatch, while possibly escaped effects remain fenced until qualified reconciliation. Record actual physical observations even when later policy forbids another destructive submission.

- **AC29-P16-01:** Representative actual bytes plus metadata/manifests/references recover within the approved source RPO/RTO, with verified integrity and required key/configuration access; a three-row database smoke is not this proof.
- **AC29-P16-02:** Revocation/disposition/withdrawal history and current controls are applied before restored content can be served, linked, promoted or publicly released.
- **AC29-P16-03:** Every required copy has qualified verified removal/absence, failure or unknown status. A metadata delete, UI absence, generic404, delete marker or envelope success cannot falsely complete disposition.
- **AC29-P16-04:** Expired lease/permit/worker generation does not clear a possible earlier provider effect. Every fresh destructive submission requalifies against current policy/holds/Stop; evidence-only reconciliation remains independently possible.
- **AC29-P16-05:** Provider exit preserves identities, exact versions, rights, references and obligations; destination verification and closed coverage precede any separately authorized source removal.
- **AC29-P16-06:** No prototype, sandbox adapter or vendor documentation alone counts as qualified hosted/copy behavior; missing physical proof blocks affected activation.

## REQ29-P17 — Prove outcomes at the confirmed highest practical seams

**Story US29-P17:** As an implementation reviewer, I want tests to prove observable document outcomes and real safety boundaries, so that passing helper mocks cannot disguise a broken user journey.

**Decision basis:** Founder §19; Q61 proof register; Q62–Q67 proof groups; explicit 2026-10-29 testing-seam confirmation under /to-spec.

Use the confirmed primary seam: source-owned commands, queries and file-serving interfaces with durable results and current permitted readback. Reuse existing API/service test infrastructure and controlled adapter fault injection for business behavior. Complement it with real-role PostgreSQL/RLS/private Storage/provider/copy/restore qualification and complete Playwright plus axe/browser/manual keyboard/assistive-technology journeys. These are evidence families for the same source contract, not new product subsystems or a proliferation of per-helper seams. Component tests are justified only by a distinct shared invariant not proved at the higher seam. Mocks, demo sessions, skipped fixtures, source lint and structural docs checks do not establish native authorization or actual physical outcomes.

- **AC29-P17-01:** Tests cover happy/negative/boundary outcomes, all ratified recovery routes, duplicate/changed intent, both relevant race orders, migration and constrained workloads at the actual source boundary.
- **AC29-P17-02:** A real two-tenant/role matrix tests all alternate doors, grants/context mutation, authenticated limited recipients, revocation and current disclosure; service-role-only tests do not pass this gate.
- **AC29-P17-03:** At minimum, one private request-to-review-to-authorized-share journey and one public asset-to-placement-to-withdrawal journey complete with real source state and actual required bytes, then the other source-specific acceptance groups pass.
- **AC29-P17-04:** Browser tests use stable accessible roles/text and real state polling, not sleeps, fixture-only successes or network-aborted simulations as end-to-end proof. Manual keyboard/AT and intended-user tasks supplement automated accessibility checks.
- **AC29-P17-05:** Missing mandatory fixture, unavailable provider or skipped protected path produces explicit unqualified/blocked evidence; it never silently turns the release suite green for that capability.
- **AC29-P17-06:** Source/decision, document-generation, model/unit, native integration, hosted/provider and actual user evidence are reported separately with exact scope/version/environment and retained failure/recovery results.

## REQ29-P18 — Keep prerequisites precise and the complete contract traceable

**Story US29-P18:** As an AI coding agent implementing Phase 29, I want exact requirements, acceptance and predecessor boundaries, so that I can build the approved behavior without inventing missing authority or overlooking a consumer.

**Decision basis:** Founder §§3/16/19; Q61-C01/C13–C16; Q64 reference; Q66-C22; Q67-C18–C19; explicit /to-spec authorization.

The canonical domain/proof volumes own stories, full requirements and acceptance criteria. Generated story indexes, traces and OpenSpec projections carry those exact contracts, including complete unconditional companion bodies, and are not independent authoring sources. Preserve all Q01–Q67 and each explicit supersession, the accepted glossary and every applicable owner contract. The GF drafts remain examples, not approved tenant policies or universal defaults. Implement settled generic capability behavior and exact prerequisite interfaces without pretending unresolved material source policy, actual native credentials/copy coverage, legacy mappings or user evidence are known. Each gate names the owner, missing artifact/meaning, affected action, safe unavailable/recovery behavior and closure proof. An unresolved source behavior blocks that affected implementation slice; a merely unexecuted runtime test remains a required acceptance gate. A published/Ready specification is not implemented, qualified or activated.

- **AC29-P18-01:** Every ratified decision/main normative paragraph and incorporated proof obligation maps to specific requirements/acceptance or an explicitly justified historical/stage-only/superseded disposition; unmatched requirements fail documentation verification.
- **AC29-P18-02:** Each of the 23 existing and 11 future consumer rows is mapped separately with exact producer, owner, scope/gate and safe repair. No invented issue ID or closed-title inference substitutes for actual source evidence.
- **AC29-P18-03:** Defined tenant-configurable values remain configurable; missing operative GF/tenant values are not guessed, shipped as universal rules or used to block unrelated fully specified capability work.
- **AC29-P18-04:** The specification can be followed from numbered user story to exact contract, acceptance, source decision, design and prerequisite task; later implementation tickets/tests/release evidence use the same stable IDs.
- **AC29-P18-05:** Current/archived source bodies remain distinct, generators are deterministic and check-only mode detects drift, and the final published tracker artifacts are read back and compared with the reviewed package.
- **AC29-P18-06:** No feature implementation, actual policy/event/disposal, hosted-data change, real-user outreach or separate implementation-ticket graph is performed by specification publication. All runtime acceptance checklist items remain unchecked until actual evidence exists.
