# Phase 28 D2 — ordinary staff CRM availability, optional selected-staff notice

**Disposition: Accept with required amendments.** Keep the founder's simple
model: make the contact available to staff in the organization's normal CRM;
optionally notify selected staff. Remove the earlier recommendation for a
chosen-collaborator access model. The notification picker selects attention,
not access.

**Ratification:** the founder explicitly ratified this corrected decision and
its required amendments on October 16, 2026 UTC: “Ratify this decision and
amendment. Then continue with this phase 28 grill-with-docs session.” The
interaction/channel recommendation below is accepted as the design direction
included in that reviewed amendment. D2-C01–D2-C20 and the associated proof
obligations are retained for the later authorized specification. This records
product/design acceptance; it does not amend a formal source-owner contract,
qualify runtime behavior or authorize implementation.

Reviewed October 15, 2026 America/Los_Angeles (October 16 UTC), against
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`. This is the completed D2 research and
decision review, not a formal specification, implementation, source-owner
amendment, ticket plan or release qualification. `/to-prd` and `/to-issues`
remain separate transitions. No real contact, staff notification, hosted
database, provider configuration or GitHub state was changed.

## Selected direction, recommendation and exact decision

**Explicit founder choices:** contact sharing makes the contact generally
available to staff in the organization CRM; it must be simple and clearly
explained; notification is optional. The founder then explicitly selected
**Choose staff to notify**, avoiding an all-staff broadcast.

**Ratified delivery direction (recommended in the review):** a short review with one primary action and an
empty optional staff-notification field; one informational in-product notice
per selected eligible staff member through existing P6/P17 ownership; no email,
SMS or channel chooser in this ordinary action. These details are judgments
grounded below and accepted by the later ratification, not additional answers
attributed to the founder's original notification clarification. User testing
must still prove that the interaction communicates the intended consequence.

> **D2 — Make available to staff.** A missionary with the qualified source
> authority can deliberately make a prospect's eligible contact facts available
> in the sending organization's ordinary CRM. Staff can find the contact and
> perform their normally authorized follow-up without individual invitations or
> contact-specific collaborator grants. Existing tenant, protected-record,
> field, purpose and contact restrictions still apply.
>
> Before acceptance, show the organization, the contact details being shared,
> and the fact that private notes and planning are not included. Accept or reuse
> the canonical contact through its existing source owner. Sharing does not
> overwrite independently authoritative facts, expose hidden records, publish
> private history or grant the missionary unrelated staff visibility.
>
> The missionary may optionally select staff to notify. Leaving the selection
> empty sends no notification. Selected recipients affect only the alert;
> ordinary staff CRM availability is the same either way. The notice means the
> contact is available to view and follow up with using existing permissions.
> It neither assigns work nor proves that anyone has read or acted on it, and
> it does not contact the prospect.
>
> Sharing and notification have separate truthful outcomes. Once sharing is
> accepted, a notification failure cannot undo it or cause another contact/share
> on retry. Repeated delivery of the same intended action produces one source
> effect and the same requested attention. Unknown outcomes reconcile the same
> operation under current access.
>
> This action does not create a task, cultivation enrollment, Request, gift,
> commitment, newsletter subscription or coach access. It adds no routine
> approval ceremony, automatic sharing trigger, permanent-publication promise
> or general Unshare right.

This resolves D2. No further answer is needed to choose the ordinary sharing
audience or notification recipients. Source resolution, safe retry and the
ratified in-product channel are engineering/design work, not questions to
hand back to the founder. Exceptional access to unshared preparation and
departure/retention policy remain separate product rights outside D2.
**Subsequent D3:** the founder has now selected no new continuity-access right;
see the [D3 review](phase28-d3-adversarial-review.md). This resolves that access
choice without adding an archive/deletion or retention policy to D2.

## Evidence, current behavior and permanent direction

| Class                     | Established evidence                                                                                                                                                                                                                                                        | Limit                                                                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Founder feedback          | Broad staff contact availability, simple understandable UX, optional notification to selected staff.                                                                                                                                                                        | No claim of representative missionary/staff usability testing or measured adoption benefit.                                                 |
| Governing repository      | ADR-0001 single native CRM; P4/P9 identity/contact ownership; P3/P10/P12 authorization; P27 deliberate work/private-history separation; ADR-0027 and P6/P17 notification ownership; ADR-0183 task independence; ADR-0211 policy governance.                                 | Accepted target contracts do not prove current implementation or hosted configuration.                                                      |
| Current implementation    | Broad staff donor reads are a compatible starting destination after qualified sharing. No inspected source command implements D2. Staff bell is demo UI; missionary notification preferences are local state. Legacy queue has donor-specific meaning and broad staff CRUD. | Static source/migration findings, not observed production exposure or complete deployed-worker inventory.                                   |
| Primary external research | Current Google Drive, Microsoft/SharePoint, Dynamics, nonprofit CRM, W3C/WAI and GOV.UK guidance; official Supabase/PostgreSQL and transactional-outbox documentation.                                                                                                      | Product-specific documented patterns are evidence to evaluate, not permission to import vendor ACLs, sales workflows or broadcast defaults. |
| Executed mechanics        | Focused disposable PostgreSQL probe exercises new share/request atomicity, semantic deduplication, recipient-set binding, concurrent submissions and independent notice outcomes.                                                                                           | It does not qualify actual CRM identity admission, Supabase Auth/Data API, P6/P17, multi-recipient delivery or a browser journey.           |
| Judgment                  | One ordinary CRM destination and optional selected attention solve the founder's chosen coordination job more simply than per-contact collaboration rights.                                                                                                                 | Exact user comprehension, task time, load budgets and operational incidence require real evidence before activation.                        |

Source notes: [owner boundaries](d2-evidence/owner-boundaries.md),
[current runtime](d2-evidence/current-runtime.md),
[notification boundary](d2-evidence/notification-boundary.md),
[UX research](d2-evidence/ux-research.md),
[product synthesis](d2-evidence/product-synthesis.md),
[technical research](d2-evidence/technical-research.md), and
[PostgreSQL probe](d2-evidence/postgres-probe/README.md).
The [D1 review](phase28-d1-adversarial-review.md) remains evidence for restricted
preparation, RLS and private derivatives; D2 settles the sharing destination
that D1 deliberately left open.

### Concrete findings that change implementation, not the chosen simplicity

1. **Current ordinary staff reads are useful after sharing.** They are not the
   restricted preparation store. A whole-row visibility flip would expose
   legacy notes/history; preserve the source separation instead.
2. **There is no qualified contact-share producer or general staff notice
   journey in the inspected code.** The static bell, unsaved preferences and
   queue columns cannot support a claim that staff were notified.
3. **The legacy notification queue must not be activated for this purpose.**
   It is donor-oriented, permits staff payload/status changes under committed
   policies, and has no inspected application consumer. P17 already identifies
   it as migration input, not the future communication spine.
4. **Existing finance and Eve notifications supply useful mechanics, not D2
   authority.** Their approver/operator recipients, task obligations, event kinds
   and channels cannot silently become contact-sharing behavior.
5. **Identity admission needs its own qualified seam.** Hiding a duplicate's
   details is insufficient if success versus rejection reveals a protected
   match. Do not auto-merge or create a public duplicate to evade that boundary.

### Executed proof and its limits

The isolated PostgreSQL 17.11 D2 run passed **43/43 expected outcomes**, including
unsafe counterexamples and one actual two-session race with an observed
transaction lock wait. It tests atomic source/audit/optional-request acceptance,
same-occurrence deduplication across different request keys, changed recipient
meaning, order/duplicate normalization, local projection failure, claim tokens
and separate availability/engagement evidence. The container and anonymous data
volume were removed and their absence verified.

This is neither a proposed production schema nor full runtime proof. The toy
materialization handles one selected recipient; multi-recipient delivery,
concurrent recipient revocation, real Core permissions, canonical identity
admission, Supabase Auth/PostgREST, P6/P17, browsers and performance are unproved.
D1's 34 engine assertions remain separately recorded; they were not rerun or
added to D2's count. No provider, staff member or real prospect was contacted.

### Review verification

Independent product/governance and notification-owner cross-review confirmed
the selected-versus-recommended boundaries and P6/P17 semantics. The review
corrected cancellation wording: only cancel before submission guarantees no
command; closing an in-flight request cannot guarantee that it will not commit.

Structural verification passed for all 22 categories, 12 consolidated concerns,
20 proposed clauses, 17 proof scenarios and seven requested headings. All 84
local document links across the research notebook resolve, including 30 in D2
artifacts; six D2 evidence JSON files parse. Probe source/helper hashes match
the executed results, Python syntax is valid, and cleanup evidence verifies
container/data-volume absence. The original uploaded brief remains byte-for-byte
preserved. Markdown/JSON/glossary formatting and tracked diff whitespace checks
pass. These are artifact/mechanics checks, not feature qualification.

## Consolidated concern register

Severity describes potential harm if the condition occurs: **High** for
unauthorized disclosure, identity corruption, false business outcomes or loss of
durable evidence; **Medium** for substantial friction, noise or maintenance.
Likelihood is conditional and qualitative, not an invented incident rate.
Every concern below states the decision effect and exact amendment/proof IDs.

### D2-R01 — “All staff” could become either too narrow or a universal bypass

**What/why:** retaining the proposed collaborator list would fail the founder's
chosen general CRM access. Treating a staff role as unrestricted authority could
instead disclose protected people, sensitive fields or another tenant's data.
**High; likely if either shortcut is used.** P3/P10/P12 and ordinary P9 CRM
contracts establish the difference; the current broad staff read is not a
qualified universal grant.

**Effect:** preserve the broad ordinary audience, with inherited exceptions.
**Permanent fix:** use the standard same-organization CRM projection under
current permissions. No per-contact staff ACL or role-name bypass. Record
**D2-C01/C02**; prove **D2-P01/P02/P03**.

### D2-R02 — Sharing the contact could publish the private notebook

**What/why:** a generic shared flag, copied note, summarized history or raw
webhook exposes information the missionary did not choose to share. D1's
restricted-note-to-command-log discrepancy makes derivative leakage a concrete
reuse hazard. **High; likely if whole legacy rows or general activity are reused
unchanged.** P27 D26 prohibits laundering private context into shared history.

**Effect:** narrows the payload to reviewed eligible contact facts, not the staff
audience. **Permanent fix:** an allowlisted contact projection, separately
restricted preparation/history, minimal audit/events and safe source reads.
No free-text private-history summary in the notification. **D2-C03/C04**;
**D2-P02/P07/P13**.

### D2-R03 — Identity handling could corrupt records or reveal a protected match

**What/why:** email/name matching can join spouses or church mailboxes; upsert
can overwrite existing details; absent succeeds while hidden-existing fails,
disclosing protected existence. **High; plausible with naive matching and
generic error normalization.** P4/P9/P10, durable CRM identity requirements and
P27 P03 supply the constraints; D1 SQL proves relevant constraint channels.

**Effect:** ordinary permitted sharing remains simple; universal instant
admission of arbitrary input is not a justified promise. **Permanent fix:**
qualified canonical create/reuse and correction authority; evaluate the exact
minimum result authority before existence-dependent outcomes. Where absent and
hidden-existing cannot be distinguished safely, both take the same bounded
defer/deny path. No dummy identity, automatic merge or blanket staff queue.
**D2-C05/C06**; **D2-P04/P05/P06**. The usable new-person admission seam is a
required owner deliverable, not permission to ship permanent deny-only behavior.

### D2-R04 — A notification recipient could become an owner or access grant

**What/why:** choosing two people might accidentally restrict contact visibility
to them, assign tasks, create compulsory follow-up or broadcast to all staff.
It could also admit newsletter consent or contact the prospect. **High for
unauthorized effects; Medium for coordination noise; plausible through reuse
of task/approval workflows.** Founder clarification, ADR-0027/0183 and P27
separate attention, authority and obligations.

**Effect:** makes the selected behavior precise without adding steps.
**Permanent fix:** fixed ordinary staff availability; explicit optional staff
attention only; no selection means no notification; no downstream business
effects. **D2-C07/C08/C09**; **D2-P01/P08/P09**.

### D2-R05 — A “simple” implementation could trust an unqualified queue

**What/why:** enabling a worker on legacy caller-writable queue rows could
execute fabricated messages or statuses. Reusing finance/Eve recipients or
direct email bypasses the correct source. **High; conditional on adopting those
paths without migration.** Current code/migration evidence and P17's explicit
REAL/FORWARD distinction support this finding.

**Effect:** the notice requires the existing communication owners' exact
extension; it does not justify a new subsystem. **Permanent fix:** trusted
source request, P6 communication facts and P17 local Information presentation;
qualify grants, functions, writers and deployed data before activation.
**D2-C09/C10/C16**; **D2-P08/P13/P16**. Contact sharing itself need not wait on
external email, campaigns, SMS, AI or Phase 34 workflows.

### D2-R06 — Partial failure could misreport sharing or repeat the effect

**What/why:** write contact then enqueue/log can leave a shared contact behind an
error; retry can create another contact or alert. A worker crash can lose or
repeat attention. **High; plausible under normal interrupted networks and
concurrency.** Current D1 note sequencing, official transaction/outbox guidance
and the D2 probe demonstrate the failure class.

**Effect:** requires reliable acceptance, not a longer user workflow.
**Permanent fix:** atomically accept source admission, required minimal audit,
receipt and optional durable notification request. Bind retries to intended
meaning and the source occurrence, not only one HTTP ID. Separate later local
availability from accepted sharing. **D2-C10/C11/C12**;
**D2-P10/P11/P12**.

### D2-R07 — Stale recipients, source changes and late responses could leak data

**What/why:** selected staff depart, permissions narrow, identities merge or a
contact becomes protected between preview and notice display. An old response
can repopulate a switched-tenant screen. **High; plausible in real staff
lifecycle.** P12, ADR-0027 and D1's cache/legacy-role evidence require current
authorization independently at each boundary.

**Effect:** does not change contact audience or add collaborator management.
**Permanent fix:** validate current selected recipients before acceptance;
recheck at materialization, presentation and link opening. Fence stale writes
and wrong-context responses; do not broaden the initial selected set on retry.
**D2-C02/C08/C12/C13**; **D2-P03/P08/P12/P13**.

### D2-R08 — The UI could hide the consequence or overpromise recovery

**What/why:** “Share” can mean link sharing, public publication or recipient-only
access; a toggle suggests reversible secrecy; a toast can falsely imply
notification delivery. A long wizard or mandatory explanation adds needless
friction. **High for unintended disclosure; Medium for friction; plausible,
incidence unmeasured.** Primary sharing, form, error and accessibility guidance
supports clear consequence labels and separate notification control.

**Effect:** strengthens the founder's requested simplicity. **Permanent fix:**
one concise review, exact audience/details, optional empty recipient field,
one named action, durable result and notification-only repair. No permission
matrix, mandatory essay, second confirmation or blanket Undo promise.
**D2-C14/C15**; **D2-P14/P15**.

### D2-R09 — Notification engagement could turn into a false work tracker

**What/why:** read/archive may be mistaken for follow-up, unread may imply
neglect, or a routine notice may become persistent urgent work. **Medium;
plausible when copying task/approval patterns.** ADR-0027 defines Information
separately; ADR-0183 requires an actual action obligation before projecting a
task. No founder evidence supports staff-performance monitoring here.

**Effect:** keeps D2 informational. **Permanent fix:** use the existing
Information presentation policy and source end rule; preserve read, delivery,
source availability and actual follow-up as different facts. No SLA, reminders,
productivity score or new supervision feed. **D2-C09/C13**;
**D2-P09/P13**.

### D2-R10 — Complexity, fan-out and manual resolution could overwhelm the job

**What/why:** a publish platform, per-contact permissions, custom channels,
standing review queue, all-staff directory download or per-notice full scans
increase cost and slow capture. **Medium; plausible, workload unmeasured.**
Existing owners and the selected staff-notify model avoid most of that scope;
current capped/local-window queries are not production performance proof.

**Effect:** chooses the smaller permanent solution. **Permanent fix:** one
source command, existing ordinary CRM, existing notification owners, authorized
paged staff lookup, bounded source/recipient queries and owner-command repair.
Measure rather than invent capacity numbers. **D2-C16/C17/C18**;
**D2-P01/P15/P16/P17**.

### D2-R11 — Cutover, correction or restore could replay or falsely erase sharing

**What/why:** old writers bypass the new command; bulk inference marks private
data shared; restoring old state recreates notice effects; deleting preparation
erases independent staff work. A reverse switch may promise recall that cannot
be delivered. **High; plausible, retained-state distribution unknown.** D1's
source trace and P9/P27 retained-history rules establish the need for explicit
cutover and correction.

**Effect:** no new Unshare right or forever-share policy is inferred.
**Permanent fix:** preserve accepted source facts/provenance, current
restrictions and consumed effects; fence old writers; use exact source-owned
correction/removal and safe disablement. **D2-C19/C20**;
**D2-P06/P13/P16**.

### D2-R12 — Research artifacts could be mistaken for a finished feature

**What/why:** founder preference, primary documentation, a green SQL fixture or
static bell may be reported as proven UX, deployed security or working
notifications. **High for false readiness; likelihood unknown.** The repository
itself distinguishes forward owner contracts from current implementation.

**Effect:** accepts D2 as the product decision, with exact release evidence
required. **Permanent fix:** trace the decision, proposed clauses, owner
reconciliation and outcome tests; keep actual execution scope visible. Target
users must prove audience/notification comprehension; actual services must
prove new-contact admission and notice availability. **D2-C20**;
**D2-P01–D2-P17**. No invented adoption, latency or accessibility claim.

## All 22 requested categories

Each row explicitly evaluates material concern. Referenced concern IDs provide
harm, importance, severity, conditional likelihood, evidence, effect on the
answer and exact permanent amendment/proof. Reuse avoids contradictory duplicate
requirements for the same underlying failure.

| #   | Category                                                      | Material concern and assessment                                                                                                                                                                                                                                           | Required treatment                                                                                                                                            |
| --- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Problem validity, necessity, and alternatives                 | **Yes — Medium.** D2-R10/R12: the founder chose useful staff coordination, but no measured adoption problem or pilot benefit is established. Chosen-collaborator access is the strongest narrower alternative and was explicitly rejected.                                | Keep ordinary CRM availability. Validate the actual share/find/follow-up job. A manual verbal heads-up cannot make a private contact available in the system. |
| 2   | Brittleness                                                   | **Yes — High.** D2-R01/R06/R07: role shortcuts, UI-only sharing, stale previews and sequential writes assume ideal conditions.                                                                                                                                            | Current source commands, explicit accepted outcomes and authorization at each effect/read boundary.                                                           |
| 3   | Technical debt                                                | **Yes — Medium–High.** D2-R05/R10/R11: repurposed queues, two contact masters and legacy writers create inconsistent meaning.                                                                                                                                             | Extend the correct owners; no copied shared-contact store or competing notification history.                                                                  |
| 4   | Edge cases                                                    | **Yes — High.** D2-R03/R06/R07: existing/hidden contacts, shared mailboxes, changed fields, repeated submit, merge and departure alter outcomes.                                                                                                                          | The scenario matrix below distinguishes successful reuse, unresolved admission and notification-only failure.                                                 |
| 5   | Footguns                                                      | **Yes — High.** D2-R02/R04/R05: whole-row publication, arbitrary recipients/statuses, broadcast fallback and generic Unshare are easy mistakes.                                                                                                                           | Explicit field projection, trusted source/actor, optional named attention, no implied grants or reversal.                                                     |
| 6   | Tenant safety                                                 | **Yes — High.** D2-R01/R07: recipient IDs, Party links and stale organization context can mix scopes.                                                                                                                                                                     | Same-tenant relationships, current staff eligibility, trusted context and protected status/deep-link queries.                                                 |
| 7   | Database, RLS, and authorization safety                       | **Yes — High.** D2-R01/R03/R05/R06: broad policies/privileged paths, mutable provenance, incomplete FKs and non-atomic effects can undermine source rules.                                                                                                                | Exact grants/RLS USING/result predicates/functions/columns, composite tenant references, constraints and durable operation/effect uniqueness.                 |
| 8   | Overengineering                                               | **Yes — Medium.** D2-R10: collaborator ACLs, publication infrastructure, channel menus or per-entry approvals would add unrequested complexity.                                                                                                                           | One ordinary CRM destination, one optional selected-staff notice, existing owner infrastructure.                                                              |
| 9   | UX/UI and user friction                                       | **Yes — High/Medium.** D2-R08: ambiguous labels, long confirmation flows, unsafe autofill and unclear partial success hurt trust and completion.                                                                                                                          | Short review, exact contact preview, optional recipient field, accessible feedback and independent notice status.                                             |
| 10  | Source of truth, ownership, and domain invariants             | **Yes — High.** D2-R02/R03/R04/R06: contact facts, private assertions, share occurrence, attention and actual follow-up can be conflated.                                                                                                                                 | P9/P4 identity/contact; P12 access; P6 communication truth; P17 presentation; no task or P27 admission by inference.                                          |
| 11  | Hidden coupling                                               | **Yes — High.** D2-R02/R05/R09: notes, audit, financial notifications and task consumers may inherit the wrong audience or consequence.                                                                                                                                   | Qualify exact producer and every reached derivative; association is not authority.                                                                            |
| 12  | Failure modes                                                 | **Yes — High.** D2-R06/R08: shared contact behind error, lost request, duplicate notice and failed refresh can mislead.                                                                                                                                                   | Atomic acceptance and receipt; recover same operation; repair notice without resharing.                                                                       |
| 13  | Lifecycle, temporal correctness, concurrency, and idempotency | **Yes — High.** D2-R06/R07/R11: simultaneous shares, changed recipients, merge/revoke and restore can duplicate or reinterpret effects.                                                                                                                                   | Source occurrence plus payload-bound request identity, expected revision/current authority, explicit temporal outcomes and no historical replay.              |
| 14  | Data integrity risks                                          | **Yes — High.** D2-R03/R06/R11: mistaken merge, stale overwrite, forged actor or duplicate admission corrupts canonical facts.                                                                                                                                            | Qualified identity resolution and correction; immutable origin; database-enforced scope/identity; actual race proof.                                          |
| 15  | Security and privacy risks                                    | **Yes — High.** D2-R01/R02/R07: broad sharing may spill private notes, protected identities, locations or retained artifacts.                                                                                                                                             | Data-minimized ordinary contact admission; source restrictions on logs, files, exports, caches and notifications; no recall promises.                         |
| 16  | Scalability and performance risks                             | **Yes — Medium, unmeasured.** D2-R10: full directory loads, per-row checks and uncontrolled materialization grow with staff/contact volume.                                                                                                                               | Authorized bounded search/query plans, finite selected recipient set, indexed effect identities, evidence-based release budgets.                              |
| 17  | Operational burden                                            | **Yes — Medium.** D2-R03/R05/R10: routine SQL repair, standing resolver queues or new administration could make a simple action expensive.                                                                                                                                | Clear cases need no routine review; exact owner repair for exceptions; share remains useful without external providers.                                       |
| 18  | Observability and auditability gaps                           | **Yes — High.** D2-R06/R09: inadequate receipts hinder diagnosis while raw payload logs leak and engagement is misread.                                                                                                                                                   | Body-minimized durable source/communication evidence and separate technical diagnostics; no diligence metrics.                                                |
| 19  | Dependency and integration risks                              | **Yes — High if wrong infrastructure is reused.** D2-R05/R10: raw webhooks, provider IDs or narrow finance/Eve contracts are not D2 ownership.                                                                                                                            | Exact P9/P12/P6/P17 local seam; no new queue/provider dependency or external send fallback.                                                                   |
| 20  | Migration, rollout, and upgrade risks                         | **Yes — High.** D2-R11: retained rows, mixed clients and rollback may reopen access or replay notices.                                                                                                                                                                    | Census, writer fencing, source-preserving migration, gated activation and safe disable/restore.                                                               |
| 21  | Testability, traceability, and proof                          | **Yes — High.** D2-R12: mechanics or mocks may be mistaken for source-to-user proof.                                                                                                                                                                                      | Decision-to-clause-to-owner-to-test mapping; positive staff discovery and selected-recipient real inbox proof as well as negative cases.                      |
| 22  | Other development hazards                                     | **No additional distinct material concern found.** Checked financial types, phase boundaries, terminology, private-versus-high-risk classification and accidental new mandatory workflows. D2 introduces no money math, new provider, public page or mandatory reporting. | Preserve the exclusions in D2-C07/C16/C20; do not manufacture additional machinery to fill this category.                                                     |

## Exact proposed amendments for the later specification

These are review-ready clauses, not a formal specification or silently approved
source-owner amendment. They implement the chosen behavior through existing
owners and identify the required proof.

- **D2-C01 — Ordinary staff destination.** “Accepted sharing makes the contact
  discoverable in the sending organization's ordinary staff CRM without
  per-contact invitations, collaborator membership or bespoke staff grants.
  Existing P3/P10/P12 source, field, safety and purpose floors still apply.”
- **D2-C02 — Trusted authority.** “Resolve Tenant, actor, current source action
  and allowed projection from trusted server context. Caller values cannot
  establish author, owner, tenant, approval, audience or audit authority. The
  missionary's bounded admission action is not general staff CRM access.”
- **D2-C03 — Exact shared facts.** “Review and accept only eligible contact
  facts for the exact source revision. Shared facts use P9/P4 canonical
  ownership; independent existing facts cannot be silently overwritten. No
  shared mirror or second editable person master is created.”
- **D2-C04 — Private history remains private.** “Sharing contact facts does not
  copy, quote, summarize, relabel or expose private planning, notes, attachments,
  referral context, care/Support facts or earlier private activity through
  records, search, history, audit, exports, notification or AI.”
- **D2-C05 — Qualified identity admission.** “Create/reuse the canonical
  identity only through its qualified owner; names, email and phone are match
  evidence, not universal person keys. Preserve provenance and restrictive
  source rules across ambiguity, conflict, merge and correction.”
- **D2-C06 — Safe result authority.** “Prove minimum admission/reuse-result
  authority before existence-dependent outcomes. Without it, absent and
  hidden-existing inputs follow the same bounded defer/deny path across
  response, timing, links, repair and notification. A generic error after a
  revealing lookup is insufficient. An accepted preparation/request is not
  accepted staff availability; qualify a usable new-person lane before release.”
- **D2-C07 — No implied work or contact.** “Sharing and notification create no
  task, staff responsibility, interaction, cultivation, Request, gift,
  commitment, subscription, coach right or prospect outreach. Actual follow-up
  uses existing source actions, current consent and contact restrictions.”
- **D2-C08 — Selected attention only.** “An empty notification selection means
  no notice. A nonempty selection identifies exact current eligible same-Tenant
  staff recipients; it never restricts ordinary contact availability. Reject
  forged/invalid recipients safely; normalize duplicate selection without
  expanding the set. No guessed recipient or all-staff fallback is allowed.”
- **D2-C09 — Existing local notification contract.** “Use one P9 source event,
  P6 recipient communication truth and P17 informational in-product
  presentation. Use the registered Information policy and exact source end
  rule. No email, SMS, push, reminder, required-task or external-provider step
  follows from this ordinary action.”
- **D2-C10 — Atomic source acceptance.** “Before acceptance, revalidate reviewed
  source/contact facts and selected recipients. Atomically persist the accepted
  source effect, required minimal audit, recoverable receipt and optional
  durable identifier-only notification request. A failed required write accepts
  none of them. Later local materialization is independent.”
- **D2-C11 — Semantic identity.** “Bind the durable operation to Tenant,
  current actor, source occurrence, action, expected meaning and normalized
  contact/recipient payload. Same intended delivery repeats no source effect
  or attention. A changed meaning conflicts; another HTTP ID alone cannot
  create a second occurrence. Distinct legitimate source work is not collapsed
  into one lifetime notification per Party.”
- **D2-C12 — Separate outcomes and recovery.** “Show share acceptance separately
  from notification requested/available/failed or unknown. Recover an ambiguous
  share with its original identity and current authority. After share commits,
  notice failure repairs only the original notice; it cannot undo or repeat
  sharing. Failed refresh is not failed acceptance.”
- **D2-C13 — Current recipient and source.** “Recheck exact recipient/source
  eligibility before notice availability, display, counts, recovery and target
  opening. Later changes may narrow the selected set but cannot recruit new
  recipients on replay. Notification engagement never grants access or proves
  follow-up. Remove forbidden cached/late-response presentation.”
- **D2-C14 — Clear simple action.** “Use one short consequence review that names
  the organization, ordinary staff audience and exact shared contact details,
  and states that private notes/planning are excluded. Make staff notification
  an optional empty selection, clearly separate from access. Use an explicit
  action label; no permission matrix, mandatory essay or repeat confirmation.”
- **D2-C15 — Accessible honest UI.** “Provide equivalent keyboard, screen-reader,
  touch and narrow-screen operation, with readable international contact/staff
  names, recoverable input, inline correction and durable status. Announce
  accepted sharing truthfully; show only source-proved notification outcomes.
  Do not imply universal instant admission, recalled disclosure or staff action.”
- **D2-C16 — Reuse and bounded scope.** “Evolve existing identity, CRM,
  permission and notification ownership. Do not activate legacy generic queue
  rows, reuse finance/Eve recipient meaning, reopen old browser grants or add
  another CRM, ACL, notification engine, broker or provider. Ordinary sharing
  has no routine approval/recipient-acceptance ceremony.”
- **D2-C17 — Bounded work.** “Use permission-filtered paged staff/contact queries,
  stable source identity, selective indexes and bounded worker work. Freeze
  numerical latency, row, memory and network budgets from representative
  evidence before activation; generic vendor throughput is not a Core budget.”
- **D2-C18 — Operable repair and evidence.** “Keep a durable, minimized account of
  who requested what permitted share/notice, accepted revisions, selected
  recipient references and exact outcomes under their source audiences. Routine
  repair uses owner commands, not direct SQL or private-content logs. Technical
  traces and recipient engagement are not business completion.”
- **D2-C19 — Correction and retained state.** “Sharing does not itself authorize
  generic Unshare or deletion of independent CRM facts. Apply qualified source
  correction, retention and access restriction without promising recall.
  Restore/import/rollback preserve newer restrictions, accepted work and
  consumed notice effects; no historical outreach/notification replay.”
- **D2-C20 — Qualification and cutover.** “Inventory reached retained data and
  readers/writers; prove compatible schema/client transition and fence old
  writers before activation. Require real source/Supabase/API/recipient/UI,
  concurrency, migration, accessibility and load evidence. Disable only the
  affected capability safely on failure; preserve source truth and restrictions.
  Planning, synthetic proof and release evidence remain separately labeled.”

## The minimal UX to carry forward

Use the product's existing Base UI/base-maia patterns. This is proposed wording
and interaction, not a new component, implemented screen or extra policy editor.

**Entry action:** `Make available to staff`.

**Short review title:** `Make this contact available to staff?`

**Audience copy:** `Staff at [Organization] will be able to find this contact in
the CRM and follow up using their normal permissions.`

**Private-context copy:** `Your private notes and planning will not be shared.`

Show the exact eligible name/contact details in a compact readable summary.
Offer correction through the owner-backed editor if needed, not a field-by-field
permissions matrix. Existing canonical contact differences require the exact
source correction outcome; never silently display a value as accepted when it
was not. Normal contact restrictions remain in force.

**Optional field:** `Notify staff (optional)` — an initially empty, accessible
searchable staff selector. Helper: `Selected staff get an in-app notification.
This does not change who can see the contact.` No separate notification checkbox
is required if the empty/nonempty field already expresses the choice clearly.
The final arrangement should follow existing components and tested usability.

**Primary action:** `Make available to staff`. **Secondary:** `Cancel`.
Cancel before submission changes neither CRM visibility nor notifications.
After submission, closing the dialog or navigating away cancels only the UI;
the in-flight command may still commit even if it had not accepted yet. Recover
the same operation before offering another submit. A lost response likewise
does not undo an accepted source effect.

**Accepted status:** `Available to staff at [Organization]`.
Add only the actual notice status, for example `Notification pending` or
`Contact is available. We couldn't notify [Name].` A permitted retry acts
on that notification alone. A successfully materialized in-product notice is
not proof of reading or follow-up. Do not claim instant staff search refresh if
the reader projection has not actually caught up; qualify end-to-end discovery.

**Staff notice:** a concise Information item such as `Contact available in CRM`,
with a safe authorized contact label if permitted and `View contact`. The wording
must remain true when the person already existed. The authenticated destination
loads current permissions; no inline contact/outreach/assignment action or
private handoff message is needed for D2.

### Result and lifecycle distinctions

| Condition                                                    | Source outcome                                                                    | UI and permitted recovery                                                                                                            |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Cancel before submission                                     | No command sent; no share/notice accepted                                         | Return to unchanged restricted preparation.                                                                                          |
| Current contact/recipient validation fails                   | Nothing accepted for that attempted command                                       | Explain the safe correction; preserve permitted input. Share without notification remains an explicit choice, not a silent fallback. |
| Qualified new contact or existing permitted contact accepted | Canonical contact available; source receipt exists                                | Show source-proved available/reused outcome. No duplicate, fake donor status or invented consent.                                    |
| Existing contact has differing facts                         | Exact owner decides what can be reused/accepted                                   | Show permitted conflict/correction outcome. Do not silently overwrite or claim every supplied detail was accepted.                   |
| Admission authority unresolved                               | Restricted preparation remains saved; sharing not accepted                        | Truthful bounded status with permitted owner repair; no hidden reason, fake success or permanent deny-only substitute.               |
| Share accepted, no staff selected                            | Contact available; no notification request                                        | Show available state. No alert, all-staff broadcast or assignment.                                                                   |
| Share accepted, notification request accepted                | Contact available; local notice processing separate                               | Show available plus pending/available/failed outcome from the notification owner.                                                    |
| Lost response                                                | Acceptance initially unknown to client                                            | Reconcile the same operation. No new contact or recipient set.                                                                       |
| Repeated share/worker delivery                               | Same intended source and attention effect                                         | Return current permitted receipt/status; no new unread or new recipients.                                                            |
| Recipient revoked after acceptance                           | Contact source state unchanged; recipient presentation denied/ended as applicable | No further disclosure or guessed replacement. Existing accepted share remains historical truth.                                      |
| Read/archive/expiry of information item                      | Personal attention only                                                           | Contact remains in CRM; no completed follow-up, task closure or unshare.                                                             |
| Later source restriction/correction/removal                  | Exact owner governs                                                               | Hide forbidden content and preserve lawful evidence; no assurance already seen data can be recalled.                                 |

Information uses ADR-0027's existing
`presentation.information_30d_then_recent_90d@1` and exact source-applicability
rule, not a new D2 retention configuration. Its 30-day unread and 90-day recent
presentation semantics are not contact retention or proof of business activity.
Server acceptance time and historical preparation/interaction times remain
distinct; old data imported today does not manufacture a new notice occurrence.

## Database and domain invariants

The exact schema is not frozen here. The implementation must make these
combinations impossible or enforce them at one authoritative command:

- Required Tenant/source/actor attribution is non-null and trusted; global Auth
  identity is not fabricated as a tenant-owned person. P9 Party subtype/contact
  ownership remains canonical, and accepted historical actor/source attribution
  cannot be edited by generic patches.
- Tenant-owned identity, recipient and source relationships prove same-Tenant
  linkage with appropriate composite keys/FKs and current source eligibility.
  A foreign key's existence does not authorize reading or contacting its target.
- Ordinary staff availability is a source state interpreted by normal CRM
  permission rules. Selected notification recipients are a separate bounded
  set, not the contact's ACL. No money, currency, financial score or giving
  lifecycle field is required by this action.
- One intended source sharing occurrence has one accepted outcome and at most
  one selected attention request for that meaning; repeated transport keys do
  not recreate it. Each accepted recipient/channel occurrence is independently
  deduplicated. Genuine distinct source work is preserved.
- Recipient set normalization preserves semantic equality; order and duplicate
  selections do not create new intent. Changed fields or recipients under the
  same operation conflict. Source revisions and current-authorization fencing
  prevent stale changes or read-check/write races.
- Required contact effect, audit/receipt and optional source request commit
  together. Required-write failure rolls back the attempt. Downstream notice
  state cannot change contact truth; local availability, personal engagement
  and follow-up remain distinct owners/facts.
- Append-only accepted occurrence/audit evidence is separate from correctable
  contact state and mutable personal engagement. Disposition follows lawful
  source retention; neither indefinite raw snapshots nor arbitrary cascade
  deletion are a default. Contact/preparation deletion cannot cascade into
  unrelated financial history or accepted staff work.
- Reads, search/counts, mutations, result lookup, views/RPCs, storage, privileged
  service paths and repair preserve the same boundary. Qualify effective grants,
  both existing/result row conditions, permitted columns, function ownership and
  execution, not merely presence of an RLS policy or a server route.

## Acceptance and adversarial proof matrix

These are required observable outcomes for the later implementation. Synthetic
mechanics establish only the subset explicitly recorded in the probe.

| Proof                                           | Discriminating cases and pass condition                                                                                                                                                                                                                                                             |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D2-P01 — Ordinary useful path                   | New permitted contact becomes findable/openable in ordinary staff CRM after accepted share; staff who were not notified see it too and can use normally permitted follow-up. Missionary retains permitted context. No collaborator setup or fake donor/ministry required.                           |
| D2-P02 — Exact disclosure                       | Synthetic private markers in notes/planning/referral/attachments remain absent from staff source, search, timeline, logs, notification, exports and AI. Reviewed permitted contact fields are visible. Existing independent staff facts remain unchanged.                                           |
| D2-P03 — Authority matrix                       | Author/other missionary, ordinary staff, selected/nonselected staff, revoked staff, coach-only, donor-only, anonymous and another Tenant; forged actor/tenant/recipient, stale role fallback and wrong-context response. Each permitted positive and prohibited read/write/result is verified.      |
| D2-P04 — Existing/ambiguous identity            | Authorized existing person is reused; new contact, no-email person, spouses, church mailbox, same-name people and corrected address do not auto-merge, duplicate or overwrite. Result states exactly which facts were accepted.                                                                     |
| D2-P05 — Hidden-existing versus absent          | Paired data differing only in protected identity/work across response/timing/counts/constraints/repair/notifications. Minimum result authority is checked before existence-dependent outcomes; no public duplicate or hidden-match signal. Useful authorized new-person admission is also proved.   |
| D2-P06 — Canonical conflict and merge           | Share during canonical edit/merge/archive/classification change and stale preparation update. Expected revision/current authority prevents silent overwrite; qualified redirect preserves restrictions and lineage.                                                                                 |
| D2-P07 — Every mutation boundary                | Actual Supabase grants, RLS policy combinations, USING/WITH CHECK, column changes, direct API/RPCs, service roles, function/view owners, audit writes and storage. Arbitrary visibility/status/author changes and legacy queue injection cannot manufacture share or notice.                        |
| D2-P08 — Optional selected attention            | Empty set creates none. Multiple selected staff receive only their admitted item; other staff still see contact but get no notice. Duplicates/order normalize, forged/cross-tenant/ineligible recipients fail safely, changed selection cannot reuse an accepted operation. No all-staff fallback.  |
| D2-P09 — No inferred effects                    | Share, local availability, read, archive and link-open leave task/assignment/cultivation/consent/newsletter/gift/interaction/coach facts unchanged. Contact restrictions still block prohibited outreach.                                                                                           |
| D2-P10 — Atomicity and ambiguous response       | Inject failure at contact/audit/receipt/request writes; none partially accept. Drop response after commit; same-operation recovery returns exact permitted source state. Failed refresh cannot misreport accepted share.                                                                            |
| D2-P11 — Concurrency and semantic retry         | Same and different HTTP keys for same source occurrence race without duplicate contacts/requests/unread. Changed payload conflicts. Distinct legitimate work stays distinct. Claim expiry/retry cannot repeat a local available item.                                                               |
| D2-P12 — Independent notice failure             | Stop local materialization before/after available result; recover only the original request. Contact remains shared; no false notified/read claim. Full initial recipient resolution is all-before-any as required by P6, with later current eligibility independently enforced.                    |
| D2-P13 — Temporal/current access                | Recipient departure/revocation, source restriction/merge/removal, same-user Tenant switch, late response, multi-tab and back navigation. Notice/query/deep link reauthorize; Information expiry/read/archive does not change source truth or revive ended attention.                                |
| D2-P14 — Comprehension and usability            | Representative missionaries can explain all-staff visibility, private-note exclusion and notification-only selection; staff distinguish information from assigned work. Complete share/find/return/recover tasks without facilitator coaching; record failures rather than claim untested benefits. |
| D2-P15 — Accessible international field journey | Actual supported phone/desktop browsers, keyboard/focus/screen reader/zoom/reflow/soft keyboard, international long/non-Latin names, contact formats, wrong autofill and poor-network pre/post-commit interruption. No clipped identity or lost correctable input.                                  |
| D2-P16 — Migration/disable/restore              | Census old private/shared data and queue rows; mixed-version clients, retired browser writers, backfill and backup restore. No widened history, fabricated attribution, lost source facts, duplicate notice or old permissive path after disablement.                                               |
| D2-P17 — Production-shaped bounded work         | Permission-filtered contact/staff lookup, source admission, selected recipient resolution, inbox counts/materialization and repair on realistic large-tenant distributions. Measure query plans/rows/latency/memory/payload; pass agreed numerical budgets, not arbitrary vendor counts.            |

## Ruthless synthesis and ordering

1. **Resolved before recording:** broad ordinary staff availability replaces the
   proposed collaborator-access model. The founder selected named optional
   notification recipients. Existing safety floors and private-history exclusion
   remain explicit. Neither choice requires another confirmation.
2. **Record now:** the corrected D2 above, the minimal recommended interaction,
   and source/implementation evidence limits. Update glossary/session only;
   D1 is retained as dated history, with its formerly open audience resolved.
3. **Capture in the authorized spec/design:** exact P9/P4/P12 admission/result
   contract and contact fields, P6/P17 local notice event/resolver/presentation,
   D2-C01–D2-C20 and the proof matrix. Existing owner obligations are reconciled,
   not duplicated into substitute systems. Canonical hidden-identity qualification
   is a concrete required seam, not a vague future risk.
4. **Require in implementation:** trusted atomic acceptance, source operation
   and recipient identities, constraints/permissions, private derivative
   protection, honest statuses, same-request recovery, compatible migration and
   accessible shared components. Do not activate the generic donor queue or
   route contact attention through financial/Eve business meaning.
5. **Prove before activation:** real new-contact and existing-contact journeys,
   actual Supabase/P6/P17 roles/services, recipient inbox and deep link, race and
   failure injection, retained data/restore, representative users/devices and
   measured budgets. The optional local notice must be delivered here through
   its owner; it is not silently deferred to campaigns/AI/workflows. Its missing
   qualification blocks that option, not independently qualified sharing.
6. **Operate proportionately:** the bounded regression signals below have exact
   thresholds, owners and responses. No alert volume, missing voluntary work or
   unread notice is used as missionary/staff performance evidence.

### Risks placed in monitor

These are future operational requirements, not monitoring configured here.
Privacy, integrity and user-comprehension tests remain release gates.

| Signal                                                                                                                               | Threshold                   | Owner                                                    | Response                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unauthorized contact/private marker or notice to an unselected/ineligible recipient in qualification/canary evidence                 | Any count greater than zero | P12 authorization owner with P9 source/P6 delivery owner | Block or disable the affected disclosure/notice path, preserve minimal evidence and correct the source boundary before resuming.                                                        |
| Duplicate accepted sharing/attention effect for the same semantic source occurrence, or accepted changed payload under one operation | Any count greater than zero | P9 source-operation owner with P6 idempotency owner      | Stop affected replay/acceptance, reconcile exact receipts and repair through owner commands; never blindly re-share or resend.                                                          |
| Required accepted source receipt/audit/request missing from reconciliation                                                           | Any count greater than zero | P9 source-operation owner                                | Treat as an invariant failure; stop affected acceptance and recover committed source evidence. Notification delivery status does not decide whether sharing happened.                   |
| Optional notice reaches terminal failure with unmaterialized eligible selected recipients                                            | Any terminal failure        | P6/P17 operational owner                                 | Keep contact available; expose safe notice status and bounded same-request repair. Handle as routine communication repair, not a tenant-wide urgent alert or compulsory follow-up task. |

**Not closed by monitoring:** actual user comprehension, hidden-identity
admission, effective database authorization, retention/cutover and quantitative
performance. Product/UX, P4/P9/P12 and P6/P17 owners must establish the applicable
evidence before release. No unspecified “monitor scale” substitutes for a budget.

## Adversarial check

### What could go wrong with this answer?

Whole-row sharing could publish private context; identity matching could expose
or overwrite a protected person; notification failure could duplicate sharing;
selected staff could accidentally become an access list or assignment. Exact
payload, source authority and independent outcomes prevent those mistakes.

### What hidden assumptions are we making?

That ordinary staff discoverability is the desired coordination job and that a
short review plus optional in-product attention will be understood. The founder
selected the former; the latter is a design hypothesis requiring user proof.
Current code does not establish the new admission or notification producer.

### How does this affect the whole product?

It uses one native CRM contact and normal staff access, while private preparation
and other domains keep their boundaries. P6/P17 own optional attention; no new
task, consent, giving, coaching, collaborator or private CRM authority appears.

### How does this affect the end-user experience?

One explicit action explains where the contact becomes visible, shows the exact
details and optionally names staff to alert. Sharing works without a notice;
notice repair does not make the missionary share again. Staff receive
information, not an unexplained obligation.

### Does this follow modern best practices?

Yes as a qualified design: explicit audience/consequence, notification separate
from access, minimal data, canonical identity, atomic durable intent, idempotent
effects and accessible recovery. External patterns are adapted to Core's
stronger source and hidden-record boundaries, not copied wholesale.

### Does this fit Asym’s existing repo and product direction?

Yes, with the exact existing owners extended and proved. ADR-0001, ADR-0027,
ADR-0183, ADR-0211 and P4/P9/P10/P12/P27 support these separations. Legacy queue,
demo bell and broad restricted-note logs are not accepted precedents.

### Should we adjust the recommendation?

Accept the founder's simpler direction and replace the earlier collaborator
recommendation. Add the precise disclosure, identity, notification and recovery
requirements above. Keep the ordinary interaction small; put necessary safety
in its source boundary rather than exposing a permission-management workflow.
