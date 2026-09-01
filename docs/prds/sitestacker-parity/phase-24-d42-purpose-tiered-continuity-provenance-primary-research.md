# Phase 24 D42 — Purpose-Tiered Continuity Provenance Primary Research

**Research date:** 2026-08-29  
**Decision under review:** disclose D40/D41 historical continuity provenance by
viewer and active purpose: a safe origin/date to the subject, current survivor
and end condition to a membership manager, review-relevant minimized provenance
to an authorized Phase 12 grant manager, full typed evidence only to a
separately authorized audit reader, and nothing to every other surface.  
**Scope:** self-service transparency, sensitive historical group/reason fields,
grant and membership management, security/audit reads, purpose limitation,
least privilege, read auditing, bulk export, logs, analytics/AI exclusions,
Tenant/RLS/cache boundaries, accessible UX, and the next safe-correction
decision.  
**Verification note:** broad formatting, local-link, skill-parity, strict
OpenSpec, lint, typecheck, unit, build, and diff checks remain deferred until
the end of the Grill session by founder direction.

## Research question

Is Option 1—purpose-tiered historical provenance—current modern practice and
the best permanent Core UX? What exact field ceiling should each viewer receive,
how must a viewer invoke a purpose, what evidence should be logged when
privileged history is read or exported, and what must remain unavailable to
ordinary product, support, analytics, AI, notification, and task surfaces?

## Evidence labels

- **Repository fact:** verified directly in current Core source/docs.
- **Verified external fact:** supported by a current official primary source.
- **Requirement inference:** a falsifiable requirement derived from repository
  and external facts; it still needs implementation proof.
- **Product judgment:** a selected product/security/UX tradeoff.
- **Assumption:** plausible but not established by ministry-user or production
  evidence.
- **Unresolved unknown:** requires a later founder decision or user research.

## Executive finding

The decision is **modern and proportionate with required amendments**.

Official current platforms consistently reject “authenticated administrator”
as one universal read tier:

- Microsoft allows people to review their own access in My Access, while audit
  activity and downloadable review history require designated reader or
  governance roles.
- GitHub can grant **View organization audit log** through a granular custom
  organization role instead of full ownership.
- Google separates Logs Viewer, Private Logs Viewer, field accessor, log-view
  accessor, Security Reviewer, and group-reader permissions; exported copies
  acquire their own destination access policy.
- Salesforce's User Access Summary explains current sources, while Setup Audit
  Trail requires **View Setup and Configuration** and exposes actor/change
  history separately.
- Contentful limits audit logs/access tools to organization Owner/Admin while
  ordinary members see only teams/spaces they belong to.
- Blackbaud places access-oriented user/role history under Security/Audit
  history for admins and records actor/change details.

Those products do not prove Core's exact fields. They establish the stronger
principle: **self transparency, operational management, grant governance, and
security audit are distinct purposes and should receive distinct projections**.

Option 1 needs these amendments:

1. **Subject/My Access** receives only current source/end condition plus the
   safe, on-demand historical summary **Added for continuity · [localized
   date]**. No historical group label, reason, actor, internal basis, receipt,
   other member, or protected detail is exposed.
2. **Membership manager** receives the current person/group/action context,
   surviving direct source, and end condition needed for a membership change.
   Membership authority grants no D40 origin/reason/actor/history read.
3. **Phase 12 grant manager/reviewer** receives the minimum human-readable
   provenance necessary to review/remediate the exact direct source: safe
   origin, event-time group summary, minimized reason, actor display, relevant
   source chronology within current Tenant/scope/capability ceiling.
4. **Audit reader** is not a synonym for grant manager. Full stable IDs, basis
   heads/hash, warning version, authority/delegation lineage, actor identifiers,
   raw typed receipt, and governed export require a distinct current Phase 12
   audit-read capability, a registered purpose, and the applicable floor/
   clearance. D42 adds no local step-up subsystem.
5. **Everyone else**—Website operators, Tasks Hub, donors, missionaries,
   public users, ordinary staff/support, notifications, analytics, scoring, AI,
   logs, caches without the exact purpose, and exports without separate
   authorization—receives no continuity-origin field.
6. The same human can qualify for more than one tier, but the active surface/
   server route invokes one registered purpose. My Access never silently unions
   grant-manager or auditor fields into the subject view.
7. Field ceilings are enforced server-side before serialization. Client hiding,
   route visibility, TypeScript omission, or a caller-supplied `view=auditor`
   parameter is not authorization.
8. Grant-manager protected provenance reads and every audit-tier read/export
   create a minimized, separately protected security access event. The event
   records who, Tenant, purpose, object, field class, outcome, time, and receipt/
   interaction ID—not the free-text reason or sensitive group label itself.
9. Audit/read logging failure fails protected provenance reads closed but never
   hides current access or the subject's safe summary. This avoids an unaudited
   privileged escape without making history authority.
10. Historical group names may reveal location, Member Care, security, staffing,
    or religious/ministry context. Purpose limitation and minimization prohibit
    reusing them for performance management, engagement/risk scoring, generic
    analytics, search suggestions, AI context, or notification copy.

The strongest alternative is Option 3—governance-only history. It offers the
smallest privacy surface and simplest My Access. It is weaker because a holder
cannot tell that an unexpected direct grant was deliberate or flag that it is
no longer appropriate. Entra self-review and user-visible current memberships
support safe self-transparency. The safe summary/date gives that benefit without
revealing the group or reason.

## Current, intended, and permanent state

| State                   | Verified position                                                                                                                                                                               | D42 consequence                                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Current repository**  | No D38–D42 runtime or purpose-tiered provenance projection exists; Teams & Users remains seed-backed.                                                                                           | No existing role check, Team sheet, client condition, or support path can be reused as the D42 boundary.                                     |
| **Governing baseline**  | D39/D40 own source authority and typed basis; D41 owns current-versus-history presentation and explicitly defers field audiences to D42.                                                        | D42 is read authorization only; it changes no grant, source, retention, recertification, or lifecycle.                                       |
| **Chosen posture**      | Option 1 gives each viewer the minimum context necessary for their current purpose.                                                                                                             | Subject transparency and governance explainability coexist without universal history disclosure.                                             |
| **Best permanent path** | One canonical immutable history, centrally registered viewer purposes, server-side field allowlists, distinct audit-read capability, purpose-keyed caches/exports, and protected read auditing. | No duplicated per-viewer history, ambient-role union, client redaction, local step-up, broad support/AI access, or raw browser audit SELECT. |

## Current Core repository evidence

| Repository evidence                                                                                                    | Finding                                                                                                                                                 | D42 requirement                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| [`packages/auth/permissions.ts`](../../../packages/auth/permissions.ts)                                                | Current runtime exposes only four broad staff capabilities and intentionally gives every staff subrole the same MVP set.                                | No current staff/admin/subrole check can select a D42 projection.                                                         |
| [`packages/graphql/handler.ts`](../../../packages/graphql/handler.ts)                                                  | Current generic `auditLogs` admits admin, staff, and super-admin role labels, then uses the admin client to select all audit-log columns.               | This is current behavior to retire, not a safe provenance reader or pattern to preserve.                                  |
| [Current authz migration](../../../supabase/migrations/20260226113000_authz_memberships_foundation.sql)                | Current `audit_logs` SELECT policy admits same-Tenant staff or `is_super_admin()`.                                                                      | D42 raw history must not reuse the broad MVP RLS path; purpose/field projection and privileged-path parity are mandatory. |
| [Current identity/access OpenSpec](../../../openspec/specs/identity-and-access/spec.md)                                | OpenSpec truthfully calls broader Mission Control access uniform across staff subroles and least-privilege narrowing forward work.                      | D42 is intended design, not shipped behavior; activation needs a later explicit OpenSpec delta and implementation proof.  |
| [Phase 12 PRD](./phase-12-full-role-permission-configuration.md)                                                       | Phase 12 owns grants, `EffectiveAccess`, current explanation, access governance, epochs, RLS, audit, and risk-based recertification.                    | D42 viewer purposes and audit-read capability belong in Phase 12, not Website or a D40 table.                             |
| [D39 adversarial review](./phase-24-d39-direct-and-governed-group-capability-assignment-adversarial-review.md)         | Direct/group source explanation is source-aware, same-Tenant, assignment-bound, and independent of current role badges/tasks.                           | Every D42 projection starts from the exact assignment/source and current viewer authorization.                            |
| [D40 adversarial review](./phase-24-d40-deliberate-continuity-direct-grant-adversarial-review.md)                      | The reason/basis is minimized audit evidence; ordinary holders and membership managers were deliberately denied full history.                           | D42 cannot retroactively turn audit rationale into a universal recipient message.                                         |
| [D41 adversarial review](./phase-24-d41-current-direct-source-historical-provenance-adversarial-review.md)             | Current source stays plain direct; origin is historical; D41 deliberately left group/reason/actor/receipt audiences for D42.                            | Viewer tiers must not change current-source rendering or make history required for access.                                |
| [D41 primary research](./phase-24-d41-current-direct-source-historical-provenance-primary-research.md)                 | The recommended next decision is purpose-tiered disclosure with a safe subject summary and privileged detailed history.                                 | D42 must replace broad “authorized viewer” language with a field-by-purpose contract.                                     |
| [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)                                          | One additive access model owns the source; D42 is a disclosure dependency, not another authority model.                                                 | No local D42 role, source kind, conversion, or precedence.                                                                |
| [`CONTEXT.md`](../../../CONTEXT.md)                                                                                    | Canonical terms include **Granted directly to you**, **Why you have access**, and historical **Added for continuity**; D42 owns exact detail audiences. | UX must keep those terms and avoid group/role/support vocabulary as authorization.                                        |
| [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)                                     | Tasks Hub is a work projection and never authorization/source truth.                                                                                    | D42 fields do not flow into tasks; D43 may later choose a source-backed correction request.                               |
| [Frontend rules](../../ai/rules/frontend.md) and [accessibility review](../../ai/skills/accessibility-review/SKILL.md) | Core uses Base Maia/Base UI, server-owned privileged reads/writes, semantic responsive accessible patterns, and explicit feedback/focus.                | Tiered fields use shared disclosures/detail routes; denial/failure is accessible and never a client-only hide.            |
| [`packages/ui/AGENTS.md`](../../../packages/ui/AGENTS.md)                                                              | UI must preserve semantic tokens, loading/error/disabled/focus/overflow/long-text states across responsive surfaces.                                    | Each tier needs deliberate empty/denied/stale/low-bandwidth behavior without a parallel design system.                    |

## Current official primary-source evidence matrix

### Microsoft Entra and My Access

| Official source                                                                                                                        | Verified fact                                                                                                                                                                                        | D42 implication                                                                                                                                     | Evidence limit                                                |
| -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [Self-review of access](https://learn.microsoft.com/en-us/entra/id-governance/self-access-review)                                      | A person can review their own current access to groups, applications, or access packages in My Access and say whether they still need it; a self-review and a review of others have different pages. | A safe subject-facing explanation and later correction action are established self-service patterns; self view need not equal administrator detail. | It does not show D40 history or define Core's fields.         |
| [My Access portal overview](https://learn.microsoft.com/en-us/entra/id-governance/my-access-portal-overview)                           | Users request/review their own access while administrators configure governance in the Entra admin center.                                                                                           | Holder and governance purposes should be distinct surfaces/projections.                                                                             | Microsoft product roles are not Core capabilities.            |
| [Access Microsoft Entra activity logs](https://learn.microsoft.com/en-us/entra/identity/monitoring-health/howto-access-activity-logs)  | Reports Reader is the least-privileged role to access activity logs; Security Administrator is required to configure diagnostic settings; API/stream/export paths have additional permissions.       | Full history, log administration, and export are independently authorized capabilities, not implied by current access management.                   | Entra role breadth/licensing should not be copied.            |
| [Application permission activity logs](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/app-perms-audit-logs)          | Reports Reader, Security Reader, Security Administrator, or Global Reader can inspect permission grant/removal events and actor details.                                                             | Actor/change evidence belongs to designated governance/security readers.                                                                            | This is application permission history, not human D40 grants. |
| [Downloadable access-review history](https://learn.microsoft.com/en-us/entra/id-governance/access-reviews-downloadable-review-history) | Only users authorized to view access reviews can create history reports; Microsoft names least-privilege roles, report filters, a separate CSV download, and a 30-day report-download window.        | View and export deserve separate purpose/capability contracts and exact report scope.                                                               | Core must choose its own retention and export format.         |

### GitHub

| Official source                                                                                                                                                                                                  | Verified fact                                                                                                                                                                       | D42 implication                                                                                                                          | Evidence limit                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [Roles in an organization](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization)                                                            | A custom organization role can contain the granular **View organization audit log** permission without full organization ownership; GitHub describes limiting high-privilege roles. | Core should use a distinct audit-read capability instead of treating grant management or Tenant administration as audit authority.       | GitHub's custom roles do not define Core's purpose/floor model.                    |
| [Review an organization audit log](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization)     | The log exposes actor, affected user, action, place, and time; authorized users can filter and separately export JSON/CSV, including identifiers and email/team data.               | Audit detail/export has materially broader exfiltration risk than a safe subject summary and requires a separate field/purpose boundary. | GitHub documents access/events, not whether audit-log reads themselves are logged. |
| [Organization audit-log events](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/audit-log-events-for-your-organization)               | Team/repository/member/organization-role changes are typed events with actor/user/team and timestamps.                                                                              | Stable typed history, not copied prose, should supply authorized D42 provenance.                                                         | Event/retention schemas are provider-specific.                                     |
| [Actor IP disclosure](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/displaying-ip-addresses-in-the-audit-log-for-your-organization) | IPs are hidden by default; owners may enable disclosure for compliance/threat response and are responsible for legal obligations.                                                   | Even audit readers need field minimization/clearance; possessing log access need not expose every sensitive field.                       | IP is not a D40 field, but it is a strong field-tier precedent.                    |

### Google Cloud IAM, Policy Intelligence, and Logging

| Official source                                                                                             | Verified fact                                                                                                                                                 | D42 implication                                                                                                                                    | Evidence limit                                                  |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [Policy Analyzer overview](https://docs.cloud.google.com/policy-intelligence/docs/policy-analyzer-overview) | It answers who has what access; expanding groups requires sufficient group permissions and is bounded.                                                        | Historical/current group detail must not be revealed merely because a person-level access result is visible.                                       | Analyzer is eventually consistent and not Core authority.       |
| [Analyze allow policies](https://docs.cloud.google.com/policy-intelligence/docs/analyze-iam-policies)       | Group expansion needs a separate `groups.read` permission/Groups Reader Admin role; the API can output group edges and export analysis.                       | Group membership and source-edge visibility are independently permissioned from basic access explanation.                                          | Google Workspace group permissions are not Core's field policy. |
| [Troubleshoot policies](https://docs.cloud.google.com/iam/docs/troubleshoot-policies)                       | Security Reviewer is the recommended role to view all allow/deny policies affecting a resource.                                                               | Full policy/basis explanation belongs to a security/review purpose rather than all current holders.                                                | Troubleshooter is not an immutable audit history.               |
| [Cloud Audit Logs overview](https://docs.cloud.google.com/logging/docs/audit)                               | Logs Viewer reads Admin Activity/Policy Denied/System Event logs; Private Logs Viewer is separately required for Data Access logs.                            | Audit data sensitivity requires distinct reader tiers.                                                                                             | Core's provenance is not a Google Data Access log.              |
| [Store log entries](https://docs.cloud.google.com/logging/docs/store-log-entries)                           | Google supports log views that expose subsets of entries and field-level access controls; permissions can be granted to a specific log view.                  | Purpose-specific server projections/field allowlists are current platform practice.                                                                | D42 should not import Google log buckets as architecture.       |
| [Auditing-related IAM job functions](https://docs.cloud.google.com/iam/docs/job-functions/auditing)         | Security teams can receive broader log roles than developers; production views can be redacted, and exported copies are governed entirely by destination IAM. | Audit readers, operational readers, and exports require separate field/capability ceilings; copied exports cannot rely on source UI authorization. | Examples are illustrative and organization-specific.            |
| [Review IAM policy history](https://docs.cloud.google.com/iam/docs/review-iam-policy-history)               | Policy changes are queryable by resource/user and timestamp through audit logs/Change History.                                                                | Authorized actor/source chronology is useful governance evidence but should remain a history purpose.                                              | Google history windows and event shape differ.                  |

### Salesforce

| Official source                                                                                                             | Verified fact                                                                                                                                                              | D42 implication                                                                                                                          | Evidence limit                                                           |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [User Access Summary](https://help.salesforce.com/s/articleView?id=users_access_summary.htm&language=en_US)                 | Administrators can inspect current **Access Granted By** sources and manage assigned permission sets/groups.                                                               | Grant reviewers need source explanation; it does not follow that a holder or membership manager needs audit rationale.                   | Salesforce does not document holder-facing D40 history.                  |
| [Monitor Setup Changes](https://help.salesforce.com/s/articleView?id=admin_monitorsetup.htm&language=en_US&type=5)          | Setup Audit Trail requires **View Setup and Configuration**, shows date/actor/change, identifies delegates and AI agents, and has a separate downloadable 180-day history. | Audit view, actor attribution, delegated/AI actions, and export are purpose-specific governance capabilities.                            | Salesforce's 180-day retention is not a Core recommendation.             |
| [Limit Profile Details](https://help.salesforce.com/s/articleView?id=sf.users_profiles_filtering.htm&language=en_US&type=5) | Salesforce can filter profile visibility but exposes names in specific operations only when the corresponding permission/purpose needs them.                               | Protected labels can be revealed only for a defined administrative operation instead of globally.                                        | Profile names are not necessarily as sensitive as ministry group labels. |
| [Grant Login Access](https://help.salesforce.com/s/articleView?id=granting_login_access.htm&language=en_US&type=5)          | User-granted admin/support login access can be time-bounded, and changes made through delegated access appear in audit history.                                            | Ordinary support status should not imply standing provenance access; any future support route needs its own time/purpose/audit contract. | D42 does not create a support impersonation feature.                     |

### Contentful CMS

| Official source                                                                                          | Verified fact                                                                                                                                                                                                                                    | D42 implication                                                                                                              | Evidence limit                                                       |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [Organization roles](https://www.contentful.com/help/roles/organization-roles/)                          | Owner/Admin can access audit logs, users, teams, and access tools; Developer/Member cannot view audit logs and only see teams they are added to.                                                                                                 | A comparable CMS separates self/team visibility from audit/access-administration visibility.                                 | Contentful's coarse organization roles are not Core's desired model. |
| [View team memberships](https://www.contentful.com/help/users-and-teams/teams/viewing-team-memberships/) | A person sees teams they belong to; Owner/Admin can inspect another user's teams.                                                                                                                                                                | Self transparency can be safe and narrower than organization governance.                                                     | It concerns current memberships, not historical sensitive groups.    |
| [Set up audit logs](https://www.contentful.com/developers/docs/tutorials/general/audit-logs/)            | Audit logs track organization changes, including roles, permissions, membership and teams; logs are shipped to customer-controlled storage where the customer controls access, retention, and analysis; delivery failures are visible/retryable. | Audit export/storage is a separate security boundary and failure mode; history delivery cannot become current authorization. | Feature availability/provider storage details should not be copied.  |
| [Contentful data export](https://www.contentful.com/help/admin/data-export/)                             | Membership and audit logs are separately exportable categories.                                                                                                                                                                                  | Bulk extraction is distinct from on-screen access and needs separate authorization/schema.                                   | Export inventory does not prove ideal permissions.                   |

### Blackbaud nonprofit products

| Official source                                                                                                                          | Verified fact                                                                                                            | D42 implication                                                                                                          | Evidence limit                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| [User and Role Audit History](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/tcs/content/en-ca/content/sec-aud-history.html) | Security > Audit history exposes access-oriented user/role changes and actors; exports use UTC plus timezone offset.     | Nonprofit software keeps detailed access history in a security/admin surface with attributable chronology.               | Blackbaud does not define subject self-transparency for this history. |
| [Blackbaud Roles](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/sec-role.html)                                  | Admins manage current roles and separately open Role History; roles should have clear purpose and regular review.        | Current access administration and historical provenance can be separate without losing explainability.                   | Its role model is not Core's additive source model.                   |
| [Blackbaud Users](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/sec-adduser.html)                               | Organization/solution admins and users with required permissions manage users, roles, access expiry, and action history. | “Admin” still resolves to required permissions and scoped product functions; no generic staff visibility is established. | Exact Blackbaud permissions are product-specific.                     |

### Security, privacy, logging, and accessibility standards

| Official source                                                                                                                                                                                                                | Verified fact                                                                                                                                                                                      | D42 implication                                                                                                                                          | Evidence limit                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)                                                                                                               | Enforce horizontal/vertical least privilege, deny by default, check every request, log appropriately, and test authorization.                                                                      | Every provenance read/export is server-authorized at exact Tenant/object/purpose/field scope; authentication or route access is insufficient.            | OWASP does not select Core's field matrix.                                                            |
| [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)                                                                                                                           | Audit/business/security logs have different purposes; sensitive PII should usually be removed/masked; all log access should be recorded/monitored and read privileges periodically reviewed.       | D42 read-audit events must exclude reason/group content, and privileged audit reads/exports require monitored access.                                    | This is guidance, not a binding legal rule.                                                           |
| [NIST SP 800-53 Rev. 5.1](https://csrc.nist.gov/CSRC/media/Projects/risk-management/800-53%20Downloads/800-53r5/SP_800-53_v5_1-derived-OSCAL.pdf)                                                                              | AC-6 limits access to what assigned tasks require and specifically addresses security-relevant information; AU controls cover audit content, access/protection, review, retention, and generation. | Phase 12 should have a distinct audit-read capability/floor and protected audit-read evidence rather than ambient admin access.                          | NIST requires organization-defined assignments and does not name D42 viewers.                         |
| [NIST SP 800-92](https://csrc.nist.gov/pubs/sp/800/92/final)                                                                                                                                                                   | NIST provides enterprise log-management guidance spanning infrastructure, process, access, storage, and use.                                                                                       | D42 needs a deliberate log/read/export lifecycle, not incidental application traces.                                                                     | The final is older and high-level; OWASP/current providers add implementation detail.                 |
| [ICO purpose limitation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/purpose-limitation)                                          | Purposes must be specified/documented; incompatible reuse requires a lawful basis and function creep should be prevented.                                                                          | D42 must register purposes and forbid silent reuse for scoring, performance, AI, analytics, or notifications.                                            | UK GDPR applicability is jurisdiction-specific; the design principle is broadly useful.               |
| [ICO data minimisation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/data-minimisation/)                                           | Personal data must be adequate, relevant, and limited to what is necessary for each specified purpose; special-category data deserves particular care.                                             | A field-by-purpose allowlist is stronger than one “authorized admin” response.                                                                           | The guidance is under review following UK legal changes; its core Article 5 principle remains stated. |
| [ICO worker access monitoring](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment/monitoring-workers/specific-data-protection-considerations-for-different-ways-or-methods-of-monitoring-workers/) | Worker access records can provide security audit trails but should not be reused for performance evaluation without a compatible purpose/basis.                                                    | D42 provenance/read logs must never become staff performance or ministry-health data.                                                                    | This is UK employment/privacy guidance, not universal law.                                            |
| [ICO special-category data](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/special-category-data/)                                                                   | Personal data revealing religious/philosophical beliefs and health are specially protected.                                                                                                        | Ministry, Member Care, location, or religiously named groups can be sensitive; historical labels need strict field ceilings.                             | A group label is not automatically special-category data; sensitivity is contextual/inferred.         |
| [WAI-ARIA Disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)                                                                                                                                            | Expanded content requires operable button/state semantics.                                                                                                                                         | Safe subject summary and privileged details must use accessible, separately authorized disclosures.                                                      | WAI does not decide privacy tiers.                                                                    |
| [WCAG headings and labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels)                                                                                                                                    | Labels should describe topic/purpose and help users understand relationships.                                                                                                                      | **Why you have access**, **Why this person has access**, **Governance details**, and **Security audit evidence** should identify their distinct purpose. | Exact copy remains a product judgment.                                                                |

## Evidence synthesis

### Verified facts

- Major IAM/CMS/CRM platforms separate self-service access review from
  administrator/security audit.
- Audit-log reading can be a dedicated least-privilege permission rather than
  a consequence of broad ownership.
- Current platforms differentiate ordinary logs, private/data-access logs,
  field-level views, exports, and destination access policies.
- Audit records commonly contain actor, affected person/resource, change, and
  time; exports materially widen the disclosure surface.
- Current nonprofit/CMS platforms keep detailed user/role/team history in
  security/admin surfaces rather than ordinary member views.
- OWASP and NIST require least privilege, protected audit information,
  attributable logging, and control over audit reads.
- Current privacy-regulator guidance requires specified purpose, minimization,
  protection against function creep, and care around sensitive worker/religious
  information.

### Product and requirement inferences

- A holder needs enough information to identify an unexpected sticky direct
  grant, not the former group name or internal rationale.
- A membership manager needs the consequence of the membership action, not the
  authority/basis behind another administrator's grant.
- A grant manager needs human-readable evidence to review/remediate one grant,
  but not every raw audit identifier or bulk export.
- A security/audit reader needs typed reconstruction but should obtain it only
  through a separate read capability, explicit registered purpose, and current
  data floor/clearance.
- An export is a new durable copy and needs an additional capability/purpose,
  current redaction, snapshot, access log, and destination controls.
- Privileged history reads should themselves be security events, but the
  read-access event must not duplicate the sensitive reason/label into logs.
- My Access, admin governance, and audit routes must not ambiently union all
  capabilities held by the same human into the richest response.

### Evidence gaps and non-facts

- No provider proves that **Added for continuity · [date]** is the ideal subject
  copy for ministry users.
- No source establishes that every ministry Access-group label is sensitive;
  the risk depends on what the label reveals and the viewer's current floor.
- No source proves Core's exact split between grant governance and security
  audit fields; this is a product/security judgment based on least privilege.
- No source determines Core's audit-read or export capability IDs, retention,
  floor taxonomy, or lawful-basis obligations across jurisdictions.
- No user study proves a subject will recognize an inappropriate grant or use a
  correction action without confusion.
- No runtime proves field-level RLS/views, purpose-bound caches, read auditing,
  export redaction, localization, accessibility, or low-bandwidth failure.

## Strongest alternative: governance-only history

Option 3 is the strongest alternative. The subject sees only current
**Granted directly to you** and duration; authorized grant governance and
security/audit purposes see history.

Its strengths are substantial:

- the smallest historical-personnel disclosure surface;
- no need to explain “continuity” to ordinary holders;
- no subject-facing historical cache or localization path;
- simpler retention and fewer screenshots/downloads; and
- no risk that a subject mistakes an origin summary for a warning, pending
  action, or weaker form of access.

It is not the strongest permanent UX:

- the person cannot distinguish an intentional direct survivor from a mistaken
  or forgotten grant;
- Entra supports self-review of whether access is still needed;
- Contentful lets a person see current team membership while reserving audit
  logs for Owner/Admin, demonstrating safe self information can coexist with
  protected governance detail;
- a bare current source/date may make the person contact support without enough
  context or ignore unexpected access; and
- safe origin/date contains no group, reason, actor, or internal evidence and
  therefore has much lower sensitivity than full history.

Option 2—full origin/reason to the subject—is weaker still. It increases
transparency but can disclose internal staffing, care/security/location, actor,
and potentially religious/ministry context that is unnecessary for the
subject's self-correction purpose. The D40 reason was intentionally governance
evidence, not recipient-authored communication.

If user research shows the safe subject summary causes more confusion than
self-correction, Core can collapse the subject tier to Option 3 without changing
history authority or the two privileged tiers. It must not respond by exposing
the group/reason or by making origin a current warning badge.

## Exact corrected decision

> D42 adopts **Option 1 — tiered provenance by current viewer and registered
> purpose**. It changes only historical read projection. It creates, mutates,
> renews, revokes, recertifies, scores, or retains no authorization source.
>
> Core registers four distinct purposes:
>
> 1. **Self access explanation (`access.self_explanation`)** — the exact subject viewing their current
>    Active Tenant Assignment in My Access.
> 2. **Membership change consequence (`access.membership_change_review`)** — a current same-Tenant
>    `permissions.manage_membership` actor reviewing or receiving one exact
>    group-membership mutation consequence.
> 3. **Capability grant governance (`access.grant_governance`)** — a current same-Tenant
>    `permissions.manage_grants` actor whose live scope and assignable-
>    capability ceiling cover the exact subject and D38 source under review.
> 4. **Security access audit (`access.security_audit`)** — a current same-Tenant holder of the separate
>    Phase 12 `permissions.audit.read` capability invoking the registered
>    access-governance audit purpose within the exact Tenant, subject/source
>    scope, and current applicable floor/clearance.
>
> Capability possession alone is insufficient. Every route/RPC/server read
> derives the active purpose from the server-owned surface/operation and
> reauthorizes Tenant, exact Active Tenant Assignment/source, field class,
> current floor/clearance, delegation/scope, and epoch. A caller cannot select a
> richer tier through URL/query/body/header parameters. D42 adds no local MFA,
> approval, JIT, or step-up subsystem; it consumes whatever current Phase 12
> controls the registered capability/floor already requires.
>
> The subject's **Why you have access** disclosure shows:
>
> **Added for continuity · [localized creation date]**
>
> **Direct access was added so your access could continue if group access
> changed.**
>
> It shows no historical/current group label or identity, group-end event,
> governance reason, actor, grant authority/delegation, warning version,
> reviewed basis, receipt, other member, roster, raw identifier, or protected
> detail. The summary is visible only for the subject's current direct source;
> terminal history/data-subject requests remain governed elsewhere.
>
> A membership manager sees only current action facts already required by
> D39–D41: the exact membership change, the named current surviving **Direct
> grant**, and its end condition. Membership authority does not reveal that the
> source was added for continuity, the old group basis, reason, actor, receipt,
> or audit chronology. If the membership manager is also the subject or a grant
> manager, the richer fields appear only in that separately invoked authorized
> surface, never by ambient union into the membership flow.
>
> Capability grant governance uses **Why this person has access** and may show:
>
> - **Added for continuity · [localized instant]**;
> - the event-time Access-group summary and later relevant source-end events;
> - the minimized D40 governance reason;
> - the human-readable actor and grant-authority class;
> - the current source/end condition and current rename context; and
> - the source-specific review/removal action already authorized by Phase 12.
>
> Historical group labels, reason, actor name, and rename context are field-
> classified. They render only if the viewer's **current** Phase 12 floor/
> clearance permits that historical field class. An unknown classification or
> insufficient floor renders **Protected access group** for the already-
> authorized source summary and omits protected reason/actor values; it never
> falls back to the raw event-time label, current name, ID, or hidden HTML.
> Event-time permission is evidence, not current read authority.
>
> Security access audit may additionally read typed stable subject/source/group
> IDs, exact basis/source-set heads and hash, warning contract version,
> authority/delegation lineage, actor identifiers, terminal events, epochs,
> semantic identity, and full typed receipt. It remains subject to current
> field classification and floor/clearance: a protected label/reason stays
> redacted while typed opaque evidence remains available where required to
> reconstruct the event. Audit-read authority grants no mutation, D38 exercise,
> membership, grant-management, support impersonation, or cross-Tenant access.
>
> Bulk audit export is a separate operation requiring
> `permissions.audit.export` in addition to `permissions.audit.read`, the
> registered `access.security_audit` purpose, exact filters/snapshot, current floor/clearance,
> and destination policy. Grant-manager UI permission alone cannot download raw
> audit. Export re-applies field redaction at request time, records the schema/
> snapshot/filters/row count/destination/actor, uses a bounded expiry/protected
> download, and never assumes the destination inherited source authorization.
>
> Every successful or denied capability-grant-governance protected-detail read,
> every security-audit read, and every audit export appends one minimized
> security access event containing viewer/acting actor, Tenant, registered
> purpose, exact object/source, field classes requested/released/redacted,
> outcome, authoritative time, epoch, policy version, and interaction/receipt
> ID. It does **not** copy the reason, group label, roster, receipt body, or
> other sensitive field values. Subject safe-summary reads are not personnel-
> monitoring events; ordinary page access telemetry remains minimized.
>
> If the protected read-access event cannot be durably committed, the protected
> grant/audit detail or export fails closed with a safe retry. Current access,
> My Access current source, and the subject's safe summary remain available and
> authoritative. Read-audit failure never revokes access or causes a D40/D41
> mutation.
>
> Website, Tasks Hub, notification, email, donor, missionary, public, generic
> support, search suggestion, staff analytics, performance/engagement/risk/
> ministry-health scoring, AI prompt/training/evaluation, application log,
> trace, error, cache without exact purpose, and current-access export receive
> no D42 protected field. Any later new use requires a separately registered
> compatible purpose, explicit field ceiling and authorization decision; a
> feature flag or data-warehouse access is not that decision.
>
> D42 stores one immutable source of provenance, not per-viewer copies. Server-
> side purpose projections select only allowed fields before serialization.
> Browser roles have no raw basis/audit SELECT; RLS/views/RPC/server functions,
> service role, owner/`BYPASSRLS`, support, repair, worker, cache fill, export,
> and AI paths preserve the same Tenant/purpose/floor ceiling.
>
> Purpose-specific responses/caches bind Tenant, viewer/acting actor, exact
> assignment/source, capability, registered purpose, field classes, policy/
> floor version, authorization epoch, provenance revision, and expiry. A lower
> tier never reuses a richer response. Permission/floor/policy loss denies new
> reads and invalidates/cryptographically severs protected cached/downloadable
> copies according to the governing contract.
>
> The interface uses Core Base Maia/Base UI, semantic headings/disclosures,
> explicit protected/redacted labels, keyboard/focus/status behavior, 44-pixel
> important targets, 320-pixel reflow, forced colors, reduced motion, long/CJK/
> RTL/bidirectional wrapping, locale-correct dates, and low-bandwidth safe retry.
> Meaning never depends on color, icon, hover, truncation, or an unexplained
> denial.
>
> D42 adds no Website-local role, D40 viewer column, per-viewer history row,
> client-side redaction, generic admin/auditor role, support backdoor, local
> step-up, task, notification, email, score, AI pipeline, or Inngest authority.

## Normative viewer and field matrix

`Yes` always means “only after exact current Tenant/object/purpose/floor proof.”
`Conditional` means an additional field classification/floor decision applies.
`No` means the D42 projection never releases the field even if the browser
already holds it from another route.

| Field/action                                 |                        Subject: self explanation |                        Membership change consequence |                       Capability grant governance |                                   Security access audit |
| -------------------------------------------- | -----------------------------------------------: | ---------------------------------------------------: | ------------------------------------------------: | ------------------------------------------------------: |
| Current capability name                      |                                              Yes |                                Yes, for exact action |                                               Yes |                                                     Yes |
| Current source kind and end condition        |                                              Yes |                                  Yes, exact survivor |                                               Yes |                                                     Yes |
| Safe **Added for continuity · date**         |                                   Yes, on demand |                                                   No |                                               Yes |                                                     Yes |
| Fixed holder explanation sentence            |                                              Yes |                                                   No |                                                No |                                                      No |
| Event-time historical group label            |                                               No |                                                   No | Conditional; otherwise **Protected access group** |       Conditional; otherwise **Protected access group** |
| Current renamed group label/context          |                                               No | Current action group only, not historical provenance |                                       Conditional |                                             Conditional |
| Stable group/source/assignment IDs           |                                               No |                                                   No |                                 No in ordinary UI |      Yes, typed/opaque; label lookup separately floored |
| Exact group-end chronology                   |                                               No |                          Current action outcome only |               Relevant events, conditional labels |                                                     Yes |
| Minimized governance reason                  |                                               No |                                                   No |                    Conditional; otherwise omitted |               Conditional; otherwise protected/redacted |
| Grant actor display name                     |                                               No |                                                   No |                    Conditional; otherwise omitted |          Conditional plus stable actor ID where allowed |
| Grant authority class                        |                                               No |                                                   No |                         Safe human-readable class |            Full typed class/lineage where floor permits |
| Delegation IDs/ceiling/source-set heads/hash |                                               No |                                                   No |                                                No |                                                     Yes |
| D40 warning-contract version                 |                                               No |                                                   No |                                                No |                                                     Yes |
| Safe receipt summary/link                    |                                               No |                           Source-change receipt only |                                                No |                                                     Yes |
| Full typed receipt/body                      |                                               No |                                                   No |                                                No |                                                     Yes |
| Other group members/roster                   |                                               No |                                                   No |                                                No | No—requires a separate current group-governance purpose |
| Remove/renew direct grant                    | No; D43 now owns the separate correction request |                                                   No |                   Yes, separate current authority |                                                      No |
| Membership mutation                          |                                               No |                     Existing exact-scope action only |                     Only if separately authorized |                                                      No |
| Protected-detail read-access event           |                       No special personnel event |                      Existing mutation receipt/audit |                                               Yes |                                                     Yes |
| Bulk audit export                            |                                               No |                                                   No |                      No by grant permission alone |             Separate export capability/purpose required |
| Analytics/AI/task/notification projection    |                                               No |                                                   No |                                                No |                                                      No |

### Matrix invariants

1. A person with several permissions does not receive the union in every
   response; the server-authorized active purpose selects one field ceiling.
2. My Access always uses the subject column, including for a person who also
   holds grant/audit authority.
3. A membership flow always uses the membership column, including for an actor
   who could open a separate grant-governance route.
4. Grant governance requires `permissions.manage_grants`, current exact scope,
   and live assignable-capability ceiling covering D38; possessing D38 is
   irrelevant.
5. Audit requires `permissions.audit.read`, registered purpose, current
   scope, and current floor/clearance; grant management is irrelevant.
6. Export requires `permissions.audit.export` plus current audit-read
   proof; on-screen audit access is insufficient.
7. Historical group labels and reasons are field-classified; unknown class is
   protected, not public.
8. Event-time labels prove history but never grant current visibility.
9. Roster/other-member data is outside D42 and never piggybacks on a basis edge.
10. Redaction is server-side and explicit, not missing-data ambiguity.

## UX and user journeys

### Subject in My Access

Default current row:

```text
Apply Website recovery settings to current work

Granted directly to you · Ends 15 October 2026

[Why you have access]
```

Expanded safe summary:

```text
Why you have access

Current source
Granted directly to you · Ends 15 October 2026

History
Added for continuity · 29 August 2026
Direct access was added so your access could continue if group access changed.
```

There is no old/current group name, reason, actor, receipt, badge, warning
color, admin vocabulary, or bulk download. The summary is a neutral explanation
and does not imply an action is required. D43 separately decides the safe
correction action.

### Membership manager reviewing removal

```text
Remove Jordan from Website Operations?

Website recovery access will remain through a direct grant until
15 October 2026.

[Cancel] [Remove from group]
```

The flow does not say **Added for continuity**. It does not link to the reason,
grantor, or audit history. It identifies the grant-governance owner/path if help
is needed without broadening the manager's authority.

### Grant manager/reviewer

```text
Why this person has access

Current source
Direct grant · Ends 15 October 2026

Governance history
Added for continuity · 29 August 2026
Historical group: Website Operations
Reason: Maintain recovery responsibility during team transition
Added by: Morgan Lee · Grant manager

[Remove direct grant]
```

If the viewer's current floor cannot reveal the label/reason/actor, the
protected values are omitted and the already-authorized source summary remains:

```text
Historical group: Protected access group
```

The UI explains that some details are protected by current policy; it does not
suggest missing/corrupt data or offer a privilege-escalation button.

### Security/audit reader

The audit route is clearly labeled **Security audit evidence**, is read-only,
and begins with purpose/scope/snapshot. Human-readable details are followed by
typed identifiers/heads/receipt only where the current floor permits. A person
who holds both grant and audit capabilities explicitly opens the audit route;
the grant page does not silently reveal raw evidence.

Export uses a separate **Export audit evidence** action showing:

- exact Tenant/source/time filters and snapshot;
- fields included and redacted;
- row count/size estimate;
- purpose and destination/retention warning;
- protected download expiry; and
- durable export receipt.

No typed phrase, nested modal, or local MFA is added by D42. Existing Phase 12
high-impact controls apply to the audit/export capabilities.

### Unauthorized, downgraded, or stale viewer

- A subject sees only the safe summary, not an **Access denied** placeholder for
  fields they were never entitled to know existed.
- A membership manager sees only the action consequence.
- A grant/audit viewer whose authority or floor changed gets a clear protected/
  unavailable state and a safe refresh, not stale cached detail.
- A direct URL, browser history, back button, offline cache, prefetch, screenshot
  endpoint, export URL, or Realtime message never restores richer fields.
- Authorization denial is programmatically conveyed without exposing which
  specific protected group/reason exists.

### Mobile, localization, and accessibility

- Each tier is a stacked description/chronology, not a wide permission matrix.
- Field redaction uses explicit localized text, not blanks, icons, or color.
- Dates are absolute and locale-correct; audit detail adds time/zone while
  authoritative order remains sequence/UTC-based.
- Group/person names wrap safely for long, CJK, RTL, and bidirectional content;
  protected labels do not reveal length or initials.
- Base UI disclosures expose names/state and operate with keyboard/screen
  reader; focus, retry, and status are deliberate.
- Important controls use Core's 44-pixel target convention and reflow at 320
  CSS pixels/400% without lost fields or horizontal scrolling.
- Low-bandwidth failure of protected history/export never hides current source
  or the subject safe summary.

## Authorization, RLS, cache, and export safeguards

D42 owns no new history data. It adds purpose/field authorization around the
canonical D40 basis and Phase 12 audit history.

- Define central code/database-registered purposes and field classes. A local
  string or unregistered plugin purpose fails closed.
- Keep `permissions.manage_grants`, `permissions.manage_membership`,
  `permissions.audit.read`, and `permissions.audit.export`
  distinct, independently delegable only within Phase 12 rules, and absent from
  default D38 exercise access.
- Derive subject identity from the authenticated current assignment; do not
  accept an arbitrary `subject_id` for self view.
- Bind grant governance to exact same-Tenant assignment/source plus live
  assignable-capability ceiling; bind membership view to exact group mutation.
- Bind audit/export to exact Tenant/source scope, registered purpose, current
  field floor/clearance, policy version, and current authorization epoch.
- Select/construct only authorized fields on the server. Do not fetch full JSON
  into a browser/server component and delete keys afterward.
- Browser roles have no raw audit/basis table grants. Views/RPCs/server
  functions preserve `ENABLE`/`FORCE RLS`; `USING`, grants, and purpose/floor
  predicates prevent cross-row and cross-field disclosure.
- Security-definer code pins `search_path`, derives viewer/acting actor/Tenant/
  purpose/floor, and does not trust claims in request payloads.
- Owner, service role, `BYPASSRLS`, support, repair, migration, export, cache,
  Realtime, worker, analytics, and AI paths use explicit adapters with the same
  field ceilings. No “trusted backend” bypass serves product reads.
- Key protected caches by Tenant, viewer/acting actor, source/assignment,
  purpose, field class set, policy/floor version, epoch, provenance revision,
  and expiry. Never cache a rich response under a subject/current-access key.
- Reauthorize on every detail open, pagination, receipt follow, and export
  download. Pre-signed/protected downloads are short-lived, recipient-bound,
  and revocable/deny after relevant authorization loss where supported.
- Current subject/grant/audit list queries are set-based and do not open full
  history per row. Expanded history is separately indexed, bounded, and
  paginated.
- Export creates a purpose-scoped immutable artifact/receipt, never a generic
  database dump. The artifact records current redactions and cannot be used as
  a reverse-write source.

## Protected read-audit contract

One protected provenance interaction produces at most one durable security
access event per opened detail page/report/export operation, not one event per
row/field/render. This prevents N+1 audit noise while remaining attributable.

The event includes:

- Tenant and environment;
- viewer and acting/delegated actor identities;
- registered purpose and operation (`grant_detail_read`, `audit_read`,
  `audit_export`);
- exact subject/direct-source identifiers;
- requested/released/redacted field-class codes, not values;
- authoritative policy/floor/epoch/provenance versions;
- outcome/denial/error reason code;
- UTC instant and interaction/receipt/export ID; and
- export filters, count, schema, destination class, and expiry where applicable.

It excludes:

- the governance reason text;
- group labels or roster/member names;
- receipt body;
- sensitive field values;
- browser URL query containing protected identifiers;
- client telemetry/screenshot content; and
- staff performance/usage dimensions.

Read-access events live in a separately protected security stream, not the
subject's visible D40 business chronology. Access to that security stream is
also capability/purpose/floor controlled and monitored, avoiding recursive
unbounded “audit of audit” presentation while preserving attributable access.

## Failure modes and recovery

| Failure                                                  | Safe behavior                                                                                   | Required recovery/proof                                  |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Client requests a richer tier/purpose                    | Ignore/reject caller tier; derive server purpose                                                | Negative route/RPC tests and alert on tampering          |
| Same user holds subject + grant + audit capabilities     | Each surface returns only its registered purpose fields                                         | Cross-surface cache/serialization tests                  |
| Historical group classification is unknown               | Render **Protected access group**                                                               | Classifier/policy repair; never raw fallback             |
| Viewer floor/clearance drops while panel is open         | New read/page/receipt denies; rich cache cannot serve lower tier                                | Epoch/policy invalidation and back/offline tests         |
| Protected read-audit write fails                         | Fail protected detail/export closed; current/safe subject view remains                          | Retry/incident and no unauthorized read                  |
| Read audit commits but history fetch fails               | Record failure outcome; safe retry; no sensitive values in log                                  | Interaction correlation and error-state test             |
| Export succeeds but response is lost                     | Receipt lookup returns same protected artifact/outcome                                          | Semantic idempotency and bounded download                |
| Export destination permissions are broader than intended | Do not claim destination safety; require approved destination class/owner and incident response | Destination policy proof/access review                   |
| Reason contains sensitive text despite helper            | Release only to classified/floored governance/audit tier; never logs/subject                    | Field classification, minimization review, incident path |
| Group renamed/deleted/recreated                          | Stable history; floored event-time label or protected placeholder                               | Identity/label/version tests                             |
| Cross-Tenant cache/export mix                            | Zero-tolerance security incident; contain artifacts/caches                                      | Exact Tenant keys, RLS/service parity                    |
| AI/analytics connector sees provenance                   | Deny and alert; remove dataset/prompt copy; assess disclosure                                   | Schema allowlist and egress tests                        |
| Low bandwidth or history outage                          | Current source and subject safe summary remain; protected detail has retry                      | Separate boundaries and production-shaped tests          |
| Unknown projection/event version                         | Safe summary/current unaffected; privileged detail states unavailable                           | Versioned reader/roll-forward                            |

## Research outcomes

### Problem validity, scope, and strongest alternatives

- **D42-RA001 — Repository fact:** D42 decides historical read audiences only;
  D39–D41 already own source authority, lifecycle, current presentation, and
  immutable provenance.
- **D42-RA002 — Product judgment:** “authorized administrator” is too vague to
  protect reasons, historical groups, actors, receipts, and raw basis evidence.
- **D42-RA003 — Product judgment:** the root problem is giving each actor enough
  explanation for one action without turning governance history into a broadly
  visible personnel record.
- **D42-RA004 — Product judgment:** Option 1 is superior because it combines safe
  subject transparency, truthful membership consequences, grant review, and
  full security reconstruction through separate field ceilings.
- **D42-RA005 — Product judgment:** Option 3 governance-only history is the
  strongest alternative because it minimizes privacy and complexity.
- **D42-RA006 — Verified external fact:** Entra supports self-review of current
  access while separately restricting activity logs and downloadable review
  history to designated roles.
- **D42-RA007 — Product judgment:** a safe origin/date makes self-review more
  useful without exposing the historical group or governance reason.
- **D42-RA008 — Product judgment:** Option 2 full subject disclosure is rejected
  because group/reason/actor context exceeds the self-correction purpose.
- **D42-RA009 — Repository fact:** D42 creates no role, grant state, source kind,
  retention rule, recertification campaign, or Website workflow.
- **D42-RA010 — Product judgment:** if tiered server projection cannot be proved,
  release only current D41 presentation and no new historical field rather than
  a client-hidden or broad-admin compromise.

### Current external evidence for self, governance, and audit separation

- **D42-RA011 — Verified external fact:** Microsoft My Access lets a person
  review whether they still need their own group/application/access-package
  access and uses a different page for reviewing others.
- **D42-RA012 — Verified external fact:** Microsoft names Reports Reader as the
  least-privileged activity-log reader and separate authority for diagnostic
  configuration/API access.
- **D42-RA013 — Verified external fact:** Entra downloadable access-review
  history requires authorization to view reviews and produces a separately
  filtered/downloadable report.
- **D42-RA014 — Verified external fact:** GitHub custom organization roles can
  grant **View organization audit log** without full organization ownership.
- **D42-RA015 — Verified external fact:** GitHub audit exports contain actor,
  affected user, team, email, action, and time fields, demonstrating larger
  exfiltration scope than an on-screen current-access explanation.
- **D42-RA016 — Verified external fact:** Google differentiates Logs Viewer,
  Private Logs Viewer, field accessor, log-view accessor, Security Reviewer,
  and group-reader permissions.
- **D42-RA017 — Verified external fact:** Salesforce requires **View Setup and
  Configuration** for Setup Audit Trail and separately exposes actor/delegate/
  AI-agent attribution and download.
- **D42-RA018 — Verified external fact:** Contentful allows Owner/Admin, but not
  Developer/Member, to use audit logs/access tools while members see only their
  current teams/spaces.
- **D42-RA019 — Verified external fact:** Blackbaud places access-oriented user/
  role history and actors under Security > Audit history.
- **D42-RA020 — Requirement inference:** current-product precedent supports
  dedicated self, operational, governance, audit, and export permissions rather
  than one response gated by authentication or broad role name.

### Registered purposes and viewer authorization

- **D42-RA021 — Product judgment:** Core registers four purposes: self access
  explanation, membership change consequence, capability grant governance, and
  security access audit.
- **D42-RA022 — Requirement inference:** the server derives purpose from the
  current route/operation; caller-supplied purpose/tier is ignored or rejected.
- **D42-RA023 — Requirement inference:** self view derives exact subject from
  authenticated current Active Tenant Assignment and accepts no arbitrary
  subject selector.
- **D42-RA024 — Repository fact:** membership consequence requires current
  `permissions.manage_membership` for the exact group/action and grants no
  direct-grant governance authority.
- **D42-RA025 — Repository fact:** grant governance requires current
  `permissions.manage_grants`, exact same-Tenant scope, and live assignable-
  capability ceiling covering D38.
- **D42-RA026 — Product judgment:** full audit requires the distinct Phase 12
  `permissions.audit.read` capability plus registered audit purpose and
  current floor/clearance.
- **D42-RA027 — Product judgment:** audit export additionally requires
  `permissions.audit.export`; read access alone cannot create a bulk copy.
- **D42-RA028 — Requirement inference:** D38 exercise, subject status, group
  membership, route access, task assignment, support status, or broad Tenant
  role never substitutes for any D42 purpose.
- **D42-RA029 — Requirement inference:** one human with several capabilities
  receives only the actively invoked surface's field ceiling, not the ambient
  union of all fields.
- **D42-RA030 — Repository fact:** D42 consumes current Phase 12 control/floor/
  clearance behavior and creates no local JIT, second approval, MFA, or step-up.

### Field classification, historical labels, and domain invariants

- **D42-RA031 — Product judgment:** the subject receives only **Added for
  continuity · [date]** plus a safe generic explanation.
- **D42-RA032 — Requirement inference:** subject view contains no historical/
  current group label, identity, end event, reason, actor, basis, receipt,
  roster, or protected detail.
- **D42-RA033 — Repository fact:** membership managers see only the current
  survivor/end condition already needed to understand their exact mutation.
- **D42-RA034 — Product judgment:** grant governance can see event-time group
  summary, minimized reason, actor display, relevant chronology, and safe
  receipt only when its current scope/floor permits.
- **D42-RA035 — Product judgment:** audit can see typed IDs/heads/hash/warning
  version/lineage/receipt within separate capability/purpose/floor proof.
- **D42-RA036 — Requirement inference:** historical group labels, reasons, and
  actor names are field-classified independently rather than assumed harmless.
- **D42-RA037 — Requirement inference:** unknown classification or insufficient
  current floor renders **Protected access group** only for the already-
  authorized source summary; protected reason/actor values are omitted and
  never fall back to raw content.
- **D42-RA038 — Requirement inference:** event-time permission/classification is
  historical evidence, not current read authority; every read uses current
  policy/floor.
- **D42-RA039 — Requirement inference:** D42 never exposes another member or
  historical roster; any roster query requires a separate current group-
  governance purpose.
- **D42-RA040 — Requirement inference:** one immutable provenance source feeds
  server field projections; no per-viewer copies, mutable redaction rows, or
  label-derived authorization exist.

### Subject and membership-manager UX

- **D42-RA041 — Product judgment:** My Access uses **Why you have access** and
  shows current source first, safe origin/date second.
- **D42-RA042 — Product judgment:** the safe subject sentence says a separate
  direct grant was added so access could continue if group access changed.
- **D42-RA043 — Product judgment:** the safe summary is neutral and creates no
  badge, warning, acknowledgement, task, or implied required action.
- **D42-RA044 — Requirement inference:** subject visibility exists only for the
  current direct source/current assignment; terminal history and data-subject
  requests remain separately governed.
- **D42-RA045 — Requirement inference:** a person who is also a grant/audit
  manager still sees only subject fields in My Access.
- **D42-RA046 — Product judgment:** membership review copy names exact current
  surviving direct source and end condition but omits continuity origin.
- **D42-RA047 — Requirement inference:** membership UI offers no reason/history
  link, hidden tooltip, raw ID, or privilege-escalation shortcut.
- **D42-RA048 — Requirement inference:** membership manager can identify the
  grant-governance owner/path for help without gaining history or mutation
  authority.
- **D42-RA049 — Verified external fact:** Entra self-review and Contentful self
  team visibility support safe self-service information narrower than admin
  audit detail.
- **D42-RA050 — Resolved downstream:** D43 now gives the exact subject one
  governed **Ask for an access review** request against the exact current D40
  direct source; submission changes no access and cannot widen D42 fields.

### Grant governance, audit, export, and source-specific action

- **D42-RA051 — Product judgment:** grant governance uses **Why this person has
  access** with current source, then a clearly labeled governance-history block.
- **D42-RA052 — Requirement inference:** grant governance receives a safe
  relevant safe chronology, not receipt/basis JSON or bulk export.
- **D42-RA053 — Requirement inference:** source remove/renew actions remain
  independently reauthorized Phase 12 commands; history read grants no write.
- **D42-RA054 — Product judgment:** security audit is a clearly distinct read-
  only **Security audit evidence** route with purpose/scope/snapshot context.
- **D42-RA055 — Requirement inference:** audit-reader identity does not grant
  D38 exercise, membership, grant management, support impersonation, or cross-
  Tenant visibility.
- **D42-RA056 — Requirement inference:** export review states exact filters,
  snapshot, fields/redactions, count/size, destination class, expiry, and purpose.
- **D42-RA057 — Verified external fact:** Microsoft, GitHub, Google, Salesforce,
  and Contentful treat history/report export or exported-storage access as a
  distinct capability/security boundary.
- **D42-RA058 — Requirement inference:** exports reapply current field floor and
  redaction; a previously visible label cannot be copied after clearance loss.
- **D42-RA059 — Requirement inference:** semantic replay of one export request
  returns the same artifact/receipt; changed filters/purpose/destination conflict
  or form a new authorized request.
- **D42-RA060 — Product judgment:** no D42 action is named **View everything**,
  **Admin details**, or **Download all**; copy communicates exact scope/purpose.

### Database, RLS, authorization, and Tenant safety

- **D42-RA061 — Requirement inference:** D42 adds purpose/field authorization,
  not an authorization/history table or D40 viewer column.
- **D42-RA062 — Requirement inference:** server reads bind exact Tenant, viewer/
  acting actor, subject assignment/source, capability, purpose, field classes,
  floor/policy version, epoch, provenance revision, and expiry.
- **D42-RA063 — Requirement inference:** browser roles receive no raw D40 basis,
  reason, actor, receipt, or audit SELECT.
- **D42-RA064 — Requirement inference:** purpose-built views/RPCs/server
  functions preserve same-Tenant row filtering and field allowlists before
  serialization.
- **D42-RA065 — Requirement inference:** security-definer functions pin
  `search_path` and derive Tenant/actor/purpose/floor from trusted server context.
- **D42-RA066 — Requirement inference:** table owner, service role,
  `BYPASSRLS`, support, repair, migration, cache, Realtime, worker, export,
  analytics, and AI paths reproduce the same field ceiling.
- **D42-RA067 — Requirement inference:** protected group/reason values are never
  fetched into a lower-tier browser and merely hidden with CSS/TypeScript.
- **D42-RA068 — Requirement inference:** grant/audit authority loss or floor
  downgrade denies every new page/receipt/download read immediately under the
  current authorization boundary.
- **D42-RA069 — Requirement inference:** cross-Tenant, cross-assignment, cross-
  purpose, or richer-to-lower cache reuse is impossible by construction and
  treated as a security incident if observed.
- **D42-RA070 — Requirement inference:** an allowed history read cannot change
  a source, assignment, floor, viewer purpose, or audit retention state.

### Read auditing, privacy, logs, analytics, and AI exclusions

- **D42-RA071 — Verified external fact:** OWASP says all access to logs should
  be recorded/monitored and log-read privileges restricted/reviewed.
- **D42-RA072 — Product judgment:** protected grant-detail, audit-detail, and
  export interactions create minimized security access events; safe self-summary
  reads do not become employee-monitoring events.
- **D42-RA073 — Requirement inference:** one interaction emits at most one
  durable access event rather than a row/field/render N+1 stream.
- **D42-RA074 — Requirement inference:** the access event records viewer,
  acting actor, purpose, object, field-class codes, outcome, versions, time, and
  interaction ID but no reason/group/receipt content.
- **D42-RA075 — Requirement inference:** inability to durably record the
  protected read/export event fails that protected read closed while current
  access and subject safe summary remain available.
- **D42-RA076 — Verified external fact:** ICO says worker access records may be
  useful security/audit evidence but should not be repurposed for performance
  evaluation without a compatible purpose/basis.
- **D42-RA077 — Product judgment:** D42 origin/reason/read events never feed
  performance, engagement, readiness, risk, trust, availability, or ministry-
  health scoring.
- **D42-RA078 — Verified external fact:** OWASP advises removing/masking
  sensitive personal data from technical logs and separating audit/business/
  security log purposes.
- **D42-RA079 — Requirement inference:** application logs/traces/errors contain
  opaque identifiers and reason codes only; no group label, reason text, actor
  name, receipt body, or protected UI content.
- **D42-RA080 — Product judgment:** Tasks Hub, notifications, email, search
  suggestions, generic analytics, data warehouse, support, and AI receive no
  D42 field unless a future explicit compatible-purpose decision authorizes it.

### Lifecycle, failure, concurrency, cache, and idempotency

- **D42-RA081 — Requirement inference:** D42 visibility changes on current
  viewer/purpose/floor policy, not on mutation of historical provenance.
- **D42-RA082 — Requirement inference:** a group/source rename, terminal event,
  identity merge, or retention transition cannot silently widen a field tier.
- **D42-RA083 — Requirement inference:** unknown field classification/version
  is protected/unavailable, never public or raw fallback.
- **D42-RA084 — Requirement inference:** an out-of-order rich response cannot
  overwrite or populate a newer/lower-tier cache after authority loss.
- **D42-RA085 — Requirement inference:** back button, offline cache, prefetch,
  Realtime, browser history, screenshot/preview, and protected URL flows reapply
  purpose/floor or do not contain rich data.
- **D42-RA086 — Requirement inference:** simultaneous policy/floor downgrade and
  read/export use one authoritative boundary; no partially richer artifact is
  released.
- **D42-RA087 — Requirement inference:** read-audit commit and provenance read/
  export are coordinated so no successful protected release lacks its required
  access event, and failures are receipt-correlated.
- **D42-RA088 — Requirement inference:** lost export response recovers through
  semantic receipt lookup; retry never generates duplicate artifacts/read events.
- **D42-RA089 — Requirement inference:** export artifact authorization and
  destination controls are independent after creation; Core never claims that
  the destination inherited the viewer's live authorization.
- **D42-RA090 — Requirement inference:** history/read-audit/export outage never
  changes D38 `EffectiveAccess`, source lifecycle, current source display, or
  D37 committed/uncommitted effect rules.

### Accessibility, localization, performance, and operational burden

- **D42-RA091 — Repository fact:** Core requires Base Maia/Base UI, semantic
  tokens, visible focus/status, responsive reflow, and shared primitives.
- **D42-RA092 — Requirement inference:** each purpose uses a descriptive heading
  and disclosure; protected redaction is explicit localized text, not a blank.
- **D42-RA093 — Requirement inference:** keyboard/screen-reader users can open,
  close, page, retry, and understand protected/denied states with logical focus.
- **D42-RA094 — Requirement inference:** 320px/400% reflow uses stacked
  descriptions/chronology rather than a wide viewer-field matrix in production.
- **D42-RA095 — Requirement inference:** important controls meet Core's 44px
  convention and meaning survives forced colors/reduced motion/no hover.
- **D42-RA096 — Requirement inference:** long/CJK/RTL/bidirectional names wrap;
  protected placeholders reveal no label length/initials or bidi fragments.
- **D42-RA097 — Requirement inference:** locale-correct dates/zones never
  determine event ordering, authorization, classification, or export filters.
- **D42-RA098 — Requirement inference:** subject/current-source reads remain
  small and set-based; protected history is separately indexed/bounded/paginated.
- **D42-RA099 — Requirement inference:** access-event generation is one per
  interaction/report/export and cannot create N+1 audit/storage burden.
- **D42-RA100 — Product judgment:** central purposes, capabilities, field
  classes, read auditing, and export controls are the minimum permanent system;
  per-surface copies or local policies would create greater technical debt.

### Migration, rollout, traceability, and proof

- **D42-RA101 — Repository fact:** fresh-build posture means no production D42
  viewer rows exist to backfill, but seed role/profile checks are not evidence.
- **D42-RA102 — Requirement inference:** migration infers no viewer purpose,
  audit capability, floor, or field classification from broad Admin/Owner roles.
- **D42-RA103 — Requirement inference:** canonical history readers, central
  purpose/field registry, audit-read/export capabilities, RLS/server projections,
  and protected read-audit writer ship before privileged detail/export.
- **D42-RA104 — Requirement inference:** mixed-version readers that do not
  understand a field/policy version fail protected detail closed while preserving
  current access and safe subject summary.
- **D42-RA105 — Requirement inference:** rollback disables richer reads/exports
  without deleting history, read-access evidence, or changing direct access.
- **D42-RA106 — Requirement inference:** authorization tests cover every matrix
  cell, multi-capability same-human surfaces, cross-Tenant/purpose caches, floor
  downgrade, service-role/RPC/export parity, and direct URL/offline paths.
- **D42-RA107 — Requirement inference:** data tests cover label classification,
  protected placeholders, reason/actor redaction, no roster, no raw browser
  SELECT, read-audit atomicity/idempotency, and export snapshot/destination.
- **D42-RA108 — Requirement inference:** UX/a11y tests cover subject,
  membership, grant, audit, protected/denied, low-bandwidth, keyboard/screen
  reader, 320px, forced colors, RTL/CJK/long labels, and locale date/zone.
- **D42-RA109 — Requirement inference:** traceability maps exact terms,
  capabilities, purposes, fields, outcomes, and exclusions through D38–D42,
  glossary, ADR-0184, Phase 12, OpenSpec, design/tasks/tickets/tests/release.
- **D42-RA110 — Product judgment:** activation stays Reserved until every
  negative authorization path and protected read/export audit is independently
  proved; a visually correct field matrix is insufficient.

### Assumptions, evidence limits, disposition, and D43

- **D42-RA111 — Assumption:** subjects will benefit from safe continuity origin
  transparency, but no ministry-user study establishes comprehension or demand.
- **D42-RA112 — Assumption:** Access-group names may reveal sensitive ministry,
  Member Care, security, religious, staffing, or location context; classification
  must be evidence/policy based rather than universally assumed.
- **D42-RA113 — Verified external fact:** ICO treats personal data revealing
  religious beliefs as specially protected and warns against worker-data
  function creep; applicability is jurisdiction/context dependent.
- **D42-RA114 — Product judgment:** current floor/clearance, not historical
  permission or “auditor” role name, governs label/reason release.
- **D42-RA115 — Assumption:** grant managers need human-readable reason/actor/
  source context to review a continuity grant; production-shaped task studies
  must confirm the minimum useful set.
- **D42-RA116 — Assumption:** a separate audit export capability is proportionate
  because bulk copies create materially greater privacy risk; measure operational
  friction rather than collapsing it into audit read.
- **D42-RA117 — Product judgment:** D42 fully settles historical label/reason/
  actor/receipt visibility; it leaves no later label-policy dependency.
- **D42-RA118 — Product judgment:** choose Option 1 with the exact field matrix,
  distinct audit-read/export capabilities, registered purposes, current floor,
  protected read audit, and all exclusions above.
- **D42-RA119 — Resolved downstream:** D43 records the safe subject correction
  action as a typed Phase 12 holder direct-grant review request and explicitly
  does not reopen D42 visibility.
- **D42-RA120 — Product judgment:** recommend a governed source-backed review/
  removal request with no immediate authorization change over self-revoke or
  explanation-only contact, subject to D43's founder decision.

## Falsifiable acceptance criteria

1. My Access for the exact current subject shows current source/end condition
   and, on demand, **Added for continuity · [localized date]** plus the approved
   safe generic sentence.
2. The subject response contains no historical/current group label or ID,
   group-end event, reason, actor, authority/delegation, basis, receipt, other
   member, roster, or protected-detail metadata.
3. A membership manager reviewing one exact mutation sees the current survivor
   and end condition but no continuity-origin or grant-governance field.
4. A current `permissions.manage_grants` actor receives grant-governance fields
   only when exact Tenant/scope and live assignable-capability ceiling cover D38.
5. A current `permissions.audit.read` actor receives audit fields only
   under the registered audit purpose and applicable current floor/clearance.
6. Possessing audit-read grants no D38 exercise, mutation, membership, grant-
   management, support, export, or cross-Tenant capability.
7. Audit export requires `permissions.audit.export` in addition to
   audit-read proof, the registered `access.security_audit` purpose, and the
   exact export operation/snapshot boundary.
8. A caller-supplied tier/purpose/view/header/query/body value cannot widen any
   response; the server derives purpose from the authorized operation.
9. A human who holds subject, membership, grant, and audit capabilities still
   receives only subject fields in My Access and membership fields in a
   membership flow.
10. Grant and audit group labels/reasons/actor names are released only when the
    current viewer floor permits their field classification.
11. Unknown classification or insufficient floor renders the exact protected
    placeholder without raw label/name/ID/length leakage.
12. Event-time permission never authorizes current reading; every page/detail/
    receipt/export rechecks current authorization and floor.
13. Grant governance never receives raw basis heads/hash, warning version,
    delegation IDs, stable actor IDs, or full typed receipt.
14. Audit receives typed evidence only within current scope/floor and never a
    D42 roster/other-member expansion.
15. Browser roles cannot select raw D40 basis, reason, actor, receipt, or audit
    rows through tables, views, RPCs, storage, Realtime, or guessed IDs.
16. Owner/service/`BYPASSRLS`/support/repair/worker/cache/export/AI paths enforce
    the same Tenant/purpose/field ceiling as product reads.
17. Every protected grant-detail, audit-detail, denied protected read, and
    export produces exactly one minimized, attributable security access event
    per interaction.
18. The access event contains field-class codes/outcome/versions but no reason,
    group label, receipt body, roster, or protected values.
19. Protected read-audit failure prevents protected detail/export release while
    current source and subject safe summary remain available.
20. Rich responses cannot be served from subject/membership caches, another
    Tenant, another viewer, or an older policy/floor/epoch after downgrade.
21. Back/offline/prefetch/Realtime/direct URL/protected-download flows cannot
    restore fields after authority/floor loss.
22. Export review and receipt state exact snapshot, filters, fields/redactions,
    row count, destination class, schema, actor, purpose, and expiry.
23. Export retry is semantic-idempotent; changed scope/purpose/filter/destination
    cannot reuse the earlier key/artifact.
24. Website, Tasks Hub, donor, missionary, public, notification, email, support,
    search, analytics, scoring, data warehouse, AI, and current-access export
    schemas contain no D42 historical field.
25. Application logs/traces/errors contain no group label, reason text, actor
    name, receipt body, or protected UI content.
26. Every tier uses accessible descriptive headings/disclosures, explicit
    protected states, keyboard/focus/status behavior, and no hover/color-only
    information.
27. Journeys reflow at 320 CSS pixels/400%, retain Core 44px important targets,
    and work in forced colors/reduced motion.
28. Long/CJK/RTL/bidirectional labels wrap safely and protected placeholders do
    not reveal label shape; dates/zones localize without changing event order.
29. Migration infers no purpose/capability/floor from Admin/Owner seeds; mixed-
    version and rollback paths preserve history/current access while failing
    unknown protected detail closed.
30. D42 purposes, capabilities, field matrix, read-audit/export semantics, and
    exclusions trace consistently through glossary, ADR, Phase 12, OpenSpec,
    design/tasks/tickets/tests/release; D43 concerns correction action only.

## Monitors and response contract

| Signal                                                     | Threshold                                                                                          | Owner                                 | Required response                                                                                                                     |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `access_d42_subject_protected_field_release_total`         | Any                                                                                                | Privacy + Security + Phase 12         | Contain response/cache, assess disclosure, disable affected projection, repair field allowlist/RLS, and prove negative tests.         |
| `access_d42_membership_origin_or_reason_release_total`     | Any                                                                                                | Security + People & access            | Disable membership projection, contain disclosure, restore consequence-only response, and add cross-purpose regression.               |
| `access_d42_cross_tenant_or_purpose_release_total`         | Any                                                                                                | Security + Data Platform              | Treat as security incident, revoke caches/downloads, assess all copies, repair keys/RLS/service parity, and re-prove isolation.       |
| `access_d42_floor_redaction_bypass_total`                  | Any                                                                                                | Privacy + Security + Policy Registry  | Fence field release, render protected placeholders, repair classification/floor policy, and review prior access.                      |
| `access_d42_unlogged_protected_read_total`                 | Any successful protected release without one access event                                          | Security + Audit Platform             | Disable protected read/export path, reconcile interaction evidence, repair atomicity/idempotency, and add failure regression.         |
| `access_d42_sensitive_value_in_technical_log_total`        | Any                                                                                                | Security + Privacy + Observability    | Stop ingestion, restrict/redact/delete lawful copies, rotate affected indexes if needed, assess disclosure, and repair schema.        |
| `access_d42_export_without_export_capability_total`        | Any                                                                                                | Security + Reporting                  | Revoke artifact, contain destination, repair capability/purpose check, audit downloads, and prove replay/scope tests.                 |
| `access_d42_richer_response_cache_hit_on_lower_tier_total` | Any                                                                                                | Security + Platform                   | Purge cache, disable affected cache layer, repair key/policy invalidation, assess disclosure, and re-enable after proof.              |
| `access_d42_forbidden_analytics_ai_task_egress_total`      | Any                                                                                                | Privacy + Data/AI Platform + Workflow | Stop consumer, delete/contain copies, assess use/disclosure, repair registry/schema allowlists, and require a new decision for reuse. |
| `access_d42_protected_read_failure_ratio`                  | >2% over 15 minutes with at least 50 attempts                                                      | Phase 12 + Platform Operations        | Keep current/safe summary available, diagnose read-audit/history dependency, roll back protected detail only, and reconcile failures. |
| `access_d42_safe_summary_miscomprehension_rate`            | >10% of at least 20 production-shaped subject studies interpret it as warning/action/current group | Product + UX Research + Privacy       | Revise/test safe copy or collapse subject tier to governance-only; never reveal group/reason as the fix.                              |

No monitor may automatically revoke/grant access, widen a viewer, change a
floor, create a subject correction request, or copy protected values into an
incident/task/notification.

## Historical D43 recommendation — resolved 2026-08-29

Founder selected Option 1, corrected to the typed Phase 12
`holder_direct_grant_review` request kind, contract version 1. The holder uses
the inline **Ask for an access review** action; submission changes no access;
current exact `permissions.manage_grants` authority is required at the
**Access requests** source lane and every decision; current source truth and
subject-only **My access requests** history remain separate; and Tasks Hub/
Inngest remain non-authoritative projection/execution. The complete current
contract and evidence are in the
[D43 adversarial review](./phase-24-d43-governed-holder-access-review-adversarial-review.md)
and
[D43 primary research](./phase-24-d43-governed-holder-access-review-primary-research.md).

The prior alternatives are retained in the Grill decision log for historical
traceability and are no longer an open D42 dependency.

## Evidence limits

- Official providers strongly support tiered self/admin/audit permissions, but
  none proves Core's exact four purposes or field matrix.
- Entra self-review supports subject correction in principle; it does not prove
  a D40 origin/date is necessary or sufficient for a ministry holder.
- Google field/log views and GitHub custom audit permissions are technical
  precedents, not mandates for the proposed capability IDs.
- ICO guidance is authoritative within its remit/jurisdiction and provides
  strong minimization/function-creep evidence; it is not a statement that every
  Core Tenant or group label is subject to UK GDPR or special-category rules.
- An Access-group label may reveal sensitive context, but sensitivity is not
  automatic. Unknown/conditional classification is deliberately protected.
- OWASP recommends logging/monitoring log access; it does not prescribe Core's
  exact atomic read-audit failure behavior or one-event-per-interaction design.
- NIST uses organization-defined roles/control parameters and does not choose
  Core's floor, capability, export, or retention policy.
- No production evidence validates audit-read/export operational friction,
  subject comprehension, correction rates, floor redaction, or support needs.
- No runtime proves RLS/service-role parity, field-level projections, cache
  invalidation, read-audit atomicity, export destination control, accessibility,
  localization, performance, or low-bandwidth recovery.

## Final research disposition

**Accept with required amendments.** Record Option 1 as a complete D42
purpose-tiered disclosure policy using the exact field matrix, separate
`permissions.audit.read` and `permissions.audit.export`
capabilities, registered purposes, current field floor/clearance, protected
placeholders, server-side projection, purpose-keyed cache/export controls,
minimized protected-read auditing, and total exclusion from non-authorized
product/log/analytics/AI surfaces.

D42 leaves no historical-label visibility question for D43. D43 now records
the holder correction action as a governed request to review/remove without
widening D42.
