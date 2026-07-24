# Statement Operations Specification

## ADDED Requirements

### Requirement: D1 Statement Runs Are Purpose-pinned Authorities With One Derived Workspace

Phase 19 MUST own one canonical Statement Run and run-item system. Every run
MUST pin exactly one tenant and environment, legal issuer and issuer version,
compliance profile and version, Phase 18 document-purpose contract/version/
digest, document period, source cutoff, issuer timezone, Phase 7 eligibility
rule version, frozen inclusion and exclusion snapshot/digest, and permitted
content-policy configuration. One run MUST NOT mix official and informational
purposes, jurisdictions, issuers, purpose contracts, or incompatible currency
or privacy scopes.

A run item MUST represent one governed Statement Subject and document candidate,
not an email address or delivery attempt. Population, document, portal,
communication, and print state MUST remain separate axes. Late material facts
MUST use a supplemental or formal successor operation rather than reopening
frozen history.

The **Year-End Operations** workspace MUST be a permission-filtered, disposable,
rebuildable projection over Statement Runs. It MAY group compatible runs,
suggest safe next actions, and correlate explicit multi-run commands, but MUST
NOT become a durable campaign parent, command authority, idempotency source,
lifecycle authority, or global completion state.

#### Scenario: Two purposes cover the same period

- GIVEN one issuer needs official tax documents and optional support overviews
  for the same year
- WHEN staff prepare year-end operations
- THEN the product creates purpose-pinned runs and items with independent
  population, artifact, delivery, control, and completion truth
- AND the Year-End Operations workspace may present them together without
  creating a mixed-purpose run or global completion percentage

### Requirement: D2 One Exact Preflight Starts Through One Atomic Release Barrier

The system MUST build one immutable, inert, server-owned **Run Preflight** that
pins the run scope, source closure, ordered included/excluded/blocked/
already-current subjects and stable reasons, Phase 18 document-resolution pins,
Phase 17 communication-plan pins, portal and print policies, exact counts and
totals, canonicalization version, the derived release-floor
contract/version/reason, eligible-review policy, and digest. The browser MUST
NOT assemble or own authoritative membership.

Review request, delegation, and decision evidence MUST be a separate
compare-and-swap-bound record that references the exact preflight; it MUST NOT
be included in the candidate digest it reviews. `approveAndStartLiveRun` MUST
re-prove the immutable preflight and current review record, then append the
final decision atomically with release.

When connected direct mail is selected, the preflight MUST additionally pin the
exact mailpiece count, provider connection/capability revision, billing
currency, provider quote or adapter-certified upper-bound total with
as-of/expiry, and the tenant's current per-run spending-guard revision. A
candidate MUST block when cost cannot be bounded, the evidence is expired, or
the total exceeds the guard.

**Start live run**, or **Approve and start live run** for the final protected
reviewer, MUST reauthorize the actor and re-prove every material source and
policy fence. One bounded database transaction MUST promote the exact
preflight, create the run and item bindings, append review and audit evidence,
write the durable outbox request, and open one release barrier. Candidate work
MUST remain unclaimable before that barrier, and the transaction MUST perform no
external I/O.

The one existing Start confirmation MUST state exact population, donor-message
posture, physical route and piece count and, when paid direct mail is present,
the billing currency, quote or upper-bound total, freshness, and spending
guard. Starting that candidate MUST require both
`statement_operations.start_runs` and
`statement_operations.authorize_direct_mail`. This one Start authorizes later
service-principal submission only for the frozen pieces inside the frozen
bound; there MUST NOT be a second staff purchase action or per-piece approval.

Start MUST mean only that reviewed work is durably queued. It MUST NOT mean a
document was issued, a portal artifact was accessed, a message was sent or
delivered, or paper was printed or mailed. Exact replay MUST return the original
run; changed semantic reuse MUST conflict.

#### Scenario: A material fact changes during final confirmation

- GIVEN staff reviewed a Run Preflight
- WHEN the Statement Subject, source closure, purpose, issuer, document
  resolution, communication resolution, policy, direct-mail count/connection/
  quote/guard, or review floor changes before Start commits
- THEN Start fails atomically with zero run, item, outbox, or provider effects
- AND the UI shows a permission-safe typed delta and offers to rebuild and
  review the current candidate

#### Scenario: Protected review becomes stale or two reviewers start concurrently

- GIVEN a protected review is bound to one exact Run Preflight digest
- WHEN participation changes after review or two eligible reviewers concurrently
  call `approveAndStartLiveRun`
- THEN a participation change supersedes that review and requires a new review
  bound to the rebuilt digest
- AND exactly one concurrent command may create and release one run
- AND every losing or stale command returns a typed replay or conflict with zero
  additional run, item, outbox, audit-decision, or provider effects

### Requirement: D3 Statement Recognition Delivery And Presentation Subjects Stay Separate

Phase 19 MUST preserve four distinct concepts:

- **Statement Subject**: the exact Phase 7 legal-donor Party or source-proved
  joint-donor Party;
- **Recognition Subject**: a Phase 14 person or household recognized only
  through a nonreceiptable projection;
- **Delivery Recipient**: a separately authorized person and destination; and
- **Year Presentation Group**: disposable navigation with no fact, money,
  access, artifact, delivery, or lifecycle authority.

Household membership, surname, address, email, current relationship, DAF
advisory status, soft credit, staff preference, or delivery destination MUST NOT
create or change a Statement Subject. Missing legal-donor evidence MUST block
only the affected item and route correction to the source owner. Phase 19 MUST
NOT provide an inline donor picker, combine-household override, or editable
legal total.

Official documents MUST exclude recognition-only facts. Any optional household
or DAF presentation MUST use D15's separate non-tax purpose and independent
authorization. Shared destinations MUST NOT merge documents or subjects.

#### Scenario: Spouses share one mailbox but are separate legal donors

- GIVEN two legal-donor Statement Subjects share an email or postal address
- WHEN Phase 19 builds their recipient operations
- THEN each subject retains a separate official document and authorization
- AND the UI may say that the destination is shared without combining legal
  totals, documents, failures, or access rights

### Requirement: D4 Canadian Receipt Plans Are Exact-issuer Prospective And Structurally Absent Otherwise

Phase 19 MUST consume Phase 18's exact legal-issuer Canadian pack authority and
MUST NOT create a second country test, activation flag, enrollment flow, or
legal-rules layer. Without an active proved pack for the exact issuer, Canadian
plan state, UI, API fields, jobs, storage, alerts, and meaningful query cost
MUST be absent even when a donor, address, currency, locale, import, or Site
appears Canadian.

An activated issuer MUST choose exactly one code-owned prospective cash-receipt
plan: `individual_cash` or `annual_cumulative_cash`. The plan and activation
epoch MUST be frozen into source facts and preflight. A later plan change MUST
affect future eligible gifts only and MUST NOT rewrite existing issuance or
coverage.

Phase 15 batch and quick-entry commit, and every other gift-intake path, MUST
consume that Phase 7-frozen plan. `individual_cash` permits ordinary eligible
per-gift receipt admission only after the tender reaches source-required
finality. `annual_cumulative_cash` MUST create no per-gift official receipt,
official coverage, or receipt-send outbox occurrence; the posted gift remains
available only to Phase 7's year-end coverage authority. Tenant configuration,
caller input, donor data, currency, locale, and intake channel MUST NOT override
or infer the plan.

For `annual_cumulative_cash`, Phase 7 MUST own exact eligible coverage and
exclude ineligible, non-cash, already individually receipted, cancelled,
replaced, or otherwise covered facts. Phase 19 MUST coordinate the cumulative
candidate but MUST NOT cancel receipts, allocate serials, or choose legal
coverage.

#### Scenario: Canadian-looking data exists under an unactivated issuer

- GIVEN a U.S. issuer has a Canadian-addressed donor, CAD gifts, and a French
  locale
- WHEN staff use year-end operations
- THEN no Canadian plan, terminology, control, queue item, or warning appears
- AND the ordinary acknowledgment or statement flow is unchanged

#### Scenario: An activated issuer uses annual cumulative cash receipts

- GIVEN the exact issuer's Canadian pack and annual cumulative plan are active
- WHEN Phase 19 builds a preflight
- THEN it consumes Phase 7's nonoverlapping eligible coverage set and exact
  plan epoch
- AND Phase 18 remains the sole authority for official receipt identity,
  currentness, cancellation, and replacement

#### Scenario: Batch commit respects annual cumulative coverage

- GIVEN an eligible settled check or cash gift is frozen under
  `annual_cumulative_cash`
- WHEN Phase 15 commits the batch or quick-entry gift
- THEN the money posts through the ordinary append-only ledger path
- AND no per-gift official receipt, coverage record, or receipt-send outbox
  occurrence is created
- AND staff see the occurrence as ready for year-end receipt rather than failed
  or omitted

### Requirement: D5 Primary Releases Stay Immutable While Late Facts Use A Contract-owned Lane

Every run MUST keep the source-owned Document Period, tenant Readiness Target
(shown as **Target ready for review by**), versioned **Compliance-Risk Rule**,
and immutable Source-Fact Cutoff separate. The Compliance-Risk Rule is the
source-, jurisdiction-, or tenant-owned evidence-and-review policy that MAY
strengthen proof for exceptional dating but MUST NOT change gift date, Document
Period, Source-Fact Cutoff, or release authority. Operational target dates MUST
NOT change eligibility or become universal legal deadlines.

For year-boundary checks, Phase 7's civil `gift_date` and `delivery_basis` MUST
decide document period, while the source cutoff MUST decide only whether the
posted fact was known to the reviewed primary run. Received, entered, deposited,
cleared, imported, and run dates MUST NOT substitute for those coordinates.

Phase 19 MUST accept Phase 15's authorized structured staff attestation of an
actual mailing/postmark date as sufficient by default. The attestation MUST
record the exact date, factual basis, actor, time, source rule version, and
before/after history. Tenants MAY require stronger evidence or review where the
jurisdiction contract permits; no universal attachment or second approver is
allowed.

A material fact posted before Start MUST mark only affected operations stale,
but the immutable preflight digest and any protected review MUST become
non-startable. Rebuild MAY reuse unchanged operation evidence only after
re-proving it current. Start MUST require zero stale operations and, when
protected, a review record bound to the rebuilt exact digest.

A fact posted after Start MUST create one deduplicated late-fact obligation
whose source and purpose contracts derive no action, additional nonoverlapping
coverage, or a formal successor/correction/replacement. Its permanent semantic
slot MUST derive from tenant/environment, primary run, Statement Subject,
source-fact identity, and purpose contract. Exact replay MUST return the same
obligation. A later revision of that source fact MUST append through
compare-and-swap inside the same slot rather than create a parallel open
obligation; a materially different source fact MUST use a different slot.
Staff MUST NOT edit the frozen primary run or choose the legal result.

#### Scenario: A December 31 check is received after year-end

- GIVEN authorized staff records that a check received January 3 was actually
  mailed December 31 using the governed Phase 15 attestation
- WHEN Phase 7 stores December 31 as the gift date and the fact posts after the
  primary run started
- THEN the primary run remains immutable
- AND Phase 19 creates one linked late-fact obligation for the prior year
- AND the governing source and purpose contracts derive the required
  supplemental or successor action without an inline year override

#### Scenario: A year-boundary check later returns unpaid

- GIVEN the check was included through a truthful source attestation
- WHEN the payment later returns or is reversed
- THEN the source domain appends its reversal and correction authority
- AND Phase 19 coordinates the required successor operation without rewriting
  the intake evidence, source cutoff, or original run

#### Scenario: The same late source fact is delivered twice

- GIVEN one post-Start source fact already created a Late Fact Obligation
- WHEN an import retry or concurrent source delivery repeats the same
  source-fact identity
- THEN exact replay returns the same obligation
- AND a later source revision appends through compare-and-swap in that logical
  slot rather than creating a second open obligation

### Requirement: D6 Delivery Profiles Compile Into Frozen Fulfillment Plans

Tenants MUST be able to publish one organization-default **Statement Delivery
Profile** per compatible purpose and additional named profiles without an
arbitrary cap. Profiles MUST be versioned, previewable, auditable, immutable
after publication, explicitly assigned, and safely archivable.

A profile MAY permit digital first with paper fallback, digital only, paper
only, deliberate digital and paper, internal print, an enabled mail house,
portal only, no automatic outbound where permitted, or staff review. It MUST
separately define unavailable-destination and definitive-failure behavior.
Portal availability MUST remain an independent fact.

Resolution MUST honor, in order: source/legal/safety constraints; currently
permitted destinations and channel readiness; an authorized run-only change;
source-owned recipient preference; exact Site profile; organization default;
otherwise one typed Needs attention result. Tenants MUST NOT reorder or bypass
legal, consent, privacy, restricted-person, tenant, locale, or readiness
authority.

A run-only delivery change MUST be candidate-only before Start and MUST
invalidate the current preflight digest and protected review. Only operations
whose compiled plan or destination consequence changed MUST be marked stale;
unchanged operation evidence MAY be reused only after reproof. Start MUST still
require a rebuilt exact preflight with zero stale operations and, when
protected, a review record bound to that digest. After Start, the frozen
Fulfillment Plan and fallback MUST NOT be mutated in place; deliberate new
fulfillment MUST use governed destination succession or one D12/D16 copy
occurrence.

Each frozen recipient-document operation MUST resolve to exactly one
**Fulfillment Plan** or actionable exception. Each executable step MUST belong
to one mutually exclusive derived lane. The preflight MUST freeze the profile,
assignment, preference, destination, locale, publication, sender, resolver,
route candidates and rejections, plan, lane, and semantic identity.

#### Scenario: A hard bounce activates an approved paper fallback

- GIVEN a frozen Fulfillment Plan allows email first and paper after definitive
  failure
- WHEN Phase 17/6 proves the email route reached a final hard bounce
- THEN Phase 19 activates the frozen paper fallback exactly once over the same
  current Phase 18 artifact
- AND a transient or indeterminate email outcome does not activate paper

### Requirement: D7 Recipient-delivery Snapshots Use Governed Destination Succession

Each recipient-document operation MUST freeze one reviewed delivery snapshot
including Statement Subject, authorized Delivery Recipient, authority interval,
selected contact-point revision, selection reason, Site, locale, Fulfillment
Plan step, preference, reviewed safety state, exact logical document/artifact,
source revisions, policy versions, snapshot time, and integrity digest.
Permanent projections MUST retain only masked/fingerprinted destination
evidence; exact values MUST remain encrypted and purpose-bound.

Destination value, owner, recipient authority/effective interval,
active/undeliverable state, statement-specific selection reason, consent,
suppression, privacy state, addressee, and artifact-affecting locale MUST be
material. An unrelated phone, note, tag, display label, unused contact point, or
qualified same-delivery-point formatting transform MUST NOT invalidate a
snapshot. A newly designated primary contact MUST be material only when
**current primary** was the recorded selection reason or the old destination is
no longer safe.

Current authorization, consent, suppression, privacy, contact risk, document
currentness, and channel readiness MUST be re-proved before preparation and
again before irreversible handoff. A material pre-start change MUST stale only
affected operations. A post-start material change MUST hold only the affected
route and MUST NOT silently select a new destination.

**Use updated contact for remaining delivery** MUST append one compare-and-set
destination succession: retire definitely unsubmitted predecessor work,
preserve history, create one successor occurrence with a new semantic identity,
and emit outbox work. Exact replay MUST return the same successor; concurrent
change MUST conflict. If submission or custody may have begun, the system MUST
reconcile before permitting another delivery.

Phase 19 MUST NOT accept a free-text run destination or create a shadow contact
store. A one-statement destination MUST be a purpose-bound contact with source,
effective bounds, authority evidence, and audit. **Use for this statement only**
MUST leave the general primary contact and standing future preference unchanged;
**Also use for future statements** MUST be a separate permissioned,
source-owned action.
Statement-only succession MUST require
`statement_operations.manage_destinations`. Future-contact or preference
mutation MUST additionally require the applicable source-owned general-contact
or preference capability; without it, the future option MUST be hidden or
denied while statement-only succession remains available.

#### Scenario: An address changes after preflight but before start

- GIVEN a material address revision changes after staff reviewed the preflight
- WHEN staff attempt to start the run
- THEN only the affected recipient operation is marked stale
- AND the old immutable preflight digest cannot start
- AND staff see masked before/after consequences, rebuild the exact candidate,
  and refresh the protected review when applicable
- AND unchanged operations may reuse only evidence re-proved current

#### Scenario: A destination changes after possible provider acceptance

- GIVEN provider submission may already have begun
- WHEN staff select a new authorized destination
- THEN the original occurrence remains indeterminate and must reconcile
- AND the product does not claim recall, mutate prepared bytes, or blindly
  release a successor delivery

### Requirement: D8 Run Containment Is Cooperative And Truthful

Phase 19 MUST provide **Pause new work**, **Resume remaining work**, and
**Stop remaining work** over one monotonic run-control posture, version, epoch,
and append-only command history. It MUST NOT present a run-level Cancel action.
Run control MUST remain separate from document, portal, communication, print,
provider, and legal outcomes.

Pause and Stop MUST close admission in one bounded transaction before scanning
work. Claims MUST carry their admission epoch, and workers MUST recheck posture
and epoch before every new claim and irreversible handoff. The handoff fence
and control command MUST serialize so one race winner is truthful.

Pause MUST be reversible only after containment is proved and current safety is
rechecked. Stop MUST permanently prevent unclaimed work within that run while
preserving issued, submitted, accepted, indeterminate, completed, and historical
facts. Provider cancellation MUST be requested only when current provider
evidence proves it is available; requested, confirmed, too late, and unknown
MUST remain distinct.

#### Scenario: Pause races email submission

- WHEN Pause and a recipient email handoff race
- THEN if containment commits first, the stale worker cannot submit
- AND if the handoff fence commits first, the occurrence remains in flight and
  reconciles without a recall or cancellation claim

#### Scenario: Resume follows a privacy containment

- GIVEN a privacy reason triggered the strongest containment posture
- WHEN an ordinary run operator attempts Resume
- THEN Resume remains blocked until current incident-owner clearance and safety
  proof exist
- AND already issued documents and external outcomes remain unchanged

### Requirement: D9 Physical Fulfillment Is Self-print-first And Evidence-based

Every tenant MUST control paper fulfillment through one Asym-owned contract.
**Print and mail ourselves** MUST be the quiet default with no provider setup.
Tenants MAY instead use one enabled direct-mail adapter or prepare a secure
package for their approved mail house. Changing method after handoff starts
MUST create a new attempt and preserve the first.

The self-print default MUST be preselected. One bounded **Office print setup**
MAY configure compatible Letter/A4, simplex/duplex, recommended window-envelope
or label/printed-envelope output, color posture, and authorized return address.
It MUST provide a synthetic no-PII alignment proof and MUST NOT add printer
drivers, desktop agents, arbitrary margins, presort, or postage controls.

All methods MUST reuse the exact Phase 18 artifact, D7 destination snapshot, and
D8 control fence. Packages MUST contain only stable chunks, control summary,
versioned manifest, opaque piece IDs/filenames, destination mapping, counts,
instructions, and checksums. Duplex output MUST prevent one recipient's pages
from appearing behind another's. Packages MUST be private, short-lived,
audited, revocable for future Asym access, and purged under a bounded derivative
schedule without deleting canonical artifacts or evidence.

Self-print evidence MUST distinguish package ready, downloaded, printed,
partly printed, and staff-recorded postal handoff. A download MUST NOT mean
printed, mailed, delivered, or received. Mail-house transfer, acceptance,
production, postal handoff, return, cancellation, and unknown outcome MUST
remain separately evidenced.

After download, staff MUST see **Downloaded — mailing not recorded**, then one
fast all-success or partial-print action and a separate **Record postal
handoff** action over only reconciled usable pieces. Packages MUST be expiring
and revocable for future Asym access while explaining that downloaded local
copies cannot be recalled. A tenant MAY choose one bounded grouped follow-up
interval for downloaded work without handoff; it MUST NOT create per-piece,
donor, or missionary notification noise.

The direct-mail boundary MUST admit one production adapter only after security,
privacy, country coverage, retention, webhook, billing, cancellation, export,
and representative-output proof. Provider idempotency and status MUST remain
subordinate to permanent Asym identity and normalized evidence.

Provider setup MUST be outside the ordinary self-print flow and MUST separate
test from live credentials and effects. Connecting or testing MUST NOT send live
mail. Activation MUST require successful test/live connection proof, one
synthetic sample, detected-capability review, and tenant-owned billing/agreement
confirmation; credentials MUST be encrypted, write-only, tenant-scoped, and
available only through Test, Rotate, and Disconnect operations.

Activation MUST also require a tenant-set maximum connected-direct-mail spend
per run in the provider billing currency. Connection administration MUST use
`statement_operations.manage_direct_mail_connections`; authorizing a paid lane
at Start MUST use the separate
`statement_operations.authorize_direct_mail`. A physical-package preparation
grant MUST authorize neither action. Exact cost/count/guard evidence MUST be
re-proved at Start and immediately before provider submission. The amount
accepted at Start MUST be the frozen execution-authorization ceiling. A fresh
current quote or certified bound MAY execute without another staff action only
when it does not exceed that ceiling, still fits the current cumulative guard,
and every material connection/capability proof remains compatible.

Write-only credential rotation inside the same logical provider account,
billing agreement, currency, supported regions, and proven capabilities MUST
advance a nonsemantic credential revision that is re-proved at execution; it
MUST NOT by itself invalidate the released authorization. Disconnect,
provider/account/currency/capability change, or lost proof MUST be material.

When the fresh bound exceeds the latest ceiling or one compatible material
connection revision is required, Phase 19 MUST expose one exception-only
**Review updated mailing cost** action. It MUST show the exact unsubmitted
pieces, old/new bound, currency, delta, connection consequence, and remaining
guard. `reauthorizeDirectMailExecution` MUST require
`statement_operations.authorize_direct_mail`, current compare-and-swap evidence,
and one explicit confirmation; success MUST append a new bounded authorization
for only those pieces without changing frozen population or plan and without
calling the provider. Incompatible, disconnected, over-guard, stale, or
concurrently changed evidence MUST remain blocked with no silent spend increase
or fallback.

#### Scenario: Staff download a self-print package

- WHEN authorized staff prepare and download an exact-artifact package
- THEN the status becomes Downloaded — mailing not recorded
- AND no piece is marked printed, handed to a carrier, delivered, or received
- AND staff can later record all-success or exact partial print and postal
  handoff evidence without regenerating the official documents

#### Scenario: A direct-mail creation times out after possible acceptance

- WHEN a provider request times out after it may have accepted a mailpiece
- THEN the attempt becomes Outcome unknown under its original semantic identity
- AND the adapter reconciles by provider evidence before any new attempt
- AND the system does not silently fall back to self-print

#### Scenario: A paid lane exceeds the tenant guard before start

- GIVEN a reviewed candidate uses connected direct mail
- WHEN its current provider quote or certified upper bound exceeds the tenant's
  per-run spending guard
- THEN Start blocks atomically with exact count, amount, currency, freshness,
  and a permission-safe next action
- AND no run, outbox release, provider submission, or charge occurs

#### Scenario: A current quote rises after start

- GIVEN a released paid lane has exact unsubmitted pieces and a frozen
  authorization ceiling
- WHEN the fresh execution-time bound is higher than that ceiling
- THEN provider submission remains blocked with zero external effect
- AND authorized staff may review the exact delta and append one bounded
  authorization for only the remaining pieces
- AND an exact replay returns the same authorization while a stale or changed
  selection conflicts

#### Scenario: Credentials rotate without changing the logical connection

- GIVEN a released paid lane remains on the same provider account, billing
  agreement, currency, supported regions, and proven capabilities
- WHEN an authorized connection administrator rotates the write-only secret
- THEN execution re-proves the new credential revision and may continue within
  the existing ceiling and cumulative guard
- AND the rotation does not authorize paid mail or mutate the frozen plan

### Requirement: D10 Staff Decide Operational Completion While The System Derives Truth

An authorized tenant staff member MUST decide when to use **Mark run complete**.
The system MUST NOT automatically complete a run. Completion MUST mean only that
the tenant finished the work it intends to perform inside that run, including
its decision to carry exceptions forward.

At commit, Asym MUST derive **Completed** when the exact snapshot has no
exceptions or **Completed with exceptions** when blocked, failed, stopped,
unmailed, returned, deferred, unknown, or unresolved facts remain. Staff MUST
NOT choose a cleaner label. Completion MUST NOT claim donor receipt, successful
delivery, legal satisfaction, or downstream finality.

Only authorization/scope failure, irreconcilable run integrity, uncontained
privacy/security risk, an unsettled D8 control fence selected for closure, or a
stale concurrent review MAY block completion. Ordinary exceptions MUST warn but
MUST NOT impose row-by-row disposition. If executable work remains, the product
MUST reuse D8 through **Stop remaining work and mark complete**.

Each completion MUST append a numbered immutable snapshot with actor, time,
run/control versions, population and axis counts, derived result, grouped
exceptions and owners, D8 result, optional bounded note, and schema version.
Later owner evidence MUST remain live and MUST NOT rewrite the snapshot.
**Return to active review** MUST append evidence without changing population,
documents, destinations, attempts, or delivery truth.

Tenants MUST separately grant `statement_operations.complete_runs` and
`statement_operations.return_runs_to_review`. A tenant MAY configure one
default follow-up team or role, bounded due-date presets, reminder thresholds,
and a closed set of internal reason categories. These settings MUST organize
current exception follow-up only. They MUST NOT become required completion
fields, legal or lifecycle meaning, approval gates, or permission bypasses. An
authorized staff member MUST be able to leave all optional fields blank and
complete the run through the same single reviewed action.

The current closeout projection MUST use exactly `open`, `completed`,
`completed_with_exceptions`, or `active_review_after_completion`. Returning a
completed run to active review MUST preserve all numbered Completion Snapshots,
restore only routine review/follow-up affordances, and MUST NOT reopen the
population, release barrier, stopped work, finished route steps, or provider
attempts. A later completion MUST append the next numbered snapshot and derive a
fresh result from then-current evidence.

#### Scenario: Staff complete a run with unresolved work

- GIVEN the run has bounced email, downloaded-but-unmailed paper, and one late
  fact obligation but no integrity or uncontained privacy failure
- WHEN authorized staff select Mark run complete
- THEN one immutable completion snapshot records the exact causes and owners
- AND Asym derives Completed with exceptions rather than accepting a
  staff-selected outcome label
- AND the exceptions remain available in follow-up and contextual donor views
- AND completion sends, retries, cancels, rerenders, or purges nothing

#### Scenario: A tenant uses lightweight follow-up defaults

- GIVEN the tenant configured a default follow-up team and due-date preset
- WHEN authorized staff mark a run complete with exceptions
- THEN the current exceptions receive those organizational defaults
- AND staff are not required to enter a note, category, due date, or approval
- AND the defaults do not change the derived completion result or owner truth

### Requirement: D11 Seasonal Execution Is Certified Tenant-fair And Inspectable

Phase 19 MUST use product-owned tenant-fair admission, recipient-grained claims,
workload-shaped service classes, bounded leases, fencing, provider-adaptive
backpressure, poison isolation, and exact reconciliation. Seasonal statement
load MUST NOT starve source-owned receipt, authentication, security, payment, or
protected-action deadlines.

The active launch certification MUST support complete logical runs of 50,000
Statement Subjects and at least 500,000 concurrently admitted recipient
equivalents. A larger run MAY build a complete preflight and be reviewed, but
release MUST block atomically with the exact count and active ceiling. It MUST
NOT truncate, partially release, or silently split the reviewed population.

Each expensive bulk lane MUST compose a measured global ceiling with a
tenant/scope-owner ceiling. Every eligible active tenant MUST receive a claim
within `2 × active tenant count` eligible claim decisions unless that tenant's
own recorded provider, readiness, safety, or D8 control state makes its work
ineligible.

Tenants MAY set one bounded **Target ready for review by** value. It MUST guide
planning, forecast, and tenant-internal ordering only. It MUST NOT increase the
tenant's global share, bypass another tenant, guarantee external delivery, or
expose priority, weight, concurrency, chunk, batch, provider-rate, or paid-jump
controls.
Within those limits, it MAY move this tenant earlier in the current fair round,
order this tenant's own ordinary runs, and use otherwise idle capacity.

The run MUST show separately truthful population, document, portal,
communication, and physical-fulfillment progress, with current-as-of time,
stage backlog, blockers, and an Asym-owned ETA range only when enough evidence
exists. It MUST NOT show one blended completion percentage or infer sent,
delivered, mailed, or complete from queue progress.

All irreversible effects MUST recheck tenant/environment, lease, fence,
semantic identity, immutable payload, and D8 epoch. Provider acceptance,
webhook reduction, retry, and reconciliation MUST remain per-recipient even
when a compatible transport batch is used internally.

#### Scenario: One large tenant runs beside smaller tenants

- GIVEN one 50,000-subject run and at least 19 smaller tenant runs are eligible
- WHEN certified seasonal execution proceeds
- THEN the large run cannot monopolize admission, workers, renderer, provider,
  or finalization capacity
- AND each eligible tenant receives a claim within the certified
  `2 × active tenant count` decision bound
- AND protected critical messages remain within their source-owned budgets
- AND every recipient retains independent durable progress and outcome

#### Scenario: A tenant chooses an earlier target

- WHEN a tenant changes Target ready for review by
- THEN the UI recomputes an evidence-based risk and ETA range
- AND the tenant does not gain global priority, worker count, provider rate, or
  a delivery guarantee

### Requirement: D12 One Contextual Help Doorway Routes To Existing Owners

Phase 19 MUST provide one **Help with this statement** doorway from the exact
Party Giving row and matching Year-End Operations item. Both entry points MUST
address the same logical statement and shared read/action contract.

The current-first page MUST show exact current status, issuer, issue date,
opaque reference, and latest truthful delivery outcome. **Open current
statement**, **Download PDF**, and **Print a local copy** MUST reauthorize and
return exact current bytes without creating a document or fulfillment
occurrence.

The page MUST offer four closed intent families:

- **Provide another copy**;
- **Change where it goes**;
- **The statement is wrong**; and
- **Giving is missing**.

A versioned purpose/jurisdiction resolver MUST route each intent to Phase 7
source correction, Phase 18 current artifact or successor/replacement, Phase
17 delivery, D7 destination succession, D9 paper fulfillment, or the Phase 19
supplemental lane. Staff MUST NOT choose a renderer, template, provider, serial,
legal lifecycle, arbitrary destination, or PDF field edit.

State-changing help commands MUST use one current review, permanent semantic
idempotency, expected revisions, current-head and destination fences, outbox,
and truthful owner outcomes. An indeterminate handoff MUST block another
release and route to reconciliation.

Staff reading the help projection MUST require `statement_operations.view`.
**Provide another copy** MUST additionally require
`statement_operations.request_statement_copy`; **Change where it goes** MUST
require `statement_operations.manage_destinations`; and source correction or
missing-giving work MUST require the applicable Phase 7/15 source capability.
Resolving an intent MUST NOT grant its owner action. Donor and representative
copy requests continue to use object-scoped portal authorization rather than a
staff capability.

#### Scenario: A donor says giving is missing

- WHEN staff choose Giving is missing for an already released annual statement
- THEN the doorway routes to the linked source-owned late-fact or supplemental
  preflight
- AND the frozen primary run and current artifact remain unchanged until the
  source and purpose authorities admit a successor

#### Scenario: Staff ask for another copy after an uncertain send

- GIVEN the prior provider outcome may already have been accepted
- WHEN staff choose Provide another copy
- THEN the page offers Review delivery rather than a generic resend
- AND a new delivery cannot be admitted until the original occurrence reaches
  a truthful reconciled outcome

### Requirement: D13 Statement Communication Is Finite Proportional And Contract-owned

Phase 19 MUST own a finite, versioned admission contract for statement
communication. It MUST emit one semantic occurrence only after proving that a
communication is required, optional, or prohibited for the exact purpose and
jurisdiction. Phase 17/6 MUST remain the only message preparation, Resend
transport, webhook reduction, and communication-history path.

The frozen D6 delivery occurrence MUST be the donor's only ordinary notice.
Portal availability, self-print readiness, print-package readiness, run
progress, and run completion MUST NOT create duplicate donor messages.
Correction, replacement, withdrawal, or void communication MUST be admitted
only after exact source meaning, current healthy artifact, recipient authority,
predecessor exposure, and safety proof.

Definitive route failure MAY activate only the frozen compatible fallback.
Delayed or indeterminate outcomes MUST NOT produce terminal-failure claims,
blind resends, or fallback. D12 additional-copy help MUST create a fresh
exact-current delivery occurrence without replaying original lifecycle wording.
Internal retry, provider acceptance, webhook replay, and run completion MUST
NOT generate donor or missionary messages.

Tenants MAY control contract-permitted optional routes, Brand Kit and editable
presentation, sender/reply identity, responsible staff owner, and bounded
grouped-attention posture. They MUST NOT configure lifecycle triggers, legal
meaning, recipients, suppression, finality, retry mechanics, or direct Resend
submission.

For each grouped contract-owned staff-attention cause, a tenant MAY select a
responsible team or role and exactly one companion posture:
`in_product_only`, `immediate_companion_email`, or
`daily_grouped_summary`. The default MUST be `in_product_only`. A source-owned
security, privacy, legal, or otherwise urgent notice MUST retain the stronger
posture required by its owning contract. Any permitted companion email MUST be
compiled and delivered by Phase 17. Grouping MUST be bounded by tenant, run,
cause, owner, and window so recipient volume cannot create a per-recipient
staff-notification storm.

#### Scenario: Email delivery definitively fails

- GIVEN the ordinary statement email reaches Phase 17/6 definitive failure
- WHEN the frozen Fulfillment Plan contains a compatible paper fallback
- THEN that fallback may activate once
- AND the product does not email the failed destination to announce its own
  failure or create a per-recipient staff notification storm

#### Scenario: A tenant chooses a daily grouped staff summary

- GIVEN the tenant assigned a responsible team and daily grouped summary to a
  non-urgent statement-delivery attention cause
- WHEN many recipients enter that cause during the same grouping window
- THEN one in-product group remains authoritative
- AND Phase 17 may emit at most one permitted daily companion summary for that
  team and grouping key
- AND no recipient-level staff email storm is created

#### Scenario: A corrected statement becomes current

- GIVEN Phase 18 atomically makes one valid successor current
- WHEN the purpose contract and predecessor exposure require an update notice
- THEN Phase 19 admits at most one truthful successor notice
- AND no notice is admitted for an unhealthy, unauthorized, or non-current
  successor

### Requirement: D14 Run Approval Is Proportional And Adds No Ordinary Bureaucracy

Phase 19 MUST derive exactly one of two release floors over the exact Run
Preflight. A **standard** run MUST allow the authorized preparer to use
**Start live run** with only D2's one consequence confirmation and no approval
terminology, reviewer field, mandatory comment, typed phrase, checklist, or
handoff.

A **protected** run MUST require exactly one different currently authorized
human only for a closed, versioned contract-owned reason or when the tenant
chooses review for every live run. Count, amount, first-run status, staff
tenure, Canadian geography, ordinary year-boundary attestation, or unusual but
valid delivery mix MUST NOT independently create protection.

**Request review** MUST release nothing. It MUST use the tenant's optional
eligible default statement-reviewer group or one server-filtered alternate.
Staff MUST be able to change or cancel an unresolved request. If no eligible
reviewer exists, the same surface MUST offer direct reviewer invitation or
reviewer-management recovery rather than a dead end.

Preparer-side request/change/cancel of review MUST require
`statement_operations.start_runs`. Reviewer-side Request changes MUST require
`statement_operations.review_protected_runs`; Approve and start MUST require
both capabilities. A connected paid lane MUST also require
`statement_operations.authorize_direct_mail`.

The reviewer MUST inspect the exact candidate and use one atomic **Approve and
start live run** command or **Request changes** with an optional bounded note;
there MUST be no durable approved-but-waiting state. The final command MUST
re-prove the exact immutable preflight, the separate current review record,
current Phase 12 assurance, and existing step-up only when the session is not
already sufficient, then append the final decision in D2's release transaction.
Independence MUST be based on stable human principal and substantive editor
provenance. Viewing or building preflight MUST NOT make a person an editor. An
editor who becomes the reviewer MUST require another reviewer; alternate roles
of the same human, shared/service identities, support impersonation, and
administrator bypass MUST NOT satisfy the floor. The protected review MUST
include D2's exact physical-piece and bounded-cost/guard consequence when a
connected paid lane is present.

A one-person tenant MAY use Phase 12's verified, expiring, revocable,
candidate-scoped reviewer delegation only when the contract permits it. That
delegation MUST expose the minimum review projection, grant no standing tenant
membership or unrelated data/action access, and end on start, cancellation,
supersession, expiry, or revocation. It MUST NOT satisfy a requirement for a
qualified internal officer.

The run page MUST remain authoritative. A Phase 17 review notification is only
a locator; failed delivery, open/read evidence, dismissal, or forwarding MUST
NOT approve, cancel, duplicate, or lose the request. The first valid group-owned
decision MUST resolve sibling actionable notifications.

Material candidate or governance changes MUST supersede pending review.
Review MUST NOT waive tenant isolation, source eligibility, issuer,
jurisdiction, coverage, current artifact, accessibility, privacy, suppression,
duplicate, idempotency, incident, or evidence blockers. Tenants MAY strengthen
but MUST NOT weaken the contract floor.

#### Scenario: An ordinary ready run starts

- GIVEN no closed protected reason exists and the tenant has not enabled review
  for every live run
- WHEN the authorized preparer starts the run
- THEN no reviewer workflow or approval UI appears
- AND one D2 confirmation and atomic start are the entire release path

#### Scenario: A protected reviewer edits the candidate

- GIVEN a different human is reviewing a protected Run Preflight
- WHEN that reviewer makes a substantive participation or configuration edit
- THEN the person becomes a preparer for the new candidate
- AND the prior review is superseded and another independent reviewer is
  required

#### Scenario: A protected one-person tenant has no eligible reviewer

- GIVEN a governing contract permits candidate-scoped delegated review
- WHEN the sole tenant operator requests review
- THEN the product offers one verified expiring Phase 12 delegation path without
  granting standing membership or unrelated data
- AND if the contract requires a qualified internal officer, release remains
  blocked with a direct reviewer-management next action

### Requirement: D15 Support Overview Is Optional Purpose-separated And Non-tax

Phase 19 MAY create one optional **Support overview — Not a tax document** under
Phase 18's `giving.summary.informational@1` purpose. It MUST remain independent
from every official document's population, source closure, run/item identity,
artifact, access, delivery, correction, control, and completion.

The launch allow-list MUST contain only:

- Phase 14 gift-date, time-bounded household support; and
- DAF recommendations with sufficient non-anonymous sponsor disclosure,
  unambiguous Party mapping, and current access authority.

Unsupported recognition roles MUST create no fields, toggles, placeholders,
jobs, or output. One immutable contribution MUST appear at most once. Direct
legal participation MUST take display precedence over indirect recognition.
Household and DAF sections and each currency MUST remain separate. The overview
MUST NOT show a deductible, official, converted, blended, or direct-plus-
recognition total or claim the Recognition Subject made a legal gift.

The tenant setting **Create support overviews** MUST default Off. When Off, the
feature MUST have zero ordinary operational surface or background work beyond
the discoverable setting. When On, the product MUST create an overview only for
meaningful authorized facts and must carry the persistent **Support overview /
Not a tax document** purpose identity across preview, PDF, portal, email,
print, help, and metadata.

#### Scenario: The feature is off

- WHEN a tenant does not enable Create support overviews
- THEN no overview run item, queue, filter, card, portal placeholder,
  notification, or recognition computation appears in ordinary operations
- AND official statement work is unaffected

#### Scenario: A recipient has direct and DAF-recognized support

- GIVEN the source-authorized projection includes one direct gift and one
  disclosed DAF recommendation
- WHEN the overview is produced
- THEN each immutable contribution appears once in its correct labeled section
- AND no indirect amount enters an official or deductible total
- AND the artifact is persistently labeled Not a tax document

### Requirement: D16 Donor Access Is Unmetered While Outbound Copies Are Bounded

An authorized signed-in donor MUST be able to view, download, and locally print
the exact current Phase 18 canonical PDF repeatedly while it is current,
healthy, lawfully retained, and authorized. Ordinary access MUST have no
donor-visible quota, depletion, cooldown, approval, paywall, or use-based
expiry. Each list, preview, full-byte, range, and download request MUST re-prove
object-level authorization and exact current head.

View, download, HEAD, range, refresh, and local print MUST return the same
immutable bytes and MUST NOT create a document, version, issuance, run item,
communication, fulfillment occurrence, or claim of reading or receipt.
Cancelled, replaced, void, staging, corrupt, disposed, or unauthorized
artifacts MUST NOT appear as peer downloads.

**Send another copy** MAY appear only when the tenant's existing delivery
profile and purpose contract authorize a route. Each deliberate confirmation
MUST create one fresh exact-current outbound occurrence. At most one equivalent
unresolved occurrence may exist for the same logical document, artifact head,
recipient, route, and destination revision. Terminal completion permits a
later deliberate request with a fresh semantic identity; indeterminate outcome
MUST reconcile first.

An additional copy MUST NOT change the run's frozen population. Connected
direct mail MAY be offered only when the published Delivery Profile expressly
permits that copy route. Before paid release, the request MUST atomically pin
and re-prove one exact recipient, current connection revision, one-piece
provider quote or certified upper bound, and remaining capacity inside the
tenant's cumulative per-run spending guard. Ordinary accepted and
outcome-unknown paid attempts and earlier paid copies MUST remain reserved
against that guard until settled. If cost cannot be bounded or the guard is
insufficient, the request MUST have zero paid/provider effect and MAY offer only
already-permitted reviewed digital/self-print alternatives or one typed next
action; it MUST NOT silently switch route.

A staff-requested paid copy MUST require both
`statement_operations.request_statement_copy` and
`statement_operations.authorize_direct_mail`. A donor-requested paid copy MUST
require object-scoped portal authorization plus explicit tenant profile
permission and the same guard proof.
Before a staff paid-copy submission, one concise confirmation MUST show the
recipient, route, masked destination, exact one-piece price or certified upper
bound and currency, and remaining cumulative run guard. Its action label MUST
state the plain consequence, such as **Mail one copy for up to $X**. Submission
MUST re-prove every displayed revision; stale recipient, route, destination,
connection, bound, or guard evidence MUST return to review with zero provider
effect. Donor self-service MUST NOT expose tenant price or guard details.
Any provider submission MUST be performed only by a least-privilege service
principal bound to that exact admitted copy occurrence; the admission MUST NOT
create a provider-facing staff action or authority to widen the recipient,
route, destination, piece count, or reserved bound.

#### Scenario: A donor downloads the same statement repeatedly

- WHEN an authorized donor views, downloads, refreshes, ranges, or locally
  prints the current statement multiple times
- THEN the same exact current bytes remain available without a visible counter
- AND no outbound occurrence, new artifact, or claim of donor receipt is made

#### Scenario: A donor double-clicks Send another copy

- WHEN duplicate gestures or two devices submit the same reviewed copy request
- THEN both return the same durable outbound occurrence
- AND exactly one provider or physical-fulfillment attempt may be released

#### Scenario: A paid copy request reaches an exhausted guard

- GIVEN prior accepted or outcome-unknown attempts reserve the remaining
  connected-direct-mail guard
- WHEN a donor or staff member confirms Send another copy twice
- THEN both requests resolve to one typed blocked or exactly replayed occurrence
- AND no provider submission, new reservation, or charge occurs
- AND exact-current view, download, and local print remain available

#### Scenario: Staff review the cost of one mailed copy

- GIVEN a staff-requested paid copy is profile-permitted and inside the current
  guard
- WHEN authorized staff open its confirmation
- THEN they see the recipient, route, masked destination, currency, exact
  one-piece price or certified upper bound, and remaining guard
- AND the action states the maximum one-copy cost in plain language
- AND a revision change before submit returns to review with zero provider
  effect

### Requirement: D17 Each Run Has One Quiet PII-minimized Evidence Record

Each Statement Run MUST have one logical **Run Evidence Record** that
deterministically projects minimum Phase 19-owned evidence. It MUST preserve the
exact reviewed preflight, frozen population and reasons, release, attributable
review/control commands, numbered completion snapshots, reconciliation,
exception ownership, versions, and recovery correlations.

The record MUST reference rather than copy Phase 7 facts, Phase 18 documents,
Phase 17/6 communications, D9 fulfillment, incidents, source corrections,
supplemental runs, and records state. It MUST NOT copy PDF bytes, message
bodies, exact destinations, raw provider payloads, current CRM profiles, money
facts, or another owner's mutable status.

**At release** and **At completion** evidence MUST remain immutable.
**Follow-up now** MUST show separately owned current truth with an as-of time
and current authorization. The run page MUST present these plus **Records** in
one quiet disclosure.

An existing authorized audit/export capability MAY prepare one fixed,
requester- and scope-bound temporary audit package containing a human-readable
summary, permissioned item/reason inventory, and manifest of versions, counts,
omissions, reference classes, and digests. It MUST be asynchronous,
non-truncating, bounded-memory, idempotent, private, expiring, hold-aware, and
verifiably disposed. It MUST NOT be a configurable report or permanent library.
Staff MAY prepare the fixed package and, with separate current download
authorization, open its exact revision. Disposal MUST be callable only by the
records-retention service principal after re-proving the current expiry,
legal-hold, and disposal fence; there MUST be no staff disposal button or
capability.

#### Scenario: Current source truth changes after completion

- GIVEN a run has immutable release and completion evidence
- WHEN a source correction or delivery outcome changes later
- THEN the frozen evidence remains unchanged
- AND Follow-up now links to the current owner-authoritative state with an
  explicit as-of time

#### Scenario: An audit package expires

- WHEN the temporary package reaches its records-controlled expiry
- THEN future retrieval is blocked and Asym-owned bytes are verifiably disposed
- AND the permanent Run Evidence Record remains available
- AND the product does not claim to recall a copy previously downloaded

### Requirement: D18 Tenant Participation Is Flexible But Cannot Override Eligibility

Phase 7 MUST remain the sole authority for Statement Subject, eligibility,
facts, legal donor, jurisdiction, period, currency, and official coverage.
Phase 19 MAY control only whether an exact currently valid Statement Subject
participates in one not-yet-started run. Missing destination or delivery
failure MUST remain a delivery exception and MUST NOT change eligibility.

Automatic source-authoritative participation MUST be the default. The
preflight MUST expose **Included**, **Needs attention**, **Held**,
**Not in this run**, and **Already current** as projections over one candidate.
**Manage participation** MUST offer only:

- **Use automatic result — Recommended**;
- **Include in this run**, after fresh whole-subject compatibility and duplicate
  proof; and
- **Handle separately**, which resolves to **Hold for follow-up** or
  **Do not include this time** only when the purpose contract permits optional
  omission.

**Add to this run** MUST use permission-filtered, non-enumerating existing-Party
search and return one closed outcome: ready, already included, already current,
needs source correction, incompatible, or not eligible. It MUST NOT create a
shadow Party, select gift lines, or edit totals.

Every accepted command MUST append attributable evidence, re-prove source and
capability versions, advance the candidate revision/digest, and invalidate
prior review. Exact bulk operations MUST apply one compatible result to the
complete reviewed set or report a conflict; silent partial success and
skip-errors are prohibited. After Start, population MUST be immutable.

Tenants MUST separately grant
`statement_operations.add_participants`,
`statement_operations.include_participants`, and
`statement_operations.handle_participants_separately`. A tenant MAY require one
short bounded internal note for sensitive participation actions; the default
MUST require no note. Curated participation MUST appear only where the
governing purpose and jurisdiction explicitly permit it. No tenant setting,
role, note, or manual choice may weaken source-owned eligibility or required
official coverage.

#### Scenario: Staff add an eligible omitted subject before start

- GIVEN server search resolves an existing Party to a compatible, eligible,
  uncovered Statement Subject
- WHEN authorized staff choose Include in this run
- THEN the whole source-authoritative subject is included through one
  idempotent append-only participation command
- AND the preflight revision advances and prior review is invalidated
- AND staff cannot edit its gifts, total, year, currency, or legal donor

#### Scenario: Staff try to omit a required subject

- GIVEN the governing purpose requires the valid Statement Subject to remain
  covered
- WHEN staff choose Handle separately
- THEN the only permitted result preserves a visible owned follow-up
- AND the system does not offer Do not include this time, a waiver, or a clean
  completion fiction

#### Scenario: A tenant requires a note for a sensitive omission

- GIVEN the purpose permits optional omission and the tenant requires a short
  internal note for Handle separately
- WHEN authorized staff choose Do not include this time without that note
- THEN the command returns a field-specific validation result and releases no
  work
- AND a valid bounded note permits the append-only participation command
- AND the note does not waive eligibility, facts, or future coverage
