# Intake review: the complete staff journey

Fully founder-ratified D19 design, 12 September 2026, accompanying the [corrected decision and review](phase26-d19-adversarial-review.md). This is an interaction contract, not an implemented or usability-tested screen. Use Core's existing base-maia, Base UI primitives and semantic tokens; no new visual system.

The interface should answer three things without training: **Why is this here? What can I do? What happens when I do it?** Put those answers beside the action. Keep protocol details and history available on demand. The workflow is staff-only; donors and missionaries continue their ordinary email journey and see no quarantine console.

## 1. Configure responsibility once

Open **Settings → Shared inboxes → Donor care → Intake review**. The tenant's actual naming/navigation conventions govern the final location; do not create a second Settings hierarchy if the existing one provides this scope.

| Field            | Behavior and wording                                                                                                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reviewers        | Existing eligible people or teams. “Reviews incoming email held before it enters this inbox.” Show effective eligible coverage, not all team members.                                                                         |
| Backup           | Existing qualified person/team. “Can cover review when needed.” Optional when adequate coverage exists; no forced second approver.                                                                                            |
| Tenant oversight | Named accountable owner/reference from tenant settings. “Keeps review coverage and unresolved work on track.” This does not grant message access.                                                                             |
| Held content     | Read-only summary of the current owner-qualified tenant schedule, with **Manage policy** only for the actual policy owner. Proposed ordinary default: 14 elapsed days from qualified receipt; earlier restrictions can apply. |

Use an ordinary searchable people/team picker, selected chips and inline effective-coverage status. Show **Coverage ready**, **Single-person coverage** or **No eligible reviewers** with text and a restrained icon. A coverage change reviews only affected responsibility/access facts; it is not a legal checklist or a second role system. The system must never silently grant broader access to make a selected person eligible.

New inbox activation needs viable coverage and qualified lifecycle/provider safeguards. Routine removal of the last reviewer asks for a replacement as part of that settings transaction. Emergency access revocation always succeeds; it leaves an owned coverage exception. One person or one central team can cover a small tenant. A reviewer who leaves does not retain access through an old assignment or notification.

Policy editing remains a link to the existing owner capability. It shows the old/new finite schedule, exact effective time, affected existing unexpired content, unresolved/unknown exclusions, and shortening/irreversibility consequences. The ordinary reviewer cannot click Keep forever or extend one item. The 14-day proposal is a product default, not legal advice or a promise overriding actual provider/owner ceilings. Only published owner-qualified finite variants/bounds are selectable; this decision does not authorize arbitrary tenant-entered periods.

## 2. Notice only meaningful work

The Support sidebar includes **Needs review** for eligible staff. Its count covers only the stated current authorized scope. A reviewer opening Donor care lands in that inbox scope; a reviewer covering several inboxes can choose **My review inboxes** without loading unauthorized names or counts.

Within Needs review:

- **To review**: an ordinary business decision is currently available.
- **Processing**: a release decision is accepted but canonical admission is not yet proved.
- **History**: authorized released, dismissed and expired outcomes, with filters.

**Processing issues** is the qualified operator's separate technical-recovery view. “Processing” in Needs review means pending release, not every provider fault. When a release develops a technical issue, its row says **Processing needs attention**, references the same source and qualified recovery route, and does not create duplicate work. Restricted/platform cases are shown only in their actual authorized surfaces; the ordinary list does not reveal hidden case existence through counters or placeholders.

The first-use/empty helper is one sentence: “Incoming email held before it enters Support work.” The normal row shows sender, subject or safe fallback, inbox, reason, received age and a quiet expiry date. No message-body snippets, avatars implying verified identity, decorative warning cards or flashing timers. Use optional filters for inbox, reason and disposition, and authorized text search. Default page size is 25; maximum 50. Search remains bounded to permitted retained fields, and a search term must not expose an expired or restricted match.

The queue preserves sort, filters, scroll and selected item while inspecting, returning from CRM, or recovering a request. Do not reorder the row under a pointer during an action. After a completed action, keep its receipt visible and let staff choose Next; never send a release click to a newly shifted row.

## 3. Inspect one input

Illustrative scenario, not a claimed observed ministry workflow: a church's legitimate donor-care question is held as possible spam. Alex, an eligible reviewer, opens it. The detail pane uses this reading order:

```text
Donor care / Needs review                         Back to list

Receipt question                                 Received 12 Sep, 09:10
Sender name <office@example.org>                  Expires 26 Sep, 09:10

Possible spam
This message needs a review before it enters Support work.   Details

[Read-only text preview]
[Files: invoice.pdf — Checking; image.png — Available]

Destination: Donor care
Only this message. Future mail rules stay the same.

[Release to Donor care]      [Dismiss]      Ask responsible team

Review history ▸
```

This is information hierarchy, not a pixel-perfect mockup. Use a desktop split pane and a full-width detail route on narrow screens; avoid a tall modal for reading email. Dates use the viewer's locale with an accessible exact date/time/timezone detail. IDs and addresses retain exact meaningful characters. Names do not require first/last splitting; long names, international scripts and right-to-left display must not obscure the actual sender address or link destination.

**Details** expands typed source evidence such as authentication uncertainty, original destination and processing status. The server determines the current reason and action set. An email claiming “verified by Asym” remains quoted sender content, visually separate from system evidence. Several gates can coexist; show the most relevant next step with **2 more checks** only when those details/counts are authorized.

| Reason shown                | Meaning                                                            | Permitted next step                                                                  |
| --------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Possible spam               | Reviewable uncertainty, not established abuse.                     | Inspect; Release or Dismiss if all other gates permit.                               |
| Sender check needs review   | Qualified receiving evidence is incomplete or discrepant.          | Decide only if this class permits human review; otherwise refer to its actual owner. |
| Destination needs review    | Tenant is known, but routing/correlation needs a qualified choice. | Select an authorized one-item destination or ask the routing owner.                  |
| Waiting for message content | Essential provider content is not yet available.                   | Qualified technical retry; no false security approval.                               |
| File check pending          | Required asset assessment is incomplete.                           | Wait/owner recovery; no “Open anyway.”                                               |
| Restricted review required  | Actual classification/security owner must act.                     | Qualified referral only; conceal body and even reason/existence where not permitted. |

Preview blocks external loads, scripts/forms/active embeds and clickable message links. Actual link destinations remain inspectable as inert text. Formatting is sanitized by the qualified shared renderer; text view remains available. Do not use the provider dashboard's public-sharing feature or hand reviewers raw temporary download URLs. Only an eligible scanned asset occurrence can use Core's governed preview/download action. File unavailability remains visible if the qualified input can otherwise proceed; it is not silently discarded.

## 4. Release deliberately

The primary button names the authorized target: **Release to Donor care**. The consequence summary is the confirmation. Another generic modal would add a step without clarifying scope. If the target or relevant gates changed since inspection, stop with **This message changed. Review the latest details** and show the actual current state.

If a valid conversation continuation is already known and visible, show its reference. If only the permitted inbox scope is settled, explain that normal intake will check continuation during processing; do not pretend that every release creates a new conversation. Do not offer free-form forced linking to arbitrary conversations.

When D13's original confirmation may still apply, show one conditional line: **The usual new-request confirmation may follow if this message is eligible.** Never promise that release can send no email whatsoever. No composer, recipient picker, canned reply or template editor appears here. Human replies occur later in the normal conversation; automated confirmation retains the original 15-minute eligibility ceiling and all suppression rules.

After clicking, disable the same action until the server outcome is reconciled and show **Release requested**. On a lost response, **Checking result…** uses the original operation identity; Retry must not create another request identity. Once admission is proved, show **Released to Donor care · Open conversation** if that link is authorized. If admission fails, preserve **Processing needs attention** and its proper recovery path. A reviewer who lacks destination conversation access may receive only the authorized processing result, not a backdoor link or title.

## 5. Dismiss and recover a mistake

Dismiss asks for a small typed reason selection, for example **Unwanted message** or **Not Support work**. The latter is not a substitute for a known required care/routing handoff. Show **Keep out of Support work** and **Recoverable until [date/time]** beside confirmation. No preselected “Block sender” checkbox. No contact deletion, future policy change, automated reply or immediate destructive delete.

After the decision, show **Dismissed · Return to review**. The same action is available in History until the original cutoff; a toast is supplementary. Recovery returns the input to current review under its remaining gates, not directly into Support. If expired, preserve the **Dismissed** decision and show **Content expired** with permitted typed evidence and no unusable recovery button. For inputs with no decision, show **Content expired before admission**; never fabricate a human dismissal.

For a burst of obvious unwanted inputs, staff can select specific loaded rows and **Dismiss selected**. Review exact count and reason; maximum 50, never all filtered results. Partial conflicts produce per-item outcomes and leave unresolved items visible. Do not offer bulk Release or permanent deletion. These bounds are proposed product choices for manageable review, not research-derived optimal batch sizes.

## 6. Ask for qualified help

When Alex cannot determine a destination or needs a restricted owner, **Ask responsible team** refers the same source through the existing qualified internal-work capability. It carries a typed reason and source reference. No forwarding of raw mail, copying a transcript, opening another conversation or expanding reviewer permissions. The UI states who now owns the next action only to the extent that scope is visible. Sending a request cannot drop the last accountable owner before the receiving obligation/custody is durable.

A technical operator can retry a failed fetch without approving a suspicious message. A security owner can resolve a false detection through its proper procedure without certifying the human sender. Ordinary staff do not receive an override switch that treats every held reason alike.

## 7. Correct a mistaken release

If release is pending, **Cancel release** attempts a guarded cancellation only while canonical admission has not committed. A race returns the actual result: **Already released** or **Returned to review**. Unknown results remain under reconciliation.

After actual admission, use **Open conversation** and the existing authorized source/link/restriction correction actions. Do not display universal Undo. Valid later replies, target history and CRM facts cannot be erased merely to restore a prettier queue. A safety incident uses the actual source restriction owner immediately; no claim can recall mail already delivered to another mailbox.

## 8. Oversight without a wall of alerts

The tenant oversight view summarizes permitted inbox coverage, unresolved age, pending release issues and approaching expiry. It does not require access to every message body. Restricted scopes may be omitted or represented only through a separately authorized aggregate, never guessed totals labeled tenant-wide.

One grouped in-product condition becomes actionable when coverage is missing, ordinary review reaches 24 elapsed hours (or enters already older), or unresolved content has 48 elapsed hours or less left. Show **Review due**, **Expires tomorrow** or exact due date with restrained semantic emphasis, not live second-by-second counters. These elapsed-hour thresholds include weekends and are not a response promise to the sender. First-reviewable age does not restart on reassignment or recovery. A calendar pause, read notification or hidden browser tab cannot pause content expiry or satisfy the source condition. Routine new held input does not send an email to every reviewer.

Report units clearly: received inputs, held inputs, actual admitted releases, dismissals, expiries and corrections. “Released after review” is not called “false-positive rate” without a measured correctness audit. Review speed is not used as a staff leaderboard that rewards unsafe release. An input that expires without a decision produces an operational review obligation; the oversight owner records a typed cause and response to complete that obligation without changing the expiry. Deliberately dismissed inputs do not generate this missed-review obligation. The full controls/owners are in D19 O01–O08.

## 9. CRM and Email Studio remain coherent

Authorized **Open CRM record** preserves return context. It never grants access, establishes identity, writes a Party, or places held content on ordinary CRM history. Upon actual admission, the single source-backed conversation appears wherever D9's existing qualified related-record rules permit; no second interaction is generated by the reviewer action. Finance, receipts, contact edits and care remain separately authorized owner work.

Email Studio keeps the [ratified D18 role](phase26-d18-email-studio-integration.md): authoring, saved wording, approved presentation and qualified preparation. D13 has its distinct Support request received template. Review attention uses the existing in-product presentation contract, not an ad hoc mailer. Resend receives under qualified tenant/provider authority, and P6 sends any real communication. No authoring/template control can override intake.

## Accessibility and interrupted-work acceptance

- Complete setup, inspection, release, dismissal and recovery using keyboard and screen reader. Use semantic tables/lists, persistent text labels, visible focus and announced status changes; no color-only meaning or hover-only explanations.
- Follow Core's 44px touch-target convention, narrow-screen reflow and zoom support. Full message detail is a route/pane; a short dismissal/impact dialog has a clear title, logical initial focus, Escape behavior where cancelable and return focus. A committed action cannot be canceled by merely closing the dialog.
- While a selected row is being acted on, preserve its identity. After completion, focus the result or predictable next navigation, never a destructive control. Announce changed counts politely without repeating the entire message body.
- Remote image/file loading is explicit and authorized; no speculative body/asset prefetch on mobile or low bandwidth. Interrupted requests retain operation identity and reconcile; expiry/revocation removes content on subsequent qualified reads without presenting a cached copy as valid.
- Test long localized labels, international names, bidirectional text, missing subjects, dates across DST, short policy deadlines and all keyboard/AT paths. Observe representative staff/admin comprehension of the four central distinctions before release; no usability result is claimed here.

The comparison basis and dates are retained in [the evidence register](phase26-d19-evidence.md) and [independent UX research](phase26-d19-ux-research.md). These patterns reduce known ambiguity; their real Asym effectiveness still requires the specified browser and user proof.

## Ratification and Email Studio clarification

The founder fully ratified all D19 amendments, definitions, UX/data/evidence, independent corrections and required proof on 12 September 2026. The [Email Studio integration addendum](phase26-d19-email-studio-integration.md) restates the accepted owner seam with no new product choice or implementation claim. Historical proposed/pending/no-Q20 statements above are superseded as to acceptance and advancement only. [Ratification and Q20 validation](d19-ratification-q20-validation.json) preserves the historical evidence separately.
