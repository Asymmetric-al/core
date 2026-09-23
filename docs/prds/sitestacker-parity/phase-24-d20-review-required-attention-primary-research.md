# Phase 24 D20 Review-Required Attention Primary Research

Research date: 2026-08-28

**Status:** Primary-source evidence appendix for the D20 Grill with Docs
decision. This file records external facts, repository facts, product
judgments, and remaining validation needs. It is not a PRD, OpenSpec change,
ADR, schema, implementation plan, or authorization contract.

## Research question

Is it a modern, proven practice to create a fresh in-product attention item for
every genuinely new **review-required episode**—initial **Ready to review**,
general **Changed since review**, and the more specific **Current default
changed**—rather than notifying only the first time a Plan becomes ready?

## Evidence labels

- **Verified external fact** means current first-party documentation directly
  states the behavior.
- **Verified repository fact** means an accepted Core ADR or the completed
  D17–D19 decision evidence states the behavior.
- **Product judgment** is the recommended inference for Core; it is not a claim
  that a vendor proved Core's policy.
- **Validation need** requires representative staff research, production-shaped
  measurement, or a later governing specification.

## Executive conclusion

**Disposition: support every newly actionable review-required episode, with
strict amendments.**

Current approval and code-review products strongly support invalidating or
resetting an earlier review when the material being reviewed changes. They also
support requesting a fresh review from qualified people. They do **not** prove
that every low-level edit should emit a notification.

The strongest permanent D20 rule is therefore:

> Create one fresh unread in-product item when an exact authorized recipient
> newly has a review action they must perform: first **Ready to review**, later
> **Changed since review**, or the specialized **Current default changed**.
> These are mutually exclusive presentation/action meanings, not three
> simultaneous alerts. Repeated edits while the same review requirement remains
> open update source truth but create no new attention occurrence. A renewed
> item is justified only after the prior review requirement ended and a later
> material change makes review necessary again.

This is closer to GitHub's explicit re-request-review pattern than to a generic
“notify on every change” automation. It improves safety over **Ready only**
without turning Core's bell into a second Page, Navigation, or task queue.

**Final D20 reconciliation:** The governing decision distinguishes suspension
from action unavailability. Suspension always suppresses Ready/activation, but
Changed or Current-default review may remain only when its exact
zero-public-effect command, required facts, and safety are independently proved
available while suspended. The decision also treats any identifier examples as
non-executable planning handles: Phase 17 keys are not minted until D21 and the
complete source/recipient contract close.

## Primary-source findings

### Material changes commonly invalidate prior approval

- **Verified external fact:** Microsoft Lists and document-library approvals
  automatically cancel an active approval when the underlying item is edited or
  deleted. Metadata changes warn that they will reset approval status. Microsoft
  also states that assigning an approver does not grant access to the underlying
  item. See [Microsoft: Approvals in Lists and Document
  Libraries](https://support.microsoft.com/en-us/office/approvals-in-lists-document-libraries-2bd0954d-5797-4be3-b78a-846f26338e17).
- **Verified external fact:** Google Drive can require every approver to review
  the same content. With that setting, edits reset all approvals and every
  reviewer must approve the new changes. Its review UI can compare changes
  since approval started, since the reviewer last approved, or since the
  reviewer last viewed. See [Google Drive: Get approvals on
  files](https://support.google.com/drive/answer/9387535).
- **Verified external fact:** GitHub can dismiss stale approvals when new
  reviewable commits are pushed and can require approval of the most recent
  reviewable push. GitHub says a significantly changed approved pull request
  needs a new review before merging. See [GitHub: Rules REST
  reference](https://docs.github.com/en/rest/orgs/rules) and [GitHub: Approving
  a pull request with required
  reviews](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/approving-a-pull-request-with-required-reviews).
- **Verified external fact:** GitLab removes approvals by default when new
  changes are added, uses a patch identity to avoid treating some equivalent
  history rewrites as new review content, and can selectively remove Code Owner
  approvals only when files they own changed. See [GitLab: Merge request
  approval settings](https://docs.gitlab.com/user/project/merge_requests/approvals/settings/).

**Product judgment:** An earlier human review must not remain silently valid
after a material fact in its reviewed basis changes. Core should bind review to
an exact review basis/digest and surface a truthful renewed review requirement.
This evidence supports **Changed since review** and **Current default changed**
as real product states. It does not select Core's notification channel by
itself.

### Mature systems request review again; they do not alert on every edit

- **Verified external fact:** GitHub sends a notification when a qualified
  person or team is requested to review. After substantial changes, the author
  can explicitly re-request a fresh review from the same reviewer. See [GitHub:
  Requesting a pull request
  review](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/requesting-a-pull-request-review)
  and [GitHub: Incorporating review
  feedback](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/incorporating-feedback-in-your-pull-request).
- **Verified external fact:** GitLab's re-request-review action creates one new
  to-do item for the reviewer and sends an email. It is a deliberate renewed
  review request after review work, not one to-do per commit. See [GitLab: Merge
  request reviews](https://docs.gitlab.com/user/project/merge_requests/reviews/).
- **Verified external fact:** GitHub lets teams limit notifications to the
  specifically requested members and describes this as reducing noise and
  clarifying individual review responsibility. See [GitHub: Managing code
  review settings for a
  team](https://docs.github.com/en/organizations/organizing-members-into-teams/managing-code-review-settings-for-your-team).

**Product judgment:** Core should automate the safe equivalent of a renewed
review request when its producer proves a new review-required episode. It
should not notify on every Page save, source revision, background recomputation,
or default-head observation. One active review requirement absorbs further
source updates until the recipient completes that review or the Plan exits the
state.

### CMS and approval tools separate workflow state from underlying edits

- **Verified external fact:** HubSpot content approval uses designated
  approvers, exposes **Pending approval**, **Approved**, and **Approval
  canceled**, and supports reviewing, approving, or requesting changes on
  desktop and mobile. HubSpot also documents content-specific exceptions, such
  as RSS/subscription email approval being needed only once. See [HubSpot:
  Approve content](https://knowledge.hubspot.com/website-and-landing-pages/approve-hubspot-content).
- **Verified external fact:** Contentful Workflows model explicit workflow
  steps. Automations can react to constrained entry or workflow transitions and
  can attach actions to a step change. The product also exposes a workflow
  dashboard instead of requiring every content edit to become a message. See
  [Contentful: Workflows](https://www.contentful.com/help/ai-automations/workflows/)
  and [Contentful: Automation
  actions](https://www.contentful.com/help/ai-automations/automations/automation-actions/).
- **Verified external fact:** Sanity Content Releases group changes for preview,
  validation, and one coordinated publish action; Sanity also provides a
  side-by-side version comparison. See [Sanity: Content Releases user
  guide](https://www.sanity.io/docs/user-guides/content-releases) and [Sanity:
  Compare document
  versions](https://www.sanity.io/docs/user-guides/compare-document-versions).

**Product judgment:** Workflow transitions and reviewable snapshots are the
reusable pattern. HubSpot's one-time exception also warns against claiming one
universal approval-reset rule for every content type. Core's three Plan meanings
must be code-owned and source-specific; a tenant-configurable generic workflow
or “notify on update” switch would be less safe and more brittle.

### CRM attention surfaces support action-led items, not indiscriminate alerts

- **Verified external fact:** Salesforce Nonprofit Cloud's Record Alerts show
  caseworkers and reviewers when a record requires action and provide a
  description. Salesforce also supports priority/severity, snooze, and dismiss.
  See [Salesforce: Record Alerts in Program
  Management](https://help.salesforce.com/s/articleView?id=ind.prog_case_mgmt_prog_mgmt_record_alerts.htm&language=en_US&type=5).
- **Verified external fact:** Salesforce's approval experience presents pending
  approval requests in an **Items to Approve** area with direct Approve, Reject,
  and Reassign actions. See [Salesforce Trailhead: Manage Approval
  Requests](https://trailhead.salesforce.com/content/learn/modules/approval-process-for-public-sector-solutions/manage-approval-requests).

**Product judgment:** Core should borrow the action-led, contextual work item.
It should not import configurable or age-derived priority/severity, snooze,
dismiss, arbitrary assignment, direct approval from the notification, or
email. D19's fixed code-owned **Attention** presentation remains required, and
D19 already makes the source condition—not engagement—the owner of when the
item ends.

### Notification design favors the minimum effective, clearly actionable signal

- **Verified external fact:** Android says notifications should provide direct
  value, make the available action obvious, group related notifications to avoid
  overwhelming people, and avoid false urgency. When several updates are not
  independently useful, Android recommends updating existing notification
  context rather than presenting separate children. See [Android: Notification
  design](https://developer.android.com/design/ui/mobile/guides/home-screen/notifications)
  and [Android: Group
  notifications](https://developer.android.com/develop/ui/views/notifications/group).
- **Verified external fact:** Windows notification guidance says notifications
  need clear intent, should keep people in their flow, and should launch into
  the context appropriate for the selected action. Microsoft warns that too
  many interruptions lead users to turn off the channel. See [Microsoft:
  Notifications design
  basics](https://learn.microsoft.com/en-us/windows/apps/design/shell/tiles-and-notifications/toast-ux-guidance)
  and [Microsoft: Visual Studio notification
  guidance](https://learn.microsoft.com/en-us/visualstudio/extensibility/ux-guidelines/notifications-and-progress-for-visual-studio).
- **Verified external fact:** W3C says live/status messaging can become too
  chatty for screen-reader users and recommends user testing for the appropriate
  level of feedback. Status updates should be programmatically available without
  moving focus. Frequent alerts inhibit usability for people with visual and
  cognitive disabilities. See [W3C: Understanding Status
  Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages), [WAI:
  Alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/), and [WAI:
  Limit Interruptions](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o5p01-minimal-interruptions/).

**Product judgment:** The bell should receive the minimum effective set of
review requests: initial review and genuinely renewed review. There should be no
toast, sound, focus move, email, push, or repeated unread pulse for intermediate
updates. Each item needs one plain action and a destination that shows the
latest authoritative review facts.

## What the evidence proves—and does not prove

| Evidence-supported conclusion                                               | Limit of the evidence                                                                                        |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Material reviewed-content changes often reset or invalidate approval.       | Vendors differ on which changes count and often make the rule configurable.                                  |
| Qualified reviewers can be asked to review again after substantial changes. | No source proves that every raw edit deserves a new notification.                                            |
| Direct, contextual pending-review surfaces are common.                      | Vendor task, email, snooze, dismiss, priority, and assignment semantics are not automatically safe for Core. |
| Version/diff views help reviewers understand what changed.                  | A diff alone does not decide authorization, source ownership, or whether activation is safe.                 |
| Notification noise is a documented usability and accessibility risk.        | There is no universal evidence-based maximum number of Plan items per user or day.                           |
| Mobile approval/review can be useful.                                       | HubSpot/Google mobile behavior does not prove Core's exact mobile layout or performance budget.              |

No current primary source states “notify every review-required episode” as a
universal best practice. That phrase is a **Core product judgment** synthesized
from approval validity, renewed review-request, and notification-minimization
patterns.

## Reconciliation with Core authority

### ADR-0027 controls item identity and presentation

**Verified repository fact:** [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
requires one exact recipient/role-safe item for each meaningful source
transition. Read/unread is personal engagement, source completion is separate,
active actionable work cannot be archived, access loss removes presentation,
and later meaningful source transitions create new items rather than reviving
old ones.

External Android/Windows “update one notification/thread” patterns therefore do
not authorize one shared Tenant item or mutation of an old recipient item. For
Core:

- one review-required episode produces one Phase 6 occurrence;
- the bounded code-owned resolver produces one Phase 17 item per exact
  recipient+role+surface;
- a later renewed review requirement uses a new occurrence and new recipient
  items;
- the old item's engagement is never copied, reset, extended, or revived; and
- attention grouping may reduce one recipient's visual noise but cannot combine
  recipients or incompatible action meanings.

### D17 owns the review states and consequences

**Verified repository fact:** [D17](./phase-24-d17-private-default-site-locale-plan-adversarial-review.md)
makes **Ready to review**, **Changed since review**, and **Current default
changed** derived presentation states, not durable Plan lifecycle. It requires a
fresh D16 candidate for activation. A changed current default requires the
zero-public-effect **Review changed default** revision; if the planned target is
already current, the Plan becomes **Satisfied elsewhere** instead.

D20 must not redefine these source facts. It chooses only which proved
transition creates a Phase 6/17 attention occurrence.

### D19 controls recipients, engagement, noise, and side effects

**Verified repository fact:** [D19](./phase-24-d19-state-driven-plan-attention-adversarial-review.md)
requires current exact view+action authorization, per-recipient items,
independent engagement, semantic idempotency, one direct navigation action,
source-owned end, no active dismiss/archive, no external channel or timer, and
zero Plan/public/Giving/finance effect.

Consequently, D20 cannot:

- notify merely because a source row, Page, Navigation, task, timestamp, or
  revision changed;
- send to the Plan creator, prior reviewer, all staff, or all admins by default;
- create a notification when the recipient cannot immediately perform the
  displayed review action;
- re-unread or overwrite an old item;
- use one generic `plan_changed` key for three meanings;
- notify ordinary staff about ownerless or operator-only problems; or
- add email, push, reminder, deadline, priority, snooze, or direct activation.

## Recommended D20 product contract

### Three distinct meanings under one narrow product policy

The recommended founder choice can be described simply as **Notify whenever a
qualified staff member newly needs to perform a Plan review**. The eventual
manifest should still model three separate meanings because their predicates,
copy, action, and end differ:

| Meaning                     | When it becomes actionable                                                                                                                                                                                                | Primary destination action | Plain-language consequence                                                                         | End condition                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Ready to review**         | D17 proves the Active Plan has entered Ready, no higher reason applies, and the exact final-review action is available—including a genuine later Ready entry after re-review                                              | **Review planned change**  | This Plan does not change the website automatically                                                | Review requirement is completed, readiness/actionability exits, a higher reason applies, or Plan becomes terminal                |
| **Changed since review**    | A previously reviewed non-default basis materially changes and the exact recipient can immediately review the current facts                                                                                               | **Review changes**         | Earlier review cannot be relied on; public Site remains unchanged                                  | New review revision accepts current basis, actionability exits, or Plan becomes terminal                                         |
| **Current default changed** | The authoritative default head differs from the latest acknowledged expected head—or the Plan's initial expected head before a successor review—the target is not already current, and specialized re-review is available | **Review changed default** | Staff compare the current website with the planned change; this Plan changes nothing automatically | D17's latest-head current-default review revision commits, actionability exits, target becomes current, or Plan becomes terminal |

These names are staff-facing. Stable executable keys, exact digests, source
fences, and end reasons belong in the later manifest/specification; this
evidence appendix deliberately does not invent final schema names.

### “Every episode” does not mean “every update”

**Product judgment:** A review-required episode begins only on an authoritative
transition from no currently performable review requirement to one exact
currently performable review action.

- Page saves, Navigation edits, task progress, cache refreshes, source polling,
  repeated events, audit timestamps, and intermediate blocker changes create no
  occurrence.
- Further material revisions while the same review requirement remains open do
  not create another item or unread pulse. The destination re-proves and shows
  the latest current facts.
- Finishing the exact review ends its item. A later material change may create a
  new episode and new recipient items.
- A no-op rebase, provider replay, or equivalent source observation must not
  manufacture a review reset. GitLab's patch-identity behavior is useful
  evidence that semantic equivalence can matter more than raw revision count.
- Final D20 resolution: once a proved material invalidation opens an episode,
  apparent restoration does not preserve/revive the old review. A versioned
  source contract may preserve review only by proving semantic equivalence
  before it classifies/opens an invalidation.

Notification copy should remain truthful throughout an episode. The changed-
review items should say that reviewed facts changed and link to the latest
review, rather than freezing a mutable Page title or default-locale name that
could become stale before the user opens it.

### Simultaneous-state arbitration prevents duplicate alerts

One Plan can have several adverse facts at once, but one recipient should not
receive parallel **Ready**, **Changed**, and **Current default changed** items for
one next review action.

Recommended precedence:

1. If the Plan is terminal or the target is already current, use D17's terminal
   state and create no review item.
2. If serving/safety/readiness or authorization prevents the displayed review
   action, create no review item; the owning source surface remains responsible.
3. If a reviewed current-default head changed and **Review changed default** is
   immediately available, use the specific **Current default changed** meaning.
4. Otherwise, if another reviewed-basis fact changed and **Review changes** is
   immediately available, use **Changed since review**.
5. Otherwise, if there is no still-current prior review and final review is
   immediately available, use **Ready to review**.

The more specific current-default meaning subsumes the generic changed-review
meaning for that episode. If default and content facts changed together, the
single current review must show both sets of current facts; two bell items would
not create two legitimate reviews.

### Serial-state behavior

| Sequence                                                            | Expected attention behavior                                                            |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Plan first becomes ready                                            | One **Ready to review** occurrence and one item per exact recipient role               |
| Ready event retries 100 times                                       | Same occurrence/items; no additional unread pulse                                      |
| Recipient reads but has not completed review                        | Item stays active and read; no new item                                                |
| Source becomes temporarily blocked before review                    | Ready item ends; no blocker notification from D20                                      |
| Source becomes ready again under a genuinely new producer episode   | New Ready occurrence only if the later source contract proves a new review opportunity |
| Recipient completes review; non-default reviewed fact later changes | One **Changed since review** occurrence                                                |
| Several more facts change while Changed remains open                | No peer occurrence; destination displays latest review facts                           |
| Recipient records the new review; default changes later             | One **Current default changed** occurrence                                             |
| Default changes several times before re-review                      | Same open current-default episode; no notification storm                               |
| Planned target becomes current elsewhere                            | End active item and use **Satisfied elsewhere**; no review notification                |

## Staff UX and copy

### Information hierarchy

Each item should answer four questions in one short reading order:

1. **What needs me?** Site and planned locale.
2. **Why now?** Ready for first review, reviewed facts changed, or current
   default changed.
3. **What remains unchanged?** This Plan does not change the website
   automatically; current public truth appears only at the reauthorized
   destination.
4. **What can I do?** One clearly named review-navigation action.

Avoid “invalidated,” “digest,” “head,” “fence,” “occurrence,” “revision,” and
“producer” in staff copy. The destination may show a concise **What changed**
summary and a full current comparison; the notification should not attempt to
carry a complete diff.

### Suggested copy

```text
Ready to review
hope.org · French (Canada)

French (Canada) became ready for final review.
This Plan does not change the website automatically.

[Review planned change]
```

```text
Changed since review
hope.org · French (Canada)

Information used by a previous review changed.
Review the current version before continuing.
This Plan does not change the website automatically.

[Review changes]
```

```text
Current default changed
hope.org · French (Canada)

The website's default changed while this Plan was active.
Compare the current website with this planned change.
This Plan does not change the website automatically.

[Review changed default]
```

The persistence line can remain predicate-neutral:

> Reading this does not complete the work. It stays in **Needs attention** until
> this review is no longer required.

### Mobile, accessibility, and low bandwidth

- Keep the card text-first with one primary action and no rich Page/Preview
  payload; load the authenticated comparison only after navigation.
- Preserve D19's separate **Unread** and **Active** presentation. A newly
  required re-review is a new item; it does not silently turn an old read item
  unread.
- Use ordinary semantic headings, links, status text, and buttons; use text plus
  visual treatment for unread and review state, never color alone.
- At 320 CSS pixels and 400% zoom, stack content/action in one reading order.
  Preserve Core's 44px important-action target and visible, unobscured focus.
- A background arrival may update the bell/list with one complete polite status
  message. It must not move focus, use an assertive alert, pulse repeatedly, or
  announce every underlying source revision.
- On stale, offline, or authorization-lost navigation, preserve focus and show a
  privacy-safe current-state result; cached notification text never grants
  access or permission to review.

HubSpot and Google demonstrate that review actions can work on mobile, while
W3C establishes the accessibility constraints. They do not prove a particular
Core breakpoint, payload size, or latency threshold; those require repository
and production-shaped proof.

## Strongest alternative: Ready-only

**Ready-only is credible, not reckless.** It is the smallest and quietest
contract:

- one trigger, one review action, one copy/end rule;
- lowest notification volume and implementation burden;
- no chance of repeated re-review messages; and
- persistent **Site → Languages** can still show stale review truth.

Its material weakness is that the bell stops helping after the first review.
Microsoft, Google, GitHub, and GitLab all demonstrate why an earlier review may
cease to be trustworthy. GitHub and GitLab also demonstrate a renewed review
request/to-do so a reviewer knows another look is required. A staff member who
does not happen to revisit **Site → Languages** can reasonably believe their
previous review remains current.

**Product judgment:** Option 1—every newly actionable review-required episode—
is the better permanent UX because it covers the two moments with material
human-decision risk: first review and renewed review. Its notification cost is
bounded by episode transitions, not source-event volume, and D19 already makes
delivery quiet and in-product-only.

Ready-only becomes the better choice only if representative evidence shows that
Core staff reliably revisit the persistent Plan surface before activation, or
that re-review episodes are so frequent/noisy that the renewed item causes more
harm than the missed-review risk. No such Core evidence currently exists.

## Alternatives rejected by the evidence

| Alternative                                                 | Why it is weaker                                                                                                               |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Notify on every Page/Navigation/default update              | Duplicates source queues, creates storms, and asks for attention before a direct review action exists.                         |
| Mutate the original Ready item and mark it unread again     | Conflicts with ADR-0027's immutable item/engagement and no-revival rules; obscures historical meaning.                         |
| Send Ready and Changed and Current default changed together | Gives one person several cards for one review action and makes ownership unclear.                                              |
| Notify the original reviewer regardless of current access   | Historical engagement is not authorization and can leak private Plan context.                                                  |
| Email or push on each re-review                             | Adds interruption and channel policy D19 explicitly rejected; primary sources show the pattern exists, not that Core needs it. |
| Ready-only plus an age reminder                             | Does not solve stale review causally and conflicts with D18's no-age-reminder decision.                                        |

## What Core should not import

- Microsoft's automatic cancellation actor attribution or manual approver
  assignment as Core review authority.
- Google Drive's tenant/user option to preserve approvals after edits; Core's
  validity rule must be code-owned for the exact review basis.
- GitHub/GitLab repository settings as tenant-configurable Plan safety toggles.
- GitLab's email on re-request or GitHub scheduled review reminders.
- HubSpot due dates, arbitrary approver selection, one-time content exceptions,
  or direct approve-from-notification behavior.
- Contentful's generic workflow/action builder, Slack/Teams/email steps, or task
  fan-out.
- Salesforce configurable or age-derived severity/priority, snooze, dismiss,
  reassignment, or direct approval action. Fixed D19 **Attention** remains.
- Android/Windows OS alerts, sounds, arbitrary expiry, or shared notification
  identity.

## Evidence-honest proof gates

1. **Initial episode:** One false-to-true **Ready to review** transition creates
   one producer occurrence and at most one recipient+role item per exact
   resolved recipient. Refresh/retry/replay creates no peer item.
2. **Renewed review:** Completing a review, then materially changing its admitted
   basis, creates exactly one new review-required occurrence for the applicable
   meaning.
3. **No raw-update trigger:** Page saves, Navigation edits, current-default
   observations, task progress, source timestamps, and projection refreshes
   create zero item until the closed direct-review predicate becomes true.
4. **Mutual exclusion:** For one Plan+recipient at one instant, at most one of
   Ready, generic Changed, or Current default changed is the active review
   action. Current-default precedence cannot create a sibling generic Changed
   item for the same requirement.
5. **Same-episode absorption:** At least 100 further relevant source revisions
   while one Changed/current-default review requirement stays open create no new
   occurrence or unread pulse.
6. **New episode after completion:** After the recipient/source completes the
   exact renewed review, a later admitted material change creates a new
   occurrence; old item/engagement is neither updated nor revived.
7. **Source regression:** A source blocker or authorization loss ends/hides the
   review item and creates no blocker notification. Suspension always removes
   Ready; it retains Changed/Current-default only under explicit safe
   zero-public review proof.
8. **Target already current:** The Plan becomes **Satisfied elsewhere** and
   creates no Current-default review item.
9. **Current authorization:** Each list/count/detail/destination/action proves
   current Tenant, Party, role, source visibility, and exact review capability;
   historical reviewer identity grants nothing.
10. **Copy truth:** The item names the exact staff-facing state, unchanged public
    consequence, and one action without mutable source details that can become
    false during the episode.
11. **Engagement isolation:** Reading one item clears only that recipient+role's
    unread state; it does not resolve review, mark another item read, or alter
    source/public/default truth.
12. **Channel absence:** Every D20 path creates zero task, email, push, SMS,
    reminder, deadline, sound, configurable/time-derived priority or severity,
    snooze, or direct activation effect; fixed D19 **Attention** remains.
13. **Comprehension:** In a pre-registered representative study, every participant
    correctly distinguishes first review from re-review, understands this Plan
    does not change the website automatically, and identifies the one next
    action. Report roles,
    languages, devices, assistive technology, bandwidth profile, sample size,
    threshold, and confidence rule before results.
14. **Accessibility:** Keyboard, screen reader, non-color state, focus, forced
    colors, reduced motion, long/CJK/RTL strings, 320px reflow, 400% zoom, and
    Core 44px important-action targets pass; async changes use no more than one
    polite contextual announcement.
15. **Production-shaped signal/noise evidence:** Measure per-user/per-Plan
    episode frequency, unread-to-open, time to renewed review, duplicate rate,
    source-event-to-occurrence reduction, payload bytes, and p50/p95/p99. Do not
    invent a universal notification-volume threshold; pre-register the pilot
    decision rule and investigate every semantic duplicate or false-positive
    review item.

## Validation needs

- Define the exact D17 review basis/digest and which source changes are
  materially review-invalidating rather than merely new revisions.
- Prove the final semantic-equivalence rule: equivalence may preserve review
  only before invalidation; no post-invalidation apparent restoration revives
  the prior basis.
- Prove that **Changed since review** always has a direct review action; if source
  work must happen first, wait for the later direct-review transition.
- Bind the final D20 precedence and per-meaning end predicates to the later
  executable source/manifest contracts without reopening their product meaning.
- Validate the three state labels and copy with representative multilingual
  ministry staff on desktop, mobile, keyboard, screen reader, and low bandwidth.
- Measure actual re-review episode frequency in a shadow/pilot cohort before
  asserting that notification volume is low. No current Core production study
  settles that empirical question.

## Final research judgment

The evidence supports a **review-request policy**, not a **change-notification
policy**.

Notify once when a qualified person can perform the first review. Notify once
again when a completed review becomes unsafe and a qualified person can perform
the renewed review. Use the specialized **Current default changed** meaning
instead of a simultaneous generic **Changed since review** item when that is the
actual review action. Keep all intermediate edits, blockers, owner work, and
operator failures in their owning surfaces.

That is the best-supported modern balance of safety, clarity, and low noise. It
also fits ADR-0027, D17, and D19 without inventing shared engagement, mutable old
items, generic workflow automation, or another notification subsystem.
