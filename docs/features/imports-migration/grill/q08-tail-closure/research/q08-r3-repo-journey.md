# Q08-R3: The whole move-or-end journey against owner text and code

_Repo-only research for Phase 30 Q8. Baseline `develop` 629cb71dc, 2026-11-02. Re-verifies and extends `q08-r1-repo-tail-closure.md`. GitHub was read only._

**Labels.** _ratified_: a Phase 30 founder decision (DL). _published_: owner PRD or contract text on `develop`. _proposed_: research, review or Q8-as-asked text. _implemented_: code or migration at 629cb71dc.

**Abbreviations.** DL = `grill/decision-log.md`. Q8 = `q08-decision-as-asked.md` (proposed). P04/P13/P16 = Phase 4/13/16 PRDs in `docs/prds/sitestacker-parity/`. P17 = the Phase 17 PRD; P17C = `phase-17-system-message-census-2026-07-19.md`. P25R/P25I = `phase-25-donor-dashboard-depth/contracts/recurring.md` / `identity.md`. P28F = `phase-28-missionary-workspace-depth/finance-stewardship.md`. P03 = Phase 3 PRD. Q1AR/Q7AR = adversarial reviews. r2-ext = `research/q08-r2-external-moving-donors.md`.

**Nothing in this journey is implemented.**

- Checkout is one-time only; monthly links are coerced (`apps/donor/app/(public)/(solid)/checkout/checkout-donation.ts:182-192`).
- Stripe recurring code only maps webhooks onto the red-listed `donor_pledges` row (`packages/api/src/stripe/recurring.ts:17-22`).
- `legacy_account_invitations` exists as a table only (`supabase/migrations/20261025090000_account_claim_and_invitation_tables.sql:79-107`); no TypeScript reads or writes it (grep).

## 1. Donor move flow

**Identifying the donor safely.** Three owner mechanisms are close; none is a "move link".

- **P16 secure confirmation (published).** "A donor confirmation can use an accessible expiring SMS/email/QR/e-sign/provider step without account creation or case reconstruction" (P16:1242); CTA **Send secure confirmation** (P16:1240, :2375).
  - #815 (OPEN, unassigned) designs `recurring_authorization_challenges`: `delivery_channel (email|sms|qr|staff_present)`, a hashed single-use token, a read-only GET, a "deliberate CSRF/re-auth protected POST", bound to "one exact current command … intended authorizer".
  - Limit: one staff-prepared case on an existing Asym commitment. "No bulk action may widen exposure, redirect, bind methods, remove limits, or restart donors" (P16:1236).
- **Phase 4 legacy invitations (published).** One donor per invite, "branded, expiring, single-use, revocable" (P04:92-95), 7-day default, "Bulk reserved" (P04:243, :368), never sent to suppressed addresses (P04:95). A 7-day invite cannot span Q8's 5-week campaign. Claiming is optional and separate from giving authority (P25I:23).
- **Sign in (published).** Email-first, safe link plus code, on the verified organization host (P25I:13, :23). Imported donors have no login (P04:36).
- **"Move link".** Used in Q7AR:83 (edge case 18) and Q8 part 2, and defined nowhere (proposed).

**Hosted confirmation of an already-copied method.** P13 story 173's hosted "confirm your recurring gift" flow (P13:546) is a reserved non-goal of the migration workstream (P13:159-164, published). "Current qualified saved methods may be reused under new authority without unnecessary re-entry" (P25R:151). CVC recollection and 3DS use Payment Element through one finalizer (P25R:79, :143, published).

**Re-entry.** Canonical checkout, Express Checkout first with Apple Pay, Google Pay and Link (P13:272, :1562; P16:766; P25R:139, published). Wallet cards cannot be copied (r2-ext:54, proposed), so wallet donors always re-enter. "One responsive workspace, not a modal maze" (P16:1240); no migration-specific mobile text exists.

**Changing amount, frequency or designation while moving.**

- Restart suggests only "source-certified … amount per occurrence, original currency and typed frequency". Current choices apply, and an old end date is not carried forward (P16:680-689; P25R:147-151, published). So a donor can change terms.
- Q7 calls a replacement "for the same supporter and designation … a continuation unless staff mark it a stop" (DL:290, ratified). It says nothing about a move that changes designation. DON-09 silence depends on the successor link (DL:292; O33).

**First charge on a future date. No deferred path exists in owner text.**

- "Exactly one immediate initial contribution is attempted per disclosed compatible cohort" (P16:690). CAL-03: "Future start June 1 submitted May 10 charges May 10 once" (P16:2653).
- P25R:153 closes the door explicitly: "Future-start initial is outside the continuing series … No trial/proration/anchor-now substitute" (published).
- The only no-charge state is `pending_activation`, entered on "initial card success or ACH activation acceptance" (P16:2012-2013), so it is not a deferral.
- Standalone SetupIntent is "explicit on_session usage for donor-present future checkout"; "usage optimizes provider behavior but is not permission" (P25R:77, published). Q8 part 3's "first Asym charge … after the old arrangement has provably stopped" therefore needs a new off-session first-charge authorization. That also moves SCA/3DS from the checkout session to a later merchant-initiated charge.

**Bank debits.**

- US ACH mandate terms are counsel-gated (P16:18, :2919, published). Stripe's `pm_` ACH import emails donors to confirm their mandate (r2-ext:57, proposed); no owner text aligns Asym messaging with it.
- No PRD mentions PAD or `acss_debit` (grep). Rule H1 s.28 needs 10 days' notice for an assignment (r2-ext:59, proposed). **Canadian bank-debit donors have no Asym rail** and can move only by card.

**Successor link.** `commitment_successor_links` exists with kinds `recurring_line|fixed_total_pledge`. It "transfers no money, fulfillment, collection authorization" (P16:1983-1987, published).

- Restart mappings are "unique and immutable" per accepted command (P25R:159).
- No command creates a link from an imported external line to a new Asym line (inferred). #834 (classification) and #813 (restart) are OPEN and unassigned.

**Portal during and after.**

- During: external arrangements appear under "manual/external Other commitments" (P25R:229; P16:1148, published). Q7 gives donors Q4's sentences "plus how to change or cancel their arrangement and an offer to move it to Asym" (DL:283, ratified). P25 defines no move action or CTA.
- After a move: "new successors do not by themselves keep a predecessor Current" (P25R:27, published), so the old arrangement moves to Past once it is terminal.
- After an end: Past, with neutral ended styling (P25R:33).

## 2. Messages

**No key covers any campaign touch.**

- P16 reserves nine keys and none is a move, reminder or end notice (P16:2898-2908). Every key is Reserved (P16:2910).
- P17C: "Recurring arrangement created/confirmed" is deferred: "Do not infer a key from UI confirmation" (P17C:357). Cancellation email is "deferred" (P17C:359). The claim invitation is Reserved (P17C:344).
- No census row covers delivery of the secure-confirmation challenge. #815 treats "Phase 17 rendered template resolution" as "an unnumbered hard stop for any rendered dispatch".

**The direct-send ban (published).**

- "Reserved status never authorizes a direct-send workaround: if the exact required notice contract is not Live, the affected payment/recurring lane is release-blocked" (P16:907).
- The same rule appears at P25R:265-267: "Reserved/unknown produces zero communication … Required … notices cannot be bypassed by … Reserved direct-send".
- Phase 30 never sends (DL:40). Q4's precedent: Asym supplies text and the ministry sends it through its usual channels (DL:151, ratified). That cannot carry per-donor secure links without exporting tokens (inferred).

**Classification.** `transactional | marketing` "becomes a derived adapter output from the producer contract" (P17:304); service messages are "structurally separated from marketing" (P17:159); the Service layout covers "recurring notices" (P17:1594, published). Nothing classifies a move invitation or an end notice.

**Do-not-contact is an absolute floor, including for service mail.**

- "`do_not_contact` remains the absolute contact floor" (P03:401). Staff or system email to a do-not-contact donor "is blocked fail-closed" (P03:306).
- ADR-0220: "Do-not-contact and applicable channel restrictions fail closed, including receipts" (`docs/adr/0220-freeze-the-send-time-consent-evaluation.md:16`, Accepted).
- P25 research rejects "a required-message exemption from all contact restrictions" (`phase-25…/research/phase25-r07-question-brief.md:63`). Code blocks transactional email for `do_not_contact`, bounce, spam and manual suppressions (`packages/api/src/email/consent.ts:15-26`, implemented).
- C10: "do-not-contact and withdrawal are hard floors" (DL:316, ratified).
- **Under owner text, an end notice cannot go to a do-not-contact donor by any Asym channel.** Q8's "staff handle them personally" (Q8 part 2) is also contact, so it conflicts with the floor.
- Q1 clause 12 also makes the ministry carry Asym do-not-contact into SiteStacker (DL:44). SiteStacker's own cancellation message would then be suppressed too (inferred).

**Sender identity (published).** Tenant-owned Resend, "no shared Asym fallback" (P17:86), versioned Sender Profile (P17:361); invitations "come from the ministry (branded)" (P04:93).

**Old-system messages.** Its cancellation messages at a move are a ministry setting (DL:280, ratified). PayPal does not document emailing the donor when a merchant cancels (r2-ext:123, proposed).

## 3. Staff and tenant journey

**Where the campaign runs: nowhere owned.** Phase 30 never "runs re-authorization or proves an executor stopped" (DL:40, ratified). The Switch page exists only in proposals (Q1AR:1566; Q5AR:137). Phase 16's desk is per-case (#814, #815 OPEN) with no bulk widening (P16:1236). The migration workstream "owns … reauthorization campaigns" (P13:743-746, published) and has no owner (O12, DL:383).

**"Not yet moved" list.** Backfill review lists "stops, continuations, leaks … and possible double giving" (DL:294, ratified), not move status. Q1AR:2168 proposes per-cohort confirmation share and unconfirmed amount per missionary (proposed).

**Who can end an arrangement.**

- Phase 12 registers Phase 16 capabilities ("authorization-bound recurring service"); "Staff capability proves only operator authority" (P12:15-24, published). Stop is **Apply now** (P16:1229), "never called donor cancellation unless donor requested it" (P16:1232).
- External/read-only executors cannot be commanded: "never adopt by metadata or start a competitor" (P16:1264). An end is therefore "source stop evidence, or a stop staff confirm in the backfill review" (DL:290, ratified).
- Asym's cancel path shows "Cancellation requested — provider confirmation pending" until stop proof exists (P16:1293, :2018).
- A "separately gated bulk protective block may only narrow/stop unsafe collection" (P16:1236). Whether a planned end at the cap counts as protective is unstated.

**Cancelling old schedules and proving stop.**

- The ministry cancels in SiteStacker, PayPal or the gateway (inferred from DL:34, :40).
- Stop-evidence classes for non-Stripe executors are O14, which is unowned (DL:385). #809 covers the Stripe adapter only.
- "Planned disconnect is blocked until inventory proves every executor canceled, migrated, or explicitly handed off" (P16:1289, published).

**Closure checklist (ratified).** Q1 clause 12 items block tail closure (DL:44); Q4 attestations block decommission only (DL:132-136).

**Switch lead reminders (ratified).** "The product itself reminds the Switch lead of open items and deadlines" (DL:204), plus one backfill-overdue reminder (DL:287). Nothing reminds for "end notice due" or "arrangement active 30 days before closure" except Q1AR:2166 (proposed).

## 4. Missionary journey

- **No controls (published).** Missionaries "cannot resume, cancel, change payment, or change schedule" (P16:672). They see Q7's label "{previous system} · gifts shown up to {date}" (DL:282, ratified).
- **No automatic tasks, no "lapsed" (published).** Confirmed misses are informational and create no automatic "outreach task or donor message" (P28F:865-873). Copy "SHALL NOT label the person or relationship 'lapsed'" (P28F:52-53).
- **Privacy (published).** An anonymous or contact-ineligible path "creates no actionable named-contact task" (P28F:338); "Contact actions require independent current purpose/channel authority" (P28F:330-331); no "missionary private payment data" (P25R:265).
- **Conflict with an earlier non-adoption.** Notifying missionaries "so they can invite a restart" was not adopted in Q7 (q07-v1:147). Q8 part 2's missionary follow-up is new scope needing a Phase 16/28 "not yet moved" fact filtered for anonymity, restricted Parties (Phase 10) and do-not-contact.

## 5. Finance

- **Processor authority (ratified).** The original processor "stays authoritative for settlement, refunds, disputes and returns on charges it executed" (DL:34). A legacy charge after a move is "recorded, flagged for refund through the original processor" (DL:293).
- **Window versus closure.** Ratified clause 6: "Phase 30 runs no backfill after closure" (DL:38). Q1AR's A3 "final backfill after the dispute and return windows" (Q1AR:33, proposed) was not ratified. Q8 part 4 fixes this by making the 120/60-day window part of the tail. Two side effects need explicit text:
  - **Licence.** DL:34 says "Until closure the ministry keeps SiteStacker licensed", but Q8 says SiteStacker "can be switched off once its last charge has run". That amends DL:34.
  - **Source basis.** DL:38 makes SiteStacker exports the single source "for gifts SiteStacker runs". Reversals "from processor reports" after the last charge change the source for that executor and period, which needs Q1 clause 9's overlap proof (DL:41).
- **Tax.** Reversals inherit Recorded outside Asym (DL:119, ratified).
- **Shutdown risk (proposed).** Ending SiteStacker or a processor contract before closure loses dispute evidence (r5 E-52, `q01-r5…:310`; monitor Q1AR:2169).

## 6. Phase 16 conflicts (verified)

1. **Stop before activation.**
   - P16:1314: "proof the old executor stopped plus … fresh … authorization before new activation". P25R:161: "Unknown/lost old executor stop blocks unsafe restart". r4 M9: "no create-then-cancel".
   - DL:40 (ratified): PayPal "cancelled only after the replacement is active". **This is still a contradiction.** Q8 part 3's order (confirm, cancel, charge after proof) matches P16 only if "confirmed" is a new non-active state, and none exists.
2. **Immediate initial charge.** P16:690, CAL-03 (:2653) and P25R:153 ban a deferred first charge. Q8 part 3 needs an owner amendment.
3. **Cadence as governed SLA.**
   - Q7: "The cadence is recorded as the feed's governed SLA" (DL:287). P16 says "a filename, uploaded spreadsheet … is not authenticated structured remittance" (P16:1886). Structured-feed overrides are "bounded from 5 minutes through 7 days" (P16:1072).
   - **New finding.** Q8's weekly default (7 + 7 = 14 days) equals the mailed/manual default; fortnightly (21) fits its 7–30-day band (P16:1076). The conflict disappears if Q7's wording becomes the manual review interval, not a structured-feed SLA.
4. **Bulk restriction.** Q8's per-donor prefilled confirmation for every tail donor is bulk issuance of authorization asks. P16:1236 forbids bulk binding and restart, but not bulk _requests_ for donor-completed authorization. That needs an explicit ruling.
5. **Counsel gate.** "Cancellation, required network notices" need counsel and processor approval (P16:18, :2916-2924). No rule on notice timing before a merchant-initiated stop was found (r2-ext:133, proposed).

## 7. O12 status

- **O12 is unowned.** "Name owners for the processor half of the 'separate migration workstream' … Precondition for offering a switch to any ministry with recurring giving" (DL:383, ratified as a requirement only). P13:743-746 and :2192-2199 (published) still name no owner.
- **O13 (post-boundary intake) and O14 (non-Stripe stop proof)** are also unowned (DL:384-385).
- **Issues (`gh`):** OPEN, unassigned, updated 2026-10-19: #711 (import-aware ledger), #809 (formal cutover, Stripe-only), #834 (legacy classification), #813 (restart), #814/#815 (staff desk, challenges), #706–#710 (Phase 13 recurring), #793 (Phase 16 epic). #506 (claim/invitation tables) is CLOSED; its producer is missing. A search for re-authorization, vault, migration workstream and formal cutover found no issue for vault copy, re-authorization campaigns, PayPal cancellation evidence, move messages or the end notice.

---

## Journey gaps (what nobody owns)

| #   | Step                                       | Why unowned                                            |
| --- | ------------------------------------------ | ------------------------------------------------------ |
| G1  | Running the campaign                       | Phase 30 excluded (DL:40); O12 ownerless; P16 per-case |
| G2  | Per-donor move link, no login, 5+ weeks    | #815 per-command; P04 invites 7-day, bulk reserved     |
| G3  | Confirm now, charge after predecessor stop | Banned (P16:690, :2653; P25R:153)                      |
| G4  | Successor link from imported line          | No command (P16:1987); DON-09 depends on it            |
| G5  | Campaign and end-notice messages           | No key; direct send banned (P16:907)                   |
| G6  | Do-not-contact and suppressed donors       | Absolute floor (P03:401; ADR-0220)                     |
| G7  | "Not yet moved" list                       | No projection; P28 privacy filters unstated            |
| G8  | Non-Stripe stop proof                      | O14 unowned; #809 Stripe-only                          |
| G9  | Canadian PAD donors                        | No Asym PAD rail                                       |
| G10 | Portal "Move to Asym" action               | DL:283 promises it; P25 lacks it                       |
| G11 | Notice-deadline and closure-risk reminders | Only Q1AR:2166 (proposed)                              |
| G12 | Reversal source and licence timing         | Q8 part 4 amends DL:34, :38 implicitly                 |

## Minimum owner text needed

1. **Phase 13/16 (O12):** name the owner of move campaigns, vault copy and executor replacement, and edit P13:743-746 and :2192-2199.
2. **Phase 16 + Phase 25: a move-start variant.** It needs:
   - acceptance with no immediate charge;
   - a state named "Confirmed — starts after your last gift through {previous system}";
   - the first ordinary charge on the first due date after recorded predecessor stop proof;
   - off-session future-use authorization (SetupIntent `off_session`) with 3DS at confirmation;
   - both dates disclosed;
   - expiry and donor messaging if stop proof never arrives.

   This amends P16:690, CAL-03 and P25R:153.

3. **Phase 16: the move link.** A #815-style challenge with purpose `move_confirmation`, bound to the imported line and its intended authorizer. Lifetime must be at least the campaign. It must work without login. Bulk issuance is allowed and bulk acceptance is not (clarifies P16:1236).
4. **Phase 16: a successor-link command** from an externally managed line to its Asym successor, written atomically at acceptance (P16:1987).
5. **Phase 17 + Phase 16 keys (all Service class, tenant Sender Profile):**
   - `recurring_move_invitation_v1` and its reminder;
   - `recurring_move_confirmed_v1`;
   - `recurring_external_end_notice_v1`, with the last-charge date, the notice date and a restart link;
   - challenge delivery.

   State whether invitations count as relationship or service mail.

6. **Phase 3 owner ruling on do-not-contact.** Either confirm that do-not-contact donors receive no notice and their gifts end without Asym contact, with staff seeing an "ends without notice" flag, or create a narrow, counsel-approved required-notice exception. Choosing the exception amends P03:401 and ADR-0220.
7. **Phase 16 + Phase 28: a "not yet moved" projection.** Staff get the full list. Missionaries see only recognition-permitted, contactable partners. It creates no automatic tasks and never uses "lapsed" (P28F:52, :338, :865).
8. **Phase 16 (O14): stop-evidence classes** for SiteStacker, PayPal (cancel or `srt` exhaustion) and gateway-native executors, with the ministry recording each cancellation.
9. **Phase 30 amendments with Q8:**
   - DL:34's licence clause;
   - the source basis for reversals after the last charge;
   - re-word DL:287 as the P16:1076 manual review interval, not a structured-feed SLA.
10. **Phase 16:** a Canadian PAD rail, or an explicit card-only move with Rule H1 notice handled.
11. **Phase 25:** a move action and copy on external arrangements (DL:283).
12. **Counsel:** end-notice wording and minimum lead time, US ACH re-mandate, PAD notice (P16:18).
