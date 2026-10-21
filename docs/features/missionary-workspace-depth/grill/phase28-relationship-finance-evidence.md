# Phase 28 relationship, identity and financial-owner evidence

Research notes only. No Phase 28 decision is ratified by this file, and this is
not a PRD, formal specification, implementation plan or ticket proposal.

Inspected checkout: `9cada8f3d`; research date: 2026-10-15 America/Los_Angeles.
The founder's uploaded Phase 28 brief is the proposed outcome baseline. The
sections below distinguish inherited accepted intent from recommendations and
unqualified implementation. No GitHub mutation, integration activation, live
data change or supporter contact occurred in this research lane.

## Most useful opening decision

The current roadmap explicitly leaves this unresolved:

> Decide whether private prospects are allowed, how they are
> promoted/deduplicated and what staff can see.

Source: `docs/prds/sitestacker-parity/roadmap.md:4219`, Phase 28 **Open
decisions**. This is stronger evidence than an absence found by keyword search.

Recommended opening situation: Maya records an old friend who might become a
prayer or financial partner, before contacting them. Decide ordinary visibility
of **that new prospect entry and Maya's prospecting context**: limited to Maya
until deliberate sharing, or routinely visible immediately to specifically
authorized relationship staff. Recommend limited visibility at entry, inside
the existing organization-owned CRM. This is a proposal, not an inherited rule.

Do not frame the question as whether Maya owns a separate personal database, can
hide facts another source already shares, or may create a duplicate partnership
to bypass a restriction. Separate three layers in subsequent decisions:

1. Canonical Party identity/contact facts and independently authorized records
   about the same person.
2. Maya's purpose-scoped prospect relationship, referral provenance and private
   working context.
3. Deliberately shared partnership context and deliberately admitted cultivation
   work, each with its own exact current authority.

An answer about layer 2 does not itself determine all visibility in layers 1
and 3. Existing staff access to independent records persists. Coaching,
spouse/team access, newsletter consent, financial access and cultivation
admission do not follow. Restricted deduplication cannot disclose a hidden
Party/relationship's existence. Some matching situations may require an
authorized resolution path without revealing why.

Accepted constraints that keep this a real product choice:

- Phase 9 missionary negative story 34 excludes broad CRM browsing and staff
  notes beyond the permitted slice (`phase-09-…md:285`).
- Phase 27 REQ27-P01 permits useful authorized Party/referral/task work before
  identifying a ministry; a dummy Ministry Assignment is prohibited
  (`phase-27-donor-development/partnerships.md:9–31`).
- REQ27-P02 rejects confidentiality/privacy, a different owner, year, stage
  list, currency or surface as a reason for a second ordinary continuing
  enrollment. Party repair cannot union histories/grants or invent a new
  purpose to avoid a collision (`partnerships.md:35–63`).
- REQ27-P03 requires deliberate human admission and independently qualified
  create/reuse/result-metadata authority. Without minimum result authority,
  hidden-existing and absent work must have indistinguishable bounded
  denial/defer outcomes. Metadata-only reuse grants no contents, history or
  edit access (`partnerships.md:65–91`).
- D26 only permits newly authored sharing-eligible interaction context. It
  does not require every prospect or private note to become shared
  (`owner-reconciliation.md:11–17`).

## Inherited identity and relationship decisions

**Accepted source ownership:** ADR-0001 makes Asym Postgres authoritative for
Parties, relationships, notes, tasks, timelines, duplicates and merge state.
Twenty is retired. A private-purpose projection in that same CRM can preserve
this decision; another personal CRM or copied portfolio cannot.

**Ministry Assignment versus Support Assignment is settled.** Phase 9's D19
amendment (`phase-09-…md:1299–1342`) owns a stable organization-owned ministry
identity in one Tenant and Legal Entity, with zero-to-many separately identified
participants. It is distinct from Party, household, profile/login, Ministry
Project, Page, Designation, Campaign and Phase 21 Support Assignment. Its
participant membership is an effective-dated association, not a grant.

Phase 21 owns the financial Support Assignment, immutable per-currency Field
Accounts, its own participants and optional prospective Ministry Assignment
Support Binding Version. Binding is separately finance-authorized and copies
neither people nor grants, money, history or public progress. A pure authorized
Support Workspace read need not fabricate a Ministry Assignment binding. Every
spouse/teammate uses their own identity and exact current permission.

Relevant full read evidence:

- P21 PRD **Public boundary and authority**, **Canonical financial model**,
  **D8–D12** and **D17–D21** (`phase-21-field-accounts.md:281–340`,
  `412–454`, `505–548`).
- P12 **Dated Phase 22 D19 Ministry Assignment collaboration and support-access
  amendment** (`phase-12-…md:2822–2888`): independent capabilities; the minimum
  support preset excludes supporter identity/contact/evidence unless each is
  separately authorized; exact current purpose/projection/fields/history; no
  relationship-derived authority.
- Active Field Account OpenSpec **D9 Support Planning And Workspace Publication
  Are Optional And Purpose-separated** (`…/field-account-operations/spec.md:623`)
  and **D19 Support Assignments Separate Participation Access Responsibility
  And Notifications** (`…/spec.md:1317`). These are intent, not runtime evidence.

**P27 shared context does not dissolve privacy.**
`owner-reconciliation.md:11–17` and active
`add-donor-development/specs/crm-core/spec.md` distinguish newly authored
sharing-eligible P9 interactions from general/private CRM notes and scores.
Protected material cannot be quoted, summarized, imported, relabeled or copied
into a shared record. Current audience applies at read/recovery; earlier
eligible history needs explicit historical access. Ordinary eligible writes
under a qualified policy need no supervisory approval. Sharing imposes no
mandatory log, quota, task, stage movement, cultivation enrollment or coaching.

**P4 identity correction is not source authority.** P4 A2–A9
(`phase-04-…md:138–185`) distinguishes claim, verification, Party identity and
current access; unclaimed donors remain valid. Same-person merges repair only
owner-approved mutable references. Frozen legal-donor, contribution, receipt,
statement, accounting and original commitment facts remain intact; consent
merges to the most restrictive. No cross-Tenant linking/dedupe/merge.

## Disclosure and custom-field obligations

- P3 **Solution**, **Module 3** and missionary stories
  (`phase-03-…md:64–75`, `90`, `159–196`) require one subtract-only projection
  boundary; exact Tenant/Legal Entity/relationship/record flags and state;
  anonymity; sibling designation-line exclusion; no broad household access.
  Unknown fields default closed. Another organizational role is not authority
  for the current request. The P27 D26 exception is narrow and explicit.
- P10 **A1–A8**, **Phase 17 communication-safety amendment** and **Phase 21 D19
  participant safety amendment** (`phase-10-…md:92–104`, `254–284`, `439–457`)
  require strictest applicable classification, alias-safe egress, protection
  before enumeration/counts/arithmetic/search/cache/export/notification and
  immediate source-independent safety quarantine. Protected identity never
  falls back to legal name. Already delivered email cannot be recalled.
- P11 **B1–B6**, **C1–C7**, **D1–D2** (`phase-11-…md:141–175`) define one
  governed field catalog, stable identities, classified birth, input and output
  enforcement, no filter/sort/group inference, and explicit widening governance.
  Custom fields are not an unlimited private schema or a relationship graph.
  These sections expressly describe architecture decisions, not existing code.
- Durable `crm-core/spec.md` **CRM Identity Concepts Stay Distinct And Linked**
  and **CRM Stays A Native Mission Control Experience** preserve source
  identities and role-scoped external slices. Durable
  `identity-and-access/spec.md:1–90` establishes server-resolved identity,
  application enforcement plus RLS and contribution capabilities; its MVP
  posture is not proof that the fuller P12 model has shipped.

## Financial consumer obligations and conflicts

**Phase 13 contribution facts** own received money. Posted financial rows are
immutable; correction is append-only. Financial sources require real exact
Legal Entity, currency, date and allocation, not a guessed USD/two-decimal
default or a sum of loaded donor records.

**Phase 14 recognition is not received money.** P14 C1–C5
(`phase-14-…md:432–469`) preserves separate Legal and Recognition vocabularies.
`getPartyCreditActivity` is the party-centric credit interface;
`getSupporterRoster` is its designation-centric dual; matching expectancies
are outside both money vocabularies. Per-party recognition uses MAX per
Party/header across roles, not SUM. Per-currency subtotals never collapse into
one scalar. Roster aggregate tiles speak Legal; row paths speak Recognition.

**P14's financial roster is not Phase 28's contact directory.** H3–H8
(`phase-14-…md:1052–1114`) explicitly limits the missionary projection to name,
city/state, authorized per-path amounts/dates/fund, via-chips, support/recency,
and source-backed commitment status. Its hard floor excludes home address,
email, phone, notes, household/provenance internals and staff notes. Org-sourced
attribution is view-only with a staff flag/correction path. Counts follow
projection; anonymous and restricted members must not be inferable through
residual arithmetic or comparisons. P28 must qualify a separate relationship/
contactability purpose rather than append contact fields to this financial DTO.
P21 decision log D8 (`:2495–2507`) explicitly reserves only a separately ratified,
independently versioned P28 relationship/contactability family.

**Concrete P14 amendment candidate:** H4 (`:1071–1078`) still defines roster
`supports_policy_v2`, a 365–730-day display-only “lapsed” band and removal after
730 days; it leaves P9's `supports_policy_v1` unchanged and explicitly defers
reconsidering the edge to Phase 28. The latest Phase 28 brief asks to preserve
nonfinancial partnerships and avoid labeling a person lapsed. Do not silently
carry those temporal financial-roster labels into relationship identity, and
do not silently erase a ratified P14 rule. Clarify through a scoped owner
amendment or maintain financial-recency and continuing-relationship meanings
as distinct concepts.

**Phase 16 owns commitments, schedules, fulfillment and attention.** Its
**Canonical Language and Truth Boundaries** (`phase-16-…md:362–394`), **A4–A6**
(`:428–472`) and **Missionary dashboard** (`:336–344`) keep expectation,
collection authority, occurrence, attempt, money, fulfillment, recognition,
health and communication separate. One Commitment Party does not make service
contact, remitter, representative, collection authorizer and legal donor the
same person. A missionary conversation cannot authorize a charge or alter
another person's recurring arrangement. Partial fulfillment requires conserved
source application, not inferred giving history.

**Native attention needs an exact source purpose.** P16 missionary stories
specifically say a terminal missed occurrence retains source truth and, once
the exact communication key is Live, produces one grouped in-product notice,
no email and no automatic outreach task. P28's required “permitted recurring
attention” cannot be treated as generic authority to turn every miss into a
task. Resolve the exact source event, purpose, permission and distinct effect;
keep historical incompleteness, pause, pending, missed and overdue separate.

**Phase 21 is not a second giving total.** Only `FieldAccountOperationsService`
owns its qualified commands/projections. Mutable `current_funding`, donation
sums and dormant withdrawal UI cannot stand in for its truth. Approved Support
Plan, P28 Goal, P16 commitments, finance-confirmed balance, provisional activity,
reserve, compensation and publication remain independent. Publication Profile
chooses finite authorized modules and cannot widen access. Missing, hidden,
unmanaged, stale and zero differ. Independently authorized currencies remain
separate and discoverable. Expense/statement entry points reuse owners.

**Goal adoption is settled:** P21 decision log **Phase 28 goal bridge**
(`:3042–3056`) allows deliberate creation of a new immutable P28 Goal Version
from one exact approved Plan Version with provenance. Subsequent Plan changes
only offer comparison/update; neither direction automatically synchronizes.

**P15 actual gift reporting does not post money.** P27 owner reconciliation
`:19–29` and active `add-donor-development/specs/contribution-operations/spec.md`
allow incomplete known facts in a restricted nonfinancial intake envelope,
without fake donor/entity/currency. Recording and physical handling can finish
independently; lineage and unresolved work survive appeal closure/departure.
Report permission grants no posting/correction/receipt/fulfillment authority.
Only the exact qualified lane is blocked by a missing producer.

## Explicit unresolved financial gates

**E7 is still open in inspected contracts.** P13 story 143 (`:456`) and D14
(`:1608`) say campaign rollups follow the current source-code/campaign mapping,
while other clauses freeze campaign attribution. P27
`owner-reconciliation.md:41–45` requires a financial-owner ruling for prior and
unmapped gifts, mapping versus hierarchy, corrections/refunds, recurring
origin, and current versus historical measures. Posted-row immutability
(ADR0206) and Site attribution (ADR0207) do not choose report map semantics.
Affected received-toward-appeal results stay Unavailable until their exact
adapter is qualified. Ordinary Requests, nonfinancial work and independently
qualified finance facts continue; reporting remains required scope.

**C-01 is still open in inspected contracts.** P13 `:113–120`, P15 Mod3
`:1230–1237`, and P27 owner reconciliation `:47–49` preserve the conflict:
capability-authorized correction with optional tenant separation of duties
versus mandatory different approver for post-commit amends. Do not choose by
implementation convenience or conflate this with Request review. Affected
correction implementation remains undispatched; append-only preservation and
independent risk/money-out controls remain settled.

## What this research actually inspected

This is targeted section-level reading, not exhaustive predecessor review.
Paths in the table are relative to `docs/prds/sitestacker-parity/` unless marked.

| Source                                         | Read coverage                                                                                                          | Evidence status                                                              |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Root `AGENTS.md`                               | Complete root file; no nested docs instruction applies                                                                 | Current repository instructions                                              |
| Root `CONTEXT.md`                              | Opening Tenant/Ministry Assignment/participant/binding/Ministry Update definitions                                     | Shared vocabulary; large remainder not fully read                            |
| `docs/adr/0001-…md`                            | Context and Decision, opening Consequences                                                                             | Accepted CRM ownership; historical incident claims remain dated              |
| `docs/ai/document-authority.md`                | Resolve actual question; state vocabulary; owner map; canonical authoring; settled choices/gates                       | Distinguishes ratified, integrated, implemented, qualified, activated        |
| `openspec/project.md`                          | Complete file                                                                                                          | Active change is not shipped proof                                           |
| `phase-01-source-of-truth-ownership-matrix.md` | CRM/identity/ledger/commitment and assignment rows; D8/D19 references                                                  | Routing and owner boundaries; not whole matrix                               |
| `roadmap.md`                                   | Complete Phase 28 overview, scope, ownership, boundary and open decisions (`4153–4222`)                                | Accepted planning direction with explicit unresolved choices                 |
| Phase 3                                        | Solution; missionary stories; resolver Module 3; D19 projection amendment                                              | Accepted intended permission consumer obligations                            |
| Phase 4                                        | A1–A9 identity/claim/merge rulings                                                                                     | Accepted intended identity obligations; schema explicitly not certified      |
| Phase 9                                        | Opening/status; missionary negative stories; A10 record shell; negative tests; D19 amendment                           | Accepted narrow CRM and identity contracts                                   |
| Phase 10                                       | A1–A8; communication safety; D19 participant safety                                                                    | Accepted classification/egress rules                                         |
| Phase 11                                       | Relevant consumer stories, storage overview, B1–B6/C1–C7/D1–D2                                                         | Accepted catalog policy; not implementation                                  |
| Phase 12                                       | D19 collaboration/support-access amendment                                                                             | Exact current permissions and independent powers                             |
| Phase 13                                       | C-01 notice; story143/D14 E7 clauses; ledger header/posting ownership excerpt                                          | Financial intent and explicit unresolved gates                               |
| Phase 14                                       | Missionary stories; C1–C5; H3–H9                                                                                       | Exact roster/recognition source; explicit P28 revisit seam                   |
| Phase 15                                       | C-01 notice; Mod3 correction distinction                                                                               | Correction contract/gate; P27 amendments read separately                     |
| Phase 16                                       | Missionary stories; canonical language; A4–A6; selected congruence index                                               | Source semantics; full recurrence/fulfillment implementation not reviewed    |
| Phase 21                                       | PRD sections listed above; publication graph and Existing versus FORWARD; decision-log D8/goal bridge                  | Accepted finance and projection contracts; publication-time absence is dated |
| Phase 27                                       | Complete owner reconciliation; partnerships REQ27-P01–P03 with acceptance; CRM/access/intake OpenSpec owner amendments | Ratified predecessor meaning, not new P28 approval                           |
| Active OpenSpec                                | P21 D9/D19; P27 CRM/identity/intake; missionary partner-roster safety                                                  | Intended changes; not independent qualification                              |
| Durable OpenSpec                               | CRM boundary/identity/native surface; identity-and-access opening 90 lines                                             | Durable baseline; fuller owner changes must be reconciled                    |

Implementation, current GitHub issue/PR state, external benchmarks and Phase
6/17/22/25/26 details are researched in other lanes; this note does not claim
their inspection or completion. No source service, migration, real database
role, provider or deployed behavior was qualified in this lane. The scoped
search did not establish a detailed accepted P9 referral-expiry/loop/privacy
producer; roadmap ownership alone is not that contract. Exact referral source
and ticket coverage remain to be verified before claiming implementation-ready
referral behavior.

## Pattern classification

| Pattern                                                       | Classification                                    | Reason                                                                            |
| ------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------- |
| One Asym-owned CRM with purpose-specific projections          | Durable pattern                                   | ADR0001 and exact accepted owner boundaries                                       |
| Distinct Ministry/Support Assignment and explicit grants      | Durable pattern                                   | Avoids coupling people, pages and money; accepted D19 contracts                   |
| Qualified new shared history                                  | Durable pattern                                   | P27 D26 preserves voluntary collaboration and protected notes                     |
| Separate Legal/Recognition/Commitment/Balance meanings        | Durable pattern                                   | Prevents duplicated money and false expectations                                  |
| P9 Overview `funding_goal/current_funding` widget             | Temporary bridge                                  | P9 A10 labels thin earlier behavior; later P21 forbids deriving its truth from it |
| P14 financial-recency roster as all-purpose relationship list | Conflict with first principles if reused that way | Financial participation cannot define all prayer/practical/church relationships   |
| P14 financial roster's no-contact-fields floor                | Durable boundary for that projection              | P28 needs separate source-purpose contactability, not quiet field expansion       |
| “Private prospect” as a second cultivation enrollment         | Conflict with accepted contract                   | P27 P02 expressly rejects confidentiality as duplicate-work identity              |
| Missionary-created prospect context limited at entry          | Recommendation only                               | Roadmap explicitly leaves admission/staff visibility open                         |
