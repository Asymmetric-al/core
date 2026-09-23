# Phase 26 D14 — Reply targets, daily work and reporting

11 September 2026. **Complete fully founder-ratified UX accompanying selected A, 11 September 2026.** This blueprint applies the [full decision](phase26-d14-adversarial-review.md). It specifies the intended experience, not a rendered or tested product interface. D1–D13 stay governing, with D14's explicitly ratified due-review and source/coverage extensions.

## A small feature with clear meanings

The ordinary experience is one time beside the work: **Reply due today, 14:30**. Once needed, it becomes **Reply overdue · due 14:30**. There is no green On track shield, countdown animation or repeated warning. Time remaining proves neither progress nor coverage.

The donor continues normal email and sees no internal target. Staff's **Follow-up reminder** remains separate: it means when they intend to review/follow up, while **Reply due** comes from the inbox's timing policy. Resolving a conversation or completing Finance work is a different fact. The D13 automatic confirmation has no human reply credit and does not publish these targets.

Reuse Core's exact base-maia/Base UI components, spacing, typography, semantic tokens, existing list/detail layout and light/dark behavior. Do not introduce a new palette, animation language, card-heavy dashboard or another Support application. Beauty is a stable hierarchy with the right detail available on demand.

## Set up an inbox

In the selected inbox's existing settings, use **Reply targets** with this helper:

> Internal timing goals for your team. These do not send messages or promise a response time to requesters.

Start **Not configured**. Queues and follow-up reminders remain useful. Do not fill in the old 480/720-minute/five-day values or invent another industry-wide promise. Tenant administrators choose durations based on their actual coverage; no extra founder question is needed to prescribe a universal number.

```text
Reply targets
Internal timing goals for your team.

First reply       [Use target]       [duration] [hours / minutes]
Next reply        [Use target]       [duration] [hours / minutes]

Count time        Service hours / Elapsed time
Service calendar  Donor care hours · Asia/Bangkok       View

Example           Received [sample date and time]
                  Reply due [computed date, time, zone]

Changes apply to new reply periods.
Existing targets keep their saved rules and due times.

                                             Cancel    Save
```

This is a layout sketch, not executable input or selected durations. First and Next are independently optional; enabling the feature requires at least one valid duration. Each is a positive whole-minute value, with exact hours/minutes conversion and inline errors for invalid or unrepresentable values. Do not offer a days unit whose meaning changes with service hours. Provide accessible definitions:

- **First reply:** the reply expectation before human correspondence with that person/address has begun in the original conversation.
- **Next reply:** the expectation once that human exchange is underway, measured from the next input requiring a reply—not between two staff messages.

An already-accepted human outgoing initiation can establish Next for a later incoming message. A system confirmation or No reply needed does not. First/Next follows the logical human-send/input sequence recorded by Core, validated by actual acceptance; it does not mean a person already received or read the earlier email. When evidence is uncertain, the server supplies the qualified uncertainty state; the browser does not choose a different duration.

**Service hours** counts only the selected calendar's working intervals. **Elapsed time** counts continuously, including nights and weekends; do not call it 24/7 coverage. Show calendar name, actual zone and a concise schedule summary. Missing/loading/inaccessible/unqualified calendar are distinct and block Service hours, without silently changing the basis. View/Edit opens the authorized existing calendar surface and preserves the settings return context.

The **Example** preview uses the same qualified server calculator as real targets and synthetic input. Allow a sample receipt instant and show the exact resulting due time/zone. Include an outside-hours example when applicable. The preview is not a response promise, real work item or test email. Saving does not silently enroll older waiting work or change pending times.

Ordinary edits publish prospective revisions. Delayed input uses its applicable source-time revision or captured bundle, not whichever revision happens to be current when a worker runs. Truly pre-enable/Off input stays untargeted. This detail belongs in **How targets apply**, not a technical explanation on every form row.

## Turning targets off

Use a separately named action **Turn off [Inbox] reply targets**, with a concise consequence preview:

> Stops new targets and withdraws unfinished targets created by these settings, including conversations now handled in another inbox. Missed targets remain in reports. Conversations, assignments and follow-up reminders stay in place.

Show only permitted impact rows/counts. If cross-inbox detail cannot be disclosed, state the scope without a count or false zero. The operation is conditional and reconciled by its durable identity; a stale preview refreshes instead of silently applying a changed scope.

Because moved work can retain another inbox's target, an Off summary must be accurate:

> No new targets from this inbox. Existing targets from other inboxes may still apply.

Off withdraws target applicability, not the underlying need to reply. Re-enable does not resurrect old targets. Before-due withdrawal is a visible reporting exclusion; a confirmed miss already incurred remains. Mail already submitted remains real, and late acceptance is evaluated against the exact withdrawal cutoff rather than webhook arrival order.

## Daily inbox and detail

```text
Shared inbox                               Reply due ↓   Filter

Conversation                  Status               Reply due
Maya · Receipt question       Open                 Today, 14:30
Church office · Account help  Waiting on our side   Overdue · Tue, 16:00

Maya · Receipt question
Open                         Assigned to Alex
Reply due today, 14:30         Why this time?
Follow-up Friday, 09:00        [only if present]

[Original message and actual conversation history]
[Existing Reply / Internal note composer]
                                                  Send reply
```

The sketch shows actual work state and target independently. A due-review transition may be pending during worker delay; do not display Open before its authoritative transition. The due query still surfaces the work and explains review is needed. Once committed, the ordinary status is Open.

The inbox list remains one row per current continuing work item. Its primary cue uses the earliest applicable authorized target, with attention precedence for a confirmed overdue obligation. An earlier uncertain candidate must not hide a different confirmed overdue target; details retain both facts. Conversely, a known future target cannot hide an earlier possible deadline. Use one primary cue and exceptional detail, not a badge for each participant.

Add **Reply due** sorting and **Overdue replies** filtering to existing views. Count inbox rows as conversations, not individual reply periods; a tooltip/helper can say **Conversations with overdue replies**. Filter membership checks all permitted underlying periods, not only whichever cue won display precedence. A **Timing needs confirmation** filter may overlap Overdue when different underlying obligations coexist; do not add the counts as disjoint totals. No historical date filter may remove old current overdue work.

**Why this time? / View reply targets** opens an accessible detail panel with:

- Who needs the reply, using permitted observed/source identity and qualified response route.
- The original message/source link and oldest uncovered receipt time.
- First/Next classification, configured duration, time basis and bound calendar/zone.
- Due time, actual current coverage and any acceptance uncertainty.
- An explanation of original policy/work-home lineage when work moved or continued elsewhere.

Do not expose raw IDs, profile rules or sensitive hidden-source counts in ordinary display. One person's reply deadline does not imply they are a unique CRM person; a church shared mailbox can represent several legitimate users. A reply to another participant does not clear their input. The server-owned source/audience review supplies coverage; the user is not forced through another modal on every Send.

## When the target is reached

Explain this once in setup help:

> When a reply target is reached, the conversation returns to Open for review. Its existing follow-up reminder is kept.

The durable detail/history wording is **Reply target reached — review needed**. This overrides deferral for visibility but preserves a valid later follow-up reminder. Ordinary explicitly selected Open still follows D3's clear-reminder behavior. Existing D7 coverage and D8 restrictions apply to the new Open work; no separate target escalation or new assignment rule is introduced.

Once staff review and choose a valid plan, the same overdue period does not repeatedly reopen work. Its overdue result remains until response/disposition; new independent input or another due period can create review normally. There are no per-target email alerts, reminder campaigns, repeated toasts or minute-by-minute screen-reader announcements. Current recovery remains discoverable through existing qualified surfaces.

## Replies, uncertainty and No reply needed

After **Send reply**, show the real P6 state. A queued draft or a request awaiting provider evidence cannot become a successful reply-time result. A properly accepted human reply can satisfy its exact reviewed recipients/input scopes; it does not prove mailbox delivery, reading, resolution or helpfulness. A later bounce remains prominent as current delivery recovery without erasing a genuine earlier submission time.

If a new input arrives after the reply's coverage was frozen, it stays owed. If prior acceptance changes whether its target is First or Next, show **Reply timing needs confirmation** and the earliest applicable possible deadline. Do not hide a possibly imminent Next target behind a longer First target. The existing source/delivery repair flow owns the uncertainty; no timer retry sends another email. When accepted-response coverage is confirmed, the reply obligation is fulfilled even if its exact historical timing cannot yet be scored. Show that uncertainty in outcome/report detail; do not keep telling staff to reply or reopen work merely to calculate a score.

For messages that genuinely need no reply, use **No reply needed** on the exact current reviewed response scope. This action remains meaningful even when targets are Off. Copy:

> Marks these messages as needing no reply. The conversation and follow-up reminder stay in place.

Use “this message” for a single contribution and show additional scopes only when necessary. It does not settle a known promised reply or unreviewed recovery. Partial selection preserves uncovered older/newer input. When a valid Resolve already ends all remaining response work, do not force a separate No reply needed click.

Persistent **Undo no reply needed** corrects only the still-current mistaken disposition for still-unfulfilled input, with current authorization and source fences. Preserve original age/policy; reconcile current work instead of restoring an old status/reminder snapshot. Already-fulfilled input is unchanged, newer input remains separate, and a separately disabled target remains disabled. Any resulting historical correction/miss is explicit. A toast may offer convenience, but is not the only correction path.

## Reporting without misleading scores

Reuse existing Support Reports and its Inbox/Overview structure, with **Reply timeliness** as a focused section. Dates, filters and definitions belong beside the data; do not add a separate reporting application. Each section has a different, explicit unit:

| Section                                                  | Date anchor and unit                                                                                                                  | What it shows                                                                                                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Replies needing attention**                            | Current, all ages; server **As of** time. Work-list rows/counts are current conversations, with underlying waits in detail.           | Waiting, confirmed overdue, evidence/timing problems and untargeted response work. Historical date selection does not hide this backlog.                 |
| **Targets due in [period]**                              | Frozen target due instant in a half-open interval, displayed in the selected report zone. Unit: finalized reply-target instances.     | First/Next on-time, replied-late, confirmed unanswered-overdue misses, outcome-unknown and ended/withdrawn exclusions.                                   |
| **Potential targets — timing/applicability unconfirmed** | A valid candidate due can intersect the selected period. Unit: deduplicated unresolved source/period, outside the scored denominator. | Prevents uncertainty or candidate splits disappearing from coverage; does not claim a finalized target or a miss.                                        |
| **Reply times**                                          | **Waiting periods ended by a staff reply in [period]**. Unit: completed waits, not emails.                                            | Median/p90, exact measured sample count, First/Next and chosen time basis, plus excluded/unconfirmed timing counts. **One reply can end several waits.** |

For target attainment use **On time among assessed** and **X of Y finalized targets assessed**. Show unknowns/exclusions/potential targets beside that coverage. On-time numerator and assessed denominator are explicit; a confirmed still-unanswered miss belongs in the denominator. Before-due No reply needed/Off is excluded rather than “met”; a known post-due miss remains despite later cleanup. Source-owner correction is visible history. No data displays **—**, never 0 minutes or 100%.

For duration charts, show **N completed waits** and the exact-timed sample count. A bounded acceptance interval that straddles the selected period is listed under **Completion period uncertain**, outside exact samples; do not force it into a day. Uncertain cohort counts are not additive across periods that the same interval might occupy; totals deduplicate source/period IDs. Median/p90 uses the specified formula and bound clock evidence, never a current default-calendar recomputation. Do not pool elapsed and service-hour durations into a misleading unlabeled percentile. Elapsed comparisons can use genuine elapsed start/end; service-hour results require each wait's qualified bound calendar and disclose missing-calendar exclusions.

Keep completed-duration charts next to a link/summary of outstanding work. A low median does not mean an old unanswered request disappeared. Avoid rankings or a score implying staff effort, donor satisfaction or successful resolution. Label **Currently assigned/handled by** separately from historical responding actor and policy-at-start/custody-at-due dimensions. A transferred conversation does not rewrite who sent the earlier reply.

Every chart/number drills into the same authorized source-backed cohort. Export uses that same snapshot/definitions and current download authorization, with no hidden message-body export. Counts, bars, tables and filtered results must agree; no browser aggregation of a capped conversation list or message payload download.

## CRM and other owner surfaces

When staff open a conversation from a permitted CRM record, show the same Reply due/overdue/uncertain projection and preserve their record/filter/draft location on return. Only actually permitted source and CRM details appear. A Related Party does not automatically receive email or become the reply correspondent; target changes do not create CRM interactions. P6 retains the actual reply once.

A Finance task can remain open after a timely Support update. A receipt/refund/account change can finish without a human Support reply. Each owner validates, authorizes and records its own action; staff deliberately communicate or mark no reply needed based on the actual current obligation. Internal targets never become donor-facing business completion promises.

## Accessibility, mobile and stability proof

Use named semantic controls, visible focus, sufficient contrast and text/icon meaning. All target detail and definitions must work without hover. At 320 CSS pixels and 200% zoom, preserve the selected conversation, useful due information and accessible action labels without horizontal mandatory tables. RTL, long international names, locale-specific dates and timezone abbreviations must not truncate the essential date or hide the source identity.

Ticking time may refresh display but must not reorder a row beneath a pointer, move keyboard focus or announce every minute. Explicit refresh/filter/sort follows established stable-selection behavior. Low-bandwidth/offline data shows its As of/stale status; reconnect revalidates current permissions and state. A pending action remains pending until its durable outcome is known; a later old response cannot replace a newer result.

The required scenarios are D14-P01–P55. The source probe and calendar oracle inform them but are not browser, accessibility, provider or ministry usability proof. The design is complete as a proposed grooming blueprint; the full amended decision remains pending founder ratification.

## Founder ratification — 11 September 2026

> Yes, I ratify this, including all the amendments, additions, adjustments, changes, and updates you’ve made. Record the ratified decision and all changes in full for this grill-with-docs session.

The founder fully accepts D14 and every adopted amendment, addition, adjustment, change and update: the exact corrected decision; D14-R01–R30; D14-P01–P55; all 23 adversarial category outcomes and their severity, likelihood, evidence, permanent corrections and decision effects; the full setup, quiet daily guidance, correction, reporting and CRM UX; all twenty-one adopted independent corrections; glossary and source/owner boundaries; all nine operational signal/threshold/owner/response entries; and every stated implementation, migration, activation and proof obligation.

This includes optional First/Next configuration; precise versioned source-time policy and calendar binding; DST/holiday/overlap arithmetic; exact original/correspondent periods and reviewed accepted-recipient coverage; logical First/Next send/input ordering; acceptance intervals and unknown reporting; fulfillment independent of scoring precision; scoped Off, No reply needed and persistent correction; D3's one due Open review preserving a valid future reminder; D10 merge/Undo and D12 sealed continuation; complete report cohorts, denominators and formulas; current authorization and source-safe CRM projections; and qualified additive rollout and recovery.

**Accept with required amendments** remains the historical review disposition; all adopted amendments are now accepted in full. The substantive review, clauses, category/proof tables, operational controls and UX body remain verbatim. Stage-only proposed/pending/no-next-question wording in those preserved historical blocks is superseded by this dated ratification. D1–D13 remain fully ratified and unchanged. Continue to the next single researched question; no repeat approval of D14 is required.

**Terminology disambiguation:** D2 already defines **Reply target** as the particular message being answered. Preserve that meaning. D14's canonical glossary term is **Internal reply target** for the timing expectation; contextual **Reply targets**, **First reply**, **Next reply** and **Reply due** remain the recorded UI wording. Earlier D14 timing uses of reply target carry this qualified meaning. This editorial clarification changes no policy, behavior, formula, permission or proof obligation.

The [ratification and next-question validation](d14-ratification-q15-validation.json) verifies preservation separately from the historical D14 review validation. This is ratified local grooming authority, not a formal specification, runtime implementation, provider publication or production-readiness claim. No product code/schema, tickets, GitHub/provider/DNS/credential changes or real messages are authorized by this recording.
