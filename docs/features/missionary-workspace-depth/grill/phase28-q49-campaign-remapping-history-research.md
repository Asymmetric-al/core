# Phase 28 Q49 — campaign reassignment and earlier gifts

October 18, 2026. **Answered A: keep earlier gifts as recorded.**
[D49](phase28-d49-preserve-earlier-campaign-attribution-decision.md) records the
selected direction and completed research/review. The original question and
pre-answer scope below remain preparation provenance.

[D48](phase28-d48-tenant-correction-approval-decision.md) resolves C-01's approval
policy choice; formal owner reconciliation and proof remain. E7 campaign
attribution is the next existing upstream policy gap. This question resolves
one foundational reporting choice, not all of E7 or a new workspace feature.

## One question

A **source code** is a fundraising tracking code identifying the newsletter,
appeal or other invitation that prompted a gift. It is not the gift's Fund or
designation. Suppose staff move a code from one campaign to another.

**What should happen to earlier gifts using that code?**

- **A — Keep earlier gifts as recorded (recommended).** The reassignment applies
  to new ordinary gifts. Earlier gifts, including gifts recorded without a
  campaign, change only through an explicit, audited correction.
- **B — Regroup earlier gifts in current reports.** Current campaign reports
  include earlier gifts under the new assignment. Original gift records and
  earlier reporting evidence remain preserved.

Neither option changes money received, where gifts are designated, donor credit
or commitment fulfillment. The choice concerns campaign attribution in reports.
It does not grant new mapping, financial correction or disclosure authority.

## Verified conflict and alternatives

[P13 story 143](../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:456)
permits live rollup movement when a source code is reassigned. Its
[D14 live-reporting exception](../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:1608)
likewise follows current mapping. Opposing
[campaign clauses](../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:1624)
describe frozen campaign attribution and mapping immutability after gifts.
The [program E7 gate](../../../prds/program-roadmap/decisions-and-gates.md#e7--campaign-temporal-attribution-exposed-by-phase-27)
and [P27 owner reconciliation](../../../prds/sitestacker-parity/phase-27-donor-development/owner-reconciliation.md:41)
explicitly require a coherent owner ruling; neither passage silently wins.

A bounded search of current ADR, OpenSpec, P13/P16/P24/P25 and P27 sources found
no later E7 resolution. [P27's financial-measure contract](../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:747)
keeps affected received-toward-appeal results unavailable until the exact owner
policy and adapter are qualified. Ordinary permitted relationship work continues.
No live report correctness or absence claim is made from this source review.

Recommend A: ordinary setup changes should not silently move previously recorded
campaign results. Staff retain a deliberate correction path when earlier
attribution was wrong. B's strongest benefit is reorganizing current reports
without individually correcting old gifts, but users must understand why totals
for earlier gift dates change and how that differs from historical evidence.
This is product judgment grounded in the conflict, not a claimed universal
nonprofit convention or observed user-study result.

## What this answer will and will not settle

| Case                                            | Meaning and remaining owner work                                                                                                                                                                                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Earlier ordinary gift with a campaign           | A preserves its recorded effective campaign unless deliberately corrected. B follows current mapping in explicitly current reports. Both preserve original posted facts and correction lineage.                                                                           |
| Earlier gift from a known code with no campaign | Included in the question: A requires deliberate audited attribution correction; B includes it in current regrouping when that code is assigned. Neither guesses an unknown code identity.                                                                                 |
| New ordinary gift after reassignment            | Uses the mapping valid for its authoritative attribution event under the selected owner policy; imports/retries cannot create a new event simply to obtain today's mapping. Exact event-time/late-arrival rules require owner reconciliation.                             |
| Existing recurring commitment                   | Its recorded source-code origin remains intact. Whether later installments keep the original campaign or follow a later mapping is a remaining P13/P16 decision; the origin code alone does not answer it.                                                                |
| Refund, correction or reversal                  | Follow the exact source-covered gift/correction attribution lineage without double counting or money mutation. A refund cannot be classified from an unrelated later registry value. Exact historical versus current reporting treatment must follow the selected policy. |
| Moving a campaign within its hierarchy          | Separate from moving a source code between campaigns. Current rollups and historical/closed reports need an explicit hierarchy basis; this answer does not silently authorize rewriting closed results.                                                                   |
| Renaming, retiring, replaying or restoring      | Stable source identities and original evidence survive. Labels are display, archived records are not reassigned by implication, and rebuilds must not invent attribution or repeat financial effects.                                                                     |

The future design must explain the proposed remapping's actual reporting effect
before staff save, preserve an audited policy/mapping history and use one
source-owned projection across staff, missionary and permitted public views.
Apply disclosure before totals; retain exact currency/entity scope. A reporting
projection never becomes authority to edit money or silently correct history.

Selecting A requires reconciling the currently conflicting prohibition on mapping
changes after gifts into a qualified prospective change path; it does not
authorize a destructive update of frozen facts. Selecting B requires an explicit
current-versus-historical reporting contract and qualification. These are
declared consequences, not claims of existing supported functionality.

## Continuation boundary

Q49 is answered A. D49 settles ordinary remapping's retrospective effect and
records the required campaign-only correction and no-campaign reconciliation
amendments. It does not close E7's remaining recurring, hierarchy, late-arrival,
historical-report or adapter requirements. The
[session continuation](phase28-session.md#next-conversation-step) tracks Q50,
prepared and unanswered. No formal owner document, ADR/OpenSpec, application/
schema, live policy, GitHub state or real communication changed. No previous
model/checker was executed or imported.
