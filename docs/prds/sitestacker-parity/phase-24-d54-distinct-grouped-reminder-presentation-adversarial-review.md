# Phase 24 D54 — Distinct, Request-Grouped Courtesy-Reminder Presentation

- **Status:** Founder Option 1 adjudicated; documentation-only contract
- **Founder direction:** create one distinct recipient-specific reminder item,
  perceptually and programmatically grouped with the existing request attention
- **Disposition:** **Accept with required amendments**
- **Date reviewed:** 2026-08-29
- **Scope:** local in-product identity, grouping, engagement, source ownership,
  authorization, RLS implications, privacy, lifecycle, concurrency, failure,
  retention, rollout, accessibility, performance, proof, monitoring, and the D55
  urgent-safety-withdrawal question
- **Non-scope:** no runtime implementation, stable-key registration, manifest or
  OpenSpec mutation, database/schema/RLS migration, worker, message publication,
  external channel, timing-pair value, Tasks Hub change, generic conversation or
  notification-threading platform, exact responsive spacing/breakpoint values,
  or urgent safety-withdrawal answer

## Executive adjudication

Option 1 is the strongest permanent direction, but the unqualified phrase
“grouped with the existing request attention” is unsafe. D44 does not guarantee
that every D49 recipient has a per-request initial notification. A coordinator
newly admitted to already-pending work receives the aggregate
`access_request_responsibility_updated_v1` occurrence, not a fabricated
`holder_access_review_requested_v1` child for every request. Grouping a later
per-request reminder into that aggregate would cross source episodes, alter the
aggregate's membership meaning, and contradict ADR-0027.

The corrected D54 decision is:

> After—and only after—an exact complete timing profile passes D47/D53 and the
> complete D46–D54-plus activation package, one current D43 request may create
> at most one source-owned courtesy-reminder occurrence under D47–D52. For each
> exact D49 sealed recipient member that still passes current same-Tenant,
> Party, role, assignment, source-visibility, authorization, privacy,
> cancellation, and usefulness checks at one atomic release boundary, Phase 17
> may create at most one distinct recipient-specific in-product item using the
> exact courtesy-reminder semantic key registered only by that future activation.
>
> The reminder item is a new attention projection, not a resend or mutation of
> `holder_access_review_requested_v1`, the D44 responsibility-update aggregate,
> the D43 request, the access grant, or the ADR-0183 source-backed task. Its
> immutable semantic identity is the exact Tenant + reminder source occurrence
>
> - sealed recipient-member identity + recipient Party/role/surface + stable
>   message key. Product-database uniqueness owns replay. Changed immutable
>   meaning hard-conflicts; a future changed meaning requires a successor key.
>
> Phase 17 derives one deterministic, rebuildable, recipient-private
> **Access-review attention group** from the exact Tenant, D43 request occurrence,
> recipient Party, recipient role/surface, privacy class, and group-contract
> revision. The group may contain zero or one exact per-request initial item and
> zero or one exact courtesy-reminder item for that recipient. When the matching
> initial child exists, both children share that group; when it never existed,
> is not yet materialized, or is no longer presentable, Core does not fabricate,
> revive, clone, or backfill it—the reminder remains a complete, understandable
> item in the same one-child **Access-review attention group**. The aggregate
> `access_request_responsibility_updated_v1`, another request, another recipient,
> role, surface, privacy boundary, or Tenant can never join the group.
>
> Children retain independent immutable occurrence history and recipient
> engagement. Creating the reminder makes only that new item unread. It never
> changes the initial item's `seen/read/archive` evidence, timestamp, order, or
> presentation end. The group has no independent read/archive/source truth:
> badge contribution is the Boolean OR of currently presentable unread children
> and is at most one; **Needs attention** is derived from current actionable
> children; group actions, if the common Phase 17 UI exposes them, operate as
> explicit idempotent child operations and never imply source completion.
>
> The reminder uses
> `presentation.source_actionable_then_recent_90d@1` and a key-specific source-
> applicability rule. It remains actionable only while the exact D43 request is
> `pending_review`, that recipient generation remains continuously current and
> authorized, and D51/D52 have not ended its applicability. Source resolution,
> withdrawal, recipient loss, Off fencing, or another registered end reason
> removes active/unread contribution without fabricating read, dismissal,
> archive, task completion, or request resolution. A lawfully released item may
> remain authorized Recent history under ADR-0027; unreleased work that loses a
> gate never appears late.
>
> Its protected semantic core is ordinary **Attention**, never **Urgent**:
> title **Access review is still waiting**; category **Access requests**; safe
> supporting meaning **Review this request in People & access. This courtesy
> reminder does not set a due date or change access.**; primary action **Review
> in People & access** through a typed authenticated destination. The item
> contains no holder/requester identity, capability/group, reason, continuity or
> provenance detail, deadline, age, blame, SLA, escalation, provider/worker
> state, inline Keep/Remove action, or promise that anyone saw earlier
> attention. Meaning-preserving editorial/localization improvements need normal
> review, not a new key; a material meaning or action change does.
>
> Perceptual grouping uses Core's Base Maia/Zinc hierarchy, spacing, boundary,
> and visible text; programmatic grouping uses native list/section structure or
> a tested equivalent with an accessible group label, child names/descriptions,
> relationship, count, DOM/reading order, and keyboard order. Color, indentation,
> icon, avatar, animation, proximity, or timestamp alone never carries the
> relationship or unread state. D54 does not mandate an ARIA `feed`, tree,
> listbox, nested interactive row, or new primitive. The ordinary presentation
> is one adaptive compact summary with an explicit shared Base UI disclosure of
> the short child chronology; disclosure is not a separate founder/domain
> choice. Exact spacing, breakpoint, truncation, and responsive density remain
> implementation choices that must pass design and usability proof.
>
> New arrival never steals focus, opens a modal/sheet, sounds, vibrates, shows an
> urgent banner, or injects an assertive live-region message. The existing bell
> and Notification Center update quietly; if the view is already open, an
> appropriately scoped polite status update may announce that the list changed
> without reading protected content. The same complete semantics, action, state,
> and grouping survive keyboard, screen reader, forced colors, 400% zoom/320 CSS
> pixels, long localization, RTL/CJK, touch, mobile sheet/page, slow network, and
> missed Realtime invalidation.
>
> D54 is documentation only. Until the full activation gate passes, there is no
> key, item, renderer, group, preference, message publication, task mutation,
> schema, API, worker, flag, telemetry, disabled UI, teaser, or production
> reminder. The current hard-coded bell demo is not a precedent.

The disposition is therefore **Accept with required amendments**, not an
unqualified acceptance of visual co-location.

## Current behavior, intended behavior, and permanent path

| Layer                           | Verified current behavior                                                                                               | D54 intended contract                                                                       | Best permanent path                                                                                                                         |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Product runtime                 | No D43–D54 reminder source, registered key, item, group, policy editor, worker, or migration ships.                     | Documentation gains one future local-presentation decision only.                            | Activate the exact contract atomically with the full D47/D53 release package; never land inert scaffolding.                                 |
| Current staff bell              | `dropdown-notification.tsx` is a hard-coded demo with fake people, avatars, “8 New,” and fake actions.                  | It is explicitly a migration/nonprecedent input.                                            | Replace it through the Phase 17 notification-center implementation using shared Base Maia/Base UI primitives and source-backed read models. |
| Initial request attention       | D44 specifies future `holder_access_review_requested_v1`; it is not implemented.                                        | A later reminder never rewrites it.                                                         | Preserve item identity and engagement; share only deterministic request-group identity.                                                     |
| Responsibility-update attention | D44 specifies one safe aggregate for newly admitted current work.                                                       | It never becomes a parent or child of an Access-review attention group.                     | Keep aggregate episode/cardinality independent and link users to the filtered source lane.                                                  |
| Tasks Hub                       | Current generic task implementations are not the D43 source contract; ADR-0183 specifies one future source-backed task. | No second task, date, priority, completion, comment, reminder row, or mutation.             | Both attention items link to the same authoritative source work while task/source/notification states remain independent.                   |
| Future UI                       | The governed Phase 17 center and D44 routes are specified, not shipped.                                                 | One recipient-private Access-review attention group presents the distinct child occurrence. | Reuse Phase 17 groups, keyset pagination, typed destinations, common engagement, and tested Base Maia disclosure/list primitives.           |

## Problem validity and strongest alternative

The root problem is not “make another notification.” If an evidence-admitted
courtesy occurrence exists, the coordinator needs dependable local awareness
without destroying truthful engagement history or creating duplicate work.
External email may be Off or unavailable; mutating the initial item would make
an old event look new; mutating the task would confuse attention with work.

The strongest alternative is D53 Option 2: keep the occurrence source-only and
create no new local item. That is simpler and quieter, but makes a separately
proved reminder locally invisible whenever external channels are Off. A second
ungrouped item is not a stronger alternative: it preserves history but creates
the visual impression of two independent requests. Resetting the initial item
or task is rejected by ADR-0027/0183. The corrected Option 1 is proportionate
because it uses an already-governed Phase 17 item plus rebuildable group and
adds no generic thread, conversation, activity-stream, or task-reminder model.

## Evidence classification

### Verified repository facts

- [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
  owns one item/group/engagement model, item-level presentation policy,
  source-derived actionability, one badge per group, and rebuildable groups.
- [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
  keeps the source-backed task, task engagement, notification engagement, and
  source completion independent.
- [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)
  owns D43 authorization and the D47–D53 reminder activation boundary.
- [Phase 12](./phase-12-full-role-permission-configuration.md) owns D43 request
  truth, D44 responsibility, the authoritative exact action, and current access.
- [Phase 17](./phase-17-system-messages-template-management.md) already specifies
  tenant-only items/groups, item-level engagement, typed destinations, source-
  actionable/Recent presentation, keyset pagination, and no cross-boundary group.
- [Identity and Access](../../../openspec/specs/identity-and-access/spec.md)
  requires server-resolved identity/Tenant/role, application authorization, RLS
  defense in depth, and server-side sensitive operations.
- [Workflow Orchestration](../../../openspec/specs/workflow-orchestration/spec.md)
  keeps product records/claims/idempotency authoritative and workflow envelopes
  identifier-only.
- Core's frontend contract fixes Base Maia, Base UI, Zinc-derived semantic
  tokens, shared `@asym/ui` ownership, native semantics first, and manual plus
  automated accessibility proof.

### Verified current official primary evidence

| Source                                                                                                                                                                    | Verified fact                                                                                                                                                                                                      | D54 implication                                                                                                                                | Limit                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/)                                                                                                                                 | Relationships and meaningful sequence must be programmatically determinable; name/role/value and non-focus-stealing status messages must be exposed; reflow, contrast, keyboard, focus, and target criteria apply. | Visual grouping alone is insufficient; DOM/reading/focus/state equivalence is a release gate.                                                  | WCAG does not choose Core's data identity, grouping key, content, or workflow.                                                    |
| [WAI APG disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)                                                                                        | A disclosure uses a button, `aria-expanded`, Enter/Space, and optionally `aria-controls`.                                                                                                                          | Use the existing Base UI disclosure for the short child chronology and prove it; do not create a custom row gesture.                           | APG is informative guidance and does not prescribe Core's spacing/breakpoints or replace testing.                                 |
| [WAI APG feed pattern](https://www.w3.org/WAI/ARIA/apg/patterns/feed/)                                                                                                    | `feed` is a specialized interoperability contract for dynamically loaded article streams, with significant focus/loading obligations.                                                                              | A normal paginated notification list should not casually claim `role=feed`; native list/section semantics are the safer baseline.              | A future true infinite feed could choose the pattern after separate proof.                                                        |
| [Apple HIG notifications](https://developer.apple.com/design/human-interface-guidelines/notifications)                                                                    | Notifications should be concise, privacy-safe, nonduplicative, useful at a glance, and not falsely urgent; foreground insertion should be discoverable without being invasive.                                     | Neutral copy, one grouped request unit, no protected preview, no sound/focus/modal, and no “Urgent” treatment fit current practice.            | Device push/permission behaviors do not govern Core's in-product source or engagement.                                            |
| [Android notification grouping](https://developer.android.com/develop/ui/views/notifications/group)                                                                       | Related children may be grouped, while each child remains a complete independent notification; a summary helps users understand the group.                                                                         | D54's child independence plus coherent group summary is a proven pattern.                                                                      | OS notification APIs, alert behavior, and automatic grouping are not Core architecture.                                           |
| [GitHub notification inbox](https://docs.github.com/en/subscriptions-and-notifications/how-tos/viewing-and-triaging-notifications/managing-notifications-from-your-inbox) | A mature work inbox preserves read/unread triage and offers grouping for quick overview.                                                                                                                           | Grouping should reduce scanning/context-switch cost without erasing child engagement.                                                          | GitHub's thread/Done/subscription semantics are not imported.                                                                     |
| [Microsoft Entra access reviews](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)                                                              | Initial review notifications and reminder notifications are separately configured/current-review communications to assigned reviewers.                                                                             | A reminder is a distinct occurrence to current reviewers, not a rewritten invitation.                                                          | Entra's deadlines, midpoint schedule, email focus, and send-even-if-finished behavior conflict with D43/D47–D52 and are rejected. |
| [Blackbaud Fundraiser Performance Management Activity](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fpm/guides/activity-center-tipsheet.pdf)                | A nonprofit fundraising product exposes task-owner/creator notifications and bell-managed preferences as explicit concepts.                                                                                        | Comparable ministry operations support visible attention, but task responsibility and notification presentation still need separate ownership. | The document does not prove Core's grouping, timing, recipient, privacy, or authorization semantics.                              |
| [Contentful Tasks](https://www.contentful.com/help/content-and-entries/tasks/)                                                                                            | A CMS models assignments, pending-task views, due dates, reminder delivery, and completion as task features.                                                                                                       | This is useful negative evidence: Core must not import a due-date/task-reminder model into D43 attention.                                      | Contentful's task/publish gate and email behavior are product-specific and conflict with ADR-0183/D50.                            |
| [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)                                                          | Deny by default, least privilege, permission validation on every request, relationship/attribute checks, and authorization tests are recommended.                                                                  | List, count, render, engagement, Realtime recovery, and deep-link actions must all re-prove the exact current recipient context.               | OWASP does not define Core capabilities or Tenant model.                                                                          |
| [PostgreSQL row-security documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)                                                                     | Enabled RLS with no applicable policy is default deny; `USING` governs visibility and `WITH CHECK` governs inserted/updated state.                                                                                 | Future tenant-only group/item/engagement policies need both read and mutation safety and cannot rely on UI hiding.                             | Table owners/BYPASSRLS require separate privileged-path parity; RLS is defense in depth, not sole authorization.                  |

### Reasonable inferences and product judgments

- One request-recipient group reduces duplicate-work perception while preserving
  item truth better than either ungrouped duplicate rows or engagement mutation.
- A one-child group is truthful and necessary because D44 aggregate assignment
  intentionally avoids per-request notification fanout.
- Group unread should be derived rather than stored; otherwise group and child
  engagement can contradict under races, repair, and partial visibility.
- A reminder remains ordinary **Attention**, because D43 has no deadline or
  automatic consequence and D50 forbids deadline interpretation.
- Native list/section semantics plus a Base UI disclosure, if later selected,
  are simpler and more robust than a bespoke ARIA feed/tree/thread widget.

### Assumptions requiring evidence before activation

- Representative coordinators understand **Access review is still waiting** as
  a courtesy reminder, not a deadline, blame signal, escalation, or access change.
- Grouping measurably reduces duplicate-work interpretation without hiding the
  new unread occurrence or the primary action.
- The reminder remains understandable when it is the group's only child.
- Screen-reader, keyboard, low-vision, cognitive, mobile, international, RTL/CJK,
  and low-bandwidth users can find the new occurrence and distinguish it from
  the initial one in the adaptive compact-summary/disclosed-chronology design.

### Unresolved unknowns

- Exact responsive density, spacing, and truncation remain design-proof details,
  not a founder/domain branch; D55 instead must settle urgent safety withdrawal.
- The D47/D53 process must produce an activated timing profile before any
  production implementation exists.
- Activation must set production-shaped latency/query budgets from measured
  Phase 17 baselines; D54 invents no unsupported millisecond threshold.
- A separate pre-activation decision still owns urgent safety withdrawal of an
  activated timing profile; D54 does not use presentation to solve it.

## Canonical ownership and projection boundaries

| Fact                                                                | Authoritative owner                                        | Derived/projection consumers                      | Forbidden owners                                                             |
| ------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------- |
| D43 request identity, status, source creation, exact current action | Phase 12 request aggregate/product DB                      | Tasks Hub, Phase 17, audit, typed destination     | Notification item/group, task, worker, browser, provider                     |
| Activated timing-profile identity and exact pair                    | Code-owned activated registry after D47/D53 package        | Tenant selected policy, D43 pinned tuple          | Tenant input, research file at runtime, UI, support, worker                  |
| Eligibility/usefulness/cancellation facts                           | D43 pinned source tuple plus current Phase 12 policy epoch | Release claim and audit                           | Notification age, task age, local clock, provider, Realtime                  |
| Reminder source occurrence                                          | Phase 12/product DB semantic occurrence                    | Phase 17 recipient intents/items, audit           | Item/group, task, Inngest run, message key alone                             |
| Sealed recipient cohort/member                                      | D49 source-owned resolution at occurrence commit           | Phase 17 per-recipient release                    | Current route lookup after the fact, task assignee, email, profile, group UI |
| Current recipient authorization/actionability                       | Phase 12 exact source/assignment/capability resolver       | Every list/count/render/mutation/action release   | Cached item/group, client claim, recipient membership alone                  |
| Reminder item identity/immutable preview                            | Phase 17 product DB under registered key                   | Notification Center, Realtime invalidation, audit | Provider message, browser ID, worker run, group projection                   |
| Item engagement                                                     | Exact recipient Party+role item engagement row             | Badge/group/read filters                          | Source request, task, email open/click, group row                            |
| Access-review attention group                                       | Rebuildable Phase 17 projection from admissible children   | Bell count and list presentation                  | Source/task truth, engagement truth, recipient authority                     |
| Task/action completion                                              | Phase 12 source result projected under ADR-0183            | Tasks Hub history, notification source end        | Read/archive/group expand, reminder release                                  |
| External delivery                                                   | Separately admitted Phase 6/17 channel intent/outcome      | Delivery audit                                    | Local item/read state or group visibility                                    |

## State and lifecycle model

### Source/member lifecycle

```text
not admitted
  └─ D48 request admitted under activated non-Off head
      └─ waiting before D50 not_before
          ├─ D43 terminal / D51 fenced / profile unsafe-withdrawn → no occurrence
          └─ eligible
              ├─ D52 useful_until reached first → terminal skip, no release
              └─ atomic reminder occurrence + D49 cohort seal
                  ├─ proved-zero member → no personal item
                  ├─ indeterminate member → no release; bounded same-occurrence retry
                  └─ exact current member re-proved
                      ├─ gate lost before release → no personal item
                      └─ release wins before useful_until → one immutable item
```

No transition returns to an earlier node. Replay reuses the same semantic
identity. A later policy enablement, re-enable, recipient restoration, task
mutation, or worker replay cannot mint a successor for the same D43 request.

### Item presentation lifecycle

```text
not released
  └─ released/actionable/unread
      ├─ explicit read → released/actionable/read
      ├─ explicit mark unread → released/actionable/unread
      └─ source/recipient applicability ends
          └─ authorized Recent history, non-unread
              ├─ current access loss → not presentable immediately
              └─ 90-day presentation ceiling → not presentable/purgeable preview
```

Archive is absent while the registered actionable source remains current.
Source end never writes `read_at`, `archive_at`, task completion, or a D43
decision. An item that ended before first presentation becomes non-unread but
remains truthfully unseen; Core does not fabricate read evidence.

### Group projection lifecycle

```text
no presentable children
  └─ first presentable child → one Access-review attention group
      ├─ second admissible child → same group, child histories unchanged
      ├─ any presentable unread child → badge contribution = 1
      ├─ no presentable unread child → badge contribution = 0
      ├─ any actionable child → group in Needs attention
      └─ no actionable child
          ├─ authorized Recent child → group in All/Recent only
          └─ no presentable child → group absent
```

The group is a deterministic projection, not a third engagement or lifecycle
authority. Rebuild must yield the same identity, membership, state, count, and
order from the current authorized children.

## Domain invariants

1. One admitted D43 request has at most one D47 reminder source occurrence.
2. One exact sealed D49 recipient member has at most one D54 reminder item.
3. One reminder item belongs to exactly one Tenant, Party, role, surface,
   privacy class, request occurrence, source occurrence, and group.
4. One Access-review attention group belongs to exactly one Tenant, D43 request
   occurrence, Party, role/surface, privacy class, and group-contract revision.
5. A D54 group has at most one matching per-request initial child and at most
   one reminder child. No child is required to manufacture the other.
6. `access_request_responsibility_updated_v1` never joins an Access-review
   attention group.
7. A child cannot move between groups; a changed immutable group key conflicts.
8. A group cannot cross Tenant, recipient, role, surface, privacy class, source
   request, or meaningful source episode.
9. Item engagement is personal and item-level. Group unread is derived and has
   no independent stored truth.
10. The group contributes zero or one badge, regardless of child count.
11. Reminder creation can change only reminder-item engagement, never initial-
    item, task, request, grant, email, or group-source state.
12. Reading/expanding/grouping never means request reviewed, access kept/
    removed, task completed, recipient aware, or another channel delivered.
13. The source recipient set is sealed; presentation may narrow at fire/read
    time but never widen or substitute.
14. Current authorization and source applicability are required at every
    protected boundary, not only item creation.
15. D51/D52 ceilings can prevent or end reminder presentation but cannot alter
    the still-independent D43 request or initial-item truth.
16. A released item is historically immutable except recipient engagement and
    source-owned once-set presentation end; protected preview purge is separate.
17. The privacy-safe item is complete when shown alone and does not depend on a
    hidden initial child for meaning.
18. All visible grouping, order, state, and action relationships have equivalent
    programmatic semantics and logical DOM/focus order.
19. Current hard-coded demo data and contribution/support notification models
    grant no implementation precedent or authority.
20. No D54 executable artifact exists before complete activation.

## Database, RLS, and authorization safety contract for later implementation

D54 adds no database change now. The eventual implementation must reuse the
Phase 17 schema family rather than create reminder-specific notification tables.

- Tenant-only item, group, and engagement rows carry non-null `tenant_id` and
  composite same-Tenant foreign keys. Cross-Tenant parent/child/group links are
  structurally impossible, not merely filtered in application code.
- The item references one same-scope communication event/intent, recipient
  Party+role/surface authority, D43 request occurrence, D49 sealed member,
  source fence, stable key/version, presentation policy, applicability rule,
  typed destination, group, safe preview, and immutable identity hashes.
- A permanent unique semantic tuple prevents duplicate release. Reusing it with
  different source, member, preview meaning, policy, action, group, or privacy
  hash is a hard conflict—not last-write-wins.
- The group key is server-derived and unique for the exact immutable group
  tuple. Group membership uses same-Tenant composite FKs and closed key/type
  checks. The group row contains only rebuildable projection/count fields.
- The authenticated/client role receives no INSERT/UPDATE/DELETE grant on item,
  group, communication event, source fence, semantic key, recipient, or end
  fields. Trusted source/Phase 17 commands derive them server-side.
- Engagement mutation accepts only the bounded action (`mark_read`,
  `mark_unread`, and only policy-permitted archive/restore), item ID, and
  expected engagement revision. Tenant, viewer, role, source, group, actor, and
  attribution derive from the validated session/current surface.
- RLS `USING` independently enforces same active Tenant, viewer Party+role,
  presentability, current relationship/capability, and privacy/source scope for
  list/count/detail/search/mutation. RLS `WITH CHECK` prevents engagement moves
  to another item/viewer/Tenant/role and forbidden state transformations.
- Table-owner, service-role, `SECURITY DEFINER`, RPC, view, function, Realtime,
  repair, support, export, and background paths prove the same recipient/source
  outcome. Security-definer functions pin `search_path`, use least grants, and
  return safe DTOs only.
- Deletes are restricted where history/audit references exist. Retention uses
  the registered Phase 17 purge boundary; it never cascades into D43, task,
  source event, another child, or engagement evidence outside policy.
- Query indexes begin with `tenant_id` and match exact recipient/surface,
  presentation state, group key, ordering cursor, source applicability, and
  semantic uniqueness. Activation must prove query plans with production-
  shaped high-cardinality and adversarial single-Tenant distributions.

## UX/UI contract

### Information architecture and hierarchy

- The existing staff bell and full Notification Center remain the only local
  destinations; D54 creates no Access-review-specific inbox or second badge and
  no donor, missionary, public, or cross-Tenant presentation.
- One request appears as one bounded visual unit. The most recent relevant child,
  unread state, group update count, category, neutral status, and primary action
  are understandable without opening protected source detail.
- The ordinary group is an adaptive compact summary with a short explicit Base
  UI disclosure chronology. Exact density adapts through tested implementation
  choices using Base Maia spacing/radii, semantic tokens,
  Lucide decorative icons only, and no avatar/person imagery for this private
  access-governance contract.
- Initial and reminder children retain distinguishable labels and localized
  occurrence timestamps. The timestamp describes when that item appeared, not
  request age, eligibility, usefulness, deadline, SLA, or fault.
- The safe item remains complete when shown alone. No copy says “again,” “still
  ignored,” or “as we told you” because earlier delivery/view is not guaranteed.

### Interaction and feedback

- The entire row is not a nested pseudo-button containing other controls.
  Primary navigation is a real typed link; disclosure and engagement actions
  are separately named real controls with predictable hit areas and focus order.
- Expanding/collapsing a group writes no read, seen, archive, source, or task
  state. Merely scrolling or receiving a Realtime invalidation does not either.
- Explicit child/group mark-read behavior uses the common Phase 17 engagement
  boundary. A group operation succeeds only for children individually
  authorized at execution; partial/stale results refetch and truthfully leave
  residual unread rather than claiming universal success.
- A deep-link click re-proves current authorization and source actionability.
  Authorized terminal history shows safe current status; unauthorized access
  denies without confirming the request or another Tenant's existence.
- Arrival is quiet. No modal, sheet auto-open, focus movement, sound, vibration,
  red/urgent styling, confetti, repeated toast, or assertive announcement.

### Accessibility, internationalization, and constrained conditions

- Use native `section`/heading/list/list-item/time/link/button semantics before
  ARIA. If disclosure is selected, Base UI exposes `aria-expanded` and the
  controlled relationship; do not invent tree/feed/listbox keyboard behavior.
- A visible group label and child labels/descriptions expose the exact same
  relationship in the accessibility tree. State never relies on color, weight,
  dot, indentation, icon direction, or proximity alone.
- DOM, visual, reading, and focus order remain logically aligned in LTR/RTL,
  zoom/reflow, mobile sheet/full page, localization expansion, and when one
  child is absent. No positive `tabIndex` or CSS visual reordering repairs it.
- All controls meet Core's 44 CSS-pixel touch target convention; visible focus,
  text/non-text contrast, forced colors, 400% zoom/320 CSS-pixel reflow, text
  spacing, keyboard, screen reader, reduced motion, long Latin/CJK, RTL/bidi,
  locale/time-zone display, and 200% text resize are release gates.
- Lists use keyset pagination and stable focus/cursor restoration. New items
  arriving above the viewport do not move focus or make the current row jump;
  a polite, privacy-safe update control/status lets the user refresh.
- Low bandwidth/offline UI never presents cached protected state as current.
  It preserves a stable shell and safe retry, does not duplicate optimistic
  engagement, and reconstructs from authoritative cursor state after reconnect.

## Failure, race, and recovery matrix

| Condition or race                                      | Safe outcome                                                                                            | Forbidden outcome                                  | Recovery/proof                                          |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------- |
| Duplicate worker/replay                                | Same semantic item/group returned                                                                       | Second item or unread increment                    | Permanent unique tuple + immutable hash comparison      |
| Two workers release at D52 upper boundary              | One DB serialization decides release-before-boundary or terminal skip                                   | Late item, both outcomes, local-clock decision     | Trusted DB time/claim + boundary concurrency test       |
| D51 Off races release                                  | Source fence winner decides; losing path creates no later effect                                        | Best-effort delete or late release                 | Locked epoch/head and atomic release claim              |
| Request resolves during release                        | Either release under proved current head then immediate source end, or no release                       | Actionable stale item or fabricated read           | Expected source head + query-time applicability         |
| Recipient loses role/assignment                        | No release or immediate not-presentable                                                                 | Historical authorization used as current           | Fire/read/action reproof and RLS                        |
| Recipient removed and re-added                         | Old member never revives; D49 rule governs any new source meaning                                       | Reuse old item/group engagement                    | Immutable generation/member identity                    |
| Initial child materialization failed                   | Reminder may appear alone if its own gates pass; later repair joins deterministic group                 | Block reminder forever or fabricate initial child  | Independent outbox claims + deterministic group rebuild |
| Reminder item committed, projection/group update fails | Item remains authoritative; group rebuild/reconcile repairs                                             | Source or item rollback, duplicate group           | Product outbox/claim and rebuild comparison             |
| Group exists with wrong child/hash                     | Fail closed from protected render; quarantine/repair group projection                                   | Silently move child or show mixed group            | Integrity monitor + deterministic rebuild               |
| Realtime event lost/duplicated/reordered               | Identifier-only invalidation; cursor read converges                                                     | Realtime payload as truth or duplicate unread      | Keyset/cursor recovery and product DB read              |
| User marks initial read while reminder arrives         | Initial CAS and new reminder unread both persist; group badge = 1                                       | Group-level last-write erases either child         | Item-level CAS + derived group state                    |
| Group mark-read races new reminder                     | Exact snapshot children change; new child remains unread unless included in a separately authorized CAS | “All read” claim covering unseen future child      | Expected group revision/member digest + refetch         |
| Source ends before first view                          | No unread debt; unseen remains truthful if Recent is authorized                                         | Fabricated `read_at` or task completion            | Once-set source end and derived non-unread              |
| Deep link stale/unauthorized                           | Safe current state or nondisclosing denial                                                              | Stale Keep/Remove or existence leak                | Server destination resolver and auth tests              |
| Tenant switch/back navigation                          | Tenant-partitioned cache clears/rekeys; exact active Tenant reproof                                     | Previous Tenant badge/preview flash                | Query-key partitioning and E2E switch test              |
| Network response lost after mark read                  | Retry with same expected operation returns durable result or current state                              | Toggle twice/unknown outcome                       | Idempotency/CAS receipt and refetch                     |
| One child reaches retention ceiling                    | Group recomputes from remaining presentable child                                                       | Group retention extends child or deletion cascades | Query-time ceiling + purge/rebuild test                 |
| Large Tenant/high arrival rate                         | Indexed keyset/group projection stays within measured release budgets                                   | Full scans/N+1/offset drift                        | EXPLAIN/load suite and SLO monitor                      |

## Normative requirements

- **D54-R1:** D54 accepts a distinct recipient-specific local reminder only
  after the exact D47/D53 candidate and full D46–D54-plus activation pass; this
  document creates no executable artifact.
- **D54-R2:** Current runtime and UX remain unchanged; the hard-coded bell demo
  is not a source, schema, interaction, or visual-data precedent.
- **D54-R3:** One D43 request owns at most one source reminder occurrence, and
  one exact sealed D49 recipient member owns at most one D54 item.
- **D54-R4:** Only a future activation may assign and register the courtesy-
  reminder key for this distinct stable meaning; D54 neither names, registers,
  reserves, manifests, nor creates an executable key.
- **D54-R5:** Product-database semantic uniqueness binds exact Tenant, source
  occurrence, recipient member/Party/role/surface, and key; replay returns the
  same item and immutable mismatch hard-conflicts.
- **D54-R6:** One deterministic rebuildable **Access-review attention group**
  binds exact
  Tenant, D43 request, recipient Party/role/surface, privacy class, and group-
  contract revision.
- **D54-R7:** The group may contain only the matching per-request initial child
  and reminder child; a missing initial child remains missing, and the D44
  responsibility-update aggregate never joins.
- **D54-R8:** No group crosses request, Tenant, recipient, role, surface,
  privacy, source episode, or message meaning; at most one of each admitted
  child key exists.
- **D54-R9:** Child occurrence/history/engagement are independent. Reminder
  release changes only reminder unread; it cannot reset, clone, move, timestamp,
  archive, or otherwise mutate the initial item.
- **D54-R10:** Group badge, unread, Needs-attention, Recent, ordering, and count
  are deterministic projections from currently authorized presentable children,
  never independent business or engagement truth.
- **D54-R11:** D54 creates no task, task reminder, due date, priority, comment,
  completion, assignment, filter, activity entry, or mutation; the D43 source-
  backed task remains one independent work projection.
- **D54-R12:** The item uses
  `presentation.source_actionable_then_recent_90d@1` plus one exact key-specific
  D43/D49/D51/D52 applicability/end rule.
- **D54-R13:** Release, list, count, search, render, engagement, Realtime
  recovery, support, export, and action resolve exact current same-Tenant
  recipient authorization and source applicability; cached membership grants nothing.
- **D54-R14:** Source end removes active/unread contribution without fabricating
  read, dismissal, archive, task completion, decision, or access change; permitted
  Recent history remains body-minimized and authorization-bound.
- **D54-R15:** D51 Off and D52 `useful_until` prevent late first release but do
  not erase a lawfully released occurrence, alter initial attention, or change
  D43/task truth.
- **D54-R16:** The semantic core is neutral “still waiting” courtesy attention
  with no deadline, urgency, blame, escalation, SLA, awareness, access-change,
  or delivery claim; material meaning/action change requires a successor key.
- **D54-R17:** List/group/item facts are privacy-minimized and contain no holder,
  requester, reason, capability, group, provenance, authority, decision, or
  sensitive ministry/location/member-care detail.
- **D54-R18:** Perceptual and programmatic grouping convey the same relationship,
  labels, states, count, and order; color/proximity/icon/timestamp alone is invalid.
- **D54-R19:** Native semantics and existing Base UI primitives own behavior;
  custom feed/tree/listbox/thread keyboard systems, nested interactive rows, and
  app-local primitives are prohibited without a separate justified decision.
- **D54-R20:** Keyboard, screen reader, forced colors, focus, contrast, 44-pixel
  touch targets, reflow/zoom, text spacing, reduced motion, localization, RTL/
  CJK, mobile, time-zone display, and low-bandwidth outcomes are release gates.
- **D54-R21:** New arrival is quiet and noninterruptive: no focus theft, auto-
  open, modal, sound, vibration, urgent styling, assertive announcement, or
  guaranteed-delivery language.
- **D54-R22:** Expand/collapse and scrolling write no engagement. Explicit
  child/group engagement uses item-level idempotent CAS and reports partial or
  stale outcomes truthfully.
- **D54-R23:** Phase 12 owns request/actionability/recipients; Phase 17 owns
  item/presentation/engagement; the group is rebuildable projection; ADR-0183
  owns task projection; no consumer becomes write authority for another.
- **D54-R24:** Later schema uses same-Tenant composites, restrictive deletion,
  immutable identity hashes, least grants, application checks, RLS `USING` and
  `WITH CHECK`, and privileged-path parity; caller data cannot author trust fields.
- **D54-R25:** Atomic source-head/fence/member/usefulness claims and permanent
  semantic uniqueness resolve release, Off, expiry, recipient, and replay races;
  browser/workflow/provider clocks and IDs never decide.
- **D54-R26:** Partial projection failure is recoverable from product-owned
  source/outbox/claim evidence. Reconciliation is idempotent, bounded, and never
  invents an item, group, recipient, engagement, task, or source outcome.
- **D54-R27:** Item and group presentation obey Phase 17 retention. Grouping,
  read/unread, retry, worker lag, or another child cannot extend a child's
  nonextendable ceiling; durable body-free audit remains separate.
- **D54-R28:** Rollout is additive, deny-first, no-backfill, decoder/reader first,
  writer then UI last, complete-Tenant, mixed-version safe, killable by narrowing,
  and roll-forward repairable; rollback never deletes new history.
- **D54-R29:** Activation proves bounded indexed keyset/group queries,
  high-cardinality and skewed-Tenant load, cursor/Realtime recovery, exact
  metrics/audit, and a named measured SLO; D54 invents no unsupported latency number.
- **D54-R30:** The UI uses one adaptive compact summary plus a short disclosed
  child chronology, while exact spacing/breakpoints/truncation require design
  proof rather than a founder decision. D55 instead chooses the pre-activation
  urgent-safety-withdrawal contract and cannot weaken D54 invariants.

## Ruthless adversarial review

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.**

| What could go wrong                                                                                                                                                         | Why it matters                                                                                         | Severity | Likelihood                 | Evidence or reasoning                                                                                                                        | Effect on answer                                                                                                            | Best permanent fix                                                                                        | Exact decision/specification language                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core could create a second noisy row when the existing lane/task/initial item already provides sufficient attention, or could group merely because grouping is fashionable. | Notification fatigue can make all attention less useful; a visual duplicate looks like duplicate work. | High     | Medium absent D47 evidence | D46 is the valid no-reminder baseline; Apple advises against multiple notifications for the same thing; D47/D53 require proof over no-build. | Narrows but does not invalidate Option 1: no item exists until the complete profile and presentation jointly pass evidence. | Require the reminder to beat no-build and prove grouped comprehension; keep Off permanent if it does not. | “A D54 item may activate only with the exact D47/D53 profile evidence and D54 usability proof showing material benefit over the complete D46 baseline without unacceptable fatigue or duplicate-work interpretation.” |

### 2. Brittleness

**Material concern: Yes.**

| What could go wrong                                                                                                                                  | Why it matters                                                                                                             | Severity | Likelihood                      | Evidence or reasoning                                                                                                | Effect on answer                                                       | Best permanent fix                                                                                       | Exact decision/specification language                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Grouping might depend on mutable title text, timestamp proximity, task ID, current route, array order, or a successfully materialized initial child. | Localization, routing changes, replay, projection lag, or late recipient admission would split/merge groups unpredictably. | Critical | High under naive implementation | ADR-0027 requires deterministic episode grouping; D44 late admission may have only an aggregate responsibility item. | Requires a precise immutable group identity and valid one-child state. | Derive group key server-side from exact request-recipient/privacy contract; never require another child. | “Group identity is the immutable Tenant+D43 request+Party+role/surface+privacy+group-contract tuple; title/time/task/array position/initial-child presence are not inputs.” |

### 3. Technical debt

**Material concern: Yes.**

| What could go wrong                                                                                                                             | Why it matters                                                                           | Severity | Likelihood                        | Evidence or reasoning                                                                        | Effect on answer                    | Best permanent fix                                                                                         | Exact decision/specification language                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------- | --------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Teams may build generic threads, conversations, activity streams, per-feature group tables, or duplicated engagement reducers for two children. | It creates overlapping models, migrations, APIs, and long-term divergence from Phase 17. | High     | High if “thread” is used casually | Phase 17 already owns item/group/engagement and explicitly bounds groups to source episodes. | Rejects any new grouping subsystem. | Add one stable key and one group contract to existing Phase 17 only inside the future complete activation. | “D54 reuses Phase 17 items, engagement, attention groups, typed destinations, retention, and outbox; it adds no reminder-specific or generic threading platform.” |

### 4. Edge cases

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                      | Why it matters                                                                                                                         | Severity | Likelihood        | Evidence or reasoning                                                                               | Effect on answer                                                      | Best permanent fix                                                                                                   | Exact decision/specification language                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Recipient joined after request creation, initial materialization failed, one child aged out, role changed, request resolved during release, or only one child is authorized/presentable. | Assuming a two-child happy path either fabricates history, hides a valid reminder, leaks a child, or leaves an incomprehensible group. | Critical | High in aggregate | D44 aggregate current-work behavior and ADR-0027 item-level applicability make all cases realistic. | Changes “group with existing item” into conditional group membership. | Make each child self-contained; allow zero/one initial and zero/one reminder; derive only from presentable children. | “A missing, failed, ended, unauthorized, or purged initial child is never fabricated or required; the reminder remains complete in a one-child Access-review attention group.” |

### 5. Footguns

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                 | Why it matters                                                                                    | Severity | Likelihood                      | Evidence or reasoning                                                                       | Effect on answer                           | Best permanent fix                                                                              | Exact decision/specification language                                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------- | ------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A developer may reset initial unread, update its `available_at`, group with the D44 aggregate, copy a task ID as group ID, or make the whole card clickable around nested controls. | These shortcuts corrupt engagement, cross episodes, create race bugs, and harm keyboard/touch UX. | High     | High without explicit negatives | These are locally tempting implementations; WCAG focus/order and ADR-0027/0183 reject them. | Adds hard prohibitions and negative tests. | Immutable initial row; closed child keys; derived group; separate native controls; no task key. | “No update path may mutate initial engagement/time/group, admit the responsibility aggregate, accept a task/browser group key, or nest independent controls inside a pseudo-clickable row.” |

### 6. Tenant safety

**Material concern: Yes.**

| What could go wrong                                                                                                                                      | Why it matters                                                                 | Severity | Likelihood                      | Evidence or reasoning                                                           | Effect on answer                                                                  | Best permanent fix                                                                                               | Exact decision/specification language                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------- | ------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cache, group keys, Realtime, search, badge counts, support views, or repair could mix Tenants/roles or reveal that another Tenant has an access request. | Even a count/title/group relationship leaks protected operational information. | Critical | Medium without defense in depth | Core treats Tenant/role as product boundaries; Phase 17 groups are tenant-only. | Requires every derived path to be Tenant/recipient scoped, not just detail reads. | Same-Tenant composite constraints, partitioned caches/query keys, RLS, server reproof, identifier-only Realtime. | “No item/group/count/search/invalidation/support/export path may cross active Tenant, Party, role/surface, privacy, or exact recipient authority; mismatch returns no existence signal.” |

### 7. Database, RLS, and authorization safety

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                 | Why it matters                                                                                      | Severity | Likelihood                   | Evidence or reasoning                                                                                              | Effect on answer                                                   | Best permanent fix                                                                                                                | Exact decision/specification language                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Caller-controlled Tenant/recipient/group/source/end/actor fields, incomplete FKs, permissive grants, missing `WITH CHECK`, or owner/service-role bypass could create/move/read another user's item. | Notification existence and actions expose access-governance state and can falsify audit/engagement. | Critical | Medium during implementation | OpenSpec requires server-derived identity plus RLS backup; PostgreSQL distinguishes visibility and new-row checks. | Requires a single trusted mutation boundary and privileged parity. | Composite same-Tenant FKs; immutable rows; least grants; explicit `USING`/`WITH CHECK`; server-derived actor; service-path tests. | “All trust fields derive from validated server context; RLS and application checks protect reads and transformed rows, and privileged paths prove identical Tenant/recipient/source outcomes.” |

### 8. Overengineering

**Material concern: Yes.**

| What could go wrong                                                                                                                                       | Why it matters                                                                                          | Severity | Likelihood | Evidence or reasoning                                                                                | Effect on answer                           | Best permanent fix                                                                                                                                  | Exact decision/specification language                                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------- | ---------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A universal thread DSL, arbitrary child kinds, group policies, per-Tenant layouts, custom ARIA feed, relevance scoring, or ML deduplication may be added. | Complexity solves speculative notification classes and multiplies authorization/a11y/test combinations. | Medium   | Medium     | D54 needs two closed meanings in one exact episode; Phase 17 already has a small finite group model. | Narrows architecture to a closed contract. | Future activation registers one code-owned group kind/revision, at most two admitted child meanings, and a deterministic reducer; no customization. | “D54 defines one finite Access-review attention-group semantic contract without naming a runtime identifier; new child meanings or group behaviors require a separately reviewed activation, not configuration or inference.” |

### 9. UX/UI and user friction

**Material concern: Yes.**

| What could go wrong                                                                                                                                         | Why it matters                                                                                       | Severity | Likelihood                            | Evidence or reasoning                                                                                                      | Effect on answer                                                                            | Best permanent fix                                                                                                                                               | Exact decision/specification language                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Grouping could hide the new unread reminder, show two identical rows, imply two tasks, use blame/urgency, overload mobile, or depend on a dot/color/avatar. | Coordinators may miss real work, act twice, feel blamed, or misunderstand an access deadline/change. | High     | High without tested content/hierarchy | WCAG requires equivalent structure; Apple/Android support concise complete grouped children; D50 forbids deadline meaning. | Requires exact neutral semantics and tested adaptive disclosure—not another founder branch. | One bounded compact request unit, distinct child labels, one badge, explicit update count, short chronology disclosure, safe action, no protected/avatar detail. | “The UI communicates one request, a distinct new courtesy update, independent unread, and one source action without deadline, blame, urgency, duplicate-work, or color-only meaning.” |

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.**

| What could go wrong                                                                                                                               | Why it matters                                                                         | Severity | Likelihood | Evidence or reasoning                                                                                  | Effect on answer                                   | Best permanent fix                                                                                                 | Exact decision/specification language                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Group/latest child/read/task/provider state could become request status or recipient authority, while source updates attempt to write engagement. | Circular ownership produces false completion, access changes, and irreparable history. | Critical | Medium     | ADR-0027 and ADR-0183 deliberately separate source, task, presentation, delivery, and engagement axes. | Accept only with explicit owner matrix/invariants. | Source owns actionability; item owns immutable presentation; viewer owns engagement; group derives; task projects. | “No source, task, item, group, engagement, channel, or worker may infer or mutate another domain's authoritative fact; all joins are read/projection boundaries.” |

### 11. Hidden coupling

**Material concern: Yes.**

| What could go wrong                                                                                                                                        | Why it matters                                                                                                              | Severity | Likelihood | Evidence or reasoning                                                                                      | Effect on answer                                                        | Best permanent fix                                                                                          | Exact decision/specification language                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Group behavior may couple to English copy, one timing pair, email, dropdown width, current component demo, notification order, or D44 route configuration. | Localization, new profile revisions, mobile layouts, provider changes, or coordinator policy changes would break semantics. | High     | Medium     | Current demo is fake; message meaning and channel are separately governed; D53 supports profile revisions. | Requires semantic/versioned identities and channel/layout independence. | Key/group policy references, typed destination, localized renderer, channel siblings, measured UI variants. | “Grouping keys contain no literal copy, profile seconds, channel/provider, component, route-member, or display-order input; those remain pinned independent dependencies.” |

### 12. Failure modes

**Material concern: Yes.**

| What could go wrong                                                                                                                               | Why it matters                                                                    | Severity | Likelihood | Evidence or reasoning                                                                                 | Effect on answer                                                                | Best permanent fix                                                                                             | Exact decision/specification language                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Item commits but group/realtime fails, group corrupts, response is lost, projection lags past usefulness, or source ends between read and action. | Users see duplicates/stale work, or operators blindly replay an ambiguous effect. | High     | Medium     | Workflow OpenSpec requires product claims/ledger and source re-read; Phase 17 groups are rebuildable. | Requires independent durable item, deterministic repair, and safe stale action. | Atomic item/outbox claim; idempotent group rebuild; cursor recovery; current action resolver; no blind resend. | “Any partial failure preserves source/item truth, exposes bounded operational evidence, and repairs from identifiers; it never rekeys, clones, widens, or assumes delivery/action.” |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.**

| What could go wrong                                                                                                                     | Why it matters                                                                                           | Severity | Likelihood        | Evidence or reasoning                                                                    | Effect on answer                                                           | Best permanent fix                                                                                                | Exact decision/specification language                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------- | ----------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Release can race D51 Off, D52 expiry, request resolution, recipient loss, duplicate jobs, mark-read, group rebuild, or retention purge. | Two individually valid actions may jointly create late attention, erase unread, or revive ended history. | Critical | High in aggregate | D48–D52 explicitly establish atomic fences/half-open interval; item engagement uses CAS. | Requires durable business-effect idempotency and serialized source checks. | Product DB claim with expected heads/epoch/member/usefulness; permanent semantic unique; item CAS; derived group. | “Exactly one database winner decides reminder release; replays and concurrent engagement/rebuild/purge converge without late release, revival, lost read, or duplicate child/group.” |

### 14. Data integrity risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                            | Why it matters                                                                             | Severity | Likelihood | Evidence or reasoning                                                                   | Effect on answer                                 | Best permanent fix                                                                                        | Exact decision/specification language                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------- | ---------- | --------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Duplicate children, wrong group membership, stale counts, orphan engagement, mismatched safe preview/hash, or cascaded deletion may corrupt history/reporting. | Users and auditors cannot reconstruct which occurrence was shown or why the badge changed. | Critical | Medium     | Phase 17 data model separates immutable items, engagement, group projection, and audit. | Adds constraints, rebuild proof, and quarantine. | Closed keys, composite FKs, unique tuples, restricted deletes, deterministic membership/count comparison. | “Any immutable identity/content/group mismatch quarantines protected presentation and blocks release/repair; it is never normalized or silently overwritten.” |

### 15. Security and privacy risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                   | Why it matters                                                                                                     | Severity | Likelihood | Evidence or reasoning                                                                                                               | Effect on answer                                                       | Best permanent fix                                                                                                                  | Exact decision/specification language                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bell previews, search, caches, logs, analytics, screenshots, support exports, or accessible names may reveal holder/requester, capability, sensitive ministry detail, or existence after access loss. | Access governance and missionary/member-care context can be highly sensitive; accessible text is still disclosure. | Critical | Medium     | Apple warns against sensitive notification content; Core Phase 12/17 already specifies safe list facts and fresh protected loaders. | Requires stricter minimal preview and immediate denial on access loss. | Code-owned safe facts only, body-free audit, cache partition/eviction, no content logs/analytics, current authorization everywhere. | “The reminder/group contains only code-owned safe meaning/count/action; protected detail stays in Phase 12 and loss of current authority removes active and Recent presentation immediately.” |

### 16. Scalability and performance risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                | Why it matters                                                                     | Severity | Likelihood | Evidence or reasoning                                                                                                                          | Effect on answer                                                                 | Best permanent fix                                                                                                                   | Exact decision/specification language                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | -------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Per-row source/auth queries, offset pagination, group recomputation scans, unread double counting, or skewed large Tenants may make the bell slow or inconsistent. | Slow attention surfaces are ignored; timeouts can fail open or show stale results. | High     | Medium     | Phase 17 mandates keyset pagination; group/current projections exist for bounded reads. No current measured budget justifies invented numbers. | Requires measured release budgets and production-shaped plans before activation. | Tenant/recipient/state/cursor indexes; batched authorized read model; rebuildable materialized group projection; EXPLAIN/load proof. | “Activation records measured p50/p95/p99 list/count/rebuild budgets and dataset cardinalities; breach blocks release, and D54 makes no unverified ‘fast’ claim.” |

### 17. Operational burden

**Material concern: Yes.**

| What could go wrong                                                                                                         | Why it matters                                                                    | Severity | Likelihood | Evidence or reasoning                                                                                     | Effect on answer                                                     | Best permanent fix                                                                                                | Exact decision/specification language                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operators may need SQL to merge groups, reset unread, resend reminders, repair missing initials, or resolve duplicate rows. | Manual protected-data surgery creates inconsistent outcomes and tribal knowledge. | High     | Medium     | Product-owned idempotency/group rebuild can automate all legitimate repair; initial absence may be valid. | Requires bounded safe repair and prohibits manual semantic mutation. | One group integrity/rebuild operation, source/item reconciliation, audit-visible quarantine, no blind send/reset. | “Normal recovery is deterministic replay/rebuild from source identifiers; direct item/group/engagement edits and manual reminder creation are unsupported.” |

### 18. Observability and auditability gaps

**Material concern: Yes.**

| What could go wrong                                                                                                            | Why it matters                                                                                   | Severity | Likelihood | Evidence or reasoning                                                                                            | Effect on answer                                                   | Best permanent fix                                                                                                                                   | Exact decision/specification language                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | -------- | ---------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logs may show a worker succeeded while no item was queryable, or item/read/group changes may lack source/actor/reason lineage. | Staff cannot explain missing/duplicate attention or distinguish source end from user engagement. | High     | Medium     | Workflow/product records must remain authority; ADR-0027 separates durable business history from technical logs. | Adds durable receipts and outcome taxonomy, not content telemetry. | Source/member release/skip/suppression, item/group reconciliation, engagement actor/revision, and destination denial evidence with safe IDs/reasons. | “Every effect traces source occurrence→sealed member→item→group→engagement/source end without protected content; logs/traces alone never count as business evidence.” |

### 19. Dependency and integration risks

**Material concern: Yes.**

| What could go wrong                                                                                                                        | Why it matters                                                                       | Severity | Likelihood | Evidence or reasoning                                                                                                                       | Effect on answer                             | Best permanent fix                                                                                                     | Exact decision/specification language                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inngest, Realtime, email/provider state, Base UI upgrades, or browser caches might become identity, delivery, grouping, or read authority. | Vendor outage/version change could duplicate, lose, widen, or reinterpret attention. | High     | Medium     | Workflow OpenSpec makes executor nonauthoritative; Phase 17 uses identifier-only Realtime; Base UI is the repo's controlled primitive base. | Keeps dependencies replaceable and narrowed. | Product DB claims/keys; adapter/version pins; cursor fallback; tested shared primitive upgrades; no provider coupling. | “External/runtime dependencies execute or invalidate only; product DB and registered contracts own identity, authorization, grouping, engagement, and recovery.” |

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                | Why it matters                                                            | Severity | Likelihood | Evidence or reasoning                                                                            | Effect on answer                                              | Best permanent fix                                                                                                             | Exact decision/specification language                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Old readers may double-show children, new writers may emit before readers/keys exist, backfill may create unread walls, rollback may delete unknown rows, or group revisions may reparent history. | Mixed versions can create noise or lose truthful evidence across Tenants. | Critical | Medium     | Phase 17 requires future-only migration and one-writer fences; D48 forbids old-request catch-up. | Requires additive ordered activation and compatible decoders. | Reader/decoder then writer then UI; shadow comparison; no backfill; kill narrows; roll forward; retain old group/key decoders. | “No reminder becomes visible until all supported readers understand its key/group; rollback disables new release but preserves and decodes already committed items/history.” |

### 21. Testability, traceability, and proof

**Material concern: Yes.**

| What could go wrong                                                                                                                                                        | Why it matters                                                           | Severity | Likelihood                               | Evidence or reasoning                                                              | Effect on answer                                                                           | Best permanent fix                                                                                                                                        | Exact decision/specification language |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------- | ---------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Tests may assert two rows or one badge but miss cross-Tenant leaks, one-child groups, races, source end, a11y order, low bandwidth, mixed versions, or no-task invariants. | A superficially correct screenshot can ship unsafe or unusable behavior. | Critical | High without production-shaped portfolio | Repo testing rules require stable public-seam outcomes and manual a11y beyond axe. | Requires the 120 criteria plus negative/property/concurrency/a11y/load/migration evidence. | Test exact user/domain outcomes, forbidden writes/leaks, all race winners, semantic trace, and D54-R/AC IDs from Grill→ADR/OpenSpec→tickets→code→release. |

### 22. Other development hazards

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                     | Why it matters                                                                                  | Severity | Likelihood | Evidence or reasoning                                                            | Effect on answer                                | Best permanent fix                                                                                                                    | Exact decision/specification language                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------- | ---------- | -------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| “Reminder” may drift into nagging, performance scoring, escalation, acknowledgement tracking, due dates, notification analytics, or a marketing claim that Core ensures reviews happen. | It harms trust and vulnerable staff, invents management semantics, and expands scope invisibly. | High     | Medium     | D47/D50 explicitly reject urgency/deadline; read and completion are independent. | Adds explicit semantic and use-purpose ceiling. | Prohibit person scoring/awareness claims and require separate evidence/governance for escalation, SLA, acknowledgement, or analytics. | “D54 attention is a single courtesy occurrence only; it cannot evidence diligence, neglect, compliance, awareness, performance, escalation, or guaranteed review.” |

## Acceptance criteria

### Current scope and activation boundary

- **D54-AC001:** D54 changes governing documentation only and creates no
  runtime key, manifest/census row or count, publication, item, group, schema,
  migration, RLS policy, API, task, event, job, flag, telemetry, or UI.
- **D54-AC002:** Current-repository scans prove no D43–D54 executable reminder
  source, activated timing profile, item, group, renderer, or settings surface.
- **D54-AC003:** The hard-coded staff bell demo is identified as fake
  presentation and supplies no data, authorization, accessibility, or behavior precedent.
- **D54-AC004:** No courtesy-reminder semantic key is named, reserved, registered,
  manifested, or added to the census before the future full activation package.
- **D54-AC005:** D54 cannot activate when D47/D53 remains absent, not-qualified,
  retired for new activation, mismatched, incomplete, or contradicted.
- **D54-AC006:** The complete D46 no-reminder baseline remains a valid permanent
  outcome and produces no warning, degraded state, placeholder, or operator task.
- **D54-AC007:** D54 does not choose a timing pair, external channel, urgent
  safety-withdrawal policy, or generic notification-center IA; exact responsive
  density remains design proof within the required compact disclosure pattern.
- **D54-AC008:** No disabled item, hidden feature, beta badge, “coming soon,”
  Off-only control, fake example, or roadmap promise appears in current UX.
- **D54-AC009:** Verified repository fact, official external fact, inference,
  product judgment, assumption, and unresolved unknown remain distinctly labeled.
- **D54-AC010:** The activation package must trace every D54 requirement to
  governing ADR/OpenSpec/design/ticket/code/test/release evidence before first effect.

### Source occurrence, semantic key, and item identity

- **D54-AC011:** One D48-admitted D43 request can own no more than one D47
  reminder source occurrence, independent of worker, item, group, or channel count.
- **D54-AC012:** One exact D49 sealed recipient member can own no more than one
  in-product reminder item for that occurrence.
- **D54-AC013:** Only a future full activation assigns the reminder's stable
  semantic key/version and binds the reviewed content, recipient, destination,
  policy, applicability, privacy, retention, and proof contract.
- **D54-AC014:** Item semantic identity includes exact Tenant, reminder source
  occurrence, sealed recipient-member generation, recipient Party+role/surface,
  and activation-registered key/version.
- **D54-AC015:** Product-database permanent uniqueness, not Inngest, Realtime,
  browser, task, provider, email, or message position, owns idempotency.
- **D54-AC016:** Exact replay returns the existing item and result without
  changing unread, `available_at`, preview, group, source, or task state.
- **D54-AC017:** Reuse of a semantic identity with a changed source/member/key/
  preview/policy/applicability/action/group/privacy hash hard-conflicts and releases nothing.
- **D54-AC018:** Material meaning/action/recipient/privacy change requires a
  separately reviewed successor key assigned by a later activation; literal
  meaning-preserving editorial/localization/a11y repair does not.
- **D54-AC019:** A source occurrence with proved-zero recipients creates no
  personal item, guessed fallback, broadcast, shared unread, or task.
- **D54-AC020:** An indeterminate recipient/source/auth/usefulness proof releases
  nothing and may retry only the same source occurrence/member under bounded claims.

### Access-review attention group identity and membership

- **D54-AC021:** One server-derived **Access-review attention group** binds exact
  Tenant, D43 request occurrence, recipient Party, role/surface, privacy class,
  group-contract revision, and gap-free D44 responsibility lineage.
- **D54-AC022:** Group identity contains no mutable title, localized copy,
  timestamp, task ID, browser ID, route revision alone, worker run, channel,
  timing seconds, array position, or child count.
- **D54-AC023:** The group may admit at most one exact matching
  `holder_access_review_requested_v1` child and at most one future activation-
  registered courtesy-reminder child for that recipient/request lineage.
- **D54-AC024:** `access_request_responsibility_updated_v1` never joins the group,
  because its source episode and potentially multi-request membership differ.
- **D54-AC025:** No item from another request, Tenant, Party, role, surface,
  privacy class, responsibility lineage, source episode, or stable meaning can join.
- **D54-AC026:** A recipient with no eligible per-request initial child receives
  a complete one-child Access-review attention group; no initial child is
  invented or backfilled.
- **D54-AC027:** Failure or lag in initial-item materialization does not block an
  independently valid reminder release; later repair joins only via the same
  deterministic group identity.
- **D54-AC028:** A child cannot be moved/reparented after commit; mismatch
  quarantines protected presentation and requires deterministic repair evidence.
- **D54-AC029:** Group rows/counts are rebuildable from authoritative admissible
  children and do not own source, recipient, engagement, retention, or action truth.
- **D54-AC030:** Rebuild from the same authorized child set yields byte-stable
  group identity/membership/state/count/order inputs and no new business occurrence.

### Engagement and presentation semantics

- **D54-AC031:** Reminder release initializes only the reminder item's exact
  recipient engagement as unread when source-actionable at release.
- **D54-AC032:** Reminder release never changes the initial child's seen/read/
  unread/archive evidence, revision, timestamp, order, presentation end, or history.
- **D54-AC033:** The group stores no independent read/unread/archive/seen state;
  its unread indicator is the OR of authorized presentable unread children.
- **D54-AC034:** A group contributes exactly one badge when at least one child is
  presentable and unread, and zero otherwise; two unread children never count as two groups.
- **D54-AC035:** **Needs attention** membership is derived from any current
  source-actionable child, not from unread, group age, task status, or provider state.
- **D54-AC036:** Read clears only that child's unread contribution and cannot
  remove an actionable child/group from **Needs attention** or resolve the source.
- **D54-AC037:** Expanding, collapsing, scrolling, focusing, hovering, receiving
  Realtime, opening the bell, or loading detail writes no engagement.
- **D54-AC038:** Explicit group mark-read, if the shared center provides it,
  operates over an expected authorized child snapshot using item-level CAS;
  a newly arriving child outside that snapshot remains unread.
- **D54-AC039:** Partial/stale engagement results refetch and expose residual
  unread truth; UI never claims “all read” after a partial or ambiguous response.
- **D54-AC040:** Email delivery/open/click, task view/completion, source action,
  group expansion, and deep-link navigation never transfer or infer item engagement.

### Source applicability, lifecycle, and temporal correctness

- **D54-AC041:** The future item pins
  `presentation.source_actionable_then_recent_90d@1` and one exact key-specific
  D43/D49/D51/D52 source-applicability/end rule at activation.
- **D54-AC042:** Initial release atomically re-proves current D43
  `pending_review`, exact source/request head, D49 member lineage, current
  recipient authorization, D51 epoch, and half-open D52 interval.
- **D54-AC043:** Database-authoritative comparison treats `useful_until` as an
  exclusive upper bound; a claim at or after it terminally skips first release.
- **D54-AC044:** Request withdrawal, Keep/Remove decision, no-longer-applicable
  state, recipient loss, or registered D51 end removes active reminder contribution.
- **D54-AC045:** Source end writes one once-set presentation end/reason without
  writing read, dismissal, archive, task completion, request resolution, or access change.
- **D54-AC046:** An item ended before first view creates no unread/badge debt and
  remains truthfully unseen; Core never fabricates a read timestamp.
- **D54-AC047:** A lawfully released and still-authorized ended item follows the
  registered Recent-history ceiling; the group cannot extend or revive it.
- **D54-AC048:** Current assignment/access loss makes active and Recent
  presentation unavailable immediately, even if the 90-day ceiling has not elapsed.
- **D54-AC049:** Recipient removal then re-addition cannot revive the old D49
  member/item/group engagement; only a separately valid source successor could create new meaning.
- **D54-AC050:** Policy enable/re-enable, route edits, worker replay, readiness
  repair, or task mutation never catches up or re-ages an old D43 request.

### Authorization, Tenant isolation, and RLS

- **D54-AC051:** Every staff list/count/search/detail/render/engagement/action/support/
  export/repair boundary validates the session and derives active Tenant,
  Party, role/surface, capabilities, and relationships server-side; donor,
  missionary, public, and unrelated staff surfaces receive no D54 presentation.
- **D54-AC052:** The client cannot assert Tenant, recipient, role, actor,
  source/member identity, group, stable key, policy, applicability/end, privacy,
  `available_at`, or audit attribution.
- **D54-AC053:** Application authorization denies by default before query or
  mutation; RLS independently supplies defense in depth rather than sole enforcement.
- **D54-AC054:** Item/group/engagement tables are tenant-only with non-null
  `tenant_id` and composite same-Tenant foreign keys for every parent/child relationship.
- **D54-AC055:** RLS `USING` restricts existing row visibility/mutation to the
  exact current viewer/Tenant/role/source/privacy outcome and returns no cross-
  Tenant or unauthorized existence signal.
- **D54-AC056:** RLS `WITH CHECK` prevents INSERT/UPDATE from changing an
  engagement row's Tenant, viewer, role, item, or allowed state into a forbidden one.
- **D54-AC057:** Authenticated/browser roles cannot insert/update/delete item,
  group, communication event, recipient, source, semantic, policy, end, or audit fields.
- **D54-AC058:** Table-owner/service-role/BYPASSRLS/RPC/view/function/Realtime/
  support/repair paths prove the same Tenant/recipient/source constraints and
  emit safe DTOs only.
- **D54-AC059:** Any security-definer boundary pins a safe `search_path`, has
  least grants, validates all composite scope links, and cannot be called to widen recipients.
- **D54-AC060:** Tenant switch, role switch, account claim/merge/relink,
  impersonation/support mode, and stale cache tests prove no preview/count/
  engagement flash or transfer across identity contexts.

### Concurrency, idempotency, and recovery

- **D54-AC061:** One atomic product-database claim with expected source head,
  policy epoch, recipient member, authorization evidence, and trusted database
  time decides first release.
- **D54-AC062:** Release versus D51 Off has exactly one winner; Off-first emits
  no item, while release-first preserves immutable history and applies the
  registered source end without retracting viewed evidence.
- **D54-AC063:** Release versus D52 exclusive upper bound has exactly one
  winner; expiry-first terminally skips and release-first records proof inside
  the interval.
- **D54-AC064:** Release versus request resolution either commits under the
  proved source head then immediately projects its truthful end, or releases
  nothing; no stale actionable item persists.
- **D54-AC065:** Release versus recipient/authorization loss releases only when
  the exact current proof wins and every later query/action still re-proves it.
- **D54-AC066:** Duplicate workflow dispatch, retry, manual replay, Realtime
  duplication, and process restart converge on the same source occurrence,
  item, group, and immutable hashes.
- **D54-AC067:** Initial-read versus reminder-release preserves the initial CAS
  result and creates the reminder unread; derived group unread converges to true.
- **D54-AC068:** Group-mark-read versus reminder arrival uses an expected child
  digest/revision; a new child not in that snapshot remains unread and visible.
- **D54-AC069:** Lost mutation responses replay idempotently and return the
  durable receipt/current state; a retry never toggles or duplicates the effect.
- **D54-AC070:** Race/property tests cover every valid ordering for release,
  Off, expiry, source end, recipient loss/re-add, read/unread, rebuild, purge,
  and mixed old/new application versions.

### Failure visibility, repair, and audit

- **D54-AC071:** Source transaction records identifier-only projection intent in
  the product-owned outbox/dispatch ledger before any optional workflow handoff.
- **D54-AC072:** Workflow outage leaves source/intent valid; bounded recovery
  finds stored unhandled work and remains guarded by the same product claim.
- **D54-AC073:** Item success plus group/realtime failure remains a successful
  item release; deterministic group rebuild and cursor recovery repair projections.
- **D54-AC074:** Initial-item failure does not cause reminder failure, and
  reminder failure does not alter/duplicate the initial item or task.
- **D54-AC075:** Group identity/member/hash mismatch fails closed from protected
  presentation, opens one safe repair condition, and never silently moves/deletes children.
- **D54-AC076:** Repair accepts identifiers and expected hashes only; it cannot
  author recipient, source state, preview, engagement, task, or access outcome.
- **D54-AC077:** A durable release receipt traces source occurrence, sealed
  member, source/policy heads, claim, item identity, group identity, outcome,
  and safe reason without content or PII.
- **D54-AC078:** Engagement audit records exact item, viewer Party+role, actor,
  command, expected/current revision, result, and time without treating it as source action.
- **D54-AC079:** Technical logs/traces distinguish retry/dispatch/rebuild from
  business release/skip/suppression/end and never substitute for durable history.
- **D54-AC080:** Operators have one documented replay/rebuild/quarantine path;
  direct SQL edits, unread resets, manual reminder creation, blind resend, and
  task mutation are unsupported.

### Privacy, minimization, retention, and deletion

- **D54-AC081:** Reminder title/copy/group summary/list/search/accessible name
  contain no holder/requester name, reason, capability, group, provenance,
  authority evidence, decision, sensitive ministry/location/member-care fact,
  email, raw ID, or arbitrary URL.
- **D54-AC082:** Protected request detail remains in Phase 12 and loads only
  after fresh authorization through the typed destination; the item never caches it.
- **D54-AC083:** The item does not state or imply a deadline, due/overdue state,
  urgency, escalation, SLA, fault, previous awareness, access change, or guaranteed action/delivery.
- **D54-AC084:** Logs, metrics, traces, analytics, Realtime payloads, workflow
  envelopes, support views, exports, search indexes, and AI contexts contain
  safe identifiers/reason codes only, never protected preview/detail.
- **D54-AC085:** Browser query keys/caches are partitioned by exact Tenant+
  Party+role/surface and evicted/revalidated on Tenant/role/auth changes; shared
  service-worker/browser caches cannot expose another context.
- **D54-AC086:** Item preview/search material follows the nonextendable Phase 17
  presentation/purge policy; read/unread/group/retry/worker delay cannot extend it.
- **D54-AC087:** One child's retention/purge cannot extend, delete, or rewrite
  another child, the group source tuple, D43 request, task, or durable body-free audit.
- **D54-AC088:** A group with no presentable children disappears from user
  queries even when a late purge/rebuild worker has not removed projection bytes.
- **D54-AC089:** Data-subject deletion/anonymization, legal hold, backup, export,
  Party merge/relink, and retention procedures explicitly handle item,
  engagement, group projection, safe audit, and protected source separately.
- **D54-AC090:** Any privacy/security incident or cross-boundary disclosure
  immediately narrows/blocks presentation, triggers incident handling, and
  requires complete repair/reproof before re-enable.

### UX, content, accessibility, and constrained conditions

- **D54-AC091:** Protected semantic core is title **Access review is still
  waiting**, category **Access requests**, neutral courtesy/no-change meaning,
  and primary action **Review in People & access**, subject to activation-time
  content/localization proof without changing meaning.
- **D54-AC092:** The item is complete and understandable when it is the group's
  only child and never depends on hidden initial copy or previous delivery/view.
- **D54-AC093:** One bounded visual unit communicates one request, distinct child
  updates, exact group update count, unread state, and one source action without
  looking like two work records.
- **D54-AC094:** Perceptual grouping uses Base Maia/Zinc semantic tokens,
  hierarchy, spacing, boundary, and visible text; it introduces no app-local
  primitive, alternate UI library/style, raw color, avatar, or decorative noise.
- **D54-AC095:** Programmatic structure exposes a labeled section/list/group,
  distinct child names/descriptions, count, relationship, state, and logical DOM/
  reading/focus order equivalent to the visual presentation.
- **D54-AC096:** Native elements and shared Base UI primitives are used before
  ARIA; the implementation does not claim `feed`, tree, listbox, grid, or thread
  keyboard semantics unless a separate proven need adopts the full pattern.
- **D54-AC097:** Primary link, disclosure, and engagement actions are separate
  real controls with visible names, 44 CSS-pixel touch targets, visible focus,
  no nested interactive row, and full keyboard operation.
- **D54-AC098:** New arrival never steals focus, auto-opens UI, sounds/vibrates,
  uses urgent/error styling, or fires an assertive live announcement; an open
  list may offer one privacy-safe polite update status/control.
- **D54-AC099:** Automated axe plus manual keyboard/screen-reader/forced-colors/
  focus/contrast/200%-text/400%-zoom/320-CSS-pixel reflow/text-spacing/reduced-
  motion tests pass for zero-, one-, and two-child groups.
- **D54-AC100:** Long Latin, CJK, RTL/bidi, localized plural/count/time, mobile
  page/sheet, touch, slow network, offline/reconnect, and missed/duplicate
  Realtime cases preserve complete meaning, action, order, focus, and privacy.

### Scale, performance, and operational reliability

- **D54-AC101:** Notification list/count uses an indexed authorized read model
  and keyset pagination; offset pagination, per-row source/auth fetches, and N+1
  group/child queries fail the release gate.
- **D54-AC102:** Required indexes begin with Tenant and support exact
  recipient/role/surface, presentability, group, source applicability, semantic
  uniqueness, and ordering cursor predicates.
- **D54-AC103:** Production-shaped tests include many Tenants, one highly skewed
  Tenant, large active/history sets, dense arrival, one-/two-child groups,
  purged children, and concurrent engagement/rebuild.
- **D54-AC104:** Activation records dataset cardinalities, query plans, resource
  budgets, and measured p50/p95/p99 list/count/detail/rebuild/cursor-recovery
  results; no vague “fast” or “scalable” claim is accepted.
- **D54-AC105:** The activation package names an exact user-facing/service SLO
  from those baselines and a rollback/kill response; D54 itself invents no
  unsupported millisecond or throughput number.
- **D54-AC106:** Group badge/count remains exact under pagination, concurrent
  arrival, source end, retention, and Realtime loss; expensive global recount is
  not required on every request.
- **D54-AC107:** Realtime carries identifiers/invalidation only and can be lost,
  delayed, duplicated, or reordered without losing correctness; cursor reads converge.
- **D54-AC108:** Work claims and concurrency keys include Tenant and semantic
  occurrence/member identity so one large Tenant cannot mix another Tenant's work.
- **D54-AC109:** Rate limiting/backpressure delays execution but never widens a
  recipient, extends usefulness, changes urgency, or emits a late item; D52 skip wins.
- **D54-AC110:** Runtime metrics use the shared Phase 17 notification pipeline
  with stable reason codes and dimensions; no reminder-specific analytics
  warehouse, user-scoring dashboard, or content telemetry is built.

### Migration, dependencies, proof, and traceability

- **D54-AC111:** Rollout is additive and ordered: compatible decoder/reader and
  group reducer first, shadow proof second, source/item writer third, user UI
  last; old writers are fenced before visibility.
- **D54-AC112:** D48 no-backfill is enforced: no request created before the
  successful activation boundary receives a reminder item, group child, badge,
  or historical placeholder.
- **D54-AC113:** Mixed N/N-1 readers either decode the future key/group safely or
  the writer remains disabled; unknown rows never render generic unsafe content.
- **D54-AC114:** The disable/kill path narrows new reminder release only; it
  preserves D43 requests, tasks, initial items, committed reminder items,
  engagement, groups, Recent history, audit, and historical decoders.
- **D54-AC115:** Rollback after writes uses roll-forward-compatible narrowing
  and never deletes/rekeys/reparents committed items or fabricates engagement.
- **D54-AC116:** Inngest, Realtime, Base UI, Supabase/Postgres, and any future
  channel are replaceable executors/adapters; none owns semantic identity,
  recipient authorization, grouping, engagement, or source truth.
- **D54-AC117:** Positive, negative, boundary, property, authorization/RLS,
  concurrency/idempotency, failure/recovery, migration/mixed-version, privacy,
  accessibility, localization, and production-shaped load suites all pass.
- **D54-AC118:** Tests assert user-visible/domain outcomes and forbidden effects,
  not internal component names, CSS selectors, worker calls, or screenshot similarity alone.
- **D54-AC119:** D54-R1–R30 and D54-AC001–AC120 trace without contradictory
  terms/counts/states from Grill answer through glossary, ADRs, OpenSpec delta,
  Phase 12/17 design, manifest/census activation, tickets, code, tests, and release evidence.
- **D54-AC120:** D55 may select only the urgent-safety-withdrawal contract; it
  cannot weaken D54 item completeness, independent engagement, group identity,
  one-child validity, no-task boundary, authorization, privacy, accessibility,
  or the compact-summary/disclosed-chronology design requirement.

## Release evidence portfolio

| Proof class       | Required positive evidence                                                                                   | Required negative/boundary evidence                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Semantic identity | One source occurrence/member replay returns one item and one group                                           | Changed immutable hash conflicts; task/worker/browser/channel ID cannot dedupe                                            |
| Group membership  | Matching initial+reminder form one group; reminder-only forms one complete group                             | Aggregate responsibility item, sibling request, other recipient/role/privacy/Tenant rejected                              |
| Engagement        | New reminder alone becomes unread; item-level read/unread and one badge converge                             | Initial engagement/timestamp unchanged; expand/scroll/Realtime/task/email/source action writes nothing                    |
| Source lifecycle  | Pending/current member inside interval releases; source end moves to authorized Recent                       | Off/expiry/terminal/recipient-loss first releases nothing; no late catch-up/revival                                       |
| Authorization/RLS | Exact current Tenant/Party/role/source can list/render/mutate own engagement and follow typed action         | Cross-Tenant/role/IDOR, stale member, requester, lost assignment, `WITH CHECK` transformation, privileged widening denied |
| Privacy           | Safe title/category/courtesy/action survive list/search/a11y/export                                          | Protected names/reasons/capability/group/provenance/raw IDs/content absent from DTO/cache/log/metric/Realtime             |
| Failure/recovery  | Item survives group/Realtime failure; deterministic rebuild/cursor recovery converges                        | Blind replay, duplicate item/group, fabricated child/read/task/source state rejected                                      |
| Concurrency       | All release/Off/expiry/end/member/read/rebuild/purge orderings converge                                      | No double winner, lost read, badge >1, child move, source revival, or late release                                        |
| Accessibility/UX  | Compact summary and disclosed chronology work with keyboard/AT/touch/mobile/locale/RTL/zoom/forced colors    | Color/icon/proximity-only grouping, nested controls, focus theft, hidden unread, duplicate-work interpretation fail       |
| Scale             | Indexed keyset/batched authorized plan meets measured p50/p95/p99 SLO across declared cardinalities          | Offset/N+1/full-group scan, skewed-Tenant timeout, inaccurate count/cursor drift block activation                         |
| Migration         | Decoder/reader-first mixed-version shadow proof then writer/UI, no backfill                                  | Old reader unsafe fallback, double writer, auto-selected Tenant, destructive rollback rejected                            |
| Traceability      | D54 decision→glossary/ADR/OpenSpec→Phase 12/17→manifest/census activation→ticket/code/test/release IDs agree | Any named key before activation, contradictory count/state/term, missing requirement, or stale gate blocks release        |

## Release and runtime monitors

The premature-artifact and accessibility signals are release gates; the other
signals become runtime monitors only after activation. All reuse the shared
Phase 12/17 security, communication, projection, and release telemetry. They do
not justify a reminder-specific analytics product or person-level performance scoring.

| Monitor                             | Signal                                                                                                                                                | Exact threshold                                                                     | Owner                                        | Required response                                                                                                                           |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `D54-PREMATURE-ARTIFACT`            | Repository scan for reminder key/manifest/census/runtime/schema/UI artifacts before complete activation                                               | Any one matching artifact                                                           | Architecture + Release Engineering           | Block merge/release; remove artifact; rerun zero-artifact proof.                                                                            |
| `D54-CROSS-BOUNDARY`                | Denied/observed mismatch in Tenant, Party, role/surface, privacy, or source relationship on item/group/count/render/action                            | Any confirmed queryable or returned cross-boundary fact                             | Security + IAM                               | Disable the presentation path, open Critical incident, contain, assess exposure, repair all paths, reprove before enable.                   |
| `D54-DUPLICATE-ITEM`                | More than one item for one permanent semantic tuple                                                                                                   | Count greater than 1                                                                | Phase 17 + Data Integrity                    | Stop new release for the key, quarantine duplicates, identify writer/fence failure, roll forward without erasing evidence.                  |
| `D54-ILLEGAL-GROUP-MEMBER`          | Group child violates closed key, request, recipient, lineage, role, privacy, or Tenant tuple                                                          | Any one mismatch                                                                    | Phase 17 + IAM                               | Fail group render closed, quarantine/rebuild, block release until constraint and regression proof pass.                                     |
| `D54-INITIAL-ENGAGEMENT-MUTATION`   | Initial item's engagement/time/group/history changes in the reminder release transaction/trace                                                        | Any one attributable change                                                         | Phase 17 + Data Integrity                    | Stop reminder writer, restore through append-only/corrective process, investigate all affected tuples, add race regression.                 |
| `D54-TASK-OR-SOURCE-MUTATION`       | Reminder path writes task/request/grant/decision/assignment/due/priority state                                                                        | Any one write                                                                       | Phase 12 + Tasks Hub + Security              | Disable path immediately, open Critical integrity incident, repair authoritative data, prove boundary before enable.                        |
| `D54-LATE-FIRST-RELEASE`            | First item `released_at` is not inside pinned `[not_before,useful_until)` or follows a winning D51 fence                                              | Any one item                                                                        | Phase 12 + Phase 17                          | Stop new release, mark invalid effect for incident review without falsifying read/history, repair claim/fence logic.                        |
| `D54-BADGE-OR-GROUP-DRIFT`          | Stored projection differs from deterministic authorized child rebuild                                                                                 | Any one mismatch after one immediate rebuild attempt                                | Phase 17                                     | Hide/quarantine affected group, rebuild, inspect race/retention cause, block rollout expansion.                                             |
| `D54-PROJECTION-RECOVERY-LAG`       | Unhandled item/group outbox claim age                                                                                                                 | Any claim older than the exact activation SLO                                       | Workflow Operations + Phase 17               | Trigger bounded recovery; if usefulness closes, terminally skip unreleased effect; page owner per SLO and diagnose.                         |
| `D54-QUERY-SLO`                     | p95 list/count/detail/rebuild latency by production-shaped active Tenant cohort                                                                       | Exceeds the activation SLO for 3 consecutive 5-minute windows                       | Phase 17 + SRE                               | Halt rollout expansion, inspect plan/index/skew, apply narrowing/rollback-safe mitigation, re-run load proof.                               |
| `D54-PRIVACY-FIELD`                 | Contract/DTO/log/metric/cache/Realtime/export scan finds prohibited protected field/content                                                           | Any one field or value                                                              | Privacy + Security + Phase 17                | Block release or contain incident, remove material where lawful, rotate exposed tokens if any, add negative fixture.                        |
| `D54-ACCESSIBILITY-BLOCKER`         | Committed automated/manual matrix fails grouping, name/state, keyboard/focus, reflow, contrast, touch, screen-reader, RTL/CJK, or reduced-motion gate | Any Critical/High failure or any WCAG 2.2 A/AA violation                            | Accessibility + Design Engineering           | Block activation/rollout; fix in shared primitive/composition; rerun automated and manual proof.                                            |
| `D54-UNKNOWN-KEY-OR-GROUP-REVISION` | Reader encounters an unregistered/unsupported semantic key or group-contract revision                                                                 | Any one production encounter                                                        | Release Engineering + Phase 17               | Fail safe without protected generic rendering, stop writer/rollout, restore compatible decoder, inspect deployment ordering.                |
| `D54-UNSAFE-COMPREHENSION`          | Preregistered usability check finds deadline/access-change/blame/duplicate-task or hidden-unread misconception                                        | Any critical misconception or failure of the D47/D54 preregistered cohort threshold | UX Research + Access Product + Accessibility | Keep inactive or narrow rollout, revise meaning-preserving UI/content where possible, otherwise successor evidence and reactivation review. |

## Final disposition and corrected decision to record

**Disposition: Accept with required amendments.**

Record this concise decision in the Phase 24 decision log and governing ADR/
PRD surfaces:

> D54 chooses one distinct recipient-specific courtesy-reminder notification
> item, only after full evidence and activation, inside one deterministic,
> rebuildable **Access-review attention group** for the same Tenant, D43 request
> episode, exact recipient Party+role/surface, privacy class, group revision, and
> gap-free D44 responsibility lineage. If that recipient has the eligible exact
> per-request initial item, both independent children share the group. If not,
> the reminder is a complete one-child group; Core never fabricates/backfills an
> initial item and never groups the multi-request D44 responsibility-update
> aggregate. The new child alone becomes unread; the initial child's engagement,
> history, time, and source state remain unchanged. The group has no independent
> engagement or business truth, contributes at most one badge, and derives
> actionability/Recent state from authorized presentable children.
>
> The reminder is neutral, privacy-minimized **Access review is still waiting**
> attention with one typed **Review in People & access** action and explicit
> no-due-date/no-access-change meaning. It creates/mutates no task, request,
> grant, decision, channel, or source fact. Every release/read/render/action
> re-proves current Tenant/source/recipient authorization; D51/D52 prevent late
> first release. UI uses one adaptive compact Base Maia summary and a short,
> programmatically equivalent Base UI disclosure chronology, with no focus theft
> or urgent interruption. Exact spacing/breakpoints remain design-proof details.
> D54 names/registers no executable key and changes no manifest/census/runtime;
> only the complete future activation may do so.

## Ruthless synthesis and ordered path forward

### Resolved before D54 is recorded

1. Replace unconditional “group with the existing item” with the exact one-
   child-valid **Access-review attention group** model.
2. Exclude the D44 multi-request responsibility-update aggregate from the group.
3. Keep the future reminder key unnamed/unregistered until the full activation,
   preserving D53's zero-artifact boundary.
4. Preserve child-level occurrence and engagement; derive group state and one
   badge without adding group engagement/source truth.
5. Make no-task/no-source-mutation, neutral meaning, current authorization, and
   privacy minimization explicit.
6. Treat compact summary/disclosed chronology as ordinary evidence-tested UI
   design, not a new founder-level product branch.

### Required in the specification and design

1. Carry D54-R1–R30 and D54-AC001–AC120 into Phase 12/17 and the ADR/glossary.
2. Define the exact gap-free D44 responsibility-lineage predicate, one-child
   behavior, closed child membership, group reducer, and key-specific source end.
3. Define safe semantic content, typed destination, presentation policy,
   retention, item-level engagement, and group badge/read behavior.
4. Define same-Tenant schema/FKs/constraints/indexes/grants/RLS, privileged
   parity, minimized DTOs, caches, Realtime, audit, repair, and deletion.
5. Preserve adaptive compact disclosure and every accessibility,
   localization, mobile, low-bandwidth, and privacy state in design fixtures.

### Implementation safeguards required before activation

1. Complete D47/D53 evidence, D55 urgent-safety withdrawal, and every remaining
   content/channel/security/privacy/accessibility/operations gate.
2. Assign/register the exact semantic key only inside the activation package;
   update manifest/census counts there, never in D54 documentation.
3. Ship additive compatible readers/decoders and deterministic group reducer,
   shadow-compare, then source/item writer, then user-visible UI; do not backfill.
4. Use product-owned atomic release claims, permanent semantic uniqueness,
   expected-head/CAS engagement, identifier-only workflow/Realtime, and safe
   current-state destination resolution.
5. Pass the complete evidence portfolio, production-shaped measured SLOs,
   mixed-version/rollback proof, and manual plus automated accessibility review.

### Risks that may be monitored only after the safeguards pass

Only the named monitors above qualify. Each has a signal, exact threshold,
owner, and mandatory response. Monitoring cannot replace a failed release gate,
permit production experimentation, or justify collecting person-level attention,
completion, or performance analytics.

### Implementation order

1. Record D54's amended docs-only decision and terminology.
2. Resolve D55's urgent safety-withdrawal boundary before any profile activates.
3. Complete evidence and activation design, including key/content/publication,
   authorization/RLS/privacy/threat/a11y/performance/migration contracts.
4. Build through TDD at source/item/group/engagement public seams.
5. Deploy reader-first under complete-Tenant deny-first controls and no backfill.
6. Verify release evidence, observe the named monitors, and expand only after
   zero invariant/a11y/privacy failures and measured SLO compliance.

## D55 — Urgent withdrawal of an activated timing profile proven unsafe

### Context

Assume Hope Mission deliberately selected activated profile `P1`. Later,
verified evidence shows that `P1` materially misleads coordinators or creates an
accessibility/privacy harm. Core must stop new unsafe effects immediately, even
if some Tenant administrators are offline. The choice is how to preserve
Tenant policy truth while applying a platform safety floor. This is not ordinary
profile retirement, a rollout flag, or a request-level user control: ordinary
retirement only blocks new selection and D51 ordinary Tenant Off follows a
deliberate Tenant policy change.

### Option 1 — monotonic platform safety fence; preserve Tenant selected heads — recommended

Append one durable, audited, code-owned/profile-revision-specific safety fence
that can only narrow. Once effective, it immediately blocks new selection,
reselection, D43 admissions, and not-yet-released reminder descendants for that
exact unsafe profile revision across all Tenants. It never reopens that revision;
recovery requires a separately evidenced successor profile and deliberate
Tenant selection.

Each Tenant's selected policy head remains immutable and historically truthful.
The settings UI separately and clearly presents **Selected: [profile]** and
**Effective: Off — paused by Asym for safety**, explains that no new reminders
will be created, preserves already released authorized history without claiming
retraction, and offers a deliberate Off/successor policy change when one exists.
The fence is product-database/release authority with atomic source checks and a
named incident owner—not a feature flag, remote-config experiment, mass Tenant
write, or worker state.

**Why recommended:** it stops harm in one monotonic boundary, preserves Tenant
intent/audit and already pinned history, avoids cross-Tenant fanout races, and
does not pretend Asym has authority to rewrite every organization's selected
policy. It adds one narrowly justified safety floor that must exist before
activation, not a generic override engine.

### Option 2 — publish Off successor heads for every affected Tenant

Run a platform operation that writes an Off successor to each Tenant policy
head currently selecting the unsafe revision. The ordinary UI then shows Off
without a separate selected/effective distinction.

**Tradeoff:** the resulting state looks simpler, but the platform rewrites
Tenant-owned policy intent, races concurrent Tenant saves and new Tenants,
requires complete cross-Tenant fanout/idempotency/repair, can partially succeed,
and makes restoration or audit look like each administrator chose Off. It is a
materially more brittle and operationally expensive safety response.

### Recommendation and exact question

**Recommendation: Option 1.** It is the smallest fail-safe, reversible-by-
successor architecture that preserves history and Tenant ownership while making
the unsafe revision permanently non-executable.

Which D55 urgent-safety-withdrawal contract should Core record: **Option 1 — a
monotonic platform safety fence that preserves Tenant selected heads**, or
**Option 2 — mass-publish Off successor heads for affected Tenants**?

## Primary references

- [Core platform principles](../../../openspec/specs/platform-principles/spec.md)
- [Core platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
- [Core identity and access](../../../openspec/specs/identity-and-access/spec.md)
- [Core workflow orchestration](../../../openspec/specs/workflow-orchestration/spec.md)
- [ADR-0027 — One notification presentation and engagement model](../../adr/0027-one-notification-presentation-and-engagement-model.md)
- [ADR-0183 — Source-owned work projects into one shared Tasks Hub](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
- [ADR-0184 — Direct and governed-group capability assignment](../../adr/0184-direct-and-governed-group-capability-assignment.md)
- [Phase 12 — Full role and permission configuration](./phase-12-full-role-permission-configuration.md)
- [Phase 17 — System Messages template management](./phase-17-system-messages-template-management.md)
- [D47 adversarial review](./phase-24-d47-bounded-tenant-reminder-cadence-adversarial-review.md)
- [D53 adversarial review](./phase-24-d53-evidence-admitted-complete-timing-profile-adversarial-review.md)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI APG disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)
- [WAI APG feed pattern](https://www.w3.org/WAI/ARIA/apg/patterns/feed/)
- [Apple HIG — Notifications](https://developer.apple.com/design/human-interface-guidelines/notifications)
- [Android Developers — Group notifications](https://developer.android.com/develop/ui/views/notifications/group)
- [GitHub Docs — Managing notifications](https://docs.github.com/en/subscriptions-and-notifications/how-tos/viewing-and-triaging-notifications/managing-notifications-from-your-inbox)
- [Microsoft Entra — Create an access review](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)
- [Blackbaud — Fundraiser Performance Management Activity](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fpm/guides/activity-center-tipsheet.pdf)
- [Contentful — Tasks](https://www.contentful.com/help/content-and-entries/tasks/)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [PostgreSQL — Row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
