# Q4 v2 review: users, operations, simplicity and proof

Independent read-only review of `q04-decision-as-asked.md` (Option A, eight parts). Baseline develop `629cb71dc`, 2026-11-02. Not legal advice.

Labels: **verified fact** (external quote checked by this reviewer on 2026-11-02 or by r2/r4); **repo fact** (file:line); **inference**; **assumption** (names the evidence that would settle it). DL = `grill/decision-log.md`; P25F = `docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/financial.md`; P18M = `…/phase-18-document-purpose-authority-manifest.md`.

## Bottom line

Option A is the right base. It is the only option that needs no new Asym tax engine, it respects C7 and P13:1031-1034, and it extends a split Q1 already made: "SiteStacker alone receipts what it charges" (DL:33).

As asked, it is both over-built and under-specified:

- **Over-built.** Parts 2, 3, 4 and 8 add machinery that nothing in Asym consumes, or that another owner already provides.
- **Under-specified where donors get hurt.** Part 1's US "skip" branch is a deduction trap. Part 7's notice is wrong for every tail gift. Prototype routes can still produce "receipts" for imported gifts.

The minimum fully functional set: one immutable origin fact, one row in Q1's existing Legacy Surface Dispositions, one decommission check, and three portal sentences that reuse Phase 25 patterns. A notice template and timing advice go with them.

## Part-by-part verdict

| Part                 | Verdict                                                | Reason                                                                                                                             |
| -------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1 Who issues         | **Keep; delete US "may skip"; issuer is the ministry** | C6, C10                                                                                                                            |
| 2 Through tax season | **Replace**                                            | Amends a twice-defined "Switch closed"; mandates a licence, not issuance; "at most two" is false given extensions (DL:32). C2, C15 |
| 3 Four statuses      | **Replace with one fact**                              | Asym treats all four alike; source fields unreliable. C1                                                                           |
| 4 Late tail gifts    | **Fold into 3**                                        | A consequence, not a rule. C5                                                                                                      |
| 5 Full-year view     | **Narrow**                                             | Drop Support overview; reuse Phase 25 patterns; fix wording. C4, C8                                                                |
| 6 Timing             | **Keep; extend**                                       | Add tail-closure-by-31-December advice. C10                                                                                        |
| 7 Notice             | **Rewrite**                                            | Date-based wording misinforms tail donors. C7                                                                                      |
| 8 Canada             | **Delete prefix; fold retention into Q1 cl. 12**       | Conflicts with Phase 18 and #944; misses six-year rule. C3                                                                         |

---

## 1. Overengineering: material

**C1. Part 3's four statuses and per-gift checklist have no consumer.** Severity High (complexity). Likelihood High.

- **Problem.** Asym "never receipts any of these" (Part 3 itself), so the four values drive no Asym behaviour.
- **Evidence.** Receipt fields in other systems' exports mean different things, and many CSV exports omit them. Bloomerang confirmation emails "do not mark the transaction as acknowledged", and SiteStacker exports name no receipt column (verified fact, r4 §1–2). Making every "unknown" gift a checklist item would flag "nearly every import" (r4 §2, inference). At 50k donors × 10 years that could be millions of items.
- **Duplication.** "Not the ministry's to receipt" (CanadaHelps, DAF, fiscal sponsor) duplicates the Phase 13/14 legal-donor model and the Phase 25 DAF pattern (P25F:165).
- **Effect.** Narrows the answer.
- **Fix.** One immutable fact per gift, carrying the previous receipt number and date as evidence only. Q1 already carries SiteStacker's receipt "as evidence" (DL:32). See corrected clause 2.

**C2. Part 2 adds closure machinery where an existing mechanism fits.** Severity Medium. Likelihood High.

Q1 clause 7 already records "receipts for legacy charges" as a Legacy Surface Disposition with owner and end condition (DL:33), and clause 12 already has a decommission checklist with a "data deletion or retention decision" (DL:38). Part 2 instead gates "Switch closed" and mandates a licence Asym cannot verify; issuance is what matters. **Effect:** changes the answer. **Fix:** widen the clause 7 disposition; add one decommission condition that blocks decommission sign-off only; leave "Switch closed" alone.

**C3. Part 8 duplicates Phase 18 and conflicts with it.** Severity Medium. Likelihood Certain if built.

- **Evidence (repo fact).** The serial display is fixed: "`R-` plus an unbounded positive `BIGINT` … never resets" (P18M:199). Activation "MUST establish a collision-safe starting position", with a specialist route if continuity cannot be proved (P18M:204). The setup task "Confirm history and activation" carries the serial-continuity decision (P18M:465). Published #944 forbids configurable prefixes (r3 §4).
- **Retention is understated.** Charities keep duplicate receipts 2 years after the gift year, but "source documents" six years (verified fact: canada.ca books-records, via r4 §5 and a 2026-11-02 search).
- **Effect.** Narrows the answer. **Fix.** Delete the prefix rule; state the retention periods inside the Q1 clause 12 retention decision.

**C4. The Support overview adds a dependency on an unbuilt, default-Off purpose.** Severity Low–Medium. It is "default Off" and "supported only after Phase 7/13/14/19 purpose and privacy proof" (repo fact: P18M:39-45, :138; P19:914-925). Portal history already gives the full-year view. **Fix:** Q4 says nothing about it.

**C5. Part 4 is not a separate mechanism**; it follows from the origin fact. One gap remains: Phase 19 creates an obligation for any fact posted after Start (P19:977-990; SO:328-331), and exclusion changes only the _outcome_ to "no document action" (r3 §3, repo fact). See C12.

## 2. UX/UI and user friction: material

**C6. Part 1's US "may skip the old system's year-end statement" can cost donors their deduction.** Severity **High**. Likelihood Medium.

- **The law.** A contemporaneous written acknowledgment for gifts of $250 or more must state "Whether the donee organization provided any goods or services…" (IRC §170(f)(8)(B)(ii), verified fact, fetched 2026-11-02). _Durden_ lost $22,517 of deductions for lack of that statement (secondary, r2).
- **What SiteStacker does.** Its year-end template says "This letter will serve as your receipt for tax purposes" and certifies no goods or services. No article shows the per-gift email carrying that certification, and a receipt per recurring charge is not documented (verified vendor documents and documented absence, r4 §1). So for SiteStacker ministries the year-end statement is probably the only compliant acknowledgment (inference).
- **Donor harm.** A donor who gets only Asym's July–December acknowledgment, and nothing for January–June, may under-claim or lose the deduction for large gifts.
- **Effect.** Changes the answer.
- **Fix.** Delete the branch: the previous system's normal year-end documents are issued for every year in which it recorded gifts. This is also simpler, one rule instead of two.

**C7. Part 7's notice wording is wrong for tail gifts and for some checks.** Severity **High**. Likelihood High for any ministry with recurring giving.

- **The wording.** "Gifts before {date} are on a statement from {old system}" (q04-decision-as-asked:19).
- **Tail gifts** are charged _after_ the date and still documented by the old system (Parts 1–2). Monthly donors told "before {date}" will look for them on Asym's statement and not find them.
- **Checks.** A check postmarked 30 December but recorded in Asym after a 1 January boundary is documented by Asym (P7:246, repo fact), so "before" is wrong for it too.
- **Names.** Donors know "our previous giving site", not vendor names (inference).
- **Effect.** Changes the answer.
- **Fix.** Word the notice by _system_, not date, with US and Canadian variants, sent at the switch and again with year-end documents.

**C8. Portal labels: wording, placement and gaps.** Severity Medium. Likelihood High.

- **Wording risk.** Reusing the DAF phrase "For your information — not a tax receipt" (P25F:165) would imply these gifts are not deductible; they are, and their documents simply come from elsewhere. "Not a tax document" is also arguably inaccurate in the US: a "written communication from the donee … showing the name of the donee organization, the date of the contribution, and the amount" substantiates any monetary gift, so every gift under $250 (IRC §170(f)(17), verified fact, fetched). The Support overview's protected label is a Phase 18 matter.
- **Precedent to reuse.** The IRA pattern: "IRA gifts have separate acknowledgments, so these documents may show different totals from your giving summary" (P25F:191).
- **Placement.** History rows carry no receipt column, and "A gift does not imply an available receipt" (P25F:21). A badge on every row across ten years is noise, especially on mobile. Use one sentence in gift detail (P25F:23) and one note in Receipts & statements.
- **Gaps the decision misses.** Receipts & statements will never hold pre-switch documents, because foreign document import is forbidden (P25F:69, :195). Donors asking for a copy of a 2026 statement need to know whom to ask; the existing state "known incomplete external coverage" (P25F:33) fits. Tail totals lag the backfill cadence, so show when tail gifts were last brought in (already requested as O17, DL:178).
- **Comparable products.** Fundraise Up, the closest precedent, shows imported gifts, "cannot issue receipts for them", and can link to the other system's receipt (verified fact, fetched). Planning Center puts imports "on statements by default" with no receipts (verified fact, fetched); consolidation dominates, and two statements is its documented fallback (secondary). Tithe.ly says two statements "often confuses donors" (secondary, r2). CyLife tells donors "You'll need both statements for your tax records" (verified fact, fetched). No vendor labels each gift's document source (r4 §3), so keep labels minimal.
- **Accessibility, mobile, low bandwidth.** Notes are text, not colour, icon or tooltip; P25F:165 already bans "tooltip-only meaning". They must not be clamped at narrow widths (P25F:21), and they add no requests.
- **Time zones.** Show the boundary as a civil date, never a time.
- **Effect.** Narrows the answer.

**Missionaries (Phase 28): no material concern.** _Checked:_ "Missionaries have no tax-document access by default" (P18M), and imported history "establish[es] baseline without catch-up tasks" (`openspec/contracts/missionary-workspace-depth.md:2904`). The only requirement is that no tax-source text or receipt number leaks into missionary views (AC 7).

**Ministry staff.** Part 3's per-gift checklist is the main friction, and it is removed under C1. Statement season is covered in C10.

## 3. Operational burden: material

**C10. The "old system" is not always the issuer, and issuance ties up statement season.** Severity Medium–High. Likelihood Medium.

- **The giving system is not always the receipting system.** SiteStacker's Statements report is an add-on enabled by emailing WMTEK support, and nothing on its training site covers Canada or CRA receipts (verified vendor document via r4, plus documented absence). Canadian SiteStacker ministries may receipt from another tool (assumption; verify in the Q2 discovery declaration, which already asks "how statements are produced").
- **Some tail cohorts are recorded by no old system.** PayPal and processor-only tail gifts come only from the ministry's processor reports (DL:32), so "the old system issues" is false for them (r3 §9; unverified in q01).
- **The US duty sits with "the donee organization"** (§170(f)(8)(A), verified fact), not with any software. So the rule should name the ministry: it issues outside Asym, normally from its previous system.
- **Licence cost.** Go-live in July 2027 with a 12-month tail means the old system documents 2028 tail gifts in January 2029, about 18 months after go-live. Advise closing the tail by 31 December of the switch year where practical. Require attested issuance, not a licence. (SiteStacker pricing is not public; assumption.)
- **Stale contacts.** From the boundary, Asym is the only writer of contact data (DL:28). Old-system documents run months later will use contact details as they stood at the boundary (inference). Operator guidance: refresh mailing details from Asym before the old run. No new machinery is needed.
- **Statement season.** The January after the switch, the ministry runs its old year-end process and its first Phase 19 run; with a 1 January boundary that is also go-live month. Inherent to Option A; the timing advice should say so.
- **Retention.** The ministry, not Asym, keeps old receipt copies, source records and issued old statements (for duplicate requests), recorded in the Q1 clause 12 retention decision. Making Phase 29 custody the store would be F11 scope creep.
- **No in-house tech help.** Each obligation is one attestation in an existing list.
- **Effect.** Changes the issuer wording; adds one guidance line.

## 4. Observability and auditability: moderate

**C11. "My gift is missing from my statement" needs one staff-visible field, not a new tool.** Severity Medium. Likelihood High (the question is certain to come up).

- **What exists.** C21 makes Entry Method `import`/`legacy` an attribution axis (DL §2), and Phase 25 imports "retain provenance". Nothing requires staff gift detail to show _which system documents the gift_.
- **Fix.** Staff gift detail shows "Recorded outside Asym — {source system}, Switch / run or backfill id, previous receipt reference if any". A year's giving can be filtered by it, so staff can reconcile previous-system total plus Asym total to the year's total. The Switch summary (F18, DL:194) shows the document dispositions and decommission state.
- **Audit evidence.** Asym's artifacts plus the ministry's retained old copies, joined by that filter, are enough for an auditor.

## 5. Scalability and performance: material only if Parts 3 and 4 stay as asked

**C12. Volume.**

- A per-gift checklist at 50k donors × 10 years means millions of items (removed under C1).
- Late Fact Obligations are created when a December tail charge, refund or chargeback lands after the switch-year run's Start, and in bulk if a "history not yet covered" family is imported later from the retained manifest (Q1 clause 1(b)). They surface as "late-fact and supplemental obligation age" and the "late-fact backlog" runbook (P19:1092, :1098, repo fact): false work during statement season.
- **Fix.** Phase 19 owner sentence: "A fact on a gift Recorded outside Asym creates no Late Fact Obligation."
- **No other material risk.** _Checked:_ the fact adds one immutable value per gift; portal reads are one EXISTS check per issuer bucket plus a detail-page join; Asym statement populations get smaller, not larger.

## 6. Migration, rollout and upgrade: material

**C13. The prototype portal can mint "receipts" and statements for imported gifts.** Severity **High**. Likelihood Low–Medium.

- **Evidence (repo fact).** Every "Succeeded" row shows a **Receipt** download (`apps/donor/app/(dashboard)/donor-dashboard/history/columns.tsx:180-191`) rendering "Donation Receipt" with no origin check (`packages/api/src/donor-portal/receipts.ts:22-33`). The `.txt` statement sums settled `donations` by **UTC** year with no origin filter (`packages/api/src/donor-portal/service.ts:279-301`, r3 §7). Removal is planned "before production" (P19:172; #1031) but is not tied to imports.
- **Effect / fix.** Adds a gate: no imported gift is donor-visible wherever these routes are reachable.

**C14. Owner sequencing and a later move to Option B.**

- **Phase 7 must change first.** It must define the fact and amend E3, which says "manual/imported/historical gifts … can be receipted" (P7:339, repo fact), together with #577's acceptance criteria. Otherwise an import committed after Canadian activation gets a permanent plan fact (P7:307: "same transaction as source intake/posting").
- **The natural gate already exists.** Q1 clause 1(a) blocks scheduling until giving history is "committable through its owner's typed import command". No new feature flag is needed.
- **Option B later.** A fact named for its _outcome_ ("never receiptable") would have to be reinterpreted. Name it for its _origin_ ("Recorded outside Asym") and keep the exclusion as Phase 7 policy keyed on it. Option B for the US then becomes a prospective policy change for the annual purpose only, in the spirit of Q1 clause 11 (DL:37).

## 7. Testability, traceability and proof: material

**C15. Terms and supersession are inconsistent.**

- **"Switch closed" has two definitions.** DL:28 omits decommission; CONTEXT.md:24 adds "and decommission is recorded". Part 2 would add a third. Keep DL:28 and correct CONTEXT.md, so decommission stays a separate signed-off state.
- **A new checklist item would also block tail closure.** DL:38: "Tail closure and decommission sign-off are blocked while any item is open". The new condition must block decommission only.
- **"Readiness checklist" is undefined.** The defined terms are "readiness census" (DL:29), the Q3 "generic checklist" (DL:74) and the "decommission checklist" (DL:38).
- **Supersession must be explicit.** DL:32 ("no Asym receipt … unless F5 and Phase 7 later allow it") is superseded for tax documents, and F5 narrows to non-tax messages. O15 is replaced by the fact; O18 is answered; D26 goes to a Phase 19 sentence; D27 is answered by the portal clause; D28 does not affect issuance; D4 stays open until Phase 7 amends E3/#577.
- **Not falsifiable as asked.** "One honest full-year view" cannot fail a test. See (c).

## 8. Other development hazards

**C16. Double-entered checks.** Severity Medium. Likelihood Low–Medium. A check keyed into the old system before the boundary and again in Asym after it gets two acknowledgments; Phase 15 offers only a non-blocking duplicate warning (P15:260). SiteStacker's "staff CRM editing" is Off at the boundary (DL:33), but the Q3 generic checklist omits staff gift entry (DL:74; r3 §6). **Fix:** add "staff gift entry" to that checklist.

**C17. Different statement subjects.** Severity Low. SiteStacker statements are per household (r4 §1); Asym's US annual goes to the "exact source-owned legal contributor" (P18M:132). Totals will differ for couples (inference). The "different total" sentence covers this.

---

## (a) Disposition

**Accept with required amendments.** Option A stands; Parts 2, 3, 4 and 8 collapse into existing mechanisms; Parts 1, 5 and 7 are corrected for donor safety; two gates are added.

## (b) Corrected decision text

> **Q4 — Switch-year tax documents. Option A, amended.**
>
> 1. **Issuer follows where the gift was recorded.** Asym issues official tax documents (US acknowledgments, Canadian receipts, per gift or annual) only for gifts recorded in Asym. Gifts committed by a Phase 30 import or a Legacy Tail Backfill are documented by the ministry outside Asym, normally from its previous system, including its usual year-end documents for every year in which such gifts fall.
> 2. **One fact.** Each such gift carries one immutable fact, **Recorded outside Asym**, naming the source system and holding any previous receipt number and date as evidence. It is written in the gift's own transaction; no correction, merge, re-dating or reversal removes it. Under Phase 7 policy keyed on the fact, such a gift gets no receipt, acknowledgment or Canadian plan fact and appears on no official document. Under Phase 19, a later fact on it creates no Late Fact Obligation. (Owner requests: Phase 7 defines the fact and amends E3/#577; Phase 19 adds that sentence.)
> 3. **Arrangement before go/no-go; proof before decommission.** Q1 clause 7's "receipts for legacy charges" becomes "tax documents for gifts recorded outside Asym". It is recorded with an owner and an end condition ("issued for {year}") for pre-boundary gifts and for each tail executor, including processor-only cohorts. Go/no-go is blocked while any cohort lacks one. Decommission sign-off, and not tail closure or Switch closed, is blocked until every such end condition is attested and Q1 clause 12's retention decision names where previous tax documents, receipt copies and source records are kept (Canada: receipt copies 2 years after the gift year; source records 6 years).
> 4. **Donor portal.** History shows every gift as it does today. For gifts recorded outside Asym:
>    - Gift detail: "Your {year-end statement | official receipt} for this gift comes from {ministry}'s previous giving system."
>    - Receipts & statements, once: "Documents for gifts made through our previous giving system aren't kept here. Contact {ministry} for a copy."
>    - "This year so far", in any year that includes such gifts: "Some gifts this year were made through our previous giving system and appear on its statement, so our statement may show a different total."
>      Tail gifts show when they were last brought in (O17). Never describe these gifts as "not a tax receipt" or non-deductible. Missionary views are unchanged.
> 5. **Donor notice.** Asym provides US and Canadian templates. The ministry sends them at the switch and with year-end documents: "Gifts you made through our previous giving system, including monthly gifts it keeps processing until you move them, are on a statement from that system. Gifts made here are on our statement. Please keep both." Imports send nothing.
> 6. **Timing guidance, not a rule.** Prefer an early-year boundary, and close the tail by 31 December of the switch year so the previous system documents only one year. Warn against a November–December boundary. A tail makes any year a split year.
> 7. **Gates.** No imported gift is donor-visible while the prototype receipt download or `.txt` statement route is reachable. The Q3 4(e) generic checklist adds "staff gift entry".
> 8. **Not adopted:** a per-gift receipt-status taxonomy or checklist; any change to Switch closed; a receipt-number prefix rule (Phase 18 activation governs serial continuity); any Support overview rule; the US "skip the year-end statement" option.
>
> Supersedes DL:32's "unless F5 and Phase 7 later allow it" for tax documents (F5 narrows to non-tax messages). Answers O15 and O18. Disposes D26 (Phase 19 sentence), D27 (clause 4) and D28 (issuance is not affected). Corrects CONTEXT.md "Switch closed" to match DL:28.

## (c) Acceptance criteria

1. **Atomic fact.** Every gift committed by a Phase 30 import or Legacy Tail Backfill has exactly one Recorded-outside-Asym fact in the same transaction; a commit path omitting it fails and writes nothing.
2. **Canadian boundary.** With a pack activated at T, a gift imported at T + 1 ms gets no plan fact or cumulative coverage; a gift recorded in Asym at T + 1 ms gets exactly one plan fact.
3. **No official document.** No US single or annual acknowledgment, Canadian receipt or Phase 15 receipt intent is generated for or lists such a gift, including after correction, merge, re-dating, refund or reversal.
4. **No late facts.** A refund or correction on such a gift posted after a run's Start creates zero Late Fact Obligations and moves no backlog metric.
5. **Portal notes.** Donor with both kinds of gifts in year Y: Home includes both with the clause 4 sentence, and Receipts & statements and gift detail show theirs. No such gifts, or a year with none: no note. No donor surface calls these gifts "not a tax receipt", "not a tax document" or "not deductible".
6. **Accessibility.** Notes are visible text (not icon, colour or tooltip only), reached in reading order by keyboard and screen reader, and not truncated at 320 CSS px or 200% zoom.
7. **Authorization.** Previous receipt numbers and source names appear only to the donor, an authorized representative and authorized staff; missionary views contain neither.
8. **Prototype routes.** Wherever a Phase 30 money import can commit, the prototype receipt and `.txt` statement routes return not-found, and no portal control offers a receipt without a Phase 18 artifact.
9. **Go/no-go** cannot be recorded while any cohort (pre-boundary gifts, or any tail executor including processor-only ones) lacks the clause 3 disposition.
10. **Decommission** sign-off is refused while any clause 3 end condition is unattested or the retention decision is blank; tail closure succeeds with them open.
11. **Notice templates.** US and Canadian variants render ministry name, previous-system name and boundary civil date, adding the tail sentence when a tail cohort exists; the import itself produces zero sends.
12. **Staff view.** Gift detail shows "Recorded outside Asym — {source}, Switch / run or backfill id"; filtering a year by it reconciles previous-system plus Asym totals to the year's total.

## (d) Monitor items

| Risk                                   | Signal                                                                  | Threshold                                                                                                                      | Owner                                     | Response                                                                                                                             |
| -------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Split-statement confusion              | Donor contacts about switch- or tail-year statements or "missing" gifts | Over 2% of donors with such gifts that year (assumption; Overflow's Kalos case reports about 1%, r4 §7), or any lost deduction | Phase 30 spec owner with Phase 19 owner   | Add a switch-year note to Asym's annual document (P18/P19 amendment); then reconsider US Option B, which the origin fact keeps cheap |
| Previous-system documents not issued   | Clause 3 end condition unattested                                       | Open after 31 Jan (US) / 28 Feb (Canada) following each year                                                                   | Switch operator (F18) with ministry admin | Escalate to the ministry; Asym never issues instead                                                                                  |
| Late-fact noise                        | Late Fact Obligations on Recorded-outside-Asym gifts                    | Any                                                                                                                            | Phase 19 owner                            | Fix the exclusion before the next run                                                                                                |
| Tail spans two tax years               | Tail closure date after 31 Dec of the switch year, including extensions | Any                                                                                                                            | Switch operator                           | Confirm the second-year arrangement and licence or export plan at the extension                                                      |
| Stale contacts on old-system documents | Undeliverable old-system statements reported by the ministry            | Over 1% (assumption)                                                                                                           | Ministry admin with operator              | Refresh mailing details from Asym before the old run; add to operator guidance                                                       |

Fetched by this reviewer on 2026-11-02: [IRC §170](https://www.law.cornell.edu/uscode/text/26/170), [Fundraise Up](https://fundraiseup.com/docs/import-virtuous/), [Planning Center import](https://help.planningcenter.com/en/154395-import-donation-history.html), [CyLife](https://j2ns9q.nucleus.church/give), [CRA books and records](https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/operating-a-registered-charity/books-records.html). Search snippet only: [Planning Center transition](https://help.planningcenter.com/en/transitioning-to-planning-center-giving.html). Everything else is cited from r2 and r4.
