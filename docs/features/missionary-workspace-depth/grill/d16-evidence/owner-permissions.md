# D16 — Goal subjects, organization controls and permission ownership

Research only, October 16, 2026 UTC, against baseline
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`. The founder selected missionary-managed
fundraising goals when permitted and requested staff controls per missionary or
project. At this research snapshot, no clarification answer distinguishing editing
permission from Required / Optional / Not used goal usage has arrived. Recommend
the conservative **editing-only interpretation**: authorized staff choose
**Staff-managed** or **Missionary-managed** for an eligible goal context. Optional
editing means permission, not an obligation to create or change a goal. This is
an explicit product interpretation for ratification, not founder-confirmed
meaning. It introduces no new required-goal or goal-usage axis.

The recommendations below are owner reconciliation and engineering/product
judgments for review. They are not formal owner/OpenSpec amendments, ratification,
implementation, a completed permission system or release qualification.

## Recommended interpretation and owner findings

1. **A goal belongs to an exact ministry subject, not a login.** Recommend a
   bounded typed goal binding to its canonical ministry/project context, with
   exact Tenant and Legal Entity. P9 owns Ministry Assignment/Ministry Project
   identity and lifecycle; P28 owns Support-Raising Goal Versions; P13 retains
   actual Giving Campaign and fund goal sources. A principal is the independently
   authorized actor, not a replacement subject or goal-source identifier.
2. **Usage, editing and access are different facts.** Staff-managed means an
   existing goal may remain useful/readable but the missionary cannot change it
   through the self-management purpose. Not used would be a different source
   usage decision and is not selected or proposed here. Revoking a person's
   access is a separate P12 action and does not change the goal or other users'
   independent rights.
3. **One current permission system.** P12 owns capability meaning, grants, exact
   context, source/field/safety floors, current epochs and administration. P28 may
   register a small source policy and typed resources; it may not create a second
   principal/role/ACL product or a competing boolean authorization check.
4. **Administration is separate from exercise.** A goal editor does not thereby
   administer goal policy, grant themselves permissions or change public/finance
   settings. Conversely a properly scoped administrator need not hold the goal
   editing capability merely to administer its permitted grants or policy.
5. **Do not import another owner's default semantics.** P22's defaults seed new
   page drafts; P21 collaboration presets compile prospective grants. Neither
   automatically dictates whether a new D16 tenant goal default is live-inherited
   or seed-only. D16 must name that behavior explicitly.
6. **The scope of this answer is fundraising-goal editing control.** It does not
   require a goal, hide/remove one, or make weekly activity logging, check-ins,
   coaching or private/shared interaction reporting compulsory. Read-only coaches
   remain read-only. Existing duties and finance/publication owners stay independent.

Exact candidate product wording:

> An authorized organization administrator may choose whether an eligible
> fundraising goal is Staff-managed or Missionary-managed. Missionary-managed
> permits only independently authorized people to edit that exact goal through
> its owning source. It does not require them to create or change a goal.
> Staff-managed preserves the goal and its currently permitted viewing while
> restricting its editing to independently authorized staff. The control does
> not delete or hide goals, alter finance Plans or publish a different public
> target. If organization defaults are offered, Use organization default means
> inheritance; it is never labeled Optional.

## Exact inspected source register

Paths are relative to `/workspace/core`. These establish accepted target intent
or dated reviewed decisions; none proves a functioning Goal Version producer.

| Ref | Exact source and lines                                                                                                                                                                                                   | Governing fact and limit                                                                                                                                                                                                                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S01 | `docs/features/missionary-workspace-depth/grill/phase28-founder-brief.md:103–115,145–155,225–233`; `phase28-q16-goal-authority-research.md` in the same directory                                                        | P28 owns fundraising goals; role/subject distinctions; explicit Plan adoption; optional activities/check-ins and read-only coaching. Q16 asks missionary-direct versus staff-only authority, not goal usage or new finance/public powers.                                                                                                                                  |
| S02 | `docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:1272–1297`                                                                                                                                   | Ministry Project is a stable exact-Tenant/entity operational subject with source lifecycle. It is not a Party, Campaign, Designation, Page or project-management suite. Leadership/participation grants no workspace, finance or publication authority.                                                                                                                    |
| S03 | Same P9 file, `1299–1340`                                                                                                                                                                                                | Ministry Assignment can have zero-to-many separate Party participants and survives spouse/team/login changes. Membership is prospective association only; optional Support Assignment binding does not transfer participants, rights, history, finance or progress.                                                                                                        |
| S04 | `openspec/changes/add-public-ministry-pages/specs/identity-and-access/spec.md:25–77`                                                                                                                                     | Participation and owned grants remain separate; current server authorization governs writes and deferred effects; rebinding does not transfer grants/history. Active change intent, not evidence that the underlying producer shipped.                                                                                                                                     |
| S05 | `docs/prds/program-roadmap/owner-constraints.md:118–139`; `docs/prds/sitestacker-parity/roadmap.md:4171–4189`                                                                                                            | Separate voluntary coaching/targets and P28 Goal Versions; exact Plan provenance; no automatic financial or public-target update. P9/P27 and finance owners retain their domains.                                                                                                                                                                                          |
| S06 | `docs/adr/0098-optional-approved-support-plans-and-bounded-workspace-publication.md:5–27,65–76`; `docs/prds/sitestacker-parity/phase-21-field-accounts-decision-log.md:3042–3055`                                        | Optional finance Plans are independently authoritative; explicit copy creates an immutable P28 Goal Version. Later changes do not synchronize. Not managed, not configured, hidden, unauthorized, stale, unavailable and zero differ. P21's Not managed default is not a D16 goal-usage decision.                                                                          |
| S07 | `docs/adr/0123-page-resolved-source-authoritative-public-support-progress.md:16–40,45–59`; `docs/prds/program-roadmap/owner-constraints.md:136–139`                                                                      | Public release pins its exact goal/profile. Page defaults seed drafts only. Internal goal editing or settings changes cannot silently replace the released denominator; safety/current source eligibility still governs public projection.                                                                                                                                 |
| S08 | `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1464–1469,1544–1546,1552–1556,1584–1588`                                                                                                    | Single PDP, grants-only union then subtract-only floors, no per-grant DENY; current validated context/Legal Entity and epoch; code-derived capability meaning; coarse RLS is not fine-grained source authority.                                                                                                                                                            |
| S09 | Same P12 file, `1593–1622,1670–1672`                                                                                                                                                                                     | Separate grant/group membership administration; finite capability mapping; exact source powers; edit implies view; named resource grant versus Tenant-scoped assignment grant; live delegated administrative scope/ceiling; possessing a capability is neither necessary nor sufficient to administer it.                                                                  |
| S10 | Same P12 file, `361–416,2336–2417`                                                                                                                                                                                       | Multiple independent grant paths have no precedence and survive removal of another path. P21's resource-scoped collaboration consumes the same P12 system with separate read, administration, widening, narrowing and audit powers; its presets are compilers, not another authority. These are reusable boundaries, not permission to copy a P21 resource grant into P28. |
| S11 | `docs/adr/0210-code-authoritative-capability-foundation.md:16–37`; `docs/adr/0209-static-field-policies-and-subtract-only-projection.md:16–37`; `docs/adr/0211-distinct-human-approval-for-projection-widening.md:16–37` | Staged code-authoritative capabilities; whole-field classification plus source/row floors; projection-policy widening retains maker-checker. Ordinary goal edits inside an already qualified policy need no new generic approval queue.                                                                                                                                    |
| S12 | `docs/prds/sitestacker-parity/phase-27-donor-development/context.md:7–19`; `docs/features/missionary-workspace-depth/grill/phase28-d8-adversarial-review.md:487–521`                                                     | No compulsory shared reporting or inferred effort; read-only coaches cannot change goals. Goal/commitment/receipt/finance ownership and exact currency/period/version remain distinct.                                                                                                                                                                                     |
| S13 | `docs/prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:111,145,437,1238`; `openspec/changes/add-public-ministry-pages/specs/public-ministry-pages/spec.md:290–326`               | P13 owns time-bounded Giving Campaigns and their typed goals; fund goals and campaign goals have their own source. A public Project/Campaign Page can consume a compatible certified source, but does not make all project goals P28-owned or grant their editing rights.                                                                                                  |

## Minimal permanent subject and control model

### Subjects and actors

| Concept                   | Minimal interpretation                                                                                                                                                                                                                           | Must not imply                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Missionary's goal context | Exact canonical P9 Ministry Assignment qualified for the P28 goal purpose; actor may be one of several separately authorized people.                                                                                                             | A `profile_id` funding scalar, one goal per login, spouse equivalence, ownership of another participant's personal history or a global goal across all ministries. |
| Project goal context      | Exact typed operational subject plus actual goal owner. An existing P13 Giving Campaign/fund goal stays P13-owned; a distinct P28 support-raising goal for a P9 Ministry Project requires an explicit additional consumer/profile qualification. | Treating all project labels as one source, cloning a P13 goal into P28, editing a finance Plan or changing P22 public progress.                                    |
| Goal Version              | Immutable P28 source version with subject, scope and existing financial/period meaning retained.                                                                                                                                                 | One universal current goal per human: recurring and special goals, currencies and periods require their source-qualified distinct scopes.                          |
| Missionary/editor         | Current proved principal under one validated P12 context, admitted to the exact goal operation and subject.                                                                                                                                      | Write from membership, page contribution, leadership, familiar email, another hat or read-only coaching.                                                           |
| Policy administrator      | Current holder of the exact source policy-management and P12 administration powers within scope/ceiling.                                                                                                                                         | Every staff user; self-grant; editing a goal as proof of authority to change who can edit it.                                                                      |

P9's current subjects were introduced for public-page consumers. Qualifying them
for the P28 goal experience is an **explicit proposed additional consumer contract**. Do not
claim a public Page is required, create a dummy Page/Support Assignment, or extend
P9 into a goal, budget, scheduling or project-management engine. The source census
must reconcile existing missionary/context identities before migration. A
missionary with several assignments must choose the correct goal context; a
multi-person ministry shares the intended source goal rather than creating
competing copies solely because two people can edit. If the actual selected
project goal is a P13-owned campaign/fund goal, route any permitted edit through
that qualified source command; D16 cannot manufacture its permission or replace
it with a P28 look-alike. One displayed goal has one source. A separate P28
support-raising target may exist only with distinct explicitly qualified meaning,
never as a silent mirror of the P13 goal.

### Editing control without a second ACL

Recommend registering the exact ordinary goal read/create/successor operations,
source goal-policy management and applicable administrative powers through P12.
Concrete capability names can be chosen later; no new role enum or blanket
missionary/staff capability is needed.

If a source setting promises **missionary self-management disabled** for a
subject, it must be a registered current source-purpose condition enforced
through the one resolver/owner command. It cannot be implemented merely by
removing one grant while another current grant still authorizes the same action.
Independent staff goal-management authority may remain valid through its exact
qualified context/purpose. Do not write an ad hoc rule that a staff label always
overrides restrictions, or that a same-human second hat silently contributes
permissions. The UI must describe the actual effective action, including why
the subject is staff-managed if that is the current result.

A setting that administers grants instead must truthfully show the remaining
effective grants: removing one source is not equivalent to disabling all access.
P12's additive grant semantics and explanations remain authoritative whichever
bounded source control the later design adopts.

### Bounded defaults and overrides: recommendation, not selected semantics

If tenant defaults plus exceptions are needed, recommend exactly two levels:
one explicit **organization default** selecting Staff-managed or Missionary-managed,
then an exact typed-subject value of **Use organization default** or either
explicit mode. Never call inheritance Optional. No inherited chain through
roles, groups, region, project parents, spouses or participants is needed.

For this proposed model, an exact override wins over the ordinary default;
otherwise current resolution uses the default. A default change governs later
commands for inheriting subjects only. It does not rewrite explicit overrides,
historical Goal Versions or already accepted effects. Display the effective
value and whether it comes from the organization or a subject override. Resetting
an override means adopt the current default, and requires review of the actual
result under current authority.

An organization **default** is not an absolute organization **ceiling**. If an
existing safety/readiness/global-disable floor applies, it wins independently.
Do not label a default Off as “off for everyone” while explicit On exceptions
remain active, or invent another switch just to mask that contradiction. The
root review must state which bounded behavior it recommends for ratification;
neither live inheritance nor prospective seeding is already selected by the
founder's sentence.

No missing setting, legacy funding scalar, project membership or starter role
should create new D16 editing rights. Migration must classify and preserve
independently qualified current grants and readable historical records rather
than assume an empty database or silently revoke unrelated permissions.

### Editing-mode changes versus different source decisions

| Change                                     | Proposed narrow meaning                                                                                                         | Independent facts retained                                                                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Disable missionary editing / staff-managed | Stop that self-management operation; source-authorized staff editing and qualified reads can continue.                          | Goal amount/version, usage posture, support facts, public release and existing history.                                                                                     |
| Goal Not used                              | Not a D16 editing mode and not introduced by this interpretation. Any future source-usage decision needs its own exact meaning. | The editing control leaves existing goal use, immutable history and independent source/publication/finance authority unchanged.                                             |
| Required versus Optional goal usage        | Not selected or proposed. Permission to edit creates no duty to set/change a goal.                                              | No automatic duty to log weekly activity, coaching enrollment, staff status, reminder/task creation or block on unrelated native work.                                      |
| Revoke an editor's exact grant             | Current P12 effective authority changes only after all applicable grant paths and floors resolve.                               | Source goal, other users' valid grants, staff rights and lawful history; no automatic reassignment or successor grant.                                                      |
| Participant leaves / subject retires       | Apply the existing exact source lifecycle and current eligibility, preserving past references.                                  | No goal transfer to another principal, Ministry Assignment, Project, Support Assignment or Page by association.                                                             |
| Re-enable missionary editing               | Permit only fresh currently authorized operations under the current source and policy.                                          | No replay of a stale submitted draft, expired/revoked grant, old coaching share or public release. Ordinary policy re-enable is not an invented permanent terminal episode. |

The D16 editing mode must not rewrite a released P22 goal binding. A source safety
withdrawal or loss of required source authority can independently suppress a
public metric under P22's current rules. Conversely, continued validity of an
independently released public metric does not authorize current P28 editing or
coaching display. Do not infer universal hide-all or keep-visible-everywhere
semantics from a goal-editing control.

## Material concerns and exact proposed clauses

Severity describes potential harm without the safeguard. Likelihood is
conditional design judgment, not an observed incident rate.

### O01 — Login ownership collapses multi-person and multi-ministry goals

- **What:** A goal is keyed only to the logged-in missionary or mutable profile rather than the exact ministry/project context.
- **Why:** Spouses may get divergent goals for one ministry, one person's several assignments may overwrite one another, and departure can retarget historical goals.
- **Severity:** High.
- **Likelihood:** High if the legacy funding profile scalar is reused as the permanent source.
- **Evidence:** S02/S03/S05; Q16's bounded current-source observations in S01.
- **Answer impact:** Requires a qualified canonical subject extension; does not reject missionary editing.
- **Permanent fix:** One typed P28 goal source over canonical P9 subjects; keep principal, subject and goal scope distinct.
- **Exact clause OC01:** “Each displayed goal SHALL bind its actual owning source, exact Tenant, Legal Entity, qualified typed subject and source-defined goal scope. P28 Support-Raising Goal Versions and P13 campaign/fund goals SHALL remain distinct; a project label SHALL NOT transfer ownership or authorize a duplicate goal source. The editing principal SHALL remain separate. Membership, login changes, relationship merge or subject succession SHALL NOT rekey, duplicate or transfer a goal or its access/history automatically.”

### O02 — Project membership or the Coach role becomes goal-writing authority

- **What:** Participation, project leadership, Page contribution, a familiar role name or another tenant/hat authorizes a goal edit.
- **Why:** These associations are expressly separate from goal and workspace authority; a multi-user ministry can expose or alter another subject's plan.
- **Severity:** High.
- **Likelihood:** Plausible if subject lookup doubles as permission checking.
- **Evidence:** S02–S04/S08/S12.
- **Answer impact:** Requires exact operation/resource scope without inventing another role system.
- **Permanent fix:** Use the existing current P12 context and source command gate for every read, edit, recovery and derivative.
- **Exact clause OC02:** “Goal actions SHALL resolve the actual principal context, exact subject and version, purpose, field/safety floor and current capability at the source boundary. Project/Ministry Assignment membership, leadership, Page permissions, staff labels or read-only coaching SHALL NOT grant goal editing or transfer another subject's rights.”

### O03 — Off is incorrectly implemented as one removed grant

- **What:** A UI says missionary editing is disabled after removing one grant although another additive path remains, or uses an unregistered per-user DENY.
- **Why:** The first misrepresents authority; the second creates a competing permission engine and breaks P12's grant semantics.
- **Severity:** High.
- **Likelihood:** Plausible with a convenient `can_edit_goal` column checked only by the page.
- **Evidence:** S08/S10; P12's exact independent-path rule at lines 371–416.
- **Answer impact:** Requires explicit source-purpose/control meaning rather than another generic ACL.
- **Permanent fix:** Register the selected source self-management condition through the sole resolver/command and distinguish it from grant-source administration and independent staff management.
- **Exact clause OC03:** “A source control that disables missionary self-management SHALL be enforced as its registered current source-purpose condition, not as an ad hoc grant DENY or removal of one of several grant sources. Grant changes SHALL preserve independently valid paths and explain effective access. Staff goal-management remains separately authorized; no role label bypasses a source or safety floor.”

### O04 — Default and override behavior silently broadens or disables subjects

- **What:** A default is mistaken for a global ceiling, role hierarchy unexpectedly wins, or a bulk update overwrites explicit subject decisions.
- **Why:** An administrator cannot predict which missionaries/projects can edit a goal; concurrent policy changes can admit stale writes.
- **Severity:** High.
- **Likelihood:** Plausible without explicit precedence and impact review.
- **Evidence:** S07/S09/S10; existing domains intentionally use different default semantics.
- **Answer impact:** Requires one bounded, explicitly recommended resolution rule, not an inherited engine.
- **Permanent fix:** If defaults/overrides are selected, use the declared two-level model, current source policy revision and expected-head mutation; report authorized effective impact.
- **Exact clause OC04:** “The goal-control profile SHALL declare whether organization values are live defaults, seeds or ceilings. For the proposed live-default model, one exact typed-subject override wins over the ordinary organization default; only inheriting subjects follow a default change. Existing safety floors still win. Settings UI SHALL state effective value and origin, preserve explicit overrides and reject stale reviewed policy heads.”

### O05 — A goal editor can self-administer policy or unrelated source rights

- **What:** The same Edit control lets its holder change goal usage, grant themselves editing, edit an Approved Support Plan or alter public progress.
- **Why:** Source editing, grant administration and financial/publication authority have different scope and consequences.
- **Severity:** High.
- **Likelihood:** Plausible if a broad Manage goals toggle combines every action.
- **Evidence:** S06–S11; P12:1670 expressly separates exercise and administration.
- **Answer impact:** Adds independently qualified administrative operations; no per-goal-save approval ceremony.
- **Permanent fix:** Register minimal separate source/edit/policy/admin powers and retain existing live administration ceilings and widening rules.
- **Exact clause OC05:** “Goal editing SHALL NOT authorize goal-policy administration, grant changes, finance-plan edits or public publication. Each administrative consequence SHALL re-prove its exact current scope and ceiling through its owner. Projection-policy widening retains ADR0211; an ordinary compatible goal edit under qualified policy requires no invented supervisory approval.”

### O06 — Goal usage is conflated with deletion, zero or access loss

- **What:** Not used deletes a goal, staff-only hides it from every reader, or permission removal erases history and changes reported progress.
- **Why:** These are different domain facts, with public/coaching/finance consumers and lawful historical references.
- **Severity:** High.
- **Likelihood:** Plausible if one overloaded status boolean is reused.
- **Evidence:** S05–S07/S12; ADR0098's distinct honest states.
- **Answer impact:** Adopt the explicitly recommended editing-only interpretation; introduce no goal-usage axis without an actual later decision.
- **Permanent fix:** Separate source usage policy, current goal/head, editor authority and consumer publication; preserve source versions and truthful unavailable states.
- **Exact clause OC06:** “D16's Staff-managed / Missionary-managed control SHALL govern editing only. It SHALL NOT require a goal, hide/remove an existing goal, set it to zero, revoke independent read/history rights or change consumer publication. Use organization default SHALL mean inheritance, not Optional goal usage. Independent qualified history and source obligations retain their owners; missing, hidden and unavailable values SHALL NOT be reported as zero.”

### O07 — Concurrent downgrade or later re-enable revives old authority

- **What:** An open editor commits after its policy/grant/source became ineligible, or reenabling the feature silently replays an old draft or recreates a revoked share.
- **Why:** A page's old permission result cannot authorize a later consequential source mutation.
- **Severity:** High.
- **Likelihood:** Plausible under ordinary long-lived tabs and retries.
- **Evidence:** S04/S08/S09/S10 and the P12 current-epoch contract.
- **Answer impact:** Requires ordinary current command safety, not a new workflow or permanent terminal setting model.
- **Permanent fix:** Compare source and relevant policy heads and current access at the owner acceptance boundary; preserve accepted effects and recover only under current rights.
- **Exact clause OC07:** “Goal mutation SHALL re-prove current source, policy and authorization with expected source/policy versions at acceptance. Narrowing that wins before acceptance blocks the unsafe edit; an already accepted version remains attributable. Re-enable permits fresh eligible commands but SHALL NOT replay stale intent, restore revoked grants or transfer coaching/publication rights.”

### O08 — Fundraising-goal controls introduce compulsory coaching or reporting

- **What:** Editing permission is interpreted as required goal usage, weekly activity quotas, compulsory check-ins, missing-log penalties, coach writes or automatic task/reminder creation.
- **Why:** The rider concerns fundraising-goal administration; these extra consequences conflict with retained P27/D8 boundaries unless separately authorized.
- **Severity:** High for unauthorized disclosure/coercive interpretation; medium for friction.
- **Likelihood:** Plausible when the existing coaching vocabulary is reused without purpose separation.
- **Evidence:** S01/S05/S12.
- **Answer impact:** Preserve the selected fundraising control without silently settling independent activity-target meaning.
- **Permanent fix:** State that permission is optional exercise, with no new missing-goal penalty; keep voluntary activity/shared-context/coaching and independent source work separate.
- **Exact clause OC08:** “Permission to set or change a fundraising goal SHALL NOT impose an obligation to do so, compulsory interaction logging, weekly activity quotas, coaching enrollment, coach write access, performance inference, automatic tasks or a block on unrelated native work. D16 introduces no Required/Optional/Not used goal-usage axis. P27 voluntary history and D8 read-only coaching remain binding.”

## Necessary later owner amendments and proof

| Owner                                   | Minimal explicit addition or preserved boundary                                                                                                                                                                                                                                                                  |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P28                                     | Goal Version command/source, exact fundraising scope, typed subject binding and recommended editing-only Staff-managed / Missionary-managed meaning. Record this interpretation and bounded default/override behavior as recommendations for ratification, not a confirmed clarification or new goal-usage axis. |
| P9                                      | Qualify existing Ministry Assignment/Ministry Project adapters and lifecycle for the additional P28 goal consumer. Preserve exact same-scope identities, multiple participants and historical references; no new goal or project-management truth in P9.                                                         |
| P12/P3/P10 and active identity OpenSpec | Register goal source/resources, exact action and policy capabilities, current source-policy floor where selected, field classifications, scope/epochs and truthful administrative explanations. Existing capability registry/grants stay sole authority; no role shortcut or second ACL.                         |
| P21 / ADR0098                           | Preserve independent optional Approved Support Plan and explicit copy-with-provenance. No automatic plan update or prerequisite that a finance Plan exist before an independently eligible goal.                                                                                                                 |
| P13                                     | Preserve actual campaign/fund goal ownership. Any workspace control over those goals must call the exact current P13 command under separately qualified capability and source rules. The P28 permission UI or operational-project label cannot authorize it or manufacture a replacement source.                 |
| P22 / ADR0123                           | Preserve exact released goal binding and ordinary prospective release for goal/profile changes; maintain independent current safety suppression. P28 editing mode never rewrites a released denominator silently.                                                                                                |
| P27 and D8–D10                          | Preserve voluntary history, read-only coaching, exact shared goal scope and independently qualified financial summaries/history. No new goal-editing right from a coaching or partnership association.                                                                                                           |

Proof must include two editors of one ministry; one person in two ministries;
multi-project administration; membership without grants; a coach with read-only
access; the same human under different contexts; direct-plus-group/named grant
paths; default changes with explicit exceptions; a policy manager without goal
editing and an editor without policy authority; every narrowing/save order;
Plan/Goal/P13-goal/public-release independence; retained versions after editing-mode change or
subject retirement; no revived shares or stale drafts on re-enable; and truthful
missing/hidden/unavailable goal states. Prove ordinary work continues without a
goal and that editing permission creates no obligation, goal hiding, coaching or
reporting effect.

No app, formal owner, ADR/OpenSpec, database, tenant policy, permission, provider,
ticket or external service was changed. No runtime/database/provider test ran in
this owner subtask. Structural document checks are not release evidence.

## Subsequent review synthesis

After the initial review, the founder explicitly clarified: **editing permission
only; staff allow or disable missionary editing, and setting a goal remains
optional**. This supersedes this note's earlier pending-clarification language.
The [completed D16 review](../phase28-d16-goal-management-adversarial-review.md)
records that confirmed meaning. Its recommended Staff-managed / Missionary-managed
labels, organization-default inheritance and remaining amendments are not fully
ratified by this clarification. No Required/Optional/Not-used goal usage is added.
The main review reconciles individual View only versus Staff-managed,
one canonical goal-policy scope across aliases, applicable Legal Entity,
conditional ending and all-path restore fencing. Earlier conditional exploration
in this evidence note is preserved as research, not competing final design.

Actual probe claims retain their exact limits: permission re-enable is not a
backup restore test; no-op and a separately read-authorized receipt endpoint
were not executed. The completed review's C01–C20/P01–P24 govern the proposed
future proof, not a claim that those features are implemented.

## Subsequent ratification

On October 16, 2026 UTC the founder explicitly ratified the corrected D16 decision
and required amendments, including C01–C20 and P01–P24 as future acceptance
obligations. The [main D16 review](../phase28-d16-goal-management-adversarial-review.md)
is the reconciled decision; conditional alternatives and recommendation labels
above describe research before ratification, not competing current decisions.
The earlier clarification alone was narrower; the subsequent ratification accepts
the full corrected amendment package. This changes intended-behavior status only.
Executed probes, source snapshots and all runtime/qualification limits remain
unchanged. No full application, live database or production claim follows.
