# Q08-R1: Closing the Legacy Recurring Tail (repo evidence)

_Repo-only research for Phase 30 Q8 (F19). Baseline `develop` 629cb71dc, 2026-11-02. #711, #809 and #834 checked with `gh`: all OPEN._

**Labels:** ratified, published, proposed (research/review text), implemented. Nothing here is implemented: no tail, backfill, review-policy or structured-feed code exists in `packages/`, `apps/` or `supabase/migrations/` (grep; DL:464).

**Abbreviations:** DL = `grill/decision-log.md`. P13/P15/P16 = the Phase 13, 15 and 16 PRDs in `docs/prds/sitestacker-parity/`. P25R = `phase-25-donor-dashboard-depth/contracts/recurring.md`. RM = `sitestacker-parity/roadmap.md`. OC = `program-roadmap/owner-constraints.md`. Q1AR/Q4AR/Q7AR = the adversarial reviews. r2–r6 = `q01-switch-model/research/q01-r*`. CTX = `imports-migration/CONTEXT.md`.

## 1. External/read-only arrangements, reclassification, and owner intake

- **External/read-only has no time limit (ratified).** "Externally controlled/read-only … Observe qualified facts only; never adopt by metadata or start a competitor" (P16:1264). Unproved imported executors "default to external read-only/control unknown" (P16:2581, :2590). Q1 skeptic: ":1264 allows external read-only as a steady state" (Q1AR:1407, proposed).
- **"Externally managed" is an existing P16 arrangement (ratified).** P16 has "manual, provider automatic, or externally managed" (P16:380). Manual/external support shows "provenance, recurring amount/cadence, expected date, matched gift date, and review state" (P16:1148). It has no binding, attempt, receipt or cash claim (REC-26, P16:2699).
  - **"Reclassification" is a Phase 30 term, not a P16 command.** Q1 skeptic: make it "a Phase 16 decision, not a Phase 30 one" (Q1AR:1760, proposed).
- **Review timing (ratified).** 14 days for mailed manual gifts (7–30), 0 for cash, "24 hours for a proved structured feed … bounded from 5 minutes through 7 days" (P16:1072). "A structured feed uses its governed SLA plus one ingestion window" (:1078). SLA evidence is "source-specific, frozen" (:1542).
  - **Structured-feed rows need an approved structured-source-version FK** (P16:1625). That table holds authenticated sources only: "a filename, uploaded spreadsheet, memo, or claimed source code is not authenticated structured remittance" (P16:1884-1886; the FK link is inferred).
- **No Phase 13/15 owner intake exists.**
  - P13 D.6 covers pre-Asym gifts only (P13:1027-1040). O13's post-boundary command is identified, not agreed (DL:384).
  - P15 keys check, cash, offline ACH, wire, noncash and phone gifts (P15:58, :842); spreadsheet import "is Phase 30" (P15:144, :2536). PayPal is no P15 tender, and P13 is Stripe-only (r4 G17 :261).
  - OC:424-430 (published): "recurring intake of one operational source artifact under a fixed, certified source contract … is owned by that source domain." RM:4395 (published): "Reviewed backfill is a separate bounded operation … Do not promise … permanent dual writers."
  - Who runs such an intake, at what cadence and SLA, is stated nowhere. O35 (DL:406) and Q4 E10 (Q4AR:72) assume an "external-intake match" that does not exist.

## 2. Handover and formal cutover mechanics

- **Rule (ratified).** A "replacement executor is formal cutover … proof the old executor stopped plus applicable fresh IDs and collection authorization … If proof is unavailable, the old executor remains external/read-only and no active-active replacement is created" (P16:1314; REC-23 :2696).
  - "Replace/bind method" and "restart" are **Complete with donor now**; "No bulk action may … bind methods … or restart donors" (P16:1230-1236).
  - #809 (OPEN) designs cutover as one typed command with stop, provision and reconcile children. Non-Stripe stop proof is unmodelled (r4 G20 :267).
- **Donor step.** P13 story 173 offers a hosted "confirm your recurring gift" flow (P13:546). DL:40 accepts "one hosted confirmation of an already-copied payment method."
  - Whether that counts as fresh authorization is an **open P16 ruling** (r3:221). P25R:151 partly supports it: "Current qualified saved methods may be reused under new authority without unnecessary re-entry" (inferred fit).
- **Vault copy (proposed research).**
  - Stripe self-serve copy: cards, US ACH, SEPA; same Customer IDs, new payment-method IDs, mapping CSV; ACH mandate acknowledgement; same SEPA creditor ID; no PADs or subscriptions (r2:239).
  - PAN import from non-Stripe processors: cancel old subscriptions "or you'll bill your customers twice" (r3:11-17). Timelines run 1–6 weeks to "several months" (r3:144, :290).
  - The "separate migration workstream" (P13:743-746) is unowned. O12 is a precondition for any switch with recurring giving (DL:383).
- **Immediate first charge (ratified).** "Exactly one immediate initial contribution is attempted per disclosed compatible cohort" (P16:690). CAL-03: "Future start June 1 submitted May 10 charges May 10 once" (P16:2653). The no-immediate-gift migration variant (r5 K7 :70) has no amendment.
- **PayPal.** There is "no path … to move PayPal subscriptions" (r2:243). Every platform makes PayPal donors re-create (r3:130).
- **What the donor sees (ratified).** Q4's sentences, plus "how to change or cancel their arrangement and an offer to move it to Asym" (DL:283). Proposed page content: r6:196-205.
- **Who sends the invitation: no owner.**
  - P16's message keys are all Reserved and none covers migration, handover or restart (P16:2897-2910). "Reserved status never authorizes a direct-send workaround" (P16:907).
  - Phase 17 has none either (grep; r4 G11 :216).
  - Q1AR v1-18 (:762-772, proposed) suggests one handover message per donor under a P16/P17 contract, with uncontactable donors listed for an owner ruling.
  - Q4 precedent: Asym supplies text, the ministry sends it (DL:151).
- **Attrition.** Ratified: "measures handover attrition at the first switch before any amendment is considered" (DL:40).
  - The proposed monitor (Q1AR:2168): "under 60% … confirmed at day 21, or any missionary with more than 25% … unconfirmed at day 21" (thresholds are assumptions). Response: personal follow-up, extend that cohort's tail, report the rates to the founder.
  - No measured benchmark exists (r3:148-156). Tithe.ly claims "75%+" moved within 4–6 weeks; the 20–30% and 70–80% figures are hearsay or unsourced.

## 3. Ending an arrangement

- **Stopping needs no donor authorization (ratified).** "Stop/pause/cancel/reduce" is **Apply now** (P16:1230). "Collection blocked … never called donor cancellation unless donor requested it" (:1232). The path is `cancellation_requested` then `canceled`, "provider confirmation required" (:2018).
- **No owner rule for donor notice when the organization ends a gift.** There is no P16 key and no P17 message. Cancellation and "required network notices" sit behind counsel and processor approval (P16:18, :2914-2922).
  - **Network rules found cover billing, not stopping:** receipt after every billing, a cancellation path, and 7–30 days' pre-billing notice for plans billed less than every six months (r2:330); a 7-day upcoming-charge baseline (P16:907); Stripe "at least 7 calendar days notice" for an ACH timing change (r3:168); a PAD migration notice (r3:169).
  - Nacha text is paywalled (r3:167). **No rule on notice timing for a merchant-initiated end was found.**
- **Restart content (ratified).** A restart enters the canonical new checkout. Only "source-certified supported amount per occurrence, original currency and typed frequency" are suggested, and an old end date is not carried forward (P25R:147-151). "Unknown/lost old executor stop blocks unsafe restart" (P25R:161; P16:690-693).
- **Proposed wording.** "Your last gift through our old system is on 1 March. If you don't confirm by 15 March, your monthly gift will stop … you can restart at any time" (r6:201). Sequence: announce, ask, two reminders a week or more apart, final dated notice, then a "not yet confirmed" list (r6:205).
- **Signals (ratified).** "A move … and a planned end at tail closure produce none" (DL:291); the closure review lists them (Q7AR:86). The ministry sets whether the old system sends cancellation messages at a move (DL:280). Notifying missionaries "so they can invite a restart" (q07-v1:147) was not adopted.
- **Guidance (ratified).** Prefer "closing the tail by 31 December" (DL:153).

## 4. Q1 research findings

- **Tail length (proposed).** r5 S9 (:199-202): open until "the later of: last legacy-executed charge + 60 days (ACH) and + 120 days (card), plus time for open disputes." E-49 (:307): "after closure, remaining legacy facts are ordinary owner corrections." v4-17 (`review/q01-v4-review.md:469-492`): "the later of the last legacy-executor stop proof plus the dispute and return window, and a founder-set maximum"; suggested monitor threshold of 6 runs.
- **Unbounded risk.** v1-11 (Q1AR:1396-1407): "possibly forever." Skeptic: "A closure rule that ends donors' gifts is a founder product choice … Present 'end with donor notice' and 'extend per cohort' as founder options, not a default."
- **PayPal.** `srt` defaults to 52, clamped 2–52. A subscription "ends only when the merchant or subscriber cancels it", and Payments Standard is "deprecated" (r2:16, :176-178).
  - Monthly gifts self-end after about 4.3 years (Q1AR:1760); weekly ones after about a year (inferred).
  - PayPal tail gifts never reach SiteStacker (r2:339-340). WeGive: "cutting off the old platform's access too early can permanently end those gifts" (r3:131).
- **SiteStacker licence.** "If the SiteStacker cron or the whole installation stops, these schedules stop charging" (r2:172). Restart after a pause is unverified (r2:342). Decline update links need the dashboard (r2:360). v5-D2 (`q01-v5-review.md:85-111`): an uncontracted vendor, so licence, export user and read access are a readiness attestation until closure.
- **Stop proof (r2:331).** SiteStacker cron: ended-status export, processor reports and attestation. Gateway-native: gateway cancel evidence. PayPal: cancel or `srt`-exhaustion evidence.
- **Cadence monitor.** v2-F5 (Q1AR:999-1008): "(1) Days since the last successful catch-up per executor … threshold: (1) More than the cadence plus 7 days … (4) SiteStacker contract end or processor account closure dated before the planned tail closure … (4) Take final exports and processor reports before shutdown, or extend the tail." Repeated at Q1AR:2169. Q1AR:2166 escalates any arrangement "still active 30 days before the recorded closure date."
- **No cadence value** was proposed by any Q1 track, only "fixed cadence."

## 5. Decommission dependency

| Executor                                                                                           | Needs SiteStacker licensed?                                                | Evidence                             |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------ |
| SiteStacker scheduler (card/ACH on vaulting gateways)                                              | **Yes.** Its exports are also the authoritative gift source.               | r2:169-172 (inferred, strong); DL:38 |
| PayPal Standard subscriptions                                                                      | **No.** They run until cancelled or `srt`; gifts come from PayPal reports. | r2:267; DL:40                        |
| Gateway-native schedules (Stripe Subscriptions, Braintree, Authorize.net ARB, PaymentSpring, iATS) | **No.** The gateway executes them.                                         | r2:263-270                           |
| Donor duties for SiteStacker-run gifts (receipts, decline link, cancel path)                       | Yes, kept on through the tail                                              | DL:39; r2:330, :360                  |

**Rules (ratified).**

- **Switch closed:** every executor proved stopped, cut over or ended, and the tail closed. "Until closure the ministry keeps SiteStacker licensed" (DL:34). "Decommission sign-off is a separate, later checklist" (CTX:32).
- **Q1 clause 12:** access reduction, credential rotation, data deletion or retention. "Tail closure and decommission sign-off are blocked while any item is open" (DL:44).
- **Q4 attestations** "block decommission sign-off only (not tail closure, and not Switch closed)" (DL:132-136).
- **Q6/Q5:** decommission confirms no live Practice copy (DL:254); helper and Asym access end at Switch closed (DL:181, :192).
- **E-52 (proposed):** tie SiteStacker and processor shutdown to tail closure, for dispute evidence (r5:310).
- **Inference:** a SiteStacker-run arrangement can be "ongoing external" only with an indefinite licence, so reclassification works only for PayPal and gateway-native executors.

## 6. Cadence

- **No owner-stated value.** DL:38 says "fixed cadence." q07-r1:42: "the value is not set."
- **Ratified (Q7).** "The Switch lead gets one reminder when a backfill is overdue by cadence plus 7 days. The cadence is recorded as the feed's governed SLA (Phase 16)" (DL:287). Acceptance criterion AC6 is at Q7AR:314.
- **Fit with P16.**
  - "The 7-day cap bounds the ingestion window, not the governed SLA," so `review_after_at` is about expected date + cadence + ≤7 days (q07-r3:65-69).
  - "Open: whether a reviewed export is a 'proved structured feed'" (q07-r3:71). P16:1886 suggests it is not.
- **Illustrative only.** Monthly cadences appear in the Q7 reviews (q07-v2:107; q07-r1:36). v4-17 suggests a 6-run threshold. v5-D3 measures the last 120 days of processor data in the practice run (`q01-v5-review.md:135`).

---

## What is already settled

1. **Cap:** by default no later than 12 months after go-live, as an assumption to recalibrate.
2. **Closure outcomes:** handover, end with donor notice and a restart invitation, or Phase 16 reclassification. Extensions are recorded with a reason, and Phase 30 runs no backfill after closure (DL:38).
3. **Moving:** a move is a Phase 16 formal cutover with a donor-completed step. Vault copy is preferred. PayPal stays external until the donor restarts. Phase 30 never re-authorizes, and attrition is measured at the first switch (DL:40).
4. **SiteStacker licence:** kept until closure (DL:34). Decommission is separate, and the Q4 attestations block decommission only (DL:132).
5. **Cadence:** recorded as the governed SLA, with one reminder at cadence + 7 days (DL:287).
6. **Signals:** moves and planned closure ends produce no end signals (DL:291).
7. **Tax documents:** a reclassified arrangement's later gifts are recorded in Asym and documented by Asym (DL:113; Q4AR:72).

## What is genuinely open for the founder

1. **Default for unmoved arrangements at the cap:** end with notice, reclassify, or extend. Should the default differ by executor?
2. **Executor rules:** must SiteStacker-scheduler arrangements be moved or ended by the cap, since staying needs the licence? May PayPal and gateway-native arrangements be reclassified indefinitely?
3. **Backfill cadence:** the default value, whether it is per executor, and whether one final backfill after the dispute and return windows is allowed past the cap.
4. **End notice and restart invitation:** who sends them (Asym text sent by the ministry, the old system's cancellation message, or a future P16/P17 contract) and the minimum lead time before the last charge.
5. **Extensions:** whether they are limited (count or total length), and whether missionaries see a list of partners ended at closure.

## Gaps and conflicts

1. **Reclassification has no landing place.** No Phase 13/15 intake exists: O13 is unagreed, P15 has no PayPal tender or import, and P13 is Stripe-only. OC:424-430 requires a certified source contract owned by the source domain.
2. **Structured-feed conflict.** Q7's "cadence as governed SLA" assumes a reviewed export is a proved structured feed. P16:1625 and :1884-1886 require an authenticated source and exclude uploaded spreadsheets. The mailed-manual basis caps at 30 days, so monthly + 7 does not fit. This needs a P16 ruling or amendment.
3. **PayPal ordering.** DL:40 says PayPal is "cancelled only after the replacement is active and the old one proved stopped." That conflicts with P16:1314 (stop proof before activation), P25R:161 (unknown stop blocks restart) and r4 M9 (:59, "no create-then-cancel"). P16's immediate initial charge (:690, :2653) also double-charges in the handover month (r5 K7) unless P16 adds a migration variant.
4. **Reversals after closure.** A3's "final backfill after the dispute and return windows" (Q1AR:33) is not in ratified clause 6 (DL:38). Card disputes up to 120 days later (r5:199) then have only the "owner correction path" (q07-v1:133), which needs O13.
5. **End notice has no owner.** There is no P16 key, P16:907 forbids a direct-send workaround, the counsel gate applies (P16:18), and no rule on merchant-initiated end timing was found.
6. **Handover message.** No Live contract (r4 G11). Donors whose email is blocked by do-not-contact or suppression cannot be reached (Q1AR:762-772).
7. **Moves depend on successor links nothing creates yet.** DON-09 and O33 rely on a P16 successor link, but P16:1987 frames those links "across the two product types." P25R:159 restart mappings are the nearest fit, and a "move link" is undefined.
8. **Decommission wording.** Q1 clause 12's "any item" leaves unclear whether checklist items such as credential rotation block tail closure. Q4AR:57 notes three definitions of Switch closed.
9. **Unowned prerequisite.** O12 (processor workstream) is unowned yet is a precondition for any switch with recurring giving (DL:383). #711, #809 and #834 are OPEN.
