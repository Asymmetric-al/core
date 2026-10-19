# Phase 27 D2 — identified-ministry journey: adversarial review

Reviewed 2026-10-09 against Core checkout
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`, current GitHub issue bodies and
primary vendor/ministry documentation. **Disposition: Accept with required
amendments.** The founder explicitly ratified the amended D2 on 2026-10-09:
“Yes, ratify this amended D2.” The decision below is accepted for its stated
scope; implementation qualification and the separately proposed sharing
amendment are not implied.

This is a bounded decision review under `/grill-with-docs`, not a Phase 27 PRD,
OpenSpec change, implementation plan or issue draft. It preserves D1 and the
user's `/to-prd` and `/to-issues` boundaries. The accepted decision and reviewed safeguards identify what a
later specification must preserve; it does not settle every enrollment,
stage, ask, sharing or financial-association policy.

## Exact corrected decision — ratified 2026-10-09

> **D2 — ordinary missionary-support cultivation concerns an identified
> ministry.** Its journey relates a supporter Party and an intentional
> relationship purpose to the existing, organization-owned **Ministry
> Assignment**, within that ministry's exact Tenant and Legal Entity. A ministry
> may involve one missionary, a couple, a team or temporarily no participants.
> The journey does not belong to a login, household, current worker, public
> Page, Designation or Support Assignment.
>
> Preserve the people who introduced, stewarded and participated in the
> relationship through their authoritative Party, relationship, responsibility
> and interaction references. An unchanged ministry identity can preserve
> organizational history; it does **not** establish the supporter's willingness
> to support replacement people or a changed purpose. Participation alone
> creates no enrollment, responsibility, access, shared history, consent or
> financial instruction.
>
> Routine participant, name, login and display changes do not automatically
> reset or duplicate the journey. Review only affected future work when the
> ministry becomes ineligible, a genuinely different ministry or material
> purpose is proposed, qualified partner instructions conflict with the planned
> ask, a personnel change materially alters the people represented in an open
> ask, support invitation or promised follow-up, or open obligations lose an
> eligible accountable owner. Use existing
> shared tasks or an actionable exception. Review itself sends nothing,
> transfers nothing and grants nothing. Applicable contact restrictions take
> effect immediately, independently of review.
>
> Do not silently retarget recorded history. An authorized correction of a
> mistaken reference must preserve the previous reference, reason, actor,
> revision and affected history; it cannot rewrite an accepted ask, encounter
> or financial source fact. A genuine new ministry, purpose, Tenant or Legal
> Entity requires an explicit disposition of existing work and, where
> appropriate, linked new future work. Same-real-world identity repair requires
> evidence and a qualified command from its source owner; D2 invents no ministry
> merge or succession service.
>
> Staff responsibility, current access, communication eligibility, giving,
> commitments and public publishing remain with their existing owners. Departures
> must not erase history or abandon obligations; an existing, currently eligible source-owned person or queue receives
> only the permitted work. If neither is available, preserve a visible
> needs-assignment exception for authorized operations; do not claim the handoff
> is complete or widen access to private history. Phase 28 consumes authorized projections of the same
> Phase 27 source; choosing the ministry grants no new missionary visibility.
>
> This decision applies to ordinary identified-ministry support. It neither
> forces every agency/church/project purpose into a ministry nor requires a
> financial account, public Page, agency-parent enrollment or Workflow Studio.
> Existing Party and task work remains available before a ministry is
> identified; do not create a fictitious ministry to satisfy a form. Genuine
> distinct purposes remain possible, while duplicate attempts to create the
> same intended journey or effect must resolve once. Exact purpose admission,
> lifecycle and sharing decisions remain separately governed.

The amendment that most changes the bare answer is **continuity without presumed
transfer of the supporter's allegiance**. The owner, access and money boundaries
are already required by accepted Core decisions. The bounded review/correction
behavior makes the selected direction usable without declaring every personnel
change a ministry crisis.

## Evidence standard and current reality

- **Repository fact:** ADR-0136 and P9 D19 already define the stable Ministry
  Assignment, prospective participants, exact Tenant/Legal Entity and separate
  permissions/Support Binding. This review reuses that model; it does not invent
  a ministry table or reopen the financial model.
- **Current source fact:** inspected executable code has no qualified Ministry
  Assignment source. Legacy donors reference `missionary_id`/profiles; that is
  not a migration mapping or the future cultivation identity. Shared task
  persistence exists, but the general task collection includes local seed state.
  A finance-specific task service does not prove general P27 durability.
- **Current source fact:** CRM detail limits gift history to 100 and activities/
  pledges to 50; report readers cap rows at 5,000. `lastTouchAt` can derive from
  `donor.updated_at`. Those are not complete financial coverage, a meaningful
  contact measure, or approved P27 capacity budgets. Existing browser cache
  cleanup handles user changes; same-user scope/revocation safety is unproved.
- **Primary external fact:** MPDX documents team/ministry accounts and preserved
  partnership history. Its broad account sharing is not compatible authority
  for Core. OMF publishes an actual church partnership following named workers
  across roles, countries and semi-retirement. Reliant exit guidance asks
  partners to choose future support. These support continuity and the personal
  loyalty objection; they do not establish a universal missions workflow.
- **Product judgment:** ministry identity plus explicit human relationship
  provenance is the strongest fit for Core and the founder's choice. Public
  procedural evidence is not representative field research or proof of user
  satisfaction. No numerical performance/portfolio claim is adopted.
- **Unresolved implementation evidence:** no production catalog, deployment,
  browser flow, field pilot or benchmark was qualified. Static findings below
  are reuse/implementation risks, not claims of demonstrated live exploits.
  Required proof is specified, not reported as passed.

Detailed source anchors, current issue bodies, dates and limitations are in the
six [evidence appendices](#evidence-index). Likelihood below is qualitative and
conditional on the named failure, not an observed incidence rate. “Critical”
means possible disclosure of restricted identities or unauthorized action;
“high” means material donor trust, integrity, obligation or delivery harm;
“medium” means significant friction, repair cost or maintainability burden.

## Adversarial check

### What could go wrong with this answer?

A stable ministry becomes a mechanism to inherit supporters, private history,
recurring instructions or donor loyalty. Duplicate journeys and abandoned tasks
can appear when workers change. Same-name ministries or legacy profile mappings
can attach history to the wrong work. F1–F6 below prevent these failures.

### What hidden assumptions are we making?

That staff can identify an eligible P9 ministry; that this describes the actual
relationship purpose; that a qualified source will exist; and that the displayed
label safely identifies the right work. None follows from a profile, public
Page, financial account or directory group. Actual staff/missionary scenarios
must validate the ordinary flow before release (F2, F7–F9).

### How does this affect the whole product?

P27 owns one development source and P28 consumes only qualified views. P9
continues to own ministry/Party identity and shared work; P12 access, P13/14/16
money/recognition/commitments, P6/17 communication, P21 financial support and
P22/23 publishing remain separate. D2 does not create reverse dependencies on
full P28, P34, P40 or P42, nor require full public-pages delivery (F3, F5, F7).

### How does this affect the end-user experience?

A couple/team can maintain one intended continuing journey while staff see who
actually knows the supporter and who acts next. Selecting the ministry must be
simple, permission safe and distinguishable on mobile. A personnel change should
not demand blanket re-entry, re-consent or mass outreach; affected purpose and
ownership changes need an explicit useful next action (F1, F6, F8).

### Does this follow modern best practices?

It follows the useful separation seen in current Salesforce nonprofit
solicitations/action plans, Blackbaud opportunities and ministry account
continuity. It rejects incompatible full-account sharing, pledge-as-cash
interpretations and personal-profile ownership. WCAG 2.2, current PostgreSQL 17
and Supabase guidance inform proof obligations; vendor conventions never
supersede Core's accepted owners (F3, F5, F8, F12).

### Does this fit Asym’s existing repo and product direction?

Yes at the architectural level: ADR-0001, ADR-0136, roadmap v3 and P9 D19 align.
No at the level of assuming it is already implemented. P9's exclusion of Party
notes/activity from missionary projections also needs a precise later owner
amendment before the roadmap's shared-interaction view can be enabled. D2 safely
continues under no new disclosure (F3, F7, F12).

### Should we adjust the recommendation?

**Yes: accept with the exact amendments above.** Keep the ministry anchor,
preserve actual people and intentions, distinguish correction from real change,
and make narrow accountable review possible. Reject automatic supporter
transfer, absolute uncorrectable enrollment references, and a generic succession
engine. The strongest alternative and the category findings follow.

## Necessity and strongest alternative

The known problem is continuing, accountable development by mission staff and
missionaries without making the journey disappear, duplicate or change identity
when a spouse, teammate, login or representative changes. MPDX documents actual
team-history continuity. The user explicitly needs this kind of organization;
we have not measured how common each scenario is in Asym's target agencies.

**Strongest alternative: attach each journey to a missionary person.** That
accurately foregrounds personal trust, including the OMF case. It is simpler for
a single independently acting worker. It does not by itself solve shared couple/
team history, multiple simultaneous ministries, permissions, donor intent or
financial continuity. It risks one copy per person and a second coordinating
model. It is not prohibited merely because P9 exists; it loses here on the
founder's intended organization-owned work and the existing stable ministry
contract. Preserve its strongest advantage through real relationship actors and
provenance, not a second authoritative journey.

**Simpler/no-build option:** use existing Party records, staff assignments,
saved views and shared tasks. That remains appropriate before a ministry is
identified and where a tenant does not need deliberate cultivation. A task-only
model cannot consistently represent separate continuing purposes, successive
asks and stages once those already-selected D1 needs apply. Do not force users
into a journey to save a contact or conversation.

Do not freeze a table layout, generic target registry, configurable purpose
language, global uniqueness key, stage enum, history window, SLAs or retention
period from this answer. Freeze source boundaries and falsifiable outcomes.

## Individual category verdicts

Every category was evaluated independently. References connect each verdict to
the full concern, evidence, severity, likelihood, exact amendment and proof below.
No category is dismissed merely because a prerequisite is not implemented yet.

| #   | Category                                  | Material concern?  | Finding and decision effect                                                                                                                                                                                                                                    |
| --- | ----------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Problem validity, necessity, alternatives | **Yes**            | Personal loyalty and pre-ministry work defeat an unconditional ministry-only model. Narrow ordinary support; retain people and task-only entry. F1, F2, F7.                                                                                                    |
| 2   | Brittleness                               | **Yes**            | Names, people, bindings, JWTs and loaded pages are unstable substitutes for exact sources/current authority. Preserve exact references and revalidate. F2, F3, F5, F10.                                                                                        |
| 3   | Technical debt                            | **Yes**            | Reusing legacy person ownership, seed state, generic last-touch or copied financial calculations would institutionalize shadow authorities. Qualify shared seams. F7, F9, F10.                                                                                 |
| 4   | Edge cases                                | **Yes**            | Couples separating, personnel loss, multiple ministries, retirement, wrong selection and cross-entity moves need distinct outcomes. Preserve history and explicit disposition. F1, F4, F6 and scenario matrix.                                                 |
| 5   | Footguns                                  | **Yes**            | Automatic transfer, inaccessible target errors, bulk edits, stage drag and retry can disclose or fabricate effects. Exact commands, previews where consequential and safe retries. F2–F6, F8.                                                                  |
| 6   | Tenant safety                             | **Yes — critical** | Tenant alone is insufficient for entity/ministry/field scopes; caches, service-role paths and aggregates can leak. No membership-as-access. F3.                                                                                                                |
| 7   | Database, RLS and authorization safety    | **Yes — critical** | UUID FKs, permissive policies and trusted-looking caller fields do not prove resulting-row safety. Require source constraints, trusted context and actual DB proof. F2–F4, F6, F9.                                                                             |
| 8   | Overengineering                           | **Yes**            | Generic succession, target registries, another task engine or donor-wide review on every participant edit adds harm without evidence. Bounded source commands and affected work only. F1, F6, F7.                                                              |
| 9   | UX/UI and friction                        | **Yes**            | Ambiguous/sensitive names, jargon, dragging, mobile/connection failures and forced finance setup can derail ordinary work. Use the shared shell and accessible clear context. F2, F8.                                                                          |
| 10  | Source of truth, ownership, invariants    | **Yes — critical** | Ministry can be confused with funds/Pages/people; projections can become write authority; aggregates can change meaning. Exact ownership and separate effects. F2–F5, F10.                                                                                     |
| 11  | Hidden coupling                           | **Yes**            | Binding/public-page/account changes or optional workflow installation could change cultivation. Native behavior and independently qualified projections. F5, F7.                                                                                               |
| 12  | Failure modes                             | **Yes**            | Local commit, task creation and provider success can diverge; a timeout can prompt duplicate effects. Durable receipts, visible unresolved outcomes and reconciliation. F6, F11.                                                                               |
| 13  | Lifecycle, time, concurrency, idempotency | **Yes**            | Reopen/revoke/retire/reassign/merge races and delayed events can revive access or effects. Explicit source versions and same-business-effect identity. F1, F3, F4, F6.                                                                                         |
| 14  | Data integrity                            | **Yes**            | Fuzzy mappings, concurrent duplicates, partial writes and merge union can corrupt relationships/history. Preserve original evidence and constrain exact relationships. F2, F4, F6, F9.                                                                         |
| 15  | Security and privacy                      | **Yes — critical** | Restricted worker identity, private notes and supporter history can escape through derived output, export, logs and stale state. Source classification at every egress. F3, F8, F11.                                                                           |
| 16  | Scalability and performance               | **Yes**            | Whole-tenant joins, capped financial readers and all-supporter metadata fan-out degrade correctness as well as speed. Complete permitted sources, bounded work and measured plans. F6, F10.                                                                    |
| 17  | Operational burden                        | **Yes**            | Orphaned obligations, broad review storms and ambiguous imports can demand manual DB repair. Authorized actionable repair paths and narrow causes. F1, F6, F9, F11.                                                                                            |
| 18  | Observability and auditability            | **Yes**            | Request logs/best-effort audit do not preserve business history; suppressed failures leave staff falsely confident. Atomic attributable history plus operational signals. F6, F11.                                                                             |
| 19  | Dependency and integration                | **Yes**            | Missing owner sources, vendor labels, delayed provider outcomes and plugin activation can change meaning. No inferred fallback or transport-only dedupe. F5–F7, F10, F12.                                                                                      |
| 20  | Migration, rollout and upgrades           | **Yes**            | Legacy profile ambiguity, old writers, restore and rollback can resurrect effects or access. Safe staging, fencing and roll-forward. F9.                                                                                                                       |
| 21  | Testability, traceability and proof       | **Yes**            | Docs/unit mocks can be mistaken for deployed qualification; glossary/spec/tickets can disagree. Explicit evidence gates and ratification chain. F12.                                                                                                           |
| 22  | Other development hazards                 | **Yes**            | Backups, source retention, stale administrative tools and international temporal assumptions can bypass ordinary flows. Same owners and proof across recovery/egress. F3, F8, F9, F11. No additional independent hazard was established beyond these findings. |

These are design/implementation concerns to prevent, not 22 demonstrated
production defects. Several are already prohibited by governing decisions; the
risk is implementing D2 without carrying those decisions through its consumers.

## Consolidated concern ledger

### F1 — organizational continuity is not transferable supporter allegiance

**High severity; medium likelihood, increased during personnel/purpose changes.**
A replacement worker or repurposed ministry could inherit solicitations and
implied approval because an ID stayed the same. Conversely, every marriage,
participant or title edit could trigger pointless donor review. Either harms
trust and adds work. OMF's named-worker continuity and Reliant's explicit partner
choice are direct counterexamples to automatic transfer; P9 establishes identity
continuity, not donor allegiance. Actual local frequency is unknown.

**Effect:** narrows and materially amends D2; does not invalidate its target.
**Exact prevention:** “Preserve ministry history and actual people independently.
Neither current membership nor an unchanged ministry proves partner acceptance
of replacement people or changed purpose. Review only source-evidenced effects
on ministry eligibility, intended purpose/partner restrictions, the people represented in
an open ask, support invitation or promised follow-up, or accountable open work.
Use recorded source evidence of that representation, not inferred donor sentiment.
Routine metadata changes alone create no donor-wide review.”

**Proof:** a routine teammate addition that does not affect recorded
representations, purpose, restrictions or accountable work causes no review or
outreach; replacing the named worker represented in an open invitation flags
only affected future work for review. Departure
of the sole eligible owner preserves the obligation for an existing eligible
owner/queue or a visible authorized needs-assignment exception; a proposed different purpose does not silently continue an old ask; a
partner refusal suppresses prohibited action without waiting for review. Field
validation must include real solo/couple/team and church relationships without
assuming which party a supporter “belongs” to.

### F2 — target identity, cardinality and scope are underspecified

**High severity; medium-high likelihood if labels/profile shortcuts are used.**
Same names, multiple ministries per worker, zero participants and optional
financial accounts defeat inferred identity. Making ministry mandatory for all
P27 purposes would create fake records; `Party + ministry forever` uniqueness
would reject legitimate distinct purposes. Treating a tenant-scoped Party as
having a fictional Legal Entity would import a wrong schema assumption.

**Evidence:** ADR-0136/P9 D19 require one Tenant and Legal Entity per Ministry
Assignment, zero/many participants and distinct other owner identities. Current
legacy `donors.missionary_id` does not establish that relationship. Exact
purpose/concurrency rules are still unratified.

**Effect:** narrows scope and adds implementation invariants.
**Exact prevention:** “Use the exact eligible P9 Ministry Assignment. Enforce the
journey-to-ministry Tenant/Legal Entity relationship and same-Tenant Party
reference through the source's actual keys; do not invent Party entity
ownership. Required identified-ministry support references cannot be null or
sentinel values. Other admitted purposes use their own explicitly chosen source
contracts. No name/profile/household/Page/fund fallback. Participant count and
current worker do not determine journey identity.”

Where the authoritative key contains Tenant and Legal Entity, use a matching
composite FK/unique target or an equivalently owner-enforced relationship; a
UUID-only FK establishes existence, not tenant compatibility. Required actor,
source, revision and scope fields have no caller-controlled defaults. Index the
actual scoped access paths. Restrict destructive deletes of referenced sources;
use their admitted lifecycle/retention commands. Avoid a generic polymorphic
reference that cannot enforce its source. The exact schema belongs after the
purpose decision, not in D2.

**Proof:** two Tenants; two Legal Entities in one Tenant; same labels; one worker
in two ministries; temporarily empty ministry; no Support Binding; wrong/hidden
source; forged scope; direct SQL and API attempts. One operator's duplicate
submission creates one intended journey, while genuinely separate admitted
purposes are not rejected. No dummy ministry is needed to record a contact/task.

### F3 — anchor, assignment and membership accidentally become authority

**Critical severity; high likelihood if conventional team-account sharing is
copied; not a measured current leak.** New participants, church contacts or task
assignees could gain supporter rosters, financial facts, sensitive worker names
or private notes. Old-but-visible rows could be updated into forbidden scope;
counts, cache keys and service-role commands could bypass otherwise narrow UI.

**Evidence:** ADR-0136/P12 require separate permissions and current exact scope;
P9 excludes Party notes/activity from missionary projections. MPDX broad sharing
conflicts with those rules. Current auth validates users/membership, but broad
roles and user-switch cache cleanup do not prove new purpose/field/history gates.
PostgreSQL 17/Supabase document policy composition and BYPASSRLS behavior.

**Effect:** preserves D2 only with inherited safeguards; exact new sharing needs
separate explicit owner/founder ratification.
**Exact prevention:** “Derive actor, active Tenant/context, attribution and
capability evidence from trusted server context; accept requested source IDs,
never authority claims. Load and authorize current owner evidence at the
consequential boundary. Enforce both existing-row visibility and allowed
resulting-row state. Ministry membership, enrollment, responsibility, Page
contribution and binding confer no implicit grants.”

The enrollment's relationship purpose is business data, not an authorization
claim. Each egress/action uses its P12 door-declared processing purpose and
current purpose/legal-basis, contactability where applicable, and residency
floor. Grants or ministry identity cannot override those floors. Restricted
derived data follows the source's admitted placement, including backups,
replicas, embeddings, diagnostic systems and CDN paths. Reuse the current P12
resolver and source decryption/read-audit requirements; do not build a second
purpose/consent policy engine or accept a caller's business-purpose label as
processing authority (P12 PRD:1636–1638).

Qualify grants, browser table revocation, coarse FORCE tenant RLS, privileged
commands, views, RPCs/definer search paths, storage, exports and legacy writers.
`USING` governs existing rows; `WITH CHECK` governs proposed rows. Omitted
`WITH CHECK` may inherit `USING`; omission alone is not proof of a vulnerability.
Permissive policies combine with OR; adding a restrictive-looking permissive
policy does not tighten an old broad one. FORCE RLS does not constrain a
BYPASSRLS service role. Trusted source/P12 revision discipline must resolve
revocation races; do not create a parallel P27 authorization engine.

Apply authorization before lookup, enumeration, grouping, paging, ranking and
serialization. Scope caches/cursors to relevant active context and authority/
source generations; invalidate denied state and reject late responses. Use
uniform non-enumerating unauthorized outcomes without exposing constraint details.
Keep restricted aliases/classification current across briefs, task text, URLs,
notifications, files, logs and exports. Derived sensitivity follows sources;
retention/redaction must reach retained derivatives. No promise can recall an
already downloaded external file.

**Proof:** real database catalog and resulting-row tests, including INSERT,
UPDATE, DELETE, UPSERT, RETURNING, definer and service paths; member without grant,
revoked member, former member with independent valid staff grant; hidden records
added without changing authorized observable output; same-user scope switch and
late response; restricted identity at every egress. With two independent DB
connections, test revoke-before-admission and accepted-write-before-revoke with
defined commit ordering, not sleep-based luck. Accepted history remains true;
stale authority cannot create a new effect. Changing the enrollment's purpose
cannot broaden source access; otherwise permitted actors/sources are denied for
an unadmitted processing purpose or residency. Restored and derived output must
respect current source retention, redaction and placement.

### F4 — correction, merge and succession rewrite history

**High severity; medium likelihood.** An innocent wrong-ministry correction may
be impossible under an absolute immutable-reference rule; unrestricted editing
may instead rewrite presented asks, actors and financial meaning. Duplicate
Party merge may union permissions or replay work; a real cross-entity transfer
may masquerade as identity repair.

**Evidence:** P22's before/after Page-release retarget rule is Page-specific.
P4/#512 admits source-approved mutable-reference repair, not universal rewriting
of frozen financial rows; older #610 blanket wording is not the operative
permission. No inspected P9 command qualifies Ministry Assignment merging.

**Effect:** changes the initial tempting “never change the FK” interpretation.
**Exact prevention:** “Distinguish erroneous reference correction, source-certified
same-real-world identity repair, and genuinely different future work. All use
explicit owner-authorized, expected-version operations with preserved original
reference, actor, reason and history. No correction rewrites accepted source
facts, unions grants, manufactures donor intent or repeats effects. A different
ministry/purpose/Tenant/Legal Entity requires explicit future disposition.”

An authorized correction may repair the current association only when its
consequences are qualified; when presented/completed/source-owned effects are
involved, retain their original facts and route any necessary correction to their
owners. Missing owner evidence blocks automatic repair. Do not build Ministry
merge speculatively or make honest draft entry mistakes permanently unrepairable.

**Proof:** wrong draft target, stale simultaneous correction, correction after a
presented ask, Party merge/unmerge, same-name distinct ministries, proposed
source-certified identity repair without that command, real split, cross-entity
and cross-Tenant move. Original receipts and source facts remain attributable;
current access never expands because records merge.

### F5 — cultivation fabricates money, consent or public authority

**Critical for unauthorized financial action; high for reporting errors;
medium likelihood if target/binding is treated as a financial shortcut.**
A ministry link or positive response could redirect recurring gifts, choose a
Designation, claim fulfillment, double-count a spouse/soft credit or grant contact
permission. Page editors could gain CRM access; private briefs could become
public content. A financial binding change could rewrite cultivation history.

**Evidence:** P13 contributions, P14 recognition, P16 commitments, P21 Support
Binding, P6/17 eligibility and P22/23 publishing are independently governed.
ADR-0206 preserves posted financial facts. Blackbaud “funded” may include pledges;
that external label is not Core cash truth. Salesforce separates solicitations,
commitments and transactions.

**Effect:** preserves D2 with explicit source boundaries.
**Exact prevention:** “The ministry target neither creates nor redirects a gift,
commitment, designation, charge, financial association, communication permission
or publication. Read each fact through its qualified source. Requested, expected,
committed, received, recognized and staff credit remain distinct, with source
identity, Legal Entity, currency, period and completeness. Changes use the owner,
not the cultivation projection.”

No floating-point money, silent FX, summed mixed currencies, pledge-as-cash,
inferred zero or proximity-based fulfillment. Explicit association and
nonduplicating coverage must follow the eventual source-owner contract; same
payment/recognition may appear in views without being added twice to an
organization total. No finance setup is required for prayer/nonfinancial work.
A former participant's access and a donor's ongoing instruction are independent
facts. Current suppression must be rechecked before an eligible external effect.
Public release follows approved safe snapshots and publishing permissions.

**Proof:** no binding, replacement binding, partial/refunded/reallocated gifts,
DAF/household/church remittance/soft-credit contexts, multi-currency/monthly versus
annual amounts, unavailable readers and delayed corrections. Stage movement or
positive response writes no money or consent. Membership/exit changes do not
alter recurring support. Public Page/CMS access yields no internal portfolio.

### F6 — partial writes, duplicate effects and abandoned work

**High severity; high likelihood under retries, multiple staff and unreliable
connections without durable coordination.** A saved journey can lack its required
next action; a task can be duplicated by native and Workflow Studio paths; a
provider timeout can cause a second send. Reassignment/revocation may abandon
work or reopen completed effects. A generic review task can hide a financial or
permission transition it never actually performed.

**Evidence:** current task service has separate inserts and a finance-specific
wrapper; operation request IDs and best-effort audit are not durable business
idempotency. Effective DON/WS contracts require shared source-purpose effect
identity. The user's accepted scope requires an appropriate shared task or an
owned actionable exception for each active enrollment.

**Effect:** required implementation safeguards, not a new engine.
**Exact prevention:** “Commit each P27 authoritative mutation with its attributable
history, durable operation/effect identity and required local obligation or owned pending exception atomically; persist any
required outbox in that same transaction. Use existing owner executors for downstream effects; retain
visible pending/failed/unknown outcomes and reconcile authoritative receipts.
Transport retries, native/Studio paths and republishing do not create another
instance of the same intended business effect.”

Do not stretch this into one cross-domain distributed transaction. A downstream
owner's failure remains pending/blocked rather than a false success. Ambiguous
external success requires provider/source reconciliation before resending; use
provider idempotency where supported, durable receipts and deduplicated event
processing otherwise. Never promise universal exactly-once transport. Same key
with different content is a conflict. Late events cannot roll back newer source
meaning. Staff/user/workflow-run/year/currency cannot split identical business
intent merely to evade deduplication. Exact permitted distinct purposes remain a
later decision; do not freeze one journey per Party+ministry forever.

Revocation denies first; source-owned reassignment accounts for every unfinished
ask/task/reminder/stewardship obligation and preserves original actors. Route work to an existing, currently eligible source-owned person or queue.
If neither exists, retain a visible needs-assignment/actionable exception for
authorized operations; do not invent queue authority or mark handoff complete. Completing a
review task does not itself transfer grants, settle money or infer donor assent.
Reopening must revalidate source/owner/restrictions and never revive completed
effects or revoked access. Retired source identity cannot become eligible through
a P27 reopen command. Use date-only and instant semantics from the actual owners.

**Proof:** deterministic concurrent create/reopen/reassign/task-complete/retire
and revoke tests; lost response after commit; crash at each local/secondary
boundary; repeated native/Studio/import/provider delivery; changed-payload retry;
late pre-close event; no eligible assignee; owner/provider unavailable. Exactly
one intended effect or an actionable visible unresolved state remains, with no
prohibited outreach. These are future real integration tests, not mock promises.

### F7 — predecessor gaps produce shadow services or excessive scope

**High severity for architectural drift; medium-high likelihood under delivery
pressure.** Teams may substitute profile IDs for a missing ministry source,
copy a task store, require all of P21/P22/P28 before cultivation or build a generic
succession engine to cover speculative cases. Each makes upgrades and source
correction harder while delaying basic user value.

**Evidence:** accepted Ministry Assignment contracts are not qualified executable
behavior; current #1284/#1285 and #1136 retain source/access work. Shared task
foundations already exist; P26 #1704 explicitly treats #618/#1046 as source/read
consumers, not missing generic task infrastructure. Native P27 is independent of
P34/P40/P42; v3 supersedes obsolete all-pack workflow dependency graphs.

**Effect:** changes delivery prerequisites, not D2's domain choice.
**Exact prevention:** “Qualify the minimum existing P9 ministry identity,
eligibility/lifecycle and shared-work commands, and the exact P12 capabilities
P27 consumes. Do not create a parallel identity/task/permission service or depend
on full later products. Optional unavailable sources report unavailable; the
native identified-ministry journey remains usable when its own required owners
are qualified.”

Use shared shell, tasks, assignments, saved views and established executors.
P9 source eligibility remains P9's judgment; P27 does not infer incapacity from
login absence or decide ministry reactivation. Do not add a general transition
or purpose framework before concrete admitted cases require it. Existing
Party/task work is the no-build path for unclassified early relationship work.

**Proof:** native flow with P34/P40/P42 disabled and no Page/Support Binding; missing
required ministry source fails clearly without profile fallback; reference a
shared durable task from the real shell; reject local seed success as delivery
proof. Document exact consumed contracts rather than broad phase dependencies.

### F8 — usable context and sensitive international field conditions

**High severity for wrong target or exposure; otherwise medium; high likelihood
if generic desktop CRM controls are reused unchanged.** Truncated same-name
ministries, jargon, hover-only labels, drag-only boards, slow connections and
shifting dates create errors and staff workarounds. A safe alias falling back to
a legal identity can endanger restricted workers. Donors should not be asked to
understand or operate the staff cultivation model.

**Evidence:** Core's shared shell/Base UI guidance, current loaded-row lifecycle
board, WCAG 2.2 and GOV.UK form guidance; ministry support docs show personal/team
contexts but do not prove a particular Asym label is intuitive.

**Effect:** necessary UX safeguards; no new public/donor workflow.
**Exact prevention:** “Use clear Ministry, Relationship purpose, Responsible
person and Next action labels in the shared record context. Offer only permitted
eligible choices, with enough authorized detail to distinguish them. Prefill
from a single unambiguous authorized context while showing the choice; never
silently choose among several or reveal hidden alternatives. Display actual
relationship people without treating them as the target or grants.”

No mandatory finance/Page setup, redundant per-save confirmation or required
full international postal address for this internal relationship. Preserve
source international names/scripts and address formats when displayed; no
Western name splitting or required US state/ZIP assumption. Do not invent a
“partnership” label that falsely implies a prospect has agreed. Validate wording
with staff. Restricted aliases have no real-name fallback.

Provide keyboard and **single-pointer click/tap** alternatives to dragging;
keyboard alone does not meet WCAG 2.5.7. Verify 24 CSS-pixel target minimum and its
exceptions under 2.5.8; Core's larger 44px touch guidance remains useful, not a
misstated WCAG AA requirement. Preserve visible focus, focus return, list/filter
context, readable full labels, status announcements and linked field errors.
Support ordinary work at 320 CSS px and 400% zoom through appropriate list/detail
views. Distinguish date-only organizational deadlines from event instants;
localization must not change source currency/period/identity.

Show pending, confirmed, rejected or unconfirmed save outcomes honestly. Safe
retry resolves the same intended operation. Preserve still-authorized draft
input, clear denied content and reject old responses after scope change. Poor
network does not authorize offline replay of consequential commands.

**Proof:** real keyboard/touch/screen-reader flows, narrow viewport, zoom, long
Thai/Arabic/Latin/combining-character names, RTL, same aliases, timezone differences,
interrupted network and unconfirmed commit. Actual staff/missionary participants
must identify the supporter, ministry, human relationship lead and next action
without coaching. Automated accessibility checks supplement manual testing.

### F9 — migration and recovery infer facts that were never recorded

**High severity; high likelihood if legacy profile rows are treated as complete
ministry evidence.** A profile can map to several ministries; copying its donors
to each creates false journeys. Imports/backfills may synthesize stages, contact
permission or outreach. Mixed writers and backup restore may resurrect revoked
access and already completed effects. Rolling back code alone can discard new
business meaning.

**Evidence:** legacy `donors.missionary_id`, unqualified source model and current
seed/read seams; Core identity-repair, revocation and durable-effect contracts.
This is a prerequisite risk, not a claim that a migration has been written.

**Effect:** required migration/activation safeguards.
**Exact prevention:** “Inventory retained data and old writers before cutover.
Map only source-evidenced identities; keep ambiguous associations pending
clarification with original evidence, without duplicating, guessing or blocking
unrelated valid work. Preserve real existing history/tasks. Backfill emits zero
newly approved cultivation stage/task/message events and invents no enrollment,
consent or historical activity.”

Use additive compatible rollout where possible, resumable idempotent batches,
counts/reconciliation and explicit activation separate from import. Fence old
profile/seed/privileged writers before new source authority is active. Do not
introduce blanket dual-write ownership. Verify old-code/new-schema and new-code/
old-schema behavior or explicitly fence the unsupported combination. Kill
switches stop new admission/effects while retaining authorized read/reconciliation
and history. After new data is written, prefer safe roll-forward; rollback must
not reactivate old bypasses or erase new facts. Restore must reconcile durable owner retention/erasure/redaction dispositions
and revocation/suppression/effect evidence before re-enabling affected reads or
actions. When current disposition cannot be established, keep the affected
output unavailable. Use supported owner retention/deletion commands, not cascades
from a worker's profile.

**Proof:** empty and production-shaped fixture census; one profile to many
ministries; repeated/interrupted migration; unknown historical time/purpose;
row-count/source-map reconciliation; mixed versions; disable after accepted write;
restore after revocation, delivery and participant departure. Restore a snapshot
predating authorized source redaction/erasure while the viewer's grant remains
valid: removed content and derivatives must not become readable, while minimum
legally permitted non-content history survives. No new outreach,
missing obligations or permission union. No unsupervised direct-DB repair is the
normal recovery path.

### F10 — incomplete/unauthorized data becomes authoritative metrics

**High severity; high likelihood if existing capped readers and mutable donor
summaries are reused.** Staff may treat missing giving as zero, timestamps as
meaningful contact, or a loaded board count as an entire portfolio. Hidden gifts
can affect ranking. A single metadata edit can fan out to every supporter,
creating workload and report failures as tenants grow.

**Evidence:** inspected 100/50/5,000 read limits, `updated_at` last-touch fallback,
placeholder score and incomplete source implementations. The reviewed official
sources provide no transferable Core throughput or portfolio productivity bound.

**Effect:** forbids attractive but unsound implementation shortcuts.
**Exact prevention:** “Use complete, qualified, currently permitted source
projections for their admitted meaning. Unknown/unavailable/truncated coverage
is explicit and never zero. Do not infer meaningful contact, financial totals,
score or stage from legacy fields or loaded pages. Derived views remain
recomputable and never a write authority.”

Filter authorization before counts/ranking/aggregates; scope pagination/cursors
and query plans appropriately. Use indexes on measured scoped access paths,
bounded pagination and owner-compatible batches. Routine metadata changes do not
fan out donor reviews. Before release, name workload distributions, data sizes,
concurrency, units, percentile/measurement method and approved latency/resource
budgets from actual use; inspect plans and benchmark against them. No arbitrary
P95, 100-record “sufficient history” or unverified speed claim is ratified here.

**Proof:** independently computed source reconciliation including records beyond
all current caps, mixed currencies, source correction and unavailable sources;
authorization noninterference; skewed large tenant and many small tenants;
concurrent batch/interactive work. Tests fail on truncation presented as complete
and on hidden facts changing a permitted ranking. Release evidence must state
the measured workload, not just “scalable.”

### F11 — staff cannot see, explain or safely repair what happened

**High severity; medium-high likelihood if technical logging is the only record.**
A failed task/review can look like healthy stewardship; history may omit the true
actor; a private payload in logs can leak more than the application. Retained
exports/briefs can outlive source restrictions; a stale queue can repeatedly fail
without a responsible human.

**Evidence:** current operation/request logging and best-effort audit are not
atomic business history; protected source/Support/shared-task contracts require
independent custody and attribution. No live alerting or recovery behavior was
qualified.

**Effect:** required operational safeguards, not a new observability platform.
**Exact prevention:** “Record accepted P27 business changes and their original
actor/source/revision atomically, separate from technical traces and security
audit. Carry durable source/effect correlation through shared tasks and delivery.
Expose pending, failed, blocked and unresolved outcomes to an independently
authorized accountable owner with a permitted next action and repair command.”

Keep only necessary identifiers/reasons in operational diagnostics; no copied
private notes, raw financial histories, restricted names or location details.
Preserve source-approved corrections without erasing prior meaning. Retention,
erasure/anonymization, attachments, exports and backups follow each owner and
legal need; D2 cannot prescribe a universal period or guarantee external recall.
Repair/reconciliation reuses authoritative commands and never asks staff to
edit production tables. Denied access need not disclose a hidden source name to
explain that an action requires an authorized owner.

**Proof:** accepted-write/audit/outbox failure injection, unauthorized log/export
inspection, missing-source/expired-source derivative, failed delivery/reassignment
and overdue actionable exception. A permitted operator can determine what
committed, what remains uncertain, who owns recovery and which source command
repairs it without receiving forbidden content.

### F12 — evidence and terminology drift masquerade as completion

**High severity; high likelihood if documentary acceptance is treated as runtime
qualification.** A source PR closed unmerged may be mistaken for a rejected
contract; a demo board may be described as implementation; copied vendor fields
may override Core; proposed sharing/correction clauses may become ratified by
being written in an appendix.

**Evidence:** roadmap v3 adoption through #1891/#1897 and closed original source
PRs; live issue-body amendments; accepted ADR-0136 versus absent executable
source; P9/P28 sharing conflict. Current Salesforce documentation concerns
Agentforce Nonprofit/former Nonprofit Cloud, not older NPSP. Core's pinned Payload
build is not proven equivalent to public current docs.

**Effect:** required decision and release traceability.
**Exact prevention:** “Label each statement as inherited contract, current code,
verified external practice, product judgment, assumption or unproved behavior.
Only a ratified D2 changes the glossary/decision authority. Preserve owner
amendment provenance and distinguish publication, adoption, implementation and
qualified release. Do not present mock/static checks as database/UI evidence.”

Carry D2 and its concern/proof IDs from this log into any later authorized PRD,
OpenSpec requirement/scenario, design/task, issue, implementation test and release
evidence. Resolve contradictory owner wording before activating the affected
behavior. Use canonical Ministry Assignment, Party, cultivation enrollment,
responsibility, Support Assignment and Designation distinctly; stage, lifecycle,
ask, commitment and workflow state do not share an enum. No new ADR is needed
merely to repeat ADR-0136; a genuine accepted cross-owner change follows the
repository's decision process.

**Proof:** trace each proposed acceptance outcome to its owner and test; inspect
current issue bodies, source adoption ancestry, actual schema and authenticated
flow. Independently review the final wording for silent grant, finance or
succession expansion. Scope documentation checks honestly: formatting/link
success is evidence of document integrity only.

## Edge-case and lifecycle pressure test

The rows below are intended outcomes to preserve, not invented reports of actual
agency behavior or a prematurely frozen P27 state machine. Source owners retain
their accepted states. Draft/active/paused/ended words describe cases here; final
P27 lifecycle labels and close/reopen rules still require their own decision.

| Case                                                           | Correct bounded outcome                                                                                                                                                                                                                | Forbidden shortcut                                                                                  |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Solo worker becomes a couple/team; teammate added              | Same eligible ministry/purpose can retain history; preserve each actor and current separate grants. Review only genuinely affected purpose/ownership.                                                                                  | Clone journeys per spouse; share all supporters; review every donor automatically.                  |
| Separation, divorce, death or incapacity                       | Keep sensitive personal facts minimal; source owners establish changed ministry/responsibility. Review affected open work, support current permitted greetings and preserve history.                                                   | Assume a spouse owns the relationship or money; copy private notes; infer incapacity from no login. |
| Worker on home assignment, leave or temporary travel           | Geography/status alone does not decide new ministry or purpose. Apply actual owner eligibility and responsibility evidence.                                                                                                            | Reset stages, force new journey or disclose location.                                               |
| Zero participants but eligible ministry                        | Preserve the source identity; future active work still needs an eligible accountable staff owner or actionable exception.                                                                                                              | Delete history, create fictitious worker, or treat empty membership as automatic source retirement. |
| One worker in several ministries                               | Select exact purpose/ministry; permit distinct admitted work and current views.                                                                                                                                                        | Pick latest/primary profile mapping silently; duplicate a legacy roster into every ministry.        |
| Same name, renamed ministry, restricted alias                  | Source identity controls; label can change; show enough permitted disambiguation.                                                                                                                                                      | Name-based merge, real-name fallback or hidden-entity count.                                        |
| Retirement/ineligible source                                   | Hold affected new cultivation admission; preserve history and permit independently authorized reconciliation/correction/disposition.                                                                                                   | Automatic successor or erased outstanding tasks; reopening P27 overrides P9.                        |
| Replacement worker with same ministry ID                       | Historical continuity does not establish partner assent. Preserve actual relationship lead and review applicable purpose/ownership changes and materially changed people represented in an open ask, invitation or promised follow-up. | “Transfer all supporters,” grants, preferences or recurring gifts.                                  |
| Wrong ministry selected                                        | Qualified explicit correction with version/provenance and consequence checks; source-owned accepted effects retain their facts.                                                                                                        | Uncorrectable draft or silent rewrite of past asks/financial facts.                                 |
| Genuine ministry split/combination or changed purpose          | Explicit source evidence and bounded future disposition; create linked new work when appropriate; retain origins.                                                                                                                      | Invent general ministry merge/succession authority; distribute donor history to every branch.       |
| Legal Entity or agency/Tenant change                           | Different source scope; explicit authorized disposition and independently admitted new work where appropriate. Cross-Tenant disclosure/export needs its own authority.                                                                 | Cross-scope update, transfer of grants or commingled financial totals.                              |
| Support Binding, Designation or public Page changes            | Cultivation remains attached to ministry; source-owned finance/public facts change only under their own command.                                                                                                                       | Retarget journey, infer gift fulfillment or use Page slug as identity.                              |
| Supporter household/church contacts change                     | Party/relationship owner governs correction; preserve contact roles and distinct legal giving/recognition.                                                                                                                             | Unify spouses' consent, church members' gifts or committee access.                                  |
| Party merge/unmerge or late imported history                   | Source-qualified mutable repairs preserve original evidence and effects; no grant union, manufactured stage or new outreach.                                                                                                           | Replay reminders, rewrite immutable finance or call all imported history meaningful contact.        |
| Two staff act; response is lost; optional automation also acts | Same intended operation/effect resolves once; differing intent is explicit; stale revision gives an actionable conflict.                                                                                                               | Separate duplicate because a different user/run/request ID submitted it.                            |
| Revoke while editing/sending; worker departs                   | Deny new unauthorized action at the defined boundary; retain accepted history and eligible recovery ownership.                                                                                                                         | Finish with cached old grant or grant successor full history to avoid orphaning work.               |
| Pause/end/reopen; late old event                               | Source/current restrictions and actual lifetime rules govern; old completed effects remain completed.                                                                                                                                  | Reopen restores access/consent, repeats asks or rolls back newer meaning.                           |
| Partner says never ask; prayer-only relationship               | Immediately suppress prohibited solicitation; permitted internal review/stewardship can remain.                                                                                                                                        | Treat no financial ask as failure or make next-action policy force contact.                         |
| No identified ministry yet                                     | Record legitimate Party/relationship/task work with existing capabilities; do not fake target.                                                                                                                                         | Require fund/Page/new ministry to save a lead; silently select a worker's current ministry.         |

## Exact ownership and invariants

| Fact                                                                           | Authoritative owner                             | P27 treatment                                                                              |
| ------------------------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Party, relationships, ministry identity/participants, source lifecycle         | P9 and its accepted identity/merge predecessors | Exact references; never inferred from UI labels or login.                                  |
| Cultivation journey, development purpose, ask, development appeal meaning      | P27                                             | Sole source; current staff and P28 views are consumers, not parallel stores.               |
| Role-qualified staff responsibility, shared tasks/activity/shell, saved views  | Existing P9/shared owners                       | Reuse source commands; portfolio is derived, not writable membership.                      |
| Human principal/context, capabilities, field/history disclosure/classification | P3/P10/P12 and referenced source                | Current independent authorization at every read/action/egress.                             |
| Posted contribution/designation lines, recognition, commitment/fulfillment     | P13, P14, P16; ADR-0206                         | Qualified readings and deliberate owner handoffs; never manufactured from stage or target. |
| Financial support identity/binding                                             | P21 with P9/P12 boundaries                      | Optional separate evidence; not ministry identity or permission.                           |
| Eligibility, suppression, approved content, delivery                           | P6/P17 and applicable source owners             | Recheck for actual effects; source receipts own outcomes.                                  |
| Support/care context and sensitive documents                                   | Their source owners, including P26              | References with independent useful permitted context; no copied private transcript.        |
| Public ministry Page and approved release                                      | P22/23/Payload publishing contracts             | Public-safe source consumption only; public editor does not gain CRM authority.            |
| Optional workflow coordination                                                 | Established durable executors/P34               | Same source-authorized effects and receipts as native path.                                |

Always true: one Ministry Assignment has exactly its source Tenant/Legal Entity;
participants may be zero/many and may have other ministries; role-qualified
staff assignments retain the existing multiple-assignee and one-primary rules;
a journey's subject
is not its current representative; same-intent concurrent effects do not
multiply; distinct admitted purposes are not collapsed; access does not follow
participation; historical actors/source meaning are preserved; current authority
is reevaluated; immutable financial value is neither rewritten nor counted twice;
unknown data is not zero; read models never become source writers.

## Resolve the sharing conflict without expanding D2

P9's PRD states that Party notes/activity never appear in missionary-workspace
projections. Adopted roadmap v3 calls for permission-scoped shared interaction
work while explicitly leaving exact sharing to P27. These are not interchangeable
permission rules. **Operative D2 outcome: no new missionary disclosure.** This
fully resolves what D2 itself can authorize; it does not silently repeal P9.

The permanent direction for the later sharing decision is an explicit narrow
owner amendment, not a copied note store or unrestricted ministry roster. Proposed
owner wording, **not ratified by D2**:

> P9's exclusion of general Party notes/activity from Missionary Workspace
> remains. A separately registered, source-owned development-interaction
> projection may be consumed by P28 only under a P27/P28-ratified sharing contract
> defining permitted fields, audience, actions and history scope, enforced
> through P3/P10/P12. It references the same encounter identity and does not expose
> general CRM timeline, staff-private or restricted notes, care, Support-private
> context, or any independently denied source. Without that contract and current grant, no missionary projection is
> available. A source reference or derived summary cannot widen its source.

The same exact owner qualification is required for a ministry-scoped supporter
slice if inherited text assumes a missionary person. D2 must not be used to
expose an unqualified roster. The concrete fields/history choices belong to the
subsequent one-at-a-time product decision, before any affected specification or
implementation is activated.

## Ruthless synthesis: what should actually happen

1. **Completed — amended D2 ratified 2026-10-09:** the founder explicitly accepted
   the bounded decision above, including personal loyalty, affected-work review
   and correction versus real change. D1 and existing source owners remain
   unchanged. The glossary reflects the ministry context without implying that
   participants automatically share access or that supporter allegiance transfers.
2. **Before an authorized specification:** carry the F1–F12 invariants and proof
   obligations into the relevant requirements, not an enormous new engine.
   Resolve purpose admission/concurrency, entry/lifecycle, responsibility and
   exact shared projections through the remaining grooming decisions. Reconcile
   P9/P12/P28 wording explicitly when sharing is decided. These are named
   decisions outside D2, not defects to solve by guessed enums/keys today.
3. **Before implementation admission:** qualify the narrow P9 ministry/source
   lifecycle and P12 capability seams, current shared-task command and permitted
   finance/communication readers actually consumed. Inventory legacy writers and
   retained data. Missing required owners block the affected feature; missing
   optional products do not. Do not wait for entire future phases or substitute
   profiles, raw financial tables or seed collections.
4. **During implementation:** enforce exact same-scope references and resulting
   state through constraints plus a trusted source-command boundary; use existing
   current-authority gates, version conflicts, durable history/receipts/outbox,
   shared tasks and executors. Build a simple shared-shell flow with permitted
   context, understandable conflict recovery and accessible mobile controls.
5. **Before release:** prove the real DB/API/browser negative, concurrency,
   recovery, migration and field-UX cases below; measure production-shaped query
   plans/workload against explicit approved budgets. Activate reversibly with old
   writers fenced, independent effect controls and preserved reconciliation.
   Record what was qualified and what is still unavailable. A documentation green
   check cannot substitute for these gates.

**No material correctness or privacy finding is assigned to “monitor later.”**
All are prevented or gated before affected behavior activates. Operational
monitoring supplements those safeguards with defined ownership:

| Signal                                                                                | Threshold                                         | Accountable owner                              | Required response                                                                                                              |
| ------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Confirmed cross-scope disclosure, forbidden resulting state or stale-authority effect | One confirmed occurrence                          | P12/security owner with offending source owner | Fence the affected path; preserve minimal evidence; follow incident/repair procedure; requalify before reactivation.           |
| More than one authoritative receipt for one intended business effect                  | One confirmed duplicate                           | P27 effect owner and shared executor owner     | Stop affected dispatch/admission; reconcile source receipts and obligations; repair through source commands, not blind replay. |
| Active journey lacks required task or owned actionable exception                      | One authoritative invariant violation             | P27 operations owner/shared-task owner         | Expose eligible repair work, restore the obligation safely and investigate the failed atomic path.                             |
| Actionable exception passes its recorded review deadline unresolved                   | First evaluation after that source-owned deadline | Named responsible staff/authorized queue owner | Escalate through the permitted shared-task path; keep prohibited outreach blocked. No fabricated global time budget.           |
| Source projection presented as complete disagrees with authoritative reconciliation   | Any verified missing/duplicate covered fact       | Owning reader plus P27 reporting owner         | Withdraw affected complete/total claim; show unavailable/incomplete coverage; repair and rebuild derived view.                 |

These thresholds are correctness predicates or already-owned due dates, not
unsupported throughput promises. Concrete on-call/queue identities and any
additional numerical performance alerts must be assigned and qualified before
activation; an ownerless signal is a release failure.

## Required proof and traceability

| Proof family                          | Outcomes that must be demonstrated                                                                                                                                                                                                               | Main findings      |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| Domain/source and ordinary user cases | Solo/couple/team/empty ministry; same labels and multiple ministries; real people/provenance; prayer-only; no-binding/native-only; no dummy targets; no implied assent.                                                                          | F1, F2, F5, F7, F8 |
| Database and authorization            | Catalog grants/policies/functions/views/storage; exact FKs/checks/null/default/delete behavior; old and proposed rows; trusted actors; processing-purpose/legal-basis/residency floors; actual privileged boundaries and non-enumerating errors. | F2–F4              |
| Revocation/concurrency                | Independent DB connections with deterministic commit barriers for duplicate creation, retirement, correction, task completion, reassignment, merge and revocation.                                                                               | F3, F4, F6         |
| Effects and recovery                  | Commit/crash/response-loss boundaries; durable same-intent result; provider unknown success; out-of-order events; repeated native/Studio events; explicit repair and preserved history.                                                          | F5, F6, F11        |
| Disclosure noninterference            | Hidden records do not alter authorized counts/rank/filter/brief; no private task/source content; scope-switch late responses rejected; restricted aliases survive every egress.                                                                  | F3, F8, F10, F11   |
| Migration and restore                 | Census, ambiguous mapping, repeat/interruption, mixed versions, writer fencing, kill switch, restore/revocation/retention/redaction/effect reconciliation and zero new outreach.                                                                 | F4, F9             |
| Accessibility/international field UX  | Keyboard and click/tap without drag, screen-reader feedback, narrow/zoom layouts, local scripts/addresses, safe aliases, date-only timezones and interrupted connections.                                                                        | F2, F8             |
| Complete data and scale               | Beyond-current-cap source reconciliation, skew/concurrency/query plans, bounded jobs, explicit workload/units/budgets with measured results.                                                                                                     | F6, F10            |
| Representative field feedback         | Actual mission staff, missionaries and church-relations users can identify purpose, target, relationship lead and next action; failures and changes recorded. No assumed universal agency practice or invented satisfaction statistic.           | F1, F7, F8         |
| Decision-to-release chain             | D2 ratification → glossary/owner amendment if needed → authorized PRD/OpenSpec scenarios → design/tasks/issues when authorized → implementation/tests → release evidence. No contradictory terms, scopes or statuses.                            | F12                |

D1 and D2 are reflected in the cultivation-enrollment glossary entry. D2 is
linked as a **ratified amended decision** in the grooming log; its acceptance
does not silently update ADR-0136, OpenSpec, the separate sharing proposal or
GitHub tickets. No production behavior, donor contact, code or migration changed
in this review. Formal artifacts still require the commands the user specified.

## Evidence index

| Durable appendix                                                 | What it verifies                                                                                                                       |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [Identity and governing contracts](d2-evidence/identity.md)      | ADR-0136, P9/P12/P21/P22/P44, current #1284/#1285/#1136/#512/#675/#686 bodies, lifecycle/correction and source boundaries.             |
| [Authorization and privacy](d2-evidence/authorization.md)        | Current auth/cache/RLS/projection seams, official PostgreSQL 17/Supabase behavior, sharing conflict and real proof requirements.       |
| [Current CRM/task implementation](d2-evidence/implementation.md) | Legacy profile ownership, source searches, task persistence versus seed UI, operation semantics, reader limits and migration concerns. |
| [Financial and integration boundaries](d2-evidence/financial.md) | P13/P14/P16/P21, ADR-0206, contribution/recognition/commitment separation and external opportunity caveats.                            |
| [UX and comparative product evidence](d2-evidence/ux.md)         | Current Salesforce/Blackbaud/Virtuous, Core UI, WCAG 2.2/GOV.UK, Payload boundary and mobile/error/accessibility proof.                |
| [Missions practice and counterexamples](d2-evidence/ministry.md) | MPDX/TntConnect/OMF/Reliant procedures, publication/modified dates, actual personal-loyalty example and limits of generalization.      |

Most decision-relevant primary references:

- [ADR-0136: organization-owned ministries and separate support access](../../../adr/0136-organization-owned-ministry-assignments-and-separated-support-access.md).
- [P9 PRD, including A12 and D19](../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md).
- [P12 permission configuration](../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md).
- [Program roadmap and adoption guidance](../../../prds/program-roadmap/README.md).
- [MPDX ministry/team accounts](https://help.mpdx.org/article/633-adding-and-managing-ministry-accounts-all-other-orgs), updated 2024-06-24: continuity precedent; broad access model rejected.
- [OMF: 50 years of missionary support](https://omf.org/in-it-for-the-long-haul-50-years-of-missionary-support/), published 2024-05-03: concrete personal relationship across changed roles; not a prevalence estimate.
- [Reliant exit prayer-letter guidance](https://solomon.reliant.org/display/public/employman/Exit%2BPrayer%2BLetter%2BSample%2BWording), modified 2025-08-14: partner choice, with organization-specific employment scope.
- [Current Salesforce philanthropy workflow](https://trailhead.salesforce.com/content/learn/modules/nonprofit-cloud-philanthropy-and-partnerships/work-with-prospects-and-donors), retrieved 2026-10-09: current nonprofit model, not NPSP.
- [PostgreSQL 17 row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) and [policy semantics](https://www.postgresql.org/docs/17/sql-createpolicy.html); local config declares major version 17, deployed version not queried.
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
- [WCAG 2.2 dragging](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html), [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) and [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

All source checks above were research, not production qualification. Appendix
working-file paths identify research captures; durable reasoning, citations and
limitations are retained here in the repository. The consolidated decision above
controls over unreconciled suggestions in an individual appendix.

## Review completion evidence

Three independent synthesis reviews checked source/lifecycle contracts,
authorization/retention and actual missions scenarios. Their material findings
were reconciled: correct optional-phase ownership; no invented fallback queue;
review when a personnel change alters people represented in open work; retain
independently permitted Support context; distinguish business purpose from P12
processing authority/residency; and prevent restore from reviving erased or
redacted content. These corrections strengthen the bounded D2 decision without
ratifying broader sharing or lifecycle policy.

All 22 category entries, seven requested adversarial headings and twelve
consolidated findings are present. Scoped Markdown formatting, local file-link
validation and `git diff --check` passed. Those are documentation checks only;
no live database, application, performance or field-usability pass is claimed.
