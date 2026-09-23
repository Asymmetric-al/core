# Phase 26 D11 — A clear internal-help journey

11 September 2026. **D11 and its complete UX/amendment package are fully founder-ratified, 11 September 2026.** The [complete review](phase26-d11-adversarial-review.md) is the behavioral contract. D1–D10 remain ratified. These layouts and words are a reviewable design blueprint, not a implemented or usability-tested screen.

## What a staff member should understand

**The conversation stays with its current handler or shared inbox. The other person does the internal work. Support reviews the result and chooses what to tell the requester.**

Example only: Maya asks about a receipt. Alex already handles the conversation. Finance checks the authoritative issuance record. Alex sees the useful result, reviews it, and responds through the existing email composer. Maya continues ordinary email; she gets no new ticket, login requirement or internal-task notification.

| What staff want                                             | Use                                         | Effect                                                                      |
| ----------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| A quick answer from someone allowed to see the conversation | **Internal note** and optional **@mention** | Consultation, without creating a task or changing handling.                 |
| Another person/team to perform a bounded tracked action     | **Ask for help…**                           | Reuse exact existing work, or create one shared task and follow its result. |
| The specialist to handle the whole requester exchange       | Existing **Assigned to** control            | Explicitly transfer current Support responsibility to an eligible handler.  |
| To perform an action they already have permission to do     | Its existing owning surface/action          | No compulsory task or relay.                                                |

No extra composer tabs, task-type configuration screen or new Support ownership role is needed. The main reply composer remains visually dominant.

## 1. Find the action without adding a toolbar

Use a secondary **Ask for help…** action in the conversation's existing context area. Once there is work, it sits beside the compact **Internal work** section heading. Mobile uses the existing context disclosure and a full-height sheet. The label is visible text, not an unexplained branching-arrow icon or hover-only action.

The current assignment display remains in its normal position. Do not add a second Coordinator field. Opening this flow does not claim a Shared conversation, change status, mark a result reviewed or copy a draft.

## 2. Reuse work when it exists; create only what is missing

The contextual panel is titled **Ask for help**. One line explains the default: **“Track an internal action while this inbox keeps the conversation.”** If Alex is assigned, use **“Alex keeps the conversation.”** Resolve the current qualified display; never retain a departed creator's name.

Show currently relevant permitted work first, when available:

```text
Ask for help                                     Close
Alex keeps the conversation.

Existing work
Verify receipt issuance · Finance · In progress
View work                     Use this work

Create a new task
What needs doing?     [Check which receipt is current]
Assign to             [Finance team                   ▾]
Details               [Optional useful brief           ]

Context to share      Receipt reference · 1 permitted item
                      Review shared context
Add due date

Conversation          Open · unchanged

Internal work. No email will be sent to the requester.
Cancel                                      Create task
```

This is a content hierarchy, not a pixel or component prescription. The real implementation uses existing Asym tokens and shared controls. Long or absent names, additional work and restricted context must not break the layout.

**View work** only navigates. **Use this work** explicitly connects the current need to that exact owner item and does not change its destination, status, date or business target. Already-followed exact work is shown as present. Do not require a search step when no candidate exists, show hidden candidate names/counts, or suggest a match solely because two tasks mention the same donor/gift. A small optional existing-work search uses current owner permissions before results.

A completed owner item may already contain the answer. Using it opens its current result for review, without reopening it or presenting it as newly assigned work. A genuinely different internal action gets new qualified work.

## 3. Keep the ordinary request short

| Control               | Behavior                                                                                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **What needs doing?** | Required concise action title authored by staff. No automatic transcript or full subject copy.                                                                                                    |
| **Assign to**         | Qualified accountable task team/queue, with an optional eligible person. Current task scope and brief permissions govern the choices. No self/Finance default inferred from the initiating actor. |
| **Details**           | Optional if title and authorized references suffice; a specific owner-required fact gets a precise inline explanation.                                                                            |
| **Context to share**  | Shows exactly the permitted references/selected content included, with review on demand. No full-transcript access checkbox.                                                                      |
| **Add due date**      | Optional under the task owner, displayed as **Task due**. Existing owner-required deadlines remain visible. It is not Support's reminder or an SLA promise.                                       |
| **Conversation**      | Compact current state/reminder summary, unchanged by default. Staff can explicitly choose the existing valid D3 Waiting plan if this is the blocker. No new universal after-create split button.  |

One **Create task** or **Use this work** commit suffices for ordinary admission. No generic second confirmation. A stale source, changed destination or incompatible new Support obligation gets a specific inline correction rather than an unexplained failure or silent retargeting. Creating new owed work from Resolved requires an explicit valid current work plan.

The confirmation result is modest: **“Task created · Finance team.”** The durable card remains after the toast disappears. Assignment does not mean Finance accepted or started work. Optional staff notification behavior remains under its shared plan; “No email to the requester” does not mean no staff notification can occur.

## 4. Make the specialist's side usable and private

The specialist opens the actual shared task/owner surface, sees its action title, authorized brief, permitted references and accountable queue/person, and uses that owner's work controls. There is no second Support task editor.

A specialist without Support access must still receive a sufficient authorized brief. A permission-denied transcript link is not a usable handoff. If a safe brief cannot be released to the chosen destination, the original worker sees a safe, actionable explanation before creation. New destination or expanded context is requalified; a changed assignee cannot expose old private content.

References open only records the specialist may currently inspect. A neutral “Support request” origin may be shown only if that fact is authorized; disabled links must not leak hidden requester, subject, name, count or attachment metadata. Source/task field restrictions apply independently.

For more information, the specialist uses an internal update such as **Needs input** and a specific question. Support gets the question, not the entire task comment history. Free-text result/brief authoring still requires disclosure authority; the design does not pretend software can determine the sensitivity of arbitrary prose perfectly.

## 5. One compact card, one understandable next step

```text
Internal work                                  Ask for help…

Check which receipt is current
Finance · Sam                                  Result ready
Receipt checked. Current issuance confirmed.
Review result                                     View work
```

The illustrated result is a safe owner-qualified summary, not invented live financial evidence. In the real flow, the source's exact result/revision supplies it.

| Situation                       | Display/action                                          | Meaning                                                        |
| ------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------- |
| Commit response lost            | **Checking request…**                                   | Reconcile the original occurrence; do not create another task. |
| Work exists                     | **Assigned to Finance**, then actual owner progress     | A real task exists; not a guarantee of human acceptance.       |
| Specialist asks a question      | **Needs your input · Review request**                   | Current Support owes an action; no donor task is created.      |
| Work blocked/rejected/withdrawn | **Work stopped · Review** or precise safe condition     | No success implied; Support chooses a valid next plan.         |
| Useful result returned          | **Result ready · Review result**                        | Exact current outcome awaits Support review.                   |
| Result reviewed                 | Quiet owner state/history                               | No automatic requester reply or Support resolution.            |
| Current source unavailable      | **Update unavailable · View recovery** where authorized | Never replace unknown with Completed or Unassigned.            |

Routine progress updates should not pulse, produce repeated toasts or steal focus. Keep actionable cards easy to see, group the same real work once while conversations are merged, and paginate long lists. History can collapse; the interface must clearly signal any remaining actionable items. Do not insert every task event into the email transcript or donor Activity.

## 6. Review the result without introducing an approval ritual

**Review result** opens the safe owner result and permitted evidence in context. The normal action **Mark reviewed** acknowledges this exact result and finishes a satisfied Support need. It is not financial approval, provider confirmation, task completion or read receipt. Staff may instead ask for more or set the appropriate existing D3 work plan. If a new result arrives during review, preserve any typed response and show what changed before admission.

After review, Alex uses the normal composer if Maya needs a reply. **Send reply** preserves status under D4; explicit Resolve remains separate and only available for a legitimately completed Support obligation. A relevant new adverse correction reappears for review even if the previous result had been reviewed. Routine historical task edits do not reopen the conversation.

When Alex is away or replaced, the current handler/shared inbox receives the result review under D7/D8. The system does not email the frozen task creator as the only path. Avoid genuinely duplicate self-alerts, but do not suppress a fresh result just because the same person owns both work items: an overnight owner update may still require their attention. The queue review item and actual recipient-specific notification remain separate.

## 7. Stop following the work without canceling someone else's action

Use the card's secondary menu **Stop following this work…**, outside the dominant happy path. Show a short reason and scope: **“This conversation will stop waiting for this work. The task will remain with Finance.”** If another current conversation relies on it, mention that only when the caller can see that fact; otherwise use an owner-approved generic scope warning.

The panel shows the resulting conversation plan as well: **“The conversation stays Open; the task continues.”** Preserve a Waiting plan only if its actual blockers remain. Stopping the last awaited input requires a valid explicit next plan under D3, usually Open for the next Support step; this action never silently resolves the conversation or changes its reminder. Its explicit D3 option applies the normal reminder rules.

Only where the shared task owner permits it, offer an unselected **Also dismiss this task** choice, with the exact effect explained. No such generic control cancels a refund, reverses a receipt or affects private work the user cannot administer. If an owner operation has its own cancellation process, open that existing process with context intact. A pending cancellation is never shown as already canceled.

The historical reference and allowed audit remain. A mistaken end is corrected by a new deliberate current follow-up generation, not by replaying the old request. This correction does not recreate the task.

## 8. Merge, Undo and CRM stay coherent

For help concerning a merged request, display that it serves the current combined conversation; the admitted source scope is fixed to the reviewed members. A source-specific request stays specific. Later merges do not secretly broaden task work or visibility.

Undo may show the same task on both resulting conversations because both still depend on the same real action. That is one shared work item, not duplicates. The Undo preview explains the current follow-up scopes under D10; no new task or owner operation is created.

CRM keeps its ratified **Support conversations** projection and permitted navigation. It may show a quiet **Internal result to review** indicator where authorized. The donor's Activity does not gain a fake call/email/interaction when staff create or complete a task. Opening the actual task or Support conversation preserves the record's location, filters and return path without sharing hidden financial fields.

## Visual and accessibility acceptance

Use the actual Asym shell, base-maia shared components and existing spacing/type tokens. Emphasize the request title, responsible team/person and next action; keep provenance and history secondary. Use restrained borders and surface contrast, with color plus words rather than rainbow status pills. A motion effect may explain a panel transition; it must honor reduced-motion and never animate routine task updates for attention.

Use semantic forms, labelled comboboxes/buttons, logical keyboard order, visible focus, validation beside the field and a status region for asynchronous success/failure. Preserve focus on background updates. Verify reflow at 400% zoom, mobile touch controls, screen-reader output, localized time zones, long international names and low bandwidth. Do not persist sensitive drafts in broad browser storage as an improvised offline feature.

Fence keyboard submission by the active interaction: selecting a person/team is not submission, and Enter in multiline Details adds a line. Public-reply Send shortcuts cannot run behind the help panel. Escape closes the innermost control first. Dismissing before admission commits nothing; dismissing after admission is not cancellation, and the task/result remains discoverable. Preserve or reconcile the same qualified draft/request when reopened.

Before activation, representative staff must complete six moderated scenarios without being told which control to choose: quick consultation; reuse existing work; ask for new work while retaining the conversation; specialist without transcript access; review a returned result and reply deliberately; end one of two conversations' follow-ups without canceling shared work. Record task success, mistaken transfers/disclosures/closure, lost context, time and comprehension. Any unsafe misunderstanding blocks release; observed avoidable steps require iteration. This is a proposed release study, not a claim that these screens have already been validated with ministries.

## Evidence used and proof boundary

The [evidence record](phase26-d11-evidence.md) documents primary support/CRM/nonprofit patterns, dated feedback and their limits. The design adopts contextual work, clear ownership and visible feedback while rejecting forced contact creation, cascading closure and unrestricted note propagation. No competitor marketing or polished existing Core mock establishes usability or authorization proof. D11-P35–P39 require actual accessibility, moderated and end-to-end validation.
