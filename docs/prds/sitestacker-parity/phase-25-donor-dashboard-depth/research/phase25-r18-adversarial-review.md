> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Ratified, 8 September 2026:** Conrad explicitly accepted Question 18’s corrected execution—A1–A5/J01–J16/V1–V10/C01–C22—including the same-day ordinary-gift, pending-activation pause and final-horizon clarifications. T01–T18 remain required target proof. Earlier provisional wording below records review history; ratification does not certify implementation or live behavior.

# Question 18 — Clear, calm pause and resume giving

**Disposition: Accept with required amendments.** Conrad selected A: present both resume choices together. Preserve that choice and adopt the corrected journey below. The additional execution defaults and explicit owner-contract amendments await founder ratification.

Research date: 8 September 2026. This is a grooming review and decision record, not a PRD, formal specification or implementation ticket. Questions 01–17 remain ratified. No source, GitHub or live-provider changes are authorized. Evidence is distinguished as repository intent, inspected implementation, current primary documentation, product judgment or unproved target behavior.

## Corrected decision

> A new Pause giving form presents two equally clear, initially unselected choices: Resume automatically on a date, or I'll resume it myself. Show Starts now with a quiet Change start date control; selecting automatic resume reveals an empty Pause ends field. Keep the ordinary journey in one compact Maia workspace with a concise current review and one consequence-based final action. Explain the affected gifts, effective start, any gifts before the pause, the pause end or manual return, and the actual next eligible scheduled gift separately. Pausing preserves the existing giving schedule, final end date, historical money and permissions. Resume uses current owner authorization and control; it never creates an extra initial gift, catch-up charge or a new schedule merely because the donor clicks Resume.

An existing pause opens with its accepted mode and dates. “Neither selected” applies to creating a new pause, not editing an existing instruction or returning to the same in-progress form.

## Explicit adjustments for ratification — A1–A5

### A1 — One form, deliberate ending, visible start

Keep the selected equal-choice entry. Proposed donor labels are **Resume automatically on a date** and **I'll resume it myself**; neither is marked Recommended in the product. The first reveals an empty **Pause ends** field; the second clearly says no automatic resume date is set. Switching the proposal to manual return clears its submitted resume boundary, rather than retaining a hidden date. An unsent date can remain only as temporary form memory if returning to the dated choice makes it visible again; it never leaks into the manual command.

The normal start is visibly **Starts now**, resolved to the current civil date in the arrangement's giving timezone and confirmed in review. **Change start date** preserves the donor-chosen future start already required by #813. No start is submitted silently. For an already activated ongoing arrangement, a future start retains ongoing intent plus a derived **Pause scheduled** presentation until the interval takes effect; do not invent a new business status or claim it is already paused. Pending activation retains A4's independent state. “Starts now” affects eligible unstarted work from source acceptance, not payments already submitted or historical facts. A midnight/zone change requires refreshed preview and explicit correction where needed, not silently moving the donor's dates.

This is a proposed presentation default, not a default pause duration. The existing prohibition on preselected or invented duration remains. No mandatory survey, reason, cancellation detour or multi-page wizard.

### A2 — Review the complete effect, including future-start and short intervals

The owner preview supplies exact selected lines, amount/currency/cadence, start/end, next eligible occurrences, current final horizon, related recovery consequences, cohort/leg effects and submitted work that cannot be affected. Show **First gift after the pause** prominently and the next two eligible dates in one concise visible line, giving three dates total, or fewer with the exact end/no-future reason. For a future start, separately label **Gifts before the pause**, with source-supplied amounts, dates and regular-schedule continuation where needed. A post-pause date cannot conceal an intervening gift. Keep all material consequences visible; only supplemental history/technical detail expands. Do not independently calculate a donor total across currencies.

A future start can leave ordinary gifts before it unchanged, but accepting the pause may already close an old indivisible recovery path under P16 D5. Therefore do not promise “nothing changes until the start.” Show the actual recovery consequence only when relevant. A valid short pause with no regular occurrence inside it is allowed; say no regularly scheduled gifts fall in that period while preserving any distinct source-qualified recovery effect. Do not invent a skipped gift or force conversion to Skip.

Review can remain inside the same workspace once the current server preview is ready. Edits invalidate the old review and preserve input. Use **Pause giving** for an immediate pause and **Schedule pause** for a future start. Required proportional confirmation is one clear review/action, not stacked confirmation dialogs. Unknown provider control still permits source-owned protective narrowing where its contract allows it; the result distinguishes accepted local instruction from proved external stop.

### A3 — Resume deliberately, preserving the actual calendar

Manual or early resume opens the same owner-controlled current review. It shows the exact next eligible gift, current amount/method/cadence and any required renewed authorization. Date changes, shortening a pause, removing a scheduled future pause and switching indefinite pause to a dated automatic return are classified by the owner for increased future exposure; they are not disguised as harmless display edits.

**Explicit C.5/#813 clarification:** if a retained-grid ordinary occurrence is genuinely still eligible today, one review may separately identify and authorize that exact existing occurrence alongside resumption—for example, **Resume giving — next gift USD 50 today**. No mandatory second modal is needed. The Resume command itself creates no payment or new initial gift; only the sole qualified ordinary executor may collect the original slot after current window, authority and control proof. Exclude expired-window, terminally suppressed, missed, submitted or indeterminate slots. An elapsed or passed occurrence means its owner-certified eligibility window has ended; merely being later on the same civil day does not establish expiry. A temporary suppression can clear only while that original window and every other source condition still permit it. If today's effect cannot be qualified, preserve the pause or offer an explicitly reviewed later boundary/other existing safe route; never silently skip, re-anchor or clear a pause that would allow an unconfirmed charge. This is an owner clarification for ratification, not behavior proved in current code.

Automatic dated resumption uses the originally accepted boundary only while current authorization, method, control, end horizon and occurrence eligibility still pass. A late worker or later repaired method does not create backdated catch-up. An expired/unsafe condition becomes the exact owner status/step; do not falsely say giving resumed or manufacture another reminder program.

### A4 — Permit protective future pause during accepted initial activation

**Explicit B.5/C.4/P.1/#813 amendment:** after recurring terms and line identity are accepted, a donor may pause that arrangement's future giving while its initial ACH/payment activation is pending. Use the same immutable D5 pause events and current authority; do not add a parallel deferred-request system. An unaccepted checkout draft has no arrangement to pause.

Keep `pending_activation` while required activation proof is incomplete, with the pause interval folded independently. The initial payment retains its independently evidenced status; Pause neither recalls it nor freezes its outcome. Only after required initial-success, reconciled-binding and current-control/activation proof passes may the line leave pending activation: the locked fold yields paused if its interval is active, ongoing if eligible, or retains the winning terminal/protective state. Payment success may be recorded while activation proof remains pending. Ending or shortening a pause while activation is still pending does not complete activation, retry the initial gift or enable an executor.

Every future-leg provisioning, activation, claim and provider submission must honor the same current line/cohort/pause/authority fence. Existing future executors must remain proved non-charging until both activation and current pause/control eligibility allow them. This closes a genuine missing transition in the current source contract while preserving the warm ACH submission experience ratified in Q16.

### A5 — Make the existing final horizon effective in every live state

**Explicit B.8/P.1 reconciliation:** the final eligible horizon fences new collection in every state. When that inclusive horizon passes, otherwise eligible ongoing, paused or pending-activation intent becomes **Ended as scheduled**; it never overwrites `cancellation_requested`, `canceled` or `superseded`, their prior cause, or required provider-stop-pending presentation. Initial/payment/control reconciliation can remain independently pending. A payment already submitted in time may settle or be corrected later without reopening giving. Reconcile P.1's narrower ongoing-only/all-occurrences-resolved wording and related twice-monthly wording so execution cleanup is not mistaken for permission to collect after the agreed end. Reaching the horizon does not itself prove an external executor stopped.

A pause ending after the final horizon can be a valid suppression instruction, but cannot promise future resumption or extend the commitment. Review says **No further gifts are scheduled before this arrangement ends** where proved. A proposed pause start after the horizon cannot pretend to control a live future series; preserve input and explain the existing end. Keep Cancel and Restart distinct; ended/canceled giving never resumes old authority in place. This amendment changes transition clarity, not historical money or donor authorization duration.

## Primary research and pattern classification

<!-- prettier-ignore -->
| Evidence | What is useful | What Asym must not inherit |
| --- | --- | --- |
| [Donorbox donor pause/resume help](https://donorbox.zendesk.com/hc/en-us/articles/360020560231-How-do-I-pause-cancel-or-resume-recurring-donations-as-a-donor), published update May 2025 | **Useful precedent:** Pause is a direct plan action and Resume appears when the donor returns. | The article does not prove every timing/authority rule or current Asym behavior; its visual buttons and provider blanket-stop wording are not our contract. |
| [Fundraise Up portal configuration](https://fundraiseup.com/docs/donor-portal-configuration/) and [supporter guide](https://fundraiseup.com/docs/donor-portal-guide/) | **Useful precedent:** clear bounded break and automatic resumption. | Preset duration/12-month limit, cancellation retention sequence and resume semantics do not override P16. No marketing retention statistic is adopted. |
| [Givebutter recurring guide](https://help.givebutter.com/en/articles/4529176-how-to-edit-and-manage-your-recurring-donation), June 2026 | **Useful precedent:** a named gift summary and understandable date entry. | **Conflict with accepted Asym architecture:** its custom pause example changes future charge dates. Asym Pause preserves the grid; Q09 Change owns re-anchoring. |
| [Church Center giving management](https://help.planningcenter.com/en/140951-manage-your-giving-information.html), September 2026 | **Useful precedent:** pause belongs in ordinary donor management alongside history and planned giving. | The inspected guide does not establish its initial pause-mode selector or all indefinite rules; do not invent them. |
| [Blackbaud pause/resume help](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/tcs/content/contrib-onhold-plans-rc.html) | **Useful CRM precedent:** staff acting on donor instructions can distinguish dated pause from indefinite hold and view next expected installments. | Staff-only workflow, installment caps/placeholders, proactive outreach and CRM status mapping are not donor UX or Asym truth. |
| [Shopify Subscriptions customer experience](https://help.shopify.com/en/manual/products/purchase-options/subscriptions/shopify-subscriptions/customer-experience) | **Useful precedent:** direct Manage, Pause, Resume and clear confirmation inside the existing account. | Store orders, fulfillment/access rights and universal immediate-stop claims do not map to already-submitted donations or our provider proof. |
| [Netflix pause guidance](https://help.netflix.com/en/node/407), [Buy Me a Coffee pause guide](https://help.buymeacoffee.com/en/articles/15472241-how-to-pause-your-membership) | **Useful precedent:** explain the break and what happens when it ends. | **Conflict if copied:** early resume may start billing immediately/re-anchor; preset limits, one-time-only pause, canceled content access and reminder emails are not giving rules. Pausing support does not itself revoke Ministry Updates access. |
| [GOV.UK radios](https://design-system.service.gov.uk/components/radios/), [date guidance](https://design-system.service.gov.uk/components/date-input/), [WAI financial-error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html) | **Useful precedent:** deliberate choice, readable inputs, check/correct before consequential submission. | No imported visual system, demand for a confirmation per keystroke, birth-date-style form for every future date, or copied ARIA demo as production proof. |

**Durable patterns:** one source-owned civil-date kernel, immutable pause facts, current permission, one executor, explicit financial authority and truthful operation results. **Implementation accidents:** treating a legacy provider-mapped paused flag or a screenshot as the donor's whole pause. **Product judgments:** equal choice, visible Starts now, same-workspace review, wording and progressive disclosure. No observed Asym study establishes an optimal default or measured retention uplift.

## Fully mapped journey — J01–J16

<!-- prettier-ignore -->
| ID | Donor journey and exact outcome |
| --- | --- |
| J01 | **Open the right gift.** Enter Manage → Pause from the currently authorized personal or represented gift detail. Resolve exact Tenant/human/Party/grant/line scope; preserve targeted sign-in return. No broad pause-all or shared-wallet inference. |
| J02 | **Recognize new versus existing work.** A new pause has neither ending mode selected. An existing/scheduled pause loads accepted values through Edit pause. Re-entry after submission opens the same durable operation/result, not a blank duplicate. |
| J03 | **See the start.** Starts now is visible with Change start date. A future date reveals the first ordinary gifts that remain before the pause. Use arrangement timezone; past-date or expired-Today input is corrected with current preview, never silently adjusted. |
| J04 | **Choose the ending.** Select automatic date or manual return. Only dated mode shows the date field. No monthly default, preselected duration, vague blank-means-indefinite rule or mandatory reason. |
| J05 | **Enter a date comfortably.** Support typed date and calendar, explicit locale format, keyboard navigation and long-year navigation. Validate real civil dates and `resumes_on > starts_on` for a new bounded open interval. Do not impose the calendar widget's incidental year range as a product limit. |
| J06 | **Understand the current effect.** Read start, ending mode/date, exact affected gifts and three source-qualified post-pause dates, or fewer with the reason. Separately label Gifts before the pause for a future start. Show a real in-flight payment or recovery-path consequence only when applicable. Short intervals with no ordinary gift are truthful, not fabricated skips. |
| J07 | **Review and apply once.** Use one current, editable check-answers region and consequence-based action. Apply revalidates authority, revisions, intervals, occurrences, end and provider plan. Input edits or drift invalidate stale financial review. Closing before acceptance does not apply this pause proposal; any separately accepted provider setup/authorization effect keeps its own truthful status. |
| J08 | **Receive an honest result.** Distinguish Pause scheduled, Paused, and Pause requested — being confirmed, with exact partial-child outcomes if needed. Local acceptance is not proof every external leg stopped. A lost response opens Check pause status for the same operation. |
| J09 | **Leave confidently.** Return to the gift, Home or Ministry Updates. Confirmation is durable without a new email/bell message. Preserve Q17's limited catalog, Q07 preferences and existing documents/history. |
| J10 | **Handle initial bank processing.** For an accepted pending-activation line, show the initial gift's processing status separately from future pause instruction. Late initial success cannot override current pause/cancel/end. A new unaccepted draft receives no invented pause. |
| J11 | **See ongoing paused/scheduled status.** A future pause does not label today's giving Paused. An active manual pause displays Paused until you resume; when applicable add This recurring gift still ends on [date]. A dated pause shows pause end and actual next gift separately. Pending activation and required control issues remain independently visible; normal pause is not an arrears warning. |
| J12 | **Change the pause.** Open current accepted dates/mode, preserve immutable original history and preview the changed scope. Extending/restricting and shortening/resuming use their correct authority. Remove scheduled pause means ending that future interval, not canceling giving or deleting history. |
| J13 | **Resume manually or early.** One fresh review shows exact next eligible gift and required authorization. Today's still-eligible ordinary slot is separately named and authorized in the same review under A3; no hidden extra payment. Expired-window or otherwise ineligible slots are never resurrected. |
| J14 | **Resume automatically.** At the chosen boundary, the source rechecks current intent, authorization, method, control, end and occurrence. Success restores eligible ordinary scheduling without grid drift. A missing proof shows exact current status/step; it creates no catch-up or arbitrary new date. |
| J15 | **Honor the agreement's end.** Passing the existing final horizon fences future giving even during pause/activation. Otherwise eligible intent becomes Ended as scheduled; prior cancellation/supersession cause and required external-stop warnings remain. Any earlier payment retains independent outcome truth. No end extension, old-authority restart or fictional fixed-pledge fulfillment. |
| J16 | **Recover from interruption or concurrent change.** Two tabs, mobile/network loss, expired session, stale provider events, cancel/claim races and partial legs return one durable result with current safe actions. Preserve the donor's latest valid instruction; no blind replay, duplicate executor or fake Undo. |

## Reviewed Maia defaults — V1–V10

<!-- prettier-ignore -->
| ID | Presentation default |
| --- | --- |
| V1 | One shared base-maia task workspace with current gift context and readable hierarchy. Preserve Base UI, Zinc semantic variables, existing radii/spacing/type and shared component ownership. No app-local UI fork. |
| V2 | Visible Starts now and quiet Change start date. Two equally prominent ending choices; no option labeled Recommended for the donor. No card wall, guilt copy, countdown, donation upsell or profile-completion prompt. |
| V3 | A proper labeled RadioGroup/FieldSet for the mutually exclusive ending instruction. Reveal the dated field in place. Existing pause edits show current accepted values; a new pause does not borrow a previous unrelated choice. |
| V4 | Date input plus accessible calendar affordance, explicit locale and giving timezone. Preserve valid text while typing; do not silently parse ambiguous input using browser locale. Calendar navigation is not date selection; month/year defaults do not become authority. |
| V5 | Review distinguishes Pause starts, Pause ends/Until you resume, Gifts before the pause when relevant, and First gift after the pause plus the following two eligible dates. Material end/payment/recovery consequences stay visible; supplemental detail may expand without changing instruction. |
| V6 | One clear final action: Pause giving, Schedule pause, Save pause changes or the exact named Resume outcome. No generic Confirm or double-confirmation maze. Required financial or provider authentication remains inside the owner journey. |
| V7 | Quiet, stable input and loading states. Field errors link to an error summary; changed preview is explained. Avoid disabling the entire management surface merely because an unrelated Change proposal is invalid. Direct protective cancellation remains reachable. |
| V8 | Durable result with source-qualified status and normal exit. Use Pause requested — being confirmed for unknown external effect, not an all-green stopped claim. No email/bell arrival promised unless the actual existing contract permits it. |
| V9 | Mobile-first shared layout with accessible focus, Back/close behavior, 320-CSS-pixel reflow, 200% text/400% zoom checks and Core's 44px touch targets. Calendar cells/labels and buttons must actually meet the target; stock dimensions alone do not prove it. |
| V10 | Respect reduced motion, no focus theft on preview changes, no moving submit target, and restrained polite announcements. Dates, money, required steps and errors never rely on color, icons, hover or a disappearing toast alone. |

## Adversarial check

### What could go wrong with this answer?

The form could look clear while applying a hidden date, shifting the schedule, pausing siblings, restarting after cancellation or falsely claiming a bank payment stopped. Current source previews and exact lifecycle/provider fences are essential.

### What hidden assumptions are we making?

Two radio choices do not complete pause/resume. Start timing, existing pauses, pending activation, same-day eligible gifts and the original end date all need explicit treatment. No comparative Asym donor study has proved these defaults optimal.

### How does this affect the whole product?

P16 remains the recurring owner; P13 owns money, P7/18/19 documents, P6/17 communications and P3/4/9/10/12 access. Missionaries see safe source pause truth without control rights. Ministry Updates and preferences remain independent.

### How does this affect the end-user experience?

The normal journey remains short, with the actual next gift visible. Relevant exceptions appear only when they apply. A donor can leave after a durable instruction and return without repeating or accidentally reversing it.

### Does this follow modern best practices?

Yes: explicit choices, direct management, preserved input, meaningful confirmation and accessible date entry. Subscription billing defaults, retention mazes and access-loss rules are not imported as giving rules.

### Does this fit Asym’s existing repo and product direction?

Yes, with A3–A5 explicitly amending incomplete lifecycle wording. The accepted model is richer than the legacy provider-mapped pledge status; that implementation must not dictate the target.

### Should we adjust the recommendation?

Keep A. Ratify the complete execution and narrow source amendments rather than only the selector. Implementation and provider/PostgreSQL/browser proof remain required; this review does not certify them.

## Individual category review — C01–C22

Severity describes the consequence if the uncorrected design is implemented; likelihood is qualitative exposure, not an observed production rate. Each category was independently considered. Material concerns below are requirements to address, not a claim of twenty-two live incidents. The quoted language is the exact proposed execution requirement; A1–A5 and the journey clarify its application.

### C01 — Problem validity, necessity and alternatives

**Material concern: yes. Severity: moderate. Likelihood: plausible without an explicit choice.** A donor needs to distinguish automatic return from deciding later. Choosing a date-led default instead is credible and saves one small selection for a known break, but assumes an intent distribution we have not measured. A new wizard or preference system is unnecessary. P16/#813 already require both modes and no invented duration. **Effect: keep A and narrow the implementation. Required language:** “For a new pause, present both ending modes with neither selected in the same workspace. Existing pause edits initialize accepted values. The mode choice is an instruction for this exact pause, not a saved personal default.” Prove both ordinary paths without a retention detour or extra mandatory page.

### C02 — Brittleness

**Material concern: yes. Severity: high. Likelihood: plausible.** Browser dates, a mutable next-charge field or one provider status can be wrong after DST, a source edit, late payment or a shared-cohort change. The donor may confirm one date while another takes effect. ADR-0017/P16 make the calendar source independent. **Effect: requires source-calculated preview. Required language:** “Resolve dates, current scope and next eligible occurrences through the versioned P16 kernel using the frozen giving timezone. Revalidate at acceptance and external admission. Preserve the donor's input and show changed consequences instead of silently normalizing or reusing a stale preview.” Test timezone/day boundaries, changed epochs, delayed webhooks and multiple cadences.

### C03 — Technical debt

**Material concern: yes. Severity: high. Likelihood: likely if the legacy pledge is extended.** Current code maps provider paused/pause_collection to one status, and paid invoices can mark a noncanceled pledge active. That cannot represent scheduled pause, independent activation, exact intervals and all-leg proof. New donor-local pause flags would create another authority. **Effect: change the implementation foundation, not A. Required language:** “Use the existing forward P16 command, pause-event, epoch, occurrence and control model. Retire the legacy mirror as an authority at cutover; do not dual-write it or add a route-level Stripe pause toggle.” Current source behavior is inspected evidence, not a live incident claim.

### C04 — Edge cases

**Material concern: yes. Severity: high. Likelihood: plausible.** Same-day start/resume, no grid gift inside a short interval, end before resumption, an already scheduled pause, a processing initial bank gift and two different line schedules defeat a simple date-picker implementation. **Effect: expands the mapped journey, not the product into a new scheduler. Required language:** “Handle J01–J16 explicitly. A new bounded open event has a later resume date; an early same-day end appends its own ended event. A valid short interval need not suppress a regular gift. Never extend an end date or fabricate a future occurrence merely to populate review.” Verify each boundary and exact source reason.

### C05 — Footguns

**Material concern: yes. Severity: high. Likelihood: plausible.** A hidden old date can survive manual-mode selection; closing a result can be mistaken for Undo; removing a scheduled pause can restore collection without authorization; generic Resume may permit a charge today. **Effect: tightens controls and payloads. Required language:** “Validate one unambiguous mode and the whole proposal. No GET, calendar click, mode switch or modal close mutates giving. Removing/shortening a pause is a source-classified command, not deletion or harmless undo. Name and authorize any still-eligible same-day scheduled gift explicitly under A3.” No generic Confirm or auto-submit substitutes for exact intent.

### C06 — Tenant safety

**Material concern: yes. Severity: critical. Likelihood: plausible in multi-role/represented use.** A shared login, method or household could accidentally pause another donor's gift; cached line details could cross Tenant or Site context. P3/4/9/10/12 and Q04 deny implicit authority. **Effect: preserves exact ownership. Required language:** “Derive Tenant, human actor, Party instruction, financial authorizer, selected line scope and current grants from trusted server context. Resolve entity/account/binding and current safe labels through the owning records. Do not infer all gifts or expose unauthorized sibling details from shared billing.” Test cross-Tenant, represented-only, shared-email and shared-method poison cases on every read/mutation/result path.

### C07 — Database, RLS and authorization safety

**Material concern: yes. Severity: critical. Likelihood: certain target-proof gap; plausible implementation failure.** Target pause/command services are not established as implemented. Loose same-Tenant relations, mutable events, permissive RPCs or a naïve exclusion constraint over all historical opened intervals can either corrupt authority or prevent valid edits. Superseded immutable intervals legitimately overlap physically. **Effect: requires the single serialized owner and real database proof. Required language:** “Use non-null typed identifiers, same-Tenant/same-line composite references, immutable event history, unique semantic command identity and CAS projections. Serialize the effective interval fold; any derived current-range guard is rebuildable, not a second source. Prove grants, RLS, USING/WITH CHECK and privileged paths; donors cannot reassign actor, line, policy, interval history or authority through updates.” PostgreSQL may inherit USING as WITH CHECK; test effective behavior rather than falsely treating missing literal syntax as proof of exposure.

### C08 — Overengineering

**Material concern: yes. Severity: moderate. Likelihood: plausible.** A generic pause workflow engine, arbitrary duration configuration, new reminder cadence, reusable draft platform or separate schedule model would make a small self-service task expensive to support. **Effect: narrows implementation. Required language:** “Compose the existing owner commands and shared Maia fields in one task workspace. Do not add a duration DSL, new queue/executor, per-donor pause preference, marketing-retention workflow, browser-push channel or new support case product.” Extend current accepted pause records through normal commands; do not create multiple future-pause planning features solely because interval tables could support them.

### C09 — UX/UI and user friction

**Material concern: yes. Severity: high. Likelihood: likely with ambiguous dates or warning-heavy design.** Resume date can be mistaken for next charge; forced calendars and hidden manual return frustrate uncertain donors; preselected choices and small targets cause mistakes. Primary form guidance supports deliberate choice and error prevention, not duplicate dialogs. **Effect: adopt A1/A2, J01–J16 and V1–V10. Required language:** “Keep the ordinary choose→review→apply journey compact; show start/end and actual next gift separately. Typed and calendar entry are equivalent, existing values persist on edit, and only relevant exceptions appear. Preserve exact base-maia and accessible target/focus/label/locale behavior.” Required material effects cannot be concealed in an optional expansion.

### C10 — Source of truth, ownership and domain invariants

**Material concern: yes. Severity: critical. Likelihood: plausible.** A provider event, UI boolean or payment success can overwrite pause/cancel intent. Pause could incorrectly mint debt, move anchors or affect receipt facts. ADR-0001/0017 and P16 intentionally separate these axes. **Effect: requires strict source boundaries. Required language:** “P16 owns instruction, interval, epoch, occurrence, current authority and control folding. Stripe owns execution evidence; P13 owns money. Paused/suppressed dates never become catch-up debt. Payment success alone cannot resume future giving or extend a horizon, and it cannot change consent. Document issuance follows its independent owning money/receipt contract.” Assert zero incidental money/document/default/consent effects from pause/resume commands.

### C11 — Hidden coupling

**Material concern: yes. Severity: high. Likelihood: plausible.** A pause might depend on a successful email, one active widget or a Stripe customer default; a paid-membership precedent might revoke Ministry Updates when donations pause. These are unrelated owners. **Effect: separates the journey from its surrounding surfaces. Required language:** “Durable protective intent and results do not depend on communications delivery. Q07 feed/email choices, Q16 wallet preference and Q17 bell admission remain independent. Missionary support views consume safe P16 state without action rights. An invalid Change editor does not obstruct direct protective Pause/Cancel.” Ordinary pause alone is neither a new content-access revocation nor proof of support arrears.

### C12 — Failure modes

**Material concern: yes. Severity: critical for duplicate or unintended collection. Likelihood: plausible.** Provider stop can partially succeed or succeed before a lost response; a worker can crash between local acceptance and all-leg suppression. Blind retry or a false Paused banner misleads the donor. **Effect: requires durable exact recovery. Required language:** “Commit local intent/history and required outbox work atomically at owner grain. Execute exact scoped provider child operations outside the transaction with idempotency/readback. Unknown means being confirmed, not failed/no-effect. Re-entry reads the same operation; do not recreate, compensate or reactivate automatically. Complete status requires all affected legs and source guards.” Keep urgent safe-stop operations available through the correct owner even during reconciliation.

### C13 — Lifecycle, time, concurrency and idempotency

**Material concern: yes. Severity: critical. Likelihood: plausible, with confirmed contract gaps.** Pending activation can later become ongoing over a new pause; end processing can overlook paused states; two tabs can create overlapping pauses; shortening can unexpectedly admit today's gift. **Effect: explicit amendments A3–A5 plus current fences. Required language:** “All activation, pause, resume, claim, cancel and horizon folds share current source/authority revisions and deterministic lock order. Pending activation retains its own truth while accepting protective pause facts. Terminal stop/end guards outrank late success and resume. Original operation identity survives retries; changed meaning under the same identity conflicts.” Test both race orders with real transactions, not only isolated state reducers.

### C14 — Data integrity risks

**Material concern: yes. Severity: high. Likelihood: plausible.** Duplicate opened events, a cross-series end, erased superseded intervals or differing line/epoch disclosures can produce gaps, overlaps and incompatible cohort execution. **Effect: fixes structural prevention. Required language:** “Opened/ended/superseded events reference the same Tenant/line/series and immutable command. Reject cycles/self-reference/conflicting ends; append corrections instead of rewriting history. The effective fold admits no conflicting active intervals. Cohort split and every exact leg/item binding preserve selected versus continuing siblings and each line's calendar.” A source-derived header or active-range index can be rebuilt without losing the instruction.

### C15 — Security and privacy risks

**Material concern: yes. Severity: critical. Likelihood: plausible.** Confirmation URLs, diagnostics, cached previews or staff/missionary projections can reveal restricted ministry/payment/representative information. A short-lived preview may be treated as a durable grant. **Effect: requires minimized and reauthorized access. Required language:** “Use opaque typed operation locators with fresh server authorization; no provider tokens, raw bank/card data or secrets in routes/logs/browser persistence. Apply current field visibility to list, preview, confirmation, cache and help. Preserve accepted facts without presenting stale forbidden fields. Preview expiry or a login return authorizes no new apply.” Pausing remains available only to the exact authorized actor; shared email, recognition or past donation is insufficient.

### C16 — Scalability and performance risks

**Material concern: yes. Severity: high for late protective work. Likelihood: plausible at boundary/incident load.** Month boundaries, many paused lines, two-leg schedules and tenant-wide provider incidents can delay stops, expand all future occurrences or turn one preview into many synchronous network calls. P16 S.4/S.5 defines bounded performance objectives. **Effect: requires measured shared-worker behavior. Required language:** “Project bounded next dates without materializing infinity, index due boundaries and exact scope, prioritize protective work, and batch within owner/provider limits. Meet existing local preview/acceptance and claim-window budgets under production-shaped load. Never weaken current proof to meet latency.” Do not introduce partitions/distributed systems without measured need.

### C17 — Operational burden

**Material concern: yes. Severity: high. Likelihood: likely if unknown provider states require manual database repair.** Staff would need to infer whether a pause applied, clear stuck flags or call donors about ordinary pauses. **Effect: requires inspectable existing owner recovery. Required language:** “Expose source intent, operation/result, exact pending child and safe next owner action in Mission Control. Normal scheduled boundaries and resumption are durable owner work, not donor reminders or staff calendar tasks. No direct SQL/provider-dashboard ‘fix and mark done’ bypass. Any unavoidable external intervention returns through evidence/reconciliation.” Retain clear pause truth in missionary views without assigning outreach automatically.

### C18 — Observability and auditability gaps

**Material concern: yes. Severity: high. Likelihood: plausible.** A successful button event or provider response cannot prove exact local instruction, all-leg stop or no post-pause collection. Without linked evidence, money errors become hard to diagnose. **Effect: requires separate audit and operational signals. Required language:** “Trace actor/authority, accepted before/after terms, civil dates/zone/rules, line/cohort/occurrence, semantic command and provider child evidence. Append result/reconciliation facts. Distinguish pause accepted, provider suppression proved, pause effective, resume authorized and payment outcome. Emit privacy-safe reason codes and named alerts without storing private preview bodies in telemetry.” The monitor table below assigns threshold, owner and response.

### C19 — Dependencies and integrations

**Material concern: yes. Severity: critical for unsafe provider mapping. Likelihood: plausible.** Stripe's collection pause, actual-pause preview and Resume API have different effects; old invoices may retry, credit balances can be consumed and resumption can reset anchors or create invoices. Current documentation does not qualify Core's pin/accounts. **Effect: requires the existing adapter and proof, not new payment architecture. Required language:** “Use only exact P16-qualified account/mode/rail/leg operations that preserve the source instruction, no catch-up/proration and current authorization. Do not set blind provider auto-resume timestamps or adopt preview APIs merely for UI convenience. Keep customer/default-method and notification state separate.” New provider capability is qualified explicitly; no categorical Stripe-cannot-pause claim.

### C20 — Migration, rollout and upgrades

**Material concern: yes. Severity: critical. Likelihood: likely if legacy mirrors coexist as writers.** An old invoice-paid handler could reactivate paused giving after cutover; import/backfill could create fake intervals or authorize resumed collection. P16's fresh-build posture calls for replacement, not permanent compatibility. **Effect: requires one-way cutover and safe rollback. Required language:** “Land new schema/readers inert, classify legacy evidence, shadow without financial effects, reconcile exact control and switch one writer. Never translate provider paused status alone into donor-authorized intervals. Rollback blocks new widening/execution and preserves additive journals; it does not revive old writers or executors.” Migrations and mixed-version handlers must prove pause/cancel/end precedence before activation.

### C21 — Testability, traceability and proof

**Material concern: yes. Severity: critical release-evidence gap. Likelihood: certain until target work is implemented.** Current target command/event/kernel paths were not found as complete runtime. A screenshot, mock or passing legacy webhook test cannot establish donor intent or authorization/concurrency. **Effect: requires T01–T18, not rejection of A. Required language:** “Trace A1–A5/J01–J16/V1–V10/C01–C22 into the owning ADR/OpenSpec/PRD changes, reconciled predecessor work, source tests and release evidence after explicit publication authority. Require real PostgreSQL poison/concurrency, calendar properties, exact provider-contract cases and accessible composed donor journeys. Report unrun proof honestly.” No synthetic assumption check is a substitute for the target.

### C22 — Other development hazards

**Material concern: yes. Severity: high. Likelihood: plausible.** Terms such as Pause until, Skip, Resume, Ended, All paused or No charge today can hide materially different effects. Calendar demo limits or old skill boilerplate can become accidental policy. **Effect: requires final artifact consistency. Required language:** “Use Pause ends for the exclusive resume boundary and Next scheduled gift for the actual occurrence. Keep named Skip, no-schedule-change Pause, schedule-edit Change and fresh Restart distinct. Do not claim initial money recalled, future collection active, or no charge today without exact evidence. Keep proposed amendments distinguishable from ratified/current/runtime facts.” Review final names, transitions, numbers and source references mechanically and independently before ratification.

## Concrete review examples and difficult cases

These are illustrative source-contract scenarios, not actual donor records or executed Core tests.

**Ordinary dated pause.** Maria's USD 50 gift runs on the 15th, with no end date, pending payment or recovery issue. On 8 September 2026 she selects an immediate pause ending 10 November:

> **Review your pause**  
> [Currently safe gift/ministry label] · USD 50 monthly  
> Pause starts: **Now, 8 September 2026**  
> Pause ends: **10 November 2026**  
> First gift after the pause: **USD 50 on 15 November 2026**  
> Then: **15 December 2026 and 15 January 2027**  
> The 15 September and 15 October gifts will not be collected later.  
> **Pause giving**

**Manual return.** The same form shows no invented date after I'll resume it myself. Review says the gift stays paused until the donor resumes it; when an existing end applies, also show that exact end. There is no speculative Next gift while indefinite pause is effective. The later Resume review computes the current eligible dates and required authority anew.

**Future start.** Maria instead starts the pause on 20 October and ends it on 10 December. Review separately says the regular 15 September and 15 October gifts remain scheduled, the 15 November gift is suppressed, and the first post-pause gift is 15 December, followed by 15 January and 15 February if eligible. Do not call 15 December the unqualified next gift while September/October are still scheduled. If old recovery is also affected at acceptance, show that actual additional consequence.

<!-- prettier-ignore -->
| Case | Required permanent behavior |
| --- | --- |
| New bounded start and end are the same day | Reject the zero-length opened interval with a linked error and retain input. Ending an already accepted pause on that same day is a separate ended event, not an invalid replacement open event. |
| No regular gift inside a valid short interval | Keep the valid instruction; explain the lack of normal scheduled gifts without inventing one. Preview any other source-qualified recovery/collection effect. |
| Pause ends on a day with no regular gift | Show the first eligible original-grid date separately; do not re-anchor to the pause end. |
| Original grid date is today | Only a still-eligible unsubmitted occurrence can be named in the A3 financial review. Expired-window/closed/indeterminate work remains ineligible; no blanket No charge today or automatic next-month skip. |
| Final date lies within the pause | The original end remains; no later gift is promised. Apply A5's terminal precedence and keep late financial/control outcomes separate. |
| First bank gift is still pending | A4 records protective future intent while retaining activation and payment truth. Its receipt or future activation is not inferred from Pause. |
| One leg of a two-leg arrangement cannot be proved stopped | Record the exact local instruction; show incomplete provider confirmation. One successful leg does not make the whole reviewed pause complete. |
| Changed provider/customer/method after preview | Re-resolve exact original binding/context and authorization. Do not silently switch accounts, change the wallet default, use a fallback card or replay a stale operation. |
| Existing pause is extended, shortened or switched | Load current accepted values, classify the complete change, append history and obtain required authority. Never overwrite the original interval or apply a hidden date from another mode. |
| Two actors/tabs change or cancel at once | Current revision/authority determines acceptance; stale input gets a clear current review. Cancellation and required safety guards win before every unstarted effect. |
| Source/provider timeout | Distinguish unavailable preview, accepted local pause and unknown external effect. Check the same durable operation; no blind re-create, false failure or fabricated safe-stop claim. |
| Donor loses access or session expires | Reauthenticate and reauthorize the exact return destination. A bookmarked confirmation is a locator, not a grant. Hide unsafe current fields without erasing the source instruction. |

## Source-owned model and database obligations

### One permanent path

Use the forward P16 models already owned by predecessor work: recurring group/line terms and epochs, `recurring_pause_events`, `commitment_commands` and immutable command results, occurrences/suppressions, authorization references, cohort/leg bindings and provider-control child operations. Browser state represents an unaccepted proposal only. Donor routes stay thin and business logic remains in `packages/api`. No new pause ledger, mutable schedule JSON, client-authoritative timer or second recurring executor.

A bounded interval is `[starts_on, resumes_on)` in the arrangement's frozen giving timezone; indefinite has no upper pause bound. Final collection eligibility still has its independent inclusive horizon. Store civil dates as dates and actual acceptance/effect/provider evidence as appropriate UTC instants. Do not use elapsed milliseconds to mean a civil month or silently substitute browser timezone. The pure kernel and versioned timezone/resolver provide exact occurrence windows.

### Constraints that make invalid states hard to create

- Require typed non-null Tenant, line, series, command and event identity where applicable, with same-Tenant/same-line composite foreign keys for predecessor/series/command/epoch and exact entity/group compatibility through owners. No default Tenant or caller-supplied authority.
- Closed event kinds are opened, ended and superseded. Opened requires start; a finite resume boundary is strictly later. End/supersede requires a valid same-series predecessor and effective evidence. Reject self-reference, cycles, conflicting terminal transitions and cross-line references.
- Events are immutable. Current header, interval-fold cursor and any active-range guard are CAS projections written only by the same finalizer. Historical superseded opened intervals remain evidence, so a blanket exclusion constraint over all opened rows is incorrect. Serialize the effective fold and, where useful, constrain only the source-owned derived current ranges.
- A unique durable semantic command identity binds actor/scope/exact requested meaning. Replay returns the same accepted result; reusing identity with changed meaning conflicts. Event sequence/revision and predecessor constraints prevent duplicate opens or unexplained ends. Do not rely solely on a short provider idempotency window.
- Atomically persist accepted subjects, pause history, expected revisions, frozen preview/authorization references, immutable result and required outbox effects at the existing command grain. Lock group/line/cohort/claim subjects in a deterministic shared order. Provider network calls occur outside the transaction through durable exact child operations and readback.
- ENABLE/FORCE RLS and explicit least-privilege grants belong in the same target migration. Default-deny direct donor writes to authority tables; narrowly authorized server commands own changes. Verify old-row USING, new-row WITH CHECK, immutable-column restrictions and all combined policies. Service-role/definer operations still require current actor/scope proof and restricted execution/search path. A donor cannot convert an allowed update into a different recipient, line, event series or authority state.
- Preserve financial facts, original currencies/minor units, documents and source references. Avoid cascading deletion of authoritative history. Follow P16's source/audit retention with applicable stronger holds; Q17's short notification windows do not govern pause history. Do not retain browser drafts or raw provider payloads for that entire source lifetime.

These constraints follow Core's owner architecture and PostgreSQL's actual separation of grants, policies, constraints and transactions. SQL syntax alone is not proof of effective authorization. [PostgreSQL 17 RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html), [constraints](https://www.postgresql.org/docs/17/ddl-constraints.html), [ranges](https://www.postgresql.org/docs/17/rangetypes.html), [transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html).

### Accepted facts versus current result

The durable command result preserves what was accepted, including exact dates and affected lines. Current provider progress, authority and lifecycle are separately projected from later evidence; they do not rewrite the original acceptance. On refresh, show the historical instruction and current status clearly enough that a later cancellation/end is not mistaken for an unapplied pause. No response loss, webhook replay or restart of the UI produces another interval, executor or payment.

All source boundaries—including future pause start, automatic end, final horizon, cancel, pending-activation success, provider provisioning and ordinary occurrence admission—consult the current effective fold. A passed boundary does not depend on a successful email or frontend timer. Late workers must never submit expired work; drift remains visible for operations. If provider control cannot be qualified for widening, retain the safe pause/fence and expose only the existing qualified repair/help path. Local protective narrowing remains available under its accepted owner rules.

## Stripe: verified mechanisms, qualified adapter, no shortcut

Current official docs were retrieved with the Stripe documentation CLI on 8 September. The inspected integration remains Stripe Node **22.2.0**, API **2026-05-27.dahlia**. No account/financial action was performed; exact connected-account/rail/executor capability is not certified here.

1. **Collection pause is not the whole Asym pause.** `pause_collection` can leave subscription status unchanged and continue invoice generation; invoices created before the pause may still retry. Draft, uncollectible and void behavior have different consequences, including potential later collection or balance effects. No donor route chooses a generic void/default to simulate no debt. The adapter must prove the exact stop/suppression/retry behavior for every affected leg/item. [Stripe collection pause](https://docs.stripe.com/billing/subscriptions/pause-payment).
2. **Resume can have financial defaults.** The documented resume operation can reset the billing anchor and create/finalize an invoice or prorations. It is not a direct implementation of ordinary Asym Resume. Use the pinned, qualified operation that preserves the accepted grid and financial authorization. Clearing collection pause and resuming a status-paused subscription are different operations. [Stripe resume API](https://docs.stripe.com/api/subscriptions/resume).
3. **Stripe now also documents actual subscription pause as a preview.** This has its own flexible-billing and preview-version requirements; the inspected SDK resource has resume/update.pause_collection but no pause method. It disproves an absolute Stripe-can-never-pause claim, but does not justify a preview/API/billing-mode migration for this UI. [Stripe subscription pause](https://docs.stripe.com/billing/subscriptions/pause).
4. **Provider timers cannot bypass source checks.** A stored provider `resumes_at` or a dashboard unpause is not permission to skip current end/cancel/authorization/method/control checks. The qualified adapter must prove automated resumption is compatible or keep execution fenced until the source authorizes the exact effect. Reconciliation detects external contradiction; the provider does not own donor intent.
5. **Replay is durable business identity.** Exact local command/child-operation identity survives provider key retention. Distinguish rejected, accepted and indeterminate outcomes before retry; each leg is reconciled independently. [Stripe idempotency](https://docs.stripe.com/api/idempotent_requests), [webhooks](https://docs.stripe.com/webhooks).

General provider guidance does not override Core's accepted giving architecture. This journey consumes the existing qualified adapter; any new Stripe capability must be proved against its source-owned calendar, authorization and control requirements before adoption.

## Actual implementation and dependency register

<!-- prettier-ignore -->
| Reference | Inspected fact / required disposition |
| --- | --- |
| Develop | `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`; current remote verification and preservation checks recorded with this review. Accepted intent is not implemented/live proof. |
| ADR-0001 / Phase 1 ownership matrix | Asym/Postgres owns CRM/recurring business truth; P16 services own lifecycle and Stripe execution evidence remains separate. No Twenty/CRM side store. |
| ADR-0017 / P16 | Civil-date kernel, fixed giving timezone, original grid and append-only epochs. P16 C.4/C.5/#813 already supports both pause modes and donor-chosen start; A3–A5 explicitly reconcile missing transition details. |
| Current target runtime | Searches of `packages/api`, `packages/database`, migrations and tests did not find the target pause command/event/kernel implementation as complete. Forward table names and method contracts are required owner work, not existing runtime features. |
| Legacy recurring webhook | `packages/api/src/stripe/recurring.ts:28–43` maps provider status to active/paused/cancelled. Its invoice-paid branch around 251–263 preserves canceled but assigns active for other states, including a legacy paused row. This inspected logic is incompatible with target source-owned pause; no hosted occurrence/exploit is claimed. |
| Existing tests/UI | `stripe-recurring-pledges.test.ts` verifies legacy provider mapping/canceled preservation, not the target interval/activation/concurrency contract. Pledges UI displays a paused label without proving D5 control. These tests were not rerun as misleading Q18 proof. |
| #800 / #809 | Existing provider-control fence, protect-only local posture, restore/cutover and exact external proof owners. Their current bodies were inspected. Pause/Resume cannot bypass them or add a new executor manager. |
| #811 / #813 | Existing donor detail/durable confirmation and lifecycle slices. #813 is OPEN, body-blocked by #800/#809/#811, and prohibits preselected/invented duration. Native blocked_by returned empty in the inspected graph; that discrepancy does not remove body blockers. #811 body blockers are #805–#810. No duplicate or replacement tickets were published. |
| Q18-01 | A1 start presentation and complete selected journey await ratification; both ending modes remain supported and unselected only for new pauses. |
| Q18-02 | A3 named same-day ordinary occurrence review needs explicit C.5/#813 wording and provider/authorization proof; no separate immediate gift is invented. |
| Q18-03 | A4 accepted pending-activation pause needs B.5/C.4/P.1/#813 amendment and concurrent activation/provisioning proof. |
| Q18-04 | A5 final-horizon projection and cancellation/supersession precedence needs B.8/P.1/twice-monthly wording reconciliation and proof. |
| Q14 G01 | Still unresolved in the wider phase. This review adds no authentication/claim bypass and makes no phase-wide readiness claim. |

## Measurable proof required — T01–T18

These are target release requirements, not tests run in grooming. The review's structural/date/source checks cannot substitute for actual owner migrations, PostgreSQL concurrency, exact provider contracts or donor usability evidence.

<!-- prettier-ignore -->
| ID | Required positive, negative and boundary proof |
| --- | --- |
| T01 | New immediate dated and manual pause through real donor route→API→command→events→provider control→durable result. Both modes start unselected; existing edit/re-entry preserves accepted meaning. Mode switches submit no contradictory hidden date. |
| T02 | Future-start pause before/after ordinary dates, exact pre-pause gifts, boundary activation and recovery consequences. No early broad provider pause, false Paused header or blanket nothing-changes-until-start claim. |
| T03 | Calendar properties across all eight supported cadences, twice-monthly two legs, month 31 clamp/recover, February 29, leap/DST/IANA zones, browser-zone mismatch, long dates, and exact start/end boundaries. Original grid never drifts. |
| T04 | Equal start/resume rejected for new bounded open; same-day early end appends correct ended event. Valid zero-ordinary-occurrence interval accepted with truthful effect; no fabricated skip or automatic action conversion. |
| T05 | Same-day Resume with exact still-eligible ordinary slot and named financial review; absent authority, expired-window/terminal-suppressed/missed/submitted/indeterminate slot denied. Test both an owner-certified window still open later that day and an expired window on the same civil day; clock/date shorthand cannot decide eligibility. One ordinary executor, no extra initial payment, proration, re-anchor or silent skip. |
| T06 | Accepted pending-activation pause concurrent with initial success, failure, action-required/unknown outcome, binding reconciliation, provisioning and first future window. Payment truth stays separate; no activation until original proofs and current pause/end/cancel guards pass. Draft checkout Pause denied. |
| T07 | Final eligible horizon while ongoing/paused/pending; original last-day inclusivity; two-leg completion; late prior payment success/return; cancellation_requested/canceled/superseded precedence and external-stop warnings. No new work after horizon or reopened intent. |
| T08 | Edit/extend/shorten/change-mode/remove scheduled pause with exact before/after authority classification, immutable history and current preview. No overlap, cross-series end, delete-as-undo or use of an old grant for widening. |
| T09 | Real PostgreSQL constraints/grants/RLS/functions/views with two tenants, multiple humans/represented subjects, revoked grants, wrong line/series/epoch/account and caller-spoofed actor fields. Mutations cannot transform a permitted event into a forbidden state. |
| T10 | Real concurrent transactions: pause versus claim/materializer, pause versus pause, resume versus cancel/end/control loss, activation versus pause, two provider legs and duplicate semantic ids. Deterministic lock/fence behavior preserves one instruction/effect; no race hidden by mocks. |
| T11 | Provider-contract qualification for pinned account/mode/rail/cohort topology: exact suppression/readback, prior invoice/retry handling, balances, automatic resume, one/two-leg partial result, timeout/ambiguous acceptance, external changes and rate limits. No unintended charge, debt or false stop. |
| T12 | Lost responses, browser refresh/Back, session expiry/other-user return, expired preview, removed source, late webhooks and duplicate jobs. Recover the original operation, preserve safe current access, and never issue a blind inverse/replay. |
| T13 | Full donor→staff→missionary projection coherence: exact paused/scheduled/activation/control/ended meaning; original currencies; no “behind” merely for pause; no provider/payment detail or restricted identity leakage to missionaries. |
| T14 | No incidental money, receipt/statement generation, default-method change, consent mutation, routine bell/email/reminder, Ministry Updates access loss or Support Hub task from Pause/Resume. Exact existing required notices are separately qualified positive cases. |
| T15 | Keyboard, touch and screen-reader journeys with typed/calendar dates, mode changes, review, required auth, durable result and return. Test 320-CSS-pixel layout, 200% text/400% zoom, RTL/CJK/long names, 44px targets, reduced motion and no hover-only meaning. Axe plus manual focus/comprehension evidence. |
| T16 | Representative donor comprehension: accurately state whether return is automatic, when the pause begins, which gift is next, what still processes and whether the existing end remains. Any safety-critical misunderstanding or inability to correct a choice requires design correction/retest before release. No claimed conversion statistic. |
| T17 | Existing P16 S.5 budgets under production-shaped data: pure next-three p95≤10ms/line and 100-line batch≤250ms; local preview p95≤750ms; local acceptance/protective record p95≤1s excluding asynchronous provider completion; detail p95≤500ms/p99≤1.5s. Prove due-window admission and zero post-expiry calls, with large-tenant/control-incident load. These are source budgets, not observed results. |
| T18 | Expand/classify-shadow/reconcile/switch/contract migration, mixed old/new handlers, safe kills, rollback, journal rebuild and source retention/holds. No legacy writer reactivation, forged imported pause authority or shorter audit lifetime inherited from notification UI. |

## Ruthless synthesis and order of work

**Before this execution is recorded as final:** ratify A1–A5 and the corrected journey. The chosen equal-choice direction remains sound. The visible start default, same-day combined financial review, pending-activation interval and horizon precedence are explicit product/owner refinements; do not disguise them as minor cosmetic hardening. Preserve all previous decisions, including direct cancellation and the finite Q17 bell.

**Capture in the later authorized specification/design:** reconcile exact P16 B.5/B.8/C.4/C.5/P.1 and #813 contract wording through their existing owners; retain ADR-0017 calendar meaning. Map J01–J16/V1–V10/C01–C22 and T01–T18 to concrete states, commands, fact projections, proof and current predecessor dependencies. Do not create another ADR solely for a radio choice, a new pause table or a provider-specific donor workflow.

**Implementation sequence when authorized:** complete/reuse shared calendar, immutable command/event, authorization and provider-control foundations; close A3–A5 transition/fence gaps; implement current previews/results; compose the short Maia journey; then prove the full donor/source/provider path and migration. Stop/narrowing remains available according to the protect-only contract while financial widening waits for current proof. Use existing real test harnesses, not a demonstration service built just to obtain green tests.

**Release gates:** exact actor/scope and money correctness, all affected leg proof, no post-horizon/expired effect, current authorization, full calendar properties and accessible end-to-end completion are mandatory. Missing gates cannot be moved to monitoring or bypassed through a provider dashboard/manual SQL shortcut. The review is complete; implementation and phase-wide readiness are not claimed.

<!-- prettier-ignore -->
| Monitor after gates pass | Threshold / source | Owner | Response |
| --- | --- | --- | --- |
| Post-pause/horizon/cancel prohibited provider admission, duplicate executor/payment or unauthorized scope | Any confirmed case | P16 financial-control owner + platform security as applicable | Fence affected widening/execution immediately; preserve protective stop path; reconcile exact evidence and repair through source commands. No blind refund/replay. |
| External suppression/resume mismatch or partial stop | Any contradictory exact leg/control evidence, or breach of its adopted operation deadline | Provider-control operations (#800/#809 owner) | Preserve local pause/protective truth, show truthful confirmation pending, prioritize exact readback/repair and escalate the specific source incident. |
| Local preview/acceptance latency | Existing P16 p95 budget exceeded for 15 minutes with ≥100 measurements | P16/API performance owner | Investigate indexed reads, locks, source batching and provider-refresh separation. Optimize before changing budgets; do not weaken authorization or block stop behind bulk work. |
| Boundary/worker eligibility | Any post-expiry provider call; source target 99.99% eligible claims begin within frozen window | P16 scheduling/control owner | Fence expired work, diagnose backlog/fairness/clock/rule drift and recover only still-eligible work. Never catch up elapsed paused gifts. |
| Projection freshness | Updating after 5 minutes or tighter source SLA breach; source normal p95 ≤2 minutes | Projection/portal owner | Show honest freshness, reconcile from durable facts and preserve required source warning. Do not substitute zero or declare success from cache. |
| Donor misunderstanding | Any reproduced case of unintended automatic return, confused start/charge date, hidden end extension or expectation of recalled money | Donor Portal product/design owner | Correct copy/order/review and repeat the affected comprehension journey. Do not add a blanket warning wall or unnecessary confirmation step. |

These monitoring thresholds are inherited source objectives or proposed operational evaluation windows, not performance measured in this review. Exact provider operation deadlines bind to the existing platform/owner registry before activation; a vague “monitor pending pauses” is insufficient.

## Source index and honest evidence limits

- [ADR-0001](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md), [Phase 1 ownership](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md), [ADR-0017](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0017-donor-anchored-civil-date-recurring-schedules.md): business ownership, calendar, scope and proof.
- [Phase 16 source](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md): B.5:470–484; B.8:526–532; C.2–C.6:553–621; recovery closure:677; authority:1050–1085; pause events:1430–1434; transition matrix:1829–1841; budgets/retention:2330–2362. These exact gaps motivate explicit amendments, not silent reinterpretation.
- [Donor self-service OpenSpec](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/changes/add-donor-self-service/specs/donation-lifecycle/spec.md#L53), [recurring OpenSpec](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/changes/add-recurring-giving/specs/donation-lifecycle/spec.md): original-grid pause/authorized resume, group/line/cohort ownership and no legacy pledge extension. Their active-change location is not proof of deployment.
- Actual current [#800](https://github.com/Asymmetric-al/core/issues/800), [#809](https://github.com/Asymmetric-al/core/issues/809), [#811](https://github.com/Asymmetric-al/core/issues/811), [#813](https://github.com/Asymmetric-al/core/issues/813) bodies/state/blockers were read; no issue or GitHub state was changed.
- Shared component/config/installed-type evidence: exact base-maia/Base UI/Zinc, Base UI 1.5.0, React DayPicker 9.14.0 and PostgreSQL major 17. Read-only shadcn info/docs ran; source setup patch remained reverse-checkable. [shadcn Date Picker composition](https://ui.shadcn.com/docs/components/base/date-picker), [RadioGroup](https://ui.shadcn.com/docs/components/base/radio-group), [Field](https://ui.shadcn.com/docs/components/base/field), [DayPicker v9 props](https://daypicker.dev/v9/api/interfaces/PropsBase).
- The Calendar's browser-locale formatter and stock button/cell sizes are not proof of the target's locale, giving timezone or 44px touch behavior. Use installed-version-supported props and shared component variants; do not copy new v10 imports or introduce a second date system. Calendar dropdown defaults ending in the current year cannot restrict a valid future source date.
- [WAI date-picker guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) and [financial error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html) inform focus/input/review; examples and axe alone are not conformance proof. Read-only repo frontend/testing/accessibility guidance was applied.

**Performed:** current source/SQL/test-code/configuration and issue-body inspection; official donor/subscription, Stripe and UI/database documentation research; independent owner/provider/UX adversarial checks; documentary consistency and preservation checks. **Not performed:** new target runtime tests, Core PostgreSQL authorization/concurrency, provider-account/financial actions, hosted donor journeys or measured donor research. No new sandbox/payment/provider mutation, source implementation, canonical ADR/OpenSpec edit, PRD or ticket publication occurred. Earlier bundles remain unchanged and retain their original evidence limits. Q14 G01 and other phase-wide dependencies remain open.

The finished recommendation is the selected two-choice entry with this complete, source-owned journey. Ratification approves the corrected execution and explicit amendments; it does not convert unrun implementation proof into verified behavior.
