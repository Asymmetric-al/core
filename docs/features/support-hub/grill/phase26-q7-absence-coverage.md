# Phase 26 Q7 — Existing work during a planned absence

**Current status: answered B and fully ratified, 11 September 2026.** The founder selected Transfer Open work, then cover later Open work and requested the full adversarial review with exceptional UX clarity. The [complete D7 review](phase26-d7-adversarial-review.md) records every exact amendment as fully founder-ratified. **Historical question follows.** D1–D6 and every adopted amendment are fully ratified. Research checked 10 September 2026 against current Core and primary support-platform documentation. This question selects the timing and scope of coverage for already assigned work during an explicitly declared absence. It does not change D6's receiving toggle, choose a workforce calendar, settle permanent offboarding, create a formal specification or authorize implementation.

## Practical context

We have settled how a new conversation gets its first assignment. The next dependency is what happens to work already assigned to someone who will be away for several days.

**Receive new Support assignments = Off remains exactly as ratified:** stop new automatic intake to that person; preserve existing assignments. Planned absence coverage would be a separate deliberate choice with clear effects, never inferred from browser inactivity, a time zone, an email auto-reply or that receiving flag.

Example: Maria will be away next week. She has an Open receipt question, one conversation Waiting for requester, and another Waiting on our side with a follow-up due Tuesday. Sarah may also reply to an older Resolved conversation Maria handled. Daniel is authorized to handle the relevant Support work; this does not give him Maria's CRM, giving or member-care permissions.

The trap is that handing off today's list alone cannot cover every future event. An old Resolved or No response thread can reopen during the absence, while a quiet waiting conversation can become Open because a reminder is due or a relevant owner result arrives. D3 governs those work changes; D6 cannot treat them as new intake.

## The next question

**When staff explicitly start coverage for a planned absence, which of their existing conversations should move into team handling, and when?**

| Option                                                                                    | What happens                                                                                                                                                                                                                                                                                                                                                                                                                                        | Strongest benefit                                                                                                                                                                            | Cost and limitation                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Reviewed handoff, with manual coverage of later activity**                          | Staff or an authorized colleague reviews unfinished work and deliberately transfers selected conversations. The named inbox coverage team monitors anything retained or newly reopened during the absence and manually takes it when needed.                                                                                                                                                                                                        | Maximum deliberate control and the smallest automation model; supports context-heavy handoffs to a chosen colleague.                                                                         | Preparation and ongoing monitoring remain human work. A one-time Open-only batch is insufficient; late replies, both waiting sides and due follow-ups can be missed if the team watches only Unassigned.                         |
| **B — Transfer Open work; cover other conversations when they become Open — recommended** | A separately declared coverage period brings currently Open work into the responsible inbox's shared Unassigned handling. Both quiet Waiting categories keep their current assignee until D3 makes them Open. During coverage, relevant later replies, due reminders or owner/recovery events—including an older Resolved conversation reopening or fresh review work on an already-Open conversation—bring covered work to that same shared queue. | Less unnecessary movement than transferring every wait, while reducing reliance on someone repeatedly searching the absent person's queue. Handles both current work and later developments. | Requires a narrow reliable coverage lifecycle and distinct assignment cause. The shared team must still take responsibility; reaching Unassigned is not a promise that someone has answered.                                     |
| **C — Transfer all unfinished work at the start, with coverage for later reopenings**     | At coverage start, move Open plus both Waiting categories to the responsible inbox's shared handling. Preserve their actual statuses and reminders. Later relevant reopenings during coverage receive the same fallback.                                                                                                                                                                                                                            | The covering team owns the full unfinished portfolio immediately, including quiet dependencies; easiest to understand as a complete handover.                                                | Moves conversations that may never need action during the absence and increases shared handoff volume. Waiting work must remain clearly distinguishable from Open; old resolved threads still need the later-activity safeguard. |

These are alternative default coverage approaches, not three new systems to build. Ordinary explicit assignment to a qualified colleague remains available in every option. A separately named temporary backup is a possible handoff destination, but introducing two concurrent ownership roles is not necessary to choose the transfer timing here.

## Single best recommendation: B

Choose **B**. It best matches the desired low-friction experience while covering the actual D3 lifecycle rather than only new email. Staff deliberately activate coverage; Asym brings Open work into the shared team's existing workflow and brings quiet work over if it becomes Open while coverage is active. A later response to an old resolved thread must be included.

The strongest competing choice is C when the tenant wants the whole unfinished portfolio under team handling immediately. A remains a valid simpler alternative if named staff reliably monitor later activity; it should not be portrayed as automatic protection or recommended merely because the current code lacks an absence worker.

“Open” uses the ratified D3 meaning, including Open with a future deferral. Its exact reminder remains intact and visible: transfer does not mean the work suddenly became urgent. Quiet Waiting work is not described as no responsibility. Known promises, dependencies and follow-ups remain reviewable at activation, and staff may deliberately hand off a waiting conversation earlier when needed.

## Why the evidence supports this comparison

Front's documented out-of-office behavior separates new-reply unassignment from existing work that receives no reply; the latter may need proactive handoff. [Front out-of-office handling](https://help.front.com/en/articles/2197).

Intercom has separately documented automatic coverage for conversations that unsnooze while a teammate is away, illustrating why reply-only coverage misses reminders. [Intercom release note](https://www.intercom.com/changes/en/136162-unsnoozed-conversations-always-reach-an-available-teammate).

Help Scout offers an optional away-based unassignment of Active/Pending conversations, a concrete broader-sweep alternative relevant to C. [Help Scout reassignment preferences](https://docs.helpscout.com/article/499-manage-your-user-profile).

These patterns support the need and distinguish its mechanisms; they do not override Core's statuses, authorization, move rules or source-of-truth boundaries. Current editions, exact trigger limits, user feedback, competing recommendations and source/test evidence are in the [Q7 evidence record](phase26-q7-evidence.md). No study proves one policy is optimal for all ministries. Maria/Sarah/Daniel are illustrative task fixtures.

## What this would feel like

For B, use a clearly labelled **Set up coverage** action in the existing Support context. Its review shows current Open work, both kinds of waiting, follow-ups and the named inbox coverage—not a new holiday-management dashboard. It explains the proposed effect in ordinary language:

> Open conversations will go to your team's Unassigned queue. While coverage is active, replies and follow-ups that make your other conversations Open will go there too. Waiting conversations keep their status and reminders.

Show a quiet, persistent coverage indicator to authorized staff. The receiving toggle remains separately labelled. A colleague claims a shared item with the normal assignment action and keeps that work; Maria's return does not silently take it back. Donors continue the same email conversation without a portal step, repeated explanation, forced new ticket or automatic out-of-office message from this action.

Exact coverage start/end behavior, changed plans, late events and manual exceptions need the chosen answer's full adversarial review. This sketch is the recommendation's intended interaction, not an accepted D7 design or a claim that a coverage screen exists.

## Guardrails retained by every option

1. **One current assignment:** a transfer changes the actual Support assignment with history, not an undocumented original-owner/backup pair. People act as themselves under current rights. A team can have shared responsibility with no individual assignee.
2. **No initial-intake replay:** absence coverage is a distinct, explicitly authorized later-assignment cause. It cannot mint a fresh D6 initial source or silently invoke round-robin because a previously owned conversation is now Unassigned. Its default destination is responsible-inbox shared handling; deliberate direct handoff remains possible.
3. **Current control wins:** conditional commands protect a colleague's current claim/assignment, moves, endings and permission changes from stale coverage workers. Returning from absence never restores an old owner snapshot automatically.
4. **Work truth survives:** transferring preserves current D3 status and any valid reminder. When a separate D3 event creates Open review work, that work event—not the assignment—supplies the work change. Coverage cannot depend solely on a status-string change; an already-Open conversation can receive fresh relevant work. D5 history and owner-domain business outcomes remain unchanged.
5. **No new rights:** CRM linking, team/pool membership and coverage do not transfer financial, document, representative or care authority. Restricted work remains on a permitted surface; no arbitrary default person or broadened access repairs missing coverage.
6. **No correspondence side effect:** internal handoff notes remain non-deliverable; someone else's private draft is not silently reassigned or sent. D2 audience and D4 Send/Email Studio/Resend contracts are preserved. This choice adds no donor notice or implicit staff subscription.
7. **Visible incomplete coverage:** a one-person team, unavailable authorized cover, paused automation or failed transition must not produce a false “covered” success. Retain safe discovery and a permitted manual path; detailed failure/Pause interaction is a required review case if automation is chosen.
8. **Bounded scope:** planned temporary absence is not permanent account deactivation, permission revocation, a rotating shift schedule, automatic PTO import or a service-level promise. Authorization revocation never waits for convenient Support cleanup.

## Pressure cases for the selected answer's review

| Case                                                              | What must be resolved/proved                                                                                                      |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Resolved thread gets a relevant reply after the pre-leave review  | It becomes discoverable actionable work; old-thread identity does not bypass coverage.                                            |
| Waiting on our side has a due reminder, without a requester email | Review/coverage includes D3's due event, not merely inbound-message triggers.                                                     |
| Open work is deferred until later                                 | Transfer preserves the reminder and truthful urgency; no forced Open/Waiting rewrite.                                             |
| Daniel takes the request while a coverage worker is running       | One valid current owner survives; no duplicate or stale unassignment.                                                             |
| A person is deliberately manually assigned during coverage        | Define visible intent/exception and subsequent-event treatment; do not oscillate ownership or silently ignore explicit handoff.   |
| Coverage ends while a delayed event or retry is in flight         | No old absence snapshot may unassign current work after it loses authority; durable causality/current control need precise proof. |
| Inbox automatic assignment is paused                              | Honor the ratified pause meaning, preserve safe coverage discovery and avoid claiming a blocked automatic handoff completed.      |
| No authorized colleague can cover                                 | Clear coverage gap, retained custody and no permission/fallback-person shortcut.                                                  |
| A reviewed batch partly succeeds                                  | Per-item outcomes and safe retry; do not take back work that has since changed.                                                   |

The founder has selected B. The complete D7 review, journey/evidence, ADR0007 and glossary record all resulting amendments as fully ratified. Historical options are preserved; proceed to the next unresolved researched question.
