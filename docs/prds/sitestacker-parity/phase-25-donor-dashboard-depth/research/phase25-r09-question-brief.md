> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Question 09 — Changing a recurring gift

> **Explicitly founder-ratified, 7 September2026.** Conrad accepted Question09's corrected execution, mapped J01–J12 journey and C01–C22. Historical proposal/ratification wording below is answered; do not re-ask it. Implementation and release proof remain separate.

> **A selected, 7 September2026.** The original question below is answered. The Q09 adversarial review supplies proposed expansion/execution requirements awaiting ratification; do not re-ask A/B.

7 September 2026. **Researched recommendation awaiting founder answer.** Question08's calm overview and C01–C22 are explicitly ratified. This is a grooming question, not a PRD, formal specification or implementation authorization.

## The one decision

Inside the already required **Change this recurring gift** action, should editing start focused on what the donor wants to change, or show a compact form containing the permitted future terms together?

The existing outer journey is settled: recurring-line detail → Manage → Skip, Pause, Change or Cancel. This question does not replace that doorway, regroup gifts, change permissions or reopen cancellation/pause rules. It chooses the input experience inside Change.

## Concrete example

Illustrative donor Ada supports Maya's ministry with **USD40 monthly**, alongside a separate **USD20** line for another ministry. She wants Maya's support to become USD50. She may also want to move its next eligible gift from the 10th to the 20th. The other ministry should remain unchanged.

Both options support a simple amount change and a compatible combined amount/date change before **one final source-owned review**. The example describes the donor's intent; the owner verifies date eligibility, authorization, charge grouping and in-flight effects. It is not a promised provider result or a measured common-user frequency.

## Clear, fair options

<!-- prettier-ignore -->
| | A — Focused editing, expand as needed | B — Full recurring-gift edit form |
| --- | --- | --- |
| First view inside Change | A clear current summary and focused choice of what to edit; open the relevant input(s) | A compact form showing the selected gift's permitted future terms together |
| Amount-only example | Ada opens Amount, changes40 to50, then reviews | Ada changes the amount in the form, leaves other terms unchanged, then reviews |
| Amount and date example | Ada adds the date change to the same draft, then reviews both together | Ada changes both visible fields, then reviews both together |
| Main advantage | Less editable material to deal with for a specific task; unrelated terms remain understandable without needing attention | Convenient for several changes; all ordinary editable terms are visible without an extra reveal step |
| Main tradeoff | Adding another kind of change takes an extra deliberate reveal/selection | A simple change presents more controls and requires stronger visual clarity about what actually changed |
| Review and result | Same exact before/after preview, confirmation and durable outcome | The same preview, confirmation and durable outcome |

**Recommend A.** It best expresses the accepted quiet, self-service-first direction: help a donor act on their purpose, preserve enough current context to understand it, and reveal other edit controls when wanted. Do not turn it into a long wizard or insist on one separate save per field. Keep the working draft coherent and let the donor revisit or add compatible changes before the same final review.

B is a strong, legitimate alternative. A well-composed form can be clearer than several nested menus and is efficient when multiple terms need changing. It must be a bounded form for the selected recurring gift, not an enormous account-settings page. Both options preserve quiet optional end-date controls and secure payment-method collection rather than flattening every operation into plain inputs.

The difference is visual/input organization, not safety, backend atomicity, number of accepted commands or a prohibition on combined edits. No comparative Asym usability evidence proves A superior. The recommendation is a product judgment based on the founder's stated priorities and Core's more detailed source-owned recurring model. A does not promise fewer clicks in every case.

## Current external evidence

These are **Useful precedents**, not authority to import provider-specific behavior or claims of conversion/retention improvement.

- [Church Center — Manage your giving information](https://help.planningcenter.com/en/140951-manage-your-giving-information.html), September3 guide: one recurring-edit entry covers amount, fund, payment method and schedule, followed by Update donation. This supports B's common-editor pattern. Asym retains its separate lifecycle operations and exact review; vendor status/delete behavior is not adopted.
- [Fundraise Up — Donor Portal experience](https://fundraiseup.com/docs/donor-portal-experience/): recurring-plan details support amount, frequency, next installment and payment-method changes. This establishes the useful self-service tasks, not proof of distinct task-entry buttons or a measured advantage for A. Its 1–12-month pause, cancellation/reactivation and automatic-sync claims do not govern Asym.
- [Donorbox — Edit recurring amount](https://donorbox.zendesk.com/hc/en-us/articles/360020560251-How-do-I-edit-my-recurring-donation-amount-as-a-donor): an amount field has its own change action. This is a narrow precedent for focused inputs, not proof of A's shared draft/review. Do not copy immediate per-field acceptance, password/account rules or provider-limit claims.
- [Givebutter — Edit a recurring donation](https://help.givebutter.com/en/articles/4529176-how-to-edit-and-manage-your-recurring-donation), June11 guide: Edit Plan opens a window with several editable fields. This is a clear B precedent. Its date-through-pause, status/cancel, recovery and access behavior is not adopted.
- [Stripe — Update a subscription](https://docs.stripe.com/api/subscriptions/update) and [subscription changes](https://docs.stripe.com/billing/subscriptions/change): billing changes can create prorations, reset timing or produce immediate billing effects. These are **provider execution facts**, not permitted Asym defaults. Core's no-proration/no-ordinary-save-charge contract and current owner preview remain mandatory whichever form is chosen.

No “best-performing dashboard,” retention percentage, guaranteed fewer taps or measured donor preference is claimed. No second implementation or A/B experiment is required merely to choose this direction; the eventual selected journey needs real retrieval/edit/comprehension testing.

## Repository evidence: why this is still open

Current develop/research worktree remains `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`.

1. [Phase16 PRD](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md):555–562 fixes the single Manage doorway and four ordinary operations, but allows a calm task sheet or full page. It does not fix the input organization inside Change.
2. Phase16:503–524 and605–613 fixes exact future-term previews, affected scope, authorization, stale-review handling, domain command and provider reconciliation. :2169 fixes the current detail and bookmarkable confirmation. Those are shared requirements, not alternative form designs.
3. [#811](https://github.com/Asymmetric-al/core/issues/811) owns the quiet summary, bookmarkable line detail, one Manage doorway, current action descriptors and frozen confirmation. It does not settle A/B inside Change.
4. [#812](https://github.com/Asymmetric-al/core/issues/812) explicitly gives an example of **amount and next date changing together** on one line while its sibling remains unchanged. Its closed future-term change uses one preview/apply result. A must preserve that supported combined edit; B does not need a new cross-group batch authority to expose it.
5. [Donor self-service OpenSpec](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/changes/add-donor-self-service/specs/donation-lifecycle/spec.md):7–45 consumes these group/line/epoch/command owners. No additional database truth is created by the input layout.

The current pledge UI, legacy mappings and prototype actions are **Implementation accidents or incomplete predecessors**, not proof that either target editor works. Existing source-owned command, scope, preview and confirmation contracts are **Durable patterns** because they protect donor intent, money, authority and understandable outcomes.

## Conditions preserved in both alternatives

- **Selected scope stays clear.** Change only the currently authorized line or explicitly selected lines using the existing command. Group totals remain projections; no automatic proportional redistribution or hidden sibling edits.
- **Review once, precisely.** Show what changed, actual affected lines, amount/currency, effective boundary, next dates, relevant charge grouping, final-date truth and in-flight effects. Preserve the owner's exact review/confirmation requirements; hide no material consequence merely to keep the screen short.
- **No save-as-you-type financial mutation.** Inputs edit a draft. The existing explicit preview/apply boundary accepts the change. Compatible amount/date changes can share that review; incompatible/unsupported combinations get a clear owner-derived explanation before acceptance.
- **Ordinary saves do not charge.** No hidden proration, catch-up debt, duplicate executor or bonus retry. A provider “success” cannot mask unresolved legs or synchronization. A stale preview requires fresh review; a lost response resolves the original operation instead of submitting again blindly.
- **Keep other purposes separate.** Skip, pause, resume, cancellation and fresh restart retain their own rules. Cancellation remains direct and does not require completing this edit form. Fixed-total pledges retain their separate aggregate and staff/request workflow.
- **Use existing secure method paths.** A method change is not raw card entry or automatic cross-arrangement replacement/default/removal/recovery. Respect R03 and Q06 where their exact original intents apply; do not infer their scope from one ordinary method edit.
- **Preserve optional and inaccessible states.** An end date remains quiet and optional. Unknown, denied or unsupported terms must not appear as operational controls. Current source action descriptors supply the permitted path and safe help.
- **Keep feedback truthful and calm.** Same clear current summary, readable labels, exact Maia/Base UI and shared tokens, keyboard/mobile support, local validation, draft preservation and safe Back/refresh handling. The current Reserved schedule-change message key creates no notification/email merely because the editor saved.

These conditions follow existing ownership and accepted session decisions. They are not proposed new scopes. Final control composition, wording and supported mixed-field cases will be pressure-tested against the selected answer rather than silently pre-ratified here.

## Stripe check and practical limits

The current API pin is **2026-05-27.dahlia**, with SDK **22.2.0**, confirmed in `packages/api/src/stripe/api-version.ts`, the package manifest and lockfile. Latest official change/update/pending-update documentation was retrieved using **stripe docs**, following the Stripe documentation and best-practices skills. The skill's generic “upgrade to latest” advice does not authorize an upgrade or supersede this session's required pinned-integration comparison.

The existing CLI default/test scope was rechecked read-only with the pinned version: **zero connected accounts**, no further page, and the inspected platform account has charges/payouts disabled and no capabilities. No financial/provider mutation or execution test ran. This proves only that this credential scope cannot qualify the target connected-account journey; it says nothing about unseen production accounts.

Stripe's pending-update feature is not automatically the right adapter for Asym's no-charge save. Neither editor may directly translate fields into route-level Stripe mutations. Existing Phase16 services must prove the exact account/mode/rail/command behavior before activation. These technical limits do not prevent choosing the input experience.

## Dependency and record notes

Fresh #811/#812 are OPEN/status:blocked. Their native blocker arrays are empty, while their bodies list prerequisites (#811:805–810; #812:798/799/809/810/811). Empty native edges do not establish readiness. No graph was changed.

#812's older schedule-change-email wording must be reconciled with current Phase16:524, where `recurring_schedule_changed_v1` is Reserved and produces no plan/intent/event/notification/delivery work. This is a discoverable owner conflict, not a new founder choice about sending emails.

Receipt-email opt-out was considered and deliberately not presented as an ordinary next preference choice: Phase17's source-required receipt profile constrains it, and changing that would require a named owner-policy amendment. Wallet removal completion and History's initial period remain separately open candidates. They are not bundled into Q09.

Q08 ratification was recorded in the decision log, review notice and local glossary. Its historical proof bundle remains unchanged. No new database/browser/provider-action test was necessary for this question; none is claimed. Existing repository changes remain preserved. Do not advance to Q10 until Conrad answers this one question and its material review is resolved.

**When a donor opens Change this recurring gift, how should the editing experience begin?**
