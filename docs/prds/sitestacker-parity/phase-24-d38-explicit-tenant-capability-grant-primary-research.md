# Phase 24 D38 — Explicit Tenant Capability Grant Primary Research

**Research date:** 2026-08-29  
**Decision under review:** explicit Tenant governance grant with zero effective
holders allowed.  
**Scope:** Core repository/governing decisions; current IAM, nonprofit CRM, CMS/
SaaS administration, database/RLS, and accessible grant/revoke UX evidence.  
**Verification note:** broad repository validation remains deferred until the
end of the Grill session by founder direction.

## Research question

Is a zero-by-default, explicit Tenant grant for the D37 organization-wide
Website recovery operation current modern practice, and what exact grant,
revocation, provenance, data, authorization, and UX constraints make it safe,
clear, flexible, and consistent with Core?

## Evidence labels

- **Repository fact:** verified directly in current Core source/docs.
- **Verified external fact:** supported by a current primary source.
- **Reasonable inference:** follows from those facts but needs implementation
  proof.
- **Product judgment:** selected tradeoff.
- **Assumption:** requires future ministry-user or production evidence.
- **Unresolved unknown:** later founder decision.

## Executive finding

Yes—**with required amendments**. Explicit principal + capability + scope
assignment, default deny, separate grant administration, optional expiry,
effective-access explanation, and auditable revocation are current practice
across mature IAM and SaaS products. Zero is appropriate because D38 is an
optional operation and Core retains a complete safe fallback.

Modern practice does **not** mean copying enterprise PIM wholesale. D38 should
reuse Phase 12, not add Website-local roles, approvals, JIT, access campaigns,
or a holder minimum. Core's most important product-specific corrections are:

1. the current Teams & Users UI is a seed-backed demo, not a production access
   product;
2. current `admin` checks include ordinary staff and cannot authorize grants;
3. Phase 12 needs a general `explicit_only` capability class so D38 is not
   hidden in Web Studio Admin;
4. zero D38 holders must not mean zero `permissions.manage` holders;
5. effective holder/provenance—not grant rows—owns truthful revoke UX; and
6. holders need a focused D37 route even when they cannot edit policy.

## Current Core repository evidence

| Repository evidence                                                                                                          | Finding                                                                                                                                                         | D38 consequence                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [`packages/auth/permissions.ts`](../../../packages/auth/permissions.ts)                                                      | Only four broad staff capabilities exist and all staff subroles receive the same set; `hasRole("admin")` admits staff.                                          | No existing role/capability can grant or exercise D38.                            |
| [Phase 12 PRD](./phase-12-full-role-permission-configuration.md)                                                             | One PDP, code registry, Active Tenant Assignment, groups/named grants, epoch, delegation, audit, last-manager guard, and locked mutation boundary are ratified. | D38 must be a Phase 12 consumer, not a Website IAM system.                        |
| [MVP membership migration](../../../supabase/migrations/20260226113000_authz_memberships_foundation.sql)                     | Current membership schema has role/subrole and broad service access; full Phase 12 grant state is not implemented.                                              | D38 remains Reserved until Phase 12 and privileged parity exist.                  |
| [Teams UI](<../../../apps/admin/app/(app)/admin/teams/teams-sections.tsx>)                                                   | Generic module selects use local defaults; Save Changes closes a Sheet. Several controls are 28–32px and styling is prototype-specific.                         | Preserve shared component language, not this persistence or interaction contract. |
| [Admin workspace collections](../../../packages/database/collections/admin-workspace.ts)                                     | Teams and members clone hard-coded seed arrays.                                                                                                                 | Current UI cannot be called an existing permission-management capability.         |
| [Frontend rules](../../ai/rules/frontend.md) and [accessibility review skill](../../ai/skills/accessibility-review/SKILL.md) | Core requires shared Base Maia/Base UI, semantic tokens, accessibility, focus/status, and 44px touch behavior.                                                  | D38 uses one responsive, persistent, non-nested shared-component flow.            |
| [D37 adversarial review](./phase-24-d37-complete-tenant-current-work-cohort-adversarial-review.md)                           | Application capability is narrow, separate, and grants exact aggregate consequence but no source detail.                                                        | Grant UX must preserve those exact non-effects and revocation fence.              |

## Current primary-source evidence

### Microsoft Entra

- [Entra RBAC overview](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/custom-overview)
  defines role assignment as security principal + role definition + scope,
  supports direct and role-assignable-group assignment, denies absent actions,
  and provides assignment listing/access review.
- [Role-assignable groups](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/groups-concept)
  improve consistency and audit at scale but require protected membership,
  prohibit nesting, and warn about unintended elevation through group
  administration.
- [PIM role settings](https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-how-to-change-default-settings)
  support eligible/active, permanent/time-bound, justification, approval, and
  notifications as configurable governance—not a universal requirement.
- [Assign roles in PIM](https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-how-to-add-role-to-user)
  distinguishes permanent frequent responsibility from temporary work.

**Implication:** use one narrow assignment and explain principal, scope, source,
state, and duration. Direct and group assignment can coexist when governed.
Do not require PIM/JIT just because Entra offers it.

### Google Cloud IAM

- [Allow policies](https://docs.cloud.google.com/iam/docs/allow-policies)
  state that most default policies are empty.
- [Limits on granting roles](https://docs.cloud.google.com/iam/docs/setting-limits-on-granting-roles)
  support limiting which roles a delegated administrator may grant/revoke and
  warn that grantable role-management permissions can enable self-escalation.
- [Google group best practices](https://docs.cloud.google.com/iam/docs/groups-best-practices)
  recommend access groups for job functions while warning about external
  members, propagation delays, divergence, and over-broad group administration.

**Implication:** zero is normal; a grantor needs a live ceiling; groups are
useful but not automatically safe and cannot come from an uncontrolled
external/dynamic source.

### GitHub

- [Organization roles](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization)
  grant narrow organization actions to individuals or teams without full
  organization administration.
- [Using organization roles](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/using-organization-roles)
  provides explicit assignment, assignment listing, and removal.
- [Custom organization-role permissions](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-peoples-access-to-your-organization-with-roles/permissions-of-custom-organization-roles)
  separate narrow organization capabilities and note that managing role
  definitions does not automatically grant all role-assignment powers.

**Implication:** D38 can be an organization-wide narrow permission without
granting repository/source data. GitHub's recommended minimum of two owners is
about existential ownership continuity and does not justify a D38 holder
minimum.

### Salesforce and nonprofit CRM evidence

- [Salesforce external access best practices](https://help.salesforce.com/s/articleView?id=platform.networks_access_best_practices.htm&language=en_US&type=5)
  recommend least privilege, permission sets/groups rather than profiles,
  periodic review, access summaries, and **Access Granted By** provenance.
- [Salesforce permission assignment expiration](https://help.salesforce.com/s/articleView?id=platform.permissions_assign_expire_how.htm&language=en_US&type=5)
  supports no expiration or an explicit date/time-zone expiry.
- [Salesforce permission-set groups](https://trailhead.salesforce.com/content/learn/modules/permission-set-groups/create-a-permission-set-group)
  organize permissions by job function and reiterate least privilege.
- [Blackbaud CRM Security Guide](https://webfiles-sc1.blackbaud.com/files/support/guides/enterprise/400/security.pdf)
  documents role-based access and removing users when responsibilities no
  longer match. It is older evidence and not a modern UX authority.

**Implication:** central permission sets/groups and explainable effective access
fit nonprofit administration; current Blackbaud guidance supports lifecycle
alignment but should not override newer standards or Core ADRs.

### Security, database, and accessibility standards

- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
  recommends least privilege, deny by default, and validating authorization on
  every request.
- [NIST SP 800-53 Rev. 5.1](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
  covers account management, separation of duties, least privilege, and audit.
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
  documents owner/`BYPASSRLS` bypass and the distinct role of `USING` and
  `WITH CHECK`.
- [W3C modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
  requires contained logical focus and restoration and recommends least-
  destructive initial focus for hard-to-reverse actions.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) requires operable, understandable,
  robust interfaces including focus, reflow, labels, and status behavior.

**Implication:** grant/revoke must be server-authorized, RLS-defended,
privileged-path-safe, and accessible. One focused review is proportionate;
toast-only, nested-dialog, role-label, or long-lived-token authority is not.

## Alternatives

### Option 1 — explicit grant; zero effective holders — selected

Best least privilege and quiet fallback. Requires central grant authority,
provenance, reachable holder UX, and immediate revocation.

### Option 2 — automatic Tenant Admin/Owner grant

Lowest setup friction but unsafe in current Core and permanently collapses the
separate operation boundary. A grant manager can explicitly grant themselves
when appropriate; exercise need not be implicit.

### Option 3 — policy-editor implication

Convenient but directly contradicts D36/D37's separation of future
configuration from Tenant-wide current adoption. Reject.

### Strongest no-build alternative

Leave D38 unassigned forever. Prospective policy and Needs assignment remain
complete. This is not failure; it is the safe posture for Tenants that do not
need bulk current adoption.

## Detailed user journey synthesis

### Grant administrator

1. Opens **People & access** under Mission Control Administration.
2. Selects a person for a typed direct grant or a protected flat Access group,
   as resolved by D39.
3. Opens **Additional permissions → Website operations**.
4. Reads exact organization-wide ability and non-effects before selection.
5. Chooses duration and enters one concise business reason.
6. Reviews current server-proved subject, scope, provenance, and consequence.
7. Confirms; the server reauthorizes under expected head.
8. Receives persistent receipt and current EffectiveAccess explanation.

### Holder

1. Sees the capability, source(s), and duration in **My Access**.
2. Uses **Open current-work updates**.
3. Reaches only D37's safe policy/aggregate operation route.
4. Reviews and applies through D37; no policy editing or source browsing
   appears.

### Policy editor without D38

1. Saves D35 prospectively.
2. Sees **Setting saved for new returned work. Existing work has not changed.**
3. Sees no disabled application control, holder roster, request dead end, or
   backlog oracle.

### Access manager revokes

1. Opens current provenance.
2. Chooses one direct/group source or the action appropriate to the source.
3. Server computes post-change EffectiveAccess and any safe active-application
   consequence.
4. Review distinguishes “still has access through…” from “will lose access.”
5. Commit advances the epoch atomically.
6. Persistent receipt states the actual result; D37 stops uncommitted members.

### Zero, conflict, and recovery

- Zero: neutral empty state only in access administration.
- Stale review: nothing changes; current access is reloaded.
- Lost response: semantic receipt lookup before retry.
- Assignment end: deny immediately; no transfer to a new assignment.
- Regrant: new generation and fresh D37 application.
- Store uncertainty: deny D38 while source recovery remains available.

## Research outcomes

### Decision validity and repository consistency

- **D38-RA001:** D38 solves optional organization-wide operation authority, not
  Website role naming.
- **D38-RA002:** Prospective-only/source-lane operation is the valid no-build
  alternative.
- **D38-RA003:** Automatic Admin grant is the strongest convenience alternative
  and is rejected because current Admin includes ordinary staff.
- **D38-RA004:** Policy-editor implication contradicts D36/D37.
- **D38-RA005:** The current repo has no implemented D38 atom.
- **D38-RA006:** The current repo has no durable generic capability-grant UI.
- **D38-RA007:** The Teams page is useful visual evidence but not authority.
- **D38-RA008:** Phase 12 is the governing permanent grant platform.
- **D38-RA009:** D38 must remain Reserved until Phase 12/OpenSpec evidence.
- **D38-RA010:** No existing code is treated as correct merely because it
  exists.

### Capability classification and defaults

- **D38-RA011:** The D38 action is narrow and organization-wide.
- **D38-RA012:** D38 grants operation-safe aggregate status but no source data.
- **D38-RA013:** Zero effective holders is valid.
- **D38-RA014:** Most Google Cloud resource allow policies default empty.
- **D38-RA015:** Default deny is OWASP-recommended.
- **D38-RA016:** A GitHub owner minimum is not evidence for a D38 holder minimum.
- **D38-RA017:** Owner/Admin/Web Studio/policy editor cannot imply D38.
- **D38-RA018:** D38 belongs in no seeded group or friendly module rung.
- **D38-RA019:** Phase 12 needs a general explicit-only catalog, not an ad hoc
  exception.
- **D38-RA020:** Zero D38 holders does not alter the separate last-
  `permissions.manage` invariant.

### Grant authority, delegation, and recovery

- **D38-RA021:** Grant authority and operation possession are different
  capabilities.
- **D38-RA022:** A grant manager need not hold D38.
- **D38-RA023:** Requiring a D38 holder to grant D38 creates zero-holder lockout.
- **D38-RA024:** `permissions.manage_grants` plus live ceiling is Core's proper
  authority.
- **D38-RA025:** Google supports limiting which roles an administrator may
  grant/revoke.
- **D38-RA026:** Delegated grant scope/ceiling must be re-read live.
- **D38-RA027:** D38 must reuse Phase 12's self-grant/quorum rules.
- **D38-RA028:** Platform support is not an implicit Tenant grantor.
- **D38-RA029:** Zero is recoverable through the access-management capability.
- **D38-RA030:** D38 creates no parallel break-glass or approval product.

### Subject identity and eligibility

- **D38-RA031:** Human grants must bind Active Tenant Assignment, not profile.
- **D38-RA032:** A person serving two Tenants has two distinct authorization
  hats.
- **D38-RA033:** Email/name/job title/role cannot be subject identity.
- **D38-RA034:** Pending/inactive/ended assignments cannot be holders.
- **D38-RA035:** A new assignment must not revive an old grant.
- **D38-RA036:** Suspension/freeze must produce zero current access.
- **D38-RA037:** Donor/missionary/external reviewer are not D38 staff subjects.
- **D38-RA038:** Service/AI/support identities need separate future decisions.
- **D38-RA039:** Merge/clone/import cannot infer grant transfer.
- **D38-RA040:** Candidate search itself must be Tenant/purpose authorized.

### Direct/group assignment and provenance

- **D38-RA041:** Entra, GitHub, Google, and Salesforce support person and/or
  governed group assignment.
- **D38-RA042:** Direct assignment is clearest for one-off/small populations.
- **D38-RA043:** Groups reduce repeated grants for stable job functions.
- **D38-RA044:** Group assignment is unsafe without protected membership.
- **D38-RA045:** Entra privileged groups prohibit nesting and dynamic
  membership.
- **D38-RA046:** Google warns external members can undermine restrictions.
- **D38-RA047:** Salesforce access is additive across permission sources.
- **D38-RA048:** Effective holder count must deduplicate multiple paths.
- **D38-RA049:** Removing one path may not remove access.
- **D38-RA050:** D39 resolves both typed direct and protected flat Access-group
  surfaces through one EffectiveAccess model; implementation remains Reserved
  until proof.

### Grant/revoke interaction UX

- **D38-RA051:** Plain-language action labeling is clearer than “Admin.”
- **D38-RA052:** The description must name organization-wide scope.
- **D38-RA053:** The description must name non-effects before confirmation.
- **D38-RA054:** Subject, organization, permission, duration, and reason belong
  in one review.
- **D38-RA055:** A switch or default-on checkbox is too easy to mis-trigger.
- **D38-RA056:** A typed phrase is disproportionate for reversible permission
  administration.
- **D38-RA057:** Nested overlays make focus/mobile behavior brittle.
- **D38-RA058:** Success must be persistent and receipt-backed.
- **D38-RA059:** Revoke copy must reflect post-change EffectiveAccess.
- **D38-RA060:** Final-holder revoke should explain safe zero consequences
  without alarm styling.

### Duration, reason, and audit

- **D38-RA061:** Salesforce supports no-expiry and explicit expiry.
- **D38-RA062:** Entra distinguishes frequent permanent and temporary
  assignment.
- **D38-RA063:** Mandatory short expiry is not universally best practice.
- **D38-RA064:** “Until removed” plus optional expiry balances clarity/flexibility.
- **D38-RA065:** Expiry authority uses UTC, not UI locale.
- **D38-RA066:** A concise business reason improves accountability.
- **D38-RA067:** Reason must not become a protected source-text sink.
- **D38-RA068:** Grant/revoke is durable security/business history.
- **D38-RA069:** Telemetry alone is insufficient audit.
- **D38-RA070:** D38 should feed a future central access-review product, not
  create its own campaign.

### Effective access and revocation lifecycle

- **D38-RA071:** EffectiveAccess—not grant rows—owns current authority.
- **D38-RA072:** Current resolution includes direct/group/expiry/assignment/
  delegation/floor/epoch.
- **D38-RA073:** Revocation must advance the governance boundary atomically.
- **D38-RA074:** Long-lived JWT/cache claims cannot preserve revoked access.
- **D38-RA075:** D37 must reprove authority before each member commit.
- **D38-RA076:** Ending one source makes that source inert; only final post-
  change EffectiveAccess loss stops later uncommitted D37 work.
- **D38-RA077:** Committed D37 effects remain immutable.
- **D38-RA078:** Regrant never resumes a stopped application.
- **D38-RA079:** Revocation may expose only safe active-application
  consequence.
- **D38-RA080:** Revocation is not an application-specific Undo/Stop command.

### Information architecture and access comprehension

- **D38-RA081:** People & access is the durable administrative domain.
- **D38-RA082:** My Access should explain current possession/provenance.
- **D38-RA083:** The holder needs a focused safe exercise route.
- **D38-RA084:** The holder need not receive policy editing to reach D37.
- **D38-RA085:** The policy editor without D38 sees quiet prospective truth.
- **D38-RA086:** Disabled controls and request dead ends create noise/oracles.
- **D38-RA087:** Zero-holder state is shown only to access managers.
- **D38-RA088:** No Website-local roster is needed.
- **D38-RA089:** No permission management screen may expose D37 cohort details.
- **D38-RA090:** Holder count is security administration data, not performance
  or readiness data.

### Accessibility, localization, and field conditions

- **D38-RA091:** Core uses shared Base Maia/Base UI primitives.
- **D38-RA092:** Current prototype controls below 44px are not the target.
- **D38-RA093:** Consequential review needs explicit accessible title and
  subject.
- **D38-RA094:** W3C requires managed dialog focus and restoration.
- **D38-RA095:** Least-destructive focus is appropriate for revoke.
- **D38-RA096:** Persistent status is necessary after async/lost response.
- **D38-RA097:** Color/icon/hover cannot be the only provenance state.
- **D38-RA098:** 320px/400% reflow excludes wide permission matrices.
- **D38-RA099:** Locale/time zone and international names are correctness, not
  polish.
- **D38-RA100:** Low bandwidth requires receipt lookup and resumable state.

### Database, RLS, and privileged paths

- **D38-RA101:** Same-Tenant composite FKs make cross-scope relations
  unrepresentable.
- **D38-RA102:** Identity/scope columns must be immutable.
- **D38-RA103:** One active semantic path needs a database uniqueness rule.
- **D38-RA104:** History needs restrict/no-cascade semantics.
- **D38-RA105:** Browser authoritative writes must be revoked.
- **D38-RA106:** PostgreSQL owners/BYPASSRLS require explicit parity.
- **D38-RA107:** `USING` and `WITH CHECK` protect different mutation aspects.
- **D38-RA108:** Phase 12's locked command must own state+epoch+audit+receipt.
- **D38-RA109:** Service/RPC/support/repair/import/AI need negative tests.
- **D38-RA110:** Inngest is optional projection/reconciliation execution, not
  grant authority.

### Failure, scale, rollout, and traceability

- **D38-RA111:** Authorization uncertainty fails closed without breaking source
  recovery.
- **D38-RA112:** Lost response uses receipt lookup before retry.
- **D38-RA113:** Projection failure cannot preserve or confer authority.
- **D38-RA114:** Current resolution must use indexed heads, not audit scans.
- **D38-RA115:** Holder lists require Tenant-scoped pagination and stable
  governance snapshot.
- **D38-RA116:** Mixed versions that do not understand explicit-only fail
  closed.
- **D38-RA117:** Migration must prove zero inferred grants.
- **D38-RA118:** Rollback preserves grants/audit and never restores role
  implication.
- **D38-RA119:** Traceability must cover Grill through release evidence.
- **D38-RA120:** Activation remains Reserved until D39's protected direct/group
  and D40 continuity-source contracts and complete
  authorization, Tenant, concurrency, migration, accessibility, and privileged-
  path proof.

## Evidence limits

- Official enterprise IAM products establish mature patterns but operate at a
  different staffing/compliance scale from many ministries. They support
  explicit grants/provenance; they do not prove D38 needs PIM or approval.
- Blackbaud's cited guide is official but old. It supports role lifecycle only
  and is not relied upon for modern interaction design.
- No current direct user research proves how many D38 holders ministries will
  choose, how often they will apply current work, or how often direct versus
  group assignment will be used. D39 records both optional sources; later
  usability studies must use realistic scenarios and may improve guidance but
  never infer or convert access automatically.
- The current Teams UI shows present visual/product direction but is seed-backed
  and cannot be treated as shipped access behavior.
- No D35-D40 runtime exists, so all implementation claims remain requirements,
  not descriptions of shipped behavior.

## D39 resolution

Choose **both direct Active Tenant Assignment and governed flat-group
assignment through Phase 12**, with no seeded group, nesting, dynamic/external
membership, role implication, or separate Website roster. Mature IAM products
use direct assignment for one-offs and groups for stable job functions; one
EffectiveAccess/provenance/epoch model supports both without a second
authorization engine. `permissions.manage_grants` attaches D38 to a group; the
separate scoped `permissions.manage_membership` path manages people and must
prove a live protected-group administrative ceiling over the complete current
bundle/revision while exposing every resulting capability consequence. If Core
cannot prove that ceiling, complete provenance, and set-based group consequence
at implementation time, keep the group writer disabled rather than weaken the
model. See the [D39 adversarial review](./phase-24-d39-direct-and-governed-group-capability-assignment-adversarial-review.md)
and [D39 primary research](./phase-24-d39-direct-and-group-capability-assignment-primary-research.md).

## D40 resolution

D40 permits one deliberate **separate direct grant** only while the same exact
Active Tenant Assignment has current group-derived D38 and no direct source.
The current-source-first secondary flow explains that present ability is
unchanged while future survival changes, requires a fresh privacy-safe reason
and explicit unpreselected independent duration, and binds confirmation to the
complete current group-source set and grant authority.

The command reuses the typed direct relation, records immutable overlap-
creation evidence, advances one Tenant epoch, and never falls through into an
ordinary restorative grant when state changes. Later group loss leaves the
direct source current; only final post-change EffectiveAccess loss fences D37.
See the [D40 adversarial review](./phase-24-d40-deliberate-continuity-direct-grant-adversarial-review.md)
and [D40 primary research](./phase-24-d40-deliberate-continuity-direct-grant-primary-research.md).
