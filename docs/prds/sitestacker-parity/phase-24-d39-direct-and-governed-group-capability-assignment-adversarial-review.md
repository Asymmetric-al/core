# Phase 24 D39 — Direct and Governed-Group Capability Assignment

**Decision date:** 2026-08-29  
**Founder direction:** Option 1 — both direct Active Tenant Assignment and
governed flat-group assignment through one Phase 12 EffectiveAccess model.  
**Scope:** Which central Phase 12 assignment sources may carry D38, how those
sources are administered and explained, and how direct/group overlap affects
authorization, lifecycle, D37, and the permanent Core UX.  
**Method:** /grill-with-docs, repository and governing-document audit,
current primary-source research, Core UI/accessibility review, and a ruthless
22-category adversarial pass.  
**Verification note:** Per founder direction, broad formatting, local-link,
skill-parity, strict OpenSpec, lint, typecheck, unit, build, and
git diff --check passes remain deferred until the end of the Grill session.
This artifact received only focused structural and contract-count checks.

## Final disposition

**Accept with required amendments.**

The founder's hybrid choice is the strongest permanent direction. Direct
assignment is proportionate for one person, temporary coverage, or a deliberate
exception. A governed group is substantially easier and less drift-prone when
the permission belongs to a stable job function. Microsoft Entra, Google Cloud,
AWS IAM, Salesforce, and GitHub all support the underlying direct-plus-group
pattern.

The unqualified answer is nevertheless unsafe. A group that carries D38 is an
authorization mechanism, not an ordinary collaboration team. Anyone who can
add a member can indirectly confer D38. Microsoft explicitly documents this
privilege-escalation path and protects role-assignable groups with assigned
membership, stronger membership administration, no dynamic membership, and no
nesting. Core must apply the same principle through Phase 12 rather than
copying a vendor-specific PIM product.

The founder choice is therefore accepted only with these amendments:

- every D38-bearing group is a protected Phase 12 staff access group;
- `permissions.manage_grants` governs capability-to-group edges, while
  separately scoped `permissions.manage_membership` governs assignment-to-group
  edges;
- generic group ownership or membership editing never suffices;
- adding, activating, or renewing a member also requires a live protected-group
  administration ceiling covering the group's complete current capability
  bundle and bundle revision;
- direct Tenant-wide capability grants use a typed Phase 12 assignment grant,
  not a record-scoped named grant and never a Website-local table;
- one current EffectiveAccess result deduplicates every valid path and exposes
  truthful provenance;
- no per-member deny, mute, exclusion, or deceptive “remove all paths” shortcut
  is added;
- only loss of the final current path fences D37; a surviving path does not;
  and
- the current seed-backed Teams & Users surface is not authorization truth or
  the permanent UI contract.

These requirements complete Option 1 without replacing it.

## Exact corrected decision

> Phase 12 SHALL permit **Apply Website recovery settings to current work**
> through both (1) a direct, typed capability grant to one exact active
> same-Tenant staff Active Tenant Assignment and (2) one or more governed flat
> staff access groups whose current active assignment-bound members inherit
> D38.
>
> Both paths feed the one `resolveProjection` additive union, provenance model,
> expiry evaluation, subtract-only floor, authorization epoch, and
> EffectiveAccess result. One assignment receives the capability once even
> when direct and several group paths contribute it. A raw grant row,
> membership row, group label, role, task, cache, token claim, or UI badge is
> not current authority.
>
> A group carrying D38 is a **protected authorization group**. It is manual,
> flat, same-Tenant, human-staff-only, and assignment-bound. It permits no
> nested, dynamic, external, cross-Tenant, role-derived, collaboration-team,
> task-derived, coordinator-derived, service, AI, API-key, invited-person, or
> silently activating membership. It is a Phase 12 staff access group, not a
> Website role or roster.
>
> Attaching, renewing, or removing D38 on a group requires current
> `permissions.manage_grants` authority within the actor's live administrative
> scope and assignable-capability ceiling. Adding, activating, or renewing a
> group member requires the separate `permissions.manage_membership` operation,
> exact group scope, and a live protected-group administration ceiling covering
> the group's complete current capability bundle and bundle revision.
> Possessing D38 is neither necessary nor sufficient for either operation.
>
> Generic group ownership, team management, a job title, Owner/Admin display
> label, task assignment, or broad edit permission never authorizes a
> D38-bearing membership change. An actor cannot add, activate, or renew their
> own Party through the same or another Tenant Assignment. Phase 12's existing
> quorum-aware self-grant, separation-of-duties, and recovery rules are the only
> small-Tenant exception; D39 creates no approval or break-glass engine.
>
> A protected-group membership delegation is bound to the exact group and its
> current capability-bundle revision. Adding D38 or otherwise widening the
> bundle makes a stale delegation ineligible to add, activate, or renew members
> until governance explicitly reauthorizes it. A current scoped membership
> manager may still remove or expire a member as a subtractive deprovisioning
> action, subject to Phase 12's last-permissions-manager invariant and complete
> consequence review.
>
> Phase 12 SHALL distinguish administrative assignment authority from exercise
> authority. A live **assignable-capability ceiling** authorizes which
> capabilities an administrator may cause another principal or group to hold;
> it grants none of those exercise capabilities to that administrator.
> Delegated administrative ceilings attenuate against the issuer's current
> administrative ceiling, never expand themselves, and cannot be manufactured
> from D38 possession. The reconciled Phase 12 D38–D39 amendment clarifies its
> pre-D39 wording by binding this delegation to administrative—not exercise—
> authority, preserving D38's possession-independent grant administration.
>
> The direct source is a typed central Phase 12 assignment-capability relation
> with a same-Tenant composite Active Tenant Assignment foreign key. It is not
> the record-scoped restricted-person named-grant primitive. The group source
> consists of independently governed capability-to-group and
> assignment-to-group edges. D39 adds no Website-local grant or membership
> relation.
>
> Every source edge has current state, independent duration, terminal cause,
> grantor/administrator and delegation provenance, semantic idempotency, and an
> immutable or append-only history. A group-derived path is effective only
> while the group, capability edge, membership edge, governing delegation, and
> Active Tenant Assignment are all current. Its authoritative expiry is the
> earliest applicable UTC instant. Timer jobs are not authority.
>
> Tenant-root governance edges survive the ordinary departure of the actor who
> created them while retaining attribution. An edge dependent solely on a
> bounded temporary delegation becomes inert when that delegation ends unless
> current Tenant governance deliberately succeeds it. Ended assignments,
> archived groups, terminal edges, old Party identities, and previous
> assignment identifiers never resurrect through rehire, restore, import, or
> regrant.
>
> Every grant, membership, activation, renewal, revoke, removal, expiry, or
> archive uses Phase 12's one advisory-locked, semantic-idempotent,
> expected-head mutation boundary. Confirmation derives and re-proves Tenant,
> actual/acting actor, current Active Tenant Assignment, subject/group,
> complete capability bundle, grant and membership authority, administrative
> ceilings, self/SoD constraints, relevant aggregate heads, and post-change
> EffectiveAccess. State, audit, exactly one authorization-epoch advance, and a
> durable receipt commit atomically or not at all.
>
> Direct and group sources remain independent. Removing one source removes only
> that source. The server computes post-change EffectiveAccess before review
> and again at commit. If another source survives, Core states which source was
> removed and that access remains; it never says access was revoked. If the
> final source ends, later uncommitted D37 effects are fenced. Already committed
> source changes remain immutable, and regrant never resumes the stopped D37
> application.
>
> Core provides no per-member deny, mute, exception, exclusion, or one-person
> group-capability removal. Changing group membership reviews every capability
> that person will gain or lose. Changing a group capability reviews every
> current member's deduplicated outcome. D40 permits one deliberate **separate
> direct grant** while group-derived access already exists, but only through a
> secondary current-source-first review with fresh reason, unpreselected
> independent duration, exact group-source-set proof, and immutable creation
> provenance. It is never silently created or offered through the ordinary
> direct-grant action.
>
> No D38 group is seeded, inferred, auto-created, mandatory, or synchronized
> from the current Teams demo or an external IdP. Zero direct grants, zero
> groups, zero members, and zero effective holders are valid quiet states.
>
> The permanent UX belongs in Phase 12 **People & access**, **Access groups**,
> person access detail, and **My Access**. User-facing provenance says
> **Granted directly** and **Through [group]**, not “EffectiveAccess” or
> “Active Tenant Assignment.” The current seed-backed Teams & Users sheet is
> not reused as the write model or visual contract.
>
> D39 creates no Website-local IAM, PIM, access-review campaign, notification,
> reminder, email, task, holder cap, minimum holder, dynamic membership,
> external sync, or Inngest authorization path. Inngest may reconcile an
> identifier-only derived projection but never grants, activates, expires,
> revokes, counts, or explains authority.

## Evidence classifications

- **Repository fact:** directly verified in the current Core checkout.
- **Verified external fact:** directly supported by a current primary source.
- **Reasonable inference:** follows from verified facts but is not itself
  measured product evidence.
- **Product judgment:** the chosen permanent tradeoff.
- **Assumption:** plausible but requires evidence before it may become a
  quantitative product claim.
- **Unresolved decision:** must return to the founder as one Grill question.

## Verified repository facts

1. [Phase 12](./phase-12-full-role-permission-configuration.md) owns the
   capability registry, grant sources, groups, Active Tenant Assignment,
   EffectiveAccess, epoch, delegation, audit, and Tenant/RLS boundary.
2. Phase 12 now defines one formula:
   `EffectiveAccess = (role/subrole grants ∪ group capability grants ∪
assignment capability grants ∪ record-scoped named-person grants) MINUS
floor`.
3. D38's Phase 12 amendment already makes the atom `explicit_only`, seeded
   nowhere, valid with zero holders, and possession-independent for grant
   administration.
4. The pre-D39 D38 baseline assigned capability-to-group changes to
   `permissions.manage_grants` and group membership changes to
   `permissions.manage_membership`; the now-landed D38–D39 Phase 12 amendment
   completes the latter's protected-group ceiling.
5. Phase 12 makes `manage_grants` versus `manage_membership` an SoD pair and
   applies same-Party self/not-in-chain checks.
6. Phase 12's pre-D39 delegated-admin property bounded delegation by the
   delegator's exercise set. The reconciled Phase 12 amendment now bounds
   assignment administration by the issuer's current administrative
   assignable-capability ceiling, resolving the conflict with
   possession-independent grant authority.
7. Phase 12 now names `assignment_capability_grants`,
   `group_capability_grants`, `group_membership`, and record-scoped
   `named_person_grant` as type-distinct central relations.
8. Current [permissions.ts](../../../packages/auth/permissions.ts) exposes only
   four broad MVP capabilities and gives every staff subrole the same set.
9. Current [Teams & Users](<../../../apps/admin/app/(app)/admin/teams/teams-sections.tsx>)
   uses local default values, generic module levels, small controls, and a
   broad Save Changes interaction.
10. Current [admin workspace collections](../../../packages/database/collections/admin-workspace.ts)
    return hard-coded Team/member seeds. They are neither authorization
    persistence nor migration evidence.
11. Current `authz.memberships` enables but does not force RLS, grants broad
    service-role writes, and cascades user/Tenant deletion. Those MVP choices
    cannot own durable D39 authorization history.
12. ADR-0001 records a fresh-build posture with no production users, so Core
    can design D39 correctly without inferring grants from legacy Tenant data.

## Current, intended, and best permanent behavior

| Concern             | Current repository behavior                         | Intended governing behavior                | Best permanent D39 path                                                           |
| ------------------- | --------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------- |
| Staff authorization | Broad MVP staff role handling.                      | Phase 12 capabilities and one PDP.         | D38 enters only through typed direct/group Phase 12 sources.                      |
| Teams/groups        | Seed-backed Teams demo and local values.            | Flat governed staff groups.                | Product-backed protected Access groups; demo data never migrates.                 |
| Direct grant        | No implemented D38 grant.                           | Explicit Phase 12 grants.                  | Strongly typed Tenant capability→Active Tenant Assignment relation.               |
| Group grant         | No implemented authoritative group grant.           | `group_capability_grants` plus membership. | Protected group; both edges current, scoped, and explainable.                     |
| Administration      | Broad role labels and service paths exist.          | `manage_grants`/`manage_membership` split. | Separate operations plus live protected-group administrative ceilings.            |
| Explanation         | No effective-source model.                          | `explainAccess` and My Access.             | One capability card, complete direct/group provenance, truthful post-change copy. |
| Revocation          | No D39 contract.                                    | One epoch and current reproof.             | End one edge; final-path loss alone fences D37.                                   |
| Persistence/RLS     | MVP membership table, owner/service bypass hazards. | Same-Tenant forced-RLS grant model.        | Composite FKs, immutable scope, restrictive deletion, privileged parity.          |

## Current primary-source evidence

- [Microsoft Entra role assignment options](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/custom-overview)
  verify that roles may be assigned directly or through role-assignable groups
  and that applicable assignments are collected from both paths.
- [Microsoft Entra role-assignable group protections](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/groups-concept)
  explicitly warn that an ordinary group administrator could otherwise
  self-elevate; assigned membership, stronger membership administration, no
  dynamic membership, and no nesting protect that boundary.
- [Microsoft Entra PIM for Groups](https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/concept-pim-for-groups)
  confirms that sensitive-resource group membership is an authorization
  operation and that protected role groups reject active nesting.
- [Google Workforce IAM guidance](https://docs.cloud.google.com/iam/docs/best-practices-workforce-identity-federation)
  says individual grants can serve specific cases but scale poorly, while
  group-based principals reduce policy churn and inconsistency.
- [Google group guidance](https://docs.cloud.google.com/iam/docs/groups-in-cloud-console)
  confirms that users inherit roles granted to a group.
- [AWS IAM groups](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_groups.html)
  are flat, permit multiple memberships, and make joiner/mover/leaver
  permission administration easier.
- [AWS IAM audit guidance](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-audit-guide.html)
  recommends groups/roles over individual policies and requires reviewers to
  understand the complete set of policies contributing to a user's access.
- [Salesforce Permission Set Groups](https://help.salesforce.com/s/articleView?id=sf.perm_set_groups.htm&language=en_US&type=5)
  group permissions around job functions and expose combined permissions.
- [GitHub organization roles](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization)
  allow granular roles to be assigned to individuals and teams.
- [CiviCRM permissions and ACLs](https://beta.docs.civicrm.org/user/initial-set-up/permissions-and-access-control/)
  show the usability cost when CMS roles, ACL roles, groups, and scopes become
  several interacting systems. Core should keep one authorization model.
- [NIST SP 800-53 AC-5/AC-6](https://csrc.nist.gov/CSRC/media/Projects/risk-management/800-53%20Downloads/800-53r5/SP_800-53_v5_1-derived-OSCAL.pdf)
  supports separation of duties and least privilege.
- [OWASP Authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
  supports deny by default and current permission validation on every request.
- [PostgreSQL row-security documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
  distinguishes `USING` from `WITH CHECK` and documents table-owner and
  `BYPASSRLS` bypass behavior.
- [WAI-ARIA modal dialog guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
  supports explicit focus containment, initial focus, and focus restoration
  for the one review surface.

## Verified facts, judgments, assumptions, and unknowns

- **Verified external fact:** mature IAM products support both direct and group
  sources.
- **Verified external fact:** group membership is an indirect privilege grant
  when the group carries privilege, and ordinary group administration is not a
  sufficient safety boundary.
- **Repository fact:** Phase 12 already owns both source concepts and forbids
  nested v1 groups.
- **Product judgment:** use direct assignment for a particular person and a
  protected group for a genuine stable job function.
- **Product judgment:** do not present both as equal toggles everywhere;
  person detail owns direct assignment and Access-group detail owns group
  assignment.
- **Assumption:** some larger ministries will have a stable D38 operations
  cohort. This has not been established by observed Tenant research.
- **Unresolved unknown:** expected group size, direct/group adoption ratio, and
  administrator terminology comprehension. Evidence requires prototype-based
  research with actual Tenant access administrators; Core must not invent a
  holder cap or conversion heuristic meanwhile.
- **Repository decision:** D40 permits a deliberate separate direct grant only
  through the continuity-specific source-proof and UX contract; it creates no
  ordinary redundant-grant path.

## Strongest plausible alternative

The strongest alternative is **direct Active Tenant Assignment only**.

It eliminates the second authorization edge, makes revocation easiest to
explain, and is safer than an inadequately protected group implementation. It
is not the best permanent answer because a stable multi-person operations
function would require repeated grants, expiry changes, offboarding, and
reviews. That creates drift precisely where modern IAM uses protected groups.

The group path MUST remain disabled until protected-group administration,
complete provenance, atomic group impact review, and every positive/negative/
concurrency/RLS proof pass. If Core cannot satisfy those requirements, it must
reject the unsafe group path rather than weaken it. This is a release gate, not
a different permanent decision.

## Domain model, ownership, and invariants

### Authoritative concepts

- **Direct assignment source:** one typed Phase 12 edge from a capability to an
  exact Active Tenant Assignment.
- **Group capability source:** one typed Phase 12 edge from D38 to one staff
  access group.
- **Group membership source:** one typed Phase 12 edge from one Active Tenant
  Assignment to one staff access group.
- **Protected authorization group:** a staff access group whose current
  capability bundle requires protected membership administration. Protection
  is server-derived from the bundle, never a cosmetic toggle.
- **Assignable-capability ceiling:** the current administrative ceiling that
  bounds which capabilities an administrator may cause another assignment or
  group to hold. It grants no exercise authority.
- **Effective D38 path:** either one valid direct edge, or one valid group
  capability edge joined through one valid group membership edge, after
  expiry, delegation, assignment, floor, and epoch evaluation.
- **Current holder:** one exact Active Tenant Assignment whose current
  EffectiveAccess includes D38 through at least one path.

### Ownership map

| Fact                            | Authority                            | Consumers                   | Never authority             |
| ------------------------------- | ------------------------------------ | --------------------------- | --------------------------- |
| D38 definition/assignment class | Phase 12 code registry               | grant UI, PDP, build gates  | Website label, role, seed   |
| Direct/group/membership edges   | Phase 12 authorization store         | PDP, explanation, audit     | task, Team demo, cache      |
| Protected-group classification  | Phase 12 from current bundle         | membership command, UI      | group label/admin checkbox  |
| Administrative ceiling          | Phase 12 governance                  | grant/membership PEP        | D38 possession              |
| Current EffectiveAccess         | `resolveProjection` at current epoch | D37 PEP, holder explanation | row count, badge, JWT array |
| D37 application state           | Website recovery domain              | safe revoke consequence     | grant/group tables          |
| Presentation/provenance         | People & access/My Access projection | authorized staff/subject    | write authority             |
| Future Tasks Hub item           | source-owned work projection         | recipient task list         | grant/group authority       |

### Invariants

1. One assignment can have zero or one current direct D38 edge.
2. One group can have zero or one current D38 capability edge.
3. One assignment can have zero or one current membership edge per group.
4. One assignment may have several group paths and one direct path.
5. Current EffectiveAccess contains D38 at most once.
6. Current holder count deduplicates Active Tenant Assignment identifiers.
7. A group path exists only while both source edges and every governing
   authority are current.
8. The floor subtracts last and always wins.
9. No grant, group, membership, or role reaches past the floor.
10. Human edges bind Active Tenant Assignment, never bare person/profile/email.
11. Same-Party self-change is evaluated across every Tenant hat.
12. D38-bearing groups are flat, manual/static, same-Tenant, and human staff
    only.
13. A stale protected-group administration ceiling cannot add, activate, or
    renew membership.
14. Capability widening invalidates stale membership-administration
    delegations before another member can gain access.
15. Subtractive membership removal remains available to an authorized scoped
    deprovisioner unless a separate governing invariant blocks it.
16. Removing one path never erases or mutates another path.
17. Final-path loss alone removes EffectiveAccess and fences D37.
18. Group membership removal reviews all group capabilities, not just D38.
19. Group capability removal reviews all current members, not one selected
    person.
20. A group rename changes display only and never authorization.
21. Archive/end/expiry/revoke are terminal for that edge.
22. Restore, rehire, import, and regrant never revive a terminal edge.
23. Recreating an assignment produces a new identifier and inherits nothing.
24. Tenant/subject/group/capability/source identity is immutable.
25. Authority uses UTC instants; UI uses localized date, time, and zone.
26. Expiry is evaluated synchronously and does not wait for a worker.
27. One successful mutation advances the Tenant authorization epoch exactly
    once.
28. No synchronous group mutation writes N authoritative per-member grants.
29. Audit history remains attributable after an ordinary actor departure.
30. Unknown source, state, capability classification, or bundle revision
    fails closed.

## UX and UI contract

### Information architecture

The permanent flow is:

```text
Mission Control
  People & access
    People
      Jordan
        Additional permissions
          Apply Website recovery settings to current work
    Access groups
      Website Operations
        Members
        Permissions
        History
  My Access
    Website operations
```

Do not expose “governed flat group,” “EffectiveAccess,” “grant edge,” or
“Active Tenant Assignment” to ordinary users. Use **Access group**, **Granted
directly**, and **Through [group]**.

Person detail is the natural direct-grant surface. Access-group detail is the
natural group-grant and membership surface. A capability overview may offer
two explicit entry cards—**Grant to a person** and **Grant to an access
group**—rather than a compact source-kind dropdown.

### Person access detail

Show D38 once:

```text
Apply Website recovery settings to current work

Granted directly · Until removed
Through Website Operations · Membership ends 31 August 2026
```

If a direct path is removed while the group path survives:

```text
Direct permission removed
Jordan still has this permission through Website Operations.
```

If a direct grant is proposed while group access already exists, D40 shows the
complete current group-source set first and offers only the secondary **Add
separate direct grant** flow. The UI states that present ability is unchanged
while future survival changes and never silently creates the source.

### Add or renew group membership

```text
Add Jordan to Website Operations?

Jordan will gain 4 permissions, including permission to apply the saved
Website recovery setting across compatible current work.

Jordan already has the Website recovery permission directly. Group membership
will add another access path.

[Cancel] [Add member]
```

The review presents every capability gained, the membership duration, required
governance reason where Phase 12 requires it, and exact non-effects. The
primary action says **Add member**, because this is a group membership
mutation—not “Grant D38.”

### Attach D38 to a group

```text
Grant Website recovery permission to Website Operations?

6 active members are in this group.
4 people will newly gain this permission.
2 already have it through another access path.

This does not grant access to Website records, restricted Sites, or correction
actions.

[Cancel] [Grant permission]
```

The exact aggregate is current, deduplicated, and bound to the capability and
membership-cohort heads. A paginated or expandable member review is available;
the confirmation does not render a large unbounded person list.

If the widened bundle invalidates current membership-manager ceilings:

```text
2 membership managers will no longer be able to add or activate members until
their access is reviewed.
```

### Remove membership or group capability

Membership removal names every group capability the person loses and each
surviving source. Group-capability removal gives exact current counts for:

- active members;
- assignments newly losing D38;
- assignments retaining it through another path; and
- whether final-path loss will stop a currently active D37 operation.

It reveals no Website member, Site, title, return reason, recipient, correction,
or task detail.

Core offers no **Remove all permission paths** shortcut. If the actor lacks the
authority for a particular path, it remains read-only and the UI explains
which governance surface owns it.

### Group lifecycle

Do not copy the current prototype's **Permanently Delete Team** pattern.
Authorization-bearing groups archive through a governed terminal command.
Archive ends current group paths and retains history. Any later reactivation
requires fresh reviewed source edges; it never silently restores old access.

### Interaction and accessibility

- one non-nested review route or panel, not a dialog inside the current Sheet;
- Base Maia semantic Card, Field, Alert, Badge, Button, Dialog/AlertDialog, and
  Empty primitives with Core tokens;
- no generic None/View/Manage/Admin select for this explicit-only capability;
- no optimistic authority and no toast-only outcome;
- durable receipt-backed success, stale-state, conflict, expiry, and
  lost-response routes;
- at least 44-by-44 CSS-pixel important controls;
- visible focus, logical keyboard order, focus containment/restoration, and
  programmatic status/error association;
- 320-CSS-pixel and 400-percent reflow without horizontal permission matrices;
- forced-colors and reduced-motion support;
- no color/icon/hover/truncation-only meaning;
- localized instants with explicit zone, Unicode-safe reasons, long and
  international names, RTL/bidirectional isolation, and correct plural forms;
- low-bandwidth reload recovers current state or a durable receipt without a
  blind resubmit.

### Quiet states and privacy

Zero direct grants, groups, group members, or effective holders is neutral.
Core creates no warning, unread, task, reminder, email, SLA, or escalation.

D38 possession reveals only the holder's safe own provenance. Other holder
identities, counts, group membership, reasons, and audit history require the
relevant access-governance authority. Group and person reviews expose only the
minimum D37 consequence needed for safe revocation.

## Conceptual persistence, RLS, and authorization

D39 adds no Website table. Phase 12 must provide strongly typed direct
assignment-capability, group-capability, and group-membership relations. Exact
SQL names remain a design choice; the following behavior does not:

- every Tenant relation has `tenant_id NOT NULL`;
- group and assignment targets have composite `(tenant_id, id)` keys/FKs;
- human direct grants and membership reference the Active Tenant Assignment,
  never profile, auth user, Party, email, or role;
- capability FKs are immutable and `ON DELETE RESTRICT`;
- group, assignment, capability, Tenant, source kind, grantor, and delegation
  cannot move by update;
- one partial/current uniqueness rule protects each semantic edge;
- `expires_at` is `timestamptz` and nullable only for explicit **Until
  removed**;
- expiry must be later than grant/start and authority compares against the
  trusted server clock;
- terminal edges are append-only or immutable terminal heads with successor
  lineage;
- group/assignment deletion is restricted or soft-terminal and never cascades
  authorization history;
- reasons are normalized, bounded, Unicode-safe governance evidence and carry
  no protected Website, worker, donor, care, location, or correction content;
- indexes support direct resolution by Tenant/assignment/capability, group
  resolution by Tenant/assignment/group/capability, capability impact by
  Tenant/group, expiry/delegation, and provenance/audit lookup;
- time-based authority does not rely on a `now()` partial-index predicate;
- holder/impact queries use set-based unions and deduplication;
- one group mutation writes one authoritative edge/head and one Tenant epoch,
  never N effective-grant rows;
- derived materializations are asynchronous/idempotent and cannot authorize.

Authorization/RLS requirements:

- `permissions.manage_grants` plus current administrative scope/ceiling owns
  direct and group-capability edges;
- `permissions.manage_membership` plus exact protected-group scope and current
  bundle ceiling owns add/activate/renew membership;
- D38 possession alone owns neither;
- browser `INSERT`/`UPDATE`/`DELETE` are revoked;
- grant, group, membership, delegation, audit, receipt, and holder-projection
  tables `ENABLE` and `FORCE ROW LEVEL SECURITY`;
- operation-correct `USING` protects existing rows and `WITH CHECK` protects
  inserted/resulting rows;
- the sole SECURITY DEFINER mutation function pins `search_path` and derives
  Tenant, actors, subject, capability, source, time, and attribution;
- Owner, table owner, service role, `BYPASSRLS`, RPC, worker, support, repair,
  import, export, cache, Realtime, AI, and Inngest paths repeat the same product
  authorization;
- an allowed mutation cannot transform a permitted edge into a forbidden
  Tenant, subject, group, capability, or source;
- audit/history retention survives identity deletion through a non-sensitive
  stable attribution reference or lawful anonymization, never cascade loss.

## Lifecycle, temporal correctness, concurrency, and idempotency

```text
registered D38; no paths
  |
  +-- direct grant review
  |     +-- locked commit -> direct path
  |
  +-- group capability review
  |     +-- locked commit -> protected group capability edge
  |             |
  |             +-- member add/activate review
  |             |     +-- locked commit -> group-derived path
  |             |
  |             +-- member/capability expiry or removal
  |                    surviving path -> access remains
  |                    final path lost -> D37 fence
  |
  +-- assignment end / delegation end / group archive
  |     +-- path inert; no resurrection
  |
  +-- regrant/rejoin
        +-- fresh source and review; never resume stopped D37
```

Required command order:

1. derive one Tenant Authorization Context and actual/acting actors;
2. take the documented Phase 12 grant-state lock;
3. re-prove actor operation, administrative scope/ceiling, self/SoD, and
   subject/group eligibility;
4. read current relevant capability, group-bundle, membership-cohort,
   assignment, delegation, and D37 authority heads;
5. compute current and proposed path/provenance/effective outcomes set-wise;
6. enforce last-admin/other global invariants;
7. append the edge/head, audit, receipt, and one Tenant epoch atomically;
8. return the durable receipt only after commit.

An unrelated Tenant governance change need not create a false review conflict
when the actor remains authorized and every relevant head is unchanged.
Confirmation nevertheless re-resolves authority at the current Tenant epoch.
A relevant head change returns:

> **Access changed while you were reviewing it. Nothing was changed. Review
> the current access.**

For D37 races, its member commit checks the current authorization epoch in the
same transaction as the source effect. If a source effect commits first it
remains; if final-path revocation commits first the later member cannot commit.
No cross-domain distributed lock or Inngest timing is authoritative.

## Normative requirements

1. **D39-R1 — Two central source kinds.** Phase 12 admits typed direct Active
   Tenant Assignment and governed flat-group sources for D38.
2. **D39-R2 — One PDP.** Both sources enter one `resolveProjection` union and
   floor.
3. **D39-R3 — Typed direct relation.** Direct Tenant capability assignment is
   distinct from record-scoped named grants and Website state.
4. **D39-R4 — Protected access group.** Every D38-bearing group is a protected
   Phase 12 staff access group.
5. **D39-R5 — Static flat membership.** No nesting, dynamic/external source,
   role mapping, service principal, or silent activation.
6. **D39-R6 — Active-assignment binding.** Every human direct or membership
   edge binds one exact active same-Tenant staff Active Tenant Assignment.
7. **D39-R7 — Split administration.** `manage_grants` owns capability edges;
   `manage_membership` owns membership edges.
8. **D39-R8 — Protected membership ceiling.** Add/activate/renew requires exact
   group scope plus a live ceiling covering the complete bundle/revision.
9. **D39-R9 — Administrative versus exercise authority.** Assignable ceiling
   grants no D38 exercise and D38 possession grants no administration.
10. **D39-R10 — No self escalation.** Same-Party self/alternate-hat
    add/activate/renew is forbidden outside Phase 12's sole quorum-aware path.
11. **D39-R11 — Safe deprovisioning.** Scoped membership removal remains
    subtractive and available subject to governing invariants.
12. **D39-R12 — Full group consequence.** Capability changes review every
    current member's deduplicated outcome.
13. **D39-R13 — Full membership consequence.** Membership changes review every
    group capability gained/lost.
14. **D39-R14 — Independent path lifecycle.** Direct, group-capability, and
    membership edges retain independent state/duration/provenance.
15. **D39-R15 — Earliest expiry wins.** Every group path ends at its earliest
    governing UTC instant without timer authority.
16. **D39-R16 — One effective result.** Holder status/count deduplicates all
    valid paths by Active Tenant Assignment.
17. **D39-R17 — Honest source removal.** Removing one edge reports every
    surviving path and never falsely claims full revocation.
18. **D39-R18 — Final-path D37 fence.** Final EffectiveAccess loss alone stops
    later uncommitted D37 effects; regrant never resumes.
19. **D39-R19 — No per-member deny.** Group access has no mute, exclusion,
    negative grant, or one-person group-capability shortcut.
20. **D39-R20 — No inference or seed.** No Team, role, Owner, Web Studio,
    task, history, IdP, import, or migration infers D38 sources.
21. **D39-R21 — Terminal history.** Revoke/remove/expire/archive edges never
    resurrect; regrant/rejoin creates a successor.
22. **D39-R22 — Trusted locked mutation.** Every edge mutation is current-
    proofed, CAS-bound, semantic-idempotent, advisory-locked, and atomic.
23. **D39-R23 — Causal epoch.** Every successful authority change advances one
    Tenant authorization epoch without synchronous member fan-out.
24. **D39-R24 — Tenant/RLS structure.** Same-Tenant composite FKs, immutable
    scope, forced RLS, correct `USING`/`WITH CHECK`, least grants, and
    restrictive deletion protect every relation.
25. **D39-R25 — Privileged parity.** Owner/service/RPC/worker/support/repair/
    import/export/cache/Realtime/AI paths enforce the same rule.
26. **D39-R26 — Complete provenance UX.** People & access and My Access show
    one permission with every authorized direct/group source.
27. **D39-R27 — Contextual source UX.** Person detail owns direct grants;
    Access-group detail owns group grants/membership; no ambiguous switch.
28. **D39-R28 — Accessible durable review.** Reviews are non-nested,
    responsive, keyboard/screen-reader/touch safe, and receipt-backed.
29. **D39-R29 — No local machinery.** D39 adds no Website IAM/PIM, approval,
    task, notification, dynamic group, external sync, or Inngest authority.
30. **D39-R30 — Reserved until proof.** D38–D40, Phase 12/OpenSpec,
    implementation, tests, and release evidence must agree before activation.

## Ruthless adversarial review by category

### 1. Problem validity, necessity, and alternatives

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                                                                                         | Severity / likelihood | Evidence / effect on answer                                                                                                               | Permanent fix / prevention                                                                                                                                                 | Exact language                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Core could force every Tenant into group ceremony despite D38 commonly needing one responsible person, or use direct-only and create repeated access drift for a genuine operations team. The choice would solve the wrong level of problem. | Medium / Medium       | Entra/AWS/Google/Salesforce support both; no verified Core Tenant holder-volume evidence exists. The answer is narrowed, not invalidated. | Keep both central sources optional. Use direct for a particular person and a protected group for a stable shared function. Never auto-select by guessed organization size. | “A Tenant MAY use either source. Core MUST NOT require, seed, infer, recommend from an unverified count threshold, or auto-convert one source to the other.” |
| A no-build alternative—prospective policy plus Needs assignment—could be overlooked.                                                                                                                                                         | Medium / Medium       | D35–D38 make zero holders complete and quiet.                                                                                             | Keep D39 optional; never turn it into setup completion.                                                                                                                    | “Zero source paths is a valid operating state and MUST NOT be treated as incomplete setup.”                                                                  |

### 2. Brittleness

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                                                              | Severity / likelihood         | Evidence / effect on answer                                                                                                                                    | Permanent fix / prevention                                                                                                                                                                | Exact language                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A membership administrator approved before D38 is attached could retain the ability to add people after the group becomes privileged. A mutable label, stale cache, or latent membership could also widen access. | High / High without amendment | Entra explicitly protects role-bearing groups from ordinary/dynamic administration. Phase 12 has scopes/ceilings but D39 must bind them to the current bundle. | Derive protected status from the current capability bundle; bind membership administration to exact group and bundle revision; invalidate stale add/activate/renew authority on widening. | “A protected-group membership addition, activation, or renewal MUST prove a current ceiling for the group's complete current capability bundle and revision.” |
| Renaming or restoring a group could accidentally change or revive authority if code uses labels or mutable lifecycle flags.                                                                                       | High / Medium                 | Phase 12 says names never authorize; current Teams UI treats names as ordinary mutable values.                                                                 | Stable IDs authorize; archive is terminal for current edges; restore requires fresh reviewed successors.                                                                                  | “Group label and description are display-only; no rename, restore, or re-created key may revive an ended source.”                                             |

### 3. Technical debt

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                          | Severity / likelihood | Evidence / effect on answer                                                                                       | Permanent fix / prevention                                                                 | Exact language                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reusing the restricted-record named-person grant for a Tenant-wide capability or adding Website grant tables creates overloaded or dual authorization models. | High / Medium         | Phase 12 lists record-scoped named grants and group grants but not a clearly typed direct Tenant capability edge. | Add/confirm one typed Phase 12 assignment-capability relation with strong same-Tenant FKs. | “Direct D38 assignment MUST use the central typed assignment-capability source and MUST NOT use record-scoped named-grant or Website persistence.” |
| Per-member group denies/mutes might be added to solve overlap, introducing negative-grant precedence and explanation debt.                                    | High / Medium         | Phase 12 is grants-only above the floor; AWS emphasizes understanding all additive paths.                         | Preserve additive union; change the membership/group or use a direct exception.            | “D39 MUST NOT introduce per-member deny, mute, exclusion, or source-priority semantics.”                                                           |

### 4. Edge cases

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                                                      | Severity / likelihood | Evidence / effect on answer                                                               | Permanent fix / prevention                                                                                              | Exact language                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Direct plus several groups, exact expiry, assignment suspension/end, Party merge, group archive, delegation end, rename, rehire, final-holder removal, and active D37 can produce contradictory outcomes. | High / High aggregate | All follow naturally from additive access and Core's multi-Tenant Party/assignment model. | Define current validity per edge, deduplicate assignment outcome, and make every terminal transition non-resurrecting.  | “Every path MUST be evaluated independently; one assignment is effective iff at least one complete current path survives all assignment, delegation, expiry, floor, and epoch checks.” |
| Pending/eligible membership could become active later without a new protected review.                                                                                                                     | Critical / Medium     | Entra separates assigned/static and eligible activation; D38 adds no local PIM.           | D38 groups admit current manually assigned staff only; any activation is a newly reviewed protected membership command. | “No pending, eligible, invited, restored, imported, or externally synchronized membership may silently become an effective D38 path.”                                                  |

### 5. Footguns

**Material concern exists.**

| What could go wrong / why it matters                                                                                                 | Severity / likelihood              | Evidence / effect on answer                                                                                | Permanent fix / prevention                                                                                                               | Exact language                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| An ordinary group owner could add self or an accomplice and indirectly grant an organization-wide operation without grant authority. | Critical / High under naive groups | Microsoft identifies this exact escalation hazard for role-bearing groups. It materially changes Option 1. | Protected group; separate exact-scope membership operation; live bundle ceiling; same-Party self check; audit.                           | “Group ownership, generic group editing, D38 possession, and role labels MUST NOT authorize D38-bearing membership mutation.” |
| Attaching D38 to an existing large group could grant every member with one innocuous switch.                                         | Critical / Medium                  | Group permissions are additive by design; current Teams UI uses a small generic select.                    | No switch or generic ladder; exact current member impact, newly gaining/retaining counts, non-effects, reason, and durable confirmation. | “Capability-to-group review MUST disclose the complete deduplicated current member consequence before commit.”                |
| Removing one person from a group only to remove D38 also removes every other group capability.                                       | High / High enough to design       | Group membership is a bundle relationship.                                                                 | Full-bundle review and no fake one-capability membership action.                                                                         | “Membership review MUST enumerate every capability gained or lost and MUST label the command Add/Remove member.”              |

### 6. Tenant safety

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                             | Severity / likelihood                         | Evidence / effect on answer                                                                                                    | Permanent fix / prevention                                                                                                 | Exact language                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| A cross-Tenant assignment, group, grantor, capability, delegation, cache key, or receipt could leak staff rosters or confer authority into another organization. | Critical / Medium without structural controls | Current membership RLS has known MVP hazards; Phase 12 requires branded Tenant context and unrepresentable cross-Tenant edges. | Tenant NOT NULL, composite same-Tenant FKs, one server-derived Tenant context, runtime brand verification, uniform denial. | “Every direct/group/membership/provenance relation MUST be same-Tenant by composite relationship; no caller or mutable default selects Tenant.” |
| One human serving several Tenants could receive a person-global group grant.                                                                                     | Critical / Medium                             | Phase 12 defines exact Active Tenant Assignment precisely to prevent this.                                                     | Bind every human edge and holder count to assignment ID, never Party/profile/user.                                         | “D39 authority MUST be resolved within exactly one Active Tenant Assignment and MUST NOT union a person's Tenants.”                             |

### 7. Database, RLS, and authorization safety

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                       | Severity / likelihood              | Evidence / effect on answer                                                                                         | Permanent fix / prevention                                                                                                                    | Exact language                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `USING` without `WITH CHECK`, mutable scope columns, broad browser/service grants, owner bypass, or a cascading assignment delete could move/erase/grant a forbidden path. | Critical / High if copied from MVP | PostgreSQL documents separate old/new-row checks and owner/BYPASSRLS bypass. Current membership schema is MVP-only. | Forced RLS, operation-specific policies, no browser writes, hardened sole function, immutable keys, restrictive lifecycle, privileged parity. | “Every authorization relation MUST ENABLE and FORCE RLS; every mutation MUST apply correct USING and WITH CHECK semantics; direct writes and scope-moving updates are revoked.” |
| Weak polymorphic subject columns could accept a group/person class with no enforceable FK.                                                                                 | Critical / Medium                  | D39 needs two source kinds with different integrity constraints.                                                    | Strongly typed assignment and group relations or an equivalently constraint-complete design; no nullable caller-tagged polymorphism.          | “The database MUST make wrong-subject-kind and cross-Tenant edges unrepresentable, not merely reject them in UI convention.”                                                    |
| Expiry in a mutable row or `now()` partial-index predicate could drift from history or fail planner rules.                                                                 | High / Medium                      | PostgreSQL index predicates cannot safely model moving current time; D38 requires append-only duration history.     | Immutable/successor heads, server-clock predicate, indexes on status/expiry values rather than time-now truth.                                | “Expiry authority MUST be evaluated at request/commit time from durable instants and MUST NOT depend on a timer or moving-time partial index.”                                  |

### 8. Overengineering

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                        | Severity / likelihood | Evidence / effect on answer                                                                                          | Permanent fix / prevention                                                                                   | Exact language                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| D39 could grow nested/dynamic groups, a Website PIM, approval graph, holder cap, per-member exceptions, external IdP sync, or a new task/reminder workflow. | Medium / Medium       | Entra's full PIM is more machinery than D38 needs; Phase 12 already owns governance and D38 rejects local machinery. | Flat/manual group, standard Phase 12 quorum/SoD, central source edges, no speculative features.              | “D39 MUST reuse Phase 12 and MUST NOT add local PIM, nesting, dynamic rules, synchronization, approval, notification, task, or exception machinery.” |
| One giant atomic wizard for creating a group, adding members, granting D38, and starting D37 could introduce complex rollback and hidden state.             | High / Medium         | Each concern has a distinct owner and authorization boundary.                                                        | Safe sequential governed commands with durable receipts; incomplete configuration grants nothing unintended. | “Group creation, capability assignment, membership, and D37 application remain distinct source-owned commands.”                                      |

### 9. UX/UI and user friction

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                     | Severity / likelihood                        | Evidence / effect on answer                                                                                   | Permanent fix / prevention                                                                                                         | Exact language                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Showing two duplicate capability rows, IAM jargon, an ambiguous source dropdown, or false revoke copy makes access impossible to reason about.           | High / High                                  | AWS requires reviewers to understand all contributing policies; current Core Teams UI has no provenance.      | One capability, plain-language source list, contextual person/group entry points, post-change server truth.                        | “People & access and My Access MUST render D38 once and list every authorized source as Granted directly or Through [group].”                    |
| A wide permission matrix, nested Sheet/modal, small controls, transient toast, or color-only state fails mobile, low-bandwidth, and accessibility needs. | High / High if copied from current prototype | Current Teams controls include 28–32px targets and nested-sheet risk; WAI-ARIA requires correct dialog focus. | Base Maia semantic components, 44px controls, persistent route/receipt, responsive list, complete keyboard/screen-reader behavior. | “Every D39 review/result MUST remain usable at 320px/400%, by keyboard/screen reader, in forced colors/reduced motion, and after response loss.” |
| Group-only language could make a one-person ministry create an artificial team.                                                                          | Medium / High                                | Product direction explicitly preserves Tenant flexibility.                                                    | Direct grant remains discoverable on person detail; group appears only as an optional access-management path.                      | “Core MUST NOT require an Access group to grant one person D38.”                                                                                 |

### 10. Source of truth, ownership, and domain invariants

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                          | Severity / likelihood | Evidence / effect on answer                                                              | Permanent fix / prevention                                                                                 | Exact language                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 12 edges, a holder Boolean, group member count, cache, Website action, Teams row, and future Tasks Hub item could all be treated as writable authority. | Critical / High       | D38/Phase 12 split registry, grants, EffectiveAccess, and Website application ownership. | Publish ownership map; prohibit reverse writes; derive holders/provenance from current resolver inputs.    | “Phase 12 owns source edges and EffectiveAccess; Website owns D37; every UI/task/cache/notification is a non-authoritative projection.” |
| Cardinality and terminal-state rules could remain convention-only.                                                                                            | High / Medium         | Additive overlap naturally creates duplicates and resurrection risk.                     | Unique current semantic edges, immutable identities, terminal successor lineage, explicit dedup invariant. | “Invalid duplicate, cross-kind, moved-scope, or resurrected source states MUST be database-impossible or sole-command impossible.”      |

### 11. Hidden coupling

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                  | Severity / likelihood | Evidence / effect on answer                                                                        | Permanent fix / prevention                                                              | Exact language                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Collaboration Teams, Content/Web Studio, coordinators, Mobilize, source work, Tasks Hub, job titles, or external directory groups could silently feed D38 membership. | High / Medium         | Current product uses Team language broadly; D38 explicitly separates policy/source/task authority. | One Phase 12 staff access-group type; source systems may project tasks but never grant. | “Only an explicit Phase 12 authorization group edge may contribute D38; no operational or display grouping implies membership.”          |
| Group revocation could stop D37 by group identity instead of the initiator's final current authority.                                                                 | Critical / Medium     | D37 is authorized per current holder and epoch, not by group.                                      | Recompute exact initiator's EffectiveAccess; fence only after final path loss.          | “D37 MUST NOT couple continuation to a particular group or direct edge; it checks current D38 EffectiveAccess at each protected commit.” |

### 12. Failure modes

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                   | Severity / likelihood | Evidence / effect on answer                                                              | Permanent fix / prevention                                                                                    | Exact language                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Edge state could commit while audit, receipt, or epoch fails; a lost response could trigger a blind duplicate grant; an async projection could authorize stale access. | Critical / Medium     | Phase 12's sole mutation and D38 receipt/epoch rules exist to prevent partial authority. | One database transaction, semantic idempotency, durable receipt lookup, projection-as-nonauthority.           | “State, audit, receipt, and exactly one epoch advance MUST commit atomically or not at all; a derived projection failure MUST fail safe.” |
| Capability attach can succeed while group impact computation fails or becomes stale.                                                                                   | High / Medium         | Group change affects N members and can race membership changes.                          | Bind review to capability and membership-cohort heads; recompute set-wise under lock; conflict without write. | “A capability-to-group commit MUST reject any changed relevant group or membership head and return current review state.”                 |
| Revocation after a D37 authoritative write but before its derived effect can create ambiguous recovery.                                                                | High / Medium         | D37 owns committed source history and derived projections.                               | Commit-time epoch fence; durable D37 receipt; roll forward derived work from committed truth.                 | “Revocation MUST stop uncommitted source effects, preserve committed effects, and leave replay/reconciliation to the D37 receipt.”        |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                                                        | Severity / likelihood           | Evidence / effect on answer                                                                                         | Permanent fix / prevention                                                                                                    | Exact language                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Group attach can race member add, direct revoke can race group add, offboarding can race membership, and expiry can occur during confirmation. Two individually valid actions could jointly over-authorize. | Critical / High enough to prove | Phase 12 mandates one grant-state lock and monotonic epoch; PostgreSQL transactions alone do not supply domain CAS. | Document lock order, relevant heads, current reproof, post-change resolution, and one winner.                                 | “Every competing source mutation MUST serialize through one lock/CAS boundary and MUST re-prove final EffectiveAccess before receipt.” |
| A replay with changed subject, source kind, duration, reason, or head could overwrite a previous effect.                                                                                                    | High / Medium                   | D38 requires semantic rather than transport-only idempotency.                                                       | Business-effect identity includes Tenant, command kind, source target, capability, duration, reason hash, and expected heads. | “Exact replay returns the original receipt; reused identity with changed semantic intent conflicts and never mutates prior state.”     |
| Earliest expiry or delegation end could be ignored until a sweep.                                                                                                                                           | Critical / Medium               | OWASP requires current authorization on every request.                                                              | Resolver and protected commit compare all current instants synchronously; sweep only repairs projections.                     | “No timer, queue, worker, or cached status is required for expiry or delegation loss to deny.”                                         |

### 14. Data integrity risks

**Material concern exists.**

| What could go wrong / why it matters                                                                                                              | Severity / likelihood | Evidence / effect on answer                                              | Permanent fix / prevention                                                                                                 | Exact language                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Duplicate current edges, dangling group/assignment links, terminal-row reuse, or cascade deletion can corrupt holder counts and historical proof. | High / Medium         | Current MVP membership cascades; D38 requires durable source lineage.    | Composite FKs, current-edge uniqueness, restrictive deletion, immutable terminal states, successor chains, reconciliation. | “Every effective path MUST resolve through one constraint-valid current edge chain; ordinary lifecycle MUST NOT delete or reactivate history.” |
| Group label/key changes or Party merge could silently move authorization.                                                                         | High / Medium         | Names never authorize; assignment IDs, not Party identity, carry access. | Immutable internal IDs; explicit merge/offboard policy; no grant transfer.                                                 | “Rename and Party merge MUST NOT union, transfer, discard, or revive D39 source edges.”                                                        |
| Client or cached holder counts could drift from current expiry/group/direct truth.                                                                | High / High           | EffectiveAccess is derived over several independent paths.               | Count deduplicated assignments from current authoritative inputs; compare projection in reconciliation.                    | “No persisted is-holder Boolean or raw row/member count may authorize or report D38 without current resolution.”                               |

### 15. Security and privacy risks

**Material concern exists.**

| What could go wrong / why it matters                                                                                             | Severity / likelihood                      | Evidence / effect on answer                                                             | Permanent fix / prevention                                                                                            | Exact language                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Membership management can become indirect grant administration and self-escalation.                                              | Critical / High under naive implementation | Entra documents the same attack and restricts protected groups.                         | Exact protected group scope, bundle ceiling/revision, same-Party self guard, SoD, current audit.                      | “No membership addition, activation, or renewal may confer a capability outside the actor's current protected-group administrative ceiling.”             |
| Holder lists, group names, reasons, history, or active D37 status can expose staff responsibility or sensitive ministry context. | High / Medium                              | D38 limits access-management disclosure and treats reasons as minimized audit evidence. | Purpose-limited projections, no D38-holder roster access, bounded non-sensitive reasons, minimal D37 consequence.     | “Only authorized governance actors may enumerate holders/provenance; D38 possession exposes only the subject's own safe access explanation.”             |
| Logs, errors, exports, AI, analytics, backups, or generated documents can retain grant reasons or membership data beyond need.   | High / Medium                              | Phase 12 treats authorization history separately from ordinary logs.                    | Identifiers/minimized events, scrub telemetry, governed retention/export, lawful anonymization without erasing audit. | “Authorization evidence MUST stay in governed audit storage and MUST NOT be copied into general logs, tasks, prompts, documents, or analytics payloads.” |

### 16. Scalability and performance risks

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                                   | Severity / likelihood | Evidence / effect on answer                                                                                | Permanent fix / prevention                                                                                | Exact language                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Attaching/removing D38 from a large group could synchronously write one grant, audit, epoch, cache invalidation, or notification per member, causing lock storms and partial rollback. | High / Medium         | Phase 12 explicitly rejects per-principal transactional fan-out and uses one Tenant epoch.                 | O(1) authoritative edge/head write, one epoch, set-based impact projection, async idempotent derivatives. | “Group authority mutation MUST NOT materialize N per-member authoritative rows or depend on N downstream effects.” |
| Resolver or explanation could execute one query per group/member or scan audit history.                                                                                                | High / Medium         | Direct plus multi-group paths need efficient unions; Phase 12 sets a one-governance-SELECT logical budget. | Covering indexes, one set-based union/dedup query, paginated holder/member views, plan regression proof.  | “Current D39 resolution MUST remain within Phase 12's governance query budget independent of group cardinality.”   |
| An arbitrary holder/group cap could be frozen without product evidence.                                                                                                                | Medium / Medium       | No validated ministry scale data exists.                                                                   | Define complexity/query bounds, not speculative product limits; gather real evidence later.               | “D39 MUST NOT invent a holder or group-size cap without a measured safety, performance, or product requirement.”   |

### 17. Operational burden

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                                      | Severity / likelihood | Evidence / effect on answer                                                                                 | Permanent fix / prevention                                                                                    | Exact language                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Group-only requires needless setup for a one-person ministry; direct-only requires repetitive changes for larger stable teams. Excessive ceremony leads staff to broaden unrelated roles. | Medium / High         | Google/AWS distinguish specific direct cases from scalable groups; Phase 12 is quorum-aware for small orgs. | Preserve both optional paths; no group required; protected group reuses central governance.                   | “A one-person Tenant can grant directly without creating a group; a stable team can use one protected group without person-by-person D38 grants.”                        |
| A group widening could strand all membership managers and require SQL/support.                                                                                                            | High / Medium         | Protected ceilings correctly fail closed but need recoverable Tenant governance.                            | Pre-commit warning, current grant-manager recovery, Phase 12 sole-admin/quorum path, no D39 support backdoor. | “Widening review MUST disclose administrators losing add/activate authority; authorized Phase 12 governance MUST be able to reauthorize without direct database repair.” |
| Expired/delegation-inert edges could accumulate silently.                                                                                                                                 | Medium / Medium       | Expiry authority is synchronous but history/projections still need reconciliation.                          | Indexed reconciliation and visible history; never recurring manual cleanup for correctness.                   | “Reconciliation may report inert/orphaned edges, but correctness MUST NOT depend on manual cleanup.”                                                                     |

### 18. Observability and auditability gaps

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                        | Severity / likelihood    | Evidence / effect on answer                                                               | Permanent fix / prevention                                                                                                                                          | Exact language                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Audit could record only “Jordan has D38,” losing whether a grant manager attached capability, a membership manager added Jordan, and which delegation authorized each edge. | High / High if flattened | AWS stresses inspecting all applicable paths; Phase 12 requires access-governing history. | Audit each edge independently with actual/acting actors, authority/delegation, before/after heads, bundle revision, reason/duration, deduplicated outcome, receipt. | “Audit MUST reconstruct every source edge and the exact post-change EffectiveAccess consequence without treating derived holder state as the write history.” |
| Technical logs could exist while staff cannot explain why access remains after revoke.                                                                                      | High / Medium            | D38 requires durable business receipts and user-visible provenance.                       | Route-addressable receipt plus authorized access history and My Access explanation.                                                                                 | “Operational traces do not replace durable governance history or the subject's safe current provenance.”                                                     |
| Reconciliation might report zero checked pairs/sources as success.                                                                                                          | High / Medium            | Phase 12 SoD scans require coverage statements.                                           | Emit evaluated source/edge/SoD coverage, not only failures.                                                                                                         | “Every D39 reconciliation run MUST record how many Tenants, groups, edges, holders, and protected checks it evaluated.”                                      |

### 19. Dependency and integration risks

**Material concern exists.**

| What could go wrong / why it matters                                                                                    | Severity / likelihood   | Evidence / effect on answer                                                                          | Permanent fix / prevention                                                                                                  | Exact language                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| IdP/SCIM/dynamic groups, vendor webhooks, or external role claims could add members outside the protected Core command. | Critical / Medium later | Phase 12 makes SSO/SCIM seam-only; Entra warns dynamic membership is unsafe for role-bearing groups. | Keep D39 membership Core-manual/static; external mappings inert until a later governed contract re-proves every edge.       | “No external directory, JWT claim, webhook, plugin, or imported group may become a D38 source in D39.”                         |
| Inngest, Realtime, TanStack cache, or a worker could delay or manufacture access.                                       | High / Medium           | D38 explicitly excludes async authorization ownership.                                               | Synchronous DB authority; identifier-only derived events; fire-time re-resolution.                                          | “External and asynchronous systems may observe source identifiers but never decide, advance, expire, or revive D39 authority.” |
| Provider/API changes could alter group identifiers or membership ordering.                                              | High / Low in v1        | D39 rejects external group sources; internal IDs are authoritative.                                  | No vendor dependence in v1; later adapter must map into new reviewed commands, never reuse external ID as Tenant authority. | “Core remains conflict winner for D39 source edges.”                                                                           |

### 20. Migration, rollout, and upgrade risks

**Material concern exists.**

| What could go wrong / why it matters                                                                                                   | Severity / likelihood                 | Evidence / effect on answer                                                     | Permanent fix / prevention                                                                                                                          | Exact language                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Current Team seeds, Owner/Admin/Web Studio labels, historical tasks, or old memberships could be inferred into direct/group D38 paths. | Critical / High without explicit rule | Current Teams are hard-coded demos and current staff roles are broad MVP.       | Migrate to zero; produce evidence report; infer nothing; enable writers last.                                                                       | “No existing repository row, seed, role, Team, task, setting, or history creates a D39 edge.”                                        |
| Old code/new schema may ignore protected status or unknown source states; rollback after writes could delete or reinterpret history.   | High / Medium                         | D39 adds source kinds and group protection to a non-implemented Phase 12 spine. | Additive schema, deny-unknown readers, registry/PEP first, source writers last, kill switch denies exercise/new writes, rollback preserves history. | “Mixed-version unknowns fail closed; rollback never drops, rewrites, or broadens already-written D39 evidence.”                      |
| Group path might ship before provenance and ceiling UX, leaving a hidden escalation window.                                            | Critical / Medium                     | Group is strictly riskier than direct if unprotected.                           | Separate release gate for protected group writer; direct may not be used as evidence that group proof passed.                                       | “D39 is not release-complete until both source paths and every protected-group proof pass; an unsafe group writer remains disabled.” |

### 21. Testability, traceability, and proof

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                    | Severity / likelihood | Evidence / effect on answer                                                               | Permanent fix / prevention                                                                                                   | Exact language                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tests may assert a visible button or grant row while ordinary group admins, cross-Tenant IDs, stale bundles, owner bypass, overlap, expiry, and D37 races remain wrong. | Critical / High       | Current broad role code makes superficial positive tests misleading.                      | Reference-model positive/negative/poison/concurrency/temporal/migration/a11y/production-shaped tests at public PEP/UX seams. | “Release evidence MUST prove user-visible and EffectiveAccess outcomes through every direct, group, privileged, and failure path—not implementation rows.”                     |
| D39 terms or invariants may diverge across Grill answer, glossary, ADR, Phase 12, OpenSpec, design, tasks, tickets, tests, and release evidence.                        | High / Medium         | D38 already spans Phase 12 and Phase 24; D39 changes both grant and membership semantics. | One traceability matrix and exact identifiers/terms/counts; fail review on contradiction.                                    | “Direct assignment source, protected authorization group, assignable-capability ceiling, source removal, and final-path fence MUST trace consistently through every artifact.” |
| No representative group/overlap scale could be tested.                                                                                                                  | High / Medium         | No product count is known, but query complexity is knowable.                              | Test supported Tenant-size fixtures and query-count/plan bounds; do not claim unmeasured latency.                            | “Performance proof MUST include production-shaped multi-group overlap without N+1 or synchronous member fan-out.”                                                              |

### 22. Other development hazards

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                         | Severity / likelihood                     | Evidence / effect on answer                                                                      | Permanent fix / prevention                                                                                               | Exact language                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An overlapping direct source can become a quiet persistence backdoor after group removal, yet blocking every overlap can make deliberate handoff impossible. | High / Medium                             | Additive IAM permits overlap; D40 now selects a current-source-first deliberate continuity flow. | Ordinary direct creation stays unavailable during overlap; only D40's exact reviewed source-proof command may create it. | “When current group-derived D38 exists, Core MAY add one separate direct grant only through D40's fresh-reason, independent-duration, exact-source-set review.” |
| Access-group terminology could be conflated with work teams, reviewers, coordinators, or Tasks Hub assignment.                                               | High / High in current product vocabulary | Current route is Teams & Users; Phase 12 intends groups and D38 separates work routing.          | Use Access group in product, stable Phase 12 term in domain, explicit non-effects.                                       | “An Access group is an authorization bundle only; it does not assign tasks, review responsibility, source work, or coordination.”                               |
| Product analytics could rank staff or Tenants by privileged-group membership.                                                                                | Medium / Low but harmful                  | D38 forbids employee scoring and holder noise.                                                   | Security/operations telemetry only, minimized and access-controlled.                                                     | “D39 holder, source, reason, and group data MUST NOT become staff performance, readiness, engagement, or ministry-health scoring.”                              |

## Acceptance criteria

### Registry, source model, and defaults

- **D39-AC001:** The Phase 12 registry admits D38 through a typed direct Active
  Tenant Assignment source and a typed group-capability source.
- **D39-AC002:** No role, module rung, task, Website table, policy, source,
  coordinator, Team, external group, or cache is an admitted D38 source.
- **D39-AC003:** A direct D38 source uses the central assignment-capability
  relation and cannot be stored as a restricted-record named-person grant.
- **D39-AC004:** A group-derived path requires both one current D38 group-
  capability edge and one current assignment membership edge.
- **D39-AC005:** Both source kinds enter the same `resolveProjection` call and
  cannot invoke a second D39/Website resolver.
- **D39-AC006:** The subtract-only floor can remove D38 regardless of how many
  direct or group paths contribute it.
- **D39-AC007:** A new Tenant has zero D38 direct edges, group edges, members,
  and effective holders.
- **D39-AC008:** No migration, seed, Owner/Admin role, Web Studio group, Teams
  demo, setting, task, or history infers a D39 source.
- **D39-AC009:** An unknown source kind, membership state, capability
  classification, or bundle revision resolves deny and blocks mutation.
- **D39-AC010:** The capability remains labeled **Apply Website recovery
  settings to current work** and remains outside the module ladder.

### Subject and Tenant eligibility

- **D39-AC011:** An exact current active same-Tenant staff Active Tenant
  Assignment is eligible for a direct D38 source.
- **D39-AC012:** Only an exact current active same-Tenant staff Active Tenant
  Assignment can become an effective group member for D38.
- **D39-AC013:** Pending, invited, inactive, ended, expired, or wrong-Tenant
  assignments cannot receive an effective direct or group path.
- **D39-AC014:** Donor, missionary, public, external reviewer, support operator,
  service, AI, API-key, and other non-human principals are ineligible.
- **D39-AC015:** Ending and recreating a person's assignment produces a new ID
  that inherits no direct or membership edge.
- **D39-AC016:** Suspending or freezing an assignment resolves every D39 path to
  zero immediately.
- **D39-AC017:** Restoring the same assignment observes only still-current,
  unexpired, non-revoked source edges.
- **D39-AC018:** Party merge neither unions, transfers, discards, nor revives
  D39 source edges.
- **D39-AC019:** Cross-Tenant group, assignment, grantor, delegation, capability,
  receipt, or source identifiers fail uniformly and write nothing.
- **D39-AC020:** Holder identity and count deduplicate by Active Tenant
  Assignment, never Party, profile, user, email, display name, or raw row.

### Grant and membership administration

- **D39-AC021:** A current same-Tenant `permissions.manage_grants` actor within
  administrative scope/ceiling may review and grant a direct source.
- **D39-AC022:** The same operation and ceiling are required to attach, renew,
  or remove D38 on a group.
- **D39-AC023:** D38 possession without `permissions.manage_grants` cannot
  create, renew, or remove a capability edge.
- **D39-AC024:** `permissions.manage_grants` alone cannot add, activate, renew,
  remove, or expire a group member.
- **D39-AC025:** Group membership addition, activation, or renewal requires
  current `permissions.manage_membership` scoped to the exact group.
- **D39-AC026:** `permissions.manage_membership` cannot attach, renew, or remove
  D38 from the group.
- **D39-AC027:** Generic group ownership, Team administration, role label,
  task administration, or group edit UI cannot mutate a D38-bearing group.
- **D39-AC028:** Member add/activate/renew proves a current administrative
  ceiling covering every capability in the group's current bundle/revision.
- **D39-AC029:** Adding D38 or otherwise widening the bundle invalidates stale
  membership add/activate/renew authority before a new member gains access.
- **D39-AC030:** An assignable-capability ceiling grants no D38 exercise access
  to the administrator merely because it includes D38.
- **D39-AC031:** A membership administrator cannot add, activate, or renew
  their own Party in a protected group.
- **D39-AC032:** The same-Party prohibition holds across alternate auth users,
  profiles, roles, and Tenant assignments.
- **D39-AC033:** A true small-Tenant quorum shortage uses Phase 12's existing
  loud-audit/recovery rule without a D39-specific bypass or hard-coded second
  employee.
- **D39-AC034:** A currently scoped membership manager may remove/expire a
  member when the action only subtracts access even if a later bundle widening
  blocks additions.
- **D39-AC035:** Subtractive removal still enforces Phase 12's last-permissions-
  manager, last-clearance, active-operation, and other global invariants.
- **D39-AC036:** The server derives Tenant, actual/acting actor, actor
  assignment, subject/group, capability, source kind, clock, and attribution.
- **D39-AC037:** Caller-supplied Tenant, actor, role, capability implication,
  effective result, grantor, source, bundle, timestamp, or audit attribution is
  rejected or ignored.
- **D39-AC038:** Owner, table-owner, service-role, RPC, worker, support, repair,
  import, export, cache, Realtime, AI, and Inngest paths cannot bypass the same
  administration proof.
- **D39-AC039:** Candidate search returns only authorized eligible same-Tenant
  assignments/groups and handles duplicate/international names without using
  email as authority.
- **D39-AC040:** An actor without the relevant governance read authority cannot
  enumerate D38 holders, groups, memberships, reasons, histories, or counts.

### Group form, edge integrity, and overlap

- **D39-AC041:** A group carrying D38 is flat, same-Tenant, manually assigned,
  protected, and human-staff-only.
- **D39-AC042:** A nested group cannot be added directly, indirectly, or through
  an import as a member of a D38-bearing group.
- **D39-AC043:** Dynamic/rule-derived membership cannot contribute an effective
  D38 path.
- **D39-AC044:** External IdP, SCIM, CRM, CMS, plugin, or webhook membership
  cannot contribute an effective D38 path.
- **D39-AC045:** A service account, NHI, AI agent, API key, public identity, or
  operator grant cannot become a group member.
- **D39-AC046:** Pending, eligible, invited, restored, or imported membership
  cannot silently activate; activation requires a fresh protected review.
- **D39-AC047:** Attaching D38 to a populated group validates every current
  active member's same-Tenant staff eligibility before commit.
- **D39-AC048:** An empty protected group may carry D38 while producing zero
  effective holders and no warning/noise.
- **D39-AC049:** A group may carry other capabilities, and membership review
  presents the entire current bundle rather than D38 alone.
- **D39-AC050:** No per-member deny, mute, exception, exclusion, or source
  priority can subtract D38 from one group member.
- **D39-AC051:** At most one current direct D38 edge exists for one Tenant/
  assignment semantic source.
- **D39-AC052:** At most one current D38 edge exists for one Tenant/group.
- **D39-AC053:** At most one current membership edge exists for one Tenant/
  group/assignment.
- **D39-AC054:** One assignment may legitimately receive D38 through several
  groups plus a D40-permitted direct source.
- **D39-AC055:** All current direct/group paths yield one D38 capability and
  one deduplicated effective holder.
- **D39-AC056:** Authorized person access detail enumerates every contributing
  path with source type, label, state, duration, and safe provenance.
- **D39-AC057:** Explanation distinguishes active, expiring, expired, revoked,
  suspended, ineligible, archived, and delegation-inert paths without
  treating them all as current.
- **D39-AC058:** Removing a direct path while any valid group path survives
  says the direct source ended and effective access remains.
- **D39-AC059:** Removing group membership while a valid direct or other group
  path survives says the membership ended and effective D38 remains.
- **D39-AC060:** Removing D38 from a group reports exact current counts of
  assignments newly losing access and retaining it through another source.

### Duration, offboarding, and terminal lifecycle

- **D39-AC061:** Removing the final effective D38 path is allowed and produces
  a quiet zero-holder state when every other governance rule passes.
- **D39-AC062:** A direct source becomes ineffective at its authoritative UTC
  expiry instant.
- **D39-AC063:** A group-capability source becomes ineffective for all paths at
  its authoritative UTC expiry instant.
- **D39-AC064:** A membership source becomes ineffective at its authoritative
  UTC expiry instant.
- **D39-AC065:** A group path uses the earliest current capability, membership,
  delegation, assignment, and registry expiry/end instant.
- **D39-AC066:** Expiry denial is correct with all jobs/workers disabled and
  does not wait for a timer, sweep, webhook, or Inngest run.
- **D39-AC067:** Assignment termination makes all its direct and membership
  paths ineffective in the terminating transaction/epoch.
- **D39-AC068:** Group archive makes every group-derived path ineffective while
  retaining complete history.
- **D39-AC069:** Restoring/recreating an archived group does not revive its old
  capability or membership edges.
- **D39-AC070:** Ending a bounded delegation makes only edges dependent solely
  on that delegation inert.
- **D39-AC071:** A Tenant-root governance edge survives the ordinary departure
  of the actor who created it while retaining attribution.
- **D39-AC072:** A revoked, removed, expired, archived, or otherwise terminal
  edge cannot transition back to active; regrant/rejoin creates a successor.
- **D39-AC073:** Group rename/description change affects presentation and audit
  labels only and does not advance or transfer authority.
- **D39-AC074:** A required reason is normalized, bounded, Unicode-safe, and
  stored as governance evidence without protected Website/ministry content.
- **D39-AC075:** Audit records actual/acting actor, authority/delegation,
  source/target, before/after heads, bundle revision, reason/duration, terminal
  cause, deduplicated outcome, epoch, and receipt.

### Concurrency, atomicity, and semantic idempotency

- **D39-AC076:** Every successful direct/group/membership change returns a
  persistent route-addressable durable receipt.
- **D39-AC077:** Exact semantic replay returns the original receipt and creates
  no additional active edge, epoch, or audit effect.
- **D39-AC078:** Reusing an idempotency identity with changed Tenant, command,
  source kind, target, capability, duration, reason, or relevant head conflicts.
- **D39-AC079:** Group capability attach racing member add/activation has one
  serializable order and cannot produce an unreviewed effective member.
- **D39-AC080:** Concurrent grant/revoke or add/remove has one expected-head
  winner and one complete, reconstructible audit history.

- **D39-AC081:** Assignment offboarding racing direct grant or member add has
  one fail-closed result and never leaves an effective ended assignment.
- **D39-AC082:** Expiry at the confirmation/commit boundary is re-evaluated
  using the trusted server clock and cannot create a post-expiry path.
- **D39-AC083:** Capability, group-bundle, membership-cohort, assignment,
  delegation, and protected D37 heads relevant to review are CAS-bound.
- **D39-AC084:** An unrelated Tenant governance change does not force a false
  conflict when current actor authority and every relevant head remain valid.
- **D39-AC085:** Source state, audit, durable receipt, and exactly one Tenant
  authorization-epoch advance commit atomically or not at all.
- **D39-AC086:** A successful authority mutation advances the Tenant epoch
  exactly once; a failed or replayed mutation does not advance it again.
- **D39-AC087:** A group change performs no synchronous per-member grant,
  EffectiveAccess, audit, cache, notification, task, or epoch writes.

### D37 interaction and privacy boundary

- **D39-AC088:** Ending one source while another valid D38 path survives does
  not stop the holder's active D37 application.
- **D39-AC089:** Losing the final valid D38 path fences all later uncommitted
  D37 member effects at commit-time authorization/epoch proof.
- **D39-AC090:** D37 effects committed before final-path loss remain immutable
  and visible through the authorized D37 receipt/result.
- **D39-AC091:** Regrant, rejoin, restore, or a new source never resumes a
  stopped D37 application; a fresh D37 review/application is required.
- **D39-AC092:** Grant/membership review exposes only whether final-path loss
  stops current D37 work, never Website member counts, Sites, titles, contexts,
  recipients, reasons, corrections, tasks, or results.

### UX, accessibility, and truthful communication

- **D39-AC093:** Person detail and My Access render one D38 capability card
  regardless of the number of contributing source paths.
- **D39-AC094:** User-facing provenance uses **Granted directly** and
  **Through [group]** with duration/state, not internal authorization jargon.
- **D39-AC095:** Person detail provides the direct source flow without requiring
  creation or understanding of a group.
- **D39-AC096:** Access-group detail provides capability and membership flows
  without a source-kind switch on every person.
- **D39-AC097:** Attaching/removing D38 on a group displays exact deduplicated
  active, newly gaining/losing, and retaining counts from the current review
  heads.
- **D39-AC098:** Adding/removing/renewing membership displays every capability
  gained/lost plus surviving sources and safe non-effects.
- **D39-AC099:** Capability widening discloses membership administrators whose
  current add/activate authority will become ineligible.
- **D39-AC100:** No one-click **Remove all paths**, one-person group-capability
  removal, or falsely global revoke action exists.
- **D39-AC101:** D38 is not presented as a generic None/View/Manage/Admin
  select, immediate switch, default-checked box, or optimistic state.
- **D39-AC102:** Grant/member/revoke review is one non-nested route or panel
  with Cancel before the precise primary action.
- **D39-AC103:** Success, conflict, failure, expiry, and ineligibility are
  persistent, receipt-backed, and programmatically announced; a toast alone is
  insufficient.
- **D39-AC104:** A lost response/reload resolves current state or the durable
  receipt before any retry and never invites a blind duplicate submit.
- **D39-AC105:** Every important control is at least 44-by-44 CSS pixels with
  visible focus, logical keyboard order, associated labels/errors, and correct
  focus restoration.
- **D39-AC106:** Every D39 flow reflows at 320 CSS pixels and 400-percent zoom,
  has no horizontal permission matrix, and preserves meaning in forced colors
  and reduced motion.
- **D39-AC107:** Dates/times/zones, plural counts, Unicode reasons, long/CJK
  names, RTL/bidirectional content, and duplicate names remain unambiguous and
  accessible.
- **D39-AC108:** Zero sources/holders produces neutral explanatory state and no
  warning, unread, email, task, reminder, SLA, escalation, or health failure.
- **D39-AC109:** D38 holders see only their own safe provenance; other holder
  lists, reasons, histories, or group membership require access-governance
  authority.

### Database, performance, migration, and traceability

- **D39-AC110:** Every direct/group/membership edge uses `tenant_id NOT NULL`
  and same-Tenant composite FKs to group/assignment targets.
- **D39-AC111:** Every authorization relation enables and forces RLS, and
  browser roles have no direct grant/member mutation rights.
- **D39-AC112:** Policies/functions prove operation-correct `USING` and
  `WITH CHECK` behavior for insert/update/delete and resulting scope.
- **D39-AC113:** Tenant, subject, group, capability, source type, grantor,
  delegation, and audit attribution cannot be moved by update.
- **D39-AC114:** Ordinary user/Tenant/group/assignment lifecycle cannot hard-
  delete or cascade-delete source, delegation, audit, or receipt history.
- **D39-AC115:** Indexes support current direct/group resolution, impact,
  expiry/delegation, and provenance without global or audit-history scans.
- **D39-AC116:** Current authorization remains within Phase 12's one-governance-
  SELECT logical budget and group impact uses set-based, paginated operations
  without N+1 behavior.
- **D39-AC117:** Migration produces zero D38 direct/group/member sources and a
  per-Tenant no-inference evidence report.
- **D39-AC118:** Mixed-version or rollback readers deny unknown source/protected
  states, preserve history, and never broaden from a stale group/member model.
- **D39-AC119:** D39 terms, requirements, invariants, source IDs, and outcomes
  trace consistently through the Grill log, glossary, ADR-0184, Phase 12,
  Phase 24, OpenSpec, design, tasks, tickets, tests, and release evidence.
- **D39-AC120:** D39 remains Reserved until D38–D40, Phase 12/OpenSpec,
  positive/negative/poison/concurrency/temporal/migration/a11y/production-
  shaped tests, and release monitors all agree.

## Named monitors

| Signal                                                                    |                                                                    Threshold | Owner                 | Required response                                                                                       |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------: | --------------------- | ------------------------------------------------------------------------------------------------------- |
| `website_recovery_d39_group_capability_write_without_manage_grants_total` |                                                                          Any | Security              | P0 contain writer, make unauthorized edge inert, preserve evidence, inspect every affected path.        |
| `website_recovery_d39_membership_write_without_manage_membership_total`   |                                                                          Any | Security              | P0 contain writer, remove unauthorized membership effect, inspect actor scope and affected holders.     |
| `website_recovery_d39_protected_ceiling_violation_total`                  |                                                                          Any | IAM Platform          | Disable widening membership writer, make violating paths inert, repair administrative delegation heads. |
| `website_recovery_d39_same_party_self_gain_total`                         |                                                                          Any | Security              | P0 revoke, freeze failing path, audit all alternate hats/assignments.                                   |
| `website_recovery_d39_cross_tenant_edge_total`                            |                                                                          Any | Security + Database   | P0 Tenant-isolation response, block affected path/Tenant, repair constraints/RLS, review exposure.      |
| `website_recovery_d39_forbidden_group_source_total`                       |                                         Any nested/dynamic/external/NHI path | IAM Platform          | Deny/remove path, disable integration/import route, block expansion.                                    |
| `website_recovery_d39_latent_autoactivation_total`                        |                                                                          Any | IAM Platform          | Revoke path and disable activation mechanism until protected review is proven.                          |
| `website_recovery_d39_unexplained_holder_total`                           |                               Any current holder without complete provenance | IAM Platform          | Fail closed for holder, rebuild source explanation, inspect resolver/reference model.                   |
| `website_recovery_d39_holder_count_mismatch_total`                        | Any raw/projection count differing from deduplicated current EffectiveAccess | IAM + Data            | Hide count, recompute from PDP, repair projection and every affected receipt.                           |
| `website_recovery_d39_false_full_revoke_receipt_total`                    |                                                                          Any | Product + IAM         | Correct durable result, preserve actual authority, pause UX rollout, inspect related receipts.          |
| `website_recovery_d39_surviving_path_wrongly_fenced_total`                |                                                                          Any | Website + IAM         | Stop expansion, repair final-path check, recover only through D37's safe receipt contract.              |
| `website_recovery_d39_final_loss_post_epoch_commit_total`                 |                                                  Any later D37 source commit | Security + Website    | P0 contain application, inspect committed effects, repair commit-time epoch predicate.                  |
| `website_recovery_d39_duplicate_direct_edge_total`                        |                                                        Any current duplicate | Data Platform         | Make duplicate inert, repair uniqueness/idempotency, reconcile holder explanations.                     |
| `website_recovery_d39_duplicate_membership_edge_total`                    |                                                        Any current duplicate | Data Platform         | Make duplicate inert, repair membership head and dependent provenance.                                  |
| `website_recovery_d39_duplicate_group_capability_edge_total`              |                                                        Any current duplicate | Data Platform         | Make duplicate inert, repair group-capability head and receipts.                                        |
| `website_recovery_d39_expired_edge_effective_total`                       |                                     Any access at/after authoritative expiry | Security + IAM        | P0 deny, invalidate cache/tokens, inspect clock/expiry predicate.                                       |
| `website_recovery_d39_ended_assignment_effective_total`                   |                                                                          Any | Security              | P0 revoke/session fence, inspect assignment/offboarding/deferred paths.                                 |
| `website_recovery_d39_archived_group_effective_total`                     |                                                                          Any | IAM Platform          | Deny group paths, repair lifecycle transition, review restoration behavior.                             |
| `website_recovery_d39_partial_commit_total`                               |                              Any missing state/audit/epoch/receipt component | Database + IAM        | Stop writers, reconcile transaction evidence, roll forward atomically.                                  |
| `website_recovery_d39_epoch_advance_mismatch_total`                       |                          Any successful mutation with other than one advance | IAM Platform          | Disable writers/cache use, repair transaction and affected projections.                                 |
| `website_recovery_d39_stale_relevant_head_commit_total`                   |                                                                          Any | IAM Platform          | Make result inert, repair CAS/lock order, require fresh review.                                         |
| `website_recovery_d39_resolution_query_budget_violation_total`            |        Any resolver exceeding Phase 12's one governance SELECT logical bound | IAM + Database        | Block performance release, remove N+1/audit scan, re-prove query plan.                                  |
| `website_recovery_d39_sync_member_fanout_total`                           |                        Any group mutation writing per-member authority state | IAM Platform          | Stop writer, replace with one edge/head plus epoch, reconcile partial derivatives.                      |
| `website_recovery_d39_managed_realtime_revocation_lag_seconds`            |                                                              Greater than 60 | SRE + IAM             | Force-close affected streams, invalidate tokens, investigate epoch propagation.                         |
| `website_recovery_d39_nonrealtime_revocation_lag_total`                   |                                            Any observable post-commit access | Security + IAM        | P0 contain, invalidate cache/session, inspect every PEP.                                                |
| `website_recovery_d39_rls_contract_drift_total`                           |                 Any required table missing ENABLE/FORCE/correct policy/grant | Database Security     | Block deploy, restore policy baseline, inspect privileged access.                                       |
| `website_recovery_d39_privileged_path_parity_failure_total`               |                                                                          Any | Security              | Disable failing RPC/worker/service path until product-rule parity passes.                               |
| `website_recovery_d39_hard_deleted_history_total`                         |                                                                          Any | Compliance + Database | Stop deletion, recover evidence where lawful/possible, repair FKs/retention.                            |
| `website_recovery_d39_inferred_or_seeded_source_total`                    |                                                                          Any | IAM + Product         | Make inferred edge inert, halt migration/rollout, audit all Tenants.                                    |
| `website_recovery_d39_zero_holder_noise_total`                            |                         Any D39-caused unread/task/email/reminder/escalation | Product               | Remove generated effect, repair quiet-state rule, review affected users.                                |
| `website_recovery_d39_unauthorized_roster_or_reason_read_total`           |                                                                          Any | Privacy + Security    | Contain disclosure, preserve/read audit, notify governance owner, repair projection.                    |
| `website_recovery_d39_accessibility_release_blocker_total`                |                     Any critical keyboard/screen-reader/reflow/status defect | Product Design        | Block release until manual and automated accessibility proof passes.                                    |

### Monitor-only hypotheses

No correctness, authorization, privacy, data-integrity, or recovery requirement
is relegated to monitoring. Only these product hypotheses may be monitored:

- **Source comprehension:** signal
  `website_recovery_d39_source_comprehension_support_rate`; threshold greater
  than 5 support cases per 100 D39 changes over 30 days with at least 100
  changes; owner Product Design + Support; response run focused usability
  research and revise labels/placement without changing authority.
- **Protected-review friction:** signal
  `website_recovery_d39_review_abandonment_rate`; threshold greater than 20%
  over 30 days with at least 100 eligible review starts, excluding authorization
  loss/conflict; owner IAM UX; response inspect copy, loading, mobile, and
  reason validation while preserving every safety proof.
- **Relevant-head contention:** signal
  `website_recovery_d39_stale_review_conflict_rate`; threshold greater than 5%
  over 15 minutes with at least 100 confirmations; owner IAM Platform; response
  inspect aggregate-head granularity/lock contention and pause expansion rather
  than weakening current reproof.

## Ruthless synthesis

### Must be resolved before this answer is recorded

1. Record the hybrid as direct plus **protected** group assignment, not generic
   team membership.
2. Preserve split `manage_grants`/`manage_membership` operations.
3. Define the live protected-group administrative ceiling and bundle revision.
4. Distinguish administrative assignable ceiling from exercise EffectiveAccess.
5. Name the typed central `assignment_capability_grants` relation and keep it
   distinct from record-scoped `named_person_grant`.
6. State that only final post-change EffectiveAccess loss fences D37.
7. Resolve overlapping direct creation only through D40's deliberate
   continuity-source command and apply D41's current-direct/historical-origin
   presentation split; D42 separately governs historical-detail visibility.

These pre-recording requirements are now reflected in the corrected D39
decision and [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md).

### Must be captured in specification and design

1. Direct/group cardinality, validity, expiry, provenance, archive, and
   terminal-state invariants.
2. Same-Party self/SoD and quorum-aware small-Tenant behavior.
3. Full-bundle membership review and complete group-member consequence review.
4. Administrative ceiling invalidation when a bundle widens.
5. People & access, Access groups, person access, My Access, source labels,
   quiet zero, conflict, expiry, and lost-response UX.
6. Group archive/no-resurrection and assignment offboarding behavior.
7. D37 final-path fence and privacy-minimized revoke consequence.
8. Schema/RLS/grants/index/retention/privileged-path contract.
9. Accessibility, localization, international names, time zones, mobile, and
   low-bandwidth behavior.
10. D40's immutable overlap basis, unchanged-current-ability receipt, and
    current-source-first UX.

### Required implementation safeguards and order

1. Reconcile Phase 12, ADR-0184, OpenSpec, glossary, and Phase 24 terms.
2. Land registry/source typing and deny-unknown resolver/reference model.
3. Land strongly typed same-Tenant assignment/group/membership schema,
   terminal history, indexes, forced RLS, least grants, and locked command.
4. Land administrative ceilings, bundle revisions, self/SoD/quorum, and
   current explanation projections.
5. Land direct-source positive/negative/poison/concurrency proof.
6. Land protected group-source and membership proof independently; do not infer
   completion from direct-source tests.
7. Land D37 commit-time final-path fence and safe consequence projection.
8. Land People & access/My Access read models, then accessible review/receipt
   UX.
9. Migrate every Tenant to zero D39 sources; shadow resolution and infer
   nothing.
10. Canary writes only after direct and protected-group paths, privileged
    doors, disabled-worker expiry, and accessibility evidence pass.
11. Expand only while named safety, integrity, query-budget, conflict, privacy,
    and UX monitors remain within threshold.

### Risks that may be monitored

Only the three named product hypotheses above—source comprehension,
proportionate review friction, and relevant-head contention—may remain monitor
items. Every item has a signal, threshold, owner, and response. No correctness
or security condition is deferred.

## Migration, rollout, upgrade, and rollback

1. Land additive source schema and deny-unknown readers before any writer.
2. Register D38 and its admitted source types with build/boot parity checks.
3. Add current EffectiveAccess/provenance explanation and reference-model
   comparison.
4. Add administrative ceiling/bundle-revision and protected group command.
5. Revoke browser writes and prove forced RLS/privileged-path parity.
6. Produce a per-Tenant evidence report showing zero inferred direct, group,
   and membership D38 sources.
7. Release read-only People & access/My Access explanation.
8. Canary direct writes; separately canary protected group and membership
   writes only after their complete proof.
9. Enable D37 preview, then acceptance only after final-path fencing passes.
10. Keep kill switches for new source writers and D37 acceptance, never
    ordinary source recovery or audit/history reads.
11. Mixed-version readers deny unknown source/protected states.
12. Rollback preserves source heads, terminal history, audit, receipts, epoch,
    and committed D37 history; roll forward from evidence.

## Traceability

| Artifact                                                                      | Required D39 trace                                                                                          |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Grill decision log                                                            | Founder Option 1, amended protected-group decision, and D40 deliberate continuity rule                      |
| Root glossary                                                                 | Direct assignment source, protected authorization group, assignable-capability ceiling, complete provenance |
| [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md) | Hard-to-reverse two-source architecture and protected membership boundary                                   |
| [Phase 12](./phase-12-full-role-permission-configuration.md)                  | Registry/source union, `assignment_capability_grants`, group/membership admin, ceilings, RLS/epoch/audit    |
| D35–D38 artifacts                                                             | Zero-holder policy, D37 final-path fence, D38 grant/provenance rules                                        |
| Identity/access OpenSpec                                                      | Source types, states, operations, invariants, errors, examples                                              |
| Website recovery OpenSpec                                                     | D37 current-authority interaction and privacy-minimized consequence                                         |
| Design/tasks/tickets                                                          | One requirement/AC/monitor mapping with no hidden second resolver                                           |
| Implementation/tests                                                          | Public-seam EffectiveAccess and user-visible source/consequence proof                                       |
| Release evidence                                                              | Positive/negative/poison/concurrency/temporal/migration/a11y/scale/monitor results                          |

## Decision to record

> **D39 — Direct and governed flat-group capability assignment through one
> EffectiveAccess model.** Core permits D38 through one typed direct
> `assignment_capability_grants` edge to an exact Active Tenant Assignment and
> through compatible protected Phase 12 Access groups. Both are additive inputs
> to one resolver/floor/epoch/provenance model; neither has precedence and one
> assignment remains one effective holder.
>
> `permissions.manage_grants` within current administrative scope/ceiling owns
> direct/group capability edges. Separately scoped
> `permissions.manage_membership` owns group membership, and every widening
> mutation proves a live administrative ceiling covering the group's complete
> current bundle/revision. Generic group ownership and D38 possession authorize
> neither. Same-Party self escalation remains under Phase 12's SoD/quorum rule.
>
> D38 groups are flat, same-Tenant, manually assigned, staff-assignment-only,
> non-nested, non-dynamic, non-external, and non-service. No group is seeded,
> inferred, required, or synchronized. Direct assignment remains proportionate
> for one person; a group remains proportionate for a stable job function.
>
> Current EffectiveAccess deduplicates and explains every direct/group path.
> Removing one path reports any survivor; final-path loss alone fences later
> uncommitted D37 effects. Edges expire independently, terminal history never
> resurrects, and regrant never resumes D37.
>
> The permanent UX belongs in People & access, Access groups, person detail,
> and My Access with **Granted directly** and **Through [group]** provenance,
> complete group/member consequence review, persistent receipts, and Core
> accessibility/mobile/localization behavior. The Teams demo, Website, Tasks
> Hub, notifications, external IdP, and Inngest never become authority.
>
> D40 permits one deliberate separate direct path while group-derived D38
> exists, using the same typed direct source plus fresh reason, independent
> duration, exact current group-source-set proof, immutable overlap basis,
> current self/SoD/quorum checks, one epoch, and truthful unchanged-ability/
> future-survival copy. The ordinary direct flow creates no overlap.

## D40 — May staff deliberately add a direct path when group-derived D38 already exists?

### Why this needs a separate decision

D39 allows direct and group sources, but it does not yet authorize creation of
a source that changes no current EffectiveAccess.

Jordan already receives D38 through **Website Operations**. Their organization
expects Jordan to leave that group next month but continue this one recovery
responsibility. A direct grant created before the group change prevents an
authority gap. The same direct grant can also become a quiet persistence
backdoor: an administrator may later remove Jordan from the group believing
access ended while the redundant direct source keeps it alive.

This question concerns only a deliberate new direct grant when a current group
path already exists. If Jordan already has a direct grant and later joins a
group for legitimate bundle reasons, D39 shows both paths and truthful
consequences; it does not silently delete either.

### Option 1 — allow a deliberate continuity exception — recommended

The ordinary person-access state says:

```text
Jordan already has this permission through Website Operations.
```

It offers no default/preselected grant action. An authorized grant manager may
open a secondary **Add separate direct grant** action. Review states:

```text
Add a separate direct grant?

Jordan already has this permission through Website Operations.
A direct grant will let Jordan keep it if that group access ends.

Reason for separate access
[Required fresh concise reason]

Duration
( ) Ends on…
( ) Until removed

[Cancel] [Add separate grant]
```

The direct source receives its own duration, reason, provenance, expected head,
receipt, expiry, and revoke action. Nothing copies from the group. A later
group removal explicitly says the direct source remains.

**User/Tenant UX:** the normal path stays simple and truthful; a rare handoff
or continuity need remains possible without an authority gap.

**Risk/control:** staff cannot accidentally create hidden persistence. The
exception is deliberate, independently auditable, and independently expiring.

### Option 2 — prohibit a redundant direct source

When group-derived D38 exists, Core refuses a new direct grant. Staff must
first remove/end the group path and then grant directly.

**User/Tenant UX:** simplest source model and strongest default against
privilege persistence.

**Tradeoff:** planned handoff cannot be staged safely without a temporary
authority gap or a specially coordinated two-command transition. It can also
force staff to remove a person from a multi-capability group merely to change
how D38 is carried.

### Option 3 — allow the ordinary direct-grant flow without special treatment

The normal **Grant permission** action remains available even while a group
path exists; the standard reason/duration review applies.

**User/Tenant UX:** fewest special cases in the form.

**Tradeoff:** the user may not understand that the new row changes persistence,
not present ability. It is easy to create redundant privilege accidentally and
later misread group removal as full revocation.

### Recommendation and exact question

**My recommendation is Option 1 — allow a deliberate continuity exception
with an explicit surviving-access warning, a fresh reason, and its own
duration.** It preserves a legitimate transition path while keeping the common
experience quiet. Core must never auto-create, preselect, recommend from a
holder count, or silently copy the redundant source.

Which D40 rule should Core record: **Option 1 — deliberate continuity
exception**, **Option 2 — prohibit redundant direct grants**, or **Option 3 —
ordinary direct grant with no special treatment**?

### D40 reconciliation

D40 selected Option 1 with required amendments. The user-facing action is
**Add separate direct grant**. It appears only after every current group source
is shown and explains that the grant changes future survival, not current
ability. It requires an independently entered privacy-safe reason and an
explicit unpreselected duration, then re-proves the exact current group-source
set, absence of a direct source, grant authority/ceiling, and self/SoD/quorum
rules at commit.

The command reuses `assignment_capability_grants`, records immutable overlap-
creation provenance in audit/receipt evidence, advances the Tenant epoch once,
and creates no new resolver, table, priority, automatic handoff, or async
authority. Relevant source change conflicts rather than silently restoring
access. Later group loss leaves the direct source current; final
EffectiveAccess loss alone fences D37.

See the [D40 adversarial review](./phase-24-d40-deliberate-continuity-direct-grant-adversarial-review.md)
and [D40 primary research](./phase-24-d40-deliberate-continuity-direct-grant-primary-research.md).
