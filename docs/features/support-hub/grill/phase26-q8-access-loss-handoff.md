# Phase 26 Q8 — Unfinished work after loss of Support access

**Status: answered A with an administrator-selectable C option; D8 and all amendments fully ratified, 11 September 2026.** D1–D7 and all adopted amendments are fully founder-ratified. The [full D8 review](phase26-d8-adversarial-review.md) records the founder selection and all exact amendments as fully ratified. This historical comparison is local grooming, not a formal specification or implemented behavior. Research checked 11 September 2026 against current Core and primary help-desk documentation. The [evidence record](phase26-q8-evidence.md) contains the source distinctions, boundaries and independent challenges.

## The next decision

**After Core confirms that a teammate can no longer handle particular Support work, where should their remaining unfinished conversations go by default?**

This closes the ownership branch left after temporary absence coverage. D7 covers someone who still has permission to handle the work. Here, that permission is actually gone: departure, suspension or removal of access to an affected inbox. Turning Receive Off, reaching an automatic assignment limit, losing an unrelated finance permission, or a failed lookup does not establish this trigger.

Access denial is already governed. It takes effect independently of whether the handoff is complete, a successor has been selected, routing is paused or a manager has reviewed the portfolio. The choice is the normal destination of remaining Support work, not whether or when to revoke access.

Example: Maria leaves Donor Care. Her Support access is revoked while she has two Open conversations, one Waiting for requester, and one Waiting on our side with a follow-up next Tuesday. All four still belong to the tenant. Their current statuses, reminders, messages and actual history must remain accurate. Daniel can continue only the work his own current permissions allow. This is an illustrative scenario, not a measured ministry staffing pattern.

## Options and tradeoffs

| Option                                                       | What happens to the remaining unfinished work                                                                                                                                                                                                         | Best reason to choose it                                                                                                 | Main tradeoff                                                                                                                                                      |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A — Return to the responsible shared inbox. Recommended.** | Automatically clear the former individual's handling assignment and return Open plus both Waiting categories to Unassigned in the existing responsible inbox/team, where shared handling is permitted and covered. Staff claim or assign it normally. | Reuses the familiar team workflow, includes quiet obligations, and avoids guessing who should inherit a mixed portfolio. | Shared handling still needs staff attention. A handoff backlog must be visible, including waiting work; Unassigned does not mean a person accepted or answered it. |
| **B — Use a designated eligible replacement.**               | An authorized administrator chooses a reviewed successor for this departure or each affected inbox. Remaining work goes to that person where current checks permit; otherwise it follows the qualified Shared fallback or visible recovery.           | Gives immediate individual accountability when the replacement is already known.                                         | Requires a meaningful successor choice and review of their actual scope and workload. One name is not necessarily appropriate for every conversation.              |
| **C — Require an administrator-reviewed handoff.**           | Access ends immediately. Remaining work appears visibly as Needs reassignment with the former handler marked unavailable; an authorized administrator reviews and chooses destinations for individual items or batches.                               | Gives the most control over a varied or sensitive portfolio.                                                             | Makes review an extra prerequisite for routine reassignment, creating a bottleneck. The unavailable person cannot still appear to be a valid current handler.      |

Planned ordinary handoffs are available under every option. For example, Maria can deliberately transfer selected conversations to Daniel while both are authorized. A's default handles whatever remains; B instead uses a supplied successor as the default destination for the remaining portfolio. Neither implies a new round-robin algorithm or a generic offboarding platform.

Every option must preserve safe custody when no permitted destination exists. A does not broadcast restricted work to a general inbox. This exception differs from C, which requires human review even when an ordinary qualified shared route already exists.

## Single best recommendation

**Choose A. Return all affected unfinished work to its responsible shared inbox, preserving its work status and follow-ups. Keep an explicit, reviewed successor handoff easy when someone has been chosen.**

Permanent or confirmed loss of handling authority differs from D7 absence: a quiet waiting conversation cannot depend on a person who is no longer allowed to handle it. Moving only today's Open work would leave future obligations stranded. Moving all unfinished work to qualified shared handling fits the ratified D6 team workflow without building another allocation policy.

The strongest alternative is B for a known successor. It avoids another claim step and may suit a deliberate role transition. That is a useful authorized handoff, but a weak universal assumption for work left behind after an unexpected access change. C is appropriate where a blanket disposition would be premature; making it the default introduces a review obligation for every remaining conversation.

This is an Asym product judgment supported by documented operational patterns, not proof of universal nonprofit preference or measured satisfaction improvement.

## What comparable products establish

Front unassigns shared-inbox conversations when a teammate is blocked or deleted, while preserving shared history and keeping archived work archived. That supports separating assignment cleanup from work state and history. It does not establish Asym's exact Waiting or Resolved semantics. [Front, edited 28 August 2026](https://help.front.com/en/articles/2082).

Intercom's removal dialogue allows a replacement teammate or Unassigned. Its documentation also says reassigned work is not automatically returned if the person rejoins. This is strong evidence for B as a concrete alternative and for avoiding automatic handback; it does not prove Core's transaction ordering. [Intercom, 14 July 2026](https://www.intercom.com/help/en/articles/280-add-remove-delete-or-export-a-teammate).

Zoho Desk offers department-specific replacement during deactivation and distinguishes it from deletion. Zendesk documents group return for non-closed tickets left behind on agent removal. These support practical shared/successor choices, without importing cross-module ownership changes or making a successful handoff a prerequisite for urgent access denial. [Zoho Desk agent management](https://help.zoho.com/portal/en/kb/desk/user-management-and-security/agents-and-teams/articles/add-manage-desk-agents), [Zendesk agent removal](https://support.zendesk.com/hc/en-us/articles/4408888690842-Downgrading-and-removing-an-agent).

## A quiet, understandable journey

Support should contribute a compact, permission-aware impact summary to the owning access-management journey, rather than add a second user-deactivation flow. For a planned change, show the affected inboxes and unfinished counts, explain the default destination, and offer **Review conversations** for deliberate reassignment. An incomplete count or review must never block the owner's urgent access action.

Afterward, distinguish **Access removed** from **Handoffs processing**, **Completed**, or **Needs attention**. Keep unresolved results reachable after a toast or dialog closes. In conversation detail, show the actual current assignment and a concise historical event; do not replace the normal work-status label with an offboarding label.

For the example, the team sees two Open and two Waiting conversations under its normal shared handling, with Tuesday's follow-up intact. If a restricted conversation has no permitted cover, it remains a visible, access-controlled recovery obligation. No departure announcement or extra login step is added to the donor's email conversation.

Use text as well as visual emphasis, preserve focus and context, and announce meaningful progress accessibly without repeatedly interrupting staff. These are proposed interaction principles, not a validated mockup. WCAG's status-message guidance supports accessible updates without taking focus and cautions against excessive announcements. [W3C, Understanding SC 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

## Boundaries and pressure cases for the selected answer

| Case                                                               | Required basis for the next adversarial review                                                                                                                  |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Only one inbox's handling permission is removed                    | Use the exact confirmed affected scope; preserve other eligible assignments.                                                                                    |
| Receive is Off, pool membership changes, or a profile lookup fails | Do not infer confirmed loss of existing-work authority or trigger a mass transfer.                                                                              |
| Both Waiting categories or Open with a future deferral             | Preserve the exact work meaning and reminder; reassignment creates no new urgency or resolution.                                                                |
| An old Resolved/No response conversation gets relevant new input   | Preserve historical attribution and obtain a qualified current handling path; do not revive an invalid owner or rerun initial intake.                           |
| An administrator already handed an item to Daniel                  | A stale cleanup cannot overwrite the newer authorized assignment or move.                                                                                       |
| Access is restored before or after a delayed handoff               | Recheck current owner facts before an effect; do not take already transferred work back automatically.                                                          |
| Routing is paused, or D7 Keep exists                               | Access denial still applies. Explicitly reconcile the new eligibility-repair purpose with D6/D7 Pause and Keep; do not silently change those ratified controls. |
| No permitted shared cover, or successor becomes ineligible         | Visible safe recovery, no arbitrary administrator fallback or access expansion.                                                                                 |
| Replies are drafted, prepared, queued or indeterminate             | Preserve private drafts and D4's author/audience/effect authority; reassignment neither sends nor cancels/rekeys mail by itself.                                |
| Support concerns a refund, CRM edit or care matter                 | The owning domain still authorizes and performs its action; Support handoff grants no business permission and records no false completion.                      |
| A large handoff partly succeeds or its response is lost            | Complete server-side scope, conditional per-item outcomes and reconciliation; no newest-N shortcut or false batch success.                                      |

The selected answer has now received the full D8 review, including the owner event/current-state repair boundary, Pause/manual split, permission requirements and release proof. Fully ratified ADR0008 and glossary record the complete accepted amendments. This question adds no calendar, replacement algorithm, account-deletion policy, CRM synchronization or unrelated workflow feature.
