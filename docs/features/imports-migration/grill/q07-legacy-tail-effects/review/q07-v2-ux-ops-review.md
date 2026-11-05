# Q7 v2 — Adversarial review: users, operations, simplicity and proof

Reviewer lens: nonprofit stewardship, missionary support-raising (MPD) tools, admin and donor UX. This is a read-only review of `q07-decision-as-asked.md` (Option C, six parts). It ratifies nothing.

**Labels.** _Verified fact_ means a fetched URL whose quote was checked. _Repo fact_ means a file:line read on `develop` `629cb71dc`. _Inference_ and _assumption_ are marked as such.

**Keys.** DL = `grill/decision-log.md` · CTX = `imports-migration/CONTEXT.md` · WR = `docs/prds/workflow-studio/03-runtime-and-recovery.md` · CAT = `…/07-core-workflow-catalog.md` · P16 = `phase-16-pledges-recurring-commitments.md` · FS = Phase 28 `finance-stewardship.md` · P25F = Phase 25 `contracts/financial.md` · Q4AR = `q04-switch-year-statements/q04-adversarial-review.md` · Q1AR = `q01-switch-model/q01-adversarial-review.md`.

## 0. Bottom line

The direction is right: donors hear nothing (the vendor norm) and missionaries thank personally (the agency norm). Three parts are wrong or built at the wrong layer:

- **Part 3** (hold alerts through the tail) hides genuine stops for up to 12 months wherever the source has no explicit stop evidence.
- **Part 4** (a new "Legacy gift stopped" notice) duplicates existing owner recipes, becomes dead code after the last tail, and its "or it ended" fires hundreds of notices at closure.
- **The labels in Parts 2 and 3** add two wordings to three existing ones. "Updated" is ambiguous, and "legacy gift" means a bequest.

Every fix deletes more than it adds.

## 1. Category findings

### 1. Overengineering — material concern: **yes**

**OE1. Enumerated suppression lists (Parts 1, 3, 5; Phase 14 touch).**

- **What goes wrong:** The lists omit Phase 28 special-gift tasks (FS:342, :373), MPD-01 per-gift thank-you tasks (CAT:2667), DON-03 threshold gifts, "more or less than commitment" and every future producer. A list is incomplete by construction.
- **Severity / likelihood:** Medium / high.
- **Evidence:** Repo fact: "Imports fire NOTHING" (P14:1866); "Historical imports establish baseline without catch-up tasks" (FS:301).
- **Fix:** One rule: no automatic work from a gift recorded outside Asym, which still counts as prior giving. This replaces the lists, Part 5's "not a first gift" and the Phase 14 touch.

**OE2. "Replacing three inconsistent markers" (Part 6).**

- **What goes wrong:** Replacing `historical=true` (WR:25), Phase 14 import origin (P14:1487-1490) and Phase 28's history cohort edits four owners' models for no behavioural gain (inference). Low / high.
- **Fix:** Recorded outside Asym _satisfies_ each existing suppression; no owner adds a tail marker. The one new duty: the O13 command marks the gift's events `historical=true` (O1).

**OE3. Delete** the legacy-only notice and the separate ministry notice (UX-M1). Also delete the per-gift label: it duplicates Q4's gift-detail sentence (DL:135) and staff label (Q4AR:361, AC13).

### 2. UX/UI and user friction — material concern: **yes**

#### Donors

**UX-D1. Label wording.**

- **What goes wrong:** "Updated {date}" reads as "this gift was changed". "SiteStacker" means nothing to most donors. Numeric dates are ambiguous across US and Canada. "Legacy gift" means a bequest.
- **Severity / likelihood:** Medium / high.
- **Evidence:** Verified fact: "A Legacy Gift or Planned Gift is a donation made by an individual through a will or other formal designation" (https://museum.bc.ca/about/support-the-bcma/legacy-gifts/). Verified fact: CRA: "Write and capitalize the full name of a month" (https://design.cra-arc.alpha.canada.ca/en/writing/dates-times.html). Repo fact: Q4 uses "previous giving system" (DL:136) and a rendered previous-system name (Q4AR:362).
- **Fix (changes Part 2):** One phrase, **"{name} · gifts shown up to {Month D, YYYY}"**, only on the legacy arrangement and Q4's portion line. {name} is the Q4 notice name, defaulting to "our previous giving system". Never "legacy gift" or "updated".

**UX-D2. Recurring donors see two places.**

- **What goes wrong:** The donor sees the legacy monthly gift in Asym but must change it in the old system (DL:37). The likely failure: the donor answers the restart invitation through the public giving page, not the move link, and is charged twice.
- **Severity / likelihood:** High (donor money harm) / medium.
- **Evidence:** Repo fact: Phase 16 bars active-active only inside a formal cutover (P16:1314). Repo fact: Q4's 7-day duplicate flag excludes "a confirmed duplicate" (DL:127), so a real second charge could be excluded. Verified via r2: Fundraise Up says to check "'Plan cancellation' or 'Donation failed' emails in your legacy platform" (https://fundraiseup.com/docs/migration-faq/).
- **Fix (adds one sentence):** The arrangement shows where to change it (the existing Help channel, P25F:33) and the Phase 16 move when offered. Each backfill review lists Parties who also started an Asym recurring gift to the same designation outside the move. A real second charge is never excluded as a duplicate.

**Mobile, accessibility, plain language:** Q4 AC10 already applies (visible text, reading order, 320 CSS px or 200% zoom, axe), plus UX-D1. No further concern.

#### Missionaries

**UX-M1. A legacy-only stop alert is inconsistent and duplicative.**

- **What goes wrong:** A missionary is alerted when a SiteStacker partner stops but not when an Asym partner stops; Phase 28's only gift notice is "New missed-gift notices" (FS:893). DON-11 "Recurring pause or end follow-up" and MPD-06 "Named support attention review" already exist (CAT:1527-1564, :2857-2894). Every recurring message key is Reserved (P16:2910), so a new notice needs a Phase 17 key, Phase 6 plan and Phase 28 slot, all dead after the tail.
- **Severity / likelihood:** Medium / certain.
- **Fix (changes Part 4):** A legacy stop is an ordinary Phase 16 end. The missionary gets the single in-product notice given for any regular gift that ends. Owner request: Phase 28 adds "ended" to its existing slot for all recurring gifts, keeping it informational, with "no automatic missionary review, outreach task or donor message" (FS:868).

**UX-M2. Per-gift alerts for tail gifts: not needed.** Verified fact: MPDX alerts on special, missed, started, more or less than commitment and resumed gifts, not on each routine gift (https://help.mpdx.org/article/1199-notifications). Inference: a late task per routine monthly gift is noise. Edge case: a one-time or new-partner gift through a leaked legacy surface. Backfill review catches it as a leak (the Q1AR:1008 monitor, proposed and not ratified), and staff may add a task.

**UX-M3. The as-of date is needed.** Monthly totals grow retroactively. Repo fact: Phase 28 requires "source freshness where needed to interpret a figure" (FS:25), so Q4's "missionary views are unchanged" (DL:144) is amended. Inference: the arrangement label also shows which partners have not moved yet, the strongest MPD lever during a switch, at no further cost.

#### Ministry staff

**UX-S1. "The ministry" names no recipient and has no volume control (SC1).** Fix: stops, leaks and double giving are lists in each backfill review. No donor follow-up duty is assigned; DON-11 is the optional follow-up (`default_activation: disabled`).

#### Finance staff

**No material concern.** Checked: Phase 20 §21 sets one posting owner per source account, with historical backfill "off by default" (repo fact, `phase-20-accounting-exports-reconciliation.md:1033-1056`), so Q7 changes no ledger. The as-of phrase on the portion line explains retroactive month totals. Assumption: backfill reconciliation by Legal Entity × currency belongs to the Phase 30 spec under Q1 clause 9.

### 3. Operational burden — material concern: **minor; net lower than Option C**

Option C sends per-stop notices to unnamed staff (SC1). The fix gives three lists inside a review the Switch lead already does, plus one overdue reminder. One gap remains, the Spark disposition (repo fact):

- The old system's gift-triggered thank-you and campaign-owner notices are in neither Q1 clause 7 list (R1 gap 5).
- Part 1's "stays on" conflicts with "the ministry decides" (DL:166-170).
- Some Spark automations also change records ("Add Missionary Given To relation", r1 §4), which clause 7 sets Off (DL:37).

Fix: one Legacy Surface Disposition, default Kept on through tail, with record-changing actions Off.

### 4. Observability and auditability — material concern: **yes**

**OB1. Silence leaves no evidence.**

- **What goes wrong:** "Why didn't the welcome fire?" cannot be answered, and C23's "zero unintended send" gate cannot be proved from production.
- **Severity / likelihood:** Medium / high.
- **Evidence:** Repo fact: C23 (DL:289). WR keeps "an idempotent receipt per event/binding" (WR:27).
- **Fix:** Every producer's existing receipt records reason `recorded_outside_asym` when it suppresses. M-Q7-1 counts effects whose source gift carries the fact; the target is zero.
- **Rejected:** No new audit store.

### 5. Scalability and performance — material concern: **yes**

**SC1. Notice volume for 3,000 arrangements.**

- **Evidence:** Verified vendor page, no primary source: 71% "industry-average 12-month retention for recurring donors" (https://www.funraise.org/tools/sustainer-donor-retention-calculator). Inference: about 2.8% a month, so about 85 stops a month. Assumption: across about 100 missionaries that is under 1 each a month. Fine for missionaries; noise for one Switch lead.
- **Worse:** "or it ended" includes ministry ends at closure. If 30% never move (illustrative; Q1 measures attrition, DL:38), that is about 900 notices in a day.
- **Fix:** Exclude moves and ministry-made ends. Staff get lists, not notices.

**SC2. Staleness incident storm.**

- **What goes wrong:** Phase 16 turns stale sources into "Status updating … and raise a staff incident" (P16:1068). Structured-feed review intervals cap at 7 days (P16:1072). A monthly cadence would raise an incident per arrangement per cycle (3,000), and P16:1316 itself forbids a "per-gift incident storm".
- **Severity / likelihood:** Medium / certain without O17.
- **Fix:** Lag is judged against the backfill's as-of date. One Switch-level reminder fires when a backfill is overdue by cadence + 7 days, which reuses the Q1AR:1008 proposed threshold.
- **Performance:** One as-of date per backfill, not per gift, so no per-row timestamps.

### 6. Migration, rollout and upgrade — material concern: **yes**

**MR1. The Legacy Tail Backfill collides with a Studio "bounded backfill".**

- **What goes wrong:** WR:25 keeps historical events dark "unless a bounded backfill request was reviewed". A reviewed Legacy Tail Backfill reads as exactly that.
- **Severity / likelihood:** High (breaks C23) / medium.
- **Evidence:** Repo fact: WR:25. C3: a consumer cannot acquire authority by shorthand; the clause itself must be edited (DL:269).
- **Effect on the answer:** Keep Part 6's sentence, and require the WR:25 edit plus `historical=true` from the O13 command.

**MR2. What if Phase 35 ships before the marker?**

- The marker cannot lag the money: Q4 blocks every Phase 30 money commit until the commands that write it exist (DL:151).
- The real risk is a producer that ships without reading the marker.
- **Fix:**
  - Every gift-triggered producer ships with AC1's test.
  - Switch go/no-go lists the release's active gift-triggered producers and their passing AC1 test.
  - Producers activated mid-tail are prospective (WR:25, FS:534) and still read the marker.

**MR3. Legacy code would raise false signals today.**

Repo facts:

- Admin CRM counts an active pledge with a past `next_payment_date` as at risk (`packages/api/src/admin/crm/detail/service.ts:187-198`).
- Missionary status maps unknown values to "Active" (`packages/api/src/missionary-portal/donors.ts:174-192`).
- `gift_date` defaults to `CURRENT_DATE` (`supabase/migrations/20260214090000_foundation_1_schema.sql:334`).

Fix: Q1AR:758's proposed gate (no tail goes live while these can render). Writers never rely on defaults.

### 7. Testability, traceability and proof — material concern: **yes**

**TP1. Unfalsifiable parts.**

- "Held while in the tail" has no end condition per arrangement, and it hides real misses (see TP3).
- "The ministry" names no recipient.
- "Card failed" has no definition. A single decline is not a stop, since the declined-payment message and update link stay on (DL:37).
- "Stopped" by absence contradicts Q1 clause 5: missing rows are never deletions (DL:35).

**TP2. Terminology.**

- "Tail gift" and "legacy arrangement" are undefined in CTX ("legacy arrangement" is informal at DL:36). "Recorded outside Asym" covers tax documents only (CTX:136).
- There are five wordings: O17 (DL:348), Parts 2 and 3, P16 "Status updating" (P16:1068) and P25 "source Updating" (P25F:33).
- **Fix:** One user-facing phrase (UX-D1). A glossary entry for _Legacy arrangement_. Extend _Recorded outside Asym_ with "…and Asym runs no gift-triggered effect for it". Keep "Legacy Tail Backfill" staff-only, and retire "updated {date}" from O17.

**TP3. "Held" versus "judged as of".**

- **Evidence:** Repo fact: O14's non-Stripe stop-evidence classes are open (DL:345). Template and PayPal-report sources may carry charges but no schedule state (DL:38, :83). Verified via r2 §3 (CruGlobal/mpdx-react source): MPDX derives "Missed a gift" from expected date plus frequency window.
- **Severity / likelihood:** High / high on the template path.
- **Fix (changes Part 3):** Expected gifts after the as-of date are "not yet reported". Earlier ones with no charge after Phase 16's grace are missed, as for any external arrangement.

### 8. Other development hazards — material concern: **yes (small)**

- **H1. Ordering inside one backfill.** A deceased or do-not-contact fact arrives with the stop, and the "ended" notice publishes first. Medium (pastoral harm) / low. Fix: restrict-only facts take effect before any notice.
- **H2. Live receipt resend.** The batch `resend_receipt` action exists (repo fact, `packages/api/src/admin/contribution-batches/action-catalog.ts:7`) and is already governed by Q4 O22 (DL:353). No new rule.
- **H3. A backfill reversed after a notice.** The state corrects with no new task, as Phase 28 provides (FS:879-885).
- **H4. Cancel first, restart later.** This is a continuation only if Phase 16 links the successor, so restart invitations use the move link, not the public form. M-Q7-3 watches contradicted notices.

## 2. (a) Disposition

**Accept Option C with required amendments.** Parts 1 and 6 stand, rewritten as one rule. Parts 3, 4 and 2 change: as-of judgement replaces the hold, the ordinary end transition replaces the new notice, and one label replaces per-gift labels. Part 5 shrinks to "a move is a continuation". The Phase 14 touch is deleted.

None of the amendments reverses the founder's choice: donors still hear nothing from Asym, and staff and missionaries see honestly labelled facts plus one stop alert.

## 3. (b) Corrected decision text

**Q7 — Legacy gifts after the switch.** Option C, amended:

1. **Effects follow first recording.**
   - Asym runs gift-triggered effects only for gifts first recorded in Asym.
   - A gift carrying Recorded outside Asym gets no Asym donor message and no task, notice, welcome, tribute, milestone, special-gift, first, new or started determination. This covers imported history and backfilled gifts, with their refunds, returns, chargebacks and corrections.
   - It still counts in history and totals, and as prior giving in every "first" or "new" test.
   - Recorded outside Asym satisfies every owner's existing import or historical suppression. The command that writes it also marks the gift's events historical (O1/O13). No owner adds another tail marker.
   - A Legacy Tail Backfill is never a Workflow Studio bounded backfill request (WR:25 is edited to say so). Approving one approves data only.
2. **The old system keeps the donor duties for gifts it charges** (Q1 clause 7). Its gift-triggered thank-you and staff-notice automations are one Legacy Surface Disposition, by default Kept on through tail; any record-changing action is Off.
3. **One label, as of a date.**
   - Each backfill records one as-of date: its sources' earliest export time, as a civil date in the giving time zone with the month written out.
   - Staff, missionaries and donors see "{name} · gifts shown up to {date}" on each legacy arrangement and on the previous-system portion of totals. {name} is the Q4 notice's name, by default "our previous giving system".
   - The donor's arrangement also says how to change it (the ministry's Help channel) and offers the Phase 16 move when available.
   - User-facing copy never says "legacy gift" or "updated".
4. **Judged only up to that date.**
   - Phase 16 treats an expected gift after the as-of date as "not yet reported", never missed, late, lapsed or at risk.
   - An earlier expected gift with no charge after the normal grace is missed, as for any external arrangement.
   - Lag raises no per-arrangement incident. A backfill overdue by more than the cadence plus 7 days sends one reminder to the Switch lead.
5. **Stops and moves.**
   - A missing charge is never stop evidence.
   - Stop evidence in a backfill becomes an ordinary Phase 16 end, dated by the source. The missionary gets the single in-product notice Phase 28 gives for any regular gift that ends; Phase 28 adds "ended" to its existing notice slot. Contact restrictions in the same backfill apply first.
   - A move to Asym is a continuation. The donor sees only Phase 16's confirmation, which states that the old gift ends. There is no welcome, orientation, first or started signal, and no stop notice.
   - Ends the ministry makes at tail closure send no notice.
   - Each backfill review lists stopped arrangements, one-time gifts or new arrangements (leaks), and Parties who also started an Asym recurring gift to the same designation outside the move. A real second charge is never excluded as a duplicate.

**Owner touches:** Phase 7/13 (O13 marks events historical; glossary). Phase 34/35 (WR:25 edit). Phase 16 (O17, per clauses 4–5). Phase 28 (as-of label, amending Q4 "missionary views unchanged"; "ended" in the existing slot). Phase 25 (as-of date and change path, extending O24). Phase 30 spec (as-of date, review lists, reminder).

## 4. (c) Acceptance criteria

| #    | Criterion                                                                                                                                                                                                                                                                                                         |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1  | **Zero effects.** A backfill with a settled charge, a refund and a chargeback for one Party produces zero messages, tasks, notices, bell items and outbox entries from every active gift-triggered producer, and each producer's receipt records `recorded_outside_asym`. The gifts appear in history and totals. |
| AC2  | **Baseline.** A Party whose only prior gifts are Recorded outside Asym gives in Asym: no first, new, started or first-support result. Control: a Party with no prior gifts and complete coverage does get one.                                                                                                    |
| AC3  | **No Studio backfill.** Approving a Legacy Tail Backfill creates no bounded backfill request, and a dark historical binding stays dark.                                                                                                                                                                           |
| AC4  | **As-of.** After a backfill with as-of date D, each legacy arrangement and portion line shows "gifts shown up to {D}" with the month in words. An expected date after D shows "not yet reported", never missed, late, lapsed, at risk or Needs Attention.                                                         |
| AC5  | **Missed within coverage.** An expected gift before D minus grace with no charge shows as missed. A later backfill carrying that charge corrects it and creates no task.                                                                                                                                          |
| AC6  | **No storm.** With 3,000 legacy arrangements and an overdue backfill, exactly one Switch-lead reminder and zero per-arrangement incidents are raised.                                                                                                                                                             |
| AC7  | **Stop.** Stop evidence for arrangement X yields one end transition dated by the source, at most one missionary in-product notice, and X in that backfill's stopped list. No donor message. An exact repeat import adds nothing.                                                                                  |
| AC8  | **No false stops.** A move to Asym linked to its predecessor, a ministry end at closure, and a month with no charge but no stop evidence each produce zero stop notices.                                                                                                                                          |
| AC9  | **Move.** Completing a move produces only Phase 16's confirmation, which states the old gift's end. No welcome, orientation, first-gift or started signal.                                                                                                                                                        |
| AC10 | **Double giving and leaks.** A Party with an active legacy arrangement who starts an Asym recurring gift to the same designation outside the move, and a post-boundary one-time gift, each appear in the next review list. Neither is auto-excluded.                                                              |
| AC11 | **Restrict first.** A backfill containing a deceased or do-not-contact fact and a stop for P makes the restriction effective before any notice for P.                                                                                                                                                             |
| AC12 | **Copy and access.** Labels are visible text in reading order, not truncated at 320 CSS px or 200% zoom, and axe passes. Donor copy shows the Q4 notice's name (default "our previous giving system") and never "legacy gift" or "updated".                                                                       |

## 5. (d) Monitors

| #      | Signal                                                                                              | Threshold                                                                     | Owner                                                                               | Response                                                                             |
| ------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| M-Q7-1 | Messages, tasks or notices whose source gift carries Recorded outside Asym (content-free count)     | 1                                                                             | Producing phase owner with Phase 30 spec owner                                      | Disable that producer for the tenant, open an incident, fix it, and add the AC1 case |
| M-Q7-2 | Days since a backfill's as-of date                                                                  | More than the cadence plus 7 days                                             | Switch lead (product reminder) with Asym relationship owner (telemetry, DL:200-201) | Run the backfill or record why not; extend the tail if sources are lost              |
| M-Q7-3 | Stop notices later contradicted by a move or a late charge; missionary complaints about tail alerts | More than 5% of a backfill's notices, or 3 complaints in 30 days (assumption) | Phase 28 owner with Phase 16                                                        | Fix successor linking or grace; review move-link use in restart invitations          |
| M-Q7-4 | Double-giving list items; donor contacts about "missing" legacy gifts                               | Any unresolved item at the next backfill; contacts above 1% of tail donors    | Switch lead with Phase 30 spec owner                                                | Contact the donor and stop the old arrangement; revise the copy or the cadence       |

## Sources

- Repository files as cited, at `develop` `629cb71dc`.
- https://help.mpdx.org/article/1199-notifications (fetched 2026-11-02)
- https://museum.bc.ca/about/support-the-bcma/legacy-gifts/ (fetched 2026-11-02)
- https://design.cra-arc.alpha.canada.ca/en/writing/dates-times.html (fetched 2026-11-02)
- https://www.funraise.org/tools/sustainer-donor-retention-calculator (fetched 2026-11-02; vendor page, no primary study)
- https://fundraiseup.com/docs/migration-faq/ (via `q07-r2` §6; not re-fetched)
- CruGlobal/mpdx-react late-status source (via `q07-r2` §3; not re-fetched)
