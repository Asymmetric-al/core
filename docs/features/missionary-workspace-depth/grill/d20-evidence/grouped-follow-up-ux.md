# D20 evidence — grouped special-gift follow-up UX

Research date: **October 16, 2026 UTC**. Research and recommendations only.
The founder selected one current follow-up that clearly lists qualifying special
gifts and can handle the reviewed group once, preserving each gift's record.
The recommendations below support that choice; they are not a new financial
qualification rule, accepted specification, implementation or usability result.
No authenticated vendor product, real donor, live provider operation or user
interview was used. No dependencies or application code changed.

## Conclusion and owner boundaries

Use the existing independent task journey with a clearly bounded gift list.
Let Maya finish follow-up for the exact gifts disclosed and deliberately included
in her action. A third gift arriving while she handles two must remain outstanding.
An unchanged reviewed set should not become impossible to finish merely because
another eligible gift arrived. A material change to a reviewed gift, the relevant
authority or the responsibility requires current review instead.

This is a product recommendation for the concurrent case, not permission to remove
expected-head checks. The task/source owners must qualify a narrow reconciliation
that checks current state, preserves each gift's outcome, and returns an honest
receipt. If that cannot be proved, explicitly reject and refresh the stale action;
never silently include the third gift or manufacture success.

Local authority read for this note:

- [Q20 frontier](../phase28-q20-special-gift-follow-up-grouping-research.md)
  separates grouping from special-gift criteria. Its awaiting-answer status
  records earlier provenance; the current founder instruction selects A.
- [Ratified D19 review](../phase28-d19-first-support-follow-up-adversarial-review.md),
  especially C07, C11–C15 and C19: independent human completion, distinct Not
  needed, optional actual interaction, preserved human history, current access
  and conditional correction. First-support purpose remains distinct.
- [ADR-0183](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md),
  lines 622–650: an independent follow-up can truthfully finish without closing
  its source. Product uniqueness, expected-head checks, current claims and
  semantic receipts own race safety. No second source-review ledger is needed.
- [MPD-01 catalog](../../../../prds/workflow-studio/07-core-workflow-catalog.md),
  around line 2667: grouping is a genuine policy choice; a later optional recipe
  does not supply the initial native producer, special-gift criterion or deadline.
- [Workflow OpenSpec](../../../../../openspec/specs/workflow-orchestration/spec.md)
  keeps source truth and permissions outside the workflow executor. The inspected
  missionary-related active change concerns partner-roster safety; its presence
  does not establish this grouped producer or coverage behavior.
- [Frontend rules](../../../../ai/rules/frontend.md),
  [shared UI contract](../../../../../packages/ui/AGENTS.md) and
  [accessibility skill](../../../../ai/skills/accessibility-review/SKILL.md): reuse
  `base-maia`, shared Base UI primitives and semantic tokens. Configuration was
  inspected; this research does not introduce or qualify a new widget.

No threshold, historical-pattern detector, grouping time window, automatic donor
message, mandatory report, new retention period or coaching visibility is selected
by this note. Each gift still needs its source owner's qualification. Same person
alone is insufficient: tenant, ministry, purpose, responsibility, recognition and
current permission boundaries must be compatible. Neither anonymous identity nor
restricted gift existence becomes visible through a group count.

## Primary evidence and its limits

All sources below were read on **2026-10-16**. “Fresh” means freshly opened public
documentation, not freshly tested product behavior. Dates in the source-date
column are visible publication/update dates when available. Undated pages cannot
establish when a feature shipped. D19 sources explicitly marked reused were read
earlier the same day; their facts are not presented as new independent tests.

| ID / primary source                                                                                                                                | Source date and evidence class                                                   | Documented behavior relevant here                                                                                                                                                                                 | Limit / useful implication                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| E01 [HubSpot: Bulk edit records](https://knowledge.hubspot.com/records/bulk-edit-records)                                                          | Updated September 18, 2026; fresh official procedure                             | Select current-page records, then a separate “Select all [number] [records]” can include all records in a view. The documented Create tasks action nevertheless operates on selected records on the current page. | Concrete evidence that action scope can differ from apparent selection scope. Do not copy this ambiguity. No snapshot, concurrent membership or Asym coverage guarantee is established.                                                                      |
| E02 [Shopify: Bulk actions](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/bulk-actions)                                      | Undated; fresh official procedure                                                | Individual, range, page and all-result selection are distinct. Mobile selection uses checkboxes; some operations remain desktop-only and mobile selection has a documented limit.                                 | Supports explicit selection scope and a usable small-screen path. Do not import vendor item limits, desktop restrictions or a claim that “all results” is transactionally frozen.                                                                            |
| E03 [Zendesk: Managing tickets in bulk](https://support.zendesk.com/hc/en-us/articles/4408886890906-Managing-tickets-in-bulk)                      | Undated; fresh official procedure                                                | Selection can persist across pages. Bulk action captures each selected ticket's last-updated timestamp, compares it with current stored state, skips changed tickets with an error and continues other tickets.   | Strong documented per-item concurrency comparator. Its best-effort partial mutation is not automatically right for one reviewed follow-up. It does not establish exactly-once effects or solve newly matching membership.                                    |
| E04 [Zendesk: What's new, February 2026](https://support.zendesk.com/hc/en-us/articles/10231895896090-What-s-new-in-Zendesk-February-2026)         | Release summary for February 2026; fresh official announcement                   | Describes the bulk-action protection for changed tickets.                                                                                                                                                         | Corroborates the documented feature; not authenticated deployment or race-test evidence.                                                                                                                                                                     |
| E05 [WordPress: Pages screen](https://wordpress.org/documentation/article/pages-screen/)                                                           | Published November 4, 2018; updated June 8, 2024; fresh dated official procedure | Users select pages, choose a bulk action and Apply. Bulk editing exposes selected work and a Cancel path. Pagination and filtering are separate controls.                                                         | Familiar selected-scope review pattern. It proves neither cross-page selection semantics nor concurrency safety; a separate wizard is not required for Core.                                                                                                 |
| E06 [Virtuous: Acknowledge passthrough gifts](https://support.virtuous.org/hc/en-us/articles/4430322302093-How-Do-I-Acknowledge-Passthrough-Gifts) | Updated June 8, 2026; freshly reopened official procedure                        | Ordered groups assign gifts to the first matching group. Processing uses gift **create-date** bounds. Users inspect counts/preview, then Discard or Run; Run sends email or generates PDFs.                       | Supports inspectable membership before a deliberate effect. This is an acknowledgment distribution workflow, not an independent task; do not import sending, group wizard or create-date semantics. It does not prove a transactionally frozen reviewed set. |
| E07 [Virtuous: Complete a task](https://support.virtuous.org/hc/en-us/articles/360060363551-How-Do-I-Complete-a-Task)                              | Updated July 2, 2025; D19 same-day official procedure reused                     | Tasks can be completed with a checkbox; creating a contact note can be optional.                                                                                                                                  | Supports low-friction task completion. Does not prove grouped gift coverage; do not make dragging the only way to undo.                                                                                                                                      |
| E08 [Bloomerang: Individual and bulk tasks](https://help.bloomerang.com/en/articles/12632531-create-and-manage-individual-and-bulk-tasks)          | Visible September 3, 2026 date at D19 read; same-day official procedure reused   | Complete, Save as Interaction and Archive are distinct operations. Bulk creation can create tasks for constituent records.                                                                                        | Useful separation of human task disposition from recorded interaction. Bulk per-record tasks are not evidence for one task covering several gifts. Do not import recovery that deletes interaction history.                                                  |
| E09 [MPDX: Notifications](https://help.mpdx.org/article/1199-notifications)                                                                        | Updated September 26, 2022; D19 same-day dated official procedure reused         | Special gifts and gifts above commitment can generate task events.                                                                                                                                                | Establishes the relevant stewardship job, not the criteria or grouping of all outstanding gifts. Optional vendor settings do not override Core's required native work.                                                                                       |
| E10 [TntConnect: Automatic task updates](https://www.tntware.com/tntconnect/help/en/pages/video_autoactionsupdatetasks.aspx)                       | Undated legacy manual page; D19 same-day text reused                             | Describes updating existing automatic tasks rather than duplicating them.                                                                                                                                         | The embedded video was not watched. This is not proof of exact reviewed-gift membership, residual work or race-safe group completion.                                                                                                                        |
| E11 [MPDX: Mobile contact logging](https://help.mpdx.org/article/517-automatically-logging-tasks-when-contacting-partners)                         | Updated December 8, 2021; D19 same-day dated official procedure reused           | After a contact attempt, the user can choose an actual outcome, accept or cancel recording, with further information optional.                                                                                    | Useful evidence for deliberate factual logging. Does not justify forcing an outcome form whenever Core Mark done is used or treating a telephone handoff as a completed call.                                                                                |

[DonorElf's historical News Feed Events URL](https://donorelf.helpscoutdocs.com/article/34-news-feed-events)
returned 404 in the same-day D19 research. Indexed historical distinctions are
not current grouping evidence. No new DonorElf grouping claim is made. The
[D19 research note](../d19-evidence/stewardship-ux-research.md) preserves fuller
provenance and task-versus-interaction comparisons.

Accessibility sources freshly read for D20 include W3C
[checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/),
[Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html),
[Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)
and [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).
The same-day D19 reading also covers
[Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html),
[Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html),
[Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html),
[Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
and [Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html).
These are primary standards explanations/guidance, not observed Core conformance.
The APG pattern is guidance, not a requirement to hand-build an ARIA widget.
WCAG 2.2 AA target-size guidance is 24 CSS pixels with exceptions; a larger Core
touch target is a local quality choice, not a claim that WCAG AA mandates 44 pixels.

## Minimal complete journey and suggested copy

This is one ordinary task detail surface within the existing task experience.
The two-gift case needs no selection wizard, per-row required confirmation, note
field or separate gift-management application. Specific wording is recommended,
not a new founder decision about button microcopy.

| Step / state                         | Recommended presentation and action                                                                                                                                           | Truth preserved                                                                                                                     |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Find current work                    | **Follow up with Grace**. Reason: **2 qualifying special gifts to [Ministry]**. Show ordinary due information without guilt, donor ranking or an invented deadline.           | A source-qualified purpose, not an inference from amount or a claim that nobody has contacted Grace.                                |
| Understand scope                     | List both gifts with their permitted source date, currency/amount basis and a distinguishable permitted reference where needed. Show **This follow-up covers these 2 gifts.** | Do not sum currencies, display a whole-gift amount as this ministry's allocation, or expose hidden records through count/reference. |
| Act                                  | Show the same currently permitted contact actions/context as D19. Optional **Remind me later** uses existing scheduling.                                                      | Opening phone/email does not prove a call/send. No contact permission is granted by a task.                                         |
| Finish ordinary group                | **Finish follow-up for 2 gifts**. Existing **Mark done** can be retained if **For these 2 gifts** is equally clear at action time. No mandatory note or outcome form.         | Personal deliverable completed for exact included gifts; financial state, receipt and actual interaction remain separate.           |
| Handle only part                     | Optional **Choose gifts** reveals ordinary checkboxes. Included count and action label update, for example **Finish follow-up for 1 gift**.                                   | Unselected gifts remain outstanding. No requirement to split every normal group manually.                                           |
| No action required                   | **Not needed** applies to the same clearly disclosed set. Optional reason only.                                                                                               | Distinct from done, cancellation of giving or deletion. No fabricated thank-you.                                                    |
| Record actual contact                | Optional **Record interaction**, showing the actual audience before saving through P9.                                                                                        | Can record what actually occurred; not required to complete the independent task. No forced coaching report.                        |
| All disclosed work handled           | **Follow-up marked done for 2 gifts.** Ordinary task history preserves exact covered gifts and disposition; conditional **Undo** is also discoverable there.                  | No “2 thank-yous sent,” “donor thanked,” or new communication claim.                                                                |
| Third gift arrives before acceptance | Keep the reviewed two stable. Show **A new gift is available to review** when known and authorized. Completing the unchanged pair leaves the new gift outstanding.            | A new arrival is not silently included, even if the list refreshes. No automatic scope expansion.                                   |
| Two handled; one remains             | **Follow-up marked done for 2 gifts. 1 new gift remains.** Keep the current task active with the residual gift and a clear **Review remaining gift** path.                    | This is not “Task completed” for the changing whole. Only say “new” when arrival provenance is known; otherwise **1 gift remains**. |
| Selected evidence changed            | **These gifts have changed. Review the updated details before finishing.** Provide the authorized changed detail or a neutral access message. Preserve safe unsaved input.    | Do not continue with a silently narrowed subset or disclose a removed restricted record.                                            |
| Outcome unknown                      | **We couldn't confirm whether the follow-up was saved. Check status.** Resolve the original action before presenting a new completion attempt.                                | A timeout is neither failure nor success. No duplicate history or implied send retry.                                               |
| Empty current view                   | **No follow-ups in this view.** Retain filter context and available history.                                                                                                  | Not “Everyone thanked,” “No gifts,” or an assertion that unknown source history is complete.                                        |

Do not render every exception on the ordinary screen. Show the short count and
gift rows first; expose partial selection, history and recovery where relevant.
The word “reviewed” means deliberately accepted disclosed scope, not proof of
reading every pixel. No scroll tracking, required click on each row, dwell timer
or forced acknowledgment checkbox is justified by this evidence.

### Two reviewed gifts, then a third arrival

1. Maya opens the current task with gifts A and B. Their exact identities and
   relevant evidence revisions define the displayed action scope.
2. Gift C qualifies while she is acting. C can join the currently active task's
   outstanding work, but it does not join her already disclosed A/B action.
3. At acceptance, the server checks current authority, responsibility, source
   qualification and coverage for A/B. A qualified reconciliation may accept the
   unchanged A/B set despite a membership change caused solely by C.
4. A/B retain individual coverage/history; C remains outstanding in the same
   current task. The returned receipt states what happened, and the task remains
   active. The visible current count must be based on a qualified current view;
   it is not a promise that no fourth gift can arrive after that read.
5. If the task was terminally handled before a later gift qualified, do not
   reopen or rewrite that completed task to absorb the future gift. Later
   qualifying work uses the owning lifecycle while preserving prior coverage.
   This note does not invent a generic successor engine or financial episode.

If the action actually involved sending one message, its own communication
receipt remains separate. A selected gift changing after that send must never
prompt an automatic resend. The user may need current review for task coverage,
but the real interaction is retained honestly under its existing owner.

## Strong alternatives and why the recommendation is proportionate

| Alternative                                                        | Strength                                                                                                 | Cost / recommendation                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reject on any changed whole-task head                              | Simple conservative contract; avoids accidentally accepting stale task state.                            | Even a harmless new arrival can block finishing the unchanged pair. Refresh can invite repeating contact that already happened. Keep this safe fallback when narrow reconciliation is unqualified, but prefer exact reviewed-set acceptance with current checks. |
| Accept exact reviewed set and retain residual work                 | Aligns one deliberate action with the gifts Maya actually included; preserves useful current work.       | Requires owner-qualified per-gift evidence/coverage and honest receipt. This is the recommended permanent product behavior, not a claim that current source already supports it.                                                                                 |
| Best-effort completion of whichever selected items remain eligible | Zendesk demonstrates per-item validation and explicit skips. Can help very large administrative batches. | Surprising for a small relationship follow-up. Recommend all-or-review for material changes within the selected set unless a later explicit contract provides intelligible per-item outcomes. Do not report generic success after partial mutation.              |
| One task for every gift                                            | Clear individual visibility and disposition.                                                             | Founder chose grouped work. Preserve per-gift evidence without recreating B through mandatory row-by-row completion. No measured time saving is claimed.                                                                                                         |
| Live “all matching gifts” at commit                                | Short UI and minimal explicit selection state.                                                           | Silently includes unreviewed arrivals. Reject even if visually elegant or technically easy.                                                                                                                                                                      |

“All-or-review” does not mean retrying a completed command. Repeating the same
accepted command retrieves its original receipt. A competing actor's different
action, a source revision or a responsibility change must be reconciled before
accepting stale selected work; do not turn it into a second history event. Exact
technical outcomes remain with the task/source owners, not a new UX-owned ledger.

## Pagination, phones and weak connections

For ordinary groups, show a short readable list. If paging is necessary, clearly
distinguish **shown**, **included** and **remaining** counts. Page navigation must
not change the action's included set invisibly. A deliberate “all” action must
identify a finite disclosed scope; it cannot mean whatever matches when the
server later executes. Do not make a loaded viewport the hidden definition of
“all,” as E01's action-specific behavior illustrates. Keep filters visible and
retain inclusion state across pages or explicitly explain a reset before it
occurs. A cap, if needed, must be separately justified by product/performance
evidence; Shopify/Zendesk vendor limits are not Core limits.

Prefer one explicit whole-group scope when the existing owner read can safely
provide it: **Showing 1–20 of 42 included gifts**, with **Finish follow-up for all
42 gifts** and all included details inspectable through ordinary paging. This
avoids mandatory page-by-page completion. “Included” is more accurate than calling
every loaded item already “reviewed.” The action deliberately accepts that scope;
it does not attest that the user read every row. Keep the set's source-qualified
ordering stable, using a clearly identified date meaning and stable tie-breaker.
Later arrivals do not shift its pages or silently enter its count. A material
selected-source correction still requires review under GUX02.

If a justified resource boundary prevents that full scope, disclose the bounded
chunk before action, for example **These 20 of 42 gifts**, with **Finish follow-up
for these 20 gifts**. The remaining eligible gifts stay in the same current task.
The example numbers illustrate copy, not a selected limit. Reuse the existing
owner read and action contract; do not introduce a separate review-session engine
just to persist a UI page. Technical proof must establish the finite identity set
and relevant versions; a visual count alone is insufficient.

Reuse native semantics and shared Base UI controls. A simple list is sufficient
for the common mobile case; do not add a spreadsheet grid. Subset selection uses
properly named checkboxes, visible selected count, keyboard Space behavior and a
mixed parent state only where a group selector actually exists. Visible button
words must be included in accessible names for speech input. Relevant date,
currency and ministry context must survive narrow-screen reflow; horizontal
scrolling must not hide the action's scope. Do not convey changed/selected/done
solely through color.

Keep focused rows stable when new gifts arrive. Announce material count/result
changes without moving focus to each update; do not make a live region repeat the
whole list. When completion removes the last row, restore focus to a predictable
remaining item, task heading or return control. Sticky actions must not obscure
focus. Pointer/touch actions need visible controls, not hover-only affordances;
dragging cannot be the only correction method. A transient toast can offer Undo,
but history must retain a discoverable correction path while correction remains
valid. This does not guarantee permanent undo after a conflicting change.

On slow connections, keep known content distinct from loading or unavailable
current state. A skeleton or request failure is not zero gifts. Prevent repeated
local submits while resolving an admitted action, then recover its original
receipt. No offline replay promise is added. Preserve safe input only under the
current authorization/session rules; do not retain donor data in an unauthorized
offline store. Show human-readable localized dates with their actual meaning
(gift date versus task date); never silently reinterpret one as the other or let
the viewer's timezone redefine source gift chronology. D20 adds no date deadline.

## Material concerns: eight dimensions, proposed clauses and proofs

Severity and likelihood below are reasoned design assessments, not measured
incident rates. Each concern states the failure, why it matters, severity,
likelihood, evidence, effect on the founder's choice, permanent fix, and an exact
proposed clause. Proofs are required future checks, **not tests executed here**.

### G01 — New arrivals silently widen a completed group

1. **Failure:** A/B are shown, C arrives, and a live-query completion marks all
   three covered or reports the whole task completed despite C remaining.
2. **Importance:** Personal stewardship work becomes falsely complete and C can
   disappear without deliberate handling.
3. **Severity:** High.
4. **Likelihood:** Plausible with reactive lists and broad “complete all” APIs.
5. **Evidence:** E01–E03 show selection and mutation scope need explicit contracts;
   Q20 specifically identifies arrival during action. Vendors do not prove Core.
6. **Decision effect:** Preserve A; exact coverage is necessary for its meaning.
7. **Permanent fix:** Explicit included set, qualified current reconciliation and
   residual work in the still-current task; no hidden live expansion.
8. **Proposed clause GUX01:** “A grouped follow-up action SHALL cover only the
   exact disclosed gifts deliberately included in that action. Later arrivals
   SHALL remain outstanding. An accepted partial coverage result SHALL NOT claim
   that the whole current task is complete while eligible residual work remains.”

**Proof:** Hold A/B review, admit C, finish A/B. Verify A/B individual coverage,
C pending, one active current task, precise receipt and no donor-send assertion.
Reverse the ordering so terminal completion precedes C; preserve terminal history.

### G02 — Reviewed evidence or authority changes

1. **Failure:** A gift is corrected, returned, reattributed or restricted; an
   outdated action still completes it or the UI reveals its removed details.
2. **Importance:** The user acts on an invalid reason or gains unauthorized data.
3. **Severity:** Critical for disclosure; high for false work state.
4. **Likelihood:** Plausible during ordinary correction and reassignment.
5. **Evidence:** E03's timestamp check is a practical comparator; D19 C11–C15 and
   ADR-0183 supply stronger local source/authority obligations.
6. **Decision effect:** A survives; broadened grouping never weakens owner gates.
7. **Permanent fix:** Recheck relevant source versions, authority and ownership;
   distinguish harmless outside-set additions from inside-set material change.
8. **Proposed clause GUX02:** “Acceptance SHALL revalidate the included gifts and
   current action authority. A material selected-scope change SHALL require
   renewed authorized review; it SHALL NOT silently narrow or substitute the
   selected scope. Source invalidation SHALL preserve actual human history and
   independently accepted undertakings under D19.”

**Proof:** Race each selected gift's return, recognition correction, access loss,
reassignment and source invalidation against completion. No stale acceptance or
forbidden detail; separately accepted call/promise and real interaction survive.

### G03 — Paging and filters create a misleading “all”

1. **Failure:** The count describes all matches but only the first page changes,
   or an action includes unseen future matches after the user changes pages.
2. **Importance:** User intention and durable gift coverage disagree.
3. **Severity:** High.
4. **Likelihood:** Likely unless page/action scope is deliberately specified.
5. **Evidence:** E01 documents exactly this current-page versus all-records
   distinction; E02/E05 show multiple selection scopes.
6. **Decision effect:** Preserve A; ordinary two-gift work stays one action.
7. **Permanent fix:** Finite included set; visible included versus shown counts;
   stable inclusion across paging and explicit filter-reset behavior.
8. **Proposed clause GUX03:** “The visible action scope SHALL equal the committed
   gift scope across paging and filtering. ‘All’ SHALL identify a finite disclosed
   set, never an unbounded query evaluated later. Loading, hidden or restricted
   records SHALL NOT be implied to be included or absent.”

**Proof:** Use multiple pages, change filters, navigate back, add a matching gift,
and complete. Assert exact included IDs, count and receipt; compare phone/desktop.

### G04 — Partial or competing handling corrupts history

1. **Failure:** Two staff handle overlapping gifts, or one selected gift was
   already handled; the UI silently skips it and reports undifferentiated success.
2. **Importance:** Duplicate coverage and unclear residual work undermine trust.
3. **Severity:** High.
4. **Likelihood:** Plausible with shared responsibility or multiple devices.
5. **Evidence:** E03 explicitly permits partial skips; ADR-0183 and D19 demand
   durable current-state claims and semantic receipts. Vendor semantics differ.
6. **Decision effect:** Preserve A without reintroducing one compulsory task per
   gift or a new completion ledger.
7. **Permanent fix:** Optional deliberate subset; task-owner per-gift coverage;
   same-command receipt recovery; explicit reconciliation of competing outcomes.
8. **Proposed clause GUX04:** “Deliberate subset handling SHALL leave unselected
   gifts outstanding. Duplicate command delivery SHALL recover the original
   accepted result. Competing handling SHALL NOT create duplicate coverage or a
   fabricated interaction. Any partial outcome SHALL identify its exact permitted
   effects and remaining work; it SHALL NOT be summarized as whole-task success.”

**Proof:** Concurrent A/B and B/C actions, same-command replay, stale subset and
Not needed versus Done races. Verify one valid coverage history per accepted
effect and correct residual state; no unannounced best-effort result.

### G05 — Grouping hides financial distinctions or leaks private existence

1. **Failure:** Different ministries, purposes or currencies merge; header amount
   replaces authorized allocation; a hidden gift appears as a count increment.
2. **Importance:** Privacy and financial meaning are lost despite a clean card.
3. **Severity:** Critical for disclosure; high for misleading amounts.
4. **Likelihood:** Plausible when grouping is implemented by supporter identity.
5. **Evidence:** Q20/D19 ownership boundaries; E06's vendor-specific group/date
   rules illustrate that convenient grouping is not a universal financial rule.
6. **Decision effect:** Narrow only incompatible/unauthorized grouping, not A.
7. **Permanent fix:** Source-qualified compatibility and permitted projection for
   every row, reference, count, history, notification and contact action.
8. **Proposed clause GUX05:** “Grouping SHALL preserve tenant, ministry, purpose,
   responsibility, source recognition and current permission boundaries. Every
   displayed count, amount and reference SHALL be independently permitted.
   Cross-currency totals and hidden-record count leakage SHALL NOT be introduced.”

**Proof:** Split ministry allocation, church/member distinction, anonymous/hidden
gift, mixed currency, restricted history and access revocation. Check search,
counts and notifications as well as the visible detail rows.

### G06 — Group handling becomes forced logging or a false send claim

1. **Failure:** Mark done requires a contact-outcome form, writes “thanked,” or
   automatically sends/resends for every included gift; Undo deletes real history.
2. **Importance:** Violates D19's independent task contract and voluntary context.
3. **Severity:** High.
4. **Likelihood:** Likely if vendor task/history or acknowledgment flows are copied.
5. **Evidence:** E06 sends documents; E07/E08 separate optional note/interaction;
   E11 logs actual contact. D19 explicitly settles Core's distinction.
6. **Decision effect:** Preserve A and D19; no new logging burden.
7. **Permanent fix:** One scoped task disposition, optional P9 interaction with
   audience, separate sending, distinct Not needed and conditional correction.
8. **Proposed clause GUX06:** “Grouped Done and Not needed SHALL be personal task
   dispositions only. Neither SHALL require an interaction record or imply donor
   contact, delivery, receipt or financial correction. Optional interaction SHALL
   show its actual audience. Undo SHALL preserve original dispositions and real
   interactions and SHALL operate only under current valid correction conditions.”

**Proof:** Complete without note/contact channel; cancel phone handoff; unknown
email outcome; mark Not needed then correct it; verify no send, interaction,
financial mutation or forced report was generated by task handling.

### G07 — Dynamic mobile scope is inaccessible

1. **Failure:** New rows move focus, selected state is color-only, speech labels
   omit visible words, sticky controls hide focus or Undo exists only in a toast.
2. **Importance:** Users cannot reliably understand or operate the same scope.
3. **Severity:** High for affected users.
4. **Likelihood:** Plausible without manual dynamic-state testing.
5. **Evidence:** W3C sources above and Core's accessibility/shared UI requirements.
6. **Decision effect:** Preserve A; no alternate design system or mobile app needed.
7. **Permanent fix:** Stable reading/focus order, proper names/state, shared touch
   targets, concise status announcements and persistent valid recovery path.
8. **Proposed clause GUX07:** “Grouped review, subset choice, completion, residual
   work and correction SHALL remain understandable and operable by keyboard,
   screen reader, speech and touch at narrow widths. Material status changes SHALL
   be programmatically exposed without stealing focus. Essential state or valid
   recovery SHALL NOT depend solely on color, hover, dragging or transient toast.”

**Proof:** Keyboard and screen-reader review of A/B while C arrives; subset
selection; 320 CSS-pixel reflow; zoom; long names/currency labels; speech action;
focus after final-row removal; persistent Undo after toast disappears. Automated
checks supplement these tests and do not establish complete WCAG conformance.

### G08 — Lost responses or slow loads create false certainty

1. **Failure:** Accepted completion times out and a new action repeats it; a failed
   list request becomes “no work,” or cached scope is called current.
2. **Importance:** Users repeat work or trust inaccurate status, especially on phone.
3. **Severity:** High.
4. **Likelihood:** Plausible on ordinary mobile networks.
5. **Evidence:** ADR-0183 semantic receipt ownership and D19 recovery obligations;
   W3C status guidance supports perceivable feedback but proves no backend guarantee.
6. **Decision effect:** Preserve A; no new offline subsystem or provider required.
7. **Permanent fix:** Original-command reconciliation, distinct known/unknown states,
   current-authority recovery and useful bounded rendering.
8. **Proposed clause GUX08:** “Unknown action outcome SHALL remain distinct from
   rejection and success. Recovery SHALL resolve the original action before a
   new competing completion is offered. Loading or unavailable source state SHALL
   NOT be rendered as zero work, complete history or current eligibility. No
   communication replay SHALL follow from task-response uncertainty.”

**Proof:** Drop the response after commit, reload, double tap and change device;
recover one original result with no duplicate coverage/send. Fail each list page
and current-state refresh; display unavailable state without false empty/success.

## Evidence gaps and qualification boundary

No opened vendor source establishes the exact concurrent two-gifts-plus-third
contract recommended here. No study proves missionaries prefer its labels or
that it improves fundraising. The strongest evidence is the founder's selected
unit of work, local independent-task authority, concrete documented selection
pitfalls and accessibility requirements. The per-gift race/receipt behavior needs
source-owner qualification and integration tests; the proposed phone journey
needs actual keyboard, assistive-technology and usability checks.

Use a small practical future evaluation: ask participants which gifts an action
will cover, introduce a new arrival, then ask what remains; include a partial
follow-up and lost-response recovery. Success is correct understanding and task
completion without accidental outreach or hidden work, not a claimed universal
time-saving target. This describes a proposed test, not interviews already held.

Research-file verification is limited to structure, local-link targets and
whitespace. No application, database, financial, accessibility or provider tests
were executed by this research workstream.
