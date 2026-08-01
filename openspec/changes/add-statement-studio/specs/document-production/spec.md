# Delta for Document Production

## ADDED Requirements

### Requirement: Document Production Preserves Five Durable Authorities

Document Production MUST preserve Document Definition Publication, source-owned
Facts Package, idempotent Generation Request, optional source-authorized
Issuance, and exact Artifact as distinct durable authorities. Within Issuance,
the source domain MUST own eligibility; whether and why issuance/document
identity is required; exact issuer/recipient/coverage facts; issuance validity;
and correction/void/cancel/replace authorization and effect. Phase 18's code-
owned jurisdiction/identity contract MUST own `ACK-*` and exact-issuer `ca_r_v1`
allocation, reuse/nonreuse, disposition, and artifact linkage. Render Attempts
MUST remain subordinate evidence beneath one Generation Request. Phase 17
Delivery MUST remain an external linked authority.

Only the Generated Document service MAY allocate a Phase 18 reference or serial,
after request admission/freeze and before identifier-bearing render. Templates,
renderers, clients, staff, and source-domain commands MUST NOT allocate. A
mechanical allocation/disposition MUST NOT change source-owned issuance validity
or correction effect.

A retry, provider callback, page refresh, batch restart, download, print, resend,
or delivery event MUST NOT create a second logical document, issuance, official
identity, or canonical artifact.

For an official financial purpose, the source-owned Facts Package and canonical
Artifact MUST pin the exact source-facts version and Legal Entity. A live
contribution, mutable Party profile, payment-provider object, browser payload,
or Phase 20 accounting projection MUST NOT substitute for those frozen source
facts or become document-render authority.

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
- WHEN its Phase 17 message bounces or is resent
- THEN only delivery evidence changes
- AND the Facts Package, Generation Request, Issuance, Artifact, and logical
  document current head remain unchanged

### Requirement: One Document Studio Uses Proportional Purpose Contracts

The platform MUST provide one Document Studio and production kernel for
official/tax, governed-business, and general/custom document lanes. Every
published definition MUST bind an immutable versioned Document Purpose Contract
that owns its lane, eligible source, audience, protected content, output policy,
publication floor, jurisdiction pack, access routes, records schedule, and
release gates.

The purpose contract MUST NOT grant templates authority to determine money,
legal donor, recipient, eligibility, official identity, correction, statement
population, delivery, or retention law. A general/custom purpose MUST NOT
acquire official issuance merely by copying official-looking content.

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

Every definition MUST use one versioned Asym-owned structured visual document
as canonical source. The visual editor and equivalent keyboard-operable outline
MUST edit the same source. The closed schema MUST govern blocks, layout roles,
attributes, page behavior, protected regions, reusable copied sections, links,
assets, conditions, and accessibility metadata.

Raw HTML, CSS, JavaScript, React code, renderer source, SQL, record paths,
expressions, arbitrary formulas, remote fetches, filesystem access, plugins,
recursive repeaters, and provider templates MUST NOT become production source.

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

Document Studio MUST export and import one versioned Asym-native semantic-
template package. The package MUST identify its exact package and canonical
document schema versions and digests and MUST include a closed manifest of every
included or referenced authoring dependency with its stable identity and digest.
Export MUST require source-tenant authorization and include only authoring
material that actor may access. The package MUST NOT contain secrets,
credentials, real donor or CRM data, generated artifacts, issuance, review,
authorization, publication/current-head, delivery, or operational state.

Import MUST verify package integrity and recognized schema/dependencies and
produce an exact compatibility and loss report before creating anything. The
destination MUST own the result as a quarantined draft. It MUST resolve every
blocking or lossy dependency against destination-owned fields, assets, purpose
contracts, and policy, then pass the ordinary current proof, review, and publish
path. Imported content MUST never auto-publish, inherit source approval or
authority, or mutate an existing destination publication.

Every cross-tenant import MUST use a server-authorized destination-tenant
command. Package content, a source tenant, a client-supplied tenant ID, or
possession of the package MUST NOT authorize or select the destination. The
platform MUST NOT accept a foreign vendor format, legacy/prototype payload, or
unknown package version through best-effort conversion.

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

Every publication MUST bind one immutable Approved Data View. The view MUST use
stable semantic field identities, one root subject, finite source-owned named
roles, and bounded source-ordered collections with explicit cardinality, null,
absent, withheld, empty, and overflow behavior.

An authorized tenant data administrator MAY make a policy-eligible native or
tenant custom field available in documents. Availability MUST only narrow the
Phase 11 field catalog and current tenant/purpose/audience/recipient/privacy
policy. Existence-sensitive forbidden fields MUST be absent from search, counts,
samples, logs, diagnostics, imports, and generated output.

The source resolver MUST assemble one immutable typed Facts Package before
rendering. The renderer MUST receive only that package and MUST NOT query the
CRM, follow relationships, select recipients, calculate protected truth, or
change collection membership/order/totals.

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

Official recipient, money, tax, valuation, advantage/benefit, eligible amount,
issuer, jurisdiction, serial, signer, correction, required disclosure,
aggregation, and applicability truth MUST be source-owned or code-pack-owned.
Templates MAY style purpose-approved presentation roles and MAY add approved
supplemental content, but MUST NOT calculate, hide, replace, contradict,
reorder outside required roles, or conditionally suppress protected truth.

Optional tenant content MAY use only purpose-approved sentence-shaped tests:
has value/is empty, boolean yes/no, and equality/inequality to one explicit
single-select option. It MUST NOT compare money, dates, identifiers, or protected
facts or compose arbitrary Boolean logic.

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

Drafts MUST use soft, expiring single-writer presence hints plus server-enforced
revision compare-and-swap conflict handling. Presence MUST be advisory only: it
MUST NOT grant edit authority, reserve ownership, hard-lock another authorized
author, or survive its bounded expiry. Every save MUST supply the expected
revision; a mismatch MUST preserve the submitted work for explicit conflict
resolution and MUST NOT overwrite the current revision. Commit MUST freeze an
immutable candidate with its complete dependency graph, semantic and visual
diff, impact, synthetic fixtures, exact proof, and validation evidence.
Publication MUST advance one scoped head atomically only after its server-derived
standard or protected floor passes.

A protected change MUST require a different currently authorized human and the
required step-up. Actor labels, client flags, edit size, split edits, role
switching, shared identities, or indirect dependency changes MUST NOT lower the
floor. Published content MUST NOT change in place. Restore MUST create a new
draft and rerun current proof.

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

Before creating a Generation Request, the server MUST resolve the deliberate
configured assignment and configured ancestor inheritance to one expected
primary; that MUST be normal resolution, not recovery. Only when the expected
primary cannot be admitted and the purpose permits recovery, the server MUST
evaluate this closed code-owned order: first, at most one affirmatively current-
compatible prior publication at the same exact scope and locale; second, at most
one purpose-permitted ancestor publication in the exact locale. The first
compatible candidate MUST win, so a compatible prior MUST win when both
candidates pass. Recovery MUST NOT select a sibling Site, foreign-locale
publication, protected Asym system publication, recursively scan history, score
candidates, mix fragments, use a draft, downgrade output, or use another
renderer. A bilingual or multilingual publication MUST be deliberately
published and fully proved for its exact locale contract; it MUST NOT be
synthesized through cross-locale recovery. Tenants MUST NOT configure, reorder,
or extend recovery through a routing DSL or setting.

Compatibility MUST positively prove tenant, environment, Site, issuer,
jurisdiction, purpose, document class, facts/correction semantics, legal blocks
and review, serial/signer authority, locale/legal language, output profile,
renderer, compiler, fonts/assets, privacy, recipient authority, quarantine, and
safety generations. Unknown MUST be incompatible.

Resolution and request freeze MUST be one logical admission operation. After
freeze, transient retry MUST use identical pins. A safety-live change MAY stop
unissued work but MUST NOT mutate pins. A successor request MAY re-resolve only
after definitive proof that no artifact, issuance, or ambiguous outcome exists.

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

The Generated Document service MUST derive one permanent tenant-scoped semantic
operation identity and compare a versioned immutable-command fingerprint over
all authoritative pins. Repeating the same identity and fingerprint MUST return
or join prior work. Reusing the identity with any different pin MUST hard
conflict.

Every attempt MUST use database-time deadlines, bounded leases, monotonically
increasing fencing tokens, private token-owned staging, current-token phase
transitions, bounded backoff, and atomic canonical promotion. Caller disconnect
MUST detach only that waiter. Late, stale, canceled, or losing attempts MUST NOT
promote and MUST clean only their own staging objects.

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

Before official rendering launches, the platform MUST freeze and hash a contest
charter covering exact candidate family/build/deployment, fonts/assets/options,
open and held-back synthetic corpora, semantic requirements, validators,
reviewers, equal tuning budget, hard gates, scorecard, tie-breaker, resource
budgets, evidence format, and stop conditions.

The finalists MUST be one exact Prince-family deployment and Typst 0.15.1.
Chromium MUST remain preview/control only. Hard gates MUST precede scoring and
cover protected-fact completeness, long-document layout, international text,
PDF/UA and required PDF/A, assistive technology, sandboxing, deterministic
evidence, failure recovery, scale/cost, and provider security/privacy.

The contest MUST produce at most one production winner. If no candidate passes,
official rendering MUST remain disabled. The losing runtime MUST NOT ship, and a
winner outage MUST NOT trigger cross-engine fallback.

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

Every human-facing publication MUST produce exactly one recipient-usable
canonical PDF. The purpose MUST select either `accessible-v1` (PDF 1.7 plus
PDF/UA-1 and applicable WCAG 2.2 AA outcomes) or `accessible-archive-v1` (the
same requirements plus PDF/A-2a). No caller, tenant, template, route, or provider
may select or downgrade the policy.

The system MUST render, apply all required byte-changing finalization, validate
the exact final bytes, run product accessibility checks, calculate SHA-256 and
length, store privately under an opaque never-reused identity, read back and
verify, then atomically promote. No byte-changing step MAY follow validation and
hashing. Passing a metadata declaration or renderer option MUST NOT count as
conformance proof.

Every canonical artifact SHA-256 MUST join the platform's existing shared,
append-only, externally anchored audit-checkpoint capability. Checkpoint coverage
MUST be exactly `anchored` or `unanchored_pending`. External anchoring MAY occur
after promotion and MUST NOT block or change artifact readiness, issuance,
receipt currentness, or authorized access. A delayed checkpoint MUST create one
owner-visible evidence exception and idempotent reconciliation against the same
hash. Later anchoring MUST NOT rewrite bytes, regenerate or reissue the document,
change its identity, serial, signer, or current head, or create a Phase 18
signing/sealing service.

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

A logical document MUST have at most one current eligible publication. Current
MUST be source/purpose-authorized and MUST NOT mean merely newest. A correction,
void, cancellation, or replacement MUST preserve exact predecessor bytes and
append immutable lineage; it MUST NOT edit history.

Copies, downloads, prints, and resends MUST reuse exact current bytes. A source
correction MUST create a successor only under its purpose and issuance contract.
The predecessor may remain current during preparation only when that contract
permits it. Atomic promotion MUST never expose two current artifacts.

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

The code-owned U.S. pack MUST cover source-approved monetary and annual
acknowledgments, goods/services and quid-pro-quo cases, eligible intangible
religious benefits, ordinary noncash/stock/digital-asset descriptions,
DAF/pass-through separation, QCD acknowledgment, and correction behavior.

The pack MUST distinguish the gross-payment quid-pro-quo disclosure test from
the eligible-contribution acknowledgment test and MUST NOT aggregate separate
gifts merely to cross a single-contribution threshold. Ordinary noncash output
MUST describe property and MUST NOT disclose internal, appraised, proceeds, or
donor-claimed value.

Uncommon federal or state duties MUST use one closed, append-only Specialist
Document Obligation with source/policy revision, reason, owner/capability,
deadline provenance or no-fixed-deadline, required evidence, status, and one
next action. It MUST NOT be dismissible, force-closeable, or disguised as the
ordinary acknowledgment.

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

Each native logical U.S. acknowledgment MUST receive one immutable reference in
display form `ACK-XXXXX-XXXXX`. The stored token MUST be exactly ten uppercase
Crockford Base32 characters generated from 50 unbiased CSPRNG bits and protected
by one named global uniqueness constraint. Only collisions on that constraint
MAY draw another candidate, with five total attempts. Other database failures
MUST fail normally.

The Generated Document service MUST allocate the reference only after admitted
request freeze. A source domain, template, renderer, caller, or staff-entered
value MUST NOT choose or reserve it.

The reference MUST encode no business information and MUST NOT authorize access.
Input normalization MAY accept case, ASCII spacing/hyphens, and the documented
`O→0` and `I/L→1` aliases; fuzzy, partial, nearest, Unicode-confusable, and
autocomplete matching MUST be rejected. U.S. correction MUST keep the base and
create the next immutable `vN`; a source-declared new legal document MUST create
a related new chain.

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

A tenant without a deliberately activated Canadian issuer pack MUST have no
Canadian navigation, rows, joins, fields, filters, export columns, jobs, scans,
queues, warnings, alerts, donor prompts, serials, signer objects, artifacts, or
meaningful performance change. Country, currency, locale, Site, donor address,
template, plan, import, clone, and caller input MUST NOT create or activate it.

An authorized administrator MAY start one private issuer-scoped four-task setup:
verify registered charity; authorize signer and records; review appearance and
languages; confirm serial continuity and prospective activation. Activation
MUST compare-and-set the exact issuer revision, full registration account,
status/receipting privilege, issue locality, records posture, signer authority,
pack/publication versions, safe initial serial position, proof digest, actor
capability, and lifecycle epoch.

The records-readiness proof MUST be finite, current, and bound to the exact
issuer and environment. Before activation or continued new official-receipt
issuance it MUST prove: required production primary and backup/recovery custody
are located in Canada, not merely electronically accessible from Canada; the
production document and register are readable; the approved production and
recovery paths can decrypt them; a representative restore reproduces the exact
readable artifact and governing metadata; and an authorized tenant actor has
acknowledged through versioned evidence that a service provider does not remove
the charity's records responsibility. Missing, expired, indeterminate, or
drifted proof MUST block only new affected Canadian issuance with one repair
action. It MUST NOT change existing receipts or create any Canadian state, work,
or UX for a nonparticipant.

The active pack MUST natively handle cash/noncash crossed with advantage/no
advantage, individual and nonoverlapping cumulative cash coverage, ordinary
approved Quebec presentation, cancellation, and formal replacement. Pending or
processing payment, unresolved true donor/address/value/advantage, unsupported
property/regime, or missing issuer/signer/records/delivery proof MUST issue no
official receipt.

Canadian official production and notice-plus-protected-access MUST remain dark
until one exact current qualified federal and, where applicable, Quebec legal,
privacy, security, records, accessibility, and operational review approves that
route under enacted and commenced law. Proposed law MUST NOT activate behavior.
Direct Canadian attachment delivery MUST remain a separately dark capability
until its own exact protocol receives the same level of approval. These gates
MUST NOT alter gifts, non-tax confirmations, lawful portal/paper recovery, or
nonparticipating tenants.

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

Each full Canadian registration account MUST have at most one active native
`ca_r_v1` authority. Its visible serial MUST be `R-` plus a positive integer with
a six-digit minimum width and no reset or artificial ceiling. After the source
authorizes issuance and supplies the exact issuer, recipient, and coverage facts,
the Generated Document service MUST reserve one next ordinal through Phase 18's
code-owned D11 allocator in a short exact-issuer transaction after request freeze
and before serial-bearing render. It MUST NOT preallocate ranges, render inside
the lock, permit manual next numbers, or reuse a committed ordinal. Phase 18 MUST
own the serial's nonreuse/disposition register and exact issuance/artifact
linkage; that mechanical ownership MUST NOT decide source-owned issuance validity
or correction/void/cancel/replace effect. Templates, renderers, clients, staff,
and source-domain commands MUST NOT allocate or disposition a serial.

Every reservation MUST have a truthful disposition. An exact current copy MUST
reuse bytes and serial. A formal replacement MUST receive a new serial, cite the
cancelled predecessor, and leave the predecessor current until successor
promotion when the source contract permits. Activation MUST prove a safe native
initial position for the issuer; inability to prove it MUST block and require
qualified review rather than build an importer or guess.

The exact issuer MUST own one current immutable Authorized receipt signer and at
most one ready nonoverlapping successor. The protected block MUST render the
sanitized private raster mark plus real accessible name/title text. Templates,
Sites, locales, batches, staff accounts, and callers MUST NOT select a signer.
Every issuance MUST re-prove the authority epoch. The system MUST NOT require
tenant PKI or mislabel platform integrity evidence as the human's digital
signature.

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

Every portal, guest, staff, print, full-file, and range request MUST reauthorize
tenant, environment, exact issuer, purpose, recipient Party or evidenced
representative, contact-authority epoch, logical current state, artifact health,
and records/access state. Opaque IDs, references, household membership, fund
visibility, service-role storage access, and possession of a provider URL MUST
NOT authorize access.

Each Document Purpose Contract MUST code-own one access assurance:
`mailbox_capability_permitted` or `authenticated_portal_required`. Tenants MUST
NOT choose assurance per document. A signed-in authorized principal MUST continue
through ordinary portal authority without a second document challenge. A wrong
signed-in account MUST NOT claim or attach the document; an independently
eligible guest capability MUST remain isolated. Elevated-risk or disputed
authority MUST use the authenticated portal or evidence-bound service desk, not
security questions, same-email OTP, browser fingerprinting, or default MFA.
The guest capability proves possession of a current authoritative-mailbox
capability, not civil identity or proof that the named donor acted.

All bytes MUST stream through the Asym boundary from one private immutable object
with exact generation, SHA-256, and length proof. Every protected landing,
redirect, error, session, full-file, and range response MUST set
`Cache-Control: private, no-store, no-transform, max-age=0`,
`CDN-Cache-Control: no-store`, and `Vercel-CDN-Cache-Control: no-store`; MUST
omit public/raw signed storage URLs; and MUST prevent CDN, browser, service
worker, optimizer, stale fallback, or intermediate transformation/caching.
Missing or corrupt bytes MUST fail closed without rerender.

Access MUST use the stored promotion-time generation, SHA-256, length, and
read-back evidence plus current object-generation/length checks rather than
rehashing the entire PDF on every read. Periodic and restore/custody-change
integrity scrubs MUST detect latent corruption. The current official artifact
MUST remain available through the portal while it is lawfully retained and the
viewer remains currently authorized; grant expiry MUST NOT expire the document.

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

Every producer-owned protected action, including document access, MUST use the
same corrected shared protocol. The trusted Asym action's HTTP URL MUST contain
only a non-secret selector; its URL fragment MUST contain an independent 256-bit
verifier. The server MUST store only a versioned digest/HMAC of the verifier.
The verifier MUST NOT enter request paths/queries, logs, analytics, referrers,
communication history, storage URLs, provider URLs, or support tools. There MUST
be no query-string or raw-path-secret fallback.

A minimal first-party, third-party-free landing page MUST immediately remove the
fragment from browser-visible history and submit it only through a deliberate
same-origin, CSRF-protected POST. Its CSP MUST permit only the reviewed nonce- or
hash-pinned minimal same-origin script; third-party scripts, analytics, remote
resources, and service workers MUST be absent; and
`Referrer-Policy: no-referrer` MUST be set. `GET`, `HEAD`, scanner, preview,
crawler, tracking, selector-only, and failed-verifier traffic MUST disclose no
protected facts, touch no protected resource, consume no grant, create no
authorized session, and prove no human intent.

The product MUST describe this control as scanner-resistant, never scanner-proof.
Even a successful exchange MUST NOT be evidence that a human or the named donor
acted.

The shared exchange MUST atomically re-prove the producer-owned purpose contract,
tenant, Party or other purpose-owned subject, exact protected resource, current
authorization, expiry, revocation, and replay state. Each producer MAY add only
its own typed checks after that common boundary. Document access MUST also
re-prove environment, exact issuer, logical document and current head, recipient
Party or evidenced representative, contact-authority epoch, artifact health,
and records/access state. Success MUST create one bounded secure host-only
HttpOnly purpose-scoped session or capability. The default document guest grant
MUST be fourteen days and the document session thirty minutes, subject to
production evidence. Routine replacement MAY briefly preserve only incumbent
plus newest grant and MUST retire the sibling on first successful redemption.
Authority loss, cancellation, compromise, or security revocation MUST invalidate
affected grants and sessions immediately. Routine replacement MUST NOT interrupt
an already-authorized short document session.

Every capability-bearing notice MUST hand off through Phase 17 as a
fact-minimized recipient-specific message using the verified sender profile and
durable local intent/outbox. Resend open and click tracking MUST be disabled and
proved off at activation, protected-batch start, and periodic drift checks
without a synchronous provider lookup on every send. Provider keys and verified,
deduplicated, order-independent webhook reductions MUST remain subordinate
evidence. Resend and appropriately privileged tenant Resend administrators'
ability to process or preview the capability-bearing message MUST be disclosed
as residual processor risk rather than denied.

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
  reconciles through the same Phase 17 semantic identity

### Requirement: Document Access Is Calm Role-safe And Recoverable

The code-owned starting policy MUST disclose a fourteen-day guest grant and an
absolute thirty-minute document-only session, subject to the frozen production
usability/security evidence. Expiry MUST end only the ability to begin a new
guest retrieval; it MUST NOT erase the document, close bytes already fetched,
or remove lawful authenticated-portal availability. Expired, used, revoked,
unknown, and denied states MUST be non-enumerating and offer only fixed-
destination **Send new secure link**, ordinary portal, verified help, and
paper/assisted access. No public email-address field or tenant TTL/password/link-
policy builder is permitted.

The notice MUST show the exact link-expiry date and explain that the document
does not expire with the link. It MUST use one recognizable issuer, one
descriptive action on the fixed reviewed Asym origin, no shortener or tracking
redirect, and no amount, address, serial, or tax detail in subject or preheader.
The protected surface MUST show one current-document card with **Download
official PDF**, **Print**, precise corrected/cancelled/unavailable language, and
consistent help. It MUST NOT present accessible, email, portal, archive,
historical, or storage copies as peer files.

Authorized staff MUST receive one masked fixed-destination panel with **Send new
secure link**, permissioned exact download/print, and a separate security-revoke
action. They MUST NOT see a bearer verifier or arbitrary-address shortcut. Joint
donors and authorized organization contacts MUST receive independent grants to
the same exact artifact; one recipient's bounce, redemption, resend, or routine
revocation MUST NOT consume another recipient's authority. Missionaries MUST
receive no donor address, grant, provider/access detail, PDF, resend, or revoke
control unless a separate purpose and capability explicitly authorizes a passive
artifact state.

One issuer-scoped containment command MUST stop new guest grants and revoke
active guest access without changing artifacts, serials, receipt validity,
evidence, or lawful portal/paper recovery. One platform emergency command MUST
contain a proven cross-tenant access flaw. The product MUST NOT add custom link
domains, tenant cryptography, CAPTCHA by default, device fingerprinting, folders,
sharing permissions, download-prevention claims, DLP, a bespoke viewer, shipping
suite, second operations dashboard, or new identity platform.

The complete notice, doorway, fixed recovery paths, current-document view, staff
panel, and recipient-role behavior MUST meet WCAG 2.2 AA and pass keyboard,
screen-reader, 400% reflow, forced-color/high-contrast, reduced-motion, mobile-
webview, older-donor, and supported real-mail-client proof.

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

Single, scheduled, API, and batch generation MUST use the same purpose, facts,
publication resolution, request, issuance, renderer, artifact, and authorization
contracts. A batch MUST freeze its source-owned item set or cutoff, candidate
policy, publication graph, and item semantic identities before execution.

Each item MUST own its exact outcome. Successful and ambiguous items MUST NOT be
rerun. **Retry failed items** MUST reuse exact pins for eligible failures.
Proof-gated preparation of waiting items MUST be a distinct operation. Mixed
results MUST yield aggregate progress and Completed with issues, with blockers
grouped by root cause rather than one notification or task per recipient.

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

Every purpose MUST bind one reviewed effective-dated Records Schedule Contract
over the closed v1 obligations: canonical artifact, issuance lifecycle evidence,
source-owned financial facts, template/render validation evidence,
delivery/access/security evidence, privacy/hold/disposal evidence, and temporary
authoring/render material.

Each obligation MUST retain its schedule version, authoritative typed trigger,
owner, preservation floor, privacy ceiling where applicable, permitted bounded
extension, custody/location, access/use restriction, hold, recovery, and
disposal rules. An unresolved floor/ceiling conflict MUST become Needs records
review with restricted access, not automatic deletion or forever retention.

A later law, policy, or provider change MUST create one bounded impact set and a
qualified-reviewed, effective-dated successor Records Schedule Contract. Its
recalculation command MUST carry an idempotency identity and expected prior
schedule version. Duplicate delivery MUST return the same transition; a stale
expected version MUST fail without changing records. Every affected record MUST
preserve its prior schedule/version/trigger evidence and append the successor
result. The transition MUST NOT silently rewrite history or leave affected
records on an obsolete rule forever. A shortened result MUST enter the ordinary
access-restriction, grace, final current-rule/no-hold reproof, and verified-
disposal lane; it MUST NOT trigger immediate mass deletion.

One permissioned Records disclosure MUST show the controlling purpose and
authority, resolved trigger and dates, schedule version, and plain-language
explanation. Records administrators MAY choose only a bounded extension
enumerated by the controlling contract, with its documented basis and expected
schedule version; apply or explicitly release an authorized scoped hold; and
export tenant- and issuer-scoped custody/disposition evidence. Every accepted
mutation MUST append actor, authority, basis, controlling schedule version,
prior/resulting dates, and time. The server MUST reject a stale expected schedule
version, floor weakening, unsupported or unbounded/forever extension, per-
document retention timer, direct object deletion, and privacy-ceiling breach
without separately reviewed lawful basis.

Holds MUST be monotonic, typed, scoped, evidence-bound, owner-bound, reviewable,
and explicitly released. A review due date MUST NOT auto-release a hold or
broaden access. Hold placement and final irreversible disposal MUST serialize on
the same tenant/record guard.

Disposal MUST proceed through access restriction, grace, final current-rule and
no-hold CAS, exact-version destruction across owned primary/derived copies,
backup expiry or suppression, verification, and minimal PII-light evidence. The
retained proof MUST allow only record class, tenant/issuer, schedule version,
reason code, operation/time, copy-class outcomes, and the narrow D11 nonreuse
disposition. It MUST exclude names, addresses, amounts, filenames, storage paths,
rendered content, raw Party IDs, and raw hashes, and MUST bind its own bounded
Records Schedule Contract. Every restore MUST replay the forward-only
suppression journal before reads or workers resume. Phase 18 MUST NOT cascade
deletion into another domain's facts.

Before ordinary application access ends for an activated Canadian issuer,
tenant closure MUST complete exactly one of two durable outcomes: a verified
destination-custody transfer preserving the exact issuer, immutable history,
holds, access restrictions, and readable records; or an explicit restricted
records-only custody agreement preserving those same obligations. Without one
verified outcome, closure MUST remain incomplete with one records-owned repair
action and MUST NOT delete, strand, or silently relocate the records. This
closure contract and all related UI, rows, queries, jobs, and alerts MUST remain
absent for Canadian nonparticipants.

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

Publishing now MUST remain the default. Each tenant/environment/purpose/
jurisdiction/scope/locale/document-class head MAY have at most one unresolved
future appointment targeting one exact immutable ready candidate. The
appointment MUST bind the expected head, candidate and dependency graph,
required review, civil date/time, IANA zone, displayed offset, resolved UTC
not-before instant, time-zone database generation, impact evidence, completed
approval, and governance generations. The approved UTC instant MUST remain fixed.
A later material time-zone-data interpretation change MUST mark the appointment
Needs attention and MUST NOT recalculate or move that instant.

Completed approval MUST survive ordinary reviewer offboarding and unrelated role
or account changes. A separately authorized security or governance invalidation
MUST be append-only, attributable, and block execution. While a different
candidate has an unresolved appointment, an attempted immediate publication MUST
require an explicit choice between **Keep scheduled change** and **Publish now
and cancel scheduled change**; it MUST NOT silently rebase the appointment to the
new candidate or head.

Scheduling MUST enforce a five-minute minimum lead and five-year maximum horizon.
Nonexistent or repeated civil times MUST require an explicit valid choice.
Protected time changes MUST receive current independent review. At due time, one
idempotent head-local command MUST re-prove the finite safety-live contract and
advance by compare-and-set. Transient recovery MUST stop after twenty-four
hours. Failure MUST leave the prior head and create one grouped exception.

Cancel, reschedule, and Publish now instead MUST preserve append-only evidence
and prevent later timer action. There MUST be no recurrence, release bundle,
multiple queued versions, scheduled unpublish, auto-revert, condition, custom
retry policy, or force publish.

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

The system MUST record append-only tenant- and purpose-scoped evidence for state
transitions, versions, attempts, fences, dependencies, validation, object
integrity, issuance links, access, records, and appointments without storing
rendered bodies, donor facts, secrets, raw storage URLs, signature images, or raw
provider errors in routine logs.

Every terminal failure MUST map to one authoritative stage, stable reason,
owning domain/team, and one safe repair action. Reconciliation and alerts MUST
cover stale requests/attempts, orphan staging, artifact/hash drift, invalid heads,
serial/coverage/signer invariants, access-grant anomalies, queue fairness,
appointment backlog, hold/disposal drift, and restore suppression. Healthy
automatic retries and compatible resolution MUST remain quiet.

Generated, source-issued, current artifact available, notice prepared, provider
submitted, Resend accepted, recipient mail server accepted, bounced/suppressed/
delayed, preflight observed, session granted, exact-byte response started/
completed/failed, download initiated, paper prepared/posted/returned/handed over,
and jurisdictionally determined delivery MUST remain separate typed facts. No
state, event, label, metric, or dashboard MUST claim that a donor received,
opened, read, understood, retained, or filed a document unless a separately
governed rule and exact evidence authorize that meaning.

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

Before destructive cutover, a server-authoritative gate MUST prove the target
environment is non-production and contains no real tenant, irreplaceable
artifact, externally relied-upon history, or production dependency. Any positive
or indeterminate result MUST stop the line and require explicit re-grooming.

On a proved disposable environment, the platform MUST create only the final
canonical schema and remove every live text receipt/statement builder, hard-
coded receipt sender, snapshot/scaffold artifact authority, Unlayer/native
switch, mutable production root, browser-supplied official context, broad direct
write, provider-URL artifact truth, duplicate status, and alternate route.

The platform MUST NOT build a legacy data/document importer, archive, adapter,
alias, compatibility view, migration report, migration quarantine/repair UI,
dual read/write, shadow migration, fabricated history, or speculative future-
import field. The narrow Asym-native semantic-template package above is an
authoring portability boundary, not a legacy cutover or foreign conversion path.

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

Primary behavioral tests MUST exercise the Generated Document service with a
tenant/actor-scoped purpose, source facts/issuance-authorization reference, and
semantic operation identity, then observe product state, timeline, logical
current head, any Phase 18 identifier/disposition, and authorized exact bytes.

Subordinate release proof MUST include: the exact renderer corpus; real
Postgres/Supabase constraints, RLS, serial, claim, CAS, hold, and disposal tests;
and thin route/component/browser tests for roles, headers, one-document UX, and
accessibility. Service tests MAY fake renderer, object store, clock, and IDs
deterministically, but database guarantees MUST use the real database.

Production MUST remain blocked if the renderer has no winner; required PDF/UA,
PDF/A, font, sandbox, determinism, or load proof fails; current qualified legal
review is missing; issuer/serial/signer/facts/issuance authority is unresolved;
exact-byte proof is missing; tenant isolation or access fails; records/hold/
restore/disposal proof fails; an activated Canadian issuer lacks exact current
primary-and-backup Canada-location, production-readability, decryption,
representative-restore, or tenant-responsibility proof; or the destructive-
cutover premise is false.

#### Scenario: A mocked unit suite passes but real RLS fails

- WHEN deterministic service tests pass but a real-database hostile tenant test
  can cross a scoped relationship or object boundary
- THEN release remains blocked
- AND the unit result cannot waive the database proof

#### Scenario: The full U.S. tracer passes

- WHEN one source-approved U.S. contribution crosses publication resolution,
  request freeze, rendering, exact validation/storage, issuance linkage,
  staff/donor access, Phase 17 delivery and resend, and source correction
- THEN every phase observes one logical document and the expected immutable
  lineage
- AND every download and resend resolves the exact expected bytes
- AND no prototype path participates
