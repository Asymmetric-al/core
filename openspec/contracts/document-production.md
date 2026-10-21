# document-production normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-b7a0063d15d0e59ff4ea"></a>

## Observability Is PII-safe Cause-owned And Reconciled

<!-- BEGIN CONTRACT {"id":"b7a0063d15d0e59ff4ea","name":"Observability Is PII-safe Cause-owned And Reconciled"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-bc60abb6152d4a33ee05"></a>

## Records Schedules Separate Preservation Privacy Holds And Disposal

<!-- BEGIN CONTRACT {"id":"bc60abb6152d4a33ee05","name":"Records Schedules Separate Preservation Privacy Holds And Disposal"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-07ecbb635f8704adf53d"></a>

## One Document Studio Uses Proportional Purpose Contracts

<!-- BEGIN CONTRACT {"id":"07ecbb635f8704adf53d","name":"One Document Studio Uses Proportional Purpose Contracts"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a0422af4a28b8f5a3e9a"></a>

## Release Requires Production-shaped Multi-seam Proof

<!-- BEGIN CONTRACT {"id":"a0422af4a28b8f5a3e9a","name":"Release Requires Production-shaped Multi-seam Proof"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-0ed2bf249d78cf3561fa"></a>

## Protected Truth Cannot Be Authored Or Suppressed

<!-- BEGIN CONTRACT {"id":"0ed2bf249d78cf3561fa","name":"Protected Truth Cannot Be Authored Or Suppressed"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d8213af97a2ac3450d0d"></a>

## One Canonical PDF Is Accessible And Purpose-appropriately Archival

<!-- BEGIN CONTRACT {"id":"d8213af97a2ac3450d0d","name":"One Canonical PDF Is Accessible And Purpose-appropriately Archival"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-e3e198abb2209aee6efa"></a>

## Generation Requests Are Semantically Idempotent And Fenced

<!-- BEGIN CONTRACT {"id":"e3e198abb2209aee6efa","name":"Generation Requests Are Semantically Idempotent And Fenced"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-318ff77ad942fade6bca"></a>

## Document Production Preserves Five Durable Authorities

<!-- BEGIN CONTRACT {"id":"318ff77ad942fade6bca","name":"Document Production Preserves Five Durable Authorities"} -->

Document Production MUST preserve Document Definition Publication, source-owned
Facts Package, idempotent Generation Request, optional source-authorized
Issuance, and exact Artifact as distinct durable authorities. Within Issuance,
the source domain MUST own eligibility; whether and why issuance/document
identity is required; exact issuer/recipient/coverage facts; issuance validity;
and correction/void/cancel/replace authorization and effect. Phase 18's code-
owned jurisdiction/identity contract MUST own `ACK-*` and exact-issuer `ca_r_v1`
allocation, reuse/nonreuse, disposition, and artifact linkage. Render Attempts
MUST remain subordinate evidence beneath one Generation Request. Phase 17
content/publication resolution and Phase 6 intent, consent, delivery, provider
recovery and communication history MUST remain external linked authorities.

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-8e839139adaad3013fa1"></a>

## Structured Visual Authoring Is The Only Canonical Source

<!-- BEGIN CONTRACT {"id":"8e839139adaad3013fa1","name":"Structured Visual Authoring Is The Only Canonical Source"} -->

Every definition MUST use one versioned Asym-owned structured visual document
as canonical source. The visual editor and equivalent keyboard-operable outline
MUST edit the same source. The closed schema MUST govern blocks, layout roles,
attributes, page behavior, protected regions, reusable copied sections, links,
assets, conditions, and accessibility metadata.

Raw HTML, CSS, JavaScript, React code, renderer source, SQL, record paths,
expressions, arbitrary formulas, remote fetches, filesystem access, plugins,
recursive repeaters, and provider templates MUST NOT become production source.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-7f534809cd7f158ce0d0"></a>

## Native Semantic Template Packages Are Portable Without Authority

<!-- BEGIN CONTRACT {"id":"7f534809cd7f158ce0d0","name":"Native Semantic Template Packages Are Portable Without Authority"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-eb37a24273574ce65ec4"></a>

## Renderer Selection Is A Pre-registered No-winner-capable Contest

<!-- BEGIN CONTRACT {"id":"eb37a24273574ce65ec4","name":"Renderer Selection Is A Pre-registered No-winner-capable Contest"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d93f7463af53769717d1"></a>

## Protected Actions Share One Scanner-resistant Fragment Protocol

<!-- BEGIN CONTRACT {"id":"d93f7463af53769717d1","name":"Protected Actions Share One Scanner-resistant Fragment Protocol"} -->

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

Every capability-bearing notice MUST use Phase 17 governed content and verified
sender-profile resolution, with a fact-minimized recipient-specific intent
through the Phase 6 durable outbox. Phase 6 MUST own consent, submission,
provider evidence, recovery and communication history. Resend open and click tracking MUST be disabled and
proved off at activation, protected-batch start, and periodic drift checks
without a synchronous provider lookup on every send. Provider keys and verified,
deduplicated, order-independent webhook reductions MUST remain subordinate
evidence. Resend and appropriately privileged tenant Resend administrators'
ability to process or preview the capability-bearing message MUST be disclosed
as residual processor risk rather than denied.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-8257bd3c97336be2f0cb"></a>

## Publication Resolution Freezes One Whole Compatible Graph

<!-- BEGIN CONTRACT {"id":"8257bd3c97336be2f0cb","name":"Publication Resolution Freezes One Whole Compatible Graph"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-cea13ba0d3b3fe15189f"></a>

## The Cutover Removes Every Prototype Runtime

<!-- BEGIN CONTRACT {"id":"cea13ba0d3b3fe15189f","name":"The Cutover Removes Every Prototype Runtime"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-0e2f65b1db620c6554ac"></a>

## Logical Documents Have One Current Head And Immutable History

<!-- BEGIN CONTRACT {"id":"0e2f65b1db620c6554ac","name":"Logical Documents Have One Current Head And Immutable History"} -->

A logical document MUST have at most one current eligible publication. Current
MUST be source/purpose-authorized and MUST NOT mean merely newest. A correction,
void, cancellation, or replacement MUST preserve exact predecessor bytes and
append immutable lineage; it MUST NOT edit history.

Copies, downloads, prints, and resends MUST reuse exact current bytes. A source
correction MUST create a successor only under its purpose and issuance contract.
The predecessor may remain current during preparation only when that contract
permits it. Atomic promotion MUST never expose two current artifacts.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-13d560a7ead8c8181bd7"></a>

## Future Publication Uses One Fully Proved Appointment

<!-- BEGIN CONTRACT {"id":"13d560a7ead8c8181bd7","name":"Future Publication Uses One Fully Proved Appointment"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-662c882b61d9c26ecc10"></a>

## Canadian Serials And Signers Belong To The Exact Issuer

<!-- BEGIN CONTRACT {"id":"662c882b61d9c26ecc10","name":"Canadian Serials And Signers Belong To The Exact Issuer"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-fdaafd2135cb9a2f0449"></a>

## Document Access Is Calm Role-safe And Recoverable

<!-- BEGIN CONTRACT {"id":"fdaafd2135cb9a2f0449","name":"Document Access Is Calm Role-safe And Recoverable"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-f6ff79206ed1c415c7c2"></a>

## The U.S. Pack Covers Everyday Acknowledgments Without Becoming A Tax-form Suite

<!-- BEGIN CONTRACT {"id":"f6ff79206ed1c415c7c2","name":"The U.S. Pack Covers Everyday Acknowledgments Without Becoming A Tax-form Suite"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-af9faae3106d8155efdb"></a>

## U.S. Acknowledgment Identity Is Opaque And Versioned

<!-- BEGIN CONTRACT {"id":"af9faae3106d8155efdb","name":"U.S. Acknowledgment Identity Is Opaque And Versioned"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-4c72091857a52a8d7026"></a>

## Canadian Official Receipting Is Tenant-silent And Proof-gated

<!-- BEGIN CONTRACT {"id":"4c72091857a52a8d7026","name":"Canadian Official Receipting Is Tenant-silent And Proof-gated"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-e5e6429396502afab9d0"></a>

## Approved Data Views Bound Tenant-extensible Facts

<!-- BEGIN CONTRACT {"id":"e5e6429396502afab9d0","name":"Approved Data Views Bound Tenant-extensible Facts"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-82c713818319fdca25a4"></a>

## Draft Commit And Publication Are Conflict-safe And Immutable

<!-- BEGIN CONTRACT {"id":"82c713818319fdca25a4","name":"Draft Commit And Publication Are Conflict-safe And Immutable"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-c552a74e6a87c91744c4"></a>

## Batches Are Item-authoritative And Use The Same Service

<!-- BEGIN CONTRACT {"id":"c552a74e6a87c91744c4","name":"Batches Are Item-authoritative And Use The Same Service"} -->

Single, scheduled, API, and batch generation MUST use the same purpose, facts,
publication resolution, request, issuance, renderer, artifact, and authorization
contracts. A batch MUST freeze its source-owned item set or cutoff, candidate
policy, publication graph, and item semantic identities before execution.

Each item MUST own its exact outcome. Successful and ambiguous items MUST NOT be
rerun. **Retry failed items** MUST reuse exact pins for eligible failures.
Proof-gated preparation of waiting items MUST be a distinct operation. Mixed
results MUST yield aggregate progress and Completed with issues, with blockers
grouped by root cause rather than one notification or task per recipient.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-b853c374401fff4c6369"></a>

## Artifact Access Uses Current Object Authorization

<!-- BEGIN CONTRACT {"id":"b853c374401fff4c6369","name":"Artifact Access Uses Current Object Authorization"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
