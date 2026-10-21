# Phase 28 Q50 — campaign attribution for continuing recurring gifts

October 18, 2026. **Answered A: keep the recurring gift’s original campaign.**
[D50](phase28-d50-recurring-campaign-origin-decision.md) records the selection,
current research and required review amendments. The original question and
pre-answer scope below preserve preparation provenance.
[D49](phase28-d49-preserve-earlier-campaign-attribution-decision.md) selects stable
attribution for earlier gifts when a code moves campaign. This question addresses
the remaining future-installment meaning, not the chosen treatment of past gifts.

## One question

**If a recurring gift began under one campaign and staff later reassign its
tracking code, which campaign should receive its future installments?**

- **A — Keep the recurring gift's original campaign (recommended).** Later
  installments stay with the campaign recorded for that commitment. Reassigning
  the code alone does not move them.
- **B — Use the tracking code's new campaign.** Later installments follow the
  reassignment. Earlier installments stay as recorded.

This changes campaign reporting only; it does not change where the donor's money
goes. Both choices preserve the original source code and deliberate authorized
amendments. The question concerns the same continuing recurring commitment.

## Why this is a genuine remaining decision

[P13 recurring copy-forward](../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:1606)
freezes the source-code origin and its display fields. It does not independently
specify which campaign-mapping revision later installments use. P13's live
exception and frozen-campaign passages conflict, as the
[E7 gate](../../../prds/program-roadmap/decisions-and-gates.md#e7--campaign-temporal-attribution-exposed-by-phase-27)
explicitly records. D49 resolves the old-gift effect, not this recurring effect.

[P16 term versions](../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1569)
preserve the source snapshot and derive campaign attribution through the code,
while permitting explicit prospective attribution changes. Its
[occurrence snapshots](../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1621)
do not select the conflicting campaign basis. An independent bounded search of
current P13/P16/P27 and OpenSpec found no later ruling that answers this precise
question. The [P27 owner gate](../../../prds/sitestacker-parity/phase-27-donor-development/owner-reconciliation.md:41)
expressly reserves recurring-origin effects.

Recommend A because the recorded campaign describes what prompted that continuing
support. Reusing its tracking code for a different effort should not silently
move the support already generated. B gives organizations a current campaign
view of later installments; its consequence must be explicit because future
campaign performance can change through an ordinary registry edit. These are
product judgments, not verified ministry prevalence or universal nonprofit rules.

[Fresh official research](d49-evidence/external-research.md) supports making
recurring attribution explicit: Blackbaud documents deliberate amendments with
future-only application; NPSP has a campaign-copy setting; CiviCRM has an explicit
source precedence. None directly proves how Core's reusable-code remap should
affect an existing commitment. Do not import their configuration or data model.

## Boundaries retained under either answer

- **Same continuing commitment.** Pause/resume does not create a new origin.
  [P16 Restart giving](../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:677)
  already creates a new checkout/authorization after cancellation and does not
  carry forward old attribution. Do not reopen that settled behavior here.
- **Explicit prospective amendment remains possible.** A does not ban the
  separately authorized term-version changes P16 already admits. A mapping edit
  and an exact commitment amendment remain distinct commands and authorities.
- **Known no campaign and unknown evidence differ.** Preserve a source-qualified
  original absence under A; missing historical evidence cannot be reconstructed
  from today's registry. B likewise needs a qualified effective mapping, not a
  guessed match or a new source code.
- **Retries are not new donor decisions.** A delayed callback, pending retry,
  import or replay keeps the occurrence's qualified accepted meaning. Neither
  option authorizes selecting a later campaign just because processing is late.
- **Money and source duties remain unchanged.** Neither option alters payment
  authorization, amount, cadence, destination, receipt, donor credit, fulfillment
  or missionary privileges. Code retirement does not erase the original source.
- **No additional timing or hierarchy questionnaire follows automatically.**
  Reconcile P13's cart-add source freeze versus posting-time campaign language,
  and existing effective-dated hierarchy changes/closed-node protections with
  the selected rules first. Ask only a genuine unresolved product consequence;
  engineers must resolve clocks, locks, schemas and migration evidence.

Q50 is answered A. D50 preserves accepted recurring-line attribution under
ordinary code reassignment while retaining deliberate prospective amendments,
independent-gift fulfillment boundaries and fresh canceled-line restart. The
[post-D50 reconciliation](phase28-post-d50-e7-reconciliation.md) consolidates E7
and exact amendment status; no new Q51 is prepared without a demonstrated product
fork. Formal owner integration and the
[adapter gate](../../../../openspec/changes/add-donor-development/tasks.md:8)
remain open. No formal owner amendment, runtime implementation, live mutation,
previous evidence-program execution or Phase 28 completion is inferred.
