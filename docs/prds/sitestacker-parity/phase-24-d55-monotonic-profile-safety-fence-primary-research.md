# Phase 24 D55 — Monotonic Timing-Profile Safety Fence Primary Research

**Research date:** 2026-08-29

**Founder answer:** **Option 1 — one platform safety fence; preserve Tenant
heads**

**Disposition:** **Accept with required amendments**

**Scope:** urgent withdrawal of one exact activated access-review timing-profile
revision; selected-versus-effective policy truth; fail-closed source and effect
boundaries; authorization, database/RLS, concurrency, recovery, audit, Tenant
settings UX, accessibility, rollout, monitoring, and one D56 question only

**Explicitly out of scope:** qualifying or activating a timing pair; ordinary
profile retirement; selecting a replacement for a Tenant; changing D43 request,
grant, access, task, or D44 responsibility truth; incident communications;
assigning the platform emergency actor/capability; automatic safety detection;
runtime names, schema, migration, OpenSpec, feature flags, jobs, telemetry, or UI
implementation now

## Executive conclusion

Option 1 is the strongest permanent direction. A platform safety boundary must
be able to narrow effective behavior immediately without pretending that every
Tenant administrator selected Off. The sound model is the intersection of two
independently owned facts:

1. the Tenant-selected policy head remains the authoritative record of the
   Tenant's deliberate choice; and
2. one platform-owned, exact-profile, terminal safety-withdrawal fact limits
   whether that selection may have any new reminder effect.

This separation resembles mature policy-guardrail systems. AWS Organizations
service control policies limit effective permissions without granting or
rewriting account IAM policies. Kubernetes separates user-authored desired
`spec` from system-observed `status`. Azure App Configuration documents an
instant kill-switch pattern. Those are useful structural comparisons, not
authority to copy their fields, propagation guarantees, roles, UI, or rollback
semantics.

The corrected Core model is deliberately smaller and stricter:

- one successful withdrawal creates a permanent fact for one exact environment
  and activated profile identity/revision;
- the same revision can never be offered, selected, admitted, or re-enabled
  again; any safe return is a newly qualified and activated successor;
- the fence performs no Tenant enumeration or mass policy write;
- every D43 admission, D49 seal, local release, and external effect-admission
  transaction checks the authoritative fence at the primary product-database
  serialization boundary;
- missing, stale, unsupported, or indeterminate safety proof fails closed to no
  reminder while the valid D43 request itself may still be created;
- already committed source and effect history remains truthful; preventable
  descendants stop, but an external attempt that may have begun is reconciled
  and never recalled or blindly retried;
- the Tenant settings page presents the Selected access-review timing-policy
  head and Effective Off as two different facts, then offers an ordinary,
  unselected new-setting choice;
  doing nothing remains safe; and
- D55 introduces no generic policy engine, mass fanout, incident workflow,
  reversible Boolean, or third-party flag dependency.

A conventional cached feature flag is not sufficient. AWS and Azure explicitly
document cached configuration and continued use of cached values after refresh
failure. That availability behavior can delay an emergency change. A release
flag may stop more work or hide UI, but it cannot be the D55 business fence or
authorize an effect when authoritative fence state is unavailable.

## Exact corrected D55 decision

1. D55 adopts one platform-owned **Access-review timing-profile safety
   withdrawal** for one exact activated access-review timing-profile identity/
   revision in one exact product environment.
2. The withdrawal is a subtract-only platform guardrail. It grants no
   capability, selects no profile, creates no request, and changes no access.
3. The Tenant's immutable policy versions and current selected head remain
   exactly as authored. Core never writes an Off or replacement Tenant head merely
   because the platform withdraws a profile.
4. Effective cadence is derived as the intersection of the current Tenant head,
   activated-profile compatibility, and the absence of an exact safety
   withdrawal, plus the already governing D43–D54 source/effect gates.
5. A current head selecting a withdrawn revision has the truthful state
   **selected: that preserved revision; effective: Off because unavailable for
   safety**. Selected and effective are never collapsed into one stored field.
6. Absence/ordinary Off, an activated profile, an ordinarily retired profile,
   a safety-withdrawn profile, and an unknown/unsupported revision are distinct
   states. Unknown or indeterminate is not mislabeled as safety withdrawal.
7. Ordinary retirement still blocks new selection/reselection only. Safety
   withdrawal dominates retirement and also blocks current-head D43 admission
   and every not-yet-irreversible descendant.
8. One successful withdrawal is terminal and monotonic for the exact revision.
   No API, migration, restore, rollback, support action, administrator, worker,
   feature flag, or incident closure may delete, clear, toggle, expire, or
   supersede that fact into allowing the same revision again.
9. A later safe behavior uses a new code-owned profile identity/revision and the
   applicable D47/D53 qualification and complete activation gates. It never
   clears or reuses the withdrawn revision.
10. The withdrawal transaction records exact profile/environment scope,
    immutable committed primary-database time, a bounded code-owned reason
    class, a privacy-minimized durable rationale/evidence reference, command
    identity, and trusted actor/system-purpose attribution.
11. Tenant, browser, API caller, import, support tool, provider, worker,
    experiment, cache, or feature-flag payload cannot author the scope, actor,
    status, time, or reason class.
12. The actor authority and emergency approval shape must be settled by D56 and
    proved before the first profile activates. D55 does not silently grant this
    power to Tenant Owners, Administrators, `permissions.manage_grants`, support,
    service role, or ordinary deployment automation.
13. The first valid command wins. Exact replay or response-loss recovery returns
    the same withdrawal receipt; changed immutable input under the same command
    identity conflicts and changes nothing.
14. Additional investigation, review, incident, and remediation evidence is
    appended separately. It never edits the original withdrawal fact or turns
    an external ticketing system into source truth.
15. Fence publication and every affected source/effect admission share one
    exact profile-revision serialization scope in the primary product database.
    A database constraint alone on an optional child row is not enough to order
    the absent-row race.
16. The implementation may use a profile-row lock, scoped transactional
    advisory lock, serializable command, or an equivalently proved single
    mutation boundary. The design must prove one committed order, not prescribe
    one mechanism in this PRD.
17. Fence-first denies the competing admission. Admission-first preserves that
    already committed boundary and subjects all later boundaries to the fence.
    An indeterminate order retries the entire command and never guesses Allow.
18. Publication is O(1) in logical product work for the exact profile revision:
    one source commit and bounded audit/outbox evidence, independent of Tenant,
    request, recipient, task, item, or provider volume.
19. Publication performs no synchronous Tenant census, row-by-row cancellation,
    policy rewrite, request mutation, task update, notification creation,
    provider call, or cache purge as correctness work.
20. D43 creation after withdrawal may still create the valid access-review
    request. It records no reminder admission from the preserved selected head;
    it cannot fail the core request merely because optional courtesy attention
    is unavailable.
21. The D43 source transaction must use fresh authoritative profile/fence proof.
    It cannot admit from a browser value, read replica, process cache, edge
    cache, feature flag, earlier page load, worker payload, or decoded Tenant
    head alone.
22. A pre-withdrawal D43 episode keeps its immutable pinned profile/source
    history. The fence never rewrites its profile tuple, eligibility instant,
    useful interval, policy head, or request creation evidence.
23. Any waiting or indeterminate occurrence with no committed D49 result becomes
    permanently non-releasable when it next crosses the fence-aware product
    boundary. Re-enable, retry, restore, or a successor profile cannot revive it.
24. A D49 cohort sealed before the fence remains immutable historical evidence,
    but each still-unreleased descendant rechecks the exact profile withdrawal
    and is denied.
25. A local reminder item released before the fence remains truthful history.
    The withdrawal immediately ends its active/unread contribution through the
    registered source-end contract; whether a minimized authorized Recent
    projection remains visible depends on the exact incident/privacy containment
    rule, never a blanket promise.
26. Withdrawal never marks a reminder read, changes an item's immutable time or
    content, rewrites an attention group, or changes the initial D44 item. It
    ends applicability rather than fabricating engagement.
27. A prepared but definitely unsubmitted external effect is suppressed. A
    provider-submission attempt admitted before the fence remains
    **Submission may have begun** with its independent outcome; its one already
    admitted call may finish/reconcile, but no later attempt, retry, resend,
    replacement, or recall claim is allowed.
28. The fence changes no D43 request state, access source, EffectiveAccess,
    holder decision, D44 coordinator responsibility, Tasks Hub task, initial
    attention, or Tenant authorization.
29. Async workers, outboxes, Realtime, caches, search indexes, projections, and
    providers may accelerate cleanup or presentation convergence only. Every
    authoritative release boundary independently enforces the fence.
30. A third-party or code-deployment feature flag may narrow availability
    before or in addition to D55, but never becomes withdrawal truth, permits a
    release, clears the fence, or supplies historical audit evidence.
31. Any safety-state lookup failure, unknown contract revision, inconsistent
    profile/fence evidence, stale replica, or unavailable proof produces no new
    reminder admission/effect. It does not silently convert the Tenant head to
    Off or block the underlying D43 request when that request can otherwise
    commit safely.
32. Raw withdrawal rows and internal incident evidence are platform-operational
    data, not Tenant-editable CRM records. Tenant-facing reads receive only a
    role-safe derived selected/effective/unavailability projection.
33. Future persistence must enforce exact environment/profile-revision
    uniqueness, non-null immutable scope, compatible profile reference,
    code-owned reason values, restrictive deletion, and trusted database time.
34. Direct browser writes are revoked. The platform command uses a dedicated,
    least-privilege application boundary; database owner, service-role,
    maintenance, repair, and support paths cannot bypass equivalent domain
    authorization and invariant checks.
35. Any Tenant-scoped view or API joining a selected head to profile/fence truth
    proves same-Tenant head visibility and exposes no other Tenant's selection,
    no affected-Tenant count, and no internal actor, evidence, incident, or
    security detail.
36. RLS-protected Tenant projections use least grants and both old-row `USING`
    and proposed-row `WITH CHECK` protection where mutation exists. Raw platform
    fence access remains outside ordinary Tenant roles and is independently
    controlled.
37. Referential constraints, errors, unique conflicts, timing, counts, cache
    keys, logs, metrics, exports, support screens, and Realtime events must not
    become cross-Tenant/profile enumeration channels.
38. Durable business audit and technical telemetry remain separate. The audit
    proves command, exact scope, actor/system purpose, reason class, commit,
    outcome, and later effect disposition; telemetry uses opaque identifiers and
    bounded result codes without request/person/ministry detail.
39. The Tenant policy form belongs only in the future D44/D47-governed Base Maia
    **People & access → Access requests → Settings** route and remains limited to
    an independently authorized same-Tenant policy manager.
40. When the selected head references a withdrawn revision, the page presents a
    compact read-only **Current setting** summary before the editable choices:
    **Selected: [profile label]**, **Status: Unavailable for safety**,
    **Effective: Off**.
41. Concise adjacent explanation says: **Courtesy reminders are off. Existing
    access requests, tasks, and access are unchanged. This setting will not
    restart.** A secondary **Choose a new setting** action opens the ordinary
    choices. Localization may adjust grammar without weakening those facts.
42. Copy does not say **paused**, **temporarily unavailable**, **under review**,
    **will return**, or give a restoration date unless a separate truthful
    source exists. The exact withdrawn revision is terminal.
43. The withdrawn profile is not rendered as a disabled radio among available
    choices. The read-only summary preserves its historical selection; the
    editable fieldset contains only Off and currently selectable activated
    profiles.
44. No replacement option is preselected when the selected head is withdrawn.
    Doing nothing safely preserves the head/effective-Off result. To replace it,
    the user deliberately selects exactly one option and uses the ordinary Save
    action.
45. Save remains disabled or absent until the user changes the draft. Choosing
    Off or another profile and saving creates an ordinary Tenant-attributed
    successor head only after fresh expected-head, profile, withdrawal,
    authorization, and same-Tenant validation.
46. A fence appearing while the form is open invalidates a draft that selects
    the withdrawn revision. Save fails safely, retains understandable draft
    context where safe, refreshes current truth, and explains that the option is
    no longer available; it never substitutes Off automatically.
47. Concurrent Tenant save uses expected-head compare-and-set. A conflicting
    administrator change is shown as a conflict requiring refresh/review, not
    silently overwritten by the safety UI.
48. If no alternative profile remains, the replacement fieldset contains only
    Off. It does not show an empty picker, dead card, beta promise, or support-
    contact requirement.
49. The safety state uses calm neutral information styling, visible text, and
    semantic status—not red emergency styling, color alone, a toast, modal,
    countdown, forced acknowledgement, focus theft, or repeated banner.
50. The page uses the existing `base-maia` Base UI/Field/radio and semantic
    token language. D55 selects no new component library or custom policy editor.
51. Visible labels, programmatic names/descriptions, heading/fieldset order,
    keyboard focus, errors, and status announcements convey selected, effective,
    unavailable, and replacement as distinct facts.
52. The flow remains usable at 320 CSS pixels/400-percent zoom, keyboard and
    touch, forced colors, reduced motion, long translations, CJK, RTL/bidi,
    mobile, and low bandwidth. It requires no icon, image, animation, hover,
    realtime event, or external incident page to understand or act.
53. No automatic per-Tenant task, notification, inbox item, email, chat message,
    or policy receipt fanout is created by D55. Material incident communication,
    if required, is a separately authorized communication decision and never
    source or acknowledgement truth.
54. Tenant staff are not forced to acknowledge the fence. Lack of a replacement
    save does not imply awareness, approval, neglect, or performance failure.
55. Tenant-facing history may state that a platform safety guardrail made the
    saved profile ineffective, but does not expose internal evidence, reporter,
    actor, affected-Tenant totals, or other organizations.
56. Profile/fence evaluation is constant per source/effect mutation and uses
    indexed exact identity. No Tenant scan, request scan, notification scan,
    policy materialization, or per-recipient query is required for correctness.
57. Activation must establish measured production-shaped latency, contention,
    and recovery budgets. D55 invents no universal SLO, affected-Tenant limit,
    or propagation-time claim.
58. Readers and all irreversible writers become fence-aware before any timing
    profile is selectable. A database/API compatibility gate prevents an old
    writer from bypassing a fence that newer code can publish.
59. Rollout order is compatible persistence/decoders, deny-first evaluation and
    mutation boundaries, shadow proof, emergency command/operations proof,
    then profile selection. There is no historical fence backfill because no
    profile currently exists.
60. After a fence commits, rollback is roll-forward only. Code/UI rollback may
    hide or globally narrow the reminder feature but cannot delete the fence,
    admit the withdrawn revision, or reuse its identity.
61. Backup/PITR/region recovery must not resurrect the withdrawn profile. A
    recovered environment remains globally unable to admit reminder effects
    until the latest monotonic safety state is reconciled from protected durable
    evidence and proved current.
62. Disaster-recovery evidence must avoid dual writable authority: one product
    control plane owns the fence, while backup/audit replicas are recovery
    evidence and cannot independently clear or create product state.
63. Mixed-version, restore, failover, stale-cache, source-race, effect-race,
    response-loss, authorization, privacy, accessibility, and load tests are
    release blockers, not post-release aspirations.
64. D55 is documentation only. It creates no profile, fence row, reason enum,
    role, capability, schema, migration, RPC, OpenSpec requirement, setting,
    message, task, flag, job, metric, incident workflow, or UI now.
65. The eventual activation package must trace the founder decision through the
    glossary, ADRs, Phase 12/17/6, OpenSpec, design/tasks/tickets, schema/RLS,
    implementation, tests, runbook, release evidence, and named monitors without
    contradictory terms or reversible behavior.

## Research method and evidence labels

- **Verified repository fact:** directly observed in the current Core checkout
  or its governing ADR/OpenSpec/PRD contracts.
- **Verified external fact:** directly stated by a current official first-party
  standard, product document, or public design system.
- **Requirement inference:** necessary to make Option 1 obey the repository and
  verified external facts.
- **Product judgment:** the smallest safe Core-specific choice among viable
  alternatives.
- **Assumption:** plausible for nonprofit mission ministries but not established
  without representative research.
- **Unresolved unknown:** a later founder, research, incident-governance, or
  release gate must settle it; this document does not guess.

External systems are comparators only. Core imports no vendor flag service,
control plane, policy syntax, approval count, actor role, propagation time,
retention, incident severity, component, color, copy, or automatic rollback.

## Verified repository facts

| Repository source                                                                                                                                                         | Verified current fact                                                                                                                                         | D55 consequence                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [Platform Principles](../../../openspec/specs/platform-principles/spec.md)                                                                                                | Tenant and permission safety outrank convenience; operational truth, clear unavailable states, accessibility, and cohesive product behavior are mandatory.    | Immediate containment cannot falsify Tenant intent or create a confusing half-present setting.             |
| [Platform Boundaries](../../../openspec/specs/platform-boundaries/spec.md)                                                                                                | Permission-sensitive operational truth remains server-side in CRM/Mission Control; hidden or unavailable capability must be intentional.                      | Fence evaluation belongs in Phase 12/server mutation boundaries, with only a safe Tenant projection in UI. |
| [ADR-0026](../../adr/0026-contract-bounded-delivery-plans.md)                                                                                                             | D47–D55 keep source timing, safety withdrawal, plan compilation, channels, cancellation, and presentation separate.                                           | D55 narrows source/effects and cannot become a Delivery Plan toggle or channel flag.                       |
| [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)                                                                                          | Notification items are projections with independent engagement and source-end rules.                                                                          | Withdrawal ends applicability, never fabricates read state or deletes business history.                    |
| [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)                                                                                        | The D43 task projects source work and is not notification/reminder state.                                                                                     | D55 cannot create, close, date, or reassign tasks.                                                         |
| [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)                                                                                             | Phase 12 owns EffectiveAccess, D43 requests, D44 responsibility, and the D47–D55 reminder source/safety chain.                                                | Fence changes optional courtesy attention only, never grants or removes access.                            |
| [D51 research](./phase-24-d51-immediate-irreversible-narrowing-primary-research.md)                                                                                       | Tenant Off uses an O(1) monotonic cancellation epoch checked at every irreversible boundary; re-enable never resurrects old work.                             | D55 follows the narrowing principle but needs one profile-global terminal fact, not N Tenant epoch writes. |
| [D53 research](./phase-24-d53-evidence-admitted-complete-timing-profile-primary-research.md)                                                                              | Profiles are immutable code-owned revisions; retirement preserves current-head admission; safety withdrawal is distinct and must be proved before activation. | The exact profile revision is the fence scope; any return is a successor.                                  |
| [D54 research](./phase-24-d54-distinct-grouped-reminder-presentation-primary-research.md)                                                                                 | The future reminder is one distinct grouped local projection with source-owned applicability and no task mutation.                                            | A released child ends active/unread contribution through its own contract while history stays truthful.    |
| [Identity and access OpenSpec](../../../openspec/specs/identity-and-access/spec.md)                                                                                       | Tenant, Party, assignment, role, capability, application authorization, RLS, and audit attribution are independent trusted boundaries.                        | Tenant policy managers cannot inherit platform-withdrawal power, and derived reads remain Tenant-scoped.   |
| [Workflow orchestration OpenSpec](../../../openspec/specs/workflow-orchestration/spec.md)                                                                                 | Product records/claims own truth; Inngest carries identifiers and re-reads product state.                                                                     | A worker event/run/cancel state cannot create, clear, or outrank the fence.                                |
| [Frontend rules](../../ai/rules/frontend.md), [`packages/ui` instructions](../../../packages/ui/AGENTS.md), and [`components.json`](../../../packages/ui/components.json) | Core uses Base UI, `base-maia`, semantic Zinc-oriented tokens, shared components, and product-shaped accessibility tests.                                     | The later UI is a compact Core settings state, not a copied vendor console.                                |
| [Current bell demo](../../../packages/ui/components/shadcn-studio/blocks/dropdown-notification.tsx)                                                                       | No D43–D55 request/reminder/profile/fence runtime or settings UI exists; the staff bell remains demo presentation.                                            | D55 is documentary and has no legitimate migration/backfill or runtime-key change now.                     |

## Current official external evidence

| Official primary source                                                                                                                                                                                                            | Verified fact                                                                                                                                                                                  | What it supports                                                                                                                          | What it does not decide for Core                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [AWS Organizations — Service control policies](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html)                                                                                          | An SCP is a guardrail that does not grant permission; effective permission is the intersection of underlying policies and applicable controls.                                                 | Preserve Tenant-selected policy while a separate platform guardrail narrows effective behavior.                                           | AWS policy syntax, hierarchy, exceptions, or identity model.                                         |
| [AWS IAM — Policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)                                                                                                     | Applicable boundaries intersect with grants and an explicit deny overrides allows.                                                                                                             | A terminal safety withdrawal must dominate a previously allowed selection.                                                                | Modeling reminders as IAM permissions or exposing an editable Deny policy.                           |
| [Kubernetes — Objects, spec and status](https://kubernetes.io/docs/concepts/overview/working-with-objects/)                                                                                                                        | Object `spec` records desired state while system-owned `status` reports current state.                                                                                                         | Selected and effective are separate facts with different owners.                                                                          | Kubernetes reconciliation, YAML, eventual consistency, or API shape.                                 |
| [GitHub Enterprise Cloud — Enforcing policies for projects](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-projects-in-your-enterprise) | Enterprise owners can enforce a policy across organizations or allow organization owners to administer it, and can review organization configurations before changing the higher-level policy. | A mature SaaS can distinguish a higher-level guardrail from organization-owned configuration and limit global action to higher authority. | Proof that GitHub preserves each lower setting, or Core's actor, scope, UI, and emergency semantics. |
| [Contentful — Organization roles](https://www.contentful.com/help/roles/organization-roles/)                                                                                                                                       | Organization roles separately govern access to organization settings, spaces, teams, audit logs, and access tools.                                                                             | CMS administration likewise scopes organization-wide settings to explicit administrative roles rather than every member.                  | Contentful roles as Core capabilities or any profile-withdrawal behavior.                            |
| [Azure App Configuration — Feature management](https://learn.microsoft.com/en-us/azure/azure-app-configuration/concept-feature-management)                                                                                         | A switch can act as an instant kill switch without redeployment.                                                                                                                               | Pre-provisioned emergency narrowing is a mature operational pattern.                                                                      | A feature flag as Core source truth or Azure's claimed propagation time.                             |
| [Azure App Configuration — .NET provider refresh](https://learn.microsoft.com/en-us/azure/azure-app-configuration/reference-dotnet-provider)                                                                                       | Refresh is interval-based and a refresh failure continues using cached configuration.                                                                                                          | Demonstrates why cached flag/config state cannot authorize a D55 effect.                                                                  | Requiring Azure or its refresh interval.                                                             |
| [AWS AppConfig Agent](https://docs.aws.amazon.com/appconfig/latest/userguide/appconfig-agent.html)                                                                                                                                 | The recommended agent asynchronously polls and serves a local cache so applications survive network issues.                                                                                    | Caches are good availability aids but can be stale at an emergency boundary.                                                              | AWS AppConfig adoption or cache semantics for product authorization.                                 |
| [AWS AppConfig — Reverting a configuration](https://docs.aws.amazon.com/appconfig/latest/userguide/appconfig-deploying-reverting.html)                                                                                             | In-progress deployments can roll back and a recently completed deployment can revert; after its documented window a new deployment is required.                                                | Emergency configuration tools retain distinct deployment versions and explicit recovery operations.                                       | Reverting a terminal Core safety fact, the 72-hour value, or history rewriting.                      |
| [AWS Well-Architected — Emergency access process](https://docs.aws.amazon.com/wellarchitected/latest/framework/sec_permissions_emergency_process.html)                                                                             | Emergency access should have documented preconditions, pre-created least-privilege resources, authorized initiators/appropriate approvals, detailed logs/alerts, and periodic tests.           | D56 and activation need a ready, narrow, audited, rehearsed command path.                                                                 | Exact Core approver count, role, time threshold, or tooling.                                         |
| [AWS CloudTrail — Record contents](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-event-reference-record-contents.html)                                                                                     | Management records identify action, identity, time, request, response, and may receive delayed addenda.                                                                                        | Durable audit needs attributable command and result evidence distinct from delivery order assumptions.                                    | CloudTrail as Core's audit store or timestamps as database serialization.                            |
| [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)                                                                                                                   | Deny by default, least privilege, every-request validation, safe failure, logging, and authorization tests are recommended.                                                                    | Each D43/effect boundary rechecks current authoritative safety and permission state.                                                      | Core's exact capability or policy function.                                                          |
| [PostgreSQL 18 — Row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)                                                                                                                                       | Enabled RLS with no applicable policy is default-deny; owners/BYPASSRLS bypass it; referential checks bypass RLS; cross-table policy reads can race.                                           | Least grants, privileged-path parity, constraint-leak tests, and one transactional fence boundary are required.                           | RLS as sole authorization or a schema name.                                                          |
| [PostgreSQL 18 — CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html)                                                                                                                                     | `USING` checks visible old rows and `WITH CHECK` checks proposed inserted/updated rows; restrictive policies narrow permissive policies.                                                       | Tenant projection mutations must prevent allowed-row-to-forbidden-row transformation.                                                     | Making raw platform fences Tenant-writable.                                                          |
| [PostgreSQL 18 — Transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)                                                                                                                              | Serializable conflicts require whole-transaction retry to obtain serializable behavior.                                                                                                        | Fence-versus-admission races need one order and safe full-command retry.                                                                  | A universal mandate to use Serializable rather than an equally proved lock boundary.                 |
| [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)                                                                                                                             | Grants and RLS are separate; service role bypasses RLS and must remain server-side; exposed objects require explicit testing.                                                                  | Browser revocation, least grants, and service/repair parity are release gates.                                                            | Treating a service key as trusted business authority.                                                |
| [GOV.UK — Radios](https://design-system.service.gov.uk/components/radios/)                                                                                                                                                         | Radios represent one choice, should be fieldset/legend grouped, and generally should not be preselected when a user must make a new choice.                                                    | A withdrawn selection belongs in read-only history; the replacement question starts unselected.                                           | GOV.UK styling or ignoring the truthful current setting.                                             |
| [GOV.UK — Notification banner](https://design-system.service.gov.uk/components/notification-banner/)                                                                                                                               | Banners should be used sparingly; directly relevant page information belongs in main content; one neutral region is preferred over multiple banners.                                           | Put unavailable-state explanation beside Current setting, not in repeated alarm UI.                                                       | A global Tenant notification or exact color/component.                                               |
| [GOV.UK — Service unavailable pages](https://design-system.service.gov.uk/patterns/service-unavailable-pages/)                                                                                                                     | An unavailable state should say what happened to in-progress information and what the user can do next.                                                                                        | State that existing requests/access are unchanged and name the replacement action.                                                        | Promise that the exact profile will return or use a full-page outage pattern.                        |
| [USWDS — Alert](https://designsystem.digital.gov/components/alert/)                                                                                                                                                                | System status messages need an appropriate type and must be understandable without color/icon alone.                                                                                           | Visible text and semantic status are mandatory; calm informational styling is proportionate.                                              | An emergency visual treatment for Tenant users.                                                      |
| [W3C WCAG 2.2 — Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)                                                                                                                   | Controls need clear labels/instructions, while excessive instruction can itself harm comprehension.                                                                                            | Keep selected/effective explanation concise and label each replacement choice.                                                            | Exact copy length or component implementation.                                                       |
| [W3C WCAG 2.2 — Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)                                                                                                                                      | Dynamic results/status must be programmatically determinable without unnecessary focus interruption; overly chatty live regions are harmful.                                                   | Save/conflict/status feedback must be persistent, polite, and non-focus-stealing.                                                         | Creating an unsolicited announcement on page load.                                                   |
| [ICO — Data minimisation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/data-minimisation/)                                             | Personal data should be adequate, relevant, limited to necessity, periodically reviewed, and not kept merely in case it becomes useful.                                                        | Fence audit, logs, Tenant projection, support, and incident references must minimize people/ministry data.                                | A universal retention period or legal conclusion for every Tenant.                                   |

### Comparable-system synthesis and limits

- **IAM:** AWS's policy intersection is the closest structural comparator. It
  validates preserving a lower-level authored policy while a higher guardrail
  narrows the effective result. Core's profile fence is not an IAM permission
  policy and does not inherit AWS exceptions.
- **SaaS feature management:** Azure and AWS AppConfig validate a ready kill-
  switch capability and show that configuration is versioned and observable.
  Their cache-first availability model is specifically too weak for D55's final
  effect-admission decision.
- **Declarative platforms:** Kubernetes validates separating desired and
  observed/effective state. Core does not accept eventual reconciliation as
  enough for an unsafe reminder release.
- **CRM/CMS operations:** GitHub enterprise policy and Contentful organization-
  level controls demonstrate higher-level policy and organization-scoped admin
  boundaries, but neither product supplies a proven access-review timing-
  withdrawal workflow for mission ministries. They are not evidence for
  numbers, actors, or Tenant communications.
- **Nonprofit products:** no current official nonprofit CRM source located in
  this research establishes that automatically rewriting every customer's
  reminder setting is safer or more understandable than preserving selected
  and effective state. That absence is an unresolved evidence limit, not proof
  of a ministry workflow.

## Current behavior, intended behavior, and best permanent path

| Layer                    | Verified current behavior                                                   | Intended post-activation behavior                                                                      | Best permanent path                                                                                                |
| ------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Reminder/profile runtime | No D43–D55 runtime, profile, policy, key, fence, or setting exists.         | A profile can be selected only after the full activation package.                                      | Keep D55 documentary until activation admits every artifact together.                                              |
| Tenant policy            | No access-review cadence head exists.                                       | An immutable Tenant head records Off or one activated profile revision.                                | Preserve the head as Tenant-authored intent; use expected-head successors for later Tenant edits.                  |
| Safety control           | No timing profile exists to withdraw.                                       | One exact terminal platform fact prevents all later unsafe admissions/effects.                         | Use a product-owned exact-revision fence at every authoritative mutation, not a cached flag or mass Tenant update. |
| Requests/work            | D43–D54 are specifications only; current access/task behavior is unchanged. | Valid D43 requests continue even when courtesy reminders are unavailable.                              | Treat reminders as optional descendants; never fail or mutate the request/task/access domains.                     |
| Settings UX              | No cadence setting appears.                                                 | Authorized Tenant staff see saved and effective state separately when a selected profile is withdrawn. | Read-only Current setting plus one unselected replacement fieldset and explicit Save.                              |
| Other users              | Donors, missionaries, public users, and ordinary staff have no D55 surface. | New unsafe reminders simply do not appear/send.                                                        | Do not create alarm, acknowledgement, task, or per-Tenant notification fanout.                                     |

## Problem validity and strongest alternative

The root problem is not “how to turn a flag off.” It is how to contain a
newly discovered material harm across every current and future effect while
preserving the authorship and historical truth of Tenant policy. Ordinary
retirement is intentionally too weak because existing heads continue to admit
new requests. Tenant-by-Tenant Off writes are stronger but solve containment at
the wrong ownership layer.

The strongest alternative is **mass-publish Off successor heads**. It has one
surface-level advantage: selected and effective immediately agree, so the
settings screen appears ordinary. It fails under adversarial review because it:

- impersonates a Tenant choice with a platform actor or invents a synthetic
  Tenant actor;
- requires O(number of affected Tenants) mutations and partial-batch repair;
- races real Tenant administrators saving a profile at the same time;
- still needs a global fail-closed fence while the fanout is incomplete;
- creates duplicate receipts, communications, and rollback ambiguity; and
- makes a later correction look like restoring Tenant policy when the platform
  authored the intermediate state.

No-build is not viable once an activated profile causes material harm: leaving
current heads effective violates Core's safety priority. A deployment-only flag
is also insufficient because old processes, stale caches, direct database paths,
or rollback could bypass it. The minimal permanent answer is therefore Option 1
with the exact amendments above.

## UX/UI contract and complete user journeys

### Authorized Tenant policy manager opens settings after withdrawal

1. The ordinary settings route loads the current Tenant head and authoritative
   effective result server-side.
2. A compact Current setting summary appears before the editor:
   - **Selected:** After _[profile interval]_
   - **Status:** Unavailable for safety
   - **Effective:** Off

3. Adjacent body text explains the exact consequence and non-consequence:
   **Asym stopped this reminder timing for safety. No new access review requests
   will use it. Existing requests, tasks, and access are unchanged. This setting
   will not restart.**
4. A **Choose a new setting** fieldset lists Off and any independently
   activated, currently selectable profiles. Nothing is preselected because the
   person is making a new choice, not confirming a system-authored default.
5. The user may leave without acting; the system remains safely effective Off
   and the selected head remains historically truthful.
6. Selecting one choice enables Save. Save reauthorizes, rechecks expected head
   and the latest fence state, and publishes an ordinary Tenant successor.
7. Success appears as durable page state and a polite programmatic status. A
   lost response reloads the authoritative head/receipt rather than guessing.

### Fence appears while an administrator is editing

- The unsaved local draft grants no authority.
- If the draft chose the now-withdrawn revision, Save rejects it with an inline
  text error, reloads truthful Current setting, and retains only safe draft
  context. It never switches the draft or saves Off automatically.
- If another administrator saved a different head, expected-head conflict takes
  precedence and the user reviews the newer selection/effective result.
- If both changes race, the product database commits one defensible order; the
  fence still dominates any selected withdrawn revision.

### Tenant has no alternative profile

- Current setting still shows selected versus effective state.
- The replacement fieldset contains one normal **Off** option.
- The page does not show an empty dropdown, disabled copy of the withdrawn
  choice, “coming soon,” a retry button, or a mandatory support handoff.
- The user can deliberately save Off or leave the preserved selection safely
  ineffective.

### Staff coordinator, requester, holder, donor, missionary, and public user

- No D55 warning, banner, task, notification, badge, email, or acknowledgement
  appears solely because the platform fence was published.
- Unreleased reminder attention does not appear. A previously released reminder
  no longer contributes active/unread attention after source-end convergence.
- The access request, source-backed task, decision path, and EffectiveAccess
  remain exactly as their owners define them.

### Platform operator

- D55 requires a pre-provisioned, narrow, tested command and safe status view,
  not a general database console or feature-flag dashboard.
- The operator supplies the exact profile revision and bounded reason/evidence
  required by the future D56 authority contract, reviews an irreversible
  consequence summary, and receives one durable receipt.
- The command never previews or enumerates affected Tenants or requests as a
  prerequisite to containment. Aggregate impact analysis is a separately
  authorized, privacy-minimized read after the fence.

### Accessibility and low-noise requirements

- The read-only summary uses semantic terms/descriptions rather than disabled
  form controls to represent historical selection.
- The replacement choices use native/Base UI single-choice semantics with a
  visible legend and labels; no selection-on-input or autosave occurs.
- Status is not conveyed by color, icon, order, or strike-through alone.
- An unavailable state present on initial page load is ordinary content, not an
  assertive live-region event. Save/conflict results use the minimum polite
  programmatic feedback needed without moving focus unnecessarily.
- At zoom/mobile widths, the three current-state facts stack in one reading
  order, followed by explanation and choices. Copy tolerates long profile labels,
  translations, RTL/CJK, forced colors, and text spacing.
- The flow remains complete with JavaScript-delayed enhancements, Realtime,
  remote images, animations, and an incident/status site unavailable.

## Domain model, ownership, and invariants

### Canonical D55 terms

**Selected access-review timing-policy head** is the Tenant-authored current
policy head already defined by D53. It records intent and attribution; it is not
a guarantee that the selected profile remains effective.

**Access-review timing-profile safety withdrawal** is the platform-owned,
terminal, exact-environment/exact-profile-revision fact that permanently
prevents that revision from authorizing a new reminder admission or effect.

**Effective access-review cadence disposition** is the derived result of the
current Tenant selection intersected with profile activation/compatibility,
ordinary retirement semantics, terminal safety withdrawal, and current
D43–D54 gates. It is a read/evaluation result, never a second writable Tenant
policy head.

**Safety-fenced source disposition** is the source-owned no-reminder result for
a valid D43 episode or descendant denied by the exact profile withdrawal. It is
not request failure, Off selection, task completion, or evidence that a person
saw the safety state.

_Avoid_: global kill-switch Boolean; paused profile; auto-Off Tenant; disabled
radio as history; platform-authored Tenant choice; cached effective setting;
incident ticket as source; withdrawn profile reactivation

### Ownership matrix

| Fact or effect                                  | Authoritative owner                                | Derived/consumer                                    | Must never own or rewrite it                          |
| ----------------------------------------------- | -------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| Activated profile identity/revision and decoder | D53 activation registry                            | Phase 12 policy validation, UI labels               | Tenant, research file at runtime, flag provider       |
| Tenant-selected head and versions               | Phase 12 Tenant policy command                     | Effective evaluator, authorized settings UI         | Safety operator, worker, provider, UI draft           |
| Terminal safety withdrawal                      | Platform product control boundary                  | Effective evaluator and all source/effect mutations | Tenant head, cache, feature flag, incident system     |
| Effective timing result                         | Phase 12 deterministic evaluator                   | Settings projection and D43 admission               | Writable row, browser, analytics projection           |
| D43 request and reminder admission              | Phase 12 request source                            | Tasks/notifications/plans                           | Fence row, task, notification, provider               |
| D49 sealed recipient cohort                     | Phase 12 source occurrence                         | Phase 17/6 compiler                                 | Safety command, Tenant editor, provider               |
| Local reminder item/engagement                  | Phase 17                                           | Notification Center                                 | Safety command as a direct mutation, task             |
| External attempt and outcome                    | Phase 6 product dispatch ledger                    | Reconciliation/audit                                | Fence timestamp, provider-only dashboard              |
| Incident evidence and communications            | Incident/product governance under a later contract | Privacy-minimized rationale/reference               | Tenant policy, reminder source, acknowledgement truth |
| Durable audit                                   | Owning product command/audit ledger                | Security/operations review                          | Ephemeral logs or analytics alone                     |

### Non-negotiable invariants

1. One exact environment/profile revision has zero or one terminal withdrawal.
2. A withdrawal can change effective behavior only from allowed to denied,
   never from denied to allowed.
3. A withdrawn revision is never selectable or admissible again.
4. A withdrawal creates zero Tenant policy-head writes.
5. Every Tenant head keeps its actual author, reason, revision, and history.
6. Effective active requires a valid selected activated revision **and** no
   exact withdrawal; any indeterminate safety proof denies reminder work.
7. A valid D43 request never depends on optional reminder availability for its
   own success.
8. Every not-yet-irreversible descendant independently passes the fence.
9. A committed irreversible boundary remains truthful and cannot be recalled,
   reclassified as uncommitted, or retried after withdrawal.
10. Withdrawal changes no request, task, access, grant, holder decision,
    responsibility, or personal read state.
11. The first successful withdrawal command owns the immutable result; retries
    cannot create another business effect.
12. Fence correctness depends on primary product state, not caches, queues,
    replicas, providers, flags, or UI.
13. Exact profile/environment scope cannot cross another revision or
    environment; Tenant projections cannot reveal other Tenants.
14. Rollback/restore/failover cannot make the same withdrawn revision effective.
15. The user-visible selected/effective distinction matches the server evaluator
    and accessible text at the same observed version.
16. A Tenant replacement is always an ordinary explicit authorized successor,
    never an automatic consequence of the fence.

### Invariant enforcement matrix

| Invariant                                      | Primary prevention                                                                                               | Independent proof                                                                    |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Exact withdrawal is unique and terminal        | Exact environment/profile-revision uniqueness, immutable command, restrictive delete, no clear/expiry transition | Replay/conflict/delete/restore property tests                                        |
| Tenant head remains Tenant-authored            | Withdrawal command has no Tenant-head mutation privilege or fanout                                               | Zero-head-write statement and audit assertions over many Tenants                     |
| Effective active requires no withdrawal        | One Phase 12 evaluator consumed by every source/effect boundary                                                  | State-table/property tests for active/retired/withdrawn/unknown combinations         |
| D43 remains valid without reminder             | Request and optional cadence admission commit as separately classified outcomes                                  | Denied/unknown safety fixtures still create one valid request and no reminder source |
| No preventable post-fence effect               | Shared exact-profile serialization at D43, D49, local release, and pre-provider-I/O admission                    | Both race orderings plus stale cache/old worker negative tests                       |
| Committed history is never falsified           | Append-only occurrence/attempt/audit evidence and source-end projection                                          | Before/after hashes for source, item, engagement, task, and dispatch rows            |
| Scope never crosses environment/profile/Tenant | Composite exact-profile identity, Tenant-aware head relationships, non-enumerating views                         | Cross-boundary RLS/API/cache/error corpus                                            |
| Restore cannot resurrect                       | Recovery starts reminder admissions globally denied pending current safety reconciliation                        | PITR/region failover exercise against a pre-fence snapshot                           |

## Lifecycle and transition matrix

| Starting state                              | Event                                    | Required resulting state                                                                          | Forbidden result                          |
| ------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Activated, never selected                   | Safety withdrawal commits                | Terminal withdrawn; absent from all choices                                                       | Later selection or reuse                  |
| Activated, selected by zero or many Tenants | Safety withdrawal commits                | Same terminal withdrawn fact; every head preserved; effective Off where referenced                | Tenant census/fanout or synthetic heads   |
| Ordinary retired, selected by a Tenant      | Safety withdrawal commits                | Withdrawal dominates continued retirement admission                                               | Treat retirement as already sufficient    |
| Withdrawn                                   | Exact command replay/lost response       | Same receipt/fact                                                                                 | Second row, changed reason, new timestamp |
| Withdrawn                                   | Conflicting command                      | Hard conflict; first fact unchanged                                                               | Last-write-wins edit                      |
| Withdrawn                                   | Incident resolved/false alarm            | Old revision remains withdrawn                                                                    | Clear/toggle/delete fence                 |
| Withdrawn                                   | Safe replacement approved                | New profile revision may activate through full gates                                              | Alias/reuse old identity                  |
| Selected withdrawn head                     | User does nothing                        | Selected preserved; effective Off                                                                 | Forced acknowledgement or auto-Off head   |
| Selected withdrawn head                     | User explicitly saves Off                | Tenant-attributed Off successor; effective Off                                                    | Platform attribution                      |
| Selected withdrawn head                     | User explicitly saves active alternative | Tenant-attributed successor; effective selected alternative                                       | Automatic substitute                      |
| Selected active head                        | Fence races D43 creation                 | Fence-first creates valid request with no reminder admission; admission-first pins original tuple | Partial/unknown outcome guessed active    |
| Admitted waiting occurrence                 | Fence commits                            | Permanently non-releasable at next boundary                                                       | Resume after successor/restart            |
| Sealed cohort, no descendant released       | Fence commits                            | Cohort stays evidence; descendants denied                                                         | Cohort deletion or release                |
| Local child already released                | Fence commits                            | End active/unread applicability; preserve truthful governed history                               | Mark read/delete/re-age                   |
| External prepared, definitely unsubmitted   | Fence commits                            | Suppress terminally                                                                               | Start call later                          |
| Submission may have begun                   | Fence commits                            | Preserve attempt; reconcile one call/outcome only                                                 | Recall claim or retry                     |
| Restored backup lacks latest proof          | Environment recovery                     | Reminder admission remains globally denied until current fence reconciliation                     | Resume from stale backup                  |

## Race, failure, and recovery matrix

| Race/failure                                    | Safe winner or response                                                                                | Durable evidence and recovery                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Fence versus D43 reminder admission             | One exact profile lock/order: fence-first denies reminder admission; admission-first preserves pin     | Fence receipt plus D43 source disposition; full-command retry on serialization failure |
| Fence versus D49 seal                           | Fence-first terminally denies seal; seal-first preserves immutable cohort and denies later descendants | Source occurrence/claim and fence commit order                                         |
| Fence versus local release                      | Fence-first publishes no item; release-first preserves item then source-ends active/unread             | Atomic release receipt and source-end evidence                                         |
| Fence versus external attempt admission         | Fence-first leaves definitely unsubmitted; attempt-first remains may-have-begun                        | Dispatch position and independent outcome                                              |
| Fence versus Tenant save of same profile        | Fence-first rejects selection; save-first may preserve selected head but effective result is Off       | Expected-head receipt and profile-fence order                                          |
| Fence versus Tenant save of another profile/Off | Both can commit if scopes permit; new selected head evaluates independently                            | Tenant head chain plus fence receipt                                                   |
| Two fence commands                              | One unique fact; exact replay returns it; conflicting input fails                                      | Permanent semantic command receipt                                                     |
| API response lost after fence commit            | Retry reads/returns same receipt                                                                       | Command identity and immutable hash                                                    |
| Outbox/worker/cache invalidation lost           | Correctness unchanged; bounded reconciliation republishes identifiers                                  | Fence remains primary; reconciliation attempt evidence                                 |
| Read replica/cache still says active            | It cannot authorize; UI may narrow to unavailable/unknown until fresh proof                            | Primary mutation check and stale-read telemetry                                        |
| Source evaluator unavailable                    | No reminder admission/effect; valid D43 request may commit without cadence if source contract permits  | Typed safe non-admission/failure evidence                                              |
| Existing external call response unknown         | Preserve `Submission may have begun`/`Indeterminate`; reconcile without another call                   | Attempt ID, request hash, provider evidence                                            |
| Old worker after new fence                      | Database/API mutation boundary rejects it                                                              | Compatibility version and denied attempt evidence                                      |
| Restore/failover before fence time              | Reminder effects globally disabled until current monotonic safety proof reconciles                     | Recovery high-water evidence and controlled reopen proof                               |
| Safety projection disagrees with head/fence     | Fail closed; show status unavailable rather than guess; repair projection                              | Exact source versions and drift monitor                                                |

## Authorization, database, RLS, privacy, and audit requirements

The eventual design must prove, without freezing premature table names:

- one dedicated platform application capability and command boundary for
  withdrawal, separately resolved in D56; no Tenant capability implies it;
- server-derived environment, profile identity/revision, actor/system purpose,
  command identity, trusted commit time, and bounded reason;
- exact-profile uniqueness, immutable fields, restrictive deletes, no
  reversible `enabled`/`cleared_at`/expiry field, and no identifier reuse;
- a shared serialization scope between withdrawal and every admission so an
  absent withdrawal row cannot race a child insert unnoticed;
- Tenant-composite head/version constraints and authorized derived views that
  cannot expose affected-Tenant membership or counts;
- browser grants revoked; application authorization before database access;
  RLS as defense in depth with explicit `USING`/`WITH CHECK` for Tenant rows;
- table-owner, `BYPASSRLS`, service-role, worker, support, migration, backup,
  restore, view, function, RPC, and repair paths subject to equivalent domain
  checks and audited purpose restrictions;
- rejection of caller-supplied Tenant/actor/reason-time/effective state;
- no foreign-key/unique-error/timing/count/cache/log enumeration channel across
  profiles, environments, or Tenants;
- privacy-minimized public reason copy and opaque internal references; no
  request reason, person, capability, ministry, location, member-care, affected
  Tenant list, or research participant data in the fence or product telemetry;
- durable actor/scope/reason/result/effect audit under an approved records
  schedule, with personal attribution separable for lawful anonymization where
  possible without destroying the business fact; and
- no evidence that a Tenant viewer saw or accepted the fence unless that viewer
  performs a separate, explicit, actually authorized action.

### Authorization, RLS, and privacy matrix

| Path                    | Required application authority                                               | Database/RLS boundary                                                       | Safe projection                                       | Fail-safe result                                                      |
| ----------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------- |
| Publish withdrawal      | Future D56 dedicated platform capability plus current step-up/incident proof | Dedicated command; raw writes revoked; exact immutable scope/serialization  | Durable receipt to authorized platform operator only  | No commit and one audited denial/indeterminate result                 |
| Evaluate D43 cadence    | Current same-Tenant request authority plus code-owned profile contract       | Primary transaction; exact fence check; no replica/cache allow              | Typed admitted or safety-fenced source disposition    | Valid request with no reminder admission where independently safe     |
| Seal/release/attempt    | Existing source/member/channel authority at each boundary                    | Product mutation checks exact fence; semantic uniqueness                    | Existing safe result codes only                       | No seal/release/call; preserve earlier committed truth                |
| Read Tenant settings    | Current same-Tenant cadence-policy read authority                            | Tenant head RLS/least grants joined to a safe platform projection           | Selected label, Unavailable for safety, Effective Off | Status unavailable/editor disabled; reveal no raw fence data          |
| Save Tenant replacement | Current same-Tenant policy-management authority                              | `USING`/`WITH CHECK`, expected-head CAS, fresh alternative/fence proof      | Ordinary Tenant successor receipt                     | Conflict/error; no substitution or partial write                      |
| Support/repair          | Exact purpose-bound support/repair capability                                | No ad hoc mutation; same domain command/invariants; audited bypass handling | Minimum opaque identifiers/results                    | Deny and escalate; never clear fence or edit Tenant intent            |
| Audit/incident review   | Purpose-specific platform security/privacy authority                         | Separately governed append-only evidence and retention                      | Minimum actor/scope/reason/result needed for review   | No Tenant/user disclosure; missing evidence blocks activation/closure |

### UX state matrix

| Saved Tenant selection        | Platform/profile state         | Current setting summary                                     | Replacement choices                                            | Save behavior                              |
| ----------------------------- | ------------------------------ | ----------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------ |
| Off/absence                   | Any unrelated withdrawal       | Selected: Off; Effective: Off                               | Off plus selectable active profiles                            | Ordinary explicit change only              |
| Active profile A              | A active/not withdrawn         | Selected: A; Effective: A                                   | Current available choices                                      | Ordinary expected-head Save                |
| Retired profile A             | A retired/not withdrawn        | Selected: A; Current setting remains effective under D53    | Off plus other selectable profiles; A not reselectable         | Leaving preserves; replacement explicit    |
| Withdrawn profile A           | A terminally withdrawn         | Selected: A; Status: Unavailable for safety; Effective: Off | Unpreselected Off plus other selectable profiles               | Leaving is safe; explicit replacement only |
| Withdrawn profile A           | No alternative active          | Same truthful three-part summary                            | One unpreselected Off option                                   | Explicit Off successor or no action        |
| Unknown/unsupported profile   | Compatibility cannot be proved | Status unavailable; never claim safety reason without fact  | Editor disabled until authoritative decode/repair              | No save/effect; typed support path         |
| Any selection with stale page | Fence/head changes before Save | Refresh latest summary after conflict                       | Rebuild from current choices; preserve safe draft context only | Reject stale command; never autosubstitute |

### Rollout and recovery matrix

| Stage                           | Allowed writes/effects                        | Reader behavior                                                  | Required proof                                                  | Rollback/recovery                                           |
| ------------------------------- | --------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------- |
| D55 planning now                | None                                          | No setting/profile/fence surface                                 | Absence and docs consistency                                    | Remove any premature artifact                               |
| Compatible persistence/decoder  | No profile selection/reminder production      | Reads absence and future unknown safely                          | Constraints, grants/RLS, deletion/restore tests                 | Roll forward; no business data exists                       |
| Fence-aware mutation deployment | Profile still unavailable                     | Readers may shadow derived state only                            | D43/D49/local/provider boundary and old-writer rejection matrix | Globally deny reminders on uncertainty                      |
| Emergency command rehearsal     | Exercise/nonproduction only                   | Authorized operator receipt/audit; no Tenant UI                  | D56 authority, response loss, alerts, game day                  | Revoke exercise evidence from product data; retain audit    |
| First profile activation        | New prospective D48 requests only             | Compact current editor/attention behavior                        | Complete D47–D56-plus release evidence                          | Stop new effects; retain decoders/history                   |
| Withdrawal in production        | One terminal exact-profile fence only         | Selected/Unavailable for safety/Effective Off                    | O(1) commit, race monitors, UI/a11y/privacy convergence         | Never clear; roll forward to repair                         |
| PITR/failover                   | Reminder admissions globally denied initially | Safe unavailable state until current high-water                  | Protected fence reconciliation and full mutation readiness      | Reopen only after current proof; never trust stale snapshot |
| Successor activation            | New immutable profile revision only           | Old selected withdrawn heads remain truthful until Tenant change | Fresh applicable qualification/activation; no alias             | Old fence and decoder remain forever applicable to history  |

## Scalability and performance posture

Fence publication must remain constant-work for one profile revision regardless
of affected Tenant or request cardinality. Effect evaluation is one indexed
exact-profile check inside the already required source/effect transaction. A
request page or notification list must not query the fence once per row; safe
profile/effective facts are batch-joined or compiled into bounded projections
whose final action still reauthorizes.

Activation load evidence must include highly skewed Tenant selections, many
concurrent D43 creates, D49 claims, local releases, prepared/attempted external
steps, policy saves, read replicas, cache lag, failover, and restore. Numerical
budgets are ratified from Core's production SLO and fixtures before activation,
not invented here. The release fails if:

- publication statement/write/lock work grows with affected Tenants or work;
- an irreversible effect path performs no exact authoritative fence check;
- fence evaluation causes a per-item/per-recipient query slope;
- a hot exact-profile lock cannot meet the ratified incident and ordinary-
  request budgets under production-shaped concurrency; or
- cleanup/backfill is required before the fence becomes logically effective.

## Migration, rollout, rollback, restore, and upgrade posture

1. Keep all runtime/UI absent while D55 remains planning.
2. In the eventual activation, introduce compatible profile/withdrawal decoding,
   constraints, least grants, and derived selected/effective read shape first.
3. Deploy every D43, D49, local-release, and external-attempt mutation boundary
   with deny-first fence evaluation before any profile can be selected.
4. Prove mixed old/new readers and workers, including database/API rejection of
   a fence-unaware writer.
5. Shadow the evaluator and race corpus without a selectable profile or visible
   placeholder.
6. Provision and rehearse the future D56-authorized emergency command, audit,
   monitoring, response-loss recovery, and restore/failover runbook.
7. Activate one profile only after D47–D55-plus full OpenSpec/manifest/tests/
   release evidence passes. There is no existing state to backfill.
8. After a fence, retain decoders, source/audit history, and the fence. Roll
   forward to fix defects; never downgrade to code that can treat the revision
   as active.
9. Recovery begins with reminder admissions globally denied until the restored
   control state is proven at or beyond the protected safety high-water mark.
10. A successor profile is an additive activation with a new immutable
    identity/revision; it does not migrate or reinterpret old Tenant heads.

## Ruthless 22-category adversarial review

Every category has a material concern under the unamended phrase “platform
safety fence.” Each row states all eight requested concern fields explicitly.

|   # | Category / material concern                                         | What could go wrong                                                                                                                                            | Why it matters                                                                                               | Severity | Likelihood                                                   | Evidence / reasoning                                                                                                   | Effect on answer                                                           | Permanent fix                                                                                                              | Exact decision, requirement, or proof to add                                                                 |
| --: | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
|   1 | Problem validity, necessity, alternatives — **Yes**                 | Core could build emergency machinery for an unactivated feature, or use a flag that does not reliably stop effects.                                            | Premature work is debt; a weak control creates false safety.                                                 | High     | Medium before activation; High if a profile ships without it | D53 forbids activation until withdrawal is proved; Azure/AWS flags cache or poll.                                      | Narrows Option 1; does not invalidate it.                                  | Documentary contract now; one product-database fence only in full activation; no current artifact.                         | “D55 is docs-only; no profile activates until exact fence/effect-boundary proof passes.”                     |
|   2 | Brittleness — **Yes**                                               | A Boolean/config value, cached result, title, current code version, or absent-row check can be stale, toggled, or race an admission.                           | One bypass emits the exact harmful effect the fence claims to prevent.                                       | Critical | High without a shared serialization boundary                 | Azure/AWS document cached configuration; PostgreSQL documents cross-row policy races.                                  | Replaces a generic kill switch with an exact terminal product fact.        | Exact revision uniqueness, no clearing, primary transaction check, shared lock/order.                                      | “Fence-first denies; admission-first is preserved; indeterminate never allows.”                              |
|   3 | Technical debt — **Yes**                                            | A generic policy/incident engine, per-channel cancel flags, or mass-Tenant mutation becomes duplicated permanent infrastructure.                               | It raises change cost and creates competing sources of truth.                                                | High     | High if vendor patterns are copied literally                 | ADR-0026 already separates source, plan, presentation, and transport.                                                  | Rejects generic infrastructure while accepting one bounded command.        | Reuse Phase 12/6/17 mutation boundaries; no rules DSL, workflow engine, or fanout.                                         | “One exact profile-withdrawal fact; existing domains consume it subtractively.”                              |
|   4 | Edge cases — **Yes**                                                | Retired/unknown profiles, absent policy rows, already sealed cohorts, released items, ambiguous provider attempts, zero alternatives, and restore can diverge. | Users see false state or unsafe effects escape.                                                              | Critical | High across lifecycle                                        | D48–D54 already define all these independently meaningful boundaries.                                                  | Expands the decision into explicit state and race matrices.                | Preserve each committed fact; deny only preventable descendants; safe one-option UX.                                       | Apply the lifecycle/race matrices and criteria 11–20, 31–40, and 51–60.                                      |
|   5 | Footguns — **Yes**                                                  | An operator might clear a fence, a developer auto-write Off, a UI preselect a replacement, or support edit raw rows.                                           | History and Tenant attribution become false; unsafe revision can resurrect.                                  | Critical | Medium                                                       | Core immutable-policy conventions and AWS emergency-access guidance require narrow audited controls.                   | Adds explicit prohibitions and dedicated authority.                        | No reversible field/delete; no mass heads; no preselection; no direct support mutation.                                    | “Same revision never returns; every replacement is an explicit Tenant successor or new profile.”             |
|   6 | Tenant safety — **Yes**                                             | A scope bug can fence the wrong environment/profile or expose which Tenants selected it.                                                                       | It causes cross-Tenant operational harm or disclosure.                                                       | Critical | Medium                                                       | Platform Boundaries make Tenant isolation non-negotiable; constraints can leak through errors.                         | Requires exact global scope plus Tenant-safe derived projections.          | Environment/profile composite identity, authorized joins, non-enumerating errors/counts/caches.                            | “No Tenant-facing path reveals another Tenant, affected count, or internal fence evidence.”                  |
|   7 | Database, RLS, authorization — **Yes**                              | Caller-authored actor/scope, missing `WITH CHECK`, owner/service bypass, or an absent-row race defeats the guardrail.                                          | The strongest UI warning cannot protect direct/privileged mutations.                                         | Critical | High if convention-only                                      | PostgreSQL/Supabase document default deny, `USING`/`WITH CHECK`, owner/BYPASSRLS, and race caveats.                    | Makes database/application proof a blocker.                                | Dedicated command, least grants, immutable constraints, shared serialization, privileged parity.                           | “All writers use the same fence-aware application mutation; browser/raw service writes are revoked.”         |
|   8 | Overengineering — **Yes**                                           | Dual control planes, distributed consensus, a global kill-switch platform, or evidence database could be built for one optional occurrence.                    | Complexity slows containment and creates new failure modes.                                                  | High     | Medium                                                       | One exact immutable revision and four effect boundaries are bounded; current runtime is absent.                        | Keeps Option 1 minimal.                                                    | One logical fence plus existing transactions; defer actor approval to D56; no current runtime.                             | “D55 specifies behavior, not a generic control plane or premature schema.”                                   |
|   9 | UX/UI and friction — **Yes**                                        | “Paused,” a disabled checked radio, auto-selected Off, alarm styling, or forced acknowledgement can mislead and create accidental policy changes.              | Tenant staff cannot distinguish what they chose from what Asym currently permits.                            | High     | High under a naive editor                                    | GOV.UK/WCAG support read-only unavailable context, clear next action, labelled unselected choices, and sparse banners. | Changes the initial copy/interaction materially.                           | Separate Selected/Status/Effective summary; unselected replacement; explicit Save; calm inline content.                    | Use rules 39–54 and UX criteria 31–40 exactly.                                                               |
|  10 | Source of truth, ownership, invariants — **Yes**                    | Effective state may be written twice or a flag/incident ticket may overwrite Tenant policy.                                                                    | Dual ownership produces circular repair and untraceable behavior.                                            | Critical | Medium                                                       | AWS guardrails and Kubernetes desired/status both demonstrate separated ownership; Core ADRs are stricter.             | Requires one-way derivation.                                               | Tenant owns selection; platform owns terminal fence; Phase 12 derives effective; consumers only narrow.                    | “Effective timing is never a writable head and no external system owns withdrawal truth.”                    |
|  11 | Hidden coupling — **Yes**                                           | Correctness may depend on feature-flag propagation, app deployment, queue cancellation, notification cleanup, provider recall, or English labels.              | Changing any dependency can silently reopen unsafe effects.                                                  | Critical | High without negative rules                                  | Official flag agents cache; D51 shows executor cancellation is not source truth.                                       | Rejects dependency-owned safety.                                           | Check exact fence at product effect commit; identifiers/copy/providers remain replaceable.                                 | “Caches/flags/outboxes/providers may narrow or converge only; none can allow.”                               |
|  12 | Failure modes — **Yes**                                             | Fence commit can lose its response/outbox, a worker can crash mid-call, a replica can lag, or audit delivery can be delayed.                                   | Operators may repeat effects or believe containment happened when a path still allows.                       | Critical | High in distributed execution                                | CloudTrail documents delayed addenda; D51 provider states and command receipts cover ambiguity.                        | Adds idempotent receipts, fail-closed checks, and explicit reconciliation. | Permanent command identity; primary DB truth; no retry after may-have-begun; drift monitors.                               | “Fence correctness survives lost messages and response loss; technical telemetry is not proof.”              |
|  13 | Lifecycle, temporal correctness, concurrency, idempotency — **Yes** | Fence/save/admission/seal/release/attempt races can each commit a plausible but jointly unsafe result; clearing creates ABA.                                   | One late effect violates the safety promise and corrupts history.                                            | Critical | High                                                         | D48–D54 and PostgreSQL serializable retry expose exact race boundaries.                                                | Makes terminal existence and exact ordering essential.                     | One serialization scope, full-command retry, no clearing, permanent semantic uniqueness.                                   | Adopt the lifecycle/race matrices; test both committed orderings at boundaries.                              |
|  14 | Data integrity — **Yes**                                            | Duplicate/conflicting withdrawals, mutable scope/reason, orphan audit, stale effective projections, or restore loss corrupts truth.                            | Staff and incident responders cannot explain or trust the current state.                                     | Critical | Medium                                                       | PostgreSQL constraints and Core append-only evidence patterns support database-enforced invariants.                    | Requires constraints and deterministic rebuild.                            | Unique exact scope, immutable record/hash, restrictive delete, derived projection repair, recovery high-water.             | “Invalid states are rejected at the single mutation boundary, not cleaned up manually.”                      |
|  15 | Security and privacy — **Yes**                                      | Internal evidence may expose reporters, ministries, people, request reasons, affected Tenants, or exploitable safety defects.                                  | Missionary/member-care context can be especially sensitive and a cross-Tenant list is valuable intelligence. | Critical | Medium                                                       | ICO minimization; Core D41–D54 privacy ceilings; RLS error channels.                                                   | Narrows public/Tenant projection and audit payload.                        | Bounded reason class, opaque evidence reference, minimal copy/logs, separate authorized incident store.                    | “Tenant users see only selected/effective/Unavailable and safe consequence; no internal evidence or counts.” |
|  16 | Scalability and performance — **Yes**                               | A synchronous Tenant/request scan, hot lock, per-row fence lookup, or cleanup prerequisite can delay containment and ordinary work.                            | Large/skewed Tenants turn safety into an outage or leak window.                                              | High     | Medium                                                       | O(1) source fences and indexed exact evaluation avoid fanout; no volume supports invented numbers.                     | Confirms Option 1 over mass mutation.                                      | Constant publication, indexed evaluation, batched reads, production-shaped ratified budgets.                               | “Logical effectiveness is independent of affected cardinality; cleanup is never correctness.”                |
|  17 | Operational burden — **Yes**                                        | Manual SQL, undocumented break-glass access, per-Tenant repair, or fence clearing creates dangerous tribal knowledge.                                          | The control may be unavailable or misused during the incident it exists for.                                 | High     | Medium                                                       | AWS recommends pre-created, documented, monitored, tested emergency access.                                            | Requires a runbook/command but not an engine.                              | Pre-provision one narrow command, rehearsed recovery, durable receipt, named owners/monitors.                              | “No first-use-in-production command; D56 authority and activation rehearsal are required.”                   |
|  18 | Observability and auditability — **Yes**                            | A flag dashboard can say Off while an old worker released; logs may omit actor/reason/order or contain sensitive facts.                                        | Core cannot prove containment, scope, or effect history.                                                     | Critical | High without product receipts                                | AWS CloudTrail and NIST/OWASP distinguish attributable audit from technical logging.                                   | Adds durable business lineage and privacy-minimized telemetry.             | Fence→source→seal→release/attempt→outcome linkage, opaque signals, drift reconciliation.                                   | “Audit proves product order/result; logs and provider dashboards never substitute.”                          |
|  19 | Dependencies and integrations — **Yes**                             | Flag vendor, incident platform, Inngest, Realtime, email provider, cache, or status page may be unavailable or contradictory.                                  | External outages could prevent or reverse safety if they own truth.                                          | Critical | Medium                                                       | Official config clients cache/fail open to stale; Core workflow spec makes execution replaceable.                      | Keeps external systems non-authoritative.                                  | Product DB fence; identifier-only outbox; adapters reconcile admitted attempts only.                                       | “No third party is required for fence commit/evaluation or safe Tenant understanding.”                       |
|  20 | Migration, rollout, upgrade — **Yes**                               | A new writer publishes fences while old writers ignore them; rollback/restore removes the fact; old readers offer the revision.                                | Mixed deployment can emit harm after the UI says unavailable.                                                | Critical | High without sequencing                                      | D53 requires mixed-version proof; no current runtime means compatibility can be designed before activation.            | Requires deny-first deployment and roll-forward recovery.                  | Readers/constraints/evaluators/writers/runbook before selection; restore globally Off until current.                       | Apply rollout steps 1–10 and criteria 51–58.                                                                 |
|  21 | Testability, traceability, proof — **Yes**                          | Unit/snapshot tests can miss cross-process races, service-role bypass, cache lag, restoration, accessible distinctions, and O(N) behavior.                     | A paper fence may not stop production effects or support real users.                                         | Critical | High if tested only at UI                                    | User requires falsifiable evidence; Core public seams span Phase 12/17/6/database/UI.                                  | Adds continuous assertions/criteria and monitors.                          | Positive/negative/auth/race/property/mixed-version/restore/a11y/load evidence traced across artifacts.                     | D55 research criteria 1–60 and named monitors are activation gates.                                          |
|  22 | Other development hazards — **Yes**                                 | “Safety” may become a vague censorship switch, routine rollout flag, reversible pause, staff-performance signal, or reason to hide product defects.            | Broad power and vague semantics invite misuse and user distrust.                                             | High     | Medium                                                       | D47 prohibits performance surveillance; feature-toggle guidance warns of flag carrying cost; Core values honest state. | Restricts purpose and future questions.                                    | Exact profile scope, bounded reason, D56 authority, no personal analytics, public safe explanation, successor-only return. | “D55 applies only to reviewed material harm; it never proves user awareness or staff failure.”               |

## D55 research assertions

The identifiers below are continuous and classified for traceability. They are
research and specification evidence, not runtime keys or database identifiers.

- **D55-RA001 — Verified repository fact:** current Core has no activated D43
  access-review reminder, timing profile, Tenant cadence head, safety fence, or
  cadence settings UI.
- **D55-RA002 — Verified repository fact:** Platform Principles rank Tenant and
  permission safety above convenience and require honest operational state.
- **D55-RA003 — Verified repository fact:** Platform Boundaries keep permission-
  sensitive operational mutations server-side and require unavailable
  capabilities to appear intentional rather than broken.
- **D55-RA004 — Verified repository fact:** D47 defines a separate Tenant-wide
  access-review cadence source policy and creates no present runtime artifact.
- **D55-RA005 — Verified repository fact:** D48 admits only genuine D43 requests
  ordered after a valid non-Off policy boundary and forbids historical backfill.
- **D55-RA006 — Verified repository fact:** D49 seals one immutable exact
  coordinator cohort and allows later descendants only to narrow it.
- **D55-RA007 — Verified repository fact:** D50 pins trusted request-creation and
  eligibility instants; a worker or provider clock cannot own timing truth.
- **D55-RA008 — Verified repository fact:** D51 Tenant Off advances an immediate
  O(1) monotonic cancellation epoch without scanning or rewriting child work.
- **D55-RA009 — Verified repository fact:** D52 gives each admitted occurrence a
  finite half-open usefulness interval and requires each unreleased descendant
  to recheck current source gates.
- **D55-RA010 — Verified repository fact:** D53 makes activated profiles immutable
  code-owned revisions and forbids activation until urgent withdrawal and mixed-
  version behavior are proved.
- **D55-RA011 — Verified repository fact:** D54 defines a later local reminder as
  a distinct source-actionable item whose read state and history cannot be
  rewritten to simulate cancellation.
- **D55-RA012 — Verified repository fact:** ADR-0026 separates source occurrence,
  Delivery Plan, channel admission, provider attempt, and business outcome.
- **D55-RA013 — Verified repository fact:** ADR-0027 makes notification
  presentation and personal engagement projections, not request or policy truth.
- **D55-RA014 — Verified repository fact:** ADR-0183 keeps the single D43 source-
  backed Tasks Hub task independent of reminders and notification engagement.
- **D55-RA015 — Verified repository fact:** ADR-0184 and Phase 12 own direct/group
  assignment, EffectiveAccess, access requests, coordinator routing, and the
  reminder source chain.
- **D55-RA016 — Verified repository fact:** identity-and-access OpenSpec requires
  trusted Tenant/Party/assignment/role resolution, application authorization,
  RLS, and actor attribution.
- **D55-RA017 — Verified repository fact:** workflow-orchestration OpenSpec makes
  product records and claims authoritative while workers carry identifiers and
  reread current state.
- **D55-RA018 — Verified repository fact:** Core frontend rules require Base UI,
  `base-maia`, semantic tokens, shared components, accessible interaction, and
  responsive proof.
- **D55-RA019 — Verified repository fact:** D53 ordinary retirement removes a
  profile from new selection but intentionally lets an existing selected head
  continue new-request admission.
- **D55-RA020 — Verified repository fact:** no current schema, migration, RPC,
  flag, event, job, role, capability, metric, message, or UI can serve as a D55
  implementation precedent.
- **D55-RA021 — Verified external fact:** AWS Organizations documents an SCP as a
  permission guardrail that does not itself grant permissions.
- **D55-RA022 — Verified external fact:** AWS documents effective permissions as
  the intersection of applicable guardrails and underlying identity/resource
  policies.
- **D55-RA023 — Verified external fact:** AWS IAM policy evaluation is deny by
  default and an applicable explicit deny overrides an allow.
- **D55-RA024 — Verified external fact:** Kubernetes distinguishes user-authored
  desired `spec` from system-owned current `status`.
- **D55-RA025 — Verified external fact:** Azure App Configuration documents a
  switch use case as an instant kill switch that avoids redeploying code.
- **D55-RA026 — Verified external fact:** Azure's configuration provider checks
  on a refresh interval and continues using cached configuration after refresh
  failure.
- **D55-RA027 — Verified external fact:** AWS AppConfig Agent asynchronously
  polls and serves local cached configuration to preserve availability during
  network problems.
- **D55-RA028 — Verified external fact:** AWS AppConfig distinguishes deployment,
  rollback, and revert states and after its bounded revert window requires a new
  deployment rather than pretending history never occurred.
- **D55-RA029 — Verified external fact:** AWS Well-Architected recommends
  documenting emergency preconditions, failure assumptions, and incident links
  before emergency access is needed.
- **D55-RA030 — Verified external fact:** AWS recommends pre-created least-
  privilege emergency resources, authorized initiation/appropriate approval,
  detailed logs/alerts, and periodic exercises.
- **D55-RA031 — Verified external fact:** AWS CloudTrail management records can
  include identity, action, event time, parameters, response, and delayed
  addenda; delivery order is not a product transaction order.
- **D55-RA032 — Verified external fact:** OWASP recommends deny-by-default
  authorization and safe failure when no allow rule is proven.
- **D55-RA033 — Verified external fact:** OWASP recommends validating permission
  on every request rather than relying on a majority of protected paths.
- **D55-RA034 — Verified external fact:** PostgreSQL RLS is default-deny only
  after it is enabled and no applicable policy allows rows.
- **D55-RA035 — Verified external fact:** PostgreSQL table owners, superusers,
  and `BYPASSRLS` roles can bypass ordinary row policies.
- **D55-RA036 — Verified external fact:** PostgreSQL uses `USING` for existing
  rows and `WITH CHECK` for proposed inserted/updated rows.
- **D55-RA037 — Verified external fact:** PostgreSQL warns that cross-table RLS
  policy reads can create concurrency-based information leaks without careful
  locking or equivalent design.
- **D55-RA038 — Verified external fact:** PostgreSQL Serializable execution can
  abort on serialization conflict and requires applications to retry the whole
  transaction.
- **D55-RA039 — Verified external fact:** GOV.UK recommends fieldset/legend
  grouping for radios and avoiding preselection when a person must make a new
  choice.
- **D55-RA040 — Verified external fact:** GOV.UK unavailable-state guidance says
  to explain what happened to in-progress information and what the user can do
  next.
- **D55-RA041 — Verified external fact:** GOV.UK says banners should be sparse,
  directly relevant page information should be main content, and multiple
  banners should be avoided.
- **D55-RA042 — Verified external fact:** USWDS says a system status must be
  understandable without relying solely on color or icon shape.
- **D55-RA043 — Verified external fact:** WCAG guidance requires clear labels and
  instructions but notes that excessive instructions can also impair use.
- **D55-RA044 — Verified external fact:** WCAG status-message guidance requires
  programmatic exposure without needless focus interruption and warns against
  overly chatty live regions.
- **D55-RA045 — Verified external fact:** Supabase documents table grants and RLS
  as separate controls that both require explicit design and tests.
- **D55-RA046 — Verified external fact:** Supabase documents that service-role/
  secret-key paths bypass RLS and must remain server-side.
- **D55-RA047 — Verified external fact:** ICO guidance requires personal data to
  be adequate, relevant, limited to necessity, reviewed, and not retained merely
  because it may later be useful.
- **D55-RA048 — Verified external fact:** no cited external source decides Core's
  exact withdrawal actor, approval count, incident threshold, copy, retention,
  or propagation SLO.
- **D55-RA049 — Requirement inference:** cache/poll behavior documented by Azure
  and AWS makes a generic feature flag insufficient as the final D55 effect-
  admission authority.
- **D55-RA050 — Requirement inference:** the AWS guardrail analogy supports
  intersecting selected and platform safety facts but cannot grant platform
  actors any Core authority.
- **D55-RA051 — Assumption:** authorized nonprofit administrators will need a
  concise explanation when their saved reminder choice is no longer effective.
- **D55-RA052 — Assumption:** most Tenant administrators will prefer no forced
  acknowledgement or per-request cleanup when the platform has already made the
  optional reminder safely ineffective.
- **D55-RA053 — Unresolved unknown:** representative ministry research has not
  established the comprehension threshold for selected-versus-effective copy.
- **D55-RA054 — Unresolved unknown:** D55 does not decide which platform role or
  application capability may publish a withdrawal.
- **D55-RA055 — Unresolved unknown:** D55 does not decide whether withdrawal
  needs one immediate actor plus later review or two approvers before commit.
- **D55-RA056 — Unresolved unknown:** D55 does not decide when or how a material
  incident requires direct Tenant communication outside the settings surface.
- **D55-RA057 — Unresolved unknown:** the approved records schedule for platform
  withdrawal evidence and actor attribution is not yet specified.
- **D55-RA058 — Unresolved unknown:** Core's production containment, contention,
  read, and recovery SLOs must be measured and ratified before activation.
- **D55-RA059 — Unresolved unknown:** no evidence currently establishes the
  number of profiles, affected Tenants, current requests, or concurrent claims a
  future activation will have.
- **D55-RA060 — Unresolved unknown:** the incident-specific rule for retaining or
  suppressing an already released item's safe Recent projection must be closed
  by that item's activation/privacy contract.
- **D55-RA061 — Product judgment:** preserving a Tenant head is the only option
  that contains harm without falsifying who selected the policy.
- **D55-RA062 — Requirement inference:** effective cadence must be derived from
  the current Tenant selection intersected with activation, compatibility, and
  terminal safety-withdrawal truth.
- **D55-RA063 — Product judgment:** a safety withdrawal is terminal for the exact
  profile revision; a reversible pause is semantically unsafe and invites ABA.
- **D55-RA064 — Requirement inference:** environment and immutable profile
  identity/revision, not a display label or timing pair alone, form the exact
  withdrawal scope.
- **D55-RA065 — Requirement inference:** one withdrawal commit must be constant
  logical work independent of affected Tenant/request/recipient volume.
- **D55-RA066 — Product judgment:** no synchronous census or per-Tenant fanout is
  part of fence correctness; later analysis or cleanup may be bounded consumers.
- **D55-RA067 — Requirement inference:** the safety command writes no Tenant
  policy version/head and therefore cannot use a synthetic Tenant actor.
- **D55-RA068 — Requirement inference:** a safe return is a new qualified and
  activated profile identity/revision; the withdrawn revision remains decodable
  but never effective.
- **D55-RA069 — Requirement inference:** unknown, unsupported, stale, missing, or
  contradictory safety proof must deny reminder admission/effect rather than
  infer active.
- **D55-RA070 — Product judgment:** safety failure in optional reminder admission
  must not prevent an otherwise valid D43 access-review request from committing.
- **D55-RA071 — Requirement inference:** D43 admission, D49 seal, local release,
  and external attempt admission each independently recheck the exact fence.
- **D55-RA072 — Requirement inference:** irreversible writes must use primary
  product-database state; replica/cache/flag state can only narrow or inform UI.
- **D55-RA073 — Requirement inference:** withdrawal and admission need one shared
  exact-profile serialization scope so the first optional-row insertion cannot
  race an absent-row read.
- **D55-RA074 — Requirement inference:** one committed order governs every fence
  race: fence-first denies; admission-first preserves that boundary and later
  boundaries still deny.
- **D55-RA075 — Requirement inference:** exact command replay and response-loss
  recovery return the first immutable receipt; conflicting reuse fails hard.
- **D55-RA076 — Product judgment:** subsequent investigation and review evidence
  appends outside the withdrawal record so the first safety fact never drifts.
- **D55-RA077 — Requirement inference:** persistence must not expose `enabled`,
  `cleared`, expiry, or delete semantics that could allow the same revision.
- **D55-RA078 — Requirement inference:** restore/failover starts reminder
  admissions globally denied until the latest protected safety high-water is
  reconciled and proved current.
- **D55-RA079 — Requirement inference:** backup/audit copies are recovery evidence
  and never become a second independently writable fence authority.
- **D55-RA080 — Requirement inference:** ordinary retirement and urgent safety
  withdrawal remain distinct because only the latter blocks current-head
  admission.
- **D55-RA081 — Requirement inference:** a pre-fence sealed D49 cohort remains
  immutable evidence while each unreleased descendant is denied.
- **D55-RA082 — Requirement inference:** a pre-fence local reminder ends active/
  unread applicability without deleting, rereading, retimestamping, or
  reclassifying its committed occurrence.
- **D55-RA083 — Requirement inference:** a pre-fence external attempt that may
  have begun retains that dispatch state and reconciles without another call.
- **D55-RA084 — Requirement inference:** withdrawal never fabricates a user's
  read, archive, acknowledgement, or awareness state.
- **D55-RA085 — Requirement inference:** withdrawal cannot mutate request, task,
  grant, EffectiveAccess, holder decision, D44 responsibility, or initial
  attention.
- **D55-RA086 — Product judgment:** raw fence/incident evidence is platform
  operational data rather than an ordinary Tenant-editable CRM table.
- **D55-RA087 — Requirement inference:** Tenant users receive only a role-safe
  selected/effective/status projection under current same-Tenant authorization.
- **D55-RA088 — Product judgment:** the Current setting summary should explicitly
  show **Selected**, **Status: Unavailable for safety**, and **Effective** in
  that logical order.
- **D55-RA089 — Product judgment:** safe adjacent copy states that Asym stopped
  the timing for safety, no new requests use it, existing requests/tasks/access
  remain unchanged, and that exact setting will not restart.
- **D55-RA090 — Product judgment:** **paused**, **temporarily unavailable**, and
  **under review** are prohibited without separate evidence because the exact
  revision can never return.
- **D55-RA091 — Product judgment:** the withdrawn selection belongs in a read-
  only summary, not as a disabled checked radio mixed with valid choices.
- **D55-RA092 — Product judgment:** replacement choices begin unselected; showing
  effective Off does not authorize preselecting a Tenant-authored Off draft.
- **D55-RA093 — Requirement inference:** taking no action safely preserves the
  selected head while the platform guardrail keeps effective state Off.
- **D55-RA094 — Requirement inference:** a replacement save uses ordinary
  authorization, expected-head CAS, fresh profile/fence proof, and truthful
  Tenant actor attribution.
- **D55-RA095 — Requirement inference:** a fence arriving during editing rejects
  a withdrawn draft, refreshes truth, and never silently substitutes another
  option.
- **D55-RA096 — Product judgment:** when no alternative exists, the fieldset
  contains one normal Off option rather than an empty/disabled/coming-soon UI.
- **D55-RA097 — Product judgment:** withdrawal itself creates no per-Tenant task,
  notification, email, chat, receipt, or forced acknowledgement fanout.
- **D55-RA098 — Requirement inference:** absence of a Tenant replacement save
  proves neither awareness nor approval and cannot feed staff-performance
  analytics.
- **D55-RA099 — Requirement inference:** selected, status, effective, consequence,
  and replacement relationships must be visible and programmatically named in
  the same reading order.
- **D55-RA100 — Product judgment:** a withdrawn state present at page load is
  ordinary semantic content, not an assertive live-region announcement.
- **D55-RA101 — Requirement inference:** keyboard, visible focus, touch targets,
  320-CSS-pixel/400-percent reflow, forced colors, reduced motion, long strings,
  CJK, and RTL/bidi are activation gates.
- **D55-RA102 — Requirement inference:** low-bandwidth comprehension and Save/
  conflict recovery cannot depend on remote images, animations, Realtime, or an
  external status page.
- **D55-RA103 — Requirement inference:** settings/list reads batch or join
  profile/fence facts; they cannot add a fence query per Tenant row, request,
  notification group, or recipient.
- **D55-RA104 — Product judgment:** containment, contention, read, and recovery
  budgets must come from production-shaped evidence, not invented values in D55.
- **D55-RA105 — Requirement inference:** every irreversible writer becomes fence-
  aware before any profile is selectable, with an API/database compatibility
  gate against older writers.
- **D55-RA106 — Requirement inference:** after withdrawal, recovery is roll-
  forward; rollback can only narrow more and retain the fence/decoders/history.
- **D55-RA107 — Requirement inference:** flags, queues, Inngest, Realtime,
  providers, incident tools, and analytics cannot create, clear, or authorize
  against the fence.
- **D55-RA108 — Requirement inference:** D56 must assign a dedicated platform
  application capability and emergency authorization path before activation.
- **D55-RA109 — Product judgment:** an external incident/evidence system may be
  referenced opaquely but cannot be required to evaluate the fence at runtime.
- **D55-RA110 — Requirement inference:** durable audit must link exact command,
  profile scope, trusted actor/system purpose, reason, commit, and downstream
  disposition independently of technical logs.
- **D55-RA111 — Requirement inference:** Tenant projections, audit, logs,
  telemetry, caches, exports, support, and backups minimize person/ministry/
  incident data to the exact purpose.
- **D55-RA112 — Requirement inference:** Tenant head/projection mutations require
  both old-row `USING` and proposed-row `WITH CHECK` protection where applicable.
- **D55-RA113 — Requirement inference:** table-owner, service-role, worker,
  support, repair, migration, backup, and restore paths must preserve the same
  domain authorization and invariants despite RLS bypass potential.
- **D55-RA114 — Requirement inference:** composite scope, non-enumerating errors,
  and negative tests must prove that one environment/profile/Tenant cannot
  observe or change another.
- **D55-RA115 — Requirement inference:** proof must cover positive, negative,
  boundary, property, authorization, RLS, race, response-loss, provider,
  migration, restore, mixed-version, accessibility, localization, and load cases.
- **D55-RA116 — Requirement inference:** named monitors need exact signal,
  threshold, owner, and response; popularity, clicks, or individual response
  speed are not safety evidence.
- **D55-RA117 — Product judgment:** D55 adds no generic kill-switch framework,
  policy language, evidence database, approval engine, or Tenant workflow.
- **D55-RA118 — Requirement inference:** D55 currently creates no runtime key,
  profile, row, role, capability, enum, flag, job, route, telemetry, or UI.
- **D55-RA119 — Product judgment:** Option 1 is accepted only with terminal
  exact-revision scope, primary-database enforcement, preserved heads, truthful
  UX, and successor-only recovery.
- **D55-RA120 — Unresolved unknown:** D56 must choose the authorized publication
  and approval shape; no further D55 implementation detail can silently answer
  that governance decision.

## D55 research acceptance criteria

- **D55-RAC001:** Repository inspection proves D55 changes documentation only
  and creates no runtime profile, fence, policy, role, schema, migration, key,
  message, task, flag, job, metric, route, or UI artifact.
- **D55-RAC002:** The exact corrected decision states that Tenant-selected head
  and platform safety withdrawal have different owners and that effective
  cadence is derived rather than independently writable.
- **D55-RAC003:** A model test enumerates absence/Off, active, ordinarily retired,
  safety-withdrawn, and unknown profile states without collapsing them or
  labeling unknown as withdrawn.
- **D55-RAC004:** One exact environment/profile identity/revision accepts at most
  one terminal withdrawal and rejects cross-environment or revision aliases.
- **D55-RAC005:** No command, API, migration, restore, rollback, support action,
  expiration, or feature flag can clear/delete/toggle the withdrawal or allow
  the same revision again.
- **D55-RAC006:** Exact semantic command replay and lost-response retry return the
  same immutable receipt; changed immutable input under the command identity
  conflicts with zero additional writes.
- **D55-RAC007:** The committed withdrawal derives environment/profile scope,
  actor/system purpose, command identity, trusted time, and bounded reason from
  authorized server context rather than caller-controlled fields.
- **D55-RAC008:** A successor activation uses a new immutable profile revision;
  tests reject alias, rename, rekey, migration, or decoder change that makes the
  withdrawn revision selectable/effective.
- **D55-RAC009:** Query/statement/write-cardinality evidence proves withdrawal
  publication performs constant logical work and no Tenant/request/recipient/
  task/item/provider scan or mutation.
- **D55-RAC010:** A property test over zero, one, and many Tenant heads proves the
  withdrawal creates zero Tenant policy versions/heads and preserves every
  original actor, reason, selection, and revision.
- **D55-RAC011:** Fence-versus-D43 concurrency tests prove exactly two valid
  orders: fence-first creates the request without reminder admission, or
  admission-first preserves one pinned source tuple whose later boundaries are
  fenced.
- **D55-RAC012:** A D43 request otherwise valid under access governance still
  commits when reminder safety proof is denied/withdrawn; no reminder source or
  descendant is admitted.
- **D55-RAC013:** Fence-versus-D49 tests prove fence-first terminally denies seal,
  while seal-first preserves one complete immutable cohort and denies every
  unreleased descendant.
- **D55-RAC014:** Fence-versus-local-release tests prove fence-first publishes no
  reminder item, while release-first preserves one item and then ends only its
  active/unread applicability without changing engagement/history.
- **D55-RAC015:** Fence-versus-external-attempt tests prove fence-first leaves
  work definitely unsubmitted, while attempt-first preserves **Submission may
  have begun** and permits reconciliation but zero new provider calls.
- **D55-RAC016:** Prepared/unsubmitted, may-have-begun, Accepted, Definitely
  rejected, and Indeterminate fixtures preserve independent dispatch/outcome
  truth and never infer recall or provider-time ordering from fence time.
- **D55-RAC017:** Every D43 admission, D49 seal, local release, and external
  attempt-admission public seam rechecks the exact current fence inside its
  authoritative primary-database mutation.
- **D55-RAC018:** A mutation-path inventory and negative test prove browser,
  replica, cache, edge, flag, worker envelope, outbox, Realtime, provider, and
  earlier UI values cannot authorize any of those four boundaries.
- **D55-RAC019:** The first optional withdrawal-row race is serialized with the
  same exact profile scope as admission; a production-shaped two-transaction
  test cannot commit fence and post-fence allow from mutually stale absence.
- **D55-RAC020:** Serialization/deadlock conflicts retry the complete semantic
  command and never retry only a provider call or partially committed child.
- **D55-RAC021:** A current head selecting a withdrawn revision evaluates as
  selected preserved/effective Off, while an unrelated active profile revision
  remains unaffected.
- **D55-RAC022:** Ordinary retirement tests preserve existing-head new-request
  admission, while safety withdrawal of the same exact revision dominates and
  denies it.
- **D55-RAC023:** Unknown/unsupported/corrupt/indeterminate profile or safety
  evidence fails closed to no reminder, reports a typed non-admission state, and
  does not falsely claim Tenant-selected Off or safety withdrawal.
- **D55-RAC024:** Withdrawal performs zero D43 request, access-source,
  EffectiveAccess, holder-decision, D44-responsibility, Tasks Hub, initial-item,
  or personal-engagement mutations.
- **D55-RAC025:** A waiting or D49-indeterminate pre-fence occurrence can never
  revive through retry, re-enable, successor profile, worker restart, restore,
  or reconciliation.
- **D55-RAC026:** A previously released D54 reminder never contributes active/
  unread attention after fence convergence, and its immutable occurrence/read
  evidence is unchanged.
- **D55-RAC027:** The registered incident/privacy rule explicitly decides whether
  each affected released child has an authorized safe Recent projection; absence
  of that proof hides presentation without deleting audit truth.
- **D55-RAC028:** Source, plan, presentation, task, provider, and audit state
  machines remain separately queryable; no cleanup result is used to infer the
  withdrawal or its commit order.
- **D55-RAC029:** Outbox, cache-invalidation, worker, or Realtime delivery loss
  does not change fence correctness; bounded replay carries identifiers only and
  converges projections without another business effect.
- **D55-RAC030:** A third-party feature flag or deployment control can stop more
  work but tests prove it cannot create/clear the withdrawal or override a
  product-database deny with Allow.
- **D55-RAC031:** An authorized settings load displays one read-only Current
  setting summary with programmatically associated **Selected**, **Status:
  Unavailable for safety**, and **Effective: Off** facts in matching visual/DOM
  order.
- **D55-RAC032:** Adjacent safe copy states all four consequences: Asym stopped
  this timing for safety; no new access-review requests use it; existing
  requests, tasks, and access remain unchanged; and this exact setting will not
  restart.
- **D55-RAC033:** Copy review rejects **paused**, **temporary**, **under review**,
  restoration dates, blame, deadline, access-removal, acknowledgement, or recall
  claims not supported by a separate authoritative fact.
- **D55-RAC034:** The withdrawn selection is absent from selectable radios and is
  represented only in the read-only Current setting; it cannot be submitted by
  changing a disabled control through DOM/API manipulation.
- **D55-RAC035:** The replacement fieldset lists exactly Off plus currently
  activated/selectable profiles, has no preselected option, and leaves Save
  disabled/absent until a user makes a change.
- **D55-RAC036:** Leaving the page without a selection produces zero writes and
  preserves the selected-head/effective-Off state without warning, nag, or
  forced acknowledgement.
- **D55-RAC037:** Explicitly choosing and saving Off creates one ordinary Tenant-
  attributed successor using current authorization and expected-head CAS; the
  platform withdrawal actor is not attributed.
- **D55-RAC038:** Explicitly choosing an alternative re-proves its current
  activation/nonwithdrawn state at Save and publishes one ordinary Tenant-
  attributed successor; stale/unavailable choices fail without substitution.
- **D55-RAC039:** A fence arriving after form load but before Save rejects the
  withdrawn draft, refreshes current truth, gives a concise inline text error,
  and never autosaves Off or another profile.
- **D55-RAC040:** A concurrent Tenant-head change yields a truthful expected-head
  conflict and review flow; neither fence handling nor last-write-wins overwrites
  the other administrator's selection.
- **D55-RAC041:** With no replacement profile, the fieldset contains one usable
  Off option and no empty dropdown, disabled withdrawn card, beta/coming-soon
  content, or mandatory support contact.
- **D55-RAC042:** The initial unavailable state is ordinary semantic content; any
  async Save/success/conflict/status feedback is persistent and programmatically
  announced with the least disruptive appropriate status mechanism.
- **D55-RAC043:** Keyboard-only and screen-reader tests prove logical focus/order,
  visible focus, labels/descriptions, fieldset/legend semantics, error relation,
  and no input-triggered save or focus theft.
- **D55-RAC044:** Reflow/zoom/touch tests at 320 CSS pixels and 400 percent retain
  all facts/actions without two-dimensional scrolling, clipping, overlap, hover
  dependence, or undersized unexcepted targets.
- **D55-RAC045:** Forced-colors, reduced-motion, text-spacing, long-label,
  plural/localization, CJK, RTL, and bidirectional-isolation tests preserve
  meaning and selected/effective distinction without relying on color/icons.
- **D55-RAC046:** Low-bandwidth/offline/reconnect tests require no image,
  animation, Realtime, flag provider, or incident page for comprehension and do
  not allow a stale cached active state to authorize Save/effect.
- **D55-RAC047:** Donor, missionary, public, ordinary staff, requester, holder,
  and coordinator surfaces receive no D55-specific warning, task, notification,
  email, badge, or policy control unless separately authorized by a later
  decision.
- **D55-RAC048:** Tenant reads expose no internal actor, reporter, evidence,
  incident identifier/detail, affected-Tenant count/list, request/person/
  capability/ministry/location/member-care fact, or other Tenant selection.
- **D55-RAC049:** Direct browser grants are absent; application authorization,
  least database grants, enabled RLS, and explicit old/new row protection deny
  cross-Tenant or caller-retargeted head/projection writes.
- **D55-RAC050:** Table-owner, `BYPASSRLS`, service-role, worker, support, repair,
  migration, function/RPC/view, backup, and restore tests prove equivalent domain
  authorization/invariants and cannot clear or bypass the fence.
- **D55-RAC051:** Constraint/error/timing/count/cache/log/export/Realtime tests
  reveal no cross-profile, cross-environment, or cross-Tenant existence oracle;
  immutable violations fail safely and enter one typed repair path.
- **D55-RAC052:** Durable audit proves exact command/profile/environment, trusted
  actor/system purpose, bounded reason, commit/result, and downstream admission/
  suppression history while technical telemetry remains body-free and opaque.
- **D55-RAC053:** Retention, lawful anonymization, export, backup, and disposal
  tests preserve the terminal business fact and decoder while minimizing
  personal attribution/evidence under the approved records schedule.
- **D55-RAC054:** Query/plan/load evidence proves publication work is constant,
  exact fence checks are indexed/bounded, and settings/list query count does not
  grow per Tenant row, request, item, group, recipient, or provider.
- **D55-RAC055:** Production-shaped concurrency establishes and ratifies incident
  commit, ordinary mutation, lock-contention, read, convergence, and recovery
  budgets; any path exceeding them blocks activation rather than weakening the
  fence.
- **D55-RAC056:** Mixed-version tests prove compatible readers/constraints and
  every fence-aware irreversible writer deploy before the emergency command or
  first selectable profile; old writers are denied at the product boundary.
- **D55-RAC057:** Rollback tests retain withdrawal, decoders, pinned source,
  released history, and audit; rolled-back code can only hide/disable more and
  cannot admit or offer the exact withdrawn revision.
- **D55-RAC058:** Backup/PITR/region-failover exercises keep reminder admissions
  globally denied until the recovered control plane proves the latest protected
  safety high-water and cannot resurrect a pre-fence snapshot.
- **D55-RAC059:** Release evidence traces founder D55 → glossary → ADRs → Phase
  12/17/6 → OpenSpec → design/tasks/tickets → schema/RLS → implementation →
  tests/runbook → release/monitors with no contradictory owner/state/term.
- **D55-RAC060:** Before any profile activates, D56 authority is resolved and the
  complete command, authorization, response-loss, audit, monitoring, restore,
  mixed-version, accessibility, privacy, and production-shaped exercise passes;
  any critical failure keeps the feature absent/Off.

## Named release and production monitors

These monitors become applicable only if the complete reminder/profile feature
activates. Until then, any D55 runtime artifact is itself a release defect.

| Signal                                       | Threshold                                                                                                                                                                         | Owner                                        | Required response                                                                                                                                                                                    |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `D55_PREMATURE_ARTIFACT`                     | Any D55 profile/fence row, enum, role, capability, flag, job, metric, route, or UI before the complete activation package                                                         | Phase 12 + Architecture                      | Remove the artifact, preserve unrelated work, rerun absence/trace checks, and block activation until governance closes.                                                                              |
| `D55_UNAUTHORIZED_WITHDRAWAL_SUCCESS`        | Any successful withdrawal without the exact future D56 authority and current application authorization                                                                            | Security + Platform Incident Owner           | Critical incident: freeze the command path, preserve evidence, assess scope, keep the fence (it is subtract-only), repair authorization, and require independent review before successor activation. |
| `D55_WITHDRAWAL_ATTEMPT_OUTSIDE_INCIDENT`    | Any command attempt with no authorized incident/exercise reference                                                                                                                | Security Operations                          | Alert immediately, investigate actor/session and evidence, rotate/revoke affected access if needed, and test the break-glass boundary.                                                               |
| `D55_FENCE_MUTATION_OR_REMOVAL`              | Any update/delete/clear/expiry/reuse of a committed withdrawal or any same revision later evaluated active                                                                        | Phase 12 + Database + Security               | Globally disable reminder admissions, open a critical integrity incident, restore terminal fact from protected evidence, roll forward, and rerun restore/mixed-version corpus.                       |
| `D55_TENANT_HEAD_FANOUT`                     | Any Tenant policy-head/version write caused solely by withdrawal publication                                                                                                      | Phase 12                                     | Stop the writer, quarantine synthetic heads, correct only through governed attribution-preserving repair, and reinstate the O(1) fence path.                                                         |
| `D55_CROSS_SCOPE_WITHDRAWAL`                 | Any withdrawal affects another environment/profile revision or exposes another Tenant/selection                                                                                   | Security + IAM + Phase 12                    | Critical containment/disclosure incident; narrow all reminder effects, repair composite scope/authorization, assess notification duties, and prove negative corpus before re-enable.                 |
| `D55_POST_FENCE_D43_ADMISSION`               | Any D43 episode admitted to the exact withdrawn profile after fence-first commit                                                                                                  | Phase 12 on-call                             | Disable all reminder admission, preserve request truth, mark descendant non-releasable, repair serialization/evaluator, and run full race corpus.                                                    |
| `D55_POST_FENCE_D49_SEAL`                    | Any D49 seal commits for the withdrawn profile after fence-first order                                                                                                            | Phase 12 on-call                             | Stop claims, preserve evidence, prevent all descendants, repair mutation fence, and reconcile every affected occurrence without adding recipients.                                                   |
| `D55_POST_FENCE_LOCAL_RELEASE`               | Any local reminder release commits for the withdrawn profile after fence-first order                                                                                              | Phase 12 + Phase 17                          | End active presentation, preserve audit, contain privacy impact, repair atomic release boundary, and verify list/count/cache convergence.                                                            |
| `D55_POST_FENCE_PROVIDER_IO`                 | Any new provider byte/call begins without a pre-fence committed attempt admission                                                                                                 | Phase 6 + Security                           | Stop adapter, preserve dispatch/outcome evidence, never resend/recall-claim, assess recipient impact, and fix pre-I/O admission proof.                                                               |
| `D55_STALE_STATE_ALLOWED_EFFECT`             | Any cache/replica/flag/worker/browser state overrides a current product-database fence denial                                                                                     | Architecture + affected domain owner         | Activate broader narrowing control, stop affected writer, remove stale authority path, reconcile effects, and add outage/lag regression proof.                                                       |
| `D55_SELECTED_EFFECTIVE_UI_DRIFT`            | Any authorized UI/API shows selected withdrawn revision as active, Off as Tenant-selected without a head, or inconsistent visible/programmatic state                              | Phase 12 + UX + Accessibility                | Disable editing for the affected projection, show safe **Unavailable for safety** status, repair derivation/cache, and rerun semantic/a11y/localization tests.                                       |
| `D55_AUDIT_GAP`                              | Any withdrawal/effect decision lacks exact command, scope, actor/system purpose, reason, commit, result, or lineage evidence                                                      | Security Audit + owning product domain       | Halt new profile activation/effects, recover from product receipts where possible, open incident evidence case, and repair audit atomically.                                                         |
| `D55_PRIVACY_FIELD_LEAK`                     | Any prohibited actor/evidence/incident/Tenant/request/person/capability/ministry/member-care detail appears in Tenant UI, logs, metrics, cache, event, export, or support surface | Privacy + Security + affected owner          | Stop output, contain/purge where lawful, assess disclosure, minimize contract, and add static/runtime leak tests.                                                                                    |
| `D55_MIXED_VERSION_BYPASS`                   | Any deployed writer can admit/release without understanding the current fence contract revision                                                                                   | Release Engineering + Phase 12/17/6          | Halt rollout, globally narrow reminders, roll forward compatible mutation boundaries, and rerun old/new matrix before activation.                                                                    |
| `D55_RESTORE_RESURRECTION`                   | Any restore/failover makes a committed withdrawn revision selectable or effect-admissible                                                                                         | SRE + Database + Security                    | Keep reminder effects globally Off, restore/reconcile protected safety high-water, investigate recovery process, and complete game-day proof before reopen.                                          |
| `D55_QUERY_FANOUT`                           | Any withdrawal command work grows with affected Tenants/work, or fixed-size settings/list/effect processing adds SQL/provider calls per affected row                              | Database + Phase 12                          | Block release/rollback query path, restore exact indexed evaluation/batching, and rerun skewed production-shaped plan tests.                                                                         |
| `D55_ACCESSIBILITY_OR_COMPREHENSION_BLOCKER` | Any critical cohort interprets Effective Off as Tenant-chosen Off, believes existing access changed, cannot identify/operate replacement, or any WCAG 2.2 AA blocker              | UX Research + Accessibility + Access Product | Keep editor unavailable, correct structure/copy, test representative assistive/mobile/international cohorts, and do not activate until passed.                                                       |

Popularity, page views, clicks, individual response time, replacement rate, and
notification engagement are not safety signals and must not become performance
surveillance. Every production threshold above is an invariant breach (one
event) or a mechanically observable positive query slope, not an invented
business success target.

## Ruthless synthesis and ordered path forward

### Must be resolved before D55 is recorded

Resolved by this document:

1. A platform fence and a Tenant head are different authoritative facts.
2. Effective behavior is their subtractive intersection, not a second policy
   write.
3. Withdrawal is terminal for one exact environment/profile revision.
4. Every irreversible boundary checks primary product truth and shares an exact
   race order with publication.
5. D43 request validity, task, access, responsibility, and personal engagement
   remain untouched.
6. Preventable descendants stop; already committed effects remain truthful and
   non-repeatable.
7. Tenant UI shows Selected, Unavailable for safety, and Effective Off
   separately, offers an unselected explicit replacement, and permits safe
   no-action.
8. No mass fanout, generic kill-switch engine, cached flag authority, current
   runtime artifact, or automatic Tenant acknowledgement exists.

### Requirements to carry into spec and design

1. Define the exact canonical glossary terms and amend ADR-0026/0027/0184 plus
   Phase 12/17/6 and OpenSpec with the ownership/intersection invariants.
2. Define one exact-revision terminal withdrawal persistence/command contract,
   semantic receipt, bounded reason/evidence, and shared serialization scope.
3. Register fence-aware D43, D49, local-release, external-attempt, source-end,
   retention/privacy, and provider reconciliation rules in the complete profile
   activation.
4. Specify least grants, application authorization, RLS/privileged parity,
   composite constraints, non-enumeration, retention, audit, and repair.
5. Specify the Base Maia Current setting/replacement/error/success states and
   accessible/mobile/localized behavior exactly enough for outcome tests.
6. Resolve D56 actor/approval governance and any separate incident-
   communications decision before activation.

### Implementation safeguards required

1. TDD at the public policy, D43, D49, local release, provider pre-I/O, settings,
   and recovery seams.
2. One exact profile serialization scope and permanent semantic idempotency.
3. Primary-database deny-first evaluation in every irreversible mutation;
   caches/replicas/flags never authorize.
4. No reversible status or ordinary delete path; successor-only safe return.
5. Readers/constraints/evaluators/writers/runbook before first profile
   selection, with an explicit compatibility gate for old code.
6. O(1) publication, indexed evaluation, bounded projections, and
   production-shaped concurrency/query-plan proof.
7. Manual keyboard/screen-reader/touch/zoom/forced-colors/localization/RTL/
   low-bandwidth proof with representative nonprofit administrators.
8. Restore/failover game day proving global deny until the latest safety high-
   water is reconciled.

### Risks that may be monitored after activation

Only the eighteen named monitors above qualify. Each has a concrete signal,
threshold, owner, and mandatory response. None substitutes for the pre-
activation proof, and no engagement metric is treated as awareness or safety.

## Final disposition

**Accept with required amendments.** Option 1 is modern best practice for Core
only as one terminal exact-profile product guardrail that preserves Tenant-
authored selection, derives effective Off, checks every irreversible boundary
at the primary database, retains truthful history, fails closed, survives
rollback/restore, and presents one calm explicit replacement journey.

Implementing Option 1 as a reversible feature flag, cached configuration,
mass-Tenant write, UI-only disabled choice, worker cancellation, or incident-
system state would be **Reject and replace**.

## D56 — Who may publish the irreversible safety withdrawal?

### Why this needs one founder decision

D55 intentionally creates powerful but subtract-only platform authority. A
wrong withdrawal cannot expose data or grant access, but it can permanently
remove a profile revision for every Tenant and stop useful attention. Requiring
too many people before containment can prolong material harm; allowing an
ordinary administrator, support worker, automation, or unaudited database
operator creates an easily abused global switch.

Concrete example: reviewed evidence shows that one active profile causes a
critical accessibility misunderstanding on Friday night. The designated
responder can reach the command, but a second product approver is unavailable.
Should Core contain immediately and require different-human review afterward,
or wait for that person's approval before containment?

### Option 1 — one dedicated platform safety operator may fence immediately after step-up proof; a different human reviews afterward — recommended

One human with the dedicated platform safety-withdrawal capability, freshly
proved step-up session assurance, an open incident/exercise reference, exact
profile, bounded reason, and consequence review may commit the terminal fence.
The action alerts Security/Product reviewers. A different authorized human must
review the evidence, scope, audit, and response before the incident closes or
any successor profile activates; that reviewer cannot clear the fence.

**Why recommended:** the operation only narrows optional behavior and is
irreversible for the unsafe revision, so fast containment has the better risk
balance. Narrow pre-provisioned authority, immediate visibility, independent
review, rehearsal, and successor-only recovery constrain misuse without making
safety depend on another person's availability. It requires one small command
contract, not an approval engine.

### Option 2 — require a different human's approval before containment

One step-up-proved dedicated operator proposes and a different authorized human
approves before the fence can commit. This provides stronger pre-action
separation of duties but can leave known harm active outside staffed hours,
needs approval availability and expiry/replay semantics, and tends toward a
workflow service. An additional emergency bypass would simply recreate Option
1 less clearly.

### Ruled out — automated monitor withdrawal

A code-owned production signal must never commit withdrawal. Signals may alert,
recommend containment, attach evidence, or invoke the human incident path, but
D47 harms include privacy, comprehension, accessibility, and fatigue evidence
that is not safely reducible to one machine threshold. False positives would
permanently retire a revision, while compromised telemetry could otherwise
exercise global authority.

This D56 branch chooses only human actuation and review ordering. It does not
change D55's terminal semantics, select a safety threshold, authorize automated
withdrawal, choose Tenant communications, choose a replacement, admit external
delivery, name a database/API artifact, or create a generic approval workflow.

**Recommendation: Option 1 — one step-up-proved dedicated platform safety
operator may fence immediately, with automatic alerting and mandatory
different-human post-commit review before incident closure or successor
activation.**

Which authority rule should Core record for D56: **Option 1 — one step-up-proved
dedicated platform safety operator with mandatory different-human post-commit
review**, or **Option 2 — different-human approval before containment**? You may
amend either option.
