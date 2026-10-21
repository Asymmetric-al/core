# D1 adversarial owner review: restricted prospect start

Research only, 2026-10-15 America/Los_Angeles, checkout `9cada8f3d`.
The founder selected A: a missionary may begin with a prospect entry and early
prospecting context restricted from ordinary relationship-staff visibility.
That selection includes the newly supplied identity/contact details, not merely
notes. Existing independently authorized records about the same person remain
visible under their own rules. This file proposes safeguards and identifies
further decisions; it is not an approved ADR, specification, implementation or
ticket plan.

Risk ratings below concern a proposed design under the stated condition. They
are not findings of an exploited production vulnerability. No runtime, real-role
database or provider qualification was performed in this lane.

## Recommendation

Keep A, with one bounded **P9-owned restricted prospect-preparation source**.
It records what Maya supplied about a possible contact and her early work;
those are attributed assertions, not automatically verified canonical identity
or authority to change the organization's contact record. Use the existing P12
purpose/capability/projection system to restrict it. P28 provides the workspace
experience and its qualified task/audience purposes; it does not acquire Party,
contact, relationship, note, identity-merge or cultivation authority.

An exact canonical Party reference may be attached internally only through
qualified same-Tenant P4/P9 identity resolution, without exposing a hidden
match, transferring that Party's ownership, changing its current contact facts,
or granting access to its other records. Where Maya already selects an
authorized canonical Party, reuse it; do not force an artificial intermediate
person or duplicate entry ceremony. Where identity cannot yet be resolved,
retain the source assertion without inventing a Party, donor, ministry or
permission. Ordinary save means the restricted preparation was saved, not that
canonical identity, shared admission, contact eligibility or cultivation
enrollment succeeded.

This is a permanent source boundary with a narrow purpose, not a second CRM:

- No independent person/household/church identity authority or parallel graph.
- No copied canonical supporter list, separate cultivation pipeline or personal
  portfolio membership store.
- No alternate consent/suppression store, financial fields, login/claim process
  or independently implemented task/history system.
- No ongoing sync between two authoritative copies of the same contact value.
  Original attributed assertions may remain as lawful provenance; accepted
  canonical facts continue through their source.
- Admission/reconciliation preserves one source lineage and uses existing
  Party/merge, relationship, task and P27 work owners. It does not clone records
  into a shared workspace and abandon the restricted original.

This recommendation chooses a conceptual source boundary. It does **not**
freeze a SQL table, general staging framework, new status taxonomy, expiration
deadline, automatic disclosure trigger or retention period. These are not
justifications for creating a generic intake platform. Ordinary save should
remain one short form.

P9/P12 need an explicit coordinated owner extension for this source. No inspected
contract currently proves this exact prospect producer exists. P4 identity
reconciliation must be qualified for it; existing claim/gift-attribution paths
cannot simply be reused. This owner work is necessary to deliver A faithfully,
not evidence that A is incompatible with the platform.

## Why this boundary is supportable, and its limits

**Supporting accepted patterns:**

1. P4 **Data model**, `phase-04-identity-account-claiming-foundation.md:239–245`,
   describes an owner-specific account-claim request with a nullable donor
   reference, supplied email, requester and resolution evidence. A source can
   retain an unresolved assertion without claiming resolved canonical identity.
   Its staff/own-requester audience and claim purpose do not transfer to P28.
2. P27 D25, `phase-27-donor-development/owner-reconciliation.md:19–29`, explicitly
   permits incomplete known facts in a restricted P15 operational envelope,
   without inventing Party, currency, Legal Entity or financial root. Valid
   already-admitted entry needs no mandatory precursor. This is an analogous
   source-boundary pattern, not authorization to use finance intake for
   prospects or to infer that P9 has already adopted it.
3. P27 REQ27-P01 and AC27-P01-04,
   `phase-27-donor-development/partnerships.md:9–31`, preserve useful authorized
   Party/referral/task work before an identified ministry. They prohibit dummy
   Ministry Assignments; they do not by themselves specify a pre-Party prospect
   source.

**Constraining accepted contracts:**

- P9 A1/A2 (`phase-09-full-crm-depth-relationship-graph.md:323–341`) rejects a
  generic `crm_records` master and makes the thin Party/shared-PK subtype the
  single identity topology. A prospective observation is permissible only if it
  does not become another person master or independently authoritative contact
  graph.
- P9 B1/B6–B9/B15/B17 (`:610–679`) assigns Party creation/label write-through,
  access checks, notes, activity and writes to shared owners. B17's exact
  ordinary-contact command admits a proved person and field/purpose capability;
  it does not certify arbitrary third-party prospect assertions as a global
  Name/Phone update.
- P12 **Solution**, **Classification**, **Purpose**, **Named grants**
  (`phase-12-full-role-permission-configuration.md:1462–1471`, `1635–1656`,
  `1666–1673`) provides one current permission spine. P28 cannot introduce an
  independent `owner_id == viewer` authorization system that bypasses it.

## Findings, decision clauses and proof

### OB-01 — Restricting the work row alone leaks new identity/contact facts

**Evidence.** P9 B1 (`:610–613`) writes `parties.display_name` through the owning
subtype. A15 (`:565–571`) searches canonical Parties. A17 (`:581–596`) emits an
audit row and activity in the same write; B9 (`:637–640`) includes record-created
and record-updated events. The P9 data model (`:759–819`) includes Party search,
facets, timeline summaries and note visibility defaulting to `standard`.

**Conditional risk:** High impact, likely if engineers implement A as a private
prospect/work record plus ordinary shared Party/contact creation. Names, phones,
email-derived facets, timeline text or duplicate hints can disclose the entry
before sharing even though its notes are hidden.

**Implication:** A must protect newly supplied identity/contact assertions as
well as planning. Calling the notes private is insufficient.

**Proposed clause:** “Saving restricted prospect preparation does not publish
its submitted identity or contact assertions to ordinary CRM discovery,
canonical contact updates, shared activity or other derivative surfaces.”

**Required proof:** Real owner-service and database-role fixtures comparing
before/after staff lists, typeahead, facets, counts, timeline, exports, task
titles, event consumers and caches. A background canonical match cannot change
an unauthorized viewer's observable result.

### OB-02 — Recording a friend's address cannot overwrite their shared record

**Evidence.** P4 A2/A5/A9 (`phase-04-…md:138–185`) separates identity, claim and
current authority, preserves ambiguous matches for review and limits mutable
reference repair. P4 `dedupe` and `merge` (`:222–225`) never auto-merge and retain
source-owned history. P9 B17 (`:660–679`) validates the exact source subject,
field and purpose and keeps legal, Auth, billing/public/document facts separate.

**Conditional risk:** High impact, medium-to-high likelihood if matching by
email automatically links or writes to the canonical contact. A stale address,
shared church mailbox or mistaken same-name match could redirect communication,
expose another person's data, or corrupt future recognition/contact behavior.

**Implication:** Maya owns the act of recording an assertion, not authority over
every fact about the identified person.

**Proposed clause:** “An entered name, address or phone remains an attributed
prospect assertion until accepted through the owning identity/contact command.
Matching or linking grants no canonical edit, claim, verification or consent.”

**Required proof:** Shared mailbox, exact-email wrong person, same-name people,
existing Party with different current details, revoked edit authority, and
concurrent contact correction. Wrong-Party/subtype/tenant links are rejected;
the existing canonical contact stays unchanged until independently authorized.

### OB-03 — Duplicate prevention must not become a hidden-record detector

**Evidence.** P4 A5 and claiming/dedupe (`:153`, `:208–225`) require
non-enumerating attribution and no automatic merge. P27 REQ27-P03
(`partnerships.md:65–91`) requires hidden-existing and absent outcomes to be
indistinguishable where minimum admission-result authority is missing;
metadata-only reuse grants no contents/history/edit access. P12 R7 (`:1650`)
also covers purpose-denied versus missing through response and timing.

**Conditional risk:** High impact, likely if “already in our database,” a
disabled Save button, different validation error, suggestion count or faster
match response exposes otherwise hidden identity/work.

**Implication:** Saving restricted preparation and admitting a canonical/shared
record are different success claims. A hidden match may need a source-governed
resolution path; its existence/reason need not be shown to Maya.

**Proposed clause:** “The same permitted restricted-save outcome is available
without disclosing whether an inaccessible Party or partnership exists.
Canonical reuse and admission occur only under their separate result-disclosure
authority; unknown identity does not authorize a duplicate workaround.”

**Required proof:** Paired datasets differing only in one hidden person/work
record; compare availability, shape, errors, counts, timing and recovery.
Concurrent matching/admission cannot create duplicate authoritative work or
reveal the hidden match. Reconcile interrupted operations under the same source
identity; do not resubmit as a different person to get around a conflict.

### OB-04 — Confidentiality is not a new partnership identity

**Evidence.** P27 REQ27-P02 (`partnerships.md:35–63`) explicitly rejects privacy
need, owner, year, stage preset, currency and surface as reasons for a second
ordinary enrollment. Party merge collisions cannot union histories/grants or
invent an independent purpose. P9 A4 (`:355–373`) owns canonical relationship
identity; P27 D30 does not create another portfolio store.

**Conditional risk:** High impact, likely if each missionary gets a private
pipeline that later becomes a new P27 enrollment. It fragments requests,
responsibility and follow-up and may duplicate donor-facing effects.

**Implication:** Restricted preparation cannot secretly be a second cultivation
journey. Existing relationship work stays authoritative even when Maya cannot
read it.

**Proposed clause:** “A restricted prospect entry is preparation, not cultivation
admission. When work is deliberately admitted, P27 reuses or creates exactly the
authorized ordinary purpose; confidentiality never supplies a new purpose.”

**Required proof:** Same Party/ministry/purpose entered by two missionaries,
paused/closed existing work, divergent labels/currencies, and Party merge
collision. Preserve obligations and completed effects; do not merge permissions
or manufacture a second purpose to achieve successful-looking UI.

### OB-05 — One ‘share’ flag would conflate separate decisions

**Evidence.** P27 D26 (`owner-reconciliation.md:11–17`) permits only new
sharing-eligible source context, with exact current audience/fields/purpose and
explicit historical access. It prohibits private-note copying, quoting,
summarization, migration or relabeling. D26 sharing does not admit cultivation
or create tasks/coaching. ADR-0211
(`docs/adr/0211-distinct-human-approval-for-projection-widening.md:14–28`)
requires distinct-human approval for projection-policy widening; its consequence
is not supervisor approval for every ordinary edit.

**Conditional risk:** High impact, likely if “promote to CRM” publishes the
whole entry, its historical notes and every related task or starts cultivation.

**Implication:** Identity admission, disclosure to a selected audience, P27
managed-work admission and creation of new shared interaction context need
separate explicit meanings. A simple UI can compose independently authorized
effects, but cannot hide their consequences.

**Proposed clause:** “Sharing/admission names the exact selected facts, purpose
and audience. It does not relabel private history as shared history, disclose
earlier entries by default, enroll cultivation, create consent or enroll a coach.
Routine commands use an already qualified policy; policy widening follows the
accepted distinct-human approval rule.”

**Required proof:** Private note containing protected staff/care material,
later shared entry, new collaborator without historical grant, stale audience,
policy revision and recovered result after revocation. Earlier private text
never appears in shared timeline, summary, task notification or AI context.

**Still a founder decision:** Which facts may be admitted/shared, to whom, by
whose deliberate action, and whether any required source event compels a
limited admission. A does not answer these questions.

### OB-06 — Physical-safety classification is not a convenient privacy switch

**Evidence.** P10 A1–A7 (`phase-10-sensitive-data-safety.md:94–101`) separates
field sensitivity from person publication-security level; restricted/high-risk
identity lives behind special alias, clearance and audit rules. A5 says a new
restricted table is introduced only when publication endangers someone.
P12 whole-record protection (`:1638`) hides the person and all attached records
from non-cleared staff; purpose is a separate floor (`:1654`).

**Conditional risk:** High impact, medium likelihood if A reclassifies every
prospect as a restricted worker or toggles whole-Party protection. This can hide
independently authorized existing records or give unrelated security-clearance
holders an unintended prospect audience.

**Implication:** Ordinary limited prospect access and physical-safety
classification are different dimensions. Both must apply when relevant.

**Proposed clause:** “Restricted prospect preparation uses its exact P12 source
purpose and grants, composed with existing P3/P10 floors. It neither changes the
Party's security level nor removes existing independent access. Safety
clearance does not acquire a new prospect-purpose power by implication.”

**Required proof:** Standard prospect with limited audience; restricted worker;
existing shared Party plus private prospect context; viewer with clearance but
without prospect-purpose authority; view-as/operator/service principals. No
floor bypass or suppression of another source's legitimate facts.

### OB-07 — ‘Organization-owned’ is not blanket administrator visibility

**Evidence.** P12 Solution (`:1464–1467`) routes all classes through one PDP;
roles/names do not authorize. Named grants have scope and explicit
survive/die-on-transfer semantics (`:1670`). Tenant recovery excludes
restricted-tier plaintext (`:1671`). P10 identity-room emergency grants do not
grant care access (`phase-10-…md:101`) or an undefined new purpose.

**Conditional risk:** High impact, medium likelihood if an admin, support
operator or coach can inspect all private entries simply because the Tenant
owns them, or if the UI promises absolute secrecy that the approved policy
cannot sustain.

**Implication:** State “limited ordinary visibility,” not “only you can ever
read this.” Do not invent privileged exceptional access while explaining that
organizational ownership persists.

**Proposed clause:** “No staff/admin/coach/household label creates prospect
access. Any exceptional organizational access requires its explicitly approved
purpose, scope, authorization and audit; this decision approves no such new
exception and grants no tenant-recovery plaintext shortcut.”

**Required proof:** Ordinary administrator, delegated admin, coach, support
operator, impersonation and service-account reads/export. Test exact admitted
exceptions only after their product policy is separately resolved. No secrets
in existence/count/audit fallback paths.

**Still a founder decision:** Whether this product creates any exceptional
records/safeguarding/continuity audience, its scope and conditions. Existing
source permissions remain in force; this decision neither expands nor revokes
them.

### OB-08 — Departure cannot silently disclose everything or erase duties

**Evidence.** P12 named grants and freeze/revocation (`:1668–1671`) fence lost
authority. P27 REQ27-A07/A08 (`assignments.md:156–184`) requires immediate
revocation, rejects guessed successors, and keeps Party assignment independent
of partnership/task/commitment/care/permission. REQ27-A10 (`:208–223`) preserves
lawful retention/redaction rather than infinite plaintext or arbitrary deletion.

**Conditional risk:** High impact, likely if a departing worker's records are
automatically handed to a manager, bulk deleted, or remain accessible until a
successor accepts work.

**Implication:** Access revocation, retained evidence, open duties and optional
private preparation are separate. Source-required work can require a bounded
handoff without disclosing unrelated private notes.

**Proposed clause:** “Departure/revocation immediately removes the old person's
future access without waiting for handoff. Retained source facts and accepted
obligations survive under their owners. No automatic successor, history grant,
private-context disclosure or deletion follows from departure alone.”

**Required proof:** Departure with only unshared ideas; with a scheduled task;
with accepted Request/financial handling duties; with a pending share or result
recovery; with an existing shared relationship. Do not invent manager authority,
delete unresolved work or reactivate old access on restore.

**Still a founder decision:** Retention/disposition of unshared preparation and
which qualified person, if anyone, receives the minimum continuity facts. A does
not decide a handoff policy.

### OB-09 — Unresolved identity cannot become a consent bypass

**Evidence.** P12 purpose/consent (`:1654`) distinguishes readable from
contactable and requires current execution-time consent. P27 REQ27-P03
(`partnerships.md:69–75`) says admission creates no communication permission.
P9 B17 (`:667–670`) says contact changes create no SMS consent or identity proof.
P27 D26 also creates no outward communication authority.

**Conditional risk:** High impact, likely if a private entry can directly send
to its captured raw email/phone while avoiding a suppression on the actual
canonical contact, or if the entry is offered as a newsletter audience.

**Implication:** Restricted preparation may save successfully while contact
eligibility remains unknown. The UI must not present unknown as permission.

**Proposed clause:** “Saved prospect details do not authorize contact, newsletter
subscription, audience membership or native dispatch. Every consequential
contact action resolves the exact source identity/destination and current
purpose restrictions; unresolved eligibility cannot be treated as unrestricted.”

**Required proof:** Suppressed canonical destination with private spelling or
alias; shared mailbox; hidden Party; changed contact; unknown identity;
revocation between preparation and send. The owner blocks/holds the action
without leaking the protected reason; no new private consent register appears.

### OB-10 — A local contact notebook would turn the solution into a shadow CRM

**Evidence.** ADR0001 Decision 1 and P9 A1/A2/A16 assign canonical Parties,
relationships, notes, tasks and timelines to native sources. P9 A16 forbids a
persisted duplicated timeline (`:573–579`); P27 assignments opening (`:5–7`)
says portfolios are derived. P27 P02/P03 requires canonical reuse and source
effect identity.

**Conditional risk:** High long-term cost, medium-to-high likelihood if restricted
preparation grows its own contacts CRUD, household graph, notes, task statuses,
pipeline and synchronization to staff CRM.

**Implication:** The new boundary must stay an attributed source of preparation
and admission, not an alternate system of record. Reuse shared owners as soon as
their prerequisites and current permissions are satisfied.

**Proposed clause:** “P9 remains the source for restricted prospect preparation
and its later identity/relationship admission. P4 remains identity repair; P12
remains access; P27 remains managed work. No mirrored contact/portfolio/task
model or background synchronization between competing masters is introduced.”

**Required proof:** Source ownership trace from initial save to identity
resolution, permitted task, shared relationship and P27 reuse; migration and
merge retain stable lineage and completed effects. Every mutable value has one
declared authoritative writer; every derived display is rebuildable.

## Strongest alternatives

**Product alternative: authorized relationship-staff visibility from entry.**
This gives earlier coordination, more straightforward duplicate resolution and
better continuity with less purpose-specific private-state complexity. It is
the strongest alternative to A, not all-staff visibility. It still requires
correct Party identity, scoped notes, no private-note laundering and explicit
cultivation/consent. Its cost is that tentative personal relationships become
organizationally visible before the missionary intends to share. The founder
selected A; the research does not silently substitute this alternative. Revisit
only if representative missionary/staff evidence shows A cannot meet agreed
coordination needs without disproportionate friction or an unacceptable
exceptional-access policy.

**Engineering alternative: create a canonical Party restricted from birth.**
This avoids a separate unresolved preparation identity and lets existing
Party-linked work reuse the same key immediately. P12's whole-record and purpose
floors show that scoped source records are possible. It is not inherently a
shadow CRM. However, the proof must cover every P9 Party label, subtype,
contact, search, facet, timeline, graph, task, merge, import and derivative
consumer from the creation transaction onward; linking to an already shared
Party must not hide its independent facts. Exact ordinary-prospect access is
still an owner amendment and cannot be assumed from physical-safety protected
constituents. This is a wider coupled change than bounded P9 preparation and
does not naturally represent unresolved/ambiguous third-party assertions. For
those reasons the bounded source is recommended as the permanent conceptual
boundary; storage may reuse owner infrastructure where it proves the same
semantics. Do not add both competing models.

## What can be recorded now versus what remains open

**Founder-selected direction:** restricted early start inside the
organization-owned CRM, including newly supplied identity/contact assertions
and context; ordinary staff do not automatically see those newly entered facts.
Independently authorized existing facts stay governed by their owners.

**Safeguards preserving that choice and accepted predecessors:** no shadow CRM;
no canonical overwrite or automatic merge; no hidden-match oracle; no duplicate
P27 enrollment for confidentiality; no laundering private notes into shared
history; no consent/finance/coaching implication; no role-name bypass; truthful
save/result recovery; immediate revocation without invented successor.

**Engineering recommendation, not shipped or already owner-ratified:** bounded
P9 restricted prospect-preparation/admission source composed with P4 and P12.
Its exact producer contract and qualified test seam still require coordinated
owner work. A alone does not certify the architecture or activation.

**Material product choices to return to the founder, one at a time:**

- The boundary between voluntarily sharing prospect work and required canonical
  record admission: what event, if any, requires admission of which minimum
  facts, and whether admission itself discloses anything to ordinary staff.
- The exact audience and selected contact/relationship facts for deliberate
  sharing; who may authorize it and which history is excluded.
- Any new exceptional organizational access purpose and its scope/conditions.
- Departure/retention/disposition of unshared preparation and minimum continuity
  disclosure, separately from already accepted operational duties.

Do not resolve these by a schema convenience, a broad “admin can always see it”
statement, a guessed manager, a private-record timer, or automatic promotion on
gift/referral/task/interaction arrival. The next useful founder decision is the
first bullet: **does canonical admission require ordinary staff disclosure, or
can source-owned identity be admitted while the prospecting context remains
restricted?** Explain the real user consequences before choosing the trigger.

## Evidence coverage limits

This pass directly read P9 A1–A4, A15–A18, B1–B17 and the relevant data model;
P4 A2/A5/A9, identity modules and claim-request model; P12 Solution,
classification/purpose/elevated-access sections; P10 classification boundaries;
P27 P01–P03, owner reconciliation D25/D26, assignments A07–A10 and relevant
acceptance; ADR0211; Party/protected-constituent glossary entries; and the prior
Phase 28 session notebook. It does not claim exhaustive reading of these large
PRDs, source-service implementation or live permissions. No new GitHub readback
was needed to settle this conceptual question; no GitHub state changed.
