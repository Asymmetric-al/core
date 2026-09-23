# Phase 26 D8 — A clear access-loss handoff journey

11 September 2026. The founder chose Shared return by default with an administrator-selectable review-first option. **This complete UX amendment package is fully founder-ratified, 11 September 2026, including all adopted amendments, adjustments, changes and updates.** D1–D7 remain ratified. The [full review](phase26-d8-adversarial-review.md) contains the exact 20 requirement groups, all 23 categories and 26 proof groups. The [evidence](phase26-d8-evidence.md) distinguishes documented practice from Asym design judgments. This is a grooming blueprint, not a built or user-tested interface.

## The experience to deliver

An administrator should know what will happen without learning an offboarding subsystem. Staff should find affected work in Support, understand whether they can claim it or it requires review, and continue without losing the conversation's context. A donor continues the same email exchange. No account requirement, announcement about the departure, new ticket or change to the recipient list is added.

Three meanings stay distinct throughout: **access**, **work status**, and **handling**. Maria's access may be removed while a handoff is still processing. Her conversation may be Waiting on our side while its handling says Needs reassignment. Neither means the finance action is complete or a replacement has replied.

The surface uses Core's existing Maia/Base UI primitives, Zinc semantic tokens, typography and spacing. Preserve ordinary layout and navigation. The proposed polish comes from concise wording, a strong primary action and stable context—not another visual theme, animated dashboard, wizard or dense settings matrix.

## 1. Configure an inbox

In **Support → Inbox settings → Assignment**, add one distinct section after new-intake handling. Its scope is the named inbox, with tenant context visible in the existing shell. There is one saved value, not a hidden tenant/person override chain.

```text
After a teammate loses Support access

● Return to shared queue
  Unfinished conversations return to shared handling in
  this inbox when qualified cover is available.

○ Review handoff first
  An authorized administrator decides how the affected
  conversations will be handed over.

Applies to new handoffs. Handoffs already started keep
their current handling.

Review handoffs                                  Cancel  Save
```

Use a labelled radio group or equivalent shared accessible single-choice control. Both choices and consequences are visible; a bare on/off switch would make “off” ambiguous. The choice starts as Shared for new configured inboxes. Existing legacy backlog is not swept because a new field defaults to Shared.

Save remains disabled until this section changes; successful Save confirms this inbox's policy. Preserve the draft on error and show a field/section error. If another administrator changed the policy, show the current saved value and allow a deliberate fresh choice. Do not automatically replace an administrator's unsaved selection when background data refetches. Cancel does not undo another saved control such as Pause or Receive.

If Review-first has no qualified reviewer path, explain that actual problem next to the choice/Save: **“Set up a permitted inbox administrator before enabling review-first handoffs.”** Link only to the owner-authorized existing management route. Do not silently create a role or grant broad record access. A later reviewer loss is a visible recovery condition; it cannot prevent revoking their access.

Changing back to Shared does not approve outstanding reviews. Keep **Review handoffs** directly available so the administrator can act on current work. Do not add an “Apply to all existing conversations” checkbox or a per-departure override to this setting.

## 2. A planned or urgent access change

The existing identity/permission owner performs removal or scope restriction. Support contributes permitted impact information, not a duplicate Remove user action. A planned change may offer a link to review and deliberately reassign conversations first. An urgent change can proceed without that review, a loaded preview, a replacement or a successful background worker.

Illustrative, permission-qualified preview:

```text
Support work affected

Donor Care
2 Open · 1 Waiting for requester · 1 Waiting on our side
Current handling: Return to shared queue

Review conversations

Support handoff runs independently after access changes.
Actual results will show any work needing attention.
```

This is a current estimate; use **“Checking affected work…”** or **“Affected work could not be loaded”** when appropriate. Never display unknown as zero or imply the policy is reserved before durable Support admission. The result view shows the mode actually captured when the handoff starts. This handles changes initiated through other qualified owner paths as well as the UI.

An access administrator who cannot inspect Support content sees only the owner-approved projection or a link for authorized Support administrators. Counts, subject lines, private reasons and inaccessible inbox names are not automatically revealed because they can remove an account. Do not display health, leave, disciplinary or travel details in a Support handoff summary.

## 3. Report two independent outcomes

After the owner's operation, show its real access result separately from Support processing:

```text
Access removed

Support handoffs
Donor Care · Return to shared queue
3 returned to shared queue · 1 needs attention

View handoffs
```

If access removal failed or is not confirmed, do not show this success example. If handoff enumeration is incomplete, say **Processing affected work** and show a truthful processed count without claiming a final denominator. A closed panel or expired toast must not erase the remaining work. Refresh and reconnect recover the same operation and current per-item results.

Use a compact persistent result and an ordinary link. Group routine progress announcements; announce meaningful completion or a new actionable error accessibly. Avoid modal confirmation for every row and repeated alerts for unchanged waiting conditions. The existing global notification policy determines escalation delivery.

## 4. Default Shared handling

In Maria's example, all four unfinished conversations remain in Donor Care. The Open items stay Open; the two waits remain correctly labelled; Tuesday's reminder remains Tuesday. Invalid-assignment repair records the prior handler and clears that assignment with its pending handling condition. Shared release then completes the handoff to qualified shared handling; these may complete together when all checks permit. It does not create four new incoming messages or mark four successful replies.

In the ordinary shared list, staff can claim or assign a released conversation. If automatic release is paused or qualified cover is absent, show **Needs reassignment** with a concise reason. A currently permitted explicit **Assign to me** or **Assign to…** can settle an A item directly, even while automation is paused. This is a real manual handoff, not a workaround or an implicit Review-first requirement.

The list should not hide a waiting conversation merely because the default working view emphasizes Open. The established Unassigned concept continues to mean no individual handler, with pending subsets clearly identified. Never present review-held items as ordinary claimable Shared work; totals and filters must state their population rather than add overlapping badges as separate conversations.

## 5. Review-first handling

An unfinished item displays its ordinary work status and a distinct handling state:

```text
Waiting on our side                  Needs reassignment
Follow up Tue, 15 Sep · 09:00 ICT
Previously handled by Maria

Review required by this inbox's handoff policy.
Review handoff
```

The date is illustrative, localized and explicit about time zone; actual reminders are not changed. Use **Previously handled by Maria** only where identity/history is permitted. The treatment is a calm contextual state, not a red error banner across every conversation.

For a qualified reviewer, **Review handoff** opens a focused existing detail panel/dialog with current subject, inbox, work state, follow-up, previous handler and permitted relevant context. The reviewer can read the conversation and open authorized CRM records without losing the handoff selection or draft. Essential context must not exist only in a hover tooltip.

The primary actions perform the actual reviewed disposition:

- **Return to shared queue** checks current qualified cover and completes that release.
- **Assign to…** lets the reviewer choose a currently eligible person, including self, and completes assignment and review together.
- **No handoff needed** appears when current Support work is genuinely complete; it records an explicit reviewed disposition without claiming a refund or other business action succeeded.

Avoid an **Approve** button followed by a separate **Assign** step. That invites partial success and makes staff wonder whether the work has actually moved. Review is not a signature ceremonial step: it chooses the next valid handling outcome.

Staff without the review capability see a short explanation and the permitted route to the inbox's qualified administrators. Ordinary Claim/Unassign cannot bypass C. Existing authorized replies, internal notes and D3 status actions continue; sending a reply never silently claims the item or approves the review. A reviewer has no automatic authority over restricted CRM/giving/care content.

## 6. Resolution, moves and existing reviews

If authorized staff legitimately Resolve the Support work before C review, keep the unresolved review binding and history. It is no longer actionable unfinished work, so it drops out of that workload count and its overdue-work reminders. It remains accessible under all handoffs/history. The contextual explanation can say **“No unfinished Support work. The handoff review remains recorded.”** Do not require an administrator to close every dormant record merely to clear an operational badge.

If the conversation reopens before that review is settled, C becomes actionable again. An administrator changing the inbox default to Shared or staff moving the conversation cannot remove the prior review requirement. A qualified reviewer can explicitly complete the disposition alongside an authorized move. After an explicit **No handoff needed** settlement, genuinely new reopened work is evaluated under the then-current policy.

Restoring Maria's access never takes back work already handed over or automatically restores an invalidated assignment. Under A she can deliberately claim permitted work; under C the current review still governs. The interface should not offer **Undo departure** as a shortcut to restore ownership or privileges.

## 7. Bulk work without ambiguous scope

Reuse the existing Support selection and assignment experience. Show exact selected count and relevant work types. A selection is explicit IDs/current control, not “whatever is currently on this screen” or a changing query that silently grows during processing. A mixed-inbox selection shows which destinations/modes apply; otherwise narrow the action to a coherent authorized group rather than pretend one recipient is suitable for everything.

Review and assignment may process items independently. Report each outcome and retain changed/stale/denied/blocked/failed/unknown items with a reason. A concurrent claim by Daniel must not be overwritten because an old batch selected Maria's list. Retry reconciles the original unresolved items before any new attempt. It does not repeat already successful effects or reopen resolved work.

Critical partial outcomes remain reachable after the panel closes. Do not send a notification for every successful item. An actual recovery task uses the shared Mission Control task system, linked to the underlying handoff and permission-aware on open.

## Interaction states and proof

| State                                              | Visible behavior                                                                                                  | Required proof                           |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Loading policy or affected scope                   | Honest loading/unknown, stable layout, no guessed Shared or zero count                                            | Async/failure tests; P02/P03/P16.        |
| Unsaved setting or concurrent change               | Draft preserved, explicit Save/Cancel, readable conflict                                                          | Keyboard and concurrency tests; P01–P03. |
| Current unavailable handler before repair          | Explicit unavailable history/current condition; no normal ownership or Claim inference                            | Current auth/projection tests; P04–P06.  |
| Pending A while paused                             | Reason plus permitted manual action; Resume applies only to current A                                             | P09/P13.                                 |
| C review required                                  | Reason and reviewer action; no generic assignment bypass or extra Send approval                                   | P08–P11.                                 |
| Missing cover/reviewer or inaccessible destination | Persistent safe recovery; no arbitrary person or broadened visibility                                             | P09/P12/P16/P22.                         |
| Partial or indeterminate batch                     | Per-item durable results, original retry/reconciliation                                                           | P14–P16/P24.                             |
| Permission changes while reviewing                 | Preserve permitted context, refresh/reject stale action safely; remove now-forbidden content                      | P04/P12/P17.                             |
| Mobile, long names, localization, low bandwidth    | Reflow, comfortable shared-control targets, full names on accessible detail, reconnect-safe state and clear dates | P16/P21/P22.                             |

All controls use native semantics or established shared Base UI behavior with visible focus, correct keyboard operation and restored focus after dismissal. Follow Core touch-target tokens, WCAG reflow/contrast and contextual non-color labels. No hover-only action, color-only status or tiny aesthetic hit area. Respect the shared reduced-motion baseline; progress does not need animated rows or bouncing badges. W3C specifically supports status feedback without moving focus and cautions against excessive live announcements. [W3C status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [W3C target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

Before activation, representative staff must complete configure→access change→find work→review/claim→continue conversation→authorized CRM action→return journeys, including a changed permission and a failed handoff. Measure understanding of Save scope, Shared versus accepted, dormant review, and access versus handoff completion. No current mockup, source test or competitor screenshot proves that outcome. The exact proof and monitored response thresholds are in the full review.
