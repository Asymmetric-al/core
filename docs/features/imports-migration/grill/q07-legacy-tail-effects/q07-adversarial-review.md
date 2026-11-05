# Q7 adversarial review — legacy gifts after the switch

Decision under review: Option C as asked, with six parts (`q07-decision-as-asked.md`). The founder chose it on 2026-11-02 with: "be sure we are within best practices. Think of edge cases, but don't over-engineer or make it needlessly complex."

Evidence:

- **Research:** `research/q07-r1` (repo workflows and markers), `q07-r2` (stewardship practice), `q07-r3` (verification of both).
- **Independent reviews:** `review/q07-v1-domain-data-review.md`, `review/q07-v2-ux-ops-review.md`.
- **Lead spot-check:** `docs/prds/workflow-studio/03-runtime-and-recovery.md:25` — "outward effects stay dark unless a bounded backfill request was reviewed".

Labels: **verified**, **repo**, **inference**, **assumption**, **judgment**.

## 1. Category review

### 1.1 Problem validity, necessity and alternatives — material concern: yes (narrows)

**Why C beats the alternatives:**

- **The problem is real.** Tail gifts arrive late, in batches, for donors the old system is still serving. Without a rule, Asym's automations would fire welcome, first-gift and "started giving" results for long-time donors. Bloomerang shows this happening: imported gifts re-enter donors into "First Ever Donation" (q07-r2; verified-vendor-doc).
- **Vendors keep imported gifts silent to donors.** Planning Center, WeGive and Fundraise Up all do (verified-vendor-doc).
- **Missionaries rely on staff-facing gift signals.** MPDX and TntWare both provide them (verified-vendor-doc).
- **A misses stops; B does harm.**

**The concern is that C as asked was built at the wrong layer:**

- It listed effects one by one instead of stating a rule.
- It invented a tail-only notice.
- It held lapse signals for a whole year.
- It claimed to replace owners' markers.

| Concern                                          | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **V1. Lists instead of a rule**                  | Part 1's and part 3's lists miss special-gift tasks, per-gift missionary thank-you tasks, the DON-04 anonymous-gift recipe and any future workflow (q07-r3; v2; repo). **Severity:** medium. **Fix:** one rule — gift-triggered effects run only for gifts first recorded in Asym.                                                                                                                                                                                                                                                                                 |
| **V2. A tail-only "Legacy gift stopped" notice** | Asym gives no such notice when its _own_ recurring gift ends. The Phase 16 matrix has no row for it (`P16:895-905`), and Phase 28 removed the automatic task (`owner-reconciliation.md:89-94`; q07-r3; repo). The notice would duplicate the DON-11 and MPD-06 recipes and become dead code after the tail. Tail donors would also get a stronger signal than Asym donors. **Severity:** medium. **Fix:** parity — a legacy arrangement's end produces exactly the signals an Asym arrangement's end produces, and staff see stops listed in each backfill review. |

### 1.2 Brittleness — material concern: yes

| Concern                                                            | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BR1. SiteStacker edits look like stops**                         | SiteStacker archives a schedule and creates a new one when a donor edits it ("certain changes"; verified-vendor-doc). A cancelled schedule still shows a next run date. Declined gifts are rerun, so a decline is not final (q07-v1). **Severity:** high. **Likelihood:** high. **Fix:** a decline is never a stop. A replacement schedule for the same supporter and designation is shown beside the old one in the backfill review and treated as a continuation unless staff mark it a stop. |
| **BR2. Holding lapse signals for the whole tail hides real stops** | Many sources (the template path, PayPal reports) bring charges but no schedule status, and the stop-evidence classes (O14) are still open. MPDX flags "missed a gift" from expected dates (verified-vendor-doc). **Severity:** high. **Fix:** judge each legacy arrangement normally, but only up to the date its latest backfill covers. Expected gifts after that date are "not yet reported".                                                                                                |

### 1.3 Technical debt — material concern: yes

**Asym markers.** At least six existing origin markers exist (q07-r3; repo):

- `historical=true` in Workflow Studio;
- Phase 14's import entry-origin (which explicitly adds no new origin column, `P14:1490`);
- Phase 28's live/history cohort;
- others.

"Replacing" them would breach C3 (a later phase cannot take another's authority by shorthand). **Fix:** Recorded outside Asym is the single source fact. Each owner derives its own gate from it at write time, and the writing command also sets O1's event flag `historical=true`.

**Current code (repo; not reached by Phase 30, which never writes `donations` per Q4 clause 7):**

- `service.ts:187-198` marks overdue pledges "at risk";
- `donors.ts:174-192` defaults unknown status to Active;
- `gift_date` defaults to today.

These are current-behaviour hazards to retire with the prototype paths (Q4 clause 7, #1031).

### 1.4 Edge cases — material concern: yes

| #   | Case                                                                                | Outcome under §3                                                                                                                                                                                                                               |
| --- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Tail donor also gives a one-off in Asym                                             | Asym gift: normal effects. History includes the tail, so it is not a "first gift".                                                                                                                                                             |
| 2   | Tail donor's first Asym gift after a move                                           | A continuation: no welcome, orientation or first-gift (DON-09 is conditioned on Phase 16's successor link).                                                                                                                                    |
| 3   | Donor edits amount or card in the old system and a replacement schedule appears     | A continuation, shown side by side in the backfill review.                                                                                                                                                                                     |
| 4   | Decline, then rerun success                                                         | Not a stop. The old system's declined-payment message stays on (Q1).                                                                                                                                                                           |
| 5   | Partial refund or chargeback months later                                           | Inherits Recorded outside Asym. No donor notice (refund notice DON-08 suppressed). Staff see it.                                                                                                                                               |
| 6   | Tribute gift on a tail arrangement                                                  | No tribute letter. Phase 14's gate comes from the marker, not its date cut-off (q07-v1).                                                                                                                                                       |
| 7   | Household: one spouse moves to Asym, the other stays on the tail                    | Each arrangement is judged separately. The household total counts both, and neither triggers signals.                                                                                                                                          |
| 8   | Donor merged in Asym (Phase 4) with a tail-only duplicate                           | The marker travels with each gift. The merge creates no "new supporter".                                                                                                                                                                       |
| 9   | Missionary leaves; supporters redirected                                            | Designation changes follow the source facts. Signals go to the designation's current missionary under normal Phase 28 rules.                                                                                                                   |
| 10  | Anonymous tail gift                                                                 | The missionary sees what Phase 28 already allows. In code a donor is anonymous unless they opted out (`missionary-portal/redaction.ts:38-46`).                                                                                                 |
| 11  | Restricted missionary designation                                                   | Same alias rules (Q5 floor).                                                                                                                                                                                                                   |
| 12  | Tail gift in another currency                                                       | Shown in its original currency, as Q1 reconciliation does.                                                                                                                                                                                     |
| 13  | Backfill two months late                                                            | Gifts after the covered-through date show "not yet reported". The Switch lead gets one reminder once the backfill is overdue by cadence plus 7 days.                                                                                           |
| 14  | Backfill replayed                                                                   | Source Record Bindings make it a no-op. Stops are recorded once per arrangement end.                                                                                                                                                           |
| 15  | Older export applied after a newer one                                              | Covered-through dates never move backwards, so staler state is refused in the backfill review.                                                                                                                                                 |
| 16  | Stop recorded, then a restart in the old system                                     | A restart is a new legacy arrangement only if the old system recorded it. It is listed in the backfill review as a leak, since giving forms should be off.                                                                                     |
| 17  | Old system charges once more after a move                                           | A real second charge: recorded, flagged for refund through the original processor, never excluded as a duplicate (amends Q4 clause 3(d)).                                                                                                      |
| 18  | Donor restarts through the public page instead of the move link                     | Listed as "possible double giving" in the backfill review. Staff contact the donor.                                                                                                                                                            |
| 19  | One-off or new gift in the old system after the boundary                            | Listed as a leak, a sign a surface should be off (Q1 overlap check).                                                                                                                                                                           |
| 20  | Donor erased or marked do-not-contact during the tail                               | The backfill's restrict-only facts apply before anything else. Nothing is sent. Q1 clause 12 pending items cover the legacy systems.                                                                                                           |
| 21  | Tail closes with arrangements ended by the ministry                                 | Planned ends: no per-arrangement notices (about 900 at once on an illustrative 3,000-arrangement tail; q07-v2; inference). The closure review lists them.                                                                                      |
| 22  | The ministry connected to Asym the same Stripe account SiteStacker charges on       | Connect events for charges Asym did not create must never become Asym-recorded gifts (O35). They wait for the backfill. Otherwise Asym would receipt and welcome them (q07-v1; inference; whether Stripe routes these events: likely, verify). |
| 23  | SiteStacker "Donation Confirmation to Campaign Owners" (a missionary notice)        | A Q1 surface the ministry sets. By default it stays on through the tail, so missionaries keep per-gift continuity (q07-r3; verified-vendor-doc).                                                                                               |
| 24  | Spark "New Contribution" automation bundles a thank-you with record changes         | The message part stays on; the record-changing steps are off (Q1 clause 7).                                                                                                                                                                    |
| 25  | Spark "Cancel Recurring" email when the ministry cancels the old schedule at a move | A Q1 surface the ministry sets, so the donor does not get a confusing cancellation.                                                                                                                                                            |
| 26  | Gifts waiting in match review                                                       | Do not count as missing. Coverage is judged on committed and pending rows.                                                                                                                                                                     |

**Severity:** 17, 18 and 22 high (money); 3, 13 and 21 medium-high; others medium or low.

### 1.5 Footguns — material concern: yes

| Footgun                                                                                                                                                        | Fix                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **The "reviewed backfill" wording** (`03-runtime-and-recovery.md:25`; verified) would let an approved Legacy Tail Backfill switch on Studio effects. Critical. | Edit that line: a Legacy Tail Backfill is never a Workflow Studio backfill request, and approving one approves data only. |
| **"Never counts as a first gift," read literally,** drops tail gifts from history and makes every migrated donor's first Asym gift "first" (q07-v1). High.     | Reword: these gifts count as earlier giving and never trigger such results themselves.                                    |
| **Q4's duplicate exclusion could hide a real second charge** (q07-v1). High.                                                                                   | Clause 5.                                                                                                                 |

### 1.6 Tenant safety — material concern: no

**Checked:**

- signals and labels are per tenant;
- the backfill review is per Switch;
- Connect events are attributed to the connected account's tenant;
- no cross-tenant aggregation.

### 1.7 Database, RLS and authorization — material concern: yes (low)

**No new tables.** Labels and judgement derive from:

- the Q4 marker (immutable, written at intake);
- the backfill's covered-through date on the run record (append-only, monotonic);
- Phase 16 arrangement state.

Each owner's gate is computed from the marker in the same transaction as its write, never from caller input. Stops and continuations confirmed in the backfill review are attributed decision records.

### 1.8 Overengineering — material concern: yes

**Deleted:**

- the tail-only stop notice;
- the effect lists;
- the year-long hold;
- marker "replacement";
- "updated" wording.

**Kept:**

- one rule;
- one label with an as-of date;
- judgement up to that date;
- parity for ends;
- three lists in the backfill review (stops, leaks, possible double giving).

Nothing new to build beyond owner gates that already exist in some form.

### 1.9 UX/UI and user friction — material concern: yes

**Wording:**

- **Never "legacy gift".** In fundraising it means a bequest (q07-v2; verified).
- **Never "updated".** It reads as "this gift was changed".
- **Spell out months.** US and Canadian date formats are ambiguous (CRA guidance; verified).
- **Name the system plainly.** Show the previous system's display name, which the ministry sets; the default is "our previous giving system".
- **Label:** "{previous system} · gifts shown up to {Month D, YYYY}".

**Donors.** Their legacy arrangement says how to change or cancel it (with the ministry or the old system) and offers the move to Asym. Q4's sentences apply to these gifts too.

**Missionaries.** Labels, the old system's own per-gift notices if kept on, and normal end signals. Copy is plain and accessible; the label is text, not colour.

### 1.10 Source of truth, ownership and invariants — material concern: yes

| Fact                 | Owner                                          |
| -------------------- | ---------------------------------------------- |
| Charge               | Old system or processor                        |
| Gift record          | Phase 13 via the backfill, carrying the marker |
| Arrangement state    | Phase 16, as an external read-only arrangement |
| Covered-through date | The Phase 30 run record                        |
| Gates                | Each owner                                     |

**Invariants:**

- **I1.** No donor-facing effect has a Recorded-outside-Asym fact or any backfill fact as its trigger.
- **I2.** Covered-through dates never decrease.
- **I3.** A distinct charge is never excluded as a duplicate.
- **I4.** Planned ends and moves produce no end signals.

### 1.11 Hidden coupling — material concern: yes (low)

C couples to:

- Phase 34/35's gates;
- Phase 16's arrangement states and SLA (the backfill cadence recorded as the feed's governed SLA, `P16:1078`; owner confirmation that a reviewed export counts as a proved structured feed);
- Phase 28's end signals;
- Phase 14's tribute gate.

All are owner requirements, made explicit (O17, O32–O35).

### 1.12 Failure modes — material concern: yes

| Mode                                | Handling                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Backfill late                       | "Not yet reported" plus one reminder                                                                 |
| A gate missing in some new workflow | The marker-based rule plus a "backfilled facts produce zero donor messages" test plus monitor M-Q7-1 |
| Wrong continuation call by staff    | A correctable decision record                                                                        |
| Stripe events for legacy charges    | Held (O35)                                                                                           |

### 1.13 Lifecycle, temporal, concurrency and idempotency — material concern: yes

**Arrangement:**

- in tail → (move: successor linked) or (end: source stop evidence or staff-marked stop) or (planned end at closure);
- covered-through date only moves forward.

**Rules:**

- Stops are recorded once per arrangement end.
- Replays are no-ops.
- Out-of-order exports are refused.
- After a move, normal judgement resumes on the Asym arrangement, without replaying old alerts.

### 1.14 Data integrity risks — material concern: yes

Double charging and post-move charges (cases 17 and 18), Connect intake of legacy charges (case 22), and replacement schedules (case 3). All are covered by clauses 4–6.

### 1.15 Security and privacy — material concern: yes (low)

- Anonymous and restricted rules carry over unchanged.
- Erasure and do-not-contact facts apply first.
- The old system's campaign-owner notices carry contact data as they stand in the old system. Q1 clause 12's pending legacy erasures cover that.

### 1.16 Scalability and performance — material concern: yes (resolved)

A per-arrangement staleness incident on each monthly cycle would flood staff, and Phase 16 forbids that. The fix is one reminder per Switch. Planned ends at closure send no per-arrangement notices.

### 1.17 Operational burden — material concern: yes (low)

Staff review three lists per backfill and confirm continuations. No developer involvement.

### 1.18 Observability and auditability — material concern: yes

- **Backfill review records:** stops, continuations, leaks and possible double giving, each with an attributed decision.
- **Producers:** each owner records a reason when it stays silent because of the marker (q07-v2), so "why didn't X fire" is answerable.

### 1.19 Dependency and integration risks — material concern: yes

| Dependency                  | Risk                                   | Covered by                  |
| --------------------------- | -------------------------------------- | --------------------------- |
| SiteStacker                 | Schedule replacement and reruns        | Cases 3 and 4               |
| PayPal and template sources | No stop status                         | Judged up to the as-of date |
| Stripe Connect              | Events for charges on a shared account | O35                         |
| Spark automations           | Bundled steps                          | Case 24                     |

### 1.20 Migration, rollout and upgrade — material concern: yes

**Order matters:**

- Phase 35 recipes or Phase 28 tasks shipping before the marker gates would fire on backfills. **Gate:** no Legacy Tail Backfill commits until O33's gates and the zero-donor-messages test pass.
- **O35 must land** before any ministry's shared Stripe account is connected during a tail.

### 1.21 Testability, traceability and proof — material concern: yes

**Acceptance criteria:** AC1–AC12 (§3).

**Terminology:**

- Use "Legacy Recurring Tail", "Legacy Tail Backfill" and "Recorded outside Asym".
- Never "legacy gift" in user copy.
- O17's wording becomes the as-of label.
- Q4 clause 5 ("missionary views unchanged") is amended.

### 1.22 Other development hazards — material concern: yes (low)

The parity rule means any future Asym end-of-gift signal applies to legacy ends automatically. That is intended and documented.

## 2. Disposition

**Accept with required amendments.** C's intent stands: silent to donors, honest to staff. The amendments:

- replace lists with one rule;
- replace the tail-only notice with parity plus backfill-review lists;
- replace the year-long hold with judgement up to the covered-through date;
- keep owners' markers, derived from the one fact;
- fix the Studio wording collision;
- protect against double charges and Stripe intake of legacy charges;
- fix the wording.

## 3. Corrected decision (to record)

**Q7 — Legacy gifts after the switch.** Option C, amended.

1. ★ **Effects follow first recording.**
   - **The rule:** Asym runs gift-triggered effects only for gifts first recorded in Asym.
   - **Recorded outside Asym gifts, with their refunds, chargebacks and corrections:** trigger no donor message, staff or missionary task or notice, welcome, tribute letter, milestone, or first-gift, new-supporter, started, recontinued or special-gift result. They still count in every total and as earlier giving.
   - **Other backfill facts:** nothing else a Legacy Tail Backfill brings in triggers a donor-facing message either (schedule changes, stops, contact facts).
   - **Owner gates:** each owner derives its existing gate from the marker at write time, and the writing command sets the event flag `historical=true` (O1). No owner adds another marker.
   - **Approval approves data only:** a Legacy Tail Backfill is never a Workflow Studio backfill request (edit `docs/prds/workflow-studio/03-runtime-and-recovery.md:25`).
2. ★ **The old system keeps its donor duties** (amends Q1 clause 7). For gifts it charges, its thank-you messages and its gift notices to staff and missionaries (for example SiteStacker's "Donation Confirmation to Campaign Owners") are one recorded surface setting.
   - **Default:** kept on through the tail, with owner and end condition.
   - **Bundled automations:** steps that change records are Off.
   - **Cancellation messages:** the ministry sets whether the old system sends them when it ends a schedule at a move.
3. ★ **One honest label** (amends Q4 clause 5 and O17).
   - **The label:** staff and missionary views show legacy arrangements and the previous-system share of totals as "{previous system} · gifts shown up to {Month D, YYYY}". The previous system's display name is set by the ministry; the default is "our previous giving system".
   - **Donors:** they see Q4's sentences, plus how to change or cancel their arrangement and an offer to move it to Asym.
   - **Copy rules:** never "legacy gift", never "updated", never colour alone.
4. ★ **Judged only up to that date.** A legacy arrangement is judged exactly like any outside arrangement, but only up to its latest covered-through date.
   - **After the covered-through date:** later expected gifts are "not yet reported".
   - **Backfill lag:** raises no per-arrangement incident. The Switch lead gets one reminder when a backfill is overdue by cadence plus 7 days. The cadence is recorded as the feed's governed SLA (Phase 16).
   - **Ordering:** covered-through dates never move backwards, and gifts in match review count as present.
5. ★ **Ends and moves at parity** (amends Q4 clause 3(d)).
   - **What counts as an end:** source stop evidence, or a stop staff confirm in the backfill review. A decline is never a stop, and a replacement schedule for the same supporter and designation is a continuation unless staff mark it a stop.
   - **Parity:** an end produces exactly the signals an Asym recurring arrangement's end produces. A move (Phase 16 successor link) and a planned end at tail closure produce none.
   - **On a move:** the donor gets no welcome, orientation or first-gift message (DON-09 conditioned on the successor link).
   - **Charges after a move:** a legacy charge after a move is a real second charge. It is recorded, flagged for refund through the original processor, and never excluded as a duplicate.
   - **Backfill review lists:** each review lists stops, continuations, leaks (one-off or new gifts through the old system) and possible double giving before commit.
6. ★ **Legacy charges stay outside however they arrive** (O35). A charge on a connected payment account that Asym did not create is never an Asym-recorded gift. It waits for the backfill or an external-intake match.
7. **Order inside a backfill.** Restrict-only contact facts (erasure, do-not-contact, deceased) apply before anything else.
8. **Rollout gate.** No Legacy Tail Backfill commits until the owner gates (O33, O34) and the zero-donor-messages test pass.

**Acceptance criteria:**

| ID   | Criterion                                                                                                                                                                                |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1  | With every automation, recipe and task enabled, committing a backfill of gifts, reversals, schedule changes and stops produces zero donor-facing messages and zero gift-triggered tasks. |
| AC2  | A migrated donor's first Asym gift does not produce a first-gift, new-supporter or welcome result. A truly new donor's does.                                                             |
| AC3  | An approved Legacy Tail Backfill never activates a Workflow Studio binding for historical events.                                                                                        |
| AC4  | Labels show the display name and a spelled-out covered-through date. The banned words are absent (string test). The label is announced to screen readers.                                |
| AC5  | An expected gift after the covered-through date shows "not yet reported" and raises no missed-gift signal. One before it with no charge is judged normally.                              |
| AC6  | A backfill overdue by cadence plus 7 days produces exactly one reminder to the Switch lead, and no per-arrangement incidents.                                                            |
| AC7  | A decline followed by a rerun creates no end. A replacement schedule defaults to continuation in the review.                                                                             |
| AC8  | Ends from source evidence produce the same signals as an Asym end. Moves and closure ends produce none.                                                                                  |
| AC9  | A legacy charge after a move is committed and flagged for refund. The duplicate exclusion refuses it.                                                                                    |
| AC10 | A Connect event for a charge Asym did not create produces no Asym-recorded gift, receipt or workflow.                                                                                    |
| AC11 | Erasure and do-not-contact facts in a backfill apply before any other fact in the same commit.                                                                                           |
| AC12 | Replaying a backfill changes nothing. An older export cannot move a covered-through date backwards.                                                                                      |

## 4. Ruthless synthesis

**Resolve before recording:** founder confirmation of the ★ clauses:

- clause 1 (one rule);
- clause 2 (amends Q1 clause 7);
- clause 3 (amends Q4 clause 5 and O17);
- clause 4 (judgement up to the as-of date);
- clause 5 (parity; amends Q4 clause 3(d));
- clause 6 (O35).

**Capture in the spec:** the backfill-review lists, the label rules, AC1–AC12, and a glossary note (no new terms; "legacy gift" banned in user copy).

**Owner requirements:**

| ID              | Owner                     | Requirement                                                                                                                      |
| --------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| O17 (rewritten) | Phase 16 / 28 / 25        | The as-of label and judgement up to the covered-through date.                                                                    |
| O32             | Phase 28                  | Missionary label, and end signals at parity.                                                                                     |
| O33             | Phase 34/35 with Phase 13 | Marker-derived gates. The `03-runtime-and-recovery.md:25` edit. DON-09 conditioned on the successor link. Silent-reason records. |
| O34             | Phase 14                  | Tribute gate from the marker, not a date cut-off.                                                                                |
| O35             | Phase 13                  | Connected-account charges Asym did not create are never Asym-recorded gifts.                                                     |
| Phase 16        | Phase 16                  | Backfill cadence as the feed's governed SLA.                                                                                     |

**Order:**

1. O33 and O34 gates, and the AC1 test.
2. O35.
3. The first backfill.

**Monitor:**

| #      | Risk                                  | Signal                                                                             | Threshold                                                                                    | Owner                                    | Response                                                                                         |
| ------ | ------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------ |
| M-Q7-1 | A donor message fires from a backfill | Any donor-facing message whose trigger is a Recorded-outside-Asym or backfill fact | More than zero                                                                               | Phase 34/35 owner                        | Disable that producer, fix its gate, and the ministry contacts affected donors                   |
| M-Q7-2 | Tail data goes stale                  | Days since covered-through date per Switch                                         | More than cadence plus 7 days                                                                | Switch lead, with the relationship owner | Run the backfill; check the source export                                                        |
| M-Q7-3 | Double charging and leaks             | Backfill-review counts of post-move charges, possible double giving and leaks      | Any post-move charge, or possible double giving over 2% of tail arrangements in one backfill | Switch lead, with the Phase 16 owner     | Refund through the original processor; contact the donors; find and turn off the leaking surface |
