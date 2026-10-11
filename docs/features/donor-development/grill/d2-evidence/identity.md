# Phase 27 D2 — ministry-scoped cultivation: identity and lifecycle pressure test

> Evidence appendix, researched 2026-10-09. Findings are inputs to the
> [consolidated D2 review](../phase27-d2-adversarial-review.md), which
> reconciles recommendations and controls their decision status. This is
> grooming research, not a ratified specification or runtime qualification.

Research/adversarial review only, 2026-10-09. The ministry anchor is the selected direction under review; the remedies below are recommendations, not ratified D2 clauses, a PRD, or an implementation specification. D1’s continuing, purpose-specific relationship remains accepted. No source owner was amended, ticket published, code implemented, production data changed, or automation activated. Severity and likelihood are qualitative judgments about an implementation that omitted the boundary, not incident statistics.

## Verdict

**Keep the ministry anchor for ordinary missionary support cultivation.** It uses a stable identity already accepted by Phase 9 and avoids making the relationship belong to a login, current worker, household, public page, or financial account. The strongest hazard is interpreting continuity as automatic inheritance: an unchanged Ministry Assignment does not transfer supporter access to a new participant, while a changed Ministry Assignment does not automatically inherit old journeys or obligations.

The permanent approach can remain small: P9 decides ministry identity/lifecycle; P27 references that identity and owns its own journey continuation/ending; P12 authorizes each exact use; shared tasks and other effect owners retain their obligations. An exceptional move to a different ministry receives an explicit P27 disposition and, where appropriate, a new linked journey. This does not require a general successor engine, graph-merging product, or all-domain transfer wizard.

## Evidence register: what is actually settled

| Ref | Exact source                                                                                                                                                                                                                | Existing decision and limit                                                                                                                                                                                                                                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| E1  | `/workspace/core/docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:1277`                                                                                                                           | Aug 6 P22 D19 amendment: P9 owns stable Ministry Assignment and lifecycle, exactly one Tenant/Legal Entity, zero-to-many separate Party participants; survives participant/spouse/household/team/leadership/login/employment/page changes. Not Party, household, relationship edge, Ministry Project, Support Assignment, Designation/Campaign/Page/account. |
| E2  | Same file `:1288` and `:1312`; `/workspace/core/docs/adr/0136-organization-owned-ministry-assignments-and-separated-support-access.md:28`                                                                                   | Ministry memberships are prospective, half-open, append-only-corrected association only. Spouse separation, death/incapacity, Party merge/split, departure, retirement and rebinding preserve history and need explicit owner dispositions. These cases are expressly anticipated, not hypothetical new product scope.                                       |
| E3  | ADR-0136 `:75`, `:126`; `/workspace/core/docs/prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md:3272`                                                                                                  | Accepted Aug 6. One optional prospective same-Tenant/same-LE, interval-exclusive one-to-one Support Binding; P21 finance-authorized writer. A person can serve several ministries; zero-participant ministries are valid; no automatic propagation of people, rights, history, giving destinations, public progress or balances.                             |
| E4  | `/workspace/core/docs/adr/0108-organization-controlled-support-assignments-and-separated-access.md:60`, `:150`; `/workspace/core/openspec/changes/add-field-account-operations/specs/field-account-operations/spec.md:1317` | Support Assignment is independently organization-owned and exact-scope; participant count never enters account identity/arithmetic. Membership, access, responsibility and notifications are distinct. Reactivation never revives revoked grants/preferences.                                                                                                |
| E5  | `/workspace/core/docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2804`                                                                                                                          | Ministry create/lifecycle/membership, finance binding, support visibility, responsibility and protected audit capabilities are independently grantable. One People & access experience may coordinate only explicitly selected and independently authorized consequences. Minimum support preset excludes supporter identity/contact details.                |
| E6  | Same P12 file `:2846`; ADR-0136 `:109`                                                                                                                                                                                      | Current exact principal/context, Tenant, LE, purpose, projection, target, field/history floor, epochs and source are checked before enumeration/consequential action. Membership, shared email, grant to another resource, service credentials and old cache confer no authority.                                                                            |
| E7  | `/workspace/core/docs/prds/program-roadmap/owner-constraints.md:132`; `/workspace/core/docs/prds/sitestacker-parity/roadmap.md:4157`, `:4181`, `:4199`                                                                      | P28 reuses P27 source and source-authorized supporter/referral slice. Retained wording is **relationship to that missionary**; ministry participation alone has not been ratified as supporter access. Staff/missionary interaction sharing remains open. P28 does not require P21, P22, P32, P34, P35 wholesale.                                            |
| E8  | `/workspace/core/docs/prds/sitestacker-parity/phase-04-identity-account-claiming-foundation.md:185`                                                                                                                         | Party merge is deliberate, within Tenant, replayable and non-destructive. Only owner-approved mutable canonical references move. Frozen financial/receipt/statement/accounting/original commitment-owner facts remain. Consent becomes most restrictive. Genuine ownership transfer is not duplicate identity repair.                                        |
| E9  | `/workspace/core/docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:1167`; `/workspace/core/docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1602`; current issue #675   | Merge cannot merge Support Assignments/Field Accounts or union permissions. Security tightens to strictest input before child repair. Shared scope/merge engine is retained, not forked.                                                                                                                                                                     |
| E10 | `/workspace/core/docs/adr/0094-organization-authorized-support-reallocation-and-exit-disposition.md:12` and `:37`                                                                                                           | P21 D5 internal financial reallocation is same Tenant/LE/currency. External charitable succession needs exact qualified handoff/result. Exit begins from Worker Lifecycle Authority evidence; owner domains disposition independently live obligations. It is not generic ministry/CRM transfer machinery.                                                   |
| E11 | `/workspace/core/docs/prds/sitestacker-parity/roadmap.md:5738`, `:5740`, `:5752`; `/workspace/core/docs/prds/program-roadmap/integration-guide.md:30`                                                                       | P44 identity transition/deactivation does not merge Parties, transfer supporter rosters, union grants or create operational succession. Reactivation is fresh. Tenant A deprovisioning cannot delete tenant B or independent donor authority. Studio NHI future actions stop when live human-owner capability ceiling fails.                                 |
| E12 | `/workspace/core/openspec/changes/add-public-ministry-pages/specs/public-ministry-pages/spec.md:989`; ADR-0136 `:83`                                                                                                        | P22 D19 OpenSpec explicitly separates association/edit/display/support access; future queued work cannot inherit removed authority. A different Ministry Assignment after first public release needs a new Page and D8 succession. This is P22 policy, not a mandate that every P27 journey change creates a public Page.                                    |

These are accepted planning contracts, not proof of qualified runtime. Prior research established #1891/#1897 adoption merged Sept 23 and those commits are ancestors of current checkout. Original P22 publication #1323 subsequently closed without merging; that does not undo adoption. Direct bounded symbol searches of `packages/api/src`, `packages/database`, `supabase/migrations`, `apps/missionary`, and unit-test directories found no `ministry_assignment` / `MinistryAssignment` / `Ministry Assignment` runtime match. This is absence of a direct implementation anchor in searched paths, not proof that no related behavior exists under another name.

## Fresh issue evidence

Read on Oct 9; complete bodies preserved in `/workspace/scratch/phase27-d2-identity-github-readback.json`. “Blocked by” below reports current issue body text, not independently retrieved native dependency edges.

- [#1284 P22-03](https://github.com/Asymmetric-al/core/issues/1284), **open**, updated Aug 14: one exact P9 Ministry Assignment; fuzzy, retired, ambiguous and cross-scope subjects refused. Explicit external prerequisite is **executable P9 Ministry Assignment, participant-membership, Ministry Project, lifecycle and succession contracts**, plus current P12 and P13 owner commands. This is concrete evidence that declaring D19 accepted does not prove it executable.
- [#1285 P22-04](https://github.com/Asymmetric-al/core/issues/1285), **open**, updated Aug 14: association, contributor, display, supporter/financial visibility and notification consequences separate; exact optional support binding plus P12 grant; external P9/P12 dependencies and P21 only for optional support. It does not grant ministry members a cultivation roster.
- [#1136 P21-04](https://github.com/Asymmetric-al/core/issues/1136), **open**, updated Aug 2: organization-owned Support Assignment through FieldAccountOperationsService, identity/scope/replay/authority proof; explicitly says P12 Legal-Entity workspace-access contract is **not yet represented by a complete child issue** and remains a named prerequisite.
- [#610 P9 merge membership](https://github.com/Asymmetric-al/core/issues/610), **open**, updated July 6: extends #512 engine, not another merge module; same-kind/tenant, explicit edge/note/activity/task-link repair, replayable inverse. Does not enumerate P27 journeys or Ministry membership semantics. Its older broad repair wording cannot override later source restrictions.
- [#512 P4 merge](https://github.com/Asymmetric-al/core/issues/512), **open**, updated Sept 23: current owner synchronization expressly replaces blanket all-child repointing with source-approved mutable identity repair; frozen money/documents and original commitment-owner facts untouched. Inventory later Party-keyed references; preserve admitted Undo.
- [#675 P12 entity/field/merge authorization](https://github.com/Asymmetric-al/core/issues/675), **open**: merge strictest tier first in serializable transaction; current source PDP, query-time floors, no per-row after-fetch filtering. Its entity list and self predicates are not an already-qualified ministry-cultivation access contract.
- [#622 P9 disclosure negatives](https://github.com/Asymmetric-al/core/issues/622), **open**, updated July 6: missionary workspace cannot enumerate outside admitted slice; ordinary CRM notes/activity absent; relationships and assignment are not grants. A future curated interaction projection needs the requested explicit source owner amendment, not removal of the old negatives.
- [#686 P12 enterprise seam](https://github.com/Asymmetric-al/core/issues/686), **open**, updated Sept 22: actual adoption amendment names P44; old deactivation-only Boolean key must not be reused across deactivate/reactivate/deactivate. P44 completion is not prerequisite to P12 revocation or P27 native safety.

## Source-invariant concerns

### 1. A ministry anchor accidentally becomes a permission container

**Critical; high likelihood if designers treat “team member” as access.** E1–E7 expressly rule this out. Supported scenario: spouse or teammate is associated with a ministry but may edit a Page only, view a limited financial projection, or have neither right. A replacement worker inherits the same ministry name but no supporter identities, private notes, financial fields, or prior history by association.

**Effect on D2:** Keep the anchor; make its lack of permission explicit. Do not say “all ministry participants share the journey.” P27 work-owner and P12 reader/writer are separate. A current independent staff grant can remain valid after participant membership ends; ending association alone is not a universal revoke-all operation. Conversely, actual revocation must deny first even if the membership continues until a future date.

**Narrow amendment/proof:** Before P28 access, P9/P12/P27/P28 must accept an exact ministry-cultivation purpose/projection rule replacing only the affected person-worded supporter slice. Preserve unrelated #622 absence tests. Prove current participant/no grant, former participant/current independent staff grant, revoked grant/current participant, and limited-history new worker across list/detail/count/export/cache/queued effects. Full interaction-sharing policy remains a later founder decision.

### 2. Ministry identity is silently substituted with a Support Assignment or designation

**Critical; medium-high.** E1/E3/E4 establish different owner identities and a one-to-one optional binding. Supported scenario: an ordinary prayer-only ministry or a zero-participant ministry has no financial account; another has several currency accounts under one Support Assignment.

**Effect:** Keep ordinary support journey attached to P9 Ministry Assignment even with P21 disabled/unbound. A Support Binding change must not move a journey, choose a giving designation, recompute financial fulfillment or change fundraising access. Do not build one cultivation journey per currency account.

**Amendment/proof:** Add only a P27 consumer reference to the exact P9 source. For financial context, separately qualify the needed P13/P14/P16/P21 projection. Test no binding, temporarily unavailable binding, valid replacement binding, and multiple ISO currencies; no local finance fallback. No amendment to P21’s one-to-one rule is implied.

### 3. “Ministry-scoped” is overgeneralized to every Phase 27 purpose

**High; medium.** E1 distinguishes Ministry Assignment from Ministry Project; P27 also serves agency development and church relationships. Hypothesis: implementation makes ministry_id mandatory everywhere, forcing fictitious ministries for general agency donors or foundation/project asks.

**Effect:** Scope D2 to ordinary missionary-support cultivation, the question asked. It does not settle all organizational purpose types or require a generic polymorphic target engine.

**Amendment/proof:** Future P27 purpose vocabulary must name the exact source for each supported purpose; no ad hoc `owner_type/owner_id` implying interchangeable authority. Walk through agency-wide church relationship, missionary ministry support and special project ask without inventing Parties or Ministry Assignments solely to satisfy a UI field.

### 4. Same name or same participants is mistaken for the same ministry purpose

**High; medium-high.** E1/E3 settle immutable source identity, not a fuzzy dedupe policy. Supported fact: a person may serve several ministries and a ministry can have no current participants. Hypothesis: a new church-planting work reuses a retired “Smith Family” display name and silently acquires old cultivation history.

**Effect:** P9 source-qualified identity, not label/household/team/person set, decides which ministry is referenced. Renaming a ministry is not by itself a new identity. Replacing people is not by itself continuation or termination of every donor purpose.

**Amendment/proof:** P27 consumes actual P9 eligibility/lifecycle result. An exceptional different-ministry association is explicit and does not rewrite the original reference. Test same-name different identities, renamed same identity, empty ministry, and one worker with simultaneous assignments.

## Temporal and concurrency concerns

### 5. Membership intervals and current audience drift apart

**Critical; high for long-lived journeys.** E2/E5/E6 require prospective intervals, exact current source and append-only correction. Supported scenario: future-dated participant exit; emergency access removal today; staff reviews handoff tomorrow.

**Effect:** Do not backdate P27 history from current participants, and do not defer actual revocation until membership end. Source corrections alter authorized current interpretation while preserving what was recorded when. Historical participation and current access are different queries.

**Amendment/proof:** Qualify P9 lifecycle/member version plus P12 epoch at consequential boundary. Test interval endpoints, daylight-saving-independent instants, scheduled start/end, correction racing enrollment edit, emergency revoke before future end, and disclosure after a lost response. Date-only product choices remain source-owned, not invented here.

### 6. Two operators create duplicate ongoing journeys for the same purpose

**High; high under couples/team/shared staff use.** D1 permits continuing purpose-specific relationships, not duplicate copies per actor. P27’s exact purpose identity and concurrency rule are not yet ratified.

**Effect:** Ministry anchor improves the duplicate boundary but does not define it alone: Party + Ministry Assignment can still have legitimately different purposes. Do not choose a blanket database uniqueness rule before the purpose question is settled.

**Amendment/proof:** P27 needs an explicit admission rule for the same exact relationship-purpose and a conflict/reuse result; roles/users do not belong in identity simply to avoid collisions. Race two create/reopen actions; repeat after lost response; ensure no duplicate next-action or financial coverage. This is P27 behavior, not a new ministry engine.

### 7. Reopening revives old obligations or access

**Critical; medium-high.** E4/E11 explicitly prohibit grant/preference revival; program effect identity preserves completed work. Source-supported principle, with P27 exact close/reopen behavior still open.

**Effect:** A paused journey may resume only under current purpose/owner/source/consent proof. Reopening cannot reschedule completed asks, recreate thank-you messages, revive invitation links or restore revoked grants. A source-retired Ministry Assignment cannot become eligible because a journey is reopened.

**Amendment/proof:** Let P9 decide whether its same identity can be restored and under what source lifecycle command; P27 then explicitly reopens its journey or starts a new one under the accepted lifetime rule. Test close/reopen/close, delayed pre-close event, revoke/rejoin, restored backup, and already completed effects. Do not invent Ministry reactivation permission in P27.

### 8. Participant replacement races an ask, task completion or export

**Critical; medium-high.** E6 and native-source command principles require current authorization and expected versions. Hypothesis: old worker’s open browser sends an ask after their grant is revoked, while new worker completes the inherited reminder.

**Effect:** P27 work cannot carry authority copied from the person who prepared it; responsibility transfer does not authorize source disclosure or send. A ministry’s continuing identity does not make stale expected versions acceptable.

**Amendment/proof:** Test authorized final command against stale journey/assignment/source revision and current grant epoch. Distinguish no-effect refusal from an already-admitted external effect whose outcome needs reconciliation. Do not demand one giant transaction across external providers or every domain; atomic local acceptance and source-owned durable follow-up are the existing pattern.

### 9. Offboarding transfers everything or drops everything

**High; high.** P27 roadmap demands no dropped asks/tasks/stewardship; E11 requires immediate revocation. Supported scenario: departing regional representative still owns open asks and an overdue next action; missionary remains associated.

**Effect:** Revocation is immediate and independent from human reassignment. Existing work remains source-identifiable; show unassigned/needs-review obligations to currently authorized staff. Do not auto-appoint successor, require outgoing worker consent, or leave a dead owner appearing healthy.

**Amendment/proof:** P27 owns explicit per-journey/ask responsibility disposition; P9 retains overall Party assignment and shared task owner command. Test departure with no eligible successor, partial reassignment, concurrent completion, revoked incoming user, retry, and historical author unchanged. Reuse existing tasks and actionable exception; avoid generic transfer coordinator.

## Life events and ministry succession

### 10. Couple separation wrongly splits one stable identity or exposes private context

**Critical; medium; expressly source-supported scenario.** E2 includes spouse separation. No universal “couple separates → split ministry” rule is ratified.

**Effect:** P9/organization may retain one ministry with changed participants or recognize distinct future ministries. P27 never decides from a marital edge. Current authority can be revoked first; historical authorship remains. Both people do not automatically receive copies of supporters, notes, or asks.

**Amendment/proof:** D2 should say participant changes alone do not fork/rehome the journey. If the organization actually changes the purpose, explicit P27 continuation/end/new-journey decision follows source owner evidence. Test one continues, both leave, two new ministries, contested access and open obligations without choosing family policy for the founder.

### 11. Death or incapacity becomes financial or personal succession

**Critical; medium; expressly source-supported life event.** E2/E10 preserve historical identity, independent duties and finance authority.

**Effect:** Appropriate staff may continue ministry stewardship if ministry purpose persists. No automatic spouse ownership, donor-roster inheritance, pledge transfer, recurring charge retarget, public-page replacement, or balance movement follows. Incapacity must not be guessed from account inactivity or directory deactivation.

**Amendment/proof:** Use exact P9/worker lifecycle evidence and current P12 authority. P27 displays unresolved next actions and permits separately authorized service response; financial disposition stays with P16/P21. Prove no auto-inheritance, separate public safety disposition, and retained late financial/communication evidence. Choice of successor staff remains explicit.

### 12. Ministry split duplicates donor journeys and financial coverage

**High to critical; medium; real organizational-change scenario, not an adopted automatic command.** E1/E2 anticipate owner dispositions but do not define a generic Ministry split operation.

**Effect:** Original journey/history stays original. Each distinct new purpose may get a new journey only deliberately; no automatic clone of all donors/asks/tasks/access. Whether a given partner continues supporting either new ministry needs actual purpose/response evidence. Do not reopen D1 by treating an annual appeal as such a split.

**Amendment/proof:** P9 qualifies new ministry identities; P27 narrow disposition can end/pause original future work and create explicitly linked future journey(s), with each unresolved ask/task handled by its owner. Test one pending ask, partial gift already received, donor declines new purpose, no duplicate coverage or outward send. Cross-purpose money changes require financial owner decision.

### 13. Ministry merger silently combines two private histories

**Critical; medium.** E8/E9 duplicate Party merge semantics are not Ministry merger authority. Two valid ministries joining operationally are not duplicate identities.

**Effect:** Do not run Party merge over Ministry Assignments, union journey membership/grants, choose the later stage, add expected totals, or silently take the newest note. A new source-approved ministry may be linked for future work; old journeys retain original purpose and provenance.

**Amendment/proof:** The minimum P27 extension is explicit source-linked future continuation, not an N-way successor graph engine. Test same donor on both prior ministries, incompatible stages, two open asks, different disclosure histories and task owners. A business merger need not imply a single consolidated cultivation journey for all donors.

### 14. Retirement erases unfinished or late obligations

**High; medium-high.** E2/E10 preserve history and independently live obligations. Source-supported lifecycle; exact P27 ending policy open.

**Effect:** No new solicitation under an ineligible retired ministry purpose. Existing accepted effects, late gifts, correction, acknowledgment, follow-up and audit remain with their owners. Retirement is not hard deletion, recurring cancellation, receipt suppression, erasure or “all complete.” Staff can retain an internal resolution task without promoting retired ministry as active fundraising.

**Amendment/proof:** P27 end/pause/exception and final disposition must inventory its own open asks/actions only; references to external unresolved work do not take ownership of it. Test late received response after retirement, corrected historical gift, unresolved uncertain send, and retained permission-safe history. A broad records-disposition engine is unnecessary.

### 15. One person serves several ministries and sees a combined supporter universe

**Critical; high in the intended couple/team model.** E3 expressly permits multiple ministries per person. Presence in one gives no authority in another; different purposes can overlap on the same donor.

**Effect:** Same person’s current ministry context must stay visible in journey, ask, task and brief. Neither a user-global “my donors” union nor one Party-global stage is safe. An authorized combined working list can be a projection with per-row source scope; it is not merged source identity.

**Amendment/proof:** Test context switching with in-flight pagination, donor supporting two ministries, different roles/fields/history per ministry, and one ministry revocation. Separate exact-authorized lanes remain available without requiring multiple login accounts.

## Cross-organization and Party identity concerns

### 16. Transfer to another agency is treated as a routine reassignment

**Critical; medium; supported ownership problem, exact transfer scenario is a pressure-test hypothesis.** E8 prohibits cross-tenant linking/merge/single view; E10 recognizes external charitable succession as separately qualified finance.

**Effect:** Old tenant’s Ministry Assignment/journey does not move to the new tenant. Current organization retains its lawful records and obligations; new agency establishes its own exact source records and permissions. A worker does not export every supporter/private note by claiming personal relationship continuity.

**Amendment/proof:** Any authorized transfer/export/import must use existing privacy, disclosure, consent and P29/P30 owner channels, exact allowed data, and independently admitted recipient records; it cannot transfer consent/grants/commitments automatically. Test a shared global login with tenant A revoked and tenant B active; no cross-tenant continuation query, financial mutation or permission carryover. Do not create a cross-agency CRM graph in D2.

### 17. Transfer between Legal Entities silently changes the anchor

**Critical; medium.** E1/E3 define one immutable Tenant/LE ministry scope and same-scope binding; E10 excludes cross-LE internal reallocation.

**Effect:** P27 cannot update a ministry’s Legal Entity foreign key, rebind old asks to a new issuer, or convert a support balance because staff say “transfer.” New source-approved identity/purpose and explicit future journey are the safe proposal where the real legal context changes; prior scope remains historically exact.

**Amendment/proof:** Source-owner ruling is required for any actual P9 cross-LE succession capability; D2 itself authorizes none. Test church donor with relationships to two entities, actor authorized in only one, exact same-currency amounts that must still not combine, and denied cross-LE reference at database and command boundary.

### 18. Donor Party merge is mistaken for journey-purpose merge

**High to critical; high as duplicates accumulate.** E8/E9 and current #512 govern proven same-real-world-Party identity repair; #610 contains earlier engagement repair details.

**Effect:** A donor’s current canonical Party reference may change only under P27’s admitted merge participation. Do not fuse two journeys merely because their Parties now canonicalize to one. Distinct ministry/purpose remains distinct. A duplicate same-purpose journey needs explicit P27 conflict handling, not stage/owner winner by last-write-wins.

**Amendment/proof:** Add P27’s mutable canonical reference versus immutable original-subject/actor/purpose provenance to #512’s owning reference inventory when implementation is later authorized. Preserve most-restrictive consent and source security tier first; no permission union; no immutable gift/commitment rewrite. Race merge against ask creation, task completion and new source response. This is a narrow existing-engine participant, not a second merge engine.

### 19. Unmerge copies all later work back to both Parties

**Critical; medium.** E8 supports replayable unmerge, but neither #512 nor #610 decides attribution of new P27 work created after a merge.

**Effect:** Restore admitted pre-merge mutable relationships from recorded operation evidence, not a fresh guess. Post-merge asks/messages/tasks and immutable accepted effects cannot simply be duplicated or reattributed to both identities. Keep exact original actor/source and surface ambiguous attribution for owner resolution; no outward replay.

**Amendment/proof:** P27 must declare reverse behavior for each admitted reference, including post-merge creations and collision dispositions. Test merge → new ask/partial response → unmerge, merge of one restricted donor, deleted/ended task, restored backup, and denied broad export. This is a concrete hardening gap to resolve before enabling P27 merge participation, not proof current sources lack every necessary primitive.

## Hidden coupling, dependencies and alternative framing

### 20. P27 is blocked on public publishing, all finance, or full enterprise identity

**High; high if phase labels become blanket dependencies.** E1 gives P9 ownership; E3 public pages can function without finance; P27/P28 roadmap preserves native independence; #1284 exposes real P9 source gate.

**Effect:** Ministry-scoped P27 requires the exact qualified P9 identity/lifecycle and P12 cultivation authorization slices. It does not require creating a public page, enabling P21 finance, finishing P44, or installing Workflow Studio. Conversely, a typed placeholder ID is not sufficient source qualification.

**Amendment/proof:** Name that narrow source contract and its release proof. If unavailable, mark only the dependent ministry capability incomplete; do not synthesize a shadow ministry from `missionary_id`. Test P27 native work with P21/P22/P34/P42/P44 unavailable except independently needed lower owner contracts. Keep source qualification distinct from choosing implementation table names.

### 21. A universal succession engine is introduced to solve rare life events

**High maintainability risk; medium-high likelihood under exhaustive grooming.** E2 requires explicit owner dispositions, not new generic architecture. E10 expressly rejects generic workflow inside finance.

**Effect:** Prefer three understandable cases: (a) same ministry and same cultivation purpose continue with independently managed people/responsibility; (b) current journey pauses/ends with clear outstanding work; (c) different ministry/purpose starts explicit linked future journey. “Linked” is evidence of an intentional relationship, not a command that transfers all facts. Do not prebuild arbitrary DAG transforms, pluggable migration rules, recursive split/merge routing or perpetual sync.

**Amendment/proof:** Record P27’s own bounded accepted operations and effects at later specification time. Validate ordinary spouse change and staff handoff first, then one split/merger/external-transfer adverse case through owner commands. Expand tooling only when observed operational burden demonstrates it; correctness of preserved source history is required immediately.

### 22. The ministry anchor is used to answer every donor relationship question

**High; medium.** D1 settled continuing purpose-specific relationships; E1/E7 do not say personal affection, donor intent or every cultivation purpose belongs to an institutional ministry automatically.

**Effect:** The proposed anchor answers which ministry the **ordinary support journey** serves. It does not assert the donor primarily values an organization over a missionary, authorize pressure to keep supporting after a departure, or turn a continuing relationship into perpetual solicitation. A donor can decline the new purpose and still receive permitted service/thanks for prior giving.

**Alternative considered:** A person anchor reflects personal affinity but conflicts with accepted couple/team/zero-participant/multiple-ministry durability and multiplies records on routine personnel change. Keep person-specific connection as permitted relationship/interaction context rather than ownership of the ministry journey. Do not create a household-owned journey just because the participants are married.

**Amendment/proof:** In the final D2 wording, distinguish organizational source identity from donor’s continuing intent. Demonstrate the donor declining a proposed successor while prior history remains intact and prohibited solicitation stays stopped. No source contract here predetermines whether an individual donor agrees that a reorganized ministry is “the same purpose.”

## Proposed bounded conclusion for founder review

For ordinary missionary support, a continuing cultivation journey references the exact organization-owned Ministry Assignment and its particular relationship purpose. It can continue when people change **if that ministry and purpose genuinely continue**, with independently authorized responsibility and visibility. It never belongs to a login or household, and it never inherits financial or access authority from the ministry.

A different ministry, genuine purpose change, legal-entity change or agency transfer does not silently retarget history. The relevant owners determine source eligibility, then staff explicitly conclude/pause existing work or start linked future work and account for open obligations. P27 uses its own bounded operations and existing source commands; it does not build a general succession engine. The exact stage, sharing, close/reopen, duplicate-purpose and financial-link policies remain separate unresolved decisions.

This wording is a recommended hardening of D2, not a ratified amendment. The two source tasks that cannot be hidden are (1) qualify the already accepted P9 ministry identity/lifecycle and (2) explicitly amend the affected P9/P12/P28 ministry-cultivation projection before using ministry scope to disclose a supporter roster. Neither requires reopening financial, public-page or Party identity ownership.

## Follow-up challenge: exact reference correction and minimal review triggers

**An absolutely immutable enrollment ministry foreign key would be stronger than the inspected owners require.** P9’s Ministry Assignment identity is immutable; P27’s mistaken choice of which ministry to reference is a different fact. P22’s before-first-release correction / after-first-release new-Page rule is expressly a public Page policy (ADR-0136:83–90), not a universal rule to copy into a cultivation journey. A draft journey entered against the wrong same-scope ministry might need a safe correction rather than a misleading succession story.

Recommended narrower statement: recorded ministry/purpose history and accepted effects never silently change. The **current canonical reference** may change only through an explicitly admitted, expected-version, source-evidenced P27 correction that retains the prior reference, actor, reason and affected history. Whether correction is allowed after a presented ask, completed interaction or accepted financial association needs P27’s precise consequence rule; this review does not approve unrestricted correction. A truly different ministry or purpose is deliberate new future work, not identity repair. P9 might later certify duplicate Ministry Assignment identity repair as the same operational ministry, but current #512 only establishes Party identity repair: do not fabricate a Ministry merge command. If P9 certifies that future case, P27 can consume its canonical mapping without pretending a new real-world ministry exists, while preserving original source identity and no grant/effect inheritance.

**Stable ministry identity is historical and organizational context, not evidence that the partner accepts replacement people or changed purpose.** That acceptance cannot be inferred from ID continuity, a new grant or a financial binding. The minimum owner-evidenced review causes should be:

1. **The exact ministry is retired/ineligible, or an owner proposes a genuinely different successor identity.** Evidence is P9 lifecycle/eligibility, not a directory group rename. Affected future cultivation admission is held for explicit disposition; existing source reconciliation/correction remains possible.
2. **A material ministry/purpose change is deliberately proposed for this journey, or a qualified source purpose restriction conflicts with its planned future ask.** Evidence is the explicit P27 change proposal and applicable source purpose/partner instruction, not an inferred donor preference. Staff must not claim partner acceptance merely because organization policy calls it continuing work. Precise materiality rules still need the owning product decision.
3. **Open obligations lose an eligible accountable person.** Evidence is source-owned responsibility ending, verified leave/availability disposition where that contract exists, or current P12 authority revocation. Do not infer incapacity from no login. This produces P27/shared-task assignment repair, not automatic operational or grant succession.

An ordinary name, login, household, participant, leadership-title, finance-binding or directory metadata change does **not alone** justify donor-wide review or outreach. A participant life event affects only journeys whose qualified purpose or responsibility actually depends on that person, or where it results in one of the three causes above. For example, adding an administrative teammate creates no donor-action avalanche; loss of the sole accountable worker creates assignment repair even if the ministry remains valid and donor purpose unchanged. A direct partner refusal or Never Ask restriction remains immediate source-owned suppression; it does not wait for this review.

Use one source-linked existing shared task or actionable journey exception for an affected cause/purpose, with current authorized owner and clear next action. Resolving that task cannot itself retarget a ministry, transfer grants, settle a financial obligation, or infer donor approval. This is a minimal P27 review path, not a generic all-domain transition engine. Batching authorized review can improve staff usability later, but no blanket “transfer all supporters” effect is justified.
