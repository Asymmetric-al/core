# D34 — owner boundaries and limited expired-referral lifecycle

Research date: **October 18, 2026 UTC**. Inspected repository
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and current working tree.
The founder selected **A: limited expired-referral history when the organization
permits it**, excluding contact details and private referral context; continuation
remains a separate authorized decision. The founder also requires a simple,
clear experience. The detailed clauses below are **review proposals**, not a
claim that the founder has ratified all amendments, that formal owners were
changed, or that any source, permission or runtime path is qualified.

This is a bounded owner review for the main D34 adversarial synthesis. No formal
PRD/ADR/OpenSpec, application, database, provider, ticket or live state was changed.
No earlier model, verifier or probe was run. This lane does not claim new runtime,
production, usability, retention-compliance or external-product evidence.

## Conclusion and smallest permanent path

**Accept with required amendments.** A is useful without creating another CRM:
provide one read-only, currently authorized projection of the existing P9 referral
source, reached through the ordinary referral history/filter. Expired history is
not active work, a saved personal contact, a renewed referral or an access request.
No new archive store, reminder, inbox, permission engine, continuation workflow,
per-entry approval or numerical expiry/retention default is needed for this choice.

The important authority change is explicit: ordinary Phase 28 Party enumeration
requires an active supporter/referral relationship. D34 adds a **named, bounded
exception for expired-referral history**, not a reinterpretation that the old
relationship remained active. New projection policy must be qualified through
P3/P9/P10/P12; current source history, actor scope and safety floors still govern
each read. Neither organization permission nor historical recipient status alone
is sufficient.

The least-complex alternative remains staff-assisted recovery using existing
authorized staff work. It requires no missionary historical-discovery extension
but adds a handoff. It does not erase the referral or satisfy A's selected
self-service recognition outcome. No interview or usage measurement establishes
how often either path is needed; that is an honest later usability question.

## Sources actually inspected

Line references identify the current local snapshot. Owner intent and current
implementation are different evidence classes.

| ID  | Exact local source and inspected section                                                                                                                                                                                                                                                                                                                                                                                      | Established meaning and limit                                                                                                                                                                                                                                                                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S01 | [Founder brief:117–141](../phase28-founder-brief.md:117), especially :137                                                                                                                                                                                                                                                                                                                                                     | Referrals, provenance, expiry, cannot-pursue and deliberate continuation are in scope. No expiry duration, retained-history read grant or continuation actor is selected there.                                                                                                                                                                                                |
| S02 | [P28 owner constraints:57–87](../../../../prds/program-roadmap/owner-constraints.md:57), [:143–150](../../../../prds/program-roadmap/owner-constraints.md:143)                                                                                                                                                                                                                                                                | Referral edges belong to P9. Ordinary missionary Party enumeration is limited to an active supporter/referral relationship. D34 must explicitly amend this narrow boundary.                                                                                                                                                                                                    |
| S03 | [Roadmap:4169–4205](../../../../prds/sitestacker-parity/roadmap.md:4169)                                                                                                                                                                                                                                                                                                                                                      | P28 consumes shared referrals and P27 cultivation; source/consent/privacy remain independent. The roadmap is not a complete referral lifecycle producer.                                                                                                                                                                                                                       |
| S04 | [P9 solution:114–125](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:114), [negative stories:278–300](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:278), [A4–A9:353–415](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:353)                                                                                       | One canonical, time-bound relationship graph; structural edges are not hard-deleted. Display roles grant nothing. Missionaries cannot browse broad CRM or staff notes. Merge preserves lineage rather than creating independent identities. These clauses do not define the precise referral recipient/expiry projection.                                                      |
| S05 | [P9 A15–A17:565–590](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:565), [C1:681–700](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:681)                                                                                                                                                                                                              | Search shares read authorization; no persistent timeline copy. Source writes use native owner transactions/audit. Identity repair is P4-owned. A new expired-history store or provider gate is unnecessary.                                                                                                                                                                    |
| S06 | [P12:1462–1470](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1462), [:1550–1555](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1550), [:1584–1587](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1584), [:1650–1670](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1650) | One current resolver, exact Tenant context, grants minus floors, field/query-input safety, revocation, explicit purpose and scoped grant administration. A missionary may receive a bounded grant without becoming staff. Prior membership and role labels are not authority. Named grants have their own transfer/departure rules; do not invent a universal D34 replacement. |
| S07 | [P10 A1–A7:95–101](../../../../prds/sitestacker-parity/phase-10-sensitive-data-safety.md:95), [A10:104](../../../../prds/sitestacker-parity/phase-10-sensitive-data-safety.md:104)                                                                                                                                                                                                                                            | Classification and current identity protections compose through the shared resolver. A historical name cannot bypass present safety or fall back to restricted identity. Public/external firewall rules are not permission to serve an internal history row.                                                                                                                   |
| S08 | [ADR-0209:16–37](../../../../adr/0209-static-field-policies-and-subtract-only-projection.md:16)                                                                                                                                                                                                                                                                                                                               | Static field classification is separate from conditional source/row logic. New record families must be registered/classified; the resolver only subtracts. No per-value visibility engine or app-local allowlist.                                                                                                                                                              |
| S09 | [ADR-0211:16–28,37](../../../../adr/0211-distinct-human-approval-for-projection-widening.md:16), [P3 Module 5:236–268](../../../../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md:236)                                                                                                                                                                                              | Actual projection-policy widening requires distinct-human approval, old policy until approved/applied, exact base and audit; narrowing is immediate. This is policy change control, not approval for every record read or ordinary action. The current field-policy editor does not hold conditional referral expressions.                                                     |
| S10 | [ADR-0212:15–29](../../../../adr/0212-one-export-policy-and-shared-csv-safe-cell.md:15)                                                                                                                                                                                                                                                                                                                                       | Visibility does not grant export, newsletter audience or contact-list egress. D34 does not add export or messaging.                                                                                                                                                                                                                                                            |
| S11 | [P27 partnerships REQ27-P01:15–31](../../../../prds/sitestacker-parity/phase-27-donor-development/partnerships.md:15), [REQ27-P03:69–77](../../../../prds/sitestacker-parity/phase-27-donor-development/partnerships.md:69), [REQ27-P12:377–413](../../../../prds/sitestacker-parity/phase-27-donor-development/partnerships.md:377)                                                                                          | Useful authorized referral work may precede a ministry/enrollment. A referral alone does not enroll cultivation; deliberate return rechecks eligibility and cannot revive old permissions/children. Do not require a dummy ministry or reopen a partnership just to view history.                                                                                              |
| S12 | [P27 OpenSpec CRM amendment:5–29](../../../../../openspec/changes/add-donor-development/specs/crm-core/spec.md:5), [identity amendment:5–13](../../../../../openspec/changes/add-donor-development/specs/identity-and-access/spec.md:5)                                                                                                                                                                                       | Assignment/transfer grants no historical access. Qualified new shared context has its own historical scope, not a universal history grant. Source projection widening obeys ADR-0211; routine eligible writes need no supervisory approval. Current access controls result recovery.                                                                                           |
| S13 | [D27 exact decision:14–58](../phase28-d27-resume-preparation-adversarial-review.md:14), [D28 exact decision:14–64](../phase28-d28-preparation-retention-adversarial-review.md:14)                                                                                                                                                                                                                                             | These are specifically unshared-preparation return/retention contracts. They neither provide expired-referral access nor authorize borrowing a departure clock, Resume command or content-restoration behavior.                                                                                                                                                                |
| S14 | [ADR-0001:60–70](../../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md:60), [durable CRM spec:14–26,46–64,114–126](../../../../../openspec/specs/crm-core/spec.md:14), [identity spec:14–26,43–53,69–82](../../../../../openspec/specs/identity-and-access/spec.md:14)                                                                                                                                          | Native Asym truth/server boundaries, source identity separation and current security baseline. Broader intended P12 controls are not proved implemented by these documents. No Twenty resurrection or app-owned CRM mirror.                                                                                                                                                    |
| S15 | [ADR-0183 independent follow-up:622–628](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:622)                                                                                                                                                                                                                                                                                                    | Independently undertaken human work has its own shared-task meaning. Referral expiry/history filtering must not silently cancel that work or fabricate a completion.                                                                                                                                                                                                           |
| S16 | [Earlier source research:273–280](../phase28-relationship-finance-evidence.md:273), [Q34 status and evidence](../phase28-q34-expired-referral-history-research.md)                                                                                                                                                                                                                                                            | A detailed accepted P9 referral-expiry/loop/privacy producer was not established. Q34's narrow current-code search is not exhaustive absence or production proof. This owner review locates the same planning gap; it does not independently qualify that runtime search.                                                                                                      |
| S17 | [Document authority:8–45](../../../../ai/document-authority.md:8), [OpenSpec project:7–20](../../../../../openspec/project.md:7)                                                                                                                                                                                                                                                                                              | Ratification, formal publication, implementation, qualification and activation remain distinct. Reconcile canonical owners and declared generated views later; do not attach a contradictory banner.                                                                                                                                                                           |

## Proposed exact bounded amendment

These are candidate clauses for later authorized formalization. They are not
applied to the source owners by this research note.

**G-C01 — Scope and positive useful result.** “Phase 28 may offer a read-only
Expired referral history view of source-qualified P9 referrals that previously
belonged to the missionary's authorized referral work before ordinary expiry.
The current principal must have exact current history-purpose authority for the
source and work scope. The view may reveal only the qualified minimal identifying
projection, truthful Expired meaning and permitted actual dates. It supplies no
contact details or private referral context. It is an explicit bounded exception
to ordinary active-supporter/referral Party enumeration, not an active relationship
or a second source record.”

“Previously belonged” is source evidence of qualified recipient/work scope, not
creation-time-first-recipient exclusivity. More than one genuinely qualified
historical recipient can qualify independently under current authority. Creator,
referrer, recorded owner, historical membership, same email, or current assignment
alone proves neither prior recipient eligibility nor current disclosure.

**G-C02 — Qualify the actual referral source.** “P9 owns the authoritative
referral identity/lineage, permitted provenance, recipient/work scope and actual
expiry basis. Ordinary follow-up-window expiry must be distinguishable from an
ended, revoked, withdrawn, corrected, merged or cannot-pursue source. Do not infer
expiry from an arbitrary ended edge, empty activity list, missed task or browser
clock. Missing or ambiguous source proof does not authorize the D34 projection.
Use the shared graph/source contract; neither a second history database nor a
generic lifecycle engine is required.”

The existing referrer-to-person edge does not by itself prove which missionary
was entitled to pursue that referral. Formalization must qualify that source
association without inventing a dummy ministry or treating graph reachability
as authority. This note does not choose storage columns or a numerical timeout.

**G-C03 — Current authority before every observable result.** “Resolve exact
current Tenant/principal, historical work scope, source/purpose and classified
field eligibility before history membership, labels, counts, search, filtering,
sorting, pagination, navigation or cache population becomes observable. Enforce
current P10 restrictions, aliases/anonymity, P12 grant state and any applicable
Entity/residency floors. The new history purpose removes only the ordinary-expiry
obstacle expressly approved for this projection; it removes no other floor.”

This uses the existing P12 capability/source-scope composition. It does not
require a per-row grant picker, a new global permissions system, a second policy
evaluator or an unselected tenant On/Off setting. No default grant or automatic
migration cohort is inferred from “when the organization permits.”

**G-C04 — Recognizable does not mean unrestricted identity.** “Use the current
permitted minimal display identifier or alias, not a frozen formerly visible
legal name, copied contact card, raw referral body, private referrer identity,
notes, phones, addresses, household expansion or source chain. Include only
source-known dates and fields individually qualified for this purpose. If even
record existence/identity is not currently disclosable, omit the entry without
a hidden-count, search or placeholder leak. The source's current alias and
privacy correction govern later reads; a D34 snapshot cannot override them.”

This does not prevent independently authorized ordinary contact access through
its own source/surface. It prohibits using this entry as a shortcut around that
gate. “Expired” is the referral's status, never a person-wide donor/partner stage.

**G-C05 — Policy widening versus ordinary use.** “The new D34 projection and
its classified exposure require explicit P9/P3/P10/P12 owner qualification.
Actual widening of projection policy obeys ADR-0211's distinct-human approval,
old-policy-until-apply, expected-base and identifiers-only audit rules. A new
purpose/DTO name is not an exemption from disclosure review. Put conditional
recipient/expiry/history logic in the shared source/resolver contract, not in
field-policy expressions. Once qualified, ordinary eligible history reads and
source events use that policy without a new per-referral supervisory approval.
Routine grant administration retains P12's own applicable controls.”

This is not a claim that the existing field-policy editor already implements
review of a new conditional source-purpose contract. Qualification must reconcile
the new purpose and any changed field/surface policy with their actual owners.
Do not build a generic runtime rule engine to bridge that gap or turn every
expiry into a widening request. No financial approval mode can waive ADR-0211.

**G-C06 — Retention is independent of visibility.** “Retain P9's required
structural referral lineage under its source contract. Readable identifiers,
dates and derivatives must have a qualified purpose/classification/retention
disposition; retention or an audit/legal hold alone grants no ordinary read.
D34 chooses neither indefinite readable history nor a numerical retention or
departure period. It does not borrow D28's preparation timer. At a governing
availability deadline or restriction, ordinary discovery/read ends even if
physical cleanup lags. Erased or hold-only content is not restored from a
snapshot or backup for this view.”

Before activation, identify the actual owner policy covering the projected
personal data. If it is not qualified, the affected history path remains
unavailable; do not silently delete source edges or invent a universal retention
period. Preserve legitimate independent records and obligations.

**G-C07 — Departure, return, reassignment and independent grants.** “Departure,
suspension, grant expiry or revocation makes the affected access path inert under
P12. A replacement missionary, shared household/team member, changed account
email or Party merge inherits no historical referral access. A returning person
needs current exact authority that admits the earlier source/work history;
login or reactivation alone is insufficient. Reassignment re-evaluates the
existing source/grant transfer rules; it neither grants a successor history nor
cancels an otherwise valid independent permission by itself. No first-recipient
exclusivity or blanket last-assignee rule is introduced.”

The source preserves original recipient/actor evidence and exact correction
lineage. Current history scope can authorize a qualified cohort through existing
P12 mechanisms; this clause does not demand one staff approval per record.

**G-C08 — Correction and read-only lifecycle.** “D34 membership is derived from
current authoritative source and access facts. Correcting a mistaken expiry,
source identity, recipient or disclosure classification updates this view under
current authority without rewriting original evidence, creating a new referral,
replaying a task/send or manufacturing contact. Retry, refresh or a new URL does
not change source state. Where the source currently proves an active referral,
its ordinary view requires its ordinary current authority; D34 cannot reopen
it. Unknown state is not silently labelled Expired.”

No history-edit action, expiry override or correction authority is added to Maya
by this decision. Authorized existing source correction remains possible.

**G-C09 — No collateral source or work effects.** “Viewing, filtering or leaving
expired history does not continue/renew a referral, reopen cultivation, change
a P27 stage, create a prospect, add a CRM relationship, restore an audience,
restart completed work, send a message or change consent. Expiry/history
presentation does not cancel an independently valid planned call or shared-task
undertaking; each source owns the requirement it can end. Any later continuation
command must be separately qualified and preserve current restrictions and
historical lineage.”

**G-C10 — Scope all secondary consumers.** “This is a bounded workspace read
purpose, not export, print, AI, newsletter, coach, public-directory, general CRM
search, financial, care or permission-management authority. A deep link resolves
the same history projection and current checks; no raw Party identifier becomes
an authorized full-record route. Shared caches, telemetry, audit projections and
support tooling retain the same current scope and data minimization. D34 adds no
export action, notification, bulk renewal or offline roster.”

**G-C11 — Minimal journey and honest recovery.** “Use the existing referral
list/history controls with a clearly labelled Expired state. Keep active work
distinct without a second dashboard, permanent warning, task or forced wizard.
The entry explains that contact details are unavailable here and continuation
needs separate permission. Do not render an unbuilt Continue button. If access
or source availability changes, invalidate the affected derived view and return
the existing safe unavailable state without revealing the hidden cause. Do not
claim a missing entry was deleted or that a read failure changed the referral.”

Exact screen layout is delegated implementation judgment. The source clock,
current grant deadlines and ordinary safe recovery apply; this note sets no new
timing SLA, display age band or availability promise.

**G-C12 — Adoption and source gates.** “Before exposing this exception, reconcile
the explicit P28 boundary amendment with P9 referral source meaning, P3 field
classification/change control, P10 current safety and P12 history-purpose
authority, then prove the actual projection and lifecycle. Existing records
qualify only when source evidence establishes their exact identity, historical
recipient/work scope, expiry and current lawful availability; do not label all
ended edges as referrals or grant every historical contact. Preserve retained
data and independent work during migration or rollback. The affected path may
remain unavailable while source qualification is incomplete; native unrelated
workspace work must not wait for a speculative generic referral engine.”

## Minimal lifecycle, not a new state machine

| Current source/access situation                                                                               | D34 observable result                                                                     | What remains unchanged                                                      |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Active source referral, ordinary authority valid                                                              | Existing active referral surface; D34 is not needed to widen it.                          | Source, current work and contactability keep their own meaning.             |
| Ordinary expiry; past qualified recipient/work proven; current history permission and data availability valid | One minimal recognizable Expired entry under the existing history/filter.                 | No continuation, contact permission, task or cultivation change.            |
| Expired referral but no D34 history authority                                                                 | No entry or revealing count; safe unavailable response to stale links.                    | Source history may remain under its own custody.                            |
| Source expiry proof missing/ambiguous                                                                         | No fabricated Expired projection; qualified source recovery remains with its owner.       | No global freeze or destruction of other records.                           |
| Current identity/source safety forbids even the minimal projection                                            | Omit the entry; invalidate governed derived copies.                                       | Private source evidence stays under its owner.                              |
| Another independently valid supporter/referral connection exists                                              | Its ordinary permitted view remains available; D34 reveals no extra body.                 | No blanket suppression of lawful independent access.                        |
| Departure, permission loss, retention cutoff or held-only content                                             | Stop the affected read/discovery path under current rules.                                | No assumed source deletion and no loss of independent obligations.          |
| Return or new assignee                                                                                        | Current exact history authority is required; membership/assignment alone is insufficient. | Original recipient/actor evidence is preserved; no silent history transfer. |
| Mistaken expiry corrected by the authorized source                                                            | Projection follows current truth; ordinary active access is separately rechecked.         | No new referral identity, automatic cultivation return or replayed effects. |
| Later continuation desired                                                                                    | Existing permitted help may be used; no D34 continuation power is implied.                | Actor, command and expiry-renewal semantics remain separately unselected.   |

## Material concern register

Each concern states what, why, severity, likelihood, evidence, answer impact,
permanent fix and exact proposed clause. Likelihood is a qualitative design-risk
judgment, not measured incident frequency. Proofs below are obligations, not tests
reported as executed.

### G01 — Archive wording hides the new read grant

- **What:** treating “expired history” as a filter over the ordinary Party list
  bypasses the active-relationship rule.
- **Why it matters:** an expired-only record becomes a persistent CRM lookup
  right; names/existence alone can disclose protected relationships.
- **Severity:** Critical.
- **Likelihood:** Plausible if the current list or graph query is reused without
  a new source-purpose contract.
- **Evidence:** S02, S06, S08, S14; Q34 expressly exposes this conflict.
- **Answer impact:** A remains acceptable only as an explicit bounded amendment.
- **Permanent fix:** a qualified source-derived minimal projection through the
  existing resolver, with no widening of the ordinary list/detail gate.
- **Exact proposed clauses:** G-C01, G-C03 and G-C12.
- **Proof:** expired-only positive case is useful; the same actor cannot query
  ordinary full Party detail, another recipient's entry, hidden totals or another
  tenant through it.

### G02 — Wrong historical recipient or missing expiry proof

- **What:** creator/owner/current assignee, an ended edge or graph reachability is
  mistaken for prior authorized referral work and ordinary expiry.
- **Why it matters:** a source may be ended for correction or safety, and a
  referrer-to-person edge alone does not identify its qualified missionary work.
- **Severity:** High.
- **Likelihood:** Plausible; the detailed referral producer was not established.
- **Evidence:** S04, S11, S12, S16.
- **Answer impact:** narrows A to source-proved cases without imposing a new
  creation-time-first-recipient restriction.
- **Permanent fix:** explicitly qualify P9 recipient/work and expiry evidence,
  preserve multiple legitimate historical recipients and reject inferred rights.
- **Exact proposed clauses:** G-C01, G-C02 and G-C07.
- **Proof:** two independently qualified past recipients can each see only their
  currently admitted history; creator-only/current-assignee-only cases fail;
  withdrawn/merged/unknown ended edges do not become Expired automatically.

### G03 — History restores former private identity or contact context

- **What:** historical name snapshots, referrer labels, contact cards, chains,
  tooltips or search snippets escape the intentionally small projection.
- **Why it matters:** retained history can outlive current alias/privacy decisions;
  a harmless-looking identifier may be the sensitive disclosure.
- **Severity:** Critical for restricted identity; otherwise High.
- **Likelihood:** Plausible if cached full records or prior UI snapshots are reused.
- **Evidence:** S04, S05, S07, S08.
- **Answer impact:** preserves A but excludes hidden-context convenience.
- **Permanent fix:** current classified identifiers/aliases, qualified dates and
  source status only; deny existence when the row is not currently disclosable.
- **Exact proposed clauses:** G-C03, G-C04 and G-C10.
- **Proof:** a reclassification after earlier access removes old name/contact
  markers from response, search, counts, navigation and controlled caches;
  independent ordinary contact rights are neither fabricated nor removed.

### G04 — Wrong approval boundary creates either a bypass or bureaucracy

- **What:** introducing the purpose silently skips projection-widening review,
  or ADR-0211 is misread to require staff approval every time a referral expires
  or Maya opens history.
- **Why it matters:** the first exposes data without governing approval; the
  second adds a new queue and defeats simple self-service history.
- **Severity:** High for bypass; Medium for unnecessary operational friction.
- **Likelihood:** Plausible because field policy and conditional row scope are
  distinct owners and the new purpose is not yet qualified.
- **Evidence:** S08, S09 and S12, especially ADR-0211:37.
- **Answer impact:** no new product fork; preserve accepted change-control rules
  and keep routine use simple.
- **Permanent fix:** qualify the widening policy/owner extension once through
  the applicable control; ordinary reads use the approved current policy.
- **Exact proposed clause:** G-C05.
- **Proof:** a widening policy cannot self-approve or publish on stale base;
  ordinary eligible records need no per-row request; narrowing takes effect
  without waiting for that approval flow.

### G05 — Retained edges become indefinite readable personal history

- **What:** P9's structural never-hard-delete rule is misread as forever-readable
  names/bodies, or D28's unrelated preparation schedule is reused here.
- **Why it matters:** custody, availability and access are separate. Conversely,
  deleting graph evidence to revoke access destroys source history and links.
- **Severity:** High.
- **Likelihood:** Plausible if retention is left implicit or borrowed by keyword.
- **Evidence:** S04, S13, S17; D28 explicitly limits its retention purpose.
- **Answer impact:** A does not select a retention number or broaden D28.
- **Permanent fix:** retain required structural lineage while qualifying ordinary
  personal-data availability and disposition through its actual source owner.
- **Exact proposed clauses:** G-C06 and G-C12.
- **Proof:** held/expired/disposed bodies are unavailable despite retained edges;
  read/refresh/login cannot extend retention; backup recovery cannot restore
  forbidden display fields; independent operational history survives.

### G06 — Departure, reassignment or merge transfers historical access

- **What:** old access survives departure, a successor inherits earlier history,
  or a Party/account merge unions grants and recipient scope.
- **Why it matters:** historical work provenance is not a transferable current
  permission; new staff/missionary responsibilities may have a different audience.
- **Severity:** High.
- **Likelihood:** Plausible when deriving access from owner or role columns.
- **Evidence:** S06, S11, S12, S13 and P9 A9 identity lineage.
- **Answer impact:** preserves A for currently admitted historical work only;
  neither automatic inheritance nor first-recipient exclusivity is selected.
- **Permanent fix:** current P12 context/history scope and actual source grant
  transfer rules, with original identity/provenance retained.
- **Exact proposed clauses:** G-C03 and G-C07.
- **Proof:** departure denies next read; a replacement and multi-hat session gain
  no extra history; an independently valid retained grant still works; returning
  membership alone does not grant earlier history; qualified current admission can.

### G07 — Expiry presentation mutates unrelated relationship work

- **What:** Expired becomes a person-wide status, cancels a promised call, reopens
  cultivation when viewed, or restores consumed tasks when corrected.
- **Why it matters:** referral attention, deliberate cultivation, manual tasks,
  contactability and history are different source meanings.
- **Severity:** High.
- **Likelihood:** Plausible if implemented as a generic status/dropdown or task
  transition copied from another source.
- **Evidence:** S01, S03, S11 and S15.
- **Answer impact:** A is read-only; it does not choose continuation or task policy.
- **Permanent fix:** source-derived history membership with no side effects and
  preserved independent human undertakings.
- **Exact proposed clauses:** G-C08 and G-C09.
- **Proof:** expiry/history/correction does not send, enroll, reopen, log contact,
  cancel a deliberate valid call, or change the person's other relationships.

### G08 — Side channels, stale recovery or exports widen the entry

- **What:** deep links, client caches, paging/counts, general search, support logs
  or export reuse reveal fields or existence the D34 read would deny.
- **Why it matters:** a narrow card does not secure a broader returned payload,
  and access loss applies to recovery as well as initial reads.
- **Severity:** High.
- **Likelihood:** Plausible if a generic record reader/serializer is reused.
- **Evidence:** S05, S06, S08, S10, S12 and durable identity boundaries in S14.
- **Answer impact:** no new export, offline, AI, coach or messaging scope.
- **Permanent fix:** one current purpose-bound projection across observable paths,
  qualified current cache invalidation and minimal permitted diagnostics.
- **Exact proposed clauses:** G-C03, G-C10 and G-C11.
- **Proof:** deny direct URLs and old cursors after revocation; no private markers
  in JSON/CSV, caches, telemetry or counts; a lost response cannot recover former
  content after current access ends.

### G09 — A speculative referral subsystem replaces the selected small feature

- **What:** build an archive lifecycle, automatic reactivation, notification/
  approval queue, per-row ACL, universal timer or full referral-engine dependency
  to implement one history view.
- **Why it matters:** adds maintenance and user confusion, hides the exact source
  gap and can silently select unrequested powers or defaults.
- **Severity:** Medium; High when it implies new access or destructive cleanup.
- **Likelihood:** Plausible if roadmap ownership is treated as an implementation
  blueprint or each unresolved dimension receives a new subsystem.
- **Evidence:** S01–S03, S05, S09, S16–S17 and the founder's simplicity constraint.
- **Answer impact:** A remains the selected result; staff-assisted recovery is
  the simpler fallback, not permission to claim A implemented.
- **Permanent fix:** qualify the smallest P9/P12 source projection and existing
  list/history integration; separate real remaining product choices from ordinary
  engineering qualification; block only the affected unqualified path.
- **Exact proposed clauses:** G-C01, G-C05, G-C11 and G-C12.
- **Proof:** one clear history entry point, no extra approval or task per row;
  representative users distinguish recognizing a referral from continuing it;
  source-proof failure does not disable unrelated daily work.

## Exact amendment destinations and release evidence

1. **P28 owner constraints :143–145 and corresponding roadmap/source views:** add
   the narrow expired-referral history exception while retaining ordinary active
   relationship enumeration, independent access and no broader contact right.
2. **P9 graph/source owner:** qualify recipient/work provenance, true ordinary
   expiry, history projection fields, lineage/correction and source availability.
   Preserve the canonical graph, current source writes and structural history.
   This is a bounded referral-source amendment, not a second P28 truth store.
3. **P3/P10:** register/classify the exact projection and derived identifiers,
   apply current safety floors and ADR-0211's actual widening controls. Do not
   encode per-record source conditions inside static `field_policies`.
4. **P12:** qualify the existing current capability/grant/history-scope machinery
   for this purpose, including prior-recipient source predicates, departure,
   transfer, return and current result recovery. No coarse role shortcut or new
   universal grants, default-on cohort or mandatory row approval is selected.
5. **P27/shared tasks:** retain independent cultivation/next-action/source truth;
   add only explicit consumer no-side-effect and current-source reconciliation
   requirements where needed. D34 cannot become a new reopen command.
6. **Durable CRM/identity OpenSpec and the subsequently authorized Phase 28
   package:** reconcile exact formal clauses and declared generated views. This
   research is not their publication, approval record or implementation proof.

The actual source path must prove the positive expired-only entry and the
negative authority/correction/retention cases above using real owner boundaries.
Further release proof includes qualified legacy-data admission (no blanket
ended-edge conversion), actual permission/cache behavior, accessible phone and
keyboard use, useful permitted pagination and safe operational diagnosis. Exact
resource/latency budgets, a numerical referral window, a retention period and a
continuation actor are not invented in this note. No evidence here qualifies
the database, deployed resolver, source producer, browser journey or live data.
