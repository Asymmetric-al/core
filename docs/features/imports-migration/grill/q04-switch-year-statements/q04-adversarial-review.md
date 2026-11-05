# Q4 adversarial review — switch-year tax documents

Decision under review: Option A as asked, with eight parts (`q04-decision-as-asked.md`), chosen by the founder on 2026-11-02 with the instruction "make sure it's not over engineered or overly complex, but will be fully functional."

Evidence used:

- Research: `research/q04-r1` (Asym owner contracts), `q04-r2` (IRS/CRA rules and vendor practice), `q04-r3` (repo verification), `q04-r4` (external verification).
- Independent reviews: `review/q04-v1-domain-data-review.md` (domain, data and safety) and `review/q04-v2-ux-ops-review.md` (users, operations, simplicity and proof).
- Lead spot-checks (2026-11-02):
  - Phase 7 E3 (`phase-07…md:339`);
  - Phase 13 D.6 (`phase-13…md:1029-1034`);
  - Phase 18 `:24`, `:132`, `:204`, `:348`;
  - `statement-operations.md:326-336`;
  - `contribution-operations.md:128-136`;
  - Phase 25 `financial.md:165`, `:191`;
  - issues #944, #945, #1031 and #577;
  - prototype code at `apps/donor/app/(dashboard)/donor-dashboard/history/columns.tsx:180-191`, `packages/api/src/donor-portal/receipts.ts:22-33` and `packages/api/src/donor-portal/service.ts:279-301`;
  - SiteStacker year-end statement wording (training article 151000122359);
  - M+R Benchmarks 2026.

Labels: **verified** (primary source read), **repo** (file:line read), **inference**, **assumption**, **judgment**.

## 1. Category review

### 1.1 Problem validity, necessity and alternatives — material concern: yes (narrows the answer)

**The problem is real.** No owner document assigns switch-year tax documents (q04-r1 §7; repo). IRS rules require a written acknowledgment for each gift of $250 or more, including a goods-or-services statement. CRA permits one official receipt per gift; a replacement must cancel the original (Reg. 3501(4)-(5); verified). A ministry switching mid-year will have donors whose gifts sit in two systems. Doing nothing leaves Asym's default behaviour, which is unsafe:

- Phase 7 E3 says imported gifts "can be receipted" (`phase-07…md:339`; repo).
- #577 has a positive test that sends an imported contribution to a document request.

**Strongest alternative: B**, one combined US statement from Asym. B is the industry default: Planning Center, Breeze and Givebutter import without receipts and put everything on statements (q04-r2 §3; verified-vendor-doc). A still wins:

- **Canada needs A's rule regardless.** One issuer per gift; Asym's activation is forward-only with "no historical sweep" (P18M:348; repo).
- **The goods-or-services statement.** Asym's US annual acknowledgment states each gift's goods-or-services case (P18M:132; repo). Imported gifts rarely carry that fact, and a wrong certification can cost a donor the deduction (_Durden_, T.C. Memo 2012-140; secondary).
- **Owner rules.** B needs C7 and Phase 7/18/19 amendments; A needs only the narrower amendments listed below.
- **B stays reachable.** The origin fact A records keeps B cheap to add later if donor confusion proves real (monitor M1).

| Concern                                                          | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P1. Part 1's US "may skip the old year-end statement" branch** | **What goes wrong:** a ministry skips SiteStacker's year-end statement, believing its per-gift emails suffice; donors lose deductions for gifts of $250 or more. **Why it matters:** SiteStacker's year-end letter "will serve as your receipt for tax purposes" and carries the no-goods-or-services certification (training article 151000122359; verified-vendor-doc). No article shows the per-gift email carrying it, or that recurring charges send one (q04-r4 §1). **Severity:** high. **Likelihood:** medium. **Effect:** narrows the answer; delete the branch. **Fix:** the ministry issues its usual year-end documents for gifts recorded outside Asym; Asym does not judge whether per-gift receipts suffice. **Spec language:** clause 1 of the corrected decision. |
| **P2. "Received or charged" is undefined**                       | **What goes wrong:** some gifts land on both systems' documents, others on neither. A December-postmarked check entered in Asym in January, a processor-only tail gift and a check keyed into both systems all fall in the gap. **Severity:** high. **Likelihood:** medium. **Evidence:** Phase 7 dates gifts by postmark or delivery basis (`phase-07…md:129`, `:246`; repo); Q1 clause 6 has processor-report-only tail gifts (decision log; repo). **Effect:** changes the answer. **Fix:** the issuer is fixed at intake by where the gift was first recorded, never by its date. **Spec language:** clause 1.                                                                                                                                                                 |

### 1.2 Brittleness — material concern: yes

| Concern                                                                   | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **B1. "The old system issues" assumes it can**                            | **What goes wrong:** a ministry cannot produce its share of documents. **Evidence:** SiteStacker's Statements report is an add-on that SiteStacker support must enable. Its training site documents no Canadian official receipts (q04-r4 §1; verified-vendor-doc). Template-path vendors may lapse at the switch. SiteStacker's help centre already returns HTTP 402 (decision log g3; verified). **Severity:** high. **Likelihood:** medium. **Effect:** changes the answer: name the _issuer per population_ (old system, another receipting tool or the ministry), not "the old system". **Fix:** census and go/no-go item, plus "issued or generated and kept ready" at decommission, so documents can be produced before a vendor disappears. **Spec language:** clauses 3(a) and 4. |
| **B2. "A 1 January switch avoids the split" is false when a tail exists** | Legacy recurring gifts charged after 1 January split the new year anyway (q04-r4 §4; inference). **Severity:** low. **Likelihood:** high. **Effect:** changes the guidance only. **Fix:** guidance says to prefer an early-year boundary and close the tail by 31 December. The scheduling step states which years will have documents from both systems. **Spec language:** clause 6.                                                                                                                                                                                                                                                                                                                                                                                                     |

### 1.3 Technical debt — material concern: yes

| Concern                                       | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **T1. Prototype receipt and statement paths** | **Current behaviour (repo):** the portal shows a "Receipt" download on every succeeded row. The download is a text "Donation Receipt" whose ID is the donation ID (`receipts.ts:22-33`). The text statement selects `donations` by UTC year with no origin filter (`service.ts:279-301`). Any imported row reaching `donations` would get a fake receipt and appear on the statement. **Intended:** Phase 25 forbids fake receipts and legacy document import (`financial.md:195`), and #1031 retires the text statement (open). **Severity:** high if imports ever reach `donations`. **Likelihood:** low today, since no import writes `donations` (q04-r3 §7). **Fix:** a sequencing gate. **Spec language:** clause 7. |
| **T2. A four-value status nothing consumes**  | Part 3 creates per-gift states that drive no Asym behaviour, mostly "unknown" (q04-r4 §2). It is a model kept alive for a checklist. **Severity:** medium. **Fix:** delete it; keep one fact plus optional evidence. **Spec language:** clause 2.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **T3. A third definition of "Switch closed"** | `CONTEXT.md:24` adds "decommission is recorded", which neither Q1 clause 2 nor ADR-IM-001 says. Part 2 would add a third variant. **Severity:** medium (traceability). **Fix:** align the glossary with Q1 clause 2; put tax items on decommission only. **Spec language:** clause 4, plus the glossary edit.                                                                                                                                                                                                                                                                                                                                                                                                              |

### 1.4 Edge cases — material concern: yes

| #   | Case                                                                                             | Outcome under the corrected decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | **Processor-only tail cohort** (e.g. PayPal or gateway schedules the old system does not record) | Recorded outside Asym. The cohort's tax-document disposition names who documents it, normally whoever did before the switch, and go/no-go blocks if nobody does. The ministry can end it early by handing the cohort over through Phase 16. _Rejected alternative:_ v1's carve-out making Asym the issuer. It makes Phase 30 money receiptable on some paths, adds a per-cohort issuer flag to backfill facts and risks double receipts if the ministry's prior manual process continues (judgment). |
| E2  | **Check postmarked before the switch but first recorded in Asym**                                | Asym's gift, receiptable under Phase 7 with its postmark date (`phase-07…md:129`; repo). It may fall in the prior tax year, where Asym issues one document alongside the old system's.                                                                                                                                                                                                                                                                                                               |
| E3  | **Same check keyed into both systems around the boundary**                                       | Prevention: staff gift entry in the old system is Off at the boundary, for every source profile. Detection: the import flags a possible duplicate of an Asym-recorded gift, and the row waits for a staff decision. A confirmed duplicate is excluded with a reason, and staff are prompted to check whether both systems issued a receipt.                                                                                                                                                          |
| E4  | **Refund, chargeback or correction of an imported gift**                                         | Inherits Recorded outside Asym (Q1 clause 6 links it by exact reference). Staff see "Receipt corrections for this gift belong to {previous system}". In Canada the ministry cancels or replaces the old receipt there.                                                                                                                                                                                                                                                                               |
| E5  | **Multi-Legal-Entity tenant** (US and Canadian entities)                                         | Each gift has one Legal Entity (Q1 clause 1). The census, issuer disposition and Asym-setup check run per issuing Legal Entity.                                                                                                                                                                                                                                                                                                                                                                      |
| E6  | **Canadian ministry whose old system cannot issue CRA receipts**                                 | The census records the actual receipting tool and its last serial number. That tool stays the issuer for gifts recorded outside Asym. The serial number feeds #944 continuity (P18M:204).                                                                                                                                                                                                                                                                                                            |
| E7  | **Tail spans two tax years**                                                                     | The disposition is re-confirmed at every backfill (Q1 clause 7), so a second-year arrangement is confirmed when the tail crosses 31 December. Guidance recommends closing by then.                                                                                                                                                                                                                                                                                                                   |
| E8  | **Asym setup not active at go-live**                                                             | Phase 18 activation is forward-only (P18M:24, `:348`). Gifts Asym records before activation would never be documented. Go/no-go requires each issuing Legal Entity's setup to be active before Asym records its first gift.                                                                                                                                                                                                                                                                          |
| E9  | **Donor-advised fund, CanadaHelps, fiscal-sponsor and noncash gifts**                            | Never receipted by Asym when recorded outside Asym. For Asym-recorded gifts, Phase 14/15 rules apply unchanged.                                                                                                                                                                                                                                                                                                                                                                                      |
| E10 | **Tail arrangement reclassified as ongoing external** (Q1 clause 6)                              | Its later facts enter through a Phase 13/15 owner intake, so they are first recorded in Asym and Asym documents them. The disposition's end condition is the reclassification date, so exactly one issuer covers each gift.                                                                                                                                                                                                                                                                          |

**Severity:** E1, E3 and E8 high; the others medium. **Effect:** changes the answer; clauses 1–3 cover them.

### 1.5 Footguns — material concern: yes

| Concern                                                            | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **F1. A correction turns an imported gift into a receiptable one** | Phase 7 re-evaluates eligibility from the current corrected facts (`phase-07…md:213`, `:219`, `:262`; repo). A published precedent lets a not-receiptable gift become receiptable after a governed correction (`contribution-operations.md:130-135`; repo). Without a permanent origin input, a staff correction could mint a second official receipt; CRA penalties are 5% for incorrect and 125% for false receipts (q04-r2 §2; verified). **Severity:** critical. **Likelihood:** medium. **Fix:** the fact is a Phase 7 eligibility input that no correction, re-dating, merge or reversal removes. **Spec language:** clause 2. |
| **F2. Owner text that receipts imports by default**                | Phase 7 E3 and #577's imported-contribution test mean a builder following owner text would wire receipts for imports. **Severity:** high. **Fix:** owner amendments O22 (Phase 7 and #577).                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **F3. Staff keep entering gifts in the old system**                | Q3's generic checklist omits gift entry. **Severity:** medium. **Fix:** clause 3(c).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **F4. Holding a licence open ties up the switch**                  | An attestation of "licence kept" stays open for months and blocks tail closure under Q1 clause 12. **Severity:** medium. **Fix:** clause 4 (decommission only; issuance, not licence).                                                                                                                                                                                                                                                                                                                                                                                                                                               |

### 1.6 Tenant safety — material concern: no

**Checked:**

- The fact belongs to one tenant's gift and is written by that tenant's owner import command.
- Issuers, census and dispositions are per Tenant × Legal Entity.
- Receipt evidence is staff-only, and missionary views exclude it.
- Imports are single-tenant (Q1 clause 1: one tenant per installation).
- No cache, report or automation in the decision crosses tenants.

The only requirement is the standard one: tenant and actor come from server context (folded into clause 2 and AC2).

### 1.7 Database, RLS and authorization safety — material concern: yes (requirement, not a defect in A)

| Concern                                                         | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DB1. The fact must be impossible to forge, remove or bypass** | **What goes wrong:** a direct write, a policy gap or an "allowed update" removes or never writes the fact, and a receipt plan follows. **Current:** no owner tables exist yet. `gift_receipt_records` has row security on, no policies and a writer with no production caller (`20260704120000_gift_receipt_records.sql:14-40`; q04-r3 §7; repo). **Intended:** Phase 13 D.6 names the fact but defines no columns (D-4 in r03). **Best path:** one row per gift, written in the same transaction as the money fact, only by the owner import command. Append-only: no UPDATE or DELETE grant to `authenticated` or `anon`; forced row security; staff SELECT within their own tenant only. Tenant, actor and source are derived server-side from the Switch and Source Record Binding, never from caller input. Phase 7 plan creation and issuance refuse a gift that carries the fact, enforced at the single Phase 7 boundary and by a database constraint, so no allowed update can turn such a gift into a receiptable one. **Severity:** critical. **Likelihood:** medium without the requirement. **Spec language:** clause 2; AC1–AC3, AC11. |

### 1.8 Overengineering — material concern: yes

Delete or shrink these parts of the asked version:

| Part                                                     | Problem                                                                                                   | Replacement                                                                     |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Part 3                                                   | Four statuses; a per-gift checklist could hold millions of items for a large tenant (v2)                  | One immutable fact plus optional staff-only evidence                            |
| Part 2                                                   | Keeps Switch closed and the licence open through tax season; "at most two tax seasons" ignores extensions | Two decommission attestations: documents issued (or ready) and records retained |
| Part 5 (Support overview)                                | Phase 18's allow-list for the Support overview forbids new fields (v1); not needed for a full-year view   | Unchanged Support overview; three sentences in the existing portal              |
| Part 5 (per-gift "where your document comes from" label) | Asym cannot know the issuing document for every gift (DAF, manual processes)                              | One neutral gift-detail sentence                                                |
| Part 8 (prefix rule)                                     | Conflicts with #944's fixed `R-` series (verified)                                                        | Census feeds #944 continuity                                                    |

After deletions the decision adds **one fact, three census and go/no-go items, two decommission attestations, three donor sentences, one notice text and one sequencing gate**. Nothing else is new.

### 1.9 UX/UI and user friction — material concern: yes

| Concern                                                  | Detail                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **UX1. Two year-end documents confuse donors**           | **Evidence:** Tithe.ly says two statements "often confuses donors"; churches tell donors "you'll need both"; Kalos Church saw "3 or 4 issues out of 400 donors" (q04-r2 §4, q04-r4 §7; secondary). **Severity:** medium. **Likelihood:** high (every split year). **Fix:** a notice worded by system, a portal note and the year-total split line. **Monitor:** M1.      |
| **UX2. A notice worded by date is wrong for tail gifts** | "Gifts before {date}" sends monthly donors, whose gifts the old system still charges, to look on Asym's statement. **Severity:** high. **Fix:** word it by system.                                                                                                                                                                                                       |
| **UX3. Misleading phrases**                              | "Not a tax receipt" (the Phase 25 DAF phrase, `financial.md:165`) implies the gift isn't deductible. "Not a tax document" is arguably false in the US, where any written record with name, date and amount substantiates gifts under $250 (q04-r4 §6). **Severity:** medium. **Fix:** ban those phrases and use the IRA "different totals" pattern (`financial.md:191`). |
| **UX4. "This year so far" disagrees with the statement** | **Current:** Phase 25 sums posted giving by gift date (`financial.md:127-129`). Imported gifts need a usable date to count, and they carry the source's civil gift date (Phase 13 D.6; Q3 blocks ambiguous dates). **Fix:** include them, with one line stating the previous-system portion.                                                                             |
| **UX5. Accessibility, mobile and bandwidth**             | Notes must be text, not icon, colour or tooltip only, and readable at 320 CSS px and 200% zoom. No extra requests: the split comes from the same query as the total.                                                                                                                                                                                                     |
| **UX6. Staff friction**                                  | January brings statement season in both systems at once. The scheduling step states this in advance, and attestations are two checkboxes on the existing decommission checklist. Missionary views are unchanged; they show giving, not tax documents.                                                                                                                    |

**Comparable products:** Fundraise Up shows imported CRM gifts, says it "cannot issue receipts for them" and can link the CRM's receipt (verified-vendor-doc). That is the closest precedent to A's portal behaviour.

### 1.10 Source of truth, ownership and invariants — material concern: yes (must be stated)

**Owners:**

- **Phase 7:** owns eligibility and the fact's meaning.
- **Phase 13 D.6 and O13 owner commands:** write it.
- **Phase 18:** owns document purposes, activation and serials.
- **Phase 19:** owns statement populations and late facts.
- **Phase 25:** owns donor wording.
- **Phase 30:** owns the census, dispositions, attestations, the duplicate flag and run evidence.
- **The ministry:** owns its previous-system documents, legally and operationally.

**Invariants:**

- **I1.** Every gift has exactly one issuer for tax documents, fixed at intake.
- **I2.** A gift committed by a Phase 30 import or Legacy Tail Backfill always carries Recorded outside Asym, from its first committed instant.
- **I3.** A gift carrying it never has an Asym receipt plan, acknowledgment, Canadian plan fact, official-document line or Late Fact Obligation.
- **I4.** No operation removes or changes the fact, and reversals inherit it.
- **I5.** Asym issues for every gift it first records, provided its setup was active before that gift (enforced by go/no-go).

I2–I4 are database-enforced; I1 and I5 are enforced at the owner command plus go/no-go.

**Severity:** high if not stated. **Spec language:** clauses 1–3.

### 1.11 Hidden coupling — material concern: yes (low)

**H1.** Phase 30 now depends on four owner amendments (O22–O25). Without them, the import cannot commit money safely. This coupling is explicit and intentional: money imports already wait for owner commands (Q1 clause 1(a)). **H2.** The SiteStacker profile depends on a vendor add-on (Statements). Covered by the census item. **Severity:** low. **Fix:** record O22–O25 and the sequencing gate (clause 7).

### 1.12 Failure modes — material concern: yes

| Mode                                             | Effect                                                                         | Safe?                                                | Visibility and recovery                                                           |
| ------------------------------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| The ministry never issues the old documents      | Donors lack documents                                                          | No (outside Asym's control)                          | Decommission attestation; monitor M2; Asym never issues instead                   |
| An import commit fails partway                   | Fact and gift written together or not at all                                   | Yes (same transaction)                               | Run evidence (O11)                                                                |
| A backfill is replayed                           | Source Record Binding recognizes the prior effect; the fact is unique per gift | Yes                                                  | Run receipts                                                                      |
| A fact is missing through a bug                  | A receipt plan could be created                                                | Prevented by constraint; caught by monitor M3 if not | Integrity alarm; CRA cancel-and-replace through the issuer if anything was issued |
| A late fact arrives after a statement run starts | No obligation (O23)                                                            | Yes                                                  | M3 also checks that no Late Fact Obligation exists                                |
| A confirmed duplicate                            | Excluded row with reason                                                       | Yes                                                  | Staff decision recorded on the plan                                               |

**Severity:** medium overall.

### 1.13 Lifecycle, temporal correctness, concurrency and idempotency — material concern: yes

**States of the fact:** absent (Asym-recorded gift) or present, from commit onward. No transitions exist; that is the point.

**Timing risks:**

- **Canadian activation at T.** An import at T+1 ms gets no plan fact; an Asym-recorded gift at T+1 ms gets exactly one (AC4).
- **Postmarks.** A gift dated by postmark into a prior year stays with its first-recording system.
- **Late facts.** None are created for these gifts (O23).
- **Reclassification.** The disposition end date equals the reclassification date (E10).
- **Concurrency.** A correction racing an import cannot remove the fact, which is append-only and unique.

**D28** (boundary time zone vs tax time zone) **dissolves for tax documents**, because the issuer no longer depends on the boundary instant. It remains only for Q1's history-versus-tail classification.

**Spec language:** clauses 1–2; AC4–AC5.

### 1.14 Data integrity risks — material concern: yes

- Double entry around the boundary (E3).
- Year total versus statement disagreement (UX4).
- A wrong Legal Entity on imported gifts would route documents to the wrong issuer. Already governed by Q1 clause 1's reviewer-accepted merchant-account assertion.

**Severity:** medium. **Fix:** clauses 3(c), 3(d) and 5.

### 1.15 Security and privacy risks — material concern: yes (low)

**S1. Previous receipt numbers and dates are identifiers.** Keep them staff-only evidence: no donor or missionary display and no export beyond Phase 12's restricted rules.

**S2. Old tax documents.** Asym takes no custody of previous-system tax documents in v1 (data minimization; Phase 25 forbids importing them, `financial.md:195`). The ministry records where it keeps them.

**Severity:** low. **Spec language:** clauses 2 and 4; AC11.

### 1.16 Scalability and performance — material concern: no (after the deletions)

**Checked:**

- **The fact.** One append-only row or column per imported gift; 1–2 million rows for a 50,000-donor, 10-year tenant is ordinary Postgres scale (judgment).
- **Removed load.** The four-state checklist (potentially millions of items) is gone, and so are late-fact volumes from tail backfills.
- **Portal.** The split line comes from the same aggregate as the total.

Requirement: Phase 7 eligibility checks the fact by indexed key, not by scanning provenance.

### 1.17 Operational burden — material concern: yes

| Concern                                                              | Detail                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **OB1. The ministry runs a last year-end process in its old system** | Possibly in a second January if the tail crosses the year. **Severity:** medium; this is inherent to A and accepted by the founder. **Mitigation:** generate documents early (allowed), close the tail by 31 December, and send the notice.                                         |
| **OB2. Retention**                                                   | Canada keeps receipt copies for 2 years after the gift's year (Reg. 5800 and IC05-1R1 ¶22) and books and source records for 6 years (CRA books-and-records; q04-r4 §5, verified). The ministry names where these are kept. **Severity:** medium. **Fix:** decommission attestation. |
| **OB3. No developer or database repair needed**                      | Asym's side is automatic once the fact exists.                                                                                                                                                                                                                                      |

### 1.18 Observability and auditability — material concern: yes

**Staff gift detail** shows "Recorded outside Asym — {source system}, {Switch or backfill reference}", and a year filter by origin reconciles to the year total (AC13).

**Durable business history:**

- the fact (who, when, which run);
- census answers;
- attestations with named users and times (Q1 pattern).

**Integrity alarm:** monitor M3. Technical logs are not the audit trail; the fact and attestations are.

**Severity:** medium if omitted.

### 1.19 Dependency and integration risks — material concern: yes

| Concern                         | Detail                                                                                                                                                                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DEP1. SiteStacker**           | Its Statements report is an add-on, Canadian receipts are undocumented, and the help centre is inactive (402), so the vendor itself is a continuity risk. **Fix:** census item, and documents may be generated before decommission. |
| **DEP2. Processors**            | PayPal and gateways issue no tax documents; processor-only cohorts need a named issuer (E1).                                                                                                                                        |
| **DEP3. Template-path vendors** | Their capabilities are unknown; the census asks the ministry.                                                                                                                                                                       |

Asym owns none of these; it records who issues and blocks go/no-go when nobody does. **Severity:** medium.

### 1.20 Migration, rollout and upgrade — material concern: yes

**R1. Order of work:**

1. Owner amendments O22–O25.
2. Phase 13/7 owner import commands write the fact.
3. Prototype receipt and statement paths retired (#1031).
4. Then any Switch may commit money.

No Phase 30 path writes `donations`.

**R2. Moving to B later** (combined US statement) is additive: Phase 19 could list Recorded-outside-Asym gifts in a clearly separate section without changing the fact.

**R3. Rollback.** If an Asym receipt were wrongly issued, the correction is CRA cancel-and-replace through Phase 18's correction purpose. Database rollback is never the fix.

**Severity:** high until gated. **Spec language:** clause 7; AC12.

### 1.21 Testability, traceability and proof — material concern: yes

**Acceptance criteria:** AC1–AC14 (§3). Each is falsifiable at a seam that is user-visible or part of the domain.

**Traceability fixes:**

- Align "Switch closed" in `CONTEXT.md` with Q1 clause 2.
- Supersede O15; resolve O18 into O22–O25.
- Resolve D4, D26, D27 and D28.
- Name the fact "Recorded outside Asym" and avoid `already_receipted`. That Phase 13 term asserts a receipt exists, which is often unknown.
- Amend Q1 clauses 6, 7 and 12 and Q3 clause 4(e) by reference.

**Severity:** medium.

### 1.22 Other development hazards — material concern: yes

| Concern                   | Detail                                                                                                                                                                                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **OD1. Legal inferences** | The Canadian "never two receipts per gift" rule rests on the replacement rules and penalties, not an explicit CRA sentence (q04-r2). The _Durden_ reading is secondary. **Fix:** counsel confirms the donor notice and portal wording before first use (release gate, not a design change). |
| **OD2. Brand naming**     | Donor-facing copy should not name "Asym" unless brand rules say so; use "statements here" or "our new giving site".                                                                                                                                                                         |

## 2. Disposition

**Accept with required amendments.** A is the right base, and Canada requires its core rule anyway. The asked version had:

- **one unsafe branch:** US "skip";
- **one undefined term:** "received";
- **four overbuilt parts:** statuses, Switch closed, Support overview, prefix;
- **one wrong notice:** worded by date;
- **four missing protections:** an immutable fact, the go-live setup check, duplicate entry, prototype routes.

## 3. Corrected decision (to record)

**Q4 — Switch-year tax documents.** Option A, amended.

1. ★ **One issuer per gift, fixed when it is first recorded.**
   - **Asym:** issues official tax documents (US per-gift and annual acknowledgments, Canadian official receipts, any official year-end statement) only for gifts first recorded in Asym. That means Asym giving, Phase 15 entry, Phase 16 recurring, or a Phase 13/15 owner intake after a tail arrangement is reclassified.
   - **Outside Asym:** every gift that reaches Asym through a Phase 30 import (pre-boundary history, any source profile) or a Legacy Tail Backfill (old-system or processor-report source) is **Recorded outside Asym**. The ministry documents it outside Asym, normally with its previous system's usual receipts and year-end documents, for every tax year in which such gifts fall.
   - **Never by date:** the issuer is decided by where the gift was first recorded, never by its date, its time zone or the boundary instant.
   - **Q1 clause 6:** its "unless F5 and Phase 7 later allow it" path is closed for tax documents; F5 still decides thank-yous and welcomes.
2. ★ **One fact that cannot change.** Recorded outside Asym is Phase 13 D.6's receipt-boundary fact, owned by Phase 7.
   - **How it is written:** in the same transaction as the money fact, by the owner import command; one per gift; append-only.
   - **What cannot change it:** correction, re-dating, donor merge, refund or reversal. Linked reversals and corrections inherit it.
   - **What it carries:** the source system, plus the previous receipt number and date as staff-only evidence when the export has them.
   - **What it is not:** a contribution status; payment and posting stay as D.6 defines.
   - **Phase 7:** a gift carrying it has no receipt plan, acknowledgment, Canadian plan fact or official-document line. This is enforced at the single Phase 7 boundary and by the database.
   - **Phase 19:** such gifts are outside every official purpose's source scope and create no Late Fact Obligation.
3. ★ **Readiness and go/no-go** (adds to Q1 clauses 1(d) and 7, and Q3 clause 4(e)).
   - (a) **Named issuer.** For each issuing Legal Entity, the readiness census records who documents the switch year's pre-boundary gifts and each Legacy Tail cohort, and how: old-system documents, another receipting tool, or the ministry manually.
     - Q1's surface "receipts for legacy charges" becomes "tax documents for gifts recorded outside Asym" (Kept on through tail, with owner and end condition), re-confirmed at every backfill. Go/no-go is blocked while any population lacks one.
     - SiteStacker profile: the Statements report is confirmed available.
     - Canada: the census records the current receipting tool and last serial number for Phase 18 serial continuity (#944).
   - (b) **Asym ready first.** Each issuing Legal Entity's Asym tax-document setup is active before Asym records that entity's first gift.
   - (c) **Gift entry off.** Staff gift entry in the old system is Off at the boundary for every source profile.
   - (d) **Duplicate flag.** An imported or backfilled gift that may duplicate an Asym-recorded gift (same matched Party and amount, dates within 7 days, same check number where present) waits for a staff decision. A confirmed duplicate is excluded with a reason, and staff are prompted to check whether both systems issued a receipt.
4. ★ **Decommission, not tail closure** (amends Q1 clause 12). The decommission checklist adds two attested items, which block decommission sign-off only (not tail closure, and not Switch closed):
   - (i) the tax documents owed for gifts recorded outside Asym are issued, or generated and ready to send by the jurisdiction's deadline;
   - (ii) where the previous system's receipt copies and gift records are kept, and for how long (Canada: receipt copies 2 years after the gift's year; books and source records 6 years).

   Asym takes no custody of previous-system tax documents in v1.

5. **Donor view** (Phase 25). Giving history and "This year so far" include gifts recorded outside Asym, by their imported gift date. Three plain sentences are added:
   - **gift detail:** the ministry sends this gift's tax receipt separately, and it isn't in statements here;
   - **Receipts & statements:** one note for an affected year (some gifts came through the previous giving system; keep both sets of documents);
   - **year total:** one line stating the previous-system portion (the IRA "different totals" pattern).

   Constraints:
   - no receipt action on these gifts;
   - never "not a tax receipt", "not a tax document" or "not deductible";
   - visible text, not icon or colour only.

   The Support overview and missionary views are unchanged, and receipt evidence is staff-only.

6. **Notice and timing guidance** (no new mechanism).
   - **Notice:** Asym supplies a donor notice worded by system, not by date, with a Canadian variant. The ministry sends it through its usual channels at the switch and with year-end documents. Imports send nothing.
   - **Scheduling:** the switch-scheduling step states which tax years will have documents from both systems, and warns when the boundary falls between mid-November and 31 December.
   - **Guidance:** prefer an early-year boundary and closing the tail by 31 December.
7. **Sequencing.**
   - No Phase 30 money import commits until the Phase 13/7 owner commands that write the fact exist.
   - No Phase 30 path writes the legacy `donations` table.
   - The prototype portal receipt link and text statement (#1031) are retired before any Switch commits money.
8. **Not adopted:** the US "may skip" branch; a four-value receipt status; holding Switch closed through tax season; a Support overview change; a Phase 30 serial-prefix rule.

**Acceptance criteria:**

| ID   | Criterion                                                                                                                                                                                                                                                              |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1  | **Atomic fact.** Every money fact a Phase 30 import or Legacy Tail Backfill commits has exactly one Recorded-outside-Asym fact, written in the same transaction. A commit path that omits it fails and writes nothing.                                                 |
| AC2  | **Immutable.** No role or path other than the owner import command can insert, update or delete the fact (RLS and grant tests cover both USING and WITH CHECK). Correction, re-dating, merge, refund, chargeback and reversal leave it in place; reversals inherit it. |
| AC3  | **No Asym tax document.** For such a gift there is no US single or annual acknowledgment, Canadian plan fact, cumulative coverage or official-document line, including after Canadian activation, correction, merge or refund.                                         |
| AC4  | **Canadian boundary.** With the pack active at T: a gift imported at T+1 ms has no plan fact; a gift first recorded in Asym at T+1 ms has exactly one; an Asym-recorded check with a prior-year postmark is receiptable.                                               |
| AC5  | **No late facts.** A backfilled fact or correction on such a gift, posted after a run's Start, creates zero Late Fact Obligations.                                                                                                                                     |
| AC6  | **Go/no-go blocks** while any population (pre-boundary, per issuing Legal Entity; each tail cohort, including processor-only ones) lacks a tax-document disposition, or while an issuing Legal Entity's Asym setup is inactive.                                        |
| AC7  | **Decommission.** Sign-off is refused while either tax-document attestation is open; tail closure succeeds with them open.                                                                                                                                             |
| AC8  | **Duplicate flag.** A gift matching an Asym-recorded gift (Party, amount, within 7 days, check number) waits for a staff decision; non-matching rows are unaffected.                                                                                                   |
| AC9  | **Portal sentences.** A donor with both kinds of gifts in year Y sees the gift-detail sentence, the year note and the split line. A donor with none sees none. There is no receipt action on such gifts, and the banned phrases are absent.                            |
| AC10 | **Accessibility.** The sentences are text in reading order, reachable by keyboard and screen reader, not truncated at 320 CSS px or 200% zoom; axe passes.                                                                                                             |
| AC11 | **Authorization.** The previous receipt number and date are visible only to authorized staff of that tenant. Donors and missionaries never see them. A cross-tenant read returns the uniform non-disclosing result.                                                    |
| AC12 | **Prototype gate.** Wherever a Phase 30 money import can commit, the prototype receipt link and text statement return not-found, and no Phase 30 path writes `donations`.                                                                                              |
| AC13 | **Staff view.** Gift detail shows "Recorded outside Asym — {source system}, {Switch or backfill reference}". The year's previous-system and Asym-recorded totals add up to the year total.                                                                             |
| AC14 | **Notice.** The template renders the ministry name and previous-system name, plus the tail sentence when a tail cohort exists. Producing it sends nothing.                                                                                                             |

## 4. Ruthless synthesis

**Resolve before recording** (founder confirmation of the ★ amendments):

1. **Clause 1:** define the issuer by first recording, not by date, and delete the US "skip" branch.
2. **Clause 2:** one immutable fact replaces the four statuses.
3. **Clause 3:** new go/no-go items (named issuer per population, Asym setup active first, gift entry off, duplicate flag).
4. **Clause 4:** move the tax items from Switch closed to decommission, amending Q1 clause 12.

These change Q1, Q3 and financial policy, so they need an explicit yes.

**Capture in the spec:**

- the Phase 30 census, disposition, attestation, duplicate-flag and scheduling-statement requirements;
- AC1–AC14;
- glossary term "Recorded outside Asym";
- "Switch closed" alignment;
- D26–D28 resolutions.

**Required owner amendments** (identified, not agreed):

| ID            | Owner                 | Requirement                                                                                       |
| ------------- | --------------------- | ------------------------------------------------------------------------------------------------- |
| O22           | Phase 7 with Phase 13 | The fact, eligibility, immutability, and the E3 and #577 changes. Supersedes O15; resolves D4.    |
| O23           | Phase 19              | Late-fact scope. Resolves D26.                                                                    |
| O24           | Phase 25              | Wording, year split, no receipt action, prototype retirement with Phase 19 (#1031). Resolves D27. |
| O25           | Phase 18              | Expose issuer activation state for go/no-go, and accept census evidence for #944 continuity.      |
| O13 (updated) | Phase 13 / 16         | The post-boundary intake command writes the fact.                                                 |
| O18           | Phase 19 / 7          | Resolved by Q4.                                                                                   |

**Implementation safeguards:**

- the database constraint plus the single Phase 7 boundary;
- the sequencing gate (clause 7);
- the integrity alarm (M3);
- counsel review of the notice and portal wording before first use.

**Dependency order:**

1. O22 and O23.
2. The owner import commands.
3. O24 and the #1031 retirement.
4. O25.
5. The first Switch with money.

**Monitor:**

| #   | Risk                                 | Signal                                                                                                                                         | Threshold                                                                                                                                                   | Owner                                              | Response                                                                                                                                                             |
| --- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | Split-statement confusion            | Donor contacts about switch-year statements or "missing" gifts, reported by the ministry at a post-statement-season check-in after each switch | More than 2% of donors with gifts recorded outside Asym that year (assumption; Kalos saw about 1%), or any reported lost deduction or duplicate CRA receipt | Phase 30 spec owner with Phase 19 owner            | Revise the notice and portal wording. If it persists, add a switch-year note to Asym's annual document (Phase 18/19 amendment), then reconsider Option B for the US. |
| M2  | Previous-system documents not issued | Decommission item (i) still unattested                                                                                                         | Open after 31 January (US) or 28 February (Canada) following a year with gifts recorded outside Asym                                                        | Asym relationship owner with the Switch lead (Q5)  | Contact the ministry. Asym never issues instead.                                                                                                                     |
| M3  | Integrity breach                     | Any receipt plan, issuance, official-document line or Late Fact Obligation referencing a gift that carries the fact                            | More than zero                                                                                                                                              | Phase 7 owner (Phase 19 for Late Fact Obligations) | Stop issuance for that issuer, fix the defect, and have the issuer correct or cancel and replace anything issued                                                     |
