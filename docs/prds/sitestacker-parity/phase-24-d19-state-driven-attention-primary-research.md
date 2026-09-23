# Phase 24 D19 State-Driven Attention Primary Research

Research date: 2026-08-27

**Status:** Evidence appendix for the D19 Grill with Docs decision. This file
records primary-source facts, explicit product judgments, and remaining
validation needs. It is not an implementation specification and does not
override the Phase 24 decision log, OpenSpec, ADRs, or repository rules.

## Research question

How should Core present one deduplicated, event-driven, in-product **Needs
attention** item only to people who are currently authorized to perform its
next action, while keeping personal read state separate from the unresolved
business condition and avoiding recurring reminders or email by default?

## Evidence labels

- **Verified fact** means the linked first-party documentation directly states
  the behavior.
- **Product judgment** means the recommendation is an inference for Core. It is
  not presented as a vendor fact.
- **Validation need** means repository evidence, production measurement, or
  representative-user testing is still required before implementation details
  can be frozen.

## Executive finding

**Product judgment:** The chosen direction is sound only if Core models the
item as a permission-filtered projection of an authoritative domain condition,
not as a generic task, email, timer, or manually completable notification.

The durable pattern is:

1. One producer occurrence represents one currently true actionable episode.
2. A stable semantic key deduplicates repeated observations of that same
   episode.
3. The canonical Phase 6/17 compiler creates one recipient- and role-specific
   item for each exact recipient selected by the bounded code-owned resolver.
4. Current tenant membership and the exact capability for the next action are
   re-evaluated on every list, count, detail, and action request.
5. Each recipient has independent engagement. Reading never resolves the
   shared source condition or changes another recipient's item.
6. Each recipient's item remains in **Needs attention** until the source
   condition ends. It cannot be dismissed, archived, snoozed, unsubscribed, or
   marked complete while active.
7. A false-to-true recurrence starts a new producer occurrence so old items and
   engagement cannot hide newly actionable work.
8. No recurring reminder, due date, email, push notification, or age-based
   escalation is created by default.

This combines the strongest parts of current notification and workflow
products while rejecting their task-shaped and permission-staleness hazards.

## Primary-source findings

### Read state and work state are different facts

- **Verified fact:** GitHub exposes `read`/`unread` independently from `Done`,
  `Saved`, and subscription state in its notification inbox. This proves that a
  user seeing an update and a user deciding that a conversation is finished are
  different interactions. See [GitHub: About
  notifications](https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications)
  and [GitHub: Inbox
  filters](https://docs.github.com/en/subscriptions-and-notifications/reference/inbox-filters).
- **Verified fact:** PagerDuty keeps an alert unresolved while matching events
  deduplicate into it, and resolves it only with a matching `dedup_key` or an
  explicit resolution action. Its alert model has `triggered` and `resolved`
  states. See [PagerDuty:
  Alerts](https://support.pagerduty.com/main/docs/alerts).
- **Product judgment:** Core should borrow GitHub's separation of read state
  from work state and PagerDuty's condition-keyed deduplication. It should not
  borrow GitHub's user-controlled **Done** or PagerDuty's incident-management
  severity and escalation machinery. The Site Locale Plan owns whether the
  condition is actionable; the attention surface owns only its projection and
  recipient+role notification engagement.

### Update one item instead of emitting copies

- **Verified fact:** Android recommends updating an existing notification when
  separate child notifications would not each be independently useful. Posting
  with the same notification ID updates the existing notification, and
  `setOnlyAlertOnce()` prevents later updates from repeatedly interrupting the
  user. See [Android: Create a group of
  notifications](https://developer.android.com/develop/ui/views/notifications/group)
  and [Android: Create a
  notification](https://developer.android.com/develop/ui/compose/notifications/create-notification).
- **Verified fact:** Android's design guidance says notifications should provide
  direct value, make the available action obvious, group related items to avoid
  overwhelming people, and not be used merely to entice someone back into an
  app. It warns that false urgency creates unnecessary alarm. See [Android:
  Notifications](https://developer.android.com/design/ui/mobile/guides/home-screen/notifications).
- **Verified fact:** Apple exposes a `threadIdentifier` specifically to group
  related notifications. See [Apple:
  `threadIdentifier`](https://developer.apple.com/documentation/usernotifications/unnotificationcontent/threadidentifier).
- **Product judgment:** For D19, repeated readiness calculations, event retries,
  and supporting-data changes should update one logical episode rather than
  create a timeline of nearly identical cards. OS push grouping is only an
  analogy; D19 remains an in-product Core surface and sends no push by default.

### Action centers support direct, contextual navigation

- **Verified fact:** Microsoft model-driven apps put user-specific notifications
  in a notification center and allow a card to navigate by URL or open a
  contextual side pane. Microsoft stores each notification for one recipient;
  teams require one record per user. Its default notifications expire and can
  be dismissed. See [Microsoft: Send in-app notifications within model-driven
  apps](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/send-in-app-notifications).
- **Verified fact:** Salesforce Nonprofit Cloud's Record Alerts show a
  description when a record requires action and organize alerts by type,
  priority, and severity; users can dismiss or snooze them. See [Salesforce:
  Record Alerts in Program
  Management](https://help.salesforce.com/s/articleView?id=ind.prog_case_mgmt_prog_mgmt_record_alerts.htm&language=en_US&type=5).
- **Product judgment:** Core should borrow a short, record-linked explanation and
  one direct action. Microsoft's recipient-specific presentation is compatible
  with Core only through the canonical occurrence compiler and recipient/role
  item model; Core should not add ad hoc copied notification rows. It also
  should not copy arbitrary expiry, manual dismissal, snooze, severity, or
  priority. Those features would let presentation state contradict a still-
  actionable Plan and would reintroduce D18's rejected time semantics.

### CMS work queues prove the value of context and the danger of stale assignees

- **Verified fact:** Sanity provides a task inbox plus a contextual notice beside
  the affected document's publish action. Its tasks can be assigned and can
  send email. See [Sanity: Tasks for Sanity
  Studio](https://www.sanity.io/docs/user-guides/tasks).
- **Verified fact:** Contentful provides a pending-tasks page and contextual
  tasks on an entry. A task can be assigned to one person or a team; its standard
  behavior emails assignees and can send a date-based reminder. See [Contentful:
  Tasks](https://www.contentful.com/help/content-and-entries/tasks/).
- **Verified fact:** Contentful's task API explicitly does not check whether an
  assignee can read the entry, so someone may be assigned a task they cannot
  resolve. See [Contentful: Entry tasks API —
  Permissions](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/).
- **Verified fact:** Contentful workflow-step permissions complement space-level
  permissions, and an explicit space-level deny overrides a workflow allow. See
  [Contentful: Workflow steps
  management](https://www.contentful.com/help/ai-automations/workflows/workflows-steps-management/).
- **Verified fact:** Payload supports operation- and record-sensitive access
  control and can hide publish controls when a user cannot publish. Payload also
  warns that Local API calls skip access control by default unless the caller
  explicitly supplies user context and disables access override. See [Payload:
  Access control](https://payloadcms.com/docs/access-control/overview), [Payload:
  Drafts — controlling who can
  publish](https://payloadcms.com/docs/versions/drafts), and [Payload: Respecting
  access control with Local API
  operations](https://payloadcms.com/docs/local-api/access-control).
- **Product judgment:** The Contentful assignee mismatch is the exact anti-pattern
  D19 must avoid. Recipient identity must not be trusted merely because it was
  valid when an item first appeared. Current capability checks must filter the
  inbox and badge and must run again before the action. A saved recipient array
  is never authorization evidence.

### Nonprofit CRMs mostly expose task machinery, not this domain condition

- **Verified fact:** Salesforce task assignment notifies individual assignees;
  group assignment notifies each group member. Salesforce also separates task
  notification preferences and supports mobile task notifications. See
  [Salesforce: Considerations for using
  tasks](https://help.salesforce.com/s/articleView?id=sales.task_considerations.htm&language=en_US&type=5)
  and [Salesforce: User control of task
  notifications](https://help.salesforce.com/s/articleView?id=sf.tasks_control_email_notifications_considerations.htm&language=en_US&type=5).
- **Verified fact:** Virtuous exposes a top-level task icon and dashboard, but its
  automation tasks are date-driven and can generate digest email; it also allows
  administrators to bulk-dismiss tasks. See [Virtuous: Create a
  task](https://support.virtuous.org/hc/en-us/articles/360059923452-How-Do-I-Create-a-Task)
  and [Virtuous: Edit tasks in
  bulk](https://support.virtuous.org/hc/en-us/articles/34579079094797-How-Do-I-Edit-Tasks-in-Bulk).
- **Verified fact:** Neon CRM activities are explicitly assigned, scheduled work
  with start/end dates, reminders, priority, and email options. See [Neon CRM:
  Activities](https://support.neonone.com/hc/en-us/articles/4407398284685-Activities).
- **Product judgment:** A prominent personal work entry and contextual deep link
  are relevant patterns. Dates, reminders, manual completion, bulk dismissal,
  assignment fan-out, and email are not. Importing those features would turn a
  derived Plan condition into a second task system and conflict with D18.

### Accessibility requires persistence without interruption

- **Verified fact:** WCAG 2.2 requires status messages that appear without a
  focus change to be programmatically determinable. W3C recommends `role=status`
  for polite announcements, with enough context for assistive technology, and
  warns that excessive live-region use makes an application too chatty. See
  [W3C: Understanding Status
  Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)
  and [W3C: ARIA22](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA22).
- **Verified fact:** WAI's alert pattern says alerts should not move keyboard
  focus, should not disappear too quickly, and should not interrupt frequently.
  See [WAI-ARIA APG: Alert
  pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/).
- **Verified fact:** WCAG 2.2 requires meaning not to depend on color alone,
  content to reflow without lost information or two-dimensional scrolling at a
  320 CSS-pixel width, and pointer targets to be at least 24 by 24 CSS pixels or
  have sufficient spacing. See [W3C: Use of
  Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color), [W3C:
  Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), and [W3C:
  Target Size
  (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- **Verified fact:** WAI's dynamic-feed pattern has special focus and keyboard
  obligations and no broadly established desktop keyboard convention. See
  [WAI-ARIA APG: Feed
  pattern](https://www.w3.org/WAI/ARIA/apg/patterns/feed/).
- **Product judgment:** Render a finite, paginated semantic list of ordinary
  headings, links, status text, and buttons. Do not use a custom listbox,
  infinite feed, assertive alert, toast-only presentation, focus theft, or an
  unread distinction conveyed only by a colored dot. A polite status
  announcement is appropriate only when an item or count changes while the
  screen is already open.

## Recommended Core experience

### One occurrence, recipient-specific items and engagement

**Product judgment:** The conceptual model should contain three facts with
different owners:

| Fact                                                         | Owner                                                  | Meaning                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------ | --------------------------------------------------------- |
| The Plan currently needs a specific next action              | Site Locale Plan domain state                          | Authoritative shared condition                            |
| One meaningful actionable episode occurred                   | Site producer plus Phase 6 occurrence compiler         | Deduplicated communication occurrence                     |
| One exact Party+role was selected for that occurrence        | Code-owned bounded recipient resolver                  | Recipient-specific availability, never a permission grant |
| The item is still presentable to that recipient              | Phase 17 projection plus current authorization reproof | Current role-safe presentation                            |
| A particular recipient intentionally opened the current item | Phase 17 recipient+role engagement                     | Personal presentation state only                          |

The producer occurrence's semantic identity must include tenant, environment,
source Plan lineage, attention kind, and condition episode. Each item also
binds the exact recipient Party, role, and surface. Exact column names are
deliberately not frozen here. The database must enforce permanent occurrence
identity and at-most-one recipient item for the exact occurrence+Party+role.
Repeated event delivery or recomputation for the same episode replays the same
released occurrence; it never produces another peer occurrence or recipient
item.

Recipient engagement should be a minimal, tenant-scoped record keyed to the
recipient-specific item, Party, and role. Loading the inbox, prefetching a
route, placing a row in the viewport, or another user reading a sibling item
must not mark it read. An intentional open or explicit **Mark as read** action
does. A user may also mark it unread for personal triage, but cannot hide the
active item.

### Current authorization, not historical assignment

**Product judgment:** Eligibility is the intersection of all of the following:

- current authenticated principal;
- current tenant context and active membership;
- current permission to see the Site and Plan context;
- current permission to perform the exact next action;
- current source state in which that action is valid.

The same predicate must govern unread counts, list rows, detail data, and the
action itself. A notification-generation service, service-role job, cache,
client-supplied tenant/user ID, historical role, or receipt row must never widen
that audience. Permission revocation makes the item and its count disappear on
the next authorized request. A stale deep link fails privacy-safely, and a stale
open page must reauthorize the mutation.

If no one is currently eligible, the logical condition remains true but has no
recipient. That must be observable as an access/configuration defect without
leaking the Plan to a person who cannot see it. D19 should not invent a fallback
broadcast audience.

### Lifecycle

| Transition                                            | Producer occurrence / recipient item behavior                                                                                  | Recipient engagement                           |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Condition becomes actionable                          | Create one occurrence and one item per exact resolved Party+role                                                               | Each new item starts unread                    |
| Same event is retried                                 | Replay/no-op the same released occurrence and recipient set                                                                    | No new unread pulse                            |
| Eligible person opens it                              | That person's item remains active                                                                                              | Read only for that exact Party+role            |
| Another eligible person has not opened it             | Their sibling item remains active                                                                                              | Still unread for that recipient                |
| Permission is revoked                                 | Revoked recipient's active and recent presentation disappears immediately                                                      | History is neither transferred nor rewritten   |
| Permission is newly granted                           | Old occurrence/item never becomes visible; a new producer-authorized occurrence is required if the contract admits the handoff | Old engagement is never inherited or revived   |
| Supporting copy changes without changing the action   | Same occurrence and items                                                                                                      | Existing engagement remains                    |
| Required action or target identity materially changes | End the prior meaning and create a newly registered occurrence                                                                 | New recipient items start unread               |
| Source condition ends                                 | End every matching active item once                                                                                            | No unread debt is fabricated for unseen items  |
| Condition later becomes actionable again              | New occurrence and new recipient items                                                                                         | Old engagement cannot suppress the new episode |

The source transition and attention projection should be recoverably
reconcilable. A projection failure must not roll back or corrupt the Plan.
Disposable groups/counts can be rebuilt from the committed occurrence and
recipient-specific items. Missing/corrupt occurrence or item identity is an
invariant failure requiring same-identity recovery; current Plan/membership
state must not reconstruct a new recipient set, revive engagement, or silently
reroute the old episode.

### Staff journey

1. The planned French (Canada) Site Locale reaches **Ready to review**. No date,
   reminder, email, or public change is created.
2. In the active tenant, Maria sees one unread indicator on **Needs attention**.
   Staff in other tenants and staff who cannot perform the review see neither
   the row nor a count that reveals it.
3. Maria opens a compact item:

   > **hope.org · French (Canada)**  
   > Ready to review  
   > English (United States) is still live. Nothing changes automatically.  
   > **Review planned change**

4. Opening Maria's recipient-specific item clears her unread styling and unread
   badge. The page still says **Needs attention · 1 active**, and the item
   remains in her list. Another authorized reviewer has a sibling item and
   retains independent unread state.
5. The action opens the existing review context, preserving Site, locale, and
   return navigation. It does not perform activation from the notification
   card.
6. If another reviewer completes the authoritative action first, Maria's stale
   action rechecks state and explains that it was already handled; it produces
   no duplicate effect.
7. Once the source condition ends, the item leaves every active list. If that
   condition later recurs, Core creates a new unread episode.

### Interface rules

- Use a short human title, explicit status text, one sentence explaining public
  impact, and one primary navigation action. Do not expose implementation event
  names, permission codes, or notification IDs.
- The bell indicator counts **unread**, while the page heading or tab counts
  **active**. Both labels must be visible so zero unread is never mistaken for
  zero remaining work.
- Sort by actionable product meaning, not Plan age or an invented deadline.
  Exact cross-kind ordering is a separate product-policy decision; D19 does not
  smuggle priority into the Plan.
- Render text in the staff member's interface locale from structured current
  facts. Do not persist localized title/body strings as authority.
- Keep the summary payload small and text-first. Load detailed previews only
  after navigation. Pagination must have a stable order and must not require an
  infinite-scroll ARIA feed.
- At 320 CSS pixels, stack content and the action without horizontal scrolling.
  Use visible focus, keyboard operation, sufficient target size, text in
  addition to color, and a polite full-context announcement for live count
  changes. Do not move focus when a background item arrives.

## Strongest alternatives

| Alternative                                                                                          | Strength                                                             | Material failure for D19                                                                                        |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Contextual Languages/Sites status only                                                               | Simplest implementation and no new inbox                             | Staff can miss the moment work becomes actionable when working elsewhere                                        |
| One generic task per recipient                                                                       | Familiar CRM model and explicit assignment                           | Creates duplicates, stale assignments, due-date/email pressure, manual completion, and a second source of truth |
| One broadcast notification event copied to a captured audience                                       | Easy fan-out                                                         | Revoked people can retain sensitive copies; read/dismiss loses connection to current state                      |
| Manually assigned reviewer                                                                           | Clear individual accountability                                      | Becomes brittle when staffing or permissions change and leaves work stranded during absence                     |
| One producer occurrence plus recipient/role items, current authorization, and independent engagement | Low noise, recoverable, permission-current, and compatible with Core | Requires precise episode identity, a bounded resolver, and reconciliation tests                                 |

**Product judgment:** The last alternative is the strongest permanent path. It
is slightly more deliberate than emitting notification rows, but it avoids a
far larger task/notification subsystem and is simpler to keep correct over
time.

## What Core should not import

- Contentful's ability to assign someone who cannot open or resolve the source.
- Microsoft-style expiry or dismissal of a condition that remains actionable.
- Salesforce Record Alert snooze/dismiss semantics.
- Sanity, Contentful, Virtuous, or Neon due dates and automatic email reminders.
- GitHub's **Done** or unsubscribe action for mandatory domain work.
- PagerDuty severity, on-call escalation, acknowledgement, or incident concepts.
- Ad hoc per-recipient copies outside the canonical Phase 6/17 occurrence,
  item, group, and engagement model.
- OS push, toast-only delivery, assertive live regions, or repeated sound/badge
  pulses.
- A custom infinite feed, listbox, or keyboard model for an ordinary work list.

## Evidence-honest proof gates

These are falsifiable product requirements, not claims that an external vendor
proved a universal numerical benchmark:

1. Replaying the same source event at least 100 times yields exactly one
   producer occurrence and one recipient-specific item per exact resolved
   Party+role, with no additional unread pulse for recipients who already read
   their item.
2. Two eligible people receive two recipient/role-specific items under one
   producer occurrence; reading one cannot alter the other item or resolve the
   source condition.
3. Revoking tenant membership or the exact next-action capability removes the
   item, its content, and its unread contribution on that person's next request.
   Direct ID and stale-deep-link tests disclose no protected metadata.
4. Every action request rechecks tenant, visibility, capability, and source
   state from trusted server context. Two concurrent reviewers can create at
   most one authoritative business effect.
5. Resolving the source condition removes the item from every active view;
   reactivating it creates a new episode that is unread even for people who read
   the previous episode.
6. No D19 path creates or invokes a due date, reminder, email, push, task
   assignment, auto-expiry, age-based escalation, or public activation.
7. The bell's unread count and the page's active count are separately labelled.
   In moderated testing, every participant must correctly explain that reading
   removes the unread indicator but does not complete the work, and that opening
   the card does not change the public Site. Report participant roles and sample
   size; do not claim statistical certainty from a small sample.
8. An authorized staff member can move from the global indicator to the
   existing review context in one navigation action, with Site and locale
   context preserved and an obvious return path.
9. The complete experience works by keyboard and screen reader, does not depend
   on color, does not steal focus, reflows at 320 CSS pixels, and meets WCAG 2.2
   AA target-size requirements. Automated checks are supplemented by manual
   keyboard and assistive-technology testing.
10. A low-bandwidth production-shaped test proves that the summary list does not
    fetch rich page content or assets. Set byte and latency budgets only after a
    measured Core baseline; record p50/p95 results, payload size, item count, and
    test network profile rather than inventing a universal threshold.
11. A zero-eligible-recipient condition emits a tenant-scoped operational signal
    without exposing Site/locale details to unauthorized staff.
12. A reconciler test can rebuild disposable group/count projections from the
    authoritative occurrence and recipient items without creating peer items,
    reviving ended presentation, or changing business history/engagement.

## Validation needs before implementation details are frozen

- Confirm the exact Core capability predicate for every D17/D19 next action and
  whether different Plan states route to different roles.
- Confirm whether Core already has a reusable, tenant-safe attention projection
  and recipient+role engagement seam. Reuse it only if its semantics match; a
  generic Mission Control task is not automatically suitable.
- Measure expected active-item volume per tenant and user before choosing
  materialized versus computed query details, indexes, pagination size, or cache
  policy.
- Test the wording and unread-versus-active distinction with representative
  multilingual tenant staff, including people working primarily on mobile and
  low-bandwidth connections.
- Apply ADR-0027's fixed source-actionable presentation policy: once the source
  ends, authorized non-unread recent presentation lasts exactly 90 days and
  query-time ceilings apply even if purge is late. Durable body-free Phase 6
  audit remains separate; D19 must not invent another retention setting.

None of these validation needs requires weakening the D19 decision. They bound
implementation choices that this primary-source evidence cannot truthfully
settle.
