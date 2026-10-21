# D49 — Campaign attribution changes: external evidence

Research/access date: **2026-10-18 (Asia/Bangkok)**. This is a new, bounded primary-source research note for the founder's selected Q49 A: moving a tracking code to another campaign leaves earlier gifts as recorded unless deliberately corrected. It is not a formal owner amendment, implementation assessment, or evidence that the review's proposed details have been ratified.

## Findings and scope

The strongest useful distinction is between **changing a rule for future records**, **correcting a particular existing record**, and **regrouping a report through a hierarchy**. Official products document these as different operations. They do not establish a universal fundraising rule for Core's tracking-code mapping.

Blackbaud offers the closest explicit temporal analogue: recurring-gift campaign amendments preserve processed payments. Donorbox documents deliberate campaign corrections to individual gifts. Salesforce provides both campaign-copy configuration/change history and hierarchy-based reporting. CiviCRM makes recurring installment attribution depend on an explicit precedence among sources. These examples support making scope visible; they do not decide the separate Core question of which campaign later recurring installments inherit.

All six pages below were freshly opened and relevant body text inspected using the available public web reader. No authenticated product, payment, customer data, or paid UI was accessed. “Documented” means the vendor's public documentation says this, not that its runtime was tested. Publication/update dates are separated from retrieval dates; crawl dates and copyright years are not publication dates.

## Primary source register

### S1. Blackbaud — Recurring Gift Amendments

- **URL:** [Recurring Gift Amendments](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-ca/content/bb-recurring-gift-amendments.html).
- **Publication/update:** not displayed in the inspected page. **Access:** 2026-10-18. Official Raiser’s Edge NXT help, Canadian-English edition.
- **Exact short excerpt:** “recurring gift payments that have already been processed remain unchanged.”
- **Documented context:** Amendments can change campaign, appeal and fund alongside other recurring-gift details. The page explicitly applies those changes to future installments. It offers comments for the reason, displays changes in recurring-gift history, and requires amendment rights. If an installment is pending in a retry cycle, the amendment applies to the next scheduled installment.
- **Useful comparison:** a prospective change and an inspectable history can coexist without rewriting processed payments. The retry exception also demonstrates why “future” needs a precise operational meaning.
- **Limit:** this is an amendment to a recurring gift, not remapping a reusable tracking code. Campaign, fund and appeal are separate fields even though the workflow edits them together. It does not settle Core's installment-origin policy, attribution event, refund lineage or correction authority. The documentation does not prove tamper-proof history.

### S2. Donorbox — How to move a donation to another campaign

- **URL:** [How to move a donation to another campaign](https://donorbox.zendesk.com/hc/en-us/articles/360020293052-How-to-move-a-donation-to-another-campaign).
- **Displayed update:** **August 22, 2026, 11:15**; timezone unspecified. **Access:** 2026-10-18.
- **Exact short excerpt:** “Finally, you will get a confirmation page with the details of the new campaign.”
- **Documented context:** for a one-time donation, staff identify the donation, choose a destination campaign, review it and confirm the change. Active and archived destinations are documented. Recurring plans use a separate plan-detail edit and Save workflow.
- **Useful comparison:** correcting one gift is an explicit action whose destination is visible before submission. Editing the recurring plan is a distinct operation.
- **Limit:** the page does **not** specify whether moving a recurring plan changes earlier installment attribution. Nor does it establish an immutable correction log, Core permissions, or permission to select archived campaigns in Core. Donorbox's campaign/designation controls are not automatically equivalent to Core's tracking-code mapping. Do not infer these missing guarantees from the success notification.

### S3. Salesforce NPSP — Configure Recurring Donations

- **URL:** [Configure Recurring Donations](https://help.salesforce.com/s/articleView?id=sfdo.npsp_configure_recurring_donations.htm&language=en_US&type=5).
- **Publication/update:** not displayed in the inspected article. **Access:** 2026-10-18. Current public NPSP documentation; not a claim about the different Nonprofit Cloud product.
- **Exact short excerpt:** “When selected, NPSP copies the Campaign you specified on the Recurring Donation to its installment Opportunities.”
- **Documented context:** this behavior is controlled by a campaign-copy setting. A separately enabled recurring-donation change log records changes to amount, schedule or campaign fields. Read access to that log is configurable.
- **Useful comparison:** recurring attribution and readable change history are explicit product capabilities, rather than facts that can be inferred from a recurring source identifier.
- **Limit:** the article does not state whether changing a campaign updates previously closed installment Opportunities. The setting's name must not be read as proof of retroactive changes to all historic gifts. Optional vendor logging is not evidence that Core's required correction history may be optional. No NPSP installation or configuration was tested.

### S4. CiviCRM — Recurring Contributions, Developer Guide

- **URL:** [Recurring Contributions](https://docs.civicrm.org/dev/en/latest/financial/recurring-contributions/).
- **Publication/update:** not displayed. **Access:** 2026-10-18; current `latest` documentation, not a pinned deployed version.
- **Exact short excerpt:** “If values conflict between these sources the precedence is as follows”.
- **Documented context:** installment creation combines incoming data with recurring-record/template data, with a last-successful-contribution fallback. For campaign attribution, explicit incoming `campaign_id` precedes the recurring record, then template/fallback data. The page separately explains that editing a contribution amount may reflect an exceptional payment or partial refund rather than a change to future payment intent; behavior around that synchronization changed in version 5.61.
- **Useful comparison:** provenance and deliberate recurring intent matter. A repeated payment's attribution cannot safely be guessed solely from the latest mapping or latest payment.
- **Limit:** this is developer documentation with processor/version qualifications, not proof of a particular administrator UI or historical campaign correction policy. The amount-sync explanation must not be generalized into an undocumented campaign-sync guarantee. No CiviCRM adapter or extension is proposed.

### S5. Salesforce — Create a Campaign Hierarchy

- **URL:** [Create a Campaign Hierarchy](https://help.salesforce.com/s/articleView?id=campaigns_viewhierarchy.htm&language=en_US&type=0).
- **Publication/update:** not displayed. **Access:** 2026-10-18. General Salesforce campaign documentation, not a nonprofit-specific temporal policy.
- **Exact short excerpt:** “When you run reports, metrics from the child campaigns roll up to the parent.”
- **Documented context:** a campaign can be associated with a parent through its Parent Campaign field, and users can inspect the resulting hierarchy.
- **Useful contrary comparison:** grouping campaign results under a parent is a documented reporting capability. It makes the strongest alternative to historical attribution preservation intelligible: people may want results organized by today's campaign structure.
- **Limit:** this page does not explicitly demonstrate reparenting historical gifts, specify historical-as-of hierarchy reconstruction, or say that changing a tracking-code mapping changes each gift's campaign. The hierarchy/reporting operation must remain distinct from contribution attribution.

### S6. Salesforce — Create or Edit a Campaign

- **URL:** [Create or Edit a Campaign](https://help.salesforce.com/s/articleView?id=sf.campaigns_edit.htm&language=en_US&type=5).
- **Publication/update:** not displayed. **Access:** 2026-10-18.
- **Exact short excerpt:** “changes can affect active automation tools or trigger a statistics recalculation.”
- **Documented context:** Salesforce advises checking where a campaign is used before editing it. The article documents campaign-edit permission requirements and access to the selected parent.
- **Useful comparison:** report/automation impact can be material even when the action is presented as an ordinary record edit.
- **Limit:** the warning does not identify every recalculated field or prove automatic retroactive gift reattribution. A `sales.campaigns_edit.htm` URL variant initially returned only an unusable shell; the `sf.campaigns_edit.htm` URL above returned the article body. The successful source, not the failed variant, supports this finding.

## Comparison and strongest alternative

| Operation                                              | Verified comparison         | What it does not establish for Core                           |
| ------------------------------------------------------ | --------------------------- | ------------------------------------------------------------- |
| Prospective change with past payments retained         | S1                          | Tracking-code remap semantics or recurring-origin inheritance |
| Deliberate correction of an individual existing gift   | S2                          | Automatic historical backfill or an audit guarantee           |
| Recurring attribution configuration and change history | S3; source precedence in S4 | A universal original-campaign or current-campaign rule        |
| Parent hierarchy reporting and possible recalculation  | S5–S6                       | Changing a gift's recorded attribution when a code moves      |

**No exact primary-source example of Q49 B was verified in this bounded research.** S5–S6 are the strongest nearby counterexample, not proof of the exact competing behavior. Current-structure reporting can be useful while original record attribution remains intact. That does not authorize adding a second reporting mode to Core during this review or reopen the selected A. Conversely, the selected A must not be overstated as “all historical campaign reports can never change”: deliberately corrected records and separately governed hierarchy/reporting rules are different questions.

Searches also surfaced older Salesforce legacy-recurring documentation, old Blackbaud manuals, community answers, and Bloomerang release-note/API references. They were not promoted into claims about current temporal behavior: the six sources above provide stronger direct evidence. This is selective coverage, not a claim that every named product has been exhaustively audited or lacks other behavior.

## Minimal product recommendations for this review

These are judgments based on the selected answer and the distinctions above, not vendor-proven usability outcomes.

1. **Make the mapping edit small and its effect visible.** Show the tracking code, current campaign and selected campaign together. Put the selected temporal effect next to Save rather than hiding it in general help. Draft copy: **“New ordinary gifts will use [Campaign]. Earlier gifts keep their recorded campaign.”** “Ordinary” is a review boundary, not necessarily the final product noun: final copy must use the owner-qualified scope and must not accidentally promise that recurring installments follow the same rule.
2. **Keep correction explicit.** A prior gift that was genuinely misattributed still needs a deliberate, authorized correction path. Review the identified gift or explicitly selected set and old/new attribution before committing. Expose concise correction history in the gift's existing detail view. This does not require a new correction application, routine approval queue, or a history modal on every mapping edit.
3. **Describe attribution as attribution.** Moving the code must not sound like moving money, changing a donor's restriction/designation, editing a recurring payment agreement, or altering a receipt. The public sources frequently place these concepts near each other; Core's owner boundaries determine which operation is actually being performed.
4. **Avoid misleading impact and success claims.** No estimate should appear as “0 earlier gifts” merely because the preview is unavailable or unauthorized. A mapping-save receipt should confirm that mapping operation. It should not claim a correction or report rebuild succeeded unless that separate result is established.
5. **Make history understandable without requiring technical knowledge.** Use distinguishable code/campaign labels and meaningful dates, with details available when a correction needs explaining. Exact event identities, retry handling and audit storage belong behind this flow. A name change must not be mistaken for a new campaign identity.

## Remaining evidence and decision limits

The documents do not resolve Core's authoritative attribution event, late-arriving gift/import behavior, attribution with no known campaign, concurrent mapping edits, refunds/reversals, hierarchy changes, deleted/renamed campaigns, exact correction permissions or history retention. The local Q49 research note already reserves several of these boundaries; an external comparison cannot silently settle them.

In particular, no finding says that a saved recurring source code chooses the campaign for every later installment. That remains a separate owner/product decision. Neither an ingestion retry nor an administrative report refresh should be described as a new donor act simply because a vendor uses mutable fields; the selected Core contract must define its own source event and correction semantics.

No user interviews, comparative usability study, live campaign edits, financial operations, application tests, or prior evidence programs were performed for this note. The recommendations require review and later implementation verification; documentation availability establishes neither deployment nor runtime correctness.
