# Phase 27 D10 — flexible organization stage lists

2026-10-10. **Amended D10 ratified.** Review disposition: **Accept with required
amendments**; the founder explicitly confirmed, “Yes, ratify this amended D10.”
The exact amended decision and safeguards below are accepted interview intent.
Research/interview evidence against Core HEAD
`225c02e9499bd6c0d493223cd4b1a4120ff787e3` and the current D1–D9 working documents.
This is a completed decision review, not a formal PRD/OpenSpec, implementation,
permission grant, activation or claim that Phase 27 has shipped.

## Decision in ordinary language

A stage is the team's recorded understanding of where a particular ministry
partnership's development work stands. A stage list is the set of descriptions
the organization makes available for that kind of work. Organizations should
be able to adapt those lists without asking developers to change the database.

For example, an organization might add a useful distinction between learning
about someone's interest and exploring a specific partnership. That is an
illustration, not a verified ministry workflow or a prescribed stage sequence.
Renaming a description, moving it on a board or retiring it must not pretend
that anyone's relationship actually changed.

**Exact amended D10 — ratified 2026-10-10:**

> Organizations may adapt the names, guidance and stage lists of their applicable
> organization-approved cultivation presets, including adding, retiring and
> reordering stages, through the appropriately authorized configuration action.
> Supplied lists are useful starting points; tenants are not restricted to their
> original number or sequence of stages.
>
> Each stage has a stable identity independent of wording and display order.
> Wording corrections may preserve that identity when the meaning stays the
> same. A materially different meaning uses a new identity; earlier recorded
> understanding remains explainable. Reordering changes presentation only.
>
> Retiring a stage removes it from new selection while preserving existing
> recorded stages and lawful, authorized history. It does not move, close or
> hide existing work, require immediate reassessment, or prevent otherwise valid
> work or D9 reopening. Same-meaning restoration is an explicit, authorized new
> configuration change, never an automatic rollback of history. A usable preset
> must retain an available choice; a configured initial/default choice, if any,
> cannot silently become invalid or be replaced by the first item.
>
> Configuration applies atomically against the current preset revision, with
> truthful history and safe retries. It cannot silently overwrite another
> person's changes. Supplied-template updates do not overwrite an organization's
> choices or reinterpret existing records; adoption is deliberate.
>
> These settings describe development progress. They do not configure permissions,
> consent, financial facts, participation, closure, required steps or automation.
> Those retain their existing source owners. They do not create personal pipelines
> or a second stage authority for missionary and staff views. Configuration rights
> do not grant access to private journeys or permission to change their stages.

This retains B. The substantive clarifications are retirement/restoration,
same-meaning versus changed-meaning identity, safe last/default-stage treatment,
presentation-only order and deliberate template adoption. They are brought back
explicitly rather than hidden as minor implementation work.

## Evidence, alternatives and what is actually known

**Repository facts.** The [roadmap](../../../prds/sitestacker-parity/roadmap.md:4087)
requires one shared enrollment model, organization-approved presets and history;
its customization depth was open at line 4133. [P11's option-lifecycle precedent](../../../prds/sitestacker-parity/phase-11-custom-fields-custom-collections.md:189)
already separates identity, same-meaning wording changes, retirement and display
order. That supports coherence, not implementing cultivation as a custom field.
[ADR-0001](../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md:62)
keeps CRM truth in Asym Postgres. [P12](../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1542)
governs exact current scope/capabilities; a role label does not authorize this
feature. D1–D9 retain their existing meanings.

**Observed current code.** The [implementation appendix](d10-evidence/implementation.md)
identifies a demo sales-stage enum and a CRM board that alphabetizes statuses
from loaded donor rows. Neither is a governed P27 catalog. Current preference
RPCs offer useful atomic configuration/audit patterns, but do not establish P27
permissions, stale-editor rejection or durable command receipts. Bounded source
searches found no target implementation. That is not a census of hosted systems.

**Fresh external evidence.** All external pages were retrieved on 2026-10-10;
editions, publisher dates and limitations are recorded in the appendices.
[Virtuous CRM+](https://support.virtuous.org/hc/en-us/articles/360051735651-How-Do-I-Customize-Gift-Ask-Statuses)
documents configurable ask statuses and enabled selection;
[HubSpot](https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines)
documents stage editing with identifiers and dependencies; Salesforce's
[generic picklist deactivation](https://trailhead.salesforce.com/content/learn/modules/picklist_admin/picklist_admin_manage)
preserves existing values. These demonstrate bounded configuration patterns,
not the right missions relationship model. Opportunity probability, Won/Lost,
automatic outreach and vendor Admin privileges are not imported.

The strongest simpler alternative is A: fixed supplied structure with editable
wording and guidance, plus asks/tasks for specific work. It reduces configuration
and reporting variation. It cannot express a genuinely different set of progress
distinctions. The founder has now explicitly chosen that flexibility. **B is the
better product choice under that requirement**, provided it remains ordinary
configuration. Requiring every custom stage to map to a fixed five-stage funnel
would largely reverse the choice without evidence. No-build/fixed lists remain
usable defaults, not the only allowed tenant behavior.

**Verified ministry evidence versus judgment.** [OMF's public partnership description](https://omf.org/get-involved/support-a-worker/)
includes prayer, practical help, friendship and financial support. MPDX/TntConnect
show established support-raising vocabulary but combine several concepts that
Core deliberately separates. They do not prove a particular tenant's desired
stage list. The [missions appendix](d10-evidence/ministry.md) distinguishes dated
practice from inference. Flexibility is the user's product requirement; exact
agency stage sets and measured UX benefits have not been empirically established.

**Primary technical evidence.** PostgreSQL documents
[constraints](https://www.postgresql.org/docs/17/ddl-constraints.html),
[locking](https://www.postgresql.org/docs/17/explicit-locking.html) and
[policy semantics](https://www.postgresql.org/docs/17/sql-createpolicy.html).
Supabase documents [RLS, roles and API access](https://supabase.com/docs/guides/database/postgres/row-level-security).
Foreign keys protect reference integrity, not current selection eligibility.
Policy qualification must examine effective `USING` and `WITH CHECK`: an omitted
check can inherit `USING`, so absence alone is not proof of a bypass. Definer/view
behavior depends on actual owners, roles, grants and settings. The current
[Supabase minor-release notice](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes)
was read; its extension/operator upgrade issues do not require those features
for D10. No live project version or upgrade safety is inferred.

| Evidence appendix                                              | What it establishes                                                                                                         |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [Ownership](d10-evidence/ownership.md)                         | ADR/OpenSpec/P9/P11/P12/P27/P28/Studio boundaries, exact anchors, inherited versus proposed rules.                          |
| [Authorization](d10-evidence/authorization.md)                 | Configuration versus record/aggregate/history access; current source limits, effective RLS and privileged-path obligations. |
| [Implementation](d10-evidence/implementation.md)               | Actual prototype behavior, reusable patterns, missing qualification and concrete race hazards.                              |
| [UX/comparables](d10-evidence/ux.md)                           | Current official nonprofit CRM, general CRM, CMS and accessibility evidence; evidence limits and practical interactions.    |
| [Missions practice](d10-evidence/ministry.md)                  | Christian missions fit, nonfinancial partnership, shared views and limits of existing support-raising tools.                |
| [Mechanical proof](d10-evidence/stage-catalog-probe/README.md) | Isolated PostgreSQL experiments and counterexample; not application or live Supabase certification.                         |

## Exact requirements for the developing specification

The following ratified D10 obligations carry into `/to-prd`, design and proof.
They do not create a formal specification or establish implementation now.

**R01 — Bounded tenant flexibility.** P27 SHALL support authorized changes to
names, explanatory guidance and membership/order of applicable organization-approved
stage presets on one shared enrollment model. Starter lists SHALL remain usable
without customization. D10 SHALL NOT introduce personal pipelines, per-tenant
schemas, arbitrary scripts/predicates, mandatory progression, new financial
probabilities or a general workflow/configuration platform.

**R02 — Immutable identity and truthful meaning.** Stage references SHALL use
stable tenant/preset-qualified identities, never labels, array positions or
translated text. Same-meaning wording changes MAY retain identity. Materially
different meaning SHALL use a new identity. Accepted configuration history SHALL
allow authorized interpretation of prior recorded stages; it SHALL NOT fabricate
an assessment or date. Operational views MAY use current same-meaning wording;
history SHALL distinguish the applicable earlier definition when relevant.
Ordinary commands SHALL not edit or delete accepted configuration/stage history;
corrections SHALL add attributable evidence. Separately governed redaction/erasure
SHALL preserve required non-sensitive structural integrity without promising
indefinite retention of personal content.

**R03 — Retirement and repair.** Retired definitions SHALL remain resolvable for
existing current references, permitted history, filters and exports; new selections
SHALL reject them. Retaining an unchanged stage on an otherwise permitted edit
or reopening SHALL NOT be treated as new selection. Retirement SHALL NOT clear,
move, close, hide or require reassessment of existing work. Persisted definitions
SHALL be retired through normal configuration rather than destructively deleted.
Explicit same-meaning restoration SHALL retain identity and add configuration
history; changed meaning SHALL instead follow R02. Privacy erasure/retention
remains a separately governed source operation, not an ordinary Delete control.
A separately qualified historical import/correction MAY preserve a retired
identity with its original provenance; it SHALL NOT fabricate new admission,
current assessment or stage effects. This is not an ordinary selection bypass.

**R04 — Usable lists and defaults.** Applying configuration SHALL NOT leave a
preset available for new work with zero selectable stages. If a separately
qualified initial/default-stage rule exists, retiring its target SHALL require an
explicit valid treatment in that same accepted configuration change; never infer
the next/default stage from order. D10 does not require a default, publish-state
machine, preset-disable feature or a new preset-creation facility. Unsaved empty
form state is allowed; invalid configuration is not applied.

**R05 — Source boundaries and ordering.** Configuration changes SHALL NOT emit
enrollment-stage transitions, reset assessment/stage-entry/contact times, create
work/reminders, alter participation, ask outcomes, money, consent, lifecycle or
access. Position SHALL mean display order only. Stage selection itself SHALL NOT
be evidence of another owner's fact. Optional later transition rules remain a
separate decision and source contract. Prayer partnership SHALL NOT require a
financial ask/gift/commitment to count as meaningful partnership.

**R06 — Exact scope and authority.** Server commands SHALL derive the principal,
active context, tenant and audit attribution from trusted context and resolve
current P12 capability, preset applicability and policy epoch. Any caller-supplied
target/reference SHALL be resolved and authorized, not trusted as scope or owner.
Configuration authority SHALL be distinct from enrollment mutation and protected
read/aggregate/history authority. Tenant-wide configuration SHALL require authority
over that actual catalog scope; it SHALL NOT grant cross-entity journey visibility.
A partnership lead is not automatically a preset administrator. No extra permission
hierarchy or per-stage ACL system follows from this requirement. Applicable
human Active Assignment and Service/Operator contexts SHALL remain distinct;
system execution SHALL not borrow a human assignment. Preview, commit, deferred
execution, read/export/replay and repair SHALL re-prove the door-declared processing
purpose, exact source, field/history floors, residency and current epoch as required
by P12; an earlier UI check does not authorize later execution.

**R07 — Relational and API invariants.** The design SHALL enforce same-tenant,
same-preset stage relationships with appropriate keys/foreign keys, required
identity nullability and immutable scope binding. Referenced definitions SHALL
not cascade-delete enrollments/history. Current selectability SHALL be checked
at the authoritative mutation boundary, not encoded as a requirement that every
existing reference always point to an active stage. Browser/API/RPC, imports,
jobs, repair, views, exports and privileged service paths SHALL preserve the same
authority. Effective old-row/new-row RLS checks, table/column/function grants,
owner roles, exposed schemas and security-definer search paths SHALL be qualified
against the actual deployed catalog. RLS alone SHALL NOT substitute for business
transition/column invariants. D10 adds no money fields or precision changes.

**R08 — One accepted configuration change.** An Apply SHALL validate a finite
change against the expected current preset revision and commit the accepted
configuration, durable actor/change evidence, business-effect receipt and required
projection intent atomically. Reordering SHALL validate the complete intended
membership of its declared ordering scope: no duplicates, missing members,
unknown or foreign IDs. A partial visible client list SHALL NOT replace the
authoritative catalog. Simultaneous add/retire/rename/reorder SHALL participate in
the same conflict protocol; stale intent SHALL fail visibly without partial writes.
Schema-format versions SHALL NOT masquerade as concurrency revisions.

**R09 — Races, retries and cancellation.** Retirement/restoration and fresh
selection SHALL share an acceptance protocol that establishes a definite order.
If selection commits first, its retained reference survives retirement; if
retirement commits first, fresh selection fails. Duplicate delivery of one
accepted business effect SHALL recover its original authorized outcome and
provenance without repeating it; reuse with different content SHALL conflict.
Replayed result disclosure SHALL obey current authority. Unapplied edits may be
discarded; cancellation/response loss SHALL NOT pretend a committed change was
undone. A subsequent repair is a new authorized change. Use consistent lock ordering
where applicable and bounded recovery from deadlock/serialization aborts; no abort
may lose or duplicate an accepted effect.

**R10 — No implicit record migration.** Adding, retiring, restoring or changing
wording SHALL NOT mass-reassign journeys. Any later approved replacement or preset
switch SHALL be a separately explicit source operation with current record-level
authority, preserved history, bounded intent and concurrency/replay proof. D10
does not authorize building a bulk migration engine or performing that migration.

**R11 — Shared consumers and reports.** Boards, pickers, filters, reports, imports
and any qualified workflow bindings SHALL use source identities and the appropriate
configuration revision. Include permitted existing retired-stage records; do not
derive the catalog or total counts from loaded cards. Unknown/stale fresh targets
SHALL produce an actionable error, not nearest-name matching or auto-creation.
Equal names/ranks across presets/tenants SHALL NOT imply semantic equivalence,
progress percentages or financial forecasts. Historical stage events SHALL not
be reclassified as advancement merely because a later order differs. Configuration
events SHALL be distinct from actual source-accepted enrollment transitions. The
ordinary fresh-selection rule does not prohibit R03 historical preservation.
Identity/reuse/conflict results SHALL respect independently authorized observation
scope: hidden-present and absent targets must be indistinguishable where required,
and raw unique/FK errors SHALL disclose no protected detail. Detailed remediation
requires current source rights.

**R12 — Templates and upgrades.** If an updated supplied template is made available
to existing tenants, adoption SHALL be deliberate through the same qualified path;
D10 does not require an update catalog or automatic merge service. Updates SHALL NOT
overwrite tenant choices or alter historical meanings. Shared template identity
SHALL NOT allow one tenant's edit to mutate another's catalog. Required platform
security/authorization changes remain mandatory; template choice is not an opt-out.

**R13 — Simple accessible interaction.** Use one settings editor with Add,
same-meaning wording/guidance edits, Retire/restore, reorder, Apply and Cancel;
show a concise change summary and unapplied/saving/applied/conflict/failure states.
Routine edits SHALL NOT require a workflow canvas, justification essay, separate
approval queue or developer assistance. Provide keyboard and tap/click reorder
alternatives to drag, meaningful focus/announcements, narrow-layout support and
Core touch-target guidance. Use Unicode/localized presentation, contextual labels
for distinguishability, bounded nonempty inputs and field-linked errors; never
use English labels as keys. Lost connectivity SHALL preserve safe unapplied input
where feasible and allow authoritative refresh; no offline-activation promise.

**R14 — Privacy and disclosure.** Shared labels/guidance SHALL be treated as
catalog content, not a place for private missionary locations, care notes or
supporter facts. Enforce existing content/output safety and sensitivity floors
across settings, pickers, history, documents, exports, logs, cache and backups.
Configuration preview SHALL expose only authorized details/aggregates; hidden
usage is not zero usage. Retirement SHALL not depend on revealing private records.
Retain necessary structural provenance under the governing retention/erasure
policy without immutable copies of unnecessary personal content. Configuration
does not affect donor checkout, receipts or contact permission.

**R15 — Delivery and recovery.** Source configuration SHALL remain authoritative
when cache, projection or optional Studio is unavailable. Required secondary
effects SHALL be recoverable from accepted durable intent with stable effect
identity; obsolete results SHALL not overwrite newer revisions. Cache keys SHALL
include source tenant/preset and applicable disclosure context/version; refresh
must not reuse another principal's protected usage results. Stage validation on
write SHALL use current source truth even if the picker is stale. One preset's
configuration problem SHALL not pause unrelated cultivation, giving or tenants.

**R16 — Operability and audit.** Authorized staff SHALL be able to explain who
accepted each effective change, when, what changed, its scope and whether secondary
views caught up. Business history, security audit and technical logs SHALL remain
distinct. Exact replays SHALL not change the original actor/time. Support SHALL
have a scoped diagnosis/retry/restore path without direct database surgery or
unrestricted constituent disclosure. Internal IDs/revisions/correlation belong
in diagnostic views, not routine product language.

**R17 — Bounded performance.** Before activation, design SHALL declare and test
finite input/catalog/label/reorder/history-page limits, the largest supported
tenant/preset shapes, latency targets and contention budgets. Limits SHALL have
units, enforcement points and truthful failure UX, based on representative use
and measurement rather than an invented small stage cap. Use scoped indexes and
bounded pagination; current catalog reads SHALL not require scanning all journeys
or replaying all history. Required visibility/usage checks SHALL not become
unbounded synchronous exports. No numeric scalability promise is made by D10.

**R18 — Rollout and qualification.** Before exposure, inventory actual retained
data and consumers, register exact P12 capabilities/applicability, reconcile preset
meanings and qualify real roles/API paths. Use additive schema/reader compatibility
before writers; reject ambiguous legacy label mappings and test idempotent backfill.
Old clients must not erase unknown configured stages. Gate activation by qualified
tenant/slice, with a kill switch for new configuration writes that preserves reads
and existing work. After new references exist, rollback SHALL not drop definitions
or revert to code that cannot represent them; prefer compatible roll-forward repair.
Before backup-restored readers/writers/workers activate, the existing recovery
process SHALL reconcile current retirement/revisions, authorization and applicable
redaction, expiry and consumed-effect fences. If these cannot be recovered, hold
affected presentation/writes. Backup restore is not R03 deliberate stage restoration.

## Ownership, lifecycle and realistic edge cases

P27 owns preset/stage definitions, accepted configuration revisions, enrollment
stage facts and their history. P9 owns Party, Ministry Assignment and responsibility
facts. P12 owns authorization. Financial domains own asks' downstream financial
facts, commitments and money; communication domains own consent/delivery. Shared
Tasks Hub and notification projections do not become stage/configuration owners.
Optional Studio consumes qualified source commands/events; it never owns their
acceptance. A browser draft, cache, export, report or template is not a write
authority. No new bidirectional provider synchronization is needed.

| Scenario or transition                                     | Required outcome; controlling clauses                                                                                                                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Add a stage to an existing preset                          | New stable identity and choice; no existing journey enters it. R01/R02/R05.                                                                                                                      |
| Correct spelling, translate or clarify wording             | Same meaning may retain identity; prior understanding remains explainable. R02/R13.                                                                                                              |
| Reuse a familiar name for a different meaning              | Distinct identity; no historical reinterpretation or implicit record migration. R02/R10.                                                                                                         |
| Retire a stage used by active, paused or closed work       | Existing values remain visible to authorized users and usable; new selection stops. R03/R11.                                                                                                     |
| Reopen a journey whose stage retired                       | Retain its stage as last recorded, marked retired; no compelled move, fresh assessment or revived reminder. D8/D9, R03/R05.                                                                      |
| Unrelated task/owner edit with an unchanged retired stage  | Apply normal authority and work rules; retirement alone is not a blocker. R03/R06.                                                                                                               |
| Last available stage or configured default retired         | Reject Apply with an actionable fix unless the same configuration provides a valid choice/default treatment. R04.                                                                                |
| Accidentally retire; subsequently restore                  | Explicit same-meaning restoration, same ID, new history; no automatic movement or resurrection of ended work. R03/R09.                                                                           |
| Reorder while another person adds/retires/renames          | Accept one current revision; reject stale competing intent while preserving safe edits for reconciliation. R08.                                                                                  |
| New stage selection races retirement                       | Both commit orders have defined outcomes; ordinary reference FK is insufficient. R07/R09.                                                                                                        |
| Reorder empty columns or a filtered/partial view           | Configure the declared complete list, not just visible cards; no dropped stages. R08/R11.                                                                                                        |
| Different entities in one tenant share a preset            | Catalog authority covers its actual scope; enrollment/history/count access remains independently filtered. R06/R14.                                                                              |
| Missionary and staff view the same journey                 | Same authoritative stage meaning under each permitted projection; no extra journey or writable mirror. R01/R06/R11.                                                                              |
| Stale API/import/recipe targets a retired stage            | Reject the fresh selection with a useful result; do not fuzzy-match, unretire or create automatically. R03/R11.                                                                                  |
| Repeat Apply after response lost; permission later revoked | Original effect occurs once; current disclosure governs readback; no fresh authority inferred from old receipt. R09/R16.                                                                         |
| Historical imported date is unknown or backdated           | Preserve provenance/unknownness and qualified historical retired-stage identity; no fabricated assessment/admission. Catalog edits use real acceptance time, not backdated history. R02/R03/R16. |
| Tenant template update, export/import or restore           | Preserve scope/identities/provenance and current grants; explicit mappings, no name-based coalescing. R07/R12/R18.                                                                               |
| Stage called “Never Ask,” “Financial Partner” or “Closed”  | Name/selection cannot create consent, money or closure facts; no brittle forbidden-word engine. R05.                                                                                             |
| Time zone, DST or locale changes                           | Stage identities/order do not depend on calendar arithmetic; history instants display in the appropriate locale. D6 review-date meaning remains unchanged. R02/R05/R13.                          |

The minimum configuration lifecycle is available → retired → explicitly restored
with preserved identity/meaning. A changed meaning is another identity. Unapplied
form edits are not durable source facts. Accepted changes cannot be erased by
canceling the browser request. This does not add journey lifecycle states or
decide the separate stage-transition rules, preset switching or initial-stage policy.

**P28 conflict explicitly resolved at the ownership level:** its retained legacy
MPD vocabulary combines progress, participation, consent and terminal concepts.
The [retained constraints](../../../prds/program-roadmap/owner-constraints.md:55)
remain a requirement inventory, not a final mutually exclusive enum. Financial,
special and prayer participation need not exclude one another; lack of response
does not itself close all work; Never Ask remains consent-owned. Before final
preset labels are specified, reconcile each legacy concept to its actual owner
and authorized display. Do not silently delete those requirements or adopt them
as custom stage-powered business rules. No new participation table is selected.

## Category-by-category adversarial review

Severity grades concern the consequence **if the described design is adopted**:
Critical = boundary breach; High = materially false/lost state or serious friction;
Medium = meaningful usability/maintenance/operational harm. Likelihood is qualitative
engineering judgment, not observed production frequency. “Likely” describes an
identified tempting implementation; “plausible” a realistic failure without the
required protection. Findings are not claims of shipped D10 vulnerabilities.
Each entry includes the answer effect and exact permanent correction/proof.

| # / category                                                     | Material concern, consequence, severity and likelihood                                                                                                                                                                                     | Evidence; effect on answer; exact fix and proof                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Problem validity, necessity and alternatives                  | **Yes.** Fixed wording may not express a tenant's real process; unbounded flexibility could instead duplicate tasks/asks and burden everyone. Medium; plausible. No empirical need for particular extra stages is established.             | User explicitly selects flexibility; P27 customization open; ministry/comparable evidence above. **Retain B, narrow its meaning** to bounded configuration, useful defaults and source-owned stages. R01/R05; AC01/AC12. A is simpler but fails the selected degree of flexibility; no mandatory universal mapping.                                    |
| 2. Brittleness                                                   | **Yes.** Labels, positions, active-only joins or current enum assumptions can break references, hide work or misread old facts after ordinary edits. High; likely if prototypes are reused.                                                | Current board/demo findings, P11 precedent, D9. **Amend identity/retirement semantics.** R02/R03/R11; AC02–AC05/AC11. Stable scoped identity plus separately enforced fresh eligibility is the permanent correction.                                                                                                                                   |
| 3. Technical debt                                                | **Yes.** Per-tenant enums, duplicated status arrays, custom-field or CRM-provider detours and a second workflow engine create expensive migration/maintenance. High; plausible.                                                            | ADR-0001, current hardcodes, P27/Studio ownership. **Narrow implementation, preserve B.** R01/R07/R11/R15; AC10/AC11. One source catalog and shared consumers, ordinary relational constraints/transactions.                                                                                                                                           |
| 4. Edge cases                                                    | **Yes.** Retired last/default stages, reopened work, stale imports, duplicate-looking labels, meaning changes and mixed preset/entity use can strand staff or corrupt history. High; likely without explicit rules.                        | Edge-case table; D8/D9; UX and authorization appendices. **Amend retirement/default/restore behavior.** R02–R04/R06/R11; AC02–AC07/AC13. No silent replacement; same-meaning restore repairs mistakes without rewriting past facts.                                                                                                                    |
| 5. Footguns                                                      | **Yes.** Delete/cascade, drag-to-reorder mistaken for moving a relationship, global Apply or template reseed can cause unintended broad changes. High; plausible.                                                                          | Destructive comparator documented in UX appendix, current prototype board, RLS reuse limits. **Constrain B's operations.** R03/R08/R12/R13; AC03/AC05/AC08/AC12. Retire, reviewable atomic Apply and visibly distinct settings versus relationship actions.                                                                                            |
| 6. Tenant safety                                                 | **Yes.** Shared mutable seeds, unqualified IDs, cached catalogs/counts or preset edits based on a filtered view can cross tenant or entity boundaries. Critical; plausible.                                                                | P12, ADR-0044, authorization appendix. **Qualify scope, not a new role.** R06–R08/R12/R14/R15; AC06/AC07/AC14. Tenant-aware references, full permitted configuration scope, independent record disclosure and scoped caches.                                                                                                                           |
| 7. Database, RLS and authorization safety                        | **Yes.** A permitted row could be rebound to another tenant/preset; broad RPC/service roles or direct column edits could bypass source checks. An active-valued FK would also wrongly reject retained retired stages. Critical; plausible. | PG/Supabase primary docs; source grants are only declarations; no target P27 schema qualified. **Require database/API proof.** R06–R09/R18; AC06–AC09/AC15. Inspect actual effective checks, grants, roles, keys, nullability, delete behavior and trusted attribution. No money precision change; no claim that omitted `WITH CHECK` alone is unsafe. |
| 8. Overengineering                                               | **Yes.** Generic branching/version publication, per-stage permissions, mandatory committees, CRDT ordering or automatic migrations would expand a small settings feature. Medium; plausible.                                               | P27 scope, P11 analogy limits, ordinary settings precedent. **Narrow B to R01/R08/R13.** AC01/AC12. Use stable IDs, current revision and accepted change history; no full event-sourcing or per-record preset fork is required.                                                                                                                        |
| 9. UX/UI and user friction                                       | **Yes.** Drag-only editing, hidden retired records, forced migration, repeated confirmations and ambiguous failed saves waste staff time, especially mobile/low-bandwidth use. Medium/High; likely exposure if untreated.                  | WCAG/current CRM/CMS sources in UX appendix; user previously found jargon confusing. **Amend interactions.** R03/R04/R13/R14; AC03/AC12/AC13. One settings form, accessible reorder, clear status, retained input and optional permitted impact detail. No donor checkout step, new contact fields or international-address dependency is added.       |
| 10. Source of truth, ownership and domain invariants             | **Yes.** “Financial Partner,” rank or lifecycle-looking labels can become shadow finance/consent/closure truth; staff and missionary views can diverge. High/Critical; plausible.                                                          | D1–D9, P9/P27/P28, ADR-0183; ownership appendix. **Narrow semantic authority explicitly.** R01/R02/R05/R10/R11; AC02/AC10/AC11. One recorded stage per applicable journey model; configuration does not reassess relationships or create another owner's fact. Exact preset switching is not silently decided.                                         |
| 11. Hidden coupling                                              | **Yes.** Tasks, workflows, reports or imports bound to label/rank break on rename/reorder; catalog availability could become a dependency of giving or unrelated work. High; plausible.                                                    | DON-14–16 source boundaries; current status consumers; prototype reuse hazards. **Keep separate source events and identity bindings.** R05/R11/R15; AC10/AC11/AC14. Configuration and journey transitions are different; native work does not depend on Studio.                                                                                        |
| 12. Failure modes                                                | **Yes.** Partial reorder, committed save with lost response, stale cache or failed projection can appear unsuccessful or apply twice. High; plausible.                                                                                     | Standard distributed failure reasoning; current settings lacks D10 receipt/CAS proof. **Require truthful atomic/replay behavior.** R08/R09/R15/R16; AC08/AC09/AC14. Recover original accepted effect and repair secondary views, never overwrite newer truth.                                                                                          |
| 13. Lifecycle, temporal correctness, concurrency and idempotency | **Yes.** Retire versus assign, concurrent add/reorder and restored definitions can admit stale choices or falsify history. Catalog changes could reset stage age. High; likely without shared acceptance.                                  | PG locking semantics; D9; isolated probe evidence below. **Amend acceptance protocol.** R02–R05/R08/R09; AC02–AC05/AC08/AC09. Test both race orders and semantic same-value no-op; accepted config time is not historical assessment time.                                                                                                             |
| 14. Data integrity risks                                         | **Yes.** Missing/duplicate/foreign reorder IDs, fuzzy imported label matches, reused identities or name-based backfill merge distinct meanings. High; plausible.                                                                           | Composite relationship and migration reasoning; P11 identity contract. **Require exact scoped membership and mapping.** R02/R07/R08/R10/R11/R18; AC02/AC05/AC07/AC15. No implicit auto-create, coalescing or reassignment.                                                                                                                             |
| 15. Security and privacy risks                                   | **Yes.** Sensitive ministry labels or hidden usage counts can leak through configuration, history, exports, logs and restored backups. History could retain unnecessary personal content indefinitely. Critical/High; plausible.           | P12 projection/field/retention boundaries; current generic log redaction is insufficient. **Constrain content/disclosure.** R06/R14/R16/R18; AC06/AC13–AC15. Minimal structural provenance, current authority on reads/replay/repair and governed erasure. No new blanket contact-consent prerequisite for internal configuration.                     |
| 16. Scalability and performance risks                            | **Yes.** Synchronous global usage scans, unbounded history, N-row UI writes or tenant-wide locks can degrade large/skewed tenants. Medium/High; plausible; no measured ceiling yet.                                                        | Current loaded-row board does not prove full totals; PostgreSQL transaction/index principles. **Require measured bounds before activation.** R08/R11/R17; AC16. Per-affected-preset coordination and bounded reads; no invented stage cap or throughput claim.                                                                                         |
| 17. Operational burden                                           | **Yes.** Every retirement requiring database repair, forced migration or disclosure of hidden records would make a routine feature expensive. Medium/High; plausible.                                                                      | D9, source gaps and comparator tradeoffs. **Add normal repair and independent work continuity.** R03/R10/R13/R16; AC03/AC09/AC12. Explicit restore and scoped retry; no mandatory migration or new approval queue.                                                                                                                                     |
| 18. Observability and auditability gaps                          | **Yes.** Generic logs cannot explain old meanings, effective actor, duplicate retries or which view lagged; configuration audit may be confused with relationship history. High; plausible.                                                | Current receipt/history limits and P12 audit requirements. **Require distinct evidence.** R02/R08/R09/R16; AC02/AC08/AC09/AC14. Stable accepted history plus technical correlation and scoped operational status; monitors below.                                                                                                                      |
| 19. Dependency and integration risks                             | **Yes, for existing/future consumers; no new provider dependency needed.** A delayed recipe/import or external name-based sync can resurrect retired choices, duplicate effects or override Core. High; plausible.                         | ADR-0001, Studio source contracts, consumer inventory. **Keep Core authority.** R07/R09/R11/R15; AC09–AC11/AC14. Reject obsolete fresh targets; reconcile durable source effect identities. No new webhook/payment integration or bidirectional stage master is selected.                                                                              |
| 20. Migration, rollout and upgrade risks                         | **Yes.** Old enum clients, reseeded templates or rollback after new IDs are referenced can lose data or silently reject valid work. High; plausible.                                                                                       | Actual hardcoded prototypes, no retained-data census, template independence. **Require expand/qualify/activate sequencing.** R12/R18; AC15. Inventory, explicit mapping, mixed-version tests and compatible roll-forward; no destructive rollback.                                                                                                     |
| 21. Testability, traceability and proof                          | **Yes.** “Flexible” and “preserve history” alone are unfalsifiable; mocked tests or docs could be mistaken for production qualification. High; likely without explicit criteria.                                                           | Source tests elsewhere mock DB; no P27 runtime qualification. **Replace vague claims with R01–R18 and AC01–AC16.** Carry IDs through subsequent formal artifacts/release evidence; executed mechanics remain explicitly bounded.                                                                                                                       |
| 22. Other development hazards                                    | **Yes.** Treating B as authorization for arbitrary transition rules, unresolved P28 meanings or automatic preset selection would pre-answer later founder decisions. Medium/High; plausible.                                               | Q10 scope and retained P28 conflict. **Separate selected degree from remaining domain choices.** R01/R04/R05/R18; AC01/AC10/AC15. Record B plus exact amendments, then resume one plain-language question at a time; do not claim whole-phase readiness.                                                                                               |

## Falsifiable acceptance criteria

These are release obligations, not tests claimed to have passed in Core.

| ID   | Required observable proof                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC01 | An appropriately authorized tenant can add a genuinely additional stage, edit same-meaning wording, retire/restore and reorder without code/schema deployment; an untouched tenant can use its starter preset. No mandatory universal fixed-stage mapping, personal pipeline or workflow builder is needed.                                                                                                                                                                                                                                                                                                                                                                              |
| AC02 | Repeat rename/reorder/restore and a separate changed-meaning addition. Existing journey IDs, accepted stage identity, assessment/entry/contact timestamps and effects remain unchanged. Authorized history reconstructs the relevant earlier meaning; unknown imported dates remain unknown.                                                                                                                                                                                                                                                                                                                                                                                             |
| AC03 | Retire an in-use stage across active/paused/closed journeys. New selections fail; existing authorized detail, board, filters and counts retain the records. Task/owner edits and D9 reopening still work without stage reassessment. Explicit restore preserves identity/history and revives no ended work.                                                                                                                                                                                                                                                                                                                                                                              |
| AC04 | Retiring the last selectable stage fails atomically with an actionable message. Retiring a separately configured default cannot silently change it; a valid explicitly supplied same-change treatment succeeds. Reorder alone changes neither default nor eligibility.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| AC05 | Exhaustively test small bounded permutation fixtures and generate cases across declared supported sizes; test empty/partial/duplicate/unknown/foreign manifests, and simultaneous add/retire/rename/reorder. Stale expected revisions reject without partial configuration/history changes. A nonempty scope cannot be replaced by an empty filtered view.                                                                                                                                                                                                                                                                                                                               |
| AC06 | Real nonowner application roles and API/RPC entry points: two tenants, two entities, config-only actor, record-only actor, lead without config power, unauthorized aggregate/history reader, revoked principal and service job. Deny unauthorized old/new states, protected existence and disclosure, including after cached reads, replay and deferred service execution. Hidden-present/absent stage creation, reuse, fresh selection and unique/FK failures reveal no unauthorized detail; processing purpose and field/history/residency constraints still apply.                                                                                                                    |
| AC07 | Cross-tenant/preset references, nullable/mutable identity tricks, unauthorized direct inserts/updates/deletes, cascade attempts and privileged-path parameter spoofing fail. Actual grants, RLS policies, function owners/search paths and exposed views match the intended boundary.                                                                                                                                                                                                                                                                                                                                                                                                    |
| AC08 | Deterministically interleave selection and retirement in both commit orders, plus conflicting editor saves. A precheck-only counterexample must fail qualification. Approved protocol retains a pre-retirement accepted reference and rejects a post-retirement fresh selection; bounded deadlock/serialization-abort handling causes no lost or duplicate accepted effect.                                                                                                                                                                                                                                                                                                              |
| AC09 | Fail before commit, after commit before response, during projection and during replay. One intended configuration effect has one stable accepted outcome/actor/time; mismatched idempotency reuse conflicts, current authority controls readback, and cancel never undoes committed state.                                                                                                                                                                                                                                                                                                                                                                                               |
| AC10 | Add/select/retire/reorder stages with lifecycle-, finance-, consent- and task-like names. No money, pledge, participation, consent, closure, task or donor-message effect occurs merely from those labels/configuration. Existing D6 follow-up and D7/D8 lifecycle remain independently correct; Studio may be off.                                                                                                                                                                                                                                                                                                                                                                      |
| AC11 | For the same applicable preset/revision, staff/missionary consumers resolve consistent source meaning under permitted projections. Stage-ordered views follow that order, boards include empty columns, and existing retired-stage records remain accessible as permitted; ordinary list/report sorts remain valid. Different presets need not have equivalent lists. Saved historical filters and separately qualified retired-stage history imports/corrections work. A stale fresh-selection import/API/qualified workflow target gets an appropriately disclosed failure, not remap/auto-creation. Reports never infer cross-preset equivalence or progress from current rank alone. |
| AC12 | A representative missions staff member can customize a preset, cancel edits and understand retirement without developer help. Keyboard, screen reader and tap/click users can reorder, apply and recover errors; focus/status announcements, 320 CSS px layout, zoom, Core touch targets and slow network are exercised. No additional donor-facing step appears.                                                                                                                                                                                                                                                                                                                        |
| AC13 | Unicode, RTL, long translated labels, confusing duplicate labels and empty/oversized inputs have usable safe rendering/validation without identity changes. Private content/usage cannot leak through labels, HTML, CSV/formula rendering, logs, generated documents or browser drafts; existing retention/erasure remains effective.                                                                                                                                                                                                                                                                                                                                                    |
| AC14 | Drop/duplicate/delay cache invalidation and qualified projection events; newer accepted revisions cannot be overwritten by older delivery. Current writes reject stale choices despite old UI. Scoped reconciliation restores views without exposing hidden records or interrupting unrelated tenants/work.                                                                                                                                                                                                                                                                                                                                                                              |
| AC15 | Rehearse actual retained-data mapping/backfill, ambiguous names, interrupted retries, unchanged/customized template adoption, old/new reader-writer combinations, tenant gating, config-write kill switch, backup restore from before retirement/revocation/redaction/accepted effects, and compatible roll-forward after new IDs are referenced. Preserve tenant choices/history/current authority.                                                                                                                                                                                                                                                                                     |
| AC16 | Publish and exercise numeric catalog/input/history/tenant/concurrency profiles, relevant query plans, p95 latency and lock-wait budgets. Largest supported shapes pass without unbounded journey scans; over-limit operations fail safely with understandable remediation. Measured results, not prototype tests, qualify performance.                                                                                                                                                                                                                                                                                                                                                   |

## Proof completed and its limits

Five independent evidence appendices were completed and reconciled. Three
independent reviewers then checked the consolidated decision; corrections covering
historical imports, backup restore versus stage restoration, protected error
disclosure, current P12 context, bounded permutation tests and conditional template
updates were incorporated. Repository source, governing documents and fresh primary
sources were reviewed. The isolated
PostgreSQL 17.11 probe linked above passed **15 checks** and records its exact
image/version, synthetic schema, commands, outputs and verified container cleanup.
It demonstrates a real counterexample: an ordinary foreign key permits a newly
inserted reference after an earlier unlocked selectability check becomes stale.
The guarded experiments establish both retirement/selection orders using observed
database blocking relationships; reorder tests cover full membership, stale intent,
rollback and concurrent saves. Three checks use a real nonowner, non-superuser,
non-RLS-bypass role for old-row filtering and new-row scope rejection.

The initial isolated startup attempt ran zero checks because readiness detected
the image's temporary bootstrap server. Its failure/cleanup metadata is preserved;
the corrected readiness condition produced the successful 15-check run. This was
a fixture startup issue, not a product defect or hidden failed assertion. The
probe tests relational/concurrency mechanisms, not Core's unimplemented P27 feature.

No live Supabase catalog was queried; no real tenant, supporter, missionary or
provider was exercised. No actual ministry usability pilot, full application
RLS/accessibility/performance test, migration rehearsal or production release was
completed. Earlier D3/D4/D6/D7 tests are prior evidence and are not counted as fresh
D10 qualification. These limits do not block deciding B; they block claiming
implementation/activation readiness.

## Synthesis and required order

1. **Ratification completed 2026-10-10:** the founder explicitly accepted the
   amended retirement, restoration, identity, last/default-stage, presentation-order
   and template policies above. Q10, the decision log and glossary record that
   acceptance while preserving D1–D9. The next interview question concerns the
   separately open degree of organization-configured stage-entry requirements.
2. **Capture in the specification/design after `/to-prd`:** carry R01–R18 and
   AC01–AC16; settle final preset meanings against P28, exact applicability and
   initial/transition rules through subsequent interview decisions. Register the
   exact P12 configuration/read/mutation contracts, actual retained-data census,
   historical-display/retention policy and measured limits. Do not replace these
   with guessed roles, provider defaults or undefined “flexible” fields.
3. **Require in implementation:** one native P27 source catalog, scoped relational
   identities, authoritative current commands, complete membership/revision checks,
   selection-retirement coordination, atomic durable outcomes/history and qualified
   projection recovery. Reuse shared settings/UI/auth/task infrastructure only
   after verifying the exact needed behavior. No new workflow engine, custom
   Postgres extension, external stage master or per-record preset clone is needed.
4. **Prove before enabling:** run AC01–AC16 on the actual application/database/API
   paths, current roles and representative data; rehearse additive rollout and
   recovery. Trace decision → glossary → appropriate ADR only if a new durable
   architecture decision is needed → OpenSpec requirements/design/tasks → tickets
   after `/to-issues` → tests → release evidence. None of those future artifacts is
   falsely marked created, implemented or passing by this review.
5. **Monitor only after qualification:** use the exact signals below. Monitoring
   does not replace missing tenant isolation, current authorization, history or
   race proof. Owners are accountable product/engineering functions, not invented
   named staff members; assign real on-call ownership before activation.

| Signal                                                                                                                                     | Threshold                                                                                                          | Accountable owner               | Required response                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accepted fresh selection references a stage already retired at acceptance, or scoped relationship/history invariant fails                  | Any confirmed occurrence                                                                                           | P27 source engineering owner    | Stop affected new writes, preserve evidence, investigate all writers and repair via source; activate wider incident handling if scope unknown.                                                                             |
| Unauthorized tenant/entity/catalog/history/usage disclosure                                                                                | Any confirmed occurrence                                                                                           | Security/P12 owner              | Contain the affected route/cache/export, revoke unsafe access, assess exposure and follow security incident procedure. Never merely monitor continued leakage.                                                             |
| Configuration projection still behind source after a completed reconciliation attempt                                                      | Any such result                                                                                                    | P27 operations owner            | Mark affected view stale, inspect scoped outbox/projection status, retry/repair without reapplying source change.                                                                                                          |
| One business-effect key produces multiple accepted configuration outcomes                                                                  | Any confirmed occurrence                                                                                           | P27 source engineering owner    | Disable affected replay/write path, reconcile provenance and fix effect deduplication before re-enable.                                                                                                                    |
| Configuration transaction timeout or deadlock failure                                                                                      | Three such failures within 15 minutes for the same tenant/preset; proposed operational trigger, not a measured SLO | Platform performance owner      | Inspect scoped plans/contention; bound or pause the offending optional operation and correct index/query/batch behavior. Numeric request budgets and database timeouts must be qualified before activation under R17/AC16. |
| A usability pilot user cannot locate retained retired-stage work, confuses configuration with a journey change, or must use a pointer drag | Any reproducible failed task                                                                                       | P27 product/accessibility owner | Correct interaction/wording and rerun the affected acceptance task before broader rollout. No unsupported percentage target.                                                                                               |

## Adversarial check

### What could go wrong with this answer?

The organization could gain editable labels while history, references and consumers
still rely on fixed enums or positions. Retirement could become deletion or forced
reassessment. R02–R11 make those invalid outcomes explicit and testable.

### What hidden assumptions are we making?

That missions organizations benefit from configurable distinctions is the founder's
product judgment, not a completed customer study. Exact stage lists, preset
applicability, transition requirements, measured limits and real deployment state
remain unverified. None is disguised as an observed workflow or settled permission.

### How does this affect the whole product?

All stage consumers need the same source identities and historical semantics.
P9 identity, P12 authority, finance, consent, shared work and optional Studio keep
their owners. Stage settings cannot become an indirect way to change their facts.

### How does this affect the end-user experience?

Organizations can use familiar, appropriate steps in a normal settings form.
Staff keep working when an old stage retires; reopened work retains recorded
understanding. Configuration changes require one deliberate Apply, accessible
controls and understandable conflict/recovery, without new donor-facing friction.

### Does this follow modern best practices?

Primary CRM evidence supports configurable lists with separate identity, enabled
selection and dependency/history care. It does not establish one universal vendor
policy; destructive stage deletion and sales-specific money/closure rules are
expressly rejected. PostgreSQL supports the required relational/transactional
mechanics without a special workflow system; actual production proof is still required.

### Does this fit Asym’s existing repo and product direction?

Yes, as bounded P27-owned configuration on shared enrollments, consistent with
P11's useful identity/retirement precedent, P12 and ADR-0001. Current demos are
not the governing design. The retained P28 vocabulary conflict is surfaced and
resolved by fact ownership, with final preset labels still subject to the interview.

### Should we adjust the recommendation?

Yes. **Accept B with the required amendments above.** The previous A recommendation
is superseded by the founder's explicit flexibility requirement and this review.
Do not add a workflow builder or force every custom stage into an immutable
standard progression. The founder has now ratified these concrete lifecycle/history safeguards;
continue the Phase 27 interview without reopening them.
