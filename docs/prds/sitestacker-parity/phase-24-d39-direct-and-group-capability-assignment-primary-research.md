# Phase 24 D39 — Direct and Governed-Group Capability Assignment Primary Research

**Research date:** 2026-08-29  
**Decision under review:** permit both direct Active Tenant Assignment grants
and governed flat-group grants for the D38 capability through one Phase 12
`EffectiveAccess` model.  
**Scope:** current Core repository/governing decisions; current IAM, nonprofit
CRM, CMS/SaaS administration, database/RLS, performance, and accessible
assignment/removal UX evidence.  
**Verification note:** broad repository validation remains deferred until the
end of the Grill session by founder direction.

## Research question

Is supporting both a direct human grant and a governed group-derived grant for
the D38 organization-wide Website recovery capability current modern practice,
or does the added path create unacceptable privilege-escalation, provenance,
revocation, usability, or maintenance risk? What exact boundaries make the
combined model safe and clear for ministries of different sizes?

## Evidence labels

- **Repository fact:** verified directly in current Core source/docs.
- **Verified external fact:** supported by a current official primary source.
- **Reasonable inference:** follows from those facts but requires
  implementation proof.
- **Product judgment:** selected product tradeoff.
- **Assumption:** requires later ministry-user or production evidence.
- **Unresolved unknown:** requires a later founder decision.

## Executive finding

The decision follows modern practice **only with required amendments**.
Microsoft Entra, Google Cloud IAM, GitHub, Salesforce, Contentful, and AWS all
support assigning access to a person and/or a governed group. Their current
guidance consistently makes the two paths asymmetric:

1. direct assignment serves a genuine one-person, temporary, or exceptional
   need;
2. group assignment serves a stable, recurring job-function cohort;
3. effective access is the union of all applicable paths and must retain
   provenance; and
4. a group carrying high-impact access needs stronger membership governance
   than an ordinary collaboration or organizational group.

The strongest counterevidence is material. AWS recommends direct-only
assignment for its crown-jewel management account because any group membership
administrator can otherwise become an indirect privilege grantor. Microsoft
documents the same escalation risk and responds with protected,
assigned-membership-only, non-nested role groups. D39 therefore survives only
if a D38-bearing Core group is a protected Phase 12 access group and every
membership mutation is treated as a transitive capability grant or revoke.

The permanent path is not two authorization systems. It is two explicit source
types feeding one Phase 12 `EffectiveAccess` result, one epoch, one mutation
boundary, one audit history, and one provenance explanation.

## Current, intended, and permanent state

| State                                  | Verified position                                                                                                                                                                                                                                                                                                                                              | D39 consequence                                                                                                                                        |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Current behavior**                   | `packages/auth/permissions.ts` exposes four broad staff capabilities and maps every staff subrole to the same set. The current Teams & Users screen reads seed collections and closes local Sheets; it is not durable access administration.                                                                                                                   | Neither direct D38 grant nor governed D38 group assignment exists in running Core. No shipped-behavior claim is valid.                                 |
| **Already intended by governing docs** | Phase 12 ratifies one PDP, additive role/group/named-person grants, flat staff groups, separate `permissions.manage_grants` and `permissions.manage_membership`, live delegation ceilings, epochs, audit, Active Tenant Assignment subjects, and access explanation. D38 ratifies one unseeded `explicit_only` capability with zero effective holders allowed. | D39 must consume those primitives and cannot introduce Website-local membership, roles, holder flags, or authorization jobs.                           |
| **Best permanent path**                | Direct and protected flat-group sources are contextually managed in Phase 12 **People & access**, deduplicated at read/enforcement time, and explained source by source. Group capability and membership mutations show complete current consequences before commit.                                                                                           | Small ministries avoid artificial group setup; larger ministries avoid repetitive per-person grant drift; all users see one coherent capability state. |

## Current Core repository evidence

| Repository evidence                                                                                                          | Finding                                                                                                                                                                                                                                                                  | D39 requirement                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| [`packages/auth/permissions.ts`](../../../packages/auth/permissions.ts)                                                      | Current staff authorization is intentionally broad MVP compatibility, not the permanent capability platform.                                                                                                                                                             | Current role labels cannot imply either D39 source.                                                 |
| [Phase 12 PRD](./phase-12-full-role-permission-configuration.md)                                                             | D39 now clarifies `EffectiveAccess = role/subrole grants ∪ group capability grants ∪ assignment capability grants ∪ record-scoped named-person grants MINUS floor`; groups are flat; grant and membership administration are split; the locked command owns epoch/audit. | D39 names the typed direct relation without adding a second resolver or mutation authority.         |
| [D38 adversarial review](./phase-24-d38-explicit-tenant-capability-grant-adversarial-review.md)                              | D38 is Tenant-scoped, `explicit_only`, zero-by-default, bound to Active Tenant Assignment, and separate from policy edit, source detail, correction, task, or grant administration.                                                                                      | Every D39 path preserves those exact effects and non-effects.                                       |
| [D38 primary research](./phase-24-d38-explicit-tenant-capability-grant-primary-research.md)                                  | Direct assignment is clearest for one-off access; groups help stable cohorts but require protected membership and provenance.                                                                                                                                            | D39 must resolve both paths rather than merely permit an unspecified “group.”                       |
| [`CONTEXT.md`](../../../CONTEXT.md)                                                                                          | Active Tenant Assignment, group versus named grant, `EffectiveAccess`, and explicit Tenant capability grant already have canonical meanings.                                                                                                                             | D39 UI may use plain language, but schema/spec vocabulary must not fork.                            |
| [Teams UI](<../../../apps/admin/app/(app)/admin/teams/teams-sections.tsx>)                                                   | Generic None/View/Manage/Admin selects use prototype-local state and do not explain additive source provenance or bulk consequences.                                                                                                                                     | The permanent flow cannot copy this matrix or client-only save behavior.                            |
| [Admin workspace collections](../../../packages/database/collections/admin-workspace.ts)                                     | Team/member data is cloned from hard-coded seed arrays.                                                                                                                                                                                                                  | A seed collection is never a grant or membership authority.                                         |
| [Frontend rules](../../ai/rules/frontend.md) and [accessibility review skill](../../ai/skills/accessibility-review/SKILL.md) | Core requires shared Base Maia/Base UI primitives, semantic tokens, keyboard/focus/status support, reflow, and 44px touch behavior.                                                                                                                                      | D39 needs responsive source explanation and deliberate review, not a dense desktop permission grid. |
| [ADR-0181](../../adr/0181-source-authorized-candidate-scoped-external-review.md)                                             | External review responsibility does not create standing Tenant membership or broad source access.                                                                                                                                                                        | An external reviewer, task recipient, or coordinator cannot enter a D39 group by implication.       |
| [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)                                           | Tasks Hub projects source-owned work; task state is not authorization truth.                                                                                                                                                                                             | A future task assignment cannot create, retain, or revoke a D39 access source.                      |

## Current official primary-source evidence

### Microsoft Entra

- [Manage Microsoft Entra user roles](https://learn.microsoft.com/en-us/entra/fundamentals/how-to-assign-roles-to-users)
  states that direct assignment can be necessary for one-off scenarios and
  recommends groups for role assignment at scale.
- [Entra RBAC overview](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/custom-overview)
  says authorization retrieves every applicable role assignment, directly or
  through group membership, for the requested resource.
- [Use groups to manage role assignments](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/groups-concept)
  documents the escalation risk created when ordinary group administrators can
  change privileged membership. Role-assignable groups require privileged
  creation, assigned rather than dynamic membership, and no group nesting.
- [Assign Microsoft Entra roles in PIM](https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-how-to-add-role-to-user)
  supports permanent access for permanent workers who frequently need a role
  and time-bound access for known temporary/contract work.
- [Complete an access review](https://learn.microsoft.com/en-us/entra/id-governance/complete-access-review)
  warns that denying an application assignment does not remove access retained
  through an assigned group and that nested/synchronized membership may be
  unremediable at that layer.

**Implication:** both source types are current practice, but the group must be
protected and review/removal must target the authoritative source rather than
claim success from a flattened holder list.

### Google Cloud IAM

- [Resolve permission errors](https://docs.cloud.google.com/iam/docs/resolve-permission-errors)
  says to grant directly when one person alone needs the role and to consider a
  group when all members require similar permissions.
- [Best practices for Google groups](https://docs.cloud.google.com/iam/docs/groups-best-practices)
  distinguishes access groups from organizational, collaboration, and
  enforcement groups; recommends workload/job-function access groups; usually
  discourages access-group nesting; and calls for eligibility guardrails,
  justification, optional approval, lifetime, ownership, and membership audit.
- [Set limits on granting roles](https://docs.cloud.google.com/iam/docs/setting-limits-on-granting-roles)
  warns that broad role-grant authority materially increases security risk and
  supports a ceiling on which roles an administrator may grant.
- [Policy Analyzer](https://docs.cloud.google.com/policy-intelligence/docs/policy-analyzer-overview)
  expands group membership to explain which individuals have a permission and
  reports principal, role, and resource provenance.
- [Access change propagation](https://docs.cloud.google.com/iam/docs/access-change-propagation)
  documents eventual-consistency delays, especially for group removal and
  nested groups.

**Implication:** Core should follow the direct-versus-group selection rule and
provenance model, but not import external-directory lag. Core-owned Phase 12
membership and epoch advancement should make revocation authoritative at the
transaction boundary.

### AWS IAM Identity Center — supporting evidence and the crown-jewel exception

- [Users, groups, and provisioning](https://docs.aws.amazon.com/singlesignon/latest/userguide/users-groups-provisioning.html)
  supports user and group principals, rejects nested groups, and describes
  groups as the scalable assignment mechanism.
- [Assign user or group access](https://docs.aws.amazon.com/singlesignon/latest/userguide/assignusers.html)
  recommends groups for administrative simplicity and includes a review step
  over selected principals and permission sets.
- [Delegated administration](https://docs.aws.amazon.com/singlesignon/latest/userguide/delegated-admin.html)
  recommends **direct users, not groups**, for management-account permissions:
  anyone able to change privileged group membership could otherwise alter who
  has crown-jewel access. If groups are used, membership controls, logging, and
  review are mandatory.

**Implication:** “groups at scale” is not an unconditional maxim. D39 remains
valid only while D38 stays narrower than the Tenant authorization root and the
Phase 12 group-membership boundary prevents indirect self-elevation.

### GitHub

- [Roles in an organization](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization)
  supports granular organization actions assigned to individuals or teams
  without granting full organization administration.
- [Using organization roles](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/using-organization-roles)
  supports user and team assignments, assignment listing, and source-specific
  removal.
- [Enterprise role assignment](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-roles-in-your-enterprise/assign-roles)
  identifies teams as the scalable assignment path.
- [Manage repository access](https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/managing-teams-and-people-with-access-to-your-repository)
  separates **Direct access** from **Organization access** inherited through a
  team or organization role.
- [Organization audit events](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/audit-log-events-for-your-organization)
  records organization-role assignment and team membership activity with
  actor, user/team, role, organization, and request metadata.

**Implication:** Core should present one effective capability plus explicit
source labels and durable mutation history, not two competing permission
products.

### Salesforce

- [Permission Set Groups](https://help.salesforce.com/s/articleView?id=perm_set_groups.htm&language=en_US)
  bundles permissions around job functions and reduces repetitive assignment
  while warning that overlapping access can become opaque if unmanaged.
- [View a User's Access Summary](https://help.salesforce.com/s/articleView?id=users_access_summary.htm&language=en_US)
  consolidates user access and exposes **Access Granted By** for a specific
  permission.
- [Permissions and Access Settings](https://help.salesforce.com/s/articleView?id=permissions_about_users_access.htm&language=en_US)
  states that access is additive and revoking a permission requires removing
  every source that grants it.
- [Assign Permission Set Groups](https://help.salesforce.com/s/articleView?id=platform.perm_set_groups_assign.htm&language=en_US&type=5)
  supports per-user group assignment, optional expiry, and an individual user
  access-summary workflow.

**Implication:** truthful source-aware removal is a correctness requirement.
“Direct grant removed” and “effective access removed” are different outcomes.

### Contentful CMS

- [Roles](https://www.contentful.com/help/roles/) states that roles support
  job-related tasks and can be assigned individually or at team level.
- [Use teams to manage organization access](https://www.contentful.com/help/users-and-teams/teams/using-teams-to-manage-organization-access/)
  recommends functional teams for people with similar tasks and bulk
  onboarding, rather than repeating space assignments.
- [Space roles](https://www.contentful.com/help/roles/space-roles-and-permissions/)
  states that individual and team-inherited roles combine.
- [Assign multiple roles](https://www.contentful.com/help/roles/space-roles-and-permissions/assigning-multiple-roles-to-a-user/)
  documents additive direct/team inheritance and the risk that a broad team
  role can unexpectedly dominate intended restrictions.
- [View team memberships](https://www.contentful.com/help/users-and-teams/teams/viewing-team-memberships/)
  lets a user and administrator inspect team membership, role, description, and
  inherited space access.

**Implication:** a comparable modern CMS validates the combined model and the
need for provenance. It also demonstrates why D38 must remain a narrow atom and
must never hide inside a broad Web Studio team role.

### Nonprofit CRM evidence and assumption boundary

- [Blackbaud roles](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/sec-role.html)
  allows a role to be assigned to one user for a specific need or multiple
  users performing similar tasks; it recommends clear descriptions, role
  history, and regular review.
- [Neon One user groups](https://support.neonone.com/hc/en-us/articles/4407398927373-User-Groups-Permissions)
  uses custom permission groups around staff work, but assigns each user one
  group and contains broad default groups. It is evidence that small nonprofit
  products use groups, not evidence that Core should copy their model.
- [Neon Financial Authority](https://support.neonone.com/hc/en-us/articles/25649443669133-Text-to-Communicate-with-Neon-CRM)
  permits a high-impact permission at user or group level but initially applies
  it to administrators. Core explicitly rejects that broad default.

**Implication:** nonprofit products support both specific-person and
similar-task administration, but no cited source proves typical ministry staff
count, turnover, governance maturity, or preferred path. Core must not require
a group for one person or infer access from “Administrator.”

### Security, database, and accessibility standards

- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
  recommends least privilege, deny by default, validating permissions on every
  request, and comprehensive authorization tests.
- [NIST SP 800-53 Release 5.2.0](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
  requires defined group/role membership conditions, authorized privileges,
  account lifecycle, least privilege, separation of duties, monitoring, and
  audit. It does not prescribe a universal direct-or-group winner.
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
  distinguishes `USING` from `WITH CHECK` and documents that owners and
  `BYPASSRLS` roles normally bypass row policies.
- [W3C modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
  requires contained logical focus and restoration and recommends initial
  focus on the least destructive action for difficult-to-reverse operations.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)
  requires programmatic communication of non-focus status changes.
- [WCAG reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow.html),
  [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum),
  and [error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data)
  support responsive review, usable controls, and an opportunity to inspect
  consequential changes before commit.

**Implication:** both source types must share server-side enforcement, database
scope protection, privileged-path parity, accessible review, and receipt-backed
status. UI provenance is not a substitute for authorization.

## Direct-versus-group comparison

| Dimension               | Direct Active Tenant Assignment                | Governed flat access group                                     | Permanent D39 rule                                                      |
| ----------------------- | ---------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| One current operator    | Lowest setup and clearest exception provenance | Artificial ceremony if created only to wrap one person         | Prefer direct; never require a group mechanically.                      |
| Stable recurring cohort | Repetitive grants and offboarding drift        | One job-function source with deliberate membership lifecycle   | Prefer group when responsibility genuinely repeats.                     |
| Blast radius            | One subject                                    | Existing or future members can all gain access                 | Attaching D38 and every membership change must preview complete impact. |
| Indirect escalation     | Grant administrator is visible                 | Membership administrator becomes a transitive grantor          | Protected membership authority and live ceiling are mandatory.          |
| Provenance              | “Granted directly”                             | “Through [group]”                                              | One effective row; enumerate every live source.                         |
| Revocation              | Ends one named source                          | Removing member, group capability, or group can affect many    | Compute before/after `EffectiveAccess` for every affected assignment.   |
| Expiry                  | Useful for temporary/exception access          | Membership expiry can govern temporary participation           | Reuse Phase 12 duration policy; no D39-specific expiry engine.          |
| Access review           | Review the direct grant                        | Review both group purpose/capability and individual membership | A flattened holder review alone is invalid.                             |
| Small-ministry fit      | Strong                                         | Potentially noisy                                              | Direct path stays first-class.                                          |
| Larger-Tenant fit       | Can become grant sprawl                        | Strong when membership represents real shared work             | Group path stays first-class but never automatic.                       |

## Strongest alternative: direct-only

Direct-only materially reduces the number of transitive authorization edges,
makes every holder deliberately named, and avoids a membership administrator
becoming an indirect grantor. AWS's management-account recommendation proves
that direct-only is the safer permanent path for crown-jewel authority.

It is not the strongest path for current D38 because:

- D38 cannot administer permissions, finance, donor/source access, or the
  Tenant itself;
- Phase 12 already owns governed group sources and live delegation ceilings;
- recurring operational cohorts otherwise require repeated per-person grants;
- repeated grants increase offboarding drift and audit noise; and
- a group writer can remain disabled until protected-membership proof exists.

This conclusion is conditional. If D38 later gains Tenant-root, permission
administration, financial commitment, unrestricted sensitive-data access, or
external/dynamic group support, the crown-jewel exception must reopen D39.

## Corrected permanent decision

> The D38 capability may become effective for a current Active Tenant
> Assignment through either an explicit named-person grant bound to that exact
> assignment or current membership in one or more governed, flat Phase 12
> access groups to which D38 is explicitly attached.
>
> Phase 12 unions and deduplicates all live sources into one
> `EffectiveAccess` result while retaining complete source provenance. Direct
> assignment serves a genuine one-person, temporary, or exceptional need.
> Governed-group assignment serves a recurring job-function cohort. No holder
> count mechanically forces either path.
>
> A group carrying D38 is a protected access group: same-Tenant,
> assigned-membership-only, flat, internal, and limited to eligible current
> Active Tenant Assignments. It has no nested, dynamic, organizational,
> collaboration, externally synchronized, service-account, support, or
> inferred membership.
>
> `permissions.manage_grants` within live ceiling attaches or removes D38 on a
> group. Separately scoped `permissions.manage_membership` changes membership,
> and its live ceiling must cover every capability the change would confer.
> Group ownership, name, role, job title, D38 possession, task assignment, or
> route visibility authorizes neither command. Phase 12's no-self-elevation,
> separation-of-duties, quorum-aware small-organization, expected-head,
> idempotency, epoch, audit, and receipt rules apply.
>
> Every direct grant, group capability change, membership change, revoke,
> expiry, suspension, and assignment end computes authoritative before-and-
> after `EffectiveAccess`. Ending one source ends only that source. Core never
> reports effective revocation while another source survives.
>
> Overlapping sources are valid but visible. D40 keeps the ordinary direct flow
> unavailable during group-derived access and permits only a secondary **Add
> separate direct grant** flow that shows current sources first, explains
> unchanged present ability/future survival, and gives the source its own
> reason and duration.
>
> D39 creates no Website-local grant table, generic team authorization,
> automatic group, external synchronization, PIM/JIT system, task,
> notification campaign, review engine, or Inngest-owned authority.

## UX and UI findings

### Contextual paths, not a confusing assignment-type wizard

- On a person's **People & access** page, **Additional permissions → Website
  operations** manages a direct source.
- On a protected group's page, **Permissions** attaches D38 to that group.
- A capability-centric “Who has access” view is a derived explanation and may
  link to both source owners; it is not a writer.
- End-user copy says **Direct grant** in administration, **Granted directly to
  you** in My Access, **Through Website Operations**, and surface-specific
  **Why this person has access** / **Why you have access**. “Active Tenant
  Assignment” and “EffectiveAccess”
  remain specification terms, not UI jargon.

### Truthful overlap and removal

If Jordan has both paths:

> **2 access sources**  
> Granted directly  
> Through Website Operations

Removing the direct source must say:

> **Remove direct permission?**  
> Jordan will keep this permission through Website Operations.

Removing the final source must say:

> **Remove permission?**  
> Jordan will no longer be able to start organization-wide current-work
> updates. Completed changes remain.

Attaching or removing D38 on a populated group must state complete impact:

> 12 active members are in this group.  
> 9 will gain or lose this permission.  
> 3 already have or will keep it through another access source.

### Membership UX

- Adding a person to a D38-bearing group lists D38 among capabilities gained
  before confirmation.
- Removing a person lists capabilities actually lost and those retained
  through other sources.
- An empty group carrying D38 is valid and yields zero effective holders, but
  its access-admin view states that adding a member will grant the capability.
- Group rename is not an authorization change; duplicate display names require
  stable disambiguating context.
- Group deletion cannot silently move members or orphan capability state.

### Accessibility and field use

- Use a page or inline review rather than a modal nested inside the current
  Sheet.
- Use shared Base Maia/Base UI `Field`, `Card`, `Alert`, `Badge`, `Button`,
  dialog, and empty-state primitives with semantic tokens.
- Keep cancel/least-destructive focus first for removal, restore focus after
  close, and announce committed status programmatically.
- Preserve 44px Core touch targets, 320px/400% reflow, keyboard-only
  operation, forced colors, reduced motion, RTL, long international names,
  localized dates, and low-bandwidth receipt recovery.
- Do not use a wide permission matrix, color-only source badge, toast-only
  success, optimistic close, typed phrase, or repeated confirmation per row.

## Database, RLS, concurrency, and performance findings

1. Direct grants, group capability grants, and group memberships remain
   distinct authoritative relations; `EffectiveAccess` is a derived decision,
   not a stored “holder” Boolean.
2. Every relation has `tenant_id NOT NULL` and same-Tenant composite
   relationships. Human source and membership rows bind the exact Active Tenant
   Assignment, never a bare profile, Party, email, or display name.
3. Group identity is immutable and Tenant-scoped. Name changes cannot alter or
   merge authorization.
4. Current source uniqueness prevents duplicate active semantic paths while
   append-only/successor history preserves each grant, membership, revoke, and
   actor.
5. One Phase 12 advisory-locked expected-head command commits source state,
   governance epoch, audit, and receipt atomically.
6. `USING` and `WITH CHECK` both protect browser-visible mutations; immutable
   scope columns prevent an allowed update from moving a row into a forbidden
   Tenant/group/subject.
7. Owner, `BYPASSRLS`, service-role, RPC, support, repair, import, job, and AI
   paths reproduce the same authorization boundary and negative tests.
8. Attaching D38 to a group remains one group-capability relation. It does not
   fan out N durable person grants. Set-based resolution expands current
   members and deduplicates source paths.
9. Index current heads by Tenant, capability, subject/group, membership, expiry,
   and governance epoch. Holder/provenance pages are paginated stable
   projections; enforcement never scans audit history.
10. Core-owned membership and epoch advancement avoid the external-directory
    propagation lag documented by Google. Realtime, tokens, caches, Inngest,
    and read models may invalidate/project but never delay or redefine
    committed authority.

## Research outcomes

### Problem validity, alternatives, and repository consistency

- **D39-RA001 — Repository fact:** Phase 12 already ratifies direct named
  grants and flat group grants; therefore D39 selects governed source types
  rather than creating a new authorization abstraction.
- **D39-RA002 — Repository fact:** D38 is one unseeded `explicit_only`
  capability; therefore neither direct nor group assignment may be implied by
  Owner, Admin, Web Studio, staff role, or module rung.
- **D39-RA003 — Repository fact:** current Core runtime has no D39 grant or
  group writer; therefore all D39 behavior remains intended, not shipped.
- **D39-RA004 — Repository fact:** current Teams collections are seed-backed;
  therefore their rows, selects, and Save action cannot be treated as
  authorization evidence.
- **D39-RA005 — Verified external fact:** Entra and Google distinguish one-off
  direct assignment from group assignment at scale; therefore both paths have
  a current-practice basis.
- **D39-RA006 — Verified external fact:** GitHub and Contentful assign
  organization/content roles to people and teams; therefore dual source types
  are established SaaS/CMS practice.
- **D39-RA007 — Verified external fact:** Drupal's role-first model and AWS's
  crown-jewel direct-only guidance are credible alternatives; therefore “both”
  cannot be justified as a universal maxim.
- **D39-RA008 — Product judgment:** D38's narrow operation scope does not
  justify forcing every one-person ministry through group creation.
- **D39-RA009 — Product judgment:** recurring cohorts should not require
  repetitive direct-grant churn when Phase 12 can govern one job-function
  group.
- **D39-RA010 — Product judgment:** D39 is accepted only with protected group
  membership, complete provenance, and source-aware revoke semantics.

### Selecting the direct or group path

- **D39-RA011 — Verified external fact:** Google recommends direct assignment
  when only one individual needs access; therefore Core preserves direct as a
  first-class path.
- **D39-RA012 — Verified external fact:** Microsoft recommends groups for
  assignments at scale; therefore stable shared responsibility may use a
  governed group.
- **D39-RA013 — Verified external fact:** Blackbaud supports one user for a
  specific need and multiple users for similar tasks; therefore nonprofit
  administration does not require one fixed path.
- **D39-RA014 — Assumption:** ministries vary in staffing and turnover; no
  current evidence supports a mandatory numeric threshold for group use.
- **D39-RA015 — Product judgment:** direct assignment represents a named,
  temporary, or exceptional need, not a shadow personal role system.
- **D39-RA016 — Product judgment:** group assignment represents a real
  recurring job function, not an automatic wrapper created for one grant.
- **D39-RA017 — Product judgment:** Core may recommend a path contextually but
  must not block a Tenant solely because a cohort currently has one or several
  people.
- **D39-RA018 — Reasonable inference:** a hard “two people means group” rule
  will become wrong as staffing changes; therefore path choice stays
  responsibility-based.
- **D39-RA019 — Product judgment:** no Website Operations group is seeded or
  auto-created because that would imply D38 is expected or broadly safe.
- **D39-RA020 — Product judgment:** if D38 becomes crown-jewel authority, D39
  must be reopened rather than silently retaining the group path.

### Protected-group authority and privilege escalation

- **D39-RA021 — Verified external fact:** Entra documents group-membership
  administration as an indirect privileged-role escalation path.
- **D39-RA022 — Verified external fact:** AWS recommends direct-only
  management-account access for the same reason.
- **D39-RA023 — Requirement inference:** a D38 group is a protected access
  group, never an ordinary organizational, communications, task, or
  collaboration team.
- **D39-RA024 — Verified external fact:** Entra role-assignable groups prohibit
  dynamic membership and nesting; therefore D39's v1 protected group does too.
- **D39-RA025 — Verified external fact:** Google warns nested access groups
  obscure provenance and can bypass membership policy; therefore Core's group
  remains flat.
- **D39-RA026 — Repository fact:** Phase 12 splits
  `permissions.manage_grants` from `permissions.manage_membership`; therefore
  attaching D38 and changing people remain separately authorized commands.
- **D39-RA027 — Requirement inference:** a membership writer's live ceiling
  must cover every capability an added member would receive, including D38.
- **D39-RA028 — Requirement inference:** group ownership, maintainer label, or
  D38 possession alone cannot mutate D38-bearing membership.
- **D39-RA029 — Repository fact:** Phase 12 forbids self-expanding delegated
  administration; therefore a manager cannot add themselves through a
  protected group.
- **D39-RA030 — Product judgment:** Phase 12's quorum-aware small-organization
  rule applies; D39 adds neither a universal second approver nor a self-grant
  shortcut.

### Effective access, provenance, and overlapping sources

- **D39-RA031 — Repository fact:** Phase 12 defines additive access across role,
  group, and named sources; therefore D39 uses one resolver rather than source-
  specific PEP logic.
- **D39-RA032 — Verified external fact:** Entra resolves assignments received
  directly or through group membership; therefore source union is established
  practice.
- **D39-RA033 — Verified external fact:** Salesforce says revocation requires
  removing every granting source; therefore ending one D39 path may leave
  access effective.
- **D39-RA034 — Verified external fact:** Salesforce exposes **Access Granted
  By**; therefore complete provenance is a user-support and security feature,
  not internal diagnostics.
- **D39-RA035 — Verified external fact:** GitHub distinguishes Direct access
  from organization/team-derived access; therefore Core should use similarly
  plain source labels.
- **D39-RA036 — Verified external fact:** Contentful combines individually
  assigned and team-inherited roles; therefore an overlapping-source edge is
  realistic in a CMS.
- **D39-RA037 — Requirement inference:** effective-holder lists deduplicate a
  person with multiple paths while source detail retains every current path.
- **D39-RA038 — Requirement inference:** source removal receipts state both the
  ended source and whether effective D38 remains.
- **D39-RA039 — Repository decision:** D40 keeps ordinary overlap unavailable
  and permits a deliberate separate direct source only with current group-
  source proof, fresh reason, independent duration, immutable provenance, and
  explicit survival explanation.
- **D39-RA040 — Requirement inference:** no persisted `is_d38_holder` Boolean
  or raw grant-row count can authorize, report, or drive UX.

### Lifecycle, concurrency, and idempotency

- **D39-RA041 — Repository fact:** human authority binds the exact Active
  Tenant Assignment; therefore ending that assignment ends direct and group
  membership paths.
- **D39-RA042 — Requirement inference:** a new or recreated assignment never
  resurrects a prior direct grant or group membership.
- **D39-RA043 — Verified external fact:** Entra supports permanent frequent
  assignments and time-bound temporary assignments; therefore D39 reuses
  Phase 12 duration rather than imposing one expiry rule.
- **D39-RA044 — Requirement inference:** attaching D38 to an existing group is
  a bulk effective-access change even though it writes one relation.
- **D39-RA045 — Requirement inference:** removing D38 from a group computes
  every member who loses access and every member with a surviving path before
  commit.
- **D39-RA046 — Requirement inference:** adding or removing a member computes
  the full group capability consequence, not only the membership row.
- **D39-RA047 — Repository fact:** Phase 12 uses one advisory-locked
  expected-head mutation boundary; therefore concurrent direct/group changes
  have one ordered current result.
- **D39-RA048 — Requirement inference:** semantic retries return the original
  receipt and cannot duplicate a direct grant, group capability, or
  membership.
- **D39-RA049 — Requirement inference:** expiry, suspension, revoke, offboarding,
  and D37 execution all reprove current epoch so stale authority cannot commit
  later work.
- **D39-RA050 — Requirement inference:** regranting or rejoining produces a new
  authorization generation and never resumes a stopped D37 application.

### Information architecture and interaction UX

- **D39-RA051 — Repository fact:** permanent access management belongs in Phase
  12 **People & access**, not Website settings or the seed Teams demo.
- **D39-RA052 — Product judgment:** person context manages the direct source,
  while group context manages group capability and membership.
- **D39-RA053 — Product judgment:** a universal “direct or group?” wizard adds
  conceptual burden and is unnecessary when the initiating context expresses
  intent.
- **D39-RA054 — Product judgment:** end-user copy says **Granted directly** and
  **Through [group]** rather than exposing internal model terminology.
- **D39-RA055 — Requirement inference:** a person page presents one effective
  D38 row plus a source count/disclosure, not duplicate permission rows.
- **D39-RA056 — Requirement inference:** if another source survives, removal
  copy says the person keeps access and links to the surviving source.
- **D39-RA057 — Requirement inference:** group capability review shows exact
  gain/loss/retention counts and authorized identities before commit.
- **D39-RA058 — Requirement inference:** membership review lists D38 among all
  capabilities actually gained, lost, or retained.
- **D39-RA059 — Product judgment:** an empty D38-bearing group is valid but its
  admin view discloses the latent consequence of adding a member.
- **D39-RA060 — Product judgment:** group rename, description, and duplicate
  names require stable disambiguation but never change authorization.

### Access review, audit, and operational comprehension

- **D39-RA061 — Verified external fact:** Microsoft warns that application
  review cannot remove access retained through assigned groups.
- **D39-RA062 — Requirement inference:** D39 access review covers direct
  grants, the group's continued D38 attachment, and each protected membership
  source.
- **D39-RA063 — Requirement inference:** a flattened effective-holder review is
  informative but cannot be the only remediation surface.
- **D39-RA064 — Verified external fact:** Google recommends membership
  justification and audit because membership itself grants resource access.
- **D39-RA065 — Verified external fact:** GitHub audits role assignment and team
  membership with actor and target metadata; therefore both D39 source changes
  need durable attribution.
- **D39-RA066 — Verified external fact:** Blackbaud recommends clear role
  purpose, history, and regular review; therefore protected groups need a
  concise business purpose and reviewability.
- **D39-RA067 — Requirement inference:** group capability/membership history is
  immutable business-security evidence, not replaceable by telemetry.
- **D39-RA068 — Product judgment:** D39 reuses Phase 12 recertification and
  alerts; it creates no Website-specific review calendar or reminders.
- **D39-RA069 — Requirement inference:** support diagnostics explain current
  sources and last mutations without revealing D37 source-record details.
- **D39-RA070 — Product judgment:** effective-holder presence or count is
  access-administration data, never a staff-performance or ministry-readiness
  score.

### Tenant safety, eligibility, and privacy

- **D39-RA071 — Repository fact:** membership-backed authority uses one
  validated Active Tenant Assignment; therefore all direct/group subjects are
  exact same-Tenant assignments.
- **D39-RA072 — Requirement inference:** pending, invited, inactive, ended,
  wrong-Tenant, or nonstaff assignments cannot become effective D38 members.
- **D39-RA073 — Repository fact:** external reviewers do not receive standing
  Tenant membership; therefore D35 review responsibility cannot imply D39
  membership.
- **D39-RA074 — Repository fact:** task assignment is not authorization;
  therefore Tasks Hub or Mobilize work cannot add someone to a D38 group.
- **D39-RA075 — Requirement inference:** donor, missionary, public, support,
  service, integration, AI, and agent identities remain ineligible until a
  separate approved subject contract exists.
- **D39-RA076 — Verified external fact:** Google warns external group members
  can undermine sharing restrictions; therefore D39 groups are internal-only.
- **D39-RA077 — Requirement inference:** group and membership candidate search
  is Tenant- and purpose-authorized and does not become a cross-Tenant people
  directory.
- **D39-RA078 — Requirement inference:** Party merge, split, clone, import,
  restore, or environment copy cannot union or infer D39 sources.
- **D39-RA079 — Requirement inference:** access-management projections expose
  staff identity and provenance only to authorized administrators and the
  subject's own My Access view.
- **D39-RA080 — Requirement inference:** D39 provenance never exposes Website
  source details, D37 cohort membership, protected worker content, or
  correction context.

### Database, RLS, and privileged mutation paths

- **D39-RA081 — Requirement inference:** direct grants, group-capability grants,
  and memberships are distinct Tenant-scoped authoritative relations.
- **D39-RA082 — Requirement inference:** same-Tenant composite keys make a
  cross-Tenant group, subject, grant, or membership edge unrepresentable.
- **D39-RA083 — Requirement inference:** human relations reference Active
  Tenant Assignment IDs rather than profile, Party, email, or display name.
- **D39-RA084 — Requirement inference:** Tenant, subject, group, capability,
  grantor, actor, and timestamps are server-derived or immutable.
- **D39-RA085 — Requirement inference:** current semantic source uniqueness
  prevents duplicate active rows while append-only successor history preserves
  correction.
- **D39-RA086 — Verified external fact:** PostgreSQL `USING` and `WITH CHECK`
  protect different mutation aspects; therefore both require explicit D39
  policy tests.
- **D39-RA087 — Verified external fact:** PostgreSQL owners and `BYPASSRLS`
  roles normally bypass policies; therefore privileged paths need equivalent
  authorization, not reliance on RLS alone.
- **D39-RA088 — Requirement inference:** an allowed update cannot move a grant
  or membership into another Tenant, group, subject, capability, or
  authorization generation.
- **D39-RA089 — Requirement inference:** service-role, RPC, support, repair,
  migration, import, job, and AI writers cannot bypass Phase 12's locked
  command.
- **D39-RA090 — Requirement inference:** delete is restrictive; group deletion
  cannot cascade away audit or silently reassign members to a default group.

### Scale, performance, dependencies, and failure modes

- **D39-RA091 — Reasonable inference:** one group-capability relation is more
  scalable than N copied person grants for a stable cohort.
- **D39-RA092 — Requirement inference:** group assignment never materializes N
  durable direct grants merely to simplify reads.
- **D39-RA093 — Requirement inference:** current source heads are indexed by
  Tenant, capability, subject/group, membership, expiry, and epoch.
- **D39-RA094 — Requirement inference:** `EffectiveAccess` resolves set-wise and
  never scans audit history or performs per-source network calls.
- **D39-RA095 — Verified external fact:** Google documents slower and
  potentially hours-long group-removal propagation in external IAM.
- **D39-RA096 — Product judgment:** D39 excludes external/dynamic group
  authority so Core can make committed local revocation authoritative at epoch
  advancement.
- **D39-RA097 — Requirement inference:** cached permissions are keyed by current
  governance epoch and cannot preserve a revoked direct or group path.
- **D39-RA098 — Requirement inference:** holder/provenance screens use
  Tenant-scoped stable pagination and one governance snapshot.
- **D39-RA099 — Repository fact:** Inngest is not authorization truth;
  therefore it may reconcile projections but cannot confer, retain, or revoke
  D39 access.
- **D39-RA100 — Requirement inference:** authorization-store uncertainty fails
  closed without breaking source-owned Needs assignment recovery.

### Accessibility, localization, and low-bandwidth UX

- **D39-RA101 — Repository fact:** Core's permanent UI uses shared Base
  Maia/Base UI primitives and semantic tokens; therefore D39 adds no parallel
  component language.
- **D39-RA102 — Verified external fact:** W3C requires logical contained dialog
  focus and restoration; therefore any D39 modal must satisfy that contract.
- **D39-RA103 — Verified external fact:** W3C recommends least-destructive
  initial focus for hard-to-reverse actions; therefore removal focuses Cancel
  or equivalent.
- **D39-RA104 — Product judgment:** a page or inline review is preferred over a
  dialog nested in the current Teams Sheet.
- **D39-RA105 — Verified external fact:** WCAG status changes must be
  programmatically determinable; therefore receipt-backed success cannot be
  toast-only.
- **D39-RA106 — Repository fact:** Core targets 44px important touch controls;
  therefore prototype 28–32px actions are not the D39 target.
- **D39-RA107 — Verified external fact:** WCAG reflow requires no two-
  dimensional reading at 320 CSS pixels for ordinary content; therefore D39
  avoids a wide permission matrix.
- **D39-RA108 — Requirement inference:** color, icon, hover, or column position
  cannot be the sole direct/group/provenance cue.
- **D39-RA109 — Requirement inference:** international names, long group names,
  RTL, CJK, plurals, locale dates, and time zones are tested in every impact
  message.
- **D39-RA110 — Requirement inference:** low-bandwidth lost responses use
  semantic receipt lookup before retry and preserve entered reason/context.

### Migration, rollout, traceability, and evidence limits

- **D39-RA111 — Repository fact:** Core has no production users under ADR-0001,
  but current broad MVP authorization still cannot be treated as a safe
  backfill source.
- **D39-RA112 — Requirement inference:** migration creates zero inferred D38
  direct grants, group capability grants, and protected memberships.
- **D39-RA113 — Requirement inference:** no current seed team, role, policy
  editor, coordinator, task assignee, operation author, or admin is converted
  into a D39 source.
- **D39-RA114 — Requirement inference:** registry/readers, protected-group
  schema, resolver provenance, RLS, epoch, and denial guards activate before
  any D39 writer.
- **D39-RA115 — Requirement inference:** mixed versions that cannot understand
  protected group provenance fail closed and cannot serve or mutate D38.
- **D39-RA116 — Requirement inference:** rollback preserves grant, membership,
  audit, and receipt history and never restores role/group implication.
- **D39-RA117 — Requirement inference:** tests cover direct-only, group-only,
  overlapping, empty-group, populated-group, cross-Tenant, concurrency,
  expiry, offboarding, cache, privileged path, and accessibility outcomes.
- **D39-RA118 — Requirement inference:** traceability uses one stable
  capability and source vocabulary from Grill through glossary, ADR, Phase 12,
  OpenSpec, tickets, code, tests, and release evidence.
- **D39-RA119 — Assumption:** no current user research proves ministry
  preference or frequency for either path; later usability studies must use
  one-person and rotating-team scenarios without changing safety invariants.
- **D39-RA120 — Product judgment:** D39 remains Reserved until direct and
  protected-group paths prove complete provenance, transitive membership
  authorization, source-aware removal, Tenant isolation, concurrency, rollout,
  accessibility, and privileged-path parity.

## Evidence limits

- Enterprise IAM evidence proves that direct and group assignment can coexist;
  it does not prove every capability should use both.
- AWS's management-account exception is deliberately retained as the boundary
  condition, not dismissed as a different market.
- Contentful validates comparable CMS assignment and additive inheritance, but
  its space/role model is not Core's Tenant/source/floor model.
- Blackbaud and Neon establish nonprofit-product patterns; they do not provide
  direct research about missions-ministry staffing, risk tolerance, or
  terminology.
- Google and Entra offer JIT, approval, automated expiry, and external identity
  integrations. Those are configurable enterprise governance mechanisms, not
  evidence for a D39-specific subsystem.
- The current Core Teams UI is seed-backed and cannot validate production UX,
  authorization, persistence, or accessibility.
- No D35–D40 runtime exists. Performance, concurrency, RLS, and UI claims are
  requirements awaiting implementation evidence.

## Final research disposition

**Accept with required amendments.** Both direct Active Tenant Assignment and
governed flat-group assignment are current modern practice when they serve
different population shapes and resolve through one explainable authorization
model. Core must treat every D38-bearing group as protected, every membership
writer as a transitive grantor bounded by live ceiling, every removal as a
source-specific before/after `EffectiveAccess` decision, and every user-facing
state as one capability with complete provenance.

If protected membership, complete provenance, authoritative epoch revocation,
or source-aware UX cannot be proven, keep the group writer disabled and ship
the direct path only rather than weakening the permanent model.

## Subsequent D40 resolution

D40 permits a separate direct grant only through a continuity-specific
secondary action. The server reuses D39's typed direct relation, binds review
to the complete current group-source set, records immutable overlap-creation
provenance, advances one epoch even though present ability is unchanged, and
conflicts rather than becoming an ordinary restorative grant if access changes
before commit. Later group loss leaves the direct source current; final
EffectiveAccess loss alone fences D37.

See the [D40 adversarial review](./phase-24-d40-deliberate-continuity-direct-grant-adversarial-review.md)
and [D40 primary research](./phase-24-d40-deliberate-continuity-direct-grant-primary-research.md).
