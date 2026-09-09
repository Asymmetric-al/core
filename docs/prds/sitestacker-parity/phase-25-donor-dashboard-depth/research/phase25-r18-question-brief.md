> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Ratified, 8 September 2026:** Conrad explicitly accepted Question 18’s corrected execution—A1–A5/J01–J16/V1–V10/C01–C22—including the same-day ordinary-gift, pending-activation pause and final-horizon clarifications. T01–T18 remain required target proof. Earlier provisional wording below records review history; ratification does not certify implementation or live behavior.

> **Current status, 8 September 2026:** Conrad selected A. The [completed adversarial review](phase25-r18-adversarial-review.md) proposes corrected execution and explicit lifecycle amendments for ratification. The unanswered wording below is historical pre-answer research.

# Question 18 — How should donors choose when paused giving resumes?

8 September 2026. **Question18 is unanswered. Recommendation: A — Show both resume choices together, with neither selected.** This is a researched grooming question, not a PRD, formal specification or implementation authority. Question 17's corrected direction and safeguards are explicitly ratified; its historical review bundle remains unchanged.

## The real-world situation

Maria gives USD 50 on the 15th of each month and wants a break. She may know when she is comfortable allowing giving to resume, or she may need it to remain paused until she decides to return. Both are already supported by Phase 16. The open decision is how the Pause workspace presents that choice without implying an automatic return she did not intend.

For an illustrative unchanged monthly schedule, if Maria chooses a pause ending 10 November 2026, the next eligible scheduled gift is 15 November 2026, assuming no other source restriction or schedule/end change. The pause boundary is not itself a newly chosen charge date. If she chooses to resume manually, the product invents neither a date nor a duration.

## Fair options

<!-- prettier-ignore -->
| Option | What Maria encounters | Benefit / tradeoff |
| --- | --- | --- |
| **A — Show both resume choices together. Recommended.** | In the same compact Pause workspace, two unselected choices: **Resume on a date** and **I'll resume it myself**. Choosing the first reveals an empty date field; the second needs no date. | Makes the automatic-versus-manual consequence explicit and treats both needs as normal. Adds one small selection for a donor who already knows a date, without adding a separate page. |
| **B — Start with the date field.** | The workspace initially shows an empty resume-date field, with an immediately visible **I'll resume it myself** alternative. No date or duration is prefilled. | A direct path for a donor who knows when the break should end. The date-led layout can make automatic resumption feel like the expected choice or make an uncertain donor initially think a date is required. |

Both options retain both modes, the same source command, explicit review and donor-chosen pause start. Neither option permits a preselected one/three-month duration, hidden indefinite option, automatic submit, required explanation or retention detour. B is a credible date-led presentation, not a deliberately obstructive form.

## Recommendation

Choose **A**. Whether giving resumes automatically or waits for the donor is meaningful enough to deserve one clear choice. Keep it on the same screen, use shared Maia choice controls, and reveal only the fields that apply. A donor should not have to discover that leaving a date blank is a different financial instruction.

Suggested wording to test, not a change to the source model:

- **Resume on a date** — Choose when your pause ends. We'll show the next scheduled gift before you confirm.
- **I'll resume it myself** — Giving stays paused until you return and resume it.

For the dated example, the review should distinguish **Pause ends 10 November** and **Next scheduled gift 15 November**, alongside the exact affected gift and start. This is clearer than one ambiguous Resume date that a donor could interpret as the next charge. For manual resumption, show **Paused until you resume**, with source-qualified future resume access. Existing missionary/staff projections keep their exact bounded/indefinite meanings and permissions.

The UI can remain a short coherent workspace: current gift context, two choices, applicable date input, concise consequence summary and the existing explicit pause action. No extra wizard, questionnaire, pushy recommendation badge on a financial option or duplicate pause engine is justified. Final component geometry, date entry, error/focus states and multi-line details need the post-answer execution review; no runtime behavior is claimed here.

## Current primary research and its limits

[GOV.UK radio guidance](https://design-system.service.gov.uk/components/radios/) recommends an explicit single choice without preselected answers where users could otherwise miss the question or submit the wrong answer. This is a **Useful precedent** for deliberate mode selection; its visual system is not imported. Asym retains exact shadcn base-maia/Base UI.

[Fundraise Up's donor portal configuration](https://fundraiseup.com/docs/donor-portal-configuration/) describes a date/duration-oriented pause with automatic resumption. That makes B a real comparable-product pattern. Its preset durations, 12-month limit and cancellation retention sequence do not override Asym's explicit dated/indefinite pause and direct cancellation contracts. No retention statistic or measured Asym conversion benefit is claimed.

[Donorbox's donor help](https://donorbox.zendesk.com/hc/en-us/articles/360020560231-How-do-I-pause-cancel-or-resume-recurring-donations-as-a-donor) describes Pause becoming a Resume control for the donor to use when returning. It is a dated 2025 but still published manual-return precedent, not proof of every underlying timing rule. [Blackbaud's recurring-gift help](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/tcs/content/contrib-onhold-plans-rc.html) explicitly distinguishes a future-date pause from an indefinite hold at the donor's request. That is staff-operated CRM evidence that both intentions occur, not a donor-interface study. Its installment limits/placeholders and staff follow-up policy do not carry into Asym.

[Givebutter's current donor management guide](https://help.givebutter.com/en/articles/4529176-how-to-edit-and-manage-your-recurring-donation) uses a custom pause date to change subsequent charge dates. That is a **Conflict with Asym's accepted pause semantics** if copied: Core's pause preserves the original schedule. Moving the regular charge date belongs to Change this recurring gift, already covered by Q09 and the schedule owner.

[Netflix's pause guidance](https://help.netflix.com/en/node/407) illustrates a familiar subscription pause, but immediate charging/re-anchoring on unpause is not a transferable giving requirement. These examples demonstrate why a familiar label cannot determine financial behavior. A is product judgment based on clarity and source consistency, not a claim that all modern donor portals make the same choice.

## Governing repository facts: supported modes versus open presentation

Current source inspected at develop `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`.

- [Phase 16 C.2–C.5](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md#L553) already owns separate Skip/Pause/Change/Cancel, bounded and indefinite pause, source-calendar resume boundaries, unchanged schedule, no debt/catch-up and control-qualified resumption. It does not prescribe the initial Pause form mode.
- [Issue 813](https://github.com/Asymmetric-al/core/issues/813)'s actual body expressly prohibits a preselected or invented duration. It owns donor lifecycle UI and exact immutable pause operations, with blockers #800/#809/#811. It is existing work to consume and reconcile, not duplicate. The body is still blocked; reading it does not certify implementation.
- Q09's ratified focused-edit workspace preserves separate Skip/Pause/Cancel. It does not choose Pause's initial resume-mode presentation. Q15 fresh restart and Q16 wallet preference rules are separate and remain unchanged.
- Phase 16's `recurring_pause_events` owns immutable open/end/supersede facts. Selected-line pauses preserve siblings through the proper cohort operation; provider synchronization/control is separate from the donor's recorded intent. No new pause table, ordinary-save charge or resurrection of canceled authorization is introduced.
- Current `packages/api/src/stripe/recurring.ts` maps provider paused/pause_collection into an older mirror status. The donor pledges UI can display a paused label. Neither observation proves the full future D5 pause command, exact provider suppression or the completed donor journey.

These source ownership rules are **Durable patterns**. A versus B is a new presentation choice. The old default-month hold and a generic provider-status toggle are not an acceptable foundation for the target journey.

## Stripe check: no provider shortcut or impossibility claim

Latest official Stripe documentation was consulted through the Stripe documentation workflow. The inspected repository pins Stripe Node 22.2.0 and API 2026-05-27.dahlia. Current docs describe multiple distinct concepts: pausing collection, actual subscription pause and resume. The newer actual-pause flow is a preview with its own API/billing constraints; its existence does not qualify it for Core's current pin or exact connected-account topology. Do not claim Stripe can never pause, and do not adopt a preview or change billing mode merely to decide this form's layout.

[`pause_collection`](https://docs.stripe.com/billing/subscriptions/pause-payment) does not itself change subscription status, and prior invoices may still retry. [Subscription resume](https://docs.stripe.com/api/subscriptions/resume) has billing-anchor/invoice/proration behavior that cannot silently replace P16's unchanged-grid, no-extra-charge/no-debt semantics. [Actual subscription pause](https://docs.stripe.com/billing/subscriptions/pause) needs its own version/capability qualification. Exact owner suppression/resume and current authorization remain mandatory regardless of A or B.

No connected-account read, payment, provider mutation or new target test ran for this question. Earlier limited account observations are not treated as current capability proof. This question changes neither payment architecture nor mandatory provider proof; it chooses how donors express an already supported instruction.

## What this question does and does not settle

The choice settles only the initial resume-mode presentation in Pause. Both choices keep explicit donor input, empty dates, current source previews and safe effective-time handling. It does not re-open whether indefinite pause is allowed, require a fixed month limit, move the giving schedule, create a new email/bell notice, make pause a cancellation detour or promise provider stop before evidence.

Post-answer review must resolve the complete selected journey: start/boundary input, exact next eligible occurrence, end-date interactions, same-day/claimed payments, long/indefinite pauses, selected siblings, early/manual resume, expired authorization, provider uncertainty, reload/concurrency and accessible date entry. These are source-bound execution requirements to examine, not reasons to replace the accepted domain with a UI shortcut. Q14 G01 and wider Phase 25 proof remain open.
