# Q8 v2: journey, UX and operations review of Option A (end with notice)

_An independent, read-only review written on 2026-11-02 against `develop` at `629cb71dc`. Q8 means `q08-decision-as-asked.md`. DL means `grill/decision-log.md`. P03, P13, P16 and P17 are the owner PRDs, P25R is `phase-25…/contracts/recurring.md`, and P28F is `phase-28…/finance-stewardship.md`. Evidence labels: **[V]** is an external fact verified today by fetching the URL, **[R]** is a repo fact at file:line, **[I]** is inference and **[A]** is assumption._

## 0. Verdict

Option A is the right default and matches vendor practice: a dated deadline, a prefilled link, and personal follow-up (q08-r2 §3–4). As written, though, it does not yet add up to a journey. It:

- never fixes the date a gift ends;
- contacts donors while a switch can still be aborted;
- requests card copies too late to prefill anything;
- hides about 2,000 manual cancellations from a part-time admin;
- splits "move" and "restart" into two flows that each fail;
- contradicts the do-not-contact floor;
- rests on about ten capabilities that are unbuilt and mostly unowned.

All of it is fixable by narrowing: one deadline, one link and flow, one cancel list, and one invariant: **no gift is ended for a donor who was never offered a working way to continue.**

## 1. Journey maps

**Default timeline (proposed in §4):**

- **G** is go-live.
- **L** is the campaign launch: after G, once the card copy has landed, and no later than G+14 days.
- **D** is the move deadline: by default L + 10 weeks, never after the cap.
- **Messages:** the invitation goes at L, reminders at L+7 and L+21, the end notice at D−30 or earlier, a last reminder at D−7, and an "ended" note within 10 days of the last charge.

**Copy rules for every message:** it comes from the ministry. It never says "Asym", "legacy", "failed", "paused" or "cancelled by you". It never asks for card or bank numbers. It names one person to contact. It has one button.

### J1. Donor whose card was copied

| Step                      | Sees                                                                                                                                                                                                | Does            | Mobile / a11y                                                                                                | Failure / edge                                                                                                                                                 | Owner                                      |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 1. Pre-announce, before G | Usual newsletter or missionary note: "Watch for an email from {ministry}; we'll never ask for your card number by email."                                                                           | Nothing         | Plain text                                                                                                   | Defuses phishing look-alikes [I]                                                                                                                               | Ministry, with Asym-supplied text (DL:151) |
| 2. Invitation (L)         | "Keep your monthly gift to {Missionary} going": one email for all their gifts, the deadline, "no need to re-enter your card"                                                                        | Taps one button | Real text, plain-text part, `lang`, 44 px button                                                             | Scanners prefetch links, so opening must change nothing [R P17:3809]                                                                                           | P17 key; ministry sender [R P17:86]        |
| 3. Page                   | Per gift: recipient, amount, frequency, card •••• 4242 and expiry, last old charge date, first new charge date, new descriptor. **Keep my gift going**, plus Change, Different card, Stop this gift | One tap         | 320 px reflow; 44 px [R `contracts/shared.md:27`]; no re-entry (WCAG 3.3.7) [V w3.org new-in-22]; 3DS inline | Card expired by the first new date: shown as J2. Fund closed: "choose where to give". A raised amount or new designation needs a pasteable email code (3.3.8). | P25 page; P16 move-start                   |
| 4. Confirmed              | "Your gift continues": both dates, descriptor, "{previous system} may email that the old gift was cancelled; that's expected", the Q4 receipts line                                                 | —               | —                                                                                                            | Whether the old system sends a cancellation email is a ministry setting (DL:280)                                                                               | P16/P17                                    |
| 5. Old schedule cancelled | —                                                                                                                                                                                                   | —               | —                                                                                                            | Late cancel moves the first date and the donor is emailed. A later old charge is refunded (DL:293).                                                            | Ministry; P16                              |
| 6. First new charge       | Receipt                                                                                                                                                                                             | —               | —                                                                                                            | More declines on a new merchant ID [V docs.stripe.com/get-started/data-migrations/pan-import] lead to activation repair and a staff status                     | P16                                        |

### J2. Donor who must re-enter (wallet card, expired card or a card that wasn't copied)

As J1, except the email says "you'll add a card or bank account (about a minute)". The page prefills amount, frequency, designation, name and email, and offers Apple Pay, Google Pay and Link first [R P13:272; P25R RC15].

**Edges:**

- Wallet cards cannot be copied [V docs.stripe.com/get-started/data-migrations/payment-method-imports].
- A donor who abandons partway keeps a reusable link, and reminders continue.
- A timeout keeps what was typed (WCAG 2.2.1).
- A gift started from the public page appears as "possible double giving" (DL:294), and staff call.

### J3. US ACH and Canadian PAD donor

**US ACH.**

- Stripe emails donors to "confirm the mandate" after a `pm_` import, and sends nothing for `ba_` [V payment-method-imports]. Name that email in the pre-announcement, or import as `ba_`.
- The page shows the bank •••• last 4 with the mandate text.
- Keep the day of month. A shift needs 7 days' notice [V docs.stripe.com/payments/ach-direct-debit via r4].

**Canadian PAD.**

- Asym has no PAD rail [R q08-r3:40], and Connect PAD mandates cannot be cloned [V via r4 §4]. The cohort is not invited until a rail exists, unless the ministry records a move by card.
- The end notice needs at least 30 calendar days' written notice "before ceasing to issue PADs" [V payments.ca h1eng.pdf s.31(a)].
- A donor who stops gets the final PAD date within 10 days [V s.31(b)].
- Claims run 90 days [V s.24(g)].

### J4. PayPal subscriber

Re-enter as in J2. Asym checkout offers no PayPal [R P13:272].

- Copy: "PayPal may email you that your subscription ended; that's expected."
- The ministry cancels each subscription in PayPal. The first new charge follows proof from PayPal's report.
- Subscriptions with `srt=52` end on their own [R q01-r2:339] and are flagged "may already have ended".
- Expect higher attrition among PayPal-loyal donors [A]; measure it separately.

### J5. Do-not-contact or no-email donor

- **Do-not-contact:** no message on any Asym channel [R P03:401; `docs/adr/0220…:16`; `packages/api/src/email/consent.ts:15-26`]. Q8:14's "staff handle them personally" is contact too. Shown as **Can't contact — decide** until a ruling (C6).
- **Marketing-unsubscribed:** these donors still get service mail [R consent.ts:20-21], provided the messages are classified as service mail.
- **Bounced or no email:** a **Mail or call** list with a printable letter (QR code and office phone).
- **Deceased:** no messages; staff end the gift.
- **No SMS:** it is structurally dark [R P17:2022; ADR-0028].

### J6. Donor who never responds

1. The invitation goes out, then reminders at L+7 and L+21. Personal contact starts in week 2.
2. **End notice at D−30:** "Your monthly gift of $50 to {Missionary} through {previous system} will end after {D}. Your last gift will be on {date}. You don't need to do anything to stop it. To keep giving, tap **Keep my gift going** — it takes a minute. Questions? {Name}, {phone}."
3. A last reminder goes at D−7, and the ministry cancels at D.
4. **"Ended" note:** "Your last gift through {previous system} was on {date}. Thank you. You can continue any time." It carries the same button.
5. **After D:** the same link starts a gift on the next due date, with no immediate or catch-up charge.

### J7. Switch lead

- **Before G:** readiness shows the move path Live for each rail and language. The sending quota covers the campaign; Resend Free allows 100 emails a day and 3,000 a month [V resend.com/docs/knowledge-base/account-quotas-and-limits]. The card copy is requested at go/no-go.
- **Launch (L):** preview every message in every language with a sample donor. Check counts by channel (email, mail or call, can't contact). Choose D, then **Launch** once. The first wave goes to 50 or fewer donors, including staff seed addresses; the rest follow 24 hours later.

- **Weekly:** one digest ("212 moved · 41 to cancel in {previous system}, 9 due by Friday · 6 bounced"), the **To cancel** list ordered by window end with bulk "Mark cancelled", and one backfill (one step when there's nothing to review).
- **Follow-up:** the not-yet-moved list filtered by missionary or amount; Resend, which revokes the old link; the mail-or-call export.
- **Closure:** after D, cancel what remains. Switching off SiteStacker's recurring engine stops it all [R q08-r1:63]. Then monthly backfills, closure at the end of the window, and decommission.

**Workload estimate [I]:** 3,000 tail donors × about 75% who move [V Tithely vendor claim, via r2] is about 2,250 one-at-a-time cancellations, plus PayPal's. SiteStacker has no bulk cancel tool on record [R q01-r2:46]. At about 1 minute each, that is about 4 hours a week for 10 weeks. It is feasible only with an ordered list and wide windows.

### J8. Missionary

- **Before L:** a workspace note with suggested wording for a personal message. No system send.
- **During:** a read-only list, **Partners moving to new giving**, with each partner's name, gift, status (Confirmed, Not yet, Chose to stop) and the deadline.
  - It shows only the missionary's own partners who allow recognition and can be contacted, plus a count of the others.
  - It has no tasks or alerts and never says "lapsed" or "at risk" [R P28F:52-53, :338, :865-873].
  - The missionary follows up personally and can ask the office to resend.
- **After D:** the list shows "Ended {date} — can continue any time".
- **Scope:** this is new P28 scope; Q7 did not adopt restart prompts [R q08-r3:103].

### J9. Finance

- Every last legacy charge falls on or before D.
- Refunds on old charges go through the original processor [R DL:34]. A legacy charge after a move is refunded [R DL:293].
- Dispute windows after the last charge: card 120 days and US ACH 60 [R `q01-r5…:199`]; Canadian PAD 90 [V H1], so Q8:16's "60 days (bank debit)" is too short for PAD.
- Disputes come from processor reports, with one source basis per period (DL:41).
- Gateway and PayPal accounts stay open until closure.
- SiteStacker is switched off only after final exports and the Q4 documents [R DL:125, :132].
- The board report shows moved monthly amount by currency.

## 2. Findings by category

### 1. Overengineering: material concern, yes (moderate)

- Q8:17 offers a weekly-or-fortnightly setting and runs weekly batches through the dispute window: about 17 manual exports after the last charge, when no gifts are expected.
- The fortnightly option also delays stop proof, which pushes first new charges back.
- **Fix:** weekly until the last legacy charge, then monthly, with no setting. This deletes the choice and about 12 batches. Q8:13's "ongoing external" path stays dormant until O13 exists.
- **Deleted from my own candidates:** SMS, open and click tracking, a self-serve resend page, missionary-initiated sends, per-donor schedules and A/B tests.

### 2. UX/UI and friction: material concern, yes

C3, C4, C5, C8, C9, C11 and C14 below. Against the requested best practices:

- **Kept:** one email per donor (now explicit), prefilled confirmation, no account.
- **Missing in Q8:** the deadline and what happens next; the last old charge date and new descriptor.
- **Added:** neutral copy, Edit and Stop, a revoking resend, personal outreach.
- **Unavailable:** SMS (C9). **Gated:** French (C8).
- **Accessibility:** Core's 44 px targets, stricter than WCAG 2.2 SC 2.5.8's 24 px [V].

### 3. Operational burden: material concern, yes (C2)

- Asym help access can never send [R DL:194], so one part-time admin runs everything [A: q05-v2 assumption].
- **Needed:** launch once, automatic sends, one weekly digest, a cancel list with wide windows, and the old-system cron switch-off for remaining gifts at D.

### 4. Observability and auditability: material concern, yes (C10)

Q8 gives only a "not yet moved" list. It also needs counts of donors and amount per currency by status and path, bounced and failed counts, the cancel-queue age, and a per-donor timeline.

### 5. Scalability and performance: material concern, yes (C7)

Deliverability, not compute.

### 6. Migration, rollout and upgrade: material concern, yes, the most severe (C1, C3, C13)

If the move path isn't Live when the design partner switches, Option A would end gifts with nothing to move to. There is no interim workaround: checkout is one-time only, and P16:907 bans direct sends.

### 7. Testability, traceability and proof: material concern, yes (C12, C14, C17)

Q8 has no falsifiable criterion. Its terms drift, and "Phase 16 accepts" is unagreed.

### 8. Other hazards: material concern, yes (C15, C16)

Failed first charges after a move, and forwarded links.

## 3. Concerns, ranked

Every concern changes or narrows the answer. "Spec" points to the exact text in §4.

**C1. The journey rests on unbuilt, mostly unowned capability. Critical; likelihood high.** At the cap, gifts end for donors who were never sent a working move. Checkout is one-time only [R `apps/donor/app/(public)/(solid)/checkout/checkout-donation.ts:182-192`]. The move link, move-start variant, successor link, message keys and non-Stripe stop evidence are unowned or banned [R q08-r3 G1–G12; P16:907 bans direct-send workarounds]. O12 has no owner [R DL O12]. **Effect:** narrows. **Fix:** an invariant plus a scheduling gate. **Spec:** §4.1, §4.8.

**C2. Hidden per-donor cancellation and a timing race. High; likelihood high.**

- **What goes wrong:**
  - Q8:15 starts Asym's first charge "after the old arrangement has provably stopped", but nobody is assigned to cancel the old schedule.
  - SiteStacker cancels one gift at a time [R q01-r2:46].
  - The page can't show a firm first date.
  - A slow cancel skips a gift, because catch-up is banned [R P25R:161ff].
- **Fix:** fix both dates at confirmation: the last old charge is the next one already scheduled, which gives a monthly gift about a month to cancel. Add an ordered To cancel list; weekly backfills supply the proof.
- **Spec:** §4.4.

**C3. Contact on switch day collides with the abort window and card-copy lead time. High; likelihood high.**

- **What goes wrong:**
  - Q8:14 invites donors "on the day the old system stops taking new gifts", but a switch can be aborted until go-live [R DL:42].
  - Card imports take "a few days to several months" [V pan-import], so nothing is copied in time to prefill.
- **Fix:** request the copy at go/no-go; launch after G, once the copy lands, within 14 days.
- **Spec:** §4.2, §4.8.

**C4. The end date is undefined. High; likelihood high.**

- **What goes wrong:**
  - Q8:13 ends gifts "at the cap", but Q8:14 sends the end notice after week 5, leaving up to 10 months of silence.
  - "30 days before the last legacy charge" is a different date for each donor.
  - The PAD window is 90 days, not 60 [V H1 s.24(g)].
  - The cap bounds the last charge, not closure (Q8:16).
- **Fix:** one deadline D per campaign. The notice goes at least 30 calendar days before D, which satisfies H1 s.31 on a conservative reading [V; counsel to confirm]. Windows of 120, 60 and 90 days.
- **Spec:** §4.1, §4.2, §4.7.

**C5. Move and restart are two flows that fail at a seam. High; likelihood medium.**

- **What goes wrong:**
  - Before the last charge, the "restart link" goes to canonical checkout, which charges immediately [R P25R:153] while the old system still charges: a double charge.
  - After D, a restart is blocked while the old stop is unproven [R P25R:161].
- **Fix:** one link and one Continue flow, before and after D, with the first charge always on the next due date after stop proof. This deletes the restart path.
- **Spec:** §4.3.

**C6. Contact floors and message class. High; likelihood high.**

- **What goes wrong:**
  - Q8:14's personal handling of do-not-contact donors breaches P03:401 and ADR-0220 [R].
  - An unclassified message is treated as marketing [R consent.ts header], so donors unsubscribed only from marketing (likely many [A]) would miss every invitation and then be ended.
  - PAD donors must receive notice [V H1 s.31].
- **Fix:** classify the messages as service mail (CAN-SPAM relationship content; CASL s.6(6)(b) and (d) [V laws-lois.justice.gc.ca E-1.6]). Request one Phase 3 and counsel ruling. Until then, do-not-contact arrangements need a recorded ministry decision.
- **Spec:** §4.2, §4.5.

**C7. Deliverability and quota. High; likelihood medium.**

- **What goes wrong:**
  - Each tenant uses its own Resend account, with no fallback [R P17:86].
  - The Free plan sends 100 a day and 3,000 a month, and the whole account must stay under 4% bounces and 0.08% spam [V Resend].
  - Stale SiteStacker addresses could pause the same connection that sends Asym receipts [I].
  - "Confirm your gift" mail looks like phishing.
- **Fix:** a quota readiness check; a first wave of 50; an automatic pause at 3% bounces or any complaint; a pre-announcement; links only to the ministry's verified host.
- **Spec:** §4.2.

**C8. Rail and language parity. Medium-high; likelihood high for Canadian ministries.**

- **What goes wrong:**
  - With no PAD rail [R], PAD donors are forced onto card.
  - The donor app has no i18n (none found in `apps/donor` [R]), although P17 plans `fr-CA` variants [R P17:3804].
  - Québec requires French [V-secondary, Legal 500 via r4].
- **Fix:** invite a cohort only when its rail and language are Live.
- **Spec:** §4.8.

**C9. Best-practice items Asym cannot deliver. Medium; likelihood high.** SMS is dark in P17 [R P17:2022]. "One-click from email" is unsafe because link scanners open links; only one tap on the page is safe [R P17 acceptance example 8]. **Fix:** drop SMS; use calls and letters. **Spec:** §4.3, §4.5.

**C10. No operational view. Medium; likelihood high.** **Fix:** one Switch-page panel with counts that reconcile, plus a per-donor timeline. **Spec:** §4.6.

**C11. Missionary follow-up is new scope with privacy risk. Medium; likelihood medium.** P28 forbids automatic tasks and "lapsed" [R P28F:52, :865] and gates contact [R P28F:330-338]. **Fix:** a read-only, filtered list. **Spec:** §4.6.

**C12. "Phase 16 accepts" is claimed, not agreed. Medium; likelihood high.** Q8:17 asserts owner acceptance, but P16 forbids treating uploaded files as a structured feed [R q08-r3:120-122]. **Fix:** restate the cadence as P16:1076's manual review interval, as an owner request. **Spec:** §4.7.

**C13. An early SiteStacker switch-off breaks Q4 and dispute handling. Medium; likelihood medium.** SiteStacker may be the named issuer for year-end documents [R DL:125]. **Spec:** §4.7.

**C14. Terminology drift. Medium; likelihood high.** "Handover", "move", "restart", "re-entry link", "reclassification" and "one-click" are all in use, and CONTEXT.md defines none of them [R grep]. Q7's donor offer says "move it to Asym" [R DL:283], but donors don't know Asym and the sender is the ministry [R P04:93].

- **Fix:** add four terms to CONTEXT.md:
  - **Move:** a Phase 16 cutover of one legacy arrangement, completed by the donor.
  - **Move deadline:** the date after which the old system charges nothing.
  - **End notice.**
  - **Continue link:** one per donor.
- **Retire:** "handover", and "restart" in donor copy.
- **Spec:** §4.3.

**C15. A failed first charge after a move lapses the gift silently. Medium; likelihood medium.** Declines rise after a merchant-ID change [V pan-import]. **Fix:** a staff status, a P16 activation-repair message and monitor M4. **Spec:** §4.6.

**C16. Forwarded links. Low; likelihood medium.** **Fix:** show only gift facts and the last 4 digits. Re-confirming needs no code; raising the amount or changing the designation does. **Spec:** §4.3.

**C17. "Attrition is measured" has no denominator. Medium; likelihood high.** Without one, recalibrating the cap means nothing. **Spec:** §4.9.

## 4. Corrected decision text (replaces Q8 parts 1–6)

1. ★ **End with notice, only after a real offer.** An arrangement not moved by its move deadline is ended by the ministry. No arrangement is ended unless its donor was sent a working move invitation at least 9 weeks before the deadline and an end notice at least 30 calendar days before it. Otherwise the deadline moves, as a recorded extension (Q1 clause 6). The cap (12 months by default) bounds the last legacy charge. Ongoing external stays a recorded exception once O13 exists, never for gifts SiteStacker runs.
2. **One campaign, launched once.**
   - **Launch:** after go-live, never before, once the card copy has landed (within 14 days). The Switch lead previews every message in each donor's language, sets one move deadline (default 10 weeks after launch, never after the cap) and launches.
   - **Messages:** Asym then sends service messages from the ministry's sender: one invitation per donor covering all their arrangements; reminders at +7 and +21 days; the end notice; a last reminder 7 days before the deadline; and, to donors who didn't move, an "ended" note within 10 days of their last charge. These are campaign messages, not backfill effects, so Q7 clause 1 is unchanged.
   - **Stopping:** messages stop when the donor continues or stops, and on a bounce.
   - **Waves:** the first wave is 50 donors or fewer; the rest follow 24 hours later. Sending pauses on a wave bounce rate of 3% or more, or on any complaint.
   - **Copy:** never "Asym", "legacy", "failed" or "cancelled by you". Never ask for card or bank numbers. Always name a contact person.
3. **One link, one page, one tap.**
   - **Link:** single-purpose. Opening it changes nothing. A resend revokes it; otherwise it stays valid until 6 months after the deadline.
   - **Page, for each gift:** recipient, amount, frequency, method (brand or bank, last 4), the last charge through {previous system}, the first new charge, and the new statement descriptor.
   - **Actions:** **Keep my gift going**; change amount, date or method; **Stop this gift**, which is a donor cancellation carrying Q7's end signals. Raising the amount or changing the designation needs a pasteable email code.
   - **Methods:** copied cards and bank accounts confirm in one tap. Others use the prefilled checkout, with Apple Pay, Google Pay and Link first.
   - **Scope:** the same flow works before and after the deadline. No account, no SMS. WCAG 2.2 AA with Core's 44 px targets.
4. ★ **No double charge, no surprise gap** (amends Q1 clause 8's PayPal order). At confirmation, the last old charge is the next one already scheduled, and the first new charge is the following due date. Both are shown. The ministry cancels the old schedule within the window on its **To cancel in {previous system}** list. The first new charge waits for stop proof from the weekly backfill; if proof is late, the start moves and the donor is told. Never a catch-up charge. A legacy charge after a move is refunded (Q7).
5. **Donors who can't be emailed.**
   - **Do-not-contact:** no campaign messages. Phase 3 and counsel are asked to allow one factual end notice about the donor's own gift, which PADs require. Until they rule, the ministry records a decision per arrangement.
   - **Bounced or no email:** the Mail or call list, with a printable letter.
   - **Deceased:** no messages; staff end the gift.
6. **Visibility.**
   - **Switch page:** donor counts and monthly amount per currency for moved, awaiting stop, not yet moved, chose to stop, can't contact, bounced, first new gift failed, and ended. Filters by method, missionary and language; a per-donor timeline; Resend; the To cancel list; a weekly digest to the lead.
   - **Missionaries:** a read-only list of their own contactable, recognition-permitted partners not yet moved, with the deadline. No tasks or alerts; never "lapsed" or "at risk".
7. ★ **Closing** (amends Q1's "no backfill after closure" and "licensed until closure", and Q7's cadence wording).
   - **Backfills:** weekly until the last legacy charge, then monthly, then a final batch when the window ends. The windows after the last charge are 120 days for card, 60 for US ACH and 90 for Canadian PAD, and longer while a dispute is open. Phase 16 is asked to record this as its manual review interval.
   - **SiteStacker:** may be switched off after its last charge once final exports are sealed and any Q4 documents it issues are generated.
   - **Accounts:** processor and PayPal accounts stay open until closure.
8. **Prerequisites.** A switch with recurring giving is scheduled only when the move path is Live for each cohort's rail and language: link, move-start, messages, successor link, stop evidence and Switch-page panel. Otherwise the ministry records which cohorts wait; a waiting cohort's deadline counts from its own launch. The card copy is requested at go/no-go and topped up after the boundary.
9. **Measure.** For each arrangement, record its path (copied, re-entered, PayPal, bank), the dates it was invited, confirmed, stopped or ended, and its first new charge result. Report the share moved by donors and by monthly amount per currency, by week and path. Recalibrate after the first switch.

## 5. Acceptance criteria

1. Ending any arrangement fails unless its record shows an invitation at least 63 days and an end notice at least 30 calendar days before its deadline, or a recorded ministry decision.
2. The Launch control is disabled before go-live. Zero campaign messages exist for a switch that was aborted.
3. A donor with N arrangements receives exactly one message per campaign step, listing all N.
4. A GET of a link, including from a scanner, changes no state. Continuing requires a POST from the page.
5. Confirming as-is with a copied card takes one tap after load at 320 px (issuer 3DS excluded). Every target is at least 44 px. Manual NVDA and VoiceOver runs pass.
6. Fixture: no moved arrangement has charges from both systems in one due period. Late stop proof moves the first new date and emails the donor.
7. The link used after the deadline creates a gift that starts on the next due date, with no immediate charge.
8. Reminders stop by the next send after the donor continues, chooses to stop, or hard-bounces.
9. Do-not-contact donors receive zero messages. Donors unsubscribed only from marketing receive all of them.
10. Launch is refused while any recipient's language lacks a published variant. Québec donors get fr-CA.
11. A copy lint finds no "Asym", "legacy", "failed" or "cancelled by you", and no request for card or bank numbers.
12. Sending pauses when a wave's bounce rate reaches 3% or a complaint arrives, and the lead sees why.
13. The status counts add up to the number of arrangements at launch, by donors and by amount per currency.
14. The missionary list holds only that missionary's own partners who allow recognition and can be contacted. It creates no tasks or notifications.
15. Cadence switches to monthly after the last charge. Closure is refused before the 120, 60 or 90 days for each method, or while a dispute is open.
16. The SiteStacker switch-off attestation is refused until final exports are sealed and the Q4 item (i) is recorded where SiteStacker is the issuer.

## 6. Monitors

| Signal                                                                | Threshold                                                                                                | Owner                                        | Response                                              |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------- |
| Share moved by donors and amount, at day 21 and at D                  | Under 60% at day 21, or any missionary with more than 25% of amount unconfirmed (assumptions, Q1AR:2168) | Switch lead with the Asym relationship owner | Calls and letters; consider moving D (recorded)       |
| To-cancel items past their window end; any legacy charge after a move | Any                                                                                                      | Switch lead                                  | Cancel now, refund, email the donor                   |
| Wave bounce rate or complaints                                        | 3% or more, or 1 complaint; account-wide 4% or 0.08% [V]                                                 | Tenant email admin and P17 ops               | Pause, clean the list, resume                         |
| First new charge failures among moved gifts                           | More than 5% [A]                                                                                         | P16 owner and Switch lead                    | Activation repair, calls, review first-charge design  |
| Stop proof still pending                                              | More than 14 days                                                                                        | Switch lead                                  | Recheck the cancellation; tell the donor the new date |
| Can't-contact items with no decision at D−30                          | Any                                                                                                      | Switch lead                                  | Decide, or record an extension                        |
