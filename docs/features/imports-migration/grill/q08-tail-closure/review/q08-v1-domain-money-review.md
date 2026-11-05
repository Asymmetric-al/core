# Q8 review v1 — domain, money, data and security lens

_Read-only review of `q08-decision-as-asked.md`. Baseline `develop` 629cb71dc; URLs fetched 2026-11-02._

**Labels.** **Verified** (external source fetched and quoted), **repo** (file:line), **inference**, **assumption**.

**Abbreviations.** DL = `grill/decision-log.md`. P16 = `docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md`. P25R = `…/phase-25-donor-dashboard-depth/contracts/recurring.md`. P03/P04/P13 = the Phase 3/4/13 PRDs in the same folder. P28F = `…/phase-28-missionary-workspace-depth/finance-stewardship.md`. H1 = Payments Canada Rule H1 (https://www.payments.ca/sites/default/files/h1eng.pdf, text extracted).

## 0. Verdict on the surfaced findings

| Finding                                          | Verdict                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P16 always charges immediately; no substitutes   | **Confirmed** (repo): P16:690, CAL-03 P16:2653, P25R:153 "No trial/proration/anchor-now substitute". Part 3 needs a move-start variant.                                                                                                                                                               |
| No move link; bulk binding banned                | **Confirmed** (repo): P16:1242 is per-case; P16:1236 bans bulk "bind methods … or restart donors" but not bulk _requests_ for donor-completed steps. Needs a clarification, not a reversal.                                                                                                           |
| No message keys; no direct send                  | **Confirmed** (repo): P16:2898-2910 has nine Reserved keys, none for moves or ends; P16:907 and P25R:267 ban direct-send and block the lane.                                                                                                                                                          |
| Do-not-contact blocks service mail vs H1 s.31    | **Confirmed** (repo + verified): P03:306, :401, ADR-0220:16 and `consent.ts:15-26` block transactional mail for do-not-contact and bounces. H1 s.31(a) requires "at least 30 calendar days' Written notice … before ceasing to issue PADs" unless the agreement provides otherwise.                   |
| No Canadian PAD rail                             | **Confirmed** (repo): no PAD or `acss_debit` in P16, P13 or `packages/api/src`.                                                                                                                                                                                                                       |
| Stripe can't clone PAD mandates; ACH per account | **Confirmed, narrowed** (verified, acss-debit): the clone ban is "for use with destination charges", and a mandate `on_behalf_of` one account "can't be reused for another". Asym uses direct charges (P13:653), so the path is a held-mandate import per connected account. Moot without a PAD rail. |
| Q1 clause 8 PayPal order vs P16:1314             | **Confirmed** (repo): "cancelled only after the replacement is active" is active-active (DL:40), and circular.                                                                                                                                                                                        |
| Q7 cadence-as-SLA → manual review interval       | **Confirmed** (repo): P16:1072 caps feeds at 7 days and P16:1886 excludes spreadsheets; P16:1076 allows 7–30 days. Weekly + 7 = 14 (default); fortnightly + 7 = 21.                                                                                                                                   |
| Part 4 silently amends Q1                        | **Confirmed** (repo): it changes DL:34 (licence until closure) and DL:38 (one gift source per executor) without naming them.                                                                                                                                                                          |
| O12 unowned                                      | **Confirmed** (repo): P13:743-746 and :2192-2199 name no owner; part 2's "owned by Phase 16/17" is an assertion.                                                                                                                                                                                      |

**New findings:**

- **N1.** No end date is defined.
- **N2.** Copy timing contradicts the week-1 one-click invitation.
- **N3.** Restart needs stop evidence (P25R:161), so the end notice's link can be dead.
- **N4.** Dispute windows are wrong: PAD 90 days, PayPal 180, outcomes later.
- **N5.** A designation change hides a real end from the missionary.
- **N6.** Email scanners can trigger a one-click GET.
- **N7.** A wrong card mapping charges the wrong person.
- **N8.** Apple Pay cards can be copied.
- **N9.** Stripe's ACH import email contradicts Asym's ask.

## 1. Category findings

**1 Problem validity and alternatives: concern (narrowing).**

- **B fails:** it needs the nonexistent O13 intake (DL:384), SiteStacker-run gifts need an indefinite licence, PayPal keeps billing after SiteStacker's notifications stop (q08-r2 §4), and `roadmap.md:4395` forbids permanent dual writers.
- **C fails:** it is unbounded, and moves cluster in weeks 4–10 (q08-r2 §5). A is the vendor norm.
- **Token copy with no donor action** would cut attrition most (Fundraise Up claims "99%", vendor-reported). ADR-IM-001 rejected it for v1 because P16:1230/1314 require a donor step, and Q1 deferred any amendment until attrition is measured (DL:40).
- **A per-group "required vs encouraged" choice is out of scope.** It changes P16 owner rules, which a consumer phase cannot do (C3, DL:309). The confirmation is not pure friction either: an on-session SetupIntent makes the first customer-initiated transaction on the new merchant, which Stripe advises to limit new-merchant declines (verified, pan-import via q08-r2 §2).
- **The real cost:** the design partner's unmoved copied-card donors are ended at the moment their attrition is measured. Fix: an owner ruling before the first End date (O44), and part 6 measured by path.

**2 Brittleness: material.**

- **N1:** the campaign is anchored to switch day and the end to "the cap". Read literally, that leaves up to ten months of silence after the week-5 reminder, a year of SiteStacker licence and ~52 uploads.
- **N2:** PAN imports take "a few days to several months" at the processor plus about 10 business days at Stripe (verified, via q08-r2), so a copy requested on switch day pushes copyable donors into re-entry.
- **Fix:** one recorded End date; request the copy at go/no-go; links choose the path when opened.

**3 Technical debt: concern (moderate).** Part 3 needs a new P16 state, authorization type and successor command, and part 2 needs five keys. Built inside Phase 30 they would duplicate P16 machinery Phase 30 is barred from (DL:40). Fix: O36–O43. Phase 30 holds only the End date, schedule, measurements and closure checks.

**4 Edge cases:** see §2 (32 cases).

**5 Footguns: material.**

- **(a) N6:** a one-click GET confirms whenever a corporate email scanner prefetches the link (inference). #815 already requires a read-only GET and a protected POST (q08-r3 §1).
- **(b)** A late end notice with an on-schedule end breaches H1 s.31 for PADs.
- **(c)** "Staff handle [do-not-contact donors] personally" is contact and breaches P03:401.
- **(d)** Extending the tail after notices went out leaves a false dated notice.
- **(e)** The old system's cancellation email fires alongside Asym's notice (Fundraise Up warns of this, q08-r4 §5).

**6 Tenant safety: concern.**

- `packages/api/src/stripe/tenant-client.ts:64-66` falls back to the platform Stripe key, so a move SetupIntent could land on the platform account. O31 must also gate the move flow.
- **Copy target:** one import per connected account, since each legacy merchant account maps to one Legal Entity (DL:33). Stripe's intake asks whether migration is "on behalf of a connected account" (verified, payment-method-imports).
- Tokens resolve only on the issuing tenant's verified host (P25I:23 pattern); a cross-tenant token fails like an unknown one.

**7 Database, RLS and authorization: concern (specify now).**

- **Move tokens:** hash only, with `tenant_id NOT NULL`, purpose `move_confirmation`, donor Party, listed predecessors, `expires_at` (End date), `revoked_at` and used state. No SELECT for `anon` or `authenticated`. Resolved only by a rate-limited server command, with one message for unknown, expired and revoked (OWASP, via q08-r4 §2).
- **Successor links:** an external-move kind on `commitment_successor_links` (P16:1983-1987), unique per predecessor. Deliberate additional gifts still go through ordinary checkout (P25R:159).
- **Confirmation record:** append-only authorization evidence (terms snapshot, consent or mandate text version, time, client evidence), the only defence in a "cancelled recurring" dispute.
- **End decision:** append-only, with actor and P16 capability, reason class (planned transition end, donor request, deceased, retired designation), notice evidence and stop evidence. Never labelled donor cancellation (P16:1232).

**8 Source of truth and invariants: material.** The invariants must be written down, because part 3 states only one of them:

- **I1.** At most one executor is entitled to charge each legacy arrangement's due date. The old executor owns every due date up to its recorded stop evidence; Asym owns only due dates strictly after it.
- **I2.** Asym's first charge is never earlier than the first original due date after stop evidence.
- **I3.** A move keeps the Legal Entity, designation and currency (P16:1236). Anything else is an end plus a new gift.
- **I4.** Conservation: every legacy arrangement ends in exactly one terminal disposition (moved, ended by the ministry, ended by the donor, or reclassified by exception).

**9 Hidden coupling: concern.**

- **Q4 3(d):** the 7-day duplicate flag will pair the last legacy charge with an earlier-day first Asym charge; noise only, since Q7 bars exclusion.
- **Q7 clause 5:** planned ends produce no signals, so with A ending 10–25% of a missionary's supporters, part 2's list is the only warning.
- **Q7 clause 2:** SiteStacker's decline-update link stays on, so a card updated there makes the copy stale.
- **P25R:161:** restart is blocked until stop evidence exists (N3).
- **N9:** Stripe's `pm_` ACH import emails donors "Your customers don't need to do anything" (verified, payment-method-imports).

**10 Failure modes: material.**

- **Copy late or partial:** links fall back to re-entry.
- **N7, wrong mapping join:** one click charges another person's card. Bind only by exact source customer or token ID (Source Record Bindings), and show brand, last four and expiry before confirming.
- **Stop evidence never recorded:** the move waits and the old gift runs (no gap, no double charge); remind the Switch lead.
- **First Asym charge declines:** P16 recovery, but `recurring_action_required_v1` is Reserved, so the lane is blocked (P16:907).
- **Burst of mail from a new tenant sender:** spam risk (assumption); stagger sends.

**11 Lifecycle, concurrency and idempotency: material.**

- **States:** imported external (P16:2581) → invited → confirmed, awaiting predecessor stop (new) → stop recorded → active | ended | reclassified.
- **Races:**
  - **(a)** Old system charges before stop evidence: legitimate (old period); Asym's first charge moves to the next due date.
  - **(b)** Old system charges after stop evidence: real second charge; refund via the original processor (DL:293) and tell the donor.
  - **(c)** Two tabs or a double click: the second POST returns the first result (P25R:159).
  - **(d)** Staff end while the donor confirms: before the End date it is a move; after, a restart.
  - **(e)** Donor cancels while confirmed but not active: a donor end, with its signals.

**12 Data integrity: concern.** Switching SiteStacker off changes the reversal source, which needs a recorded handoff date and Q1 clause 9's overlap proof (DL:41). Reversals after closure have no landing place without O13: record as residual risk. "Last legacy charge" means the scheduled or initiation date for notices and the settlement date for dispute windows.

**13 Security and privacy: material.**

- **Before verification, show only:** ministry, designation public name (Phase 10 alias where restricted), amount, frequency, card brand and last four. Changes, other arrangements and history need an email code or Link.
- **Forwarded links** can at most re-confirm the same terms on the same card; the person affirms they may use that card (covers household cards).
- **Token life:** resend revokes; the token dies at move, end or the End date, after which the link opens plain restart with no personal data.
- **PCI:** unchanged (SAQ A) if PANs go processor → Stripe by SFTP and Asym sees only mapping IDs (P13 story 172; verified pan-import).
- **Imported cards** do not render in Payment Element (`allow_redisplay` is `unspecified`) without a Customer Session filter (verified, save-customer-payment-methods).

**14 Dependencies and integration: material.**

- **Stripe imports:** days to months, longer with a Data Transfer Agreement.
- **N8:** Apple Pay DPANs can migrate "with your Stripe representative" if the old processor exports DPAN, expiry and network transaction ID; Google Pay cannot (verified, payment-method-imports). This corrects q08-r2/r3.
- **US ACH and PAD:** importable with held mandates; Stripe emails ACH donors itself; Asym has no PAD rail.
- **PayPal:** no transfer; the merchant cancels in PayPal, which does not document notifying the donor (q08-r2 §4); disputes run up to 180 days (verified, Stripe how-disputes-work, PayPal named).
- **SiteStacker** is uncontracted (q01-v5 D2); **PaymentSpring** export docs were not found (q08-r2).

## 2. Edge cases (32)

| #   | Case                                                             | Required handling                                                                                                        |
| --- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1   | Donor confirms; old system charges before stop evidence          | Legitimate. First Asym charge is the next due date after evidence (I1).                                                  |
| 2   | Old system charges after stop evidence                           | Real second charge. Flag, refund via original processor (DL:293), tell the donor; urgent monitor.                        |
| 3   | Confirms twice / two tabs                                        | Idempotent; second shows the first result (P25R:159).                                                                    |
| 4   | Changes amount or frequency at confirmation                      | Allowed (P25R:151); disclosed. First charge per I2.                                                                      |
| 5   | Changes designation                                              | Not a move (I3). "Start a new gift" plus a separate end, with signals.                                                   |
| 6   | Picks an earlier day of month                                    | Not before the next original due date after evidence (I2).                                                               |
| 7   | Card copy fails or is pending                                    | Link opens re-entry (Payment Element, Link, Express).                                                                    |
| 8   | Apple Pay card                                                   | Copy where the old processor exports DPAN and network transaction ID; otherwise Express re-entry.                        |
| 9   | Google Pay card                                                  | Always re-entry (verified).                                                                                              |
| 10  | Copied card expired or stale (updated in SiteStacker after copy) | Treat as re-entry; updater where available.                                                                              |
| 11  | US ACH                                                           | Held-mandate import per connected account; align with Stripe's email; 7 days' notice if the date moves (q08-r4).         |
| 12  | Canadian PAD                                                     | Card-only move until a PAD rail exists. End notice ≥ max(30 calendar days, the agreement's own term); window 90 days.    |
| 13  | PayPal                                                           | Same move order; ministry cancels in PayPal; 180-day window; no PayPal method in Asym (P13 Stripe-only).                 |
| 14  | Joint or household card in a spouse's name                       | Affirm "I'm authorized to use this card"; otherwise re-entry.                                                            |
| 15  | Donor deceased                                                   | Restrict-only fact first (DL:296). No messages; end immediately; refund any later charge.                                |
| 16  | Do-not-contact                                                   | No invitation or reminders; factual end notice only, subject to O40; no missionary follow-up.                            |
| 17  | Email bounced or suppressed                                      | End notice by post (consent.ts blocks email).                                                                            |
| 18  | Several legacy gifts                                             | One invitation per donor, listing each arrangement; each confirmed separately (separate authorization per Legal Entity). |
| 19  | Confirms after the End date                                      | Ordinary restart: immediate first charge (P16:690); no back-charge.                                                      |
| 20  | Restart after end, stop evidence missing                         | Blocked (P25R:161), so stop evidence is due by the End date.                                                             |
| 21  | Tribute or in-memory gift                                        | Carry the tribute only if Phase 14 accepts it as source-certified; otherwise list for staff.                             |
| 22  | Designation retired or missionary left                           | No move offered; end-notice variant; no substitution (P25R:149).                                                         |
| 23  | Missionary leaves after confirmation, before first charge        | P16 closed-destination handling (P16:1232).                                                                              |
| 24  | Currency the connected account can't settle                      | Not movable; end with notice; restart needs a fresh amount (P25R:149).                                                   |
| 25  | Gift's merchant account maps to another Legal Entity             | Move only within that entity's connected account; no entity, no link.                                                    |
| 26  | Time zones                                                       | Due dates in the tenant giving zone (civil dates); "strictly after" compares instants; notice counts calendar days.      |
| 27  | Old system charges early or late                                 | Judged by its actual charge; the covered-through rule (DL:285) absorbs lag.                                              |
| 28  | Dispute after last charge                                        | Window extends until disputes opened inside it resolve (Stripe: 2–3-month lifecycle, verified).                          |
| 29  | Tail extended after notices sent                                 | Corrective notice required; ended arrangements never reopen.                                                             |
| 30  | Campaign paused or partly sent                                   | End date recomputed per arrangement so the 30 days hold.                                                                 |
| 31  | Annual or semiannual donor                                       | Notice keyed to the End date; first Asym charge needs the 7-day upcoming notice (P16:907, Reserved key).                 |
| 32  | Donor gives through public checkout instead of the link          | Prompt "replacing your previous gift?"; else possible double giving (Q7AR:83).                                           |

Also: anonymous donors never reach a missionary's list (P28F:338); an old-system cancellation mid-campaign is a real end (Q7).

## 3. Ranked concerns

| Rank | Concern                                                               | Severity / likelihood | Effect on answer       |
| ---- | --------------------------------------------------------------------- | --------------------- | ---------------------- |
| 1    | Part 3 impossible under P16:690, CAL-03, P25R:153 (move-start)        | Blocking / certain    | Changes (owner gate)   |
| 2    | No message contract for invite, reminder or end (P16:907)             | Blocking / certain    | Changes (release gate) |
| 3    | No End date; notice keyed to "last charge"; copy timing (N1, N2)      | High / certain        | Changes text           |
| 4    | Do-not-contact and bounces vs required end notice; "staff personally" | High / likely         | Changes text + O40     |
| 5    | Restart blocked without stop evidence; PayPal bills forever (N3)      | High / likely         | Changes text           |
| 6    | Dispute windows wrong (PAD 90, PayPal 180, outcomes later) (N4)       | High / certain        | Changes text           |
| 7    | Silent Q1 amendments (licence, source basis, PayPal order)            | High / certain        | Amends Q1              |
| 8    | No PAD rail, so Canadian bank-debit donors must switch to card        | High / likely (CA)    | Narrows + O42          |
| 9    | Link security: GET prefetch, mapping join, PII (N6, N7)               | High / plausible      | Spec language          |
| 10   | Designation change hides a real end (N5)                              | Medium / likely       | Changes text           |
| 11   | Q7 cadence wording vs P16:1076                                        | Medium / certain      | Amends Q7              |
| 12   | Attrition at the pilot is realized, not just measured                 | Medium / certain      | O44, part 6            |
| 13   | Platform-key fallback (O31)                                           | High / low            | Precondition           |

## 4. (a) Disposition

**Accept Option A with required amendments.** Ending unmoved gifts with notice is the vendor norm (q08-r2 §4); B and C are worse. But parts 2–5 are not implementable under ratified owner text (ranks 1–2), leave the end date undefined, mis-state reversal windows, and amend Q1 and Q7 silently. One item needs founder confirmation: the **default End date (13 weeks after go-live)**, replacing the implied "at the 12-month cap".

## 5. (b) Corrected decision text

> **Q8 — Donors not moved by the End date: end with notice (Option A).**
>
> 1. ★ **One End date.** At go/no-go the ministry records the date on which legacy recurring gifts not moved are ended (default 13 weeks after go-live; never later than the tail closure cap). Every campaign date is computed from it. Keeping a gift running as an outside arrangement is a recorded exception only for PayPal- or gateway-run gifts once an owner intake exists (O13), never for SiteStacker-run gifts.
> 2. **Move campaign** (owners per O12; no Switch with legacy recurring gifts is offered until O36–O41 are Live).
>    - **Card copy:** the ministry requests it for each legacy merchant account when it schedules the switch.
>    - **Invitation:** on go-live, each contactable tail donor gets one invitation covering all their arrangements, then up to four weekly reminders.
>    - **The link:** it opens one-tap confirmation when a copied method is ready, otherwise payment entry.
>    - **Lists:** staff see a "not yet moved" list by donors and amount. Missionaries see only their own contactable, recognition-permitted supporters, with no automatic tasks and never "lapsed".
>    - **Excluded:** do-not-contact, deceased and erased donors get no campaign message.
>    - **Canadian pre-authorized debit donors:** they can move only by card until Phase 16 offers that rail. The census counts them and go/no-go shows the count.
> 3. ★ **Moves never double-charge** (amends Q1 clause 8).
>    - **Confirming:** records the terms and an off-session authorization with no charge; the donor sees "Confirmed — starts {date}".
>    - **Stopping:** the ministry then stops the old arrangement in its system and records stop evidence.
>    - **First charge:** Asym's first charge is the first original due date strictly after that evidence. The donor may choose a later date, never an earlier one.
>    - **What stays fixed:** the Legal Entity, designation and currency. A different designation is a new gift, not a move.
>    - **PayPal:** follows the same order.
>    - **A legacy charge after stop evidence:** it is refunded through the original processor and the donor is told.
> 4. ★ **End notice.**
>    - **Timing:** a factual written notice at least 30 calendar days before the End date, or longer where a bank-debit agreement requires it. A late notice moves that arrangement's End date.
>    - **Content:** the last charge date, "you don't need to do anything", receipts unaffected, one restart link and a named contact.
>    - **Channel:** sent by post where email is blocked or bounced.
>    - **Do-not-contact donors:** they get only this notice, without the restart offer, as Phase 3 rules (O40).
>    - **Stopping:** by the End date the ministry stops each arrangement in its system and records stop evidence; restart opens once that evidence exists.
>    - **After the End date:** the link opens ordinary restart, with no personal details shown.
> 5. ★ **Closing the tail** (amends Q1 clauses 2 and 6).
>    - **When it closes:** once every arrangement has moved or ended and the reversal window has passed. The window is the last legacy charge plus 120 days for cards, 180 for PayPal, 60 for US bank debits and 90 for Canadian bank debits, extended until every dispute opened within it is resolved. Batches in the window carry only reversals.
>    - **SiteStacker:** it may be switched off after its last charge once a final export (gifts, schedules, authorization evidence and receipts) is in custody. From that recorded date, processor reports are the single source for reversals of its charges.
>    - **Old accounts:** merchant, gateway and PayPal accounts stay open until the window ends.
> 6. ★ **Batches** (amends Q7 clause 4). Weekly until the End date (the ministry may choose fortnightly), then every four weeks during the window. A batch with nothing to review is approved in one step. The cadence sets these arrangements' Phase 16 manual review interval to cadence plus 7 days.
> 7. **Attrition is measured.** By path (copied card, re-entry, PayPal, bank debit), in donors and in amount, with first-charge declines. It recalibrates the End date default, the campaign and the deferred Q1 question of continuing copied cards without a donor step.

## 6. (c) Amendments to ratified text

- **Q1 clause 2 (DL:34).** Replace "Until closure the ministry keeps SiteStacker licensed" with "Until SiteStacker's last charge has run and its final export is in custody (Q8 part 5), the ministry keeps SiteStacker licensed". Append to the Switch closed definition: ", including its reversal window (Q8 part 5)".
- **Q1 clause 6 (DL:38).**
  - Replace "★ At closure each legacy arrangement is handed over through Phase 16, ended by the ministry with donor notice and a restart invitation, or reclassified …" with "★ By the End date each legacy arrangement is moved through Phase 16 (Q8 part 3) or ended by the ministry with notice (Q8 part 4); reclassification as an ongoing outside arrangement is a recorded exception (Q8 part 1)."
  - After "SiteStacker exports for gifts SiteStacker runs", add "until its recorded switch-off; then that processor's reports (Q8 part 5)".
- **Q1 clause 8 (DL:40).** Replace "each is cancelled only after the replacement is active and the old one proved stopped" with "each is cancelled by the ministry after the donor confirms in Asym and before Asym's first charge, which follows recorded stop evidence (Q8 part 3)".
- **Q7 clause 4 (DL:287).** Replace "The cadence is recorded as the feed's governed SLA (Phase 16)" with "The batch cadence sets these arrangements' Phase 16 manual review interval (cadence plus 7 days, within the 7–30-day band)."
- **Q7 clause 5 (DL:290).** Add "A move keeps the designation; a different designation is an end plus a new gift."
- **ADR-IM-001 Consequences:** the licence ends at SiteStacker's final export.

## 7. (d) Owner requirements

| #   | Requirement                                                                                                                                                                                                                                                                                                     | Owner                   |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| O12 | Unchanged precondition: name the owner of campaign, card copy and executor replacement (P13:743-746, :2192-2199).                                                                                                                                                                                               | Phase 13/16             |
| O14 | Extended. Stop-evidence classes for the SiteStacker scheduler, PayPal merchant cancellation and gateway-native schedules, required by the End date.                                                                                                                                                             | Phase 16                |
| O36 | **Move start** (amends P16:690, CAL-03 :2653, P25R:153). Accept with no charge; state "Confirmed — starts {date}"; an on-session SetupIntent with off-session usage; first charge per I1–I2; both dates disclosed; the donor can cancel before the first charge.                                                | Phase 16 + 25           |
| O37 | **Move link.** A #815-style challenge with purpose `move_confirmation`, one per donor, hashed, tenant- and host-bound, expiring at the End date; read-only GET and protected POST; the §1.13 disclosure rules. Bulk issuance is allowed and bulk acceptance is not (clarifies P16:1236).                        | Phase 16                |
| O38 | Successor-link command from an imported external line, atomic at acceptance, unique per predecessor (P16:1987); conditions DON-09 (O33).                                                                                                                                                                        | Phase 16                |
| O39 | Service-class keys `recurring_move_invitation_v1`, `…_reminder_v1`, `…_confirmed_v1`, `recurring_external_end_notice_v1` and `recurring_external_ended_v1`, on the tenant Sender Profile, Live before any Switch with a tail. Also make `recurring_upcoming_charge_v1` and `recurring_action_required_v1` Live. | Phase 17 + 16           |
| O40 | Ruling: is a factual notice that a gift is ending a required account notice that do-not-contact and bounce suppression do not block, by email or post? If not, card gifts end without notice and staff see "ends without notice", but a PAD notice is still owed. Amends P03:306/:401 and ADR-0220 if yes.      | Phase 3 (+ counsel)     |
| O41 | "Not yet moved" projection: staff get everything; missionaries see only their own contactable, recognition-permitted supporters, with no tasks and never "lapsed" (P28F:52, :338, :865).                                                                                                                        | Phase 16 + 28           |
| O42 | A Canadian PAD rail (`acss_debit` on connected accounts, Asym-hosted mandate, H1 notices), or a recorded card-only rule for Canadian switches.                                                                                                                                                                  | Phase 16                |
| O43 | Portal: a move action on outside arrangements (DL:283), and a "replacing your previous gift?" prompt at checkout.                                                                                                                                                                                               | Phase 25                |
| O44 | Before the design partner's End date: rule whether copied cards on the same payee may continue with notice and opt-out but no donor step. Evidence for the deferred Q1 amendment; not adopted by Q8.                                                                                                            | Phase 16 + counsel      |
| O31 | Unchanged; also gates the move flow (`tenant-client.ts:64-66`).                                                                                                                                                                                                                                                 | Phase 13                |
| —   | Counsel: end-notice wording, the 30-day rule, the PAD statement, alignment with Stripe's ACH import email, and French copy for Québec.                                                                                                                                                                          | Counsel (P16:18, :2916) |

**Not implied:** no spec, ticket, implementation, tracker change, or contact with a ministry, vendor or Stripe.
