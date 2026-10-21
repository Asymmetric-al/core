# Delta for Document Production

## ADDED Requirements

### Requirement: Document Production Preserves Five Durable Authorities

Document Production MUST preserve Document Definition Publication, source-owned Facts Package, idempotent Generation Request, optional source-authorized Issuance, and exact Artifact as distinct durable authorities.

Every clause in `openspec/contracts/document-production.md#contract-318ff77ad942fade6bca` MUST apply without exception.

#### Scenario: An official financial artifact is requested

- GIVEN the source owner authorized one exact immutable official-facts version
  and Legal Entity
- WHEN the Generated Document service renders the approved purpose
- THEN the artifact pins that facts version, Legal Entity, publication, and
  source-owned correction lineage
- AND the service does not infer eligibility or render from a live
  contribution, Party profile, provider object, or accounting projection

#### Scenario: A render times out and later succeeds

- GIVEN one Generation Request has one running Render Attempt
- WHEN that attempt times out and a fenced recovery attempt later succeeds
- THEN both attempts remain subordinate to the same request
- AND at most one artifact becomes canonical
- AND no new issuance, document identity, or delivery is created by recovery

#### Scenario: Delivery fails after issuance

- GIVEN a canonical issued artifact exists
- WHEN its Phase 17-prepared message bounces or is resent through Phase 6
- THEN only delivery evidence changes
- AND the Facts Package, Generation Request, Issuance, Artifact, and logical
  document current head remain unchanged

### Requirement: One Document Studio Uses Proportional Purpose Contracts

The platform MUST provide one Document Studio and production kernel for official/tax, governed-business, and general/custom document lanes.

Every clause in `openspec/contracts/document-production.md#contract-07ecbb635f8704adf53d` MUST apply without exception.

#### Scenario: A tenant publishes a general custom document

- GIVEN an authorized author uses only fields and blocks allowed by a general
  custom purpose
- WHEN its synthetic checks and applicable standard publication floor pass
- THEN the tenant can publish and generate it without developer assistance
- AND the document receives no official issuance, legal serial, or tax claim

#### Scenario: A custom template imitates an official receipt

- WHEN a general/custom candidate introduces protected official identity,
  serial, tax, eligible-amount, or required-disclosure content
- THEN publication fails with the exact purpose-contract violation
- AND no official request or artifact can be created from that candidate

### Requirement: Structured Visual Authoring Is The Only Canonical Source

Every definition MUST use one versioned Asym-owned structured visual document as canonical source.

Every clause in `openspec/contracts/document-production.md#contract-8e839139adaad3013fa1` MUST apply without exception.

#### Scenario: An author pastes executable or unsupported content

- WHEN the editor receives script, event attributes, remote resource behavior,
  raw renderer source, or an unsupported node
- THEN the canonical document rejects or converts it to plain safe content with
  an explicit finding
- AND no executable behavior survives preview, publication, or rendering

#### Scenario: An author works without drag-and-drop

- WHEN an author uses only keyboard and outline controls
- THEN every permitted add, configure, reorder, duplicate, and remove action is
  available with visible focus and programmatic labels
- AND protected blocks cannot be removed or hidden through either interface

### Requirement: Native Semantic Template Packages Are Portable Without Authority

Document Studio MUST export and import one versioned Asym-native semantic- template package.

Every clause in `openspec/contracts/document-production.md#contract-7f534809cd7f158ce0d0` MUST apply without exception.

#### Scenario: A destination imports a compatible native package

- GIVEN a source-authorized export contains one valid Asym-native semantic-
  template package and no prohibited state or data
- WHEN an authorized destination-tenant actor imports it
- THEN integrity, version, schema, dependency, tenant, and policy checks produce
  an exact compatibility and loss report
- AND the destination receives one quarantined draft with no source approval,
  authorization, publication, current-head, or operational state
- AND publication remains impossible until destination-owned bindings, proof,
  review, and the normal publish command succeed

#### Scenario: A package tries to choose its destination or carry authority

- WHEN package content supplies another tenant ID, publication status, approval,
  authorization, credential, real record data, artifact, or operational state
- THEN the server rejects the package before creating destination state
- AND no destination draft, tenant fact, authorization, or publication is
  created or disclosed

#### Scenario: Staff import a foreign or unknown format

- WHEN staff provide a foreign vendor template, legacy/prototype payload, or
  unrecognized Asym package version
- THEN import fails closed with a clear unsupported-format explanation
- AND no best-effort conversion, guessed binding, quarantined publication, or
  partial destination object is created

### Requirement: Approved Data Views Bound Tenant-extensible Facts

Every publication MUST bind one immutable Approved Data View.

Every clause in `openspec/contracts/document-production.md#contract-e5e6429396502afab9d0` MUST apply without exception.

#### Scenario: A tenant enables a safe custom field

- GIVEN the custom field is policy-eligible for the exact purpose and audience
- WHEN an authorized data administrator selects Available in documents
- THEN authors can find and use its stable semantic identity with a synthetic
  sample and approved formatting
- AND no second permission matrix or developer mapping is required

#### Scenario: A crafted request references a forbidden field

- WHEN any client, imported payload, stale draft, API, or worker references a
  field outside current policy
- THEN server validation fails closed before facts resolution or rendering
- AND no field existence, value, sample, or rejection detail leaks to an
  unauthorized actor

#### Scenario: A singular role resolves ambiguously

- GIVEN a named role requires exactly one authorized record
- WHEN the source resolver finds more than one candidate
- THEN it returns a typed source ambiguity
- AND it never chooses the first row or permits the template to disambiguate

### Requirement: Protected Truth Cannot Be Authored Or Suppressed

Official recipient, money, tax, valuation, advantage/benefit, eligible amount, issuer, jurisdiction, serial, signer, correction, required disclosure, aggregation, and applicability truth MUST be source-owned or code-pack-owned.

Every clause in `openspec/contracts/document-production.md#contract-0ed2bf249d78cf3561fa` MUST apply without exception.

#### Scenario: A template conditions required receipt language

- WHEN a candidate places a required legal block behind a tenant-authored
  condition
- THEN commit or publication fails at that protected block
- AND the finding points to the purpose-owned correction rather than offering
  an override

#### Scenario: A repeater tries to calculate totals

- WHEN a template attempts to filter, sort, group, join, deduplicate, aggregate,
  or calculate over a source-owned collection
- THEN schema or publication validation rejects it
- AND any required grouping or total must arrive as frozen source truth

### Requirement: Draft Commit And Publication Are Conflict-safe And Immutable

Drafts MUST use soft, expiring single-writer presence hints plus server-enforced revision compare-and-swap conflict handling.

Every clause in `openspec/contracts/document-production.md#contract-82c713818319fdca25a4` MUST apply without exception.

#### Scenario: Two authors save the same draft revision

- GIVEN both authors started from revision 8
- WHEN the first save creates revision 9 and the second submits stale revision 8
- THEN the second save conflicts without overwriting revision 9
- AND the UI preserves the second author's work for explicit review

#### Scenario: An author tries to approve a protected candidate

- GIVEN the candidate requires different-human review
- WHEN the author or an equivalent shared/service identity attempts publication
- THEN publication is denied
- AND the candidate and current publication remain unchanged

### Requirement: Publication Resolution Freezes One Whole Compatible Graph

Before creating a Generation Request, the server MUST resolve the deliberate configured assignment and configured ancestor inheritance to one expected primary; that MUST be normal resolution, not recovery.

Every clause in `openspec/contracts/document-production.md#contract-8257bd3c97336be2f0cb` MUST apply without exception.

#### Scenario: A Site publication is broken but its ancestor is compatible

- GIVEN the purpose authorizes ancestor recovery and the exact-locale,
  same-issuer organization publication passes every current compatibility check
- WHEN the Site publication fails admission
- THEN the organization publication is selected as one whole graph before
  request freeze
- AND the request remains Ready without donor-facing fallback language
- AND one grouped maintenance item identifies the Site publication problem

#### Scenario: Both permitted recovery candidates are compatible

- GIVEN configured assignment/inheritance resolved one expected primary and it
  cannot be admitted
- AND one prior publication at the same exact scope and locale and one purpose-
  permitted exact-locale ancestor both pass every current compatibility check
- WHEN the server resolves recovery
- THEN it selects the same-scope prior as the first compatible candidate
- AND it freezes that one whole publication graph without scoring, merging,
  tenant-configured reordering, or evaluating any additional class

#### Scenario: A frozen request later encounters a missing glyph

- GIVEN the request already froze one publication and renderer
- WHEN exact rendering fails due to a missing required glyph
- THEN the request enters a typed Needs attention state or exact-path retry
- AND it never selects another publication, locale, font, profile, or renderer

#### Scenario: Neither a system nor foreign-locale publication can rescue a broken primary

- GIVEN the expected publication cannot be admitted
- AND no affirmatively compatible same-scope prior publication or exact-locale
  purpose-permitted ancestor publication exists
- WHEN a sibling, foreign-locale, or protected Asym system publication exists
- THEN resolution stops with one cause-owned repair item
- AND none of those publications is selected, mixed, translated, or presented as
  a recovery candidate

### Requirement: Generation Requests Are Semantically Idempotent And Fenced

The Generated Document service MUST derive one permanent tenant-scoped semantic operation identity and compare a versioned immutable-command fingerprint over all authoritative pins.

Every clause in `openspec/contracts/document-production.md#contract-e3e198abb2209aee6efa` MUST apply without exception.

#### Scenario: Submit, timeout, refresh, and queue retry repeat one request

- GIVEN all calls carry the same semantic operation identity and identical
  immutable command
- WHEN they occur concurrently or after an ambiguous response
- THEN one Generation Request exists
- AND at most one current attempt owns execution
- AND at most one canonical artifact and logical completion result

#### Scenario: Provider response races its deadline

- GIVEN a provider response and deadline handler race
- WHEN both perform current-token database-time phase transitions
- THEN exactly one path wins
- AND a late response that loses cannot stage or promote bytes
- AND its token-owned cleanup remains durable and private

### Requirement: Renderer Selection Is A Pre-registered No-winner-capable Contest

Before official rendering launches, the platform MUST freeze and hash the complete renderer-contest charter and its hard gates and stop conditions.

Every clause in `openspec/contracts/document-production.md#contract-eb37a24273574ce65ec4` MUST apply without exception.

#### Scenario: Both finalists fail a hard gate

- WHEN neither exact finalist passes every pre-registered hard gate
- THEN the contest records no winner
- AND official generation and affected purpose activation remain dark
- AND preview and research may continue without misrepresenting production
  readiness

#### Scenario: A renderer upgrade changes layout materially

- WHEN a proposed winner upgrade changes pagination, tags, fonts, or other
  material output under the qualification corpus
- THEN the upgrade cannot mutate existing publications or historical artifacts
- AND affected content requires a newly proved publication and bounded rollout

### Requirement: One Canonical PDF Is Accessible And Purpose-appropriately Archival

Every human-facing publication MUST produce exactly one recipient-usable canonical PDF.

Every clause in `openspec/contracts/document-production.md#contract-d8213af97a2ac3450d0d` MUST apply without exception.

#### Scenario: An artifact passes render but fails accessibility validation

- WHEN the exact recipient PDF fails a required semantic, reading-order, table,
  language, alternative-text, font, or archival check
- THEN no artifact is promoted Ready or made available
- AND the request records an actionable validation failure without creating a
  downgraded copy

#### Scenario: A donor redownloads an issued document after template changes

- GIVEN the template, renderer, font, branding, or locale later changes
- WHEN the donor downloads the historical current document again
- THEN the response bytes, SHA-256, length, and publication identity match the
  stored canonical artifact
- AND no rerender occurs

#### Scenario: External audit anchoring is delayed and later reconciled

- GIVEN the exact canonical PDF passed validation, hashing, private storage,
  read-back, promotion, and any source-authorized issuance requirement
- WHEN the shared external audit checkpoint is temporarily unavailable
- THEN the same artifact remains Ready, current where applicable, and available
  through every otherwise authorized access route
- AND its checkpoint coverage is `unanchored_pending`
- AND one accountable owner exception drives idempotent reconciliation without
  rerendering, reissuing, renumbering, or changing currentness
- WHEN that same SHA-256 is later included in an externally anchored checkpoint
- THEN its checkpoint coverage becomes `anchored`
- AND the artifact bytes, identity, issuance, serial, signer, access, and current
  head remain unchanged

### Requirement: Logical Documents Have One Current Head And Immutable History

A logical document MUST have at most one current eligible publication.

Every clause in `openspec/contracts/document-production.md#contract-0e2f65b1db620c6554ac` MUST apply without exception.

#### Scenario: Replacement generation fails before promotion

- GIVEN the current document remains valid until a replacement succeeds
- WHEN the successor render, validation, or storage fails
- THEN the predecessor remains current
- AND the failed successor is visible only as one Needs attention condition
- AND no partial artifact becomes recipient-visible

#### Scenario: The predecessor becomes invalid immediately

- GIVEN source policy says the predecessor is no longer valid during correction
- WHEN replacement begins
- THEN the current card truthfully states that an updated document is being
  prepared and withholds the stale download
- AND no alternate or rerendered predecessor is offered

### Requirement: The U.S. Pack Covers Everyday Acknowledgments Without Becoming A Tax-form Suite

The code-owned U.S. pack MUST cover source-approved monetary and annual acknowledgments, goods/services and quid-pro-quo cases, eligible intangible religious benefits, ordinary noncash/stock/digital-asset descriptions, DAF/pass-through separation, QCD acknowledgment, and correction behavior.

Every clause in `openspec/contracts/document-production.md#contract-f6ff79206ed1c415c7c2` MUST apply without exception.

#### Scenario: A quid-pro-quo payment crosses one threshold only

- WHEN source facts place the gross payment above the disclosure threshold but
  the eligible contribution below the acknowledgment threshold
- THEN the protected disclosure is selected from the correct gross-payment rule
- AND the system does not apply the other threshold or combine separate gifts

#### Scenario: A specialized vehicle duty is indicated

- WHEN source facts prove or conditionally indicate a vehicle-reporting duty
- THEN exactly one stable Specialist Document Obligation is created or reused
- AND ordinary acknowledgment issuance proceeds only if independently complete
- AND no template or staff user can mark the specialty duty satisfied without
  its exact evidence path

### Requirement: U.S. Acknowledgment Identity Is Opaque And Versioned

Each native logical U.S. acknowledgment MUST receive one immutable reference in display form `ACK-XXXXX-XXXXX`.

Every clause in `openspec/contracts/document-production.md#contract-af9faae3106d8155efdb` MUST apply without exception.

#### Scenario: Five reference candidates collide

- GIVEN the named uniqueness constraint is deterministically forced to reject
  five independent valid candidates
- WHEN first issuance tries to allocate the reference
- THEN issuance fails closed with no partial current document
- AND a high-severity infrastructure alert is recorded
- AND no counter, timestamp, manual value, or variable-length fallback is used

#### Scenario: A valid reference is queried across tenants

- WHEN a caller presents another tenant's correctly formatted reference
- THEN the service returns the same non-disclosing result as an unknown or
  unauthorized reference
- AND no document, donor, issuer, version, or existence metadata leaks

### Requirement: Canadian Official Receipting Is Tenant-silent And Proof-gated

A tenant without a deliberately activated Canadian issuer pack MUST have no Canadian navigation, rows, joins, fields, filters, export columns, jobs, scans, queues, warnings, alerts, donor prompts, serials, signer objects, artifacts, or meaningful performance change.

Every clause in `openspec/contracts/document-production.md#contract-4c72091857a52a8d7026` MUST apply without exception.

#### Scenario: A U.S.-only tenant uses ordinary giving

- GIVEN the tenant never started Canadian setup
- WHEN staff, donors, missionaries, jobs, reports, and APIs use ordinary giving
- THEN no Canadian state is queried or exposed and no Canadian work is scheduled
- AND production tracing shows no meaningful Canada-specific latency or cost

#### Scenario: Canadian activation races an issuer change

- GIVEN staff reviewed one exact issuer revision and proof digest
- WHEN the issuer record or authority epoch changes before activation commits
- THEN nothing partially activates
- AND the setup returns to the exact failed task with one repair action

#### Scenario: Canadian records readiness is incomplete

- GIVEN every other Canadian setup task has passed for one exact issuer
- WHEN its required primary or backup location is not proved in Canada, the
  production records cannot be read or decrypted, the representative restore
  does not reproduce exact readable bytes and metadata, or the versioned tenant-
  responsibility acknowledgement is absent
- THEN activation commits no active pack, official-receipt authority, or serial
  reservation
- AND one records-owned setup action identifies the exact missing proof
- AND existing documents and every nonparticipating tenant remain unchanged and
  free of Canadian records UI, queries, jobs, or alerts

#### Scenario: Canadian document access lacks route-specific approval

- GIVEN the ordinary Canadian pack is otherwise ready
- WHEN the exact notice-plus-access route or direct-attachment route lacks its
  current qualified production approval
- THEN that route remains structurally unavailable and no official document is
  represented as delivered through it
- AND unrelated gifts, lawful approved access/fulfillment routes, and every
  nonparticipating tenant continue without Canada-specific friction

### Requirement: Canadian Serials And Signers Belong To The Exact Issuer

Each full Canadian registration account MUST have at most one active native `ca_r_v1` authority.

Every clause in `openspec/contracts/document-production.md#contract-662c882b61d9c26ecc10` MUST apply without exception.

#### Scenario: A worker crashes after serial reservation

- WHEN rendering or storage fails after one serial is atomically reserved
- THEN retry reuses the same frozen issuance intent and serial
- AND terminal work records the applicable reserved-not-issued or cancelled
  disposition
- AND the serial is never reused or hidden

#### Scenario: A signer successor fails readiness

- GIVEN one current signer and one proposed future successor
- WHEN the successor's authority, image, production proof, or activation fails
- THEN the current signer remains unchanged until its own authority ends
- AND only not-yet-issued Canadian receipts are held if no valid signer exists
- AND all other gifts, documents, tenants, and historical receipts continue

### Requirement: Artifact Access Uses Current Object Authorization

Every portal, guest, staff, print, full-file, and range request MUST reauthorize tenant, environment, exact issuer, purpose, recipient Party or evidenced representative, contact-authority epoch, logical current state, artifact health, and records/access state.

Every clause in `openspec/contracts/document-production.md#contract-b853c374401fff4c6369` MUST apply without exception.

#### Scenario: An authorized donor requests a byte range

- WHEN the donor requests an allowed range through the role-scoped BFF
- THEN the server reauthorizes the exact artifact before serving the range
- AND all ranges resolve the same immutable object generation and digest
- AND the complete private no-store/no-transform cache headers are present

#### Scenario: Storage integrity fails during access

- WHEN the retained object's generation, length, digest, or read proof is absent
  or inconsistent
- THEN the response is Temporarily unavailable
- AND a cause-owned integrity repair is recorded
- AND no signed URL, cached copy, provider file, or rerender is substituted

#### Scenario: The wrong signed-in account follows an eligible guest link

- GIVEN the signed-in principal is not authorized for the document but the
  recipient-bound guest capability is otherwise currently eligible
- WHEN the principal follows the protected doorway
- THEN the document is not claimed, attached, or exposed through that account
- AND the guest exchange, if the purpose permits it, remains a separate bounded
  mailbox-capability session

#### Scenario: Production delivery preserves the exact private response contract

- WHEN deployment verification requests the protected landing and exact artifact
  through the production Vercel/CDN path using full and range requests
- THEN all three required cache headers survive unchanged
- AND no response is cached, transformed, optimized, or handled by a service
  worker
- AND every allowed full or range response resolves the same object generation,
  SHA-256, and length
- AND no public or raw signed provider URL appears

### Requirement: Protected Actions Share One Scanner-resistant Fragment Protocol

Every producer-owned protected action, including document access, MUST use the same corrected shared protocol.

Every clause in `openspec/contracts/document-production.md#contract-d93f7463af53769717d1` MUST apply without exception.

#### Scenario: A mail scanner follows the action first

- WHEN a scanner requests the action with GET or HEAD but cannot submit the
  fragment verifier through deliberate same-origin POST
- THEN it receives only the generic no-fact landing response
- AND the grant remains usable by the intended recipient
- AND no access, download, or human-intent event is recorded

#### Scenario: The deployed protected-action protocol is probed end to end

- WHEN production verification exercises supported mail clients, scanners,
  webviews, repeated GET and HEAD requests, and the deliberate POST exchange
- THEN GET and HEAD remain inert and the intended recipient can still redeem
- AND the fragment never appears in server, edge, provider, analytics,
  communication-history, referrer, or support logs
- AND the exact cache headers, pinned-script CSP, no-referrer policy, no-service-
  worker rule, fixed origin, and CSRF protection are present
- AND a client that does not preserve fragments fails closed without a
  query-string or raw-path-secret fallback

#### Scenario: A guest opens a replaced document link

- GIVEN the predecessor is formally replaced and the complete issuer, Party,
  recipient, purpose, and contact-authority lineage remains unchanged and current
- WHEN the guest deliberately redeems the valid grant
- THEN the page explains that the predecessor was replaced and resolves the one
  current successor
- AND it does not serve or rerender the cancelled predecessor as current

#### Scenario: Replacement changes recipient authority

- GIVEN a successor changes issuer, Party, recipient, purpose, or contact-
  authority lineage
- WHEN a predecessor grant is presented
- THEN it does not follow or disclose the successor
- AND new access requires the successor's own current authorized route

#### Scenario: Routine reissue races provider acceptance and redemption

- GIVEN one incumbent grant exists for the same recipient and current document
- WHEN staff request a replacement notice and send or redemption outcomes race
- THEN the newest grant becomes usable only after durable provider acceptance
- AND at most the incumbent and newest accepted replacement are temporarily
  usable
- AND the first successful redemption retires its unredeemed sibling atomically
- AND a hard bounce retires only the failed replacement while an ambiguous send
  reconciles through the same Phase 6 communication identity and pinned Phase 17 content

### Requirement: Document Access Is Calm Role-safe And Recoverable

The code-owned starting policy MUST disclose a fourteen-day guest grant and an absolute thirty-minute document-only session, subject to the frozen production usability/security evidence.

Every clause in `openspec/contracts/document-production.md#contract-fdaafd2135cb9a2f0449` MUST apply without exception.

#### Scenario: An expired guest grant is opened

- WHEN an otherwise eligible recipient opens a grant after its disclosed expiry
- THEN the response reveals no document or recipient fact and starts no session
- AND it explains that the link expired, not the document
- AND it offers only fixed-destination reissue, portal sign-in, verified help,
  and paper/assisted access without asking for a public email address

#### Scenario: Two authorized recipients share one exact artifact

- GIVEN a joint donor and an authorized organization contact each have current
  independent recipient authority
- WHEN one grant bounces, redeems, rotates, expires, or is routinely revoked
- THEN the other recipient's authority and grant remain unchanged
- AND both authorized paths resolve the same exact current artifact

#### Scenario: Staff assist a donor

- WHEN authorized staff open the document's access panel
- THEN they see the masked fixed destination, current access state, Send new
  secure link, permissioned exact download/print, and separate security revoke
- AND they see no bearer verifier, arbitrary-recipient control, raw storage URL,
  or missionary access shortcut

### Requirement: Batches Are Item-authoritative And Use The Same Service

Single, scheduled, API, and batch generation MUST use the same purpose, facts, publication resolution, request, issuance, renderer, artifact, and authorization contracts.

Every clause in `openspec/contracts/document-production.md#contract-c552a74e6a87c91744c4` MUST apply without exception.

#### Scenario: One item fails in a large batch

- GIVEN 9,999 items succeed and one item lacks a required source fact
- WHEN the batch completes
- THEN the 9,999 canonical artifacts remain successful and unchanged
- AND the one item is Needs attention with its source-owned cause
- AND retry or repair cannot regenerate successful siblings

#### Scenario: An appointment activates during a batch

- GIVEN the batch froze one complete publication graph before activation
- WHEN a scheduled publication becomes current during execution
- THEN every frozen item continues with its original graph
- AND work admitted after activation uses the successor
- AND no item contains mixed dependencies

### Requirement: Records Schedules Separate Preservation Privacy Holds And Disposal

Every purpose MUST bind one reviewed effective-dated Records Schedule Contract over the closed v1 obligations: canonical artifact, issuance lifecycle evidence, source-owned financial facts, template/render validation evidence, delivery/access/security evidence, privacy/hold/disposal evidence, and temporary authoring/render material.

Every clause in `openspec/contracts/document-production.md#contract-bc60abb6152d4a33ee05` MUST apply without exception.

#### Scenario: A records administrator opens the controlling schedule

- WHEN a permissioned records administrator opens a document's Records
  disclosure
- THEN it shows the controlling purpose and authority, resolved trigger and
  dates, exact schedule version, and plain-language explanation
- AND it offers only contract-enumerated bounded extensions, authorized scoped
  hold/release actions, and custody/disposition evidence export
- AND it exposes no direct delete, per-document timer, or tenant legal-rules
  editor

#### Scenario: A records administrator applies a bounded extension

- GIVEN schedule version 7 enumerates one extension and its required basis
- WHEN an authorized administrator submits that choice, documented basis, and
  expected schedule version 7
- THEN the server re-proves the floor and privacy ceiling and appends the actor,
  authority, basis, controlling schedule version, prior/resulting dates, and time
- AND a concurrent schedule-version change instead rejects the stale command
  without applying any extension

#### Scenario: A records administrator attempts a prohibited retention change

- WHEN a caller requests floor weakening, an unsupported or forever extension,
  a per-document timer, direct object deletion, or a privacy-ceiling breach
  without separately reviewed lawful basis
- THEN the server rejects the command without changing schedule, hold, access,
  or artifact state
- AND the UI explains the controlling contract and the permitted next action

#### Scenario: A records administrator applies and releases a scoped hold

- GIVEN the actor has authority for the exact typed basis and scope
- WHEN the actor applies the hold with its owner, evidence, and review date and
  later explicitly releases it with release evidence
- THEN both transitions are append-only, attributable, and independently
  exportable as custody/disposition evidence
- AND the review date alone never releases the hold or broadens access

#### Scenario: A reviewed successor shortens one records schedule

- GIVEN retained records preserve schedule version 7 and their authoritative
  trigger evidence
- WHEN qualified review approves an effective-dated version 8 with one bounded
  impact set and a shorter resolved date
- THEN one expected-version, idempotent recalculation appends the version 8 result
  while preserving version 7 and its trigger evidence
- AND affected eligible records enter ordinary restriction, grace, final current-
  rule/no-hold reproof, and verified disposal
- AND no record is immediately mass-deleted or silently rewritten

#### Scenario: A schedule transition is duplicated or carries a stale version

- GIVEN one transition identity expects schedule version 7
- WHEN duplicate delivery repeats that transition and another caller supplies
  stale expected version 6
- THEN duplicate delivery observes the same transition and impact set
- AND the stale command fails without recalculation or record mutation
- AND at most one effective-dated successor becomes authoritative

#### Scenario: A donor closes an account before a receipt's legal period ends

- WHEN access and unnecessary profile use are revoked
- THEN the exact required receipt and source-owned evidence remain in restricted
  custody under their separate schedules
- AND they are unavailable for fundraising or missionary visibility
- AND the donor receives a truthful explanation rather than a false deletion
  claim

#### Scenario: A hold races final disposal

- WHEN an authorized hold and final disposal attempt the same guarded record
- THEN exactly one irreversible boundary wins
- AND a hold cannot report success after destruction won
- AND disposal cannot proceed after a valid hold won
- AND the losing path records a truthful reviewable outcome

#### Scenario: A disposed record appears in a restored backup

- WHEN disaster recovery restores media that still contains eligible disposed
  data
- THEN suppression is replayed before product access or workers reopen
- AND the restored copy cannot become downloadable or current
- AND disposal remains in progress until the required proof is re-established

#### Scenario: A disposal adapter returns forbidden proof fields

- GIVEN a disposal adapter result also contains a donor name, address, amount,
  filename, storage path, rendered content, raw Party ID, or raw hash
- WHEN the minimal disposal proof is finalized
- THEN retained proof contains only record class, tenant/issuer, schedule version,
  reason code, operation/time, copy-class outcomes, and any narrow D11 nonreuse
  disposition
- AND every forbidden field is absent from the proof and routine logs
- AND the proof binds its own bounded schedule rather than an implicit forever
  policy

#### Scenario: An activated Canadian issuer completes a destination transfer

- GIVEN an activated Canadian issuer is closing its ordinary application access
- WHEN a destination-custody transfer proves the exact issuer, immutable history,
  holds, access restrictions, readable records, and destination acceptance
- THEN the verified transfer evidence permits ordinary closure to complete
- AND no record is deleted, renumbered, rewritten, stranded, or silently moved

#### Scenario: An activated Canadian issuer uses records-only custody

- GIVEN an activated Canadian issuer cannot or does not choose a destination
  transfer
- WHEN an explicit restricted records-only custody agreement durably preserves
  the exact issuer, immutable history, holds, restrictions, and readable records
- THEN ordinary application access may end while the bounded records-only
  obligations remain enforceable and auditable

#### Scenario: Canadian closure lacks a verified custody outcome

- GIVEN an activated Canadian issuer has neither a verified destination transfer
  nor an explicit restricted records-only custody agreement
- WHEN ordinary tenant closure is requested
- THEN closure remains incomplete with one records-owned repair action
- AND required records remain protected, readable, and unmoved
- AND the same request for a Canadian nonparticipant encounters no Canadian
  closure state, UI, query, job, or alert

### Requirement: Future Publication Uses One Fully Proved Appointment

Publishing now MUST remain the default.

Every clause in `openspec/contracts/document-production.md#contract-13d560a7ead8c8181bd7` MUST apply without exception.

#### Scenario: A scheduled candidate becomes stale

- GIVEN a protected appointment targets version 12
- WHEN its signer, dependency, contract floor, expected head, or authorization is
  no longer current at due time
- THEN version 12 is not published
- AND the prior head remains current only if D15 still proves it compatible
- AND one grouped Scheduled publication needs attention item names the cause and
  safe next action

#### Scenario: A delayed activation worker receives duplicate wake-ups

- WHEN duplicate or late workers reconcile the same due appointment
- THEN at most one head transition succeeds
- AND `activated_at` records the true transition time without moving the chosen
  not-before instant
- AND no publication can occur after the bounded recovery window

#### Scenario: Time-zone rules materially change after approval

- GIVEN an appointment records its civil time, IANA zone, displayed offset,
  time-zone database generation, and approved UTC not-before instant
- WHEN newer time-zone data would materially reinterpret that civil time
- THEN the approved UTC instant remains unchanged
- AND the appointment becomes Needs attention and cannot execute automatically
- AND any changed effective time requires an explicit successor appointment and
  the review required by the current contract

#### Scenario: Reviewer offboarding does not erase a completed decision

- GIVEN an appointment has valid attributable completed approval
- WHEN that reviewer is ordinarily offboarded or loses an unrelated role
- THEN the approval evidence remains valid and the appointment may still execute
  if every current safety-live check passes
- WHEN an authorized security or governance actor explicitly invalidates the
  approval for a recorded reason
- THEN the append-only invalidation blocks execution and the appointment becomes
  Needs attention

#### Scenario: Staff try to publish a different candidate before the appointment

- GIVEN candidate A has the one unresolved future appointment for a head
- WHEN staff attempt to publish candidate B immediately
- THEN the UI and command require **Keep scheduled change** or **Publish now and
  cancel scheduled change**
- AND keeping preserves candidate A's appointment without publishing candidate B
- AND publishing candidate B atomically cancels candidate A's appointment with
  attributable evidence
- AND no path silently rebases candidate A's appointment to candidate B or a new
  head

### Requirement: Observability Is PII-safe Cause-owned And Reconciled

The system MUST record append-only tenant- and purpose-scoped operational evidence while excluding protected bodies, facts, secrets, and raw provider material from routine logs.

Every clause in `openspec/contracts/document-production.md#contract-b7a0063d15d0e59ff4ea` MUST apply without exception.

#### Scenario: Many documents fail for one broken publication

- WHEN one publication defect blocks or recovers many requests
- THEN the system creates at most one grouped cause-owned maintenance item with
  affected count and oldest waiting time
- AND it does not create one task, toast, email, bell item, or alert per document

#### Scenario: An operator needs technical evidence

- WHEN an authorized operator opens Verification details
- THEN they can inspect stable request, publication, reason, fence, validator,
  object, and correlation evidence needed for repair
- AND private donor values, document bodies, credentials, bearer verifiers, and
  raw provider content remain absent

#### Scenario: A scanner preflights a notice and Resend later reports accepted

- WHEN a scanner performs an inert preflight and Resend later reports provider
  acceptance
- THEN access evidence records only the inert preflight and communication
  evidence records only the provider-accepted state
- AND no recipient-received, opened, read, retained, filed, download, or legal-
  delivery claim is inferred

### Requirement: The Cutover Removes Every Prototype Runtime

Before destructive cutover, a server-authoritative gate MUST prove the target environment is non-production and contains no real tenant, irreplaceable artifact, externally relied-upon history, or production dependency.

Every clause in `openspec/contracts/document-production.md#contract-cea13ba0d3b3fe15189f` MUST apply without exception.

#### Scenario: The gate finds a real production dependency

- WHEN the pre-cutover assertion finds or cannot rule out a real tenant,
  irreplaceable artifact, or external reliance on a prototype path
- THEN destructive work does not begin
- AND no automatic migration, deletion, or fabricated canonical history occurs
- AND the premise is returned for explicit product re-grooming

#### Scenario: A fresh reset completes the cutover

- GIVEN the gate proves a disposable pre-production environment
- WHEN the canonical cutover runs and the database is reset/rebuilt
- THEN only the final document schema, grants, policies, indexes, private custody,
  and one Generated Document service remain executable
- AND repository/runtime inventories prove every named prototype writer and
  reader is absent

### Requirement: Release Requires Production-shaped Multi-seam Proof

Primary behavioral tests MUST exercise the Generated Document service with a tenant/actor-scoped purpose, source facts/issuance-authorization reference, and semantic operation identity, then observe product state, timeline, logical current head, any Phase 18 identifier/disposition, and authorized exact bytes.

Every clause in `openspec/contracts/document-production.md#contract-a0422af4a28b8f5a3e9a` MUST apply without exception.

#### Scenario: A mocked unit suite passes but real RLS fails

- WHEN deterministic service tests pass but a real-database hostile tenant test
  can cross a scoped relationship or object boundary
- THEN release remains blocked
- AND the unit result cannot waive the database proof

#### Scenario: The full U.S. tracer passes

- WHEN one source-approved U.S. contribution crosses publication resolution,
  request freeze, rendering, exact validation/storage, issuance linkage,
  staff/donor access, Phase 17 content preparation, Phase 6 delivery and resend,
  and source correction
- THEN every phase observes one logical document and the expected immutable
  lineage
- AND every download and resend resolves the exact expected bytes
- AND no prototype path participates
