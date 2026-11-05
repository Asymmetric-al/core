# Q8 adversarial review — moving tail donors and closing the tail

**Decision under review:** Option A, "end with notice", in the six parts of `q08-decision-as-asked.md`. The founder chose it on 2026-11-02 with these instructions: "do a final check before done … the best possible UX and UI for the user and tenant. Think through the whole journey … modern best practices."

**Evidence:**

- **Research:** `research/q08-r1` (repo tail closure), `q08-r2` (moving recurring donors), `q08-r3` (repo journey mechanics), `q08-r4` (journey UX best practice).
- **Independent reviews:** `review/q08-v1-domain-money-review.md`, `review/q08-v2-journey-ux-review.md`.

**Labels used throughout:** verified, repo, inference, assumption, judgment.

## 0. The whole journey (corrected design)

| Who                                                              | Journey                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Donor whose card was copied**                                  | **Invitation** (one email for all of the donor's gifts, sent from the ministry) → **continue page** (prefilled: each gift's amount, frequency, designation, the card's last four digits, the last old charge date, the first new charge date and the new bank-statement name) → **Keep** (one tap; card check if the bank asks) or **Change** / **Stop** (email code) → **"Confirmed — your gift continues on {date}"**, plus a confirmation email. Nothing is charged until the old gift is proven stopped. |
| **Donor who must re-enter** (wallet card, expired or not copied) | Same email and page, but with card entry instead of Keep → same confirmation.                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **US bank-debit donor**                                          | Same page. Bank authorization is entered where an imported mandate cannot be used on the ministry's account (q08-r4; verified-vendor-doc).                                                                                                                                                                                                                                                                                                                                                                   |
| **Canadian bank-debit (PAD) donor**                              | Asym has no PAD rail (q08-r3; repo). The donor is offered a card. The ministry may instead extend that group within the cap until a rail exists (O39).                                                                                                                                                                                                                                                                                                                                                       |
| **PayPal subscriber**                                            | Same page with card entry. The ministry then cancels the PayPal subscription and records proof it stopped. The first Asym charge follows that proof.                                                                                                                                                                                                                                                                                                                                                         |
| **Do-not-contact, deceased, bounced or no email**                | Asym sends nothing to do-not-contact or deceased donors. Bounced and no-email donors appear on staff's **mail-or-call list**. For do-not-contact gifts, the ministry records how it meets any legal notice duty (for example, the old system's own cancellation notice or a letter) until Phase 3 and counsel rule (O38).                                                                                                                                                                                    |
| **Donor who never responds**                                     | Reminders → **end notice** (in writing, at least 30 calendar days before the End date, with the same link) → final reminder 7 days before → the old gift is cancelled and its stop recorded by the End date → **"Your gift has ended"** note with the same link, which now starts a new gift.                                                                                                                                                                                                                |
| **Switch lead** (often a part-time admin)                        | **Readiness:** sending capacity, languages and payment rails checked. **Card copy:** requested from the old processor when the Switch is scheduled. **Launch:** within 14 days of go-live, once copies land. **Switch page:** donors and amounts by status, a per-donor timeline, the **To-cancel list** (ordered by next old charge date) and the mail-or-call list. **Sending:** pauses automatically on bad bounce or complaint rates. **Closure:** the closure review lists ended gifts.                 |
| **Missionary**                                                   | A read-only list of their own contactable supporters' move status. No tasks, no "lapsed" wording, and anonymous supporters filtered out (Phase 28 rules). Supporters may be contacted personally where the ministry allows.                                                                                                                                                                                                                                                                                  |
| **Finance**                                                      | Weekly batches until the last old charge, then every four weeks until the reversal window closes: card 120 days, PayPal 180, US bank debit 60, Canadian PAD 90, extended until every open dispute resolves. Reversals of old charges remain Recorded outside Asym. The old merchant, gateway and PayPal accounts stay open through the window.                                                                                                                                                               |

## 1. Category review

### 1.1 Problem validity, necessity and alternatives — material concern: yes (narrows)

**Why A is right:**

- **The problem is real.** Each tail must close, and unmoved donors need a defined outcome.
- **A matches vendor practice.** Vendors close old systems on a published date after a 2–3-month campaign (q08-r2; verified-vendor-doc and secondary).
- **B and C have no endpoint.** B needs an intake that doesn't exist (O13); C never closes.

**What makes A, as asked, unworkable:**

- the End date is undefined;
- no donor gets a guaranteed real offer;
- the parts can't be built under ratified owner rules: Phase 16 always charges immediately (P16:690, :2653), and Phase 25 bans trial or anchor substitutes (P25R:153) (q08-r3; repo).

**Scope.** A per-group choice between "confirmation required" and "only encouraged" is out of scope. It would reopen Q1 clause 8 and Phase 16's donor-step rule. The donor-initiated confirmation also reduces declines on the new merchant, as Stripe advises (q08-r4; verified-vendor-doc).

**Fix:** one rule, "end only after a real offer", plus one recorded End date (§3, clause 1).

### 1.2 Brittleness — material concern: yes

| Concern                                                                                                                     | Severity | Fix                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Timing anchored to "last charge" breaks for annual donors                                                                   | High     | Timing anchored to one End date.                                                                                                        |
| Card copy takes "a few days to several months" (q08-r2; verified-vendor-doc)                                                | High     | Request it when the Switch is scheduled. Launch waits at most 14 days after go-live. Donors whose cards were not copied get card entry. |
| Invitations sent on switch day collide with the abort window, since a switch can be aborted until go-live (decision-log Q1) | High     | Launch only after go-live.                                                                                                              |
| Restart is blocked until stop evidence exists (P25R:161; repo)                                                              | High     | Stop evidence is recorded by the End date, and one link serves both moving and restarting.                                              |

### 1.3 Technical debt — material concern: yes

- **Checkout is one-time only** (`checkout-donation.ts:182-192`; repo). The prototype paths stay gated (Q4 clause 7).
- **`legacy_account_invitations` is an unused table** (q08-r3; repo). The move link must not be built on it without an owner.
- **The Stripe platform-key fallback must be removed** before the move flow exists (O31).
- **Q7's wording "governed SLA of a structured feed" clashes with P16:1886.** Reword it as Phase 16's manual review interval of cadence plus 7 days, which fits P16:1076: weekly gives 14 days and fortnightly gives 21 (q08-r3; repo).

### 1.4 Edge cases — material concern: yes

| #   | Case                                                                                    | Outcome                                                                                                                                                                                                                       |
| --- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Confirms, but the old system charges once more before cancellation                      | Both dates are fixed at confirmation: the next old charge is the last, and the first Asym charge waits for stop evidence. A charge after stop evidence is a real second charge, refunded through the original processor (Q7). |
| 2   | Confirms twice, or double-taps                                                          | Idempotent per gift; the second tap shows the existing confirmation.                                                                                                                                                          |
| 3   | Raises the amount or changes the fund                                                   | Email code required. A fund change follows Phase 16's normal change rules: an end signal for the old designation's missionary and a new support for the new one (v1).                                                         |
| 4   | Has three legacy gifts                                                                  | One email and one page list all three, each kept, changed or stopped separately.                                                                                                                                              |
| 5   | Card copy failed for this donor                                                         | Card entry flow.                                                                                                                                                                                                              |
| 6   | Google Pay card                                                                         | Cannot be copied; card entry. Apple Pay copies need a Stripe representative (q08-r4; verified-vendor-doc).                                                                                                                    |
| 7   | Expired copied card                                                                     | Card entry.                                                                                                                                                                                                                   |
| 8   | Confirms after the End date                                                             | The link starts a new gift. The old one has already stopped, so there is no double charge.                                                                                                                                    |
| 9   | Annual donor whose next charge is after the End date                                    | The gift ends by the End date. The notice says when it would have renewed, and the link continues it.                                                                                                                         |
| 10  | Household gift (joint card)                                                             | One payer per arrangement. The email goes to the payer of record.                                                                                                                                                             |
| 11  | Deceased donor                                                                          | No messages; the gift ends. Staff record it.                                                                                                                                                                                  |
| 12  | Do-not-contact donor                                                                    | No Asym messages. The ministry records how any legal notice is given (O38).                                                                                                                                                   |
| 13  | Email bounces                                                                           | Mail-or-call list. Sending pauses at 3% bounces.                                                                                                                                                                              |
| 14  | Designation retired, or the missionary left                                             | The continue page shows the designation the ministry has mapped as its successor. If none exists, staff resolve it before invitation, since the gift cannot launch with an unmapped designation.                              |
| 15  | Gift in another currency or Legal Entity                                                | Kept unchanged at a move (v1).                                                                                                                                                                                                |
| 16  | Tribute or in-memory recurring gift                                                     | Keeps its tribute; no tribute letters (Q7).                                                                                                                                                                                   |
| 17  | Canadian PAD                                                                            | Card offer, or a recorded extension for that group (O39).                                                                                                                                                                     |
| 18  | French-speaking (Québec) donors                                                         | That group launches only when the messages and page exist in French (secondary source; counsel to confirm). Otherwise a recorded extension within the cap.                                                                    |
| 19  | Link forwarded to someone else                                                          | Keep only continues existing terms. Change or Stop needs an email code to the donor's address.                                                                                                                                |
| 20  | An email scanner opens the link                                                         | Opening is read-only; Keep requires a tap (a POST) (v1).                                                                                                                                                                      |
| 21  | Wrong card mapped to a donor                                                            | The page shows card brand and last four digits; "Not my card" leads to card entry.                                                                                                                                            |
| 22  | First Asym charge fails after a move                                                    | The normal Phase 16 failed-payment recovery applies. Monitor M-Q8-4.                                                                                                                                                          |
| 23  | Old system charges early or late                                                        | The To-cancel list orders gifts by actual next charge. The first Asym charge waits for stop evidence, with no catch-up charge.                                                                                                |
| 24  | Dispute arrives 110 days after the last card charge                                     | Inside the window; recorded as Recorded outside Asym.                                                                                                                                                                         |
| 25  | Ministry pauses the campaign mid-way                                                    | The End date moves for affected gifts (recorded extension). The "real offer" rule still holds.                                                                                                                                |
| 26  | The ministry's email account is on a small plan (Resend free: 100 a day, 3,000 a month) | Readiness checks capacity. Sending is staged with a first wave of 50 (v2; verified-vendor-doc).                                                                                                                               |
| 27  | Stripe's own bank-debit import email ("you don't need to do anything")                  | Coordinated so donors receive one consistent message (v1; verified-vendor-doc).                                                                                                                                               |

### 1.5 Footguns — material concern: yes

| Footgun                                                                                                                                                                     | Severity | Fix                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------- |
| Treating "staff handle do-not-contact donors personally" as allowed. It breaches the absolute floor (P03:401; ADR-0220:16, "including receipts"; `consent.ts:15-26`; repo). | High     | Clause 5 and O38.                           |
| Sending campaign mail as unclassified, which counts as marketing, so marketing-unsubscribed donors silently miss service notices                                            | High     | O37 classifies these as service messages.   |
| A one-click GET confirming a gift                                                                                                                                           | High     | Opening is read-only; confirming is a POST. |
| Switching SiteStacker off before its Q4 tax documents are issued                                                                                                            | Medium   | Clause 6.                                   |

### 1.6 Tenant safety — material concern: no

**What was checked:**

- Links are scoped to one tenant and one donor.
- Sending uses the ministry's own account.
- To-cancel and mail-or-call lists are per Switch.
- Missionary lists follow Phase 28 tenant rules.

### 1.7 Database, RLS and authorization — material concern: yes

- **Continue tokens:** random, single-purpose, one per donor; stored as a hash; revoked when resent; expire 30 days after the End date; never contain personal data.
- **Confirmation, stop-evidence, end and extension records:** append-only and attributed. Each carries server-derived tenant, actor, donor and gift.
- **The successor link:** written only by Phase 16's move-start command (O36).
- **Recording an end:** requires stop evidence or a recorded end decision by a member with the capability.
- **Updates:** no update can move an End date earlier than the notice rule allows.

### 1.8 Overengineering — material concern: yes

**Removed:**

- separate move and restart links (now one link and one page);
- SMS (Phase 17 has it off);
- automatic missionary tasks (Phase 28 forbids them);
- per-gift emails (now one per donor);
- a 12-month default campaign.

**Kept:**

- one End date, one link, one page;
- one To-cancel list and one mail-or-call list;
- one progress view;
- staged sending with automatic pause.

### 1.9 UX/UI and user friction — material concern: yes

**Best practice applied (q08-r4; verified-vendor-doc and secondary):**

- **Fewer emails:** one email per donor, not per gift (Subi).
- **Prefilled review screen** with Edit (WeGive).
- **Clear dates and the new bank-statement name** (Stripe messaging guidance: neutral, with the deadline and what happens next).
- **No account required.** Change and Stop are protected by an email code.
- **A second and third nudge** "meaningfully improves" completion (WeGive).
- **Personal outreach** for those who don't respond.
- **Plain language:** the copy never says "Asym" or "legacy gift" (Q7).
- **Accessibility:** WCAG 2.2 AA, 44 px targets, mobile-first.

**Staff:** one Switch page with counts by status, the To-cancel list and the mail-or-call list. **Missionaries:** a read-only list.

**Severity:** medium overall, but this is the user-facing heart of the switch.

### 1.10 Source of truth, ownership and invariants — material concern: yes

| Fact                                         | Owner                                                |
| -------------------------------------------- | ---------------------------------------------------- |
| Old charges                                  | The old processor                                    |
| Arrangements and moves                       | Phase 16 (move-start, successor link, stop evidence) |
| Messages                                     | Phases 16/17                                         |
| Campaign state, End date, lists and progress | Phase 30's Switch                                    |

**Invariants:**

- **I1.** Each gift has at most one active charger at any time.
- **I2.** No Asym charge for a moved gift happens before that gift's stop evidence.
- **I3.** No gift is ended unless its donor was invited at least 9 weeks before, and sent an end notice at least 30 calendar days before, the End date. Otherwise the End date moves.
- **I4.** No catch-up charges.
- **I5.** Every gift that ends has stop evidence.

### 1.11 Hidden coupling — material concern: yes

The journey depends on O12 and O36–O40, on O31 and on email capacity.

**Gate:** no Switch with recurring giving is offered until these are live. This tightens Q1's O12 precondition rather than replacing it.

### 1.12 Failure modes — material concern: yes

| Failure                                      | Response                                                       |
| -------------------------------------------- | -------------------------------------------------------------- |
| Email undelivered                            | Mail-or-call list                                              |
| Sending account paused                       | Campaign pauses; Switch lead alerted                           |
| Stop evidence missing at the next old charge | The gift stays on the To-cancel list, and the Asym start waits |
| First Asym charge fails                      | Phase 16 recovery                                              |
| Card copy late                               | Card entry                                                     |
| Duplicate confirmation                       | Idempotent                                                     |
| End date reached with an offer not yet given | Automatic recorded extension for that gift                     |

### 1.13 Lifecycle, temporal, concurrency and idempotency — material concern: yes

**Gift states:** in tail → invited → confirmed (dates fixed) → old stop recorded → moved (first Asym charge on the first original due date strictly after the stop). The other path is in tail → end notice sent → old stop recorded → ended. A restart is a new arrangement.

**Concurrency rule.** A confirmation racing an old charge is handled by the fixed dates: the next old charge is the last one.

**Time zones.** All dates are shown in the ministry's giving time zone, with months spelled out.

### 1.14 Data integrity risks — material concern: yes

- Double charges: invariants I1, I2 and I4.
- Designation changes during a move: case 3.
- Currency and Legal Entity: kept unchanged at a move.
- Attrition: measured by donors and amount, per currency, payment path and week.

### 1.15 Security and privacy — material concern: yes

- **Link security** (OWASP: random, single-use, expiring tokens; `no-referrer`; q08-r4, verified-primary):
  - minimal data before verification (first name, gift summary, card last four digits);
  - Change and Stop require an email code;
  - no card numbers are handled by Asym (Stripe Elements).
- **Do-not-contact:** respected (O38).

### 1.16 Scalability and performance — material concern: yes

**Deliverability is the real limit.** Each ministry's Resend account must stay under 4% bounces and 0.08% spam (q08-v2; verified-vendor-doc).

**Mitigations:**

- staged sending, starting with a first wave of 50;
- automatic pause at 3% bounces or any complaint;
- a capacity check in the readiness census.

**Staff load (inference):** 3,000 tail donors means about 2,250 old-system cancellations, roughly 4 hours a week. The ordered To-cancel list makes this manageable.

### 1.17 Operational burden — material concern: yes

The campaign sends itself. Staff work is limited to the To-cancel list, the mail-or-call list and the closure review. Asym help access can prepare but never send or cancel (Q5).

### 1.18 Observability and auditability — material concern: yes

- **Switch page:** counts by status (invited, confirmed, moved, needs cancel, ended, bounced, do-not-contact, extended), in donors and amounts.
- **Per-donor timeline:** every message, confirmation, stop and charge.
- **Recorded:** extensions and end decisions, with attribution.

### 1.19 Dependency and integration risks — material concern: yes

| Dependency  | Issue                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------ |
| Stripe      | Import or copy timelines. Bank mandates cannot be used across connected accounts. Wallet limits. |
| PayPal      | No transfer: cancellation by the ministry, then proof it stopped.                                |
| SiteStacker | One-at-a-time cancellation. Its "Plan cancellation" emails are a Q7 surface setting.             |
| Resend      | Plan limits.                                                                                     |

### 1.20 Migration, rollout and upgrade — material concern: yes

**Order:**

1. O36–O40, O12, O31.
2. Readiness checks.
3. The pilot.

**Kill switch:** pause the campaign. The End date moves automatically under invariant I3.

### 1.21 Testability, traceability and proof — material concern: yes

**Acceptance criteria:** AC1–AC16 (§3).

**Terminology:**

- **Move:** the donor continues in Asym.
- **Continue page / continue link:** one link and one page.
- **End date.**
- **End notice.**
- **To-cancel list.**
- **Restart:** a new gift after an end, through the same link.

### 1.22 Other development hazards — material concern: yes

- **Québec French:** a secondary source; counsel to confirm.
- **Payments Canada H1 notice rules:** verified-primary (s.31 gives 30 calendar days' written notice to end a PAD; s.24(g) gives a 90-day claim window).
- **Q4 tax documents** must be issued before SiteStacker is switched off.

## 2. Disposition

**Accept with required amendments.** A is right. The amendments:

- make it workable and humane: one End date, a guaranteed real offer, one continue link and page, no double charge and no catch-up;
- correct the reversal windows;
- respect the do-not-contact floor and the PAD notice rules;
- add staff progress and lists;
- amend Q1 clauses 2, 6 and 8, and Q7 clause 4, explicitly.

## 3. Corrected decision (to record)

**Q8 — Moving tail donors and closing the tail.** Option A, amended.

1. ★ **End with notice, only after a real offer.**
   - **The End date:** each Switch records one End date at go/no-go. The default is 10 weeks after campaign launch, and it is never after the cap.
   - **The offer rule:** a gift may be ended only if its donor was invited at least 9 weeks before, and sent a written end notice at least 30 calendar days before, the End date. Otherwise that gift's End date moves automatically, as a recorded extension.
   - **Exceptions:** keeping a gift running outside Asym remains a recorded exception only for PayPal- or gateway-run gifts once O13 exists, never for gifts SiteStacker runs.
2. **One campaign** (sent by the ministry).
   - **Timing:** the card-copy request goes to the old processor when the Switch is scheduled. The campaign launches after go-live, once copies land, and within 14 days.
   - **Messages** (service messages, one per donor covering all their gifts): an invitation; reminders at +7 and +21 days; the end notice; a final reminder 7 days before the End date; and an "ended" note.
   - **Sending:** staged, with a first wave of 50. It pauses automatically at 3% bounces or any complaint.
   - **Readiness confirms:** sending capacity; that each group's payment method and language work in Asym (otherwise a recorded extension, within the cap); and coordination with any processor import notices.
   - **No SMS** in v1.
3. **One link, one page.**
   - **The link:** a single continue link per donor. Opening it changes nothing.
   - **The page:** each gift's amount, frequency, designation, card brand and last four digits, last old charge date, first new charge date and new bank-statement name.
   - **Keep:** one tap (POST), plus a card check if the bank requires one.
   - **Change or Stop:** needs an email code. A fund change follows Phase 16's normal change rules.
   - **Other paths:** "Not my card" and uncopied cards lead to card entry. After the End date, the same link starts a new gift.
   - **Standards:** no account required; WCAG 2.2 AA; 44 px targets; copy never says "Asym" or "legacy gift".
4. ★ **No double charge, no catch-up** (amends Q1 clause 8).
   - **At confirmation:** both dates are fixed (the next old charge is the last one) and the gift joins the staff To-cancel list, ordered by next old charge.
   - **Proof first:** staff cancel the old gift and record stop evidence. The first Asym charge is the first original due date strictly after that evidence. It is never earlier and never a catch-up.
   - **Unchanged at a move:** Legal Entity, designation (unless changed) and currency.
   - **PayPal:** the donor confirms with card entry; the ministry cancels PayPal and records the stop; then Asym charges.
5. ★ **People Asym must not or cannot email.**
   - **Do-not-contact and deceased donors:** Asym sends them nothing. For each such gift, the ministry records how any legal notice duty is met (for example, the old system's own notice or a letter), pending a Phase 3 and counsel ruling (O38).
   - **Bounced or no email:** these donors go on the mail-or-call list.
   - **Canadian PAD donors:** offered a card, or their group is extended until a PAD rail exists (O39).
6. ★ **Closing the tail** (amends Q1 clauses 2 and 6).
   - **When it closes:** after the last old charge plus the reversal window (card 120 days, PayPal 180, US bank debit 60, Canadian PAD 90), extended until every open dispute resolves.
   - **Batches:** weekly until the last old charge, then every four weeks.
   - **Source of reversals:** processor reports become the single source for reversals of old charges once SiteStacker is off. SiteStacker may be switched off only after its last charge, its final export in custody and its Q4 tax documents.
   - **Old accounts:** the old merchant, gateway and PayPal accounts stay open through the window.
   - **Closure review:** lists ended gifts.
7. ★ **Cadence wording** (amends Q7 clause 4). Phase 16's manual review interval for these arrangements is cadence plus 7 days: 14 days weekly, 21 fortnightly.
8. **Visibility.**
   - **Switch page:** counts in donors and amounts by status, a per-donor timeline, the To-cancel list and the mail-or-call list.
   - **Missionaries:** a read-only list of their own contactable supporters' move status. No tasks, no "lapsed", anonymous supporters filtered out.
9. **Measure.** The first switch records the share moved, by donors and by amount, per currency, payment path and week. This recalibrates the default End date and the 12-month cap.
10. **Gate.** No Switch for a ministry with recurring giving is offered until O12, O31 and O36–O40 are live.

**Acceptance criteria:**

| #    | Criterion                                                                                                                                                                                                            |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1  | A gift cannot be ended unless its donor's invitation was sent at least 9 weeks before, and its end notice at least 30 calendar days before, the End date. Otherwise the End date moves and an extension is recorded. |
| AC2  | One email per donor lists all their gifts.                                                                                                                                                                           |
| AC3  | Opening the link (GET) changes nothing. Keep is a POST. Change or Stop without a valid email code is refused.                                                                                                        |
| AC4  | A confirmed gift has no Asym charge before its stop evidence. The first charge equals the first original due date strictly after that evidence, with no catch-up amount.                                             |
| AC5  | Double-tapping Keep produces one confirmation. A resent link revokes the old token.                                                                                                                                  |
| AC6  | A PayPal donor's Asym charge occurs only after the PayPal stop is recorded.                                                                                                                                          |
| AC7  | No campaign message reaches a do-not-contact or deceased donor. Their gifts show a recorded notice method.                                                                                                           |
| AC8  | Bounced addresses appear on the mail-or-call list. Sending pauses at 3% bounces or any complaint.                                                                                                                    |
| AC9  | Campaign messages are classified as service messages and reach marketing-unsubscribed donors.                                                                                                                        |
| AC10 | The page shows the last old charge date, the first new charge date and the new bank-statement name. It passes axe with 44 px targets, and the banned words are absent.                                               |
| AC11 | After the End date, the link starts a new gift with no double charge.                                                                                                                                                |
| AC12 | The tail closes only after the last old charge plus the window for each payment type, with no open disputes.                                                                                                         |
| AC13 | SiteStacker switch-off is refused while its last charge, final export or Q4 tax documents are outstanding.                                                                                                           |
| AC14 | Switch page counts in donors and amounts equal the sum of per-donor states.                                                                                                                                          |
| AC15 | The missionary list shows only that missionary's contactable, non-anonymous supporters, read-only.                                                                                                                   |
| AC16 | A fund change at confirmation produces an end signal for the old designation's missionary and new support for the new one. A plain Keep produces no end signal (Q7).                                                 |

## 4. Final consistency check (Q1–Q7)

| Earlier decision | Effect of Q8                                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1 clause 2      | SiteStacker stays licensed until closure → amended: until its last charge, final export and Q4 tax documents.                                         |
| Q1 clause 6      | The reversal window becomes part of the tail. "No backfill after closure" still holds.                                                                |
| Q1 clause 8      | PayPal order fixed: confirm → cancel → stop evidence → first Asym charge. A move start never charges immediately.                                     |
| Q1 cap           | 12 months stays the maximum. The default End date is 10 weeks after launch (★ founder confirmation).                                                  |
| Q2               | No new data classes. Copied cards stay in Stripe.                                                                                                     |
| Q3               | Template-path tails run the same campaign.                                                                                                            |
| Q4               | Tail gifts and their reversals stay Recorded outside Asym. SiteStacker switch-off waits for Q4 documents.                                             |
| Q5               | The Switch lead owns the campaign. Asym help access never sends messages or cancels gifts.                                                            |
| Q6               | Campaign messages can be rehearsed in a Practice copy, where they land in the outbox.                                                                 |
| Q7               | Moves produce no welcome or end signal. Fund changes follow Phase 16. A restart is a new gift but not a "first gift". The cadence wording is amended. |

No other conflicts were found.

## 5. Ruthless synthesis

**Resolve before recording:** founder confirmation of the ★ clauses:

- clause 1: the End date, defaulting to 10 weeks after launch instead of an implied 12 months, plus the real-offer rule;
- clause 4: amends Q1 clause 8;
- clause 5: the do-not-contact interim;
- clause 6: amends Q1 clauses 2 and 6;
- clause 7: amends Q7 clause 4.

**Capture in the spec:**

- the journey (§0);
- the campaign schedule;
- the continue page;
- the lists and progress view;
- AC1–AC16.

**Owner requirements:**

| ID             | Owner                     | Requirement                                                                                                                                                                                                                         |
| -------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| O36            | Phase 16 with Phase 25    | Move-start variant: confirm with no charge; first charge on the first original due date strictly after stop evidence; no catch-up; successor link; recorded stop evidence for non-Stripe executors (extends O14).                   |
| O37            | Phases 16/17 with Phase 4 | Campaign messages classified as service messages from the ministry, one per donor. The continue link (random, single-purpose, hashed, revocable, expiring 30 days after the End date). Email-code verification for Change and Stop. |
| O38            | Phase 3 with counsel      | A ruling on legally required notices versus the do-not-contact floor.                                                                                                                                                               |
| O39            | Phase 13/16               | A Canadian PAD rail, or confirmation that card-only is acceptable.                                                                                                                                                                  |
| O40            | Phase 28 with Phase 25    | The missionary read-only move-status list, and the donor-portal move status and continue action (defines Q7's "offer to move it").                                                                                                  |
| O12 (extended) | Phase 13/16               | Owners for card-copy requests and PayPal cancellation proof.                                                                                                                                                                        |

**Order:** O31 → O36–O40 and O12 → readiness → pilot.

**Monitor:**

| #      | Risk                  | Signal                                                           | Threshold                                                                    | Owner                                    | Response                                                                                               |
| ------ | --------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| M-Q8-1 | Slow moving           | Share moved, by donors and by amount, by week                    | Below 50% by campaign week 5 (assumption, from Tithe.ly's 75%+ in 4–6 weeks) | Switch lead, with the relationship owner | Personal outreach from the lists; check deliverability; extend the End date (recorded)                 |
| M-Q8-2 | Double charge         | Any donor charged by both systems for the same period            | More than zero                                                               | Phase 16 owner                           | Refund through the original processor; fix the cause                                                   |
| M-Q8-3 | Deliverability        | Bounce and complaint rates per send                              | 3% bounces or any complaint (automatic pause)                                | Switch lead                              | Clean the list; resume                                                                                 |
| M-Q8-4 | First-charge failures | First Asym charge failures after moves                           | More than 5% of moved gifts                                                  | Phase 16 owner                           | Recovery flow; check the copied-card path                                                              |
| M-Q8-5 | To-cancel backlog     | Confirmed gifts past their next old charge without stop evidence | Any, older than 3 days                                                       | Switch lead                              | Cancel the old gift and record it. No donor is double-charged meanwhile, because the Asym start waits. |
