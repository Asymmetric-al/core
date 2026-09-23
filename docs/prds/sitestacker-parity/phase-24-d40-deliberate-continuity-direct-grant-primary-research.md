# Phase 24 D40 — Deliberate Continuity Direct Grant Primary Research

**Research date:** 2026-08-29  
**Decision under review:** while an exact Active Tenant Assignment already
receives D38 through one or more current Access groups, permit one otherwise
redundant direct D38 source only as a deliberate continuity exception with a
fresh reason, independently selected duration, and explicit surviving-access
warning.  
**Scope:** current Core repository/governing decisions; current IAM, nonprofit
CRM, CMS/SaaS administration, temporal/data, RLS, accessible form, and
handoff/revocation evidence.  
**Verification note:** broad repository validation remains deferred until the
end of the Grill session by founder direction.

## Research question

Does an overlapping direct D38 source provide a legitimate, modern continuity
mechanism, or does it merely create sticky privilege that should be prohibited?
If the exception is valid, are a new reason, an independently and deliberately
selected `Ends on` or `Until removed` duration, and a surviving-access warning
sufficient to make the future persistence change safe and understandable?

## Evidence labels

- **Repository fact:** verified directly in current Core source/docs.
- **Verified external fact:** supported by a current official primary source.
- **Reasonable inference:** follows from those facts but requires
  implementation proof.
- **Product judgment:** selected product tradeoff.
- **Assumption:** requires later ministry-user or production evidence.
- **Unresolved unknown:** requires a later founder decision.

## Executive finding

The choice is **modern and proportionate with required amendments**.

Mature authorization products accept that independent sources can overlap and
that ending one does not end the other. Microsoft explicitly supports direct
assignment policies for identities who already have underlying access.
Salesforce permits an individual permission set to remain separately assigned
when the same permission is present in a permission-set group, and documents
that expiry of one source leaves other sources effective. Google documents a
time-limited conditional role binding that has no present effect while an
unconditional binding exists but can become the surviving source if the
unconditional path ends first. GitHub explicitly distinguishes direct and
team-derived access and recommends individual access when needed during team
removal/handoff.

The exception is not an ordinary grant. At creation it changes no current
`EffectiveAccess`; it changes what happens after every group path ends. The UX
must say that directly. “Jordan will keep access” alone is incomplete because
it can imply the new grant changes present ability.

The evidence supports both duration choices:

- `Ends on…` is the preferred choice for a planned handoff, contract, or
  temporary coverage; and
- `Until removed` remains valid for an ongoing responsibility independent of
  group membership, but it must be explicitly chosen and carry a stronger
  indefinite-survival warning.

Neither choice is preselected or copied from a group. The direct source receives
its own reason, duration, provenance, state, expiry, epoch, receipt, and revoke
action. The reason explains **why access must continue independently**, not why
the group needs D38 generally.

The strongest counterevidence is Google's Privileged Access Manager, which
rejects another same-scope open grant on the same entitlement and disallows
overlapping scheduled grants. That validates a strict prohibit-overlap
alternative. It does not directly govern an ordinary group binding plus an
independent direct IAM binding, but it proves that redundancy should never be
treated as cost-free or routine.

## Current, intended, and permanent state

| State                          | Verified position                                                                                                                                                                                                                                                           | D40 consequence                                                                                                                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Current behavior**           | Core has no implemented D38 grant, `EffectiveAccess` source explanation, protected group, or continuity-exception writer. Current role checks are broad MVP compatibility; Teams & Users remains seed-backed.                                                               | No shipped redundancy behavior exists and no current UI may be reused as authorization truth.                                                                                         |
| **Pre-D40 governing baseline** | D38 creates one zero-by-default `explicit_only` capability. D39 admits direct and protected flat-group sources through one additive Phase 12 resolver, with independent edge duration/provenance and source-aware revoke, while leaving overlapping direct creation closed. | D40 governs one source-creation case only; the now-landed amendment does not modify the additive formula, grant authority, group model, source independence, or D37 final-path fence. |
| **Best permanent path**        | A secondary continuity action creates at most one current direct source after a server-proved group overlap. The review states present no-op and future persistence, requires a purpose-specific reason and explicit duration, and records typed exception provenance.      | Ministries can stage a narrow no-gap handoff without making duplicate privilege ordinary or invisible.                                                                                |

## Current Core repository evidence

| Repository evidence                                                                                                                                          | Finding                                                                                                                                                                            | D40 requirement                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [Phase 12 PRD](./phase-12-full-role-permission-configuration.md)                                                                                             | One PDP unions assignment and group capability sources; edges have independent duration/provenance; mutations use one expected-head, advisory-locked epoch/audit/receipt boundary. | The exception is a normal typed assignment-capability source created by a special reviewed command, not a new authorization model. |
| [D38 adversarial review](./phase-24-d38-explicit-tenant-capability-grant-adversarial-review.md)                                                              | D38 grants one narrow Tenant-wide operation, zero holders is valid, and one surviving path prevents effective revoke.                                                              | D40 cannot broaden D38 or create a holder requirement.                                                                             |
| [D39 adversarial review](./phase-24-d39-direct-and-governed-group-capability-assignment-adversarial-review.md)                                               | Direct and protected group sources are independent; removal is source-aware; redundant direct creation remains unavailable until D40.                                              | D40 must resolve the exact creation precondition, receipt, duration, and UX.                                                       |
| [D39 primary research](./phase-24-d39-direct-and-group-capability-assignment-primary-research.md)                                                            | Modern products support additive direct/group paths but warn about sticky privilege and privilege sprawl.                                                                          | The continuity source must be exceptional, explainable, and independently reviewable.                                              |
| [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)                                                                                | The D39–D40 amendment now owns both source types, protected groups, deliberate continuity creation, provenance, and final-path semantics.                                          | D40 cannot create Website-owned handoff or membership state.                                                                       |
| [`CONTEXT.md`](../../../CONTEXT.md)                                                                                                                          | Active Tenant Assignment, `EffectiveAccess`, explicit Tenant grant, direct/group capability assignment, and Direct continuity grant now have canonical meanings.                   | Schema/requirements use those terms; UI uses plain-language source and survival copy.                                              |
| [Decision log](./phase-24-multi-site-management-decision-log.md)                                                                                             | D40 is resolved as one deliberate source-creation case while group-derived D38 already exists.                                                                                     | Reverse-order overlap and already-existing direct sources remain D39 behavior, not new D40 cases.                                  |
| [Teams UI](<../../../apps/admin/app/(app)/admin/teams/teams-sections.tsx>) and [seed collections](../../../packages/database/collections/admin-workspace.ts) | Current controls do not persist central grants or explain source overlap.                                                                                                          | No toggle, default-value select, or optimistic close may create the exception.                                                     |
| [Frontend rules](../../ai/rules/frontend.md) and [accessibility skill](../../ai/skills/accessibility-review/SKILL.md)                                        | Core requires Base Maia/Base UI, semantic tokens, focus/status/reflow, and 44px important targets.                                                                                 | The rare path uses one quiet, accessible, mobile-safe review.                                                                      |
| [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)                                                                           | Tasks Hub projects work; task state is never authorization truth.                                                                                                                  | No handoff task, reminder, recipient, or Inngest event creates or keeps the direct source.                                         |

## Current official primary-source evidence

### Microsoft Entra

- [Create an access package](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-access-package-create)
  recommends a direct-assignment policy when administrators plan to assign
  identities that already have underlying resource access and gives that
  assignment its own lifecycle policy.
- [View, add, and remove access-package assignments](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-access-package-assignments)
  lets an administrator select independent start/end time and optionally record
  a direct-assignment justification.
- [Assign Microsoft Entra roles in PIM](https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-how-to-add-role-to-user)
  supports permanent assignments for permanent workers who frequently need the
  role and time-bound assignments for temporary/contract work with a known end.
- [Access package and PIM expiration interaction](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-access-package-pim-reference)
  documents that independent access sources retain their own expiration and
  that the earliest applicable bound determines a path's validity.
- [Complete an access review](https://learn.microsoft.com/en-us/entra/id-governance/complete-access-review)
  warns that removing one reviewed assignment does not remove access retained
  through a group and that source-layer remediation matters.

**Implication:** direct assignment for an already-authorized identity is a
recognized governance operation, not inherently invalid duplication. It needs
its own lifecycle and evidence, and reviewers must understand surviving sources.

### Google Cloud IAM and PAM

- [Configure temporary access](https://docs.cloud.google.com/iam/docs/configuring-temporary-access)
  says a conditional binding for a role has no effect while the same principal
  receives that role through an unconditional binding. The conditional source
  can nevertheless become decisive if the unconditional source ends before
  the condition expires.
- [PAM overview](https://docs.cloud.google.com/iam/docs/pam-overview)
  frames temporary privilege as a duration-bound, optionally justified and
  approved grant with durable audit of who had access, why, and when.
- [Request temporary elevated access](https://docs.cloud.google.com/iam/docs/pam-request-temporary-elevated-access)
  requires a requested duration, supports required justification, and rejects
  another open same-scope grant against the same entitlement or overlapping
  scheduled grants.
- [Best practices for groups](https://docs.cloud.google.com/iam/docs/groups-best-practices)
  recommends expiring access-group membership, justification, owners, and audit
  to reduce accumulated standing privilege.
- [Policy Analyzer](https://docs.cloud.google.com/policy-intelligence/docs/policy-analyzer-overview)
  expands group-derived access to people and reports the role binding and
  resource that confer access.

**Implication:** a finite continuity source is well supported, while the PAM
duplicate prohibition is the strongest official basis for Option 2. Core may
allow the exception because the two independent D39 source types have distinct
owners/lifecycles, but must not create multiple direct sources or allow an
ordinary duplicate action.

### AWS IAM Identity Center

- [Assign user or group access](https://docs.aws.amazon.com/singlesignon/latest/userguide/assignusers.html)
  supports direct-user and group sources while preferring groups at scale and
  requires a principal/permission review before submission.
- [Revoke user access](https://docs.aws.amazon.com/singlesignon/latest/userguide/revoke-user-permissions.html)
  says complete revocation requires removing every direct assignment and every
  granting group membership.
- [Temporary elevated access](https://docs.aws.amazon.com/singlesignon/latest/userguide/temporary-elevated-access.html)
  defines just-in-time access as requesting, approving, and tracking a
  permission for a specified task during a specified time while preserving
  business-continuity/emergency planning.
- [Authentication sessions](https://docs.aws.amazon.com/singlesignon/latest/userguide/authconcept.html)
  distinguishes source removal from existing session lifetime and documents
  when new sessions stop versus already-issued sessions expire.

**Implication:** an overlapping direct source is a real survivor, and its
existence must be visible in revoke and incident response. Core's short epoch
reproof must avoid importing AWS's potentially long assumed-role-session tail.

### Salesforce

- [Permission Set Group Considerations](https://help.salesforce.com/s/articleView?id=platform.perm_set_groups_considerations.htm&language=en_US&type=5)
  explicitly permits an individual permission set to be assigned separately
  while it is also part of a permission-set group.
- [Permission Assignment Expiration Considerations](https://help.salesforce.com/s/articleView?id=platform.permissions_assign_expire_considerations.htm&language=en_US&type=5)
  states that expiry of one assignment leaves access supplied by non-expiring
  profiles, permission sets, or permission-set groups effective.
- [Permission-set guidelines](https://help.salesforce.com/s/articleView?id=platform.perm_sets_best_practices.htm&language=en_US&type=5)
  recommends expiration for short-term tasks/projects while supporting
  overlapping personas.
- [Set assignment expiration](https://help.salesforce.com/s/articleView?id=platform.permissions_assign_expire_how.htm&language=en_US&type=5)
  allows either no expiration or a selected expiry date and time zone.
- [User Access Summary](https://help.salesforce.com/s/articleView?id=users_access_summary.htm&language=en_US)
  exposes **Access Granted By** so administrators can see all sources of a
  permission.
- [Permission Set Groups Control](https://help.salesforce.com/s/articleView?id=xcloud.shr_permission_set_groups.htm&language=en_US&type=5)
  warns that unmanaged overlapping permission sources become a security black
  box and permission sprawl.

**Implication:** D40's dual duration choice and provenance-first design follow
current CRM practice. Its exceptional treatment is necessary to avoid the
overlap opacity Salesforce warns about.

### GitHub

- [Manage teams and people with repository access](https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/managing-teams-and-people-with-access-to-your-repository)
  separates **Direct access** and organization/team-derived access for audit,
  onboarding, offboarding, and incident response.
- [Remove an organization member from a team](https://docs.github.com/en/enterprise-cloud@latest/organizations/organizing-members-into-teams/removing-organization-members-from-a-team)
  advises reassigning ongoing tasks or granting individual repository
  permission as needed during a team-removal transition.
- [Manage team repository access](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/managing-team-access-to-an-organization-repository)
  describes consequences only when members have no access through another team,
  making surviving-path evaluation explicit.
- [Organization role API](https://docs.github.com/en/rest/orgs/organization-roles)
  provides distinct assign/remove operations for user and team role sources.

**Implication:** a deliberate direct handoff source is established product
behavior, but Core must do more than GitHub by requiring an exception reason,
duration choice, and exact future-persistence explanation.

### Contentful CMS

- [Assign multiple roles](https://www.contentful.com/help/roles/space-roles-and-permissions/assigning-multiple-roles-to-a-user/)
  documents roles assigned individually and inherited through one or more
  teams, with additive effective permissions.
- [Space roles](https://www.contentful.com/help/roles/space-roles-and-permissions/)
  states that individual and team roles combine.
- [Use teams to manage access](https://www.contentful.com/help/users-and-teams/teams/using-teams-to-manage-organization-access/)
  prefers functional teams for repeatable similar work.
- [View team memberships](https://www.contentful.com/help/users-and-teams/teams/viewing-team-memberships/)
  exposes team membership, role, description, and inherited space access.

**Implication:** overlap is normal in a comparable CMS, but Contentful offers
no strong continuity-exception reason/duration contract. Core should not treat
mere platform permissibility as sufficient UX.

### Nonprofit CRM evidence and assumption boundary

- [Blackbaud roles](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/sec-role.html)
  permits a role for one user's specific need or multiple people doing similar
  work and recommends role purpose, history, and regular review.
- [Neon One user groups](https://support.neonone.com/hc/en-us/articles/4407398927373-User-Groups-Permissions)
  uses staff permission groups but assigns one group as the user's primary
  permission posture.
- [Neon Financial Authority](https://support.neonone.com/hc/en-us/articles/25649443669133-Text-to-Communicate-with-Neon-CRM)
  supports assigning a high-impact permission to a user or user group, while
  its broad administrator default is a pattern Core rejects.

**Implication:** nonprofit products validate direct/group flexibility, not this
specific overlapping continuity journey. No source proves ministry staffing,
handoff frequency, comfort with indefinite exceptions, or preferred language.
The Jordan scenario remains a testable product hypothesis, not a ministry fact.

### Security, database, and accessible-form standards

- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
  says every permission granted to a user or group should be explicitly
  justifiable, least-privileged, default-denied, and revalidated on every
  request.
- [OWASP Business Logic Security](https://cheatsheetseries.owasp.org/cheatsheets/Business_Logic_Security_Cheat_Sheet.html)
  requires server re-derivation of security values and warns that every feature
  granting the same permission must be guarded.
- [NIST SP 800-53 Release 5.2.0](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
  requires governed membership conditions, least privilege, privilege review,
  separation of duties, account lifecycle, and audit without prescribing one
  universal overlap rule.
- [PostgreSQL date/time types](https://www.postgresql.org/docs/current/datatype-datetime.html)
  stores timezone-aware timestamps internally in UTC and uses IANA timezone
  rules for display conversion.
- [PostgreSQL current time](https://www.postgresql.org/docs/current/functions-datetime.html)
  provides a transaction-stable current timestamp, enabling one consistent
  boundary across state, audit, epoch, and receipt.
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
  distinguishes `USING` and `WITH CHECK` and documents owner/`BYPASSRLS`
  bypass.
- [WCAG error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data)
  supports review/correction before consequential data changes while warning
  against confirmations for every ordinary save.
- [WCAG labels and instructions](https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html)
  requires clear option labels and required-input instructions.
- [WCAG redundant entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html)
  discourages asking for the same information again in one process.
- [ARIA radio pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
  supports a radio group with no initially checked option and defines its
  keyboard behavior.

**Implication:** the reason is legitimately fresh because it documents a new
security purpose—independent survival—not a repeat of the group's reason. Core
must preserve it after validation/network failure and cannot claim WCAG requires
an unpreselected duration; that is a proportionate product judgment for this
rare consequential exception.

## Strongest alternative: prohibit all overlap

Google PAM rejects another open same-scope grant against the same entitlement
and overlapping scheduled grants. A strict D40 could likewise refuse any new
direct source while group-derived D38 exists.

That alternative has real strengths:

- fewer authorization edges;
- simpler access review;
- no quiet persistence after group removal;
- no need to explain a present no-op/future effect; and
- easier proof that group removal ends the person's access.

Its best version would add a scheduled or atomic handoff rather than forcing a
manual gap. That replacement is not stronger for current Core:

- a group membership may carry capabilities besides D38;
- removing D38 from a group may affect many people;
- grant and membership administrators are intentionally distinct;
- a compound command would cross two authorization responsibilities;
- scheduled activation introduces pending, cancellation, rescheduling,
  time-zone, changed-source, retry, and stale-intent states; and
- an unknown/manual group transition cannot be aligned reliably to a scheduled
  direct start.

A short, explicit, independently governed overlap is the simpler permanent
handoff primitive. If production evidence shows it is never used or routinely
misunderstood, Core can disable the exception writer without changing D39
`EffectiveAccess`.

## Exact corrected decision

> When an exact Active Tenant Assignment already receives D38 through one or
> more current Access groups, the ordinary direct-grant action is unavailable.
> A current same-Tenant Phase 12 grant manager with a live assignable-
> capability ceiling covering D38 may deliberately choose **Add separate direct
> grant** as a secondary continuity action.
>
> Before input, Core lists every current group-derived D38 source and states:
> **Jordan already has this permission through Website Operations. Adding a
> direct grant will not change what Jordan can do now. It will let Jordan keep
> this permission if every group source ends.**
>
> The administrator must provide a newly entered concise reason explaining why
> access must continue independently after group access ends and make one
> explicit, initially unselected duration choice:
>
> - **Ends on… — recommended for a planned handoff or temporary coverage**
> - **Until removed — for an ongoing responsibility independent of group
>   membership**
>
> The reason is new purpose-specific evidence, not a text-uniqueness test. Core
> neither copies nor prepopulates a group reason. Helper text says not to enter
> sensitive ministry, personnel, missionary, or member-care detail.
>
> Selecting **Until removed** displays: **This direct grant will not expire. If
> group access ends, Jordan keeps this permission until an authorized person
> removes the grant or Jordan's Tenant assignment ends.**
>
> The server records typed continuity-exception provenance without parsing
> free text and snapshots the overlapping group-source identities/current heads
> in immutable audit and receipt evidence. It creates one independently
> revocable assignment-capability source with its own start, expiry, reason,
> actors, administrative authority/delegation, semantic identity, epoch, and
> receipt. The direct source's live validity never depends on a group source
> continuing to exist.
>
> At commit, the server re-proves the exact Tenant and Active Tenant
> Assignment, grant authority and live ceiling, no current direct D38 source,
> at least one current group-derived D38 path, the complete reviewed source
> heads, and all Phase 12 self/SoD/floor/epoch constraints. If the overlap has
> disappeared or changed, the command returns stale state and requires a
> refreshed ordinary direct-grant review; it never silently converts a no-
> current-effect exception into a grant that newly confers access.
>
> The direct source starts at successful commit. It does not copy group
> duration, auto-renew, auto-revoke when a group ends, auto-end when a group
> returns, transfer to a recreated assignment, or resume a stopped D37
> application. Every path remains independent. Only loss of the final current
> path fences later uncommitted D37 effects.
>
> Access detail, My Access, revoke review, and Phase 12 recertification show the
> current direct source with its duration and every current group source;
> authorized expanded provenance retains the continuity creation context.
> D41 presents a surviving direct-only source plainly as **Granted directly**
> and retains **Added for continuity** only in authorized expanded provenance/
> history, without a badge or conversion. Ending one source never claims
> effective revocation while
> another survives.
>
> D40 creates no Website-local handoff table, scheduled workflow, access-review
> engine, notification, reminder, email, task, holder minimum, or Inngest
> authority.

## UX and user journey

### Entry point

The normal person-access row first shows the current state:

```text
Apply Website recovery settings to current work

Through Website Operations
```

The normal **Grant permission** action is absent because Jordan already has
D38. An authorized grant manager can open a secondary, plainly named **Add
separate direct grant** action from the source/provenance detail or a guided
handoff link.

### Deliberate exception form

```text
Add a separate direct grant?

Jordan already has this permission through:
• Website Operations — Until removed
• Recovery Coordinators — Ends 30 September 2026

Adding a direct grant will not change what Jordan can do now.
It will let Jordan keep this permission if every group source ends.

Why must Jordan keep this permission independently?
[Required concise explanation]
Do not include private ministry or personnel details.

How long should the separate grant last? Required
( ) Ends on…  Recommended for a planned handoff
( ) Until removed  For an ongoing responsibility

[Cancel] [Add separate direct grant]
```

No duration is preselected. `Ends on…` appears first. Selecting `Until removed`
reveals the indefinite-survival warning inline; it does not open a second
dialog or require a typed phrase/checkbox acknowledgement.

### Success

```text
Separate direct grant added

Jordan's access is unchanged now. If all group sources end, this grant
keeps the permission through 30 September 2026.
```

The result persists on the page and in the receipt, is announced as a status,
and returns focus logically. A toast may supplement but never replace it.

### Later source changes

- If group membership ends first, the direct source becomes the sole path
  without a new grant event; the original receipt already authorized that
  future result.
- If the direct source expires/revokes first and a group survives, Core says
  the direct source ended and access remains through the named group.
- If all sources end at the same authoritative instant, final-path loss fences
  later D37 effects once.
- If a group path later returns, the direct source becomes redundant again but
  is not auto-deleted; its own duration/review continues.
- If the Active Tenant Assignment ends, every human D40 path ends. Rehire or a
  new assignment never revives it.

### Access review

Reviewers see:

```text
Direct continuity exception
Created 29 August 2026 by Priya Shah
Reason: Maintain Website recovery responsibility during team transition
Ends: 30 September 2026
Current other sources: Website Operations
```

If no group source remains, the grant is now the current direct source but its
creation provenance remains historical evidence. Review never depends on
parsing the reason text.

## Temporal and data safeguards

1. The direct source has one transaction-stable `starts_at` and independent
   nullable `expires_at`/`Until removed` representation.
2. Store authoritative instants as `timestamptz`/UTC and preserve the user's
   selected IANA zone for faithful confirmation and audit display where needed.
3. Define validity with an exact half-open interval so equality at expiry has
   one meaning.
4. Do not add a cross-source exclusion constraint: direct/group overlap is the
   authorized state.
5. Enforce at most one current semantic direct D38 source for the Tenant +
   Active Tenant Assignment + capability.
6. The continuity provenance may snapshot group source IDs/labels/heads in
   history, but no live FK or cascade makes the direct source end with a group.
7. A duration extension/`Until removed` conversion is a newly authorized
   successor command with current evidence; it is not an in-place silent
   overwrite.
8. One Phase 12 command commits direct source, source-head evidence, one epoch,
   append-only audit, and receipt atomically.
9. `USING` and `WITH CHECK` prevent cross-Tenant/source mutation; owner,
   service-role, `BYPASSRLS`, RPC, support, repair, job, and import paths
   reproduce the same boundary.
10. Timer jobs may discover expiration but are not authority. Every PEP resolves
    the direct path's current time/epoch/state before protected action.

## Research outcomes

### Problem validity, repository consistency, and alternatives

- **D40-RA001 — Repository fact:** D39 intentionally leaves new redundant
  direct D38 creation unavailable until D40, so D40 resolves a real missing
  command rather than revisiting additive access.
- **D40-RA002 — Repository fact:** D38 authorizes only the narrow D37 current-
  work operation, so D40 cannot be used as a generic Tenant super-permission.
- **D40-RA003 — Repository fact:** current Core has no D40 runtime or durable
  direct/group grant UX, so all described behavior remains intended.
- **D40-RA004 — Repository fact:** Phase 12 already owns assignment-capability
  grants, group sources, epochs, audit, receipts, and access explanation;
  therefore D40 adds no Website IAM.
- **D40-RA005 — Verified external fact:** Microsoft supports direct assignment
  policies for identities that already have underlying access.
- **D40-RA006 — Verified external fact:** Salesforce permits an individual
  permission set to coexist with group-derived permission.
- **D40-RA007 — Verified external fact:** Google conditional access proves that
  a redundant source may be a present no-op yet a future survivor.
- **D40-RA008 — Verified external fact:** Google PAM rejects duplicate same-
  scope open grants within one entitlement, validating prohibit-overlap as the
  strongest alternative.
- **D40-RA009 — Product judgment:** Core chooses a deliberate overlap because
  its independent direct and group sources have separate owners/lifecycles and
  support a narrower no-gap handoff.
- **D40-RA010 — Product judgment:** if the protected exception cannot be
  explained and audited, Core keeps the writer disabled rather than permitting
  an ordinary duplicate.

### Scope, entry preconditions, and exception provenance

- **D40-RA011 — Repository fact:** D40 applies only when the same exact Active
  Tenant Assignment currently receives D38 through at least one group source.
- **D40-RA012 — Requirement inference:** an already-current direct source makes
  the D40 command idempotent/inapplicable rather than creating a second direct
  row.
- **D40-RA013 — Requirement inference:** reverse-order overlap—direct first,
  group later—remains D39 behavior and does not rewrite the direct source.
- **D40-RA014 — Requirement inference:** attaching D38 to a group whose member
  already has a direct source remains a group-wide D39 review, not D40.
- **D40-RA015 — Product judgment:** ordinary **Grant permission** is absent
  while D38 is already effective; the exception is a secondary action.
- **D40-RA016 — Requirement inference:** typed continuity provenance is stored
  as structured audit/current metadata and never inferred by parsing the
  reason.
- **D40-RA017 — Requirement inference:** the receipt snapshots every current
  group source/head that made the new direct grant redundant at review.
- **D40-RA018 — Requirement inference:** snapshot provenance does not make the
  direct source validity dependent on a group source.
- **D40-RA019 — Requirement inference:** if the group overlap disappears before
  commit, stale review fails rather than silently creating presently new access.
- **D40-RA020 — Requirement inference:** current grant authority, assignable-
  capability ceiling, self/SoD, Tenant, subject, floor, and epoch are re-proved
  at confirmation.

### Fresh reason, independent duration, and least privilege

- **D40-RA021 — Verified external fact:** OWASP says a permission to a user or
  group should be explicitly justifiable.
- **D40-RA022 — Verified external fact:** Google PAM can require a grant
  justification and records it in audit.
- **D40-RA023 — Verified external fact:** Microsoft direct access-package
  assignments can carry a new justification for record keeping.
- **D40-RA024 — Product judgment:** D40 requires a reason because overlap is an
  exception whose future effect is otherwise invisible.
- **D40-RA025 — Product judgment:** the reason asks why access must survive the
  group, not why Jordan needs D38 in general.
- **D40-RA026 — Requirement inference:** Core does not copy/prefill a group
  reason or require string uniqueness; the administrator supplies new
  purpose-specific evidence.
- **D40-RA027 — Requirement inference:** helper text and retention policy
  minimize sensitive personnel/ministry content in the reason.
- **D40-RA028 — Product judgment:** no duration is preselected because either
  choice materially changes future persistence.
- **D40-RA029 — Product judgment:** `Ends on…` is shown first and recommended
  for a known handoff or temporary coverage.
- **D40-RA030 — Product judgment:** `Until removed` remains available for
  ongoing independent responsibility but requires an explicit indefinite-
  survival explanation.

### Duration evidence and temporal semantics

- **D40-RA031 — Verified external fact:** Entra supports permanent assignments
  for frequent permanent responsibility and time-bound assignments for
  temporary/contract work.
- **D40-RA032 — Verified external fact:** Salesforce supports no-expiration and
  explicit expiration assignment choices.
- **D40-RA033 — Verified external fact:** Salesforce recommends expiration for
  short projects with known ends.
- **D40-RA034 — Verified external fact:** Google PAM requires fixed requested
  duration for temporary elevation.
- **D40-RA035 — Product judgment:** current evidence does not justify forcing
  every continuity source to expire.
- **D40-RA036 — Product judgment:** current evidence does not justify defaulting
  every continuity source to `Until removed`.
- **D40-RA037 — Requirement inference:** the direct source starts at successful
  command commit; scheduled future activation is outside D40.
- **D40-RA038 — Requirement inference:** direct and group expiry are evaluated
  independently; neither duration is copied or synchronized.
- **D40-RA039 — Requirement inference:** `Until removed` still ends on revoke,
  assignment end, suspension, capability retirement, or another governing
  terminal condition.
- **D40-RA040 — Requirement inference:** duration extension/conversion requires
  a current successor command and cannot silently mutate historical intent.

### Handoff, lifecycle, and final-path behavior

- **D40-RA041 — Product judgment:** the legitimate root case is preserving only
  D38 while a person leaves a group that may carry several other capabilities.
- **D40-RA042 — Product judgment:** the exception also supports a planned group-
  capability retirement without forcing an authority gap for selected people.
- **D40-RA043 — Assumption:** uncertain future group change is plausible but is
  not established ministry behavior.
- **D40-RA044 — Requirement inference:** group loss before direct expiry makes
  the direct source sole authority without a second grant event.
- **D40-RA045 — Requirement inference:** direct expiry/revoke while a group
  survives changes provenance but not `EffectiveAccess`.
- **D40-RA046 — Requirement inference:** returning group access does not
  auto-delete, pause, or shorten the independent direct source.
- **D40-RA047 — Requirement inference:** loss of one among several group
  sources does not change current access while any other path survives.
- **D40-RA048 — Repository fact:** only final-current-path loss fences later
  uncommitted D37 effects.
- **D40-RA049 — Repository fact:** committed D37 source changes remain
  immutable and no regrant resumes a stopped application.
- **D40-RA050 — Requirement inference:** assignment end and recreated
  assignment identity never transfer or revive the continuity source.

### Effective access, removal, and truthful outcomes

- **D40-RA051 — Verified external fact:** AWS complete revocation removes every
  group and every direct assignment.
- **D40-RA052 — Verified external fact:** Salesforce expiry of one assignment
  leaves other grant sources effective.
- **D40-RA053 — Verified external fact:** Microsoft access review may not remove
  group-retained access when another assignment is denied.
- **D40-RA054 — Requirement inference:** D40 success says current access is
  unchanged and describes the authorized future survival interval.
- **D40-RA055 — Requirement inference:** direct-source removal names the ended
  source and every surviving group source.
- **D40-RA056 — Requirement inference:** group-source removal names the direct
  survivor and never says effective D38 was revoked.
- **D40-RA057 — Requirement inference:** direct expiry while a group survives
  produces a source-expired outcome, not an access-lost outcome.
- **D40-RA058 — Requirement inference:** final-path loss advances one epoch and
  produces one effective-access-ended outcome.
- **D40-RA059 — Requirement inference:** no stored `is_holder` or exception flag
  substitutes for current resolver computation.
- **D40-RA060 — Requirement inference:** access detail shows one D38 capability,
  source count, every source, duration, and current effective state.

### Information architecture and interaction UX

- **D40-RA061 — Repository fact:** D40 belongs in Phase 12 **People & access**
  person provenance, not Website settings or Access-group membership editing.
- **D40-RA062 — Product judgment:** **Add separate direct grant** is clearer
  than **Grant permission** because Jordan already has the permission.
- **D40-RA063 — Product judgment:** the review begins with current sources
  before requesting reason or duration.
- **D40-RA064 — Product judgment:** the primary explanation distinguishes
  present no-op from future persistence in two short sentences.
- **D40-RA065 — Product judgment:** multiple current groups appear as a semantic
  list with individual duration, not “through a group.”
- **D40-RA066 — Product judgment:** `Ends on…` and `Until removed` include
  purpose-oriented descriptions rather than only date mechanics.
- **D40-RA067 — Product judgment:** selecting `Until removed` reveals a
  persistent inline warning and no second modal/typed phrase.
- **D40-RA068 — Product judgment:** one deliberate review is proportionate;
  routine repeated confirmations would add friction without more proof.
- **D40-RA069 — Requirement inference:** validation or network failure
  preserves reason, duration, source context, scroll, and focus.
- **D40-RA070 — Requirement inference:** success is persistent and receipt-
  backed; a toast is supplemental only.

### Authorization, Tenant safety, and privacy

- **D40-RA071 — Repository fact:** possessing D38 is neither necessary nor
  sufficient to create a D40 direct source.
- **D40-RA072 — Repository fact:** only current same-Tenant grant authority
  within live assignable-capability ceiling may create the source.
- **D40-RA073 — Requirement inference:** candidate, source, actor, grantor,
  Tenant, capability, and current `EffectiveAccess` are server-derived.
- **D40-RA074 — Requirement inference:** wrong-Tenant, pending, inactive,
  ended, nonstaff, donor, missionary, public, support, service, AI, and agent
  subjects remain ineligible.
- **D40-RA075 — Requirement inference:** current group-source disclosure is
  visible only to authorized access administrators and the subject's allowed
  My Access projection.
- **D40-RA076 — Requirement inference:** the reason and receipt contain no D37
  source record, protected worker, correction, or cohort detail.
- **D40-RA077 — Repository fact:** task/coordinator/reviewer status cannot
  justify or create a continuity source by implication.
- **D40-RA078 — Requirement inference:** Party merge, Tenant clone, import,
  restore, environment copy, or rehire infer no continuity source.
- **D40-RA079 — Requirement inference:** group rename updates current display
  while immutable audit preserves the reviewed source identity/label snapshot.
- **D40-RA080 — Product judgment:** D40 adds no automated holder recommendation
  based on staff count, task state, cohort size, or usage.

### Database, RLS, idempotency, and concurrency

- **D40-RA081 — Requirement inference:** one semantic current direct source is
  unique by Tenant, Active Tenant Assignment, and capability.
- **D40-RA082 — Requirement inference:** direct/group overlap is deliberately
  allowed, so no exclusion constraint spans source types.
- **D40-RA083 — Requirement inference:** source validity uses exact UTC
  instants with a documented half-open boundary.
- **D40-RA084 — Verified external fact:** PostgreSQL timezone-aware timestamps
  store internally in UTC and support IANA display conversion.
- **D40-RA085 — Verified external fact:** PostgreSQL transaction current time
  is stable, allowing one consistent state/audit/epoch/receipt instant.
- **D40-RA086 — Requirement inference:** same-Tenant composite keys bind the
  direct source to the exact Active Tenant Assignment.
- **D40-RA087 — Requirement inference:** subject, Tenant, capability,
  provenance kind, start, actor, and governing source identity are immutable
  or append-only.
- **D40-RA088 — Verified external fact:** PostgreSQL `USING` and `WITH CHECK`
  protect visible existing rows and proposed new state separately.
- **D40-RA089 — Requirement inference:** one expected-head transaction
  serializes concurrent group-end/direct-exception creation and returns stale
  consequence instead of guessing intent.
- **D40-RA090 — Requirement inference:** semantic replay returns the original
  receipt; conflicting reuse or a second current direct source fails safely.

### Review, observability, operations, and dependencies

- **D40-RA091 — Requirement inference:** Phase 12 access review shows direct
  exception and group sources as separately remediable edges.
- **D40-RA092 — Requirement inference:** review preserves creation reason,
  duration, creator/authority, overlap snapshot, current sources, and current
  effect.
- **D40-RA093 — Requirement inference:** once all group sources end, historical
  continuity provenance remains while current UI truthfully presents the
  direct source as effective.
- **D40-RA094 — Product judgment:** D40 reuses Phase 12 risk-based
  recertification and does not create a local review campaign.
- **D40-RA095 — Requirement inference:** security audit distinguishes created-
  while-redundant, became-sole-source, source-expired, revoked, and assignment-
  ended events without rewriting history.
- **D40-RA096 — Requirement inference:** a monitor treats any ordinary-flow
  redundant source, missing reason/duration, or false revoke message as a
  defect; zero exceptions is healthy.
- **D40-RA097 — Requirement inference:** access support can answer “why does
  Jordan still have D38?” without direct database repair or audit-log scans.
- **D40-RA098 — Repository fact:** Inngest may reconcile an identifier-only
  projection but never starts, expires, renews, or revokes the direct source.
- **D40-RA099 — Requirement inference:** timer delay cannot extend authority
  because each PEP re-evaluates time/state/epoch.
- **D40-RA100 — Product judgment:** D40 produces no default email, reminder,
  notification, task, or holder-presence SLO.

### Accessibility, localization, and field conditions

- **D40-RA101 — Verified external fact:** WCAG supports review/correction before
  consequential stored-data changes.
- **D40-RA102 — Verified external fact:** WCAG warns against confirmations for
  every ordinary save; therefore D40's extra review stays limited to the rare
  exception.
- **D40-RA103 — Verified external fact:** WCAG requires labels/instructions for
  every option and required input.
- **D40-RA104 — Verified external fact:** ARIA permits a radio group with no
  checked option and defines predictable keyboard selection.
- **D40-RA105 — Verified external fact:** WCAG discourages redundant entry;
  therefore Core preserves form input on failure and does not ask users to
  retype it during review.
- **D40-RA106 — Product judgment:** a fresh continuity reason is not redundant
  entry because it documents a different security purpose from the group
  reason.
- **D40-RA107 — Repository fact:** Core uses shared Base Maia/Base UI and 44px
  important targets; the seed Teams controls are not the target.
- **D40-RA108 — Requirement inference:** the form reflows at 320 CSS pixels,
  uses semantic source lists, and avoids a wide permission matrix.
- **D40-RA109 — Requirement inference:** long international names/group labels,
  RTL, CJK, plurals, locale date/time zones, forced colors, and reduced motion
  receive explicit tests.
- **D40-RA110 — Requirement inference:** source, warning, option, and outcome
  meaning never depends only on color, icon, hover, motion, or visual proximity.

### Rollout, traceability, assumptions, and D41–D42

- **D40-RA111 — Repository fact:** fresh-build posture permits a correct schema,
  but broad current roles/seeds provide no safe continuity backfill evidence.
- **D40-RA112 — Requirement inference:** migration creates zero D40 exceptions
  and infers none from current group/direct overlap.
- **D40-RA113 — Requirement inference:** D39 readers/provenance, source-aware
  revoke, protected-group enforcement, expected heads, RLS, and receipts ship
  before the exception writer.
- **D40-RA114 — Requirement inference:** mixed versions that cannot understand
  continuity provenance fail closed and cannot create the source.
- **D40-RA115 — Requirement inference:** rollback stops new creation but
  preserves existing source validity, audit, receipts, and readable provenance
  for roll-forward correction.
- **D40-RA116 — Requirement inference:** release proof covers finite and
  indefinite duration, one/multiple groups, every source ordering, concurrent
  group loss, expiry equality, revoke, assignment end, RLS bypass, and
  accessibility.
- **D40-RA117 — Assumption:** current evidence does not establish how often
  ministries need continuity overlap or who performs each half of the handoff.
- **D40-RA118 — Assumption:** later usability evidence must test one-admin,
  separate grant/membership administrators, rotating team, mobile, and weak-
  network scenarios without weakening safety invariants.
- **D40-RA119 — Product judgment:** D40 remains Reserved until present-no-op/
  future-persistence comprehension, typed provenance, independent duration,
  stale-head behavior, Tenant isolation, and privileged-path proof are complete.
- **D40-RA120 — Resolved boundary and visibility:** D41 presents the
  still-current direct source as **Granted directly** and keeps **Added for
  continuity** in authorized expanded provenance/history without conversion.
  D42 now defines the exact viewer/purpose tiers for group labels, reason,
  actors, and basis. Phase 12 risk-based recertification already governs and
  D40 adds no review-by subsystem.

## Evidence limits

- Microsoft, Google, AWS, Salesforce, GitHub, and Contentful establish
  overlapping-source and independent-lifecycle behavior; none proves Core
  should expose this exception for D38.
- Google PAM's duplicate prohibition applies to grants against the same PAM
  entitlement and scope, not automatically to one ordinary group IAM binding
  plus one direct source. It is strong counterevidence, not a directly binding
  rule.
- Salesforce and Contentful demonstrate additive access but not D40's
  persistence-focused warning or fresh-reason UX.
- Blackbaud and Neon validate nonprofit access flexibility but provide no
  direct evidence for missions-ministry handoff frequency, staffing,
  terminology, or appetite for indefinite continuity.
- No direct user study proves administrators understand “no present change,
  future survivor,” `Ends on` versus `Until removed`, or the secondary action
  label.
- D35–D40 runtime does not exist. Temporal, concurrency, RLS, cache,
  accessibility, and low-bandwidth claims remain requirements awaiting proof.

## Final research disposition

**Accept with required amendments.** Permit at most one direct D38 continuity
source while one or more group sources are current, but only through the
secondary purpose-built flow. The review must state that present ability is
unchanged and future persistence changes; require a new continuity-specific
reason; require an explicit unpreselected `Ends on` or `Until removed` choice;
give `Until removed` an indefinite-survival warning; and commit typed
provenance, independent lifecycle, epoch, audit, and receipt under current
expected heads.

If those conditions cannot be proved, prohibit redundant direct creation.
Never degrade to the ordinary direct-grant flow.

## D41 resolution and D42 boundary

D41 records Option 1 with required amendments. People & access presents a
surviving direct-only source as **Direct grant** and My Access says **Granted
directly to you**, each with the direct source's own current end condition.
Authorized **Why this person has access** / **Why you have access** provenance/
history retains **Added for continuity** and immutable event history. Last-
group loss causes no conversion,
reissue, badge, task, notification, or new authorization write; existing Phase
12 epoch invalidation drives the newly derived source list.

D42 now resolves the viewer/purpose disclosure tiers: the exact subject
receives only safe origin/date copy, membership review receives survivor/end
only, grant governance receives floor-minimized evidence, and full typed
evidence requires separate audit-read authority/purpose/floor. Phase 12's
existing risk-based recertification remains authoritative; D40/D41 add no
separate review-by calendar, task, notification, or reminder.
