# platform-product-intent normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-00ad7ddda9f8d69732f9"></a>

## Audience Service And Tradeoff Priority

<!-- BEGIN CONTRACT {"id":"00ad7ddda9f8d69732f9","name":"Audience Service And Tradeoff Priority"} -->

The platform MUST serve the ministry as a whole, including organizational
staff, missionaries, donors, and public visitors.

When tradeoffs are ambiguous, agents MUST apply the canonical priority ladder
defined in `platform-principles`. Within a safe and permitted path, the
sharpest product instance of that ladder is donation-flow integrity: a donor
must be able to give with confidence through the tenant website, and gifts must
remain accurate, clearly designated, clearly reflected across the platform, and
followed by the right donor-facing confirmation and record trail. Accuracy,
trust, and financial clarity MUST take priority over any one group's
convenience.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-0355e426551c156dfd70"></a>

## Long-Horizon Success

<!-- BEGIN CONTRACT {"id":"0355e426551c156dfd70","name":"Long-Horizon Success"} -->

Over time, success MUST be recognizable first in ministry outcomes:
missionaries reach and sustain full support, and each tenant runs its whole
operation confidently in one connected system.

Strong donor retention, low friction, user joy, platform coherence,
operational completeness, trust, fewer disconnected tools, and clearer
support-raising and administrative workflows SHALL be treated as contributing
signals beneath those outcomes, not as the outcomes themselves.

Success MUST NOT be defined only by shipping volume or raw feature count when
those measures would mask fragmentation, weak operations, or eroded donor
confidence.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-082ed91c632be9444cb9"></a>

## Phase 4 Claim Safety Is Independent Of Entry Method

<!-- BEGIN CONTRACT {"id":"082ed91c632be9444cb9","name":"Phase 4 Claim Safety Is Independent Of Entry Method"} -->

Every qualified claim method MUST enforce the same exact fresh, single-use,
purpose-bound proof of control of the intended contact email/mailbox and current
claim/link policy. The platform MUST recognize but never reveal eligible guest
attribution and MUST keep public
entry enumeration-safe in response shape and timing intent for known and unknown
identities. Attribution, contact match, provider verified-email flag and staff
action MUST NOT substitute for claim proof or current protected-access admission.
A qualified email link and secondary code MUST consume one issuance once;
authentication alone MUST NOT establish claim or reveal history or saved methods.
Documenting a method MUST NOT activate it. Google, Apple and Facebook remain
selected optional donor-entry scope, each blocked until unresolved native G01
and its exact provider gates pass. Already-bound stable provider subject sign-in
MUST remain distinct from new email-matching attachment; no broker/fork or
email-only completion of selected scope is approved.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-124061655f11836c2178"></a>

## Offline Money Enters Only Through the Governed Batch-Commit Path

<!-- BEGIN CONTRACT {"id":"124061655f11836c2178","name":"Offline Money Enters Only Through the Governed Batch-Commit Path"} -->

Initial staff entry of offline gifts MUST flow through the single gift-entry-batch
commit service, the Phase 15 D1 front door. No other intake path MAY create an
offline contribution; Phase 39 offline mode MUST NOT acquire money-writing
authority. Validation MUST be non-mutating with
respect to money, receipt authorization, generated documents and delivery, and
MUST bind to the exact source revision. For the ordinary validate-to-post intent,
successful current validation MUST proceed through the same guarded commit
under the existing single per-batch confirmation when no reviewer is required.
That commit MUST consume valid current evidence and the accepted revision; it
MUST NOT create a second money-writing fast path. Every commit MUST retain the
source audit evidence. Current risk and new-operator rules MUST remain enforced:
a high-risk batch MUST route to a second reviewer, and enabled tenant approval
or quorum policy MUST also be satisfied before that same commit. Declared control totals MUST remain
frozen; a mismatch MUST block unless the distinct capability, reason and audit
requirements admit the governed override.

Staff-assisted Stripe card/ACH payments MUST retain their online provider-owned
Phase 13 posting path. Phase 15 MUST record the staff intent and exact qualified
link to its resulting contribution; a UI confirmation, processing response or
batch commit MUST NOT create a duplicate offline posting for those payments.

Posting and append-only correction MUST produce accepted source occurrences,
not receipt or delivery truth. Phase 7 MUST decide receipt eligibility, facts,
coverage and correction authority. Only an admitted request MAY produce a Phase
18 artifact transition or a Phase 17/6 governed notice. Receipt-affecting
classification MUST NOT itself authorize issuance, invent a prior artifact,
or bypass a current issuer/purpose hold. Uncovered `annual_cumulative_cash`
occurrences MUST create no per-gift receipt authorization, artifact or delivery;
corrections to already issued cumulative coverage MUST retain that owner's
exact coverage and correction contract. Staff-correction approval separately
follows Phase 28 D48's settled organization policy; current authority and any
required independent approval remain mandatory, and policy changes never
automatically execute pending work.

Detailed behavior is specified in
`docs/prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md`.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-1903dbb11d79aa80df76"></a>

## Phase 4 Identity Experiences Use The Verified Tenant Host And Account Brand

<!-- BEGIN CONTRACT {"id":"1903dbb11d79aa80df76","name":"Phase 4 Identity Experiences Use The Verified Tenant Host And Account Brand"} -->

Auth email, login, claim, verification, recovery and portal experiences MUST use
the current verified Tenant Donor Portal Host and Tenant Donor Account Brand.
Default or entry Site and untrusted context MUST NOT reskin identity or select
Tenant, membership or authorization. Donors MUST see no platform chrome or
cross-Tenant portal surface; required legal, merchant, processor, payment,
security and accessibility disclosures MUST remain truthful. Host and brand
MUST NOT grant access. Identity communications MUST retain the identity producer
and purpose authority → Phase 17 immutable preparation and bounded sender →
Phase 6 sole dispatch and history contract. Missing or wrong trusted context
MUST fail closed with no default brand, default sender or direct-send fallback.
Provider-owned consent MAY retain only IC05's qualified provider/application
identity exception; it MUST NOT replace the Tenant identity experience.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-30b63ab3f908d435f3e8"></a>

## Phase 4 Path 2 Keeps Every Tenant Claim And Access Isolated

<!-- BEGIN CONTRACT {"id":"30b63ab3f908d435f3e8","name":"Phase 4 Path 2 Keeps Every Tenant Claim And Access Isolated"} -->

The platform MUST maintain separate donor records, memberships and claims per
Tenant even when native authentication uses a shared credential. The credential
MUST authorize nothing on its own. Cross-Tenant donor linking, merge, dedupe and
donor single-view MUST NOT occur. Protected access MUST independently prove one
validated current context, exact personal or represented subject, purpose and
source admission through the existing Phase 12 decision and Phase 3 projection
boundary. Record-only or document admission MUST NOT widen to history, wallet
or lists; an unrelated role or relationship MUST provide no fallback authority.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-3be33f8ab38e52534606"></a>

## Phase 4 Preserves Permanent Unclaimed Donors And Optional Exact Claiming

<!-- BEGIN CONTRACT {"id":"3be33f8ab38e52534606","name":"Phase 4 Preserves Permanent Unclaimed Donors And Optional Exact Claiming"} -->

The platform MUST preserve a permanent, first-class unclaimed donor record
without a login and MUST permit guest giving without forcing a claim. Contact
capture and guest attribution MUST NOT create login, claim or protected access.
Initial binding MUST require fresh, single-use, purpose-bound proof of control of
the intended contact email/mailbox for the exact intended same-Tenant person and
current owner claim/link policy. Native authentication, accepted historical claim
proof, current contact-email revision
and verification, and current authorization MUST remain distinct. An established
claim MUST survive contact changes; a newly matching email MUST NOT displace a
different established claim. Every protected request MUST independently satisfy
current Phase 12 context, exact subject, purpose and source admission.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-41628690c5dd9ca70380"></a>

## Mission And Scope

<!-- BEGIN CONTRACT {"id":"41628690c5dd9ca70380","name":"Mission And Scope"} -->

Asymmetric.al MUST exist as an all-in-one platform for Christian missions
organizations at any scale. It SHALL bring together the core ministry
operations and engagement tools those organizations need in one connected
system, including fundraising, donor experience, missionary experience,
operational records, public content, communications, documents, reporting, and
automation.

The primary tenant is a missions sending organization whose missionaries raise
personal support: sending agencies, church-planting networks, and
denominational boards at any scale within that operating model. Churches and
other ministries are in scope when they operate a sending program. An
individual missionary is a user inside a tenant, never a standalone tenant.

The platform MUST exist to replace fragmented, clunky, manual operational
tooling with one connected system that reduces friction, reduces tool sprawl,
reduces manual glue work, and keeps important tasks clear and easy to complete.

The product MUST be purpose-built for the support-raising operating model of
Christian missions sending organizations. It MUST NOT be treated as generic
nonprofit software with faith language added on top.

The deepest ministry outcome is not merely saving time. The platform SHALL
remove friction so people can stay focused on ministry: fewer clicks, clear
next steps, and intuitive task completion matter because lower friction
improves donor follow-through, missionary support, ministry capacity, and focus
on the Gospel rather than on the tool itself.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-4a4ea75f8ff021d3d689"></a>

## Generated Documents Preserve Source Truth And Exact Artifact Authority

<!-- BEGIN CONTRACT {"id":"4a4ea75f8ff021d3d689","name":"Generated Documents Preserve Source Truth And Exact Artifact Authority"} -->

Phase 18 (Receipt & PDF Template System) MUST provide one canonical Document
Production capability and one product-level Generated Document service. It MUST
keep immutable Document Definition Publication, source-owned Facts Package,
idempotent Generation Request, optional source-authorized Issuance, and exact
private Artifact as separate durable authorities. Source domains MUST own
eligibility, whether and why issuance/document identity is required, exact
issuer/recipient/coverage facts, issuance validity, and correction/void/cancel/
replace authorization and effect. Phase 18's code-owned jurisdiction/identity
contract MUST own `ACK-*` and exact-issuer `ca_r_v1` allocation, reuse/nonreuse,
disposition, and artifact linkage. Render Attempts MUST remain subordinate
technical evidence, and Phase 17 Delivery MUST remain an external linked
authority. No send, bounce, preview, download, print, or retry may create or
alter source facts, issuance validity, logical-document identity, or exact
artifact truth.

Templates and renderers MUST consume only a typed immutable purpose-scoped Facts
Package. They MUST NOT query mutable source records, select the donor or
statement population, decide eligibility or jurisdiction, calculate official
money, allocate a legal identifier, or alter correction/cancellation meaning.
Only the Generated Document service MAY allocate a Phase 18 reference or serial,
after admitted request freeze and before identifier-bearing render.
One pre-registered production-shaped evidence contest MUST yield at most one
qualified production renderer. Each human-facing publication MUST produce one
current canonical accessible PDF; purpose-required archival conformance MUST be
a property of those same exact bytes rather than a peer recipient file.

Tenant authoring freedom MUST remain inside versioned Document Purpose Contracts,
Approved Data Views, protected truth, immutable publication, code-owned U.S. and
opt-in Canadian jurisdiction packs, current-object authorization, purpose-owned
records schedules, and proof-gated release. Staff MUST use one Templates/
Documents/Batches product, and an authorized recipient MUST see one logical
document with one current PDF action. Historical or corrected artifacts MUST
remain exact immutable evidence without appearing as competing current files.

Because Conrad confirmed no production users or irreplaceable generated
artifacts exist, the initial cutover MUST use a server-authoritative
environment/data/dependency gate and then remove every prototype receipt,
statement, template-render, snapshot, scaffold, live-text, hard-coded-send,
provider-URL, and alternate reader/writer path. If the gate is positive or
indeterminate, destructive work MUST stop for re-grooming. The platform MUST NOT
ship a legacy importer, compatibility view, archive, dual path, shadow
migration, or fabricated history.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-510717beddda641927df"></a>

## SiteStacker Parity Is An Outcome-Parity Program

<!-- BEGIN CONTRACT {"id":"510717beddda641927df","name":"SiteStacker Parity Is An Outcome-Parity Program"} -->

The platform MUST pursue SiteStacker parity as an outcome-parity program: it
MUST match what SiteStacker/WMTek lets a Christian missions organization
accomplish, built on the platform's own model, rather than cloning SiteStacker's
screens. Parity work MUST stay governed by the existing platform boundaries and
surface ownership — it MUST NOT bolt on disconnected modules and MUST NOT push
admin depth into donor or missionary surfaces. Each parity area MUST be
benchmarked against cited official SiteStacker documentation (or explicitly
marked not-yet-sourced) and MUST be tracked in the parity matrix with its built,
live, and confirmed status recorded separately. Per-area behavior MUST be
specified in its own accepted change before dispatch. Planning MAY precede
implementation and MUST NOT be represented as shipped functionality. Child
sponsorship is out of scope.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-649d3bf8e15cdfd22875"></a>

## Non-Goals And Scope Discipline

<!-- BEGIN CONTRACT {"id":"649d3bf8e15cdfd22875","name":"Non-Goals And Scope Discipline"} -->

The core repo MUST NOT become a catchall for unrelated products, generic SaaS
experiments, disconnected side tools, unrelated church software, unrelated
nonprofit products, or standalone microsites detached from the
mission-organization operating model.

Agents MUST guard against the dominant failure mode: treating this like generic
SaaS and solving problems with disconnected features, workaround logic scattered
across the codebase, one-off fixes, or local optimization that damages platform
coherence.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-79d05e9fd14bd05f6279"></a>

## AI Assistance Is A Core Product Direction

<!-- BEGIN CONTRACT {"id":"79d05e9fd14bd05f6279","name":"AI Assistance Is A Core Product Direction"} -->

AI assistance SHALL be a core differentiator of the platform, woven through
staff, donor, missionary, and public experiences wherever it reduces ministry
friction: drafting, suggesting, summarizing, routing, and preparing work so
people stay focused on ministry rather than on the tool.

AI ambition MUST stay inside the platform's trust boundaries. Any AI-initiated
effect that sends donor-facing communication, moves or records money, or mutates
operational truth MUST pass an explicit human approval gate before it takes
effect. AI-initiated publication of public content MUST respect the tenant's
configured publication and moderation boundary (see `platform-boundaries`),
requiring human approval wherever the tenant requires review rather than
overriding a tenant that has chosen automatic publishing. AI output MUST NOT
silently mutate operational truth, and AI behavior SHALL remain subject to the
canonical priority ladder, honest-state rules, and tenant moderation boundaries.

AI assistants that help staff, missionaries, or donors act within the
authority of the human they serve and are bounded by role and tenant scope, as
defined in `platform-boundaries`. They are not a separate permission tier.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-9475d9f5f1bcd7b6fd2e"></a>

## Unified Platform Span

<!-- BEGIN CONTRACT {"id":"9475d9f5f1bcd7b6fd2e","name":"Unified Platform Span"} -->

The platform SHALL unify four major areas at a high level as one ministry
system rather than four unrelated products:

- Mission Control / admin
- the public tenant website experience through one or more Tenant-owned Sites
- the donor experience
- the missionary workspace

Site SHALL be a first-class entity beneath Tenant for public presentation and
giving attribution. Every Tenant MUST have at least one Site and exactly one
Default Site, and MAY operate additional Sites. Site MUST NOT be a Tenant,
billing account, payment identity, Legal Entity, or authorization boundary.
Mission Control, Donor Portal, and Missionary Workspace MUST NOT be Sites;
donor accounts and authorized history SHALL stay Tenant-wide, with one Tenant
account experience that entry Sites neither fragment nor reskin.

Work inside the core repo MUST keep those areas aligned as one coherent
platform span. Agents MUST NOT treat any major area as an optional add-on that
can drift independently without an explicit product decision.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a80e1fa8ecf7b5303d94"></a>

## Recurring Support And Fixed-Total Pledges Preserve Separate Truth

<!-- BEGIN CONTRACT {"id":"a80e1fa8ecf7b5303d94","name":"Recurring Support And Fixed-Total Pledges Preserve Separate Truth"} -->

Phase 16 (Pledges & Recurring Commitments) MUST treat a recurring commitment
and a fixed-total pledge as separate operational aggregates. A recurring
commitment records repeated support without an explicitly promised cumulative
balance; a fixed-total pledge records an explicit cumulative promise. A
collection arrangement, provider subscription, mandate, invoice, payment
attempt, expected occurrence, fulfillment application, recognition record, or
posted contribution MUST NOT redefine one aggregate as the other. Only an
authoritative posted contribution records received money, and neither aggregate
MUST mint cash, a receipt, or an accounting entry merely because intent or an
expectation exists.

An online recurring arrangement MUST use one explicit recurring-giving group
with stable, independently manageable destination-line identities. A line-term
change MUST append a new effective line-term version; a calendar change MUST
append a separate schedule epoch. The schedule epoch is authoritative for the
calendar grid, while the matching line-term version is the frozen donor-
disclosure snapshot. They MUST agree at every effective boundary or fail closed.
Only compatible current line terms and schedule epochs MAY share a billing
cohort and its explicit provider execution legs; every line MUST retain an exact
provider-item binding in every applicable leg so one line cannot be mutated
through another. Ordinary cadences use one execution leg; twice-monthly uses two
monthly legs for the 1st and 15th without becoming two donor commitments.

The product-owned, effective-dated calendar schedule and named occurrence
ledger MUST remain authoritative for donor intent and scheduled execution.
Occurrence execution, provider-confirmed payment finality, canonical
contribution/ledger posting, and receipt eligibility MUST remain separate
folds. Provider success MUST NOT itself claim ledger posting, and ledger posting
MUST NOT move the schedule. Current tenant/account/mode binding, application
ownership, capability, provider-object, in-flight-work, and reconciliation
evidence MUST govern what Asym can prove about executor control. Donor-intent
lifecycle, schedule, occurrence execution, payment finality, ledger posting,
collection health, provider control/reconciliation, fulfillment,
communication eligibility, and projection freshness MUST remain separate axes
rather than one mutable pledge status.

Every commitment or pledge MUST have one immutable Commitment Party. Current
representative authority, service contact by purpose, expected remitter,
collection authorizer, posted legal donor, and recognition Party MUST remain
separate, effective-dated roles. Household membership, organization contact,
payment identity, DAF advice, remittance, recognition, and merge similarity
MUST NOT transfer or infer the Commitment Party or collection authority. A real
owner change MUST supersede the old aggregate and create a newly authorized
successor.

A fixed-total pledge MUST be total-first. Its optional plan MAY use one date,
even installments, or custom dates and MUST preserve any undated remainder.
Management MUST classify changes as donor-requested change, donor-requested
ending, internal expectation release, or entry correction; each classification
MUST use its own append-only fold and exact inverse/restore rules. No plan,
pledge, release, or correction may manufacture money, debt, recognition,
collection authority, or automatic reminders.

A separately authorized recurring line MAY fulfill a fixed-total pledge only
through an explicit, effective-dated, same-tenant link to one compatible fixed-
pledge line on a civil date. In v1, overlapping effective links for the same
recurring line and civil date MUST be rejected. The recurring fulfillment
application consumes source capacity exactly once; any fixed-pledge coverage is
an append-only temporal allocation to the exact then-current pledge plan and
target and MUST NOT consume source money or target capacity a second time.
Later pledge-plan versions MAY allocate only remaining capacity, and a reversal
MUST append the exact inverse rather than recomputing history.

Staff recurring service MUST independently prove operator capability, the
Commitment Party's instruction, and collection authorization. The server MUST
derive one of four truthful outcomes—Apply now, Complete with donor now,
Awaiting authorization, or Collection blocked—without making staff re-enter
raw card or bank credentials into Asym-owned fields. Broad staff access MUST
not become ambient authority, bulk widening, or a checkbox that manufactures a
card/ACH mandate.

Every material command or fulfillment operation MUST be tenant-scoped,
authority-bound, append-only, idempotent, revision-fenced, reconcilable, and
role-projected. Unknown provider control, identity, tenant, authorization,
payment outcome, matching evidence, or source freshness MUST fail closed rather
than guess. Detailed behavior is governed by
`docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md`
(Phase 16 (Pledges & Recurring Commitments)) and its dated 2026-07-13
cross-PRD congruence package.

Automatic fulfillment MUST use one of three independent closed application-proof types:
exact frozen provider lineage; an authenticated donor instruction with exact
source-to-target allocations; or an approved authenticated structured-remittance
source and immutable versioned exact-line mapping. Every path MUST re-prove
tenant, Commitment Party, currency, designation, source/target capacity, current
revision, and non-revoked authority. A structured source or mapping approval MAY
be narrowed, revoked, expired, or superseded prospectively, but MUST NOT rewrite
a completed application. One authenticated donor instruction MUST authorize at
most one original application. Source and mapping version/supersession identities
MUST be tenant-scoped and unique, their supersession chains MUST be acyclic, and
locked atomic approval/supersession MUST leave at most one current approved source
per source key and one current approved mapping per authenticated source-line
identity. Lifecycle commands MUST be permanently semantically idempotent.

An inverse or uncertain-vector retraction MUST use immutable, same-tenant
canonical correction evidence tied to the complete typed set of affected original
operations and exact entries, including a vector spanning several operations;
it MUST NOT require or reuse the original application authority. A later reapply
MUST use new current application authority. Names,
amount/date proximity, memo/OCR text, relationships, generic source IDs, and
incomplete or conflicting evidence MAY create a suggestion only.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a8b17c054af815333a4e"></a>

## Donor-Credit Recognition Stays Structurally Separate From Money Truth

<!-- BEGIN CONTRACT {"id":"a8b17c054af815333a4e","name":"Donor-Credit Recognition Stays Structurally Separate From Money Truth"} -->

Donor-credit operations SHALL keep recognition structurally separate from
money truth — across soft credits, DAF advisor recognition, tribute
notifications, matching-gift expectancies, and church-member attribution.
Recognition
rows SHALL never mint receipts, SHALL never enter money totals (receipt,
deductible, cash, or ledger), and SHALL render only through the governed
recognition read models. Reporting SHALL keep two vocabularies — Legal giving
(hard credit only) and Recognition giving — and SHALL never blend them into
one mixed column. Detailed behavior is specified in
`docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md`
(Phase 14 (Donor Credit Operations)).

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-b118e812a4cb0cf5073d"></a>

## Offline Money Enters Only Through the Governed Batch-Commit Path

<!-- BEGIN CONTRACT {"id":"b118e812a4cb0cf5073d","name":"Offline Money Enters Only Through the Governed Batch-Commit Path"} -->

Initial staff entry of offline gifts MUST flow through the single gift-entry-batch
commit service, the Phase 15 D1 front door. No other intake path MAY create an
offline contribution; Phase 39 offline mode MUST NOT acquire money-writing
authority. Validation MUST be non-mutating with
respect to money, receipt authorization, generated documents and delivery, and
MUST bind to the exact source revision. For the ordinary validate-to-post intent,
successful current validation MUST proceed through the same guarded commit
under the existing single per-batch confirmation when no reviewer is required.
That commit MUST consume valid current evidence and the accepted revision; it
MUST NOT create a second money-writing fast path. Every commit MUST retain the
source audit evidence. Current risk and new-operator rules MUST remain enforced:
a high-risk batch MUST route to a second reviewer, and enabled tenant approval
or quorum policy MUST also be satisfied before that same commit. Declared control totals MUST remain
frozen; a mismatch MUST block unless the distinct capability, reason and audit
requirements admit the governed override.

Staff-assisted Stripe card/ACH payments MUST retain their online provider-owned
Phase 13 posting path. Phase 15 MUST record the staff intent and exact qualified
link to its resulting contribution; a UI confirmation, processing response or
batch commit MUST NOT create a duplicate offline posting for those payments.

Posting and append-only correction MUST produce accepted source occurrences,
not receipt or delivery truth. Phase 7 MUST decide receipt eligibility, facts,
coverage and correction authority. Only an admitted request MAY produce a Phase
18 artifact transition or a Phase 17/6 governed notice. Receipt-affecting
classification MUST NOT itself authorize issuance, invent a prior artifact,
or bypass a current issuer/purpose hold. Uncovered `annual_cumulative_cash`
occurrences MUST create no per-gift receipt authorization, artifact or delivery;
corrections to already issued cumulative coverage MUST retain that owner's
exact coverage and correction contract. These rules do not settle C-01's
separate staff-correction approval decision.

Detailed behavior is specified in
`docs/prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md`.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d1bf1b6e68a94702c9b8"></a>

## The Public Tenant Website Runs On One Governed Runtime Contract

<!-- BEGIN CONTRACT {"id":"d1bf1b6e68a94702c9b8","name":"The Public Tenant Website Runs On One Governed Runtime Contract"} -->

The public tenant website MUST run on one governed runtime contract, per
Phase 5 (Public Website Runtime Contract) and
`docs/prds/sitestacker-parity/phase-05-public-website-runtime-contract.md`.
Public content MUST be readable only through one server-only published-content
choke-point that takes the resolved tenant (and reserved site) as a required
argument, always applies the tenant constraint and the published constraint
for draftable collections (versionless navigation has no drafts), runs with
Payload access control enforced (`overrideAccess: false`) under an explicit
public-read policy, and returns empty — never unfiltered — when no tenant
resolves. A public request MUST resolve its tenant only from the
platform-trusted host in production and MUST fail closed to a neutral "site
not found" on an unknown or disabled host. No draft or unpublished document
may be reachable through any public read, including requests from signed-in
users; authentication or a Draft Mode cookie MUST NOT elevate the public reader
or public-read policy into draft access. Authenticated staff preview MUST use
the same transport-agnostic reader/serializer and real renderer contract through
a separately authorized preview read, with drafts on and Payload access control
enforced (`overrideAccess: false`), rather than weakening the published-only
entry point. Draft Mode and the signed route are rendering/entry mechanics,
never authorization. Preview MUST be private, `no-store`, and non-indexable,
and MUST never read or populate the published cache. Every preview read MUST
authenticate the staff principal and authorize access within the resolved
tenant; missing, invalid, or revoked authority MUST fail closed to a
non-enumerating unavailable result without a public-read fallback.
A giving CTA MUST hand off
through the server-validated, enumeration-safe checkout resolver — every operational reference re-validated
server-side against the resolved tenant, a preset amount treated as a
re-validated suggestion — and the handoff carries the reserved
`site_id` / `source_code` / `currency` / `locale` /
`entry_method = 'public_checkout'` attribution fields ("channel" stays
retired). Cached public reads MUST key on the tenant passed as an argument
(tags are invalidation-only) with a secured admin→public revalidation signal
and a bounded-staleness backstop, and no route-segment cache config may exist
in the public app. CMS pages reference operational records
(reference-not-copy); operational truth wins for identity, money, and
existence, and a dangling or cross-tenant reference fails safe.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ebaa546428adaf9ed3f4"></a>

## The Parity Program's Phase Architecture Is Governed By One Roadmap

<!-- BEGIN CONTRACT {"id":"ebaa546428adaf9ed3f4","name":"The Parity Program's Phase Architecture Is Governed By One Roadmap"} -->

The SiteStacker parity program MUST govern its phase set, numbering,
ordering, and dependencies through a single roadmap source of truth
(`docs/prds/sitestacker-parity/roadmap.md`, Roadmap v3 adopted 2026-09-22, 45 phases numbered 0–44;
`phase-map.md` is its compact mirror and loses on conflict). New PRDs, issues,
and tickets MUST cite phases as "Phase N (Name)" — never a bare number — and
MUST start from the roadmap's per-phase scope section. Dependencies gate phase
starts, not numbers. Any re-sequencing of the roadmap MUST land as a new
roadmap revision carrying an old→new renumbering map together with a
same-commit congruence sweep of every live document and open issue that cites
a moved number; partial renumbering MUST NOT occur. Documents dated before a
renumbering are read through the roadmap's mapping table rather than edited
retroactively where they are historical records.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-f4cc1773f664f468e971"></a>

## Year-End Statements Run Through One Governed Operations Contract

<!-- BEGIN CONTRACT {"id":"f4cc1773f664f468e971","name":"Year-End Statements Run Through One Governed Operations Contract"} -->

Phase 19 (Year-End Statement Operations) MUST provide one canonical,
purpose-pinned Statement Run and one immutable Run Preflight over
source-authoritative Statement Subjects, exact source closure, participation,
document and communication resolution, recipient delivery, fulfillment, and
policy. One atomic release MUST create the reviewed run, item bindings, evidence,
outbox request, and release barrier without external I/O. Start MUST mean queued
work only and MUST NOT collapse population, document issuance/currentness,
portal availability/access, communication delivery, physical fulfillment,
incident, legal, or staff-completion truth.

Phase 7 MUST retain legal-donor, eligibility, facts, coverage, and correction
authority; Phase 14 MUST retain recognition authority; Phase 18 MUST retain
logical-document, current-artifact, and access authority; Phase 17/6 MUST retain
communication and provider-delivery authority; and Phase 19 MUST own only
pre-start participation, run release/coordination, physical-fulfillment
orchestration, cooperative containment, operational completion, recovery
correlation, and its PII-minimized Run Evidence Record.

Tenant control MUST include compatible Statement Delivery Profiles,
self-print-first paper posture, exact pre-start participation, bounded review
strengthening, Pause/Resume/Stop, truthful staff completion, and one target-ready
date. It MUST NOT permit eligibility, legal-donor, coverage, destination-safety,
current-artifact, provider-finality, or tenant-fair-capacity overrides.
Official documents MUST use exact Phase 7 Statement Subjects. Optional household
and disclosed-DAF recognition MUST use a separate, default-Off
**Support overview — Not a tax document** purpose and MUST NOT enter official or
deductible totals.

The donor portal MUST expose one current exact PDF with unmetered authorized
view, download, and local print plus repeatable bounded outbound-copy
fulfillment. Late facts, source corrections, destination changes, unknown
provider outcomes, and additional copies MUST use append-only owner-specific
recovery rather than reopening a frozen run. The live recomputed annual
statement text route and every competing run or delivery path MUST be removed
without a legacy adapter.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
