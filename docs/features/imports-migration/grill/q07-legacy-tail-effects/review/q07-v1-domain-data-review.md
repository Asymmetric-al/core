# Q7 v1 — Domain correctness and data review (legacy gifts after the switch, Option C)

Independent read-only review, 2026-11-02, baseline `develop` `629cb71dc`. Lens: domain correctness and data. It ratifies nothing.

**Labels.** _verified fact_ = primary file or vendor citation read by me · _inference_ · _assumption_. Keys: DL = `grill/decision-log.md`; P16 = `docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md`; FS = `…/phase-28-missionary-workspace-depth/finance-stewardship.md`; CAT = `docs/prds/workflow-studio/07-core-workflow-catalog.md`; WR = `…/workflow-studio/03-runtime-and-recovery.md`; P14 = `…/phase-14-donor-credit-operations.md`; P17C = `…/phase-17-system-message-census-2026-07-19.md`; P25F = `…/phase-25-donor-dashboard-depth/contracts/financial.md`; Q1R1/Q1R2 = `q01-switch-model/research/q01-r1…`, `q01-r2…`; Q1AR = `q01-switch-model/q01-adversarial-review.md`.

## 0. Verdict

Option C is right: A leaves missionaries unaware when a legacy gift stops; B creates duplicate, late and false messages; C matches mission-agency practice (q07-r2 §3). As written, it has **three defects that would ship wrong behaviour** (K1–K3) and **two money/data gaps** (K4, K5), and parts 3 and 6 describe mechanisms Phase 16 and the owners already have or should own. Disposition: **accept with required amendments**; §4b needs no new table.

## 1. Concerns, ranked

**K1. SiteStacker schedule edits look like a stop followed by a start. High severity, likely.**

- _What goes wrong:_ A donor updates a card or amount through the donor update path, which Q1 clause 7 keeps on. SiteStacker archives the old schedule and creates a new one. A backfill then shows the original as ended and a new arrangement appearing. The missionary gets a false "Legacy gift stopped" notice. Separately, a cancelled schedule still has a next run date, so a rule keyed on "next run" misses real stops. "Card failed" is not a terminal SiteStacker state either: declines rerun after the donor fixes the card, and retry and suspension rules are undocumented.
- _Evidence:_ verified fact (vendor doc via Q1R1:46 V9): "Every time a recurring schedule is modified with certain changes an archived clone is left behind and a new schedule is created". Q1R1:139 K9. Q1R2:180 ("Cancelled schedules still show a next run date… status is" the proof); Q1R2:184-188 (retries undocumented); P16:2589 (epochs only from explicit lineage).
- _Effect:_ **changes** part 4.
- _Fix:_ Judge a stop on the arrangement's lineage and the source status, not on single rows.
- _Spec:_ "A replacement schedule the source records for an edit or card update is the same arrangement (a new epoch), never a stop and a start. A stop is the current schedule's source status Cancelled or Ended, or two consecutive expected gifts missing within the covered-through period with none awaiting match review. A decline alone is not a stop."

**K2. "Never counts as a first gift" invites a welcome storm. High severity, likely if built literally.**

- _What goes wrong:_ A builder excludes gifts marked Recorded outside Asym from first-gift history. Every migrated donor's first Asym gift then becomes "first". DON-01 welcomes, Phase 28 first-support tasks and "new supporter" all fire: B's harm, at scale.
- _Why:_ Part 3 says what a tail gift may not _trigger_, but not that it still _counts as earlier giving_. A pre-boundary schedule whose first charge falls in the tail has no imported gift at all.
- _Evidence:_ verified fact: CAT:1157/1163 ("No inference from incomplete import history"), FS:271-276 and FS:301 ("Historical imports establish baseline").
- _Effect:_ **changes** parts 3 and 5.
- _Spec:_ "Gifts and arrangements recorded outside Asym count as earlier giving for every first-gift, new-supporter, started, recontinued and milestone test, and never trigger one themselves."

**K3. "One marker everywhere" over-claims, and part 1's silence list is incomplete. High severity, likely.**

- _What goes wrong:_ Recorded outside Asym is a per-gift Phase 7 fact (DL:113-118). Backfills also carry facts that are not gifts:
  - schedule state and stop evidence, which feed DON-10/11 (CAT:1537) and the donor messages Phase 17 reserves as `recurring_action_required_v1`, `recurring_occurrence_missed_v1` and `recurring_schedule_changed_v1` (P17C:319-324);
  - restrict-only contact facts (an unsubscribe could produce a confirmation message).

  None of these carries the marker, so donor messages can leak. "Replacing three markers" also conflicts with C1: owners keep their own gates, such as P14's frozen entry origin with "no new origin column" (P14:1485-1490). Phase 30 cannot replace them.

- _Evidence:_ verified fact, from the lines cited.
- _Effect:_ **narrows** part 6 and **changes** part 1.
- _Fix:_ The marker decides gift-level effects, and each owner derives its gate from it. Arrangement-level effects follow Phase 16's external classification. Part 1 silences everything a backfill brings in.
- _Spec:_ see §4b parts 1 and 6.

**K4. A legacy charge after handover is a real second charge, not a duplicate record. High severity (money), moderately likely.**

- _What goes wrong:_ A SiteStacker rerun or charge-on-save path, or a stop proof that was wrong, charges the donor again after handover. Q4 clause 3(d) flags it (same Party and amount, within 7 days), and staff "exclude it as a duplicate". The ledger then understates cash the ministry really received, and nobody refunds the donor.
- _Evidence:_ verified fact: DL:127 (Q4 3(d)); O14 names the rerun and charge-on-save paths; P16:1314.
- _Effect:_ **changes** part 5 (adds one rule).
- _Spec:_ "A legacy charge dated after its arrangement's handover is shown in the backfill review as charged after moving to Asym, for refund through the original processor. It is recorded, never excluded as a duplicate."

**K5. A legacy charge that Asym first sees through its own provider intake becomes an Asym gift. High severity, low to moderate likelihood (Stripe ministries).**

- _What goes wrong:_ The ministry connects to Asym the same Stripe account its SiteStacker subscriptions charge on. Asym's webhook then records those legacy charges first, so under Q4's "first recorded" rule they become Asym gifts: Asym receipts them, and welcome and first-gift effects can fire. Q1AR raised this (high), but no ratified clause or O-item carries it.
- _Evidence:_ verified fact: `packages/api/src/stripe/webhooks.ts:340-410` routes payment, refund, subscription and invoice events by provider ID. P13:735-741: "observation is not control". Q1AR:504. Inference: whether the connected account's events reach this endpoint depends on the Connect topology, which is unverified.
- _Effect:_ **changes** part 6, closes a Q4 gap, and touches tenant safety (Q1AR notes unscoped lookups).
- _Spec:_ "A charge made by a legacy executor is Recorded outside Asym however it reaches Asym. Asym's provider intake never records it as an Asym gift."

**K6. Part 3's "held" duplicates and conflicts with Phase 16. Medium severity, certain.**

- _What goes wrong:_ Phase 16 caps a structured-feed review at 7 days (P16:1072). Stale sources become **Status updating** "and raise a staff incident" (P16:1068). A monthly cadence therefore raises an incident for every tail arrangement each cycle. "Held" is also ambiguous: if alerts are queued, closure releases a flood of stale alerts.
- _Evidence:_ verified fact. O17 already asks for a planned-tail projection that is distinct from incident quarantine (DL:348).
- _Effect:_ **narrows** part 3 by reusing P16, without a new "hold" mechanism.
- _Spec:_ "An arrangement in the tail is judged only up to its covered-through date and shows as planned delay without a stale-source incident. No missed, late, lapse, amount-change or inactivity signal is raised for it. Evaluation resumes, never replays, at handover or reclassification."

**K7. Idempotency and ordering of the stop notice are unspecified. Medium severity, likely.**

- _What goes wrong:_ Cumulative backfill windows (proposed, Q1AR) re-present the same stop each time. An older export committed after a newer one could re-apply a stale "cancelled" state. Gifts held in match review make an arrangement look stopped.
- _Evidence:_ verified fact: the P16:1066 CAS projector "never overwrites newer health". DL:36 (match review).
- _Fix:_ Key the notice to the Phase 16 stop transition. The backfill's export time is the source cursor.
- _Spec:_ "One notice per Phase 16 stop transition. State applies only if its source as-of time is newer. Replays and later backfills add none."

**K8. Labels conflict with Q4 clause 5, and donors lack a way to manage legacy gifts. Medium severity, certain.**

- _What goes wrong:_ Q4 clause 5 says the missionary views are unchanged (DL:144). Part 2 adds labels there without saying it amends Q4. Donors would get a second label alongside O24's sentences. "Updated {date}" on each gift is meaningless because gifts don't update; arrangements do.
- _Missing piece:_ The Asym portal cannot change or cancel a legacy gift (P16:1148), so the donor must be told where. Card-network rules require a cancellation path (Q1R2:56).
- _Evidence:_ verified fact: P25F:33 already has "known incomplete external coverage, source Updating".
- _Spec:_ see §4b part 2.

**K9. Phase 14's tribute watermark is date-based. Medium severity, moderate likelihood.**

- _What goes wrong:_ `notified_through` means "historical gifts before it never compose" (P14:799-801, :1516). Tail gifts are dated after the boundary and arrive late. If staff activate a memorial stream, those gifts compose a letter to the family.
- _Evidence:_ verified fact; Q1R1:233 says SiteStacker gifts carry tributes.
- _Spec:_ "Gifts recorded outside Asym never compose a tribute letter, whatever the watermark."

**K10. Notice audience and privacy are vague. Medium severity.**

- _What goes wrong:_ "The ministry and that supporter's missionary" leaves several questions open:
  - who receives it (designation holder? the Switch lead?);
  - which channel (an email can expose a restricted designation);
  - what an anonymous, erased or restricted Party shows;
  - whether a whole-backfill mapping error triggers a notice storm.
- _Evidence:_ verified fact: FS:893-907 (an in-product notification slot plus AC28-F34-03 "only currently permitted facts"); FS:866-869 (a notice, never a task); P16:1316 ("no per-gift incident storm").
- _Fix:_ Use the Phase 28 in-product slot, addressed to the current holder of each designation. The ministry sees the stops in the backfill review before commit, under Q5 clearance.

**K11. Handover order, households and successor semantics. Low-medium severity.**

- _What goes wrong:_ Some donors cancel the old gift first and then start in Asym, and a spouse may restart instead of the original giver, so "other than by moving to Asym" has no reliable signal. P16 successor links "transfer no… status" (P16:1985-1987), and DON-09 would orient the new line as new (CAT:1461-1463).
- _Fix:_ Suppress the notice only on a successor link. Otherwise show any active Asym gift from the same Party or household. DON-09 treats a legacy successor as continuing.

**K12. Lower-severity items.**

- (a) Only legacy stops are announced; Asym cancellations get no notice (FS has none), which missionaries may not expect. Phase 28 decides.
- (b) Q1 clause 7 lists neither Spark gift thank-you automations nor gift notices to campaign owners (q07-r1 §4); part 1 says "end date", Q1 says "end condition".
- (c) Arrangements left in P16 import review (P16:2588) get no hold or notice; list them per backfill.
- (d) A post-boundary one-off gift or new schedule is a surface leak (Q1AR:1008 proposes this signal).
- (e) WR:25 lets a reviewed Studio backfill request make historical events outward; without a permanent bar, a tenant could opt tail gifts into welcomes.

## 2. Category findings

| #   | Category                     | Material concern?                                                                                                                                                                                                                                                                                                                                    |
| --- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Problem validity / options   | C is valid against A and B. Parts 3 and 6 lock in mechanisms too early (K3, K6), and "card failed" has no SiteStacker evidence (K1).                                                                                                                                                                                                                 |
| 2   | Brittleness                  | Yes: clone lineage (K1), the 7-day review window (K6), and PayPal reports carry no status, so the stop rule needs the absence clause (K1).                                                                                                                                                                                                           |
| 3   | Technical debt               | Low: legacy-only notice ends at closure (K12a); two donor label systems (K8).                                                                                                                                                                                                                                                                        |
| 4   | Edge cases                   | §3.                                                                                                                                                                                                                                                                                                                                                  |
| 5   | Footguns                     | Yes: excluding marked gifts from first-gift history (K2), excluding a post-handover charge as a duplicate (K4), using the gift marker on arrangements (K3), a queued "hold" (K6).                                                                                                                                                                    |
| 6   | Tenant safety                | Yes: same-account webhook routing by provider ID (K5). Otherwise every derivation is per Tenant and per Switch. The source-system display name is ministry-declared text, so it is rendered as plain text.                                                                                                                                           |
| 7   | Database / RLS / authz       | No new table. Gift label = Recorded outside Asym plus source system (Q4). Arrangement label and planned delay = P16 external classification plus a per-executor covered-through date from Phase 30 run records (O3). Notice key = P16 transition. Handover = `commitment_successor_links`. The marker is already immutable (Q4). Authorization: K10. |
| 8   | Source of truth / invariants | Effects follow the first recorder, just as the tax issuer does. K5 breaks this. Phase 16 owns stop truth (K1, K7).                                                                                                                                                                                                                                   |
| 9   | Hidden coupling              | P14 date watermark (K9). Q4 clause 5 (K8). WR:25 "backfill" collision (part 6 handles it; K12e). P17 reserved recurring keys (K3).                                                                                                                                                                                                                   |
| 10  | Failure modes                | Late backfills: label stays honest; Q5 clause 8 reminders. Mapping-error notice storm: stops shown before commit (K10). False stops from match review (K7).                                                                                                                                                                                          |
| 11  | Lifecycle / idempotency      | Yes: K7, K11. Closure ends evaluation; reclassified arrangements fall under ordinary P16 rules.                                                                                                                                                                                                                                                      |
| 12  | Data integrity               | Yes: K4. Treating clones as separate arrangements would distort expected support (K1).                                                                                                                                                                                                                                                               |
| 13  | Security / privacy           | Notice content (K10). No donor messages, so no consent issue (q07-r2 §5); Q1 clause 12 covers Asym opt-outs vs old-system thank-yous.                                                                                                                                                                                                                |
| 14  | Dependency / integration     | Depends on unbuilt O1, O2, O3, O13, O14, O17, O22; CAT recipes unresolved. Gate: cross-owner zero-effect test (C23).                                                                                                                                                                                                                                 |

## 3. Edge cases (outcome under the corrected text)

| #   | Case                                                                               | Outcome                                                                                                                                              |
| --- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Tail donor also gives a one-off in Asym                                            | Asym receipts it (Q4). It is not "first" because tail and imported gifts count as earlier giving. No welcome.                                        |
| 2   | Donor raises the amount in the old system                                          | The clone is the same arrangement. No stop and no amount signal. The label shows the new amount.                                                     |
| 3   | Card update or declines in the old system                                          | Same arrangement. Declines alone send no notice; two expected gifts missing within coverage count as a stop.                                         |
| 4   | Partial refund                                                                     | Linked to the original, inherits the marker, nets the totals. Silent.                                                                                |
| 5   | Chargeback months later, after closure                                             | Recorded through the owner correction path and inherits the marker. No donor notice.                                                                 |
| 6   | Tribute on a tail arrangement                                                      | No Asym tribute letter, whatever the watermark.                                                                                                      |
| 7   | One spouse moves to Asym, the other stays                                          | Arrangements are separate. If one stops without a successor link, the notice shows the household's Asym gift.                                        |
| 8   | Phase 4 merge with a tail-only duplicate                                           | Marker immutable; merge creates no first or recontinued signal. Residual: an Asym-created duplicate giving before merge can look first (Phase 4/O2). |
| 9   | Missionary leaves; old system redirects supporters                                 | Stop is judged per designation. The notice goes to the current holder, or nobody. The new missionary sees labelled gifts and no "new supporter".     |
| 10  | Anonymous tail gift                                                                | The notice shows only permitted facts, with no identity.                                                                                             |
| 11  | Restricted missionary designation                                                  | In-product notice only.                                                                                                                              |
| 12  | Tail gift in another currency                                                      | Native currency in totals; reconciled per currency (Q1 clause 9). No concern.                                                                        |
| 13  | Backfill two months late                                                           | "Updated {date}" stays honest, with no missed or lapse signal. The notice shows the source stop date. The Switch lead is reminded.                   |
| 14  | Backfill replayed                                                                  | Exact repeat writes nothing (Q1 clause 5). No transition, no notice.                                                                                 |
| 15  | Cumulative windows re-present an old stop                                          | No new transition.                                                                                                                                   |
| 16  | Stop, then restart in the old system                                               | The restart is silent. A later stop is a new transition. A brand-new schedule is flagged as a leak.                                                  |
| 17  | Old system charges once more after handover                                        | Shown for refund through the original processor. Recorded, never excluded. Phase 16 is told its stop proof failed.                                   |
| 18  | Donor erasure during the tail                                                      | Money is kept pseudonymized (P13:746). No notice content. Legacy erasure stays pending (Q1 clause 12).                                               |
| 19  | Tail closes with arrangements ended                                                | The final backfill shows the ends. Missionaries are notified so they can invite a restart. Evaluation stops.                                         |
| 20  | Stop because of handover vs a real cancellation                                    | A successor link suppresses the notice. Cancel-then-restart shows the new Asym gift.                                                                 |
| 21  | Designation changed in the old system                                              | Stop for the old designation; no new-supporter signal for the new one.                                                                               |
| 22  | Schedule created just before the boundary, first charge in the tail, then handover | The successor link means it continues. No welcome.                                                                                                   |
| 23  | Post-boundary one-off through a form left on                                       | Flagged in the review as a surface leak. It carries the marker and triggers no effects.                                                              |
| 24  | Same Stripe account connected to Asym                                              | Legacy charges are never recorded as Asym gifts.                                                                                                     |
| 25  | Arrangement left in P16 import review                                              | Listed in each backfill review. No hold or notice is possible.                                                                                       |
| 26  | Earlier export committed after a later one                                         | State applies only if its source as-of time is newer.                                                                                                |

## 4. Outcome

### (a) Disposition

**Accept C with required amendments.** K1–K5 must be folded in before recording. K6–K11 make the text precise. K12 is monitor and owner material. Nothing here needs a new table.

### (b) Corrected decision text

**Q7 — Legacy gifts after the switch: Option C, silent to donors, honest to staff.**

1. **Nothing donor-facing.** Nothing a Legacy Tail Backfill brings in triggers an Asym message to a donor, honoree or tribute family, whether through an owner workflow or a Workflow Studio backfill request. That covers gifts, reversals, schedule changes, stops and contact facts, and any later reversal of a gift recorded outside Asym. The previous system keeps those duties. Q1 clause 7 adds two surfaces, each with a recorded state: "gift thank-you automations" and "gift notices to staff and missionaries".
2. **Shown and counted.** Gifts recorded outside Asym count in every total.
   - _Staff and missionary views_ show "Given through {source system}". This amends Q4 clause 5 for missionary views.
   - _Donors_ keep Q4's sentences.
   - _Each legacy arrangement in the tail_ shows "Runs in {source system} · updated {covered-through date}". Donors also see where to change or cancel it.
3. **No false signals.**
   - Gifts and arrangements recorded outside Asym count as earlier giving for every first-gift, new-supporter, started, recontinued and milestone test, and never trigger one themselves.
   - An arrangement in the tail is judged only up to its covered-through date and shows as planned delay without a stale-source incident. No missed, late, lapse, amount-change or inactivity signal is raised for it.
   - Evaluation resumes, never replays, at handover or reclassification.
4. **One alert that matters.**
   - _What counts as a stop._ Phase 16 records that a legacy arrangement stopped supporting a designation in two cases: the source shows its current schedule Cancelled or Ended, or two consecutive expected gifts are missing within the covered-through period with none awaiting match review.
   - _What does not._ A replacement schedule the source records for an edit or card update is the same arrangement. A decline alone is not a stop.
   - _Who is told._ The designation's current missionary gets one in-product "Legacy gift stopped" notice, showing only facts they may already see. Each backfill's review lists its stops before commit.
   - _Handover._ There is no notice when Phase 16 links an Asym successor. Otherwise the notice shows any active Asym recurring gift from the same supporter or household.
   - _No repeats._ One notice per stop transition. Replays and later backfills add none.
5. **Handover and anomalies.**
   - A donor who re-authorizes gets what any new Asym recurring gift gets, never a welcome, orientation or first-gift message. The Phase 16 successor link marks the new gift as continuing.
   - A legacy charge dated after handover is recorded, flagged for refund through the original processor, and never excluded as a duplicate.
   - A backfilled gift or schedule outside the declared arrangements is flagged as a surface leak.
6. **One rule, owner gates.**
   - Recorded outside Asym decides every gift-level effect, and each owner derives its own import or historical gate from it. Arrangement-level effects follow Phase 16's external classification.
   - A legacy executor's charge is Recorded outside Asym however it reaches Asym. Asym's provider intake never records it as an Asym gift.
   - Approving a backfill is never a Workflow Studio backfill request.
   - _Acceptance (C23):_ a backfilled gift, refund, schedule change, stop and unsubscribe produce zero donor messages with every automation enabled.

### (c) New or changed owner requirements

| #                 | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Owner                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| O17 (changed)     | Legacy arrangements in the tail:<br>• lineage: source replacement schedules are one arrangement and a new epoch;<br>• stop transitions per K1, applied only if the source as-of time is newer (the backfill export time is the cursor);<br>• planned-delay projection judged to the covered-through date, with no stale-source incident;<br>• the legacy-handover successor link is read as continuing;<br>• no donor message keys (P17C:319-324) are produced for external arrangements.<br>Absorbs part of O14. | Phase 16, with the Phase 30 SiteStacker profile |
| O3 (changed)      | The coverage record carries a per-executor **covered-through** date (the latest committed backfill export time) while the tail is open.                                                                                                                                                                                                                                                                                                                                                                           | Phase 30 spec                                   |
| O32               | One in-product "Legacy gift stopped" notice:<br>• per designation, to its current holder;<br>• permitted facts only (AC28-F34-03); a notice, never a task;<br>• idempotent per P16 transition;<br>• under an organization On/Off control like F34.<br>Label "Given through {source system}". Phase 28 decides whether Asym arrangements get the same notice.                                                                                                                                                      | Phase 28                                        |
| O33               | • `historical=true` and every recipe's import gate are derived from Recorded outside Asym, including for later reversals;<br>• DON-01/02/03/05/08/09/13 and MPD-01 treat marked gifts as earlier giving that never triggers anything;<br>• DON-09 treats a legacy successor as continuing;<br>• no Studio backfill request may select marked gifts for a donor-facing effect.<br>Amends O1 and O2.                                                                                                                | Phase 34/35 with Phase 13                       |
| O34               | Tribute composition and acknowledgment exclude marked gifts, whatever `notified_through` says.                                                                                                                                                                                                                                                                                                                                                                                                                    | Phase 14                                        |
| O35               | Provider-event intake never records a legacy executor's charge as an Asym gift (K5). The O13 command declares that backfilled reversals require no donor notice.                                                                                                                                                                                                                                                                                                                                                  | Phase 13                                        |
| O24 (extended)    | A legacy arrangement shows "Runs in {source system}" with the ministry-supplied manage or cancel path. History uses P25F:33's known-incomplete-external-coverage state with the covered-through date.                                                                                                                                                                                                                                                                                                             | Phase 25                                        |
| Q4 3(d) (amended) | A legacy charge dated after its arrangement's handover is not a duplicate candidate; it is a refund case.                                                                                                                                                                                                                                                                                                                                                                                                         | Phase 30 spec with Phase 13                     |
