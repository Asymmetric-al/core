# D33 — comparable offline-gift reporting and finance intake

Research date: **October 18, 2026 UTC**. The founder selected optional missionary
reporting of an actual offline gift, with the organization setting **Off by
default**. This is supporting research for the answer review, not ratification
of additional amendments, an implemented permission or financial-source proof.
Only this new evidence file is authored here.

## Finding

The documented missionary job is real: a person may receive a physical gift
before the organization records it. Comparable products distinguish editable
entry from later processing, and some show existing records to reduce duplicate
entry. They also demonstrate why a generic **Add donation** action is too broad
for Maya's selected report: saving can affect received totals, paid status,
receipt delivery or canonical donor data.

**No reviewed product documents the complete Core contract:** an optional,
organization-authorized missionary assertion of actual receipt that remains a
P15 operational intake, supports honest missing facts, preserves physical work
separately from recording, and reconciles to one financial occurrence without
granting posting or receipt powers. Core's existing owners establish that
contract; the sources supply concrete jobs and counterexamples.

## Six primary sources and exact limits

All six were directly opened on October 18 for this D33 review. Four also
informed Q33 and were reopened; this is not six independent usability studies.
Publication dates are given only where displayed. Undated official help is
current public documentation availability, not proof of recently shipped behavior.
Retrieval references identify this session's web results; they are not content
hashes or permanent vendor snapshots. No authenticated product was used.

The summaries are deliberately compact and paraphrased. The main review should
reuse a short factual capsule and its limit, rather than reproduce vendor text
or treat the design recommendations below as vendor observations.

| ID / exact primary URL                                                                                                                                       | Date and retrieval                                                                                                | Observed documentation                                                                                                                                                                                                                                                     | Limit and conflict with Core                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S01 — [TntConnect: Dealing with gifts](https://www.tntware.com/tntconnect/help/en/pages/gifts_dealingwith.aspx)                                              | Undated manual; `turn204642view0`                                                                                 | Describes recording a gift given directly to the missionary before forwarding it to the organization. Later synchronization can encounter an unprocessed or mismatched manual entry; the page also describes automatic removal of certain unposted local entries.          | Strong evidence of the handoff job, not authority to create local money. Reject synchronization-based deletion, guessed matching and financial workaround entries. No verified runtime, prevalence or safe retention duration is established.                           |
| S02 — [Blackbaud RE NXT: Manage gift batches](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-gifts-batch.html)                    | Undated help; `turn204642view1`                                                                                   | Batch work can be saved and resumed. Approval supports data-quality control; automatic source batches begin Unapproved, with gift-record creation following approval.                                                                                                      | Supports separate pending and processed meanings. It does not establish reporter permissions or continuous custody. Do not add a mandatory second approval to Core or equate every saved intake with a financially valid batch row.                                     |
| S03 — [Blackbaud RE NXT: Approve a batch](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-gift-batch-approve.html)                 | Undated help; `turn972006view0`, `turn380092view0`                                                                | Exception-free entry is ready for approval. Approval creates gift records; the user may navigate away and receives a notification when processing finishes.                                                                                                                | Useful distinction between initiating processing and its finished result. It does not prove Core's atomicity, retry guarantees, downstream receipt outcome or bank clearance. No receipt or processing notification is added to D33 by this analogy.                    |
| S04 — [Salesforce NPSP: Enter gifts in Gift Entry](https://help.salesforce.com/s/articleView?id=sfdo.npsp_enter_gifts_in_ge.htm&language=en_US&type=5)       | Undated NPSP Managed Package help; `turn204642view3`, `turn972006view3`; Q33 detailed retrieval `turn647715view1` | Saved batch entries undergo dry-run checks/matching and remain editable before processing. The single-gift flow exposes existing Opportunities/Payments for review; saving a new Payment can mark it paid and close its Opportunity.                                       | Distinguish NPSP from Agentforce Nonprofit. This is a finance-entry flow, not permission for Maya to mark money paid. Amount/date resemblance and configured matching are not proof of one physical item. Do not copy automatic financial or donor-record mutations.    |
| S05 — [Salesforce: Gift Entry duplicate-contact limitation, article 001920439](https://help.salesforce.com/s/articleView?id=001920439&language=en_US&type=1) | Published **April 24, 2026**; `turn204642view4`, `turn972006view1`                                                | The article says Agentforce Nonprofit's Gift Entry Save does not run Duplicate Matching Rules; it advises Donor Lookup to find an existing donor instead of entering the same identifying fields again.                                                                    | A documented, product-specific limitation, not a reproduced defect or a claim about NPSP. It concerns donor identity, not same-check deduplication. Test Core's exact report path rather than assuming a general CRM duplicate facility covers it.                      |
| S06 — [Givebutter: Add and manage offline transactions](https://help.givebutter.com/en/articles/2705864-how-to-add-and-manage-offline-transactions)          | Displays **“Updated over 2 weeks ago”**; `turn204642view2`                                                        | Admins/editors enter externally received cash/check and other donations. No online processing occurs. Saved entries affect campaign/team totals. Email receipt is separately optional and defaults off; the page also permits deletion/reassignment of these transactions. | Concrete contrast with report-only intake. No online charge does not mean no financial/display effect. Do not import receipt options, public feed fields, direct total changes, deletion, reassignment or the vendor's full tender inventory into missionary reporting. |

The two Salesforce entries deliberately describe different products. Their
behaviors cannot be combined into one purported Salesforce implementation.
The browser extraction included a CSS-error header, but the cited article bodies
were available and read; this is documentation retrieval, not product testing.
No DonorElf or MPDX claim is needed to fill the register. No historical search
snippet, inaccessible page or marketing promise is promoted to verified behavior.

## Governing Core evidence

- [P15 D1 and the ratified operational-intake extension](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:429)
  provide one offline-money commit path and a separate bounded intake envelope
  for actual reported receipt. The envelope may precede complete financial facts;
  it is not a contribution or a compulsory precursor to otherwise valid entry.
- [P27's exact P15 extension](../../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:75)
  separates trusted recorder, reported holder, actual receipt assertion and
  next responsibility. It preserves unknowns, same-item continuation, qualified
  duplicate resolution and independently tracked financial/physical completion.
- [REQ27-F56–F61](../../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:567)
  preserve source ownership, explicit receipt evidence, incomplete intake,
  separate capabilities and lineage. A reporter role does not create financial,
  donor-identity, routing, correction or export authority.
- [Original Q33](q33-before-answer.txt)
  preserves the pre-answer frontier. Its unanswered label is not the status
  of this note. The founder has now selected the optional reporter surface and
  organization Off default; additional implementation amendments remain subject
  to the answer review and ratification.

These are owner requirements, not evidence that the current source or UI is
implemented. Earlier product assertions about competitors in legacy planning
documents were not independently validated here and are not repeated as facts.

## Useful, bounded product recommendations

### Entry and honest confirmation

Use **Report an offline gift**, not **Add donation**, for the missionary action.
Make the actual-receipt purpose clear with one short instruction; a promise,
donor's claim of mailing, intended gift or date field is not receipt. A generic
offline label must not offer card charging, bank entry, check scanning or
inventory/valuation. The selected setting authorizes no additional capture lane.

Use the existing P15 intake rather than sending Maya through the finance grid.
Record permitted known facts and preserve uncertainty. A reporter must not
create a fake donor, zero amount, assumed currency or legal entity just to
submit. If a permitted existing contact is available, it supplies useful context;
no search result does not establish that the donor is new or absent organization-wide.
Wrong-payee and incomplete items need the already owned exception path, not an
invented donation or an unusable form.

After authoritative report acceptance, show **Report saved** and the qualified
next-work state, for example **Awaiting finance**. Do not show **Donation
recorded**, **Received support increased**, **Receipt sent**, or **Check cleared**
as consequences of the report. If an unresolved source condition needs a
different next actor, show that permitted disposition instead of falsely
claiming everything is waiting only for finance.

The organization starts Off as selected. Enabling reporting does not change
the money-entry workflow. Turning it off must not delete accepted reports,
cancel independent property handling or rewrite financial facts; exact command
gating and continued read/correction capabilities belong to the owner synthesis.
The setting cannot itself grant full finance access or create a guessed recipient
broadcast when routing is unavailable.

### Continuation and duplicates

There are three different reconciliation problems:

1. **The same submission retried:** recover its accepted source result without
   another report. A lost response is not a new physical gift.
2. **Two people report the same item:** preserve both origins until the owner
   qualifies one canonical intake. Similar fields are suggestions, not identity.
3. **Finance already recorded the item:** resolve exact covered lineage to that
   existing result, without a second contribution, receipt or fulfillment effect.

These cases must not become one aggressive auto-merge rule. Two real checks can
share donor, amount and date; an unknown or restricted matching record cannot be
revealed through an error message. Canonical donor identity and canonical intake
identity are also different decisions. The April 2026 Salesforce article is
particularly useful as a reminder to verify the exact entry route, not proof
that every product or every Core intake has that specific defect.

For Maya, keep the outcome simple: the same report shows its currently permitted
status and next action. Finance continues it through existing staging or exact
reconciliation. A familiar report reference can aid recovery; it does not replace
source identity, grant access or prove the bank processed the item.

### Status needs more than one axis

| Actual qualified state                           | Recommended truthful presentation                                 | Avoid                                                      |
| ------------------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| Unsaved or private draft                         | Draft/not submitted                                               | Awaiting finance or receipt asserted                       |
| Submission result unknown                        | Checking whether the report was saved; recover the same operation | A new report button presented as the only retry            |
| Report accepted; recording remains               | Report saved; Awaiting finance, with permitted next step          | Donation recorded or cleared                               |
| Owner needs missing facts/disposition            | Permitted clarification/exception and responsible next action     | Guessed donor/value or a generic success that strands work |
| Finance recorded; physical handling remains      | Recorded by finance **and** Handling still needed                 | One terminal Done label that hides remaining property work |
| Physical handoff recorded; finance still pending | Handoff recorded; Awaiting finance                                | Posted, deposited or cleared by implication                |
| Existing recorded item reconciled                | Permitted recording-resolution result for this intake             | New contribution or a leaked full financial record         |
| Source unavailable or projection behind          | Updating/unavailable, with honest recovery                        | Zero, missing gift or conclusively unrecorded              |

This table applies existing P15/P27 meanings; it does not create a new custody
ledger. Historical receipt assertion is not proof of uninterrupted current
possession. Later reversal, NSF or changed assignment cannot silently re-create
physical custody. Reporting remains voluntary; real accepted handling duties
retain their source-owned lifecycle.

## Material concerns and acceptance implications

The likelihood labels describe plausible workflows without safeguards, not
measured incident rates. Suggested clauses below are for the main review;
they are not additional selected product policy or formal specification.

| Failure and impact                                                           | Severity / likelihood                         | Evidence; effect on the answer                                                                                                                      | Exact recommended prevention and proof                                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Direct donation entry is reused for a report; money/totals/receipts change   | High / High if the wrong entry flow is reused | S04/S06 expose concrete broader side effects; P15 separates intake. Requires a bounded consumer command.                                            | **Report acceptance shall create only the qualified operational intake and required work, not a contribution, paid status, receipt or received total.** Verify actual report writes and all resulting views/effects, not just button text.                               |
| Missing details force invented financial identity/value                      | High / Medium                                 | P27 honest-incomplete contract; vendor financial forms are not the reporter schema. Narrows required fields.                                        | **Unknown intake facts shall remain unknown within source scope with accountable resolution; no fabricated Party, currency, entity or amount shall satisfy submission.** Exercise unknown donor/amount and wrong payee without weakening financial-root requirements.    |
| Retry or independent duplicate report posts twice, or merges two real items  | High / Medium                                 | S01 reconciliation job; S04/S05 route-specific identity limits; Core same-item contract. Requires separate intent, identity and coverage treatment. | **Same-intent retry shall recover one result; independent reports and existing money shall reconcile only through qualified source lineage.** Test double submit, response loss, two reporters, finance-first and two identical-looking real checks.                     |
| A saved report is treated as processed, or finance recording erases handling | High / Medium                                 | S02/S03 separate pending entry/processing result; P27 permits recording and handling to coexist. Changes status projection.                         | **Report, recording, physical handling, deposit and clearance shall remain distinct; each display shall assert only current qualified facts.** Test both orderings of posting/handoff, delayed processing and later NSF.                                                 |
| Broad role/default or duplicate warning exposes finance/private records      | High / Medium                                 | Vendor roles do not establish Core rights; P27 separately owns report/read/route/finance. Requires exact action/projection capability.              | **Organization enablement and reporter identity shall grant only qualified reporting; every returned detail and reconciliation result shall obey current scope.** Test Off/default, role mismatch, permission loss and hidden potential matches without existence leaks. |
| Age, Off, departure or sync cleanup silently removes real outstanding work   | High / Medium                                 | S01 includes a deletion behavior not safe to import; Core retains unresolved handling. Narrows cleanup and transition behavior.                     | **Accepted intake lineage and outstanding source obligations shall survive feature disablement and ordinary cleanup; only qualified dispositions resolve them.** Verify Off/departure/archive do not imply handoff, posting or disposal.                                 |

## Strongest alternative and evidence boundary

Staff-entered reporting remains a valid organization choice and the default
experience while missionary reporting is Off. It uses the same owner and requires
fewer report-capable actors. The selected optional surface can reduce the handoff
before a tracked report exists, but no source here quantifies that benefit or
proves Core users' preference. There is no reason to mandate a new preliminary
report for gifts already entering finance through a valid existing route.

Before release, actual owner/API/database proof must establish intake isolation,
same-item continuation, correction, current authorization and truthful recovery.
Representative phone and assistive-technology tasks should verify that users
distinguish report acceptance from financial recording and physical handoff.
No interview, pilot, UI test, runtime exploit, real donor/contact call, provider
test, old model/probe rerun, dependency or formal owner change occurred here.
