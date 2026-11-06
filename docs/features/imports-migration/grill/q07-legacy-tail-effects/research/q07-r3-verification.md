# Q07-R3 — Verification of r1/r2 and Option C's six parts

Read-only verification, baseline `develop` `629cb71dc`, 2026-11-02. It ratifies nothing. Repo labels follow r1: **R** ratified · **P** published planning · **Pr** proposed · **I** integrated code. Web labels: verified-primary / verified-vendor-doc / secondary / unverified, all accessed 2026-11-02. Keys follow r1.

## 1. Workflow Studio "bounded backfill"

- **WR:25 (P):** "For imported or historical events, `historical=true` is explicit and outward effects stay dark unless a bounded backfill request was reviewed."
- **Echoes:**
  - `workflow-studio/CONTEXT.md:34`: "Imported/historical events have no outward effects absent a separately reviewed and authorized bounded backfill";
  - WSA-021 (`10-acceptance-scenarios.md:257`);
  - D09 (`00-scope-and-decisions.md:50`);
  - RM:4395: "Reviewed backfill is a separate bounded operation";
  - RM:4772: "…unless a distinct reviewed backfill is authorized."
- **Does a reviewed backfill turn effects back on?** Yes. It is the only stated exception to historical darkness. Nothing defines its reviewer or form.
- **Collision confirmed, and closer than r1 says.** CTX:132 defines a Legacy Tail Backfill as "One separately reviewed, bounded plan…", nearly word for word Studio's definition. FS:1191-1193 also uses "backfill" for migration.
- **Wording that avoids it:** "A Legacy Tail Backfill is not a Workflow Studio backfill request. Reviewing or committing one approves its data only; it never authorizes outward effects for its facts, and no Studio backfill request may name them." Also add "backfill request (Workflow Studio)" to CTX:133 `_Avoid_`.

## 2. Phase 35 recipes (all `default_activation: disabled`)

| Recipe                   | Trigger                                                                        | Guard                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| DON-01                   | CAT:1157 "certifies a first qualifying organizational gift"                    | CAT:1163 "No inference from incomplete import history" (the only history guard)           |
| DON-02                   | CAT:1195 first gift to a designation                                           | none; CAT:1201 protects anonymity and "restricted-worker aliases"                         |
| DON-03                   | CAT:1233 "meets explicit criteria"                                             | none                                                                                      |
| DON-04 (missing from r1) | CAT:1271 "source-labeled anonymous"; "notify authorized staff/missionary"      | CAT:1277 "Donor identity cannot appear in public/missionary payload, task, URL, or trace" |
| DON-05 / DON-08          | CAT:1309 tribute eligibility / CAT:1423 "confirms a correction/refund outcome" | none                                                                                      |
| DON-09                   | CAT:1461 "records a new authorized commitment"                                 | CAT:1463 "orientation only if not already owned by source"                                |
| DON-11                   | CAT:1537 "pause/skip/cancel/resume/end transition"                             | CAT:1539 "observe source-authorized successor where relevant"                             |
| MPD-01                   | CAT:2677 "Contribution source qualifies missionary follow-up"                  | CAT:2683 "No anonymous-donor disclosure or duplicated organization message"               |
| MPD-06                   | CAT:2867 "qualified attention event"                                           | CAT:2873 no lapsed label                                                                  |

- **The CAT:1463 guard is narrower than it looks.** It covers orientation the source already owns. It does not cover historical commitments or successor lines.
- **The approved condition vocabulary has no receipt-boundary fact.** Conditions may use "source-approved entry method… anonymity, recognition and recurring occurrence" (RM:4884).
- **I (missed by r1):** `admin/mission-control-automations` can `send_donor_notification` on `contribution_action_completed` (`types.ts:12-14`, `adapters.ts:20-29`). Its evaluator runs only in `preview.ts:25`, so it has no live effect.

## 3. Phase 28

- **Cohort.** FS:101-103: "Owner repair SHALL preserve the original live/history cohort… processing time is never a new gift date or activation event." FS:1091 makes "live/history cohort" a required field. A tail gift's cohort is undefined.
- **First support.**
  - FS:272-274: requires "complete owner-certified recorded history" and "SHALL not claim first-ever support or a new donor".
  - AC28-F11-03 (FS:286): an "incomplete import" produces "no verified first-support conclusion or automatic task".
  - FS:301: "Historical imports establish baseline without catch-up tasks."
- **What missionaries see.**
  - Settled gifts only.
  - `donations.source` is hidden from missionaries (`20261005050728_field_policy_foundation.sql:187`, I).
  - External recurring shows "provenance, recurring amount/cadence, expected date, matched gift date, and review state" (P16:1148).
  - Q4: "The Support overview and missionary views are unchanged" (DL:144).
- **Anonymity.**
  - AC28-Q08-02 (PR28:173): an anonymous gift "remains anonymous in UI, API, task title, coach view, export and ordinary diagnostics".
  - Code fails closed (I). `isAnonymousToRecipient` (`missionary-portal/redaction.ts:38-46`) is anonymous unless `defaultAnonymousToRecipient` is explicitly `false`.
  - **In lists and totals, a tail gift reveals nothing**, if anonymity is mapped per gift (Q1AR:2133). SiteStacker's "Is Anonymous" mapping is still open (q01-r1:436).
  - **A named stop notice would breach these rules.**
- **Restricted identity.** DON-02 protects restricted-worker aliases, so notices must use the alias.
- **Missed gifts.**
  - FS:865-869: a confirmed miss "SHALL create no automatic missionary review, outreach task or donor message".
  - AC28-F33-02 (FS:878) excludes "a manual expected gift or canceled future giving".
  - OR28:89-94: C05/D40 "supersedes the roadmap's extra automatic missionary task for a named recurring-attention transition".
- **No missionary notice exists when an Asym recurring gift is cancelled or ends.** The P16 role matrix (P16:895-905) has no cancel or end row.

## 4. Phase 16

- **P16:1068 (R):** stale sources produce "**Status updating**, suppress negative outreach… and raise a staff incident." If the gap between backfills counts as stale, each cycle raises an incident, against P16:1316 ("no… per-gift incident storm").
- **The review window.**
  - P16:1072: "24 hours for a proved structured feed; structured-feed overrides are bounded from 5 minutes through 7 days."
  - P16:1078: "a structured feed uses its governed SLA plus one ingestion window."
  - P16:1540: `structured_feed_ingestion_window_seconds` is "constrained to 300–604800".
  - P16:1542: requires "source-specific, frozen SLA evidence".
- **Correction to r1.** The 7-day cap bounds the ingestion window, not the governed SLA.
  - If the Switch's declared cadence is stored as the SLA, `review_after_at` ≈ expected date + cadence + ≤7 days. That matches Q1AR:1008's "cadence plus 7 days" (Pr).
  - **Open:** whether a reviewed export is a "proved structured feed". The Phase 16 owner must confirm this; no new machinery is needed.
- **External states.**
  - P16:1264: "Externally controlled/read-only… Observe qualified facts only".
  - P16:2581: imports "default to external read-only/control unknown. No historical notifications… replay."
  - P16:1051: "`Lapsed`… never caused merely by a timer, miss count, one failed occurrence, pause, cancellation, or planned end."
- **Stop and handover.**
  - P16:2018-2021: `canceled` needs "provider confirmation"; `superseded` creates a "fresh group/line/auth/binding".
  - `commitment_successor_links` (P16:1983-1987) "records an authorized semantic successor".
- **"Held" fits existing states.** An external occurrence stays Expected until `review_after_at` (P16:1625), and after that only staff review follows. The missionary side is already silent (AC28-F33-02). The one addition is O17 (DL:348, Pr): a planned-tail projection kept distinct from **Status updating**.

## 5. Phase 13 events, O1, one marker

- **Where the flag lives.** Studio "consumes named business events" (WR:23), and WR:25's flag sits on the event. O1 (DL:333, Pr) asks Phase 13 to carry it.
- **What Q4 fixed.** Recorded outside Asym is "written in the same transaction as the money fact… one per gift". "Linked reversals and corrections inherit it", and it is "not a contribution status" (DL:110-117).
- **Answer: one source fact, not one runtime marker.**
  - Studio reads events, not Phase 7 facts.
  - C3 (DL:269) bars acquiring producer authority "by shorthand".
  - So Phase 13 should set `historical=true` (O1) from Recorded outside Asym, in the same transaction. Document the flag as "not prospective Asym activity", because "historical" misdescribes post-boundary tail gifts.
- **At least six markers exist, not three:**
  - WR:25 `historical=true`;
  - P13:1030 "pre-Asym provenance boundary";
  - P14:1487-1490 entry-origin metadata, "No new origin column is added";
  - P14:1864 `source_kind = 'import'`;
  - FS:1091 live/history cohort;
  - C21 Entry Method `import`/`legacy` (DL:287).
- **Stop evidence needs no new marker.** It is not a gift. Its arrangement-level marker already exists: Externally controlled/read-only (P16:1264) plus import provenance. Part 6 must not darken it, or Part 4 cannot fire. Left unflagged in Studio, it would match DON-11 and MPD-06.

## 6. Phase 17

- P17C:351 OBL-008, "One-time gift acknowledgement": "Deferred with owner".
- P17C:357 OBL-014, "Recurring arrangement created/confirmed": "Deferred unless exact producer contract exists".
- P17C:395: "ordinary recurring payment success… uses the Phase 7 receipt" (also P16:2912).
- P17M:800-801: "The producing contribution operation decides whether a donor notice is required."
  - The refund keys (P17M:1096-1099) are keyed on an Asym `operation_id`.
  - A backfilled reversal reaches them only if O13 reuses that path.
- Phase 7 A10 (P7:238) has a separate tribute "Notification" document. Q4's bar list (DL:115) does not include it.

## 7. SiteStacker

- **"Understanding System Messages"** (training.sitestacker.com/support/solutions/articles/151000122018, modified 29 Sep 2023; verified-vendor-doc):
  - Contribution Receipt is "sent to the donor as soon as the donor submits a donation".
  - Recurring Schedule Confirmation is "sent once a donor sets up a recurring donation schedule".
  - **Per-charge recurring receipt: still unverified.**
- **New finding:** "Donation Confirmation to Campaign Owners": "sends a notification to the Campaign Owner whenever a Donation has successfully gone through to their Campaign".
  - It "Describes the person (if not Anonymous), the amount given, and how to contact them".
  - Same page; also a help.sitestacker.com snippet (secondary).
  - Whether it fires for scheduler or PayPal charges is unverified.
  - **Q1 clause 7 (DL:37) gives it no disposition.**
- **Spark "New Contribution"** (articles/151000108643, modified 28 Sep 2023; verified-vendor-doc):
  - "Type refers to Online or Offline gift types."
  - "Is First Time Recurring… first recurring gift (first run date)."
  - "Is First Time Donation… will trigger each time a donor gives to a new campaign."
  - The page names no actions; the outcomes come only from screenshots (q02-r1:210; secondary).
  - The first-run filter implies later runs also raise the event (unverified).
- **PayPal:** no public article mentions it (q01-r2:71). How PayPal charges are recorded, and whether Spark fires for them, is unverified.
- **Spark "Cancel Recurring"** exists (q02 adversarial review:13). It could message donors when the ministry cancels at handover.

## 8. Best practice

**(a) Thanking recurring donors**

- **Bloomerang** (Axelrad, updated 2026-09-14; verified-vendor-doc; bloomerang.com/blog/ask-an-expert-how-often-should-we-thank-monthly-donors-and-how):
  - "You can never thank monthly donors too much."
  - "No, a quarterly thank-you falls short."
  - A search paraphrase saying monthly donors expect no acknowledgment was not found on any fetched page (discard).
- **Virtuous** (2019-03-12; verified-vendor-doc): "err on the side of gratitude."
- **GoFundMe Pro (Classy)** sends a thank-you plus receipt for each recurring donation and a "Recurring plan created" email (secondary).
- **Neon One and Donorbox:** no explicit rule found (secondary).

**(b) Stopped-gift alerts**

- **MPDX help** (2022-09-26; verified-vendor-doc) lists "Partner missed a gift", "Partner started giving" and "Partner recontinued giving" without defining them.
- **mpdx-react** (verified-primary via GitHub API):
  - `StoppedGiving` → "Missed a gift".
  - `getDonationLateStatus.ts`: "Donations should only be late if the current date exceeds pledgeStartDate + the frequency window."
  - The server rule is in a private repo (unverified).
- **DonorElf:** "Stopped Giving" means "A recurring donor is 90 days behind…" (secondary; the help page returned 404).
- **Pattern:** these tools infer stopping from lateness and deliver it as an in-tool feed item or task, not an email.

**(c) Telling donors about a platform move**

- **Fundraise Up** (fundraiseup.com/docs/migration-faq/, modified 2025-09-15; verified-vendor-doc):
  - "No notification is required."
  - "The first communication they will typically receive after migration will be the donation receipt emails."
  - "check the “Plan cancellation” or “Donation failed” emails in your legacy platform."
- **Engaging Networks** (2026-10-07; verified-vendor-doc): "communicate early"; "Don't rely on a single email."
- **Givebutter's sample** opens "Thank you for your ongoing support" (verified-vendor-doc).
- **Bloomerang's transfer article** covers only the "definitive STOP date" and gives no donor-messaging guidance (verified-vendor-doc).
- **Pattern:** thank the donor for ongoing support and ask for one action; no source treats a moved donor as new.

## What breaks or must change in the six parts

1. **Part 1 (nothing donor-facing).**
   - **Bundled automations.** Spark automations bundle messages with record-changing outcomes (q02-r1:210), and Q1 clause 7 turns record-changing automations Off. Keep only the message outcomes on.
   - **Two surfaces to add to clause 7:**
     - "Donation Confirmation to Campaign Owners", which carries contact data that may be stale or belong to a Party erased in Asym (DL:42);
     - Spark "Cancel Recurring".
   - **Refunds.** The O13 command declares "no donor notice required" (P17M:800).
   - **Tributes.** A Phase 14 touch is needed only if backfill facts are not import-origin (P14:1487-1490).
2. **Part 2 (visible and labelled).**
   - It amends DL:144 "missionary views are unchanged", and must say so.
   - Merge it with O24's gift-detail sentence (DL:134-139).
   - "updated {date}" needs a covered-through date, which no term defines.
   - The label comes from a projection, because `source` is hidden from missionaries.
3. **Part 3 (no false signals).**
   - **"Held" is mostly redundant** (§4).
   - **What actually must change:**
     - Phase 16 accepts the cadence as the structured-feed SLA;
     - DON-13 and P33 are gated on covered-through.
   - **Name the label as O17.**
4. **Part 4 (one alert that matters).**
   - **Without precedent.** Asym's own cancelled gifts produce no missionary notice (P16:895-905; OR28:89-94). Either accept this as a tail-only exception justified by data lag, or make it a support-view fact plus staff work.
   - **"Card failed" conflicts** with P16:1051 and SiteStacker's kept-on decline link (DL:37). Trigger only on a source-reported schedule that is cancelled, ended or permanently failed.
   - **Anonymity and restricted workers.** Anonymous supporters get a non-identifying or staff-only notice; restricted workers get aliases.
   - **"Other than by moving to Asym".** Key it on a successor link. Edge case: a donor who self-cancels and gives through ordinary checkout has no link. Check for an active Asym recurring gift from the same Party to the same designation.
   - **Delivery.** It must be an owner notice, not a Studio workflow.
   - **Timing.** It arrives up to one cadence late.
5. **Part 5 (handover).**
   - **"Normal confirmation" is not an email.** OBL-014 is deferred. The normal confirmation is on-screen "Success + next scheduled gift" (P16:554), "initial confirmations" (P25F:85) and the Phase 7 receipt.
   - **DON-09 needs a successor-link condition**, so the owner touch is Phase 35, not Phase 16.
   - **Suppress the legacy cancel email.**
6. **Part 6 (one marker everywhere).**
   - **Don't "replace" markers.** At least six exist, and replacing them breaches C3 and P14:1490. Set each from Recorded outside Asym at write time, with O1 carrying it to events.
   - **Amend CTX:136.**
   - **Carve out stop evidence and Part 4.**
   - **Backfill wording.** Use §1.

## What is already covered (redundant)

- **Part 1:**
  - no Asym thank-you exists (P17C:351, :395);
  - tax documents are barred (DL:110-117);
  - P14:1866 "Imports fire NOTHING", P16:2581 and RM:4365;
  - no donor bell (P25X:127).
- **Part 3:**
  - CAT:1163;
  - FS:272-274, :286, :301;
  - C22 (DL:288);
  - no "lapsed" (FS:52, CAT:1619, P16:1051);
  - AC28-F33-02.
- **Part 5:**
  - FS:272 and CAT:1163 make the first Asym charge non-first;
  - P25X:77 forbids a new-donor flag;
  - successor lines already exist (P16:2020, :1983).
- **Part 6, second sentence:** already proposed in Q1AR:417 (Pr).
- **Part 4, partly:** DON-11 and MPD-06 exist, but OR28 suppresses automatic missionary tasks.
