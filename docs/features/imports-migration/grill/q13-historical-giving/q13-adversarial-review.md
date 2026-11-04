# Q13 adversarial review: giving history in a Switch

Founder answer (2026-11-03): **"Option A, but be must do an excellent job a data integrity and also not building in techincal debt or brittleness. Do think of edge cases and how to manage them well with over over engineering or creating needless complexity."** The founder also asked for a full ruthless review. Decision as asked: `q13-decision-as-asked.md`.

## Evidence

| File                                            | What it covers                                                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `research/q13-r1-repo-money-history.md`         | Owner texts for writer, designations, ledger, currency, Legal Entity, gift families and missionary visibility |
| `research/q13-r2-external-history-migration.md` | Vendor history scope, funds, accounting separation, currency, reconciliation and labels                       |
| `research/q13-r3-owner-text-verification.md`    | Exact owner quotes; corrections to r1                                                                         |
| `research/q13-r4-code-and-database.md`          | Current schema, triggers, readers, RLS, currency and scale on develop `629cb71dc`                             |
| `research/q13-r5-external-edge-cases.md`        | Scale, edge-case catalogue, audit tie-out, retention, correction, UX and missionary security                  |

Claims re-verified directly on 2026-11-03:

- **General Fund fallback.** Phase 13 resolves an unspecified target to the General Fund "at write" (`phase-13-…md:1745-1746`). It also requires "No final unassigned designation" (`:1935`).
- **Refunds.** "Refund ≤ unrefunded … reject if the requested reversal exceeds the header's effective total" (`phase-13-…md:1936`).
- **Frozen legal donor.** The legal donor "is frozen as exact source evidence at acceptance; only intentional `unknown_offline` may be null" (`phase-13-…md:225`).
- **DAF shape.** "`is_daf_grant = true` makes the hard-credit donor = the sponsor party" (`phase-13-…md:1814`).
- **Noncash value, Phase 13.** The internal FMV "IS the non-cash line's `amount_minor`" (`phase-13-…md:1815`).
- **Noncash value, Phase 15.** "In-kind posts `recognized_value = 0`", enforced "across grid entry, CSV paste, API, and import" (`phase-15-…md:922-927`).
- **Dating.** Phase 7 A14 dates a mailed check by "a captured postmark or a distinct staff-attested actual mailing date" (`phase-07-…md:246`). A15 requires a staff attestation for every prior-year date (`:248`).
- **Missionary Support Activity.** "Exact Phase 13 money-designation postings … become provisional Missionary Support Activity. A prospective source-family Support Allocation Readiness Policy determines when each positive allocation may enter a Support Cycle close. Adverse corrections always remain appendable." (`phase-21-field-accounts.md:73-76`).
- **Adverse corrections.** Refunds, returns and chargebacks "MUST NOT be suppressed" (`openspec/contracts/field-account-operations.md:206-208`).
- **Late pre-cutover facts.** These are resolved against the opening manifest (`docs/adr/0106-…md:98-105`).
- **Previous accounting owner.** "Prior records remain attributed to the prior connector or manual workflow. Optional historical backfill is off by default" (`phase-20-accounting-exports-reconciliation.md:1052-1055`).
- **Missionary roster.** The roster is "positive effective recognized support … in the trailing 365 days", with a "365–730-day display band" (`phase-14-…md:1093-1097`). The missionary sees "per-path recognized amounts + dates + fund (alias-governed)" and never notes (`:1105`).
- **Anonymity.** "Source-approved anonymity SHALL be established positively; absence from a separate capped roster SHALL not permit identity disclosure" (`phase-28-…/proof.md:167-168`).
- **Settlement currency.** It is hard-coded to USD (`packages/api/src/money/settlement.ts:13-24`).
- **Dashboard revenue.** "This month" is filtered on `donations.created_at` (`packages/api/src/reads/dashboard-stats.ts:74-85`).
- **GraphQL supporters.** `mySupporters` returns every gift to a missionary with the donor's full profile, including email, through the service-role client (`packages/graphql/handler.ts:372-404`; select `packages/api/src/donations/select.ts:9-10`; `mapProfile` `:842-854`). It is mounted in the donor app (`apps/donor/app/api/graphql/route.ts`).

This is research, not legal or audit advice.

**Disposition: accept with required amendments.** All history, gift by gift, is the right answer, and it is industry practice. Five things in A as presented were unsafe or vague:

1. **Facts frozen at commit cannot be added later.** A's fallback ("Anything Asym can't take yet is shown as 'history not yet covered'") would commit gifts in the wrong shape.
2. **Missing anonymity would fail open.**
3. **"Missionaries see their supporters' imported gifts" over-promises.** The owner views show about two years.
4. **Imported refunds could reach Field Account balances.**
5. **Today's screens would misreport history.**

The writer is not the main risk. The readers are.

The corrected decision text is in §3.

---

## 1. Category review

### 1.1 Problem validity, necessity and alternatives: material concern, yes (narrows the answer)

**The problem is real.**

- Missionary support work runs on supporter history: recency, first gift, lapsed and faithful supporters. Missionary tools already show it (DonorHub feeds TntConnect and MPDX nightly; r2 §8).
- C22 forbids guessing first-gift or lapse conclusions from missing history.
- Q7 already promised that Recorded-outside-Asym gifts "still count in every total and as earlier giving".

**Is the level right?** Phase 30 moves and reconciles. The money, recognition, dating and balance rules belong to Phases 13, 14, 7, 21 and 20 (C1). Every substantive rule below is therefore an owner request, not a Phase 30 invention.

**Strongest alternative: B (older years as yearly totals).**

- B would cut reconciliation volume. But it loses refund linkage and gift-level dates for those years, and it breaks first-gift answers.
- A summary row is also a fabricated gift: it has no source identity, so Exact repeat import (Q1 clause 5) cannot converge on it.
- No vendor recommends summaries (r2 §1). Scale does not force them (§1.16).
- B stays rejected.

**No-build alternative: archive the old system's reports as files only.** Rejected. Missionaries and staff need history inside recency, roster and first-gift logic, not in a PDF. The archive is still needed as custody evidence (Q2, Phase 29).

**Too vague to implement consistently:**

- **"Missionaries see their supporters' imported gifts."** The owner projection is the Phase 14 roster, which covers the trailing 365 days plus a 365–730-day band (`phase-14:1093-1097`, `:1105`). Phase 30 must not invent a missionary history screen. _Change:_ clause 10.
- **"A closed, history-only record."** It could be read as a new missionary-person lifecycle. The owners already have a lifecycle on designations (`retired_at` / `is_active`, `phase-13:1900`), and a designation is separate from the person (`phase-14:1123`). _Change:_ use a retired designation (clause 5).
- **"Extra details … else 'history not yet covered'."** It is safe for stand-alone recognition records. It is unsafe for facts frozen at commit. _Change:_ clauses 2 and 6.

**Nothing unnecessary is frozen.** The spot-check size (20 random gifts plus the 5 largest) is a requirement, not a design detail, and it is justified in §1.21.

### 1.2 Brittleness: material concern, yes

| Fragile assumption                                                                                                      | What breaks                                                                                           | Fix                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| The export always carries every fact frozen at commit (legal donor shape, tender, entity, Site, currency, target, date) | Gifts commit in the wrong shape, permanently (`phase-13:225`, `:1738`, `:1814`)                       | **Complete or wait** (clause 2). Nothing is filled from a default.                                              |
| The export carries an anonymity flag                                                                                    | Donors who asked for anonymity are exposed to missionaries                                            | Anonymity fails closed (clause 6), as `proof.md:167-168` requires                                               |
| Dates parse the same way everywhere                                                                                     | Day/month swaps (Excel), and date-only values shift a day through UTC (Salesforce Data Loader, r5 §2) | Dates stay calendar dates; ambiguous formats are flagged (Q11); date-only values never pass through a time zone |
| Every currency has two decimals                                                                                         | Yen or dinar history is misstated 100× or 10× (r4 §5: at least 22 files divide by 100)                | Exponent-checked amounts (clause 3) and reader readiness (clause 9)                                             |
| Old funds map one-to-one to today's designations                                                                        | Departed missionaries and reused fund codes                                                           | Retired designations, plus explicit mapping per source fund (clause 5)                                          |
| SiteStacker's Historic Giving and Contributions do not overlap                                                          | Gifts are counted twice                                                                               | Already handled: Q1 clause 9 (one source basis per population and period, with an overlap proof)                |
| Today's screens can show history correctly                                                                              | They cannot (§1.14)                                                                                   | Reader readiness gate (clause 9)                                                                                |

### 1.3 Technical debt: material concern, yes

- **Writing history to the prototype `donations` table would be pure debt.** It has no provenance, no external id, no uniqueness beyond the row id, and defaults that invent facts: `gift_date DEFAULT CURRENT_DATE`, currency `usd`, demo tenant (r4 §1). Deletes cascade away audit rows (r4 §11). Q4 clause 7 already says money imports wait for the owner commands. _Make explicit:_ history is never written to the prototype table (clause 1).
- **Duplicated validation.** If Phase 30 re-implemented money checks, it would drift from Phase 13. _Prevention:_ Phase 30 calls the owner command's no-write check (O28) with the same rules as commit. There is no second rulebook.
- **A Phase 30-only "closed missionary" state** would duplicate the Phase 13/14 designation lifecycle. _Prevention:_ reuse retired designations.
- **Reader drift.** Each new surface that sums gifts is a future bug unless reader classification becomes a standing rule. _Prevention:_ O60 makes it a requirement on every gift reader, not a one-off audit.

### 1.4 Edge cases: material concern, yes

Each case below is handled by a clause in §3; none needs a new subsystem.

| #   | Case                                                                               | Handling                                                                                                                                                                                                             |
| --- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | Zero-amount gift (pledge marker or in-kind placeholder)                            | A zero cash gift waits with reason "zero amount". The ministry excludes it or maps it to its real family. Noncash follows clause 6.                                                                                  |
| E2  | Negative amount row standing alone                                                 | It is treated as a reversal and must link to an original (clause 4); otherwise it waits                                                                                                                              |
| E3  | Partial refund                                                                     | A linked reversal up to the remaining amount (`phase-13:1936`)                                                                                                                                                       |
| E4  | Refund in a later year than the gift                                               | It folds into the original under Phase 13's fold. Year totals follow the original's date, so no negative year appears (`financial.md:131`).                                                                          |
| E5  | Refund whose original is before the Coverage start                                 | The refund is left out with its original and counted as a declared exclusion                                                                                                                                         |
| E6  | Refund with no original, dated before its original, or larger than the remainder   | It waits; it is never matched by guesswork (clause 4)                                                                                                                                                                |
| E7  | Chargeback later won by the ministry                                               | Two linked entries (reversal, then reinstatement), as the source records them. If the source cannot show both, the pair waits.                                                                                       |
| E8  | Refund recorded after the Switch Boundary for a pre-boundary gift                  | Arrives only through a Legacy Tail Backfill (Q1 clause 6)                                                                                                                                                            |
| E9  | Gift dated after the Switch Boundary in the history file                           | Refused from history; it belongs to a backfill or is a data error                                                                                                                                                    |
| E10 | Missing or unparseable date                                                        | Waits; never "today"                                                                                                                                                                                                 |
| E11 | Date-only value at midnight UTC                                                    | Kept as a calendar date and never converted (clause 3)                                                                                                                                                               |
| E12 | Currency with 0 or 3 decimals                                                      | Exponent check; a stray fraction (for example 100.5 JPY) waits                                                                                                                                                       |
| E13 | Currency Asym cannot take today (for example CAD history on a USD-settling tenant) | Accepted as history. Totals stay per currency. No transactability check (clause 3).                                                                                                                                  |
| E14 | Split gift whose lines don't add up by 1 minor unit                                | Waits; the source total is evidence and is never adjusted                                                                                                                                                            |
| E15 | Gift to a donor merged away in the source                                          | Follows the source's surviving record through Source Record Bindings (Q10). Unresolved gifts wait in match review.                                                                                                   |
| E16 | Gift to a donor deleted in the source but still present in gift exports            | Bound to an imported Party only through Q10 matching. Otherwise anonymous-unknown is not allowed for online gifts, so it waits.                                                                                      |
| E17 | DAF grant recorded under the advisor with a memo "Fidelity Charitable"             | Imported as the source recorded it, unless the source marks DAF in a mapped column. Never re-attributed after commit (Q10). The plan shows a count of memo-suspected DAF rows for the ministry to map before commit. |
| E18 | Employer match recorded as the employee's gift                                     | Same as E17                                                                                                                                                                                                          |
| E19 | Reused fund code (one fund passed from missionary A to successor B)                | One source fund maps to one designation. Splitting by date is a reviewed transformation in the file (Q3), not a Phase 30 feature.                                                                                    |
| E20 | Fund or missionary name contains a restricted worker's legal name                  | Passes Phase 10's alias rules before storing (clause 5); missionaries and donors see Asym's designation name                                                                                                         |
| E21 | Gift memo with sensitive text (health, location, family)                           | Staff-only, under Q5 visibility; never shown to missionaries or donors                                                                                                                                               |
| E22 | Gifts from an estate, or after a donor's death                                     | As the source recorded them. Q9's deceased handling governs contact, not history.                                                                                                                                    |
| E23 | Anonymous gift in the source (known donor asked)                                   | Donor kept; the anonymity fact is recorded; the missionary sees no identity                                                                                                                                          |
| E24 | Truly unknown offline donor (loose cash, unidentified check)                       | Null legal donor only as intentional `unknown_offline`, with the source batch as evidence                                                                                                                            |
| E25 | Recurring instances in history                                                     | Imported as individual gifts. Recurring evidence goes separately to Phase 16's classifier (Q1 kit); schedules are never built from history (`phase-16:2581`).                                                        |
| E26 | Gift in the switch year, before the boundary                                       | History, Recorded outside Asym, documented by the old system (Q4)                                                                                                                                                    |
| E27 | The same check entered in Asym during the editing pause and also in the source     | Q4 clause 3(d) flags possible duplicates for review; it never auto-excludes a distinct charge (Q7)                                                                                                                   |
| E28 | Gift with an implausible date (before the ministry existed)                        | Accepted as recorded, but listed in the reconciliation pack's "earliest and latest dates" line for the ministry to confirm. No hard-coded cutoff.                                                                    |

### 1.5 Footguns: material concern, yes

| Footgun                                        | Harm                                                                                | Prevention                                                                                                                                                                                 |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| General Fund fallback (`phase-13:1745`)        | Thousands of mis-designated gifts, invisible until a missionary's totals look wrong | No fallback for adoption (O53). Mapping a fund to General Fund is an explicit, counted choice.                                                                                             |
| Bulk "create retired designations"             | Duplicates of existing active funds                                                 | The mapping step shows likely existing matches first. Creating needs a person's confirmation and shows the list. Retired designations are never givable, so a duplicate cannot take money. |
| Coverage start set later to hide awkward years | History silently missing                                                            | Coverage start is on the Switch summary, in every history view note, and in reconciliation as a declared exclusion with counts and totals                                                  |
| A false "no anonymity option" attestation      | Exposes donors who asked for anonymity                                              | The attestation is per source population, signed and stored as evidence. The default without it is fail-closed.                                                                            |
| A correction run voiding too much              | Large history loss in views (facts remain)                                          | Separate capability (O52 pattern), an "N gifts, total X per currency will be voided" confirmation, and a mandatory reason. It is reversible by re-adopting.                                |
| Fund mapped to the wrong missionary            | Wrong supporter rosters and missionary totals                                       | Per-designation totals in the reconciliation pack, which the ministry compares with old missionary statements; plus the spot check                                                         |
| Editing history in place                       | Breaks audit and Recorded-outside Asym                                              | No update path. Corrections are append-only (clause 12).                                                                                                                                   |

### 1.6 Tenant safety: material concern, yes (requirement)

- **Current behaviour.** `donations.missionary_id` and `fund_id` are plain FKs, so a gift can point at another tenant's missionary or fund (r4 §1).
- **Required.** Owner tables use tenant-composite FKs (`(tenant_id, designation_id)` referencing `(tenant_id, id)`). Tenant, Legal Entity and Site are resolved server-side from the session tenant and the signed statements, never from row values.
- **Also required.** Value-mapping tables and Remembered mappings are per tenant and source (Q11). Practice copies are in a separate environment (Q6). Reconciliation reads are tenant-scoped.
- **Cross-tenant reporting.** None is created. Platform metrics on Switch health count rows, never content (Q11 monitor).

### 1.7 Database, RLS and authorization safety: material concern, yes (requirements for owners)

| Concern                   | Requirement                                                                                                                                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source identity           | Unique `(tenant_id, source_system, installation, record_family, source_object_id)` on adopted money facts (O16, D23). Retries and Exact repeat import converge on it.                                                            |
| Amounts                   | Integer minor units (`bigint`) plus an ISO currency referencing `currency_metadata`, with a CHECK or owner validation that the amount fits the currency exponent. Never `numeric` dollars with implied cents.                    |
| Dates                     | `gift_date` is a `date`, not a timestamp, with the dating basis `source_recorded` (O54)                                                                                                                                          |
| Defaults                  | No default on any fact frozen at commit (tenant, entity, Site, currency, date, target). A missing value fails the insert.                                                                                                        |
| Append-only               | No UPDATE or DELETE grant on adopted facts. Corrections append (void plus successor). Recorded outside Asym and the origin are NOT NULL and immutable (Q4).                                                                      |
| Reversals                 | `reverses_posting_id` same-tenant FK, with the owner function enforcing "after original, ≤ remaining" (`phase-13:1936`)                                                                                                          |
| Designations              | Same-tenant FK. A retired target is accepted only by the adoption command, never by live giving (checkout re-validates `is_active`, `phase-13:1545`).                                                                            |
| Writes                    | Only the Phase 13 adoption command, through a narrowly granted server function. Actor, tenant and run come from server context. Callers cannot set the origin or Recorded outside Asym.                                          |
| Reads (staff)             | Phase 12 capabilities (O27).                                                                                                                                                                                                     |
| Reads (missionary)        | Only through the Phase 3 `resolveProjection` chokepoint (`phase-14:1105`), never the raw table. **Current RLS lets a missionary read `donor_id`, `notes` and `source` on gifts to them (r4 §4); history must never land there.** |
| Reads (donor)             | Own gifts through the Phase 25 read model                                                                                                                                                                                        |
| USING and WITH CHECK      | No mutation policy can move a history row's tenant or designation, or clear Recorded outside Asym. Since no UPDATE is granted, WITH CHECK has nothing to widen; tests prove UPDATE and DELETE are denied.                        |
| Forbidden-state transform | Redesignation of a history line (Phase 13's redesignation path) must keep the origin and Recorded outside Asym, and may not target a designation in another tenant. Tested.                                                      |

### 1.8 Overengineering: material concern, yes (minor; resolved by reuse and deletions)

**Removed or refused:**

- currency conversion or revaluation;
- fuzzy matching of refunds to gifts;
- a per-jurisdiction retention engine;
- field-level history editing;
- throttled API ingestion or per-file row caps;
- AI memo scanning;
- live schedules or pledges built from history;
- a Phase 30 missionary history screen;
- pre-loading closed years before the boundary;
- a statistical sampling engine;
- a new missionary-person lifecycle;
- a fallback designation.

**Reused instead of built:**

- **Waiting rows** are the plan's existing per-row disposition (Q1 clause 9).
- **Retired designations** are the existing Phase 13 lifecycle.
- **The dating basis** is one new enum value in Phase 7.
- **Reader readiness** is a checklist with tests, not a framework.
- **The spot check** is a list of 25 rows on one screen.

### 1.9 UX/UI and user friction: material concern, yes

**Staff (Mission Control, desktop-first; acceptable for a one-time Switch).**

- **Fund mapping is the bottleneck.** DonorPerfect budgets about two weeks after final data, mostly mapping and sign-off (r5 §1).
  - The Value-mapping table lists each source fund with its gift count, total per currency and date range, sorted by total.
  - Bulk actions:
    - map selected funds to one designation;
    - create retired designations for selected funds;
    - map to General Fund explicitly.
  - Remembered mappings pre-fill re-runs.
  - A fund with a likely existing match shows it first.
- **Waiting rows.** They are grouped by reason in plain words ("No fund mapped", "Date unclear", "Refund without an original", "Lines don't add up"). Each group shows its count and total, with one fix action per group, and download of that group's rows for correction in the source file (Q3).
- **Reconciliation pack.**
  - Per year, Legal Entity and currency: counts, totals and distinct donors.
  - Each level-2 control (Q1 clause 9) shows tied, unexplained variance, or declared.
  - Declared exclusions and the Coverage start are listed with counts.
- **Spot check.** Twenty random gifts and the five largest are shown in a list with the source row values beside the Asym gift. The ministry ticks each one after checking it on the old system's screen. Any mismatch stops sign-off with a "Report mismatch" note.
- **Labels.** Gift detail shows "Imported from {system} · Switch {Month D, YYYY}". Gift lists filter by origin. KPIs keyed on gift date show history in its own years, never as this month's revenue.

**Donors.** Their own history, with Q4's three neutral sentences and no receipt action (O24). Mobile-first under Phase 25. Native currency with code when it is not the tenant's default.

**Missionaries.**

- Imported gifts appear in the Phase 14 roster exactly like Asym gifts, with Q7's "{previous system}" label. There are no memos and no identity for anonymous gifts.
- **Expectation gap:** MPDX users see full multi-year history (r5 §6). Asym's roster covers two years.
- That is an owner rule (Phase 14/28), deliberately privacy-floored. It is recorded as a monitor (M-Q13-7), not changed here.

**Accessibility.**

- Tables have captions and header associations.
- Amounts are read with their currency code.
- Status uses text, not colour alone.
- Bulk actions are keyboard-reachable.
- Confirmation dialogs state counts in words.

**Localisation and time.** Dates are shown as calendar dates in the tenant's format, never time-zone shifted. International names come as recorded (Q10).

**Language.** Use "history", "imported from", "waiting" and "left out". Never "legacy", "migrated", "error" (for waiting rows) or "not a tax receipt" (O24).

### 1.10 Source of truth, ownership and domain invariants: material concern, yes (must be stated)

| Fact                                                                     | Authoritative owner                                                                  | Phase 30 role                                                               |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Pre-boundary gifts                                                       | The source system until the Switch Boundary; then Asym's adopted facts (Q1 clause 2) | Transport and evidence                                                      |
| Adopted gift, lines, postings, reversals                                 | Phase 13 (D.6 command)                                                               | Calls the command; never writes tables                                      |
| Dating fact                                                              | Phase 7                                                                              | Supplies the source-recorded date                                           |
| Recorded outside Asym                                                    | Phase 7 (Q4, O22)                                                                    | Supplies the origin                                                         |
| Recognition (credits, tributes, matching links, anonymity)               | Phase 14                                                                             | Supplies source records                                                     |
| Field Account balances                                                   | Phase 21, opening only through D17                                                   | None (FAO:171-177)                                                          |
| Accounting                                                               | Phase 20; prior owner for pre-cutover                                                | None                                                                        |
| Designations and their lifecycle                                         | Phases 13/14                                                                         | Requests creation of retired designations through the owner command         |
| Source Record Bindings, manifests, mappings, plans, runs, reconciliation | Phase 30                                                                             | Owner                                                                       |
| Totals, rosters, dashboards                                              | Derived read models                                                                  | None. They must be rebuildable from facts and never become write authority. |

**Invariants**, enforced in the database where marked (DB):

1. **I1:** One adopted gift per source-qualified identity per tenant (DB unique).
2. **I2:** Lines add up to the header exactly. A reversal is dated on or after its original and never exceeds the remainder (DB and owner function).
3. **I3:** Every history gift and its reversals carry Recorded outside Asym and the history origin. Both are immutable (DB NOT NULL, no UPDATE).
4. **I4:** No history gift has a Field Account occurrence, Support Activity, posting intent, settlement or payout link, receipt plan or statement line. This is enforced by consumer rules plus negative tests, because absence of a link cannot be a plain constraint; each consumer table that references contributions rejects history-origin rows where it can (CHECK via origin column copy or trigger).
5. **I5:** No fact frozen at commit comes from a default (DB: no defaults; NOT NULL).
6. **I6:** Every history line targets a same-tenant designation, active or retired (DB composite FK).
7. **I7:** History can never become a current gift by editing a field (no UPDATE path; origin immutable).
8. **I8:** Totals never mix currencies (reader rule, O60; tested).
9. **I9:** Every final-manifest row has exactly one disposition: committed, waiting, left out (with reason) or duplicate of the other source basis (Q1 clause 9). A sign-off requires zero waiting rows. Every waiting row must be resolved or left out.

**Dual ownership or shadow state.** The prototype stored totals (`donors.total_given`, `missionaries.current_funding`, `funds.current_amount`) are shadow state that nothing updates (r4 §3). They must not be "fixed" by Phase 30 adding history to them. Readers move to owner read models (O60).

### 1.11 Hidden coupling: material concern, yes

- **D.6 events fan out.** Phase 14 roster, Phase 21 and progress read models react to D.6 events (r3 G3). O1 and O33 cover workflows only. _Fix:_ every consumer of contribution events handles the history origin explicitly: read models include it, and work-producing consumers ignore it (O53, extending O1/O33).
- **Phase 21 adverse corrections.** An imported historical refund is an "adverse correction" under FAO:206-208 unless Phase 21 classifies D.6 history as predecessor facts. _Fix:_ O55.
- **Phase 10 alias firewall.** Labels freeze at commit, so the firewall must run before the snapshot freezes (O57).
- **SiteStacker column names.** These are covered by Q3 preset versioning and header capture.
- **Prototype readers.** These are covered by O60.

### 1.12 Failure modes: material concern, yes

| Failure                                                        | Behaviour required                                                                                                                          |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Commit stops part-way (deploy, timeout)                        | Chunks are idempotent on source identity; resuming converges. The run shows "N of M committed" and can be resumed or halted (Q1 clause 10). |
| Lost response for a chunk                                      | Retry is safe (I1). There is no "did it commit?" ambiguity, because the next attempt reports "already committed".                           |
| The owner command rejects a row that passed the no-write check | Rare by construction (same rules, O28). The row becomes a waiting row with the owner's reason, and the run continues.                       |
| Reconciliation fails after commit, before go-live              | Abort keeps committed rows invisible and never deletes them (Q1 clause 10). A later attempt converges.                                      |
| A systematic error is found after go-live                      | A correction run (clause 12) voids and re-adopts. Facts are preserved; read models rebuild.                                                 |
| A consumer reacts to history despite the rule                  | M-Q13-1 detects it (zero tolerance). Halt the consumer, then run the owner's correction path.                                               |
| Secondary effects after the authoritative write                | None by design. Read-model lag shows as "updating" in staff views, never as wrong totals presented as final.                                |

### 1.13 Lifecycle, temporal correctness, concurrency and idempotency: material concern, yes

**Row lifecycle.** A row moves staged → checked → waiting, left out or ready → committed. A committed row may later be voided by correction and have a successor.

**Forbidden transitions:**

- committed → edited in place;
- history → current;
- waiting → committed without a fix;
- left out → committed without a new plan.

**Terminal states:** committed (with possible successors) and left out (recorded with reason).

**Temporal rules:**

- Dates are calendar dates as recorded.
- The Switch Boundary governs classification only (Q1).
- Post-boundary facts come through backfills.
- A designation changed in the source after a practice run surfaces as a source-changed conflict (Q1 clause 5).
- The Coverage start is fixed at go/no-go. Changing it later is a new plan that imports more history, never a deletion.

**Concurrency:**

- One active history commit per Switch.
- Correction runs and Legacy Tail Backfills for the same Switch are serialised.
- Everyday imports are paused (Q12).
- A staff Phase 15 batch during the pause can duplicate a source gift. Q4 clause 3(d) flags it.

**Idempotency.** It is tied to the durable effect (the source-qualified gift identity), not to the request or chunk.

### 1.14 Data integrity risks: material concern, yes

| Risk                                  | Evidence                                                  | Prevention                   |
| ------------------------------------- | --------------------------------------------------------- | ---------------------------- |
| Silent duplicates on re-run           | No external id or uniqueness in today's table (r4 §1)     | I1                           |
| Two source bases double-counting      | Historic Giving vs Contributions (r2 §9)                  | Q1 clause 9 overlap proof    |
| History shown as this month's revenue | `created_at` readers (`dashboard-stats.ts:74-85`; r4 §3)  | O60                          |
| Stale totals miss history             | Stored totals never updated (r4 §2)                       | O60 (owner read models)      |
| Receipts offered for history          | Donor portal receipt download for any owned gift (r4 §10) | Q4 and O60                   |
| Netted refunds                        | Vendor practice (r5 §2)                                   | Clause 4                     |
| Wrong designation                     | General Fund fallback                                     | Clause 2 and O53             |
| Wrong donor                           | Phase 4 matching flaw                                     | O47 must be live first (Q10) |
| Currency mixing                       | Totals across currencies (r4 §5)                          | I8, O60                      |
| Facts frozen wrong                    | `phase-13:225`, `:1814`                                   | Clause 2                     |

### 1.15 Security and privacy risks: material concern, yes

- **Existing exposure, outside Phase 30 (D38, §6).** `mySupporters` returns full donor profiles (including email) of every gift to a missionary through the service-role client. It ignores anonymity and the Phase 28 H.5 field floor, which says missionaries never see email. Importing history would multiply what it exposes. It is flagged, not acted on. History must not be committed while any reader bypasses the projection (O60).
- **Anonymity** fails closed (clause 6).
- **Restricted workers.** Their names in legacy labels and memos pass Phase 10 before freezing (O57).
- **Memos** are staff-only.
- **The spot-check screen** shows source rows under Q5 visibility.
- **Special-category inference.** Gifts to a mission can reveal religious belief (UK/EU GDPR Art. 9; r5 §4). History follows the same retention, erasure and export rules as Asym gifts: erasure removes identity but keeps the money facts. Coverage start lets a ministry not import very old history. No per-country engine is built.
- **Logs** never contain row content (Q11 monitor). Run evidence stores counts and identifiers, not personal data, outside Phase 29 custody.
- **Exports** of history follow the owner's export permissions.

### 1.16 Scalability and performance: material concern, yes (requirement; moderate)

**Volume.** World Team US recorded 61,181 donations in one year (r5 §1). Ten to twenty years for small to large ministries is roughly 0.2M–5M gift rows plus lines and reversals. That is a database bulk load, not an API job.

**Requirements:**

- Chunked, resumable commit (roadmap), with idempotent chunks.
- Validation runs before any write.
- Owner tables are indexed on `(tenant_id, gift_date)`, `(tenant_id, legal_donor)`, `(tenant_id, designation)` and the source identity.
- Readers use per-currency aggregates. There are no unbounded client sums and no silent 1,000-row caps: today several sums truncate at the API default (r4 §7).
- The Stripe webhook lookup by payment id is unindexed today (r4 §8). History must never write processor IDs into live-matching columns. Legacy provider identifiers are inert evidence (Q1 clause 8).

**Timing.** Practice runs measure commit plus reconciliation time. Go/no-go requires the last practice run to fit within half the declared editing pause (M-Q13-5).

**Unverified:** hosted limits, timeouts and query plans at this volume. The production-shaped practice run (Q6) is the proof.

### 1.17 Operational burden: material concern, yes (contained)

- **The burden is human:** fund mapping, waiting rows, reconciliation and the spot check. It is reduced by the counts, totals, bulk actions and Remembered mappings above.
- **No database repair.** Every fix is a product action: map, fix file, leave out, or correction run.
- **No developer involvement.** The ministry runs it (Q5); Asym help works through Asym help access.

### 1.18 Observability and auditability gaps: material concern, yes

**Business history (durable).** For each run:

- manifest and mapping versions;
- per-row disposition with reason code;
- reconciliation report version and sign-off actor;
- spot-check results and actor;
- correction runs with actor, reason, counts and totals.

**Security audit.** Who viewed raw source rows or memos (Q5) and who ran corrections.

**Technical telemetry.** Chunk timing, retries and failures, with identifiers and counts only.

**Zero-effects proof.** After each run, a check that no messages, tasks, receipt plans, Field Account occurrences, posting intents or settlement links reference history (M-Q13-1).

### 1.19 Dependency and integration risks: material concern, yes

- **Owner readiness is the critical path.** Phase 13 D.6, Phase 7 dating, Phase 14 shapes, Phase 21/20 exclusions, Phase 10 firewall, Phase 2/24 Site, and the readers. No money import commits before them (Q4 clause 7; owner-constraints :389-393, "adapters activate only after the target phase and its typed import command exist").
- **SiteStacker export changes.** Covered by Q3 presets and header capture; an unknown header blocks the plan (Q11).
- **No third-party service is involved** (Q11). Processors stay authoritative for their own charges (Q1).

### 1.20 Migration, rollout and upgrade risks: material concern, yes

- **Readers on two stores.** While readers still read the prototype `donations` table, history in owner tables is invisible. If a reader unions both stores, it double-counts. _Requirement:_ each reader reads exactly one gift store per tenant, and the readers move to owner read models before the first history commit (O60).
- **Production data status is unknown** (D13, D24/O20). No real history is committed anywhere until O20 is resolved.
- **Kill switch.** Halt a run (Q1 clause 10). Per-tenant activation follows the owner adapter rule.
- **Rollback after new data exists.** It is a correction run, which is append-only and therefore safe across versions.
- **Mixed versions.** The owner command version is recorded on each run, and a re-run under a newer command version converges on I1.

### 1.21 Testability, traceability and proof: material concern, yes

**Proof needed:**

- **Positive:** a full practice run reconciles cent-exact.
- **Negative:** every waiting reason (E1–E16) produces a waiting row and no commit.
- **Boundary:**
  - exponent 0 and 3;
  - date at midnight UTC;
  - date equal to the boundary;
  - lines off by one minor unit;
  - a reversal over the remainder by one;
  - a reversal one day before its original.
- **Authorization:**
  - a missionary never sees memos or the identity on anonymous gifts;
  - a missionary cannot read raw tables;
  - cross-tenant designation rejected;
  - UPDATE and DELETE denied.
- **Concurrency:** two commits on one Switch; retry of a committed chunk; a correction run racing a backfill.
- **Zero effects:** M-Q13-1 query in CI on a practice copy.
- **Reader readiness:** every classified reader tested with history-shaped fixtures (dates years ago, `created_at` today, CAD and JPY amounts, more than 1,000 rows).
- **Accessibility:** reconciliation and waiting-row tables.
- **Production-shaped:** a 1M-gift practice run on the Practice environment (Q6).

**Spot-check size.** If an error is systematic (≥15% of gifts), a 20-gift random sample shows at least one with about 96% probability. The 5 largest cover high-value risk. Totals and per-designation ties catch amount and fund errors; the sample catches donor and meaning errors. A 60-gift sample would bound random error under 5% at 95% confidence (rule of three, r5 §3). That is more ministry work than v1 needs, because totals already tie to the cent.

**Traceability.**

- New Phase 30 terms: Fixed gift facts, Waiting row, Source mapping statement, Reader readiness check, History spot check.
- Owner terms are reused: retired designation, Recorded outside Asym, Coverage start.
- No conflicting numbers: two years for the roster (owner), 20 + 5 for the spot check, and half the pause.

### 1.22 Other development hazards: material concern, yes

- **A long chain of owner dependencies.** Eight owner requirements (O53–O60). This is not a reason to simplify A, because each closes a real defect. It is the sequencing in §4.
- **An apparent existing units bug.** The missionary supporter list may show cents as dollars (r4, unverified). Reader readiness would catch it.
- **Current receipt and statement prototypes** would include history. That is already covered by Q4 clause 7 (retire the prototype paths) and O60.

---

## 2. Disposition

**Accept with required amendments.** All history, gift by gift, recorded outside Asym, is correct. The amendments close five defects:

1. frozen facts;
2. anonymity;
3. the missionary view promise;
4. refunds reaching balances;
5. reader readiness.

Each makes an owner dependency explicit; none adds a subsystem.

## 3. Corrected decision (to record)

**Q13 — Giving history in a Switch. Option A, amended.** (★ = changed from what was asked.)

1. **All history, gift by gift, recorded outside Asym.**
   - **What comes across:** every gift year the source holds, as individual gifts: cards, checks, cash, bank transfers, stock and other noncash. Never yearly or rolled-up totals.
   - **Coverage start:** the ministry may choose a later start date. It is recorded as the Coverage start, shown wherever history appears, and read by first-gift and lapse logic (C22, O2, O3). Reversals whose original falls before it are left out with it.
   - ★ **One writer:** history enters only through Phase 13's adoption command for every payment type. Nothing is written to the prototype `donations` table. Phase 15's sole-writer rule keeps covering live staff entry (O53).
   - **Markers:** every gift carries Recorded outside Asym (Q4) and its Source Record Binding.
2. ★ **Complete or wait; never commit a guess.**
   - **Fixed gift facts:** a gift commits only when all of these are known, because they cannot change after commit:
     - the legal donor (the person, or a DAF sponsor, employer or platform);
     - the payment type;
     - the Legal Entity and the Site;
     - the currency;
     - the fund or missionary;
     - the date and the amount.
   - **Missing a fact:** the gift becomes a Waiting row with its reason, until the ministry maps it, fixes the file or leaves it out. A gift left out is a Visible exclusion and counts in reconciliation.
   - **No defaults:** no General Fund fallback (the ministry may map a source fund to the General Fund explicitly), no "today", no USD, no default Site or entity.
3. **Amounts, dates and currencies as recorded.**
   - **Amounts** are in the source currency, checked against its decimal places, and never converted. Totals are per currency.
   - **Any valid currency** is accepted for history, including currencies Asym cannot take today.
   - ★ **Dates:** the gift date is the calendar date the old system recorded. It is never shifted through a time zone. Phase 7's "source-recorded date" basis applies, with no per-gift staff attestation (O54).
   - **Refused or flagged dates:** a date after the Switch Boundary is refused, because it belongs to a Legacy Tail Backfill. Ambiguous formats are flagged, never guessed (Q11).
   - **Split gifts** must add up exactly. Fee-cover lines stay fee-cover lines.
4. **Refunds and reversals.**
   - They are separate entries linked to their original by exact source reference. They are never netted, and the original is never edited.
   - They fold into the original's totals under Phase 13's rules.
   - ★ A reversal with no original in the import, dated before its original, or larger than what remains becomes a Waiting row. It is never matched by guesswork.
5. **Funds and missionaries.**
   - **Mapping:** each source fund maps once in the Value-mapping table (Q11), which shows its gift count, total per currency and date range.
   - ★ **Retired designations:** a fund or missionary that no longer exists becomes a retired designation. It is kept for history, never givable, and needs no login for a departed missionary.
   - **Who creates designations:**
     - a person creates retired designations from the mapping step, singly or in a confirmed batch, through the owner's command;
     - new active funds are created in the owner's normal screen;
     - nothing is created automatically (O56).
   - **F10:** this settles designations. Custom fields stay with F10.
   - ★ **Safety:** fund names and gift memos pass Phase 10's safety rules before they are stored. Memos are staff-only. Missionaries and donors see Asym's designation name, never the source label (O57).
6. **Extra details.**
   - ★ **Gift shape (fixed at commit):**
     - **Where the source records it:** DAF sponsor, employer match and workplace-giving payer are applied at commit, using Phase 14's shapes: the payer of record is the legal donor and the person is recognised.
     - **Where it doesn't:** the gift comes across as the source recorded it and is never re-attributed later (Q10).
   - **Recognition records:** soft credits, tributes and matching links come across where the source has them. They are stand-alone records and can also be added later from the retained final manifest.
   - **Noncash** gifts always keep their description. ★ They are a Visible exclusion ("history not yet covered", importable later) until Phases 13 and 15 settle where a noncash value goes (D36).
   - **Non-deductible portions** are kept as staff-visible evidence.
   - ★ **Anonymity fails closed.** Missionaries see a donor's identity only if one of these holds:
     - the source positively marks the gift as not anonymous;
     - the ministry attests the old system had no anonymity option for that group of gifts.

     Otherwise the missionary sees the gift without the donor (O58).

   - **Families Asym cannot take at the Switch** are Visible exclusions, importable later only from the retained final manifest under the same boundary (Q1 clause 1(b)). This is never a reason to commit a gift in the wrong shape.
7. ★ **Legal Entity and Site from signed statements.**
   - **Source mapping statement:** the readiness census records which Legal Entity and which Asym Site each merchant account and each offline source (deposit account or batch type) belongs to, signed by the ministry. A ministry with one entity and one Site signs once.
   - **Resolution:** the server resolves both from these statements (O4, O59). Neither is ever inferred or defaulted.
8. **History never moves money.** History and its refunds create none of the following:
   - Field Account activity or balance;
   - Support Cycle input or assessment;
   - payout, fee, accounting entry or settlement link;
   - receipt, statement line, thank-you or task.

   Field Accounts take pre-switch money only through Phase 21's opening process (O55, O1, O33, Q4).

9. ★ **Reader readiness check.** Before the first real Switch commits history, each surface that shows or sums gifts must:
   - be classified as including, excluding or labelling history;
   - date gifts by gift date, never by when the row was written;
   - sum per currency with correct decimals;
   - have no silent row limits;
   - read one gift store only;
   - keep Recorded outside Asym gifts out of receipts and statements;
   - go through the Phase 3 projection for missionary data.

   This is proven on a Practice copy with history-shaped data (Q6) and is a go/no-go item (O60).

10. **Who sees what.**
    - **Staff:** full history labelled "Imported from {system} · Switch {date}", under Q5 and Phase 12 capabilities.
    - **Donors:** their own history with Q4's neutral sentences and no receipt action (O24).
    - ★ **Missionaries:** imported gifts appear in the same Phase 14/28 views as Asym gifts, with Q7's previous-system label. Those views cover supporters who gave in the last two years. Phase 30 adds no separate history screen.
11. **Reconcile, check, sign off.**
    - **Two levels:** Q1 clause 9's two levels apply.
    - ★ **Per-year breakdown:** count, total and distinct donors per Legal Entity × currency × year, plus totals per designation.
    - ★ **History spot check:** the ministry compares 20 random gifts and the 5 largest with the old system's own screens.
    - **Blocking conditions:** sign-off needs zero Waiting rows and no unexplained variance.
12. **Fixing mistakes.**
    - **Before go-live:** discard and re-run (Q1 clause 10).
    - ★ **After go-live:** a wrong gift or a whole run is corrected by an append-only correction. It is voided with a reason and re-adopted from the corrected source under the same Source Record Binding, with a count and total confirmation and its own capability.
    - **Never:** deletion, or editing history in place (O53).
13. **Privacy and retention.**
    - **Same rules as Asym gifts:** retention, export and erasure. Erasing a person removes their identity but keeps the money facts.
    - **Very old history:** a ministry that doesn't want it sets the Coverage start.
    - **No per-country retention engine.**

**Acceptance criteria**

- **AC1 — single writer.** No history row is written to the prototype `donations` table. Every history gift is written by the Phase 13 adoption command and carries Recorded outside Asym and a Source Record Binding.
- **AC2 — missing facts.** A row missing any fixed gift fact becomes a Waiting row with a reason code and is never committed. No fact comes from a default.
- **AC3 — explicit General Fund.** An unmapped fund never resolves to the General Fund. Explicit mapping to the General Fund is counted on the reconciliation pack.
- **AC4 — amounts and currency.** Amounts round-trip exactly in minor units for exponent 0, 2 and 3 currencies. No conversion occurs. Totals are per currency.
- **AC5 — dates.** A date-only source value is stored as that calendar date, whatever the server or tenant time zone. A date after the boundary is refused.
- **AC6 — reversals.** A reversal links by exact source reference. Orphan, early or over-remainder reversals wait. A reversal in a later year never makes a year negative.
- **AC7 — retired designations.** They accept history and refuse any new gift (checkout, Phase 15 batch, recurring).
- **AC8 — anonymity.** With no positive non-anonymity evidence, a missionary sees the gift without the donor. A missionary never sees memos.
- **AC9 — DAF and match shapes.** A source DAF or match marker produces Phase 14's shape at commit. A gift without one is never re-attributed later.
- **AC10 — no outward effects.** No message, task, receipt plan, statement line, Field Account occurrence, Support Activity, posting intent, fee or settlement link references any history gift or reversal.
- **AC11 — reader readiness.** Every reader on the readiness list passes history-shaped fixture tests before the first real commit.
- **AC12 — sign-off.** Reconciliation ties cent-exact per entity × currency × year. Sign-off is blocked by any Waiting row, unexplained variance or spot-check mismatch.
- **AC13 — idempotency.** Re-running a committed chunk or the same manifest commits nothing new (I1).
- **AC14 — correction.** A correction run voids and re-adopts with an actor, a reason, counts and totals. No row is deleted or updated in place.
- **AC15 — tenant and edit safety.**
  - A history line cannot target another tenant's designation.
  - Its origin or Recorded outside Asym cannot be changed by any role.
- **AC16 — commit time.** The last practice run's history commit and reconciliation fit within half the declared editing pause, or go/no-go blocks.

## 4. Ruthless synthesis

### Before recording (this decision)

- **Amend A as §3.**
- **Correct C6's summary:** only intentional `unknown_offline` may have no legal donor; donor-requested anonymity is a recorded fact on a known donor.
- **Record discrepancies D33–D39.**
- **Flag D38 as time-sensitive:** a live privacy exposure outside Phase 30, with no tracker action.

### Must be captured in the spec and design

- invariants I1–I9;
- AC1–AC16;
- the waiting-reason list (E1–E16);
- the reader readiness list format;
- the reconciliation pack contents;
- the spot-check screen;
- the correction-run contract.

### Owner requirements, in dependency order

1. **O20/D24 and D38 (urgent, outside Phase 30):** the hosted RLS check, and the `mySupporters` exposure.
2. **O53 (Phase 13 with Phase 15), O54 (Phase 7), O55 (Phases 21 and 20):** the adoption command, dating basis and no-money-effects rules. Nothing can commit without these.
3. **O56 (Phases 13/14):** retired designations without accounts.
4. **O57 (Phases 10/13):** the label and memo safety firewall.
5. **O58 (Phases 14/28):** anonymity fails closed, plus import shapes (extends O21 to matching, DAF, anonymity, non-deductible portions and noncash).
6. **O59 (Phases 2/24/13; resolves D14 for history):** Site and entity resolution from Source mapping statements.
7. **D36 ruling (Phases 13/15):** where noncash values go. Until then noncash history is a Visible exclusion.
8. **O60 (each gift-reader owner):** reader readiness.
9. **Then practice runs at production shape (Q6), then the first real Switch.**

### Implementation safeguards required

- composite tenant FKs;
- minor units with an exponent check;
- `date` gift dates;
- no defaults on fixed facts;
- no UPDATE or DELETE grants;
- unique source identity;
- one active commit per Switch;
- the owner no-write check shared with commit (O28);
- history-origin handling in every event consumer;
- the zero-effects query after every run;
- logs without row content.

### Monitors

| ID      | Signal                                                                                                                                              | Threshold                                   | Owner                         | Response                                                   |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------- | ---------------------------------------------------------- |
| M-Q13-1 | Outward effects referencing history (messages, tasks, receipt plans, statement lines, Field Account occurrences, posting intents, settlement links) | 0                                           | Phase 30 with each owner      | Halt the consumer; owner correction; incident              |
| M-Q13-2 | Unexplained variance at sign-off                                                                                                                    | 0 (cent-exact per entity × currency × year) | Switch lead with Phase 30     | Block sign-off; find the cause                             |
| M-Q13-3 | Spot-check mismatches                                                                                                                               | 0                                           | Switch lead                   | Stop; find the systematic cause; re-run                    |
| M-Q13-4 | Waiting rows at the final practice run                                                                                                              | > 2% of gift rows                           | Phase 30 with the Switch lead | Go/no-go review of causes before the real run              |
| M-Q13-5 | History commit plus reconciliation time in the last practice run                                                                                    | > 50% of the declared editing pause         | Phase 30                      | Block go/no-go, or lengthen the pause by ministry decision |
| M-Q13-6 | Gifts corrected after go-live, first 90 days                                                                                                        | > 0.5% of imported gifts                    | Phase 30                      | Review mapping defaults and waiting reasons                |
| M-Q13-7 | Missionary requests to see history older than the roster window                                                                                     | Learning signal                             | Phase 28                      | Input to a future Phase 28 decision; no Phase 30 change    |

## 5. Owner requirements (proposed O53–O60)

- **O53 (Phase 13, with Phase 15):** one adoption command (D.6) for every payment type, with these rules:
  - **Commit rules:**
    - it commits a gift only when every fixed gift fact is present;
    - there is no General Fund fallback for adoption;
    - any ISO currency with a valid exponent is accepted, without a transactability check;
    - retired designations are accepted as targets.
  - **Identity and reversals:**
    - source-qualified identity is unique (O16);
    - reversals link by exact reference, dated on or after the original and not exceeding what remains;
    - historical refunded, returned and disputed states are defined.
  - **Effects:**
    - no settlement or payout linkage;
    - events carry the history origin, and every consumer handles it (extends O1/O33).
  - **Corrections:** an append-only correction run (void plus re-adopt) with actor, reason, counts and totals.
  - **Phase 15:** scope its sole-writer guard to live staff entry and name the adoption command.
- **O54 (Phase 7):** a "source-recorded date" dating basis for gifts carrying Recorded outside Asym, with no per-gift prior-year attestation.
- **O55 (Phases 21 and 20):**
  - **Phase 21:** adopted history and its reversals are predecessor facts, dispositioned only through D17 opening manifests. They are never provisional Missionary Support Activity, Support Cycle input, assessment input or adverse corrections under FAO:206-208.
  - **Phase 20:** names adopted history as previous-owner interval, with no posting intent, fee or cost policy.
- **O56 (Phases 13/14):** retired, end-dated designations for departed missionaries and closed funds, which need no user account and are never givable. A person can create them from Phase 30's mapping step, in a confirmed batch, through the owner command.
- **O57 (Phases 10/13):** legacy fund labels and gift memos pass the Phase 10 alias firewall before the snapshot freezes. Memos are staff-only. Missionary and donor views show the Asym designation name.
- **O58 (Phases 14/28):**
  - **Anonymity:** fails closed for history. Positive evidence is a per-gift source flag, or a signed ministry attestation that the source had no anonymity option for that population.
  - **Import shapes:** for DAF, matching, workplace giving, anonymity and non-deductible portions (extends O21).
- **O59 (Phases 2/24 with 7/13):** the Site and Legal Entity of a history gift resolve from the ministry's signed Source mapping statement, never from a default. This resolves D14 and O4 for history.
- **O60 (each owner of a surface that reads gifts):** the reader readiness list, under clause 9.
  - **Covers:** admin dashboards, contribution lists, donor portal, missionary roster and analytics, CRM reports, GraphQL, exports, receipts and statements.
  - **Readiness rules:** each reader is classified, keyed on gift date, sums per currency with correct decimals, has no silent row limits, reads one gift store and goes through the projection.
  - **Proof:** history-shaped fixture tests.

## 6. Discrepancies (proposed D33–D39)

- **D33.** Phase 15 makes batch commit the sole offline-money writer (`phase-15:72`, `:836`; `contribution-operations.md:418-433`). Phase 13 D.6 adopts every tender (`phase-13:1023-1039`, `:1802`).
- **D34.** Phase 13 resolves an unspecified target to the General Fund "at write" (`:1745-1746`, `:1935`). Q11 clause 3 and Q13 clause 2 block rows with missing required values.
- **D35.** Phase 7 A14 has no dating basis for an adopted historical check (`:246`), and A15 requires a per-gift prior-year attestation (`:248`).
- **D36.** Phase 13 says a noncash line's internal valuation is its `amount_minor` (`:1815`). Phase 15 says in-kind posts `recognized_value = 0` across every channel, including import (`:922-927`).
- **D37.** C6's summary "anonymous = null legal donor" conflicts with `phase-13:225`, `contribution-operations.md:368-384` and `phase-14:520`. It is corrected in C6.
- **D38 (time-sensitive; current code).** GraphQL `mySupporters` returns full donor profiles, including email, of every gift to a missionary through the service-role client. It applies no anonymity or Phase 28 H.5 floor (`packages/graphql/handler.ts:372-404`, `:842-854`; `packages/api/src/donations/select.ts:9-10`; mounted at `apps/donor/app/api/graphql/route.ts`). Flagged; no tracker action.
- **D39 (current code).** Many gift readers have problems (r4 §3, §5, §7, §10):
  - they key on `created_at`;
  - they read stored totals that nothing updates;
  - they divide by 100 regardless of currency;
  - they cap at the API's 1,000-row default;
  - they offer receipts for any owned gift.

  These are covered by O60. They are not a Phase 30 decision.

## 7. Rejected alternatives

| Alternative                                               | Why rejected                                                                                                     |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| B. Older years as yearly totals                           | Fabricated rows with no source identity; loses refund linkage and first-gift truth; no vendor recommends it      |
| C. Card gifts only                                        | Visibly incomplete supporter histories; contradicts Q1's kit                                                     |
| General Fund fallback for unmapped funds                  | Silent misdesignation at scale                                                                                   |
| Automatic fund creation from source labels                | Duplicate funds (Little Green Light and Givebutter experience, r2) and restricted names copied into designations |
| Converting currencies at import                           | Destroys the native fact; owners forbid cross-currency sums                                                      |
| Netting refunds into originals                            | Breaks the tie to source and audit                                                                               |
| Writing history to the prototype `donations` table        | No provenance or uniqueness; defaults invent facts; RLS exposure                                                 |
| Committing gifts in the wrong shape and fixing them later | The legal donor and tender are frozen at commit                                                                  |
| A separate Phase 30 missionary history screen             | Bypasses the owner projection and privacy floor                                                                  |
| A per-jurisdiction retention engine                       | Speculative; the Coverage start and owner erasure suffice                                                        |
| A larger statistical sample (60+)                         | Totals already tie to the cent; 20 + 5 catches systematic meaning errors at a fraction of the ministry's time    |
