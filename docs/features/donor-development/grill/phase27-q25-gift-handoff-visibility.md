# Phase 27 Q25 — gifts awaiting finance

2026-10-11, Asia/Bangkok. **Reviewed D24 and amended D25 explicitly ratified; Q25 answered A.**
Research and interview only. This asks about an operational responsibility of
appeal work; wording, layout, ordinary reminders and recovery stay under D21's
delegated design judgment.

## Why this question is next

[D24](phase27-d24-adversarial-review.md) now settles the recorded working list.
The [roadmap's open decisions](../../../prds/sitestacker-parity/roadmap.md#phase-27-open-decisions)
and original founder brief explicitly reserve whether Received and Given represent
two meaningful events. The brief specifically asks about a gift physically in hand
versus one processed by the donation system. [Initial financial research](phase27-financial-research.md)
also leaves that source-qualified product question open. D22/D24 already prevent
list membership, a response or a status change from inventing received money.

The useful fork is whether **appeal staff explicitly track the handoff to finance**.
It is not whether to redefine received money, duplicate gift entry or require staff
to move every supporter through another mandatory stage. A source can have both a
recorded gift and a different gift still awaiting finance; a single exclusive
supporter status must not erase either fact.

## Founder question — answered A

**Q25 — When someone hands staff a check for an appeal, should the appeal track
the handoff until finance records the gift?**

For example, a church hands a staff member a check. The check is in hand, but
finance has not yet recorded the contribution. This is an illustrative scenario,
not a claim that every ministry follows this process.

**A — Track gifts awaiting finance (recommended).** Show a clear **Awaiting finance**
item with a responsible person and a link to the existing gift-intake process.
Staff can follow through until the financial record is available. Keep the pending
item separate from recorded gift totals; show this step only when applicable.

**B — Keep that tracking in finance.** The appeal shows source-backed recorded
gifts. Staff use the existing finance intake process and ordinary notes/tasks for
earlier handling, without a dedicated handoff view in the appeal. This keeps the
appeal simpler but requires staff to follow that pending work elsewhere.

**Recommendation:** A. It gives appeal staff a clear answer to “What still needs
to reach finance?” while keeping financial truth in its established home. Reuse
qualified shared intake/work instead of a second gift record or another queue.
This recommendation is product judgment supported by the original brief and a
published ministry-product example, not measured staff preference.

## Boundaries in either option

- P15 owns staff-entered offline gift intake, including lightweight single-gift
  entry. P13 owns recorded effective financial facts; P16 owns conserved commitment
  fulfillment. A dedicated appeal view consumes qualified source facts/actions,
  not a new P27 money writer, mutable received counter or separate custody ledger.
- A draft row, donor promise, email saying “the check is coming,” received-date
  field or staff note alone is not proof that an authorized person currently has
  the gift. Any dedicated pending handoff needs qualified source evidence and
  current responsibility. Do not label every unposted draft “gift in hand.”
- Pending handoff never counts as received funding, settlement or commitment
  fulfillment. Posting, physical deposit and bank clearance remain different.
  “Recorded by finance” does not promise irrevocably cleared funds. Corrections,
  returned payments and exact Legal Entity/currency meaning remain source-owned.
- Selection of A requires qualification of the narrow P15 source handoff/read
  seam and permitted source actions. Its absence is not permission for a local
  shadow record or a claim that the capability already exists. Required source
  capability must be completed coherently before the affected feature releases;
  the whole future finance product is not automatically a dependency.
- Staff/missionary views, identity, financial details, attachments and task links
  obey current source and P12 permissions. A handoff assignment, appeal link or
  physical possession creates no new permission or donor identity authority.
- Neither choice sends an acknowledgment, creates a tax receipt, starts another
  Request/journey or marks a financial promise fulfilled. D22/D23/D24 distinctions,
  current restrictions and native source-work ownership remain intact.
- The choice does not settle financial association/attribution, report formulas or
  every response bucket. Preserve those branches in the coverage register. No new
  approval or status-setting ceremony follows from this question.

## Evidence and confidence

Repository inspected at `225c02e9499bd6c0d493223cd4b1a4120ff787e3`; fresh source and
primary-page checks on 2026-10-10 UTC. Two independent read-only owner/practice
checks agreed that this was a genuine remaining product fork. Those initial
checks changed only the ratification/question record; the subsequent D25 review
and its bounded new experiment are recorded below.

- [P15 one front door](../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:58)
  owns both batch and single-gift intake. [Staged rows](../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:1955)
  precede commit; [tender evidence](../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:2000)
  includes distinct received-date and cash receiving-staff facts. Those planned
  fields alone do not establish a current physical-custody projection for appeals.
- [P16 Received](../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1101)
  reads the P13 effective ledger. MPDX's labels cannot be imported unchanged into
  Core's settled money vocabulary.
- The [current offline dependency boundary](../../../../packages/api/src/admin/contributions/offline-dependencies.ts:30)
  is unbound and returns 501. The future intake contract and neighboring UI do not
  prove an implemented appeal handoff or any live environment's behavior. P15
  retires this legacy bridge; its old comments do not authorize wiring the retired
  donations-based path instead of the governing contribution owner.
- Freshly opened [MPDX Track an Appeal](https://help.mpdx.org/article/191-track-an-appeal)
  (updated 2021-11-02) and [Flows View](https://help.mpdx.org/article/774-flow-view-for-appeals)
  (updated 2022-10-13) distinguish Received, physically in hand, from Given,
  processed by the donation system. These older published guides support a real
  comparable distinction; they do not prove its frequency, current runtime behavior
  or desirability for all missions organizations. Their writable buckets are not
  Core financial authority.

The [ratification/continuation checks](d24-ratification-q25-validation.json) preserve
the exact reviewed D24 decision, all earlier evidence and glossary at question
creation. They are dated evidence; they do not describe the subsequent answer.
Formal PRD/OpenSpec and issue publication remain separately invoked through
/to-prd and /to-issues.

## Recorded answer and complete review

The founder selected **A — Track gifts awaiting finance** and requested the full
adversarial review. [D25](phase27-d25-adversarial-review.md) records the disposition
**Accept with required amendments**, the exact corrected decision, all 22
categories, R01–R19 and AC01–AC32. The founder subsequently instructed, “Yes, ratify this amended D25.” The exact
reviewed wording and safeguards are now explicitly ratified; no routine design
question or repeat ratification is pending.

The required amendment makes the P15-owned report/accountability source explicit,
including truthful unresolved intake and same-item continuation. Existing incomplete
staging is reused when scope and authority fit; a new precursor table or compulsory
extra step is not prescribed. Trusted recorder, reported receipt/handling and next
responsibility are separate. Exact financial-source evidence resolves recording;
posting does not end remaining physical handling, and transfer does not post money.
An incidental note or assignment edit cannot make an already recorded gift unrecorded.

The appeal consumes permitted source facts/actions. Pending reports are not received
funding or fulfillment, confer no finance power, and create no receipt/message.
One source occurrence follows the item without another appeal queue, fake donor,
guessed entity/currency, check image, forced approval or duplicate financial entry.
The small mobile report does not expand P15's desktop/tablet entry-grid contract.

The new [isolated consumer-recovery experiment](d25-evidence/handoff-probe/README.md)
passed 7/7, including three observed two-session schedules. It used independently
seeded financial facts and proves neither actual P15 posting nor production P12/RLS,
physical custody, tasks or UI. The [independent review](d25-evidence/independent-review.md)
and [document checks](d25-evidence/review-checks.json) record final synthesis and
preservation. No product implementation, formal owner amendment, live data change,
practitioner interview or pilot is claimed.
