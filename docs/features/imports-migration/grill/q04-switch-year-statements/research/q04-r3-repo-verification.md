# Q04-R3: Repo verification of the Q4 decision and the "single fact" simplification

Read-only verification, develop `629cb71dc`, 2026-11-02. It ratifies nothing. r1 was re-checked and holds except where noted.

Labels (`docs/ai/document-authority.md:42-58`): **ratified** (accepted PRD/owner decision), **published** (GitHub issue, or an `openspec/contracts` clause referenced only by an active change, which is proposed per `openspec/contracts/README.md`), **integrated** (code on develop; no implementation proof), **inference**, **unverified**.

Abbreviations: P7, P13, P15, P18M, P19, P25F, SO and SOΔ as in r1. CO = `openspec/contracts/contribution-operations.md`. DL = `grill/decision-log.md`.

## 1. Phase 7 eligibility mechanics

- **Eligibility is not a stored fact.** B1 is a pure evaluator over "effective state + method + policy" (P7:262). A5 enforces it "at both issuance and read; every read/download path re-checks" (P7:219). The effective state is the last-writer-wins correction fold (A2, P7:213). B1 has **no origin input**. (ratified)
- **Created atomically with the contribution:**
  - the dating fact (P7:246, :306);
  - the Canadian plan fact, created only for an "eligible cash occurrence … in the same transaction as source intake/posting", with `UPDATE`/`DELETE` forbidden (P7:307);
  - the Phase 15 receipt intent "in the same transaction that writes the money rows" (P15:1163-1185).

  (ratified)

- **Existing exclusion concepts to map onto:**
  - P13 D.6: "a separate Phase 7 import fact records that a pre-Asym receipt exists **or that no Asym receipt is permitted**" (P13:1031-1032; ratified). The second branch is the simplified fact.
  - Phase 7 "receipt eligibility reason codes" (P7:330) and the "source-owned exclusion reason authority" (P7:314). (ratified)
  - SO:431-433 excludes "otherwise covered facts". (published)
  - Phase 7 still never defines the import fact (D4 confirmed).
- **Mutability: this BREAKS the single fact unless it is made immutable.** CO:130-135 gives `unknown_offline` a not-receiptable reason, then lets a "governed Phase 13 source correction" lead Phase 7 to "append a successor facts version" (published). That is precedent for a correction flipping an exclusion. Because B1 re-evaluates the mutable fold, an imported gift could become eligible unless the fact is an immutable input. Supporting owner text:
  - "A source event marked historical cannot become prospective by changing a displayed timestamp" (`roadmap.md:4395`; published).
  - "Historic-giving imports never mint receipts" (P14:1869; ratified).
- **E3 needs amendment.** "manual/imported/historical gifts without a staged-gift record can be receipted" (P7:339; ratified). Published **#577** goes further:
  - AC: "Canonical source authorization works for manual/imported/historical contributions";
  - positive test: an imported contribution "reaches the canonical Phase 7 facts seam and Phase 18 request exactly once".

  Both directly conflict. P13 story 170 also leaves the door open: "any later document action requires the current Phase 7 authority" (P13:538).

## 2. US annual acknowledgment population

- `annual@1`: "Phase 7 owns eligibility/subject/facts; Phase 19 freezes population" (P18M:132; ratified).
- "Phase 7 MUST remain the sole authority for … eligibility, facts … and official coverage." Phase 19 controls only participation and "MUST NOT … select gift lines, or edit totals". "No tenant setting, role, note, or manual choice may weaken source-owned eligibility" (SO:135-137, :153-156, :170-172; published). No force-include (P19:112).
- **A Phase 7 exclusion is sufficient.** No empty statements are manufactured (P25F:63). (inference)

## 3. Late Fact Obligation trigger scope

- SO:328-331 (published): "A fact posted after Start MUST create one deduplicated late-fact obligation whose source and purpose contracts derive no action, additional nonoverlapping coverage, or a formal successor/correction/replacement. Its permanent semantic slot MUST derive from tenant/environment, primary run, Statement Subject, source-fact identity, and purpose contract."
- P19:977-978 (ratified): "If a fact arrives after Start … one deduplicated Late Fact Obligation resolves through owner rules to: no document action; …"
- SOΔ:140-143 (published): "an import retry or concurrent source delivery" replays the same obligation, so imports do reach the lane.

**Finding: the trigger is any posted fact, not only in-population facts.** Exclusion makes the result "no document action". It does not stop an obligation being created. Obligations are counted ("late-fact and supplemental obligation age", P19:1092) and have a runbook ("late-fact backlog", P19:1098).

- If system-derived "no action" obligations are acceptable, exclusion is enough.
- If part 4 means "no obligation at all", Phase 19 needs an owner sentence.

## 4. Canadian pack activation semantics

- **"Prospective" means intake/posting time, not gift date:**
  - plan facts arise "in the same transaction as source intake/posting" (P7:307);
  - "Later eligible source events enter the ordinary public seam prospectively" (#945; published);
  - "Phase 15 batch and quick-entry commit, **and every other gift-intake path**, MUST consume that Phase 7-frozen plan" (SO:422-423; published).

  Nothing keys plan facts to `gift_date`.

- **Imports after activation get permanent plan facts.** Imports are "already-succeeded" (P13:1029-1030), so an import or backfill posted after activation receives an immutable plan fact unless Phase 7 excludes it in that transaction. (inference)
- **Prior-year gifts received by Asym.** Asym can record a check after activation with a prior-year `gift_date`, because staff-attested December dating is allowed (P7:66-71). It gets a plan fact, so Asym receipts it. That matches "receiving system". Cumulative coverage for a tax year the epoch only partly spans is not addressed. (unverified)
- **Numbering history:**
  - The display is fixed as "`R-` plus an unbounded positive `BIGINT` … never resets" (P18M:199).
  - Unprovable continuity "routes to a qualified specialist" (P18M:204).
  - #944 forbids "configurable prefixes". Unknown external history goes to "specialist review rather than an importer or guessed number".
  - The setup task "Confirm history and activation" exists (P18M:465).

  **Part 8's "distinct prefix" conflicts with published #944.** Phase 18 already covers prior-system history.

## 5. Phase 25 donor portal (target contract; ratified)

- **Imported records:** "Qualified online/offline/imported … records remain accessible under current rights and honest coverage … imported does not always mean offline or One-time" (P25F:25). "known incomplete external coverage" is a state (P25F:33).
- **No foreign documents:** "No … foreign legacy PDF conversion/backfill/import" (P25F:69); "Financial history grants no foreign document import" (P25F:195).
- **"This year so far"** sums "current effective source-posted monetary giving" by P7 gift date (P25F:127-129), so imported gifts count. "Independently valid limited coverage requires an approved visible label" (P25F:131).
- **No receipt column in the target.** History rows carry date, purpose, amount, outcome and a detail link, and "A gift does not imply an available receipt" (P25F:21). Detail shows "actual current documents" (P25F:23). A per-gift label belongs in detail.
- **Patterns to reuse:**
  - DAF: "**For your information — not a tax receipt** … Use your DAF provider for tax records" (P25F:165);
  - QCD: "these documents may show different totals from your giving summary" (P25F:191).

  No wording exists for imported gifts.

- **Current prototype (integrated):**
  - every "Succeeded" row shows a **Receipt** button (`apps/donor/app/(dashboard)/donor-dashboard/history/columns.tsx:180-191`);
  - it renders a "Donation Receipt" for any owned `donations` row with no origin or status check (`packages/api/src/donor-portal/receipts.ts:22-33`).

  This is a D17 removal target.

## 6. Phase 15 offline gifts

- **Duplicates:** a "non-blocking duplicate warning on a re-entered `check_number` (within the batch and a bounded recent cross-batch lookback) … never auto-blocks" (P15:260, :2559; ratified). Whether the lookback sees imported contributions is unverified.
- **Sole writer:** "no API path other than the batch commit service writes offline money" (P15:836); "sole writer of staff-entered offline money" (CO:429-433). Which path writes historical offline gifts is still open (F13).
  - If imports use batch commit, Mod 2 sends a plan-admitted receipt "immediately on post" (P15:1161-1172).
  - The fact must therefore precede plan admission.
- **Pre-switch postmark, post-switch entry:**
  - The US basis is postmark or mailing attestation; received is the fallback (P7:246; P19:957-968).
  - SiteStacker staff CRM editing is "Off at boundary" (DL:33), so such a check is recorded only in Asym, and Asym documents it.
  - Risk: a check keyed in the old system before the boundary and again in Asym produces two receipts. Only the non-blocking warning guards against this.
  - The template-path generic checklist (DL:74, Q3 4(e)) **omits staff gift entry**.

## 7. Current code on develop (integrated, prototype)

- **(a) Receipt tables:**
  - `gift_receipt_records` (`supabase/migrations/20260704120000_gift_receipt_records.sql:14-40`) has RLS enabled, **no policies, no FORCE**. It revokes everything from anon and authenticated and grants ALL to service_role.
  - `contribution_receipt_snapshots` and `contribution_receipt_delivery_policies` have the same posture (`20260611140000_contribution_receipt_delivery.sql:20-40`).
  - Its writer `recordGiftReceipt` (`packages/api/src/giving/receipt-record.ts:220`) has **no production caller**.
  - There are no dating, plan, statement-run or `already_receipted` objects.
- **(b) Statements route:**
  - `apps/donor/app/api/donor/statements/[year]/route.ts:1` points to `packages/api/src/donor-portal/statements.ts:30-91`.
  - Any `donor`-role user can call it for their own donor row (`route-helpers.ts:29-30`). It reads with the service-role client.
  - It reads `donations` by **UTC** year and settled status with **no origin filter** (`service.ts:279-301`), so imported rows in `donations` would appear.
  - Removal before production: P19:172; #1031.
- **(c) Automatic sends: none.**
  - The only trigger on `donations` is currency normalization (`20261003051630_currency_foundation.sql:221-222`).
  - None of the Inngest functions in `packages/api/src/workflows/functions/` sends a receipt.
  - Receipt emails are staff-initiated (resend: `admin/contributions/staged-gifts.ts:288`; correction: `contribution-operations/operations.ts:982-1010`) and need a `staged_gifts` row.
- **(d) Import writers: none.** `donations` is inserted only by `begin_donation_saga` (`packages/api/src/donate/begin-gift-intake.ts:65`) and seed data. Phase 13 targets `DROP TABLE donations` (P13:2257).

## 8. Q1 closure and decommission

- **Clause 2:** "**Switch closed** = every legacy executor proved stopped, formally cut over or ended, and the Legacy Recurring Tail closed. Until closure the ministry keeps SiteStacker licensed" (DL:28; ratified). `CONTEXT.md:24` adds "and decommission is recorded"; DL:28 does not.
- **Clause 7, the natural attach point:** "Kept on until each cohort is handed over or ended: … **receipts for legacy charges** … Exactly one system is responsible for each donor-facing duty per cohort, and SiteStacker alone receipts what it charges. States display as 'ministry attested', are re-confirmed at every backfill" (DL:33).
- **Clause 12:** "A ministry-attested decommission checklist covers SiteStacker access reduction, credential rotation and the SiteStacker data deletion or retention decision. **Tail closure and decommission sign-off are blocked while any item is open**" (DL:38).
- **What closure gates:**
  - "Phase 30 runs no backfill after closure" (DL:32);
  - decommission;
  - the licence.

  It has no tie to a later Switch (DL:82) or retention (F11 open).

- **Implications:**
  - Part 2 extends the licence and delays data deletion by up to two tax seasons.
  - A new clause 12 item, as written, would also block tail closure.
  - Clause 6's "unless F5 and Phase 7 later allow it" (DL:32) is closed by a "forever" fact.

## 9. Reversals and corrections of imported or tail gifts

- **Reversals bind to the original.** Refunds and corrections append to the same contribution (A1, P7:211). Backfilled reversals link "to the imported original by an exact scoped reference" (DL:32). A per-occurrence fact covers them, provided they bind. (inference)
- **Owner text:** "Asym never re-issues or retracts a receipt a legacy system sent" (P13:2231; counsel item). No owner text bars a correction from changing an imported gift's receipt status (see the CO:130-135 precedent).
- **BREAK: tail gifts with no old-system issuer.** Q1 sources some tail gifts from "the ministry's own PayPal or processor reports **for executors SiteStacker does not record**" (DL:32). PayPal tail gifts may land "with no gift record" (q01-r2:340; q01-r3:250; unverified). For that cohort "documented outside Asym" is false and the processor issues nothing. Template-path processors share the risk (Q3 clause 3).

## 10. GitHub issues (2026-11-02)

- Searches for imported or migrated receipts, `already_receipted`, pre-Asym, switch or cutover year and previous system found **no issue on receipting imported gifts or switch-year statements**.
- Related open issues:
  - **#577** (conflicts);
  - **#711** ("no observation or import performs a charge, receipt…");
  - **#944** (no configurable prefix);
  - **#945** (activation is prospective with no backfill or import);
  - **#1031** (retires the live text statement route);
  - **#765** (Phase 15 receipt intent in the post transaction).

## Implications for the simplified rule

**What works.**

- The fact maps onto P13 D.6's existing "no Asym receipt is permitted" branch as a Phase 7 reason code.
- Phase 19 cannot override Phase 7 (SO:135-172), so one exclusion covers the US annual, Canadian receipts and per-gift acknowledgments.
- Receiving-system issuance matches "SiteStacker alone receipts what it charges" (DL:33) and the boundary's "Phase 30 classification only" scope (DL:29). It removes D28 from issuance.
- Provenance-only receipt evidence matches P13 D.6 and DL:32.
- No new machinery beyond the import fact P13 already assumes.

**What breaks or needs care.**

1. **Tail cohorts that no old system records** (§9). Record a tax-document issuer per cohort (DL:33 grain). Go/no-go decides when none exists: either the ministry attests it will issue itself, or the cohort is handed over or ended first.
2. **Correction flip** (§1). The fact must be immutable, written atomically, and an input to B1, B5 and the plan resolver.
3. **Canadian intake-time prospectivity** (§4). Without the fact at intake, post-activation imports get permanent plan facts.
4. **Part 8 prefix** conflicts with #944. Drop it.
5. **Define the receiving system** as "the system that recorded or charged the gift", not physical arrival or `gift_date`.
6. **Readiness signal lost.** Part 3's "not yet receipted/unknown" signal disappears. Replace it with a per-Switch or per-cohort attestation that the old system will issue its switch-year and tail-year documents, especially Canadian cumulative receipts.

**Owner sentences required.**

- **Phase 7 (amend E3; define the P13 D.6 fact).** "Every occurrence committed through a Phase 30 import or Legacy Tail Backfill carries one immutable fact, _documented outside Asym_, written in the contribution's transaction. The eligibility evaluator, inclusion engine and Canadian plan resolver consume it. It yields a not-receiptable reason, creates no plan fact and excludes the occurrence from every official purpose. No correction, merge, re-dating or reversal removes it. Source receipt evidence is provenance only." Also amend **#577** AC and its positive test.
- **Phase 19.** "A late fact on an occurrence documented outside Asym derives no document action" and, optionally, "creates no staff-visible obligation."
- **Phase 25.** Detail-view label on the DAF pattern ("Your tax receipt for this gift comes from {source system}") and a QCD-style "This year so far" explanation.
- **Phase 30 / Q1.**
  - Add a "Tax documents issued by" duty per cohort, with an end condition.
  - Add a decommission-only checklist item that does not block tail closure.
  - Add "staff gift entry off" to the Q3 generic checklist.
  - Narrow F5 to non-tax messages.
- **Phase 15** (only if historical offline gifts use batch commit). Commit carries the fact.
