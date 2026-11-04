# Q04-R1: What Asym's receipt and statement owner contracts say about the switch year

Research track for Phase 30 founder question Q4 (switch-year statements and receipts; F13, O18). Repo: develop `629cb71dc`, worktree `t3-73d54b3d`. Accessed 2026-11-02. This is read-only research and ratifies nothing.

Evidence labels follow `docs/ai/document-authority.md:42-58`:

- **ratified**: an accepted PRD decision, ADR or retained owner constraint.
- **published**: an active OpenSpec change, an `openspec/contracts` clause referenced only by that change, or a GitHub issue.
- **integrated**: code present on develop.
- **inference**: my reading. It is not owner text.

Abbreviations:

- P7 = `docs/prds/sitestacker-parity/phase-07-receipt-statement-compliance-and-donor-credit.md`
- P13 = `…/phase-13-campaign-designation-contribution-ledger-giving-cart.md`
- P14 = `…/phase-14-donor-credit-operations.md`
- P16 = `…/phase-16-pledges-recurring-commitments.md`
- P18M = `…/phase-18-document-purpose-authority-manifest.md`
- P19 = `…/phase-19-year-end-statement-operations.md`
- SO = `openspec/contracts/statement-operations.md`
- SOΔ = `openspec/changes/add-statement-operations/specs/statement-operations/spec.md`
- P25F = `…/phase-25-donor-dashboard-depth/contracts/financial.md`

## Summary

- **The switch year has no owner rule.** A repo-wide grep for "cutover year", "switch year", "partial year" and "first year" outside the grill folder finds no receipt or statement rule. The only switch-year text is the Phase 30 request O18, which nobody has agreed to (`decision-log.md:176`).
- **`already_receipted` is still undefined in Phase 7.** Phase 13 D.6 delegates the receipt boundary to "a separate Phase 7 import fact" (P13:1030-1034), but P7 has no such fact. P7 E3 (P7:339) and the published ticket #577 say imported and historical gifts "can be receipted". That conflicts with C7 (`roadmap.md:4395`; `owner-constraints.md:441-442`).
- **`delivery_basis` is a dating basis, not a receipt mode.** It records settlement, postmark, mailing attestation or received, and is frozen with `gift_date` and `tax_year` at intake (P7:129, :246, :306). It decides which statement year a gift belongs to. Import dates may not substitute for it (SO:296-299).
- **US: two separate document purposes, no mode choice.** Per-gift acknowledgments are automatic (`phase-18-receipt-pdf-template-system.md:91`, `:120`). The annual itemized acknowledgment covers an "exact frozen annual item set" (P18M:132). No rule excludes imported gifts, or gifts the previous system already receipted, from that set.
- **Canada: Asym cannot issue the cumulative receipt for pre-boundary gifts.** Asym's plans are prospective and fixed per exact issuer. Activation forbids "Partial/backdated activation … or historical sweep" (P18M:348), import cannot activate the pack (P19:934), and cumulative coverage takes only gifts frozen as `annual_cumulative_cash` (P19:944, :1290). The texts do not say whether an imported or tail occurrence posted after activation gets a plan fact.
- **Late Fact Obligations have no exemption for imports.** Every fact posted after a run's Start creates one (P19:977-990; SO:326-336). Imports appear only as a replay case (SOΔ:140-146; #1022). Neither historical imports nor tail backfills are exempt.
- **Support overview is silent on imported gifts.** It is the only non-tax full-year vehicle, it defaults Off, and it takes direct support from Phases 7/13 (P18M:39-45; SO:612-635).
- **Donor history includes imported records.** Phase 25 shows "online/offline/imported" records under "honest coverage" (P25F:25, :33) and forbids importing foreign documents (P25F:69, :195). No label wording is defined for pre-Asym gifts, or for gifts the previous system receipted.
- **Nothing is implemented.** The only code is the prototype `.txt` statement route over `donations` by UTC year (`packages/api/src/donor-portal/service.ts:279-301`).
- **No GitHub issue covers switch-year statements or receipting migrated gifts.**

## 1. Phase 7: receipts, dating, Canadian plans, imports

- **The controlling Phase 19 amendment (P7:46-75; ratified)** splits the work:
  - Phase 7 owns the Statement Subject, eligibility, immutable inclusion and exclusion facts, and "any prospective exact-issuer receipt plan".
  - Phase 19 owns participation, preflight, runs, cutoffs and late facts.
  - Under an active Canadian pack, Phase 7 freezes one prospective plan per eligible cash occurrence. `individual_cash` allows a per-gift receipt. `annual_cumulative_cash` "forbids a per-gift official receipt and reserves that occurrence for Phase 7-owned nonoverlapping year-end coverage". "Plan changes affect future eligible occurrences only" (P7:59-66).
- **Eligibility (P7:109; ratified).** A receipt issues only after the tender reaches "the source-owned successful/received state".
- **Dating and `delivery_basis` (P7:129, A14 P7:246, P7:306; ratified).**
  - The exact issuer's versioned jurisdiction contract resolves and freezes `gift_date`, `delivery_basis` and `tax_year` into immutable `contribution_dating_facts`. The first revision is written "in the same transaction as the contribution".
  - US bases are settlement for card/ACH, postmark or a distinct `mailing_attestation` for mailed checks, and received otherwise.
  - Missing policy fails closed. The tax year is a calendar year only, with no fiscal-year engine (P7:385).
  - **Inference:** the switch year is the calendar year in the issuer's tax timezone. The Switch Boundary is shown in the Tenant giving timezone (`CONTEXT.md` "Switch Boundary"), which may differ.
- **Corrections (A15 P7:248; ratified).** After a primary statement release, dating corrections go through Phase 19's late-fact lane.
- **Statements (A12 P7:242, P7:125; ratified).** Phase 7 supplies the official inclusion facts. "A live portal summary remains explicitly non-official" (A12). Story 23 asks for a labeled "running total for this year" view (P7:177).
- **Canadian plan facts (P7:307; ratified).**
  - One plan row per eligible cash occurrence "under that pack", created "in the same transaction as source intake/posting".
  - The row is absent if the issuer never activated the pack.
  - After a lock or end, "later occurrences … are never queued for retroactive receipts".
- **Gifts receipted or stated by a previous system.** No rule. A grep of P7 for `already_receipted`, `pre-Asym`, `pre-platform`, `previous system`, `migrat` and `backfill` finds only:
  - A19, which forbids a "legacy backfill … synthetic document history" in the document runtime (P7:256).
  - T19, superseded (P7:443).
  - E3 (P7:339).
- **Can Asym issue an official receipt for a gift it did not process?**
  - E3 says "manual/imported/historical gifts without a staged-gift record can be receipted" (P7:339; ratified).
  - Published #577's acceptance criteria repeat this: "Canonical source authorization works for manual/imported/historical contributions".
  - C7 forbids it for pre-platform gifts. Phase 13 also states "Asym never re-issues or retracts a receipt a legacy system sent; prior receipts carried immutable; YTD preserved" (P13:2231, a counsel-review item; ratified).
- **Is the `already_receipted` fact defined in Phase 7? Confirmed: no.** It is named only in Phase 13:
  - P13:151, :163, :530, :538 (story 170), :726 ("so imports cannot duplicate a prior receipt or statement"), :746, :1031-1034 and :2196.
  - The fact has two values: "a pre-Asym receipt exists or … no Asym receipt is permitted" (P13:1031-1032).
  - There is no value for a post-boundary gift receipted by the previous system (O15).

## 2. Phase 19: statement operations

- **Which gifts a run includes.**
  - A run is "one immutable released population for one exact tenant/environment, issuer, purpose, period, policy set, and cutoff" (P19:178). The Document Period is "source- and jurisdiction-owned" (P19:187).
  - Gift lines come only from Phase 7 eligibility. Staff "cannot edit gift lines, dates, amounts" (P19:1012), and "force-include" and "gift-line override" are out of scope (P19:112; ratified).
  - US: `us.contribution_acknowledgment.annual@1` is an "itemized acknowledgment; each gift preserves its own date, amount/property" (P18M:132; ratified, launch Dark).
- **Can imported gifts appear as listed lines on a US annual statement?** No text decides this.
  - Phase 13 D.6 makes imports "already-succeeded" and "eligible immediately" (P13:1029-1030).
  - **Inference:** unless the undefined Phase 7 import fact excludes them, imported switch-year gifts satisfy P7:109 and would be listed. That would put pre-platform gifts on a new tax document, against C7 and P13:726.
  - The only import-specific statement rule is that "imported" dates cannot set the period (SO:296-299; published; #1021 AC).
- **Canadian cumulative pack (P19:927-946; SO:397-434).**
  - The pack is absent unless the exact issuer activated it. "Donor country, Site, address, CAD currency, French locale, import, or caller input cannot activate it" (P19:934; SO:403-404; US19-11 P19:1285; ratified and published).
  - Coverage "includes only compatible, source-eligible posted cash with no existing current official coverage". Existing individual receipts are never rolled in (P19:944).
  - "Only gifts frozen as `annual_cumulative_cash` … enter cumulative coverage" (US19-12, P19:1290).
  - Phase 7 excludes "already individually receipted … or otherwise covered facts" (SO:431-434).
  - Preflight labels are listed at P19:946. "Already receipted individually" refers to Asym coverage; nothing covers receipts issued outside Asym.
  - Activation creates a "New prospective active epoch"; "Partial/backdated activation … or historical sweep" is forbidden (P18M:348; ratified).
  - Serial continuity: if continuity "cannot be proved without importing external history, activation routes to a qualified specialist; Phase 18 does not build an external-history migration subsystem" (P18M:204; #944 published).
- **Late Fact Obligations (P19:195, :977-992; US19-14 P19:1303-1310; SO:326-336).**
  - Any fact posted after Start leaves the primary run immutable and creates one deduplicated obligation. It resolves to no document action, supplemental coverage, correction or replacement, or another reviewed run.
  - The obligation's slot is tenant/environment + primary run + Statement Subject + source-fact identity + purpose.
  - SOΔ:140-146 names "an import retry or concurrent source delivery" only as a replay that returns the same obligation (published). #1022 AC says the same ("Duplicate import … returns the same obligation"; published).
  - **No exemption** exists for historical imports or tail backfills. Whether the obligation resolves to "no document action" depends on Phase 7 owner rules, which do not exist for imports.
- **Support overview (P19:914-925; D15 SO:608-635; P18M:39-45, :138).**
  - Optional and default Off. Persistently labeled "Support overview — Not a tax document".
  - The launch allow-list is household support and disclosed DAF recommendations. Direct support "remains sourced from Phases 7/13".
  - It is independent of every official population.
  - Silent on imported, pre-boundary or tail gifts (ratified and published).
- **Cutover, first-year or partial-year language: none** in P19, SO, SOΔ, the add-statement-operations proposal, or the roadmap Phase 19 chapter (`roadmap.md:1147-1242`).

## 3. Donor-facing giving history

- **Phase 25 (ratified planning contract):**
  - "Qualified online/offline/imported and cross-Site records remain accessible under current rights and honest coverage … imported does not always mean offline or One-time" (P25F:25).
  - "Known incomplete external coverage" is a distinct state (P25F:33). "Import gaps do not mean never gave" (`phase-25…/acceptance.md:52`). Imported records "retain provenance" (`acceptance.md:1229`).
  - "Qualified imports do not mint retroactive receipts" (`phase-25…/decision-log.md:58`).
  - "No … foreign legacy PDF conversion/backfill/import" and "Financial history grants no foreign document import/conversion/alias" (P25F:69, :195). The donor's Receipts & statements area therefore can never hold the previous system's statements.
- **"This year so far" (P25F:125-131).** It sums "current effective source-posted monetary giving" by Phase 7 gift date, "not browser/UTC/import/posting/payout time".
  - **Inference:** imported switch-year gifts count. Asym's annual statement may then exclude them, so the two numbers would differ, and no reconciling label exists.
- **No owner text defines a donor-facing label** for "imported", "from your previous giving system" or "receipted by [previous system]". Phase 25 says only that provenance is retained.
- **The supplied roadmap** recorded this as an open question: "giving-history depth for imported legacy data (with 30)" (`program-roadmap/source-2026-09-22/supplied-roadmap.md:776`; dated source, proposed).
- **Phase 28** is missionary-facing. It says re-enabling admission "SHALL not replay … historical gifts" (`openspec/contracts/missionary-workspace-depth.md:4410-4411`; published). It says nothing on the donor's view.
- **Phase 13 and Phase 19:** no donor-history labelling rule.

## 4. Phase 14: soft credits and tributes

- Imported credits carry `source_kind = 'import'`. "Imports fire NOTHING", and historic-giving imports "never mint acknowledgments or notifications" (P14:1863-1869; ratified).
- Credits are never on official statements. Recognition appears only in the Support overview (P14:271, :1179, :2020).
- A retroactive credit backfill "REFUSES statement-referenced headers" (P14:260, :428, :1224).
- **Silent** on whether imported credits or recognition for pre-boundary gifts may appear in a switch-year Support overview.

## 5. GitHub issues (read-only, 2026-11-02)

- Searches for "imported statement", "imported receipt", "already receipted", "historical gift receipt", "cutover year", "pre-Asym receipt", "previous system receipt", "annual statement import" and "SiteStacker statement" found **no issue on switch-year statements or receipting migrated gifts**. Results were unrelated (#1086, #2128) or general (#1563).
- **#577** (Phase 7, OPEN) requires imported and historical contributions to reach Phase 7 authorization and the Phase 18 request. This conflicts with C7.
- **#1022** (P19-45, OPEN) treats an import only as a duplicate-delivery case.
- **#1019 / #1021** (P19, OPEN):
  - #1019: imports cannot activate Canadian behavior.
  - #1021: an imported date cannot substitute for `gift_date` or `delivery_basis`.
- **#944** (P18, OPEN): "Phase 18 does not build a legacy receipt importer". Unproven external numbering goes to a specialist.
- **#579 / #580 / #583** (Phase 7, OPEN) route post-freeze facts into the Phase 19 late-fact lane. They do not mention imports.
- **#711** (Phase 13, OPEN): "no observation or import performs a charge, receipt…". It routes broader historical import to "Phase 36".
- **Epic #977**: no import, legacy or migration scope beyond retiring the live-text route.

## 6. Implementation evidence (develop `629cb71dc`)

- **Owner tables: absent.** `contribution_dating_facts`, `contribution_receipt_plan_facts`, `statement_runs`, `already_receipted`, `delivery_basis` and late-fact code have zero matches in `supabase/migrations` and in `packages`/`apps` `*.ts` files.
- **Prototype statement route: integrated, and a removal target.**
  - `apps/donor/app/api/donor/statements/[year]/route.ts` leads to `packages/api/src/donor-portal/statements.ts:30-60`.
  - That queries `donations` by UTC `gift_date` year and settled status (`service.ts:279-301`) and sums into a `.txt` file. It has no import provenance.
  - P19:156-158 calls it REAL legacy; P19:172 says it is removed before production.
- **Purpose catalog: integrated, Dark.** It registers `us.contribution_acknowledgment.annual@1`, `ca.official_receipt.cumulative_cash@1` and `giving.summary.informational@1` behind gates that include `phase19_statement_seam` (`packages/api/src/generated-documents/purpose-catalog/catalog.ts:174-251`, `:395-468`, `:623-700`). The informational purpose's gates now also list the Phase 7, 13 and 14 proofs. P19:159 still describes the older gating.
- **Prototype receipts.** `packages/api/src/giving/receipt-record.ts`, `gift_receipt_records` and `contribution_receipt_snapshots` are Phase 18 D17 deletion targets, "not continuity inputs" (#944 body). Neither these nor `giving/receipts.ts` carry any import or previous-system receipt state.

## 7. Gaps and contradictions

1. **(a) US ministry switching mid-year: who issues what is undecided.**
   - **Pre-boundary gifts.** Q1 keeps the old system licensed and "receipts for legacy charges" on (`decision-log.md:33`). It does not say the old system must issue the switch-year annual statement for pre-boundary gifts. P25F:69/:195 stop Asym from hosting that statement.
   - **Tail gifts.** The old system "alone receipts what it charges" (`decision-log.md:33`). Its year-end statement for those gifts is unaddressed.
   - **Asym gifts.** Asym's `annual@1` covers Asym gifts. Whether it also lists imported pre-boundary or tail gifts is undefined (Section 2). Listing them breaches C7 and P13:726. Excluding them means a donor gets two or three documents for one year, with no "no double inclusion" rule (O18).
   - **Definition gap.** C7 says "receipts". Whether an annual itemized acknowledgment counts as a "receipt" under C7 is undefined.
2. **(b) Canadian ministry on `annual_cumulative_cash` switching mid-year.**
   - Asym cannot issue the official receipt for pre-boundary gifts the old system had not yet receipted. Activation is prospective with no historical sweep (P18M:348), import cannot activate (P19:934), coverage requires frozen `annual_cumulative_cash` facts (P19:1290), and C7 applies.
   - Only the previous system could issue it. Whether SiteStacker or other sources can issue a partial-year cumulative receipt after the switch is unverified.
   - **Opposite risk.** If the pack is active when imports or tail backfills post, P7:307 creates a plan fact "in the same transaction as source intake/posting" for every eligible cash occurrence. No text excludes import-origin occurrences, so Asym could include them in cumulative coverage. That would double-receipt tail gifts and breach C7 for pre-boundary gifts.
   - **Serial continuity.** The previous system's numbering may force a specialist route (P18M:204; #944).
3. **(c) Late Fact Obligations from tail backfills.**
   - With a tail of up to 12 months, every backfill posted after a switch-year run's Start that carries switch-year gift dates creates obligations under P19:977-990. Examples are December charges, or refunds and chargebacks of earlier gifts.
   - The initial switch import does the same if it posts after a Start, for example a switch early in the year while the prior-year run is open.
   - No rule says these resolve to "no document action". That depends on the missing Phase 7 import fact.
4. **Contradiction: P7 E3 (P7:339) and #577 against C7 (`roadmap.md:4395`; `owner-constraints.md:441-442`) and P13:1031-1034.** (Known: D4 and r03 D-1.)
5. **The import fact lacks a tail case (O15).** P13:1031-1032 has only "pre-Asym receipt exists" and "no Asym receipt permitted". There is no case for "receipted by the previous system after the boundary", and none for "no receipt was ever sent" (q01-r4 E20).
6. **"YTD preserved" (P13:2231) is undefined.** It may mean imported gifts count toward switch-year totals, which conflicts with excluding them from statements.
7. **Phase 25 "This year so far" against official statements.** Imported gifts count in the portal total (inference) but may be absent from the Asym statement, and no label explains the difference.
8. **Support overview is silent on imported gifts**, yet it is the only non-tax full-year vehicle (P19:914-925).
9. **No owner defines a donor-facing label** for imported or previous-system-receipted gifts (Section 3).
10. **Timezone.** The Switch Boundary uses the Tenant giving timezone (`CONTEXT.md`). Tax year uses the issuer's tax timezone (P7:246). The texts do not reconcile them for a boundary near January 1.

## Open owner questions

1. Phase 7: define the import fact's values, including "receipted by previous system (pre-boundary)", "receipted by previous system (tail)" and "never receipted". Does it exclude a gift from Asym official coverage and from annual statement lines?
2. Phase 7/19 (US): for the switch year, should Asym's annual acknowledgment list only Asym-processed gifts, or all gifts with source attribution? Must the previous system issue the pre-boundary and tail portion?
3. Phase 7/18 (Canada): may imported or tail occurrences ever receive a plan fact? If not, which system issues the switch-year cumulative receipt for pre-boundary and tail gifts? What is required when the previous system cannot issue a partial-year receipt?
4. Phase 19: does a post-Start historical import or tail backfill always resolve to "no document action"? Should backfills be scheduled before the switch-year Readiness Target?
5. Phase 19/14: may the Support overview show imported switch-year direct gifts, labeled, to give a full-year non-tax picture?
6. Phase 25: what label do imported and previous-system-receipted gifts carry? Does "This year so far" include them?
7. Phase 30: must the go/no-go checklist require proof that the previous system will issue switch-year documents before tail closure ends the licence, or should the boundary be advised at January 1?
8. Phase 13: what does "YTD preserved" (P13:2231) mean?
