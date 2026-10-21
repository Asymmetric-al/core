# D26 — selected next-step sharing: primary research and UX review

Research date: **October 17, 2026 UTC**. This is supporting research for the
founder's selection of Q26 A. Recommendations below are review inputs, not a
claim that a source contract, UI, permission or runtime feature exists.

## Evidence scope and confidence

Public primary help and standards pages were freshly retrieved for this review.
Published/updated dates are recorded when the page provides them; retrieval in
2026 does not make a 2020 article a 2026 product release. No authenticated
competitor account, missionary interview, coach interview, browser accessibility
session, production workload or live Core authorization test was performed.
The Maya/Jordan scenarios are illustrative product reasoning, not field findings.

The strongest supported need is modest: people benefit from a maintained account
of a next step, its due date and whether it remains open. Fundraising tools
document tasks and coaching views, and coaching software documents actions. These
sources do not establish a universal ministry method, compulsory reports,
supervisor access or permission to disclose supporter data.

## Fresh primary-source ledger

All URLs below were directly opened, not accepted solely from search snippets.
Each limited claim is separate from the Core product judgment it informs.

| ID     | Primary source and date                                                                                                                                                                                                 | Verified limited claim                                                                                                                                                     | Core application and boundary                                                                                                                                                                                                                                                                                                                                                                                 |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UX-S01 | [MPDX: Create, Edit, and Log Tasks](https://help.mpdx.org/article/180-create-edit-and-log-tasks); updated **February 18, 2021**; retrieved October 17, 2026                                                             | The help distinguishes adding planned work from logging completed work, permits editing and associates contacts when applicable.                                           | Keep planned/completed meaning clear. A task checkbox alone must not become provider sending evidence, a completed conversation or donor outcome. Do not import its contact-association display into coaching.                                                                                                                                                                                                |
| UX-S02 | [MPDX: For MPD Coaches, Team Leads and Supervisors](https://help.mpdx.org/article/510-for-mpd-coaches); updated **October 28, 2020**; retrieved October 17, 2026                                                        | Describes missionary invitation, a view-only coaching relationship, selecting among multiple coached people, and removal by either participant.                            | Useful precedent for one clear coaching entry, subject selection and leaving. Its initials/amounts and effort thresholds are not evidence of anonymity or an appropriate Asym evaluation method; do not import them.                                                                                                                                                                                          |
| UX-S03 | [CoachAccountable: client Actions](https://www.coachaccountable.com/clientKnowledgeBase/actions); **undated**; retrieved October 17, 2026                                                                               | Describes self-created actions with wording and due date, editing, current outstanding work, completion and cancellation.                                                  | Supports a compact action record and truthful cancellation distinct from success. Its coach assignment, comments, reminder emails and red/green performance interpretation are outside the accepted Core read-only scope. Screenshot file dates are not publication dates.                                                                                                                                    |
| UX-S04 | [TntConnect: Analysis View](https://www.tntware.com/tntconnect/help/en/pages/analysis-analysisview.aspx); **undated**; retrieved October 17, 2026                                                                       | Documents an Excel weekly coach update and an option to include underlying weekly activities via a setting for new tasks/history.                                          | Shows an existing need to communicate progress, but that broad future-content toggle and exported copies conflict with D26's selected-task disclosure and current-access model. Use no export dependency or automatic sharing of future tasks.                                                                                                                                                                |
| UX-S05 | [Asana: Task permissions](https://help.asana.com/s/article/task-permissions); **undated**; retrieved October 17, 2026                                                                                                   | Describes contextual task access, project/collaborator access, permission elevation for assignment and highest permissions across multi-homed projects.                    | Permission inheritance can surprise users. Core must show the named coach audience and grant only its qualified projection. Asana's prose says project viewers cannot comment, while a later task capability table marks viewer comments allowed; this internal inconsistency means the page does not establish a universal viewer capability matrix. Import neither elevation nor broad collaborator access. |
| UX-S06 | [GOV.UK Design System: Check answers](https://design-system.service.gov.uk/patterns/check-answers/); **undated**; retrieved October 17, 2026                                                                            | Recommends a review before confirmation for small/medium transactions, a clearly named final action and ways to change information without repeating the whole flow.       | Apply one concise sharing review with exact recipient/content and direct correction. Do not copy GOV.UK styling or create a long wizard for a three-field summary.                                                                                                                                                                                                                                            |
| UX-S07 | [W3C: Understanding SC 4.1.3, Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html); current explanatory guidance, **no publication date relied on**; retrieved October 17, 2026           | Important status messages can be exposed programmatically without taking focus.                                                                                            | Announce saving, sharing and failure outcomes without stealing focus. A toast alone must not carry durable sharing state.                                                                                                                                                                                                                                                                                     |
| UX-S08 | [W3C: Understanding SC 2.5.8, Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html); current explanatory guidance, **no publication date relied on**; retrieved October 17, 2026 | Describes 24 by 24 CSS-pixel minimum targets with defined exceptions; also notes larger targets help many people.                                                          | Follow Core's shared touch-target controls; do not shrink stop-sharing/recipient controls to tiny icons. The WCAG minimum is not a claim that 24 pixels is an optimal product target.                                                                                                                                                                                                                         |
| UX-S09 | [W3C: Understanding SC 1.4.10, Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html); current explanatory guidance, **no publication date relied on**; retrieved October 17, 2026                            | Non-excepted vertically scrolling content must work at an equivalent 320 CSS-pixel width; the familiar 1280-pixel/400% example is an equivalence, not the sole test setup. | Stack summary rows on narrow screens and preserve full description/review content. Do not rely on a dense desktop task table or forced horizontal scrolling.                                                                                                                                                                                                                                                  |

Research retrieval references retained for reproducibility: MPDX task and
CoachAccountable `turn260931view1`/`turn260931view0`; MPDX coaching
`turn107505view2` and `turn281472view5`; TntConnect `turn107505view3`;
Asana `turn107505view0` and `turn757817view0`; GOV.UK `turn107505view1`;
W3C `turn281472view0`–`turn281472view2`. These identifiers are tool provenance,
not public links or a guarantee of unchanged external page content.

## Repository constraints checked

- [Q26's researched choice](../phase28-q26-coaching-next-step-summary-research.md)
  distinguishes selected live task summaries from already permitted authored
  next-step context. Do not reopen general coaching access or add a task engine.
- [D8 read-only and voluntary boundaries](../phase28-d8-adversarial-review.md:487)
  exclude coach comments, assignment, editing and completion. Its
  [dashboard direction](../phase28-d8-adversarial-review.md:150) supports multiple
  permitted missionary/project contexts with source freshness and no hidden
  totals, effort score or cross-tenant portfolio.
- [D25-C04–C08](../phase28-d25-check-in-questions-adversarial-review.md:218)
  separate private drafting, exact deliberate disclosure, current access and
  operational effects. D26 cannot turn check-in prose into a task or revise old
  written check-ins automatically when a task changes.
- [D25-C12–C14](../phase28-d25-check-in-questions-adversarial-review.md:325)
  prohibit protected copied context, broad cache/export leakage and unsafe
  geography labels. A safe-looking summary is not a source-authorization bypass.
- [Frontend rules](../../../../ai/rules/frontend.md:28) and
  [shared UI ownership](../../../../../packages/ui/AGENTS.md) require shared
  Base UI primitives, exact `base-maia` and semantic Zinc-oriented tokens.
  `packages/ui/components.json` was read and matches that declaration. No
  configuration or runtime UI was changed; no CLI UI qualification was needed
  for this documentation-only research.
- [Accessibility review](../../../../ai/skills/accessibility-review/SKILL.md)
  and [testing rules](../../../../ai/rules/testing.md) require semantic controls,
  keyboard/focus/manual interaction checks as well as applicable automated
  checks when the actual UI is built. This research does not claim those passed.

## Recommended product shape

**One ordinary task, one current authorized projection, an explicit audience.**
Keep the source task's due/status authoritative. The coach receives an approved
plain-text coaching description, current permitted due value and current
permitted status. The coach never receives the raw task object, its private
description, contact links, comments, attachments, event history or edit controls.
Do not create a second task or an independently writable coaching status.

An approved coaching description is a disclosure artifact, not a second task
title the missionary must keep synchronized manually on every date/status edit.
It must be distinguishable from the private source description in the share UI.
Subsequent task title/body/scope changes must not silently disclose new text or
make the old summary describe a different task. The source contract must identify
changes that invalidate that approved meaning; if it cannot prove continuity,
withhold the projection pending review. Do not attempt to infer semantic safety
with AI or a text scanner. Pure due/status updates do not require another share
confirmation while eligibility and the approved task meaning remain valid.

This distinction earns the live module's complexity: Maya updates ordinary work
once, without turning every task edit into public prose or gaining a new approval
workflow for her own tasks. A summary that needs re-review does not block ordinary
task editing. Privacy narrowing and Stop sharing remain available independently.

## Maya's journey

### 1. Discover a useful, optional action in normal work

Maya opens her existing task. Its ordinary title, due value and status remain
where she expects them. An eligible task has a secondary **Share with coach**
action. Its presence is capability-shaped, not a global control that fails after
she fills out a form. Task creation and completion do not opt her into coaching.

Where the feature is configured but unavailable, one brief explanation is enough:
**“Your organization has not enabled next-step sharing.”** Where a task's source
purpose is not eligible, use **“This task cannot be shared with a coach.”** Give
further source detail only to Maya when independently authorized. Do not offer a
copy/paste route around classification, a request for unrestricted coach access
or a per-task exception form that the owner contract does not support.

No coach relationship: show the established connection action/context if Maya
is allowed to invite one. Do not enroll Jordan, create an invitation or retain a
pending auto-share as a side effect of creating a task.

### 2. Review the exact disclosure in one coherent surface

Use a single sheet/dialog or narrow page composed from the existing shared UI.
An appropriate form-factor choice belongs to implementation/user testing, not a
new product architecture. It must show the entire reviewed wording and recipient
without hover, an extra accordion or a cropped mobile preview.

Illustrative content:

```text
Share a next step
Community Ministry · Example Organization

Share with                         Jordan Lee · Coach
Description Jordan will see        Revise my support-raising introduction
Due                                Friday, 23 October 2026
Status                             Open
Access                             While your selected coaching access remains active

The due date and status stay up to date from your task.
Only this reviewed description is shared. Private notes and supporter details
are not included.

[Cancel]                                          [Share with Jordan]
```

The date and names are illustrative. Reuse the relationship's actual expiry and
show its concrete end date when present. Avoid requiring another independent
expiry setting solely for this module unless the accepted grant model needs it.
The description is plain text; no automatic extraction or redaction of the full
task body. If current policy permits a safe title suggestion, display it for
review, never silently publish it. Otherwise begin with a blank coaching
description and a helpful, non-sensitive example.

If several coaches are eligible, the named audience must still be explicit. Do
not default to every coach or infer recipients from who last viewed a check-in.
If adding/removing a recipient, show the retained audience and exact change.
Do not accidentally give a replacement coach the former coach's selection.

The primary button names the consequence. **Save** is insufficient because it
does not tell Maya that Jordan will gain visibility. **Send** is misleading
because this operation does not send a message. Do not add a second generic
“Are you sure?” after the exact review.

### 3. Confirm success truthfully and return to work

After a committed share, retain a compact **Shared with Jordan** indicator next
to the task's sharing action, and announce the outcome. A success toast is useful
feedback but not the only way to know current sharing. Provide **View shared
summary** and **Manage sharing**. A preview uses the same admitted fields as
Jordan's read; it must not use broad missionary data then hide fields with CSS.

If a request times out, say **“We couldn't confirm whether sharing finished.”**
Resolve the durable operation before offering another effective share. Keep the
reviewed text locally in the active form as appropriate; do not claim **Not
shared** solely because the browser lost the response. An error is not permission
to leave a broad pending grant behind.

### 4. Update the task once

Maya changes the due date or status through ordinary task management. The existing
sharing indicator reminds her that those permitted facts stay current for Jordan.
Do not make Maya enter the same change into a coaching checklist. Completion is
shown as the task's recorded completion, not independently verified ministry work.
Cancellation is not completion. Reopening is not a second task or a failed
missionary; it is the current source state when the contract permits it.

If the approved meaning is invalidated, show Maya **“Review this shared next
step. The task changed.”** with **Review sharing** and **Stop sharing**. Jordan
must not see newly changed sensitive text or old wording paired with a materially
different current task. Ordinary private work continues.

### 5. Stop sharing without threatening the task

Use **Stop sharing with Jordan**. Explain **“Your task stays in your task list.”**
This action changes disclosure, not task completion, deletion or coach membership.
Do not force Maya to fix stale description validation before revoking access.
Show committed result and current state; if the outcome is ambiguous, reconcile
it. An Undo control must not silently recreate a grant; re-sharing requires fresh
deliberate review. Explain limits accurately: content Jordan already read cannot
be recalled, while future authorized releases are fenced by current access.

## Jordan's journey across people, projects and organizations

Jordan enters the existing **Coaching** surface, selects the organization and a
currently permitted missionary/ministry context, then sees **Next steps** near
the relevant written check-in. Do not combine organizations into a global
performance leaderboard or reveal counts for subjects Jordan cannot access.

Within one context, show a short readable list:

```text
Next steps                         Shared by Maya · Read-only

Revise my support-raising introduction
Open · Due 23 October 2026
Updated 20 October 2026
```

Where a timestamp is allowed and reliable, label freshness precisely. **Updated**
must mean source-backed update, not the moment a browser re-rendered. A bounded
refresh indicator can instead state **Checked just now** if that is what happened.
Do not show private source history, assignee names or who changed a task merely
because a current status is allowed.

Open/current items should be immediately scannable; completed/cancelled shared
items may be reached through a simple status filter when admitted by the actual
retention/history contract. Do not silently create a historical coach archive.
Ordering by due date is useful, with undated items retained and clearly labeled;
it must not imply that undated work is unimportant. No drag-to-rank UI is needed.

The preview/detail has no completion checkbox, assignment button, comments,
private-task link, supporter name or fake disabled editing toolbar. Jordan can
prepare for a real conversation and use the parties' existing communication
channel. This decision adds no reminder, scheduling, messaging or export system.

A portfolio with many permitted subjects may show the next shared due date as
already contemplated by D8. Any count means **shared next steps**, never all of
Maya's work or an effort score. A new task, recurring task occurrence, copied task,
new ministry scope or another coach does not join automatically.

## Distinct states and copy

| Situation                             | Maya sees                                                  | Jordan sees / boundary                                                                                                               |
| ------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| No selected tasks                     | Normal tasks and optional sharing action                   | **No next steps shared.** Do not say Maya has no tasks or is inactive.                                                               |
| No due value                          | **No due date** in exact review                            | **No due date**; do not invent midnight, a deadline or a late state.                                                                 |
| Source open                           | Existing task status                                       | **Open**, or the admitted source status; no inferred outcome.                                                                        |
| Source complete                       | Source completion result                                   | **Completed** or **Marked complete**, according to source vocabulary; no fabricated call/send evidence.                              |
| Source cancelled                      | Source cancellation result                                 | **Cancelled**, if admitted; never count it as completed.                                                                             |
| Due value changed                     | Existing task updates; sharing indicator remains           | Current allowed due value. Do not publish an unauthorized old-to-new date trail.                                                     |
| Task meaning changed                  | **Review this shared next step**                           | Withheld current projection; do not continue old wording with unrelated facts. A generic unavailable state must itself be permitted. |
| Policy or source eligibility narrowed | Clear scoped explanation and safe management               | Remove protected projection; do not leak task title, previous count or reason through empty states.                                  |
| Access expired/revoked                | Relationship/sharing state reflects the cause              | Existing access-ended experience; no retained task detail or automatic revival on renewal.                                           |
| Task deleted or disposed              | Source-owned lifecycle result                              | Do not retain a ghost summary. A tombstone only when its existence/disposition is separately authorized.                             |
| Temporary source/read failure         | Sharing state is not falsely changed to unshared           | **Next steps couldn't be loaded. Try again.** Never show zero tasks or completed as the fallback.                                    |
| Offline/connection loss               | No false successful share/stop; preserve recoverable input | No promise that an old cached value is current or still authorized. Reauthorize on return.                                           |
| Wrong tenant/hat after navigation     | Clear current organization/context                         | Clear protected prior content before the new context loads; accessible labels and title must not retain it.                          |

Text examples express intended user meaning. Final labels must match the actual
source status vocabulary and localization, not create a parallel status model.
Statuses such as **In progress** require real source meaning; do not infer them
from opening a task, page dwell time or a nonempty note.

## International, mobile and accessible behavior

Use a quiet hierarchy: context and audience first, then description, due and
status. Shared `base-maia` spacing/type/tokens provide visual coherence; arbitrary
new colors, charts, celebratory completion animation and dense icon toolbars add
no value to this small read-only module.

- Preserve long names and ministry labels; do not require Western first/last-name
  assumptions or expose a private location through an IANA zone's city name.
- Treat a source calendar date as a calendar date, not a UTC instant converted
  into another day. For actual timed due values, preserve source semantics and
  display a safe unambiguous zone/offset where authorized. Do not invent a timezone
  from missionary geography. A relative label such as **Tomorrow** needs an
  accessible full date and an agreed calendar context.
- Reflow non-excepted content at 320 CSS pixels, support 200% text resizing and
  avoid mandatory hover. Keep full review text and named audience visible before
  the final action. Text truncation on a list may use an accessible detail route,
  but never conceal the content being approved.
- Status uses text, not color alone. Sharing is indicated in persistent visible
  content, not only a lock glyph or tooltip. Shared components own target size,
  keyboard behavior, focus containment and return focus after dismissal.
- Use logical headings, lists or definition lists for summaries; real labeled
  buttons for actions. Associate errors with fields. Announce material async
  outcomes without repeatedly narrating every background refresh.
- Honor source language and RTL input; localization applies to chrome and dates.
  No automatic translation of the approved description is introduced.
- Low-bandwidth view loads bounded authorized summaries, no charts/assets/raw
  source objects for this module. No offline sharing queue or automatic retry that
  can restore a withdrawn grant is necessary for a good first release.

## Strongest alternative and proportionate scope

**B remains a credible no-build alternative for the live module:** the already
ratified written check-in can describe Maya's next step and progress in her own
words. It preserves exact deliberate publication and needs no task projection.
Its limitation is repeated copying and stale narrative context. That does not
justify rewriting historical check-ins automatically.

The selected A is worth its cost if confined to an explicitly selected eligible
task and minimal fields with current authority. Avoid a generic project-sharing
platform, per-field ACL editor, coach task assignment, comment threads, AI status
inference, completion scores, automatic future-task sharing, recurring coaching
reminders, scheduled exports and independent task synchronization. Existing task
owners must define eligible task kinds before admission. If a task kind cannot
produce the safe projection, that kind stays unavailable; eligible kinds and
plain written check-ins remain useful.

## Proof obligations and evidence still needed

These are acceptance/release evidence obligations, not tests executed by this
research note. Their ownership should be carried into the D26 main review.

1. **Disclosure comprehension:** representative missionaries, including mobile
   and low-bandwidth users, can identify the exact recipient, reviewed wording,
   automatically updated due/status, excluded fields and how to stop sharing.
   Any observed belief that creating a task shares it, or that Stop deletes it,
   requires UI/copy correction and retest before release.
2. **Coach comprehension:** coaches with more than one permitted context can
   choose the right subject/organization and distinguish no shared work, source
   complete, cancelled and unavailable. Any mistaken belief that task completion
   proves contact/delivery, or that empty means inactivity, requires correction.
3. **Current truth:** due/status edits appear from the same source task while
   eligible; source text/scope changes cannot silently expand disclosure or create
   a semantic mismatch. Recurring/copy/new tasks do not inherit the selection.
4. **Revocation and failures:** exact preview and committed share agree; two-tab
   changes preserve input but cannot share a stale scope; policy narrowing, Stop,
   expiry, context switch, deletion and retry do not revive prior disclosure.
5. **Accessibility:** test keyboard-only interaction, screen-reader names/status
   announcements, visible focus/return, 320 CSS-pixel reflow, 200% text resizing,
   target size and RTL/non-Latin/long-name cases on the actual interface. An axe
   pass alone does not satisfy this obligation.
6. **Operations:** support can identify source/ref/version and current grant
   reason without exposing task bodies in logs. Error copy reflects source
   unavailability rather than claiming a successful mutation or zero activity.

No indispensable new founder question was found. The selected outcome and
existing source/permission boundaries support these amendments; task-kind
qualification, precise source status mapping, durability and measured capacities
are engineering/source-owner evidence obligations, not guesses to delegate to
the founder or excuses to broaden access.
