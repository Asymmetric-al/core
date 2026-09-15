# Support retention settings and CRM continuity

The ordinary experience is a clear tenant policy and quiet, predictable content availability. The [complete D17 clauses](phase26-d17-adversarial-review.md) and [data inventory](phase26-d17-data-inventory.md) govern every behavior below. This complete blueprint is fully founder-ratified, 11 September 2026; it is not a rendered UI or completed accessibility test.

## The policy surface

Use the existing tenant settings area, **Support → Content retention**, through Core's shared navigation and permission patterns. It is one section for ordinary Support content, not a new compliance application. Use exact base-maia, Base UI primitives, semantic tokens and shared components.

The first configuration has no preselected numeric value. The form reads:

```text
Support content retention

Keep ordinary conversation content for
[ Enter a whole number ] [ Months ▾ ]
after Support work ends and no new human content is added.

Message text, internal notes and Support files share this period.
Required records and preservation duties follow their own policies.

Cancel                                      Review policy
```

Days/Months/Years are explicit choices; the illustration's unit is not a recommended duration. No Never value, automatic two-year default, hidden attachment period, custom conditions or inherited inbox policy. The authorized administrator selects a finite period from the tenant's actual approved purpose/records policy. Validate the complete value with a localized message, without accepting zero, fractions, negatives, overflow or an unrepresentable deadline.

Brief expandable help explains that days are elapsed 24-hour days; months/years use the policy's frozen tenant IANA timezone and calendar anniversary with the specified month-end rules. Show **Calendar timezone: [tenant zone]** in the review with exact localized examples. Ordinary staff do not have to understand timestamp storage or choose daylight-saving rules. Changing a viewer or unrelated tenant timezone setting does not move existing policy deadlines. Adopting a different policy calendar zone requires a reviewed version showing old/new zone and all immediate/future effects. Avoid converting one year into 365 days silently.

The active section shows its duration, effective date/time, status, last changed actor/time, a short scope statement and **Change policy**. Qualified details/history show versions, activation and actual processing/exceptions. The numeric field can be edited in a draft without changing any live policy.

## Review and activation

**Review policy** or **Review changes** opens a focused review in the same settings context. Keep entered data if a request fails. The review must show:

- Current and proposed duration, with units and any calendar-zone/basis change.
- **Applies to existing and future unexpired Support content in this tenant.**
- **Takes effect when you confirm.** Clearly state when existing content will expire immediately.
- A dated policy-scope calculation with separate original histories, native messages and attachment occurrences. Identify excluded/unknown classes and their owners. Do not label unique stored blobs as files or merged rows as original histories.
- What remains: permitted communication/work facts and independently owned CRM/giving/official records, each under its own policy.
- **Expired content cannot be recovered by lengthening this policy.**

The final action is **Activate policy** for first publication or **Apply changes** for a replacement. If the reviewed rule makes existing content expire now, include that consequence beside the button: **Applying this policy will expire eligible existing content immediately.** Use one meaningful final confirmation, not an extra generic dialog, typed phrase, automatic dual approval or hidden grace period.

The administrator approves an ongoing rule and its complete authorized scope. A preview is a timestamped calculation, not a frozen promise about every item. Counts may change with actual work; scope/policy/authority changes require a new review. No enormous per-record selection list or full transcript download is required. Server eligibility and source guards govern each actual effect.

```text
Review retention change

Current:   2 years
Proposed:  1 year
Scope:     Existing and future unexpired Support content
Effective: When you confirm

Snapshot calculated at 14:30
Eligible now: 148 original histories
              921 messages · 63 attachment occurrences
Exceptions:   4 originals need qualified records review

Eligible existing content will expire immediately.
Permitted interaction facts and independent CRM/giving records remain.
Lengthening the policy later cannot restore expired content.

Back                                             Apply changes
```

All numbers above are synthetic examples, not defaults, performance claims or actual tenant data. Unknown/excluded legacy classes cannot be quietly omitted to make an activation look complete. A policy administrator's aggregate authority does not reveal restricted source details; samples/drill-downs retain their own authorization. Unqualified aggregate scope blocks that publication and routes to the qualified policy owner.

## Clear policy-adjustment outcomes

| Situation                                | Outcome and product copy                                                                                                                                                           |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shortening the period                    | Preview new effects on existing unexpired content. On confirmation, newly overdue eligible content expires at that instant. No retroactive deletion timestamp.                     |
| Lengthening before current expiry        | Still-valid content can receive the new future deadline. Stale old-policy projections cannot delete it early.                                                                      |
| Lengthening after current expiry         | Old content stays expired even if byte cleanup is unfinished. Explain the boundary before confirmation; new content remains independently usable.                                  |
| Editing the same effective value         | No new lifetime or unnecessary versioned effect. Show the existing policy accurately.                                                                                              |
| Another administrator published a change | **The policy changed while you were editing. Review the current policy before applying yours.** Preserve the draft as uncommitted.                                                 |
| Preview fails or is incomplete           | **We couldn't calculate the policy's full impact. Try again.** Identify safe known scope limitations; never show zero or enable destructive activation on a false complete result. |
| Apply response lost                      | **Checking whether the policy was applied…** Reconcile its durable operation; do not invite blind repeated activation.                                                             |
| New policy active, cleanup pending       | **Policy active. Content cleanup is processing.** Current ordinary availability already follows the effective policy. Show owned failures only where actionable.                   |

No automatic email is sent for healthy policy operation. A separate required administrative/security duty can use existing P17 attention, with content-free scope and the proper owner. The tenant period never extends P17 prepared-material or Recent-copy limits.

## Exceptional pause

Place **Pause future expiry…** in a secondary policy action menu for qualified policy owners. It opens a small reviewed form with **Pause until**, explicit timezone, a bounded content-free reason and impact. It cannot be indefinite, revive expired content, stop accepted cleanup, or override a stricter owner/legal deadline.

Copy: **This pauses future ordinary expiries until the selected time. Already expired content stays unavailable. Eligible overdue content will expire when the pause ends.** Show the pause-end instant and qualified backlog estimate. Confirmation records a bounded policy change, not a worker toggle. **Resume now** also reviews its effects before applying. The active section shows **Future expiry paused until [date/time]**; no persistent warning appears on every conversation.

A technical cleanup pause is an operational control, not this tenant policy action. It does not extend content access or prove compliance. Missed processing/deadlines reach the responsible operator through existing grouped attention.

## Daily Support and CRM behavior

Ordinary staff see no retention form on each reply. When the current source is authorized, they can open **Content retention** details to understand the applicable period, genuine activity/work anchor, exact expiry date and relevant current availability. Do not show a continuously changing countdown in every list row. If an existing note can be edited, its details preserve the original deadline and explain that saving an edit does not extend retention; expiry during composition still requires clean review while preserving separable authored draft text.

At expiry, use **Content expired under your retention policy** in the original position. Preserve permitted facts and navigation; do not display the original sensitive subject, file name or excerpt. When newer content exists, use a compact **Earlier content expired** separator plus the new readable messages. Do not mark the entire current conversation unreadable merely because an older generation expired.

| Source condition                                   | Safe display                                                                                                            |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Ordinary generation expired                        | **Content expired under your retention policy**; permitted history/details remain.                                      |
| Older expired generation with new current messages | **Earlier content expired**; show new messages and current work normally.                                               |
| Required bytes retained under hold                 | Ordinary expired/unavailable display. Qualified records detail says **Preservation required**; no ordinary Reveal.      |
| Authority/eligibility check unavailable            | Safe temporary-unavailability state. Do not falsely claim expiration, successful destruction or a confirmed legal hold. |
| Cleanup failed after expiry                        | Content remains expired. Qualified details show **Cleanup needs attention**, owner and retry/reconcile outcome.         |
| Actual source/CRM access absent                    | Existing non-disclosing access behavior; no hidden title/count/hold details.                                            |
| All lawful CRM discovery basis removed             | Withdraw normal CRM row/count. Service-only control evidence does not create visible history.                           |

CRM Communications uses D9's same source row and current availability. Expiry does not add Activity, last contact, an artificial donor interaction or a new CRM note. The actual giving receipt is unchanged; access to it is reauthorized in its owner surface. The existing financial-support summary retains its distinct meaning.

If old Reply/Reply all context has expired, state **Reply details for this older message are no longer available.** Do not substitute today's CRM email. Genuine new email provides a new qualified reply audience. Deliberate new outbound conversation uses the existing authorized flow. A normal late reply must not be lost just because its predecessor text expired, nor may it recover the old text.

## Long-running work and required records

When the oldest ordinarily available unexpired content reaches the chosen interval and ongoing work/chatter still prevents expiry, create one accountable purpose-review obligation through existing staff/records work. Already-expired held bytes do not repeatedly trigger review of new content. It is grouped and does not send a per-message warning storm. The qualified reviewer confirms current need and next review within one interval of that actual review; policy shortening updates pending reviews, while lengthening cannot erase a missed-review fact. The owner may finish actual work or place a required record in its owning domain. No auto-close action or Keep forever switch.

Staff must understand that an open Finance task or CRM link alone does not hold all conversation content. Conversely, a merged-away source can still support an active shared issue. The exact source interest drives eligibility. If a required record only exists in the Support upload, qualified records custody precedes its destruction; do not ask staff to casually export everything to a local folder.

## Accessibility and verification

Use shared accessible form/dialog primitives with programmatic labels, units, errors, current/effective values and quiet status announcements. Maintain focus on an understandable heading/least destructive action, offer Back/Cancel before commitment and return to the stable settings/source location. Avoid destructive Enter submission from a duration or date input. A closed review surface does not undo an accepted publication.

Require keyboard/AT/touch parity, visible focus, adequate target size, no color-only warnings, localized time/number presentation, mobile-keyboard clearance and 200%/400% zoom/reflow. Low-bandwidth retries preserve drafts and distinguish checking from saved. The preview and activation experience needs actual usability proof that staff can explain what disappears, what remains, when the change applies and why expired content cannot return. [W3C error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html), [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [dialog guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

No rendered interface, accessibility certification, tenant user study or performance benchmark is claimed. D17 P01, P06–P15, P25–P30 and P37–P39 require those actual outcomes before release. The blueprint defines the complete intended experience without selecting a new component system, provider or compliance product.
