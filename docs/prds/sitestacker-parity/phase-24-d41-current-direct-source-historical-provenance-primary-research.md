# Phase 24 D41 — Current Direct Source and Historical Continuity Provenance Primary Research

**Research date:** 2026-08-29  
**Decision under review:** after every group-derived D38 path ends and a D40-
origin direct grant remains current, show the source plainly as **Direct
grant** in administration or **Granted directly to you** in My Access, and
retain **Added for continuity** only as authorized historical provenance.  
**Scope:** current-versus-historical information architecture, access-source
explanation, ordinary-holder and administrator journeys, badges/labels,
progressive disclosure, source-specific removal, privacy, audit/history,
localization, accessibility, mobile/low-bandwidth behavior, and the minimum
read-model safeguards needed to keep presentation truthful.  
**Verification note:** broad formatting, local-link, skill-parity, strict
OpenSpec, lint, typecheck, unit, build, and diff checks remain deferred until
the end of the Grill session by founder direction.

## Research question

Is it current best practice to present a surviving D40-origin source as an
ordinary current direct grant while retaining its continuity origin only in
expanded provenance/history? If so, what exact information hierarchy keeps the
experience understandable without hiding governance evidence, misrepresenting
authority, exposing sensitive history, or creating a new state machine?

## Evidence labels

- **Repository fact:** verified directly in current Core source/docs.
- **Verified external fact:** supported by a current official primary source.
- **Requirement inference:** a falsifiable requirement derived from repository
  and external facts; it still needs implementation proof.
- **Product judgment:** a selected product/UX tradeoff, not an external fact.
- **Assumption:** plausible but not established by ministry-user or production
  evidence.
- **Unresolved unknown:** requires a later founder decision or user research.

## Executive finding

The choice is **modern and proportionate with required amendments**.

The strongest current cross-product pattern is not “always show every origin”
or “erase old context.” It is a layered explanation:

1. show the person's **current** access and current source first;
2. make every current source explainable and separately removable;
3. keep earlier assignment/request/change evidence in a distinct history or
   audit surface; and
4. disclose governance detail according to viewer purpose rather than placing
   it in every holder-facing row.

Microsoft Entra shows whether a current role is assigned directly or through a
group and separately exposes eligible, active, and expired assignments. Its My
Access portal separates active access from request history. GitHub separates
current **Direct access** from organization/team access and uses a **Mixed
roles** warning only for a current conflict; add/remove events live in the
organization audit log. Salesforce exposes current permission sources through
**Access Granted By**. Google separates current policy analysis/troubleshooting
from timestamped IAM change history. Contentful separates individual/team role
sources and team membership views. Blackbaud separates current Roles from
**View Role History**.

None of those products proves Core's exact D40 journey, and none is a license
to copy its UI. Together they support a durable principle: **current source and
historical origin are different questions and should not compete at the same
visual level**.

Option 1 therefore needs the following amendments:

- **Direct grant** / **Granted directly to you** derives only from current
  Phase 12 source state and current `EffectiveAccess`, never from D40 history.
- **Added for continuity** derives only from immutable D40 creation basis and
  append-only history, never from a current Boolean or parsed reason.
- Ending the final group path performs no conversion, retag, notification,
  task, or direct-grant write; the next current read changes the source list.
- Ordinary current lists use no continuity/exception warning badge. Dedicated
  governance review/history may show a quiet origin field because the origin
  is relevant there.
- The ordinary holder sees only the already-authorized safe current source and
  end condition until D42 settles historical viewer tiers.
- A membership manager's removal review/receipt names the surviving current
  direct source and end condition, but does not gain the D40 reason or actor
  history by implication.
- Authorized provenance is a disclosure/detail view, not hover-only content,
  a tooltip, a wide matrix, or a second permission row.
- Current access remains usable and truthful if optional history is slow,
  unavailable, retained in cold storage, or at an unknown presentation version.
- Operational search/report/export classifies the current source as direct;
  privileged audit can query the historical D40 creation mode separately.
- Group rename, archive, delete, return, or recreation never rewrites event-
  time provenance or produces a broken historical link.

## Current, intended, and permanent state

| State                   | Verified position                                                                                                                                                                                      | D41 consequence                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| **Current repository**  | No Phase 12 D38/D39/D40 runtime or D41 UI is shipped. Current Teams & Users remains a seed-backed prototype.                                                                                           | No existing badge, Team sheet, role toggle, or cache is precedent for this presentation.                  |
| **Governing baseline**  | D39 has one additive `EffectiveAccess` model with independent direct/group paths. D40 creates an ordinary direct source with immutable overlap basis, its own duration, and no later group dependency. | D41 can change only presentation; it cannot invent a new grant state or lifecycle.                        |
| **Chosen presentation** | Current source says **Direct grant** in administration or **Granted directly to you** in My Access. Historical creation context says **Added for continuity** in authorized provenance/history.        | Current truth stays calm and actionable while review/support can reconstruct why the edge was created.    |
| **Best permanent path** | One permission row, current sources first, optional authorized history second, source-specific actions, and purpose-scoped projections.                                                                | No permanent warning badge, conversion worker, derived status column, or history-dependent authorization. |

## Current Core repository evidence

| Repository evidence                                                                                            | Finding                                                                                                                                                                         | D41 requirement                                                                                                           |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| [Phase 12 PRD](./phase-12-full-role-permission-configuration.md)                                               | Phase 12 owns grants, `EffectiveAccess`, epochs, access explanation, source-aware consequences, and risk-based recertification.                                                 | Current labels resolve from Phase 12, not Website, history, tasks, or UI caches.                                          |
| [D39 adversarial review](./phase-24-d39-direct-and-governed-group-capability-assignment-adversarial-review.md) | Direct/group sources are independent, additive, and separately revocable; one person row explains all current paths.                                                            | D41 cannot add precedence, conversion, or a second permission state.                                                      |
| [D40 adversarial review](./phase-24-d40-deliberate-continuity-direct-grant-adversarial-review.md)              | The D40 source is an ordinary assignment capability grant; overlap basis is immutable audit provenance, and ordinary holders receive only safe source/duration.                 | Historical origin must remain subordinate and viewer-scoped.                                                              |
| [D40 primary research](./phase-24-d40-deliberate-continuity-direct-grant-primary-research.md)                  | Continuity creation changes future survival, not present ability, and carries independent reason/duration/history.                                                              | D41 must not imply a new gain or that group loss created a new grant.                                                     |
| [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)                                  | One resolver owns direct/group access; no source silently removes, converts, or renews another.                                                                                 | A presentation-only current/history split is the compatible architecture.                                                 |
| [`CONTEXT.md`](../../../CONTEXT.md)                                                                            | Canonical UI terms are **Direct grant**, **Granted directly to you**, **Through [Access group]**, and historical **Added for continuity**; “redundant permission” is forbidden. | Use canonical terms and keep **Added for continuity** as provenance, not state.                                           |
| [Frontend rules](../../ai/rules/frontend.md)                                                                   | Core uses shared Base Maia/Base UI primitives, semantic tokens, server-owned privileged writes, and accessible shared behavior.                                                 | Use the existing Collapsible/Accordion composition; do not invent ARIA, a component library, or a parallel visual system. |
| [Accessibility review skill](../../ai/skills/accessibility-review/SKILL.md)                                    | Native semantics, names, keyboard/focus, programmatic feedback, reflow, touch, and reduced motion require manual proof.                                                         | Disclosure/history must work without hover, color, motion, or pointer precision.                                          |
| [`packages/ui/AGENTS.md`](../../../packages/ui/AGENTS.md)                                                      | Every product UI must preserve Base Maia/Zinc semantic tokens and consider all responsive/loading/error/disabled/focus states.                                                  | D41 is a composed access-detail pattern, not an app-local badge or prototype fork.                                        |
| [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)                             | Tasks Hub is a projection of work and never authorization truth.                                                                                                                | Group loss or presentation change creates no task and Inngest cannot own D41.                                             |

## Current official primary-source evidence matrix

### Microsoft Entra

| Official source                                                                                                                      | Verified fact                                                                                                                                                                  | D41 implication                                                                                                         | Evidence limit                                             |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [List Microsoft Entra role assignments](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/view-assignments) | A user's role view shows assignments at different scopes and whether each is direct or via a group; the PIM experience separately shows eligible, active, and expired details. | Current source type and current lifecycle belong in the primary access explanation; expired/history is distinguishable. | Entra does not document a D40 continuity-origin badge.     |
| [Microsoft Entra RBAC overview](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/custom-overview)          | A role assignment joins principal, role, and scope; access is granted/removed through role-assignment lifecycle, with direct, group, and time-limited options.                 | Current authority is the live assignment path, not how unusual its creation once was.                                   | Entra roles/scopes are not Core's D38 capability model.    |
| [What is the My Access portal?](https://learn.microsoft.com/en-us/entra/id-governance/my-access-portal-overview)                     | Users see access-related current work and can use a separate Request history view; administrators configure through a different admin surface.                                 | Ordinary-holder and governance experiences need not expose the same depth.                                              | This establishes layering, not Core's exact viewer policy. |
| [Request an access package](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-request-access)             | Request status and details live in Request history while active access is separately discoverable.                                                                             | Historical justification/request context can remain available without becoming a permanent current badge.               | Access packages are a different entitlement abstraction.   |

### Google Cloud IAM

| Official source                                                                                     | Verified fact                                                                                                                                                    | D41 implication                                                                                                                | Evidence limit                                                                      |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| [Policy Analyzer](https://docs.cloud.google.com/policy-intelligence/docs/policy-analyzer-overview)  | It answers current “who/what/resource” questions and can expand group-derived access to individual members; group expansion is bounded and permission-dependent. | Current source explanation should be queryable without scanning history, and group identities must remain permission-filtered. | Analyzer freshness/limits mean it cannot itself be Core authority.                  |
| [Resolve permission errors](https://docs.cloud.google.com/iam/docs/resolve-permission-errors)       | Policy Troubleshooter lists relevant current policies and explains how they affect access; remediation distinguishes direct grant from group membership.         | Current explanation and source-specific action belong together.                                                                | Troubleshooter focuses on denied access, not continuity origin.                     |
| [Review IAM allow policy history](https://docs.cloud.google.com/iam/docs/review-iam-policy-history) | IAM policy changes are reviewed in audit logs or a distinct Change History view with timestamped records.                                                        | Current access analysis and historical change provenance should remain separate projections.                                   | Cloud Asset history windows/retention are provider-specific and must not be copied. |

### Salesforce

| Official source                                                                                                                                                             | Verified fact                                                                                                                                                                                                    | D41 implication                                                                                                                               | Evidence limit                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [View a User's Access Summary](https://help.salesforce.com/s/articleView?id=users_access_summary.htm&language=en_US)                                                        | Administrators can open a permission's row action and use **Access Granted By** to see which profile, permission sets, or permission-set groups currently supply it; the page may need refresh for current data. | One deduplicated permission with expandable current-source explanation is established CRM practice; stale projections need explicit handling. | The help page does not prescribe holder-facing history or D40 terminology. |
| [Permission Set Group Considerations](https://help.salesforce.com/s/articleView?id=platform.perm_set_groups_considerations.htm&language=en_US&type=5)                       | Individual and permission-set-group sources may coexist.                                                                                                                                                         | A surviving individual source remains a direct source; no conversion is required.                                                             | Salesforce's additive permission semantics differ in some deny details.    |
| [Permission Assignment Expiration Considerations](https://help.salesforce.com/s/articleView?id=platform.permissions_assign_expire_considerations.htm&language=en_US&type=5) | Expiration of one assignment leaves access provided by another current source.                                                                                                                                   | Source end and effective-access end must remain distinct in copy/history.                                                                     | It does not establish Core's exact expiry presentation.                    |

### GitHub

| Official source                                                                                                                                                                                                                                         | Verified fact                                                                                                                                                                      | D41 implication                                                                                                        | Evidence limit                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [Manage teams and people with repository access](https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/managing-teams-and-people-with-access-to-your-repository) | Current access can be toggled between **Direct access** and **Organization access**. **Mixed roles** warns when current access conflicts and opens its current source explanation. | A warning/tag is justified for a current ambiguity, not merely for historical origin after only a direct path remains. | GitHub does not expose Core's D40 reason/duration contract. |
| [Organization audit log events](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/audit-log-events-for-your-organization)                                                      | `repo.add_member`, `repo.remove_member`, `team.add_member`, `team.remove_member`, and organization-role assignment are separate timestamped audit events with actor/source fields. | Durable add/remove history can explain how current state arose without mutating the current source label.              | Event schema/retention are GitHub-specific.                 |
| [Remove organization members from a team](https://docs.github.com/en/enterprise-cloud@latest/organizations/organizing-members-into-teams/removing-organization-members-from-a-team)                                                                     | Team removal has access consequences only where no other path survives and may require deliberate handoff.                                                                         | Group-removal review/receipt must state the surviving direct path, not claim access ended.                             | GitHub is not proof of ministry workflow frequency.         |

### Contentful CMS and nonprofit CRM

| Official source                                                                                                                    | Verified fact                                                                                                                           | D41 implication                                                                                                   | Evidence limit                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [Contentful multiple roles](https://www.contentful.com/help/roles/space-roles-and-permissions/assigning-multiple-roles-to-a-user/) | Roles may be assigned individually or inherited from one or more teams and combine into effective permissions.                          | Comparable CMS access has multiple current sources; source labels should describe current paths.                  | Contentful does not document a continuity-origin history pattern.                       |
| [Contentful team memberships](https://www.contentful.com/help/users-and-teams/teams/viewing-team-memberships/)                     | A person can view teams they belong to; organization owners/admins can inspect another user's team memberships and team-derived spaces. | Holder and administrator surfaces may share safe current-source facts while retaining different management depth. | It does not prove historical group identity should be holder-visible.                   |
| [Blackbaud Roles](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/sec-role.html)                            | Current roles have clear names/descriptions and regular review; **View Role History** or Security > Audit history is a separate action. | A directly comparable nonprofit product separates current access administration from history.                     | Blackbaud permits one role per feature area and does not model Core's additive sources. |

### Security and UX/accessibility standards

| Official source                                                                                                  | Verified fact                                                                                                                        | D41 implication                                                                                                                                 | Evidence limit                                                                       |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) | Authorization should be least-privileged, deny by default, checked on every request, logged appropriately, and regression-tested.    | Viewer access to history and every current action must be server-authorized; presentation metadata cannot authorize.                            | OWASP does not dictate copy or visual hierarchy.                                     |
| [NIST SP 800-53 Release 5.2.0](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)                               | The control catalog distinguishes Access Control from Audit and Accountability and includes ongoing assessment/monitoring.           | Current authorization and audit provenance should be separately owned but traceable.                                                            | NIST is control guidance, not a product UI specification.                            |
| [WAI-ARIA Disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)                              | A disclosure has a button plus controlled content, supports Enter/Space, and exposes `aria-expanded`.                                | Authorized history can be progressively disclosed with a known keyboard/screen-reader pattern.                                                  | APG does not decide which viewers receive content.                                   |
| [WCAG 2.2 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels)                  | Descriptive labels help people orient and understand relationships; labels need not be long.                                         | **Current source**, **History**, **Why this person has access**, and **Why you have access** are clearer than a compact unexplained icon/badge. | It does not mandate those exact words.                                               |
| [WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow)                                            | Non-excepted content must reflow at 320 CSS pixels without two-dimensional scrolling or loss.                                        | Use stacked semantic source/history blocks, not a wide access matrix.                                                                           | Reflow conformance still requires implementation testing.                            |
| [WCAG 2.2 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)                | Pointer targets are at least 24 by 24 CSS pixels or meet exceptions; larger targets improve touch use.                               | Core's stricter 44-pixel control convention is compatible and appropriate for the disclosure/retry/action controls.                             | WCAG's normative floor is 24, not Core's 44.                                         |
| [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)                          | Material async status can be programmatically conveyed without moving focus.                                                         | A history-load error or source-change receipt needs semantic status, not toast/color alone.                                                     | Current-source content itself is normal page content, not necessarily a live region. |
| [USWDS Tag guidance](https://designsystem.digital.gov/components/tag/)                                           | Tags draw attention to new/important/categorized content; users may confuse them with buttons, and guidance says not to overdo them. | A permanent continuity badge would spend attention on a historical fact and add interaction ambiguity; quiet labeled text is safer.             | USWDS is not Core's design system and is used only as research evidence.             |

## Evidence synthesis

### Verified facts

- Mature IAM/CMS/CRM systems expose current direct and group-derived sources.
- Current assignments and historical requests/change events are commonly
  separated into different tabs, details, or audit/history views.
- Multiple sources can coexist, and ending one source does not necessarily end
  effective access.
- Access-source explanation is administrator-oriented and permission-filtered.
- Accessible disclosures require explicit state, keyboard behavior, and clear
  labels; responsive content must reflow.
- Tags/badges deliberately attract attention and can be mistaken for controls.

### Product inferences

- A D40 origin is useful during governance review/support but is not a current
  access state after all group paths end.
- Showing the surface-appropriate current direct label prominently and **Added for continuity** in an
  authorized history/detail surface gives the clearest truthful hierarchy.
- A permanent warning-style badge would overstate historical context and can
  imply that the direct source is temporary, second-class, or group-dependent.
- Removing history entirely would undermine explanation, audit, and safe
  source-specific review.

### Evidence gaps

- No official source tests the exact phrase **Added for continuity** with
  nonprofit ministry staff.
- No source establishes which Core viewer tiers should see historical group
  names, free-text reasons, actors, or receipts; D42 now records Core's product
  judgment rather than presenting it as externally proven.
- No user study proves the proposed disclosure label, default collapsed state,
  or mobile copy comprehension.
- No runtime exists to prove history failure isolation, cache invalidation,
  RLS parity, latency, or reflow.

## Strongest alternative and counterevidence

The strongest plausible alternative is not automatic conversion. It is a
narrower version of Option 2: keep a persistent, administrator-only
**Continuity grant** tag beside the current direct source while ordinary
holders see plain direct access.

That alternative has real strengths:

- an access reviewer cannot overlook that the source was deliberately created
  during overlap;
- support can find unusual grants without opening every history panel;
- a governance list could filter/audit the cohort quickly; and
- the extra salience may help while D40 is new and misunderstood.

It remains weaker as the permanent default:

- the label describes creation history, not current source, authority, risk,
  duration, or review status;
- it can imply the grant is still dependent on a group or should disappear
  automatically when a group changes;
- “exception” or warning styling can stigmatize the holder and encourage
  ad-hoc cleanup outside source-specific review;
- every ordinary list, export, screen reader label, mobile card, filter, cache,
  and design surface would need semantics for a non-current state;
- USWDS explicitly warns that tags attract attention, are confused with
  controls, and lose value when overused;
- GitHub's comparable warning is tied to a **current** mixed-role conflict,
  not to a resolved historical overlap; and
- the same reviewer benefit is available through an origin field/filter on a
  dedicated governance/audit surface without polluting current access truth.

The alternative should become a targeted fallback only if production-shaped
review studies show authorized reviewers routinely fail to discover origin in
the proposed detail/history journey. Even then, the change should be a quiet
review-surface provenance field, not a global warning badge or new source state.

Option 3—mutating or “converting” the source—is strictly worse. The grant is
already an ordinary direct source. A conversion would fabricate a lifecycle
event, introduce concurrency/idempotency/rollback work, risk losing creation
evidence, and produce the same current label that a read model can render with
no write.

## Exact corrected decision

> When the final current group-derived D38 path ends and a D40-origin direct
> grant remains current, Core presents the current source using the same
> ordinary direct-source language and action model as any other current direct
> D38 grant.
>
> The administration/person view says:
>
> **Direct grant · Ends [localized date]**
>
> or:
>
> **Direct grant · Until removed**
>
> The holder's My Access view says:
>
> **Granted directly to you · [current end condition]**
>
> Neither current summary shows **Continuity**, **Continuity exception**,
> **Redundant**, **Backup**, **Legacy**, **Special**, or warning styling. The
> source is not a second permission row and is not visually demoted.
>
> Authorized provenance/history retains immutable D40 origin as historical
> context, clearly separated from current state:
>
> **Added for continuity**
>
> **Added for continuity · [localized instant]**  
> \*\*This direct grant was added while access also came through [authorized
>
> > event-time group summary].\*\*
>
> The current section always precedes the history section in visual and DOM
> order. Historical origin is expanded through **Why this person has access**
> in administration. My Access uses **Why you have access** for its safe
> holder-facing explanation. Neither route is hover-only, tooltip-only, color-
> only, icon-only, or encoded as a current badge.
>
> Current source and historical origin are separate authoritative facts.
> **Direct grant** / **Granted directly to you** derives only from the canonical current
> Phase 12 direct source, exact Active Tenant Assignment, delegation/floor,
> end condition, governance epoch, and current `EffectiveAccess` explanation.
> **Added for continuity** derives only from typed immutable D40 basis
> and append-only source history. Core never parses the free-text reason or
> stores a derived current `continuity_status`, `became_sole`, `exception`, or
> badge Boolean.
>
> Ending the final group path mutates only that group/membership/grant path and
> advances the ordinary Phase 12 governance boundary. It does not mutate,
> convert, reissue, renew, retag, notify about, taskify, or create a new event
> for the direct source. The current-source presentation changes on the next
> canonical read because the current source set changed.
>
> If a group path returns, current detail again lists both **Direct grant** and
> **Through [current Access group]**. The original D40 history neither moves
> into current status nor disappears. Group return does not pause, clean up,
> renew, or rewrite the direct source.
>
> Group rename never rewrites event-time provenance. Authorized history stores
> stable identity plus an event-time label snapshot; where policy permits, it
> may render **Website Operations (now Digital Ministry Operations)**. An
> archived/deleted/otherwise terminal group renders as non-interactive
> historical text, never a broken link or raw identifier. A recreated group is
> a different source identity.
>
> If the direct grant expires, is revoked, becomes delegation-inert, loses
> required recertification, or the Active Tenant Assignment/floor makes it
> ineffective, it leaves the current-source section and remains in authorized
> terminal history. A later direct successor has its own provenance; origin is
> never copied automatically.
>
> Every source-specific removal/review uses current post-change
> `EffectiveAccess`. Removing the final group path says that access remains
> through the direct grant and states its end condition. Removing the sole
> direct path says access will end. If a group path has returned, removing the
> direct path says access remains through the named current group source. No
> action is labeled **Remove continuity exception** after creation.
>
> Current People & access lists, holder counts, ordinary operational search,
> and current-access exports classify this as a direct source. Only a
> separately authorized governance/audit purpose may query historical D40
> creation mode. Website surfaces, Tasks Hub, donor/missionary/public apps,
> ordinary staff analytics, notifications, performance scoring, AI prompts,
> and logs receive no continuity-origin field.
>
> Historical group identity, free-text reason, grant actor/authority, and
> receipt visibility remain least-privilege and are not widened by D41. D42
> must choose the permanent viewer tiers. Until then, ordinary holders and
> membership managers receive only the D39/D40-safe current source and end
> condition already required for truthful access/removal consequences.
>
> Current access and source presentation never depend on history availability.
> If optional history is unavailable, authorized UI says **Access history is
> temporarily unavailable. Current access is not affected.** It supports a
> safe retry without hiding the current source or exposing a raw error. If the
> canonical current read is unknown, Core does not guess a current direct source;
> actions fail closed and the authorized UI presents a truthful retry state.
>
> Current projections/caches bind Tenant, exact Active Tenant Assignment,
> capability, source state/end condition, governance epoch, viewer purpose,
> and the applicable provenance revision. Cross-Tenant or cross-viewer reuse is
> forbidden. Existing Phase 12 epoch invalidation handles group end/return;
> D41 creates no second cache-invalidation system.
>
> Dates use authoritative UTC instants and viewer-localized date/time/zone.
> Event ordering uses authoritative sequence/head plus instant rather than
> localized strings. Summary dates may be concise; detail/history provides the
> unambiguous instant/zone needed for review.
>
> The UI uses Core's shared Base Maia/Base UI primitives and semantic tokens.
> The disclosure has a descriptive accessible name, native/Base UI keyboard
> behavior, visible focus, programmatic loading/error state, Core's 44-pixel
> important targets, current-first reading order, 320-CSS-pixel reflow,
> forced-colors/reduced-motion support, and wrapping for long international,
> CJK, RTL, and bidirectional names. Meaning never depends on color, badge,
> icon, hover, motion, truncation, or visual proximity.
>
> D41 adds no authorization table, grant mutation, Website-local state,
> conversion job, timer, review campaign, notification, email, unread state,
> task, report score, or Inngest authority.

## UX and user journeys

### Information hierarchy

The access row answers three questions in order:

1. **What can this person do?** The one deduplicated D38 capability.
2. **Why can they do it now?** Every current source and its end condition.
3. **How did this source come to exist?** Authorized provenance/history on
   demand.

Creation history never interrupts the first two questions. It is discoverable,
not concealed, and is more prominent on dedicated review/audit surfaces than
on ordinary holder/current-access lists.

### Person detail for an authorized access manager

```text
Apply Website recovery settings to current work

Direct grant · Ends 15 October 2026

[Why this person has access]
```

The row uses normal text hierarchy and a source-specific action menu. It has no
warning-colored continuity tag. **Why this person has access** is a real
button/disclosure with a contextual accessible name such as **Why this person
has access to Apply Website recovery settings to current work**.

Expanded:

```text
Why this person has access

Current source
Direct grant
Ends 15 October 2026

History
Added for continuity
29 August 2026
This direct grant was added while access also came through Website Operations.

Website Operations access ended 1 September 2026.
```

Reason, actor, authority/delegation, receipt, and exact basis appear only when
the D42 viewer policy allows them. History uses an ordered chronology or
description list, not visual paragraphs whose meaning depends on alignment.

### My Access for the holder

```text
Apply Website recovery settings to current work

Granted directly to you · Ends 15 October 2026
```

The holder gets a simple answer to “why do I have this now?” They do not see a
warning that implies misconduct or exception status. Until D42, they do not
gain the group-name snapshot, reason, grantor, delegation, or audit receipt.
**Why you have access** remains a safe current-source/end-condition explanation
rather than a history-authority bypass.

### Group or membership removal

Before commit, the source-aware review says:

```text
Jordan will leave Website Operations.

This permission will remain through a direct grant until 15 October 2026.
```

After commit, the durable receipt says:

```text
Jordan was removed from Website Operations.
Website recovery access remains through a direct grant until 15 October 2026.
```

The membership manager does not need the continuity reason to understand the
consequence. The receipt is persistent and programmatically announced; a toast
may supplement but never replace it.

### Dedicated Phase 12 access review/audit

A reviewer opens one source review with current facts first:

```text
Current source: Direct grant
Ends: 15 October 2026
Added for continuity: 29 August 2026
```

The origin may be an immediately visible neutral metadata row inside the open
review item because it changes the governance assessment. It is not a global
current-status badge. A privileged audit list may filter by typed D40 creation
mode; ordinary operational lists may not.

### Group path returns

```text
Current sources
Direct grant · Ends 15 October 2026
Through Website Operations · Until removed

[Why this person has access]
```

Expanded history still says the direct source was created for continuity. The
UI does not oscillate between source types or produce a “converted back” event.

### Direct-source removal

- If direct is the only current path, the review clearly says Jordan will lose
  D38 and names dependent D37 fencing consequences already owned by D39/D40.
- If a group has returned, the review says the direct source ends and access
  remains through that group.
- The action is **Remove direct grant**, never **Remove exception**.

### History unavailable or slow connection

```text
Direct grant · Ends 15 October 2026

Access history is temporarily unavailable.
Current access is not affected.

[Try again]
```

The current section is rendered from the current permission-filtered read
model and does not wait for history. History is lazy/on-demand. Retry preserves
focus and does not refetch or mutate authority. No raw IDs, stack traces, or
forbidden group labels appear in errors.

### Mobile, localization, and low-bandwidth shape

- Stack capability, current source, duration, and disclosure vertically.
- Avoid a multi-column permission matrix and horizontal scrolling.
- Let long names/labels wrap; never truncate the only distinguishing identity.
- Format full sentences through localization, not concatenated fragments.
- Show absolute localized dates; detail includes timezone when the boundary is
  time-sensitive. Do not rely on “tomorrow” or localized string sorting.
- Keep icons decorative where text already names the source; do not require a
  tooltip for essential meaning.
- Load current truth before optional history and cache neither across Tenants
  nor viewer-purpose classes.

## Source of truth, ownership, and invariants

| Fact                             | Authoritative owner                                                         | Derived consumers                                            | Must never become authority                |
| -------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------ |
| Current direct source            | Phase 12 direct grant head plus exact assignment/delegation/floor/end state | PDP explanation, People & access, My Access, current export  | D40 basis, UI label, badge, history cache  |
| Current `EffectiveAccess`        | Phase 12 resolver at current Tenant governance epoch                        | PEPs, current holder/search projection, post-change receipts | holder count, Tasks Hub, current UI cache  |
| D40 continuity origin            | Immutable typed D40 creation basis + append-only audit                      | authorized provenance, review, audit export                  | source validity, priority, expiry, cleanup |
| Current group paths              | Phase 12 group-capability and membership heads                              | current source explanation and consequence review            | D40 overlap snapshot                       |
| Event-time group identity/label  | Stable historical source identity plus immutable event-time label snapshot  | authorized history renderer                                  | current group display name                 |
| Current group display label      | Current group source, permission-filtered                                   | current source row/link                                      | event-time history rewrite                 |
| Direct end condition             | Current direct source lifecycle                                             | current summary, review, receipt                             | historical overlap duration                |
| Viewer disclosure                | Purpose-scoped Phase 12 authorization; final tiers deferred to D42          | admin/holder/reviewer/audit projections                      | raw table grants, route visibility alone   |
| Current operational source class | Current direct/group resolver result                                        | People search, current-holder report/export                  | D40 creation mode                          |
| Historical-origin query          | Typed D40 basis under privileged governance purpose                         | audit/review filter/export                                   | ordinary analytics or scoring              |

The following invariants must always hold:

1. A current direct path is presented as direct regardless of how it was
   created.
2. D40 continuity origin is historical provenance, not current access state.
3. Historical origin never grants, denies, expires, renews, ranks, or cleans up
   access.
4. Ending the final group path writes no direct-source conversion or derived
   status.
5. Existing Phase 12 group mutation/epoch change is sufficient to invalidate
   the current source set.
6. Current access display can be correct when history is absent or unavailable.
7. History can be correct only from typed immutable basis/events, never reason
   parsing or mutable labels.
8. Current source list contains every and only current authorized path.
9. One capability appears once even when several source paths exist.
10. Each current source retains its own end condition and source-specific
    removal action.
11. Returning group paths reappear without changing direct-source identity or
    D40 history.
12. A group rename never changes the historical identity or event-time label.
13. An archived/terminal source is history text, not an actionable link.
14. A recreated group/assignment never inherits an earlier source's history or
    direct grant.
15. A terminal direct source leaves current view and remains authorized history.
16. A later direct source carries its own provenance and cannot inherit D40 by
    convenience.
17. Operational search/export classifies a current D40-origin survivor as
    direct.
18. Historical-origin filtering requires a separate governance/audit purpose.
19. Ordinary holder/current-access analytics receive no origin, reason, actor,
    or prior-group field.
20. Cache keys and read authorization bind Tenant, assignment, capability,
    current epoch, and viewer purpose.
21. Cross-Tenant or cross-viewer history reuse is impossible.
22. Event chronology uses authoritative sequence/head plus UTC instant.
23. Localized copy/date strings never determine identity, ordering, or policy.
24. Source and history rendering never depends on color, icon, hover, or badge.
25. D41 creates no task/notification/workflow side effect.

## Lifecycle and temporal truth table

| Scenario                                                  | Current presentation                                               | Historical presentation                                            | Mutation consequence                               |
| --------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------- |
| Direct + one or more groups are current                   | One capability; list direct and every current group path           | D40 origin available to authorized history viewer                  | No D41 write                                       |
| Last group path ends; direct remains current              | **Direct grant/Granted directly to you** plus direct end condition | D40 creation plus group-end chronology                             | Group path terminal/epoch only                     |
| Direct ends; group remains current                        | Only **Through [group]**                                           | Direct terminal cause and D40 origin remain history                | Direct path terminal/epoch only                    |
| Direct and final group end at same authoritative boundary | No current D38 source                                              | Both terminal histories retained                                   | Final-path D39/D40 consequences once; no D41 state |
| Group returns before direct ends                          | Direct plus current group source                                   | Original D40 origin unchanged                                      | Group path creation/reactivation only              |
| Group is renamed                                          | Current group path uses permitted current name                     | Event-time label remains; optional “now” name is clearly secondary | No authority/history rewrite                       |
| Historical group is archived/deleted                      | No current path unless another exists                              | Non-interactive retained label/identity                            | No history cascade                                 |
| Direct expires exactly at displayed boundary              | It is absent at/after the canonical half-open expiry instant       | Terminal expiry remains                                            | Source expiry/epoch only                           |
| Active Tenant Assignment ends/recreates                   | No earlier human source remains current                            | Prior assignment history remains purpose-scoped                    | No rehire/recreation transfer                      |
| Current read succeeds; history read fails                 | Current source remains visible/actionable                          | Safe unavailable/retry state                                       | No authority change                                |
| Current read is unknown/stale beyond accepted epoch       | Do not guess active source; fail actions closed                    | History cannot substitute                                          | Refresh/retry/incident path                        |

No D41-specific `became_sole_at` timestamp is needed. If an authorized history
view wants to say when the final group path ended, it derives the event from
the append-only source chronology and stable ordering. That event describes the
group path, not a state transition of the direct source.

## Read-model, RLS, cache, and performance safeguards

D41 requires no new authorization/write table. It consumes Phase 12 current
source data and D40 immutable provenance through separate purpose-built reads.

- The current-list read is set-based and indexed by Tenant, exact Active Tenant
  Assignment, capability, state/end boundary, and current governance epoch.
- A list/card query never joins or scans free-text reason, D40 basis, or full
  audit chronology per person.
- The history/detail read is separate, lazy/on-demand, authorized, bounded,
  indexed, versioned, and paginated where chronology can grow.
- Browser roles receive no raw SELECT over D40 basis/audit. Purpose-built views,
  RPCs, or server reads expose only permitted fields.
- RLS/authorization covers both existing rows and proposed filters; table owner,
  service role, `BYPASSRLS`, security-definer, support, repair, export, worker,
  cache fill, and AI paths reproduce the same Tenant/purpose boundary.
- Security-definer code pins `search_path`, derives Tenant/actor/viewer purpose
  from trusted server context, and accepts no caller-controlled visibility tier.
- Current cache entries include the Phase 12 epoch and cannot be overwritten by
  a slower history response.
- History cache entries include Tenant, assignment/source identity, viewer
  purpose/class, provenance version/revision, and retention state.
- An authorization downgrade invalidates/denies history immediately even if a
  previously fetched panel remains in browser memory; protected navigation and
  refetch reauthorize.
- Low-bandwidth history failure does not refetch/optimistically rewrite current
  access. Retry is idempotent and side-effect free.
- Current-access export binds a proved snapshot epoch/instant and excludes D40
  reason/origin. Privileged audit export binds its own purpose, schema version,
  fields, snapshot, and access log.
- Unknown provenance versions render a safe **History unavailable** state and
  never fall back to raw JSON, guessed labels, or current-state mutation.

## Failure modes and recovery

| Failure                                               | Safe behavior                                                                                             | Required evidence/recovery                                  |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Group end commits but current projection is stale     | PEP uses canonical epoch; current UI rejects stale epoch/refetches and never shows group as authoritative | Epoch mismatch telemetry and source-head reconciliation     |
| Current source is correct but history service is down | Show direct current source; show localized history-unavailable status and retry                           | Separate current/history error boundaries and traces        |
| History response arrives after viewer loses privilege | Server/view authorization denies; stale response is discarded/not cached for new purpose                  | Viewer-purpose key and downgrade test                       |
| Cross-Tenant cache key collision                      | Deny/contain as a security incident; never render partial history                                         | Exact Tenant keys, RLS parity tests, zero-tolerance monitor |
| Group renamed or hard-delete attempted                | Preserve stable history; render event-time label; block/correct destructive cascade                       | Restrictive FK/append-only history proof                    |
| Direct expiry races final group end                   | One expected-head/source fold determines the current source set and final-path consequence                | Boundary/concurrency tests at equal instant                 |
| Group returns while history is open                   | Current section refreshes to both paths; history stays unchanged                                          | Epoch-aware current subscription/refetch                    |
| History has an unknown event version                  | Current truth stays usable; history states unsupported/unavailable, no raw payload                        | Versioned renderer and forward-compatible test              |
| Localization bundle missing                           | Use approved safe fallback string; never show an internal key or change ordering                          | Locale fallback telemetry and review                        |
| Offline/weak network after prior load                 | Never claim cached history/current source is live without epoch freshness; offer retry                    | Explicit freshness contract and offline tests               |
| Export spans an epoch change                          | Fail/restart or label one exact snapshot; never mix rows from different current states                    | Snapshot metadata and reconciliation                        |
| Source-specific removal times out after commit        | Receipt lookup shows authoritative outcome/current sources; no duplicate mutation                         | Semantic idempotency and receipt recovery                   |

## Privacy and humane-use boundary

D41 explains access; it does not create a new employee-monitoring signal.

- Continuity origin, reason, actors, prior group identity, and review history
  are not staff-performance, engagement, trustworthiness, readiness, ministry-
  health, or risk scores.
- Ordinary dashboards, donor/missionary/public surfaces, Tasks Hub, email,
  notifications, analytics, AI summarization, and search suggestions receive
  none of those fields.
- Free-text reason is rendered only when independently authorized and remains
  subject to D40 minimization/retention; D41 never copies it into labels,
  telemetry, errors, URLs, client logs, or notification payloads.
- Historical subject/actor disposition follows the governing identity and
  retention policy without rewriting the business event or leaking deleted
  names as raw identifiers.
- Access to privileged history is itself auditable; “can manage membership” or
  “can use D38” does not imply “can read governance reasons.”
- D42 must finish the precise viewer-purpose tiers before activation can widen
  historical disclosure.

## Research outcomes

### Problem validity, repository consistency, and alternatives

- **D41-RA001 — Repository fact:** D39/D40 already establish that the surviving
  source is an ordinary independent direct grant; D41 does not decide whether
  it authorizes access.
- **D41-RA002 — Product judgment:** the real problem is explaining current
  authority without erasing creation history, not creating another lifecycle.
- **D41-RA003 — Repository fact:** current Teams & Users seed UI is not the
  permanent People & access model and supplies no trustworthy D41 pattern.
- **D41-RA004 — Verified external fact:** Entra, GitHub, Salesforce, Google,
  Contentful, and Blackbaud distinguish current-source/access views from some
  form of request/change/audit history.
- **D41-RA005 — Product judgment:** plain current direct labeling plus
  authorized history is the strongest answer because it matches both the
  domain truth and the evidence pattern.
- **D41-RA006 — Product judgment:** hiding D40 origin entirely is too weak for
  review, support, audit, and source-specific remediation.
- **D41-RA007 — Product judgment:** a global persistent continuity badge is too
  strong because it makes creation history look like current status.
- **D41-RA008 — Requirement inference:** automatic conversion is forbidden
  because the source is already direct and the same UX result requires no write.
- **D41-RA009 — Requirement inference:** D41 freezes user-facing semantics and
  authority boundaries, not a bespoke component tree or transport API.
- **D41-RA010 — Product judgment:** if history cannot be permission-filtered
  and failure-isolated, the safe release is plain current-source presentation
  with no new historical viewer rather than a badge or raw audit exposure.

### Modern-product evidence and strongest countercase

- **D41-RA011 — Verified external fact:** Entra's user-role view states whether
  a current role is direct or via a group and separates eligible, active, and
  expired assignment details.
- **D41-RA012 — Verified external fact:** Entra My Access separates active
  access-oriented journeys from Request history and uses different end-user
  and administrator surfaces.
- **D41-RA013 — Verified external fact:** GitHub has separate Direct access and
  Organization access tabs for current repository access.
- **D41-RA014 — Verified external fact:** GitHub's **Mixed roles** warning is
  tied to current conflicting access and opens current-source explanation.
- **D41-RA015 — Verified external fact:** GitHub records direct-member, team-
  member, team-repository, and organization-role add/remove events separately
  in audit history.
- **D41-RA016 — Verified external fact:** Salesforce User Access Summary uses
  **Access Granted By** to explain current profile/permission-set/group sources.
- **D41-RA017 — Verified external fact:** Google uses Policy Analyzer/
  Troubleshooter for current access pathways and a distinct timestamped Change
  History/audit journey for IAM policy changes.
- **D41-RA018 — Verified external fact:** Contentful permits individual and
  team-inherited roles and exposes separate team-membership inspection.
- **D41-RA019 — Verified external fact:** Blackbaud separates current Roles
  from **View Role History**/Security audit history.
- **D41-RA020 — Product judgment:** an admin-only persistent origin tag is the
  strongest alternative, but a neutral origin field/filter in dedicated review
  provides its benefit without turning provenance into current state.

### Domain model, source ownership, and invariants

- **D41-RA021 — Repository fact:** Phase 12 grant state plus current
  `EffectiveAccess` owns **Direct grant/Granted directly**, not D40 basis.
- **D41-RA022 — Repository fact:** typed immutable D40 creation basis plus
  append-only source history owns **Added for continuity**.
- **D41-RA023 — Requirement inference:** current and historical facts use
  separate fields/types/projections and cannot overwrite one another.
- **D41-RA024 — Requirement inference:** D41 adds no current `is_continuity`,
  `is_exception`, `became_sole`, badge, or converted-source field.
- **D41-RA025 — Requirement inference:** the one capability row lists every
  current path exactly once and never duplicates the permission for history.
- **D41-RA026 — Requirement inference:** historical overlap identities prove
  creation context only and create no live FK/cascade/validity dependency.
- **D41-RA027 — Requirement inference:** current group names are display-only;
  event-time stable identity/label preserves historical meaning.
- **D41-RA028 — Requirement inference:** a terminal historical group is non-
  interactive text and a recreated group is a distinct identity.
- **D41-RA029 — Requirement inference:** operational source classification is
  direct while privileged provenance classification may be D40 continuity.
- **D41-RA030 — Repository fact:** D41 has no authority to change D37 effects,
  Phase 12 recertification, Tasks Hub, notifications, or Website policy.

### Information architecture, copy, and ordinary journeys

- **D41-RA031 — Product judgment:** administration's exact disclosure label is
  **Why this person has access**; My Access uses **Why you have access**.
- **D41-RA032 — Product judgment:** the first hierarchy is capability, then
  current source/end condition, then authorized historical provenance.
- **D41-RA033 — Product judgment:** admin current copy is **Direct grant ·
  [end condition]** and holder copy is **Granted directly to you · [end
  condition]**.
- **D41-RA034 — Product judgment:** **Added for continuity** belongs under a
  labeled History/provenance section and is not the current-row label.
- **D41-RA035 — Product judgment:** current summary uses no continuity,
  exception, redundant, backup, legacy, special, or warning terminology.
- **D41-RA036 — Requirement inference:** the disclosure accessible name
  identifies the capability/context when several rows are present.
- **D41-RA037 — Requirement inference:** current source precedes history in DOM,
  visual order, and screen-reader reading order.
- **D41-RA038 — Product judgment:** **Until removed** remains concise in the row;
  details explain that assignment end and other governing terminal conditions
  still apply.
- **D41-RA039 — Requirement inference:** source-specific actions remain normal
  **Remove direct grant**/renew flows and never say **Remove exception**.
- **D41-RA040 — Requirement inference:** success/error copy uses persistent
  receipt/status content; a toast is supplemental only.

### Badges, progressive disclosure, viewer boundary, and D42

- **D41-RA041 — Verified external fact:** USWDS says tags attract attention,
  can be mistaken for buttons, and should not be overused.
- **D41-RA042 — Verified external fact:** WAI-ARIA defines disclosure as a
  button controlling hidden/visible content with Enter/Space and
  `aria-expanded` semantics.
- **D41-RA043 — Product judgment:** no persistent continuity badge appears in
  People, My Access, current source lists, holder counts, or ordinary exports.
- **D41-RA044 — Product judgment:** an open dedicated review may show neutral
  **Added for continuity** metadata because the historical fact is directly
  relevant to the review decision.
- **D41-RA045 — Requirement inference:** historical-origin filtering, if
  implemented, is a privileged audit/review query, not a global tag filter.
- **D41-RA046 — Repository fact:** D40 already limits ordinary holders to safe
  current source/duration and membership managers to safe survivor/end-
  condition consequences without reason disclosure.
- **D41-RA047 — Requirement inference:** D41 does not widen historical group,
  reason, actor, delegation, or receipt visibility beyond D39/D40.
- **D41-RA048 — Resolved downstream:** D42 now defines the permanent viewer/
  purpose tiers for group history, reason, actors, authority, and receipt.
- **D41-RA049 — Requirement inference:** route access, current D38 possession,
  group membership management, and self-subject identity never imply history
  permission.
- **D41-RA050 — Product judgment:** history depth fails closed outside D42's
  now-recorded purpose projection while the already-authorized current-source
  explanation remains available.

### Lifecycle, temporal correctness, concurrency, and idempotency

- **D41-RA051 — Repository fact:** ending one path while another survives does
  not end `EffectiveAccess` or transfer/recreate the surviving source.
- **D41-RA052 — Requirement inference:** final group-path end creates no D41
  event or direct-source write; existing source history records the group end.
- **D41-RA053 — Requirement inference:** direct and group end at the same
  canonical instant resolve once from authoritative source folds/expected heads.
- **D41-RA054 — Requirement inference:** if direct is not current at/after that
  boundary, D41's surviving-direct presentation never appears.
- **D41-RA055 — Requirement inference:** a returning group reappears in current
  sources without changing the direct source or original D40 basis.
- **D41-RA056 — Requirement inference:** direct expiry/revoke/inert state removes
  it from current view and adds/retains only the governing terminal history.
- **D41-RA057 — Requirement inference:** a successor direct grant receives new
  provenance; regrant cannot inherit D40 origin from a terminal edge.
- **D41-RA058 — Requirement inference:** display dates are viewer-localized from
  authoritative UTC instants; localized strings never order events.
- **D41-RA059 — Requirement inference:** history reads/retries are idempotent and
  side-effect free; duplicate responses cannot create labels or state.
- **D41-RA060 — Requirement inference:** an out-of-order history response cannot
  overwrite a newer current epoch/source section.

### Database, RLS, authorization, Tenant safety, and integrity

- **D41-RA061 — Requirement inference:** D41 adds no authorization table,
  source kind, trigger, conversion function, or writer RPC.
- **D41-RA062 — Requirement inference:** current-source projections bind exact
  Tenant, Active Tenant Assignment, capability, source head/end state, epoch,
  and viewer purpose.
- **D41-RA063 — Requirement inference:** history projections bind Tenant,
  stable direct/basis/event identities, version/revision, viewer purpose, and
  retention state.
- **D41-RA064 — Requirement inference:** browser roles receive no raw basis,
  reason, actor, or audit table SELECT.
- **D41-RA065 — Requirement inference:** purpose-built views/RPCs preserve
  underlying `ENABLE`/`FORCE RLS` and both current-row/viewer constraints.
- **D41-RA066 — Requirement inference:** security-definer, owner, service-role,
  `BYPASSRLS`, repair, support, export, worker, and AI paths reproduce the same
  Tenant/purpose/field ceiling.
- **D41-RA067 — Requirement inference:** Tenant/viewer/actor/purpose are derived
  from trusted server context rather than caller-supplied history-tier input.
- **D41-RA068 — Requirement inference:** a viewer authorization downgrade
  prevents later history reads and discards/isolates earlier cached responses.
- **D41-RA069 — Requirement inference:** restrict-linked or append-only basis
  history survives group/assignment cleanup; ordinary cascade/hard delete is
  forbidden.
- **D41-RA070 — Requirement inference:** any cross-Tenant/cross-viewer history
  disclosure, current/history ownership disagreement, or raw-basis browser read
  is a release-blocking security defect.

### Failure isolation, caching, low bandwidth, observability, and auditability

- **D41-RA071 — Product judgment:** current source and optional history use
  separate loading/error boundaries so history cannot blank the capability row.
- **D41-RA072 — Requirement inference:** history failure copy says **Access
  history is temporarily unavailable. Current access is not affected.** only
  when canonical current access was independently proved.
- **D41-RA073 — Requirement inference:** if canonical current truth is unknown,
  UI does not guess direct access and privileged mutations fail closed.
- **D41-RA074 — Requirement inference:** group end/return uses the existing
  Phase 12 epoch invalidation rather than a D41-specific invalidation channel.
- **D41-RA075 — Requirement inference:** current-list reads never perform per-
  person history N+1 queries; history is separately indexed/lazy/bounded.
- **D41-RA076 — Requirement inference:** unknown provenance versions fail the
  history panel safely and never display raw JSON, internal keys, or guessed
  labels.
- **D41-RA077 — Requirement inference:** source-specific mutation timeouts
  recover through semantic receipt lookup and current source re-read, not a
  duplicate action.
- **D41-RA078 — Requirement inference:** telemetry separates current-source
  read failure, history-load failure, authorization denial, stale epoch,
  unsupported history version, and localization fallback.
- **D41-RA079 — Requirement inference:** durable business history remains
  distinct from technical logs/traces; logs contain no reason or group roster.
- **D41-RA080 — Product judgment:** D41 adds no history-availability SLO that
  can weaken authorization; current truth and privacy have zero-tolerance
  correctness thresholds.

### Accessibility, mobile, localization, and humane UX

- **D41-RA081 — Verified external fact:** WCAG requires descriptive headings/
  labels that identify topic or purpose.
- **D41-RA082 — Verified external fact:** WCAG reflow requires applicable
  content at 320 CSS pixels without loss or two-dimensional scrolling.
- **D41-RA083 — Verified external fact:** WCAG pointer targets have a 24 CSS-
  pixel floor/spacing rule; Core intentionally uses stricter 44-pixel important
  targets.
- **D41-RA084 — Verified external fact:** WCAG status messages support
  programmatic async feedback without forcing focus movement.
- **D41-RA085 — Repository fact:** Core UI must reuse Base Maia/Base UI,
  semantic tokens, shared primitives, visible focus, and reduced-motion rules.
- **D41-RA086 — Requirement inference:** disclosure works with Tab,
  Enter/Space, screen reader, visible focus, expanded state, and logical focus
  restoration on retry/navigation.
- **D41-RA087 — Requirement inference:** meaning survives forced colors and
  never depends on badge color, icon, hover, motion, or visual proximity.
- **D41-RA088 — Requirement inference:** long international/CJK/RTL/
  bidirectional names and group labels wrap without truncating the only
  distinguishing identity.
- **D41-RA089 — Requirement inference:** localized copy is sentence-level and
  dates/plurals/time zones are locale-correct; internal event order remains
  locale-independent.
- **D41-RA090 — Assumption:** production-shaped usability must test holder,
  membership manager, grant manager, reviewer, screen-reader, mobile, and weak-
  network journeys before the wording is treated as proven.

### Scalability, performance, operations, integrations, and technical debt

- **D41-RA091 — Requirement inference:** list/card current source resolution is
  set-based, indexed, and independent of audit-history volume.
- **D41-RA092 — Requirement inference:** expanded chronology is bounded and
  paginated when needed; the first useful D40/source-end context does not
  require loading unbounded unrelated audit.
- **D41-RA093 — Requirement inference:** current and audit exports have separate
  purpose-scoped schemas, snapshot metadata, and field ceilings.
- **D41-RA094 — Requirement inference:** an export never mixes current rows from
  different epochs or treats history cache as current truth.
- **D41-RA095 — Product judgment:** no new badge taxonomy, source subtype,
  design token, component library, history microservice, or conversion worker
  is justified.
- **D41-RA096 — Repository fact:** Tasks Hub may project source-owned work but
  never creates/maintains D38 access or D41 presentation state.
- **D41-RA097 — Requirement inference:** Inngest may at most reconcile an
  identifier-only non-authoritative projection; current access/history reads do
  not wait for it.
- **D41-RA098 — Requirement inference:** notifications, email, unread state,
  reminders, and access-health scoring do not consume the last-group-ended or
  D40-origin fact.
- **D41-RA099 — Requirement inference:** administrators can answer why current
  direct access exists through authorized UI without database queries, while
  ordinary staff cannot enumerate privileged history.
- **D41-RA100 — Product judgment:** operational burden is limited to the
  existing Phase 12 current resolver, D40 audit renderer, and purpose-scoped
  monitoring; no recurring manual cleanup is correctness-critical.

### Migration, rollout, testability, traceability, and proof

- **D41-RA101 — Repository fact:** fresh-build posture means no production D41
  rows exist to backfill, but broad seed/prototype roles remain unsafe evidence.
- **D41-RA102 — Requirement inference:** migration creates no D41 status/badge/
  conversion event and infers no D40 provenance from generic direct+group
  overlap.
- **D41-RA103 — Requirement inference:** readers for canonical current sources,
  D40 typed basis/history, viewer policy, and versioned safe failure ship before
  any expanded history surface.
- **D41-RA104 — Requirement inference:** mixed-version/rollback readers that do
  not understand a history version hide/fail history safely while preserving
  current Phase 12 truth and immutable evidence.
- **D41-RA105 — Requirement inference:** rollback can disable new history UI but
  never rewrites/drops D40 basis or direct/group source history.
- **D41-RA106 — Requirement inference:** positive tests cover sole direct,
  direct+one/multiple returned groups, finite/indefinite end conditions,
  rename/archive, and terminal source history.
- **D41-RA107 — Requirement inference:** negative/authorization tests cover
  wrong Tenant, wrong assignment, holder/member manager without history purpose,
  raw basis access, cross-viewer cache, and service-role/RPC parity.
- **D41-RA108 — Requirement inference:** concurrency/idempotency tests cover
  simultaneous final group/direct end, group return during open history, stale
  epoch, out-of-order responses, retry, and receipt recovery.
- **D41-RA109 — Requirement inference:** accessibility/UX tests cover disclosure
  semantics, current-first reading order, 320px/400% reflow, 44px targets,
  keyboard/focus/status, forced colors, reduced motion, RTL/CJK/long labels,
  and low bandwidth.
- **D41-RA110 — Requirement inference:** traceability maps D41 decision and
  terms through `CONTEXT.md`, ADR-0184, Phase 12, OpenSpec requirements/design/
  tasks, implementation, tests, ticket, and release evidence without
  contradictory labels or viewer claims.

### Security/privacy evidence gaps, assumptions, and the next decision

- **D41-RA111 — Product judgment:** continuity origin is governance history,
  never a staff-performance, trust, engagement, readiness, ministry-health, or
  risk signal.
- **D41-RA112 — Requirement inference:** reason, actors, former group identity,
  receipt, and history never enter URLs, notification payloads, ordinary logs,
  client analytics, AI context, or public/donor/missionary surfaces.
- **D41-RA113 — Requirement inference:** privileged history access is audited
  and follows governing retention/anonymization without rewriting event truth.
- **D41-RA114 — Assumption:** missions ministries may need support/audit
  explanation of surviving direct access, but no evidence establishes how often
  this scenario occurs.
- **D41-RA115 — Assumption:** no evidence proves holders want or benefit from
  knowing the historical group overlap; disclose no more than current D40
  permits until D42/user research.
- **D41-RA116 — Assumption:** no evidence proves reviewers will miss a neutral
  origin field in the open review; measure before adding global salience.
- **D41-RA117 — Product judgment:** a badge may be reconsidered only on the
  dedicated review surface if measured provenance-discovery failure crosses a
  predeclared threshold; it never becomes authorization state.
- **D41-RA118 — Resolved downstream:** D42 now decides which viewer purposes may
  see historical group label/identity, reason, actor/authority/delegation,
  receipt, and full chronology.
- **D41-RA119 — Product judgment:** D41 remains Reserved until D38–D40 current
  truth, history isolation/versioning, Tenant/viewer authorization, accessible
  UX, source-specific consequences, and the recorded D42 viewer policy are proved.
- **D41-RA120 — Product judgment:** Option 1 was recorded with these amendments;
  D42 then recorded one purpose-tiered history-disclosure decision without
  opening a badge or conversion implementation track.

## Falsifiable acceptance criteria

1. When a current D40-origin direct D38 source is the only path, administration
   shows **Direct grant** and the source's current end condition.
2. The same holder's My Access view shows **Granted directly to you** and the
   current end condition.
3. Neither current summary contains continuity, exception, redundant, backup,
   legacy, special, warning color, or warning-icon semantics.
4. Administration uses the exact disclosure label **Why this person has
   access**; My Access uses **Why you have access**.
5. Current source content precedes historical content in visual and DOM order.
6. Authorized history derives **Added for continuity** only from typed
   immutable D40 basis/audit, never free-text parsing or a current flag.
7. Ending the final group path creates no direct-grant mutation, conversion
   event, D41 status row, task, notification, or Inngest-owned effect.
8. The next current read after group end shows only the direct current path and
   preserves unchanged D40 creation history.
9. A returning group appears as another current source without rewriting,
   deleting, or promoting the D40 origin.
10. Group rename preserves stable event-time identity/label; authorized UI
    distinguishes an optional current label without rewriting history.
11. Terminal/deleted historical groups render as non-interactive safe text with
    no broken link or raw ID.
12. Direct expiry/revoke/assignment or delegation end removes the direct source
    from current view and retains its authorized terminal history.
13. A successor direct source receives its own provenance and no automatic D40
    inheritance.
14. Removing the final group path states that access remains through the direct
    source and its end condition.
15. Removing the sole direct path states that effective D38 access ends; when a
    group has returned, it instead states access remains through that group.
16. The source action is **Remove direct grant**, never **Remove continuity
    exception**.
17. Ordinary current search/report/export classifies the source as direct and
    excludes D40 origin/reason/actors.
18. Only a separately authorized governance/audit query may filter/export typed
    D40 creation mode.
19. A holder or membership manager without history purpose cannot read group
    snapshot, reason, actors, delegation/authority, receipt, or audit chronology.
20. Wrong-Tenant, wrong-assignment, downgraded, or expired viewer authorization
    returns no protected history through browser, cache, export, RPC, service,
    support, worker, repair, or AI path.
21. Current source remains visible and correct when history loading fails; the
    safe unavailable message and retry are accessible.
22. If current canonical state is unknown, the UI does not guess an active
    source and protected actions fail closed.
23. A slower/out-of-order history response cannot overwrite current epoch/source
    state or leak into another viewer-purpose cache.
24. Current lists use a bounded set-based read without per-person audit-history
    fetches; history is independently indexed, authorized, and bounded.
25. Equal-instant direct/final-group end has one deterministic current result,
    one final-path consequence, and no D41 conversion artifact.
26. Current and audit exports state/bind one exact snapshot epoch/instant and do
    not mix current states.
27. Disclosure/retry works by keyboard and screen reader with descriptive name,
    `aria-expanded`/Base UI state, visible focus, and logical focus behavior.
28. The complete journey reflows at 320 CSS pixels/400% without a horizontal
    matrix, retains Core 44-pixel important targets, and preserves meaning in
    forced colors and reduced motion.
29. Long/CJK/RTL/bidirectional names and labels wrap safely; localized dates/
    zones are unambiguous and never determine event order.
30. D41 terms and outcomes match D38–D40, `CONTEXT.md`, ADR-0184, Phase 12,
    OpenSpec, design/tasks/tickets/tests, and release evidence; D42 viewer fields
    remain closed until explicitly resolved.

## Monitor evidence and final ownership

Research establishes the dimensions that need monitoring: current/history
authority disagreement, cross-Tenant or wrong-viewer disclosure, forbidden
conversion writes, false effective-revoke copy, current-list history N+1,
history availability/version failure, localization fallback, accessibility,
and authorized-reviewer comprehension.

The single normative signal names, thresholds, owners, and required responses
are the 28-entry **Named monitors** table in the [D41 adversarial review](./phase-24-d41-current-direct-source-historical-provenance-adversarial-review.md).
This research file defines no competing implementation names or thresholds.
Correctness/privacy violations remain zero-tolerance release conditions; only
history availability/latency and aggregate comprehension may be monitored as
product hypotheses.

No monitor may trigger automatic grant mutation, cleanup, expiration, task,
notification, scoring, or viewer widening.

## Historical D42 recommendation — resolved 2026-08-29

Founder selected Option 1. D42 now records the four purpose projections,
field/floor matrix, separate audit-read/export capabilities, and the D43
holder-correction seam in the [D42 primary research](./phase-24-d42-purpose-tiered-continuity-provenance-primary-research.md)
and [D42 adversarial review](./phase-24-d42-purpose-tiered-continuity-provenance-adversarial-review.md).

### Historical question

Which viewer purposes may see the historical D40 group basis, reason, actors,
authority/delegation, receipt, and chronology behind **Added for continuity**?

### Option 1 — purpose-tiered historical disclosure — recommended

- **Ordinary holder/My Access:** current capability, **Granted directly to
  you**, safe end condition, and an on-demand **Added for continuity · [date]**
  summary; no historical group label, reason, actor, basis, receipt,
  other member, or protected detail.
- **Group/membership manager during source change:** exact current survivor and
  end condition needed to understand the consequence; no reason/actor history.
- **Authorized Phase 12 grant manager/reviewer:** current sources plus minimized
  continuity origin, event-time group summary, reason, creation instant, and
  source-specific governance fields needed to review/remediate the edge.
- **Separately authorized security/audit purpose:** complete typed basis,
  actors/authority/delegation, receipts, terminal chronology, and governed
  export, with access logging and retention.
- **Website operators, Tasks Hub, ordinary analytics, AI, donor/missionary/
  public surfaces:** no historical-origin field.

**Why recommended:** it matches current Entra/Contentful-style separation of
holder and administrator journeys, follows least privilege, makes **Why you
have access** useful for self-correction, gives every actor the information
needed for their action, and avoids making group history or a free-text
personnel reason universally visible.

### Option 2 — show full provenance to the holder and every manager

This maximizes transparency and support self-service, but unnecessarily exposes
former group relationships, governance reasons, and actors to people whose
current action needs only safe source/end-condition truth. It also multiplies
cache/export/privacy surfaces.

### Option 3 — security/audit history only

This minimizes disclosure, but ordinary grant managers/reviewers may be unable
to understand or safely remediate a D40-origin source without escalating to
security or reading raw audit. It weakens the user-facing explainability that
justified D40.

### Recommended exact D42 answer

**Choose Option 1 — purpose-tiered historical disclosure.** Keep current-source
truth broadly available only where already authorized, give each operational
actor the minimum context needed for the action, and reserve full reason/actor/
receipt history for a separately authorized governance/audit purpose.

## Evidence limits

- Cross-product evidence supports layered current access and historical audit;
  no vendor source proves Core's exact copy, grouping, or D42 viewer tiers.
- GitHub **Mixed roles** is evidence for highlighting a current conflict, not
  direct evidence against every historical-origin label.
- USWDS tag guidance is general usability evidence and does not govern Core's
  Base Maia design system.
- WAI/WCAG establishes mechanics and accessibility outcomes, not whether
  history starts expanded or which users may see it.
- Blackbaud and Contentful validate current/history and direct/team concepts but
  do not establish nonprofit-missions handoff frequency or privacy expectations.
- No user study proves the exact phrases **Why this person has access**, **Why
  you have access**, or **Added for continuity**. They are repo-consistent
  product judgments awaiting production-shaped comprehension testing.
- No runtime proves RLS, cache, history-version, export, accessibility,
  localization, concurrency, latency, or low-bandwidth behavior.
- Proposed monitor thresholds are product/operational judgments, not values
  supplied by the cited platforms; they require pre-release capacity baselines.

## Final research disposition

**Accept with required amendments.** Record Option 1 as the permanent D41
presentation: current D40-origin survivors are ordinary current direct sources;
authorized history retains typed continuity creation context; no current badge,
conversion, or new lifecycle exists. Require the exact current/history
ownership split, source-specific consequence copy, failure-isolated progressive
disclosure, purpose-scoped RLS/cache/export, Base Maia accessible responsive
journey, and the now-recorded D42 viewer decision before activation.

If Core cannot prove canonical-current/history separation and viewer-purpose
authorization, ship no expanded continuity history yet. Do not replace the
permanent design with a global badge, raw audit disclosure, or conversion job.
