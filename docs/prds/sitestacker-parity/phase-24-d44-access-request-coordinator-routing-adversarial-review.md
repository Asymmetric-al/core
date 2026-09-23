# Phase 24 D44 — Optional Access Request Coordinator Routing

**Decision date:** 2026-08-29  
**Founder direction:** Option 1 — a Tenant may name one to three **Access
request coordinators**, and Tasks Hub will not be their only attention path.  
**Scope:** D43 personal responsibility routing only: Tenant policy, coordinator
selection, current recipient resolution, current-work effect, Tasks Hub and
notification seams, UX, authorization, data/RLS, concurrency, rollout, proof,
and the D45 delivery-policy boundary.  
**Method:** `/grill-with-docs`, Core ADR/OpenSpec/current-code review,
first-party IAM/service-management/accessibility research, and the required
22-category adversarial pass.  
**Verification note:** Per founder direction, broad formatting, local-link,
skill-parity, strict OpenSpec, lint, typecheck, unit, build, and
`git diff --check` verification remains deferred until the Grill ends.

## Final disposition

**Accept with required amendments.**

One to three explicit coordinators is a proportionate modern pattern for a
small-to-medium nonprofit Tenant: it gives requests named personal
responsibility without notifying every grant manager, inventing a manager
hierarchy, or making a shared lane somebody else's problem. The exact cap is a
Core v1 product judgment, not a universal external best practice.

The unqualified option is unsafe and brittle if “coordinator” becomes a role,
permission, shared account, generic task assignee, notification group, static
capability snapshot, or sole route to the request. It is accepted only with
these amendments:

- the complete permission-filtered **Access requests** lane remains available
  and actionable independently of any configured coordinator, task,
  notification, email, provider, or worker;
- the policy has exactly `source_lane_only@1` or `named_coordinators`; the named
  mode contains one to three unique, unordered, co-equal same-Tenant Active
  Tenant Assignments and an empty named mode is impossible;
- configuration records responsibility intent only and grants no access,
  capability, source visibility, decision authority, priority, workload,
  availability, delegation, or escalation status;
- an admitted recipient must independently and currently satisfy exact-Tenant,
  exact-request-scope `permissions.manage_grants`, live assignable-capability
  ceiling, Active Tenant Assignment, purpose, floor, and D43/Phase 12 checks;
- the exact requester is excluded from their own personal responsibility
  recipient set, task, required in-product attention, and later external-email
  projection, without changing any
  independently lawful Phase 12 source-lane action authority;
- a complete resolver emits one bounded recipient set, `proved_zero`, or
  `indeterminate`; it never falls back to every admin, original grantor,
  reviewer, group, role, manager, task assignee, or directory owner;
- Tasks Hub is one source-backed responsibility projection and the Phase 17
  staff Notification Center is a second required, independent attention
  projection; both consume the same current D44 recipient generation, neither
  owns routing or request/access truth, and D45 decides only external email;
  reminders require a later separate decision;
- personal routing cannot ship as Tasks-Hub-only attention: a newly created
  request produces one `holder_access_review_requested_v1` item per admitted
  coordinator, while policy/eligibility admission to existing pending work
  produces individual tasks but only one bounded recipient-level
  `access_request_responsibility_updated_v1` item per newly admitted recipient
  and responsibility-application generation;
- a confirmed route save shows a fresh permission-safe aggregate impact and
  applies to all current and future `pending_review` D43 requests; stale,
  partial, timed-out, corrupt, or indeterminate impact writes nothing;
- continuing recipients preserve their task and notification engagement,
  newly admitted recipients receive a fresh responsibility generation, task,
  and required in-product attention, and removed recipients end as **Coordinator
  responsibility changed** without fabricated completion, read, request
  resolution, or access loss;
- source withdrawal, keep/remove, or no-longer-applicable remains the only
  business closure; coordinator edits never mutate D43 request state or the
  grant;
- request and decision explanations, D40 basis, capability/group provenance,
  raw IDs, and protected grant detail are loaded only from Phase 12 after fresh
  authorization and never copied into route, task, notification, delivery,
  search, analytics, log, AI, or workflow payloads; and
- Inngest, if used, is an identifier-only post-commit executor and reconciler,
  never the route resolver, policy store, durable idempotency authority, human
  wait, or notification policy.

These amendments narrow and complete Option 1; they do not replace it.

## Exact corrected decision

> D44 registers the code-owned route contract
> `access.holder_direct_grant_review_responsibility@1` and recipient role
> `access_request_coordinator@1` inside Phase 12 access governance. It routes
> personal responsibility for D43 `holder_direct_grant_review` requests only.
> It is not a general approval team, Website coordinator, recovery coordinator,
> task group, notification list, Phase 12 role, Access group, directory group,
> or Tenant-authored workflow.
>
> Every Tenant has one effective route posture per environment and route
> contract. In the absence of a persisted policy head, the resolver returns the
> code-owned `source_lane_only@1` default without creating Tenant rows. A
> persisted head's mode is exactly:
>
> - `source_lane_only@1` — no personal responsibility recipient is selected; or
> - `named_coordinators` — one to three distinct, unordered, co-equal current
>   same-Tenant staff Active Tenant Assignments are selected.
>
> `source_lane_only@1` is the safe initial/default posture and is never shown as
> **Off**, **Not configured**, **No coverage**, or **Access requests disabled**.
> It means that every pending request remains in the authoritative,
> permission-filtered **Access requests** lane but nobody receives D44 personal
> responsibility. An empty `named_coordinators` policy is invalid; removing the
> final member deliberately selects **Use the shared Access requests lane
> only**.
>
> Selecting a coordinator records only Tenant responsibility intent against
> the exact Active Tenant Assignment. It grants no capability, membership,
> grant scope, visibility, decision authority, task administration, inbox
> access, notification preference, delegation, or source action. Assignment
> end makes the member ineligible immediately; a recreated assignment never
> inherits membership. Multiple grants for one assignment do not duplicate the
> member, and display name, email, profile, Party, role label, job title, or
> task identity never serves as the durable member key.
>
> Route-policy read/write requires a current same-Tenant actor using the
> registered `access.manage_request_responsibility` purpose and current
> Tenant-wide `permissions.manage_grants` administration scope/ceiling. This
> reuses the Phase 12 capability and scope model rather than inventing an
> “Access request coordinator administrator” role. Route-management authority
> neither implies that the actor may decide every request nor makes them a
> coordinator. Coordinator membership neither permits policy editing nor
> supplies grant-decision authority.
>
> A compact **Access request coordinators** summary appears within the existing
> **People & access → Access requests** surface or its established settings
> area. D44 creates no dedicated Responsibility subpage, new top-level
> navigation item, or coordinator dashboard. The summary
> leads with **Every request remains available in Access requests.** The
> lane-only summary says **Shared Access requests lane only**. The named summary
> lists one to three selected people and says **Coordinators receive personal
> responsibility only for requests they already have permission to manage.**
> The action is **Change coordinators**.
>
> Editing uses one responsive shared Base Maia Sheet over the retained settings
> context. The description is **Choose up to 3 people to receive personal
> responsibility when someone asks for an access review. Everyone with
> permission can still review requests in Access requests. Choosing someone
> does not give them access or permission.** A radio group offers **Use the
> shared Access requests lane only** and **Also give specific people personal
> responsibility**. The second choice progressively reveals the shared Base UI
> searchable combobox and semantic selected-person rows.
>
> Search is server-filtered, cancelable, keyset-paginated, and scoped to visible
> same-Tenant current staff Active Tenant Assignments that independently and
> currently satisfy D43 grant-decision eligibility in at least one live Tenant
> scope, `permissions.manage_grants`, live ceiling, floor, and route-recipient
> purpose. Safe result copy says **Can currently review access requests**; the
> persistent helper says **They receive only requests they have permission to
> manage.** An unqualified, inactive, ended, recreated,
> incompatible, hidden, or cross-Tenant assignment cannot be newly selected.
> A previously configured member who later loses eligibility remains visible
> to an authorized route manager as **Not currently eligible** and receives no
> task or attention. Regaining eligibility is re-proved and may admit the
> member through a differential successor; configuration never restores
> authority.
>
> Members are unordered and co-equal. The editor has no primary/backup, owner,
> rank, drag order, round-robin, percentage, schedule, availability, out-of-
> office, workload, escalation, manager, team/group, select-all, or fourth-
> member control. Duplicate and fourth selection are prevented in the UI and
> atomically rejected by the server. At three, Add is unavailable and persistent
> copy explains that three is the current maximum. The ordinary action is
> **Save coordinators**; no typed confirmation or wizard is required.
>
> Before save, the server computes a fresh permission-safe impact against the
> expected current route head, Tenant authorization epoch, complete current
> `pending_review` census/head, and proposed canonical member-set digest. The
> UI shows only authorized aggregate counts: current open requests, personal
> responsibilities continuing, newly assigned, no longer assigned, and open
> requests remaining shared-lane-only. It
> never reveals hidden subjects, capabilities, explanations, coordinator
> access failures, or per-person workload. The confirmation says **This updates
> personal responsibility for open and future requests. Access and request
> decisions do not change.**
>
> Save re-resolves the same inputs in one authoritative transaction. Any stale,
> partial, timed-out, contradictory, corrupt, over-limit, or indeterminate
> impact writes no policy revision, audit, reconciliation intent, task,
> notification, or engagement state and asks the actor to refresh. A successful
> command appends one immutable route revision/audit/semantic receipt, makes it
> the current policy at one trusted cutover, and writes one identifier-only
> current-request reconciliation intent. The policy is immediately
> authoritative for all current and future pending requests. Removed members
> fail current personal-presentation checks immediately; projection cleanup
> lag cannot preserve visibility or action.
>
> D44 creates no separate current-work application screen or business-work
> aggregate. Unlike D35/D36 Website responsibility, D44 changes only reversible
> personal presentation over an unchanged D43 source and already shows the
> complete aggregate consequence before the one save. The durable policy head,
> trusted cutover, outbox intent, product claims, and projection convergence are
> sufficient. This difference is explicit and is not inferred by copying or
> rejecting another domain's semantics by convention.
>
> Reconciliation enumerates authoritative D43 current heads at the cutover and
> applies the current policy through product-owned claims. Requests created
> after the cutover resolve against the new policy on creation. Requests that
> become terminal before reconciliation produce no new responsibility. This is
> a routing/projection update, not a D43 source transition or one unbounded
> grant transaction; the source lane remains complete while personal
> projections converge. Reconciliation is repeatable from policy/request
> heads, and no manually maintained affected-request list becomes a second
> source of truth.
>
> For each current D43 request, the bounded resolver loads the complete current
> policy members and independently re-proves each candidate's same-Tenant
> Active Tenant Assignment, exact request scope, registered decision purpose,
> current `permissions.manage_grants`, live assignable-capability ceiling,
> Phase 12 floor, D42/D43 field access, and requester identity. The exact
> subject assignment and every configured assignment currently resolving to the
> authenticated requester principal are removed from the personal recipient
> set through trusted identity relationships, never email or display-name
> matching. This exclusion prevents
> a useless and confusing self-task/alert; it does not override Phase 12 if that
> person independently may act from the shared source lane.
>
> A complete resolver returns exactly one algebraic result:
>
> - `released(recipient_set, basis)` — the complete unique eligible subset of
>   the one-to-three configured assignments after requester exclusion;
> - `proved_zero(basis)` — complete proof found no eligible non-requester
>   member; or
> - `indeterminate(reason)` — any required policy, membership, request,
>   assignment, authorization, scope/ceiling, floor, requester, or source fact
>   could not be proved completely.
>
> A complete result may lawfully release one or two eligible members when other
> configured members are proved ineligible; that is not a partial resolver.
> `proved_zero` and `indeterminate` release nobody. Neither falls back to all
> grant managers, Owner/Admin, the original grantor, an auditor, a read-only
> reviewer, Website/Mobilize coordinators, a directory manager, a team/group,
> prior recipient, task assignee, support operator, AI choice, or service role.
> The shared source lane remains accurate and available.
>
> D44 coordinator identity remains the exact Active Tenant Assignment. Before
> Phase 17 projection, a trusted server resolver maps that admitted assignment
> to the exact current same-Tenant Party, registered recipient role, and staff
> surface required by ADR-0027. It never maps by stored profile ID, email,
> display name, prior Party, or client input. An absent, ambiguous, cross-Tenant,
> multi-hat, wrong-surface, or stale mapping releases no item and cannot widen
> the D44 set; task and source-lane behavior remain independently truthful.
>
> Each current request has one immutable recipient-generation lineage derived
> from the request/source head, current route revision, current authorization
> basis, requester exclusion, recipient-set digest, and generation number.
> Policy/source/assignment/eligibility/authorization changes trigger current
> re-evaluation, but a differential successor is appended only when the
> canonical effective recipient set or another responsibility semantic fact
> actually changes. An unrelated Tenant authorization-epoch change with the
> same effective set creates no generation, task, bell item, unread state, or
> audit noise. History never mutates or reopens.
> Continuing recipients preserve task assignment and personal engagement,
> newly admitted recipients alone receive a fresh personal assignment and
> required in-product attention, and removed recipients end with **Coordinator
> responsibility changed**. Removal never fabricates Completed, Read,
> Dismissed, request resolved, source ended, access revoked, or grant removed.
>
> One D43 request remains one source-work occurrence and has at most one shared
> ADR-0183 task identity. Each admitted coordinator receives at most one
> recipient-specific assignment/engagement projection for the current
> generation. Team/source counts count the request once rather than once per
> coordinator. The safe row is **Review current access request** with a
> code-owned safe subject/capability label only when current authorization
> permits it. It opens the exact Phase 12 source detail. There is no generic
> Complete, Claim, Reassign, Dismiss, Delete, Snooze, Due date, Comment, bulk,
> drag-to-Done, import, support, AI, or task-assignee mutation.
>
> Tasks Hub is not the only attention surface. The same D44 recipient generation
> is the sole eligible-recipient input to both the ADR-0183 task adapter and the
> required ADR-0027/Phase 17 staff Notification Center adapter. A newly created
> D43 request gives each admitted coordinator one recipient-specific item with
> key `holder_access_review_requested_v1` and policy
> `presentation.source_actionable_then_recent_90d@1`. Its safe title is
> **Access review needs attention** and its only action is the typed deep link
> **Review in People & access**. It contains no inline Keep/Remove action and no
> protected reason, provenance, capability, group, or authority preview.
>
> A policy or eligibility change may newly admit one coordinator to one or more
> already-pending requests. The source appends a responsibility-application
> generation that pins the route revision, current eligibility/authorization
> basis, admission cause, and recipient-specific sealed child set. Tasks Hub
> still creates/reconciles the individual request assignments needed for durable
> work, but Phase 17 creates exactly one recipient-level occurrence per
> responsibility-application generation and recipient with key
> `access_request_responsibility_updated_v1`, safe title **Access review
> responsibilities updated**, an authorized aggregate request count, and one
> typed link to the filtered Access requests lane. It includes no request list,
> subject, capability, body, sibling, or qualification detail. Continuing
> recipients get no new item; removed recipients get no item. A new request
> after cutover uses the per-request key. This bounded grouping prevents a bell
> storm without merging task identities or source history. Its immutable child
> membership/end proof references only the admitted D43 request identities. It
> remains source-actionable only while at least one admitted child request is
> still current for that recipient; a child end updates the aggregate without
> fabricating engagement or changing any sibling source.
>
> D44 defines who bears personal responsibility and requires this in-product
> attention. D45 must decide only whether and how external email accompanies
> the initial in-product item, its preference/mandatory behavior, safe envelope,
> delivery timing, and failure copy. Any reminder requires a later separate
> decision.
> Task and notification
> projections have separate identities, engagement, delivery receipts,
> retries, and end rules, but may share only the causal request and current D44
> recipient-generation references. D45 applies independently to the per-request
> item and the single grouped responsibility-update item; it can never turn a
> backlog adoption into one email per child request.
>
> No personal D44 activation may ship as Tasks-Hub-only attention or invent a
> default external channel or reminder before its governing decision. The in-product key, manifest,
> source-applicability/end predicate, current-authorization checks, task
> correlation, and accessibility proof must be Live before personal routing
> activates. External delivery remains Reserved until D45. The authoritative
> Access requests lane does not wait for D44 or D45.
>
> D43 remains the sole owner of request lifecycle and source actionability.
> For `resolved_kept` or `resolved_removed`, Tasks Hub projects its typed
> **Completed in People & access** result; for `withdrawn` or
> `no_longer_applicable`, Tasks Hub projects **No longer required**. Separately,
> the Phase 17 item leaves active/Needs attention on the truthful D43 source end
> and follows `presentation.source_actionable_then_recent_90d@1` recent-history
> semantics. A policy/member/eligibility change ends only that recipient's responsibility
> generation. Reading, notification delivery, email bounce, task interaction,
> coordinator removal, or route save cannot keep, remove, withdraw, resolve,
> reopen, or extend the request and cannot mutate any grant or authorization
> epoch.
>
> Route policy, members, resolver basis, recipient generations, task rows,
> notification rows, delivery records, and workflow events contain no D43
> request or keep explanation, D40 reason/basis, group/capability provenance,
> raw audit body, hidden subject detail, or recipient qualification failure.
> Protected detail is fetched from Phase 12 only after fresh current purpose,
> floor, field, and source checks. No task/notification/search/log/analytics/AI/
> export copy becomes a write or read authority.
>
> Policy and generation relations carry `tenant_id NOT NULL`; composite
> same-Tenant foreign keys bind the current Tenant, route revision, member
> Active Tenant Assignment, request occurrence, recipient assignment, and
> projection. Partial uniqueness enforces one current policy head and one
> current recipient assignment per exact request/assignment/role. Closed-mode,
> one-to-three-member, requester-exclusion, monotonic-generation, immutable-
> history, and non-cascade rules are structural where PostgreSQL can enforce
> them and command-locked with postconditions where it cannot.
>
> The caller may submit only the expected route head, proposed assignment
> locators, current impact token/digest, and opaque semantic command key. The
> server derives Tenant, actor, route kind/version, membership identity,
> recipient role, timestamps, current/request heads, authorization basis,
> audit attribution, and cutover. Base relations have browser writes revoked;
> hardened server commands use `ENABLE`/`FORCE RLS`, correct `USING` and `WITH
CHECK`, pinned `search_path`, explicit execute grants, and owner/service/
> `BYPASSRLS`/worker/support parity. An allowed update cannot retarget a member,
> route, request, or recipient across Tenant or assignment boundaries.
>
> Inngest may optionally execute identifier-only projection/reconciliation
> after the product transaction using the workflow dispatch ledger and product
> work claims. It re-resolves current policy, request, recipient, and
> authorization at fire time. Inngest event/function deduplication, run state,
> waits, sleeps, concurrency, or delivery result never owns policy identity,
> recipient membership, route generation, product idempotency, task,
> notification, request, access, or decision truth.
>
> D44 adds no generic workflow engine, access-request team role, manager
> hierarchy, round-robin queue, on-call schedule, delegation framework,
> automatic fallback, task-completion authority, SLA, due date, reminder,
> escalation, email/SMS/push channel, protected-text copy, AI routing, or
> external IAM dependency. D44 itself completes the non-Tasks-Hub in-product
> attention contract; D45 alone gates external email, and reminders remain absent.

## Evidence classification and modern-practice resolution

### Verified repository facts

- Phase 12 and ADR-0184 already reserve D44 only for personal routing among
  current exact-scope `permissions.manage_grants` holders. They explicitly keep
  D43 lifecycle, lane, actions, evidence, and closure outside D44.
- ADR-0183 makes Tasks Hub a presentation/coordination projection over
  source-owned work. Generic task mutation cannot decide a D43 request.
- ADR-0027 separates producer/source state, recipient-specific notification
  presentation, personal engagement, and channel delivery. Email and in-product
  steps are independently authorized.
- The current `/tasks` prototype includes generic mutable assignee/completion/
  delete behavior and hard-coded identities; it is migration input, not D44
  authority.
- The current staff bell in
  `packages/ui/components/shadcn-studio/blocks/dropdown-notification.tsx`, wired
  by `apps/admin/app/mc-shell.tsx`, is hard-coded demonstration content (`8
New`, fake avatars/actions). Its shell button is 32 CSS pixels (`size-8`),
  below this decision's 44-pixel important-target contract. It proves neither
  Phase 17 current-source semantics nor D44 authorization, counts, reflow, or
  accessibility and is not the implementation precedent.
- Current contribution approval notifications copy finance-specific request/
  task concepts, use profile/role-oriented approver selection, mutable domain
  settings, SLA/reminder/escalation, and delivery tables. They are not a
  reusable D43/D44 lifecycle, recipient, Phase 17, or channel contract.

### Verified current external evidence

- Microsoft Entra access reviews support specifically selected reviewers,
  resource owners, managers, self-reviewers, and designated fallback reviewers.
  This proves explicit human responsibility is a current governance pattern,
  but it does not prove manager/fallback semantics or a three-person cap for
  Core. [Plan an Entra access-review deployment](https://learn.microsoft.com/en-us/entra/id-governance/deploy-access-reviews)
- Microsoft lets administrators select one or more specific reviewers and
  separately configures email notifications, reminders, duration, and
  no-response behavior. That separation supports D44/D45 boundaries; Core does
  not import automatic remove, recommendations, multi-stage review, or timeout.
  [Create an Entra access review](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)
- Okta distinguishes request assignees, approval-task assignees, request state,
  and delivery through email, Slack, or Teams. It also excludes a requester or
  delegate from some assignment paths. Core adopts separation and self-recipient
  avoidance, not Okta's mutable team/escalation/chat/60-day workflow.
  [Okta manage requests](https://help.okta.com/en-us/content/topics/identity-governance/access-requests/manage-requests.htm),
  [manage tasks](https://help.okta.com/en-us/content/topics/identity-governance/access-requests/manage-tasks.htm),
  [access-request notifications](https://help.okta.com/en-us/content/topics/identity-governance/notifications.htm)
- Jira Service Management separates a shared queue, assignee, watchers/internal
  notifications, and customer notifications. Core adopts shared-lane plus
  personal responsibility plus separate attention channels, but rejects its
  generic queue bulk mutation as source authority.
  [Jira Service Management queues](https://support.atlassian.com/jira-service-management-cloud/docs/manage-your-incoming-requests-with-queues/),
  [request notifications](https://support.atlassian.com/jira-service-management-cloud/docs/what-notifications-do-my-customers-and-service-desk-team-receive/)
- NIST least-privilege guidance requires privileged functions to be restricted
  to authorized personnel, prevents non-privileged execution, and calls for
  review/reassignment or removal of unnecessary privileges. It supports the
  independent current-authority intersection and audit, not a coordinator-
  grants-authority shortcut. [NIST SP 800-171 Rev. 3](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/800-171r3/NIST.SP.800-171r3.html)
- WCAG 2.2 and W3C form guidance require programmatic names/instructions,
  identifiable errors, status announcements, visible focus, and reflow. They
  support the concise Base Maia settings/editor contract.
  [WCAG 2.2](https://www.w3.org/TR/WCAG22/),
  [W3C form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)

### Product judgments and unresolved empirical facts

- **Product judgment:** one to three co-equal people balances explicit
  accountability, small-ministry administration, and notification noise better
  than all eligible grant managers.
- **Product judgment:** current pending requests adopt a newly confirmed route
  because coordinator responsibility is non-authorizing and reversible;
  prospective-only routing would strand work after turnover.
- **Product judgment:** the requester receives no personal review task/alert for
  their own request, while ordinary Phase 12 authorization remains untouched.
- **Unknown:** no evidence proves that three is the correct maximum for every
  Tenant, how frequently coordinators change, which non-task channel users
  prefer, or whether coordinator personal attention measurably improves
  decision time.
- **Evidence needed:** pilot comprehension/usability results, fourth-person
  attempts, proved-zero/indeterminate rates, pending-age distribution,
  projection/delivery reliability, per-channel engagement, and representative
  ministry interviews. These measurements may justify a versioned later change;
  they cannot silently relax v1.

## Current behavior, intended behavior, and permanent path

| Area                   | Current repository behavior                                                                                                                                                                 | Intended prior contract                                                                      | D44 permanent path                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Access-request routing | No shipped D44 runtime or current route policy.                                                                                                                                             | D43 leaves personal routing to D44; source lane always works.                                | One Phase 12 Tenant route with optional one-to-three assignment members and exact authority intersection.                 |
| Tasks                  | Generic current task UI exposes mutable assignee/completion/delete and seed identities.                                                                                                     | ADR-0183 requires source-backed task projection.                                             | One shared request task identity with recipient generations; no generic mutation.                                         |
| Notifications          | The mc-shell bell currently renders a hard-coded demo dropdown (`8 New`, fake avatars/actions); contribution approval notification tables are finance/profile/SLA-specific migration input. | ADR-0027 defines independent source-actionable in-product attention; D43 creates no channel. | D44 registers the required Phase 17 item from the current recipient generation; D45 decides external email only.          |
| Authorization          | Current broad roles and service paths cannot prove D44.                                                                                                                                     | Phase 12 exact `permissions.manage_grants` scope/ceiling and floor.                          | Configuration never grants authority; every recipient/read/action re-proves current authority.                            |
| Current-work effect    | No runtime behavior.                                                                                                                                                                        | D35/D36 handle a different Website source and cannot be copied by convention.                | Fresh aggregate preview; confirmed route applies to all current/future pending D43 requests with differential projection. |
| Async execution        | Inngest exists for durable executor work.                                                                                                                                                   | Workflow OpenSpec keeps product state authoritative.                                         | Identifier-only optional executor over product policy, claims, and reconciliation.                                        |

## Domain model, ownership, and invariants

### Canonical terms

- **Access request coordinator:** one selected Active Tenant Assignment that
  expresses personal responsibility intent for eligible D43 requests. It is
  not a permission, role, approver, owner, manager, or notification group.
- **Access-request responsibility policy:** the current Tenant-wide closed-mode
  policy that selects lane-only or one-to-three coordinator assignments.
- **Responsibility recipient generation:** immutable evidence of the complete
  eligible non-requester coordinator set for one current D43 request and one
  policy/authorization basis.
- **Access requests lane:** the complete permission-filtered Phase 12 source
  view. It is not a task queue or notification inbox.

### Ownership matrix

| Fact                                    | Authority                                      | Derived consumers                              | Never authoritative                             |
| --------------------------------------- | ---------------------------------------------- | ---------------------------------------------- | ----------------------------------------------- |
| D43 request state/actionability/outcome | Phase 12 `permission_change_request` aggregate | lane, holder history, task/attention adapters  | route, task, notification, worker               |
| Direct grant and EffectiveAccess        | Phase 12 grant/resolver                        | reviewer consequence and D43 receipt           | coordinator, task, notification                 |
| Current coordinator intent              | D44 policy head/member revisions               | recipient resolver and settings summary        | selected person's current capability snapshot   |
| Current personal recipient set          | D44 complete recipient generation              | ADR-0183 task and ADR-0027/D45 adapters        | each adapter's local recipient query            |
| Task identity/recipient engagement      | Tasks Hub                                      | My tasks/list/counts                           | request, route, access, notification engagement |
| In-product notification/engagement      | ADR-0027 and D44 item key/recipient generation | bell/inbox/Recent                              | task, request, route, access                    |
| External channel preference/delivery    | D45/communication owner                        | email and any later approved external delivery | recipient eligibility or source outcome         |
| Execution/retry                         | workflow dispatch ledger and product claims    | operational telemetry                          | policy, recipient, request, access, decision    |

### Smallest durable persistence

1. **Responsibility policy revision**
   - `tenant_id`, environment, route-kind/version, monotonic revision,
     predecessor, closed mode, canonical member-set digest, trusted cutover,
     trusted actor/time, aggregate impact counts/digest, semantic command key,
     and audit/receipt references;
   - at most one partial-unique persisted current head per Tenant/environment/
     route kind; absence resolves to the code-owned lane-only default;
   - immutable after insertion and never hard-deleted during ordinary lifecycle.
2. **Policy member revision**
   - same Tenant/policy revision plus exact Active Tenant Assignment;
   - unique assignment per revision, zero members in lane-only and one-to-three
     in named mode; no order, priority, email, profile, copied capability, or
     current-eligibility snapshot as authority.
3. **Responsibility recipient generation**
   - same Tenant/D43 request, monotonic generation/predecessor, current source
     head, policy revision, authorization-basis digest, requester-exclusion
     evidence, canonical effective-recipient-set digest, trusted cause/time,
     and typed current/end reason;
   - one partial-unique current generation per request/recipient role;
   - re-evaluation with identical semantics is a no-op.
4. **Generation recipient member**
   - same Tenant/generation plus admitted Active Tenant Assignment;
   - unique recipient per generation; stores no ineligible-candidate reason or
     protected request body.
5. **Projection identities and receipts**
   - ADR-0183 owns task occurrence/recipient assignment/engagement;
   - Phase 17 owns per-request item, grouped update occurrence/immutable child
     references, Party-role-surface presentation, and engagement;
   - D45 owns external email preference/delivery evidence;
   - all reference D44/source identities without copying policy or source truth.
6. **Existing product outbox/dispatch and claims**
   - policy save writes one identifier-only reconciliation intent in the same
     transaction; adapters claim/retry/reconcile independently;
   - no D44-local job queue, timer, or Inngest run table becomes product truth.

PostgreSQL checks enforce closed modes and local cardinality; a command-held
Tenant advisory lock plus postcondition enforces cross-row member cardinality,
one-head succession, and all-before-any impact reproof. Foreign keys are
same-Tenant and restrictive rather than cascading across security history.

### Invariants

1. Every pending D43 request remains discoverable in the authorized source lane.
2. D44 absence, zero members, proved zero, indeterminacy, or outage never hides
   or mutates the request.
3. One effective policy exists per Tenant/environment/route contract; at most
   one persisted current head exists, and absence resolves to the code-owned
   lane-only default.
4. `source_lane_only@1` has zero members; `named_coordinators` has one to three.
5. Members are unique, unordered, co-equal exact Active Tenant Assignments.
6. Configuration grants no authority; recipient admission requires complete
   current per-request authorization.
7. The requester never receives their own personal responsibility projection.
8. Requester exclusion never alters separately lawful source-lane authority.
9. One request has one shared task identity and one current recipient generation.
10. Tasks and notifications consume the same recipient generation and cannot
    independently widen it.
11. Continuing engagement is conserved; new recipients alone get fresh
    engagement; removed recipients never receive fabricated completion/read.
12. Route change never mutates D43 source state, grant state, or authorization epoch.
13. Only D43 source receipts end business actionability.
14. No protected request/grant text or provenance is copied to routing,
    projection, delivery, workflow, logs, search, analytics, or AI.
15. A current policy change applies to all current and future pending requests;
    stale/indeterminate impact commits nothing.
16. Product heads, constraints, semantic receipts, and claims—not transport
    dedupe—own concurrency and replay safety.
17. Assignment end is adverse immediately; assignment recreation never inherits.
18. Cross-Tenant route, member, request, recipient, task, or notification edges
    are impossible at both application and database boundaries.
19. Phase 17 Party/role/surface recipients derive through a trusted current
    same-Tenant mapping from the exact admitted Active Tenant Assignment and
    can never widen the D44 set.

## State, temporal, concurrency, and failure model

### Closed policy and resolver states

| Object               | States/results                                                  | Valid transitions                                         | Forbidden meaning                                         |
| -------------------- | --------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| Policy head          | `source_lane_only@1`, `named_coordinators`                      | expected-head successor save                              | delete, empty named, fourth member, ordered/priority mode |
| Resolver             | `released`, `proved_zero`, `indeterminate`                      | recompute from current heads                              | unknown-as-zero, partial release, fallback/broadcast      |
| Recipient generation | current, superseded                                             | differential successor                                    | mutation/reopen of history                                |
| Recipient projection | active, ended-source, ended-responsibility, ended-authorization | source receipt or current generation/authorization change | generic completion/read as source outcome                 |
| D43 request          | D43's five states only                                          | D43 commands only                                         | route/task/notification transition                        |

### Save and reconciliation sequence

1. Load policy editor from the current authorized policy head.
2. Canonicalize the proposed assignment set and obtain a fresh permission-safe
   aggregate impact token/counts against the current pending-request census.
3. Show continuing/new/no-longer-assigned and shared-lane-only counts plus an
   explicit no-access-change consequence.
4. On confirmation, reauthorize and re-prove policy, assignments, epoch,
   pending census, and impact digest. Any mismatch writes nothing.
5. Commit one policy successor, audit, semantic receipt, trusted cutover, and
   identifier-only reconciliation intent.
6. Enforce current route at read time immediately; removed recipients lose
   personal presentation adverse-first.
7. Product claims reconcile current pending requests differentially. Continuing
   recipient engagement survives, new recipients get a fresh generation, and
   removed recipients end as responsibility changed.
8. New requests after cutover resolve against the new policy at source commit.
9. A source request that becomes terminal wins; reconciliation closes/skips
   projection and cannot revive it.

### Race outcomes

| Race                                              | Required result                                                                 |
| ------------------------------------------------- | ------------------------------------------------------------------------------- |
| two route managers save same head                 | first expected-head successor wins; loser refreshes                             |
| response lost after save                          | same semantic key returns the committed receipt/head                            |
| same key, changed member set                      | conflict; original receipt remains                                              |
| request created during save                       | trusted cutover chooses exactly old or new current policy; never both           |
| request resolves during reconcile                 | terminal D43 head wins; no new active recipient projection                      |
| coordinator loses permission during projection    | fire/read-time reproof suppresses/ends personal presentation                    |
| requester becomes coordinator                     | excluded only for their own request; other eligible requests unaffected         |
| member assignment ends and is recreated           | old member ends; new assignment is not inferred or inherited                    |
| task succeeds, notification fails                 | task remains a projection; notification retries independently; source unchanged |
| notification succeeds, task fails                 | attention remains truthful; task reconciles independently; source unchanged     |
| Tasks Hub and notification disagree on recipients | block/widen neither; rebuild both from the same current generation              |

## UX/UI contract

### Settings summary

```text
Access request coordinators

Every request remains available in Access requests.

Shared Access requests lane only                         [Change coordinators]
```

Named posture:

```text
Access request coordinators

Every request remains available in Access requests.

Ana Silva · Jo Mensah
Coordinators receive personal responsibility only for requests they
already have permission to manage.                       [Change coordinators]
```

### Responsive editor

```text
Access request coordinators

Choose up to 3 people to receive personal responsibility when someone
asks for an access review. Everyone with permission can still review
requests in Access requests. Choosing someone does not give them access
or permission.

○ Use the shared Access requests lane only
  No one receives personal responsibility.

● Also give specific people personal responsibility
  [Search people...]
  They receive only requests they have permission to manage.

Ana Silva                                                     [Remove Ana Silva]
Jo Mensah                                                     [Remove Jo Mensah]

[Cancel]                                             [Review changes]
```

### Consequence review

```text
Review coordinator changes

This updates personal responsibility for open and future requests.
Access and request decisions do not change.

Open requests                         8
Personal responsibility continuing   5
Newly assigned                        2
No longer assigned                    3
Remaining in the shared lane only     1

[Back]                                             [Save coordinators]
```

Counts are aggregate, freshly authorized, and derived from the same complete
impact proof used by the command. A request with two coordinators contributes
two personal responsibilities, while the lane-only count counts a request once;
the UI explains those units without exposing a person/request matrix. Zero,
loading, no-access, stale, and
indeterminate are distinct. The save button stays unavailable until a complete
current proof exists. A changed head keeps user input, presents **Review the
updated impact**, and moves focus to the status message.

### Coordinator experience

The personal Tasks Hub row is compact and source-led:

```text
People & access · Review current access

Review current access request
Jordan Lee · Website publishing

You are one of this organization's access request coordinators. The
request can be decided only with your current grant-management permission.

[Review in People & access]
```

It does not display the request explanation, D40 reason, group names, other
coordinator names, sibling read state, or a generic completion control. The
source detail may safely say **Other coordinators may also review this
request** without listing them.

The separate Phase 17 item is equally restrained:

```text
People & access

Access review needs attention
An access request is ready for review.

[Review in People & access]
```

When a route change admits the coordinator to existing pending work, the one
bounded update instead reads:

```text
People & access

Access review responsibilities updated
You were assigned 3 existing access requests.

[View Access requests]
```

The past-tense count remains truthful as children resolve; the source-backed
Needs-attention state, not the frozen initial number, expresses current work.
It is source-actionable rather than dismissible or archivable while current.
It has no inline Keep/Remove controls, protected reason/provenance/capability
preview, task checkbox, peer names, or delivery promise. Reading it changes
only that recipient's notification engagement and does not read or complete
the task. D45 decides external email; a later decision would be required for
reminders.

### Accessibility and field conditions

- Use shared `@asym/ui` Base UI/Base Maia Card, RadioGroup, Combobox, selected
  rows, Badge, Button, Sheet, Dialog only for consequential final-member
  removal, status, Skeleton, and responsive list/table primitives.
- Use semantic headings, groups, labels, descriptions, values, buttons, and
  programmatic status/error announcements. Do not nest interactive controls
  inside a clickable row.
- Preserve logical DOM/visual/focus order, visible unobscured focus, Escape and
  return focus, 44-by-44 important targets, arrow-key radio behavior,
  combobox search/selection, and persistent non-toast-only save outcomes.
- At 320 CSS pixels and 400% zoom, reflow without two-dimensional scrolling.
  Support long international names, Unicode/CJK/RTL/bidi isolation, localized
  plurals, forced colors, text spacing, reduced motion, mobile safe areas,
  magnification, and virtual keyboards.
- Low-bandwidth operation is text-first. Search is cancelable/paginated;
  unsaved edits stay local; no offline or optimistic save is represented as
  authoritative; response loss recovers by semantic receipt.

## Normative requirements

1. **D44-R1 — Lane independence.** Every current D43 request remains in the
   complete authorized Access requests lane regardless of D44/D45/projection.
2. **D44-R2 — Exact purpose.** D44 routes only personal responsibility for
   `holder_direct_grant_review` through a code-owned versioned route kind.
3. **D44-R3 — Closed optional modes.** Policy is exactly lane-only or one-to-
   three named coordinators; named-empty is impossible.
4. **D44-R4 — Exact member identity.** Members are unique, unordered, co-equal
   same-Tenant Active Tenant Assignments; recreation never inherits.
5. **D44-R5 — Responsibility is not permission.** Configuration grants no
   read, action, access, capability, role, delegation, or channel preference.
6. **D44-R6 — Route-manager authorization.** Policy read/write uses a
   registered purpose plus current Tenant-wide `permissions.manage_grants`
   administration scope/ceiling and trusted actor context.
7. **D44-R7 — Current recipient eligibility.** Every personal recipient
   independently passes exact current request-scope Phase 12 authorization.
8. **D44-R8 — Requester exclusion.** The exact requester receives no personal
   task/attention for their own request; source-lane authority is unchanged.
9. **D44-R9 — Complete resolver.** The resolver emits a complete released set,
   proved zero, or indeterminate with current basis evidence.
10. **D44-R10 — No fallback.** Zero/unknown never broadcasts or guesses a
    recipient; the source lane remains.
11. **D44-R11 — One recipient generation.** Task and notification adapters
    consume the same immutable current D44 recipient generation; Phase 17
    identity is a trusted narrowing mapping, never a second recipient resolver.
12. **D44-R12 — One task projection.** One source occurrence has one shared
    task identity with at most one current recipient assignment per member.
13. **D44-R13 — Required independent in-product attention.** D44 requires one
    recipient-specific `holder_access_review_requested_v1` item for each newly
    created admitted request. Admission to existing pending work creates
    individual tasks plus one bounded responsibility-update item per recipient
    and responsibility-application generation, not one bell item per request.
    D45 owns external email; a later
    decision owns reminders. Tasks-Hub-only activation is forbidden.
14. **D44-R14 — Data minimization.** Protected D43/D40/grant text and
    provenance never enter routing, task, notification, workflow, or analytics.
15. **D44-R15 — Source-owned closure.** D43 receipts alone end business work;
    route/task/engagement/delivery never decides it.
16. **D44-R16 — Current-work adoption.** A confirmed fresh policy save governs
    all current and future pending requests; stale/indeterminate impact writes nothing.
17. **D44-R17 — Differential generations.** Continuing recipients preserve
    engagement; new recipients get fresh responsibility; removed recipients
    end as Coordinator responsibility changed. Re-evaluation with an identical
    effective set creates no successor or fresh attention.
18. **D44-R18 — Personal engagement.** Read/unread/task engagement is per
    recipient and never shared, transferred, or used as source truth.
19. **D44-R19 — Source first wins.** A request terminal head wins every race
    and cannot be revived by policy, projection, retry, or eligibility change.
20. **D44-R20 — Reproof everywhere.** List, count, detail, settings, resolver,
    projection, notification, and action paths re-prove current Tenant/purpose.
21. **D44-R21 — Concurrency/idempotency.** Expected heads, canonical set
    digest, trusted cutover, semantic receipt, and product claims own replay.
22. **D44-R22 — Structural integrity.** Composite Tenant keys, closed checks,
    partial uniqueness, immutable generations, and restrictive deletion apply.
23. **D44-R23 — RLS and privileged parity.** Browser base writes are revoked;
    forced RLS, `USING`/`WITH CHECK`, hardened commands, and privileged paths
    preserve identical boundaries.
24. **D44-R24 — Consequence-led UX.** Base Maia settings explain lane,
    responsibility, permission, current impact, and delivery boundary without IAM jargon.
25. **D44-R25 — Accessible resilient UX.** Keyboard, screen reader, focus,
    zoom/reflow, localization, mobile, weak-network, and response-loss states
    are release requirements.
26. **D44-R26 — Independent recovery.** Source, policy, task, notification, and
    delivery failures reconcile independently; no manual DB repair is normal.
27. **D44-R27 — Optional executor.** Inngest receives identifiers only and owns
    no policy, recipients, human state, idempotency, channel, or authorization.
28. **D44-R28 — Additive rollout/rollback.** Reader/deny/schema first, shadow
    resolution, in-product manifest, canary, external-email gate, kill switch,
    and roll-forward history apply.
29. **D44-R29 — Humane observability.** Monitor product health and privacy;
    never rank coordinators or infer performance/availability from engagement.
30. **D44-R30 — Evidence-bound v1.** The cap, UI, and route remain versioned;
    later widening requires evidence and a new explicit decision.

## Ruthless 22-category adversarial review

Severity and likelihood assess the unmitigated concern in a plausible
implementation, not the corrected contract after its safeguards.

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.**

| What could go wrong                                                                                                                                                              | Why it matters                                                                     | Severity / likelihood | Evidence or reasoning                                                                                                                           | Decision effect                         | Permanent fix                                                                                             | Exact requirement / acceptance language                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Core could require coordinator setup even though the source lane already solves discoverability, or create personal attention that does not improve response.                    | Small ministries gain another roster and duplicate noise without a proven outcome. | Medium / Medium       | Entra, Okta, and Jira support explicit responsibility, but no source proves it is universally necessary; D43 already has a complete lane.       | Narrows, does not invalidate.           | Keep lane-only as a first-class safe mode; make personal responsibility optional; measure its value.      | **D44-R1, R3, R29–R30; D44-AC001–010, AC116–120:** personal routing MUST be optional and MUST NOT gate the source lane. |
| The strongest alternative—notify every current grant manager—avoids configuration but diffuses ownership, widens metadata, multiplies unread work, and changes with every grant. | “Everyone owns it” often means nobody owns it and creates privacy/noise costs.     | High / Medium         | Jira/Okta separate assignment from general queue access; D35/D29 show bounded explicit responsibility; exact ministry evidence remains unknown. | Confirms Option 1 with a bounded route. | Use one-to-three co-equal selected assignments intersected with current exact authority; never broadcast. | **D44-R4, R7, R10; D44-AC011–020, AC041–050:** all-eligible broadcast is forbidden.                                     |

### 2. Brittleness

**Material concern: Yes.**

| What could go wrong                                                                                                                                                   | Why it matters                                                              | Severity / likelihood                  | Evidence or reasoning                                                                                                                                                    | Decision effect         | Permanent fix                                                                                                           | Exact requirement / acceptance language                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Routing based on display name, profile, email, role, current grant snapshot, or original grantor breaks after rename, assignment recreation, expiry, or scope change. | Work is misrouted, leaked, or silently lost during ordinary staff turnover. | Critical / High without exact identity | Phase 12 binds authority to Active Tenant Assignment and current EffectiveAccess; external products' directory-owner/fallback assumptions do not exist reliably in Core. | Changes the data model. | Store exact assignment membership; resolve authority dynamically; recreation never inherits; use closed result algebra. | **D44-R4, R7, R9, R20–R23; D44-AC016–020, AC031–050.** |

### 3. Technical debt

**Material concern: Yes.**

| What could go wrong                                                                                                                              | Why it matters                                                                                               | Severity / likelihood              | Evidence or reasoning                                                                   | Decision effect                                       | Permanent fix                                                                                                         | Exact requirement / acceptance language                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ---------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| A D44-specific task table, notification group, coordinator role, or Inngest workflow duplicates Phase 12, ADR-0183, and ADR-0027 and will drift. | Website, Mobilize, permission, task, and notification concepts become incompatible and expensive to migrate. | High / High if implemented locally | Governing ADRs already separate source, route, task, attention, delivery, and executor. | Changes implementation shape, not the product choice. | One typed Phase 12 policy/generation contract; adapters reference it; no new generic workflow/role/channel framework. | **D44-R2, R5, R11–R15, R27; D44-AC001–010, AC061–080, AC111–120.** |

### 4. Edge cases

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                                                                | Why it matters                                                                         | Severity / likelihood    | Evidence or reasoning                                                                             | Decision effect                        | Permanent fix                                                                                                                                                      | Exact requirement / acceptance language                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Final-member removal, requester-as-only-coordinator, one of three losing scope, concurrent request resolution, duplicate names, assignment recreation, request creation at policy cutover, and lost save responses can produce gaps or duplicates. | These are ordinary nonprofit staffing and distributed-system events, not exotic cases. | High / High in aggregate | D43 has concurrent source heads; time-bound grants and assignment turnover are core design facts. | Requires explicit state/race outcomes. | Closed modes, requester exclusion, complete subset resolution, trusted cutover, semantic receipts, differential successor generations, source-terminal precedence. | **D44-R3–R4, R8–R9, R16–R21; D44-AC011–020, AC041–060, AC081–090.** |

### 5. Footguns

**Material concern: Yes.**

| What could go wrong                                                                                                                                                            | Why it matters                                                                                 | Severity / likelihood                    | Evidence or reasoning                                                                                                   | Decision effect            | Permanent fix                                                                                                             | Exact requirement / acceptance language                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Labels such as “approver,” “owner,” “off,” “covered,” a task checkbox, inline email action, group picker, priority order, or optimistic save can imply authority or hide work. | Administrators and coordinators may accidentally grant, resolve, or abandon access governance. | Critical / High without purpose-built UX | Current tasks and bell demos contain generic/fake actions; D43 source actions are privileged and consequence-sensitive. | Narrows UI and server API. | Consequence-led exact copy, no generic controls, task/notification deep-link only, server rejects every invalid mutation. | **D44-R5, R12–R15, R24; D44-AC021–030, AC061–080, AC091–100.** |

### 6. Tenant safety

**Material concern: Yes.**

| What could go wrong                                                                                                                                                        | Why it matters                                                                                    | Severity / likelihood                     | Evidence or reasoning                                                                                 | Decision effect                                | Permanent fix                                                                                                                                      | Exact requirement / acceptance language                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| A member, request, task, notification, cache, count, audit row, worker event, or search result can cross Tenant boundaries or reveal hidden Tenants through errors/timing. | Access-governance metadata is sensitive and cross-Tenant exposure is a platform-critical failure. | Critical / Medium absent defense in depth | Identity OpenSpec requires app checks plus RLS; current generic task/profile shapes are not D44-safe. | Changes persistence and every read/write seam. | Tenant-not-null, composite same-Tenant keys, server-derived context, uniform denial, Tenant-keyed caches/claims/events, cross-Tenant poison tests. | **D44-R20, R22–R23; D44-AC031–040, AC091–100, AC111–115.** |

### 7. Database, RLS, and authorization safety

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                                  | Why it matters                                                                    | Severity / likelihood    | Evidence or reasoning                                                                                                 | Decision effect                      | Permanent fix                                                                                                                                                    | Exact requirement / acceptance language               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Caller-controlled Tenant/actor/member/status fields, bare foreign keys, permissive `UPDATE USING` without `WITH CHECK`, owner bypass, or raw browser writes could retarget policy or turn assignment into authority. | An allowed mutation could create forbidden recipients or cross-Tenant disclosure. | Critical / High if naïve | PostgreSQL owners/`BYPASSRLS` can bypass policies; Core requires server-resolved identity and privileged-path parity. | Makes database safeguards normative. | Append-only revisions, composite keys, checks/partial uniques, browser revoke, FORCE RLS, both policy clauses, hardened RPC, pinned path, service/worker parity. | **D44-R21–R23; D44-AC031–040, AC051–060, AC091–100.** |

### 8. Overengineering

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                  | Why it matters                                                                                           | Severity / likelihood                     | Evidence or reasoning                                                                                                   | Decision effect                     | Permanent fix                                                                                                                             | Exact requirement / acceptance language                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Manager fallback, multi-stage approval, rotations, schedules, workload balancing, delegation, SLAs, escalation, comments, arbitrary channels, workflow builders, or AI routing solve unproven cases. | Complexity raises configuration burden, failure modes, and technical debt for ministries with few staff. | Medium / High if enterprise IGA is copied | Entra/Okta expose these features, but Core's decision is a small responsibility route and existing Phase 12 safeguards. | Narrows external-practice adoption. | One closed policy, one bounded resolver, two required in-product projections, and a separate D45 email decision; add nothing speculative. | **D44-R2–R3, R10, R13, R27, R30; D44-AC001–015, AC071–080, AC116–120.** |

### 9. UX/UI and user friction

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                                          | Why it matters                                                                                                                             | Severity / likelihood              | Evidence or reasoning                                                                                                        | Decision effect                                  | Permanent fix                                                                                                                                              | Exact requirement / acceptance language    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| A noisy IAM form, hidden lane, full-directory download, false “coverage,” modal stack, ambiguous current-work effect, 32px bell, duplicate task/notification actions, or inaccessible picker confuses staff and field users. | Misunderstanding responsibility versus permission can delay or mis-decide sensitive access; poor mobile/accessibility excludes real users. | High / High without exact contract | Core mandates Base Maia/Base UI; current bell is demo/nonprecedent; WCAG requires reflow, focus, labels, errors, and status. | Changes labels, IA, controls, and release proof. | One card/sheet, progressive one-to-three picker, aggregate impact review, 44px bell target, correlated deep links, text-first mobile/low-bandwidth states. | **D44-R24–R25; D44-AC021–030, AC101–110.** |

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.**

| What could go wrong                                                                                                              | Why it matters                                                                                                    | Severity / likelihood            | Evidence or reasoning                                                            | Decision effect       | Permanent fix                                                                                                                                                  | Exact requirement / acceptance language               |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Policy, request, grant, task, notification, email delivery, and worker can each look like the owner of recipients or completion. | Circular synchronization can remove access, resolve requests, or preserve stale visibility from projection state. | Critical / High without a matrix | ADR-0183 and ADR-0027 explicitly separate these facts; D43 owns request closure. | Changes architecture. | Policy owns intent; generation owns complete recipients; D43 owns source; Phase 12 owns grant; adapters own presentation/engagement only; executor transports. | **D44-R1–R2, R5, R11–R19; D44-AC001–010, AC061–090.** |

### 11. Hidden coupling

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                               | Why it matters                                                                        | Severity / likelihood | Evidence or reasoning                                                                       | Decision effect                              | Permanent fix                                                                                                     | Exact requirement / acceptance language                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| D44 could silently reuse Website review/recovery coordinators, Access groups, original grantor, Owner/Admin, current Tasks UI, finance notifications, manager directory, or Inngest availability. | Changes in another domain unexpectedly reroute sensitive access work or leak details. | High / Medium         | D29/D35 have different purposes; current task/bell/finance code are explicit nonprecedents. | Narrows reuse to mechanics behind contracts. | Unique route/recipient/item identities; no roster alias/import/fallback; adapters reference D44 generations only. | **D44-R2, R4–R5, R10–R14, R27; D44-AC003–010, AC011–020, AC071–080, AC116–120.** |

### 12. Failure modes

**Material concern: Yes.**

| What could go wrong                                                                                                                                                           | Why it matters                                                                               | Severity / likelihood | Evidence or reasoning                                                                                               | Decision effect             | Permanent fix                                                                                                                                                | Exact requirement / acceptance language                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Policy commits but response/outbox/task/notification/email fails; an adapter succeeds alone; source resolves during lag; stale projection remains; provider retry duplicates. | Staff may miss work or see false active attention even though request truth remains correct. | High / Medium         | Asynchronous delivery is independently fallible; workflow OpenSpec requires product ledger/claims and source truth. | Defines fail-safe recovery. | Atomic policy+outbox, receipt lookup, source-lane fallback, adverse read-time checks, independent adapter claims/reconciliation, source-terminal precedence. | **D44-R1, R11–R19, R21, R26–R27; D44-AC051–090, AC111–115.** |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                    | Why it matters                                                       | Severity / likelihood  | Evidence or reasoning                                                                                                     | Decision effect             | Permanent fix                                                                                                                                                                       | Exact requirement / acceptance language               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Prospective-only saves strand current work; blind current updates surprise users; two saves, request creation/resolution, permission loss, and retries can jointly revive or duplicate responsibility. | Responsibility history and personal engagement become untrustworthy. | Critical / Medium-high | D43 is head/version based; coordinator attention is reversible projection but current turnover requires current adoption. | Changes temporal semantics. | Fresh aggregate impact, rechecked save, trusted cutover, all-current adoption, immutable differential generations, same-key replay, changed-payload conflict, source terminal wins. | **D44-R16–R21; D44-AC051–060, AC081–090, AC111–115.** |

### 14. Data integrity risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                 | Why it matters                                                            | Severity / likelihood | Evidence or reasoning                                                                            | Decision effect                                    | Permanent fix                                                                                                                                    | Exact requirement / acceptance language                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Duplicate policy heads/members/current assignments, stale counts, partial fan-out, cascade deletion, reused assignment IDs, or mismatched task/notification cohorts corrupt responsibility history. | Reports, UX, and recovery disagree and may expose a person after removal. | Critical / Medium     | Multi-projection at-least-once delivery requires semantic identities and structural constraints. | Adds conservation and reconciliation requirements. | Canonical set digest, unique/partial indexes, restrictive FKs, append-only heads/generations, same generation for adapters, conservation audits. | **D44-R4, R9, R11, R17, R21–R23, R26; D44-AC011–020, AC041–070, AC091–100.** |

### 15. Security and privacy risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                                                                      | Why it matters                                                                                 | Severity / likelihood | Evidence or reasoning                                                                                        | Decision effect                      | Permanent fix                                                                                                                                                    | Exact requirement / acceptance language                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Coordinator names, hidden requester/capability, request prose, grant provenance, qualification failures, sibling engagement, emails, logs, exports, AI, screenshots, or cached notification previews expose sensitive ministry/personnel/location facts. | Access-governance metadata can endanger people and reveal privileged organizational structure. | Critical / Medium     | D42/D43 field tiers and ADR-0027 require minimized recipient-specific presentation; user prose is protected. | Narrows every projection and export. | Safe allowlisted labels; source-load protected detail after reauth; no prose/provenance copies; immediate authorization-loss removal; protected retention/audit. | **D44-R8, R14, R20, R23, R29; D44-AC031–040, AC071–080, AC091–100.** |

### 16. Scalability and performance risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                   | Why it matters                                                                                                   | Severity / likelihood | Evidence or reasoning                                                                                                        | Decision effect                         | Permanent fix                                                                                                                                                                   | Exact requirement / acceptance language                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Full-directory client search, synchronous per-request/per-channel fanout, per-row N+1 authorization, exact-current update in one giant transaction, or unbounded count queries degrade large Tenants. | Slow settings or personal attention encourages stale caches and unsafe shortcuts; a save can time out partially. | High / Medium         | Three recipients are bounded but pending requests and Tenant directory are not; no evidence supports a fixed volume ceiling. | Changes execution shape, not semantics. | Server keyset search, set-based resolver, indexed heads, aggregate preview, atomic policy+intent only, product claims/pagination, current read reproof, measured query budgets. | **D44-R9, R16, R20–R21, R25–R27; D44-AC021–030, AC041–060, AC101–115.** |

### 17. Operational burden

**Material concern: Yes.**

| What could go wrong                                                                                                                                                           | Why it matters                                                                                             | Severity / likelihood | Evidence or reasoning                                                                                    | Decision effect                                   | Permanent fix                                                                                                                                                  | Exact requirement / acceptance language                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Inactive/unqualified coordinators, zero coverage, drifted projections, aged requests, and custom notification rules can require recurring manual cleanup or direct DB repair. | Small ministries cannot sustain hidden IAM operations, and staff may assume someone else is handling work. | High / Medium         | Optional routes naturally decay; source lane and deterministic projection offer a simpler recovery path. | Adds health UX/monitors, rejects custom workflow. | Show configured-member health, maintain lane-only operation, reconcile by heads, alert operators on drift/age, no manual status editing or automatic fallback. | **D44-R1, R9–R10, R20, R26, R29–R30; D44-AC041–050, AC101–120.** |

### 18. Observability and auditability gaps

**Material concern: Yes.**

| What could go wrong                                                                                                                                   | Why it matters                                                                        | Severity / likelihood                | Evidence or reasoning                                                                                                  | Decision effect                    | Permanent fix                                                                                                                                                     | Exact requirement / acceptance language                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Logs may say “notified” from a task insert, email attempt, or worker run without proving policy, recipient basis, source head, delivery, or decision. | Security cannot reconstruct why somebody saw a request; staff see misleading success. | High / High without layered evidence | ADR-0027 distinguishes item/engagement/delivery; ADR-0183 distinguishes source/task; workflow logs are technical only. | Requires separate evidence planes. | Immutable policy/generation audit, body-free adapter receipts, separate channel delivery receipt, source decision receipt, correlated IDs, no prose in telemetry. | **D44-R11–R15, R21, R26, R29; D44-AC061–100, AC111–120.** |

### 19. Dependency and integration risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                 | Why it matters                                                                | Severity / likelihood | Evidence or reasoning                                                                                                                         | Decision effect                               | Permanent fix                                                                                                                                         | Exact requirement / acceptance language                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Tasks Hub, Phase 17, email provider, Realtime, directory data, or Inngest outage/schema/rate-limit change becomes required for routing correctness. | Provider failure can strand governance or cause duplicate/widened recipients. | High / Medium         | Core workflow OpenSpec says product records/ledger/claims remain authoritative; Entra/Okta channel behavior is vendor-owned and not portable. | Narrows dependencies to replaceable adapters. | Product-owned policy/generation, identifier-only versioned intents, source lane, retries/DLQ/reconcile, provider replacement proof, no email actions. | **D44-R1, R11–R15, R26–R28; D44-AC061–080, AC101–120.** |

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                           | Why it matters                                                                            | Severity / likelihood           | Evidence or reasoning                                                                       | Decision effect                | Permanent fix                                                                                                                                                                                 | Exact requirement / acceptance language                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Migration infers coordinators from admins/grantors/groups/current task rows; old clients interpret unknown mode; personal tasks ship before Phase 17; rollback deletes policy/history or restores recipients. | Tenants receive surprise disclosure and mixed versions create irreversible false history. | Critical / High without staging | Current task/bell/finance implementations are incompatible; lane-only is additive and safe. | Requires strict rollout order. | No-inference lane-only backfill, readers/deny first, shadow resolver, item manifest before personal release, external email gated, kill switches stop projections only, roll-forward history. | **D44-R3–R4, R11–R13, R28; D44-AC001–020, AC071–080, AC111–120.** |

### 21. Testability, traceability, and proof

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                      | Why it matters                                                                 | Severity / likelihood | Evidence or reasoning                                                                                                                             | Decision effect                                   | Permanent fix                                                                                                                                                 | Exact requirement / acceptance language                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| A test that only sees a task row can miss cross-Tenant reads, requester self-routing, stale heads, wrong cohorts, shared engagement, inaccessible UI, projection lag, or protected text. | The feature can appear green while violating access and user-visible outcomes. | Critical / High       | Core requires authorization/production-shaped proof and traceability across docs, OpenSpec, tickets, implementation, tests, and release evidence. | Adds normative trace anchors and negative suites. | Carry D44-R/AC IDs end-to-end; test positive, negative, boundary, concurrency, migration, accessibility, low-bandwidth, privileged paths, and reconciliation. | **D44-R1–R30 and D44-AC001–AC120 are normative trace anchors.** |

### 22. Other development hazards

**Material concern: Yes.**

| What could go wrong                                                                                                                                                         | Why it matters                                                                                         | Severity / likelihood | Evidence or reasoning                                                                                                | Decision effect                          | Permanent fix                                                                                                                                                       | Exact requirement / acceptance language                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Product analytics rank coordinator speed, infer workload/absence, reuse the roster in Website/Mobilize, or respond to slow requests with escalating spam/automatic removal. | This creates surveillance, unfair expectations, cross-domain coupling, and unsafe governance pressure. | High / Medium         | No founder or external evidence authorizes performance management or roster reuse; nonprofit staffing varies widely. | Adds a humane-use and no-reuse boundary. | Aggregate route health only; no individual scoring; each source registers its own route; thresholds trigger UX/reliability review, never authority changes or spam. | **D44-R2, R10, R13–R14, R29–R30; D44-AC003–010, AC071–080, AC116–120.** |

## Acceptance criteria

### Decision, terminology, and ownership

- **D44-AC001:** `access.holder_direct_grant_review_responsibility@1` routes
  personal responsibility only for current D43
  `holder_direct_grant_review` requests.
- **D44-AC002:** `access_request_coordinator@1` is a code-owned recipient role,
  not a Phase 12 permission, application role, group, task assignee type, or
  Tenant-created label.
- **D44-AC003:** D29 Website review coordinators, D35 Website recovery
  coordinators, Mobilize users, Access groups, Teams, Owner/Admin, grantors,
  managers, auditors, and current task recipients neither initialize nor
  modify the D44 roster.
- **D44-AC004:** The current contribution approval workflow, notification
  tables, SLA, profile/role approver resolver, and mutable tasks cannot serve as
  D44 source, route, recipient, or notification authority.
- **D44-AC005:** The current hard-coded bell dropdown, fake count/avatars/actions,
  and 32-pixel shell trigger cannot serve as the D44/Phase 17 implementation
  precedent or release proof.
- **D44-AC006:** The Phase 12 D43 request aggregate alone owns pending and
  terminal request state; D44 writes no request lifecycle field.
- **D44-AC007:** The Phase 12 grant/resolver alone owns direct-grant and
  EffectiveAccess truth; D44 writes no grant or authorization epoch.
- **D44-AC008:** Tasks Hub owns task presentation/recipient engagement only and
  Phase 17 owns notification presentation/engagement only; neither owns the
  D44 policy or recipient set.
- **D44-AC009:** External email delivery and any later reminder behavior are
  absent until D45 and a later reminder decision respectively authorize them.
- **D44-AC010:** No D44 path creates a generic approval engine, coordinator
  role, manager hierarchy, delegation system, queue DSL, or cross-domain roster.

### Policy shape, bounds, and durable identity

- **D44-AC011:** At most one current policy head exists for an exact
  Tenant/environment/route kind and every successor references its expected
  predecessor.
- **D44-AC012:** Policy mode is exactly `source_lane_only@1` or
  `named_coordinators`; unknown values fail closed.
- **D44-AC013:** `source_lane_only@1` has zero member rows and remains a fully
  operational Access requests posture.
- **D44-AC014:** `named_coordinators` has one, two, or three unique members; zero
  or more than three causes atomic rejection.
- **D44-AC015:** Removing the final member requires explicit selection of **Use
  the shared Access requests lane only**; no empty named policy is stored.
- **D44-AC016:** Each member references one current same-Tenant staff Active
  Tenant Assignment through a composite same-Tenant relationship.
- **D44-AC017:** A Party, profile, user ID, email, display name, role, task,
  notification, or external-directory identifier cannot substitute for the
  assignment member key.
- **D44-AC018:** Ending an assignment immediately makes its member ineligible;
  creating a later assignment for the same person does not inherit membership.
- **D44-AC019:** Several grant sources for one assignment still create one
  member and one potential recipient.
- **D44-AC020:** Reordering a canonical member set creates no policy successor,
  outbox intent, generation, task, notification, unread state, or audit event.

### Settings IA, picker, and configuration UX

- **D44-AC021:** A compact **Access request coordinators** summary appears in
  the existing People & access → Access requests surface or established
  settings area; no new top-level navigation, dedicated Responsibility page,
  or coordinator dashboard is created.
- **D44-AC022:** The summary leads with **Every request remains available in
  Access requests** and never labels lane-only as Off, Disabled, Not configured,
  or No coverage.
- **D44-AC023:** **Change coordinators** opens one route-addressable Base Maia
  responsive Sheet and returns focus to the trigger on clean close.
- **D44-AC024:** The editor visibly states that choosing someone gives personal
  responsibility but grants no access or permission and does not limit who may
  use the source lane.
- **D44-AC025:** The named-person picker returns only visible same-Tenant current
  Active Tenant Assignments that independently pass current D43 grant-decision
  eligibility in at least one live Tenant scope; every request still requires
  its own exact-scope recipient qualification.
- **D44-AC026:** An unqualified, inactive, ended, recreated, incompatible,
  hidden, or cross-Tenant assignment cannot be newly selected and receives no
  existence-leaking error detail.
- **D44-AC027:** A previously configured member who later loses eligibility
  remains repair-visible as **Not currently eligible** only to an authorized
  route manager and receives no personal projection.
- **D44-AC028:** Search is server-filtered, cancelable, keyset-paginated, and
  never downloads the full Tenant directory or protected capability facts.
- **D44-AC029:** Duplicate display names use only independently authorized safe
  disambiguators; display text never selects identity.
- **D44-AC030:** Selected members render as semantic rows with exact-name Remove
  buttons and no drag handle, rank, primary/backup, rotation, weight, schedule,
  availability, workload, manager, team/group, select-all, or bulk input.

### Tenant, authorization, RLS, and privileged boundaries

- **D44-AC031:** Every policy, member, impact, generation, recipient, task,
  notification, audit, outbox, and claim operation derives Tenant and actor
  from a validated server context rather than caller input.
- **D44-AC032:** Route-policy read/write requires the registered
  `access.manage_request_responsibility` purpose and current Tenant-wide
  `permissions.manage_grants` administration scope/ceiling.
- **D44-AC033:** Route-management authority does not admit the actor to a D43
  decision unless that exact request's current Phase 12 decision checks pass.
- **D44-AC034:** Coordinator membership does not permit policy editing, source
  lane access, request detail, keep/remove, task administration, or notification
  configuration by itself.
- **D44-AC035:** Browser roles have no direct write grant to route/member/
  generation relations; every mutation crosses the approved server command.
- **D44-AC036:** `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`,
  application checks, grants, `USING`, and `WITH CHECK` independently reject
  cross-Tenant and retargeting reads/writes.
- **D44-AC037:** Hardened functions pin `search_path`, schema-qualify objects,
  validate expected heads, and expose execute only to the intended server role.
- **D44-AC038:** Owner, service-role, `BYPASSRLS`, worker, support, import, and
  repair paths prove the same Tenant, purpose, member, and recipient boundaries
  and cannot invoke a broader helper.
- **D44-AC039:** Same-Tenant composite keys prevent a route/member/request/
  recipient/task/notification edge whose IDs individually exist in different
  Tenants.
- **D44-AC040:** Uniform denial, count, latency, cache, and error behavior does
  not reveal another Tenant, hidden person, request, capability, policy, or
  qualification failure.

### Resolver, requester exclusion, and identity mapping

- **D44-AC041:** For one current request, the resolver loads the complete
  current one-to-three-member policy rather than a visible page, task rows,
  cached eligible count, or partial worker result.
- **D44-AC042:** Every admitted member independently passes current same-Tenant
  Active Tenant Assignment, exact D43 request scope, decision purpose,
  `permissions.manage_grants`, live ceiling, floor, and source checks.
- **D44-AC043:** The exact subject assignment and every configured assignment
  currently resolving to the authenticated requester principal are excluded
  from personal task and in-product attention for that request through trusted
  identity relationships, never email or display-name matching.
- **D44-AC044:** Requester exclusion neither revokes nor grants source-lane
  visibility or keep/remove authority; ordinary Phase 12 checks decide it.
- **D44-AC045:** A complete result with one or two eligible members and other
  members proved ineligible releases exactly that eligible subset and is not
  treated as partial proof.
- **D44-AC046:** Complete proof of zero eligible non-requester members emits
  `proved_zero`, creates no personal projection, and leaves the source lane.
- **D44-AC047:** Timeout, stale head, partial enumeration, ambiguous identity,
  contradictory evidence, corrupt relation, unavailable floor, or over-limit
  data emits `indeterminate`, releases nobody, and never becomes zero.
- **D44-AC048:** Zero/indeterminate never falls back to Owner/Admin, every grant
  manager, original grantor, auditor, read-only reviewer, manager, group, prior
  recipient, Website/Mobilize coordinator, support, AI, or service role.
- **D44-AC049:** Phase 17 maps an admitted exact Active Tenant Assignment to one
  current same-Tenant Party, registered coordinator recipient role, and staff
  surface through a trusted server resolver only.
- **D44-AC050:** Absent, ambiguous, stale, cross-Tenant, multi-hat, or wrong-
  surface Phase 17 mapping releases no notification and cannot add a person to
  the D44 recipient set; email/profile/display text never maps identity.

### Save impact, generations, concurrency, and idempotency

- **D44-AC051:** **Review changes** loads a fresh impact against the expected
  policy head, current authorization epoch, complete current pending-request
  census/head, and canonical proposed member-set digest.
- **D44-AC052:** Impact shows only authorized aggregate open, continuing,
  newly-assigned, no-longer-assigned, and shared-lane-only counts, clearly
  distinguishes request and responsibility units, and exposes no hidden subject,
  capability, reason, per-person workload, or qualification-failure detail.
- **D44-AC053:** The confirmation says the save updates personal responsibility
  for open and future requests and changes neither access nor request decisions.
- **D44-AC054:** Stale, timed-out, partial, contradictory, corrupt, over-limit,
  or indeterminate impact disables save and the server writes nothing.
- **D44-AC055:** Successful save atomically appends the policy successor, audit,
  semantic receipt, trusted cutover, and identifier-only reconciliation intent;
  a partial commit is impossible.
- **D44-AC056:** Two saves from the same expected policy head produce one winner;
  the loser preserves input, reloads impact, and cannot overwrite the winner.
- **D44-AC057:** A lost successful response followed by the same semantic key
  and payload returns the original receipt/head without another revision or
  projection intent; the same key with changed membership conflicts.
- **D44-AC058:** A request created at cutover resolves under exactly the old or
  new policy by trusted ordering and cannot receive both generations.
- **D44-AC059:** Policy, assignment, eligibility, source, or authorization
  changes trigger re-evaluation, but an identical canonical effective
  recipient set and responsibility semantics create no successor, task, bell
  item, unread state, or audit churn.
- **D44-AC060:** A changed effective set appends one monotonic differential
  successor; history never mutates/reopens, and a terminal D43 request always
  wins over late reconciliation or replay.

### Tasks Hub projection and current-work convergence

- **D44-AC061:** One D43 request has at most one shared ADR-0183 task identity
  regardless of one, two, or three admitted coordinators.
- **D44-AC062:** Each admitted current coordinator has at most one active
  recipient assignment for the exact task/role/generation and My tasks counts
  it once.
- **D44-AC063:** Source/team counts group by request occurrence and do not count
  one request once per coordinator or once per projection channel.
- **D44-AC064:** The task title is **Review current access request** and exposes
  only code-owned safe labels currently permitted by the Phase 12 projection.
- **D44-AC065:** The task's only source action is **Review in People & access**;
  no Complete, Claim, Reassign, Dismiss, Delete, Snooze, Due date, Comment,
  bulk, drag, import, support, AI, or inline Keep/Remove action appears or works.
- **D44-AC066:** Continuing coordinators retain the same task recipient
  assignment and engagement through route reconciliation.
- **D44-AC067:** A newly admitted coordinator receives individual task
  assignments for every still-current eligible pending request after the
  confirmed current-work route save.
- **D44-AC068:** A removed/ineligible coordinator's active personal task rows
  end as **Coordinator responsibility changed** without Completed, Read,
  Dismissed, source resolved, or access revoked; current checks remove stale
  visibility before cleanup completes.
- **D44-AC069:** A task insert/update/delete failure never hides the request from
  the source lane, changes D43/Phase 12 truth, or blocks another authorized
  actor from deciding it.
- **D44-AC070:** Task reconciliation rebuilds from current request/policy/
  generation heads and product claims and requires no direct task-row repair or
  replay of a source decision.

### Required Phase 17 in-product attention and D45 boundary

- **D44-AC071:** For a newly created post-cutover D43 request, each newly
  admitted coordinator receives exactly one Phase 17 item keyed
  `holder_access_review_requested_v1` under
  `presentation.source_actionable_then_recent_90d@1`.
- **D44-AC072:** The per-request item title is **Access review needs attention**,
  its only action is **Review in People & access**, and it has no email/inline
  Keep or Remove decision.
- **D44-AC073:** The per-request item contains no request/decision explanation,
  continuity reason, group/capability provenance, protected preview, peer name,
  sibling engagement, authority claim, or external delivery promise.
- **D44-AC074:** If a policy or eligibility change newly admits a coordinator to
  existing pending requests, individual tasks are created but Phase 17 creates
  exactly one recipient/responsibility-application-generation item keyed
  `access_request_responsibility_updated_v1`, not one bell item per request.
- **D44-AC075:** The responsibility-update item contains only a safe authorized
  initial count and typed link to the filtered Access requests lane; its
  immutable child proof references request identities without copying bodies.
- **D44-AC076:** The grouped update remains source-actionable while at least one
  admitted child request remains current for the recipient; child end updates
  applicability without merging or mutating sibling source histories.
- **D44-AC077:** Continuing recipients receive no fresh item/unread state from a
  policy/eligibility re-evaluation, and removed recipients receive no removal
  item; their prior active responsibility ends under the typed route reason.
- **D44-AC078:** Task and notification identities, read states, archive rules,
  receipts, retries, and counts remain separate even though both reference the
  same causal request/recipient generation; reading one never reads/completes
  the other.
- **D44-AC079:** On D43 terminal source receipt, Tasks Hub projects its typed
  Completed/No longer required result; Phase 17 independently leaves active
  attention and follows its source-actionable Recent policy. Neither invents
  the other's outcome.
- **D44-AC080:** D44 sends no external email, SMS, push, Slack, Teams, reminder,
  escalation, digest, or outcome delivery before its own later governing
  decision; D45 may add email only without changing D44 recipients or source.

### Source lifecycle, authorization changes, and races

- **D44-AC081:** A current `pending_review` source head is required for active
  task and notification responsibility at every read, action, and replay.
- **D44-AC082:** `resolved_kept` and `resolved_removed` source receipts close the
  task with the typed People & access completed result and end Phase 17 active
  attention without a route mutation.
- **D44-AC083:** `withdrawn` and `no_longer_applicable` source receipts close the
  task as No longer required and end Phase 17 active attention truthfully.
- **D44-AC084:** A route save, coordinator removal, task read, notification read,
  email delivery, bounce, worker success, or engagement event cannot withdraw,
  keep, remove, resolve, reopen, extend, or otherwise mutate D43.
- **D44-AC085:** A route save and every projection create zero grant events,
  EffectiveAccess changes, authorization-epoch advances, D37 fences, or D40
  continuity-source changes.
- **D44-AC086:** If a request resolves between impact preview and save, save
  detects the changed census/head and writes nothing until a fresh impact is
  reviewed.
- **D44-AC087:** If a request resolves after route commit but before member
  projection, the terminal head suppresses new task/notification actionability
  and reconciliation records no fabricated recipient completion/read.
- **D44-AC088:** If permission ends after recipient resolution, list/detail/
  deep-link/notification reads fail closed immediately and projection later
  records ended authorization without calling the source resolved.
- **D44-AC089:** Regained qualification while the request remains pending is
  admitted only after complete current reproof; a changed effective set gets a
  fresh differential generation and never revives an ended old one.
- **D44-AC090:** Two eligible coordinators can open and attempt D43 decisions,
  but D43's expected request/grant heads and Phase 12 safeguards choose one
  source outcome; D44 does not add quorum or first-view ownership.

### Privacy, integrity, retention, and audit

- **D44-AC091:** Route/member/generation/task/notification/outbox/workflow rows
  contain no holder explanation, keep explanation, D40 reason/basis, group
  name, protected provenance, raw grant body, or recipient-failure detail.
- **D44-AC092:** Protected D43 detail is fetched from Phase 12 only after fresh
  current Tenant, purpose, floor, field, request, and source authorization and
  is escaped as text.
- **D44-AC093:** Task list/search, notification preview/search, global search,
  logs/traces/errors, analytics/BI, AI prompts/embeddings, exports, generated
  documents, and workflow events cannot copy protected source text.
- **D44-AC094:** Notification/body-free task payloads use an explicit closed
  safe-field allowlist and reject unknown or prohibited fields before commit or
  dispatch.
- **D44-AC095:** Policy/member revisions, trusted actor/time, expected head,
  canonical set digest, aggregate impact, and semantic receipt form durable
  business audit distinct from logs and delivery telemetry.
- **D44-AC096:** Recipient-generation audit records current policy/request/
  authorization basis, requester exclusion, canonical effective-set digest,
  predecessor, and typed end without storing protected bodies.
- **D44-AC097:** Task projection, Phase 17 item/engagement, and external delivery
  each have separate body-free receipts correlated to, but not substituted for,
  policy/generation/source evidence.
- **D44-AC098:** Ordinary route history has restrictive deletion; ending a
  coordinator assignment, request, or Tenant relation cannot cascade away
  security/audit evidence or retarget it.
- **D44-AC099:** Retention, anonymization, legal hold, residency, backup,
  subject access, and export follow Phase 12/17 policy while minimization
  removes stale presentation before deferred physical purge.
- **D44-AC100:** No individual coordinator speed, read rate, decision count,
  workload, ranking, availability, absence, or performance score is produced;
  aggregate product-health metrics cannot be used for HR/ministry evaluation.

### Accessibility, localization, resilience, and performance

- **D44-AC101:** Shared Base Maia/Base UI Card, RadioGroup, Combobox, semantic
  rows, Button, Sheet, status, and responsive list primitives are reused; no
  app-local UI kit, Radix fork, hard-coded palette, or decorative motion system
  is introduced.
- **D44-AC102:** All settings, picker, impact, task, and Notification Center
  controls have programmatic names/instructions; statuses and errors do not
  rely on color, icon, hover, or toast alone.
- **D44-AC103:** Keyboard-only users can open/close the Sheet, choose a mode,
  search/select/remove members, review impact, save/cancel, and follow task/
  notification deep links with logical order and preserved focus.
- **D44-AC104:** Important controls, including the permanent staff bell trigger,
  provide at least a 44-by-44 CSS-pixel target and visible unobscured focus;
  the current `size-8` demo does not pass.
- **D44-AC105:** At 320 CSS pixels and 400% zoom, all flows reflow without two-
  dimensional scrolling or clipped actions and preserve mobile safe areas and
  virtual-keyboard access.
- **D44-AC106:** Long international names, localized plurals/counts/dates,
  Unicode, CJK, combining marks, RTL, bidi isolation, forced colors, text
  spacing, contrast, magnification, and reduced motion pass manual proof.
- **D44-AC107:** Loading, empty lane-only, current named, no-access, stale,
  indeterminate, save-success, response-loss, projection-lag, and source-changed
  states are distinct and persistent.
- **D44-AC108:** Weak-network search is cancelable/paginated and does not reset
  selected rows; no offline, optimistic, or queued policy edit appears saved
  before the authoritative receipt.
- **D44-AC109:** Settings search and impact are server-paginated/set-based and
  indexed; no client downloads the full directory or current request corpus.
- **D44-AC110:** Policy commit cost is bounded by the policy, receipt, audit, and
  one intent rather than coordinator/request/channel fanout; reconciliation is
  product-claimed, paginated, retryable, and measured against production-shaped
  baselines instead of invented fixed latency claims.

### Rollout, dependency recovery, operations, and traceability

- **D44-AC111:** Migration creates no per-Tenant route/member rows; absence
  resolves to code-owned `source_lane_only@1` and infers no member from existing
  admin/grantor/group/task/notification/Website/Mobilize facts; no historical
  request gets fabricated routing evidence.
- **D44-AC112:** Rollout order is schema/constraints/deny and readers, source
  lane, policy UI, shadow resolver, impact/save, current-work reconciliation,
  task adapter, Phase 17 manifest/item, canary, then separately gated D45 email.
- **D44-AC113:** Personal routing remains Reserved until task generic-mutation
  rejection, both Phase 17 keys/policies/end rules, authorization mapping,
  accessibility, reconciliation, and named monitors are proven Live.
- **D44-AC114:** A kill switch may stop new personal task, Notification Center,
  or external-email materialization independently but cannot disable the
  source lane, alter policy/source/grant history, or delete existing evidence.
- **D44-AC115:** Re-enabling projection reconciles from current product heads;
  rollback never replays a D43 decision, restores access, revives an ended
  recipient generation, or depends on provider history.
- **D44-AC116:** Inngest events contain only schema version, Tenant routing
  reference, policy/request/recipient-generation IDs, dispatch/causal ID, and
  safe adapter kind; prohibited payloads reject before dispatch.
- **D44-AC117:** Inngest/provider deduplication, run state, waits, concurrency,
  and delivery receipts cannot replace product unique identities, expected
  heads, semantic receipts, dispatch ledger, or work claims.
- **D44-AC118:** Source-lane, policy, and current-generation correctness is
  independently provable with Tasks Hub, Phase 17, email, Realtime, and Inngest
  unavailable or replaced.
- **D44-AC119:** D44-R1–R30 and D44-AC001–AC120 trace consistently into the
  glossary, ADRs, Phase 12, OpenSpec, design, tasks, GitHub tickets,
  implementation, tests, migration evidence, and release evidence with no
  contradictory route names, modes, caps, identities, outcomes, or channel
  claims.
- **D44-AC120:** Launch evidence includes positive/negative/boundary,
  cross-Tenant/RLS/privileged, requester exclusion, zero/indeterminate,
  concurrency/idempotency, mixed-version/migration/rollback, projection drift,
  accessibility/localization/low-bandwidth, privacy-egress, and
  production-shaped performance tests plus every named monitor below.

## Named monitors

These are initial safety/product thresholds to calibrate during the pilot, not
universal industry limits. No monitor may automatically widen recipients,
grant authority, send an unapproved channel, decide a request, remove/restore
access, or hide the source lane.

| Signal                                                            | Threshold                                                                                                                                                                    | Owner                                         | Required response                                                                                                                                                                         |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `access_request_route_cross_tenant_edge_total`                    | Any                                                                                                                                                                          | Security + IAM                                | Disable D44 writes/projections for the affected release, revoke leaked presentation, preserve evidence, investigate all related edges, and repair composite constraints before re-enable. |
| `access_request_route_caller_attribution_total`                   | Any caller-supplied Tenant, actor, member status, route kind, recipient role, or audit attribution accepted                                                                  | Security + API                                | Disable the command, inspect affected revisions, repair trusted-context derivation, and re-run privileged-path tests.                                                                     |
| `access_request_route_invalid_mode_or_cardinality_total`          | Any current unknown mode, empty named policy, duplicate member, or fourth member                                                                                             | IAM + Data Integrity                          | Fence the policy head, revert to the last valid head or lane-only through an audited repair, fix constraints/command, and reconcile.                                                      |
| `access_request_route_duplicate_current_head_total`               | Any                                                                                                                                                                          | Data Integrity + IAM                          | Stop policy writes, select no silent winner, repair under audited expected-head procedure, and reconcile every affected request.                                                          |
| `access_request_route_membership_granted_authority_total`         | Any read/action allowed solely by coordinator membership/task/notification                                                                                                   | Security + IAM                                | Disable the path, revoke improper presentation, inspect decisions, and repair authorization intersection before re-enable.                                                                |
| `access_request_route_new_ineligible_member_saved_total`          | Any newly selected member who did not pass current exact D43 qualification                                                                                                   | IAM + Product                                 | Reject/fence the revision, preserve audit, repair candidate/save predicates, and restore the last valid policy.                                                                           |
| `access_request_route_requester_personal_projection_total`        | Any requester receiving their own task, per-request item, route-update item, or external delivery                                                                            | IAM + Tasks + Notifications                   | Remove the personal projections without changing source-lane authority, inspect recipient mapping, and reconcile the current generation.                                                  |
| `access_request_route_partial_release_total`                      | Any released recipient set from incomplete/stale/timeout/corrupt/ambiguous proof                                                                                             | Security + IAM                                | Stop all personal release for the affected Tenant, remove widened presentation, repair complete resolution, and replay from product heads.                                                |
| `access_request_route_hidden_fallback_total`                      | Any recipient not explicitly configured and currently qualified                                                                                                              | Security + Product                            | Stop projection, remove improper assignment/item, preserve the source lane, and eliminate fallback/inference.                                                                             |
| `access_request_route_phase17_mapping_widen_total`                | Any Party/role/surface recipient not mapped from the exact admitted same-Tenant assignment                                                                                   | Security + Notifications                      | Disable the notification key, retract active presentation where lawful, repair mapping, and audit multi-Tenant/multi-hat exposure.                                                        |
| `access_request_route_source_lane_dependency_total`               | Any source row/count/action hidden or changed because route/task/notification/email/worker is absent or failed                                                               | IAM + Access Product                          | Restore source-query behavior immediately, disable dependent projection gate, and repair the separation.                                                                                  |
| `access_request_route_removed_visibility_total`                   | Any removed/ineligible member can still view personal task/notification after a current read reproof                                                                         | Security + Tasks + Notifications              | Block reads, end stale projections, repair adverse-first predicate/cache invalidation, and inspect disclosures.                                                                           |
| `access_request_route_identical_set_churn_total`                  | Any unchanged effective set creates a successor generation, fresh task, or unread item                                                                                       | IAM + Tasks + Notifications                   | Pause reconciler, deduplicate/retract false attention without fabricating read, and repair canonical-set equality.                                                                        |
| `access_request_route_adapter_recipient_divergence_total`         | Any task or Phase 17 recipient outside/different from the current D44 set, excluding recorded projection lag                                                                 | IAM + Tasks + Notifications                   | Stop the wider adapter, rebuild both from the current generation, inspect mapping/claims, and reconcile engagement safely.                                                                |
| `access_request_route_generic_task_mutation_total`                | Any generic task operation changes a D43/D44 task or source                                                                                                                  | Tasks Platform + IAM                          | Disable the generic seam, restore source-derived projection, inspect source effects, and add deny tests.                                                                                  |
| `access_request_route_changed_source_or_epoch_total`              | Any route/personal projection mutates D43 request, grant, EffectiveAccess, or authorization epoch                                                                            | Security + IAM                                | Stop D44 commands, investigate/repair source records without deleting audit, and require source-command boundary proof.                                                                   |
| `access_request_route_protected_text_egress_total`                | Any D43/D40/grant prose or protected provenance in policy, task, item, email, event, log, search, analytics, AI, or ordinary export                                          | Privacy + Security                            | Disable the consumer, remove derived copies where lawful, assess exposure, notify incident owners, and enforce allowlist.                                                                 |
| `access_request_route_backlog_notification_fanout_total`          | More than one `access_request_responsibility_updated_v1` item per recipient and responsibility-application generation, or any per-child bell item caused by backlog adoption | Notifications + Access Product                | Pause update-item projection, collapse duplicates without fabricating read, repair grouping identity/child proof, and reconcile.                                                          |
| `access_request_route_postcutover_item_duplicate_total`           | More than one current `holder_access_review_requested_v1` item per request/recipient/generation                                                                              | Notifications Platform                        | Stop projector, deduplicate by product identity while preserving engagement evidence, and repair uniqueness/claim.                                                                        |
| `access_request_route_ready_outbox_oldest_age`                    | Greater than 10 minutes for 15 consecutive minutes                                                                                                                           | Platform SRE + IAM                            | Inspect dispatcher/claims/provider, enable replay/reconcile, preserve lane truth, and avoid source replay.                                                                                |
| `access_request_route_reconcile_oldest_age`                       | Any committed policy revision has unreconciled current pending requests for more than 15 minutes                                                                             | IAM + Tasks + Notifications                   | Pause further policy saves for that Tenant if growth continues, run product reconciliation, inspect claims/indexes, and surface truthful updating status.                                 |
| `access_request_route_projection_failure_rate`                    | Greater than 2% over 15 minutes with at least 100 adapter claims                                                                                                             | Platform SRE + Tasks + Notifications          | Pause affected adapter rollout, inspect schema/auth/provider errors, retain source lane, and replay after repair.                                                                         |
| `access_request_route_external_delivery_before_d45_total`         | Any email, SMS, push, Slack, Teams, digest, reminder, or escalation emitted before its governing decision is Live                                                            | Privacy + Communications                      | Disable delivery immediately, inspect recipients/content, preserve audit, and repair the channel gate.                                                                                    |
| `access_request_route_oldest_pending_age`                         | Any D43 request remains pending more than 7 calendar days                                                                                                                    | Tenant Access Governance + Product Operations | Inspect lane visibility, route zero/eligibility, projection/delivery health, and user research; contact authorized Tenant admins operationally but never auto-decide/escalate channels.   |
| `access_request_route_proved_zero_rate`                           | Above 20% of at least 50 pending requests in 30 days for one Tenant                                                                                                          | Tenant Access Governance + IAM                | Show route-health guidance to authorized route managers, review coordinator/permission setup, retain lane-only operation, and never broadcast.                                            |
| `access_request_route_indeterminate_rate`                         | Above 2% of at least 100 resolution attempts in 24 hours, or any continuous 15-minute interval                                                                               | IAM + Platform SRE                            | Pause personal release for affected scope, inspect authorization/mapping/query failures, repair and replay; never convert unknown to zero.                                                |
| `access_request_route_impact_stale_rate`                          | Above 10% of at least 50 impact confirmations in 30 days                                                                                                                     | Access Product + UX Research                  | Investigate concurrent-change UX/census scope, preserve no-write behavior, improve refresh flow, and do not weaken expected-head checks.                                                  |
| `access_request_route_fourth_member_attempt_rate`                 | Above 2% of at least 100 editor sessions in 30 days or five distinct Tenant support cases                                                                                    | Access Product + UX Research                  | Interview affected ministries and consider a versioned cap change only with noise/privacy/load/comprehension proof.                                                                       |
| `access_request_route_comprehension_rate`                         | Below 90% correct in moderated testing for lane, responsibility, permission, requester exclusion, task vs notification, and current-save effect                              | UX Research + Access Product                  | Keep personal routing Reserved, revise copy/IA/consequences, and retest representative staff including mobile/assistive-tech users.                                                       |
| `access_request_route_task_notification_duplicate_confusion_rate` | Above 10% of at least 30 pilot interviews/usability sessions report believing task and bell are two separate requests/actions                                                | UX Research + Tasks + Notifications           | Improve correlation/copy/deep-link behavior and grouping; do not merge engagement or remove either required surface without a new decision.                                               |
| `access_request_route_bell_target_or_a11y_failure_total`          | Any 44px target, keyboard/focus, name/role/state, reflow, contrast, forced-color, or screen-reader release failure                                                           | Accessibility + UI Platform                   | Block personal routing release, repair the permanent Phase 17 surface, and rerun manual/automated evidence.                                                                               |
| `access_request_route_individual_scoring_total`                   | Any coordinator-level speed, read, decision, workload, rank, presence, or performance metric exposed or exported                                                             | Privacy + Product Governance                  | Disable/report removal, purge derived data where lawful, audit use, and restore aggregate health-only telemetry.                                                                          |

## Migration, rollout, rollback, and repair

### Rollout order

1. Register route/recipient/notification identities and glossary/ADR/OpenSpec
   contracts; mark current task/bell/contribution implementations as migration
   inputs only.
2. Add policy/member/generation schema, composite Tenant constraints, forced
   RLS, grants, immutable audit/receipt, and server command/read boundaries.
3. Ship the source-lane/current-request readers and every generic-task/
   notification/action denial before personal routing.
4. Ship the compact Base Maia settings card/Sheet, current-qualified picker,
   aggregate impact preview, and semantic save receipt with personal release
   disabled.
5. Shadow complete recipient resolution and Phase 17 assignment mapping across
   production-shaped Tenants; prove zero/indeterminate without fallback.
6. Enable route save and current-request differential reconciliation for a
   pilot while Tasks Hub/Phase 17 adapters remain shadowed.
7. Activate the ADR-0183 task adapter and both Phase 17 keys together for a
   canary only after generic mutation rejection, anti-storm grouping, 44px bell,
   accessibility, privacy, and reconciliation proof.
8. Observe all monitors, compare source-lane versus personal-attention outcomes,
   then expand gradually. External email remains off until D45.
9. Carry D44-R/AC IDs and release evidence into OpenSpec/design/tasks/tickets;
   run the deferred broad repository verification at the end of the Grill.

### Migration rules

- Every Tenant begins with the code-owned `source_lane_only@1` effective
  default and no migration row; no member is inferred or copied.
- Existing D43 requests remain source-lane work. A Tenant's first deliberate
  named save uses the same fresh current-impact and all-current adoption path.
- Existing task, bell demo, finance approver, admin, group, Website, Mobilize,
  grantor, or directory rows are never backfilled as D44 policy/history.
- Unknown contract versions fail closed to no personal projection while the
  source lane stays available.

### Rollback and kill switches

- Independent kill switches stop new task, per-request item, grouped update
  item, external email, or executor dispatch. They do not change route, request,
  grant, access, source-lane, or durable history.
- Rollback never deletes policy/generation/audit/engagement/delivery evidence,
  guesses lane-only from missing projections, regrants access, or revives an
  ended recipient generation.
- Read-time current authorization and route checks remain adverse during
  projection rollback so a stale row cannot restore visibility.
- Roll forward by reconciling current product heads and adapter claims; never
  replay a D43 business decision or use provider logs as truth.

### Repair

- Rebuild recipient generations from policy/request/authorization heads and
  canonical set digest.
- Rebuild tasks and Phase 17 items from current generation/source state while
  preserving valid recipient engagement according to adapter identity.
- Correct policy only through an audited expected-head repair command; no
  direct base-table edits or silent member substitution.
- If source and projection disagree, source and current authorization win;
  projection is ended/rebuilt without changing request or access history.

## Ruthless synthesis

### Resolved before D44 is recorded

1. “Coordinator” is a responsibility member, never a role or permission.
2. The source lane remains complete, so optional routing cannot strand truth.
3. Only current exact-qualified Active Tenant Assignments may be newly selected.
4. The requester is excluded from personal attention without changing source
   authority.
5. Save applies to current and future pending work only after a fresh aggregate
   consequence review; prospective-only turnover debt is rejected.
6. Task and in-product notification are both required but remain independent;
   D44 does not leave Tasks Hub as the sole attention path.
7. Backlog adoption uses one grouped recipient/responsibility-application-
   generation notification,
   avoiding N-item bell storms while keeping individual tasks.
8. D45 is narrowed to external email; reminders remain a later separate
   decision.

### Requirements to carry into specification and design

- Route/member/recipient/item identities, closed modes, exact UI copy, current-
  qualified picker, impact token/cutover, complete result algebra, requester
  exclusion, Phase 17 mapping, differential conservation, anti-churn and anti-
  storm identities, source end rules, and protected-field allowlists.
- Same-Tenant composite relationships, append-only revisions/generations,
  partial uniqueness, restrictive deletion, forced RLS, hardened commands,
  semantic receipts, product claims, adapter reconciliation, and privileged-
  path parity.
- The 30 requirements, 120 acceptance criteria, rollout order, and every named
  monitor as traceable release evidence.

### Implementation safeguards

1. Build source readers and denials before writers or projections.
2. Commit policy/audit/receipt/outbox atomically; fanout only after commit.
3. Enforce removed/current eligibility at query/action time before cleanup.
4. Reconcile tasks and Phase 17 from one current recipient generation.
5. Keep every protected source body behind fresh Phase 12 detail authorization.
6. Apply D45's Tenant-default-Off, self-opt-out optional email contract; keep
   reminders absent pending D46.
7. Preserve lane-only/manual source operation during every dependency failure.

### Risks permitted only under named monitoring

- Whether three coordinators is enough: fourth-member attempts/support cases;
  Product + UX Research; versioned review only at the stated threshold.
- Whether personal routing improves outcomes: pending-age and proved-zero rates;
  Access Product + Tenant Governance; improve setup/UX, never broadcast.
- Whether task plus bell feels duplicative: confusion research signal; UX +
  Tasks + Notifications; improve correlation without merging truth/engagement.
- Whether route saves create excessive backlog attention: grouped-fanout signal;
  Notifications + Access Product; stop projector and repair grouping.

## Exact final D44 decision to record

> A Tenant may deliberately use the complete permission-filtered **Access
> requests** lane alone or name one to three unique, unordered, co-equal current
> same-Tenant Active Tenant Assignments as **Access request coordinators**.
> Newly selected members must independently satisfy D43's current exact-scope
> `permissions.manage_grants` recipient checks; configuration grants nothing.
> Each request re-proves current authority and excludes its requester from
> personal responsibility without changing separately lawful source-lane action.
>
> A fresh aggregate consequence review and confirmed policy save make the route
> current for all open and future pending D43 requests. Continuing recipients
> preserve engagement; newly admitted recipients receive individual source-
> backed tasks; removed recipients end as **Coordinator responsibility changed**;
> unchanged effective sets create no churn. D43 source state and access never
> change from routing.
>
> Tasks Hub is not the only attention path. A new request creates one safe
> source-actionable `holder_access_review_requested_v1` Phase 17 item for each
> admitted coordinator. A route/eligibility change admitting a coordinator to
> existing work creates individual tasks but only one safe
> `access_request_responsibility_updated_v1` in-product item for that recipient
> and responsibility-application generation. Both deep-link to People & access,
> copy no protected
> source detail, and share neither engagement nor authority. D45 now adds one
> optional immediate email sibling under a Tenant-default-Off, recipient
> `inherit | disabled` policy; reminders require a later D46 decision.
>
> Proved-zero or indeterminate resolution sends nobody and never falls back;
> the authoritative source lane remains. Tasks, notifications, email, and
> Inngest remain replaceable projections/executors and can neither select
> authority nor decide, close, or mutate a request or grant.

## D45 — Should external email supplement the required in-product attention?

> **Historical prompt — resolved by D45 on 2026-08-29.** The founder selected
> Option 1, optional immediate email default Off. The corrected contract and
> its adversarial disposition are authoritative in the D45 artifacts and Phase
> 24 decision log; the options below are retained only as decision provenance.

Jordan submits a D43 access review request. Ana is an eligible configured
coordinator. D44 already guarantees that Ana receives one personal Tasks Hub
assignment and one source-actionable Notification Center item; either opens the
same freshly authorized People & access detail. D45 decides only whether Core
also sends Ana an external email. Email can reach staff who are away from
Mission Control, but it adds deliverability, privacy, preference, duplication,
and notification-fatigue costs. It must never carry decision buttons or
protected request detail.

### Option 1 — optional immediate email, default off — recommended

The Tenant may enable an initial email supplement, and it is sent only when the
admitted coordinator's recipient preference also allows it. The safe email
contains the Tenant brand, **Access review needs attention**, and an
authenticated link to People & access—no reason, capability/provenance detail,
Keep/Remove button, peer names, or sensitive preview. In-product/task truth
works if email is disabled, suppressed, delayed, bounced, or unavailable.
One new request may produce one email; backlog adoption may produce at most one
grouped email for the matching responsibility-update occurrence, never one
email per historical child request.

This is the best balance: it honors different ministry operating conditions,
keeps the default quiet and privacy-minimizing, and treats email as delivery
rather than governance truth. The settings must clearly distinguish Tenant
enablement from recipient preference and must not promise delivery.

### Option 2 — mandatory immediate email

Every admitted coordinator gets a required safe initial or grouped-update email
step in addition to task and in-product attention, with no recipient opt-out.
Current destination, suppression, source-fence, and provider-safety checks may
still block delivery, and the UI must not claim receipt. This maximizes nominal
reach but creates noise, privacy/deliverability burden, and a brittle mandatory
expectation for users who work primarily in Mission Control.

### Option 3 — no external email

Keep the required Tasks Hub and Notification Center experience only. This is
the smallest and most private implementation, but coordinators who do not open
Mission Control regularly may miss new responsibility.

All options exclude SMS, push, Slack, Teams, email decision buttons, protected
email content, automatic escalation, and reminders. Reminder/escalation policy
would be a later separate D46 decision.

**Recommendation:** Option 1. It adds a useful reach channel without making
email mandatory or authoritative and preserves a clear default-off posture.

**D45: Should Core use Option 1 — optional immediate email when the Tenant
enables it and the coordinator preference allows it, Option 2 — mandatory
immediate email, or Option 3 — no external email?**
